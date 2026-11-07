/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Fluid Mechanics and Machinery (U25MEG05 / Common to ME, MI)
 * Laboratory: Fluid Mechanics and Machinery Laboratory (U25ME304 / U25ME311)
 * Official Source: ME - R2025 (Revised).pdf, Printed Pages 60, 61 & 69
 */

import type { ISimulationDefinition } from './types';

export const U25MEG05_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester III',
  regulation: 'R2025 Revised CBCS',
  theoryCourseCode: 'U25MEG05',
  laboratoryCourseCode: 'U25ME304',
  courseCodeAliases: ['U25ME303', 'U25ME311', 'ME3391', 'CE3391'],
  theoryCourseTitle: 'Fluid Mechanics and Machinery',
  laboratoryCourseTitle: 'Fluid Mechanics and Machinery Laboratory',
  commonTo: 'ME, MI',
  category: 'PCC',
  theoryCredits: 3,
  labCredits: 1,
  theoryLtpjc: '3-0-0-0-3',
  labLtpjc: '0-0-2-0-1',
  lectureHours: 45,
  labHours: 30,
  sourceDocument: 'ME - R2025 (Revised).pdf',
  syllabusPages: [60, 61, 69],
  courseObjectives: [
    'To learn the fluid properties and their flow dynamics',
    'To solve the fluid flow problems and analyze the performance of the hydraulic machines',
    'To impart knowledge of dimensional analysis in fluid flow',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Apply', description: 'Determine the properties of fluids and solve fluid dynamics problems' },
    { code: 'CO2', level: 'Apply', description: 'Apply concepts of boundary layer, flow through pipes, and loss estimation methods' },
    { code: 'CO3', level: 'Apply', description: 'Use principles of dimensional analysis and similitude to develop dimensionless parameters' },
    { code: 'CO4', level: 'Analyze', description: 'Investigate performance of pumps using velocity triangles, efficiencies and characteristics' },
    { code: 'CO5', level: 'Analyze', description: 'Evaluate performance characteristics of turbines using velocity triangles and specific speed' },
  ],
  units: [
    { number: 1, title: 'FLUID PROPERTIES, STATICS AND DYNAMICS', hours: 15, page: 60, outcome: 'CO1' },
    { number: 2, title: 'BOUNDARY LAYER AND FLOW THROUGH PIPES', hours: 15, page: 60, outcome: 'CO2' },
    { number: 3, title: 'DIMENSIONAL ANALYSIS', hours: 15, page: 61, outcome: 'CO3' },
    { number: 4, title: 'HYDRAULIC PUMPS', hours: 15, page: 61, outcome: 'CO4' },
    { number: 5, title: 'HYDRAULIC TURBINES', hours: 15, page: 61, outcome: 'CO5' },
  ],
  prescribedExperiments: [
    { number: 1, name: "Verification of Bernoulli's theorem" },
    { number: 2, name: 'Calibration of a venturimeter' },
    { number: 3, name: 'Calibration of an orifice meter' },
    { number: 4, name: 'Calibration of a rotameter' },
    { number: 5, name: 'Determination of co-efficient of friction in a pipe flow' },
    { number: 6, name: 'Performance characteristics of a centrifugal pump' },
    { number: 7, name: 'Performance characteristics of a reciprocating pump' },
    { number: 8, name: 'Performance characteristics of a Pelton wheel turbine' },
    { number: 9, name: 'Performance characteristics of a Francis turbine' },
  ],
};

export const U25MEG05_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ─── 1. BERNOULLI'S THEOREM ───────────────────────────────────────────────
  {
    id: 'u25me-bernoulli-theorem',
    title: "Verification of Bernoulli's Theorem Rig",
    domain: 'CIVIL',
    category: 'fluid mechanics and machinery',
    icon: '📏',
    shortDescription: 'Energy conservation in converging-diverging venturi conduit with 9 static piezometric head columns.',
    detailedDescription:
      "Interactive 3D converging-diverging venturi conduit with 9 vertical piezometer manometer tubes. Demonstrates static and dynamic energy conservation along horizontal and inclined flow paths, throat pressure minimum, and diffuser pressure recovery.",
    learningObjectives: [
      "Demonstrate conservation of total hydraulic energy: H = (p/ρg) + (v²/2g) + z = Constant",
      "Observe pressure drop at constricted throat and subsequent pressure recovery in diffuser",
      "Compute localized velocity, velocity head, and verify continuity Q = A(x)·v(x)",
    ],
    formulaOverview: 'H = (p / ρg) + (v² / 2g) + z = Constant; Q = A₁v₁ = A₂v₂',
    suggestedUnits: [1],
    boardEngine: 'fluid-machinery',
    subjectKeywords: [
      'u25meg05',
      'u25me304',
      'u25me303',
      'u25me311',
      'bernoulli',
      'bernoulli theorem',
      'fluid mechanics',
      'converging diverging duct',
      'piezometer',
    ],
    parameters: [],
    metrics: [],
    tags: ['bernoulli', 'energy equation', 'fluid dynamics', 'u25meg05'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },

  // ─── 2. PIPE FRICTION & LOSSES ────────────────────────────────────────────
  {
    id: 'u25me-pipe-friction',
    title: 'Pipe Friction & Minor Losses Apparatus',
    domain: 'CIVIL',
    category: 'fluid mechanics and machinery',
    icon: '🧪',
    shortDescription: 'Darcy-Weisbach friction coefficient evaluation with U-tube differential mercury manometer across laminar and turbulent regimes.',
    detailedDescription:
      'Multi-pipe testing rig measuring Darcy-Weisbach frictional loss in 15mm, 20mm, and 25mm bore pipes using a differential mercury manometer across laminar and turbulent regimes with Moody diagram calibration.',
    learningObjectives: [
      'Determine Darcy friction factor f and verify laminar regime f = 64/Re',
      'Evaluate turbulent friction using Blasius equation and Moody diagram',
      'Measure differential mercury manometer deflection y and compute head loss hf = 12.6·y',
    ],
    formulaOverview: 'hf = (4 · f · L · v²) / (2 · g · D); Re = (ρ · v · D) / μ; hf = y · (Sm - 1)',
    suggestedUnits: [2],
    boardEngine: 'fluid-machinery',
    subjectKeywords: [
      'u25meg05',
      'u25me304',
      'pipe friction',
      'darcy weisbach',
      'friction factor',
      'minor losses',
      'moody chart',
      'reynolds number',
    ],
    parameters: [],
    metrics: [],
    tags: ['pipe friction', 'darcy', 'head loss', 'manometer', 'u25meg05'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },

  // ─── 3. FLOW METERS (VENTURI, ORIFICE, ROTAMETER) ─────────────────────────
  {
    id: 'u25me-flow-meters',
    title: 'Flow Meters Calibration Bench (Venturi, Orifice, Rotameter)',
    domain: 'CIVIL',
    category: 'fluid mechanics and machinery',
    icon: '⏱️',
    shortDescription: 'Calibration of Venturimeter (Cd ≈ 0.97), thin plate Orifice meter (Cd ≈ 0.62), and variable-area Rotameter.',
    detailedDescription:
      'Calibration of Venturimeter (Cd ≈ 0.97), thin plate Orifice meter (Cd ≈ 0.62), and variable-area vertical Rotameter against volumetric collecting tank readings with vena contracta analysis.',
    learningObjectives: [
      'Calibrate Venturimeter, Orifice meter, and Rotameter over varying discharge ranges',
      'Compare coefficient of discharge (Cd) and explain vena contracta eddy losses',
      'Analyze linear float displacement vs flow rate relationship in variable-area rotameter',
    ],
    formulaOverview: 'Qth = [a₁a₂ / √(a₁² - a₂²)] · √(2gh); Qact = Cd · Qth = A_tank · R / t',
    suggestedUnits: [1, 2],
    boardEngine: 'fluid-machinery',
    subjectKeywords: [
      'u25meg05',
      'u25me304',
      'venturimeter',
      'orifice meter',
      'rotameter',
      'flow meter calibration',
      'coefficient of discharge',
    ],
    parameters: [],
    metrics: [],
    tags: ['venturimeter', 'orifice', 'rotameter', 'discharge', 'u25meg05'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },

  // ─── 4. CENTRIFUGAL & RECIPROCATING PUMPS ─────────────────────────────────
  {
    id: 'u25me-centrifugal-reciprocating-pumps',
    title: 'Hydraulic Pumps Performance Test Rig',
    domain: 'CIVIL',
    category: 'fluid mechanics and machinery',
    icon: '⚙️',
    shortDescription: 'Operating characteristics of single-stage Centrifugal pump & double-acting Reciprocating pump with air vessels.',
    detailedDescription:
      'Performance testing of single-stage volute Centrifugal pump (H-Q, η-Q, P-Q curves) and double-acting Reciprocating pump with indicator diagrams, acceleration head damping, and air vessels.',
    learningObjectives: [
      'Evaluate total manometric head Hm, hydraulic power, and overall efficiency of centrifugal pump',
      'Observe affinity laws and centrifugal pump throttling characteristics',
      'Calculate theoretical discharge, positive/negative slip %, and indicator power of reciprocating pump',
    ],
    formulaOverview: 'Hm = Hd + Hs + z; Phyd = (ρ · g · Q · Hm)/1000; ηo = Phyd/Pin; Slip % = (Qth - Qact)/Qth',
    suggestedUnits: [4],
    boardEngine: 'fluid-machinery',
    subjectKeywords: [
      'u25meg05',
      'u25me304',
      'centrifugal pump',
      'reciprocating pump',
      'pump characteristics',
      'indicator diagram',
      'air vessel',
      'slip',
    ],
    parameters: [],
    metrics: [],
    tags: ['centrifugal pump', 'reciprocating pump', 'efficiency', 'affinity laws', 'u25meg05'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },

  // ─── 5. HYDRAULIC TURBINES (PELTON & FRANCIS) ─────────────────────────────
  {
    id: 'u25me-hydraulic-turbines',
    title: 'Hydraulic Turbines Dynamics Suite (Pelton & Francis)',
    domain: 'CIVIL',
    category: 'fluid mechanics and machinery',
    icon: '⚡',
    shortDescription: 'Impulse Pelton wheel and reaction Francis turbine characteristics, draft tube vacuum recovery, and unit quantities.',
    detailedDescription:
      'Operating characteristics and efficiency evaluation of Pelton wheel tangential impulse turbine and Francis inward reaction turbine with draft tube vacuum recovery, velocity triangles, and unit speed scaling.',
    learningObjectives: [
      'Investigate Pelton wheel impulse momentum transfer with spear nozzle control',
      'Analyze Francis turbine mixed-flow runner dynamics and draft tube kinetic recovery',
      'Calculate brake shaft power, overall efficiency, specific speed Ns, and unit quantities',
    ],
    formulaOverview: 'Ps = [2π · N · (W - S) · Rb · g] / 60000; ηo = Ps/Phyd; Ns = [N · √Ps] / H^(5/4)',
    suggestedUnits: [5],
    boardEngine: 'fluid-machinery',
    subjectKeywords: [
      'u25meg05',
      'u25me304',
      'pelton wheel',
      'francis turbine',
      'hydraulic turbines',
      'draft tube',
      'spear nozzle',
      'specific speed',
      'unit quantities',
    ],
    parameters: [],
    metrics: [],
    tags: ['pelton wheel', 'francis turbine', 'specific speed', 'unit quantities', 'u25meg05'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },

  // ─── 6. UNIFIED MACHINERY PERFORMANCE LAB ─────────────────────────────────
  {
    id: 'u25me-machinery-performance-lab',
    title: 'Fluid Mechanics & Machinery Plant',
    domain: 'CIVIL',
    category: 'fluid mechanics and machinery',
    icon: '🏭',
    shortDescription: 'Integrated mechanical engineering testing plant with closed-loop circulation spanning all 9 syllabus experiments.',
    detailedDescription:
      'Integrated laboratory plant with closed-loop sump circulation spanning all 9 prescribed mechanical engineering fluid experiments: Bernoulli, pipe friction, flow meters, pumps, and hydraulic turbines.',
    learningObjectives: [
      'Navigate the connected testing facility and understand closed-loop sump fluid recirculation',
      'Compare impulse vs reaction turbines and rotodynamic vs positive displacement pumps',
      'Generate comprehensive practical examination reports with recorded experimental trials',
    ],
    formulaOverview: 'η_overall = Mechanical Power / Hydraulic Power; Ns = f(N, Q, P, H)',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'fluid-machinery',
    subjectKeywords: [
      'u25meg05',
      'u25me304',
      'fluid machinery lab',
      'hydraulic machines',
      'complete plant',
      'kpriet fluid lab',
    ],
    parameters: [],
    metrics: [],
    tags: ['fluid machinery lab', 'hydraulic machines', 'kpriet fluid lab', 'u25meg05'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25MEG05SimId(query: string): string | null {
  const q = query.toLowerCase().trim();
  for (const sim of U25MEG05_BOARD_SIMULATIONS) {
    if (sim.id === q) return sim.id;
    if (sim.title.toLowerCase() === q) return sim.id;
    if (sim.subjectKeywords?.some((k) => k.toLowerCase() === q)) return sim.id;
  }

  if (q.includes('bernoulli')) return 'u25me-bernoulli-theorem';
  if (q.includes('friction') || q.includes('pipe') || q.includes('darcy')) return 'u25me-pipe-friction';
  if (q.includes('venturi') || q.includes('orifice') || q.includes('rotameter') || q.includes('flow meter'))
    return 'u25me-flow-meters';
  if (q.includes('pump') || q.includes('centrifugal') || q.includes('reciprocating'))
    return 'u25me-centrifugal-reciprocating-pumps';
  if (q.includes('turbine') || q.includes('pelton') || q.includes('francis'))
    return 'u25me-hydraulic-turbines';
  if (q.includes('u25meg05') || q.includes('u25me304') || q.includes('u25me303') || q.includes('u25me311') || q.includes('machinery'))
    return 'u25me-machinery-performance-lab';

  return null;
}
