/**
 * Visual Scene for Simultaneous Linear Equations
 * Gauss Elimination, Gauss-Jordan, LU, Jacobi, and Gauss-Seidel
 */

import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import type { LinearSolverResult } from '../core/types';

export class LinearSystemsScene extends BaseNumericalSimulation {
  private result: LinearSolverResult | null = null;
  private matrixA: number[][] = [
    [10, 1, 2],
    [2, 10, 1],
    [1, 2, 10],
  ];
  private vectorB: number[] = [13, 13, 13];
  private activeStepIndex = 0;

  public setData(matrixA: number[][], vectorB: number[], result: LinearSolverResult) {
    this.matrixA = matrixA;
    this.vectorB = vectorB;
    this.result = result;
    this.activeStepIndex = 0;
    this.render();
  }

  public setStep(step: number) {
    this.activeStepIndex = step;
    this.render();
  }

  public update(_dt: number) {}

  public render() {
    this.drawBackground('Module 2: Simultaneous Linear Equations — Matrix State & Residual Analysis');
    const { ctx, width, height } = this;

    const n = this.vectorB.length;
    const splitX = Math.floor(width * 0.52);

    // ── LEFT PANE: Matrix [A | b] Visualization ──
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Augmented Matrix [ A | b ]', 24, 52);

    const cellSize = Math.min(60, Math.floor((splitX - 80) / (n + 1)));
    const startX = 30;
    const startY = 70;

    // Determine current display matrix (from step if available)
    const step = this.result?.steps?.[this.activeStepIndex];
    const currentA = step ? step.matrixA : this.matrixA;
    const currentB = step ? step.vectorB : this.vectorB;

    // Draw Matrix Grid
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = currentA[i]?.[j] ?? 0;
        const x = startX + j * cellSize;
        const y = startY + i * cellSize;

        // Diagonal cells get subtle highlight
        ctx.fillStyle = i === j ? '#1e293b' : '#0f172a';
        ctx.fillRect(x, y, cellSize - 4, cellSize - 4);
        ctx.strokeStyle = i === j ? '#38bdf8' : '#334155';
        ctx.strokeRect(x, y, cellSize - 4, cellSize - 4);

        ctx.fillStyle = i === j ? '#38bdf8' : '#e2e8f0';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val.toFixed(2), x + (cellSize - 4) / 2, y + (cellSize - 4) / 2);
      }

      // Vertical separator bar between A and b
      const sepX = startX + n * cellSize;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sepX - 2, startY);
      ctx.lineTo(sepX - 2, startY + n * cellSize - 4);
      ctx.stroke();

      // Right-hand side vector b
      const bVal = currentB[i] ?? 0;
      const bx = sepX + 4;
      const by = startY + i * cellSize;

      ctx.fillStyle = '#1e1b4b'; // subtle indigo
      ctx.fillRect(bx, by, cellSize - 4, cellSize - 4);
      ctx.strokeStyle = '#818cf8';
      ctx.strokeRect(bx, by, cellSize - 4, cellSize - 4);

      ctx.fillStyle = '#a5b4fc';
      ctx.fillText(bVal.toFixed(2), bx + (cellSize - 4) / 2, by + (cellSize - 4) / 2);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Status description below matrix
    if (this.result) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      const stepDesc =
        this.result.steps[this.activeStepIndex]?.description ||
        (this.result.converged ? 'Solved successfully' : 'Matrix system');
      ctx.fillText(`Status: ${stepDesc}`, startX, startY + n * cellSize + 24);

      ctx.fillText(
        `Strict Diagonal Dominance: ${this.result.isDiagonallyDominant ? 'YES (Guaranteed Convergence)' : 'NO'}`,
        startX,
        startY + n * cellSize + 44
      );
    }

    // ── RIGHT PANE: Solution Vector & Residual Bar Chart r = b - Ax ──
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Computed Solution Vector x', splitX + 20, 52);

    if (this.result && this.result.solution.length > 0) {
      const sol = this.result.solution;
      for (let i = 0; i < sol.length; i++) {
        const itemY = 75 + i * 26;
        const val = sol[i] ?? 0;
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillText(`x_${i + 1} = ${val.toFixed(6)}`, splitX + 24, itemY);
      }

      // Residual Vector Bar Chart r = b - Ax
      const chartStartY = 85 + sol.length * 26;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('Residual Vector: r = b - Ax (Tolerance Quality)', splitX + 20, chartStartY);

      const maxRes = Math.max(1e-6, ...this.result.residualVector.map((v) => Math.abs(v)));
      const barMaxW = width - splitX - 100;

      for (let i = 0; i < this.result.residualVector.length; i++) {
        const rVal = this.result.residualVector[i] ?? 0;
        const barW = Math.max(2, (Math.abs(rVal) / (maxRes * 1.2)) * barMaxW);
        const barY = chartStartY + 15 + i * 22;

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText(`r_${i + 1}:`, splitX + 24, barY + 11);

        ctx.fillStyle = Math.abs(rVal) < 1e-3 ? '#10b981' : '#f59e0b';
        ctx.fillRect(splitX + 60, barY, barW, 12);

        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(rVal.toExponential(3), splitX + 65 + barW, barY + 10);
      }

      // Residual Norm Summary
      const summaryY = chartStartY + 25 + n * 22;
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Residual ‖r‖₂ = ${this.result.residualNorm2.toExponential(4)}`, splitX + 24, summaryY);
      ctx.fillText(`Infinity Norm ‖r‖_∞ = ${this.result.residualNormInf.toExponential(4)}`, splitX + 24, summaryY + 18);
    }
  }
}
