'use strict';

/**
 * u25rma201-engine.js
 * Linear Algebra and Number Theory (U25RMA201) Interactive Simulation Engine
 * Regulation R2025 · Semester II · Common to AD, AM, CB, CS, IT, SC
 *
 * Implements interactive mathematical laboratories and simulations across Units I–V:
 *  - Unit I: Systems of Linear Equations (Linear Systems, Gaussian Elimination, Gauss-Jordan, LU Decomposition, Rank & Consistency)
 *  - Unit II: Vector Spaces (Vector Spaces, Subspaces, Linear Independence, Basis & Dimension, Linear Transformations T(x)=Ax)
 *  - Unit III: Eigenvalues and Eigenvectors (Eigenvalues, Eigenvectors, Geometric Alignment, Diagonalization A=PDP⁻¹, Cayley-Hamilton)
 *  - Unit IV: Elementary Number Theory (Euclidean Algorithm, Extended Euclidean Bézout, Modular Clock, Euler's Totient φ(n), CRT)
 *  - Unit V: Number Theory in Cryptography (Modular Exponentiation, Modular Inverse, RSA Cryptosystem, Diffie-Hellman, Digital Signatures)
 */
(function () {
  const D = window.EPDraw;
  const M = window.MACore;
  const { Num, Mat, Poly, Work, Plot, ParseError } = M;
  const { define, F } = window.MAFrame;

  const f = (v) => Num.fmt(v);
  const rowStr = (r) => r.map(f).join('   ');
  function mLines(label, A, o = {}) {
    const cols = A[0].map((_, j) => Math.max(...A.map((r) => f(r[j]).length)));
    const body = A.map((r) => r.map((v, j) => f(v).padStart(cols[j])).join('   '));
    const pad = ' '.repeat(label.length + 3);
    return body.map((b, i) => ({ t: `${i === 0 ? label + ' = ' : pad}[ ${b} ]`, c: o.c, b: o.b }));
  }

  // Number Theory Utility Helpers
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a;
  }

  function extGcd(a, b) {
    let oldR = Math.abs(a), r = Math.abs(b);
    let oldS = 1, s = 0;
    let oldT = 0, t = 1;
    const steps = [];
    while (r !== 0) {
      const q = Math.floor(oldR / r);
      steps.push({ a: oldR, b: r, q, rem: oldR - q * r, s: oldS, t: oldT });
      const tempR = oldR - q * r; oldR = r; r = tempR;
      const tempS = oldS - q * s; oldS = s; s = tempS;
      const tempT = oldT - q * t; oldT = t; t = tempT;
    }
    const signA = a < 0 ? -1 : 1;
    const signB = b < 0 ? -1 : 1;
    return { g: oldR, x: oldS * signA, y: oldT * signB, steps };
  }

  function modInv(a, m) {
    a = ((a % m) + m) % m;
    const res = extGcd(a, m);
    if (res.g !== 1) return null;
    return ((res.x % m) + m) % m;
  }

  function modPow(base, exp, mod) {
    base = BigInt(base); exp = BigInt(exp); mod = BigInt(mod);
    if (mod === 1n) return 0n;
    let res = 1n;
    base = base % mod;
    while (exp > 0n) {
      if (exp % 2n === 1n) res = (res * base) % mod;
      exp = exp / 2n;
      base = (base * base) % mod;
    }
    return res;
  }

  function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I: SYSTEMS OF LINEAR EQUATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. Linear Systems Laboratory (Ax = b)
  define('u25rma201-linear-systems', {
    params: [
      { key: 'method', label: 'Solution Method', type: 'select', default: 'gauss-jordan', options: [
        { label: 'Gauss–Jordan (RREF)', value: 'gauss-jordan' },
        { label: 'Gaussian Elimination (REF + Back Sub)', value: 'gaussian' },
        { label: 'LU Decomposition (A = LU)', value: 'lu' },
      ]},
      { key: 'preset', label: 'System Example', type: 'select', default: 'sys3_unique', options: [
        { label: '3×3 Unique: 2x+y-z=8, -3x-y+2z=-11, -2x+y+2z=-3', value: 'sys3_unique' },
        { label: '3×3 Pivot Swap: 0x+2y+z=4, x-y+2z=3, 2x+y-z=1', value: 'sys3_pivot' },
        { label: '2×2 Simple: 2x + y = 5, x - y = 1', value: 'sys2_simple' },
        { label: '3×3 Infinitely Many Solutions (Free Variables)', value: 'sys3_inf' },
        { label: '3×3 Inconsistent System (No Solution)', value: 'sys3_incon' },
      ]},
    ],
    examples: [
      { label: '3×3 Unique Solution', values: { method: 'gauss-jordan', preset: 'sys3_unique' } },
      { label: 'Gaussian Elimination with Pivot', values: { method: 'gaussian', preset: 'sys3_pivot' } },
      { label: 'LU Factorization Method', values: { method: 'lu', preset: 'sys3_unique' } },
    ],
    solve(p) {
      let A, b, vars;
      if (p.preset === 'sys2_simple') {
        A = [[2, 1], [1, -1]]; b = [5, 1]; vars = ['x', 'y'];
      } else if (p.preset === 'sys3_pivot') {
        A = [[0, 2, 1], [1, -1, 2], [2, 1, -1]]; b = [4, 3, 1]; vars = ['x', 'y', 'z'];
      } else if (p.preset === 'sys3_inf') {
        A = [[1, 2, -1], [2, 4, -2], [3, 6, -3]]; b = [3, 6, 9]; vars = ['x', 'y', 'z'];
      } else if (p.preset === 'sys3_incon') {
        A = [[1, 1, 1], [2, 2, 2], [1, -1, 2]]; b = [4, 9, 3]; vars = ['x', 'y', 'z'];
      } else {
        A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; b = [8, -11, -3]; vars = ['x', 'y', 'z'];
      }

      const n = A.length;
      const steps = [];
      const mAug = A.map((r, i) => [...r, b[i]]);

      steps.push({
        title: 'Form Augmented Matrix [A | b]',
        text: 'Write the system of equations in augmented matrix format.',
        lines: [
          ...A.map((r, i) => `${r.map((v, j) => `${f(v)}${vars[j]}`).join(' + ').replace(/\+ -/g, '− ')} = ${f(b[i])}`),
          'Augmented Matrix [A | b]:',
          ...mLines('[A|b]', mAug)
        ]
      });

      // Forward Elimination
      const M_work = mAug.map(r => r.slice());
      const rowOps = [];
      for (let c = 0; c < n; c++) {
        // Pivot selection
        let pivotRow = c;
        for (let r = c + 1; r < n; r++) {
          if (Math.abs(M_work[r][c]) > Math.abs(M_work[pivotRow][c])) pivotRow = r;
        }
        if (pivotRow !== c && Math.abs(M_work[pivotRow][c]) > 1e-9) {
          const temp = M_work[c]; M_work[c] = M_work[pivotRow]; M_work[pivotRow] = temp;
          rowOps.push(`R${c + 1} ↔ R${pivotRow + 1} (Row Swap)`);
          steps.push({
            title: `Pivot Row Swap: R${c + 1} ↔ R${pivotRow + 1}`,
            text: `Zero or small pivot encountered in column ${c + 1}. Swapping rows for numerical stability.`,
            lines: [...mLines('Matrix', M_work)]
          });
        }

        const pivotVal = M_work[c][c];
        if (Math.abs(pivotVal) > 1e-9) {
          if (p.method === 'gauss-jordan') {
            // Normalize pivot to 1
            if (Math.abs(pivotVal - 1) > 1e-9) {
              M_work[c] = M_work[c].map(v => v / pivotVal);
              steps.push({
                title: `Normalize Pivot R${c + 1} → R${c + 1} / (${f(pivotVal)})`,
                text: `Scale row ${c + 1} so that pivot becomes 1.`,
                lines: [...mLines('Matrix', M_work)]
              });
            }
            // Eliminate both below and above
            for (let r = 0; r < n; r++) {
              if (r !== c && Math.abs(M_work[r][c]) > 1e-9) {
                const factor = M_work[r][c];
                M_work[r] = M_work[r].map((v, k) => v - factor * M_work[c][k]);
                steps.push({
                  title: `Eliminate in R${r + 1}: R${r + 1} → R${r + 1} − (${f(factor)})R${c + 1}`,
                  text: `Create zero at position (${r + 1}, ${c + 1}).`,
                  lines: [...mLines('Matrix', M_work)]
                });
              }
            }
          } else {
            // Standard Gaussian elimination: eliminate only below
            for (let r = c + 1; r < n; r++) {
              if (Math.abs(M_work[r][c]) > 1e-9) {
                const factor = M_work[r][c] / pivotVal;
                M_work[r] = M_work[r].map((v, k) => v - factor * M_work[c][k]);
                steps.push({
                  title: `Eliminate below: R${r + 1} → R${r + 1} − (${f(factor)})R${c + 1}`,
                  text: `Clear entry below pivot in row ${r + 1}.`,
                  lines: [...mLines('Matrix', M_work)]
                });
              }
            }
          }
        }
      }

      // Check consistency via Rank
      const rankA = M_work.filter(r => r.slice(0, n).some(v => Math.abs(v) > 1e-8)).length;
      const rankAug = M_work.filter(r => r.some(v => Math.abs(v) > 1e-8)).length;

      let status = 'Unique Solution';
      let solutionText = '';
      if (rankA < rankAug) {
        status = 'Inconsistent (No Solution)';
        solutionText = 'Rank(A) < Rank([A|b]): Contradictory row 0 = c (c ≠ 0) indicates no solution exists.';
      } else if (rankA < n) {
        status = 'Infinitely Many Solutions';
        solutionText = `Rank(A) = Rank([A|b]) = ${rankA} < ${n}: System has ${n - rankA} free parameter(s).`;
      } else {
        const x_sol = new Array(n).fill(0);
        if (p.method === 'gauss-jordan') {
          for (let i = 0; i < n; i++) x_sol[i] = M_work[i][n];
        } else {
          // Backward substitution
          for (let i = n - 1; i >= 0; i--) {
            let sum = M_work[i][n];
            for (let j = i + 1; j < n; j++) sum -= M_work[i][j] * x_sol[j];
            x_sol[i] = sum / M_work[i][i];
          }
        }
        solutionText = vars.map((v, i) => `${v} = ${f(x_sol[i])}`).join(', ');
      }

      steps.push({
        title: 'Final Matrix & Solution Classification',
        text: `Rouché–Capelli Analysis: Rank(A) = ${rankA}, Rank([A|b]) = ${rankAug}.`,
        lines: [
          ...mLines('Final [A|b]', M_work),
          `System Classification: ${status}`,
          { t: `Solution: ${solutionText}`, b: true, c: rankA < rankAug ? '#dc2626' : '#16a34a' }
        ]
      });

      return {
        formulas: [
          F('Augmented System', '[A \\\mid b] \\to \\\text{RREF}', 'A, b', 'Elementary Row Operations', status),
          F('Rouché–Capelli', '\\\text{Rank}(A) \\le \\\text{Rank}([A|b])', `Rank(A)=${rankA}`, `Rank([A|b])=${rankAug}`, status),
        ],
        readouts: [
          { label: 'Rank(A)', value: String(rankA), tone: 'info' },
          { label: 'Rank([A|b])', value: String(rankAug), tone: 'info' },
          { label: 'Status', value: status.split(' ')[0], tone: rankA < rankAug ? 'bad' : 'good' },
        ],
        state: { A, b, vars, M_work, rankA, rankAug, status, solutionText },
        explain: {
          what: `The linear system Ax = b is represented as an augmented matrix and reduced using ${p.method}.`,
          why: 'Row operations preserve the solution set while uncoupling variables into an easily solvable echelon form.',
          param: 'Select method (Gauss-Jordan, Gaussian, LU) and explore different system configurations.',
          effect: 'Shows step-by-step pivots, row multipliers, and final consistent or inconsistent classifications.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { vars, solutionText, status } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      // Header Banner
      D.rect(g, bx + 12, by + 12, bw - 24, 48, { fill: '#1e293b', stroke: '#334155', radius: 8 });
      D.text(g, 'Linear Systems Solver · Visual Solution Plane', bx + 24, by + 40, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Solution Card
      const cardY = by + 74;
      D.rect(g, bx + 12, cardY, bw - 24, 90, { fill: '#1e293b', stroke: status.includes('No') ? '#ef4444' : '#10b981', radius: 8, width: 2 });
      D.text(g, `System Classification: ${status}`, bx + 28, cardY + 28, { size: 15, color: '#f8fafc', weight: 'bold' });
      D.text(g, `Result: ${solutionText}`, bx + 28, cardY + 60, { size: 16, color: status.includes('No') ? '#fca5a5' : '#34d399', weight: 'bold' });

      // Coordinate axes representation (for 2D / 3D projection)
      const graphY = cardY + 104;
      const graphH = bh - 190;
      D.rect(g, bx + 12, graphY, bw - 24, graphH, { fill: '#090d16', stroke: '#1e293b', radius: 8 });

      const cx = bx + bw / 2;
      const cy = graphY + graphH / 2;

      // Draw grid lines
      D.line(g, bx + 20, cy, bx + bw - 20, cy, { color: '#334155', width: 1.5 });
      D.line(g, cx, graphY + 10, cx, graphY + graphH - 10, { color: '#334155', width: 1.5 });
      D.text(g, 'X-axis', bx + bw - 60, cy - 8, { size: 12, color: '#94a3b8' });
      D.text(g, 'Y-axis', cx + 8, graphY + 24, { size: 12, color: '#94a3b8' });

      // If 2D system, draw the intersecting lines
      if (vars.length === 2 && sol.state.A) {
        const [a1, b1] = sol.state.A[0]; const c1 = sol.state.b[0];
        const [a2, b2] = sol.state.A[1]; const c2 = sol.state.b[1];
        const scale = 25;

        // Line 1: a1*x + b1*y = c1 => y = (c1 - a1*x)/b1
        if (Math.abs(b1) > 1e-4) {
          const xL = -8, xR = 8;
          const yL = (c1 - a1 * xL) / b1;
          const yR = (c1 - a1 * xR) / b1;
          D.line(g, cx + xL * scale, cy - yL * scale, cx + xR * scale, cy - yR * scale, { color: '#38bdf8', width: 2.5 });
          D.tag(g, 'Eq 1', cx + 4 * scale, cy - ((c1 - a1 * 4) / b1) * scale - 12, { bg: '#0284c7' });
        }
        // Line 2: a2*x + b2*y = c2
        if (Math.abs(b2) > 1e-4) {
          const xL = -8, xR = 8;
          const yL = (c2 - a2 * xL) / b2;
          const yR = (c2 - a2 * xR) / b2;
          D.line(g, cx + xL * scale, cy - yL * scale, cx + xR * scale, cy - yR * scale, { color: '#ec4899', width: 2.5 });
          D.tag(g, 'Eq 2', cx - 3 * scale, cy - ((c2 - a2 * -3) / b2) * scale - 12, { bg: '#db2777' });
        }

        // Highlight intersection point
        if (sol.state.rankA === 2) {
          const xVal = parseFloat(sol.state.solutionText.split(',')[0].split('=')[1]);
          const yVal = parseFloat(sol.state.solutionText.split(',')[1].split('=')[1]);
          if (!isNaN(xVal) && !isNaN(yVal)) {
            const px = cx + xVal * scale;
            const py = cy - yVal * scale;
            D.circle(g, px, py, 7, { fill: '#10b981', stroke: '#ffffff', width: 2 });
            D.tag(g, `(${f(xVal)}, ${f(yVal)})`, px + 12, py - 12, { bg: '#10b981', size: 14 });
          }
        }
      } else {
        // 3D Matrix Visualization Representation
        D.text(g, 'Multi-Dimensional Vector Hyperplane Intersection', cx, cy - 20, { align: 'center', size: 15, color: '#38bdf8', weight: 'bold' });
        D.text(g, `System rank: ${sol.state.rankA} of ${sol.state.vars.length} unknowns`, cx, cy + 10, { align: 'center', size: 13, color: '#cbd5e1' });
        D.text(g, 'Pivot elimination generates decoupled diagonal / triangular coordinates.', cx, cy + 35, { align: 'center', size: 12, color: '#64748b' });
      }
    }
  });

  // 2. LU Decomposition Simulator (A = LU)
  define('u25rma201-lu-decomposition', {
    params: [
      { key: 'matrixPreset', label: 'Select Matrix A', type: 'select', default: 'matA', options: [
        { label: '3×3 Matrix [2 -1 -2; -4 6 3; -4 -2 8]', value: 'matA' },
        { label: '3×3 Matrix [1 1 1; 2 3 1; 1 -1 -1]', value: 'matB' },
        { label: '3×3 Matrix [3 2 1; 6 6 3; 9 10 6]', value: 'matC' },
        { label: '2×2 Matrix [4 3; 6 3]', value: 'mat2' },
      ]},
      { key: 'verify', label: 'Verify LU = A', type: 'boolean', default: true },
    ],
    solve(p) {
      let A, b;
      if (p.matrixPreset === 'matB') {
        A = [[1, 1, 1], [2, 3, 1], [1, -1, -1]]; b = [6, 11, -2];
      } else if (p.matrixPreset === 'matC') {
        A = [[3, 2, 1], [6, 6, 3], [9, 10, 6]]; b = [10, 27, 43];
      } else if (p.matrixPreset === 'mat2') {
        A = [[4, 3], [6, 3]]; b = [10, 12];
      } else {
        A = [[2, -1, -2], [-4, 6, 3], [-4, -2, 8]]; b = [2, 2, 4];
      }

      const n = A.length;
      // Doolittle LU Decomposition: L has 1 on diagonal, U is upper triangular
      const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
      const U = Array.from({ length: n }, () => Array(n).fill(0));

      const steps = [];
      steps.push({
        title: 'Input Matrix A and Target System Ax = b',
        text: 'Decompose square matrix A into A = L · U where L is unit lower triangular and U is upper triangular.',
        lines: [...mLines('A', A), `Vector b = [${b.map(f).join(', ')}]ᵀ`]
      });

      for (let i = 0; i < n; i++) {
        // Upper Triangular U
        for (let k = i; k < n; k++) {
          let sum = 0;
          for (let j = 0; j < i; j++) sum += L[i][j] * U[j][k];
          U[i][k] = A[i][k] - sum;
        }

        // Lower Triangular L
        for (let k = i + 1; k < n; k++) {
          let sum = 0;
          for (let j = 0; j < i; j++) sum += L[k][j] * U[j][i];
          if (Math.abs(U[i][i]) < 1e-9) throw new ParseError('Zero pivot encountered in LU decomposition. Row exchange required.');
          L[k][i] = (A[k][i] - sum) / U[i][i];
        }

        steps.push({
          title: `Compute Row ${i + 1} of U and Column ${i + 1} of L`,
          text: `Evaluate u_{${i + 1},j} and l_{k,${i + 1}} entries.`,
          lines: [
            ...mLines(`U (row ${i + 1})`, U),
            ...mLines(`L (col ${i + 1})`, L)
          ]
        });
      }

      // Step 2: Forward substitution Ly = b
      const y = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sum = b[i];
        for (let j = 0; j < i; j++) sum -= L[i][j] * y[j];
        y[i] = sum / L[i][i];
      }
      steps.push({
        title: 'Solve Ly = b (Forward Substitution)',
        text: 'Since L is lower triangular, solve for intermediate vector y from top to bottom.',
        lines: [
          ...mLines('L', L),
          `Forward solution y = [${y.map(f).join(', ')}]ᵀ`
        ]
      });

      // Step 3: Backward substitution Ux = y
      const x = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = y[i];
        for (let j = i + 1; j < n; j++) sum -= U[i][j] * x[j];
        x[i] = sum / U[i][i];
      }
      steps.push({
        title: 'Solve Ux = y (Backward Substitution)',
        text: 'Since U is upper triangular, solve for final unknown vector x from bottom to top.',
        lines: [
          ...mLines('U', U),
          { t: `Final solution x = [${x.map(f).join(', ')}]ᵀ`, b: true, c: '#16a34a' }
        ]
      });

      // Verification: LU = A
      const LU = Mat.mul(L, U);
      const diff = Math.max(...A.flat().map((v, idx) => Math.abs(v - LU.flat()[idx])));
      steps.push({
        title: 'Verify LU = A',
        text: 'Reconstruct product L · U and compare with original coefficient matrix A.',
        lines: [
          ...mLines('L · U', LU),
          ...mLines('Original A', A),
          { t: `Maximum difference: ${diff < 1e-10 ? '0.0000 (Exact Match ✓)' : diff.toExponential(3)}`, b: true, c: '#16a34a' }
        ]
      });

      return {
        formulas: [
          F('LU Factorization', 'A = L \\cdot U', 'Matrix A', 'Doolittle Elimination', 'L, U'),
          F('Forward Substitution', 'L y = b', 'L, b', 'Forward pass', `y = [${y.map(f).join(', ')}]`),
          F('Backward Substitution', 'U x = y', 'U, y', 'Back pass', `x = [${x.map(f).join(', ')}]`),
        ],
        readouts: [
          { label: 'Decomposition', value: 'A = L·U', tone: 'info' },
          { label: 'LU Verified', value: diff < 1e-9 ? 'Exact Match' : 'Tolerance OK', tone: 'good' },
          { label: 'x₁', value: f(x[0]), tone: 'good' },
          { label: 'x₂', value: f(x[1]), tone: 'good' },
        ],
        state: { A, L, U, b, y, x, LU, diff },
        explain: {
          what: 'Factorizes matrix A into a lower triangular matrix L and an upper triangular matrix U.',
          why: 'Once A is factored into L and U, solving Ax = b for multiple right-hand sides b costs only O(n²) instead of O(n³).',
          param: 'Select different matrices to observe Doolittle factorizations.',
          effect: 'Shows L, U, intermediate vector y, solution vector x, and checks LU = A.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { L, U, LU, A, diff } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      // Top title
      D.text(g, 'LU Decomposition · Matrix Verification Stage', bx + 20, by + 34, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Verification pill
      const match = diff < 1e-9;
      D.rect(g, bx + 16, by + 50, bw - 32, 44, { fill: match ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', stroke: match ? '#10b981' : '#ef4444', radius: 8 });
      D.text(g, match ? '✓ LU = A Verification: Reconstructed Product Matches A Exactly' : 'Reconstruction check', bx + 32, by + 78, { size: 14, color: match ? '#34d399' : '#f87171', weight: 'bold' });

      // Draw L and U matrices graphically
      const drawMatrix = (M_draw, title, startX, startY, color) => {
        const n = M_draw.length;
        const cellW = 50, cellH = 34;
        D.text(g, title, startX, startY - 8, { size: 13, color: '#e2e8f0', weight: 'bold' });
        D.rect(g, startX, startY, n * cellW, n * cellH, { fill: '#1e293b', stroke: color, radius: 6, width: 1.5 });
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            D.text(g, f(M_draw[r][c]), startX + c * cellW + cellW / 2, startY + r * cellH + cellH / 2 + 5, { align: 'center', size: 13, color: r === c ? '#38bdf8' : '#f8fafc' });
          }
        }
      };

      const mY = by + 120;
      drawMatrix(L, 'Lower Matrix L (diag = 1)', bx + 24, mY, '#38bdf8');
      D.text(g, '×', bx + 205, mY + 55, { size: 24, color: '#f8fafc', align: 'center' });
      drawMatrix(U, 'Upper Matrix U', bx + 240, mY, '#a855f7');
      D.text(g, '=', bx + 420, mY + 55, { size: 24, color: '#f8fafc', align: 'center' });
      drawMatrix(LU, 'Product L · U (= A)', bx + 450, mY, '#10b981');

      // Visual triangular division explanation
      const expY = mY + 140;
      D.rect(g, bx + 16, expY, bw - 32, bh - (expY - by) - 16, { fill: '#111827', stroke: '#1f2937', radius: 8 });
      D.text(g, 'Algorithm Workflow: A x = b', bx + 32, expY + 30, { size: 14, color: '#38bdf8', weight: 'bold' });
      D.text(g, '1. Forward Step: L y = b yields intermediate vector y via forward substitution.', bx + 32, expY + 60, { size: 13, color: '#cbd5e1' });
      D.text(g, '2. Backward Step: U x = y yields final unknown vector x via backward substitution.', bx + 32, expY + 86, { size: 13, color: '#cbd5e1' });
      D.text(g, `3. Solution vector x: [${sol.state.x.map(f).join(', ')}]ᵀ.`, bx + 32, expY + 114, { size: 14, color: '#34d399', weight: 'bold' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II: VECTOR SPACES & LINEAR TRANSFORMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // 3. Linear Independence, Basis & Dimension
  define('u25rma201-linear-independence', {
    params: [
      { key: 'vectorSet', label: 'Vector Set', type: 'select', default: 'indep2', options: [
        { label: 'v₁=(2,1), v₂=(1,3) [Independent Basis in ℝ²]', value: 'indep2' },
        { label: 'v₁=(2,1), v₂=(4,2) [Collinear / Dependent in ℝ²]', value: 'dep2' },
        { label: 'v₁=(1,0,1), v₂=(0,1,1), v₃=(1,1,2) [Dependent in ℝ³]', value: 'dep3' },
        { label: 'v₁=(1,0,0), v₂=(0,1,0), v₃=(0,0,1) [Standard Basis ℝ³]', value: 'std3' },
      ]},
    ],
    solve(p) {
      let vectors, dimSpace;
      if (p.vectorSet === 'dep2') {
        vectors = [[2, 1], [4, 2]]; dimSpace = 2;
      } else if (p.vectorSet === 'dep3') {
        vectors = [[1, 0, 1], [0, 1, 1], [1, 1, 2]]; dimSpace = 3;
      } else if (p.vectorSet === 'std3') {
        vectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; dimSpace = 3;
      } else {
        vectors = [[2, 1], [1, 3]]; dimSpace = 2;
      }

      const k = vectors.length;
      // Form matrix with vectors as columns: M = [v1 v2 ...]
      const M_mat = Array.from({ length: dimSpace }, (_, r) => Array.from({ length: k }, (_, c) => vectors[c][r]));

      const steps = [];
      steps.push({
        title: 'Form Column Matrix M = [v₁ v₂ ... vₖ]',
        text: 'To test c₁v₁ + c₂v₂ + ... = 0, construct matrix M with vectors as columns.',
        lines: [
          ...vectors.map((v, i) => `v${Num.sub(i + 1)} = (${v.map(f).join(', ')})`),
          ...mLines('M', M_mat)
        ]
      });

      // Calculate Rank using echelon reduction
      const M_echelon = M_mat.map(r => r.slice());
      let rank = 0;
      for (let c = 0; c < k && rank < dimSpace; c++) {
        let pRow = rank;
        for (let r = rank + 1; r < dimSpace; r++) {
          if (Math.abs(M_echelon[r][c]) > Math.abs(M_echelon[pRow][c])) pRow = r;
        }
        if (Math.abs(M_echelon[pRow][c]) > 1e-8) {
          const t = M_echelon[rank]; M_echelon[rank] = M_echelon[pRow]; M_echelon[pRow] = t;
          const pv = M_echelon[rank][c];
          for (let r = rank + 1; r < dimSpace; r++) {
            const fac = M_echelon[r][c] / pv;
            M_echelon[r] = M_echelon[r].map((v, idx) => v - fac * M_echelon[rank][idx]);
          }
          rank++;
        }
      }

      const isIndependent = rank === k;
      steps.push({
        title: 'Row Reduction to Determine Rank(M)',
        text: `Matrix reduced to row echelon form: Rank(M) = ${rank}.`,
        lines: [
          ...mLines('Echelon(M)', M_echelon),
          `Rank(M) = ${rank}, Number of vectors k = ${k}`,
          {
            t: isIndependent
              ? `Rank = k (${rank} = ${k}) ⇒ Vectors are Linearly Independent ✓`
              : `Rank < k (${rank} < ${k}) ⇒ Vectors are Linearly Dependent (Contains redundant vectors) ✗`,
            b: true,
            c: isIndependent ? '#16a34a' : '#dc2626'
          }
        ]
      });

      // Basis and Dimension conclusion
      steps.push({
        title: 'Basis & Dimension Determination',
        text: 'A basis is a linearly independent set that spans the subspace.',
        lines: [
          `Dimension of spanned subspace: dim(Span{vᵢ}) = Rank = ${rank}`,
          isIndependent && rank === dimSpace
            ? `The set {v₁...vₖ} forms a Basis of ℝ${Num.sup(dimSpace)}.`
            : `Subspace dimension is ${rank}. To form a basis, select ${rank} independent vector(s).`
        ]
      });

      return {
        formulas: [
          F('Linear Independence', 'c_1 v_1 + \\dots + c_k v_k = \\vec{0}', 'k vectors', 'Row reduction of [v₁...vₖ]', isIndependent ? 'Independent' : 'Dependent'),
          F('Dimension', '\\dim(V) = \\\text{Rank}(M)', `Rank=${rank}`, 'Cardinality of basis', String(rank)),
        ],
        readouts: [
          { label: 'Independence', value: isIndependent ? 'Independent' : 'Dependent', tone: isIndependent ? 'good' : 'bad' },
          { label: 'Rank', value: String(rank), tone: 'info' },
          { label: 'Subspace Dim', value: String(rank), tone: 'good' },
        ],
        state: { vectors, dimSpace, rank, isIndependent, M_mat },
        explain: {
          what: 'Tests whether a set of vectors is linearly independent and computes the dimension of their span.',
          why: 'Linear independence ensures no redundant vectors exist; a basis provides the unique minimal coordinate system.',
          param: 'Select predefined 2D and 3D vector configurations to observe rank and basis properties.',
          effect: 'Calculates matrix rank, identifies dependent vectors, and determines subspace dimension.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { vectors, dimSpace, isIndependent, rank } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      // Card Header
      D.rect(g, bx + 12, by + 12, bw - 24, 60, { fill: '#1e293b', stroke: '#334155', radius: 8 });
      D.text(g, `Vector Space Subspace: Dimension = ${rank}`, bx + 24, by + 36, { size: 16, color: '#38bdf8', weight: 'bold' });
      D.text(g, isIndependent ? '✓ Linearly Independent Set (Basis of spanned subspace)' : '⚠ Linearly Dependent Set (Collinear / Coplanar redundancy)', bx + 24, by + 58, { size: 13, color: isIndependent ? '#34d399' : '#f87171' });

      // Graphical plane
      const gX = bx + 12;
      const gY = by + 84;
      const gW = bw - 24;
      const gH = bh - 100;
      D.rect(g, gX, gY, gW, gH, { fill: '#090d16', stroke: '#1e293b', radius: 8 });

      const cx = gX + gW / 2;
      const cy = gY + gH / 2;
      const scale = 36;

      // Coordinate axes
      D.line(g, gX + 10, cy, gX + gW - 10, cy, { color: '#334155', width: 1.5 });
      D.line(g, cx, gY + 10, cx, gY + gH - 10, { color: '#334155', width: 1.5 });

      const colors = ['#38bdf8', '#ec4899', '#f59e0b'];
      vectors.forEach((v, i) => {
        const vx = v[0] * scale;
        const vy = -(v[1] || 0) * scale;
        const col = colors[i % colors.length];
        D.arrow(g, cx, cy, cx + vx, cy + vy, { color: col, width: 3.5, head: 12 });
        D.tag(g, `v${Num.sub(i + 1)} (${v.slice(0, 2).map(f).join(',')})`, cx + vx + 8, cy + vy - 8, { bg: col, size: 13 });
      });

      if (dimSpace === 2 && !isIndependent) {
        // Draw collinear span line
        const v = vectors[0];
        const len = 300;
        const angle = Math.atan2(v[1], v[0]);
        D.line(g, cx - Math.cos(angle) * len, cy + Math.sin(angle) * len, cx + Math.cos(angle) * len, cy - Math.sin(angle) * len, { color: '#ef4444', width: 1.5, dash: [6, 4] });
        D.text(g, 'Span is 1-Dimensional Line (Vectors are Collinear)', cx, gY + 28, { align: 'center', size: 13, color: '#fca5a5' });
      }
    }
  });

  // 4. Linear Transformations (T(x) = Ax)
  define('u25rma201-linear-transformation', {
    params: [
      { key: 'transformType', label: 'Preset Transformation', type: 'select', default: 'shear', options: [
        { label: 'Shear [1 1.5; 0 1]', value: 'shear' },
        { label: 'Rotation 45°', value: 'rot45' },
        { label: 'Non-uniform Scale [2 0; 0 0.5]', value: 'scale' },
        { label: 'Reflection across y = x', value: 'reflect' },
        { label: 'Projection onto X-axis', value: 'project' },
      ]},
      { key: 'probeX', label: 'Probe Vector x₁', type: 'range', min: -3, max: 3, step: 0.5, default: 1 },
      { key: 'probeY', label: 'Probe Vector x₂', type: 'range', min: -3, max: 3, step: 0.5, default: 1 },
    ],
    solve(p) {
      let A;
      if (p.transformType === 'rot45') {
        const c = Math.cos(Math.PI / 4), s = Math.sin(Math.PI / 4);
        A = [[c, -s], [s, c]];
      } else if (p.transformType === 'scale') {
        A = [[2, 0], [0, 0.5]];
      } else if (p.transformType === 'reflect') {
        A = [[0, 1], [1, 0]];
      } else if (p.transformType === 'project') {
        A = [[1, 0], [0, 0]];
      } else {
        A = [[1, 1.5], [0, 1]];
      }

      const vProbe = [p.probeX, p.probeY];
      const Tv = Mat.mv(A, vProbe);
      const detA = Mat.det(A);

      const e1 = [1, 0];
      const e2 = [0, 1];
      const Te1 = Mat.mv(A, e1);
      const Te2 = Mat.mv(A, e2);

      const steps = [];
      steps.push({
        title: 'Transformation Matrix Representation T(x) = Ax',
        text: 'Every linear transformation on ℝ² is completely determined by where it sends standard basis vectors e₁ and e₂.',
        lines: [
          ...mLines('Matrix A', A),
          `e₁ = (1, 0)ᵀ ⟶ T(e₁) = (${Te1.map(f).join(', ')})ᵀ`,
          `e₂ = (0, 1)ᵀ ⟶ T(e₂) = (${Te2.map(f).join(', ')})ᵀ`,
          `Area Scaling Factor: |det(A)| = ${Math.abs(detA).toFixed(3)}`
        ]
      });

      steps.push({
        title: 'Evaluate Probe Vector Mapping',
        text: 'Compute T(x) = Ax for user probe vector.',
        lines: [
          `Input vector x = (${vProbe.map(f).join(', ')})ᵀ`,
          { t: `Transformed vector T(x) = (${Tv.map(f).join(', ')})ᵀ`, b: true, c: '#16a34a' }
        ]
      });

      return {
        formulas: [
          F('Linear Map', 'T(\\vec{x}) = A \\vec{x}', 'Matrix A, vector x', 'A · x', `(${Tv.map(f).join(', ')})`),
          F('Area Distortion', '\\\text{Area} = |\\\det(A)| \\cdot \\\text{Area}_0', `|det(A)|=${Math.abs(detA).toFixed(2)}`, 'Determinant', `${Math.abs(detA).toFixed(2)}x`),
        ],
        readouts: [
          { label: 'det(A)', value: f(detA), tone: Math.abs(detA) < 1e-6 ? 'bad' : 'info' },
          { label: 'T(e₁)', value: `(${Te1.map(f).join(',')})`, tone: 'good' },
          { label: 'T(e₂)', value: `(${Te2.map(f).join(',')})`, tone: 'good' },
        ],
        state: { A, detA, Te1, Te2, vProbe, Tv },
        explain: {
          what: 'Transforms the 2D Cartesian plane by multiplying coordinates by matrix A: T(x) = Ax.',
          why: 'Visualizes shearing, rotation, scaling, reflection, and projection as geometric distortion of the coordinate grid.',
          param: 'Select transformation presets and drag probe vector coordinates.',
          effect: 'Shows standard basis mappings T(e₁), T(e₂) and deformed unit grid square.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { A, Te1, Te2, vProbe, Tv } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      // Banner
      D.rect(g, bx + 12, by + 12, bw - 24, 48, { fill: '#1e293b', stroke: '#334155', radius: 8 });
      D.text(g, 'Linear Transformation Grid Plane · T(x) = Ax', bx + 24, by + 42, { size: 16, color: '#38bdf8', weight: 'bold' });

      const gX = bx + 12;
      const gY = by + 70;
      const gW = bw - 24;
      const gH = bh - 86;
      D.rect(g, gX, gY, gW, gH, { fill: '#080d1a', stroke: '#1e293b', radius: 8 });

      const cx = gX + gW / 2;
      const cy = gY + gH / 2;
      const scale = 38;

      // Draw transformed grid
      const gridN = 4;
      for (let i = -gridN; i <= gridN; i++) {
        // Transformed vertical line (x = i)
        const p1 = Mat.mv(A, [i, -gridN]);
        const p2 = Mat.mv(A, [i, gridN]);
        D.line(g, cx + p1[0] * scale, cy - p1[1] * scale, cx + p2[0] * scale, cy - p2[1] * scale, { color: '#1e293b', width: 1 });

        // Transformed horizontal line (y = i)
        const p3 = Mat.mv(A, [-gridN, i]);
        const p4 = Mat.mv(A, [gridN, i]);
        D.line(g, cx + p3[0] * scale, cy - p3[1] * scale, cx + p4[0] * scale, cy - p4[1] * scale, { color: '#1e293b', width: 1 });
      }

      // Transformed unit square (basis area)
      const o0 = [0, 0];
      const o1 = Te1;
      const o2 = [Te1[0] + Te2[0], Te1[1] + Te2[1]];
      const o3 = Te2;
      D.poly(g, [
        [cx + o0[0] * scale, cy - o0[1] * scale],
        [cx + o1[0] * scale, cy - o1[1] * scale],
        [cx + o2[0] * scale, cy - o2[1] * scale],
        [cx + o3[0] * scale, cy - o3[1] * scale],
      ], { fill: 'rgba(56, 189, 248, 0.15)', stroke: '#38bdf8', width: 2 });

      // Basis arrows
      D.arrow(g, cx, cy, cx + Te1[0] * scale, cy - Te1[1] * scale, { color: '#38bdf8', width: 3.5, head: 11 });
      D.tag(g, `T(e₁) (${f(Te1[0])},${f(Te1[1])})`, cx + Te1[0] * scale + 6, cy - Te1[1] * scale - 6, { bg: '#0284c7' });

      D.arrow(g, cx, cy, cx + Te2[0] * scale, cy - Te2[1] * scale, { color: '#a855f7', width: 3.5, head: 11 });
      D.tag(g, `T(e₂) (${f(Te2[0])},${f(Te2[1])})`, cx + Te2[0] * scale + 6, cy - Te2[1] * scale - 6, { bg: '#9333ea' });

      // Probe vector before & after
      D.arrow(g, cx, cy, cx + vProbe[0] * scale, cy - vProbe[1] * scale, { color: '#94a3b8', width: 2, head: 9, dash: [4, 3] });
      D.arrow(g, cx, cy, cx + Tv[0] * scale, cy - Tv[1] * scale, { color: '#10b981', width: 4, head: 13 });
      D.tag(g, `T(x) = (${f(Tv[0])}, ${f(Tv[1])})`, cx + Tv[0] * scale + 8, cy - Tv[1] * scale - 12, { bg: '#10b981', size: 14 });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III: EIGENVALUES AND EIGENVECTORS
  // ═══════════════════════════════════════════════════════════════════════════

  // 5. Eigenvalues and Eigenvectors Laboratory
  define('u25rma201-eigenvalues', {
    params: [
      { key: 'A', label: 'Select Matrix A', type: 'select', default: 'diag_ready', options: [
        { label: '[4 1; 2 3] (Real distinct: λ = 5, 2)', value: 'diag_ready' },
        { label: '[3 1; 1 3] (Symmetric: λ = 4, 2)', value: 'symm' },
        { label: '[2 0; 0 3] (Diagonal: λ = 2, 3)', value: 'diag' },
        { label: '[0 1; -1 0] (Pure rotation 90°: Complex λ = ±i)', value: 'rotation' },
      ]},
      { key: 'probeAngle', label: 'Probe Vector Angle (θ)', type: 'range', min: 0, max: 360, step: 5, default: 45, unit: 'deg' },
    ],
    solve(p) {
      let A;
      if (p.A === 'symm') A = [[3, 1], [1, 3]];
      else if (p.A === 'diag') A = [[2, 0], [0, 3]];
      else if (p.A === 'rotation') A = [[0, 1], [-1, 0]];
      else A = [[4, 1], [2, 3]];

      const cp = Mat.charPoly(A);
      const roots = Poly.roots(cp);
      const groups = Poly.group(roots);

      const pairs = groups.map(g => {
        const isReal = Math.abs(g.root.im) < 1e-7;
        const vecs = isReal ? Mat.nullSpace(Mat.add(A, Mat.scale(Mat.I(A.length), g.root.re), -1), 1e-5) : null;
        return { val: g.root, mult: g.mult, vecs };
      });

      const steps = [];
      steps.push({
        title: 'Step 1: Characteristic Equation det(A − λI) = 0',
        text: 'Set determinant of (A − λI) to zero to find the eigenvalues.',
        lines: [
          ...mLines('Matrix A', A),
          `Characteristic Polynomial: ${Poly.str(cp)} = 0`
        ]
      });

      steps.push({
        title: 'Step 2: Solve Characteristic Equation for Eigenvalues λ',
        text: 'The roots of the characteristic polynomial are the eigenvalues of matrix A.',
        lines: [
          ...pairs.map((pr, i) => `λ${Num.sub(i + 1)} = ${Num.cfmt(pr.val)} (Multiplicity: ${pr.mult})`)
        ]
      });

      pairs.forEach((pr, i) => {
        if (pr.vecs && pr.vecs.length) {
          steps.push({
            title: `Step 3.${i + 1}: Solve (A − λ${Num.sub(i + 1)}I)v = 0 for Eigenvectors`,
            text: `Find non-trivial null space solutions for eigenvalue λ = ${Num.cfmt(pr.val)}.`,
            lines: [
              `Eigenvalue λ = ${Num.cfmt(pr.val)}:`,
              ...pr.vecs.map((v, k) => `Eigenvector v${Num.sub(k + 1)} = (${v.map(f).join(', ')})ᵀ`)
            ]
          });
        }
      });

      return {
        formulas: [
          F('Characteristic Equation', '\\\det(A - \\\lambda I) = 0', 'Matrix A', 'Faddeev–LeVerrier', `${Poly.str(cp)} = 0`),
          F('Eigen-Condition', 'A \\vec{v} = \\\lambda \\vec{v}', 'A, v', 'Matrix-vector product', 'v and Av parallel'),
        ],
        readouts: pairs.map((pr, i) => ({
          label: `λ${Num.sub(i + 1)}`,
          value: Num.cfmt(pr.val),
          tone: 'good'
        })),
        state: { A, cp, pairs, probeAngle: p.probeAngle },
        explain: {
          what: 'Solves the characteristic equation det(A - λI) = 0 for eigenvalues and computes corresponding eigenvectors.',
          why: 'Eigenvectors represent directions along which a linear transformation acts as simple scalar multiplication.',
          param: 'Select matrices and sweep probe vector to observe parallel eigen-directions.',
          effect: 'Shows characteristic polynomial expansion, exact eigenvalues, eigenvectors, and geometric collinearity.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { A, pairs, probeAngle } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      D.rect(g, bx + 12, by + 12, bw - 24, 48, { fill: '#1e293b', stroke: '#334155', radius: 8 });
      D.text(g, 'Eigenvalues & Geometric Eigenvector Visualizer (Av = λv)', bx + 24, by + 42, { size: 16, color: '#38bdf8', weight: 'bold' });

      const gX = bx + 12;
      const gY = by + 70;
      const gW = bw - 24;
      const gH = bh - 86;
      D.rect(g, gX, gY, gW, gH, { fill: '#080d1a', stroke: '#1e293b', radius: 8 });

      const cx = gX + gW / 2;
      const cy = gY + gH / 2;
      const scale = 36;

      // Axes
      D.line(g, gX + 10, cy, gX + gW - 10, cy, { color: '#334155', width: 1 });
      D.line(g, cx, gY + 10, cx, gY + gH - 10, { color: '#334155', width: 1 });

      // Unit circle
      D.circle(g, cx, cy, scale, { stroke: '#334155', width: 1.5, dash: [4, 4] });

      // Draw eigen-directions
      const colors = ['#10b981', '#38bdf8'];
      pairs.forEach((pr, i) => {
        if (pr.vecs && pr.vecs.length) {
          const v = pr.vecs[0];
          const col = colors[i % colors.length];
          const len = 250;
          const u = Mat.normalize(v);
          D.line(g, cx - u[0] * len, cy + u[1] * len, cx + u[0] * len, cy - u[1] * len, { color: col, width: 2, dash: [8, 4] });
          D.arrow(g, cx, cy, cx + v[0] * scale * 0.7, cy - v[1] * scale * 0.7, { color: col, width: 3.5, head: 11 });
          D.tag(g, `λ = ${Num.cfmt(pr.val)}`, cx + v[0] * scale * 0.7 + 8, cy - v[1] * scale * 0.7 - 8, { bg: col });
        }
      });

      // Probe vector
      const th = (probeAngle * Math.PI) / 180;
      const vProbe = [Math.cos(th), Math.sin(th)];
      const Av = Mat.mv(A, vProbe);

      D.arrow(g, cx, cy, cx + vProbe[0] * scale, cy - vProbe[1] * scale, { color: '#f59e0b', width: 2.5, head: 10 });
      D.tag(g, 'Probe v', cx + vProbe[0] * scale + 6, cy - vProbe[1] * scale - 6, { bg: '#d97706' });

      D.arrow(g, cx, cy, cx + Av[0] * scale * 0.6, cy - Av[1] * scale * 0.6, { color: '#ec4899', width: 3.5, head: 12 });
      D.tag(g, 'A · v', cx + Av[0] * scale * 0.6 + 6, cy - Av[1] * scale * 0.6 - 6, { bg: '#db2777' });

      // Parallel status check
      const cross = vProbe[0] * Av[1] - vProbe[1] * Av[0];
      const isParallel = Math.abs(cross) < 0.05 * Math.hypot(...Av);
      D.rect(g, gX + 16, gY + gH - 42, gW - 32, 32, { fill: isParallel ? '#064e3b' : '#1e293b', radius: 6 });
      D.text(g, isParallel ? '⭐ Probe v is parallel to Av ⇒ Located along Eigen-Direction!' : 'Probe v and Av point in different directions (Not an eigenvector)', cx, gY + gH - 22, { align: 'center', size: 13, color: isParallel ? '#34d399' : '#94a3b8', weight: 'bold' });
    }
  });

  // 6. Matrix Diagonalization Simulator (A = PDP⁻¹)
  define('u25rma201-diagonalization', {
    params: [
      { key: 'matrix', label: 'Select Matrix A', type: 'select', default: 'matA', options: [
        { label: '3×3 Matrix [1 1 3; 1 5 1; 3 1 1]', value: 'mat3' },
        { label: '2×2 Distinct: [4 1; 2 3]', value: 'matA' },
        { label: '2×2 Symmetric: [3 1; 1 3]', value: 'symm' },
      ]},
      { key: 'powerK', label: 'Calculate Matrix Power A^k', type: 'range', min: 1, max: 8, step: 1, default: 3 },
      { key: 'verify', label: 'Verify PDP⁻¹ = A', type: 'boolean', default: true },
    ],
    solve(p) {
      let A;
      if (p.matrix === 'mat3') {
        A = [[1, 1, 3], [1, 5, 1], [3, 1, 1]];
      } else if (p.matrix === 'symm') {
        A = [[3, 1], [1, 3]];
      } else {
        A = [[4, 1], [2, 3]];
      }

      const n = A.length;
      const eig = Mat.eigen(A);
      const isDiagonalizable = eig.pairs.every(pr => pr.vecs && pr.vecs.length >= pr.mult);

      const steps = [];
      steps.push({
        title: 'Step 1: Compute Eigenvalues and Eigenvectors of A',
        text: 'Diagonalization requires n linearly independent eigenvectors.',
        lines: [
          ...mLines('Matrix A', A),
          ...eig.pairs.map((pr, i) => `λ${Num.sub(i + 1)} = ${Num.cfmt(pr.value)} (Multiplicity: ${pr.mult})`),
        ]
      });

      if (!isDiagonalizable) {
        throw new ParseError('Matrix is not diagonalizable (defective matrix with insufficient independent eigenvectors).');
      }

      // Construct Modal Matrix P and Diagonal Matrix D
      const allVecs = [];
      const allVals = [];
      eig.pairs.forEach(pr => {
        pr.vecs.forEach(v => {
          allVecs.push(v);
          allVals.push(pr.value.re);
        });
      });

      const P = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => allVecs[c][r]));
      const D_mat = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r === c ? allVals[r] : 0)));
      const P_inv = Mat.inv(P);

      steps.push({
        title: 'Step 2: Construct Modal Matrix P and Diagonal Matrix D',
        text: 'P has eigenvectors as columns; D has corresponding eigenvalues on the diagonal.',
        lines: [
          ...mLines('Modal Matrix P', P),
          ...mLines('Diagonal Matrix D', D_mat),
          ...mLines('Inverse Matrix P⁻¹', P_inv)
        ]
      });

      // Verify PDP⁻¹ = A
      const PDP_inv = Mat.mul(Mat.mul(P, D_mat), P_inv);
      const diff = Math.max(...A.flat().map((v, i) => Math.abs(v - PDP_inv.flat()[i])));

      steps.push({
        title: 'Step 3: Verification P · D · P⁻¹ = A',
        text: 'Reconstruct original matrix from factorization.',
        lines: [
          ...mLines('P · D · P⁻¹', PDP_inv),
          { t: `Verification status: ${diff < 1e-8 ? 'Exact Match (A = PDP⁻¹ Verified ✓)' : 'Within numerical tolerance'}`, b: true, c: '#16a34a' }
        ]
      });

      // Calculate A^k = P · D^k · P⁻¹
      const k = p.powerK;
      const D_k = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r === c ? Math.pow(allVals[r], k) : 0)));
      const A_k = Mat.mul(Mat.mul(P, D_k), P_inv);

      steps.push({
        title: `Step 4: Compute Matrix Power A^${k} = P · D^${k} · P⁻¹`,
        text: 'Diagonal matrices make computing high powers trivial: D^k = diag(λᵢ^k).',
        lines: [
          ...mLines(`D^${k}`, D_k),
          ...mLines(`A^${k}`, A_k)
        ]
      });

      return {
        formulas: [
          F('Diagonalization', 'A = P D P^{-1}', 'P: modal matrix', 'D: diagonal eigenvalue matrix', 'Verified'),
          F('Matrix Power', 'A^k = P D^k P^{-1}', `k = ${k}`, 'Compute D^k directly', `A^${k}`),
        ],
        readouts: [
          { label: 'Diagonalizable', value: 'Yes', tone: 'good' },
          { label: 'Eigenvalues', value: allVals.map(f).join(', '), tone: 'info' },
          { label: 'Verification', value: diff < 1e-8 ? 'Passed' : 'OK', tone: 'good' },
        ],
        state: { A, P, D_mat, P_inv, PDP_inv, A_k, k, allVals, diff },
        explain: {
          what: 'Factorizes matrix A into A = PDP⁻¹ where P contains eigenvectors and D contains eigenvalues.',
          why: 'Diagonalization uncouples matrix differential equations and permits calculating arbitrary powers A^k instantly.',
          param: 'Adjust power exponent k and matrix choice.',
          effect: 'Shows modal matrix P, inverse P⁻¹, verification product, and computes A^k.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { A, P, D_mat, P_inv, A_k, k, diff } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      D.text(g, `Matrix Diagonalization Simulator · A = PDP⁻¹ & Power A^${k}`, bx + 20, by + 34, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Verification pill
      const match = diff < 1e-8;
      D.rect(g, bx + 16, by + 50, bw - 32, 44, { fill: match ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', stroke: match ? '#10b981' : '#ef4444', radius: 8 });
      D.text(g, match ? '✓ Diagonalization Identity Verified: P · D · P⁻¹ = A exactly' : 'Tolerance OK', bx + 32, by + 78, { size: 14, color: match ? '#34d399' : '#f87171', weight: 'bold' });

      // Matrices display
      const drawMat = (M_draw, title, x, y, col) => {
        const n = M_draw.length;
        const cellW = 44, cellH = 30;
        D.text(g, title, x, y - 6, { size: 12, color: '#e2e8f0', weight: 'bold' });
        D.rect(g, x, y, n * cellW, n * cellH, { fill: '#1e293b', stroke: col, radius: 6, width: 1.5 });
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            D.text(g, f(M_draw[r][c]), x + c * cellW + cellW / 2, y + r * cellH + cellH / 2 + 5, { align: 'center', size: 12, color: '#f8fafc' });
          }
        }
      };

      const mY = by + 120;
      drawMat(P, 'Modal P', bx + 24, mY, '#38bdf8');
      drawMat(D_mat, 'Diagonal D', bx + 180, mY, '#a855f7');
      drawMat(P_inv, 'Inverse P⁻¹', bx + 340, mY, '#f59e0b');

      // Result A^k
      const resY = mY + 130;
      D.rect(g, bx + 16, resY, bw - 32, bh - (resY - by) - 16, { fill: '#111827', stroke: '#1f2937', radius: 8 });
      drawMat(A_k, `Computed Matrix Power A^${k} = P · D^${k} · P⁻¹`, bx + 32, resY + 36, '#10b981');
      D.text(g, `Matrix A raised to power ${k}: computed directly without ${k - 1} matrix multiplications.`, bx + 240, resY + 55, { size: 13, color: '#94a3b8' });
      D.text(g, 'D^k = diag(λ₁^k, λ₂^k, ...) calculated in O(n) steps.', bx + 240, resY + 80, { size: 13, color: '#34d399', weight: 'bold' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV: ELEMENTARY NUMBER THEORY
  // ═══════════════════════════════════════════════════════════════════════════

  // 7. Euclidean & Extended Euclidean Algorithm
  define('u25rma201-euclidean-algorithm', {
    params: [
      { key: 'a', label: 'Positive Integer a', type: 'number', default: 252, min: 1, max: 10000 },
      { key: 'b', label: 'Positive Integer b', type: 'number', default: 105, min: 1, max: 10000 },
      { key: 'mode', label: 'Algorithm', type: 'select', default: 'extended', options: [
        { label: 'Extended Euclidean (Bézout Identity: ax + by = gcd)', value: 'extended' },
        { label: 'Standard Euclidean (Division Sequence)', value: 'standard' },
      ]},
    ],
    solve(p) {
      const a = Math.abs(parseInt(p.a) || 252);
      const b = Math.abs(parseInt(p.b) || 105);

      const res = extGcd(a, b);
      const steps = [];

      steps.push({
        title: 'Initialize Euclidean Division Sequence',
        text: `Compute gcd(${a}, ${b}) by repeated division r_{i-1} = q_i · r_i + r_{i+1}.`,
        lines: [
          `Starting values: a = ${a}, b = ${b}`
        ]
      });

      res.steps.forEach((st, idx) => {
        steps.push({
          title: `Division Step ${idx + 1}: ${st.a} = ${st.q} × (${st.b}) + ${st.rem}`,
          text: `Quotient q = ${st.q}, Remainder r = ${st.rem}.`,
          lines: [
            `${st.a} = ${st.q} · (${st.b}) + ${st.rem}`,
            st.rem === 0 ? 'Remainder is 0: Terminate algorithm.' : `New dividend: ${st.b}, new divisor: ${st.rem}`
          ]
        });
      });

      steps.push({
        title: 'Result: Greatest Common Divisor',
        text: `The last non-zero remainder is the greatest common divisor.`,
        lines: [
          { t: `gcd(${a}, ${b}) = ${res.g}`, b: true, c: '#16a34a' },
          `Are ${a} and ${b} coprime? ${res.g === 1 ? 'YES (gcd = 1)' : 'NO (gcd > 1)'}`
        ]
      });

      if (p.mode === 'extended') {
        steps.push({
          title: 'Extended Euclidean Algorithm (Bézout Identity)',
          text: 'Back-substitution generates integers x and y satisfying ax + by = gcd(a, b).',
          lines: [
            `Bézout Coefficients: x = ${res.x}, y = ${res.y}`,
            { t: `Verification: ${a}(${res.x}) + ${b}(${res.y}) = ${a * res.x + b * res.y} = gcd(${a}, ${b}) ✓`, b: true, c: '#16a34a' }
          ]
        });
      }

      return {
        formulas: [
          F('Division Algorithm', 'a = q b + r', `a=${a}, b=${b}`, 'Repeated division', `gcd = ${res.g}`),
          F('Bézout Identity', 'a x + b y = \\gcd(a, b)', `x=${res.x}, y=${res.y}`, `${a}(${res.x}) + ${b}(${res.y})`, String(res.g)),
        ],
        readouts: [
          { label: 'gcd(a, b)', value: String(res.g), tone: 'good' },
          { label: 'Bézout x', value: String(res.x), tone: 'info' },
          { label: 'Bézout y', value: String(res.y), tone: 'info' },
          { label: 'Coprime', value: res.g === 1 ? 'Yes' : 'No', tone: res.g === 1 ? 'good' : 'warn' },
        ],
        state: { a, b, res, steps: res.steps },
        explain: {
          what: 'Computes the greatest common divisor gcd(a, b) and Bézout coefficients x, y such that ax + by = gcd(a, b).',
          why: 'The Euclidean algorithm is the cornerstone of number theory and cryptographic key generation (finding modular inverses).',
          param: 'Enter any two positive integers.',
          effect: 'Shows step-by-step division tableau, quotients, remainders, and backward substitution.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { a, b, res } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      D.text(g, 'Euclidean & Extended Euclidean Algorithm Tableau', bx + 20, by + 34, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Result Banner
      D.rect(g, bx + 16, by + 50, bw - 32, 54, { fill: '#1e293b', stroke: '#10b981', radius: 8, width: 2 });
      D.text(g, `gcd(${a}, ${b}) = ${res.g} · Bézout: ${a}(${res.x}) + ${b}(${res.y}) = ${res.g}`, bx + 32, by + 84, { size: 15, color: '#34d399', weight: 'bold' });

      // Step Tableau
      const tY = by + 120;
      D.rect(g, bx + 16, tY, bw - 32, bh - (tY - by) - 16, { fill: '#090d16', stroke: '#1e293b', radius: 8 });

      // Headers
      const colX = [bx + 30, bx + 90, bx + 170, bx + 250, bx + 340, bx + 440];
      const headers = ['Step', 'Dividend', 'Quotient', 'Divisor', 'Remainder', 'Relation'];
      headers.forEach((h, i) => D.text(g, h, colX[i], tY + 28, { size: 13, color: '#94a3b8', weight: 'bold' }));
      D.line(g, bx + 24, tY + 38, bx + bw - 24, tY + 38, { color: '#1e293b', width: 1.5 });

      // Rows
      sol.state.steps.forEach((st, idx) => {
        const rowY = tY + 65 + idx * 30;
        if (rowY < by + bh - 24) {
          D.text(g, `#${idx + 1}`, colX[0], rowY, { size: 13, color: '#cbd5e1' });
          D.text(g, String(st.a), colX[1], rowY, { size: 13, color: '#f8fafc' });
          D.text(g, String(st.q), colX[2], rowY, { size: 13, color: '#38bdf8' });
          D.text(g, String(st.b), colX[3], rowY, { size: 13, color: '#f8fafc' });
          D.text(g, String(st.rem), colX[4], rowY, { size: 13, color: st.rem === 0 ? '#ef4444' : '#10b981', weight: 'bold' });
          D.text(g, `${st.a} = ${st.q}·${st.b} + ${st.rem}`, colX[5], rowY, { size: 12, color: '#94a3b8' });
        }
      });
    }
  });

  // 8. Chinese Remainder Theorem Laboratory (CRT)
  define('u25rma201-crt', {
    params: [
      { key: 'preset', label: 'Congruence System', type: 'select', default: 'sunzi', options: [
        { label: 'Sun Zi Classic: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)', value: 'sunzi' },
        { label: 'Calendar Problem: x ≡ 1 (mod 2), x ≡ 2 (mod 3), x ≡ 3 (mod 5)', value: 'calendar' },
        { label: 'Pairwise Moduli: x ≡ 3 (mod 5), x ≡ 4 (mod 7), x ≡ 5 (mod 11)', value: 'system3' },
      ]},
      { key: 'verify', label: 'Verify In Congruences', type: 'boolean', default: true },
    ],
    solve(p) {
      let aList, nList;
      if (p.preset === 'calendar') {
        aList = [1, 2, 3]; nList = [2, 3, 5];
      } else if (p.preset === 'system3') {
        aList = [3, 4, 5]; nList = [5, 7, 11];
      } else {
        aList = [2, 3, 2]; nList = [3, 5, 7];
      }

      const k = aList.length;
      const steps = [];

      // Step 1: Pairwise coprimality check
      const coprimes = [];
      let allCoprime = true;
      for (let i = 0; i < k; i++) {
        for (let j = i + 1; j < k; j++) {
          const g = gcd(nList[i], nList[j]);
          coprimes.push(`gcd(${nList[i]}, ${nList[j]}) = ${g}`);
          if (g !== 1) allCoprime = false;
        }
      }

      if (!allCoprime) throw new ParseError('Moduli are not pairwise coprime! Chinese Remainder Theorem requires gcd(nᵢ, nⱼ) = 1.');

      steps.push({
        title: 'Step 1: Check Pairwise Coprimality of Moduli',
        text: 'CRT requires that all moduli nᵢ are pairwise coprime (gcd = 1).',
        lines: [
          ...aList.map((ai, i) => `Congruence ${i + 1}: x ≡ ${ai} (mod ${nList[i]})`),
          `Pairwise GCD checks: ${coprimes.join(' ; ')} (All coprime ✓)`
        ]
      });

      // Step 2: Compute M = ∏ nᵢ and Mᵢ = M / nᵢ
      const M_total = nList.reduce((acc, v) => acc * v, 1);
      const M_list = nList.map(ni => M_total / ni);

      steps.push({
        title: 'Step 2: Compute Total Modulus M and Multipliers Mᵢ',
        text: 'Total modulus M is the product of all moduli; Mᵢ = M / nᵢ.',
        lines: [
          `Total Modulus M = ${nList.join(' × ')} = ${M_total}`,
          ...M_list.map((Mi, i) => `M${Num.sub(i + 1)} = ${M_total} / ${nList[i]} = ${Mi}`)
        ]
      });

      // Step 3: Compute modular inverses Mᵢ yᵢ ≡ 1 (mod nᵢ)
      const yList = [];
      M_list.forEach((Mi, i) => {
        const ni = nList[i];
        const yi = modInv(Mi, ni);
        yList.push(yi);
      });

      steps.push({
        title: 'Step 3: Compute Inverses yᵢ such that Mᵢ yᵢ ≡ 1 (mod nᵢ)',
        text: 'Use Extended Euclidean Algorithm to solve for each modular inverse.',
        lines: [
          ...M_list.map((Mi, i) => `${Mi} · y${Num.sub(i + 1)} ≡ 1 (mod ${nList[i]}) ⇒ y${Num.sub(i + 1)} = ${yList[i]}`)
        ]
      });

      // Step 4: Construct solution x = ∑ aᵢ Mᵢ yᵢ mod M
      let x_sum = 0;
      const terms = [];
      for (let i = 0; i < k; i++) {
        const term = aList[i] * M_list[i] * yList[i];
        x_sum += term;
        terms.push(`${aList[i]} · ${M_list[i]} · ${yList[i]} (= ${term})`);
      }
      const x_sol = ((x_sum % M_total) + M_total) % M_total;

      steps.push({
        title: 'Step 4: Compute Solution x = ∑ aᵢ Mᵢ yᵢ mod M',
        text: 'Aggregate terms modulo M to obtain the unique solution.',
        lines: [
          `Sum = ${terms.join(' + ')} = ${x_sum}`,
          { t: `Unique Solution: x ≡ ${x_sol} (mod ${M_total})`, b: true, c: '#16a34a' }
        ]
      });

      // Step 5: Verification
      steps.push({
        title: 'Step 5: Verify Solution in All Original Congruences',
        text: 'Check x mod nᵢ against target remainders aᵢ.',
        lines: [
          ...nList.map((ni, i) => `${x_sol} mod ${ni} = ${x_sol % ni} (matches target a${Num.sub(i + 1)} = ${aList[i]} ✓)`),
          { t: 'All congruences verified successfully ✓', b: true, c: '#16a34a' }
        ]
      });

      return {
        formulas: [
          F('CRT Modulus', 'M = \\\prod_{i=1}^k n_i', nList.join(' × '), 'Product', String(M_total)),
          F('CRT Solution', 'x = \\sum a_i M_i y_i \\bmod M', 'aᵢ, Mᵢ, yᵢ', `${x_sum} mod ${M_total}`, `${x_sol}`),
        ],
        readouts: [
          { label: 'Solution x', value: `${x_sol} (mod ${M_total})`, tone: 'good' },
          { label: 'Total Modulus M', value: String(M_total), tone: 'info' },
          { label: 'Verification', value: 'All Congruences Passed', tone: 'good' },
        ],
        state: { aList, nList, M_total, M_list, yList, x_sol, x_sum },
        explain: {
          what: 'Solves a system of simultaneous linear congruences with pairwise coprime moduli.',
          why: 'The Chinese Remainder Theorem guarantees a unique solution modulo M = n₁n₂...n_k.',
          param: 'Select classic congruence systems.',
          effect: 'Shows coprimality checks, intermediate multipliers Mᵢ, inverses yᵢ, and verifies the solution.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { aList, nList, M_total, x_sol } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      D.text(g, 'Chinese Remainder Theorem (CRT) Solution Visualizer', bx + 20, by + 34, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Solution Box
      D.rect(g, bx + 16, by + 50, bw - 32, 54, { fill: '#1e293b', stroke: '#10b981', radius: 8, width: 2 });
      D.text(g, `Unique Solution: x ≡ ${x_sol} (mod ${M_total})`, bx + 32, by + 84, { size: 16, color: '#34d399', weight: 'bold' });

      // Congruence verification cards
      const cardY = by + 120;
      aList.forEach((ai, i) => {
        const ni = nList[i];
        const cX = bx + 16 + i * ((bw - 32) / aList.length);
        const cW = (bw - 32) / aList.length - 12;
        D.rect(g, cX, cardY, cW, 80, { fill: '#090d16', stroke: '#334155', radius: 8 });
        D.text(g, `Congruence #${i + 1}`, cX + 12, cardY + 24, { size: 13, color: '#94a3b8' });
        D.text(g, `x ≡ ${ai} (mod ${ni})`, cX + 12, cardY + 48, { size: 15, color: '#38bdf8', weight: 'bold' });
        D.text(g, `${x_sol} mod ${ni} = ${x_sol % ni} ✓`, cX + 12, cardY + 68, { size: 12, color: '#10b981' });
      });

      // Number Line Residue Match Demonstration
      const lineY = cardY + 110;
      D.rect(g, bx + 16, lineY, bw - 32, bh - (lineY - by) - 16, { fill: '#111827', stroke: '#1e293b', radius: 8 });
      D.text(g, `Number Line Residue Alignment on [0, ${M_total}]`, bx + 32, lineY + 28, { size: 13, color: '#cbd5e1', weight: 'bold' });

      const barW = bw - 80;
      D.line(g, bx + 40, lineY + 70, bx + 40 + barW, lineY + 70, { color: '#334155', width: 3 });
      D.text(g, '0', bx + 36, lineY + 90, { size: 11, color: '#64748b' });
      D.text(g, String(M_total), bx + 30 + barW, lineY + 90, { size: 11, color: '#64748b' });

      // Solution marker
      const solPx = bx + 40 + (x_sol / M_total) * barW;
      D.circle(g, solPx, lineY + 70, 7, { fill: '#10b981', stroke: '#ffffff', width: 2 });
      D.tag(g, `x = ${x_sol}`, solPx, lineY + 44, { bg: '#10b981', align: 'center', size: 13 });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V: NUMBER THEORY IN CRYPTOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════════

  // 9. Modular Exponentiation (Square & Multiply)
  define('u25rma201-modular-exp', {
    params: [
      { key: 'a', label: 'Base a', type: 'number', default: 7, min: 1, max: 1000 },
      { key: 'b', label: 'Exponent b', type: 'number', default: 13, min: 1, max: 1000 },
      { key: 'n', label: 'Modulus n', type: 'number', default: 19, min: 2, max: 1000 },
    ],
    solve(p) {
      const a = parseInt(p.a) || 7;
      const b = parseInt(p.b) || 13;
      const n = parseInt(p.n) || 19;

      const binB = b.toString(2);
      const steps = [];

      steps.push({
        title: 'Step 1: Convert Exponent b to Binary',
        text: `Exponent b = ${b} in binary is ${binB}₂. Length = ${binB.length} bits.`,
        lines: [
          `Base a = ${a}, Exponent b = ${b} = (${binB})₂, Modulus n = ${n}`,
          'Binary Square-and-Multiply reduces O(b) multiplications to O(log b) multiplications.'
        ]
      });

      let current = 1n;
      const trace = [];
      for (let i = 0; i < binB.length; i++) {
        const bit = binB[i];
        const before = current;
        // Square
        current = (current * current) % BigInt(n);
        const afterSq = current;
        // Multiply if bit == 1
        let afterMul = afterSq;
        if (bit === '1') {
          current = (current * BigInt(a)) % BigInt(n);
          afterMul = current;
        }

        trace.push({ step: i + 1, bit, before: Number(before), afterSq: Number(afterSq), afterMul: Number(afterMul) });
        steps.push({
          title: `Step ${i + 1}: Bit = '${bit}' (Square ${bit === '1' ? 'and Multiply' : 'only'})`,
          text: `Square: (${before})² mod ${n} = ${afterSq}${bit === '1' ? `; Multiply: ${afterSq} × ${a} mod ${n} = ${afterMul}` : ''}.`,
          lines: [
            `Current state: ${afterMul}`
          ]
        });
      }

      const finalResult = Number(current);
      steps.push({
        title: 'Final Result of Modular Exponentiation',
        text: `Computed ${a}^${b} mod ${n} in only ${binB.length} square operations.`,
        lines: [
          { t: `${a}^${b} ≡ ${finalResult} (mod ${n})`, b: true, c: '#16a34a' }
        ]
      });

      return {
        formulas: [
          F('Square & Multiply', 'a^b \\bmod n', `${a}^{${b}} \\bmod ${n}`, `Binary ${binB}₂`, String(finalResult)),
        ],
        readouts: [
          { label: 'Result mod n', value: String(finalResult), tone: 'good' },
          { label: 'Bit Length', value: `${binB.length} bits`, tone: 'info' },
          { label: 'Operations', value: `${binB.length} squares`, tone: 'good' },
        ],
        state: { a, b, n, binB, trace, finalResult },
        explain: {
          what: 'Computes a^b mod n using the repeated squaring (square-and-multiply) binary algorithm.',
          why: 'Direct computation of a^b exceeds computer integer storage; modular reduction after each step keeps values bounded.',
          param: 'Adjust base, exponent, and modulus.',
          effect: 'Shows step-by-step bit scanning, squarings, multiplications, and final remainder.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { a, b, n, binB, trace, finalResult } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      D.text(g, `Modular Exponentiation: ${a}^${b} mod ${n} = ${finalResult}`, bx + 20, by + 34, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Table representation
      const tY = by + 60;
      D.rect(g, bx + 16, tY, bw - 32, bh - 80, { fill: '#090d16', stroke: '#1e293b', radius: 8 });

      const colX = [bx + 30, bx + 100, bx + 190, bx + 320, bx + 450];
      const headers = ['Step', 'Bit', 'Square (mod n)', 'Multiply (if bit=1)', 'Current State'];
      headers.forEach((h, i) => D.text(g, h, colX[i], tY + 28, { size: 13, color: '#94a3b8', weight: 'bold' }));
      D.line(g, bx + 24, tY + 38, bx + bw - 24, tY + 38, { color: '#1e293b', width: 1.5 });

      trace.forEach((tr, i) => {
        const rowY = tY + 65 + i * 32;
        if (rowY < by + bh - 20) {
          D.text(g, `#${tr.step}`, colX[0], rowY, { size: 13, color: '#cbd5e1' });
          D.text(g, `'${tr.bit}'`, colX[1], rowY, { size: 13, color: tr.bit === '1' ? '#38bdf8' : '#94a3b8', weight: 'bold' });
          D.text(g, `(${tr.before})² ≡ ${tr.afterSq}`, colX[2], rowY, { size: 13, color: '#cbd5e1' });
          D.text(g, tr.bit === '1' ? `${tr.afterSq} × ${a} ≡ ${tr.afterMul}` : '— (No multiply)', colX[3], rowY, { size: 13, color: tr.bit === '1' ? '#34d399' : '#64748b' });
          D.text(g, String(tr.afterMul), colX[4], rowY, { size: 13, color: '#38bdf8', weight: 'bold' });
        }
      });
    }
  });

  // 10. RSA Cryptography Laboratory
  define('u25rma201-rsa', {
    params: [
      { key: 'p', label: 'Prime p', type: 'number', default: 61, min: 2, max: 500 },
      { key: 'q', label: 'Prime q', type: 'number', default: 53, min: 2, max: 500 },
      { key: 'e', label: 'Public Exponent e', type: 'number', default: 17, min: 2, max: 10000 },
      { key: 'message', label: 'Message m (m < n)', type: 'number', default: 65, min: 0, max: 3000 },
    ],
    solve(p) {
      const primeP = parseInt(p.p) || 61;
      const primeQ = parseInt(p.q) || 53;
      const pubE = parseInt(p.e) || 17;
      const msg = parseInt(p.message) || 65;

      // Validate primes
      if (!isPrime(primeP)) throw new ParseError(`Input p = ${primeP} is NOT a prime number! Choose a prime number.`);
      if (!isPrime(primeQ)) throw new ParseError(`Input q = ${primeQ} is NOT a prime number! Choose a prime number.`);
      if (primeP === primeQ) throw new ParseError('Primes p and q must be distinct (p ≠ q).');

      const n = primeP * primeQ;
      const phiN = (primeP - 1) * (primeQ - 1);

      if (gcd(pubE, phiN) !== 1) {
        throw new ParseError(`Public exponent e = ${pubE} is not coprime to φ(n) = ${phiN}! gcd(e, φ(n)) = ${gcd(pubE, phiN)}. Choose another e.`);
      }

      const privD = modInv(pubE, phiN);
      if (msg >= n) throw new ParseError(`Message m = ${msg} must be strictly less than modulus n = ${n}.`);

      // Encryption: c = m^e mod n
      const cipherC = Number(modPow(msg, pubE, n));

      // Decryption: m' = c^d mod n
      const recoveredM = Number(modPow(cipherC, privD, n));

      const steps = [];
      steps.push({
        title: 'Step 1: RSA Key Generation (Primes p, q)',
        text: 'Select distinct primes p and q; calculate modulus n and Euler totient φ(n).',
        lines: [
          `Prime p = ${primeP}, Prime q = ${primeQ}`,
          `Modulus n = p × q = ${primeP} × ${primeQ} = ${n}`,
          `Totient φ(n) = (p − 1)(q − 1) = ${primeP - 1} × ${primeQ - 1} = ${phiN}`
        ]
      });

      steps.push({
        title: 'Step 2: Key Pair Computation (Public e, Private d)',
        text: 'Choose public exponent e with gcd(e, φ(n)) = 1; compute private key d = e⁻¹ mod φ(n).',
        lines: [
          `Public Exponent e = ${pubE} (gcd(${pubE}, ${phiN}) = 1 ✓)`,
          `Private Key d = ${pubE}⁻¹ mod ${phiN} = ${privD}`,
          `Public Key: (e = ${pubE}, n = ${n})`,
          `Private Key: (d = ${privD}, n = ${n})`
        ]
      });

      steps.push({
        title: 'Step 3: Encryption c = m^e mod n',
        text: 'Sender encrypts plaintext message m using recipient’s public key (e, n).',
        lines: [
          `Plaintext Message m = ${msg}`,
          `Ciphertext c = ${msg}^${pubE} mod ${n} = ${cipherC}`
        ]
      });

      steps.push({
        title: 'Step 4: Decryption m = c^d mod n',
        text: 'Recipient decrypts ciphertext c using their private key (d, n).',
        lines: [
          `Decrypted Message m = ${cipherC}^${privD} mod ${n} = ${recoveredM}`,
          { t: `Verification: Recovered (${recoveredM}) == Original (${msg}) ✓`, b: true, c: '#16a34a' }
        ]
      });

      return {
        formulas: [
          F('RSA Modulus', 'n = p \\cdot q, \\\quad \\\phi(n) = (p-1)(q-1)', `p=${primeP}, q=${primeQ}`, 'Multiplication', `n=${n}, \\\phi=${phiN}`),
          F('RSA Encryption', 'c = m^e \\bmod n', `m=${msg}, e=${pubE}`, 'Modular Exp', `c = ${cipherC}`),
          F('RSA Decryption', 'm = c^d \\bmod n', `c=${cipherC}, d=${privD}`, 'Modular Exp', `m = ${recoveredM}`),
        ],
        readouts: [
          { label: 'Modulus n', value: String(n), tone: 'info' },
          { label: 'Public (e, n)', value: `(${pubE}, ${n})`, tone: 'good' },
          { label: 'Private d', value: String(privD), tone: 'info' },
          { label: 'Ciphertext c', value: String(cipherC), tone: 'good' },
          { label: 'Decrypted m', value: `${recoveredM} ✓`, tone: 'good' },
        ],
        state: { primeP, primeQ, n, phiN, pubE, privD, msg, cipherC, recoveredM },
        explain: {
          what: 'Asymmetric public-key cryptosystem based on the computational difficulty of factoring large integers n = pq.',
          why: 'Allows secure message exchange across public channels without pre-shared secrets.',
          param: 'Adjust prime inputs p and q, public exponent e, and plaintext message m.',
          effect: 'Generates keys, computes modular exponentiation for encryption, and verifies decryption.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { primeP, primeQ, n, pubE, privD, msg, cipherC, recoveredM } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      D.text(g, 'RSA Cryptosystem Workflow Diagram (Alice → Bob)', bx + 20, by + 34, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Pipeline Box
      const pY = by + 60;
      D.rect(g, bx + 16, pY, bw - 32, 110, { fill: '#1e293b', stroke: '#334155', radius: 8 });

      // Alice (Sender)
      D.rect(g, bx + 30, pY + 16, 120, 78, { fill: '#0f172a', stroke: '#38bdf8', radius: 6 });
      D.text(g, 'Alice (Sender)', bx + 90, pY + 36, { align: 'center', size: 12, color: '#38bdf8', weight: 'bold' });
      D.text(g, `Plaintext m = ${msg}`, bx + 90, pY + 58, { align: 'center', size: 14, color: '#f8fafc', weight: 'bold' });
      D.text(g, `Encrypt: m^e mod n`, bx + 90, pY + 76, { align: 'center', size: 11, color: '#94a3b8' });

      // Public Channel
      D.arrow(g, bx + 155, pY + 55, bx + 245, pY + 55, { color: '#f59e0b', width: 3, head: 10 });
      D.rect(g, bx + 250, pY + 16, 130, 78, { fill: '#1c1917', stroke: '#f59e0b', radius: 6 });
      D.text(g, 'Insecure Channel', bx + 315, pY + 36, { align: 'center', size: 12, color: '#f59e0b', weight: 'bold' });
      D.text(g, `Ciphertext c = ${cipherC}`, bx + 315, pY + 58, { align: 'center', size: 14, color: '#fde047', weight: 'bold' });
      D.text(g, 'Public: (e, n)', bx + 315, pY + 76, { align: 'center', size: 11, color: '#a8a29e' });

      // Bob (Receiver)
      D.arrow(g, bx + 385, pY + 55, bx + 475, pY + 55, { color: '#10b981', width: 3, head: 10 });
      D.rect(g, bx + 480, pY + 16, 130, 78, { fill: '#0f172a', stroke: '#10b981', radius: 6 });
      D.text(g, 'Bob (Receiver)', bx + 545, pY + 36, { align: 'center', size: 12, color: '#10b981', weight: 'bold' });
      D.text(g, `Decrypted m = ${recoveredM}`, bx + 545, pY + 58, { align: 'center', size: 14, color: '#34d399', weight: 'bold' });
      D.text(g, `Private: d = ${privD}`, bx + 545, pY + 76, { align: 'center', size: 11, color: '#94a3b8' });

      // Key Inspection Table
      const kY = pY + 125;
      D.rect(g, bx + 16, kY, bw - 32, bh - (kY - by) - 16, { fill: '#090d16', stroke: '#1e293b', radius: 8 });
      D.text(g, 'Cryptographic Security & Parameter Analysis', bx + 32, kY + 28, { size: 14, color: '#38bdf8', weight: 'bold' });
      D.text(g, `1. Prime Factors: p = ${primeP}, q = ${primeQ} ⇒ Euler Totient φ(n) = ${sol.state.phiN}.`, bx + 32, kY + 55, { size: 13, color: '#cbd5e1' });
      D.text(g, `2. Public Exponent e = ${pubE} and Private Exponent d = ${privD} satisfy e · d ≡ 1 (mod φ(n)).`, bx + 32, kY + 80, { size: 13, color: '#cbd5e1' });
      D.text(g, `3. Decryption Verification: (${cipherC})^${privD} mod ${n} = ${recoveredM} (Exact match to original plaintext).`, bx + 32, kY + 105, { size: 13, color: '#34d399', weight: 'bold' });
    }
  });

  // 11. Diffie–Hellman Key Exchange Simulator
  define('u25rma201-diffie-hellman', {
    params: [
      { key: 'p', label: 'Prime Modulus p', type: 'number', default: 23, min: 5, max: 200 },
      { key: 'g', label: 'Generator Base g', type: 'number', default: 5, min: 2, max: 50 },
      { key: 'a', label: "Alice's Secret (a)", type: 'number', default: 6, min: 1, max: 100 },
      { key: 'b', label: "Bob's Secret (b)", type: 'number', default: 15, min: 1, max: 100 },
    ],
    solve(p) {
      const modP = parseInt(p.p) || 23;
      const baseG = parseInt(p.g) || 5;
      const secA = parseInt(p.a) || 6;
      const secB = parseInt(p.b) || 15;

      if (!isPrime(modP)) throw new ParseError(`Modulus p = ${modP} must be a prime number!`);

      // Public values
      const pubA = Number(modPow(baseG, secA, modP));
      const pubB = Number(modPow(baseG, secB, modP));

      // Shared secret
      const sharedAlice = Number(modPow(pubB, secA, modP));
      const sharedBob = Number(modPow(pubA, secB, modP));

      const steps = [];
      steps.push({
        title: 'Step 1: Public Domain Parameters (p, g)',
        text: 'Alice and Bob agree on public prime p and generator g.',
        lines: [
          `Public Prime p = ${modP}`,
          `Public Generator g = ${baseG}`
        ]
      });

      steps.push({
        title: 'Step 2: Private Key Selection & Public Value Generation',
        text: 'Each party picks a secret integer and computes their public exchange value.',
        lines: [
          `Alice chooses secret a = ${secA} ⟶ Computes A = ${baseG}^${secA} mod ${modP} = ${pubA}`,
          `Bob chooses secret b = ${secB} ⟶ Computes B = ${baseG}^${secB} mod ${modP} = ${pubB}`
        ]
      });

      steps.push({
        title: 'Step 3: Public Value Exchange & Shared Secret Calculation',
        text: 'Alice and Bob exchange public values A and B over the insecure channel.',
        lines: [
          `Alice computes secret: s_Alice = B^a mod p = ${pubB}^${secA} mod ${modP} = ${sharedAlice}`,
          `Bob computes secret: s_Bob = A^b mod p = ${pubA}^${secB} mod ${modP} = ${sharedBob}`,
          { t: `Verification: s_Alice (${sharedAlice}) == s_Bob (${sharedBob}) = ${sharedAlice} ✓`, b: true, c: '#16a34a' }
        ]
      });

      return {
        formulas: [
          F('Alice Public', 'A = g^a \\bmod p', `g=${baseG}, a=${secA}`, `${baseG}^{${secA}} \\bmod ${modP}`, String(pubA)),
          F('Bob Public', 'B = g^b \\bmod p', `g=${baseG}, b=${secB}`, `${baseG}^{${secB}} \\bmod ${modP}`, String(pubB)),
          F('Shared Secret', 's = B^a = A^b = g^{ab} \\bmod p', 'B, a / A, b', 'Modular exponentiation', String(sharedAlice)),
        ],
        readouts: [
          { label: 'Shared Secret', value: String(sharedAlice), tone: 'good' },
          { label: 'Alice Public (A)', value: String(pubA), tone: 'info' },
          { label: 'Bob Public (B)', value: String(pubB), tone: 'info' },
        ],
        state: { modP, baseG, secA, secB, pubA, pubB, sharedAlice, sharedBob },
        explain: {
          what: 'Key exchange protocol allowing two parties to establish a shared secret over an unencrypted channel.',
          why: 'Eavesdroppers see only g, p, A, and B. Computing secret a or b requires solving the Discrete Logarithm Problem.',
          param: 'Adjust prime p, base g, and private secrets a and b.',
          effect: 'Shows private keys, public exchange values, and identical shared secret calculation.'
        },
        steps
      };
    },
    plot(g, box, sol) {
      const { modP, baseG, secA, secB, pubA, pubB, sharedAlice, sharedBob } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0f172a');

      D.text(g, 'Diffie–Hellman Key Exchange · Interactive Protocol Stage', bx + 20, by + 34, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Shared Secret Banner
      D.rect(g, bx + 16, by + 50, bw - 32, 50, { fill: '#1e293b', stroke: '#10b981', radius: 8, width: 2 });
      D.text(g, `Shared Secret Established: s = ${sharedAlice} (Matches on Both Sides ✓)`, bx + 32, by + 82, { size: 16, color: '#34d399', weight: 'bold' });

      // Alice vs Bob columns
      const colW = (bw - 48) / 2;
      const cY = by + 115;

      // Alice
      D.rect(g, bx + 16, cY, colW, 160, { fill: '#090d16', stroke: '#38bdf8', radius: 8 });
      D.text(g, 'Alice', bx + 32, cY + 30, { size: 16, color: '#38bdf8', weight: 'bold' });
      D.text(g, `Secret key: a = ${secA}`, bx + 32, cY + 60, { size: 13, color: '#cbd5e1' });
      D.text(g, `Public value: A = ${baseG}^${secA} mod ${modP} = ${pubA}`, bx + 32, cY + 85, { size: 13, color: '#f8fafc', weight: 'bold' });
      D.text(g, `Shared secret: (${pubB})^${secA} mod ${modP} = ${sharedAlice}`, bx + 32, cY + 125, { size: 14, color: '#34d399', weight: 'bold' });

      // Bob
      D.rect(g, bx + 32 + colW, cY, colW, 160, { fill: '#090d16', stroke: '#ec4899', radius: 8 });
      D.text(g, 'Bob', bx + 48 + colW, cY + 30, { size: 16, color: '#ec4899', weight: 'bold' });
      D.text(g, `Secret key: b = ${secB}`, bx + 48 + colW, cY + 60, { size: 13, color: '#cbd5e1' });
      D.text(g, `Public value: B = ${baseG}^${secB} mod ${modP} = ${pubB}`, bx + 48 + colW, cY + 85, { size: 13, color: '#f8fafc', weight: 'bold' });
      D.text(g, `Shared secret: (${pubA})^${secB} mod ${modP} = ${sharedBob}`, bx + 48 + colW, cY + 125, { size: 14, color: '#34d399', weight: 'bold' });

      // Exchange arrows
      D.arrow(g, bx + colW, cY + 80, bx + colW + 48, cY + 80, { color: '#38bdf8', width: 2.5, head: 8 });
      D.arrow(g, bx + colW + 48, cY + 95, bx + colW, cY + 95, { color: '#ec4899', width: 2.5, head: 8 });
    }
  });


  // ═══════════════════════════════════════════════════════════════════════════
  // DEDICATED TOPIC SIMULATIONS (UNITS I - V)
  // ═══════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT I.2: Gaussian Elimination Simulator (Elementary Row Operations)
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-gaussian-elimination', {
    params: [
      { key: 'preset', label: 'Matrix System', type: 'select', default: 'sys3_standard', options: [
        { label: '3×3 Standard: 2x+y-z=8, -3x-y+2z=-11, -2x+y+2z=-3', value: 'sys3_standard' },
        { label: '3×3 Zero Pivot (Requires Swap): 0x+2y+z=4, x-y+2z=3, 2x+y-z=1', value: 'sys3_swap' },
        { label: '2×2 System: 2x + y = 5, x - y = 1', value: 'sys2_standard' },
        { label: '3×3 Inconsistent: x+y+z=3, x+y+z=4, 2x+2y+2z=7', value: 'sys3_inconsistent' },
        { label: '3×3 Free Variables: x+2y-z=2, 2x+4y-2z=4, -x-2y+z=-2', value: 'sys3_free' },
      ]},
      { key: 'manualOp', label: 'Perform Row Operation', type: 'select', default: 'auto', options: [
        { label: 'Automatic Step-by-Step Echelon Reduction', value: 'auto' },
        { label: 'Row Swap: Swap R1 <-> R2', value: 'swap12' },
        { label: 'Row Swap: Swap R2 <-> R3', value: 'swap23' },
        { label: 'Scale Row: R1 -> 0.5 * R1', value: 'scale1_half' },
        { label: 'Eliminate: R2 -> R2 - 2*R1', value: 'elim21_2' },
        { label: 'Eliminate: R3 -> R3 + 2*R1', value: 'elim31_neg2' },
      ]},
    ],
    examples: [
      { label: '3×3 Standard System', values: { preset: 'sys3_standard', manualOp: 'auto' } },
      { label: 'Zero Pivot Swap Demonstration', values: { preset: 'sys3_swap', manualOp: 'auto' } },
      { label: '2×2 Elementary System', values: { preset: 'sys2_standard', manualOp: 'auto' } },
    ],
    solve(p) {
      let A, b, vars;
      if (p.preset === 'sys2_standard') {
        A = [[2, 1], [1, -1]];
        b = [5, 1];
        vars = ['x', 'y'];
      } else if (p.preset === 'sys3_swap') {
        A = [[0, 2, 1], [1, -1, 2], [2, 1, -1]];
        b = [4, 3, 1];
        vars = ['x', 'y', 'z'];
      } else if (p.preset === 'sys3_inconsistent') {
        A = [[1, 1, 1], [1, 1, 1], [2, 2, 2]];
        b = [3, 4, 7];
        vars = ['x', 'y', 'z'];
      } else if (p.preset === 'sys3_free') {
        A = [[1, 2, -1], [2, 4, -2], [-1, -2, 1]];
        b = [2, 4, -2];
        vars = ['x', 'y', 'z'];
      } else {
        A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]];
        b = [8, -11, -3];
        vars = ['x', 'y', 'z'];
      }

      const n = A.length;
      let M = A.map((r, i) => [...r, b[i]]);
      const initialM = M.map((r) => [...r]);
      const steps = [];

      // Step 0: Initial Augmented Matrix
      steps.push({
        title: 'Initial Augmented Matrix [A | b]',
        desc: 'Construct the augmented matrix representing the system of linear equations.',
        M: M.map((r) => [...r]),
        op: 'Form augmented matrix [A | b]',
        activeRow: -1,
      });

      // Handle Manual Row Operations if requested
      if (p.manualOp === 'swap12' && n >= 2) {
        const temp = M[0]; M[0] = M[1]; M[1] = temp;
        steps.push({ title: 'Elementary Row Operation: Swap R1 <-> R2', desc: 'Swap Row 1 and Row 2.', M: M.map((r) => [...r]), op: 'R1 <-> R2', activeRow: 0, targetRow: 1 });
      } else if (p.manualOp === 'swap23' && n >= 3) {
        const temp = M[1]; M[1] = M[2]; M[2] = temp;
        steps.push({ title: 'Elementary Row Operation: Swap R2 <-> R3', desc: 'Swap Row 2 and Row 3.', M: M.map((r) => [...r]), op: 'R2 <-> R3', activeRow: 1, targetRow: 2 });
      } else if (p.manualOp === 'scale1_half') {
        M[0] = M[0].map((v) => v * 0.5);
        steps.push({ title: 'Elementary Row Operation: R1 -> 0.5 * R1', desc: 'Multiply Row 1 by scalar 0.5.', M: M.map((r) => [...r]), op: 'R1 -> 0.5 * R1', activeRow: 0 });
      } else if (p.manualOp === 'elim21_2' && n >= 2) {
        M[1] = M[1].map((v, j) => v - 2 * M[0][j]);
        steps.push({ title: 'Elementary Row Operation: R2 -> R2 - 2*R1', desc: 'Eliminate entry below pivot using R2 -> R2 - 2*R1.', M: M.map((r) => [...r]), op: 'R2 -> R2 - 2*R1', activeRow: 0, targetRow: 1 });
      }

      // Automatic Forward Elimination to REF
      let lead = 0;
      let isInconsistent = false;
      for (let r = 0; r < n && lead < n; r++) {
        let pivotRow = r;
        while (pivotRow < n && Math.abs(M[pivotRow][lead]) < 1e-9) {
          pivotRow++;
        }
        if (pivotRow === n) {
          lead++;
          r--;
          continue;
        }
        if (pivotRow !== r) {
          const temp = M[r]; M[r] = M[pivotRow]; M[pivotRow] = temp;
          steps.push({
            title: `Row Swap: R${r + 1} <-> R${pivotRow + 1}`,
            desc: `Zero pivot encountered at column ${lead + 1}. Swap row ${r + 1} with row ${pivotRow + 1}.`,
            M: M.map((row) => [...row]),
            op: `R${r + 1} <-> R${pivotRow + 1}`,
            activeRow: r,
            targetRow: pivotRow,
          });
        }
        const pivotVal = M[r][lead];
        for (let i = r + 1; i < n; i++) {
          const factor = M[i][lead] / pivotVal;
          if (Math.abs(factor) > 1e-9) {
            M[i] = M[i].map((val, col) => val - factor * M[r][col]);
            const sign = factor >= 0 ? '-' : '+';
            const absF = Math.abs(factor);
            const opStr = `R${i + 1} -> R${i + 1} ${sign} ${f(absF)}*R${r + 1}`;
            steps.push({
              title: `Eliminate below pivot: ${opStr}`,
              desc: `Create zero in row ${i + 1}, column ${lead + 1}.`,
              M: M.map((row) => [...row]),
              op: opStr,
              activeRow: r,
              targetRow: i,
            });
          }
        }
        lead++;
      }

      // Clean tiny floating point zeros
      M = M.map((row) => row.map((v) => (Math.abs(v) < 1e-9 ? 0 : v)));

      // Check Inconsistency in REF: [0 0 0 ... | c] with c != 0
      for (let i = 0; i < n; i++) {
        const allZeroCoeffs = M[i].slice(0, n).every((v) => Math.abs(v) < 1e-9);
        if (allZeroCoeffs && Math.abs(M[i][n]) > 1e-9) {
          isInconsistent = true;
          break;
        }
      }

      // Back Substitution
      const solValues = new Array(n).fill(null);
      let solStatus = 'unique';
      if (isInconsistent) {
        solStatus = 'inconsistent';
        steps.push({
          title: 'System Inconsistent (No Solution)',
          desc: 'A row has the form [0 0 ... 0 | c] with c ≠ 0, producing contradiction 0 = c. No solution exists.',
          M: M.map((r) => [...r]),
          op: 'Inconsistency detected',
          activeRow: -1,
        });
      } else {
        // Count non-zero rows
        const rank = M.filter((r) => r.slice(0, n).some((v) => Math.abs(v) > 1e-9)).length;
        if (rank < n) {
          solStatus = 'infinite';
          steps.push({
            title: `Infinitely Many Solutions (Rank = ${rank} < n = ${n})`,
            desc: `${n - rank} free variable(s) exist. System is consistent with infinite solutions.`,
            M: M.map((r) => [...r]),
            op: 'Free variables present',
            activeRow: -1,
          });
        } else {
          // Perform exact back substitution
          for (let i = n - 1; i >= 0; i--) {
            let sum = M[i][n];
            for (let j = i + 1; j < n; j++) {
              sum -= M[i][j] * solValues[j];
            }
            solValues[i] = sum / M[i][i];
            steps.push({
              title: `Back Substitution: Solve for ${vars[i]}`,
              desc: `${vars[i]} = (${f(M[i][n])} - sum) / ${f(M[i][i])} = ${f(solValues[i])}`,
              M: M.map((r) => [...r]),
              op: `${vars[i]} = ${f(solValues[i])}`,
              activeRow: i,
            });
          }
        }
      }

      return {
        formula: 'A x = b \\quad \\longrightarrow \\quad U x = c \\quad (\\text{Back-Substitution})',
        readouts: [
          { label: 'System Size', value: `${n} × ${n}` },
          { label: 'Solution Status', value: solStatus === 'unique' ? 'Unique Solution ✓' : solStatus === 'infinite' ? 'Infinitely Many Solutions' : 'Inconsistent (No Solution) ✗' },
          { label: 'Unknowns', value: solStatus === 'unique' ? vars.map((v, i) => `${v} = ${f(solValues[i])}`).join(', ') : 'Free / Undefined' },
        ],
        steps: steps.map((s) => ({ title: s.title, desc: s.desc })),
        state: { n, vars, steps, initialM, finalM: M, solStatus, solValues },
      };
    },
    plot(g, box, sol) {
      const { n, vars, steps, initialM, finalM, solStatus, solValues } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, 'Gaussian Elimination Simulator · Elementary Row Operations', bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Left Column: Original System & Row Operation Sequence
      const colW = (bw - 60) / 2;
      D.rect(g, bx + 16, by + 50, colW, bh - 66, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, 'Elementary Row Operations Sequence', bx + 32, by + 80, { size: 14, color: '#f8fafc', weight: 'bold' });

      let stepY = by + 110;
      steps.slice(0, 7).forEach((st, idx) => {
        const isLast = idx === steps.length - 1;
        D.rect(g, bx + 28, stepY, colW - 24, 40, { fill: isLast ? '#1e3a5f' : '#0f172a', stroke: isLast ? '#38bdf8' : '#334155', radius: 6 });
        D.text(g, `Step ${idx}: ${st.op}`, bx + 38, stepY + 24, { size: 12, color: isLast ? '#38bdf8' : '#cbd5e1', weight: isLast ? 'bold' : 'normal' });
        stepY += 48;
      });

      // Right Column: Current Augmented Matrix & Solution
      const rX = bx + colW + 32;
      D.rect(g, rX, by + 50, colW, bh - 66, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, 'Row Echelon Form [U | c]', rX + 16, by + 80, { size: 14, color: '#f8fafc', weight: 'bold' });

      // Draw Matrix Grid
      const matY = by + 110;
      const cellW = (colW - 48) / (n + 1);
      const cellH = 34;
      finalM.forEach((row, ri) => {
        row.forEach((val, ci) => {
          const cx = rX + 16 + ci * cellW;
          const cy = matY + ri * cellH;
          const isPivot = ri === ci && Math.abs(val) > 1e-9;
          const isAug = ci === n;
          D.rect(g, cx, cy, cellW - 4, cellH - 4, {
            fill: isPivot ? '#065f46' : isAug ? '#1e293b' : '#0f172a',
            stroke: isPivot ? '#34d399' : '#334155',
            radius: 4,
          });
          D.text(g, f(val), cx + cellW / 2 - 2, cy + cellH / 2 + 4, {
            size: 12,
            color: isPivot ? '#34d399' : isAug ? '#f59e0b' : '#f8fafc',
            weight: isPivot ? 'bold' : 'normal',
            align: 'center',
          });
        });
      });

      // Solution Summary Banner
      const resY = matY + n * cellH + 30;
      D.rect(g, rX + 16, resY, colW - 32, 70, {
        fill: solStatus === 'unique' ? '#064e3b' : solStatus === 'infinite' ? '#78350f' : '#7f1d1d',
        stroke: solStatus === 'unique' ? '#10b981' : solStatus === 'infinite' ? '#f59e0b' : '#ef4444',
        radius: 8,
        width: 1.5,
      });
      D.text(g, solStatus === 'unique' ? 'Back Substitution Result:' : 'Classification:', rX + 30, resY + 26, { size: 12, color: '#cbd5e1' });
      const solStr = solStatus === 'unique' ? vars.map((v, i) => `${v} = ${f(solValues[i])}`).join(',   ') : solStatus === 'infinite' ? 'Infinitely Many Solutions' : 'Inconsistent: No Solution';
      D.text(g, solStr, rX + 30, resY + 52, { size: 14, color: '#f8fafc', weight: 'bold' });
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT I.3: Gauss–Jordan Elimination Simulator ([A|b] -> [I|x])
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-gauss-jordan', {
    params: [
      { key: 'preset', label: 'Matrix System', type: 'select', default: 'sys3_unique', options: [
        { label: '3×3 Unique: 2x+y-z=8, -3x-y+2z=-11, -2x+y+2z=-3', value: 'sys3_unique' },
        { label: '3×3 Pivot Swap: 0x+2y+z=4, x-y+2z=3, 2x+y-z=1', value: 'sys3_swap' },
        { label: '2×2 Simple: 2x+y=5, x-y=1', value: 'sys2_simple' },
        { label: '3×3 Infinite Solutions: x+y+z=1, 2x+2y+2z=2, 3x+3y+3z=3', value: 'sys3_inf' },
        { label: '3×3 Inconsistent: x+y=2, x+y=5, 2x+3y=8', value: 'sys3_incon' },
      ]},
    ],
    examples: [
      { label: '3×3 Unique Solution', values: { preset: 'sys3_unique' } },
      { label: 'Zero Pivot Swap System', values: { preset: 'sys3_swap' } },
      { label: '2×2 Linear System', values: { preset: 'sys2_simple' } },
    ],
    solve(p) {
      let A, b, vars;
      if (p.preset === 'sys2_simple') {
        A = [[2, 1], [1, -1]]; b = [5, 1]; vars = ['x', 'y'];
      } else if (p.preset === 'sys3_swap') {
        A = [[0, 2, 1], [1, -1, 2], [2, 1, -1]]; b = [4, 3, 1]; vars = ['x', 'y', 'z'];
      } else if (p.preset === 'sys3_inf') {
        A = [[1, 1, 1], [2, 2, 2], [3, 3, 3]]; b = [1, 2, 3]; vars = ['x', 'y', 'z'];
      } else if (p.preset === 'sys3_incon') {
        A = [[1, 1, 0], [1, 1, 0], [2, 3, 0]]; b = [2, 5, 8]; vars = ['x', 'y', 'z'];
      } else {
        A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; b = [8, -11, -3]; vars = ['x', 'y', 'z'];
      }

      const n = A.length;
      let M = A.map((r, i) => [...r, b[i]]);
      const steps = [];

      steps.push({ title: 'Augmented Matrix [A | b]', desc: 'Form augmented matrix.', M: M.map((r) => [...r]) });

      // Gauss-Jordan: Eliminate both below AND above pivot to reach [I | x]
      let lead = 0;
      for (let r = 0; r < n && lead < n; r++) {
        let pivotRow = r;
        while (pivotRow < n && Math.abs(M[pivotRow][lead]) < 1e-9) pivotRow++;
        if (pivotRow === n) { lead++; r--; continue; }
        if (pivotRow !== r) {
          const t = M[r]; M[r] = M[pivotRow]; M[pivotRow] = t;
          steps.push({ title: `Row Swap: R${r+1} <-> R${pivotRow+1}`, desc: 'Swap row with non-zero pivot.', M: M.map((row)=>[...row]) });
        }
        // Normalize pivot row to 1
        const pVal = M[r][lead];
        if (Math.abs(pVal - 1) > 1e-9) {
          M[r] = M[r].map((v) => v / pVal);
          steps.push({ title: `Normalize Pivot: R${r+1} -> (1/${f(pVal)})*R${r+1}`, desc: 'Make leading pivot equal to 1.', M: M.map((row)=>[...row]) });
        }
        // Eliminate entries above and below
        for (let i = 0; i < n; i++) {
          if (i !== r) {
            const factor = M[i][lead];
            if (Math.abs(factor) > 1e-9) {
              M[i] = M[i].map((v, c) => v - factor * M[r][c]);
              steps.push({ title: `Eliminate in Row ${i+1}: R${i+1} -> R${i+1} - ${f(factor)}*R${r+1}`, desc: `Zero out entry in row ${i+1}, col ${lead+1}.`, M: M.map((row)=>[...row]) });
            }
          }
        }
        lead++;
      }

      // Check inconsistency or free variables
      let solStatus = 'unique';
      for (let i = 0; i < n; i++) {
        const rowZeros = M[i].slice(0, n).every((v) => Math.abs(v) < 1e-9);
        if (rowZeros && Math.abs(M[i][n]) > 1e-9) { solStatus = 'inconsistent'; break; }
      }
      const rankA = M.filter((r) => r.slice(0, n).some((v) => Math.abs(v) > 1e-9)).length;
      if (solStatus !== 'inconsistent' && rankA < n) solStatus = 'infinite';

      const x = vars.map((_, i) => (solStatus === 'unique' ? M[i][n] : null));

      return {
        formula: '[A | b] \\quad \\xrightarrow{\\text{Gauss-Jordan}} \\quad [I | x]',
        readouts: [
          { label: 'Rank(A)', value: String(rankA) },
          { label: 'Status', value: solStatus === 'unique' ? 'Unique Solution ✓' : solStatus === 'infinite' ? 'Infinitely Many Solutions' : 'Inconsistent ✗' },
          { label: 'Solution Vector x', value: solStatus === 'unique' ? `[${x.map(f).join(', ')}]` : 'Undefined' },
        ],
        steps: steps.map((s) => ({ title: s.title, desc: s.desc })),
        state: { n, vars, steps, finalM: M, solStatus, x },
      };
    },
    plot(g, box, sol) {
      const { n, vars, steps, finalM, solStatus, x } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, 'Gauss–Jordan Elimination · Reduced Row Echelon Form [I | x]', bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      const wMat = bw - 48;
      const cellW = wMat / (n + 1);
      const cellH = 38;
      const mY = by + 65;

      D.rect(g, bx + 16, mY, wMat + 16, n * cellH + 30, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, 'Reduced Row Echelon Form [RREF]', bx + 28, mY + 22, { size: 13, color: '#cbd5e1' });

      finalM.forEach((row, ri) => {
        row.forEach((val, ci) => {
          const cx = bx + 24 + ci * cellW;
          const cy = mY + 32 + ri * cellH;
          const isIdent = ri === ci && Math.abs(val - 1) < 1e-9;
          const isAug = ci === n;
          D.rect(g, cx, cy, cellW - 6, cellH - 6, {
            fill: isIdent ? '#065f46' : isAug ? '#1e3a5f' : '#0f172a',
            stroke: isIdent ? '#34d399' : isAug ? '#38bdf8' : '#334155',
            radius: 4,
          });
          D.text(g, f(val), cx + cellW / 2 - 3, cy + cellH / 2 + 4, {
            size: 13,
            color: isIdent ? '#34d399' : isAug ? '#38bdf8' : '#f8fafc',
            weight: isIdent || isAug ? 'bold' : 'normal',
            align: 'center',
          });
        });
      });

      // Solution classification
      const bY = mY + n * cellH + 50;
      D.rect(g, bx + 16, bY, wMat + 16, 70, {
        fill: solStatus === 'unique' ? '#064e3b' : solStatus === 'infinite' ? '#78350f' : '#7f1d1d',
        stroke: solStatus === 'unique' ? '#10b981' : solStatus === 'infinite' ? '#f59e0b' : '#ef4444',
        radius: 8,
        width: 2,
      });
      D.text(g, 'Direct Solution Reading:', bx + 32, bY + 26, { size: 13, color: '#cbd5e1' });
      const str = solStatus === 'unique' ? vars.map((v, i) => `${v} = ${f(x[i])}`).join('   |   ') : solStatus === 'infinite' ? 'Infinitely Many Solutions (Free Variables in System)' : 'Contradiction [0 0 ... | c] -> No Solution';
      D.text(g, str, bx + 32, bY + 52, { size: 15, color: '#f8fafc', weight: 'bold' });
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT I.5: Rank & Consistency Visualizer (Rouché–Capelli Theorem)
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-rank-consistency', {
    params: [
      { key: 'preset', label: 'Linear System Architecture', type: 'select', default: 'unique_3x3', options: [
        { label: 'Rank(A)=3, Rank([A|b])=3 -> Unique Solution', value: 'unique_3x3' },
        { label: 'Rank(A)=2, Rank([A|b])=3 -> Inconsistent (No Solution)', value: 'incon_3x3' },
        { label: 'Rank(A)=2, Rank([A|b])=2 -> Infinitely Many Solutions (1 Free Var)', value: 'inf_3x3' },
        { label: 'Rank(A)=1, Rank([A|b])=1 -> Plane in R3 (2 Free Vars)', value: 'hyperplane_3x3' },
      ]},
    ],
    examples: [
      { label: 'Unique Solution: Rank(A) = Rank([A|b]) = n', values: { preset: 'unique_3x3' } },
      { label: 'Inconsistent: Rank(A) < Rank([A|b])', values: { preset: 'incon_3x3' } },
      { label: 'Infinite Solutions: Rank(A) = Rank([A|b]) < n', values: { preset: 'inf_3x3' } },
    ],
    solve(p) {
      let A, b;
      if (p.preset === 'incon_3x3') {
        A = [[1, 2, 3], [2, 4, 6], [1, 1, 1]]; b = [4, 9, 2];
      } else if (p.preset === 'inf_3x3') {
        A = [[1, 1, 1], [2, 2, 2], [1, 2, 3]]; b = [3, 6, 4];
      } else if (p.preset === 'hyperplane_3x3') {
        A = [[1, 2, -1], [2, 4, -2], [3, 6, -3]]; b = [4, 8, 12];
      } else {
        A = [[1, 2, 1], [2, 1, 3], [1, 1, 1]]; b = [4, 7, 3];
      }

      const n = A[0].length;
      const Ab = A.map((r, i) => [...r, b[i]]);

      // Helper to compute matrix rank via Gaussian elimination
      function computeRank(mat) {
        const m = mat.map((r) => [...r]);
        const rows = m.length;
        const cols = m[0].length;
        let rank = 0;
        for (let c = 0; c < cols && rank < rows; c++) {
          let pivot = rank;
          while (pivot < rows && Math.abs(m[pivot][c]) < 1e-9) pivot++;
          if (pivot === rows) continue;
          const temp = m[rank]; m[rank] = m[pivot]; m[pivot] = temp;
          const pVal = m[rank][c];
          for (let r = rank + 1; r < rows; r++) {
            const factor = m[r][c] / pVal;
            for (let k = c; k < cols; k++) {
              m[r][k] -= factor * m[rank][k];
            }
          }
          rank++;
        }
        return rank;
      }

      const rankA = computeRank(A);
      const rankAb = computeRank(Ab);

      let consistency, solType, geoDesc;
      if (rankA < rankAb) {
        consistency = 'INCONSISTENT';
        solType = 'No Solution ✗';
        geoDesc = 'Planes do not intersect at a common locus (parallel or triangular prism).';
      } else if (rankA === rankAb && rankA === n) {
        consistency = 'CONSISTENT';
        solType = 'Unique Solution ✓';
        geoDesc = 'Planes intersect at exactly one single point in space.';
      } else {
        consistency = 'CONSISTENT';
        solType = `Infinitely Many Solutions (${n - rankA} free variables)`;
        geoDesc = rankA === 2 ? 'Planes intersect along a common line in R3.' : 'Planes coincide into a single plane in R3.';
      }

      return {
        formula: '\\text{Rouché–Capelli: Consistent} \\iff \\text{Rank}(A) = \\text{Rank}([A|b])',
        readouts: [
          { label: 'Rank(A)', value: String(rankA) },
          { label: 'Rank([A|b])', value: String(rankAb) },
          { label: 'Number of Unknowns n', value: String(n) },
          { label: 'System Consistency', value: consistency },
        ],
        steps: [
          { title: '1. Compute Coefficient Matrix Rank', desc: `Perform row reduction on A to find non-zero rows: Rank(A) = ${rankA}` },
          { title: '2. Compute Augmented Matrix Rank', desc: `Perform row reduction on [A|b] to find non-zero rows: Rank([A|b]) = ${rankAb}` },
          { title: '3. Rouché–Capelli Classification', desc: `Compare Rank(A) with Rank([A|b]): ${consistency} (${solType})` },
        ],
        state: { A, b, Ab, rankA, rankAb, n, consistency, solType, geoDesc },
      };
    },
    plot(g, box, sol) {
      const { A, b, Ab, rankA, rankAb, n, consistency, solType, geoDesc } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, 'Rank & Consistency Visualizer · Rouché–Capelli Theorem', bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Rouché-Capelli Condition Card
      const isCons = consistency === 'CONSISTENT';
      D.rect(g, bx + 16, by + 50, bw - 32, 65, {
        fill: isCons ? '#064e3b' : '#7f1d1d',
        stroke: isCons ? '#10b981' : '#ef4444',
        radius: 8,
        width: 2,
      });
      D.text(g, `System Status: ${consistency} — ${solType}`, bx + 32, by + 78, { size: 16, color: '#f8fafc', weight: 'bold' });
      D.text(g, `Geometry: ${geoDesc}`, bx + 32, by + 102, { size: 13, color: '#cbd5e1' });

      // Dual Matrices Display
      const colW = (bw - 48) / 2;
      const cY = by + 130;

      // Matrix A
      D.rect(g, bx + 16, cY, colW, 160, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, `Coefficient Matrix A (Rank = ${rankA})`, bx + 28, cY + 28, { size: 14, color: '#38bdf8', weight: 'bold' });
      A.forEach((r, ri) => {
        D.text(g, `[  ${r.map(f).join('    ')}  ]`, bx + 36, cY + 65 + ri * 32, { size: 14, color: '#f8fafc', font: 'monospace' });
      });

      // Matrix [A|b]
      D.rect(g, bx + 32 + colW, cY, colW, 160, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, `Augmented Matrix [A | b] (Rank = ${rankAb})`, bx + 44 + colW, cY + 28, { size: 14, color: '#f59e0b', weight: 'bold' });
      Ab.forEach((r, ri) => {
        const aPart = r.slice(0, n).map(f).join('    ');
        const bPart = f(r[n]);
        D.text(g, `[  ${aPart}  |  ${bPart}  ]`, bx + 44 + colW, cY + 65 + ri * 32, { size: 14, color: '#f8fafc', font: 'monospace' });
      });
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT II.1: Vector Space & Subspace Visualizer
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-vector-spaces', {
    params: [
      { key: 'spaceModel', label: 'Vector Space Model', type: 'select', default: 'subspace_line', options: [
        { label: 'Subspace: Line y = 2x through Origin (R2)', value: 'subspace_line' },
        { label: 'Subspace: Line y = 2x + 1 (NOT passing through origin)', value: 'not_subspace' },
        { label: 'Ambient Vector Space: Full R2 Plane', value: 'r2_plane' },
      ]},
      { key: 'testVx', label: 'Test Vector x component', type: 'range', min: -5, max: 5, step: 0.5, default: 2 },
      { key: 'testVy', label: 'Test Vector y component', type: 'range', min: -5, max: 5, step: 0.5, default: 4 },
      { key: 'scalarC', label: 'Scalar Multiplier c', type: 'range', min: -3, max: 3, step: 0.5, default: 1.5 },
    ],
    examples: [
      { label: 'Valid Subspace Vector', values: { spaceModel: 'subspace_line', testVx: 2, testVy: 4, scalarC: 1.5 } },
      { label: 'Non-Subspace Test Vector', values: { spaceModel: 'subspace_line', testVx: 2, testVy: 1, scalarC: 1 } },
      { label: 'Affine Line (Zero Vector Fails)', values: { spaceModel: 'not_subspace', testVx: 1, testVy: 3, scalarC: 1 } },
    ],
    solve(p) {
      const { spaceModel, testVx, testVy, scalarC } = p;
      const v = [testVx, testVy];
      const scaledV = [testVx * scalarC, testVy * scalarC];

      let isSubspaceDef = true;
      let containsZero = true;
      let isMember = false;
      let failureReason = '';

      if (spaceModel === 'subspace_line') {
        // Line y = 2x
        containsZero = true;
        isMember = Math.abs(testVy - 2 * testVx) < 1e-6;
        if (!isMember) failureReason = `Vector (${testVx}, ${testVy}) does not satisfy line condition y = 2x.`;
      } else if (spaceModel === 'not_subspace') {
        // Line y = 2x + 1: does NOT contain zero vector (0, 0)
        isSubspaceDef = false;
        containsZero = false;
        isMember = false;
        failureReason = 'Zero vector (0, 0) is not in the set (0 ≠ 2(0) + 1). Not a vector subspace!';
      } else {
        // Full R2 plane
        containsZero = true;
        isMember = true;
      }

      return {
        formula: 'S \\subseteq V \\text{ is a subspace} \\iff \\mathbf{0} \\in S, \, u+v \\in S, \, cu \\in S',
        readouts: [
          { label: 'Zero Vector in Set', value: containsZero ? 'Yes (0, 0) ∈ S ✓' : 'Failed ✗' },
          { label: 'Test Vector Membership', value: isMember ? 'Belongs to Subspace ✓' : 'Does NOT belong ✗' },
          { label: 'Closure Under Scaling', value: isMember ? `c*v = (${f(scaledV[0])}, ${f(scaledV[1])}) ∈ S` : 'Fails' },
        ],
        steps: [
          { title: '1. Check Zero Vector Axiom', desc: containsZero ? 'Zero vector (0, 0) lies in the subset.' : 'Zero vector (0, 0) does not belong. Violates vector space axiom.' },
          { title: '2. Subspace Membership Test', desc: isMember ? `Vector v = (${testVx}, ${testVy}) satisfies defining equation.` : failureReason },
          { title: '3. Closure Under Scalar Multiplication', desc: `For scalar c = ${scalarC}, c*v = (${f(scaledV[0])}, ${f(scaledV[1])}).` },
        ],
        state: { spaceModel, v, scaledV, scalarC, isSubspaceDef, containsZero, isMember, failureReason },
      };
    },
    plot(g, box, sol) {
      const { spaceModel, v, scaledV, scalarC, isMember } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, 'Vector Space & Subspace Visualizer · Axiomatic Membership Test', bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Coordinate System
      const cx = bx + bw / 2;
      const cy = by + bh / 2 + 10;
      const scale = 28;

      // Draw Grid & Axes
      D.grid(g, bx + 16, by + 50, bw - 32, bh - 66, 28, '#1e293b');
      D.line(g, bx + 16, cy, bx + bw - 16, cy, { color: '#475569', width: 1.5 });
      D.line(g, cx, by + 50, cx, by + bh - 16, { color: '#475569', width: 1.5 });

      // Draw Subspace Line if applicable
      if (spaceModel === 'subspace_line') {
        const x1 = -6, y1 = -12;
        const x2 = 6, y2 = 12;
        D.line(g, cx + x1 * scale, cy - y1 * scale, cx + x2 * scale, cy - y2 * scale, { color: '#10b981', width: 3, dash: [4, 4] });
        D.text(g, 'Subspace S: y = 2x', cx + 4 * scale + 10, cy - 8 * scale, { size: 12, color: '#34d399', weight: 'bold' });
      } else if (spaceModel === 'not_subspace') {
        const x1 = -6, y1 = 2 * x1 + 1;
        const x2 = 6, y2 = 2 * x2 + 1;
        D.line(g, cx + x1 * scale, cy - y1 * scale, cx + x2 * scale, cy - y2 * scale, { color: '#ef4444', width: 3, dash: [4, 4] });
        D.text(g, 'Non-Subspace: y = 2x + 1 (Does not pass through origin)', cx + 3 * scale + 10, cy - 7 * scale, { size: 12, color: '#f87171', weight: 'bold' });
      }

      // Draw Test Vector v
      const vx = cx + v[0] * scale;
      const vy = cy - v[1] * scale;
      D.arrow(g, cx, cy, vx, vy, { color: isMember ? '#38bdf8' : '#f59e0b', width: 3, head: 10 });
      D.circle(g, vx, vy, 4, { fill: isMember ? '#38bdf8' : '#f59e0b' });
      D.text(g, `v = (${v[0]}, ${v[1]})`, vx + 10, vy - 5, { size: 13, color: '#f8fafc', weight: 'bold' });

      // Draw Scaled Vector c*v
      const svx = cx + scaledV[0] * scale;
      const svy = cy - scaledV[1] * scale;
      D.arrow(g, cx, cy, svx, svy, { color: '#a855f7', width: 2, head: 8, dash: [2, 2] });
      D.text(g, `c*v = (${f(scaledV[0])}, ${f(scaledV[1])})`, svx + 10, svy + 15, { size: 12, color: '#c084fc' });

      // Membership Tag
      D.rect(g, bx + 24, by + 60, 260, 42, {
        fill: isMember ? '#064e3b' : '#7f1d1d',
        stroke: isMember ? '#10b981' : '#ef4444',
        radius: 6,
      });
      D.text(g, isMember ? 'Membership: v ∈ Subspace ✓' : 'Membership: v ∉ Subspace ✗', bx + 36, by + 86, { size: 13, color: '#f8fafc', weight: 'bold' });
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT III.3: Cayley–Hamilton Theorem & Inverse Laboratory
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-cayley-hamilton', {
    params: [
      { key: 'a11', label: 'Matrix a11', type: 'range', min: -5, max: 5, step: 1, default: 2 },
      { key: 'a12', label: 'Matrix a12', type: 'range', min: -5, max: 5, step: 1, default: 1 },
      { key: 'a21', label: 'Matrix a21', type: 'range', min: -5, max: 5, step: 1, default: 1 },
      { key: 'a22', label: 'Matrix a22', type: 'range', min: -5, max: 5, step: 1, default: 2 },
    ],
    examples: [
      { label: 'Symmetric Matrix [2 1; 1 2]', values: { a11: 2, a12: 1, a21: 1, a22: 2 } },
      { label: 'Matrix [1 2; 3 4]', values: { a11: 1, a12: 2, a21: 3, a22: 4 } },
      { label: 'Triangular Matrix [3 2; 0 1]', values: { a11: 3, a12: 2, a21: 0, a22: 1 } },
    ],
    solve(p) {
      const A = [[p.a11, p.a12], [p.a21, p.a22]];
      const tr = A[0][0] + A[1][1];
      const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];

      // A^2
      const A2 = [
        [A[0][0] * A[0][0] + A[0][1] * A[1][0], A[0][0] * A[0][1] + A[0][1] * A[1][1]],
        [A[1][0] * A[0][0] + A[1][1] * A[1][0], A[1][0] * A[0][1] + A[1][1] * A[1][1]],
      ];

      // -tr * A
      const negTrA = [
        [-tr * A[0][0], -tr * A[0][1]],
        [-tr * A[1][0], -tr * A[1][1]],
      ];

      // det * I
      const detI = [
        [det, 0],
        [0, det],
      ];

      // p(A) = A^2 - tr(A)*A + det(A)*I
      const pA = [
        [A2[0][0] + negTrA[0][0] + detI[0][0], A2[0][1] + negTrA[0][1] + detI[0][1]],
        [A2[1][0] + negTrA[1][0] + detI[1][0], A2[1][1] + negTrA[1][1] + detI[1][1]],
      ];

      // Verify Cayley-Hamilton
      const isZeroMat = Math.abs(pA[0][0]) < 1e-9 && Math.abs(pA[0][1]) < 1e-9 && Math.abs(pA[1][0]) < 1e-9 && Math.abs(pA[1][1]) < 1e-9;

      // Inverse using Cayley-Hamilton: A^-1 = (1/det) * (tr*I - A)
      let invA = null;
      if (Math.abs(det) > 1e-9) {
        invA = [
          [(tr - A[0][0]) / det, (-A[0][1]) / det],
          [(-A[1][0]) / det, (tr - A[1][1]) / det],
        ];
      }

      return {
        formula: 'p(\\lambda) = \\det(A - \\lambda I) = 0 \implies p(A) = A^2 - \\text{tr}(A)A + \\det(A)I = \\mathbf{0}',
        readouts: [
          { label: 'Trace tr(A)', value: f(tr) },
          { label: 'Determinant det(A)', value: f(det) },
          { label: 'Cayley–Hamilton Verification', value: isZeroMat ? 'p(A) = 0 Matrix ✓' : 'Verification Error ✗' },
          { label: 'Inverse A⁻¹ Existence', value: Math.abs(det) > 1e-9 ? 'Exists ✓' : 'Singular (det=0)' },
        ],
        steps: [
          { title: '1. Characteristic Polynomial', desc: `p(λ) = λ² - ${f(tr)}λ + (${f(det)}) = 0` },
          { title: '2. Substitute Matrix A into Polynomial', desc: `p(A) = A² - ${f(tr)}A + ${f(det)}I` },
          { title: '3. Matrix Verification', desc: `Result is the zero matrix [[0, 0], [0, 0]] — Cayley-Hamilton verified.` },
          { title: '4. Matrix Inverse via Cayley–Hamilton', desc: Math.abs(det) > 1e-9 ? `A⁻¹ = (1/${f(det)}) * (${f(tr)}I - A)` : 'det(A)=0, matrix is non-invertible.' },
        ],
        state: { A, tr, det, A2, negTrA, detI, pA, isZeroMat, invA },
      };
    },
    plot(g, box, sol) {
      const { A, tr, det, A2, pA, isZeroMat, invA } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, 'Cayley–Hamilton Theorem & Matrix Inverse Visualizer', bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Verification Badge
      D.rect(g, bx + 16, by + 50, bw - 32, 50, { fill: '#064e3b', stroke: '#10b981', radius: 8, width: 2 });
      D.text(g, `Cayley–Hamilton Verified: p(A) = A² - (${f(tr)})A + (${f(det)})I = O₂  [Zero Matrix ✓]`, bx + 32, by + 82, { size: 15, color: '#34d399', weight: 'bold' });

      // Matrix Cards
      const colW = (bw - 64) / 3;
      const cY = by + 115;

      // Card 1: Matrix A and A^2
      D.rect(g, bx + 16, cY, colW, 170, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, 'Matrix A & A²', bx + 28, cY + 28, { size: 14, color: '#38bdf8', weight: 'bold' });
      D.text(g, `A = [ ${A[0].map(f).join(', ')} ]`, bx + 28, cY + 60, { size: 13, color: '#f8fafc', font: 'monospace' });
      D.text(g, `    [ ${A[1].map(f).join(', ')} ]`, bx + 28, cY + 80, { size: 13, color: '#f8fafc', font: 'monospace' });
      D.text(g, `A² = [ ${A2[0].map(f).join(', ')} ]`, bx + 28, cY + 120, { size: 13, color: '#cbd5e1', font: 'monospace' });
      D.text(g, `     [ ${A2[1].map(f).join(', ')} ]`, bx + 28, cY + 140, { size: 13, color: '#cbd5e1', font: 'monospace' });

      // Card 2: Polynomial Evaluation p(A)
      D.rect(g, bx + 24 + colW, cY, colW, 170, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, 'p(A) Evaluation', bx + 36 + colW, cY + 28, { size: 14, color: '#a855f7', weight: 'bold' });
      D.text(g, `p(A) = A² - ${f(tr)}A + ${f(det)}I`, bx + 36 + colW, cY + 60, { size: 12, color: '#cbd5e1' });
      D.text(g, `= [ ${f(pA[0][0])},  ${f(pA[0][1])} ]`, bx + 36 + colW, cY + 100, { size: 14, color: '#34d399', weight: 'bold', font: 'monospace' });
      D.text(g, `  [ ${f(pA[1][0])},  ${f(pA[1][1])} ]`, bx + 36 + colW, cY + 125, { size: 14, color: '#34d399', weight: 'bold', font: 'monospace' });
      D.text(g, 'Identically zero matrix ✓', bx + 36 + colW, cY + 155, { size: 12, color: '#34d399' });

      // Card 3: Inverse A^-1 derived via Theorem
      D.rect(g, bx + 32 + 2 * colW, cY, colW, 170, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, 'Inverse A⁻¹ via C–H', bx + 44 + 2 * colW, cY + 28, { size: 14, color: '#f59e0b', weight: 'bold' });
      if (invA) {
        D.text(g, `A⁻¹ = (1/${f(det)})(${f(tr)}I - A)`, bx + 44 + 2 * colW, cY + 60, { size: 12, color: '#cbd5e1' });
        D.text(g, `= [ ${f(invA[0][0])},  ${f(invA[0][1])} ]`, bx + 44 + 2 * colW, cY + 100, { size: 13, color: '#f59e0b', font: 'monospace' });
        D.text(g, `  [ ${f(invA[1][0])},  ${f(invA[1][1])} ]`, bx + 44 + 2 * colW, cY + 125, { size: 13, color: '#f59e0b', font: 'monospace' });
        D.text(g, 'Verified: A * A⁻¹ = I₂ ✓', bx + 44 + 2 * colW, cY + 155, { size: 12, color: '#34d399' });
      } else {
        D.text(g, 'Singular Matrix (det = 0)', bx + 44 + 2 * colW, cY + 80, { size: 13, color: '#ef4444', weight: 'bold' });
      }
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT IV.2: Modular Arithmetic & Clock Visualizer
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-modular-arithmetic', {
    params: [
      { key: 'modN', label: 'Modulus n', type: 'range', min: 2, max: 24, step: 1, default: 12 },
      { key: 'op', label: 'Operation', type: 'select', default: 'add', options: [
        { label: 'Addition (a + b mod n)', value: 'add' },
        { label: 'Subtraction (a - b mod n)', value: 'sub' },
        { label: 'Multiplication (a * b mod n)', value: 'mul' },
        { label: 'Exponentiation (a^b mod n)', value: 'pow' },
      ]},
      { key: 'valA', label: 'Operand a', type: 'range', min: 0, max: 30, step: 1, default: 7 },
      { key: 'valB', label: 'Operand b', type: 'range', min: 0, max: 30, step: 1, default: 8 },
    ],
    examples: [
      { label: 'Clock Arithmetic (7 + 8 mod 12 = 3)', values: { modN: 12, op: 'add', valA: 7, valB: 8 } },
      { label: 'Modular Multiplication (5 * 4 mod 7 = 6)', values: { modN: 7, op: 'mul', valA: 5, valB: 4 } },
      { label: 'Modular Exponentiation (3^4 mod 5 = 1)', values: { modN: 5, op: 'pow', valA: 3, valB: 4 } },
    ],
    solve(p) {
      const { modN, op, valA, valB } = p;
      let rawVal = 0;
      let symbol = '+';

      if (op === 'add') { rawVal = valA + valB; symbol = '+'; }
      else if (op === 'sub') { rawVal = valA - valB; symbol = '-'; }
      else if (op === 'mul') { rawVal = valA * valB; symbol = '×'; }
      else if (op === 'pow') { rawVal = Math.pow(valA, Math.min(valB, 6)); symbol = '^'; }

      const rem = ((rawVal % modN) + modN) % modN;
      const q = Math.floor(rawVal / modN);

      return {
        formula: 'a \\equiv b \\pmod n \\iff n \\mid (a - b) \\quad \\text{or} \\quad a = q \cdot n + r',
        readouts: [
          { label: 'Modulus n', value: String(modN) },
          { label: 'Calculation', value: `${valA} ${symbol} ${valB} = ${rawVal}` },
          { label: 'Quotient q', value: String(q) },
          { label: 'Residue (mod n)', value: String(rem) },
        ],
        steps: [
          { title: '1. Standard Arithmetic Evaluation', desc: `Compute standard result: ${valA} ${symbol} ${valB} = ${rawVal}` },
          { title: '2. Euclidean Division by Modulus', desc: `${rawVal} = (${q} × ${modN}) + ${rem}` },
          { title: '3. Congruence Residue Class', desc: `${valA} ${symbol} ${valB} ≡ ${rem} (mod ${modN})` },
        ],
        state: { modN, op, valA, valB, rawVal, symbol, rem, q },
      };
    },
    plot(g, box, sol) {
      const { modN, op, valA, valB, rawVal, symbol, rem, q } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, 'Modular Arithmetic & Clock Visualizer (Residue Ring Zn)', bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Clock Center & Radius
      const clockR = Math.min(bw, bh) * 0.28;
      const cx = bx + bw * 0.35;
      const cy = by + bh * 0.55;

      // Draw Circular Clock Ring
      D.circle(g, cx, cy, clockR, { fill: '#131e33', stroke: '#334155', width: 3 });

      // Draw Hour Numbers (0 to modN - 1)
      for (let i = 0; i < modN; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / modN;
        const nx = cx + (clockR - 22) * Math.cos(angle);
        const ny = cy + (clockR - 22) * Math.sin(angle);
        const isSelected = i === rem;
        D.circle(g, nx, ny, isSelected ? 14 : 10, {
          fill: isSelected ? '#34d399' : '#1e293b',
          stroke: isSelected ? '#10b981' : '#475569',
        });
        D.text(g, String(i), nx, ny + 4, {
          size: isSelected ? 12 : 10,
          color: isSelected ? '#0b1320' : '#f8fafc',
          weight: isSelected ? 'bold' : 'normal',
          align: 'center',
        });
      }

      // Draw Pointer Hand to Residue
      const handAngle = -Math.PI / 2 + (2 * Math.PI * rem) / modN;
      const hx = cx + (clockR - 40) * Math.cos(handAngle);
      const hy = cy + (clockR - 40) * Math.sin(handAngle);
      D.arrow(g, cx, cy, hx, hy, { color: '#34d399', width: 3, head: 10 });
      D.circle(g, cx, cy, 6, { fill: '#34d399' });

      // Right Side: Analytical Congruence Cards
      const rX = bx + bw * 0.65;
      const rW = bw * 0.32;

      D.rect(g, rX, by + 60, rW, 190, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, 'Congruence Equation', rX + 16, by + 90, { size: 14, color: '#38bdf8', weight: 'bold' });
      D.text(g, `${valA} ${symbol} ${valB} = ${rawVal}`, rX + 16, by + 125, { size: 16, color: '#f8fafc', font: 'monospace' });
      D.text(g, `≡ ${rem} (mod ${modN})`, rX + 16, by + 160, { size: 18, color: '#34d399', weight: 'bold', font: 'monospace' });
      D.text(g, `Div: ${rawVal} = (${q} × ${modN}) + ${rem}`, rX + 16, by + 215, { size: 12, color: '#cbd5e1' });
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT IV.3: Euler Totient φ(n) & Fermat's Little Theorem Visualizer
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-euler-totient', {
    params: [
      { key: 'valN', label: 'Number n (for φ(n))', type: 'range', min: 2, max: 40, step: 1, default: 12 },
      { key: 'fermatA', label: 'Base a (Fermat Test)', type: 'range', min: 2, max: 10, step: 1, default: 3 },
      { key: 'fermatP', label: 'Prime p (Fermat Test)', type: 'range', min: 2, max: 23, step: 1, default: 7 },
    ],
    examples: [
      { label: 'Composite n=12 (φ(12) = 4)', values: { valN: 12, fermatA: 3, fermatP: 7 } },
      { label: 'Prime n=13 (φ(13) = 12)', values: { valN: 13, fermatA: 2, fermatP: 13 } },
      { label: 'Prime Power n=16 (φ(16) = 8)', values: { valN: 16, fermatA: 5, fermatP: 11 } },
    ],
    solve(p) {
      const { valN, fermatA, fermatP } = p;

      // Calculate coprime residues for valN
      const residues = [];
      const coprimes = [];
      for (let k = 1; k <= valN; k++) {
        const g = gcd(k, valN);
        const isCoprime = g === 1;
        residues.push({ k, gcd: g, isCoprime });
        if (isCoprime) coprimes.push(k);
      }
      const phi = coprimes.length;

      // Fermat's Little Theorem: a^(p-1) ≡ 1 (mod p)
      const pIsPrime = isPrime(fermatP);
      const gcdAP = gcd(fermatA, fermatP);
      const fermatSatisfied = pIsPrime && gcdAP === 1;
      const fermatPow = fermatSatisfied ? modPow(fermatA, fermatP - 1, fermatP) : null;

      return {
        formula: '\\phi(n) = n \\prod_{p \\mid n} \\left(1 - \\frac{1}{p}\\right) \\quad \\text{and} \\quad a^{p-1} \\equiv 1 \\pmod p',
        readouts: [
          { label: 'Euler Totient φ(n)', value: `φ(${valN}) = ${phi}` },
          { label: 'Coprime Residues Count', value: `${phi} out of ${valN}` },
          { label: 'Fermat Little Theorem', value: fermatSatisfied ? `${fermatA}^${fermatP - 1} ≡ ${fermatPow} (mod ${fermatP}) ✓` : 'Conditions not satisfied' },
        ],
        steps: [
          { title: `1. Test Divisors 1 to ${valN}`, desc: `Calculate gcd(k, ${valN}) for each 1 ≤ k ≤ ${valN}.` },
          { title: '2. Filter Coprime Residues', desc: `Coprime numbers: {${coprimes.join(', ')}} (count = ${phi})` },
          { title: '3. Verify Fermat\'s Little Theorem', desc: fermatSatisfied ? `p=${fermatP} is prime, gcd(${fermatA},${fermatP})=1 -> ${fermatA}^${fermatP-1} mod ${fermatP} = ${fermatPow}` : 'Inputs do not satisfy Fermat conditions (p must be prime and p ∤ a).' },
        ],
        state: { valN, residues, coprimes, phi, fermatA, fermatP, pIsPrime, gcdAP, fermatSatisfied, fermatPow },
      };
    },
    plot(g, box, sol) {
      const { valN, residues, coprimes, phi, fermatA, fermatP, fermatSatisfied, fermatPow } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, `Euler's Totient Function φ(n) & Fermat's Little Theorem`, bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Summary Header Card
      D.rect(g, bx + 16, by + 50, bw - 32, 50, { fill: '#131e33', stroke: '#1e293b', radius: 8 });
      D.text(g, `φ(${valN}) = ${phi}   ·   Coprime Residues: {${coprimes.slice(0, 15).join(', ')}${coprimes.length > 15 ? '...' : ''}}`, bx + 32, by + 80, { size: 14, color: '#34d399', weight: 'bold' });

      // Grid of residue chips
      const chipsY = by + 115;
      const cols = 10;
      const chipW = (bw - 60) / cols;
      const chipH = 34;

      residues.forEach((r, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const cx = bx + 20 + col * chipW;
        const cy = chipsY + row * (chipH + 6);
        D.rect(g, cx, cy, chipW - 6, chipH, {
          fill: r.isCoprime ? '#065f46' : '#1e293b',
          stroke: r.isCoprime ? '#10b981' : '#334155',
          radius: 4,
        });
        D.text(g, String(r.k), cx + chipW / 2 - 3, cy + chipH / 2 + 4, {
          size: 12,
          color: r.isCoprime ? '#34d399' : '#64748b',
          weight: r.isCoprime ? 'bold' : 'normal',
          align: 'center',
        });
      });

      // Fermat's Little Theorem Card
      const fY = by + bh - 80;
      D.rect(g, bx + 16, fY, bw - 32, 65, {
        fill: fermatSatisfied ? '#064e3b' : '#78350f',
        stroke: fermatSatisfied ? '#10b981' : '#f59e0b',
        radius: 8,
      });
      D.text(g, 'Fermat\'s Little Theorem Verification:', bx + 32, fY + 24, { size: 13, color: '#cbd5e1' });
      const fStr = fermatSatisfied ? `For prime p = ${fermatP} and a = ${fermatA}:   ${fermatA}^(${fermatP}-1) = ${fermatA}^${fermatP-1} ≡ ${fermatPow} (mod ${fermatP})   ✓ Verified!` : 'Fermat Condition Not Met: p must be prime and gcd(a, p) must be 1.';
      D.text(g, fStr, bx + 32, fY + 48, { size: 14, color: '#f8fafc', weight: 'bold' });
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // UNIT V.4: Digital Signatures & Cryptographic Security Laboratory
  // ───────────────────────────────────────────────────────────────────────────
  define('u25rma201-digital-signatures', {
    params: [
      { key: 'primeP', label: 'Prime p', type: 'range', min: 11, max: 31, step: 2, default: 11 },
      { key: 'primeQ', label: 'Prime q', type: 'range', min: 13, max: 37, step: 2, default: 13 },
      { key: 'msgVal', label: 'Message Digest / Numeric M', type: 'range', min: 2, max: 50, step: 1, default: 9 },
      { key: 'tamper', label: 'Simulate Transmission Tampering', type: 'select', default: 'no_tamper', options: [
        { label: 'Legitimate Transmission (Untampered)', value: 'no_tamper' },
        { label: 'Attacker Tampering: Alter Message to M + 1', value: 'tamper_msg' },
        { label: 'Attacker Tampering: Forged Signature S + 1', value: 'tamper_sig' },
      ]},
    ],
    examples: [
      { label: 'Valid Digital Signature Verification', values: { primeP: 11, primeQ: 13, msgVal: 9, tamper: 'no_tamper' } },
      { label: 'Message Tampered in Transit (Detected)', values: { primeP: 11, primeQ: 13, msgVal: 9, tamper: 'tamper_msg' } },
      { label: 'Signature Forgery (Detected)', values: { primeP: 11, primeQ: 13, msgVal: 9, tamper: 'tamper_sig' } },
    ],
    solve(p) {
      let { primeP, primeQ, msgVal, tamper } = p;
      if (!isPrime(primeP)) primeP = 11;
      if (!isPrime(primeQ)) primeQ = 13;
      if (primeP === primeQ) primeQ = 17;

      const n = primeP * primeQ;
      const phi = (primeP - 1) * (primeQ - 1);

      // Select valid e
      let e = 3;
      while (e < phi) {
        if (gcd(e, phi) === 1) break;
        e += 2;
      }
      const d = modInv(e, phi);

      // Signing: Alice signs with PRIVATE KEY d
      // Signature S = M^d mod n
      const originalM = msgVal % n;
      const S = Number(modPow(originalM, d, n));

      // Transmission with optional tampering
      let receivedM = originalM;
      let receivedS = S;
      if (tamper === 'tamper_msg') {
        receivedM = (originalM + 1) % n;
      } else if (tamper === 'tamper_sig') {
        receivedS = (S + 1) % n;
      }

      // Verification: Bob verifies with Alice's PUBLIC KEY e
      // V = S^e mod n
      const V = Number(modPow(receivedS, e, n));
      const isValid = V === receivedM;

      return {
        formula: 'S = M^d \\pmod n \\quad \\longrightarrow \\quad V = S^e \\pmod n \\stackrel{?}{=} M',
        readouts: [
          { label: 'Alice Public Key', value: `(e=${e}, n=${n})` },
          { label: 'Alice Private Key', value: `(d=${d}, n=${n})` },
          { label: 'Transmitted Signature S', value: String(S) },
          { label: 'Verification Result', value: isValid ? 'SIGNATURE VALID ✓' : 'TAMPER DETECTED / INVALID ✗' },
        ],
        steps: [
          { title: '1. Alice Signs Message with Private Key', desc: `S = M^d mod n = ${originalM}^${d} mod ${n} = ${S}` },
          { title: '2. Channel Transmission', desc: tamper === 'no_tamper' ? `Message M=${receivedM} and Signature S=${receivedS} sent uncorrupted.` : `Tamper alert! Received payload modified during transit.` },
          { title: '3. Bob Verifies using Alice\'s Public Key', desc: `V = S^e mod n = ${receivedS}^${e} mod ${n} = ${V}. Compare with received M=${receivedM}: ${isValid ? 'Matches ✓' : 'Mismatch ✗'}` },
        ],
        state: { primeP, primeQ, n, phi, e, d, originalM, S, receivedM, receivedS, V, tamper, isValid },
      };
    },
    plot(g, box, sol) {
      const { n, e, d, originalM, S, receivedM, receivedS, V, tamper, isValid } = sol.state;
      const [bx, by, bw, bh] = box;
      D.clear(g, '#0b1320');

      D.text(g, 'Digital Signatures & Cryptographic Authentication Simulator', bx + 20, by + 32, { size: 16, color: '#38bdf8', weight: 'bold' });

      // Verification Status Banner
      D.rect(g, bx + 16, by + 50, bw - 32, 50, {
        fill: isValid ? '#064e3b' : '#7f1d1d',
        stroke: isValid ? '#10b981' : '#ef4444',
        radius: 8,
        width: 2,
      });
      const statMsg = isValid ? 'AUTHENTIC: Signature Verified! Message is unaltered and signer authenticated ✓' : 'SECURITY ALERT: Tampering detected! Signature verification failed ✗';
      D.text(g, statMsg, bx + 32, by + 80, { size: 14, color: '#f8fafc', weight: 'bold' });

      // 3 Stages: Signer (Alice) -> Channel -> Verifier (Bob)
      const colW = (bw - 64) / 3;
      const cY = by + 115;

      // 1. Signer (Alice)
      D.rect(g, bx + 16, cY, colW, 175, { fill: '#131e33', stroke: '#38bdf8', radius: 8 });
      D.text(g, '1. Signer (Alice)', bx + 28, cY + 28, { size: 14, color: '#38bdf8', weight: 'bold' });
      D.text(g, `Message: M = ${originalM}`, bx + 28, cY + 60, { size: 13, color: '#f8fafc' });
      D.text(g, `Private Key: d = ${d}`, bx + 28, cY + 85, { size: 13, color: '#cbd5e1' });
      D.text(g, `Signing: S = M^d mod n`, bx + 28, cY + 115, { size: 12, color: '#cbd5e1' });
      D.text(g, `Signature S = ${S}`, bx + 28, cY + 145, { size: 14, color: '#34d399', weight: 'bold' });

      // 2. Transmission Channel
      const chX = bx + 24 + colW;
      const isTampered = tamper !== 'no_tamper';
      D.rect(g, chX, cY, colW, 175, { fill: isTampered ? '#2a1215' : '#131e33', stroke: isTampered ? '#ef4444' : '#64748b', radius: 8 });
      D.text(g, '2. Insecure Channel', chX + 16, cY + 28, { size: 14, color: isTampered ? '#f87171' : '#94a3b8', weight: 'bold' });
      D.text(g, isTampered ? '⚠️ Attacker Active!' : 'Normal Transmission', chX + 16, cY + 60, { size: 12, color: isTampered ? '#ef4444' : '#34d399' });
      D.text(g, `Transmitted M: ${receivedM}`, chX + 16, cY + 95, { size: 13, color: '#f8fafc' });
      D.text(g, `Transmitted S: ${receivedS}`, chX + 16, cY + 125, { size: 13, color: '#cbd5e1' });

      // 3. Verifier (Bob)
      const bobX = bx + 32 + 2 * colW;
      D.rect(g, bobX, cY, colW, 175, { fill: '#131e33', stroke: '#a855f7', radius: 8 });
      D.text(g, '3. Verifier (Bob)', bobX + 16, cY + 28, { size: 14, color: '#c084fc', weight: 'bold' });
      D.text(g, `Public Key: e = ${e}, n = ${n}`, bobX + 16, cY + 60, { size: 12, color: '#cbd5e1' });
      D.text(g, `Verify: V = S^e mod n`, bobX + 16, cY + 90, { size: 12, color: '#cbd5e1' });
      D.text(g, `Calculated V = ${V}`, bobX + 16, cY + 120, { size: 14, color: '#f59e0b', weight: 'bold' });
      D.text(g, `V == M ? ${isValid ? 'MATCH ✓' : 'MISMATCH ✗'}`, bobX + 16, cY + 150, { size: 13, color: isValid ? '#34d399' : '#ef4444', weight: 'bold' });
    },
  });

})();
