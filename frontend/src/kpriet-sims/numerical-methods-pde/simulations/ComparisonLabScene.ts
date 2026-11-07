/**
 * Visual Scene for Numerical Methods Comparison Laboratory
 * Benchmarking convergence rate, error reduction, and iteration performance
 */

import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import type { ComparisonLaboratoryResult } from '../core/types';

export class ComparisonLabScene extends BaseNumericalSimulation {
  private benchData: ComparisonLaboratoryResult | null = null;

  public setData(data: ComparisonLaboratoryResult) {
    this.benchData = data;
    this.render();
  }

  public update(_dt: number) {}

  public render() {
    this.drawBackground('Module 7: Numerical Methods Comparison Laboratory & Error Benchmark');
    const { ctx, width, height } = this;
    const margin = { left: 60, right: 30, top: 50, bottom: 40 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    if (!this.benchData || this.benchData.entries.length === 0) return;

    const entries = this.benchData.entries;
    const numEntries = entries.length;

    // Split viewport: Left = Iteration/Steps Bar Chart, Right = Error/Residual (Logarithmic) Bar Chart
    const splitW = (plotW - 40) / 2;
    const leftStartX = margin.left;
    const rightStartX = margin.left + splitW + 40;

    // ── LEFT: Iteration Count Comparison ──
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Computational Effort (Iterations / Subdivisions)', leftStartX, margin.top - 12);

    const maxIters = Math.max(1, ...entries.map((e) => e.iterationOrSteps));
    const barHeight = Math.min(36, Math.floor((plotH - 60) / numEntries));

    const colors = ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'];

    for (let i = 0; i < numEntries; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const barY = margin.top + 15 + i * (barHeight + 14);
      const barLen = Math.max(4, (entry.iterationOrSteps / (maxIters * 1.15)) * (splitW - 120));

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(entry.methodName.split(' ')[0] || '', leftStartX, barY + barHeight / 2 + 4);

      // Bar
      ctx.fillStyle = colors[i % colors.length] || '#38bdf8';
      ctx.fillRect(leftStartX + 100, barY, barLen, barHeight);

      // Value
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`${entry.iterationOrSteps} steps`, leftStartX + 110 + barLen, barY + barHeight / 2 + 4);
    }

    // ── RIGHT: Accuracy / Residual Quality (Log Scale) ──
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Accuracy & Residual Error (‖ε‖ / Residual)', rightStartX, margin.top - 12);

    for (let i = 0; i < numEntries; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const barY = margin.top + 15 + i * (barHeight + 14);

      // Log10 of error or default
      const err = Math.max(1e-15, entry.errorOrResidual);
      const logVal = -Math.log10(err); // Higher is better (e.g. 10^-5 -> 5)
      const maxLog = 12;
      const barLen = Math.max(4, (Math.min(maxLog, Math.max(1, logVal)) / maxLog) * (splitW - 130));

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(entry.methodName.split(' ')[0] || '', rightStartX, barY + barHeight / 2 + 4);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(rightStartX + 100, barY, barLen, barHeight);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(err.toExponential(2), rightStartX + 108 + barLen, barY + barHeight / 2 + 4);
    }

    // Bottom Problem Card
    const cardY = height - 55;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.fillRect(margin.left, cardY, plotW, 36);
    ctx.strokeRect(margin.left, cardY, plotW, 36);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Benchmark Case: ${this.benchData.problemDescription}`, margin.left + 16, cardY + 22);
  }
}
