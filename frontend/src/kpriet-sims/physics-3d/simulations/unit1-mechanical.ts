/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Unit I: Mechanical Properties of Solids
 * Simulations 01 to 05
 */

import * as THREE from 'three';
import { BaseSimulation } from '../core/BaseSimulation';
import type { SimulationOptions, ParameterDefinition } from '../core/types';

// =========================================================================
// Simulation 01: 3D Material Testing Machine (UTM: Stress, Strain, Modulus)
// =========================================================================
export class MaterialTestingScene extends BaseSimulation {
  private specimenMesh!: THREE.Mesh;
  private upperGrip!: THREE.Group;
  private lowerGrip!: THREE.Group;
  private framePillars!: THREE.Group;
  private forceGaugeDial!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'material',
        label: 'Specimen Material',
        description: 'Selected engineering material with calibrated Young’s Modulus and yield point',
        type: 'select',
        options: [
          { label: 'Structural Steel (E = 200 GPa, σ_y = 250 MPa)', value: 'steel' },
          { label: '6061-T6 Aluminium (E = 69 GPa, σ_y = 276 MPa)', value: 'aluminium' },
          { label: 'Copper Alloy (E = 117 GPa, σ_y = 70 MPa)', value: 'copper' },
          { label: 'Nylon Polymer (E = 3 GPa, σ_y = 45 MPa)', value: 'polymer' },
          { label: 'Alumina Ceramic (E = 380 GPa, Brittle)', value: 'ceramic' },
        ],
        defaultValue: 'steel',
      },
      {
        key: 'forceKN',
        label: 'Tensile Force (F)',
        description: 'Applied axial tensile force',
        type: 'number',
        min: 0,
        max: 50,
        step: 0.5,
        unit: 'kN',
        defaultValue: 10,
      },
      {
        key: 'diameterMm',
        label: 'Specimen Diameter (d)',
        description: 'Original gauge diameter of circular specimen',
        type: 'number',
        min: 6,
        max: 20,
        step: 1,
        unit: 'mm',
        defaultValue: 12,
      },
      {
        key: 'gaugeLengthMm',
        label: 'Gauge Length (L₀)',
        description: 'Reference gauge measurement length',
        type: 'number',
        min: 50,
        max: 150,
        step: 10,
        unit: 'mm',
        defaultValue: 100,
      },
      {
        key: 'exaggeration',
        label: 'Visual Strain Exaggeration',
        description: 'Scale visual elongation for educational clarity (does not change calculation)',
        type: 'number',
        min: 1,
        max: 20,
        step: 1,
        unit: 'x',
        defaultValue: 10,
      },
    ];
  }

  protected initScene(): void {
    // UTM Machine Frame
    this.framePillars = new THREE.Group();
    const baseGeo = new THREE.BoxGeometry(4.5, 0.6, 2.5);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2.0;
    this.framePillars.add(base);

    // Crosshead top
    const topCrosshead = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 2.5), baseMat);
    topCrosshead.position.y = 3.2;
    this.framePillars.add(topCrosshead);

    // Twin Lead Screws
    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.16, 5.2, 24);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const pillarL = new THREE.Mesh(pillarGeo, pillarMat);
    pillarL.position.set(-1.8, 0.6, 0);
    const pillarR = new THREE.Mesh(pillarGeo, pillarMat);
    pillarR.position.set(1.8, 0.6, 0);
    this.framePillars.add(pillarL, pillarR);

    this.scene.add(this.framePillars);

    // Lower Fixed Grip
    this.lowerGrip = new THREE.Group();
    const gripBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
    gripBase.position.y = -1.35;
    this.lowerGrip.add(gripBase);
    this.scene.add(this.lowerGrip);

    // Movable Upper Crosshead & Grip
    this.upperGrip = new THREE.Group();
    const crossheadMovable = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 2.0), baseMat);
    crossheadMovable.position.y = 1.8;
    const gripTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
    gripTop.position.y = 1.35;
    this.upperGrip.add(crossheadMovable, gripTop);
    this.scene.add(this.upperGrip);

    // Test Specimen (Cylinder with dog-bone geometry appearance)
    const specGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.0, 32);
    const specMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.3,
    });
    this.specimenMesh = new THREE.Mesh(specGeo, specMat);
    this.specimenMesh.name = 'specimen';
    this.specimenMesh.userData = { componentId: 'specimen' };
    this.scene.add(this.specimenMesh);

    // Force Gauge Dial
    this.forceGaugeDial = new THREE.Group();
    const dialCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 32), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    dialCyl.rotation.x = Math.PI / 2;
    dialCyl.position.set(1.8, 2.3, 0.4);
    this.forceGaugeDial.add(dialCyl);
    this.scene.add(this.forceGaugeDial);

    // Grid Floor
    const grid = new THREE.GridHelper(12, 24, 0x059669, 0x1e293b);
    grid.position.y = -2.31;
    this.scene.add(grid);

    // Initialize default parameters
    this.parameters.material = 'steel';
    this.parameters.forceKN = 10;
    this.parameters.diameterMm = 12;
    this.parameters.gaugeLengthMm = 100;
    this.parameters.exaggeration = 10;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-linear-elastic',
        index: 0,
        title: 'Stage 1: Hooke’s Law & Linear Elastic Region',
        shortDescription: 'Apply initial tensile load. Strain is directly proportional to stress (σ = E · ε).',
        detailedExplanation:
          'Within the elastic limit, interatomic bonds act like linear springs. Stress σ = F/A increases linearly with strain ε = ΔL/L₀. ' +
          'Upon unloading, the specimen returns entirely to its original length with 0% permanent set.',
        physicsFormulas: ['σ = F / A₀', 'ε = ΔL / L₀', 'E = σ / ε (Hooke’s Law)'],
        keyTerminology: [
          { term: 'Stress (σ)', definition: 'Internal restoring force per unit original cross-sectional area (Pa or N/m²).' },
          { term: 'Strain (ε)', definition: 'Dimensionless ratio of elongation to original length (ΔL/L₀).' },
          { term: 'Young’s Modulus (E)', definition: 'Slope of the linear-elastic region representing intrinsic material stiffness.' },
        ],
        highlightComponentIds: ['specimen'],
        recommendedCamera: { position: [0, 0.5, 5.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-2-yield-plastic',
        index: 1,
        title: 'Stage 2: Yield Point & Plastic Deformation',
        shortDescription: 'Exceed the elastic limit to observe atomic plane slip and permanent elongation.',
        detailedExplanation:
          'When stress exceeds the yield strength σ_y, dislocation glide and permanent slip planes activate. ' +
          'Elongation increases rapidly with small stress increases. Unloading here follows an elastic recovery line parallel to the initial slope, leaving permanent plastic strain.',
        physicsFormulas: ['σ_yield = F_yield / A₀', 'ε_total = ε_elastic + ε_plastic', 'ΔL_perm = ε_plastic · L₀'],
        keyTerminology: [
          { term: 'Yield Strength (σ_y)', definition: 'Stress at which noticeable plastic (permanent) deformation begins (often 0.2% offset).' },
          { term: 'Plastic Deformation', definition: 'Irreversible atomic slip that remains after the load is removed.' },
        ],
        highlightComponentIds: ['specimen'],
        recommendedCamera: { position: [0, 0.2, 4.2], target: [0, 0, 0] },
      },
      {
        id: 'stage-3-comparative-unloading',
        index: 2,
        title: 'Stage 3: Unloading & Energy Recovery',
        shortDescription: 'Inspect resilience and toughness by comparing loading vs unloading curves.',
        detailedExplanation:
          'Area under the elastic curve gives the Modulus of Resilience (elastic energy stored per unit volume). ' +
          'Total area under the stress-strain curve up to fracture gives the Modulus of Toughness.',
        physicsFormulas: ['u_r = (σ_y)² / (2E)', 'Energy Density = ∫ σ dε'],
        highlightComponentIds: ['specimen'],
        recommendedCamera: { position: [1.2, 1.2, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('specimen', {
      id: 'specimen',
      name: 'Tensile Test Dog-bone Specimen',
      scientificRole: 'Standard cylindrical tensile coupon subjected to uniform uniaxial tension',
      materialsAndSpecs: 'ASTM E8 standard tensile geometry: L₀ = 50–150 mm, d = 6–20 mm',
      physicalPrinciples: 'Uniaxial stress σ = F/A, strain ε = ΔL/L₀, governed by crystal lattice bonding forces and dislocation mobility.',
      equations: ['σ = F / (π·d²/4)', 'ΔL = (F · L₀) / (A · E)'],
      operationalLimits: 'Steel: E=200 GPa, σ_y=250 MPa | Aluminium: E=69 GPa, σ_y=276 MPa | Ceramic: Brittle fracture',
    });
  }

  protected updatePhysics(_delta: number): void {
    const forceN = Number(this.parameters.forceKN || 10) * 1000;
    const dMm = Number(this.parameters.diameterMm || 12);
    const l0Mm = Number(this.parameters.gaugeLengthMm || 100);
    const mat = String(this.parameters.material || 'steel');
    const exag = Number(this.parameters.exaggeration || 10);

    // Cross-sectional Area A in m²
    const rM = (dMm / 2) / 1000;
    const areaM2 = Math.PI * rM * rM;

    // Material properties
    let E = 200e9; // Pa
    let yieldStress = 250e6; // Pa
    let ultimateStress = 400e6; // Pa
    let isBrittle = false;
    let colorHex = 0x0284c7;

    switch (mat) {
      case 'steel':
        E = 200e9; yieldStress = 250e6; ultimateStress = 450e6; colorHex = 0x64748b; break;
      case 'aluminium':
        E = 69e9; yieldStress = 276e6; ultimateStress = 310e6; colorHex = 0x94a3b8; break;
      case 'copper':
        E = 117e9; yieldStress = 70e6; ultimateStress = 220e6; colorHex = 0xd97706; break;
      case 'polymer':
        E = 3e9; yieldStress = 45e6; ultimateStress = 65e6; colorHex = 0x10b981; break;
      case 'ceramic':
        E = 380e9; yieldStress = 350e6; ultimateStress = 350e6; isBrittle = true; colorHex = 0xf87171; break;
    }

    // Stress in Pa and MPa
    const stressPa = forceN / areaM2;
    const stressMPa = stressPa / 1e6;

    // Strain calculation (Piecewise model: linear elastic + power-law plastic)
    let strain = 0;
    let isYielded = false;
    let isFractured = false;

    if (isBrittle && stressPa > ultimateStress) {
      isFractured = true;
      strain = ultimateStress / E;
    } else if (stressPa <= yieldStress) {
      strain = stressPa / E;
    } else {
      isYielded = true;
      const elasticStrain = yieldStress / E;
      const plasticStrain = Math.pow((stressPa - yieldStress) / (ultimateStress - yieldStress + 1e-5), 2) * 0.08;
      strain = elasticStrain + plasticStrain;
      if (stressPa > ultimateStress) isFractured = true;
    }

    // Elongation ΔL in mm
    const deltaLMm = strain * l0Mm;

    // Visual deformation (specimen length scale and necking)
    const visualStrain = strain * exag;
    const scaleY = isFractured ? 0.01 : Math.max(0.5, 1.0 + visualStrain);
    const scaleXZ = isFractured ? 0.01 : Math.max(0.3, 1.0 - visualStrain * 0.35); // Poisson lateral necking

    if (this.specimenMesh) {
      this.specimenMesh.scale.set(scaleXZ, scaleY, scaleXZ);
      (this.specimenMesh.material as THREE.MeshStandardMaterial).color.setHex(colorHex);

      // Flash red if yielded
      if (isYielded) {
        (this.specimenMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xef4444);
        (this.specimenMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
      } else {
        (this.specimenMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      }
    }

    // Upper grip displacement
    if (this.upperGrip) {
      const gripOffset = isFractured ? 1.0 : (scaleY - 1.0) * 1.0;
      this.upperGrip.position.y = Math.min(gripOffset, 1.2);
    }

    // Store calculated metrics
    this.metrics['stressMPa'] = Number(stressMPa.toFixed(2));
    this.metrics['strainPct'] = Number((strain * 100).toFixed(4));
    this.metrics['elongationMm'] = Number(deltaLMm.toFixed(4));
    this.metrics['youngModulusGPa'] = Number((E / 1e9).toFixed(1));
    this.metrics['regime'] = isFractured ? 'Fractured' : isYielded ? 'Plastic Slip' : 'Linear Elastic';
  }
}

// =========================================================================
// Simulation 02: 3D Poisson's Ratio & Transverse Strain Explorer
// =========================================================================
export class PoissonRatioScene extends BaseSimulation {
  private specimenMesh!: THREE.Mesh;
  private arrowAxial!: THREE.Group;
  private arrowLateral!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'material',
        label: 'Material Selection',
        description: 'Engineering material Poisson ratio ν',
        type: 'select',
        options: [
          { label: 'Steel (ν = 0.30)', value: 'steel' },
          { label: 'Aluminium (ν = 0.33)', value: 'aluminium' },
          { label: 'Rubber / Incompressible (ν = 0.49)', value: 'rubber' },
          { label: 'Cork / Low Lateral Strain (ν = 0.05)', value: 'cork' },
          { label: 'Auxetic Metamaterial (Negative ν = -0.30)', value: 'auxetic' },
        ],
        defaultValue: 'steel',
      },
      {
        key: 'axialStrainPct',
        label: 'Axial Strain (ε_longitudinal)',
        description: 'Applied longitudinal strain (positive: tension, negative: compression)',
        type: 'number',
        min: -15,
        max: 25,
        step: 0.5,
        unit: '%',
        defaultValue: 10,
      },
      {
        key: 'exaggeration',
        label: 'Display Exaggeration',
        description: 'Visual scaling of lateral transverse change',
        type: 'number',
        min: 1,
        max: 5,
        step: 0.5,
        unit: 'x',
        defaultValue: 2,
      },
    ];
  }

  protected initScene(): void {
    // 3D Specimen Block
    const geo = new THREE.BoxGeometry(2.0, 3.5, 2.0, 16, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.4,
      metalness: 0.3,
      wireframe: false,
    });
    this.specimenMesh = new THREE.Mesh(geo, mat);
    this.specimenMesh.name = 'poisson-block';
    this.specimenMesh.userData = { componentId: 'poisson-block' };
    this.scene.add(this.specimenMesh);

    // Indicator arrows
    this.arrowAxial = new THREE.Group();
    this.arrowLateral = new THREE.Group();
    this.scene.add(this.arrowAxial, this.arrowLateral);

    // Ground Plane with Reference Coordinate Lines
    const grid = new THREE.GridHelper(10, 20, 0x0284c7, 0x334155);
    grid.position.y = -2.2;
    this.scene.add(grid);

    this.parameters.material = 'steel';
    this.parameters.axialStrainPct = 10;
    this.parameters.exaggeration = 2;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-tensile-contraction',
        index: 0,
        title: 'Stage 1: Axial Tension & Lateral Contraction',
        shortDescription: 'Pulling in the axial direction causes transverse narrowing: ν = - ε_trans / ε_axial.',
        detailedExplanation:
          'For nearly all homogeneous isotropic materials under tensile stress, atomic bonds stretch along the load axis while contracting laterally to conserve volume.',
        physicsFormulas: ['ν = - ε_transverse / ε_longitudinal', 'ε_lat = - ν · ε_long', 'ΔV / V₀ = ε_long (1 - 2ν)'],
        keyTerminology: [
          { term: 'Poisson’s Ratio (ν)', definition: 'Negative ratio of transverse strain to longitudinal strain in uniaxial stress.' },
          { term: 'Volumetric Strain (θ)', definition: 'Relative change in volume: θ = ε_x + ε_y + ε_z = ε_long(1 - 2ν).' },
        ],
        highlightComponentIds: ['poisson-block'],
        recommendedCamera: { position: [3, 2, 5], target: [0, 0, 0] },
      },
      {
        id: 'stage-2-compression-expansion',
        index: 1,
        title: 'Stage 2: Uniaxial Compression & Lateral Bulging',
        shortDescription: 'Compressing axially (negative strain) induces outward lateral expansion.',
        detailedExplanation:
          'Under compression, atoms are pushed closer along the load direction and repulsive Coulomb forces push neighboring atoms outward transversely.',
        physicsFormulas: ['ε_axial < 0 ⟹ ε_trans > 0'],
        highlightComponentIds: ['poisson-block'],
        recommendedCamera: { position: [0, 1.5, 5], target: [0, 0, 0] },
      },
      {
        id: 'stage-3-extremes-auxetic',
        index: 2,
        title: 'Stage 3: Auxetic Metamaterials & Incompressible Limits',
        shortDescription: 'Explore negative Poisson ratio materials (re-entrant auxetics) and rubber elasticity.',
        detailedExplanation:
          'Rubber approaches ν ≈ 0.50, exhibiting near-zero volume change (incompressibility). In contrast, engineered auxetic metamaterials with hinged re-entrant cellular geometry expand transversely when pulled (ν < 0).',
        physicsFormulas: ['ν_rubber ≈ 0.499 ⟹ K ≫ G', 'ν_auxetic < 0 (Transverse expansion under tension)'],
        keyTerminology: [
          { term: 'Auxetic Solid', definition: 'A structure possessing a negative Poisson ratio that expands laterally when stretched.' },
          { term: 'Bulk vs Shear Modulus', definition: 'K / G = 2(1 + ν) / (3(1 - 2ν)); as ν → 0.5, bulk modulus K diverges.' },
        ],
        highlightComponentIds: ['poisson-block'],
        recommendedCamera: { position: [2.5, 2.0, 4.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('poisson-block', {
      id: 'poisson-block',
      name: 'Homogeneous Isotropic Prism',
      scientificRole: '3D representative volume element under uniaxial normal stress',
      materialsAndSpecs: 'Calibrated engineering sample with calibrated ν from 0.05 to 0.49 and auxetic (-0.30)',
      physicalPrinciples: 'Poisson transverse coupling governed by elastic stiffness tensor: C₁₂ / (C₁₁ + C₁₂).',
      equations: ['ν = - (Δd / d₀) / (ΔL / L₀)', 'ΔV/V₀ = ε(1 - 2ν)'],
      operationalLimits: 'Theoretical limits for stable isotropic 3D solids: -1.0 < ν < 0.50',
    });
  }

  protected updatePhysics(_delta: number): void {
    const mat = String(this.parameters.material || 'steel');
    const epsAxial = Number(this.parameters.axialStrainPct || 10) / 100;
    const exag = Number(this.parameters.exaggeration || 2);

    let nu = 0.30;
    switch (mat) {
      case 'steel': nu = 0.30; break;
      case 'aluminium': nu = 0.33; break;
      case 'rubber': nu = 0.49; break;
      case 'cork': nu = 0.05; break;
      case 'auxetic': nu = -0.30; break;
    }

    const epsLateral = -nu * epsAxial;
    const volStrain = epsAxial * (1 - 2 * nu);

    // Apply scale to 3D mesh
    const sy = 1.0 + epsAxial * exag;
    const sx = 1.0 + epsLateral * exag;
    const sz = sx;

    if (this.specimenMesh) {
      this.specimenMesh.scale.set(Math.max(0.2, sx), Math.max(0.2, sy), Math.max(0.2, sz));
    }

    this.metrics['poissonRatio'] = nu;
    this.metrics['axialStrainPct'] = Number((epsAxial * 100).toFixed(2));
    this.metrics['transverseStrainPct'] = Number((epsLateral * 100).toFixed(2));
    this.metrics['volumetricStrainPct'] = Number((volStrain * 100).toFixed(2));
  }
}

// =========================================================================
// Simulation 03: 3D Material Comparison (Metals, Polymers, Ceramics)
// =========================================================================
export class MaterialComparisonScene extends BaseSimulation {
  private metalMesh!: THREE.Mesh;
  private polymerMesh!: THREE.Mesh;
  private ceramicMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'commonLoadKN',
        label: 'Equal Tensile Load (F)',
        description: 'Simultaneously applied tensile load across all three test bars',
        type: 'number',
        min: 0,
        max: 30,
        step: 1,
        unit: 'kN',
        defaultValue: 15,
      },
    ];
  }

  protected initScene(): void {
    const geo = new THREE.CylinderGeometry(0.18, 0.18, 2.8, 32);

    // Metal Bar
    this.metalMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 }));
    this.metalMesh.position.set(-2.0, 0, 0);
    this.metalMesh.name = 'metal-bar';
    this.metalMesh.userData = { componentId: 'metal-bar' };

    // Polymer Bar
    this.polymerMesh = new THREE.Mesh(geo.clone(), new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, metalness: 0.1 }));
    this.polymerMesh.position.set(0, 0, 0);
    this.polymerMesh.name = 'polymer-bar';
    this.polymerMesh.userData = { componentId: 'polymer-bar' };

    // Ceramic Bar
    this.ceramicMesh = new THREE.Mesh(geo.clone(), new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.8, metalness: 0.05 }));
    this.ceramicMesh.position.set(2.0, 0, 0);
    this.ceramicMesh.name = 'ceramic-bar';
    this.ceramicMesh.userData = { componentId: 'ceramic-bar' };

    this.scene.add(this.metalMesh, this.polymerMesh, this.ceramicMesh);

    // Common Mounting Head & Base Platen
    const platenGeo = new THREE.BoxGeometry(6.0, 0.4, 1.2);
    const platenMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
    const topPlaten = new THREE.Mesh(platenGeo, platenMat);
    topPlaten.position.y = 1.6;
    const botPlaten = new THREE.Mesh(platenGeo, platenMat);
    botPlaten.position.y = -1.6;
    this.scene.add(topPlaten, botPlaten);

    this.parameters.commonLoadKN = 15;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-triple-comparison',
        index: 0,
        title: 'Stage 1: Ductile vs Viscoelastic vs Brittle Response',
        shortDescription: 'Subject metal, polymer, and ceramic specimens to identical tensile loads.',
        detailedExplanation:
          'Metals exhibit high stiffness with ductile yield and necking. Polymers feature low modulus with large viscoelastic elongation. ' +
          'Ceramics exhibit very high stiffness and brittle fracture with negligible plastic deformation.',
        highlightComponentIds: ['metal-bar', 'polymer-bar', 'ceramic-bar'],
        recommendedCamera: { position: [0, 0.5, 6.2], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('metal-bar', {
      id: 'metal-bar',
      name: 'Structural Steel (Ductile)',
      scientificRole: 'Metallic bonding, dislocation slip on close-packed planes',
      materialsAndSpecs: 'E = 200 GPa, Yield = 250 MPa, Tensile Strength = 450 MPa',
      physicalPrinciples: 'Linear elastic up to yield, followed by strain hardening and localized necking.',
    });
    this.components.set('polymer-bar', {
      id: 'polymer-bar',
      name: 'High-Density Polymer (Compliant & Viscoelastic)',
      scientificRole: 'Covalent carbon backbone chains with weak intermolecular van der Waals forces',
      materialsAndSpecs: 'E = 2.5 GPa, Yield = 35 MPa, Elongation > 20%',
      physicalPrinciples: 'Chain uncoiling and alignment produce high elongation at low stress.',
    });
    this.components.set('ceramic-bar', {
      id: 'ceramic-bar',
      name: 'Alumina Ceramic (Ultra-Stiff & Brittle)',
      scientificRole: 'Ionic-covalent directional crystal bonding with high dislocation resistance',
      materialsAndSpecs: 'E = 380 GPa, Compressive = 2500 MPa, Tensile = 250 MPa (Brittle)',
      physicalPrinciples: 'Griffith microcrack propagation causes catastrophic brittle failure without yield.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const loadN = Number(this.parameters.commonLoadKN || 15) * 1000;
    const areaM2 = Math.PI * Math.pow(0.009, 2); // 18 mm dia
    const stressMPa = (loadN / areaM2) / 1e6;

    // Metal strain
    const metalStrain = stressMPa / 200000;
    // Polymer strain (E = 2.5 GPa)
    const polymerStrain = Math.min(stressMPa / 2500, 0.35);
    // Ceramic strain (E = 380 GPa)
    const isCeramicFractured = stressMPa > 250;
    const ceramicStrain = isCeramicFractured ? 0 : stressMPa / 380000;

    if (this.metalMesh) this.metalMesh.scale.set(1.0 - metalStrain * 2, 1.0 + metalStrain * 6, 1.0 - metalStrain * 2);
    if (this.polymerMesh) this.polymerMesh.scale.set(1.0 - polymerStrain * 1.5, 1.0 + polymerStrain * 5, 1.0 - polymerStrain * 1.5);
    if (this.ceramicMesh) {
      if (isCeramicFractured) {
        this.ceramicMesh.scale.set(0.01, 0.01, 0.01);
      } else {
        this.ceramicMesh.scale.set(1.0, 1.0 + ceramicStrain * 4, 1.0);
      }
    }

    this.metrics['stressMPa'] = Number(stressMPa.toFixed(1));
    this.metrics['metalElongationMm'] = Number((metalStrain * 100).toFixed(3));
    this.metrics['polymerElongationMm'] = Number((polymerStrain * 100).toFixed(2));
    this.metrics['ceramicStatus'] = isCeramicFractured ? 'Fractured (Brittle Limit Exceeded)' : 'Intact (Elastic)';
  }
}

// =========================================================================
// Simulation 04: 3D Cantilever Beam & Bending Moment Laboratory
// =========================================================================
export class CantileverBeamScene extends BaseSimulation {
  private beamMesh!: THREE.Mesh;
  private loadIndicator!: THREE.Group;
  private fixedSupportWall!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'loadN',
        label: 'Applied Load (W)',
        description: 'Downward point load on the cantilever beam',
        type: 'number',
        min: 10,
        max: 500,
        step: 10,
        unit: 'N',
        defaultValue: 150,
      },
      {
        key: 'beamLengthM',
        label: 'Beam Length (L)',
        description: 'Unsupported span length from fixed wall to free tip',
        type: 'number',
        min: 0.5,
        max: 2.5,
        step: 0.1,
        unit: 'm',
        defaultValue: 1.5,
      },
      {
        key: 'loadPositionM',
        label: 'Load Position (x)',
        description: 'Distance from fixed support to point of load application',
        type: 'number',
        min: 0.2,
        max: 2.5,
        step: 0.1,
        unit: 'm',
        defaultValue: 1.5,
      },
      {
        key: 'beamProfile',
        label: 'Cross Section Geometry',
        description: 'Cross-sectional profile affecting Area Moment of Inertia (I_z)',
        type: 'select',
        options: [
          { label: 'Rectangular Strip (b = 40 mm, d = 10 mm)', value: 'rect' },
          { label: 'Solid Square (20 mm × 20 mm)', value: 'square' },
          { label: 'Circular Rod (d = 25 mm)', value: 'circle' },
          { label: 'I-Section Flange (High Stiffness)', value: 'ibeam' },
        ],
        defaultValue: 'rect',
      },
      {
        key: 'exaggeration',
        label: 'Visual Deflection Scale',
        description: 'Scale visual curvature for pedagogical visibility',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        unit: 'x',
        defaultValue: 4,
      },
    ];
  }

  protected initScene(): void {
    // Fixed support wall
    const wallGeo = new THREE.BoxGeometry(0.6, 3.5, 2.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4 });
    this.fixedSupportWall = new THREE.Mesh(wallGeo, wallMat);
    this.fixedSupportWall.position.set(-2.5, 0, 0);
    this.scene.add(this.fixedSupportWall);

    // Cantilever Beam Geometry
    const beamGeo = new THREE.BoxGeometry(4.0, 0.25, 0.6, 40, 4, 4);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.6, roughness: 0.3 });
    this.beamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.beamMesh.position.set(-0.5, 0, 0);
    this.beamMesh.name = 'cantilever-beam';
    this.beamMesh.userData = { componentId: 'cantilever-beam' };
    this.scene.add(this.beamMesh);

    // Load indicator arrow
    this.loadIndicator = new THREE.Group();
    const arrowCone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    arrowCone.rotation.x = Math.PI;
    arrowCone.position.y = 0.6;
    const arrowStem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    arrowStem.position.y = 1.05;
    this.loadIndicator.add(arrowCone, arrowStem);
    this.scene.add(this.loadIndicator);

    this.parameters.loadN = 150;
    this.parameters.beamLengthM = 1.5;
    this.parameters.loadPositionM = 1.5;
    this.parameters.beamProfile = 'rect';
    this.parameters.exaggeration = 4;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-euler-bernoulli',
        index: 0,
        title: 'Stage 1: Euler–Bernoulli Beam Bending & Maximum Moment',
        shortDescription: 'Examine bending moment distribution M(x) = -W(L - x) and max deflection at the free end.',
        detailedExplanation:
          'For a cantilever beam fixed at x = 0 and loaded at x = a, bending moment is maximal at the fixed support (M_max = -W·a) ' +
          'and drops linearly to zero at the point of load. Deflection follows the differential equation EI (d²y/dx²) = M(x).',
        physicsFormulas: ['M(x) = - W · (a - x)', 'δ_max = (W · a³) / (3 · E · I_z)', 'I_rect = (b · d³) / 12'],
        keyTerminology: [
          { term: 'Bending Moment (M)', definition: 'Algebraic sum of moments of forces causing curvature about the neutral axis (N·m).' },
          { term: 'Area Moment of Inertia (I)', definition: 'Geometric resistance of a cross-section to bending (m⁴).' },
        ],
        highlightComponentIds: ['cantilever-beam'],
        recommendedCamera: { position: [0, 1.2, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('cantilever-beam', {
      id: 'cantilever-beam',
      name: 'Elastic Cantilever Beam',
      scientificRole: 'Structural member supported at one end only, resisting lateral loads through bending',
      materialsAndSpecs: 'Structural Alloy: E = 200 GPa, Length L = 0.5–2.5 m',
      physicalPrinciples: 'Euler–Bernoulli beam theory: Plane sections remain plane and normal to the deformed neutral surface.',
      equations: ['δ = W·x²(3L - x) / (6EI)', 'σ_max = (M_max · y) / I'],
    });
  }

  protected updatePhysics(_delta: number): void {
    const W = Number(this.parameters.loadN || 150);
    const L = Number(this.parameters.beamLengthM || 1.5);
    const a = Math.min(Number(this.parameters.loadPositionM || 1.5), L);
    const profile = String(this.parameters.beamProfile || 'rect');
    const E = 200e9; // 200 GPa
    const exag = Number(this.parameters.exaggeration || 4);

    // Area moment of inertia Iz in m⁴
    let Iz = (0.04 * Math.pow(0.01, 3)) / 12; // default rect: 40mm x 10mm
    if (profile === 'square') Iz = Math.pow(0.02, 4) / 12;
    else if (profile === 'circle') Iz = (Math.PI * Math.pow(0.025, 4)) / 64;
    else if (profile === 'ibeam') Iz = 1.8e-8;

    // Maximum deflection in meters: δ = (W * a^3) / (3 * E * Iz)
    const deltaMaxM = (W * Math.pow(a, 3)) / (3 * E * Iz);
    const deltaMaxMm = deltaMaxM * 1000;
    const maxMomentNm = W * a;

    // Apply visual curvature deflection
    if (this.beamMesh) {
      const visualDeflect = Math.min(deltaMaxM * exag * 40, 0.8);
      this.beamMesh.rotation.z = -visualDeflect * 0.25;
      this.beamMesh.position.y = -visualDeflect * 0.5;
    }

    if (this.loadIndicator) {
      this.loadIndicator.position.x = -2.2 + (a / 2.5) * 4.0;
      this.loadIndicator.position.y = 0.3 - (deltaMaxM * exag * 20);
    }

    this.metrics['maxMomentNm'] = Number(maxMomentNm.toFixed(2));
    this.metrics['maxDeflectionMm'] = Number(deltaMaxMm.toFixed(3));
    this.metrics['momentOfInertiaM4'] = Iz.toExponential(3);
    this.metrics['flexuralRigidityEI'] = Number((E * Iz).toFixed(2));
  }
}

// =========================================================================
// Simulation 05: 3D Girders & MEMS Mechanical Applications
// =========================================================================
export class GirdersMEMSScene extends BaseSimulation {
  private girderGroup!: THREE.Group;
  private memsGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'domainMode',
        label: 'Engineering Domain',
        description: 'Macroscale civil bridge girder vs microscale MEMS cantilever resonator',
        type: 'select',
        options: [
          { label: 'Macroscale Civil I-Girder (Bridge Span: 15 m)', value: 'girder' },
          { label: 'Microscale MEMS Resonator (Length: 200 µm)', value: 'mems' },
        ],
        defaultValue: 'girder',
      },
      {
        key: 'excitationFrequency',
        label: 'Actuation Frequency (f)',
        description: 'Applied driving frequency for MEMS dynamic resonance',
        type: 'number',
        min: 10,
        max: 200,
        step: 5,
        unit: 'kHz',
        defaultValue: 65,
      },
    ];
  }

  protected initScene(): void {
    this.girderGroup = new THREE.Group();
    this.memsGroup = new THREE.Group();

    // 1. Civil I-Beam Girder
    const iBeamMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.25 });
    // Top flange
    const topFlange = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.2, 1.2), iBeamMat);
    topFlange.position.y = 1.0;
    // Bottom flange
    const botFlange = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.2, 1.2), iBeamMat);
    botFlange.position.y = -1.0;
    // Web
    const web = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.8, 0.25), iBeamMat);
    this.girderGroup.add(topFlange, botFlange, web);
    this.girderGroup.name = 'macro-girder';
    this.girderGroup.userData = { componentId: 'macro-girder' };

    // 2. MEMS Micro-Cantilever (Silicon cantilever over substrate)
    const subMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 });
    const substrate = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.8, 2.5), subMat);
    substrate.position.y = -1.0;

    const microBeam = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.08, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.1 })
    );
    microBeam.position.set(0.5, -0.4, 0);
    this.memsGroup.add(substrate, microBeam);
    this.memsGroup.name = 'mems-resonator';
    this.memsGroup.userData = { componentId: 'mems-resonator' };
    this.memsGroup.visible = false;

    this.scene.add(this.girderGroup, this.memsGroup);

    this.parameters.domainMode = 'girder';
    this.parameters.excitationFrequency = 65;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-scale-coupling',
        index: 0,
        title: 'Stage 1: Structural Scaling from Bridges to MEMS Accelerometers',
        shortDescription: 'Compare structural I-girder bending resistance to microscopic MEMS cantilever resonance.',
        detailedExplanation:
          'I-girders concentrate cross-sectional area at maximum distance from neutral axis to maximize I_z with minimum weight. ' +
          'At the microscale, MEMS cantilevers utilize the same elastic cantilever principles for RF switches, atomic force microscopy (AFM), and inertial accelerometers.',
        highlightComponentIds: ['macro-girder', 'mems-resonator'],
        recommendedCamera: { position: [0, 1.5, 6.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('macro-girder', {
      id: 'macro-girder',
      name: 'Engineered I-Girder Section',
      scientificRole: 'High flexural rigidity beam with wide flanges carrying normal bending stress and web carrying shear',
      materialsAndSpecs: 'Structural steel ASTM A992: Depth = 1.0 m, Span = 15 m',
      physicalPrinciples: 'Maximized section modulus Z = I / y_max reduces maximum bending stress σ = M / Z.',
    });
    this.components.set('mems-resonator', {
      id: 'mems-resonator',
      name: 'Single-Crystal Silicon MEMS Cantilever',
      scientificRole: 'Micro-electromechanical resonator for resonant mass sensing and atomic force microscopy',
      materialsAndSpecs: 'Microfabricated <100> Silicon: L = 200 µm, b = 30 µm, t = 2 µm, E = 169 GPa',
      physicalPrinciples: 'Natural resonant frequency f₀ = 0.1615 · (t / L²) · √(E / ρ).',
    });
  }

  protected updatePhysics(_delta: number): void {
    const mode = String(this.parameters.domainMode || 'girder');
    const freqKHz = Number(this.parameters.excitationFrequency || 65);

    if (mode === 'girder') {
      this.girderGroup.visible = true;
      this.memsGroup.visible = false;
      this.metrics['domain'] = 'Civil Engineering (Macroscale)';
      this.metrics['effectiveSpan'] = '15.0 m';
      this.metrics['weightReduction'] = '42% vs solid box';
    } else {
      this.girderGroup.visible = false;
      this.memsGroup.visible = true;
      // Resonant frequency for 200um silicon beam: ~68.4 kHz
      const f0 = 68.4;
      const response = 1.0 / Math.sqrt(Math.pow(1 - Math.pow(freqKHz / f0, 2), 2) + Math.pow((freqKHz / f0) / 25, 2));

      // Oscillate MEMS cantilever
      const microBeam = this.memsGroup.children[1];
      if (microBeam) {
        microBeam.rotation.z = Math.sin(this.currentTime * 12) * response * 0.05;
      }

      this.metrics['domain'] = 'MEMS Nanotechnology (Microscale)';
      this.metrics['resonantFreqF0'] = '68.4 kHz';
      this.metrics['dynamicAmplificationQ'] = Number(response.toFixed(1));
    }
  }
}
