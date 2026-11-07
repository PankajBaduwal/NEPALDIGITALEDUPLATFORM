/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester IV
 * Course: Numerical Methods and Partial Differential Equations (U25MA402 / Basic Science Course - BSC)
 * Official Source: Mechanical Engineering Curriculum R2025, Anna University MA3351 / MA8452 / MA6459
 */

import type { ISimulationDefinition } from './types';
import type { NumericalSimId } from './numerical-methods-pde/core/types';

export const U25MA402_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester IV',
  regulation: 'R2025 Revised CBCS',
  courseCode: 'U25MA402',
  courseCodeAliases: ['MA3351', 'MA8452', 'MA6459', 'U21MA402'],
  courseTitle: 'Numerical Methods and Partial Differential Equations',
  category: 'BSC',
  credits: 4,
  ltpjc: '3-1-0-0-4',
  lectureHours: 45,
  tutorialHours: 15,
  totalHours: 60,
  courseObjectives: [
    'To introduce the basic concepts of solving algebraic and transcendental equations and systems of linear equations numerically',
    'To understand the techniques of interpolation, numerical differentiation, and numerical integration',
    'To apply numerical methods to find solutions of initial value problems for ordinary differential equations',
    'To solve boundary value problems in ordinary and partial differential equations using finite difference schemes',
    'To develop algorithmic and computational skills for engineering applications in heat transfer, fluid flow, and solid mechanics',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Apply', description: 'Solve algebraic and transcendental equations and simultaneous linear systems using direct and iterative numerical methods' },
    { code: 'CO2', level: 'Apply', description: 'Construct interpolating polynomials and approximate functional values using Newton and Lagrange interpolation' },
    { code: 'CO3', level: 'Apply', description: 'Evaluate numerical derivatives and definite integrals using composite Trapezoidal and Simpson rules' },
    { code: 'CO4', level: 'Apply', description: 'Compute numerical solutions of initial value problems for ODEs using single-step and multi-step methods' },
    { code: 'CO5', level: 'Analyze', description: 'Solve one-dimensional heat and wave equations and two-dimensional Laplace equations using explicit and implicit finite differences' },
  ],
  units: [
    { number: 1, title: 'SOLUTION OF EQUATIONS AND EIGENVALUE PROBLEMS', hours: 12, outcome: 'CO1' },
    { number: 2, title: 'INTERPOLATION AND APPROXIMATION', hours: 12, outcome: 'CO2' },
    { number: 3, title: 'NUMERICAL DIFFERENTIATION AND INTEGRATION', hours: 12, outcome: 'CO3' },
    { number: 4, title: 'INITIAL VALUE PROBLEMS FOR ORDINARY DIFFERENTIAL EQUATIONS', hours: 12, outcome: 'CO4' },
    { number: 5, title: 'BOUNDARY VALUE PROBLEMS IN ODES AND PDES', hours: 12, outcome: 'CO5' },
  ],
};

export const U25MA402_SUBJECT_KEYWORDS = [
  'u25ma402',
  'ma3351',
  'ma8452',
  'ma6459',
  'numerical methods',
  'partial differential equations',
  'pde',
  'root finding',
  'bisection',
  'newton-raphson',
  'finite difference',
  'runge-kutta',
  'rk4',
  'heat equation',
  'wave equation',
  'simpson',
];

export const U25MA402_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ma402-sim-01',
    title: 'Root-Finding Methods Laboratory',
    domain: 'MATHEMATICS',
    category: 'numerical methods',
    icon: '🎯',
    shortDescription: 'Interactive root finding: Bisection, Regula Falsi, Newton-Raphson, and Secant with convergence visualization.',
    detailedDescription:
      'Solve algebraic and transcendental equations with student-editable functions, bracket interval validation, and derivative vanishing guards. View iteration-by-iteration calculation tables, approximate error |x_k - x_{k-1}|, and animated function graphs with convergence trajectory.',
    learningObjectives: [
      'Verify bracketing condition f(a)·f(b) < 0 under the Intermediate Value Theorem for Bisection and Regula Falsi',
      'Analyze quadratic convergence and derivative zero-crossing singularities in Newton-Raphson',
      'Compare linear vs superlinear vs quadratic convergence rates across numerical root methods',
    ],
    formulaOverview: 'x_{n+1} = x_n - f(x_n)/f\'(x_n); x_c = (a·f(b) - b·f(a))/(f(b) - f(a))',
    suggestedUnits: [1],
    boardEngine: 'numerical-methods',
    subjectKeywords: U25MA402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Root-Finding', 'Bisection', 'Regula Falsi', 'Newton-Raphson', 'Secant', 'U25MA402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ma402-sim-02',
    title: 'Simultaneous Linear Equations & Residual Solver',
    domain: 'MATHEMATICS',
    category: 'numerical methods',
    icon: '🔢',
    shortDescription: 'Direct and iterative linear system solvers with partial pivoting, LU decomposition, and residual norm calculation.',
    detailedDescription:
      'Solve systems of simultaneous linear equations Ax = b using Gaussian elimination with partial pivoting, Gauss-Jordan, Doolittle LU factorization, and iterative Gauss-Seidel and Jacobi solvers. Inspect step-by-step augmented matrix transformations, diagonal dominance criteria, and residual vectors r = b - Ax.',
    learningObjectives: [
      'Understand partial pivoting to prevent division by near-zero and minimize floating-point roundoff error',
      'Verify the strict diagonal dominance condition for guaranteed convergence in Gauss-Seidel',
      'Evaluate numerical solution quality via residual vector r = b - Ax and infinity norm ‖r‖_∞',
    ],
    formulaOverview: 'r = b - Ax; ‖r‖_∞ = max |r_i|; A = L·U; x_i^{(k+1)} = (b_i - ∑_{j<i} a_{ij}x_j^{(k+1)} - ∑_{j>i} a_{ij}x_j^{(k)}) / a_{ii}',
    suggestedUnits: [1],
    boardEngine: 'numerical-methods',
    subjectKeywords: U25MA402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Linear Systems', 'Gauss Elimination', 'LU Decomposition', 'Gauss-Seidel', 'Residual', 'U25MA402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ma402-sim-03',
    title: 'Interpolation & Curve Fitting Studio',
    domain: 'MATHEMATICS',
    category: 'numerical methods',
    icon: '📈',
    shortDescription: 'Newton forward/backward, divided difference, and Lagrange interpolation with extrapolation hazard detection.',
    detailedDescription:
      'Construct continuous interpolating polynomials through discrete mechanical engineering datasets (e.g., steam tables, tensile test data). Generates forward and backward difference tables, divided difference trees, and Lagrange basis polynomials, with visual warnings for dangerous extrapolation outside observed data ranges.',
    learningObjectives: [
      'Construct Newton forward and backward difference tables for equidistant observation points',
      'Apply divided differences and Lagrange basis polynomials for unequally spaced data',
      'Differentiate exact polynomial interpolation from least-squares regression curve fitting',
      'Identify Runge phenomenon and loss of predictive reliability during extrapolation',
    ],
    formulaOverview: 'P(x) = y_0 + uΔy_0 + (u(u-1)/2!)Δ²y_0 + ...; L_i(x) = ∏_{j≠i} (x - x_j)/(x_i - x_j)',
    suggestedUnits: [2],
    boardEngine: 'numerical-methods',
    subjectKeywords: U25MA402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Interpolation', 'Newton Forward', 'Lagrange', 'Divided Difference', 'Regression', 'U25MA402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ma402-sim-04',
    title: 'Numerical Differentiation & Quadrature Laboratory',
    domain: 'MATHEMATICS',
    category: 'numerical methods',
    icon: '∫',
    shortDescription: 'Finite difference derivatives and composite numerical integration via Trapezoidal and Simpson rules.',
    detailedDescription:
      'Evaluate first and second derivatives using forward, backward, and O(h²) central differences. Compute numerical integrals using Composite Trapezoidal, Composite Simpson 1/3 (with even interval enforcement), and Simpson 3/8 rules. Features visual integration panel shading and analytical error comparison.',
    learningObjectives: [
      'Calculate numerical derivatives and compare O(h) one-sided differences with O(h²) central differences',
      'Enforce geometric requirements: even subintervals for Simpson 1/3 and multiples of 3 for Simpson 3/8',
      'Quantify truncation error reduction as step size h decreases',
    ],
    formulaOverview: 'f\'(x) ≈ (f(x+h) - f(x-h))/(2h); I ≈ (h/3)[f_0 + 4∑f_{odd} + 2∑f_{even} + f_n]',
    suggestedUnits: [3],
    boardEngine: 'numerical-methods',
    subjectKeywords: U25MA402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Numerical Differentiation', 'Trapezoidal', 'Simpson 1/3', 'Simpson 3/8', 'Quadrature', 'U25MA402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ma402-sim-05',
    title: 'Ordinary Differential Equations (IVP) Solver',
    domain: 'MATHEMATICS',
    category: 'numerical methods',
    icon: '⚡',
    shortDescription: 'Euler, Modified Euler (Heun), and Runge-Kutta 4th Order (RK4) solvers with exact trajectory comparison.',
    detailedDescription:
      'Solve initial-value problems dy/dx = f(x, y) with adjustable step size h. Compares first-order Euler, second-order Modified Euler, and classical fourth-order Runge-Kutta (RK4). Plots numerical solution trajectories against analytical reference curves and tracks accumulated global truncation error.',
    learningObjectives: [
      'Trace single-step ODE marching from initial condition y(x_0) = y_0',
      'Understand Heun predictor-corrector mechanics to elevate Euler from O(h) to O(h²)',
      'Calculate the four intermediate slope evaluations (k_1, k_2, k_3, k_4) in the RK4 algorithm',
    ],
    formulaOverview: 'y_{n+1} = y_n + (1/6)(k_1 + 2k_2 + 2k_3 + k_4); k_1 = h·f(x_n, y_n)',
    suggestedUnits: [4],
    boardEngine: 'numerical-methods',
    subjectKeywords: U25MA402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['ODE', 'Euler', 'Modified Euler', 'Runge-Kutta', 'RK4', 'Initial Value Problem', 'U25MA402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ma402-sim-06',
    title: 'Partial Differential Equations (PDE) Finite Difference Studio',
    domain: 'MATHEMATICS',
    category: 'numerical methods',
    icon: '🌊',
    shortDescription: '1D transient heat conduction with CFL stability r <= 0.5, 1D wave equation, and 2D Laplace potential.',
    detailedDescription:
      'Solve parabolic, hyperbolic, and elliptic PDEs using finite difference schemes. Simulates 1D transient heat diffusion with explicit Bender-Schmidt FTCS scheme and enforces Courant stability r = α·Δt/(Δx)² ≤ 0.5. Features 1D vibrating string wave propagation and 2D steady-state thermal distribution with Liebmann iteration.',
    learningObjectives: [
      'Implement explicit Forward Time Central Space (FTCS) finite differences for 1D transient diffusion',
      'Demonstrate how exceeding the CFL stability threshold (r > 0.5) triggers catastrophic numerical oscillations',
      'Simulate 1D hyperbolic wave propagation under Courant number C = c·Δt/Δx ≤ 1',
      'Solve 2D elliptic Laplace equations using five-point iterative relaxation',
    ],
    formulaOverview: 'u_i^{n+1} = u_i^n + r(u_{i+1}^n - 2u_i^n + u_{i-1}^n); r = \\alpha\\Delta t / (\\Delta x)^2 \\leq 0.5',
    suggestedUnits: [5],
    boardEngine: 'numerical-methods',
    subjectKeywords: U25MA402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['PDE', 'Heat Equation', 'Wave Equation', 'Laplace', 'FTCS', 'CFL Stability', 'U25MA402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ma402-sim-07',
    title: 'Numerical Methods Comparison Laboratory & Error Bench',
    domain: 'MATHEMATICS',
    category: 'numerical methods',
    icon: '⚖️',
    shortDescription: 'Comparative benchmarking of convergence rates, computational effort, and error reduction across all syllabus methods.',
    detailedDescription:
      'A common experimental laboratory workspace where students compare numerical algorithms on identical engineering problems. Features side-by-side iteration counts, semi-log error charts, residual norm indicators, and pedagogical guidelines on choosing the appropriate algorithm in mechanical and thermal engineering.',
    learningObjectives: [
      'Compare root-finding methods on identical polynomial and transcendental test equations',
      'Examine execution cost vs accuracy trade-offs in direct vs iterative linear system solvers',
      'Verify error orders O(h), O(h²), and O(h⁴) in numerical calculus and differential equation marching',
    ],
    formulaOverview: 'Convergence Rate: |\\epsilon_{k+1}| \\approx C |\\epsilon_k|^p; \\quad p=1 \\text{ (linear)}, p=2 \\text{ (quadratic)}',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'numerical-methods',
    subjectKeywords: U25MA402_SUBJECT_KEYWORDS,
    parameters: [],
    metrics: [],
    tags: ['Comparison Lab', 'Convergence Rate', 'Truncation Error', 'Benchmarking', 'U25MA402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25MA402SimId(id: string): NumericalSimId | null {
  if (id.startsWith('u25ma402-sim-')) {
    return id as NumericalSimId;
  }
  if (id.includes('root') || id.includes('bisection') || id.includes('newton-raphson') || id.includes('regula-falsi')) {
    return 'u25ma402-sim-01';
  }
  if (id.includes('linear') || id.includes('gauss') || id.includes('lu-decomp') || id.includes('seidel')) {
    return 'u25ma402-sim-02';
  }
  if (id.includes('interpolation') || id.includes('lagrange') || id.includes('divided-difference')) {
    return 'u25ma402-sim-03';
  }
  if (id.includes('differentiation') || id.includes('integration') || id.includes('simpson') || id.includes('trapezoid')) {
    return 'u25ma402-sim-04';
  }
  if (id.includes('ode') || id.includes('euler') || id.includes('rk4') || id.includes('runge-kutta')) {
    return 'u25ma402-sim-05';
  }
  if (id.includes('pde') || id.includes('heat-equation') || id.includes('wave-equation') || id.includes('laplace')) {
    return 'u25ma402-sim-06';
  }
  if (id.includes('comparison') || id.includes('bench') || id.includes('numerical-methods')) {
    return 'u25ma402-sim-07';
  }
  return null;
}
