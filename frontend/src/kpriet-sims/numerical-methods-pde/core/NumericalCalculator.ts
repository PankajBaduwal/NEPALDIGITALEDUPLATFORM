/**
 * Production-Grade Deterministic Numerical Methods & PDE Engine
 * Course Code: U25MA402 — Numerical Methods and Partial Differential Equations
 * Department of Mechanical Engineering | Semester IV | Regulation R2025 Revised CBCS
 */

import type {
  RootFindingMethod,
  RootFindingResult,
  RootIterationStep,
  LinearSolverMethod,
  LinearSolverResult,
  MatrixRowOpStep,
  LinearIterStep,
  InterpolationMethod,
  InterpolationResult,
  DifferenceTable,
  DataPoint,
  DiffMethod,
  DifferentiationResult,
  IntegrationMethod,
  IntegrationResult,
  IntegrationStepInfo,
  ODEMethod,
  ODEResult,
  ODEStep,
  PDE1DHeatResult,
  PDE1DWaveResult,
  PDE2DLaplaceResult,
  ComparisonLaboratoryResult,
  MethodComparisonEntry,
  NumericalQuizQuestion,
} from './types';

// ─── Safe Mathematical Expression Parser ───
// Tokenizer & Recursive Descent Evaluator without eval() or Function()
export class SafeMathParser {
  private pos = 0;
  private tokens: string[] = [];

  private tokenize(expr: string): string[] {
    const raw = expr.replace(/\s+/g, '').toLowerCase();
    const tokens: string[] = [];
    let i = 0;
    while (i < raw.length) {
      const ch = raw[i] ?? '';
      if ('+-*/^()'.includes(ch)) {
        tokens.push(ch);
        i++;
      } else if (/[0-9.]/.test(ch)) {
        let numStr = '';
        while (i < raw.length && /[0-9.]/.test(raw[i] ?? '')) {
          numStr += raw[i] ?? '';
          i++;
        }
        tokens.push(numStr);
      } else if (/[a-z]/.test(ch)) {
        let ident = '';
        while (i < raw.length && /[a-z0-9_]/.test(raw[i] ?? '')) {
          ident += raw[i] ?? '';
          i++;
        }
        tokens.push(ident);
      } else {
        i++; // ignore unknown chars
      }
    }
    return tokens;
  }

  public evaluate(expr: string, vars: Record<string, number>): number {
    this.tokens = this.tokenize(expr);
    this.pos = 0;
    const res = this.parseExpression(vars);
    return isNaN(res) || !isFinite(res) ? 0 : res;
  }

  private parseExpression(vars: Record<string, number>): number {
    let result = this.parseTerm(vars);
    while (this.pos < this.tokens.length) {
      const op = this.tokens[this.pos];
      if (op === '+') {
        this.pos++;
        result += this.parseTerm(vars);
      } else if (op === '-') {
        this.pos++;
        result -= this.parseTerm(vars);
      } else {
        break;
      }
    }
    return result;
  }

  private parseTerm(vars: Record<string, number>): number {
    let result = this.parseFactor(vars);
    while (this.pos < this.tokens.length) {
      const op = this.tokens[this.pos];
      if (op === '*') {
        this.pos++;
        result *= this.parseFactor(vars);
      } else if (op === '/') {
        this.pos++;
        const denom = this.parseFactor(vars);
        result = Math.abs(denom) < 1e-15 ? 1e12 : result / denom;
      } else {
        break;
      }
    }
    return result;
  }

  private parseFactor(vars: Record<string, number>): number {
    let base = this.parseUnary(vars);
    if (this.pos < this.tokens.length && this.tokens[this.pos] === '^') {
      this.pos++;
      const exponent = this.parseFactor(vars);
      base = Math.pow(base, exponent);
    }
    return base;
  }

  private parseUnary(vars: Record<string, number>): number {
    if (this.pos < this.tokens.length && this.tokens[this.pos] === '-') {
      this.pos++;
      return -this.parsePrimary(vars);
    }
    if (this.pos < this.tokens.length && this.tokens[this.pos] === '+') {
      this.pos++;
      return this.parsePrimary(vars);
    }
    return this.parsePrimary(vars);
  }

  private parsePrimary(vars: Record<string, number>): number {
    if (this.pos >= this.tokens.length) return 0;
    const tok = this.tokens[this.pos];
    if (!tok) return 0;

    // Parentheses
    if (tok === '(') {
      this.pos++;
      const val = this.parseExpression(vars);
      if (this.pos < this.tokens.length && this.tokens[this.pos] === ')') {
        this.pos++;
      }
      return val;
    }

    // Number literal
    if (/^[0-9.]/.test(tok)) {
      this.pos++;
      return parseFloat(tok) || 0;
    }

    // Constants
    if (tok === 'pi') {
      this.pos++;
      return Math.PI;
    }
    if (tok === 'e') {
      this.pos++;
      return Math.E;
    }

    // Variables
    if (tok in vars) {
      this.pos++;
      return vars[tok] ?? 0;
    }

    // Mathematical Functions
    const fnMap: Record<string, (arg: number) => number> = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      exp: Math.exp,
      log: (v) => (v <= 0 ? -1e6 : Math.log(v)),
      ln: (v) => (v <= 0 ? -1e6 : Math.log(v)),
      log10: (v) => (v <= 0 ? -1e6 : Math.log10(v)),
      sqrt: (v) => (v < 0 ? 0 : Math.sqrt(v)),
      abs: Math.abs,
    };

    if (tok in fnMap && this.pos + 1 < this.tokens.length && this.tokens[this.pos + 1] === '(') {
      const fn = fnMap[tok];
      this.pos += 2; // skip fn name and '('
      const arg = this.parseExpression(vars);
      if (this.pos < this.tokens.length && this.tokens[this.pos] === ')') {
        this.pos++;
      }
      return fn ? fn(arg) : 0;
    }

    this.pos++;
    return 0;
  }
}

const parser = new SafeMathParser();

export class NumericalCalculator {
  // Helper to safely evaluate mathematical functions f(x)
  public static evalF(expr: string, x: number): number {
    return parser.evaluate(expr, { x });
  }

  // Helper to safely evaluate bivariate f(x, y) for ODEs
  public static evalFxy(expr: string, x: number, y: number): number {
    return parser.evaluate(expr, { x, y });
  }

  // Numerical derivative via high-accuracy central difference
  public static numericalDerivative(expr: string, x: number, h = 1e-5): number {
    const fPlus = NumericalCalculator.evalF(expr, x + h);
    const fMinus = NumericalCalculator.evalF(expr, x - h);
    return (fPlus - fMinus) / (2 * h);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 1: Root-Finding Methods
  // ═══════════════════════════════════════════════════════════════════════════
  public static solveRoot(
    method: RootFindingMethod,
    expr: string,
    initialA: number,
    initialB: number,
    tolerance = 1e-4,
    maxIterations = 50
  ): RootFindingResult {
    const steps: RootIterationStep[] = [];
    let converged = false;
    let root = initialA;
    let finalError = 1.0;
    let statusMessage = '';
    let isBracketValid = true;

    if (method === 'bisection' || method === 'regula-falsi') {
      let a = initialA;
      let b = initialB;
      let fa = NumericalCalculator.evalF(expr, a);
      let fb = NumericalCalculator.evalF(expr, b);

      // Check intermediate value bracketing condition f(a) * f(b) < 0
      if (fa * fb > 0) {
        isBracketValid = false;
        statusMessage = `Bracket violation: f(${a}) = ${fa.toFixed(4)} and f(${b}) = ${fb.toFixed(4)} have the same sign. Roots cannot be guaranteed under continuity.`;
        return {
          method,
          converged: false,
          root: a,
          iterationsCount: 0,
          steps: [],
          finalError: Math.abs(b - a),
          statusMessage,
          isBracketValid: false,
        };
      }

      let prevX = a;
      for (let iter = 1; iter <= maxIterations; iter++) {
        let c: number;
        if (method === 'bisection') {
          c = (a + b) / 2;
        } else {
          // Regula Falsi (False Position)
          c = (a * fb - b * fa) / (fb - fa);
        }

        const fc = NumericalCalculator.evalF(expr, c);
        const err = iter === 1 ? Math.abs(b - a) : Math.abs(c - prevX);

        steps.push({
          iteration: iter,
          a,
          b,
          xCurr: c,
          fCurr: fc,
          approxError: err,
          remarks: `f(c) = ${fc.toExponential(4)}, bracket updated to [${fa * fc < 0 ? a.toFixed(4) : c.toFixed(4)}, ${fa * fc < 0 ? c.toFixed(4) : b.toFixed(4)}]`,
        });

        if (err < tolerance || Math.abs(fc) < 1e-12) {
          converged = true;
          root = c;
          finalError = err;
          statusMessage = `Converged in ${iter} iterations to root x ≈ ${c.toFixed(6)} with tolerance ${tolerance}.`;
          break;
        }

        if (fa * fc < 0) {
          b = c;
          fb = fc;
        } else {
          a = c;
          fa = fc;
        }
        prevX = c;
        root = c;
        finalError = err;
      }

      if (!converged) {
        statusMessage = `Reached maximum iteration limit (${maxIterations}) without satisfying tolerance ${tolerance}.`;
      }
    } else if (method === 'newton-raphson') {
      let x = initialA; // starting guess x0
      for (let iter = 1; iter <= maxIterations; iter++) {
        const fx = NumericalCalculator.evalF(expr, x);
        const dfx = NumericalCalculator.numericalDerivative(expr, x);

        // Guard against vanishing or near-zero derivative
        if (Math.abs(dfx) < 1e-12) {
          steps.push({
            iteration: iter,
            xCurr: x,
            fCurr: fx,
            dfCurr: dfx,
            approxError: 0,
            remarks: 'Vanishing derivative: f\'(x) ≈ 0. Division by zero prevented. Method diverges.',
          });
          statusMessage = `Derivative vanished at x = ${x.toFixed(4)} (|f'(x)| < 1e-12). Newton-Raphson cannot continue from horizontal tangent.`;
          return {
            method,
            converged: false,
            root: x,
            iterationsCount: iter,
            steps,
            finalError: Math.abs(fx),
            statusMessage,
          };
        }

        const nextX = x - fx / dfx;
        const err = Math.abs(nextX - x);

        steps.push({
          iteration: iter,
          xCurr: x,
          fCurr: fx,
          dfCurr: dfx,
          approxError: err,
          remarks: `x_{${iter}} = ${nextX.toFixed(6)}, f'(x) = ${dfx.toFixed(4)}`,
        });

        if (err < tolerance || Math.abs(fx) < 1e-12) {
          converged = true;
          root = nextX;
          finalError = err;
          statusMessage = `Newton-Raphson converged in ${iter} iterations to x ≈ ${nextX.toFixed(6)} (quadratic convergence).`;
          break;
        }

        x = nextX;
        root = nextX;
        finalError = err;
      }

      if (!converged) {
        statusMessage = `Did not converge within ${maxIterations} iterations. Initial guess may be in an oscillation or divergence zone.`;
      }
    } else if (method === 'secant') {
      let x0 = initialA;
      let x1 = initialB;
      let f0 = NumericalCalculator.evalF(expr, x0);
      let f1 = NumericalCalculator.evalF(expr, x1);

      for (let iter = 1; iter <= maxIterations; iter++) {
        if (Math.abs(f1 - f0) < 1e-14) {
          statusMessage = 'Denominator f(x_k) - f(x_{k-1}) vanished. Secant slope is zero.';
          break;
        }

        const x2 = x1 - (f1 * (x1 - x0)) / (f1 - f0);
        const f2 = NumericalCalculator.evalF(expr, x2);
        const err = Math.abs(x2 - x1);

        steps.push({
          iteration: iter,
          a: x0,
          b: x1,
          xCurr: x2,
          fCurr: f2,
          approxError: err,
          remarks: `Secant chord intersection x_{${iter}} = ${x2.toFixed(6)}`,
        });

        if (err < tolerance || Math.abs(f2) < 1e-12) {
          converged = true;
          root = x2;
          finalError = err;
          statusMessage = `Secant method converged in ${iter} iterations to x ≈ ${x2.toFixed(6)} (golden ratio order ≈ 1.618).`;
          break;
        }

        x0 = x1;
        f0 = f1;
        x1 = x2;
        f1 = f2;
        root = x2;
        finalError = err;
      }

      if (!converged && !statusMessage) {
        statusMessage = `Secant method reached ${maxIterations} iterations without meeting tolerance.`;
      }
    }

    return {
      method,
      converged,
      root,
      iterationsCount: steps.length,
      steps,
      finalError,
      statusMessage,
      isBracketValid,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 2: Simultaneous Linear Equations
  // ═══════════════════════════════════════════════════════════════════════════
  public static solveLinearSystem(
    method: LinearSolverMethod,
    matrixA: number[][],
    vectorB: number[],
    maxIter = 50,
    tolerance = 1e-4
  ): LinearSolverResult {
    const n = vectorB.length;
    const steps: MatrixRowOpStep[] = [];
    const iterSteps: LinearIterStep[] = [];

    // Clone inputs to prevent mutation
    const A = matrixA.map((row) => [...row]);
    const b = [...vectorB];

    // Compute determinant for singularity check (2x2, 3x3, 4x4)
    const det = NumericalCalculator.computeDeterminant(A);
    const isSingular = Math.abs(det) < 1e-10;

    // Check strict diagonal dominance: |a_ii| > sum_{j!=i} |a_ij|
    let isDiagonallyDominant = true;
    for (let i = 0; i < n; i++) {
      let offSum = 0;
      const rowI = A[i] ?? [];
      for (let j = 0; j < n; j++) {
        if (i !== j) offSum += Math.abs(rowI[j] ?? 0);
      }
      if (Math.abs(rowI[i] ?? 0) <= offSum) {
        isDiagonallyDominant = false;
      }
    }

    if (isSingular && (method === 'gauss-elimination' || method === 'gauss-jordan' || method === 'lu-decomposition')) {
      return {
        method,
        solution: new Array(n).fill(0),
        steps: [],
        residualVector: [...b],
        residualNorm2: 1.0,
        residualNormInf: 1.0,
        isSingular: true,
        determinant: det,
        converged: false,
        message: `Singular or ill-conditioned coefficient matrix (det(A) = ${det.toExponential(3)}). Unique solution does not exist.`,
      };
    }

    if (method === 'gauss-elimination' || method === 'gauss-jordan') {
      steps.push({
        stepIndex: 0,
        description: 'Initial Augmented Matrix [A | b]',
        matrixA: A.map((r) => [...r]),
        vectorB: [...b],
      });

      // Forward Elimination with Partial Pivoting
      for (let k = 0; k < n; k++) {
        // Find pivot row
        let maxRow = k;
        let maxVal = Math.abs(A[k]?.[k] ?? 0);
        for (let r = k + 1; r < n; r++) {
          const val = Math.abs(A[r]?.[k] ?? 0);
          if (val > maxVal) {
            maxVal = val;
            maxRow = r;
          }
        }

        // Swap rows if necessary
        if (maxRow !== k) {
          const tempRow = A[k]!;
          A[k] = A[maxRow]!;
          A[maxRow] = tempRow;
          const tempB = b[k] ?? 0;
          b[k] = b[maxRow] ?? 0;
          b[maxRow] = tempB;

          steps.push({
            stepIndex: steps.length,
            description: `Partial Pivoting: Row ${k + 1} ↔ Row ${maxRow + 1} (Pivot = ${(A[k]?.[k] ?? 0).toFixed(4)})`,
            matrixA: A.map((r) => [...r]),
            vectorB: [...b],
            pivotRow: k,
            pivotCol: k,
          });
        }

        const pivot = A[k]?.[k] ?? 0;
        if (Math.abs(pivot) < 1e-12) continue;

        // Eliminate rows below
        const startElim = method === 'gauss-jordan' ? 0 : k + 1;
        for (let i = startElim; i < n; i++) {
          if (i === k) continue;
          const rowI = A[i];
          const rowK = A[k];
          if (!rowI || !rowK) continue;
          const factor = (rowI[k] ?? 0) / pivot;
          if (Math.abs(factor) > 1e-12) {
            for (let j = k; j < n; j++) {
              rowI[j] = (rowI[j] ?? 0) - factor * (rowK[j] ?? 0);
            }
            b[i] = (b[i] ?? 0) - factor * (b[k] ?? 0);
          }
        }

        steps.push({
          stepIndex: steps.length,
          description: `Elimination using pivot column ${k + 1}`,
          matrixA: A.map((r) => [...r]),
          vectorB: [...b],
          pivotRow: k,
          pivotCol: k,
        });
      }

      // Back Substitution
      const x = new Array(n).fill(0);
      if (method === 'gauss-jordan') {
        for (let i = 0; i < n; i++) {
          const diag = A[i]?.[i] ?? 1;
          x[i] = (b[i] ?? 0) / (diag !== 0 ? diag : 1);
        }
      } else {
        for (let i = n - 1; i >= 0; i--) {
          let sum = b[i] ?? 0;
          const rowI = A[i] ?? [];
          for (let j = i + 1; j < n; j++) {
            sum -= (rowI[j] ?? 0) * (x[j] ?? 0);
          }
          const diag = rowI[i] ?? 1;
          x[i] = diag !== 0 ? sum / diag : 0;
        }
      }

      const res = NumericalCalculator.calculateResidual(matrixA, vectorB, x);
      return {
        method,
        solution: x,
        steps,
        residualVector: res.r,
        residualNorm2: res.norm2,
        residualNormInf: res.normInf,
        isSingular: false,
        determinant: det,
        converged: true,
        message: `System solved directly via ${method === 'gauss-jordan' ? 'Gauss-Jordan' : 'Gaussian Elimination with Partial Pivoting'}.`,
      };
    }

    if (method === 'lu-decomposition') {
      // Doolittle LU Decomposition: A = L * U with L_ii = 1
      const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
      const U: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

      for (let i = 0; i < n; i++) {
        const rowL_i = L[i]!;
        const rowU_i = U[i]!;
        const rowA_i = A[i] ?? [];
        rowL_i[i] = 1;
        // Upper Triangular
        for (let k = i; k < n; k++) {
          let sum = 0;
          for (let j = 0; j < i; j++) sum += (rowL_i[j] ?? 0) * (U[j]?.[k] ?? 0);
          rowU_i[k] = (rowA_i[k] ?? 0) - sum;
        }
        // Lower Triangular
        for (let k = i + 1; k < n; k++) {
          let sum = 0;
          const rowL_k = L[k]!;
          const rowA_k = A[k] ?? [];
          for (let j = 0; j < i; j++) sum += (rowL_k[j] ?? 0) * (U[j]?.[i] ?? 0);
          const u_ii = rowU_i[i] ?? 0;
          if (Math.abs(u_ii) > 1e-12) {
            rowL_k[i] = ((rowA_k[i] ?? 0) - sum) / u_ii;
          }
        }
      }

      steps.push({
        stepIndex: 1,
        description: 'Lower Triangular Factor L (unit diagonal)',
        matrixA: L,
        vectorB: [...b],
      });
      steps.push({
        stepIndex: 2,
        description: 'Upper Triangular Factor U',
        matrixA: U,
        vectorB: [...b],
      });

      // Forward substitution: L * y = b
      const y = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sum = b[i] ?? 0;
        const rowL_i = L[i]!;
        for (let j = 0; j < i; j++) sum -= (rowL_i[j] ?? 0) * (y[j] ?? 0);
        y[i] = sum;
      }

      // Back substitution: U * x = y
      const x = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = y[i] ?? 0;
        const rowU_i = U[i]!;
        for (let j = i + 1; j < n; j++) sum -= (rowU_i[j] ?? 0) * (x[j] ?? 0);
        const u_ii = rowU_i[i] ?? 0;
        x[i] = u_ii !== 0 ? sum / u_ii : 0;
      }

      const res = NumericalCalculator.calculateResidual(matrixA, vectorB, x);
      return {
        method,
        solution: x,
        steps,
        residualVector: res.r,
        residualNorm2: res.norm2,
        residualNormInf: res.normInf,
        isSingular: false,
        determinant: det,
        converged: true,
        message: 'LU Factorization completed: solved L·y = b and U·x = y.',
      };
    }

    // Iterative Methods: Jacobi & Gauss-Seidel
    let xCurr = new Array(n).fill(0);
    let converged = false;

    for (let iter = 1; iter <= maxIter; iter++) {
      const xNext = [...xCurr];
      for (let i = 0; i < n; i++) {
        let sum = b[i] ?? 0;
        const rowA_i = A[i] ?? [];
        if (method === 'jacobi') {
          for (let j = 0; j < n; j++) {
            if (i !== j) sum -= (rowA_i[j] ?? 0) * (xCurr[j] ?? 0);
          }
        } else {
          // Gauss-Seidel (uses updated values immediately)
          for (let j = 0; j < i; j++) sum -= (rowA_i[j] ?? 0) * (xNext[j] ?? 0);
          for (let j = i + 1; j < n; j++) sum -= (rowA_i[j] ?? 0) * (xCurr[j] ?? 0);
        }
        const a_ii = rowA_i[i] ?? 0;
        xNext[i] = Math.abs(a_ii) > 1e-12 ? sum / a_ii : (xCurr[i] ?? 0);
      }

      let errNorm = 0;
      for (let i = 0; i < n; i++) {
        errNorm = Math.max(errNorm, Math.abs((xNext[i] ?? 0) - (xCurr[i] ?? 0)));
      }

      const res = NumericalCalculator.calculateResidual(matrixA, vectorB, xNext);
      iterSteps.push({
        iteration: iter,
        xVector: [...xNext],
        errorNorm: errNorm,
        residualNorm: res.normInf,
      });

      if (errNorm < tolerance) {
        converged = true;
        xCurr = xNext;
        break;
      }
      xCurr = xNext;
    }

    const finalRes = NumericalCalculator.calculateResidual(matrixA, vectorB, xCurr);
    return {
      method,
      solution: xCurr,
      steps: [],
      iterSteps,
      residualVector: finalRes.r,
      residualNorm2: finalRes.norm2,
      residualNormInf: finalRes.normInf,
      isSingular: false,
      isDiagonallyDominant,
      determinant: det,
      converged,
      message: converged
        ? `${method === 'gauss-seidel' ? 'Gauss-Seidel' : 'Jacobi'} converged in ${iterSteps.length} iterations.`
        : `Iterative solver reached limit (${maxIter}) without meeting tolerance.${!isDiagonallyDominant ? ' (Note: Matrix is not diagonally dominant).' : ''}`,
    };
  }

  // Calculate residual r = b - Ax and norms
  public static calculateResidual(A: number[][], b: number[], x: number[]) {
    const n = b.length;
    const r = new Array(n).fill(0);
    let sumSq = 0;
    let normInf = 0;

    for (let i = 0; i < n; i++) {
      let ax = 0;
      const rowA = A[i] ?? [];
      const bi = b[i] ?? 0;
      for (let j = 0; j < n; j++) ax += (rowA[j] ?? 0) * (x[j] ?? 0);
      const ri = bi - ax;
      r[i] = ri;
      sumSq += ri * ri;
      normInf = Math.max(normInf, Math.abs(ri));
    }

    return {
      r,
      norm2: Math.sqrt(sumSq),
      normInf,
    };
  }

  // Matrix determinant calculation
  public static computeDeterminant(mat: number[][]): number {
    const n = mat.length;
    if (n === 1) return mat[0]?.[0] ?? 0;
    if (n === 2) return (mat[0]?.[0] ?? 0) * (mat[1]?.[1] ?? 0) - (mat[0]?.[1] ?? 0) * (mat[1]?.[0] ?? 0);
    if (n === 3) {
      const m00 = mat[0]?.[0] ?? 0, m01 = mat[0]?.[1] ?? 0, m02 = mat[0]?.[2] ?? 0;
      const m10 = mat[1]?.[0] ?? 0, m11 = mat[1]?.[1] ?? 0, m12 = mat[1]?.[2] ?? 0;
      const m20 = mat[2]?.[0] ?? 0, m21 = mat[2]?.[1] ?? 0, m22 = mat[2]?.[2] ?? 0;
      return (
        m00 * (m11 * m22 - m12 * m21) -
        m01 * (m10 * m22 - m12 * m20) +
        m02 * (m10 * m21 - m11 * m20)
      );
    }
    // General LU or cofactor for n > 3
    let det = 1;
    const copy = mat.map((r) => [...r]);
    for (let i = 0; i < n; i++) {
      let pivot = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(copy[j]?.[i] ?? 0) > Math.abs(copy[pivot]?.[i] ?? 0)) pivot = j;
      }
      if (Math.abs(copy[pivot]?.[i] ?? 0) < 1e-12) return 0;
      if (pivot !== i) {
        const temp = copy[i]!;
        copy[i] = copy[pivot]!;
        copy[pivot] = temp;
        det = -det;
      }
      det *= copy[i]?.[i] ?? 1;
      for (let j = i + 1; j < n; j++) {
        const factor = (copy[j]?.[i] ?? 0) / (copy[i]?.[i] || 1);
        for (let k = i; k < n; k++) {
          copy[j]![k] = (copy[j]?.[k] ?? 0) - factor * (copy[i]?.[k] ?? 0);
        }
      }
    }
    return det;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 3: Interpolation and Curve Fitting
  // ═══════════════════════════════════════════════════════════════════════════
  public static interpolate(
    method: InterpolationMethod,
    points: DataPoint[],
    targetX: number
  ): InterpolationResult {
    const n = points.length;
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const xVals = sorted.map((p) => p.x);
    const yVals = sorted.map((p) => p.y);
    const minX = Math.min(...xVals);
    const maxX = Math.max(...xVals);
    const isExtrapolation = targetX < minX || targetX > maxX;
    const extrapolationWarning = isExtrapolation
      ? `Warning: x = ${targetX} lies outside observed data range [${minX}, ${maxX}]. Extrapolated values are susceptible to Runge's phenomenon and significant error.`
      : undefined;

    const stepByStepDetails: string[] = [];

    if (method === 'least-squares-linear') {
      // Linear regression y = mx + c (Separate from exact polynomial interpolation)
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let i = 0; i < n; i++) {
        const xi = xVals[i] ?? 0;
        const yi = yVals[i] ?? 0;
        sumX += xi;
        sumY += yi;
        sumXY += xi * yi;
        sumX2 += xi * xi;
      }
      const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const c = (sumY - m * sumX) / n;
      const interpolatedY = m * targetX + c;

      // Compute R^2
      const meanY = sumY / n;
      let ssTot = 0, ssRes = 0;
      for (let i = 0; i < n; i++) {
        const xi = xVals[i] ?? 0;
        const yi = yVals[i] ?? 0;
        const fi = m * xi + c;
        ssRes += Math.pow(yi - fi, 2);
        ssTot += Math.pow(yi - meanY, 2);
      }
      const r2 = ssTot !== 0 ? Math.max(0, 1 - ssRes / ssTot) : 1;

      stepByStepDetails.push(`Calculated Least-Squares Slope m = ${m.toFixed(5)}`);
      stepByStepDetails.push(`Calculated Intercept c = ${c.toFixed(5)}`);
      stepByStepDetails.push(`Regression Equation: y = ${m.toFixed(4)}x + ${c.toFixed(4)}`);
      stepByStepDetails.push(`At target x = ${targetX}: y = ${interpolatedY.toFixed(4)} (R² = ${r2.toFixed(4)})`);

      return {
        method,
        targetX,
        interpolatedY,
        isExtrapolation,
        extrapolationWarning,
        polynomialExpression: `y = ${m.toFixed(4)}x + ${c.toFixed(4)}`,
        stepByStepDetails,
        regressionR2: r2,
      };
    }

    if (method === 'lagrange') {
      let result = 0;
      const terms: string[] = [];

      for (let i = 0; i < n; i++) {
        let termVal = yVals[i] ?? 0;
        const xi = xVals[i] ?? 0;
        let termStr = `${termVal.toFixed(2)}`;
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const xj = xVals[j] ?? 0;
            termVal *= (targetX - xj) / (xi - xj);
            termStr += ` · ((x - ${xj}) / (${xi} - ${xj}))`;
          }
        }
        result += termVal;
        terms.push(`L_${i}(x) · y_${i} = ${termVal.toFixed(4)}`);
      }

      stepByStepDetails.push(`Evaluated ${n} Lagrange basis polynomials L_i(x)`);
      stepByStepDetails.push(...terms);
      stepByStepDetails.push(`Summed interpolation result: P(${targetX}) = ${result.toFixed(6)}`);

      return {
        method,
        targetX,
        interpolatedY: result,
        isExtrapolation,
        extrapolationWarning,
        polynomialExpression: `P_${n - 1}(x) = \\sum_{i=0}^{${n - 1}} y_i \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}`,
        stepByStepDetails,
      };
    }

    if (method === 'newton-divided') {
      // Divided difference table
      const diffs: number[][] = [];
      diffs[0] = [...yVals];

      for (let col = 1; col < n; col++) {
        diffs[col] = [];
        for (let row = 0; row < n - col; row++) {
          const num = (diffs[col - 1]?.[row + 1] ?? 0) - (diffs[col - 1]?.[row] ?? 0);
          const denom = (xVals[row + col] ?? 0) - (xVals[row] ?? 0);
          diffs[col]![row] = denom !== 0 ? num / denom : 0;
        }
      }

      let interpolatedY = diffs[0]?.[0] ?? 0;
      let productTerm = 1;
      stepByStepDetails.push(`P_0 = f[x_0] = ${(diffs[0]?.[0] ?? 0).toFixed(4)}`);

      for (let i = 1; i < n; i++) {
        productTerm *= targetX - (xVals[i - 1] ?? 0);
        const coeff = diffs[i]?.[0] ?? 0;
        const addTerm = coeff * productTerm;
        interpolatedY += addTerm;
        stepByStepDetails.push(
          `+ f[x_0...x_${i}] (${coeff.toFixed(5)}) · (${targetX} - ${xVals[i - 1] ?? 0}) = ${addTerm.toFixed(4)}`
        );
      }

      return {
        method,
        targetX,
        interpolatedY,
        isExtrapolation,
        extrapolationWarning,
        diffTable: { xValues: xVals, yValues: yVals, diffs },
        polynomialExpression: `P(x) = f[x_0] + \\sum_{k=1}^{${n - 1}} f[x_0..x_k] \\prod_{j=0}^{k-1} (x - x_j)`,
        stepByStepDetails,
      };
    }

    // Newton Forward / Backward (assumes equidistant spacing h)
    const h = (xVals[1] ?? 1) - (xVals[0] ?? 0) || 1;
    const diffs: number[][] = [];
    diffs[0] = [...yVals];

    for (let col = 1; col < n; col++) {
      diffs[col] = [];
      for (let row = 0; row < n - col; row++) {
        diffs[col]![row] = (diffs[col - 1]?.[row + 1] ?? 0) - (diffs[col - 1]?.[row] ?? 0);
      }
    }

    let interpolatedY = 0;
    if (method === 'newton-forward') {
      const x0 = xVals[0] ?? 0;
      const u = (targetX - x0) / h;
      interpolatedY = diffs[0]?.[0] ?? 0;
      let uFactor = 1;
      let fact = 1;
      stepByStepDetails.push(`Computed u = (x - x_0)/h = (${targetX} - ${x0})/${h} = ${u.toFixed(4)}`);
      stepByStepDetails.push(`Initial y_0 = ${(diffs[0]?.[0] ?? 0).toFixed(4)}`);

      for (let i = 1; i < n; i++) {
        uFactor *= u - (i - 1);
        fact *= i;
        const dVal = diffs[i]?.[0] ?? 0;
        const term = (uFactor / fact) * dVal;
        interpolatedY += term;
        stepByStepDetails.push(`+ (u·(u-1)... / ${i}!) · Δ^${i}y_0 = ${term.toFixed(4)}`);
      }
    } else {
      // Newton Backward
      const xN = xVals[n - 1] ?? 0;
      const u = (targetX - xN) / h;
      interpolatedY = diffs[0]?.[n - 1] ?? 0;
      let uFactor = 1;
      let fact = 1;
      stepByStepDetails.push(`Computed u = (x - x_n)/h = (${targetX} - ${xN})/${h} = ${u.toFixed(4)}`);
      stepByStepDetails.push(`Initial y_n = ${(diffs[0]?.[n - 1] ?? 0).toFixed(4)}`);

      for (let i = 1; i < n; i++) {
        uFactor *= u + (i - 1);
        fact *= i;
        const dVal = diffs[i]?.[n - 1 - i] ?? 0;
        const term = (uFactor / fact) * dVal;
        interpolatedY += term;
        stepByStepDetails.push(`+ (u·(u+1)... / ${i}!) · ∇^${i}y_n = ${term.toFixed(4)}`);
      }
    }

    return {
      method,
      targetX,
      interpolatedY,
      isExtrapolation,
      extrapolationWarning,
      diffTable: { xValues: xVals, yValues: yVals, diffs, h },
      polynomialExpression:
        method === 'newton-forward'
          ? 'P(x) = y_0 + u\\Delta y_0 + \\frac{u(u-1)}{2!} \\Delta^2 y_0 + \\dots'
          : 'P(x) = y_n + u\\nabla y_n + \\frac{u(u+1)}{2!} \\nabla^2 y_n + \\dots',
      stepByStepDetails,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 4: Numerical Differentiation & Integration
  // ═══════════════════════════════════════════════════════════════════════════
  public static computeNumericalDifferentiation(
    method: DiffMethod,
    expr: string,
    targetX: number,
    stepH = 0.05,
    exactFormula?: string
  ): DifferentiationResult {
    const fX = NumericalCalculator.evalF(expr, targetX);
    const fPlus = NumericalCalculator.evalF(expr, targetX + stepH);
    const fMinus = NumericalCalculator.evalF(expr, targetX - stepH);

    let approxValue = 0;
    let truncationOrder = 'O(h)';
    let formulaUsed = '';

    switch (method) {
      case 'forward':
        approxValue = (fPlus - fX) / stepH;
        truncationOrder = 'O(h)';
        formulaUsed = "f'(x) ≈ [f(x + h) - f(x)] / h";
        break;
      case 'backward':
        approxValue = (fX - fMinus) / stepH;
        truncationOrder = 'O(h)';
        formulaUsed = "f'(x) ≈ [f(x) - f(x - h)] / h";
        break;
      case 'central':
        approxValue = (fPlus - fMinus) / (2 * stepH);
        truncationOrder = 'O(h²)';
        formulaUsed = "f'(x) ≈ [f(x + h) - f(x - h)] / (2h)";
        break;
      case 'second-derivative':
        approxValue = (fPlus - 2 * fX + fMinus) / (stepH * stepH);
        truncationOrder = 'O(h²)';
        formulaUsed = "f''(x) ≈ [f(x + h) - 2f(x) + f(x - h)] / h²";
        break;
    }

    let analyticalValue: number | undefined;
    let absError: number | undefined;
    let relErrorPercent: number | undefined;

    if (exactFormula) {
      analyticalValue = parser.evaluate(exactFormula, { x: targetX });
      absError = Math.abs(approxValue - analyticalValue);
      relErrorPercent = Math.abs(analyticalValue) > 1e-12 ? (absError / Math.abs(analyticalValue)) * 100 : 0;
    }

    return {
      method,
      targetX,
      stepH,
      approxValue,
      analyticalValue,
      absError,
      relErrorPercent,
      truncationOrder,
      formulaUsed,
    };
  }

  public static computeNumericalIntegration(
    method: IntegrationMethod,
    expr: string,
    lowerA: number,
    upperB: number,
    subintervalsN: number,
    exactIntegralVal?: number
  ): IntegrationResult {
    let n = Math.max(1, Math.round(subintervalsN));
    let isValidIntervalCount = true;
    let validationWarning: string | undefined;

    // Simpson 1/3 requires even number of intervals
    if (method === 'simpson-13' && n % 2 !== 0) {
      n += 1;
      isValidIntervalCount = false;
      validationWarning = `Simpson's 1/3 rule requires an EVEN number of intervals (n = 2m). Automatically adjusted subintervals to n = ${n}.`;
    }

    // Simpson 3/8 requires n to be a multiple of 3
    if (method === 'simpson-38' && n % 3 !== 0) {
      n += 3 - (n % 3);
      isValidIntervalCount = false;
      validationWarning = `Simpson's 3/8 rule requires intervals to be a MULTIPLE OF 3 (n = 3m). Automatically adjusted subintervals to n = ${n}.`;
    }

    const stepH = (upperB - lowerA) / n;
    const steps: IntegrationStepInfo[] = [];

    for (let i = 0; i <= n; i++) {
      const x = lowerA + i * stepH;
      const fx = NumericalCalculator.evalF(expr, x);
      let weight = 1;

      if (method === 'trapezoidal') {
        weight = i === 0 || i === n ? 0.5 : 1;
      } else if (method === 'simpson-13') {
        if (i === 0 || i === n) weight = 1 / 3;
        else if (i % 2 !== 0) weight = 4 / 3;
        else weight = 2 / 3;
      } else if (method === 'simpson-38') {
        if (i === 0 || i === n) weight = 3 / 8;
        else if (i % 3 === 0) weight = 6 / 8; // 2 * 3/8
        else weight = 9 / 8; // 3 * 3/8
      }

      steps.push({
        x,
        fx,
        weight,
        contribution: fx * weight * stepH,
      });
    }

    let approxIntegral = 0;
    const f0 = steps[0]?.fx ?? 0;
    const fn = steps[n]?.fx ?? 0;
    if (method === 'trapezoidal') {
      let sum = (f0 + fn) / 2;
      for (let i = 1; i < n; i++) sum += steps[i]?.fx ?? 0;
      approxIntegral = stepH * sum;
    } else if (method === 'simpson-13') {
      let sumOdds = 0;
      let sumEvens = 0;
      for (let i = 1; i < n; i++) {
        const fx = steps[i]?.fx ?? 0;
        if (i % 2 !== 0) sumOdds += fx;
        else sumEvens += fx;
      }
      approxIntegral = (stepH / 3) * (f0 + 4 * sumOdds + 2 * sumEvens + fn);
    } else if (method === 'simpson-38') {
      let sum3k = 0;
      let sumOthers = 0;
      for (let i = 1; i < n; i++) {
        const fx = steps[i]?.fx ?? 0;
        if (i % 3 === 0) sum3k += fx;
        else sumOthers += fx;
      }
      approxIntegral = ((3 * stepH) / 8) * (f0 + 3 * sumOthers + 2 * sum3k + fn);
    }

    let absError: number | undefined;
    let relErrorPercent: number | undefined;
    if (exactIntegralVal !== undefined) {
      absError = Math.abs(approxIntegral - exactIntegralVal);
      relErrorPercent = Math.abs(exactIntegralVal) > 1e-12 ? (absError / Math.abs(exactIntegralVal)) * 100 : 0;
    }

    const formulaUsed =
      method === 'trapezoidal'
        ? 'I ≈ h·[ (f(a) + f(b))/2 + ∑ f(x_i) ]'
        : method === 'simpson-13'
        ? 'I ≈ (h/3)·[ f(x_0) + 4∑f(odd) + 2∑f(even) + f(x_n) ]'
        : 'I ≈ (3h/8)·[ f(x_0) + 3∑f(other) + 2∑f(3k) + f(x_n) ]';

    return {
      method,
      lowerA,
      upperB,
      subintervalsN: n,
      stepH,
      approxIntegral,
      analyticalValue: exactIntegralVal,
      absError,
      relErrorPercent,
      isValidIntervalCount,
      validationWarning,
      steps,
      formulaUsed,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 5: Ordinary Differential Equations (Initial-Value Problems)
  // ═══════════════════════════════════════════════════════════════════════════
  public static solveODE(
    method: ODEMethod,
    exprFxy: string,
    x0: number,
    y0: number,
    xEnd: number,
    stepH = 0.1,
    exactFormulaExpr?: string
  ): ODEResult {
    const totalSteps = Math.max(1, Math.round((xEnd - x0) / stepH));
    const steps: ODEStep[] = [];

    let currentX = x0;
    let currentY = y0;
    let maxGlobalError = 0;

    const exactY0 = exactFormulaExpr ? parser.evaluate(exactFormulaExpr, { x: currentX }) : undefined;
    steps.push({
      step: 0,
      x: currentX,
      yApprox: currentY,
      yExact: exactY0,
      error: 0,
    });

    for (let i = 1; i <= totalSteps; i++) {
      const nextX = x0 + i * stepH;
      let nextY = currentY;

      if (method === 'euler') {
        const slope = NumericalCalculator.evalFxy(exprFxy, currentX, currentY);
        nextY = currentY + stepH * slope;
        steps.push({
          step: i,
          x: nextX,
          yApprox: nextY,
          slopeUsed: slope,
        });
      } else if (method === 'modified-euler') {
        // Heun's Predictor-Corrector Method
        const slope1 = NumericalCalculator.evalFxy(exprFxy, currentX, currentY);
        const yPredict = currentY + stepH * slope1;
        const slope2 = NumericalCalculator.evalFxy(exprFxy, nextX, yPredict);
        const avgSlope = (slope1 + slope2) / 2;
        nextY = currentY + stepH * avgSlope;
        steps.push({
          step: i,
          x: nextX,
          yApprox: nextY,
          k1: slope1,
          k2: slope2,
          slopeUsed: avgSlope,
        });
      } else if (method === 'rk4') {
        // Runge-Kutta 4th Order
        const k1 = stepH * NumericalCalculator.evalFxy(exprFxy, currentX, currentY);
        const k2 = stepH * NumericalCalculator.evalFxy(exprFxy, currentX + stepH / 2, currentY + k1 / 2);
        const k3 = stepH * NumericalCalculator.evalFxy(exprFxy, currentX + stepH / 2, currentY + k2 / 2);
        const k4 = stepH * NumericalCalculator.evalFxy(exprFxy, currentX + stepH, currentY + k3);

        nextY = currentY + (1 / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        steps.push({
          step: i,
          x: nextX,
          yApprox: nextY,
          k1,
          k2,
          k3,
          k4,
          slopeUsed: (k1 + 2 * k2 + 2 * k3 + k4) / (6 * stepH),
        });
      }

      if (exactFormulaExpr && steps[i]) {
        const exactY = parser.evaluate(exactFormulaExpr, { x: nextX });
        const err = Math.abs(nextY - exactY);
        steps[i]!.yExact = exactY;
        steps[i]!.error = err;
        maxGlobalError = Math.max(maxGlobalError, err);
      }

      currentX = nextX;
      currentY = nextY;
    }

    const finalExactY = exactFormulaExpr ? parser.evaluate(exactFormulaExpr, { x: currentX }) : undefined;

    return {
      method,
      x0,
      y0,
      xEnd,
      stepH,
      steps,
      finalY: currentY,
      finalExactY,
      maxGlobalError: exactFormulaExpr ? maxGlobalError : undefined,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 6: Partial Differential Equations
  // ═══════════════════════════════════════════════════════════════════════════
  // 1D Transient Heat Equation (Bender-Schmidt FTCS explicit finite difference)
  // ∂u/∂t = α · ∂²u/∂x²
  // Stability Criterion: r = α · Δt / (Δx)² <= 0.5
  public static solve1DHeatEquation(
    lengthL = 1.0,
    totalTimeT = 0.2,
    alpha = 0.05,
    nx = 21,
    nt = 50,
    boundaryLeft = 0,
    boundaryRight = 0,
    initialConditionExpr = 'sin(pi * x)'
  ): PDE1DHeatResult {
    const dx = lengthL / (nx - 1);
    const dt = totalTimeT / nt;
    const rParameter = (alpha * dt) / (dx * dx);
    const isStable = rParameter <= 0.5;
    const stabilityWarning = !isStable
      ? `Stability violation: r = ${rParameter.toFixed(4)} > 0.5! Explicit FTCS diffusion scheme is unconditionally UNSTABLE. Non-physical oscillations will rapidly amplify.`
      : undefined;

    const xNodes = Array.from({ length: nx }, (_, i) => i * dx);
    const timeGrid: number[][] = [];

    // Initial state at t = 0
    const u0 = xNodes.map((x) => parser.evaluate(initialConditionExpr, { x, pi: Math.PI }));
    u0[0] = boundaryLeft;
    u0[nx - 1] = boundaryRight;
    timeGrid.push([...u0]);

    // Forward Time Central Space explicit marching
    let uPrev = [...u0];
    for (let t = 1; t <= nt; t++) {
      const uNext = new Array(nx).fill(0);
      uNext[0] = boundaryLeft;
      uNext[nx - 1] = boundaryRight;

      for (let i = 1; i < nx - 1; i++) {
        const uC = uPrev[i] ?? 0;
        const uR = uPrev[i + 1] ?? 0;
        const uL = uPrev[i - 1] ?? 0;
        uNext[i] = uC + rParameter * (uR - 2 * uC + uL);
        // Guard against runaway floating point overflow in unstable mode
        if (Math.abs(uNext[i]) > 1e6) {
          uNext[i] = Math.sign(uNext[i]) * 1e6;
        }
      }

      timeGrid.push([...uNext]);
      uPrev = uNext;
    }

    return {
      scheme: '1d-heat-ftcs',
      lengthL,
      totalTimeT,
      thermalDiffusivityAlpha: alpha,
      dx,
      dt,
      nx,
      nt,
      rParameter,
      isStable,
      stabilityWarning,
      xNodes,
      timeGrid,
    };
  }

  // 1D Wave Equation (Hyperbolic Finite Difference explicit scheme)
  // ∂²u/∂t² = c² · ∂²u/∂x²
  // CFL Criterion: C = c · Δt / Δx <= 1
  public static solve1DWaveEquation(
    lengthL = 1.0,
    totalTimeT = 1.0,
    waveSpeedC = 1.0,
    nx = 21,
    nt = 60,
    initialDisplacementExpr = 'sin(pi * x)'
  ): PDE1DWaveResult {
    const dx = lengthL / (nx - 1);
    const dt = totalTimeT / nt;
    const courantNumber = (waveSpeedC * dt) / dx;
    const isStable = courantNumber <= 1.0;
    const stabilityWarning = !isStable
      ? `CFL violation: Courant number C = ${courantNumber.toFixed(3)} > 1.0! Hyperbolic finite difference scheme will diverge exponentially.`
      : undefined;

    const xNodes = Array.from({ length: nx }, (_, i) => i * dx);
    const timeGrid: number[][] = [];

    // t = 0
    const u0 = xNodes.map((x) => parser.evaluate(initialDisplacementExpr, { x, pi: Math.PI }));
    u0[0] = 0;
    u0[nx - 1] = 0;
    timeGrid.push([...u0]);

    // t = 1 (Initial velocity ∂u/∂t = 0 assumed)
    const lambda2 = courantNumber * courantNumber;
    const u1 = new Array(nx).fill(0);
    for (let i = 1; i < nx - 1; i++) {
      const uC = u0[i] ?? 0;
      const uR = u0[i + 1] ?? 0;
      const uL = u0[i - 1] ?? 0;
      u1[i] = uC + 0.5 * lambda2 * (uR - 2 * uC + uL);
    }
    timeGrid.push([...u1]);

    // Time marching t >= 2
    for (let t = 2; t <= nt; t++) {
      const uCurr = timeGrid[t - 1] || [];
      const uPast = timeGrid[t - 2] || [];
      const uNext = new Array(nx).fill(0);

      for (let i = 1; i < nx - 1; i++) {
        const cVal = uCurr[i] ?? 0;
        const rVal = uCurr[i + 1] ?? 0;
        const lVal = uCurr[i - 1] ?? 0;
        const pVal = uPast[i] ?? 0;
        uNext[i] = 2 * (1 - lambda2) * cVal + lambda2 * (rVal + lVal) - pVal;
        if (Math.abs(uNext[i]) > 1e4) uNext[i] = Math.sign(uNext[i]) * 1e4;
      }

      timeGrid.push([...uNext]);
    }

    return {
      scheme: '1d-wave-hyperbolic',
      lengthL,
      totalTimeT,
      waveSpeedC,
      dx,
      dt,
      nx,
      nt,
      courantNumber,
      isStable,
      stabilityWarning,
      xNodes,
      timeGrid,
    };
  }

  // 2D Steady-State Laplace / Poisson Elliptic Equation (Liebmann's 5-Point Iteration)
  // ∂²u/∂x² + ∂²u/∂y² = 0 on [0, 1] x [0, 1]
  public static solve2DLaplace(
    nx = 11,
    ny = 11,
    boundaryTop = 100,
    boundaryBottom = 0,
    boundaryLeft = 0,
    boundaryRight = 0,
    tolerance = 1e-4,
    maxIter = 200
  ): PDE2DLaplaceResult {
    const gridU = Array.from({ length: ny }, () => new Array(nx).fill(0));

    // Apply Dirichlet Boundary Conditions
    for (let i = 0; i < nx; i++) {
      gridU[0]![i] = boundaryTop;
      gridU[ny - 1]![i] = boundaryBottom;
    }
    for (let j = 0; j < ny; j++) {
      gridU[j]![0] = boundaryLeft;
      gridU[j]![nx - 1] = boundaryRight;
    }

    // Initialize interior nodes with average boundary values
    const avgBC = (boundaryTop + boundaryBottom + boundaryLeft + boundaryRight) / 4;
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        gridU[j]![i] = avgBC;
      }
    }

    let converged = false;
    let iter = 0;
    let maxResidual = 1.0;

    while (iter < maxIter && !converged) {
      iter++;
      maxResidual = 0;
      for (let j = 1; j < ny - 1; j++) {
        for (let i = 1; i < nx - 1; i++) {
          const uNew =
            0.25 * (gridU[j]![i + 1]! + gridU[j]![i - 1]! + gridU[j + 1]![i]! + gridU[j - 1]![i]!);
          const diff = Math.abs(uNew - gridU[j]![i]!);
          maxResidual = Math.max(maxResidual, diff);
          gridU[j]![i] = uNew;
        }
      }
      if (maxResidual < tolerance) {
        converged = true;
      }
    }

    return {
      scheme: '2d-laplace-elliptic',
      nx,
      ny,
      iterationsCount: iter,
      converged,
      maxResidual,
      gridU,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 7: Numerical Methods Comparison Laboratory
  // ═══════════════════════════════════════════════════════════════════════════
  public static runComparisonBench(
    category: 'root-finding' | 'linear-systems' | 'integration' | 'ode'
  ): ComparisonLaboratoryResult {
    if (category === 'root-finding') {
      const expr = 'x^3 - x - 2';
      const a = 1.0;
      const b = 2.0;
      const tol = 1e-5;

      const bisect = NumericalCalculator.solveRoot('bisection', expr, a, b, tol);
      const falsi = NumericalCalculator.solveRoot('regula-falsi', expr, a, b, tol);
      const nr = NumericalCalculator.solveRoot('newton-raphson', expr, 1.5, b, tol);
      const sec = NumericalCalculator.solveRoot('secant', expr, a, b, tol);

      return {
        problemCategory: 'root-finding',
        problemDescription: 'Find positive root of f(x) = x³ - x - 2 = 0 in bracket [1.0, 2.0] with tolerance 10⁻⁵',
        entries: [
          {
            methodName: 'Bisection Method',
            resultSummary: `Root x ≈ ${bisect.root.toFixed(6)}`,
            iterationOrSteps: bisect.iterationsCount,
            errorOrResidual: bisect.finalError,
            convergenceRate: 'Linear (Rate = 0.5 per iteration)',
            suitabilityForEng: 'Guaranteed global convergence if bracket holds; slow for tight industrial tolerances.',
          },
          {
            methodName: 'Regula Falsi (False Position)',
            resultSummary: `Root x ≈ ${falsi.root.toFixed(6)}`,
            iterationOrSteps: falsi.iterationsCount,
            errorOrResidual: falsi.finalError,
            convergenceRate: 'Linear (Faster than bisection for smooth curvature)',
            suitabilityForEng: 'Guaranteed bracket preservation; one endpoint can remain stagnant for convex curves.',
          },
          {
            methodName: 'Newton–Raphson Method',
            resultSummary: `Root x ≈ ${nr.root.toFixed(6)}`,
            iterationOrSteps: nr.iterationsCount,
            errorOrResidual: nr.finalError,
            convergenceRate: 'Quadratic (|ε_{k+1}| ≈ C · |ε_k|²)',
            suitabilityForEng: 'Superb rapid convergence near root; requires derivative f\'(x) ≠ 0.',
          },
          {
            methodName: 'Secant Method',
            resultSummary: `Root x ≈ ${sec.root.toFixed(6)}`,
            iterationOrSteps: sec.iterationsCount,
            errorOrResidual: sec.finalError,
            convergenceRate: 'Superlinear (Order ≈ 1.618 Golden Ratio)',
            suitabilityForEng: 'Does not require analytical derivative calculation; competitive with Newton-Raphson.',
          },
        ],
      };
    }

    if (category === 'linear-systems') {
      const A = [
        [10, 1, 2],
        [2, 10, 1],
        [1, 2, 10],
      ];
      const b = [13, 13, 13];

      const gauss = NumericalCalculator.solveLinearSystem('gauss-elimination', A, b);
      const lu = NumericalCalculator.solveLinearSystem('lu-decomposition', A, b);
      const jacobi = NumericalCalculator.solveLinearSystem('jacobi', A, b, 50, 1e-4);
      const seidel = NumericalCalculator.solveLinearSystem('gauss-seidel', A, b, 50, 1e-4);

      return {
        problemCategory: 'linear-systems',
        problemDescription: 'Solve strictly diagonally dominant 3×3 system: 10x₁ + x₂ + 2x₃ = 13, 2x₁ + 10x₂ + x₃ = 13, x₁ + 2x₂ + 10x₃ = 13',
        entries: [
          {
            methodName: 'Gaussian Elimination (with Partial Pivoting)',
            resultSummary: `[${gauss.solution.map((v) => v.toFixed(4)).join(', ')}]`,
            iterationOrSteps: gauss.steps.length,
            errorOrResidual: gauss.residualNormInf,
            convergenceRate: 'Direct (O(n³/3) operations)',
            suitabilityForEng: 'Industry standard for dense medium matrices; partial pivoting prevents division by near-zero.',
          },
          {
            methodName: 'LU Decomposition (Doolittle)',
            resultSummary: `[${lu.solution.map((v) => v.toFixed(4)).join(', ')}]`,
            iterationOrSteps: lu.steps.length,
            errorOrResidual: lu.residualNormInf,
            convergenceRate: 'Direct (O(n³/3) once, O(n²) back-substitution)',
            suitabilityForEng: 'Ideal when solving Ax = b repeatedly for multiple load vectors b (e.g. structural frames).',
          },
          {
            methodName: 'Jacobi Iteration',
            resultSummary: `[${jacobi.solution.map((v) => v.toFixed(4)).join(', ')}]`,
            iterationOrSteps: jacobi.iterSteps?.length || 0,
            errorOrResidual: jacobi.residualNormInf,
            convergenceRate: 'Linear (Synchronous update)',
            suitabilityForEng: 'Easily parallelizable on GPUs; slower than Gauss-Seidel on single core.',
          },
          {
            methodName: 'Gauss–Seidel Iteration',
            resultSummary: `[${seidel.solution.map((v) => v.toFixed(4)).join(', ')}]`,
            iterationOrSteps: seidel.iterSteps?.length || 0,
            errorOrResidual: seidel.residualNormInf,
            convergenceRate: 'Linear (Twice as fast as Jacobi for diagonally dominant systems)',
            suitabilityForEng: 'Standard iterative method for sparse finite-element & CFD grid equations.',
          },
        ],
      };
    }

    if (category === 'integration') {
      const expr = '1 / (1 + x^2)';
      const a = 0;
      const b = 1;
      const exact = Math.PI / 4; // = 0.7853981633974483
      const n = 6;

      const trap = NumericalCalculator.computeNumericalIntegration('trapezoidal', expr, a, b, n, exact);
      const simp13 = NumericalCalculator.computeNumericalIntegration('simpson-13', expr, a, b, n, exact);
      const simp38 = NumericalCalculator.computeNumericalIntegration('simpson-38', expr, a, b, n, exact);

      return {
        problemCategory: 'integration',
        problemDescription: 'Integrate ∫₀¹ (1 / (1 + x²)) dx with exact value π/4 ≈ 0.785398, using n = 6 subintervals',
        entries: [
          {
            methodName: 'Composite Trapezoidal Rule',
            resultSummary: `Integral ≈ ${trap.approxIntegral.toFixed(6)}`,
            iterationOrSteps: n,
            errorOrResidual: trap.absError || 0,
            convergenceRate: 'Order O(h²)',
            suitabilityForEng: 'Simple and robust for noisy experimental sensor data and piecewise curves.',
          },
          {
            methodName: "Composite Simpson's 1/3 Rule",
            resultSummary: `Integral ≈ ${simp13.approxIntegral.toFixed(6)}`,
            iterationOrSteps: n,
            errorOrResidual: simp13.absError || 0,
            convergenceRate: 'Order O(h⁴)',
            suitabilityForEng: 'Excellent accuracy for smooth profiles; parabolic interpolants cancel cubic errors.',
          },
          {
            methodName: "Composite Simpson's 3/8 Rule",
            resultSummary: `Integral ≈ ${simp38.approxIntegral.toFixed(6)}`,
            iterationOrSteps: n,
            errorOrResidual: simp38.absError || 0,
            convergenceRate: 'Order O(h⁴)',
            suitabilityForEng: 'Used when subintervals are multiples of 3, or coupled with 1/3 rule for odd interval counts.',
          },
        ],
      };
    }

    // ODE Category
    const odeExpr = 'x + y';
    const x0 = 0;
    const y0 = 1;
    const xEnd = 1.0;
    const h = 0.1;
    const exactODE = '2 * exp(x) - x - 1'; // exact solution for dy/dx = x + y, y(0)=1

    const euler = NumericalCalculator.solveODE('euler', odeExpr, x0, y0, xEnd, h, exactODE);
    const modEuler = NumericalCalculator.solveODE('modified-euler', odeExpr, x0, y0, xEnd, h, exactODE);
    const rk4 = NumericalCalculator.solveODE('rk4', odeExpr, x0, y0, xEnd, h, exactODE);

    return {
      problemCategory: 'ode',
      problemDescription: "Solve IVP dy/dx = x + y with y(0) = 1 on [0, 1], h = 0.1. Exact solution: y(x) = 2eˣ - x - 1",
      entries: [
        {
          methodName: "Euler's Method",
          resultSummary: `y(1.0) ≈ ${euler.finalY.toFixed(5)} (Exact: ${euler.finalExactY?.toFixed(5)})`,
          iterationOrSteps: euler.steps.length - 1,
          errorOrResidual: euler.maxGlobalError || 0,
          convergenceRate: 'Order O(h) global error',
          suitabilityForEng: 'Simple step formulation, but accumulates large truncation error; unsuitable for stiff dynamics.',
        },
        {
          methodName: "Modified Euler (Heun's Predictor-Corrector)",
          resultSummary: `y(1.0) ≈ ${modEuler.finalY.toFixed(5)} (Exact: ${modEuler.finalExactY?.toFixed(5)})`,
          iterationOrSteps: modEuler.steps.length - 1,
          errorOrResidual: modEuler.maxGlobalError || 0,
          convergenceRate: 'Order O(h²) global error',
          suitabilityForEng: 'Significant accuracy improvement over standard Euler with only two derivative evaluations per step.',
        },
        {
          methodName: 'Runge–Kutta 4th Order (RK4)',
          resultSummary: `y(1.0) ≈ ${rk4.finalY.toFixed(5)} (Exact: ${rk4.finalExactY?.toFixed(5)})`,
          iterationOrSteps: rk4.steps.length - 1,
          errorOrResidual: rk4.maxGlobalError || 0,
          convergenceRate: 'Order O(h⁴) global error',
          suitabilityForEng: 'The gold standard for engineering ODE trajectory solving; high accuracy with modest step size.',
        },
      ],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ BANK: Syllabus Grounded for U25MA402
  // ═══════════════════════════════════════════════════════════════════════════
  public static getQuizQuestions(): NumericalQuizQuestion[] {
    return [
      {
        id: 1,
        question: 'Under what necessary condition is the Bisection method guaranteed to converge to a root of f(x) = 0?',
        options: [
          "f'(x) must be non-zero everywhere",
          'f(x) must be continuous on [a, b] with f(a) · f(b) < 0',
          'f(x) must be a polynomial of odd degree',
          'The initial interval length must be less than 1.0',
        ],
        correctAnswer: 1,
        explanation:
          'By the Intermediate Value Theorem, if f(x) is continuous on [a, b] and f(a) and f(b) have opposite signs (f(a)·f(b) < 0), there exists at least one real root in the interval.',
        syllabusTopic: 'Unit I: Root-Finding Methods',
      },
      {
        id: 2,
        question: 'What is the order of convergence of the Newton–Raphson method near a simple root?',
        options: ['Linear (Order 1)', 'Quadratic (Order 2)', 'Superlinear (Order 1.618)', 'Cubic (Order 3)'],
        correctAnswer: 1,
        explanation:
          "The Newton-Raphson method exhibits quadratic convergence (order 2), meaning the number of correct significant decimal digits approximately doubles with each iteration, provided f'(root) ≠ 0.",
        syllabusTopic: 'Unit I: Newton-Raphson Method',
      },
      {
        id: 3,
        question: 'A system of linear equations Ax = b is guaranteed to converge under Gauss–Seidel iteration if the matrix A is:',
        options: ['Skew-symmetric', 'Strictly diagonally dominant', 'Orthogonal', 'Singular with zero determinant'],
        correctAnswer: 1,
        explanation:
          'A sufficient condition for both Jacobi and Gauss-Seidel iterative methods to converge is that the matrix A is strictly diagonally dominant: |a_ii| > ∑_{j≠i} |a_ij| for all rows i.',
        syllabusTopic: 'Unit I: Simultaneous Linear Equations',
      },
      {
        id: 4,
        question: "Why must Simpson's 1/3 rule always be applied over an EVEN number of subintervals (n = 2m)?",
        options: [
          'Because each parabolic interpolant requires 3 points spanning 2 adjacent subintervals',
          'Because Simpson 1/3 is only valid for quadratic functions',
          'To ensure the step size h is an integer',
          'Because odd intervals create negative area approximations',
        ],
        correctAnswer: 0,
        explanation:
          "Simpson's 1/3 rule fits a second-degree polynomial (parabola) through groups of three successive points (x_0, x_1, x_2), which span two subintervals. Hence, the total number of subintervals n must be even.",
        syllabusTopic: 'Unit III: Numerical Integration',
      },
      {
        id: 5,
        question: 'What is the Courant–Friedrichs–Lewy (CFL) stability criterion for the explicit FTCS scheme for the 1D heat equation ∂u/∂t = α·∂²u/∂x²?',
        options: ['r = α·Δt / (Δx)² ≤ 0.5', 'r = α·Δt / Δx ≤ 1.0', 'r = α·(Δt)² / Δx ≤ 0.25', 'r = (Δx)² / (α·Δt) ≤ 2.0'],
        correctAnswer: 0,
        explanation:
          'Von Neumann stability analysis of the standard explicit forward-time central-space (FTCS) diffusion scheme requires r = α·Δt / (Δx)² ≤ 1/2. For r > 0.5, numerical errors grow unboundedly.',
        syllabusTopic: 'Unit V: Partial Differential Equations',
      },
    ];
  }
}
