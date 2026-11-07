/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Mechanics of Solids (U25ME303 / Theory with Laboratory - TwL)
 * Official Source: ME - R2025 (Revised).pdf, Printed Pages 65-66 of 88
 */

import type { ISimulationDefinition } from './types';
import type { SolidMechanicsSimId } from './mechanics-solids-3d/core/types';

export const U25ME303_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester III',
  regulation: 'R2025 Revised CBCS',
  courseCode: 'U25ME303',
  courseCodeAliases: ['ME3351', 'CE3301', 'U25CE301'],
  courseTitle: 'Mechanics of Solids',
  category: 'PCC',
  type: 'TwL', // Theory with Laboratory
  credits: 4,
  ltpjc: '3-0-2-0-4',
  lectureHours: 45,
  labHours: 30,
  totalHours: 75,
  sourceDocument: 'ME - R2025 (Revised).pdf',
  syllabusPages: [65, 66],
  courseObjectives: [
    'To impart the concepts of stress and strain in various elements, principal stresses and principal planes',
    'To impart the knowledge of shearing force, bending moment, slope and deflection, due to external loads in the beams and their effect on stresses',
    'To introduce simulation and validation of torsion, spring and pressure vessel problems using software',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Apply', description: 'Determine stresses, strains, and deformation in elastic members under uniaxial stress conditions' },
    { code: 'CO2', level: 'Apply', description: 'Solve the shear force, bending moment and stresses of beams under transverse loading' },
    { code: 'CO3', level: 'Apply', description: 'Select suitable methods for determining slope and deflection in beams under various loadings' },
    { code: 'CO4', level: 'Analyze', description: 'Analyze torsional stresses and deformation in shafts and helical springs' },
    { code: 'CO5', level: 'Analyze', description: 'Analyze the behavior of columns and thin shells under axial and internal pressure loading' },
  ],
  units: [
    { number: 1, title: 'STRESS - STRAIN AND DEFORMATION OF SOLIDS', hours: 15, page: 65, outcome: 'CO1' },
    { number: 2, title: 'TRANSVERSE LOADING ON BEAMS AND STRESSES IN BEAM', hours: 15, page: 65, outcome: 'CO2' },
    { number: 3, title: 'DEFLECTION OF BEAMS', hours: 15, page: 66, outcome: 'CO3' },
    { number: 4, title: 'TORSION AND SPRINGS', hours: 15, page: 66, outcome: 'CO4' },
    { number: 5, title: 'COLUMNS AND THIN CYLINDERS', hours: 15, page: 66, outcome: 'CO5' },
  ],
  prescribedExperiments: [
    { number: 1, name: 'Tension test on a mild steel rod' },
    { number: 2, name: 'Double shear test on mild steel and aluminium rod' },
    { number: 3, name: 'Torsion test on mild steel rod' },
    { number: 4, name: 'Impact test on metal specimen' },
    { number: 5, name: 'Deflection test on beams' },
    { number: 6, name: 'Compression test on helical springs' },
    { number: 7, name: 'Hardness test on metal specimen – Brinell and Rockwell Hardness' },
    { number: 8, name: 'Strain measurements using Rosette strain gauge' },
    { number: 9, name: 'Simulation of thin cylindrical shell under internal pressure – Hoop and longitudinal stress analysis' },
    { number: 10, name: 'Simulation of torsion in solid and hollow shafts – Stress and deformation validation' },
  ],
};

export const U25ME303_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25me303-utm-testing',
    title: 'Universal Testing Machine (UTM) — Tensile & Compressive Testing',
    domain: 'CIVIL',
    category: 'mechanics of solids',
    icon: '🏗️',
    shortDescription: 'Realistic 3D servo-hydraulic UTM mechanical testing laboratory.',
    detailedDescription:
      'High-fidelity 3D servo-hydraulic UTM testing rig conforming to IS 1608 / ASTM E8 standards. Features electronic extensometer, digital load cell, Hooke’s elastic zone, plastic flow yielding, true stress-strain calculations, and dynamic constitutive curves.',
    learningObjectives: [
      'Operate virtual Universal Testing Machine complying with IS 1608 / ASTM E8 standards',
      'Analyze Hooke’s linear elastic zone, 0.2% offset yield strength, strain hardening, and necking',
      'Correlate digital load cell and electronic extensometer telemetry with real-time constitutive curves',
    ],
    formulaOverview: 'σ = P / A₀; ε = ΔL / L₀; E = σ / ε; σ_true = σ(1 + ε); ε_true = ln(1 + ε)',
    suggestedUnits: [1],
    boardEngine: 'mechanics-solids',
    subjectKeywords: ['u25me303', 'me3351', 'mechanics of solids', 'mechanical engineering', 'utm', 'tensile test'],
    parameters: [],
    metrics: [],
    tags: ['utm', 'tensile test', 'hookes law', 'yield strength', 'u25me303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me303-axial-compound',
    title: 'Axial Deformation & Compound Concentric Bars Laboratory',
    domain: 'CIVIL',
    category: 'mechanics of solids',
    icon: '🔩',
    shortDescription: 'Axial deformation, strain compatibility, and thermal stress in bimetallic compound bars.',
    detailedDescription:
      'Interactive 3D horizontal tensile test bench investigating axial strain compatibility in concentric bimetallic compound members (steel core with copper/brass sleeve). Models load sharing (P₁ + P₂ = P) and differential thermal expansion stresses.',
    learningObjectives: [
      'Master strain compatibility in parallel compound members (ΔL₁ = ΔL₂)',
      'Calculate load sharing based on relative axial stiffness (A₁·E₁ vs A₂·E₂)',
      'Quantify self-equilibrating thermal stresses due to thermal expansion coefficient mismatch',
    ],
    formulaOverview: 'ΔL = (P·L) / (A·E); P₁ = P·(A₁E₁) / (A₁E₁ + A₂E₂); σ_th = [(α₂ - α₁)·ΔT·E₁E₂A₂] / (A₁E₁ + A₂E₂)',
    suggestedUnits: [1],
    boardEngine: 'mechanics-solids',
    subjectKeywords: ['u25me303', 'me3351', 'mechanics of solids', 'mechanical engineering', 'compound bars', 'thermal stress'],
    parameters: [],
    metrics: [],
    tags: ['compound bar', 'thermal stress', 'elastic constants', 'u25me303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me303-sfd-bmd',
    title: 'Shear Force & Bending Moment Diagrams (SFD & BMD)',
    domain: 'CIVIL',
    category: 'mechanics of solids',
    icon: '📊',
    shortDescription: 'Transverse beam loading, support reactions, and internal stress cutting plane.',
    detailedDescription:
      '3D structural beam simulator supporting simply supported, cantilever, and overhanging boundary conditions. Features movable section cuts displaying internal shear force V(x) and bending moment M(x) synchronized with piecewise diagrams.',
    learningObjectives: [
      'Solve support reactions using static equilibrium equations (ΣFy = 0, ΣM = 0)',
      'Construct piecewise Shear Force and Bending Moment Diagrams along the beam span',
      'Locate points of zero shear, maximum flexural moments, and points of contraflexure',
    ],
    formulaOverview: 'ΣFy = 0; ΣM = 0; dV/dx = -w(x); dM/dx = V(x)',
    suggestedUnits: [2],
    boardEngine: 'mechanics-solids',
    subjectKeywords: ['u25me303', 'me3351', 'mechanics of solids', 'mechanical engineering', 'sfd', 'bmd', 'beams'],
    parameters: [],
    metrics: [],
    tags: ['sfd', 'bmd', 'bending moment', 'shear force', 'u25me303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me303-beam-bending',
    title: 'Beam Bending Stress & Elastic Deflection Laboratory',
    domain: 'CIVIL',
    category: 'mechanics of solids',
    icon: '📏',
    shortDescription: 'Flexural testing frame with dial test indicator and bending stress prism.',
    detailedDescription:
      'Realistic 3D flexural test rig conforming to Lab Exp 5. Features adjustable knife-edge supports, point and UDL loading, precision plunger dial gauge (0.01 mm/div), cross-section stress prisms, and serviceability checks per IS 800 (L/250).',
    learningObjectives: [
      'Apply the theory of simple bending to evaluate normal flexural stress (σ = M/Z)',
      'Calculate elastic deflection curves using Euler-Bernoulli differential equation (EI·d²v/dx² = M)',
      'Validate serviceability deflection limits against IS 456 / IS 800 standards',
    ],
    formulaOverview: 'M / I = σ / y = E / R; δ_max = (P·L³) / (48·E·I); δ_max = (5·w·L⁴) / (384·E·I)',
    suggestedUnits: [2, 3],
    boardEngine: 'mechanics-solids',
    subjectKeywords: ['u25me303', 'me3351', 'mechanics of solids', 'mechanical engineering', 'beam deflection', 'dial gauge'],
    parameters: [],
    metrics: [],
    tags: ['beam deflection', 'euler bernoulli', 'dial indicator', 'bending stress', 'u25me303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me303-torsion-shafts',
    title: 'Torsion of Circular Shafts (Solid & Hollow) Laboratory',
    domain: 'CIVIL',
    category: 'mechanics of solids',
    icon: '🔄',
    shortDescription: 'Torsion testing bench, angular protractor, and radial shear stress profiles.',
    detailedDescription:
      'Lathe-style torsion testing rig conforming to Lab Exp 3 & 10. Investigate elastic twist in solid and hollow circular shafts. Evaluates angle of twist θ, polar moment of inertia J, torsional stiffness, and weight savings of hollow shafts.',
    learningObjectives: [
      'Derive and validate the pure torsion formula (T/J = τ/r = G·θ/L)',
      'Evaluate radial shear stress distribution from zero at neutral axis to maximum at surface',
      'Compare torque capacity and percentage weight savings between hollow and solid shafts',
    ],
    formulaOverview: 'T / J = τ / r = G·θ / L; J_solid = π·D⁴ / 32; J_hollow = π·(D⁴ - d⁴) / 32; θ = (T·L) / (G·J)',
    suggestedUnits: [4],
    boardEngine: 'mechanics-solids',
    subjectKeywords: ['u25me303', 'me3351', 'mechanics of solids', 'mechanical engineering', 'torsion', 'shafts'],
    parameters: [],
    metrics: [],
    tags: ['torsion', 'shaft', 'angle of twist', 'polar moment', 'u25me303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25me303-columns-cylinders',
    title: 'Columns Buckling & Thin Cylinders Pressure Vessels',
    domain: 'CIVIL',
    category: 'mechanics of solids',
    icon: '🛡️',
    shortDescription: 'Euler column buckling frame and pressurized thin-walled cylindrical shell.',
    detailedDescription:
      'Comprehensive stability and pressure vessel laboratory conforming to Unit V & Lab Exp 9. Visualizes Euler column buckling under 4 standard boundary conditions, and evaluates circumferential hoop and longitudinal stresses in thin cylindrical shells.',
    learningObjectives: [
      'Investigate Euler buckling critical load across pinned, fixed, and free end fixtures',
      'Analyze slenderness ratio (λ = Le / k) and Rankine-Gordon critical load criteria',
      'Calculate circumferential hoop stress (σ_h = pd/2t) and longitudinal stress (σ_L = pd/4t) in thin cylinders',
    ],
    formulaOverview: 'P_cr = (π²·E·I) / Le²; λ = Le / k; σ_h = (p·D) / (2t); σ_L = (p·D) / (4t)',
    suggestedUnits: [5],
    boardEngine: 'mechanics-solids',
    subjectKeywords: ['u25me303', 'me3351', 'mechanics of solids', 'mechanical engineering', 'columns', 'thin cylinders', 'buckling'],
    parameters: [],
    metrics: [],
    tags: ['euler buckling', 'thin cylinder', 'hoop stress', 'slenderness ratio', 'u25me303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25ME303SimId(rawId: string): SolidMechanicsSimId {
  const norm = (rawId || '').toLowerCase().trim();
  if (norm.includes('utm') || norm.includes('tensile') || norm.includes('is1608')) {
    return 'u25me303-utm-testing';
  }
  if (norm.includes('compound') || norm.includes('axial') || norm.includes('bimetallic')) {
    return 'u25me303-axial-compound';
  }
  if (norm.includes('sfd') || norm.includes('bmd') || norm.includes('shear-force') || norm.includes('bending-moment')) {
    return 'u25me303-sfd-bmd';
  }
  if (norm.includes('bending') || norm.includes('deflection') || norm.includes('flexure')) {
    return 'u25me303-beam-bending';
  }
  if (norm.includes('torsion') || norm.includes('shaft') || norm.includes('twist')) {
    return 'u25me303-torsion-shafts';
  }
  if (norm.includes('column') || norm.includes('buckling') || norm.includes('cylinder') || norm.includes('pressure-vessel')) {
    return 'u25me303-columns-cylinders';
  }
  return 'u25me303-utm-testing';
}
