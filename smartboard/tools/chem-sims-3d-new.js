'use strict';

/**
 * ChemSims3DNew — New Generation 3D Laboratory Simulations for KPRIET Engineering Chemistry.
 * Replaces all legacy simulation scenes with solid, recognizable 3D laboratory apparatus.
 * Uses the existing Chem3D Canvas2D software renderer with proper depth sorting.
 *
 * PILOT: Simulation 1 — Water Hardness EDTA Titration
 */
(function () {
  const C3D = window.Chem3D;
  const V = C3D.V;

  const Sims = {};

  // ═══════════════════════════════════════════════════════════════════════
  // SHARED LABORATORY ASSETS
  // ═══════════════════════════════════════════════════════════════════════

  /** Draw a solid laboratory bench (wooden top on metal legs) */
  function drawLabBench(g, P, scene, center, width, depth, height) {
    const [cx, cy, cz] = center;
    const hw = width / 2, hd = depth / 2;
    // Tabletop — dark wood
    C3D.drawBox(g, P, [cx, cy, cz + height], [width, depth, 0.15], '#5c4033', { scene, stroke: '#3e2723' });
    // Four legs — dark metal
    const legR = 0.08, legH = height;
    const legPositions = [
      [cx - hw + 0.15, cy - hd + 0.15, cz],
      [cx + hw - 0.15, cy - hd + 0.15, cz],
      [cx - hw + 0.15, cy + hd - 0.15, cz],
      [cx + hw - 0.15, cy + hd - 0.15, cz],
    ];
    legPositions.forEach(pos => {
      C3D.drawCylinder(g, P, pos, legR, legH, '#334155', { scene, topCap: true, bottomCap: true });
    });
    // Cross bar — front
    C3D.drawBox(g, P, [cx, cy - hd + 0.15, cz + height * 0.3], [width - 0.4, 0.06, 0.06], '#475569', { scene });
  }

  /** Draw a retort stand with adjustable clamp */
  function drawRetortStand(g, P, scene, basePos, poleHeight) {
    const [bx, by, bz] = basePos;
    // Heavy base plate
    C3D.drawBox(g, P, [bx, by, bz], [1.0, 0.6, 0.1], '#1e293b', { scene, stroke: '#0f172a' });
    // Vertical pole
    C3D.drawCylinder(g, P, [bx - 0.3, by, bz + 0.1], 0.04, poleHeight, '#64748b', { scene, topCap: true, bottomCap: true });
    // Return pole top for reference
    return [bx - 0.3, by, bz + 0.1 + poleHeight];
  }

  /** Draw a burette clamp on the retort stand pole */
  function drawBuretteClamp(g, P, scene, polePos, clampHeight) {
    const [px, py, pz] = polePos;
    // Horizontal arm from pole
    C3D.drawBox(g, P, [px + 0.4, py, pz + clampHeight], [0.7, 0.08, 0.08], '#475569', { scene, stroke: '#334155' });
    // Clamp ring (two small brackets)
    const clampX = px + 0.7;
    C3D.drawCylinder(g, P, [clampX, py, pz + clampHeight - 0.06], 0.06, 0.12, '#64748b', { scene, topCap: true, bottomCap: true, segments: 10 });
    return [clampX, py, pz + clampHeight];
  }

  /** Draw a graduated burette with liquid and stopcock */
  function drawBurette(g, P, scene, center, liquidFraction, liquidColor) {
    const [cx, cy, cz] = center;
    const buretteH = 3.0;
    const buretteR = 0.08;

    // Glass tube — semi-transparent
    C3D.drawCylinder(g, P, [cx, cy, cz], buretteR, buretteH, '#bae6fd', {
      scene, alpha: 0.25, topCap: false, bottomCap: false, stroke: 'rgba(255,255,255,0.6)'
    });

    // Liquid column inside — from top down (burette reads top-down)
    const liquidH = buretteH * Math.max(0, Math.min(1, liquidFraction));
    if (liquidH > 0.01) {
      C3D.drawCylinder(g, P, [cx, cy, cz + (buretteH - liquidH)], buretteR * 0.85, liquidH, liquidColor, {
        scene, alpha: 0.8, topCap: true, bottomCap: true
      });
    }

    // Top funnel opening
    C3D.drawCylinder(g, P, [cx, cy, cz + buretteH], buretteR * 1.8, 0.12, '#bae6fd', {
      scene, alpha: 0.3, topCap: true, bottomCap: false
    });

    // Graduation marks (white lines on the glass)
    const renderGraduations = (ctx) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      for (let v = 0; v <= 25; v += 1) {
        const frac = v / 25;
        const z = cz + buretteH - frac * buretteH;
        const p1 = P([cx + buretteR * 0.9, cy, z]);
        const p2 = P([cx + buretteR * (v % 5 === 0 ? 0.5 : 0.7), cy, z]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        // Labels every 5 mL
        if (v % 5 === 0) {
          const pl = P([cx + buretteR * 0.3, cy, z]);
          ctx.fillStyle = '#ffffff';
          ctx.font = '600 ' + Math.max(8, 9 * pl.k) + 'px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(v), pl.x, pl.y + 3);
        }
      }
      ctx.restore();
    };
    const midPt = P([cx, cy, cz + buretteH / 2]);
    scene.add(midPt.depth - 0.5, renderGraduations);

    // Stopcock — small cylinder below burette
    C3D.drawCylinder(g, P, [cx, cy - 0.12, cz - 0.05], 0.04, 0.08, '#dc2626', {
      scene, topCap: true, bottomCap: true, axis: 'y', segments: 8
    });
    // Nozzle tip
    C3D.drawCylinder(g, P, [cx, cy, cz - 0.25], 0.025, 0.2, '#bae6fd', {
      scene, alpha: 0.35, topCap: false, bottomCap: true
    });
  }

  /** Draw a conical (Erlenmeyer) flask with liquid */
  function drawConicalFlask(g, P, scene, center, baseR, liquidH, liquidColor) {
    const [cx, cy, cz] = center;
    const bodyH = 1.2;
    const neckR = baseR * 0.28;
    const neckH = 0.5;

    // Flask body — glass
    C3D.drawFlask(g, P, [cx, cy, cz], baseR, neckR, bodyH, neckH, liquidH, liquidColor, {
      scene, liquidAlpha: 0.82
    });
  }

  /** Draw a reagent bottle with label */
  function drawReagentBottle(g, P, scene, center, height, color, label) {
    const [cx, cy, cz] = center;
    const r = 0.2;
    // Bottle body
    C3D.drawCylinder(g, P, [cx, cy, cz], r, height * 0.7, color, {
      scene, alpha: 0.6, topCap: true, bottomCap: true
    });
    // Bottle neck
    C3D.drawCylinder(g, P, [cx, cy, cz + height * 0.7], r * 0.5, height * 0.3, color, {
      scene, alpha: 0.5, topCap: false, bottomCap: false
    });
    // Cap
    C3D.drawCylinder(g, P, [cx, cy, cz + height], r * 0.55, 0.08, '#1e293b', {
      scene, topCap: true, bottomCap: true
    });
    // Label
    if (label) {
      C3D.drawTag(g, P, [cx, cy, cz + height * 0.35], label, '#1e293b', 0, { scene });
    }
  }

  /** Draw a liquid droplet falling from burette tip to flask */
  function drawDrip(g, P, scene, from, to, progress, color) {
    if (progress <= 0 || progress >= 1) return;
    const pos = V.lerp(from, to, progress);
    C3D.drawDroplet(g, P, pos, 0.04, color);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 1: EDTA Titration — Complete 3D Scene
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-edta-titration'] = {
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 160, 14);
      const scene = C3D.createScene();

      // Extract state
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const Ve = vs.Ve || 0;
      const endpointVol = vs.endpointVolume || 12;
      const progress = vs.progress || 0;
      const indicatorColor = vs.indicatorColor || '#9f1239';
      const atEndpoint = vs.atEndpoint || false;
      const step = st.step || 0;
      const t = st.t || 0;

      // Burette liquid fraction (starts full = 1.0, decreases as EDTA delivered)
      const buretteFraction = Math.max(0, 1 - (Ve / 25));

      // ── Ground grid ──
      C3D.drawGroundGrid(g, P, 5, 1, -1.5, 'rgba(148, 163, 184, 0.25)');

      // ── Laboratory bench ──
      drawLabBench(g, P, scene, [0, 0, -1.5], 5.5, 3.0, 1.5);

      // ── Retort stand with burette (left side) ──
      const standBaseZ = 0; // on top of bench
      const poleTop = drawRetortStand(g, P, scene, [-0.5, 0, standBaseZ], 4.5);
      const clampPos = drawBuretteClamp(g, P, scene, [-0.5 - 0.3, 0, standBaseZ], 3.5);

      // ── Burette ──
      const buretteBase = [clampPos[0], clampPos[1], standBaseZ + 0.8];
      drawBurette(g, P, scene, buretteBase, buretteFraction, '#2563eb');

      // ── Conical flask (below burette nozzle) ──
      const flaskCenter = [clampPos[0], clampPos[1], standBaseZ + 0.05];
      const flaskLiquidH = 0.7 + (Ve / 25) * 0.3; // liquid level rises as EDTA added
      drawConicalFlask(g, P, scene, flaskCenter, 0.55, flaskLiquidH, indicatorColor);

      // ── Drip animation (during titration steps) ──
      if (step >= 2 && step <= 3 && Ve > 0) {
        const dripFrom = [buretteBase[0], buretteBase[1], buretteBase[2] - 0.25];
        const dripTo = [flaskCenter[0], flaskCenter[1], flaskCenter[2] + flaskLiquidH];
        const dripProgress = (t * 2) % 1;
        const renderDrip = (ctx) => {
          const pos = V.lerp(dripFrom, dripTo, dripProgress);
          const q = P(pos);
          ctx.save();
          ctx.beginPath();
          ctx.arc(q.x, q.y, Math.max(2, 4 * q.k), 0, Math.PI * 2);
          ctx.fillStyle = '#2563eb';
          ctx.globalAlpha = 0.85;
          ctx.fill();
          ctx.restore();
        };
        const dMid = P(V.lerp(dripFrom, dripTo, 0.5));
        scene.add(dMid.depth - 0.2, renderDrip);
      }

      // ── Reagent bottles (right side of bench) ──
      drawReagentBottle(g, P, scene, [1.8, -0.5, standBaseZ], 0.8, '#7dd3fc', 'Buffer\npH 10');
      drawReagentBottle(g, P, scene, [2.3, -0.5, standBaseZ], 0.7, '#fbbf24', 'EBT\nIndicator');
      drawReagentBottle(g, P, scene, [2.8, -0.5, standBaseZ], 0.9, '#93c5fd', 'EDTA\n0.01 M');

      // ── Volumetric pipette (lying on bench) ──
      C3D.drawCylinder(g, P, [1.5, 0.8, standBaseZ + 0.05], 0.025, 2.0, '#bae6fd', {
        scene, alpha: 0.3, axis: 'x', topCap: true, bottomCap: true
      });
      // Pipette bulb
      C3D.drawSphere(g, P, [2.2, 0.8, standBaseZ + 0.05], 0.1, '#bae6fd', { scene, alpha: 0.25 });

      // ── White tile (for colour observation) ──
      C3D.drawBox(g, P, [clampPos[0] + 0.6, clampPos[1], standBaseZ + 0.02], [0.5, 0.5, 0.04], '#f8fafc', { scene, stroke: '#e2e8f0' });

      // ── Callout labels ──
      C3D.drawCallout(g, P, [buretteBase[0], buretteBase[1], buretteBase[2] + 3.2],
        'Burette (25 mL)\n' + (Ve > 0 ? Ve.toFixed(1) + ' mL delivered' : 'Full'),
        { scene, color: '#1e40af', bg: '#dbeafe' });

      C3D.drawCallout(g, P, [flaskCenter[0] + 0.6, flaskCenter[1], flaskCenter[2] + 0.5],
        'Sample flask\n' + (atEndpoint ? '🔵 ENDPOINT' : '🔴 ' + (progress * 100).toFixed(0) + '% titrated'),
        { scene, color: atEndpoint ? '#15803d' : '#9f1239', bg: atEndpoint ? '#dcfce7' : '#fff1f2' });

      if (step >= 4) {
        const hardness = vs.calculatedHardness || 0;
        C3D.drawCallout(g, P, [1.8, 0, standBaseZ + 2.5],
          'Total Hardness\n' + hardness.toFixed(1) + ' mg/L as CaCO₃',
          { scene, color: '#0f766e', bg: '#ccfbf1' });
      }

      // ── Title bar ──
      const renderTitle = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Water Hardness — EDTA Titration', 500, 32);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#15803d';
        ctx.fillText('Unit 1 · Water Technology', 500, 52);
        ctx.restore();
      };
      scene.add(-999, renderTitle);

      // ── Render the depth-sorted scene ──
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 2: Lime-Soda Water Softening — 3D Scene
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-lime-soda-process'] = {
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 120, 16);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const t = st.t || 0;

      C3D.drawGroundGrid(g, P, 6, 1, -1, 'rgba(148, 163, 184, 0.2)');

      // ── Chemical dosing tanks (lime + soda) ──
      // Lime tank (left)
      C3D.drawCylinder(g, P, [-3.5, 0, -1], 0.6, 2.5, '#e2e8f0', { scene, alpha: 0.5, topCap: false, bottomCap: true });
      const limeLiqH = 2.0 * Math.max(0.1, 1 - step * 0.15);
      C3D.drawCylinder(g, P, [-3.5, 0, -0.95], 0.55, limeLiqH, '#fef3c7', { scene, alpha: 0.7, topCap: true, bottomCap: true });
      C3D.drawTag(g, P, [-3.5, 0, 1.7], 'Ca(OH)₂\nLime', '#92400e', 0, { scene });

      // Soda tank (right of lime)
      C3D.drawCylinder(g, P, [-2.0, 0, -1], 0.6, 2.5, '#e2e8f0', { scene, alpha: 0.5, topCap: false, bottomCap: true });
      const sodaLiqH = 2.0 * Math.max(0.1, 1 - step * 0.12);
      C3D.drawCylinder(g, P, [-2.0, 0, -0.95], 0.55, sodaLiqH, '#dbeafe', { scene, alpha: 0.7, topCap: true, bottomCap: true });
      C3D.drawTag(g, P, [-2.0, 0, 1.7], 'Na₂CO₃\nSoda Ash', '#1e40af', 0, { scene });

      // ── Mixing / Reaction tank (center) ──
      C3D.drawCylinder(g, P, [0, 0, -1], 1.2, 2.8, '#cbd5e1', { scene, alpha: 0.35, topCap: false, bottomCap: true });
      // Water + precipitate inside
      const precipLevel = step >= 3 ? 0.4 + (vs.limeEfficiency || 0.5) * 0.8 : 0;
      if (precipLevel > 0) {
        C3D.drawCylinder(g, P, [0, 0, -0.95], 1.1, precipLevel, '#fef9c3', { scene, alpha: 0.6, topCap: true, bottomCap: true });
      }
      const waterH = 2.2;
      C3D.drawCylinder(g, P, [0, 0, -0.95 + precipLevel], 1.1, waterH - precipLevel, '#bae6fd', { scene, alpha: 0.5, topCap: true, bottomCap: false });

      // Paddle stirrer
      if (step >= 3) {
        const angle = t * 2;
        C3D.drawPaddle(g, P, [0, 0, -0.95 + waterH * 0.5], 1.5, 0.4, 0.08, angle, '#475569', { scene });
      }
      C3D.drawTag(g, P, [0, 0, 2.2], 'Reaction\nVessel', '#334155', 0, { scene });

      // ── Settling tank (right) ──
      C3D.drawCylinder(g, P, [2.5, 0, -1], 1.0, 2.5, '#cbd5e1', { scene, alpha: 0.3, topCap: false, bottomCap: true });
      // Settled sludge
      if (step >= 4) {
        const sludgeH = 0.3 + (vs.precipitateMass || 100) / 600;
        C3D.drawCylinder(g, P, [2.5, 0, -0.95], 0.95, sludgeH, '#a16207', { scene, alpha: 0.7, topCap: true, bottomCap: true });
        // Clear water above
        C3D.drawCylinder(g, P, [2.5, 0, -0.95 + sludgeH], 0.95, 2.0 - sludgeH, '#7dd3fc', { scene, alpha: 0.4, topCap: true, bottomCap: false });
      } else {
        C3D.drawCylinder(g, P, [2.5, 0, -0.95], 0.95, 2.0, '#93c5fd', { scene, alpha: 0.45, topCap: true, bottomCap: true });
      }
      C3D.drawTag(g, P, [2.5, 0, 1.7], 'Settling\nTank', '#334155', 0, { scene });

      // ── Pipes connecting tanks ──
      C3D.drawPipe(g, P, [-3.5, 0, 0.3], [-0.8, 0, 1.5], 0.06, '#64748b', { scene });
      C3D.drawPipe(g, P, [-2.0, 0, 0.3], [-0.5, 0, 1.5], 0.06, '#64748b', { scene });
      C3D.drawPipe(g, P, [1.0, 0, 0.5], [1.8, 0, 0.5], 0.06, '#64748b', { scene });

      // ── Water inlet (far left) and outlet (far right) ──
      C3D.drawPipe(g, P, [-5, 0, 0.5], [-3.5, 0, 0.5], 0.08, '#0ea5e9', { scene });
      C3D.drawTag(g, P, [-5, 0, 1.0], 'Hard Water\nInlet', '#0369a1', 0, { scene });
      C3D.drawPipe(g, P, [3.3, 0, 1.5], [5, 0, 1.5], 0.08, '#22c55e', { scene });
      C3D.drawTag(g, P, [5, 0, 2.0], 'Softened Water\nOutlet', '#15803d', 0, { scene });

      // ── Readout callout ──
      if (step >= 4 && vs.residualTotal != null) {
        C3D.drawCallout(g, P, [2.5, -1.2, 2.5],
          'Residual Hardness: ' + (vs.residualTotal || 0).toFixed(0) + ' mg/L',
          { scene, color: '#0f766e', bg: '#ccfbf1' });
      }

      // Title
      const renderTitle = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Lime-Soda Water Softening', 500, 32);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#15803d';
        ctx.fillText('Unit 1 · Water Technology', 500, 52);
        ctx.restore();
      };
      scene.add(-999, renderTitle);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 3: Daniell Cell — 3D Scene
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-daniell-cell'] = {
    initialView: { yaw: -0.44, pitch: 0.42, zoom: 1.08, panX: 0, panY: 15 },
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 115, 16);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const t = st.t || 0;
      const dur = st.dur || 4.0;
      const stepProg = Math.min(1, Math.max(0, (st.st != null ? st.st / dur : 1)));

      const znC = vs.znC != null ? vs.znC : (st.p && st.p.znConc != null ? Number(st.p.znConc) : 1.0);
      const cuC = vs.cuC != null ? vs.cuC : (st.p && st.p.cuConc != null ? Number(st.p.cuConc) : 1.0);
      const T = vs.T != null ? vs.T : (st.p && st.p.temperature != null ? Number(st.p.temperature) : 25);
      const Ecell = vs.Ecell != null ? vs.Ecell : 1.100;
      const Ecell_std = vs.Ecell_std != null ? vs.Ecell_std : 1.10;
      const Q = vs.Q != null ? vs.Q : (znC / cuC);
      const deltaG = vs.deltaG != null ? vs.deltaG : (-2 * 96485 * Ecell / 1000);

      const inspection = (st.p && st.p.inspection) || vs.inspection || 'Lab Bench Apparatus';
      const isAnodeMicro = inspection === 'Zn Anode Micro-View (Oxidation)';
      const isCathodeMicro = inspection === 'Cu Cathode Micro-View (Reduction)';
      const isBridgeTransport = inspection === 'Salt Bridge Ion Transport';
      const isBench = !isAnodeMicro && !isCathodeMicro && !isBridgeTransport;
      const showLabels = st.ui && st.ui.showLabels !== false;

      // ──────────────────────────────────────────────────────────────────
      // MODE 2: ZINC ANODE MICRO-VIEW (ATOMIC OXIDATION)
      // ──────────────────────────────────────────────────────────────────
      if (isAnodeMicro) {
        const renderAnodeMicro = (ctx) => {
          ctx.save();
          const W = 1000, H = 580;
          ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, W, H);

          // Grid background
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)'; ctx.lineWidth = 1;
          for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
          for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

          const ifX = 460, topY = 110, botY = 480, areaH = botY - topY;

          // Left zone: Solid Zinc Metal Lattice
          const mGrad = ctx.createLinearGradient(40, 0, ifX, 0);
          mGrad.addColorStop(0, 'rgba(100, 116, 139, 0.35)');
          mGrad.addColorStop(1, 'rgba(148, 163, 184, 0.22)');
          ctx.fillStyle = mGrad; ctx.fillRect(40, topY, ifX - 40, areaH);
          ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.strokeRect(40, topY, ifX - 40, areaH);

          // Right zone: Aqueous ZnSO4 Electrolyte Solution
          const sGrad = ctx.createLinearGradient(ifX, 0, 960, 0);
          sGrad.addColorStop(0, 'rgba(2, 132, 199, 0.18)');
          sGrad.addColorStop(1, 'rgba(2, 132, 199, 0.05)');
          ctx.fillStyle = sGrad; ctx.fillRect(ifX, topY, 960 - ifX, areaH);
          ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 2; ctx.strokeRect(ifX, topY, 960 - ifX, areaH);

          // Banners
          ctx.fillStyle = 'rgba(100, 116, 139, 0.5)'; ctx.fillRect(40, topY, ifX - 40, 30);
          ctx.font = '700 12px "Plus Jakarta Sans", monospace'; ctx.fillStyle = '#f1f5f9'; ctx.textAlign = 'left';
          ctx.fillText('SOLID ZINC ANODE LATTICE:  Zn(s)  [ANODE: NEGATIVE TERMINAL]', 52, topY + 20);

          ctx.fillStyle = 'rgba(2, 132, 199, 0.4)'; ctx.fillRect(ifX, topY, 960 - ifX, 30);
          ctx.font = '700 12px "Plus Jakarta Sans", monospace'; ctx.fillStyle = '#38bdf8';
          ctx.fillText('AQUEOUS ELECTROLYTE:  ' + znC.toFixed(2) + ' M ZnSO₄ (aq)', ifX + 14, topY + 20);

          // Zinc Lattice Atoms (ordered grid with pitted surface)
          const rows = 8, cols = 7;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const ax = 100 + c * 48 + ((r % 2) * 24);
              const ay = topY + 60 + r * 42;
              if (ax < ifX - 20) {
                ctx.beginPath(); ctx.arc(ax, ay, 16, 0, Math.PI * 2);
                ctx.fillStyle = '#64748b'; ctx.fill();
                ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.font = '700 9px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
                ctx.fillText('Zn⁰', ax, ay + 3);
              }
            }
          }

          // Active oxidation reaction at interface
          for (let k = 0; k < 6; k++) {
            const prog = ((t * 0.45 + k / 6) % 1);
            const oxY = topY + 65 + k * 52;
            const oxX = ifX - 18 + prog * 180;

            // Dissolving hydrated Zn2+ ion
            ctx.beginPath(); ctx.arc(oxX, oxY + Math.sin(t * 3 + k) * 8, 14, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b'; ctx.fill();
            ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = '700 9px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            ctx.fillText('Zn²⁺', oxX, oxY + 3 + Math.sin(t * 3 + k) * 8);

            // 2 liberated electrons shooting up into wire
            const eProg = ((t * 0.8 + k / 6) % 1);
            const ex = ifX - 35 - eProg * 250;
            const ey = oxY - eProg * 35;
            ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24'; ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();
            ctx.font = '700 7px monospace'; ctx.fillStyle = '#0f172a';
            ctx.fillText('e⁻', ex, ey + 2.5);
          }

          // Incoming NO3- anions from salt bridge to balance charge
          for (let m = 0; m < 5; m++) {
            const aProg = ((t * 0.35 + m / 5) % 1);
            const ax = 920 - aProg * 350;
            const ay = topY + 70 + m * 65;
            ctx.beginPath(); ctx.arc(ax, ay, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444'; ctx.fill();
            ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = '700 8px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            ctx.fillText('NO₃⁻', ax, ay + 3);
          }

          // Bottom Explanation Banner
          const scY = botY + 18;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(40, scY, 920, 52, 6) : ctx.rect(40, scY, 920, 52);
          ctx.fill(); ctx.stroke();
          ctx.font = '700 11px "Plus Jakarta Sans", monospace'; ctx.fillStyle = '#fde047'; ctx.textAlign = 'left';
          ctx.fillText('ANODE OXIDATION HALF-REACTION:', 54, scY + 20);
          ctx.font = '700 12px monospace'; ctx.fillStyle = '#38bdf8';
          ctx.fillText('Zn(s)  ⟶  Zn²⁺(aq) + 2e⁻       [Standard Oxidation Potential: E°ox = +0.76 V]', 305, scY + 20);
          ctx.font = '500 11px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#cbd5e1';
          ctx.fillText('Each neutral zinc atom releases 2 valence electrons into the metallic conductor (travelling up through the wire to the voltmeter), while the resulting Zn²⁺ ion enters the solution. The zinc electrode continuously loses mass.', 54, scY + 40);

          ctx.restore();
        };
        scene.add(0, renderAnodeMicro);
      }
      // ──────────────────────────────────────────────────────────────────
      // MODE 3: COPPER CATHODE MICRO-VIEW (ATOMIC REDUCTION)
      // ──────────────────────────────────────────────────────────────────
      else if (isCathodeMicro) {
        const renderCathodeMicro = (ctx) => {
          ctx.save();
          const W = 1000, H = 580;
          ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, W, H);

          // Grid
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)'; ctx.lineWidth = 1;
          for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
          for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

          const ifX = 540, topY = 110, botY = 480, areaH = botY - topY;

          // Left zone: Deep Blue CuSO4 Solution
          const sGrad = ctx.createLinearGradient(40, 0, ifX, 0);
          sGrad.addColorStop(0, 'rgba(30, 64, 175, 0.10)');
          sGrad.addColorStop(1, 'rgba(30, 64, 175, 0.35)');
          ctx.fillStyle = sGrad; ctx.fillRect(40, topY, ifX - 40, areaH);
          ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2; ctx.strokeRect(40, topY, ifX - 40, areaH);

          // Right zone: Solid Copper Metal Lattice
          const mGrad = ctx.createLinearGradient(ifX, 0, 960, 0);
          mGrad.addColorStop(0, 'rgba(180, 83, 9, 0.28)');
          mGrad.addColorStop(1, 'rgba(180, 83, 9, 0.45)');
          ctx.fillStyle = mGrad; ctx.fillRect(ifX, topY, 960 - ifX, areaH);
          ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2; ctx.strokeRect(ifX, topY, 960 - ifX, areaH);

          // Banners
          ctx.fillStyle = 'rgba(30, 64, 175, 0.45)'; ctx.fillRect(40, topY, ifX - 40, 30);
          ctx.font = '700 12px "Plus Jakarta Sans", monospace'; ctx.fillStyle = '#60a5fa'; ctx.textAlign = 'left';
          ctx.fillText('AQUEOUS ELECTROLYTE:  ' + cuC.toFixed(2) + ' M CuSO₄ (aq)  [HEXAAQUOCOMPLEX]', 52, topY + 20);

          ctx.fillStyle = 'rgba(180, 83, 9, 0.55)'; ctx.fillRect(ifX, topY, 960 - ifX, 30);
          ctx.font = '700 12px "Plus Jakarta Sans", monospace'; ctx.fillStyle = '#fed7aa';
          ctx.fillText('SOLID COPPER CATHODE:  Cu(s)  [CATHODE: POSITIVE TERMINAL]', ifX + 14, topY + 20);

          // Copper Lattice Atoms
          const rows = 8, cols = 8;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const ax = ifX + 24 + c * 48 + ((r % 2) * 24);
              const ay = topY + 60 + r * 42;
              if (ax < 950) {
                ctx.beginPath(); ctx.arc(ax, ay, 16, 0, Math.PI * 2);
                ctx.fillStyle = '#b45309'; ctx.fill();
                ctx.strokeStyle = '#fdba74'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.font = '700 9px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
                ctx.fillText('Cu⁰', ax, ay + 3);
              }
            }
          }

          // Active reduction: Cu2+ ions diffusing and plating onto surface
          for (let k = 0; k < 6; k++) {
            const prog = ((t * 0.45 + k / 6) % 1);
            const redY = topY + 65 + k * 52;
            const redX = 120 + prog * (ifX - 140);

            // Incoming Cu2+ ion
            ctx.beginPath(); ctx.arc(redX, redY + Math.sin(t * 3 + k) * 8, 14, 0, Math.PI * 2);
            ctx.fillStyle = '#2563eb'; ctx.fill();
            ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = '700 9px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            ctx.fillText('Cu²⁺', redX, redY + 3 + Math.sin(t * 3 + k) * 8);

            // Incoming electrons from wire arriving at surface
            const eProg = ((t * 0.8 + k / 6) % 1);
            const ex = 900 - eProg * (900 - ifX);
            const ey = redY;
            ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24'; ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();
            ctx.font = '700 7px monospace'; ctx.fillStyle = '#0f172a';
            ctx.fillText('e⁻', ex, ey + 2.5);
          }

          // Incoming K+ cations from salt bridge to replace consumed Cu2+
          for (let m = 0; m < 5; m++) {
            const kProg = ((t * 0.35 + m / 5) % 1);
            const kx = 80 + kProg * 320;
            const ky = topY + 70 + m * 65;
            ctx.beginPath(); ctx.arc(kx, ky, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#a855f7'; ctx.fill();
            ctx.strokeStyle = '#d8b4fe'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = '700 8px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            ctx.fillText('K⁺', kx, ky + 3);
          }

          // Bottom Explanation Banner
          const scY = botY + 18;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(40, scY, 920, 52, 6) : ctx.rect(40, scY, 920, 52);
          ctx.fill(); ctx.stroke();
          ctx.font = '700 11px "Plus Jakarta Sans", monospace'; ctx.fillStyle = '#fde047'; ctx.textAlign = 'left';
          ctx.fillText('CATHODE REDUCTION HALF-REACTION:', 54, scY + 20);
          ctx.font = '700 12px monospace'; ctx.fillStyle = '#4ade80';
          ctx.fillText('Cu²⁺(aq) + 2e⁻  ⟶  Cu(s)       [Standard Reduction Potential: E°red = +0.34 V]', 315, scY + 20);
          ctx.font = '500 11px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#cbd5e1';
          ctx.fillText('Dissolved Cu²⁺ ions migrate to the cathode, accept 2 incoming electrons from the electrical circuit, and deposit as solid metallic copper. The copper electrode continuously gains mass while the blue solution fades.', 54, scY + 40);

          ctx.restore();
        };
        scene.add(0, renderCathodeMicro);
      }
      // ──────────────────────────────────────────────────────────────────
      // MODE 4: SALT BRIDGE ION TRANSPORT VIEW
      // ──────────────────────────────────────────────────────────────────
      else if (isBridgeTransport) {
        const renderBridgeTransport = (ctx) => {
          ctx.save();
          const W = 1000, H = 580;
          ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, W, H);

          // Grid
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)'; ctx.lineWidth = 1;
          for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
          for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

          // Left Half-Cell (ZnSO4, accumulating positive charge)
          ctx.fillStyle = 'rgba(2, 132, 199, 0.15)'; ctx.fillRect(40, 110, 260, 360);
          ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 2; ctx.strokeRect(40, 110, 260, 360);
          ctx.font = '700 12px monospace'; ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'center';
          ctx.fillText('ANODE COMPARTMENT', 170, 135);
          ctx.font = '600 11px monospace'; ctx.fillStyle = '#fde047';
          ctx.fillText('Accumulating Zn²⁺ cations', 170, 155);
          ctx.fillText('(+ charge buildup)', 170, 172);

          // Right Half-Cell (CuSO4, accumulating negative charge)
          ctx.fillStyle = 'rgba(30, 64, 175, 0.22)'; ctx.fillRect(700, 110, 260, 360);
          ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2; ctx.strokeRect(700, 110, 260, 360);
          ctx.font = '700 12px monospace'; ctx.fillStyle = '#60a5fa'; ctx.textAlign = 'center';
          ctx.fillText('CATHODE COMPARTMENT', 830, 135);
          ctx.font = '600 11px monospace'; ctx.fillStyle = '#fde047';
          ctx.fillText('Depleting Cu²⁺ (excess SO₄²⁻)', 830, 155);
          ctx.fillText('(- charge buildup)', 830, 172);

          // Center: The U-Tube Salt Bridge in Agar Gel
          const bLeft = 300, bRight = 700;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)'; ctx.fillRect(bLeft, 190, bRight - bLeft, 180);
          ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.5; ctx.strokeRect(bLeft, 190, bRight - bLeft, 180);

          ctx.fillStyle = 'rgba(245, 158, 11, 0.45)'; ctx.fillRect(bLeft, 190, bRight - bLeft, 30);
          ctx.font = '800 12px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#fde047'; ctx.textAlign = 'center';
          ctx.fillText('SALT BRIDGE: INVERTED U-TUBE (KNO₃ / KCl IN AGAR-AGAR GEL)', 500, 210);

          // Porous Cotton Plugs
          ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
          ctx.fillRect(bLeft - 10, 240, 20, 80); ctx.strokeRect(bLeft - 10, 240, 20, 80);
          ctx.fillRect(bRight - 10, 240, 20, 80); ctx.strokeRect(bRight - 10, 240, 20, 80);
          ctx.font = '700 9px monospace'; ctx.fillStyle = '#475569';
          ctx.fillText('Cotton Plug', bLeft, 335); ctx.fillText('Cotton Plug', bRight, 335);

          // Counter-Ion Streams
          // 1. Potassium K+ cations migrating RIGHT toward cathode
          for (let i = 0; i < 7; i++) {
            const prog = ((t * 0.4 + i / 7) % 1);
            const kx = bLeft + 20 + prog * (bRight - bLeft - 40);
            const ky = 250 + Math.sin(t * 3 + i) * 12;
            ctx.beginPath(); ctx.arc(kx, ky, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#a855f7'; ctx.fill();
            ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = '700 9px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            ctx.fillText('K⁺ →', kx, ky + 3);
          }

          // 2. Nitrate NO3- anions migrating LEFT toward anode
          for (let j = 0; j < 7; j++) {
            const prog = ((t * 0.4 + j / 7) % 1);
            const nx = (bRight - 20) - prog * (bRight - bLeft - 40);
            const ny = 310 + Math.sin(t * 3 + j) * 12;
            ctx.beginPath(); ctx.arc(nx, ny, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444'; ctx.fill();
            ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = '700 8px monospace'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
            ctx.fillText('← NO₃⁻', nx, ny + 3);
          }

          // Bottom Explanation
          const scY = 485;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(40, scY, 920, 65, 6) : ctx.rect(40, scY, 920, 65);
          ctx.fill(); ctx.stroke();
          ctx.font = '700 11px "Plus Jakarta Sans", monospace'; ctx.fillStyle = '#fde047'; ctx.textAlign = 'left';
          ctx.fillText('WHY IS THE SALT BRIDGE ESSENTIAL?', 54, scY + 18);
          ctx.font = '500 11px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#e2e8f0';
          ctx.fillText('1. Electroneutrality Maintenance: As Zn²⁺ accumulates at the anode and Cu²⁺ depletes at the cathode, counter-ions stream continuously to neutralize local charge buildup.', 54, scY + 36);
          ctx.fillText('2. Circuit Completion: Without the salt bridge, an opposing electric field establishes in microseconds, instantly halting electron flow (E_cell drops to 0 V).', 54, scY + 54);

          ctx.restore();
        };
        scene.add(0, renderBridgeTransport);
      }
      // ──────────────────────────────────────────────────────────────────
      // MODE 1: MACROSCOPIC 3D LAB BENCH APPARATUS
      // ──────────────────────────────────────────────────────────────────
      else {
        // Floor drop shadow beneath the bench
        const floorCenter = P([0, 0, -1.55]);
        scene.add(floorCenter.depth + 0.8, (ctx) => {
          ctx.save();
          ctx.translate(floorCenter.x, floorCenter.y);
          ctx.scale(1, 0.42);
          const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, 340);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
          grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.10)');
          grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
          ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        });

        // Floor grid
        C3D.drawGroundGrid(g, P, 6.0, 1, -1.55, 'rgba(148, 163, 184, 0.22)');

        // ── 1. Laboratory Bench ──
        drawLabBench(g, P, scene, [0, 0, -1.5], 5.8, 3.2, 1.5);
        const benchTop = 0;

        // ── 2. Left Beaker — Zinc Half-Cell ──
        const znBeakerCenter = [-1.45, 0.1, benchTop];
        // Water-clear transparent liquid (realistic ZnSO4)
        C3D.drawCylinder(g, P, [-1.45, 0.1, benchTop + 0.04], 0.61, 1.35, '#f0f9ff', {
          scene, alpha: 0.22, topCap: true, bottomCap: true
        });
        // Outer glass beaker
        C3D.drawCylinder(g, P, znBeakerCenter, 0.65, 1.8, '#bae6fd', {
          scene, alpha: 0.25, topCap: false, bottomCap: true, stroke: 'rgba(255,255,255,0.85)'
        });
        // Glass rim highlight & white graduations
        const znRimPt = P([-1.45, 0.1, benchTop + 1.8]);
        scene.add(znRimPt.depth - 0.1, (ctx) => {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 2;
          for (let h = 0.3; h < 0.85; h += 0.15) {
            const p1 = P([-1.45 + 0.63, 0.1, benchTop + 1.8 * h]);
            const p2 = P([-1.45 + 0.52, 0.1, benchTop + 1.8 * h]);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
          ctx.restore();
        });

        // Zinc electrode: Silver-grey metallic plate with surface etching
        C3D.drawBox(g, P, [-1.45, 0.1, benchTop + 0.85], [0.10, 0.34, 1.5], '#94a3b8', {
          scene, stroke: '#64748b'
        });
        // Clamping screw at top of electrode
        C3D.drawCylinder(g, P, [-1.45, 0.1, benchTop + 1.62], 0.05, 0.08, '#475569', { scene, axis: 'y' });

        // ── 3. Right Beaker — Copper Half-Cell ──
        const cuBeakerCenter = [1.45, 0.1, benchTop];
        // Luminous deep royal sapphire/cerulean blue solution (CuSO4)
        C3D.drawCylinder(g, P, [1.45, 0.1, benchTop + 0.04], 0.61, 1.35, '#1d4ed8', {
          scene, alpha: 0.72, topCap: true, bottomCap: true
        });
        // Outer glass beaker
        C3D.drawCylinder(g, P, cuBeakerCenter, 0.65, 1.8, '#bae6fd', {
          scene, alpha: 0.25, topCap: false, bottomCap: true, stroke: 'rgba(255,255,255,0.85)'
        });
        // Graduations
        const cuRimPt = P([1.45, 0.1, benchTop + 1.8]);
        scene.add(cuRimPt.depth - 0.1, (ctx) => {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 2;
          for (let h = 0.3; h < 0.85; h += 0.15) {
            const p1 = P([1.45 + 0.63, 0.1, benchTop + 1.8 * h]);
            const p2 = P([1.45 + 0.52, 0.1, benchTop + 1.8 * h]);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
          ctx.restore();
        });

        // Copper electrode: Reddish-bronze metallic plate
        C3D.drawBox(g, P, [1.45, 0.1, benchTop + 0.85], [0.10, 0.34, 1.5], '#b45309', {
          scene, stroke: '#92400e'
        });
        C3D.drawCylinder(g, P, [1.45, 0.1, benchTop + 1.62], 0.05, 0.08, '#78350f', { scene, axis: 'y' });

        // ── 4. Inverted U-Tube Salt Bridge (Arched behind beakers at y = 0.20) ──
        const bridgeH = 2.35;
        // Left vertical leg down into Zn beaker
        C3D.drawCylinder(g, P, [-0.95, 0.20, benchTop + 0.35], 0.065, bridgeH - 0.35, '#fef08a', {
          scene, alpha: 0.70, topCap: true, bottomCap: true, stroke: '#d97706'
        });
        // Right vertical leg down into Cu beaker
        C3D.drawCylinder(g, P, [0.95, 0.20, benchTop + 0.35], 0.065, bridgeH - 0.35, '#fef08a', {
          scene, alpha: 0.70, topCap: true, bottomCap: true, stroke: '#d97706'
        });
        // Horizontal U-tube connector bridge
        C3D.drawCylinder(g, P, [-0.95, 0.20, benchTop + bridgeH], 0.065, 1.90, '#fef08a', {
          scene, alpha: 0.70, topCap: true, bottomCap: true, axis: 'x', stroke: '#d97706'
        });
        // Porous cotton end plugs
        C3D.drawSphere(g, P, [-0.95, 0.20, benchTop + 0.35], 0.075, '#f8fafc', { scene, stroke: '#94a3b8' });
        C3D.drawSphere(g, P, [0.95, 0.20, benchTop + 0.35], 0.075, '#f8fafc', { scene, stroke: '#94a3b8' });

        // Streaming counter-ions inside salt bridge
        for (let i = 0; i < 4; i++) {
          const fracK = ((t * 0.45 + i * 0.25) % 1);
          const kPos = V.lerp([-0.85, 0.20, benchTop + bridgeH], [0.85, 0.20, benchTop + bridgeH], fracK);
          C3D.drawSphere(g, P, kPos, 0.045, '#a855f7', { scene });

          const fracNO = ((t * 0.45 + i * 0.25) % 1);
          const noPos = V.lerp([0.85, 0.20, benchTop + bridgeH - 0.03], [-0.85, 0.20, benchTop + bridgeH - 0.03], fracNO);
          C3D.drawSphere(g, P, noPos, 0.045, '#ef4444', { scene });
        }

        // ── 5. Laboratory Digital / Analog Multimeter (Benchtop foreground) ──
        // Positioned at [0, -0.95, 0.35] resting solidly on the wooden bench
        const meterC = [0, -0.95, benchTop + 0.35];
        C3D.drawBox(g, P, meterC, [0.78, 0.55, 0.68], '#1e293b', { scene, stroke: '#0f172a' });
        // Beveled rubber bumper
        C3D.drawBox(g, P, [meterC[0], meterC[1], meterC[2] - 0.28], [0.82, 0.58, 0.12], '#0f172a', { scene });

        // Terminals on front of meter
        C3D.drawCylinder(g, P, [-0.22, -1.24, benchTop + 0.20], 0.04, 0.06, '#0f172a', { scene, axis: 'y' }); // Black (-)
        C3D.drawCylinder(g, P, [0.22, -1.24, benchTop + 0.20], 0.04, 0.06, '#dc2626', { scene, axis: 'y' });  // Red (+)

        // Slanted meter face display
        const mFacePt = P([meterC[0], meterC[1] - 0.28, meterC[2] + 0.08]);
        scene.add(mFacePt.depth - 0.25, (ctx) => {
          ctx.save();
          ctx.translate(mFacePt.x, mFacePt.y);

          // Face plate
          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(-58, -32, 116, 64, 4) : ctx.rect(-58, -32, 116, 64);
          ctx.fill();
          ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.2; ctx.stroke();

          // LCD Title
          ctx.font = '700 8px monospace'; ctx.fillStyle = '#64748b'; ctx.textAlign = 'center';
          ctx.fillText('HIGH-IMPEDANCE DC VOLTMETER', 0, -20);

          // Glowing Digital Volts
          ctx.font = '800 16px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = Ecell > 0 ? '#4ade80' : '#f87171';
          ctx.fillText(Ecell.toFixed(3) + ' V', 0, 0);

          // Mini Analog Gauge Arc
          ctx.beginPath();
          ctx.arc(0, 24, 22, Math.PI, Math.PI * 2);
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();

          const needleFrac = Math.min(1, Math.max(0, Ecell / 2.0));
          const needleAng = Math.PI + needleFrac * Math.PI;
          ctx.beginPath(); ctx.moveTo(0, 24);
          ctx.lineTo(Math.cos(needleAng) * 20, 24 + Math.sin(needleAng) * 20);
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();

          ctx.restore();
        });

        // ── 6. Realistic Flexible Electrical Wire Leads ──
        // Black negative lead: Zn Anode [-1.45, 0.1, 1.6] -> meter negative [-0.22, -1.24, 0.20]
        const wireBlack = [
          [-1.45, 0.1, benchTop + 1.6],
          [-1.15, -0.4, benchTop + 1.0],
          [-0.65, -0.85, benchTop + 0.45],
          [-0.22, -1.24, benchTop + 0.20]
        ];
        for (let b = 0; b < wireBlack.length - 1; b++) {
          C3D.drawPipe(g, P, wireBlack[b], wireBlack[b + 1], 0.022, '#0f172a', { scene, stroke: '#334155' });
        }

        // Red positive lead: Cu Cathode [1.45, 0.1, 1.6] -> meter positive [0.22, -1.24, 0.20]
        const wireRed = [
          [1.45, 0.1, benchTop + 1.6],
          [1.15, -0.4, benchTop + 1.0],
          [0.65, -0.85, benchTop + 0.45],
          [0.22, -1.24, benchTop + 0.20]
        ];
        for (let r = 0; r < wireRed.length - 1; r++) {
          C3D.drawPipe(g, P, wireRed[r], wireRed[r + 1], 0.022, '#dc2626', { scene, stroke: '#991b1b' });
        }

        // Alligator clips on electrodes
        C3D.drawBox(g, P, [-1.45, 0.1, benchTop + 1.6], [0.08, 0.14, 0.10], '#334155', { scene });
        C3D.drawBox(g, P, [1.45, 0.1, benchTop + 1.6], [0.08, 0.14, 0.10], '#991b1b', { scene });

        // ── 7. Animated Streaming Electrons in Circuit ──
        if (step >= 1) {
          const eCount = 14;
          for (let e = 0; e < eCount; e++) {
            const u = ((t * 0.45 + e / eCount) % 1);
            let ePos;
            if (u < 0.5) {
              const f = u / 0.5;
              ePos = V.lerp(wireBlack[0], wireBlack[wireBlack.length - 1], f);
            } else {
              const f = (u - 0.5) / 0.5;
              ePos = V.lerp(wireRed[wireRed.length - 1], wireRed[0], f);
            }
            C3D.drawSphere(g, P, ePos, 0.04, '#fbbf24', { scene });
          }
        }

        // ── 8. Component Bounds & Interactive Highlights ──
        const compDefs = [
          { id: 'znBeaker', pos: [-1.45, 0.1, benchTop + 0.9], title: 'Zinc Half-Cell (Anode)', specs: 'Electrode: Zn(s) · Solution: ' + znC.toFixed(2) + ' M ZnSO₄ · E° = −0.76 V', desc: 'Zinc undergoes oxidation, releasing electrons into the wire: Zn(s) → Zn²⁺(aq) + 2e⁻.' },
          { id: 'cuBeaker', pos: [1.45, 0.1, benchTop + 0.9], title: 'Copper Half-Cell (Cathode)', specs: 'Electrode: Cu(s) · Solution: ' + cuC.toFixed(2) + ' M CuSO₄ · E° = +0.34 V', desc: 'Copper ions accept electrons and electroplate as solid metal: Cu²⁺(aq) + 2e⁻ → Cu(s).' },
          { id: 'saltBridge', pos: [0, 0.20, benchTop + bridgeH], title: 'U-Tube Salt Bridge', specs: 'Electrolyte: KNO₃ / KCl in Agar · Junction: ~0 mV · Plugs: Porous Cotton', desc: 'Maintains electroneutrality by counter-ion migration (K⁺ to cathode, NO₃⁻ to anode).' },
          { id: 'voltmeter', pos: meterC, title: 'High-Impedance Digital Voltmeter', specs: 'Reading: ' + Ecell.toFixed(3) + ' V · Sensitivity: ±0.001 V · Circuit: High R', desc: 'Measures the electromotive force (EMF) between zinc anode and copper cathode.' }
        ];

        if (!st.ui) st.ui = {};
        st.ui._compBounds = compDefs.map((c) => {
          const pr = P(c.pos);
          return { id: c.id, x: pr.x, y: pr.y, r: 48 * (P.zoom || 1), title: c.title };
        });

        const selectedId = st.ui.selectedComponent;
        if (selectedId) {
          const selComp = compDefs.find((c) => c.id === selectedId);
          if (selComp) {
            C3D.drawSphere(g, P, selComp.pos, 0.65, 'rgba(56, 189, 248, 0.25)', { scene });
          }
        }

        // ── 9. Non-Clashing, Staggered Callout Badges ──
        if (showLabels) {
          C3D.drawCallout(g, P, [-1.45, 0.1, benchTop + 2.15], 'Zn Anode (−)', { scene, color: '#475569', bg: '#f1f5f9' });
          C3D.drawCallout(g, P, [1.45, 0.1, benchTop + 2.15], 'Cu Cathode (+)', { scene, color: '#9a3412', bg: '#fff7ed' });
          C3D.drawCallout(g, P, [0, 0.20, benchTop + bridgeH + 0.38], 'Salt Bridge (KNO₃ / Agar)', { scene, color: '#92400e', bg: '#fef3c7' });
          C3D.drawCallout(g, P, [-1.45, -0.65, benchTop + 0.45], znC.toFixed(2) + ' M ZnSO₄ (aq)', { scene, color: '#0369a1', bg: '#f0f9ff' });
          C3D.drawCallout(g, P, [1.45, -0.65, benchTop + 0.45], cuC.toFixed(2) + ' M CuSO₄ (aq)', { scene, color: '#1e40af', bg: '#eff6ff' });
          C3D.drawCallout(g, P, [0, -0.95, benchTop + 0.95], 'Digital EMF: ' + Ecell.toFixed(3) + ' V', { scene, color: '#15803d', bg: '#f0fdf4' });
        }
      }

      // ─── 10. SCREEN TITLE, MODE SWITCHER BUTTONS & TELEMETRY HUD ───
      const renderOverlay = (ctx) => {
        ctx.save();

        // Title Header (Top Left)
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Electrochemical Cell — Daniell Cell', 32, 38);
        ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#1d4ed8';
        ctx.fillText(
          'E°cell = ' + Ecell_std.toFixed(2) + ' V · E(actual) = ' + Ecell.toFixed(3) + ' V · Q = ' + Q.toFixed(3) + ' · ΔG = ' + deltaG.toFixed(1) + ' kJ/mol',
          32, 60
        );

        // On-Canvas Mode Switcher Tabs (Top Right: x = 520 to 990, y = 16 to 48)
        const modes = [
          { id: 'Lab Bench Apparatus', label: '🔋 Lab Bench', x: 520, w: 110 },
          { id: 'Zn Anode Micro-View (Oxidation)', label: '🔬 Zn Oxidation', x: 636, w: 120 },
          { id: 'Cu Cathode Micro-View (Reduction)', label: '🔬 Cu Reduction', x: 762, w: 120 },
          { id: 'Salt Bridge Ion Transport', label: '🧪 Salt Bridge', x: 888, w: 102 }
        ];

        modes.forEach(m => {
          const isActive = inspection === m.id;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(m.x, 16, m.w, 32, 6) : ctx.rect(m.x, 16, m.w, 32);
          ctx.fillStyle = isActive ? '#1d4ed8' : 'rgba(15, 23, 42, 0.85)';
          ctx.fill();
          ctx.strokeStyle = isActive ? '#60a5fa' : '#334155';
          ctx.lineWidth = isActive ? 1.5 : 1;
          ctx.stroke();

          ctx.font = (isActive ? '700' : '600') + ' 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.fillText(m.label, m.x + m.w / 2, 36);
        });

        // Sub-Row Quick Action Tools (Top Left: y = 68 to 94)
        const tools = [
          { label: showLabels ? '🏷️ Labels: ON' : '🏷️ Labels: OFF', x: 32, w: 108, active: showLabels },
          { label: '🎥 Reset View', x: 146, w: 94, active: false },
          { label: '🎯 Focus Electrodes', x: 246, w: 105, active: false }
        ];

        tools.forEach(t => {
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(t.x, 68, t.w, 26, 5) : ctx.rect(t.x, 68, t.w, 26);
          ctx.fillStyle = t.active ? 'rgba(29, 78, 216, 0.15)' : 'rgba(241, 245, 249, 0.92)';
          ctx.fill();
          ctx.strokeStyle = t.active ? '#1d4ed8' : '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = t.active ? '#1d4ed8' : '#475569';
          ctx.textAlign = 'center';
          ctx.fillText(t.label, t.x + t.w / 2, 85);
        });

        // Telemetry Card (Top Right below modes)
        if (isBench) {
          const scadaX = 660, scadaY = 60, scadaW = 330, scadaH = 50;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(scadaX, scadaY, scadaW, scadaH, 6) : ctx.rect(scadaX, scadaY, scadaW, scadaH);
          ctx.fill(); ctx.stroke();

          ctx.textAlign = 'left';
          ctx.font = '700 9px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = '#60a5fa';
          ctx.fillText('NERNST: E = ' + Ecell.toFixed(3) + ' V · Q = ' + Q.toFixed(3), scadaX + 10, scadaY + 18);
          ctx.fillStyle = '#4ade80';
          ctx.fillText('ANODE: Zn → Zn²⁺ + 2e⁻', scadaX + 10, scadaY + 36);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#fde047';
          ctx.fillText('ΔG: ' + deltaG.toFixed(1) + ' kJ/mol', scadaX + scadaW - 10, scadaY + 18);
          ctx.fillStyle = '#4ade80';
          ctx.fillText('CATHODE: Cu²⁺ + 2e⁻ → Cu', scadaX + scadaW - 10, scadaY + 36);
        }

        // Visual Stream Legend (Bottom Left)
        if (isBench) {
          const legY = 490;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'; ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(30, legY, 340, 60, 8) : ctx.rect(30, legY, 340, 60);
          ctx.fill(); ctx.stroke();

          ctx.font = '700 10px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#475569'; ctx.textAlign = 'left';
          ctx.fillText('ELECTROCHEMICAL TRANSPORT LEGEND', 42, legY + 16);

          ctx.beginPath(); ctx.arc(46, legY + 32, 5, 0, Math.PI * 2); ctx.fillStyle = '#fbbf24'; ctx.fill();
          ctx.font = '600 11px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#0f172a';
          ctx.fillText('Electron (e⁻) Flow: Zn ⟶ Voltmeter ⟶ Cu', 58, legY + 36);

          ctx.beginPath(); ctx.arc(46, legY + 48, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#a855f7'; ctx.fill();
          ctx.fillText('K⁺ (Purple) ⟶ Cu  |  NO₃⁻ (Red) ⟶ Zn', 58, legY + 52);
        }

        // Selected Component Interactive Card Modal
        const selectedId = st.ui && st.ui.selectedComponent;
        if (selectedId && isBench) {
          const compDefs = [
            { id: 'znBeaker', title: 'Zinc Half-Cell (Anode)', specs: 'Electrode: Zn(s) · Solution: ' + znC.toFixed(2) + ' M ZnSO₄ · E° = −0.76 V', desc: 'Zinc undergoes oxidation, releasing electrons into the wire: Zn(s) → Zn²⁺(aq) + 2e⁻. Over time, the zinc electrode thins.' },
            { id: 'cuBeaker', title: 'Copper Half-Cell (Cathode)', specs: 'Electrode: Cu(s) · Solution: ' + cuC.toFixed(2) + ' M CuSO₄ · E° = +0.34 V', desc: 'Copper ions accept electrons and electroplate as solid metal: Cu²⁺(aq) + 2e⁻ → Cu(s). The copper electrode gains mass.' },
            { id: 'saltBridge', title: 'U-Tube Salt Bridge', specs: 'Electrolyte: KNO₃ / KCl in Agar · Junction: ~0 mV · Plugs: Porous Cotton', desc: 'Maintains electroneutrality by counter-ion migration (K⁺ to cathode, NO₃⁻ to anode). Without it, current stops instantly.' },
            { id: 'voltmeter', title: 'High-Impedance Digital Voltmeter', specs: 'Reading: ' + Ecell.toFixed(3) + ' V · Sensitivity: ±0.001 V · Circuit: High R', desc: 'Measures the electromotive force (EMF) between zinc anode and copper cathode without drawing significant current.' }
          ];

          const selComp = compDefs.find((c) => c.id === selectedId);
          if (selComp) {
            const cardX = 630, cardY = 115, cardW = 340, cardH = 135;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.96)'; ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 8) : ctx.rect(cardX, cardY, cardW, cardH);
            ctx.fill(); ctx.stroke();

            ctx.textAlign = 'left'; ctx.fillStyle = '#60a5fa'; ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(selComp.title.toUpperCase(), cardX + 14, cardY + 22);

            ctx.textAlign = 'right'; ctx.fillStyle = '#94a3b8'; ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('✕ Close', cardX + cardW - 14, cardY + 22);

            ctx.textAlign = 'left'; ctx.fillStyle = '#fde047'; ctx.font = '600 10px "Plus Jakarta Sans", monospace';
            ctx.fillText(selComp.specs, cardX + 14, cardY + 44);

            ctx.fillStyle = '#e2e8f0'; ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
            const words = selComp.desc.split(' ');
            let line = '', lY = cardY + 68;
            for (let w = 0; w < words.length; w++) {
              const testLine = line + words[w] + ' ';
              if (ctx.measureText(testLine).width > cardW - 28) {
                ctx.fillText(line, cardX + 14, lY);
                line = words[w] + ' ';
                lY += 17;
              } else {
                line = testLine;
              }
            }
            if (line) ctx.fillText(line, cardX + 14, lY);

            ctx.fillStyle = '#64748b'; ctx.font = 'italic 9px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('Click anywhere outside or on close to dismiss', cardX + 14, cardY + cardH - 10);
          }
        }

        ctx.restore();
      };

      scene.add(-999, renderOverlay);
      scene.render(g);
    }
  };

  // SIMULATION 4: Corrosion & Cathodic Protection — 3D Scene
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-corrosion-protection'] = {
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 135, 14);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const t = st.t || 0;
      const mode = vs.mode || 'Unprotected';
      const rustThick = vs.rustThickness || 0;

      C3D.drawGroundGrid(g, P, 5, 1, -1.5, 'rgba(148, 163, 184, 0.2)');

      // ── Electrolyte tank ──
      C3D.drawCylinder(g, P, [0, 0, -1.5], 2.0, 2.5, '#e2e8f0', { scene, alpha: 0.25, topCap: false, bottomCap: true });
      // Electrolyte liquid
      C3D.drawCylinder(g, P, [0, 0, -1.45], 1.9, 2.0, '#93c5fd', { scene, alpha: 0.35, topCap: true, bottomCap: true });
      C3D.drawTag(g, P, [0, -2.2, 0.5], 'Electrolyte\n(NaCl solution)', '#0369a1', 0, { scene });

      // ── Steel coupon (center) ──
      const steelColor = rustThick > 0.1 ? '#92400e' : '#71717a';
      const rustAlpha = Math.min(0.9, rustThick * 2);
      C3D.drawBox(g, P, [0, 0, -0.5], [1.2, 0.15, 1.5], '#71717a', { scene, stroke: '#52525b' });
      // Rust layer on surface
      if (rustThick > 0.02 && mode === 'Unprotected') {
        C3D.drawBox(g, P, [0, 0.08 + rustThick * 0.5, -0.5], [1.1, Math.min(0.15, rustThick * 3), 1.4], '#b45309', {
          scene, alpha: rustAlpha, stroke: '#92400e'
        });
      }
      C3D.drawTag(g, P, [0, 0, 1.2], 'Steel\nCoupon', '#334155', 0, { scene });

      // ── Sacrificial anode (if that mode) ──
      if (mode === 'Sacrificial Anode (Zn)') {
        C3D.drawBox(g, P, [-1.0, 0, -0.3], [0.3, 0.15, 1.0], '#a1a1aa', { scene, stroke: '#71717a' });
        C3D.drawTag(g, P, [-1.0, 0, 1.0], 'Zinc\nAnode', '#52525b', 0, { scene });
        // Wire connecting Zn to steel
        C3D.drawPipe(g, P, [-0.85, 0, 0.7], [-0.1, 0, 0.7], 0.02, '#f59e0b', { scene });
        // Show Zn dissolving
        if (step >= 3) {
          for (let i = 0; i < 3; i++) {
            const pos = V.add([-1.0, 0, 0], [0.2 * Math.sin(t + i), 0.3, 0.3 * i]);
            C3D.drawAtom(g, P, pos, 3.5, '#a1a1aa', 'Zn', '2+', 0.5);
          }
        }
      }

      // ── Impressed current system (if that mode) ──
      if (mode === 'Impressed Current') {
        // External anode (graphite)
        C3D.drawBox(g, P, [-1.2, 0, -0.3], [0.2, 0.15, 1.0], '#1e293b', { scene, stroke: '#0f172a' });
        C3D.drawTag(g, P, [-1.2, 0, 1.0], 'Inert\nAnode', '#334155', 0, { scene });
        // DC power supply box
        C3D.drawBox(g, P, [0, -1.5, 1.5], [0.8, 0.4, 0.5], '#1e40af', { scene, stroke: '#1e3a8a' });
        C3D.drawTag(g, P, [0, -1.5, 2.2], 'DC Power\nSupply', '#1e40af', 0, { scene });
        // Wires
        C3D.drawPipe(g, P, [-1.2, 0, 0.7], [-0.3, -1.5, 1.5], 0.02, '#dc2626', { scene });
        C3D.drawPipe(g, P, [0.1, 0, 0.7], [0.3, -1.5, 1.5], 0.02, '#2563eb', { scene });
      }

      // ── Corrosion indicator (rust particles floating) ──
      if (mode === 'Unprotected' && step >= 2) {
        for (let i = 0; i < 6; i++) {
          const age = (t * 0.3 + i * 0.17) % 1;
          const rx = 0.3 * Math.sin(i * 2.1);
          const ry = 0.15 + age * 0.5;
          const rz = -0.2 + age * 0.8;
          C3D.drawAtom(g, P, [rx, ry, rz], 3, '#dc2626', '', '', 0.5 * (1 - age));
        }
      }

      // ── Readout ──
      C3D.drawCallout(g, P, [1.8, 0, 1.5],
        mode + '\nCorrosion: ' + (vs.effectiveRate || 0).toFixed(3) + ' mg/cm²·h',
        { scene, color: mode === 'Unprotected' ? '#dc2626' : '#15803d', bg: mode === 'Unprotected' ? '#fef2f2' : '#dcfce7' });

      const renderTitle = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Corrosion and Cathodic Protection', 500, 32);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#b91c1c';
        ctx.fillText('Unit 3 · Corrosion and Its Control', 500, 52);
        ctx.restore();
      };
      scene.add(-999, renderTitle);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 5: Bomb Calorimeter — 3D Scene
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-bomb-calorimeter'] = {
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 140, 14);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const t = st.t || 0;

      C3D.drawGroundGrid(g, P, 5, 1, -1.5, 'rgba(148, 163, 184, 0.2)');
      drawLabBench(g, P, scene, [0, 0, -1.5], 5, 3, 1.5);
      const benchTop = 0;

      // ── Outer calorimeter vessel (insulation jacket) ──
      C3D.drawCylinder(g, P, [0, 0, benchTop], 1.5, 2.5, '#94a3b8', { scene, alpha: 0.3, topCap: false, bottomCap: true });
      C3D.drawTag(g, P, [0, -1.8, benchTop + 1.5], 'Insulation\nJacket', '#475569', 0, { scene });

      // ── Water bucket inside ──
      C3D.drawCylinder(g, P, [0, 0, benchTop + 0.1], 1.2, 2.2, '#e0f2fe', { scene, alpha: 0.35, topCap: false, bottomCap: true });
      // Water
      const waterColor = step >= 3 ? '#f97316' : '#38bdf8'; // tints warm after combustion
      C3D.drawCylinder(g, P, [0, 0, benchTop + 0.15], 1.15, 1.8, waterColor, { scene, alpha: 0.45, topCap: true, bottomCap: true });

      // ── Bomb vessel (central cylinder — sturdy metal) ──
      C3D.drawCylinder(g, P, [0, 0, benchTop + 0.3], 0.5, 1.5, '#475569', { scene, topCap: true, bottomCap: true, segments: 16 });
      // Bomb lid
      C3D.drawCylinder(g, P, [0, 0, benchTop + 1.8], 0.55, 0.12, '#334155', { scene, topCap: true, bottomCap: true, segments: 16 });

      // ── Crucible with sample inside bomb ──
      if (step <= 1) {
        C3D.drawCylinder(g, P, [0, 0, benchTop + 0.5], 0.15, 0.2, '#a16207', { scene, topCap: false, bottomCap: true });
        // Sample pellet
        C3D.drawSphere(g, P, [0, 0, benchTop + 0.65], 0.08, '#1e293b', { scene });
      }

      // ── Ignition wires ──
      C3D.drawPipe(g, P, [-0.2, 0, benchTop + 1.9], [-0.2, 0, benchTop + 2.8], 0.015, '#dc2626', { scene });
      C3D.drawPipe(g, P, [0.2, 0, benchTop + 1.9], [0.2, 0, benchTop + 2.8], 0.015, '#1e40af', { scene });

      // ── Thermometer ──
      C3D.drawCylinder(g, P, [0.8, 0, benchTop + 0.5], 0.03, 2.5, '#ef4444', { scene, topCap: true, bottomCap: true });
      // Thermometer bulb
      C3D.drawSphere(g, P, [0.8, 0, benchTop + 0.5], 0.06, '#ef4444', { scene });
      // Temperature reading
      const baseTemp = 25;
      const currentTemp = baseTemp + (step >= 3 ? (vs.dT || 2.8) : 0);
      C3D.drawCallout(g, P, [0.8, 0, benchTop + 3.2],
        currentTemp.toFixed(1) + ' °C',
        { scene, color: step >= 3 ? '#dc2626' : '#1e40af', bg: step >= 3 ? '#fef2f2' : '#dbeafe' });

      // ── Stirrer motor ──
      C3D.drawCylinder(g, P, [-0.7, 0, benchTop + 2.0], 0.12, 0.5, '#475569', { scene, topCap: true, bottomCap: true });
      C3D.drawCylinder(g, P, [-0.7, 0, benchTop + 0.5], 0.02, 1.5, '#64748b', { scene, topCap: true, bottomCap: true });

      // ── Combustion glow (step 3) ──
      if (step === 3) {
        const glow = (ctx) => {
          ctx.save();
          const c = P([0, 0, benchTop + 0.7]);
          const gr = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 30 * c.k);
          gr.addColorStop(0, 'rgba(251, 146, 60, 0.6)');
          gr.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)');
          gr.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 30 * c.k, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };
        scene.add(-2, glow);
      }

      // ── Result callout ──
      if (step >= 4 && vs.HCV) {
        C3D.drawCallout(g, P, [-1.8, 0, benchTop + 2.5],
          'HCV = ' + vs.HCV.toFixed(2) + ' kJ/g\n(' + vs.HCV_kJ_kg.toFixed(0) + ' kJ/kg)',
          { scene, color: '#0f766e', bg: '#ccfbf1' });
      }

      const renderTitle = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bomb Calorimeter — Calorific Value', 500, 32);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#dc2626';
        ctx.fillText('Unit 4 · Fuels and Combustion', 500, 52);
        ctx.restore();
      };
      scene.add(-999, renderTitle);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 6: Polymer Processing — Industrial-Grade 3D Machines
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-polymer-processing'] = {
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 95, 16);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const t = st.t || 0;
      const mode = vs.mode || 'Injection Moulding';
      const isCutaway = vs.cutaway !== false;
      const mat = vs.material || (mode === 'Compression Moulding' ? 'Bakelite' : 'Polypropylene (PP)');
      const temp = vs.temp || (mode === 'Compression Moulding' ? 165 : 230);
      const pressure = vs.pressure || 110;
      const rpm = vs.rpm || 75;

      // Normalized progress in current step [0, 1]
      const dur = st.dur || 4.5;
      const stepProg = Math.min(1, Math.max(0, (st.st != null ? st.st / dur : 1)));

      // Ground plane grid
      C3D.drawGroundGrid(g, P, 6.5, 1, -2.1, 'rgba(148, 163, 184, 0.22)');

      // Material color mapping
      let polymerColor = '#38bdf8'; // PP default
      let moltenColor = '#f59e0b';
      if (mat.includes('ABS')) { polymerColor = '#f59e0b'; moltenColor = '#ea580c'; }
      else if (mat.includes('Nylon')) { polymerColor = '#a855f7'; moltenColor = '#c026d3'; }
      else if (mat.includes('HDPE')) { polymerColor = '#22c55e'; moltenColor = '#16a34a'; }
      else if (mat.includes('PVC')) { polymerColor = '#06b6d4'; moltenColor = '#0891b2'; }
      else if (mat.includes('Bakelite') || mode === 'Compression Moulding') { polymerColor = '#451a03'; moltenColor = '#b45309'; }

      // Component drawing helpers
      const drawMachineBed = (center, size, color) => {
        C3D.drawBox(g, P, center, size, color || '#1e293b', { scene, stroke: '#0f172a' });
        const [cx, cy, cz] = center;
        const [w, d, h] = size;
        const feet = [
          [cx - w * 0.44, cy - d * 0.38, cz - h * 0.5 - 0.08],
          [cx + w * 0.44, cy - d * 0.38, cz - h * 0.5 - 0.08],
          [cx - w * 0.44, cy + d * 0.38, cz - h * 0.5 - 0.08],
          [cx + w * 0.44, cy + d * 0.38, cz - h * 0.5 - 0.08]
        ];
        feet.forEach(f => {
          C3D.drawCylinder(g, P, f, 0.18, 0.08, '#475569', { scene, topCap: true, bottomCap: true, stroke: '#334155' });
        });
        // Guide rails along bed top
        C3D.drawBox(g, P, [cx, cy - d * 0.28, cz + h * 0.5 + 0.04], [w * 0.95, 0.12, 0.08], '#94a3b8', { scene, stroke: '#64748b' });
        C3D.drawBox(g, P, [cx, cy + d * 0.28, cz + h * 0.5 + 0.04], [w * 0.95, 0.12, 0.08], '#94a3b8', { scene, stroke: '#64748b' });
      };

      const drawTieBars = (x1, x2, yOffsets, zOffsets, radius, color) => {
        const len = x2 - x1;
        yOffsets.forEach(y => {
          zOffsets.forEach(z => {
            C3D.drawCylinder(g, P, [x1, y, z], radius, len, color || '#cbd5e1', {
              scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#94a3b8'
            });
            // End clamping nuts
            C3D.drawCylinder(g, P, [x1 - 0.08, y, z], radius * 1.5, 0.08, '#64748b', { scene, axis: 'x', topCap: true, bottomCap: true });
            C3D.drawCylinder(g, P, [x2, y, z], radius * 1.5, 0.08, '#64748b', { scene, axis: 'x', topCap: true, bottomCap: true });
          });
        });
      };

      const drawHelicalScrew = (startPt, length, rCore, rFlight, turns, rotAngle, color, options = {}) => {
        C3D.drawCylinder(g, P, startPt, rCore, length, options.shaftColor || '#64748b', {
          scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#334155'
        });
        const isRightFacing = options.direction === 'right';
        const tipX = isRightFacing ? (startPt[0] + length) : (startPt[0] - 0.28);
        C3D.drawCylinder(g, P, [tipX, startPt[1], startPt[2]], 0.05, 0.28, '#94a3b8', {
          scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#475569'
        });
        const numSteps = options.segments || (turns * 8);
        for (let i = 0; i < numSteps; i++) {
          const frac1 = i / numSteps;
          const frac2 = (i + 1) / numSteps;
          const x1 = startPt[0] + frac1 * length;
          const x2 = startPt[0] + frac2 * length;
          const th1 = frac1 * Math.PI * 2 * turns + rotAngle;
          const th2 = frac2 * Math.PI * 2 * turns + rotAngle;

          const p1 = [x1, startPt[1] + rCore * Math.cos(th1), startPt[2] + rCore * Math.sin(th1)];
          const p2 = [x2, startPt[1] + rCore * Math.cos(th2), startPt[2] + rCore * Math.sin(th2)];
          const p3 = [x2, startPt[1] + rFlight * Math.cos(th2), startPt[2] + rFlight * Math.sin(th2)];
          const p4 = [x1, startPt[1] + rFlight * Math.cos(th1), startPt[2] + rFlight * Math.sin(th1)];

          const q1 = P(p1), q2 = P(p2), q3 = P(p3), q4 = P(p4);
          if (q1.clipped || q2.clipped || q3.clipped || q4.clipped) continue;

          const avgDepth = (q1.depth + q2.depth + q3.depth + q4.depth) / 4;
          const midAngle = (th1 + th2) / 2;
          const norm = [0, Math.cos(midAngle), Math.sin(midAngle)];
          const col = C3D.calcDiffuse(norm, color || '#cbd5e1', 0.45, 0.55);

          scene.add(avgDepth, (ctx) => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(q1.x, q1.y);
            ctx.lineTo(q2.x, q2.y);
            ctx.lineTo(q3.x, q3.y);
            ctx.lineTo(q4.x, q4.y);
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();
          });
        }
      };

      const drawHopper = (center, rTop, rBottom, height, isCut, pColor, count = 12) => {
        const [cx, cy, cz] = center;
        C3D.drawCylinder(g, P, [cx, cy, cz], rBottom, height, '#94a3b8', {
          scene, alpha: isCut ? 0.35 : 0.88, topCap: true, bottomCap: true, stroke: '#64748b'
        });
        C3D.drawCylinder(g, P, [cx, cy, cz + height], rTop, 0.08, '#475569', { scene, topCap: true, bottomCap: true });
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2 * 1.618;
          const rDist = (rBottom * 0.6) * Math.sqrt((i + 1) / count);
          const px = cx + rDist * Math.cos(ang);
          const py = cy + rDist * Math.sin(ang);
          const pz = cz + 0.15 + (i / count) * (height * 0.7);
          C3D.drawSphere(g, P, [px, py, pz], 0.07, pColor, { scene });
        }
      };

      // ─────────────────────────────────────────────────────────────────
      // MODE A: INJECTION MOULDING MACHINE
      // ─────────────────────────────────────────────────────────────────
      if (mode === 'Injection Moulding') {
        // 1. Heavy machine bed foundation
        drawMachineBed([0, 0, -1.7], [9.2, 2.2, 0.6], '#1e293b');

        // 2. Clamping Unit (Left)
        // Rear cylinder platen at x = -4.0
        C3D.drawBox(g, P, [-4.0, 0, -0.1], [0.55, 2.1, 2.3], '#334155', { scene, stroke: '#1e293b' });
        // Clamp hydraulic cylinder at x = -4.8 to -4.0
        C3D.drawCylinder(g, P, [-4.8, 0, -0.1], 0.38, 0.8, '#1e293b', { scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#0f172a' });

        // Four chrome tie bars
        drawTieBars(-4.0, 0.3, [-0.65, 0.65], [-0.75, 0.75], 0.08, '#cbd5e1');

        // Fixed platen anchored to bed at x = 0.3
        C3D.drawBox(g, P, [0.3, 0, -0.1], [0.55, 2.1, 2.3], '#334155', { scene, stroke: '#1e293b' });
        C3D.drawCallout(g, P, [0.3, 0.8, 1.1], 'Fixed Platen', { sub: 'Anchored Clamping Face', color: '#0284c7' });

        // Moving platen position interpolation
        // Step 0-3: open (x = -2.5)
        // Step 4: closing (-2.5 -> -0.9)
        // Step 5-7: closed (-0.9)
        // Step 8: opening (-0.9 -> -2.5)
        // Step 9-10: open (-2.5)
        let movX = -2.5;
        if (step === 3) { // Shot metering
          movX = -2.5;
        } else if (step === 4) { // Mould closing
          movX = -2.5 + 1.6 * stepProg;
        } else if (step >= 5 && step <= 7) { // Injected, packed, cooling
          movX = -0.9;
        } else if (step === 8) { // Mould opening
          movX = -0.9 - 1.6 * stepProg;
        } else if (step >= 9) { // Ejection & inspect
          movX = -2.5;
        }
        C3D.drawBox(g, P, [movX, 0, -0.1], [0.55, 2.1, 2.3], '#475569', { scene, stroke: '#334155' });
        C3D.drawCallout(g, P, [movX, -0.8, 1.1], 'Moving Platen', { sub: 'Hydraulic Clamp Stroke', color: '#38bdf8' });

        // Mould halves:
        // Parting plane is at x = -0.35
        // Stationary mould half: bolted to fixed platen (x = 0.3 to -0.35)
        C3D.drawBox(g, P, [-0.02, 0, -0.1], [0.65, 1.5, 1.5], '#334155', { scene, stroke: '#1e293b' });
        // Moving mould half: bolted to moving platen face (movX + 0.28 to movX + 0.83)
        const movMouldCenterX = movX + 0.55;
        C3D.drawBox(g, P, [movMouldCenterX, 0, -0.1], [0.55, 1.5, 1.5], '#334155', { scene, stroke: '#1e293b' });

        // Mould Cavity & Melt Animation
        const cavityX = -0.35;
        const isMouldClosed = Math.abs(movX - (-0.9)) < 0.15;

        // Sprue passage & cavity in stationary half
        if (isCutaway) {
          // Sprue bush cylinder
          C3D.drawCylinder(g, P, [-0.35, 0, -0.1], 0.08, 0.65, '#0f172a', { scene, axis: 'x', topCap: true, bottomCap: true });
          // Cavity recess in mould face
          C3D.drawBox(g, P, [-0.35, 0, -0.1], [0.22, 0.75, 0.75], '#0f172a', { scene });
        }

        // Progressive melt injection & cavity fill
        if (step >= 5) {
          let fillFrac = 1.0;
          if (step === 5) fillFrac = stepProg; // progressive fill during injection
          let activeMeltCol = moltenColor;
          if (step === 7) { // Cooling
            activeMeltCol = polymerColor;
          } else if (step >= 8) {
            activeMeltCol = polymerColor;
          }

          if (fillFrac > 0.05) {
            // Sprue melt
            C3D.drawCylinder(g, P, [-0.35, 0, -0.1], 0.06, 0.65 * Math.min(1, fillFrac * 2), activeMeltCol, {
              scene, axis: 'x', topCap: true, bottomCap: true
            });
            // Cavity fill
            if (fillFrac > 0.3) {
              const cavProg = Math.min(1, (fillFrac - 0.3) / 0.7);
              const partPosX = (step >= 8) ? (movMouldCenterX + 0.28) : cavityX;
              C3D.drawBox(g, P, [partPosX, 0, -0.1], [0.18 * cavProg, 0.68 * cavProg, 0.68 * cavProg], activeMeltCol, {
                scene, stroke: C3D.shadeColor(activeMeltCol, -0.3)
              });
              if (step >= 7 && step <= 9) {
                C3D.drawCallout(g, P, [partPosX, 0, 0.5], 'Moulded Part', { sub: 'Solidified Flanged Cup', color: '#22c55e' });
              }
            }
          }
        }

        // Ejector pins motion in Step 9
        if (step === 9) {
          const pinStroke = 0.35 * stepProg;
          C3D.drawCylinder(g, P, [movMouldCenterX + 0.28, -0.2, -0.1], 0.03, pinStroke, '#cbd5e1', { scene, axis: 'x', topCap: true, bottomCap: true });
          C3D.drawCylinder(g, P, [movMouldCenterX + 0.28, 0.2, -0.1], 0.03, pinStroke, '#cbd5e1', { scene, axis: 'x', topCap: true, bottomCap: true });
          C3D.drawCallout(g, P, [movMouldCenterX + 0.28 + pinStroke, 0, -0.5], 'Ejector Pins Advance', { sub: 'Knockout Ejection Stroke', color: '#eab308' });
        }

        // Inspection of finished part in Step 10
        if (step >= 10) {
          C3D.drawBox(g, P, [1.5, 0, 1.2], [0.3, 0.7, 0.7], polymerColor, { scene, stroke: '#1e293b' });
          C3D.drawCallout(g, P, [1.5, 0, 1.8], 'Finished Product', { sub: 'Zero-Defect Net Shape', color: '#10b981' });
        }

        // 3. Injection Unit (Right)
        // Barrel & Nozzle
        const nozzleTipX = 0.3;
        C3D.drawCylinder(g, P, [nozzleTipX, 0, -0.1], 0.14, 0.5, '#475569', { scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#334155' });
        C3D.drawCallout(g, P, [0.6, 0.4, 0.4], 'Injection Nozzle', { sub: 'Seated against Sprue Bush', color: '#0284c7' });

        // Heated Barrel (x = 0.8 to 3.7)
        const barrelLen = 2.9;
        if (isCutaway) {
          C3D.drawCylinder(g, P, [0.8, 0, -0.1], 0.42, barrelLen, '#475569', {
            scene, axis: 'x', topCap: true, bottomCap: true, alpha: 0.35, stroke: '#334155'
          });
        } else {
          C3D.drawCylinder(g, P, [0.8, 0, -0.1], 0.42, barrelLen, '#64748b', {
            scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#334155'
          });
        }

        // Ceramic heater bands
        const heaterX = [1.2, 1.8, 2.4, 3.0];
        heaterX.forEach((hx) => {
          C3D.drawCylinder(g, P, [hx, 0, -0.1], 0.46, 0.22, '#ef4444', {
            scene, axis: 'x', alpha: 0.85, topCap: true, bottomCap: true, stroke: '#b91c1c'
          });
        });
        C3D.drawCallout(g, P, [2.1, 0, -0.8], 'Heater Bands (3 Zones)', { sub: temp + ' °C PID Controlled', color: '#ef4444' });

        // Reciprocating Helical Screw
        let screwX = 0.8;
        let screwAngle = (t * 6);
        if (step === 2) { // Plasticising
          screwAngle = t * 8;
          screwX = 0.8;
        } else if (step === 3) { // Shot metering
          screwAngle = t * 8;
          screwX = 0.8 + 0.6 * stepProg;
        } else if (step === 4) { // Clamping
          screwAngle = 0;
          screwX = 1.4;
        } else if (step === 5) { // Injection ram
          screwAngle = 0;
          screwX = 1.4 - 0.6 * stepProg;
        } else {
          screwX = 0.8;
        }

        if (isCutaway) {
          drawHelicalScrew([screwX, 0, -0.1], 2.6, 0.16, 0.36, 8, screwAngle, '#cbd5e1');
          // Melt pool ahead of screw tip in Step 3 & 4
          if (step === 3 || step === 4) {
            const poolLen = screwX - 0.8;
            if (poolLen > 0.05) {
              C3D.drawCylinder(g, P, [0.8, 0, -0.1], 0.36, poolLen, moltenColor, {
                scene, axis: 'x', alpha: 0.85, topCap: true, bottomCap: true
              });
              C3D.drawCallout(g, P, [0.8 + poolLen / 2, 0, 0.5], 'Accumulated Shot Melt', { sub: 'Measured Volumetric Shot', color: '#f59e0b' });
            }
          }
        }

        // Drive motor & injection cylinder at rear (x = 3.7 to 4.6)
        C3D.drawCylinder(g, P, [3.7, 0, -0.1], 0.38, 0.9, '#334155', { scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#1e293b' });
        C3D.drawCallout(g, P, [4.2, 0, 0.7], 'Hydraulic Injection Cylinder', { sub: 'Axial Screw Drive', color: '#475569' });

        // Feed Hopper
        drawHopper([3.3, 0, 0.6], 0.55, 0.38, 1.3, isCutaway, polymerColor, 14);
        C3D.drawCallout(g, P, [3.3, 0, 2.1], 'Feed Hopper', { sub: mat.split(' ')[0] + ' Pellets', color: '#f59e0b' });

      } else if (mode === 'Extrusion Moulding') {
        // ─────────────────────────────────────────────────────────────────
        // MODE B: CONTINUOUS EXTRUDER LINE
        // ─────────────────────────────────────────────────────────────────
        drawMachineBed([0, 0, -1.7], [9.2, 2.2, 0.6], '#1e293b');

        // 1. Extruder Gear Motor & Thrust Bearing Housing
        C3D.drawBox(g, P, [-3.8, 0, -0.1], [1.1, 1.8, 1.8], '#334155', { scene, stroke: '#1e293b' });
        C3D.drawCallout(g, P, [-3.8, 0, 1.0], 'AC Motor & Thrust Gearbox', { sub: rpm + ' RPM · Heavy Bearing', color: '#475569' });

        // 2. Feed Section & Conical Hopper
        drawHopper([-3.0, 0, 0.6], 0.55, 0.38, 1.3, isCutaway, polymerColor, 14);
        C3D.drawCallout(g, P, [-3.0, 0, 2.1], 'Water-Cooled Feed Hopper', { sub: 'Gravity Pellet Throat', color: '#f59e0b' });

        // 3. Heated Extrusion Barrel & Screw
        const barrelStart = -3.0;
        const barrelLen = 2.6;
        if (isCutaway) {
          C3D.drawCylinder(g, P, [barrelStart, 0, -0.1], 0.42, barrelLen, '#475569', {
            scene, axis: 'x', topCap: true, bottomCap: true, alpha: 0.35, stroke: '#334155'
          });
          drawHelicalScrew([barrelStart, 0, -0.1], barrelLen, 0.16, 0.35, 9, (t * 5), '#cbd5e1', { direction: 'right' });
        } else {
          C3D.drawCylinder(g, P, [barrelStart, 0, -0.1], 0.42, barrelLen, '#64748b', {
            scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#334155'
          });
        }

        // Heater bands
        const exHeaters = [-2.5, -1.9, -1.3, -0.7];
        exHeaters.forEach((hx) => {
          C3D.drawCylinder(g, P, [hx, 0, -0.1], 0.46, 0.22, '#ef4444', {
            scene, axis: 'x', alpha: 0.85, topCap: true, bottomCap: true, stroke: '#b91c1c'
          });
        });
        C3D.drawCallout(g, P, [-1.6, 0, -0.8], 'Heater Bands', { sub: temp + ' °C Feed/Compression/Metering', color: '#ef4444' });

        // 4. Breaker plate & Annular Pipe Die
        C3D.drawCylinder(g, P, [-0.4, 0, -0.1], 0.44, 0.2, '#334155', { scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#1e293b' });
        C3D.drawCylinder(g, P, [-0.2, 0, -0.1], 0.36, 0.4, '#1e293b', { scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#0f172a' });
        // Central torpedo mandrel core
        C3D.drawCylinder(g, P, [0.15, 0, -0.1], 0.20, 0.08, '#475569', { scene, axis: 'x', topCap: true, bottomCap: true });
        C3D.drawCallout(g, P, [0.0, 0, 0.7], 'Annular Pipe Die Head', { sub: 'Outer Ring & Torpedo Mandrel', color: '#0284c7' });

        // 5. Emerging continuous hollow pipe profile
        const pipeStart = 0.2;
        const pipeEnd = step >= 5 ? 4.4 : (0.2 + step * 0.7);
        const pipeLen = Math.max(0.1, pipeEnd - pipeStart);
        C3D.drawCylinder(g, P, [pipeStart, 0, -0.1], 0.26, pipeLen, polymerColor, {
          scene, axis: 'x', topCap: true, bottomCap: true, stroke: C3D.shadeColor(polymerColor, -0.3)
        });
        // Hollow inner bore
        C3D.drawCylinder(g, P, [pipeEnd - 0.02, 0, -0.1], 0.20, 0.04, '#0f172a', { scene, axis: 'x', topCap: true, bottomCap: true });

        // 6. Vacuum Calibration & Cooling Spray Tank
        C3D.drawBox(g, P, [1.1, 0, -0.1], [1.5, 1.3, 1.1], '#0284c7', { scene, alpha: 0.35, stroke: '#0369a1' });
        C3D.drawCallout(g, P, [1.1, 0, 0.8], 'Vacuum Cooling Tank', { sub: 'Sizing Calibrator & Spray Jets', color: '#0284c7' });
        // Water spray droplets
        for (let i = 0; i < 6; i++) {
          const sprayX = 0.6 + i * 0.18;
          const sprayZ = 0.35 - ((t * 3 + i * 0.2) % 0.4);
          C3D.drawDroplet(g, P, [sprayX, -0.15, sprayZ], 0.04, '#38bdf8');
          C3D.drawDroplet(g, P, [sprayX, 0.15, sprayZ], 0.04, '#38bdf8');
        }

        // 7. Caterpillar Haul-Off Unit
        C3D.drawBox(g, P, [2.7, 0, -0.1], [1.0, 1.4, 1.4], '#475569', { scene, stroke: '#334155' });
        // Top and bottom crawler belts
        C3D.drawBox(g, P, [2.7, 0, 0.32], [0.8, 0.35, 0.18], '#1e293b', { scene, stroke: '#0f172a' });
        C3D.drawBox(g, P, [2.7, 0, -0.52], [0.8, 0.35, 0.18], '#1e293b', { scene, stroke: '#0f172a' });
        C3D.drawCallout(g, P, [2.7, 0, 1.0], 'Haul-Off Caterpillar', { sub: 'Synchronized Pulling Belts', color: '#38bdf8' });

        // 8. Flying Planetary Pipe Cutter
        if (step >= 7) {
          const sawZ = (step === 7) ? (-0.1 + Math.sin(t * 10) * 0.1) : 0.4;
          C3D.drawBox(g, P, [3.8, 0, sawZ], [0.4, 0.5, 0.5], '#ef4444', { scene, stroke: '#b91c1c' });
          C3D.drawCallout(g, P, [3.8, 0, sawZ + 0.5], 'Traveling Cutter', { sub: 'Standardized Pipe Lengths', color: '#ef4444' });
        }

      } else {
        // ─────────────────────────────────────────────────────────────────
        // MODE C: VERTICAL COMPRESSION MOULDING PRESS
        // ─────────────────────────────────────────────────────────────────
        // 1. Heavy Base Platen Foundation
        C3D.drawBox(g, P, [0, 0, -1.55], [2.6, 2.2, 0.5], '#1e293b', { scene, stroke: '#0f172a' });

        // 2. Four Chrome Guide Tie Columns
        const colX = [-0.95, 0.95];
        const colY = [-0.75, 0.75];
        colX.forEach(cx => {
          colY.forEach(cy => {
            C3D.drawCylinder(g, P, [cx, cy, -1.3], 0.10, 3.6, '#cbd5e1', { scene, topCap: true, bottomCap: true, stroke: '#94a3b8' });
          });
        });

        // 3. Top Press Crown / Cylinder Head
        C3D.drawBox(g, P, [0, 0, 2.1], [2.6, 2.2, 0.6], '#334155', { scene, stroke: '#1e293b' });
        // Top hydraulic cylinder
        C3D.drawCylinder(g, P, [0, 0, 1.3], 0.38, 0.8, '#1e293b', { scene, topCap: true, bottomCap: true, stroke: '#0f172a' });
        C3D.drawCallout(g, P, [0, 0, 2.6], 'Top Crown & Hydraulic Cylinder', { sub: 'Main Ram Tonnage Drive', color: '#475569' });

        // 4. Upper Moving Platen & Male Mould Punch
        // Stroke: Open at z = 0.85, Closed at z = -0.55
        let ramZ = 0.85;
        if (step === 1) { // Closing
          ramZ = 0.85 - 1.4 * stepProg;
        } else if (step >= 2 && step <= 4) { // Compress, Cure, Hold
          ramZ = -0.55;
        } else if (step === 5) { // Opening
          ramZ = -0.55 + 1.4 * stepProg;
        } else if (step >= 6) { // Eject & Inspect
          ramZ = 0.85;
        }

        // Upper moving platen
        C3D.drawBox(g, P, [0, 0, ramZ], [2.2, 1.8, 0.4], '#475569', { scene, stroke: '#334155' });
        // Male mould punch
        C3D.drawBox(g, P, [0, 0, ramZ - 0.28], [1.2, 0.9, 0.28], '#1e293b', { scene, stroke: '#0f172a' });
        C3D.drawCallout(g, P, [0, -1.0, ramZ + 0.3], 'Upper Heated Platen & Punch', { sub: 'Core Tooling · 165 °C', color: '#0284c7' });

        // 5. Lower Heated Platen & Female Cavity
        // Lower platen
        C3D.drawBox(g, P, [0, 0, -1.1], [2.2, 1.8, 0.4], '#475569', { scene, stroke: '#334155' });
        // Lower mould block
        C3D.drawBox(g, P, [0, 0, -0.7], [1.6, 1.3, 0.4], '#334155', { scene, stroke: '#1e293b' });
        // Cavity recess
        C3D.drawBox(g, P, [0, 0, -0.66], [1.22, 0.92, 0.24], '#0f172a', { scene });
        C3D.drawCallout(g, P, [0, -1.0, -0.7], 'Lower Mould Cavity', { sub: 'Matched Shear Edge Die', color: '#0284c7' });

        // 6. Thermosetting Polymer Charge & Cured Part
        if (step === 0) { // Initial charge loading
          C3D.drawBox(g, P, [0, 0, -0.6], [0.65, 0.5, 0.22], moltenColor, { scene, stroke: '#b45309' });
          C3D.drawCallout(g, P, [0, 0, 0], 'Weighed Preform Charge', { sub: mat.split(' ')[0] + ' Tablet', color: '#f59e0b' });
        } else if (step === 1) { // Closing
          C3D.drawBox(g, P, [0, 0, -0.6], [0.65, 0.5, 0.22], moltenColor, { scene, stroke: '#b45309' });
        } else if (step >= 2 && step <= 4) { // Compressed & Curing
          let curCol = moltenColor;
          if (step >= 3) curCol = polymerColor; // irreversible polycondensation darkening
          C3D.drawBox(g, P, [0, 0, -0.65], [1.2, 0.9, 0.18], curCol, { scene, stroke: '#1e293b' });
          if (step === 3) {
            C3D.drawCallout(g, P, [0, 0, 0.2], 'Polycondensation Cross-Linking', { sub: 'Irreversible 3D Network', color: '#ef4444' });
          }
        } else if (step >= 5) { // Open and eject
          let partZ = -0.65;
          if (step === 6) { // Knockout ejection
            partZ = -0.65 + 0.35 * stepProg;
            // Ejector pins lifting part
            C3D.drawCylinder(g, P, [-0.3, 0, -1.1], 0.04, 0.45 + 0.35 * stepProg, '#cbd5e1', { scene, topCap: true, bottomCap: true });
            C3D.drawCylinder(g, P, [0.3, 0, -1.1], 0.04, 0.45 + 0.35 * stepProg, '#cbd5e1', { scene, topCap: true, bottomCap: true });
            C3D.drawCallout(g, P, [0, 0, partZ + 0.3], 'Hydraulic Knockout Pins', { sub: 'Bottom Demoulding', color: '#eab308' });
          }
          C3D.drawBox(g, P, [0, 0, partZ], [1.2, 0.9, 0.18], polymerColor, { scene, stroke: '#0f172a' });
          if (step >= 7) {
            C3D.drawCallout(g, P, [0, 0, partZ + 0.4], 'Cured Thermoset Product', { sub: 'Infusible Bakelite Housing', color: '#10b981' });
          }
        }
      }

      // Header Title Overlay
      const renderTitle = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Polymer Processing — ' + mode, 500, 32);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('Unit 5 · Polymers and Processing · Industrial 3D Simulator', 500, 52);
        ctx.restore();
      };
      scene.add(-999, renderTitle);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 7: Thermoplastic vs Thermosetting — 3D Scene
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-thermo-comparison'] = {
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 145, 14);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const T = vs.T || 25;
      const Tg = vs.Tg || 100;
      const Tm = vs.Tm || 180;
      const Tdegrade = vs.Tdegrade || 280;

      C3D.drawGroundGrid(g, P, 5, 1, -1.5, 'rgba(148, 163, 184, 0.2)');
      drawLabBench(g, P, scene, [0, 0, -1.5], 5, 3, 1.5);
      const benchTop = 0;

      // ── Heating plate ──
      C3D.drawBox(g, P, [0, 0, benchTop], [3.0, 1.8, 0.2], '#475569', { scene, stroke: '#334155' });
      // Heating indicator (red glow as temp increases)
      const heatFrac = Math.min(1, Math.max(0, (T - 25) / 300));
      if (heatFrac > 0.05) {
        C3D.drawBox(g, P, [0, 0, benchTop + 0.21], [2.8, 1.6, 0.02], '#ef4444', { scene, alpha: heatFrac * 0.4 });
      }

      // Temperature display
      C3D.drawBox(g, P, [0, -1.2, benchTop + 0.4], [1.0, 0.3, 0.4], '#1e293b', { scene, stroke: '#0f172a' });
      C3D.drawCallout(g, P, [0, -1.2, benchTop + 1.0], T + ' °C', { scene, color: T > Tm ? '#dc2626' : '#0f766e', bg: T > Tm ? '#fef2f2' : '#f0fdf4' });
      C3D.drawTag(g, P, [0, -1.5, benchTop - 0.3], 'Heating Plate', '#475569', 0, { scene });

      // ── Thermoplastic specimen (left) ──
      const tpDeform = T > Tm ? 0.4 : T > Tg ? 0.15 : 0;
      const tpHeight = Math.max(0.3, 0.8 - tpDeform);
      const tpWidth = 0.6 + tpDeform * 0.5;
      const tpColor = T > Tm ? '#fb923c' : T > Tg ? '#fbbf24' : '#3b82f6';
      C3D.drawBox(g, P, [-0.9, 0, benchTop + 0.22], [tpWidth, 0.6, tpHeight], tpColor, { scene, stroke: '#1e3a8a' });
      C3D.drawTag(g, P, [-0.9, 0, benchTop + tpHeight + 0.4], 'Thermoplastic\n(PE / PP)', '#1e40af', 0, { scene });
      // State label
      const tpState = vs.tpState || 'Rigid / Glassy';
      C3D.drawCallout(g, P, [-0.9, 1.2, benchTop + 1.0], tpState, { scene, color: '#1e40af', bg: '#dbeafe' });

      // ── Thermosetting specimen (right) ──
      const tsColor = T >= Tdegrade ? '#44403c' : '#92400e';
      const tsAlpha = T >= Tdegrade ? 0.7 : 1.0;
      C3D.drawBox(g, P, [0.9, 0, benchTop + 0.22], [0.6, 0.6, 0.8], tsColor, { scene, alpha: tsAlpha, stroke: '#78350f' });
      C3D.drawTag(g, P, [0.9, 0, benchTop + 1.2], 'Thermoset\n(Bakelite)', '#78350f', 0, { scene });
      const tsState = vs.tsState || 'Rigid / Cross-linked';
      C3D.drawCallout(g, P, [0.9, 1.2, benchTop + 1.0], tsState, { scene, color: '#78350f', bg: '#fef3c7' });

      // ── Smoke/char for thermoset degradation ──
      if (T >= Tdegrade) {
        for (let i = 0; i < 4; i++) {
          const st2 = (st.t * 0.5 + i * 0.25) % 1;
          const smokePos = [0.9 + 0.2 * Math.sin(i), 0, benchTop + 1.0 + st2 * 1.5];
          C3D.drawAtom(g, P, smokePos, 5 + st2 * 8, '#78716c', '', '', 0.3 * (1 - st2));
        }
      }

      const renderTitle = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Thermoplastic vs Thermosetting Polymers', 500, 32);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('Unit 5 · Polymers and Processing', 500, 52);
        ctx.restore();
      };
      scene.add(-999, renderTitle);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 8: Municipal Water Treatment Plant — 3D Scene
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-water-treatment-plant'] = {
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 85, 18);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const t = st.t || 0;

      C3D.drawGroundGrid(g, P, 10, 1, -1, 'rgba(148, 163, 184, 0.15)');

      // ── 1. Intake / screening ──
      C3D.drawBox(g, P, [-7, 0, -1], [1.5, 2, 1.5], '#64748b', { scene, stroke: '#475569' });
      // Screen bars
      for (let i = -0.5; i <= 0.5; i += 0.25) {
        C3D.drawCylinder(g, P, [-7, i, -1], 0.02, 1.5, '#334155', { scene, topCap: true, bottomCap: true });
      }
      C3D.drawTag(g, P, [-7, 0, 0.8], 'Intake\n& Screen', '#334155', 0, { scene });

      // ── 2. Coagulation tank ──
      C3D.drawCylinder(g, P, [-4.5, 0, -1], 1.0, 2.0, '#cbd5e1', { scene, alpha: 0.35, topCap: false, bottomCap: true });
      // Alum + dirty water
      const flocColor = step >= 1 ? '#d4a574' : '#a3c4d4';
      C3D.drawCylinder(g, P, [-4.5, 0, -0.95], 0.9, 1.6, flocColor, { scene, alpha: 0.5, topCap: true, bottomCap: true });
      if (step >= 1) {
        C3D.drawPaddle(g, P, [-4.5, 0, -0.95 + 0.8], 1.0, 0.3, 0.06, t * 1.5, '#475569', { scene });
      }
      C3D.drawTag(g, P, [-4.5, 0, 1.2], 'Coagulation\n& Flocculation', '#92400e', 0, { scene });

      // ── 3. Sedimentation tank (large rectangular) ──
      C3D.drawBox(g, P, [-1.5, 0, -1], [3.0, 2.0, 1.8], '#cbd5e1', { scene, alpha: 0.25, stroke: '#94a3b8' });
      // Settled sludge at bottom
      if (step >= 2) {
        const sludgeH = 0.3 + (vs.coagEff || 0.5) * 0.4;
        C3D.drawBox(g, P, [-1.5, 0, -0.95], [2.8, 1.8, sludgeH], '#a16207', { scene, alpha: 0.5 });
        // Clear water above
        C3D.drawBox(g, P, [-1.5, 0, -0.95 + sludgeH], [2.8, 1.8, 1.3 - sludgeH], '#7dd3fc', { scene, alpha: 0.35 });
      } else {
        C3D.drawBox(g, P, [-1.5, 0, -0.95], [2.8, 1.8, 1.3], '#93c5fd', { scene, alpha: 0.4 });
      }
      C3D.drawTag(g, P, [-1.5, 0, 1.0], 'Sedimentation\nTank', '#475569', 0, { scene });

      // ── 4. Sand filter ──
      C3D.drawBox(g, P, [2.0, 0, -1], [1.5, 1.8, 2.0], '#cbd5e1', { scene, alpha: 0.3, stroke: '#94a3b8' });
      // Sand layers
      C3D.drawBox(g, P, [2.0, 0, -0.9], [1.3, 1.6, 0.5], '#fbbf24', { scene, alpha: 0.6 }); // sand
      C3D.drawBox(g, P, [2.0, 0, -0.4], [1.3, 1.6, 0.3], '#94a3b8', { scene, alpha: 0.5 }); // gravel
      // Water above sand
      C3D.drawBox(g, P, [2.0, 0, -0.1], [1.3, 1.6, 0.7], '#7dd3fc', { scene, alpha: 0.35 });
      C3D.drawTag(g, P, [2.0, 0, 1.2], 'Rapid Sand\nFilter', '#92400e', 0, { scene });

      // ── 5. Disinfection (chlorination) ──
      C3D.drawCylinder(g, P, [4.5, 0, -1], 0.8, 2.0, '#cbd5e1', { scene, alpha: 0.35, topCap: false, bottomCap: true });
      C3D.drawCylinder(g, P, [4.5, 0, -0.95], 0.7, 1.5, '#86efac', { scene, alpha: 0.45, topCap: true, bottomCap: true });
      C3D.drawTag(g, P, [4.5, 0, 1.2], 'Chlorination\n& Disinfection', '#15803d', 0, { scene });

      // ── 6. Clear water reservoir ──
      C3D.drawBox(g, P, [7, 0, -1], [2.0, 2.0, 1.5], '#64748b', { scene, alpha: 0.3, stroke: '#475569' });
      C3D.drawBox(g, P, [7, 0, -0.95], [1.8, 1.8, 1.2], '#38bdf8', { scene, alpha: 0.4 });
      C3D.drawTag(g, P, [7, 0, 0.8], 'Clear Water\nReservoir', '#0369a1', 0, { scene });

      // ── Connecting pipes ──
      C3D.drawPipe(g, P, [-6.2, 0, 0], [-5.3, 0, 0], 0.08, '#64748b', { scene });
      C3D.drawPipe(g, P, [-3.7, 0, 0], [-2.8, 0, 0], 0.08, '#64748b', { scene });
      C3D.drawPipe(g, P, [-0.2, 0, 0], [1.3, 0, 0], 0.08, '#64748b', { scene });
      C3D.drawPipe(g, P, [2.8, 0, 0], [3.8, 0, 0], 0.08, '#64748b', { scene });
      C3D.drawPipe(g, P, [5.2, 0, 0], [6.0, 0, 0], 0.08, '#64748b', { scene });

      // ── Flow direction arrows ──
      const renderFlow = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0ea5e9';
        ctx.font = '800 14px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        const positions = [-5.7, -3.2, 0.5, 3.3, 5.6];
        positions.forEach(x => {
          const p = P([x, 0, 0.3]);
          ctx.fillText('→', p.x, p.y);
        });
        ctx.restore();
      };
      scene.add(-10, renderFlow);

      // ── Turbidity readout ──
      if (step >= 3) {
        C3D.drawCallout(g, P, [2.0, -1.5, 1.5],
          'Turbidity: ' + (vs.finalTurb || 0.5).toFixed(1) + ' NTU',
          { scene, color: '#0f766e', bg: '#ccfbf1' });
      }
      if (step >= 4) {
        C3D.drawCallout(g, P, [4.5, -1.5, 1.5],
          'Disinfection: ' + (vs.disinfEff || 99).toFixed(1) + '%',
          { scene, color: '#15803d', bg: '#dcfce7' });
      }

      const renderTitle = (ctx) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Municipal Water Treatment Plant', 500, 32);
        ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#0369a1';
        ctx.fillText('Unit 1 · Water Technology', 500, 52);
        ctx.restore();
      };
      scene.add(-999, renderTitle);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 9: Reverse Osmosis Desalination Plant (chem-reverse-osmosis)
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-reverse-osmosis'] = {
    initialView: { yaw: -0.48, pitch: 0.44, zoom: 1.05, panX: 0, panY: 15 },
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 105, 16);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const step = st.step || 0;
      const t = st.t || 0;
      const dur = st.dur || 5.0;
      const stepProg = Math.min(1, Math.max(0, (st.st != null ? st.st / dur : 1)));

      const pApplied = vs.pApplied != null ? vs.pApplied : (st.p && st.p.pressure != null ? Number(st.p.pressure) : 45);
      const feedTds = vs.feedTds != null ? vs.feedTds : (st.p && st.p.salt != null ? Number(st.p.salt) : 1500);
      const piOsmotic = vs.piOsmotic != null ? vs.piOsmotic : (feedTds * 0.00078);
      const isFluxing = vs.isFluxing !== false && pApplied > piOsmotic;
      const recoveryRate = vs.recoveryRate != null ? vs.recoveryRate : (isFluxing ? 55 : 0);
      const qPermeate = vs.qPermeate != null ? vs.qPermeate : (isFluxing ? 24.8 : 0);
      const permeateTds = vs.permeateTds != null ? vs.permeateTds : (isFluxing ? 45 : 0);
      const brineTds = vs.brineTds != null ? vs.brineTds : 3200;

      const inspection = (st.p && st.p.inspection) || vs.inspection || 'Assembled Skid';
      const isMolecular = inspection === 'Molecular Rejection (Nanoscale)';
      const isExploded = inspection === 'Exploded Membrane Anatomy';
      const isCutaway = inspection === 'Vessel Cutaway (Internal)' || (!isMolecular && !isExploded && [4, 5, 6, 7, 8].includes(step));
      const showLabels = st.ui && st.ui.showLabels !== false;

      // ──────────────────────────────────────────────────────────────────
      // MODE 4: NANOSCALE MOLECULAR SEPARATION VIEW (500,000x TEM Cutaway)
      // ──────────────────────────────────────────────────────────────────
      if (isMolecular) {
        const renderMolecular = (ctx) => {
          ctx.save();
          const W = 1000, H = 580;

          // Background canvas
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, W, H);

          // Grid backdrop
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
          ctx.lineWidth = 1;
          for (let x = 0; x < W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
          }
          for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
          }

          // Zones: Left = Saline Feed (x: 40 to 450), Center = Polyamide Barrier (450 to 570), Right = Permeate (570 to 960)
          const mLeft = 450, mRight = 570, mTop = 110, mBot = 480, mH = mBot - mTop;

          // Feed Side Zone (High Pressure)
          const feedGrad = ctx.createLinearGradient(40, 0, mLeft, 0);
          feedGrad.addColorStop(0, 'rgba(2, 132, 199, 0.05)');
          feedGrad.addColorStop(1, 'rgba(2, 132, 199, 0.20)');
          ctx.fillStyle = feedGrad;
          ctx.fillRect(40, mTop, mLeft - 40, mH);

          // Feed Header Banner
          ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
          ctx.fillRect(40, mTop, mLeft - 40, 30);
          ctx.font = '700 12px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'left';
          ctx.fillText('HIGH-PRESSURE FEED STREAM  (P = ' + pApplied.toFixed(1) + ' bar · TDS: ' + feedTds.toFixed(0) + ' ppm)', 52, mTop + 20);

          // Permeate Side Zone (Low Pressure)
          const permGrad = ctx.createLinearGradient(mRight, 0, 960, 0);
          permGrad.addColorStop(0, 'rgba(34, 197, 94, 0.18)');
          permGrad.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
          ctx.fillStyle = permGrad;
          ctx.fillRect(mRight, mTop, 960 - mRight, mH);

          // Permeate Header Banner
          ctx.fillStyle = 'rgba(34, 197, 94, 0.28)';
          ctx.fillRect(mRight, mTop, 960 - mRight, 30);
          ctx.font = '700 12px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = '#4ade80';
          ctx.fillText('PURE PERMEATE STREAM  (P = 1.0 bar · TDS: ' + permeateTds.toFixed(0) + ' ppm)', mRight + 12, mTop + 20);

          // Membrane Matrix (Polyamide Active Skin Layer)
          ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
          ctx.fillRect(mLeft, mTop, mRight - mLeft, mH);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.strokeRect(mLeft, mTop, mRight - mLeft, mH);

          // Polyamide Matrix Fibers & Free-Volume Nano-Cavities
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
          ctx.lineWidth = 2.5;
          for (let py = mTop + 40; py < mBot - 10; py += 28) {
            ctx.beginPath();
            ctx.moveTo(mLeft, py);
            ctx.bezierCurveTo(mLeft + 35, py - 12, mLeft + 85, py + 14, mRight, py);
            ctx.stroke();

            // Negative fixed charge sites (COO-)
            ctx.fillStyle = '#f87171';
            ctx.beginPath();
            ctx.arc(mLeft + 18, py - 4, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '700 8px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('-', mLeft + 18, py - 1);
          }

          // Polyamide Header Banner
          ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
          ctx.fillRect(mLeft, mTop, mRight - mLeft, 30);
          ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#fde047';
          ctx.textAlign = 'center';
          ctx.fillText('POLYAMIDE SKIN', (mLeft + mRight) / 2, mTop + 14);
          ctx.font = '600 9px monospace';
          ctx.fillText('0.20 μm · Pores: ~0.28 nm', (mLeft + mRight) / 2, mTop + 25);

          // Dynamic Tangential Crossflow Sweep Arrows (Feed Side)
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 2;
          for (let y = mTop + 55; y < mBot - 30; y += 50) {
            const arrProg = ((t * 0.8 + y * 0.01) % 1);
            const aY = mTop + 45 + arrProg * (mH - 60);
            ctx.beginPath();
            ctx.moveTo(80, aY);
            ctx.lineTo(80, aY + 22);
            ctx.lineTo(75, aY + 16);
            ctx.moveTo(80, aY + 22);
            ctx.lineTo(85, aY + 16);
            ctx.stroke();
          }
          ctx.font = '600 10px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'left';
          ctx.fillText('⬇ TANGENTIAL CROSSFLOW SWEEP (Minimizes Concentration Polarization)', 95, mBot - 12);

          // Animated Molecules
          // 1. Water molecules (Cyan spheres, d ~ 0.28 nm)
          const waterCount = 28;
          for (let w = 0; w < waterCount; w++) {
            const prog = ((t * (isFluxing ? 0.35 : 0.05) + w / waterCount) % 1);
            let wx, wy;
            if (isFluxing) {
              // Drift from feed through membrane to permeate
              wx = 100 + prog * 800;
              wy = mTop + 45 + ((w * 37) % (mH - 70)) + Math.sin(t * 3 + w) * 12;
            } else {
              // Trapped on feed side, oscillating
              wx = 100 + (prog * 320);
              wy = mTop + 45 + ((w * 37) % (mH - 70)) + Math.sin(t * 2 + w) * 8;
            }
            // Draw H2O molecule (central O with 2 H ears)
            ctx.beginPath();
            ctx.arc(wx, wy, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Hydrogen atoms
            ctx.beginPath();
            ctx.arc(wx - 5, wy - 5, 3.5, 0, Math.PI * 2);
            ctx.arc(wx + 5, wy - 5, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            if (wx > mLeft && wx < mRight) {
              // Sparkle / solution diffusion inside membrane
              ctx.fillStyle = '#fef08a';
              ctx.beginPath(); ctx.arc(wx, wy, 2, 0, Math.PI * 2); ctx.fill();
            }
          }

          // 2. Hydrated Salt Ions (Na+, Cl-, Ca2+) - REJECTED
          const saltIons = [
            { type: 'Na⁺', rCore: 7, rShell: 18, color: '#f59e0b', shellCol: 'rgba(245, 158, 11, 0.22)', size: '0.72 nm' },
            { type: 'Cl⁻', rCore: 9, rShell: 17, color: '#ea580c', shellCol: 'rgba(234, 88, 12, 0.22)', size: '0.66 nm' },
            { type: 'Ca²⁺', rCore: 8, rShell: 20, color: '#eab308', shellCol: 'rgba(234, 179, 8, 0.25)', size: '0.82 nm' },
            { type: 'SO₄²⁻', rCore: 10, rShell: 21, color: '#dc2626', shellCol: 'rgba(220, 38, 38, 0.25)', size: '0.78 nm' }
          ];

          for (let s = 0; s < 14; s++) {
            const ion = saltIons[s % saltIons.length];
            const u = ((t * 0.25 + s / 14) % 1);
            // Moves towards membrane, bounces at x = mLeft - 22, swept downward
            let sx, sy;
            if (u < 0.6) {
              sx = 100 + (u / 0.6) * (mLeft - 130);
              sy = mTop + 55 + ((s * 43) % (mH - 90));
            } else {
              // Bouncing back and downward
              const bFrac = (u - 0.6) / 0.4;
              sx = (mLeft - 30) - bFrac * 60 + Math.sin(t * 4 + s) * 15;
              sy = mTop + 55 + ((s * 43) % (mH - 90)) + bFrac * 50;
            }

            // Hydration shell (bound water dipoles)
            ctx.beginPath();
            ctx.arc(sx, sy, ion.rShell, 0, Math.PI * 2);
            ctx.fillStyle = ion.shellCol;
            ctx.fill();
            ctx.strokeStyle = ion.color;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Core ion
            ctx.beginPath();
            ctx.arc(sx, sy, ion.rCore, 0, Math.PI * 2);
            ctx.fillStyle = ion.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Ion label
            ctx.font = '700 9px "Plus Jakarta Sans", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(ion.type, sx, sy + 3);

            // Rejection shockwave if near membrane face
            if (sx > mLeft - 45) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(mLeft - 4, sy, 12, -Math.PI * 0.4, Math.PI * 0.4);
              ctx.stroke();
            }
          }

          // Scale Indicator & Rejection Legend
          const scY = mBot + 18;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(40, scY, 920, 50, 6) : ctx.rect(40, scY, 920, 50);
          ctx.fill();
          ctx.stroke();

          ctx.font = '700 11px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = '#fde047';
          ctx.textAlign = 'left';
          ctx.fillText('SEPARATION PRINCIPLE:', 54, scY + 20);
          ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(
            '1. Size Exclusion: Hydrated ions (0.66–0.82 nm) exceed polyamide free-volume cavities (~0.28 nm).',
            205, scY + 20
          );
          ctx.fillText(
            '2. Donnan Electrostatic Repulsion: Fixed negative carboxylic sites (COO⁻) repel anions (Cl⁻, SO₄²⁻).',
            205, scY + 38
          );
          ctx.fillText(
            '3. Solution-Diffusion: Polar H₂O (0.28 nm) dissolves into dense matrix, hopping across driven by ΔPnet = ' + (Math.max(0, pApplied - piOsmotic)).toFixed(2) + ' bar.',
            54, scY + 38
          );

          ctx.restore();
        };

        scene.add(0, renderMolecular);
      } else {
        // ──────────────────────────────────────────────────────────────────
        // MODES 1, 2, 3: 3D INDUSTRIAL SKID / CUTAWAY / EXPLODED
        // ──────────────────────────────────────────────────────────────────

        // Floor Drop Shadow
        const floorCenter = P([0, 0, -1.58]);
        scene.add(floorCenter.depth + 0.8, (ctx) => {
          ctx.save();
          ctx.translate(floorCenter.x, floorCenter.y);
          ctx.scale(1, 0.42);
          const grad = ctx.createRadialGradient(0, 0, 40, 0, 0, 360);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
          grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.10)');
          grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 360, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Ground plane grid
        C3D.drawGroundGrid(g, P, 7.2, 1, -1.6, 'rgba(148, 163, 184, 0.22)');

        // ─── HELPER: Orthogonal Pipe Segment ───
        const drawPipe = (p1, p2, radius, color, opts = {}) => {
          const dx = p2[0] - p1[0];
          const dy = p2[1] - p1[1];
          const dz = p2[2] - p1[2];
          if (Math.abs(dy) < 0.001 && Math.abs(dz) < 0.001) {
            const minX = Math.min(p1[0], p2[0]);
            const len = Math.abs(dx);
            C3D.drawCylinder(g, P, [minX, p1[1], p1[2]], radius, len, color, {
              scene, axis: 'x', topCap: true, bottomCap: true, stroke: opts.stroke || '#475569', ...opts
            });
          } else if (Math.abs(dx) < 0.001 && Math.abs(dz) < 0.001) {
            const minY = Math.min(p1[1], p2[1]);
            const len = Math.abs(dy);
            C3D.drawCylinder(g, P, [p1[0], minY, p1[2]], radius, len, color, {
              scene, axis: 'y', topCap: true, bottomCap: true, stroke: opts.stroke || '#475569', ...opts
            });
          } else if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
            const minZ = Math.min(p1[2], p2[2]);
            const len = Math.abs(dz);
            C3D.drawCylinder(g, P, [p1[0], p1[1], minZ], radius, len, color, {
              scene, axis: 'z', topCap: true, bottomCap: true, stroke: opts.stroke || '#475569', ...opts
            });
          }
        };

        const drawElbow = (pt, radius, color) => {
          C3D.drawSphere(g, P, pt, radius * 1.12, color || '#94a3b8', { scene, stroke: '#475569' });
        };

        const drawFlange = (pt, axis, radius, color) => {
          const len = 0.05;
          const base = axis === 'x' ? [pt[0] - len/2, pt[1], pt[2]] : axis === 'y' ? [pt[0], pt[1] - len/2, pt[2]] : [pt[0], pt[1], pt[2] - len/2];
          C3D.drawCylinder(g, P, base, radius * 1.6, len, color || '#64748b', { scene, axis, topCap: true, bottomCap: true, stroke: '#334155' });
        };

        const drawDialGauge = (mountPt, radius, readingBar, maxBar, label, color) => {
          C3D.drawCylinder(g, P, mountPt, 0.03, 0.14, '#64748b', { scene, axis: 'z', topCap: true, bottomCap: true });
          const gC = [mountPt[0], mountPt[1] - 0.08, mountPt[2] + 0.20];
          C3D.drawCylinder(g, P, [gC[0], gC[1] - 0.03, gC[2]], radius, 0.06, '#f8fafc', {
            scene, axis: 'y', topCap: true, bottomCap: true, stroke: '#334155'
          });
          C3D.drawCylinder(g, P, [gC[0], gC[1] - 0.04, gC[2]], radius * 1.08, 0.02, '#94a3b8', {
            scene, axis: 'y', topCap: true, bottomCap: true, stroke: '#475569'
          });
          const pr = P(gC);
          scene.add(pr.depth - 0.05, (ctx) => {
            ctx.save();
            const rPx = radius * 70 * (P.zoom || 1);
            ctx.translate(pr.x, pr.y);
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(8, rPx), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, Math.max(6, rPx * 0.78), Math.PI * 0.75, Math.PI * 2.25);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.stroke();

            const frac = Math.min(1, Math.max(0, readingBar / maxBar));
            const ang = Math.PI * 0.75 + frac * (Math.PI * 1.5);
            const nL = Math.max(5, rPx * 0.7);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ang) * nL, Math.sin(ang) * nL);
            ctx.strokeStyle = color || '#dc2626';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();

            if (rPx > 18) {
              ctx.fillStyle = '#0f172a';
              ctx.font = '700 9px "Plus Jakarta Sans", monospace';
              ctx.textAlign = 'center';
              ctx.fillText(readingBar.toFixed(0) + ' bar', 0, rPx * 0.45);
              if (label) {
                ctx.font = '600 7px "Plus Jakarta Sans", sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.fillText(label, 0, -rPx * 0.4);
              }
            }
            ctx.restore();
          });
        };

        // ─── 1. STRUCTURAL STEEL SKID FRAME ───
        C3D.drawBox(g, P, [0, 0, -1.35], [7.0, 2.7, 0.22], '#1e293b', { scene, stroke: '#0f172a' });
        const legPositions = [
          [-3.1, -1.1, -1.48], [0.0, -1.1, -1.48], [3.1, -1.1, -1.48],
          [-3.1, 1.1, -1.48],  [0.0, 1.1, -1.48],  [3.1, 1.1, -1.48]
        ];
        legPositions.forEach(lp => {
          C3D.drawBox(g, P, lp, [0.18, 0.18, 0.24], '#334155', { scene, stroke: '#1e293b' });
          C3D.drawCylinder(g, P, [lp[0], lp[1], -1.58], 0.14, 0.05, '#475569', {
            scene, topCap: true, bottomCap: true, stroke: '#1e293b'
          });
        });
        // Mounting guide rails across skid top
        C3D.drawBox(g, P, [0, -0.65, -1.22], [6.8, 0.12, 0.06], '#64748b', { scene, stroke: '#475569' });
        C3D.drawBox(g, P, [0, 0.65, -1.22], [6.8, 0.12, 0.06], '#64748b', { scene, stroke: '#475569' });

        // ─── 2. RAW FEED WATER TANK (OPAQUE EXTERIOR) ───
        C3D.drawCylinder(g, P, [-2.6, 0.5, -1.15], 0.48, 1.5, '#e2e8f0', {
          scene, topCap: true, bottomCap: true, stroke: '#94a3b8'
        });
        // Reinforcing blue hoop band
        C3D.drawCylinder(g, P, [-2.6, 0.5, -0.45], 0.49, 0.08, '#1e40af', { scene, stroke: '#1e3a8a' });
        // Tank saddle support
        C3D.drawBox(g, P, [-2.6, 0.5, -1.21], [0.98, 0.98, 0.08], '#334155', { scene, stroke: '#1e293b' });
        // Domed manway lid
        C3D.drawCylinder(g, P, [-2.6, 0.5, 0.35], 0.20, 0.08, '#cbd5e1', {
          scene, topCap: true, bottomCap: true, stroke: '#64748b'
        });
        // Sight level gauge tube on front of tank
        C3D.drawCylinder(g, P, [-2.6, 0.0, -1.0], 0.025, 1.2, '#94a3b8', { scene, axis: 'z', topCap: true, bottomCap: true });
        const rawLevel = Math.max(0.2, 0.9 - (step >= 1 ? step * 0.04 : 0));
        C3D.drawCylinder(g, P, [-2.6, 0.0, -1.0], 0.022, 1.2 * rawLevel, '#38bdf8', { scene, axis: 'z', topCap: true, bottomCap: true });

        // ─── 3. PRETREATMENT CARTRIDGE FILTER HOUSING ───
        const isFilterOpen = step === 2;
        const filterLidLift = isFilterOpen ? 0.35 : 0;

        // Filter lower body (industrial 316L stainless with vibrant blue coating)
        C3D.drawCylinder(g, P, [-1.6, 0.5, -0.95], 0.24, 1.1, '#0284c7', {
          scene, topCap: true, bottomCap: true, stroke: '#0369a1'
        });
        // Clamp ring flange
        C3D.drawCylinder(g, P, [-1.6, 0.5, 0.12], 0.27, 0.06, '#334155', {
          scene, topCap: true, bottomCap: true, stroke: '#1e293b'
        });
        // Domed lid
        C3D.drawCylinder(g, P, [-1.6, 0.5, 0.18 + filterLidLift], 0.24, 0.14, '#0369a1', {
          scene, topCap: true, bottomCap: true, stroke: '#0284c7'
        });
        // Top differential pressure gauge
        drawDialGauge([-1.6, 0.5, 0.32 + filterLidLift], 0.10, 0.8, 3.0, 'ΔP 5μm', '#2563eb');

        // Filter internal cartridge (visible during Step 2 inspection or if cutaway)
        if (isFilterOpen || isCutaway) {
          C3D.drawCylinder(g, P, [-1.6, 0.5, -0.85], 0.14, 0.85, '#fef08a', {
            scene, topCap: true, bottomCap: true, stroke: '#ca8a04'
          });
          for (let r = 0; r < 6; r++) {
            const ang = (r / 6) * Math.PI * 2;
            const rx = -1.6 + 0.14 * Math.cos(ang);
            const ry = 0.5 + 0.14 * Math.sin(ang);
            C3D.drawCylinder(g, P, [rx, ry, -0.85], 0.015, 0.85, '#eab308', { scene, topCap: true, bottomCap: true });
          }
        }

        // ─── 4. LOW-PRESSURE FEED PIPING & VALVES ───
        drawPipe([-2.6, 0.5, -1.05], [-2.1, 0.5, -1.05], 0.05, '#cbd5e1');
        drawFlange([-2.4, 0.5, -1.05], 'x', 0.05);
        // Manual ball valve
        C3D.drawBox(g, P, [-2.0, 0.5, -1.05], [0.12, 0.12, 0.12], '#eab308', { scene, stroke: '#ca8a04' });
        C3D.drawBox(g, P, [-2.0, 0.5, -0.95], [0.04, 0.22, 0.04], '#dc2626', { scene, stroke: '#b91c1c' });
        drawPipe([-1.9, 0.5, -1.05], [-1.6, 0.5, -1.05], 0.05, '#cbd5e1');
        drawElbow([-1.6, 0.5, -1.05], 0.05);
        drawPipe([-1.6, 0.5, -1.05], [-1.6, 0.5, -0.55], 0.05, '#cbd5e1');
        drawFlange([-1.6, 0.5, -0.55], 'z', 0.05);

        // Filter outlet to Booster Pump suction
        drawPipe([-1.6, 0.5, 0.05], [-1.0, 0.5, 0.05], 0.05, '#cbd5e1');
        drawFlange([-1.45, 0.5, 0.05], 'x', 0.05);
        drawDialGauge([-1.2, 0.5, 0.05], 0.10, 2.5, 6.0, 'FEED 2.5b', '#0284c7');
        drawPipe([-1.0, 0.5, 0.05], [-0.6, 0.5, 0.05], 0.05, '#cbd5e1');
        drawElbow([-0.6, 0.5, 0.05], 0.05);
        drawPipe([-0.6, 0.5, 0.05], [-0.6, 0.5, -0.75], 0.05, '#cbd5e1');
        drawFlange([-0.6, 0.5, -0.75], 'z', 0.05);

        // ─── 5. HIGH-PRESSURE MULTI-STAGE PUMP & MOTOR ───
        C3D.drawBox(g, P, [-0.6, 0.5, -1.2], [0.75, 0.75, 0.08], '#334155', { scene, stroke: '#1e293b' });
        C3D.drawCylinder(g, P, [-0.6, 0.5, -1.15], 0.26, 0.65, '#1e40af', {
          scene, axis: 'y', topCap: true, bottomCap: true, stroke: '#1e3a8a'
        });
        for (let f = 0; f < 5; f++) {
          const fy = 0.58 + f * 0.11;
          C3D.drawCylinder(g, P, [-0.6, fy, -1.15], 0.28, 0.02, '#172554', { scene, axis: 'y' });
        }
        C3D.drawBox(g, P, [-0.6, 0.8, -0.84], [0.18, 0.18, 0.12], '#1e3a8a', { scene, stroke: '#172554' });
        C3D.drawCylinder(g, P, [-0.6, 0.5, -0.92], 0.16, 0.18, '#475569', { scene, axis: 'z', topCap: true, bottomCap: true });
        C3D.drawCylinder(g, P, [-0.6, 0.5, -0.74], 0.18, 0.90, '#cbd5e1', {
          scene, axis: 'z', topCap: true, bottomCap: true, stroke: '#94a3b8'
        });
        for (let s = 0; s < 5; s++) {
          C3D.drawCylinder(g, P, [-0.6, 0.5, -0.68 + s * 0.16], 0.19, 0.03, '#94a3b8', { scene, axis: 'z' });
        }

        // ─── 6. HIGH-PRESSURE DISCHARGE PIPING ───
        drawPipe([-0.6, 0.5, 0.16], [-0.6, 0.5, 0.55], 0.05, '#cbd5e1');
        drawElbow([-0.6, 0.5, 0.55], 0.05);
        drawPipe([-0.6, 0.5, 0.55], [-0.6, -0.1, 0.55], 0.05, '#cbd5e1');
        drawFlange([-0.6, 0.2, 0.55], 'y', 0.05);
        drawDialGauge([-0.6, 0.1, 0.55], 0.12, pApplied, 100, 'HP ' + pApplied.toFixed(0) + 'b', '#dc2626');
        drawElbow([-0.6, -0.1, 0.55], 0.05);
        drawPipe([-0.6, -0.1, 0.55], [-0.6, -0.1, 0.20], 0.05, '#cbd5e1');
        drawFlange([-0.6, -0.1, 0.20], 'z', 0.05);

        // ─── 7. HIGH-PRESSURE RO MEMBRANE VESSEL ───
        const vX1 = -0.5, vX2 = 2.2, vY = -0.1, vZ = 0.2, vRad = 0.52;
        const vLen = vX2 - vX1;

        // Heavy saddle supports
        C3D.drawBox(g, P, [0.0, vY, -0.55], [0.24, 1.1, 1.2], '#334155', { scene, stroke: '#1e293b' });
        C3D.drawBox(g, P, [1.7, vY, -0.55], [0.24, 1.1, 1.2], '#334155', { scene, stroke: '#1e293b' });
        C3D.drawCylinder(g, P, [-0.04, vY, vZ], vRad * 1.05, 0.08, '#64748b', { scene, axis: 'x', topCap: true, bottomCap: true });
        C3D.drawCylinder(g, P, [1.66, vY, vZ], vRad * 1.05, 0.08, '#64748b', { scene, axis: 'x', topCap: true, bottomCap: true });

        // End caps (machined blue anodized plates with Victaulic grooved couplings)
        C3D.drawCylinder(g, P, [vX1 - 0.08, vY, vZ], vRad * 1.04, 0.08, '#1d4ed8', {
          scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#1e40af'
        });
        C3D.drawCylinder(g, P, [vX2, vY, vZ], vRad * 1.04, 0.08, '#1d4ed8', {
          scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#1e40af'
        });
        C3D.drawCylinder(g, P, [vX1 - 0.02, vY, vZ], vRad * 1.07, 0.03, '#475569', { scene, axis: 'x' });
        C3D.drawCylinder(g, P, [vX2 - 0.01, vY, vZ], vRad * 1.07, 0.03, '#475569', { scene, axis: 'x' });

        // Vessel Body
        if (!isCutaway && !isExploded) {
          // OPAQUE FRP SHELL: Industrial High-Contrast Deep Navy Composite with white rating band
          C3D.drawCylinder(g, P, [vX1, vY, vZ], vRad, vLen, '#1e40af', {
            scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#1e3a8a'
          });
          // Central White Technical Decal Band (ASME Sec X, 70 bar rated)
          C3D.drawCylinder(g, P, [0.6, vY, vZ], vRad * 1.008, 0.50, '#f8fafc', {
            scene, axis: 'x', stroke: '#cbd5e1'
          });
          // Secondary accent band
          C3D.drawCylinder(g, P, [0.4, vY, vZ], vRad * 1.006, 0.05, '#0284c7', { scene, axis: 'x' });
          C3D.drawCylinder(g, P, [1.15, vY, vZ], vRad * 1.006, 0.05, '#0284c7', { scene, axis: 'x' });
        } else {
          // CUTAWAY / EXPLODED VIEW
          const shellBackOffset = isExploded ? 0.60 : 0;
          // Half-shell cut section
          C3D.drawCylinder(g, P, [vX1, vY + shellBackOffset, vZ], vRad, vLen, '#1e3a8a', {
            scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#1e40af'
          });

          // ─── INTERNAL SPIRAL-WOUND MEMBRANE ELEMENT ───
          const elRad = 0.43;
          const elLen = vLen - 0.2;
          const elX = vX1 + 0.1;

          if (!isExploded) {
            // Assembled element nested in vessel
            C3D.drawCylinder(g, P, [elX, vY, vZ], elRad, elLen, '#e0f2fe', {
              scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#0284c7'
            });
            // Black EPDM Chevron Brine Seal on upstream end (prevents feed bypass)
            C3D.drawCylinder(g, P, [elX, vY, vZ], elRad * 1.04, 0.07, '#0f172a', { scene, axis: 'x', topCap: true, bottomCap: true });
            // Anti-Telescoping Device (ATD) on downstream end
            C3D.drawCylinder(g, P, [elX + elLen - 0.07, vY, vZ], elRad * 1.04, 0.07, '#64748b', { scene, axis: 'x', topCap: true, bottomCap: true });

            // Central Perforated Permeate Core Tube
            C3D.drawCylinder(g, P, [vX1 - 0.15, vY, vZ], 0.11, vLen + 0.35, '#cbd5e1', {
              scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#94a3b8'
            });

            // Spiral leaf wraps
            for (let l = 1; l <= 3; l++) {
              const lr = 0.14 + l * 0.09;
              C3D.drawCylinder(g, P, [elX + 0.2, vY, vZ], lr, elLen - 0.4, l === 2 ? '#fef08a' : '#bae6fd', {
                scene, axis: 'x', stroke: '#0284c7'
              });
            }
          } else {
            // EXPLODED MEMBRANE ANATOMY VIEW
            // 1. Central Perforated Permeate Tube (Anchored at center)
            C3D.drawCylinder(g, P, [vX1 - 0.15, vY, vZ], 0.11, vLen + 0.35, '#cbd5e1', {
              scene, axis: 'x', topCap: true, bottomCap: true, stroke: '#94a3b8'
            });
            // 2. Permeate Tricot Carrier Layer (translated down -Z)
            C3D.drawBox(g, P, [0.85, vY, vZ - 0.45], [1.8, 0.55, 0.03], '#38bdf8', {
              scene, stroke: '#0284c7'
            });
            // 3. Polysulfone Microporous Support Layer
            C3D.drawBox(g, P, [0.85, vY, vZ + 0.22], [1.8, 0.55, 0.03], '#93c5fd', {
              scene, stroke: '#60a5fa'
            });
            // 4. Polyamide Thin-Film Barrier Skin (translated up +Z)
            C3D.drawBox(g, P, [0.85, vY, vZ + 0.56], [1.8, 0.55, 0.03], '#fef08a', {
              scene, stroke: '#ca8a04'
            });
            // 5. Diamond-Mesh Feed Spacer (translated forward -Y)
            C3D.drawBox(g, P, [0.85, vY - 0.65, vZ], [1.8, 0.03, 0.55], '#64748b', {
              scene, stroke: '#334155'
            });

            C3D.drawCallout(g, P, [0.85, vY, vZ + 0.60], '1. Polyamide Active Skin (0.2 μm)', {
              scene, color: '#854d0e', bg: '#fef9c3'
            });
            C3D.drawCallout(g, P, [0.85, vY, vZ + 0.25], '2. Polysulfone Support (40 μm)', {
              scene, color: '#1e40af', bg: '#eff6ff'
            });
            C3D.drawCallout(g, P, [0.85, vY, vZ - 0.48], '3. Permeate Tricot Fabric (0.3 mm)', {
              scene, color: '#0369a1', bg: '#e0f2fe'
            });
            C3D.drawCallout(g, P, [0.85, vY - 0.68, vZ], '4. Feed Spacer Mesh (0.7 mm)', {
              scene, color: '#1e293b', bg: '#f1f5f9'
            });
            C3D.drawCallout(g, P, [0.85, vY, vZ + 0.12], '5. Perforated Collector Core Tube', {
              scene, color: '#334155', bg: '#e2e8f0'
            });
          }
        }

        // ─── 8. PERMEATE STREAM PIPING & PRODUCT WATER TANK ───
        drawPipe([vX2, vY, vZ], [2.5, vY, vZ], 0.04, '#38bdf8');
        drawElbow([2.5, vY, vZ], 0.04, '#38bdf8');
        drawPipe([2.5, vY, vZ], [2.5, vY, 0.35], 0.04, '#38bdf8');
        // Rotameter
        C3D.drawCylinder(g, P, [2.5, vY, 0.35], 0.065, 0.45, '#e0f2fe', {
          scene, alpha: 0.65, stroke: '#0284c7', topCap: true, bottomCap: true
        });
        const floatFrac = isFluxing ? Math.min(0.85, Math.max(0.15, qPermeate / 50)) : 0.08;
        C3D.drawCylinder(g, P, [2.5, vY, 0.35 + 0.45 * floatFrac], 0.04, 0.04, '#dc2626', {
          scene, topCap: true, bottomCap: true, stroke: '#991b1b'
        });
        drawPipe([2.5, vY, 0.80], [2.5, vY, 0.85], 0.04, '#38bdf8');
        drawElbow([2.5, vY, 0.85], 0.04, '#38bdf8');
        drawPipe([2.5, vY, 0.85], [2.5, 0.5, 0.85], 0.04, '#38bdf8');
        drawElbow([2.5, 0.5, 0.85], 0.04, '#38bdf8');
        drawPipe([2.5, 0.5, 0.85], [2.6, 0.5, 0.85], 0.04, '#38bdf8');
        drawElbow([2.6, 0.5, 0.85], 0.04, '#38bdf8');
        drawPipe([2.6, 0.5, 0.85], [2.6, 0.5, 0.35], 0.04, '#38bdf8');
        drawFlange([2.6, 0.5, 0.35], 'z', 0.04, '#38bdf8');

        // Product Water Tank (Opaque food-grade)
        C3D.drawCylinder(g, P, [2.6, 0.5, -1.15], 0.46, 1.5, '#f0fdf4', {
          scene, topCap: true, bottomCap: true, stroke: '#86efac'
        });
        C3D.drawCylinder(g, P, [2.6, 0.5, -0.45], 0.47, 0.08, '#16a34a', { scene, stroke: '#15803d' });
        C3D.drawBox(g, P, [2.6, 0.5, -1.21], [0.94, 0.94, 0.08], '#334155', { scene, stroke: '#1e293b' });
        C3D.drawCylinder(g, P, [2.6, 0.02, -1.0], 0.025, 1.2, '#94a3b8', { scene, axis: 'z', topCap: true, bottomCap: true });
        const prodLevel = isFluxing ? Math.min(0.9, 0.15 + (step >= 6 ? (step - 6) * 0.12 + stepProg * 0.08 : 0)) : 0.15;
        C3D.drawCylinder(g, P, [2.6, 0.02, -1.0], 0.022, 1.2 * prodLevel, '#22c55e', { scene, axis: 'z', topCap: true, bottomCap: true });

        // ─── 9. CONCENTRATED BRINE / REJECT STREAM PIPING ───
        drawPipe([vX2, vY, 0.55], [2.2, -0.65, 0.55], 0.05, '#f97316');
        drawFlange([2.2, -0.35, 0.55], 'y', 0.05, '#f97316');
        C3D.drawBox(g, P, [2.2, -0.65, 0.55], [0.14, 0.14, 0.14], '#475569', { scene, stroke: '#1e293b' });
        C3D.drawCylinder(g, P, [2.2, -0.65, 0.62], 0.03, 0.12, '#94a3b8', { scene, axis: 'z', topCap: true, bottomCap: true });
        C3D.drawCylinder(g, P, [2.2, -0.65, 0.74], 0.12, 0.03, '#dc2626', { scene, axis: 'z', topCap: true, bottomCap: true, stroke: '#991b1b' });
        drawDialGauge([2.2, -0.65, 0.55], 0.09, Math.max(0, pApplied - 2), 100, 'BRINE 43b', '#ea580c');
        drawElbow([2.2, -0.65, 0.55], 0.05, '#f97316');
        drawPipe([2.2, -0.65, 0.55], [2.2, -0.65, -1.30], 0.05, '#f97316');

        // ─── 10. INDUSTRIAL CONTROL PANEL PEDESTAL (FRONT-LEFT OPERATOR CORNER) ───
        // Relocated to [-3.1, -0.85, -0.2] so it does NOT block the pump and filter!
        const cpStand = [-3.1, -0.85, -1.25];
        const cpBox = [-3.1, -0.85, -0.15];
        C3D.drawCylinder(g, P, cpStand, 0.05, 1.1, '#475569', { scene, axis: 'z', topCap: true, bottomCap: true });
        C3D.drawBox(g, P, cpBox, [0.45, 0.22, 0.55], '#334155', { scene, stroke: '#0f172a' });
        C3D.drawCylinder(g, P, [-3.1, -0.97, 0.02], 0.035, 0.03, '#dc2626', { scene, axis: 'y', topCap: true, bottomCap: true, stroke: '#eab308' });
        C3D.drawCylinder(g, P, [-3.1, -0.97, -0.08], 0.025, 0.02, isFluxing ? '#22c55e' : '#eab308', { scene, axis: 'y', topCap: true, bottomCap: true });
        C3D.drawCylinder(g, P, [-3.1, -0.97, -0.16], 0.025, 0.02, '#38bdf8', { scene, axis: 'y', topCap: true, bottomCap: true });

        // ─── 11. DYNAMIC WATER & SALT FLOW PARTICLES ───
        if (step >= 1) {
          const pCount = 18;
          for (let i = 0; i < pCount; i++) {
            const u = ((t * 0.45 + i / pCount) % 1);
            let pos;
            if (u < 0.25) {
              const frac = u / 0.25;
              pos = [-2.6 + frac * 1.0, 0.5, -1.05];
            } else if (u < 0.45) {
              const frac = (u - 0.25) / 0.20;
              pos = [-1.6, 0.5, -0.55 + frac * 0.6];
            } else if (u < 0.70) {
              const frac = (u - 0.45) / 0.25;
              pos = [-1.6 + frac * 1.0, 0.5, 0.05];
            } else {
              const frac = (u - 0.70) / 0.30;
              pos = [-0.6, 0.5 - frac * 0.6, 0.55];
            }
            const isSalt = i % 2 === 0;
            const col = isSalt ? '#f97316' : '#38bdf8';
            C3D.drawSphere(g, P, pos, isSalt ? 0.035 : 0.045, col, { scene });
          }

          if (step >= 4) {
            for (let j = 0; j < 24; j++) {
              const fracX = ((t * 0.35 + j / 24) % 1);
              const pX = vX1 + fracX * vLen;
              const isPerm = isFluxing && (j % 3 === 0);

              if (isPerm) {
                const pZ = vZ + Math.sin(t * 3 + j) * (0.35 * (1 - fracX));
                C3D.drawSphere(g, P, [pX, vY, pZ], 0.04, '#38bdf8', { scene });
              } else {
                const pZ = vZ + 0.32 + Math.sin(t * 2 + j) * 0.08;
                C3D.drawSphere(g, P, [pX, vY, pZ], 0.035, '#f97316', { scene });
              }
            }
          }

          if (isFluxing && step >= 6) {
            for (let k = 0; k < 12; k++) {
              const u = ((t * 0.4 + k / 12) % 1);
              let pos;
              if (u < 0.35) {
                pos = [vX2 + u * (2.5 - vX2) / 0.35, vY, vZ];
              } else if (u < 0.70) {
                const f = (u - 0.35) / 0.35;
                pos = [2.5, vY + f * (0.5 - vY), 0.85];
              } else {
                const f = (u - 0.70) / 0.30;
                pos = [2.6, 0.5, 0.85 - f * 0.5];
              }
              C3D.drawSphere(g, P, pos, 0.045, '#38bdf8', { scene });
            }
          }

          if (step >= 7) {
            for (let m = 0; m < 12; m++) {
              const u = ((t * 0.42 + m / 12) % 1);
              let pos;
              if (u < 0.4) {
                const f = u / 0.4;
                pos = [vX2, vY + f * (-0.65 - vY), 0.55];
              } else {
                const f = (u - 0.4) / 0.6;
                pos = [2.2, -0.65, 0.55 - f * 1.8];
              }
              C3D.drawSphere(g, P, pos, 0.04, '#ea580c', { scene });
            }
          }
        }

        // ─── 12. COMPONENT BOUNDS & INTERACTIVE HIGHLIGHTS ───
        const compDefs = [
          { id: 'rawTank', pos: [-2.6, 0.5, -0.4], title: 'Raw Feed Water Tank', r: 45, specs: 'Capacity: 500 L · Material: HDPE / SS316 · Level: Sight Gauge', desc: 'Stores incoming saline feed water containing suspended solids and dissolved salts (TDS ' + feedTds.toFixed(0) + ' mg/L).' },
          { id: 'filter', pos: [-1.6, 0.5, -0.4], title: '5-Micron Cartridge Pretreatment Filter', r: 40, specs: 'Filter Media: Spun Polypropylene · Rating: 5 μm · Max ΔP: 2.5 bar', desc: 'Physically intercepts suspended silt, colloidal matter, and particulates to prevent downstream membrane fouling.' },
          { id: 'pump', pos: [-0.6, 0.5, -0.4], title: 'High-Pressure Multi-Stage Booster Pump', r: 42, specs: 'Type: Vertical Multi-Stage Centrifugal · Pressure: ' + pApplied.toFixed(1) + ' bar · Efficiency: 72%', desc: 'Generates hydraulic driving force exceeding osmotic pressure (π = ' + piOsmotic.toFixed(2) + ' bar) to drive solution-diffusion permeation.' },
          { id: 'vessel', pos: [0.8, vY, vZ], title: 'Pressure-Rated FRP RO Membrane Vessel', r: 50, specs: 'Rating: 70 bar (1000 psi) · Diameter: 8 in / 200 mm · ASME Sec X Design', desc: 'Contains the spiral-wound membrane element under sustained high pressure with leak-tight end closures and brine seals.' },
          { id: 'rotameter', pos: [2.5, vY, 0.55], title: 'Permeate Flow Rotameter', r: 35, specs: 'Range: 0 - 60 L/min · Accuracy: ±2% · Float: 316 Stainless Steel', desc: 'Indicates instantaneous clean water permeate production rate (' + qPermeate.toFixed(1) + ' L/min) driven across the semi-permeable membrane.' },
          { id: 'productTank', pos: [2.6, 0.5, -0.4], title: 'Product Water Collection Tank', r: 45, specs: 'Capacity: 500 L · Purity: < 50 mg/L TDS · Food-Grade Contact', desc: 'Receives desalinated permeate water with > 97% mineral salt reduction for potable or industrial use.' },
          { id: 'brineValve', pos: [2.2, -0.65, 0.55], title: 'Concentrate Needle Control Valve', r: 35, specs: 'Type: High-Pressure Needle Throttling · Body: 316SS · Pressure: 43 bar', desc: 'Regulates system recovery rate and crossflow sweep velocity, discharging high-salinity brine concentrate.' },
          { id: 'panel', pos: cpBox, title: 'Skid Instrumentation & Control Console', r: 40, specs: 'Enclosure: NEMA-4X / IP66 · Power: 415V 3-Phase · Automation: PLC/SCADA', desc: 'Monitors feed pressure, permeate conductivity, recovery rate, and handles safety interlocking.' }
        ];

        if (!st.ui) st.ui = {};
        st.ui._compBounds = compDefs.map((c) => {
          const pr = P(c.pos);
          return { id: c.id, x: pr.x, y: pr.y, r: c.r * (P.zoom || 1), title: c.title };
        });

        const selectedId = st.ui.selectedComponent;
        if (selectedId) {
          const selComp = compDefs.find((c) => c.id === selectedId);
          if (selComp) {
            C3D.drawSphere(g, P, selComp.pos, 0.55, 'rgba(56, 189, 248, 0.28)', { scene });
          }
        }

        // NON-CLASHING, STAGGERED CALLOUT BADGES (Toggleable)
        if (showLabels && !isExploded) {
          // Staggered heights and offsets to eliminate collision
          C3D.drawCallout(g, P, [-2.6, 0.5, 0.95], 'Raw Feed Tank (' + feedTds.toFixed(0) + ' ppm)', { scene, color: '#0369a1', bg: '#f0f9ff' });
          C3D.drawCallout(g, P, [-1.6, -0.15, 0.42 + filterLidLift], '5μm Cartridge Filter', { scene, color: '#1e40af', bg: '#eff6ff' });
          C3D.drawCallout(g, P, [-0.6, 0.85, 0.88], 'HP Pump (' + pApplied.toFixed(0) + ' bar)', { scene, color: '#b91c1c', bg: '#fef2f2' });
          C3D.drawCallout(g, P, [0.85, 0.0, 0.92], 'FRP RO Vessel (70 bar)', { scene, color: '#0f766e', bg: '#f0fdfa' });
          C3D.drawCallout(g, P, [2.6, 0.5, 0.95], 'Product Tank (<50 ppm)', { scene, color: '#15803d', bg: '#f0fdf4' });
          C3D.drawCallout(g, P, [2.2, -0.75, -0.42], 'Brine Reject Drain', { scene, color: '#c2410c', bg: '#fff7ed' });
        }
      }

      // ─── 13. SCREEN TITLE, ON-CANVAS MODE BUTTONS, SCADA HUD & OVERLAYS ───
      const renderOverlay = (ctx) => {
        ctx.save();

        // 1. Title & Physics Header (Top Left)
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Industrial Reverse Osmosis Desalination Plant', 32, 38);
        ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText(
          'Step ' + (step + 1) + ' of 12 · Applied P = ' + pApplied.toFixed(1) + ' bar · Osmotic π = ' + piOsmotic.toFixed(2) + ' bar · Net ΔP = ' + Math.max(0, pApplied - piOsmotic).toFixed(2) + ' bar',
          32, 60
        );

        // 2. Interactive On-Canvas Mode Switcher (Top Right: x = 520 to 990, y = 16 to 48)
        const modes = [
          { id: 'Assembled Skid', label: '🏭 Skid', x: 520, w: 110 },
          { id: 'Vessel Cutaway (Internal)', label: '🔍 Cutaway', x: 636, w: 120 },
          { id: 'Exploded Membrane Anatomy', label: '💥 Exploded', x: 762, w: 120 },
          { id: 'Molecular Rejection (Nanoscale)', label: '🔬 Nanoscale', x: 888, w: 102 }
        ];

        modes.forEach(m => {
          const isActive = inspection === m.id;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(m.x, 16, m.w, 32, 6) : ctx.rect(m.x, 16, m.w, 32);
          ctx.fillStyle = isActive ? '#0284c7' : 'rgba(15, 23, 42, 0.82)';
          ctx.fill();
          ctx.strokeStyle = isActive ? '#38bdf8' : '#334155';
          ctx.lineWidth = isActive ? 1.5 : 1;
          ctx.stroke();

          ctx.font = (isActive ? '700' : '600') + ' 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.fillText(m.label, m.x + m.w / 2, 36);
        });

        // 3. Sub-Row Quick Action Tools (Top Left: y = 68 to 94)
        const tools = [
          { label: showLabels ? '🏷️ Labels: ON' : '🏷️ Labels: OFF', x: 32, w: 108, active: showLabels },
          { label: '🎥 Reset View', x: 146, w: 94, active: false },
          { label: '🎯 Focus Vessel', x: 246, w: 99, active: false }
        ];

        tools.forEach(t => {
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(t.x, 68, t.w, 26, 5) : ctx.rect(t.x, 68, t.w, 26);
          ctx.fillStyle = t.active ? 'rgba(2, 132, 199, 0.15)' : 'rgba(241, 245, 249, 0.92)';
          ctx.fill();
          ctx.strokeStyle = t.active ? '#0284c7' : '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = t.active ? '#0284c7' : '#475569';
          ctx.textAlign = 'center';
          ctx.fillText(t.label, t.x + t.w / 2, 85);
        });

        // 4. SCADA Digital Telemetry Card (Floating Top-Right when no modal open, or bottom)
        if (!isMolecular) {
          const scadaX = 660, scadaY = 60, scadaW = 330, scadaH = 50;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = isFluxing ? '#0284c7' : '#dc2626';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(scadaX, scadaY, scadaW, scadaH, 6) : ctx.rect(scadaX, scadaY, scadaW, scadaH);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.font = '700 9px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('FEED: ' + pApplied.toFixed(0) + ' bar | ' + feedTds.toFixed(0) + ' ppm', scadaX + 10, scadaY + 18);
          ctx.fillStyle = isFluxing ? '#4ade80' : '#f87171';
          ctx.fillText('PERM: ' + qPermeate.toFixed(1) + ' L/m | ' + permeateTds.toFixed(0) + ' ppm', scadaX + 10, scadaY + 36);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('RECOV: ' + recoveryRate.toFixed(1) + '% | REJ: 97%', scadaX + scadaW - 10, scadaY + 18);
          ctx.fillStyle = isFluxing ? '#4ade80' : '#f87171';
          ctx.fillText(isFluxing ? '● RO ACTIVE' : '○ NO FLUX (P≤π)', scadaX + scadaW - 10, scadaY + 36);
        }

        // 5. Visual Stream Legend (Bottom Left)
        const legY = 490;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(30, legY, 340, 60, 8) : ctx.rect(30, legY, 340, 60);
        ctx.fill();
        ctx.stroke();

        ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'left';
        ctx.fillText('PROCESS STREAM & MOLECULAR LEGEND', 42, legY + 16);

        ctx.beginPath(); ctx.arc(46, legY + 32, 5, 0, Math.PI * 2); ctx.fillStyle = '#38bdf8'; ctx.fill();
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#0f172a';
        ctx.fillText('Water Molecule / Permeate Stream (0.28 nm)', 58, legY + 36);

        ctx.beginPath(); ctx.arc(46, legY + 48, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#f97316'; ctx.fill();
        ctx.fillText('Hydrated Salt Ions (Na⁺, Cl⁻, Ca²⁺, SO₄²⁻)', 58, legY + 52);

        // 6. Selected Component Interactive Card Modal
        const selectedId = st.ui && st.ui.selectedComponent;
        if (selectedId && !isMolecular) {
          const compDefs = [
            { id: 'rawTank', title: 'Raw Feed Water Tank', specs: 'Capacity: 500 L · Material: HDPE / SS316 · Level: Sight Gauge', desc: 'Stores incoming saline feed water containing suspended solids and dissolved salts (TDS ' + feedTds.toFixed(0) + ' mg/L).' },
            { id: 'filter', title: '5-Micron Cartridge Pretreatment Filter', specs: 'Filter Media: Spun Polypropylene · Rating: 5 μm · Max ΔP: 2.5 bar', desc: 'Physically intercepts suspended silt, colloidal matter, and particulates to prevent downstream membrane fouling.' },
            { id: 'pump', title: 'High-Pressure Multi-Stage Booster Pump', specs: 'Type: Vertical Multi-Stage Centrifugal · Pressure: ' + pApplied.toFixed(1) + ' bar · Efficiency: 72%', desc: 'Generates hydraulic driving force exceeding osmotic pressure (π = ' + piOsmotic.toFixed(2) + ' bar) to drive solution-diffusion permeation.' },
            { id: 'vessel', title: 'Pressure-Rated FRP RO Membrane Vessel', specs: 'Rating: 70 bar (1000 psi) · Diameter: 8 in / 200 mm · ASME Sec X Design', desc: 'Contains the spiral-wound membrane element under sustained high pressure with leak-tight end closures and brine seals.' },
            { id: 'rotameter', title: 'Permeate Flow Rotameter', specs: 'Range: 0 - 60 L/min · Accuracy: ±2% · Float: 316 Stainless Steel', desc: 'Indicates instantaneous clean water permeate production rate (' + qPermeate.toFixed(1) + ' L/min) driven across the semi-permeable membrane.' },
            { id: 'productTank', title: 'Product Water Collection Tank', specs: 'Capacity: 500 L · Purity: < 50 mg/L TDS · Food-Grade Contact', desc: 'Receives desalinated permeate water with > 97% mineral salt reduction for potable or industrial use.' },
            { id: 'brineValve', title: 'Concentrate Needle Control Valve', specs: 'Type: High-Pressure Needle Throttling · Body: 316SS · Pressure: 43 bar', desc: 'Regulates system recovery rate and crossflow sweep velocity, discharging high-salinity brine concentrate.' },
            { id: 'panel', title: 'Skid Instrumentation & Control Console', specs: 'Enclosure: NEMA-4X / IP66 · Power: 415V 3-Phase · Automation: PLC/SCADA', desc: 'Monitors feed pressure, permeate conductivity, recovery rate, and handles safety interlocking.' }
          ];

          const selComp = compDefs.find((c) => c.id === selectedId);
          if (selComp) {
            const cardX = 630, cardY = 115, cardW = 340, cardH = 135;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 8) : ctx.rect(cardX, cardY, cardW, cardH);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.fillStyle = '#38bdf8';
            ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(selComp.title.toUpperCase(), cardX + 14, cardY + 22);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('✕ Close', cardX + cardW - 14, cardY + 22);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#fde047';
            ctx.font = '600 10px "Plus Jakarta Sans", monospace';
            ctx.fillText(selComp.specs, cardX + 14, cardY + 44);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
            const words = selComp.desc.split(' ');
            let line = '', lY = cardY + 68;
            for (let w = 0; w < words.length; w++) {
              const testLine = line + words[w] + ' ';
              if (ctx.measureText(testLine).width > cardW - 28) {
                ctx.fillText(line, cardX + 14, lY);
                line = words[w] + ' ';
                lY += 17;
              } else {
                line = testLine;
              }
            }
            if (line) ctx.fillText(line, cardX + 14, lY);

            ctx.fillStyle = '#64748b';
            ctx.font = 'italic 9px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('Click anywhere outside or on close to dismiss', cardX + 14, cardY + cardH - 10);
          }
        }

        ctx.restore();
      };

      scene.add(-999, renderOverlay);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 10: Lithium-Ion Battery (LFP / Graphite)
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-lithium-ion-battery'] = {
    initialView: { yaw: -0.42, pitch: 0.38, zoom: 1.05, panX: 0, panY: 10 },
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 110, 16);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const t = st.t || 0;

      const isCharge = vs.isCharge != null ? vs.isCharge : (st.p && st.p.mode === 'Electrolytic Charge');
      const soc = vs.soc != null ? vs.soc : (st.p && st.p.soc != null ? Number(st.p.soc) : 75);
      const current = vs.current != null ? vs.current : (st.p && st.p.current != null ? Number(st.p.current) : 5.0);
      const vTerm = vs.vTerm != null ? vs.vTerm : (isCharge ? 3.38 : 3.24);
      const inspection = (st.p && st.p.inspection) || vs.inspection || 'Casing Cutaway';
      const isCutaway = inspection === 'Casing Cutaway';
      const isExploded = inspection === 'Exploded Electrode Stack';
      const isMicro = inspection === 'Microscopic Intercalation';
      const isAssembled = inspection === 'Prismatic Assembly';

      // 1. Solid Workbench
      drawLabBench(g, P, scene, [0, 0, -1.2], 5.0, 3.2, 0.7);

      // Microscopic view branch
      if (isMicro) {
        const renderMicro = (ctx) => {
          ctx.save();
          ctx.fillStyle = '#071118'; ctx.fillRect(0, 0, 1000, 560);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'; ctx.lineWidth = 1;
          for (let x = 0; x < 1000; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 560); ctx.stroke(); }
          for (let y = 0; y < 560; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1000, y); ctx.stroke(); }

          // Left: Graphite Anode Hexagonal Graphene Planes
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'; ctx.fillRect(60, 80, 380, 400);
          ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.strokeRect(60, 80, 380, 400);
          ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('ANODE: GRAPHITE HEXAGONAL SHEETS (C₆)', 80, 110);
          ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
          ctx.fillText('Reaction: Li_x C₆ ⇌ C₆ + x Li⁺ + x e⁻', 80, 130);

          // Draw graphene hexagonal rings
          for (let row = 0; row < 5; row++) {
            const y = 180 + row * 60;
            ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(410, y); ctx.stroke();
            // Intercalated Li+ ions
            for (let col = 0; col < 4; col++) {
              const x = 130 + col * 75;
              const hop = Math.sin(t * 3 + col + row) * 4;
              ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.arc(x, y - 25 + hop, 9, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
              ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('Li⁺', x - 6, y - 22 + hop);
            }
          }

          // Center: Microporous Separator Permeation Channel
          ctx.fillStyle = 'rgba(254, 240, 138, 0.15)'; ctx.fillRect(455, 80, 90, 400);
          ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.strokeRect(455, 80, 90, 400); ctx.setLineDash([]);
          ctx.fillStyle = '#fef08a'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('SEPARATOR', 500, 110);
          ctx.fillText('PORES', 500, 126);

          // Moving Li+ ions through separator
          for (let p = 0; p < 4; p++) {
            const prog = ((t * 0.4 + p * 0.25) % 1);
            const py = 160 + p * 80;
            const px = isCharge ? (530 - prog * 60) : (470 + prog * 60);
            ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
          }

          // Right: LiFePO4 Olivine Lattice
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'; ctx.fillRect(560, 80, 380, 400);
          ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.strokeRect(560, 80, 380, 400);
          ctx.fillStyle = '#22c55e'; ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('CATHODE: LiFePO₄ OLIVINE LATTICE (Pnma)', 580, 110);
          ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
          ctx.fillText('Reaction: Li_{1-x}FePO₄ + x Li⁺ + x e⁻ ⇌ LiFePO₄', 580, 130);

          // Olivine channels & interstitial Li+ sites
          for (let row = 0; row < 5; row++) {
            const y = 180 + row * 60;
            for (let col = 0; col < 4; col++) {
              const x = 600 + col * 85;
              ctx.fillStyle = '#78350f'; ctx.fillRect(x, y - 20, 35, 35); // FeO6 octahedra
              ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(x + 55, y - 2, 12, 0, Math.PI * 2); ctx.fill(); // PO4
              // Li+ in [010] tunnel
              const occ = Math.sin(t * 2 + col) > -0.2;
              if (occ) {
                ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.arc(x + 17, y + 22, 8, 0, Math.PI * 2); ctx.fill();
              }
            }
          }

          ctx.restore();
        };
        scene.add(-999, renderMicro);
        scene.render(g);
        return;
      }

      // 2. Battery Geometry
      const casingCenter = [0, 0, 0];
      const casingW = 2.4, casingD = 1.0, casingH = 1.6;

      if (isAssembled) {
        // Solid Metallic Prismatic Box
        C3D.drawBox(g, P, casingCenter, [casingW, casingD, casingH], '#64748b', { scene, stroke: '#334155' });
      } else if (isCutaway) {
        // Cutaway: Back half and bottom preserved, front open
        C3D.drawBox(g, P, [0, -0.4, 0], [casingW, 0.2, casingH], '#475569', { scene, stroke: '#334155' });
        C3D.drawBox(g, P, [0, 0, -0.7], [casingW, casingD, 0.2], '#334155', { scene });

        // Internal multi-layer stack visible inside
        const layerCount = 10;
        for (let l = 0; l < layerCount; l++) {
          const lX = -0.9 + l * 0.2;
          let color = '#fef08a'; // Separator
          if (l % 3 === 0) color = '#18181b'; // Graphite
          else if (l % 3 === 1) color = '#3f3f46'; // LFP
          C3D.drawBox(g, P, [lX, 0, 0], [0.12, 0.75, 1.2], color, { scene });
        }
      } else if (isExploded) {
        // Exploded view: layers spaced out along X
        const exLayers = [
          { name: 'Al Collector', col: '#e2e8f0', x: -1.8 },
          { name: 'LiFePO₄ Cathode', col: '#3f3f46', x: -0.9 },
          { name: 'Polyolefin Separator', col: '#fef08a', x: 0.0 },
          { name: 'Graphite Anode', col: '#18181b', x: 0.9 },
          { name: 'Cu Collector', col: '#b45309', x: 1.8 },
        ];
        exLayers.forEach((el) => {
          C3D.drawBox(g, P, [el.x, 0, 0], [0.35, 0.7, 1.3], el.col, { scene, stroke: '#0f172a' });
        });
      }

      // Top Lid (Always visible)
      C3D.drawBox(g, P, [0, 0, 0.85], [casingW + 0.1, casingD + 0.1, 0.1], '#475569', { scene, stroke: '#1e293b' });

      // Positive Terminal (+): Brass post on red collar
      C3D.drawCylinder(g, P, [-0.7, 0, 0.95], 0.14, 0.06, '#dc2626', { scene, topCap: true });
      C3D.drawCylinder(g, P, [-0.7, 0, 1.05], 0.08, 0.25, '#d97706', { scene, topCap: true });

      // Negative Terminal (-): Nickel post on black collar
      C3D.drawCylinder(g, P, [0.7, 0, 0.95], 0.14, 0.06, '#0f172a', { scene, topCap: true });
      C3D.drawCylinder(g, P, [0.7, 0, 1.05], 0.08, 0.25, '#94a3b8', { scene, topCap: true });

      // Safety Burst Vent in Center
      C3D.drawCylinder(g, P, [0, 0, 0.92], 0.12, 0.04, '#334155', { scene, topCap: true });

      // External Circuit & Motor Load
      C3D.drawBox(g, P, [0, 0, 1.8], [2.8, 0.8, 0.1], '#1e293b', { scene });
      // Wires from terminals to deck
      C3D.drawCylinder(g, P, [-0.7, 0, 1.4], 0.03, 0.7, '#ef4444', { scene });
      C3D.drawCylinder(g, P, [0.7, 0, 1.4], 0.03, 0.7, '#0f172a', { scene });

      // Motor Load Housing & Blades
      C3D.drawCylinder(g, P, [-0.5, 0, 2.05], 0.18, 0.35, '#475569', { scene, topCap: true });
      // Charger Box
      C3D.drawBox(g, P, [0.6, 0, 2.05], [0.6, 0.5, 0.35], isCharge ? '#065f46' : '#334155', { scene });

      // 3. Live Particle Streams
      // Li+ stream across cell
      for (let i = 0; i < 10; i++) {
        const u = ((t * 0.3 + i * 0.1) % 1);
        const pX = isCharge ? (-0.6 + u * 1.2) : (0.6 - u * 1.2);
        C3D.drawSphere(g, P, [pX, 0, 0.1 + Math.sin(i) * 0.3], 0.04, '#06b6d4', { scene });
      }
      // Electron stream through external circuit
      for (let e = 0; e < 12; e++) {
        const u = ((t * 0.5 + e * 0.083) % 1);
        let ex, ez;
        if (u < 0.35) { ex = 0.7; ez = 1.1 + (u / 0.35) * 0.7; }
        else if (u < 0.65) { ex = 0.7 - ((u - 0.35) / 0.3) * 1.4; ez = 1.85; }
        else { ex = -0.7; ez = 1.85 - ((u - 0.65) / 0.35) * 0.75; }
        if (isCharge) ex = -ex;
        C3D.drawSphere(g, P, [ex, 0, ez], 0.035, '#f59e0b', { scene });
      }

      // 4. Component Inspection Overlays & Badges
      const compDefs = [
        { id: 'casing', pos: [0, -0.4, 0.2], title: 'Prismatic Aluminum Casing', specs: 'Material: AA3003 · Wall: 3.0 mm', desc: 'Provides rugged structural containment and hermetic seal isolating organic carbonate electrolyte from ambient moisture.' },
        { id: 'posTerm', pos: [-0.7, 0, 1.15], title: 'Positive Terminal (+)', specs: 'Material: Forged Brass / Al · M8 Thread', desc: 'Conducts heavy current from aluminum current collector tabs to external electrical load.' },
        { id: 'negTerm', pos: [0.7, 0, 1.15], title: 'Negative Terminal (-)', specs: 'Material: Nickel-Plated Copper · M8', desc: 'Connects internal copper current collector foil to external circuit.' },
        { id: 'burstVent', pos: [0, 0, 0.95], title: 'Pressure Relief Burst Vent', specs: 'Rupture Rating: 1.0–1.4 MPa', desc: 'Laser-scored aluminum diaphragm that safely vents internal pressure to prevent cell explosion.' },
        { id: 'lfpCathode', pos: [-0.6, 0, 0], title: 'LiFePO₄ Olivine Cathode', specs: 'Theoretical Cap: 170 mAh/g · 3.45V vs Li', desc: 'Triphylite crystal structure with [010] diffusion channels and exceptionally stable covalent P-O bonds.' },
        { id: 'graphiteAnode', pos: [0.6, 0, 0], title: 'Synthetic Graphite Anode (C₆)', specs: 'Capacity: 372 mAh/g · Staging Stages 1-4', desc: 'Intercalates Li⁺ between hexagonal graphene sheets during charge; deintercalates spontaneously on discharge.' },
        { id: 'separator', pos: [0, 0, 0], title: 'Microporous Polyolefin Separator', specs: 'Thickness: 16–20 µm · Porosity: ~40%', desc: 'Permeable to solvated Li⁺ ions while providing electronic insulation preventing short-circuit.' },
      ];

      const renderOverlay = (ctx) => {
        ctx.save();
        compDefs.forEach((cp) => {
          const sc = typeof P.project === 'function' ? P.project(cp.pos) : P(cp.pos);
          if (sc && !sc.clipped) {
            ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sc.x, sc.y); ctx.lineTo(sc.x + 15, sc.y - 15); ctx.stroke();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(sc.x + 15, sc.y - 25, ctx.measureText(cp.title).width + 12, 18);
            ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px sans-serif';
            ctx.fillText(cp.title, sc.x + 21, sc.y - 12);
          }
        });
        ctx.restore();
      };

      scene.add(-999, renderOverlay);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 11: Lead-Acid Battery (Automotive 6-Cell 12V)
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-lead-acid-battery'] = {
    initialView: { yaw: -0.38, pitch: 0.35, zoom: 1.0, panX: 0, panY: 10 },
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 105, 16);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const t = st.t || 0;

      const isCharge = vs.isCharge != null ? vs.isCharge : (st.p && st.p.mode === 'Alternator Charge');
      const soc = vs.soc != null ? vs.soc : (st.p && st.p.soc != null ? Number(st.p.soc) : 85);
      const sg = vs.sg != null ? vs.sg : (1.120 + (soc / 100) * 0.160);
      const vTerm = vs.vTerm != null ? vs.vTerm : (isCharge ? 14.4 : 12.4);
      const inspection = (st.p && st.p.inspection) || vs.inspection || 'Casing Cutaway (6 Cells)';
      const isCutaway = inspection === 'Casing Cutaway (6 Cells)';
      const isExploded = inspection === 'Exploded Plate Group';

      drawLabBench(g, P, scene, [0, 0, -1.2], 5.2, 3.2, 0.7);

      const caseW = 3.6, caseD = 1.4, caseH = 1.5;

      if (!isCutaway && !isExploded) {
        // Complete Polypropylene Box
        C3D.drawBox(g, P, [0, 0, 0], [caseW, caseD, caseH], '#334155', { scene, stroke: '#1e293b' });
      } else if (isCutaway) {
        // Cutaway: 6 separate cell chambers visible
        C3D.drawBox(g, P, [0, -0.6, 0], [caseW, 0.2, caseH], '#1e293b', { scene });
        C3D.drawBox(g, P, [0, 0, -0.6], [caseW, caseD, 0.2], '#1e293b', { scene });

        // 6 Cells with plates and partitions
        for (let c = 0; c < 6; c++) {
          const cx = -1.5 + c * 0.6;
          // Partitions
          if (c < 5) C3D.drawBox(g, P, [cx + 0.3, 0, 0], [0.06, caseD - 0.2, caseH - 0.1], '#475569', { scene });
          // Acid liquid
          C3D.drawBox(g, P, [cx, 0, -0.1], [0.48, caseD - 0.3, caseH - 0.4], '#bae6fd', { scene });
          // Plate packs (chocolate PbO2 & slate Pb)
          const plateCol = soc > 50 ? '#451a03' : '#94a3b8';
          C3D.drawBox(g, P, [cx, 0, 0], [0.38, caseD - 0.5, caseH - 0.3], plateCol, { scene, stroke: '#0f172a' });
        }
      } else if (isExploded) {
        // Exploded single cell plate group
        C3D.drawBox(g, P, [-1.0, 0, 0], [0.5, 0.08, 1.2], '#64748b', { scene, stroke: '#0f172a' }); // Spongy Pb
        C3D.drawBox(g, P, [0.0, 0, 0], [0.5, 0.08, 1.2], '#fef08a', { scene, stroke: '#0f172a' });  // Separator
        C3D.drawBox(g, P, [1.0, 0, 0], [0.5, 0.08, 1.2], '#451a03', { scene, stroke: '#0f172a' });  // PbO2
      }

      // Top Lid with 6 Vent Caps & Terminals
      C3D.drawBox(g, P, [0, 0, 0.8], [caseW + 0.1, caseD + 0.1, 0.1], '#1e293b', { scene });
      for (let v = 0; v < 6; v++) {
        const vx = -1.5 + v * 0.6;
        C3D.drawCylinder(g, P, [vx, 0, 0.88], 0.12, 0.06, '#0f172a', { scene, topCap: true });
      }

      // Terminals: Positive (Red collar, left) and Negative (Black collar, right)
      C3D.drawCylinder(g, P, [-1.4, -0.4, 0.88], 0.16, 0.06, '#dc2626', { scene, topCap: true });
      C3D.drawCylinder(g, P, [-1.4, -0.4, 0.98], 0.1, 0.2, '#94a3b8', { scene, topCap: true });
      C3D.drawCylinder(g, P, [1.4, -0.4, 0.88], 0.16, 0.06, '#0f172a', { scene, topCap: true });
      C3D.drawCylinder(g, P, [1.4, -0.4, 0.98], 0.1, 0.2, '#94a3b8', { scene, topCap: true });

      // Optical Hydrometer ("Magic Eye") in Cell #1
      const hydroColor = soc > 65 ? '#22c55e' : (soc > 35 ? '#f59e0b' : '#ef4444');
      C3D.drawSphere(g, P, [-1.5, 0.35, 0.9], 0.08, hydroColor, { scene });

      // External Load Headlamp Bulb (glowing)
      C3D.drawSphere(g, P, [-0.5, 0, 1.8], 0.18, isCharge ? '#475569' : '#fef08a', { scene });

      // Particles: SO4(2-) violet ions in electrolyte
      for (let s = 0; s < 8; s++) {
        const u = ((t * 0.25 + s * 0.12) % 1);
        const pz = isCharge ? (-0.3 + u * 0.6) : (0.3 - u * 0.6);
        C3D.drawSphere(g, P, [-0.9 + (s % 3) * 0.6, 0, pz], 0.045, '#a855f7', { scene });
      }

      const compDefs = [
        { id: 'container', pos: [0, -0.5, 0], title: '6-Cell Polypropylene Case', specs: 'Rating: Impact Modified PP · 6 Cells', desc: 'Resists 37% H₂SO₄ acid; internal partitions isolate the 6 series cells providing 12.6V total nominal output.' },
        { id: 'pbo2Plates', pos: [-0.9, 0, 0.2], title: 'Positive Plates (PbO₂)', specs: 'Active Material: Lead Dioxide (Chocolate)', desc: 'Undergoes reduction: PbO₂ + SO₄²⁻ + 4H⁺ + 2e⁻ → PbSO₄ + 2H₂O (+1.685 V vs SHE).' },
        { id: 'pbPlates', pos: [0.9, 0, 0.2], title: 'Negative Plates (Spongy Pb)', specs: 'Active Material: Spongy Lead (Slate)', desc: 'Undergoes oxidation: Pb + SO₄²⁻ → PbSO₄ + 2e⁻ (−0.356 V vs SHE).' },
        { id: 'connectors', pos: [-0.3, 0, 0.5], title: 'Through-Wall Intercell Connectors', specs: 'Cast Lead Busbar Slugs · <0.2 mΩ', desc: 'Resistance-welded through partition bulkheads to link adjacent cells in series.' },
        { id: 'hydrometer', pos: [-1.5, 0.35, 0.95], title: 'Specific Gravity Hydrometer', specs: 'Current SG: ' + sg.toFixed(3) + ' g/cm³', desc: 'Measures electrolyte density: 1.280 g/cm³ indicates 100% full charge; 1.120 g/cm³ indicates complete exhaustion.' },
      ];

      const renderOverlay = (ctx) => {
        ctx.save();
        compDefs.forEach((cp) => {
          const sc = typeof P.project === 'function' ? P.project(cp.pos) : P(cp.pos);
          if (sc && !sc.clipped) {
            ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sc.x, sc.y); ctx.lineTo(sc.x + 15, sc.y - 15); ctx.stroke();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(sc.x + 15, sc.y - 25, ctx.measureText(cp.title).width + 12, 18);
            ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px sans-serif';
            ctx.fillText(cp.title, sc.x + 21, sc.y - 12);
          }
        });
        ctx.restore();
      };

      scene.add(-999, renderOverlay);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SIMULATION 12: PEM Hydrogen Fuel Cell
  // ═══════════════════════════════════════════════════════════════════════
  Sims['chem-pem-fuel-cell'] = {
    initialView: { yaw: -0.40, pitch: 0.36, zoom: 1.05, panX: 0, panY: 10 },
    draw: function (g, st) {
      const C3D = window.Chem3D;
      const V = C3D.V;
      const view = st.view || {};
      const P = C3D.createProjector(g, view, 500, 310, 105, 16);
      const scene = C3D.createScene();
      const vs = (st.c && st.c.state && st.c.state.visualizationState) || {};
      const t = st.t || 0;

      const rLoad = vs.rLoad != null ? vs.rLoad : (st.p && st.p.loadRes != null ? Number(st.p.loadRes) : 1.5);
      const current = vs.current != null ? vs.current : 0.5;
      const voltage = vs.voltage != null ? vs.voltage : 0.75;
      const power = vs.power != null ? vs.power : (voltage * current);
      const inspection = (st.p && st.p.inspection) || vs.inspection || 'Sectional Cutaway';
      const isCutaway = inspection === 'Sectional Cutaway';
      const isExploded = inspection === 'Exploded MEA Stack';

      drawLabBench(g, P, scene, [0, 0, -1.2], 5.0, 3.2, 0.7);

      const stackW = 2.0, stackH = 2.0;

      if (!isExploded) {
        // Anode End Plate (Z = -0.7) & Cathode End Plate (Z = +0.7)
        C3D.drawBox(g, P, [0, 0, -0.7], [stackW, stackH, 0.2], '#94a3b8', { scene, stroke: '#334155' });
        C3D.drawBox(g, P, [0, 0, 0.7], [stackW, stackH, 0.2], '#94a3b8', { scene, stroke: '#334155' });

        // Middle Stack (Graphite + MEA)
        const bodyColor = isCutaway ? '#27272a' : '#18181b';
        C3D.drawBox(g, P, [0, 0, 0], [stackW - 0.1, stackH - 0.1, 1.2], bodyColor, { scene });

        if (isCutaway) {
          // Exposed center Nafion PEM
          C3D.drawBox(g, P, [0, 0.3, 0], [stackW - 0.3, 0.8, 0.06], '#fef08a', { scene });
          // Serpentine ribbing representation
          for (let r = -3; r <= 3; r++) {
            C3D.drawBox(g, P, [0, 0.3 + r * 0.1, -0.2], [1.4, 0.04, 0.04], '#38bdf8', { scene });
          }
        }

        // 4 Tie Rods at corners
        const corners = [[-0.8, 0.8], [0.8, 0.8], [-0.8, -0.8], [0.8, -0.8]];
        corners.forEach(([cx, cy]) => {
          C3D.drawCylinder(g, P, [cx, 0, cy], 0.04, 1.6, '#64748b', { scene, topCap: true, bottomCap: true });
        });

        // Nozzles
        C3D.drawCylinder(g, P, [-0.5, 0, -0.85], 0.08, 0.25, '#38bdf8', { scene, topCap: true }); // H2 in
        C3D.drawCylinder(g, P, [0.5, 0, 0.85], 0.08, 0.25, '#ef4444', { scene, topCap: true });  // O2 in
        C3D.drawCylinder(g, P, [0.5, 0, -0.85], 0.08, 0.25, '#60a5fa', { scene, topCap: true }); // Water out
      } else {
        // Exploded MEA Layers spaced out along Z
        const layers = [
          { name: 'Anode End Plate', col: '#94a3b8', z: -1.6 },
          { name: 'Anode Bipolar (H₂)', col: '#18181b', z: -0.9 },
          { name: 'Anode GDL (Carbon)', col: '#27272a', z: -0.4 },
          { name: 'Nafion™ PEM', col: '#fef08a', z: 0.0 },
          { name: 'Cathode GDL', col: '#27272a', z: 0.4 },
          { name: 'Cathode Bipolar (O₂)', col: '#18181b', z: 0.9 },
          { name: 'Cathode End Plate', col: '#94a3b8', z: 1.6 },
        ];
        layers.forEach((l) => {
          C3D.drawBox(g, P, [0, 0, l.z], [1.6, 1.6, 0.1], l.col, { scene, stroke: '#0f172a' });
        });
      }

      // External Load Rheostat & Fan
      C3D.drawBox(g, P, [0, 0, 1.7], [1.2, 0.8, 0.4], '#334155', { scene });
      C3D.drawCylinder(g, P, [0, 0, 1.95], 0.14, 0.1, '#0f172a', { scene, topCap: true });

      // Particles
      // H2 entering anode
      for (let h = 0; h < 6; h++) {
        const u = ((t * 0.4 + h * 0.16) % 1);
        C3D.drawSphere(g, P, [-0.5, 0, -0.9 + u * 0.6], 0.04, '#a5f3fc', { scene });
      }
      // Protons crossing Nafion
      for (let p = 0; p < 8; p++) {
        const u = ((t * 0.35 + p * 0.12) % 1);
        C3D.drawSphere(g, P, [-0.2 + (p % 3) * 0.2, 0.2, -0.15 + u * 0.3], 0.038, '#38bdf8', { scene });
      }
      // Water droplets at drain
      for (let w = 0; w < 5; w++) {
        const u = ((t * 0.3 + w * 0.2) % 1);
        C3D.drawSphere(g, P, [0.5, 0, 0.7 - u * 0.4], 0.05, '#60a5fa', { scene });
      }

      const compDefs = [
        { id: 'endPlates', pos: [0, 0, -0.75], title: 'Clamping End Plates', specs: 'Material: Gold-Plated Al · P: 2.0 MPa', desc: 'Maintains uniform compressive force across active GDL ensuring low contact resistance.' },
        { id: 'bipolarAnode', pos: [0, 0.4, -0.3], title: 'Anode Bipolar Flow Plate', specs: 'Material: Machined Graphite · Serpentine', desc: 'Distributes pure H₂ gas uniformly and conducts electrons away from anode oxidation sites.' },
        { id: 'nafionMem', pos: [0, 0.2, 0], title: 'Nafion™ PFSA Membrane', specs: 'Thickness: 50 µm · Conductivity: 0.1 S/cm', desc: 'Solid perfluorosulfonic acid film that conducts H⁺ protons via Grotthuss hopping while blocking electrons.' },
        { id: 'h2Inlet', pos: [-0.5, 0, -0.9], title: 'Hydrogen Fuel Inlet', specs: 'Delivery Flow: 30–250 mL/min', desc: 'Supplies high-purity hydrogen fuel to the anode catalytic oxidation sites.' },
        { id: 'waterDrain', pos: [0.5, 0, -0.9], title: 'Water Product Drainage Port', specs: 'Byproduct Rate: ' + (current * 0.336).toFixed(2) + ' mL/hr', desc: 'Evacuates byproduct water droplets and depleted air exhaust to prevent electrode flooding.' },
      ];

      const renderOverlay = (ctx) => {
        ctx.save();
        compDefs.forEach((cp) => {
          const sc = typeof P.project === 'function' ? P.project(cp.pos) : P(cp.pos);
          if (sc && !sc.clipped) {
            ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sc.x, sc.y); ctx.lineTo(sc.x + 15, sc.y - 15); ctx.stroke();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(sc.x + 15, sc.y - 25, ctx.measureText(cp.title).width + 12, 18);
            ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px sans-serif';
            ctx.fillText(cp.title, sc.x + 21, sc.y - 12);
          }
        });
        ctx.restore();
      };

      scene.add(-999, renderOverlay);
      scene.render(g);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Register all new simulations
  // ═══════════════════════════════════════════════════════════════════════
  window.Chem3DSimsNew = Sims;

  // Also register as Chem3DSimulators for compatibility with the sim shell
  window.Chem3DSimulators = Object.assign(window.Chem3DSimulators || {}, Sims);

})();
