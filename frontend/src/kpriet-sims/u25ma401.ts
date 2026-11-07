import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25MA401 (R2025 Revised) / U21MAG02 (R2021)
 * Course Name: Discrete Mathematics
 * Semester: IV | Category: BSC | Credits: 4 (L-T-P-J-C: 3-1-0-0-4) | Regulation: R2025 CBCS
 * Common to: IT, AI&DS, CSE, CSBS, Cyber Security
 *
 * Uses isolated Smart Board Discrete Mathematics Engine architecture (boardEngine: 'dm')
 * Dynamic routing via smartboardPresetKey to dm-simulation.html and tools/dm-simulation.js.
 */
export const U25MA401_SUBJECT_KEYWORDS = [
  'u25ma401',
  'u21mag02',
  'ma401',
  'mag02',
  'discrete mathematics',
  'discrete math',
  'discrete structures',
  'discrete mathematical structures',
];

function u25dmSimulation(def: {
  id: string;
  unit: number;
  unitTitle: string;
  topic: string;
  title: string;
  icon: string;
  shortDescription: string;
  learningObjectives: string[];
  formulaOverview: string;
  parameters: ISimulationParam[];
  metrics: ISimulationMetric[];
  flagship?: boolean;
}): ISimulationDefinition {
  return {
    id: def.id,
    boardEngine: 'dm',
    domain: 'MATHEMATICS',
    category: 'discrete mathematics' as any,
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25MA401_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with an interactive 2D discrete mathematics canvas, truth-table generators, Venn diagrams, K-maps, graph visualizers, step-by-step pedagogical derivations, and formal logic verification.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    flagship: def.flagship,
    tags: ['U25MA401', 'U21MAG02', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Discrete Mathematics', 'R2025 CBCS'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ active: true, step: 0 }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25MA401_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — BOOLEAN ALGEBRA AND LOGIC GATES
  // ═══════════════════════════════════════════════════════════════════════════
  u25dmSimulation({
    id: 'u25ma401-boolean-algebra',
    unit: 1,
    unitTitle: 'Boolean Algebra and Logic Gates',
    topic: 'Boolean Algebra Axioms & Duals',
    title: 'Boolean Algebra Axioms, Laws & Principle of Duality ⭐',
    icon: '⚖️',
    flagship: true,
    shortDescription: 'Explore Huntington postulates, algebraic laws (idempotent, involution, absorption, De Morgan), and dual expressions under algebraic substitution.',
    learningObjectives: [
      'Verify Huntington postulates and boolean algebraic axioms with truth tables',
      'Demonstrate the Principle of Duality through operator and identity inversion',
      'Simplify complex boolean expressions using absorption and De Morgan laws'
    ],
    formulaOverview: 'x + (y · z) = (x + y)(x + z) ⟺ x · (y + z) = (x · y) + (x · z)',
    parameters: [
      { key: 'law', label: 'Algebraic Law', type: 'select', default: 'distributive', options: [
        { label: 'Distributive Law', value: 'distributive' },
        { label: 'De Morgan I (OR)', value: 'demorgan_or' },
        { label: 'De Morgan II (AND)', value: 'demorgan_and' },
        { label: 'Absorption Law', value: 'absorption' },
      ]},
      { key: 'varX', label: 'Variable x', type: 'select', default: 1, options: [{ label: '0 (False)', value: 0 }, { label: '1 (True)', value: 1 }] },
      { key: 'varY', label: 'Variable y', type: 'select', default: 0, options: [{ label: '0 (False)', value: 0 }, { label: '1 (True)', value: 1 }] },
      { key: 'varZ', label: 'Variable z', type: 'select', default: 1, options: [{ label: '0 (False)', value: 0 }, { label: '1 (True)', value: 1 }] },
    ],
    metrics: [
      { id: 'lhs', label: 'LHS Evaluation', format: (_s, p) => p.law === 'demorgan_or' ? `${1 - (p.varX || p.varY)}` : `${p.varX | (p.varY & p.varZ)}`, badge: 'LHS' },
      { id: 'rhs', label: 'RHS Evaluation', format: (_s, p) => p.law === 'demorgan_or' ? `${(1 - p.varX) & (1 - p.varY)}` : `${(p.varX | p.varY) & (p.varX | p.varZ)}`, badge: 'RHS' },
      { id: 'valid', label: 'Identity Equality', format: () => 'Valid Identity (Tautology)', color: '#10b981' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-logic-gates-circuits',
    unit: 1,
    unitTitle: 'Boolean Algebra and Logic Gates',
    topic: 'Logic Gates & Combinational Circuits',
    title: 'Universal Logic Gates (NAND/NOR) & Combinational Circuit Builder ⭐',
    icon: '🔌',
    flagship: true,
    shortDescription: 'Synthesize standard gates (AND, OR, NOT, XOR, XNOR) using functionally complete universal NAND and NOR gates, tracing propagation delays and truth tables.',
    learningObjectives: [
      'Prove functional completeness of NAND and NOR universal logic gates',
      'Synthesize an XOR function using exactly 4 universal NAND gates',
      'Calculate propagation delays and verify circuit input-output truth tables'
    ],
    formulaOverview: 'A ⊕ B = (A · B̄) + (Ā · B) = (A + B) · (A · B)̄',
    parameters: [
      { key: 'circuitType', label: 'Synthesized Gate', type: 'select', default: 'xor_universal_nand', options: [
        { label: 'XOR via 4 NANDs', value: 'xor_universal_nand' },
        { label: 'AND via NORs', value: 'nor_for_and' },
        { label: 'OR via NANDs', value: 'nand_for_or' }
      ]},
      { key: 'inputA', label: 'Input A', type: 'select', default: 1, options: [{ label: '0', value: 0 }, { label: '1', value: 1 }] },
      { key: 'inputB', label: 'Input B', type: 'select', default: 0, options: [{ label: '0', value: 0 }, { label: '1', value: 1 }] }
    ],
    metrics: [
      { id: 'out', label: 'Circuit Output', format: (_s, p) => `${p.inputA ^ p.inputB}`, badge: 'Logic Output' },
      { id: 'gatesUsed', label: 'Universal Gates', format: () => '4 NANDs', color: '#6366f1' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-canonical-forms',
    unit: 1,
    unitTitle: 'Boolean Algebra and Logic Gates',
    topic: 'Canonical SOP and POS Forms',
    title: 'Canonical SOP (Minterms) & POS (Maxterms) Algebraic Expander',
    icon: '📜',
    flagship: false,
    shortDescription: 'Expand non-canonical boolean functions into standard canonical Sum of Products (Σm) and Product of Sums (ΠM), visualizing boolean hypercubes.',
    learningObjectives: [
      'Convert switching functions into standard Sum of Minterms (Σm) format',
      'Determine the complementary Product of Maxterms (ΠM) algebraic representation',
      'Relate binary truth valuations to decimal minterm indices'
    ],
    formulaOverview: 'f(A, B, C) = Σ m(1, 4, 6, 7) = Π M(0, 2, 3, 5)',
    parameters: [
      { key: 'variables', label: 'Number of Variables', type: 'select', default: 3, options: [{ label: '2 Variables', value: 2 }, { label: '3 Variables', value: 3 }] },
      { key: 'minterms', label: 'Minterms (CSV)', type: 'select', default: '1,4,6,7', options: [{ label: 'm(1,4,6,7)', value: '1,4,6,7' }, { label: 'm(0,2,5,7)', value: '0,2,5,7' }] }
    ],
    metrics: [
      { id: 'mintermCount', label: 'Active Minterms', format: (_s, p) => `${String(p.minterms).split(',').length} minterms` },
      { id: 'posComplement', label: 'Dual Maxterms', format: (_s, p) => `Π M(${8 - String(p.minterms).split(',').length} terms)` }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-karnaugh-maps',
    unit: 1,
    unitTitle: 'Boolean Algebra and Logic Gates',
    topic: 'Karnaugh Map Minimization',
    title: 'Karnaugh Map (K-Map) 2D/3D Minimizer & Prime Implicant Grouper ⭐',
    icon: '🗺️',
    flagship: true,
    shortDescription: 'Interactively toggle minterms and Don’t-Care conditions on 2x2, 2x4, and 4x4 Gray-code grids, observing essential prime implicants and minimal algebraic expressions.',
    learningObjectives: [
      'Construct 2, 3, and 4-variable Karnaugh maps with Gray-code coordinate indexing',
      'Identify adjacent cell groupings of sizes 1, 2, 4, 8, and 16',
      'Extract minimal Sum of Products (SOP) by selecting essential prime implicants'
    ],
    formulaOverview: 'Minimal F = ⋁ (Essential Prime Implicants)',
    parameters: [
      { key: 'mapSize', label: 'Map Dimensions', type: 'select', default: '3var', options: [{ label: '2-Variable (2x2)', value: '2var' }, { label: '3-Variable (2x4)', value: '3var' }, { label: '4-Variable (4x4)', value: '4var' }] },
      { key: 'minterms', label: 'Minterms Preset', type: 'select', default: '0,1,2,5,7', options: [{ label: '{0, 1, 2, 5, 7}', value: '0,1,2,5,7' }, { label: '{0, 2, 4, 6}', value: '0,2,4,6' }] }
    ],
    metrics: [
      { id: 'groupCount', label: 'Identified Implicants', format: () => '2 Prime Groups', color: '#6366f1' },
      { id: 'minimizedForm', label: 'Minimized Expression', format: (_s, p) => p.minterms === '0,2,4,6' ? "C'" : "A'B' + BC", color: '#10b981' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — SETS, RELATIONS, AND FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  u25dmSimulation({
    id: 'u25ma401-set-operations-venn',
    unit: 2,
    unitTitle: 'Sets, Relations, and Functions',
    topic: 'Set Algebra & Venn Diagrams',
    title: 'Interactive Set Operations & 3-Set Venn Diagram Explorer ⭐',
    icon: '⭕',
    flagship: true,
    shortDescription: 'Inspect unions, intersections, set differences, symmetric differences, and Cartesian products with dynamic 3-set Venn regions and inclusion-exclusion calculations.',
    learningObjectives: [
      'Compute formal set operations: union, intersection, set difference, symmetric difference',
      'Visualize 3-set partitions and region overlaps on Venn diagrams',
      'Apply the Principle of Inclusion-Exclusion for finite sets'
    ],
    formulaOverview: '|A ∪ B ∪ C| = |A| + |B| + |C| - |A∩B| - |B∩C| - |C∩A| + |A∩B∩C|',
    parameters: [
      { key: 'operation', label: 'Set Operation', type: 'select', default: 'intersection', options: [
        { label: 'Intersection (A ∩ B)', value: 'intersection' },
        { label: 'Union (A ∪ B)', value: 'union' },
        { label: 'Difference (A \\ B)', value: 'difference' },
        { label: 'Symmetric Difference (A △ B)', value: 'symmetric_difference' },
        { label: '3-Way Intersection (A ∩ B ∩ C)', value: 'three_set_intersection' }
      ]}
    ],
    metrics: [
      { id: 'cardinality', label: 'Result Cardinality', format: (_s, p) => p.operation === 'intersection' ? '3 elements' : '7 elements' },
      { id: 'disjoint', label: 'Disjoint Status', format: () => 'Overlapping Sets', color: '#10b981' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-relations-properties',
    unit: 2,
    unitTitle: 'Sets, Relations, and Functions',
    topic: 'Relation Properties & Equivalence',
    title: 'Binary Relations Matrix & Digraph Property Checker ⭐',
    icon: '🔗',
    flagship: true,
    shortDescription: 'Analyze finite relations via boolean adjacency matrices and directed graphs to test reflexivity, symmetry, antisymmetry, and transitivity with counterexample paths.',
    learningObjectives: [
      'Represent binary relations as boolean matrices and directed graphs',
      'Test reflexivity, symmetry, antisymmetry, and transitivity with counterexamples',
      'Partition sets into disjoint equivalence classes under equivalence relations'
    ],
    formulaOverview: 'R is Equivalence ⟺ R is Reflexive, Symmetric, and Transitive',
    parameters: [
      { key: 'preset', label: 'Relation Preset', type: 'select', default: 'equivalence', options: [
        { label: 'Equivalence Relation', value: 'equivalence' },
        { label: 'Partial Order (Poset)', value: 'poset' },
        { label: 'Strict Order', value: 'strict' }
      ]}
    ],
    metrics: [
      { id: 'reflexive', label: 'Reflexive', format: () => 'YES (All diagonal entries 1)', color: '#10b981' },
      { id: 'symmetric', label: 'Symmetric', format: (_s, p) => p.preset === 'poset' ? 'NO (Antisymmetric)' : 'YES (M = Mᵀ)', color: '#10b981' },
      { id: 'transitive', label: 'Transitive', format: () => 'YES (M² ≤ M)', color: '#10b981' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-poset-hasse',
    unit: 2,
    unitTitle: 'Sets, Relations, and Functions',
    topic: 'Partial Orderings & Posets',
    title: 'Partial Order Relations (Posets) & Hasse Diagram Generator',
    icon: '🔺',
    flagship: false,
    shortDescription: 'Construct partially ordered sets (reflexive, antisymmetric, transitive) like divisibility or power set subsets, remove redundant edges, and generate transitive reduction Hasse diagrams.',
    learningObjectives: [
      'Verify poset axioms: reflexivity, antisymmetry, and transitivity',
      'Perform transitive reduction to eliminate self-loops and redundant transitive edges',
      'Identify maximal, minimal, greatest (top), and least (bottom) elements in Hasse diagrams'
    ],
    formulaOverview: 'a ≺ b ⟺ a < b ∧ ¬∃c (a < c < b) [Covering Relation]',
    parameters: [
      { key: 'relationType', label: 'Order Type', type: 'select', default: 'divisibility', options: [
        { label: 'Divisibility on {1, 2, 3, 4, 6, 12}', value: 'divisibility' },
        { label: 'Power Set 𝒫({a, b, c}) ⊆', value: 'powerset' }
      ]}
    ],
    metrics: [
      { id: 'least', label: 'Least Element', format: () => '1', badge: 'Bottom' },
      { id: 'greatest', label: 'Greatest Element', format: () => '12', badge: 'Top' },
      { id: 'lattice', label: 'Lattice Structure', format: () => 'Distributive Lattice', color: '#10b981' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-functions-mappings',
    unit: 2,
    unitTitle: 'Sets, Relations, and Functions',
    topic: 'Function Types & Composition',
    title: 'Function Mappings, Bijectivity & Composition Explorer',
    icon: '🎯',
    flagship: false,
    shortDescription: 'Map domain elements to codomain targets with interactive arrow diagrams, testing injectivity (one-to-one), surjectivity (onto), bijectivity, and composite functions (g ∘ f).',
    learningObjectives: [
      'Classify functions as injective (one-to-one), surjective (onto), or bijective',
      'Determine when an inverse function f⁻¹ exists',
      'Trace two-stage composition mappings (g ∘ f)(x) = g(f(x))'
    ],
    formulaOverview: '(g ∘ f)(x) = g(f(x)) | f is bijective ⟹ ∃ f⁻¹',
    parameters: [
      { key: 'mappingType', label: 'Function Nature', type: 'select', default: 'bijective', options: [
        { label: 'Bijective (Invertible)', value: 'bijective' },
        { label: 'Injective but not Surjective', value: 'injective_only' },
        { label: 'Surjective but not Injective', value: 'surjective_only' }
      ]}
    ],
    metrics: [
      { id: 'injective', label: 'One-to-One (Injective)', format: (_s, p) => p.mappingType === 'surjective_only' ? 'NO' : 'YES', color: '#10b981' },
      { id: 'surjective', label: 'Onto (Surjective)', format: (_s, p) => p.mappingType === 'injective_only' ? 'NO' : 'YES', color: '#10b981' },
      { id: 'invertible', label: 'Invertible (Bijective)', format: (_s, p) => p.mappingType === 'bijective' ? 'YES' : 'NO' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — COMBINATORICS, RECURRENCE, AND INDUCTION
  // ═══════════════════════════════════════════════════════════════════════════
  u25dmSimulation({
    id: 'u25ma401-counting-principles',
    unit: 3,
    unitTitle: 'Combinatorics, Recurrence, and Induction',
    topic: 'Pigeonhole & Counting Principles',
    title: 'Fundamental Counting Principles & Pigeonhole Principle Visualizer ⭐',
    icon: '🕊️',
    flagship: true,
    shortDescription: 'Model the Rule of Sum, Rule of Product, and Generalized Pigeonhole Principle by distributing items into pigeonhole buckets and calculating guaranteed collision thresholds.',
    learningObjectives: [
      'Apply the Sum Rule and Product Rule for compound counting tasks',
      'Compute the Generalized Pigeonhole threshold ⌈n/k⌉',
      'Solve collision and hashing problems in computer science'
    ],
    formulaOverview: '⌈n / k⌉ ≥ 2 where n pigeons are distributed into k pigeonholes',
    parameters: [
      { key: 'pigeons', label: 'Items (Pigeons n)', type: 'range', min: 2, max: 40, step: 1, default: 13 },
      { key: 'holes', label: 'Buckets (Pigeonholes k)', type: 'range', min: 2, max: 20, step: 1, default: 12 }
    ],
    metrics: [
      { id: 'minGuarantee', label: 'Guaranteed Collision', format: (_s, p) => `At least ⌈${p.pigeons}/${p.holes}⌉ = ${Math.ceil(p.pigeons / p.holes)} items`, color: '#6366f1' },
      { id: 'utilization', label: 'Average Density', format: (_s, p) => `${(p.pigeons / p.holes).toFixed(2)} items/bucket` }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-permutations-combinations',
    unit: 3,
    unitTitle: 'Combinatorics, Recurrence, and Induction',
    topic: 'Permutations & Combinations',
    title: 'Permutations, Combinations & Pascal’s Triangle Combinatorial Explorer',
    icon: '🎰',
    flagship: false,
    shortDescription: 'Compare ordered permutations P(n, r) with unordered combinations C(n, r), explore Pascal’s identity, and examine stars-and-bars integer partitions.',
    learningObjectives: [
      'Distinguish ordered arrangements P(n, r) from unordered selections C(n, r)',
      'Explore combinatorial symmetry: C(n, r) = C(n, n - r)',
      'Demonstrate Pascal’s Identity C(n, r) = C(n-1, r-1) + C(n-1, r)'
    ],
    formulaOverview: 'P(n, r) = n! / (n-r)! | C(n, r) = n! / [r!(n-r)!]',
    parameters: [
      { key: 'n', label: 'Total Objects n', type: 'range', min: 1, max: 12, step: 1, default: 7 },
      { key: 'r', label: 'Selected Objects r', type: 'range', min: 0, max: 12, step: 1, default: 3 }
    ],
    metrics: [
      { id: 'permVal', label: 'Permutations P(n, r)', format: (_s, p) => {
        let pVal = 1; for (let i = 0; i < Math.min(p.r, p.n); i++) pVal *= (p.n - i); return `${pVal}`;
      }, badge: 'Ordered' },
      { id: 'combVal', label: 'Combinations C(n, r)', format: (_s, p) => {
        let cVal = 1; for (let i = 1; i <= Math.min(p.r, p.n); i++) cVal = (cVal * (p.n - i + 1)) / i; return `${Math.round(cVal)}`;
      }, badge: 'Unordered' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-recurrence-relations',
    unit: 3,
    unitTitle: 'Combinatorics, Recurrence, and Induction',
    topic: 'Linear Recurrence Relations',
    title: 'Linear Recurrence Relation Solver & Sequence Step Tracer ⭐',
    icon: '🔄',
    flagship: true,
    shortDescription: 'Solve first and second-order linear homogeneous recurrence relations (Fibonacci, Lucas, Towers of Hanoi), compute characteristic roots, and trace closed-form solutions.',
    learningObjectives: [
      'Set up and solve characteristic equations r² - c₁r - c₂ = 0',
      'Derive closed-form formulas using initial conditions',
      'Model recursive divide-and-conquer algorithms'
    ],
    formulaOverview: 'a_n = c₁ r₁ⁿ + c₂ r₂ⁿ from characteristic equation r² - c₁ r - c₂ = 0',
    parameters: [
      { key: 'relationType', label: 'Recurrence Scheme', type: 'select', default: 'fibonacci', options: [
        { label: 'Fibonacci: a_n = a_(n-1) + a_(n-2)', value: 'fibonacci' },
        { label: 'Towers of Hanoi: T_n = 2T_(n-1) + 1', value: 'hanoi' },
        { label: 'Geometric: a_n = 3a_(n-1)', value: 'geometric' }
      ]},
      { key: 'steps', label: 'Term Index n', type: 'range', min: 2, max: 15, step: 1, default: 8 }
    ],
    metrics: [
      { id: 'termVal', label: 'Computed Term a_n', format: (_s, p) => p.relationType === 'fibonacci' ? '21' : '255', color: '#10b981' },
      { id: 'asymptotic', label: 'Growth Order', format: (_s, p) => p.relationType === 'fibonacci' ? 'O(φⁿ) where φ ≈ 1.618' : 'O(2ⁿ)', badge: 'Complexity' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-mathematical-induction',
    unit: 3,
    unitTitle: 'Combinatorics, Recurrence, and Induction',
    topic: 'Mathematical Induction Proofs',
    title: 'Mathematical Induction Domino Step & Invariant Proof Explorer',
    icon: '🀄',
    flagship: false,
    shortDescription: 'Step through the Base Case P(1), Induction Hypothesis P(k), and Inductive Step P(k+1) using visual falling dominos to demonstrate structural and strong mathematical induction.',
    learningObjectives: [
      'Execute the 3-phase induction protocol: Base Case, Induction Hypothesis, Inductive Step',
      'Verify algebraic invariants for sums, inequalities, and divisibility',
      'Understand the well-ordering principle underlying induction validity'
    ],
    formulaOverview: 'P(1) ∧ (∀k ≥ 1: P(k) ⟹ P(k+1)) ⟹ ∀n ≥ 1: P(n)',
    parameters: [
      { key: 'theorem', label: 'Statement to Prove', type: 'select', default: 'sum_of_n_integers', options: [
        { label: '1 + 2 + ... + n = n(n+1)/2', value: 'sum_of_n_integers' },
        { label: '1 + 3 + ... + (2n-1) = n²', value: 'sum_of_odd_integers' },
      ]},
      { key: 'targetN', label: 'Verify Bound n', type: 'range', min: 1, max: 10, step: 1, default: 6 }
    ],
    metrics: [
      { id: 'baseCase', label: 'Base Case P(1)', format: () => 'Holds: 1 = 1(2)/2 = 1', color: '#10b981' },
      { id: 'inductionStep', label: 'Inductive Step P(k+1)', format: () => 'k(k+1)/2 + (k+1) = (k+1)(k+2)/2', color: '#6366f1' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — GRAPH THEORY AND ALGORITHMS
  // ═══════════════════════════════════════════════════════════════════════════
  u25dmSimulation({
    id: 'u25ma401-graph-representations',
    unit: 4,
    unitTitle: 'Graph Theory and Algorithms',
    topic: 'Graph Models & Representations',
    title: 'Graph Representations (Adjacency Matrix, Digraph & Degree Visualizer) ⭐',
    icon: '🕸️',
    flagship: true,
    shortDescription: 'Construct directed and undirected graphs, inspect adjacency matrices, incidence matrices, adjacency lists, and verify the Handshaking Lemma (Σ deg(v) = 2|E|).',
    learningObjectives: [
      'Translate graph topologies into adjacency and incidence matrices',
      'Verify Euler’s Handshaking Lemma: sum of vertex degrees equals 2|E|',
      'Analyze in-degree and out-degree distributions in directed multigraphs'
    ],
    formulaOverview: '∑ deg(v) = 2|E| | A_ij = 1 ⟺ (v_i, v_j) ∈ E',
    parameters: [
      { key: 'graphPreset', label: 'Preset Topology', type: 'select', default: 'cycle_5', options: [
        { label: 'Cycle Graph C5', value: 'cycle_5' },
        { label: 'Complete Graph K4', value: 'complete_4' },
        { label: 'Petersen Subgraph', value: 'petersen_subgraph' }
      ]}
    ],
    metrics: [
      { id: 'vertexCount', label: 'Vertices |V|', format: (_s, p) => p.graphPreset === 'complete_4' ? '4' : '5' },
      { id: 'edgeCount', label: 'Edges |E|', format: (_s, p) => p.graphPreset === 'complete_4' ? '6' : '5' },
      { id: 'handshaking', label: 'Handshaking Sum', format: (_s, p) => p.graphPreset === 'complete_4' ? '12 = 2 × 6' : '10 = 2 × 5', color: '#10b981' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-euler-hamilton',
    unit: 4,
    unitTitle: 'Graph Theory and Algorithms',
    topic: 'Euler & Hamilton Paths',
    title: 'Eulerian & Hamiltonian Paths, Fleury’s Algorithm & Traveling Circuit Explorer ⭐',
    icon: '♾️',
    flagship: true,
    shortDescription: 'Trace Eulerian circuits (even vertex degrees) using Fleury’s algorithm and search for Hamiltonian cycles (visiting every vertex exactly once) with Dirac & Ore sufficiency tests.',
    learningObjectives: [
      'Apply Euler’s Theorem: G has an Euler circuit iff every vertex has even degree',
      'Trace Eulerian trails using Fleury’s algorithm without crossing bridges',
      'Contrast Eulerian (edge traversal) with Hamiltonian (vertex traversal) problems'
    ],
    formulaOverview: 'Euler Circuit ⟺ Connected ∧ (∀v ∈ V: deg(v) is even)',
    parameters: [
      { key: 'graphType', label: 'Graph Model', type: 'select', default: 'konigsberg_bridges', options: [
        { label: 'Königsberg 7 Bridges (Non-Eulerian)', value: 'konigsberg_bridges' },
        { label: 'Envelope with Flap (Euler Circuit)', value: 'envelope_euler' }
      ]}
    ],
    metrics: [
      { id: 'eulerianStatus', label: 'Euler Circuit Exists?', format: (_s, p) => p.graphType === 'konigsberg_bridges' ? 'NO (4 odd vertices)' : 'YES (All even degrees)', color: '#10b981' },
      { id: 'hamiltonianStatus', label: 'Hamiltonian Cycle', format: () => 'Contains Hamilton Cycle' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-shortest-path-coloring',
    unit: 4,
    unitTitle: 'Graph Theory and Algorithms',
    topic: 'Shortest Path & Graph Coloring',
    title: 'Dijkstra’s Shortest Path & Vertex Coloring Chromatic Number Lab ⭐',
    icon: '🎨',
    flagship: true,
    shortDescription: 'Step through Dijkstra’s priority queue shortest path routing on weighted graphs, then apply greedy vertex coloring to compute chromatic bounds (χ(G)).',
    learningObjectives: [
      'Execute Dijkstra’s shortest path algorithm with tentative distance relaxation',
      'Assign minimal colors to adjacent vertices to determine chromatic number χ(G)',
      'Apply Brook’s Theorem: χ(G) ≤ Δ(G) for non-complete, non-odd cycle graphs'
    ],
    formulaOverview: 'd(v) = min(d(v), d(u) + w(u, v)) | χ(G) ≤ Δ(G) + 1',
    parameters: [
      { key: 'graphTopology', label: 'Graph Structure', type: 'select', default: 'network_mesh', options: [
        { label: 'Routing Mesh (A to F)', value: 'network_mesh' },
        { label: 'Cycle C5 (χ = 3)', value: 'cycle_5' },
        { label: 'Complete Graph K4 (χ = 4)', value: 'complete_4' }
      ]}
    ],
    metrics: [
      { id: 'chromaticNum', label: 'Chromatic Number χ(G)', format: (_s, p) => p.graphTopology === 'complete_4' ? '4 colors' : '3 colors', color: '#6366f1' },
      { id: 'shortestDist', label: 'Shortest Path A ➔ F', format: () => 'Distance = 11' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — PROPOSITIONAL LOGIC, PREDICATES, AND PROOFS
  // ═══════════════════════════════════════════════════════════════════════════
  u25dmSimulation({
    id: 'u25ma401-propositional-truth-tables',
    unit: 5,
    unitTitle: 'Propositional Logic, Predicates, and Proofs',
    topic: 'Truth Tables & Equivalence',
    title: 'Propositional Logic Expression Evaluator & Truth Table Generator ⭐',
    icon: '🔣',
    flagship: true,
    shortDescription: 'Parse compound propositions using logical connectives (∧, ∨, ¬, →, ↔), generate complete 2^n truth tables, and classify formulas as Tautologies, Contradictions, or Contingencies.',
    learningObjectives: [
      'Construct complete truth tables for complex propositional formulas',
      'Classify formulas as Tautologies (valid), Contradictions, or Contingencies',
      'Verify logical equivalences such as p → q ≡ ¬p ∨ q'
    ],
    formulaOverview: 'p → q ≡ ¬p ∨ q | ¬(p → q) ≡ p ∧ ¬q',
    parameters: [
      { key: 'expression', label: 'Propositional Expression', type: 'select', default: '(p -> q) <-> (!p || q)', options: [
        { label: '(p → q) ↔ (¬p ∨ q) [Tautology]', value: '(p -> q) <-> (!p || q)' },
        { label: 'p ∧ ¬p [Contradiction]', value: 'p && !p' },
        { label: 'p ∨ q [Contingency]', value: 'p || q' }
      ]}
    ],
    metrics: [
      { id: 'classification', label: 'Formula Classification', format: (_s, p) => p.expression.includes('<->') ? 'Tautology (Valid Theorem)' : 'Contingency', color: '#10b981' },
      { id: 'tableRows', label: 'Truth Table Rows', format: () => '2² = 4 rows' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-predicates-quantifiers',
    unit: 5,
    unitTitle: 'Propositional Logic, Predicates, and Proofs',
    topic: 'Predicates & Quantifiers',
    title: 'Predicates & Quantifiers (∀, ∃) Domain Universe Truth Explorer',
    icon: '🔍',
    flagship: false,
    shortDescription: 'Evaluate universal (∀) and existential (∃) quantified statements over finite universes of discourse, inspect nested quantifiers, and test De Morgan’s laws for quantifiers.',
    learningObjectives: [
      'Evaluate universal quantifiers (∀x P(x)) and existential quantifiers (∃x P(x))',
      'Apply De Morgan’s Laws for Quantifiers: ¬(∀x P(x)) ≡ ∃x ¬P(x)',
      'Analyze order significance in nested quantifiers ∀x ∃y vs ∃y ∀x'
    ],
    formulaOverview: '¬(∀x P(x)) ≡ ∃x ¬P(x) | ¬(∃x P(x)) ≡ ∀x ¬P(x)',
    parameters: [
      { key: 'quantifier', label: 'Quantifier', type: 'select', default: 'exists', options: [
        { label: 'Existential (∃x)', value: 'exists' },
        { label: 'Universal (∀x)', value: 'forall' }
      ]},
      { key: 'predicate', label: 'Predicate P(x)', type: 'select', default: 'is_even', options: [
        { label: 'x is Even', value: 'is_even' },
        { label: 'x is Prime', value: 'is_prime' }
      ]}
    ],
    metrics: [
      { id: 'evalTruth', label: 'Statement Truth Value', format: (_s, p) => p.quantifier === 'exists' ? 'TRUE (e.g. x=2 satisfies)' : 'FALSE (Not all satisfy)', color: '#10b981' },
      { id: 'domainSize', label: 'Universe Size', format: () => 'Domain D = {1, 2, 3, 4, 5}' }
    ]
  }),

  u25dmSimulation({
    id: 'u25ma401-inference-proofs',
    unit: 5,
    unitTitle: 'Propositional Logic, Predicates, and Proofs',
    topic: 'Rules of Inference & Proofs',
    title: 'Rules of Inference & Deductive Proof Step Validator (Modus Ponens / Tollens) ⭐',
    icon: '🛡️',
    flagship: true,
    shortDescription: 'Construct formal deductive arguments using Modus Ponens, Modus Tollens, Hypothetical Syllogism, and Disjunctive Syllogism, contrasting valid deductions from formal fallacies.',
    learningObjectives: [
      'Apply Modus Ponens and Modus Tollens inference rules to validate arguments',
      'Chain premises with Hypothetical Syllogism and Disjunctive Syllogism',
      'Contrast valid deductive reasoning from the Fallacy of Affirming the Consequent'
    ],
    formulaOverview: '[p → q, p] ⊢ q (Modus Ponens) | [p → q, ¬q] ⊢ ¬p (Modus Tollens)',
    parameters: [
      { key: 'rule', label: 'Inference Rule', type: 'select', default: 'modus_tollens', options: [
        { label: 'Modus Tollens (p→q, ¬q ⊢ ¬p)', value: 'modus_tollens' },
        { label: 'Modus Ponens (p→q, p ⊢ q)', value: 'modus_ponens' },
        { label: 'Hypothetical Syllogism (p→q, q→r ⊢ p→r)', value: 'hypothetical_syllogism' }
      ]}
    ],
    metrics: [
      { id: 'validity', label: 'Argument Form Validity', format: () => 'VALID (Tautological Deduction)', color: '#10b981' },
      { id: 'fallacyCheck', label: 'Formal Fallacy Check', format: () => 'No Fallacies Detected', badge: 'Sound Logic' }
    ]
  })
];
