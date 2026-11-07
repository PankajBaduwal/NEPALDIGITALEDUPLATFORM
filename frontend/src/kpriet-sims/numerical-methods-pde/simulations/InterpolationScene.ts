/**
 * Visual Scene for Interpolation & Curve Fitting
 * Newton Forward/Backward, Divided Difference, Lagrange, and Least-Squares Regression
 */

import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import type { DataPoint, InterpolationResult } from '../core/types';
import { NumericalCalculator } from '../core/NumericalCalculator';

export class InterpolationScene extends BaseNumericalSimulation {
  private points: DataPoint[] = [
    { x: 1, y: 1 },
    { x: 2, y: 8 },
    { x: 3, y: 27 },
    { x: 4, y: 64 },
  ];
  private result: InterpolationResult | null = null;
  private targetX = 2.5;

  public setData(points: DataPoint[], targetX: number, result: InterpolationResult) {
    this.points = points;
    this.targetX = targetX;
    this.result = result;
    this.render();
  }

  public update(_dt: number) {}

  public render() {
    this.drawBackground('Module 3: Polynomial Interpolation Curve & Observation Scatter');
    const { ctx, width, height } = this;
    const margin = { left: 60, right: 30, top: 40, bottom: 40 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const xVals = this.points.map((p) => p.x);
    const yVals = this.points.map((p) => p.y);
    const minX = Math.min(...xVals, this.targetX);
    const maxX = Math.max(...xVals, this.targetX);
    const minY = Math.min(...yVals, this.result?.interpolatedY ?? 0);
    const maxY = Math.max(...yVals, this.result?.interpolatedY ?? 0);

    const padX = Math.max(0.5, (maxX - minX) * 0.15);
    const padY = Math.max(1.0, (maxY - minY) * 0.15);
    const plotMinX = minX - padX;
    const plotMaxX = maxX + padX;
    const plotMinY = minY - padY;
    const plotMaxY = maxY + padY;

    const toCanvasX = (x: number) => margin.left + ((x - plotMinX) / (plotMaxX - plotMinX)) * plotW;
    const toCanvasY = (y: number) => margin.top + plotH - ((y - plotMinY) / (plotMaxY - plotMinY)) * plotH;

    // Extrapolation Hazard Zones (Shaded Amber background outside observation min/max)
    const obsMinX = Math.min(...xVals);
    const obsMaxX = Math.max(...xVals);
    const obsCanvasMinX = toCanvasX(obsMinX);
    const obsCanvasMaxX = toCanvasX(obsMaxX);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    // Left extrapolation zone
    if (obsCanvasMinX > margin.left) {
      ctx.fillRect(margin.left, margin.top, obsCanvasMinX - margin.left, plotH);
    }
    // Right extrapolation zone
    if (obsCanvasMaxX < margin.left + plotW) {
      ctx.fillRect(obsCanvasMaxX, margin.top, margin.left + plotW - obsCanvasMaxX, plotH);
    }

    // Grid Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, plotW, plotH);

    // Plot continuous interpolated curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const curveSamples = 150;
    for (let i = 0; i <= curveSamples; i++) {
      const x = plotMinX + (i / curveSamples) * (plotMaxX - plotMinX);
      const evalRes = NumericalCalculator.interpolate(this.result?.method || 'lagrange', this.points, x);
      const cx = toCanvasX(x);
      const cy = toCanvasY(evalRes.interpolatedY);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Plot Original Observation Points
    for (const pt of this.points) {
      const cx = toCanvasX(pt.x);
      const cy = toCanvasY(pt.y);

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`(${pt.x}, ${pt.y})`, cx + 8, cy - 8);
    }

    // Target Evaluation Point
    if (this.result) {
      const targetCx = toCanvasX(this.targetX);
      const targetCy = toCanvasY(this.result.interpolatedY);

      // Droplines to axes
      ctx.strokeStyle = this.result.isExtrapolation ? '#f59e0b' : '#10b981';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(targetCx, margin.top + plotH);
      ctx.lineTo(targetCx, targetCy);
      ctx.lineTo(margin.left, targetCy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Marker
      ctx.fillStyle = this.result.isExtrapolation ? '#f59e0b' : '#10b981';
      ctx.beginPath();
      ctx.arc(targetCx, targetCy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Label
      ctx.fillStyle = this.result.isExtrapolation ? '#fbbf24' : '#34d399';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(
        `P(${this.targetX}) ≈ ${this.result.interpolatedY.toFixed(4)}${this.result.isExtrapolation ? ' [EXTRAPOLATED]' : ''}`,
        targetCx + 10,
        targetCy - 12
      );
    }

    // Warning banner if extrapolation
    if (this.result?.isExtrapolation) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.fillRect(margin.left + 10, margin.top + 10, plotW - 20, 24);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('⚠️ EXTRAPOLATION WARNING: Target point lies outside observation range [x_min, x_max]. Polynomial error can amplify.', margin.left + 16, margin.top + 26);
    }
  }
}
