/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester IV
 * Course: Thermal Engineering (U25ME402 / Professional Core Course - PCC)
 * Official Curriculum Source: Mechanical Engineering R2025, Anna University ME3451 / ME8493
 */

import type { ISimulationDefinition } from './types';
import type { ThermalSimId } from './thermal-engineering/core/types';

export const U25ME402_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester IV',
  regulation: 'R2025 Revised CBCS',
  courseCode: 'U25ME402',
  courseCodeAliases: ['ME3451', 'ME8493', 'U21ME402'],
  courseTitle: 'Thermal Engineering',
  category: 'PCC',
  credits: 3,
  ltpjc: '3-0-0-0-3',
  lectureHours: 45,
  labHours: 0,
  totalHours: 45,
  courseObjectives: [
    'To understand the fundamentals of heat transfer via conduction, convection, and radiation',
    'To analyze thermal resistance networks in single and multilayer composite walls',
    'To evaluate heat exchanger performance using LMTD and Effectiveness-NTU methods',
    'To investigate steam boiler construction, mountings, accessories, equivalent evaporation, and efficiency',
    'To examine vapor compression refrigeration (VCR) cycles, COP, and psychrometric cooling processes',
    'To apply the Steady Flow Energy Equation (SFEE) to thermal systems and equipment',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Apply', description: 'Calculate conductive, convective, and radiative heat transfer rates and thermal resistance networks' },
    { code: 'CO2', level: 'Analyze', description: 'Design and evaluate parallel-flow and counter-flow heat exchangers using LMTD and NTU methods' },
    { code: 'CO3', level: 'Apply', description: 'Calculate boiler equivalent evaporation, thermal efficiency, and prepare heat balance sheets' },
    { code: 'CO4', level: 'Evaluate', description: 'Analyze vapor compression refrigeration cycles, calculate COP, and evaluate refrigerant state points' },
    { code: 'CO5', level: 'Apply', description: 'Apply the Steady Flow Energy Equation to turbines, compressors, nozzles, and heat exchangers' },
  ],
  units: [
    { number: 1, title: 'I.C. ENGINES & GAS POWER CYCLES', hours: 9, outcome: 'CO1' },
    { number: 2, title: 'BOILERS AND STEAM POWER SYSTEMS', hours: 9, outcome: 'CO3' },
    { number: 3, title: 'STEAM NOZZLES AND TURBINES', hours: 9, outcome: 'CO5' },
    { number: 4, title: 'AIR COMPRESSORS & EXPANDERS', hours: 9, outcome: 'CO5' },
    { number: 5, title: 'REFRIGERATION, AIR CONDITIONING & HEAT TRANSFER', hours: 9, outcome: 'CO1, CO2, CO4' },
  ],
};

export const U25ME402_SUBJECT_KEYWORDS = [
  'u25me402',
  'me3451',
  'me8493',
  'thermal engineering',
  'heat transfer',
  'conduction',
  'convection',
  'radiation',
  'composite wall',
  'thermal resistance',
  'heat exchanger',
  'lmtd',
  'ntu',
  'boiler',
  'steam boiler',
  'equivalent evaporation',
  'refrigeration',
  'vcr',
  'chiller',
  'cop',
  'sfee',
  'energy balance',
];

export const U25ME402_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25me402-sim-01',
    title: 'Heat Transfer Explorer (Conduction, Convection & Radiation)',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '🌡️',
    shortDescription: 'Interactive 3D thermal transport through 1D conduction rods, convective boundary films, and radiant black/gray surfaces.',
    detailedDescription:
      'Explore fundamental thermal transfer mechanisms. Analyze Fourier conduction across variable materials and thicknesses, Newton convection cooling over heated plates, and Stefan-Boltzmann absolute fourth-power thermal radiation exchange in Kelvin.',
    learningObjectives: [
      'Apply Fourier\'s Law Q = kA(T1 - T2)/L to calculate conductive heat flux and temperature gradient',
      'Evaluate convective heat transfer Q = hA(Ts - T_inf) across natural and forced fluid flows',
      'Compute Stefan-Boltzmann radiation Q = εσA(Ts⁴ - Tsur⁴) utilizing absolute temperatures in Kelvin',
    ],
    formulaOverview: 'Conduction: Q = kA(T1-T2)/L · Convection: Q = hA(Ts-T_inf) · Radiation: Q = εσA(Ts⁴-Tsur⁴)',
    suggestedUnits: [5],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Conduction', 'Convection', 'Radiation', 'Heat Transfer', 'Fourier', 'Stefan-Boltzmann', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me402-sim-02',
    title: 'Thermal Resistance & Multilayer Composite Wall Simulator',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '🧱',
    shortDescription: 'Series thermal resistance network, interface temperature drops, and critical insulation thickness for industrial walls.',
    detailedDescription:
      'Simulate multi-layer furnace and building envelope walls in series. Calculate individual layer conductive resistances (L/kA), interior and exterior convective film resistances (1/hA), overall U-factor, and interface temperature gradients.',
    learningObjectives: [
      'Formulate series thermal resistance networks R_total = R_in + Σ(Li / ki*A) + R_out',
      'Determine internal interface temperatures and verify that high-resistance insulation absorbs the steepest temperature drops',
      'Calculate the overall heat transfer coefficient U = 1 / (R_total * A)',
    ],
    formulaOverview: 'R_cond = L / (k·A) · R_total = R_in + Σ(Li / ki·A) + R_out · Q = ΔT_total / R_total',
    suggestedUnits: [5],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Composite Wall', 'Thermal Resistance', 'Insulation', 'U-Factor', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me402-sim-03',
    title: 'Heat Exchanger Simulation (LMTD & Effectiveness-NTU)',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '🔄',
    shortDescription: 'Concentric double-pipe and shell-and-tube heat exchangers with parallel and counter flow thermography.',
    detailedDescription:
      'Compare parallel-flow and counter-flow heat exchangers. Investigate Log Mean Temperature Difference (LMTD), Number of Transfer Units (NTU), capacity ratio Cr, and effectiveness ε. Observe why counter-flow permits cold outlet temperature to exceed hot outlet temperature.',
    learningObjectives: [
      'Calculate LMTD = (ΔT1 - ΔT2) / ln(ΔT1 / ΔT2) for parallel and counter flow exchangers',
      'Apply the Effectiveness-NTU method to predict outlet temperatures without iterative LMTD trials',
      'Verify the first-law steady energy balance: Q_dot = m_h·cp_h·(Th,in - Th,out) = m_c·cp_c·(Tc,out - Tc,in)',
    ],
    formulaOverview: 'Q = U·A·LMTD = ε·C_min·(Th,in - Tc,in) · NTU = U·A / C_min',
    suggestedUnits: [5],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Heat Exchanger', 'LMTD', 'NTU', 'Counter Flow', 'Parallel Flow', 'Effectiveness', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me402-sim-04',
    title: 'Steam Boilers, Mountings & Energy Balance',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '🏭',
    shortDescription: 'Industrial steam boiler operation, equivalent evaporation, thermal efficiency, and first-law heat balance sheets.',
    detailedDescription:
      'Inspect industrial water-tube and fire-tube boilers. Observe combustion in the furnace firebox, natural circulation in inclined water tubes, steam separation in the drum, safety valve operation, equivalent evaporation from and at 100°C, and complete boiler heat balance sheets.',
    learningObjectives: [
      'Calculate equivalent evaporation m_e = [m_a · (h - h_f1)] / 2257 (kg/h) and factor of evaporation',
      'Determine boiler thermal efficiency η_b = [m_a · (h - h_f1)] / (m_f · CV) * 100%',
      'Formulate first-law heat balance sheets accounting for useful steam heat, flue gas chimney losses, and radiation',
    ],
    formulaOverview: 'm_e = m_a·(h - h_f1) / 2257 · η_b = [m_a·(h - h_f1)] / (m_f·CV) · Factor of Evap = (h - h_f1)/2257',
    suggestedUnits: [2],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Steam Boiler', 'Equivalent Evaporation', 'Boiler Efficiency', 'Mountings', 'Heat Balance Sheet', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me402-sim-05',
    title: 'Vapor Compression Refrigeration & Chiller Cycle',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '❄️',
    shortDescription: 'Closed VCR cycle with hermetic compressor, condenser, expansion valve, evaporator, COP, and P-h / T-s state points.',
    detailedDescription:
      'Simulate the standard Vapor Compression Refrigeration cycle. Track circulating refrigerant state points through compressor, air-cooled condenser, isenthalpic expansion valve, and evaporator chiller. Evaluate cooling capacity, compressor power, COP, and second law efficiency.',
    learningObjectives: [
      'Trace VCR state points on P-h diagrams (isentropic compression, constant-pressure condensation, isenthalpic throttling, evaporation)',
      'Calculate Coefficient of Performance COP_R = Q_L / W_in and COP_HP = Q_H / W_in',
      'Verify the steady cycle energy balance: Q_H = Q_L + W_in',
    ],
    formulaOverview: 'COP_R = (h1 - h4) / (h2 - h1) · COP_HP = (h2 - h3) / (h2 - h1) = COP_R + 1 · W_comp = m_dot·(h2 - h1)',
    suggestedUnits: [5],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Refrigeration', 'VCR Cycle', 'Chiller', 'COP', 'Compressor', 'Throttling', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me402-sim-06',
    title: 'Steady Flow Energy Equation (SFEE) & Performance Calculator',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '⚖️',
    shortDescription: 'Interactive first-law SFEE solver for steam turbines, compressors, nozzles, and heat exchangers.',
    detailedDescription:
      'Solve open-system steady-flow energy balances. Input mass flow rates, inlet/outlet pressures, temperatures, velocities, and elevations to calculate turbine shaft power output, compressor power input, nozzle exit jet velocity, or heat exchanger duties with step-by-step mathematical derivations.',
    learningObjectives: [
      'Apply the general SFEE: m_dot·[h1 + V1²/2000 + gZ1/1000] + Q_dot = m_dot·[h2 + V2²/2000 + gZ2/1000] + W_dot',
      'Deduce device-specific simplified equations for adiabatic steam turbines, compressors, and flow nozzles',
      'Verify strict conservation of energy between total inflow and outflow streams',
    ],
    formulaOverview: 'm_dot·(h1 + V1²/2000 + gZ1/1000) + Q_dot = m_dot·(h2 + V2²/2000 + gZ2/1000) + W_dot',
    suggestedUnits: [2, 3, 4],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['SFEE', 'Energy Balance', 'First Law', 'Steam Turbine', 'Compressor', 'Nozzle', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me402-sim-07',
    title: 'Thermal Engineering Virtual Laboratory & Trial Logger',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '📋',
    shortDescription: 'Virtual experimental workstation with observation logging, trial table generation, and CSV laboratory report export.',
    detailedDescription:
      'Conduct simulated thermal engineering laboratory trials. Record experimental data points for thermal conductivity measurement, heat exchanger effectiveness testing, boiler equivalent evaporation trials, and VCR chiller COP determination. Export formatted CSV trial sheets for lab submissions.',
    learningObjectives: [
      'Execute virtual laboratory test runs with realistic boundary conditions and parameter sweeps',
      'Construct structured observation tables comparing heat rates, thermal efficiencies, and performance coefficients',
      'Export formatted CSV trial data files for engineering lab records',
    ],
    formulaOverview: 'Virtual Laboratory Observation & Experimental Verification Suite',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Virtual Lab', 'Trials', 'Observation Table', 'CSV Export', 'Laboratory Practice', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me402-sim-08',
    title: 'Interactive 3D Thermal Engineering Bay (Digital Twin)',
    domain: 'PHYSICS',
    category: 'thermal engineering',
    icon: '🏢',
    shortDescription: 'Unified digital twin thermal bay floor integrating conduction stand, exchanger rig, boiler, and VCR chiller.',
    detailedDescription:
      'Comprehensive 3D thermal engineering digital twin bay uniting all four core thermal test rigs into one immersive workshop environment. Transition seamlessly between workstations, inspect equipment geometries, observe thermal flows, and evaluate syllabus mastery.',
    learningObjectives: [
      'Synthesize heat transfer, steam generation, heat exchange, and refrigeration in an integrated industrial plant setting',
      'Navigate interactive 3D inspection viewpoints across dedicated thermal testing stations',
      'Demonstrate mastery of Anna University U25ME402 Thermal Engineering competencies',
    ],
    formulaOverview: 'Unified Thermal Engineering Workshop Practice & Concept Evaluation',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'thermal-engineering',
    subjectKeywords: U25ME402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Thermal Bay', 'Digital Twin', 'Virtual Workshop', 'Overview', 'Exam Suite', 'U25ME402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25ME402SimId(id: string): ThermalSimId | null {
  if (id === 'u25me402-sim-01' || id.includes('heat-transfer') || id.includes('conduction')) return 'heat-transfer';
  if (id === 'u25me402-sim-02' || id.includes('composite') || id.includes('resistance')) return 'composite-wall';
  if (id === 'u25me402-sim-03' || id.includes('exchanger') || id.includes('lmtd')) return 'heat-exchanger';
  if (id === 'u25me402-sim-04' || id.includes('boiler') || id.includes('steam')) return 'steam-boiler';
  if (id === 'u25me402-sim-05' || id.includes('refrigeration') || id.includes('chiller')) return 'refrigeration-cycle';
  if (id === 'u25me402-sim-06' || id.includes('calculator') || id.includes('sfee')) return 'energy-calculator';
  if (id === 'u25me402-sim-07' || id.includes('lab') || id.includes('trial')) return 'thermal-lab';
  if (id === 'u25me402-sim-08' || id.includes('bay') || id.includes('workshop')) return 'virtual-bay';
  return null;
}

export function resolveU25ME402SimDefId(id: string): string | null {
  const sim = resolveU25ME402SimId(id);
  if (!sim) return null;
  switch (sim) {
    case 'heat-transfer': return 'u25me402-sim-01';
    case 'composite-wall': return 'u25me402-sim-02';
    case 'heat-exchanger': return 'u25me402-sim-03';
    case 'steam-boiler': return 'u25me402-sim-04';
    case 'refrigeration-cycle': return 'u25me402-sim-05';
    case 'energy-calculator': return 'u25me402-sim-06';
    case 'thermal-lab': return 'u25me402-sim-07';
    case 'virtual-bay': return 'u25me402-sim-08';
    default: return null;
  }
}

