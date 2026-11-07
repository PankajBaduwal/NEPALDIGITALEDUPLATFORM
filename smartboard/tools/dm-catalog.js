/**
 * dm-catalog.js
 * Discrete Mathematics (U25MA401 / U21MAG02) — 18 Simulations Catalog
 * Regulation R2025 (Revised) CBCS · Semester IV · BSC · 4 Credits (3-1-0-0-4)
 * Official Curriculum Reference: KPRIET B.Tech IT / AI&DS / CSE / CSBS
 *
 * 5 Syllabus Units:
 * Unit I:   Boolean Algebra and Logic Gates (Sims 1-4)
 * Unit II:  Sets, Relations, and Functions (Sims 5-8)
 * Unit III: Combinatorics, Recurrence, and Induction (Sims 9-12)
 * Unit IV:  Graph Theory and Algorithms (Sims 13-15)
 * Unit V:   Propositional Logic, Predicates, and Proofs (Sims 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduverseDMCatalog = exp;
  if (typeof window !== 'undefined') window.EduverseDMCatalog = exp;
  if (typeof global !== 'undefined') global.EduverseDMCatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Boolean Algebra and Logic Gates', code: 'UNIT I' },
    { number: 2, title: 'Sets, Relations, and Functions', code: 'UNIT II' },
    { number: 3, title: 'Combinatorics, Recurrence, and Induction', code: 'UNIT III' },
    { number: 4, title: 'Graph Theory and Algorithms', code: 'UNIT IV' },
    { number: 5, title: 'Propositional Logic, Predicates, and Proofs', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — BOOLEAN ALGEBRA AND LOGIC GATES
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma401-boolean-algebra',
      unit: 1,
      unitTitle: 'Boolean Algebra and Logic Gates',
      topic: 'Boolean Algebra Axioms & Duals',
      title: 'Boolean Algebra Axioms, Laws & Principle of Duality ⭐ (Flagship)',
      icon: '⚖️',
      flagship: true,
      description: 'Explore Huntington postulates, algebraic laws (idempotent, involution, absorption, De Morgan), and dual expressions under algebraic substitution.',
      formula: 'x + (y \\cdot z) = (x + y)(x + z) \\quad \\iff \\quad x \\cdot (y + z) = (x \\cdot y) + (x \\cdot z)',
      defaultParams: { law: 'distributive', varX: 1, varY: 0, varZ: 1 },
      challenge: {
        goal: 'Verify De Morgan’s Second Law: ¬(x ∧ y) = (¬x ∨ ¬y) for all four binary combinations.',
        expectedResult: 'Tautological equality across all 4 truth assignments.'
      }
    },
    {
      id: 'u25ma401-logic-gates-circuits',
      unit: 1,
      unitTitle: 'Boolean Algebra and Logic Gates',
      topic: 'Logic Gates & Combinational Circuits',
      title: 'Universal Logic Gates (NAND/NOR) & Combinational Circuit Builder ⭐ (Flagship)',
      icon: '🔌',
      flagship: true,
      description: 'Synthesize standard gates (AND, OR, NOT, XOR, XNOR) using functionally complete universal NAND and NOR gates, tracing propagation delays and truth tables.',
      formula: 'x \\text{ XOR } y = (x \\cdot \\overline{y}) + (\\overline{x} \\cdot y) = (x + y) \\cdot \\overline{x \\cdot y}',
      defaultParams: { circuitType: 'xor_universal_nand', inputA: 1, inputB: 0 },
      challenge: {
        goal: 'Construct an equivalence circuit for Exclusive-OR using exactly 4 NAND gates.',
        expectedResult: 'Output is 1 when inputs differ, 0 when inputs match.'
      }
    },
    {
      id: 'u25ma401-canonical-forms',
      unit: 1,
      unitTitle: 'Boolean Algebra and Logic Gates',
      topic: 'Canonical SOP and POS Forms',
      title: 'Canonical SOP (Minterms) & POS (Maxterms) Algebraic Expander',
      icon: '📜',
      flagship: false,
      description: 'Expand non-canonical boolean functions into standard canonical Sum of Products (Σm) and Product of Sums (ΠM), visualizing boolean hypercubes.',
      formula: 'f(A, B, C) = \\sum m(1, 4, 6, 7) = \\prod M(0, 2, 3, 5)',
      defaultParams: { variables: 3, minterms: '1,4,6,7' },
      challenge: {
        goal: 'Convert Σm(1, 3, 5, 7) into its complementary canonical POS form.',
        expectedResult: 'ΠM(0, 2, 4, 6) = A\' simplified to single literal C.'
      }
    },
    {
      id: 'u25ma401-karnaugh-maps',
      unit: 1,
      unitTitle: 'Boolean Algebra and Logic Gates',
      topic: 'Karnaugh Map Minimization',
      title: 'Karnaugh Map (K-Map) 2D/3D Minimizer & Prime Implicant Grouper ⭐ (Flagship)',
      icon: '🗺️',
      flagship: true,
      description: 'Interactively toggle minterms and Don’t-Care conditions on 2x2, 2x4, and 4x4 Gray-code grids, observing essential prime implicants and minimal algebraic expressions.',
      formula: '\\text{Minimal } F = \\bigvee \\text{Essential Prime Implicants}',
      defaultParams: { mapSize: '3var', minterms: '0,1,2,5,7', dontCares: '' },
      challenge: {
        goal: 'Group adjacent 1-cells on a 3-variable map with minterms {0, 2, 4, 6} to produce a single literal term.',
        expectedResult: 'Term C\' (column wrap-around grouping of 4 cells).'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — SETS, RELATIONS, AND FUNCTIONS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma401-set-operations-venn',
      unit: 2,
      unitTitle: 'Sets, Relations, and Functions',
      topic: 'Set Algebra & Venn Diagrams',
      title: 'Interactive Set Operations & 3-Set Venn Diagram Explorer ⭐ (Flagship)',
      icon: '⭕',
      flagship: true,
      description: 'Inspect unions, intersections, set differences, symmetric differences, and Cartesian products with dynamic 3-set Venn regions and inclusion-exclusion calculations.',
      formula: '|A \\cup B \\cup C| = \\sum |A| - \\sum |A \\cap B| + |A \\cap B \\cap C|',
      defaultParams: { operation: 'symmetric_difference', setA: '1,2,3,4,5', setB: '3,4,5,6,7', setC: '4,5,7,8,9' },
      challenge: {
        goal: 'Identify the cardinality and elements of (A ∪ B) \\ C for given sample universal sets.',
        expectedResult: 'Elements {1, 2, 3, 6} with cardinality 4.'
      }
    },
    {
      id: 'u25ma401-relations-properties',
      unit: 2,
      unitTitle: 'Sets, Relations, and Functions',
      topic: 'Relation Properties & Equivalence',
      title: 'Binary Relations Matrix & Digraph Property Checker ⭐ (Flagship)',
      icon: '🔗',
      flagship: true,
      description: 'Analyze finite relations via boolean adjacency matrices and directed graphs to test reflexivity, symmetry, antisymmetry, and transitivity with counterexample paths.',
      formula: 'R \\text{ is Equivalence} \\iff R \\text{ is Reflexive, Symmetric, and Transitive}',
      defaultParams: { elements: '1,2,3,4', relationPairs: '(1,1),(2,2),(3,3),(4,4),(1,2),(2,1),(2,3),(3,2),(1,3),(3,1)' },
      challenge: {
        goal: 'Verify whether the given relation forms an equivalence relation and partition the set into equivalence classes.',
        expectedResult: 'Equivalence Relation confirmed. Equivalence classes: {[1, 2, 3], [4]}.'
      }
    },
    {
      id: 'u25ma401-poset-hasse',
      unit: 2,
      unitTitle: 'Sets, Relations, and Functions',
      topic: 'Partial Orderings & Posets',
      title: 'Partial Order Relations (Posets) & Hasse Diagram Generator',
      icon: '🔺',
      flagship: false,
      description: 'Construct partially ordered sets (reflexive, antisymmetric, transitive) like divisibility or power set subsets, remove redundant edges, and generate transitive reduction Hasse diagrams.',
      formula: 'a \\prec b \\iff a < b \\text{ and } \\nexists c \\text{ s.t. } a < c < b',
      defaultParams: { relationType: 'divisibility', baseSet: '1,2,3,4,6,12' },
      challenge: {
        goal: 'Generate the Hasse diagram for the divisibility poset on {1, 2, 3, 4, 6, 12} and find maximal and minimal elements.',
        expectedResult: 'Minimal element: 1; Maximal element: 12; Height = 4.'
      }
    },
    {
      id: 'u25ma401-functions-mappings',
      unit: 2,
      unitTitle: 'Sets, Relations, and Functions',
      topic: 'Function Types & Composition',
      title: 'Function Mappings, Bijectivity & Composition Explorer',
      icon: '🎯',
      flagship: false,
      description: 'Map domain elements to codomain targets with interactive arrow diagrams, testing injectivity (one-to-one), surjectivity (onto), bijectivity, and composite functions (g ∘ f).',
      formula: '(g \\circ f)(x) = g(f(x)) \\quad | \\quad f \\text{ is bijective} \\implies \\exists f^{-1}',
      defaultParams: { domain: 'a,b,c,d', codomain: '1,2,3,4', mapping: 'a:1,b:2,c:3,d:4' },
      challenge: {
        goal: 'Configure a bijective function from {a, b, c, d} to {1, 2, 3, 4} and trace its inverse mapping.',
        expectedResult: 'Injective: Yes, Surjective: Yes, Invertible: Yes.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — COMBINATORICS, RECURRENCE, AND INDUCTION
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma401-counting-principles',
      unit: 3,
      unitTitle: 'Combinatorics, Recurrence, and Induction',
      topic: 'Pigeonhole & Counting Principles',
      title: 'Fundamental Counting Principles & Pigeonhole Principle Visualizer ⭐ (Flagship)',
      icon: '🕊️',
      flagship: true,
      description: 'Model the Rule of Sum, Rule of Product, and Generalized Pigeonhole Principle by distributing items into pigeonhole buckets and calculating guaranteed collision thresholds.',
      formula: '\\lceil n / k \\rceil \\ge 2 \\quad \\text{where } n \\text{ pigeons are placed into } k \\text{ pigeonholes}',
      defaultParams: { pigeons: 13, holes: 12, ruleType: 'generalized_pigeonhole' },
      challenge: {
        goal: 'Given 37 students in a computer lab, determine the guaranteed minimum number of students born in the same month.',
        expectedResult: '⌈37 / 12⌉ = 4 students guaranteed to share a birth month.'
      }
    },
    {
      id: 'u25ma401-permutations-combinations',
      unit: 3,
      unitTitle: 'Combinatorics, Recurrence, and Induction',
      topic: 'Permutations & Combinations',
      title: 'Permutations, Combinations & Pascal’s Triangle Combinatorial Explorer',
      icon: '🎰',
      flagship: false,
      description: 'Compare ordered permutations P(n, r) with unordered combinations C(n, r), explore Pascal’s identity, and examine stars-and-bars integer partitions.',
      formula: 'P(n, r) = \\frac{n!}{(n-r)!} \\quad | \\quad C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}',
      defaultParams: { n: 7, r: 3, allowRepetition: false },
      challenge: {
        goal: 'Calculate the number of 4-digit PINs formed from digits {1,2,3,4,5} without repetition vs. with repetition.',
        expectedResult: 'Without: P(5,4) = 120; With: 5^4 = 625.'
      }
    },
    {
      id: 'u25ma401-recurrence-relations',
      unit: 3,
      unitTitle: 'Combinatorics, Recurrence, and Induction',
      topic: 'Linear Recurrence Relations',
      title: 'Linear Recurrence Relation Solver & Sequence Step Tracer ⭐ (Flagship)',
      icon: '🔄',
      flagship: true,
      description: 'Solve first and second-order linear homogeneous recurrence relations (Fibonacci, Lucas, Towers of Hanoi), compute characteristic roots, and trace closed-form solutions.',
      formula: 'a_n = c_1 r_1^n + c_2 r_2^n \\quad \\text{from characteristic equation } r^2 - c_1 r - c_2 = 0',
      defaultParams: { relationType: 'fibonacci', initialA0: 0, initialA1: 1, steps: 10 },
      challenge: {
        goal: 'Trace the Towers of Hanoi recurrence T(n) = 2T(n-1) + 1 with T(1) = 1 for n = 5 discs.',
        expectedResult: 'T(5) = 2^5 - 1 = 31 minimum moves.'
      }
    },
    {
      id: 'u25ma401-mathematical-induction',
      unit: 3,
      unitTitle: 'Combinatorics, Recurrence, and Induction',
      topic: 'Mathematical Induction Proofs',
      title: 'Mathematical Induction Domino Step & Invariant Proof Explorer',
      icon: '🀄',
      flagship: false,
      description: 'Step through the Base Case P(1), Induction Hypothesis P(k), and Inductive Step P(k+1) using visual falling dominos to demonstrate structural and strong mathematical induction.',
      formula: 'P(1) \\land (\\forall k \\ge 1: P(k) \\implies P(k+1)) \\implies \\forall n \\ge 1: P(n)',
      defaultParams: { theorem: 'sum_of_n_integers', targetN: 6 },
      challenge: {
        goal: 'Verify the inductive step for the sum of the first n odd integers: 1 + 3 + ... + (2n-1) = n^2.',
        expectedResult: 'k^2 + (2(k+1) - 1) = k^2 + 2k + 1 = (k+1)^2.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — GRAPH THEORY AND ALGORITHMS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma401-graph-representations',
      unit: 4,
      unitTitle: 'Graph Theory and Algorithms',
      topic: 'Graph Models & Representations',
      title: 'Graph Representations (Adjacency Matrix, Digraph & Degree Visualizer) ⭐ (Flagship)',
      icon: '🕸️',
      flagship: true,
      description: 'Construct directed and undirected graphs, inspect adjacency matrices, incidence matrices, adjacency lists, and verify the Handshaking Lemma (Σ deg(v) = 2|E|).',
      formula: '\\sum_{v \\in V} \\deg(v) = 2|E| \\quad | \\quad A_{ij} = 1 \\iff (v_i, v_j) \\in E',
      defaultParams: { graphPreset: 'petersen_subgraph', directed: false },
      challenge: {
        goal: 'Verify the Handshaking Lemma on a 5-vertex cycle graph C5.',
        expectedResult: 'Sum of degrees = 5 * 2 = 10; 2 * |E| = 2 * 5 = 10.'
      }
    },
    {
      id: 'u25ma401-euler-hamilton',
      unit: 4,
      unitTitle: 'Graph Theory and Algorithms',
      topic: 'Euler & Hamilton Paths',
      title: 'Eulerian & Hamiltonian Paths, Fleury’s Algorithm & Traveling Circuit Explorer ⭐ (Flagship)',
      icon: '♾️',
      flagship: true,
      description: 'Trace Eulerian circuits (even vertex degrees) using Fleury’s algorithm and search for Hamiltonian cycles (visiting every vertex exactly once) with Dirac & Ore sufficiency tests.',
      formula: 'G \\text{ has Euler Circuit} \\iff G \\text{ is connected and every vertex has even degree}',
      defaultParams: { graphType: 'konigsberg_bridges', algorithm: 'euler_trace' },
      challenge: {
        goal: 'Analyze the historic Königsberg 7 Bridges multigraph and explain why no Eulerian path is possible.',
        expectedResult: 'Vertices have degrees (3, 3, 3, 5) — all 4 vertices have odd degrees; Euler path requires ≤ 2 odd vertices.'
      }
    },
    {
      id: 'u25ma401-shortest-path-coloring',
      unit: 4,
      unitTitle: 'Graph Theory and Algorithms',
      topic: 'Shortest Path & Graph Coloring',
      title: 'Dijkstra’s Shortest Path & Vertex Coloring Chromatic Number Lab ⭐ (Flagship)',
      icon: '🎨',
      flagship: true,
      description: 'Step through Dijkstra’s priority queue shortest path routing on weighted graphs, then apply greedy vertex coloring to compute chromatic bounds (χ(G)).',
      formula: 'd(v) = \\min(d(v), d(u) + w(u, v)) \\quad | \\quad \\chi(G) \\le \\Delta(G) + 1',
      defaultParams: { graphTopology: 'network_mesh', startNode: 'A', endNode: 'F' },
      challenge: {
        goal: 'Find the chromatic number of complete graph K4 and bipartite graph K3,3.',
        expectedResult: 'χ(K4) = 4 (requires 4 colors); χ(K3,3) = 2 (2-colorable).'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — PROPOSITIONAL LOGIC, PREDICATES, AND PROOFS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma401-propositional-truth-tables',
      unit: 5,
      unitTitle: 'Propositional Logic, Predicates, and Proofs',
      topic: 'Truth Tables & Equivalence',
      title: 'Propositional Logic Expression Evaluator & Truth Table Generator ⭐ (Flagship)',
      icon: '🔣',
      flagship: true,
      description: 'Parse compound propositions using logical connectives (∧, ∨, ¬, →, ↔), generate complete 2^n truth tables, and classify formulas as Tautologies, Contradictions, or Contingencies.',
      formula: 'p \\to q \\equiv \\neg p \\lor q \\quad | \\quad \\neg(p \\to q) \\equiv p \\land \\neg q',
      defaultParams: { expression: '(p -> q) <-> (!p || q)', vars: 'p,q' },
      challenge: {
        goal: 'Test whether the conditional implication law (p → q) ↔ (¬p ∨ q) is a tautology.',
        expectedResult: 'Tautology confirmed: Output evaluates to True (T) on all 4 valuations.'
      }
    },
    {
      id: 'u25ma401-predicates-quantifiers',
      unit: 5,
      unitTitle: 'Propositional Logic, Predicates, and Proofs',
      topic: 'Predicates & Quantifiers',
      title: 'Predicates & Quantifiers (∀, ∃) Domain Universe Truth Explorer',
      icon: '🔍',
      flagship: false,
      description: 'Evaluate universal (∀) and existential (∃) quantified statements over finite universes of discourse, inspect nested quantifiers, and test De Morgan’s laws for quantifiers.',
      formula: '\\neg(\\forall x P(x)) \\equiv \\exists x \\neg P(x) \\quad | \\quad \\neg(\\exists x P(x)) \\equiv \\forall x \\neg P(x)',
      defaultParams: { domain: 'integers_1_to_5', predicate: 'is_even', quantifier: 'exists' },
      challenge: {
        goal: 'Determine the truth value of ∀x ∃y (x + y = 0) over the set of integers {-2, -1, 0, 1, 2}.',
        expectedResult: 'True: For every x, y = -x exists in the integer domain.'
      }
    },
    {
      id: 'u25ma401-inference-proofs',
      unit: 5,
      unitTitle: 'Propositional Logic, Predicates, and Proofs',
      topic: 'Rules of Inference & Proofs',
      title: 'Rules of Inference & Deductive Proof Step Validator (Modus Ponens / Tollens) ⭐ (Flagship)',
      icon: '🛡️',
      flagship: true,
      description: 'Construct formal deductive arguments using Modus Ponens, Modus Tollens, Hypothetical Syllogism, and Disjunctive Syllogism, contrasting valid deductions from formal fallacies.',
      formula: '\\frac{p \\to q, \\quad p}{\\therefore q} \\text{ [Modus Ponens]} \\quad \\Bigg| \\quad \\frac{p \\to q, \\quad \\neg q}{\\therefore \\neg p} \\text{ [Modus Tollens]}',
      defaultParams: { rule: 'modus_tollens', premise1: 'p -> q', premise2: '!q' },
      challenge: {
        goal: 'Validate a 3-step proof: Premises: (1) p → q, (2) q → r, (3) p. Deduce conclusion r.',
        expectedResult: 'Step 1: Hypothetical Syllogism yields p → r; Step 2: Modus Ponens yields r. Valid.'
      }
    }
  ];

  return {
    courseCode: 'U25MA401',
    legacyCode: 'U21MAG02',
    courseTitle: 'Discrete Mathematics',
    semester: 4,
    category: 'BSC',
    credits: 4,
    units: UNITS,
    simulations: SIMULATIONS,
    getSimulationById: function (id) {
      return SIMULATIONS.find(function (s) { return s.id === id; }) || SIMULATIONS[0];
    },
    getSimulationsByUnit: function (unitNumber) {
      return SIMULATIONS.filter(function (s) { return s.unit === unitNumber; });
    }
  };
}));
