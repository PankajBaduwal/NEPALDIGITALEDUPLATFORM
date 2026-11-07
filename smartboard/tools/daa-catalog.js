/**
 * daa-catalog.js
 * Design and Analysis of Algorithms (U25CS403 / U21CS401) — 18 Simulations Catalog
 * Regulation R2025 (Revised) CBCS · Semester IV · PCC · 3 Credits (3-0-0-0-3)
 * Official Curriculum Reference: KPRIET B.Tech IT / AI&DS / CSE / CSBS
 *
 * 5 Syllabus Units:
 * Unit I:   Algorithm Design Foundations & Problem Solving (Sims 1-4)
 * Unit II:  Asymptotic Analysis & Recurrence Relations (Sims 5-8)
 * Unit III: Divide-and-Conquer & Randomized Algorithms (Sims 9-11)
 * Unit IV:  Graph Algorithms, Greedy Methods & Dynamic Programming (Sims 12-15)
 * Unit V:   P/NP Theory, Backtracking & Branch-and-Bound (Sims 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduverseDAACatalog = exp;
  if (typeof window !== 'undefined') window.EduverseDAACatalog = exp;
  if (typeof global !== 'undefined') global.EduverseDAACatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Algorithm Design Foundations & Problem Solving', code: 'UNIT I' },
    { number: 2, title: 'Asymptotic Analysis & Recurrence Relations', code: 'UNIT II' },
    { number: 3, title: 'Divide-and-Conquer & Randomized Algorithms', code: 'UNIT III' },
    { number: 4, title: 'Graph Algorithms, Greedy Methods & Dynamic Programming', code: 'UNIT IV' },
    { number: 5, title: 'P/NP Theory, Backtracking & Branch-and-Bound', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — ALGORITHM DESIGN FOUNDATIONS & PROBLEM SOLVING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs403-linear-binary-search',
      unit: 1,
      unitTitle: 'Algorithm Design Foundations & Problem Solving',
      topic: 'Searching Strategies & Preconditions',
      title: 'Linear vs Binary Search Step Tracer & Precondition Analyzer ⭐ (Flagship)',
      icon: '🔍',
      flagship: true,
      description: 'Step through sequential scan vs divide-and-conquer binary search on sorted/unsorted arrays, tracing comparisons, active search windows [low, mid, high], and boundary edge cases.',
      formula: 'T_{\\text{linear}}(n) = O(n) \\quad | \\quad T_{\\text{binary}}(n) = O(\\log_2 n) \\text{ requires sorted input}',
      defaultParams: { algorithm: 'binary_search', targetVal: 42, arrayType: 'sorted_ascending' },
      challenge: {
        goal: 'Find target value 42 in a sorted 15-element array using binary search in ≤ 4 comparisons.',
        expectedResult: 'Window narrows: [0..14] -> mid=7; [0..6] -> mid=3; [4..6] -> mid=5 (found in 3 steps).'
      }
    },
    {
      id: 'u25cs403-elementary-sorts',
      unit: 1,
      unitTitle: 'Algorithm Design Foundations & Problem Solving',
      topic: 'Elementary Sorting Algorithms',
      title: 'Elementary Sorting Comparison (Bubble, Selection, Insertion Sort) ⭐ (Flagship)',
      icon: '📊',
      flagship: true,
      description: 'Side-by-side execution of Bubble, Selection, and Insertion sorts on identical data, counting element comparisons, swaps, and inversion removals in real time.',
      formula: '\\text{Comparisons: } \\sum_{i=1}^{n-1} i = \\frac{n(n-1)}{2} = \\Theta(n^2)',
      defaultParams: { algorithm: 'insertion_sort', inputDistribution: 'nearly_sorted', size: 10 },
      challenge: {
        goal: 'Observe why Insertion Sort completes in O(n) linear time on nearly-sorted data while Selection Sort remains Θ(n²).',
        expectedResult: 'Insertion Sort executes only 1 comparison per element with 0 swaps.'
      }
    },
    {
      id: 'u25cs403-combinatorial-puzzles',
      unit: 1,
      unitTitle: 'Algorithm Design Foundations & Problem Solving',
      topic: 'Combinatorial Problem Solving',
      title: 'Combinatorial Problem Solving & Permutation Generation Explorer',
      icon: '🧩',
      flagship: false,
      description: 'Generate lexicographic permutations and solve classical combinatorial puzzles (Towers of Hanoi, Magic Squares) tracing recursive moves and state invariants.',
      formula: 'T(n) = 2T(n-1) + 1 = 2^n - 1 \\text{ minimum moves for Towers of Hanoi}',
      defaultParams: { puzzleType: 'hanoi', discs: 4 },
      challenge: {
        goal: 'Solve 4-disc Towers of Hanoi in exactly 2⁴ - 1 = 15 moves.',
        expectedResult: 'Discs moved between pegs A, B, C preserving size ordering at every step.'
      }
    },
    {
      id: 'u25cs403-data-structures-ops',
      unit: 1,
      unitTitle: 'Algorithm Design Foundations & Problem Solving',
      topic: 'Abstract Data Types & Efficiency',
      title: 'Foundational Abstract Data Types (Stack, Queue, Heap) Operation Cost Benchmarker',
      icon: '🧱',
      flagship: false,
      description: 'Compare amortized insertion, search, and extraction complexities across Arrays, Linked Lists, Stacks, Circular Queues, and Binary Max-Heaps.',
      formula: '\\text{Heapify: } O(n) \\quad | \\quad \\text{Extract-Max: } O(\\log n) \\quad | \\quad \\text{Queue Dequeue: } O(1)',
      defaultParams: { structure: 'binary_max_heap', operation: 'insert_sequence' },
      challenge: {
        goal: 'Build a Max-Heap of 7 items and perform 3 extract-max operations, maintaining the heap property.',
        expectedResult: 'Root element extracted in O(log n) time; sift-down restores tree balance.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — ASYMPTOTIC ANALYSIS & RECURRENCE RELATIONS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs403-asymptotic-notations',
      unit: 2,
      unitTitle: 'Asymptotic Analysis & Recurrence Relations',
      topic: 'Asymptotic Growth Rates',
      title: 'Asymptotic Notations (O, Ω, Θ) Rate of Growth Curve Visualizer ⭐ (Flagship)',
      icon: '📈',
      flagship: true,
      description: 'Plot standard complexity curves (1, log n, n, n log n, n², 2ⁿ, n!) side-by-side with adjustable coefficients c and crossover thresholds n₀ to prove formal asymptotic bounds.',
      formula: 'f(n) = O(g(n)) \\iff \\exists c > 0, n_0 > 0 \\text{ s.t. } 0 \\le f(n) \\le c \\cdot g(n), \\forall n \\ge n_0',
      defaultParams: { targetFunc: '3n_squared_plus_5n', boundType: 'big_o', compFunc: 'n_squared' },
      challenge: {
        goal: 'Find constants c and n₀ such that 3n² + 5n ≤ c · n² for all n ≥ n₀.',
        expectedResult: 'Choose c = 4, n₀ = 5. For n ≥ 5, 3n² + 5n ≤ 4n².'
      }
    },
    {
      id: 'u25cs403-loop-invariant-analysis',
      unit: 2,
      unitTitle: 'Asymptotic Analysis & Recurrence Relations',
      topic: 'Non-Recursive Algorithm Analysis',
      title: 'Non-Recursive Algorithm Analysis & Loop Invariant Proof Stepper ⭐ (Flagship)',
      icon: '🔄',
      flagship: true,
      description: 'Analyze iterative algorithms step by step: prove Initialization, Maintenance, and Termination invariants, and compute exact operation counts using summation formulas.',
      formula: '\\text{Total Ops } T(n) = \\sum_{i=1}^{n} c_i \\cdot t_i \\quad | \\quad \\text{Loop Invariant holds before/after every iteration}',
      defaultParams: { algorithm: 'selection_sort_invariant', n: 6 },
      challenge: {
        goal: 'Verify the loop invariant for Selection Sort: at iteration k, subarray A[0..k-1] contains the k smallest elements in sorted order.',
        expectedResult: 'Invariant verified: Initialization holds for k=0; Maintenance holds through swap; Termination produces sorted A[0..n-1].'
      }
    },
    {
      id: 'u25cs403-master-theorem',
      unit: 2,
      unitTitle: 'Asymptotic Analysis & Recurrence Relations',
      topic: 'Recurrence Trees & Master Theorem',
      title: 'Master Theorem Recurrence Solver & Recursion Tree Depth Explorer ⭐ (Flagship)',
      icon: '🌲',
      flagship: true,
      description: 'Interactive solver for divide-and-conquer recurrences T(n) = a·T(n/b) + f(n). Visualize recursive branching trees, evaluate log_b(a) vs f(n), and identify Case 1, 2, or 3.',
      formula: 'T(n) = a T(n/b) + f(n) \\implies \\text{Compare } f(n) \\text{ with } n^{\\log_b a}',
      defaultParams: { a: 2, b: 2, fnType: 'linear' },
      challenge: {
        goal: 'Solve T(n) = 2T(n/2) + n (Merge Sort recurrence) using the Master Theorem.',
        expectedResult: 'log_b(a) = log₂(2) = 1; f(n) = Θ(n¹) => Case 2 holds => T(n) = Θ(n log n).'
      }
    },
    {
      id: 'u25cs403-empirical-profiling',
      unit: 2,
      unitTitle: 'Asymptotic Analysis & Recurrence Relations',
      topic: 'Empirical vs Theoretical Analysis',
      title: 'Empirical vs Theoretical Complexity Profiler (Input Size Scaling)',
      icon: '⏱️',
      flagship: false,
      description: 'Simulate scaling input sizes from n=10 to n=100,000, measure simulated operation cycles vs analytical models, and demonstrate why constant factors disappear as n → ∞.',
      formula: '\\text{Time Ratio } \\frac{T(2n)}{T(n)} \\approx 4 \\text{ for } O(n^2), \\quad \\approx 2 \\text{ for } O(n)',
      defaultParams: { testAlg: 'matrix_multiplication', maxN: 200 },
      challenge: {
        goal: 'Demonstrate doubling ratio test: when n doubles from 50 to 100, quadratic operations quadruple (4x).',
        expectedResult: 'Ops(50) = 2,500; Ops(100) = 10,000; Ratio = 4.0 (confirms O(n²)).'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — DIVIDE-AND-CONQUER & RANDOMIZED ALGORITHMS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs403-merge-sort-tree',
      unit: 3,
      unitTitle: 'Divide-and-Conquer & Randomized Algorithms',
      topic: 'Merge Sort & Divide-and-Conquer',
      title: 'Merge Sort Decomposition, Call Tree & Sub-Array Merging Tracer ⭐ (Flagship)',
      icon: '🌿',
      flagship: true,
      description: 'Trace recursive division of arrays into singletons, then follow two-finger pointer merging of sorted halves with auxiliary buffer allocation and stability verification.',
      formula: 'T(n) = 2T(n/2) + \\Theta(n) = \\Theta(n \\log n) \\quad \\text{Stable, requires } O(n) \\text{ auxiliary space}',
      defaultParams: { array: '38,27,43,3,9,82,10', stepMode: 'recursive_split' },
      challenge: {
        goal: 'Trace the two-way merge of sorted subarrays [27, 38, 43] and [3, 9, 10, 82].',
        expectedResult: 'Sorted merge produces [3, 9, 10, 27, 38, 43, 82] using 7 comparisons.'
      }
    },
    {
      id: 'u25cs403-quick-sort-partitions',
      unit: 3,
      unitTitle: 'Divide-and-Conquer & Randomized Algorithms',
      topic: 'Quick Sort & Partitioning',
      title: 'Quick Sort Partitioning Strategies (Lomuto vs Hoare) & Pivot Selection Lab ⭐ (Flagship)',
      icon: '⚡',
      flagship: true,
      description: 'Compare Lomuto (single direction) and Hoare (two-pointer) partitioning, observe worst-case quadratic behavior on sorted arrays with fixed pivots, and apply Median-of-Three.',
      formula: 'T_{\\text{avg}}(n) = O(n \\log n), \\quad T_{\\text{worst}}(n) = O(n^2) \\text{ (unbalanced splits)}',
      defaultParams: { partitionScheme: 'lomuto', pivotChoice: 'last_element', inputData: 'unsorted' },
      challenge: {
        goal: 'Demonstrate worst-case behavior of Last-Element Pivot Quick Sort on an already sorted array [1, 2, 3, 4, 5, 6].',
        expectedResult: 'Creates n recursion levels with partitions of size (n-1, 0), taking n(n-1)/2 comparisons.'
      }
    },
    {
      id: 'u25cs403-randomized-selection',
      unit: 3,
      unitTitle: 'Divide-and-Conquer & Randomized Algorithms',
      topic: 'Randomized Selection & Order Statistics',
      title: 'Randomized Quickselect & Order Statistics (k-th Smallest Element) Explorer',
      icon: '🎯',
      flagship: false,
      description: 'Find the k-th smallest element (median) in expected O(n) linear time by recursively discarding the unneeded partition half after pivot placement.',
      formula: 'T(n) = T(n/2) + O(n) = O(n) \\text{ expected linear time for Quickselect}',
      defaultParams: { kIndex: 3, array: '65,28,93,12,47,81,34' },
      challenge: {
        goal: 'Locate the 3rd smallest element (k=3) without fully sorting the array.',
        expectedResult: 'Pivot partitions array; target lies in left partition; identified value = 34 in expected O(n).'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — GRAPH ALGORITHMS, GREEDY METHODS & DYNAMIC PROGRAMMING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs403-graph-traversals-topo',
      unit: 4,
      unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
      topic: 'Graph Traversals & Topological Sort',
      title: 'Graph Traversals (BFS, DFS) & Topological Ordering Cycle Detector ⭐ (Flagship)',
      icon: '🕸️',
      flagship: true,
      description: 'Animate BFS (FIFO queue) level-by-level traversal and DFS (LIFO stack) discovery/finish timestamps, classifying Tree, Back, Forward, and Cross edges for cycle detection in DAGs.',
      formula: '\\text{BFS/DFS Complexity: } O(V + E) \\quad | \\quad \\text{Back Edge in DFS } \\iff \\text{Cycle exists}',
      defaultParams: { traversal: 'bfs', startNode: 'A', graphPreset: 'dag_tasks' },
      challenge: {
        goal: 'Generate a valid topological sort order for a task dependency DAG using Kahn’s in-degree algorithm.',
        expectedResult: 'Queue processed 0 in-degree nodes: A -> B -> C -> D -> E (Valid linear schedule).'
      }
    },
    {
      id: 'u25cs403-mst-kruskal-prim',
      unit: 4,
      unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
      topic: 'Minimum Spanning Trees',
      title: 'Minimum Spanning Tree (Kruskal with DSU vs Prim with Priority Queue) ⭐ (Flagship)',
      icon: '🌲',
      flagship: true,
      description: 'Compare Kruskal’s edge-sorting greedy algorithm using Disjoint-Set Union (Union-Find with path compression) against Prim’s vertex-growing greedy algorithm with cut properties.',
      formula: '\\text{Kruskal: } O(E \\log E) \\quad | \\quad \\text{Prim (Binary Heap): } O(E \\log V)',
      defaultParams: { algorithm: 'kruskal', graph: 'standard_mesh' },
      challenge: {
        goal: 'Construct the Minimum Spanning Tree for a 6-node weighted graph and compute total minimum weight.',
        expectedResult: 'Selected 5 edges (V-1) avoiding cycles; total MST weight = 16.'
      }
    },
    {
      id: 'u25cs403-dijkstra-floyd-warshall',
      unit: 4,
      unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
      topic: 'Shortest Path Algorithms',
      title: 'Shortest Paths: Dijkstra (Greedy SSSP) vs Floyd-Warshall (DP APSP) Lab ⭐ (Flagship)',
      icon: '🗺️',
      flagship: true,
      description: 'Compare single-source greedy routing (Dijkstra) with all-pairs dynamic programming (Floyd-Warshall triple nested loop d_ij^(k) = min(d_ij, d_ik + d_kj)), observing negative weight handling.',
      formula: 'd_{ij}^{(k)} = \\min\\left(d_{ij}^{(k-1)}, d_{ik}^{(k-1)} + d_{kj}^{(k-1)}\\right) \\quad [\\Theta(V^3)]',
      defaultParams: { algorithm: 'floyd_warshall', nodeCount: 4 },
      challenge: {
        goal: 'Compute the all-pairs shortest path matrix across k=1,2,3,4 intermediate vertex stages.',
        expectedResult: 'Distance matrix updated at each intermediate vertex k; final matrix contains all shortest distances.'
      }
    },
    {
      id: 'u25cs403-knapsack-greedy-dp',
      unit: 4,
      unitTitle: 'Graph Algorithms, Greedy Methods & Dynamic Programming',
      topic: 'Knapsack: Greedy vs Dynamic Programming',
      title: 'Knapsack Problem: Fractional (Greedy) vs 0/1 Knapsack (DP Table) ⭐ (Flagship)',
      icon: '🎒',
      flagship: true,
      description: 'Contrast Fractional Knapsack (greedy value/weight density ratio sorting) with 0/1 Knapsack (2D DP table construction: V[i, w] = max(V[i-1, w], v_i + V[i-1, w - w_i])).',
      formula: 'V[i, w] = \\max(V[i-1, w], \\text{val}_i + V[i-1, w - \\text{wt}_i]) \\quad [O(n \\cdot W)]',
      defaultParams: { capacity: 10, items: 'w:2,v:10|w:3,v:15|w:5,v:40|w:7,v:50', method: 'dynamic_programming' },
      challenge: {
        goal: 'Fill the 0/1 Knapsack DP table for Capacity W=10 and identify which items are included in the optimal set.',
        expectedResult: 'Optimal value = 65 (Items 2 and 4 with weights 3 + 5 = 8 ≤ 10).'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — P/NP THEORY, BACKTRACKING & BRANCH-AND-BOUND
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs403-nqueens-backtracking',
      unit: 5,
      unitTitle: 'P/NP Theory, Backtracking & Branch-and-Bound',
      topic: 'Backtracking & State-Space Search',
      title: 'N-Queens Backtracking State-Space Search & Constraint Pruning Tree ⭐ (Flagship)',
      icon: '👑',
      flagship: true,
      description: 'Solve the N-Queens puzzle on 4x4 and 8x8 chessboards using depth-first state-space exploration. Watch invalid row, column, and diagonal attacks prune whole subtrees immediately.',
      formula: '\\text{Prune if } |\\text{row}_i - \\text{row}_j| = |\\text{col}_i - \\text{col}_j| \\text{ (same diagonal)}',
      defaultParams: { n: 4, showAttackLines: true },
      challenge: {
        goal: 'Find all non-attacking configurations for 4-Queens, observing how many dead-end branches are pruned.',
        expectedResult: 'Pruning explores only 17 states out of 256; 2 distinct non-attacking solutions found ([1,3,0,2] and [2,0,3,1]).'
      }
    },
    {
      id: 'u25cs403-branch-bound-knapsack',
      unit: 5,
      unitTitle: 'P/NP Theory, Backtracking & Branch-and-Bound',
      topic: 'Branch-and-Bound Method',
      title: 'Branch-and-Bound 0/1 Knapsack & Traveling Salesperson (TSP) Bounding Tree ⭐ (Flagship)',
      icon: '🌿',
      flagship: true,
      description: 'Explore state-space search with upper/lower bounding functions (Fractional Knapsack relaxation / reduced cost matrix). Watch nodes with bounds lower than current best get pruned.',
      formula: '\\text{Prune node } u \\text{ if } \\text{Bound}(u) \\le \\text{Current Best Max Profit}',
      defaultParams: { problem: 'knapsack_bb', capacity: 15 },
      challenge: {
        goal: 'Trace Least-Cost (LC) Branch-and-Bound for 0/1 Knapsack with 4 items.',
        expectedResult: 'Priority queue expands highest-bound node; suboptimal branches pruned when bound ≤ best known value.'
      }
    },
    {
      id: 'u25cs403-p-np-reductions',
      unit: 5,
      unitTitle: 'P/NP Theory, Backtracking & Branch-and-Bound',
      topic: 'Complexity Classes & Reductions',
      title: 'Complexity Classes (P, NP, NP-Complete, NP-Hard) & Polynomial-Time Reductions ⭐ (Flagship)',
      icon: '⚖️',
      flagship: true,
      description: 'Interactive Venn diagram of P vs NP (assuming P ≠ NP). Trace Cook-Levin 3-SAT reduction to Clique, Vertex Cover, and Hamiltonian Cycle to understand NP-Completeness.',
      formula: 'A \\le_p B \\implies \\text{If } B \\in P \\text{ then } A \\in P \\quad | \\quad \\text{Cook-Levin Theorem: 3-SAT is NP-Complete}',
      defaultParams: { reductionType: 'sat_to_clique', viewMode: 'complexity_venn' },
      challenge: {
        goal: 'Map a 3-SAT formula (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ x₃) to a graph Clique problem in polynomial time.',
        expectedResult: 'Tripartite graph constructed with 6 vertices; k=2 clique corresponds to satisfying assignment.'
      }
    }
  ];

  return {
    courseCode: 'U25CS403',
    legacyCode: 'U21CS401',
    courseTitle: 'Design and Analysis of Algorithms',
    semester: 4,
    category: 'PCC',
    credits: 3,
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
