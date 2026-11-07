'use strict';

/**
 * ChemSims3D — Advanced Interactive 3D Simulations for KPRIET Engineering Chemistry (U21CY101).
 * Transforms the first 10 simulations into authentic, scientifically accurate, interactive 3D virtual experiments.
 * Features: True 3D geometry, lighting, materials, camera navigation, step-by-step physical/chemical animations,
 * reactive parameters, explicit ion labels with charges, and smartboard-optimized 4K visual clarity.
 */
(function () {
  const C3D = window.Chem3D;
  const V = C3D.V;
  const D = window.EPDraw;

  const Sim3D = {};

  const r = (key, label, min, max, step, value, unit) => ({ key, label, type: 'range', min, max, step, default: value, unit: unit || '' });
  const select = (key, label, value, options) => ({ key, label, type: 'select', default: value, options: options.map((x) => ({ label: x, value: x })) });

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 01 — Hardness of Water Simulator (chem-hardness-water)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-hardness-water'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.38, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('ca', 'Ca²⁺ hardness', 0, 300, 5, 90, 'mg/L'),
      r('mg', 'Mg²⁺ hardness', 0, 300, 5, 60, 'mg/L'),
      r('sampleVolume', 'Water sample volume', 10, 100, 5, 50, 'mL'),
      r('edtaMolarity', 'EDTA titrant molarity', 0.005, 0.05, 0.005, 0.01, 'M'),
      r('edtaVolume', 'EDTA volume added', 0, 30, 0.5, 7.5, 'mL'),
      select('viewMode', 'Observation View', 'Apparatus View', ['Apparatus View', 'Molecular Zoom'])
    ],
    steps: () => [
      {
        title: 'Introduce the Water Sample',
        text: 'The raw water sample contains dissolved Ca²⁺ (green) and Mg²⁺ (purple) ions responsible for total hardness. Rotate and inspect the clear water in the beaker.'
      },
      {
        title: 'Prepare Sample in Conical Flask',
        text: 'Pipette accurately transfers a 50 mL aliquot of the water sample into the Erlenmeyer conical flask for volumetric analysis.'
      },
      {
        title: 'Add Buffer & EBT Indicator',
        text: 'Ammonia buffer (pH 10) and Eriochrome Black T (EBT) indicator are added. Ca²⁺ and Mg²⁺ form an unstable wine-red [M-EBT] complex.'
      },
      {
        title: 'Titrate with Standard EDTA',
        text: 'Standard EDTA (ethylenediaminetetraacetic acid) enters dropwise from the burette. EDTA ligands selectively chelate free Ca²⁺ and Mg²⁺ ions.'
      },
      {
        title: 'Detect Stoichiometric Endpoint',
        text: 'At the equivalence point, EDTA displaces EBT from the metal ions, forming colorless [M-EDTA]²⁻ and releasing free indicator, turning the solution sharply steel blue.'
      },
      {
        title: 'Calculate Total Hardness',
        text: 'Total hardness is calculated from the titre volume: Total Hardness (as CaCO₃) = (V_EDTA × M_EDTA × 100,000) / V_sample mg/L.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.sampleVolume <= 0) w.push('Sample volume must be greater than zero.');
      if (p.edtaMolarity <= 0) w.push('EDTA molarity must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const ca = Number(p.ca) || 0;
      const mg = Number(p.mg) || 0;
      const totalHardness = ca + mg;
      const sv = Number(p.sampleVolume) || 50;
      const m = Number(p.edtaMolarity) || 0.01;
      const reqTitre = (totalHardness * sv) / (m * 100000);
      const curTitre = Number(p.edtaVolume) || 0;
      const isEndpoint = curTitre >= reqTitre;

      return {
        formulas: [{
          name: 'Total Hardness (EDTA Titration)',
          formula: 'Total Hardness = (V_EDTA × M_EDTA × 100,000) / V_sample',
          given: `V_EDTA = ${curTitre.toFixed(1)} mL, M = ${m} M, V_sample = ${sv} mL`,
          calc: `(${curTitre.toFixed(1)} × ${m} × 100,000) / ${sv}`,
          result: `${totalHardness.toFixed(1)} mg/L as CaCO₃`,
          unit: 'mg/L as CaCO₃'
        }],
        readouts: [
          { label: 'Total Hardness', value: `${totalHardness.toFixed(0)} mg/L`, tone: 'blue' },
          { label: 'Required Titre', value: `${reqTitre.toFixed(2)} mL`, tone: 'amber' },
          { label: 'Added Titre', value: `${curTitre.toFixed(1)} mL`, tone: isEndpoint ? 'green' : 'blue' },
          { label: 'Indicator State', value: isEndpoint ? 'Blue (Free EBT)' : 'Wine Red ([M-EBT])', tone: isEndpoint ? 'green' : 'amber' }
        ],
        state: { totalHardness, reqTitre, curTitre, isEndpoint },
        explain: {
          what: 'EDTA forms a strong 1:1 hexadentate chelate with divalent calcium and magnesium ions at alkaline pH 10.',
          why: 'EBT binds weakly to Mg²⁺ giving wine red. As stronger EDTA binds all metal ions, free blue EBT is liberated at the endpoint.',
          param: 'Ca²⁺ and Mg²⁺ concentration',
          effect: `Current hardness of ${totalHardness} mg/L requires exactly ${reqTitre.toFixed(1)} mL of ${m} M EDTA for complete stoichiometric complexation.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const isMolecular = p.viewMode === 'Molecular Zoom';

      D.clear(g, '#f8fafc');

      // Title & Subtitle
      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Hardness of Water & EDTA Complexometric Titration', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Ca²⁺ = ${p.ca} mg/L · Mg²⁺ = ${p.mg} mg/L · EDTA = ${p.edtaMolarity} M`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, isMolecular ? 210 : 170, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.2, 'rgba(226, 232, 240, 0.65)');

      const totalHardness = (Number(p.ca) || 90) + (Number(p.mg) || 60);
      const reqTitre = (totalHardness * (Number(p.sampleVolume) || 50)) / ((Number(p.edtaMolarity) || 0.01) * 100000);
      const titrantAdded = Number(p.edtaVolume) || 0;
      const isAtOrPastEndpoint = step >= 4 || titrantAdded >= reqTitre;

      let flaskLiquidColor = '#bae6fd';
      let flaskAlpha = 0.65;
      if (step >= 2 && !isAtOrPastEndpoint) {
        flaskLiquidColor = '#9f1239'; // Wine red
        flaskAlpha = 0.85;
      } else if (step >= 4 || isAtOrPastEndpoint) {
        flaskLiquidColor = '#2563eb'; // Clear endpoint blue
        flaskAlpha = 0.85;
      }

      if (!isMolecular) {
        // Apparatus View
        const beakerPos = [-2.6, 0, -1.1];
        C3D.drawBeaker(g, P, beakerPos, 0.9, 1.8, 1.3, '#38bdf8', { scene, label: 'Raw Water Sample', liquidAlpha: 0.6 });

        const numCa = Math.min(10, Math.max(3, Math.round((Number(p.ca) || 90) / 25)));
        const numMg = Math.min(8, Math.max(2, Math.round((Number(p.mg) || 60) / 25)));

        for (let i = 0; i < numCa; i++) {
          const ang = i * 1.8 + time * 0.4;
          const rad = 0.2 + (i % 3) * 0.22;
          const zPos = -0.9 + 0.15 + (i % 4) * 0.26;
          const pos = [beakerPos[0] + rad * Math.cos(ang), beakerPos[1] + rad * Math.sin(ang), zPos];
          scene.add(P(pos).depth, (ctx) => { C3D.drawAtom(ctx, P, pos, 0.14, '#16a34a', 'Ca', '2+'); });
        }
        for (let i = 0; i < numMg; i++) {
          const ang = i * 2.3 + time * 0.35 + 1.2;
          const rad = 0.18 + (i % 3) * 0.24;
          const zPos = -0.9 + 0.25 + (i % 3) * 0.28;
          const pos = [beakerPos[0] + rad * Math.cos(ang), beakerPos[1] + rad * Math.sin(ang), zPos];
          scene.add(P(pos).depth, (ctx) => { C3D.drawAtom(ctx, P, pos, 0.13, '#9333ea', 'Mg', '2+'); });
        }

        const flaskPos = [0.4, 0, -1.1];
        const flaskLiqH = step >= 1 ? 1.0 : 0.05;
        C3D.drawFlask(g, P, flaskPos, 1.2, 0.35, 1.6, 0.7, flaskLiqH, flaskLiquidColor, { scene, liquidAlpha: flaskAlpha });

        if (step >= 1) {
          const inFlaskCa = Math.max(2, Math.round(numCa * 0.7));
          for (let i = 0; i < inFlaskCa; i++) {
            const ang = i * 1.9 + time * 0.5;
            const rad = 0.25 + (i % 3) * 0.25;
            const pos = [flaskPos[0] + rad * Math.cos(ang), flaskPos[1] + rad * Math.sin(ang), -0.8 + (i % 3) * 0.25];
            scene.add(P(pos).depth, (ctx) => {
              if (step < 4 && !isAtOrPastEndpoint) {
                C3D.drawAtom(ctx, P, pos, 0.13, step >= 2 ? '#e11d48' : '#16a34a', step >= 2 ? 'M-EBT' : 'Ca', step >= 2 ? '' : '2+');
              } else {
                C3D.drawAtom(ctx, P, pos, 0.14, '#0284c7', 'M-EDTA', '2-');
              }
            });
          }
        }

        const burettePos = [0.4, 0, 1.8];
        const buretteFrac = Math.max(0.08, 1 - (titrantAdded / 35));
        C3D.drawBurette(g, P, burettePos, 0.22, 2.6, buretteFrac, '#0ea5e9', { scene });

        const standBase = [-0.6, 0.5, -1.15];
        C3D.drawBox(g, P, standBase, [1.0, 0.7, 0.1], '#475569', { scene });
        C3D.drawCylinder(g, P, [-0.6, 0.5, -1.1], 0.06, 5.0, '#64748b', { scene });
        C3D.drawPipe(g, P, [-0.6, 0.5, 3.0], [0.4, 0, 3.0], 0.05, '#94a3b8', { scene });

        if (step === 3 || (step === 4 && !isAtOrPastEndpoint)) {
          const dropY = 1.8 - 0.75 - ((time * 4) % 1.2);
          const dropPos = [0.4, 0, dropY];
          scene.add(P(dropPos).depth, (ctx) => { C3D.drawDroplet(ctx, P, dropPos, 0.07, '#0ea5e9'); });
        }

        scene.add(P([-2.6, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-2.6, 0, 0.8], 'Raw Hard Water', '#0284c7', -24); });
        scene.add(P([0.4, 0, 4.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.4, 0, 4.5], `EDTA Burette (${titrantAdded.toFixed(1)} mL)`, '#0369a1', -24); });
        scene.add(P([0.4, 0, 0.6]).depth, (ctx) => {
          const stateLabel = step < 2 ? 'Titration Flask' : isAtOrPastEndpoint ? 'Endpoint Reached (Steel Blue)' : 'Sample + EBT (Wine Red)';
          C3D.drawTag(ctx, P, [0.4, 0, 0.6], stateLabel, isAtOrPastEndpoint ? '#1d4ed8' : step >= 2 ? '#9f1239' : '#047857', -24);
        });

      } else {
        // Molecular Zoom View
        const mPos = [0, 0, 0];
        const isComplexed = step >= 3;
        const metalColor = isAtOrPastEndpoint ? '#0284c7' : step >= 2 ? '#e11d48' : '#16a34a';

        scene.add(P(mPos).depth, (ctx) => { C3D.drawAtom(ctx, P, mPos, 0.52, metalColor, 'Ca', '2+'); });

        const ligandAngles = [
          [0.9, 0, 0.4], [-0.9, 0, 0.4],
          [0, 0.9, -0.4], [0, -0.9, -0.4],
          [0.6, 0.6, -0.6], [-0.6, -0.6, 0.6]
        ];

        ligandAngles.forEach((coord, i) => {
          const lPos = V.mul(coord, isComplexed ? 1.0 : 1.8 + Math.sin(time + i) * 0.2);
          const atomType = i < 2 ? 'N' : 'O';
          const atomCol = i < 2 ? '#2563eb' : '#dc2626';

          scene.add(P(lPos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, lPos, 0.22, atomCol, atomType, i < 2 ? '' : '-');
            if (isComplexed) {
              const p1 = P(mPos), p2 = P(lPos);
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2.5;
              ctx.setLineDash([4, 3]);
              ctx.stroke();
              ctx.restore();
            }
          });
        });

        for (let w = 0; w < 6; w++) {
          const ang = w * 1.05 + time * 0.25;
          const dist = 2.4 + (w % 2) * 0.4;
          const wPos = [dist * Math.cos(ang), dist * Math.sin(ang), -0.6 + (w % 3) * 0.5];
          scene.add(P(wPos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, wPos, 0.18, '#dc2626', 'O', 'δ-');
            C3D.drawAtom(ctx, P, V.add(wPos, [0.22, 0, 0.16]), 0.11, '#ffffff', 'H', 'δ+');
            C3D.drawAtom(ctx, P, V.add(wPos, [-0.22, 0, 0.16]), 0.11, '#ffffff', 'H', 'δ+');
          });
        }

        scene.add(P([0, 0, 1.6]).depth, (ctx) => {
          const text = isAtOrPastEndpoint ? 'Stable Hexadentate [Ca-EDTA]²⁻ Chelate Complex' : step >= 2 ? 'Unstable Wine-Red [Ca-EBT] Metal-Dye Complex' : 'Hydrated Ca²⁺ / Mg²⁺ Ions in Solution';
          C3D.drawTag(ctx, P, [0, 0, 1.4], text, '#0f172a', -26);
        });
      }

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Ca²⁺ Calcium Ion', color: '#16a34a', symbol: true },
        { label: 'Mg²⁺ Magnesium Ion', color: '#9333ea', symbol: true },
        { label: 'EDTA⁴⁻ Titrant', color: '#0ea5e9', symbol: true },
        { label: '[M-EBT] Wine Red Complex', color: '#9f1239', symbol: true },
        { label: 'Free EBT Steel Blue Dye', color: '#2563eb', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 02 — Lime-Soda Water Softening Simulator (chem-lime-soda)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lime-soda'] = {
    view3d: true,
    initialView: { yaw: -0.52, pitch: 0.35, zoom: 0.95, panX: 0, panY: 20 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('hardness', 'Raw water hardness', 50, 500, 10, 260, 'mg/L'),
      r('limeDose', 'Lime Ca(OH)₂ dose', 0, 400, 10, 180, 'mg/L'),
      r('sodaDose', 'Soda ash Na₂CO₃ dose', 0, 400, 10, 140, 'mg/L'),
      r('mixing', 'Mixing impeller speed', 20, 150, 5, 75, 'rpm'),
      r('settling', 'Settling retention time', 5, 60, 5, 30, 'min')
    ],
    steps: () => [
      {
        title: 'Raw Water Inflow',
        text: 'Hard water enters the plant containing dissolved Ca²⁺ (green) and Mg²⁺ (purple) ions along with carbonate and non-carbonate hardness.'
      },
      {
        title: 'Lime Ca(OH)₂ Dosing & Rapid Mixing',
        text: 'Hydrated lime Ca(OH)₂ is injected into the rapid mix chamber. Lime precipitates bicarbonate hardness as CaCO₃↓ and converts Mg²⁺ into Mg(OH)₂↓.'
      },
      {
        title: 'Soda Ash Na₂CO₃ Addition',
        text: 'Soda ash Na₂CO₃ is added to precipitate non-carbonate calcium hardness: Ca²⁺ + CO₃²⁻ → CaCO₃↓.'
      },
      {
        title: 'Flocculation Zone Agglomeration',
        text: 'Slow paddle mixers roll the slurry gently, causing colloidal micro-precipitates to collide and aggregate into large, heavy, visible flocs.'
      },
      {
        title: 'Clarifier Sedimentation & Sludge',
        text: 'Water flows into the hopper-bottom clarifier. Heavy flocs settle under gravity, forming a dense sludge blanket at the bottom.'
      },
      {
        title: 'Clarified Softened Water Collection',
        text: 'Crystal-clear softened water overflows the radial V-notch weirs into the clean effluent channel, achieving the calculated hardness reduction.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.hardness <= 0) w.push('Raw hardness must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const raw = Number(p.hardness) || 260;
      const lime = Number(p.limeDose) || 180;
      const soda = Number(p.sodaDose) || 140;
      // Stoichiometric removal model
      const removed = Math.min(raw, lime * 0.72 + soda * 0.66);
      const residual = Math.max(15, raw - removed); // realistic residual hardness limit ~15 mg/L
      const solids = removed * 1.05; // mg/L dry sludge solids

      return {
        formulas: [{
          name: 'Lime-Soda Softening Model',
          formula: 'Residual Hardness = Raw Hardness − (0.72 × Lime + 0.66 × Soda)',
          given: `Raw = ${raw} mg/L, Lime = ${lime} mg/L, Soda = ${soda} mg/L`,
          calc: `${raw} − (${(lime * 0.72).toFixed(1)} + ${(soda * 0.66).toFixed(1)})`,
          result: `${residual.toFixed(1)} mg/L residual`,
          unit: 'mg/L residual'
        }],
        readouts: [
          { label: 'Raw Hardness', value: `${raw} mg/L`, tone: 'amber' },
          { label: 'Precipitated Solids', value: `${solids.toFixed(1)} mg/L`, tone: 'blue' },
          { label: 'Residual Hardness', value: `${residual.toFixed(1)} mg/L`, tone: residual < 60 ? 'green' : 'amber' },
          { label: 'Softening Efficiency', value: `${((1 - residual / raw) * 100).toFixed(1)}%`, tone: 'green' }
        ],
        state: { raw, lime, soda, removed, residual, solids },
        explain: {
          what: 'Lime precipitates carbonate hardness and magnesium; soda ash removes non-carbonate calcium hardness as insoluble calcium carbonate.',
          why: 'CaCO₃ has low solubility (~15 mg/L at 25°C), while Mg(OH)₂ precipitates at pH > 10.5.',
          param: 'Chemical dosage and settling time',
          effect: `With ${lime} mg/L lime and ${soda} mg/L soda ash, raw hardness drops from ${raw} mg/L to ${residual.toFixed(1)} mg/L.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Lime-Soda Water Softening Process Plant', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Raw = ${p.hardness} mg/L · Lime = ${p.limeDose} mg/L · Soda = ${p.sodaDose} mg/L`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 140, 10);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 7, 1, -1.5, 'rgba(226, 232, 240, 0.65)');

      // 1. Raw water inlet pipe on left
      C3D.drawPipe(g, P, [-4.5, 0, 0.8], [-3.2, 0, 0.8], 0.14, '#0ea5e9', { scene, flow: true, t: time, speed: 2 });

      // 2. Chemical Dosing Tanks (Lime & Soda Ash)
      // Lime tank (milky white)
      C3D.drawCylinder(g, P, [-3.0, 1.8, -0.4], 0.55, 1.4, '#e2e8f0', { scene, alpha: 0.9, topCap: true });
      C3D.drawPipe(g, P, [-3.0, 1.8, 0.2], [-2.3, 0.2, 0.7], 0.07, '#f8fafc', { scene, flow: step >= 1, t: time, flowColor: '#ffffff' });

      // Soda ash tank (light amber)
      C3D.drawCylinder(g, P, [-1.7, 1.8, -0.4], 0.55, 1.4, '#fef08a', { scene, alpha: 0.9, topCap: true });
      C3D.drawPipe(g, P, [-1.7, 1.8, 0.2], [-1.9, 0.2, 0.7], 0.07, '#fef08a', { scene, flow: step >= 2, t: time, flowColor: '#fef08a' });

      // 3. Rapid Flash Mixing Tank (Cylinder)
      const mixerPos = [-2.2, 0, -1.2];
      const mixSpeed = (Number(p.mixing) || 75) * 0.05;
      C3D.drawCylinder(g, P, mixerPos, 0.85, 2.0, '#38bdf8', { scene, alpha: 0.55, topCap: true });
      // Rapid mixer impeller
      C3D.drawPaddle(g, P, [-2.2, 0, -1.1], 2.2, 0.45, 0.2, time * mixSpeed, '#334155', { scene, blades: 3 });

      // 4. Connecting flume to Flocculation Basin
      C3D.drawPipe(g, P, [-1.35, 0, 0.4], [-0.8, 0, 0.4], 0.12, '#38bdf8', { scene, flow: true, t: time });

      // 5. Flocculation Basin (Rectangular box with dual slow paddle wheels)
      const flocBoxPos = [0.1, 0, -0.3];
      C3D.drawBox(g, P, flocBoxPos, [1.8, 1.4, 1.8], '#bae6fd', { scene, alpha: 0.45, stroke: '#0284c7' });
      // Dual slow paddle wheels
      C3D.drawPaddle(g, P, [-0.4, 0, -1.1], 1.9, 0.4, 0.35, time * 1.2, '#64748b', { scene, blades: 4 });
      C3D.drawPaddle(g, P, [0.6, 0, -1.1], 1.9, 0.4, 0.35, time * 1.2 + 0.8, '#64748b', { scene, blades: 4 });

      // 6. Floc particles in flocculation basin if step >= 3
      if (step >= 2) {
        const flocCount = 14;
        for (let i = 0; i < flocCount; i++) {
          const fx = -0.6 + ((i * 0.27 + time * 0.15) % 1.4);
          const fy = -0.4 + ((i * 0.31) % 0.8);
          const fz = -0.8 + ((i * 0.23 + Math.sin(time + i) * 0.1) % 1.0);
          const fSize = step >= 3 ? 0.09 : 0.05;
          scene.add(P([fx, fy, fz]).depth, (ctx) => {
            C3D.drawSphere(ctx, P, [fx, fy, fz], fSize, '#ffffff', { stroke: '#94a3b8' });
          });
        }
      }

      // 7. Connecting flume to Clarifier
      C3D.drawPipe(g, P, [1.0, 0, 0.3], [1.7, 0, 0.3], 0.12, '#38bdf8', { scene, flow: true, t: time });

      // 8. Sedimentation Clarifier Hopper (Circular basin with conical base)
      const clarifierPos = [2.7, 0, -0.2];
      C3D.drawCylinder(g, P, clarifierPos, 1.2, 1.5, '#7dd3fc', { scene, alpha: 0.4, topCap: true });
      // Conical sludge hopper cone underneath
      C3D.drawCylinder(g, P, [2.7, 0, -1.4], 0.5, 1.2, '#94a3b8', { scene, alpha: 0.75, topCap: false, bottomCap: true });

      // Sludge blanket accumulation at the bottom of clarifier (Step >= 4)
      if (step >= 4) {
        const sludgeH = 0.55;
        C3D.drawCylinder(g, P, [2.7, 0, -1.4], 0.48, sludgeH, '#cbd5e1', { scene, alpha: 0.9, topCap: true });
      }

      // Settling flocs drifting down in clarifier
      if (step >= 3) {
        for (let i = 0; i < 10; i++) {
          const sx = 2.2 + ((i * 0.21) % 1.0);
          const sy = -0.4 + ((i * 0.29) % 0.8);
          const sz = 1.0 - ((time * 0.4 + i * 0.3) % 2.0);
          if (sz > -1.2) {
            scene.add(P([sx, sy, sz]).depth, (ctx) => {
              C3D.drawSphere(ctx, P, [sx, sy, sz], 0.08, '#ffffff', { stroke: '#64748b' });
            });
          }
        }
      }

      // 9. Softened clarified water outlet pipe on right
      C3D.drawPipe(g, P, [3.9, 0, 0.9], [5.0, 0, 0.9], 0.14, '#0284c7', { scene, flow: true, t: time, speed: 2 });

      // Tags identifying units
      scene.add(P([-3.0, 1.8, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-3.0, 1.8, 1.2], 'Lime Ca(OH)₂ Tank', '#475569', -22); });
      scene.add(P([-1.7, 1.8, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.7, 1.8, 1.2], 'Soda Ash Na₂CO₃', '#ca8a04', -22); });
      scene.add(P([-2.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-2.2, 0, 1.1], 'Flash Mixer', '#0284c7', -22); });
      scene.add(P([0.1, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.1, 0, 0.9], 'Flocculation Zone', '#0369a1', -22); });
      scene.add(P([2.7, 0, 1.7]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.7, 0, 1.5], 'Clarifier Hopper & Sludge', '#0f766e', -22); });
      scene.add(P([4.6, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [4.6, 0, 1.1], 'Softened Water Outlet', '#15803d', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Raw Hard Water Inflow', color: '#0ea5e9' },
        { label: 'Lime Ca(OH)₂ Stream', color: '#f8fafc' },
        { label: 'Soda Ash Na₂CO₃ Stream', color: '#fef08a' },
        { label: 'CaCO₃ / Mg(OH)₂ Flocs', color: '#ffffff' },
        { label: 'Settled Sludge Blanket', color: '#94a3b8' },
        { label: 'Softened Effluent', color: '#0284c7' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 03 — Ion Exchange / Demineralization Simulator (chem-ion-exchange)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-ion-exchange'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('tds', 'Feed TDS concentration', 100, 2000, 50, 850, 'mg/L'),
      r('flowRate', 'Feed flow rate', 1, 50, 1, 15, 'L/min'),
      r('cationEfficiency', 'Cation resin efficiency', 0, 100, 1, 95, '%'),
      r('anionEfficiency', 'Anion resin efficiency', 0, 100, 1, 90, '%'),
      r('regeneration', 'Regeneration progress', 0, 100, 5, 0, '%')
    ],
    steps: () => [
      {
        title: 'Introduce Raw Mineral Water',
        text: 'Feed water containing multivalent cations (Ca²⁺ green, Mg²⁺ purple, Na⁺ yellow) and anions (Cl⁻ mint, SO₄²⁻ orange) enters through the top distributor.'
      },
      {
        title: 'Cation Exchange (R-H⁺ Column)',
        text: 'Water flows down through acidic cation resin beads (R-H⁺). Resin binds Ca²⁺, Mg²⁺, and Na⁺ tightly, releasing equivalent H⁺ protons: 2R-H + Ca²⁺ → R₂Ca + 2H⁺.'
      },
      {
        title: 'Anion Exchange (R-OH⁻ Column)',
        text: 'Acidic water passes through basic anion resin beads (R-OH⁻). Resin retains Cl⁻ and SO₄²⁻, releasing equivalent OH⁻ hydroxide ions: R-OH + Cl⁻ → R-Cl + OH⁻.'
      },
      {
        title: 'H⁺ & OH⁻ Water Neutralization',
        text: 'Released H⁺ and OH⁻ ions instantly neutralize and combine into pure water molecules: H⁺ + OH⁻ → H₂O.'
      },
      {
        title: 'Collect Demineralized Water',
        text: 'Ultra-pure demineralized water exits the system. Digital conductivity drops to < 0.1 µS/cm and dissolved solids drop near 0 mg/L.'
      },
      {
        title: 'Resin Exhaustion & Regeneration',
        text: 'When exchange capacity is exhausted, breakthrough occurs. Acid (HCl) regenerates cation resin and base (NaOH) regenerates anion resin back to H⁺ and OH⁻ form.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.tds <= 0) w.push('Feed TDS must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const tds = Number(p.tds) || 850;
      const cEff = Number(p.cationEfficiency) || 95;
      const aEff = Number(p.anionEfficiency) || 90;
      const reg = Number(p.regeneration) || 0;
      const effectiveRemoval = (cEff / 100) * (aEff / 100);
      const productTds = Math.max(0.5, tds * (1 - effectiveRemoval));
      const conductivity = productTds * 1.5; // microSiemens/cm approx

      return {
        formulas: [{
          name: 'Two-Bed Demineralization Model',
          formula: 'TDS_out = TDS_in × (1 − η_cat) × (1 − η_an)',
          given: `TDS_in = ${tds} mg/L, η_cat = ${cEff}%, η_an = ${aEff}%`,
          calc: `${tds} × (1 − ${(cEff / 100).toFixed(2)}) × (1 − ${(aEff / 100).toFixed(2)})`,
          result: `${productTds.toFixed(1)} mg/L product TDS`,
          unit: 'mg/L TDS'
        }],
        readouts: [
          { label: 'Feed TDS', value: `${tds} mg/L`, tone: 'amber' },
          { label: 'Product TDS', value: `${productTds.toFixed(1)} mg/L`, tone: 'blue' },
          { label: 'Conductivity', value: `${conductivity.toFixed(1)} µS/cm`, tone: conductivity < 10 ? 'green' : 'amber' },
          { label: 'Resin Status', value: reg > 0 ? `Regeneration (${reg}%)` : 'Active Demineralization', tone: reg > 0 ? 'amber' : 'green' }
        ],
        state: { tds, productTds, conductivity, reg },
        explain: {
          what: 'Two-bed demineralizer: Cation resin exchanges metal cations for H⁺; Anion resin exchanges anions for OH⁻; H⁺ + OH⁻ → H₂O.',
          why: 'The product contains virtually zero mineral ions, exhibiting extremely low electrical conductivity (< 1 µS/cm).',
          param: 'Resin removal efficiency and feed TDS',
          effect: `With ${cEff}% cation and ${aEff}% anion efficiency, product TDS is reduced from ${tds} to ${productTds.toFixed(1)} mg/L.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const isRegen = (Number(p.regeneration) || 0) > 0 || step === 5;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Ion Exchange / Demineralization Process', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Feed TDS = ${p.tds} mg/L · Cation = ${p.cationEfficiency}% · Anion = ${p.anionEfficiency}%`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 160, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.3, 'rgba(226, 232, 240, 0.65)');

      // 1. Cation Column on Left (Amberlite Sulfonic Acid resin, golden amber beads)
      const catColPos = [-1.6, 0, -1.2];
      C3D.drawCylinder(g, P, catColPos, 0.75, 3.2, '#fed7aa', { scene, alpha: 0.25, topCap: true, bottomCap: true, stroke: '#f97316' });

      // Packed spherical cation resin beads
      const numBeads = 32;
      for (let i = 0; i < numBeads; i++) {
        const bx = -1.6 + ((i * 0.23) % 0.9) - 0.45;
        const by = ((i * 0.31) % 0.8) - 0.4;
        const bz = -1.0 + (i * 0.08);
        scene.add(P([bx, by, bz]).depth, (ctx) => {
          C3D.drawSphere(ctx, P, [bx, by, bz], 0.12, isRegen ? '#ea580c' : '#f59e0b', { stroke: '#c2410c' });
        });
      }

      // 2. Anion Column on Right (Quaternary Ammonium resin, ivory/light blue beads)
      const anColPos = [1.6, 0, -1.2];
      C3D.drawCylinder(g, P, anColPos, 0.75, 3.2, '#bae6fd', { scene, alpha: 0.25, topCap: true, bottomCap: true, stroke: '#0284c7' });

      for (let i = 0; i < numBeads; i++) {
        const bx = 1.6 + ((i * 0.23) % 0.9) - 0.45;
        const by = ((i * 0.31) % 0.8) - 0.4;
        const bz = -1.0 + (i * 0.08);
        scene.add(P([bx, by, bz]).depth, (ctx) => {
          C3D.drawSphere(ctx, P, [bx, by, bz], 0.12, isRegen ? '#0284c7' : '#e0f2fe', { stroke: '#0369a1' });
        });
      }

      // 3. Piping Network
      // Raw water inlet to top of cation column
      C3D.drawPipe(g, P, [-3.2, 0, 2.3], [-1.6, 0, 2.3], 0.1, '#0ea5e9', { scene, flow: !isRegen, t: time });
      // Connecting pipe: bottom of cation column to top of anion column
      C3D.drawPipe(g, P, [-1.6, 0, -1.1], [-1.6, 0, -1.3], 0.1, '#38bdf8', { scene });
      C3D.drawPipe(g, P, [-1.6, 0, -1.3], [0, 0, -1.3], 0.1, '#ef4444', { scene, flow: !isRegen, t: time, flowColor: '#ef4444' });
      C3D.drawPipe(g, P, [0, 0, -1.3], [1.6, 0, -1.3], 0.1, '#38bdf8', { scene });
      C3D.drawPipe(g, P, [1.6, 0, -1.3], [1.6, 0, -1.1], 0.1, '#38bdf8', { scene });
      C3D.drawPipe(g, P, [1.6, 0, 2.3], [3.2, 0, 2.3], 0.1, '#0284c7', { scene, flow: !isRegen, t: time, flowColor: '#ffffff' });

      // Demineralized product water collection at bottom of anion column
      C3D.drawPipe(g, P, [1.6, 0, -1.1], [3.4, 0, -1.1], 0.12, '#06b6d4', { scene, flow: !isRegen, t: time, flowColor: '#ffffff' });

      // 4. Moving Ions Animation
      if (!isRegen) {
        // Entering Cations in raw stream (Ca2+ green, Mg2+ purple, Na+ yellow)
        for (let i = 0; i < 4; i++) {
          const tNorm = ((time * 0.8 + i * 0.25) % 1);
          const pos = V.lerp([-3.0, 0, 2.3], [-1.6, 0, 2.3 - tNorm * 3.0], tNorm);
          scene.add(P(pos).depth, (ctx) => {
            const sym = i % 3 === 0 ? 'Ca' : i % 3 === 1 ? 'Mg' : 'Na';
            const col = i % 3 === 0 ? '#16a34a' : i % 3 === 1 ? '#9333ea' : '#eab308';
            C3D.drawAtom(ctx, P, pos, 0.12, col, sym, sym === 'Na' ? '+' : '2+');
          });
        }

        // Released H+ ions (tiny glowing red particles) exiting cation bed
        for (let i = 0; i < 5; i++) {
          const tNorm = ((time * 1.5 + i * 0.2) % 1);
          const hPos = [-1.6 + tNorm * 3.2, 0, -1.3];
          scene.add(P(hPos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, hPos, 0.08, '#ef4444', 'H', '+');
          });
        }

        // Released OH- ions (tiny glowing cyan particles) in anion bed
        for (let i = 0; i < 5; i++) {
          const tNorm = ((time * 1.5 + i * 0.2) % 1);
          const ohPos = [1.6, 0, 1.8 - tNorm * 2.6];
          scene.add(P(ohPos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, ohPos, 0.09, '#06b6d4', 'OH', '-');
          });
        }

        // Neutralized H2O synthesis droplet at product exit
        for (let i = 0; i < 4; i++) {
          const tNorm = ((time * 1.2 + i * 0.25) % 1);
          const wPos = [1.6 + tNorm * 1.7, 0, -1.1];
          scene.add(P(wPos).depth, (ctx) => {
            C3D.drawSphere(ctx, P, wPos, 0.11, '#38bdf8', { stroke: '#0284c7' });
          });
        }
      } else {
        // Regeneration mode: HCl wash into cation bed, NaOH wash into anion bed
        scene.add(P([-1.6, 0, 2.7]).depth, (ctx) => {
          C3D.drawTag(ctx, P, [-1.6, 0, 2.5], 'Dilute HCl Acid Regeneration', '#dc2626', -24);
        });
        scene.add(P([1.6, 0, 2.7]).depth, (ctx) => {
          C3D.drawTag(ctx, P, [1.6, 0, 2.5], 'Dilute NaOH Base Regeneration', '#2563eb', -24);
        });
      }

      // Conductivity Meter Readout Box
      const condVal = st.c && st.c.state ? st.c.state.conductivity : 0.08;
      C3D.drawVoltmeter(g, P, [3.2, 0, 0.4], 1.0, condVal, 10, {
        scene,
        label: 'CONDUCTIVITY (µS/cm)',
        decimals: 2
      });

      // Tags identifying columns
      scene.add(P([-1.6, 0, 2.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.6, 0, 2.1], 'Cation Column (R-H⁺)', '#ea580c', -24); });
      scene.add(P([1.6, 0, 2.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.6, 0, 2.1], 'Anion Column (R-OH⁻)', '#0284c7', -24); });
      scene.add(P([3.2, 0, -1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [3.2, 0, -1.1], 'Demineralized H₂O', '#059669', -24); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Ca²⁺ / Mg²⁺ Hardness Cations', color: '#16a34a', symbol: true },
        { label: 'Na⁺ Sodium Cation', color: '#eab308', symbol: true },
        { label: 'Cl⁻ Chloride Anion', color: '#10b981', symbol: true },
        { label: 'H⁺ Proton (Released)', color: '#ef4444', symbol: true },
        { label: 'OH⁻ Hydroxide (Released)', color: '#06b6d4', symbol: true },
        { label: 'Pure H₂O Product', color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 04 — Municipal Water Treatment Plant Simulator (chem-municipal-treatment)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-municipal-treatment'] = {
    view3d: true,
    initialView: { yaw: -0.58, pitch: 0.32, zoom: 0.88, panX: 0, panY: 25 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('turbidity', 'Raw river turbidity', 5, 200, 5, 90, 'NTU'),
      r('alum', 'Alum coagulant dose', 0, 80, 2, 35, 'mg/L'),
      r('chlorine', 'Chlorine disinfectant dose', 0, 10, 0.2, 2.5, 'mg/L'),
      r('settlingTime', 'Clarifier retention time', 10, 60, 5, 30, 'min'),
      r('filterCondition', 'Sand filter loading', 0, 100, 5, 20, '%')
    ],
    steps: () => [
      {
        title: 'Raw Water Intake & Bar Screening',
        text: 'River water containing floating debris and suspended silt is pumped into the headworks. Coarse bar screens trap branches and large debris.'
      },
      {
        title: 'Cascade Aeration Unit',
        text: 'Water cascades over stepped concrete aeration weirs, stripping foul volatile gases (H₂S) and oxidizing ferrous iron to insoluble ferric hydroxide.'
      },
      {
        title: 'Coagulation Flash Mixing',
        text: 'Alum Al₂(SO₄)₃·18H₂O is dosed into a high-shear flash mixing tank. Positively charged aluminum complexes neutralize negative colloidal charges in 30–60 seconds.'
      },
      {
        title: 'Flocculation Paddle Basins',
        text: 'Slow horizontal paddle flocculators gently agitate the destabilized colloids, building heavy settleable pin-head flocs.'
      },
      {
        title: 'Primary Sedimentation Basin',
        text: 'Water enters a large clarifier. Heavy flocs settle to the floor while a rotating scraper draws sludge into a hopper; clear water overflows weirs.'
      },
      {
        title: 'Rapid Sand Filtration Bed',
        text: 'Clarified water percolates down through multi-layer anthracite, sand, and gravel media, filtering residual turbidity down to < 0.3 NTU.'
      },
      {
        title: 'Chlorine Disinfection Contact Basin',
        text: 'Chlorine is injected into a serpentine baffled contact chamber, ensuring > 30 minutes of contact time to destroy pathogenic microbes and viruses.'
      },
      {
        title: 'Clearwell Storage & Distribution',
        text: 'Pure, safe drinking water enters the underground clearwell reservoir. High-service pumps supply the city distribution network.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.turbidity <= 0) w.push('Raw turbidity must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const turb = Number(p.turbidity) || 90;
      const alum = Number(p.alum) || 35;
      const cl = Number(p.chlorine) || 2.5;
      const sTime = Number(p.settlingTime) || 30;

      // Realistic removal cascade
      const coagRem = Math.min(0.9, 0.4 + (alum / 120));
      const clarRem = Math.min(0.95, 0.7 + (sTime / 150));
      const filtTurb = Math.max(0.15, turb * (1 - coagRem) * (1 - clarRem));
      const disinfEfficacy = Math.min(99.99, 100 * (1 - Math.exp(-cl * 1.4)));
      const resCl = Math.max(0, cl - 1.2); // residual after chlorine demand

      return {
        formulas: [{
          name: 'Municipal Water Quality Cascade',
          formula: 'Turbidity_out = Turbidity_in × (1 − η_coag) × (1 − η_settle) × (1 − η_filt)',
          given: `Turb_in = ${turb} NTU, Alum = ${alum} mg/L, Settling = ${sTime} min`,
          calc: `${turb} NTU → Clarified → Filtered`,
          result: `${filtTurb.toFixed(2)} NTU (Potable Standard < 1.0 NTU)`,
          unit: 'NTU'
        }],
        readouts: [
          { label: 'Raw Turbidity', value: `${turb} NTU`, tone: 'amber' },
          { label: 'Product Turbidity', value: `${filtTurb.toFixed(2)} NTU`, tone: 'green' },
          { label: 'Coliform Reduction', value: `${disinfEfficacy.toFixed(2)}%`, tone: 'green' },
          { label: 'Residual Chlorine', value: `${resCl.toFixed(2)} mg/L`, tone: resCl >= 0.2 ? 'blue' : 'amber' }
        ],
        state: { turb, filtTurb, disinfEfficacy, resCl },
        explain: {
          what: 'Comprehensive municipal treatment train: Intake → Aeration → Coagulation → Flocculation → Sedimentation → Filtration → Disinfection.',
          why: 'Multi-barrier treatment ensures complete physical removal of suspended solids followed by chemical disinfection of pathogens.',
          param: 'Alum coagulant and chlorine dosage',
          effect: `Alum dose of ${alum} mg/L and chlorine of ${cl} mg/L reduce raw turbidity from ${turb} NTU to ${filtTurb.toFixed(2)} NTU with ${disinfEfficacy.toFixed(1)}% microbial destruction.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Complete Municipal Water Treatment Plant', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 8 · Raw Turbidity = ${p.turbidity} NTU · Alum = ${p.alum} mg/L · Chlorine = ${p.chlorine} mg/L`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 115, 12);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 8, 1, -1.6, 'rgba(226, 232, 240, 0.65)');

      // 1. Raw water intake well on far left
      C3D.drawCylinder(g, P, [-5.2, 0, -1.2], 0.7, 1.8, '#b45309', { scene, alpha: 0.6, topCap: true });
      C3D.drawPipe(g, P, [-6.2, 0, 0.4], [-5.2, 0, 0.4], 0.12, '#92400e', { scene, flow: true, t: time });

      // 2. Bar screen chamber & Cascade aeration steps
      C3D.drawBox(g, P, [-4.0, 0, -0.6], [1.2, 1.0, 1.2], '#cbd5e1', { scene, stroke: '#64748b' });
      // Aeration steps
      C3D.drawBox(g, P, [-3.2, 0, -0.8], [0.6, 0.9, 0.8], '#e2e8f0', { scene });
      C3D.drawBox(g, P, [-2.7, 0, -1.1], [0.6, 0.9, 0.6], '#e2e8f0', { scene });

      // 3. Rapid Mix Coagulation Basin (with Alum dosing tube)
      C3D.drawCylinder(g, P, [-1.8, 0, -1.2], 0.65, 1.8, '#38bdf8', { scene, alpha: 0.55, topCap: true });
      C3D.drawPaddle(g, P, [-1.8, 0, -1.1], 1.9, 0.35, 0.18, time * 6.0, '#334155', { scene, blades: 2 });
      C3D.drawPipe(g, P, [-1.8, 1.2, 1.2], [-1.8, 0, 0.5], 0.06, '#ffffff', { scene, flow: step >= 2, t: time, flowColor: '#ffffff' });

      // 4. Flocculation Basin with Dual Rotating Paddles
      C3D.drawBox(g, P, [-0.4, 0, -0.6], [1.6, 1.2, 1.4], '#bae6fd', { scene, alpha: 0.45, stroke: '#0284c7' });
      C3D.drawPaddle(g, P, [-0.8, 0, -1.2], 1.6, 0.35, 0.3, time * 1.5, '#64748b', { scene, blades: 4 });
      C3D.drawPaddle(g, P, [0.0, 0, -1.2], 1.6, 0.35, 0.3, time * 1.5 + 0.9, '#64748b', { scene, blades: 4 });

      // 5. Sedimentation Clarifier Basin with Sludge Hopper
      C3D.drawCylinder(g, P, [1.6, 0, -0.6], 1.1, 1.4, '#7dd3fc', { scene, alpha: 0.45, topCap: true });
      C3D.drawCylinder(g, P, [1.6, 0, -1.5], 0.45, 0.9, '#94a3b8', { scene, alpha: 0.85, topCap: false, bottomCap: true });
      // Scraper bridge
      C3D.drawPipe(g, P, [0.6, 0, 0.85], [2.6, 0, 0.85], 0.08, '#475569', { scene });

      // 6. Rapid Sand Filter Bed (with cutaway layers)
      C3D.drawBox(g, P, [3.3, 0, -0.7], [1.4, 1.2, 1.4], '#fef08a', { scene, alpha: 0.45, stroke: '#ca8a04' });
      // Sand media layers inside
      C3D.drawBox(g, P, [3.3, 0, -0.9], [1.3, 1.1, 0.4], '#d97706', { scene, alpha: 0.7 });
      C3D.drawBox(g, P, [3.3, 0, -1.3], [1.3, 1.1, 0.4], '#78716c', { scene, alpha: 0.85 });

      // 7. Serpentine Chlorine Disinfection Contact Basin
      C3D.drawBox(g, P, [4.8, 0, -0.8], [1.2, 1.4, 1.2], '#bae6fd', { scene, alpha: 0.55, stroke: '#0891b2' });
      // Baffles
      C3D.drawBox(g, P, [4.6, 0.2, -0.8], [0.1, 0.9, 1.0], '#94a3b8', { scene });
      C3D.drawBox(g, P, [5.0, -0.2, -0.8], [0.1, 0.9, 1.0], '#94a3b8', { scene });

      // 8. Treated Clean Water Clearwell Reservoir
      C3D.drawBox(g, P, [6.2, 0, -0.9], [1.2, 1.2, 1.1], '#38bdf8', { scene, alpha: 0.65, stroke: '#0284c7' });
      C3D.drawPipe(g, P, [6.8, 0, -0.4], [7.6, 0, -0.4], 0.12, '#0284c7', { scene, flow: true, t: time, speed: 2.2 });

      // Inter-connecting pipes
      C3D.drawPipe(g, P, [-4.0, 0, 0.0], [-2.4, 0, 0.0], 0.1, '#0ea5e9', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [-1.2, 0, 0.0], [-1.0, 0, 0.0], 0.1, '#38bdf8', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [0.4, 0, 0.0], [0.8, 0, 0.0], 0.1, '#38bdf8', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [2.4, 0, 0.1], [2.7, 0, 0.1], 0.1, '#0284c7', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [4.0, 0, -0.2], [4.3, 0, -0.2], 0.1, '#0284c7', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [5.4, 0, -0.3], [5.7, 0, -0.3], 0.1, '#0284c7', { scene, flow: true, t: time });

      // Tags identifying stages
      scene.add(P([-5.2, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [-5.2, 0, 0.8], 'Intake & Screen', '#78350f', -20); });
      scene.add(P([-1.8, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.8, 0, 0.8], 'Flash Mix (Alum)', '#0369a1', -20); });
      scene.add(P([1.6, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.6, 0, 0.9], 'Clarifier Clarification', '#0f766e', -20); });
      scene.add(P([3.3, 0, 0.9]).depth, (ctx) => { C3D.drawTag(ctx, P, [3.3, 0, 0.7], 'Sand Filter Bed', '#b45309', -20); });
      scene.add(P([4.8, 0, 0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [4.8, 0, 0.6], 'Chlorine Contact Tank', '#0e7490', -20); });
      scene.add(P([6.2, 0, 0.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [6.2, 0, 0.4], 'Clearwell Reservoir', '#15803d', -20); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Raw Turbid Water', color: '#b45309' },
        { label: 'Alum Dosing Stream', color: '#ffffff' },
        { label: 'Flocculation Flakes', color: '#fcd34d' },
        { label: 'Settled Sludge Layer', color: '#94a3b8' },
        { label: 'Filter Sand & Gravel', color: '#d97706' },
        { label: 'Pure Disinfected Water', color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 05 — Sand Filtration Simulator (chem-sand-filtration)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-sand-filtration'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('turbidity', 'Influent turbidity', 5, 200, 5, 75, 'NTU'),
      r('depth', 'Sand bed depth', 10, 100, 5, 55, 'cm'),
      r('flow', 'Filtration flow velocity', 1, 30, 1, 12, 'm³/h'),
      r('grainSize', 'Effective sand size', 0.3, 1.2, 0.1, 0.5, 'mm'),
      r('backwash', 'Backwash fluidization', 0, 100, 5, 0, '%')
    ],
    steps: () => [
      {
        title: 'Filter Column Stratification',
        text: 'Examine the 3D cutaway layers: Supernatant water, fine silica sand bed (0.5 mm), coarse sand transition, graded pebble/gravel support, and underdrain lateral strainers.'
      },
      {
        title: 'Introduce Turbid Water',
        text: 'Turbid influent water containing suspended clay and silt particles enters via the top bellmouth, establishing a constant gravity supernatant head.'
      },
      {
        title: 'Downward Interstitial Percolation',
        text: 'Water percolates downward through the sand bed under hydraulic gravity head, flowing tortuously through granular pore throats.'
      },
      {
        title: 'Depth Particle Retention',
        text: 'Suspended silt particles are trapped by mechanical straining at pore constrictions, sedimentation in void spaces, and surface van der Waals adsorption.'
      },
      {
        title: 'Collect Clear Filtrate',
        text: 'Filtered crystal-clear water passes through the slotted underdrain strainer nozzles into the effluent header pipe (< 0.2 NTU).'
      },
      {
        title: 'Head Loss Buildup & Clogging',
        text: 'As trapped dirt clogs pore throats, hydraulic flow resistance builds. The differential piezometer manometer water column rises toward terminal head loss.'
      },
      {
        title: 'Fluidized Air-Water Backwash',
        text: 'Pressurized water and scour air are pumped upward from the underdrain. The sand bed expands by 30%, releasing trapped dirt into surface wash-water troughs.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.turbidity <= 0) w.push('Turbidity must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const turb = Number(p.turbidity) || 75;
      const depth = Number(p.depth) || 55;
      const flow = Number(p.flow) || 12;
      const d10 = Number(p.grainSize) || 0.5;
      const isBackwash = (Number(p.backwash) || 0) > 0;

      // Iwasaki deep-bed filtration model
      const lambda = (0.04 * depth) / (flow * d10);
      const outTurb = Math.max(0.12, turb * Math.exp(-lambda * 2.5));
      const headLoss = 0.4 + (flow * 0.08 * depth) / (d10 * 40);

      return {
        formulas: [{
          name: 'Iwasaki Deep-Bed Filtration & Kozeny Head Loss',
          formula: 'C_out = C_in × e^(−λ·L) ; Δh ∝ (v·L) / d₁₀²',
          given: `C_in = ${turb} NTU, Depth = ${depth} cm, Flow = ${flow} m³/h, d₁₀ = ${d10} mm`,
          calc: `${turb} × e^(−${lambda.toFixed(2)})`,
          result: `${outTurb.toFixed(2)} NTU filtrate`,
          unit: 'NTU'
        }],
        readouts: [
          { label: 'Influent Turbidity', value: `${turb} NTU`, tone: 'amber' },
          { label: 'Filtrate Turbidity', value: `${outTurb.toFixed(2)} NTU`, tone: 'green' },
          { label: 'Clean Water Removal', value: `${((1 - outTurb / turb) * 100).toFixed(1)}%`, tone: 'green' },
          { label: 'Piezometric Head Loss', value: `${headLoss.toFixed(2)} m`, tone: headLoss > 2.0 ? 'amber' : 'blue' }
        ],
        state: { turb, outTurb, headLoss, isBackwash },
        explain: {
          what: 'Granular bed filtration removes suspended solids through depth straining, interception, and surface attachment.',
          why: 'Fine sand provides high specific surface area; gravel prevents media loss into the underdrain.',
          param: 'Sand depth, grain size, and filtration velocity',
          effect: `With ${depth} cm sand depth at ${flow} m³/h, effluent turbidity is reduced to ${outTurb.toFixed(2)} NTU with ${headLoss.toFixed(2)} m head loss.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const isBackwash = (Number(p.backwash) || 0) > 0 || step === 6;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Rapid Sand Filtration 3D Cutaway Column', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 7 · Influent = ${p.turbidity} NTU · Depth = ${p.depth} cm · Flow = ${p.flow} m³/h · Grain = ${p.grainSize} mm`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 160, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.5, 'rgba(226, 232, 240, 0.65)');

      const colPos = [-0.6, 0, -1.3];
      const colRadius = 1.25;

      // 1. Column Underdrain Plenum & Lateral Strainers (z = -1.3 to -0.8)
      C3D.drawCylinder(g, P, colPos, colRadius, 0.5, '#475569', { scene, alpha: 0.85, bottomCap: true });
      // Perforated strainers
      for (let s = -0.7; s <= 0.7; s += 0.45) {
        C3D.drawCylinder(g, P, [-0.6 + s, 0, -0.85], 0.12, 0.2, '#94a3b8', { scene, topCap: true });
      }

      // 2. Graded Support Gravel Bed (z = -0.8 to -0.2)
      C3D.drawCylinder(g, P, [-0.6, 0, -0.8], colRadius, 0.6, '#78716c', { scene, alpha: 0.75 });
      // Pebble graphics
      for (let i = 0; i < 18; i++) {
        const px = -0.6 + ((i * 0.31) % 1.6) - 0.8;
        const py = ((i * 0.41) % 1.2) - 0.6;
        const pz = -0.75 + (i * 0.03);
        scene.add(P([px, py, pz]).depth, (ctx) => {
          C3D.drawSphere(ctx, P, [px, py, pz], 0.12, '#57534e', { stroke: '#292524' });
        });
      }

      // 3. Coarse Sand Transition Layer (z = -0.2 to 0.3)
      C3D.drawCylinder(g, P, [-0.6, 0, -0.2], colRadius, 0.5, '#b45309', { scene, alpha: 0.85 });

      // 4. Fine Sand Active Filter Bed (z = 0.3 to 1.7)
      const sandH = isBackwash ? 1.8 : 1.4; // 30% expansion during backwash
      C3D.drawCylinder(g, P, [-0.6, 0, 0.3], colRadius, sandH, '#fde68a', { scene, alpha: 0.9, topCap: true });

      // Trapped dirt particles in top layer of sand (Step >= 3)
      if (step >= 2 && !isBackwash) {
        for (let i = 0; i < 22; i++) {
          const dx = -0.6 + ((i * 0.29) % 1.6) - 0.8;
          const dy = ((i * 0.37) % 1.2) - 0.6;
          const dz = 1.35 + ((i * 0.08) % 0.35);
          scene.add(P([dx, dy, dz]).depth, (ctx) => {
            C3D.drawSphere(ctx, P, [dx, dy, dz], 0.06, '#78350f', { stroke: '#451a03' });
          });
        }
      }

      // 5. Supernatant Water Layer above Sand (z = 1.7 to 2.8)
      if (!isBackwash) {
        C3D.drawCylinder(g, P, [-0.6, 0, 1.7], colRadius, 1.1, '#b45309', { scene, alpha: 0.45, topCap: true });
      } else {
        // Backwash wash water overflowing (turbid wash with rising air bubbles)
        C3D.drawCylinder(g, P, [-0.6, 0, 2.1], colRadius, 0.8, '#92400e', { scene, alpha: 0.65, topCap: true });
        for (let b = 0; b < 16; b++) {
          const bx = -0.6 + ((b * 0.27) % 1.5) - 0.75;
          const by = ((b * 0.33) % 1.1) - 0.55;
          const bz = 0.4 + ((time * 2.0 + b * 0.2) % 2.4);
          scene.add(P([bx, by, bz]).depth, (ctx) => {
            C3D.drawSphere(ctx, P, [bx, by, bz], 0.07, '#ffffff', { stroke: '#94a3b8' });
          });
        }
      }

      // 6. Outer Glass Cutaway Column
      C3D.drawCylinder(g, P, colPos, colRadius + 0.05, 4.2, '#bae6fd', { scene, alpha: 0.22, stroke: 'rgba(255,255,255,0.85)' });

      // 7. Piping (Inlet at top, Outlet at underdrain)
      C3D.drawPipe(g, P, [-2.6, 0, 2.6], [-0.6, 0, 2.6], 0.12, '#92400e', { scene, flow: !isBackwash, t: time });
      C3D.drawPipe(g, P, [-0.6, 0, -1.0], [1.8, 0, -1.0], 0.14, '#0ea5e9', { scene, flow: !isBackwash, t: time, speed: 2.5 });

      // 8. Differential Manometer Tube (Piezometer showing head loss)
      const manoPos = [2.2, 0, -1.3];
      C3D.drawCylinder(g, P, manoPos, 0.12, 3.8, '#bae6fd', { scene, alpha: 0.35, stroke: '#0284c7' });
      // Water column inside manometer
      const manoH = isBackwash ? 0.6 : Math.min(3.4, 0.8 + ((Number(p.flow) || 12) * 0.08) + (step * 0.4));
      C3D.drawCylinder(g, P, manoPos, 0.1, manoH, '#38bdf8', { scene, alpha: 0.85 });

      // Tags identifying layers
      scene.add(P([-0.6, 0, 2.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, 2.3], 'Supernatant Water', '#92400e', -22); });
      scene.add(P([-0.6, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, 1.1], 'Fine Silica Sand (0.5 mm)', '#d97706', -22); });
      scene.add(P([-0.6, 0, 0.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, -0.1], 'Coarse Sand Transition', '#b45309', -22); });
      scene.add(P([-0.6, 0, -0.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, -0.6], 'Graded Gravel Support', '#57534e', -22); });
      scene.add(P([1.8, 0, -1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.8, 0, -1.0], 'Clean Filtrate (< 0.2 NTU)', '#0284c7', -22); });
      scene.add(P([2.2, 0, manoH - 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.2, 0, manoH - 1.2], `Piezometer Head Loss (${manoH.toFixed(1)} m)`, '#0369a1', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Turbid Supernatant Water', color: '#b45309' },
        { label: 'Fine Sand Layer (0.5 mm)', color: '#fde68a' },
        { label: 'Coarse Sand Layer', color: '#b45309' },
        { label: 'Graded Pebble Gravel', color: '#78716c' },
        { label: 'Trapped Silt Dirt', color: '#78350f' },
        { label: 'Crystal Filtrate', color: '#0ea5e9' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 06 — UV and Ozonation Comparison (chem-uv-ozonation)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-uv-ozonation'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.34, zoom: 1.0, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('dose', 'Disinfectant dose / intensity', 0, 10, 0.5, 3.5, 'mg/L or mJ/cm²'),
      r('contact', 'Contact / exposure time', 1, 60, 1, 20, 'min/sec'),
      r('turbidity', 'Water UV transmittance (UVT)', 40, 100, 5, 85, '%'),
      r('microbes', 'Initial microbial load', 10, 100, 5, 75, '%')
    ],
    steps: () => [
      {
        title: 'Feed Water Characterization',
        text: 'Both test reactors receive identical raw water containing active microbial pathogens (green spheres) and organic contaminants.'
      },
      {
        title: 'UV Germicidal Irradiation (254 nm)',
        text: 'Left reactor: Low-pressure UV lamp inside a high-purity quartz sleeve emits germicidal photons at 254 nm, penetrating cell membranes and dimerizing thymine base pairs in DNA/RNA to halt replication.'
      },
      {
        title: 'Ozone Gas Transfer & Oxidation',
        text: 'Right reactor: Corona discharge converts O₂ into O₃. Fine ceramic diffusers release rising swarms of ozone micro-bubbles; dissolved O₃ and ·OH radicals lyse microbial cell walls.'
      },
      {
        title: 'Disinfection Kinetics Comparison',
        text: 'Chick-Watson kinetics (log N/N₀ = −k·C·t): Compare pathogen inactivation efficiency side-by-side as dose and contact time vary.'
      },
      {
        title: 'Practical Engineering Trade-offs',
        text: 'UV produces zero chemical disinfection by-products but leaves no residual; Ozone provides powerful oxidation of taste/odor and micro-pollutants but requires off-gas destructors.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.dose < 0) w.push('Dose cannot be negative.');
      return w;
    },
    compute: (p) => {
      const dose = Number(p.dose) || 3.5;
      const contact = Number(p.contact) || 20;
      const uvt = Number(p.turbidity) || 85;
      const initial = Number(p.microbes) || 75;

      // Comparative inactivation models
      const uvLog = (dose * (uvt / 100) * (contact / 10)) * 0.35;
      const ozLog = (dose * (contact / 5)) * 0.45;
      const uvReduction = Math.min(99.999, 100 * (1 - Math.pow(10, -uvLog)));
      const ozReduction = Math.min(99.999, 100 * (1 - Math.pow(10, -ozLog)));

      return {
        formulas: [{
          name: 'Chick-Watson Inactivation Kinetics',
          formula: 'log(N₀/N) = k × C × t  ;  Kill % = 100 × (1 − 10^(−log_red))',
          given: `Dose = ${dose}, Time = ${contact}, UVT = ${uvt}%`,
          calc: `UV: ${uvLog.toFixed(2)} log  vs  Ozone: ${ozLog.toFixed(2)} log`,
          result: `UV: ${uvReduction.toFixed(2)}%  |  Ozone: ${ozReduction.toFixed(2)}%`,
          unit: '% reduction'
        }],
        readouts: [
          { label: 'UV Log Reduction', value: `${uvLog.toFixed(2)} log (${uvReduction.toFixed(1)}%)`, tone: 'blue' },
          { label: 'Ozone Log Reduction', value: `${ozLog.toFixed(2)} log (${ozReduction.toFixed(1)}%)`, tone: 'green' },
          { label: 'UV Residual in Mains', value: '0.0 mg/L (None)', tone: 'amber' },
          { label: 'Ozone Dissolved Lifetime', value: '< 20 min (Decomposes to O₂)', tone: 'blue' }
        ],
        state: { uvLog, ozLog, uvReduction, ozReduction },
        explain: {
          what: 'UV relies on photochemical thymine dimerization; Ozonation relies on chemical oxidation and free-radical cell lysis.',
          why: 'UV needs clear water (high UVT) and provides no persistent pipe network residual; Ozone is a broad-spectrum oxidant that also removes taste/odor.',
          param: 'Disinfectant dose and contact exposure',
          effect: `Dose ${dose} and contact ${contact} yield ${uvReduction.toFixed(1)}% UV inactivation and ${ozReduction.toFixed(1)}% Ozone oxidation.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('UV Irradiation vs. Ozonation Disinfection Comparison', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 5 · Dose = ${p.dose} · Contact = ${p.contact} · UVT = ${p.turbidity}% · Initial Load = ${p.microbes}%`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 155, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.4, 'rgba(226, 232, 240, 0.65)');

      // ─── LEFT REACTOR: ULTRAVIOLET (UV) DISINFECTION ───
      const uvPos = [-2.0, 0, -1.2];
      // Outer transparent cylindrical reactor chamber
      C3D.drawCylinder(g, P, uvPos, 0.95, 3.2, '#c4b5fd', { scene, alpha: 0.35, topCap: true, bottomCap: true, stroke: '#7c3aed' });
      // Central quartz sleeve
      C3D.drawCylinder(g, P, [-2.0, 0, -1.2], 0.28, 3.2, '#f8fafc', { scene, alpha: 0.65, stroke: '#8b5cf6' });
      // Internal low-pressure UV mercury lamp glowing violet/blue (254 nm)
      if (step >= 1) {
        C3D.drawCylinder(g, P, [-2.0, 0, -1.0], 0.14, 2.8, '#a855f7', { scene, alpha: 0.95 });
      }

      // Microbes in UV reactor: Active (green) entering bottom, inactivated (grey) exiting top
      for (let i = 0; i < 10; i++) {
        const uZ = -1.0 + ((time * 0.8 + i * 0.3) % 2.8);
        const ang = i * 1.5;
        const rad = 0.45 + (i % 2) * 0.2;
        const mPos = [-2.0 + rad * Math.cos(ang), rad * Math.sin(ang), uZ];
        const isDead = uZ > 0.4 && step >= 1;
        scene.add(P(mPos).depth, (ctx) => {
          C3D.drawAtom(ctx, P, mPos, 0.12, isDead ? '#64748b' : '#22c55e', isDead ? 'Inert' : 'Pathogen');
        });
      }

      // ─── RIGHT REACTOR: OZONATION (O₃) BUBBLE TOWER ───
      const ozPos = [2.0, 0, -1.2];
      // Tall transparent contact tower
      C3D.drawCylinder(g, P, ozPos, 0.95, 3.2, '#a5f3fc', { scene, alpha: 0.35, topCap: true, bottomCap: true, stroke: '#0891b2' });
      // Ceramic disc diffuser at the bottom
      C3D.drawCylinder(g, P, [2.0, 0, -1.15], 0.65, 0.18, '#cbd5e1', { scene, topCap: true, bottomCap: true });

      // Rising ozone micro-bubbles (Step >= 2)
      if (step >= 2) {
        for (let b = 0; b < 24; b++) {
          const bZ = -1.0 + ((time * 1.6 + b * 0.15) % 2.8);
          const ang = b * 1.3;
          const rad = (b % 4) * 0.16;
          const bPos = [2.0 + rad * Math.cos(ang), rad * Math.sin(ang), bZ];
          scene.add(P(bPos).depth, (ctx) => {
            C3D.drawSphere(ctx, P, bPos, 0.06, '#ffffff', { stroke: '#06b6d4' });
          });
        }
      }

      // Microbes in Ozone tower undergoing oxidation / lysis
      for (let i = 0; i < 10; i++) {
        const oZ = 1.6 - ((time * 0.7 + i * 0.3) % 2.6);
        const ang = i * 1.7 + 0.8;
        const rad = 0.45 + (i % 2) * 0.22;
        const mPos = [2.0 + rad * Math.cos(ang), rad * Math.sin(ang), oZ];
        const isOxidized = oZ < 0.2 && step >= 2;
        scene.add(P(mPos).depth, (ctx) => {
          C3D.drawAtom(ctx, P, mPos, 0.12, isOxidized ? '#475569' : '#22c55e', isOxidized ? 'Lysed' : 'Pathogen');
        });
      }

      // Shared water manifold piping
      C3D.drawPipe(g, P, [-3.6, 0, -1.1], [-2.0, 0, -1.1], 0.12, '#0ea5e9', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [0.4, 0, 1.8], [2.0, 0, 1.8], 0.12, '#0ea5e9', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [-2.0, 0, 1.8], [-0.5, 0, 1.8], 0.12, '#0284c7', { scene, flow: true, t: time, speed: 2 });
      C3D.drawPipe(g, P, [2.0, 0, -1.1], [3.6, 0, -1.1], 0.12, '#0284c7', { scene, flow: true, t: time, speed: 2 });

      // Tags identifying reactors
      scene.add(P([-2.0, 0, 2.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-2.0, 0, 2.1], 'UV Lamp (254 nm Thymine Dimers)', '#7c3aed', -24); });
      scene.add(P([2.0, 0, 2.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.0, 0, 2.1], 'Ozonation Tower (O₃ Diffuser)', '#0891b2', -24); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Active Microbial Cells', color: '#22c55e', symbol: true },
        { label: 'Inactivated by UV (Photolysis)', color: '#64748b', symbol: true },
        { label: 'Lysed by Ozone (Oxidation)', color: '#475569', symbol: true },
        { label: '254 nm Germicidal Emission', color: '#a855f7' },
        { label: 'Rising O₃ Gas Micro-Bubbles', color: '#06b6d4' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 07 — Electrochemical Cell Simulator (chem-electrochemical-cell)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-electrochemical-cell'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('anode', 'Anode electrode metal', 'Zn', ['Zn', 'Fe', 'Al', 'Li']),
      select('cathode', 'Cathode electrode metal', 'Cu', ['Cu', 'Ag', 'Fe']),
      r('anodeConc', 'Anode ion concentration', 0.01, 2.0, 0.05, 1.0, 'M'),
      r('cathodeConc', 'Cathode ion concentration', 0.01, 2.0, 0.05, 1.0, 'M'),
      select('circuitState', 'Circuit switch', 'Closed', ['Closed', 'Open'])
    ],
    steps: () => [
      {
        title: 'Galvanic Cell Assembly',
        text: 'Inspect the Daniell cell components: Zinc anode in ZnSO₄ solution, Copper cathode in CuSO₄ solution, U-tube salt bridge, connecting wire, switch, and voltmeter.'
      },
      {
        title: 'Close Circuit Switch',
        text: 'The knife switch closes. The electrochemical potential difference drives electrons through the external circuit from Zinc to Copper (E°cell = 1.10 V).'
      },
      {
        title: 'Anodic Oxidation Reaction (Zn)',
        text: 'At the zinc electrode: Zn(s) → Zn²⁺(aq) + 2e⁻. Zinc atoms release two electrons into the wire and enter solution as hydrated Zn²⁺ ions; anode plate loses mass.'
      },
      {
        title: 'Cathodic Reduction Reaction (Cu)',
        text: 'At the copper electrode: Cu²⁺(aq) + 2e⁻ → Cu(s). Blue Cu²⁺ ions accept electrons from the cathode and deposit as reddish metallic copper; cathode plate gains mass.'
      },
      {
        title: 'Salt Bridge Ionic Transport',
        text: 'The U-tube salt bridge maintains electrical neutrality: NO₃⁻ / Cl⁻ anions diffuse into the anode beaker, and K⁺ cations diffuse into the cathode beaker without liquid junction buildup.'
      },
      {
        title: 'Measure Standard Cell EMF',
        text: 'Voltmeter measures standard cell electromotive force: E°cell = E°cathode − E°anode = +0.34 V − (−0.76 V) = +1.10 V.'
      },
      {
        title: 'Nernst Concentration Response',
        text: 'Nernst equation predicts cell EMF under non-standard concentrations: E = E° − (0.0591 / n) log([Anode²⁺] / [Cathode²⁺]). Adjust concentrations to observe voltage shift.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.anode === p.cathode) w.push('Anode and cathode must be different metals.');
      return w;
    },
    compute: (p) => {
      const metals = {
        Zn: { e0: -0.76, n: 2, color: '#94a3b8', ion: 'Zn²⁺' },
        Fe: { e0: -0.44, n: 2, color: '#64748b', ion: 'Fe²⁺' },
        Al: { e0: -1.66, n: 3, color: '#cbd5e1', ion: 'Al³⁺' },
        Li: { e0: -3.04, n: 1, color: '#e2e8f0', ion: 'Li⁺' },
        Cu: { e0: 0.34, n: 2, color: '#b45309', ion: 'Cu²⁺' },
        Ag: { e0: 0.80, n: 1, color: '#e2e8f0', ion: 'Ag⁺' }
      };

      const an = metals[p.anode] || metals.Zn;
      const cat = metals[p.cathode] || metals.Cu;
      const aConc = Number(p.anodeConc) || 1.0;
      const cConc = Number(p.cathodeConc) || 1.0;
      const isClosed = p.circuitState === 'Closed';

      const e0Cell = cat.e0 - an.e0;
      const nElectrons = Math.min(an.n, cat.n);
      const nernst = isClosed ? e0Cell - (0.0591 / nElectrons) * Math.log10(aConc / cConc) : 0;
      const voltage = Math.max(0, nernst);

      return {
        formulas: [{
          name: 'Nernst Cell Potential Equation',
          formula: 'E_cell = (E°_cat − E°_an) − (0.0591 / n) × log([Anode] / [Cathode])',
          given: `E°_cat = ${cat.e0} V, E°_an = ${an.e0} V, [An] = ${aConc} M, [Cat] = ${cConc} M`,
          calc: `(${cat.e0} − ${an.e0}) − (${(0.0591 / nElectrons).toFixed(4)}) × log10(${aConc} / ${cConc})`,
          result: `${voltage.toFixed(3)} V`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Cell EMF', value: `${voltage.toFixed(3)} V`, tone: voltage > 0 ? 'green' : 'amber' },
          { label: 'Anode Half-Cell', value: `${p.anode} (E° = ${an.e0} V)`, tone: 'amber' },
          { label: 'Cathode Half-Cell', value: `${p.cathode} (E° = +${cat.e0} V)`, tone: 'blue' },
          { label: 'Electron Flow', value: isClosed ? `${p.anode} → ${p.cathode}` : 'Circuit Open', tone: isClosed ? 'green' : 'amber' }
        ],
        state: { voltage, e0Cell, isClosed, an, cat },
        explain: {
          what: 'Galvanic Daniell cell converts spontaneous chemical redox energy directly into electrical energy.',
          why: 'Zinc has a more negative reduction potential (−0.76 V) than copper (+0.34 V), driving spontaneous electron transfer.',
          param: 'Electrode choice and ion concentrations',
          effect: `Coupling ${p.anode} anode with ${p.cathode} cathode generates ${voltage.toFixed(3)} V cell EMF under current concentration ratio.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const isClosed = p.circuitState === 'Closed' && step >= 1;
      const voltage = st.c && st.c.state ? st.c.state.voltage : 1.10;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Electrochemical Cell Simulator (Daniell Cell)', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 7 · Anode = ${p.anode} (${p.anodeConc} M) · Cathode = ${p.cathode} (${p.cathodeConc} M) · E_cell = ${voltage.toFixed(2)} V`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 160, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.3, 'rgba(226, 232, 240, 0.65)');

      // 1. Left Beaker: Anode Half-Cell (Zn in ZnSO4, clear pale liquid)
      const anPos = [-1.9, 0, -1.2];
      C3D.drawBeaker(g, P, anPos, 0.95, 1.9, 1.4, '#e0f2fe', { scene, label: `${p.anode} Anode Beaker`, liquidAlpha: 0.55 });
      // Zinc electrode plate (metallic grey)
      C3D.drawBox(g, P, [-1.9, 0, -0.1], [0.15, 0.65, 1.8], '#94a3b8', { scene, stroke: '#475569' });

      // 2. Right Beaker: Cathode Half-Cell (Cu in CuSO4, deep translucent azure blue liquid)
      const catPos = [1.9, 0, -1.2];
      C3D.drawBeaker(g, P, catPos, 0.95, 1.9, 1.4, '#0284c7', { scene, label: `${p.cathode} Cathode Beaker`, liquidAlpha: 0.75 });
      // Copper electrode plate (reddish copper metal)
      C3D.drawBox(g, P, [1.9, 0, -0.1], [0.15, 0.65, 1.8], '#b45309', { scene, stroke: '#78350f' });

      // 3. Salt Bridge (Inverted U-tube spanning both beakers)
      C3D.drawPipe(g, P, [-1.1, 0, -0.1], [-1.1, 0, 1.1], 0.12, '#bae6fd', { scene });
      C3D.drawPipe(g, P, [-1.1, 0, 1.1], [1.1, 0, 1.1], 0.12, '#bae6fd', { scene });
      C3D.drawPipe(g, P, [1.1, 0, 1.1], [1.1, 0, -0.1], 0.12, '#bae6fd', { scene });

      // Ions moving in salt bridge (K+ purple right, Cl- mint left)
      if (isClosed) {
        for (let i = 0; i < 4; i++) {
          const tNorm = ((time * 0.8 + i * 0.25) % 1);
          const kPos = [-1.0 + tNorm * 2.0, 0, 1.1];
          scene.add(P(kPos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, kPos, 0.08, '#9333ea', 'K', '+');
          });
          const clPos = [1.0 - tNorm * 2.0, 0, 1.1];
          scene.add(P(clPos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, clPos, 0.08, '#10b981', 'Cl', '-');
          });
        }
      }

      // 4. Overhead External Conducting Wire & Switch
      C3D.drawPipe(g, P, [-1.9, 0, 0.8], [-1.9, 0, 2.4], 0.04, '#b45309', { scene });
      C3D.drawPipe(g, P, [-1.9, 0, 2.4], [-0.5, 0, 2.4], 0.04, '#b45309', { scene });
      // Knife switch at top center
      C3D.drawBox(g, P, [-0.4, 0, 2.4], [0.2, 0.2, 0.1], '#334155', { scene });
      const switchAng = isClosed ? 0 : -0.5;
      C3D.drawPipe(g, P, [-0.4, 0, 2.4], [0.2 * Math.cos(switchAng), 0, 2.4 + 0.2 * Math.sin(switchAng)], 0.04, '#ca8a04', { scene });
      C3D.drawPipe(g, P, [0.2, 0, 2.4], [1.9, 0, 2.4], 0.04, '#b45309', { scene });
      C3D.drawPipe(g, P, [1.9, 0, 2.4], [1.9, 0, 0.8], 0.04, '#b45309', { scene });

      // Electron dots moving along wire from Zn to Cu
      if (isClosed) {
        for (let e = 0; e < 6; e++) {
          const eNorm = ((time * 1.8 + e * 0.16) % 1);
          let ePos;
          if (eNorm < 0.3) {
            ePos = [-1.9, 0, 0.8 + (eNorm / 0.3) * 1.6];
          } else if (eNorm < 0.7) {
            ePos = [-1.9 + ((eNorm - 0.3) / 0.4) * 3.8, 0, 2.4];
          } else {
            ePos = [1.9, 0, 2.4 - ((eNorm - 0.7) / 0.3) * 1.6];
          }
          scene.add(P(ePos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, ePos, 0.07, '#eab308', 'e', '-');
          });
        }
      }

      // 5. Analog/Digital Voltmeter on Lab Bench
      C3D.drawVoltmeter(g, P, [0, 0, 1.4], 1.1, voltage, 2.0, {
        scene,
        label: 'CELL EMF (E_cell)',
        decimals: 2
      });

      // 6. Dissolving Zn2+ ions & Depositing Cu2+ ions
      if (isClosed) {
        for (let i = 0; i < 4; i++) {
          const zx = -1.8 + ((i * 0.2 + time * 0.2) % 0.6);
          const zz = -0.8 + ((i * 0.3) % 0.8);
          scene.add(P([zx, 0, zz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [zx, 0, zz], 0.11, '#16a34a', 'Zn', '2+');
          });
          const cx = 1.8 - ((i * 0.2 + time * 0.2) % 0.6);
          const cz = -0.8 + ((i * 0.3) % 0.8);
          scene.add(P([cx, 0, cz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [cx, 0, cz], 0.11, '#0284c7', 'Cu', '2+');
          });
        }
      }

      scene.add(P([-1.9, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.9, 0, 0.9], 'Anode: Zn → Zn²⁺ + 2e⁻', '#b91c1c', -24); });
      scene.add(P([1.9, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.9, 0, 0.9], 'Cathode: Cu²⁺ + 2e⁻ → Cu', '#1d4ed8', -24); });
      scene.add(P([0, 0, 0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 0.8], 'Salt Bridge (KNO₃ / Agar)', '#475569', -24); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Zinc Plate (Anode Oxidation)', color: '#94a3b8' },
        { label: 'Copper Plate (Cathode Reduction)', color: '#b45309' },
        { label: 'Zn²⁺ Zinc Dissolved Ion', color: '#16a34a', symbol: true },
        { label: 'Cu²⁺ Copper Depositing Ion', color: '#0284c7', symbol: true },
        { label: 'e⁻ Electron Current (Wire)', color: '#eab308', symbol: true },
        { label: 'K⁺ / Cl⁻ Salt Bridge Ions', color: '#9333ea', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 08 — Calomel Electrode Simulator (chem-calomel-electrode)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-calomel-electrode'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.30, zoom: 1.15, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('chloride', 'KCl electrolyte concentration', 0.1, 4.0, 0.1, 3.5, 'M (3.5 = Saturated)'),
      r('temperature', 'Electrode temperature', 10, 80, 5, 25, '°C'),
      select('viewCutaway', 'Inspection Mode', '3D Cutaway', ['3D Cutaway', 'Glass Exterior']),
      select('circuitState', 'Measurement circuit', 'Connected', ['Connected', 'Disconnected'])
    ],
    steps: () => [
      {
        title: 'Calomel Electrode Anatomy',
        text: 'Rotate and inspect the 3D cutaway of the Saturated Calomel Electrode (SCE): platinum contact wire, mercury pool, calomel paste, saturated KCl solution, and porous junction frit.'
      },
      {
        title: 'Inspect Internal Chemical Phases',
        text: 'Phase 1: Pure liquid elemental Mercury (Hg) with silvery metallic luster; Phase 2: Calomel paste (Hg + Hg₂Cl₂); Phase 3: Saturated KCl solution with excess solid crystals.'
      },
      {
        title: 'Reversible Electrochemical Equilibrium',
        text: 'The electrode reaction is reversible: Hg₂Cl₂(s) + 2e⁻ ⇌ 2Hg(l) + 2Cl⁻(aq). Potential is governed exclusively by chloride ion activity.'
      },
      {
        title: 'Porous Ceramic Liquid Junction',
        text: 'The porous ceramic frit at the electrode tip allows minute ion diffusion to complete the electrical circuit with external test solutions while preventing bulk cross-contamination.'
      },
      {
        title: 'Chloride Activity & Nernst Response',
        text: 'Nernst equation: E = E° − 0.0591 log a(Cl⁻). Standard values at 25°C: 0.1 N KCl = +0.334 V; 1.0 N KCl = +0.280 V; Saturated KCl (SCE) = +0.2415 V vs SHE.'
      },
      {
        title: 'Role as Potentiometric Reference',
        text: 'Because its potential remains completely invariant, the SCE is used as a standard secondary reference electrode against which glass pH electrodes and redox potentials are measured.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.chloride <= 0) w.push('Chloride concentration must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const a = Number(p.chloride) || 3.5;
      const t = Number(p.temperature) || 25;
      const e0 = 0.2415; // standard SCE at 25C
      // Temperature and chloride activity coefficient
      const potential = e0 - 0.0591 * Math.log10(a / 3.5) - (t - 25) * 0.00065;

      return {
        formulas: [{
          name: 'Calomel Electrode Nernst Potential',
          formula: 'E = E°_Hg₂Cl₂/Hg − (0.0591 / 1) × log[Cl⁻] − 0.00065 × (T − 25)',
          given: `[Cl⁻] = ${a.toFixed(1)} M, T = ${t} °C, E°(SCE) = +0.2415 V`,
          calc: `0.2415 − 0.0591 × log10(${a.toFixed(1)} / 3.5) − 0.00065 × ${(t - 25)}`,
          result: `+${potential.toFixed(4)} V vs SHE`,
          unit: 'V vs SHE'
        }],
        readouts: [
          { label: 'Reference Potential', value: `+${potential.toFixed(3)} V`, tone: 'green' },
          { label: 'Electrode Type', value: a >= 3.0 ? 'SCE (Saturated)' : a >= 0.8 ? 'NCE (1.0 N)' : 'DCE (0.1 N)', tone: 'blue' },
          { label: 'Chloride Activity', value: `${a.toFixed(1)} M`, tone: 'amber' },
          { label: 'Temperature', value: `${t} °C`, tone: 'blue' }
        ],
        state: { potential, a, t },
        explain: {
          what: 'The calomel reference electrode comprises liquid mercury in contact with sparingly soluble mercurous chloride (Hg₂Cl₂) in saturated KCl.',
          why: 'Excess solid KCl crystals keep chloride activity constant regardless of minor evaporation or ion transfer.',
          param: 'KCl activity and temperature',
          effect: `At ${t}°C with ${a} M KCl, electrode potential is calibrated to exactly +${potential.toFixed(3)} V vs SHE.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const isCutaway = p.viewCutaway === '3D Cutaway';
      const potential = st.c && st.c.state ? st.c.state.potential : 0.242;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Saturated Calomel Reference Electrode (SCE)', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · [Cl⁻] = ${p.chloride} M · Temp = ${p.temperature} °C · E = +${potential.toFixed(3)} V vs SHE`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 180, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.6, 'rgba(226, 232, 240, 0.65)');

      const eleCenter = [-0.6, 0, -1.4];

      // 1. Porous Ceramic Tip Frit (z = -1.4 to -1.2)
      C3D.drawCylinder(g, P, eleCenter, 0.25, 0.2, '#e2e8f0', { scene, topCap: true, bottomCap: true, stroke: '#94a3b8' });

      // 2. Pure Liquid Elemental Mercury Pool (Hg) (z = -1.2 to -0.6)
      C3D.drawCylinder(g, P, [-0.6, 0, -1.2], 0.62, 0.6, '#e2e8f0', {
        scene,
        alpha: 0.95,
        topCap: true,
        bottomCap: true,
        stroke: '#94a3b8'
      });

      // 3. Calomel Paste Layer (Hg + Hg2Cl2, grey-white slurry) (z = -0.6 to 0.1)
      C3D.drawCylinder(g, P, [-0.6, 0, -0.6], 0.62, 0.7, '#cbd5e1', {
        scene,
        alpha: 0.95,
        topCap: true,
        bottomCap: true,
        stroke: '#64748b'
      });

      // 4. Saturated KCl Electrolyte Solution Jacket (z = 0.1 to 2.2)
      C3D.drawCylinder(g, P, [-0.6, 0, 0.1], 0.62, 2.1, '#bae6fd', {
        scene,
        alpha: 0.65,
        topCap: true,
        stroke: '#0284c7'
      });

      // Solid white KCl crystals settled at the base of the solution
      for (let i = 0; i < 14; i++) {
        const kx = -0.6 + ((i * 0.19) % 0.8) - 0.4;
        const ky = ((i * 0.23) % 0.6) - 0.3;
        const kz = 0.15 + (i * 0.02);
        scene.add(P([kx, ky, kz]).depth, (ctx) => {
          C3D.drawSphere(ctx, P, [kx, ky, kz], 0.06, '#ffffff', { stroke: '#cbd5e1' });
        });
      }

      // 5. Central Platinum Contact Wire sealed in glass capillary dipping into Hg pool
      C3D.drawCylinder(g, P, [-0.6, 0, 2.2], 0.1, 1.0, '#cbd5e1', { scene });
      C3D.drawPipe(g, P, [-0.6, 0, 3.2], [-0.6, 0, -1.0], 0.04, '#64748b', { scene });

      // 6. Outer Glass Cylinder Jacket
      C3D.drawCylinder(g, P, [-0.6, 0, -1.4], 0.66, 3.8, '#bae6fd', {
        scene,
        alpha: isCutaway ? 0.18 : 0.45,
        topCap: false,
        stroke: 'rgba(255,255,255,0.9)'
      });

      // Side filling tube for replenishment
      C3D.drawCylinder(g, P, [-0.6, 0.6, 1.2], 0.16, 0.8, '#bae6fd', { scene, alpha: 0.4 });

      // Digital Electrometer Display Box on right
      C3D.drawVoltmeter(g, P, [2.2, 0, 0.4], 1.2, potential, 1.0, {
        scene,
        label: 'CALOMEL POTENTIAL (vs SHE)',
        decimals: 3
      });
      // Connection lead wire to electrometer
      C3D.drawPipe(g, P, [-0.6, 0, 3.2], [2.2, 0, 1.0], 0.04, '#dc2626', { scene });

      // Safety badge warning about virtual laboratory containment
      g.save();
      g.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#dc2626';
      g.fillText('⚠️ Mercury Hazard Safety: Standard Secondary Reference Electrode for Potentiometric Virtual Labs', 32, 535);
      g.restore();

      // Component Tags
      scene.add(P([-0.6, 0, 3.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, 3.0], 'Platinum Lead Wire', '#475569', -22); });
      scene.add(P([-0.6, 0, 1.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, 1.3], 'Saturated KCl Solution', '#0284c7', -22); });
      scene.add(P([-0.6, 0, -0.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, -0.4], 'Calomel Paste (Hg + Hg₂Cl₂)', '#475569', -22); });
      scene.add(P([-0.6, 0, -0.9]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, -1.0], 'Liquid Mercury Pool (Hg)', '#334155', -22); });
      scene.add(P([-0.6, 0, -1.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.6, 0, -1.4], 'Porous Ceramic Frit', '#64748b', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Pure Liquid Mercury Pool (Hg)', color: '#e2e8f0' },
        { label: 'Calomel Paste (Hg + Hg₂Cl₂)', color: '#cbd5e1' },
        { label: 'Saturated KCl Electrolyte', color: '#bae6fd' },
        { label: 'Excess KCl Crystals', color: '#ffffff' },
        { label: 'Platinum Contact Lead', color: '#64748b' },
        { label: 'Porous Ceramic Junction Frit', color: '#94a3b8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 09 — Lithium-Ion Battery Simulator (chem-lithium-ion)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lithium-ion'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('mode', 'Operating Mode', 'Discharge', ['Discharge', 'Charge', 'Idle']),
      r('soc', 'State of Charge (SOC)', 0, 100, 5, 75, '%'),
      r('current', 'Operating Current', 0.5, 10, 0.5, 2.5, 'A'),
      r('resistance', 'Internal resistance (R_int)', 0.01, 0.2, 0.01, 0.06, 'Ω')
    ],
    steps: () => [
      {
        title: 'Li-Ion Layered Cell Architecture',
        text: '3D cutaway inspection: Copper negative collector, Graphitic carbon anode (Li_x C₆), Microporous polymer separator, Lithium cobalt oxide cathode (Li₁₋ₓ CoO₂), and Aluminium positive collector.'
      },
      {
        title: 'Discharge: Anode De-intercalation',
        text: 'During discharge, lithium ions de-intercalate from between graphite graphene sheets: Li_x C₆ → 6C + x Li⁺ + x e⁻.'
      },
      {
        title: 'Separator Transport & External Load',
        text: 'Li⁺ cations shuttle through the liquid organic carbonate electrolyte across the sub-micron pores of the separator. Blocked electrons travel through the external circuit, driving the motor.'
      },
      {
        title: 'Cathode Intercalation on Discharge',
        text: 'Li⁺ ions insert into vacant octahedral sites in the CoO₂ crystal lattice: Li₁₋ₓ CoO₂ + x Li⁺ + x e⁻ → LiCoO₂.'
      },
      {
        title: 'Reversible Charging Process',
        text: 'An external DC charger forces electrons back to the anode; Li⁺ ions de-intercalate from the cathode, migrate left across the separator, and re-intercalate between graphite sheets.'
      },
      {
        title: 'Performance & State of Charge',
        text: 'Display cell Open-Circuit Voltage Voc(SOC), internal IR drop (I·R_int), and terminal voltage V_cell = Voc − I·R_int.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.soc < 0 || p.soc > 100) w.push('State of charge must be between 0 and 100%.');
      return w;
    },
    compute: (p) => {
      const soc = Number(p.soc) || 75;
      const i = Number(p.current) || 2.5;
      const rInt = Number(p.resistance) || 0.06;
      const mode = p.mode || 'Discharge';

      // NMC/LCO voltage model: OCV ~ 3.0V at 0% to 4.2V at 100%
      const voc = 3.0 + (soc / 100) * 1.2;
      const irDrop = i * rInt;
      const vTerminal = mode === 'Discharge' ? Math.max(2.8, voc - irDrop) : mode === 'Charge' ? Math.min(4.35, voc + irDrop) : voc;

      return {
        formulas: [{
          name: 'Li-Ion Terminal Voltage Model',
          formula: 'V_cell = V_oc(SOC) ± I × R_int',
          given: `SOC = ${soc}%, V_oc = ${voc.toFixed(2)} V, I = ${i} A, R_int = ${rInt} Ω`,
          calc: `${voc.toFixed(2)} ${mode === 'Discharge' ? '−' : '+'} (${i} × ${rInt})`,
          result: `${vTerminal.toFixed(2)} V`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Terminal Voltage', value: `${vTerminal.toFixed(2)} V`, tone: 'green' },
          { label: 'Open-Circuit Voc', value: `${voc.toFixed(2)} V`, tone: 'blue' },
          { label: 'IR Ohmic Drop', value: `${irDrop.toFixed(2)} V`, tone: 'amber' },
          { label: 'Battery Chemistry', value: 'LiCoO₂ / Graphite Intercalation', tone: 'blue' }
        ],
        state: { soc, voc, vTerminal, mode, i },
        explain: {
          what: 'Lithium-ion cells function via rocking-chair intercalation/de-intercalation of Li⁺ between layered host crystal lattices.',
          why: 'No metallic lithium is plated during normal cycling, ensuring safety and long cycle life.',
          param: 'State of charge (SOC) and operating current',
          effect: `At ${soc}% SOC, open-circuit voltage is ${voc.toFixed(2)} V; with ${i} A ${mode.toLowerCase()} current, terminal voltage is ${vTerminal.toFixed(2)} V.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const mode = p.mode || 'Discharge';
      const isDischarge = mode === 'Discharge';
      const isCharge = mode === 'Charge';
      const isRunning = (isDischarge || isCharge) && step >= 1;
      const voltage = st.c && st.c.state ? st.c.state.vTerminal : 3.85;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Lithium-Ion Battery Intercalation 3D Simulator', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Mode = ${mode} · SOC = ${p.soc}% · Current = ${p.current} A · Voltage = ${voltage.toFixed(2)} V`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 155, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.4, 'rgba(226, 232, 240, 0.65)');

      // ─── 3D LAYERED BATTERY SANDWICH ───
      // Layer 1: Copper Negative Current Collector (x = -2.2)
      C3D.drawBox(g, P, [-2.2, 0, 0], [0.15, 1.8, 2.2], '#b45309', { scene, stroke: '#78350f' });

      // Layer 2: Graphitic Carbon Anode (Li_x C6, dark charcoal grey sheets, x = -1.3)
      C3D.drawBox(g, P, [-1.3, 0, 0], [1.4, 1.7, 2.1], '#334155', { scene, stroke: '#1e293b' });

      // Layer 3: Microporous Polymer Separator Membrane (ivory film, x = 0.0)
      C3D.drawBox(g, P, [0.0, 0, 0], [0.25, 1.75, 2.15], '#fef08a', { scene, alpha: 0.55, stroke: '#ca8a04' });

      // Layer 4: Lithium Cobalt Oxide Cathode (Li1-x CoO2, dark violet lattice, x = 1.3)
      C3D.drawBox(g, P, [1.3, 0, 0], [1.4, 1.7, 2.1], '#581c87', { scene, stroke: '#3b0764' });

      // Layer 5: Aluminium Positive Current Collector (x = 2.2)
      C3D.drawBox(g, P, [2.2, 0, 0], [0.15, 1.8, 2.2], '#cbd5e1', { scene, stroke: '#64748b' });

      // ─── PARTICLE TRANSPORT (Li⁺ and e⁻) ───
      // Shuttling Li+ Ions (electric blue spheres) crossing separator
      if (isRunning) {
        for (let i = 0; i < 14; i++) {
          const tNorm = ((time * 0.9 + i * 0.14) % 1);
          // Discharge: moves left-to-right (-1.3 to +1.3); Charge: moves right-to-left (+1.3 to -1.3)
          const lx = isDischarge ? -1.3 + tNorm * 2.6 : 1.3 - tNorm * 2.6;
          const ly = ((i * 0.35) % 1.4) - 0.7;
          const lz = ((i * 0.45) % 1.6) - 0.8;
          scene.add(P([lx, ly, lz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [lx, ly, lz], 0.12, '#0ea5e9', 'Li', '+');
          });
        }

        // External Wire Electrons (yellow dots)
        for (let e = 0; e < 8; e++) {
          const eNorm = ((time * 1.5 + e * 0.12) % 1);
          let ex, ez;
          if (isDischarge) {
            // Anode to Cathode (-2.2 -> +2.2 via top)
            if (eNorm < 0.25) { ex = -2.2; ez = 1.1 + (eNorm / 0.25) * 1.2; }
            else if (eNorm < 0.75) { ex = -2.2 + ((eNorm - 0.25) / 0.5) * 4.4; ez = 2.3; }
            else { ex = 2.2; ez = 2.3 - ((eNorm - 0.75) / 0.25) * 1.2; }
          } else {
            // Cathode to Anode (+2.2 -> -2.2 via top)
            if (eNorm < 0.25) { ex = 2.2; ez = 1.1 + (eNorm / 0.25) * 1.2; }
            else if (eNorm < 0.75) { ex = 2.2 - ((eNorm - 0.25) / 0.5) * 4.4; ez = 2.3; }
            else { ex = -2.2; ez = 2.3 - ((eNorm - 0.75) / 0.25) * 1.2; }
          }
          scene.add(P([ex, 0, ez]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [ex, 0, ez], 0.08, '#eab308', 'e', '-');
          });
        }
      }

      // External Circuit Wire Overhead
      C3D.drawPipe(g, P, [-2.2, 0, 1.1], [-2.2, 0, 2.3], 0.05, '#b45309', { scene });
      C3D.drawPipe(g, P, [-2.2, 0, 2.3], [2.2, 0, 2.3], 0.05, '#b45309', { scene });
      C3D.drawPipe(g, P, [2.2, 0, 2.3], [2.2, 0, 1.1], 0.05, '#cbd5e1', { scene });

      // External Load Motor / Charger
      C3D.drawBox(g, P, [0, 0, 2.3], [0.6, 0.6, 0.4], '#1e293b', { scene });
      if (isDischarge && isRunning) {
        // Spinning motor fan blades
        C3D.drawPaddle(g, P, [0, 0.35, 2.3], 0.1, 0.35, 0.2, time * 8.0, '#38bdf8', { scene, blades: 3 });
      }

      // Digital Multimeter Readout Box
      C3D.drawVoltmeter(g, P, [0, 0, -1.3], 1.2, voltage, 4.5, {
        scene,
        label: `${mode.toUpperCase()} VOLTAGE (V)`,
        decimals: 2
      });

      // Tags identifying layers
      scene.add(P([-2.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-2.2, 0, 1.2], 'Cu Negative Collector', '#b45309', -22); });
      scene.add(P([-1.3, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.3, 0, 1.2], 'Graphite Anode (Li_x C₆)', '#334155', -22); });
      scene.add(P([0, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.2], 'Polymer Separator', '#ca8a04', -22); });
      scene.add(P([1.3, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.3, 0, 1.2], 'LiCoO₂ Cathode', '#581c87', -22); });
      scene.add(P([2.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.2, 0, 1.2], 'Al Positive Collector', '#64748b', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Li⁺ Lithium Shuttling Cation', color: '#0ea5e9', symbol: true },
        { label: 'e⁻ Electron Current (External)', color: '#eab308', symbol: true },
        { label: 'Graphite Anode Host Lattice', color: '#334155' },
        { label: 'LiCoO₂ Cathode Host Lattice', color: '#581c87' },
        { label: 'Microporous Separator Film', color: '#fef08a' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 10 — Polymer Membrane Fuel Cell Simulator (chem-pem-fuel-cell)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-pem-fuel-cell'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('hydrogen', 'Hydrogen fuel supply', 0, 100, 5, 80, '%'),
      r('oxygen', 'Oxygen / air supply', 0, 100, 5, 85, '%'),
      r('temperature', 'Operating cell temperature', 20, 100, 5, 65, '°C'),
      r('load', 'External electrical load', 0.5, 20, 0.5, 4.0, 'Ω')
    ],
    steps: () => [
      {
        title: 'PEMFC Membrane Electrode Assembly (MEA)',
        text: '3D cutaway inspection: Anode graphite bipolar plate with serpentine channels, Carbon paper gas diffusion layer, Platinum catalyst, Nafion proton exchange membrane, Cathode catalyst layer, and Cathode plate.'
      },
      {
        title: 'Hydrogen Fuel Inflow & Diffusion',
        text: 'Pressurized H₂ gas enters the anode serpentine channels and diffuses through the porous carbon gas diffusion layer toward the platinum catalyst.'
      },
      {
        title: 'Anode Catalytic Oxidation (Pt)',
        text: 'On the platinum catalyst: H₂ → 2H⁺ + 2e⁻. Hydrogen dissociates into protons and electrons.'
      },
      {
        title: 'Proton Transport Across Nafion PEM',
        text: 'Hydrated protons (H⁺) hop through sulfonic acid channels (−SO₃⁻H⁺) in the Nafion membrane toward the cathode. Nafion is an electrical insulator, strictly blocking electrons.'
      },
      {
        title: 'External Circuit Electron Current',
        text: 'Blocked electrons travel through the external electrical circuit, generating usable direct current and powering the electrical load.'
      },
      {
        title: 'Oxygen / Air Inflow at Cathode',
        text: 'Oxygen from air enters cathode serpentine channels and diffuses through the gas diffusion layer to the cathode platinum catalyst.'
      },
      {
        title: 'Cathode Oxygen Reduction & Water',
        text: 'At the cathode: ½O₂ + 2H⁺ + 2e⁻ → H₂O + Heat. Protons, incoming electrons, and oxygen combine to form water droplets, draining harmlessly from the exhaust.'
      },
      {
        title: 'Polarization Curve & Clean Efficiency',
        text: 'Display reversible cell EMF (1.23 V), actual operating cell voltage (0.65–0.85 V), current density, electrical power, and zero-emission efficiency.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.hydrogen <= 0) w.push('Hydrogen supply must be above 0%.');
      return w;
    },
    compute: (p) => {
      const h2 = Number(p.hydrogen) || 80;
      const o2 = Number(p.oxygen) || 85;
      const t = Number(p.temperature) || 65;
      const rLoad = Number(p.load) || 4.0;

      // Realistic PEM polarization model
      const eRev = 1.229 - 0.00085 * (t - 25);
      const reactantFactor = Math.min(1.0, (h2 / 100) * (o2 / 100));
      const iCurrent = Math.max(0.1, (reactantFactor * 4.0) / (0.2 + rLoad * 0.15));
      const vAct = 0.18; // activation overpotential
      const vOhm = iCurrent * 0.05; // ohmic loss in membrane
      const vCell = Math.max(0.2, (eRev * reactantFactor) - vAct - vOhm);
      const power = vCell * iCurrent; // Watts
      const efficiency = (vCell / 1.48) * 100; // HHV efficiency %

      return {
        formulas: [{
          name: 'PEMFC Polarization & Net Reaction',
          formula: 'H₂ + ½O₂ → H₂O ; V_cell = E_rev − η_act − i·R_membrane',
          given: `H₂ = ${h2}%, O₂ = ${o2}%, T = ${t} °C, R_load = ${rLoad} Ω`,
          calc: `${eRev.toFixed(3)} − ${vAct} − ${(vOhm).toFixed(3)}`,
          result: `${vCell.toFixed(2)} V @ ${iCurrent.toFixed(1)} A`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Cell Voltage', value: `${vCell.toFixed(2)} V`, tone: 'green' },
          { label: 'Cell Current', value: `${iCurrent.toFixed(1)} A`, tone: 'blue' },
          { label: 'Electrical Power', value: `${power.toFixed(1)} W`, tone: 'green' },
          { label: 'Energy Efficiency', value: `${efficiency.toFixed(1)}%`, tone: 'blue' }
        ],
        state: { vCell, iCurrent, power, efficiency },
        explain: {
          what: 'Polymer Electrolyte Membrane Fuel Cell (PEMFC) converts chemical energy of hydrogen and oxygen directly into electricity and water.',
          why: 'Nafion perfluorosulfonic acid polymer conducts protons while forcing electrons through the external circuit.',
          param: 'Hydrogen, oxygen supply, and electrical load',
          effect: `Supplying ${h2}% H₂ and ${o2}% O₂ produces ${vCell.toFixed(2)} V and ${power.toFixed(1)} W of clean electrical power.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const vCell = st.c && st.c.state ? st.c.state.vCell : 0.74;
      const power = st.c && st.c.state ? st.c.state.power : 9.5;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Polymer Electrolyte Membrane Fuel Cell (PEMFC)', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 8 · H₂ = ${p.hydrogen}% · O₂ = ${p.oxygen}% · Temp = ${p.temperature} °C · V = ${vCell.toFixed(2)} V · P = ${power.toFixed(1)} W`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 155, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.4, 'rgba(226, 232, 240, 0.65)');

      // ─── 3D PEMFC MEMBRANE ELECTRODE ASSEMBLY (MEA) ───
      // Layer 1: Anode Graphite Bipolar Flow Plate with serpentine grooves (x = -2.2)
      C3D.drawBox(g, P, [-2.2, 0, 0], [0.35, 1.8, 2.2], '#1e293b', { scene, stroke: '#0f172a' });

      // Layer 2: Anode Carbon Paper Gas Diffusion Layer (GDL, x = -1.4)
      C3D.drawBox(g, P, [-1.4, 0, 0], [0.25, 1.7, 2.1], '#475569', { scene, stroke: '#334155' });

      // Layer 3: Anode Platinum Catalyst Layer (speckled Pt, x = -0.8)
      C3D.drawBox(g, P, [-0.8, 0, 0], [0.15, 1.65, 2.05], '#94a3b8', { scene, stroke: '#64748b' });

      // Layer 4: Central Nafion Polymer Electrolyte Membrane (translucent emerald green, x = 0.0)
      C3D.drawBox(g, P, [0.0, 0, 0], [0.25, 1.75, 2.15], '#10b981', { scene, alpha: 0.55, stroke: '#059669' });

      // Layer 5: Cathode Platinum Catalyst Layer (x = 0.8)
      C3D.drawBox(g, P, [0.8, 0, 0], [0.15, 1.65, 2.05], '#94a3b8', { scene, stroke: '#64748b' });

      // Layer 6: Cathode Carbon Paper Gas Diffusion Layer (x = 1.4)
      C3D.drawBox(g, P, [1.4, 0, 0], [0.25, 1.7, 2.1], '#475569', { scene, stroke: '#334155' });

      // Layer 7: Cathode Graphite Bipolar Flow Plate (x = 2.2)
      C3D.drawBox(g, P, [2.2, 0, 0], [0.35, 1.8, 2.2], '#1e293b', { scene, stroke: '#0f172a' });

      // ─── GAS & ION PARTICLES ───
      // 1. Hydrogen gas entering anode flow channels (white diatomic H2)
      if (step >= 1) {
        for (let h = 0; h < 8; h++) {
          const hy = ((h * 0.35 + time * 0.8) % 1.6) - 0.8;
          const hz = ((h * 0.45) % 1.6) - 0.8;
          scene.add(P([-2.0, hy, hz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [-2.0, hy, hz], 0.1, '#ffffff', 'H₂');
          });
        }
      }

      // 2. Protons (H⁺, red glowing particles) crossing Nafion membrane
      if (step >= 2) {
        for (let pIdx = 0; pIdx < 12; pIdx++) {
          const tNorm = ((time * 1.4 + pIdx * 0.15) % 1);
          const px = -0.8 + tNorm * 1.6;
          const py = ((pIdx * 0.37) % 1.4) - 0.7;
          const pz = ((pIdx * 0.41) % 1.5) - 0.75;
          scene.add(P([px, py, pz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [px, py, pz], 0.08, '#ef4444', 'H', '+');
          });
        }
      }

      // 3. Electrons (e⁻, yellow dots) travelling through external overhead wire
      if (step >= 2) {
        for (let e = 0; e < 8; e++) {
          const eNorm = ((time * 1.6 + e * 0.12) % 1);
          let ex, ez;
          if (eNorm < 0.25) { ex = -2.2; ez = 1.1 + (eNorm / 0.25) * 1.2; }
          else if (eNorm < 0.75) { ex = -2.2 + ((eNorm - 0.25) / 0.5) * 4.4; ez = 2.3; }
          else { ex = 2.2; ez = 2.3 - ((eNorm - 0.75) / 0.25) * 1.2; }
          scene.add(P([ex, 0, ez]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [ex, 0, ez], 0.08, '#eab308', 'e', '-');
          });
        }
      }

      // 4. Oxygen entering cathode channels (red diatomic O2)
      if (step >= 4) {
        for (let o = 0; o < 8; o++) {
          const oy = ((o * 0.35 + time * 0.8) % 1.6) - 0.8;
          const oz = ((o * 0.45) % 1.6) - 0.8;
          scene.add(P([2.0, oy, oz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [2.0, oy, oz], 0.11, '#dc2626', 'O₂');
          });
        }
      }

      // 5. Water droplet product (H2O, translucent cyan beads) forming at cathode
      if (step >= 5) {
        for (let w = 0; w < 6; w++) {
          const wy = ((w * 0.4 + time * 0.5) % 1.5) - 0.75;
          const wz = -0.6 - ((time * 0.5 + w * 0.2) % 0.8);
          scene.add(P([1.4, wy, wz]).depth, (ctx) => {
            C3D.drawSphere(ctx, P, [1.4, wy, wz], 0.12, '#38bdf8', { stroke: '#0284c7' });
          });
        }
      }

      // Overhead Circuit & Light Bulb / Load
      C3D.drawPipe(g, P, [-2.2, 0, 1.1], [-2.2, 0, 2.3], 0.05, '#334155', { scene });
      C3D.drawPipe(g, P, [-2.2, 0, 2.3], [2.2, 0, 2.3], 0.05, '#334155', { scene });
      C3D.drawPipe(g, P, [2.2, 0, 2.3], [2.2, 0, 1.1], 0.05, '#334155', { scene });

      // Illuminated LED Light Bulb at center
      scene.add(P([0, 0, 2.3]).depth, (ctx) => {
        C3D.drawSphere(ctx, P, [0, 0, 2.3], 0.22, step >= 2 ? '#fef08a' : '#64748b', { stroke: '#ca8a04' });
      });

      // Digital Power Meter
      C3D.drawVoltmeter(g, P, [0, 0, -1.3], 1.2, vCell, 1.5, {
        scene,
        label: `CELL VOLTAGE (${power.toFixed(1)} W)`,
        decimals: 2
      });

      // Gas Manifold Pipes
      C3D.drawPipe(g, P, [-3.4, 0, 0], [-2.4, 0, 0], 0.12, '#ffffff', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [3.4, 0, 0], [2.4, 0, 0], 0.12, '#dc2626', { scene, flow: true, t: time });

      // Tags identifying layers
      scene.add(P([-2.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-2.2, 0, 1.2], 'Anode Bipolar Plate (H₂)', '#0f172a', -22); });
      scene.add(P([-0.8, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.8, 0, 1.2], 'Anode Pt Catalyst (H₂ → 2H⁺ + 2e⁻)', '#475569', -22); });
      scene.add(P([0, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.2], 'Nafion PEM (H⁺ Conduction)', '#059669', -22); });
      scene.add(P([0.8, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.8, 0, 1.2], 'Cathode Pt (½O₂ + 2H⁺ + 2e⁻ → H₂O)', '#475569', -22); });
      scene.add(P([2.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.2, 0, 1.2], 'Cathode Bipolar Plate (O₂)', '#0f172a', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'H₂ Hydrogen Fuel Gas', color: '#ffffff', symbol: true },
        { label: 'H⁺ Hydrated Proton (PEM)', color: '#ef4444', symbol: true },
        { label: 'e⁻ Electron Current (External)', color: '#eab308', symbol: true },
        { label: 'O₂ Oxygen / Air Feed', color: '#dc2626', symbol: true },
        { label: 'H₂O Water Product Droplets', color: '#38bdf8' },
        { label: 'Nafion Membrane Sheet', color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION — EDTA Hardness Titration (chem-edta-hardness)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-edta-hardness'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('sampleVolume', 'Water sample aliquot', 10, 100, 5, 50, 'mL'),
      r('edtaMolarity', 'Standard EDTA molarity', 0.005, 0.05, 0.005, 0.01, 'M'),
      r('initialBurette', 'Initial burette reading', 0, 20, 0.5, 0, 'mL'),
      r('finalBurette', 'Final burette reading', 0, 50, 0.5, 14.5, 'mL'),
      r('pH', 'Buffer pH condition', 8.0, 12.0, 0.1, 10.0, '')
    ],
    steps: () => [
      {
        title: 'Pipette Hard Water Aliquot',
        text: 'A clean 50 mL pipette transfers an accurate volume of the hard water sample into a 250 mL Erlenmeyer conical flask.'
      },
      {
        title: 'Add Ammonia Buffer (pH 10)',
        text: '1–2 mL of NH₄Cl–NH₄OH buffer is added to maintain alkaline pH ~10, ensuring complete ionization of EDTA and stable complex formation.'
      },
      {
        title: 'Add Eriochrome Black T Indicator',
        text: 'EBT indicator is added. Trace Ca²⁺/Mg²⁺ binds with EBT to form an unstable wine-red complex: M²⁺ + EBT → [M-EBT] (wine red).'
      },
      {
        title: 'Burette Titration with EDTA',
        text: 'Standard disodium EDTA solution is delivered dropwise from the burette with continuous swirling. EDTA binds free Ca²⁺ and Mg²⁺ as [M-EDTA]²⁻.'
      },
      {
        title: 'Detect Sharp Equivalence Endpoint',
        text: 'When all free metal ions are consumed, EDTA extracts metal from the weaker [M-EBT] complex, releasing free EBT dye which turns the solution steel blue.'
      },
      {
        title: 'Calculate Total Hardness',
        text: 'Calculate total hardness: Hardness (mg/L CaCO₃) = (V_EDTA × M_EDTA × 100,000) / V_sample. Titre V = Final − Initial reading.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.sampleVolume <= 0) w.push('Sample volume must be greater than zero.');
      if (p.finalBurette < p.initialBurette) w.push('Final reading cannot be less than initial reading.');
      return w;
    },
    compute: (p) => {
      const sv = Number(p.sampleVolume) || 50;
      const m = Number(p.edtaMolarity) || 0.01;
      const vInit = Number(p.initialBurette) || 0;
      const vFin = Number(p.finalBurette) || 14.5;
      const titre = Math.max(0, vFin - vInit);
      const hardness = (titre * m * 100000) / Math.max(1, sv);
      const isEndpoint = titre >= 10.0;

      return {
        formulas: [{
          name: 'Total Hardness by EDTA Titration',
          formula: 'Hardness (mg/L CaCO₃) = (V_EDTA × M_EDTA × 100,000) / V_sample',
          given: `V_EDTA = ${titre.toFixed(1)} mL, M = ${m} M, V_sample = ${sv} mL`,
          calc: `(${titre.toFixed(1)} × ${m} × 100,000) / ${sv}`,
          result: `${hardness.toFixed(1)} mg/L as CaCO₃`,
          unit: 'mg/L as CaCO₃'
        }],
        readouts: [
          { label: 'EDTA Titre Volume', value: `${titre.toFixed(1)} mL`, tone: 'blue' },
          { label: 'Calculated Hardness', value: `${hardness.toFixed(1)} mg/L`, tone: 'green' },
          { label: 'Buffer pH', value: `${Number(p.pH).toFixed(1)}`, tone: 'blue' },
          { label: 'Solution Color', value: isEndpoint ? 'Pure Steel Blue' : 'Wine Red', tone: isEndpoint ? 'green' : 'amber' }
        ],
        state: { titre, hardness, isEndpoint },
        explain: {
          what: 'Standard volumetric complexometric EDTA titration using Eriochrome Black T indicator at buffered pH 10.',
          why: 'Stability constant of [M-EDTA]²⁻ is greater than [M-EBT]. At the endpoint, free EBT is liberated with sharp wine-red to blue transition.',
          param: 'Burette titre and sample volume',
          effect: `A titre of ${titre.toFixed(1)} mL corresponds to ${hardness.toFixed(1)} mg/L CaCO₃ total hardness in ${sv} mL sample.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const vInit = Number(p.initialBurette) || 0;
      const vFin = Number(p.finalBurette) || 14.5;
      const titre = Math.max(0, vFin - vInit);
      const isEndpoint = step >= 4 || titre >= 12.0;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('EDTA Hardness Titration Virtual Laboratory', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Titre = ${titre.toFixed(1)} mL · Sample = ${p.sampleVolume} mL · Molarity = ${p.edtaMolarity} M`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 165, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.2, 'rgba(226, 232, 240, 0.65)');

      // Laboratory Stand and Clamp
      C3D.drawBox(g, P, [-0.6, 0.4, -1.15], [1.1, 0.8, 0.1], '#475569', { scene });
      C3D.drawCylinder(g, P, [-0.6, 0.4, -1.1], 0.06, 5.0, '#64748b', { scene });
      C3D.drawPipe(g, P, [-0.6, 0.4, 3.2], [0.3, 0, 3.2], 0.05, '#94a3b8', { scene });

      // 50 mL Graduated Burette clamped at [0.3, 0, 1.8]
      const buretteFrac = Math.max(0.1, 1 - (vFin / 50));
      C3D.drawBurette(g, P, [0.3, 0, 1.8], 0.22, 2.7, buretteFrac, '#0ea5e9', { scene });

      // Falling droplet animation during titration (Step 3 or 4)
      if (step === 3 || (step === 4 && !isEndpoint)) {
        const dropY = 1.8 - 0.75 - ((time * 4) % 1.2);
        const dropPos = [0.3, 0, dropY];
        scene.add(P(dropPos).depth, (ctx) => { C3D.drawDroplet(ctx, P, dropPos, 0.07, '#0ea5e9'); });
      }

      // Conical Flask on white ceramic tile
      const flaskPos = [0.3, 0, -1.1];
      C3D.drawBox(g, P, flaskPos, [1.4, 1.4, 0.05], '#ffffff', { scene, stroke: '#cbd5e1' });

      let flaskColor = '#bae6fd';
      if (step >= 2 && !isEndpoint) flaskColor = '#9f1239'; // wine red
      else if (step >= 4 || isEndpoint) flaskColor = '#2563eb'; // blue

      C3D.drawFlask(g, P, flaskPos, 1.25, 0.35, 1.6, 0.7, 1.0, flaskColor, { scene, liquidAlpha: 0.85 });

      // Digital Magnetic Stirrer beneath flask with subtle swirl
      C3D.drawCylinder(g, P, [0.3, 0, -1.15], 0.8, 0.15, '#334155', { scene, topCap: true });

      // Pipette on side bench (Step 0)
      if (step === 0) {
        C3D.drawPipe(g, P, [-2.2, 0, -1.0], [-2.2, 0, 1.2], 0.06, '#bae6fd', { scene });
        C3D.drawCylinder(g, P, [-2.2, 0, -0.2], 0.16, 0.6, '#bae6fd', { scene, alpha: 0.7 });
      }

      // Reagent Dropper Bottles (Buffer pH 10 & EBT Indicator)
      C3D.drawCylinder(g, P, [-2.0, 0.6, -1.1], 0.28, 0.8, '#f59e0b', { scene, topCap: true, label: 'EBT' });
      C3D.drawCylinder(g, P, [-2.7, 0.6, -1.1], 0.32, 0.9, '#e2e8f0', { scene, topCap: true, label: 'Buffer' });

      // Tags
      scene.add(P([0.3, 0, 4.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.3, 0, 4.5], `Burette (${vFin.toFixed(1)} mL)`, '#0369a1', -22); });
      scene.add(P([0.3, 0, 0.6]).depth, (ctx) => {
        const stateLbl = isEndpoint ? 'Endpoint: Pure Steel Blue' : step >= 2 ? 'Sample + EBT: Wine Red' : 'Sample + Buffer';
        C3D.drawTag(ctx, P, [0.3, 0, 0.6], stateLbl, isEndpoint ? '#1d4ed8' : '#9f1239', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'EDTA Titrant (Burette)', color: '#0ea5e9' },
        { label: '[M-EBT] Wine Red Complex', color: '#9f1239', symbol: true },
        { label: 'Free EBT Steel Blue Endpoint', color: '#2563eb', symbol: true },
        { label: 'NH₄Cl-NH₄OH Buffer (pH 10)', color: '#e2e8f0' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION — Zeolite Process Simulator (chem-zeolite)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-zeolite'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('hardness', 'Influent water hardness', 50, 500, 10, 250, 'mg/L'),
      r('capacity', 'Zeolite bed capacity', 100, 1000, 25, 600, 'meq'),
      r('flowRate', 'Water flow rate', 5, 50, 5, 20, 'L/h'),
      r('regeneration', '10% NaCl brine regeneration', 0, 100, 5, 0, '%')
    ],
    steps: () => [
      {
        title: 'Inspect Zeolite / Permutit Bed',
        text: '3D column containing hydrated sodium aluminosilicate zeolite beads (Na₂Z = Na₂O·Al₂O₃·xSiO₂·yH₂O). Porous open framework holds mobile exchangeable Na⁺ cations.'
      },
      {
        title: 'Feed Hard Water Downward',
        text: 'Hard water containing Ca²⁺ (green) and Mg²⁺ (purple) percolates downward through the porous green sodium zeolite bed.'
      },
      {
        title: 'Cation Exchange Reaction',
        text: 'Zeolite preferentially captures divalent hardness ions, exchanging them for equivalent sodium ions: Na₂Z + Ca²⁺ → CaZ + 2Na⁺ and Na₂Z + Mg²⁺ → MgZ + 2Na⁺.'
      },
      {
        title: 'Collect Zero-Hardness Softened Water',
        text: 'Treated water exits bottom with near-zero hardness (< 10 mg/L). Sodium salts (NaHCO₃, Na₂SO₄, NaCl) in effluent do not cause hardness or boiler scale.'
      },
      {
        title: 'Zeolite Bed Exhaustion',
        text: 'After treating large volumes, all exchangeable Na⁺ sites are converted to CaZ and MgZ. Hardness breakthrough occurs, requiring chemical regeneration.'
      },
      {
        title: 'Regeneration with 10% NaCl Brine',
        text: '10% sodium chloride brine is washed through the exhausted bed, driving the equilibrium backward: CaZ + 2NaCl → Na₂Z + CaCl₂. CaCl₂ and MgCl₂ wash to waste.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.hardness <= 0) w.push('Influent hardness must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const h = Number(p.hardness) || 250;
      const cap = Number(p.capacity) || 600;
      const reg = Number(p.regeneration) || 0;
      const isRegen = reg > 0;
      const bedLoad = Math.min(100, (h / cap) * 100 * (1 - reg / 120));
      const resHardness = isRegen ? 0 : Math.max(5, (bedLoad > 90 ? h * 0.4 : 10));

      return {
        formulas: [{
          name: 'Zeolite Softening & Regeneration Equilbria',
          formula: 'Softening: Na₂Z + Ca²⁺ ⇌ CaZ + 2Na⁺  ;  Regeneration: CaZ + 2NaCl ⇌ Na₂Z + CaCl₂',
          given: `Hardness = ${h} mg/L, Capacity = ${cap} meq, Brine = ${reg}%`,
          calc: `Exchange efficiency = ${(100 - bedLoad).toFixed(1)}%`,
          result: `${resHardness.toFixed(1)} mg/L residual hardness`,
          unit: 'mg/L residual'
        }],
        readouts: [
          { label: 'Influent Hardness', value: `${h} mg/L`, tone: 'amber' },
          { label: 'Softened Effluent', value: `${resHardness.toFixed(1)} mg/L`, tone: 'green' },
          { label: 'Zeolite Bed Loading', value: `${bedLoad.toFixed(1)}%`, tone: bedLoad > 80 ? 'amber' : 'blue' },
          { label: 'Process Stage', value: isRegen ? `Brine Wash (${reg}%)` : 'Softening Service', tone: isRegen ? 'amber' : 'green' }
        ],
        state: { h, cap, bedLoad, resHardness, isRegen },
        explain: {
          what: 'Sodium zeolite (natural greensand or synthetic permutit) exchanges Na⁺ for Ca²⁺ and Mg²⁺ ions.',
          why: 'The process produces zero hardness water (< 10 mg/L) without sludge formation, easily regenerated with cheap common salt.',
          param: 'Bed capacity and brine regeneration',
          effect: `Influent of ${h} mg/L hardness is softened to ${resHardness.toFixed(1)} mg/L; bed is currently at ${bedLoad.toFixed(0)}% saturation.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const isRegen = (Number(p.regeneration) || 0) > 0 || step === 5;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Zeolite (Permutit) Water Softening Process', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Influent = ${p.hardness} mg/L · Capacity = ${p.capacity} meq · Status = ${isRegen ? 'Brine Regeneration' : 'Active Softening'}`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 160, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.4, 'rgba(226, 232, 240, 0.65)');

      // 1. Zeolite Softening Column at center [-0.4, 0, -1.2]
      const colPos = [-0.4, 0, -1.2];
      C3D.drawCylinder(g, P, colPos, 0.95, 3.4, '#bae6fd', { scene, alpha: 0.28, topCap: true, bottomCap: true, stroke: '#0284c7' });

      // Graded gravel support at bottom (z = -1.2 to -0.6)
      C3D.drawCylinder(g, P, colPos, 0.94, 0.6, '#78716c', { scene, alpha: 0.85 });

      // Active Zeolite Bed (z = -0.6 to 1.4, packed with green/emerald spheres)
      const beadCount = 36;
      for (let i = 0; i < beadCount; i++) {
        const bx = -0.4 + ((i * 0.23) % 1.2) - 0.6;
        const by = ((i * 0.31) % 1.0) - 0.5;
        const bz = -0.5 + (i * 0.05);
        const beadCol = isRegen ? '#38bdf8' : (i < 18 ? '#15803d' : '#84cc16');
        scene.add(P([bx, by, bz]).depth, (ctx) => {
          C3D.drawSphere(ctx, P, [bx, by, bz], 0.12, beadCol, { stroke: '#166534' });
        });
      }

      // 2. 10% NaCl Brine Tank on Right [2.2, 0, -0.6]
      C3D.drawCylinder(g, P, [2.2, 0, -0.6], 0.75, 1.8, '#f8fafc', { scene, alpha: 0.85, topCap: true, stroke: '#cbd5e1' });
      // Brine pipe connecting to top of zeolite column
      C3D.drawPipe(g, P, [2.2, 0, 1.0], [2.2, 0, 2.0], 0.08, '#38bdf8', { scene });
      C3D.drawPipe(g, P, [2.2, 0, 2.0], [-0.4, 0, 2.0], 0.08, '#38bdf8', { scene, flow: isRegen, t: time, flowColor: '#ffffff' });

      // 3. Raw water inlet pipe on left
      C3D.drawPipe(g, P, [-2.6, 0, 2.0], [-0.4, 0, 2.0], 0.12, '#0ea5e9', { scene, flow: !isRegen, t: time });
      // Softened effluent pipe at bottom
      C3D.drawPipe(g, P, [-0.4, 0, -0.9], [1.6, 0, -0.9], 0.12, '#0284c7', { scene, flow: !isRegen, t: time, speed: 2 });
      // Waste wash drain for CaCl2 / MgCl2 (used during regeneration)
      C3D.drawPipe(g, P, [-0.4, 0, -1.2], [-0.4, 0, -1.8], 0.1, '#dc2626', { scene, flow: isRegen, t: time, flowColor: '#ffffff' });

      // 4. Moving ions
      if (!isRegen) {
        // Entering Ca2+ (green) and Mg2+ (purple)
        for (let i = 0; i < 4; i++) {
          const tNorm = ((time * 0.8 + i * 0.25) % 1);
          const iPos = [-2.4 + tNorm * 2.0, 0, 2.0];
          scene.add(P(iPos).depth, (ctx) => {
            const sym = i % 2 === 0 ? 'Ca' : 'Mg';
            const col = i % 2 === 0 ? '#16a34a' : '#9333ea';
            C3D.drawAtom(ctx, P, iPos, 0.12, col, sym, '2+');
          });
        }
        // Exiting Na+ (yellow) into softened water
        for (let i = 0; i < 4; i++) {
          const tNorm = ((time * 1.2 + i * 0.25) % 1);
          const naPos = [-0.4 + tNorm * 1.8, 0, -0.9];
          scene.add(P(naPos).depth, (ctx) => {
            C3D.drawAtom(ctx, P, naPos, 0.11, '#eab308', 'Na', '+');
          });
        }
      }

      // Tags
      scene.add(P([-0.4, 0, 2.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.4, 0, 2.2], 'Sodium Zeolite Bed (Na₂Z)', '#15803d', -22); });
      scene.add(P([2.2, 0, 1.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.2, 0, 1.3], '10% NaCl Brine Tank', '#0284c7', -22); });
      scene.add(P([1.6, 0, -0.9]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.6, 0, -0.9], 'Softened Water (< 10 mg/L)', '#059669', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Zeolite Mineral Bed (Na₂Z)', color: '#15803d' },
        { label: 'Ca²⁺ Hardness Captured', color: '#16a34a', symbol: true },
        { label: 'Mg²⁺ Hardness Captured', color: '#9333ea', symbol: true },
        { label: 'Na⁺ Sodium Released', color: '#eab308', symbol: true },
        { label: '10% NaCl Regenerant Brine', color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION — Reverse Osmosis Simulator (chem-reverse-osmosis)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-reverse-osmosis'] = {
    view3d: true,
    initialView: { yaw: -0.48, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('pressure', 'Applied hydraulic pressure', 5, 80, 2, 35, 'bar'),
      r('salt', 'Feed salinity (TDS)', 100, 5000, 100, 1200, 'mg/L'),
      r('membrane', 'Membrane salt rejection', 50, 99, 1, 95, '%'),
      r('flowRate', 'Feed water flow rate', 5, 100, 5, 40, 'L/min')
    ],
    steps: () => [
      {
        title: 'Spiral-Wound RO Membrane Anatomy',
        text: '3D cutaway of the RO pressure vessel: Central perforated permeate collection tube, multi-leaf polyamide membrane envelopes, feed spacers, and outer FRP pressure shell.'
      },
      {
        title: 'High-Pressure Pumping (> Osmotic Pressure)',
        text: 'High-pressure feed pump applies 35–60 bar pressure, overcoming the natural osmotic pressure (π ≈ 0.00074 × TDS bar) of the saline feed.'
      },
      {
        title: 'Crossflow Membrane Separation',
        text: 'Feed water flows tangentially across the membrane surface. Water molecules are forced through the dense polyamide barrier layer by solution-diffusion.'
      },
      {
        title: 'Salt Rejection Mechanism',
        text: 'Hydrated Na⁺, Cl⁻, and SO₄²⁻ ions are rejected by steric hindrance (size exclusion) and Donnan electrostatic repulsion against the membrane skin.'
      },
      {
        title: 'Collect Pure Permeate Flux',
        text: 'Desalinated pure permeate water spirals inward through porous tricot fabric into the central collection tube (> 95% TDS reduction).'
      },
      {
        title: 'Concentrated Brine Reject Stream',
        text: 'The remaining high-salinity brine concentrate sweeps across the membrane surface to prevent concentration polarization, exiting via the brine outlet valve.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.pressure <= 0) w.push('Applied pressure must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const pApplied = Number(p.pressure) || 35;
      const salt = Number(p.salt) || 1200;
      const rej = Number(p.membrane) || 95;
      const qFeed = Number(p.flowRate) || 40;

      // Osmotic pressure van 't Hoff approx: pi = 0.00074 * TDS bar
      const piOsmotic = salt * 0.00075;
      const netDrivingPressure = Math.max(0, pApplied - piOsmotic);
      const permeateFlux = qFeed * 0.5 * (netDrivingPressure / Math.max(1, pApplied));
      const permeateSalinity = salt * (1 - rej / 100);

      return {
        formulas: [{
          name: 'Reverse Osmosis Water Flux & Salt Passage',
          formula: 'J_w = A × (ΔP − Δπ)  ;  C_p = C_f × (1 − R)',
          given: `ΔP = ${pApplied} bar, Δπ = ${piOsmotic.toFixed(1)} bar, C_f = ${salt} mg/L, R = ${rej}%`,
          calc: `Net driving = ${netDrivingPressure.toFixed(1)} bar  ;  C_p = ${salt} × (1 − ${(rej / 100).toFixed(2)})`,
          result: `${permeateSalinity.toFixed(1)} mg/L permeate (${permeateFlux.toFixed(1)} L/min)`,
          unit: 'mg/L TDS'
        }],
        readouts: [
          { label: 'Applied Pressure', value: `${pApplied} bar`, tone: 'blue' },
          { label: 'Osmotic Threshold (π)', value: `${piOsmotic.toFixed(1)} bar`, tone: 'amber' },
          { label: 'Net Driving Pressure', value: `${netDrivingPressure.toFixed(1)} bar`, tone: netDrivingPressure > 0 ? 'green' : 'amber' },
          { label: 'Permeate Salinity', value: `${permeateSalinity.toFixed(1)} mg/L`, tone: 'green' }
        ],
        state: { pApplied, piOsmotic, netDrivingPressure, permeateSalinity, permeateFlux },
        explain: {
          what: 'Reverse Osmosis applies hydraulic pressure exceeding natural osmotic pressure to reverse water flow across a semipermeable membrane.',
          why: 'Dense non-porous aromatic polyamide skin permits water diffusion while rejecting dissolved mineral ions and micro-pollutants.',
          param: 'Applied pressure and salt concentration',
          effect: `With ${pApplied} bar applied against ${piOsmotic.toFixed(1)} bar osmotic pressure, permeate salinity is reduced to ${permeateSalinity.toFixed(1)} mg/L.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const pApplied = Number(p.pressure) || 35;
      const salt = Number(p.salt) || 1200;
      const piOsmotic = salt * 0.00075;
      const isFluxing = pApplied > piOsmotic && step >= 1;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Spiral-Wound Reverse Osmosis (RO) Membrane', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Pressure = ${pApplied} bar · Feed TDS = ${salt} mg/L · Osmotic π = ${piOsmotic.toFixed(1)} bar`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 160, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.3, 'rgba(226, 232, 240, 0.65)');

      // 1. Central Perforated Permeate Tube (stainless steel cylinder)
      C3D.drawCylinder(g, P, [-2.2, 0, 0], 0.25, 4.4, '#e2e8f0', { scene, topCap: true, bottomCap: true, stroke: '#94a3b8' });

      // 2. Spiral-wound membrane leaves wrapped around central tube
      // Outer FRP pressure vessel shell (cutaway view)
      C3D.drawCylinder(g, P, [-1.8, 0, 0], 1.25, 3.6, '#0284c7', { scene, alpha: 0.22, stroke: '#0369a1' });

      // Spiral membrane layers inside
      C3D.drawCylinder(g, P, [-1.7, 0, 0], 0.95, 3.4, '#fef08a', { scene, alpha: 0.55, stroke: '#ca8a04' });
      C3D.drawCylinder(g, P, [-1.6, 0, 0], 0.65, 3.2, '#38bdf8', { scene, alpha: 0.65, stroke: '#0284c7' });

      // 3. High-Pressure Pump on Left [-3.6, 0, -0.6]
      C3D.drawBox(g, P, [-3.6, 0, -0.4], [1.2, 0.9, 0.9], '#334155', { scene, stroke: '#1e293b' });
      C3D.drawCylinder(g, P, [-3.6, 0, 0.3], 0.35, 0.5, '#475569', { scene, topCap: true });

      // Feed piping from pump into membrane pressure vessel
      C3D.drawPipe(g, P, [-3.6, 0, 0.5], [-1.8, 0, 1.4], 0.14, '#b45309', { scene, flow: true, t: time, speed: 2 });

      // Permeate pure water exiting central tube on right
      C3D.drawPipe(g, P, [2.2, 0, 0], [3.6, 0, 0], 0.1, '#38bdf8', { scene, flow: isFluxing, t: time, speed: 3, flowColor: '#ffffff' });

      // Concentrate brine reject stream exiting bottom right
      C3D.drawPipe(g, P, [1.8, 0, -1.0], [3.6, 0, -1.0], 0.12, '#78350f', { scene, flow: true, t: time, speed: 1.5 });

      // 4. Ions & water molecules
      if (isFluxing) {
        // Water molecules squeezing into central tube (cyan droplets)
        for (let w = 0; w < 10; w++) {
          const tNorm = ((time * 1.5 + w * 0.1) % 1);
          const rad = 0.9 - tNorm * 0.65;
          const ang = w * 1.2;
          const zPos = -1.2 + (w * 0.25);
          const wPos = [-1.5 + zPos, rad * Math.sin(ang), rad * Math.cos(ang)];
          scene.add(P(wPos).depth, (ctx) => {
            C3D.drawSphere(ctx, P, wPos, 0.08, '#38bdf8', { stroke: '#0284c7' });
          });
        }
        // Rejected salt ions (yellow Na+, mint Cl-) bouncing off membrane
        for (let s = 0; s < 8; s++) {
          const sx = -1.2 + ((s * 0.35 + time * 0.5) % 2.5);
          const sy = 1.0;
          const sz = 0.5;
          scene.add(P([sx, sy, sz]).depth, (ctx) => {
            const sym = s % 2 === 0 ? 'Na' : 'Cl';
            const col = s % 2 === 0 ? '#eab308' : '#10b981';
            C3D.drawAtom(ctx, P, [sx, sy, sz], 0.1, col, sym, sym === 'Na' ? '+' : '-');
          });
        }
      }

      // Digital Pressure Gauge
      C3D.drawVoltmeter(g, P, [0, 0, 1.8], 1.0, pApplied, 80, {
        scene,
        label: 'FEED PRESSURE (bar)',
        decimals: 0
      });

      // Tags
      scene.add(P([-3.6, 0, 0.9]).depth, (ctx) => { C3D.drawTag(ctx, P, [-3.6, 0, 0.8], 'High-Pressure Pump', '#334155', -22); });
      scene.add(P([0, 0, 0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 0.7], 'Spiral Polyamide Leaf Membrane', '#ca8a04', -22); });
      scene.add(P([3.6, 0, 0.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [3.6, 0, 0.2], 'Pure Permeate (> 95% Salt Rejection)', '#0284c7', -22); });
      scene.add(P([3.6, 0, -1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [3.6, 0, -1.0], 'Concentrate / Brine Reject', '#78350f', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'High-Pressure Saline Feed', color: '#b45309' },
        { label: 'Semipermeable Polyamide Layer', color: '#fef08a' },
        { label: 'Pure Desalinated Permeate', color: '#38bdf8' },
        { label: 'Rejected Na⁺ / Cl⁻ Ions', color: '#eab308', symbol: true },
        { label: 'Concentrated Brine Reject', color: '#78350f' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION — Sedimentation with Coagulant Simulator (chem-sedimentation)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-sedimentation'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('particle', 'Colloidal particle size (d)', 1, 100, 5, 25, 'µm'),
      r('settling', 'Settling duration', 1, 60, 1, 20, 'min'),
      r('coagulant', 'Alum coagulant dose', 0, 80, 2, 30, 'mg/L')
    ],
    steps: () => [
      {
        title: 'Colloidal Suspension Dispersion',
        text: 'Raw water contains fine suspended clay and silt particles (1–50 µm). Due to small diameter, Stokes settling velocity is negligible without coagulants.'
      },
      {
        title: 'Add Alum Coagulant (Rapid Mix)',
        text: 'Alum Al₂(SO₄)₃·18H₂O dissolves, forming trivalent Al³⁺ and polynuclear hydroxo-complexes that neutralize negative colloidal zeta potentials.'
      },
      {
        title: 'Flocculation & Stokes Aggregation',
        text: 'Gentle stirring causes particles to collide and aggregate into large flocs. Effective diameter increases from 25 µm to > 500 µm.'
      },
      {
        title: 'Accelerated Gravitational Settling',
        text: 'According to Stokes’ Law (v_t ∝ d²), larger flocs settle with quadrupled velocity, forming a visible downward settling front.'
      },
      {
        title: 'Sludge Blanket Compaction',
        text: 'Settled flocs accumulate at the bottom of the column, undergoing zone settling and compressive dewatering to form a dense sludge bed.'
      },
      {
        title: 'Clarified Supernatant Decantation',
        text: 'The supernatant liquid turns crystal clear. Overall solids removal percentage is calculated based on particle diameter, coagulant dose, and settling time.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.particle <= 0) w.push('Particle size must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const d = Number(p.particle) || 25;
      const t = Number(p.settling) || 20;
      const dose = Number(p.coagulant) || 30;

      // Stokes & flocculation model: removal = 100 * (1 - exp(-t * (d/80 + dose/300)))
      const removal = Math.min(99.5, 100 * (1 - Math.exp(-t * (d / 80 + dose / 300))));
      const flocDiam = d * (1 + (dose / 15)); // effective floc diameter um
      const stokesVelocity = (flocDiam * flocDiam) * 0.0012; // mm/s

      return {
        formulas: [{
          name: 'Stokes’ Law & Flocculent Sedimentation',
          formula: 'v_t = [g(ρ_p − ρ)d²] / (18μ)  ;  η = 100 × [1 − e^(−t·(d/80 + dose/300))]',
          given: `d = ${d} µm, Coagulant = ${dose} mg/L, Time = ${t} min`,
          calc: `Floc size = ${flocDiam.toFixed(0)} µm  ;  v_t = ${stokesVelocity.toFixed(2)} mm/s`,
          result: `${removal.toFixed(1)}% solids removed`,
          unit: '% removal'
        }],
        readouts: [
          { label: 'Settling Removal', value: `${removal.toFixed(1)}%`, tone: 'green' },
          { label: 'Effective Floc Size', value: `${flocDiam.toFixed(0)} µm`, tone: 'blue' },
          { label: 'Settling Velocity', value: `${stokesVelocity.toFixed(2)} mm/s`, tone: 'blue' },
          { label: 'Supernatant Clarity', value: removal > 80 ? 'Clear Supernatant' : 'Turbid Water', tone: removal > 80 ? 'green' : 'amber' }
        ],
        state: { removal, flocDiam, stokesVelocity, d, t, dose },
        explain: {
          what: 'Sedimentation utilizes gravity to separate denser suspended solids from water.',
          why: 'Stokes’ law dictates settling velocity is proportional to the square of particle diameter (d²); coagulants enlarge flocs exponentially accelerating settling.',
          param: 'Coagulant dose and settling time',
          effect: `With ${dose} mg/L coagulant and ${t} min settling, flocs grow to ${flocDiam.toFixed(0)} µm achieving ${removal.toFixed(1)}% removal.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const removal = st.c && st.c.state ? st.c.state.removal : 85;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Sedimentation & Coagulation Settling Column', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Particle = ${p.particle} µm · Alum = ${p.coagulant} mg/L · Settling Time = ${p.settling} min · Removal = ${removal.toFixed(1)}%`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 165, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.4, 'rgba(226, 232, 240, 0.65)');

      // Transparent vertical cylindrical settling column [-0.5, 0, -1.2]
      const colPos = [-0.5, 0, -1.2];
      C3D.drawCylinder(g, P, colPos, 1.1, 3.4, '#bae6fd', { scene, alpha: 0.25, topCap: true, bottomCap: true, stroke: '#0284c7' });

      // Water inside column (turbid brown at top transitioning to clear as flocs settle)
      const isSettled = step >= 3;
      const superColor = isSettled ? '#38bdf8' : '#b45309';
      C3D.drawCylinder(g, P, colPos, 1.05, 3.2, superColor, { scene, alpha: isSettled ? 0.45 : 0.65, topCap: true });

      // Sludge blanket layer accumulating at base (z = -1.2 to -0.6)
      if (step >= 2) {
        const sludgeH = 0.3 + (removal / 100) * 0.6;
        C3D.drawCylinder(g, P, colPos, 1.04, sludgeH, '#78350f', { scene, alpha: 0.9, topCap: true });
      }

      // Settling particles / flocs drifting downward with velocity proportional to step
      const numFlocs = 20;
      for (let i = 0; i < numFlocs; i++) {
        const fx = -0.5 + ((i * 0.23) % 1.5) - 0.75;
        const fy = ((i * 0.31) % 1.2) - 0.6;
        const fallSpeed = step >= 2 ? 0.6 : 0.15;
        const fz = 1.6 - ((time * fallSpeed + i * 0.2) % 2.5);
        if (fz > -0.6) {
          const fSize = step >= 2 ? 0.1 : 0.05;
          const fCol = step >= 2 ? '#d97706' : '#78350f';
          scene.add(P([fx, fy, fz]).depth, (ctx) => {
            C3D.drawSphere(ctx, P, [fx, fy, fz], fSize, fCol, { stroke: '#451a03' });
          });
        }
      }

      // Graduations / Height ruler beside settling column
      const rPos = [1.0, 0, -1.2];
      C3D.drawCylinder(g, P, rPos, 0.06, 3.4, '#e2e8f0', { scene });

      // Tags
      scene.add(P([-0.5, 0, 2.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.5, 0, 2.2], 'Clarified Supernatant Zone', '#0284c7', -22); });
      scene.add(P([-0.5, 0, 0.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.5, 0, 0.4], 'Settling Floc Interface (Stokes)', '#d97706', -22); });
      scene.add(P([-0.5, 0, -0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.5, 0, -0.9], 'Compacted Sludge Blanket', '#78350f', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Clarified Supernatant Water', color: '#38bdf8' },
        { label: 'Aggregated Alum Flocs', color: '#d97706' },
        { label: 'Dispersed Clay Particles', color: '#78350f' },
        { label: 'Compacted Sludge Bed', color: '#451a03' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION — Chlorination / Disinfection Simulator (chem-chlorination)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-chlorination'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('dose', 'Chlorine applied dose', 0, 10, 0.2, 2.5, 'mg/L'),
      r('contact', 'Contact / residence time', 1, 60, 1, 30, 'min'),
      r('microbes', 'Raw water microbial load', 10, 100, 5, 80, '%'),
      r('ammonia', 'Ammonia nitrogen in water', 0, 2.0, 0.1, 0.4, 'mg/L')
    ],
    steps: () => [
      {
        title: 'Raw Water Inflow with Microbes',
        text: 'Water containing pathogenic bacteria and viruses enters the disinfection contact basin alongside natural organic matter and ammonia nitrogen.'
      },
      {
        title: 'Chlorine Hydrolysis Reaction',
        text: 'Chlorine gas or sodium hypochlorite hydrolyzes instantaneously: Cl₂ + H₂O ⇌ HOCl + H⁺ + Cl⁻. Hypochlorous acid (HOCl) is the potent germicidal disinfectant.'
      },
      {
        title: 'Chlorine Demand Destruction',
        text: 'Initial chlorine is rapidly consumed by reducing compounds (Fe²⁺, Mn²⁺, H₂S, nitrites) without producing significant pathogen kill.'
      },
      {
        title: 'Chloramine Formation (Combined Chlorine)',
        text: 'HOCl reacts with ammonia to form chloramines: NH₃ + HOCl → NH₂Cl (monochloramine) + H₂O. Chloramines provide weak, slow disinfection.'
      },
      {
        title: 'Breakpoint Chlorination Point',
        text: 'Further chlorine addition oxidizes chloramines into N₂ gas: 2NH₂Cl + HOCl → N₂↑ + 3HCl + H₂O. At the breakpoint, chlorine residual reaches a minimum.'
      },
      {
        title: 'Free Available Chlorine Residual',
        text: 'Beyond the breakpoint, added chlorine remains as free available chlorine (HOCl + OCl⁻), ensuring rapid 99.99% pathogen kill and persistent residual in city pipes.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.dose < 0) w.push('Dose cannot be negative.');
      return w;
    },
    compute: (p) => {
      const dose = Number(p.dose) || 2.5;
      const t = Number(p.contact) || 30;
      const nh3 = Number(p.ammonia) || 0.4;
      const initialMicrobes = Number(p.microbes) || 80;

      // Breakpoint chlorination curve: breakpoint ~ 7.6 * ammonia
      const breakpointDose = 1.0 + nh3 * 3.5;
      let freeCl = 0, combinedCl = 0;
      if (dose < 1.0) {
        // purely demand
        freeCl = 0; combinedCl = 0;
      } else if (dose < breakpointDose) {
        combinedCl = Math.max(0, dose - 1.0);
        freeCl = 0;
      } else {
        combinedCl = 0.2;
        freeCl = Math.max(0, dose - breakpointDose);
      }

      const totalRes = freeCl + combinedCl;
      // CT disinfection model
      const ct = (freeCl * 1.5 + combinedCl * 0.1) * t;
      const killPercent = Math.min(99.999, 100 * (1 - Math.exp(-ct * 0.18)));

      return {
        formulas: [{
          name: 'Chlorination Hydrolysis & Breakpoint Chemistry',
          formula: 'Cl₂ + H₂O ⇌ HOCl + H⁺ + Cl⁻  ;  Kill % = 100 × (1 − e^(−k·CT))',
          given: `Dose = ${dose} mg/L, Contact = ${t} min, NH₃ = ${nh3} mg/L`,
          calc: `Breakpoint = ${breakpointDose.toFixed(1)} mg/L  ;  CT = ${ct.toFixed(1)} mg·min/L`,
          result: `${freeCl.toFixed(2)} mg/L Free Cl₂ (${killPercent.toFixed(2)}% kill)`,
          unit: 'mg/L residual'
        }],
        readouts: [
          { label: 'Free Available Cl₂', value: `${freeCl.toFixed(2)} mg/L`, tone: freeCl >= 0.2 ? 'green' : 'amber' },
          { label: 'Combined Chloramine', value: `${combinedCl.toFixed(2)} mg/L`, tone: 'blue' },
          { label: 'Microbial Inactivation', value: `${killPercent.toFixed(2)}%`, tone: 'green' },
          { label: 'Breakpoint State', value: dose >= breakpointDose ? 'Past Breakpoint (Safe)' : 'Below Breakpoint', tone: dose >= breakpointDose ? 'green' : 'amber' }
        ],
        state: { dose, freeCl, combinedCl, totalRes, killPercent, breakpointDose },
        explain: {
          what: 'Chlorination provides both rapid primary microbial inactivation and a persistent secondary residual in distribution networks.',
          why: 'HOCl is 80 times more effective than OCl⁻; breakpoint chlorination completely destroys chloramines to yield free HOCl.',
          param: 'Chlorine dose, contact time, and ammonia',
          effect: `Dose of ${dose} mg/L provides ${freeCl.toFixed(2)} mg/L free residual chlorine and ${killPercent.toFixed(1)}% microbial destruction over ${t} min.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const freeCl = st.c && st.c.state ? st.c.state.freeCl : 0.8;
      const isPastBreakpoint = freeCl > 0.1;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Chlorination & Breakpoint Disinfection Chamber', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Applied Dose = ${p.dose} mg/L · Contact = ${p.contact} min · Free Cl₂ = ${freeCl.toFixed(2)} mg/L`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 160, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.3, 'rgba(226, 232, 240, 0.65)');

      // Baffled serpentine contact tank
      C3D.drawBox(g, P, [0, 0, 0], [4.2, 2.2, 1.8], '#bae6fd', { scene, alpha: 0.35, stroke: '#0891b2' });

      // Concrete internal baffles forcing zig-zag water path
      C3D.drawBox(g, P, [-1.0, 0.4, 0], [0.15, 1.4, 1.6], '#94a3b8', { scene, stroke: '#64748b' });
      C3D.drawBox(g, P, [1.0, -0.4, 0], [0.15, 1.4, 1.6], '#94a3b8', { scene, stroke: '#64748b' });

      // Chlorine gas / hypochlorite injector manifold on left
      C3D.drawCylinder(g, P, [-2.6, -0.8, -0.8], 0.35, 1.6, '#fef08a', { scene, topCap: true, stroke: '#ca8a04' });
      C3D.drawPipe(g, P, [-2.6, -0.8, 0.8], [-2.0, -0.8, 0.8], 0.08, '#fef08a', { scene, flow: true, t: time, flowColor: '#ffffff' });

      // Inlet and outlet pipes
      C3D.drawPipe(g, P, [-3.2, 0.8, 0], [-2.1, 0.8, 0], 0.14, '#0ea5e9', { scene, flow: true, t: time });
      C3D.drawPipe(g, P, [2.1, -0.8, 0], [3.2, -0.8, 0], 0.14, '#0284c7', { scene, flow: true, t: time, speed: 2 });

      // Pathogen particles: active green on left, inactivated grey on right
      for (let i = 0; i < 14; i++) {
        const px = -1.8 + ((i * 0.28 + time * 0.5) % 3.6);
        const py = Math.sin(px * 1.5) * 0.7;
        const pz = -0.5 + ((i * 0.2) % 1.0);
        const isDead = px > 0.5 && isPastBreakpoint;
        scene.add(P([px, py, pz]).depth, (ctx) => {
          C3D.drawAtom(ctx, P, [px, py, pz], 0.11, isDead ? '#64748b' : '#22c55e', isDead ? 'Inert' : 'Microbe');
        });
      }

      // Tags
      scene.add(P([-2.6, -0.8, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-2.6, -0.8, 1.0], 'Cl₂ Injector (HOCl Formation)', '#ca8a04', -22); });
      scene.add(P([0, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.0], 'Serpentine Baffled Basin', '#0891b2', -22); });
      scene.add(P([3.2, -0.8, 0.2]).depth, (ctx) => {
        const stateLbl = isPastBreakpoint ? 'Disinfected Water (Free Residual)' : 'Sub-Breakpoint Effluent';
        C3D.drawTag(ctx, P, [3.2, -0.8, 0.2], stateLbl, isPastBreakpoint ? '#059669' : '#d97706', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Active Microbial Pathogens', color: '#22c55e', symbol: true },
        { label: 'Inactivated Microbes (Killed)', color: '#64748b', symbol: true },
        { label: 'Chlorine Dosing Stream (HOCl)', color: '#fef08a' },
        { label: 'Free Available Cl₂ Residual', color: '#059669' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION — Electrodialysis Simulator (chem-electrodialysis)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-electrodialysis'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.32, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('voltage', 'Applied stack DC voltage', 5, 100, 5, 40, 'V'),
      r('pairs', 'Membrane cell pairs', 2, 30, 2, 12, 'pairs'),
      r('salt', 'Feed salt concentration', 200, 3000, 50, 900, 'mg/L')
    ],
    steps: () => [
      {
        title: 'Electrodialysis Stack Architecture',
        text: '3D inspection of the ED stack: Positive anode (+) on left, negative cathode (−) on right, alternating Cation Exchange Membranes (CEM) and Anion Exchange Membranes (AEM).'
      },
      {
        title: 'Feed Saline Solution',
        text: 'Brackish water containing Na⁺ (yellow) and Cl⁻ (mint) flows uniformly into parallel flow spacers between the ion-selective membranes.'
      },
      {
        title: 'Apply Direct Current Electric Field',
        text: 'DC voltage establishes an electric potential gradient. Cations (Na⁺) migrate toward the cathode (−); anions (Cl⁻) migrate toward the anode (+).'
      },
      {
        title: 'Ion-Selective Membrane Transport',
        text: 'CEM (negative fixed groups) permits only cations to cross while blocking anions. AEM (positive fixed groups) permits only anions while blocking cations.'
      },
      {
        title: 'Diluate & Concentrate Streams Formation',
        text: 'Ions are depleted from alternate compartments (diluate / product water) and accumulate in adjacent compartments (concentrate / brine waste).'
      },
      {
        title: 'Collect Desalinated Product Water',
        text: 'Fresh demineralized product water exits diluate manifolds (> 85% salt removal), while concentrated brine exits reject channels.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.voltage <= 0) w.push('Applied voltage must be greater than zero.');
      return w;
    },
    compute: (p) => {
      const v = Number(p.voltage) || 40;
      const pairs = Number(p.pairs) || 12;
      const salt = Number(p.salt) || 900;

      const removalPercent = Math.min(95, v * pairs * 0.20);
      const productSalt = Math.max(25, salt * (1 - removalPercent / 100));
      const current = (v / (2.0 + pairs * 0.15)); // Amperes

      return {
        formulas: [{
          name: 'Electrodialysis Ion Migration & Faraday Yield',
          formula: 'Removal % = k × V_stack × N_pairs  ;  Salt_out = Salt_in × (1 − η)',
          given: `V = ${v} V, Pairs = ${pairs}, Salt_in = ${salt} mg/L`,
          calc: `Current = ${current.toFixed(1)} A  ;  Removal = ${removalPercent.toFixed(1)}%`,
          result: `${productSalt.toFixed(1)} mg/L product salt`,
          unit: 'mg/L TDS'
        }],
        readouts: [
          { label: 'Product Salinity', value: `${productSalt.toFixed(1)} mg/L`, tone: 'green' },
          { label: 'Salt Removal', value: `${removalPercent.toFixed(1)}%`, tone: 'green' },
          { label: 'Stack Current', value: `${current.toFixed(1)} A`, tone: 'blue' },
          { label: 'Cell Pairs', value: `${pairs}`, tone: 'blue' }
        ],
        state: { v, pairs, salt, removalPercent, productSalt, current },
        explain: {
          what: 'Electrodialysis drives ionic migration across alternating ion-selective membranes using a DC potential gradient.',
          why: 'CEM rejects anions and AEM rejects cations, creating alternating desalted diluate and concentrated brine channels.',
          param: 'DC voltage and membrane pairs',
          effect: `Applying ${v} V across ${pairs} cell pairs reduces feed salinity from ${salt} to ${productSalt.toFixed(1)} mg/L.`
        }
      };
    },
    draw: (g, st) => {
      const p = st.p;
      const step = st.step;
      const time = st.t;
      const v = Number(p.voltage) || 40;
      const isElectrified = step >= 2;

      D.clear(g, '#f8fafc');

      g.save();
      g.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#0f172a';
      g.fillText('Electrodialysis (ED) Membrane Desalination Stack', 32, 42);
      g.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillStyle = '#64748b';
      g.fillText(`Step ${step + 1} of 6 · Voltage = ${v} V · Pairs = ${p.pairs} · Feed Salt = ${p.salt} mg/L`, 32, 64);
      g.restore();

      const P = C3D.createProjector(st.view, 510, 310, 160, 9);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, 6, 1, -1.3, 'rgba(226, 232, 240, 0.65)');

      // 1. Positive Anode Plate (+) on Left [-2.2, 0, 0]
      C3D.drawBox(g, P, [-2.2, 0, 0], [0.2, 1.8, 2.2], '#dc2626', { scene, stroke: '#991b1b' });

      // 2. Negative Cathode Plate (−) on Right [2.2, 0, 0]
      C3D.drawBox(g, P, [2.2, 0, 0], [0.2, 1.8, 2.2], '#2563eb', { scene, stroke: '#1e40af' });

      // 3. Alternating CEM and AEM membranes in stack
      const memXs = [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5];
      memXs.forEach((mx, idx) => {
        const isCEM = idx % 2 === 0;
        // CEM amber/orange, AEM cyan/blue
        const mCol = isCEM ? '#f59e0b' : '#06b6d4';
        C3D.drawBox(g, P, [mx, 0, 0], [0.08, 1.6, 2.0], mCol, { scene, alpha: 0.65, stroke: isCEM ? '#d97706' : '#0891b2' });
      });

      // 4. Moving ions: Na+ yellow migrating right toward cathode; Cl- mint migrating left toward anode
      if (isElectrified) {
        for (let i = 0; i < 10; i++) {
          const tNorm = ((time * 0.9 + i * 0.15) % 1);
          // Na+ moves right
          const nx = -1.8 + tNorm * 3.6;
          const ny = ((i * 0.35) % 1.2) - 0.6;
          const nz = ((i * 0.45) % 1.4) - 0.7;
          scene.add(P([nx, ny, nz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [nx, ny, nz], 0.1, '#eab308', 'Na', '+');
          });

          // Cl- moves left
          const cx = 1.8 - tNorm * 3.6;
          scene.add(P([cx, ny, nz]).depth, (ctx) => {
            C3D.drawAtom(ctx, P, [cx, ny, nz], 0.1, '#10b981', 'Cl', '-');
          });
        }
      }

      // Overhead DC Power Supply Wires
      C3D.drawPipe(g, P, [-2.2, 0, 1.1], [-2.2, 0, 2.3], 0.05, '#dc2626', { scene });
      C3D.drawPipe(g, P, [-2.2, 0, 2.3], [0, 0, 2.3], 0.05, '#dc2626', { scene });
      C3D.drawPipe(g, P, [2.2, 0, 1.1], [2.2, 0, 2.3], 0.05, '#2563eb', { scene });
      C3D.drawPipe(g, P, [2.2, 0, 2.3], [0, 0, 2.3], 0.05, '#2563eb', { scene });

      // DC Power Supply Unit
      C3D.drawVoltmeter(g, P, [0, 0, 2.3], 1.1, v, 100, {
        scene,
        label: 'DC VOLTAGE (V)',
        decimals: 0
      });

      // Effluent streams (Diluate pure water & Concentrate brine)
      C3D.drawPipe(g, P, [0, 0, -1.0], [0, 0, -1.8], 0.12, '#38bdf8', { scene, flow: isElectrified, t: time, speed: 2.5, flowColor: '#ffffff' });

      // Tags
      scene.add(P([-2.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-2.2, 0, 1.2], 'Anode (+)', '#dc2626', -22); });
      scene.add(P([2.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.2, 0, 1.2], 'Cathode (−)', '#2563eb', -22); });
      scene.add(P([-0.9, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.9, 0, 1.0], 'AEM Membrane', '#0891b2', -22); });
      scene.add(P([-0.3, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.3, 0, 1.0], 'CEM Membrane', '#d97706', -22); });
      scene.add(P([0, 0, -1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, -1.8], 'Desalinated Diluate Product', '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Positive Anode Plate (+)', color: '#dc2626' },
        { label: 'Negative Cathode Plate (−)', color: '#2563eb' },
        { label: 'CEM (Cation Exchange Membrane)', color: '#f59e0b' },
        { label: 'AEM (Anion Exchange Membrane)', color: '#06b6d4' },
        { label: 'Na⁺ Cation (Moves to Cathode)', color: '#eab308', symbol: true },
        { label: 'Cl⁻ Anion (Moves to Anode)', color: '#10b981', symbol: true }
      ], 24, 88);
    }
  };

  window.Chem3DSimulators = Object.assign(window.Chem3DSimulators || {}, Sim3D);
})();
