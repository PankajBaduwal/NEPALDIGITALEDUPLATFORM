/**
 * Visual Scene for Root-Finding Methods
 * Bisection, Regula Falsi, Newton-Raphson, and Secant Method
 */

import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import type { RootFindingResult } from '../core/types';
import { NumericalCalculator } from '../core/NumericalCalculator';

export class RootFindingScene extends BaseNumericalSimulation {
  private result: RootFindingResult | null = null;
  private expr = 'x^3 - x - 2';
  private xMin = -1;
  private xMax = 3;
  private yMin = -5;
  private yMax = 15;

  public setData(expr: string, result: RootFindingResult) {
    this.expr = expr;
    this.result = result;

    // Adapt bounds dynamically around root and bracket
    if (result.steps.length > 0) {
      const allX = result.steps.map((s) => s.xCurr);
      const first = result.steps[0];
      if (first && first.a !== undefined) allX.push(first.a);
      if (first && first.b !== undefined) allX.push(first.b);
      const minXVal = Math.min(...allX);
      const maxXVal = Math.max(...allX);
      const span = Math.max(1.5, (maxXVal - minXVal) * 1.5);
      const mid = (minXVal + maxXVal) / 2;
      this.xMin = mid - span;
      this.xMax = mid + span;
    }
    this.render();
  }

  public update(_dt: number) {}

  public render() {
    this.drawBackground('Module 1: Root-Finding Function Geometry & Tangent/Chord Marching');
    const { ctx, width, height } = this;
    const margin = { left: 60, right: 30, top: 40, bottom: 40 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const toCanvasX = (x: number) => margin.left + ((x - this.xMin) / (this.xMax - this.xMin)) * plotW;
    const toCanvasY = (y: number) => margin.top + plotH - ((y - this.yMin) / (this.yMax - this.yMin)) * plotH;

    // Zero Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    const zeroY = toCanvasY(0);
    const zeroX = toCanvasX(0);

    // X-Axis
    if (zeroY >= margin.top && zeroY <= margin.top + plotH) {
      ctx.beginPath();
      ctx.moveTo(margin.left, zeroY);
      ctx.lineTo(margin.left + plotW, zeroY);
      ctx.stroke();
    }
    // Y-Axis
    if (zeroX >= margin.left && zeroX <= margin.left + plotW) {
      ctx.beginPath();
      ctx.moveTo(zeroX, margin.top);
      ctx.lineTo(zeroX, margin.top + plotH);
      ctx.stroke();
    }

    // Plot continuous curve y = f(x)
    ctx.strokeStyle = '#38bdf8'; // Sky blue
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const numPoints = 200;
    for (let i = 0; i <= numPoints; i++) {
      const x = this.xMin + (i / numPoints) * (this.xMax - this.xMin);
      const y = NumericalCalculator.evalF(this.expr, x);
      const cx = toCanvasX(x);
      const cy = toCanvasY(Math.max(this.yMin, Math.min(this.yMax, y)));
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Plot Iteration Steps if available
    if (this.result && this.result.steps.length > 0) {
      const steps = this.result.steps;

      // Draw chords / brackets / tangents
      for (let i = 0; i < Math.min(6, steps.length); i++) {
        const step = steps[i];
        if (!step) continue;
        const stepX = toCanvasX(step.xCurr);
        const stepY = toCanvasY(step.fCurr);

        // Vertical drop line to x-axis
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(stepX, stepY);
        ctx.lineTo(stepX, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Iteration Point Marker
        ctx.fillStyle = i === steps.length - 1 ? '#10b981' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(stepX, stepY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label step
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`x_${step.iteration}`, stepX + 6, stepY - 6);
      }

      // Highlight Final Root
      if (this.result.converged) {
        const rootX = toCanvasX(this.result.root);
        ctx.fillStyle = '#10b981'; // Emerald
        ctx.beginPath();
        ctx.arc(rootX, zeroY, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Root ≈ ${this.result.root.toFixed(5)}`, rootX + 10, zeroY - 12);
      }
    }

    // Legend
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(margin.left + 10, margin.top + 10, 220, 65);
    ctx.strokeRect(margin.left + 10, margin.top + 10, 220, 65);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(margin.left + 20, margin.top + 25, 14, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Function: f(x) = ${this.expr}`, margin.left + 42, margin.top + 29);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(margin.left + 27, margin.top + 45, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(
      this.result?.converged ? `Converged Root (${this.result.iterationsCount} iters)` : 'Root Search Indicator',
      margin.left + 42,
      margin.top + 49
    );
  }
}
