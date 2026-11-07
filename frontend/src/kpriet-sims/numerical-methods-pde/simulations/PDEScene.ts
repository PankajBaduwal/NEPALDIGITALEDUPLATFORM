/**
 * Visual Scene for Partial Differential Equations
 * 1D Heat Conduction (FTCS explicit with r <= 0.5 CFL stability check),
 * 1D Wave Equation (Hyperbolic finite difference),
 * 2D Steady-State Laplace Equation (Elliptic grid)
 */

import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import type { PDEResult, PDE1DHeatResult, PDE1DWaveResult, PDE2DLaplaceResult } from '../core/types';

export class PDEScene extends BaseNumericalSimulation {
  private result: PDEResult | null = null;
  private currentTimeStep = 0;
  private playbackSpeed = 15; // time steps per sec

  public setData(result: PDEResult) {
    this.result = result;
    this.currentTimeStep = 0;
    this.render();
  }

  public setTimeStep(t: number) {
    if (!this.result) return;
    if (this.result.scheme === '1d-heat-ftcs' || this.result.scheme === '1d-wave-hyperbolic') {
      this.currentTimeStep = Math.max(0, Math.min(this.result.nt, t));
      this.render();
    }
  }

  public update(dt: number) {
    if (!this.result) return;
    if (this.result.scheme === '1d-heat-ftcs' || this.result.scheme === '1d-wave-hyperbolic') {
      const maxSteps = this.result.nt;
      this.currentTimeStep = (this.currentTimeStep + dt * this.playbackSpeed) % (maxSteps + 1);
    }
  }

  public render() {
    this.drawBackground('Module 6: Partial Differential Equations — Spatiotemporal Finite Difference Grid');
    const { ctx, width, height } = this;
    const margin = { left: 60, right: 30, top: 40, bottom: 40 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    if (!this.result) return;

    if (this.result.scheme === '1d-heat-ftcs') {
      const res = this.result as PDE1DHeatResult;
      const tIdx = Math.min(res.nt, Math.floor(this.currentTimeStep));
      const currentU = res.timeGrid[tIdx] || res.timeGrid[0] || [];

      // Coordinate mapping
      const toCanvasX = (x: number) => margin.left + (x / res.lengthL) * plotW;
      const uMax = 1.2;
      const uMin = -0.2;
      const toCanvasY = (u: number) => margin.top + plotH * 0.7 - ((u - uMin) / (uMax - uMin)) * (plotH * 0.7);

      // ── TOP: 1D Temperature Profile Curve u(x, t) ──
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < res.nx; i++) {
        const cx = toCanvasX(res.xNodes[i] ?? 0);
        const cy = toCanvasY(currentU[i] ?? 0);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Zero axis
      const zeroY = toCanvasY(0);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, zeroY);
      ctx.lineTo(margin.left + plotW, zeroY);
      ctx.stroke();

      // Plot grid node dots
      for (let i = 0; i < res.nx; i++) {
        const cx = toCanvasX(res.xNodes[i] ?? 0);
        const cy = toCanvasY(currentU[i] ?? 0);
        ctx.fillStyle = res.isStable ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── BOTTOM: Physical 1D Thermal Rod Heatmap Bar ──
      const barY = margin.top + plotH * 0.8;
      const barH = 28;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('Physical Metal Rod Temperature Gradient:', margin.left, barY - 8);

      const segmentW = plotW / (res.nx - 1);
      for (let i = 0; i < res.nx - 1; i++) {
        const uVal = Math.max(0, Math.min(1, currentU[i] ?? 0));
        // Map 0 -> Cool Blue (#1e3a8a), 1 -> Hot Red (#ef4444)
        const r = Math.floor(30 + uVal * 209);
        const g = Math.floor(58 + (1 - Math.abs(uVal - 0.5) * 2) * 120);
        const b = Math.floor(138 * (1 - uVal));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(margin.left + i * segmentW, barY, segmentW + 1, barH);
      }

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(margin.left, barY, plotW, barH);

      // Stability Banner / Info Card
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = res.isStable ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.fillRect(margin.left + 10, margin.top + 10, 290, 75);
      ctx.strokeRect(margin.left + 10, margin.top + 10, 290, 75);

      ctx.fillStyle = res.isStable ? '#34d399' : '#f87171';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(
        res.isStable ? '✓ FTCS Diffusion Scheme: STABLE' : '⚠️ FTCS Diffusion Scheme: UNSTABLE',
        margin.left + 20,
        margin.top + 30
      );

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(
        `Mesh Ratio r = α·Δt/(Δx)² = ${res.rParameter.toFixed(4)} (Limit: ≤ 0.50)`,
        margin.left + 20,
        margin.top + 50
      );
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(
        `Time Step: t = ${(tIdx * res.dt).toFixed(3)} s (${tIdx} / ${res.nt} steps)`,
        margin.left + 20,
        margin.top + 70
      );
    } else if (this.result.scheme === '1d-wave-hyperbolic') {
      const res = this.result as PDE1DWaveResult;
      const tIdx = Math.min(res.nt, Math.floor(this.currentTimeStep));
      const currentU = res.timeGrid[tIdx] || res.timeGrid[0] || [];

      const toCanvasX = (x: number) => margin.left + (x / res.lengthL) * plotW;
      const toCanvasY = (u: number) => margin.top + plotH * 0.5 - u * (plotH * 0.4);

      // Vibrating String Curve
      ctx.strokeStyle = '#a855f7'; // Purple wave
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < res.nx; i++) {
        const cx = toCanvasX(res.xNodes[i] ?? 0);
        const cy = toCanvasY(currentU[i] ?? 0);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Fixed string boundaries
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(toCanvasX(0), toCanvasY(0), 6, 0, Math.PI * 2);
      ctx.arc(toCanvasX(res.lengthL), toCanvasY(0), 6, 0, Math.PI * 2);
      ctx.fill();

      // Wave info
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`Wave Speed c = ${res.waveSpeedC} m/s | Courant Number C = ${res.courantNumber.toFixed(3)} (CFL ≤ 1)`, margin.left + 15, margin.top + 25);
    } else if (this.result.scheme === '2d-laplace-elliptic') {
      const res = this.result as PDE2DLaplaceResult;
      const grid = res.gridU;
      const ny = res.ny;
      const nx = res.nx;

      const cellW = plotW / nx;
      const cellH = plotH / ny;

      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const val = Math.max(0, Math.min(100, grid[j]?.[i] ?? 0)) / 100;
          const r = Math.floor(val * 240);
          const b = Math.floor((1 - val) * 240);
          ctx.fillStyle = `rgb(${r}, 60, ${b})`;
          ctx.fillRect(margin.left + i * cellW, margin.top + j * cellH, cellW - 1, cellH - 1);
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(
        `2D Steady-State Thermal Potential (Liebmann Iteration: ${res.iterationsCount} cycles, Residual = ${res.maxResidual.toExponential(3)})`,
        margin.left + 15,
        margin.top + 25
      );
    }
  }
}
