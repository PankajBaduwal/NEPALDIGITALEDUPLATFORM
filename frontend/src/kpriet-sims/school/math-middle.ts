/** Grades 1–8 sample simulations: Mathematics Classes 5–8, and Science samples. */
import { C, P, approach, arrow, circle, clear, defineSchool, fmt, gcd, line, metric, roundRect, text, timeEngine } from './kit';

// ───────────────────────── Class 5 ─────────────────────────

export const areaPerimeter = defineSchool({
  id: 'g18-class5-area-perimeter',
  title: 'Area and Perimeter',
  band: 'GRADES_1_8',
  level: 'class-5',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '▭',
  topic: 'Rectangles on a square grid',
  shortDescription: 'Change the length and width of a rectangle on a grid and compare its area with its perimeter.',
  detailedDescription: 'Each small square is one square unit. Count the squares inside for the area, and walk around the edge for the perimeter.',
  learningObjectives: ['Find area by counting unit squares', 'Find perimeter as the distance around', 'See that shapes with the same area can have different perimeters'],
  formulaOverview: 'Area = length × width;  Perimeter = 2 × (length + width)',
  parameters: [P.range('l', 'Length', 1, 15, 6, 1, 'units'), P.range('b', 'Width', 1, 10, 4, 1, 'units'), P.toggle('walk', 'Trace the perimeter', true)],
  metrics: [
    metric('a', 'Area', (_s, p) => `${p.l} × ${p.b} = ${p.l * p.b} sq units`),
    metric('pr', 'Perimeter', (_s, p) => `2 × (${p.l} + ${p.b}) = ${2 * (p.l + p.b)} units`),
  ],
  tags: ['area', 'perimeter', 'measurement', 'class 5'],
  engine: timeEngine((ctx, w, h, s, p) => {
    clear(ctx, w, h, 'Square-unit grid');
    const L = Number(p.l);
    const B = Number(p.b);
    const u = Math.min((w - 80) / 16, (h - 120) / 11);
    const ox = (w - L * u) / 2;
    const oy = (h - B * u) / 2 - 10;
    for (let i = -1; i <= 16; i++) line(ctx, ox + (i - (16 - L) / 2) * u, 0, ox + (i - (16 - L) / 2) * u, h, '#EEF2F7', 1);
    for (let r = 0; r < B; r++)
      for (let c = 0; c < L; c++) {
        roundRect(ctx, ox + c * u + 1, oy + r * u + 1, u - 2, u - 2, 3, (r + c) % 2 ? '#DBEAFE' : '#BFDBFE');
      }
    ctx.strokeStyle = C.primary;
    ctx.lineWidth = 3;
    ctx.strokeRect(ox, oy, L * u, B * u);
    if (p.walk) {
      const per = 2 * (L + B);
      const d = (s.t * 4) % per;
      let x = ox;
      let y = oy;
      if (d < L) x = ox + d * u;
      else if (d < L + B) [x, y] = [ox + L * u, oy + (d - L) * u];
      else if (d < 2 * L + B) [x, y] = [ox + (2 * L + B - d) * u, oy + B * u];
      else y = oy + (per - d) * u;
      circle(ctx, x, y, 7, C.orange, '#fff', 2);
      text(ctx, `walked ${Math.floor(d)} of ${per} units`, w / 2, oy + B * u + 26, { size: 13, color: C.orange, weight: 600 });
    }
    text(ctx, `${L} units`, ox + (L * u) / 2, oy - 14, { size: 13, weight: 600, color: C.primary });
    text(ctx, `${B} units`, ox - 28, oy + (B * u) / 2, { size: 13, weight: 600, color: C.primary });
  }),
});

export const volumeCubes = defineSchool({
  id: 'g18-class5-volume-cubes',
  title: 'Volume Using Unit Cubes',
  band: 'GRADES_1_8',
  level: 'class-5',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🧊',
  topic: 'Volume of a cuboid',
  shortDescription: 'Stack unit cubes layer by layer to build a cuboid and count its volume.',
  detailedDescription: 'Each layer has length × width cubes. Layers are added one at a time up to the chosen height, showing why volume = length × width × height.',
  learningObjectives: ['Measure volume by counting unit cubes', 'See volume as layers of cubes', 'Use V = l × w × h'],
  formulaOverview: 'Volume = length × width × height (cubic units)',
  parameters: [P.range('l', 'Length', 1, 6, 4), P.range('wd', 'Width', 1, 6, 3), P.range('ht', 'Height', 1, 6, 3)],
  metrics: [
    metric('layer', 'Cubes per layer', (_s, p) => `${p.l} × ${p.wd} = ${p.l * p.wd}`),
    metric('v', 'Volume', (_s, p) => `${p.l * p.wd * p.ht} cubic units`),
  ],
  tags: ['volume', 'cubes', 'class 5'],
  engine: timeEngine((ctx, w, h, s, p) => {
    clear(ctx, w, h, 'Layers of unit cubes');
    const L = Number(p.l);
    const W = Number(p.wd);
    const H = Number(p.ht);
    const layers = Math.min(H, Math.floor(s.t * 1.5) + 1);
    const u = Math.min(w, h) / 14;
    const ox = w / 2 - ((L - W) * u * 0.87) / 2;
    const oy = h * 0.72;
    const iso = (x: number, y: number, z: number): [number, number] => [ox + (x - y) * u * 0.87, oy + (x + y) * u * 0.5 - z * u];
    const face = (pts: Array<[number, number]>, fill: string) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    // painter's order: lower layers first, then far (small x+y) before near
    const cubes: Array<[number, number, number]> = [];
    for (let z = 0; z < layers; z++) for (let x = 0; x < L; x++) for (let y = 0; y < W; y++) cubes.push([x, y, z]);
    cubes.sort((a, b) => a[2] - b[2] || a[0] + a[1] - (b[0] + b[1]));
    for (const [x, y, z] of cubes) {
      const top = z === layers - 1 ? '#93C5FD' : '#BFDBFE';
      face([iso(x, y, z + 1), iso(x + 1, y, z + 1), iso(x + 1, y + 1, z + 1), iso(x, y + 1, z + 1)], top);
      face([iso(x + 1, y, z), iso(x + 1, y + 1, z), iso(x + 1, y + 1, z + 1), iso(x + 1, y, z + 1)], '#60A5FA');
      face([iso(x, y + 1, z), iso(x + 1, y + 1, z), iso(x + 1, y + 1, z + 1), iso(x, y + 1, z + 1)], '#3B82F6');
    }
    text(ctx, `${layers} layer${layers > 1 ? 's' : ''} × ${L * W} cubes = ${layers * L * W} cubes`, w / 2, h * 0.12 + 14, { size: 18, weight: 700, color: C.primary });
    if (s.t > H / 1.5 + 2.5) s.t = 0;
  }),
});

// ───────────────────────── Class 6 ─────────────────────────

export const integersLine = defineSchool({
  id: 'g18-class6-integers-number-line',
  title: 'Integers on a Number Line',
  band: 'GRADES_1_8',
  level: 'class-6',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '➖',
  topic: 'Adding and subtracting integers',
  shortDescription: 'Add and subtract positive and negative numbers by moving along a number line.',
  detailedDescription: 'Adding a positive number moves right; adding a negative number moves left. Subtracting a number is the same as adding its opposite.',
  learningObjectives: ['Place integers on a number line', 'Add and subtract integers', 'Understand that subtracting means adding the opposite'],
  parameters: [P.range('a', 'Start at', -10, 10, -3), P.select('op', 'Operation', [['add', 'Add'], ['sub', 'Subtract']]), P.range('b', 'Number', -10, 10, 5)],
  metrics: [
    metric('res', 'Result', (_s, p) => {
      const b = p.b < 0 ? `(${p.b})` : String(p.b);
      return `${p.a} ${p.op === 'add' ? '+' : '−'} ${b} = ${p.op === 'add' ? p.a + p.b : p.a - p.b}`;
    }),
    metric('rule', 'Same as', (_s, p) => (p.op === 'sub' ? `${p.a} + (${-p.b})` : '—')),
  ],
  tags: ['integers', 'negative numbers', 'class 6'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      clear(ctx, w, h, 'Integer number line');
      const a = Number(p.a);
      const step = p.op === 'add' ? Number(p.b) : -Number(p.b);
      const end = a + step;
      const pos = (s.pos as number) ?? a;
      const x0 = 30;
      const x1 = w - 30;
      const y = h * 0.58;
      const X = (v: number) => x0 + ((v + 20) / 40) * (x1 - x0);
      line(ctx, x0, y, x1, y, C.ink, 2);
      for (let v = -20; v <= 20; v++) {
        line(ctx, X(v), y - (v % 5 === 0 ? 9 : 5), X(v), y + (v % 5 === 0 ? 9 : 5), v === 0 ? C.ink : C.line, v === 0 ? 2.5 : 1);
        if (v % 5 === 0) text(ctx, String(v), X(v), y + 24, { size: 12, color: v < 0 ? C.red : v > 0 ? C.blue : C.ink, weight: 600 });
      }
      if (step !== 0) arrow(ctx, X(a), y - 34, X(end), y - 34, step > 0 ? C.blue : C.red, 3);
      circle(ctx, X(a), y, 6, C.muted);
      circle(ctx, X(pos), y, 10, C.orange, '#fff', 2);
      text(ctx, step > 0 ? `move ${step} right` : step < 0 ? `move ${-step} left` : 'no move', (X(a) + X(end)) / 2, y - 54, { size: 13, weight: 600, color: step >= 0 ? C.blue : C.red });
      text(ctx, `= ${end}`, w / 2, h * 0.2, { size: 36, weight: 700, color: C.primary });
    },
    (s, p, dt) => {
      const a = Number(p.a);
      const end = a + (p.op === 'add' ? Number(p.b) : -Number(p.b));
      if (s.key !== `${a}|${end}`) {
        s.key = `${a}|${end}`;
        s.pos = a;
      }
      s.pos = approach((s.pos as number) ?? a, end, dt, 2.5);
    }
  ),
});

export const symmetry = defineSchool({
  id: 'g18-class6-symmetry',
  title: 'Geometry and Symmetry',
  band: 'GRADES_1_8',
  level: 'class-6',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🪞',
  topic: 'Lines of symmetry and reflection',
  shortDescription: 'Show the lines of symmetry of regular polygons, or reflect a shape in a mirror line.',
  detailedDescription: 'A regular polygon with n sides has n lines of symmetry and rotational symmetry of order n. In mirror mode, a shape and its reflection are always the same distance from the mirror.',
  learningObjectives: ['Identify lines of symmetry', 'Find the order of rotational symmetry', 'Reflect a shape in a line'],
  parameters: [P.select('mode', 'Explore', [['lines', 'Lines of symmetry'], ['mirror', 'Mirror reflection']]), P.range('n', 'Polygon sides', 3, 10, 6), P.range('shift', 'Shape distance from mirror', 0, 100, 40, 1, '%')],
  metrics: [
    metric('lines', 'Lines of symmetry', (_s, p) => (p.mode === 'lines' ? String(p.n) : '—')),
    metric('rot', 'Rotational order', (_s, p) => (p.mode === 'lines' ? String(p.n) : '—')),
  ],
  tags: ['symmetry', 'reflection', 'geometry', 'class 6'],
  engine: timeEngine((ctx, w, h, s, p) => {
    clear(ctx, w, h, p.mode === 'lines' ? 'Lines of symmetry' : 'Reflection in a mirror line');
    const cx = w / 2;
    const cy = h * 0.53;
    if (p.mode === 'lines') {
      const n = Number(p.n);
      const R = Math.min(w, h) * 0.32;
      const rot = s.t * 0.3;
      const pts = Array.from({ length: n }, (_, i): [number, number] => [cx + R * Math.cos(rot - Math.PI / 2 + (i * 2 * Math.PI) / n), cy + R * Math.sin(rot - Math.PI / 2 + (i * 2 * Math.PI) / n)]);
      ctx.fillStyle = '#EDE9FE';
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 3;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < n; i++) {
        const a = rot - Math.PI / 2 + (i * Math.PI) / n;
        line(ctx, cx - R * 1.2 * Math.cos(a), cy - R * 1.2 * Math.sin(a), cx + R * 1.2 * Math.cos(a), cy + R * 1.2 * Math.sin(a), C.red, 1.5, [6, 5]);
      }
    } else {
      const mx = w / 2;
      line(ctx, mx, h * 0.12, mx, h * 0.92, C.ink, 3);
      text(ctx, 'mirror', mx + 30, h * 0.14, { size: 12, color: C.muted });
      const d = 20 + (Number(p.shift) / 100) * (w * 0.3);
      const shape: Array<[number, number]> = [
        [0, -60],
        [50, 30],
        [10, 50],
        [-20, 10],
      ];
      const draw = (sign: number, color: string, fill: string) => {
        ctx.beginPath();
        shape.forEach(([x, y], i) => {
          const px = mx + sign * (d + 40 + x * 0.9);
          const py = cy + y;
          if (i) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      };
      draw(-1, C.blue, '#DBEAFE');
      draw(1, C.orange, '#FFEDD5');
      shape.forEach(([x, y]) => {
        const xl = mx - (d + 40 + x * 0.9);
        const xr = mx + (d + 40 + x * 0.9);
        line(ctx, xl, cy + y, xr, cy + y, C.line, 1, [3, 4]);
      });
      text(ctx, 'Each point and its image are the same distance from the mirror', w / 2, h * 0.96 - 6, { size: 13, color: C.muted });
    }
  }),
});

// ───────────────────────── Class 7 ─────────────────────────

export const ratioProportion = defineSchool({
  id: 'g18-class7-ratio-proportion',
  title: 'Ratio and Proportion',
  band: 'GRADES_1_8',
  level: 'class-7',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '⚖️',
  topic: 'Sharing in a ratio',
  shortDescription: 'Share a quantity in a given ratio using a bar model and see the value of one part.',
  detailedDescription: 'The ratio a : b splits the bar into a + b equal parts. Dividing the total by the number of parts gives one part; each share is then found by multiplying.',
  learningObjectives: ['Simplify a ratio', 'Divide a quantity in a given ratio', 'Use the unitary method'],
  formulaOverview: 'one part = total ÷ (a + b);  shares = a × one part, b × one part',
  parameters: [P.range('a', 'Ratio first term', 1, 10, 3), P.range('b', 'Ratio second term', 1, 10, 2), P.range('total', 'Total to share', 10, 500, 250, 5)],
  metrics: [
    metric('simp', 'Simplest ratio', (_s, p) => {
      const g = gcd(p.a, p.b);
      return `${p.a / g} : ${p.b / g}`;
    }),
    metric('part', 'One part', (_s, p) => fmt(p.total / (p.a + p.b))),
    metric('shares', 'Shares', (_s, p) => `${fmt((p.total * p.a) / (p.a + p.b))} and ${fmt((p.total * p.b) / (p.a + p.b))}`),
  ],
  tags: ['ratio', 'proportion', 'class 7'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Bar model');
    const a = Number(p.a);
    const b = Number(p.b);
    const total = Number(p.total);
    const parts = a + b;
    const bw = w * 0.8;
    const x = (w - bw) / 2;
    const y = h * 0.4;
    const bh = Math.min(60, h * 0.14);
    for (let i = 0; i < parts; i++) {
      roundRect(ctx, x + (i * bw) / parts + 1, y, bw / parts - 2, bh, 4, i < a ? '#BFDBFE' : '#FED7AA', i < a ? C.blue : C.orange);
      text(ctx, fmt(total / parts, 1), x + ((i + 0.5) * bw) / parts, y + bh / 2, { size: 11, color: C.ink });
    }
    const brace = (x1: number, x2: number, label: string, color: string) => {
      line(ctx, x1 + 2, y + bh + 14, x2 - 2, y + bh + 14, color, 2);
      line(ctx, x1 + 2, y + bh + 8, x1 + 2, y + bh + 14, color, 2);
      line(ctx, x2 - 2, y + bh + 8, x2 - 2, y + bh + 14, color, 2);
      text(ctx, label, (x1 + x2) / 2, y + bh + 34, { size: 15, weight: 700, color });
    };
    brace(x, x + (a * bw) / parts, `${a} parts = ${fmt((total * a) / parts)}`, C.blue);
    brace(x + (a * bw) / parts, x + bw, `${b} parts = ${fmt((total * b) / parts)}`, C.orange);
    line(ctx, x, y - 16, x + bw, y - 16, C.ink, 1.5);
    text(ctx, `Total ${total}  ·  ratio ${a} : ${b}  ·  ${parts} equal parts`, w / 2, y - 34, { size: 15, weight: 600, color: C.primary });
  }),
});

export const linesAngles = defineSchool({
  id: 'g18-class7-lines-angles',
  title: 'Lines and Angles',
  band: 'GRADES_1_8',
  level: 'class-7',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '⫽',
  topic: 'Parallel lines and a transversal',
  shortDescription: 'Turn a transversal across two parallel lines and compare corresponding, alternate and co-interior angles.',
  detailedDescription: 'When a transversal crosses parallel lines, corresponding angles are equal, alternate interior angles are equal and co-interior angles add up to 180°.',
  learningObjectives: ['Identify pairs of angles formed by a transversal', 'Use angle properties of parallel lines', 'Find unknown angles'],
  parameters: [
    P.range('ang', 'Transversal angle', 20, 160, 60, 1, '°'),
    P.select('pair', 'Highlight', [['corresponding', 'Corresponding angles'], ['alternate', 'Alternate interior angles'], ['cointerior', 'Co-interior angles']]),
  ],
  metrics: [
    metric('x', 'Angle x', (_s, p) => `${p.ang}°`),
    metric('rel', 'Relationship', (_s, p) => (p.pair === 'cointerior' ? `${p.ang}° + ${180 - p.ang}° = 180°` : `both ${p.ang}°`)),
  ],
  tags: ['lines', 'angles', 'parallel lines', 'class 7'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Parallel lines cut by a transversal');
    const th = (Number(p.ang) * Math.PI) / 180;
    const y1 = h * 0.35;
    const y2 = h * 0.68;
    line(ctx, 30, y1, w - 30, y1, C.ink, 2.5);
    line(ctx, 30, y2, w - 30, y2, C.ink, 2.5);
    text(ctx, '▶', w - 40, y1, { size: 10 });
    text(ctx, '▶', w - 40, y2, { size: 10 });
    const cx = w / 2;
    const dx = (y2 - y1) / Math.tan(th);
    // upper crossing to the right, so the angle between the parallel line (pointing right) and the
    // transversal (pointing up) is exactly the chosen angle
    const P1: [number, number] = [cx + dx / 2, y1];
    const P2: [number, number] = [cx - dx / 2, y2];
    const ux = P1[0] - P2[0];
    const uy = P1[1] - P2[1];
    line(ctx, P2[0] - ux * 0.8, P2[1] - uy * 0.8, P1[0] + ux * 0.8, P1[1] + uy * 0.8, C.violet, 2.5);
    const up = Math.atan2(uy, ux); // in (−π, 0)
    const down = up + Math.PI;
    const wedge = (P: [number, number], a0: number, a1: number, color: string, label: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(P[0], P[1]);
      ctx.arc(P[0], P[1], 34, a0, a1, a1 < a0);
      ctx.closePath();
      ctx.fill();
      const m = (a0 + a1) / 2;
      text(ctx, label, P[0] + 54 * Math.cos(m), P[1] + 54 * Math.sin(m), { size: 13, weight: 700 });
    };
    const A = Number(p.ang);
    const blue = 'rgba(37,99,235,0.35)';
    const orange = 'rgba(234,88,12,0.35)';
    if (p.pair === 'corresponding') {
      wedge(P1, 0, up, blue, `${A}°`); // above-right at the upper crossing
      wedge(P2, 0, up, orange, `${A}°`); // above-right at the lower crossing
    } else if (p.pair === 'alternate') {
      wedge(P1, Math.PI, down, blue, `${A}°`); // below-left at the upper crossing
      wedge(P2, 0, up, orange, `${A}°`); // above-right at the lower crossing
    } else {
      wedge(P1, 0, down, blue, `${180 - A}°`); // below-right at the upper crossing
      wedge(P2, 0, up, orange, `${A}°`); // above-right at the lower crossing
    }
    circle(ctx, P1[0], P1[1], 4, C.ink);
    circle(ctx, P2[0], P2[1], 4, C.ink);
  }),
});

// ───────────────────────── Class 8 ─────────────────────────

export const linearEquations = defineSchool({
  id: 'g18-class8-linear-equations',
  title: 'Linear Equations on a Balance',
  band: 'GRADES_1_8',
  level: 'class-8',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '⚖️',
  topic: 'Solving ax + b = c',
  shortDescription: 'Try values of x on a balance scale until both sides of the equation weigh the same.',
  detailedDescription: 'The left pan holds ax + b, the right pan holds c. The scale tips towards the heavier side. When it balances, the value of x solves the equation; the algebraic steps are shown alongside.',
  learningObjectives: ['Understand an equation as a balance', 'Solve linear equations in one variable', 'Check a solution by substitution'],
  formulaOverview: 'ax + b = c  ⇒  ax = c − b  ⇒  x = (c − b) ÷ a',
  parameters: [P.range('a', 'a (coefficient of x)', 1, 9, 3), P.range('b', 'b', -10, 10, 4), P.range('c', 'c', -20, 40, 19), P.range('x', 'Try x =', -10, 15, 2, 0.5)],
  metrics: [
    metric('lhs', 'Left side (ax + b)', (_s, p) => fmt(p.a * p.x + p.b)),
    metric('rhs', 'Right side (c)', (_s, p) => String(p.c)),
    metric('sol', 'Solution', (_s, p) => `x = ${fmt((p.c - p.b) / p.a, 3)}`),
  ],
  tags: ['linear equations', 'algebra', 'class 8'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      clear(ctx, w, h, 'Balance the equation');
      const lhs = p.a * p.x + p.b;
      const tilt = (s.tilt as number) ?? 0;
      const cx = w / 2;
      const py = h * 0.36;
      const arm = Math.min(w * 0.32, 260);
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(cx, py);
      ctx.lineTo(cx - 40, h * 0.8);
      ctx.lineTo(cx + 40, h * 0.8);
      ctx.closePath();
      ctx.fill();
      const lx = cx - arm * Math.cos(tilt);
      const ly = py + arm * Math.sin(tilt);
      const rx = cx + arm * Math.cos(tilt);
      const ry = py - arm * Math.sin(tilt);
      line(ctx, lx, ly, rx, ry, C.ink, 6);
      const pan = (x: number, y: number, label: string, color: string) => {
        line(ctx, x, y, x - 50, y + 60, C.muted, 1.5);
        line(ctx, x, y, x + 50, y + 60, C.muted, 1.5);
        roundRect(ctx, x - 70, y + 60, 140, 14, 7, color);
        text(ctx, label, x, y + 96, { size: 18, weight: 700, color: C.ink });
      };
      const bs = p.b >= 0 ? `+ ${p.b}` : `− ${-p.b}`;
      pan(lx, ly, `${p.a}x ${bs} = ${fmt(lhs)}`, '#93C5FD');
      pan(rx, ry, `${p.c}`, '#FDBA74');
      const sol = (p.c - p.b) / p.a;
      const balanced = Math.abs(lhs - p.c) < 1e-9;
      text(ctx, balanced ? `Balanced: x = ${fmt(p.x)} is the solution` : lhs > p.c ? 'Left side is heavier — try a smaller x' : 'Right side is heavier — try a larger x', w / 2, h * 0.12 + 12, {
        size: 17,
        weight: 700,
        color: balanced ? C.green : C.orange,
      });
      text(ctx, `${p.a}x ${bs} = ${p.c}  →  ${p.a}x = ${p.c - p.b}  →  x = ${fmt(sol, 3)}`, w / 2, h * 0.93, { size: 14, color: C.muted, weight: 600 });
    },
    (s, p, dt) => {
      const diff = p.a * p.x + p.b - p.c;
      const target = Math.max(-0.35, Math.min(0.35, -diff * 0.03));
      s.tilt = approach((s.tilt as number) ?? 0, target, dt, 4);
    }
  ),
});

export const mensuration = defineSchool({
  id: 'g18-class8-mensuration',
  title: 'Mensuration Explorer',
  band: 'GRADES_1_8',
  level: 'class-8',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🥫',
  topic: 'Surface area and volume of solids',
  shortDescription: 'Change the dimensions of a cuboid, cylinder, cone or sphere and see its surface area and volume.',
  detailedDescription: 'Pick a solid and adjust its measurements. The drawing and the surface area and volume update together, using the standard formulae.',
  learningObjectives: ['Use formulae for surface area and volume', 'Compare how dimensions affect volume', 'Apply mensuration to real objects'],
  formulaOverview: 'Cuboid V = lbh; Cylinder V = πr²h; Cone V = ⅓πr²h; Sphere V = 4/3 πr³',
  parameters: [
    P.select('solid', 'Solid', [['cuboid', 'Cuboid'], ['cylinder', 'Cylinder'], ['cone', 'Cone'], ['sphere', 'Sphere']]),
    P.range('r', 'Radius / length', 1, 10, 4, 0.5, 'cm'),
    P.range('h', 'Height', 1, 15, 8, 0.5, 'cm'),
    P.range('b', 'Breadth (cuboid)', 1, 10, 3, 0.5, 'cm'),
  ],
  metrics: [
    metric('sa', 'Surface area', (_s, p) => {
      const { r, h, b } = p;
      const v = p.solid === 'cuboid' ? 2 * (r * b + b * h + r * h) : p.solid === 'cylinder' ? 2 * Math.PI * r * (r + h) : p.solid === 'cone' ? Math.PI * r * (r + Math.hypot(r, h)) : 4 * Math.PI * r * r;
      return `${fmt(v)} cm²`;
    }),
    metric('vol', 'Volume', (_s, p) => {
      const { r, h, b } = p;
      const v = p.solid === 'cuboid' ? r * b * h : p.solid === 'cylinder' ? Math.PI * r * r * h : p.solid === 'cone' ? (Math.PI * r * r * h) / 3 : (4 / 3) * Math.PI * r ** 3;
      return `${fmt(v)} cm³`;
    }),
  ],
  tags: ['mensuration', 'surface area', 'volume', 'class 8'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Solids');
    const k = Math.min(w, h) / 34;
    const cx = w / 2;
    const base = h * 0.78;
    const r = p.r * k;
    const H = p.h * k;
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.primary;
    if (p.solid === 'cuboid') {
      const L = r * 1.6;
      const B = p.b * k * 0.9;
      const off = B * 0.6;
      ctx.fillStyle = '#DBEAFE';
      ctx.fillRect(cx - L / 2, base - H, L, H);
      ctx.strokeRect(cx - L / 2, base - H, L, H);
      ctx.fillStyle = '#BFDBFE';
      ctx.beginPath();
      ctx.moveTo(cx - L / 2, base - H);
      ctx.lineTo(cx - L / 2 + off, base - H - off);
      ctx.lineTo(cx + L / 2 + off, base - H - off);
      ctx.lineTo(cx + L / 2, base - H);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#93C5FD';
      ctx.beginPath();
      ctx.moveTo(cx + L / 2, base - H);
      ctx.lineTo(cx + L / 2 + off, base - H - off);
      ctx.lineTo(cx + L / 2 + off, base - off);
      ctx.lineTo(cx + L / 2, base);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      text(ctx, `l = ${p.r} cm`, cx, base + 18, { size: 13, color: C.primary, weight: 600 });
      text(ctx, `b = ${p.b} cm`, cx + L / 2 + off / 2 + 34, base - off / 2, { size: 13, color: C.primary, weight: 600 });
    } else if (p.solid === 'cylinder' || p.solid === 'cone') {
      const ry = r * 0.3;
      ctx.fillStyle = '#DCFCE7';
      ctx.beginPath();
      if (p.solid === 'cylinder') {
        ctx.moveTo(cx - r, base - H);
        ctx.lineTo(cx - r, base);
        ctx.ellipse(cx, base, r, ry, 0, Math.PI, 0, true);
        ctx.lineTo(cx + r, base - H);
      } else {
        ctx.moveTo(cx, base - H);
        ctx.lineTo(cx - r, base);
        ctx.ellipse(cx, base, r, ry, 0, Math.PI, 0, true);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      if (p.solid === 'cylinder') {
        ctx.beginPath();
        ctx.ellipse(cx, base - H, r, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#BBF7D0';
        ctx.fill();
        ctx.stroke();
      }
      line(ctx, cx, base, cx + r, base, C.red, 2);
      text(ctx, `r = ${p.r} cm`, cx + r / 2, base + 18, { size: 13, color: C.red, weight: 600 });
      line(ctx, cx, base, cx, base - H, C.orange, 2, [5, 4]);
      text(ctx, `h = ${p.h} cm`, cx + 40, base - H / 2, { size: 13, color: C.orange, weight: 600 });
    } else {
      const g = ctx.createRadialGradient(cx - r * 0.35, base - r - r * 0.35, r * 0.1, cx, base - r, r);
      g.addColorStop(0, '#FDF4FF');
      g.addColorStop(1, '#D8B4FE');
      circle(ctx, cx, base - r, r, undefined, C.violet, 2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, base - r, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, base - r, r, r * 0.25, 0, 0, Math.PI * 2);
      ctx.strokeStyle = C.violet;
      ctx.stroke();
      line(ctx, cx, base - r, cx + r, base - r, C.red, 2);
      text(ctx, `r = ${p.r} cm`, cx + r / 2, base - r - 12, { size: 13, color: C.red, weight: 600 });
    }
  }),
});

// ───────────────────────── Science samples ─────────────────────────

export const dayNight = defineSchool({
  id: 'g18-class5-day-night',
  title: 'Day and Night',
  band: 'GRADES_1_8',
  level: 'class-5',
  subject: 'Science',
  category: 'school science',
  icon: '🌍',
  topic: 'Rotation of the Earth',
  shortDescription: 'Watch the Earth spin in sunlight and follow a place on it from sunrise to night.',
  detailedDescription: 'The Sun lights one half of the Earth at a time. As the Earth rotates once in about 24 hours, a place moves from day into night and back.',
  learningObjectives: ['Explain day and night by the rotation of the Earth', 'Know that one rotation takes about 24 hours', 'Describe sunrise and sunset'],
  parameters: [P.range('speed', 'Rotation speed', 0.2, 3, 1, 0.1, '×'), P.range('lon', 'Your place on Earth', 0, 360, 0, 5, '°')],
  metrics: [
    metric('time', 'Local time', (s) => {
      const hrs = ((((s as { hour?: number }).hour ?? 12) % 24) + 24) % 24;
      return `${String(Math.floor(hrs)).padStart(2, '0')}:${String(Math.floor((hrs % 1) * 60)).padStart(2, '0')}`;
    }),
    metric('dn', 'Day or night', (s) => {
      const hrs = (((s as { hour?: number }).hour ?? 12) % 24 + 24) % 24;
      return hrs >= 6 && hrs < 18 ? 'Day ☀️' : 'Night 🌙';
    }),
  ],
  tags: ['earth', 'rotation', 'day and night', 'class 5', 'science'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      ctx.fillStyle = '#0B1220';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) circle(ctx, (i * 97) % w, (i * 53) % h, (i % 3) * 0.5 + 0.4, 'rgba(255,255,255,0.6)');
      const sunX = w * 0.1;
      const cy = h / 2;
      const g = ctx.createRadialGradient(sunX, cy, 10, sunX, cy, h * 0.35);
      g.addColorStop(0, '#FEF08A');
      g.addColorStop(0.4, '#FBBF24');
      g.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w * 0.4, h);
      for (let i = 0; i < 5; i++) arrow(ctx, w * 0.22, cy - h * 0.25 + i * h * 0.125, w * 0.38, cy - h * 0.25 + i * h * 0.125, 'rgba(253,224,71,0.7)', 2);
      const ex = w * 0.62;
      const R = Math.min(w, h) * 0.3;
      circle(ctx, ex, cy, R, '#1D4ED8');
      // land patches rotate with the Earth
      const rot = (s.rot as number) ?? 0;
      for (let i = 0; i < 5; i++) {
        const a = rot + i * 1.3;
        const x = ex + R * 0.7 * Math.cos(a);
        const vis = Math.sin(a) > -0.2;
        if (vis) {
          ctx.fillStyle = '#16A34A';
          ctx.beginPath();
          ctx.ellipse(x, cy + (i - 2) * R * 0.28, R * 0.18 * Math.abs(Math.sin(a)) + 4, R * 0.12, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // night side
      ctx.fillStyle = 'rgba(2,6,23,0.6)';
      ctx.beginPath();
      ctx.arc(ex, cy, R, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      // observer: angle measured from the sub-solar point (facing the Sun = noon)
      const ang = rot + (p.lon * Math.PI) / 180;
      const ox = ex - R * Math.cos(ang);
      const oy = cy - R * 0.55 * Math.sin(ang);
      const front = Math.cos(ang) > -1;
      if (front) {
        circle(ctx, ox, oy, 8, '#F97316', '#fff', 2);
        text(ctx, 'You', ox, oy - 18, { size: 12, weight: 700, color: '#fff' });
      }
      text(ctx, 'Sun', sunX, cy + h * 0.2, { size: 14, weight: 700, color: '#FDE68A' });
      text(ctx, 'Day side', ex - R * 0.5, cy + R + 22, { size: 13, color: '#FDE68A', weight: 600 });
      text(ctx, 'Night side', ex + R * 0.5, cy + R + 22, { size: 13, color: '#93C5FD', weight: 600 });
    },
    (s, p, dt) => {
      s.rot = (((s.rot as number) ?? 0) + dt * 0.5 * Number(p.speed)) % (Math.PI * 2);
      const ang = (s.rot as number) + (Number(p.lon) * Math.PI) / 180;
      // facing the sun (ang = 0) = 12:00; a quarter turn = 6 hours
      s.hour = 12 + (ang / (Math.PI * 2)) * 24;
    }
  ),
});

export const MATH_MIDDLE = [areaPerimeter, volumeCubes, integersLine, symmetry, ratioProportion, linesAngles, linearEquations, mensuration];
export const SCIENCE_JUNIOR = [dayNight];
