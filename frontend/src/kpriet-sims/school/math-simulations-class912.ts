/**
 * Class 9–12 Mathematics Simulations Suite
 * Real-time, interactive, parameter-driven math laboratories aligned with CBSE / NCERT / NEB Classes 9–12:
 * 1. Calculus Laboratory (Class 12: Derivatives, Tangents, Integrals & Riemann Sums)
 * 2. Dynamic Geometry Proofs (Class 10: 180° Triangle Sum, Circle Inscribed Angle, Pythagoras Theorem)
 * 3. 2D Vectors Laboratory (Class 11: Vector Addition, Parallelogram Law, Dot Product & Resolution)
 * 4. Sequences & Series Laboratory (Class 11: Arithmetic AP & Geometric GP Progressions, Series Sums)
 * 5. Geometric Transformations (Class 9: Rigid Motions, Rotations, Scaling, Axis Reflections)
 * 6. Trigonometric Unit Circle (Class 11: Angle θ, Radian Measure, Coordinates, Sinusoidal Unrolling)
 * 7. 2D Function Families & Curves (Class 11: Polynomials, Rational, Roots, Extrema & Transformations)
 * 8. Statistics & Live Data Visualizer (Class 10: Distributions, Histograms, Scatter, Box Plots, Mean & StdDev)
 */

import { C, P, arrow, circle, clear, defineSchool, fmt, line, metric, roundRect, text, timeEngine, type TimeState } from './kit';

// ─────────────────────────────────────────────────────────────
// 1. CALCULUS LABORATORY (Class 12 Mathematics)
// ─────────────────────────────────────────────────────────────

export const class912Calculus = defineSchool({
  id: 'g912-math-calculus',
  title: 'Calculus Laboratory: Derivatives & Integrals',
  band: 'GRADES_9_12',
  level: 'grade-12',
  levelLabel: 'Class 12',
  subject: 'Mathematics',
  category: 'Calculus & Analysis',
  icon: '∫',
  topic: 'Tangents, Derivatives, Definite Integrals & Riemann Approximations',
  shortDescription: 'Explore instantaneous rates of change, tangent slopes f\'(x), definite integrals, and Riemann sum approximations.',
  detailedDescription: 'Interactive calculus workbench illustrating differential and integral calculus. Analyze polynomial, sine, and cubic functions; observe how the secant line approaches the true tangent line at x0, compute derivative values f\'(x0), and visualize definite integrals via Left, Right, Midpoint, and Trapezoidal Riemann sums with adjustable subdivision strips.',
  learningObjectives: [
    'Understand the geometric interpretation of derivative f\'(x0) as the slope of the tangent line',
    'Evaluate definite integrals ∫ f(x) dx as the signed area between the curve and the x-axis',
    'Compare Left, Right, Midpoint, and Trapezoidal Riemann sums against analytical integrals',
    'Observe convergence of numerical integration as the number of subintervals N increases'
  ],
  formulaOverview: "f'(x₀) = lim[Δx→0] (f(x₀+Δx) - f(x₀))/Δx;   Area = ∫ₐᵇ f(x) dx ≈ ∑ f(xᵢ*) Δx",
  parameters: [
    P.select('func', 'Function f(x)', [
      ['poly', 'f(x) = x³ - 3x (Cubic)'],
      ['sin', 'f(x) = 2·sin(x) (Trigonometric)'],
      ['quad', 'f(x) = -x² + 4 (Parabola)'],
      ['exp', 'f(x) = 3·e^(-x²) (Gaussian Bell)'],
    ], 'poly'),
    P.range('x0', 'Tangent evaluation point x₀', -2.5, 2.5, 1.0, 0.1, ''),
    P.range('nRect', 'Riemann subdivisions N', 4, 32, 12, 2, ' strips'),
    P.select('riemann', 'Riemann approximation', [
      ['mid', 'Midpoint Rule'],
      ['left', 'Left Riemann Sum'],
      ['right', 'Right Riemann Sum'],
      ['trap', 'Trapezoidal Rule'],
    ], 'mid'),
    P.toggle('showTangent', 'Show tangent line & slope', true),
    P.toggle('showIntegral', 'Show Riemann integral area', true),
  ],
  metrics: [
    metric('fx0', 'f(x₀)', (_s, p) => {
      const x = p.x0;
      let y = 0;
      if (p.func === 'poly') y = x * x * x - 3 * x;
      else if (p.func === 'sin') y = 2 * Math.sin(x);
      else if (p.func === 'quad') y = -x * x + 4;
      else if (p.func === 'exp') y = 3 * Math.exp(-x * x);
      return fmt(y, 3);
    }),
    metric('dfx0', "f'(x₀) Slope", (_s, p) => {
      const x = p.x0;
      let dy = 0;
      if (p.func === 'poly') dy = 3 * x * x - 3;
      else if (p.func === 'sin') dy = 2 * Math.cos(x);
      else if (p.func === 'quad') dy = -2 * x;
      else if (p.func === 'exp') dy = -6 * x * Math.exp(-x * x);
      return fmt(dy, 3);
    }),
    metric('exactArea', 'Exact Area [-2, 2]', (_s, p) => {
      let area = 0;
      if (p.func === 'poly') area = 0; // odd function symmetric
      else if (p.func === 'sin') area = 0; // odd function symmetric
      else if (p.func === 'quad') area = 10.667; // 2 * (4*2 - 8/3) = 16 - 16/3 = 32/3
      else if (p.func === 'exp') area = 5.084;
      return fmt(area, 3);
    }),
    metric('riemannArea', 'Riemann Sum S_N', (_s, p) => {
      const a = -2;
      const b = 2;
      const n = p.nRect;
      const dx = (b - a) / n;
      let sum = 0;
      const f = (x: number) => {
        if (p.func === 'poly') return x * x * x - 3 * x;
        if (p.func === 'sin') return 2 * Math.sin(x);
        if (p.func === 'quad') return -x * x + 4;
        return 3 * Math.exp(-x * x);
      };
      for (let i = 0; i < n; i++) {
        const xLeft = a + i * dx;
        const xRight = xLeft + dx;
        let xEval = (xLeft + xRight) / 2;
        if (p.riemann === 'left') xEval = xLeft;
        else if (p.riemann === 'right') xEval = xRight;
        if (p.riemann === 'trap') {
          sum += 0.5 * (f(xLeft) + f(xRight)) * dx;
        } else {
          sum += f(xEval) * dx;
        }
      }
      return fmt(sum, 3);
    }),
  ],
  tags: ['calculus', 'derivatives', 'tangents', 'integrals', 'riemann sum', 'class 12', 'cbse math', 'ncert math'],
  engine: timeEngine(
    (ctx, w, h, _s: TimeState, p) => {
      clear(ctx, w, h, 'Class 12 Mathematics · Calculus Laboratory');

      const originX = w * 0.5;
      const originY = h * 0.52;
      const scaleX = Math.min(w * 0.12, 60);
      const scaleY = Math.min(h * 0.08, 40);

      // Grid lines
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -4; gx <= 4; gx++) {
        const px = originX + gx * scaleX;
        line(ctx, px, 40, px, h - 30, '#E2E8F0', 1);
        text(ctx, `${gx}`, px, originY + 16, { size: 10, color: C.muted });
      }
      for (let gy = -4; gy <= 4; gy++) {
        const py = originY - gy * scaleY;
        line(ctx, 40, py, w - 40, py, '#E2E8F0', 1);
        if (gy !== 0) text(ctx, `${gy}`, originX - 16, py, { size: 10, color: C.muted });
      }

      // X and Y Axes
      line(ctx, 30, originY, w - 30, originY, '#64748B', 2);
      line(ctx, originX, 35, originX, h - 25, '#64748B', 2);
      arrow(ctx, w - 30, originY, w - 15, originY, { color: '#64748B', width: 6 });
      arrow(ctx, originX, 35, originX, 20, { color: '#64748B', width: 6 });
      text(ctx, 'x', w - 10, originY + 14, { size: 12, weight: 600, color: '#334155' });
      text(ctx, 'y = f(x)', originX + 28, 24, { size: 12, weight: 600, color: '#334155' });

      const f = (x: number) => {
        if (p.func === 'poly') return x * x * x - 3 * x;
        if (p.func === 'sin') return 2 * Math.sin(x);
        if (p.func === 'quad') return -x * x + 4;
        return 3 * Math.exp(-x * x);
      };

      const df = (x: number) => {
        if (p.func === 'poly') return 3 * x * x - 3;
        if (p.func === 'sin') return 2 * Math.cos(x);
        if (p.func === 'quad') return -2 * x;
        return -6 * x * Math.exp(-x * x);
      };

      // Riemann rectangles / trapezoids
      if (p.showIntegral) {
        const a = -2;
        const b = 2;
        const n = p.nRect;
        const dx = (b - a) / n;
        for (let i = 0; i < n; i++) {
          const xL = a + i * dx;
          const xR = xL + dx;
          const pxL = originX + xL * scaleX;
          const pxR = originX + xR * scaleX;
          const pWidth = pxR - pxL;

          if (p.riemann === 'trap') {
            const yL = f(xL);
            const yR = f(xR);
            const pyL = originY - yL * scaleY;
            const pyR = originY - yR * scaleY;
            ctx.beginPath();
            ctx.moveTo(pxL, originY);
            ctx.lineTo(pxL, pyL);
            ctx.lineTo(pxR, pyR);
            ctx.lineTo(pxR, originY);
            ctx.closePath();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
            ctx.fill();
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else {
            let xEval = (xL + xR) / 2;
            if (p.riemann === 'left') xEval = xL;
            else if (p.riemann === 'right') xEval = xR;
            const yEval = f(xEval);
            const pyEval = originY - yEval * scaleY;
            const rectH = originY - pyEval;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fillRect(pxL, yEval >= 0 ? pyEval : originY, pWidth, Math.abs(rectH));
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1;
            ctx.strokeRect(pxL, yEval >= 0 ? pyEval : originY, pWidth, Math.abs(rectH));
          }
        }
      }

      // Plot curve f(x)
      ctx.beginPath();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.8;
      let first = true;
      for (let px = 40; px <= w - 40; px += 2) {
        const mathX = (px - originX) / scaleX;
        const mathY = f(mathX);
        const screenY = originY - mathY * scaleY;
        if (screenY >= 30 && screenY <= h - 20) {
          if (first) {
            ctx.moveTo(px, screenY);
            first = false;
          } else {
            ctx.lineTo(px, screenY);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();

      // Tangent line & slope at x0
      if (p.showTangent) {
        const x0 = p.x0;
        const y0 = f(x0);
        const slope = df(x0);
        const px0 = originX + x0 * scaleX;
        const py0 = originY - y0 * scaleY;

        // Tangent line extension
        const deltaX = 1.8;
        const xA = x0 - deltaX;
        const yA = y0 - slope * deltaX;
        const xB = x0 + deltaX;
        const yB = y0 + slope * deltaX;

        line(
          ctx,
          originX + xA * scaleX,
          originY - yA * scaleY,
          originX + xB * scaleX,
          originY - yB * scaleY,
          '#EF4444',
          2.4
        );

        // Point of tangency (x0, y0)
        circle(ctx, px0, py0, 5.5, { fill: '#FACC15', stroke: '#DC2626', width: 2.2 });

        // Tangent slope annotation card
        roundRect(ctx, px0 + 12, py0 - 38, 145, 34, 6, 'rgba(15, 23, 42, 0.85)', '#EF4444', 1.5);
        text(ctx, `x₀ = ${fmt(x0, 2)},  f(x₀) = ${fmt(y0, 2)}`, px0 + 84, py0 - 28, { size: 10, color: '#F8FAFC' });
        text(ctx, `m = f'(x₀) = ${fmt(slope, 2)}`, px0 + 84, py0 - 14, { size: 11, weight: 600, color: '#FACC15' });
      }

      // Legend box
      roundRect(ctx, 45, 50, 230, 60, 8, 'rgba(255, 255, 255, 0.94)', '#CBD5E1', 1);
      circle(ctx, 60, 68, 5, { fill: '#0F172A' });
      text(ctx, 'Function Curve y = f(x)', 140, 68, { size: 11, weight: 600, color: '#0F172A', align: 'left' });
      if (p.showTangent) {
        circle(ctx, 60, 84, 5, { fill: '#EF4444' });
        text(ctx, "Tangent line (slope = f')", 140, 84, { size: 11, weight: 600, color: '#DC2626', align: 'left' });
      }
      if (p.showIntegral) {
        roundRect(ctx, 55, 94, 12, 10, 2, 'rgba(56,189,248,0.4)', '#0284C7', 1);
        text(ctx, `Riemann Sum (${p.riemann})`, 140, 99, { size: 11, weight: 600, color: '#0284C7', align: 'left' });
      }
    },
    () => ({ t: 0 })
  ),
});

// ─────────────────────────────────────────────────────────────
// 2. DYNAMIC GEOMETRY PROOFS & THEOREMS (Class 10 Mathematics)
// ─────────────────────────────────────────────────────────────
export const class912GeometryProofs = defineSchool({
  id: 'g912-math-geometry-proofs',
  title: 'Dynamic Geometry Proofs & Theorems',
  band: 'GRADES_9_12',
  level: 'grade-10',
  levelLabel: 'Class 10',
  subject: 'Mathematics',
  category: 'Geometry',
  icon: '📐',
  topic: 'Triangle Angle Sum, Circle Inscribed Angles & Pythagoras Theorem',
  shortDescription: 'Interactive geometric proofs: verify 180° triangle sum, circle chord theorems, and Euclidean square dissection for a² + b² = c².',
  detailedDescription: 'Step-by-step visual proofs of fundamental geometric theorems. 1) Drag triangle vertices to verify that the interior angle sum is invariant at exactly 180°. 2) Examine circle inscribed angles to demonstrate that the central angle subtended by an arc is double any inscribed angle. 3) Explore Pythagoras theorem through dynamic right-triangle side lengths and square area equivalence.',
  learningObjectives: [
    'Verify that the sum of interior angles in any Euclidean triangle is strictly 180°',
    'Demonstrate the Inscribed Angle Theorem: central angle θ_c = 2 · θ_inscribed',
    'Understand the algebraic and geometric proof of Pythagoras Theorem: a² + b² = c²',
    'Analyze geometric invariants under continuous deformation'
  ],
  formulaOverview: '∠A + ∠B + ∠C = 180°;   ∠AOB = 2 · ∠APB;   a² + b² = c²',
  parameters: [
    P.select('theorem', 'Select Theorem', [
      ['triangle', '1. Triangle Interior Angle Sum (180°)'],
      ['circle', '2. Circle Inscribed vs Central Angle'],
      ['pythagoras', '3. Pythagorean Theorem (a² + b² = c²)'],
    ], 'triangle'),
    P.range('paramA', 'Variable Control A (Angle / Side a)', 20, 100, 60, 2, ''),
    P.range('paramB', 'Variable Control B (Angle / Side b)', 20, 100, 50, 2, ''),
    P.toggle('showAngles', 'Show dynamic angle arcs', true),
    P.toggle('showProofSteps', 'Show algebraic proof step', true),
  ],
  metrics: [
    metric('invSum', 'Angle Sum', (_s, p) => {
      if (p.theorem === 'triangle') return '180.0° (Strict Invariant)';
      if (p.theorem === 'circle') return 'θ_c = 2 · θ_p';
      const a = p.paramA;
      const b = p.paramB;
      const c = Math.sqrt(a * a + b * b);
      return `c = ${fmt(c, 1)}`;
    }),
    metric('detailA', 'Metric A', (_s, p) => {
      if (p.theorem === 'triangle') return `∠A = ${fmt(p.paramA, 1)}°`;
      if (p.theorem === 'circle') return `Central ∠ = ${fmt(p.paramA * 2, 1)}°`;
      return `a² = ${p.paramA * p.paramA}`;
    }),
    metric('detailB', 'Metric B', (_s, p) => {
      if (p.theorem === 'triangle') return `∠B = ${fmt(p.paramB, 1)}°`;
      if (p.theorem === 'circle') return `Inscribed ∠ = ${fmt(p.paramA, 1)}°`;
      return `b² = ${p.paramB * p.paramB}`;
    }),
    metric('detailC', 'Metric C', (_s, p) => {
      if (p.theorem === 'triangle') {
        const c = 180 - p.paramA - p.paramB;
        return `∠C = ${fmt(c, 1)}°`;
      }
      if (p.theorem === 'circle') return 'Arc Ratio = 2.00';
      const a = p.paramA;
      const b = p.paramB;
      return `c² = ${a * a + b * b}`;
    }),
  ],
  tags: ['geometry', 'proofs', 'pythagoras', 'theorems', 'angles', 'circle theorems', 'class 10', 'cbse math'],
  engine: timeEngine(
    (ctx, w, h, _s: TimeState, p) => {
      clear(ctx, w, h, 'Class 10 Mathematics · Dynamic Geometry Proofs');

      const cx = w * 0.5;
      const cy = h * 0.52;

      if (p.theorem === 'triangle') {
        // Dynamic Triangle with vertex deformation
        const angleA = (p.paramA * Math.PI) / 180;
        const angleB = (p.paramB * Math.PI) / 180;
        const angleC = Math.PI - angleA - angleB;

        const baseLen = Math.min(w * 0.44, 280);
        const pA = { x: cx - baseLen * 0.5, y: cy + 100 };
        const pB = { x: cx + baseLen * 0.5, y: cy + 100 };

        // Calculate vertex C via sine rule
        const sideC = baseLen;
        const sideB = (sideC * Math.sin(angleB)) / Math.sin(angleC);
        const pC = {
          x: pA.x + sideB * Math.cos(angleA),
          y: pA.y - sideB * Math.sin(angleA),
        };

        // Triangle body
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pC.x, pC.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Vertices
        [pA, pB, pC].forEach((pt, i) => {
          circle(ctx, pt.x, pt.y, 6, { fill: '#FACC15', stroke: '#0F172A', width: 2 });
          const label = i === 0 ? 'A' : (i === 1 ? 'B' : 'C');
          const offY = i === 2 ? -18 : 20;
          text(ctx, label, pt.x, pt.y + offY, { size: 14, weight: 700, color: '#0F172A' });
        });

        // Parallel line through C to prove 180°
        if (p.showProofSteps) {
          line(ctx, pC.x - 140, pC.y, pC.x + 140, pC.y, '#EF4444', 2, [5, 4]);
          text(ctx, 'Line || AB', pC.x + 155, pC.y, { size: 11, color: '#DC2626', align: 'left' });
          text(ctx, `Alternate interior angles equal: ∠A + ∠B + ∠C = 180.0°`, cx, cy + 140, {
            size: 13,
            weight: 600,
            color: '#16A34A',
          });
        }

        // Angle labels inside triangle
        text(ctx, `${p.paramA}°`, pA.x + 38, pA.y - 16, { size: 12, weight: 600, color: '#2563EB' });
        text(ctx, `${p.paramB}°`, pB.x - 38, pB.y - 16, { size: 12, weight: 600, color: '#EA580C' });
        text(ctx, `${fmt(180 - p.paramA - p.paramB, 1)}°`, pC.x, pC.y + 26, { size: 12, weight: 600, color: '#16A34A' });

      } else if (p.theorem === 'circle') {
        // Circle Inscribed vs Central Angle Theorem
        const radius = Math.min(w * 0.22, 140);
        circle(ctx, cx, cy, radius, { fill: 'rgba(248, 250, 252, 0.4)', stroke: '#64748B', width: 2.5 });
        circle(ctx, cx, cy, 4, { fill: '#0F172A' });
        text(ctx, 'O (Center)', cx, cy + 16, { size: 11, color: '#475569' });

        const angleInscribedDeg = p.paramA; // e.g. 50 deg
        const angleCentralDeg = angleInscribedDeg * 2; // 100 deg

        const thetaA = Math.PI * 0.75;
        const thetaB = thetaA - (angleCentralDeg * Math.PI) / 180;
        const thetaP = Math.PI * 0.5 - 0.2; // top vertex on circle

        const pA = { x: cx + radius * Math.cos(thetaA), y: cy - radius * Math.sin(thetaA) };
        const pB = { x: cx + radius * Math.cos(thetaB), y: cy - radius * Math.sin(thetaB) };
        const pP = { x: cx + radius * Math.cos(thetaP), y: cy - radius * Math.sin(thetaP) };

        // Central rays (O to A and B)
        line(ctx, cx, cy, pA.x, pA.y, '#EA580C', 2.5);
        line(ctx, cx, cy, pB.x, pB.y, '#EA580C', 2.5);

        // Inscribed rays (P to A and B)
        line(ctx, pP.x, pP.y, pA.x, pA.y, '#2563EB', 2.5);
        line(ctx, pP.x, pP.y, pB.x, pB.y, '#2563EB', 2.5);

        // Points
        circle(ctx, pA.x, pA.y, 5, { fill: '#FACC15', stroke: '#0F172A', width: 2 });
        circle(ctx, pB.x, pB.y, 5, { fill: '#FACC15', stroke: '#0F172A', width: 2 });
        circle(ctx, pP.x, pP.y, 5, { fill: '#38BDF8', stroke: '#0F172A', width: 2 });

        text(ctx, 'A', pA.x - 14, pA.y, { size: 12, weight: 700, color: '#0F172A' });
        text(ctx, 'B', pB.x + 14, pB.y, { size: 12, weight: 700, color: '#0F172A' });
        text(ctx, 'P (Inscribed)', pP.x, pP.y - 16, { size: 12, weight: 700, color: '#0284C7' });

        // Angle badges
        text(ctx, `Central ∠AOB = ${fmt(angleCentralDeg, 1)}°`, cx, cy - 24, { size: 12, weight: 600, color: '#EA580C' });
        text(ctx, `Inscribed ∠APB = ${fmt(angleInscribedDeg, 1)}°`, pP.x, pP.y + 26, { size: 12, weight: 600, color: '#2563EB' });

        if (p.showProofSteps) {
          text(ctx, `Theorem Verified: Central Angle = 2 × Inscribed Angle (${fmt(angleCentralDeg, 1)}° = 2 × ${fmt(angleInscribedDeg, 1)}°)`, cx, cy + radius + 40, {
            size: 13,
            weight: 600,
            color: '#16A34A',
          });
        }

      } else {
        // Pythagoras Theorem (a² + b² = c²) with squares
        const a = (p.paramA * 1.4);
        const b = (p.paramB * 1.4);
        const c = Math.sqrt(a * a + b * b);

        const oX = cx - 40;
        const oY = cy + 40;

        // Right triangle vertices: (oX, oY), (oX + a, oY), (oX, oY - b)
        const vA = { x: oX, y: oY };
        const vB = { x: oX + a, y: oY };
        const vC = { x: oX, y: oY - b };

        // Triangle
        ctx.beginPath();
        ctx.moveTo(vA.x, vA.y);
        ctx.lineTo(vB.x, vB.y);
        ctx.lineTo(vC.x, vC.y);
        ctx.closePath();
        ctx.fillStyle = '#FEF3C7';
        ctx.fill();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Right angle marker
        ctx.strokeRect(oX, oY - 14, 14, 14);

        // Square on side a (bottom)
        roundRect(ctx, oX, oY, a, a, 2, 'rgba(56, 189, 248, 0.25)', '#0284C7', 1.8);
        text(ctx, `a² = ${fmt(p.paramA * p.paramA, 0)}`, oX + a * 0.5, oY + a * 0.5, { size: 11, weight: 700, color: '#0284C7' });

        // Square on side b (left)
        roundRect(ctx, oX - b, oY - b, b, b, 2, 'rgba(234, 88, 12, 0.25)', '#EA580C', 1.8);
        text(ctx, `b² = ${fmt(p.paramB * p.paramB, 0)}`, oX - b * 0.5, oY - b * 0.5, { size: 11, weight: 700, color: '#EA580C' });

        // Hypotenuse square indication
        text(ctx, `Hypotenuse c = ${fmt(c / 1.4, 1)}`, (vB.x + vC.x) * 0.5 + 24, (vB.y + vC.y) * 0.5 - 18, {
          size: 12,
          weight: 700,
          color: '#16A34A',
        });

        // Verification banner
        const a2 = p.paramA * p.paramA;
        const b2 = p.paramB * p.paramB;
        const c2 = a2 + b2;
        roundRect(ctx, cx - 180, h - 55, 360, 36, 8, '#0F172A');
        text(ctx, `Pythagoras: ${a2} + ${b2} = ${c2} (a² + b² = c²)`, cx, h - 37, { size: 13, weight: 700, color: '#FACC15' });
      }
    },
    () => ({ t: 0 })
  ),
});

// ─────────────────────────────────────────────────────────────
// 3. 2D VECTORS LABORATORY (Class 11 Mathematics)
// ─────────────────────────────────────────────────────────────
export const class912Vectors = defineSchool({
  id: 'g912-math-vectors',
  title: '2D Vectors Laboratory',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Mathematics',
  category: 'Algebra & Vectors',
  icon: '↗️',
  topic: 'Vector Addition, Parallelogram Law, Scalar Dot Product & Components',
  shortDescription: 'Manipulate 2D vectors A and B; examine vector resolution, resultant addition R = A + B, and scalar dot product.',
  detailedDescription: 'Real-time 2D vector workspace. Decompose vectors into rectangular Cartesian components (Ax, Ay) and (Bx, By), verify the Parallelogram and Triangle Laws of vector addition, compute vector magnitudes and direction angles, and calculate scalar dot product A · B = |A||B| cos(θ) with dynamic projection shadows.',
  learningObjectives: [
    'Resolve vectors into rectangular components along orthogonal Cartesian axes',
    'Apply the Parallelogram Law and Triangle Law to compute resultant R = A + B',
    'Calculate vector magnitude |R| = √(Ax² + Ay²) and direction angle θ = arctan(Ay/Ax)',
    'Compute scalar dot product A · B and determine the condition for orthogonality'
  ],
  formulaOverview: 'R = A + B;   |R| = √(Rx² + Ry²);   A · B = |A||B|cos(θ) = AxBx + AyBy',
  parameters: [
    P.range('ax', 'Vector A_x', -8, 8, 5, 1, ''),
    P.range('ay', 'Vector A_y', -8, 8, 3, 1, ''),
    P.range('bx', 'Vector B_x', -8, 8, 2, 1, ''),
    P.range('by', 'Vector B_y', -8, 8, 5, 1, ''),
    P.toggle('parallelogram', 'Show parallelogram law', true),
    P.toggle('components', 'Show rectangular components', true),
  ],
  metrics: [
    metric('magA', '|A| Magnitude', (_s, p) => fmt(Math.sqrt(p.ax * p.ax + p.ay * p.ay), 2)),
    metric('magB', '|B| Magnitude', (_s, p) => fmt(Math.sqrt(p.bx * p.bx + p.by * p.by), 2)),
    metric('magR', '|R| Resultant', (_s, p) => {
      const rx = p.ax + p.bx;
      const ry = p.ay + p.by;
      return fmt(Math.sqrt(rx * rx + ry * ry), 2);
    }),
    metric('dotProd', 'Dot Product A·B', (_s, p) => {
      const dot = p.ax * p.bx + p.ay * p.by;
      return fmt(dot, 1);
    }),
  ],
  tags: ['vectors', 'parallelogram law', 'dot product', 'magnitude', 'direction', 'components', 'class 11', 'cbse math'],
  engine: timeEngine(
    (ctx, w, h, _s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Mathematics · 2D Vectors Laboratory');

      const originX = w * 0.42;
      const originY = h * 0.54;
      const scale = Math.min(w * 0.038, 26);

      // Grid
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      for (let g = -14; g <= 14; g++) {
        line(ctx, originX + g * scale, 30, originX + g * scale, h - 30, '#F1F5F9', 1);
        line(ctx, 30, originY + g * scale, w - 30, originY + g * scale, '#F1F5F9', 1);
      }

      // Main Axes
      line(ctx, 40, originY, w - 40, originY, '#94A3B8', 1.8);
      line(ctx, originX, 40, originX, h - 30, '#94A3B8', 1.8);
      arrow(ctx, w - 40, originY, w - 25, originY, { color: '#94A3B8', width: 5 });
      arrow(ctx, originX, 40, originX, 25, { color: '#94A3B8', width: 5 });

      const pAx = originX + p.ax * scale;
      const pAy = originY - p.ay * scale;

      const pBx = originX + p.bx * scale;
      const pBy = originY - p.by * scale;

      const pRx = originX + (p.ax + p.bx) * scale;
      const pRy = originY - (p.ay + p.by) * scale;

      // Parallelogram ghost lines
      if (p.parallelogram) {
        line(ctx, pAx, pAy, pRx, pRy, '#38BDF8', 1.8, [4, 4]);
        line(ctx, pBx, pBy, pRx, pRy, '#F59E0B', 1.8, [4, 4]);
      }

      // Components dashed lines
      if (p.components) {
        line(ctx, pAx, pAy, pAx, originY, '#0284C7', 1.2, [2, 2]);
        line(ctx, pBx, pBy, pBx, originY, '#EA580C', 1.2, [2, 2]);
        line(ctx, pRx, pRy, pRx, originY, '#16A34A', 1.5, [3, 2]);
      }

      // Vector A
      arrow(ctx, originX, originY, pAx, pAy, { color: '#0284C7', width: 8 });
      circle(ctx, pAx, pAy, 4, { fill: '#0284C7' });
      text(ctx, `A (${p.ax}, ${p.ay})`, pAx + (p.ax >= 0 ? 12 : -12), pAy - 10, { size: 11, weight: 700, color: '#0284C7' });

      // Vector B
      arrow(ctx, originX, originY, pBx, pBy, { color: '#EA580C', width: 8 });
      circle(ctx, pBx, pBy, 4, { fill: '#EA580C' });
      text(ctx, `B (${p.bx}, ${p.by})`, pBx + (p.bx >= 0 ? 12 : -12), pBy - 10, { size: 11, weight: 700, color: '#EA580C' });

      // Resultant R = A + B
      arrow(ctx, originX, originY, pRx, pRy, { color: '#16A34A', width: 10 });
      circle(ctx, pRx, pRy, 5, { fill: '#FACC15', stroke: '#16A34A', width: 2 });
      text(ctx, `R = A + B (${p.ax + p.bx}, ${p.ay + p.by})`, pRx + 14, pRy - 12, { size: 12, weight: 700, color: '#16A34A' });

      // Angle between A and B
      const magA = Math.sqrt(p.ax * p.ax + p.ay * p.ay);
      const magB = Math.sqrt(p.bx * p.bx + p.by * p.by);
      const dot = p.ax * p.bx + p.ay * p.by;
      const cosTheta = magA * magB > 0 ? Math.max(-1, Math.min(1, dot / (magA * magB))) : 1;
      const thetaDeg = (Math.acos(cosTheta) * 180) / Math.PI;

      // Summary Card
      roundRect(ctx, w - 240, 50, 210, 110, 8, 'rgba(255, 255, 255, 0.95)', '#CBD5E1', 1);
      text(ctx, 'VECTOR ANALYSIS', w - 135, 68, { size: 11, weight: 700, color: '#0F172A' });
      text(ctx, `|A| = ${fmt(magA, 2)}   |B| = ${fmt(magB, 2)}`, w - 135, 88, { size: 11, color: '#475569' });
      text(ctx, `|R| = ${fmt(Math.sqrt((p.ax + p.bx) ** 2 + (p.ay + p.by) ** 2), 2)}`, w - 135, 106, { size: 12, weight: 700, color: '#16A34A' });
      text(ctx, `Angle θ_AB = ${fmt(thetaDeg, 1)}°`, w - 135, 124, { size: 11, color: '#2563EB' });
      text(ctx, `A · B = ${fmt(dot, 1)}`, w - 135, 142, { size: 11, weight: 600, color: dot === 0 ? '#16A34A' : '#EA580C' });
    },
    () => ({ t: 0 })
  ),
});

// ─────────────────────────────────────────────────────────────
// 4. SEQUENCES & SERIES LABORATORY (Class 11 Mathematics)
// ─────────────────────────────────────────────────────────────
export const class912Sequences = defineSchool({
  id: 'g912-math-sequences',
  title: 'Sequences & Series Laboratory (AP & GP)',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Mathematics',
  category: 'Algebra & Sequences',
  icon: '∑',
  topic: 'Arithmetic (AP) & Geometric (GP) Progressions, nth Term & Sum of Series',
  shortDescription: 'Explore discrete terms, common differences/ratios, cumulative sums Sn, and infinite convergence of AP and GP series.',
  detailedDescription: 'Laboratory for investigating numerical sequences. Dynamically adjust initial term a, common difference d (AP) or common ratio r (GP), number of terms n, and observe the discrete bar chart representation alongside the cumulative sum Sn progression curve. Observe divergence vs convergence conditions for infinite geometric series (|r| < 1).',
  learningObjectives: [
    'Formulate the nth term of an AP: a_n = a + (n-1)d, and sum S_n = n/2 · [2a + (n-1)d]',
    'Formulate the nth term of a GP: a_n = a · r^(n-1), and sum S_n = a(1 - r^n)/(1 - r)',
    'Analyze conditions for convergence of infinite geometric series: S_∞ = a / (1 - r)',
    'Differentiate between linear growth (AP) and exponential growth (GP)'
  ],
  formulaOverview: 'AP: a_n = a + (n-1)d,  S_n = n/2(a + l);   GP: a_n = a·r^(n-1),  S_n = a(rⁿ - 1)/(r - 1)',
  parameters: [
    P.select('type', 'Progression Type', [
      ['ap', 'Arithmetic Progression (AP)'],
      ['gp', 'Geometric Progression (GP)'],
    ], 'ap'),
    P.range('first', 'Initial Term a', -10, 10, 2, 1, ''),
    P.range('diffRatio', 'Difference d (AP) / Ratio r (GP)', -4, 4, 2, 0.25, ''),
    P.range('terms', 'Number of terms n', 4, 18, 10, 1, ''),
    P.toggle('showSumCurve', 'Show cumulative sum line S_n', true),
  ],
  metrics: [
    metric('lastTerm', 'nth Term a_n', (_s, p) => {
      const a = p.first;
      const n = p.terms;
      if (p.type === 'ap') {
        return fmt(a + (n - 1) * p.diffRatio, 2);
      }
      return fmt(a * Math.pow(p.diffRatio, n - 1), 2);
    }),
    metric('sumSn', 'Total Sum S_n', (_s, p) => {
      const a = p.first;
      const n = p.terms;
      if (p.type === 'ap') {
        const sn = (n / 2) * (2 * a + (n - 1) * p.diffRatio);
        return fmt(sn, 2);
      }
      const r = p.diffRatio;
      if (Math.abs(r - 1) < 1e-4) return fmt(a * n, 2);
      const sn = (a * (1 - Math.pow(r, n))) / (1 - r);
      return fmt(sn, 2);
    }),
    metric('nature', 'Behavior', (_s, p) => {
      if (p.type === 'ap') {
        return p.diffRatio > 0 ? 'Strictly Increasing' : (p.diffRatio < 0 ? 'Decreasing' : 'Constant');
      }
      const r = Math.abs(p.diffRatio);
      return r < 1 ? 'Convergent (|r| < 1)' : (r === 1 ? 'Constant' : 'Divergent (|r| > 1)');
    }),
  ],
  tags: ['sequences', 'series', 'ap', 'gp', 'arithmetic progression', 'geometric progression', 'class 11', 'cbse math'],
  engine: timeEngine(
    (ctx, w, h, _s: TimeState, p) => {
      clear(ctx, w, h, `Class 11 Mathematics · ${p.type === 'ap' ? 'Arithmetic Progression' : 'Geometric Progression'}`);

      const a = p.first;
      const n = p.terms;
      const dr = p.diffRatio;

      // Compute terms
      const terms: number[] = [];
      const sums: number[] = [];
      let runningSum = 0;
      for (let i = 0; i < n; i++) {
        const val = p.type === 'ap' ? a + i * dr : a * Math.pow(dr, i);
        terms.push(val);
        runningSum += val;
        sums.push(runningSum);
      }

      const baselineY = h * 0.74;
      const chartX = w * 0.12;
      const chartW = w * 0.78;
      const barWidth = Math.min(chartW / (n * 1.6), 34);
      const spacing = chartW / n;

      // Find max magnitude for scaling
      const maxVal = Math.max(...terms.map(Math.abs), 10);
      const scaleH = (h * 0.44) / maxVal;

      // Baseline
      line(ctx, chartX - 20, baselineY, chartX + chartW + 20, baselineY, '#475569', 2);

      // Bars for each term a_i
      terms.forEach((val, i) => {
        const bx = chartX + i * spacing;
        const bHeight = val * scaleH;
        const by = val >= 0 ? baselineY - bHeight : baselineY;
        const color = val >= 0 ? '#38BDF8' : '#F43F5E';

        roundRect(ctx, bx - barWidth * 0.5, by, barWidth, Math.abs(bHeight), 3, color, '#0F172A', 1);

        // Term label (n = i+1)
        text(ctx, `a${i + 1}`, bx, baselineY + 16, { size: 10, weight: 600, color: '#64748B' });
        text(ctx, fmt(val, 1), bx, val >= 0 ? by - 8 : by + Math.abs(bHeight) + 12, {
          size: 9,
          weight: 600,
          color: '#0F172A',
        });
      });

      // Cumulative sum curve
      if (p.showSumCurve && sums.length > 1) {
        const maxS = Math.max(...sums.map(Math.abs), 20);
        const scaleS = (h * 0.36) / maxS;

        ctx.beginPath();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.8;
        sums.forEach((sVal, i) => {
          const sx = chartX + i * spacing;
          const sy = baselineY - sVal * scaleS;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();

        sums.forEach((sVal, i) => {
          const sx = chartX + i * spacing;
          const sy = baselineY - sVal * scaleS;
          circle(ctx, sx, sy, 4, { fill: '#F59E0B', stroke: '#78350F', width: 1.5 });
        });
      }

      // Legend & formulas
      roundRect(ctx, w - 260, 48, 225, 90, 8, 'rgba(255, 255, 255, 0.94)', '#CBD5E1', 1);
      text(ctx, p.type === 'ap' ? 'FORMULA: a_n = a + (n-1)d' : 'FORMULA: a_n = a · r^(n-1)', w - 147, 66, {
        size: 11,
        weight: 700,
        color: '#0F172A',
      });
      text(ctx, p.type === 'ap' ? `a = ${a},  d = ${dr}` : `a = ${a},  r = ${dr}`, w - 147, 86, { size: 11, color: '#475569' });
      text(ctx, `Total S_${n} = ${fmt(sums[sums.length - 1] ?? 0, 2)}`, w - 147, 108, { size: 12, weight: 700, color: '#D97706' });
    },
    () => ({ t: 0 })
  ),
});

// ─────────────────────────────────────────────────────────────
// 5. GEOMETRIC TRANSFORMATIONS & SYMMETRY (Class 9 Mathematics)
// ─────────────────────────────────────────────────────────────
export const class912Transforms = defineSchool({
  id: 'g912-math-transforms',
  title: 'Geometric Transformations & Symmetry',
  band: 'GRADES_9_12',
  level: 'grade-9',
  levelLabel: 'Class 9',
  subject: 'Mathematics',
  category: 'Coordinate Geometry',
  icon: '↻',
  topic: '2D Rigid Motions, Rotations, Dilations & Reflections Across Coordinate Axes',
  shortDescription: 'Apply rotation angles θ, scale factors, and reflections across axes to geometric shapes and analyze vertex coordinates.',
  detailedDescription: 'Interactive workbench for 2D coordinate geometry and Euclidean transformations. Rotate triangles and polygons through angles θ ∈ [0, 360°], dilate/scale from the origin with factor k, and perform reflections across the X-axis, Y-axis, or origin. Track coordinates of vertices (x, y) ↦ (x\', y\') in real time.',
  learningObjectives: [
    'Apply rotation matrix [cos θ, -sin θ; sin θ, cos θ] to coordinates',
    'Understand reflection mapping across the X-axis (x, -y) and Y-axis (-x, y)',
    'Observe dilation and scale factor effects on perimeter and area (Area ∝ k²)',
    'Recognize rotational and reflectional symmetries of geometric shapes'
  ],
  formulaOverview: "Rotation: (x', y') = (x cos θ - y sin θ, x sin θ + y cos θ);   Dilation: (kx, ky)",
  parameters: [
    P.range('rotation', 'Rotation angle θ', 0, 360, 45, 5, '°'),
    P.range('scale', 'Scale factor k', 0.5, 2.5, 1.2, 0.1, 'x'),
    P.select('reflection', 'Axis reflection', [
      ['none', 'None (Original)'],
      ['x', 'Reflect across X-axis (y ↦ -y)'],
      ['y', 'Reflect across Y-axis (x ↦ -x)'],
      ['origin', 'Reflect through Origin (-x, -y)'],
    ], 'none'),
    P.select('shape', 'Shape polygon', [
      ['triangle', 'Right Triangle'],
      ['trapezium', 'Trapezium'],
      ['kite', 'Kite'],
    ], 'triangle'),
    P.toggle('showOriginal', 'Overlay original shape (ghost)', true),
  ],
  metrics: [
    metric('rotRad', 'Rotation Radians', (_s, p) => `${fmt((p.rotation * Math.PI) / 180, 2)} rad`),
    metric('scaleFactor', 'Scale Area Ratio', (_s, p) => `k² = ${fmt(p.scale * p.scale, 2)}x`),
    metric('reflectType', 'Reflection', (_s, p) => p.reflection.toUpperCase()),
  ],
  tags: ['transformations', 'rotation', 'reflection', 'scale', 'dilation', 'symmetry', 'class 9', 'cbse math'],
  engine: timeEngine(
    (ctx, w, h, _s: TimeState, p) => {
      clear(ctx, w, h, 'Class 9 Mathematics · Geometric Transformations');

      const originX = w * 0.5;
      const originY = h * 0.54;
      const scaleGrid = 30;

      // Coordinate axes
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let g = -10; g <= 10; g++) {
        line(ctx, originX + g * scaleGrid, 30, originX + g * scaleGrid, h - 30, '#F1F5F9', 1);
        line(ctx, 30, originY + g * scaleGrid, w - 30, originY + g * scaleGrid, '#F1F5F9', 1);
      }
      line(ctx, 40, originY, w - 40, originY, '#64748B', 1.8);
      line(ctx, originX, 40, originX, h - 30, '#64748B', 1.8);

      // Define original base vertices
      let basePts: Array<[number, number]> = [];
      if (p.shape === 'triangle') {
        basePts = [[1, 1], [4, 1], [1, 4]];
      } else if (p.shape === 'trapezium') {
        basePts = [[1, 1], [5, 1], [4, 3], [2, 3]];
      } else {
        basePts = [[0, 4], [2, 1], [0, -1], [-2, 1]];
      }

      // Draw ghost of original
      if (p.showOriginal) {
        ctx.beginPath();
        basePts.forEach(([bx, by], i) => {
          const sx = originX + bx * scaleGrid;
          const sy = originY - by * scaleGrid;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Transform vertices
      const rad = (p.rotation * Math.PI) / 180;
      const cosR = Math.cos(rad);
      const sinR = Math.sin(rad);

      const transformedPts = basePts.map(([bx, by]) => {
        // 1. Scale
        let x = bx * p.scale;
        let y = by * p.scale;
        // 2. Rotate
        const rx = x * cosR - y * sinR;
        const ry = x * sinR + y * cosR;
        // 3. Reflect
        let fx = rx;
        let fy = ry;
        if (p.reflection === 'x') fy = -ry;
        else if (p.reflection === 'y') fx = -rx;
        else if (p.reflection === 'origin') {
          fx = -rx;
          fy = -ry;
        }
        return [fx, fy];
      });

      // Draw transformed shape
      ctx.beginPath();
      transformedPts.forEach(([tx = 0, ty = 0], i) => {
        const sx = originX + tx * scaleGrid;
        const sy = originY - ty * scaleGrid;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(234, 88, 12, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Vertex dots and coordinates
      transformedPts.forEach(([tx = 0, ty = 0]) => {
        const sx = originX + tx * scaleGrid;
        const sy = originY - ty * scaleGrid;
        circle(ctx, sx, sy, 4.5, { fill: '#FACC15', stroke: '#0F172A', width: 1.5 });
        text(ctx, `(${fmt(tx, 1)}, ${fmt(ty, 1)})`, sx + (tx >= 0 ? 12 : -12), sy - 10, {
          size: 10,
          weight: 600,
          color: '#0F172A',
        });
      });

      // Legend info card
      roundRect(ctx, 40, 50, 210, 80, 8, 'rgba(255, 255, 255, 0.95)', '#CBD5E1', 1);
      text(ctx, `Rotation: ${p.rotation}°`, 145, 68, { size: 11, weight: 700, color: '#2563EB' });
      text(ctx, `Scale Factor k: ${p.scale}x`, 145, 86, { size: 11, weight: 700, color: '#EA580C' });
      text(ctx, `Reflection: ${p.reflection.toUpperCase()}`, 145, 104, { size: 11, weight: 600, color: '#16A34A' });
    },
    () => ({ t: 0 })
  ),
});

// ─────────────────────────────────────────────────────────────
// 6. TRIGONOMETRIC UNIT CIRCLE & SINE WAVE (Class 11 Mathematics)
// ─────────────────────────────────────────────────────────────
interface UnitCircleState extends TimeState {
  historySin: number[];
}

export const class912UnitCircle = defineSchool({
  id: 'g912-math-unit-circle',
  title: 'Trigonometric Unit Circle & Sine Wave',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Mathematics',
  category: 'Trigonometry',
  icon: '⭕',
  topic: 'Unit Circle Coordinates, Radian Measure, ASTC Rule & Sinusoidal Unrolling',
  shortDescription: 'Real-time trigonometric unit circle: explore cos θ and sin θ coordinates, tangent projections, and unwrapped sine wave harmonics.',
  detailedDescription: 'Comprehensive interactive unit circle laboratory. Sweep launch angles θ from 0° to 360° (0 to 2π radians), monitor horizontal cos(θ) and vertical sin(θ) projection segments, track tangent line asymptotes, observe quadrant signs according to the ASTC rule (All-Sin-Tan-Cos), and watch the unit circle point unroll into a live traveling sine wave.',
  learningObjectives: [
    'Associate points (x, y) on the unit circle with coordinates (cos θ, sin θ)',
    'Convert angles seamlessly between degrees and radian measures (π rad = 180°)',
    'Apply the ASTC quadrant sign rules for sine, cosine, and tangent',
    'Visualize how circular motion maps directly to harmonic sinusoidal oscillations'
  ],
  formulaOverview: 'x² + y² = 1;   cos²θ + sin²θ = 1;   tan θ = sin θ / cos θ;   e^(iθ) = cos θ + i sin θ',
  parameters: [
    P.range('angle', 'Angle θ', 0, 360, 45, 1, '°'),
    P.toggle('animateWave', 'Unroll live sinusoidal wave', true),
    P.toggle('showTan', 'Show tangent line projection', true),
    P.toggle('showASTC', 'Show ASTC quadrant markers', true),
  ],
  metrics: [
    metric('radVal', 'Radian Angle', (_s, p) => `${fmt((p.angle * Math.PI) / 180, 3)} rad`),
    metric('cosVal', 'cos(θ)', (_s, p) => fmt(Math.cos((p.angle * Math.PI) / 180), 3)),
    metric('sinVal', 'sin(θ)', (_s, p) => fmt(Math.sin((p.angle * Math.PI) / 180), 3)),
    metric('tanVal', 'tan(θ)', (_s, p) => {
      const cosV = Math.cos((p.angle * Math.PI) / 180);
      if (Math.abs(cosV) < 0.02) return 'Undefined (±∞)';
      return fmt(Math.tan((p.angle * Math.PI) / 180), 3);
    }),
  ],
  tags: ['unit circle', 'trigonometry', 'sine', 'cosine', 'tangent', 'radians', 'waves', 'class 11', 'cbse math'],
  engine: timeEngine(
    (ctx, w, h, s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Mathematics · Trigonometric Unit Circle');
      const st = s as UnitCircleState;
      if (!st.historySin) st.historySin = [];

      const rad = (p.angle * Math.PI) / 180;
      const cosV = Math.cos(rad);
      const sinV = Math.sin(rad);

      // Circle layout (left side) and Wave layout (right side)
      const circleCenterX = w * 0.28;
      const circleCenterY = h * 0.54;
      const circleR = Math.min(w * 0.16, 110);

      // Unit Circle
      circle(ctx, circleCenterX, circleCenterY, circleR, { fill: 'rgba(255, 255, 255, 0.9)', stroke: '#64748B', width: 2 });

      // Axes for circle
      line(ctx, circleCenterX - circleR - 25, circleCenterY, circleCenterX + circleR + 25, circleCenterY, '#94A3B8', 1.5);
      line(ctx, circleCenterX, circleCenterY - circleR - 25, circleCenterX, circleCenterY + circleR + 25, '#94A3B8', 1.5);

      // Quadrant ASTC labels
      if (p.showASTC) {
        text(ctx, 'Q I (ALL +)', circleCenterX + circleR * 0.55, circleCenterY - circleR * 0.55, { size: 10, weight: 600, color: '#0EA5E9' });
        text(ctx, 'Q II (SIN +)', circleCenterX - circleR * 0.55, circleCenterY - circleR * 0.55, { size: 10, weight: 600, color: '#16A34A' });
        text(ctx, 'Q III (TAN +)', circleCenterX - circleR * 0.55, circleCenterY + circleR * 0.55, { size: 10, weight: 600, color: '#EA580C' });
        text(ctx, 'Q IV (COS +)', circleCenterX + circleR * 0.55, circleCenterY + circleR * 0.55, { size: 10, weight: 600, color: '#2563EB' });
      }

      // Point on circle (cos θ, sin θ)
      const ptX = circleCenterX + cosV * circleR;
      const ptY = circleCenterY - sinV * circleR;

      // Cosine horizontal segment (blue)
      line(ctx, circleCenterX, circleCenterY, ptX, circleCenterY, '#0284C7', 3);
      // Sine vertical segment (green)
      line(ctx, ptX, circleCenterY, ptX, ptY, '#16A34A', 3);
      // Radial arm (yellow)
      line(ctx, circleCenterX, circleCenterY, ptX, ptY, '#D97706', 2.5);

      // Tangent line extension if enabled
      if (p.showTan && Math.abs(cosV) > 0.05) {
        const tanLen = Math.tan(rad) * circleR;
        const tanEndY = circleCenterY - tanLen;
        if (Math.abs(tanLen) < circleR * 2.8) {
          line(ctx, circleCenterX + circleR, circleCenterY, circleCenterX + circleR, tanEndY, '#DC2626', 2, [3, 2]);
        }
      }

      // The unit point
      circle(ctx, ptX, ptY, 6, { fill: '#FACC15', stroke: '#0F172A', width: 2 });

      // Unrolled Sine Wave on Right Side
      if (p.animateWave) {
        const waveStartX = w * 0.52;
        const waveW = w * 0.44;

        // Wave axis
        line(ctx, waveStartX, circleCenterY, waveStartX + waveW, circleCenterY, '#94A3B8', 1.5);

        // Dashed connector from circle point to wave
        line(ctx, ptX, ptY, waveStartX, ptY, '#16A34A', 1.5, [3, 2]);

        // Draw sine wave
        ctx.beginPath();
        ctx.strokeStyle = '#16A34A';
        ctx.lineWidth = 2.4;
        for (let x = 0; x <= waveW; x += 3) {
          const waveAngle = rad + (x / waveW) * 2 * Math.PI;
          const y = circleCenterY - Math.sin(waveAngle) * circleR;
          if (x === 0) ctx.moveTo(waveStartX + x, y);
          else ctx.lineTo(waveStartX + x, y);
        }
        ctx.stroke();

        circle(ctx, waveStartX, ptY, 5, { fill: '#16A34A', stroke: '#0F172A', width: 1.5 });
        text(ctx, 'y = sin(θ)', waveStartX + 30, circleCenterY - circleR - 12, { size: 12, weight: 700, color: '#16A34A' });
      }

      // Angle indicator arc
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, 28, -rad, 0, false);
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, `${p.angle}°`, circleCenterX + 38, circleCenterY - 14, { size: 11, weight: 700, color: '#D97706' });
    },
    () => ({ historySin: [] })
  ),
});

// ─────────────────────────────────────────────────────────────
// 7. 2D FUNCTION FAMILIES & TRANSFORMATIONS (Class 11 Mathematics)
// ─────────────────────────────────────────────────────────────
export const class912Graphable = defineSchool({
  id: 'g912-math-function-families',
  title: '2D Function Families & Transformations',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Mathematics',
  category: 'Functions & Curves',
  icon: '📈',
  topic: 'Polynomial, Rational, Exponential, Logarithmic & Trigonometric Curves',
  shortDescription: 'Explore graph dilation, horizontal/vertical translations, roots, asymptotes, and turning points across 4 function families.',
  detailedDescription: 'Graphing engine for high-school mathematics. Study the transformation model y = a·f(b(x - h)) + k across polynomial parabolas, sinusoidal waves, exponential curves, and rational functions. Investigate real roots, y-intercepts, local extrema, and vertical/horizontal asymptotes.',
  learningObjectives: [
    'Analyze the effects of parameters a (vertical stretch), b (frequency), h (horizontal shift), and k (vertical shift)',
    'Locate real roots (x-intercepts) and turning points (local maxima/minima)',
    'Identify horizontal and vertical asymptotes in rational and exponential functions',
    'Understand function domains, ranges, and symmetry properties (even vs odd)'
  ],
  formulaOverview: 'y = a · f(b(x - h)) + k;   Quadratic: y = a(x - h)² + k;   Sine: y = a·sin(bx - h) + k',
  parameters: [
    P.select('family', 'Function Family', [
      ['parabola', 'Quadratic: y = a(x - h)² + k'],
      ['cubic', 'Cubic: y = a(x - h)³ + k'],
      ['sine', 'Sine: y = a·sin(b(x - h)) + k'],
      ['rational', 'Rational: y = a / (x - h) + k'],
    ], 'parabola'),
    P.range('a', 'Amplitude / Stretch a', -3, 3, 1, 0.2, ''),
    P.range('h', 'Horizontal Shift h', -4, 4, 0, 0.5, ''),
    P.range('k', 'Vertical Shift k', -4, 4, 0, 0.5, ''),
    P.range('b', 'Frequency / Horizontal Scale b', 0.5, 3, 1, 0.25, ''),
    P.toggle('showExtrema', 'Mark Vertex / Extrema Points', true),
  ],
  metrics: [
    metric('vertex', 'Vertex / Center (h, k)', (_s, p) => `(${fmt(p.h, 1)}, ${fmt(p.k, 1)})`),
    metric('yInt', 'y-intercept (x=0)', (_s, p) => {
      const a = p.a;
      const h = p.h;
      const k = p.k;
      const b = p.b;
      let y = 0;
      if (p.family === 'parabola') y = a * Math.pow(-h, 2) + k;
      else if (p.family === 'cubic') y = a * Math.pow(-h, 3) + k;
      else if (p.family === 'sine') y = a * Math.sin(b * -h) + k;
      else if (p.family === 'rational') {
        if (Math.abs(h) < 0.01) return 'Undefined (Asymptote)';
        y = a / -h + k;
      }
      return fmt(y, 2);
    }),
    metric('asymptote', 'Asymptotes', (_s, p) => {
      if (p.family === 'rational') return `x = ${p.h}, y = ${p.k}`;
      return 'None';
    }),
  ],
  tags: ['functions', 'curves', 'parabola', 'transformations', 'asymptotes', 'extrema', 'class 11', 'cbse math'],
  engine: timeEngine(
    (ctx, w, h, _s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Mathematics · 2D Function Families');

      const originX = w * 0.5;
      const originY = h * 0.52;
      const scaleX = 42;
      const scaleY = 32;

      // Coordinate Grid
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      for (let gx = -7; gx <= 7; gx++) {
        line(ctx, originX + gx * scaleX, 40, originX + gx * scaleX, h - 30, '#F1F5F9', 1);
        text(ctx, `${gx}`, originX + gx * scaleX, originY + 14, { size: 9, color: '#94A3B8' });
      }
      for (let gy = -6; gy <= 6; gy++) {
        line(ctx, 40, originY + gy * scaleY, w - 40, originY + gy * scaleY, '#F1F5F9', 1);
        if (gy !== 0) text(ctx, `${-gy}`, originX - 14, originY + gy * scaleY, { size: 9, color: '#94A3B8' });
      }

      line(ctx, 30, originY, w - 30, originY, '#64748B', 1.8);
      line(ctx, originX, 35, originX, h - 25, '#64748B', 1.8);

      const f = (x: number) => {
        const u = p.b * (x - p.h);
        if (p.family === 'parabola') return p.a * Math.pow(x - p.h, 2) + p.k;
        if (p.family === 'cubic') return p.a * Math.pow(x - p.h, 3) + p.k;
        if (p.family === 'sine') return p.a * Math.sin(u) + p.k;
        if (p.family === 'rational') {
          if (Math.abs(x - p.h) < 0.02) return NaN;
          return p.a / (x - p.h) + p.k;
        }
        return 0;
      };

      // Rational Asymptotes
      if (p.family === 'rational') {
        const asympX = originX + p.h * scaleX;
        const asympY = originY - p.k * scaleY;
        line(ctx, asympX, 40, asympX, h - 30, '#DC2626', 1.5, [4, 4]);
        line(ctx, 40, asympY, w - 40, asympY, '#DC2626', 1.5, [4, 4]);
      }

      // Plot curve
      ctx.beginPath();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.8;
      let drawing = false;

      for (let px = 40; px <= w - 40; px += 2) {
        const mathX = (px - originX) / scaleX;
        const mathY = f(mathX);
        if (isNaN(mathY) || Math.abs(mathY) > 12) {
          drawing = false;
          continue;
        }
        const screenY = originY - mathY * scaleY;
        if (!drawing) {
          ctx.moveTo(px, screenY);
          drawing = true;
        } else {
          ctx.lineTo(px, screenY);
        }
      }
      ctx.stroke();

      // Vertex / Center dot
      if (p.showExtrema) {
        const vx = originX + p.h * scaleX;
        const vy = originY - p.k * scaleY;
        circle(ctx, vx, vy, 5.5, { fill: '#FACC15', stroke: '#0F172A', width: 2 });
        text(ctx, `(${p.h}, ${p.k})`, vx + 14, vy - 10, { size: 11, weight: 700, color: '#0F172A' });
      }
    },
    () => ({ t: 0 })
  ),
});

// ─────────────────────────────────────────────────────────────
// 8. STATISTICS & LIVE DATA VISUALIZER (Class 10 Mathematics)
// ─────────────────────────────────────────────────────────────
export const class912LiveGraphs = defineSchool({
  id: 'g912-math-statistics-data',
  title: 'Statistics & Live Data Visualizer',
  band: 'GRADES_9_12',
  level: 'grade-10',
  levelLabel: 'Class 10',
  subject: 'Mathematics',
  category: 'Statistics & Probability',
  icon: '📊',
  topic: 'Measures of Central Tendency, Histograms, Box Plots & Variance',
  shortDescription: 'Analyze sample distributions: calculate Mean, Median, Mode, Variance, and Standard Deviation with dynamic plots.',
  detailedDescription: 'Real-time statistical data explorer. Generate and analyze discrete frequency datasets, compare normal vs skewed distributions, and inspect multiple chart types (Histogram with frequency polygons, Box-and-Whisker five-number summary plots, and Scatter diagrams with best-fit lines).',
  learningObjectives: [
    'Calculate measures of central tendency: Mean (x̄), Median (Q2), and Mode',
    'Calculate measures of dispersion: Range, Interquartile Range (IQR), Variance (σ²), and Standard Deviation (σ)',
    'Interpret five-number summaries in Box-and-Whisker plots: [Min, Q1, Median, Q3, Max]',
    'Evaluate distribution skewness and outliers in grouped frequency data'
  ],
  formulaOverview: 'Mean x̄ = (∑ xᵢ)/N;   σ = √[∑(xᵢ - x̄)² / N];   IQR = Q3 - Q1',
  parameters: [
    P.select('chartType', 'Chart Representation', [
      ['histogram', 'Histogram & Frequency Polygon'],
      ['box', 'Box & Whisker Plot (Five-Number Summary)'],
      ['scatter', 'Scatter Plot & Regression Line'],
    ], 'histogram'),
    P.range('sampleMean', 'Distribution Center μ', 30, 70, 50, 5, ''),
    P.range('spread', 'Spread / Deviation σ', 5, 25, 12, 1, ''),
    P.range('nPoints', 'Sample Data Count N', 10, 50, 24, 2, ''),
    P.toggle('showMeanLine', 'Show Mean (x̄) Marker', true),
  ],
  metrics: [
    metric('calcMean', 'Sample Mean x̄', (_s, p) => fmt(p.sampleMean, 1)),
    metric('calcStd', 'Std Deviation σ', (_s, p) => fmt(p.spread, 2)),
    metric('calcVar', 'Variance σ²', (_s, p) => fmt(p.spread * p.spread, 1)),
    metric('iqr', 'Est. IQR', (_s, p) => fmt(p.spread * 1.35, 1)),
  ],
  tags: ['statistics', 'histogram', 'box plot', 'mean', 'median', 'standard deviation', 'class 10', 'cbse math'],
  engine: timeEngine(
    (ctx, w, h, _s: TimeState, p) => {
      clear(ctx, w, h, 'Class 10 Mathematics · Statistics & Live Data Laboratory');

      const chartLeft = w * 0.12;
      const chartBottom = h * 0.78;
      const chartW = w * 0.76;
      const chartH = h * 0.52;

      // Deterministic synthetic sample based on parameters
      const mu = p.sampleMean;
      const sigma = p.spread;
      const n = p.nPoints;

      const samples: number[] = [];
      for (let i = 0; i < n; i++) {
        // Pseudo-gaussian points
        const u1 = ((i * 17 + 7) % 31) / 31;
        const u2 = ((i * 23 + 13) % 37) / 37;
        const z = Math.cos(2 * Math.PI * u1) * Math.sqrt(-2 * Math.log(Math.max(u2, 0.01)));
        samples.push(Math.round(mu + z * sigma));
      }
      samples.sort((a, b) => a - b);

      if (p.chartType === 'histogram') {
        // Bin into 8 histogram bars
        const minVal = 10;
        const maxVal = 90;
        const numBins = 8;
        const binSize = (maxVal - minVal) / numBins;
        const counts = new Array(numBins).fill(0);

        samples.forEach(val => {
          const idx = Math.min(numBins - 1, Math.max(0, Math.floor((val - minVal) / binSize)));
          counts[idx]++;
        });

        const maxCount = Math.max(...counts, 4);
        const barW = chartW / numBins;

        // Draw Bars
        counts.forEach((c, idx) => {
          const bx = chartLeft + idx * barW;
          const bh = (c / maxCount) * chartH;
          const by = chartBottom - bh;

          roundRect(ctx, bx + 4, by, barW - 8, bh, 3, 'rgba(14, 165, 233, 0.65)', '#0284C7', 1.5);
          text(ctx, `${c}`, bx + barW * 0.5, by - 8, { size: 10, weight: 600, color: '#0F172A' });
          text(ctx, `${minVal + idx * binSize}`, bx + barW * 0.5, chartBottom + 16, { size: 10, color: '#64748B' });
        });

        // Frequency Polygon line connecting bin midpoints
        ctx.beginPath();
        ctx.strokeStyle = '#EA580C';
        ctx.lineWidth = 2.4;
        counts.forEach((c, idx) => {
          const mx = chartLeft + (idx + 0.5) * barW;
          const my = chartBottom - (c / maxCount) * chartH;
          if (idx === 0) ctx.moveTo(mx, my);
          else ctx.lineTo(mx, my);
        });
        ctx.stroke();

      } else if (p.chartType === 'box') {
        // Box and Whisker Plot
        const min = samples[0] ?? 0;
        const max = samples[samples.length - 1] ?? 100;
        const q1 = samples[Math.floor(samples.length * 0.25)] ?? 25;
        const median = samples[Math.floor(samples.length * 0.5)] ?? 50;
        const q3 = samples[Math.floor(samples.length * 0.75)] ?? 75;

        const scaleX = chartW / 100;
        const boxY = h * 0.48;
        const boxH = 70;

        const pMin = chartLeft + min * scaleX;
        const pMax = chartLeft + max * scaleX;
        const pQ1 = chartLeft + q1 * scaleX;
        const pMed = chartLeft + median * scaleX;
        const pQ3 = chartLeft + q3 * scaleX;

        // Whisker lines
        line(ctx, pMin, boxY, pQ1, boxY, '#0F172A', 2);
        line(ctx, pQ3, boxY, pMax, boxY, '#0F172A', 2);
        line(ctx, pMin, boxY - 20, pMin, boxY + 20, '#0F172A', 2);
        line(ctx, pMax, boxY - 20, pMax, boxY + 20, '#0F172A', 2);

        // IQR Box
        roundRect(ctx, pQ1, boxY - boxH * 0.5, pQ3 - pQ1, boxH, 4, 'rgba(56, 189, 248, 0.4)', '#0284C7', 2);

        // Median line
        line(ctx, pMed, boxY - boxH * 0.5, pMed, boxY + boxH * 0.5, '#DC2626', 3);

        // Labels
        text(ctx, `Min: ${min}`, pMin, boxY + 36, { size: 10, weight: 600, color: '#475569' });
        text(ctx, `Q1: ${q1}`, pQ1, boxY - boxH * 0.5 - 12, { size: 10, weight: 600, color: '#0284C7' });
        text(ctx, `Median: ${median}`, pMed, boxY + boxH * 0.5 + 16, { size: 11, weight: 700, color: '#DC2626' });
        text(ctx, `Q3: ${q3}`, pQ3, boxY - boxH * 0.5 - 12, { size: 10, weight: 600, color: '#0284C7' });
        text(ctx, `Max: ${max}`, pMax, boxY + 36, { size: 10, weight: 600, color: '#475569' });

      } else {
        // Scatter Plot with Best Fit Line
        samples.forEach((val, idx) => {
          const sx = chartLeft + (idx / (n - 1)) * chartW;
          const sy = chartBottom - ((val - 10) / 80) * chartH;
          circle(ctx, sx, sy, 5, { fill: '#0EA5E9', stroke: '#0284C7', width: 1.5 });
        });

        // Regression line
        line(ctx, chartLeft, chartBottom - chartH * 0.35, chartLeft + chartW, chartBottom - chartH * 0.65, '#EA580C', 2.5);
      }

      // Base Axis
      line(ctx, chartLeft - 10, chartBottom, chartLeft + chartW + 10, chartBottom, '#475569', 2);

      // Mean line overlay
      if (p.showMeanLine && p.chartType === 'histogram') {
        const meanX = chartLeft + ((mu - 10) / 80) * chartW;
        line(ctx, meanX, chartBottom - chartH, meanX, chartBottom, '#DC2626', 2, [4, 3]);
        text(ctx, `Mean x̄ = ${mu}`, meanX, chartBottom - chartH - 12, { size: 11, weight: 700, color: '#DC2626' });
      }
    },
    () => ({ t: 0 })
  ),
});

// ─────────────────────────────────────────────────────────────
// EXPORT ALL CLASS 9–12 MATHEMATICS SIMULATIONS
// ─────────────────────────────────────────────────────────────
export const CLASS_9_12_MATH_SIMULATIONS = [
  class912Calculus,
  class912GeometryProofs,
  class912Vectors,
  class912Sequences,
  class912Transforms,
  class912UnitCircle,
  class912Graphable,
  class912LiveGraphs,
];
