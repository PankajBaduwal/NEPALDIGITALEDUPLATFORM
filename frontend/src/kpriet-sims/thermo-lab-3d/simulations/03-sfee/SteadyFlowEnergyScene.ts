/**
 * 3D Simulation Scene: Steady Flow Energy Equation (SFEE) Open Systems (Unit I)
 * Interactive Devices:
 * 1. Steam / Gas Turbine
 * 2. Centrifugal Compressor
 * 3. Converging-Diverging Nozzle / Diffuser
 * 4. Heat Exchanger / Boiler Tube Bundle
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';
import type { SteadyFlowDeviceType } from '../../core/types';

export class SteadyFlowEnergyScene extends BaseThermoSimulation {
  private activeDevice: SteadyFlowDeviceType = 'turbine';
  private turbineGroup!: THREE.Group;
  private compressorGroup!: THREE.Group;
  private nozzleGroup!: THREE.Group;
  private heatExchangerGroup!: THREE.Group;

  private turbineRotor!: THREE.Group;
  private compressorImpeller!: THREE.Group;
  private streamlineParticles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleCount = 250;

  public buildScene(): void {
    // 1. Build Turbine Model
    this.buildTurbine();

    // 2. Build Compressor Model
    this.buildCompressor();

    // 3. Build Nozzle Model
    this.buildNozzle();

    // 4. Build Heat Exchanger Model
    this.buildHeatExchanger();

    // 5. Build Flow Streamline Particles
    this.buildFlowParticles();

    this.setDeviceVisibility('turbine');
    this.resetCamera(14, 10, 16);
  }

  private buildTurbine(): void {
    this.turbineGroup = new THREE.Group();
    this.turbineGroup.name = 'TurbineGroup';

    // Casing Half Cutaway
    const casingGeo = new THREE.ConeGeometry(3.5, 7, 32, 1, true, 0, Math.PI * 1.5);
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.rotation.z = Math.PI / 2;
    casing.position.set(0, 4, 0);
    this.turbineGroup.add(casing);

    // Central Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 24);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0, 4, 0);
    this.turbineGroup.add(shaft);

    // Multi-stage Rotor Blades
    this.turbineRotor = new THREE.Group();
    this.turbineRotor.position.set(0, 4, 0);

    const stages = 5;
    for (let s = 0; s < stages; s++) {
      const radius = 1.0 + s * 0.45;
      const xPos = -2.5 + s * 1.25;
      const bladeCount = 14 + s * 2;

      for (let b = 0; b < bladeCount; b++) {
        const bladeGeo = new THREE.BoxGeometry(0.12, radius, 0.4);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.8,
          roughness: 0.2,
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.x = xPos;
        const angle = (b / bladeCount) * Math.PI * 2;
        blade.position.y = (radius / 2) * Math.cos(angle);
        blade.position.z = (radius / 2) * Math.sin(angle);
        blade.rotation.x = angle + 0.3; // aerofoil twist
        this.turbineRotor.add(blade);
      }
    }
    this.turbineGroup.add(this.turbineRotor);

    // Inlet Pipe (High Enthalpy)
    const inletGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 16);
    const inletMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
    const inlet = new THREE.Mesh(inletGeo, inletMat);
    inlet.position.set(-2.8, 6.5, 0);
    this.turbineGroup.add(inlet);

    // Exhaust Pipe (Low Enthalpy)
    const exhaustGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.5, 16);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(2.8, 6.5, 0);
    this.turbineGroup.add(exhaust);

    this.scene.add(this.turbineGroup);
  }

  private buildCompressor(): void {
    this.compressorGroup = new THREE.Group();
    this.compressorGroup.name = 'CompressorGroup';

    // Volute Casing
    const voluteGeo = new THREE.TorusGeometry(3.5, 1.2, 16, 32);
    const voluteMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const volute = new THREE.Mesh(voluteGeo, voluteMat);
    volute.position.set(0, 4, 0);
    this.compressorGroup.add(volute);

    // Impeller
    this.compressorImpeller = new THREE.Group();
    this.compressorImpeller.position.set(0, 4, 0);

    const hubGeo = new THREE.ConeGeometry(2.5, 2, 24);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    this.compressorImpeller.add(hub);

    for (let i = 0; i < 12; i++) {
      const vGeo = new THREE.BoxGeometry(0.1, 1.8, 1.2);
      const vMesh = new THREE.Mesh(vGeo, hubMat);
      const theta = (i / 12) * Math.PI * 2;
      vMesh.position.set(1.2 * Math.cos(theta), 1.2 * Math.sin(theta), 0.2);
      vMesh.rotation.z = theta + 0.4;
      this.compressorImpeller.add(vMesh);
    }
    this.compressorGroup.add(this.compressorImpeller);

    this.scene.add(this.compressorGroup);
  }

  private buildNozzle(): void {
    this.nozzleGroup = new THREE.Group();
    this.nozzleGroup.name = 'NozzleGroup';

    // Converging-Diverging Nozzle Geometry
    const points: THREE.Vector2[] = [
      new THREE.Vector2(2.0, -4), // Inlet
      new THREE.Vector2(1.8, -2.5),
      new THREE.Vector2(0.9, 0), // Throat
      new THREE.Vector2(1.6, 2.5),
      new THREE.Vector2(2.4, 4), // Exit
    ];
    const nozzleGeo = new THREE.LatheGeometry(points, 32);
    const nozzleMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.set(0, 4, 0);
    this.nozzleGroup.add(nozzle);

    this.scene.add(this.nozzleGroup);
  }

  private buildHeatExchanger(): void {
    this.heatExchangerGroup = new THREE.Group();
    this.heatExchangerGroup.name = 'HeatExchangerGroup';

    // Outer Shell
    const shellGeo = new THREE.CylinderGeometry(2.8, 2.8, 8, 32, 1, true);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.z = Math.PI / 2;
    shell.position.set(0, 4, 0);
    this.heatExchangerGroup.add(shell);

    // Internal Tube Bundle
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    for (let r = -1.5; r <= 1.5; r += 0.75) {
      for (let c = -1.5; c <= 1.5; c += 0.75) {
        if (r * r + c * c < 3.5) {
          const tGeo = new THREE.CylinderGeometry(0.12, 0.12, 8.4, 12);
          const tube = new THREE.Mesh(tGeo, tubeMat);
          tube.rotation.z = Math.PI / 2;
          tube.position.set(0, 4 + r, c);
          this.heatExchangerGroup.add(tube);
        }
      }
    }

    this.scene.add(this.heatExchangerGroup);
  }

  private buildFlowParticles(): void {
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      this.particlePositions[idx] = -4 + Math.random() * 8;
      this.particlePositions[idx + 1] = 4 + (Math.random() - 0.5) * 1.5;
      this.particlePositions[idx + 2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.streamlineParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.streamlineParticles);
  }

  private setDeviceVisibility(device: SteadyFlowDeviceType): void {
    this.activeDevice = device;
    this.turbineGroup.visible = device === 'turbine';
    this.compressorGroup.visible = device === 'compressor';
    this.nozzleGroup.visible = device === 'nozzle' || device === 'diffuser';
    this.heatExchangerGroup.visible = device === 'boiler' || device === 'condenser' || (device as string) === 'heat-exchanger';
  }

  public updateAnimation(delta: number, _elapsedTime: number): void {
    // 1. Rotate Turbine or Compressor
    if (this.activeDevice === 'turbine') {
      this.turbineRotor.rotation.x += delta * 8;
    } else if (this.activeDevice === 'compressor') {
      this.compressorImpeller.rotation.z += delta * 12;
    }

    // 2. Animate streamline particles flowing through system
    const pos = this.particlePositions;
    if (pos) {
      for (let i = 0; i < this.particleCount; i++) {
        const idx = i * 3;
        pos[idx] = (pos[idx] ?? 0) + delta * 5; // flow left to right

        // Loop back to inlet
        if ((pos[idx] ?? 0) > 4.5) {
          pos[idx] = -4.5;
          pos[idx + 1] = 4 + (Math.random() - 0.5) * 1.5;
          pos[idx + 2] = (Math.random() - 0.5) * 1.5;
        }
      }
      if (this.streamlineParticles?.geometry?.attributes?.position) {
        this.streamlineParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  public updateParameters(params: { deviceType?: SteadyFlowDeviceType }): void {
    if (params.deviceType) {
      this.setDeviceVisibility(params.deviceType);
    }
  }
}
