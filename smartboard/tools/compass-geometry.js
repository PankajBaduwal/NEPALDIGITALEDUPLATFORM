'use strict';

// ══════════════════════════════════════════════════════════════════════════
// COMPASS GEOMETRY — pure maths for the Smart Board compass (no DOM).
//
// Conventions
//  • All geometry is in BOARD coordinates (the same space shapes and strokes use);
//    zoom / pan / device-pixel-ratio are applied only when drawing.
//  • Internal angles are SCREEN radians: 0 = pointing right, positive = clockwise on
//    screen (because the board's y axis points down). This matches canvas ctx.arc().
//  • Arcs are { start, sweep }: they begin at `start` and run `sweep` radians; a positive
//    sweep is clockwise on screen, a negative sweep anticlockwise. |sweep| = 2π is a full circle.
//  • Numeric angles shown to the teacher use the MATHS convention: degrees measured
//    anticlockwise from the right (like a protractor). toScreenArc() converts.
//  • Board units: 10 board units = 1 cm on the board's measuring scale (the same SCALE
//    the ruler and angle tools use). This is a board scale, not a physical screen centimetre.
// ══════════════════════════════════════════════════════════════════════════

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CompassGeometry = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const TAU = Math.PI * 2;
  const UNITS_PER_CM = 10;
  const MIN_RADIUS = 5;      // 0.5 cm
  const MAX_RADIUS = 20000;  // 2000 cm — far beyond any board page

  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

  /** Valid radius or null (NaN, infinite, zero or negative input never reaches the board). */
  function clampRadius(r, min = MIN_RADIUS, max = MAX_RADIUS) {
    if (!isNum(r) || r <= 0) return null;
    return Math.min(max, Math.max(min, r));
  }

  /** Angle in [0, 2π). */
  function normalize(a) {
    if (!isNum(a)) return 0;
    const m = a % TAU;
    return m < 0 ? m + TAU : m;
  }

  /** Smallest signed difference b − a, in (−π, π]. */
  function angleDelta(a, b) {
    let d = normalize(b) - normalize(a);
    if (d > Math.PI) d -= TAU;
    if (d <= -Math.PI) d += TAU;
    return d;
  }

  function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  /** Point on the circle: x = cx + r·cos θ, y = cy + r·sin θ. */
  function pointAt(cx, cy, r, theta) {
    return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
  }

  const degToRad = (d) => (d * Math.PI) / 180;
  const radToDeg = (r) => (r * 180) / Math.PI;
  const cmToUnits = (cm) => cm * UNITS_PER_CM;
  const unitsToCm = (u) => u / UNITS_PER_CM;

  /**
   * Maths-convention arc (degrees, anticlockwise from the right, from startDeg to endDeg)
   * → screen arc { start, sweep }. Equal angles mean a full circle.
   */
  function toScreenArc(startDeg, endDeg) {
    if (!isNum(startDeg) || !isNum(endDeg)) return null;
    let ccw = ((endDeg - startDeg) % 360 + 360) % 360;
    if (ccw === 0) ccw = 360;
    return { start: normalize(-degToRad(startDeg)), sweep: -degToRad(ccw) };
  }

  /** Screen arc → maths-convention degrees { startDeg, endDeg } (for display / editing). */
  function toMathsDegrees(arc) {
    const startDeg = ((radToDeg(-arc.start) % 360) + 360) % 360;
    const endDeg = ((radToDeg(-(arc.start + arc.sweep)) % 360) + 360) % 360;
    return { startDeg, endDeg };
  }

  const isFull = (sweep) => Math.abs(sweep) >= TAU - 1e-9;

  /**
   * Accumulates a hand-drawn sweep: the pencil moved from angle `prev` to `next`; returns the
   * new total, clamped to one full turn in either direction (no drift: always derived from angles).
   */
  function accumulateSweep(total, prev, next) {
    const t = total + angleDelta(prev, next);
    return Math.max(-TAU, Math.min(TAU, t));
  }

  /** Is screen angle `theta` inside the arc { start, sweep }? */
  function angleInArc(theta, start, sweep) {
    if (isFull(sweep)) return true;
    const t = normalize(theta - start);
    if (sweep >= 0) return t <= sweep + 1e-9;
    return t === 0 || t >= TAU + sweep - 1e-9;
  }

  /** Distance from point p to the drawn curve of a circle/arc shape. */
  function distanceToArc(px, py, s) {
    const d = Math.hypot(px - s.cx, py - s.cy);
    const theta = Math.atan2(py - s.cy, px - s.cx);
    if (angleInArc(theta, s.start, s.sweep)) return Math.abs(d - s.r);
    const a = pointAt(s.cx, s.cy, s.r, s.start);
    const b = pointAt(s.cx, s.cy, s.r, s.start + s.sweep);
    return Math.min(Math.hypot(px - a.x, py - a.y), Math.hypot(px - b.x, py - b.y));
  }

  /** Tight bounding box of a circle or arc (includes the axis extremes the arc passes). */
  function arcBounds(s) {
    if (isFull(s.sweep)) return { x: s.cx - s.r, y: s.cy - s.r, w: s.r * 2, h: s.r * 2 };
    const pts = [pointAt(s.cx, s.cy, s.r, s.start), pointAt(s.cx, s.cy, s.r, s.start + s.sweep)];
    for (const q of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
      if (angleInArc(q, s.start, s.sweep)) pts.push(pointAt(s.cx, s.cy, s.r, q));
    }
    if (s.fill) pts.push({ x: s.cx, y: s.cy }); // a filled arc is a sector, it reaches the centre
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
  }

  /** Points along the curve (for tests, eraser checks and exports that need polylines). */
  function arcPoints(cx, cy, r, start, sweep, segments) {
    const n = Math.max(8, segments || Math.ceil(Math.abs(sweep) / (Math.PI / 90)));
    const out = [];
    for (let i = 0; i <= n; i++) out.push(pointAt(cx, cy, r, start + (sweep * i) / n));
    return out;
  }

  // ── instrument state transforms (the overlay; never stored on the board) ──
  /** The pencil point of an instrument { cx, cy, r, angle }. */
  const pencilOf = (c) => pointAt(c.cx, c.cy, c.r, c.angle);

  /** Rotate the instrument: the pivot never moves, the radius never changes. */
  function rotate(c, angle) {
    return { ...c, angle: normalize(angle) };
  }

  /** Change the radius by dragging the pencil to point p: the pivot never moves. */
  function setPencil(c, p, min, max) {
    const r = clampRadius(distance({ x: c.cx, y: c.cy }, p), min, max);
    if (r === null) return c;
    return { ...c, r, angle: normalize(Math.atan2(p.y - c.cy, p.x - c.cx)) };
  }

  /** Move the needle to p while the pencil stays where it is (radius and angle follow). */
  function movePivot(c, p, min, max) {
    const pencil = pencilOf(c);
    const r = clampRadius(distance(p, pencil), min, max);
    if (r === null) return c;
    return { ...c, cx: p.x, cy: p.y, r, angle: normalize(Math.atan2(pencil.y - p.y, pencil.x - p.x)) };
  }

  /** Move the whole instrument: radius and orientation unchanged. */
  function moveBody(c, dx, dy) {
    if (!isNum(dx) || !isNum(dy)) return c;
    return { ...c, cx: c.cx + dx, cy: c.cy + dy };
  }

  /** Set the radius directly (numeric entry): pivot and orientation unchanged. */
  function setRadius(c, r, min, max) {
    const v = clampRadius(r, min, max);
    return v === null ? c : { ...c, r: v };
  }

  /** Circle through a centre and a point on the circumference. */
  function circleFromCenterAndPoint(c, p, min, max) {
    const r = clampRadius(distance(c, p), min, max);
    if (r === null) return null;
    return { cx: c.x, cy: c.y, r, start: 0, sweep: TAU, angle: normalize(Math.atan2(p.y - c.y, p.x - c.x)) };
  }

  // ── screen ⇄ board (mirrors Canvas.screenToBoard / boardToScreen) ──
  const screenToBoard = (sx, sy, v) => ({ x: (sx - v.panX) / v.zoom, y: (sy - v.panY) / v.zoom });
  const boardToScreen = (bx, by, v) => ({ x: bx * v.zoom + v.panX, y: by * v.zoom + v.panY });

  /** Length / angle labels using the board scale. */
  function formatCm(units) {
    const cm = unitsToCm(units);
    return `${Math.abs(cm - Math.round(cm)) < 0.005 ? Math.round(cm) : cm.toFixed(2)} cm`;
  }

  return {
    TAU, UNITS_PER_CM, MIN_RADIUS, MAX_RADIUS,
    clampRadius, normalize, angleDelta, distance, pointAt, degToRad, radToDeg, cmToUnits, unitsToCm,
    toScreenArc, toMathsDegrees, isFull, accumulateSweep, angleInArc, distanceToArc, arcBounds, arcPoints,
    pencilOf, rotate, setPencil, movePivot, moveBody, setRadius, circleFromCenterAndPoint,
    screenToBoard, boardToScreen, formatCm,
  };
});
