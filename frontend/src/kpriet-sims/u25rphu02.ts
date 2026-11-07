import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25RPHU02
 * Course Name: Physics for Data Storage and Computing
 * Semester: I | Category: BSC | Credits: 2
 * Common to: AD, AM, BM, CB, CS, IT
 * 
 * 20 Approved Core 3D Interactive Simulations mapped across Units I to V (4 per unit).
 */
export const U25RPHU02_SUBJECT_KEYWORDS = [
  'physics for data storage and computing',
  'physics for data storage',
  'data storage and computing',
  'u25rphu02',
  'u25rph',
  'u25ph102',
  'rphu02',
];

/**
 * Map legacy or granular simulation IDs to the 20 approved 3D core simulations.
 */
export const U25RPHU02_ALIAS_MAP: Record<string, string> = {
  'u25rphu02-carrier-generation': 'u25rphu02-optical-materials',
  'u25rphu02-absorption-emission': 'u25rphu02-optical-materials',
  'u25rphu02-oled': 'u25rphu02-solar-cell',
  'u25rphu02-optical-storage': 'u25rphu02-bluray',
  'u25rphu02-magnetic-materials': 'u25rphu02-ferromagnetism',
  'u25rphu02-magnetic-tape': 'u25rphu02-magnetic-memory',
  'u25rphu02-magstripe': 'u25rphu02-magnetic-memory',
  'u25rphu02-magnetic-bubble': 'u25rphu02-magnetic-memory',
  'u25rphu02-quantum-structures': 'u25rphu02-quantum-confinement',
  'u25rphu02-quantum-well': 'u25rphu02-quantum-confinement',
  'u25rphu02-quantum-wire': 'u25rphu02-quantum-confinement',
  'u25rphu02-quantum-dot': 'u25rphu02-quantum-confinement',
  'u25rphu02-coulomb-blockade': 'u25rphu02-set-rtd',
  'u25rphu02-set': 'u25rphu02-set-rtd',
  'u25rphu02-rtd': 'u25rphu02-set-rtd',
  'u25rphu02-qca': 'u25rphu02-set-rtd',
  'u25rphu02-qubit': 'u25rphu02-bloch-sphere',
  'u25rphu02-single-two-qubits': 'u25rphu02-entanglement',
  'u25rphu02-quantum-device': 'u25rphu02-classical-vs-quantum',
  'u25rphu02-quantum-devices': 'u25rphu02-classical-vs-quantum',
  'u25rphu02-quantum-gates': 'u25rphu02-pauli-gates',
  'u25rphu02-x-gate': 'u25rphu02-pauli-gates',
  'u25rphu02-y-gate': 'u25rphu02-pauli-gates',
  'u25rphu02-z-gate': 'u25rphu02-pauli-gates',
  'u25rphu02-hadamard': 'u25rphu02-hadamard-interference',
  'u25rphu02-s-gate': 'u25rphu02-pauli-gates',
  'u25rphu02-t-gate': 'u25rphu02-pauli-gates',
  'u25rphu02-multiqubit': 'u25rphu02-circuit-builder',
  'u25rphu02-quantum-chip': 'u25rphu02-circuit-builder',
};

export function resolveU25RPHU02SimId(simId: string): string {
  return U25RPHU02_ALIAS_MAP[simId] || simId;
}

function u25rphSimulation(def: {
  id: string;
  unit: number;
  unitTitle: string;
  topic: string;
  title: string;
  icon: string;
  shortDescription: string;
  learningObjectives: string[];
  formulaOverview: string;
  parameters: ISimulationParam[];
  metrics: ISimulationMetric[];
  legacy?: boolean;
}): ISimulationDefinition {
  return {
    id: def.id,
    boardEngine: 'pdc',
    domain: 'PHYSICS',
    category: 'physics for data storage and computing',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25RPHU02_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the 3D WebGL laboratory with interactive parameters, live readouts, guided walkthrough, challenge tasks, and 5-item assessment question bank.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    tags: ['U25RPHU02', `Unit ${def.unit}`, def.unitTitle, def.topic, '3D WebGL'],
    parameters: def.parameters,
    metrics: def.metrics,
    legacy: def.legacy,
    engine: {
      createInitialState: () => ({ time: 0, active: true }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#070c14';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25RPHU02_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — OPTICAL MATERIALS AND DEVICES (Simulations 1–4)
  // ═══════════════════════════════════════════════════════════════════════════
  u25rphSimulation({
    id: 'u25rphu02-optical-materials',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Optical Materials & Absorption/Emission/Scattering',
    title: '3D Optical Materials and Light Interaction Lab',
    icon: '💎',
    shortDescription: 'Virtual optical bench examining light interaction, Beer-Lambert attenuation, refractive index, and scattering across materials.',
    learningObjectives: [
      'Analyze optical propagation through dielectric, semiconductor, and metal media',
      'Apply the Beer-Lambert attenuation law I(x) = I₀ exp(-αx) to compute absorption depth',
      'Distinguish specular reflection from diffuse scattering and relate bandgap Eg to transmission cut-off',
    ],
    formulaOverview: 'I(x) = I_0 e^{-\\alpha x}, \\quad \\tilde{n} = n + i k, \\quad \\alpha = \\frac{4\\pi k}{\\lambda}, \\quad \\lambda_c = \\frac{hc}{E_g}',
    parameters: [
      { key: 'material', label: 'Material Class', type: 'select', default: 'semiconductor', options: [
        { label: 'Transparent Dielectric (SiO₂ / Glass)', value: 'dielectric' },
        { label: 'Direct Bandgap Semiconductor (GaAs)', value: 'semiconductor' },
        { label: 'Opaque Conductor (Gold / Aluminium)', value: 'metal' },
      ]},
      { key: 'wavelength', label: 'Incident Light Wavelength (λ)', type: 'range', min: 380, max: 900, step: 10, default: 550, unit: 'nm' },
      { key: 'thickness', label: 'Sample Thickness (d)', type: 'range', min: 10, max: 200, step: 5, default: 50, unit: 'µm' },
    ],
    metrics: [
      { id: 'transmittance', label: 'Transmittance (T)', format: (_s, p) => p.material === 'dielectric' ? '92.4%' : p.material === 'metal' ? '0.2%' : '48.6%' },
      { id: 'reflectance', label: 'Reflectance (R)', format: (_s, p) => p.material === 'dielectric' ? '4.1%' : p.material === 'metal' ? '94.8%' : '31.2%' },
      { id: 'absorptance', label: 'Absorptance (A)', format: (_s, p) => p.material === 'dielectric' ? '3.5%' : p.material === 'metal' ? '5.0%' : '20.2%' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-photodiode',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Photodiode & Carrier Generation',
    title: 'Photodiode & Carrier Generation Lab',
    icon: '⚡',
    shortDescription: 'Electron-hole pair generation, reverse-bias drift dynamics, responsivity R(λ), and quantum efficiency in PIN and APD photodiodes.',
    learningObjectives: [
      'Observe photon absorption causing electron-hole pair generation in depletion regions',
      'Evaluate photodiode responsivity R = ηq / (hν) vs wavelength',
      'Compare PIN photodiode speed with Avalanche Photodiode (APD) internal gain',
    ],
    formulaOverview: 'R = \\frac{\\eta q}{h \\nu} = \\frac{\\eta q \\lambda}{h c}, \\quad I_{ph} = R \\cdot P_{opt}, \\quad \\text{Gain} = M',
    parameters: [
      { key: 'diodeType', label: 'Photodiode Architecture', type: 'select', default: 'pin', options: [
        { label: 'PIN Photodiode (Linear, Low Noise)', value: 'pin' },
        { label: 'Avalanche Photodiode (APD with Gain M)', value: 'apd' },
      ]},
      { key: 'reverseBias', label: 'Reverse Bias Voltage (V_R)', type: 'range', min: 0, max: 50, step: 1, default: 5, unit: 'V' },
      { key: 'opticalPower', label: 'Incident Optical Power (P_opt)', type: 'range', min: 0.1, max: 10, step: 0.1, default: 2.0, unit: 'mW' },
    ],
    metrics: [
      { id: 'photocurrent', label: 'Photocurrent (I_ph)', format: (_s, p) => `${((p.diodeType === 'apd' ? 25 : 1) * p.opticalPower * 0.65).toFixed(2)} mA` },
      { id: 'responsivity', label: 'Responsivity (R)', format: (_s, p) => p.diodeType === 'apd' ? '16.25 A/W' : '0.65 A/W' },
      { id: 'quantumEff', label: 'Quantum Efficiency (η)', format: () => '88.5%' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-solar-cell',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Solar Cell & Photovoltaic Characteristics',
    title: 'Solar Cell & Photovoltaic Characteristic Bench',
    icon: '☀️',
    shortDescription: 'P-N junction solar cell illuminated under AM1.5 solar spectrum: trace I-V and P-V curves, Voc, Isc, Fill Factor, and PCE.',
    learningObjectives: [
      'Trace illuminated solar cell I-V and P-V curves to identify Maximum Power Point (MPP)',
      'Calculate Open-Circuit Voltage Voc, Short-Circuit Current Isc, and Fill Factor (FF)',
      'Analyze how solar irradiance and operating temperature impact conversion efficiency',
    ],
    formulaOverview: 'I = I_{ph} - I_0 \\left( e^{\\frac{q V}{n k_B T}} - 1 \\right), \\quad P_{max} = V_{mp} I_{mp}, \\quad \\eta = \\frac{P_{max}}{P_{in}}',
    parameters: [
      { key: 'irradiance', label: 'Solar Irradiance (G)', type: 'range', min: 200, max: 1200, step: 50, default: 1000, unit: 'W/m²' },
      { key: 'temperature', label: 'Cell Temperature (T)', type: 'range', min: 273, max: 373, step: 5, default: 298, unit: 'K' },
      { key: 'loadResistance', label: 'Load Resistance (R_L)', type: 'range', min: 0.1, max: 50, step: 0.5, default: 5.0, unit: 'Ω' },
    ],
    metrics: [
      { id: 'voc', label: 'Open Circuit Voltage (Voc)', format: (_s, p) => `${(0.68 - (p.temperature - 298) * 0.002).toFixed(3)} V` },
      { id: 'isc', label: 'Short Circuit Current (Isc)', format: (_s, p) => `${(p.irradiance * 0.038).toFixed(2)} mA` },
      { id: 'power', label: 'Output Power (P_out)', format: (_s, p) => `${((p.irradiance / 1000) * 18.2).toFixed(2)} mW` },
      { id: 'efficiency', label: 'Power Conv. Efficiency (η)', format: () => '18.2%' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-bluray',
    unit: 1,
    unitTitle: 'Optical Materials and Devices',
    topic: 'Optical Storage & Blu-Ray Read/Write Head',
    title: 'Optical Data Storage & Blu-Ray Read/Write Head',
    icon: '💿',
    shortDescription: 'Diffraction limit d = λ / (2 NA) comparing CD (780nm), DVD (650nm), and Blu-ray (405nm) optical pickups and phase-change pits.',
    learningObjectives: [
      'Compare spot sizes d = λ / (2 NA) across CD (780nm), DVD (650nm), and Blu-ray (405nm)',
      'Explain phase-change rewritable recording between crystalline (high-R) and amorphous (low-R) states',
      'Relate pit track pitch to storage capacity scaling (0.7 GB -> 4.7 GB -> 25 GB)',
    ],
    formulaOverview: 'd_{spot} = 1.22 \\frac{\\lambda}{\\text{NA}}, \\quad \\text{Capacity} \\propto \\frac{1}{d_{spot}^2}, \\quad \\text{Phase-Change}: \\text{Crystalline} \\leftrightarrow \\text{Amorphous}',
    parameters: [
      { key: 'format', label: 'Optical Format', type: 'select', default: 'bluray', options: [
        { label: 'Compact Disc (CD: λ=780nm, NA=0.45)', value: 'cd' },
        { label: 'Digital Versatile Disc (DVD: λ=650nm, NA=0.60)', value: 'dvd' },
        { label: 'Blu-Ray Disc (BD: λ=405nm, NA=0.85)', value: 'bluray' },
      ]},
      { key: 'laserPower', label: 'Laser Mode / Power', type: 'select', default: 'read', options: [
        { label: 'Read Mode (Low Power ~1 mW)', value: 'read' },
        { label: 'Write / Melt Mode (High Power ~15 mW)', value: 'write' },
        { label: 'Erase / Anneal Mode (Moderate Power ~8 mW)', value: 'erase' },
      ]},
      { key: 'rpm', label: 'Spindle Rotation Speed', type: 'range', min: 1000, max: 10000, step: 500, default: 5000, unit: 'RPM' },
    ],
    metrics: [
      { id: 'spotSize', label: 'Diffraction Spot Diameter', format: (_s, p) => p.format === 'bluray' ? '290 nm' : p.format === 'dvd' ? '660 nm' : '1050 nm' },
      { id: 'capacity', label: 'Single Layer Capacity', format: (_s, p) => p.format === 'bluray' ? '25.0 GB' : p.format === 'dvd' ? '4.7 GB' : '0.7 GB' },
      { id: 'trackPitch', label: 'Track Pitch', format: (_s, p) => p.format === 'bluray' ? '0.32 µm' : p.format === 'dvd' ? '0.74 µm' : '1.60 µm' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — MAGNETIC MATERIALS AND DATA STORAGE (Simulations 5–8)
  // ═══════════════════════════════════════════════════════════════════════════
  u25rphSimulation({
    id: 'u25rphu02-ferromagnetism',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Ferromagnetism & Weiss Domain Theory',
    title: 'Weiss Domain Theory & Ferromagnetism 3D',
    icon: '🧲',
    shortDescription: 'Quantum exchange interaction, spontaneous magnetization, Curie temperature phase transition, and Weiss domain wall motion.',
    learningObjectives: [
      'Model quantum Heisenberg exchange interaction J Σ S_i · S_j aligning adjacent magnetic moments',
      'Observe spontaneous domain wall nucleation, displacement, and irreversibility',
      'Demonstrate ferromagnetic to paramagnetic phase transition at the Curie temperature Tc',
    ],
    formulaOverview: '\\mathcal{H}_{ex} = -2 J \\sum_{\\langle i,j \\rangle} \\mathbf{S}_i \\cdot \\mathbf{S}_j, \\quad M(T) = M_0 \\left(1 - \\frac{T}{T_c}\\right)^\\beta, \\quad T > T_c: \\chi = \\frac{C}{T - T_c}',
    parameters: [
      { key: 'temperature', label: 'Sample Temperature (T)', type: 'range', min: 100, max: 1100, step: 20, default: 300, unit: 'K' },
      { key: 'appliedH', label: 'External Field H', type: 'range', min: -500, max: 500, step: 20, default: 0, unit: 'Oe' },
      { key: 'material', label: 'Ferromagnetic Element', type: 'select', default: 'fe', options: [
        { label: 'Iron (Fe, Tc = 1043 K)', value: 'fe' },
        { label: 'Cobalt (Co, Tc = 1388 K)', value: 'co' },
        { label: 'Nickel (Ni, Tc = 627 K)', value: 'ni' },
      ]},
    ],
    metrics: [
      { id: 'magnetization', label: 'Spontaneous Magnetization (M)', format: (_s, p) => p.temperature > 1043 ? '0.00 emu/cm³' : `${(1700 * Math.pow(1 - p.temperature / 1043, 0.36)).toFixed(1)} emu/cm³` },
      { id: 'phase', label: 'Magnetic Phase', format: (_s, p) => p.temperature > 1043 ? 'Paramagnetic' : 'Ferromagnetic' },
      { id: 'domainCount', label: 'Active Weiss Domains', format: (_s, p) => p.appliedH > 400 ? '1 (Saturated)' : '8 (Multi-domain)' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-hysteresis',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Magnetic Hysteresis & Soft/Hard Materials',
    title: 'Magnetic B-H Hysteresis Loop & Loss Analyzer',
    icon: '🔄',
    shortDescription: 'B-H hysteresis loop tracing: Retentivity Br, Coercivity Hc, Saturation Bs, and hysteresis loss comparing soft and hard magnets.',
    learningObjectives: [
      'Trace complete B-H hysteresis loop under alternating excitation field',
      'Distinguish soft magnetic materials (low Hc, transformer cores) from hard magnetic materials (high Hc, permanent data storage)',
      'Calculate hysteresis energy loss per cycle: W = ∮ H dB',
    ],
    formulaOverview: 'B = \\mu_0 (H + M), \\quad W_{loss} = \\oint H \\, dB, \\quad B_r = \\text{Remanence}, \\quad H_c = \\text{Coercivity}',
    parameters: [
      { key: 'matType', label: 'Magnetic Material Class', type: 'select', default: 'hard', options: [
        { label: 'Hard Magnet (Co-Cr-Pt Media, High Hc ~4000 Oe)', value: 'hard' },
        { label: 'Soft Magnet (Permalloy Ni80Fe20, Low Hc ~0.1 Oe)', value: 'soft' },
        { label: 'Ferrite (Mn-Zn Core, Moderate Hc ~25 Oe)', value: 'ferrite' },
      ]},
      { key: 'hPeak', label: 'Peak Drive Field (H_max)', type: 'range', min: 100, max: 6000, step: 100, default: 5000, unit: 'Oe' },
      { key: 'frequency', label: 'Field Cycling Frequency', type: 'range', min: 1, max: 1000, step: 10, default: 60, unit: 'Hz' },
    ],
    metrics: [
      { id: 'coercivity', label: 'Coercivity (Hc)', format: (_s, p) => p.matType === 'hard' ? '4,200 Oe' : p.matType === 'soft' ? '0.15 Oe' : '30 Oe' },
      { id: 'remanence', label: 'Remanence (Br)', format: (_s, p) => p.matType === 'hard' ? '1.25 T' : p.matType === 'soft' ? '0.85 T' : '0.40 T' },
      { id: 'loss', label: 'Hysteresis Loop Area (Loss)', format: (_s, p) => p.matType === 'hard' ? '2.4 × 10⁵ J/m³' : '1.8 × 10² J/m³' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-magnetic-memory',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Magnetic Storage & Recording Heads',
    title: 'Magnetic Storage & Thin-Film Recording Head',
    icon: '💾',
    shortDescription: 'Write head fringing field reversing ferromagnetic grains; longitudinal vs perpendicular recording (PMR) and bit-density limits.',
    learningObjectives: [
      'Model write-head magnetic pole fringing field reversing media grains',
      'Compare Longitudinal Magnetic Recording (LMR) with Perpendicular Magnetic Recording (PMR)',
      'Analyze the superparamagnetic limit where thermal fluctuations flip nanoscale bits: K_u V ≥ 60 k_B T',
    ],
    formulaOverview: '\\text{Superparamagnetic Limit}: \\frac{K_u V}{k_B T} \\ge 60, \\quad \\tau = \\tau_0 \\exp\\left(\\frac{K_u V}{k_B T}\\right), \\quad B_{fringe} \\approx \\frac{\\mu_0 N I}{g}',
    parameters: [
      { key: 'recordingMode', label: 'Recording Architecture', type: 'select', default: 'pmr', options: [
        { label: 'Perpendicular Magnetic Recording (PMR + Soft Underlayer)', value: 'pmr' },
        { label: 'Longitudinal Magnetic Recording (LMR)', value: 'lmr' },
      ]},
      { key: 'writeCurrent', label: 'Write Coil Current', type: 'range', min: 5, max: 50, step: 5, default: 25, unit: 'mA' },
      { key: 'flyingHeight', label: 'Head Flying Height', type: 'range', min: 1, max: 20, step: 1, default: 5, unit: 'nm' },
    ],
    metrics: [
      { id: 'arealDensity', label: 'Areal Bit Density', format: (_s, p) => p.recordingMode === 'pmr' ? '1.2 Tb/in²' : '0.15 Tb/in²' },
      { id: 'fringeField', label: 'Pole-Tip Fringing Field', format: (_s, p) => `${(p.writeCurrent * 0.45).toFixed(1)} kOe` },
      { id: 'bitStability', label: 'Thermal Stability (KuV/kBT)', format: () => '72.4 (Stable > 10 yrs)' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-gmr',
    unit: 2,
    unitTitle: 'Magnetic Materials and Data Storage',
    topic: 'Giant Magnetoresistance & Spin Valves',
    title: 'Giant Magnetoresistance (GMR) Spin-Valve Sensor',
    icon: '🧭',
    shortDescription: 'Spin-dependent electron scattering in ferromagnetic/non-magnetic multilayers: parallel (low-R) vs antiparallel (high-R) states.',
    learningObjectives: [
      'Explain giant magnetoresistance based on spin-up and spin-down Mott two-current conduction',
      'Differentiate pinned layer, spacer, and free sensing layer in a spin-valve read head',
      'Calculate GMR ratio ΔR / R_p and trace resistance vs external bit stray field',
    ],
    formulaOverview: '\\text{GMR Ratio} = \\frac{R_{AP} - R_P}{R_P} \\times 100\\%, \\quad R_P = \\frac{2 r_\\uparrow r_\\downarrow}{r_\\uparrow + r_\\downarrow}, \\quad R_{AP} = \\frac{r_\\uparrow + r_\\downarrow}{2}',
    parameters: [
      { key: 'strayField', label: 'External Stray Field (H_ext)', type: 'range', min: -50, max: 50, step: 2, default: 0, unit: 'Oe' },
      { key: 'spacerThickness', label: 'Copper Spacer Thickness', type: 'range', min: 1.0, max: 5.0, step: 0.2, default: 2.2, unit: 'nm' },
      { key: 'temperature', label: 'Operating Temperature', type: 'range', min: 77, max: 400, step: 10, default: 300, unit: 'K' },
    ],
    metrics: [
      { id: 'resistance', label: 'Device Resistance (R)', format: (_s, p) => p.strayField > 10 ? '12.4 Ω (Parallel)' : p.strayField < -10 ? '18.6 Ω (Antiparallel)' : '15.5 Ω' },
      { id: 'gmrRatio', label: 'GMR Magnetoresistance Ratio', format: () => '50.0%' },
      { id: 'spinConfig', label: 'Relative Alignment', format: (_s, p) => p.strayField > 10 ? 'Parallel (↑↑)' : p.strayField < -10 ? 'Antiparallel (↑↓)' : 'Canted (90°)' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — NANODEVICES (Simulations 9–12)
  // ═══════════════════════════════════════════════════════════════════════════
  u25rphSimulation({
    id: 'u25rphu02-quantum-confinement',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Quantum Confinement & Density of States',
    title: 'Quantum Confinement & Density of States (0D/1D/2D/3D)',
    icon: '📦',
    shortDescription: 'Spatial confinement in bulk (3D), quantum well (2D), quantum wire (1D), and quantum dot (0D) and their distinct DOS functions g(E).',
    learningObjectives: [
      'Compare de Broglie wavelength λ_dB with nanoscale confinement dimensions L_x, L_y, L_z',
      'Derive and visualize DOS curves: parabolic (3D), staircase (2D), spikes (1D), discrete delta peaks (0D)',
      'Relate dimensional confinement to semiconductor laser performance and quantum devices',
    ],
    formulaOverview: 'g_{3D} \\propto E^{1/2}, \\quad g_{2D} = \\frac{m}{\\pi \\hbar^2} \\sum \\Theta, \\quad g_{1D} \\propto \\sum (E - E_n)^{-1/2}, \\quad g_{0D} \\propto \\sum \\delta(E - E_n)',
    parameters: [
      { key: 'dimension', label: 'Confinement Geometry', type: 'select', default: '0d', options: [
        { label: '3D Bulk Material (Continuous Confinement)', value: '3d' },
        { label: '2D Quantum Well (Confinement along z)', value: '2d' },
        { label: '1D Quantum Wire (Confinement along y, z)', value: '1d' },
        { label: '0D Quantum Dot (Full 3D Confinement)', value: '0d' },
      ]},
      { key: 'wellSize', label: 'Confinement Dimension (L)', type: 'range', min: 2, max: 20, step: 1, default: 5, unit: 'nm' },
      { key: 'effectiveMass', label: 'Carrier Effective Mass (m*)', type: 'range', min: 0.05, max: 1.0, step: 0.05, default: 0.067, unit: 'm₀' },
    ],
    metrics: [
      { id: 'groundEnergy', label: 'Ground State Energy E₁', format: (_s, p) => `${(0.376 / Math.pow(p.wellSize / 5, 2) / (p.effectiveMass / 0.067)).toFixed(3)} eV` },
      { id: 'dosShape', label: 'DOS Characteristic', format: (_s, p) => p.dimension === '0d' ? 'Discrete Delta Peaks δ(E)' : p.dimension === '1d' ? 'Spike Singularities E^{-1/2}' : p.dimension === '2d' ? 'Staircase Steps Θ(E)' : 'Parabolic E^{1/2}' },
      { id: 'deBroglie', label: 'Electron de Broglie λ', format: () => '7.4 nm' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-nano-bandgap',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Size-Tunable Bandgap & Brus Equation',
    title: 'Size-Tunable Bandgap & Brus Equation Lab',
    icon: '🔮',
    shortDescription: 'Nanocrystal quantum size effect: trace bandgap shift ΔE and photoluminescence emission wavelength via the Brus effective mass formula.',
    learningObjectives: [
      'Calculate nanocrystal bandgap expansion using the Brus formula Eg(R) = Eg_bulk + h²/(8 R² m_r) - 1.8 q²/(4πε R)',
      'Relate quantum dot radius reduction to blue-shifting of photoluminescence emission spectrum',
      'Analyze applications in QLED displays, optical data transmission, and biological tagging',
    ],
    formulaOverview: 'E_g(R) = E_{g,bulk} + \\frac{\\hbar^2 \\pi^2}{2 R^2} \\left( \\frac{1}{m_e^*} + \\frac{1}{m_h^*} \\right) - \\frac{1.8 e^2}{4 \\pi \\varepsilon_0 \\varepsilon_r R}',
    parameters: [
      { key: 'radius', label: 'Quantum Dot Radius (R)', type: 'range', min: 1.0, max: 8.0, step: 0.2, default: 2.5, unit: 'nm' },
      { key: 'material', label: 'Semiconductor QD Material', type: 'select', default: 'cdse', options: [
        { label: 'Cadmium Selenide (CdSe, Bulk Eg = 1.74 eV)', value: 'cdse' },
        { label: 'Lead Sulfide (PbS, Bulk Eg = 0.41 eV)', value: 'pbs' },
        { label: 'Zinc Sulfide (ZnS, Bulk Eg = 3.68 eV)', value: 'zns' },
      ]},
      { key: 'temperature', label: 'Temperature (T)', type: 'range', min: 10, max: 350, step: 10, default: 298, unit: 'K' },
    ],
    metrics: [
      { id: 'effectiveEg', label: 'Effective Bandgap Eg(R)', format: (_s, p) => `${(1.74 + 1.2 / Math.pow(p.radius, 2)).toFixed(2)} eV` },
      { id: 'emissionWavelength', label: 'Emission Peak Wavelength (λ)', format: (_s, p) => `${(1240 / (1.74 + 1.2 / Math.pow(p.radius, 2))).toFixed(0)} nm` },
      { id: 'color', label: 'Emitted Visual Color', format: (_s, p) => p.radius < 2.0 ? 'Cyan / Blue' : p.radius < 3.2 ? 'Green / Yellow' : 'Deep Red' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-tunnelling',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Quantum Tunnelling & STM Probe',
    title: 'Quantum Barrier Tunnelling & STM Probe',
    icon: '🔬',
    shortDescription: 'Wavefunction attenuation through finite potential barriers: calculate transmission coefficient T(E) and atomic STM resolution.',
    learningObjectives: [
      'Solve Schrödinger wave equation across a finite potential barrier V₀ > E',
      'Demonstrate exponential sensitivity of tunnelling current: I ∝ exp(-2 κ d) where κ = √(2m(V₀ - E))/ℏ',
      'Simulate Scanning Tunnelling Microscope (STM) atomic imaging and tip-sample z feedback',
    ],
    formulaOverview: 'T \\approx e^{-2 \\kappa d}, \\quad \\kappa = \\frac{\\sqrt{2 m (V_0 - E)}}{\\hbar}, \\quad I_{tunn} \\propto V_{bias} e^{-2 \\kappa d}',
    parameters: [
      { key: 'barrierWidth', label: 'Barrier Width / Gap (d)', type: 'range', min: 0.2, max: 2.0, step: 0.1, default: 0.8, unit: 'nm' },
      { key: 'barrierHeight', label: 'Barrier Height (V₀)', type: 'range', min: 2.0, max: 10.0, step: 0.5, default: 4.5, unit: 'eV' },
      { key: 'particleEnergy', label: 'Carrier Energy (E)', type: 'range', min: 0.5, max: 4.0, step: 0.1, default: 2.0, unit: 'eV' },
    ],
    metrics: [
      { id: 'transmission', label: 'Tunnelling Probability (T)', format: (_s, p) => `${(Math.exp(-2 * 5.12 * Math.sqrt(p.barrierHeight - p.particleEnergy) * p.barrierWidth * 0.1) * 100).toExponential(2)} %` },
      { id: 'tunnelCurrent', label: 'Tunnelling Current (I)', format: (_s, p) => `${(15.0 * Math.exp(-2.2 * p.barrierWidth)).toFixed(2)} nA` },
      { id: 'decayConstant', label: 'Decay Constant (κ)', format: (_s, p) => `${(5.12 * Math.sqrt(p.barrierHeight - p.particleEnergy)).toFixed(2)} nm⁻¹` },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-set-rtd',
    unit: 3,
    unitTitle: 'Nanodevices',
    topic: 'Single Electron Transistor & RTD',
    title: 'Single Electron Transistor & Resonant Tunnelling Diode',
    icon: '⚡',
    shortDescription: 'Coulomb blockade diamonds and charging energy Ec = e² / (2 C_Σ); Negative Differential Resistance (NDR) in double-barrier RTD.',
    learningObjectives: [
      'Analyze Coulomb blockade threshold V_th = e / (2 C_Σ) preventing single-electron transfer',
      'Trace periodic Coulomb oscillation conductance peaks controlled by gate voltage V_g',
      'Observe resonant tunnelling alignment producing Negative Differential Resistance (NDR)',
    ],
    formulaOverview: 'E_C = \\frac{e^2}{2 C_\\Sigma}, \\quad k_B T \\ll E_C, \\quad V_{ds} < \\frac{e}{2 C_\\Sigma} \\implies \\text{Blockade}, \\quad G = \\frac{dI}{dV_g}',
    parameters: [
      { key: 'deviceType', label: 'Quantum Architecture', type: 'select', default: 'set', options: [
        { label: 'Single Electron Transistor (SET Island + Gate)', value: 'set' },
        { label: 'Resonant Tunnelling Diode (Double Barrier RTD)', value: 'rtd' },
      ]},
      { key: 'gateVoltage', label: 'Gate Voltage (V_g)', type: 'range', min: -1.0, max: 1.0, step: 0.05, default: 0.25, unit: 'V' },
      { key: 'biasVoltage', label: 'Drain-Source Bias (V_ds)', type: 'range', min: -0.5, max: 0.5, step: 0.02, default: 0.05, unit: 'V' },
      { key: 'temperature', label: 'Temperature (T)', type: 'range', min: 0.1, max: 300, step: 5, default: 4.2, unit: 'K' },
    ],
    metrics: [
      { id: 'chargingEnergy', label: 'Charging Energy (Ec)', format: () => '45.2 meV' },
      { id: 'islandCharge', label: 'Island Excess Charge (n)', format: (_s, p) => `${Math.round(p.gateVoltage * 4)} e` },
      { id: 'state', label: 'Conduction State', format: (_s, p) => Math.abs(p.biasVoltage) < 0.08 ? 'Coulomb Blockade' : 'Single-Electron Transport' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — QUANTUM COMPUTING (Simulations 13–16)
  // ═══════════════════════════════════════════════════════════════════════════
  u25rphSimulation({
    id: 'u25rphu02-bloch-sphere',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Bloch Sphere & Qubit State Vector',
    title: '3D Bloch Sphere & Quantum State Vector',
    icon: '🌐',
    shortDescription: 'State vector representation |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩ with spherical coordinates θ and φ and projective measurements.',
    learningObjectives: [
      'Map pure quantum states onto the surface of the 3D unit Bloch sphere',
      'Relate polar angle θ to computational basis probabilities: P(0) = cos²(θ/2), P(1) = sin²(θ/2)',
      'Interpret azimuthal angle φ as relative quantum phase between basis states',
    ],
    formulaOverview: '|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i \\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle, \\quad \\langle\\psi|\\psi\\rangle = 1',
    parameters: [
      { key: 'theta', label: 'Polar Angle (θ)', type: 'range', min: 0, max: 180, step: 5, default: 90, unit: '°' },
      { key: 'phi', label: 'Azimuthal Phase (φ)', type: 'range', min: 0, max: 360, step: 10, default: 0, unit: '°' },
      { key: 'preset', label: 'Canonical State Preset', type: 'select', default: 'plus', options: [
        { label: 'Ground State |0⟩ (North Pole)', value: 'zero' },
        { label: 'Excited State |1⟩ (South Pole)', value: 'one' },
        { label: 'Superposition |+⟩ = (|0⟩+|1⟩)/√2', value: 'plus' },
        { label: 'Phase State |i⟩ = (|0⟩+i|1⟩)/√2', value: 'i' },
      ]},
    ],
    metrics: [
      { id: 'prob0', label: 'Probability P(|0⟩)', format: (_s, p) => `${(Math.pow(Math.cos(((p.theta * Math.PI) / 180) / 2), 2) * 100).toFixed(1)}%` },
      { id: 'prob1', label: 'Probability P(|1⟩)', format: (_s, p) => `${(Math.pow(Math.sin(((p.theta * Math.PI) / 180) / 2), 2) * 100).toFixed(1)}%` },
      { id: 'phase', label: 'Relative Quantum Phase', format: (_s, p) => `${p.phi}°` },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-superposition-measurement',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Superposition & Wavefunction Collapse',
    title: 'Quantum Superposition & Born Rule Measurement Lab',
    icon: '🎲',
    shortDescription: 'Superposition state preparation |ψ⟩ = α|0⟩ + β|1⟩, projective measurement, Born rule statistics, and irreversible collapse.',
    learningObjectives: [
      'Demonstrate Born rule probability interpretation P(i) = |⟨i|ψ⟩|²',
      'Simulate projective measurement collapsing continuous superpositions into discrete eigenstates |0⟩ or |1⟩',
      'Accumulate 1,000+ empirical quantum shots to verify convergence to theoretical probabilities',
    ],
    formulaOverview: '|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1, \\quad P(0) = |\\alpha|^2, \\quad P(1) = |\\beta|^2',
    parameters: [
      { key: 'alphaSq', label: 'State Amplitude |α|² (P(0))', type: 'range', min: 0, max: 1.0, step: 0.05, default: 0.5, unit: '' },
      { key: 'shots', label: 'Measurement Shots Count', type: 'range', min: 10, max: 2000, step: 50, default: 500, unit: 'shots' },
      { key: 'basis', label: 'Measurement Basis', type: 'select', default: 'z', options: [
        { label: 'Computational Z-Basis (|0⟩ / |1⟩)', value: 'z' },
        { label: 'Hadamard X-Basis (|+⟩ / |-⟩)', value: 'x' },
      ]},
    ],
    metrics: [
      { id: 'observed0', label: 'Observed |0⟩ Count', format: (_s, p) => `${Math.round(p.shots * p.alphaSq)} (${(p.alphaSq * 100).toFixed(1)}%)` },
      { id: 'observed1', label: 'Observed |1⟩ Count', format: (_s, p) => `${Math.round(p.shots * (1 - p.alphaSq))} (${((1 - p.alphaSq) * 100).toFixed(1)}%)` },
      { id: 'collapseState', label: 'Last Shot Post-Collapse', format: () => '|0⟩' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-entanglement',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Quantum Entanglement & Bell States',
    title: 'Quantum Entanglement & Bell State Analyzer',
    icon: '🔗',
    shortDescription: 'Two-qubit entangled states |Φ+⟩, |Φ-⟩, |Ψ+⟩, |Ψ-⟩: observe non-local correlation, density matrix, and Bell inequality CHSH test.',
    learningObjectives: [
      'Construct all 4 maximally entangled Bell basis states (|Φ±⟩, |Ψ±⟩)',
      'Analyze the density matrix ρ and entanglement entropy of bipartite systems',
      'Simulate the Clauser-Horne-Shimony-Holt (CHSH) Bell inequality test exceeding classical bound 2 to achieve quantum limit 2√2 ≈ 2.828',
    ],
    formulaOverview: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}, \\quad S_{CHSH} \\le 2 \\text{ (Classical)}, \\quad S_{CHSH} = 2\\sqrt{2} \\approx 2.828 \\text{ (Quantum)}',
    parameters: [
      { key: 'bellState', label: 'Target Bell State', type: 'select', default: 'phi_plus', options: [
        { label: '|Φ+⟩ = (|00⟩ + |11⟩) / √2', value: 'phi_plus' },
        { label: '|Φ-⟩ = (|00⟩ - |11⟩) / √2', value: 'phi_minus' },
        { label: '|Ψ+⟩ = (|01⟩ + |10⟩) / √2', value: 'psi_plus' },
        { label: '|Ψ-⟩ = (|01⟩ - |10⟩) / √2', value: 'psi_minus' },
      ]},
      { key: 'detectorAngle', label: 'Detector Angle Offset (θ_B)', type: 'range', min: 0, max: 180, step: 5, default: 45, unit: '°' },
      { key: 'coherenceTime', label: 'Decoherence Noise Level', type: 'range', min: 0, max: 100, step: 5, default: 0, unit: '%' },
    ],
    metrics: [
      { id: 'concurrence', label: 'Concurrence (Entanglement)', format: (_s, p) => p.coherenceTime === 0 ? '1.00 (Maximal)' : `${(1.0 - p.coherenceTime * 0.01).toFixed(2)}` },
      { id: 'chshVal', label: 'CHSH Parameter S', format: () => '2.828 (Violates Local Realism)' },
      { id: 'correlation', label: 'Joint Measurement Correlation', format: (_s, p) => p.bellState.startsWith('phi') ? 'Perfect Same (00 or 11)' : 'Perfect Opposite (01 or 10)' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-classical-vs-quantum',
    unit: 4,
    unitTitle: 'Quantum Computing',
    topic: 'Classical vs Quantum Complexity',
    title: 'Classical vs Quantum Computing Complexity Benchmark',
    icon: '📊',
    shortDescription: 'State space scaling 2^N vs N: simulate exponential parallel search, database query Grover O(√N), and Shor factoring speedup.',
    learningObjectives: [
      'Compare classical register memory (N bits) with quantum Hilbert state space (2^N complex amplitudes)',
      'Evaluate quantum parallelism and speedup for Grover unstructured search O(√N) vs classical O(N)',
      'Demonstrate why 50-qubit systems exceed the memory capacity of classical supercomputers',
    ],
    formulaOverview: '\\dim(\\mathcal{H}) = 2^N, \\quad T_{classical} = \\mathcal{O}(N), \\quad T_{Grover} = \\mathcal{O}(\\sqrt{N}), \\quad T_{Shor} = \\mathcal{O}\\left((\\log N)^3\\right)',
    parameters: [
      { key: 'qubitCount', label: 'Qubit Register Size (N)', type: 'range', min: 2, max: 50, step: 1, default: 16, unit: 'qubits' },
      { key: 'algorithm', label: 'Benchmark Task', type: 'select', default: 'search', options: [
        { label: 'Unstructured Database Search (Grover)', value: 'search' },
        { label: 'Integer Prime Factorization (Shor)', value: 'shor' },
        { label: 'Quantum Chemistry Simulation (VQE)', value: 'chemistry' },
      ]},
    ],
    metrics: [
      { id: 'stateCount', label: 'Simultaneous State Amplitudes (2^N)', format: (_s, p) => p.qubitCount > 30 ? `~${Math.pow(2, p.qubitCount).toExponential(2)} states` : `${Math.pow(2, p.qubitCount).toLocaleString()} states` },
      { id: 'classicalSteps', label: 'Classical Operations Required', format: (_s, p) => `${Math.pow(2, p.qubitCount).toLocaleString()}` },
      { id: 'quantumSteps', label: 'Quantum Operations Required', format: (_s, p) => `${Math.round(Math.PI / 4 * Math.sqrt(Math.pow(2, p.qubitCount))).toLocaleString()}` },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — QUANTUM CIRCUITS (Simulations 17–20)
  // ═══════════════════════════════════════════════════════════════════════════
  u25rphSimulation({
    id: 'u25rphu02-pauli-gates',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'Pauli Gates & Phase Rotations',
    title: 'Single-Qubit Pauli & Phase Rotation Gates',
    icon: '🔄',
    shortDescription: 'Unitary quantum gates Pauli X (bit flip), Y, Z (phase flip), S, T (π/8), and arbitrary axis rotations Rx, Ry, Rz on the Bloch sphere.',
    learningObjectives: [
      'Apply unitary matrix transformations U† U = I to state vectors',
      'Differentiate bit flip X, phase flip Z, and combined Y operations',
      'Trace continuous rotation trajectories Rx(θ), Ry(θ), Rz(φ) on the Bloch sphere',
    ],
    formulaOverview: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad R_z(\\phi) = e^{-i \\frac{\\phi}{2} Z}',
    parameters: [
      { key: 'activeGate', label: 'Single-Qubit Gate', type: 'select', default: 'x', options: [
        { label: 'Pauli-X (NOT / Bit Flip)', value: 'x' },
        { label: 'Pauli-Y (Bit + Phase Flip)', value: 'y' },
        { label: 'Pauli-Z (Phase Flip)', value: 'z' },
        { label: 'S-Gate (Phase Shift π/2)', value: 's' },
        { label: 'T-Gate (Phase Shift π/4)', value: 't' },
      ]},
      { key: 'inputState', label: 'Initial Input State', type: 'select', default: 'zero', options: [
        { label: '|0⟩ Ground State', value: 'zero' },
        { label: '|1⟩ Excited State', value: 'one' },
        { label: '|+⟩ = (|0⟩+|1⟩)/√2 Superposition', value: 'plus' },
        { label: '|-⟩ = (|0⟩-|1⟩)/√2 Anti-phase', value: 'minus' },
      ]},
      { key: 'rotationAngle', label: 'Parametric Angle (θ)', type: 'range', min: 0, max: 360, step: 15, default: 180, unit: '°' },
    ],
    metrics: [
      { id: 'outputState', label: 'Transformed Output State', format: (_s, p) => p.activeGate === 'x' && p.inputState === 'zero' ? '|1⟩' : p.activeGate === 'z' && p.inputState === 'plus' ? '|-⟩' : '|ψ_out⟩' },
      { id: 'gateType', label: 'Transformation Nature', format: (_s, p) => p.activeGate === 'x' ? 'Bit-Flip (π rotation around X)' : p.activeGate === 'z' ? 'Phase-Flip (π rotation around Z)' : 'Unitary Rotation' },
      { id: 'fidelity', label: 'Gate Fidelity', format: () => '99.94%' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-circuit-builder',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'Multi-Qubit Circuit Builder',
    title: 'Multi-Qubit Circuit Builder & State Vector Visualizer',
    icon: '⚡',
    shortDescription: 'Drag-and-drop 3-qubit circuit board: assemble H, X, CNOT, and SWAP gates, computing full unitary matrix and 8-component amplitudes.',
    learningObjectives: [
      'Assemble multi-qubit quantum circuits using sequential gate wires',
      'Compute tensor products U₁ ⊗ U₂ ⊗ U₃ to evaluate total system transformation',
      'Read out 2^N state vector amplitude bars and measurement probability distributions',
    ],
    formulaOverview: 'U_{total} = U_k \\cdot \\dots \\cdot U_1, \\quad |\\Psi_{out}\\rangle = U_{total} |000\\rangle, \\quad P(x) = |\\langle x | \\Psi_{out}\\rangle|^2',
    parameters: [
      { key: 'qubitCount', label: 'Circuit Qubit Count', type: 'range', min: 2, max: 4, step: 1, default: 3, unit: 'qubits' },
      { key: 'depth', label: 'Circuit Gate Depth', type: 'range', min: 1, max: 8, step: 1, default: 4, unit: 'layers' },
      { key: 'presetCircuit', label: 'Standard Algorithm Template', type: 'select', default: 'ghz', options: [
        { label: 'GHZ State Generator (H + CNOT + CNOT)', value: 'ghz' },
        { label: 'Quantum Teleportation Subcircuit', value: 'teleport' },
        { label: '2-Qubit Quantum Full Adder', value: 'adder' },
      ]},
    ],
    metrics: [
      { id: 'entanglementState', label: 'Entanglement Status', format: () => 'Entangled (GHZ Tripartite)' },
      { id: 'depthMetric', label: 'Total Circuit Depth', format: (_s, p) => `${p.depth} gate cycles` },
      { id: 'matrixDimension', label: 'Unitary Matrix Size', format: (_s, p) => `${Math.pow(2, p.qubitCount)} × ${Math.pow(2, p.qubitCount)}` },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-hadamard-interference',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'Hadamard Gate & Quantum Interference',
    title: 'Hadamard Gate & Quantum Phase Interference',
    icon: '✨',
    shortDescription: 'Equal superposition creation H|0⟩ = |+⟩, destructive and constructive phase interference, and reversible transformation H·H = I.',
    learningObjectives: [
      'Analyze the Hadamard transformation H mapping computational basis to superposition basis',
      'Demonstrate quantum phase interference causing destructive cancellation of unwanted computational paths',
      'Verify the self-inverse unitary property H² = H · H = I',
    ],
    formulaOverview: 'H = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}, \\quad H|0\\rangle = |+\\rangle, \\quad H|1\\rangle = |-\\rangle, \\quad H(H|\\psi\\rangle) = |\\psi\\rangle',
    parameters: [
      { key: 'hadamardLayers', label: 'Hadamard Operations Applied', type: 'select', default: 'two', options: [
        { label: 'Single Hadamard: |0⟩ → |+⟩ (Superposition)', value: 'one' },
        { label: 'Double Hadamard: |0⟩ → |+⟩ → |0⟩ (Interference / Identity)', value: 'two' },
        { label: 'Hadamard with Intermediate Phase Shift (Mach-Zehnder)', value: 'phase' },
      ]},
      { key: 'intermediatePhase', label: 'Interferometer Phase Shift (δ)', type: 'range', min: 0, max: 360, step: 10, default: 0, unit: '°' },
      { key: 'inputBasis', label: 'Input State', type: 'select', default: 'zero', options: [
        { label: '|0⟩', value: 'zero' },
        { label: '|1⟩', value: 'one' },
      ]},
    ],
    metrics: [
      { id: 'probZero', label: 'Final Output P(|0⟩)', format: (_s, p) => p.hadamardLayers === 'one' ? '50.0%' : p.hadamardLayers === 'two' ? '100.0%' : `${(Math.pow(Math.cos(((p.intermediatePhase * Math.PI) / 180) / 2), 2) * 100).toFixed(1)}%` },
      { id: 'probOne', label: 'Final Output P(|1⟩)', format: (_s, p) => p.hadamardLayers === 'one' ? '50.0%' : p.hadamardLayers === 'two' ? '0.0%' : `${(Math.pow(Math.sin(((p.intermediatePhase * Math.PI) / 180) / 2), 2) * 100).toFixed(1)}%` },
      { id: 'interferenceMode', label: 'Interference Type', format: (_s, p) => p.hadamardLayers === 'two' ? 'Constructive at |0⟩, Destructive at |1⟩' : 'Uniform Superposition' },
    ],
  }),

  u25rphSimulation({
    id: 'u25rphu02-cnot-circuit',
    unit: 5,
    unitTitle: 'Quantum Circuits',
    topic: 'CNOT Gate & Two-Qubit Entanglement',
    title: 'Controlled-NOT (CNOT) & Two-Qubit Entanglement Gate',
    icon: '🎯',
    shortDescription: 'Conditional bit flip of target qubit based on control qubit; truth table mapping, CNOT matrix, and generation of EPR Bell pairs.',
    learningObjectives: [
      'Apply 2-qubit CNOT matrix transformation mapping |c, t⟩ → |c, c ⊕ t⟩',
      'Demonstrate how CNOT entangles qubits when control qubit is in a superposition state',
      'Trace phase kickback occurring when target qubit is in the |-⟩ state',
    ],
    formulaOverview: '\\text{CNOT} = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}, \\quad \\text{CNOT}(|+\\rangle \\otimes |0\\rangle) = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
    parameters: [
      { key: 'controlState', label: 'Control Qubit (|q₀⟩)', type: 'select', default: 'plus', options: [
        { label: '|0⟩ State (No Flip on Target)', value: 'zero' },
        { label: '|1⟩ State (Always Flip Target)', value: 'one' },
        { label: '|+⟩ = (|0⟩+|1⟩)/√2 (Entanglement Generation)', value: 'plus' },
      ]},
      { key: 'targetState', label: 'Target Qubit (|q₁⟩)', type: 'select', default: 'zero', options: [
        { label: '|0⟩ Ground State', value: 'zero' },
        { label: '|1⟩ Excited State', value: 'one' },
        { label: '|-⟩ Superposition (Phase Kickback)', value: 'minus' },
      ]},
      { key: 'noiseLevel', label: 'Two-Qubit Cross-Talk Noise', type: 'range', min: 0, max: 20, step: 1, default: 0, unit: '%' },
    ],
    metrics: [
      { id: 'outputState', label: 'Two-Qubit Output State', format: (_s, p) => p.controlState === 'plus' && p.targetState === 'zero' ? 'Bell State |Φ+⟩ = (|00⟩+|11⟩)/√2' : p.controlState === 'one' && p.targetState === 'zero' ? '|11⟩' : '|00⟩' },
      { id: 'isEntangled', label: 'Quantum Entanglement', format: (_s, p) => p.controlState === 'plus' ? 'Yes (EPR Pair)' : 'No (Product State)' },
      { id: 'gateFidelity', label: 'CNOT Gate Fidelity', format: () => '99.5%' },
    ],
  }),
];
