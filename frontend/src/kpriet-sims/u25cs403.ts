import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25CS403 (R2025 Revised) / U21CS401 (R2021)
 * Course Name: Design and Analysis of Algorithms
 * Semester: IV | Category: PCC | Credits: 3 (L-T-P-J-C: 3-0-0-0-3) | Regulation: R2025 CBCS
 * Common to: IT, AI&DS, CSE, CSBS
 *
 * Uses isolated Smart Board Design and Analysis of Algorithms Engine architecture (boardEngine: 'daa')
 * Dynamic routing via smartboardPresetKey to daa-simulation.html and tools/daa-simulation.js.
 */
export const U25CS403_SUBJECT_KEYWORDS = [
  'u25cs403',
  'u21cs401',
  'cs403',
  'cs401',
  'design and analysis of algorithms',
  'design & analysis of algorithms',
  'analysis of algorithms',
  'algorithm analysis',
  'algorithms lab',
  'daa',
];

function u25daaSimulation(def: {
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
    boardEngine: 'daa',
    daaCategory: def.topic,
    domain: 'COMPUTER_SCIENCE',
    category: 'algorithms',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25CS403_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with an interactive 2D algorithmic execution canvas, recurrence solvers, DP matrices, graph traversals, and asymptotic growth benchmarks.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    flagship: def.flagship,
    tags: ['U25CS403', 'U21CS401', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Design and Analysis of Algorithms', 'R2025 CBCS'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ active: true, step: 0 }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25CS403_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — ALGORITHM DESIGN FOUNDATIONS & PROBLEM SOLVING
  // ═══════════════════════════════════════════════════════════════════════════
  u25daaSimulation({
    id: 'u25cs403-linear-binary-search',
    unit: 1,
    unitTitle: 'Algorithm Design Foundations & Problem Solving',
    topic: 'Searching Strategies & Preconditions',
    title: 'Linear vs Binary Search Step Tracer & Precondition Analyzer ⭐',
    icon: '🔍',
    flagship: true,
    shortDescription: 'Step through sequential scan vs divide-and-conquer binary search on sorted/unsorted arrays, tracing comparisons, active search windows [low, mid, high], and boundary edge cases.',
    learningObjectives: [
      'Compare sequential scan O(n) with logarithmic search O(log n)',
      'Analyze search window reduction [low, mid, high] at each iteration',
      'Verify strict sorting preconditions required for binary search correctness'
    ],
    formulaOverview: 'T_linear(n) = O(n) | T_binary(n) = O(log₂ n) requires sorted input',
    parameters: [
      { key: 'algorithm', label: 'Algorithm', type: 'select', default: 'binary_search', options: [
        { label: 'Binary Search (O(log n))', value: 'binary_search' },
        { label: 'Linear Search (O(n))', value: 'linear_search' }
      ]},
      { key: 'targetVal', label: 'Target Value', type: 'range', min: 1, max: 99, step: 1, default: 42 },
      { key: 'arrayType', label: 'Array Distribution', type: 'select', default: 'sorted_ascending', options: [
        { label: 'Sorted Ascending', value: 'sorted_ascending' },
        { label: 'Unsorted Array', value: 'unsorted' }
      ]}
    ],
    metrics: [
      { id: 'comparisons', label: 'Comparisons Made', format: (_s, p) => p.algorithm === 'binary_search' ? '3 comparisons' : '7 comparisons', color: '#f59e0b' },
      { id: 'timeComplexity', label: 'Asymptotic Order', format: (_s, p) => p.algorithm === 'binary_search' ? 'O(log n)' : 'O(n)', badge: 'Complexity' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-elementary-sorts',
    unit: 1,
    unitTitle: 'Algorithm Design Foundations & Problem Solving',
    topic: 'Elementary Sorting Algorithms',
    title: 'Elementary Sorting Comparison (Bubble, Selection, Insertion Sort) ⭐',
    icon: '📊',
    flagship: true,
    shortDescription: 'Side-by-side execution of Bubble, Selection, and Insertion sorts on identical data, counting element comparisons, swaps, and inversion removals in real time.',
    learningObjectives: [
      'Trace comparative mechanics and loop boundaries across elementary sorting algorithms',
      'Calculate inversion counts and measure adaptive behavior on nearly-sorted data',
      'Contrast Selection Sort O(n) minimum swaps with Bubble Sort O(n²) worst-case swaps'
    ],
    formulaOverview: 'Total Comparisons: ∑ i = n(n-1)/2 = Θ(n²)',
    parameters: [
      { key: 'algorithm', label: 'Sorting Scheme', type: 'select', default: 'insertion_sort', options: [
        { label: 'Insertion Sort (Adaptive O(n) Best)', value: 'insertion_sort' },
        { label: 'Selection Sort (Min Swaps Θ(n²))', value: 'selection_sort' },
        { label: 'Bubble Sort (Adjacent Swaps)', value: 'bubble_sort' }
      ]},
      { key: 'inputDistribution', label: 'Input State', type: 'select', default: 'nearly_sorted', options: [
        { label: 'Nearly Sorted', value: 'nearly_sorted' },
        { label: 'Random Unsorted', value: 'random' },
        { label: 'Reversed (Worst Case)', value: 'reversed' }
      ]}
    ],
    metrics: [
      { id: 'swaps', label: 'Element Swaps', format: (_s, p) => p.algorithm === 'selection_sort' ? 'O(n) swaps' : 'O(n²) swaps', color: '#10b981' },
      { id: 'stability', label: 'Stability Status', format: (_s, p) => p.algorithm === 'selection_sort' ? 'Unstable' : 'Stable', badge: 'Property' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-combinatorial-puzzles',
    unit: 1,
    unitTitle: 'Algorithm Design Foundations & Problem Solving',
    topic: 'Combinatorial Problem Solving',
    title: 'Combinatorial Problem Solving & Permutation Generation Explorer',
    icon: '🧩',
    flagship: false,
    shortDescription: 'Generate lexicographic permutations and solve classical combinatorial puzzles (Towers of Hanoi, Magic Squares) tracing recursive moves and state invariants.',
    learningObjectives: [
      'Formulate recursive combinatorial state transitions',
      'Verify Towers of Hanoi recurrence T(n) = 2T(n-1) + 1 = 2ⁿ - 1',
      'Generate lexicographic permutations using backtracking search'
    ],
    formulaOverview: 'T(n) = 2T(n-1) + 1 = 2ⁿ - 1 minimum moves for Towers of Hanoi',
    parameters: [
      { key: 'discs', label: 'Number of Discs', type: 'range', min: 2, max: 6, step: 1, default: 4 }
    ],
    metrics: [
      { id: 'minMoves', label: 'Theoretical Minimum Moves', format: (_s, p) => `${Math.pow(2, p.discs) - 1} moves`, color: '#f59e0b' },
      { id: 'timeComplexity', label: 'Asymptotic Order', format: () => 'O(2ⁿ)', badge: 'Exponential' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-data-structures-ops',
    unit: 1,
    unitTitle: 'Algorithm Design Foundations & Problem Solving',
    topic: 'Abstract Data Types & Efficiency',
    title: 'Foundational Abstract Data Types (Stack, Queue, Heap) Operation Cost Benchmarker',
    icon: '🧱',
    flagship: false,
    shortDescription: 'Compare amortized insertion, search, and extraction complexities across Arrays, Linked Lists, Stacks, Circular Queues, and Binary Max-Heaps.',
    learningObjectives: [
      'Benchmark Big-O time and space costs across linear and non-linear ADTs',
      'Trace binary max-heap sift-up and sift-down rebalancing operations',
      'Distinguish worst-case from amortized constant time operations'
    ],
    formulaOverview: 'Heapify: O(n) | Extract-Max: O(log n) | Dequeue: O(1)',
    parameters: [
      { key: 'structure', label: 'Data Structure', type: 'select', default: 'binary_max_heap', options: [
        { label: 'Binary Max-Heap', value: 'binary_max_heap' },
        { label: 'Circular Queue', value: 'circular_queue' },
        { label: 'Linked Stack', value: 'linked_stack' }
      ]}
    ],
    metrics: [
      { id: 'insertCost', label: 'Insert Complexity', format: (_s, p) => p.structure === 'binary_max_heap' ? 'O(log n)' : 'O(1)', color: '#10b981' },
      { id: 'extractCost', label: 'Delete/Extract Cost', format: (_s, p) => p.structure === 'binary_max_heap' ? 'O(log n)' : 'O(1)' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — ASYMPTOTIC ANALYSIS & RECURRENCE RELATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  u25daaSimulation({
    id: 'u25cs403-asymptotic-notations',
    unit: 2,
    unitTitle: 'Asymptotic Analysis & Recurrence Relations',
    topic: 'Asymptotic Growth Rates',
    title: 'Asymptotic Notations (O, Ω, Θ) Rate of Growth Curve Visualizer ⭐',
    icon: '📈',
    flagship: true,
    shortDescription: 'Plot standard complexity curves (1, log n, n, n log n, n², 2ⁿ, n!) side-by-side with adjustable coefficients c and crossover thresholds n₀ to prove formal asymptotic bounds.',
    learningObjectives: [
      'Define formal mathematical criteria for Big-O, Big-Omega, and Big-Theta bounds',
      'Determine witnessing constants (c, n₀) for polynomial and logarithmic functions',
      'Rank algorithm growth classes from O(1) constant to O(n!) factorial'
    ],
    formulaOverview: 'f(n) = O(g(n)) ⟺ ∃ c > 0, n₀ > 0 s.t. 0 ≤ f(n) ≤ c · g(n), ∀ n ≥ n₀',
    parameters: [
      { key: 'boundType', label: 'Bound Class', type: 'select', default: 'big_o', options: [
        { label: 'Big-O: Upper Bound (f(n) ≤ c·g(n))', value: 'big_o' },
        { label: 'Big-Ω: Lower Bound (f(n) ≥ c·g(n))', value: 'big_omega' },
        { label: 'Big-Θ: Tight Bound (c₁g ≤ f ≤ c₂g)', value: 'big_theta' }
      ]},
      { key: 'cCoeff', label: 'Constant Factor c', type: 'range', min: 1, max: 10, step: 1, default: 4 },
      { key: 'nZero', label: 'Threshold n₀', type: 'range', min: 1, max: 20, step: 1, default: 5 }
    ],
    metrics: [
      { id: 'inequalityValid', label: 'Inequality Status', format: () => 'Satisfied for n ≥ n₀', color: '#10b981' },
      { id: 'tightness', label: 'Asymptotic Tightness', format: (_s, p) => p.boundType === 'big_theta' ? 'Exact Tight Bound' : 'Valid Bound' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-loop-invariant-analysis',
    unit: 2,
    unitTitle: 'Asymptotic Analysis & Recurrence Relations',
    topic: 'Non-Recursive Algorithm Analysis',
    title: 'Non-Recursive Algorithm Analysis & Loop Invariant Proof Stepper ⭐',
    icon: '🔄',
    flagship: true,
    shortDescription: 'Analyze iterative algorithms step by step: prove Initialization, Maintenance, and Termination invariants, and compute exact operation counts using summation formulas.',
    learningObjectives: [
      'Formulate inductive loop invariants for sorting and searching loops',
      'Verify the three invariant stages: Initialization, Maintenance, and Termination',
      'Compute exact step operation counts T(n) using arithmetic series summations'
    ],
    formulaOverview: 'Total Ops T(n) = ∑ c_i · t_i | Invariant holds before/after every iteration',
    parameters: [
      { key: 'n', label: 'Loop Iterations n', type: 'range', min: 3, max: 12, step: 1, default: 6 }
    ],
    metrics: [
      { id: 'totalOps', label: 'Total Executed Operations', format: (_s, p) => `${(p.n * (p.n + 1)) / 2} steps`, color: '#f59e0b' },
      { id: 'invariantStatus', label: 'Loop Invariant State', format: () => 'Maintained Across Steps', color: '#10b981' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-master-theorem',
    unit: 2,
    unitTitle: 'Asymptotic Analysis & Recurrence Relations',
    topic: 'Recurrence Trees & Master Theorem',
    title: 'Master Theorem Recurrence Solver & Recursion Tree Depth Explorer ⭐',
    icon: '🌲',
    flagship: true,
    shortDescription: 'Interactive solver for divide-and-conquer recurrences T(n) = a·T(n/b) + f(n). Visualize recursive branching trees, evaluate log_b(a) vs f(n), and identify Case 1, 2, or 3.',
    learningObjectives: [
      'Analyze divide-and-conquer recurrences T(n) = a·T(n/b) + f(n)',
      'Compare root overhead f(n) with critical leaf exponent n^(log_b a)',
      'Classify recurrences into Master Theorem Case 1, Case 2, or Case 3'
    ],
    formulaOverview: 'T(n) = a T(n/b) + f(n) ⟹ Compare f(n) with n^(log_b a)',
    parameters: [
      { key: 'a', label: 'Subproblems a', type: 'range', min: 1, max: 8, step: 1, default: 2 },
      { key: 'b', label: 'Divisor b', type: 'range', min: 2, max: 4, step: 1, default: 2 },
      { key: 'fnType', label: 'Combine Work f(n)', type: 'select', default: 'linear', options: [
        { label: 'Θ(n) [Merge Sort]', value: 'linear' },
        { label: 'Θ(1) [Binary Search]', value: 'constant' },
        { label: 'Θ(n²) [Matrix Mult]', value: 'quadratic' }
      ]}
    ],
    metrics: [
      { id: 'logba', label: 'Critical Exponent log_b(a)', format: (_s, p) => (Math.log(p.a) / Math.log(p.b)).toFixed(2) },
      { id: 'solution', label: 'Closed-Form Solution', format: (_s, p) => p.a === 2 && p.b === 2 && p.fnType === 'linear' ? 'Θ(n log n) [Case 2]' : 'Case Resolved', color: '#10b981' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-empirical-profiling',
    unit: 2,
    unitTitle: 'Asymptotic Analysis & Recurrence Relations',
    topic: 'Empirical vs Theoretical Analysis',
    title: 'Empirical vs Theoretical Complexity Profiler (Input Size Scaling)',
    icon: '⏱️',
    flagship: false,
    shortDescription: 'Simulate scaling input sizes from n=10 to n=100,000, measure simulated operation cycles vs analytical models, and demonstrate why constant factors disappear as n → ∞.',
    learningObjectives: [
      'Conduct doubling-ratio tests to empirically discover asymptotic exponents',
      'Differentiate raw wall-clock timing from abstract operation count profiling',
      'Observe how higher-order terms dominate lower-order terms as n grows large'
    ],
    formulaOverview: 'Doubling Ratio T(2n)/T(n) ≈ 4 for O(n²), ≈ 2 for O(n)',
    parameters: [
      { key: 'maxN', label: 'Maximum Sample Size n', type: 'range', min: 50, max: 500, step: 50, default: 200 }
    ],
    metrics: [
      { id: 'doublingRatio', label: 'Empirical Doubling Ratio', format: () => 'Ratio ≈ 4.00 (Quadratic)', color: '#f59e0b' },
      { id: 'predictedComplexity', label: 'Fitted Asymptotic Curve', format: () => 'Θ(n²)' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — DIVIDE-AND-CONQUER & RANDOMIZED ALGORITHMS
  // ═══════════════════════════════════════════════════════════════════════════
  u25daaSimulation({
    id: 'u25cs403-merge-sort-tree',
    unit: 3,
    unitTitle: 'Divide-and-Conquer & Randomized Algorithms',
    topic: 'Merge Sort & Divide-and-Conquer',
    title: 'Merge Sort Decomposition, Call Tree & Sub-Array Merging Tracer ⭐',
    icon: '🌿',
    flagship: true,
    shortDescription: 'Trace recursive division of arrays into singletons, then follow two-finger pointer merging of sorted halves with auxiliary buffer allocation and stability verification.',
    learningObjectives: [
      'Deconstruct the 3 divide-and-conquer phases: Divide, Conquer, and Combine',
      'Trace two-pointer linear merge routines with auxiliary array buffering',
      'Prove Merge Sort time complexity Θ(n log n) and stability preservation'
    ],
    formulaOverview: 'T(n) = 2T(n/2) + Θ(n) = Θ(n log n) | Stable, requires O(n) space',
    parameters: [
      { key: 'arrayPreset', label: 'Sample Array', type: 'select', default: 'preset_1', options: [
        { label: '[38, 27, 43, 3, 9, 82, 10]', value: 'preset_1' },
        { label: '[12, 11, 13, 5, 6, 7]', value: 'preset_2' }
      ]}
    ],
    metrics: [
      { id: 'treeDepth', label: 'Recursion Depth', format: () => 'log₂(n) = 3 levels', color: '#6366f1' },
      { id: 'auxSpace', label: 'Auxiliary Memory', format: () => 'O(n) space buffer', badge: 'Memory' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-quick-sort-partitions',
    unit: 3,
    unitTitle: 'Divide-and-Conquer & Randomized Algorithms',
    topic: 'Quick Sort & Partitioning',
    title: 'Quick Sort Partitioning Strategies (Lomuto vs Hoare) & Pivot Selection Lab ⭐',
    icon: '⚡',
    flagship: true,
    shortDescription: 'Compare Lomuto (single direction) and Hoare (two-pointer) partitioning, observe worst-case quadratic behavior on sorted arrays with fixed pivots, and apply Median-of-Three.',
    learningObjectives: [
      'Contrast Lomuto single-pointer partitioning with Hoare two-pointer bidirectional scan',
      'Identify worst-case triggers (sorted arrays with fixed pivot yielding O(n²))',
      'Mitigate pathological splits using Randomized Pivot and Median-of-Three techniques'
    ],
    formulaOverview: 'T_avg(n) = O(n log n), T_worst(n) = O(n²) [Unbalanced splits]',
    parameters: [
      { key: 'partitionScheme', label: 'Partitioning Scheme', type: 'select', default: 'lomuto', options: [
        { label: 'Lomuto Scheme', value: 'lomuto' },
        { label: 'Hoare Scheme', value: 'hoare' }
      ]},
      { key: 'pivotChoice', label: 'Pivot Rule', type: 'select', default: 'last_element', options: [
        { label: 'Last Element (A[high])', value: 'last_element' },
        { label: 'Median-of-Three', value: 'median_of_three' }
      ]}
    ],
    metrics: [
      { id: 'comparisons', label: 'Partition Comparisons', format: (_s, p) => p.partitionScheme === 'hoare' ? 'Fewer Swaps' : 'Standard Swaps', color: '#10b981' },
      { id: 'avgComplexity', label: 'Average Runtime', format: () => 'O(n log n)', badge: 'Optimal' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-randomized-selection',
    unit: 3,
    unitTitle: 'Divide-and-Conquer & Randomized Algorithms',
    topic: 'Randomized Selection & Order Statistics',
    title: 'Randomized Quickselect & Order Statistics (k-th Smallest Element) Explorer',
    icon: '🎯',
    flagship: false,
    shortDescription: 'Find the k-th smallest element (median) in expected O(n) linear time by recursively discarding the unneeded partition half after pivot placement.',
    learningObjectives: [
      'Implement Quickselect to find the k-th order statistic without fully sorting the array',
      'Analyze the recurrence T(n) = T(n/2) + O(n) yielding expected linear time O(n)',
      'Compare worst-case O(n²) with Median-of-Medians worst-case linear selection'
    ],
    formulaOverview: 'T(n) = T(n/2) + O(n) = O(n) expected linear time for Quickselect',
    parameters: [
      { key: 'kIndex', label: 'Order Statistic (k-th)', type: 'range', min: 1, max: 7, step: 1, default: 3 }
    ],
    metrics: [
      { id: 'targetVal', label: 'Computed k-th Element', format: (_s, p) => `Element at k=${p.kIndex}`, color: '#f59e0b' },
      { id: 'prunedElements', label: 'Pruned Subarray Size', format: () => 'Discarded ~50% per step' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — GRAPH ALGORITHMS, GREEDY METHODS & DYNAMIC PROGRAMMING
  // ═══════════════════════════════════════════════════════════════════════════
  u25daaSimulation({
    id: 'u25cs403-graph-traversals-topo',
    unit: 4,
    unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
    topic: 'Graph Traversals & Topological Sort',
    title: 'Graph Traversals (BFS, DFS) & Topological Ordering Cycle Detector ⭐',
    icon: '🕸️',
    flagship: true,
    shortDescription: 'Animate BFS (FIFO queue) level-by-level traversal and DFS (LIFO stack) discovery/finish timestamps, classifying Tree, Back, Forward, and Cross edges for cycle detection in DAGs.',
    learningObjectives: [
      'Trace Breadth-First Search (BFS) and Depth-First Search (DFS) state transitions',
      'Classify graph edges into Tree, Back, Forward, and Cross edges',
      'Compute valid topological orderings on Directed Acyclic Graphs (DAGs)'
    ],
    formulaOverview: 'BFS/DFS Complexity: O(V + E) | Back Edge in DFS ⟺ Cycle exists',
    parameters: [
      { key: 'traversal', label: 'Algorithm', type: 'select', default: 'bfs', options: [
        { label: 'Breadth-First Search (Queue)', value: 'bfs' },
        { label: 'Depth-First Search (Stack)', value: 'dfs' },
        { label: 'Topological Sort (Kahn)', value: 'topological' }
      ]}
    ],
    metrics: [
      { id: 'visitedCount', label: 'Visited Vertices', format: () => '5 of 5 nodes', color: '#10b981' },
      { id: 'cycleStatus', label: 'Cycle Detection', format: () => 'Acyclic (DAG Valid)', badge: 'Graph Property' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-mst-kruskal-prim',
    unit: 4,
    unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
    topic: 'Minimum Spanning Trees',
    title: 'Minimum Spanning Tree (Kruskal with DSU vs Prim with Priority Queue) ⭐',
    icon: '🌲',
    flagship: true,
    shortDescription: 'Compare Kruskal’s edge-sorting greedy algorithm using Disjoint-Set Union (Union-Find with path compression) against Prim’s vertex-growing greedy algorithm with cut properties.',
    learningObjectives: [
      'Apply greedy choice and optimal substructure properties to MST construction',
      'Trace Kruskal’s edge addition with Disjoint-Set Union (Union-Find) cycle checks',
      'Trace Prim’s frontier cut expansion using priority queue key updates'
    ],
    formulaOverview: 'Kruskal: O(E log E) | Prim (Heap): O(E log V)',
    parameters: [
      { key: 'algorithm', label: 'MST Strategy', type: 'select', default: 'kruskal', options: [
        { label: 'Kruskal (Sort Edges + DSU)', value: 'kruskal' },
        { label: 'Prim (Grow Cut + Priority Queue)', value: 'prim' }
      ]}
    ],
    metrics: [
      { id: 'mstWeight', label: 'Total Minimum Spanning Tree Weight', format: () => 'Weight = 16', color: '#10b981' },
      { id: 'edgesSelected', label: 'Edges in Tree', format: () => 'V - 1 = 4 edges', badge: 'Spanning Tree' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-dijkstra-floyd-warshall',
    unit: 4,
    unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
    topic: 'Shortest Path Algorithms',
    title: 'Shortest Paths: Dijkstra (Greedy SSSP) vs Floyd-Warshall (DP APSP) Lab ⭐',
    icon: '🗺️',
    flagship: true,
    shortDescription: 'Compare single-source greedy routing (Dijkstra) with all-pairs dynamic programming (Floyd-Warshall triple nested loop d_ij^(k) = min(d_ij, d_ik + d_kj)), observing negative weight handling.',
    learningObjectives: [
      'Execute Dijkstra greedy relaxation on non-negative weighted graphs',
      'Compute all-pairs shortest paths using Floyd-Warshall dynamic programming',
      'Identify negative cycle limitations and edge relaxation invariants'
    ],
    formulaOverview: 'd_ij^(k) = min(d_ij^(k-1), d_ik^(k-1) + d_kj^(k-1)) [Floyd-Warshall Θ(V³)]',
    parameters: [
      { key: 'algorithm', label: 'Routing Algorithm', type: 'select', default: 'floyd_warshall', options: [
        { label: 'Floyd-Warshall (All-Pairs DP)', value: 'floyd_warshall' },
        { label: 'Dijkstra (Single-Source Greedy)', value: 'dijkstra' }
      ]}
    ],
    metrics: [
      { id: 'timeComplexity', label: 'Time Complexity', format: (_s, p) => p.algorithm === 'floyd_warshall' ? 'Θ(V³)' : 'O((V + E) log V)', color: '#f59e0b' },
      { id: 'negativeWeights', label: 'Negative Edges Supported?', format: (_s, p) => p.algorithm === 'floyd_warshall' ? 'YES (No neg cycles)' : 'NO (Non-negative only)' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-knapsack-greedy-dp',
    unit: 4,
    unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
    topic: 'Knapsack: Greedy vs Dynamic Programming',
    title: 'Knapsack Problem: Fractional (Greedy) vs 0/1 Knapsack (DP Table) ⭐',
    icon: '🎒',
    flagship: true,
    shortDescription: 'Contrast Fractional Knapsack (greedy value/weight density ratio sorting) with 0/1 Knapsack (2D DP table construction: V[i, w] = max(V[i-1, w], v_i + V[i-1, w - w_i])).',
    learningObjectives: [
      'Solve Fractional Knapsack using greedy value-to-weight density sorting',
      'Construct and fill the 2D tabular matrix for 0/1 Knapsack',
      'Backtrack through the DP table to reconstruct the optimal item subset'
    ],
    formulaOverview: 'V[i, w] = max(V[i-1, w], val_i + V[i-1, w - wt_i]) [Pseudo-polynomial O(n·W)]',
    parameters: [
      { key: 'method', label: 'Formulation', type: 'select', default: 'dynamic_programming', options: [
        { label: '0/1 Knapsack (Dynamic Programming Table)', value: 'dynamic_programming' },
        { label: 'Fractional Knapsack (Greedy Density)', value: 'greedy' }
      ]},
      { key: 'capacity', label: 'Knapsack Capacity W', type: 'range', min: 5, max: 20, step: 1, default: 10 }
    ],
    metrics: [
      { id: 'optimalVal', label: 'Optimal Value Achieved', format: () => 'Value = 65', color: '#10b981' },
      { id: 'approach', label: 'Algorithm Paradigm', format: (_s, p) => p.method === 'greedy' ? 'Greedy Choice (O(n log n))' : 'Dynamic Programming (O(nW))', badge: 'Strategy' }
    ]
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — P/NP THEORY, BACKTRACKING & BRANCH-AND-BOUND
  // ═══════════════════════════════════════════════════════════════════════════
  u25daaSimulation({
    id: 'u25cs403-nqueens-backtracking',
    unit: 5,
    unitTitle: 'P/NP Theory, Backtracking & Branch-and-Bound',
    topic: 'Backtracking & State-Space Search',
    title: 'N-Queens Backtracking State-Space Search & Constraint Pruning Tree ⭐',
    icon: '👑',
    flagship: true,
    shortDescription: 'Solve the N-Queens puzzle on 4x4 and 8x8 chessboards using depth-first state-space exploration. Watch invalid row, column, and diagonal attacks prune whole subtrees immediately.',
    learningObjectives: [
      'Model combinatorial constraint satisfaction using state-space search trees',
      'Implement bounding and pruning rules to eliminate infeasible branches early',
      'Enumerate all distinct non-attacking configurations for N-Queens'
    ],
    formulaOverview: 'Prune if |row_i - row_j| = |col_i - col_j| (diagonal conflict)',
    parameters: [
      { key: 'n', label: 'Board Size N', type: 'select', default: 4, options: [
        { label: '4-Queens (4x4)', value: 4 },
        { label: '8-Queens (8x8)', value: 8 }
      ]}
    ],
    metrics: [
      { id: 'solutionsCount', label: 'Valid Solutions Found', format: (_s, p) => p.n === 4 ? '2 solutions' : '92 solutions', color: '#10b981' },
      { id: 'prunedSubtrees', label: 'Pruned Infeasible States', format: () => 'Over 85% search space pruned', badge: 'Pruning' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-branch-bound-knapsack',
    unit: 5,
    unitTitle: 'P/NP Theory, Backtracking & Branch-and-Bound',
    topic: 'Branch-and-Bound Method',
    title: 'Branch-and-Bound 0/1 Knapsack & Traveling Salesperson (TSP) Bounding Tree ⭐',
    icon: '🌿',
    flagship: true,
    shortDescription: 'Explore state-space search with upper/lower bounding functions (Fractional Knapsack relaxation / reduced cost matrix). Watch nodes with bounds lower than current best get pruned.',
    learningObjectives: [
      'Formulate bounding functions for combinatorial optimization problems',
      'Execute Least-Cost (LC) Branch-and-Bound using priority queues',
      'Prune subproblems whose upper bounds fall below the best known feasible solution'
    ],
    formulaOverview: 'Prune node u if Bound(u) ≤ Current Best Max Profit',
    parameters: [
      { key: 'problem', label: 'Optimization Target', type: 'select', default: 'knapsack_bb', options: [
        { label: '0/1 Knapsack Branch-and-Bound', value: 'knapsack_bb' },
        { label: 'TSP Reduced Cost Matrix', value: 'tsp_bb' }
      ]}
    ],
    metrics: [
      { id: 'exploredNodes', label: 'Explored Tree Nodes', format: () => '9 states explored', color: '#f59e0b' },
      { id: 'boundRule', label: 'Bounding Strategy', format: () => 'Fractional Relaxation Upper Bound' }
    ]
  }),

  u25daaSimulation({
    id: 'u25cs403-p-np-reductions',
    unit: 5,
    unitTitle: 'P/NP Theory, Backtracking & Branch-and-Bound',
    topic: 'Complexity Classes & Reductions',
    title: 'Complexity Classes (P, NP, NP-Complete, NP-Hard) & Polynomial-Time Reductions ⭐',
    icon: '⚖️',
    flagship: true,
    shortDescription: 'Interactive Venn diagram of P vs NP (assuming P ≠ NP). Trace Cook-Levin 3-SAT reduction to Clique, Vertex Cover, and Hamiltonian Cycle to understand NP-Completeness.',
    learningObjectives: [
      'Differentiate complexity classes: P, NP, NP-Complete, and NP-Hard',
      'Explain the Millennium Prize question: Does P equal NP?',
      'Construct a polynomial-time reduction from 3-SAT to Graph Clique'
    ],
    formulaOverview: 'A ≤_p B ⟹ If B ∈ P then A ∈ P | Cook-Levin: 3-SAT is NP-Complete',
    parameters: [
      { key: 'reductionType', label: 'Reduction Demonstration', type: 'select', default: 'sat_to_clique', options: [
        { label: '3-SAT ≤_p Clique', value: 'sat_to_clique' },
        { label: 'Clique ≤_p Vertex Cover', value: 'clique_to_vc' }
      ]}
    ],
    metrics: [
      { id: 'reductionComplexity', label: 'Reduction Complexity', format: () => 'Polynomial Time O(n²)', color: '#10b981' },
      { id: 'classStatus', label: 'Target Problem Class', format: () => 'NP-Complete', badge: 'Class' }
    ]
  })
];
