/**
 * 3D DC Motor & Speed Control Scene Controller
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';

export class DCMotorScene extends BaseDrivesSimulation {
  private rotorGroup: THREE.Group = new THREE.Group();
  private fieldFluxLines: THREE.LineSegments[] = [];
  private speedRPM: number = 1500;
  private currentRPM: number = 0;
  private direction: number = 1;
  private isRunning: boolean = true;
  private terminalVoltageV: number = 220;
  private loadTorqueNm: number = 15;
  private fluxRatio: number = 1.0;

  public initScene(): void {
    const motorAssembly = new THREE.Group();

    // 1. Heavy Cast-Iron Stator Yoke / Housing
    const yokeGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.6, 32, 1, true);
    const yokeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Industrial slate blue/grey
      metalness: 0.8,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    const yokeMesh = new THREE.Mesh(yokeGeo, yokeMat);
    yokeMesh.rotation.z = Math.PI / 2;
    yokeMesh.position.y = 1.6;
    motorAssembly.add(yokeMesh);

    // Stator Base Mounting Feet
    const baseGeo = new THREE.BoxGeometry(2.8, 0.25, 2.8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.4 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0.125, 0);
    motorAssembly.add(baseMesh);

    // 2. Four Salient Field Pole Shoes & Windings
    const poleAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Polished copper winding color
      metalness: 0.85,
      roughness: 0.25,
    });
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Laminated silicon steel
      metalness: 0.7,
      roughness: 0.4,
    });

    poleAngles.forEach((angle, idx) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.set(0, 1.6, 0);
      poleGroup.rotation.x = angle;

      // Pole Core
      const poleGeo = new THREE.BoxGeometry(1.4, 0.45, 0.5);
      const poleCore = new THREE.Mesh(poleGeo, poleMat);
      poleCore.position.y = 1.3;
      poleGroup.add(poleCore);

      // Copper Field Coil wrapped around pole core
      const coilGeo = new THREE.TorusGeometry(0.35, 0.12, 16, 32);
      const coil = new THREE.Mesh(coilGeo, copperMat);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = 1.3;
      poleGroup.add(coil);

      // Magnetic Pole Shoe (curved face near armature)
      const shoeGeo = new THREE.CylinderGeometry(1.15, 1.15, 1.5, 16, 1, false, -Math.PI / 6, Math.PI / 3);
      const shoeMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0xef4444 : 0x3b82f6, // Red for North pole, Blue for South pole
        metalness: 0.75,
        roughness: 0.3,
      });
      const shoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
      shoeMesh.rotation.z = Math.PI / 2;
      shoeMesh.position.y = 1.05;
      poleGroup.add(shoeMesh);

      motorAssembly.add(poleGroup);
    });

    // 3. Rotating Armature Core & Commutator Group
    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 1.6, 0);

    // Armature Shaft (High tensile steel)
    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.2, 32);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    this.rotorGroup.add(shaft);

    // Laminated Armature Slotted Cylinder
    const coreGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.4, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.z = Math.PI / 2;
    this.rotorGroup.add(coreMesh);

    // Copper Armature Windings in Slots
    for (let i = 0; i < 16; i++) {
      const slotAngle = (i * 2 * Math.PI) / 16;
      const slotBarGeo = new THREE.BoxGeometry(1.42, 0.08, 0.08);
      const slotBar = new THREE.Mesh(slotBarGeo, copperMat);
      slotBar.position.set(
        0,
        0.92 * Math.cos(slotAngle),
        0.92 * Math.sin(slotAngle)
      );
      this.rotorGroup.add(slotBar);
    }

    // Cylindrical Commutator with segmented copper bars
    const commGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.6, 24);
    const commMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Amber copper
      metalness: 0.9,
      roughness: 0.2,
    });
    const commMesh = new THREE.Mesh(commGeo, commMat);
    commMesh.rotation.z = Math.PI / 2;
    commMesh.position.x = 1.05;
    this.rotorGroup.add(commMesh);

    // Cooling Fan on shaft
    const fanGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.2, 12);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.6 });
    const fanMesh = new THREE.Mesh(fanGeo, fanMat);
    fanMesh.rotation.z = Math.PI / 2;
    fanMesh.position.x = -1.05;
    this.rotorGroup.add(fanMesh);

    // Output drive pulley
    const pulleyGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32);
    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.3 });
    const pulley = new THREE.Mesh(pulleyGeo, pulleyMat);
    pulley.rotation.z = Math.PI / 2;
    pulley.position.x = 1.85;
    this.rotorGroup.add(pulley);

    motorAssembly.add(this.rotorGroup);

    // 4. Fixed Carbon Brushes & Holders
    const brushMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 }); // Carbon black
    const holderMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 }); // Brass holder

    // Top and Bottom Brushes contacting commutator at x = 1.05
    [0.55, -0.55].forEach((yPos) => {
      const brush = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), brushMat);
      brush.position.set(1.05, 1.6 + (yPos > 0 ? 0.48 : -0.48), 0);
      motorAssembly.add(brush);

      const holder = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.25, 0.24), holderMat);
      holder.position.set(1.05, 1.6 + yPos, 0);
      motorAssembly.add(holder);
    });

    // 5. Magnetic Field Flux Flow Indicators (Cyan curves)
    const fluxGeo = new THREE.BufferGeometry();
    const fluxPoints: number[] = [];
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI;
      fluxPoints.push(0, 1.6 + 1.1 * Math.sin(t), 1.1 * Math.cos(t));
    }
    fluxGeo.setAttribute('position', new THREE.Float32BufferAttribute(fluxPoints, 3));
    const fluxLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    const fluxLine = new THREE.Line(fluxGeo, fluxLineMat);
    motorAssembly.add(fluxLine);

    this.scene.add(motorAssembly);
    this.resetCamera({ x: 3.5, y: 3.0, z: 4.8 }, { x: 0, y: 1.6, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    if (!this.isRunning) {
      this.currentRPM = Math.max(0, this.currentRPM - 500 * delta);
    } else {
      // Smoothly track target speedRPM
      const diff = this.speedRPM - this.currentRPM;
      this.currentRPM += diff * Math.min(1.0, delta * 3.0);
    }

    // Convert RPM to angular velocity: rad/s = RPM * 2*pi / 60
    const angularSpeed = (this.currentRPM * 2 * Math.PI) / 60;
    this.rotorGroup.rotation.x += this.direction * angularSpeed * delta;
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.speedRPM !== undefined) {
      this.speedRPM = Number(params.speedRPM);
    }
    if (params.isRunning !== undefined) {
      this.isRunning = Boolean(params.isRunning);
    }
    if (params.direction !== undefined) {
      this.direction = Number(params.direction);
    }
    if (params.terminalVoltageV !== undefined) {
      this.terminalVoltageV = Number(params.terminalVoltageV);
    }
    if (params.loadTorqueNm !== undefined) {
      this.loadTorqueNm = Number(params.loadTorqueNm);
    }
    if (params.fluxRatio !== undefined) {
      this.fluxRatio = Number(params.fluxRatio);
    }
  }
}
