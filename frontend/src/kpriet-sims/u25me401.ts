/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester IV
 * Course: Manufacturing Technology – II (U25ME401 / Professional Core Course - PCC)
 * Official Source: Mechanical Engineering Curriculum R2025, Anna University ME3491 / ME8451
 */

import type { ISimulationDefinition } from './types';
import type { Manufacturing2SimId } from './manufacturing-tech-2/core/types';

export const U25ME401_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester IV',
  regulation: 'R2025 Revised CBCS',
  courseCode: 'U25ME401',
  courseCodeAliases: ['ME3491', 'ME8451', 'U21ME401'],
  courseTitle: 'Manufacturing Technology – II',
  category: 'PCC',
  credits: 3,
  ltpjc: '3-0-0-0-3',
  lectureHours: 45,
  labHours: 0,
  totalHours: 45,
  courseObjectives: [
    'To understand the construction, kinematics, and part programming of CNC machine tools and tool-path generation',
    'To evaluate non-traditional machining processes including EDM, ECM, laser beam machining, and abrasive water-jet machining',
    'To examine welding processes, joint geometry preparation, heat input, and weld defect prevention',
    'To apply casting design principles including gating ratios, Chvorinov solidification modeling, and riser sizing',
    'To analyze plastic deformation mechanics in metal forming processes including forging, extrusion, rolling, and drawing',
    'To select optimum manufacturing processes based on component geometry, material, tolerance, and production volume',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Apply', description: 'Generate and simulate CNC part programs and tool paths for milling, turning, and hole-making operations' },
    { code: 'CO2', level: 'Analyze', description: 'Compare material removal mechanisms, process parameters, and surface integrity in non-traditional machining' },
    { code: 'CO3', level: 'Apply', description: 'Calculate welding heat input, joint efficiency, and diagnose potential welding defects in structural joints' },
    { code: 'CO4', level: 'Apply', description: 'Design sprue, gating systems, and risers using Chvorinov modulus rule for sound casting production' },
    { code: 'CO5', level: 'Evaluate', description: 'Calculate deformation forces and power requirements in forging, rolling, extrusion, and wire drawing' },
  ],
  units: [
    { number: 1, title: 'THEORY OF METAL CUTTING & MACHINE TOOLS', hours: 9, outcome: 'CO1' },
    { number: 2, title: 'ABRASIVE PROCESSES AND BROACHING', hours: 9, outcome: 'CO2' },
    { number: 3, title: 'CNC MACHINE TOOLS AND PART PROGRAMMING', hours: 9, outcome: 'CO1' },
    { number: 4, title: 'UNCONVENTIONAL MACHINING PROCESSES', hours: 9, outcome: 'CO2' },
    { number: 5, title: 'MANUFACTURING TECHNOLOGIES & PROCESS SELECTION', hours: 9, outcome: 'CO3, CO4, CO5' },
  ],
};

export const U25ME401_SUBJECT_KEYWORDS = [
  'u25me401',
  'me3491',
  'me8451',
  'manufacturing technology ii',
  'manufacturing technology 2',
  'cnc',
  'part programming',
  'tool path',
  'g-code',
  'edm',
  'ecm',
  'laser machining',
  'waterjet',
  'welding',
  'casting',
  'mould design',
  'chvorinov',
  'forging',
  'extrusion',
  'rolling',
  'wire drawing',
];

export const U25ME401_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25me401-sim-01',
    title: 'CNC Machines & Tool-Path Visualization Laboratory',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🧭',
    shortDescription: 'Interactive 3D CNC machining station with tool-path generation, G-code preview, and feeds/speeds controls.',
    detailedDescription:
      '3-Axis CNC machining center featuring machine bed, worktable, workpiece, tool holder, spindle, and solid carbide endmill. Generate and observe straight and contoured tool paths, step-by-step G-code execution, and real-time material removal metrics.',
    learningObjectives: [
      'Understand machine coordinate systems (X, Y, Z) and Cartesian workpiece datum presets',
      'Distinguish rapid positioning (G00) from programmed linear cutting interpolation (G01)',
      'Analyze the interplay between spindle speed (RPM), feed rate (mm/min), depth of cut, and material removal rate',
    ],
    formulaOverview: 'V = (π·D·N) / 1000; T_m = L / F; MRR = w·d·F',
    suggestedUnits: [3],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['CNC', 'G-Code', 'Tool Path', 'Milling', 'Machining', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me401-sim-02',
    title: 'Non-Traditional Machining Explorer — EDM, ECM, Laser & Water-Jet',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '⚡',
    shortDescription: 'Comparative 3D physics simulator for non-traditional machining: spark gap, anodic dissolution, optical ablation, and supersonic jet.',
    detailedDescription:
      'Explore unconventional machining processes without mechanical cutting forces: Electrical Discharge Machining (EDM dielectric spark erosion), Electrochemical Machining (ECM Faraday anodic dissolution with zero tool wear), Laser Beam Machining (focused optical ablation), and Abrasive Water-Jet Machining (supersonic hydrodynamic erosion).',
    learningObjectives: [
      'Compare thermoelectric spark erosion (EDM) with electrochemical dissolution (ECM)',
      'Analyze why ECM has zero tool wear and zero heat-affected zone',
      'Evaluate material compatibility, power density, and surface roughness across non-traditional methods',
    ],
    formulaOverview: 'ECM: MRR = (A·I) / (ρ·z·F); EDM: MRR ∝ I·duty_cycle; LBM: P_d = 4P / (π·d²)',
    suggestedUnits: [4],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Non-Traditional', 'EDM', 'ECM', 'Laser', 'Waterjet', 'Unconventional', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me401-sim-03',
    title: 'Welding Processes & Weld-Joint Visualization Suite',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🔥',
    shortDescription: 'Interactive 3D welding suite with 5 joint configurations, arc physics, heat input calculations, and defect analysis.',
    detailedDescription:
      'Virtual welding workstation supporting SMAW, GMAW, and GTAW. Inspect Butt, Lap, Tee, Corner, and Edge joints with animated traveling torch, electric arc glow, molten weld pool, solidified ripple bead, heat-affected zone (HAZ) gradient, and AWS defect diagnostics.',
    learningObjectives: [
      'Calculate net welding heat input H = (η·V·I) / (1000·v) in kJ/mm',
      'Examine how heat input and cooling rate govern HAZ microstructure and grain coarsening',
      'Identify root causes of welding defects including burn-through, undercutting, and lack of penetration',
    ],
    formulaOverview: 'H = (η·V·I) / (1000·v); Joint Efficiency η_j = P_weld / P_base',
    suggestedUnits: [5],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Welding', 'SMAW', 'GMAW', 'GTAW', 'Joints', 'HAZ', 'Defects', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me401-sim-04',
    title: 'Casting Processes & Gating / Riser Design Explorer',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '📦',
    shortDescription: 'Cope & Drag sand mould cross-section with pouring sequence, Chvorinov solidification modeling, and riser sizing.',
    detailedDescription:
      '3D sand mould assembly displaying cope, drag, parting line, pouring basin, sprue, runner, gate, casting cavity, and feeder riser. Animate molten metal pouring, sprue choke velocity, Chvorinov solidification time, and mould shakeout.',
    learningObjectives: [
      'Apply Chvorinov\'s Rule t = B·(V/A)² to compute casting and riser solidification times',
      'Design top and side cylindrical risers satisfying Modulus condition M_riser ≥ 1.2·M_casting',
      'Calculate sprue choke area via Torricelli continuity equation to prevent air aspiration',
    ],
    formulaOverview: 't_s = B·(V/A)²; M_c = V_c / A_c; A_c = Volume / (t_p · v · c_d)',
    suggestedUnits: [5],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Casting', 'Mould Design', 'Riser', 'Sprue', 'Chvorinov', 'Foundry', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me401-sim-05',
    title: 'Metal Forming Processes — Forging, Extrusion, Rolling & Drawing',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🧱',
    shortDescription: '3D plastic deformation kinematics for open-die forging, forward extrusion, 2-high rolling, and wire drawing.',
    detailedDescription:
      'Comprehensive plastic deformation visualizer. Observe ram stroke and frictional barreling in upset forging, billet extrusion through shaped dies, sheet thickness reduction and roll separating force in rolling, and die drawing stress limits.',
    learningObjectives: [
      'Analyze true plastic strain ε = ln(h₀/h_f) and volume constancy in metal forming',
      'Determine maximum allowable rolling draft Δh_max = μ²·R to prevent roll slippage',
      'Calculate ram extrusion pressure via Johnson\'s formula and verify wire drawing yield safety limits',
    ],
    formulaOverview: 'Rolling: Δh_max = μ²·R; Forging: F = σ_y·A·(1 + 2μr/3h); Extrusion: p = σ_y·(a + b·ln R)',
    suggestedUnits: [5],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Metal Forming', 'Forging', 'Extrusion', 'Rolling', 'Drawing', 'Plasticity', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me401-sim-06',
    title: 'Machining Parameters & Manufacturing Calculations Laboratory',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🧮',
    shortDescription: 'Formula calculations for cutting speed, feed, depth of cut, MRR, machining time, and Taylor tool life.',
    detailedDescription:
      'Step-by-step mathematical calculator and parametric verification environment for turning, milling, and drilling operations. Evaluate Taylor tool life curves V·T^n = C and specific cutting energy requirements.',
    learningObjectives: [
      'Compute cutting speed V = (π·D·N) / 1000 and spindle RPM from tool manufacturer recommendations',
      'Determine machining cycle time T_m = L / (f·N) and material removal rate MRR',
      'Predict tool wear lifespan using Taylor\'s tool life equation V·T^n = C',
    ],
    formulaOverview: 'V = (π·D·N) / 1000; T_m = L / (f·N); MRR = 1000·V·f·d; V·T^n = C',
    suggestedUnits: [1, 3],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Machining Calculations', 'Cutting Speed', 'Tool Life', 'Taylor Equation', 'MRR', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me401-sim-07',
    title: 'Manufacturing Process Selection Multi-Criteria Decision Matrix',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '📊',
    shortDescription: 'Multi-criteria decision engine matching material, geometry, tolerance grade, batch size, and cost.',
    detailedDescription:
      'Interactive engineering selection tool comparing casting, forging, CNC machining, EDM, and die casting. Select component geometry, batch quantity, tolerance grade (IT6–IT14), and surface finish to obtain ranked candidate recommendations and trade-off rationales.',
    learningObjectives: [
      'Select optimum manufacturing routes by balancing tooling lead times against unit piece costs',
      'Map achievable ISO tolerance grades and surface roughness (Ra) across production processes',
      'Understand economic batch quantity thresholds for high-volume tooling vs flexible CNC routing',
    ],
    formulaOverview: 'Total Cost C = C_tooling / Q + C_material + C_machining; Achievable Ra: 0.1 μm to 12.5 μm',
    suggestedUnits: [5],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Process Selection', 'Decision Matrix', 'Tolerances', 'Batch Economics', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me401-sim-08',
    title: 'Interactive 3D Manufacturing Workshop Bay & Exam Suite',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🏭',
    shortDescription: 'Unified shop floor bay integrating machine inspection, live process simulation, trial exports, and concept evaluation.',
    detailedDescription:
      'Comprehensive 3D manufacturing workshop bay uniting all 7 syllabus process workstations into a digital twin factory environment. Perform workpiece quality inspections, record multi-trial test data, and complete the curriculum evaluation quiz.',
    learningObjectives: [
      'Synthesize machine tools, non-traditional erosion, welding, casting, and forming within an industrial factory workflow',
      'Export formatted CSV laboratory trial reports with verifiable engineering parameters',
      'Demonstrate mastery of Anna University U25ME401 manufacturing technology competencies',
    ],
    formulaOverview: 'Unified Workshop Practice & Virtual Laboratory Quality Verification',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'manufacturing-tech-2',
    subjectKeywords: U25ME401_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Workshop', 'Digital Twin', 'Virtual Lab', 'Trials', 'Quiz', 'U25ME401'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25ME401SimId(id: string): Manufacturing2SimId | null {
  if (id === 'u25me401-sim-01' || id.includes('cnc')) return 'cnc-machining';
  if (id === 'u25me401-sim-02' || id.includes('non-traditional') || id.includes('unconventional')) return 'non-traditional';
  if (id === 'u25me401-sim-03' || id.includes('welding')) return 'welding-processes';
  if (id === 'u25me401-sim-04' || id.includes('casting')) return 'casting-processes';
  if (id === 'u25me401-sim-05' || id.includes('forming')) return 'metal-forming';
  if (id === 'u25me401-sim-06' || id.includes('calculation')) return 'manufacturing-calculations';
  if (id === 'u25me401-sim-07' || id.includes('selection')) return 'process-selection';
  if (id === 'u25me401-sim-08' || id.includes('workshop')) return 'virtual-workshop';
  return null;
}
