'use strict';

/**
 * Chem3D — High-Performance Scientific 3D Visualization Toolkit for KPRIET Engineering Chemistry.
 * Provides authentic 3D projection, depth sorting, realistic laboratory apparatus (beakers, flasks,
 * burettes, columns, clarifiers, cells, batteries, fuel cells), scientific materials, and particle systems.
 * Optimized for touch smartboards (75" and 86") and responsive desktop displays.
 */
(function () {
  const Chem3D = {};

  // ─── Mathematical & Vector Utilities ───
  const V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    len: (v) => Math.hypot(v[0], v[1], v[2]),
    norm: (v) => { const l = Math.hypot(v[0], v[1], v[2]); return l > 0.0001 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 1, 0]; },
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ],
    lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
  };
  Chem3D.V = V;

  // ─── Color & Shading Helpers ───
  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [100, 100, 100];
  }
  Chem3D.hexToRgb = hexToRgb;

  function shadeColor(hex, factor) {
    const [r, g, b] = hexToRgb(hex);
    const target = factor < 0 ? 0 : 255;
    const p = Math.abs(factor);
    const nr = Math.round((target - r) * p + r);
    const ng = Math.round((target - g) * p + g);
    const nb = Math.round((target - b) * p + b);
    return `rgb(${nr},${ng},${nb})`;
  }
  Chem3D.shadeColor = shadeColor;

  function rgba(hex, alpha) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  Chem3D.rgba = rgba;

  // ─── Light Source & Diffuse Calculation ───
  const LIGHT_DIR = V.norm([0.5, 0.7, 0.9]);

  function calcDiffuse(normal, baseColor, ambient = 0.35, diffuse = 0.65) {
    const dot = Math.max(0, V.dot(V.norm(normal), LIGHT_DIR));
    const factor = ambient + diffuse * dot - 0.7; // maps around -0.3 to +0.3
    return shadeColor(baseColor, factor);
  }
  Chem3D.calcDiffuse = calcDiffuse;

  // ─── Canvas Helper: Safe Rounded Rectangle ───
  function safeRoundRect(ctx, x, y, w, h, r = 6) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return;
    const radius = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, Math.max(0, Number(r) || 0));
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, radius);
    } else {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  }
  Chem3D.safeRoundRect = safeRoundRect;

  function safeEllipse(ctx, x, y, rx, ry, rotation) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(rx) || !Number.isFinite(ry)) return;
    const rX = Math.max(0.1, Math.abs(rx));
    const rY = Math.max(0.1, Math.abs(ry));
    const rot = Number.isFinite(rotation) ? rotation : 0;
    if (typeof ctx.ellipse === 'function') {
      ctx.ellipse(x, y, rX, rY, rot, 0, Math.PI * 2);
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(rX, rY);
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.restore();
    }
  }
  Chem3D.safeEllipse = safeEllipse;

  // ─── Projector Factory ───
  Chem3D.createProjector = function (arg1, arg2, arg3, arg4, arg5, arg6) {
    let view, cx, cy, scale, dist;

    // Detect whether first argument is a CanvasRenderingContext2D (g)
    if (arg1 && (arg1.canvas || typeof arg1.save === 'function' || typeof arg1.beginPath === 'function' || typeof arg1.moveTo === 'function')) {
      // Called as: createProjector(g, view, cx, cy, scale, dist)
      view = (arg2 && typeof arg2 === 'object') ? arg2 : {};
      cx = typeof arg3 === 'number' ? arg3 : 500;
      cy = typeof arg4 === 'number' ? arg4 : 290;
      scale = typeof arg5 === 'number' ? arg5 : 155;
      dist = Math.max(12.0, typeof arg6 === 'number' ? arg6 : 12.0);
    } else {
      // Called as: createProjector(view, cx, cy, scale, dist)
      view = (arg1 && typeof arg1 === 'object') ? arg1 : {};
      cx = typeof arg2 === 'number' ? arg2 : 500;
      cy = typeof arg3 === 'number' ? arg3 : 290;
      scale = typeof arg4 === 'number' ? arg4 : 155;
      dist = Math.max(12.0, typeof arg5 === 'number' ? arg5 : 12.0);
    }

    const yaw = Number(view.yaw) || 0;
    const pitch = Number(view.pitch) || 0;
    const zoom = Math.max(0.2, Number(view.zoom) || 1);
    const panX = Number(view.panX) || 0;
    const panY = Number(view.panY) || 0;

    const cyw = Math.cos(yaw), syw = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const s = scale * zoom;
    const nearPlane = 1.2;
    const maxPersp = 3.2;

    function project(pt) {
      // Input coordinate: [x, y, z] (x = right, y = depth, z = up)
      const x = Number(pt[0]) || 0;
      const y = Number(pt[1]) || 0;
      const z = Number(pt[2]) || 0;
      const x1 = x * cyw - y * syw;
      const y1 = x * syw + y * cyw;
      const y2 = y1 * cp - z * sp;
      const z2 = y1 * sp + z * cp;
      const denom = dist + y2;
      const isClipped = denom < nearPlane;
      const safeDenom = Math.max(nearPlane, denom);
      const rawPersp = dist / safeDenom;
      const persp = Math.min(maxPersp, rawPersp);
      const safeK = Math.min(3.0, Math.max(0.01, persp * zoom));
      const rawX = cx + panX + x1 * s * persp;
      const rawY = cy + panY - z2 * s * persp;
      const safeX = Math.max(-1200, Math.min(2400, rawX));
      const safeY = Math.max(-1200, Math.min(2000, rawY));
      return {
        x: Number(safeX.toFixed(3)),
        y: Number(safeY.toFixed(3)),
        depth: y2,
        k: safeK,
        clipped: isClipped,
        visible: !isClipped
      };
    }
    project.project = project;
    return project;
  };

  // ─── 3D Depth-Sorted Scene Buffer ───
  Chem3D.createScene = function () {
    const items = [];
    let counter = 0;
    return {
      add: function (depth, renderFn) {
        items.push({ depth: Number(depth) || 0, order: counter++, renderFn });
      },
      render: function (g) {
        // Sort back to front (highest depth = farthest away).
        // Deterministic insertion index order tie-breaker prevents jitter/Z-fighting on coplanar faces.
        items.sort((a, b) => (b.depth - a.depth) || (a.order - b.order));
        for (let i = 0; i < items.length; i++) {
          items[i].renderFn(g);
        }
      }
    };
  };

  // ─── Primitive Geometry Renderers ───

  /**
   * Draw a shaded 3D atom / ion sphere with specular highlight and label
   */
  Chem3D.drawAtom = function (g, P, pos, radius, color, label, charge = '', alpha = 1) {
    const q = P(pos);
    const r = Math.max(1, radius * q.k);
    if (r <= 0.5 || !Number.isFinite(q.x) || !Number.isFinite(q.y) || !Number.isFinite(r)) return;

    g.save();
    if (alpha < 1) g.globalAlpha = alpha;
    const grad = g.createRadialGradient(q.x - r * 0.35, q.y - r * 0.35, r * 0.1, q.x, q.y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, color);
    grad.addColorStop(1, shadeColor(color, -0.45));

    g.beginPath();
    g.arc(q.x, q.y, r, 0, Math.PI * 2);
    g.fillStyle = grad;
    g.fill();
    g.lineWidth = Math.max(1, 1.2 * q.k);
    g.strokeStyle = shadeColor(color, -0.6);
    g.stroke();

    if (label && r >= 9) {
      g.fillStyle = '#ffffff';
      g.font = `800 ${Math.max(9, Math.round(r * 0.85))}px "Plus Jakarta Sans", system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, q.x, q.y);

      if (charge && r >= 13) {
        g.font = `700 ${Math.max(8, Math.round(r * 0.55))}px "Plus Jakarta Sans", system-ui, sans-serif`;
        g.textAlign = 'left';
        g.fillText(charge, q.x + r * 0.55, q.y - r * 0.45);
      }
    }
    g.restore();
  };

  /**
   * Draw 3D Cylinder / Column / Vessel / Tube
   */
  Chem3D.drawCylinder = function (g, P, baseCenter, radius, height, color, options = {}) {
    const segments = options.segments || 20;
    const alpha = options.alpha != null ? options.alpha : 1;
    const stroke = options.stroke || shadeColor(color, -0.3);
    const topCap = options.topCap !== false;
    const bottomCap = options.bottomCap !== false;
    const axis = options.axis || 'z';
    const [bx, by, bz] = baseCenter;

    const basePts = [];
    const topPts = [];
    let avgDepth = 0;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      let bPt, tPt;
      if (axis === 'x') {
        const py = by + radius * Math.cos(angle);
        const pz = bz + radius * Math.sin(angle);
        bPt = P([bx, py, pz]);
        tPt = P([bx + height, py, pz]);
      } else if (axis === 'y') {
        const px = bx + radius * Math.cos(angle);
        const pz = bz + radius * Math.sin(angle);
        bPt = P([px, by, pz]);
        tPt = P([px, by + height, pz]);
      } else {
        const px = bx + radius * Math.cos(angle);
        const py = by + radius * Math.sin(angle);
        bPt = P([px, py, bz]);
        tPt = P([px, py, bz + height]);
      }
      basePts.push(bPt);
      topPts.push(tPt);
      avgDepth += (bPt.depth + tPt.depth) / 2;
    }
    avgDepth /= (segments + 1);

    const render = (ctx) => {
      ctx.save();
      if (alpha < 1) ctx.globalAlpha = alpha;

      // Classify mantle quads into front-facing and back-facing
      const quads = [];
      for (let i = 0; i < segments; i++) {
        const midAngle = ((i + 0.5) / segments) * Math.PI * 2;
        let norm;
        if (axis === 'x') {
          norm = [0, Math.cos(midAngle), Math.sin(midAngle)];
        } else if (axis === 'y') {
          norm = [Math.cos(midAngle), 0, Math.sin(midAngle)];
        } else {
          norm = [Math.cos(midAngle), Math.sin(midAngle), 0];
        }
        const segColor = options.flat ? color : calcDiffuse(norm, color, 0.4, 0.6);
        const cross = (basePts[i + 1].x - basePts[i].x) * (topPts[i + 1].y - basePts[i].y) -
                      (basePts[i + 1].y - basePts[i].y) * (topPts[i + 1].x - basePts[i].x);
        quads.push({ i, segColor, isFront: cross < 0 });
      }

      // Check cap orientations
      const cTop = (topPts[1].x - topPts[0].x) * (topPts[2].y - topPts[0].y) -
                   (topPts[1].y - topPts[0].y) * (topPts[2].x - topPts[0].x);
      const isTopVisible = cTop < 0 || options.doubleSided;

      const cBtm = (basePts[1].x - basePts[0].x) * (basePts[2].y - basePts[0].y) -
                   (basePts[1].y - basePts[0].y) * (basePts[2].x - basePts[0].x);
      const isBtmVisible = cBtm > 0 || options.doubleSided;

      const drawQuad = (q) => {
        const i = q.i;
        ctx.beginPath();
        ctx.moveTo(basePts[i].x, basePts[i].y);
        ctx.lineTo(basePts[i + 1].x, basePts[i + 1].y);
        ctx.lineTo(topPts[i + 1].x, topPts[i + 1].y);
        ctx.lineTo(topPts[i].x, topPts[i].y);
        ctx.closePath();
        ctx.fillStyle = q.segColor;
        ctx.fill();
        if (options.wireframe) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      };

      const drawBtmCap = () => {
        if (!bottomCap || !isBtmVisible) return;
        ctx.beginPath();
        ctx.moveTo(basePts[0].x, basePts[0].y);
        for (let i = 1; i <= segments; i++) ctx.lineTo(basePts[i].x, basePts[i].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(color, -0.2);
        ctx.fill();
        if (options.stroke !== false) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      };

      const drawTopCap = () => {
        if (!topCap || !isTopVisible) return;
        ctx.beginPath();
        ctx.moveTo(topPts[0].x, topPts[0].y);
        for (let i = 1; i <= segments; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(color, 0.15);
        ctx.fill();
        if (options.stroke !== false) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      };

      if (alpha < 1) {
        // Translucent cylinder: back-facing quads -> caps -> front-facing quads
        for (let i = 0; i < quads.length; i++) {
          if (!quads[i].isFront) drawQuad(quads[i]);
        }
        drawBtmCap();
        drawTopCap();
        for (let i = 0; i < quads.length; i++) {
          if (quads[i].isFront) drawQuad(quads[i]);
        }
      } else {
        // Opaque cylinder: draw visible caps and front quads
        if (isBtmVisible && !isTopVisible) drawTopCap();
        drawBtmCap();
        for (let i = 0; i < quads.length; i++) {
          if (quads[i].isFront || options.doubleSided) drawQuad(quads[i]);
        }
        drawTopCap();
      }

      ctx.restore();
    };

    if (options.scene) {
      options.scene.add(avgDepth, render);
    } else {
      render(g);
    }
  };

  /**
   * Draw a Translucent Glass Beaker with Liquid Volume and Meniscus
   */
  Chem3D.drawBeaker = function (g, P, center, radius, height, arg6, arg7, options = {}) {
    let liquidHeight = 0, liquidColor = '#38bdf8', opts = {};
    if (typeof arg6 === 'string' && typeof arg7 === 'number') {
      liquidColor = arg6;
      liquidHeight = arg7;
    } else if (typeof arg6 === 'number' && typeof arg7 === 'string') {
      liquidHeight = arg6;
      liquidColor = arg7;
    } else if (typeof arg6 === 'number') {
      liquidHeight = arg6;
      liquidColor = (typeof arg7 === 'string') ? arg7 : '#38bdf8';
    } else if (typeof arg6 === 'string') {
      liquidColor = arg6;
      liquidHeight = (typeof arg7 === 'number') ? arg7 : height * 0.6;
    }
    if (arg7 && typeof arg7 === 'object') Object.assign(opts, arg7);
    if (options && typeof options === 'object') Object.assign(opts, options);

    const scene = opts.scene;
    const [cx, cy, cz] = center;

    // 1. Draw Liquid Volume if height > 0
    if (liquidHeight > 0) {
      Chem3D.drawCylinder(g, P, [cx, cy, cz + 0.05], radius * 0.96, liquidHeight, liquidColor, {
        alpha: opts.liquidAlpha || 0.75,
        topCap: true,
        bottomCap: true,
        scene
      });
    }

    // 2. Draw Outer Glass Cylinder
    Chem3D.drawCylinder(g, P, [cx, cy, cz], radius, height, '#bae6fd', {
      alpha: 0.28,
      topCap: false,
      bottomCap: true,
      stroke: 'rgba(255, 255, 255, 0.8)',
      scene
    });

    // 3. Rim and Graduations
    const qTop = P([cx, cy, cz + height]);
    const renderRim = (ctx) => {
      ctx.save();
      // Glass Rim highlight
      ctx.beginPath();
      const segments = 24;
      for (let i = 0; i <= segments; i++) {
        const ang = (i / segments) * Math.PI * 2;
        const pt = P([cx + radius * Math.cos(ang), cy + radius * Math.sin(ang), cz + height]);
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Tick marks on beaker wall
      for (let h = 0.25; h < 0.9; h += 0.2) {
        const tZ = cz + height * h;
        const pt1 = P([cx + radius * 0.98, cy, tZ]);
        const pt2 = P([cx + radius * 0.85, cy, tZ]);
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (options.label) {
        const btm = P([cx, cy, cz - 0.2]);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.fillText(options.label, btm.x, btm.y + 16);
      }
      ctx.restore();
    };

    if (scene) scene.add(qTop.depth - 0.1, renderRim);
    else renderRim(g);
  };

  /**
   * Draw Erlenmeyer Conical Flask with Liquid and Narrow Neck
   */
  Chem3D.drawFlask = function (g, P, center, baseR, neckR, bodyH, neckH, liquidH, liquidColor, options = {}) {
    const scene = options.scene;
    const [cx, cy, cz] = center;
    const segments = 18;

    // Draw Liquid inside flask body
    if (liquidH > 0) {
      const effH = Math.min(bodyH, liquidH);
      const topR = baseR - (baseR - neckR) * (effH / bodyH);
      const bPts = [], tPts = [];
      let lDepth = 0;
      for (let i = 0; i <= segments; i++) {
        const ang = (i / segments) * Math.PI * 2;
        const bp = P([cx + baseR * 0.95 * Math.cos(ang), cy + baseR * 0.95 * Math.sin(ang), cz + 0.05]);
        const tp = P([cx + topR * 0.95 * Math.cos(ang), cy + topR * 0.95 * Math.sin(ang), cz + effH]);
        bPts.push(bp); tPts.push(tp);
        lDepth += (bp.depth + tp.depth) / 2;
      }
      lDepth /= (segments + 1);

      const renderLiquid = (ctx) => {
        ctx.save();
        ctx.globalAlpha = options.liquidAlpha || 0.82;
        for (let i = 0; i < segments; i++) {
          ctx.beginPath();
          ctx.moveTo(bPts[i].x, bPts[i].y);
          ctx.lineTo(bPts[i + 1].x, bPts[i + 1].y);
          ctx.lineTo(tPts[i + 1].x, tPts[i + 1].y);
          ctx.lineTo(tPts[i].x, tPts[i].y);
          ctx.closePath();
          ctx.fillStyle = liquidColor;
          ctx.fill();
        }
        // Meniscus
        ctx.beginPath();
        ctx.moveTo(tPts[0].x, tPts[0].y);
        for (let i = 1; i <= segments; i++) ctx.lineTo(tPts[i].x, tPts[i].y);
        ctx.closePath();
        ctx.fillStyle = shadeColor(liquidColor, 0.2);
        ctx.fill();
        ctx.restore();
      };
      if (scene) scene.add(lDepth, renderLiquid);
      else renderLiquid(g);
    }

    // Outer Conical Flask Glass Body
    const gBPts = [], gTPts = [];
    let bDepth = 0;
    for (let i = 0; i <= segments; i++) {
      const ang = (i / segments) * Math.PI * 2;
      const bp = P([cx + baseR * Math.cos(ang), cy + baseR * Math.sin(ang), cz]);
      const tp = P([cx + neckR * Math.cos(ang), cy + neckR * Math.sin(ang), cz + bodyH]);
      gBPts.push(bp); gTPts.push(tp);
      bDepth += (bp.depth + tp.depth) / 2;
    }
    bDepth /= (segments + 1);

    const renderGlassBody = (ctx) => {
      ctx.save();
      ctx.globalAlpha = 0.28;
      for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        ctx.moveTo(gBPts[i].x, gBPts[i].y);
        ctx.lineTo(gBPts[i + 1].x, gBPts[i + 1].y);
        ctx.lineTo(gTPts[i + 1].x, gTPts[i + 1].y);
        ctx.lineTo(gTPts[i].x, gTPts[i].y);
        ctx.closePath();
        ctx.fillStyle = '#bae6fd';
        ctx.fill();
      }
      ctx.restore();
    };
    if (scene) scene.add(bDepth, renderGlassBody);
    else renderGlassBody(g);

    // Neck Cylinder
    Chem3D.drawCylinder(g, P, [cx, cy, cz + bodyH], neckR, neckH, '#bae6fd', {
      alpha: 0.32,
      topCap: false,
      bottomCap: false,
      stroke: 'rgba(255, 255, 255, 0.9)',
      scene
    });
  };

  /**
   * Draw Burette with Stopcock Valve and Liquid Column
   */
  Chem3D.drawBurette = function (g, P, center, radius, height, liquidFraction, liquidColor, options = {}) {
    const scene = options.scene;
    const [cx, cy, cz] = center;

    // Outer Glass Tube
    Chem3D.drawCylinder(g, P, [cx, cy, cz], radius, height, '#bae6fd', {
      alpha: 0.3,
      topCap: false,
      bottomCap: false,
      stroke: 'rgba(255, 255, 255, 0.85)',
      scene
    });

    // Liquid in Burette
    const liqH = Math.max(0, Math.min(height, height * liquidFraction));
    if (liqH > 0) {
      Chem3D.drawCylinder(g, P, [cx, cy, cz], radius * 0.9, liqH, liquidColor, {
        alpha: 0.8,
        topCap: true,
        bottomCap: false,
        scene
      });
    }

    // Stopcock Valve Housing & Tap
    const vCenter = [cx, cy, cz - 0.35];
    Chem3D.drawCylinder(g, P, [cx, cy, cz - 0.45], radius * 1.5, 0.25, '#64748b', { topCap: true, bottomCap: true, scene });
    // Dispensing Tip
    Chem3D.drawCylinder(g, P, [cx, cy, cz - 0.75], radius * 0.4, 0.3, '#bae6fd', { alpha: 0.45, scene });

    // Tick Marks & Volume Readout
    const qMid = P([cx, cy, cz + height / 2]);
    const renderGraduations = (ctx) => {
      ctx.save();
      for (let i = 0; i <= 10; i++) {
        const yFrac = i / 10;
        const tZ = cz + height * yFrac;
        const pt1 = P([cx + radius, cy, tZ]);
        const pt2 = P([cx + radius + 0.12, cy, tZ]);
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.stroke();
      }
      ctx.restore();
    };
    if (scene) scene.add(qMid.depth - 0.2, renderGraduations);
    else renderGraduations(g);
  };

  /**
   * Draw Shaded 3D Box / Tank / Basin / Electrode Plate
   * Includes rigorous 2D screen back-face culling to eliminate rotation flickering and depth fighting
   */
  Chem3D.drawBox = function (g, P, center, size, color, options = {}) {
    const scene = options.scene;
    const [cx, cy, cz] = center;
    const [w, d, h] = size;
    const hw = w / 2, hd = d / 2, hh = h / 2;
    const alpha = options.alpha != null ? options.alpha : 1;

    // 8 Vertices
    const v = [
      [-hw, -hd, -hh], [hw, -hd, -hh], [hw, hd, -hh], [-hw, hd, -hh], // bottom 0,1,2,3
      [-hw, -hd, hh],  [hw, -hd, hh],  [hw, hd, hh],  [-hw, hd, hh]   // top 4,5,6,7
    ].map((pt) => P([cx + pt[0], cy + pt[1], cz + pt[2]]));

    // 6 Faces with consistent outward counter-clockwise winding:
    // When projected into 2D canvas coordinates (where Y increases downwards),
    // a front-facing face has cross2D < 0. A back-facing face has cross2D >= 0.
    const faces = [
      { name: 'Bottom', idx: [0, 3, 2, 1], norm: [0, 0, -1] }, // Fixed CCW: 0->3->2->1
      { name: 'Top',    idx: [4, 5, 6, 7], norm: [0, 0, 1] },
      { name: 'Front',  idx: [0, 1, 5, 4], norm: [0, -1, 0] },
      { name: 'Right',  idx: [1, 2, 6, 5], norm: [1, 0, 0] },
      { name: 'Back',   idx: [2, 3, 7, 6], norm: [0, 1, 0] },
      { name: 'Left',   idx: [3, 0, 4, 7], norm: [-1, 0, 0] }
    ];

    faces.forEach((f) => {
      const p0 = v[f.idx[0]];
      const p1 = v[f.idx[1]];
      const p2 = v[f.idx[2]];

      // Check for non-finite coordinates
      if (!Number.isFinite(p0.x) || !Number.isFinite(p0.y) ||
          !Number.isFinite(p1.x) || !Number.isFinite(p1.y) ||
          !Number.isFinite(p2.x) || !Number.isFinite(p2.y)) {
        return;
      }

      // 2D screen space cross-product:
      const cross2D = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);

      // Back-Face Culling Check:
      // In 2D screen coordinates (Y down), front-facing CCW face has cross2D < 0.
      // Culling faces pointing away from the camera prevents back faces from sorting
      // over front faces on thin platens and prevents rotation disappearance glitches.
      if (cross2D >= 0 && !options.doubleSided) {
        return;
      }

      let faceDepth = 0;
      f.idx.forEach((i) => { faceDepth += v[i].depth; });
      faceDepth /= 4;

      const faceColor = options.flat ? color : calcDiffuse(f.norm, color, 0.35, 0.65);

      const renderFace = (ctx) => {
        ctx.save();
        if (alpha < 1) ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(v[f.idx[0]].x, v[f.idx[0]].y);
        for (let j = 1; j < 4; j++) ctx.lineTo(v[f.idx[j]].x, v[f.idx[j]].y);
        ctx.closePath();
        ctx.fillStyle = faceColor;
        ctx.fill();
        if (options.stroke !== false) {
          ctx.strokeStyle = options.stroke || shadeColor(color, -0.3);
          ctx.lineWidth = options.strokeWidth || 1;
          ctx.stroke();
        }
        ctx.restore();
      };

      if (scene) scene.add(faceDepth, renderFace);
      else renderFace(g);
    });
  };

  /**
   * Draw 3D Connecting Pipe with Flow Indicator Arrows
   */
  Chem3D.drawPipe = function (g, P, from, to, radius, color, options = {}) {
    const scene = options.scene;
    const mid = V.lerp(from, to, 0.5);
    const qMid = P(mid);
    const delta = V.sub(to, from);
    const len = V.len(delta);

    const render = (ctx) => {
      ctx.save();
      const p1 = P(from);
      const p2 = P(to);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, radius * 2 * qMid.k);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Flow pulse dots
      if (options.flow) {
        const pulse = (options.t * (options.speed || 1.5)) % 1;
        const dotPos = V.lerp(from, to, pulse);
        const qDot = P(dotPos);
        ctx.beginPath();
        ctx.arc(qDot.x, qDot.y, Math.max(2, radius * 1.5 * qMid.k), 0, Math.PI * 2);
        ctx.fillStyle = options.flowColor || '#ffffff';
        ctx.fill();
      }
      ctx.restore();
    };

    if (scene) scene.add(qMid.depth, render);
    else render(g);
  };

  /**
   * Draw 3D Floating Billboard Tag / Label with Leader Line
   */
  Chem3D.drawTag = function (g, P, anchorPos, text, tagColor = '#1e293b', offsetY = -28, options = {}) {
    const q = P(anchorPos);
    if (!Number.isFinite(q.x) || !Number.isFinite(q.y)) return;
    if (q.clipped) return;

    let opts = {};
    if (typeof offsetY === 'object' && offsetY !== null) {
      opts = offsetY;
      offsetY = opts.offsetY != null ? opts.offsetY : -28;
    } else if (typeof options === 'object' && options !== null) {
      opts = options;
    }

    const offsetX = opts.offsetX != null ? opts.offsetX : (opts.dx || 0);
    const dy = opts.dy != null ? opts.dy : (typeof offsetY === 'number' ? offsetY : -28);
    const anchorDot = opts.anchorDot !== false;

    g.save();
    g.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif';
    const tw = g.measureText(text).width + 18;
    const th = 24;
    const tx = q.x + offsetX;
    const ty = q.y + dy;

    // Leader line anchor dot on 3D geometry
    if (anchorDot) {
      g.beginPath();
      g.arc(q.x, q.y, 3.5, 0, Math.PI * 2);
      g.fillStyle = tagColor;
      g.fill();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 1.2;
      g.stroke();
    }

    // Leader line with dog-leg elbow if offset is lateral
    g.beginPath();
    g.moveTo(q.x, q.y);
    if (Math.abs(offsetX) > 8) {
      const elbowX = q.x + offsetX * 0.45;
      const elbowY = q.y + dy * 0.6;
      g.lineTo(elbowX, elbowY);
      g.lineTo(tx, ty + (dy < 0 ? th / 2 : -th / 2));
    } else {
      g.lineTo(tx, ty + (dy < 0 ? th / 2 : -th / 2));
    }
    g.strokeStyle = tagColor;
    g.lineWidth = 1.5;
    g.stroke();

    // Chip pill
    const chipX = tx - tw / 2;
    const chipY = ty - th / 2;
    g.beginPath();
    safeRoundRect(g, chipX, chipY, tw, th, 6);
    g.fillStyle = opts.dark ? '#0f172a' : tagColor;
    g.fill();
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1.2;
    g.stroke();

    if (opts.dark) {
      g.beginPath();
      g.arc(chipX + 11, ty, 4, 0, Math.PI * 2);
      g.fillStyle = tagColor;
      g.fill();
    }

    g.fillStyle = '#ffffff';
    g.textAlign = opts.dark ? 'left' : 'center';
    g.textBaseline = 'middle';
    g.fillText(text, opts.dark ? chipX + 22 : tx, ty);
    g.restore();
  };

  /**
   * Draw Clean Outside Engineering Callout Card with Leader Line
   * Anchors precisely on 3D geometry and extends outward to clean perimeter space.
   * Dynamically adapts to camera rotation and screen positioning so leader lines never
   * cut through machinery.
   */
  Chem3D.drawCallout = function (g, P, anchorPos, label, options = {}) {
    const q = P(anchorPos);
    if (!Number.isFinite(q.x) || !Number.isFinite(q.y) || q.clipped) return;

    // Center of canvas / stage
    const cx = options.cx || 500;

    // Adaptive outward side orientation:
    // If anchor is left of center, point outward to the left (negative dx).
    // If anchor is right of center, point outward to the right (positive dx).
    let effectiveDx = options.dx != null ? options.dx : (q.x < cx ? -75 : 75);
    if (options.adaptiveSide !== false) {
      const magDx = Math.abs(options.dx != null ? options.dx : 75);
      effectiveDx = q.x < cx ? -magDx : magDx;
    }

    const dy = options.dy != null ? options.dy : -35;
    const color = options.color || '#0284c7';
    const sub = options.sub || '';

    const targetX = q.x + effectiveDx;
    const targetY = q.y + dy;

    g.save();
    // 1. Anchor dot on 3D geometry
    g.beginPath();
    g.arc(q.x, q.y, 4, 0, Math.PI * 2);
    g.fillStyle = color;
    g.fill();
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1.5;
    g.stroke();

    // 2. Dog-leg leader line
    const elbowX = q.x + effectiveDx * 0.45;
    const elbowY = targetY;
    g.beginPath();
    g.moveTo(q.x, q.y);
    g.lineTo(elbowX, elbowY);
    g.lineTo(targetX + (effectiveDx > 0 ? -6 : 6), targetY);
    g.strokeStyle = color;
    g.lineWidth = 1.5;
    g.stroke();

    // 3. Card dimensions
    g.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif';
    const labelW = g.measureText(label).width;
    g.font = '600 10px "Plus Jakarta Sans", system-ui, sans-serif';
    const subW = sub ? g.measureText(sub).width : 0;
    const tw = Math.max(labelW, subW) + 26;
    const th = sub ? 34 : 24;

    const cardX = effectiveDx > 0 ? targetX : (effectiveDx < 0 ? targetX - tw : targetX - tw / 2);
    const cardY = targetY - th / 2;

    // Card background
    g.beginPath();
    safeRoundRect(g, cardX, cardY, tw, th, 6);
    g.fillStyle = 'rgba(15, 23, 42, 0.94)';
    g.fill();
    g.strokeStyle = '#334155';
    g.lineWidth = 1.2;
    g.stroke();

    // Accent line/pip
    g.fillStyle = color;
    g.beginPath();
    g.arc(cardX + 11, targetY, 4, 0, Math.PI * 2);
    g.fill();

    // Label text
    g.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif';
    g.fillStyle = '#f8fafc';
    g.textAlign = 'left';
    g.textBaseline = sub ? 'top' : 'middle';
    g.fillText(label, cardX + 22, sub ? cardY + 5 : targetY);

    if (sub) {
      g.font = '500 10px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#94a3b8';
      g.fillText(sub, cardX + 22, cardY + 19);
    }
    g.restore();
  };

  /**
   * Draw Clean Scientific Legend in Top Corner of Canvas
   */
  Chem3D.drawLegend = function (g, items, x = 24, y = 20) {
    if (!items || !items.length) return;
    g.save();
    const pad = 12;
    const itemH = 22;
    const boxW = 220;
    const boxH = pad * 2 + items.length * itemH;

    g.fillStyle = 'rgba(255, 255, 255, 0.94)';
    g.strokeStyle = '#cbd5e1';
    g.lineWidth = 1.5;
    g.beginPath();
    safeRoundRect(g, x, y, boxW, boxH, 10);
    g.fill();
    g.stroke();

    items.forEach((item, i) => {
      const iy = y + pad + i * itemH + itemH / 2;
      // Icon or color dot
      if (item.symbol) {
        g.font = '800 11px "Plus Jakarta Sans", system-ui, sans-serif';
        g.fillStyle = item.color;
        g.beginPath();
        g.arc(x + pad + 8, iy, 7, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 1;
        g.stroke();
      } else {
        g.fillStyle = item.color;
        g.beginPath();
        g.arc(x + pad + 8, iy, 6, 0, Math.PI * 2);
        g.fill();
      }

      g.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(item.label, x + pad + 24, iy);
    });
    g.restore();
  };

  /**
   * Draw Shaded 3D Sphere (for resin beads, flocs, droplets)
   */
  Chem3D.drawSphere = function (g, P, center, radius, color, options = {}) {
    const q = P(center);
    const r = Math.max(1, radius * q.k);
    if (r < 0.5) return;
    const scene = options.scene;
    const alpha = options.alpha != null ? options.alpha : 1;

    const render = (ctx) => {
      ctx.save();
      if (alpha < 1) ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(q.x - r * 0.35, q.y - r * 0.35, r * 0.08, q.x, q.y, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, shadeColor(color, -0.5));

      ctx.beginPath();
      ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      if (options.stroke) {
        ctx.strokeStyle = options.stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    if (scene) scene.add(q.depth, render);
    else render(g);
  };

  /**
   * Draw Falling Liquid Droplet
   */
  Chem3D.drawDroplet = function (g, P, pos, radius, color) {
    const q = P(pos);
    const r = Math.max(1.5, radius * q.k);
    g.save();
    g.beginPath();
    g.arc(q.x, q.y, r, 0, Math.PI);
    g.lineTo(q.x, q.y - r * 1.8);
    g.closePath();
    g.fillStyle = color;
    g.fill();
    g.strokeStyle = shadeColor(color, -0.3);
    g.lineWidth = 1;
    g.stroke();
    g.restore();
  };

  /**
   * Draw 3D Rotating Paddle / Impeller
   */
  Chem3D.drawPaddle = function (g, P, center, shaftH, bladeR, bladeH, angle, color = '#64748b', options = {}) {
    const scene = options.scene;
    const [cx, cy, cz] = center;
    // Central shaft
    Chem3D.drawCylinder(g, P, [cx, cy, cz], 0.08, shaftH, '#475569', { scene, topCap: true, bottomCap: true });
    // 2 cross blades
    const numBlades = options.blades || 2;
    for (let b = 0; b < numBlades; b++) {
      const curAngle = angle + (b * Math.PI / numBlades);
      const dx = bladeR * Math.cos(curAngle);
      const dy = bladeR * Math.sin(curAngle);
      const p1 = [cx - dx, cy - dy, cz + 0.1];
      const p2 = [cx + dx, cy + dy, cz + 0.1];
      const p3 = [cx + dx, cy + dy, cz + 0.1 + bladeH];
      const p4 = [cx - dx, cy - dy, cz + 0.1 + bladeH];
      const q1 = P(p1), q2 = P(p2), q3 = P(p3), q4 = P(p4);
      const depth = (q1.depth + q2.depth) / 2;

      const renderBlade = (ctx) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(q1.x, q1.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.lineTo(q3.x, q3.y);
        ctx.lineTo(q4.x, q4.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = shadeColor(color, -0.4);
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      };
      if (scene) scene.add(depth, renderBlade);
      else renderBlade(g);
    }
  };

  /**
   * Draw Analog/Digital Voltmeter on Lab Bench
   */
  Chem3D.drawVoltmeter = function (g, P, center, size, voltage, maxV = 2.0, options = {}) {
    const scene = options.scene;
    const [cx, cy, cz] = center;
    // Housing box
    Chem3D.drawBox(g, P, center, [size, size * 0.7, size * 0.9], '#334155', { scene, stroke: '#1e293b' });
    const qFace = P([cx, cy - (size * 0.7) / 2 - 0.02, cz]);

    const renderFace = (ctx) => {
      ctx.save();
      const w = size * 0.85 * qFace.k * 180;
      const h = size * 0.55 * qFace.k * 180;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      safeRoundRect(ctx, qFace.x - w / 2, qFace.y - h / 2, w, h, 6);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Digital display
      ctx.fillStyle = '#0f172a';
      ctx.font = `800 ${Math.max(10, Math.round(18 * qFace.k))}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      const valNum = Number(voltage) || 0;
      ctx.fillText(`${valNum.toFixed(options.decimals || 2)} V`, qFace.x, qFace.y + h * 0.15);

      ctx.fillStyle = '#64748b';
      ctx.font = `700 ${Math.max(8, Math.round(10 * qFace.k))}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.fillText(options.label || 'CELL POTENTIAL', qFace.x, qFace.y - h * 0.22);
      ctx.restore();
    };

    if (scene) scene.add(qFace.depth - 0.3, renderFace);
    else renderFace(g);
  };

  /**
   * Draw Laboratory Ground Grid Plane
   */
  Chem3D.drawGroundGrid = function (g, P, sizeOrXRange = 4.2, stepOrYRange = 1, zLevel = 0, color = 'rgba(203, 213, 225, 0.45)', maybeStep = 1.0) {
    let xMin = -4, xMax = 4, yMin = -4, yMax = 4, step = 1.0, z = 0, gridColor = color;
    if (Array.isArray(sizeOrXRange)) {
      xMin = Math.max(-4.2, Number(sizeOrXRange[0]) || -4);
      xMax = Math.min(4.2, Number(sizeOrXRange[1]) || 4);
      if (Array.isArray(stepOrYRange)) {
        yMin = Math.max(-4.2, Number(stepOrYRange[0]) || -4);
        yMax = Math.min(4.2, Number(stepOrYRange[1]) || 4);
      }
      z = Number(zLevel) || 0;
      gridColor = (typeof color === 'string') ? color : 'rgba(203, 213, 225, 0.45)';
      step = Number(maybeStep) || 1.0;
    } else {
      const s = Math.min(4.2, Math.max(2.5, Number(sizeOrXRange) || 4));
      xMin = -s; xMax = s;
      yMin = -s; yMax = s;
      step = Number(stepOrYRange) || 1.0;
      z = Number(zLevel) || 0;
      gridColor = (typeof color === 'string') ? color : 'rgba(203, 213, 225, 0.45)';
    }

    // Normalize dark wireframe colors to subtle laboratory floor grid
    if (gridColor === '#1e293b' || gridColor === '#334155' || gridColor === '#000000' || gridColor === '#0f172a') {
      gridColor = 'rgba(203, 213, 225, 0.45)';
    }

    g.save();
    g.strokeStyle = gridColor;
    g.lineWidth = 1;
    for (let x = xMin; x <= xMax + 0.001; x += step) {
      const p1 = P([x, yMin, z]);
      const p2 = P([x, yMax, z]);
      if (p1.clipped || p2.clipped) continue;
      if (Number.isFinite(p1.x) && Number.isFinite(p1.y) && Number.isFinite(p2.x) && Number.isFinite(p2.y)) {
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.stroke();
      }
    }
    for (let y = yMin; y <= yMax + 0.001; y += step) {
      const p1 = P([xMin, y, z]);
      const p2 = P([xMax, y, z]);
      if (p1.clipped || p2.clipped) continue;
      if (Number.isFinite(p1.x) && Number.isFinite(p1.y) && Number.isFinite(p2.x) && Number.isFinite(p2.y)) {
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.stroke();
      }
    }
    g.restore();
  };

  window.Chem3D = Chem3D;
})();
