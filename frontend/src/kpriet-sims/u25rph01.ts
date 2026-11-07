import type { ISimulationDefinition } from './types';

const EP_R2025_SUBJECT_KEYWORDS = [
  'engineering physics',
  'u25rph01',
  'physics',
  'cbcs r2025',
  'b.tech it',
  'u21ph101',
];

function ep3DBoardSimulation(
  id: string,
  unit: number,
  unitTitle: string,
  subtype: string,
  topic: string,
  title: string,
  icon: string,
  shortDescription: string,
  learningObjectives: string[],
  formulaOverview?: string
): ISimulationDefinition {
  return {
    id,
    boardEngine: 'ep',
    simulationSubtype: subtype,
    unit,
    unitTitle,
    topic,
    subjectKeywords: EP_R2025_SUBJECT_KEYWORDS,
    title,
    domain: 'PHYSICS',
    category: 'engineering physics',
    icon,
    shortDescription,
    detailedDescription: `${shortDescription} Comprehensive interactive 3D laboratory with real physical equations, parameter controls, live graphs, and assessment — opens inside the Smart Board and 3D Virtual Lab.`,
    learningObjectives,
    formulaOverview,
    suggestedUnits: [unit],
    smartboardPresetKey: id,
    tags: ['Engineering Physics', 'U25RPH01', '3D Lab', unitTitle, topic, 'Core'],
    parameters: [],
    metrics: [],
    engine: {
      createInitialState: () => ({}),
      update: (state) => state,
      render: (ctx, width, height) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

/**
 * Engineering Physics (U25RPH01) — Complete 3D Simulation Laboratory
 * R2025 CBCS Curriculum: 25 High-Quality Interactive 3D Simulations (5 per unit)
 */
export const U25RPH01_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ==========================================
  // UNIT I — MECHANICAL PROPERTIES OF SOLIDS
  // ==========================================
  ep3DBoardSimulation(
    'u25rph01-sim01-material-testing',
    1,
    'Unit I: Mechanical Properties of Solids',
    'material-testing',
    'Modulus of elasticity, Stress–strain diagram, Elastic and plastic deformation',
    '3D Material Testing Machine: Stress, Strain and Elastic Modulus',
    '🏗️',
    'Inspect a universal testing machine with motorized crosshead, tensile specimen, stress-strain plotting, Young’s modulus derivation, and yield/plastic recovery.',
    [
      'Calculate engineering stress (σ = F/A) and engineering strain (ε = ΔL/L₀)',
      'Derive Young’s modulus (E = σ/ε) from the linear-elastic slope',
      'Distinguish elastic recovery from permanent plastic deformation across metals, polymers, and ceramics',
    ],
    'σ = F / A₀,  ε = ΔL / L₀,  E = σ / ε (Hooke’s Law)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim02-poisson-ratio',
    1,
    'Unit I: Mechanical Properties of Solids',
    'poisson-ratio',
    'Poisson’s ratio, Elastic deformation, Transverse strain',
    '3D Poisson’s Ratio and Transverse Deformation Explorer',
    '📐',
    'Apply axial tension and compression to multi-material prismatic specimens and inspect lateral contraction and expansion with callipers and live strain readouts.',
    [
      'Measure lateral strain (ε_lat = Δd/d₀) and longitudinal strain (ε_long = ΔL/L₀)',
      'Calculate Poisson’s ratio (ν = -ε_lat / ε_long) for steel, rubber, aluminium, and ceramics',
      'Evaluate volumetric strain and bulk behaviour under pure axial loading',
    ],
    'ν = - ε_transverse / ε_longitudinal = - (Δd / d₀) / (ΔL / L₀)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim03-material-comparison',
    1,
    'Unit I: Mechanical Properties of Solids',
    'material-comparison',
    'Stress–strain behaviour in metals, polymers and ceramics',
    '3D Material Comparison: Metals, Polymers and Ceramics',
    '🔬',
    'Compare ductile structural steel, brittle ceramic alumina, and viscoelastic polymer side-by-side on a synchronized triple-loading mechanical test bench.',
    [
      'Contrast ductile yield and necking with brittle cleavage failure',
      'Compare elastic moduli, ultimate tensile strength, and fracture toughness',
      'Explain structural bond characteristics governing mechanical compliance',
    ],
    'U_modulus = ∫ σ dε (Strain Energy Density to Fracture)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim04-cantilever-beam',
    1,
    'Unit I: Mechanical Properties of Solids',
    'cantilever-beam',
    'Bending moment, Cantilever beam, Elastic deflection',
    '3D Cantilever Beam and Bending Moment Laboratory',
    '📏',
    'Load a prismatic cantilever beam with movable point and distributed loads, and inspect real-time Euler-Bernoulli deflection, shear force (SFD), and bending moment (BMD).',
    [
      'Derive maximum tip deflection (δ_max = W L³ / (3 E I)) for a point load',
      'Plot shear force and bending moment diagrams along the beam coordinate x',
      'Investigate the effect of cross-sectional moment of inertia (rectangular vs I-beam)',
    ],
    'EI (d²y/dx²) = M(x),  δ_max = (W · L³) / (3 · E · I)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim05-girders-mems',
    1,
    'Unit I: Mechanical Properties of Solids',
    'girders-mems',
    'Applications in girders and MEMS mechanical structures',
    '3D Girders and MEMS Mechanical Applications',
    '🌉',
    'Bridge macroscale civil structural I-girders with microscale silicon MEMS cantilever accelerometers, examining scaling laws and resonant deflection.',
    [
      'Demonstrate why I-girders maximize second moment of area per unit mass',
      'Calculate resonant frequency and electrostatic pull-in deflection in MEMS micro-cantilevers',
      'Recognize domain validity limits of continuum beam mechanics at microscale dimensions',
    ],
    'I = (b · h³) / 12,  f_0 = (1 / 2π) · √(k / m_eff)'
  ),

  // ==========================================
  // UNIT II — FUNDAMENTALS OF HEAT TRANSFER AND FLUIDS
  // ==========================================
  ep3DBoardSimulation(
    'u25rph01-sim06-heat-transfer',
    2,
    'Unit II: Fundamentals of Heat Transfer and Fluids',
    'heat-transfer',
    'Heat transfer: Conduction, Convection and Radiation',
    '3D Heat Transfer Studio: Conduction, Convection and Radiation',
    '🔥',
    'Explore Fourier conduction across composite slabs, Newton convection in fluid chambers, and Stefan-Boltzmann radiation between radiating surfaces with heat flux vectors.',
    [
      'Compute Fourier steady conduction: Q = -k A (dT/dx)',
      'Calculate convective heat transfer rate: Q = h A (T_s - T_∞)',
      'Verify Stefan-Boltzmann T⁴ radiation emission and net radiative exchange: Q = ε σ A (T₁⁴ - T₂⁴)',
    ],
    'Q_cond = k A ΔT / L,  Q_conv = h A ΔT,  Q_rad = ε σ A (T₁⁴ - T₂⁴)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim07-thermal-expansion-lees-disc',
    2,
    'Unit II: Fundamentals of Heat Transfer and Fluids',
    'thermal-expansion-lees-disc',
    'Thermal expansion, Thermal conductivity, Lee’s disc method',
    '3D Thermal Expansion and Lee’s Disc Method',
    '❄️',
    'Measure linear expansion of solid rods and execute the syllabus Lee’s Disc experiment with steam chamber, bad conductor specimen, and cooling rate calculation.',
    [
      'Determine coefficient of linear thermal expansion: α = ΔL / (L₀ ΔT)',
      'Operate the standard Lee’s disc apparatus to steady-state temperatures T₁ and T₂',
      'Calculate thermal conductivity (k) from cooling curve slope (dT/dt) and disk dimensions',
    ],
    'k = [M s (dT/dt)_{T2} · d (r + 2h)] / [π r² (T₁ - T₂) (2r + 2h)]'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim08-surface-tension',
    2,
    'Unit II: Fundamentals of Heat Transfer and Fluids',
    'surface-tension',
    'Surface tension, Capillary rise, Contact angle',
    '3D Surface Tension and Capillary Phenomena',
    '💧',
    'Inspect capillary rise in vertical tubes of variable bore, observe meniscus curvature and contact angle (θ), and verify Jurin’s law for water and mercury.',
    [
      'Derive Jurin’s capillary rise equation: h = (2 T cos θ) / (ρ g r)',
      'Observe wetting (water/glass, θ < 90°) vs non-wetting capillary depression (mercury/glass, θ > 90°)',
      'Compute liquid surface tension from capillary height and bore radius',
    ],
    'T = (h · ρ · g · r) / (2 · cos θ)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim09-poiseuille-viscosity',
    2,
    'Unit II: Fundamentals of Heat Transfer and Fluids',
    'poiseuille-viscosity',
    'Viscosity, Coefficient of viscosity using Poiseuille’s flow experiment',
    '3D Poiseuille Flow and Viscosity Experiment',
    '🧪',
    'Conduct the official Poiseuille capillary flow laboratory experiment: adjust manometric pressure head, measure efflux volume with a stopwatch, and calculate dynamic viscosity.',
    [
      'Verify Poiseuille’s volumetric flow rate law: V/t = (π P r⁴) / (8 η L)',
      'Measure extreme sensitivity of viscous resistance to tube radius (r⁴ power dependence)',
      'Determine dynamic viscosity (η) of water and glycerin under laminar conditions (Re < 2000)',
    ],
    'η = (π · P · r⁴ · t) / (8 · V · L)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim10-thermal-systems',
    2,
    'Unit II: Fundamentals of Heat Transfer and Fluids',
    'thermal-systems',
    'Solar water heater, Microwave oven, Heat exchangers, Radiators, Cooling towers',
    '3D Thermal Engineering Systems: Industrial Heat Systems',
    '🏭',
    'Operate 5 real-world thermal engineering systems: flat-plate solar collector, microwave dipole cavity, shell-and-tube counterflow heat exchanger, automotive radiator, and evaporative cooling tower.',
    [
      'Analyze solar collector efficiency: η = Q_useful / (I_solar · A)',
      'Evaluate log mean temperature difference (LMTD) and heat exchanger effectiveness',
      'Model sensible heat removal and latent evaporative cooling in industrial cooling towers',
    ],
    'Q = U · A · ΔT_lm,  ΔT_lm = (ΔT₁ - ΔT₂) / ln(ΔT₁ / ΔT₂)'
  ),

  // ==========================================
  // UNIT III — ULTRASONICS AND ITS APPLICATIONS
  // ==========================================
  ep3DBoardSimulation(
    'u25rph01-sim11-ultrasonic-waves',
    3,
    'Unit III: Ultrasonics and Its Applications',
    'ultrasonic-waves',
    'Properties of ultrasonic waves, Ultrasonic wave propagation',
    '3D Ultrasonic Wave Explorer',
    '🔊',
    'Propagate longitudinal acoustic wavefronts above 20 kHz through solid, liquid, and gas media, visualizing particle displacement, pressure crests, and rarefaction nodes.',
    [
      'Verify the fundamental wave equation: v = f · λ across acoustic media',
      'Observe acoustic impedance mismatch and reflection/transmission coefficients at interfaces',
      'Explain directional propagation, high energy density, and negligible diffraction of ultrasonic beams',
    ],
    'v = f · λ,  Z = ρ · v,  R = ((Z₂ - Z₁) / (Z₂ + Z₁))²'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim12-piezo-magneto',
    3,
    'Unit III: Ultrasonics and Its Applications',
    'piezo-magneto',
    'Production of ultrasonic waves: Piezoelectric & Magnetostriction oscillators',
    '3D Piezoelectric and Magnetostriction Oscillators',
    '⚡',
    'Operate side-by-side high-frequency ultrasonic transducers: inverse piezoelectric quartz resonator circuit and Joule magnetostrictive ferromagnetic rod excitation with resonant tuning.',
    [
      'Explain inverse piezoelectric effect in X-cut quartz crystals',
      'Derive resonant acoustic frequency for crystal and ferromagnetic rod: f = (p / 2L) · √(Y / ρ)',
      'Tune tank LC circuit frequency to achieve electromechanical resonance and peak ultrasonic emission',
    ],
    'f_res = (1 / (2 · L)) · √(Y / ρ)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim13-ultrasonic-velocity',
    3,
    'Unit III: Ultrasonics and Its Applications',
    'ultrasonic-velocity',
    'Velocity measurement of ultrasonic waves: Acoustic interferometer',
    '3D Ultrasonic Velocity Measurement Laboratory',
    '🎛️',
    'Measure ultrasonic velocity in liquids using acoustic interferometry: move the micrometer reflector, track acoustic standing wave nodes, and determine adiabatic compressibility.',
    [
      'Detect stationary acoustic wave nodes via high-frequency anode current dips',
      'Determine acoustic wavelength (λ = 2 · Δd) from reflector displacements',
      'Calculate ultrasonic speed (v = f · λ) and liquid adiabatic compressibility (β = 1 / (ρ v²))',
    ],
    'λ = 2 · d / n,  v = f · λ,  β = 1 / (ρ · v²)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim14-sonar-ranging',
    3,
    'Unit III: Ultrasonics and Its Applications',
    'sonar-ranging',
    'SONAR and ultrasonic echo ranging principles',
    '3D SONAR and Echo Ranging',
    '🚢',
    'Deploy an active naval SONAR transducer in deep ocean water, transmit directional acoustic pulses, receive echoes from submerged submarines and seabed, and compute distance.',
    [
      'Apply round-trip pulse-echo timing: d = (v · Δt) / 2',
      'Account for water temperature, salinity, and depth effects on underwater sound speed',
      'Compute acoustic beam spreading, attenuation loss, and minimum detectable target echo',
    ],
    'd = (v_sound · Δt) / 2,  SL - 2TL + TS - NL = SNR'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim15-ndt-scanning',
    3,
    'Unit III: Ultrasonics and Its Applications',
    'ndt-scanning',
    'Non-destructive testing, Ultrasonic imaging and A/B/C-scans',
    '3D Non-Destructive Testing, Ultrasonic Imaging and Scanning',
    '🛡️',
    'Inspect aerospace metal ingots for internal crack flaws and voids using an ultrasonic pulse-echo probe, generating real-time A-scan waveforms and reconstructed cross-sectional B-scan tomography.',
    [
      'Locate internal defect depth from the arrival time of the flaw echo between initial and backwall pulses',
      'Distinguish A-scan (amplitude vs time), B-scan (cross-sectional depth map), and C-scan (plan view)',
      'Explain acoustic attenuation, beam divergence, and calibration block calibration standards',
    ],
    'd_flaw = (v · t_flaw) / 2,  t_back = (2 · d_total) / v'
  ),

  // ==========================================
  // UNIT IV — SEMICONDUCTOR PHYSICS
  // ==========================================
  ep3DBoardSimulation(
    'u25rph01-sim16-band-structure',
    4,
    'Unit IV: Semiconductor Physics',
    'band-structure',
    'Direct and indirect band-gap semiconductors',
    '3D Semiconductor Band Structure: Direct and Indirect Band Gaps',
    '📊',
    'Explore 3D E-k dispersion diagrams for direct-gap GaAs and indirect-gap Silicon, illuminating why direct-gap semiconductors emit light efficiently while indirect-gap materials require phonon participation.',
    [
      'Analyze conduction band minimum and valence band maximum in crystal momentum k-space',
      'Compare momentum-conserving vertical radiative transitions with phonon-assisted non-radiative transitions',
      'Correlate band gap structure with photonic optoelectronic viability (LEDs, laser diodes vs solar cells)',
    ],
    'E_photon = h · c / λ = E_g,  Δk = 0 (Direct) vs Δk = q_phonon (Indirect)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim17-carrier-concentration',
    4,
    'Unit IV: Semiconductor Physics',
    'carrier-concentration',
    'Intrinsic and extrinsic semiconductors, Carrier concentration',
    '3D Intrinsic and Extrinsic Semiconductors: Carrier Concentration',
    '⚛️',
    'Dope a silicon diamond-cubic crystal lattice with phosphorus donors (n-type) and boron acceptors (p-type), observing Fermi level shift, thermally excited electron-hole pairs, and mass-action law.',
    [
      'Calculate intrinsic carrier concentration: n_i = √(N_c N_v) · exp(-E_g / (2 k_B T))',
      'Verify the law of mass action under thermal equilibrium: n · p = n_i²',
      'Track Fermi energy (E_F) displacement toward the conduction band (n-type) or valence band (p-type)',
    ],
    'n · p = n_i²,  n_i = 2 · (2π k_B T / h²)^(3/2) · (m_e* m_h*)^(3/4) · exp(-E_g / (2 k_B T))'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim18-carrier-transport-pn',
    4,
    'Unit IV: Semiconductor Physics',
    'carrier-transport-pn',
    'Carrier transport, Drift and diffusion, P–N junction',
    '3D Carrier Transport and P–N Junction',
    '🔀',
    'Step across a 3D metallurgical P–N junction under thermal equilibrium, forward bias, and reverse bias, observing mobile carrier diffusion, uncompensated space-charge ions, and built-in electric field barrier.',
    [
      'Formulate drift and diffusion current density: J = q (n μ_n + p μ_p) E + q (D_n ∇n - D_p ∇p)',
      'Calculate built-in contact potential: V_bi = (k_B T / q) · ln(N_A N_D / n_i²)',
      'Visualize depletion layer thinning under forward bias and widening under reverse bias',
    ],
    'I = I₀ · [exp(q V / (η k_B T)) - 1],  W_dep = √[(2 ε_s / q) · (1/N_A + 1/N_D) · (V_bi - V)]'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim19-zener-diode',
    4,
    'Unit IV: Semiconductor Physics',
    'zener-diode',
    'Zener diode, Avalanche & Zener breakdown, Voltage regulation',
    '3D Zener Diode and Semiconductor Device Applications',
    '⚡',
    'Assemble a DC voltage regulator circuit with a heavily doped Zener diode, sweeping unregulated input supply and load resistance to observe quantum tunnelling breakdown and constant clamping voltage.',
    [
      'Distinguish high-field quantum mechanical Zener tunnelling (< 5.6 V) from avalanche impact ionization (> 5.6 V)',
      'Plot reverse I-V characteristics displaying sharp knee voltage (V_Z) and dynamic resistance (r_Z)',
      'Design a DC voltage regulator circuit maintaining stable load voltage despite supply ripples',
    ],
    'V_out = V_Z,  I_S = (V_in - V_Z) / R_S,  I_Z = I_S - I_L'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim20-semiconductor-devices',
    4,
    'Unit IV: Semiconductor Physics',
    'semiconductor-devices',
    'Semiconductor devices: Solar cell, Photodetector, LED, Power Diode',
    '3D Semiconductor Device Explorer',
    '📱',
    'Inspect 3D physical cutaways of 4 core optoelectronic and power semiconductor devices: photovoltaic solar cell, PIN photodiode, light-emitting diode (LED), and Schottky power rectifier.',
    [
      'Analyze optical carrier generation and electron-hole collection in photovoltaic solar cells',
      'Examine spontaneous electroluminescence and band-gap emission tuning in III-V LEDs',
      'Compare switching speed and forward voltage drop in P-N versus Schottky barrier junctions',
    ],
    'η_solar = (V_oc · I_sc · FF) / P_in,  λ_emission = h · c / E_g'
  ),

  // ==========================================
  // UNIT V — PHOTONICS
  // ==========================================
  ep3DBoardSimulation(
    'u25rph01-sim21-radiation-matter',
    5,
    'Unit V: Photonics',
    'radiation-matter',
    'Interaction of radiation with matter, Einstein’s A and B coefficients',
    '3D Interaction of Radiation with Matter',
    '✨',
    'Fire resonant and non-resonant photons into a two-level atomic medium to interactively trigger stimulated absorption, spontaneous emission, and stimulated emission of identical coherent photons.',
    [
      'Differentiate spontaneous emission from coherent stimulated emission with phase and direction matching',
      'Relate transition probabilities through Einstein’s relations: B₁₂ = B₂₁ and A₂₁ / B₂₁ = 8π h ν³ / c³',
      'State threshold condition required for coherent light amplification over optical absorption',
    ],
    'R_abs = B₁₂ · N₁ · u(ν),  R_spont = A₂₁ · N₂,  R_stim = B₂₁ · N₂ · u(ν)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim22-laser-principles',
    5,
    'Unit V: Photonics',
    'laser-principles',
    'Laser characteristics, Population inversion, Optical resonator',
    '3D Laser Principles: Characteristics and Population Inversion',
    '🎯',
    'Pump a 3-level atomic laser cavity past threshold inversion (N₂ > N₁), establish resonant Fabry-Pérot standing modes between dielectric cavity mirrors, and emit a collimated, coherent, monochromatic laser beam.',
    [
      'Explain the necessity of a metastable state to achieve population inversion (N₂ > N₁)',
      'Analyze optical resonator cavity feedback: round-trip gain g_th = α_loss + (1 / 2L) · ln(1 / (R₁ R₂))',
      'Define essential laser characteristics: high monochromaticity, spatial/temporal coherence, and extreme directionality',
    ],
    'N₂ - N₁ > 0 (Inversion),  Δν = c / (2L),  θ_div ≈ 1.22 · λ / D'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim23-co2-diode-laser',
    5,
    'Unit V: Photonics',
    'co2-diode-laser',
    'CO₂ molecular gas laser and Semiconductor diode laser',
    '3D CO₂ Laser and Semiconductor Diode Laser',
    '💡',
    'Compare industrial 10.6 µm infrared CO₂ molecular gas discharge laser with a compact 808 nm GaAs/AlGaAs double-heterostructure semiconductor diode laser in 3D.',
    [
      'Explain vibrational-rotational molecular excitation in CO₂ laser aided by N₂ resonant energy transfer',
      'Examine carrier injection and stimulated recombination in double-heterostructure laser diodes',
      'Compare high-power industrial cutting/welding applications with telecommunications and optical storage',
    ],
    'CO₂: λ = 10.6 µm (Vibrational transition: 00°1 → 10°0),  Diode: λ = 1.24 / E_g(eV) µm'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim24-total-internal-reflection',
    5,
    'Unit V: Photonics',
    'total-internal-reflection',
    'Total internal reflection, Structure and working of optical fibre',
    '3D Total Internal Reflection and Optical Fibre',
    '🌈',
    'Launch light rays at varying angles into a cylindrical optical fibre, observing refracted ray escape, critical angle boundary reflection, acceptance angle cone, and numerical aperture (NA).',
    [
      'Apply Snell’s law to derive the critical angle: θ_c = arcsin(n₂ / n₁)',
      'Calculate numerical aperture (NA = √(n₁² - n₂²)) and maximum acceptance angle (θ_a)',
      'Differentiate step-index from graded-index modal dispersion in single-mode and multimode waveguides',
    ],
    'θ_c = arcsin(n₂ / n₁),  NA = sin θ_max = √(n_core² - n_clad²)'
  ),
  ep3DBoardSimulation(
    'u25rph01-sim25-fibre-endoscopy-sensors',
    5,
    'Unit V: Photonics',
    'fibre-endoscopy-sensors',
    'Fibre-optic endoscopy and Fibre-optic sensors',
    '3D Fibre-Optic Endoscopy and Fibre-Optic Sensors',
    '🩺',
    'Navigate an interactive medical endoscope dual-bundle (incoherent illumination + coherent imaging bundle) and test extrinsic/intrinsic optical fibre microbend pressure and temperature sensors.',
    [
      'Distinguish coherent imaging fibre bundles (ordered 1:1 pixel transfer) from incoherent illumination light guides',
      'Operate optical fibre sensors utilizing intensity modulation, phase shift, or Bragg wavelength reflection',
      'Evaluate clinical and industrial advantages of fibre-optic diagnostics: non-invasive, immune to EMI, and chemically inert',
    ],
    'ΔI / I₀ = -k · ΔP (Microbend),  λ_Bragg = 2 · n_eff · Λ'
  ),
];

/**
 * Maps aliases, short names, and legacy keys to canonical U25RPH01 IDs.
 */
export const U25RPH01_ALIAS_MAP: Record<string, string> = {
  // Unit I
  'material-testing': 'u25rph01-sim01-material-testing',
  'u25rph01-material-testing': 'u25rph01-sim01-material-testing',
  'poisson-ratio': 'u25rph01-sim02-poisson-ratio',
  'u25rph01-poisson-ratio': 'u25rph01-sim02-poisson-ratio',
  'material-comparison': 'u25rph01-sim03-material-comparison',
  'u25rph01-material-comparison': 'u25rph01-sim03-material-comparison',
  'cantilever-beam': 'u25rph01-sim04-cantilever-beam',
  'u25rph01-cantilever-beam': 'u25rph01-sim04-cantilever-beam',
  'girders-mems': 'u25rph01-sim05-girders-mems',
  'u25rph01-girders-mems': 'u25rph01-sim05-girders-mems',

  // Unit II
  'heat-transfer': 'u25rph01-sim06-heat-transfer',
  'u25rph01-heat-transfer': 'u25rph01-sim06-heat-transfer',
  'thermal-expansion-lees-disc': 'u25rph01-sim07-thermal-expansion-lees-disc',
  'u25rph01-thermal-expansion-lees-disc': 'u25rph01-sim07-thermal-expansion-lees-disc',
  'lees-disc': 'u25rph01-sim07-thermal-expansion-lees-disc',
  'surface-tension': 'u25rph01-sim08-surface-tension',
  'u25rph01-surface-tension': 'u25rph01-sim08-surface-tension',
  'poiseuille-viscosity': 'u25rph01-sim09-poiseuille-viscosity',
  'u25rph01-poiseuille-viscosity': 'u25rph01-sim09-poiseuille-viscosity',
  'thermal-systems': 'u25rph01-sim10-thermal-systems',
  'u25rph01-thermal-systems': 'u25rph01-sim10-thermal-systems',

  // Unit III
  'ultrasonic-waves': 'u25rph01-sim11-ultrasonic-waves',
  'u25rph01-ultrasonic-waves': 'u25rph01-sim11-ultrasonic-waves',
  'piezo-magneto': 'u25rph01-sim12-piezo-magneto',
  'piezo-magnetostriction': 'u25rph01-sim12-piezo-magneto',
  'u25rph01-piezo-magneto': 'u25rph01-sim12-piezo-magneto',
  'ultrasonic-velocity': 'u25rph01-sim13-ultrasonic-velocity',
  'u25rph01-ultrasonic-velocity': 'u25rph01-sim13-ultrasonic-velocity',
  'sonar-ranging': 'u25rph01-sim14-sonar-ranging',
  'u25rph01-sonar-ranging': 'u25rph01-sim14-sonar-ranging',
  'ndt-scanning': 'u25rph01-sim15-ndt-scanning',
  'ndt-imaging': 'u25rph01-sim15-ndt-scanning',
  'u25rph01-ndt-scanning': 'u25rph01-sim15-ndt-scanning',

  // Unit IV
  'band-structure': 'u25rph01-sim16-band-structure',
  'u25rph01-band-structure': 'u25rph01-sim16-band-structure',
  'carrier-concentration': 'u25rph01-sim17-carrier-concentration',
  'u25rph01-carrier-concentration': 'u25rph01-sim17-carrier-concentration',
  'carrier-transport-pn': 'u25rph01-sim18-carrier-transport-pn',
  'u25rph01-carrier-transport-pn': 'u25rph01-sim18-carrier-transport-pn',
  'zener-diode': 'u25rph01-sim19-zener-diode',
  'u25rph01-zener-diode': 'u25rph01-sim19-zener-diode',
  'semiconductor-devices': 'u25rph01-sim20-semiconductor-devices',
  'u25rph01-semiconductor-devices': 'u25rph01-sim20-semiconductor-devices',

  // Unit V
  'radiation-matter': 'u25rph01-sim21-radiation-matter',
  'u25rph01-radiation-matter': 'u25rph01-sim21-radiation-matter',
  'laser-principles': 'u25rph01-sim22-laser-principles',
  'u25rph01-laser-principles': 'u25rph01-sim22-laser-principles',
  'co2-diode-laser': 'u25rph01-sim23-co2-diode-laser',
  'co2-diode-lasers': 'u25rph01-sim23-co2-diode-laser',
  'u25rph01-co2-diode-laser': 'u25rph01-sim23-co2-diode-laser',
  'total-internal-reflection': 'u25rph01-sim24-total-internal-reflection',
  'u25rph01-total-internal-reflection': 'u25rph01-sim24-total-internal-reflection',
  'fibre-endoscopy-sensors': 'u25rph01-sim25-fibre-endoscopy-sensors',
  'u25rph01-fibre-endoscopy-sensors': 'u25rph01-sim25-fibre-endoscopy-sensors',
};

export function resolveU25RPH01SimId(simId: string): string {
  const clean = simId.toLowerCase().trim();
  return U25RPH01_ALIAS_MAP[clean] || simId;
}

export function toPhysicsSimId(rawId: string): import('./physics-3d/core/types').PhysicsSimId {
  const clean = rawId.toLowerCase().trim();
  if (clean.includes('poisson')) return 'poisson-ratio';
  if (clean.includes('comparison')) return 'material-comparison';
  if (clean.includes('cantilever')) return 'cantilever-beam';
  if (clean.includes('girder') || clean.includes('mems')) return 'girders-mems';
  if (clean.includes('material') || clean.includes('testing')) return 'material-testing';

  if (clean.includes('lees') || clean.includes('expansion')) return 'thermal-expansion-lees-disc';
  if (clean.includes('surface') || clean.includes('capillar')) return 'surface-tension';
  if (clean.includes('poiseuille') || clean.includes('viscos')) return 'poiseuille-viscosity';
  if (clean.includes('thermal-system') || clean.includes('solar') || clean.includes('microwave') || clean.includes('exchanger') || clean.includes('radiator') || clean.includes('cooling-tower')) return 'thermal-systems';
  if (clean.includes('heat') || clean.includes('conduction') || clean.includes('convection') || clean.includes('radiation-heat')) return 'heat-transfer';

  if (clean.includes('piezo') || clean.includes('magneto')) return 'piezo-magnetostriction';
  if (clean.includes('velocity') || clean.includes('interferometer')) return 'ultrasonic-velocity';
  if (clean.includes('sonar') || clean.includes('echo')) return 'sonar-ranging';
  if (clean.includes('ndt') || clean.includes('scan') || clean.includes('imaging')) return 'ndt-imaging';
  if (clean.includes('ultrasonic') || clean.includes('wave')) return 'ultrasonic-waves';

  if (clean.includes('band-structure') || clean.includes('gap')) return 'band-structure';
  if (clean.includes('carrier-concentration') || clean.includes('intrinsic') || clean.includes('extrinsic') || clean.includes('doping')) return 'carrier-concentration';
  if (clean.includes('carrier-transport') || clean.includes('junction') || clean.includes('p-n') || clean.includes('pn')) return 'carrier-transport-pn';
  if (clean.includes('zener') || clean.includes('regulat')) return 'zener-diode';
  if (clean.includes('semiconductor-device') || clean.includes('solar-cell') || clean.includes('photodiode') || clean.includes('led')) return 'semiconductor-devices';

  if (clean.includes('laser-principle') || clean.includes('population-inversion') || clean.includes('inversion')) return 'laser-principles';
  if (clean.includes('co2') || clean.includes('diode-laser')) return 'co2-diode-lasers';
  if (clean.includes('total-internal') || clean.includes('reflection') || clean.includes('optical-fibre') || clean.includes('snell')) return 'total-internal-reflection';
  if (clean.includes('endoscopy') || clean.includes('sensor') || clean.includes('fibre-optic')) return 'fibre-endoscopy-sensors';
  if (clean.includes('radiation') || clean.includes('matter') || clean.includes('einstein') || clean.includes('spontaneous') || clean.includes('stimulated')) return 'radiation-matter';

  return 'material-testing';
}

