/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 9: Chromatography (HPLC and Gas Chromatography)
 *
 * Demonstrates:
 * - High-Performance Liquid Chromatography (HPLC) instrumentation:
 *   Solvent reservoirs, degasser, high-pressure dual-piston pump (up to 400 bar), Rheodyne injector,
 *   C18 reverse-phase packed column, UV-Vis photodiode array detector.
 * - Gas Chromatography (GC) instrumentation:
 *   Carrier gas cylinder (He / N₂), electronic pressure control, heated injector port,
 *   fused silica capillary column inside temperature-programmed oven, Flame Ionization Detector (FID).
 * - Molecular partition mechanism: Partition coefficient K_D = C_s / C_m
 * - Real-time band migration and differential separation along the column length
 * - Synchronized detector response and chromatogram generation (Retention times t_R, resolution R_s)
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';

export type ChromatographyType = 'hplc' | 'gc';

export interface SampleComponent {
  name: string;
  color: number;
  retentionFactor: number; // k'
  retentionTime: number; // minutes
  peakWidth: number;
}

export const SAMPLE_MIXTURES: Record<ChromatographyType, SampleComponent[]> = {
  hplc: [
    { name: 'Uracil (Void Marker t_0)', color: 0x94a3b8, retentionFactor: 0.1, retentionTime: 1.2, peakWidth: 0.15 },
    { name: 'Acetaminophen (Paracetamol)', color: 0x38bdf8, retentionFactor: 1.8, retentionTime: 3.4, peakWidth: 0.25 },
    { name: 'Aspirin (Acetylsalicylic Acid)', color: 0xf59e0b, retentionFactor: 3.5, retentionTime: 5.4, peakWidth: 0.35 },
    { name: 'Caffeine', color: 0x10b981, retentionFactor: 5.2, retentionTime: 7.5, peakWidth: 0.45 },
  ],
  gc: [
    { name: 'Methane (Void Marker t_0)', color: 0x94a3b8, retentionFactor: 0.1, retentionTime: 0.8, peakWidth: 0.10 },
    { name: 'n-Octane (C₈H₁₈)', color: 0x38bdf8, retentionFactor: 1.5, retentionTime: 2.5, peakWidth: 0.20 },
    { name: 'n-Decane (C₁₀H₂₂)', color: 0xf59e0b, retentionFactor: 3.2, retentionTime: 4.8, peakWidth: 0.30 },
    { name: 'n-Dodecane (C₁₂H₂₆)', color: 0x10b981, retentionFactor: 5.5, retentionTime: 7.2, peakWidth: 0.40 },
  ],
};

export class ChromatographyScene extends BaseSimulation {
  private instrumentGroup = new THREE.Group();
  private columnGroup = new THREE.Group();
  private sampleBandsGroup = new THREE.Group();
  private detectorGroup = new THREE.Group();

  // Active operating parameters
  private activeType: ChromatographyType = 'hplc';
  private flowRateMlMin = 1.0;
  private ovenTemperatureC = 120;
  private separationProgress = 0.0; // 0 to 1

  public get flowRate(): number {
    return this.flowRateMlMin;
  }

  public get ovenTemp(): number {
    return this.ovenTemperatureC;
  }

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.instrumentGroup = this.instrumentGroup || new THREE.Group();
    this.columnGroup = this.columnGroup || new THREE.Group();
    this.sampleBandsGroup = this.sampleBandsGroup || new THREE.Group();
    this.detectorGroup = this.detectorGroup || new THREE.Group();

    this.scene.add(this.instrumentGroup);
    this.scene.add(this.columnGroup);
    this.scene.add(this.sampleBandsGroup);
    this.scene.add(this.detectorGroup);

    this.buildCurrentStageView();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-instrument-overview',
        index: 0,
        title: 'Stage 1: Chromatographic Instrumentation Overview',
        shortDescription: 'Inspect mobile phase delivery, injection valve, column compartment, and detector.',
        detailedExplanation:
          'Chromatography is a physical method of separation in which components distribute between two phases: a stationary phase and a mobile phase. ' +
          'In HPLC, liquid mobile phase is pumped under ultra-high pressure (up to 400 bar / 6,000 psi) through a densely packed column of 3–5 μm silica beads. ' +
          'In GC, an inert carrier gas (He, N₂) carries vaporized volatile analytes through a narrow capillary column inside a precision convection oven.',
        chemicalReactions: [
          'Capacity Factor: k\' = (t_R - t_0) / t_0 = (K_D · V_s) / V_m',
          'van Deemter Equation: H = A + B/u + C·u (Plate Height vs Linear Velocity)',
          'Column Resolution: R_s = 2(t_R2 - t_R1) / (W₁ + W₂) ≥ 1.5 (Baseline Separation)',
        ],
        keyTerminology: [
          { term: 'Mobile Phase', definition: 'Solvent or carrier gas percolating through the system carrying analyte components.' },
          { term: 'Stationary Phase', definition: 'Immobilized material (silica micro-particles or bonded liquid film) providing retention sites.' },
        ],
        highlightComponentIds: ['hplc-pump', 'chrom-column', 'injection-valve'],
        recommendedCamera: { position: [0, 3.0, 6.2], target: [0, 0, 0] },
      },
      {
        id: 'stage-sample-injection',
        index: 1,
        title: 'Stage 2: Sample Introduction & Injection Port (Rheodyne Valve)',
        shortDescription: 'Precision 20 μL sample loop injects analyte plug without interrupting continuous mobile flow.',
        detailedExplanation:
          'Accurate separation requires introducing the sample mixture as an infinitely narrow spatial plug. ' +
          'A 6-port Rheodyne switching valve allows the sample loop (typically 10–20 μL) to be filled at atmospheric pressure (Load position), ' +
          'before instantly switching in-line with the high-pressure mobile phase stream (Inject position) to sweep the mixture onto the column head without pressure drop.',
        chemicalReactions: [
          'Injection Volume: 10–20 μL (HPLC) or 1 μL split/splitless (GC)',
          'Band Broadening at Injection: σ_inj² = V_inj² / 12',
        ],
        keyTerminology: [
          { term: 'Sample Loop', definition: 'Calibrated stainless steel loop delivering precise, reproducible sample volumes.' },
          { term: 'Band Broadening', definition: 'Dispersion and spreading of solute zones caused by eddy diffusion, longitudinal diffusion, and mass transfer resistance.' },
        ],
        highlightComponentIds: ['injection-valve'],
        recommendedCamera: { position: [-2.0, 2.5, 4.0], target: [-1.5, 0, 0] },
      },
      {
        id: 'stage-column-partition',
        index: 2,
        title: 'Stage 3: Stationary Phase Partition & Microscopic Interaction',
        shortDescription: 'Cutaway view of porous C18 silica beads and differential hydrophobic partition.',
        detailedExplanation:
          'Inside an HPLC column, spherical silica micro-particles (3–5 μm diameter) are covalently bonded with octadecyl (C18) hydrophobic alkyl chains. ' +
          'In reverse-phase chromatography (RP-HPLC), polar analytes (e.g. Paracetamol) have low partition coefficient K_D and elute rapidly. ' +
          'Non-polar analytes (e.g. Caffeine) interact strongly with C18 chains through hydrophobic interactions, spending more time in the stationary phase and eluting later.',
        chemicalReactions: [
          'Partition Coefficient: K_D = C_stationary / C_mobile',
          'Reverse-Phase Order: Most Polar Elutes First → Least Polar Elutes Last',
          'C18 Chemistry: Silica–O–Si(CH₃)₂–(CH₂)₁₇–CH₃ (Octadecylsilane)',
        ],
        keyTerminology: [
          { term: 'Reverse-Phase (RP)', definition: 'Chromatographic system using non-polar stationary phase (C18) and polar mobile phase (Water/Methanol).' },
          { term: 'Partition Coefficient (K_D)', definition: 'Thermodynamic equilibrium ratio of solute concentration between stationary and mobile phases.' },
        ],
        highlightComponentIds: ['c18-silica-beads', 'chrom-column'],
        recommendedCamera: { position: [0, 2.2, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-band-separation-migration',
        index: 3,
        title: 'Stage 4: Progressive Band Separation Along Column Length',
        shortDescription: 'Watch single mixed sample plug resolve into discrete, well-separated chromatic bands.',
        detailedExplanation:
          'As the mixture travels down the column, differences in migration velocities (u_i = u / (1 + k\'_i)) ' +
          'cause the spatial centers of each component zone to separate increasingly. ' +
          'Simultaneously, zone broadening (described by the van Deemter equation: H = A + B/u + C·u) occurs due to eddy diffusion (A), ' +
          'longitudinal diffusion (B), and resistance to mass transfer (C). A successful method achieves baseline resolution (R_s ≥ 1.5).',
        chemicalReactions: [
          'Migration Velocity: u_i = u / (1 + k\'_i) = L / t_R',
          'Theoretical Plates: N = 16 (t_R / W)² = 5.54 (t_R / W_0.5)²',
          'Plate Height: H = L / N (Lower H = Higher column efficiency)',
        ],
        keyTerminology: [
          { term: 'Theoretical Plate (N)', definition: 'Measure of column separation efficiency; higher plate counts produce sharper, narrower chromatographic peaks.' },
          { term: 'Peak Resolution (R_s)', definition: 'Quantitative measure of separation completeness between two adjacent chromatographic peaks.' },
        ],
        highlightComponentIds: ['sample-band-1', 'sample-band-2', 'sample-band-3'],
        recommendedCamera: { position: [0, 2.8, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-detection-chromatogram',
        index: 4,
        title: 'Stage 5: Detector Response & Synchronized Chromatogram Generation',
        shortDescription: 'Separated bands enter flow cell, generating real-time peaks on the student chromatogram.',
        detailedExplanation:
          'When an analyte band leaves the column outlet, it enters the optical micro-flow cell of a UV-Vis detector (HPLC) or the hydrogen-air flame of an FID (GC). ' +
          'The detector transduces analyte concentration into an electrical millivolt signal. ' +
          'Plotting signal intensity versus elapsed time generates the final Chromatogram. ' +
          'Retention time (t_R) provides qualitative identification; integrated peak area is directly proportional to analyte concentration (quantitative analysis).',
        chemicalReactions: [
          'Beer-Lambert Detection: Absorbance A = ε · b · C (Linear dynamic range > 10⁴)',
          'Quantitative Analysis: C_analyte = (Area_sample / Area_standard) · C_standard',
          'FID Mechanism: Organic carbon pyrolysis generates CHO⁺ ions collected at polarizing electrode',
        ],
        keyTerminology: [
          { term: 'Retention Time (t_R)', definition: 'Time elapsed between sample injection and maximum detector response for a given component.' },
          { term: 'Peak Area', definition: 'Integrated signal-time area directly proportional to the mass of analyte injected.' },
        ],
        highlightComponentIds: ['detector-flowcell', 'chromatogram-display'],
        recommendedCamera: { position: [2.5, 2.5, 4.8], target: [1.5, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('hplc-pump', {
      id: 'hplc-pump',
      name: 'High-Pressure Dual-Piston Isocratic/Gradient Pump',
      category: 'pumping',
      material: 'Titanium / Sapphire Piston Heads',
      scientificRole: 'Delivers pulse-free mobile phase at flow rates of 0.1–5.0 mL/min against backpressures up to 400 bar.',
      specifications: 'Pressure Limit: 400 bar (6,000 psi) · Flow Precision: < 0.1% RSD',
      anchorPosition: [-2.5, 0.5, 0],
    });

    this.components.set('injection-valve', {
      id: 'injection-valve',
      name: '6-Port Rheodyne Injection Valve',
      category: 'injector',
      material: 'Passivated Stainless Steel / Ceramic Rotor',
      scientificRole: 'Switches calibrated 20 μL sample loop into high-pressure stream with zero flow interruption.',
      specifications: 'Loop Volume: 20 μL · Max Pressure: 400 bar',
      anchorPosition: [-1.4, 0.5, 0],
    });

    this.components.set('chrom-column', {
      id: 'chrom-column',
      name: 'Analytical Chromatography Column (C18 RP-HPLC)',
      category: 'separation',
      material: '316L Stainless Steel Housing (250 × 4.6 mm ID)',
      scientificRole: 'Houses packed stationary phase bed where differential molecular partition occurs.',
      specifications: 'Dimensions: 250 mm × 4.6 mm · Packing: 5 μm Porous Silica (100 Å pore size)',
      anchorPosition: [0, 0.5, 0],
    });

    this.components.set('c18-silica-beads', {
      id: 'c18-silica-beads',
      name: 'Porous C18 Octadecylsilane Silica Particles',
      category: 'stationary-phase',
      material: 'High-Purity Spherical Silica with C18 Bonded Phase',
      scientificRole: 'Provides dense hydrophobic brush for reverse-phase partitioning of organic molecules.',
      specifications: 'Particle Diameter: 5 μm · Specific Surface Area: ~300 m²/g · Carbon Load: ~18%',
      anchorPosition: [0, 0.5, 0],
    });

    this.components.set('detector-flowcell', {
      id: 'detector-flowcell',
      name: 'UV-Vis Photodiode Array (PDA) Flow Cell',
      category: 'detection',
      material: 'Quartz Optical Windows with 10 mm Flow Path',
      scientificRole: 'Measures continuous optical absorbance at specified wavelength (e.g. 254 nm) according to Beer-Lambert law.',
      specifications: 'Flow Cell Volume: 8 μL · Optical Path Length: 10 mm · Wavelength: 190–800 nm',
      anchorPosition: [2.2, 0.5, 0],
    });
  }

  public setChromatographyType(type: ChromatographyType): void {
    this.activeType = type;
    this.buildCurrentStageView();
  }

  public setFlowRate(rate: number): void {
    this.flowRateMlMin = rate;
  }

  protected onStageChanged(_stageIndex: number): void {
    this.separationProgress = 0.0;
    this.buildCurrentStageView();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentStageView();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentStageView();
  }

  private clearGroups(): void {
    const groups = [this.instrumentGroup, this.columnGroup, this.sampleBandsGroup, this.detectorGroup];
    for (const g of groups) {
      g?.clear?.();
    }
  }

  private buildCurrentStageView(): void {
    this.clearGroups();

    const stage = this.currentStageIndex;

    // 1. Build Base Instrument Bench (Pump, Rheodyne, Column, Detector)
    this.buildInstrumentBench();

    // 2. Stage-specific visualizations
    if (stage === 1) {
      // Highlight Rheodyne valve & sample loop
      this.buildSampleInjectionHighlight();
    } else if (stage === 2) {
      // Cutaway inside column showing C18 silica beads
      this.buildC18MicroscopicCutaway();
    } else if (stage >= 3) {
      // Migrating and separating sample bands
      this.buildMigratingBands();
    }
  }

  // Instrument bench (pump, injector, column, detector)
  private buildInstrumentBench(): void {
    // Laboratory benchtop
    const benchGeo = new THREE.BoxGeometry(6.5, 0.25, 2.5);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.7, 0);
    this.instrumentGroup.add(bench);

    // Left: Pump module
    const pumpGeo = new THREE.BoxGeometry(1.2, 1.8, 1.4);
    const pumpMat = new THREE.MeshPhysicalMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.position.set(-2.5, 0.3, 0);
    pump.userData = { componentId: 'hplc-pump' };
    this.instrumentGroup.add(pump);

    // Solvent bottles on top of pump
    for (let i = 0; i < 2; i++) {
      const bottleGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 16);
      const bottleMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        transmission: 0.8,
      });
      const bottle = new THREE.Mesh(bottleGeo, bottleMat);
      bottle.position.set(-2.7 + i * 0.45, 1.5, 0);
      this.instrumentGroup.add(bottle);
    }

    // Rheodyne injection valve
    const valveGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.4, 24);
    const valveMat = new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const valve = new THREE.Mesh(valveGeo, valveMat);
    valve.rotation.z = Math.PI / 2;
    valve.position.set(-1.4, 0.4, 0);
    valve.userData = { componentId: 'injection-valve' };
    this.instrumentGroup.add(valve);

    // Stainless steel tubing from pump to valve
    const tube1 = this.createTube(new THREE.Vector3(-1.9, 0.4, 0), new THREE.Vector3(-1.4, 0.4, 0), 0.03, 0x64748b);
    this.instrumentGroup.add(tube1);

    // Center: HPLC Column (polished stainless steel cylinder)
    const colLen = 2.4;
    const colRadius = 0.22;
    const colGeo = new THREE.CylinderGeometry(colRadius, colRadius, colLen, 24);
    const colMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.8,
    });
    const colMesh = new THREE.Mesh(colGeo, colMat);
    colMesh.rotation.z = Math.PI / 2;
    colMesh.position.set(0.3, 0.4, 0);
    colMesh.userData = { componentId: 'chrom-column' };
    this.columnGroup.add(colMesh);

    // Tubing from valve to column
    const tube2 = this.createTube(new THREE.Vector3(-1.4, 0.4, 0), new THREE.Vector3(-0.9, 0.4, 0), 0.03, 0x64748b);
    this.instrumentGroup.add(tube2);

    // Right: Detector module (PDA / UV-Vis)
    const detGeo = new THREE.BoxGeometry(1.2, 1.8, 1.4);
    const detMat = new THREE.MeshPhysicalMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
    const detector = new THREE.Mesh(detGeo, detMat);
    detector.position.set(2.4, 0.3, 0);
    detector.userData = { componentId: 'detector-flowcell' };
    this.detectorGroup.add(detector);

    // Tubing from column to detector
    const tube3 = this.createTube(new THREE.Vector3(1.5, 0.4, 0), new THREE.Vector3(1.8, 0.4, 0), 0.03, 0x64748b);
    this.instrumentGroup.add(tube3);

    this.annotations.add({
      id: 'ann-hplc-column',
      text: 'Analytical C18 RP Column (250 × 4.6 mm, 5 μm)',
      position: new THREE.Vector3(0.3, 1.0, 0),
      priority: 1,
    });
  }

  // Stage 1: Highlight injection loop and syringe
  private buildSampleInjectionHighlight(): void {
    // 20 uL stainless steel loop coil on front of valve
    const loopCurve = new THREE.TorusGeometry(0.24, 0.03, 16, 32);
    const loopMat = new THREE.MeshPhysicalMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 });
    const loop = new THREE.Mesh(loopCurve, loopMat);
    loop.position.set(-1.4, 0.4, 0.28);
    this.instrumentGroup.add(loop);

    this.annotations.add({
      id: 'ann-inj-loop',
      text: '20 μL Precision Sample Loop (Inject Mode: Switched In-line)',
      position: new THREE.Vector3(-1.4, 1.1, 0),
      priority: 1,
    });
  }

  // Stage 2: C18 Silica beads cutaway
  private buildC18MicroscopicCutaway(): void {
    // Semi-transparent column window
    const colCutGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.6, 24);
    const colCutMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.8,
      depthWrite: false,
    });
    const cutMesh = new THREE.Mesh(colCutGeo, colCutMat);
    cutMesh.rotation.z = Math.PI / 2;
    cutMesh.position.set(0.3, 0.4, 0);
    this.columnGroup.add(cutMesh);

    // Porous silica beads inside
    const beadGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const beadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });

    for (let x = -0.6; x <= 1.2; x += 0.15) {
      for (let y = 0.26; y <= 0.54; y += 0.14) {
        for (let z = -0.14; z <= 0.14; z += 0.14) {
          const bead = new THREE.Mesh(beadGeo, beadMat);
          bead.position.set(x + (Math.random() - 0.5) * 0.05, y, z);
          bead.userData = { componentId: 'c18-silica-beads' };
          this.columnGroup.add(bead);
        }
      }
    }

    this.annotations.add({
      id: 'ann-c18-packing',
      text: '5 μm Spherical Silica Beads with Hydrophobic C18 Chains',
      position: new THREE.Vector3(0.3, 1.1, 0),
      priority: 1,
    });
  }

  // Stage 3 & 4: Migrating separated bands along the column
  private buildMigratingBands(): void {
    // Transparent column to view internal migration
    const colCutGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.3, 24);
    const colCutMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.7,
      depthWrite: false,
    });
    const cutMesh = new THREE.Mesh(colCutGeo, colCutMat);
    cutMesh.rotation.z = Math.PI / 2;
    cutMesh.position.set(0.3, 0.4, 0);
    this.columnGroup.add(cutMesh);

    const components = SAMPLE_MIXTURES[this.activeType];
    const colStartX = -0.8;
    const colLength = 2.2;

    // Position bands based on retention factors
    // Component 0 moves fastest (lowest k'), component 3 moves slowest (highest k')
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      if (!comp) continue;
      // Simulated fraction traveled along column: inverse of retention factor
      const speedFrac = 1.0 / (1.0 + comp.retentionFactor * 0.4);
      const bandX = colStartX + colLength * Math.min(0.95, speedFrac * 1.2);

      const bandWidth = 0.12 + comp.peakWidth * 0.15;
      const bandGeo = new THREE.CylinderGeometry(0.20, 0.20, bandWidth, 16);
      const bandMat = new THREE.MeshPhysicalMaterial({
        color: comp.color,
        transparent: true,
        opacity: 0.85,
        emissive: comp.color,
        emissiveIntensity: 0.3,
      });
      const bandMesh = new THREE.Mesh(bandGeo, bandMat);
      bandMesh.rotation.z = Math.PI / 2;
      bandMesh.position.set(bandX, 0.4, 0);
      bandMesh.userData = { componentId: `sample-band-${i + 1}` };
      this.sampleBandsGroup.add(bandMesh);

      // Label on highest priority bands
      if (i === 1 || i === 3) {
        this.annotations.add({
          id: `ann-band-${i}`,
          text: `${comp.name} (t_R = ${comp.retentionTime} min)`,
          position: new THREE.Vector3(bandX, 0.9, 0),
          priority: 2,
        });
      }
    }
  }

  private createTube(p1: THREE.Vector3, p2: THREE.Vector3, radius: number, color: number): THREE.Mesh {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(radius, radius, len, 12);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.copy(p1).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return mesh;
  }

  protected updateSimulation(delta: number): void {
    if (this.isPlaying) {
      this.separationProgress = (this.separationProgress + delta * 0.25 * this.playbackSpeed) % 1.0;
    }
  }
}
