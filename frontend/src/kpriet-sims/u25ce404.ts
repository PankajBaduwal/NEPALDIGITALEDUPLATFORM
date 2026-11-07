/**
 * PiyushDhara Eduverse — Geotechnical Engineering I (U25CE404)
 * Master Simulation Definitions & Platform Registry
 * Department: Civil Engineering | Semester: IV | Category: PCC (Theory with Laboratory)
 */

import type { ISimulationDefinition } from './types';
import type { GeotechnicalSimId } from './geotechnical-lab-3d/core/types';

export const U25CE404_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ce404-soil-stratigraphy',
    title: 'Interactive 3D Soil Layers & Effective Stress Stratigraphy',
    domain: 'CIVIL',
    category: 'geotechnical engineering',
    icon: '🏔️',
    shortDescription: 'Multi-layered 3D geological cutaway with groundwater table, depth probe, and Terzaghi effective stress profile.',
    detailedDescription:
      'Explore stratified subsurface profiles (topsoil, clay, silt, sand, gravel) with configurable phreatic water tables, borehole depth inspection probes, and real-time total, pore-water, and effective stress calculations per U25CE404 Unit I & Unit IV.',
    learningObjectives: [
      'Understand subsurface soil layering, phase relationships (e, n, w, Sr), and unit weight distributions',
      'Demonstrate Terzaghi’s effective stress principle: σ′ = σ - u in submerged and unsaturated strata',
      'Compute vertical stress increments, hydrostatic pore pressure, and buoyant unit weights with depth',
    ],
    formulaOverview: 'σ = Σ(γ · z); u = γw · max(0, z - zw); σ′ = σ - u; e = n/(1-n); γsat = (Gs+e)/(1+e) · γw',
    suggestedUnits: [1, 4],
    boardEngine: 'geotechnical',
    subjectKeywords: ['u25ce404', 'geotechnical', 'soil mechanics', 'effective stress', 'stratigraphy', 'pore pressure'],
    parameters: [],
    metrics: [],
    tags: ['stratigraphy', 'effective stress', 'soil mechanics', 'u25ce404'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce404-soil-classification',
    title: 'Grain Size Sieve Analysis & IS Soil Classification Laboratory',
    domain: 'CIVIL',
    category: 'geotechnical engineering',
    icon: '🧪',
    shortDescription: 'Motorized mechanical sieve shaker, gradation parameters (Cu, Cc), Atterberg limits, and IS 1498 soil classification.',
    detailedDescription:
      'Interactive 3D mechanical sieve shaker apparatus with stacked brass sieves (4.75 mm down to 75 µm), analytical balance, cumulative particle size distribution curves, and Plasticity Chart classification per IS 2720 Part 4 & IS 1498.',
    learningObjectives: [
      'Perform dry sieve analysis and calculate percentage retained and percentage finer',
      'Determine gradation indices: effective size D10, D30, D60, uniformity coefficient Cu, and coefficient of curvature Cc',
      'Classify coarse and fine soils using IS 1498 criteria and Casagrande’s A-line equation Ip = 0.73(wL - 20)',
    ],
    formulaOverview: '% Passing = 100 - % Cumulative Retained; Cu = D60/D10; Cc = D30²/(D10·D60); Ip = wL - wP',
    suggestedUnits: [1],
    boardEngine: 'geotechnical',
    subjectKeywords: ['u25ce404', 'sieve analysis', 'soil classification', 'atterberg limits', 'is 1498', 'is 2720'],
    parameters: [],
    metrics: [],
    tags: ['sieve analysis', 'classification', 'grain size', 'u25ce404'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce404-proctor-compaction',
    title: 'Standard Proctor Soil Compaction Laboratory',
    domain: 'CIVIL',
    category: 'geotechnical engineering',
    icon: '🔨',
    shortDescription: '3D cylindrical Proctor mould, dynamic drop rammer (2.6 kg @ 310 mm), moisture-density curve, OMC, and MDD.',
    detailedDescription:
      'Rigorous 3D Standard Proctor Compaction testing laboratory with 1000 cm³ mould, collar, 2.6 kg hammer, layer compacting animations, Zero Air Voids (ZAV) theoretical line, and parabolic OMC/MDD regression per IS 2720 Part 7.',
    learningObjectives: [
      'Investigate the relationship between soil moisture content and dry density under constant dynamic compaction effort',
      'Identify Optimum Moisture Content (OMC) and Maximum Dry Density (MDD)',
      'Plot the 100% saturation Zero Air Voids line and examine the effect of compaction energy (593 kJ/m³)',
    ],
    formulaOverview: 'ρ = M/V; ρd = ρ / (1 + w); ρzav = (Gs · ρw) / (1 + w · Gs); E = (25 · 3 · m · g · h) / V',
    suggestedUnits: [3],
    boardEngine: 'geotechnical',
    subjectKeywords: ['u25ce404', 'proctor compaction', 'omc', 'mdd', 'zero air voids', 'density'],
    parameters: [],
    metrics: [],
    tags: ['compaction', 'proctor', 'mdd', 'omc', 'u25ce404'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce404-permeability-lab',
    title: 'Soil Permeability Laboratory (Constant & Falling Head)',
    domain: 'CIVIL',
    category: 'geotechnical engineering',
    icon: '💧',
    shortDescription: 'Rigid-wall soil permeameter cell, constant-head supply tank, and falling-head glass standpipe per Darcy’s law.',
    detailedDescription:
      'Comprehensive 3D soil permeability apparatus with interchangeable constant-head overflow tank for clean sand and falling-head graduated standpipe for fine silt/clay, temperature viscosity corrections, and Darcy seepage velocity per IS 2720 Part 17.',
    learningObjectives: [
      'Measure hydraulic conductivity k of coarse-grained soils using constant-head permeameter',
      'Determine coefficient of permeability k of fine soils using falling-head standpipe testing',
      'Apply temperature correction to standard 27°C and calculate true seepage velocity vs = v / n',
    ],
    formulaOverview: 'Constant: k = (Q·L)/(A·h·t); Falling: k = (a·L)/(A·t) · ln(h1/h2); vs = (k·i)/n; k27 = k · (μT/μ27)',
    suggestedUnits: [2],
    boardEngine: 'geotechnical',
    subjectKeywords: ['u25ce404', 'permeability', 'darcy law', 'constant head', 'falling head', 'hydraulic conductivity'],
    parameters: [],
    metrics: [],
    tags: ['permeability', 'darcy', 'constant head', 'falling head', 'u25ce404'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce404-consolidation-lab',
    title: 'One-Dimensional Soil Consolidation Laboratory (Oedometer)',
    domain: 'CIVIL',
    category: 'geotechnical engineering',
    icon: '⚖️',
    shortDescription: 'Brass consolidation cell, 10:1 counterbalanced lever loading arm, dial gauge, e-log σ′ curve, and cv determination.',
    detailedDescription:
      'High-precision 3D Oedometer apparatus with brass floating ring, double drainage porous stones, water saturation bath, 10:1 multiplier lever arm, dial gauge settlement, compression index Cc, and Terzaghi 1D consolidation theory per IS 2720 Part 15.',
    learningObjectives: [
      'Observe time-dependent settlement of saturated fine-grained soil under incremental vertical loading (25 to 800 kPa)',
      'Plot the void ratio versus log effective pressure (e - log σ′) consolidation curve and calculate compression index Cc',
      'Determine coefficient of consolidation cv and coefficient of volume compressibility mv using Taylor’s / Casagrande’s methods',
    ],
    formulaOverview: 'ΔH = H0 · [Cc/(1+e0)] · log10(σ2′/σ1′); cv = (T50 · d²) / t50; mv = (1/(1+e0)) · (Δe/Δσ′)',
    suggestedUnits: [3],
    boardEngine: 'geotechnical',
    subjectKeywords: ['u25ce404', 'consolidation', 'oedometer', 'terzaghi', 'settlement', 'compression index'],
    parameters: [],
    metrics: [],
    tags: ['consolidation', 'oedometer', 'settlement', 'terzaghi', 'u25ce404'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce404-shear-strength-lab',
    title: 'Soil Shear Strength Laboratory (Direct Shear & UCC)',
    domain: 'CIVIL',
    category: 'geotechnical engineering',
    icon: '💥',
    shortDescription: 'Split shear box apparatus and Unconfined Compression Testing frame for Mohr-Coulomb failure criteria.',
    detailedDescription:
      'Dual 3D testing suite featuring a motorized 60x60mm direct shear box with proving ring and deadweight yoke for sand (c, φ), plus a motorized unconfined compression testing frame for cohesive clay (qu, cu) with cross-sectional area correction per IS 2720 Part 10 & 13.',
    learningObjectives: [
      'Determine internal friction angle φ and cohesion c of soils using direct shear apparatus',
      'Measure unconfined compressive strength qu and undrained shear strength cu = qu / 2 of cylindrical clay specimens',
      'Construct Mohr’s circles and Mohr-Coulomb failure envelopes τf = c + σ · tan(φ)',
    ],
    formulaOverview: 'τf = c + σ · tan(φ); UCC: Ac = A0 / (1 - ε); σ1 = P / Ac; qu = max(σ1); cu = qu / 2',
    suggestedUnits: [4],
    boardEngine: 'geotechnical',
    subjectKeywords: ['u25ce404', 'shear strength', 'direct shear', 'ucc', 'mohr coulomb', 'cohesion', 'friction angle'],
    parameters: [],
    metrics: [],
    tags: ['shear strength', 'direct shear', 'ucc', 'mohr coulomb', 'u25ce404'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25CE404SimId(rawId: string): GeotechnicalSimId | null {
  const normalized = rawId.toLowerCase().trim();
  if (normalized.includes('stratigraphy') || normalized.includes('effective') || normalized.includes('layer')) return 'u25ce404-soil-stratigraphy';
  if (normalized.includes('classification') || normalized.includes('sieve') || normalized.includes('grain')) return 'u25ce404-soil-classification';
  if (normalized.includes('proctor') || normalized.includes('compaction') || normalized.includes('mdd')) return 'u25ce404-proctor-compaction';
  if (normalized.includes('permeability') || normalized.includes('darcy') || normalized.includes('falling-head') || normalized.includes('constant-head')) return 'u25ce404-permeability-lab';
  if (normalized.includes('consolidation') || normalized.includes('oedometer') || normalized.includes('settlement')) return 'u25ce404-consolidation-lab';
  if (normalized.includes('shear') || normalized.includes('ucc') || normalized.includes('direct-shear') || normalized.includes('mohr')) return 'u25ce404-shear-strength-lab';
  return null;
}

export function toGeotechnical3DSimId(simId: string): GeotechnicalSimId {
  const resolved = resolveU25CE404SimId(simId);
  return resolved || 'u25ce404-soil-stratigraphy';
}
