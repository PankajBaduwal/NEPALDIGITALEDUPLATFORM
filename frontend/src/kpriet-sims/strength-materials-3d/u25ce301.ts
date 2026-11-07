import type { ISimulationDefinition } from '../types';
import type { SomSimId } from './core/types';

export const U25CE301_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ce301-utm-testing',
    title: 'Universal Testing Machine (UTM) — Tensile & Compressive Testing',
    domain: 'CIVIL',
    category: 'strength of materials',
    icon: '🏗️',
    shortDescription: 'Production-grade realistic 3D UTM mechanical testing laboratory.',
    detailedDescription:
      'Production-grade realistic 3D mechanical testing laboratory featuring full-scale UTM frame, hydraulic actuator, wedge grips, compression platens, electronic extensometer, and live stress-strain telemetry conforming to IS 1608 / ASTM E8 standards.',
    learningObjectives: [
      'Operate virtual Universal Testing Machine complying with IS 1608 / ASTM E8 standards',
      'Analyze Hooke’s elastic zone, yield plateau, strain hardening, necking, and cup-and-cone rupture',
      'Correlate digital load cell and LVDT displacement telemetry with real-time constitutive curves',
    ],
    formulaOverview: 'σ = P / A₀; ε = ΔL / L₀; E = σ / ε; σ_true = σ(1 + ε)',
    suggestedUnits: [1],
    boardEngine: 'som',
    subjectKeywords: ['u25ce301', 'ce3301', 'strength of materials', 'civil engineering', 'utm'],
    parameters: [],
    metrics: [],
    tags: ['utm', 'tensile test', 'compression', 'hookes law', 'u25ce301'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce301-beam-deflection',
    title: 'Beam Loading and Elastic Deflection Laboratory',
    domain: 'CIVIL',
    category: 'strength of materials',
    icon: '📏',
    shortDescription: 'Realistic 3D flexural testing rig with dial test indicator.',
    detailedDescription:
      'Realistic 3D flexural testing rig with adjustable span, knife-edge/roller supports, point/UDL loading, precision dial test indicators, and real-time elastic curve visualization under Euler-Bernoulli beam theory.',
    learningObjectives: [
      'Investigate Euler-Bernoulli beam deflection under concentrated and distributed loads',
      'Validate serviceability deflection limits against IS 456 Table 23 criteria',
      'Read and interpret precision dial test indicator deflection readings in real time',
    ],
    formulaOverview: 'd²v/dx² = M(x) / (E · I); δ_max = (W · L³) / (48 · E · I)',
    suggestedUnits: [2],
    boardEngine: 'som',
    subjectKeywords: ['u25ce301', 'ce3301', 'strength of materials', 'civil engineering', 'beam deflection'],
    parameters: [],
    metrics: [],
    tags: ['beam deflection', 'euler bernoulli', 'dial gauge', 'u25ce301'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce301-stress-strain-explorer',
    title: 'Interactive Stress-Strain & Mohr’s Circle Explorer',
    domain: 'CIVIL',
    category: 'strength of materials',
    icon: '🔬',
    shortDescription: 'Precision axial tension/compression testing fixture and Mohr’s circle.',
    detailedDescription:
      'Precision horizontal testing fixture exploring axial stress, longitudinal strain, Poisson’s lateral contraction, volumetric strain, and 3D Mohr’s stress circle transformation.',
    learningObjectives: [
      'Master force, area, normal stress, longitudinal strain, and Young’s modulus relations',
      'Visualize Poisson’s effect with simultaneous lateral contraction and volumetric change',
      'Examine 3D principal stresses and maximum shear planes using synchronized Mohr’s circle',
    ],
    formulaOverview: 'ΔL = (P · L) / (A · E); ε_lat = -ν · ε_axial; σ_1,2 = (σ_x / 2) ± √( (σ_x/2)² + τ_xy² )',
    suggestedUnits: [1],
    boardEngine: 'som',
    subjectKeywords: ['u25ce301', 'ce3301', 'strength of materials', 'civil engineering', 'stress strain'],
    parameters: [],
    metrics: [],
    tags: ['stress strain', 'poissons ratio', 'mohrs circle', 'u25ce301'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce301-sfd-bmd',
    title: 'Shear Force & Bending Moment Internal Stress Visualizer',
    domain: 'CIVIL',
    category: 'strength of materials',
    icon: '📊',
    shortDescription: 'Interactive 3D beam with movable cut section revealing internal stresses.',
    detailedDescription:
      'Interactive 3D beam with movable section cut exposing internal shear and flexural stress distributions synchronized with piecewise SFD and BMD diagrams.',
    learningObjectives: [
      'Derive support reactions and compute piecewise shear force and bending moment equations',
      'Inspect internal transverse shear and flexural normal stress distributions on an exposed cross-section',
      'Identify critical points of zero shear, maximum bending moments, and points of contraflexure',
    ],
    formulaOverview: 'V(x) = dM/dx; q(x) = -dV/dx; σ_b = M · y / I; τ = V · Q / (I · b)',
    suggestedUnits: [2],
    boardEngine: 'som',
    subjectKeywords: ['u25ce301', 'ce3301', 'strength of materials', 'civil engineering', 'sfd', 'bmd'],
    parameters: [],
    metrics: [],
    tags: ['sfd', 'bmd', 'bending moment', 'shear force', 'internal stress', 'u25ce301'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25CE301SimId(rawId: string): SomSimId | null {
  const normalized = rawId.toLowerCase().trim();
  if (normalized.includes('utm')) return '01-utm-testing';
  if (normalized.includes('beam') || normalized.includes('deflection')) return '02-beam-deflection';
  if (normalized.includes('stress') || normalized.includes('strain')) return '03-stress-strain';
  if (normalized.includes('sfd') || normalized.includes('bmd')) return '04-sfd-bmd';
  return null;
}

export function toSom3DSimId(simId: string): SomSimId {
  const resolved = resolveU25CE301SimId(simId);
  return resolved || '01-utm-testing';
}
