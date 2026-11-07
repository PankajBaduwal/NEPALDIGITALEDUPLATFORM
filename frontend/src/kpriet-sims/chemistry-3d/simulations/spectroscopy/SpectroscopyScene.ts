/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 10: Spectroscopy (UV-Vis, IR, and NMR)
 *
 * Demonstrates:
 * - Module A: UV-Vis Spectrophotometry
 *   Deuterium/Tungsten light source, diffraction grating monochromator, dual-beam optical splitter,
 *   10 mm quartz cuvette, photodiode detector, Beer-Lambert Law A = εbc = -log(I/I₀), electronic transitions (π→π*, n→π*).
 * - Module B: Fourier Transform Infrared Spectroscopy (FTIR)
 *   Globar IR source, Michelson interferometer (KBr beam splitter, fixed & moving mirrors),
 *   Molecular vibrational modes: Symmetric stretch (IR inactive in CO₂), Asymmetric stretch (2349 cm⁻¹),
 *   Scissoring bend (667 cm⁻¹), Functional group diagnostic regions.
 * - Module C: Nuclear Magnetic Resonance (¹H NMR)
 *   Superconducting cryomagnet (B₀ = 9.4 T, 400 MHz), Zeeman nuclear spin splitting (α vs β states, ΔE = γħB₀),
 *   90° RF pulse coil, Free Induction Decay (FID), Chemical shift scale (δ in ppm relative to TMS).
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';

export type SpectroscopyTechnique = 'uv-vis' | 'ir' | 'nmr';

export class SpectroscopyScene extends BaseSimulation {
  private opticsGroup = new THREE.Group();
  private sampleGroup = new THREE.Group();
  private detectorGroup = new THREE.Group();
  private vibratingMoleculeGroup = new THREE.Group();
  private raysGroup = new THREE.Group();

  // Active technique and sample
  private activeTechnique: SpectroscopyTechnique = 'uv-vis';
  private vibrationTime = 0.0;

  // Molecular vibration animation nodes for IR
  private irAtomNodes: { mesh: THREE.Mesh; basePos: THREE.Vector3; modeVector: THREE.Vector3 }[] = [];

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.opticsGroup = this.opticsGroup || new THREE.Group();
    this.sampleGroup = this.sampleGroup || new THREE.Group();
    this.detectorGroup = this.detectorGroup || new THREE.Group();
    this.vibratingMoleculeGroup = this.vibratingMoleculeGroup || new THREE.Group();
    this.raysGroup = this.raysGroup || new THREE.Group();

    this.scene.add(this.opticsGroup);
    this.scene.add(this.sampleGroup);
    this.scene.add(this.detectorGroup);
    this.scene.add(this.vibratingMoleculeGroup);
    this.scene.add(this.raysGroup);

    this.buildCurrentStageView();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-uv-vis-optics',
        index: 0,
        title: 'Stage 1: UV-Vis Spectrophotometer — Optical Path & Dual-Beam Dispersion',
        shortDescription: 'Follow the monochromatic light beam through reference and sample quartz cuvettes.',
        detailedExplanation:
          'UV-Vis spectroscopy probes electronic transitions between molecular orbitals (HOMO to LUMO). ' +
          'A continuum light source (Deuterium D₂ for UV 190–380 nm, Tungsten-halogen for visible 380–900 nm) is dispersed into monochromatic wavelengths by a diffraction grating. ' +
          'A rotating chopper splits the beam alternately through a reference cell (pure solvent) and sample cell (cuvette pathlength b = 1.0 cm). ' +
          'The photodiode detector compares transmitted intensity I to incident intensity I₀ according to the Beer-Lambert Law.',
        chemicalReactions: [
          'Beer-Lambert Law: A = ε · b · c = -log₁₀(I / I₀) = -log₁₀(T)',
          'Transmittance: %T = (I / I₀) · 100%',
          'Electronic Transitions: π → π* (Conjugated chromophores) and n → π* (Carbonyl lone pairs)',
        ],
        keyTerminology: [
          { term: 'Molar Absorptivity (ε)', definition: 'Intrinsic probability of electronic photon absorption by a molecule at wavelength λ (units: L·mol⁻¹·cm⁻¹).' },
          { term: 'Chromophore', definition: 'Conjugated molecular functional group capable of absorbing electromagnetic radiation in UV or visible region.' },
        ],
        highlightComponentIds: ['light-source', 'monochromator-grating', 'quartz-cuvette'],
        recommendedCamera: { position: [0, 3.2, 5.8], target: [0, 0, 0] },
      },
      {
        id: 'stage-beer-lambert-absorption',
        index: 1,
        title: 'Stage 2: Beer-Lambert Law & Electronic Absorption Mechanics',
        shortDescription: 'Quantify linear relation between absorbance and concentration A = ε · b · c.',
        detailedExplanation:
          'The fundamental law of spectrophotometric quantification states that absorbance is directly proportional to both ' +
          'the molar absorptivity (ε), the optical path length (b), and the solute molar concentration (c). ' +
          'Deviations from linearity occur at high concentrations (c > 0.01 M) due to electrostatic molecular interactions, ' +
          'or due to polychromatic stray light and chemical equilibria (e.g. pH-dependent acid-base dissociation).',
        chemicalReactions: [
          'Linear Range: 0.1 < Absorbance < 1.5 (Optimum photometric accuracy)',
          'Hypsochromic (Blue) Shift: Shift of absorption λ_max to shorter wavelength',
          'Bathochromic (Red) Shift: Shift of absorption λ_max to longer wavelength (e.g. extended conjugation)',
        ],
        keyTerminology: [
          { term: 'Optical Path Length (b)', definition: 'Internal width of the quartz cuvette traversed by the analytical light beam (standard 1.00 cm).' },
          { term: 'Deviations from Beer\'s Law', definition: 'Non-linear calibration curves caused by high concentration oligomerization, stray light, or chemical dissociation.' },
        ],
        highlightComponentIds: ['quartz-cuvette', 'photodiode-detector'],
        recommendedCamera: { position: [1.5, 2.5, 4.2], target: [0.5, 0, 0] },
      },
      {
        id: 'stage-ftir-molecular-vibrations',
        index: 2,
        title: 'Stage 3: FTIR Spectroscopy — Dipole Modulation & Molecular Vibrational Modes',
        shortDescription: 'Animate IR-active asymmetric stretch (2349 cm⁻¹) vs IR-inactive symmetric stretch.',
        detailedExplanation:
          'Infrared radiation (4000 to 400 cm⁻¹) excites vibrational energy levels in molecules. ' +
          'The fundamental selection rule dictates that a vibrational mode is IR-active only if it produces a periodic change in the molecular dipole moment (dμ/dq ≠ 0). ' +
          'In linear carbon dioxide (O=C=O), the symmetric stretch leaves the net dipole moment strictly zero at all times and is therefore IR-inactive (Raman active). ' +
          'The asymmetric stretch causes alternating net dipole moments, creating intense absorption at 2349 cm⁻¹.',
        chemicalReactions: [
          'Infrared Selection Rule: (∂μ / ∂q) ≠ 0 (Vibration must change molecular dipole moment)',
          'Harmonic Oscillator Frequency: ν̃ = (1 / 2πc) · √(k / μ_red)',
          'Reduced Mass: μ_red = (m₁ · m₂) / (m₁ + m₂)',
        ],
        keyTerminology: [
          { term: 'Wavenumber (ν̃)', definition: 'Number of wave cycles per centimeter: ν̃ = 1/λ = ν/c (units: cm⁻¹).' },
          { term: 'Hooke\'s Law for Bonds', definition: 'Vibrational frequency scales with bond spring constant k (triple > double > single) and inversely with reduced mass.' },
        ],
        highlightComponentIds: ['vibrating-co2', 'ir-source'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-ftir-functional-groups',
        index: 3,
        title: 'Stage 4: FTIR Functional Group Diagnostic Regions',
        shortDescription: 'Examine characteristic absorption frequencies: O–H (3300 cm⁻¹), C=O (1715 cm⁻¹), fingerprint region.',
        detailedExplanation:
          'The mid-IR spectrum is divided into two major diagnostic zones: ' +
          '1. The Functional Group Region (4000–1500 cm⁻¹): High-energy stretches characteristic of specific covalent bonds: ' +
          'O–H/N–H stretch (3200–3600 cm⁻¹), sp C–H (3300 cm⁻¹), sp² C–H (3050 cm⁻¹), sp³ C–H (2950 cm⁻¹), C≡C/C≡N (2250 cm⁻¹), and intense carbonyl C=O (1715 cm⁻¹). ' +
          '2. The Fingerprint Region (1500–400 cm⁻¹): Complex bending and skeletal vibrations unique to every individual chemical compound.',
        chemicalReactions: [
          'O–H (Hydrogen Bonded): Broad peak at 3200–3550 cm⁻¹',
          'C=O (Carbonyl): Extremely strong, sharp peak at 1715 cm⁻¹ (dipole derivative is large)',
          'C–O (Single Bond): 1050–1250 cm⁻¹ (Fingerprint region)',
        ],
        keyTerminology: [
          { term: 'Functional Group Region', definition: 'High-frequency spectral region (4000–1500 cm⁻¹) diagnostic of specific covalent bond types.' },
          { term: 'Fingerprint Region', definition: 'Spectral region below 1500 cm⁻¹ where complex skeletal vibrations provide unique identification.' },
        ],
        highlightComponentIds: ['michelson-interferometer'],
        recommendedCamera: { position: [0, 2.8, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-nmr-cryomagnet-resonance',
        index: 5,
        title: 'Stage 5: Nuclear Magnetic Resonance (¹H NMR) — Zeeman Splitting & RF Resonance',
        shortDescription: 'Nuclear spins align with superconducting magnetic field B₀ and absorb radiofrequency pulses.',
        detailedExplanation:
          'Atomic nuclei with non-zero spin quantum numbers (such as ¹H and ¹³C with I = 1/2) possess a magnetic dipole moment μ = γħI. ' +
          'In a strong external magnetic field (B₀ = 9.4 Tesla), the nuclear spin states split into two non-degenerate Zeeman energy levels: ' +
          'the lower-energy α-spin state (m_I = +1/2, aligned with B₀) and the higher-energy β-spin state (m_I = -1/2, opposed to B₀). ' +
          'A radiofrequency (RF) pulse at the Larmor frequency (ν₀ = γB₀/2π = 400 MHz for ¹H at 9.4 T) induces resonance transitions, yielding chemical shifts (δ in ppm).',
        chemicalReactions: [
          'Larmor Precession: ω₀ = γ · B₀ (or ν₀ = γB₀ / 2π = 400.13 MHz for ¹H at 9.4 T)',
          'Zeeman Energy Gap: ΔE = γ · ħ · B₀ = h · ν₀',
          'Chemical Shift Scale: δ (ppm) = [(ν_sample - ν_TMS) / ν_spectrometer] · 10⁶',
        ],
        keyTerminology: [
          { term: 'Zeeman Splitting', definition: 'Lifting of nuclear spin degeneracy in an external magnetic field B₀ into discrete energy levels.' },
          { term: 'Chemical Shift (δ)', definition: 'Resonance frequency displacement caused by diamagnetic shielding of surrounding electron clouds.' },
          { term: 'Larmor Frequency', definition: 'Rate of nuclear magnetic moment precession about the primary external magnetic field vector.' },
        ],
        highlightComponentIds: ['superconducting-magnet', 'nmr-sample-tube'],
        recommendedCamera: { position: [2.5, 2.8, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('light-source', {
      id: 'light-source',
      name: 'Dual Continuum Light Source (D₂ + Tungsten)',
      category: 'optics',
      material: 'Deuterium Arc Lamp (UV) & Tungsten Halogen Filament (Vis)',
      scientificRole: 'Emits smooth continuum electromagnetic spectrum spanning 190 nm to 900 nm.',
      specifications: 'Wavelength Range: 190–900 nm · Power: 30 W',
      anchorPosition: [-2.6, 0.4, 0],
    });

    this.components.set('monochromator-grating', {
      id: 'monochromator-grating',
      name: 'Czerny-Turner Holographic Diffraction Grating',
      category: 'optics',
      material: 'Blazed Holographic Ruled Surface (1200 grooves/mm)',
      scientificRole: 'Disperses polychromatic light and isolates monochromatic wavelength with < 1.0 nm bandwidth.',
      specifications: 'Groove Density: 1200 lines/mm · Spectral Bandwidth: 1.0 nm',
      anchorPosition: [-1.4, 0.4, 0],
    });

    this.components.set('quartz-cuvette', {
      id: 'quartz-cuvette',
      name: 'Standard 10 mm Optical Quartz Cuvette',
      category: 'sample-cell',
      material: 'Suprasil Far-UV Fused Silica (Transparent down to 190 nm)',
      scientificRole: 'Holds liquid sample with precisely calibrated 1.000 cm optical pathlength.',
      specifications: 'Pathlength b = 10.00 ± 0.01 mm · Volume: 3.5 mL · Transmission: > 80% at 200 nm',
      anchorPosition: [0.2, 0.4, 0],
    });

    this.components.set('photodiode-detector', {
      id: 'photodiode-detector',
      name: 'Silicon Photodiode Array (PDA) Detector',
      category: 'detection',
      material: 'Linear Array of 1024 Silicon p-n Junctions',
      scientificRole: 'Converts transmitted photon flux into micro-ampere photocurrent for logarithmic absorbance calculation.',
      specifications: 'Dynamic Range: 10⁴ · Dark Current: < 1 pA',
      anchorPosition: [2.0, 0.4, 0],
    });

    this.components.set('vibrating-co2', {
      id: 'vibrating-co2',
      name: 'Vibrating Carbon Dioxide Molecule (CO₂)',
      category: 'molecule',
      material: 'Triatomic Linear Molecule (O=C=O)',
      scientificRole: 'Demonstrates IR-active asymmetric stretch (2349 cm⁻¹) vs IR-inactive symmetric stretch.',
      specifications: 'Equilibrium Bond Length: 1.16 Å · Point Group: D_∞h',
      anchorPosition: [0, 0.5, 0],
    });

    this.components.set('superconducting-magnet', {
      id: 'superconducting-magnet',
      name: 'Superconducting Solenoid Magnet (9.4 Tesla / 400 MHz)',
      category: 'magnet',
      material: 'Niobium-Titanium (NbTi) Wire submerged in Liquid Helium (4.2 K)',
      scientificRole: 'Generates ultra-stable homogeneous magnetic field B₀ creating Zeeman spin-state splitting.',
      specifications: 'Field Strength: 9.400 Tesla · Homogeneity: < 0.1 ppb · Helium Cryostat',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('nmr-sample-tube', {
      id: 'nmr-sample-tube',
      name: 'Precision 5 mm Pyrex NMR Sample Tube',
      category: 'sample-cell',
      material: 'Precision Thin-Walled Borosilicate Glass',
      scientificRole: 'Holds deuterated solution (CDCl₃ / D₂O) spun at 20 Hz to average magnetic field inhomogeneities.',
      specifications: 'Diameter: 5.0 mm OD · Wall Thickness: 0.38 mm · Spin Rate: 20 Hz',
      anchorPosition: [0, 0.5, 0],
    });
  }

  public setTechnique(technique: SpectroscopyTechnique): void {
    this.activeTechnique = technique;
    if (technique === 'uv-vis') {
      this.currentStageIndex = 0;
    } else if (technique === 'ir') {
      this.currentStageIndex = 2;
    } else {
      this.currentStageIndex = 4;
    }
    this.buildCurrentStageView();
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex <= 1) {
      this.activeTechnique = 'uv-vis';
    } else if (stageIndex <= 3) {
      this.activeTechnique = 'ir';
    } else {
      this.activeTechnique = 'nmr';
    }
    this.buildCurrentStageView();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentStageView();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentStageView();
  }

  private clearGroups(): void {
    const groups = [this.opticsGroup, this.sampleGroup, this.detectorGroup, this.vibratingMoleculeGroup, this.raysGroup];
    for (const g of groups) {
      g?.clear?.();
    }
    this.irAtomNodes = [];
  }

  private buildCurrentStageView(): void {
    this.clearGroups();

    if (this.activeTechnique === 'uv-vis') {
      this.buildUVVisOpticalBench();
    } else if (this.activeTechnique === 'ir') {
      this.buildFTIRVibrationalView();
    } else {
      this.buildNMRCryomagnetView();
    }
  }

  // UV-Vis: Lamp -> Grating -> Cuvette -> Detector with visible beam rays
  private buildUVVisOpticalBench(): void {
    // Optical rail bench
    const railGeo = new THREE.BoxGeometry(6.0, 0.15, 1.2);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, -0.6, 0);
    this.opticsGroup.add(rail);

    // 1. Lamp housing
    const lampGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
    const lampMat = new THREE.MeshPhysicalMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(-2.5, 0.3, 0);
    lamp.userData = { componentId: 'light-source' };
    this.opticsGroup.add(lamp);

    // 2. Monochromator diffraction grating
    const gratingGeo = new THREE.BoxGeometry(0.6, 1.0, 0.6);
    const gratingMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4, // Cyan iridescent
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
    });
    const grating = new THREE.Mesh(gratingGeo, gratingMat);
    grating.rotation.y = Math.PI / 6;
    grating.position.set(-1.2, 0.3, 0);
    grating.userData = { componentId: 'monochromator-grating' };
    this.opticsGroup.add(grating);

    // 3. Quartz Cuvette (Sample cell)
    const cuvGeo = new THREE.BoxGeometry(0.4, 1.1, 0.4);
    const cuvMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      transmission: 0.9,
      ior: 1.46, // Quartz IOR
    });
    const cuvette = new THREE.Mesh(cuvGeo, cuvMat);
    cuvette.position.set(0.3, 0.3, 0);
    cuvette.userData = { componentId: 'quartz-cuvette' };
    this.sampleGroup.add(cuvette);

    // Liquid sample inside cuvette (amber colored)
    const liqGeo = new THREE.BoxGeometry(0.32, 0.85, 0.32);
    const liqMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      transmission: 0.6,
    });
    const liquid = new THREE.Mesh(liqGeo, liqMat);
    liquid.position.set(0.3, 0.2, 0);
    this.sampleGroup.add(liquid);

    // 4. Photodiode Detector
    const detGeo = new THREE.BoxGeometry(0.7, 1.1, 0.7);
    const detMat = new THREE.MeshPhysicalMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const detector = new THREE.Mesh(detGeo, detMat);
    detector.position.set(2.0, 0.3, 0);
    detector.userData = { componentId: 'photodiode-detector' };
    this.detectorGroup.add(detector);

    // Optical light beam rays (glowing cyan line)
    const rayPoints = [
      new THREE.Vector3(-2.1, 0.3, 0),
      new THREE.Vector3(-1.2, 0.3, 0),
      new THREE.Vector3(0.3, 0.3, 0),
      new THREE.Vector3(1.65, 0.3, 0),
    ];
    for (let i = 0; i < rayPoints.length - 1; i++) {
      const p1 = rayPoints[i];
      const p2 = rayPoints[i + 1];
      if (p1 && p2) {
        const isInsideOrPastCuvette = i >= 2;
        // Ray becomes attenuated (dimmer) after passing through absorbing sample
        const rayColor = isInsideOrPastCuvette ? 0x0284c7 : 0x38bdf8;
        const ray = MolecularBuilder.createBond(p1, p2, isInsideOrPastCuvette ? 0.025 : 0.04, rayColor);
        this.raysGroup.add(ray);
      }
    }

    this.annotations.add({
      id: 'ann-uv-path',
      text: 'Incident Beam I₀ (500 nm) → Sample Cuvette (b = 10 mm) → Transmitted I',
      position: new THREE.Vector3(0, 1.2, 0),
      priority: 1,
    });
  }

  // FTIR: Vibrating CO2 molecule (Asymmetric stretch)
  private buildFTIRVibrationalView(): void {
    // Carbon center
    const cPos = new THREE.Vector3(0, 0.3, 0);
    const cAtom = MolecularBuilder.createAtom('C', cPos, 0.34, 'vibrating-co2') as THREE.Mesh;
    this.vibratingMoleculeGroup.add(cAtom);

    // Two Oxygen atoms
    const o1Pos = new THREE.Vector3(-1.4, 0.3, 0);
    const o2Pos = new THREE.Vector3(1.4, 0.3, 0);
    const o1Atom = MolecularBuilder.createAtom('O', o1Pos, 0.30, 'vibrating-co2') as THREE.Mesh;
    const o2Atom = MolecularBuilder.createAtom('O', o2Pos, 0.30, 'vibrating-co2') as THREE.Mesh;
    this.vibratingMoleculeGroup.add(o1Atom);
    this.vibratingMoleculeGroup.add(o2Atom);

    // C=O double bonds (pairs of cylinders)
    this.vibratingMoleculeGroup.add(MolecularBuilder.createBond(new THREE.Vector3(cPos.x, cPos.y + 0.06, 0), new THREE.Vector3(o1Pos.x, o1Pos.y + 0.06, 0), 0.06, 0xef4444));
    this.vibratingMoleculeGroup.add(MolecularBuilder.createBond(new THREE.Vector3(cPos.x, cPos.y - 0.06, 0), new THREE.Vector3(o1Pos.x, o1Pos.y - 0.06, 0), 0.06, 0xef4444));
    this.vibratingMoleculeGroup.add(MolecularBuilder.createBond(new THREE.Vector3(cPos.x, cPos.y + 0.06, 0), new THREE.Vector3(o2Pos.x, o2Pos.y + 0.06, 0), 0.06, 0xef4444));
    this.vibratingMoleculeGroup.add(MolecularBuilder.createBond(new THREE.Vector3(cPos.x, cPos.y - 0.06, 0), new THREE.Vector3(o2Pos.x, o2Pos.y - 0.06, 0), 0.06, 0xef4444));

    // Register nodes for continuous harmonic stretching
    this.irAtomNodes = [
      { mesh: cAtom, basePos: cPos.clone(), modeVector: new THREE.Vector3(0.2, 0, 0) }, // Carbon moves right
      { mesh: o1Atom, basePos: o1Pos.clone(), modeVector: new THREE.Vector3(0.3, 0, 0) }, // O1 moves right
      { mesh: o2Atom, basePos: o2Pos.clone(), modeVector: new THREE.Vector3(0.3, 0, 0) }, // O2 moves right
    ];

    // Dipole vector arrow above
    const dipoleArrow = MolecularBuilder.createBond(new THREE.Vector3(-0.6, 1.2, 0), new THREE.Vector3(0.6, 1.2, 0), 0.04, 0xec4899);
    this.vibratingMoleculeGroup.add(dipoleArrow);

    this.annotations.add({
      id: 'ann-ir-vibration',
      text: 'CO₂ Asymmetric Stretch (2349 cm⁻¹): (∂μ/∂q) ≠ 0 → IR Active',
      position: new THREE.Vector3(0, 1.6, 0),
      priority: 1,
    });
  }

  // NMR: Superconducting cryomagnet with spinning sample tube
  private buildNMRCryomagnetView(): void {
    // Large cylindrical superconducting cryostat
    const cryoGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.8, 32);
    const cryoMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8, // Polished aluminium cryo-dewar
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.7,
    });
    const cryostat = new THREE.Mesh(cryoGeo, cryoMat);
    cryostat.position.set(0, 0, 0);
    cryostat.userData = { componentId: 'superconducting-magnet' };
    this.opticsGroup.add(cryostat);

    // Vertical bore hole in center
    const boreGeo = new THREE.CylinderGeometry(0.32, 0.32, 3.2, 24);
    const boreMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const bore = new THREE.Mesh(boreGeo, boreMat);
    bore.position.set(0, 0, 0);
    this.opticsGroup.add(bore);

    // 5 mm NMR sample tube protruding from top bore
    const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      transmission: 0.85,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(0, 1.2, 0);
    tube.userData = { componentId: 'nmr-sample-tube' };
    this.sampleGroup.add(tube);

    // Magnetic field vector B₀ arrow (large vertical gold cylinder)
    const b0Arrow = MolecularBuilder.createBond(new THREE.Vector3(2.2, -1.0, 0), new THREE.Vector3(2.2, 1.4, 0), 0.05, 0xfacc15);
    this.opticsGroup.add(b0Arrow);

    this.annotations.add({
      id: 'ann-b0-vector',
      text: 'B₀ = 9.4 Tesla (400 MHz ¹H Larmor Frequency)',
      position: new THREE.Vector3(2.2, 1.8, 0),
      priority: 1,
    });
    this.annotations.add({
      id: 'ann-nmr-cryo',
      text: 'Superconducting Solenoid (Liquid Helium 4.2 K)',
      position: new THREE.Vector3(-1.8, 1.2, 0),
      priority: 2,
    });
  }

  protected updateSimulation(delta: number): void {
    if (this.isPlaying) {
      this.vibrationTime += delta * 6.0 * this.playbackSpeed;

      // Animate FTIR harmonic stretch if nodes present
      if (this.irAtomNodes.length > 0) {
        const displacement = Math.sin(this.vibrationTime);
        for (const node of this.irAtomNodes) {
          node.mesh.position.copy(node.basePos).addScaledVector(node.modeVector, displacement * 0.15);
        }
      }
    }
  }
}
