import type { ISimulationDefinition } from './types';
import type { HydraulicSimId } from './hydraulic-lab-3d/core/types';

export const U25CE401_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ce401-hydrostatic-pressure',
    title: 'Hydrostatic Pressure & Centre of Pressure Laboratory',
    domain: 'CIVIL',
    category: 'fluid mechanics',
    icon: '🌊',
    shortDescription: 'High-clarity 3D acrylic tank measuring pressure depth variation, resultant force, and submerged plane centre of pressure.',
    detailedDescription:
      'Interactive 3D fluid statics laboratory featuring an optical-grade acrylic tank, graduated vernier depth scale, movable pressure sensor probe, and pivoted submerged vertical/inclined plane surface confirming p = ρgh and h* = h_bar + (IG·sin²θ)/(A·h_bar) per U25CE401 Unit I.',
    learningObjectives: [
      'Investigate gauge and absolute hydrostatic pressure variation with fluid depth and density',
      'Calculate total hydrostatic resultant force acting on vertical and inclined plane surfaces',
      'Verify that the Centre of Pressure always acts below the geometric centroid due to trapezoidal pressure prisms',
    ],
    formulaOverview: 'p = ρ · g · h; F = ρ · g · h_bar · A; h* = h_bar + (IG · sin²θ) / (A · h_bar)',
    suggestedUnits: [1],
    boardEngine: 'hydraulic',
    subjectKeywords: ['u25ce401', 'u25ce406', 'fluid mechanics', 'hydrostatic pressure', 'centre of pressure', 'fluid statics'],
    parameters: [],
    metrics: [],
    tags: ['hydrostatics', 'centre of pressure', 'fluid statics', 'u25ce401', 'u25ce406'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce401-bernoulli-venturi',
    title: "Bernoulli's Theorem & Venturimeter Flow Measurement",
    domain: 'CIVIL',
    category: 'fluid mechanics',
    icon: '🧪',
    shortDescription: 'Transparent 3D converging-diverging Venturimeter tube with multi-column piezometer battery validating energy conservation.',
    detailedDescription:
      'Production-grade 3D perspex Venturimeter apparatus equipped with 8 vertical glass piezometer columns tapping pressure ports from inlet through constriction and diffuser, validating continuity and Bernoulli’s theorem per U25CE401 Unit II and U25CE406 Experiment 2 & 4.',
    learningObjectives: [
      'Measure pressure and velocity distribution along converging, throat, and diffuser sections',
      'Demonstrate trade-off between kinetic velocity head v²/(2g) and static pressure head p/(ρg)',
      'Calculate theoretical vs actual discharge and determine the Venturimeter discharge coefficient (Cd)',
    ],
    formulaOverview: 'p₁/(ρg) + v₁²/(2g) + z₁ = p₂/(ρg) + v₂²/(2g) + z₂; Q_act = Cd · [a₁a₂/√(a₁² - a₂²)] · √(2gh)',
    suggestedUnits: [2],
    boardEngine: 'hydraulic',
    subjectKeywords: ['u25ce401', 'u25ce406', 'bernoulli', 'venturimeter', 'piezometer', 'discharge measurement'],
    parameters: [],
    metrics: [],
    tags: ['bernoulli', 'venturimeter', 'energy equation', 'u25ce401', 'u25ce406'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce401-pipe-friction-losses',
    title: 'Pipe Flow, Friction Factor & Energy Loss Laboratory',
    domain: 'CIVIL',
    category: 'fluid mechanics',
    icon: '🔧',
    shortDescription: 'Dual-pipe test loop measuring major Darcy-Weisbach frictional loss and minor local fitting losses across flow regimes.',
    detailedDescription:
      'Rigorous 3D pipe network test bench with parallel smooth brass and commercial steel pipes, variable-speed supply pump, differential mercury manometer, and fittings evaluating laminar, transitional, and turbulent friction factors per U25CE401 Unit III and U25CE406 Experiment 5 & 6.',
    learningObjectives: [
      'Classify laminar, transitional, and turbulent pipe flow using Reynolds number Re = ρvD/μ',
      'Verify the Hagen-Poiseuille law (f = 64/Re) for laminar flow and Colebrook-White / Swamee-Jain formulas for turbulent flow',
      'Quantify minor head losses across sudden contraction, enlargement, elbows, and regulating gate valves',
    ],
    formulaOverview: 'hf = f · (L/D) · (v² / 2g); Re = ρvD / μ; hm = Σ k · (v² / 2g)',
    suggestedUnits: [3],
    boardEngine: 'hydraulic',
    subjectKeywords: ['u25ce401', 'u25ce406', 'pipe friction', 'darcy weisbach', 'reynolds number', 'minor losses'],
    parameters: [],
    metrics: [],
    tags: ['pipe friction', 'head loss', 'darcy', 'reynolds', 'u25ce401', 'u25ce406'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce401-open-channel-flume',
    title: 'Open-Channel Flow, Froude Regimes & Hydraulic Jump Flume',
    domain: 'CIVIL',
    category: 'fluid mechanics',
    icon: '🌊',
    shortDescription: 'Tilting glass-walled rectangular flume with sluice gate, Froude classification, and energy-dissipating hydraulic jump.',
    detailedDescription:
      'Laboratory tilting rectangular flume with clear glass sidewalls, jackscrew bed slope adjustment, sharp-crested sluice gate, hook gauge, and animated hydraulic jump validating Belanger’s conjugate depth equation and Manning’s open-channel formula per U25CE401 Unit V.',
    learningObjectives: [
      'Classify open-channel flow regimes as subcritical (Fr < 1), critical (Fr = 1), or supercritical (Fr > 1)',
      'Calculate specific energy E = y + v²/(2g) and critical depth yc = (q²/g)^(1/3)',
      'Demonstrate formation of stationary hydraulic jumps and quantify turbulent energy dissipation ΔE',
    ],
    formulaOverview: 'Fr = V / √(g · y); y₂/y₁ = 0.5 · [√(1 + 8·Fr₁²) - 1]; ΔE = (y₂ - y₁)³ / (4·y₁·y₂)',
    suggestedUnits: [5],
    boardEngine: 'hydraulic',
    subjectKeywords: ['u25ce401', 'u25ce406', 'open channel', 'hydraulic jump', 'froude number', 'flume', 'mannings'],
    parameters: [],
    metrics: [],
    tags: ['open channel', 'hydraulic jump', 'froude', 'flume', 'u25ce401', 'u25ce406'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce401-discharge-structures',
    title: 'Discharge Measuring Structures (Orifice & V-Notch)',
    domain: 'CIVIL',
    category: 'fluid mechanics',
    icon: '📐',
    shortDescription: 'Calibrated constant-head circular orifice jet apparatus and triangular 90° V-Notch weir channel.',
    detailedDescription:
      'High-precision discharge calibration station featuring a constant-head tank with sharp-edged circular orifice, parabolic jet trajectory needles, and an open channel weir with a 90° triangular V-notch and hook gauge per U25CE401 Unit II and U25CE406 Experiment 3.',
    learningObjectives: [
      'Determine orifice hydraulic coefficients: discharge Cd, velocity Cv, and contraction Cc',
      'Measure parabolic free-jet trajectory coordinates to verify Torricelli’s velocity theorem v = √(2gH)',
      'Calibrate 90° V-notch and rectangular weir discharge equations over varying piezometric crest heads',
    ],
    formulaOverview: 'Orifice: Q = Cd · a₀ · √(2gH); 90° V-Notch: Q = (8/15) · Cd · √(2g) · tan(θ/2) · H^(5/2)',
    suggestedUnits: [2],
    boardEngine: 'hydraulic',
    subjectKeywords: ['u25ce401', 'u25ce406', 'orifice meter', 'v-notch', 'weir', 'discharge calibration'],
    parameters: [],
    metrics: [],
    tags: ['orifice', 'v-notch', 'weir', 'discharge', 'u25ce401', 'u25ce406'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25CE401SimId(rawId: string): HydraulicSimId | null {
  const normalized = rawId.toLowerCase().trim();
  if (normalized.includes('hydrostatic') || normalized.includes('pressure')) return '01-hydrostatic';
  if (normalized.includes('bernoulli') || normalized.includes('venturi')) return '02-bernoulli-venturi';
  if (normalized.includes('friction') || normalized.includes('pipe') || normalized.includes('loss')) return '03-pipe-friction';
  if (normalized.includes('channel') || normalized.includes('flume') || normalized.includes('jump')) return '04-open-channel';
  if (normalized.includes('discharge') || normalized.includes('notch') || normalized.includes('orifice')) return '05-discharge-structures';
  return null;
}

export function toHydraulic3DSimId(simId: string): HydraulicSimId {
  const resolved = resolveU25CE401SimId(simId);
  return resolved || '02-bernoulli-venturi';
}
