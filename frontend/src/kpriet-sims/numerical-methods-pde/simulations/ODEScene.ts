/**
 * Visual Scene for Ordinary Differential Equations
 * Euler's Method, Modified Euler (Heun), and Runge-Kutta 4th Order (RK4)
 */

import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import type { ODEResult } from '../core/types';

export class ODEScene extends BaseNumericalSimulation {
  private result: ODEResult | null = null;
  private exactFormula?: string;

  public setData(result: ODEResult, exactFormula?: string) {
    this.result = result;
    this.exactFormula = exactFormula;
    this.render();
  }

  public update(_dt: number) {}

  public render() {
    this.drawBackground('Module 5: Initial Value Problem ODE Solution Trajectory & Truncation Error');
    const { ctx, width, height } = this;
    const margin = { left: 60, right: 30, top: 40, bottom: 40 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    if (!this.result || this.result.steps.length === 0) return;

    const steps = this.result.steps;
    const xMin = this.result.x0;
    const xMax = this.result.xEnd;

    let yMin = Math.min(...steps.map((s) => s.yApprox));
    let yMax = Math.max(...steps.map((s) => s.yApprox));
    const firstStep = steps[0];
    if (firstStep && firstStep.yExact !== undefined) {
      yMin = Math.min(yMin, ...steps.map((s) => s.yExact || 0));
      yMax = Math.max(yMax, ...steps.map((s) => s.yExact || 0));
    }
    const padY = Math.max(0.5, (yMax - yMin) * 0.15);
    const plotMinY = yMin - padY;
    const plotMaxY = yMax + padY;

    const toCanvasX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toCanvasY = (y: number) => margin.top + plotH - ((y - plotMinY) / (plotMaxY - plotMinY)) * plotH;

    // Grid box
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, plotW, plotH);

    // Plot Analytical Exact Curve (if available) in Cyan dashed line
    if (firstStep && firstStep.yExact !== undefined) {
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < steps.length; i++) {
        const st = steps[i];
        if (!st) continue;
        const cx = toCanvasX(st.x);
        const cy = toCanvasY(st.yExact ?? 0);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Plot Numerical Method Solution Curve
    const methodColor =
      this.result.method === 'rk4' ? '#10b981' : this.result.method === 'modified-euler' ? '#a855f7' : '#f59e0b';

    ctx.strokeStyle = methodColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      if (!st) continue;
      const cx = toCanvasX(st.x);
      const cy = toCanvasY(st.yApprox);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Plot Step Node Dots
    for (const st of steps) {
      const cx = toCanvasX(st.x);
      const cy = toCanvasY(st.yApprox);

      ctx.fillStyle = methodColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Error line to exact solution
      if (st.yExact !== undefined) {
        const exactCy = toCanvasY(st.yExact);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, exactCy);
        ctx.stroke();
      }
    }

    // Legend
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.fillRect(margin.left + 15, margin.top + 15, 230, 75);
    ctx.strokeRect(margin.left + 15, margin.top + 15, 230, 75);

    ctx.fillStyle = methodColor;
    ctx.fillRect(margin.left + 25, margin.top + 28, 14, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`${this.result.method.toUpperCase()} Trajectory`, margin.left + 46, margin.top + 32);

    if (this.exactFormula) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(margin.left + 25, margin.top + 48, 14, 3);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Exact: ${this.exactFormula}`, margin.left + 46, margin.top + 52);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(
      `Step h = ${this.result.stepH}, Final y(${xMax}) = ${this.result.finalY.toFixed(4)}`,
      margin.left + 25,
      margin.top + 72
    );
  }
}
