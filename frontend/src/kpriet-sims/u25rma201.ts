import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25RMA201
 * Course Name: Linear Algebra and Number Theory
 * Semester: II | Category: BSC | Credits: 4 | L-T-P-J-C: 3-0-2-0-4
 * Common to: AD, AM, CB, CS, IT, SC
 * 
 * Uses existing Mathematics engine architecture (boardEngine: 'ma')
 * Dynamic routing via smartboardPresetKey to ma-simulation.html and u25rma201-engine.js.
 */
export const U25RMA201_SUBJECT_KEYWORDS = [
  'linear algebra and number theory',
  'linear algebra',
  'number theory',
  'u25rma201',
  'u25ma201',
  'rma201',
  'ma201',
];

function u25rmaSimulation(def: {
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
    boardEngine: 'ma',
    domain: 'MATHEMATICS',
    category: 'engineering mathematics',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25RMA201_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with real-time dynamic calculation, analytical step derivations, and Subject AI context integration.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    tags: ['U25RMA201', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Mathematics'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ time: 0, active: true }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#0b1320';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25RMA201_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — SYSTEMS OF LINEAR EQUATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  u25rmaSimulation({
    id: 'u25rma201-linear-systems',
    unit: 1,
    unitTitle: 'Systems of Linear Equations',
    topic: 'Systems of Linear Equations',
    title: 'Linear Systems Laboratory (Ax = b)',
    icon: '📐',
    flagship: true,
    shortDescription: 'Interactive system of linear equations solver with algorithm selection: Gaussian Elimination, Gauss-Jordan, and LU Decomposition.',
    learningObjectives: [
      'Represent linear systems as augmented matrices [A | b]',
      'Compare Gaussian elimination, Gauss-Jordan, and LU decomposition workflows',
      'Classify system solvability into unique, infinitely many, or inconsistent solutions',
    ],
    formulaOverview: 'A x = b \\iff [A \\mid b] \\xrightarrow{RREF} [I \\mid x]',
    parameters: [
      { key: 'method', label: 'Solution Method', type: 'select', default: 'gauss-jordan', options: [
        { label: 'Gauss-Jordan Elimination', value: 'gauss-jordan' },
        { label: 'Gaussian Elimination', value: 'gaussian' },
        { label: 'LU Decomposition', value: 'lu' },
      ]},
      { key: 'size', label: 'System Size', type: 'select', default: '3', options: [
        { label: '2 × 2 System', value: '2' },
        { label: '3 × 3 System', value: '3' },
      ]},
      { key: 'A', label: 'Matrix A', type: 'range', default: 0, min: -10, max: 10, step: 1, description: 'Matrix coefficients' },
    ],
    metrics: [
      { id: 'status', label: 'System Status', format: () => 'Unique Solution' },
      { id: 'rankA', label: 'Rank(A)', format: () => '3' },
      { id: 'rankAug', label: 'Rank([A|b])', format: () => '3' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-gaussian-elimination',
    unit: 1,
    unitTitle: 'Systems of Linear Equations',
    topic: 'Gaussian Elimination',
    title: 'Gaussian Elimination Simulator',
    icon: '⚡',
    shortDescription: 'Step-by-step elementary row operations Ri ↔ Rj, Ri → kRi, Ri → Ri + kRj to upper triangular echelon form with backward substitution.',
    learningObjectives: [
      'Perform elementary row operations to reduce [A|b] to Row Echelon Form (REF)',
      'Handle zero pivots through partial row pivoting',
      'Execute backward substitution to obtain exact values of unknowns',
    ],
    formulaOverview: 'R_i \\leftarrow R_i - \\left(\\frac{a_{ij}}{a_{jj}}\\right) R_j, \\quad x_i = \\frac{b_i - \\sum_{k > i} a_{ik} x_k}{a_{ii}}',
    parameters: [
      { key: 'systemPreset', label: 'System Preset', type: 'select', default: 'standard3', options: [
        { label: 'Standard 3×3 (Unique)', value: 'standard3' },
        { label: 'Pivoting Needed 3×3', value: 'pivot3' },
        { label: 'Standard 2×2', value: 'standard2' },
        { label: 'Infinitely Many Solutions', value: 'infinite' },
        { label: 'Inconsistent System', value: 'inconsistent' },
      ]},
      { key: 'stepMode', label: 'Execution', type: 'select', default: 'step', options: [
        { label: 'Step-by-Step Interactive', value: 'step' },
        { label: 'Auto Solve Complete', value: 'auto' },
      ]},
    ],
    metrics: [
      { id: 'echelon', label: 'Echelon State', format: () => 'Upper Triangular' },
      { id: 'pivots', label: 'Pivots Count', format: () => '3' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-gauss-jordan',
    unit: 1,
    unitTitle: 'Systems of Linear Equations',
    topic: 'Gauss–Jordan Elimination',
    title: 'Gauss–Jordan Elimination Simulator',
    icon: '🎯',
    flagship: true,
    shortDescription: 'Complete reduction of augmented matrix [A|b] directly to Reduced Row Echelon Form (RREF) [I | x] with solution classification.',
    learningObjectives: [
      'Normalize leading pivots to 1 and eliminate entries both below and above pivots',
      'Achieve Reduced Row Echelon Form [I | x] directly yielding values of unknowns',
      'Distinguish unique, infinitely many (free variables), and inconsistent systems',
    ],
    formulaOverview: '[A \\mid b] \\xrightarrow{Row\\ Ops} [I \\mid X]',
    parameters: [
      { key: 'preset', label: 'Example System', type: 'select', default: 'systemA', options: [
        { label: '3x + 2y - z = 1, 2x - 2y + 4z = -2, -x + y/2 - z = 0', value: 'systemA' },
        { label: '2x + y = 5, x - y = 1', value: 'systemB' },
        { label: 'Singular Matrix (Dependent Rows)', value: 'singular' },
      ]},
    ],
    metrics: [
      { id: 'rref', label: 'RREF Form', format: () => 'Identity Matrix [I]' },
      { id: 'solutionType', label: 'Classification', format: () => 'Unique Solution' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-lu-decomposition',
    unit: 1,
    unitTitle: 'Systems of Linear Equations',
    topic: 'LU Decomposition Method',
    title: 'LU Decomposition Laboratory (A = LU)',
    icon: '🧩',
    flagship: true,
    shortDescription: 'Factorize matrix A into Lower (L) and Upper (U) triangular matrices; solve Ly = b via forward substitution and Ux = y via back substitution with LU verification.',
    learningObjectives: [
      'Factorize coefficient matrix A into A = LU via Doolittle/Crout algorithm',
      'Solve triangular system Ly = b using forward substitution',
      'Solve triangular system Ux = y using backward substitution',
      'Verify that product L × U reconstructs original matrix A',
    ],
    formulaOverview: 'A = L U, \\quad L y = b, \\quad U x = y',
    parameters: [
      { key: 'matrixPreset', label: 'Matrix A', type: 'select', default: 'lu3a', options: [
        { label: '3×3 Matrix: [2 -1 -2; -4 6 3; -4 -2 8]', value: 'lu3a' },
        { label: '3×3 Matrix: [1 1 1; 2 3 1; 1 -1 -1]', value: 'lu3b' },
        { label: '2×2 Matrix: [4 3; 6 3]', value: 'lu2a' },
      ]},
      { key: 'verify', label: 'Verify LU = A', type: 'boolean', default: true },
    ],
    metrics: [
      { id: 'luStatus', label: 'Decomposition', format: () => 'A = L · U' },
      { id: 'reconstruction', label: 'LU Verification', format: () => 'Exact Match (Diff = 0)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-rank-consistency',
    unit: 1,
    unitTitle: 'Systems of Linear Equations',
    topic: 'Consistency of Linear Systems and Rank',
    title: 'Rank & Consistency Visualizer (Rouché–Capelli)',
    icon: '📊',
    shortDescription: 'Analyze system consistency and number of solutions by comparing Rank(A) with Rank([A|b]) and number of variables n.',
    learningObjectives: [
      'Calculate Rank(A) and Rank([A|b]) using row echelon reduction',
      'Apply Rouché–Capelli theorem: Rank(A) = Rank([A|b]) = n (unique)',
      'Identify infinite solutions when Rank(A) = Rank([A|b]) < n and inconsistency when Rank(A) < Rank([A|b])',
    ],
    formulaOverview: '\\text{Rank}(A) = \\text{Rank}([A \\mid b]) = n \\implies \\text{Unique}, \\quad \\text{Rank}(A) < \\text{Rank}([A \\mid b]) \\implies \\text{Inconsistent}',
    parameters: [
      { key: 'caseType', label: 'Consistency Case', type: 'select', default: 'unique', options: [
        { label: 'Rank(A) = Rank([A|B]) = n (Unique Solution)', value: 'unique' },
        { label: 'Rank(A) = Rank([A|B]) < n (Infinitely Many Solutions)', value: 'infinite' },
        { label: 'Rank(A) < Rank([A|B]) (Inconsistent / No Solution)', value: 'inconsistent' },
      ]},
    ],
    metrics: [
      { id: 'rankA', label: 'Rank(A)', format: (_s, p) => p.caseType === 'infinite' ? '2' : p.caseType === 'inconsistent' ? '2' : '3' },
      { id: 'rankAB', label: 'Rank([A|b])', format: (_s, p) => p.caseType === 'inconsistent' ? '3' : p.caseType === 'infinite' ? '2' : '3' },
      { id: 'consistency', label: 'Consistency', format: (_s, p) => p.caseType === 'inconsistent' ? 'Inconsistent' : 'Consistent' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — VECTOR SPACES
  // ═══════════════════════════════════════════════════════════════════════════
  u25rmaSimulation({
    id: 'u25rma201-vector-spaces',
    unit: 2,
    unitTitle: 'Vector Spaces',
    topic: 'Definition and Examples of Vector Spaces',
    title: 'Vector Space & Subspace Laboratory',
    icon: '🧭',
    flagship: true,
    shortDescription: 'Interactive vector space visualizer in ℝ² and ℝ³ demonstrating 8 vector space axioms, closure under addition and scalar multiplication, and subspace verification.',
    learningObjectives: [
      'Verify closure under vector addition (u + v ∈ V) and scalar multiplication (c·v ∈ V)',
      'Identify zero vector and additive inverse in vector spaces',
      'Test whether geometric subsets (lines, planes through origin) form valid subspaces',
    ],
    formulaOverview: 'u + v \\in V, \\quad c \\cdot u \\in V, \\quad \\vec{0} \\in V',
    parameters: [
      { key: 'v1x', label: 'Vector v₁ X', type: 'range', min: -5, max: 5, step: 0.5, default: 2 },
      { key: 'v1y', label: 'Vector v₁ Y', type: 'range', min: -5, max: 5, step: 0.5, default: 1 },
      { key: 'v2x', label: 'Vector v₂ X', type: 'range', min: -5, max: 5, step: 0.5, default: 1 },
      { key: 'v2y', label: 'Vector v₂ Y', type: 'range', min: -5, max: 5, step: 0.5, default: 3 },
      { key: 'c1', label: 'Scalar c₁', type: 'range', min: -3, max: 3, step: 0.5, default: 1.5 },
      { key: 'c2', label: 'Scalar c₂', type: 'range', min: -3, max: 3, step: 0.5, default: -0.5 },
    ],
    metrics: [
      { id: 'span', label: 'Linear Combination', format: () => 'c₁v₁ + c₂v₂ ∈ ℝ²' },
      { id: 'subspaceTest', label: 'Closure Test', format: () => 'Passed (Zero in set)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-linear-independence',
    unit: 2,
    unitTitle: 'Vector Spaces',
    topic: 'Linear Independence, Basis and Dimension',
    title: 'Linear Independence, Basis & Dimension Simulator',
    icon: '⚖️',
    flagship: true,
    shortDescription: 'Determine linear independence of vector sets via c₁v₁ + c₂v₂ + ... = 0 and matrix rank; extract basis and compute vector space dimension.',
    learningObjectives: [
      'Test linear independence: c₁v₁ + c₂v₂ + ... + cₖvₖ = 0 has only trivial solution cᵢ = 0',
      'Extract basis by eliminating linearly dependent vectors',
      'Determine vector space dimension from basis cardinality and connect to matrix rank',
    ],
    formulaOverview: 'c_1 v_1 + c_2 v_2 + \\dots + c_k v_k = \\vec{0} \\implies c_1 = c_2 = \\dots = c_k = 0',
    parameters: [
      { key: 'vectorSet', label: 'Vector Set', type: 'select', default: 'indep2', options: [
        { label: 'v₁=(2,1), v₂=(1,3) [Linearly Independent Basis]', value: 'indep2' },
        { label: 'v₁=(2,1), v₂=(4,2) [Linearly Dependent - Parallel]', value: 'dep2' },
        { label: 'v₁=(1,0,1), v₂=(0,1,1), v₃=(1,1,2) [Dependent in ℝ³]', value: 'dep3' },
        { label: 'v₁=(1,0,0), v₂=(0,1,0), v₃=(0,0,1) [Standard Basis ℝ³]', value: 'std3' },
      ]},
    ],
    metrics: [
      { id: 'independence', label: 'Independence', format: (_s, p) => p.vectorSet.startsWith('indep') || p.vectorSet.startsWith('std') ? 'Linearly Independent' : 'Linearly Dependent' },
      { id: 'dimension', label: 'Dimension (dim V)', format: (_s, p) => p.vectorSet === 'std3' ? '3' : p.vectorSet.startsWith('dep3') ? '2' : p.vectorSet.startsWith('dep2') ? '1' : '2' },
      { id: 'basis', label: 'Is Basis', format: (_s, p) => p.vectorSet.startsWith('indep') || p.vectorSet.startsWith('std') ? 'Yes (Spans subspace)' : 'No (Redundant vector)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-linear-transformation',
    unit: 2,
    unitTitle: 'Vector Spaces',
    topic: 'Linear Transformations and Matrix Representation',
    title: 'Linear Transformation Grid Simulator (T(x) = Ax)',
    icon: '🔄',
    flagship: true,
    shortDescription: 'Interactive 2D transformation plane and grid visualization showing mapping of basis vectors e₁ and e₂, area distortion |det(A)|, and matrix representation.',
    learningObjectives: [
      'Visualize how matrix A transforms 2D plane: T(x) = Ax',
      'Trace basis vectors e₁ = (1,0) → T(e₁) and e₂ = (0,1) → T(e₂)',
      'Relate determinant det(A) to area scaling factor and orientation change',
      'Construct matrix representation of linear transformations relative to bases',
    ],
    formulaOverview: 'T(\\vec{x}) = A \\vec{x} = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix}',
    parameters: [
      { key: 'transformType', label: 'Preset Transformation', type: 'select', default: 'shear', options: [
        { label: 'Shear [1 1.5; 0 1]', value: 'shear' },
        { label: 'Rotation 45° [cos -sin; sin cos]', value: 'rot45' },
        { label: 'Scaling [2 0; 0 0.5]', value: 'scale' },
        { label: 'Reflection across y = x [0 1; 1 0]', value: 'reflect' },
        { label: 'Projection onto X-axis [1 0; 0 0]', value: 'project' },
      ]},
      { key: 'gridDensity', label: 'Grid Lines', type: 'range', min: 4, max: 12, step: 2, default: 8 },
    ],
    metrics: [
      { id: 'det', label: 'det(A) (Area Scale)', format: (_s, p) => p.transformType === 'project' ? '0.00' : p.transformType === 'rot45' ? '1.00' : p.transformType === 'shear' ? '1.00' : p.transformType === 'scale' ? '1.00' : '-1.00' },
      { id: 'orientation', label: 'Orientation', format: (_s, p) => p.transformType === 'reflect' ? 'Reversed (det < 0)' : p.transformType === 'project' ? 'Degenerate (Collinear)' : 'Preserved (det > 0)' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — EIGENVALUES AND EIGENVECTORS
  // ═══════════════════════════════════════════════════════════════════════════
  u25rmaSimulation({
    id: 'u25rma201-eigenvalues',
    unit: 3,
    unitTitle: 'Eigenvalues and Eigenvectors',
    topic: 'Eigenvalues and Eigenvectors',
    title: 'Eigenvalue & Eigenvector Visualizer (Av = λv)',
    icon: '⭐',
    flagship: true,
    shortDescription: 'Solve det(A - λI) = 0 for eigenvalues and (A - λI)v = 0 for eigenvectors with live geometric vector alignment on eigen-directions.',
    learningObjectives: [
      'Formulate and solve characteristic equation det(A - λI) = 0',
      'Compute null space basis of (A - λI) to find exact eigenvectors',
      'Demonstrate geometrically that Av = λv maintains direction along eigen-axes',
    ],
    formulaOverview: 'A v = \\lambda v \\iff \\det(A - \\lambda I) = 0',
    parameters: [
      { key: 'A', label: 'Matrix A', type: 'select', default: 'diag_ready', options: [
        { label: '[4 1; 2 3] (λ = 5, 2)', value: 'diag_ready' },
        { label: '[3 1; 1 3] (Symmetric: λ = 4, 2)', value: 'symm' },
        { label: '[2 0; 0 3] (Diagonal: λ = 2, 3)', value: 'diag' },
        { label: '[1 -2; 1 4] (λ = 3, 2)', value: 'matB' },
      ]},
      { key: 'probeAngle', label: 'Probe Vector Angle (θ)', type: 'range', min: 0, max: 360, step: 5, default: 45, unit: 'deg' },
    ],
    metrics: [
      { id: 'lambda1', label: 'λ₁', format: () => '5.0' },
      { id: 'lambda2', label: 'λ₂', format: () => '2.0' },
      { id: 'parallelStatus', label: 'v & Av Alignment', format: () => 'Aligned on eigen-axis' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-diagonalization',
    unit: 3,
    unitTitle: 'Eigenvalues and Eigenvectors',
    topic: 'Diagonalization of Matrices',
    title: 'Matrix Diagonalization Simulator (A = PDP⁻¹)',
    icon: '🔳',
    flagship: true,
    shortDescription: 'Construct modal matrix P from eigenvectors and diagonal matrix D from eigenvalues; verify A = PDP⁻¹ and calculate large matrix powers A^k.',
    learningObjectives: [
      'Construct modal matrix P whose columns are linearly independent eigenvectors',
      'Form diagonal matrix D containing corresponding eigenvalues',
      'Compute inverse matrix P⁻¹ and verify identity A = P D P⁻¹',
      'Compute arbitrary matrix powers Aᵏ = P Dᵏ P⁻¹ efficiently',
    ],
    formulaOverview: 'A = P D P^{-1}, \\quad A^k = P D^k P^{-1}',
    parameters: [
      { key: 'matrix', label: 'Select Matrix A', type: 'select', default: 'mat3x3', options: [
        { label: '3×3 Matrix: [1 1 3; 1 5 1; 3 1 1]', value: 'mat3x3' },
        { label: '2×2 Matrix: [4 1; 2 3]', value: 'mat2x2' },
        { label: '2×2 Symmetric: [3 1; 1 3]', value: 'symm2x2' },
      ]},
      { key: 'powerK', label: 'Compute Power A^k', type: 'range', min: 1, max: 10, step: 1, default: 3 },
      { key: 'verify', label: 'Verify PDP⁻¹ = A', type: 'boolean', default: true },
    ],
    metrics: [
      { id: 'isDiag', label: 'Diagonalizable', format: () => 'Yes (n distinct eigenvectors)' },
      { id: 'diff', label: 'PDP⁻¹ − A Tolerance', format: () => '< 10⁻¹² (Verified)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-cayley-hamilton',
    unit: 3,
    unitTitle: 'Eigenvalues and Eigenvectors',
    topic: 'Cayley–Hamilton Theorem and Applications',
    title: 'Cayley–Hamilton Theorem & Inverse Laboratory',
    icon: '🔁',
    shortDescription: 'Verify Cayley-Hamilton theorem p(A) = 0 by evaluating the characteristic matrix polynomial and compute matrix inverse A⁻¹ without determinants.',
    learningObjectives: [
      'Substitute matrix A into its own characteristic polynomial p(λ) = 0',
      'Perform matrix additions and multiplications to confirm p(A) = O (Zero Matrix)',
      'Derive and compute inverse A⁻¹ from Cayley-Hamilton identity',
      'Evaluate higher matrix powers A⁴, A⁵ using polynomial reduction',
    ],
    formulaOverview: 'p(\\lambda) = \\det(A - \\lambda I) = 0 \\implies p(A) = A^n - c_1 A^{n-1} + \\dots + (-1)^n \\det(A) I = O',
    parameters: [
      { key: 'matrixChoice', label: 'Matrix A', type: 'select', default: 'matA', options: [
        { label: '2×2: [1 2; -1 4]', value: 'matA' },
        { label: '2×2: [2 1; 1 2]', value: 'matB' },
        { label: '3×3: [2 -1 1; -1 2 -1; 1 -1 2]', value: 'matC' },
      ]},
      { key: 'action', label: 'Application', type: 'select', default: 'verify', options: [
        { label: 'Verify p(A) = 0', value: 'verify' },
        { label: 'Calculate A⁻¹', value: 'inv' },
        { label: 'Calculate A⁴', value: 'power4' },
      ]},
    ],
    metrics: [
      { id: 'chResult', label: 'p(A) Matrix', format: () => '[0  0; 0  0] (Exact Zero)' },
      { id: 'invDet', label: '|A|', format: () => '2.0' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — ELEMENTARY NUMBER THEORY
  // ═══════════════════════════════════════════════════════════════════════════
  u25rmaSimulation({
    id: 'u25rma201-euclidean-algorithm',
    unit: 4,
    unitTitle: 'Elementary Number Theory',
    topic: 'Divisibility, GCD and Euclidean Algorithm',
    title: 'Euclidean & Extended Euclidean Algorithm (GCD & Bézout)',
    icon: '🔢',
    flagship: true,
    shortDescription: 'Step-by-step division algorithm to compute gcd(a, b) and backward substitution to find Bézout integers x, y satisfying ax + by = gcd(a, b).',
    learningObjectives: [
      'Trace successive division steps r_{i-1} = q_i r_i + r_{i+1} until remainder zero',
      'Identify greatest common divisor gcd(a, b) as the last non-zero remainder',
      'Apply Extended Euclidean algorithm to compute Bézout coefficients ax + by = gcd(a, b)',
    ],
    formulaOverview: 'r_{i-1} = q_i r_i + r_{i+1}, \\quad a x + b y = \\gcd(a, b)',
    parameters: [
      { key: 'a', label: 'Integer a', type: 'number', default: 252, min: 1, max: 10000 },
      { key: 'b', label: 'Integer b', type: 'number', default: 105, min: 1, max: 10000 },
      { key: 'mode', label: 'Algorithm', type: 'select', default: 'extended', options: [
        { label: 'Extended Euclidean (Bézout x, y)', value: 'extended' },
        { label: 'Standard Euclidean (GCD only)', value: 'standard' },
      ]},
    ],
    metrics: [
      { id: 'gcdVal', label: 'gcd(a, b)', format: () => '21' },
      { id: 'bezout', label: 'Bézout Identity', format: () => '252(1) + 105(-2) = 21' },
      { id: 'coprime', label: 'Coprime', format: () => 'No' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-modular-arithmetic',
    unit: 4,
    unitTitle: 'Elementary Number Theory',
    topic: 'Congruence and Modular Arithmetic',
    title: 'Modular Arithmetic & Clock Visualizer (mod n)',
    icon: '🕒',
    shortDescription: 'Interactive modular clock arithmetic visualizer showing residues 0 to n-1, modular addition, subtraction, multiplication, and equivalence classes.',
    learningObjectives: [
      'Visualize congruence a ≡ b (mod n) as equivalent positions on a modular clock',
      'Perform modular addition, subtraction, and multiplication within residue ring ℤ_n',
      'Examine complete residue systems and properties of congruence classes',
    ],
    formulaOverview: 'a \\equiv b \\pmod n \\iff n \\mid (a - b)',
    parameters: [
      { key: 'n', label: 'Modulus n', type: 'range', min: 2, max: 30, step: 1, default: 12 },
      { key: 'a', label: 'Operand a', type: 'range', min: 0, max: 50, step: 1, default: 17 },
      { key: 'b', label: 'Operand b', type: 'range', min: 0, max: 50, step: 1, default: 9 },
      { key: 'op', label: 'Operation', type: 'select', default: 'add', options: [
        { label: 'Addition (a + b mod n)', value: 'add' },
        { label: 'Subtraction (a - b mod n)', value: 'sub' },
        { label: 'Multiplication (a × b mod n)', value: 'mul' },
      ]},
    ],
    metrics: [
      { id: 'resA', label: 'a mod n', format: () => '5' },
      { id: 'resB', label: 'b mod n', format: () => '9' },
      { id: 'result', label: 'Result mod n', format: () => '2' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-euler-totient',
    unit: 4,
    unitTitle: 'Elementary Number Theory',
    topic: "Euler's Totient Function and Fermat's Little Theorem",
    title: "Euler's Totient Function φ(n) & Fermat's Theorem",
    icon: '✨',
    shortDescription: 'Calculate φ(n) with complete list of coprime residues 1 ≤ k ≤ n and demonstrate Fermat’s Little Theorem a^(p-1) ≡ 1 (mod p).',
    learningObjectives: [
      'Compute Euler totient φ(n) by counting integers k with gcd(k, n) = 1',
      'Apply product formula φ(n) = n ∏(1 - 1/p) over distinct prime factors',
      'Verify Fermat’s Little Theorem condition and result a^(p-1) ≡ 1 mod p',
    ],
    formulaOverview: '\\phi(n) = n \\prod_{p \\mid n} \\left(1 - \\frac{1}{p}\\right), \\quad a^{p-1} \\equiv 1 \\pmod p',
    parameters: [
      { key: 'n', label: 'Number n', type: 'range', min: 2, max: 100, step: 1, default: 36 },
      { key: 'checkFermat', label: 'Test Fermat Theorem', type: 'boolean', default: true },
      { key: 'fermatBase', label: 'Fermat Base a', type: 'range', min: 2, max: 20, step: 1, default: 2 },
    ],
    metrics: [
      { id: 'phiVal', label: 'φ(n)', format: () => '12' },
      { id: 'primes', label: 'Prime Factors', format: () => '2² × 3²' },
      { id: 'fermatStatus', label: 'Fermat Condition', format: () => 'p is not prime (Composite)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-crt',
    unit: 4,
    unitTitle: 'Elementary Number Theory',
    topic: 'Chinese Remainder Theorem',
    title: 'Chinese Remainder Theorem Laboratory (CRT)',
    icon: '🏛️',
    flagship: true,
    shortDescription: 'Solve simultaneous system of linear congruences x ≡ aᵢ (mod nᵢ) with pairwise coprimality check, intermediate multipliers Mᵢ, and solution verification.',
    learningObjectives: [
      'Check pairwise coprimality: gcd(nᵢ, nⱼ) = 1 for all i ≠ j',
      'Compute total modulus M = ∏ nᵢ and intermediate values Mᵢ = M / nᵢ',
      'Find modular inverses Mᵢ yᵢ ≡ 1 (mod nᵢ) using Extended Euclidean algorithm',
      'Construct unique solution x = ∑ aᵢ Mᵢ yᵢ mod M and verify in every congruence',
    ],
    formulaOverview: 'x \\equiv \\sum_{i=1}^k a_i M_i y_i \\pmod M, \\quad M_i y_i \\equiv 1 \\pmod{n_i}',
    parameters: [
      { key: 'preset', label: 'Congruence System', type: 'select', default: 'standard3', options: [
        { label: 'Sun Zi Classic: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)', value: 'standard3' },
        { label: 'Calendar System: x ≡ 1 (mod 2), x ≡ 2 (mod 3), x ≡ 3 (mod 5)', value: 'calendar' },
        { label: '2 Congruences: x ≡ 3 (mod 5), x ≡ 4 (mod 7)', value: 'system2' },
      ]},
      { key: 'verify', label: 'Verify All Congruences', type: 'boolean', default: true },
    ],
    metrics: [
      { id: 'solution', label: 'Solution x', format: () => 'x ≡ 23 (mod 105)' },
      { id: 'totalMod', label: 'Total Modulus M', format: () => '105' },
      { id: 'verified', label: 'Verification', format: () => 'All 3 Congruences Satisfied' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — NUMBER THEORY IN CRYPTOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════════
  u25rmaSimulation({
    id: 'u25rma201-modular-exp',
    unit: 5,
    unitTitle: 'Number Theory in Cryptography',
    topic: 'Modular Exponentiation and Modular Inverse',
    title: 'Modular Exponentiation & Inverse (Square & Multiply)',
    icon: '⚡',
    flagship: true,
    shortDescription: 'Efficient modular exponentiation a^b mod n via binary square-and-multiply algorithm and modular inverse computation via Extended Euclidean algorithm.',
    learningObjectives: [
      'Decompose exponent b into binary bits to execute fast square-and-multiply algorithm',
      'Compute modular inverse a⁻¹ mod n when gcd(a, n) = 1, detecting existence',
      'Trace step-by-step intermediate squarings and modular reductions in table format',
    ],
    formulaOverview: 'a^b \\bmod n, \\quad a x \\equiv 1 \\pmod n \\iff \\gcd(a, n) = 1',
    parameters: [
      { key: 'mode', label: 'Computation', type: 'select', default: 'exp', options: [
        { label: 'Modular Exponentiation (a^b mod n)', value: 'exp' },
        { label: 'Modular Inverse (a⁻¹ mod n)', value: 'inv' },
      ]},
      { key: 'a', label: 'Base / Value a', type: 'number', default: 7, min: 1, max: 1000 },
      { key: 'b', label: 'Exponent b (for a^b)', type: 'number', default: 13, min: 1, max: 1000 },
      { key: 'n', label: 'Modulus n', type: 'number', default: 19, min: 2, max: 1000 },
    ],
    metrics: [
      { id: 'binaryBits', label: 'Binary Exponent', format: () => '1101₂ (4 steps)' },
      { id: 'result', label: 'Result', format: () => '15' },
      { id: 'multiplications', label: 'Operations Saved', format: () => '4 vs 12 steps (67% faster)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-rsa',
    unit: 5,
    unitTitle: 'Number Theory in Cryptography',
    topic: 'RSA Algorithm Basics',
    title: 'RSA Cryptography Laboratory (Key Gen, Encrypt, Decrypt)',
    icon: '🔐',
    flagship: true,
    shortDescription: 'Complete educational RSA laboratory: validate primes p and q, generate keys (e, d), encrypt plaintext message m to ciphertext c, and decrypt back to m.',
    learningObjectives: [
      'Validate prime inputs p and q, calculate modulus n = pq and totient φ(n) = (p-1)(q-1)',
      'Select valid public exponent e with gcd(e, φ(n)) = 1 and compute private key d = e⁻¹ mod φ(n)',
      'Perform RSA encryption c = mᵉ mod n and decryption m = cᵈ mod n',
      'Verify recovered message matches original message within educational bounds',
    ],
    formulaOverview: 'n = p q, \\quad \\phi(n) = (p-1)(q-1), \\quad c = m^e \\bmod n, \\quad m = c^d \\bmod n',
    parameters: [
      { key: 'p', label: 'Prime p', type: 'number', default: 61, min: 2, max: 500 },
      { key: 'q', label: 'Prime q', type: 'number', default: 53, min: 2, max: 500 },
      { key: 'e', label: 'Public Exponent e', type: 'number', default: 17, min: 2, max: 10000 },
      { key: 'message', label: 'Plaintext Message m', type: 'number', default: 65, min: 0, max: 3000 },
    ],
    metrics: [
      { id: 'modulusN', label: 'Modulus n', format: () => '3233' },
      { id: 'phiN', label: 'φ(n)', format: () => '3120' },
      { id: 'privateD', label: 'Private Key d', format: () => '2753' },
      { id: 'ciphertext', label: 'Ciphertext c', format: () => '2790' },
      { id: 'recovered', label: 'Decrypted m', format: () => '65 (Verified Match)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-diffie-hellman',
    unit: 5,
    unitTitle: 'Number Theory in Cryptography',
    topic: 'Diffie–Hellman Key Exchange',
    title: 'Diffie–Hellman Key Exchange Simulator',
    icon: '🤝',
    flagship: true,
    shortDescription: 'Interactive two-party key exchange: Alice and Bob establish a shared secret over an insecure channel without transmitting private keys.',
    learningObjectives: [
      'Configure public prime p and primitive root generator g',
      'Generate private keys a (Alice) and b (Bob) and public exchange values A = gᵃ mod p, B = gᵇ mod p',
      'Demonstrate that shared secret s = Bᵃ mod p = Aᵇ mod p matches on both sides',
    ],
    formulaOverview: 'A = g^a \\bmod p, \\quad B = g^b \\bmod p, \\quad s = B^a \\bmod p = A^b \\bmod p = g^{ab} \\bmod p',
    parameters: [
      { key: 'p', label: 'Shared Prime Modulus p', type: 'number', default: 23, min: 5, max: 200 },
      { key: 'g', label: 'Shared Generator g', type: 'number', default: 5, min: 2, max: 50 },
      { key: 'aliceA', label: "Alice's Private Key (a)", type: 'number', default: 6, min: 1, max: 100 },
      { key: 'bobB', label: "Bob's Private Key (b)", type: 'number', default: 15, min: 1, max: 100 },
    ],
    metrics: [
      { id: 'alicePub', label: "Alice Public (A)", format: () => '8' },
      { id: 'bobPub', label: "Bob Public (B)", format: () => '19' },
      { id: 'sharedSecret', label: 'Shared Secret (s)', format: () => '2 (Matches on both sides)' },
    ],
  }),

  u25rmaSimulation({
    id: 'u25rma201-digital-signatures',
    unit: 5,
    unitTitle: 'Number Theory in Cryptography',
    topic: 'Digital Signatures and Secure Communication',
    title: 'Digital Signatures & Secure Communication Lab',
    icon: '🔏',
    shortDescription: 'Sign messages using private keys and verify authenticity with public keys; includes tamper simulation demonstrating signature verification failure.',
    learningObjectives: [
      'Understand the signature signing concept s = hᵈ mod n and verification sᵉ mod n = h',
      'Demonstrate integrity and non-repudiation in digital communication',
      'Test tamper detection by altering transmitted message and observing verification failure',
    ],
    formulaOverview: 's = H(m)^d \\bmod n, \\quad \\text{Verify: } s^e \\bmod n \\stackrel{?}{=} H(m)',
    parameters: [
      { key: 'msgText', label: 'Document Message', type: 'select', default: 'TRANSFER_100', options: [
        { label: 'Bank Transfer: $100', value: 'TRANSFER_100' },
        { label: 'Grade Approval: PASS', value: 'GRADE_PASS' },
        { label: 'Contract Agreement: ACCEPT', value: 'CONTRACT_OK' },
      ]},
      { key: 'tamper', label: 'Simulate Message Tampering', type: 'boolean', default: false },
    ],
    metrics: [
      { id: 'sigStatus', label: 'Signature Validity', format: (_s, p) => p.tamper ? 'INVALID (Tampered!)' : 'VALID (Authentic)' },
      { id: 'integrity', label: 'Data Integrity', format: (_s, p) => p.tamper ? 'Compromised in transit' : 'Verified Intact' },
    ],
  }),
];
