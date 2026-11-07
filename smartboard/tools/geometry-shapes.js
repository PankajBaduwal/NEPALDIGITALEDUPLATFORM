'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// PIYUSHDHARA EDUVERSE BOARD — GEOMETRY & MATHEMATICS SHAPE LIBRARY
// Comprehensive 22-category shapes organized into 12 expandable tabs
// Real, interactive, editable canvas objects with live measurements and math
// ══════════════════════════════════════════════════════════════════════════════

const GeometryShapes = (() => {
  const PI = Math.PI;

  // ── Dimension badge helper ──
  function dimBadge(ctx, x, y, text, color) {
    ctx.save();
    ctx.setLineDash([]);
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    const pw = tw + 12, ph = 20;
    ctx.fillStyle = 'rgba(15,23,42,0.92)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - pw/2, y - ph/2, pw, ph, 4);
    else ctx.rect(x - pw/2, y - ph/2, pw, ph);
    ctx.fill();
    const strokeColor = color && color !== '#000000' && color !== '#0f172a' && color !== '#1e293b' ? color : '#38bdf8';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── Dashed guide helper ──
  function guide(ctx, x1, y1, x2, y2, color = 'rgba(56,189,248,0.5)') {
    ctx.save();
    ctx.setLineDash([4, 3]);
    const strokeColor = color && color !== '#000000' && color !== '#0f172a' && color !== '#1e293b' ? color : '#38bdf8';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Selection handles helper ──
  function selectionHandles(ctx, bx, by, bw, bh) {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(bx - 6, by - 6, bw + 12, bh + 12);
    ctx.setLineDash([]);
    const pts = [
      [bx-6, by-6], [bx-6+bw/2+6, by-6], [bx+bw+6, by-6],
      [bx-6, by-6+bh/2+6],                [bx+bw+6, by-6+bh/2+6],
      [bx-6, by+bh+6], [bx-6+bw/2+6, by+bh+6], [bx+bw+6, by+bh+6]
    ];
    pts.forEach(([hx, hy]) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.restore();
  }

  // ── Arrow head helper ──
  function drawArrowHead(ctx, fromX, fromY, toX, toY, size = 12) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - PI / 6), toY - size * Math.sin(angle - PI / 6));
    ctx.lineTo(toX - size * Math.cos(angle + PI / 6), toY - size * Math.sin(angle + PI / 6));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    ctx.restore();
  }

  // ── SHAPE DEFINITIONS (Default geometry and dimensions) ──
  const GEOMETRY_SHAPE_DEFS = {
    // ── TAB 01: BASIC 2D SHAPES & POLYGONS ──
    'oval':                 { label: 'Oval / Ellipse',          w: 160, h: 100 },
    'quarter-circle':       { label: 'Quarter Circle',          w: 120, h: 120, r: 120 },
    'annulus':              { label: 'Ring / Annulus',          w: 140, h: 140, R: 70, r: 40 },
    'circular-segment':     { label: 'Circular Segment',        w: 140, h: 80,  r: 70 },
    'circular-arc':         { label: 'Circular Arc',            w: 130, h: 130, r: 65, startAngle: 0, endAngle: 210 },
    'crescent':             { label: 'Crescent Moon',           w: 110, h: 130, r: 60 },
    
    // Quadrilaterals
    'isosceles-trapezoid':  { label: 'Isosceles Trapezoid',     w: 160, h: 90,  topW: 90 },
    'dart':                 { label: 'Dart (Concave Kite)',     w: 120, h: 130, indent: 40 },
    'irregular-quad':       { label: 'Irregular Quadrilateral', w: 150, h: 110 },
    'cyclic-quad':          { label: 'Cyclic Quadrilateral',    w: 140, h: 140, r: 70 },

    // Triangles
    'isosceles-tri':        { label: 'Isosceles Triangle',      w: 130, h: 120 },
    'scalene-tri':          { label: 'Scalene Triangle',        w: 150, h: 110 },
    'acute-tri':            { label: 'Acute Triangle',          w: 140, h: 110 },
    'obtuse-tri':           { label: 'Obtuse Triangle',         w: 160, h: 100 },
    'triangle-30-60-90':    { label: '30°-60°-90° Triangle',    w: 160, h: 92 },
    'triangle-45-45-90':    { label: '45°-45°-90° Triangle',    w: 120, h: 120 },
    'golden-triangle':      { label: 'Golden Triangle',         w: 110, h: 178 },
    'egyptian-triangle':    { label: 'Egyptian (3-4-5) Tri',    w: 160, h: 120 },

    // Polygons
    'heptagon':             { label: 'Heptagon (7-gon)',        w: 130, h: 130, sides: 7 },
    'nonagon':              { label: 'Nonagon (9-gon)',         w: 130, h: 130, sides: 9 },
    'decagon':              { label: 'Decagon (10-gon)',        w: 130, h: 130, sides: 10 },
    'undecagon':            { label: 'Undecagon (11-gon)',      w: 130, h: 130, sides: 11 },
    'dodecagon':            { label: 'Dodecagon (12-gon)',      w: 130, h: 130, sides: 12 },
    'icosagon':             { label: 'Icosagon (20-gon)',       w: 140, h: 140, sides: 20 },

    // Star shapes & Decorative figures
    'star-4':               { label: '4-Point Star',            w: 120, h: 120, points: 4, innerRatio: 0.38 },
    'star-5':               { label: '5-Point Star',            w: 130, h: 130, points: 5, innerRatio: 0.42 },
    'star-6':               { label: '6-Point Star (Hexagram)', w: 130, h: 130, points: 6, innerRatio: 0.55 },
    'star-8':               { label: '8-Point Star',            w: 130, h: 130, points: 8, innerRatio: 0.45 },
    'pentagram':            { label: 'Pentagram',               w: 130, h: 130 },
    'cross-shape':          { label: 'Geometric Cross',         w: 120, h: 120, barW: 36 },
    'arrow-shape':          { label: 'Geometric Arrow',         w: 160, h: 70  },
    'vesica-piscis':        { label: 'Vesica Piscis',           w: 160, h: 120, r: 60 },
    'yin-yang':             { label: 'Yin-Yang Figure',         w: 130, h: 130, r: 65 },
    'triskele':             { label: 'Triskele',                w: 130, h: 130, r: 65 },
    'reuleaux-tri':         { label: 'Reuleaux Triangle',       w: 130, h: 120 },
    'superellipse':         { label: 'Superellipse (Lamé)',     w: 150, h: 110, exponent: 2.5 },
    'astroid':              { label: 'Astroid Curve',           w: 130, h: 130 },
    'cardioid-fig':         { label: 'Cardioid Figure',         w: 140, h: 130 },

    // ── TAB 02: GEOMETRY & CONSTRUCTIONS ──
    'geom-point':           { label: 'Point A(x, y)',           w: 50,  h: 50,  pointLabel: 'P' },
    'geom-line-segment':    { label: 'Line Segment AB',         w: 160, h: 60,  lengthCm: 8.0 },
    'geom-infinite-line':   { label: 'Infinite Line ⟷',        w: 180, h: 60  },
    'geom-ray':             { label: 'Ray AB ⟶',               w: 160, h: 60  },
    'geom-parallel':        { label: 'Parallel Lines (L₁ || L₂)', w: 170, h: 90 },
    'geom-perpendicular':   { label: 'Perpendicular Lines ⟂',  w: 140, h: 140 },
    'geom-intersecting':    { label: 'Intersecting Lines ╳',   w: 150, h: 130 },
    'geom-transversal':     { label: 'Transversal Lines',       w: 170, h: 130 },
    'geom-perp-bisector':   { label: 'Perpendicular Bisector',  w: 160, h: 140 },
    'geom-angle-bisector':  { label: 'Angle Bisector',          w: 150, h: 130, angleDeg: 60 },
    'geom-median':          { label: 'Triangle Median',         w: 150, h: 120 },
    'geom-altitude':        { label: 'Triangle Altitude',       w: 150, h: 120 },
    'geom-acute-angle':     { label: 'Acute Angle (45°)',       w: 140, h: 120, angleDeg: 45 },
    'geom-right-angle':     { label: 'Right Angle (90°)',       w: 130, h: 130, angleDeg: 90 },
    'geom-obtuse-angle':    { label: 'Obtuse Angle (135°)',     w: 160, h: 120, angleDeg: 135 },
    'geom-straight-angle':  { label: 'Straight Angle (180°)',   w: 170, h: 60,  angleDeg: 180 },
    'geom-reflex-angle':    { label: 'Reflex Angle (240°)',     w: 140, h: 140, angleDeg: 240 },
    'geom-vert-opp-angles': { label: 'Vert. Opposite Angles',   w: 150, h: 130 },
    'geom-alt-interior':    { label: 'Alt. Interior Angles',    w: 170, h: 130 },
    'geom-complementary':   { label: 'Complementary Angles',    w: 140, h: 140 },
    'geom-supplementary':   { label: 'Supplementary Angles',    w: 170, h: 90  },

    // ── TAB 03: CIRCLE GEOMETRY ──
    'circ-concentric':      { label: 'Concentric Circles',      w: 150, h: 150, r1: 75, r2: 45 },
    'circ-intersecting':    { label: 'Intersecting Circles',    w: 190, h: 130, r: 60, d: 70 },
    'circ-tangent-ext':     { label: 'Ext. Tangent Circles',    w: 190, h: 130, r1: 55, r2: 35 },
    'circ-tangent-int':     { label: 'Int. Tangent Circles',    w: 150, h: 150, R: 75, r: 40 },
    'circ-incircle':        { label: 'Incircle of Triangle',    w: 160, h: 140 },
    'circ-circumcircle':    { label: 'Circumcircle of Triangle',w: 150, h: 150 },
    'circ-radius':          { label: 'Circle with Radius r',    w: 140, h: 140, r: 70 },
    'circ-diameter':        { label: 'Circle with Diameter d',  w: 140, h: 140, r: 70 },
    'circ-chord':           { label: 'Circle with Chord AB',    w: 140, h: 140, r: 70 },
    'circ-secant':          { label: 'Circle with Secant Line', w: 160, h: 140, r: 65 },
    'circ-tangent':         { label: 'Circle with Tangent Line',w: 160, h: 150, r: 65 },
    'circ-common-tangents': { label: 'Common External Tangents',w: 200, h: 130 },

    // ── TAB 04: 3D GEOMETRIC SOLIDS ──
    'tetrahedron':          { label: 'Tetrahedron',             w: 130, h: 130 },
    'octahedron':           { label: 'Octahedron',              w: 130, h: 140 },
    'dodecahedron':         { label: 'Dodecahedron',            w: 140, h: 140 },
    'icosahedron':          { label: 'Icosahedron',             w: 140, h: 140 },
    'frustum-cone':         { label: 'Truncated Cone (Frustum)',w: 130, h: 120, topR: 35, botR: 60 },
    'frustum-pyramid':      { label: 'Frustum of Pyramid',      w: 130, h: 120, topW: 50, botW: 100 },
    'torus-solid':          { label: '3D Torus (Donut)',        w: 160, h: 110, R: 60, r: 24 },
    'ellipsoid-solid':      { label: '3D Ellipsoid',            w: 160, h: 110, rx: 75, ry: 48 },

    // ── TAB 05: GRAPHS & MATHEMATICAL CURVES ──
    'graph-cartesian':      { label: 'Cartesian Plane (x, y)',  w: 220, h: 220 },
    'graph-slope-triangle': { label: 'Slope / Gradient Tri',    w: 160, h: 130 },
    'curve-parabola':       { label: 'Parabola y = x²',         w: 180, h: 140 },
    'curve-sine':           { label: 'Sine Wave y = sin(x)',    w: 220, h: 110 },
    'curve-cosine':         { label: 'Cosine Wave y = cos(x)',  w: 220, h: 110 },
    'curve-ellipse-graph':  { label: 'Ellipse Graph',           w: 180, h: 130 },
    'curve-hyperbola':      { label: 'Hyperbola Graph',         w: 180, h: 140 },
    'curve-exponential':    { label: 'Exponential y = eˣ',      w: 180, h: 140 },
    'curve-log':            { label: 'Logarithmic y = ln(x)',   w: 180, h: 140 },
    'curve-abs':            { label: 'Absolute Value y = |x|',  w: 170, h: 130 },
    'curve-cubic':          { label: 'Cubic Graph y = x³',      w: 180, h: 150 },
    'curve-spiral':         { label: 'Archimedean Spiral',      w: 140, h: 140 },
    'curve-cycloid':        { label: 'Cycloid Curve',           w: 220, h: 110 },
    'curve-lissajous':      { label: 'Lissajous Figure',        w: 140, h: 140 },

    // ── TAB 06: TRANSFORMATIONS & SYMMETRY ──
    'trans-translation':    { label: 'Translation Vector T',    w: 180, h: 130 },
    'trans-rotation':       { label: 'Rotation Diagram R(θ)',   w: 160, h: 140, angleDeg: 60 },
    'trans-reflection':     { label: 'Reflection Across Line',  w: 180, h: 130 },
    'trans-dilation':       { label: 'Dilation / Scale (k=2)',  w: 180, h: 140 },
    'trans-line-symmetry':  { label: 'Line Symmetry Axis',     w: 150, h: 130 },
    'trans-rot-symmetry':   { label: 'Rotational Symmetry',     w: 140, h: 140 },
    'tess-square':          { label: 'Square Tessellation',     w: 160, h: 160, grid: 4 },
    'tess-hexagon':         { label: 'Hexagonal Honeycomb',     w: 170, h: 150 },
    'tess-triangle':        { label: 'Triangular Tessellation', w: 160, h: 140 },
    'fractal-sierpinski':   { label: 'Sierpiński Triangle',     w: 150, h: 130, depth: 3 },
    'fractal-koch':         { label: 'Koch Snowflake',          w: 150, h: 150, depth: 2 },

    // ── TAB 07: MEASUREMENT & INSTRUMENTS ──
    'set-square-45':        { label: '45° Set Square Ruler',    w: 150, h: 150 },
    'set-square-30-60':     { label: '30°-60° Set Square',      w: 170, h: 110 },
    't-square':             { label: 'Architectural T-Square',  w: 180, h: 140 },
    'grid-overlay':         { label: 'Graph Paper Grid Sheet',  w: 200, h: 160, step: 20 },

    // ── TAB 08: FRACTIONS & NUMBER MODELS ──
    'fraction-bar':         { label: 'Fraction Bar (1/4)',      w: 200, h: 60,  totalParts: 4, shadedParts: 1 },
    'fraction-circle':      { label: 'Fraction Circle (3/8)',   w: 140, h: 140, totalParts: 8, shadedParts: 3 },
    'fraction-wall':        { label: 'Fraction Wall Model',     w: 220, h: 140 },
    'fraction-strip':       { label: 'Fraction Strips',         w: 220, h: 80,  parts: [1, 2, 4] },
    'decimal-grid-100':     { label: '10x10 Decimal Grid (35%)',w: 160, h: 160, percentage: 35 },
    'hundred-chart':        { label: 'Hundred Chart (1-100)',   w: 180, h: 180 },
    'ten-frame':            { label: 'Ten Frame Model (7/10)',  w: 180, h: 80,  filled: 7 },
    'base-ten-blocks':      { label: 'Base-Ten Blocks (124)',   w: 200, h: 120, hundreds: 1, tens: 2, units: 4 },
    'abacus-model':         { label: 'Classroom Abacus',        w: 180, h: 130, rods: 5 },

    // ── TAB 09: STATISTICS & PROBABILITY ──
    'stat-barchart':        { label: 'Bar Chart (Columns)',     w: 190, h: 140, data: [40, 75, 55, 90] },
    'stat-histogram':       { label: 'Histogram (Continuous)',  w: 190, h: 140, data: [20, 50, 85, 60, 30] },
    'stat-piechart':        { label: 'Pie Chart Diagram',       w: 150, h: 150, slices: [35, 25, 20, 20] },
    'stat-doughnut':        { label: 'Doughnut Chart',          w: 150, h: 150, slices: [40, 30, 30] },
    'stat-linegraph':       { label: 'Statistics Line Graph',   w: 190, h: 140, points: [20, 55, 40, 80, 95] },
    'stat-scatterplot':     { label: 'Scatter Plot & Trendline',w: 190, h: 140 },
    'stat-boxplot':         { label: 'Box-and-Whisker Plot',    w: 200, h: 90,  min: 20, q1: 45, med: 65, q3: 85, max: 110 },
    'stat-normal-curve':    { label: 'Bell Curve (Normal Dist)',w: 200, h: 130 },
    'stat-prob-tree':       { label: 'Probability Tree Diag',   w: 200, h: 140 },

    // ── TAB 10: ADVANCED MATHEMATICS & VECTORS ──
    'math-vector-2d':       { label: '2D Vector v⃗ = (4, 3)',    w: 160, h: 120, vx: 120, vy: -70 },
    'math-vector-3d':       { label: '3D Vector in Space',      w: 170, h: 150 },
    'math-vector-add':      { label: 'Vector Addition u⃗ + v⃗',   w: 180, h: 140 },
    'math-dot-product':     { label: 'Dot Product Angle u⃗ · v⃗', w: 160, h: 120, angleDeg: 50 },
    'math-cross-product':   { label: 'Cross Product u⃗ × v⃗',     w: 170, h: 150 },
    'math-3d-plane':        { label: '3D Plane in Space',       w: 180, h: 140 },
    'math-matrix-2x2':      { label: 'Matrix Brackets [2×2]',   w: 140, h: 100, a: 'a', b: 'b', c: 'c', d: 'd' },
    'math-integral-sign':   { label: 'Integral ∫ f(x) dx',      w: 130, h: 140 },
    'math-summation-sign':  { label: 'Summation ∑ (Sigma)',     w: 130, h: 140 },

    // ── TAB 11: TABLES & TEACHING DIAGRAMS ──
    'diag-mult-table':      { label: 'Multiplication 10×10',    w: 220, h: 220 },
    'diag-venn-2':          { label: '2-Set Venn Diagram (A,B)',w: 190, h: 130 },
    'diag-venn-3':          { label: '3-Set Venn Diagram (A,B,C)', w: 180, h: 170 },
    'diag-factor-tree':     { label: 'Factor Tree (24 = 2³·3)', w: 180, h: 150 },
    'diag-clock':           { label: 'Analog Clock Face',       w: 150, h: 150, hour: 10, minute: 10 },
    'diag-balance-scale':   { label: 'Algebraic Balance Scale', w: 200, h: 130, leftVal: '2x + 4', rightVal: '10' },
    'diag-truth-table':     { label: 'Logic Truth Table',       w: 190, h: 140 },
    'diag-flow-process':    { label: 'Flowchart: Process',      w: 160, h: 70  },
    'diag-flow-decision':   { label: 'Flowchart: Decision',     w: 140, h: 100 },
    'diag-flow-terminus':   { label: 'Flowchart: Start/End',    w: 160, h: 65  },

    // ── TAB 12: CUSTOM & SMART SHAPES ──
    'smart-polygon':        { label: 'Custom Regular N-gon',    w: 140, h: 140, sides: 6 },
    'smart-star':           { label: 'Custom N-point Star',     w: 140, h: 140, points: 5, innerRatio: 0.45 },
    'smart-bezier':         { label: 'Editable Bezier Curve',   w: 180, h: 120 }
  };

  function isGeometryShape(type) {
    return !!GEOMETRY_SHAPE_DEFS[type];
  }

  function getBounds(s) {
    const def = GEOMETRY_SHAPE_DEFS[s.type] || { w: 120, h: 100 };
    return {
      x: s.x,
      y: s.y,
      w: s.w || def.w || 120,
      h: s.h || def.h || 100
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DRAW DISPATCHER — High-performance vector rendering for all geometry shapes
  // ─────────────────────────────────────────────────────────────────────────────
  function draw(ctx, s) {
    ctx.save();
    const x = s.x, y = s.y;
    const w = s.w || 120, h = s.h || 100;
    const color = s.color || '#38bdf8';
    const fill = s.fill || (s.filled ? color + '22' : 'transparent');
    const lw = s.selected ? 2.5 : (s.lineWidth || 2);

    ctx.strokeStyle = color;
    ctx.fillStyle = fill;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    switch (s.type) {

      // ── OVAL / ELLIPSE ──
      case 'oval': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, PI * 2);
        ctx.fill(); ctx.stroke();
        // Axis guides & label
        guide(ctx, x, cy, x + w, cy);
        guide(ctx, cx, y, cx, y + h);
        dimBadge(ctx, cx, y - 12, `2a = ${(w * 0.1).toFixed(1)} cm`, color);
        break;
      }

      // ── QUARTER CIRCLE ──
      case 'quarter-circle': {
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y);
        ctx.arc(x, y + h, Math.min(w, h), -PI / 2, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Right angle mark at corner
        ctx.strokeRect(x, y + h - 14, 14, 14);
        dimBadge(ctx, x + w / 2, y + h + 14, `r = ${(Math.min(w, h) * 0.1).toFixed(1)} cm`, color);
        break;
      }

      // ── RING / ANNULUS ──
      case 'annulus': {
        const cx = x + w / 2, cy = y + h / 2;
        const R = (s.R || w * 0.48);
        const r = (s.r || w * 0.28);
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, PI * 2, false);
        ctx.arc(cx, cy, r, 0, PI * 2, true);
        ctx.fillStyle = color + '22';
        ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        guide(ctx, cx, cy, cx + R, cy);
        dimBadge(ctx, cx, y - 14, `R=${(R*0.1).toFixed(1)}, r=${(r*0.1).toFixed(1)}`, color);
        break;
      }

      // ── CIRCULAR SEGMENT ──
      case 'circular-segment': {
        const cx = x + w / 2, cy = y - h * 0.2;
        const R = Math.max(w, h);
        const a1 = PI * 0.35, a2 = PI * 0.65;
        ctx.beginPath();
        ctx.arc(cx, cy, R, a1, a2);
        ctx.closePath();
        ctx.fillStyle = color + '33';
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 14, 'Segment', color);
        break;
      }

      // ── CIRCULAR ARC ──
      case 'circular-arc': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -PI * 0.2, PI * 1.1);
        ctx.stroke();
        // Arrow head on arc end
        drawArrowHead(ctx, cx + r * Math.cos(PI * 1.05), cy + r * Math.sin(PI * 1.05), cx + r * Math.cos(PI * 1.1), cy + r * Math.sin(PI * 1.1), 10);
        dimBadge(ctx, cx, y - 12, 'Arc', color);
        break;
      }

      // ── CRESCENT MOON ──
      case 'crescent': {
        const cx = x + w * 0.6, cy = y + h / 2;
        const r1 = Math.min(w, h) * 0.48;
        const r2 = r1 * 0.88;
        ctx.beginPath();
        ctx.arc(cx, cy, r1, PI * 0.6, PI * 1.4, false);
        ctx.arc(cx + r1 * 0.5, cy, r2, PI * 1.25, PI * 0.75, true);
        ctx.closePath();
        ctx.fillStyle = color + '28';
        ctx.fill(); ctx.stroke();
        break;
      }

      // ── ISOSCELES TRAPEZOID ──
      case 'isosceles-trapezoid': {
        const tw = s.topW || w * 0.55;
        const off = (w - tw) / 2;
        ctx.beginPath();
        ctx.moveTo(x + off, y);
        ctx.lineTo(x + off + tw, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        guide(ctx, x + off, y, x + off, y + h);
        dimBadge(ctx, x + w / 2, y - 12, `a = ${(tw * 0.1).toFixed(1)} cm`, color);
        dimBadge(ctx, x + w / 2, y + h + 14, `b = ${(w * 0.1).toFixed(1)} cm`, color);
        break;
      }

      // ── DART (CONCAVE KITE) ──
      case 'dart': {
        const tipX = x + w / 2, tipY = y;
        const rx = x + w, ry = y + h * 0.75;
        const lx = x, ly = y + h * 0.75;
        const notchX = x + w / 2, notchY = y + h * 0.45;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(rx, ry);
        ctx.lineTo(notchX, notchY);
        ctx.lineTo(lx, ly);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      }

      // ── IRREGULAR QUADRILATERAL ──
      case 'irregular-quad': {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.25, y);
        ctx.lineTo(x + w * 0.9, y + h * 0.15);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h * 0.85);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      }

      // ── CYCLIC QUADRILATERAL (Inscribed) ──
      case 'cyclic-quad': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        // Circumcircle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, PI * 2);
        ctx.strokeStyle = color + '44';
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        // Inscribed quadrilateral
        const angles = [0.2 * PI, 0.75 * PI, 1.25 * PI, 1.8 * PI];
        ctx.beginPath();
        angles.forEach((a, idx) => {
          const px = cx + r * Math.cos(a);
          const py = cy + r * Math.sin(a);
          if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '22';
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y - 12, 'Cyclic Quad: ∠A+∠C=180°', color);
        break;
      }

      // ── TRIANGLES (Isosceles, Scalene, Acute, Obtuse, 30-60-90, 45-45-90) ──
      case 'isosceles-tri': {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        guide(ctx, x + w / 2, y, x + w / 2, y + h);
        dimBadge(ctx, x + w / 2, y + h + 14, `b = ${(w * 0.1).toFixed(1)} cm`, color);
        break;
      }

      case 'scalene-tri': {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.65, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      }

      case 'acute-tri': {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.45, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y - 12, 'All Angles < 90°', color);
        break;
      }

      case 'obtuse-tri': {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w * 0.3, y - 12, 'θ > 90°', color);
        break;
      }

      case 'triangle-30-60-90': {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeRect(x, y + h - 14, 14, 14);
        dimBadge(ctx, x + w * 0.5, y + h + 14, '1 : √3 : 2', color);
        break;
      }

      case 'triangle-45-45-90': {
        const side = Math.min(w, h);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + side);
        ctx.lineTo(x + side, y + side);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeRect(x, y + side - 14, 14, 14);
        dimBadge(ctx, x + side / 2, y + side + 14, '1 : 1 : √2', color);
        break;
      }

      case 'golden-triangle': {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y - 12, 'Golden Ratio φ ≈ 1.618', color);
        break;
      }

      case 'egyptian-triangle': {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeRect(x, y + h - 14, 14, 14);
        dimBadge(ctx, x - 18, y + h / 2, '3', color);
        dimBadge(ctx, x + w / 2, y + h + 14, '4', color);
        dimBadge(ctx, x + w * 0.58, y + h * 0.42, '5', color);
        break;
      }

      // ── REGULAR POLYGONS (7, 9, 10, 11, 12, 20 sides) ──
      case 'heptagon':
      case 'nonagon':
      case 'decagon':
      case 'undecagon':
      case 'dodecagon':
      case 'icosagon':
      case 'smart-polygon': {
        const sides = s.sides || (s.type === 'heptagon' ? 7 : s.type === 'nonagon' ? 9 : s.type === 'decagon' ? 10 : s.type === 'undecagon' ? 11 : s.type === 'dodecagon' ? 12 : s.type === 'icosagon' ? 20 : 6);
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const a = -PI / 2 + (i * 2 * PI) / sides;
          const px = cx + r * Math.cos(a);
          const py = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y - 12, `${sides}-gon (n=${sides})`, color);
        break;
      }

      // ── STAR SHAPES (4, 5, 6, 8 points & pentagram) ──
      case 'star-4':
      case 'star-5':
      case 'star-6':
      case 'star-8':
      case 'smart-star': {
        const pts = s.points || (s.type === 'star-4' ? 4 : s.type === 'star-6' ? 6 : s.type === 'star-8' ? 8 : 5);
        const ratio = s.innerRatio || (pts === 6 ? 0.55 : pts === 4 ? 0.38 : 0.45);
        const cx = x + w / 2, cy = y + h / 2;
        const R = Math.min(w, h) / 2;
        const r = R * ratio;
        ctx.beginPath();
        for (let i = 0; i < pts * 2; i++) {
          const a = -PI / 2 + (i * PI) / pts;
          const rad = i % 2 === 0 ? R : r;
          const px = cx + rad * Math.cos(a);
          const py = cy + rad * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      }

      case 'pentagram': {
        const cx = x + w / 2, cy = y + h / 2;
        const R = Math.min(w, h) / 2;
        const order = [0, 2, 4, 1, 3];
        ctx.beginPath();
        order.forEach((idx, i) => {
          const a = -PI / 2 + (idx * 2 * PI) / 5;
          const px = cx + R * Math.cos(a);
          const py = cy + R * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = color + '20';
        ctx.fill(); ctx.stroke();
        break;
      }

      case 'cross-shape': {
        const bw = s.barW || w * 0.3;
        const offX = (w - bw) / 2;
        const offY = (h - bw) / 2;
        ctx.beginPath();
        ctx.moveTo(x + offX, y);
        ctx.lineTo(x + offX + bw, y);
        ctx.lineTo(x + offX + bw, y + offY);
        ctx.lineTo(x + w, y + offY);
        ctx.lineTo(x + w, y + offY + bw);
        ctx.lineTo(x + offX + bw, y + offY + bw);
        ctx.lineTo(x + offX + bw, y + h);
        ctx.lineTo(x + offX, y + h);
        ctx.lineTo(x + offX, y + offY + bw);
        ctx.lineTo(x, y + offY + bw);
        ctx.lineTo(x, y + offY);
        ctx.lineTo(x + offX, y + offY);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      }

      case 'arrow-shape': {
        const shaftH = h * 0.4;
        const shaftY = y + (h - shaftH) / 2;
        const headW = w * 0.35;
        ctx.beginPath();
        ctx.moveTo(x, shaftY);
        ctx.lineTo(x + w - headW, shaftY);
        ctx.lineTo(x + w - headW, y);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w - headW, y + h);
        ctx.lineTo(x + w - headW, shaftY + shaftH);
        ctx.lineTo(x, shaftY + shaftH);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      }

      case 'vesica-piscis': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.5;
        const d = r * 0.9;
        ctx.beginPath();
        ctx.arc(cx - d / 2, cy, r, -PI / 3, PI / 3);
        ctx.arc(cx + d / 2, cy, r, PI * 2 / 3, PI * 4 / 3);
        ctx.closePath();
        ctx.fillStyle = color + '28';
        ctx.fill(); ctx.stroke();
        // Circles outline
        ctx.beginPath(); ctx.arc(cx - d / 2, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + d / 2, cy, r, 0, PI * 2); ctx.stroke();
        break;
      }

      case 'yin-yang': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, PI * 2);
        ctx.stroke();
        // S curve
        ctx.beginPath();
        ctx.arc(cx, cy - r / 2, r / 2, PI * 1.5, PI * 0.5, true);
        ctx.arc(cx, cy + r / 2, r / 2, PI * 1.5, PI * 0.5, false);
        ctx.arc(cx, cy, r, PI * 0.5, PI * 1.5, true);
        ctx.fillStyle = color;
        ctx.fill();
        // Inner dots
        ctx.beginPath(); ctx.arc(cx, cy - r / 2, r * 0.16, 0, PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy + r / 2, r * 0.16, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        break;
      }

      case 'reuleaux-tri': {
        const cx = x + w / 2, cy = y + h * 0.58;
        const r = Math.min(w, h) * 0.85;
        const hTri = r * Math.sqrt(3) / 2;
        const p1 = { x: cx, y: cy - hTri * 2 / 3 };
        const p2 = { x: cx - r / 2, y: cy + hTri / 3 };
        const p3 = { x: cx + r / 2, y: cy + hTri / 3 };
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, r, -PI / 6, PI / 6);
        ctx.arc(p3.x, p3.y, r, PI * 5 / 6, PI * 7 / 6);
        ctx.arc(p1.x, p1.y, r, PI / 2 - PI / 6, PI / 2 + PI / 6);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y - 12, 'Reuleaux Triangle', color);
        break;
      }

      // ── TAB 02: GEOMETRY & CONSTRUCTIONS ──
      case 'geom-point': {
        const px = x + w / 2, py = y + h / 2;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        dimBadge(ctx, px + 22, py - 10, s.pointLabel || 'P', color);
        break;
      }

      case 'geom-line-segment': {
        const ymid = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 12, ymid);
        ctx.lineTo(x + w - 12, ymid);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 12, ymid, 4.5, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.beginPath(); ctx.arc(x + w - 12, ymid, 4.5, 0, PI * 2); ctx.fill();
        dimBadge(ctx, x + w / 2, ymid - 16, `${(w * 0.1).toFixed(1)} cm`, color);
        break;
      }

      case 'geom-infinite-line': {
        const ymid = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 14, ymid);
        ctx.lineTo(x + w - 14, ymid);
        ctx.stroke();
        drawArrowHead(ctx, x + 30, ymid, x + 8, ymid, 11);
        drawArrowHead(ctx, x + w - 30, ymid, x + w - 8, ymid, 11);
        dimBadge(ctx, x + w / 2, ymid - 16, 'Line ⟷', color);
        break;
      }

      case 'geom-ray': {
        const ymid = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x + 14, ymid);
        ctx.lineTo(x + w - 14, ymid);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 14, ymid, 4.5, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        drawArrowHead(ctx, x + w - 30, ymid, x + w - 8, ymid, 11);
        dimBadge(ctx, x + w / 2, ymid - 16, 'Ray ⟶', color);
        break;
      }

      case 'geom-parallel': {
        const y1 = y + h * 0.3, y2 = y + h * 0.7;
        ctx.beginPath(); ctx.moveTo(x + 10, y1); ctx.lineTo(x + w - 10, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, y2); ctx.lineTo(x + w - 10, y2); ctx.stroke();
        drawArrowHead(ctx, x + w * 0.45, y1, x + w * 0.55, y1, 8);
        drawArrowHead(ctx, x + w * 0.45, y2, x + w * 0.55, y2, 8);
        dimBadge(ctx, x + w / 2, y - 12, 'L₁ || L₂ (Parallel)', color);
        break;
      }

      case 'geom-perpendicular': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 10, cy); ctx.lineTo(x + w - 10, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + h - 10); ctx.stroke();
        ctx.strokeRect(cx, cy - 14, 14, 14);
        dimBadge(ctx, cx + 32, cy - 24, '90° (⟂)', color);
        break;
      }

      case 'geom-transversal': {
        const y1 = y + h * 0.35, y2 = y + h * 0.75;
        ctx.beginPath(); ctx.moveTo(x + 10, y1); ctx.lineTo(x + w - 10, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, y2); ctx.lineTo(x + w - 10, y2); ctx.stroke();
        // Transversal line
        ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + 10); ctx.lineTo(x + w * 0.8, y + h - 10); ctx.stroke();
        dimBadge(ctx, x + w / 2, y - 12, 'Transversal', color);
        break;
      }

      case 'geom-acute-angle':
      case 'geom-right-angle':
      case 'geom-obtuse-angle':
      case 'geom-straight-angle':
      case 'geom-reflex-angle': {
        const deg = s.angleDeg || (s.type === 'geom-right-angle' ? 90 : s.type === 'geom-acute-angle' ? 45 : s.type === 'geom-obtuse-angle' ? 135 : s.type === 'geom-straight-angle' ? 180 : 240);
        const vx = x + w * 0.25, vy = y + h * 0.75;
        const rArm = Math.min(w, h) * 0.65;
        const rad = deg * PI / 180;
        // Arm 1 (horizontal right)
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + rArm, vy); ctx.stroke();
        drawArrowHead(ctx, vx + rArm - 15, vy, vx + rArm, vy, 9);
        // Arm 2 (angled)
        const ax = vx + rArm * Math.cos(-rad);
        const ay = vy + rArm * Math.sin(-rad);
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(ax, ay); ctx.stroke();
        drawArrowHead(ctx, vx + (rArm - 15) * Math.cos(-rad), vy + (rArm - 15) * Math.sin(-rad), ax, ay, 9);
        // Arc
        ctx.beginPath();
        ctx.arc(vx, vy, 26, 0, -rad, true);
        ctx.stroke();
        dimBadge(ctx, vx + 38 * Math.cos(-rad / 2), vy + 38 * Math.sin(-rad / 2), `${deg}°`, color);
        break;
      }

      // ── TAB 03: CIRCLE GEOMETRY ──
      case 'circ-concentric': {
        const cx = x + w / 2, cy = y + h / 2;
        const r1 = Math.min(w, h) * 0.48;
        const r2 = r1 * 0.6;
        ctx.beginPath(); ctx.arc(cx, cy, r1, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r2, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        dimBadge(ctx, cx, y - 12, 'Concentric Circles', color);
        break;
      }

      case 'circ-radius': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        dimBadge(ctx, cx + r / 2, cy - 12, 'r', color);
        break;
      }

      case 'circ-diameter': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        dimBadge(ctx, cx, cy - 14, 'd = 2r', color);
        break;
      }

      case 'circ-chord': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        const p1 = { x: cx + r * Math.cos(PI * 0.25), y: cy + r * Math.sin(PI * 0.25) };
        const p2 = { x: cx + r * Math.cos(PI * 0.85), y: cy + r * Math.sin(PI * 0.85) };
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        dimBadge(ctx, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 + 16, 'Chord AB', color);
        break;
      }

      case 'circ-tangent': {
        const cx = x + w / 2, cy = y + h * 0.45;
        const r = Math.min(w, h) * 0.38;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        // Tangent point bottom
        const ty = cy + r;
        ctx.beginPath(); ctx.moveTo(x + 10, ty); ctx.lineTo(x + w - 10, ty); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, ty, 4, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        guide(ctx, cx, cy, cx, ty);
        ctx.strokeRect(cx, ty - 12, 12, 12);
        dimBadge(ctx, cx + 45, ty + 16, 'Tangent ⟂ Radius', color);
        break;
      }

      // ── TAB 04: 3D GEOMETRIC SOLIDS ──
      case 'tetrahedron': {
        const top = { x: x + w / 2, y: y + 10 };
        const bl = { x: x + 15, y: y + h - 15 };
        const br = { x: x + w - 15, y: y + h - 15 };
        const mid = { x: x + w * 0.48, y: y + h * 0.65 };
        // Front faces
        ctx.beginPath();
        ctx.moveTo(top.x, top.y); ctx.lineTo(bl.x, bl.y); ctx.lineTo(br.x, br.y); ctx.closePath();
        ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke();
        // Inner apex
        ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(mid.x, mid.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bl.x, bl.y); ctx.lineTo(mid.x, mid.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(br.x, br.y); ctx.lineTo(mid.x, mid.y); ctx.stroke();
        dimBadge(ctx, x + w / 2, y - 12, 'Tetrahedron (4 Faces)', color);
        break;
      }

      case 'octahedron': {
        const cx = x + w / 2, cy = y + h / 2;
        const top = { x: cx, y: y + 10 };
        const bot = { x: cx, y: y + h - 10 };
        const pts = [
          { x: x + 15, y: cy },
          { x: cx - 15, y: cy + 18 },
          { x: x + w - 15, y: cy },
          { x: cx + 15, y: cy - 18 }
        ];
        // Connect top to points
        pts.forEach(p => {
          ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(p.x, p.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bot.x, bot.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        });
        // Equator
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.stroke();
        dimBadge(ctx, cx, y - 12, 'Octahedron (8 Faces)', color);
        break;
      }

      case 'dodecahedron':
      case 'icosahedron': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.45;
        // Outer poly
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * 2 * PI) / 6;
          const px = cx + r * Math.cos(a);
          const py = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke();
        // Inner triangulated facets
        for (let i = 0; i < 6; i++) {
          const a1 = (i * 2 * PI) / 6;
          const px1 = cx + r * Math.cos(a1);
          const py1 = cy + r * Math.sin(a1);
          const a2 = ((i + 1) * 2 * PI) / 6;
          const px2 = cx + r * Math.cos(a2);
          const py2 = cy + r * Math.sin(a2);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px1, py1); ctx.stroke();
        }
        dimBadge(ctx, cx, y - 12, s.type === 'dodecahedron' ? 'Dodecahedron (12)' : 'Icosahedron (20)', color);
        break;
      }

      case 'frustum-cone': {
        const topW = s.topR ? s.topR * 2 : w * 0.5;
        const botW = s.botR ? s.botR * 2 : w * 0.85;
        const cx = x + w / 2;
        const topY = y + 16, botY = y + h - 16;
        // Top ellipse
        ctx.beginPath(); ctx.ellipse(cx, topY, topW / 2, topW * 0.18, 0, 0, PI * 2); ctx.stroke();
        // Bottom ellipse
        ctx.beginPath(); ctx.ellipse(cx, botY, botW / 2, botW * 0.18, 0, 0, PI * 2); ctx.stroke();
        // Edges
        ctx.beginPath();
        ctx.moveTo(cx - topW / 2, topY); ctx.lineTo(cx - botW / 2, botY);
        ctx.moveTo(cx + topW / 2, topY); ctx.lineTo(cx + botW / 2, botY);
        ctx.stroke();
        dimBadge(ctx, cx, y - 12, 'Conical Frustum', color);
        break;
      }

      case 'torus-solid': {
        const cx = x + w / 2, cy = y + h / 2;
        const R = w * 0.38, r = h * 0.22;
        ctx.beginPath(); ctx.ellipse(cx, cy, R + r, r + 10, 0, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, R - r, r * 0.5, 0, 0, PI * 2); ctx.stroke();
        dimBadge(ctx, cx, y - 12, '3D Torus', color);
        break;
      }

      case 'ellipsoid-solid': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.45, h * 0.4, 0, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.45, h * 0.16, 0, 0, PI * 2);
        ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
        dimBadge(ctx, cx, y - 12, '3D Ellipsoid', color);
        break;
      }

      // ── TAB 05: GRAPHS & MATHEMATICAL CURVES ──
      case 'graph-cartesian': {
        const cx = x + w / 2, cy = y + h / 2;
        // Grid
        ctx.strokeStyle = color + '22';
        ctx.lineWidth = 1;
        const step = 20;
        for (let gx = x; gx <= x + w; gx += step) {
          ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
        }
        for (let gy = y; gy <= y + h; gy += step) {
          ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
        }
        // Axes
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 5, cy); ctx.lineTo(x + w - 5, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, y + h - 5); ctx.lineTo(cx, y + 5); ctx.stroke();
        drawArrowHead(ctx, x + w - 18, cy, x + w - 4, cy, 9);
        drawArrowHead(ctx, cx, y + 18, cx, y + 4, 9);
        dimBadge(ctx, x + w - 16, cy + 16, 'x', color);
        dimBadge(ctx, cx - 16, y + 16, 'y', color);
        break;
      }

      case 'curve-parabola': {
        const cx = x + w / 2, cy = y + h * 0.85;
        // Axes
        ctx.strokeStyle = color + '44'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 10, cy); ctx.lineTo(x + w - 10, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + h - 5); ctx.stroke();
        // Parabola curve y = a x^2
        ctx.strokeStyle = color; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let px = -w * 0.42; px <= w * 0.42; px += 2) {
          const py = -(0.015 * px * px);
          if (px === -w * 0.42) ctx.moveTo(cx + px, cy + py); else ctx.lineTo(cx + px, cy + py);
        }
        ctx.stroke();
        dimBadge(ctx, cx, y - 12, 'y = x²', color);
        break;
      }

      case 'curve-sine':
      case 'curve-cosine': {
        const cy = y + h / 2;
        ctx.strokeStyle = color + '44'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 5, cy); ctx.lineTo(x + w - 5, cy); ctx.stroke();
        ctx.strokeStyle = color; ctx.lineWidth = 2.5;
        const isCos = s.type === 'curve-cosine';
        ctx.beginPath();
        for (let px = 0; px <= w - 10; px += 2) {
          const t = (px / (w - 10)) * (PI * 4);
          const val = isCos ? Math.cos(t) : Math.sin(t);
          const py = cy - val * (h * 0.35);
          if (px === 0) ctx.moveTo(x + 5 + px, py); else ctx.lineTo(x + 5 + px, py);
        }
        ctx.stroke();
        dimBadge(ctx, x + w / 2, y - 12, isCos ? 'y = cos(x)' : 'y = sin(x)', color);
        break;
      }

      case 'curve-spiral': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath();
        for (let a = 0; a <= PI * 8; a += 0.1) {
          const r = (a / (PI * 8)) * (Math.min(w, h) * 0.46);
          const px = cx + r * Math.cos(a);
          const py = cy + r * Math.sin(a);
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        dimBadge(ctx, cx, y - 12, 'Archimedean Spiral r = aθ', color);
        break;
      }

      // ── TAB 07: MEASUREMENT & INSTRUMENTS ──
      case 'set-square-45': {
        const sSize = Math.min(w, h) - 10;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + 5, y + 5 + sSize);
        ctx.lineTo(x + 5 + sSize, y + 5 + sSize);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56,189,248,0.12)';
        ctx.fill(); ctx.stroke();
        // Inner triangle cutout
        const cut = sSize * 0.4;
        ctx.beginPath();
        ctx.moveTo(x + 25, y + 25 + cut);
        ctx.lineTo(x + 25, y + 5 + sSize - 20);
        ctx.lineTo(x + 5 + sSize - 20 - cut, y + 5 + sSize - 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15,23,42,0.9)';
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + sSize * 0.5, y + sSize + 20, '45°–45° Set Square', color);
        break;
      }

      case 'set-square-30-60': {
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + 10, y + h - 10);
        ctx.lineTo(x + w - 10, y + h - 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56,189,248,0.12)';
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 14, '30°–60°–90° Set Square', color);
        break;
      }

      // ── TAB 08: FRACTIONS & NUMBER MODELS ──
      case 'fraction-bar': {
        const parts = s.totalParts || 4;
        const shaded = s.shadedParts !== undefined ? s.shadedParts : 1;
        const partW = w / parts;
        ctx.strokeRect(x, y, w, h);
        for (let i = 0; i < parts; i++) {
          if (i < shaded) {
            ctx.fillStyle = color + '44';
            ctx.fillRect(x + i * partW, y, partW, h);
          }
          ctx.strokeRect(x + i * partW, y, partW, h);
        }
        dimBadge(ctx, x + w / 2, y - 14, `Fraction: ${shaded}/${parts}`, color);
        break;
      }

      case 'fraction-circle': {
        const parts = s.totalParts || 8;
        const shaded = s.shadedParts !== undefined ? s.shadedParts : 3;
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        for (let i = 0; i < parts; i++) {
          const a1 = -PI / 2 + (i * 2 * PI) / parts;
          const a2 = -PI / 2 + ((i + 1) * 2 * PI) / parts;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, a1, a2);
          ctx.closePath();
          if (i < shaded) {
            ctx.fillStyle = color + '55';
            ctx.fill();
          }
          ctx.stroke();
        }
        dimBadge(ctx, cx, y - 14, `Fraction: ${shaded}/${parts}`, color);
        break;
      }

      case 'decimal-grid-100': {
        const pct = s.percentage || 35;
        const sz = Math.min(w, h);
        const cell = sz / 10;
        let count = 0;
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            count++;
            if (count <= pct) {
              ctx.fillStyle = color + '66';
              ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
            }
            ctx.strokeStyle = color + '44';
            ctx.strokeRect(x + c * cell, y + r * cell, cell, cell);
          }
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.strokeRect(x, y, sz, sz);
        dimBadge(ctx, x + sz / 2, y - 14, `Decimal: ${pct}% = ${(pct / 100).toFixed(2)}`, color);
        break;
      }

      case 'ten-frame': {
        const filled = s.filled || 7;
        const cellW = w / 5, cellH = h / 2;
        ctx.strokeRect(x, y, w, h);
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 5; c++) {
            const idx = r * 5 + c + 1;
            const cx = x + c * cellW + cellW / 2;
            const cy = y + r * cellH + cellH / 2;
            ctx.strokeStyle = color + '66';
            ctx.strokeRect(x + c * cellW, y + r * cellH, cellW, cellH);
            if (idx <= filled) {
              ctx.beginPath();
              ctx.arc(cx, cy, Math.min(cellW, cellH) * 0.32, 0, PI * 2);
              ctx.fillStyle = color;
              ctx.fill();
            }
          }
        }
        dimBadge(ctx, x + w / 2, y - 14, `Ten Frame: ${filled}/10`, color);
        break;
      }

      // ── TAB 09: STATISTICS & PROBABILITY ──
      case 'stat-barchart': {
        const vals = s.data || [40, 75, 55, 90];
        const barW = (w - 30) / vals.length;
        // Axes
        ctx.beginPath(); ctx.moveTo(x + 20, y + 10); ctx.lineTo(x + 20, y + h - 15); ctx.lineTo(x + w - 5, y + h - 15); ctx.stroke();
        vals.forEach((v, idx) => {
          const bh = (v / 100) * (h - 35);
          ctx.fillStyle = color + '44';
          ctx.fillRect(x + 25 + idx * barW, y + h - 15 - bh, barW - 6, bh);
          ctx.strokeStyle = color;
          ctx.strokeRect(x + 25 + idx * barW, y + h - 15 - bh, barW - 6, bh);
        });
        dimBadge(ctx, x + w / 2, y - 14, 'Bar Chart', color);
        break;
      }

      case 'stat-normal-curve': {
        const cy = y + h * 0.85;
        ctx.beginPath(); ctx.moveTo(x + 10, cy); ctx.lineTo(x + w - 10, cy); ctx.stroke();
        ctx.beginPath();
        for (let px = -w * 0.45; px <= w * 0.45; px += 2) {
          const norm = Math.exp(-0.5 * Math.pow(px / (w * 0.16), 2));
          const py = cy - norm * (h * 0.7);
          if (px === -w * 0.45) ctx.moveTo(x + w / 2 + px, py); else ctx.lineTo(x + w / 2 + px, py);
        }
        ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y - 14, 'Normal Distribution N(μ, σ²)', color);
        break;
      }

      // ── TAB 10: ADVANCED MATHEMATICS & VECTORS ──
      case 'math-vector-2d': {
        const vx = s.vx || w * 0.75, vy = s.vy || -h * 0.55;
        const ox = x + 20, oy = y + h - 20;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + vx, oy + vy); ctx.stroke();
        drawArrowHead(ctx, ox + vx * 0.85, oy + vy * 0.85, ox + vx, oy + vy, 12);
        // Components dashed
        guide(ctx, ox, oy, ox + vx, oy);
        guide(ctx, ox + vx, oy, ox + vx, oy + vy);
        dimBadge(ctx, ox + vx / 2, oy + 14, `vₓ`, color);
        dimBadge(ctx, ox + vx + 16, oy + vy / 2, `vᵧ`, color);
        dimBadge(ctx, x + w / 2, y - 14, 'Vector v⃗', color);
        break;
      }

      // ── TAB 11: TABLES & TEACHING DIAGRAMS ──
      case 'diag-venn-2': {
        const cx1 = x + w * 0.38, cx2 = x + w * 0.62;
        const cy = y + h / 2;
        const r = Math.min(w, h) * 0.42;
        ctx.beginPath(); ctx.arc(cx1, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx2, cy, r, 0, PI * 2); ctx.stroke();
        dimBadge(ctx, cx1 - 25, cy, 'A', color);
        dimBadge(ctx, (cx1 + cx2) / 2, cy, 'A∩B', color);
        dimBadge(ctx, cx2 + 25, cy, 'B', color);
        break;
      }

      case 'diag-clock': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        // 12 ticks
        for (let i = 0; i < 12; i++) {
          const a = (i * 2 * PI) / 12;
          ctx.beginPath();
          ctx.moveTo(cx + (r - 10) * Math.cos(a), cy + (r - 10) * Math.sin(a));
          ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
          ctx.stroke();
        }
        // Hands (10:10)
        const hour = s.hour !== undefined ? s.hour : 10;
        const minute = s.minute !== undefined ? s.minute : 10;
        const hAngle = -PI / 2 + (hour % 12 + minute / 60) * (2 * PI / 12);
        const mAngle = -PI / 2 + minute * (2 * PI / 60);
        // Hour hand
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * 0.5 * Math.cos(hAngle), cy + r * 0.5 * Math.sin(hAngle)); ctx.stroke();
        // Minute hand
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * 0.75 * Math.cos(mAngle), cy + r * 0.75 * Math.sin(mAngle)); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        dimBadge(ctx, cx, y - 14, `${hour}:${minute < 10 ? '0' + minute : minute}`, color);
        break;
      }


      // ── TAB 02: CURVES & SPECIAL FIGURES ──
      case 'triskele': {
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.38;
        for (let i = 0; i < 3; i++) {
          const ang = -PI / 2 + i * (2 * PI / 3);
          const sx = cx + r * 0.5 * Math.cos(ang), sy = cy + r * 0.5 * Math.sin(ang);
          ctx.beginPath();
          ctx.arc(sx, sy, r * 0.5, ang, ang + PI * 1.3);
          ctx.stroke();
        }
        dimBadge(ctx, cx, y + h + 16, 'Triskele Spiral', color);
        break;
      }

      case 'superellipse': {
        const cx = x + w / 2, cy = y + h / 2;
        const rx = w * 0.44, ry = h * 0.40;
        ctx.beginPath();
        for (let t = 0; t <= PI * 2; t += 0.05) {
          const ct = Math.cos(t), st = Math.sin(t);
          const px = cx + rx * Math.sign(ct) * Math.pow(Math.abs(ct), 0.5);
          const py = cy + ry * Math.sign(st) * Math.pow(Math.abs(st), 0.5);
          if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Superellipse', color);
        break;
      }

      case 'astroid': {
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.42;
        ctx.beginPath();
        for (let t = 0; t <= PI * 2; t += 0.05) {
          const px = cx + r * Math.pow(Math.cos(t), 3);
          const py = cy + r * Math.pow(Math.sin(t), 3);
          if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Astroid (4-Cusp)', color);
        break;
      }

      case 'cardioid-fig': {
        const cx = x + w * 0.42, cy = y + h / 2, a = Math.min(w, h) * 0.20;
        ctx.beginPath();
        for (let t = 0; t <= PI * 2; t += 0.05) {
          const r = 2 * a * (1 - Math.cos(t));
          const px = cx + r * Math.cos(t);
          const py = cy + r * Math.sin(t);
          if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Cardioid', color);
        break;
      }

      // ── TAB 03: LINES, ANGLES & GEOMETRIC THEOREMS ──
      case 'geom-intersecting': {
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 14); ctx.lineTo(x + w - 12, y + h - 14);
        ctx.moveTo(x + 12, y + h - 14); ctx.lineTo(x + w - 12, y + 14);
        ctx.stroke();
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath(); ctx.arc(cx, cy, 18, -0.6, 0.6); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Intersecting Lines', color);
        break;
      }

      case 'geom-perp-bisector': {
        const my = y + h * 0.45;
        const cx = x + w / 2;
        ctx.beginPath(); ctx.moveTo(x + 16, my); ctx.lineTo(x + w - 16, my); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, y + 12); ctx.lineTo(cx, y + h - 12); ctx.stroke();
        ctx.strokeRect(cx, my - 12, 12, 12);
        dimBadge(ctx, cx, y + h + 16, 'Perpendicular Bisector', color);
        break;
      }

      case 'geom-angle-bisector': {
        const vx = x + 24, vy = y + h - 20;
        ctx.beginPath();
        ctx.moveTo(vx, vy); ctx.lineTo(x + w - 16, vy);
        ctx.moveTo(vx, vy); ctx.lineTo(vx + (w - 40) * Math.cos(-PI/3), vy + (w - 40) * Math.sin(-PI/3));
        ctx.stroke();
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(vx, vy); ctx.lineTo(vx + (w - 30) * Math.cos(-PI/6), vy + (w - 30) * Math.sin(-PI/6));
        ctx.stroke();
        ctx.restore();
        ctx.beginPath(); ctx.arc(vx, vy, 28, -PI/3, -PI/6); ctx.stroke();
        ctx.beginPath(); ctx.arc(vx, vy, 32, -PI/6, 0); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Angle Bisector (α = β)', color);
        break;
      }

      case 'geom-median': {
        const ax = x + w / 2, ay = y + 16;
        const bx = x + 16, by = y + h - 16;
        const cx = x + w - 16, cy = y + h - 16;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.stroke();
        const mx = (bx + cx) / 2, my = (by + cy) / 2;
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(mx, my); ctx.stroke();
        ctx.restore();
        dimBadge(ctx, ax, y + h + 16, 'Median Line', color);
        break;
      }

      case 'geom-altitude': {
        const ax = x + w * 0.42, ay = y + 16;
        const bx = x + 16, by = y + h - 16;
        const cx = x + w - 16, cy = y + h - 16;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.stroke();
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, by); ctx.stroke();
        ctx.restore();
        ctx.strokeRect(ax, by - 10, 10, 10);
        dimBadge(ctx, ax, y + h + 16, 'Altitude h ⟂ Base', color);
        break;
      }

      case 'geom-vert-opp-angles': {
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 16); ctx.lineTo(x + w - 12, y + h - 16);
        ctx.moveTo(x + 12, y + h - 16); ctx.lineTo(x + w - 12, y + 16);
        ctx.stroke();
        const cx = x + w / 2, cy = y + h / 2;
        ctx.fillStyle = '#ef444433';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 22, -0.6, 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 22, PI - 0.6, PI + 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Vert. Opp. Angles (θ₁ = θ₂)', color);
        break;
      }

      case 'geom-alt-interior': {
        const y1 = y + 28, y2 = y + h - 28;
        ctx.beginPath(); ctx.moveTo(x + 8, y1); ctx.lineTo(x + w - 8, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 8, y2); ctx.lineTo(x + w - 8, y2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 24, y + 8); ctx.lineTo(x + w - 24, y + h - 8); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Alternate Interior Angles', color);
        break;
      }

      case 'geom-complementary': {
        const cx = x + 24, cy = y + h - 20;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(x + w - 16, cy);
        ctx.moveTo(cx, cy); ctx.lineTo(cx, y + 16);
        ctx.moveTo(cx, cy); ctx.lineTo(cx + (w - 40) * Math.cos(-PI/4), cy + (w - 40) * Math.sin(-PI/4));
        ctx.stroke();
        ctx.strokeRect(cx, cy - 14, 14, 14);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Complementary (α + β = 90°)', color);
        break;
      }

      case 'geom-supplementary': {
        const cx = x + w / 2, cy = y + h - 20;
        ctx.beginPath();
        ctx.moveTo(x + 12, cy); ctx.lineTo(x + w - 12, cy);
        ctx.moveTo(cx, cy); ctx.lineTo(cx + 42 * Math.cos(-PI * 0.65), cy + 42 * Math.sin(-PI * 0.65));
        ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 22, -PI, -PI * 0.65); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 28, -PI * 0.65, 0); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Supplementary (α + β = 180°)', color);
        break;
      }

      // ── TAB 04: CIRCLES & TANGENTS ──
      case 'circ-intersecting': {
        const cy = y + h / 2, r = 36;
        ctx.beginPath(); ctx.arc(x + w * 0.38, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w * 0.62, cy, r, 0, PI * 2); ctx.stroke();
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x + w / 2, y + 12); ctx.lineTo(x + w / 2, y + h - 12); ctx.stroke();
        ctx.restore();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Intersecting Circles', color);
        break;
      }

      case 'circ-tangent-ext': {
        const cy = y + h / 2, r1 = 30, r2 = 20;
        const c1x = x + 38, c2x = c1x + r1 + r2;
        ctx.beginPath(); ctx.arc(c1x, cy, r1, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(c2x, cy, r2, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c1x + r1, y + 10); ctx.lineTo(c1x + r1, y + h - 10); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'External Tangent', color);
        break;
      }

      case 'circ-tangent-int': {
        const cy = y + h / 2, R = 42, r = 22;
        const cx1 = x + w / 2;
        ctx.beginPath(); ctx.arc(cx1, cy, R, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx1 + R - r, cy, r, 0, PI * 2); ctx.stroke();
        dimBadge(ctx, cx1, y + h + 16, 'Internal Tangent', color);
        break;
      }

      case 'circ-incircle': {
        const ax = x + w / 2, ay = y + 16;
        const bx = x + 16, by = y + h - 16;
        const cx = x + w - 16, cy = y + h - 16;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.stroke();
        const inR = 25, inY = by - inR;
        ctx.beginPath(); ctx.arc(ax, inY, inR, 0, PI * 2); ctx.stroke();
        dimBadge(ctx, ax, y + h + 16, 'Incircle of Triangle', color);
        break;
      }

      case 'circ-circumcircle': {
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.44;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx - r * 0.86, cy + r * 0.5);
        ctx.lineTo(cx + r * 0.86, cy + r * 0.5);
        ctx.closePath(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Circumcircle', color);
        break;
      }

      case 'circ-secant': {
        const cx = x + w / 2, cy = y + h / 2, r = 36;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, cy - 24); ctx.lineTo(x + w - 10, cy - 24); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Secant Line', color);
        break;
      }

      case 'circ-common-tangents': {
        const cy = y + h / 2, r1 = 28, r2 = 18;
        const c1x = x + 36, c2x = x + w - 36;
        ctx.beginPath(); ctx.arc(c1x, cy, r1, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(c2x, cy, r2, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c1x, cy - r1); ctx.lineTo(c2x, cy - r2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c1x, cy + r1); ctx.lineTo(c2x, cy + r2); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Common Tangents', color);
        break;
      }

      case 'frustum-pyramid': {
        const bx = x + 20, by = y + h - 16, bw = w - 40;
        const tx = x + 36, ty = y + 24, tw = w - 72;
        ctx.beginPath();
        ctx.moveTo(tx, ty); ctx.lineTo(tx + tw, ty);
        ctx.lineTo(bx + bw, by); ctx.lineTo(bx, by);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Frustum of Pyramid', color);
        break;
      }

      // ── TAB 05: FUNCTIONS & ANALYTIC GEOMETRY ──
      case 'graph-slope-triangle': {
        const bx = x + 24, by = y + h - 24;
        ctx.beginPath(); ctx.moveTo(bx, y + 10); ctx.lineTo(bx, by); ctx.lineTo(x + w - 10, by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by - 16); ctx.lineTo(x + w - 24, y + 24); ctx.stroke();
        const x1 = bx + 28, y1 = by - 36;
        const x2 = bx + 80, y2 = y + 42;
        ctx.fillStyle = '#f59e0b22';
        ctx.fillRect(x1, y2, x2 - x1, y1 - y2);
        ctx.strokeRect(x1, y2, x2 - x1, y1 - y2);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Slope m = Δy / Δx', color);
        break;
      }

      case 'curve-ellipse-graph': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 10, cy); ctx.lineTo(x + w - 10, cy); ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + h - 10); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.38, h * 0.28, 0, 0, PI * 2); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'x²/a² + y²/b² = 1', color);
        break;
      }

      case 'curve-hyperbola': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 10, cy); ctx.lineTo(x + w - 10, cy); ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + h - 10); ctx.stroke();
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x + 16, y + 16); ctx.lineTo(x + w - 16, y + h - 16); ctx.moveTo(x + 16, y + h - 16); ctx.lineTo(x + w - 16, y + 16); ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        for (let py = -h * 0.35; py <= h * 0.35; py += 3) {
          const px = Math.sqrt(1 + (py / (h * 0.22)) ** 2) * 24;
          if (py === -h * 0.35) ctx.moveTo(cx + px, cy + py); else ctx.lineTo(cx + px, cy + py);
        }
        for (let py = -h * 0.35; py <= h * 0.35; py += 3) {
          const px = -Math.sqrt(1 + (py / (h * 0.22)) ** 2) * 24;
          if (py === -h * 0.35) ctx.moveTo(cx + px, cy + py); else ctx.lineTo(cx + px, cy + py);
        }
        ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Hyperbola', color);
        break;
      }

      case 'curve-exponential': {
        const bx = x + 24, by = y + h - 20;
        ctx.beginPath(); ctx.moveTo(bx, y + 10); ctx.lineTo(bx, by); ctx.lineTo(x + w - 10, by); ctx.stroke();
        ctx.beginPath();
        for (let px = 0; px <= w - 44; px++) {
          const norm = px / (w - 44);
          const py = by - Math.exp(norm * 2.8) * 4;
          if (px === 0) ctx.moveTo(bx + px, py); else ctx.lineTo(bx + px, py);
        }
        ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'y = eˣ', color);
        break;
      }

      case 'curve-log': {
        const bx = x + 36, by = y + h / 2;
        ctx.beginPath(); ctx.moveTo(bx, y + 10); ctx.lineTo(bx, y + h - 10); ctx.moveTo(x + 10, by); ctx.lineTo(x + w - 10, by); ctx.stroke();
        ctx.beginPath();
        for (let px = 4; px <= w - 50; px++) {
          const py = by - Math.log(px / 16) * 18;
          if (px === 4) ctx.moveTo(bx + px, py); else ctx.lineTo(bx + px, py);
        }
        ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'y = ln(x)', color);
        break;
      }

      case 'curve-abs': {
        const cx = x + w / 2, by = y + h - 20;
        ctx.beginPath(); ctx.moveTo(cx, y + 10); ctx.lineTo(cx, by); ctx.moveTo(x + 10, by); ctx.lineTo(x + w - 10, by); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 24); ctx.lineTo(cx, by); ctx.lineTo(x + w - 18, y + 24);
        ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'y = |x|', color);
        break;
      }

      case 'curve-cubic': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 10, cy); ctx.lineTo(x + w - 10, cy); ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + h - 10); ctx.stroke();
        ctx.beginPath();
        for (let px = -w * 0.4; px <= w * 0.4; px += 2) {
          const norm = px / (w * 0.4);
          const py = cy - (norm ** 3) * (h * 0.4);
          if (px === -w * 0.4) ctx.moveTo(cx + px, py); else ctx.lineTo(cx + px, py);
        }
        ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'y = x³', color);
        break;
      }

      case 'curve-cycloid': {
        const by = y + h - 20;
        ctx.beginPath(); ctx.moveTo(x + 10, by); ctx.lineTo(x + w - 10, by); ctx.stroke();
        ctx.beginPath();
        const r = 18;
        for (let t = 0; t <= 2 * PI; t += 0.08) {
          const px = x + 16 + r * (t - Math.sin(t));
          const py = by - r * (1 - Math.cos(t));
          if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Cycloid Arch', color);
        break;
      }

      case 'curve-lissajous': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath();
        for (let t = 0; t <= 2 * PI; t += 0.05) {
          const px = cx + (w * 0.42) * Math.sin(3 * t);
          const py = cy + (h * 0.38) * Math.sin(2 * t);
          if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Lissajous Curve', color);
        break;
      }

      // ── TAB 06: TRANSFORMATIONS & SYMMETRY ──
      case 'trans-translation': {
        ctx.strokeRect(x + 16, y + h - 44, 30, 24);
        drawArrowHead(ctx, x + 46, y + h - 32, x + w - 50, y + 36, 10);
        ctx.fillStyle = color + '22';
        ctx.fillRect(x + w - 46, y + 24, 30, 24); ctx.strokeRect(x + w - 46, y + 24, 30, 24);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Translation T⃗', color);
        break;
      }

      case 'trans-rotation': {
        const cx = x + 34, cy = y + h - 24;
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, PI * 2); ctx.fill();
        ctx.strokeRect(cx + 12, cy - 28, 28, 20);
        ctx.save(); ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(cx, cy, 40, -PI/2, 0); ctx.stroke();
        ctx.restore();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Rotation R(θ)', color);
        break;
      }

      case 'trans-reflection': {
        const cx = x + w / 2;
        ctx.save(); ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(cx, y + 10); ctx.lineTo(cx, y + h - 10); ctx.stroke();
        ctx.restore();
        ctx.beginPath(); ctx.moveTo(cx - 36, y + 32); ctx.lineTo(cx - 12, y + 54); ctx.lineTo(cx - 36, y + 76); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = color + '22';
        ctx.beginPath(); ctx.moveTo(cx + 36, y + 32); ctx.lineTo(cx + 12, y + 54); ctx.lineTo(cx + 36, y + 76); ctx.closePath(); ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Reflection Across Axis', color);
        break;
      }

      case 'trans-dilation': {
        const ox = x + 18, oy = y + h - 18;
        ctx.beginPath(); ctx.arc(ox, oy, 4, 0, PI * 2); ctx.fill();
        ctx.strokeRect(ox + 20, oy - 28, 20, 20);
        ctx.fillStyle = color + '22';
        ctx.fillRect(ox + 60, oy - 70, 40, 40); ctx.strokeRect(ox + 60, oy - 70, 40, 40);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Dilation Scale (k=2)', color);
        break;
      }

      case 'trans-line-symmetry': {
        const cx = x + w / 2;
        ctx.save(); ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(cx, y + 12); ctx.lineTo(cx, y + h - 12); ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(cx, y + 26);
        ctx.bezierCurveTo(cx - 40, y + 10, cx - 40, y + h - 16, cx, y + h - 26);
        ctx.bezierCurveTo(cx + 40, y + h - 16, cx + 40, y + 10, cx, y + 26);
        ctx.fillStyle = color + '15'; ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Line of Symmetry', color);
        break;
      }

      case 'trans-rot-symmetry': {
        const cx = x + w / 2, cy = y + h / 2;
        const r = 26;
        for (let i = 0; i < 4; i++) {
          const ang = i * (PI / 2);
          ctx.beginPath();
          ctx.arc(cx + r * Math.cos(ang), cy + r * Math.sin(ang), 14, 0, PI * 2);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, PI * 2); ctx.fill();
        dimBadge(ctx, cx, y + h + 16, 'Rotational Symmetry 90°', color);
        break;
      }

      case 'tess-square': {
        const cols = 4, rows = 4;
        const sw = (w - 24) / cols, sh = (h - 24) / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const sx = x + 12 + c * sw, sy = y + 12 + r * sh;
            ctx.strokeRect(sx, sy, sw, sh);
            if ((r + c) % 2 === 0) {
              ctx.fillStyle = color + '28'; ctx.fillRect(sx, sy, sw, sh);
            }
          }
        }
        dimBadge(ctx, x + w / 2, y + h + 16, 'Square Tessellation', color);
        break;
      }

      case 'tess-hexagon': {
        const cx = x + w / 2, cy = y + h / 2;
        const hexR = 18;
        function drawHex(hx, hy) {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = i * PI / 3;
            const px = hx + hexR * Math.cos(a), py = hy + hexR * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke();
        }
        drawHex(cx, cy);
        drawHex(cx - hexR * 1.5, cy - hexR * 0.86);
        drawHex(cx + hexR * 1.5, cy - hexR * 0.86);
        drawHex(cx - hexR * 1.5, cy + hexR * 0.86);
        drawHex(cx + hexR * 1.5, cy + hexR * 0.86);
        dimBadge(ctx, cx, y + h + 16, 'Hexagonal Honeycomb', color);
        break;
      }

      case 'tess-triangle': {
        const cols = 5, tw = (w - 24) / cols;
        const th = (h - 28) / 2;
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < cols; c++) {
            const tx = x + 12 + c * tw, ty = y + 14 + r * th;
            ctx.beginPath();
            ctx.moveTo(tx, ty + th); ctx.lineTo(tx + tw/2, ty); ctx.lineTo(tx + tw, ty + th);
            ctx.closePath(); ctx.stroke();
          }
        }
        dimBadge(ctx, x + w / 2, y + h + 16, 'Triangular Tessellation', color);
        break;
      }

      case 'fractal-sierpinski': {
        function sierp(ax, ay, bx, by, cx, cy, d) {
          if (d === 0) {
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath();
            ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke();
            return;
          }
          const m1x = (ax + bx)/2, m1y = (ay + by)/2;
          const m2x = (bx + cx)/2, m2y = (by + cy)/2;
          const m3x = (cx + ax)/2, m3y = (cy + ay)/2;
          sierp(ax, ay, m1x, m1y, m3x, m3y, d - 1);
          sierp(m1x, m1y, bx, by, m2x, m2y, d - 1);
          sierp(m3x, m3y, m2x, m2y, cx, cy, d - 1);
        }
        sierp(x + w / 2, y + 16, x + 16, y + h - 16, x + w - 16, y + h - 16, 3);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Sierpiński Triangle', color);
        break;
      }

      case 'fractal-koch': {
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.40;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = -PI/2 + i * 2 * PI / 3;
          const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = PI/2 + i * 2 * PI / 3;
          const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Koch Snowflake', color);
        break;
      }

      case 't-square': {
        ctx.fillStyle = '#64748b33';
        ctx.fillRect(x + 12, y + 12, 14, h - 24); ctx.strokeRect(x + 12, y + 12, 14, h - 24);
        ctx.fillRect(x + 26, y + h * 0.44, w - 38, 20); ctx.strokeRect(x + 26, y + h * 0.44, w - 38, 20);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Drafting T-Square', color);
        break;
      }

      case 'grid-overlay': {
        ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
        ctx.save(); ctx.lineWidth = 0.8; ctx.strokeStyle = color + '44';
        for (let gx = x + 24; gx < x + w - 16; gx += 16) {
          ctx.beginPath(); ctx.moveTo(gx, y + 8); ctx.lineTo(gx, y + h - 8); ctx.stroke();
        }
        for (let gy = y + 24; gy < y + h - 16; gy += 16) {
          ctx.beginPath(); ctx.moveTo(x + 8, gy); ctx.lineTo(x + w - 8, gy); ctx.stroke();
        }
        ctx.restore();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Graph Grid Sheet', color);
        break;
      }

      case 'fraction-wall': {
        const rows = [1, 2, 3, 4];
        const rh = (h - 28) / 4;
        rows.forEach((divs, rIdx) => {
          const rw = (w - 24) / divs;
          for (let i = 0; i < divs; i++) {
            const rx = x + 12 + i * rw, ry = y + 12 + rIdx * rh;
            ctx.strokeRect(rx, ry, rw, rh);
            ctx.font = '600 10.5px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            ctx.fillText(divs === 1 ? '1 Whole' : `1/${divs}`, rx + rw / 2, ry + rh / 2);
          }
        });
        dimBadge(ctx, x + w / 2, y + h + 16, 'Fraction Wall', color);
        break;
      }

      case 'fraction-strip': {
        const rows = [1, 2, 4];
        const rh = (h - 28) / 3;
        rows.forEach((divs, rIdx) => {
          const rw = (w - 24) / divs;
          for (let i = 0; i < divs; i++) {
            const rx = x + 12 + i * rw, ry = y + 12 + rIdx * rh;
            ctx.strokeRect(rx, ry, rw, rh);
            if (i === 0 && divs > 1) { ctx.fillStyle = color + '33'; ctx.fillRect(rx, ry, rw, rh); }
            ctx.font = '600 10.5px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = color; ctx.fillText(divs === 1 ? '1' : `1/${divs}`, rx + rw/2, ry + rh/2);
          }
        });
        dimBadge(ctx, x + w / 2, y + h + 16, 'Fraction Strips', color);
        break;
      }

      case 'hundred-chart': {
        const sz = Math.min(w, h) - 24;
        const bx = x + (w - sz) / 2, by = y + 10;
        ctx.strokeRect(bx, by, sz, sz);
        const cell = sz / 10;
        ctx.save(); ctx.lineWidth = 0.6; ctx.strokeStyle = color + '44';
        for (let i = 1; i < 10; i++) {
          ctx.beginPath(); ctx.moveTo(bx + i * cell, by); ctx.lineTo(bx + i * cell, by + sz); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx, by + i * cell); ctx.lineTo(bx + sz, by + i * cell); ctx.stroke();
        }
        ctx.restore();
        dimBadge(ctx, x + w / 2, y + h + 16, '10×10 Hundred Chart', color);
        break;
      }

      case 'base-ten-blocks': {
        ctx.strokeRect(x + 16, y + 24, 48, 48);
        ctx.fillStyle = color + '22'; ctx.fillRect(x + 16, y + 24, 48, 48);
        ctx.strokeRect(x + 76, y + 24, 12, 48);
        ctx.strokeRect(x + 94, y + 24, 12, 48);
        for (let u = 0; u < 4; u++) {
          ctx.strokeRect(x + 118 + (u % 2) * 14, y + 24 + Math.floor(u / 2) * 14, 10, 10);
        }
        dimBadge(ctx, x + w / 2, y + h + 16, 'Base-10 (124)', color);
        break;
      }

      case 'abacus-model': {
        ctx.strokeRect(x + 14, y + 16, w - 28, h - 32);
        const by = y + 16 + (h - 32) * 0.35;
        ctx.beginPath(); ctx.moveTo(x + 14, by); ctx.lineTo(x + w - 14, by); ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const wx = x + 28 + i * (w - 56) / 4;
          ctx.beginPath(); ctx.moveTo(wx, y + 16); ctx.lineTo(wx, y + h - 16); ctx.stroke();
          ctx.beginPath(); ctx.arc(wx, by - 12, 6, 0, PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(wx, by + 16, 6, 0, PI * 2); ctx.fillStyle = '#38bdf8'; ctx.fill(); ctx.stroke();
        }
        dimBadge(ctx, x + w / 2, y + h + 16, 'Abacus', color);
        break;
      }

      // ── TAB 09: STATISTICS & CHARTS ──
      case 'stat-histogram': {
        const bx = x + 20, by = y + h - 22;
        ctx.beginPath(); ctx.moveTo(bx, y + 12); ctx.lineTo(bx, by); ctx.lineTo(x + w - 12, by); ctx.stroke();
        const heights = [30, 65, 90, 75, 40, 20];
        const barW = (w - 44) / heights.length;
        heights.forEach((ht, i) => {
          const bh = (ht / 100) * (h - 44);
          ctx.fillStyle = color + '33';
          ctx.fillRect(bx + i * barW, by - bh, barW, bh);
          ctx.strokeRect(bx + i * barW, by - bh, barW, bh);
        });
        dimBadge(ctx, x + w / 2, y + h + 16, 'Histogram (Continuous)', color);
        break;
      }

      case 'stat-piechart': {
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.38;
        const slices = [0.35, 0.25, 0.25, 0.15];
        const colors = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899'];
        let curAng = -PI / 2;
        slices.forEach((s, idx) => {
          const nextAng = curAng + s * 2 * PI;
          ctx.beginPath();
          ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, curAng, nextAng); ctx.closePath();
          ctx.fillStyle = colors[idx] + '66'; ctx.fill(); ctx.stroke();
          curAng = nextAng;
        });
        dimBadge(ctx, cx, y + h + 16, 'Pie Chart', color);
        break;
      }

      case 'stat-doughnut': {
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.38, ir = r * 0.55;
        const slices = [0.4, 0.35, 0.25];
        const colors = ['#38bdf8', '#f59e0b', '#10b981'];
        let curAng = -PI / 2;
        slices.forEach((s, idx) => {
          const nextAng = curAng + s * 2 * PI;
          ctx.beginPath();
          ctx.arc(cx, cy, r, curAng, nextAng);
          ctx.arc(cx, cy, ir, nextAng, curAng, true);
          ctx.closePath();
          ctx.fillStyle = colors[idx] + '66'; ctx.fill(); ctx.stroke();
          curAng = nextAng;
        });
        dimBadge(ctx, cx, y + h + 16, 'Doughnut Chart', color);
        break;
      }

      case 'stat-linegraph': {
        const bx = x + 24, by = y + h - 22;
        ctx.beginPath(); ctx.moveTo(bx, y + 12); ctx.lineTo(bx, by); ctx.lineTo(x + w - 12, by); ctx.stroke();
        const pts = [20, 65, 45, 90, 80, 100];
        ctx.beginPath();
        pts.forEach((pt, idx) => {
          const px = bx + idx * (w - 44) / (pts.length - 1);
          const py = by - (pt / 110) * (h - 40);
          if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
        pts.forEach((pt, idx) => {
          const px = bx + idx * (w - 44) / (pts.length - 1);
          const py = by - (pt / 110) * (h - 40);
          ctx.beginPath(); ctx.arc(px, py, 4, 0, PI * 2); ctx.fillStyle = color; ctx.fill();
        });
        dimBadge(ctx, x + w / 2, y + h + 16, 'Line Graph', color);
        break;
      }

      case 'stat-scatterplot': {
        const bx = x + 24, by = y + h - 22;
        ctx.beginPath(); ctx.moveTo(bx, y + 12); ctx.lineTo(bx, by); ctx.lineTo(x + w - 12, by); ctx.stroke();
        const raw = [[20, 30], [35, 45], [50, 40], [60, 75], [80, 70], [95, 90]];
        raw.forEach(([rx, ry]) => {
          const px = bx + (rx / 110) * (w - 44);
          const py = by - (ry / 110) * (h - 40);
          ctx.beginPath(); ctx.arc(px, py, 3.5, 0, PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill();
        });
        ctx.save(); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(bx + 10, by - 20); ctx.lineTo(x + w - 20, y + 24); ctx.stroke();
        ctx.restore();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Scatter Plot & Trend', color);
        break;
      }

      case 'stat-boxplot': {
        const my = y + h / 2;
        ctx.beginPath(); ctx.moveTo(x + 20, my); ctx.lineTo(x + 60, my); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 60, my); ctx.lineTo(x + w - 20, my); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 20, my - 12); ctx.lineTo(x + 20, my + 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 20, my - 12); ctx.lineTo(x + w - 20, my + 12); ctx.stroke();
        ctx.fillStyle = color + '22';
        ctx.fillRect(x + 60, my - 18, w - 120, 36); ctx.strokeRect(x + 60, my - 18, w - 120, 36);
        ctx.beginPath(); ctx.moveTo(x + w * 0.44, my - 18); ctx.lineTo(x + w * 0.44, my + 18); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Box Plot (IQR)', color);
        break;
      }

      case 'stat-prob-tree': {
        const ox = x + 24, oy = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(ox, oy); ctx.lineTo(x + w * 0.52, y + 26);
        ctx.moveTo(ox, oy); ctx.lineTo(x + w * 0.52, y + h - 26);
        ctx.moveTo(x + w * 0.52, y + 26); ctx.lineTo(x + w - 24, y + 16);
        ctx.moveTo(x + w * 0.52, y + 26); ctx.lineTo(x + w - 24, y + 42);
        ctx.moveTo(x + w * 0.52, y + h - 26); ctx.lineTo(x + w - 24, y + h - 42);
        ctx.moveTo(x + w * 0.52, y + h - 26); ctx.lineTo(x + w - 24, y + h - 16);
        ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Probability Tree', color);
        break;
      }

      // ── TAB 10: ADVANCED MATHEMATICS & VECTORS ──
      case 'math-vector-3d': {
        const ox = x + 36, oy = y + h - 36;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x + w - 16, oy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, y + 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - 22, y + h - 14); ctx.stroke();
        drawArrowHead(ctx, ox, oy, x + w - 34, y + 34, 11);
        dimBadge(ctx, x + w / 2, y + h + 16, '3D Vector v⃗', color);
        break;
      }

      case 'math-vector-add': {
        const ox = x + 24, oy = y + h - 24;
        const uX = ox + 70, uY = oy - 12;
        const vX = ox + 36, vY = oy - 60;
        drawArrowHead(ctx, ox, oy, uX, uY, 9);
        drawArrowHead(ctx, ox, oy, vX, vY, 9);
        ctx.save(); ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(uX, uY); ctx.lineTo(uX + (vX - ox), uY + (vY - oy)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vX, vY); ctx.lineTo(uX + (vX - ox), uY + (vY - oy)); ctx.stroke();
        ctx.restore();
        drawArrowHead(ctx, ox, oy, uX + (vX - ox), uY + (vY - oy), 11);
        dimBadge(ctx, x + w / 2, y + h + 16, 'u⃗ + v⃗ Resultant', color);
        break;
      }

      case 'math-dot-product': {
        const ox = x + 30, oy = y + h - 26;
        drawArrowHead(ctx, ox, oy, x + w - 20, oy, 10);
        drawArrowHead(ctx, ox, oy, ox + 80 * Math.cos(-0.75), oy + 80 * Math.sin(-0.75), 10);
        ctx.beginPath(); ctx.arc(ox, oy, 26, -0.75, 0); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'u⃗ · v⃗ = |u||v|cosθ', color);
        break;
      }

      case 'math-cross-product': {
        const ox = x + 36, oy = y + h - 30;
        drawArrowHead(ctx, ox, oy, x + w - 24, oy, 10);
        drawArrowHead(ctx, ox, oy, ox + 50, oy - 24, 10);
        drawArrowHead(ctx, ox, oy, ox, y + 20, 11);
        dimBadge(ctx, x + w / 2, y + h + 16, 'u⃗ × v⃗ ⟂ Plane', color);
        break;
      }

      case 'math-3d-plane': {
        ctx.beginPath();
        ctx.moveTo(x + 40, y + 24); ctx.lineTo(x + w - 16, y + 24);
        ctx.lineTo(x + w - 40, y + h - 24); ctx.lineTo(x + 16, y + h - 24);
        ctx.closePath();
        ctx.fillStyle = color + '22'; ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Plane Ax + By + Cz = D', color);
        break;
      }

      case 'math-matrix-2x2': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x + 28, y + 16); ctx.lineTo(x + 18, y + 16); ctx.lineTo(x + 18, y + h - 16); ctx.lineTo(x + 28, y + h - 16);
        ctx.moveTo(x + w - 28, y + 16); ctx.lineTo(x + w - 18, y + 16); ctx.lineTo(x + w - 18, y + h - 16); ctx.lineTo(x + w - 28, y + h - 16);
        ctx.stroke();
        ctx.font = '700 15px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText('a₁₁', cx - 22, cy - 14); ctx.fillText('a₁₂', cx + 22, cy - 14);
        ctx.fillText('a₂₁', cx - 22, cy + 14); ctx.fillText('a₂₂', cx + 22, cy + 14);
        dimBadge(ctx, cx, y + h + 16, 'Matrix [2×2]', color);
        break;
      }

      case 'math-integral-sign': {
        const cx = x + w / 2, cy = y + h / 2 - 4;
        ctx.font = '700 48px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.fillText('∫', cx - 24, cy);
        ctx.font = '600 16px "JetBrains Mono", monospace';
        ctx.fillText('f(x) dx', cx + 18, cy);
        dimBadge(ctx, cx, y + h + 16, 'Integral', color);
        break;
      }

      case 'math-summation-sign': {
        const cx = x + w / 2, cy = y + h / 2 - 4;
        ctx.font = '700 44px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.fillText('∑', cx - 18, cy);
        ctx.font = '600 11px monospace';
        ctx.fillText('i=1', cx - 18, cy + 28);
        ctx.fillText('n', cx - 18, cy - 28);
        ctx.font = '600 15px monospace';
        ctx.fillText('xᵢ', cx + 22, cy);
        dimBadge(ctx, cx, y + h + 16, 'Summation', color);
        break;
      }

      // ── TAB 11: TABLES & DIAGRAMS ──
      case 'diag-mult-table': {
        ctx.strokeRect(x + 12, y + 12, w - 24, h - 24);
        const cell = (w - 24) / 4;
        ctx.save(); ctx.lineWidth = 0.8; ctx.strokeStyle = color + '44';
        for (let i = 1; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(x + 12 + i * cell, y + 12); ctx.lineTo(x + 12 + i * cell, y + h - 12); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + 12, y + 12 + i * cell); ctx.lineTo(x + w - 12, y + 12 + i * cell); ctx.stroke();
        }
        ctx.restore();
        ctx.font = '700 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.fillText('×', x + 12 + cell/2, y + 12 + cell/2);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Multiplication Table', color);
        break;
      }

      case 'diag-venn-3': {
        const cx = x + w / 2, cy = y + h / 2 - 4, r = Math.min(w, h) * 0.32;
        ctx.beginPath(); ctx.arc(cx, cy - r * 0.45, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - r * 0.45, cy + r * 0.35, r, 0, PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + r * 0.45, cy + r * 0.35, r, 0, PI * 2); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, '3-Set Venn (A ∩ B ∩ C)', color);
        break;
      }

      case 'diag-factor-tree': {
        const cx = x + w / 2;
        ctx.beginPath(); ctx.arc(cx, y + 24, 14, 0, PI * 2); ctx.stroke();
        ctx.font = '700 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.fillText('24', cx, y + 24);
        ctx.beginPath();
        ctx.moveTo(cx, y + 38); ctx.lineTo(cx - 36, y + 60);
        ctx.moveTo(cx, y + 38); ctx.lineTo(cx + 36, y + 60);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 36, y + 68, 12, 0, PI * 2); ctx.stroke(); ctx.fillText('4', cx - 36, y + 68);
        ctx.beginPath(); ctx.arc(cx + 36, y + 68, 12, 0, PI * 2); ctx.stroke(); ctx.fillText('6', cx + 36, y + 68);
        dimBadge(ctx, cx, y + h + 16, 'Factor Tree', color);
        break;
      }

      case 'diag-balance-scale': {
        const cx = x + w / 2;
        ctx.beginPath(); ctx.moveTo(cx, y + 16); ctx.lineTo(cx, y + h - 16); ctx.stroke();
        ctx.strokeRect(cx - 24, y + h - 16, 48, 8);
        ctx.beginPath(); ctx.moveTo(x + 20, y + 24); ctx.lineTo(x + w - 20, y + 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 20, y + 24); ctx.lineTo(x + 12, y + 54); ctx.lineTo(x + 36, y + 54); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - 20, y + 24); ctx.lineTo(x + w - 28, y + 54); ctx.lineTo(x + w - 4, y + 54); ctx.closePath(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Balance Scale (Equation)', color);
        break;
      }

      case 'diag-truth-table': {
        ctx.strokeRect(x + 12, y + 12, w - 24, h - 24);
        ctx.beginPath(); ctx.moveTo(x + 12, y + 34); ctx.lineTo(x + w - 12, y + 34); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.35, y + 12); ctx.lineTo(x + w * 0.35, y + h - 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w * 0.65, y + 12); ctx.lineTo(x + w * 0.65, y + h - 12); ctx.stroke();
        ctx.font = '700 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText('A', x + w * 0.20, y + 23);
        ctx.fillText('B', x + w * 0.50, y + 23);
        ctx.fillText('A ∧ B', x + w * 0.82, y + 23);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Truth Table', color);
        break;
      }

      case 'diag-flow-process': {
        ctx.strokeRect(x + 16, y + 14, w - 32, h - 28);
        ctx.fillStyle = color + '15'; ctx.fillRect(x + 16, y + 14, w - 32, h - 28);
        dimBadge(ctx, x + w / 2, y + h + 16, 'Process Step', color);
        break;
      }

      case 'diag-flow-decision': {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(cx, y + 10); ctx.lineTo(x + w - 12, cy); ctx.lineTo(cx, y + h - 10); ctx.lineTo(x + 12, cy);
        ctx.closePath();
        ctx.fillStyle = '#f59e0b15'; ctx.fill(); ctx.stroke();
        dimBadge(ctx, cx, y + h + 16, 'Decision ?', '#f59e0b');
        break;
      }

      case 'diag-flow-terminus': {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x + 14, y + 14, w - 28, h - 28, (h - 28) / 2);
        else ctx.rect(x + 14, y + 14, w - 28, h - 28);
        ctx.fillStyle = '#10b98115'; ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'START / END', '#10b981');
        break;
      }

      case 'smart-bezier': {
        ctx.beginPath();
        ctx.moveTo(x + 16, y + h - 16);
        ctx.bezierCurveTo(x + 30, y + 16, x + w - 30, y + 16, x + w - 16, y + h - 16);
        ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h + 16, 'Bézier Curve', color);
        break;
      }

      // Default fallback: crisp rounded box with label
      default: {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
        else ctx.rect(x, y, w, h);
        ctx.fill(); ctx.stroke();
        dimBadge(ctx, x + w / 2, y + h / 2, s.label || s.type, color);
        break;
      }
    }

    if (s.selected) {
      selectionHandles(ctx, x, y, w, h);
    }

    ctx.restore();
  }

  return {
    GEOMETRY_SHAPE_DEFS,
    isGeometryShape,
    getBounds,
    draw
  };
})();
