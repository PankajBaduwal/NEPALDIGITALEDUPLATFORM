/**
 * Engineering Survey (U25CE303) — Differential Levelling 3D Field Practical
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 *
 * Implements:
 * - Automatic / Dumpy level with adjustable wooden tripod and circular bubble.
 * - 4-meter metric telescopic levelling staff with E-face markings.
 * - Benchmark (RL = 100.000 m), intermediate stations, and change points.
 * - Telescopic reticle view with crosshairs and stadia hairs.
 */

import * as THREE from 'three';
import { BaseSurveySimulation } from '../../core/BaseSurveySimulation';
import type { LevellingObservation } from '../../core/types';

export interface LevellingStationDef {
  id: string;
  name: string;
  sightType: 'BS' | 'IS' | 'FS';
  worldX: number;
  worldZ: number;
  groundElevation: number; // modeled true RL
  description: string;
}

export class LevellingScene extends BaseSurveySimulation {
  private levelInstrumentGroup: THREE.Group;
  private staffGroup: THREE.Group;
  private tripodGroup: THREE.Group;
  private reticleOverlayGroup: THREE.Group;

  // Station definitions for the field run
  public readonly stations: LevellingStationDef[] = [
    {
      id: 'bm',
      name: 'BM (Benchmark)',
      sightType: 'BS',
      worldX: 0,
      worldZ: -12,
      groundElevation: 100.0,
      description: 'Permanent Survey of India GTS Benchmark tablet',
    },
    {
      id: 'st-1',
      name: 'Station 1 (Peg A)',
      sightType: 'IS',
      worldX: 4,
      worldZ: -8,
      groundElevation: 99.42,
      description: 'Intermediate terrain station near proposed culvert center line',
    },
    {
      id: 'st-2',
      name: 'Station 2 (Peg B)',
      sightType: 'IS',
      worldX: 7,
      worldZ: -3,
      groundElevation: 98.85,
      description: 'Intermediate slope station along natural drainage channel',
    },
    {
      id: 'cp-1',
      name: 'Change Point 1 (CP 1)',
      sightType: 'FS',
      worldX: 10,
      worldZ: 4,
      groundElevation: 98.21,
      description: 'Triangular steel turning plate on firm ground',
    },
  ];

  private currentStationIndex = 0;
  private instrumentGroundRL = 99.8; // Instrument ground station
  private instrumentHeightAboveGround = 1.45; // Height of instrument axis
  private telescopeAngleY = 0; // horizontal azimuth
  private isLevelBubbleCentered = true;

  constructor(container: HTMLElement) {
    super(container);

    this.levelInstrumentGroup = new THREE.Group();
    this.staffGroup = new THREE.Group();
    this.tripodGroup = new THREE.Group();
    this.reticleOverlayGroup = new THREE.Group();

    this.buildLevelInstrument();
    this.buildStaff();
    this.buildReticleCamera();
    this.buildFieldMarkers();

    this.occupyStation(0);
  }

  private buildLevelInstrument(): void {
    // 1. Tripod Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.02, 1.45, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 }); // Teak wood

    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(Math.sin(angle) * 0.45, 0.72, Math.cos(angle) * 0.45);
      leg.rotation.z = Math.sin(angle) * 0.28;
      leg.rotation.x = -Math.cos(angle) * 0.28;
      leg.castShadow = true;
      this.tripodGroup.add(leg);
    }

    // Tribrach / Tripod head
    const headGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.06, 16);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const head = new THREE.Mesh(headGeo, metalMat);
    head.position.y = 1.42;
    this.tripodGroup.add(head);

    this.scene.add(this.tripodGroup);

    // 2. Level Body (Automatic Level)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.2, roughness: 0.4 }); // Survey Yellow
    const bodyGeo = new THREE.BoxGeometry(0.14, 0.12, 0.32);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.52;
    body.castShadow = true;
    this.levelInstrumentGroup.add(body);

    // Telescope Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.42, 24);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.position.set(0, 1.54, 0);
    barrel.castShadow = true;
    this.levelInstrumentGroup.add(barrel);

    // Objective lens hood
    const objGeo = new THREE.CylinderGeometry(0.052, 0.048, 0.08, 24);
    objGeo.rotateX(Math.PI / 2);
    const objLens = new THREE.Mesh(objGeo, metalMat);
    objLens.position.set(0, 1.54, -0.21);
    this.levelInstrumentGroup.add(objLens);

    // Circular Spirit Level Bubble
    const bubbleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.015, 16);
    const bubbleMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 }); // Green vial
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    bubble.position.set(0.06, 1.58, 0.05);
    this.levelInstrumentGroup.add(bubble);

    // Focusing knob
    const knobGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16);
    knobGeo.rotateZ(Math.PI / 2);
    const knob = new THREE.Mesh(knobGeo, metalMat);
    knob.position.set(0.08, 1.54, -0.05);
    this.levelInstrumentGroup.add(knob);

    this.scene.add(this.levelInstrumentGroup);
  }

  private buildStaff(): void {
    // 4-meter metric telescopic levelling staff
    const staffHeight = 4.0;
    const staffWidth = 0.12;
    const staffDepth = 0.05;

    const staffGeo = new THREE.BoxGeometry(staffWidth, staffHeight, staffDepth);
    const staffMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }); // White staff face
    const staff = new THREE.Mesh(staffGeo, staffMat);
    staff.position.y = staffHeight / 2;
    staff.castShadow = true;
    this.staffGroup.add(staff);

    // E-pattern alternating decimeter red and black graduations
    for (let dm = 0; dm < 40; dm++) {
      const gradGeo = new THREE.BoxGeometry(staffWidth * 0.85, 0.09, 0.005);
      const isRed = dm % 10 < 5; // alternating decimeter bands
      const gradMat = new THREE.MeshBasicMaterial({
        color: isRed ? 0xdc2626 : 0x0f172a,
      });
      const grad = new THREE.Mesh(gradGeo, gradMat);
      grad.position.set(0, dm * 0.1 + 0.05, staffDepth / 2 + 0.003);
      this.staffGroup.add(grad);
    }

    this.scene.add(this.staffGroup);
  }

  private buildReticleCamera(): void {
    // Telescope sight camera aligned directly along the instrument line of collimation
    this.reticleCamera = new THREE.PerspectiveCamera(8, 1, 0.1, 200); // 8-degree narrow telescope FOV
    this.reticleCamera.position.set(0, 1.54, 0);

    // Reticle crosshair HUD geometry attached in front of reticle camera
    const hudGroup = new THREE.Group();

    // Crosshairs
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    // Horizontal crosshair
    const hPoints = [new THREE.Vector3(-0.08, 0, -0.3), new THREE.Vector3(0.08, 0, -0.3)];
    const hLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(hPoints), lineMat);
    hudGroup.add(hLine);

    // Upper stadia hair
    const s1Points = [new THREE.Vector3(-0.03, 0.015, -0.3), new THREE.Vector3(0.03, 0.015, -0.3)];
    const s1Line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(s1Points), lineMat);
    hudGroup.add(s1Line);

    // Lower stadia hair
    const s2Points = [new THREE.Vector3(-0.03, -0.015, -0.3), new THREE.Vector3(0.03, -0.015, -0.3)];
    const s2Line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(s2Points), lineMat);
    hudGroup.add(s2Line);

    // Vertical crosshair
    const vPoints = [new THREE.Vector3(0, -0.08, -0.3), new THREE.Vector3(0, 0.08, -0.3)];
    const vLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(vPoints), lineMat);
    hudGroup.add(vLine);

    // Circular telescope eyepiece diaphragm ring
    const ringGeo = new THREE.RingGeometry(0.075, 0.16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, -0.3);
    hudGroup.add(ring);

    this.reticleOverlayGroup.add(hudGroup);
    this.reticleCamera.add(this.reticleOverlayGroup);
    this.scene.add(this.reticleCamera);
  }

  private buildFieldMarkers(): void {
    // Concrete Benchmark Pillar
    const bmStation = this.stations[0];
    if (bmStation) {
      const pillarGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(bmStation.worldX, 0.4, bmStation.worldZ);
      pillar.castShadow = true;
      this.scene.add(pillar);

      // Bronze datum plate on pillar top
      const plateGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
      const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      const plate = new THREE.Mesh(plateGeo, bronzeMat);
      plate.position.set(bmStation.worldX, 0.81, bmStation.worldZ);
      this.scene.add(plate);
    }

    // Change Point 1 triangular steel plate
    const cpStation = this.stations[3];
    if (cpStation) {
      const cpGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 3);
      const cpMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.5, roughness: 0.4 });
      const cpPlate = new THREE.Mesh(cpGeo, cpMat);
      cpPlate.position.set(cpStation.worldX, 0.02, cpStation.worldZ);
      this.scene.add(cpPlate);
    }
  }

  public occupyStation(index: number): void {
    if (index < 0 || index >= this.stations.length) return;
    const st = this.stations[index];
    if (!st) return;
    this.currentStationIndex = index;

    // Position staff at target station
    this.staffGroup.position.set(st.worldX, 0, st.worldZ);

    // Point level telescope towards staff
    const dx = st.worldX - this.levelInstrumentGroup.position.x;
    const dz = st.worldZ - this.levelInstrumentGroup.position.z;
    this.telescopeAngleY = Math.atan2(dx, dz) + Math.PI;
    this.levelInstrumentGroup.rotation.y = this.telescopeAngleY;

    // Aim reticle camera
    if (this.reticleCamera) {
      const targetPos = new THREE.Vector3(
        st.worldX,
        this.getCollimationHeight() - (this.getSimulatedStaffReading() - 1.5),
        st.worldZ
      );
      this.reticleCamera.position.set(0, 1.54, 0);
      this.reticleCamera.lookAt(targetPos);
    }
  }

  public setLevelBubbleCentered(centered: boolean): void {
    this.isLevelBubbleCentered = centered;
    if (!centered) {
      this.levelInstrumentGroup.rotation.z = 0.02; // slight tilt error
    } else {
      this.levelInstrumentGroup.rotation.z = 0.0;
    }
  }

  public getCollimationHeight(): number {
    return this.instrumentGroundRL + this.instrumentHeightAboveGround;
  }

  public getSimulatedStaffReading(): number {
    const st = this.stations[this.currentStationIndex];
    const groundElevation = st ? st.groundElevation : 100.0;
    // True staff intercept = Line of Collimation RL - Ground RL
    const trueReading = this.getCollimationHeight() - groundElevation;
    // If bubble is not centered, introduce leveling tilt error
    const tiltError = this.isLevelBubbleCentered ? 0 : 0.045;
    return Number(Math.max(0.1, trueReading + tiltError).toFixed(3));
  }

  public getObservation(): LevellingObservation {
    const st = this.stations[this.currentStationIndex];
    const reading = this.getSimulatedStaffReading();
    const worldX = st ? st.worldX : 0;
    const worldZ = st ? st.worldZ : 0;
    const dist = Math.hypot(worldX, worldZ);

    return {
      id: `obs-${st?.id || 'bm'}`,
      stationName: st?.name || 'BM',
      sightType: st?.sightType || 'BS',
      staffReading: reading,
      groundElevation: st?.groundElevation || 100.0,
      instrumentElevation: this.instrumentGroundRL,
      staffDistance: Number(dist.toFixed(2)),
      remark: st?.description || '',
    };
  }

  public getCurrentStationIndex(): number {
    return this.currentStationIndex;
  }

  protected updateSimulation(): void {
    // Micro-vibrations or optical atmospheric shimmer if desired
  }
}
