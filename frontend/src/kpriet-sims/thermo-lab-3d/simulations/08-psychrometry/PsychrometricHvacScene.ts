/**
 * 3D Simulation Scene: Psychrometry, HVAC Air Handling & Data Center Cooling (Unit IV / V)
 * Features:
 * - 3D Air Handling Unit (AHU) Duct with transparent inspection panels
 * - Air Filter Bank, Chilled Water Cooling Coil & Condensate Drain Pan
 * - Reheating Heating Coil & Ultrasonic Humidifier Spray Nozzle Mist
 * - Supply Air Centrifugal Fan Blower with spinning wheel
 * - Server Rack Cold Aisle / EV Battery Cooling Loop
 * - Color-coded Psychrometric Air Flow Particles (Blue = Cool/Moist, Red = Warm/Dry)
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';
import type { PsychrometricProcessType } from '../../core/types';

export class PsychrometricHvacScene extends BaseThermoSimulation {
  private ahuDuctMesh!: THREE.Mesh;
  private coolingCoilMesh!: THREE.Mesh;
  private heatingCoilMesh!: THREE.Mesh;
  private humidifierNozzlesMesh!: THREE.Mesh;
  private fanImpellerMesh!: THREE.Mesh;
  private serverRackMesh!: THREE.Mesh;
  private mistParticles!: THREE.Points;
  private airStreamParticles!: THREE.Points;
  private airParticlePositions!: Float32Array;
  private airParticleColors!: Float32Array;
  private airParticleCount = 300;

  private currentProcess: PsychrometricProcessType = 'cooling-dehumidification';
  private dryBulbC = 30;
  private relativeHumidityPct = 60;

  public buildScene(): void {
    const group = new THREE.Group();
    group.name = 'PsychrometricHvacGroup';

    // 1. Transparent AHU Duct Housing
    const ductGeo = new THREE.BoxGeometry(16, 4.5, 4.5);
    const ductMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.4,
      side: THREE.DoubleSide,
    });
    this.ahuDuctMesh = new THREE.Mesh(ductGeo, ductMat);
    this.ahuDuctMesh.position.set(0, 4, 0);
    group.add(this.ahuDuctMesh);

    // Duct Flanges
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    for (let x = -7.5; x <= 7.5; x += 3.75) {
      const flangeGeo = new THREE.BoxGeometry(0.3, 4.8, 4.8);
      const flange = new THREE.Mesh(flangeGeo, flangeMat);
      flange.position.set(x, 4, 0);
      group.add(flange);
    }

    // 2. Air Filter Bank (Inlet section)
    const filterGeo = new THREE.BoxGeometry(0.4, 4.0, 4.0);
    const filterMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, metalness: 0.1 });
    const filter = new THREE.Mesh(filterGeo, filterMat);
    filter.position.set(-6, 4, 0);
    group.add(filter);

    // 3. Chilled Water Cooling Coil (Finned tube heat exchanger)
    const coilGeo = new THREE.BoxGeometry(0.8, 4.0, 4.0);
    const coilMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
    this.coolingCoilMesh = new THREE.Mesh(coilGeo, coilMat);
    this.coolingCoilMesh.position.set(-3, 4, 0);
    group.add(this.coolingCoilMesh);

    // Condensate Drain Pan
    const panGeo = new THREE.BoxGeometry(2.5, 0.4, 4.2);
    const panMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
    const pan = new THREE.Mesh(panGeo, panMat);
    pan.position.set(-3, 1.6, 0);
    group.add(pan);

    // 4. Heating / Reheat Coil
    const heatGeo = new THREE.BoxGeometry(0.6, 4.0, 4.0);
    const heatMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.3,
    });
    this.heatingCoilMesh = new THREE.Mesh(heatGeo, heatMat);
    this.heatingCoilMesh.position.set(0.5, 4, 0);
    group.add(this.heatingCoilMesh);

    // 5. Humidifier Spray Nozzle Bank
    const nozzGeo = new THREE.BoxGeometry(0.4, 3.8, 3.8);
    const nozzMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8, roughness: 0.2 });
    this.humidifierNozzlesMesh = new THREE.Mesh(nozzGeo, nozzMat);
    this.humidifierNozzlesMesh.position.set(3, 4, 0);
    group.add(this.humidifierNozzlesMesh);

    // 6. Centrifugal Fan Blower
    const fanScrollGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.5, 24);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const fanScroll = new THREE.Mesh(fanScrollGeo, fanMat);
    fanScroll.position.set(6, 4, 0);
    group.add(fanScroll);

    this.fanImpellerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 2.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 })
    );
    this.fanImpellerMesh.position.set(6, 4, 0);
    group.add(this.fanImpellerMesh);

    // 7. Data Center Server Rack (Load Target)
    const rackGeo = new THREE.BoxGeometry(2.5, 7, 3);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    this.serverRackMesh = new THREE.Mesh(rackGeo, rackMat);
    this.serverRackMesh.position.set(11, 3.5, 0);
    group.add(this.serverRackMesh);

    // Server LED Status Lights
    for (let u = 0; u < 8; u++) {
      const ledGeo = new THREE.PlaneGeometry(1.8, 0.4);
      const ledMat = new THREE.MeshBasicMaterial({ color: u % 2 === 0 ? 0x00f0ff : 0x10b981 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(9.74, 1.5 + u * 0.6, 0);
      led.rotation.y = -Math.PI / 2;
      group.add(led);
    }

    // 8. Air Stream Particles Flowing through AHU
    const pGeo = new THREE.BufferGeometry();
    this.airParticlePositions = new Float32Array(this.airParticleCount * 3);
    this.airParticleColors = new Float32Array(this.airParticleCount * 3);

    for (let i = 0; i < this.airParticleCount; i++) {
      const idx = i * 3;
      this.airParticlePositions[idx] = -8 + Math.random() * 18;
      this.airParticlePositions[idx + 1] = 4 + (Math.random() - 0.5) * 3.2;
      this.airParticlePositions[idx + 2] = (Math.random() - 0.5) * 3.2;

      // Initial color (Cool Cyan)
      this.airParticleColors[idx] = 0.0;
      this.airParticleColors[idx + 1] = 0.9;
      this.airParticleColors[idx + 2] = 1.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.airParticlePositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(this.airParticleColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.airStreamParticles = new THREE.Points(pGeo, pMat);
    group.add(this.airStreamParticles);

    // 9. Humidifier Mist Particles
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(150 * 3);
    for (let m = 0; m < 150; m++) {
      mistPos[m * 3] = 3.2 + Math.random() * 1.5;
      mistPos[m * 3 + 1] = 4 + (Math.random() - 0.5) * 2;
      mistPos[m * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
    const mistMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    this.mistParticles = new THREE.Points(mistGeo, mistMat);
    group.add(this.mistParticles);

    this.scene.add(group);
    this.resetCamera(18, 10, 18);
  }

  public updateAnimation(delta: number, _elapsedTime: number): void {
    // 1. Rotate centrifugal blower wheel
    this.fanImpellerMesh.rotation.y += delta * 15;

    // 2. Animate air flow particles through AHU duct
    const pos = this.airParticlePositions;
    if (pos) {
      for (let i = 0; i < this.airParticleCount; i++) {
        const idx = i * 3;
        pos[idx] = (pos[idx] ?? 0) + delta * 6; // flow in +x direction

        // Wrap around when leaving duct
        if ((pos[idx] ?? 0) > 10) {
          pos[idx] = -8;
          pos[idx + 1] = 4 + (Math.random() - 0.5) * 3.2;
          pos[idx + 2] = (Math.random() - 0.5) * 3.2;
        }
      }
      if (this.airStreamParticles?.geometry?.attributes?.position) {
        this.airStreamParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  public updateParameters(params: {
    processType?: PsychrometricProcessType;
    dryBulbC?: number;
    relativeHumidityPct?: number;
  }): void {
    if (params.processType) {
      this.currentProcess = params.processType;
      this.coolingCoilMesh.visible = this.currentProcess.includes('cooling');
      this.heatingCoilMesh.visible = this.currentProcess.includes('heating');
      this.humidifierNozzlesMesh.visible = this.currentProcess.includes('humidification');
      this.mistParticles.visible = this.currentProcess.includes('humidification');
    }
    if (params.dryBulbC !== undefined) {
      this.dryBulbC = params.dryBulbC;
    }
    if (params.relativeHumidityPct !== undefined) {
      this.relativeHumidityPct = params.relativeHumidityPct;
    }
  }
}
