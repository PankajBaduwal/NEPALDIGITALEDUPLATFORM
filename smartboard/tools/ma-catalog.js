'use strict';

/*
 * Engineering Mathematics (U21MA101) & Linear Algebra and Number Theory (U25RMA201)
 * Simulation catalogue organised by Unit → Topic → Simulation.
 * Keep in sync with dashboard registry (MA_BOARD_SIMULATIONS, U25RMA201_BOARD_SIMULATIONS)
 * and backend (MA_SIMULATION_TEMPLATES, U25RMA201_SIMULATION_TEMPLATES).
 */
(function () {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const currentSubjectCode = urlParams.get('subjectCode') || '';
  const currentSimId = urlParams.get('sim') || urlParams.get('preset') || '';

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. U21MA101 — CALCULUS AND DIFFERENTIAL EQUATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const u21subject = {
    name: 'Engineering Mathematics',
    code: 'U21MA101',
    semester: 1,
    department: 'Information Technology',
    programme: 'B.Tech Information Technology',
    regulation: 'R2021 CBCS'
  };
  const u21units = [
    { unit: 1, number: 1, title: 'Matrices', subtype: 'matrices' },
    { unit: 2, number: 2, title: 'Functions of Several Variables', subtype: 'several-variables' },
    { unit: 3, number: 3, title: 'Multiple Integrals', subtype: 'multiple-integrals' },
    { unit: 4, number: 4, title: 'Line and Surface Integrals', subtype: 'vector-calculus' },
    { unit: 5, number: 5, title: 'Ordinary Differential Equations', subtype: 'ode' },
  ];
  const u21rows = [
    ['ma-matrix-ops', 1, 'Matrix Operations', 'Matrix Operations Visualizer', '🧮', 'Addition, subtraction, scalar multiple, product and transpose — every entry calculated step by step.'],
    ['ma-eigen', 1, 'Eigenvalues & Eigenvectors', 'Eigenvalue & Eigenvector Visualizer', '⭐', 'Matrix → det(A − λI) = 0 → eigenvalues → eigenvectors → see which vectors keep their direction.', true],
    ['ma-cayley-hamilton', 1, 'Cayley-Hamilton', 'Cayley-Hamilton Theorem Simulator', '🔁', 'Characteristic polynomial, substitute A, verify p(A) = 0 and use it to find A⁻¹.'],
    ['ma-diagonalization', 1, 'Diagonalization', 'Matrix Diagonalization', '🔳', 'Eigenvalues, eigenvectors, modal matrix P, D = P⁻¹AP (or orthogonal Pᵀ A P) and verification.'],
    ['ma-orthogonal', 1, 'Orthogonal Transformation', 'Orthogonal Transformation', '🔄', 'Rotations/reflections preserve lengths and angles; reduce a quadratic form to canonical form.'],
    ['ma-matrix-applications', 1, 'Applications', 'Matrix Applications', '🧩', 'Linear systems, network flow and population models: input → matrix form → calculation → result.'],
    ['ma-partial', 2, 'Partial Derivatives', 'Partial Derivative Visualizer', '∂', 'Freeze y and vary x (and vice versa): slices of the surface, fₓ, f_y and higher partial derivatives.'],
    ['ma-total-derivative', 2, 'Total Derivative', 'Total Derivative Simulator', '🔗', 'du/dt = u_x dx/dt + u_y dy/dt — each component calculated and compared with direct substitution.'],
    ['ma-jacobian', 2, 'Jacobians', 'Jacobian Visualizer', '🧭', 'Partial derivatives → Jacobian matrix → determinant, and how a small square is mapped.'],
    ['ma-taylor2', 2, 'Taylor Series', 'Taylor Series for Two Variables', '⭐', 'f(x,y) about (a,b): derivatives, terms, polynomial of order 1–4 and the approximation error.', true],
    ['ma-extrema', 2, 'Extreme Values', 'Extreme Values of Two Variables', '⭐', 'fₓ = f_y = 0 → critical points → rt − s² test → maximum, minimum or saddle, on contour and 3-D views.', true],
    ['ma-lagrange', 2, 'Lagrange Multipliers', 'Lagrange Multipliers', '⭐', 'Objective and constraint → ∇f = λ∇g → candidate points highlighted where level curves touch the constraint.', true],
    ['ma-double-integral', 3, 'Double Integrals', 'Double Integral Visualizer', '∬', 'Region, inner and outer integration step by step, and the volume under the surface.'],
    ['ma-change-order', 3, 'Change of Order', 'Change of Order of Integration', '⭐', 'Plot the region, find the boundary curves, slice the other way and read the new limits.', true],
    ['ma-triple-integral', 3, 'Triple Integrals', 'Triple Integral Visualizer', '∭', 'Inner, middle and outer integration over a 3-D region, with the region drawn in 3-D.'],
    ['ma-area', 3, 'Area', 'Area Using Double Integral', '📐', 'Area between two curves: intersections, limits and strips building up the area.'],
    ['ma-volume', 3, 'Volume', 'Volume Using Triple Integral', '🧊', 'Volume of a solid bounded by surfaces — limits, slices and the accumulated volume.'],
    ['ma-line-integral', 4, 'Line Integral', 'Line Integral Visualizer', '〰️', '∫_C F·dr along a parametrised path: direction, F·r′(t) and the running accumulation.'],
    ['ma-surface-integral', 4, 'Surface Integral', 'Surface Integral Visualizer', '🌐', 'Surface, normal vectors and flux ∬ F·n dS computed through a parametrisation.'],
    ['ma-green', 4, "Green's Theorem", "Green's Theorem Simulator", '⭐', '∮ P dx + Q dy = ∬ (Q_x − P_y) dA — both sides computed and compared.', true],
    ['ma-stokes', 4, "Stokes' Theorem", "Stokes' Theorem Simulator", '🌀', '∮ F·dr around the boundary = ∬ (∇×F)·n dS over the surface, in 3-D.'],
    ['ma-gauss', 4, 'Gauss Divergence Theorem', 'Gauss Divergence Theorem Simulator', '📦', '∯ F·n dS through a closed surface = ∭ ∇·F dV — outward normals and both sides compared.'],
    ['ma-ode2', 5, 'Second-Order ODE', 'Second-Order ODE Solver', '⭐', 'a y″ + b y′ + c y = f(x): auxiliary equation, CF, PI, initial conditions and the solution curve.', true],
    ['ma-ode-higher', 5, 'Higher-Order ODE', 'Higher-Order ODE Solver', '📈', 'Linear constant-coefficient ODEs up to order 6: characteristic equation, roots and the general solution.'],
    ['ma-ode-constant', 5, 'Constant Coefficient ODE', 'Constant Coefficient ODE Simulator', '🎚️', 'All root cases (distinct, repeated, complex) with sliders — see the solution curve change live.'],
    ['ma-ode-variable', 5, 'Variable Coefficient ODE', 'Variable Coefficient ODE Simulator', '🔧', 'Equations reducible to constant coefficients (x = eᶻ, Legendre linear) and a known-solution reduction of order.'],
    ['ma-euler-cauchy', 5, 'Euler-Cauchy Equation', 'Euler-Cauchy Equation Simulator', '📐', 'x²y″ + a x y′ + b y = f(x): substitution x = eᶻ, auxiliary equation, roots and solution curve.'],
    ['ma-legendre', 5, "Legendre's Equation", "Legendre's Equation Simulator", '📜', '(ax+b)²y″ + … : substitution ax + b = eᶻ, reduced equation and solution; Legendre polynomials Pₙ(x).'],
    ['ma-variation-params', 5, 'Variation of Parameters', 'Variation of Parameters Simulator', '🧷', 'y₁, y₂, Wronskian, u₁ = −∫y₂f/W, u₂ = ∫y₁f/W, particular solution and the final curve.'],
  ];

  const u21UnitTitle = (u) => (u21units.find((x) => x.unit === u) || {}).title || '';
  const u21UnitSubtype = (u) => (u21units.find((x) => x.unit === u) || {}).subtype || '';
  const u21Simulations = u21rows.map(([id, unit, topic, title, icon, description, flagship]) => ({
    id, unit, topic, title, icon, description, flagship: Boolean(flagship),
    unitTitle: u21UnitTitle(unit), subtype: u21UnitSubtype(unit)
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. U25RMA201 — LINEAR ALGEBRA AND NUMBER THEORY (R2025 · SEMESTER II)
  // ═══════════════════════════════════════════════════════════════════════════
  const u25subject = {
    name: 'Linear Algebra and Number Theory',
    code: 'U25RMA201',
    semester: 2,
    department: 'Common to AD, AM, CB, CS, IT, SC',
    programme: 'B.Tech / B.E.',
    regulation: 'R2025 CBCS'
  };
  const u25units = [
    { unit: 1, number: 1, title: 'Systems of Linear Equations', code: 'UNIT I', subtype: 'linear-systems' },
    { unit: 2, number: 2, title: 'Vector Spaces', code: 'UNIT II', subtype: 'vector-spaces' },
    { unit: 3, number: 3, title: 'Eigenvalues and Eigenvectors', code: 'UNIT III', subtype: 'eigenvalues' },
    { unit: 4, number: 4, title: 'Elementary Number Theory', code: 'UNIT IV', subtype: 'number-theory' },
    { unit: 5, number: 5, title: 'Number Theory in Cryptography', code: 'UNIT V', subtype: 'cryptography' },
  ];
  const u25rows = [
    // Unit I: Systems of Linear Equations
    ['u25rma201-linear-systems', 1, 'Systems of Linear Equations', 'Linear Systems Laboratory (Ax = b)', '📐', 'Interactive augmented matrix [A|b] workspace with Gaussian, Gauss-Jordan, and LU algorithms.', true],
    ['u25rma201-gaussian-elimination', 1, 'Gaussian Elimination', 'Gaussian Elimination Simulator', '⚡', 'Step-by-step elementary row operations to row echelon form with backward substitution.', false],
    ['u25rma201-gauss-jordan', 1, 'Gauss–Jordan Elimination', 'Gauss–Jordan Elimination Simulator', '🎯', 'Full reduction [A|b] → [I|x] with unique, infinite, or inconsistent classification.', true],
    ['u25rma201-lu-decomposition', 1, 'LU Decomposition', 'LU Decomposition Laboratory (A = LU)', '🧩', 'A = LU factorization, Ly = b forward substitution, Ux = y backward substitution, and LU verification.', true],
    ['u25rma201-rank-consistency', 1, 'Rank & Consistency', 'Rank & Consistency Visualizer', '📊', 'Rouché–Capelli theorem: Rank(A) vs Rank([A|b]) and solution structure.', false],

    // Unit II: Vector Spaces
    ['u25rma201-vector-spaces', 2, 'Vector Spaces', 'Vector Space & Subspace Laboratory', '🧭', 'Vector space axioms, closure under addition and scalar multiplication, zero vector, and subspace tests.', true],
    ['u25rma201-linear-independence', 2, 'Linear Independence', 'Linear Independence, Basis & Dimension', '⚖️', 'Test c₁v₁ + c₂v₂ + ... = 0, extract basis vectors, and compute vector space dimension.', true],
    ['u25rma201-linear-transformation', 2, 'Linear Transformations', 'Linear Transformation Grid Simulator (T(x) = Ax)', '🔄', 'Interactive 2D transformation grid showing basis mapping, area distortion det(A), and matrix representation.', true],

    // Unit III: Eigenvalues and Eigenvectors
    ['u25rma201-eigenvalues', 3, 'Eigenvalues & Eigenvectors', 'Eigenvalue & Eigenvector Visualizer (Av = λv)', '⭐', 'Characteristic equation det(A - λI) = 0, eigenvalues, and geometric vector alignment along eigen-axes.', true],
    ['u25rma201-diagonalization', 3, 'Diagonalization', 'Matrix Diagonalization Simulator (A = PDP⁻¹)', '🔳', 'Construct modal matrix P and diagonal D; verify A = PDP⁻¹ and compute large matrix powers A^k.', true],
    ['u25rma201-cayley-hamilton', 3, 'Cayley–Hamilton', 'Cayley–Hamilton Theorem & Inverse Laboratory', '🔁', 'Evaluate characteristic matrix polynomial p(A) = 0 and compute matrix inverse A⁻¹ without determinants.', false],

    // Unit IV: Elementary Number Theory
    ['u25rma201-euclidean-algorithm', 4, 'Euclidean Algorithm', 'Euclidean & Extended Euclidean Algorithm (GCD & Bézout)', '🔢', 'Step-by-step division algorithm for gcd(a, b) and backward substitution for Bézout identity ax + by = gcd(a,b).', true],
    ['u25rma201-modular-arithmetic', 4, 'Modular Arithmetic', 'Modular Arithmetic & Clock Visualizer (mod n)', '🕒', 'Circular modular clock showing residues 0 to n-1, modular operations, and equivalence classes.', false],
    ['u25rma201-euler-totient', 4, "Euler's Totient", "Euler's Totient Function φ(n) & Fermat's Theorem", '✨', 'Calculate φ(n), list coprime residues 1 ≤ k ≤ n, and verify Fermat’s Little Theorem a^(p-1) ≡ 1 mod p.', false],
    ['u25rma201-crt', 4, 'Chinese Remainder Theorem', 'Chinese Remainder Theorem Laboratory (CRT)', '🏛️', 'Solve simultaneous congruences x ≡ aᵢ mod nᵢ with coprimality check, intermediate multipliers, and solution verification.', true],

    // Unit V: Number Theory in Cryptography
    ['u25rma201-modular-exp', 5, 'Modular Exponentiation', 'Modular Exponentiation & Inverse (Square & Multiply)', '⚡', 'Efficient repeated squaring binary exponentiation a^b mod n and modular inverse a⁻¹ mod n.', true],
    ['u25rma201-rsa', 5, 'RSA Algorithm', 'RSA Cryptography Laboratory (Key Gen, Encrypt, Decrypt)', '🔐', 'Complete educational RSA workflow: prime validation, keys (e, d), encryption, and decryption verification.', true],
    ['u25rma201-diffie-hellman', 5, 'Diffie–Hellman', 'Diffie–Hellman Key Exchange Simulator', '🤝', 'Interactive two-party key exchange establishing shared secret over an insecure channel.', true],
    ['u25rma201-digital-signatures', 5, 'Digital Signatures', 'Digital Signatures & Secure Communication Lab', '🔏', 'Sign messages with private key, verify with public key, and demonstrate tamper detection.', false],
  ];

  const u25UnitTitle = (u) => (u25units.find((x) => x.unit === u) || {}).title || '';
  const u25UnitSubtype = (u) => (u25units.find((x) => x.unit === u) || {}).subtype || '';
  const u25Simulations = u25rows.map(([id, unit, topic, title, icon, description, flagship]) => ({
    id, unit, topic, title, icon, description, flagship: Boolean(flagship),
    unitTitle: u25UnitTitle(unit), subtype: u25UnitSubtype(unit)
  }));

  // Helper to determine if U25RMA201 is active
  function isU25Rma(code, simId) {
    const c = String(code || '').toUpperCase();
    const s = String(simId || '').toLowerCase();
    return c.includes('U25RMA201') || c.includes('U25MA201') || c.includes('RMA201') || s.startsWith('u25rma201-') || c.includes('LINEAR ALGEBRA');
  }

  const isU25 = isU25Rma(currentSubjectCode, currentSimId);
  const activeSubject = isU25 ? u25subject : u21subject;
  const activeUnits = isU25 ? u25units : u21units;
  const activeSimulations = isU25 ? u25Simulations : u21Simulations;

  const allSimsMap = new Map();
  u21Simulations.forEach((s) => allSimsMap.set(s.id, s));
  u25Simulations.forEach((s) => allSimsMap.set(s.id, s));

  window.EduverseMACatalog = {
    subject: activeSubject,
    units: activeUnits,
    simulations: activeSimulations,
    u21subject,
    u21units,
    u21Simulations,
    u25subject,
    u25units,
    u25Simulations,
    simulationType: isU25 ? 'linear-algebra-number-theory' : 'engineering-mathematics',
    isU25Rma,
    get: (id) => allSimsMap.get(id) || null,
  };
})();
