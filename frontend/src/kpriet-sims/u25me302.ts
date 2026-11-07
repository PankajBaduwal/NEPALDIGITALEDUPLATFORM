/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Engineering Materials and Metallurgy (U25ME302 / Theory with Laboratory - TwL)
 * Official Source: ME - R2025 (Revised).pdf, Anna University ME3392 / ME8491 / ME6403
 */

import type { ISimulationDefinition } from './types';
import type { MetallurgySimId } from './materials-metallurgy-3d/core/types';

export const U25ME302_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester III',
  regulation: 'R2025 Revised CBCS',
  courseCode: 'U25ME302',
  courseCodeAliases: ['ME3392', 'ME8491', 'ME6403', 'U21ME302'],
  courseTitle: 'Engineering Materials and Metallurgy',
  category: 'PCC',
  type: 'TwL', // Theory with Laboratory
  credits: 3,
  ltpjc: '3-0-0-0-3',
  lectureHours: 45,
  labHours: 30,
  totalHours: 75,
  sourceDocument: 'ME - R2025 (Revised).pdf',
  syllabusPages: [61, 62],
  courseObjectives: [
    'To impart fundamental knowledge on constitutional binary phase diagrams and the iron-carbon equilibrium system',
    'To introduce crystallographic atomic arrangements (BCC, FCC, HCP) and mechanisms of plastic deformation',
    'To examine microstructural phase transformations during annealing, normalizing, quenching, and tempering of steels',
    'To evaluate mechanical properties of metallic alloys through tensile, hardness, and Charpy impact laboratory tests',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Analyze', description: 'Evaluate binary isomorphous and eutectic phase diagrams, Fe-Fe3C equilibrium, and apply the Lever Rule' },
    { code: 'CO2', level: 'Apply', description: 'Select suitable heat treatment thermal cycles (annealing, normalizing, quenching, tempering) and interpret TTT curves' },
    { code: 'CO3', level: 'Understand', description: 'Correlate composition, processing, and mechanical properties of ferrous steels, cast irons, and non-ferrous alloys' },
    { code: 'CO4', level: 'Analyze', description: 'Analyze crystal lattice geometry (BCC, FCC, HCP), packing factors, slip systems, and non-metallic composites' },
    { code: 'CO5', level: 'Evaluate', description: 'Perform tensile, Brinell/Rockwell hardness, and Charpy impact tests, and inspect metallographic microstructures' },
  ],
  units: [
    { number: 1, title: 'CONSTITUTION OF ALLOYS AND PHASE DIAGRAMS', hours: 9, outcome: 'CO1' },
    { number: 2, title: 'HEAT TREATMENT AND PHASE TRANSFORMATIONS', hours: 9, outcome: 'CO2' },
    { number: 3, title: 'FERROUS AND NON-FERROUS METALS', hours: 9, outcome: 'CO3' },
    { number: 4, title: 'NON-METALLIC MATERIALS AND COMPOSITES', hours: 9, outcome: 'CO4' },
    { number: 5, title: 'MECHANICAL PROPERTIES AND MATERIAL TESTING', hours: 9, outcome: 'CO5' },
  ],
  prescribedExperiments: [
    { number: 1, name: 'Metallographic specimen preparation: mounting, grinding, polishing, and chemical etching' },
    { number: 2, name: 'Microstructural examination of plain carbon steels (hypoeutectoid, eutectoid pearlite, hypereutectoid)' },
    { number: 3, name: 'Microstructural identification of cast irons (grey flakes, nodular ductile, white cementite)' },
    { number: 4, name: 'Heat treatment of steel: full annealing, normalizing, brine quenching, and tempering' },
    { number: 5, name: 'Brinell hardness testing (HBW) on ferrous and non-ferrous alloys' },
    { number: 6, name: 'Rockwell hardness evaluation (HRC diamond cone and HRB 1/16" steel ball)' },
    { number: 7, name: 'Tensile testing of mild steel specimen and determination of Young’s modulus, yield, and UTS' },
    { number: 8, name: 'Charpy V-notch and Izod impact toughness testing and DBTT transition evaluation' },
  ],
};

export const U25ME302_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25me302-crystal-structures',
    title: 'Metallic Crystal Structures (BCC, FCC, HCP) Laboratory',
    domain: 'PHYSICS',
    category: 'engineering materials and metallurgy',
    icon: '🧊',
    shortDescription: 'Interactive 3D unit cells for BCC, FCC, and HCP with atomic packing factors and close-packed slip planes.',
    detailedDescription:
      'High-fidelity 3D lattice visualizer showing atom-sharing geometry for Body-Centred Cubic (BCC, N = 2), Face-Centred Cubic (FCC, N = 4), and Hexagonal Close-Packed (HCP, N = 6). Toggle between ball-and-stick and space-filling APF modes, highlight close-packed slip planes ({110}, {111}, {0001}), and compute unit cell volume and packing factor.',
    learningObjectives: [
      'Understand corner, face-center, and body-center atomic position sharing in conventional unit cells',
      'Calculate lattice parameters: a = 4r/√3 (BCC) and a = 2√2·r (FCC) and ideal HCP axial ratio c/a = 1.633',
      'Correlate the 12 close-packed slip systems in FCC metals with their superior ductility compared to HCP and BCC',
    ],
    formulaOverview: 'N_BCC = 8(1/8)+1 = 2; N_FCC = 8(1/8)+6(1/2) = 4; APF = (N·V_atom) / V_cell; d_hkl = a / √(h²+k²+l²)',
    suggestedUnits: [5],
    boardEngine: 'materials-metallurgy',
    subjectKeywords: ['u25me302', 'me3392', 'me8491', 'materials science', 'metallurgy', 'crystal structures', 'bcc', 'fcc', 'hcp', 'lattice parameter', 'unit cell'],
    parameters: [],
    metrics: [],
    tags: ['crystal structures', 'bcc', 'fcc', 'hcp', 'apf', 'slip systems', 'u25me302'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me302-stress-strain',
    title: 'Mechanical Properties & Tensile Stress-Strain Laboratory',
    domain: 'PHYSICS',
    category: 'engineering materials and metallurgy',
    icon: '📈',
    shortDescription: '3D tensile specimen deformation with live stress-strain plot, Hooke’s law, yield offset, and necking.',
    detailedDescription:
      'Interactive mechanical testing simulator for 9 engineering alloys. Apply tensile loads, observe proportional elastic elongation, 0.2% offset yield strength, plastic flow volume conservation, localized necking, and ductile cup-and-cone fracture. Computes modulus of resilience and toughness.',
    learningObjectives: [
      'Distinguish engineering stress σ = F/A₀ and strain ε = ΔL/L₀ from true stress and true strain',
      'Evaluate Young’s modulus E, 0.2% proof stress, UTS, and percent elongation across steels, aluminium, brass, and cast iron',
      'Calculate the modulus of resilience Ur = σ_y² / (2E) and examine strain energy absorbed prior to fracture',
    ],
    formulaOverview: 'σ = F / A₀; ε = ΔL / L₀; σ = E·ε; σ_true = σ(1 + ε); ε_true = ln(1 + ε); U_r = σ_y² / (2E)',
    suggestedUnits: [5],
    boardEngine: 'materials-metallurgy',
    subjectKeywords: ['u25me302', 'me3392', 'stress strain', 'tensile test', 'youngs modulus', 'yield strength', 'necking', 'ductility', 'hookes law'],
    parameters: [],
    metrics: [],
    tags: ['stress strain', 'tensile test', 'yield strength', 'youngs modulus', 'resilience', 'u25me302'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me302-phase-diagram',
    title: 'Iron-Carbon (Fe-Fe3C) Equilibrium Phase Diagram & Lever Rule',
    domain: 'PHYSICS',
    category: 'engineering materials and metallurgy',
    icon: '⚗️',
    shortDescription: 'Complete interactive Fe-Fe3C phase diagram with cursor coordinate picking, invariant reactions, and Lever Rule.',
    detailedDescription:
      'Detailed metastable iron-iron carbide phase diagram spanning 0 to 6.67 wt% Carbon and 400°C to 1600°C. Interactive cursor identifies phase fields (ferrite, austenite, cementite, liquid), displays invariant reactions (Eutectic 1147°C, Eutectoid 727°C, Peritectic 1495°C), and generates dynamic horizontal tie-lines with Lever Rule phase fractions.',
    learningObjectives: [
      'Locate critical temperatures: A1 (727°C), A3 (912°C–727°C), and Acm (727°C–1147°C)',
      'Apply the Lever Rule: f_α = (C_β - C₀) / (C_β - C_α) to calculate proeutectoid and pearlite fractions',
      'Distinguish hypoeutectoid steels (< 0.76% C), eutectoid steel (0.76% C), hypereutectoid steels, and cast irons (> 2.11% C)',
    ],
    formulaOverview: 'f_α = (C_Fe3C - C₀) / (C_Fe3C - C_α); f_Fe3C = (C₀ - C_α) / (C_Fe3C - C_α); f_pro = (0.76 - C₀) / (0.76 - 0.022)',
    suggestedUnits: [1],
    boardEngine: 'materials-metallurgy',
    subjectKeywords: ['u25me302', 'me3392', 'fe-fe3c', 'iron carbon', 'phase diagram', 'lever rule', 'pearlite', 'austenite', 'ferrite', 'cementite', 'eutectoid'],
    parameters: [],
    metrics: [],
    tags: ['fe-fe3c', 'phase diagram', 'lever rule', 'pearlite', 'austenite', 'cementite', 'eutectoid', 'u25me302'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me302-heat-treatment',
    title: 'Heat Treatment Process & Industrial Furnace Thermal Simulator',
    domain: 'PHYSICS',
    category: 'engineering materials and metallurgy',
    icon: '🔥',
    shortDescription: '3D electric muffle furnace, thermal cycle animation, quench media cooling rates, and hardness kinetics.',
    detailedDescription:
      'Simulate industrial thermal heat treatment cycles: Full Annealing, Normalizing, Hardening Quench, and Tempering. Features glowing electric heating coils, specimen thermal incandescence (black → cherry red → bright orange 860°C), transfer to quench tank, steam bubbling, and resulting HRC hardness and microstructural changes.',
    learningObjectives: [
      'Select proper austenitizing temperatures: A3 + 50°C for hypoeutectoid steels and A1 + 50°C for hypereutectoid steels',
      'Compare cooling rates across media: Brine (~140°C/s), Water (~90°C/s), Oil (~35°C/s), Air (~2.5°C/s), Furnace (~0.04°C/s)',
      'Understand why rapid quenching produces brittle acicular Martensite and how tempering at 200–650°C restores toughness',
    ],
    formulaOverview: 'Annealing: T_aust = A3 + 50°C (Furnace Cool); Normalizing: Still Air Cool; Hardening: Quench > CCR; Tempering: Sub-A1 200–650°C',
    suggestedUnits: [2],
    boardEngine: 'materials-metallurgy',
    subjectKeywords: ['u25me302', 'me3392', 'heat treatment', 'annealing', 'normalizing', 'hardening', 'quenching', 'tempering', 'martensite', 'furnace'],
    parameters: [],
    metrics: [],
    tags: ['heat treatment', 'annealing', 'normalizing', 'quenching', 'tempering', 'martensite', 'hrc', 'u25me302'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me302-microstructure',
    title: 'Metallurgical Microscope & Grain Boundary Explorer',
    domain: 'PHYSICS',
    category: 'engineering materials and metallurgy',
    icon: '🔬',
    shortDescription: 'Optical microscope view with 100x–1000x objective lenses, grain boundary topology, and phase identification.',
    detailedDescription:
      'Circular ocular eyepiece viewer simulating an optical metallurgical microscope. Inspect 9 verified metallographic specimens: low/medium/high carbon steels, quenched martensite laths, tempered spheroids, grey iron flakes, ductile iron bull’s-eyes, white iron cementite, and Muntz brass. Includes focus depth knob and ASTM grain size estimation.',
    learningObjectives: [
      'Identify proeutectoid ferrite (light grains) and pearlite colonies (dark lamellae) etched with 2% Nital',
      'Distinguish graphite flake morphology in grey cast iron from spherical nodules in ductile cast iron',
      'Estimate ASTM grain size number G using N = 2^(G-1) (grains per square inch at 100×)',
    ],
    formulaOverview: 'N = 2^(n - 1) [ASTM E112 grain size at 100×]; Ferrite (white grains), Pearlite (lamellar), Martensite (acicular needles)',
    suggestedUnits: [3],
    boardEngine: 'materials-metallurgy',
    subjectKeywords: ['u25me302', 'me3392', 'microstructure', 'metallography', 'microscope', 'ferrite', 'pearlite', 'martensite', 'cast iron', 'astm grain size'],
    parameters: [],
    metrics: [],
    tags: ['microstructure', 'metallography', 'grain size', 'ferrite', 'pearlite', 'cast iron', 'u25me302'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me302-material-testing',
    title: 'Virtual Material Testing Laboratory (Hardness, Tensile & Impact)',
    domain: 'PHYSICS',
    category: 'engineering materials and metallurgy',
    icon: '🔨',
    shortDescription: 'Switchable 3D testing rigs: Brinell/Rockwell hardness tester, tensile UTM, and Charpy impact pendulum.',
    detailedDescription:
      'Operate three classic mechanical metallurgy testing rigs in interactive 3D: Benchtop Hardness Tester (Brinell 10mm ball, Rockwell HRC diamond cone, Rockwell HRB ball, Vickers 136° pyramid), Universal Tensile Testing machine, and Charpy/Izod swinging pendulum impact machine measuring fracture energy (J) and ductile-to-brittle transition (DBTT).',
    learningObjectives: [
      'Calculate Brinell hardness: HBW = 2F / [π·D·(D - √(D² - d²))] under 3000 kgf load',
      'Operate Rockwell scales: HRC = 100 - (e / 0.002 mm) and HRB = 130 - (e / 0.002 mm)',
      'Determine absorbed impact energy E = mgR(cos β - cos α) and examine the Charpy ductile-to-brittle transition curve',
    ],
    formulaOverview: 'HBW = 2F / [πD(D - √(D²-d²))]; HRC = 100 - (e/0.002); HV = 1.854(F/d²); E_impact = mgR(cos β - cos α)',
    suggestedUnits: [5],
    boardEngine: 'materials-metallurgy',
    subjectKeywords: ['u25me302', 'me3392', 'hardness test', 'brinell', 'rockwell', 'vickers', 'charpy', 'impact test', 'dbtt', 'material testing'],
    parameters: [],
    metrics: [],
    tags: ['hardness test', 'brinell', 'rockwell', 'charpy', 'impact test', 'material testing', 'u25me302'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me302-virtual-lab',
    title: 'Virtual Metallurgy Laboratory & Practical Examination Suite',
    domain: 'PHYSICS',
    category: 'engineering materials and metallurgy',
    icon: '🧪',
    shortDescription: 'Practical experiment SOPs, trial logging, interactive concept quiz, and print-ready laboratory records.',
    detailedDescription:
      'Complete practical laboratory suite supporting the 8 prescribed syllabus experiments. Log trial runs with simulated telemetry, test concept mastery via interactive assessment quizzes, and generate official, print-ready laboratory observation records and practical reports.',
    learningObjectives: [
      'Follow standard operating procedures (SOP) for metallographic polishing, etching, heat treatment, and hardness testing',
      'Record structured observation logs with alloy composition, heat treatment conditions, hardness, and microstructure',
      'Generate print-ready engineering laboratory records complete with objectives, formulas, tabulated trials, and conclusions',
    ],
    formulaOverview: 'All standard MT-II / Metallurgy laboratory formulas: HBW, HRC, HRB, HV, Lever Rule, Hooke’s Modulus, Charpy Energy',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'materials-metallurgy',
    subjectKeywords: ['u25me302', 'me3392', 'metallurgy lab', 'practical report', 'observation table', 'quiz', 'engineering report'],
    parameters: [],
    metrics: [],
    tags: ['metallurgy lab', 'observation table', 'practical report', 'assessment', 'u25me302'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25ME302SimId(rawId: string): MetallurgySimId {
  const norm = (rawId || '').toLowerCase().trim();
  if (norm.includes('crystal') || norm.includes('lattice') || norm.includes('bcc') || norm.includes('fcc') || norm.includes('hcp')) {
    return 'u25me302-crystal-structures';
  }
  if (norm.includes('stress') || norm.includes('strain') || norm.includes('tensile') || norm.includes('hooke')) {
    return 'u25me302-stress-strain';
  }
  if (norm.includes('phase') || norm.includes('diagram') || norm.includes('fe-fe3c') || norm.includes('lever') || norm.includes('eutectoid')) {
    return 'u25me302-phase-diagram';
  }
  if (norm.includes('heat') || norm.includes('anneal') || norm.includes('normaliz') || norm.includes('quench') || norm.includes('temper')) {
    return 'u25me302-heat-treatment';
  }
  if (norm.includes('micro') || norm.includes('grain') || norm.includes('metallograph') || norm.includes('optical')) {
    return 'u25me302-microstructure';
  }
  if (norm.includes('test') || norm.includes('hardness') || norm.includes('brinell') || norm.includes('rockwell') || norm.includes('charpy') || norm.includes('impact')) {
    return 'u25me302-material-testing';
  }
  if (norm.includes('lab') || norm.includes('report') || norm.includes('quiz') || norm.includes('observation')) {
    return 'u25me302-virtual-lab';
  }
  return 'u25me302-crystal-structures';
}
