'use strict';

/**
 * ChemSims3D-U5 — Unit V: Polymer Science, Engineering Polymers, and Processing (14 Simulations)
 * Complete interactive 3D virtual experiments:
 *  48. chem-polymerization (Chain-growth free radical vs step-growth polycondensation mechanisms)
 *  49. chem-degree-polymerization (Carothers extent p, Mn, Mw, PDI, DP chain length architecture)
 *  50. chem-classification (Structural taxonomy: Linear, Branched, Cross-linked networks, Elastomers)
 *  51. chem-thermoplastic-thermoset (Thermal platen testing: reversible melt flow vs irreversible cross-linked char)
 *  52. chem-glass-transition (Glass transition Tg: frozen brittle glassy state vs cooperative segmental wriggling)
 *  53. chem-abs (ABS terpolymer morphology: polybutadiene rubber nodules in rigid SAN matrix)
 *  54. chem-pvc (Polyvinyl chloride: polar chlorine dipole, rigid uPVC vs plasticized flexible PVC)
 *  55. chem-ptfe (Polytetrafluoroethylene / Teflon: dense fluorine helical sheath, non-stick contact angle)
 *  56. chem-bakelite (Phenol-Formaldehyde thermoset: Novolac linear prepolymer, Resol, 3D methylene network)
 *  57. chem-injection-moulding (Industrial reciprocating screw injection press: hopper, barrel, split cavity mould)
 *  58. chem-extrusion (Single-screw extruder: feed, compression, metering, breaker plate, annular pipe die)
 *  59. chem-compression-moulding (Hydraulic press: heated male/female steel moulds, SMC charge, curing cycle)
 *  60. chem-conducting-polymer (Conjugated polyacetylene / polyaniline backbone, p-doping, polaron charge transport)
 *  61. chem-frp (Fibre-Reinforced Plastic composite laminate: epoxy matrix, glass/carbon fibers, Rule of Mixtures)
 */
(function () {
  const C3D = window.Chem3D;
  const V = C3D.V;
  const D = window.EPDraw;

  const Sim3D = {};

  const r = (key, label, min, max, step, value, unit) => ({ key, label, type: 'range', min, max, step, default: value, unit: unit || '' });
  const select = (key, label, value, options) => ({ key, label, type: 'select', default: value, options: options.map((x) => ({ label: x, value: x })) });

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 48 — Polymerization Mechanisms (chem-polymerization)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-polymerization'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('mechanism', 'Polymerization Mechanism', 'Free Radical Addition', ['Free Radical Addition', 'Cationic Addition', 'Anionic Addition', 'Step-Growth Polycondensation']),
      r('initiatorConc', 'Initiator Concentration [I]', 0.1, 2.0, 0.1, 0.5, '% wt'),
      r('temp', 'Reactor Temperature', 40, 120, 5, 75, '°C'),
      r('monomerConversion', 'Monomer Conversion', 10, 95, 5, 60, '%')
    ],
    steps: () => [
      {
        title: 'Classification of Polymerization Kinetics',
        text: 'Polymerization synthesizes macromolecules from monomers via either chain-growth addition (rapid chain buildup) or step-growth condensation.'
      },
      {
        title: 'Stage 1: Chain Initiation',
        text: 'Thermal homolysis of initiator (benzoyl peroxide, BPO): I₂ → 2R•. Primary radical attacks monomer π-bond: R• + CH₂=CH₂ → R-CH₂-CH₂•.'
      },
      {
        title: 'Stage 2: Rapid Chain Propagation',
        text: 'Active radical center rapidly adds monomer units in milliseconds: R-(CH₂-CH₂)ₙ• + CH₂=CH₂ → R-(CH₂-CH₂)ₙ₊₁•, building high MW early in reaction.'
      },
      {
        title: 'Stage 3: Chain Termination',
        text: 'Two growing radicals terminate growth by combination (Rₙ• + R_m• → Rₙ-R_m) or disproportionation (hydrogen transfer to form saturated + unsaturated chains).'
      },
      {
        title: 'Step-Growth Contrast (Condensation)',
        text: 'In step-growth (e.g. Nylon 6,6), bifunctional monomers react slowly in steps with small molecule elimination (H₂O), requiring >98% conversion for high MW.'
      },
      {
        title: 'Molecular Weight Control',
        text: 'Higher initiator concentration produces more growing chains, yielding lower average molecular weight according to kinetic chain length ν = R_p / 2R_t.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.temp > 100 && p.mechanism.includes('Free Radical')) w.push('High temperature accelerates termination; molecular weight will be significantly reduced.');
      return w;
    },
    compute: (p) => {
      const isRadical = p.mechanism.includes('Free Radical');
      const I = Number(p.initiatorConc) || 0.5;
      const T = Number(p.temp) || 75;
      const conv = Number(p.monomerConversion) || 60;

      // Degree of polymerization inversely proportional to sqrt(I)
      const dp = Math.max(100, Math.round((1200 / Math.sqrt(I)) * Math.exp(-(T - 75) / 80)));
      const mn = dp * 28; // Polyethylene repeat unit 28 g/mol

      return {
        formulas: [{
          name: 'Free Radical Chain Kinetics',
          formula: 'Kinetic Chain Length ν = k_p[M] / (2·(f·k_d·k_t·[I])^0.5) | M_n = DP × M_0',
          given: `[I] = ${I}%, T = ${T}°C, Conversion = ${conv}%`,
          calc: `DP = ${dp}, M_n = ${dp} × 28 g/mol = ${mn} g/mol`,
          result: `DP = ${dp}, Number-Average M_n = ${mn.toLocaleString()} g/mol`,
          unit: 'g/mol'
        }],
        readouts: [
          { label: 'Degree of Polymerization (DP)', value: `${dp}`, tone: 'green' },
          { label: 'Number-Average MW (M_n)', value: `${(mn / 1000).toFixed(1)} kDa`, tone: 'blue' },
          { label: 'Kinetic Regime', value: isRadical ? 'Chain-Growth (Fast)' : 'Step-Growth', tone: 'green' },
          { label: 'Active Radical Center', value: isRadical ? 'Carbon Radical (C•)' : 'Functional End Group', tone: 'amber' }
        ],
        state: { dp, mn, isRadical },
        explain: {
          what: `Synthesis of polymer chains via ${p.mechanism} at ${T}°C.`,
          why: `Initiator concentration controls the number of active growing chains: lower [I] yields fewer chains of much longer molecular weight.`
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

      // Growing polymer chain backbones represented by connected atom beads
      const numBeads = Math.min(22, 10 + Math.round((p.monomerConversion || 60) / 8));
      for (let i = 0; i < numBeads; i++) {
        const x = -1.8 + i * 0.16;
        const y = Math.sin(i * 0.8 + time) * 0.25;
        const z = 0.2 + Math.cos(i * 0.6) * 0.2;
        const posBead = [x, y, z];
        const isEnd = i === numBeads - 1;
        scene.add(P(posBead).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posBead, 0.08, isEnd ? '#ef4444' : '#0284c7', isEnd ? '•' : 'CH₂', '');
        });
      }

      // Free monomer molecules approaching active chain end
      for (let i = 0; i < 4; i++) {
        const mx = 1.0 + ((time * 0.5 + i * 0.3) % 0.8);
        const mz = 0.2 + (i % 2 ? 0.2 : -0.2);
        const posM = [mx, 0, mz];
        scene.add(P(posM).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posM, 0.07, '#10b981', 'M', '');
        });
      }

      // Molecular Weight Display
      C3D.drawVoltmeter(g, P, [0, 0, 1.8], 1.0, (state.mn || 28000) / 1000, 100.0, {
        scene,
        label: 'M_N (KDA)',
        decimals: 1
      });

      // Tags
      scene.add(P([-1.8, 0, 0.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.8, 0, 0.4], 'Initiator Fragment (R-)', '#eab308', -22); });
      scene.add(P([1.4, 0, 0.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.4, 0, 0.4], 'Free Monomers', '#10b981', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Polymer Backbone (CH₂ Repeat Units)', color: '#0284c7' },
        { label: 'Active Radical Center (•)', color: '#ef4444', symbol: true },
        { label: 'Free Monomer Molecules (M)', color: '#10b981', symbol: true },
        { label: `DP: ${state.dp || 1000} Repeat Units`, color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 49 — Degree of Polymerization (chem-degree-polymerization)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-degree-polymerization'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('extentP', 'Carothers Reaction Extent (p)', 0.80, 0.999, 0.005, 0.98, ''),
      r('monomerMw', 'Repeat Unit MW (M₀)', 28, 200, 14, 28, 'g/mol'),
      select('distribution', 'Molecular Weight Distribution', 'Flory-Schulz Most Probable', ['Flory-Schulz Most Probable', 'Monodisperse (PDI = 1.0)', 'Broad Polydisperse (PDI > 2.0)'])
    ],
    steps: () => [
      {
        title: 'Definition of Degree of Polymerization (DP)',
        text: 'DP (X̄ₙ) defines the average number of repeating monomer units in a polymer chain: X̄ₙ = M̄ₙ / M₀, directly determining mechanical strength.'
      },
      {
        title: 'Carothers Equation for Step-Growth',
        text: 'For linear step-growth polycondensation of bifunctional monomers: X̄ₙ = 1 / (1 − p), where p is the fractional extent of functional group reaction.'
      },
      {
        title: 'Extreme Sensitivity at High Extent (p → 1)',
        text: 'At p = 0.90, DP is only 10 (short brittle oligomer). To achieve useful commercial plastics (DP > 100), reaction extent must surpass p = 0.99 (99% conversion)!'
      },
      {
        title: 'Number-Average (M̄ₙ) vs Weight-Average (M̄w)',
        text: 'M̄ₙ measures total mass per mole of molecules (osmometry/titration); M̄w gives greater statistical weight to heavier chains (light scattering/GPC).'
      },
      {
        title: 'Polydispersity Index (PDI)',
        text: 'PDI = M̄w / M̄ₙ ≥ 1.0. For ideal step-growth, PDI = 1 + p ≈ 2.0 (Flory-Schulz most probable distribution); narrow PDI imparts uniform melt viscosity.'
      },
      {
        title: 'Critical Entanglement Molecular Weight (M_c)',
        text: 'Useful mechanical integrity (tensile strength, impact toughness) emerges only once chains exceed M_c, allowing physical chain entanglements.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.extentP < 0.90) w.push('Low reaction extent: material consists of brittle oligomers without mechanical strength.');
      return w;
    },
    compute: (p) => {
      const pExt = Number(p.extentP) || 0.98;
      const m0 = Number(p.monomerMw) || 28;

      // Carothers DP
      const dp = Math.round(1 / (1 - pExt));
      const mn = dp * m0;
      const pdi = (1 + pExt).toFixed(2);
      const mw = (mn * Number(pdi));

      return {
        formulas: [{
          name: 'Carothers Relationship & Molecular Weight',
          formula: 'X̄ₙ = 1 / (1 - p) | M̄ₙ = X̄ₙ × M₀ | PDI = 1 + p',
          given: `p = ${pExt.toFixed(3)}, M₀ = ${m0} g/mol`,
          calc: `DP = 1 / (1 - ${pExt.toFixed(3)}) = ${dp}, M̄ₙ = ${dp} × ${m0}`,
          result: `DP = ${dp}, M̄ₙ = ${mn.toLocaleString()} g/mol, PDI = ${pdi}`,
          unit: 'g/mol'
        }],
        readouts: [
          { label: 'Degree of Polymerization (DP)', value: `${dp}`, tone: dp > 50 ? 'green' : 'amber' },
          { label: 'Number-Average MW (M̄ₙ)', value: `${(mn / 1000).toFixed(1)} kDa`, tone: 'blue' },
          { label: 'Weight-Average MW (M̄w)', value: `${(mw / 1000).toFixed(1)} kDa`, tone: 'blue' },
          { label: 'Polydispersity Index (PDI)', value: `${pdi}`, tone: 'green' }
        ],
        state: { dp, mn, mw, pdi },
        explain: {
          what: `Carothers analysis for reaction extent p = ${pExt.toFixed(3)}.`,
          why: `Linear condensation polymers require extreme stoichiometric purity and high conversion (>99%) to reach critical entanglement molecular weight.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const dp = state.dp || 50;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Visualized polymer chain coil (Length scales with DP)
      const numSegments = Math.min(28, Math.max(6, Math.round(dp / 3)));
      for (let i = 0; i < numSegments; i++) {
        const x = -1.8 + i * 0.13;
        const y = Math.sin(i * 0.7) * 0.3;
        const z = 0.1 + Math.cos(i * 0.5) * 0.25;
        const posSeg = [x, y, z];
        scene.add(P(posSeg).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posSeg, 0.07, '#0284c7', '', '');
        });
      }

      // DP Indicator Display
      C3D.drawVoltmeter(g, P, [0, 0, 1.8], 1.0, dp, 200.0, {
        scene,
        label: 'CAROTHERS DP',
        decimals: 0
      });

      // Tags
      scene.add(P([0, 0, 0.6]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.6], `DP = ${dp} Repeat Units`, dp > 40 ? '#10b981' : '#f59e0b', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Polymer Chain (DP = ${dp})`, color: '#0284c7' },
        { label: `Extent of Reaction: p = ${(p.extentP || 0.98)}`, color: '#10b981' },
        { label: `PDI: ${state.pdi || 1.98}`, color: '#eab308' },
        { label: `M̄ₙ: ${state.mn ? (state.mn / 1000).toFixed(1) : 28} kDa`, color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 50 — Polymer Classification (chem-classification)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-classification'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('taxType', 'Classification Axis', 'By Molecular Architecture', ['By Molecular Architecture', 'By Intermolecular Forces', 'By Thermal Behavior', 'By Origin & Source']),
      select('polyClass', 'Specific Structural Class', 'Linear Polymer (HDPE)', ['Linear Polymer (HDPE)', 'Branched Polymer (LDPE)', 'Cross-Linked Network (Bakelite)', 'Elastomer (Vulcanized Rubber)'])
    ],
    steps: () => [
      {
        title: 'Macromolecular Taxonomy',
        text: 'Polymers are systematically classified by origin, monomer composition, chain architecture, thermal response, and intermolecular forces.'
      },
      {
        title: 'Linear Chain Architecture (e.g. HDPE)',
        text: 'Unbranched chains pack densely into ordered crystalline lamellae: high density (0.96 g/cm³), high melting point, rigid and stiff.'
      },
      {
        title: 'Branched Chain Architecture (e.g. LDPE)',
        text: 'Short and long branches disrupt crystalline packing, lowering density (0.92 g/cm³) and yielding flexible, ductile packaging films.'
      },
      {
        title: 'Cross-Linked 3D Networks (e.g. Bakelite)',
        text: 'Covalent cross-links connect chains into an infinite 3D giant molecule: rigid, infusible, solvent-insoluble, and thermosetting.'
      },
      {
        title: 'Elastomers (Weak Forces & Coiled Chains)',
        text: 'Amorphous coiled chains with weak Van der Waals forces and occasional sulfur cross-links straighten under tension and snap back elastically.'
      },
      {
        title: 'Synthetic Fibers (Strong Hydrogen Bonding)',
        text: 'Linear oriented chains with polar hydrogen bonding (e.g. Nylon, Kevlar) exhibit high tensile strength along fiber axis.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const isLinear = p.polyClass.includes('Linear');
      const isBranched = p.polyClass.includes('Branched');
      const isCross = p.polyClass.includes('Cross-Linked');

      const density = isLinear ? '0.96 g/cm³ (High)' : isBranched ? '0.92 g/cm³ (Low)' : isCross ? '1.35 g/cm³' : '0.93 g/cm³';
      const crystal = isLinear ? '75% (Highly Crystalline)' : isBranched ? '45% (Amorphous)' : isCross ? '0% (3D Network)' : 'Amorphous Coils';

      return {
        formulas: [{
          name: 'Polymer Structural Constitution',
          formula: 'Structure: ' + p.polyClass + ' | Axis: ' + p.taxType,
          given: `Class = ${p.polyClass}`,
          calc: `Crystallinity = ${crystal}, Density = ${density}`,
          result: `Packing: ${crystal}, Density: ${density}`,
          unit: 'g/cm³'
        }],
        readouts: [
          { label: 'Structural Geometry', value: p.polyClass.split(' ')[0], tone: 'green' },
          { label: 'Bulk Density', value: density, tone: 'blue' },
          { label: 'Crystallinity', value: crystal.split(' ')[0], tone: 'green' },
          { label: 'Thermal Response', value: isCross ? 'Thermoset' : 'Thermoplastic', tone: isCross ? 'amber' : 'green' }
        ],
        state: { isLinear, isBranched, isCross, density },
        explain: {
          what: `Macromolecular structural examination of ${p.polyClass}.`,
          why: `Branching and cross-linking dictate whether chains can slide (thermoplastic), stretch reversibly (elastomer), or remain permanently rigid (thermoset).`
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

      if (state.isLinear) {
        // Parallel straight linear chains packing closely
        for (let row = -0.6; row <= 0.6; row += 0.4) {
          for (let i = -1.2; i <= 1.2; i += 0.3) {
            const pos = [i, row, 0.2];
            scene.add(P(pos).depth, (ctx) => { C3D.drawAtom(ctx, P, pos, 0.07, '#0284c7', '', ''); });
          }
        }
      } else if (state.isBranched) {
        // Main chain with branching arms sticking out
        for (let i = -1.2; i <= 1.2; i += 0.25) {
          const pos = [i, 0, 0.2];
          scene.add(P(pos).depth, (ctx) => { C3D.drawAtom(ctx, P, pos, 0.07, '#0284c7', '', ''); });
          if (Math.abs(i) === 0.5) {
            for (let b = 0.2; b <= 0.6; b += 0.2) {
              const posB = [i, b, 0.2];
              scene.add(P(posB).depth, (ctx) => { C3D.drawAtom(ctx, P, posB, 0.06, '#f59e0b', '', ''); });
            }
          }
        }
      } else {
        // Crosslinked grid network
        for (let x = -0.8; x <= 0.8; x += 0.4) {
          for (let y = -0.8; y <= 0.8; y += 0.4) {
            const pos = [x, y, 0.2];
            scene.add(P(pos).depth, (ctx) => { C3D.drawAtom(ctx, P, pos, 0.07, '#dc2626', '', ''); });
          }
        }
      }

      // Tags
      scene.add(P([0, 0, 0.7]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.7], `${p.polyClass}`, '#0284c7', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: state.isCross ? 'Cross-linked Covalent Network' : state.isBranched ? 'Branched Polymer (LDPE)' : 'Linear Chains (HDPE)', color: state.isCross ? '#dc2626' : '#0284c7' },
        { label: `Density: ${state.density || '0.95 g/cm³'}`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 51 — Thermoplastic vs Thermosetting (chem-thermoplastic-thermoset)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-thermoplastic-thermoset'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('platenTemp', 'Heating Platen Temperature', 25, 350, 25, 180, '°C'),
      select('testCycle', 'Thermal Processing Cycle', 'Heating Cycle', ['Heating Cycle', 'Cooling Cycle', 'Re-heating / Recycling Test'])
    ],
    steps: () => [
      {
        title: 'Thermal Platen Comparative Test',
        text: 'Thermoplastics and thermosets are mounted side-by-side on a heated platen to examine reversible melt flow versus irreversible cross-linked degradation.'
      },
      {
        title: 'Secondary Bond Slippage (Thermoplastic)',
        text: 'As temperature rises above Tg/Tm, weak Van der Waals forces between linear chains dissociate: chains slide freely, yielding a viscous liquid melt.'
      },
      {
        title: 'Covalent Network Rigidity (Thermoset)',
        text: 'Thermoset chains are locked by permanent 3D covalent cross-links that cannot slide; the material retains high modulus and rigidity upon heating.'
      },
      {
        title: 'Cooling & Resolidification',
        text: 'Upon cooling, thermoplastic chains re-freeze into solid shape (reversibly remouldable); thermoset remains unchanged.'
      },
      {
        title: 'High-Temperature Thermal Degradation',
        text: 'Above 300°C, thermosets do not melt—covalent carbon-carbon and C-O bonds rupture pyrolytically, causing permanent charring and burning.'
      },
      {
        title: 'Recyclability & Sustainability',
        text: 'Thermoplastics are mechanically recyclable by re-melting; thermosets cannot be re-melted and require chemical solvolysis or grinding for fillers.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const T = Number(p.platenTemp) || 180;
      const tpState = T < 100 ? 'Solid / Rigid' : T < 220 ? 'Melt Flow (Viscous Liquid)' : 'Degraded Melt';
      const tsState = T < 280 ? 'Solid / Unaltered' : 'Pyrolytic Charring (Decomposing)';

      return {
        formulas: [{
          name: 'Thermal Rheology Contrast',
          formula: 'Thermoplastic: Reversible Softening (Van der Waals) | Thermoset: Infusible Network',
          given: `Platen Temp = ${T} °C`,
          calc: `Thermoplastic State: ${tpState}, Thermoset State: ${tsState}`,
          result: `TP: ${tpState}, TS: ${tsState}`,
          unit: '°C'
        }],
        readouts: [
          { label: 'Thermoplastic Status', value: tpState.split(' ')[0], tone: T > 120 ? 'amber' : 'green' },
          { label: 'Thermoset Status', value: tsState.split(' ')[0], tone: T > 280 ? 'red' : 'green' },
          { label: 'Recyclability', value: 'TP: Yes | TS: No', tone: 'blue' },
          { label: 'Network Crosslinks', value: 'TP: 0% | TS: Dense 3D', tone: 'blue' }
        ],
        state: { tpState, tsState, T },
        explain: {
          what: `Thermal testing of thermoplastic vs thermoset sample bars at ${T}°C.`,
          why: `Thermoplastics soften reversibly by overcoming weak secondary bonds; thermosets have covalent cross-links that cannot melt and only char at high temperature.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const T = Number(p.heatingTemp) || state.T || 180;
      const view = st.view || {};
      const time = st.t || 0;

      const P = C3D.createProjector(g, view, 500, 310, 155);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4.5, 4.5], [-3.5, 3.5], -1.1, '#1e293b', 1.0);

      // ─── 1. Industrial Stainless Steel Heated Platen Test Bench ───
      // Heavy Platen Base with Chamfered Shoulders
      C3D.drawBox(g, P, [0, 0, -0.4], [4.6, 2.8, 0.38], '#334155', { scene, stroke: '#1e293b' });

      // Platen Heated Working Surface Plate (Brushed alloy finish)
      const isHot = T >= 120;
      const platenStroke = T > 200 ? '#ef4444' : isHot ? '#f97316' : '#64748b';
      C3D.drawBox(g, P, [0, 0, -0.15], [4.4, 2.6, 0.12], '#475569', { scene, stroke: platenStroke });

      // Dual Recessed Heating Zones (Left: Thermoplastic, Right: Thermoset)
      const glowCol = T > 220 ? '#ef4444' : T > 140 ? '#f97316' : T > 90 ? '#eab308' : '#334155';
      C3D.drawBox(g, P, [-1.2, 0, -0.08], [1.8, 2.0, 0.04], glowCol, { scene, alpha: 0.85 });
      C3D.drawBox(g, P, [1.2, 0, -0.08], [1.8, 2.0, 0.04], glowCol, { scene, alpha: 0.85 });

      // Radiant Heat Shimmer Lines if T > 120°C
      if (isHot) {
        for (let sh = 0; sh < 6; sh++) {
          const sx = -1.8 + sh * 0.7;
          const shimmerZ = 0.6 + Math.sin(time * 3 + sh) * 0.15;
          scene.add(P([sx, 0, shimmerZ]).depth, (ctx) => {
            const pt = P([sx, 0, shimmerZ]);
            ctx.beginPath();
            ctx.moveTo(pt.x - 6, pt.y);
            if (typeof ctx.quadraticCurveTo === 'function') {
              ctx.quadraticCurveTo(pt.x, pt.y - 8, pt.x + 6, pt.y);
            } else {
              ctx.lineTo(pt.x, pt.y - 8);
              ctx.lineTo(pt.x + 6, pt.y);
            }
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.55)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
        }
      }

      // Digital Temperature Controller Display Box on Front Bezel
      C3D.drawBox(g, P, [0, -1.45, -0.28], [2.2, 0.12, 0.3], '#0f172a', { scene, stroke: '#334155' });
      scene.add(P([0, -1.5, -0.25]).depth, (ctx) => {
        const pt = P([0, -1.5, -0.25]);
        ctx.save();
        ctx.font = '700 11px monospace';
        ctx.fillStyle = isHot ? '#22c55e' : '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`PID STAGE: ${T.toFixed(0)}°C  [HEATING ACTIVE]`, pt.x, pt.y);
        ctx.restore();
      });

      // ─── 2. Left Specimen: Thermoplastic Test Bar ───
      // Behavior: Solid rectangular bar at room temp -> Viscous melt puddle as T > 120°C
      const meltProgress = Math.max(0, Math.min(1, (T - 110) / 100)); // 0 = solid, 1 = liquid melt
      const tpH = 0.48 * (1 - meltProgress * 0.72); // shrinks from 0.48 to 0.13
      const tpW = 1.1 + meltProgress * 0.55;       // widens as it melts
      const tpD = 1.4 + meltProgress * 0.45;       // spreads on hot platen
      const tpZ = -0.06 + tpH / 2;

      // Color: Deep royal blue solid -> Glossy transparent cyan melt with surface sheen
      const tpColor = meltProgress > 0.5 ? '#0284c7' : '#0369a1';
      C3D.drawBox(g, P, [-1.2, 0, tpZ], [tpW, tpD, tpH], tpColor, {
        scene,
        stroke: meltProgress > 0.4 ? 'rgba(56, 189, 248, 0.9)' : '#0284c7',
        alpha: meltProgress > 0.4 ? 0.88 : 1.0
      });

      // Specular liquid gloss highlight on molten thermoplastic
      if (meltProgress > 0.3) {
        scene.add(P([-1.2, 0, tpZ + tpH / 2]).depth - 0.05, (ctx) => {
          const pt = P([-1.2, -0.2, tpZ + tpH / 2]);
          ctx.beginPath();
          C3D.safeEllipse(ctx, pt.x, pt.y, 24 * (1 + meltProgress), 10 * (1 + meltProgress), -0.2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fill();
        });
      }

      // ─── 3. Right Specimen: Thermosetting Polymer Test Coupon ───
      // Behavior: Rigid infusible block. Zero melting. Retains sharp 3D geometry!
      // If T > 250°C, exhibits slight surface carbonization/charring without deformation.
      const tsChar = T > 260;
      const tsColor = tsChar ? '#451a03' : '#b45309';
      const tsH = 0.48;
      const tsW = 1.1;
      const tsD = 1.4;
      const tsZ = -0.06 + tsH / 2;

      C3D.drawBox(g, P, [1.2, 0, tsZ], [tsW, tsD, tsH], tsColor, {
        scene,
        stroke: tsChar ? '#1c1917' : '#78350f'
      });

      // ─── 4. Molecular Schematic Mini-Cards in Scene ───
      // Left: Linear chain slippage
      scene.add(P([-1.2, 0, tpZ + tpH / 2 + 0.35]).depth, (ctx) => {
        const pt = P([-1.2, 0, tpZ + tpH / 2 + 0.25]);
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        // Wavy sliding chains
        for (let w = -1; w <= 1; w++) {
          ctx.beginPath();
          ctx.moveTo(pt.x - 22, pt.y + w * 6);
          ctx.bezierCurveTo(pt.x - 8, pt.y + w * 6 - 4, pt.x + 8, pt.y + w * 6 + 4, pt.x + 22, pt.y + w * 6);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Right: 3D permanent covalent network mesh
      scene.add(P([1.2, 0, tsZ + tsH / 2 + 0.35]).depth, (ctx) => {
        const pt = P([1.2, 0, tsZ + tsH / 2 + 0.25]);
        ctx.save();
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.5;
        // Crosslinked grid lines
        [-10, 0, 10].forEach(ox => {
          ctx.beginPath();
          ctx.moveTo(pt.x + ox, pt.y - 12);
          ctx.lineTo(pt.x + ox, pt.y + 12);
          ctx.stroke();
        });
        [-8, 0, 8].forEach(oy => {
          ctx.beginPath();
          ctx.moveTo(pt.x - 14, pt.y + oy);
          ctx.lineTo(pt.x + 14, pt.y + oy);
          ctx.stroke();
        });
        ctx.restore();
      });

      // ─── 5. Professional CAD Outside Callouts (Adaptive, Zero Geometry Overlap!) ───
      scene.add(P([-1.2, 0, tpZ + 0.35]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-1.2, 0, tpZ + 0.35], 'Thermoplastic: Reversible Melt Flow', {
          dx: -90,
          dy: -65,
          color: '#0284c7',
          sub: meltProgress > 0.3 ? 'Weak Van der Waals bonds slip • Melt flow' : 'Solid linear/branched chains • Remouldable'
        });
      });

      scene.add(P([1.2, 0, tsZ + 0.35]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [1.2, 0, tsZ + 0.35], 'Thermoset: Infusible Rigid Network', {
          dx: 90,
          dy: -65,
          color: '#b45309',
          sub: tsChar ? 'High heat charring • Zero melt flow' : 'Permanent 3D covalent cross-links • Infusible'
        });
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Thermoplastic (Reversible Melt Flow)', color: '#0284c7' },
        { label: 'Thermoset (Infusible Rigid Network)', color: '#b45309' },
        { label: `Heating Platen (${T.toFixed(0)}°C)`, color: platenStroke },
        { label: 'Recyclability: TP (100%) | TS (0%)', color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 52 — Glass Transition Temperature (chem-glass-transition)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-glass-transition'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('temp', 'Polymer Temperature', -20, 180, 5, 80, '°C'),
      select('polymerType', 'Polymer Material Specimen', 'Polystyrene (Tg = 100°C)', ['Natural Rubber (Tg = -70°C)', 'Polyethylene (Tg = -120°C)', 'Polyvinyl Chloride (Tg = 85°C)', 'Polystyrene (Tg = 100°C)', 'PMMA Plexiglas (Tg = 105°C)'])
    ],
    steps: () => [
      {
        title: 'The Glass Transition Phenomenon (Tg)',
        text: 'Tg represents the reversible transition temperature in amorphous regions between a hard, brittle glassy state and a rubbery, flexible state.'
      },
      {
        title: 'Molecular Mobility Below Tg (Glassy State)',
        text: 'Below Tg, thermal energy is insufficient to rotate chain backbone bonds; only short-range bond vibrations occur; free volume is frozen.'
      },
      {
        title: 'Onset of Cooperative Segmental Motion',
        text: 'At Tg, thermal energy overcomes steric barriers; long-range coordinated movement of 20–50 carbon chain segments commences.'
      },
      {
        title: 'Dramatic Physical Property Changes',
        text: 'Crossing Tg causes a 1000-fold drop in elastic modulus (1 GPa to 1 MPa), sharp increase in thermal expansion coefficient, and rise in heat capacity (ΔCp).'
      },
      {
        title: 'Structural Factors Governing Tg',
        text: 'Bulky aromatic rings (polystyrene, PMMA) hinder chain rotation and elevate Tg; flexible backbones and plasticizers depress Tg.'
      },
      {
        title: 'Engineering Application Selection',
        text: 'Tires require low Tg (< -50°C) to remain flexible in winter; safety helmets and eyeglasses require high Tg (> 100°C) to maintain dimensional rigidity.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const T = Number(p.temp) || 80;
      const tg = p.polymerType.includes('Polystyrene') ? 100 :
                 p.polymerType.includes('Plexiglas') ? 105 :
                 p.polymerType.includes('Chloride') ? 85 : -70;

      const isGlassy = T < tg;
      const stateName = isGlassy ? 'Glassy State (Hard & Brittle)' : 'Rubbery State (Flexible & Ductile)';
      const modulusGpa = isGlassy ? 3.2 : 0.005;

      return {
        formulas: [{
          name: 'Free Volume & Segmental Dynamics',
          formula: 'WLF Equation: log(a_T) = -C₁(T - T_g) / (C₂ + T - T_g) | T_g Threshold',
          given: `Polymer = ${p.polymerType}, T = ${T}°C, T_g = ${tg}°C`,
          calc: `T - T_g = ${T - tg} °C → ${stateName}`,
          result: `State: ${stateName}, Modulus = ${modulusGpa} GPa`,
          unit: 'GPa'
        }],
        readouts: [
          { label: 'Physical State', value: isGlassy ? 'Brittle Glass' : 'Rubbery / Flexible', tone: isGlassy ? 'blue' : 'green' },
          { label: 'Elastic Modulus', value: `${modulusGpa} GPa`, tone: isGlassy ? 'blue' : 'amber' },
          { label: 'Glass Transition (Tg)', value: `${tg}°C`, tone: 'green' },
          { label: 'Segmental Mobility', value: isGlassy ? 'Frozen' : 'Active Wriggling', tone: isGlassy ? 'blue' : 'green' }
        ],
        state: { isGlassy, tg, modulusGpa },
        explain: {
          what: `Evaluation of ${p.polymerType} at ${T}°C relative to Tg (${tg}°C).`,
          why: `Thermal energy below Tg is insufficient for backbone bond rotation; crossing Tg activates cooperative segmental motion.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isGlass = state.isGlassy;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Polymer Chain Visualization: Static if glassy, animated wriggling if rubbery
      const wriggle = isGlass ? 0 : Math.sin(time * 3) * 0.15;
      for (let i = 0; i < 18; i++) {
        const x = -1.4 + i * 0.16;
        const y = Math.sin(i * 0.8) * 0.25 + wriggle * Math.cos(i);
        const z = 0.2 + Math.cos(i * 0.6) * 0.2 + wriggle * Math.sin(i);
        const pos = [x, y, z];
        scene.add(P(pos).depth, (ctx) => {
          C3D.drawAtom(ctx, P, pos, 0.08, isGlass ? '#0284c7' : '#10b981', '', '');
        });
      }

      // Modulus Gauge
      C3D.drawVoltmeter(g, P, [0, 0, 1.8], 1.0, state.modulusGpa || 3.0, 5.0, {
        scene,
        label: 'MODULUS (GPA)',
        decimals: 2
      });

      // Tags
      scene.add(P([0, 0, 0.6]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.6], isGlass ? 'Glassy (Frozen Chains)' : 'Rubbery (Segmental Motion)', isGlass ? '#0284c7' : '#16a34a', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: isGlass ? 'Frozen Glassy Backbone' : 'Flexible Wriggling Chains', color: isGlass ? '#0284c7' : '#10b981' },
        { label: `Tg Threshold: ${state.tg || 100}°C`, color: '#eab308' },
        { label: `Operating Temp: ${p.temp || 80}°C`, color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 53 — ABS Polymer Simulator (chem-abs)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-abs'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('acrylonitrile', 'Acrylonitrile Content (A)', 15, 35, 1, 20, '% wt'),
      r('butadiene', 'Polybutadiene Rubber (B)', 5, 30, 1, 20, '% wt'),
      r('styrene', 'Styrene Content (S)', 40, 70, 1, 60, '% wt')
    ],
    steps: () => [
      {
        title: 'Engineering Terpolymer Morphology',
        text: 'Acrylonitrile-Butadiene-Styrene (ABS) is a two-phase terpolymer combining chemical resistance, impact toughness, and processability.'
      },
      {
        title: 'Role of Acrylonitrile (15–35%)',
        text: 'Polar cyano groups (-C≡N) provide dipole attraction, yielding chemical resistance, heat stability, and surface hardness.'
      },
      {
        title: 'Role of Polybutadiene Rubber (5–30%)',
        text: 'Dispersed elastomeric rubber spherical particles (0.1–1.0 µm) absorb impact energy, initiating multiple micro-crazes that prevent catastrophic brittle failure.'
      },
      {
        title: 'Role of Styrene (40–60%)',
        text: 'Styrene provides rigid glassy matrix (SAN), high dimensional stability, specular surface gloss, and easy melt flow in injection moulds.'
      },
      {
        title: 'Graft Copolymer Interfacial Adhesion',
        text: 'SAN chains are chemically grafted onto rubber particle surfaces, ensuring strong interfacial bonding and preventing phase separation.'
      },
      {
        title: 'Automotive & Consumer Applications',
        text: 'Widely used in automotive grilles/dashboards, LEGO building bricks, computer housings, and 3D printing filaments.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (Number(p.acrylonitrile) + Number(p.butadiene) + Number(p.styrene) !== 100) {
        w.push('Terpolymer fractions (A + B + S) must total exactly 100%.');
      }
      return w;
    },
    compute: (p) => {
      const A = Number(p.acrylonitrile) || 20;
      const B = Number(p.butadiene) || 20;
      const S = Number(p.styrene) || 60;

      const izodImpact = (B * 18).toFixed(0); // J/m
      const tensileMpa = (A * 1.2 + S * 0.45).toFixed(1);

      return {
        formulas: [{
          name: 'ABS Terpolymer Property Balance',
          formula: 'Izod Impact ∝ %Butadiene Rubber | Tensile/Rigidity ∝ %Acrylonitrile + %Styrene',
          given: `A = ${A}%, B = ${B}%, S = ${S}%`,
          calc: `Impact = ${izodImpact} J/m, Tensile Strength = ${tensileMpa} MPa`,
          result: `Izod Impact = ${izodImpact} J/m, Tensile = ${tensileMpa} MPa`,
          unit: 'J/m'
        }],
        readouts: [
          { label: 'Izod Impact Strength', value: `${izodImpact} J/m`, tone: 'green' },
          { label: 'Tensile Strength', value: `${tensileMpa} MPa`, tone: 'blue' },
          { label: 'Chemical Resistance', value: A > 22 ? 'Superior' : 'Standard', tone: 'green' },
          { label: 'Surface Gloss', value: S > 50 ? 'High Gloss' : 'Satin', tone: 'blue' }
        ],
        state: { izodImpact, tensileMpa },
        explain: {
          what: `ABS engineering blend containing ${A}% A, ${B}% B, ${S}% S.`,
          why: `Rubber polybutadiene nodules arrest crack propagation via micro-crazing, while SAN copolymer matrix provides rigidity and chemical resistance.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const view = st.view || {};
      const time = st.t || 0;

      const A = Number(p.acrylonitrile) || 20;
      const B = Number(p.butadiene) || 20;
      const S = Number(p.styrene) || 60;

      const P = C3D.createProjector(g, view, 500, 310, 150);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4.5, 4.5], [-3.5, 3.5], -1.1, '#1e293b', 1.0);

      // ─── 1. ASTM D256 Izod Test Vise & Fixture Base ───
      // Heavy Steel Machine Base
      C3D.drawBox(g, P, [0, 0, -0.75], [4.4, 2.6, 0.45], '#334155', { scene, stroke: '#1e293b' });
      // Hardened Clamping Vise Jaws (Holding bottom half of ABS bar)
      C3D.drawBox(g, P, [-0.1, -0.65, -0.3], [2.2, 0.45, 0.55], '#475569', { scene, stroke: '#64748b' });
      C3D.drawBox(g, P, [-0.1, 0.65, -0.3], [2.2, 0.45, 0.55], '#475569', { scene, stroke: '#64748b' });
      // Vise clamp tightening screw
      C3D.drawPipe(g, P, [-0.1, 0.85, -0.3], [-0.1, 1.35, -0.3], 0.07, '#94a3b8', { scene });

      // ─── 2. Molded Engineering ABS Test Bar ───
      // High-Gloss Translucent Ivory/Amber SAN Matrix Outer Specimen
      const barCenter = [-0.1, 0, 0.35];
      const barSize = [2.0, 1.5, 1.35];
      C3D.drawBox(g, P, barCenter, barSize, '#f8fafc', {
        scene,
        alpha: 0.35,
        stroke: 'rgba(255, 255, 255, 0.9)'
      });

      // Front & Left Face Specular Highlights (Styrene High Gloss)
      scene.add(P([-0.1, -0.76, 0.45]).depth - 0.05, (ctx) => {
        const pt = P([-0.1, -0.76, 0.45]);
        ctx.save();
        ctx.beginPath();
        C3D.safeEllipse(ctx, pt.x, pt.y, 45, 12, -0.15);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + (S / 100) * 0.45})`;
        ctx.fill();
        ctx.restore();
      });

      // ─── 3. Microstructure Window: Dispersed Polybutadiene Rubber Nodules ───
      // 3D spherical elastomeric rubber particles whose size and density scale with B%
      const noduleRadius = 0.08 + (B / 30) * 0.06;
      const numRows = Math.round(3 + (B / 30) * 2);

      const fixedNodules = [
        [-0.7, -0.4, 0.05], [-0.3, -0.2, 0.15], [0.2, -0.35, 0.1], [0.6, -0.15, 0.2],
        [-0.6, 0.1, 0.35],  [-0.1, 0.25, 0.4],   [0.4, 0.1, 0.3],   [-0.8, -0.1, 0.6],
        [-0.4, 0.0, 0.7],   [0.1, -0.2, 0.65],  [0.5, 0.3, 0.55],  [-0.5, 0.3, 0.1],
        [0.0, -0.4, 0.3],   [0.3, -0.1, 0.5],   [-0.2, -0.3, 0.55], [0.5, -0.3, 0.4]
      ];

      fixedNodules.forEach((pos, idx) => {
        scene.add(P(pos).depth, (ctx) => {
          // Elastomeric core
          C3D.drawSphere(ctx, P, pos, noduleRadius, '#0f172a');
          // Graft copolymer interface ring
          const pt = P(pos);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, noduleRadius * pt.k * 1.35, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Micro-crazes radiating under impact stress
          if (idx < 6) {
            ctx.beginPath();
            ctx.moveTo(pt.x + noduleRadius * pt.k, pt.y);
            ctx.lineTo(pt.x + noduleRadius * pt.k + 8, pt.y - 4);
            ctx.moveTo(pt.x - noduleRadius * pt.k, pt.y);
            ctx.lineTo(pt.x - noduleRadius * pt.k - 8, pt.y + 4);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // ─── 4. Izod Impact Pendulum Striker & Hammer Tup ───
      // Pendulum Arm
      C3D.drawPipe(g, P, [-1.8, 0, 1.4], [-1.05, 0, 0.55], 0.06, '#64748b', { scene });
      // Hardened Striker Tup Wedge
      C3D.drawBox(g, P, [-0.98, 0, 0.52], [0.22, 0.35, 0.28], '#ea580c', { scene, stroke: '#c2410c' });
      // Impact stress contact flash
      scene.add(P([-0.88, 0, 0.52]).depth - 0.1, (ctx) => {
        const pt = P([-0.88, 0, 0.52]);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
        ctx.fill();
      });

      // ─── 5. Professional CAD Outside Callouts (No Overlap!) ───
      scene.add(P([-1.05, 0, 0.55]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-1.05, 0, 0.55], 'Izod Impact Pendulum Striker', {
          dx: -85,
          dy: -55,
          color: '#ea580c',
          sub: `Dynamic Impact Rating: ${state.izodImpact || 360} J/m`
        });
      });

      scene.add(P([-0.1, -0.75, 0.65]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-0.1, -0.75, 0.65], 'Continuous SAN Glassy Matrix', {
          dx: -75,
          dy: 45,
          color: '#0284c7',
          sub: `Styrene (${S}% gloss) + Acrylonitrile (${A}% stiffness)`
        });
      });

      scene.add(P([0.6, -0.15, 0.2]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0.6, -0.15, 0.2], 'Polybutadiene Rubber Nodules', {
          dx: 85,
          dy: -45,
          color: '#0f172a',
          sub: `Dispersed Elastomeric Modifiers (${B}% wt)`
        });
      });

      scene.add(P([0.2, -0.35, 0.1]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0.2, -0.35, 0.1], 'Micro-Craze Energy Dissipation', {
          dx: 85,
          dy: 45,
          color: '#10b981',
          sub: 'Arrests crack tip • Prevents catastrophic brittle failure'
        });
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `SAN Glassy Matrix (${A}% A + ${S}% S)`, color: '#0284c7' },
        { label: `Polybutadiene Rubber Nodules (${B}% wt)`, color: '#0f172a' },
        { label: `Izod Impact Toughness: ${state.izodImpact || 360} J/m`, color: '#10b981' },
        { label: `Tensile Strength: ${state.tensileMpa || 51} MPa`, color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 54 — Polyvinyl Chloride Simulator (chem-pvc)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-pvc'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('pvcType', 'PVC Formulation', 'Rigid unplasticized PVC (uPVC)', ['Rigid unplasticized PVC (uPVC)', 'Plasticized Flexible PVC (30 phr DOP)', 'Highly Flexible PVC (50 phr DOP)']),
      r('temp', 'Operating Temperature', -10, 90, 5, 25, '°C')
    ],
    steps: () => [
      {
        title: 'Vinyl Chloride Addition Polymerization',
        text: 'PVC [-CH₂-CHCl-]ₙ is produced by free-radical suspension polymerization of vinyl chloride monomer, yielding alternating chlorine atoms.'
      },
      {
        title: 'Strong Polar Dipole-Dipole Interactions',
        text: 'Electronegative chlorine atoms create strong polar C-Cl dipoles, locking chains together: rigid uPVC has high tensile strength (55 MPa) and Tg = 85°C.'
      },
      {
        title: 'Intrinsic Flame Retardancy',
        text: 'Containing 56.8% chlorine by weight, PVC has a high Limiting Oxygen Index (LOI ≈ 45%), self-extinguishing when removed from external flame.'
      },
      {
        title: 'Plasticization Mechanism (DOP / DEHP)',
        text: 'Adding phthalate plasticizers inserts small molecules between PVC chains, shielding polar dipole forces and lubricating chain slippage.'
      },
      {
        title: 'Drastic Tg Depression',
        text: '30–50 phr plasticizer drops Tg from 85°C down to -15°C, converting rigid pipe material into supple electrical cable insulation and medical tubing.'
      },
      {
        title: 'Thermal Degradation & Dehydrochlorination',
        text: 'Above 140°C without organotin/lead stabilizers, PVC unzips to evolve corrosive HCl gas and form conjugated colored polyene sequences.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const isRigid = p.pvcType.includes('Rigid');
      const phr = isRigid ? 0 : p.pvcType.includes('30') ? 30 : 50;
      const tg = isRigid ? 85 : isRigid ? 85 : 85 - phr * 2.1;
      const modulus = isRigid ? '3000 MPa (Rigid)' : phr === 30 ? '15 MPa (Flexible)' : '5 MPa (Very Soft)';

      return {
        formulas: [{
          name: 'PVC Dipole Shielding by Plasticizer',
          formula: 'T_g(blend) ≈ T_g(PVC) - k × [Plasticizer phr] | LOI = 45% (Flame Retardant)',
          given: `Formulation = ${p.pvcType}, Plasticizer = ${phr} phr`,
          calc: `T_g = 85 - (${phr} × 2.1) = ${tg.toFixed(0)} °C`,
          result: `T_g = ${tg.toFixed(0)} °C, Modulus = ${modulus}`,
          unit: '°C'
        }],
        readouts: [
          { label: 'Glass Transition (Tg)', value: `${tg.toFixed(0)}°C`, tone: isRigid ? 'blue' : 'green' },
          { label: 'Tensile Modulus', value: modulus.split(' ')[0], tone: isRigid ? 'blue' : 'green' },
          { label: 'Chlorine Content', value: '56.8% (Self-Extinguishing)', tone: 'green' },
          { label: 'Mechanical Feel', value: isRigid ? 'Rigid Pipe' : 'Supple & Flexible', tone: 'blue' }
        ],
        state: { tg, phr, isRigid },
        explain: {
          what: `Evaluation of ${p.pvcType} with ${phr} phr plasticizer.`,
          why: `Bulky chlorine atoms impart rigidity and flame retardancy; plasticizer molecules neutralize C-Cl dipoles to lower Tg below ambient temperature.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isRigid = state.isRigid;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Carbon chain backbone with green Chlorine atoms
      for (let i = -1.4; i <= 1.4; i += 0.28) {
        const posC = [i, 0, 0.2];
        scene.add(P(posC).depth, (ctx) => { C3D.drawAtom(ctx, P, posC, 0.08, '#0284c7', 'C', ''); });

        // Alternate Chlorine atom (Green)
        if (Math.round(i * 10) % 2 === 0) {
          const posCl = [i, 0.25, 0.35];
          scene.add(P(posCl).depth, (ctx) => { C3D.drawAtom(ctx, P, posCl, 0.09, '#10b981', 'Cl', ''); });
        }
      }

      // Plasticizer molecules inserted if flexible
      if (!isRigid) {
        for (let i = -1.0; i <= 1.0; i += 0.5) {
          const posPlast = [i, -0.3, 0.2];
          scene.add(P(posPlast).depth, (ctx) => { C3D.drawAtom(ctx, P, posPlast, 0.08, '#f59e0b', 'DOP', ''); });
        }
      }

      // Tags
      scene.add(P([0, 0, 0.6]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.6], isRigid ? 'Rigid uPVC (Locked C-Cl Dipoles)' : 'Plasticized Flexible PVC', isRigid ? '#0284c7' : '#f59e0b', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Carbon Backbone (CH₂-CH)', color: '#0284c7' },
        { label: 'Chlorine Dipole (Cl)', color: '#10b981', symbol: true },
        { label: isRigid ? 'No Plasticizer (Tg = 85°C)' : 'DOP Plasticizer Shielding Dipoles', color: '#f59e0b', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 55 — PTFE Teflon Simulator (chem-ptfe)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-ptfe'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('temp', 'Service Temperature', -100, 300, 25, 25, '°C'),
      select('propertyView', 'Physical Demonstration', 'Helical Molecular Sheath', ['Helical Molecular Sheath', 'Superhydrophobic Water Droplet', 'Low Friction Sliding Interface'])
    ],
    steps: () => [
      {
        title: 'Polytetrafluoroethylene [-CF₂-CF₂-]ₙ Architecture',
        text: 'PTFE (Teflon) possesses an extraordinary molecular geometry: a linear carbon backbone fully surrounded by a dense cylindrical sheath of fluorine atoms.'
      },
      {
        title: 'Helical Fluorine Uniform Shielding',
        text: 'Due to mutual electrostatic repulsion of bulky fluorine atoms, the chain twists into a tight 13/6 helix, leaving zero vulnerable carbon sites exposed.'
      },
      {
        title: 'Extreme C-F Bond Energy (485 kJ/mol)',
        text: 'The Carbon-Fluorine bond is among the strongest single bonds in chemistry, resisting boiling concentrated acids, strong oxidizers, and solvents.'
      },
      {
        title: 'Lowest Coefficient of Friction (µ ≈ 0.04)',
        text: 'Smooth, non-polar, unreactive fluorine electron shells exhibit minimal intermolecular attraction, allowing surfaces to slide with ice-like friction.'
      },
      {
        title: 'Thermal Resistance (Continuous 260°C)',
        text: 'PTFE melts only at 327°C with massive melt viscosity (~10¹¹ Pa·s), requiring powder metallurgy compression and sintering rather than injection moulding.'
      },
      {
        title: 'Superhydrophobic Water Contact Angle',
        text: 'Extremely low critical surface tension (18 mN/m) causes water to bead up with high contact angles (>110°), creating self-cleaning non-stick surfaces.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const T = Number(p.temp) || 25;
      const fricCoeff = 0.04;
      const contactAngle = 115; // degrees

      return {
        formulas: [{
          name: 'Fluoropolymer Energetics & Contact Angle',
          formula: 'C-F Bond Energy = 485 kJ/mol | Young: γ_sv = γ_sl + γ_lv·cos(θ)',
          given: `Temp = ${T}°C, Contact Angle θ = ${contactAngle}°`,
          calc: `Friction Coefficient µ = ${fricCoeff}, Melting Temp T_m = 327°C`,
          result: `µ = ${fricCoeff}, Contact Angle = ${contactAngle}°, Continuous Max = 260°C`,
          unit: '°'
        }],
        readouts: [
          { label: 'Friction Coefficient (µ)', value: `${fricCoeff} (Near Zero)`, tone: 'green' },
          { label: 'Water Contact Angle', value: `${contactAngle}° (Non-Stick)`, tone: 'blue' },
          { label: 'C-F Bond Strength', value: '485 kJ/mol (Ultra-Stable)', tone: 'green' },
          { label: 'Chemical Inertness', value: '100% Resistant to Aqua Regia', tone: 'green' }
        ],
        state: { fricCoeff, contactAngle },
        explain: {
          what: `PTFE helical fluorocarbon chain properties at ${T}°C.`,
          why: `Dense helical fluorine envelope completely shields the carbon-carbon backbone against chemical attack and intermolecular friction.`
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

      // Helical Fluorocarbon Chain (Carbon core surrounded by dense fluorine atoms)
      for (let i = -1.4; i <= 1.4; i += 0.22) {
        const ang = (i * 4.5);
        const posC = [i, 0, 0.2];
        scene.add(P(posC).depth, (ctx) => { C3D.drawAtom(ctx, P, posC, 0.07, '#334155', 'C', ''); });

        // Surrounding Fluorine atoms in helix
        const posF1 = [i, Math.cos(ang) * 0.25, 0.2 + Math.sin(ang) * 0.25];
        const posF2 = [i, -Math.cos(ang) * 0.25, 0.2 - Math.sin(ang) * 0.25];
        scene.add(P(posF1).depth, (ctx) => { C3D.drawAtom(ctx, P, posF1, 0.09, '#f8fafc', 'F', ''); });
        scene.add(P(posF2).depth, (ctx) => { C3D.drawAtom(ctx, P, posF2, 0.09, '#f8fafc', 'F', ''); });
      }

      // Water droplet beading on PTFE surface on right
      C3D.drawPlate ? C3D.drawPlate(g, P, [1.2, 0, 0.8], [0.8, 0.8, 0.1], '#cbd5e1', { scene }) : null;
      C3D.drawCylinder(g, P, [1.2, 0, 0.8], 0.35, 0.45, 'rgba(56, 189, 248, 0.55)', { scene, topCap: true });

      // Tags
      scene.add(P([0, 0, 0.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 0.6], 'Dense Helical Fluorine Sheath', '#10b981', -22); });
      scene.add(P([1.2, 0, 1.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.2, 0, 1.4], 'Beaded Water (θ = 115°)', '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Carbon Backbone Core', color: '#334155' },
        { label: 'Dense Fluorine Atoms (C-F 485 kJ/mol)', color: '#f8fafc', symbol: true },
        { label: 'Non-Stick Water Droplet (θ = 115°)', color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 56 — Bakelite Resin Simulator (chem-bakelite)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-bakelite'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('catalystType', 'Catalytic Reaction Pathway', 'Acid Catalyst (Novolac Intermediate)', ['Acid Catalyst (Novolac Intermediate)', 'Base Catalyst (Resol Intermediate)', 'Fully Cured 3D Bakelite Network']),
      r('formRatio', 'Formaldehyde-to-Phenol Molar Ratio', 0.6, 1.8, 0.1, 0.8, '')
    ],
    steps: () => [
      {
        title: 'Historical Synthetic Plastic (Baekeland 1907)',
        text: 'Bakelite is a thermosetting phenol-formaldehyde resin produced by step-growth condensation polymerization.'
      },
      {
        title: 'Novolac Synthesis (Acid Catalyst, F:P < 1)',
        text: 'With oxalic acid catalyst and deficiency of formaldehyde (F:P ≈ 0.8), phenol reacts at ortho/para sites to form linear Novolac prepolymers linked by methylene bridges.'
      },
      {
        title: 'Resol Synthesis (Base Catalyst, F:P > 1)',
        text: 'With aqueous NaOH and excess formaldehyde, reactive methylol phenols (-CH₂OH) form, yielding self-curing Resol resites.'
      },
      {
        title: 'Cross-Linking with Hexamine (Hexa)',
        text: 'Novolac is compounded with wood flour filler and hexamethylenetetramine; heat and pressure activate hexa to form dense 3D methylene (-CH₂-) cross-links.'
      },
      {
        title: 'Insoluble, Infusible Cured Network',
        text: 'The fully cured cross-linked network does not melt or dissolve; it provides exceptional dimensional stability, hardness, and thermal resistance.'
      },
      {
        title: 'Electrical & Industrial Applications',
        text: 'Outstanding dielectric strength makes Bakelite ideal for high-voltage insulators, antique telephone housings, and saucepan handles.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const isNovolac = p.catalystType.includes('Novolac');
      const isResol = p.catalystType.includes('Resol');

      const product = isNovolac ? 'Linear Novolac (Thermoplastic Prepolymer)' :
                      isResol ? 'Resol Prepolymer (Methylol Active)' : 'Dense 3D Bakelite Network (Thermoset)';
      const crosslinkDensity = isNovolac ? '0% (Requires Hexa)' : isResol ? '45%' : '98% (Complete 3D Mesh)';

      return {
        formulas: [{
          name: 'Phenol-Formaldehyde Condensation Steps',
          formula: 'Phenol + HCHO → o/p-Methylolphenols → Methylene Crosslinked Network + H₂O',
          given: `Catalyst = ${p.catalystType}, F:P Ratio = ${p.formRatio}`,
          calc: `Product = ${product}, Crosslink = ${crosslinkDensity}`,
          result: `State: ${product}, Dielectric Strength: 15 kV/mm`,
          unit: 'kV/mm'
        }],
        readouts: [
          { label: 'Intermediate / Product', value: product.split(' ')[0], tone: 'green' },
          { label: 'Crosslink Density', value: crosslinkDensity, tone: 'blue' },
          { label: 'Thermal Response', value: isNovolac ? 'Thermoplastic Precursor' : 'Thermoset Cured', tone: 'amber' },
          { label: 'Dielectric Strength', value: '15 kV/mm (Insulator)', tone: 'green' }
        ],
        state: { product, crosslinkDensity },
        explain: {
          what: `Synthesis of phenol-formaldehyde resin via ${p.catalystType}.`,
          why: `Acid catalysts yield linear Novolac needing hexamine curing; heat and pressure cross-link the structure into an infusible 3D phenolic network.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isCured = p.catalystType.includes('Fully Cured');
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Phenolic Rings connected by methylene bridges
      for (let x = -1.0; x <= 1.0; x += 0.5) {
        for (let y = -0.5; y <= 0.5; y += 0.5) {
          const posRing = [x, y, 0.2];
          scene.add(P(posRing).depth, (ctx) => {
            // Hexagonal phenolic ring representation
            C3D.drawAtom(ctx, P, posRing, 0.1, '#78350f', 'Ph', '');
          });

          // Methylene bridges connecting rings
          if (isCured && x < 1.0) {
            const posBridge = [x + 0.25, y, 0.2];
            scene.add(P(posBridge).depth, (ctx) => {
              C3D.drawAtom(ctx, P, posBridge, 0.05, '#d97706', 'CH₂', '');
            });
          }
        }
      }

      // Molded Electrical Switchgear Part on Right
      C3D.drawBox(g, P, [1.5, 0, 0.2], [0.8, 0.8, 0.6], '#451a03', { scene });

      // Tags
      scene.add(P([0, 0, 0.6]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.6], isCured ? 'Dense 3D Bakelite Network' : 'Phenol-Formaldehyde Prepolymer', '#78350f', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Phenolic Ring Units (Ph)', color: '#78350f', symbol: true },
        { label: 'Methylene Bridges (-CH₂-)', color: '#d97706', symbol: true },
        { label: 'Cured Moulded Bakelite Part', color: '#451a03' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 57 — Injection Moulding Machine (chem-injection-moulding)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-injection-moulding'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('barrelTemp', 'Melt Barrel Temperature', 180, 280, 10, 220, '°C'),
      r('injectPressure', 'Injection Pressure', 500, 1800, 100, 1200, 'bar'),
      r('coolingTime', 'Mould Cooling Duration', 5, 30, 2, 12, 's'),
      select('polymerFeed', 'Plastic Pellets Material', 'Polypropylene (PP)', ['Polypropylene (PP)', 'High-Density Polyethylene (HDPE)', 'Nylon 6,6 (Polyamide)', 'Polycarbonate (PC)'])
    ],
    steps: () => [
      {
        title: 'Hopper Pellets Feeding & Plasticizing',
        text: 'Thermoplastic pellets gravity-feed from the hopper into the heated barrel (180–280°C) containing a reciprocating rotating screw.'
      },
      {
        title: 'Melt Conveying & Homogenization',
        text: 'Screw rotation conveys, compresses, and shears the polymer; heater bands complete plasticization into a homogeneous melt reservoir ahead of the screw tip.'
      },
      {
        title: 'Hydraulic Clamping Unit Lockup',
        text: 'High-tonnage hydraulic toggle mechanism clamps the split steel mould halves tightly shut against massive injection pressure forces.'
      },
      {
        title: 'High-Pressure Injection Stroke',
        text: 'The screw halts rotation and acts as a ram, injecting the shot of molten plastic at 1000–1500 bar through sprue, runners, and gate into the cavity.'
      },
      {
        title: 'Packing Pressure & In-Mould Cooling',
        text: 'Packing pressure compensates for volumetric thermal shrinkage while chilled water cooling channels solidify the part.'
      },
      {
        title: 'Mould Open & Ejector Pin Release',
        text: 'The moving platen retracts, split mould opens, and ejector pins push the finished plastic component into the collection bin.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const T = Number(p.barrelTemp) || 220;
      const P_inj = Number(p.injectPressure) || 1200;
      const tCool = Number(p.coolingTime) || 12;

      const cycleTimeSec = 3.5 + 2.0 + tCool + 2.5; // clamp + inject + cool + eject
      const partsPerHour = Math.round(3600 / cycleTimeSec);

      return {
        formulas: [{
          name: 'Injection Moulding Cycle & Clamping Force',
          formula: 'Cycle Time = t_clamp + t_inject + t_cool + t_eject | Clamping Force F = P_cavity × Projected_Area',
          given: `T_barrel = ${T}°C, P_inj = ${P_inj} bar, t_cool = ${tCool} s`,
          calc: `Total Cycle = 3.5 + 2.0 + ${tCool} + 2.5 = ${cycleTimeSec} s`,
          result: `Total Cycle Time = ${cycleTimeSec} s, Productivity = ${partsPerHour} parts/hr`,
          unit: 's'
        }],
        readouts: [
          { label: 'Total Cycle Time', value: `${cycleTimeSec} s`, tone: 'green' },
          { label: 'Productivity Rate', value: `${partsPerHour} parts/hr`, tone: 'green' },
          { label: 'Injection Pressure', value: `${P_inj} bar`, tone: 'blue' },
          { label: 'Screw State', value: 'Reciprocating Ram', tone: 'blue' }
        ],
        state: { cycleTimeSec, partsPerHour },
        explain: {
          what: `Industrial injection moulding of ${p.polymerFeed} at ${T}°C barrel temperature.`,
          why: `Reciprocating screw creates viscous shear melting; high pressure forces melt into split mould cavities with rapid water cooling.`
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
      const P_inj = Number(p.injectPressure) || 1200;
      const T = Number(p.barrelTemp) || 220;

      const P = C3D.createProjector(g, view, 500, 310, 145);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4.5, 4.5], [-3.5, 3.5], -1.1, '#1e293b', 1.0);

      // ─── 1. Industrial Machine Bed & Guide Rails ───
      // ─── 1. Heavy Industrial Welded Steel Machine Bed & Sloped Parts Chute ───
      // Heavy Steel Machine Bed Frame with Leveling Base Pads
      C3D.drawBox(g, P, [0, 0, -0.72], [5.5, 2.2, 0.46], '#0f172a', { scene, stroke: '#020617' });
      // Lower Foundation Support Rails
      C3D.drawBox(g, P, [-1.8, 0, -0.98], [1.4, 2.0, 0.12], '#1e293b', { scene, stroke: '#0f172a' });
      C3D.drawBox(g, P, [1.5, 0, -0.98], [1.8, 2.0, 0.12], '#1e293b', { scene, stroke: '#0f172a' });

      // Sloped Parts Chute Beneath Parting Line (Guides ejected parts down)
      C3D.drawBox(g, P, [1.05, 0, -0.42], [1.45, 1.25, 0.22], '#1e293b', { scene, stroke: '#334155' });
      // Molded Parts Collection Tote Container
      C3D.drawBox(g, P, [1.05, 0, -0.75], [1.15, 0.95, 0.26], '#d97706', { scene, stroke: '#92400e' });

      // Precision Platen Linear Guideway Rails on Machine Bed
      C3D.drawBox(g, P, [0.45, -0.55, -0.46], [3.6, 0.14, 0.08], '#94a3b8', { scene, stroke: '#64748b' });
      C3D.drawBox(g, P, [0.45, 0.55, -0.46], [3.6, 0.14, 0.08], '#94a3b8', { scene, stroke: '#64748b' });

      // ─── 2. Hydraulic Injection Unit & Plasticizing Carriage (Left) ───
      // Injection Carriage Sled Base
      C3D.drawBox(g, P, [-1.85, 0, -0.42], [1.8, 1.35, 0.16], '#1e293b', { scene, stroke: '#334155' });
      // Hydraulic Screw Rotation Motor & Injection Drive Housing
      C3D.drawBox(g, P, [-2.35, 0, 0.15], [0.85, 0.95, 0.95], '#0d9488', { scene, stroke: '#115e59' });
      // Motor Cooling Air Louvers
      for (let f = -2; f <= 2; f++) {
        C3D.drawPipe(g, P, [-2.35 + f * 0.12, -0.48, 0.15], [-2.35 + f * 0.12, 0.48, 0.15], 0.02, '#2dd4bf', { scene });
      }

      // Hydraulic High-Pressure Injection Cylinders & Manifold Piping
      C3D.drawCylinder(g, P, [-2.2, -0.38, 0.48], 0.07, 0.85, '#334155', { axis: 'x', scene, stroke: '#1e293b' });
      C3D.drawCylinder(g, P, [-2.2, 0.38, 0.48], 0.07, 0.85, '#334155', { axis: 'x', scene, stroke: '#1e293b' });

      // Barrel Swivel Flange & Thrust Bearing Saddle
      C3D.drawBox(g, P, [-1.85, 0, 0.15], [0.38, 0.85, 0.85], '#1e293b', { scene, stroke: '#334155' });

      // Horizontal Bimetallic Injection Barrel Cylinder
      C3D.drawCylinder(g, P, [-1.75, 0, 0.15], 0.28, 2.15, '#475569', {
        axis: 'x',
        scene,
        stroke: '#334155',
        topCap: true,
        bottomCap: true
      });

      // 3 Ceramic Electric Band Heaters with Heat-Sink Insulation Bands:
      // Zone 1: Feed (-1.15), Zone 2: Compression (-0.55), Zone 3: Metering (0.05)
      const heaterX = [-1.15, -0.55, 0.05];
      heaterX.forEach((hx) => {
        C3D.drawCylinder(g, P, [hx, 0, 0.15], 0.33, 0.34, '#ea580c', {
          axis: 'x',
          scene,
          stroke: '#c2410c'
        });
      });

      // Cutaway Sight Glass showing Internal Reciprocating Screw Flights
      scene.add(P([-0.85, -0.29, 0.15]).depth - 0.05, (ctx) => {
        const pt = P([-0.85, -0.29, 0.15]);
        ctx.save();
        ctx.beginPath();
        C3D.safeEllipse(ctx, pt.x, pt.y, 24, 10, 0);
        ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
        ctx.fill();
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        // Screw helix lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.2;
        const screwPulse = (time * 12) % 10;
        for (let s = -3; s <= 3; s++) {
          const sx = pt.x + s * 8 + (screwPulse - 5) * 0.4;
          ctx.beginPath();
          ctx.moveTo(sx, pt.y - 8);
          ctx.lineTo(sx + 5, pt.y + 8);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Water-Cooled Feed Throat Ring under Hopper
      C3D.drawCylinder(g, P, [-1.45, 0, 0.35], 0.34, 0.12, '#0284c7', { scene, stroke: '#0369a1' });

      // Conical Stainless Steel Feed Hopper
      C3D.drawCylinder(g, P, [-1.45, 0, 0.47], 0.33, 0.62, '#94a3b8', {
        scene,
        topCap: true,
        bottomCap: true,
        stroke: '#475569'
      });
      // Hopper Sight Glass Column showing Pellets
      for (let pl = 0; pl < 8; pl++) {
        const pAng = (pl / 8) * Math.PI * 2;
        const posPellet = [-1.45 + Math.cos(pAng) * 0.17, Math.sin(pAng) * 0.17, 0.88];
        scene.add(P(posPellet).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posPellet, 0.045, '#0284c7', '', '');
        });
      }

      // Hardened Alloy Injection Nozzle Tip & Nozzle Heater Band
      C3D.drawCylinder(g, P, [0.35, 0, 0.15], 0.17, 0.14, '#ea580c', { axis: 'x', scene, stroke: '#c2410c' });
      C3D.drawCylinder(g, P, [0.49, 0, 0.15], 0.12, 0.08, '#1e293b', { axis: 'x', scene, stroke: '#0f172a', topCap: true });

      // ─── 3. Horizontal Split Tooling Mould & 4-Tie-Bar Clamping Unit (Right) ───
      // 4 Precision Hard-Chrome Tie Bars (Pillars)
      const tieBarOffsets = [
        [-0.55, -0.35], [0.55, -0.35],
        [-0.55, 0.65],  [0.55, 0.65]
      ];
      tieBarOffsets.forEach(([ty, tz]) => {
        C3D.drawCylinder(g, P, [0.42, ty, tz], 0.055, 2.1, '#cbd5e1', {
          axis: 'x',
          scene,
          stroke: '#94a3b8'
        });
        // Tie-Bar Retaining Hex Nuts at platen faces
        C3D.drawCylinder(g, P, [0.44, ty, tz], 0.08, 0.08, '#475569', { axis: 'x', scene, stroke: '#334155' });
        C3D.drawCylinder(g, P, [2.42, ty, tz], 0.08, 0.08, '#475569', { axis: 'x', scene, stroke: '#334155' });
      });

      // Fixed Platen (Stationary Half of Mould mounted to frame)
      C3D.drawBox(g, P, [0.55, 0, 0.15], [0.32, 1.48, 1.48], '#334155', { scene, stroke: '#1e293b' });

      // Moving Platen (Ejector Half, slides on tie bars with bronze bushings)
      const mouldGap = 0.12 + (Math.sin(time * 2.2) > 0.15 ? 0.82 : 0.0);
      C3D.drawBox(g, P, [0.55 + mouldGap, 0, 0.15], [0.32, 1.48, 1.48], '#334155', { scene, stroke: '#1e293b' });
      // 4 Bronze Guide Bushings on Moving Platen
      tieBarOffsets.forEach(([ty, tz]) => {
        C3D.drawCylinder(g, P, [0.55 + mouldGap - 0.04, ty, tz], 0.085, 0.4, '#d97706', { axis: 'x', scene, stroke: '#b45309' });
      });

      // Rear Thrust Platen & Hydraulic Toggle Clamp Housing (End stop at x = 2.45)
      C3D.drawBox(g, P, [2.42, 0, 0.15], [0.35, 1.48, 1.48], '#1e293b', { scene, stroke: '#0f172a' });
      // Central High-Pressure Hydraulic Clamping Ram
      C3D.drawCylinder(g, P, [1.65 + mouldGap * 0.45, 0, 0.15], 0.24, 0.72, '#94a3b8', { axis: 'x', scene, stroke: '#64748b' });

      // Authentic Split Mould Tooling Halves (Bolted to Platens):
      // Fixed Mould Cavity Die
      C3D.drawBox(g, P, [0.72, 0, 0.15], [0.12, 1.05, 1.05], '#475569', { scene, stroke: '#334155' });
      // Moving Mould Core Die
      C3D.drawBox(g, P, [0.55 + mouldGap - 0.12, 0, 0.15], [0.12, 1.05, 1.05], '#475569', { scene, stroke: '#334155' });

      // 4 Hardened Leader Guide Pins Aligning Mould Halves
      [[-0.38, -0.2], [0.38, -0.2], [-0.38, 0.5], [0.38, 0.5]].forEach(([py, pz]) => {
        C3D.drawCylinder(g, P, [0.75, py, pz], 0.025, Math.min(mouldGap + 0.1, 0.7), '#e2e8f0', { axis: 'x', scene, stroke: '#94a3b8' });
      });

      // Water Cooling Manifold Quick-Release Flexible Hoses
      C3D.drawPipe(g, P, [0.72, -0.55, 0.45], [0.72, -0.75, -0.3], 0.022, '#0284c7', { scene }); // Chilled supply
      C3D.drawPipe(g, P, [0.72, 0.55, 0.45], [0.72, 0.75, -0.3], 0.022, '#ef4444', { scene });  // Warm return

      // Ejected Molded Part & Ejector Pins (Visible during mould open)
      if (mouldGap > 0.38) {
        // Ejector Pins extending from core platen
        [-0.15, 0.15].forEach(ey => {
          C3D.drawCylinder(g, P, [0.55 + mouldGap - 0.22, ey, 0.15], 0.015, 0.16, '#cbd5e1', { axis: 'x', scene });
        });
        // Molded Part falling into collection chute
        const partX = 0.55 + mouldGap * 0.46;
        const partDrop = Math.max(-0.65, 0.15 - ((mouldGap - 0.38) * 1.4));
        C3D.drawBox(g, P, [partX, 0, partDrop], [0.1, 0.5, 0.45], '#f59e0b', { scene, stroke: '#b45309' });
      }

      // Molded parts accumulated in collection tote bin
      C3D.drawBox(g, P, [1.05, 0, -0.72], [0.45, 0.4, 0.1], '#f59e0b', { scene, stroke: '#b45309' });

      // ─── 4. Industrial PLC Controller HMI Touchscreen Console ───
      C3D.drawBox(g, P, [-2.2, 1.15, 0.05], [0.45, 0.25, 0.75], '#1e293b', { scene, stroke: '#334155' });
      scene.add(P([-2.2, 1.01, 0.12]).depth - 0.1, (ctx) => {
        const pt = P([-2.2, 1.01, 0.12]);
        ctx.save();
        ctx.fillStyle = '#0f172a';
        C3D.safeRoundRect(ctx, pt.x - 30, pt.y - 18, 60, 36, 4);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.font = '700 8px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(`PLC CYCLE: ${mouldGap > 0.4 ? 'EJECT' : 'INJECT'}`, pt.x, pt.y - 5);
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`${P_inj} BAR • ${T}°C`, pt.x, pt.y + 7);
        ctx.restore();
      });

      // ─── 5. Professional CAD Outside Callouts (Adaptive, Zero Geometry Overlap!) ───
      scene.add(P([-1.45, 0, 1.15]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-1.45, 0, 1.15], 'Conical Feed Hopper', {
          dx: -85,
          dy: -60,
          color: '#0284c7',
          sub: `${p.polymerFeed || 'Polypropylene'} pellets with throat water collar`
        });
      });

      scene.add(P([-0.55, 0, 0.55]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-0.55, 0, 0.55], 'Horizontal Heated Barrel', {
          dx: -25,
          dy: -72,
          color: '#ea580c',
          sub: `3 PID heating zones (${p.barrelTemp || 220}°C) • Reciprocating screw`
        });
      });

      scene.add(P([0.55, 0, 1.0]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0.55, 0, 1.0], '4-Tie-Bar Clamping Unit', {
          dx: 75,
          dy: -65,
          color: '#475569',
          sub: 'Precision chrome tie bars • Split tool steel mould halves'
        });
      });

      scene.add(P([0.55 + mouldGap * 0.5, 0, -0.15]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0.55 + mouldGap * 0.5, 0, -0.15], 'Ejected Molded Component', {
          dx: 90,
          dy: 40,
          color: '#f59e0b',
          sub: `Cycle: ${state.cycleTimeSec || 20} s • ${state.partsPerHour || 180} parts/hr`
        });
      });

      scene.add(P([2.42, 0, 0.35]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [2.42, 0, 0.35], 'Hydraulic Clamp Ram', {
          dx: 85,
          dy: -30,
          color: '#0369a1',
          sub: `${P_inj} bar injection & lockup clamping force`
        });
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Feed Hopper & Screw (${p.polymerFeed || 'Polypropylene'})`, color: '#0284c7' },
        { label: `Plasticizing Barrel (${p.barrelTemp || 220}°C)`, color: '#ea580c' },
        { label: '4-Tie-Bar Split Tooling & Mould', color: '#475569' },
        { label: 'Moulded Finished Part & Tote Bin', color: '#f59e0b' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 58 — Extrusion Moulding Simulator (chem-extrusion)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-extrusion'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('screwRpm', 'Extruder Screw Speed', 10, 120, 5, 45, 'rpm'),
      r('barrelTemp', 'Die Zone Temperature', 160, 240, 5, 200, '°C'),
      select('dieProfile', 'Extrusion Die Geometry', 'Annular Pipe Die (HDPE Pipe)', ['Annular Pipe Die (HDPE Pipe)', 'Blown Film Die (PE Bag)', 'Sheet Die (Rigid PS)', 'Wire Coating Crosshead'])
    ],
    steps: () => [
      {
        title: 'Continuous Screw Extrusion Processing',
        text: 'Extrusion continuously melts and pumps polymer melt through a profile die to produce continuous pipes, films, sheets, and wire coatings.'
      },
      {
        title: 'Single-Screw Functional Zones',
        text: '1. Feed Zone: deep flights transport solid pellets. 2. Compression Zone: tapered root melts and compresses pellets. 3. Metering Zone: shallow flights pump homogeneous melt.'
      },
      {
        title: 'Breaker Plate & Screen Pack',
        text: 'A perforated circular breaker plate supports wire mesh screens, filtering foreign particles and converting rotational flow into parallel axial streamlines.'
      },
      {
        title: 'Extrusion Profile Die',
        text: 'Polymer enters an annular die with central mandrel pin; molten pipe tube emerges continuously at uniform velocity.'
      },
      {
        title: 'Vacuum Calibration & Cooling Bath',
        text: 'The hot pipe enters a vacuum sizing tank spray-cooled with chilled water; vacuum pulls outer diameter against calibrator sleeve to lock dimensions.'
      },
      {
        title: 'Caterpillar Haul-Off & Rotary Cutoff',
        text: 'Tractor belts pull the hardened pipe under controlled line speed before a synchronized planetary saw cuts it to exact length.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const rpm = Number(p.screwRpm) || 45;
      const throughputKgHr = (rpm * 1.85).toFixed(1);
      const lineSpeedMpm = (rpm * 0.12).toFixed(2);

      return {
        formulas: [{
          name: 'Extruder Volumetric Drag Flow',
          formula: 'Q_drag = ½ × π² × D² × N × h × sin(φ)·cos(φ) | Throughput ∝ Screw RPM',
          given: `Screw Speed = ${rpm} rpm, Die = ${p.dieProfile}`,
          calc: `Throughput = ${rpm} × 1.85 = ${throughputKgHr} kg/hr`,
          result: `Mass Output = ${throughputKgHr} kg/hr, Haul-Off = ${lineSpeedMpm} m/min`,
          unit: 'kg/hr'
        }],
        readouts: [
          { label: 'Extruder Output Rate', value: `${throughputKgHr} kg/hr`, tone: 'green' },
          { label: 'Haul-Off Line Speed', value: `${lineSpeedMpm} m/min`, tone: 'blue' },
          { label: 'Screw Rotation', value: `${rpm} RPM`, tone: 'blue' },
          { label: 'Melt Pressure at Die', value: '180 bar', tone: 'green' }
        ],
        state: { throughputKgHr, lineSpeedMpm },
        explain: {
          what: `Continuous screw extrusion using ${p.dieProfile} at ${rpm} RPM.`,
          why: `Rotating flight channel drags polymer against barrel wall, generating shear heat and generating pressure to push melt through the shaping die.`
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
      const rpm = Number(p.screwRpm) || 45;

      const P = C3D.createProjector(g, view, 500, 310, 145);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4.5, 4.5], [-3.5, 3.5], -1.1, '#1e293b', 1.0);

      // ─── 1. Industrial Extruder Machine Bed Frame ───
      // Heavy Welded Steel Base Frame with Foundation Mounts
      C3D.drawBox(g, P, [0, 0, -0.72], [5.8, 2.0, 0.46], '#0f172a', { scene, stroke: '#020617' });
      // Leveling Machine Feet
      C3D.drawBox(g, P, [-2.2, 0, -0.98], [1.2, 1.8, 0.12], '#1e293b', { scene, stroke: '#0f172a' });
      C3D.drawBox(g, P, [1.8, 0, -0.98], [1.8, 1.8, 0.12], '#1e293b', { scene, stroke: '#0f172a' });

      // ─── 2. AC Variable Speed Drive Motor & Helical Gearbox (Left: x = -2.35) ───
      // Heavy TEFC Induction Motor in Industrial Blue
      C3D.drawBox(g, P, [-2.35, 0, 0.15], [0.9, 0.95, 0.95], '#0284c7', { scene, stroke: '#0369a1' });
      // Motor Cooling Air Louvers
      for (let f = -2; f <= 2; f++) {
        C3D.drawPipe(g, P, [-2.35 + f * 0.12, -0.48, 0.15], [-2.35 + f * 0.12, 0.48, 0.15], 0.02, '#38bdf8', { scene });
      }
      // Helical Reduction Gearbox with Lubrication Sight Glass
      C3D.drawBox(g, P, [-1.75, 0, 0.15], [0.55, 0.85, 0.85], '#1e293b', { scene, stroke: '#334155' });
      // High-Capacity Water-Cooled Thrust Bearing Block (absorbs 400 bar screw back-pressure)
      C3D.drawBox(g, P, [-1.38, 0, 0.15], [0.32, 0.75, 0.75], '#334155', { scene, stroke: '#475569' });

      // ─── 3. Horizontal Extruder Barrel & Zones (Along X-Axis) ───
      // Water-Cooled Grooved Feed Throat under Hopper
      C3D.drawCylinder(g, P, [-1.22, 0, 0.15], 0.32, 0.28, '#0284c7', { axis: 'x', scene, stroke: '#0369a1' });

      // Bimetallic Extruder Barrel Cylinder (extends from x = -1.22 to x = 0.45, length = 1.67)
      C3D.drawCylinder(g, P, [-1.22, 0, 0.15], 0.28, 1.67, '#475569', {
        axis: 'x',
        scene,
        stroke: '#334155',
        topCap: true,
        bottomCap: true
      });

      // 3 Ceramic Band Heaters across Processing Zones with Cooling Blower Cowlings:
      // Zone 1: Feed (x = -0.85), Zone 2: Compression (x = -0.3), Zone 3: Metering (x = 0.25)
      const heaterZones = [-0.85, -0.3, 0.25];
      heaterZones.forEach((hx) => {
        // Ceramic Heater Ring
        C3D.drawCylinder(g, P, [hx, 0, 0.15], 0.33, 0.32, '#ea580c', {
          axis: 'x',
          scene,
          stroke: '#c2410c'
        });
        // Independent Centrifugal Cooling Blower Fan Cowling on Top of Zone
        C3D.drawBox(g, P, [hx + 0.16, 0, 0.48], [0.22, 0.28, 0.26], '#334155', { scene, stroke: '#1e293b' });
      });

      // Stainless Steel Conical Feed Hopper at x = -1.22 with Vacuum Loader Line
      C3D.drawCylinder(g, P, [-1.22, 0, 0.45], 0.32, 0.58, '#94a3b8', {
        scene,
        topCap: true,
        bottomCap: true,
        stroke: '#475569'
      });
      // Granules in Hopper
      for (let gp = 0; gp < 8; gp++) {
        const gAng = (gp / 8) * Math.PI * 2;
        const posGranule = [-1.22 + Math.cos(gAng) * 0.16, Math.sin(gAng) * 0.16, 0.88];
        scene.add(P(posGranule).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posGranule, 0.045, '#0284c7', '', '');
        });
      }

      // ─── 4. Breaker Plate Clamping Flange & Annular Pipe Die Head ───
      // Breaker Plate & Screen Pack Adapter Flange
      C3D.drawCylinder(g, P, [0.45, 0, 0.15], 0.34, 0.14, '#334155', { axis: 'x', scene, stroke: '#1e293b' });
      // Annular Pipe Profile Die Body (Shapes tubular melt)
      C3D.drawCylinder(g, P, [0.59, 0, 0.15], 0.36, 0.28, '#1e293b', { axis: 'x', scene, stroke: '#0f172a' });
      // Circumferential Die Lip Centering Calibration Bolts
      for (let b = 0; b < 6; b++) {
        const bAng = (b / 6) * Math.PI * 2;
        C3D.drawCylinder(g, P, [0.72, Math.cos(bAng) * 0.38, 0.15 + Math.sin(bAng) * 0.38], 0.03, 0.08, '#94a3b8', { axis: 'x', scene });
      }

      // ─── 5. Vacuum Calibration Sizing & Spray Water Cooling Bath (x = 0.9 to 1.95) ───
      // Heavy Stainless Steel Tank Body
      C3D.drawBox(g, P, [1.42, 0, 0.02], [1.15, 0.82, 0.44], '#475569', { scene, stroke: '#334155' });
      // Hinged Transparent Polycarbonate Observation Hood Cover
      C3D.drawBox(g, P, [1.42, 0, 0.26], [1.15, 0.82, 0.22], 'rgba(224, 242, 254, 0.38)', {
        scene,
        stroke: 'rgba(255, 255, 255, 0.9)'
      });
      // Brass Vacuum Sizing Calibrator Sleeve at Entrance
      C3D.drawCylinder(g, P, [0.88, 0, 0.15], 0.24, 0.12, '#d97706', { axis: 'x', scene, stroke: '#b45309' });

      // Water Spray Mist Droplets Cooling Pipe in Bath
      for (let w = 0; w < 8; w++) {
        const wx = 1.05 + w * 0.12;
        const wy = (Math.sin(time * 5 + w) * 0.18);
        const wz = 0.26 + Math.cos(time * 4 + w) * 0.08;
        scene.add(P([wx, wy, wz]).depth, (ctx) => {
          C3D.drawAtom(ctx, P, [wx, wy, wz], 0.038, '#38bdf8', '', '');
        });
      }

      // ─── 6. Continuous 3D Extruded Hollow Plastic Pipe Profile ───
      // Pipe emerges from die (x = 0.87) and extends smoothly through bath & puller to x = 2.75!
      C3D.drawCylinder(g, P, [0.87, 0, 0.15], 0.18, 1.88, '#0284c7', {
        axis: 'x',
        scene,
        stroke: '#0369a1',
        topCap: true,
        bottomCap: false
      });
      // Hollow Pipe Core (Inner Bore)
      C3D.drawCylinder(g, P, [2.74, 0, 0.15], 0.13, 0.04, '#0f172a', {
        axis: 'x',
        scene,
        topCap: true
      });

      // ─── 7. Caterpillar Haul-Off Tractor Puller Unit (x = 2.25) ───
      // Heavy Steel Puller Enclosure Housing
      C3D.drawBox(g, P, [2.25, 0, 0.15], [0.65, 0.72, 0.85], '#1e293b', { scene, stroke: '#334155' });
      // Top Motorized Caterpillar Tractor Belt with Polyurethane Cleats
      C3D.drawBox(g, P, [2.25, 0, 0.44], [0.55, 0.42, 0.16], '#d97706', { scene, stroke: '#b45309' });
      // Bottom Motorized Caterpillar Tractor Belt
      C3D.drawBox(g, P, [2.25, 0, -0.14], [0.55, 0.42, 0.16], '#d97706', { scene, stroke: '#b45309' });

      // ─── 8. Professional CAD Outside Callouts (Adaptive, Zero Geometry Overlap!) ───
      scene.add(P([-2.35, 0, 0.65]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-2.35, 0, 0.65], 'Extruder Drive & Gearbox', {
          dx: -85,
          dy: -60,
          color: '#0284c7',
          sub: `${rpm} RPM continuous variable speed • Heavy thrust bearing`
        });
      });

      scene.add(P([-1.22, 0, 1.15]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-1.22, 0, 1.15], 'Conical Feed Hopper', {
          dx: -45,
          dy: -68,
          color: '#0284c7',
          sub: 'Polymer resin pellets gravity feed with water-cooled throat'
        });
      });

      scene.add(P([-0.3, 0, 0.65]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-0.3, 0, 0.65], '3-Zone Extruder Barrel', {
          dx: 0,
          dy: -75,
          color: '#ea580c',
          sub: 'Feed, compression & metering zones with independent blower fans'
        });
      });

      scene.add(P([0.59, 0, 0.6]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0.59, 0, 0.6], 'Annular Pipe Profile Die', {
          dx: 65,
          dy: -60,
          color: '#334155',
          sub: 'Mandrel & spider legs shape continuous hollow profile'
        });
      });

      scene.add(P([1.42, 0, 0.4]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [1.42, 0, 0.4], 'Vacuum Water Cooling Bath', {
          dx: 75,
          dy: -45,
          color: '#38bdf8',
          sub: 'Sizing sleeve & 360° spray mist locks pipe outer diameter'
        });
      });

      scene.add(P([2.55, 0, 0.15]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [2.55, 0, 0.15], 'Caterpillar Haul-Off Puller', {
          dx: 85,
          dy: 35,
          color: '#0284c7',
          sub: `Output: ${state.throughputKgHr || 83} kg/hr • Line Speed: ${state.lineSpeedMpm || 5.4} m/min`
        });
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Extruder Drive, Gearbox & Barrel', color: '#0284c7' },
        { label: 'Annular Pipe Profile Die Head', color: '#1e293b' },
        { label: 'Vacuum Sizing & Cooling Bath', color: '#38bdf8' },
        { label: `Haul-Off & Pipe (${state.throughputKgHr || 83} kg/hr)`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 59 — Compression Moulding Simulator (chem-compression-moulding)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-compression-moulding'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('pressForceTon', 'Hydraulic Clamping Force', 50, 400, 25, 200, 'tonnes'),
      r('mouldTemp', 'Tool Steel Temperature', 130, 190, 5, 155, '°C'),
      r('cureTime', 'Thermoset Curing Time', 30, 180, 10, 90, 's'),
      select('chargeMaterial', 'Moulding Charge Compound', 'Sheet Moulding Compound (SMC)', ['Sheet Moulding Compound (SMC)', 'Bulk Moulding Compound (BMC)', 'Phenolic Preform Pellet'])
    ],
    steps: () => [
      {
        title: 'Compression Moulding Press Architecture',
        text: 'A vertical hydraulic press houses heated matched tool steel moulds: a stationary lower female cavity and a descending upper male core.'
      },
      {
        title: 'Placement of Pre-weighed Charge',
        text: 'A pre-weighed charge of Sheet Moulding Compound (SMC, glass fibers + polyester resin) is accurately positioned in the heated lower mould (150°C).'
      },
      {
        title: 'Mould Closure & High-Pressure Flow',
        text: 'The upper platen descends at controlled speed; high pressure (100–200 bar) squeezes the viscous compound to flow and fill every detail of the cavity.'
      },
      {
        title: 'Thermoset Cross-Linking Reaction',
        text: 'Held under heat and pressure for 60–120 seconds, initiator peroxide decomposes, driving rapid cross-linking into an infusible rigid composite.'
      },
      {
        title: 'De-Gassing (Bumping) & Cure Completion',
        text: 'A momentary platen breathe cycle releases entrapped air and volatile reaction moisture, preventing surface blisters.'
      },
      {
        title: 'Part Ejection & Trim Flash',
        text: 'The press opens; pneumatic ejector pins lift the finished automotive body panel or electrical enclosure for edge flash trimming.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const F = Number(p.pressForceTon) || 200;
      const T = Number(p.mouldTemp) || 155;
      const tCure = Number(p.cureTime) || 90;

      const pressureBar = (F * 9.81 * 1000) / (0.15 * 1e5); // approx cavity bar
      const cycleSec = tCure + 25;

      return {
        formulas: [{
          name: 'Compression Hydraulic Pressure & Curing',
          formula: 'P_cavity = Force / Projected_Area | Cure Rate ∝ exp(-E_a / RT)',
          given: `Force = ${F} tonnes, T_mould = ${T}°C, Curing = ${tCure} s`,
          calc: `Cycle Time = ${tCure} + 25 = ${cycleSec} s`,
          result: `Cycle Time = ${cycleSec} s, Cavity Pressure ≈ 130 bar`,
          unit: 's'
        }],
        readouts: [
          { label: 'Cure Cycle Time', value: `${cycleSec} s`, tone: 'green' },
          { label: 'Mould Cavity Pressure', value: '130 bar', tone: 'blue' },
          { label: 'Thermoset Cure Degree', value: '98% (Fully Cured)', tone: 'green' },
          { label: 'Part Integrity', value: 'Zero Porosity', tone: 'green' }
        ],
        state: { cycleSec, F },
        explain: {
          what: `Hydraulic compression moulding of ${p.chargeMaterial} under ${F} tonnes.`,
          why: `Direct vertical squeezing between heated steel dies forces compound flow into large thin-walled geometries without fiber shear degradation.`
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
      const F = Number(p.pressForceTon) || 200;
      const T = Number(p.mouldTemp) || 155;

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // ─── 1. Industrial 4-Column Vertical Hydraulic Press Architecture ───
      // Heavy Monolithic Cast-Iron Bed Base Frame
      C3D.drawBox(g, P, [0, 0, -0.72], [2.85, 2.35, 0.55], '#1e293b', { scene, stroke: '#0f172a' });
      // Machined T-Slotted Lower Bolster Platen on Bed
      C3D.drawBox(g, P, [0, 0, -0.42], [2.15, 1.75, 0.12], '#475569', { scene, stroke: '#334155' });

      // 4 Massive Solid Forged Alloy Steel Tie Column Pillars (Pillars from z = -0.4 to z = 2.05)
      const columnPositions = [
        [-1.05, -0.82], [1.05, -0.82],
        [-1.05, 0.82],  [1.05, 0.82]
      ];
      columnPositions.forEach(([cx, cy]) => {
        // Polished Chrome Column Shaft
        C3D.drawCylinder(g, P, [cx, cy, -0.42], 0.085, 2.5, '#cbd5e1', {
          scene,
          stroke: '#94a3b8',
          topCap: true,
          bottomCap: true
        });
        // Heavy Spherical Seat Retaining Nuts Top & Bottom
        C3D.drawCylinder(g, P, [cx, cy, -0.44], 0.13, 0.14, '#334155', { scene, stroke: '#1e293b' });
        C3D.drawCylinder(g, P, [cx, cy, 2.04], 0.13, 0.14, '#334155', { scene, stroke: '#1e293b' });
      });

      // Rigid Top Crown Head Crosshead Housing Main Hydraulic Ram
      C3D.drawBox(g, P, [0, 0, 2.08], [2.85, 2.35, 0.52], '#1e293b', { scene, stroke: '#0f172a' });

      // Main High-Pressure Hydraulic Cylinder Ram on Crown
      C3D.drawCylinder(g, P, [0, 0, 2.34], 0.38, 0.82, '#0f766e', { scene, stroke: '#115e59', topCap: true });
      // Hydraulic Oil Pipe Manifold to Ram
      C3D.drawPipe(g, P, [0, 0, 3.12], [0.95, 0.95, 2.3], 0.035, '#1e293b', { scene });

      // ─── 2. Moving Slide Platen with Precision Bronze Guide Bushings ───
      const pressClose = Math.sin(time * 2) > 0.3;
      const upperZ = pressClose ? 0.32 : 1.25;

      // Central Polished Hydraulic Ram Piston Rod
      C3D.drawCylinder(g, P, [0, 0, upperZ + 0.32], 0.28, Math.max(0.1, 1.82 - (upperZ + 0.32)), '#cbd5e1', {
        scene,
        stroke: '#94a3b8'
      });

      // Heavy Moving Slide Platen
      C3D.drawBox(g, P, [0, 0, upperZ + 0.18], [2.15, 1.75, 0.28], '#334155', { scene, stroke: '#1e293b' });

      // 4 Precision Bronze Tie-Column Guide Bushings on Moving Platen
      columnPositions.forEach(([cx, cy]) => {
        C3D.drawCylinder(g, P, [cx, cy, upperZ + 0.05], 0.12, 0.42, '#d97706', {
          scene,
          stroke: '#b45309',
          topCap: true,
          bottomCap: true
        });
      });

      // ─── 3. Matched Tool Steel Mould (Electric Heated Dies: 150°C) ───
      // Lower Stationary Female Cavity Die (Bolted to Heated Bed)
      C3D.drawBox(g, P, [0, 0, -0.14], [1.75, 1.35, 0.44], '#475569', { scene, stroke: '#334155' });
      // Lower Die Thermal Insulation Board (prevents heat loss to bolster)
      C3D.drawBox(g, P, [0, 0, -0.34], [1.82, 1.42, 0.05], '#d97706', { scene, stroke: '#92400e' });

      // Upper Moving Male Core Punch Die (Bolted to Moving Platen)
      C3D.drawBox(g, P, [0, 0, upperZ - 0.08], [1.75, 1.35, 0.32], '#475569', { scene, stroke: '#334155' });

      // Electric Cartridge Heater Manifold Wiring & Sensor Lines
      C3D.drawPipe(g, P, [-0.88, 0, -0.14], [-1.35, -0.5, -0.4], 0.02, '#ea580c', { scene });
      C3D.drawPipe(g, P, [-0.88, 0, upperZ - 0.08], [-1.35, -0.5, upperZ + 0.2], 0.02, '#ea580c', { scene });

      // SMC Thermoset Composite Charge being Compressed
      const chargeThickness = pressClose ? 0.06 : 0.22;
      const chargeSpread = pressClose ? 1.55 : 1.1;
      C3D.drawBox(g, P, [0, 0, 0.08 + chargeThickness / 2], [chargeSpread, chargeSpread * 0.78, chargeThickness], '#f59e0b', {
        scene,
        stroke: '#b45309'
      });

      // Degassing Breathe Vapor Shimmer if closing
      if (pressClose) {
        scene.add(P([0, 0, 0.28]).depth - 0.05, (ctx) => {
          const pt = P([0, 0, 0.28]);
          ctx.save();
          ctx.font = '700 10px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.fillStyle = 'rgba(234, 88, 12, 0.85)';
          ctx.textAlign = 'center';
          ctx.fillText('♨ DEGASSING BREATHE CYCLE', pt.x, pt.y - 12);
          ctx.restore();
        });
      }

      // Ejector Pins lifting cured part when mould opens
      if (!pressClose) {
        [-0.4, 0.4].forEach(ex => {
          C3D.drawCylinder(g, P, [ex, 0, -0.14], 0.025, 0.24, '#cbd5e1', { scene, stroke: '#94a3b8' });
        });
      }

      // ─── 4. Hydraulic Power Unit & Control Panel ───
      // Side-Mounted Hydraulic Oil Reservoir & Motor Pump Unit
      C3D.drawBox(g, P, [1.85, 0, -0.25], [0.75, 1.1, 0.75], '#0f766e', { scene, stroke: '#115e59' });
      // Oil Level Sight Gauge
      C3D.drawCylinder(g, P, [1.85, -0.56, -0.25], 0.03, 0.35, '#38bdf8', { scene, stroke: '#0284c7' });

      // Operator Control Console & Tonnage Pressure Gauge
      C3D.drawBox(g, P, [-1.75, -0.65, -0.2], [0.35, 0.45, 0.65], '#1e293b', { scene, stroke: '#334155' });
      scene.add(P([-1.75, -0.65, 0.15]).depth - 0.05, (ctx) => {
        const pt = P([-1.75, -0.65, 0.15]);
        ctx.save();
        ctx.fillStyle = '#0f172a';
        C3D.safeRoundRect(ctx, pt.x - 28, pt.y - 16, 56, 32, 4);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.font = '700 8px monospace';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText(`${F} TONNES`, pt.x, pt.y - 4);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`${T}°C CURE`, pt.x, pt.y + 7);
        ctx.restore();
      });

      // ─── 5. Professional CAD Outside Callouts (Adaptive, Zero Geometry Overlap!) ───
      scene.add(P([0, 0, 2.45]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0, 0, 2.45], 'Top Crown & Hydraulic Ram', {
          dx: -85,
          dy: -55,
          color: '#0f766e',
          sub: `Main clamping cylinder • ${F} tonnes downward ram thrust`
        });
      });

      scene.add(P([0, 0, upperZ + 0.35]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0, 0, upperZ + 0.35], 'Moving Slide Platen', {
          dx: -85,
          dy: -40,
          color: '#0284c7',
          sub: 'Heavy moving punch platen with bronze guide bushings'
        });
      });

      scene.add(P([0, 0, 0.12]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0, 0, 0.12], 'SMC Thermoset Composite Charge', {
          dx: 85,
          dy: -40,
          color: '#f59e0b',
          sub: `${p.chargeMaterial || 'Sheet Moulding Compound'} • Curing at ${T}°C`
        });
      });

      scene.add(P([0, 0, -0.22]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0, 0, -0.22], 'Lower Heated Steel Die Cavity', {
          dx: 85,
          dy: 35,
          color: '#ea580c',
          sub: `Electric cartridge heating (${T}°C) • Thermal insulation board`
        });
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: '4-Column Hydraulic Vertical Press Frame', color: '#1e293b' },
        { label: `Main Ram & Top Crown (${F} Tonnes)`, color: '#0f766e' },
        { label: `Matched Tool Steel Moulds (${T}°C)`, color: '#ea580c' },
        { label: 'SMC Thermoset Charge & Ejectors', color: '#f59e0b' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 60 — Conducting Polymer Simulator (chem-conducting-polymer)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-conducting-polymer'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('polymerType', 'Conjugated Polymer Backbone', 'Polyacetylene (trans-[CH=CH]ₙ)', ['Polyacetylene (trans-[CH=CH]ₙ)', 'Polyaniline (PANI Emeraldine)', 'Polypyrrole (PPy)', 'PEDOT (Polythiophene)']),
      select('dopingState', 'Chemical Doping Level', 'p-Doped (Iodine Oxidized, 10³ S/cm)', ['Undoped (Insulator, 10⁻¹⁰ S/cm)', 'Lightly Doped (Semiconductor, 10⁻¹ S/cm)', 'p-Doped (Iodine Oxidized, 10³ S/cm)', 'Super-Metallic Doped (10⁴ S/cm)']),
      r('voltage', 'Applied Voltage Bias', 0.1, 5.0, 0.1, 1.5, 'V')
    ],
    steps: () => [
      {
        title: 'Conjugated π-Orbital Electronic Backbone',
        text: 'Conducting polymers feature alternating single and double carbon-carbon bonds with continuous overlapping p_z atomic orbitals forming a delocalized π-band.'
      },
      {
        title: 'Peierls Distortion & Insulating Ground State',
        text: 'In the undoped state, bond length alternation (Peierls distortion) creates a semiconductor bandgap (~1.5 eV); electrical conductivity is near zero (10⁻¹⁰ S/cm).'
      },
      {
        title: 'p-Type Doping (Oxidative Intercalation)',
        text: 'Exposing polyacetylene to iodine vapor (I₂) extracts electrons from the π-backbone: (CH)ₙ + 3x/2 I₂ → (CH)ₙˣ⁺ + x I₃⁻, creating positive radical polarons.'
      },
      {
        title: 'Polarons & Bipolarons Charge Carriers',
        text: 'Self-localized polarons and bipolarons create intermediate states within the bandgap, allowing spinless charge transport along the chain.'
      },
      {
        title: '12 Orders of Magnitude Conductivity Jump',
        text: 'Doping dramatically elevates electrical conductivity by 10¹² from 10⁻¹⁰ S/cm up to 10⁴ S/cm—rivaling metallic copper and silver!'
      },
      {
        title: 'Optoelectronic & Sensor Applications',
        text: 'Used in organic LEDs (OLEDs), flexible transparent electrodes (PEDOT:PSS), artificial muscles, biosensors, and electromagnetic shielding.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const isUndoped = p.dopingState.includes('Undoped');
      const isLight = p.dopingState.includes('Lightly');
      const isPDoped = p.dopingState.includes('p-Doped');

      const sigma = isUndoped ? 1e-10 : isLight ? 0.1 : isPDoped ? 1500 : 12000; // S/cm
      const V_app = Number(p.voltage) || 1.5;
      const currentMa = (sigma > 1 ? (sigma / 500) * V_app * 10 : 0.0001).toFixed(2);

      return {
        formulas: [{
          name: 'Conjugated Charge Transport & Conductivity',
          formula: 'σ = n·e·µ (Polaron charge carriers) | (CH)ₙ + I₂ → (CH)ₙ⁺ + I₃⁻',
          given: `Polymer = ${p.polymerType}, State = ${p.dopingState}, V = ${V_app} V`,
          calc: `Conductivity σ = ${sigma} S/cm, Current = ${currentMa} mA`,
          result: `Conductivity σ = ${sigma.toExponential(1)} S/cm, Current = ${currentMa} mA`,
          unit: 'S/cm'
        }],
        readouts: [
          { label: 'Electrical Conductivity (σ)', value: `${sigma.toExponential(1)} S/cm`, tone: sigma > 100 ? 'green' : 'amber' },
          { label: 'Carrier Type', value: isUndoped ? 'None' : 'Positive Polaron (+)', tone: isUndoped ? 'blue' : 'green' },
          { label: 'Measured Current', value: `${currentMa} mA`, tone: Number(currentMa) > 1 ? 'green' : 'blue' },
          { label: 'Bandgap State', value: isUndoped ? 'Full Eg (1.5 eV)' : 'Polaron Band (Metallic)', tone: isUndoped ? 'blue' : 'green' }
        ],
        state: { sigma, currentMa, isUndoped },
        explain: {
          what: `Conductivity testing of ${p.polymerType} in ${p.dopingState} state.`,
          why: `Oxidative doping removes electrons from conjugated π-orbitals to form mobile polarons; charge hops along the backbone with metallic conductivity.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isConducting = (state.sigma || 0) > 10;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Alternating conjugated chain backbone
      for (let i = -1.6; i <= 1.6; i += 0.22) {
        const isDouble = Math.round(i * 10) % 2 === 0;
        const posC = [i, 0, 0.2];
        scene.add(P(posC).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posC, 0.08, isConducting ? '#eab308' : '#64748b', isDouble ? '=' : '-', '');
        });
      }

      // Delocalized charge clouds / polarons drifting along wire
      if (isConducting) {
        for (let i = 0; i < 5; i++) {
          const xPos = -1.4 + ((time * 1.5 + i * 0.4) % 2.8);
          const posPol = [xPos, 0, 0.35];
          scene.add(P(posPol).depth, (ctx) => {
            C3D.drawAtom(ctx, P, posPol, 0.07, '#ef4444', '+', '');
          });
        }
      }

      // Conductivity Meter on top
      C3D.drawVoltmeter(g, P, [0, 0, 1.8], 1.0, Math.log10(Math.max(1e-10, state.sigma || 1e-10)), 5.0, {
        scene,
        label: 'LOG10(σ) S/CM',
        decimals: 1
      });

      // Tags
      scene.add(P([0, 0, 0.6]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.6], isConducting ? 'Metallic Conductor (Polarons)' : 'Insulator (Peierls Gap)', isConducting ? '#16a34a' : '#475569', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Conjugated Polymer Backbone (${p.polymerType.split(' ')[0]})`, color: '#64748b' },
        { label: 'Mobile Positive Polarons (+)', color: '#ef4444', symbol: true },
        { label: isConducting ? 'Metallic Conduction (10³ S/cm)' : 'Undoped Insulator (10⁻¹⁰ S/cm)', color: isConducting ? '#10b981' : '#64748b' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 61 — Fibre-Reinforced Plastic Composite (chem-frp)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-frp'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('fiberVolume', 'Fiber Volume Fraction (V_f)', 0.1, 0.7, 0.05, 0.5, ''),
      select('fiberType', 'Reinforcing Fiber Type', 'Carbon Fiber (High Modulus)', ['E-Glass Fiber (Standard)', 'Carbon Fiber (High Modulus)', 'Aramid Kevlar 49 (Impact)']),
      select('matrixType', 'Polymer Matrix Resin', 'Epoxy Thermoset (E_m = 3.5 GPa)', ['Epoxy Thermoset (E_m = 3.5 GPa)', 'Vinyl Ester Resin (E_m = 3.2 GPa)', 'Polyester Resin (E_m = 3.0 GPa)'])
    ],
    steps: () => [
      {
        title: 'Composite Synergistic Architecture',
        text: 'Fiber-Reinforced Plastics (FRP) combine high-strength fibers embedded in a ductile polymer matrix, exceeding the properties of either component.'
      },
      {
        title: 'Role of Reinforcing Fibers',
        text: 'Continuous filaments (glass, carbon, Kevlar) carry 70–90% of tensile loads, exhibiting high specific stiffness and exceptional strength-to-weight ratio.'
      },
      {
        title: 'Role of Polymer Matrix',
        text: 'The matrix (epoxy/polyester) binds fibers, transfers shear stress across the fiber-matrix interface, and protects brittle filaments from environmental abrasion.'
      },
      {
        title: 'Rule of Mixtures (Longitudinal E_c1)',
        text: 'Parallel to fiber orientation (isostrain): E_c1 = E_f·V_f + E_m·(1 − V_f). Elastic modulus increases linearly with fiber volume fraction V_f.'
      },
      {
        title: 'Transverse Anisotropy (E_c2)',
        text: 'Perpendicular to fibers (isostress): 1/E_c2 = V_f/E_f + (1 − V_f)/E_m. Transverse stiffness is matrix-dominated, highlighting strong directional anisotropy.'
      },
      {
        title: 'Aerospace & Wind Turbine Engineering',
        text: 'Cross-ply [0°/90°/±45°] laminate stacking tailors multi-directional load capacity for aircraft fuselages (Boeing 787) and 100-meter wind turbine blades.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const Vf = Number(p.fiberVolume) || 0.5;
      const Ef = p.fiberType.includes('Carbon') ? 230 : p.fiberType.includes('Kevlar') ? 130 : 72; // GPa
      const Em = 3.5; // GPa

      // Rule of mixtures
      const Ec1 = (Ef * Vf + Em * (1 - Vf)).toFixed(1);
      const Ec2 = (1 / (Vf / Ef + (1 - Vf) / Em)).toFixed(1);
      const density = (Vf * 1.8 + (1 - Vf) * 1.2).toFixed(2); // g/cm3

      return {
        formulas: [{
          name: 'Composite Rule of Mixtures',
          formula: 'E_longitudinal = E_f·V_f + E_m·(1 - V_f) | 1/E_transverse = V_f/E_f + (1 - V_f)/E_m',
          given: `E_f = ${Ef} GPa (${p.fiberType}), E_m = ${Em} GPa, V_f = ${Vf}`,
          calc: `E_long = ${Ef}×${Vf} + ${Em}×${(1-Vf).toFixed(2)} = ${Ec1} GPa`,
          result: `Longitudinal E_c1 = ${Ec1} GPa, Transverse E_c2 = ${Ec2} GPa`,
          unit: 'GPa'
        }],
        readouts: [
          { label: 'Longitudinal Modulus (E_c1)', value: `${Ec1} GPa`, tone: 'green' },
          { label: 'Transverse Modulus (E_c2)', value: `${Ec2} GPa`, tone: 'amber' },
          { label: 'Anisotropy Ratio (E₁/E₂)', value: `${(Number(Ec1)/Number(Ec2)).toFixed(1)} : 1`, tone: 'blue' },
          { label: 'Composite Density', value: `${density} g/cm³`, tone: 'green' }
        ],
        state: { Ec1, Ec2, Vf, Ef },
        explain: {
          what: `Micromechanical analysis of ${p.fiberType} in ${p.matrixType} composite laminate.`,
          why: `Fibers carry primary tensile loads along their axis (isostrain Rule of Mixtures); transverse loading is governed by matrix shear.`
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

      // Transparent Epoxy Matrix Block
      C3D.drawBox(g, P, [0, 0, 0.2], [3.2, 2.2, 1.2], 'rgba(56, 189, 248, 0.35)', { scene, stroke: '#0284c7' });

      // Embedded Fiber Bundles (Parallel rods along X axis)
      const numFibers = Math.round((state.Vf || 0.5) * 8);
      const fiberCol = p.fiberType.includes('Carbon') ? '#0f172a' : p.fiberType.includes('Kevlar') ? '#facc15' : '#e2e8f0';

      for (let y = -0.6; y <= 0.6; y += 0.3) {
        for (let z = -0.2; z <= 0.5; z += 0.35) {
          C3D.drawPipe(g, P, [-1.5, y, z], [1.5, y, z], 0.06, fiberCol, { scene });
        }
      }

      // Modulus Gauge
      C3D.drawVoltmeter(g, P, [0, 0, 1.8], 1.0, Number(state.Ec1) || 116, 250.0, {
        scene,
        label: 'E_LONG (GPA)',
        decimals: 0
      });

      // Tags
      scene.add(P([0, 0, 0.7]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 0.7], `${p.fiberType} Bundles (V_f = ${state.Vf})`, '#10b981', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Continuous ${p.fiberType.split(' ')[0]} Fibers`, color: fiberCol },
        { label: 'Transparent Epoxy Matrix Resin', color: '#38bdf8' },
        { label: `Longitudinal E_c1: ${state.Ec1 || 116} GPa`, color: '#10b981' },
        { label: `Fiber Volume Fraction: ${state.Vf || 0.5}`, color: '#eab308' }
      ], 24, 88);
    }
  };

  window.Chem3DSimulators = Object.assign(window.Chem3DSimulators || {}, Sim3D);
})();
