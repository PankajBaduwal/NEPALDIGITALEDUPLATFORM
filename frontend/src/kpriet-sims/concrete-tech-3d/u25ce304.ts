import type { ISimulationDefinition } from '../types';
import type { ConcreteSimId } from './core/types';

export const U25CE304_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ce304-batching',
    title: 'Concrete Mix Proportioning & Batching Laboratory',
    domain: 'CIVIL',
    category: 'concrete technology',
    icon: '🏗️',
    shortDescription: 'Production-grade 3D concrete batching room with tilting mixer and platform scale.',
    detailedDescription:
      'Production-grade realistic 3D concrete batching room featuring cement storage hoppers, Zone II fine aggregate, 20mm crushed granite trays, calibrated water dispenser, platform scale, and working tilting drum mixer complying with IS 10262:2019 and IS 456:2000.',
    learningObjectives: [
      'Proportion concrete ingredients for M15 through M40 grades per IS 10262:2019 guidelines',
      'Perform moisture corrections on aggregates to maintain effective water-cement ratio',
      'Correlate batching mass deviations with concrete homogeneity and workability risks',
    ],
    formulaOverview: "f'ck = fck + 1.65 · s; w/c = Water / Cement; V_yield = Total Mass / Density",
    suggestedUnits: [1],
    boardEngine: 'concrete',
    subjectKeywords: ['u25ce304', 'concrete technology', 'batching', 'mix design', 'is 10262'],
    parameters: [],
    metrics: [],
    tags: ['batching', 'concrete mixer', 'mix proportioning', 'u25ce304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce304-slump',
    title: 'Standard Slump Test & Fresh Rheology Laboratory',
    domain: 'CIVIL',
    category: 'concrete technology',
    icon: '📐',
    shortDescription: 'Realistic 3D slump test apparatus with bullet-nosed tamping rod and measuring bridge.',
    detailedDescription:
      'Realistic 3D laboratory bench equipped with standard slump cone, base plate, 16mm tamping rod, and graduated measuring rule validating true, shear, and collapse slump modes per IS 1199:Part 2:2018.',
    learningObjectives: [
      'Perform standard 4-layer slump filling and 25-stroke compaction sequence per IS 1199',
      'Measure subsidence and categorize workability from very low (PQC) to high (pumpable)',
      'Identify true, shear, and collapse slump failure modes and understand mix cohesion',
    ],
    formulaOverview: 'Slump = 300 mm - Subsided Height (mm); C.F. ≈ 0.70 + (Slump / 300) · 0.30',
    suggestedUnits: [2],
    boardEngine: 'concrete',
    subjectKeywords: ['u25ce304', 'concrete technology', 'slump test', 'workability', 'is 1199'],
    parameters: [],
    metrics: [],
    tags: ['slump test', 'workability', 'fresh concrete', 'u25ce304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce304-curing',
    title: 'Concrete Hydration & Accelerated Curing Laboratory',
    domain: 'CIVIL',
    category: 'concrete technology',
    icon: '🧪',
    shortDescription: 'Thermostatic water curing tank and strength development maturity laboratory.',
    detailedDescription:
      'Realistic 3D specimen preparation and curing area with 150mm cast-iron cube moulds, thermostatic water tank (27 ± 2 °C), accelerated curing bath, and environmental maturity telemetry per IS 516 and IS 9013.',
    learningObjectives: [
      'Evaluate strength development over 1, 3, 7, 14, 28, and 90-day curing horizons',
      'Examine Nurse-Saul maturity rule and temperature-accelerated hydration kinetics',
      'Quantify the severe strength and durability penalties of unprotected dry-air site exposure',
    ],
    formulaOverview: 'Maturity M = Σ (T - T₀) · Δt; Strength % = A + B · log10(M)',
    suggestedUnits: [3],
    boardEngine: 'concrete',
    subjectKeywords: ['u25ce304', 'concrete technology', 'curing', 'hydration', 'is 516'],
    parameters: [],
    metrics: [],
    tags: ['curing tank', 'hydration', 'maturity', 'u25ce304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce304-compressive-strength',
    title: 'Concrete Compressive Strength Testing Laboratory',
    domain: 'CIVIL',
    category: 'concrete technology',
    icon: '🧱',
    shortDescription: '2000 kN capacity digital Compression Testing Machine (CTM) per IS 516.',
    detailedDescription:
      'Production-grade 3D compression testing machine with rigid reaction columns, spherical seated upper platen, electronic load cell, digital pacer, and safety mesh testing 150mm cubes and 150x300 cylinders to failure per IS 516:2021.',
    learningObjectives: [
      'Operate 2000 kN CTM at standard loading pace rates (0.2 to 0.4 MPa/s)',
      'Calculate characteristic compressive strength (f_c = P / A) and apply geometry conversion factors',
      'Observe normal pyramidal shear failure and evaluate compliance against IS 456 acceptance criteria',
    ],
    formulaOverview: 'f_c = P / A; f_cyl ≈ 0.80 · f_cube; Rate = 5.2 kN/s to 9.0 kN/s (150mm cube)',
    suggestedUnits: [4],
    boardEngine: 'concrete',
    subjectKeywords: ['u25ce304', 'concrete technology', 'compressive strength', 'ctm', 'is 516'],
    parameters: [],
    metrics: [],
    tags: ['ctm', 'compressive strength', 'cube test', 'is 516', 'u25ce304'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25CE304SimId(rawId: string): ConcreteSimId | null {
  const normalized = rawId.toLowerCase().trim();
  if (normalized.includes('batching') || normalized.includes('mix')) return '01-batching';
  if (normalized.includes('slump') || normalized.includes('workability')) return '02-slump';
  if (normalized.includes('curing') || normalized.includes('hydration')) return '03-curing';
  if (normalized.includes('compressive') || normalized.includes('strength')) return '04-compressive-strength';
  return null;
}

export function toConcrete3DSimId(simId: string): ConcreteSimId {
  const resolved = resolveU25CE304SimId(simId);
  return resolved || '01-batching';
}
