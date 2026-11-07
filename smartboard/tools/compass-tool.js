'use strict';

// ══════════════════════════════════════════════════════════════════════════
// DIGITAL COMPASS — realistic mechanical geometry compass for the Smart Board.
//
// The instrument features a realistic physical drawing compass design:
//   • Metallic beveled arms with steel needle and clamped drawing pencil
//   • Emerald green rotation handle knob for smooth manual sweeping
//   • Digital display on the hinge faceplate showing real-time angle & radius
//   • Width adjustment bar with green indicator arrow (⟷)
//   • Natural hand-drawing feel: rotating by the green knob OR the pencil leg
//     traces smooth live ink onto the board in real time, just like drawing
//     with a physical compass in a geometry notebook.
//
// Handles (each with large touch targets):
//   needle (pivot) — anchor/move the centre point
//   pencil         — adjust radius / swing and draw with the pencil
//   grip           — rotate around the fixed needle point to trace an arc/circle
//   body           — move the whole compass without altering radius or angle
// ══════════════════════════════════════════════════════════════════════════

const CompassTool = (() => {
  const G = CompassGeometry;
  const MODES = [
    { id: 'circle', label: 'Circle', hint: 'Full 360° circle around the needle' },
    { id: 'arc', label: 'Arc', hint: 'Arc between angles (or rotate the handle to draw)' },
    { id: 'semicircle', label: 'Semi', hint: '180° half circle starting at pencil' },
    { id: 'concentric', label: 'Concentric', hint: 'Centre stays locked; draw multiple circles' },
    { id: 'two-point', label: '2-Point', hint: 'Tap the centre, then a point on the circle' },
  ];

  let active = false;
  let visible = true;
  let locked = false;
  let penDown = true;
  let fill = false;
  let showLabel = false;
  let mode = 'circle';
  let arcStartDeg = 0;
  let arcEndDeg = 90;
  let inst = null;      // { cx, cy, r, angle } in board units
  let drag = null;      // { kind, last, prevAngle, startAngle, sweep }
  let twoPoint = null;  // { center, point, dragging, waiting }
  let lastDown = { t: 0, x: NaN, y: NaN };
  let bar = null;

  // ── helpers ──
  const zoom = () => (typeof Canvas !== 'undefined' && Canvas.getZoom ? Canvas.getZoom() : 1) || 1;
  const px = (n) => n / zoom(); // screen pixels → board units (handles stay the same size on screen)
  const color = () => (typeof App !== 'undefined' && App.currentColor) || '#0f172a';
  const width = () => Math.max(1, (typeof App !== 'undefined' && App.penSize) || 2);
  const toast = (m) => { if (typeof App !== 'undefined' && App.showToast) App.showToast(m); };

  function defaultInstrument() {
    let c = { x: 400, y: 300 }, screenR = 150;
    if (typeof Canvas !== 'undefined' && Canvas.getCanvasSize && Canvas.screenToBoard) {
      const { W, H } = Canvas.getCanvasSize();
      c = Canvas.screenToBoard(W / 2, H / 2);
      if (W > 0 && H > 0) screenR = Math.max(60, Math.min(150, Math.min(W, H) * 0.3));
    }
    return { cx: c.x, cy: c.y, r: G.clampRadius(px(screenR)) || 150, angle: 0 };
  }

  /** Screen-space layout of the instrument, derived from the fixed centre, radius and angle. */
  function layout() {
    const pivot = { x: inst.cx, y: inst.cy };
    const pencil = G.pencilOf(inst);
    const n = inst.angle - Math.PI / 2; // perpendicular, "above" the legs
    const mid = { x: (pivot.x + pencil.x) / 2, y: (pivot.y + pencil.y) / 2 };
    const h = Math.max(inst.r * 0.55, px(72));
    const hinge = { x: mid.x + Math.cos(n) * h, y: mid.y + Math.sin(n) * h };
    const grip = { x: hinge.x + Math.cos(n) * px(48), y: hinge.y + Math.sin(n) * px(48) };
    return { pivot, pencil, hinge, grip, n };
  }

  function distToSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  function hitHandle(pos) {
    if (!inst || !visible) return null;
    const L = layout();
    const d = (q) => Math.hypot(pos.x - q.x, pos.y - q.y);
    if (d(L.grip) <= px(30)) return 'grip';
    if (d(L.pencil) <= px(30)) return 'pencil';
    if (d(L.pivot) <= px(30)) return 'pivot';
    if (d(L.hinge) <= px(28) || distToSeg(pos, L.pivot, L.hinge) <= px(14) || distToSeg(pos, L.hinge, L.pencil) <= px(14)) return 'body';
    return null;
  }

  // ── geometry to commit for the current mode ──
  function geometryForMode() {
    if (!inst) return null;
    if (mode === 'arc') {
      const a = G.toScreenArc(arcStartDeg, arcEndDeg);
      return a && { cx: inst.cx, cy: inst.cy, r: inst.r, start: a.start, sweep: a.sweep };
    }
    if (mode === 'semicircle') return { cx: inst.cx, cy: inst.cy, r: inst.r, start: inst.angle, sweep: Math.PI };
    return { cx: inst.cx, cy: inst.cy, r: inst.r, start: inst.angle, sweep: G.TAU };
  }

  function addShape(geom) {
    const r = G.clampRadius(geom && geom.r);
    if (!geom || r === null || ![geom.cx, geom.cy, geom.start, geom.sweep].every(Number.isFinite) || Math.abs(geom.sweep) < 1e-6) return null;
    const full = G.isFull(geom.sweep);
    const shape = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type: 'compass-arc',
      cx: geom.cx, cy: geom.cy, r,
      start: full ? 0 : G.normalize(geom.start),
      sweep: full ? G.TAU : geom.sweep,
      color: color(), width: width(),
      fill, fillOpacity: 0.15, showLabel,
      x: geom.cx - r, y: geom.cy - r, w: r * 2, h: r * 2,
    };
    if (typeof Canvas === 'undefined') return null;
    Canvas.addShapeObject(shape); // records undo history, autosave, page ownership
    if (Canvas.deselectAll) Canvas.deselectAll();
    return shape;
  }

  function commit() {
    if (!active || !inst) return null;
    if (mode === 'two-point') { toast('2-point: tap the centre, then a point on the circle'); return null; }
    const shape = addShape(geometryForMode());
    if (shape) {
      if (mode === 'concentric' && !locked) { locked = true; syncBar(); }
      const kind = G.isFull(shape.sweep) ? 'Circle' : mode === 'semicircle' ? 'Semicircle' : 'Arc';
      toast(`${kind} drawn · r = ${G.formatCm(shape.r)}`);
    }
    render();
    return shape;
  }

  // ── pointer handling (called by Canvas with BOARD coordinates) ──
  function handleDown(pos) {
    if (!active || !pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return true;
    const now = Date.now();
    if (now - lastDown.t < 80 && Math.hypot(pos.x - lastDown.x, pos.y - lastDown.y) < px(6)) return true;
    lastDown = { t: now, x: pos.x, y: pos.y };

    if (mode === 'two-point') {
      if (twoPoint && twoPoint.waiting) { twoPoint.point = pos; twoPoint.dragging = true; twoPoint.waiting = false; }
      else twoPoint = { center: pos, point: pos, dragging: true, waiting: false, second: false };
      render();
      return true;
    }
    if (!visible) { visible = true; inst = { ...(inst || defaultInstrument()), cx: pos.x, cy: pos.y }; syncBar(); render(); return true; }

    const kind = hitHandle(pos);
    if (kind === 'pivot' && locked) {
      toast('Centre is locked — unlock it to move the needle');
      drag = null;
    } else if (kind) {
      drag = { kind, last: pos };
      if (kind === 'grip' || kind === 'pencil') {
        drag.prevAngle = Math.atan2(pos.y - inst.cy, pos.x - inst.cx);
        drag.startAngle = inst.angle;
        drag.sweep = 0;
      }
    } else if (!locked) {
      // tap on empty board: place the needle there (radius and orientation kept)
      inst = { ...inst, cx: pos.x, cy: pos.y };
    }
    render();
    return true;
  }

  function handleMove(pos) {
    if (!active || !pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return true;
    if (twoPoint && twoPoint.dragging) { twoPoint.point = pos; render(); return true; }
    if (!drag) return true;

    if (drag.kind === 'pivot') {
      inst = G.movePivot(inst, pos);
    } else if (drag.kind === 'pencil') {
      const a = Math.atan2(pos.y - inst.cy, pos.x - inst.cx);
      const r = G.clampRadius(G.distance({ x: inst.cx, y: inst.cy }, pos));
      inst = { ...inst, r: r !== null ? r : inst.r, angle: G.normalize(a) };
      if (penDown && mode !== 'two-point') {
        drag.sweep = G.accumulateSweep(drag.sweep, drag.prevAngle, a);
      }
      drag.prevAngle = a;
    } else if (drag.kind === 'body') {
      inst = G.moveBody(inst, pos.x - drag.last.x, pos.y - drag.last.y);
      drag.last = pos;
    } else if (drag.kind === 'grip') {
      const a = Math.atan2(pos.y - inst.cy, pos.x - inst.cx);
      inst = G.rotate(inst, inst.angle + G.angleDelta(drag.prevAngle, a));
      if (penDown && mode !== 'two-point') {
        drag.sweep = G.accumulateSweep(drag.sweep, drag.prevAngle, a);
      }
      drag.prevAngle = a;
    }
    syncBar(false);
    render();
    return true;
  }

  function handleUp() {
    if (!active) return true;
    lastDown = { t: 0, x: 0, y: 0 };
    if (twoPoint && twoPoint.dragging) {
      const r = G.distance(twoPoint.center, twoPoint.point);
      if (r >= px(10)) {
        const c = G.circleFromCenterAndPoint(twoPoint.center, twoPoint.point);
        const shape = c && addShape(c);
        if (shape) {
          inst = { cx: c.cx, cy: c.cy, r: c.r, angle: c.angle };
          toast(`Circle drawn · r = ${G.formatCm(shape.r)}`);
        }
        twoPoint = null;
      } else if (!twoPoint.second) {
        twoPoint = { center: twoPoint.center, point: twoPoint.center, dragging: false, waiting: true, second: true };
        toast('Centre set — now tap a point on the circle');
      } else {
        twoPoint = null;
      }
      syncBar(false);
      render();
      return true;
    }

    // Finished rotating with grip or pencil — commit drawn curve
    if (drag && (drag.kind === 'grip' || drag.kind === 'pencil') && penDown && Math.abs(drag.sweep) >= G.degToRad(3)) {
      const sweep = Math.abs(drag.sweep) >= G.TAU - G.degToRad(2) ? G.TAU : drag.sweep;
      const shape = addShape({ cx: inst.cx, cy: inst.cy, r: inst.r, start: drag.startAngle, sweep });
      if (shape) toast(`${G.isFull(sweep) ? 'Circle' : 'Arc'} drawn · ${Math.round(G.radToDeg(Math.abs(sweep)))}°`);
    }

    drag = null;
    render();
    return true;
  }

  function cancelGesture() {
    const had = !!drag || !!(twoPoint && twoPoint.dragging);
    drag = null;
    if (twoPoint && twoPoint.dragging) twoPoint = null;
    if (had) render();
  }

  // ── rendering (overlay only, on the preview canvas, in board coordinates) ──
  function previewCanvas() {
    let pc = document.getElementById('preview-canvas');
    const viewport = document.getElementById('canvas-viewport') || document.getElementById('canvas-zone');
    if (!pc) {
      if (!viewport) return null;
      pc = document.createElement('canvas');
      pc.id = 'preview-canvas';
      pc.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:15;';
      viewport.appendChild(pc);
    }
    const { W, H } = (typeof Canvas !== 'undefined' && Canvas.getCanvasSize) ? Canvas.getCanvasSize() : { W: pc.offsetWidth, H: pc.offsetHeight };
    const dpr = (typeof Canvas !== 'undefined' && Canvas.getDPR) ? Canvas.getDPR() : (window.devicePixelRatio || 1);
    const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
    if (pc.width !== bw || pc.height !== bh) { pc.width = bw; pc.height = bh; }
    if (pc.style.width !== W + 'px') pc.style.setProperty('width', W + 'px', 'important');
    if (pc.style.height !== H + 'px') pc.style.setProperty('height', H + 'px', 'important');
    return pc;
  }

  function clearOverlay() {
    const pc = document.getElementById('preview-canvas');
    if (!pc) return;
    const ctx = pc.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pc.width, pc.height);
  }

  function strokeGeometry(ctx, g, dashed) {
    ctx.save();
    ctx.strokeStyle = color();
    ctx.lineWidth = width();
    ctx.lineCap = 'round';
    ctx.globalAlpha = dashed ? 0.65 : 0.95;
    if (dashed) ctx.setLineDash([px(8), px(6)]);
    ctx.beginPath();
    if (G.isFull(g.sweep)) ctx.arc(g.cx, g.cy, g.r, 0, G.TAU);
    else ctx.arc(g.cx, g.cy, g.r, g.start, g.start + g.sweep, g.sweep < 0);
    ctx.stroke();
    ctx.restore();
  }

  // ── Realistic Physical Drawing Compass Renderer ──
  function drawRealisticCompass(ctx, inst, L, drag, locked, penDown) {
    const angL = Math.atan2(L.pivot.y - L.hinge.y, L.pivot.x - L.hinge.x);
    const lenL = Math.hypot(L.pivot.x - L.hinge.x, L.pivot.y - L.hinge.y);

    const angR = Math.atan2(L.pencil.y - L.hinge.y, L.pencil.x - L.hinge.x);
    const lenR = Math.hypot(L.pencil.x - L.hinge.x, L.pencil.y - L.hinge.y);

    const isBodyActive = drag && drag.kind === 'body';

    // ── 1. Adjuster Bar (Cross-Strut with Green Arrow ⟷) ──
    const tAdj = 0.44;
    const adjL = { x: L.hinge.x + Math.cos(angL) * (lenL * tAdj), y: L.hinge.y + Math.sin(angL) * (lenL * tAdj) };
    const adjR = { x: L.hinge.x + Math.cos(angR) * (lenR * tAdj), y: L.hinge.y + Math.sin(angR) * (lenR * tAdj) };
    const adjAng = Math.atan2(adjR.y - adjL.y, adjR.x - adjL.x);
    const adjLen = Math.hypot(adjR.x - adjL.x, adjR.y - adjL.y);

    ctx.save();
    ctx.translate(adjL.x, adjL.y);
    ctx.rotate(adjAng);

    // Subtle drop shadow under adjuster
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    if (ctx.roundRect) ctx.roundRect(0, px(-4), adjLen, px(12), px(4));
    else ctx.rect(0, px(-4), adjLen, px(12));
    ctx.fill();

    // Metallic guide rod
    const rodGrad = ctx.createLinearGradient(0, px(-4), 0, px(4));
    rodGrad.addColorStop(0, '#cbd5e1');
    rodGrad.addColorStop(0.4, '#f8fafc');
    rodGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = rodGrad;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = px(1);
    if (ctx.roundRect) ctx.roundRect(0, px(-4), adjLen, px(8), px(3));
    else ctx.rect(0, px(-4), adjLen, px(8));
    ctx.fill(); ctx.stroke();

    // Center adjustment sleeve with green double-arrow ⟷
    const midX = adjLen * 0.46;
    const sleeveW = px(36), sleeveH = px(14);
    const sleeveGrad = ctx.createLinearGradient(0, px(-7), 0, px(7));
    sleeveGrad.addColorStop(0, '#3b82f6');
    sleeveGrad.addColorStop(0.5, '#60a5fa');
    sleeveGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = sleeveGrad;
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = px(1);
    if (ctx.roundRect) ctx.roundRect(midX - sleeveW/2, -sleeveH/2, sleeveW, sleeveH, px(3));
    else ctx.rect(midX - sleeveW/2, -sleeveH/2, sleeveW, sleeveH);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.font = `800 ${px(10.5)}px "JetBrains Mono", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⟷', midX, 0);

    ctx.restore();

    // ── 2. Left Leg (Needle Leg) ──
    ctx.save();
    ctx.translate(L.hinge.x, L.hinge.y);
    ctx.rotate(angL);

    const armL_len = lenL * 0.76;
    const wTopL = px(7), wBotL = px(4);

    const legGradL = ctx.createLinearGradient(0, -wTopL, 0, wTopL);
    legGradL.addColorStop(0, isBodyActive ? '#fef08a' : '#64748b');
    legGradL.addColorStop(0.25, isBodyActive ? '#fef9c3' : '#e2e8f0');
    legGradL.addColorStop(0.5, '#ffffff');
    legGradL.addColorStop(0.85, isBodyActive ? '#fef08a' : '#cbd5e1');
    legGradL.addColorStop(1, isBodyActive ? '#eab308' : '#475569');

    ctx.fillStyle = legGradL;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = px(1.2);
    ctx.beginPath();
    ctx.moveTo(0, -wTopL);
    ctx.lineTo(armL_len, -wBotL);
    ctx.lineTo(armL_len, wBotL);
    ctx.lineTo(0, wTopL);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Chamfer highlight spine
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = px(1.2);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(armL_len, 0); ctx.stroke();

    // Steel needle point (76% to 100% of length)
    const needleGrad = ctx.createLinearGradient(armL_len, -px(2.5), lenL, px(2.5));
    needleGrad.addColorStop(0, '#94a3b8');
    needleGrad.addColorStop(0.5, '#f8fafc');
    needleGrad.addColorStop(1, '#475569');
    ctx.fillStyle = needleGrad;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = px(0.8);
    ctx.beginPath();
    ctx.moveTo(armL_len, -px(2.5));
    ctx.lineTo(lenL, 0); // sharp needle point touching paper!
    ctx.lineTo(armL_len, px(2.5));
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.restore();

    // ── 3. Right Leg (Pencil Leg + Clamp + Real Pencil) ──
    ctx.save();
    ctx.translate(L.hinge.x, L.hinge.y);
    ctx.rotate(angR);

    // Upper metallic arm (0 to 56% length)
    const armR_len = lenR * 0.56;
    const legGradR = ctx.createLinearGradient(0, -wTopL, 0, wTopL);
    legGradR.addColorStop(0, isBodyActive ? '#fef08a' : '#64748b');
    legGradR.addColorStop(0.25, isBodyActive ? '#fef9c3' : '#e2e8f0');
    legGradR.addColorStop(0.5, '#ffffff');
    legGradR.addColorStop(0.85, isBodyActive ? '#fef08a' : '#cbd5e1');
    legGradR.addColorStop(1, isBodyActive ? '#eab308' : '#475569');

    ctx.fillStyle = legGradR;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = px(1.2);
    ctx.beginPath();
    ctx.moveTo(0, -wTopL);
    ctx.lineTo(armR_len, -wBotL);
    ctx.lineTo(armR_len, wBotL);
    ctx.lineTo(0, wTopL);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Chamfer highlight spine
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = px(1.2);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(armR_len, 0); ctx.stroke();

    // Clamp collar holding the pencil (55% to 68% length)
    const clampStart = lenR * 0.54, clampEnd = lenR * 0.68;
    const clampW = px(14);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = px(1.2);
    if (ctx.roundRect) ctx.roundRect(clampStart, -clampW/2, clampEnd - clampStart, clampW, px(2.5));
    else ctx.rect(clampStart, -clampW/2, clampEnd - clampStart, clampW);
    ctx.fill(); ctx.stroke();

    // Clamp screw wing
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(clampStart + (clampEnd - clampStart)/2, px(8), px(3.5), 0, G.TAU);
    ctx.fill(); ctx.stroke();

    // Real Pencil (62% to 100% length)
    const penStart = lenR * 0.62;
    const woodStart = lenR * 0.90;
    const penW = px(10);

    // Pencil barrel (royal blue facets)
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(penStart, -penW/2, woodStart - penStart, penW * 0.3);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(penStart, -penW/2 + penW * 0.3, woodStart - penStart, penW * 0.4);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(penStart, -penW/2 + penW * 0.7, woodStart - penStart, penW * 0.3);

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = px(1);
    ctx.strokeRect(penStart, -penW/2, woodStart - penStart, penW);

    // Sharpened Wood Cone (90% to 97% length)
    const leadStart = lenR * 0.97;
    ctx.fillStyle = '#fde68a';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = px(0.8);
    ctx.beginPath();
    ctx.moveTo(woodStart, -penW/2);
    ctx.lineTo(leadStart, -px(1.8));
    ctx.lineTo(leadStart, px(1.8));
    ctx.lineTo(woodStart, penW/2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Graphite Lead Tip (97% to 100% length)
    ctx.fillStyle = color() || '#0f172a';
    ctx.beginPath();
    ctx.moveTo(leadStart, -px(1.8));
    ctx.lineTo(lenR, 0); // precise point touching paper!
    ctx.lineTo(leadStart, px(1.8));
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // ── 4. Center Needle Pivot Point On Canvas ──
    ctx.save();
    ctx.strokeStyle = locked ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = px(2);
    ctx.beginPath();
    ctx.arc(L.pivot.x, L.pivot.y, px(7), 0, G.TAU);
    ctx.stroke();

    ctx.fillStyle = locked ? '#ef4444' : '#1d4ed8';
    ctx.beginPath();
    ctx.arc(L.pivot.x, L.pivot.y, px(2.5), 0, G.TAU);
    ctx.fill();

    if (locked) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `${px(9)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', L.pivot.x, L.pivot.y - px(14));
    }
    ctx.restore();

    // ── 5. Pencil Contact Circle Ring on Canvas (matches Image 2!) ──
    ctx.save();
    ctx.strokeStyle = color() || '#2563eb';
    ctx.lineWidth = px(2.2);
    ctx.beginPath();
    ctx.arc(L.pencil.x, L.pencil.y, px(10), 0, G.TAU);
    ctx.stroke();
    ctx.restore();

    // ── 6. Hinge Head (Trapezoid Faceplate Block) ──
    ctx.save();
    ctx.translate(L.hinge.x, L.hinge.y);
    ctx.rotate(L.n + Math.PI/2);

    const headW_top = px(28), headW_bot = px(44), headH = px(36);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-headW_top/2 - px(2), -headH/2 + px(3));
    ctx.lineTo(headW_top/2 + px(2), -headH/2 + px(3));
    ctx.lineTo(headW_bot/2 + px(2), headH/2 + px(3));
    ctx.lineTo(-headW_bot/2 - px(2), headH/2 + px(3));
    ctx.closePath();
    ctx.fill();

    const headGrad = ctx.createLinearGradient(0, -headH/2, 0, headH/2);
    headGrad.addColorStop(0, '#475569');
    headGrad.addColorStop(0.4, '#334155');
    headGrad.addColorStop(1, '#1e293b');

    ctx.fillStyle = headGrad;
    ctx.strokeStyle = isBodyActive ? '#fde047' : '#94a3b8';
    ctx.lineWidth = px(1.6);
    ctx.beginPath();
    ctx.moveTo(-headW_top/2, -headH/2);
    ctx.lineTo(headW_top/2, -headH/2);
    ctx.lineTo(headW_bot/2, headH/2);
    ctx.lineTo(-headW_bot/2, headH/2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Digital readouts on hinge block (matches Image 2: "360° / 14")
    const degVal = drag && (drag.kind === 'grip' || drag.kind === 'pencil') && Math.abs(drag.sweep) > 1e-3
      ? `${Math.round(G.radToDeg(Math.abs(drag.sweep)))}°`
      : `${Math.round(G.radToDeg(G.normalize(-inst.angle)))}°`;
    const rVal = G.unitsToCm(inst.r).toFixed(1);

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${px(10.5)}px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(degVal, 0, -headH * 0.16);

    ctx.fillStyle = '#fde047';
    ctx.font = `800 ${px(11)}px "JetBrains Mono", Consolas, monospace`;
    ctx.fillText(rVal, 0, headH * 0.22);

    ctx.restore();

    // ── 7. Top Spindle Shaft & Green Rotation Knob ──
    const gripDist = Math.hypot(L.grip.x - L.hinge.x, L.grip.y - L.hinge.y);
    ctx.save();
    ctx.translate(L.hinge.x, L.hinge.y);
    ctx.rotate(L.n + Math.PI/2);

    const spindleH = gripDist - px(8);
    const spindleW = px(8);
    const spinGrad = ctx.createLinearGradient(-spindleW/2, 0, spindleW/2, 0);
    spinGrad.addColorStop(0, '#94a3b8');
    spinGrad.addColorStop(0.5, '#f8fafc');
    spinGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = spinGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = px(1);
    if (ctx.roundRect) ctx.roundRect(-spindleW/2, -headH/2 - spindleH, spindleW, spindleH, px(2));
    else ctx.rect(-spindleW/2, -headH/2 - spindleH, spindleW, spindleH);
    ctx.fill(); ctx.stroke();

    ctx.restore();

    // ── EMERALD GREEN ROTATION KNOB (matches Image 2!) ──
    ctx.save();
    const knobR = px(13);
    const isGripActive = drag && drag.kind === 'grip';

    if (isGripActive) {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = px(14);
    }

    const greenGrad = ctx.createRadialGradient(
      L.grip.x - px(3), L.grip.y - px(3), px(1),
      L.grip.x, L.grip.y, knobR
    );
    greenGrad.addColorStop(0, '#86efac');
    greenGrad.addColorStop(0.4, '#22c55e');
    greenGrad.addColorStop(1, '#15803d');

    ctx.fillStyle = greenGrad;
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = px(1.5);
    ctx.beginPath();
    ctx.arc(L.grip.x, L.grip.y, knobR, 0, G.TAU);
    ctx.fill(); ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(L.grip.x - px(3), L.grip.y - px(3), px(4), 0, G.TAU);
    ctx.fill();

    ctx.restore();
  }

  function render() {
    const pc = active ? previewCanvas() : null;
    clearOverlay();
    if (!active || !pc || typeof Canvas === 'undefined') return;
    const ctx = pc.getContext('2d');
    ctx.save();
    Canvas.applyTransformToCtx(ctx); // board coordinates: zoom, pan and DPR applied uniformly

    if (mode === 'two-point') {
      if (twoPoint) {
        const c = twoPoint.center;
        const r = G.distance(c, twoPoint.point);
        if (r >= px(2)) {
          strokeGeometry(ctx, { cx: c.x, cy: c.y, r, start: 0, sweep: G.TAU }, true);
          ctx.save(); ctx.strokeStyle = '#eab308'; ctx.lineWidth = px(1.5); ctx.setLineDash([px(4), px(3)]);
          ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(twoPoint.point.x, twoPoint.point.y); ctx.stroke(); ctx.restore();
        }
        ctx.save();
        ctx.beginPath(); ctx.arc(c.x, c.y, px(9), 0, G.TAU);
        ctx.fillStyle = '#dc2626'; ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = px(2.5); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      return;
    }

    if (!inst || !visible) { ctx.restore(); return; }
    const L = layout();
    const g = geometryForMode();

    // Live preview trajectory guide (faint dashed circle)
    if (g) strokeGeometry(ctx, g, true);

    // Live inked arc being traced with pencil
    if (drag && (drag.kind === 'grip' || drag.kind === 'pencil') && penDown && Math.abs(drag.sweep) > 1e-3) {
      strokeGeometry(ctx, { cx: inst.cx, cy: inst.cy, r: inst.r, start: drag.startAngle, sweep: drag.sweep }, false);
    }

    // Realistic physical compass instrument
    drawRealisticCompass(ctx, inst, L, drag, locked, penDown);

    ctx.restore();
  }

  // ── Options bar (DOM) — Compact, Well-Managed Smart Board Toolbar ──
  const CSS = `
  #compass-bar {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 9999px;
    background: rgba(15, 23, 42, 0.94);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
    color: #fff;
    font: 600 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    user-select: none;
    max-width: calc(100% - 24px);
    overflow-x: auto;
    scrollbar-width: none;
    box-sizing: border-box;
  }
  #compass-bar::-webkit-scrollbar { display: none; }
  #compass-bar[hidden] { display: none !important; }

  #compass-bar .cb-brand {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px 0 4px;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    color: #fde047;
    font-weight: 800;
    font-size: 13.5px;
  }
  #compass-bar .cb-group {
    display: flex;
    align-items: center;
    gap: 5px;
    padding-right: 8px;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
  }
  #compass-bar .cb-group:last-child {
    border-right: 0;
    padding-right: 0;
  }

  /* Segmented Modes */
  #compass-bar .cb-modes {
    background: rgba(255, 255, 255, 0.06);
    padding: 3px;
    border-radius: 9999px;
    display: flex;
    gap: 2px;
  }
  #compass-bar .cb-modes button {
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.75);
    font: 600 12.5px inherit;
    padding: 5px 12px;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  #compass-bar .cb-modes button:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  #compass-bar .cb-modes button[aria-pressed="true"] {
    background: #3b82f6;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    font-weight: 700;
  }

  /* Radius Stepper */
  #compass-bar .cb-radius-stepper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    padding: 2px 4px;
    gap: 2px;
  }
  #compass-bar .cb-btn-step {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  #compass-bar .cb-btn-step:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  #compass-bar .cb-radius-field {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px;
    font-size: 13px;
    font-weight: 600;
  }
  #compass-bar .cb-prefix {
    color: #fde047;
    font-weight: 800;
    font-style: italic;
  }
  #compass-bar input#compass-radius {
    width: 52px;
    height: 26px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(15, 23, 42, 0.85);
    color: #fff;
    font: 700 13px "JetBrains Mono", Consolas, monospace;
    text-align: center;
    padding: 0 4px;
  }
  #compass-bar .cb-unit {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }

  /* Arc Inputs */
  #compass-bar .cb-arc {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  #compass-bar .cb-arc[hidden] { display: none !important; }
  #compass-bar .cb-arc input {
    width: 44px;
    height: 26px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(15, 23, 42, 0.85);
    color: #fff;
    font: 700 12px "JetBrains Mono", monospace;
    text-align: center;
  }

  /* Icon Toggles */
  #compass-bar .cb-icon-btn {
    min-width: 34px;
    height: 32px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  #compass-bar .cb-icon-btn:hover {
    background: rgba(255, 255, 255, 0.14);
  }
  #compass-bar .cb-icon-btn[aria-pressed="true"] {
    background: rgba(234, 179, 8, 0.22);
    border-color: #eab308;
    color: #fde047;
    box-shadow: 0 0 10px rgba(234, 179, 8, 0.3);
  }

  /* Stroke Preview */
  #compass-bar .cb-swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    display: inline-block;
  }
  #compass-bar #compass-width {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
  }

  /* Action Buttons */
  #compass-bar button.cb-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #10b981, #059669);
    border: 1px solid #34d399;
    color: #ffffff;
    font: 700 13px inherit;
    padding: 6px 14px;
    border-radius: 9999px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  #compass-bar button.cb-primary:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45);
  }

  #compass-bar .cb-btn-secondary {
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    font: 600 12.5px inherit;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  #compass-bar .cb-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  #compass-bar .cb-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  #compass-bar .cb-close:hover {
    background: #ef4444;
    color: #ffffff;
    border-color: #ef4444;
  }
  `;

  function el(tag, attrs = {}, text) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'on') for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
      else if (v !== undefined && v !== null) e.setAttribute(k, v);
    }
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function buildBar() {
    if (bar) return bar;
    if (!document.getElementById('compass-bar-style')) {
      const st = el('style', { id: 'compass-bar-style' });
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const host = document.getElementById('canvas-zone') || document.body;
    bar = el('div', { id: 'compass-bar', role: 'toolbar', 'aria-label': 'Compass options' });
    for (const ev of ['pointerdown', 'touchstart', 'mousedown', 'dblclick']) bar.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });

    // Brand Title
    const brand = el('div', { class: 'cb-brand' });
    brand.append(el('span', { 'aria-hidden': 'true' }, '📐'), el('span', {}, 'Compass'));

    // Segmented Mode Selector
    const modes = el('div', { class: 'cb-group cb-modes', role: 'group', 'aria-label': 'Drawing mode' });
    for (const m of MODES) {
      modes.append(el('button', { type: 'button', 'data-mode': m.id, title: m.hint, 'aria-pressed': 'false', on: { click: () => setMode(m.id) } }, m.label));
    }

    // Radius Stepper
    const radius = el('div', { class: 'cb-group cb-radius-stepper', role: 'group', 'aria-label': 'Radius' });
    radius.append(
      el('button', { type: 'button', class: 'cb-btn-step', title: 'Smaller radius (−0.1 cm)', 'aria-label': 'Decrease radius', on: { click: () => nudgeRadius(-1) } }, '−'),
      (() => {
        const wrap = el('div', { class: 'cb-radius-field', title: 'Radius in board centimetres' });
        wrap.append(
          el('span', { class: 'cb-prefix' }, 'r'),
          el('input', { id: 'compass-radius', type: 'number', min: '0.5', max: '2000', step: '0.1', inputmode: 'decimal', 'aria-label': 'Radius in centimetres', on: { change: onRadiusInput, keydown: onFieldKey } }),
          el('span', { class: 'cb-unit' }, 'cm')
        );
        return wrap;
      })(),
      el('button', { type: 'button', class: 'cb-btn-step', title: 'Larger radius (+0.1 cm)', 'aria-label': 'Increase radius', on: { click: () => nudgeRadius(1) } }, '+'),
    );

    // Arc Angles (only in arc mode)
    const arc = el('div', { class: 'cb-group cb-arc', role: 'group', 'aria-label': 'Arc angles' });
    const angleField = (id, label, getter, setter) => {
      const l = el('label', { title: `${label} angle in degrees` });
      l.append(
        el('span', {}, label),
        el('input', { id, type: 'number', step: '1', inputmode: 'numeric', 'aria-label': `${label} angle in degrees`, value: String(getter()), on: { change: (e) => { const v = Number(e.target.value); if (Number.isFinite(v)) { setter(v); render(); } else e.target.value = String(getter()); }, keydown: onFieldKey } }),
        el('span', {}, '°')
      );
      return l;
    };
    arc.append(
      angleField('compass-arc-start', 'From', () => arcStartDeg, (v) => (arcStartDeg = v)),
      angleField('compass-arc-end', 'To', () => arcEndDeg, (v) => (arcEndDeg = v))
    );

    // Toggles
    const opts = el('div', { class: 'cb-group', role: 'group', 'aria-label': 'Compass options' });
    const toggle = (key, label, hint, get, set) =>
      el('button', { type: 'button', class: 'cb-icon-btn', 'data-toggle': key, title: hint, 'aria-pressed': String(get()), on: { click: () => { set(!get()); syncBar(); render(); } } }, label);
    opts.append(
      toggle('lock', '🔒 Lock', 'Lock center needle in place', () => locked, (v) => (locked = v)),
      toggle('pen', '✏️ Hand Draw', 'Draw ink while rotating with hand', () => penDown, (v) => (penDown = v)),
      toggle('fill', '🎨 Fill', 'Fill circle interior', () => fill, (v) => (fill = v)),
      toggle('label', '🏷️ Label', 'Show radius label', () => showLabel, (v) => (showLabel = v)),
      toggle('hide', '👁️ Hide', 'Hide instrument overlay', () => !visible, (v) => { visible = !v; }),
    );

    // Stroke preview
    const style = el('div', { class: 'cb-group', title: 'Stroke colour and width' });
    style.append(el('span', { class: 'cb-swatch', id: 'compass-swatch', 'aria-hidden': 'true' }), el('span', { id: 'compass-width' }));

    // Actions
    const actions = el('div', { class: 'cb-group', role: 'group', 'aria-label': 'Actions' });
    actions.append(
      el('button', { type: 'button', class: 'cb-primary', title: 'Draw circle (Enter)', on: { click: commit } }, '✓ Draw'),
      el('button', { type: 'button', class: 'cb-btn-secondary', title: 'Reset compass to middle', on: { click: reset } }, 'Reset'),
      el('button', { type: 'button', class: 'cb-close', title: 'Close compass and return to pen', 'aria-label': 'Close compass', on: { click: close } }, '✕'),
    );

    bar.append(brand, modes, radius, arc, opts, style, actions);
    host.appendChild(bar);
    return bar;
  }

  function syncBar(updateFields = true) {
    if (!bar) return;
    bar.querySelectorAll('button[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    const map = { lock: locked, pen: penDown, fill, label: showLabel, hide: !visible };
    bar.querySelectorAll('button[data-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(map[b.dataset.toggle])));
    const arcGroup = bar.querySelector('.cb-arc');
    if (arcGroup) arcGroup.hidden = mode !== 'arc';
    const rin = bar.querySelector('#compass-radius');
    if (rin && inst && (updateFields || document.activeElement !== rin)) rin.value = G.unitsToCm(inst.r).toFixed(1);
    const sw = bar.querySelector('#compass-swatch');
    if (sw) sw.style.background = color();
    const wd = bar.querySelector('#compass-width');
    if (wd) wd.textContent = `${width()} px`;
  }

  function onRadiusInput(e) {
    const cm = Number(e.target.value);
    const units = G.clampRadius(G.cmToUnits(cm));
    if (!Number.isFinite(cm) || units === null) { syncBar(); return; }
    inst = G.setRadius(inst, units);
    syncBar();
    render();
  }

  function onFieldKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); e.target.dispatchEvent(new Event('change')); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); e.target.blur(); }
  }

  function nudgeRadius(steps) {
    if (!inst) return;
    inst = G.setRadius(inst, inst.r + steps);
    syncBar();
    render();
  }

  function setMode(m) {
    if (!MODES.some((x) => x.id === m)) return;
    mode = m;
    twoPoint = null;
    drag = null;
    if (m === 'concentric') locked = true;
    syncBar();
    render();
  }

  function reset() {
    inst = defaultInstrument();
    locked = false;
    visible = true;
    drag = null;
    twoPoint = null;
    syncBar();
    render();
  }

  function close() {
    if (typeof App !== 'undefined' && App.setTool) App.setTool('pen');
    else deactivate();
  }

  // ── lifecycle ──
  function activate() {
    if (!inst) inst = defaultInstrument();
    active = true;
    visible = true;
    buildBar();
    bar.hidden = false;
    syncBar();
    render();
  }

  function deactivate() {
    if (!active) return;
    active = false;
    drag = null;
    twoPoint = null;
    if (bar) bar.hidden = true;
    clearOverlay();
  }

  function onPageChange() {
    drag = null;
    twoPoint = null;
    if (active) render();
  }

  function handleKey(e) {
    if (!active) return false;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return false;
    if (e.key === 'Escape') {
      if (drag || twoPoint) { cancelGesture(); twoPoint = null; render(); } else close();
      e.preventDefault();
      return true;
    }
    if (e.key === 'Enter') { e.preventDefault(); commit(); return true; }
    const step = e.shiftKey ? 10 : 1;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key] && inst && !locked) {
      e.preventDefault();
      inst = G.moveBody(inst, moves[e.key][0], moves[e.key][1]);
      render();
      return true;
    }
    if (e.key === '[' || e.key === ']') { e.preventDefault(); nudgeRadius(e.key === ']' ? step : -step); return true; }
    return false;
  }

  return {
    activate, deactivate, onPageChange, render, redraw: () => { if (active) { syncBar(false); render(); } },
    handleDown, handleMove, handleUp, cancelGesture, handleKey, commit, reset, setMode,
    isActive: () => active,
    isDragging: () => !!drag || !!(twoPoint && twoPoint.dragging),
    _state: () => ({ active, visible, locked, penDown, fill, showLabel, mode, arcStartDeg, arcEndDeg, inst: inst && { ...inst }, drag: drag && { kind: drag.kind, sweep: drag.sweep }, twoPoint: twoPoint && { ...twoPoint } }),
    _set: (p) => { if (p.inst) { const n = { ...inst, ...p.inst }; if ([n.cx, n.cy, n.angle].every(Number.isFinite) && G.clampRadius(n.r) !== null) inst = { ...n, r: G.clampRadius(n.r) }; } if ('locked' in p) locked = p.locked; if ('penDown' in p) penDown = p.penDown; if ('arcStartDeg' in p) arcStartDeg = p.arcStartDeg; if ('arcEndDeg' in p) arcEndDeg = p.arcEndDeg; if ('fill' in p) fill = p.fill; if ('showLabel' in p) showLabel = p.showLabel; syncBar(); render(); },
  };
})();
