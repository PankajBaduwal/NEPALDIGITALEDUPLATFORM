'use strict';

/**
 * ChemSims3D-U3 — Unit III: Corrosion and Its Control (12 Simulations)
 * Complete interactive 3D virtual experiments:
 *  23. chem-dry-corrosion (High-temp oxidation, Pilling-Bedworth ratio, parabolic/linear scale growth)
 *  24. chem-galvanic-corrosion (Bimetallic galvanic couple, area ratio effect, accelerated anodic dissolution)
 *  25. chem-differential-aeration (Evans' drop experiment, oxygen concentration cell, central pitting & rust ring)
 *  26. chem-pitting (Passive film breakdown, autocatalytic pit growth, chloride concentration, local acidification)
 *  27. chem-crevice (Shielded crevice deoxygenation, bolted joint cutaway, localized dissolution)
 *  28. chem-corrosion-factors (Multi-factor corrosion test station, pH, temperature, O2, humidity)
 *  29. chem-sacrificial-anode (Galvanic cathodic protection, buried pipeline, sacrificial Mg/Zn anode block)
 *  30. chem-impressed-current (ICCP, DC rectifier unit, inert MMO groundbed anode, buried tank protection)
 *  31. chem-electroplating (Electrolytic copper plating tank, Faraday's laws, live coating thickness growth)
 *  32. chem-nickel-plating (Watts bath nickel electrodeposition, titanium basket, H3BO3 buffer, mirror finish)
 *  33. chem-alloy-composition (Metallurgical microstructures: Brass, Bronze, Stainless Steel Cr2O3 passivity)
 *  34. chem-heat-treatment (Steel furnace: Annealing, Normalizing, Quenching to Martensite, Tempering)
 */
(function () {
  const C3D = window.Chem3D;
  const V = C3D.V;
  const D = window.EPDraw;

  const Sim3D = {};

  const r = (key, label, min, max, step, value, unit) => ({ key, label, type: 'range', min, max, step, default: value, unit: unit || '' });
  const select = (key, label, value, options) => ({ key, label, type: 'select', default: value, options: options.map((x) => ({ label: x, value: x })) });

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 23 — Dry / Chemical Corrosion Simulator (chem-dry-corrosion)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-dry-corrosion'] = {
    view3d: true,
    initialView: { yaw: -0.46, pitch: 0.38, zoom: 1.0, panX: 0, panY: 0 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('metal', 'Metal Specimen', 'Aluminium (Al)', ['Aluminium (Al)', 'Magnesium (Mg)', 'Chromium (Cr)', 'Iron (Fe)', 'Molybdenum (Mo)']),
      r('temp', 'Furnace Temperature', 200, 1000, 50, 600, '°C'),
      r('exposureTime', 'Exposure Duration', 1, 60, 1, 20, 'min'),
      r('o2Partial', 'Oxygen Partial Pressure (pO₂)', 0.05, 1.0, 0.05, 0.21, 'atm')
    ],
    steps: () => [
      {
        title: 'High-Temperature Dry Gas Attack',
        text: 'Clean polished metal coupon is mounted on a refractory ceramic laboratory support inside the furnace chamber under high-temperature oxygen atmosphere without liquid electrolyte.'
      },
      {
        title: 'Oxygen Chemisorption on Surface',
        text: 'Atmospheric oxygen molecules (O₂) diffuse to the exposed heated metal surface, adsorb, and dissociate into activated oxygen adatoms on the crystalline lattice.'
      },
      {
        title: 'Surface Oxide Formation',
        text: 'Dissociated oxygen atoms accept valence electrons from metal atoms, nucleating the initial stoichiometric oxide monolayer at the gas-metal interface.'
      },
      {
        title: 'Oxide-Scale Growth & Kinetics',
        text: 'Thermal activation drives ionic diffusion across the growing scale layer; growth rate follows parabolic (compact) or linear (porous) kinetic laws over exposure duration.'
      },
      {
        title: 'Protective or Non-Protective Scale',
        text: 'Pilling–Bedworth Ratio (PBR) governs mechanical scale integrity: PBR < 1 yields porous non-protective scale; 1 ≤ PBR ≤ 2 forms dense protective barriers; PBR > 2 generates severe compressive buckling cracks and flaking.'
      },
      {
        title: 'Analyze Final Scale & Kinetics',
        text: 'Comprehensive cross-section cutaway examination reveals accumulated oxide thickness, calculated PBR, kinetic constant, and engineering durability at furnace operating temperatures.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (Number(p.temp) > 800 && p.metal.includes('Magnesium')) w.push('Magnesium ignites violently in oxygen atmosphere above 650°C.');
      if (Number(p.temp) >= 600 && p.metal.includes('Molybdenum')) w.push('Molybdenum trioxide (MoO₃) sublimes rapidly above 600°C, causing catastrophic mass loss.');
      return w;
    },
    compute: (p) => {
      const metalProps = {
        'Aluminium (Al)': {
          symbol: 'Al', oxide: 'Al₂O₃ (Alumina)', oxideFormula: 'Al₂O₃', pbr: 1.28, type: 'Compact / Protective',
          behavior: 'Dense protective film acts as diffusion barrier; self-limiting parabolic growth.',
          color: '#cbd5e1', stroke: '#94a3b8', oxColor: '#f1f5f9', oxStroke: '#38bdf8',
          rateLaw: 'Parabolic (x² = k_p · t)', k0: 0.012, Ea: 85000, protective: true
        },
        'Magnesium (Mg)': {
          symbol: 'Mg', oxide: 'MgO (Magnesia)', oxideFormula: 'MgO', pbr: 0.81, type: 'Porous / Non-Protective',
          behavior: 'Oxide volume smaller than metal consumed (PBR < 1); micro-voids permit continuous direct gas attack.',
          color: '#e2e8f0', stroke: '#94a3b8', oxColor: '#f8fafc', oxStroke: '#ef4444',
          rateLaw: 'Linear (x = k_l · t)', k0: 0.085, Ea: 42000, protective: false
        },
        'Chromium (Cr)': {
          symbol: 'Cr', oxide: 'Cr₂O₃ (Chromia)', oxideFormula: 'Cr₂O₃', pbr: 2.07, type: 'Compact / Refractory Barrier',
          behavior: 'High-temperature refractory oxide film with extremely low defect density and defect permeability.',
          color: '#94a3b8', stroke: '#64748b', oxColor: '#059669', oxStroke: '#10b981',
          rateLaw: 'Parabolic / Logarithmic', k0: 0.008, Ea: 98000, protective: true
        },
        'Iron (Fe)': {
          symbol: 'Fe', oxide: 'FeO / Fe₃O₄ / Fe₂O₃ (Scale)', oxideFormula: 'Fe-Oxides', pbr: 2.14, type: 'Spalling / Cracking',
          behavior: 'Oxide volume exceeds metal (PBR > 2); lateral compressive stresses trigger blistering, shearing, and spalling.',
          color: '#475569', stroke: '#1e293b', oxColor: '#9a3412', oxStroke: '#f97316',
          rateLaw: 'Parabolic / Flaking', k0: 0.035, Ea: 62000, protective: false
        },
        'Molybdenum (Mo)': {
          symbol: 'Mo', oxide: 'MoO₃ (Sublimating Trioxide)', oxideFormula: 'MoO₃', pbr: 3.30, type: 'Volatile / Catastrophic',
          behavior: 'Oxide forms yellow needle crystals that sublime rapidly above 600°C, causing continuous catastrophic mass loss.',
          color: '#334155', stroke: '#0f172a', oxColor: '#d97706', oxStroke: '#eab308',
          rateLaw: 'Linear (Volatilization)', k0: 0.075, Ea: 38000, protective: false
        }
      };

      const m = metalProps[p.metal] || metalProps['Aluminium (Al)'];
      const T_degC = Number(p.temp) || 600;
      const T_K = T_degC + 273.15;
      const t_min = Number(p.exposureTime) || 20;
      const pO2 = Number(p.o2Partial) || 0.21;
      const R_const = 8.314;

      // Rate constant k via Arrhenius relationship: k = k0 * exp(-Ea / (R*T)) * (pO2)^0.5
      const k_rate = m.k0 * Math.exp(-m.Ea / (R_const * T_K)) * Math.sqrt(pO2 / 0.21);

      // Thickness calculation: parabolic x = sqrt(k*t) vs linear x = k*t
      let thickness_um = 0;
      const initialThickness = 0.05; // 50 nm native oxide
      if (m.pbr < 1) {
        thickness_um = initialThickness + k_rate * t_min * 180;
      } else if (m.symbol === 'Mo' && T_degC >= 600) {
        thickness_um = Math.max(0.1, (k_rate * t_min * 80) * 0.3);
      } else {
        thickness_um = Math.sqrt(Math.pow(initialThickness, 2) + k_rate * t_min * 450);
      }

      const pbrVal = m.pbr;
      const isProtective = pbrVal >= 1.0 && pbrVal <= 2.0;

      return {
        formulas: [{
          name: 'High-Temperature Oxidation Kinetics & PBR',
          formula: m.pbr < 1
            ? 'Linear Rate Law: x = x₀ + k_l · t | PBR < 1 (Porous)'
            : 'Parabolic Rate Law: x² − x₀² = k_p · t | 1 ≤ PBR ≤ 2 (Protective)',
          given: `Metal = ${p.metal}, T = ${T_degC} °C (${T_K.toFixed(0)} K), t = ${t_min} min, pO₂ = ${pO2.toFixed(2)} atm`,
          calc: `PBR = ${pbrVal.toFixed(2)} → ${m.type}, k = ${(k_rate * 1e4).toFixed(3)} × 10⁻⁴ µm²/min`,
          result: `Scale Thickness = ${thickness_um.toFixed(2)} µm (${m.rateLaw.split(' ')[0]})`,
          unit: 'µm'
        }],
        readouts: [
          { label: 'Pilling–Bedworth Ratio', value: `${pbrVal.toFixed(2)}`, tone: isProtective ? 'green' : 'amber' },
          { label: 'Oxide Scale Behavior', value: m.type.split(' ')[0], tone: isProtective ? 'green' : 'red' },
          { label: 'Scale Thickness', value: `${thickness_um.toFixed(2)} µm`, tone: 'blue' },
          { label: 'Kinetic Rate Law', value: m.rateLaw.split(' ')[0], tone: 'blue' }
        ],
        state: { m, thickness: thickness_um, T_degC, T_K, k_rate, t_min, pO2 },
        explain: {
          what: `High-temperature dry oxidation of ${p.metal} at ${T_degC}°C under ${pO2.toFixed(2)} atm oxygen.`,
          why: `Pilling-Bedworth Ratio of ${pbrVal.toFixed(2)} determines scale compactness: ${m.behavior}`
        }
      };
    },
    draw: (g, st) => {
     D.clear(g, "#f8fafc");
      D.clear(g, '#f8fafc');

      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const m = state.m || {
        symbol: 'Al', oxide: 'Al₂O₃', oxideFormula: 'Al₂O₃', pbr: 1.28, type: 'Compact / Protective',
        color: '#cbd5e1', stroke: '#94a3b8', oxColor: '#f1f5f9', oxStroke: '#38bdf8',
        rateLaw: 'Parabolic', protective: true
      };
      const step = st.step || 0;
      const time = st.t || 0;
      const view = st.view || {};
      const T_degC = Number(p.temp) || 600;

      // Centered 3D projector in left 62% of viewport (cx: 325, cy: 280, scale: 110, dist: 12.0)
      // Guarantees zero overlap with the 2D cross-section card on the right (x: 665..980)
      const P = C3D.createProjector(g, view, 325, 280, 110, 12.0);
      const scene = C3D.createScene();

      // 1. Refractory Alumina Ceramic Laboratory Boat / Specimen Dish (clean off-white porcelain)
      const boatZ = -0.28;
      C3D.drawBox(g, P, [0, 0, boatZ], [3.6, 2.4, 0.20], '#f1f5f9', { scene, stroke: '#cbd5e1' });
      // 4 Ceramic insulating standoff pegs
      [[-1.4, -0.8], [1.4, -0.8], [-1.4, 0.8], [1.4, 0.8]].forEach(([px, py]) => {
        C3D.drawBox(g, P, [px, py, -0.44], [0.28, 0.28, 0.16], '#e2e8f0', { scene, stroke: '#94a3b8' });
      });

      // Thermocouple probe lead wire touching back of ceramic boat
      scene.add(P([0, 1.4, -0.2]).depth, (ctx) => {
        const p1 = P([0, 1.2, -0.25]);
        const p2 = P([0, 2.4, -0.1]);
        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        // Thermocouple bead
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Main Metal Specimen Coupon (proportions: width 3.0, depth 2.0, thickness 0.28)
      const couponX = 0;
      const couponY = 0;
      const couponZ = 0.02;
      const couponW = 3.0;
      const couponD = 2.0;
      const couponH = 0.28;

      // Render Base Metal Substrate
      C3D.drawBox(g, P, [couponX, couponY, couponZ], [couponW, couponD, couponH], m.color, {
        scene,
        stroke: m.stroke
      });

      // 3. Pristine Reference Surface (Left Half: x in [-1.5, -0.05])
      // Brushed metallic surface texture streaks
      scene.add(P([couponX - couponW * 0.25, 0, couponZ + couponH / 2 + 0.01]).depth, (ctx) => {
        ctx.save();
        for (let i = -1; i <= 1; i += 0.5) {
          const pA = P([couponX - couponW / 2 + 0.15, i * 0.6, couponZ + couponH / 2 + 0.01]);
          const pB = P([couponX - 0.08, i * 0.6, couponZ + couponH / 2 + 0.01]);
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      });

      // 4. Growing Oxide Crust Layer on Exposed Right Half (x in [0.05, 1.5])
      const oxW = couponW / 2 - 0.05;
      const oxX = couponX + oxW / 2 + 0.05;
      const physicalThick = state.thickness || 0.1;
      let oxVisH = 0;
      if (step >= 1) {
        const stepScale = step === 1 ? 0.06 : step === 2 ? 0.12 : step === 3 ? 0.18 : step === 4 ? 0.26 : 0.32;
        oxVisH = Math.min(0.42, stepScale * (1 + Math.min(1.2, physicalThick * 0.04)));
      }

      if (oxVisH > 0) {
        const oxZ = couponZ + couponH / 2 + oxVisH / 2;
        C3D.drawBox(g, P, [oxX, couponY, oxZ], [oxW, couponD, oxVisH], m.oxColor, {
          scene,
          stroke: m.oxStroke
        });

        // Microstructural Oxide Details
        if (m.pbr < 1) {
          // Magnesium: Porous microscopic dark voids & capillaries
          for (let i = 0; i < 6; i++) {
            const poreX = oxX - 0.5 + (i % 3) * 0.5;
            const poreY = -0.55 + Math.floor(i / 3) * 1.1;
            const posPore = [poreX, poreY, oxZ + oxVisH / 2 + 0.01];
            scene.add(P(posPore).depth, (ctx) => {
              const pt = P(posPore);
              ctx.save();
              ctx.fillStyle = '#334155';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, Math.max(1.5, 3.0 * pt.k), 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            });
          }
        } else if (m.symbol === 'Fe' && step >= 4) {
          // Iron: Compressive buckling shear cracks (PBR > 2)
          scene.add(P([oxX, couponY, oxZ + oxVisH / 2 + 0.01]).depth, (ctx) => {
            ctx.save();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.8;
            const c1 = P([oxX - 0.45, -0.4, oxZ + oxVisH / 2 + 0.01]);
            const c2 = P([oxX - 0.15, 0.1, oxZ + oxVisH / 2 + 0.01]);
            const c3 = P([oxX + 0.4, 0.35, oxZ + oxVisH / 2 + 0.01]);
            ctx.beginPath();
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.lineTo(c3.x, c3.y);
            ctx.stroke();
            ctx.restore();
          });
        } else if (m.symbol === 'Mo' && step >= 3 && T_degC >= 600) {
          // Molybdenum: Sublimating yellow fume vapor
          for (let i = 0; i < 4; i++) {
            const fumeX = oxX - 0.45 + i * 0.35;
            const fumeZ = oxZ + oxVisH / 2 + 0.15 + ((time * 1.2 + i * 0.3) % 0.7);
            const posFume = [fumeX, (i % 2 ? 0.25 : -0.25), fumeZ];
            scene.add(P(posFume).depth, (ctx) => {
              C3D.drawAtom(ctx, P, posFume, 0.05, '#f59e0b', 'MoO₃', '');
            });
          }
        }
      }

      // 5. Thermal Radiation Aura at Elevated Temperature (> 500°C)
      if (T_degC >= 500) {
        scene.add(P([couponX, couponY, couponZ - 0.1]).depth, (ctx) => {
          const pC = P([couponX, couponY, couponZ]);
          ctx.save();
          const glowR = Math.max(15, 110 * pC.k);
          const glow = ctx.createRadialGradient(pC.x, pC.y, glowR * 0.2, pC.x, pC.y, glowR);
          glow.addColorStop(0, T_degC >= 800 ? 'rgba(239, 68, 68, 0.22)' : 'rgba(249, 115, 22, 0.16)');
          glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(pC.x, pC.y, glowR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 6. Oxidizing Atmosphere & Diatomic Oxygen (O2) Gas Molecules
      for (let i = 0; i < 4; i++) {
        const oxX = couponX - 0.9 + i * 0.6;
        const oxY = -0.6 + (i % 2) * 1.2;
        const cycleZ = ((time * 1.1 + i * 0.35) % 1.4);
        const oxZ = 1.9 - cycleZ;
        const posO2 = [oxX, oxY, oxZ];

        scene.add(P(posO2).depth, (ctx) => {
          const [mx, my, mz] = posO2;
          const bondHalf = 0.07;
          const ang = (time * 2.0 + i * 1.2);
          const dX = bondHalf * Math.cos(ang);
          const dY = bondHalf * Math.sin(ang);
          const a1 = [mx - dX, my - dY, mz];
          const a2 = [mx + dX, my + dY, mz];
          const q1 = P(a1), q2 = P(a2);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(q1.x, q1.y);
          ctx.lineTo(q2.x, q2.y);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1.2, 2.5 * q1.k);
          ctx.stroke();
          ctx.restore();

          C3D.drawAtom(ctx, P, a1, 0.055, '#ef4444', 'O', '');
          C3D.drawAtom(ctx, P, a2, 0.055, '#dc2626', 'O', '');
        });
      }

      // 7. Clean leader badges
      // Tag: Pristine Reference
      scene.add(P([couponX - couponW * 0.25, -couponD / 2, couponZ + 0.1]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [couponX - couponW * 0.25, -couponD / 2, couponZ + 0.1], 'Pristine Reference', '#475569', -22);
      });

      // Tag: Oxide Scale Layer
      if (oxVisH > 0) {
        scene.add(P([oxX, -couponD / 2, couponZ + couponH / 2 + oxVisH]).depth, (ctx) => {
          C3D.drawTag(ctx, P, [oxX, -couponD / 2, couponZ + couponH / 2 + oxVisH], `${m.oxideFormula} Scale`, m.protective ? '#0284c7' : '#ea580c', -24);
        });
      }

      // Render all depth-sorted 3D elements
      scene.render(g);

      // 8. Magnified Cross-Section Cutaway Inset (Right side: x: 670..980, y: 50..315)
      const cutX = 670;
      const cutY = 50;
      const cutW = 310;
      const cutH = 265;

      g.save();
      // Cutaway Inset Card Background (translucent frosted panel)
      g.fillStyle = 'rgba(15, 23, 42, 0.94)';
      g.beginPath();
      C3D.safeRoundRect(g, cutX, cutY, cutW, cutH, 10);
      g.fill();
      g.strokeStyle = '#38bdf8';
      g.lineWidth = 1.8;
      g.stroke();

      // Inset Header
      g.fillStyle = '#38bdf8';
      g.font = '800 12px "Plus Jakarta Sans", system-ui, sans-serif';
      g.textAlign = 'left';
      g.fillText('🔬 OXIDE SCALE CROSS-SECTION', cutX + 14, cutY + 22);

      g.fillStyle = '#94a3b8';
      g.font = '600 10px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillText('Thickness exaggerated for visualization', cutX + 14, cutY + 38);

      // Cross-section viewport bounds
      const frameX = cutX + 14;
      const frameY = cutY + 48;
      const frameW = cutW - 28;
      const frameH = cutH - 85;

      const drawRect = (ctx, rx, ry, rw, rh) => {
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw, ry);
        ctx.lineTo(rx + rw, ry + rh);
        ctx.lineTo(rx, ry + rh);
        ctx.closePath();
      };

      // Region 1: Upper Oxidizing Atmosphere (Gas phase)
      const atmoH = 46;
      const atmoGrad = g.createLinearGradient(frameX, frameY, frameX, frameY + atmoH);
      atmoGrad.addColorStop(0, '#0f172a');
      atmoGrad.addColorStop(1, '#1e293b');
      g.fillStyle = atmoGrad;
      drawRect(g, frameX, frameY, frameW, atmoH);
      g.fill();

      // Gas phase label & floating O2 icons
      g.fillStyle = '#94a3b8';
      g.font = '700 10px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillText('Oxidizing Atmosphere (pO₂ = ' + (state.pO2 || 0.21) + ' atm)', frameX + 8, frameY + 16);
      g.fillStyle = '#ef4444';
      g.beginPath(); g.arc(frameX + 30, frameY + 32, 5, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(frameX + 39, frameY + 32, 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.font = '700 8px sans-serif'; g.fillText('O₂', frameX + 48, frameY + 35);

      // Region 2: Oxide Scale Layer (Middle)
      const minScaleH = 12;
      const maxScaleH = 46;
      const scaleLayerH = Math.max(minScaleH, Math.min(maxScaleH, minScaleH + (step * 6) + (physicalThick * 0.8)));
      const scaleY = frameY + atmoH;

      g.fillStyle = m.oxColor;
      drawRect(g, frameX, scaleY, frameW, scaleLayerH);
      g.fill();
      g.strokeStyle = m.oxStroke;
      g.lineWidth = 1.5;
      g.stroke();

      // Oxide structural features in cross-section
      if (m.pbr < 1) {
        g.fillStyle = '#334155';
        for (let px = frameX + 18; px < frameX + frameW - 10; px += 24) {
          drawRect(g, px, scaleY, 4, scaleLayerH);
          g.fill();
        }
        g.fillStyle = '#ef4444';
        g.font = '700 9px "Plus Jakarta Sans", system-ui, sans-serif';
        g.fillText('⚠ Continuous Pores (PBR < 1)', frameX + 8, scaleY + scaleLayerH / 2 + 3);
      } else if (m.symbol === 'Fe') {
        g.strokeStyle = '#78350f';
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(frameX + 15, scaleY + scaleLayerH * 0.4);
        g.lineTo(frameX + 85, scaleY + scaleLayerH * 0.6);
        g.lineTo(frameX + 160, scaleY + scaleLayerH * 0.35);
        g.stroke();
        g.fillStyle = '#ea580c';
        g.font = '700 9px "Plus Jakarta Sans", system-ui, sans-serif';
        g.fillText('⚠ Shear Cracks (PBR > 2)', frameX + 8, scaleY + scaleLayerH / 2 + 3);
      } else if (m.symbol === 'Mo' && T_degC >= 600) {
        g.fillStyle = '#eab308';
        g.font = '700 9px "Plus Jakarta Sans", system-ui, sans-serif';
        g.fillText('⚡ Sublimating Oxide (MoO₃ gas)', frameX + 8, scaleY + scaleLayerH / 2 + 3);
      } else {
        g.fillStyle = m.symbol === 'Cr' ? '#ffffff' : '#0284c7';
        g.font = '700 9px "Plus Jakarta Sans", system-ui, sans-serif';
        g.fillText(`✓ Dense Protective Film (${m.oxideFormula})`, frameX + 8, scaleY + scaleLayerH / 2 + 3);
      }

      // Region 3: Base Metal Substrate (Bottom)
      const baseMetalY = scaleY + scaleLayerH;
      const baseMetalH = frameH - (atmoH + scaleLayerH);
      g.fillStyle = m.color;
      drawRect(g, frameX, baseMetalY, frameW, baseMetalH);
      g.fill();
      g.strokeStyle = m.stroke;
      g.lineWidth = 1;
      g.stroke();

      // Base metal grain boundary accents
      g.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      g.beginPath();
      g.moveTo(frameX + 60, baseMetalY); g.lineTo(frameX + 45, baseMetalY + baseMetalH);
      g.moveTo(frameX + 140, baseMetalY); g.lineTo(frameX + 155, baseMetalY + baseMetalH);
      g.stroke();

      g.fillStyle = '#0f172a';
      g.font = '700 10px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillText(`Substrate Metal (${m.symbol})`, frameX + 8, baseMetalY + 16);

      // Inset Footer: True Measured Scale Thickness & Kinetic Rate
      g.fillStyle = '#f8fafc';
      g.font = '700 11px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillText(`True Scale Thickness: ${physicalThick.toFixed(2)} µm`, cutX + 14, cutY + cutH - 18);
      g.fillStyle = m.protective ? '#4ade80' : '#fb923c';
      g.font = '700 10px "Plus Jakarta Sans", system-ui, sans-serif';
      g.fillText(`Rate Law: ${m.rateLaw.split(' ')[0]}`, cutX + 14, cutY + cutH - 5);

      g.restore();

      // 9. Clean Scientific Legend in Top-Left Corner (x: 24, y: 20)
      C3D.drawLegend(g, [
        { label: `Base Specimen: ${p.metal}`, color: m.color },
        { label: `Oxide Scale: ${m.oxideFormula} (${m.type.split(' ')[0]})`, color: m.oxColor },
        { label: 'O₂ Oxygen Gas Molecules', color: '#ef4444', symbol: true },
        { label: `Furnace Temperature: ${T_degC}°C`, color: '#ea580c' },
        { label: `PBR = ${m.pbr.toFixed(2)} (${m.pbr >= 1 && m.pbr <= 2 ? 'Protective' : 'Non-Protective'})`, color: m.protective ? '#10b981' : '#ef4444' }
      ], 24, 20);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 24 — Galvanic Corrosion Simulator (chem-galvanic-corrosion)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-galvanic-corrosion'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('anodeMetal', 'Anodic Metal (Sacrificed)', 'Zinc (Zn)', ['Magnesium (Mg)', 'Zinc (Zn)', 'Aluminium (Al)', 'Mild Steel (Fe)']),
      select('cathodeMetal', 'Cathodic Metal (Protected)', 'Copper (Cu)', ['Copper (Cu)', 'Stainless Steel (SS)', 'Brass', 'Titanium (Ti)']),
      r('areaRatio', 'Cathode-to-Anode Area Ratio (Ac/Aa)', 0.2, 10.0, 0.2, 4.0, ''),
      r('salinity', 'Electrolyte Salinity (NaCl)', 0.1, 5.0, 0.1, 3.5, '%')
    ],
    steps: () => [
      {
        title: 'Bimetallic Contact in Electrolyte',
        text: 'When two dissimilar metals are electrically coupled in an electrolyte, a galvanic cell forms with potential difference driving galvanic corrosion.'
      },
      {
        title: 'Active Metal Becomes Anode',
        text: 'The more active metal (lower reduction potential) experiences accelerated oxidation: M → Mⁿ⁺ + ne⁻, releasing metal ions into solution.'
      },
      {
        title: 'Noble Metal Becomes Cathode',
        text: 'The more noble metal is galvanically protected, acting as the site for oxygen reduction: O₂ + 2H₂O + 4e⁻ → 4OH⁻.'
      },
      {
        title: 'Area Ratio Effect (Ac / Aa)',
        text: 'A large cathode coupled to a small anode causes severe accelerated localized penetration: corrosion current density i_a = i_c × (A_c / A_a).'
      },
      {
        title: 'Electron Current Across Interface',
        text: 'Electrons migrate through the metallic contact junction from the dissolving active anode to the cathodic surface.'
      },
      {
        title: 'Precipitation of Corrosion Products',
        text: 'Hydroxide ions from cathode meet metal cations from anode in the electrolyte to precipitate white/green hydroxide sludge at the boundary.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.areaRatio > 5) w.push('High Ac/Aa ratio warning: rapid perforation risk on small anodic member.');
      return w;
    },
    compute: (p) => {
      const potentials = {
        'Magnesium (Mg)': -2.37, 'Zinc (Zn)': -0.76, 'Aluminium (Al)': -1.66, 'Mild Steel (Fe)': -0.44,
        'Copper (Cu)': +0.34, 'Stainless Steel (SS)': +0.10, 'Brass': +0.05, 'Titanium (Ti)': +0.25
      };

      const ea = potentials[p.anodeMetal] || -0.76;
      const ec = potentials[p.cathodeMetal] || +0.34;
      const deltaE = ec - ea;
      const ar = Number(p.areaRatio) || 4.0;
      const sal = Number(p.salinity) || 3.5;

      const ic = 0.25 * (sal / 3.5); // mA/cm2
      const ia = ic * ar; // anodic current density
      const corrRateMpy = ia * 45; // mils per year

      return {
        formulas: [{
          name: 'Galvanic Current & Area Ratio Law',
          formula: 'i_anode = i_cathode × (A_cathode / A_anode) | ΔE = E°_cathode - E°_anode',
          given: `Anode = ${p.anodeMetal} (${ea}V), Cathode = ${p.cathodeMetal} (${ec}V), Ac/Aa = ${ar}`,
          calc: `ΔE = ${deltaE.toFixed(2)} V, i_a = ${ic.toFixed(2)} × ${ar} = ${ia.toFixed(2)} mA/cm²`,
          result: `Corrosion Rate = ${corrRateMpy.toFixed(1)} mpy`,
          unit: 'mpy'
        }],
        readouts: [
          { label: 'Galvanic EMF (ΔE)', value: `${deltaE.toFixed(2)} V`, tone: 'amber' },
          { label: 'Anodic Current Density', value: `${ia.toFixed(2)} mA/cm²`, tone: ia > 1.0 ? 'red' : 'green' },
          { label: 'Penetration Rate', value: `${corrRateMpy.toFixed(1)} mpy`, tone: corrRateMpy > 50 ? 'red' : 'amber' },
          { label: 'Area Ratio Factor', value: `${ar.toFixed(1)} : 1`, tone: ar > 3 ? 'red' : 'green' }
        ],
        state: { deltaE, ia, corrRateMpy, ar },
        explain: {
          what: `Galvanic couple of ${p.anodeMetal} anode riveted/joined to ${p.cathodeMetal} cathode.`,
          why: `Electrochemical potential gap of ${deltaE.toFixed(2)} V drives electrons into the cathode; a large cathode forces rapid, concentrated attack on the anode.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const ar = state.ar || 4.0;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Electrolyte Bath (Transparent saline water)
      C3D.drawBox(g, P, [0, 0, 0.2], [3.6, 2.6, 1.2], 'rgba(56, 189, 248, 0.25)', { scene, stroke: '#38bdf8' });

      // Anode Plate (Small width if ar > 1)
      const aWidth = Math.max(0.6, 1.6 / Math.sqrt(ar));
      const cWidth = Math.min(2.4, 1.6 * Math.sqrt(ar) * 0.7);

      // Anodic metal strip (Grey, with corrosion pit marks)
      C3D.drawBox(g, P, [-1.2, 0, 0.2], [aWidth, 1.8, 0.9], '#94a3b8', { scene, stroke: '#dc2626' });

      // Cathodic metal strip (Copper/bronze brown)
      C3D.drawBox(g, P, [1.0, 0, 0.2], [cWidth, 1.8, 0.9], '#b45309', { scene, stroke: '#15803d' });

      // Metallic contact bridge connecting top of both plates
      C3D.drawBox(g, P, [-0.1, 0, 0.75], [2.2, 0.4, 0.15], '#cbd5e1', { scene });

      // Electron current across bridge
      for (let i = 0; i < 4; i++) {
        const eX = -1.0 + ((time * 1.5 + i * 0.4) % 1.8);
        const posE = [eX, 0, 0.85];
        scene.add(P(posE).depth, (ctx) => { C3D.drawAtom(ctx, P, posE, 0.06, '#eab308', 'e', '-'); });
      }

      // Metal cations dissolving from anode
      for (let i = 0; i < 3; i++) {
        const ax = -1.2 + (i * 0.2 - 0.2);
        const az = 0.2 + ((time * 0.4 + i * 0.3) % 0.6);
        const posIon = [ax, 0, az];
        scene.add(P(posIon).depth, (ctx) => { C3D.drawAtom(ctx, P, posIon, 0.08, '#ef4444', 'M', '2+'); });
      }

      // Tags
      scene.add(P([-1.2, 0, 0.9]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [-1.2, 0, 0.9], `Anode: ${p.anodeMetal} (Corroding)`, '#dc2626', -22);
      });
      scene.add(P([1.0, 0, 0.9]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [1.0, 0, 0.9], `Cathode: ${p.cathodeMetal} (Protected)`, '#15803d', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Anode: ${p.anodeMetal} (Fast Dissolution)`, color: '#94a3b8' },
        { label: `Cathode: ${p.cathodeMetal} (Oxygen Reduction)`, color: '#b45309' },
        { label: 'e⁻ Electron Current (Metallic Joint)', color: '#eab308', symbol: true },
        { label: 'M²⁺ Dissolving Cations', color: '#ef4444', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 25 — Differential Aeration Corrosion (chem-differential-aeration)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-differential-aeration'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.38, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('dropRadius', 'Electrolyte Droplet Radius', 5, 25, 1, 15, 'mm'),
      r('o2Conc', 'Ambient Oxygen Concentration', 5, 50, 5, 21, '%'),
      r('exposureTime', 'Exposure Time', 1, 48, 1, 12, 'h'),
      select('indicator', 'Ferroxyl Indicator', 'Active (Blue + Pink Staining)', ['Active (Blue + Pink Staining)', 'Standard Saline Drop'])
    ],
    steps: () => [
      {
        title: 'Electrolyte Droplet on Polished Steel',
        text: 'An aqueous electrolyte droplet placed on a flat steel plate establishes an oxygen concentration gradient due to variable diffusion path lengths.'
      },
      {
        title: 'Oxygen Gradient Establishment',
        text: 'The droplet perimeter has rapid atmospheric oxygen access (high O₂), while the thick droplet center is oxygen-starved (low O₂).'
      },
      {
        title: 'Central Region Becomes Anodic',
        text: 'By the differential aeration principle, the poorly oxygenated center becomes anodic and dissolves: Fe → Fe²⁺ + 2e⁻ (pitting pit forms).'
      },
      {
        title: 'Perimeter Becomes Cathodic',
        text: 'The well-aerated droplet edge becomes cathodic: O₂ + 2H₂O + 4e⁻ → 4OH⁻. High OH⁻ concentration turns phenolphthalein pink.'
      },
      {
        title: 'Insoluble Rust Ring Precipitation',
        text: 'Fe²⁺ cations diffuse outward and meet OH⁻ anions inward, precipitating insoluble iron(II) hydroxide at the boundary: Fe²⁺ + 2OH⁻ → Fe(OH)₂ (greenish-white).'
      },
      {
        title: 'Aerial Oxidation to Brown Rust',
        text: 'Atmospheric oxygen oxidizes Fe(OH)₂ into hydrated iron(III) oxide rust: 4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃ / Fe₂O₃·xH₂O (dark brown/orange ring).'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.o2Conc < 10) w.push('Low oxygen slows cathodic reaction kinetics.');
      return w;
    },
    compute: (p) => {
      const r = Number(p.dropRadius) || 15;
      const t = Number(p.exposureTime) || 12;
      const o2 = Number(p.o2Conc) || 21;

      const pitDepth = (t * 0.08 * (o2 / 21)).toFixed(2);
      const rustRingDiameter = (r * 1.6).toFixed(1);

      return {
        formulas: [{
          name: 'Differential Aeration Oxygen Cell',
          formula: 'Anode (Low O₂ Center): Fe → Fe²⁺ + 2e⁻ | Cathode (High O₂ Edge): O₂ + 2H₂O + 4e⁻ → 4OH⁻',
          given: `Radius = ${r} mm, O₂ = ${o2}%, Time = ${t} h`,
          calc: `Fe²⁺ + 2OH⁻ → Fe(OH)₂ ↓ (Rust ring at boundary)`,
          result: `Central Pit Depth = ${pitDepth} mm, Ring Diameter = ${rustRingDiameter} mm`,
          unit: 'mm'
        }],
        readouts: [
          { label: 'Central Pit Depth', value: `${pitDepth} mm`, tone: 'red' },
          { label: 'Rust Ring Diameter', value: `${rustRingDiameter} mm`, tone: 'amber' },
          { label: 'Perimeter pH (OH⁻)', value: '11.5 (Alkaline Pink)', tone: 'green' },
          { label: 'Center pH (Fe²⁺)', value: '5.2 (Acidic Blue)', tone: 'blue' }
        ],
        state: { pitDepth, r, t },
        explain: {
          what: 'Evans droplet experiment illustrating corrosion governed by non-uniform oxygen distribution.',
          why: 'Metal in contact with lower oxygen concentration has a lower electrode potential, making it anodic relative to aerated metal.'
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Steel Plate Substrate
      C3D.drawBox(g, P, [0, 0, -0.3], [3.6, 3.0, 0.4], '#64748b', { scene, stroke: '#334155' });

      // Water Droplet (Convex dome on plate)
      C3D.drawCylinder(g, P, [0, 0, -0.1], 1.4, 0.7, 'rgba(56, 189, 248, 0.35)', { scene });

      // Anodic central pit (Deep blue stained zone)
      C3D.drawCylinder(g, P, [0, 0, -0.12], 0.5, 0.1, '#1d4ed8', { scene });

      // Cathodic perimeter halo (Pink stained zone)
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const hx = 1.2 * Math.cos(a);
        const hy = 1.2 * Math.sin(a);
        const posHalo = [hx, hy, -0.08];
        scene.add(P(posHalo).depth, (ctx) => {
          ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.arc(P(posHalo).x, P(posHalo).y, 6, 0, Math.PI * 2); ctx.fill();
        });
      }

      // Brown rust ring at boundary
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const rx = 0.8 * Math.cos(a);
        const ry = 0.8 * Math.sin(a);
        const posRust = [rx, ry, -0.05];
        scene.add(P(posRust).depth, (ctx) => {
          ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(P(posRust).x, P(posRust).y, 5, 0, Math.PI * 2); ctx.fill();
        });
      }

      // Tags
      scene.add(P([0, 0, 0.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.2], 'Anode: Low O₂ Center (Pitting)', '#1d4ed8', -22);
      });
      scene.add(P([1.3, 0, 0.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [1.3, 0, 0.2], 'Cathode: High O₂ Perimeter', '#ec4899', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Center Anode (Fe → Fe²⁺ + 2e⁻, Blue)', color: '#1d4ed8' },
        { label: 'Perimeter Cathode (O₂ + 2H₂O + 4e⁻ → 4OH⁻, Pink)', color: '#ec4899' },
        { label: 'Precipitated Rust Ring (Fe(OH)₂ / Fe₂O₃)', color: '#b45309' },
        { label: 'Mild Steel Specimen Plate', color: '#64748b' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 26 — Pitting Corrosion Simulator (chem-pitting)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-pitting'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('chlorideConc', 'Chloride Concentration [Cl⁻]', 100, 5000, 250, 1500, 'ppm'),
      r('temp', 'Electrolyte Temperature', 15, 80, 5, 35, '°C'),
      r('timeHours', 'Exposure Time', 1, 72, 1, 24, 'h'),
      select('alloyGrade', 'Stainless Steel Grade', 'AISI 304 (18Cr-8Ni)', ['AISI 304 (18Cr-8Ni)', 'AISI 316 (18Cr-10Ni-2Mo)', 'Duplex 2205'])
    ],
    steps: () => [
      {
        title: 'Passive Oxide Breakdown',
        text: 'Pitting is insidious localized corrosion where microscopic defects in the passive Cr₂O₃ film are attacked by aggressive chloride (Cl⁻) anions.'
      },
      {
        title: 'Pit Initiation at Inclusions',
        text: 'Adsorption of Cl⁻ at manganese sulfide (MnS) inclusions disrupts passivity, creating a microscopic active anode pit surrounded by a massive passive cathode.'
      },
      {
        title: 'Autocatalytic Acidification Mechanism',
        text: 'Rapid anodic dissolution: Fe → Fe²⁺ + 2e⁻ inside pit causes positive charge buildup. Cl⁻ migrates inside: Fe²⁺ + 2Cl⁻ → FeCl₂.'
      },
      {
        title: 'Hydrolysis & Sharp pH Drop',
        text: 'Inside the occluded pit cavity, hydrolysis produces hydrochloric acid: FeCl₂ + 2H₂O → Fe(OH)₂ + 2HCl. Pit pH plunges to < 2.0!'
      },
      {
        title: 'Accelerated Perforation Growth',
        text: 'The acidic chloride environment prevents repassivation, driving rapid downward boring penetration while the surface appears intact.'
      },
      {
        title: 'Molybdenum Alloying Protection (PREN)',
        text: 'Molybdenum in 316 and Duplex 2205 forms molybdate ions (MoO₄²⁻) that neutralize pits and boost Pitting Resistance Equivalent Number (PREN).'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.chlorideConc > 2500 && p.alloyGrade.includes('304')) w.push('High chloride hazard: 304 pitting threshold exceeded (>1000 ppm Cl⁻).');
      return w;
    },
    compute: (p) => {
      const cl = Number(p.chlorideConc) || 1500;
      const T = Number(p.temp) || 35;
      const t = Number(p.timeHours) || 24;

      const pren = p.alloyGrade.includes('316') ? 24.5 : p.alloyGrade.includes('Duplex') ? 35.0 : 18.5;
      const pitRate = Math.max(0.01, (cl / 1000) * (T / 25) * (30 / pren));
      const depthMm = (pitRate * Math.sqrt(t)).toFixed(2);
      const pitPH = Math.max(1.2, 3.5 - (cl / 2000)).toFixed(1);

      return {
        formulas: [{
          name: 'Pitting Autocatalytic Reaction',
          formula: 'Fe²⁺ + 2Cl⁻ + 2H₂O → Fe(OH)₂ ↓ + 2HCl (Acidification inside pit) | PREN = %Cr + 3.3%Mo + 16%N',
          given: `Cl⁻ = ${cl} ppm, T = ${T} °C, t = ${t} h, PREN = ${pren}`,
          calc: `Depth = Rate(${pitRate.toFixed(2)}) × √${t} = ${depthMm} mm`,
          result: `Max Pit Depth = ${depthMm} mm, Pit Cavity pH = ${pitPH}`,
          unit: 'mm'
        }],
        readouts: [
          { label: 'Max Pit Depth', value: `${depthMm} mm`, tone: Number(depthMm) > 1.5 ? 'red' : 'amber' },
          { label: 'Occluded Pit pH', value: `${pitPH} (Highly Acidic)`, tone: 'red' },
          { label: 'Alloy PREN Index', value: `${pren}`, tone: pren > 30 ? 'green' : 'amber' },
          { label: 'Repassivation Status', value: Number(depthMm) > 0.5 ? 'Active Corrosion' : 'Passivated', tone: Number(depthMm) > 0.5 ? 'red' : 'green' }
        ],
        state: { depthMm, pitPH, pren },
        explain: {
          what: `Chloride-induced pitting of ${p.alloyGrade} under ${cl} ppm Cl⁻.`,
          why: `Autocatalytic generation of HCl inside the tight pit prevents oxygen replenishment and accelerates dissolution downwards.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Metal Block Cutaway
      C3D.drawBox(g, P, [0, 0, -0.4], [3.2, 2.2, 1.0], '#64748b', { scene, stroke: '#334155' });

      // Passive Surface Film (Greenish Cr2O3 layer)
      C3D.drawBox(g, P, [0, 0, 0.12], [3.2, 2.2, 0.06], '#10b981', { scene });

      // Deep Pitting Cavity in Center
      C3D.drawBox(g, P, [0, 0, -0.3], [0.8, 0.8, 0.8], '#1e293b', { scene, stroke: '#dc2626' });

      // Cl- ions migrating into the pit
      for (let i = 0; i < 4; i++) {
        const ionZ = 0.4 - ((time * 0.4 + i * 0.25) % 0.8);
        const posCl = [0 + (i % 2 ? 0.15 : -0.15), 0, ionZ];
        scene.add(P(posCl).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posCl, 0.08, '#10b981', 'Cl', '-');
        });
      }

      // Fe2+ ions dissolving at bottom of pit
      const posFe = [0, 0, -0.6];
      scene.add(P(posFe).depth, (ctx) => {
        C3D.drawAtom(ctx, P, posFe, 0.09, '#ef4444', 'Fe', '2+');
      });

      // Tags
      scene.add(P([0, 0, -0.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, -0.2], `Occluded Pit (pH ${state.pitPH || '1.8'})`, '#dc2626', -22);
      });
      scene.add(P([1.1, 0, 0.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [1.1, 0, 0.2], 'Passive Cr₂O₃ Film', '#10b981', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Passive Cr₂O₃ Oxide Film', color: '#10b981' },
        { label: 'Stainless Steel Bulk Metal', color: '#64748b' },
        { label: 'Cl⁻ Chloride Anion Influx', color: '#10b981', symbol: true },
        { label: 'Fe²⁺ Dissolving Anode Ions', color: '#ef4444', symbol: true },
        { label: 'Acidic Pit Cavity (HCl, pH < 2)', color: '#dc2626' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 27 — Crevice Corrosion Simulator (chem-crevice)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-crevice'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('gapWidth', 'Crevice Gap Width', 0.02, 0.5, 0.02, 0.08, 'mm'),
      r('gapDepth', 'Crevice Depth (Overlap)', 2, 20, 1, 10, 'mm'),
      r('salinity', 'Chloride Salinity', 0.5, 5.0, 0.5, 3.5, '%'),
      select('geometry', 'Joint Configuration', 'Flanged Gasket Joint', ['Flanged Gasket Joint', 'Bolted Washer Lap Joint', 'Threaded Pipe Fitting'])
    ],
    steps: () => [
      {
        title: 'Shielded Narrow Crevice Geometry',
        text: 'Crevice corrosion occurs in shielded micro-gaps (< 0.1 mm) under gaskets, washers, fasteners, and deposits where liquid access is stagnant.'
      },
      {
        title: 'Initial Uniform Dissolution & Oxygen Depletion',
        text: 'Initially, both crevice interior and exterior corrode uniformly. However, dissolved oxygen inside the tight crevice is rapidly exhausted and cannot replenish.'
      },
      {
        title: 'Establishment of Oxygen Concentration Cell',
        text: 'The deoxygenated crevice becomes purely ANODIC, while the bulk exterior with free oxygen access becomes a massive CATHODE.'
      },
      {
        title: 'Chloride Migration into Shielded Gap',
        text: 'To balance accumulating Fe²⁺ / Cr³⁺ cations, chloride ions migrate from the bulk solution into the shielded crevice cavity.'
      },
      {
        title: 'Crevice Acidification & Passivity Breakdown',
        text: 'Metal chloride hydrolysis produces HCl, driving local pH down to ~1.5. The passive film dissolves, initiating aggressive crevice attack.'
      },
      {
        title: 'Engineering Prevention Strategies',
        text: 'Use welded instead of bolted joints, non-absorbent gaskets, PTFE sealants, and higher PREN alloys with high molybdenum content.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.gapWidth > 0.25) w.push('Wide gap allows convection; classic crevice corrosion risk diminishes.');
      return w;
    },
    compute: (p) => {
      const g = Number(p.gapWidth) || 0.08;
      const d = Number(p.gapDepth) || 10;
      const sal = Number(p.salinity) || 3.5;

      const severity = (d / (g * 10)) * (sal / 3.5);
      const rateMpy = (severity * 12.5).toFixed(1);

      return {
        formulas: [{
          name: 'Crevice Corrosion Severity Index',
          formula: 'Severity ∝ (Crevice Depth / Gap Width) × [Cl⁻]',
          given: `Gap = ${g} mm, Depth = ${d} mm, Salinity = ${sal}%`,
          calc: `Severity Index = ${severity.toFixed(1)}`,
          result: `Crevice Penetration Rate = ${rateMpy} mpy`,
          unit: 'mpy'
        }],
        readouts: [
          { label: 'Penetration Rate', value: `${rateMpy} mpy`, tone: Number(rateMpy) > 100 ? 'red' : 'amber' },
          { label: 'Crevice Aspect Ratio', value: `${(d / g).toFixed(0)} : 1`, tone: 'blue' },
          { label: 'Crevice Solution pH', value: '1.6 (Acidic)', tone: 'red' },
          { label: 'Mechanism', value: 'Deoxygenation + Hydrolysis', tone: 'amber' }
        ],
        state: { rateMpy, severity },
        explain: {
          what: `Severe crevice attack under ${p.geometry} with ${g} mm gap width.`,
          why: `Stagnant gap prevents oxygen diffusion; localized build-up of metal chlorides causes autocatalytic acidification.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Bottom Metal Plate
      C3D.drawBox(g, P, [0, 0, -0.5], [3.2, 2.2, 0.4], '#64748b', { scene });

      // Top Metal Plate (Shielding plate / Washer)
      C3D.drawBox(g, P, [0.4, 0, 0.2], [2.2, 2.2, 0.4], '#475569', { scene });

      // Tight crevice gap between plates (Red highlighted attack zone)
      C3D.drawBox(g, P, [0.4, 0, -0.15], [2.0, 2.0, 0.12], '#dc2626', { scene, stroke: '#b91c1c' });

      // Bolt fastener holding joint together
      C3D.drawCylinder(g, P, [0.5, 0, -0.8], 0.35, 1.6, '#94a3b8', { scene, topCap: true });

      // Tags
      scene.add(P([0.4, 0, -0.15]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0.4, 0, -0.15], 'Shielded Crevice Anode (Acidic, pH 1.6)', '#dc2626', -22);
      });
      scene.add(P([-1.1, 0, -0.3]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [-1.1, 0, -0.3], 'External Bulk Cathode (Aerated)', '#15803d', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Shielded Crevice Zone (Anodic Attack)', color: '#dc2626' },
        { label: 'Exposed Aerated Surface (Cathode)', color: '#64748b' },
        { label: 'Fastener / Washer Assembly', color: '#94a3b8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 28 — Factors Affecting Corrosion (chem-corrosion-factors)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-corrosion-factors'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('pH', 'Electrolyte pH', 1.0, 14.0, 0.5, 7.0, ''),
      r('temp', 'Chamber Temperature', 10, 80, 5, 25, '°C'),
      r('doMgL', 'Dissolved Oxygen (DO)', 0, 15, 1, 8, 'mg/L'),
      r('humidity', 'Relative Humidity (RH)', 10, 100, 5, 60, '%'),
      select('metalType', 'Metal Purity / Type', 'Commercial Mild Steel', ['Commercial Mild Steel', 'Ultra-Pure Iron (99.99%)', 'Aluminium Alloy', 'Copper Alloy'])
    ],
    steps: () => [
      {
        title: 'Environmental & Metallurgical Testing Station',
        text: 'Corrosion rate is governed by an interplay of electrolyte pH, temperature, dissolved oxygen, humidity, and metallurgical purity.'
      },
      {
        title: 'Electrolyte pH Influence',
        text: 'In acidic media (pH < 4.3), hydrogen evolution dominates with rapid attack; in neutral (pH 4.3–10), diffusion-controlled oxygen reduction governs; at high pH, passivity forms.'
      },
      {
        title: 'Temperature Arrhenius Acceleration',
        text: 'Higher temperature accelerates ion diffusion and electrochemical reaction rates exponentially, approximately doubling rate per 30°C rise.'
      },
      {
        title: 'Dissolved Oxygen Depolarization',
        text: 'In neutral solutions, cathodic reduction of dissolved oxygen (O₂ + 2H₂O + 4e⁻ → 4OH⁻) directly controls the overall corrosion current.'
      },
      {
        title: 'Critical Relative Humidity (CRH)',
        text: 'Atmospheric corrosion accelerates exponentially above ~60–75% RH, where an invisible microscopic electrolyte film condenses on the surface.'
      },
      {
        title: 'Metal Purity & Heterogeneity',
        text: 'Impurities and grain boundary inclusions create local micro-galvanic cells; ultra-pure metals exhibit markedly lower corrosion rates.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.pH < 3) w.push('Extreme acid condition: rapid hydrogen evolution corrosion.');
      return w;
    },
    compute: (p) => {
      const ph = Number(p.pH) || 7.0;
      const T = Number(p.temp) || 25;
      const doConc = Number(p.doMgL) || 8;
      const rh = Number(p.humidity) || 60;

      // Base rate in neutral mild steel: ~5-15 mpy
      let rate = 8.0;
      if (ph < 4.5) rate += (4.5 - ph) * 25; // acid acceleration
      else if (ph > 10.5) rate = Math.max(1.0, rate - (ph - 10.5) * 2.5); // alkaline passivity

      // Temp factor
      rate *= Math.exp((T - 25) / 35);
      // DO factor
      rate *= (doConc / 8);
      // Humidity factor
      if (rh < 60) rate *= (rh / 60) * 0.4;
      else rate *= (1 + (rh - 60) * 0.015);

      if (p.metalType.includes('Ultra-Pure')) rate *= 0.25;

      return {
        formulas: [{
          name: 'Multi-Factor Corrosion Rate Model',
          formula: 'Rate = f(pH) × exp(ΔT/35) × [DO]/8 × f(RH) × PurityFactor',
          given: `pH = ${ph}, T = ${T}°C, DO = ${doConc} mg/L, RH = ${rh}%`,
          calc: `Rate = ${rate.toFixed(1)} mpy (${(rate * 0.0254).toFixed(3)} mm/yr)`,
          result: `${rate.toFixed(1)} mpy`,
          unit: 'mpy'
        }],
        readouts: [
          { label: 'Calculated Corrosion Rate', value: `${rate.toFixed(1)} mpy`, tone: rate > 30 ? 'red' : rate > 10 ? 'amber' : 'green' },
          { label: 'Penetration Rate', value: `${(rate * 0.0254).toFixed(3)} mm/yr`, tone: 'blue' },
          { label: 'Rate-Limiting Stage', value: ph < 4.5 ? 'H⁺ Evolution' : 'O₂ Diffusion', tone: 'blue' },
          { label: 'Electrolyte Regime', value: ph < 5 ? 'Acidic' : ph > 10 ? 'Passivating' : 'Neutral', tone: 'green' }
        ],
        state: { rate },
        explain: {
          what: `Corrosion testing of ${p.metalType} in controlled environmental station.`,
          why: `Corrosion rate depends on chemical driving force (pH), mass transport of depolarizer (DO), and kinetic temperature factors.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const rate = state.rate || 8.0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Environmental Testing Chamber (Transparent enclosure)
      C3D.drawBox(g, P, [0, 0, 0.4], [3.2, 2.4, 2.0], 'rgba(30, 41, 59, 0.3)', { scene, stroke: '#38bdf8' });

      // Specimen Rack with Metal Coupon
      C3D.drawBox(g, P, [0, 0, 0.2], [1.2, 0.15, 1.4], rate > 25 ? '#b45309' : '#64748b', { scene });

      // Mist / Humidity Spray Nozzle on top
      C3D.drawCylinder(g, P, [0, 0, 1.3], 0.15, 0.25, '#94a3b8', { scene });

      // Environmental Sensors
      C3D.drawVoltmeter(g, P, [0, 0, 2.2], 1.0, rate, 100.0, {
        scene,
        label: 'CORROSION (MPY)',
        decimals: 1
      });

      // Tags
      scene.add(P([0, 0, 0.4]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.4], `Coupon: ${p.metalType} (${rate.toFixed(1)} mpy)`, rate > 25 ? '#dc2626' : '#16a34a', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Specimen: ${p.metalType}`, color: '#64748b' },
        { label: `pH: ${p.pH} | Temp: ${p.temp}°C`, color: '#38bdf8' },
        { label: `DO: ${p.doMgL} mg/L | RH: ${p.humidity}%`, color: '#eab308' },
        { label: 'Environmental Test Chamber', color: '#1e293b' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 29 — Sacrificial Anode Protection (chem-sacrificial-anode)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-sacrificial-anode'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('anodeMaterial', 'Sacrificial Anode Metal', 'Magnesium (Mg)', ['Magnesium (Mg)', 'Zinc (Zn)', 'Aluminium-Zinc Alloy (Al-Zn)']),
      r('pipeLength', 'Protected Pipeline Length', 10, 200, 10, 50, 'm'),
      r('soilResistivity', 'Soil Resistivity', 500, 10000, 500, 2500, 'Ω·cm'),
      r('anodeMass', 'Anode Ingot Mass', 5, 50, 5, 20, 'kg')
    ],
    steps: () => [
      {
        title: 'Buried Steel Pipeline Infrastructure',
        text: 'Underground steel pipes are susceptible to severe electrochemical soil corrosion due to moisture, dissolved salts, and differential aeration.'
      },
      {
        title: 'Sacrificial Galvanic Anode Coupling',
        text: 'A block of more active metal (Mg, Zn, or Al-Zn alloy) is buried adjacent to the pipe and electrically bonded via insulated copper wire.'
      },
      {
        title: 'Anode Oxidation & Electron Feed',
        text: 'The sacrificial block oxidizes preferentially: Mg → Mg²⁺ + 2e⁻, pumping electrons into the pipeline to suppress steel dissolution (Fe → Fe²⁺ + 2e⁻).'
      },
      {
        title: 'Pipeline Becomes Cathode',
        text: 'The entire steel pipe is polarized cathodically below -0.85 V vs Copper-Copper Sulfate Electrode (CSE), achieving complete cathodic protection.'
      },
      {
        title: 'Chemical Backfill Bedding',
        text: 'The sacrificial anode is embedded in bentonite clay and gypsum backfill to ensure uniform moisture retention and prevent passivation.'
      },
      {
        title: 'Anode Consumption & Service Life',
        text: 'Anode life is governed by Faraday\'s law: Life = (Mass × Efficiency × 8760) / (Consumption Rate × Current), requiring replacement every 10–20 years.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.soilResistivity > 5000 && p.anodeMaterial === 'Zinc (Zn)') w.push('Zinc driving potential is insufficient for high-resistivity soil (>5000 Ω·cm); use Magnesium.');
      return w;
    },
    compute: (p) => {
      const drivingVolt = p.anodeMaterial.includes('Magnesium') ? 0.70 : p.anodeMaterial.includes('Zinc') ? 0.25 : 0.35;
      const rho = Number(p.soilResistivity) || 2500;
      const L = Number(p.pipeLength) || 50;
      const mass = Number(p.anodeMass) || 20;

      // Anode current mA
      const iAnode = (drivingVolt / (rho * 0.001)) * 1000;
      const pipePotential = -0.85 - (iAnode / 1000) * 0.1;
      const lifeYears = ((mass * 0.5 * 8760) / (iAnode * 0.001 * 8760 * 0.008)).toFixed(1);

      return {
        formulas: [{
          name: 'Cathodic Protection Potential & Life',
          formula: 'E_pipe < -0.85 V vs CSE (Criterion) | Life = (Mass × Current Capacity) / I_demand',
          given: `Anode = ${p.anodeMaterial}, Driving ΔV = ${drivingVolt} V, Soil ρ = ${rho} Ω·cm`,
          calc: `I_prot = ${iAnode.toFixed(1)} mA, E_pipe = ${pipePotential.toFixed(3)} V vs CSE`,
          result: `Pipe Potential = ${pipePotential.toFixed(3)} V vs CSE, Life = ${lifeYears} yrs`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Pipe Polarization Potential', value: `${pipePotential.toFixed(3)} V`, tone: pipePotential < -0.85 ? 'green' : 'red' },
          { label: 'Protection Status', value: pipePotential < -0.85 ? 'Fully Protected' : 'Under-protected', tone: pipePotential < -0.85 ? 'green' : 'red' },
          { label: 'Protective Current', value: `${iAnode.toFixed(1)} mA`, tone: 'blue' },
          { label: 'Estimated Anode Life', value: `${lifeYears} years`, tone: 'green' }
        ],
        state: { pipePotential, iAnode, lifeYears },
        explain: {
          what: `Sacrificial ${p.anodeMaterial} anode protecting ${L} m buried steel pipe.`,
          why: `Electrochemical driving potential forces electrons into the pipe, depressing its potential below the immune Pourbaix threshold (-0.85 V vs CSE).`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#334155', 1.0);

      // Underground Soil Cutaway
      C3D.drawBox(g, P, [0, 0, -0.6], [3.8, 2.6, 0.8], '#78350f', { scene });

      // Steel Pipeline (Cylinder along X axis)
      C3D.drawPipe(g, P, [-1.8, 0, -0.4], [1.8, 0, -0.4], 0.35, '#64748b', { scene });

      // Sacrificial Anode Block (Buried below)
      C3D.drawBox(g, P, [0, 0, -0.8], [0.6, 0.6, 0.4], '#e2e8f0', { scene, stroke: '#d97706' });

      // Connecting Copper Bonding Wire from Anode to Pipe
      C3D.drawPipe(g, P, [0, 0, -0.6], [0, 0, -0.05], 0.04, '#dc2626', { scene });

      // Protective electron flow along wire to pipe
      for (let i = 0; i < 4; i++) {
        const ez = -0.6 + ((time * 1.5 + i * 0.2) % 0.55);
        const posE = [0, 0, ez];
        scene.add(P(posE).depth, (ctx) => { C3D.drawAtom(ctx, P, posE, 0.05, '#eab308', 'e', '-'); });
      }

      // Monitoring Test Station Post on ground surface
      C3D.drawCylinder(g, P, [0, 0, 0.2], 0.08, 0.8, '#f1f5f9', { scene });

      // Voltmeter on test post
      C3D.drawVoltmeter(g, P, [0, 0, 1.2], 0.8, Math.abs(state.pipePotential || 0.88), 2.0, {
        scene,
        label: 'PIPE-SOIL V',
        decimals: 2
      });

      // Tags
      scene.add(P([0, 0, -0.4]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, -0.4], 'Steel Pipe (Cathode Protected)', '#15803d', -22);
      });
      scene.add(P([0, 0, -0.8]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, -0.8], `Sacrificial ${p.anodeMaterial} Anode`, '#d97706', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Protected Steel Pipeline (Cathode)', color: '#64748b' },
        { label: `Sacrificial ${p.anodeMaterial} Block (Anode)`, color: '#e2e8f0' },
        { label: 'e⁻ Electron Protection Current', color: '#eab308', symbol: true },
        { label: 'Soil Bedding Backfill', color: '#78350f' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 30 — Impressed Current Cathodic Protection (chem-impressed-current)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-impressed-current'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('dcVoltage', 'Transformer-Rectifier DC Voltage', 5, 50, 5, 24, 'V'),
      r('dcCurrent', 'Rectifier Output Current', 1, 20, 1, 8, 'A'),
      select('anodeType', 'Inert Groundbed Anode', 'Mixed Metal Oxide (MMO) Titanium', ['Mixed Metal Oxide (MMO) Titanium', 'High-Silicon Cast Iron (HSCI)', 'Graphite Canister']),
      r('structureArea', 'Structure Surface Area', 50, 500, 25, 200, 'm²')
    ],
    steps: () => [
      {
        title: 'Impressed Current Architecture (ICCP)',
        text: 'For massive structures (storage tanks, long pipelines), ICCP supplies external DC current from a transformer-rectifier to inert groundbed anodes.'
      },
      {
        title: 'Transformer-Rectifier Unit (TRU)',
        text: 'AC mains power is stepped down and rectified to controllable DC: positive terminal connects to inert groundbed; negative terminal connects to steel structure.'
      },
      {
        title: 'Inert Groundbed Oxidation',
        text: 'Inert anodes (MMO Ti, graphite) discharge current into soil without dissolving: 2H₂O → O₂ + 4H⁺ + 4e⁻ (or 2Cl⁻ → Cl₂ + 2e⁻).'
      },
      {
        title: 'Soil Current Field & Structure Reception',
        text: 'Ionic current travels through soil electrolyte to the steel structure, polarizing every square meter of steel cathodically.'
      },
      {
        title: 'Negative Terminal Cathodic Polarization',
        text: 'Electrons returning through the negative cable neutralize anodic iron dissolution sites, eliminating corrosion entirely.'
      },
      {
        title: 'Over-Protection & Hydrogen Embrittlement',
        text: 'Excessive negative potential (more negative than -1.15 V vs CSE) causes cathodically evolved hydrogen to embrittle high-strength steels and disbond coatings.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.dcVoltage > 40) w.push('Over-protection warning: check for coating disbondment and hydrogen embrittlement.');
      return w;
    },
    compute: (p) => {
      const V_dc = Number(p.dcVoltage) || 24;
      const I_dc = Number(p.dcCurrent) || 8;
      const area = Number(p.structureArea) || 200;

      const currentDensity = (I_dc * 1000) / area; // mA/m2
      const pipePotential = -0.85 - (currentDensity / 40) * 0.25;

      return {
        formulas: [{
          name: 'ICCP Circuit & Current Density',
          formula: 'J = I_rectifier / Area | Target: -0.85 V to -1.15 V vs CSE',
          given: `V_dc = ${V_dc} V, I_dc = ${I_dc} A, Area = ${area} m²`,
          calc: `Current Density J = (${I_dc} × 1000) / ${area} = ${currentDensity.toFixed(1)} mA/m²`,
          result: `Structure Potential = ${pipePotential.toFixed(3)} V vs CSE`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Structure Potential', value: `${pipePotential.toFixed(3)} V`, tone: pipePotential >= -1.15 && pipePotential <= -0.85 ? 'green' : 'amber' },
          { label: 'Current Density Demand', value: `${currentDensity.toFixed(1)} mA/m²`, tone: 'blue' },
          { label: 'DC Power Drawn', value: `${(V_dc * I_dc).toFixed(0)} Watts`, tone: 'blue' },
          { label: 'Cathodic Status', value: pipePotential < -1.15 ? 'Over-Protected' : 'Fully Protected', tone: pipePotential < -1.15 ? 'amber' : 'green' }
        ],
        state: { pipePotential, currentDensity },
        explain: {
          what: `ICCP system using ${p.anodeType} powered by ${V_dc} V / ${I_dc} A DC rectifier.`,
          why: `External DC power supply drives inert anode oxygen evolution while making the entire buried steel tank cathode immune.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#334155', 1.0);

      // Buried Steel Storage Tank (Left side)
      C3D.drawTank ? C3D.drawTank(g, P, [-1.4, 0, -0.4], 1.6, 1.8, 1.4, '#475569', { scene }) :
                     C3D.drawBox(g, P, [-1.4, 0, -0.4], [1.6, 1.8, 1.4], '#475569', { scene, stroke: '#64748b' });

      // Inert Groundbed Anode (Right side)
      C3D.drawCylinder(g, P, [1.4, 0, -0.8], 0.18, 1.2, '#1e293b', { scene, topCap: true });

      // Transformer-Rectifier Unit Cabinet (Above ground center)
      C3D.drawBox(g, P, [0, 0, 1.0], [0.9, 0.7, 1.0], '#0284c7', { scene, stroke: '#38bdf8' });

      // DC Negative Wire (Black, TRU to Tank)
      C3D.drawPipe(g, P, [-0.4, 0, 1.0], [-1.4, 0, 0.3], 0.04, '#0f172a', { scene });

      // DC Positive Wire (Red, TRU to Anode)
      C3D.drawPipe(g, P, [0.4, 0, 1.0], [1.4, 0, -0.2], 0.04, '#dc2626', { scene });

      // Voltmeter on TRU
      C3D.drawVoltmeter(g, P, [0, 0, 1.9], 0.8, p.dcVoltage || 24, 50.0, {
        scene,
        label: 'TRU DC VOLTS',
        decimals: 1
      });

      // Tags
      scene.add(P([-1.4, 0, 0.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.4, 0, 0.4], 'Protected Steel Tank (−)', '#15803d', -22); });
      scene.add(P([1.4, 0, 0.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.4, 0, 0.4], 'Inert MMO Anode (+)', '#dc2626', -22); });
      scene.add(P([0, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.0], 'DC Rectifier Unit', '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Protected Buried Steel Tank (Cathode)', color: '#475569' },
        { label: 'Inert MMO Groundbed Anode (+)', color: '#1e293b' },
        { label: 'DC Transformer-Rectifier Cabinet', color: '#0284c7' },
        { label: 'Protective Soil Current Loop', color: '#eab308', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 31 — Electroplating Simulator (chem-electroplating)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-electroplating'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('current', 'Plating Current (I)', 0.5, 10.0, 0.5, 3.0, 'A'),
      r('timeMin', 'Plating Duration', 5, 60, 5, 20, 'min'),
      r('partArea', 'Cathode Workpiece Area', 20, 200, 10, 80, 'cm²'),
      select('coatingMetal', 'Plating Metal', 'Copper (Cu)', ['Copper (Cu)', 'Silver (Ag)', 'Gold (Au)', 'Zinc (Zn)'])
    ],
    steps: () => [
      {
        title: 'Electroplating Cell Architecture',
        text: 'Electroplating deposits a thin, coherent metallic coating onto a substrate by electrolysis to enhance corrosion resistance and appearance.'
      },
      {
        title: 'Electrode Arrangement',
        text: 'Anode consists of pure plating metal (e.g. Copper); cathode is the clean workpiece to be plated (e.g. steel spoon or plate).'
      },
      {
        title: 'Electrolyte Bath & Dissociation',
        text: 'Aqueous salt solution (e.g. CuSO₄ + dilute H₂SO₄) provides metal cations (Cu²⁺). Sulfuric acid enhances bath electrical conductivity.'
      },
      {
        title: 'Faraday’s Law of Deposition',
        text: 'Mass deposited is proportional to charge passed: m = (M × I × t) / (n × F). Copper deposits at the cathode: Cu²⁺ + 2e⁻ → Cu.'
      },
      {
        title: 'Anode Dissolution & Bath Equilibrium',
        text: 'The soluble copper anode dissolves at exactly the same rate: Cu → Cu²⁺ + 2e⁻, maintaining constant copper ion concentration in bath.'
      },
      {
        title: 'Coating Thickness & Quality Control',
        text: 'Coating thickness d = m / (ρ × A). Proper current density, bath agitation, and brightener additives prevent nodular or dendritic burning.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.current / (p.partArea / 100) > 8) w.push('High current density: risk of burning, hydrogen codeposition, and porous deposits.');
      return w;
    },
    compute: (p) => {
      const metals = {
        'Copper (Cu)': { M: 63.55, n: 2, rho: 8.96, col: '#b45309', sym: 'Cu' },
        'Silver (Ag)': { M: 107.87, n: 1, rho: 10.49, col: '#e2e8f0', sym: 'Ag' },
        'Gold (Au)': { M: 196.97, n: 3, rho: 19.32, col: '#eab308', sym: 'Au' },
        'Zinc (Zn)': { M: 65.38, n: 2, rho: 7.14, col: '#94a3b8', sym: 'Zn' }
      };

      const m = metals[p.coatingMetal] || metals['Copper (Cu)'];
      const I = Number(p.current) || 3.0;
      const tSec = (Number(p.timeMin) || 20) * 60;
      const A = Number(p.partArea) || 80;

      // Faraday mass
      const massGrams = (m.M * I * tSec) / (m.n * 96485);
      // Volume = mass / rho cm3; thickness d = V / A cm -> um
      const thicknessUm = (massGrams / (m.rho * A)) * 10000;
      const jDensity = I / (A / 100); // A/dm2

      return {
        formulas: [{
          name: 'Faraday’s Laws of Electrolytic Deposition',
          formula: 'm = (M × I × t) / (n × F) | Thickness d = m / (ρ × A)',
          given: `Metal = ${p.coatingMetal}, I = ${I} A, t = ${p.timeMin} min, A = ${A} cm²`,
          calc: `m = (${m.M} × ${I} × ${tSec}) / (${m.n} × 96485) = ${massGrams.toFixed(3)} g`,
          result: `Mass Deposited = ${massGrams.toFixed(3)} g, Thickness = ${thicknessUm.toFixed(2)} µm`,
          unit: 'µm'
        }],
        readouts: [
          { label: 'Deposited Metal Mass', value: `${massGrams.toFixed(3)} g`, tone: 'green' },
          { label: 'Layer Thickness (d)', value: `${thicknessUm.toFixed(2)} µm`, tone: 'blue' },
          { label: 'Cathode Current Density', value: `${jDensity.toFixed(2)} A/dm²`, tone: 'blue' },
          { label: 'Faradaic Efficiency', value: '98.5%', tone: 'green' }
        ],
        state: { massGrams, thicknessUm, m },
        explain: {
          what: `Electroplating ${p.coatingMetal} onto workpiece in electrolytic bath.`,
          why: `DC current drives controlled reduction of metal ions at cathode, forming an adherent, protective metallurgical coating.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const m = state.m || { col: '#b45309', sym: 'Cu' };
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Glass Tank with Electrolyte (Blue CuSO4 solution)
      C3D.drawBox(g, P, [0, 0, 0.1], [3.2, 2.2, 1.8], 'rgba(56, 189, 248, 0.35)', { scene, stroke: '#0284c7' });

      // Anode (Pure Metal Plate on Left)
      C3D.drawBox(g, P, [-1.0, 0, 0.3], [0.25, 1.4, 1.5], m.col, { scene });

      // Cathode Workpiece (Target Part on Right)
      C3D.drawBox(g, P, [1.0, 0, 0.3], [0.2, 1.4, 1.5], '#64748b', { scene });

      // Plated Film Growing on Cathode
      const platedW = 0.05 + Math.min(0.12, (state.thicknessUm || 5) * 0.008);
      C3D.drawBox(g, P, [0.88, 0, 0.3], [platedW, 1.4, 1.5], m.col, { scene });

      // DC Power Supply on Bench Top
      C3D.drawVoltmeter(g, P, [0, 0, 2.0], 1.0, p.current || 3.0, 10.0, {
        scene,
        label: 'DC CURRENT (A)',
        decimals: 1
      });

      // Shuttling Metal Cations across bath
      for (let i = 0; i < 4; i++) {
        const xPos = -0.7 + ((time * 0.4 + i * 0.3) % 1.5);
        const posIon = [xPos, 0, 0.3 + (i % 2 ? 0.25 : -0.25)];
        scene.add(P(posIon).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posIon, 0.08, m.col, m.sym, '2+');
        });
      }

      // Tags
      scene.add(P([-1.0, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.0, 0, 1.1], `Anode: Pure ${p.coatingMetal} (+)`, '#dc2626', -22); });
      scene.add(P([1.0, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.0, 0, 1.1], 'Cathode: Workpiece (−)', '#15803d', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Anode: Pure ${p.coatingMetal} Plate`, color: m.col },
        { label: 'Cathode Workpiece (Steel Substrate)', color: '#64748b' },
        { label: `Electroplated Layer (${state.thicknessUm ? state.thicknessUm.toFixed(1) : 10} µm)`, color: m.col },
        { label: 'Mⁿ⁺ Dissolved Metal Cations', color: m.col, symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 32 — Nickel Plating Watts Bath (chem-nickel-plating)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-nickel-plating'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('temp', 'Watts Bath Temperature', 40, 70, 5, 55, '°C'),
      r('pH', 'Bath pH (H₃BO₃ Buffer)', 3.5, 5.5, 0.1, 4.2, ''),
      r('currentDensity', 'Cathode Current Density', 1.0, 8.0, 0.5, 4.0, 'A/dm²'),
      r('platingTime', 'Plating Time', 5, 45, 5, 20, 'min')
    ],
    steps: () => [
      {
        title: 'Industrial Watts Bath Formulation',
        text: 'The standard Watts bath contains NiSO₄·6H₂O (nickel source, ~250–300 g/L), NiCl₂·6H₂O (anode corrosion, ~45 g/L), and H₃BO₃ (pH buffer, ~30 g/L).'
      },
      {
        title: 'Titanium Anode Basket with Nickel Pellets',
        text: 'Titanium mesh baskets hold electrolytic sulfur-depolarized (S-nickel) rounds, dissolving smoothly without anode passivation.'
      },
      {
        title: 'Role of Boric Acid (H₃BO₃) Buffer',
        text: 'H₃BO₃ maintains cathode film pH at 4.0–4.5, preventing local alkalinization and subsequent precipitation of brittle Ni(OH)₂.'
      },
      {
        title: 'Cathode Deposition Reaction',
        text: 'At the cathode, nickel ions reduce to metal: Ni²⁺ + 2e⁻ → Ni. Parallel hydrogen evolution (2H⁺ + 2e⁻ → H₂) is minimized by proper temperature.'
      },
      {
        title: 'Organic Brighteners & Levellers',
        text: 'Class I and Class II organic brighteners (saccharin, butynediol) adsorb on micro-peaks to produce mirror-like specular reflectivity.'
      },
      {
        title: 'Duplex Nickel Corrosion Resistance',
        text: 'Applying semi-bright sulfur-free nickel under bright nickel provides sacrificial protection, preventing rust spots on automotive trim.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.pH > 4.8) w.push('High pH causes nickel hydroxide precipitation and rough, brittle deposits.');
      return w;
    },
    compute: (p) => {
      const j = Number(p.currentDensity) || 4.0;
      const tMin = Number(p.platingTime) || 20;
      const T = Number(p.temp) || 55;

      // Rate: 1 A/dm2 deposits approx 0.20 um/min at 96% efficiency
      const eff = Math.min(98, 92 + (T - 40) * 0.15);
      const thickness = (j * tMin * 0.205 * (eff / 100)).toFixed(1);

      return {
        formulas: [{
          name: 'Watts Bath Electrodeposition Kinetics',
          formula: 'Ni²⁺ + 2e⁻ → Ni (96% CE) | Thickness d = J × t × Rate_factor × CE',
          given: `J = ${j} A/dm², t = ${tMin} min, T = ${T}°C, pH = ${p.pH}`,
          calc: `d = ${j} × ${tMin} × 0.205 × ${(eff / 100).toFixed(2)} = ${thickness} µm`,
          result: `Bright Nickel Thickness = ${thickness} µm, Cathode Efficiency = ${eff.toFixed(1)}%`,
          unit: 'µm'
        }],
        readouts: [
          { label: 'Bright Nickel Thickness', value: `${thickness} µm`, tone: 'green' },
          { label: 'Cathode Efficiency', value: `${eff.toFixed(1)}%`, tone: 'green' },
          { label: 'Bath Operating pH', value: `${p.pH} (Buffered)`, tone: 'blue' },
          { label: 'Deposit Quality', value: 'Mirror Bright & Ductile', tone: 'green' }
        ],
        state: { thickness, eff },
        explain: {
          what: `Watts bath bright nickel electroplating at ${T}°C, pH ${p.pH}.`,
          why: `Boric acid buffers cathode interface against pH rise, ensuring smooth crystal nucleation and mirror-like finish.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Heated Plating Tank (Greenish Watts bath)
      C3D.drawBox(g, P, [0, 0, 0.1], [3.2, 2.2, 1.8], 'rgba(16, 185, 129, 0.35)', { scene, stroke: '#059669' });

      // Titanium Anode Basket with Nickel Pellets
      C3D.drawBox(g, P, [-1.0, 0, 0.3], [0.3, 1.4, 1.5], '#94a3b8', { scene });

      // Cathode Workpiece (Brass/Steel part)
      C3D.drawBox(g, P, [1.0, 0, 0.3], [0.2, 1.4, 1.5], '#cbd5e1', { scene });

      // Mirror-bright Nickel Layer
      C3D.drawBox(g, P, [0.88, 0, 0.3], [0.08, 1.4, 1.5], '#f8fafc', { scene, stroke: '#38bdf8' });

      // Agitation bubbles rising
      for (let i = 0; i < 5; i++) {
        const bz = -0.5 + ((time * 0.8 + i * 0.25) % 1.4);
        const bx = -0.6 + i * 0.3;
        const posB = [bx, 0, bz];
        scene.add(P(posB).depth, (ctx) => { C3D.drawAtom(ctx, P, posB, 0.05, '#ffffff', '', ''); });
      }

      // Tags
      scene.add(P([-1.0, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.0, 0, 1.1], 'Titanium Basket (Ni Pellets)', '#94a3b8', -22); });
      scene.add(P([1.0, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.0, 0, 1.1], 'Cathode (Mirror Bright Ni)', '#38bdf8', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Titanium Basket (S-Nickel Pellets)', color: '#94a3b8' },
        { label: 'Cathode Workpiece Substrate', color: '#cbd5e1' },
        { label: 'Mirror Bright Nickel Deposit', color: '#f8fafc' },
        { label: 'Watts Electrolyte (NiSO₄ + H₃BO₃)', color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 33 — Alloy Composition Simulator (chem-alloy-composition)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-alloy-composition'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.38, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('alloyFamily', 'Engineering Alloy System', 'Brass (Cu-Zn System)', ['Brass (Cu-Zn System)', 'Bronze (Cu-Sn System)', 'Stainless Steel (Fe-Cr-Ni)', 'German Silver (Cu-Ni-Zn)']),
      r('primaryComp', 'Primary Alloying Element', 10, 50, 2, 30, '%'),
      select('phaseView', 'Microstructure Phase View', 'Metallurgical Grains', ['Metallurgical Grains', '3D Crystal Unit Cell', 'Passivation Surface'])
    ],
    steps: () => [
      {
        title: 'Alloy Solid Solutions & Phase Diagrams',
        text: 'Alloying metals enhances mechanical strength, corrosion resistance, and thermal properties through solid solution strengthening and phase transformations.'
      },
      {
        title: 'Copper-Zinc Brass Metallurgy',
        text: 'Alpha brass (Zn < 36%): single-phase fcc solid solution, highly ductile and cold workable. Beta brass (Zn > 38%): hard bcc phase for hot forging.'
      },
      {
        title: 'Dezincification Hazard in Brasses',
        text: 'Brasses with >15% Zn in stagnant acidic waters undergo dezincification: selective leaching of zinc leaves a weak, porous copper sponge.'
      },
      {
        title: 'Stainless Steel Passivity (Fe-Cr-Ni)',
        text: 'Chromium (>10.5–12%) forms an invisible, self-healing chromium oxide (Cr₂O₃) passive barrier film that protects steel from rusting.'
      },
      {
        title: 'Nickel Addition & Austenitic Stabilization',
        text: 'Nickel stabilizes the ductile, non-magnetic fcc austenite phase (AISI 304/316) down to cryogenic temperatures.'
      },
      {
        title: 'Engineered Phase Boundaries',
        text: 'Careful control of alloying composition and cooling rates tailors microstructure to resist intergranular attack and stress corrosion cracking.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.alloyFamily.includes('Brass') && p.primaryComp > 45) w.push('High zinc brass is brittle due to gamma phase formation.');
      return w;
    },
    compute: (p) => {
      const comp = Number(p.primaryComp) || 30;
      let phase = 'Single-Phase α Solid Solution';
      let hardness = '120 HV';
      let corrResist = 'Good (Subject to dezincification if Zn > 15%)';

      if (p.alloyFamily.includes('Brass')) {
        phase = comp < 36 ? 'α-Brass (FCC Ductile)' : comp < 45 ? 'α+β Duplex Brass' : 'β-Brass (BCC Hard)';
        hardness = comp < 36 ? `${85 + comp * 1.2} HV` : `${140 + comp * 1.5} HV`;
        corrResist = comp > 15 ? 'Dezincification sensitive (Inhibit with 0.04% As)' : 'Excellent';
      } else if (p.alloyFamily.includes('Stainless')) {
        phase = comp >= 18 ? 'Austenitic (FCC 304/316)' : 'Ferritic / Martensitic';
        corrResist = comp >= 12 ? 'Passive (Cr₂O₃ self-healing)' : 'Rusting (Cr < 11%)';
        hardness = '180–220 HV';
      }

      return {
        formulas: [{
          name: 'Alloy Constitution & Phase Rules',
          formula: 'Alloy: ' + p.alloyFamily + ' | Composition: ' + comp + '% solute',
          given: `Primary Element = ${comp}%`,
          calc: `Microstructure Phase = ${phase}`,
          result: `Microstructure: ${phase}, Hardness: ${hardness}`,
          unit: 'HV'
        }],
        readouts: [
          { label: 'Microstructure Phase', value: phase.split(' ')[0], tone: 'green' },
          { label: 'Estimated Hardness', value: hardness, tone: 'blue' },
          { label: 'Corrosion Behavior', value: corrResist.split(' ')[0], tone: 'green' },
          { label: 'Crystal Lattice', value: phase.includes('FCC') ? 'FCC' : 'BCC', tone: 'blue' }
        ],
        state: { phase, hardness, comp },
        explain: {
          what: `Metallurgical composition analysis of ${p.alloyFamily} at ${comp}% solute.`,
          why: `Solute concentration dictates whether atoms form single-phase solid solutions or precipitate hard intermetallic secondary phases.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const comp = state.comp || 30;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Metallurgical Specimen Mount (Bakelite puck)
      C3D.drawCylinder(g, P, [0, 0, -0.6], 1.5, 0.8, '#0f172a', { scene, topCap: true });

      // Polished Metal Surface on top puck
      const baseCol = p.alloyFamily.includes('Brass') ? '#d97706' : p.alloyFamily.includes('Bronze') ? '#b45309' : '#94a3b8';
      C3D.drawCylinder(g, P, [0, 0, 0.2], 1.3, 0.1, baseCol, { scene, topCap: true });

      // Grains and phase boundaries (Visualized as segmented polygons)
      for (let i = -0.8; i <= 0.8; i += 0.5) {
        for (let j = -0.8; j <= 0.8; j += 0.5) {
          const posGrain = [i, j, 0.32];
          const isSecondary = (Math.abs(i * 10 + j * 5) % 3 === 0) && comp > 35;
          scene.add(P(posGrain).depth, (ctx) => {
            ctx.fillStyle = isSecondary ? '#dc2626' : baseCol;
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(P(posGrain).x, P(posGrain).y, 14, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
          });
        }
      }

      // Tags
      scene.add(P([0, 0, 0.4]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.4], `${p.alloyFamily}: ${state.phase ? state.phase.split(' ')[0] : 'α-Phase'}`, '#0284c7', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Primary Matrix Phase (${p.alloyFamily.split(' ')[0]})`, color: baseCol },
        { label: 'Secondary Intermetallic Phase', color: '#dc2626' },
        { label: 'Grain Boundaries', color: '#1e293b' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 34 — Heat Treatment Simulator (chem-heat-treatment)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-heat-treatment'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('process', 'Heat Treatment Process', 'Quenching (Martensite Formation)', ['Annealing (Furnace Cooling)', 'Normalizing (Still Air Cooling)', 'Quenching (Martensite Formation)', 'Tempering (Reheating Quenched Steel)']),
      r('austenitizeTemp', 'Austenitizing Temperature', 750, 950, 25, 850, '°C'),
      r('soakTime', 'Soaking Duration', 10, 60, 5, 30, 'min'),
      select('quenchMedium', 'Quenching Medium', 'Water Quench (Rapid)', ['Water Quench (Rapid)', 'Oil Quench (Moderate)', 'Air Blast (Mild)'])
    ],
    steps: () => [
      {
        title: 'Thermal Transformation of Steel',
        text: 'Heat treatment modifies microstructure and mechanical properties of plain carbon steel through controlled heating and cooling cycles.'
      },
      {
        title: 'Austenitizing Stage (Above Upper Critical A₃)',
        text: 'Steel is heated to 850°C and soaked to transform ferrite and pearlite completely into homogeneous face-centered cubic (FCC) austenite (γ).'
      },
      {
        title: 'Annealing (Slow Furnace Cooling)',
        text: 'Slow furnace cooling allows carbon diffusion to complete equilibrium, forming coarse pearlite and ferrite: maximum ductility, minimum hardness.'
      },
      {
        title: 'Normalizing (Air Cooling)',
        text: 'Cooling in still air produces fine pearlite with uniform grain structure, improving tensile strength and machinability.'
      },
      {
        title: 'Quenching (Diffusionless Shear Transformation)',
        text: 'Rapid cooling in water/oil surpasses critical cooling rate; carbon is trapped in the iron lattice, distorting it into hard, needle-like BCT martensite.'
      },
      {
        title: 'Tempering (Stress Relief & Toughness)',
        text: 'Reheating brittle martensite to 200–600°C precipitates fine carbide particles, relieving internal quenching stress and imparting high toughness.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.austenitizeTemp < 727) w.push('Temperature below lower critical A₁ (727°C); austenitizing transformation will not occur.');
      return w;
    },
    compute: (p) => {
      const isAnneal = p.process.includes('Annealing');
      const isNorm = p.process.includes('Normalizing');
      const isQuench = p.process.includes('Quenching');
      const isTemper = p.process.includes('Tempering');

      const structure = isAnneal ? 'Coarse Pearlite + Ferrite' :
                        isNorm ? 'Fine Pearlite' :
                        isQuench ? 'Needle Martensite (BCT)' : 'Tempered Martensite';
      const hardnessHRC = isAnneal ? 15 : isNorm ? 25 : isQuench ? 62 : 45;
      const toughness = isAnneal ? 'Very High (Ductile)' : isNorm ? 'High' : isQuench ? 'Very Low (Brittle)' : 'Optimized High Toughness';

      return {
        formulas: [{
          name: 'Phase Transformation Kinetics',
          formula: 'γ-Austenite (FCC) → Cooling Mode → Resulting Microstructure',
          given: `Process = ${p.process}, Temp = ${p.austenitizeTemp} °C, Soak = ${p.soakTime} min`,
          calc: `Microstructure: ${structure}`,
          result: `Hardness: ${hardnessHRC} HRC, Toughness: ${toughness}`,
          unit: 'HRC'
        }],
        readouts: [
          { label: 'Resulting Microstructure', value: structure.split(' ')[0], tone: 'green' },
          { label: 'Hardness (Rockwell C)', value: `${hardnessHRC} HRC`, tone: hardnessHRC > 50 ? 'red' : 'blue' },
          { label: 'Mechanical Toughness', value: toughness.split(' ')[0], tone: toughness.includes('Low') ? 'red' : 'green' },
          { label: 'Cooling Regime', value: isAnneal ? 'Furnace' : isNorm ? 'Air' : isQuench ? 'Water Quench' : 'Reheat', tone: 'amber' }
        ],
        state: { structure, hardnessHRC, toughness },
        explain: {
          what: `Heat treatment cycle: ${p.process} on carbon steel.`,
          why: `Cooling rate controls carbon diffusion: slow cooling yields equilibrium pearlite; rapid quenching traps carbon into martensite.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isQuench = p.process.includes('Quenching');
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Heat Treatment Furnace (Left)
      C3D.drawBox(g, P, [-1.4, 0, 0.4], [1.8, 1.8, 1.8], '#334155', { scene, stroke: '#ea580c' });
      // Glowing furnace interior chamber
      C3D.drawBox(g, P, [-1.4, 0, 0.4], [1.2, 1.2, 1.2], '#ea580c', { scene });

      // Quench Tank (Right)
      C3D.drawBox(g, P, [1.4, 0, 0.1], [1.6, 1.6, 1.4], 'rgba(56, 189, 248, 0.35)', { scene, stroke: '#0284c7' });

      // Steel Test Specimen (Glowing red if in furnace or hot)
      const specPos = isQuench ? [1.4, 0, 0.2] : [-1.4, 0, 0.4];
      const specColor = isQuench ? '#64748b' : '#f97316';
      C3D.drawBox(g, P, specPos, [0.35, 0.35, 1.0], specColor, { scene });

      // Steam vapor rising if quenched
      if (isQuench) {
        for (let i = 0; i < 4; i++) {
          const sz = 0.5 + ((time * 0.8 + i * 0.3) % 1.0);
          const posSteam = [1.4 + (i % 2 ? 0.15 : -0.15), 0, sz];
          scene.add(P(posSteam).depth, (ctx) => { C3D.drawAtom(ctx, P, posSteam, 0.08, '#ffffff', '', ''); });
        }
      }

      // Hardness readout
      C3D.drawVoltmeter(g, P, [0, 0, 2.0], 0.9, state.hardnessHRC || 62, 70.0, {
        scene,
        label: 'HARDNESS (HRC)',
        decimals: 0
      });

      // Tags
      scene.add(P([-1.4, 0, 1.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.4, 0, 1.4], `Furnace (${p.austenitizeTemp}°C)`, '#ea580c', -22); });
      scene.add(P([1.4, 0, 0.9]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.4, 0, 0.9], 'Quench Tank', '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Muffle Furnace (${p.austenitizeTemp}°C)`, color: '#ea580c' },
        { label: 'Quench Bath Tank', color: '#0284c7' },
        { label: `Steel Specimen (${state.structure ? state.structure.split(' ')[0] : 'Austenite'})`, color: specColor },
        { label: `Hardness: ${state.hardnessHRC || 62} HRC`, color: '#38bdf8' }
      ], 24, 88);
    }
  };

  window.Chem3DSimulators = Object.assign(window.Chem3DSimulators || {}, Sim3D);
})();
