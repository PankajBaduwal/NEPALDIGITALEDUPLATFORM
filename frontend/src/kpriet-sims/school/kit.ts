/**
 * Shared building blocks for the PiyushDhara school simulations and Virtual Labs.
 * They use the existing simulation definition format (parameters + metrics + canvas engine) and run
 * in the existing SimulationShell, so no second simulation engine exists.
 */
import type { ISimulationDefinition, ISimulationEngine, ISimulationMetric, ISimulationParam, SchoolCategory } from '../types';

export type CatalogueBand = 'GRADES_1_8' | 'GRADES_9_12' | 'ENGINEERING';

export interface SchoolSimulationDefinition extends ISimulationDefinition {
  band: CatalogueBand;
  /** Class / grade key (e.g. "class-3", "grade-10"); null for engineering. */
  level: string | null;
  levelLabel: string | null;
  /** Subject name as shown in the catalogue (e.g. "Mathematics", "Engineering Physics"). */
  subject: string;
  contentType: 'SIMULATION' | 'VIRTUAL_LAB';
  /** Sample content: curriculum alignment still to be verified by a subject expert. */
  alignment: 'SAMPLE_TO_VERIFY';
}

export const C = {
  bg: '#F8FAFC',
  panel: '#FFFFFF',
  line: '#CBD5E1',
  grid: '#E2E8F0',
  ink: '#0F172A',
  muted: '#64748B',
  primary: '#0B3B5A',
  blue: '#2563EB',
  sky: '#0EA5E9',
  green: '#16A34A',
  red: '#DC2626',
  orange: '#EA580C',
  amber: '#F59E0B',
  violet: '#7C3AED',
  pink: '#DB2777',
  teal: '#0D9488',
};

export const PALETTE = [C.blue, C.orange, C.green, C.violet, C.pink, C.teal, C.amber, C.red];

/** Clears the canvas with the light school background and an optional caption strip. */
export function clear(ctx: CanvasRenderingContext2D, w: number, h: number, caption?: string) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, w, h);
  if (caption) {
    ctx.fillStyle = C.muted;
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(caption.toUpperCase(), 16, 14);
  }
}

export function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  opts: { size?: number; color?: string; weight?: number; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; font?: string } = {}
) {
  ctx.fillStyle = opts.color ?? C.ink;
  ctx.font = `${opts.weight ?? 500} ${opts.size ?? 14}px ${opts.font ?? 'Inter, system-ui, sans-serif'}`;
  ctx.textAlign = opts.align ?? 'center';
  ctx.textBaseline = opts.baseline ?? 'middle';
  ctx.fillText(value, x, y);
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, lw = 1) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

export function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = C.ink, lw = 2, dash?: number[]) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function arrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colorOrOpts: string | { color?: string; width?: number } = C.ink,
  lw = 2
) {
  const color = typeof colorOrOpts === 'string' ? colorOrOpts : (colorOrOpts?.color ?? C.ink);
  const lineWidth = typeof colorOrOpts === 'object' ? (colorOrOpts?.width ?? 2) : lw;
  line(ctx, x1, y1, x2, y2, color, lineWidth);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const s = 7 + lineWidth;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4));
  ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4));
  ctx.closePath();
  ctx.fill();
}

export function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fillOrOpts?: string | { fill?: string; stroke?: string; width?: number },
  stroke?: string,
  lw = 1.5
) {
  const fillStyle = typeof fillOrOpts === 'string' ? fillOrOpts : fillOrOpts?.fill;
  const strokeStyle = typeof fillOrOpts === 'object' ? fillOrOpts?.stroke : stroke;
  const lineWidth = typeof fillOrOpts === 'object' ? (fillOrOpts?.width ?? 1.5) : lw;

  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/** Plots y = f(x) samples inside a box with axes; returns a mapper for extra points. */
export function plot(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  range: { x0: number; x1: number; y0: number; y1: number },
  series: Array<{ points: Array<[number, number]>; color: string; width?: number; dots?: boolean }>,
  labels: { x: string; y: string }
) {
  const mx = (v: number) => box.x + ((v - range.x0) / (range.x1 - range.x0 || 1)) * box.w;
  const my = (v: number) => box.y + box.h - ((v - range.y0) / (range.y1 - range.y0 || 1)) * box.h;
  roundRect(ctx, box.x, box.y, box.w, box.h, 6, C.panel, C.grid);
  for (let i = 1; i < 5; i++) {
    line(ctx, box.x, box.y + (box.h * i) / 5, box.x + box.w, box.y + (box.h * i) / 5, C.grid, 1);
    line(ctx, box.x + (box.w * i) / 5, box.y, box.x + (box.w * i) / 5, box.y + box.h, C.grid, 1);
  }
  for (const s of series) {
    if (!s.points.length) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();
    if (s.dots) {
      for (const [px, py] of s.points) circle(ctx, mx(px), my(py), 4, s.color);
    } else {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width ?? 2.5;
      ctx.beginPath();
      s.points.forEach(([px, py], i) => (i ? ctx.lineTo(mx(px), my(py)) : ctx.moveTo(mx(px), my(py))));
      ctx.stroke();
    }
    ctx.restore();
  }
  text(ctx, labels.x, box.x + box.w / 2, box.y + box.h + 16, { size: 11, color: C.muted });
  ctx.save();
  ctx.translate(box.x - 16, box.y + box.h / 2);
  ctx.rotate(-Math.PI / 2);
  text(ctx, labels.y, 0, 0, { size: 11, color: C.muted });
  ctx.restore();
  text(ctx, fmt(range.x0), box.x, box.y + box.h + 6, { size: 9, color: C.muted, align: 'left', baseline: 'top' });
  text(ctx, fmt(range.x1), box.x + box.w, box.y + box.h + 6, { size: 9, color: C.muted, align: 'right', baseline: 'top' });
  text(ctx, fmt(range.y1), box.x - 4, box.y, { size: 9, color: C.muted, align: 'right', baseline: 'top' });
  text(ctx, fmt(range.y0), box.x - 4, box.y + box.h, { size: 9, color: C.muted, align: 'right', baseline: 'bottom' });
  return { mx, my };
}

export function fmt(v: number, digits = 2) {
  if (!Number.isFinite(v)) return '∞';
  const r = Math.round(v * 10 ** digits) / 10 ** digits;
  return String(r);
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Smoothly moves `current` towards `target` (used for gentle animations). */
export function approach(current: number, target: number, dt: number, speed = 6) {
  return current + (target - current) * Math.min(1, dt * speed);
}

export interface TimeState {
  t: number;
  [k: string]: unknown;
}

/** Engine for simulations whose picture is a function of the parameters plus elapsed time. */
export function timeEngine(render: (ctx: CanvasRenderingContext2D, w: number, h: number, s: TimeState, p: Record<string, any>) => void, step?: (s: TimeState, p: Record<string, any>, dt: number) => void): ISimulationEngine<TimeState> {
  return {
    createInitialState: () => ({ t: 0 }),
    reset: () => ({ t: 0 }),
    update: (s, p, dt) => {
      s.t += dt;
      step?.(s, p, dt);
      return s;
    },
    render,
  };
}

const range = (key: string, label: string, min: number, max: number, def: number, step = 1, unit?: string): ISimulationParam => ({ key, label, type: 'range', min, max, step, default: def, unit });
const select = (key: string, label: string, options: Array<[string, string]>, def?: string): ISimulationParam => ({
  key,
  label,
  type: 'select',
  default: def ?? options[0]?.[0] ?? '',
  options: options.map(([value, l]) => ({ value, label: l })),
});
const toggle = (key: string, label: string, def = false): ISimulationParam => ({ key, label, type: 'boolean', default: def });
export const P = { range, select, toggle };

export const metric = (id: string, label: string, format: ISimulationMetric['format'], color?: string): ISimulationMetric => ({ id, label, format, color });

const LEVEL_LABEL = (level: string | null) => {
  if (!level) return null;
  const [kind, n] = level.split('-');
  return `${kind === 'class' ? 'Class' : 'Grade'} ${n}`;
};

export function defineSchool(d: {
  id: string;
  title: string;
  band: CatalogueBand;
  level: string | null;
  levelLabel?: string | null;
  subject: string;
  contentType?: 'SIMULATION' | 'VIRTUAL_LAB';
  category: SchoolCategory;
  icon: string;
  shortDescription: string;
  detailedDescription: string;
  learningObjectives: string[];
  formulaOverview?: string;
  topic?: string;
  parameters: ISimulationParam[];
  metrics: ISimulationMetric[];
  engine: ISimulationEngine<any>;
  tags: string[];
}): SchoolSimulationDefinition {
  const contentType = d.contentType ?? 'SIMULATION';
  return {
    ...d,
    domain: contentType === 'VIRTUAL_LAB' ? 'VIRTUAL_LAB' : 'SCHOOL',
    contentType,
    levelLabel: d.levelLabel ?? LEVEL_LABEL(d.level),
    suggestedUnits: [],
    alignment: 'SAMPLE_TO_VERIFY',
  };
}
