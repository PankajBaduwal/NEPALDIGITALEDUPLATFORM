/**
 * Virtual Labs: guided virtual experiments (a separate content type from simulations).
 * Readings are computed from the standard physical/chemical relationships and are labelled as
 * virtual results; they illustrate the experiment and do not replace a physical laboratory.
 */
import { C, P, approach, arrow, circle, clear, defineSchool, fmt, line, metric, plot, roundRect, text, timeEngine, type TimeState } from './kit';

const VIRTUAL_NOTE = 'Virtual result — computed from the model, not measured';

function note(ctx: CanvasRenderingContext2D, w: number, h: number) {
  text(ctx, VIRTUAL_NOTE, w - 12, h - 10, { size: 10, color: C.muted, align: 'right', baseline: 'bottom' });
}

function meter(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, value: string, color: string) {
  circle(ctx, x, y, 30, '#fff', color, 3);
  text(ctx, label, x, y - 9, { size: 13, weight: 800, color });
  text(ctx, value, x, y + 10, { size: 11, weight: 700, color: C.ink, font: 'ui-monospace, monospace' });
}

function bulb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, brightness: number) {
  const b = Math.max(0, Math.min(1, brightness));
  if (b > 0.02) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, r * 3);
    g.addColorStop(0, `rgba(253,224,71,${0.85 * b})`);
    g.addColorStop(1, 'rgba(253,224,71,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }
  circle(ctx, x, y, r, b > 0.02 ? `rgba(254,240,138,${0.4 + 0.6 * b})` : '#F1F5F9', '#78716C', 2);
  roundRect(ctx, x - r * 0.5, y + r * 0.8, r, r * 0.6, 2, '#A8A29E');
}

function battery(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  line(ctx, x - 6, y - 18, x - 6, y + 18, C.ink, 3);
  line(ctx, x + 6, y - 10, x + 6, y + 10, C.ink, 6);
  text(ctx, label, x, y + 32, { size: 12, weight: 600, color: C.muted });
}

function resistor(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number, label: string, color = C.ink) {
  const n = 6;
  const seg = (x2 - x1) / (n + 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x1 + seg, y);
  for (let i = 0; i < n; i++) ctx.lineTo(x1 + seg * (i + 1.5), y + (i % 2 ? 9 : -9));
  ctx.lineTo(x2 - seg, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  text(ctx, label, (x1 + x2) / 2, y - 22, { size: 12, weight: 700, color });
}

// ───────────────────────── Grades 1–8 ─────────────────────────

const MATERIALS: Record<string, { name: string; conductor: boolean }> = {
  wire: { name: 'Copper wire', conductor: true },
  nail: { name: 'Iron nail', conductor: true },
  foil: { name: 'Aluminium foil', conductor: true },
  coin: { name: 'Steel coin', conductor: true },
  plastic: { name: 'Plastic ruler', conductor: false },
  wood: { name: 'Wooden stick', conductor: false },
  rubber: { name: 'Rubber band', conductor: false },
  paper: { name: 'Paper', conductor: false },
};

export const simpleCircuit = defineSchool({
  id: 'vl-g18-simple-circuit',
  title: 'Simple Electric Circuit — Conductors and Insulators',
  band: 'GRADES_1_8',
  level: 'class-6',
  subject: 'Science',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '💡',
  topic: 'Electric circuits',
  shortDescription: 'Build a circuit with cells, a bulb and a switch, then test which materials let electricity pass.',
  detailedDescription: 'Close the switch to complete the circuit. Place different materials in the gap: the bulb lights only when the material is a conductor. More cells make the bulb brighter; more bulbs in a row make each one dimmer.',
  learningObjectives: ['Recognise a complete (closed) circuit', 'Classify materials as conductors or insulators', 'Observe the effect of cells and bulbs on brightness'],
  parameters: [
    P.toggle('closed', 'Switch closed', true),
    P.select('material', 'Material in the gap', Object.entries(MATERIALS).map(([k, v]) => [k, v.name])),
    P.range('cells', 'Number of cells', 1, 3, 2),
    P.range('bulbs', 'Number of bulbs', 1, 3, 1),
  ],
  metrics: [
    metric('complete', 'Circuit', (_s, p) => (p.closed && MATERIALS[p.material]?.conductor ? 'Complete — current flows' : 'Open — no current')),
    metric('mat', 'Material is a', (_s, p) => (MATERIALS[p.material]?.conductor ? 'Conductor' : 'Insulator')),
    metric('bright', 'Bulb brightness', (_s, p) => (p.closed && MATERIALS[p.material]?.conductor ? `${Math.round(Math.min(1, (p.cells / p.bulbs) / 2) * 100)}%` : '0%')),
  ],
  tags: ['electric circuit', 'conductors', 'insulators', 'virtual lab', 'class 6'],
  engine: timeEngine((ctx, w, h, s, p) => {
    clear(ctx, w, h, 'Virtual lab · simple circuit');
    const on = !!p.closed && MATERIALS[p.material]?.conductor;
    const brightness = on ? Math.min(1, p.cells / p.bulbs / 2) : 0;
    const L = w * 0.14;
    const R = w * 0.86;
    const T = h * 0.22;
    const B = h * 0.72;
    const wire = on ? C.orange : C.ink;
    line(ctx, L, T, R, T, wire, 3);
    line(ctx, R, T, R, B, wire, 3);
    line(ctx, L, B, w * 0.42, B, wire, 3);
    line(ctx, w * 0.58, B, R, B, wire, 3);
    line(ctx, L, T, L, h * 0.4, wire, 3);
    line(ctx, L, h * 0.54, L, B, wire, 3);
    ctx.save();
    ctx.translate(L, h * 0.47);
    ctx.rotate(Math.PI / 2);
    battery(ctx, 0, 0, '');
    ctx.restore();
    text(ctx, `${p.cells} cell${p.cells > 1 ? 's' : ''} (${(1.5 * p.cells).toFixed(1)} V)`, L + 58, h * 0.47, { size: 12, weight: 600, color: C.muted });
    // bulbs along the top
    for (let i = 0; i < p.bulbs; i++) bulb(ctx, L + ((i + 1) * (R - L)) / (Number(p.bulbs) + 1), T, 16, brightness);
    // switch on the right
    const sy = h * 0.47;
    circle(ctx, R, sy - 22, 4, C.ink);
    circle(ctx, R, sy + 22, 4, C.ink);
    ctx.fillStyle = C.bg;
    ctx.fillRect(R - 3, sy - 18, 6, 36);
    if (p.closed) line(ctx, R, sy - 22, R, sy + 22, wire, 3);
    else line(ctx, R, sy + 22, R + 26, sy - 14, C.ink, 3);
    text(ctx, p.closed ? 'switch ON' : 'switch OFF', R - 50, sy, { size: 12, weight: 600, color: C.muted });
    // test gap with material
    const m = MATERIALS[p.material] ?? MATERIALS.wire!;
    roundRect(ctx, w * 0.42, B - 10, w * 0.16, 20, 6, m.conductor ? '#CBD5E1' : '#FDE68A', C.ink);
    text(ctx, m.name, w / 2, B + 28, { size: 13, weight: 700, color: m.conductor ? C.primary : C.amber });
    // moving charges when current flows
    if (on) {
      const per = 2 * (R - L) + 2 * (B - T);
      for (let k = 0; k < 14; k++) {
        let d = ((s.t * 80 * brightness + (k * per) / 14) % per + per) % per;
        let x = L;
        let y = T;
        if (d < R - L) x = L + d;
        else if ((d -= R - L) < B - T) [x, y] = [R, T + d];
        else if ((d -= B - T) < R - L) [x, y] = [R - d, B];
        else [x, y] = [L, B - (d - (R - L))];
        circle(ctx, x, y, 3, C.sky);
      }
    }
    note(ctx, w, h);
  }),
});

export const lightShadows = defineSchool({
  id: 'vl-g18-light-shadows',
  title: 'Light and Shadows',
  band: 'GRADES_1_8',
  level: 'class-6',
  subject: 'Science',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🔦',
  topic: 'Light travels in straight lines',
  shortDescription: 'Move a torch and an object to see how the size of a shadow changes, and test opaque, translucent and transparent objects.',
  detailedDescription: 'Light travels in straight lines, so an opaque object blocks it and casts a shadow. The closer the object is to the torch, the bigger its shadow on the screen.',
  learningObjectives: ['Explain how shadows are formed', 'Predict how shadow size changes with distance', 'Classify objects as opaque, translucent or transparent'],
  parameters: [
    P.range('obj', 'Object distance from torch', 10, 90, 40, 1, 'cm'),
    P.range('size', 'Object height', 5, 30, 15, 1, 'cm'),
    P.select('type', 'Object material', [['opaque', 'Opaque (cardboard)'], ['translucent', 'Translucent (butter paper)'], ['transparent', 'Transparent (glass)']]),
  ],
  metrics: [
    metric('sh', 'Shadow height on screen', (_s, p) => (p.type === 'transparent' ? 'no shadow' : `${fmt((p.size * 100) / p.obj, 1)} cm`)),
    metric('kind', 'Shadow', (_s, p) => (p.type === 'opaque' ? 'Dark shadow' : p.type === 'translucent' ? 'Faint shadow' : 'None')),
  ],
  formulaOverview: 'shadow height = object height × (torch-to-screen distance ÷ torch-to-object distance); screen at 100 cm',
  tags: ['light', 'shadows', 'virtual lab', 'class 6'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Virtual lab · light and shadows');
    const x0 = w * 0.1;
    const xs = w * 0.88;
    const cy = h * 0.55;
    const X = (cm: number) => x0 + (cm / 100) * (xs - x0);
    const k = (h * 0.6) / 100;
    roundRect(ctx, x0 - 34, cy - 12, 34, 24, 4, '#334155');
    roundRect(ctx, x0 - 6, cy - 16, 10, 32, 3, '#FDE047');
    // screen
    roundRect(ctx, xs, h * 0.08, 10, h * 0.84, 2, '#E2E8F0', C.line);
    const ox = X(p.obj);
    const half = (p.size * k) / 2;
    const shadowHalf = Math.min(h * 0.42, (half * (xs - x0)) / (ox - x0));
    const alpha = p.type === 'opaque' ? 0.85 : p.type === 'translucent' ? 0.3 : 0;
    // light cone
    ctx.fillStyle = 'rgba(253,224,71,0.18)';
    ctx.beginPath();
    ctx.moveTo(x0, cy);
    ctx.lineTo(xs, h * 0.08);
    ctx.lineTo(xs, h * 0.92);
    ctx.closePath();
    ctx.fill();
    if (alpha > 0) {
      ctx.fillStyle = `rgba(15,23,42,${alpha * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(ox, cy - half);
      ctx.lineTo(xs, cy - shadowHalf);
      ctx.lineTo(xs, cy + shadowHalf);
      ctx.lineTo(ox, cy + half);
      ctx.closePath();
      ctx.fill();
      roundRect(ctx, xs, cy - shadowHalf, 10, shadowHalf * 2, 2, `rgba(15,23,42,${alpha})`);
    }
    line(ctx, x0, cy, xs, cy - shadowHalf, 'rgba(234,179,8,0.9)', 1.5, [5, 4]);
    line(ctx, x0, cy, xs, cy + shadowHalf, 'rgba(234,179,8,0.9)', 1.5, [5, 4]);
    roundRect(ctx, ox - 4, cy - half, 8, half * 2, 2, p.type === 'opaque' ? '#92400E' : p.type === 'translucent' ? 'rgba(254,243,199,0.9)' : 'rgba(186,230,253,0.6)', C.ink);
    text(ctx, 'torch', x0 - 16, cy + 30, { size: 12, color: C.muted });
    text(ctx, `object at ${p.obj} cm`, ox, cy + half + 18, { size: 12, color: C.muted });
    text(ctx, 'screen (100 cm)', xs - 40, h * 0.05 + 4, { size: 12, color: C.muted });
    note(ctx, w, h);
  }),
});

// ───────────────────────── Grades 9–12 (Grade 10 Science & Technology) ─────────────────────────

interface OhmState extends TimeState {
  readings: Array<[number, number]>;
  key: string;
}

export const ohmsLaw = defineSchool({
  id: 'vl-g10-ohms-law',
  title: "Ohm's Law Experiment",
  band: 'GRADES_9_12',
  level: 'grade-10',
  subject: 'Science & Technology',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🔌',
  topic: 'Electricity: current, voltage and resistance',
  shortDescription: 'Vary the voltage across a resistor, record ammeter readings and plot the V–I graph.',
  detailedDescription: 'An ammeter in series and a voltmeter in parallel measure the current through and the voltage across a resistor. Each new setting adds a reading to the table; the straight-line V–I graph confirms V = IR.',
  learningObjectives: ['Connect an ammeter and a voltmeter correctly', 'Verify that current is proportional to voltage', 'Find resistance from the slope of the V–I graph'],
  formulaOverview: 'V = I × R   ⇒   I = V ÷ R',
  parameters: [P.range('v', 'Supply voltage', 0, 12, 6, 0.5, 'V'), P.range('r', 'Resistance', 2, 100, 20, 1, 'Ω'), P.toggle('clear', 'Clear readings')],
  metrics: [
    metric('i', 'Ammeter reading', (_s, p) => `${fmt(p.v / p.r, 3)} A`),
    metric('vm', 'Voltmeter reading', (_s, p) => `${fmt(p.v, 2)} V`),
    metric('pw', 'Power', (_s, p) => `${fmt((p.v * p.v) / p.r, 2)} W`),
    metric('n', 'Readings recorded', (s) => String(((s as OhmState).readings ?? []).length)),
  ],
  tags: ["ohm's law", 'electricity', 'virtual lab', 'grade 10'],
  engine: {
    createInitialState: () => ({ t: 0, readings: [], key: '' }) as OhmState,
    reset: () => ({ t: 0, readings: [], key: '' }) as OhmState,
    update: (s: OhmState, p) => {
      if (p.clear) s.readings = [];
      const key = `${p.v}|${p.r}`;
      if (!p.clear && key !== s.key) {
        s.key = key;
        if (!s.readings.some(([vv, rr]) => vv === p.v && rr === p.r)) s.readings = [...s.readings.slice(-11), [p.v, p.r]];
      }
      return s;
    },
    render: (ctx, w, h, s: OhmState, p) => {
      clear(ctx, w, h, "Virtual lab · Ohm's law");
      const I = p.v / p.r;
      // circuit (left)
      const L = w * 0.06;
      const R = w * 0.46;
      const T = h * 0.2;
      const B = h * 0.62;
      line(ctx, L, T, R, T, C.ink, 2.5);
      line(ctx, R, T, R, B, C.ink, 2.5);
      line(ctx, L, B, R, B, C.ink, 2.5);
      line(ctx, L, T, L, B, C.ink, 2.5);
      ctx.fillStyle = C.bg;
      ctx.fillRect(L - 10, (T + B) / 2 - 22, 20, 44);
      ctx.save();
      ctx.translate(L, (T + B) / 2);
      ctx.rotate(Math.PI / 2);
      battery(ctx, 0, 0, '');
      ctx.restore();
      text(ctx, `${p.v} V`, L + 30, (T + B) / 2, { size: 12, weight: 700, color: C.muted });
      ctx.fillStyle = C.bg;
      ctx.fillRect(L + (R - L) * 0.3, T - 12, (R - L) * 0.4, 24);
      resistor(ctx, L + (R - L) * 0.3, T, L + (R - L) * 0.7, `R = ${p.r} Ω`, C.primary);
      meter(ctx, R, (T + B) / 2, 'A', fmt(I, 3), C.red);
      // voltmeter across the resistor
      line(ctx, L + (R - L) * 0.3, T, L + (R - L) * 0.3, T + 40, C.muted, 1.5, [4, 3]);
      line(ctx, L + (R - L) * 0.7, T, L + (R - L) * 0.7, T + 40, C.muted, 1.5, [4, 3]);
      line(ctx, L + (R - L) * 0.3, T + 40, L + (R - L) * 0.7, T + 40, C.muted, 1.5, [4, 3]);
      meter(ctx, (L + R) / 2, T + 64, 'V', fmt(p.v, 2), C.blue);
      // table
      const rows = s.readings.slice(-6);
      text(ctx, 'Observation table', (L + R) / 2, h * 0.7, { size: 12, weight: 700, color: C.primary });
      rows.forEach(([vv, rr], i) => text(ctx, `${i + 1}.  V = ${fmt(vv)} V   R = ${rr} Ω   I = ${fmt(vv / rr, 3)} A`, (L + R) / 2, h * 0.75 + i * 16, { size: 11, font: 'ui-monospace, monospace' }));
      // graph (right): current R line + recorded points for the same R
      const maxI = 12 / p.r;
      plot(
        ctx,
        { x: w * 0.58, y: h * 0.14, w: w * 0.36, h: h * 0.62 },
        { x0: 0, x1: 12, y0: 0, y1: Math.max(0.05, maxI) },
        [
          { points: [[0, 0], [12, 12 / p.r]], color: 'rgba(11,59,90,0.35)', width: 1.5 },
          { points: s.readings.filter(([, rr]) => rr === p.r).map(([vv, rr]) => [vv, vv / rr] as [number, number]), color: C.red, dots: true },
          { points: [[p.v, I]], color: C.orange, dots: true },
        ],
        { x: 'Voltage V (volt)', y: 'Current I (ampere)' }
      );
      text(ctx, `slope = 1/R = ${fmt(1 / p.r, 3)}`, w * 0.76, h * 0.84, { size: 12, color: C.muted, weight: 600 });
      note(ctx, w, h);
    },
  },
});

export const seriesParallel = defineSchool({
  id: 'vl-g10-series-parallel',
  title: 'Series and Parallel Circuits',
  band: 'GRADES_9_12',
  level: 'grade-10',
  subject: 'Science & Technology',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🔀',
  topic: 'Combination of resistors',
  shortDescription: 'Connect three resistors in series or in parallel and compare the equivalent resistance and the currents.',
  detailedDescription: 'In series, the same current flows through every resistor and the resistances add. In parallel, each branch has the full voltage and the reciprocals of the resistances add.',
  learningObjectives: ['Calculate equivalent resistance in series and in parallel', 'Compare current and voltage in each arrangement', 'Explain why household circuits are wired in parallel'],
  formulaOverview: 'Series: R = R₁ + R₂ + R₃;  Parallel: 1/R = 1/R₁ + 1/R₂ + 1/R₃',
  parameters: [
    P.select('mode', 'Connection', [['series', 'Series'], ['parallel', 'Parallel']]),
    P.range('v', 'Supply voltage', 1, 24, 12, 0.5, 'V'),
    P.range('r1', 'R₁', 1, 50, 10, 1, 'Ω'),
    P.range('r2', 'R₂', 1, 50, 20, 1, 'Ω'),
    P.range('r3', 'R₃', 1, 50, 30, 1, 'Ω'),
  ],
  metrics: [
    metric('req', 'Equivalent resistance', (_s, p) => `${fmt(p.mode === 'series' ? p.r1 + p.r2 + p.r3 : 1 / (1 / p.r1 + 1 / p.r2 + 1 / p.r3), 2)} Ω`),
    metric('it', 'Total current', (_s, p) => `${fmt(p.v / (p.mode === 'series' ? p.r1 + p.r2 + p.r3 : 1 / (1 / p.r1 + 1 / p.r2 + 1 / p.r3)), 3)} A`),
  ],
  tags: ['series', 'parallel', 'resistors', 'virtual lab', 'grade 10'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, `Virtual lab · ${p.mode} connection`);
    const Rs = [p.r1, p.r2, p.r3];
    const series = p.mode === 'series';
    const Req = series ? Rs[0] + Rs[1] + Rs[2] : 1 / Rs.reduce((a, r) => a + 1 / r, 0);
    const It = p.v / Req;
    const L = w * 0.1;
    const R = w * 0.9;
    const T = h * 0.2;
    const B = h * 0.78;
    line(ctx, L, B, R, B, C.ink, 2.5);
    line(ctx, L, T, L, B, C.ink, 2.5);
    line(ctx, R, T, R, B, C.ink, 2.5);
    ctx.fillStyle = C.bg;
    ctx.fillRect(w / 2 - 20, B - 12, 40, 24);
    battery(ctx, w / 2, B, `${p.v} V`);
    meter(ctx, L, (T + B) / 2, 'A', fmt(It, 3), C.red);
    const colors = [C.blue, C.green, C.violet];
    if (series) {
      const seg = (R - L) / 3;
      Rs.forEach((r, i) => {
        resistor(ctx, L + i * seg + 10, T, L + (i + 1) * seg - 10, `R${i + 1} = ${r} Ω`, colors[i]);
        line(ctx, L + i * seg, T, L + i * seg + 10, T, C.ink, 2.5);
        line(ctx, L + (i + 1) * seg - 10, T, L + (i + 1) * seg, T, C.ink, 2.5);
        text(ctx, `V = ${fmt(It * r, 2)} V`, L + (i + 0.5) * seg, T + 26, { size: 12, color: colors[i], weight: 600 });
      });
      text(ctx, `Same current ${fmt(It, 3)} A through every resistor`, w / 2, (T + B) / 2, { size: 14, weight: 600, color: C.primary });
    } else {
      const xa = w * 0.3;
      const xb = w * 0.7;
      line(ctx, L, T, xa, T, C.ink, 2.5);
      line(ctx, xb, T, R, T, C.ink, 2.5);
      Rs.forEach((r, i) => {
        const y = T + i * (h * 0.15);
        line(ctx, xa, T, xa, y, C.ink, 2.5);
        line(ctx, xb, T, xb, y, C.ink, 2.5);
        resistor(ctx, xa, y, xb, `R${i + 1} = ${r} Ω`, colors[i]);
        text(ctx, `I = ${fmt(p.v / r, 3)} A`, xb + 46, y, { size: 12, color: colors[i], weight: 600 });
      });
      text(ctx, `Every branch has the full ${p.v} V`, w / 2, h * 0.66, { size: 14, weight: 600, color: C.primary });
    }
    note(ctx, w, h);
  }),
});

export const convexLens = defineSchool({
  id: 'vl-g10-convex-lens',
  title: 'Image Formation by a Convex Lens',
  band: 'GRADES_9_12',
  level: 'grade-10',
  subject: 'Science & Technology',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🔍',
  topic: 'Light: lenses',
  shortDescription: 'Move an object along the optical bench and locate the image formed by a convex lens with a ray diagram.',
  detailedDescription: 'Two principal rays locate the image. The lens formula gives the image distance and the magnification; the nature of the image depends on where the object is placed relative to F and 2F.',
  learningObjectives: ['Draw ray diagrams for a convex lens', 'Use the lens formula 1/f = 1/v − 1/u', 'Describe the image for different object positions'],
  formulaOverview: '1/f = 1/v − 1/u (sign convention: u negative);  m = v / u',
  parameters: [P.range('f', 'Focal length', 5, 20, 10, 1, 'cm'), P.range('u', 'Object distance', 3, 60, 25, 0.5, 'cm'), P.range('ho', 'Object height', 1, 6, 3, 0.5, 'cm')],
  metrics: [
    metric('v', 'Image distance', (_s, p) => (Math.abs(p.u - p.f) < 1e-9 ? 'at infinity' : `${fmt((p.f * p.u) / (p.u - p.f), 2)} cm`)),
    metric('m', 'Magnification', (_s, p) => (Math.abs(p.u - p.f) < 1e-9 ? '∞' : fmt(-p.f / (p.u - p.f), 2))),
    metric('nature', 'Image', (_s, p) => {
      if (Math.abs(p.u - p.f) < 1e-9) return 'At infinity';
      if (p.u < p.f) return 'Virtual, erect, magnified';
      const m = Math.abs(p.f / (p.u - p.f));
      return `Real, inverted, ${m > 1.001 ? 'magnified' : m < 0.999 ? 'diminished' : 'same size'}`;
    }),
  ],
  tags: ['lens', 'optics', 'ray diagram', 'virtual lab', 'grade 10'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Virtual lab · optical bench');
    const cx = w / 2;
    const cy = h * 0.52;
    const scale = (w * 0.45) / 60;
    const X = (cm: number) => cx + cm * scale;
    const Y = (cm: number) => cy - cm * scale * 1.6;
    line(ctx, 10, cy, w - 10, cy, C.muted, 1);
    // lens
    ctx.strokeStyle = C.sky;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, h * 0.36, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (const k of [-2, -1, 1, 2]) {
      circle(ctx, X(k * p.f), cy, 3, C.ink);
      text(ctx, `${Math.abs(k) === 2 ? '2F' : 'F'}`, X(k * p.f), cy + 16, { size: 11, color: C.muted, weight: 700 });
    }
    const u = p.u;
    const f = p.f;
    const ho = p.ho;
    const ox = X(-u);
    arrow(ctx, ox, cy, ox, Y(ho), C.blue, 3);
    if (Math.abs(u - f) < 1e-9) {
      line(ctx, ox, Y(ho), cx, Y(ho), C.orange, 1.5);
      line(ctx, cx, Y(ho), w, Y(ho) + (w - cx) * ((cy - Y(ho)) / (f * scale)), C.orange, 1.5);
      text(ctx, 'Rays emerge parallel — image at infinity', w / 2, h * 0.92, { size: 13, color: C.muted, weight: 600 });
    } else {
      const v = (f * u) / (u - f); // positive = real image on the right
      const hi = (-ho * v) / u;
      const ix = X(v);
      const iy = Y(hi);
      // ray 1: parallel to axis, then through F on the right
      line(ctx, ox, Y(ho), cx, Y(ho), C.orange, 1.8);
      const dirX = X(f) - cx;
      const dirY = cy - Y(ho);
      const far = 3;
      line(ctx, cx, Y(ho), cx + dirX * far * 4, Y(ho) + dirY * far * 4, C.orange, 1.8);
      // ray 2: through the optical centre, undeviated
      line(ctx, ox, Y(ho), ox + (cx - ox) * 6, Y(ho) + (cy - Y(ho)) * 6, C.green, 1.8);
      if (v > 0) {
        arrow(ctx, ix, cy, ix, iy, C.red, 3);
      } else {
        // virtual image: extend rays backwards
        line(ctx, cx, Y(ho), cx - dirX * 6, Y(ho) - dirY * 6, C.orange, 1.2, [5, 4]);
        line(ctx, ox, Y(ho), ox - (cx - ox) * 4, Y(ho) - (cy - Y(ho)) * 4, C.green, 1.2, [5, 4]);
        ctx.globalAlpha = 0.7;
        arrow(ctx, ix, cy, ix, iy, C.red, 3);
        ctx.globalAlpha = 1;
      }
      text(ctx, `u = −${fmt(u)} cm   v = ${fmt(v)} cm   m = ${fmt(-v / u, 2)}`, w / 2, h * 0.93, { size: 13, color: C.muted, weight: 600 });
    }
    note(ctx, w, h);
  }),
});

const SOLUTIONS: Record<string, { name: string; ph: number }> = {
  hcl: { name: 'Dilute hydrochloric acid', ph: 1 },
  lemon: { name: 'Lemon juice', ph: 2.2 },
  vinegar: { name: 'Vinegar', ph: 2.9 },
  milk: { name: 'Milk', ph: 6.6 },
  water: { name: 'Distilled water', ph: 7 },
  baking: { name: 'Baking soda solution', ph: 8.3 },
  soap: { name: 'Soap solution', ph: 10 },
  lime: { name: 'Lime water', ph: 12.4 },
  naoh: { name: 'Dilute sodium hydroxide', ph: 13 },
};

const solOf = (k: string) => SOLUTIONS[k] ?? SOLUTIONS.water!;

function universalColour(ph: number): string {
  const stops = ['#DC2626', '#EA580C', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#14B8A6', '#0EA5E9', '#2563EB', '#4F46E5', '#7C3AED'];
  const i = Math.max(0, Math.min(stops.length - 1, Math.round((ph / 14) * (stops.length - 1))));
  return stops[i] ?? '#22C55E';
}

function indicatorColour(ind: string, ph: number): [string, string] {
  switch (ind) {
    case 'blue-litmus':
      return ph < 7 ? ['#EF4444', 'turns red'] : ['#3B82F6', 'stays blue'];
    case 'red-litmus':
      return ph > 7 ? ['#3B82F6', 'turns blue'] : ['#EF4444', 'stays red'];
    case 'phenolphthalein':
      return ph >= 8.3 ? ['#EC4899', 'turns pink'] : ['#F8FAFC', 'colourless'];
    case 'methyl-orange':
      return ph < 3.1 ? ['#DC2626', 'turns red'] : ph <= 4.4 ? ['#F97316', 'orange'] : ['#FACC15', 'turns yellow'];
    default:
      return [universalColour(ph), `pH ≈ ${Math.round(ph)}`];
  }
}

export const phIndicators = defineSchool({
  id: 'vl-g10-ph-indicators',
  title: 'Acids, Bases and Indicators (pH Testing)',
  band: 'GRADES_9_12',
  level: 'grade-10',
  subject: 'Science & Technology',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🧪',
  topic: 'Acids, bases and salts',
  shortDescription: 'Test common solutions with litmus, phenolphthalein, methyl orange and universal indicator.',
  detailedDescription: 'Add an indicator to a sample and observe the colour. Universal indicator shows the approximate pH; litmus and phenolphthalein show only whether the solution is acidic or basic. pH values are typical textbook values.',
  learningObjectives: ['Classify solutions as acidic, neutral or basic', 'Use indicators correctly', 'Read pH from universal indicator colour'],
  parameters: [
    P.select('sol', 'Sample', Object.entries(SOLUTIONS).map(([k, v]) => [k, v.name]), 'lemon'),
    P.select('ind', 'Indicator', [['universal', 'Universal indicator'], ['blue-litmus', 'Blue litmus'], ['red-litmus', 'Red litmus'], ['phenolphthalein', 'Phenolphthalein'], ['methyl-orange', 'Methyl orange']]),
  ],
  metrics: [
    metric('ph', 'Typical pH', (_s, p) => fmt(solOf(p.sol).ph, 1)),
    metric('nat', 'Nature', (_s, p) => (solOf(p.sol).ph < 7 ? 'Acidic' : solOf(p.sol).ph > 7 ? 'Basic' : 'Neutral')),
    metric('obs', 'Observation', (_s, p) => indicatorColour(p.ind, solOf(p.sol).ph)[1]),
  ],
  tags: ['acids', 'bases', 'pH', 'indicators', 'virtual lab', 'grade 10'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      clear(ctx, w, h, 'Virtual lab · indicator test');
      const sol = solOf(p.sol);
      const [col] = indicatorColour(p.ind, sol.ph);
      const mix = (s.mix as number) ?? 0;
      const tx = w * 0.3;
      const ty = h * 0.18;
      const tw = 70;
      const th = h * 0.6;
      // test tube
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx - tw / 2, ty);
      ctx.lineTo(tx - tw / 2, ty + th - tw / 2);
      ctx.arc(tx, ty + th - tw / 2, tw / 2, Math.PI, 0, true);
      ctx.lineTo(tx + tw / 2, ty);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(tx - tw, ty, tw * 2, th);
      ctx.globalAlpha = 0.25 + 0.75 * mix;
      ctx.fillStyle = col;
      ctx.fillRect(tx - tw, ty + th * 0.35, tw * 2, th);
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tx - tw / 2, ty);
      ctx.lineTo(tx - tw / 2, ty + th - tw / 2);
      ctx.arc(tx, ty + th - tw / 2, tw / 2, Math.PI, 0, true);
      ctx.lineTo(tx + tw / 2, ty);
      ctx.stroke();
      // dropper
      const dy = ty - 40 + Math.min(1, mix * 3) * 10;
      roundRect(ctx, tx - 8, dy - 50, 16, 50, 6, '#E2E8F0', C.ink);
      if (mix < 0.6) circle(ctx, tx, dy + 8 + ((s.t * 120) % 60), 4, col);
      text(ctx, sol.name, tx, ty + th + 26, { size: 13, weight: 700 });
      // pH scale
      const sx = w * 0.5;
      const sw = w * 0.44;
      const sy = h * 0.3;
      for (let i = 0; i <= 14; i++) {
        roundRect(ctx, sx + (i * sw) / 15, sy, sw / 15 - 2, 30, 3, universalColour(i));
        text(ctx, String(i), sx + ((i + 0.5) * sw) / 15, sy + 44, { size: 11, color: C.muted });
      }
      const mx = sx + ((sol.ph + 0.5) * sw) / 15;
      arrow(ctx, mx, sy - 30, mx, sy - 4, C.ink, 2);
      text(ctx, `pH ${fmt(sol.ph, 1)}`, mx, sy - 40, { size: 13, weight: 700 });
      text(ctx, 'acidic', sx + sw * 0.15, sy + 66, { size: 12, color: C.red, weight: 600 });
      text(ctx, 'neutral', sx + sw * 0.5, sy + 66, { size: 12, color: C.green, weight: 600 });
      text(ctx, 'basic', sx + sw * 0.85, sy + 66, { size: 12, color: C.violet, weight: 600 });
      text(ctx, `Observation: ${indicatorColour(p.ind, sol.ph)[1]}`, sx + sw / 2, h * 0.68, { size: 16, weight: 700, color: C.primary });
      note(ctx, w, h);
    },
    (s, p, dt) => {
      const key = `${p.sol}|${p.ind}`;
      if (s.key !== key) {
        s.key = key;
        s.mix = 0;
      }
      s.mix = approach((s.mix as number) ?? 0, 1, dt, 1.5);
    }
  ),
});

// ───────────────────────── Engineering ─────────────────────────

interface PendulumState extends TimeState {
  theta: number;
  omega: number;
  key: string;
}

export const pendulumG = defineSchool({
  id: 'vl-eng-pendulum-g',
  title: 'Simple Pendulum — Determination of g',
  band: 'ENGINEERING',
  level: null,
  subject: 'Engineering Physics',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🕰️',
  topic: 'Simple harmonic motion',
  shortDescription: 'Vary the length of a pendulum, time its oscillations and compute the acceleration due to gravity.',
  detailedDescription: 'For small amplitudes the period is T = 2π√(L/g). The lab counts oscillations, computes T and T², and calculates g = 4π²L/T². Choose a different planet to see how g changes the period.',
  learningObjectives: ['Measure the period of a simple pendulum', 'Verify that T² is proportional to L', 'Calculate g from L and T'],
  formulaOverview: 'T = 2π √(L/g)   ⇒   g = 4π² L / T²',
  parameters: [P.range('L', 'Length', 0.2, 2, 1, 0.05, 'm'), P.range('amp', 'Amplitude', 2, 15, 6, 1, '°'), P.select('planet', 'Location', [['9.81', 'Earth (9.81 m/s²)'], ['1.62', 'Moon (1.62 m/s²)'], ['3.71', 'Mars (3.71 m/s²)']])],
  metrics: [
    metric('T', 'Period T', (_s, p) => `${fmt(2 * Math.PI * Math.sqrt(p.L / Number(p.planet)), 3)} s`),
    metric('n', 'Oscillations counted', (s) => String(Math.floor((s as PendulumState & { count?: number }).count ?? 0))),
    metric('g', 'g = 4π²L/T²', (_s, p) => {
      const T = 2 * Math.PI * Math.sqrt(p.L / Number(p.planet));
      return `${fmt((4 * Math.PI * Math.PI * p.L) / (T * T), 2)} m/s²`;
    }),
  ],
  tags: ['pendulum', 'SHM', 'gravity', 'virtual lab', 'engineering physics'],
  engine: {
    createInitialState: (p) => ({ t: 0, theta: (p.amp * Math.PI) / 180, omega: 0, key: '' }) as PendulumState,
    reset: (p) => ({ t: 0, theta: (p.amp * Math.PI) / 180, omega: 0, key: '' }) as PendulumState,
    update: (s: PendulumState & { count?: number; prev?: number }, p, dt) => {
      const key = `${p.L}|${p.amp}|${p.planet}`;
      if (s.key !== key) Object.assign(s, { key, t: 0, theta: (p.amp * Math.PI) / 180, omega: 0, count: 0, prev: 0 });
      const g = Number(p.planet);
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const h = dt / steps;
        s.omega += (-(g / p.L) * Math.sin(s.theta)) * h;
        s.theta += s.omega * h;
      }
      // count a full oscillation each time it crosses the start side moving outwards
      if ((s.prev ?? 0) < 0 && s.omega >= 0 && s.theta < 0) s.count = (s.count ?? 0) + 0.5;
      if ((s.prev ?? 0) > 0 && s.omega <= 0 && s.theta > 0) s.count = (s.count ?? 0) + 0.5;
      s.prev = s.omega;
      s.t += dt;
      return s;
    },
    render: (ctx, w, h, s: PendulumState & { count?: number }, p) => {
      clear(ctx, w, h, 'Virtual lab · simple pendulum');
      const px = w * 0.32;
      const py = h * 0.1;
      const len = (h * 0.7 * p.L) / 2;
      roundRect(ctx, px - 80, py - 10, 160, 10, 3, '#64748B');
      const bx = px + len * Math.sin(s.theta);
      const by = py + len * Math.cos(s.theta);
      line(ctx, px, py, px, py + len, C.line, 1, [4, 4]);
      line(ctx, px, py, bx, by, C.ink, 2);
      circle(ctx, bx, by, 14, '#475569', '#1E293B', 2);
      text(ctx, `L = ${p.L} m`, px - 46, py + len / 2, { size: 12, color: C.muted, weight: 600 });
      // T² vs L graph
      const g = Number(p.planet);
      const pts: Array<[number, number]> = [];
      for (let L = 0.2; L <= 2.0001; L += 0.2) pts.push([L, (4 * Math.PI * Math.PI * L) / g]);
      plot(
        ctx,
        { x: w * 0.6, y: h * 0.14, w: w * 0.34, h: h * 0.55 },
        { x0: 0, x1: 2, y0: 0, y1: (4 * Math.PI * Math.PI * 2) / g },
        [
          { points: pts, color: 'rgba(11,59,90,0.4)', width: 1.5 },
          { points: [[p.L, (4 * Math.PI * Math.PI * p.L) / g]], color: C.orange, dots: true },
        ],
        { x: 'Length L (m)', y: 'T² (s²)' }
      );
      const T = 2 * Math.PI * Math.sqrt(p.L / g);
      text(ctx, `Oscillations: ${Math.floor(s.count ?? 0)}   ·   T = ${fmt(T, 3)} s   ·   T² = ${fmt(T * T, 3)} s²`, w * 0.77, h * 0.82, { size: 12, weight: 600, color: C.primary });
      text(ctx, `slope = 4π²/g = ${fmt((4 * Math.PI * Math.PI) / g, 3)} s²/m`, w * 0.77, h * 0.87, { size: 12, color: C.muted });
      note(ctx, w, h);
    },
  },
});

export const rcCircuit = defineSchool({
  id: 'vl-eng-rc-charging',
  title: 'RC Circuit — Charging and Discharging',
  band: 'ENGINEERING',
  level: null,
  subject: 'Electrical & Electronics',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🔋',
  topic: 'Transient response of an RC circuit',
  shortDescription: 'Charge and discharge a capacitor through a resistor and measure the time constant from the voltage curve.',
  detailedDescription: 'The capacitor voltage rises as V(1 − e^(−t/RC)) while charging and falls as V·e^(−t/RC) while discharging. After one time constant τ = RC the voltage reaches 63% of its final change.',
  learningObjectives: ['Observe exponential charging and discharging', 'Measure the time constant τ = RC', 'Relate τ to R and C'],
  formulaOverview: 'Charging: v(t) = V(1 − e^(−t/RC));  Discharging: v(t) = V e^(−t/RC);  τ = RC',
  parameters: [P.select('mode', 'Switch position', [['charge', 'Charge (to supply)'], ['discharge', 'Discharge (short)']]), P.range('v', 'Supply voltage', 1, 12, 5, 0.5, 'V'), P.range('r', 'Resistance', 1, 100, 10, 1, 'kΩ'), P.range('c', 'Capacitance', 10, 1000, 100, 10, 'µF')],
  metrics: [
    metric('tau', 'Time constant τ = RC', (_s, p) => `${fmt(p.r * p.c / 1000, 3)} s`),
    metric('vc', 'Capacitor voltage', (s) => `${fmt(((s as TimeState).vc as number) ?? 0, 3)} V`),
  ],
  tags: ['RC circuit', 'capacitor', 'time constant', 'virtual lab', 'electrical'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      clear(ctx, w, h, 'Virtual lab · RC transient');
      const tau = (p.r * p.c) / 1000;
      const hist = (s.hist as Array<[number, number]>) ?? [];
      const tMax = Math.max(5 * tau, 0.5);
      const curve: Array<[number, number]> = [];
      for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * tMax;
        curve.push([t, p.mode === 'charge' ? p.v * (1 - Math.exp(-t / tau)) : p.v * Math.exp(-t / tau)]);
      }
      const { mx, my } = plot(ctx, { x: w * 0.42, y: h * 0.14, w: w * 0.52, h: h * 0.6 }, { x0: 0, x1: tMax, y0: 0, y1: p.v * 1.05 }, [
        { points: curve, color: 'rgba(11,59,90,0.25)', width: 1.5 },
        { points: hist, color: C.red, width: 2.5 },
      ], { x: 'time t (s)', y: 'capacitor voltage (V)' });
      line(ctx, mx(tau), my(0), mx(tau), my(p.v * 1.05), C.orange, 1.5, [5, 4]);
      text(ctx, 'τ', mx(tau) + 8, my(p.v), { size: 13, weight: 700, color: C.orange });
      line(ctx, mx(0), my(p.v * 0.632), mx(tMax), my(p.v * 0.632), C.green, 1, [3, 4]);
      text(ctx, p.mode === 'charge' ? '63.2%' : '36.8%', mx(tMax) - 20, my(p.mode === 'charge' ? p.v * 0.632 : p.v * 0.368) - 10, { size: 11, color: C.green, weight: 700 });
      // circuit sketch
      const L = w * 0.06;
      const R = w * 0.32;
      const T = h * 0.25;
      const B = h * 0.7;
      line(ctx, L, T, R, T, C.ink, 2);
      line(ctx, R, T, R, B, C.ink, 2);
      line(ctx, L, B, R, B, C.ink, 2);
      line(ctx, L, T, L, B, C.ink, 2);
      ctx.fillStyle = C.bg;
      ctx.fillRect(L + (R - L) * 0.25, T - 12, (R - L) * 0.5, 24);
      resistor(ctx, L + (R - L) * 0.25, T, L + (R - L) * 0.75, `${p.r} kΩ`, C.primary);
      ctx.fillStyle = C.bg;
      ctx.fillRect(R - 12, (T + B) / 2 - 10, 24, 20);
      line(ctx, R - 14, (T + B) / 2 - 5, R + 14, (T + B) / 2 - 5, C.ink, 3);
      line(ctx, R - 14, (T + B) / 2 + 5, R + 14, (T + B) / 2 + 5, C.ink, 3);
      text(ctx, `${p.c} µF`, R + 40, (T + B) / 2, { size: 12, weight: 700, color: C.primary });
      if (p.mode === 'charge') {
        ctx.fillStyle = C.bg;
        ctx.fillRect(L - 12, (T + B) / 2 - 22, 24, 44);
        ctx.save();
        ctx.translate(L, (T + B) / 2);
        ctx.rotate(Math.PI / 2);
        battery(ctx, 0, 0, '');
        ctx.restore();
        text(ctx, `${p.v} V`, L + 28, (T + B) / 2 + 30, { size: 12, color: C.muted, weight: 600 });
      }
      meter(ctx, (L + R) / 2, B, 'Vc', fmt((s.vc as number) ?? 0, 2), C.red);
      note(ctx, w, h);
    },
    (s, p, dt) => {
      const tau = (p.r * p.c) / 1000;
      const key = `${p.mode}|${p.v}|${p.r}|${p.c}`;
      if (s.key !== key) {
        s.key = key;
        s.tt = 0;
        s.hist = [];
      }
      const tMax = Math.max(5 * tau, 0.5);
      s.tt = Math.min(tMax, ((s.tt as number) ?? 0) + dt * Math.max(1, tMax / 6));
      const t = s.tt as number;
      s.vc = p.mode === 'charge' ? p.v * (1 - Math.exp(-t / tau)) : p.v * Math.exp(-t / tau);
      const hist = s.hist as Array<[number, number]>;
      if (!hist.length || t - hist[hist.length - 1]![0] > tMax / 200) hist.push([t, s.vc as number]);
    }
  ),
});

function titrationPh(vb: number, va: number, ca: number, cb: number) {
  // strong acid (HCl) titrated with strong base (NaOH); volumes in mL, concentrations in mol/L
  const na = (va * ca) / 1000;
  const nb = (vb * cb) / 1000;
  const vt = (va + vb) / 1000;
  if (Math.abs(na - nb) < 1e-12) return 7;
  if (na > nb) return -Math.log10((na - nb) / vt);
  return 14 + Math.log10((nb - na) / vt);
}

export const titration = defineSchool({
  id: 'vl-eng-acid-base-titration',
  title: 'Acid–Base Titration (HCl vs NaOH)',
  band: 'ENGINEERING',
  level: null,
  subject: 'Engineering Chemistry',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '⚗️',
  topic: 'Volumetric analysis',
  shortDescription: 'Add sodium hydroxide from a burette to hydrochloric acid, follow the pH curve and find the end point with phenolphthalein.',
  detailedDescription: 'The pH changes slowly at first and then sharply near the equivalence point, where moles of base equal moles of acid. Phenolphthalein turns pink just after the equivalence point. Use the end-point volume to calculate the unknown concentration.',
  learningObjectives: ['Perform a strong acid–strong base titration', 'Identify the equivalence point from the pH curve', 'Calculate concentration using M₁V₁ = M₂V₂'],
  formulaOverview: 'At equivalence: M_acid × V_acid = M_base × V_base',
  parameters: [P.range('vb', 'NaOH added from burette', 0, 50, 10, 0.1, 'mL'), P.range('va', 'HCl taken in flask', 10, 30, 20, 1, 'mL'), P.range('ca', 'HCl concentration', 0.05, 0.2, 0.1, 0.01, 'M'), P.range('cb', 'NaOH concentration', 0.05, 0.2, 0.1, 0.01, 'M')],
  metrics: [
    metric('ph', 'pH in flask', (_s, p) => fmt(titrationPh(p.vb, p.va, p.ca, p.cb), 2)),
    metric('eq', 'Equivalence volume', (_s, p) => `${fmt((p.ca * p.va) / p.cb, 2)} mL`),
    metric('ind', 'Phenolphthalein', (_s, p) => (titrationPh(p.vb, p.va, p.ca, p.cb) >= 8.3 ? 'Pink — end point passed' : 'Colourless')),
  ],
  tags: ['titration', 'acid base', 'volumetric analysis', 'virtual lab', 'engineering chemistry'],
  engine: timeEngine((ctx, w, h, s, p) => {
    clear(ctx, w, h, 'Virtual lab · titration');
    const ph = titrationPh(p.vb, p.va, p.ca, p.cb);
    const veq = (p.ca * p.va) / p.cb;
    // burette
    const bx = w * 0.22;
    const top = h * 0.08;
    const bh = h * 0.48;
    roundRect(ctx, bx - 10, top, 20, bh, 4, '#F8FAFC', C.ink, 1.5);
    const remaining = Math.max(0, 1 - p.vb / 50);
    ctx.fillStyle = 'rgba(147,197,253,0.6)';
    ctx.fillRect(bx - 8, top + bh * (1 - remaining), 16, bh * remaining - 2);
    for (let i = 0; i <= 10; i++) line(ctx, bx + 10, top + (i * bh) / 10, bx + 16, top + (i * bh) / 10, C.muted, 1);
    text(ctx, `${fmt(p.vb, 1)} mL used`, bx + 64, top + bh * (1 - remaining), { size: 11, weight: 600, color: C.muted });
    line(ctx, bx, top + bh, bx, top + bh + 26, C.ink, 3);
    if (remaining > 0) circle(ctx, bx, top + bh + 34 + ((s.t * 60) % 20), 3, 'rgba(96,165,250,0.9)');
    // flask
    const fx = bx;
    const fy = h * 0.8;
    const colour = ph >= 8.3 ? `rgba(236,72,153,${Math.min(0.85, 0.2 + (ph - 8.3) * 0.15)})` : 'rgba(241,245,249,0.9)';
    ctx.fillStyle = colour;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx - 12, fy - 90);
    ctx.lineTo(fx - 12, fy - 60);
    ctx.lineTo(fx - 60, fy);
    ctx.lineTo(fx + 60, fy);
    ctx.lineTo(fx + 12, fy - 60);
    ctx.lineTo(fx + 12, fy - 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx - 30, fy - 38);
    ctx.lineTo(fx - 60, fy);
    ctx.lineTo(fx + 60, fy);
    ctx.lineTo(fx + 30, fy - 38);
    ctx.closePath();
    ctx.fill();
    text(ctx, `${p.va} mL HCl + phenolphthalein`, fx, fy + 18, { size: 11, color: C.muted, weight: 600 });
    // pH curve
    const pts: Array<[number, number]> = [];
    for (let v = 0; v <= 50; v += 0.25) pts.push([v, titrationPh(v, p.va, p.ca, p.cb)]);
    const { mx, my } = plot(ctx, { x: w * 0.46, y: h * 0.12, w: w * 0.48, h: h * 0.62 }, { x0: 0, x1: 50, y0: 0, y1: 14 }, [
      { points: pts, color: 'rgba(11,59,90,0.35)', width: 1.5 },
      { points: [[p.vb, ph]], color: C.orange, dots: true },
    ], { x: 'volume of NaOH added (mL)', y: 'pH' });
    line(ctx, mx(veq), my(0), mx(veq), my(14), C.green, 1.5, [5, 4]);
    text(ctx, `equivalence ${fmt(veq, 2)} mL`, mx(veq) + 4, my(13), { size: 11, color: C.green, weight: 700, align: 'left' });
    text(ctx, `pH = ${fmt(ph, 2)}`, w * 0.7, h * 0.86, { size: 16, weight: 700, color: C.primary });
    text(ctx, `M(HCl) = M(NaOH) × V(NaOH) ÷ V(HCl) = ${fmt(p.cb, 2)} × ${fmt(veq, 2)} ÷ ${p.va} = ${fmt((p.cb * veq) / p.va, 3)} M`, w * 0.7, h * 0.91, { size: 11, color: C.muted });
    note(ctx, w, h);
  }),
});

// ───────────────────────── Classes 9–12 Verified NCERT Virtual Labs ─────────────────────────

export const expC1102 = defineSchool({
  id: 'EXP-C11-02',
  title: 'Determination of Strength of Sodium Hydroxide Solution using Standard Oxalic Acid',
  band: 'GRADES_9_12',
  level: 'grade-11',
  subject: 'Chemistry',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🧪',
  topic: 'Quantitative Volumetric Analysis (Unit 6)',
  shortDescription: 'Operate a 50 mL graduated burette with dropwise stopcock precision, pipette 10 mL of 0.05 M oxalic acid, titrate to permanent faint pink blush with phenolphthalein, record concordant trials and determine exact NaOH strength (g/L).',
  detailedDescription: 'NCERT Class 11 Practical 6.2. Oxalic acid dihydrate (H2C2O4·2H2O) is a primary standard used to standardize hygroscopic secondary standard NaOH solution. Balanced reaction: H2C2O4 + 2NaOH → Na2C2O4 + 2H2O. Stoichiometric relationship: (M1 × V1)/1 = (M2 × V2)/2. At the equivalence point (pH 8.3–9.0), phenolphthalein turns from colorless to a faint permanent pink blush.',
  learningObjectives: [
    'Operate a graduated 50 mL burette with dropwise stopcock precision and lower meniscus alignment',
    'Transfer 10.0 mL of 0.05 M standard oxalic acid solution using a volumetric pipette',
    'Detect the stoichiometric equivalence point using phenolphthalein indicator',
    'Obtain concordant titre values (within 0.10 mL) across replicate trials',
    'Calculate the exact molarity and strength (g/L) of the supplied NaOH solution',
  ],
  formulaOverview: '(M₁ × V₁) ÷ 1 = (M₂ × V₂) ÷ 2  ⟹  M₂ = (2 × M₁ × V₁) ÷ V₂;  Strength = M₂ × 40.0 g/mol',
  parameters: [
    P.range('v2', 'NaOH titrant delivered (mL)', 0, 25, 10, 0.05, 'mL'),
    P.range('v1', 'Oxalic acid pipetted (mL)', 10, 25, 10, 5, 'mL'),
    P.range('m1', 'Standard oxalic acid molarity (M)', 0.05, 0.1, 0.05, 0.01, 'M'),
  ],
  metrics: [
    metric('ph', 'Conical Flask pH', (_s, p) => {
      const veq = (2 * p.m1 * p.v1) / 0.1;
      if (p.v2 < veq - 0.1) return '2.80 (Acidic)';
      if (Math.abs(p.v2 - veq) <= 0.1) return '8.60 (Equivalence Point)';
      return '11.80 (Alkaline)';
    }),
    metric('color', 'Solution Color', (_s, p) => {
      const veq = (2 * p.m1 * p.v1) / 0.1;
      if (p.v2 < veq) return 'Colorless';
      if (p.v2 === veq) return 'Faint Permanent Pink';
      return 'Deep Magenta';
    }),
    metric('m2', 'Derived NaOH Molarity', (_s, p) => `${fmt((2 * p.m1 * p.v1) / (p.v2 || 10), 4)} M`),
    metric('str', 'Derived NaOH Strength', (_s, p) => `${fmt(((2 * p.m1 * p.v1) / (p.v2 || 10)) * 40.0, 2)} g/L`),
  ],
  tags: ['titration', 'oxalic acid', 'naoh', 'volumetric analysis', 'ncert class 11', 'phenolphthalein', 'cbse chemistry'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'NCERT Class 11 Practical 6.2 · Oxalic Acid vs NaOH');
    const veq = (2 * p.m1 * p.v1) / 0.1;
    const isPink = p.v2 >= veq;
    const isDeep = p.v2 > veq + 0.5;

    // Burette on stand
    const bx = w * 0.28;
    const by = h * 0.12;
    const bw = 24;
    const bh = h * 0.52;
    roundRect(ctx, bx - bw / 2, by, bw, bh, 4, '#F8FAFC', C.ink, 1.5);
    const remaining = Math.max(0, 1 - p.v2 / 50);
    ctx.fillStyle = 'rgba(147,197,253,0.5)';
    ctx.fillRect(bx - (bw / 2 - 2), by + bh * (1 - remaining), bw - 4, bh * remaining - 2);
    text(ctx, `${fmt(p.v2, 2)} mL dispensed`, bx + bw + 20, by + bh * (1 - remaining), { size: 12, weight: 700, color: C.ink, align: 'left' });

    // Flask
    const fx = bx;
    const fy = h * 0.82;
    const flaskColor = isDeep ? 'rgba(219,39,119,0.85)' : isPink ? 'rgba(244,114,182,0.65)' : 'rgba(224,242,254,0.3)';
    ctx.fillStyle = flaskColor;
    ctx.beginPath();
    ctx.moveTo(fx - 14, fy - 70);
    ctx.lineTo(fx - 14, fy - 45);
    ctx.lineTo(fx - 65, fy);
    ctx.lineTo(fx + 65, fy);
    ctx.lineTo(fx + 14, fy - 45);
    ctx.lineTo(fx + 14, fy - 70);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    // White tile
    roundRect(ctx, fx - 75, fy + 4, 150, 10, 2, '#FFFFFF', C.line, 1.5);

    // Theory & Equivalence Details
    const rx = w * 0.54;
    text(ctx, 'Stoichiometric Relation:', rx, h * 0.18, { size: 13, weight: 700, color: C.primary, align: 'left' });
    text(ctx, '(M₁ × V₁) ÷ 1 = (M₂ × V₂) ÷ 2', rx, h * 0.24, { size: 14, weight: 800, color: C.ink, align: 'left', font: 'ui-monospace, monospace' });
    text(ctx, `Equivalence Titre V₂ = ${fmt(veq, 2)} mL`, rx, h * 0.32, { size: 13, weight: 700, color: C.green, align: 'left' });
    text(ctx, `Status: ${isDeep ? 'Overshot (Deep Magenta)' : isPink ? 'Concordant Endpoint (Faint Pink)' : 'Colorless (Acidic)'}`, rx, h * 0.40, { size: 13, weight: 700, color: isDeep ? C.red : isPink ? C.pink : C.primary, align: 'left' });
    text(ctx, `Calculated NaOH Molarity = ${fmt((2 * p.m1 * p.v1) / (p.v2 || 10), 4)} M`, rx, h * 0.50, { size: 13, weight: 700, color: C.teal, align: 'left' });
    text(ctx, `Calculated NaOH Strength = ${fmt(((2 * p.m1 * p.v1) / (p.v2 || 10)) * 40.0, 2)} g/L`, rx, h * 0.56, { size: 13, weight: 700, color: C.teal, align: 'left' });

    note(ctx, w, h);
  }),
});

export const expC0901 = defineSchool({
  id: 'EXP-C09-01',
  title: 'Separation of Mixture of Ammonium Chloride, Sand, and Common Salt',
  band: 'GRADES_9_12',
  level: 'grade-9',
  subject: 'Chemistry',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '⚗️',
  topic: 'Matter in Our Surroundings / Separation Techniques',
  shortDescription: 'Separate a ternary mixture using sublimation (NH4Cl), dissolution in water followed by filtration (insoluble sand), and crystallization/evaporation (NaCl).',
  detailedDescription: 'NCERT Class 9 Practical 1. Ammonium chloride sublimes on heating directly from solid to vapor without passing through liquid phase, depositing on the cool inverted funnel. Sand is insoluble in water and is separated by filtration. Soluble common salt is recovered by evaporation.',
  learningObjectives: [
    'Apply sublimation to separate volatile ammonium chloride',
    'Perform gravity filtration using fluted filter paper and glass funnel',
    'Recover soluble sodium chloride via evaporative crystallization',
    'Calculate recovery yields of individual components',
  ],
  formulaOverview: 'Recovery % = (Mass of separated constituent ÷ Initial mixture mass) × 100',
  parameters: [
    P.range('temp', 'Burner Temperature (°C)', 25, 400, 25, 25, '°C'),
    P.select('stage', 'Experimental Stage', [
      ['sublimation', '1. Sublimation of NH4Cl'],
      ['filtration', '2. Dissolution & Filtration of Sand'],
      ['evaporation', '3. Evaporation of NaCl Solution'],
    ], 'sublimation'),
  ],
  metrics: [
    metric('sub', 'NH4Cl Sublimation Status', (_s, p) => (p.stage === 'sublimation' && p.temp >= 340 ? 'Active Sublimation & Deposition' : 'Dormant')),
    metric('sand', 'Sand Separation', (_s, p) => (p.stage === 'filtration' ? 'Residue on Filter Paper' : 'In Mixture')),
    metric('salt', 'Salt Recovery', (_s, p) => (p.stage === 'evaporation' && p.temp >= 100 ? 'Dry Crystals Forming' : 'In Solution')),
  ],
  tags: ['mixture separation', 'sublimation', 'filtration', 'evaporation', 'ncert class 9', 'ammonium chloride', 'cbse chemistry'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'NCERT Class 9 Practical 1 · Separation of Ternary Mixture');
    text(ctx, `Current Stage: ${p.stage.toUpperCase()}`, w * 0.5, h * 0.15, { size: 16, weight: 800, color: C.primary, align: 'center' });
    text(ctx, `Heating Temperature: ${p.temp} °C`, w * 0.5, h * 0.22, { size: 14, weight: 700, color: p.temp > 100 ? C.red : C.muted, align: 'center' });
    roundRect(ctx, w * 0.25, h * 0.32, w * 0.5, h * 0.45, 12, '#FFFFFF', C.line, 1.5);
    if (p.stage === 'sublimation') {
      text(ctx, 'China dish with inverted glass funnel plugged with cotton', w * 0.5, h * 0.42, { size: 13, weight: 600, color: C.ink, align: 'center' });
      text(ctx, p.temp >= 340 ? '⚡ White fumes of NH₄Cl condensing on cool upper neck of funnel' : 'Apply heat (≥340 °C) to initiate sublimation of NH₄Cl', w * 0.5, h * 0.55, { size: 12, weight: 700, color: p.temp >= 340 ? C.teal : C.muted, align: 'center' });
    } else if (p.stage === 'filtration') {
      text(ctx, 'Filtration of residue: Sand remains on filter paper (Residue)', w * 0.5, h * 0.42, { size: 13, weight: 600, color: C.ink, align: 'center' });
      text(ctx, 'Aqueous NaCl solution passes into conical flask (Filtrate)', w * 0.5, h * 0.55, { size: 12, weight: 700, color: C.green, align: 'center' });
    } else {
      text(ctx, 'Evaporation of aqueous filtrate over sand bath / wire gauze', w * 0.5, h * 0.42, { size: 13, weight: 600, color: C.ink, align: 'center' });
      text(ctx, p.temp >= 100 ? 'Water evaporating; white cubic crystals of NaCl crystallizing' : 'Heat to 100 °C to boil off water', w * 0.5, h * 0.55, { size: 12, weight: 700, color: p.temp >= 100 ? C.orange : C.muted, align: 'center' });
    }
    note(ctx, w, h);
  }),
});

export const expC1001 = defineSchool({
  id: 'EXP-C10-01',
  title: 'Finding the pH of Dilute HCl, NaOH, Ethanoic Acid, Lemon Juice, Water, and Sodium Bicarbonate',
  band: 'GRADES_9_12',
  level: 'grade-10',
  subject: 'Chemistry',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '🌈',
  topic: 'Acids, Bases and Salts (Unit 2)',
  shortDescription: 'Determine the pH of six representative household and laboratory solutions using universal indicator paper and broad-spectrum pH color charts.',
  detailedDescription: 'NCERT Class 10 Practical 2. The pH scale measures hydrogen ion activity. Dilute HCl (pH 1, red), Lemon juice (pH 2–3, orange-red), Ethanoic acid (pH 3–4, orange-yellow), Distilled water (pH 7, green), Dilute NaHCO3 (pH 8.5–9, blue-green), Dilute NaOH (pH 13–14, dark violet/purple).',
  learningObjectives: [
    'Operate universal indicator paper strips with sterile dropper technique',
    'Compare developed colors against the standard NCERT pH color reference chart',
    'Classify solutions into strong acid, weak acid, neutral, weak base, and strong base',
  ],
  formulaOverview: 'pH = -log₁₀[H⁺]',
  parameters: [
    P.select('sample', 'Select Test Solution', [
      ['hcl', 'Dilute Hydrochloric Acid (HCl)'],
      ['lemon', 'Fresh Lemon Juice'],
      ['acetic', 'Dilute Ethanoic Acid (CH3COOH)'],
      ['water', 'Distilled Water (H2O)'],
      ['nahco3', 'Dilute Sodium Bicarbonate (NaHCO3)'],
      ['naoh', 'Dilute Sodium Hydroxide (NaOH)'],
    ], 'hcl'),
  ],
  metrics: [
    metric('ph', 'Measured pH Value', (_s, p) => {
      const map: Record<string, string> = { hcl: '1.0 (Strong Acid)', lemon: '2.5 (Weak Organic Acid)', acetic: '3.5 (Weak Acid)', water: '7.0 (Neutral)', nahco3: '8.5 (Weak Base)', naoh: '13.5 (Strong Base)' };
      return map[p.sample] || '7.0';
    }),
    metric('color', 'Universal Indicator Strip Color', (_s, p) => {
      const map: Record<string, string> = { hcl: 'Cherry Red', lemon: 'Orange-Red', acetic: 'Yellow-Orange', water: 'Grass Green', nahco3: 'Blue-Green', naoh: 'Deep Violet' };
      return map[p.sample] || 'Green';
    }),
  ],
  tags: ['ph', 'universal indicator', 'acids and bases', 'ncert class 10', 'cbse chemistry', 'ph paper'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'NCERT Class 10 Practical 2 · pH Analysis using Universal Indicator');
    const colorMap: Record<string, { hex: string; ph: string; label: string }> = {
      hcl: { hex: '#EF4444', ph: '1', label: 'Strong Acid · Red' },
      lemon: { hex: '#F97316', ph: '2.5', label: 'Weak Acid · Orange-Red' },
      acetic: { hex: '#FBBF24', ph: '3.5', label: 'Weak Acid · Orange-Yellow' },
      water: { hex: '#22C55E', ph: '7.0', label: 'Neutral · Green' },
      nahco3: { hex: '#0EA5E9', ph: '8.5', label: 'Weak Base · Blue' },
      naoh: { hex: '#7C3AED', ph: '13.5', label: 'Strong Base · Deep Violet' },
    };
    const active = colorMap[p.sample] || colorMap.water!;

    // Test Strip Graphic
    const sx = w * 0.35;
    const sy = h * 0.25;
    roundRect(ctx, sx, sy, 70, 180, 4, '#FDE047', C.ink, 1.5);
    // Moistened reacted zone
    roundRect(ctx, sx, sy + 100, 70, 80, 4, active.hex, active.hex, 0);

    text(ctx, 'Universal Indicator Paper Strip', sx + 35, sy - 18, { size: 12, weight: 700, color: C.primary, align: 'center' });
    text(ctx, `Observed Color: ${active.label}`, w * 0.65, h * 0.35, { size: 14, weight: 700, color: C.ink, align: 'left' });
    text(ctx, `pH Value ≈ ${active.ph}`, w * 0.65, h * 0.45, { size: 18, weight: 800, color: active.hex, align: 'left' });
    text(ctx, 'Standard NCERT pH Range 1 to 14', w * 0.65, h * 0.55, { size: 12, weight: 600, color: C.muted, align: 'left' });

    note(ctx, w, h);
  }),
});

export const expP1001 = defineSchool({
  id: 'EXP-P10-01',
  title: "Studying the Dependence of Potential Difference across a Resistor on Current (Ohm's Law) and Determining Resistance",
  band: 'GRADES_9_12',
  level: 'grade-10',
  subject: 'Physics',
  contentType: 'VIRTUAL_LAB',
  category: 'virtual lab',
  icon: '⚡',
  topic: 'Electricity (Unit 12)',
  shortDescription: "Interactive 3D Virtual Physics Laboratory for Ohm's Law: wire circuit with battery eliminator, plug key, sliding rheostat, ammeter, voltmeter, and specimen nichrome resistor. Verify V = I · R with least-count instrument quantization.",
  detailedDescription: "NCERT Class 10 Science Laboratory Manual Experiment 12.1. Electric current (I) is directly proportional to the potential difference (V) across an ohmic metallic conductor at constant temperature: V ∝ I ⟹ V = I · R. Connect ammeter in series and voltmeter in parallel. Discretized analog moving-coil scales with zero error correction.",
  learningObjectives: [
    'Wire a series circuit loop with DC battery eliminator, plug key, sliding rheostat, ammeter and unknown resistor',
    'Connect moving-coil voltmeter in parallel across the specimen resistor with correct polarity',
    'Record least count and zero error of ammeter (0–1.5 A, LC 0.05 A) and voltmeter (0–3.0 V, LC 0.1 V)',
    'Vary potential difference using sliding rheostat wiper and record concordant (V, I) pairs',
    'Plot V versus I graph and calculate experimental resistance from linear slope R = ΔV / ΔI',
  ],
  formulaOverview: 'V = I · R  ⟹  R = V / I  ⟹  Slope = ΔV / ΔI',
  parameters: [
    P.range('v', 'Battery Eliminator Voltage (V)', 2, 8, 4, 2, 'V'),
    P.range('rheo', 'Rheostat Resistance (Ω)', 0, 50, 15, 1, 'Ω'),
    P.toggle('key', 'Plug Key Inserted (Closed)', true),
  ],
  metrics: [
    metric('v', 'Potential Difference V', (_s, p) => (p.key ? `${fmt(p.v * (5 / (5 + p.rheo)), 2)} V` : '0.00 V')),
    metric('i', 'Electric Current I', (_s, p) => (p.key ? `${fmt(p.v / (5 + p.rheo), 2)} A` : '0.00 A')),
    metric('r', 'Specimen Resistance R', () => '5.00 Ω (Nichrome Wire)'),
  ],
  tags: ["ohm's law", 'electricity', 'physics virtual lab', 'class 10', 'ncert physics', 'cbse science', '3d physics lab'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, "NCERT Class 10 Experiment 12.1 · Ohm's Law");
    const I = p.key ? p.v / (5 + p.rheo) : 0;
    const V = I * 5;
    text(ctx, "3D Interactive Laboratory · Ohm's Law Workbench Active", w * 0.5, h * 0.35, { size: 16, weight: 800, color: C.primary, align: 'center' });
    text(ctx, `Battery: ${p.v} V · Rheostat: ${p.rheo} Ω · Key: ${p.key ? 'Closed' : 'Open'}`, w * 0.5, h * 0.45, { size: 14, weight: 600, color: C.ink, align: 'center' });
    text(ctx, `Meter Readings: V = ${fmt(V, 2)} V | I = ${fmt(I, 2)} A | R = 5.00 Ω`, w * 0.5, h * 0.55, { size: 16, weight: 800, color: C.teal, align: 'center' });
    note(ctx, w, h);
  }),
});

export const VIRTUAL_LABS = [
  expC1102,
  expC0901,
  expC1001,
  expP1001,
  simpleCircuit,
  lightShadows,
  ohmsLaw,
  seriesParallel,
  convexLens,
  phIndicators,
  pendulumG,
  rcCircuit,
  titration,
];

