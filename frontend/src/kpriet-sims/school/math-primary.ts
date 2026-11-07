/** Grades 1–8 sample simulations: Mathematics, Classes 1–4. */
import { C, P, PALETTE, approach, circle, clear, defineSchool, fmt, gcd, line, metric, roundRect, text, timeEngine, type TimeState } from './kit';

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

function drawObject(ctx: CanvasRenderingContext2D, kind: string, x: number, y: number, r: number, color: string) {
  if (kind === 'star') {
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'apple') {
    circle(ctx, x, y + r * 0.1, r * 0.9, C.red);
    line(ctx, x, y - r * 0.7, x + r * 0.2, y - r * 1.05, '#7C2D12', 2);
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.ellipse(x + r * 0.45, y - r * 0.85, r * 0.35, r * 0.18, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    circle(ctx, x, y, r * 0.9, color, '#ffffff', 2);
  }
}

/** Ten-frames: 2 rows × 5, as many frames as needed. Returns slot centres. */
function tenFrameSlots(n: number, x: number, y: number, cell: number) {
  const frames = Math.max(1, Math.ceil(n / 10));
  const slots: Array<{ x: number; y: number; frame: number }> = [];
  for (let f = 0; f < frames; f++) {
    for (let i = 0; i < 10; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      slots.push({ x: x + f * (cell * 5 + 24) + col * cell + cell / 2, y: y + row * cell + cell / 2, frame: f });
    }
  }
  return { slots, frames };
}

// ───────────────────────── Class 1 ─────────────────────────

export const counting = defineSchool({
  id: 'g18-class1-counting',
  title: 'Counting and Number Recognition',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🔢',
  topic: 'Numbers 1 to 20',
  shortDescription: 'Count objects arranged in ten-frames and match the quantity to its numeral and number name.',
  detailedDescription: 'Choose how many objects to show. They fill ten-frames one by one so learners can count, see "ten and some more", and connect the quantity with the numeral and the word.',
  learningObjectives: ['Count objects up to 20', 'Recognise numerals 1–20', 'Read and say number names', 'See numbers above 10 as ten and some more'],
  parameters: [
    P.range('count', 'How many?', 1, 20, 7),
    P.select('kind', 'Objects', [['apple', 'Apples'], ['star', 'Stars'], ['ball', 'Balls']]),
  ],
  metrics: [
    metric('n', 'Number', (_s, p) => String(p.count)),
    metric('word', 'Number name', (_s, p) => WORDS[p.count] ?? ''),
    metric('tens', 'Tens and ones', (_s, p) => `${Math.floor(p.count / 10)} ten, ${p.count % 10} ones`),
  ],
  tags: ['counting', 'numbers', 'ten frame', 'class 1'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      clear(ctx, w, h, 'Count the objects');
      const cell = Math.min(54, (w - 80) / 11.5);
      const total = Number(p.count);
      const { slots, frames } = tenFrameSlots(total, 0, 0, cell);
      const frameW = frames * cell * 5 + (frames - 1) * 24;
      const ox = (w - frameW) / 2;
      const oy = h * 0.22;
      for (let f = 0; f < frames; f++) roundRect(ctx, ox + f * (cell * 5 + 24) - 4, oy - 4, cell * 5 + 8, cell * 2 + 8, 8, '#fff', C.line, 2);
      for (let f = 0; f < frames; f++)
        for (let i = 1; i < 5; i++) line(ctx, ox + f * (cell * 5 + 24) + i * cell, oy, ox + f * (cell * 5 + 24) + i * cell, oy + cell * 2, C.grid, 1);
      const shown = Math.min(total, Math.floor(s.t * 4) + 1);
      for (let i = 0; i < shown; i++) {
        const sl = slots[i];
        if (!sl) break;
        drawObject(ctx, p.kind, ox + sl.x, oy + sl.y, cell * 0.36, PALETTE[i % PALETTE.length] ?? C.blue);
        text(ctx, String(i + 1), ox + sl.x, oy + sl.y + cell * 0.42, { size: 10, color: C.muted });
      }
      const big = Math.min(h * 0.22, 96);
      text(ctx, String(shown), w / 2, oy + cell * 2 + 30 + big / 2, { size: big, weight: 700, color: C.primary });
      text(ctx, WORDS[shown] ?? '', w / 2, oy + cell * 2 + 46 + big, { size: 22, weight: 600, color: C.muted });
    }
  ),
});

export const additionObjects = defineSchool({
  id: 'g18-class1-addition-objects',
  title: 'Addition with Objects',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '➕',
  topic: 'Adding small numbers',
  shortDescription: 'Put two groups of objects together and count all of them to find the sum.',
  detailedDescription: 'Two coloured groups slide together into one group. Learners count on from the first group and read the addition sentence.',
  learningObjectives: ['Understand addition as putting together', 'Count on to add', 'Write an addition sentence'],
  parameters: [P.range('a', 'First group', 0, 10, 4), P.range('b', 'Second group', 0, 10, 3), P.toggle('join', 'Put the groups together', true)],
  metrics: [metric('sum', 'Sum', (_s, p) => `${p.a} + ${p.b} = ${p.a + p.b}`)],
  tags: ['addition', 'class 1'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      clear(ctx, w, h, 'Put together and count');
      const a = Number(p.a);
      const b = Number(p.b);
      const k = (s.k as number) ?? 0;
      const r = Math.min(22, w / 40);
      const gap = r * 2.6;
      const cy = h * 0.42;
      const leftX = w * 0.25;
      const rightX = w * 0.75;
      const drawGroup = (n: number, cx: number, color: string, offset: number) => {
        for (let i = 0; i < n; i++) {
          const col = i % 5;
          const row = Math.floor(i / 5);
          circle(ctx, cx - gap * 2 + col * gap + offset, cy - gap / 2 + row * gap, r, color, '#fff', 2);
        }
      };
      // joined: groups meet in the middle
      const shift = k * (w * 0.25 - gap * 2.6);
      drawGroup(a, leftX, C.blue, shift);
      drawGroup(b, rightX, C.orange, -shift);
      if (k < 0.5) {
        text(ctx, String(a), leftX, cy + gap * 1.6, { size: 26, weight: 700, color: C.blue });
        text(ctx, String(b), rightX, cy + gap * 1.6, { size: 26, weight: 700, color: C.orange });
      }
      const sentence = `${a} + ${b} = ${k > 0.95 ? a + b : '?'}`;
      text(ctx, sentence, w / 2, h * 0.8, { size: Math.min(48, w / 14), weight: 700, color: C.primary });
    },
    (s, p, dt) => {
      s.k = approach((s.k as number) ?? 0, p.join ? 1 : 0, dt, 3);
    }
  ),
});

// ───────────────────────── Class 2 ─────────────────────────

export const placeValue = defineSchool({
  id: 'g18-class2-place-value',
  title: 'Place Value',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🧱',
  topic: 'Hundreds, tens and ones',
  shortDescription: 'Build a number with hundred-flats, ten-rods and unit cubes and read its expanded form.',
  detailedDescription: 'Move the slider to choose a number up to 999. Base-ten blocks show how many hundreds, tens and ones it has, and the expanded form updates.',
  learningObjectives: ['Identify the place value of each digit', 'Represent numbers with base-ten blocks', 'Write numbers in expanded form'],
  parameters: [P.range('n', 'Number', 0, 999, 245)],
  metrics: [
    metric('h', 'Hundreds', (_s, p) => String(Math.floor(p.n / 100))),
    metric('t', 'Tens', (_s, p) => String(Math.floor((p.n % 100) / 10))),
    metric('o', 'Ones', (_s, p) => String(p.n % 10)),
    metric('exp', 'Expanded form', (_s, p) => `${Math.floor(p.n / 100) * 100} + ${Math.floor((p.n % 100) / 10) * 10} + ${p.n % 10}`),
  ],
  tags: ['place value', 'base ten', 'class 2'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Base-ten blocks');
    const n = Number(p.n);
    const H = Math.floor(n / 100);
    const T = Math.floor((n % 100) / 10);
    const O = n % 10;
    const u = Math.max(4, Math.min(9, (w - 120) / 70));
    const top = h * 0.16;
    const colW = w / 3;
    const heads: Array<[string, string, number]> = [
      ['Hundreds', C.blue, H],
      ['Tens', C.green, T],
      ['Ones', C.orange, O],
    ];
    heads.forEach(([label, color, d], i) => {
      roundRect(ctx, i * colW + 8, top - 8, colW - 16, h * 0.62, 10, '#fff', C.grid);
      text(ctx, label, i * colW + colW / 2, top + 10, { size: 13, weight: 600, color });
      text(ctx, String(d), i * colW + colW / 2, top + h * 0.62 - 26, { size: 34, weight: 700, color });
    });
    const by = top + 30;
    // hundreds: 10×10 flats
    for (let k = 0; k < H; k++) {
      const x = 20 + (k % 3) * (u * 10 + 6);
      const y = by + Math.floor(k / 3) * (u * 10 + 6);
      roundRect(ctx, x, y, u * 10, u * 10, 2, '#DBEAFE', C.blue);
      for (let g = 1; g < 10; g++) {
        line(ctx, x + g * u, y, x + g * u, y + u * 10, '#93C5FD', 0.6);
        line(ctx, x, y + g * u, x + u * 10, y + g * u, '#93C5FD', 0.6);
      }
    }
    for (let k = 0; k < T; k++) {
      const x = colW + 20 + k * (u + 6);
      roundRect(ctx, x, by, u, u * 10, 2, '#DCFCE7', C.green);
      for (let g = 1; g < 10; g++) line(ctx, x, by + g * u, x + u, by + g * u, '#86EFAC', 0.6);
    }
    for (let k = 0; k < O; k++) roundRect(ctx, 2 * colW + 24 + (k % 5) * (u * 1.8), by + Math.floor(k / 5) * (u * 1.8), u, u, 2, '#FFEDD5', C.orange);
    const digits = String(n).padStart(3, '0');
    text(ctx, `${n}  =  ${H * 100} + ${T * 10} + ${O}`, w / 2, h * 0.9, { size: Math.min(30, w / 22), weight: 700, color: C.primary });
    void digits;
  }),
});

export const addSubtract = defineSchool({
  id: 'g18-class2-add-subtract',
  title: 'Addition and Subtraction on a Number Line',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '↔️',
  topic: 'Adding and subtracting within 100',
  shortDescription: 'Jump forwards to add and backwards to subtract on a number line, in tens and then ones.',
  detailedDescription: 'Start at the first number and make jumps of ten, then jumps of one. Adding moves right; subtracting moves left. The column method is shown beside the jumps.',
  learningObjectives: ['Add and subtract two-digit numbers', 'Use jumps of tens and ones', 'Relate addition and subtraction'],
  parameters: [P.select('op', 'Operation', [['add', 'Add (+)'], ['sub', 'Subtract (−)']]), P.range('a', 'Start number', 0, 99, 38), P.range('b', 'Change by', 0, 60, 24)],
  metrics: [
    metric('res', 'Answer', (_s, p) => {
      const r = p.op === 'add' ? p.a + p.b : p.a - p.b;
      return `${p.a} ${p.op === 'add' ? '+' : '−'} ${p.b} = ${r}`;
    }),
  ],
  tags: ['addition', 'subtraction', 'number line', 'class 2'],
  engine: timeEngine((ctx, w, h, s, p) => {
    clear(ctx, w, h, 'Jumps on the number line');
    const a = Number(p.a);
    const b = Number(p.b);
    const sign = p.op === 'add' ? 1 : -1;
    const end = a + sign * b;
    const lo = Math.max(-60, Math.min(a, end) - 5);
    const hi = Math.max(a, end) + 5;
    const x0 = 40;
    const x1 = w - 40;
    const y = h * 0.6;
    const X = (v: number) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
    line(ctx, x0, y, x1, y, C.ink, 2);
    for (let v = Math.ceil(lo); v <= hi; v++) {
      const big = v % 10 === 0;
      line(ctx, X(v), y - (big ? 10 : 5), X(v), y + (big ? 10 : 5), big ? C.ink : C.line, big ? 2 : 1);
      if (big || v === a || v === end) text(ctx, String(v), X(v), y + 24, { size: 12, color: v === a || v === end ? C.primary : C.muted, weight: v === a || v === end ? 700 : 500 });
    }
    const jumps: Array<[number, number, string]> = [];
    let cur = a;
    for (let i = 0; i < Math.floor(b / 10); i++) {
      jumps.push([cur, cur + sign * 10, C.blue]);
      cur += sign * 10;
    }
    for (let i = 0; i < b % 10; i++) {
      jumps.push([cur, cur + sign, C.orange]);
      cur += sign;
    }
    const shown = Math.min(jumps.length, Math.floor(s.t * 3));
    jumps.slice(0, shown).forEach(([f, t, col]) => {
      const mx = (X(f) + X(t)) / 2;
      const rad = Math.abs(X(t) - X(f)) / 2;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, y, rad, Math.PI, 0);
      ctx.stroke();
    });
    circle(ctx, X(a), y, 6, C.primary);
    if (shown >= jumps.length) circle(ctx, X(end), y, 6, C.green);
    text(ctx, `${a} ${sign > 0 ? '+' : '−'} ${b} = ${shown >= jumps.length ? end : '…'}`, w / 2, h * 0.22, { size: Math.min(40, w / 16), weight: 700, color: C.primary });
    text(ctx, `${Math.floor(b / 10)} jump(s) of 10 (blue) and ${b % 10} jump(s) of 1 (orange)`, w / 2, h * 0.32, { size: 13, color: C.muted });
    if (s.t > jumps.length / 3 + 2) s.t = 0; // replay
  }),
});

// ───────────────────────── Class 3 ─────────────────────────

export const multiplicationArrays = defineSchool({
  id: 'g18-class3-multiplication-arrays',
  title: 'Multiplication Arrays',
  band: 'GRADES_1_8',
  level: 'class-3',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '✖️',
  topic: 'Multiplication as equal rows',
  shortDescription: 'Arrange dots in equal rows to see multiplication as repeated addition, and turn the array to see that order does not matter.',
  detailedDescription: 'Choose the number of rows and the number in each row. The array shows the product, the repeated addition and, when turned, the same product the other way round.',
  learningObjectives: ['Model multiplication with arrays', 'Link multiplication to repeated addition', 'Notice that a × b = b × a'],
  parameters: [P.range('rows', 'Rows', 1, 10, 3), P.range('cols', 'In each row', 1, 10, 4), P.toggle('turn', 'Turn the array')],
  metrics: [
    metric('prod', 'Product', (_s, p) => `${p.rows} × ${p.cols} = ${p.rows * p.cols}`),
    metric('rep', 'Repeated addition', (_s, p) => Array(p.rows).fill(p.cols).join(' + ')),
  ],
  tags: ['multiplication', 'arrays', 'class 3'],
  engine: timeEngine(
    (ctx, w, h, s, p) => {
      clear(ctx, w, h, 'Equal rows');
      const k = (s.k as number) ?? 0;
      const R = Number(p.rows);
      const Cc = Number(p.cols);
      const cell = Math.min((w * 0.6) / 10, (h * 0.6) / 10);
      const cx = w / 2;
      const cy = h * 0.45;
      const ang = (k * Math.PI) / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      for (let r = 0; r < R; r++) {
        roundRect(ctx, -(Cc * cell) / 2 - 4, (r - R / 2) * cell + 2, Cc * cell + 8, cell - 4, 8, r % 2 ? '#EFF6FF' : '#F0FDF4');
        for (let c = 0; c < Cc; c++) circle(ctx, (c - Cc / 2 + 0.5) * cell, (r - R / 2 + 0.5) * cell, cell * 0.32, PALETTE[r % PALETTE.length]);
      }
      ctx.restore();
      const a = k > 0.5 ? Cc : R;
      const b = k > 0.5 ? R : Cc;
      text(ctx, `${a} rows of ${b} = ${a} × ${b} = ${R * Cc}`, w / 2, h * 0.9, { size: Math.min(30, w / 22), weight: 700, color: C.primary });
    },
    (s, p, dt) => {
      s.k = approach((s.k as number) ?? 0, p.turn ? 1 : 0, dt, 3);
    }
  ),
});

function drawFraction(ctx: CanvasRenderingContext2D, shape: string, x: number, y: number, size: number, num: number, den: number, color: string) {
  if (shape === 'circle') {
    for (let i = 0; i < den; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, size / 2, -Math.PI / 2 + (i * 2 * Math.PI) / den, -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / den);
      ctx.closePath();
      ctx.fillStyle = i < num ? color : '#fff';
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else {
    const bw = size * 1.6;
    const bh = size * 0.5;
    for (let i = 0; i < den; i++) {
      ctx.fillStyle = i < num ? color : '#fff';
      ctx.fillRect(x - bw / 2 + (i * bw) / den, y - bh / 2, bw / den, bh);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - bw / 2 + (i * bw) / den, y - bh / 2, bw / den, bh);
    }
  }
}

export const fractionsShapes = defineSchool({
  id: 'g18-class3-fractions-shapes',
  title: 'Fractions Using Shapes',
  band: 'GRADES_1_8',
  level: 'class-3',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🍕',
  topic: 'Parts of a whole',
  shortDescription: 'Split a circle or a bar into equal parts and shade some of them to show a fraction.',
  detailedDescription: 'Pick the number of equal parts and how many are shaded. The fraction, its decimal and its percentage are shown.',
  learningObjectives: ['Recognise equal parts of a whole', 'Read and write fractions', 'Compare a fraction with one half'],
  parameters: [P.select('shape', 'Shape', [['circle', 'Circle'], ['bar', 'Bar']]), P.range('den', 'Equal parts', 2, 12, 4), P.range('num', 'Shaded parts', 0, 12, 1)],
  metrics: [
    metric('f', 'Fraction', (_s, p) => `${Math.min(p.num, p.den)}/${p.den}`),
    metric('d', 'Decimal', (_s, p) => fmt(Math.min(p.num, p.den) / p.den, 3)),
    metric('pc', 'Percent', (_s, p) => `${fmt((100 * Math.min(p.num, p.den)) / p.den, 1)}%`),
  ],
  tags: ['fractions', 'class 3'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Parts of a whole');
    const den = Number(p.den);
    const num = Math.min(Number(p.num), den);
    drawFraction(ctx, p.shape, w * 0.38, h * 0.48, Math.min(w * 0.4, h * 0.6), num, den, C.sky);
    const fx = w * 0.78;
    text(ctx, String(num), fx, h * 0.38, { size: 56, weight: 700, color: C.sky });
    line(ctx, fx - 40, h * 0.48, fx + 40, h * 0.48, C.ink, 4);
    text(ctx, String(den), fx, h * 0.58, { size: 56, weight: 700, color: C.ink });
    const cmp = num * 2 === den ? 'equal to one half' : num * 2 > den ? 'more than one half' : 'less than one half';
    text(ctx, `${num} of ${den} equal parts — ${cmp}`, w / 2, h * 0.9, { size: 16, color: C.muted, weight: 600 });
  }),
});

// ───────────────────────── Class 4 ─────────────────────────

export const equivalentFractions = defineSchool({
  id: 'g18-class4-equivalent-fractions',
  title: 'Equivalent Fractions',
  band: 'GRADES_1_8',
  level: 'class-4',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🟰',
  topic: 'Same amount, different parts',
  shortDescription: 'Split each part of a fraction bar into smaller equal parts and see that the shaded amount stays the same.',
  detailedDescription: 'Multiply the numerator and the denominator by the same number. The second bar has more, smaller parts, but exactly the same amount is shaded.',
  learningObjectives: ['Generate equivalent fractions', 'Explain why multiplying top and bottom by the same number keeps the value', 'Simplify a fraction'],
  parameters: [P.range('num', 'Numerator', 1, 9, 2), P.range('den', 'Denominator', 2, 10, 3), P.range('k', 'Split each part into', 1, 6, 2)],
  metrics: [
    metric('eq', 'Equivalent', (_s, p) => {
      const n = Math.min(p.num, p.den);
      return `${n}/${p.den} = ${n * p.k}/${p.den * p.k}`;
    }),
    metric('simp', 'Simplest form', (_s, p) => {
      const n = Math.min(p.num, p.den);
      const g = gcd(n, p.den);
      return `${n / g}/${p.den / g}`;
    }),
  ],
  tags: ['fractions', 'equivalent fractions', 'class 4'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Equivalent fractions');
    const den = Number(p.den);
    const num = Math.min(Number(p.num), den);
    const k = Number(p.k);
    const bw = w * 0.7;
    const bh = Math.min(56, h * 0.13);
    const x = (w - bw) / 2;
    const rows: Array<[number, number, string, number]> = [
      [num, den, C.blue, h * 0.28],
      [num * k, den * k, C.green, h * 0.55],
    ];
    for (const [n, d, color, y] of rows) {
      for (let i = 0; i < d; i++) {
        ctx.fillStyle = i < n ? color : '#fff';
        ctx.fillRect(x + (i * bw) / d, y, bw / d, bh);
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x + (i * bw) / d, y, bw / d, bh);
      }
      text(ctx, `${n}/${d}`, x - 30, y + bh / 2, { size: 20, weight: 700, color });
    }
    line(ctx, x + (num / den) * bw, h * 0.22, x + (num / den) * bw, h * 0.55 + bh + 10, C.red, 2, [6, 4]);
    text(ctx, `${num}/${den}  =  ${num} × ${k} / ${den} × ${k}  =  ${num * k}/${den * k}`, w / 2, h * 0.86, { size: Math.min(28, w / 24), weight: 700, color: C.primary });
  }),
});

export const anglesShapes = defineSchool({
  id: 'g18-class4-angles-shapes',
  title: 'Angles and Shapes',
  band: 'GRADES_1_8',
  level: 'class-4',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '📐',
  topic: 'Types of angles and polygons',
  shortDescription: 'Turn an arm to make acute, right, obtuse and reflex angles, or explore the angles inside polygons.',
  detailedDescription: 'In "Angle" mode, turn the arm and see the angle measured and named. In "Polygon" mode, choose the number of sides of a regular polygon and see each interior angle and the angle sum.',
  learningObjectives: ['Name acute, right, obtuse, straight and reflex angles', 'Measure angles in degrees', 'Relate the number of sides of a polygon to its angles'],
  parameters: [P.select('mode', 'Explore', [['angle', 'Angle'], ['polygon', 'Polygon']]), P.range('deg', 'Angle', 0, 360, 60, 1, '°'), P.range('sides', 'Polygon sides', 3, 10, 5)],
  metrics: [
    metric('type', 'Angle type', (_s, p) => {
      const d = p.deg;
      return d === 0 ? 'Zero' : d < 90 ? 'Acute' : d === 90 ? 'Right' : d < 180 ? 'Obtuse' : d === 180 ? 'Straight' : d < 360 ? 'Reflex' : 'Complete turn';
    }),
    metric('poly', 'Polygon angles', (_s, p) => `each ${fmt(((p.sides - 2) * 180) / p.sides, 1)}°, sum ${(p.sides - 2) * 180}°`),
  ],
  tags: ['angles', 'polygons', 'geometry', 'class 4'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, p.mode === 'angle' ? 'Measuring an angle' : 'Regular polygon');
    const cx = w / 2;
    const cy = h * 0.55;
    const R = Math.min(w, h) * 0.32;
    if (p.mode === 'angle') {
      const d = Number(p.deg);
      const a = (-d * Math.PI) / 180;
      ctx.fillStyle = 'rgba(14,165,233,0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.45, 0, a, true);
      ctx.closePath();
      ctx.fill();
      line(ctx, cx, cy, cx + R, cy, C.ink, 3);
      line(ctx, cx, cy, cx + R * Math.cos(a), cy + R * Math.sin(a), C.orange, 3);
      if (d === 90) roundRect(ctx, cx, cy - 18, 18, 18, 0, undefined, C.red, 2);
      circle(ctx, cx, cy, 5, C.ink);
      text(ctx, `${d}°`, cx + R * 0.6 * Math.cos(a / 2), cy + R * 0.6 * Math.sin(a / 2), { size: 22, weight: 700, color: C.sky });
    } else {
      const n = Number(p.sides);
      const pts = Array.from({ length: n }, (_, i): [number, number] => [cx + R * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / n), cy + R * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / n)]);
      ctx.fillStyle = '#E0F2FE';
      ctx.strokeStyle = C.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      const each = ((n - 2) * 180) / n;
      pts.forEach(([x, y]) => {
        circle(ctx, x, y, 4, C.orange);
        text(ctx, `${fmt(each, 1)}°`, x + (cx - x) * 0.18, y + (cy - y) * 0.18, { size: 11, color: C.ink, weight: 600 });
      });
      text(ctx, `${n} sides · angle sum (${n} − 2) × 180° = ${(n - 2) * 180}°`, w / 2, h * 0.12 + 14, { size: 15, weight: 600, color: C.primary });
    }
  }),
});

export const MATH_PRIMARY = [counting, additionObjects, placeValue, addSubtract, multiplicationArrays, fractionsShapes, equivalentFractions, anglesShapes];
export type { TimeState };
