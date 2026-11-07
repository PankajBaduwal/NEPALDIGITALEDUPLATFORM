'use strict';

// ═══════════════════════════════════════════════════════════
// CIRCLE DRAW — ACCURACY SCORING (pure maths, no DOM, no network)
// Works in the browser (window.CircleScore) and in Node (module.exports) for unit tests.
//
// Method
//  1. Clean: drop non-finite points and points closer than `minStep` px to the previous kept point.
//  2. Resample the path to N points equally spaced by arc length, so slow/fast drawing does not
//     bias the fit towards where the pen lingered.
//  3. Fit a circle: Kåsa algebraic least squares on mean-centred data (closed form, stable),
//     refined by Gauss–Newton iterations on the geometric error  Σ (|p − c| − r)².
//  4. Measure (all relative to the fitted radius r so the score does not depend on size):
//       rms        RMS radial error  √mean((|p − c| − r)²) / r
//       maxErr     largest radial error / r
//       gap        distance between the first and last point / r
//       coverage   share of 10° sectors around the centre that the path visits (0–360°)
//       turns      net angle swept along the path / 360°
//       aspect     √(minor / major) eigenvalue ratio of the point spread (1 = round, < 1 = oval)
//  5. Reject inputs that are not a circle attempt (too few points, tiny, straight line, short arc,
//     scribble with several loops) with score 0 and a reason, instead of a misleading score.
//  6. Score = 100 × roundness × closureFactor × coverageFactor × aspectFactor, clamped to 0–100,
//     where roundness = exp(−(rms / σ)²) and σ depends on the difficulty.
// Same input → same output (no randomness).
// ═══════════════════════════════════════════════════════════
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CircleScore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const TAU = Math.PI * 2;

  /** Difficulty settings. σ is the RMS error (as a share of r) at which roundness falls to e⁻¹ ≈ 37%. */
  const MODES = {
    easy:   { sigma: 0.10, minSize: 60,  seconds: 15, label: 'Easy' },
    medium: { sigma: 0.075, minSize: 90, seconds: 10, label: 'Medium' },
    hard:   { sigma: 0.055, minSize: 120, seconds: 6,  label: 'Hard' }
  };

  const MESSAGES = {
    'too-few-points': 'Draw one continuous circle — that was too short to measure.',
    'too-small': 'Draw a bigger circle so it can be measured.',
    'line': 'That looks like a line — draw all the way around a circle.',
    'short-arc': 'Draw around more of the circle — that was only part of one.',
    'scribble': 'Draw just one loop — that went round several times.',
    'not-round': 'That shape is not close enough to a circle to score.'
  };

  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  /** Keep finite points and drop near-duplicates (pointer noise). */
  function clean(points, minStep = 1.5) {
    const out = [];
    if (!Array.isArray(points)) return out;
    for (const p of points) {
      if (!p || !isNum(p.x) || !isNum(p.y)) continue;
      const last = out[out.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < minStep) continue;
      out.push({ x: p.x, y: p.y });
    }
    return out;
  }

  function pathLength(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    return L;
  }

  /** Resample to n points equally spaced along the path. */
  function resample(pts, n = 128) {
    const L = pathLength(pts);
    if (pts.length < 2 || !(L > 0)) return pts.slice();
    const step = L / (n - 1);
    const out = [{ x: pts[0].x, y: pts[0].y }];
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      let ax = pts[i - 1].x, ay = pts[i - 1].y;
      const bx = pts[i].x, by = pts[i].y;
      let seg = Math.hypot(bx - ax, by - ay);
      while (acc + seg >= step && out.length < n) {
        const t = (step - acc) / seg;
        ax = ax + (bx - ax) * t; ay = ay + (by - ay) * t;
        out.push({ x: ax, y: ay });
        seg = Math.hypot(bx - ax, by - ay);
        acc = 0;
      }
      acc += seg;
    }
    while (out.length < n) out.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
    return out;
  }

  /** Solve a 3×3 linear system (Cramer's rule). Returns null when singular. */
  function solve3(A, b) {
    const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
      - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
      + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(A);
    if (!isNum(D) || Math.abs(D) < 1e-12) return null;
    const out = [];
    for (let k = 0; k < 3; k++) {
      const M = A.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)));
      out.push(det(M) / D);
    }
    return out.every(isNum) ? out : null;
  }

  /** Kåsa fit on mean-centred data, then Gauss–Newton refinement of the geometric error. */
  function fitCircle(pts) {
    const n = pts.length;
    if (n < 3) return null;
    let mx = 0, my = 0;
    for (const p of pts) { mx += p.x; my += p.y; }
    mx /= n; my /= n;
    // x² + y² + D x + E y + F = 0  (centred coordinates u, v)
    let Suu = 0, Svv = 0, Suv = 0, Su = 0, Sv = 0, Sz = 0, Szu = 0, Szv = 0;
    for (const p of pts) {
      const u = p.x - mx, v = p.y - my, z = u * u + v * v;
      Suu += u * u; Svv += v * v; Suv += u * v; Su += u; Sv += v; Sz += z; Szu += z * u; Szv += z * v;
    }
    const sol = solve3([[Suu, Suv, Su], [Suv, Svv, Sv], [Su, Sv, n]], [-Szu, -Szv, -Sz]);
    if (!sol) return null;
    let a = -sol[0] / 2, b = -sol[1] / 2;
    let r2 = a * a + b * b - sol[2];
    if (!(r2 > 0)) return null;
    let r = Math.sqrt(r2);
    // Gauss–Newton on f_i = |p_i − c| − r
    for (let it = 0; it < 12; it++) {
      let JTJ = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], JTf = [0, 0, 0];
      for (const p of pts) {
        const dx = p.x - mx - a, dy = p.y - my - b, d = Math.hypot(dx, dy) || 1e-9;
        const J = [-dx / d, -dy / d, -1], f = d - r;
        for (let i = 0; i < 3; i++) { JTf[i] += J[i] * f; for (let j = 0; j < 3; j++) JTJ[i][j] += J[i] * J[j]; }
      }
      const step = solve3(JTJ, JTf.map((v) => -v));
      if (!step) break;
      a += step[0]; b += step[1]; r += step[2];
      if (Math.abs(step[0]) + Math.abs(step[1]) + Math.abs(step[2]) < 1e-9 * (1 + r)) break;
    }
    if (!isNum(a) || !isNum(b) || !(r > 0)) return null;
    return { cx: a + mx, cy: b + my, r };
  }

  /** √(minor/major) of the point covariance: 1 for a circle, smaller for an oval, ~0 for a line. */
  function aspectOf(pts) {
    const n = pts.length;
    let mx = 0, my = 0;
    for (const p of pts) { mx += p.x; my += p.y; }
    mx /= n; my /= n;
    let sxx = 0, syy = 0, sxy = 0;
    for (const p of pts) { const u = p.x - mx, v = p.y - my; sxx += u * u; syy += v * v; sxy += u * v; }
    const tr = sxx + syy, disc = Math.sqrt(Math.max(0, (sxx - syy) * (sxx - syy) + 4 * sxy * sxy));
    const l1 = (tr + disc) / 2, l2 = (tr - disc) / 2;
    return l1 > 0 ? Math.sqrt(Math.max(0, l2) / l1) : 0;
  }

  function reject(reason, extra) {
    return Object.assign({ ok: false, reason, score: 0, message: MESSAGES[reason], feedback: [MESSAGES[reason]] }, extra || {});
  }

  /**
   * Score a hand-drawn stroke.
   * @param {Array<{x:number,y:number}>} points  screen/canvas coordinates of ONE continuous stroke
   * @param {{mode?:'easy'|'medium'|'hard', minSize?:number}} [opts]
   */
  function score(points, opts = {}) {
    const mode = MODES[opts.mode] || MODES.medium;
    const minSize = isNum(opts.minSize) ? opts.minSize : mode.minSize;
    const cleaned = clean(points);
    if (cleaned.length < 8) return reject('too-few-points');
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of cleaned) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    const size = Math.max(maxX - minX, maxY - minY);
    if (size < minSize) return reject('too-small', { size });

    const pts = resample(cleaned, 128);
    const aspect = aspectOf(pts);
    if (aspect < 0.18) return reject('line', { aspect });
    const fit = fitCircle(pts);
    if (!fit || fit.r > size * 4) return reject('line', { aspect });

    // radial errors
    let se = 0, maxE = 0;
    for (const p of pts) { const e = Math.hypot(p.x - fit.cx, p.y - fit.cy) - fit.r; se += e * e; maxE = Math.max(maxE, Math.abs(e)); }
    const rms = Math.sqrt(se / pts.length) / fit.r;
    const maxErr = maxE / fit.r;

    // angular coverage (10° sectors) and net turning around the fitted centre
    const bins = new Array(36).fill(false);
    let net = 0, prev = null;
    for (const p of pts) {
      const ang = Math.atan2(p.y - fit.cy, p.x - fit.cx);
      bins[Math.min(35, Math.floor(((ang + Math.PI) / TAU) * 36))] = true;
      if (prev !== null) { let d = ang - prev; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; net += d; }
      prev = ang;
    }
    const coverageDeg = bins.filter(Boolean).length * 10;
    const turns = Math.abs(net) / TAU;
    const first = cleaned[0], last = cleaned[cleaned.length - 1];
    const gap = Math.hypot(last.x - first.x, last.y - first.y) / fit.r;
    const metrics = {
      center: { x: fit.cx, y: fit.cy }, radius: fit.r,
      rms, maxErr, gap, coverageDeg, turns, aspect, size, points: cleaned.length
    };

    if (turns > 1.6) return reject('scribble', { metrics });
    if (coverageDeg < 250 || turns < 0.6) return reject('short-arc', { metrics });
    if (rms > 0.3) return reject('not-round', { metrics });

    const closed = turns >= 0.97 || gap <= 0.08;
    const roundness = Math.exp(-Math.pow(rms / mode.sigma, 2));
    const closure = closed ? 1 : clamp01(1 - (gap - 0.08) / 0.7);
    const coverage = clamp01((coverageDeg - 250) / (360 - 250));
    const aspectF = clamp01((aspect - 0.6) / 0.35);
    const raw = 100 * roundness * (0.7 + 0.3 * closure) * (0.6 + 0.4 * coverage) * (0.5 + 0.5 * aspectF);
    const value = Math.max(0, Math.min(100, Math.round(raw)));

    const feedback = [];
    if (!closed && closure < 0.95) feedback.push('Close the gap — finish where you started.');
    if (coverageDeg < 350) feedback.push('Draw around more of the circle.');
    if (aspect < 0.9) feedback.push('It is stretched into an oval — keep the width and height equal.');
    if (roundness < 0.75 && aspect >= 0.9) feedback.push('Make the circle rounder — keep the same distance from the centre all the way round.');
    if (turns > 1.15) feedback.push('Stop when you reach the start — draw just one loop.');
    if (!feedback.length) feedback.push(value >= 90 ? 'Excellent — a very round, closed circle!' : 'Good circle — keep a steady speed to make it even rounder.');

    return { ok: true, score: value, metrics, factors: { roundness, closure, coverage, aspect: aspectF }, closed, feedback, mode: opts.mode || 'medium' };
  }

  /**
   * Geometry target variant: score shape quality AND how well the circle matches a target
   * centre/radius (e.g. x² + y² = 25 → centre (0,0), r = 5 grid units). Coordinates in the same units.
   */
  function scoreAgainstTarget(points, target, opts = {}) {
    const base = score(points, opts);
    if (!base.ok || !target || !isNum(target.cx) || !isNum(target.cy) || !(target.r > 0)) return base;
    const m = base.metrics;
    const centreErr = Math.hypot(m.center.x - target.cx, m.center.y - target.cy) / target.r;
    const radiusErr = Math.abs(m.radius - target.r) / target.r;
    const accuracy = clamp01(1 - centreErr / 0.5) * clamp01(1 - radiusErr / 0.5);
    const value = Math.max(0, Math.min(100, Math.round(base.score * (0.4 + 0.6 * accuracy))));
    const feedback = base.feedback.slice();
    if (centreErr > 0.1) feedback.unshift('Move the centre closer to the target centre.');
    if (radiusErr > 0.1) feedback.unshift(m.radius > target.r ? 'Your circle is too big for this radius.' : 'Your circle is too small for this radius.');
    return Object.assign({}, base, { score: value, target: { centreErr, radiusErr, accuracy }, feedback });
  }

  // ── Accuracy percentage (Circle Challenge v2) ──
  // One objective number for every difficulty: difficulty only changes the goal and the time limit.
  //   roundness = 1 − 3.5 × rms           (rms = RMS radial error / r; a perfect circle is 100 %)
  //   × closure  (up to −25 % for a gap between start and end)
  //   × coverage (up to −25 % when the path does not go all the way round)
  //   × aspect   (up to −30 % for an oval, on top of its radial error)
  //   × peaks    (up to −50 % for corners or a big bump: largest radial error over 10 % of r)
  // Drawing past the start is NOT penalised: the path is trimmed to exactly one turn before measuring.
  const round1 = (v) => Math.round(v * 10) / 10;
  const DIRS = ['right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', 'top', 'top-right'];
  /** Screen direction (y grows downwards) of an angle around the centre. */
  const dirOf = (ang) => DIRS[((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8];

  /** Net signed turning (radians) of a path around a centre, cumulative per point. */
  function turning(pts, cx, cy) {
    const cum = [0];
    let net = 0, prev = Math.atan2(pts[0].y - cy, pts[0].x - cx);
    for (let i = 1; i < pts.length; i++) {
      const ang = Math.atan2(pts[i].y - cy, pts[i].x - cx);
      let d = ang - prev; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU;
      net += d; cum.push(net); prev = ang;
    }
    return cum;
  }

  /**
   * Accuracy of one hand-drawn stroke as a percentage with one decimal (0–100).
   * @param points  canvas coordinates of ONE continuous stroke
   * @param opts    { minSize = 60 } smallest accepted width/height in the same units
   * Returns { ok, percent, score, metrics, closed, feedback, worst } or a rejection { ok:false, reason, message, percent:0 }.
   */
  function accuracy(points, opts = {}) {
    const minSize = isNum(opts.minSize) ? opts.minSize : 60;
    const no = (reason, extra) => Object.assign(reject(reason, extra), { percent: 0 });
    // drop pointer noise, scaled to the drawing so grid units (geometry mode) are not thinned out
    const finite = Array.isArray(points) ? points.filter((p) => p && isNum(p.x) && isNum(p.y)) : [];
    let span = 0;
    if (finite.length) { const xs = finite.map((p) => p.x), ys = finite.map((p) => p.y); span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)); }
    const cleaned = clean(finite, isNum(opts.minStep) ? opts.minStep : Math.min(1.5, span / 300));
    if (cleaned.length < 8) return no('too-few-points');
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of cleaned) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    const size = Math.max(maxX - minX, maxY - minY);
    const box = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    if (size < minSize) return no('too-small', { size, box });
    let pts = resample(cleaned, 192);
    if (aspectOf(pts) < 0.18) return no('line', { box });
    let fit = fitCircle(pts);
    if (!fit || fit.r > size * 4) return no('line', { box });
    let cum = turning(pts, fit.cx, fit.cy);
    const totalTurns = Math.abs(cum[cum.length - 1]) / TAU;
    if (totalTurns > 1.6) return no('scribble', { box });
    let trimmed = false;
    if (totalTurns > 1) {
      const cut = cum.findIndex((v) => Math.abs(v) >= TAU);
      if (cut > 8) {
        pts = resample(pts.slice(0, cut + 1), 192);
        fit = fitCircle(pts) || fit;
        cum = turning(pts, fit.cx, fit.cy);
        trimmed = true;
      }
    }
    let se = 0, worst = null;
    const bins = new Array(36).fill(false);
    const harm = [];
    for (const p of pts) {
      const ang = Math.atan2(p.y - fit.cy, p.x - fit.cx);
      const e = Math.hypot(p.x - fit.cx, p.y - fit.cy) - fit.r;
      se += e * e;
      harm.push([ang, e / fit.r]);
      if (!worst || Math.abs(e) > Math.abs(worst.err)) worst = { x: p.x, y: p.y, err: e, ang };
      bins[Math.min(35, Math.floor(((ang + Math.PI) / TAU) * 36))] = true;
    }
    const rms = Math.sqrt(se / pts.length) / fit.r;
    const maxErr = Math.abs(worst.err) / fit.r;
    const coverageDeg = bins.filter(Boolean).length * 10;
    const turns = Math.abs(cum[cum.length - 1]) / TAU;
    const a = pts[0], b = pts[pts.length - 1];
    const gap = trimmed ? 0 : Math.hypot(b.x - a.x, b.y - a.y) / fit.r;
    // oval-ness from the 2nd harmonic of the radial error (an ellipse is r(1 + ε·cos 2θ)); unlike the
    // spread of the points this is not fooled by an unfinished circle
    const two = solve3(...(() => {
      const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], y = [0, 0, 0];
      for (const [t, e] of harm) { const row = [1, Math.cos(2 * t), Math.sin(2 * t)]; for (let i = 0; i < 3; i++) { y[i] += row[i] * e; for (let j = 0; j < 3; j++) A[i][j] += row[i] * row[j]; } }
      return [A, y];
    })());
    const eps = two ? Math.min(0.9, Math.hypot(two[1], two[2])) : 0;
    const aspect = (1 - eps) / (1 + eps);
    const metrics = { center: { x: fit.cx, y: fit.cy }, radius: fit.r, rms, maxErr, gap, coverageDeg, turns: totalTurns, aspect, size, points: cleaned.length };
    if (coverageDeg < 250 || turns < 0.6) return no('short-arc', { metrics, box });
    if (rms > 0.3) return no('not-round', { metrics, box });
    const closed = trimmed || turns >= 0.97 || gap <= 0.1;
    const roundness = clamp01(1 - 3.5 * rms);
    const closure = closed ? 1 : 1 - 0.25 * clamp01((gap - 0.1) / 0.9);
    const coverage = 1 - 0.25 * clamp01((360 - coverageDeg) / 110);
    const aspectF = 1 - 0.3 * clamp01((0.95 - aspect) / 0.35);
    const peakF = 1 - 0.5 * clamp01((maxErr - 0.1) / 0.3);   // corners and big bumps
    const percent = Math.max(0, Math.min(100, round1(100 * roundness * closure * coverage * aspectF * peakF)));
    const feedback = [];
    if (!closed) feedback.push('Close the gap — finish where you started.');
    if (coverageDeg < 350) feedback.push('Draw around more of the circle.');
    if (aspect < 0.9) feedback.push('It is stretched into an oval — keep the width and height equal.');
    if (maxErr > 0.08 && maxErr > 2.2 * rms) feedback.push(`Watch the ${dirOf(worst.ang)} — it ${worst.err > 0 ? 'bulges out' : 'dips in'}.`);
    else if (rms > 0.04 && aspect >= 0.9) feedback.push('Keep the same distance from the centre all the way round.');
    if (!feedback.length) feedback.push(percent >= 95 ? 'Excellent — a very round, closed circle!' : 'Good circle — a steady speed makes it even rounder.');
    return { ok: true, percent, score: Math.round(percent), metrics, closed, trimmed, feedback, worst,
      factors: { roundness, closure, coverage, aspect: aspectF, peaks: peakF } };
  }

  /** Quick estimate while the stroke is still being drawn: fitted circle + roundness %, or null. */
  function liveAccuracy(points, opts = {}) {
    const cleaned = clean(points, 2);
    if (cleaned.length < 12) return null;
    const pts = resample(cleaned, 96);
    const fit = fitCircle(pts);
    if (!fit) return null;
    const cum = turning(pts, fit.cx, fit.cy);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of cleaned) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    const size = Math.max(maxX - minX, maxY - minY);
    if (Math.abs(cum[cum.length - 1]) < TAU * 0.25 || fit.r > size * 3 || size < (isNum(opts.minSize) ? opts.minSize : 30)) return null;
    let se = 0;
    for (const p of pts) { const e = Math.hypot(p.x - fit.cx, p.y - fit.cy) - fit.r; se += e * e; }
    const rms = Math.sqrt(se / pts.length) / fit.r;
    return { center: { x: fit.cx, y: fit.cy }, radius: fit.r, rms, percent: Math.max(0, round1(100 * clamp01(1 - 3.5 * rms))) };
  }

  /** Accuracy against a target circle (same units): shape % × (0.4 + 0.6 × centre/radius accuracy). */
  function accuracyAgainstTarget(points, target, opts = {}) {
    const base = accuracy(points, opts);
    if (!base.ok || !target || !isNum(target.cx) || !isNum(target.cy) || !(target.r > 0)) return base;
    const m = base.metrics;
    const centreErr = Math.hypot(m.center.x - target.cx, m.center.y - target.cy) / target.r;
    const radiusErr = Math.abs(m.radius - target.r) / target.r;
    const acc = clamp01(1 - centreErr / 0.5) * clamp01(1 - radiusErr / 0.5);
    const percent = round1(base.percent * (0.4 + 0.6 * acc));
    const feedback = base.feedback.slice();
    if (centreErr > 0.1) feedback.unshift('Move the centre closer to the target centre.');
    if (radiusErr > 0.1) feedback.unshift(m.radius > target.r ? 'Your circle is too big for this radius.' : 'Your circle is too small for this radius.');
    return Object.assign({}, base, { percent, score: Math.round(percent), shapePercent: base.percent, target: { centreErr, radiusErr, accuracy: acc }, feedback });
  }

  return { MODES, MESSAGES, clean, resample, fitCircle, aspectOf, score, scoreAgainstTarget, accuracy, liveAccuracy, accuracyAgainstTarget };
});
