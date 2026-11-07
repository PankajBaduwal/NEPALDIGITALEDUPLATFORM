import * as THREE from 'three';
import { BaseHydraulicSimulation, type IApparatusComponent } from '../../core/BaseHydraulicSimulation';
import type { IBernoulliInputs, IBernoulliOutputs } from '../../core/types';
import { HydraulicCalculator } from '../../core/HydraulicCalculator';

export class BernoulliVenturiScene extends BaseHydraulicSimulation {
  private piezometerWaterMeshes: THREE.Mesh[] = [];
  private particleGroup!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleSpeeds!: Float32Array;
  private currentInputs: IBernoulliInputs;
  private currentOutputs: IBernoulliOutputs;

  constructor(
    container: HTMLElement,
    initialInputs: IBernoulliInputs,
    onComponentSelected?: (comp: IApparatusComponent | null) => void
  ) {
    super(container, onComponentSelected);
    this.currentInputs = initialInputs;
    this.currentOutputs = HydraulicCalculator.calculateBernoulli(initialInputs);

    this.buildApparatus();
    this.applyState(initialInputs);
  }

  private buildApparatus(): void {
    const apparatusRoot = new THREE.Group();
    apparatusRoot.position.set(0, 0.72, 0);

    // 1. Transparent Perspex Venturi Conduit
    const pipeMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transmission: 0.9,
      opacity: 0.95,
      transparent: true,
      roughness: 0.08,
      ior: 1.49,
      metalness: 0.05,
    });

    const conduitGroup = new THREE.Group();

    // Section 1: Inlet straight cylinder (L=0.3m, d=0.10m outer)
    const inGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 32);
    const inMesh = new THREE.Mesh(inGeo, pipeMat);
    inMesh.rotation.z = Math.PI / 2;
    inMesh.position.x = -0.45;
    conduitGroup.add(inMesh);

    // Section 2: Converging Cone (L=0.2m, from r=0.06 to r=0.03)
    const convGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.2, 32);
    const convMesh = new THREE.Mesh(convGeo, pipeMat);
    convMesh.rotation.z = -Math.PI / 2;
    convMesh.position.x = -0.20;
    conduitGroup.add(convMesh);

    // Section 3: Venturi Throat (L=0.15m, r=0.03)
    const throatGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 32);
    const throatMesh = new THREE.Mesh(throatGeo, pipeMat);
    throatMesh.rotation.z = Math.PI / 2;
    throatMesh.position.x = -0.025;
    conduitGroup.add(throatMesh);

    // Section 4: Diverging Diffuser Cone (L=0.4m, from r=0.03 to r=0.06)
    const diffGeo = new THREE.CylinderGeometry(0.06, 0.03, 0.4, 32);
    const diffMesh = new THREE.Mesh(diffGeo, pipeMat);
    diffMesh.rotation.z = -Math.PI / 2;
    diffMesh.position.x = 0.25;
    conduitGroup.add(diffMesh);

    // Section 5: Outlet straight cylinder (L=0.25m, r=0.06)
    const outGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 32);
    const outMesh = new THREE.Mesh(outGeo, pipeMat);
    outMesh.rotation.z = Math.PI / 2;
    outMesh.position.x = 0.575;
    conduitGroup.add(outMesh);

    apparatusRoot.add(conduitGroup);
    this.registerComponent(
      'venturi_tube',
      'Perspex Venturimeter Apparatus',
      conduitGroup,
      'Standard converging-diverging perspex conduit demonstrating Bernoulli theorem. Fluid velocity increases at the constriction while static pressure simultaneously drops.',
      'Inlet Diameter: 50 mm | Throat Diameter: 25 mm | Area Ratio: 4:1',
      'p₁/(ρg) + v₁²/(2g) + z₁ = p₂/(ρg) + v₂²/(2g) + z₂'
    );

    // 2. Battery of 8 Vertical Glass Piezometer Tubes
    const piezometerGroup = new THREE.Group();
    const glassTubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
    });
    const waterColumnMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
    });

    const xPositions = [-0.55, -0.38, -0.22, -0.025, 0.15, 0.32, 0.48, 0.65];

    this.piezometerWaterMeshes = [];

    xPositions.forEach((x, i) => {
      // Outer glass tube (height 0.8m, r = 0.008m)
      const tubeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.8, 16);
      const tube = new THREE.Mesh(tubeGeo, glassTubeMat);
      tube.position.set(x, 0.4, 0);
      piezometerGroup.add(tube);

      // Water meniscus inside tube
      const waterGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.5, 16);
      const waterMesh = new THREE.Mesh(waterGeo, waterColumnMat);
      waterMesh.position.set(x, 0.25, 0);
      piezometerGroup.add(waterMesh);
      this.piezometerWaterMeshes.push(waterMesh);

      // Top breather cap
      const capGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.02, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(x, 0.81, 0);
      piezometerGroup.add(cap);
    });

    apparatusRoot.add(piezometerGroup);
    this.registerComponent(
      'piezometer_battery',
      'Piezometer Tube Manometer Battery',
      piezometerGroup,
      'Eight graduated glass piezometer columns tapping pressure ports along the inlet, convergence, throat, and diffuser, directly indicating the Hydraulic Grade Line (HGL).',
      '8 stations | Scale range: 0.0 to 800 mm water column',
      'h_piezo = p / (ρ·g) + z'
    );

    // 3. Fluid Streamline Particle Tracers
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(particleCount * 3);
    this.particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 1.3;
      const r = Math.random() * 0.025;
      const angle = Math.random() * Math.PI * 2;
      this.particlePositions[i * 3] = x;
      this.particlePositions[i * 3 + 1] = Math.sin(angle) * r;
      this.particlePositions[i * 3 + 2] = Math.cos(angle) * r;
      this.particleSpeeds[i] = 0.5 + Math.random() * 0.5;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.012,
      transparent: true,
      opacity: 0.75,
    });
    this.particleGroup = new THREE.Points(pGeo, pMat);
    apparatusRoot.add(this.particleGroup);

    this.scene.add(apparatusRoot);
  }

  public applyState(inputs: IBernoulliInputs): void {
    this.currentInputs = inputs;
    this.currentOutputs = HydraulicCalculator.calculateBernoulli(inputs);

    // Update piezometer water heights matching calculated pressure heads
    const stations = this.currentOutputs.stations;
    this.piezometerWaterMeshes.forEach((mesh, idx) => {
      const stn = stations[idx];
      if (stn) {
        // Visual height scale (0.05m to 0.75m)
        const visualHeight = Math.max(0.04, Math.min(0.75, stn.pressureHeadM * 0.45));
        mesh.scale.y = visualHeight / 0.5;
        mesh.position.y = visualHeight / 2;
      }
    });
  }

  protected update(dt: number): void {
    if (!this.particlePositions) return;

    // Streamline particle movement acceleration
    // Near throat (x between -0.15 and 0.05) velocity is 4x higher
    const baseVelocity = (this.currentOutputs.inletVelocityMps || 1.2) * 0.3;

    for (let i = 0; i < this.particlePositions.length / 3; i++) {
      let x = this.particlePositions[i * 3]!;
      // Speed factor depending on x position
      const isNearThroat = x > -0.25 && x < 0.15;
      const localSpeed = isNearThroat ? baseVelocity * 3.5 : baseVelocity;

      x += localSpeed * dt;
      if (x > 0.7) {
        x = -0.65;
      }
      this.particlePositions[i * 3] = x;
    }

    const posAttr = this.particleGroup.geometry.attributes.position;
    if (posAttr) {
      posAttr.needsUpdate = true;
    }
  }

  public getOutputs(): IBernoulliOutputs {
    return this.currentOutputs;
  }
}
