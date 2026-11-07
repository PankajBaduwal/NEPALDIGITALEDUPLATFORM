/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Manufacturing Technology – I (U25ME304 / Theory with Laboratory - TwL)
 * Official Source: ME - R2025 (Revised).pdf, Anna University ME3391 / ME8351
 */

import type { ISimulationDefinition } from './types';
import type { ManufacturingSimId } from './manufacturing-tech-3d/core/types';

export const U25ME304_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester III',
  regulation: 'R2025 Revised CBCS',
  courseCode: 'U25ME304',
  courseCodeAliases: ['ME3391', 'ME8351', 'U21ME304'],
  courseTitle: 'Manufacturing Technology – I',
  category: 'PCC',
  type: 'TwL', // Theory with Laboratory
  credits: 3,
  ltpjc: '3-0-0-0-3',
  lectureHours: 45,
  labHours: 30,
  totalHours: 75,
  sourceDocument: 'ME - R2025 (Revised).pdf',
  syllabusPages: [67, 68],
  courseObjectives: [
    'To introduce the fundamental principles of metal cutting, mechanics of chip formation, and cutting tool geometry',
    'To impart operational and kinematic knowledge of center lathe, turret and capstan lathes, and semi-automatic machine tools',
    'To develop skills in planning, machining calculations, and operating reciprocating, milling, and hole-making machine tools',
    'To simulate and calculate machining parameters including cutting speed, feed, MRR, tool life, and surface finish',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Apply', description: 'Analyze metal cutting mechanics, shear angle, cutting forces, and single point cutting tool geometry' },
    { code: 'CO2', level: 'Apply', description: 'Operate and configure center lathe and special lathes for plain turning, facing, taper turning, and threading' },
    { code: 'CO3', level: 'Apply', description: 'Evaluate kinematic mechanisms, cutting vs feed motions, and operations in shaper, milling, and drilling machines' },
    { code: 'CO4', level: 'Analyze', description: 'Calculate cutting speed, feed, depth of cut, machining cycle time, and material removal rates' },
    { code: 'CO5', level: 'Create', description: 'Plan and validate virtual workshop manufacturing processes and metrological quality inspections' },
  ],
  units: [
    { number: 1, title: 'THEORY OF METAL CUTTING & TOOL GEOMETRY', hours: 9, outcome: 'CO1' },
    { number: 2, title: 'CENTRE LATHE AND SPECIAL PURPOSE LATHES', hours: 9, outcome: 'CO2' },
    { number: 3, title: 'RECIPROCATING, MILLING AND HOLE MAKING MACHINE TOOLS', hours: 9, outcome: 'CO3' },
    { number: 4, title: 'MACHINING PARAMETERS, TOOL LIFE & SURFACE INTEGRITY', hours: 9, outcome: 'CO4' },
    { number: 5, title: 'UNCONVENTIONAL MACHINING & WORKSHOP PRACTICE', hours: 9, outcome: 'CO5' },
  ],
  prescribedExperiments: [
    { number: 1, name: 'Lathe plain turning, step turning, and grooving on mild steel shaft' },
    { number: 2, name: 'Taper turning by swiveling compound rest method and taper calculations' },
    { number: 3, name: 'External metric V-thread cutting on center lathe with half-nut engagement' },
    { number: 4, name: 'Drilling, reaming, and counter-boring on upright drilling machine' },
    { number: 5, name: 'Horizontal slab milling and vertical face milling parameter verification' },
    { number: 6, name: 'Machining flat horizontal and vertical surfaces using Crank Shaper' },
    { number: 7, name: 'Grinding and measurement of single point cutting tool angles (ASA & ORS systems)' },
    { number: 8, name: 'Measurement of cutting forces and Merchant circle force diagram construction' },
  ],
};

export const U25ME304_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25me304-lathe-turning',
    title: 'Engine Lathe Machine & Turning Operations Laboratory',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '⚙️',
    shortDescription: 'Interactive 3D lathe machine with progressive turning, facing, grooving, and taper cutting.',
    detailedDescription:
      'High-fidelity 3D center lathe workstation featuring headstock, 3-jaw chuck, tool post, cross-slide, carriage, and tailstock. Observe live progressive workpiece diameter reduction, spinning chuck, continuous metal chip generation, and real-time machining status telemetry.',
    learningObjectives: [
      'Identify key engine lathe parts: Bed, Headstock, Chuck, Carriage, Cross-Slide, Compound Rest, Tool Post, Tailstock',
      'Execute plain turning, facing, step turning, taper turning, grooving, parting-off, and threading operations',
      'Analyze how spindle speed (RPM), feed (mm/rev), and depth of cut (mm) govern tool path and dimensional accuracy',
    ],
    formulaOverview: 'V = (π·D·N) / 1000; d = (D₀ - D_f) / 2; T_m = L / (f·N); MRR ≈ 1000·V·f·d',
    suggestedUnits: [2],
    boardEngine: 'manufacturing-tech',
    subjectKeywords: ['u25me304', 'me3391', 'me8351', 'manufacturing technology', 'mechanical engineering', 'lathe', 'turning', 'facing', 'taper turning', 'grooving'],
    parameters: [],
    metrics: [],
    tags: ['lathe', 'turning', 'facing', 'tailstock', 'headstock', 'u25me304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me304-machine-tools',
    title: 'Kinematic Machine Tools Explorer — Drilling, Milling & Shaping',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🏭',
    shortDescription: '3D multi-machine comparative suite showcasing cutting vs. feed motions and mechanisms.',
    detailedDescription:
      'Interactive 3D simulation comparing three classic machine tools: Upright Drill Press (rotating drill & vertical axial feed), Knee & Column Milling Machine (rotating multi-tooth cutter & 3-axis table feed), and Crank Shaper (quick return mechanism, clapper box return lift, and cross feed).',
    learningObjectives: [
      'Distinguish primary cutting motion from secondary feed motion across diverse machine tools',
      'Examine the Quick Return Mechanism (QRR = (360 - θ)/θ ≈ 1.5) and clapper box tool lifting during return strokes in shapers',
      'Compare through-hole vs. blind-hole drilling time and face milling vs. slab milling kinematics',
    ],
    formulaOverview: 'Drilling: T_m = (h + 0.3D) / (f·N); Shaper: QRR = (360-θ)/θ, V_avg = [L·(1+1/QRR)] / (1000·(t_c+t_r)); Milling: T_m = (L + 2A) / (f_m)',
    suggestedUnits: [3],
    boardEngine: 'manufacturing-tech',
    subjectKeywords: ['u25me304', 'me3391', 'manufacturing technology', 'drilling', 'milling', 'shaping', 'machine tools', 'quick return mechanism'],
    parameters: [],
    metrics: [],
    tags: ['drilling', 'milling', 'shaping', 'quick return', 'clapper box', 'u25me304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me304-cutting-speed-time',
    title: 'Machining Dynamics & Parameters Calculation Suite',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '📐',
    shortDescription: 'Step-by-step mathematical calculator for cutting speed, spindle RPM, MRR, tool life, and Ra.',
    detailedDescription:
      'Rigorous engineering calculator and parameter sensitivity laboratory. Calculates peripheral cutting speed, spindle RPM, depth of cut, effective machining time, material removal rate, Taylor tool life (V·T^n = C), and theoretical surface roughness (Ra = f² / 32R) with engineering validation warnings.',
    learningObjectives: [
      'Apply standard manufacturing equations for cutting speed, spindle speed, and machining time',
      'Analyze the non-linear impact of feed rate on surface finish Ra and cutting speed on Taylor tool life',
      'Evaluate material removal rates (MRR) across various engineering alloys (Mild Steel, Al 6061, Brass, Cast Iron, Ti-6Al-4V)',
    ],
    formulaOverview: 'V = (π·D·N)/1000; N = (1000·V)/(π·D); T_m = L/(f·N); MRR = 1000·V·f·d; V·T^n = C; R_a = f² / (32·R_nose)',
    suggestedUnits: [4],
    boardEngine: 'manufacturing-tech',
    subjectKeywords: ['u25me304', 'me3391', 'machining time', 'cutting speed', 'taylor tool life', 'material removal rate', 'surface roughness'],
    parameters: [],
    metrics: [],
    tags: ['cutting speed', 'spindle rpm', 'mrr', 'taylor tool life', 'surface roughness', 'u25me304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me304-tool-geometry',
    title: 'Single Point Cutting Tool Geometry (ASA & ORS Standards)',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🔪',
    shortDescription: '3D tool angles explorer with ASA tool signature, ORS conversion, and reference planes.',
    detailedDescription:
      'Explore 3D single point cutting tool geometry under American Standards Association (ASA: α_b - α_s - θ_e - θ_s - C_e - C_s - R) and Orthogonal Rake System (ORS). Visually highlight rake face, principal flank, auxiliary flank, nose radius, and reference planes.',
    learningObjectives: [
      'Master the 7 elements of the standard ASA tool signature: back rake, side rake, end relief, side relief, end cutting edge, side cutting edge, and nose radius',
      'Understand the orthogonal rake system (ORS) reference planes: Machine Reference Plane, Cutting Plane, and Orthogonal Plane',
      'Correlate rake angles with cutting forces and relief angles with flank wear rubbing reduction',
    ],
    formulaOverview: 'ASA: α_b - α_s - θ_e - θ_s - C_e - C_s - R; tan(γ_x) = tan(α)·cos(φ); R_a(theo) ≈ f² / (32·R)',
    suggestedUnits: [1],
    boardEngine: 'manufacturing-tech',
    subjectKeywords: ['u25me304', 'me3391', 'tool geometry', 'single point tool', 'asa signature', 'ors', 'rake angle', 'clearance angle', 'nose radius'],
    parameters: [],
    metrics: [],
    tags: ['tool geometry', 'asa signature', 'ors', 'rake angle', 'relief angle', 'u25me304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me304-chip-mechanics',
    title: 'Orthogonal Chip Formation & Merchant Force Circle Laboratory',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🔬',
    shortDescription: 'Orthogonal cutting cross-section with shear plane, BUE, and 3D Merchant circle force vectors.',
    detailedDescription:
      'Examine 3D cross-sectional orthogonal cutting mechanics. Watch material shear along the primary shear plane (φ), flow up the tool rake face, and observe the built-up edge (BUE) transition. Decompose cutting and thrust forces into shear force, normal shear force, friction force, and normal friction force.',
    learningObjectives: [
      'Calculate shear angle φ using chip thickness ratio r = t₁ / t₂ and rake angle α: tan(φ) = (r·cos α)/(1 - r·sin α)',
      'Analyze Merchant’s circle force equilibrium: 2φ + β - α = 90° (or π/2)',
      'Inspect how cutting speed and coolant suppress Built-Up Edge (BUE) formation and improve surface finish',
    ],
    formulaOverview: 'r = t₁ / t₂; tan(φ) = (r·cos α) / (1 - r·sin α); 2φ + β - α = 90°; F_s = F_c·cos φ - F_t·sin φ; F = F_c·sin α + F_t·cos α; μ = F / N',
    suggestedUnits: [1],
    boardEngine: 'manufacturing-tech',
    subjectKeywords: ['u25me304', 'me3391', 'chip formation', 'merchant circle', 'shear angle', 'orthogonal cutting', 'cutting forces', 'bue'],
    parameters: [],
    metrics: [],
    tags: ['chip formation', 'shear angle', 'merchants circle', 'cutting forces', 'bue', 'u25me304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me304-virtual-workshop',
    title: '3D Virtual Machining Workshop & Quality Metrology',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '🛠️',
    shortDescription: 'Interactive job planning, toolpath simulation, and digital Vernier caliper dimensional inspection.',
    detailedDescription:
      'Comprehensive machine shop experience. Select work material and tool geometry, plan machining operations, review wireframe toolpaths, run the machining cycle, and use an interactive virtual digital Vernier caliper to inspect final part dimensions against drawing tolerances.',
    learningObjectives: [
      'Develop complete process plans for turning, facing, step turning, and grooving workpieces',
      'Validate toolpath approach, cut length, retraction, and safety clearances',
      'Perform virtual quality control metrology using a digital Vernier caliper reading to ±0.02 mm',
    ],
    formulaOverview: 'Tolerance = D_measured - D_target; Reject if |Tolerance| > 0.10 mm; Roughness: R_a = f² / (32·R)',
    suggestedUnits: [5],
    boardEngine: 'manufacturing-tech',
    subjectKeywords: ['u25me304', 'me3391', 'virtual workshop', 'toolpath', 'vernier caliper', 'metrology', 'process planning', 'quality control'],
    parameters: [],
    metrics: [],
    tags: ['virtual workshop', 'vernier caliper', 'metrology', 'tolerance', 'process planning', 'u25me304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me304-virtual-lab',
    title: 'Virtual Manufacturing Technology Laboratory & Practical Exam Suite',
    domain: 'PHYSICS',
    category: 'manufacturing technology',
    icon: '📋',
    shortDescription: 'Syllabus experiment trials, observation logging, assessment quiz, and printable lab reports.',
    detailedDescription:
      'Rigorous engineering practical laboratory suite supporting the 8 prescribed syllabus experiments. Log trial runs with simulated telemetry, test concept mastery via interactive assessment quizzes, and generate official, print-ready laboratory observation records and practical reports.',
    learningObjectives: [
      'Follow standard operating procedures (SOP) for lathe turning, drilling, milling, shaping, and tool inspection',
      'Record structured observation logs with cutting speed, feed, depth of cut, MRR, Ra, and cycle time',
      'Generate print-ready engineering laboratory records complete with objectives, formulas, tabulated trials, and conclusions',
    ],
    formulaOverview: 'All standard MT-I laboratory formulas: V, N, T_m, MRR, Ra, r, φ, Taylor tool life, QRR',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'manufacturing-tech',
    subjectKeywords: ['u25me304', 'me3391', 'manufacturing lab', 'practical report', 'observation table', 'quiz', 'engineering report'],
    parameters: [],
    metrics: [],
    tags: ['manufacturing lab', 'observation table', 'practical report', 'assessment', 'u25me304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25ME304SimId(rawId: string): ManufacturingSimId {
  const norm = (rawId || '').toLowerCase().trim();
  if (norm.includes('lathe') || norm.includes('turning') || norm.includes('facing') || norm.includes('taper')) {
    return 'u25me304-lathe-turning';
  }
  if (norm.includes('machine-tool') || norm.includes('drilling') || norm.includes('milling') || norm.includes('shaping') || norm.includes('shaper')) {
    return 'u25me304-machine-tools';
  }
  if (norm.includes('speed') || norm.includes('time') || norm.includes('mrr') || norm.includes('feed') || norm.includes('taylor')) {
    return 'u25me304-cutting-speed-time';
  }
  if (norm.includes('tool-geom') || norm.includes('tool-angle') || norm.includes('asa') || norm.includes('ors') || norm.includes('single-point')) {
    return 'u25me304-tool-geometry';
  }
  if (norm.includes('chip') || norm.includes('merchant') || norm.includes('shear') || norm.includes('bue') || norm.includes('force')) {
    return 'u25me304-chip-mechanics';
  }
  if (norm.includes('workshop') || norm.includes('vernier') || norm.includes('toolpath') || norm.includes('metrology')) {
    return 'u25me304-virtual-workshop';
  }
  if (norm.includes('lab') || norm.includes('report') || norm.includes('quiz') || norm.includes('observation')) {
    return 'u25me304-virtual-lab';
  }
  return 'u25me304-lathe-turning';
}
