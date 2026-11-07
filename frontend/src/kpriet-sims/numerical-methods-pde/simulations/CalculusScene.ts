/**
 * Visual Scene for Numerical Differentiation and Integration
 * Forward, Backward, Central Differences, Trapezoidal Rule, Simpson's 1/3 & 3/8 Rules
 */

import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import type { IntegrationResult, DifferentiationResult } from '../core/types';
import { NumericalCalculator } from '../core/NumericalCalculator';

export class CalculusScene extends BaseNumericalSimulation {
  private mode: 'integration' | 'differentiation' = 'integration';
  private expr = '1 / (1 + x^2)';
  private lowerA = 0;
  private upperB = 1;
  private intResult: IntegrationResult | null = null;
  private diffResult: DifferentiationResult | null = null;

  public setIntegrationData(expr: string, lowerA: number, upperB: number, result: IntegrationResult) {
    this.mode = 'integration';
    this.expr = expr;
    this.lowerA = lowerA;
    this.upperB = upperB;
    this.intResult = result;
    this.render();
  }

  public setDifferentiationData(expr: string, result: DifferentiationResult) {
    this.mode = 'differentiation';
    this.expr = expr;
    this.diffResult = result;
    this.render();
  }

  public update(_dt: number) {}

  public render() {
    this.drawBackground(
      this.mode === 'integration'
        ? 'Module 4: Numerical Quadrature (Shaded Integration Panels & Trapezoids)'
        : 'Module 4: Numerical Differentiation (Difference Slopes & Tangent Vectors)'
    );

    const { ctx, width, height } = this;
    const margin = { left: 60, right: 30, top: 40, bottom: 40 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    if (this.mode === 'integration' && this.intResult) {
      const xMin = Math.min(this.lowerA, 0) - 0.2;
      const xMax = Math.max(this.upperB, 1) + 0.2;
      const yMin = 0;
      let maxY = 1.0;
      for (const st of this.intResult.steps) {
        maxY = Math.max(maxY, st.fx * 1.25);
      }

      const toCanvasX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW;
      const toCanvasY = (y: number) => margin.top + plotH - ((y - yMin) / (maxY - yMin)) * plotH;
      const groundY = toCanvasY(0);

      // Draw Shaded Integration Panels (Trapezoids / Simpson Arches)
      const steps = this.intResult.steps;
      for (let i = 0; i < steps.length - 1; i++) {
        const x1 = steps[i]!.x;
        const x2 = steps[i + 1]!.x;
        const y1 = steps[i]!.fx;
        const y2 = steps[i + 1]!.fx;

        const cx1 = toCanvasX(x1);
        const cx2 = toCanvasX(x2);
        const cy1 = toCanvasY(y1);
        const cy2 = toCanvasY(y2);

        // Fill panel with translucent teal/indigo gradient
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(16, 185, 129, 0.25)';
        ctx.beginPath();
        ctx.moveTo(cx1, groundY);
        ctx.lineTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.lineTo(cx2, groundY);
        ctx.closePath();
        ctx.fill();

        // Panel outline
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ordinate line
        ctx.strokeStyle = '#64748b';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(cx1, groundY);
        ctx.lineTo(cx1, cy1);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw continuous function curve y = f(x)
      ctx.strokeStyle = '#f59e0b'; // Amber curve
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const numPoints = 120;
      for (let i = 0; i <= numPoints; i++) {
        const x = xMin + (i / numPoints) * (xMax - xMin);
        const y = NumericalCalculator.evalF(this.expr, x);
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Axes
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin.left, groundY);
      ctx.lineTo(margin.left + plotW, groundY);
      ctx.stroke();

      // Info badge
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.fillRect(margin.left + 10, margin.top + 10, 260, 60);
      ctx.strokeRect(margin.left + 10, margin.top + 10, 260, 60);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`Integral I ≈ ${this.intResult.approxIntegral.toFixed(6)}`, margin.left + 20, margin.top + 30);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(
        `Method: ${this.intResult.method.toUpperCase()} (n = ${this.intResult.subintervalsN}, h = ${this.intResult.stepH.toFixed(4)})`,
        margin.left + 20,
        margin.top + 50
      );
    } else if (this.mode === 'differentiation' && this.diffResult) {
      // Differentiation slope visualizer
      const x0 = this.diffResult.targetX;
      const h = this.diffResult.stepH;
      const xMin = x0 - 4 * h;
      const xMax = x0 + 4 * h;
      const y0 = NumericalCalculator.evalF(this.expr, x0);
      const yMin = y0 - 3;
      const maxY = y0 + 3;

      const toCanvasX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW;
      const toCanvasY = (y: number) => margin.top + plotH - ((y - yMin) / (maxY - yMin)) * plotH;

      // Curve
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = xMin + (i / 100) * (xMax - xMin);
        const y = NumericalCalculator.evalF(this.expr, x);
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Tangent slope line
      const slope = this.diffResult.approxValue;
      const lineLen = 2.5 * h;
      const cx0 = toCanvasX(x0);
      const cy0 = toCanvasY(y0);
      const cx1 = toCanvasX(x0 - lineLen);
      const cy1 = toCanvasY(y0 - slope * lineLen);
      const cx2 = toCanvasX(x0 + lineLen);
      const cy2 = toCanvasY(y0 + slope * lineLen);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.lineTo(cx2, cy2);
      ctx.stroke();

      // Point marker
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx0, cy0, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Target (x = ${x0.toFixed(2)}, f(x) = ${y0.toFixed(3)})`, cx0 + 10, cy0 - 10);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`Computed Slope f'(x) ≈ ${slope.toFixed(5)}`, cx0 + 10, cy0 + 15);
    }
  }
}
