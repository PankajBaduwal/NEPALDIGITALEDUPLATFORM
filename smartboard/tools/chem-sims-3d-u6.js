'use strict';

/**
 * ChemSims3D-U6 — Unit VI: Virtual Laboratory Experiments (7 Simulations)
 * Complete authentic laboratory virtual procedures:
 *  62. chem-lab-edta (Volumetric EDTA total hardness estimation, buffer pH 10, EBT wine-red to blue endpoint)
 *  63. chem-lab-potentiometric (Potentiometric redox titration, FAS vs K2Cr2O7, SCE + Pt electrode, ΔE/ΔV peak)
 *  64. chem-lab-brass (Estimation of Copper in Brass alloy, HNO3 digestion, KI iodometry, starch indicator, thiosulfate)
 *  65. chem-lab-proximate (Complete authentic proximate analysis lab, digital balance, oven 105°C, furnace 925°C, ash 750°C)
 *  66. chem-lab-viscometer (Ostwald capillary viscometer bath, fiducial marks timing, relative viscosity, Mark-Houwink)
 *  67. chem-lab-chloride (Mohr's argentometric chloride estimation, AgNO3 burette, K2CrO4 indicator, brick-red Ag2CrO4)
 *  68. chem-lab-ph (pH-metric strong acid titration, combined glass electrode, magnetic stirrer, sigmoidal pH curve)
 */
(function () {
  const C3D = window.Chem3D;
  const V = C3D.V;
  const D = window.EPDraw;

  const Sim3D = {};

  const r = (key, label, min, max, step, value, unit) => ({ key, label, type: 'range', min, max, step, default: value, unit: unit || '' });
  const select = (key, label, value, options) => ({ key, label, type: 'select', default: value, options: options.map((x) => ({ label: x, value: x })) });

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 62 — Virtual Lab: EDTA Hardness Estimation (chem-lab-edta)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lab-edta'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('sampleVol', 'Water Sample Aliquot (V_s)', 10, 50, 5, 20, 'mL'),
      r('edtaMolarity', 'Standard EDTA Molarity (M)', 0.005, 0.05, 0.005, 0.01, 'M'),
      r('titreVol', 'Burette Titre Reading (V_edta)', 5.0, 30.0, 0.5, 14.2, 'mL'),
      select('indicatorColor', 'Endpoint Observation', 'Sharp Wine-Red to Steel Blue', ['Initial Water Aliquot', 'Ammonia Buffer pH 10 Added', 'EBT Added: Wine-Red Complex', 'Titrating with EDTA', 'Sharp Wine-Red to Steel Blue'])
    ],
    steps: () => [
      {
        title: 'Pipette Water Sample Aliquot',
        text: 'Pipette accurately 20.0 mL of hard water sample into a clean 250 mL Erlenmeyer conical flask.'
      },
      {
        title: 'Buffer Addition (pH 10.0)',
        text: 'Add 2.0 mL of ammonia buffer (NH₄Cl–NH₄OH) to maintain pH ~10, ensuring stable Ca/Mg-EDTA chelation.'
      },
      {
        title: 'Add Eriochrome Black T (EBT)',
        text: 'Add 2–3 drops of EBT indicator: trace Ca²⁺/Mg²⁺ binds with EBT, forming an unstable wine-red [M-EBT] complex.'
      },
      {
        title: 'Titrate with Standard 0.01 M EDTA',
        text: 'Titrate dropwise from burette with continuous swirling: EDTA selectively chelates free Ca²⁺ and Mg²⁺ as [M-EDTA]²⁻.'
      },
      {
        title: 'Detect Sharp Equivalence Point',
        text: 'At endpoint, EDTA displaces EBT from metal ions; free indicator is liberated, changing color sharply from wine-red to steel blue.'
      },
      {
        title: 'Calculate Total Hardness',
        text: 'Total Hardness (mg/L as CaCO₃) = (V_EDTA × M_EDTA × 100,000) / V_sample. Record concordant titre values.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.sampleVol <= 0) w.push('Sample volume must be positive.');
      return w;
    },
    compute: (p) => {
      const vs = Number(p.sampleVol) || 20;
      const m = Number(p.edtaMolarity) || 0.01;
      const v = Number(p.titreVol) || 14.2;

      const hardnessMgL = ((v * m * 100000) / vs).toFixed(1);
      const isEndpoint = p.indicatorColor.includes('Steel Blue');

      return {
        formulas: [{
          name: 'Total Hardness by Volumetric Titration',
          formula: 'Total Hardness (mg/L CaCO₃) = (V_EDTA × M_EDTA × 100,000) / V_sample',
          given: `V_EDTA = ${v} mL, M = ${m} M, V_sample = ${vs} mL`,
          calc: `(${v} × ${m} × 100,000) / ${vs} = ${hardnessMgL} mg/L`,
          result: `Total Hardness = ${hardnessMgL} mg/L as CaCO₃`,
          unit: 'mg/L'
        }],
        readouts: [
          { label: 'Calculated Hardness', value: `${hardnessMgL} mg/L`, tone: 'green' },
          { label: 'Burette Titre Volume', value: `${v} mL`, tone: 'blue' },
          { label: 'Solution Color', value: isEndpoint ? 'Steel Blue (Endpoint)' : 'Wine-Red Complex', tone: isEndpoint ? 'green' : 'amber' },
          { label: 'Water Quality', value: Number(hardnessMgL) > 300 ? 'Very Hard Water' : 'Moderately Hard', tone: 'blue' }
        ],
        state: { hardnessMgL, v, isEndpoint },
        explain: {
          what: `Volumetric complexometric estimation of water hardness using EDTA and EBT indicator.`,
          why: `EDTA forms a stronger chelate with Ca²⁺ and Mg²⁺ than EBT; at the equivalence point, free indicator turns sharply steel blue.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isEnd = state.isEndpoint;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Titration Stand & Clamp
      C3D.drawBox(g, P, [-0.6, 0, -0.6], [1.2, 1.2, 0.15], '#334155', { scene });
      C3D.drawCylinder(g, P, [-0.6, 0, -0.5], 0.04, 2.6, '#94a3b8', { scene });

      // Burette with Graduations (Delivering EDTA)
      C3D.drawBurette(g, P, [0, 0, 0.4], 0.12, 1.8, 0.65, '#0ea5e9', { scene });

      // Erlenmeyer Conical Flask below burette tip
      const solColor = isEnd ? '#2563eb' : '#9f1239';
      C3D.drawFlask(g, P, [0, 0, -0.5], 0.75, 0.2, 0.9, solColor, 0.45, { scene });

      // Titrant droplet falling
      const dropZ = 0.3 - ((time * 1.5) % 0.5);
      if (dropZ > -0.1) {
        scene.add(P([0, 0, dropZ]).depth, (ctx) => {
          C3D.drawDroplet(ctx, P, [0, 0, dropZ], 0.06, '#38bdf8');
        });
      }

      // Tags
      scene.add(P([0, 0, 1.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.5], `Burette: ${p.titreVol} mL EDTA`, '#0284c7', -22); });
      scene.add(P([0, 0, -0.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, -0.2], isEnd ? 'Steel Blue Endpoint' : 'Wine-Red [M-EBT]', isEnd ? '#1d4ed8' : '#9f1239', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Standard EDTA Titrant (0.01 M)', color: '#0ea5e9' },
        { label: isEnd ? 'Liberated Free EBT (Steel Blue)' : '[M-EBT] Wine-Red Complex', color: solColor },
        { label: `Hardness: ${state.hardnessMgL || 284} mg/L CaCO₃`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 63 — Virtual Lab: Potentiometric Titration (chem-lab-potentiometric)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lab-potentiometric'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('titreAdded', 'K₂Cr₂O₇ Added Volume', 0, 30, 1, 14.5, 'mL'),
      r('fasMolarity', 'FAS (Fe²⁺) Analyte Molarity', 0.05, 0.20, 0.01, 0.10, 'M'),
      r('fasVolume', 'FAS Aliquot Volume', 10, 50, 5, 20, 'mL')
    ],
    steps: () => [
      {
        title: 'Electrode Cell Setup & Analyte Beaker',
        text: 'Pipette 20 mL of Ferrous Ammonium Sulfate (FAS) into a beaker, add 20 mL 2N H₂SO₄, and immerse a saturated calomel reference electrode (SCE) and a platinum indicator electrode.'
      },
      {
        title: 'Magnetic Stirring & Baseline Potential',
        text: 'Switch on the magnetic stirrer; the initial EMF registers ~420 mV vs SCE, governed by the Fe³⁺/Fe²⁺ redox couple ratio.'
      },
      {
        title: 'Burette Delivery of K₂Cr₂O₇ Oxidant',
        text: 'Add standard 0.1 N K₂Cr₂O₇ in 1.0 mL increments: Cr₂O₇²⁻ + 14H⁺ + 6Fe²⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O. EMF rises steadily.'
      },
      {
        title: 'Equivalence Point Potential Leap',
        text: 'At the stoichiometric equivalence point (~14.5 mL), Fe²⁺ is completely consumed; EMF jumps sharply by ~400 mV into the Cr₂O₇²⁻/Cr³⁺ potential regime.'
      },
      {
        title: 'First Derivative Curve (ΔE / ΔV)',
        text: 'Plotting ΔE / ΔV vs average volume produces a sharp narrow peak whose apex accurately defines the equivalence point titre.'
      },
      {
        title: 'Calculate Analyte Strength & Concentration',
        text: 'Normality N₁ = (N₂ × V₂) / V₁. Potentiometric titration eliminates human indicator visual error in turbid or colored solutions.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const v = Number(p.titreAdded) || 14.5;
      const vEq = 14.5;

      // Sigmoidal redox curve
      const emfMv = Math.round(420 + (1 / (1 + Math.exp(-(v - vEq) * 1.5))) * 480);
      const deltaEDeltaV = Math.round(480 * 1.5 * (Math.exp(-(v - vEq) * 1.5) / Math.pow(1 + Math.exp(-(v - vEq) * 1.5), 2)));

      return {
        formulas: [{
          name: 'Nernst Redox Potential & First Derivative',
          formula: 'E = E° + (0.0591/n)·log([Fe³⁺]/[Fe²⁺]) | Equivalence at max(ΔE / ΔV)',
          given: `V_titrant = ${v} mL, V_eq = ${vEq} mL, FAS = ${p.fasMolarity} M`,
          calc: `EMF = ${emfMv} mV vs SCE, ΔE/ΔV = ${deltaEDeltaV} mV/mL`,
          result: `EMF = ${emfMv} mV, Equivalence Titre = ${vEq} mL`,
          unit: 'mV'
        }],
        readouts: [
          { label: 'Cell Potential (EMF)', value: `${emfMv} mV`, tone: emfMv > 700 ? 'green' : 'blue' },
          { label: 'First Derivative (ΔE/ΔV)', value: `${deltaEDeltaV} mV/mL`, tone: deltaEDeltaV > 100 ? 'red' : 'blue' },
          { label: 'Equivalence Titre (V_eq)', value: `${vEq} mL`, tone: 'green' },
          { label: 'Redox State', value: v >= vEq ? 'Complete (Excess Dichromate)' : 'Active Titration', tone: v >= vEq ? 'green' : 'amber' }
        ],
        state: { emfMv, deltaEDeltaV, v },
        explain: {
          what: `Potentiometric redox titration of FAS (Fe²⁺) with K₂Cr₂O₇ using Pt-SCE electrode pair.`,
          why: `Measuring electrode potential directly tracks the Fe³⁺/Fe²⁺ and Cr₂O₇²⁻/Cr³⁺ Nernst equilibrium, yielding a sharp mathematical inflection leap at the endpoint.`
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

      // Magnetic Stirrer Base on Bench
      C3D.drawBox(g, P, [0, 0, -0.6], [1.8, 1.4, 0.4], '#334155', { scene });

      // Beaker on Stirrer containing FAS (Greenish solution)
      C3D.drawBeaker(g, P, [0, 0, -0.4], 0.8, 1.4, '#10b981', 0.55, { scene });

      // Rotating magnetic stir bar inside beaker
      const spinAngle = time * 12;
      C3D.drawBox(g, P, [0, 0, -0.3], [0.35, 0.08, 0.08], '#f8fafc', { scene });

      // Saturated Calomel Electrode (SCE - glass sleeve on left)
      C3D.drawCylinder(g, P, [-0.3, 0, 0.2], 0.07, 1.4, '#f8fafc', { scene, topCap: true });

      // Platinum Indicator Electrode (Shiny foil on right)
      C3D.drawCylinder(g, P, [0.3, 0, 0.2], 0.05, 1.4, '#cbd5e1', { scene, topCap: true });

      // Burette delivering K2Cr2O7 from top
      C3D.drawBurette(g, P, [0, 0, 0.9], 0.1, 1.6, 0.5, '#ea580c', { scene });

      // Digital Millivoltmeter
      C3D.drawVoltmeter(g, P, [-1.6, 0, 1.0], 1.0, (state.emfMv || 420) / 1000, 2.0, {
        scene,
        label: 'EMF (VOLTS VS SCE)',
        decimals: 3
      });

      // Tags
      scene.add(P([-0.3, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.3, 0, 1.0], 'SCE Ref Electrode', '#475569', -22); });
      scene.add(P([0.3, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.3, 0, 1.0], 'Pt Indicator Electrode', '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Saturated Calomel Electrode (SCE Ref)', color: '#f8fafc' },
        { label: 'Platinum Indicator Electrode (Pt)', color: '#cbd5e1' },
        { label: 'K₂Cr₂O₇ Oxidant Burette', color: '#ea580c' },
        { label: `Cell EMF: ${state.emfMv || 420} mV`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 64 — Virtual Lab: Copper in Brass Estimation (chem-lab-brass)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lab-brass'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('stage', 'Experimental Procedure Stage', 'Stage 4: Thiosulfate Titration to Creamy White', ['Stage 1: Brass Dissolution in HNO₃', 'Stage 2: Urea Boiling (Destroy HNO₂)', 'Stage 3: KI Addition (Iodine Liberation)', 'Stage 4: Thiosulfate Titration to Creamy White']),
      r('brassMass', 'Brass Sample Shavings Mass', 0.1, 0.5, 0.05, 0.25, 'g'),
      r('thiosulfateVol', 'Na₂S₂O₃ Titre Volume', 10.0, 35.0, 0.5, 24.5, 'mL')
    ],
    steps: () => [
      {
        title: 'Brass Alloy Dissolution in Nitric Acid',
        text: 'Dissolve 0.25 g brass shavings in 1:1 HNO₃: 3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O. Brown NO₂ fumes evolve; solution turns deep blue.'
      },
      {
        title: 'Urea Treatment to Destroy Nitrous Acid',
        text: 'Add urea and boil: 2HNO₂ + (NH₂)₂CO → 2N₂↑ + CO₂↑ + 3H₂O. Eliminating nitrous acid prevents premature oxidation of iodide.'
      },
      {
        title: 'Neutralization & pH Conditioning',
        text: 'Neutralize with dilute NH₄OH until permanent light-blue Cu(OH)₂ forms; redissolve with dilute acetic acid to maintain buffering at pH 3.5–4.5.'
      },
      {
        title: 'Addition of Excess Potassium Iodide (KI)',
        text: 'Add 10 mL 10% KI: 2Cu²⁺ + 4I⁻ → 2CuI↓ (white precipitate) + I₂ (brown liberated iodine). Liberated iodine is strictly proportional to Cu²⁺.'
      },
      {
        title: 'Titration with Standard Na₂S₂O₃ & Starch',
        text: 'Titrate liberated iodine with 0.1 N Na₂S₂O₃ until straw yellow. Add fresh starch indicator (deep blue-black complex) and continue dropwise.'
      },
      {
        title: 'Detection of Creamy White Endpoint',
        text: 'Endpoint is marked by complete disappearance of blue color, leaving a dense creamy white cuprous iodide (CuI) precipitate: %Cu in Brass = (V × N × 63.55 × 100) / (m × 1000).'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const m = Number(p.brassMass) || 0.25;
      const v = Number(p.thiosulfateVol) || 24.5;
      const N = 0.1; // Normality

      // % Cu = (V * N * 0.06355 / m) * 100
      const cuPercent = Math.min(85, Math.max(50, ((v * N * 0.06355) / m) * 100)).toFixed(1);
      const znPercent = (100 - Number(cuPercent)).toFixed(1);

      return {
        formulas: [{
          name: 'Iodometric Copper Estimation Formula',
          formula: '%Cu in Brass = (V_thio × N_thio × 63.55 × 100) / (Sample_mass × 1000)',
          given: `V_thio = ${v} mL, N = ${N} N, Sample = ${m} g`,
          calc: `(${v} × ${N} × 63.55 × 100) / (${m} × 1000) = ${cuPercent}%`,
          result: `Copper Content = ${cuPercent}%, Zinc (by diff) = ${znPercent}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'Copper Content (%Cu)', value: `${cuPercent}%`, tone: 'green' },
          { label: 'Zinc Content (%Zn)', value: `${znPercent}%`, tone: 'blue' },
          { label: 'Brass Grade', value: Number(cuPercent) > 65 ? '70/30 Alpha Cartridge Brass' : '60/40 Muntz Brass', tone: 'green' },
          { label: 'Endpoint Color', value: 'Creamy White CuI Precipitate', tone: 'green' }
        ],
        state: { cuPercent, znPercent },
        explain: {
          what: `Iodometric estimation of copper in brass alloy at ${p.stage}.`,
          why: `Cu²⁺ oxidizes I⁻ quantitatively to liberate I₂; titration against thiosulfate using starch detects the exact copper content.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isEndpoint = p.stage.includes('Creamy White');
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Titration stand & burette delivering thiosulfate
      C3D.drawBurette(g, P, [0, 0, 0.4], 0.12, 1.8, 0.6, '#f8fafc', { scene });

      // Conical Flask below
      const flaskColor = isEndpoint ? '#f8fafc' : p.stage.includes('Liberation') ? '#78350f' : '#0284c7';
      C3D.drawFlask(g, P, [0, 0, -0.5], 0.75, 0.2, 0.9, flaskColor, 0.5, { scene });

      // Droplets falling
      scene.add(P([0, 0, 0.1]).depth, (ctx) => {
        C3D.drawDroplet(ctx, P, [0, 0, 0.1], 0.05, '#f8fafc');
      });

      // Tags
      scene.add(P([0, 0, 1.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.5], `Na₂S₂O₃ Burette (${p.thiosulfateVol} mL)`, '#0284c7', -22); });
      scene.add(P([0, 0, -0.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, -0.2], isEndpoint ? 'Endpoint: Creamy White CuI' : 'Liberated I₂ (Brown)', isEndpoint ? '#64748b' : '#78350f', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Standard Na₂S₂O₃ Titrant (0.1 N)', color: '#f8fafc' },
        { label: isEndpoint ? 'Creamy White CuI Precipitate' : 'Liberated Iodine Solution', color: flaskColor },
        { label: `Copper Content: ${state.cuPercent || 62.3}%`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 65 — Virtual Lab: Proximate Analysis (chem-lab-proximate)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lab-proximate'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('protocolStep', 'Thermal Procedure Protocol', 'Step 2: Volatile Matter in Muffle (925°C)', ['Step 1: Moisture in Oven (105°C)', 'Step 2: Volatile Matter in Muffle (925°C)', 'Step 3: Ash Incineration (750°C)', 'Step 4: Analytical Calculations Report']),
      r('sampleWt', 'Tared Coal Sample Weight', 0.5, 2.0, 0.1, 1.0, 'g')
    ],
    steps: () => [
      {
        title: 'Analytical Tare & Initial Weighing',
        text: 'Accurately tare a silica crucible on an analytical balance (±0.1 mg) and weigh 1.000 g of air-dried coal sample.'
      },
      {
        title: 'Step 1: Moisture Oven Protocol (105°C, 1 h)',
        text: 'Place uncovered crucible in drying oven at 105–110°C for 60 min. Cool in desiccator for 15 min and weigh: % Moisture = (Loss / Initial) × 100.'
      },
      {
        title: 'Step 2: Volatile Matter Protocol (925°C, 7 min)',
        text: 'Place crucible with tightly fitted lid in muffle furnace at 925 ± 20°C for exactly 7 min. Cool in desiccator: % VM = [(Loss − Moisture) / Initial] × 100.'
      },
      {
        title: 'Step 3: Ash Incineration Protocol (750°C, 30 min)',
        text: 'Heat uncovered crucible in muffle furnace at 750 ± 25°C until all carbon burns off to constant ash residue: % Ash = (Residue / Initial) × 100.'
      },
      {
        title: 'Step 4: Fixed Carbon Computation',
        text: 'Calculate solid combustible carbon: % Fixed Carbon = 100 − (% Moisture + % VM + % Ash).'
      },
      {
        title: 'Quality Assessment & Report',
        text: 'High fixed carbon (>60%) with low ash (<10%) defines high-grade steam and metallurgical coking coal.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const m0 = Number(p.sampleWt) || 1.0;
      const m = 4.2, vm = 29.5, ash = 8.8;
      const fc = (100 - (m + vm + ash)).toFixed(1);

      return {
        formulas: [{
          name: 'ASTM Coal Proximate Balance',
          formula: '%FC = 100 - (%Moisture + %VM + %Ash)',
          given: `Sample = ${m0} g, Protocol = ${p.protocolStep}`,
          calc: `%FC = 100 - (${m} + ${vm} + ${ash}) = ${fc}%`,
          result: `FC = ${fc}%, VM = ${vm}%, Ash = ${ash}%, M = ${m}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'Moisture (%M)', value: `${m}%`, tone: 'blue' },
          { label: 'Volatile Matter (%VM)', value: `${vm}%`, tone: 'amber' },
          { label: 'Ash Residue (%Ash)', value: `${ash}%`, tone: 'amber' },
          { label: 'Fixed Carbon (%FC)', value: `${fc}%`, tone: 'green' }
        ],
        state: { m, vm, ash, fc },
        explain: {
          what: `Standard ASTM proximate thermal evaluation of coal at ${p.protocolStep}.`,
          why: `Rigorous sequence of oven drying, volatile pyrolytic release, and mineral incineration establishes fuel industrial ranking.`
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

      // Digital Analytical Balance on Left
      C3D.drawBox(g, P, [-1.4, 0, -0.4], [1.4, 1.4, 0.5], '#334155', { scene });
      C3D.drawCylinder(g, P, [-1.4, 0, -0.1], 0.45, 0.05, '#cbd5e1', { scene }); // pan

      // Muffle Furnace on Right
      C3D.drawBox(g, P, [1.2, 0, 0.4], [1.8, 1.8, 1.8], '#475569', { scene, stroke: '#ea580c' });
      // Glowing inner chamber
      C3D.drawBox(g, P, [1.2, 0, 0.4], [1.2, 1.2, 1.2], '#ea580c', { scene });

      // Silica Crucible on Balance Pan
      C3D.drawCylinder(g, P, [-1.4, 0, 0.0], 0.35, 0.45, '#f8fafc', { scene });

      // Balance LCD Mass Readout
      C3D.drawVoltmeter(g, P, [-1.4, 0, 1.4], 0.8, p.sampleWt || 1.0, 5.0, {
        scene,
        label: 'MASS (GRAMS)',
        decimals: 4
      });

      // Tags
      scene.add(P([-1.4, 0, 0.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.4, 0, 0.5], 'Silica Crucible + Sample', '#f8fafc', -22); });
      scene.add(P([1.2, 0, 1.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.2, 0, 1.4], 'Muffle Furnace (925°C)', '#ea580c', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Silica Crucible on Balance (±0.1 mg)', color: '#f8fafc' },
        { label: 'High-Temperature Muffle Furnace', color: '#ea580c' },
        { label: `Fixed Carbon Result: ${state.fc || 57.5}%`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 66 — Virtual Lab: Ostwald Viscometer (chem-lab-viscometer)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lab-viscometer'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('testLiquid', 'Liquid Analyte Under Test', 'Glycerol Solution (50%)', ['Distilled Water (Reference, 25°C)', 'Ethanol Pure', 'Glycerol Solution (50%)', 'Castor Oil Solution']),
      r('bathTemp', 'Thermostatic Bath Temperature', 20, 60, 5, 25, '°C'),
      r('effluxTime', 'Efflux Flow Time (t)', 20, 250, 5, 85, 's')
    ],
    steps: () => [
      {
        title: 'Thermostatic Bath Assembly & Viscometer Mounting',
        text: 'The glass Ostwald viscometer is vertically clamped inside a transparent constant-temperature water bath (25.0 ± 0.1°C).'
      },
      {
        title: 'Charging Liquid into Receiving Bulb',
        text: 'Pipette accurately 10.0 mL of liquid into the wider receiving limb of the viscometer, allowing 10 min for thermal equilibration.'
      },
      {
        title: 'Suction Above Upper Fiducial Mark (X)',
        text: 'Using a rubber suction bulb, draw the liquid meniscus up through the narrow capillary into the upper measuring bulb above mark X.'
      },
      {
        title: 'Timing Meniscus Descent (Mark X to Y)',
        text: 'Release suction: start the digital stopwatch as the meniscus passes upper mark X, and stop precisely as it crosses lower mark Y.'
      },
      {
        title: 'Relative Viscosity Calculation',
        text: 'By Poiseuille’s law: η₁ / η₀ = (ρ₁ · t₁) / (ρ₀ · t₀). Calculate dynamic viscosity η₁ in mPa·s using density measured with a pycnometer.'
      },
      {
        title: 'Polymer Molecular Weight (Mark-Houwink)',
        text: 'For polymer solutions, intrinsic viscosity [η] yields viscosity-average molecular weight via Mark-Houwink equation: [η] = K · M_v^a.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const t = Number(p.effluxTime) || 85;
      const t0 = 25.0; // water efflux time seconds
      const rho0 = 0.997; // water g/cm3
      const eta0 = 0.890; // water mPa.s at 25°C

      const rho1 = p.testLiquid.includes('Glycerol') ? 1.13 : p.testLiquid.includes('Ethanol') ? 0.789 : 0.96;
      const relVisc = ((rho1 * t) / (rho0 * t0)).toFixed(2);
      const absVisc = (eta0 * Number(relVisc)).toFixed(2);

      return {
        formulas: [{
          name: 'Ostwald Relative Viscosity Formulation',
          formula: 'η₁ / η₀ = (ρ₁ × t₁) / (ρ₀ × t₀) | Poiseuille: η = (π·r⁴·P·t) / (8·V·L)',
          given: `Liquid = ${p.testLiquid}, t₁ = ${t} s, t₀ = ${t0} s, ρ₁ = ${rho1} g/cm³`,
          calc: `η_rel = (${rho1} × ${t}) / (${rho0} × ${t0}) = ${relVisc}`,
          result: `Relative Viscosity = ${relVisc}, Dynamic Viscosity = ${absVisc} mPa·s (cP)`,
          unit: 'mPa·s'
        }],
        readouts: [
          { label: 'Dynamic Viscosity (η₁)', value: `${absVisc} mPa·s`, tone: 'green' },
          { label: 'Relative Viscosity (η_rel)', value: `${relVisc}`, tone: 'blue' },
          { label: 'Efflux Flow Time', value: `${t} s`, tone: 'blue' },
          { label: 'Bath Temperature', value: `${p.bathTemp}°C (Thermostatic)`, tone: 'green' }
        ],
        state: { absVisc, relVisc, t },
        explain: {
          what: `Viscosity determination of ${p.testLiquid} using Ostwald viscometer.`,
          why: `Gravity head drives liquid through the precision glass capillary; efflux time between marks is directly proportional to kinematic viscosity.`
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

      // Water Bath Glass Tank (Center)
      C3D.drawBox(g, P, [0, 0, 0.4], [2.4, 1.8, 2.2], 'rgba(56, 189, 248, 0.35)', { scene, stroke: '#0284c7' });

      // Ostwald Viscometer U-Tube (Glass limbs inside bath)
      // Left limb with measuring bulb
      C3D.drawPipe(g, P, [-0.4, 0, -0.4], [-0.4, 0, 1.2], 0.06, '#f8fafc', { scene });
      C3D.drawCylinder(g, P, [-0.4, 0, 0.5], 0.22, 0.4, 'rgba(16, 185, 129, 0.5)', { scene, topCap: true }); // upper bulb

      // Bottom U-bend connecting limbs
      C3D.drawPipe(g, P, [-0.4, 0, -0.4], [0.4, 0, -0.4], 0.06, '#f8fafc', { scene });

      // Right receiving limb with lower storage bulb
      C3D.drawPipe(g, P, [0.4, 0, -0.4], [0.4, 0, 1.2], 0.08, '#f8fafc', { scene });
      C3D.drawCylinder(g, P, [0.4, 0, -0.1], 0.28, 0.5, 'rgba(16, 185, 129, 0.5)', { scene, topCap: true }); // lower bulb

      // Stopwatch Display on Bench
      C3D.drawVoltmeter(g, P, [-1.6, 0, 1.0], 1.0, p.effluxTime || 85, 200.0, {
        scene,
        label: 'STOPWATCH (S)',
        decimals: 1
      });

      // Tags
      scene.add(P([-0.4, 0, 0.7]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.4, 0, 0.7], 'Mark X (Start Timing)', '#10b981', -22); });
      scene.add(P([-0.4, 0, 0.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.4, 0, 0.3], 'Mark Y (Stop Timing)', '#ef4444', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Thermostatic Water Bath Tank', color: '#38bdf8' },
        { label: 'Ostwald Capillary Viscometer', color: '#f8fafc' },
        { label: `Viscosity: ${state.absVisc || 3.0} mPa·s`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 67 — Virtual Lab: Chloride Estimation (chem-lab-chloride)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lab-chloride'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('waterSampleVol', 'Water Sample Aliquot', 20, 100, 10, 50, 'mL'),
      r('agMolarity', 'AgNO₃ Titrant Normality', 0.01, 0.05, 0.005, 0.02, 'N'),
      r('titreVol', 'AgNO₃ Titre Volume (V)', 2.0, 25.0, 0.5, 9.8, 'mL'),
      select('stage', 'Precipitation Reaction Stage', 'Brick-Red Ag₂CrO₄ Endpoint', ['Lemon-Yellow Water Aliquot + K₂CrO₄', 'Curdy White AgCl Precipitation', 'Brick-Red Ag₂CrO₄ Endpoint'])
    ],
    steps: () => [
      {
        title: 'Sample Preparation & pH Neutralization',
        text: 'Pipette accurately 50.0 mL of water sample into a conical flask. Adjust pH to 7.0–8.0 with dilute HNO₃ or NaHCO₃ (Mohr method is invalid in acid or strong alkali).'
      },
      {
        title: 'Add Potassium Chromate (K₂CrO₄) Indicator',
        text: 'Add 1.0 mL of 5% K₂CrO₄ indicator solution, imparting a clear lemon-yellow color.'
      },
      {
        title: 'Titrate with Standard 0.02 N AgNO₃',
        text: 'Titrate dropwise from burette with vigorous swirling: Ag⁺ + Cl⁻ → AgCl↓ (dense, curdy white precipitate, K_sp = 1.8 × 10⁻¹⁰).'
      },
      {
        title: 'Fractional Precipitation Principle',
        text: 'Because AgCl is less soluble than silver chromate, all chloride precipitating white AgCl occurs before chromate can react.'
      },
      {
        title: 'Detect Brick-Red Ag₂CrO₄ Endpoint',
        text: 'Once all Cl⁻ is consumed, the very first excess drop of Ag⁺ reacts with chromate indicator: 2Ag⁺ + CrO₄²⁻ → Ag₂CrO₄↓ (brick-red precipitate).'
      },
      {
        title: 'Calculate Chloride Concentration',
        text: 'Chloride (mg/L) = [(V − V_blank) × N × 35,450] / V_sample. Compare with WHO drinking water guideline (250 mg/L).'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const vs = Number(p.waterSampleVol) || 50;
      const n = Number(p.agMolarity) || 0.02;
      const v = Number(p.titreVol) || 9.8;

      const clMgL = ((v * n * 35450) / vs).toFixed(1);
      const isEndpoint = p.stage.includes('Brick-Red');

      return {
        formulas: [{
          name: 'Mohr Argentometric Chloride Formulation',
          formula: 'Chloride (mg/L Cl⁻) = (V_AgNO₃ × N_AgNO₃ × 35,450) / V_sample',
          given: `V = ${v} mL, N = ${n} N, V_sample = ${vs} mL`,
          calc: `(${v} × ${n} × 35,450) / ${vs} = ${clMgL} mg/L`,
          result: `Chloride Content = ${clMgL} mg/L Cl⁻`,
          unit: 'mg/L'
        }],
        readouts: [
          { label: 'Chloride Concentration', value: `${clMgL} mg/L`, tone: 'green' },
          { label: 'AgNO₃ Titre Volume', value: `${v} mL`, tone: 'blue' },
          { label: 'Precipitate Color', value: isEndpoint ? 'Brick-Red Ag₂CrO₄' : 'Curdy White AgCl', tone: isEndpoint ? 'green' : 'amber' },
          { label: 'Drinking Water Limit', value: Number(clMgL) < 250 ? 'Compliant (<250 mg/L)' : 'Exceeds Guideline', tone: Number(clMgL) < 250 ? 'green' : 'amber' }
        ],
        state: { clMgL, v, isEndpoint },
        explain: {
          what: `Mohr argentometric determination of chloride in water at ${p.stage}.`,
          why: `Differential solubility allows white AgCl to precipitate first; at equivalence, excess silver produces distinct brick-red Ag₂CrO₄.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isEnd = state.isEndpoint;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Burette with AgNO3 (Amber/dark burette to shield silver from light)
      C3D.drawBurette(g, P, [0, 0, 0.4], 0.12, 1.8, 0.65, '#78350f', { scene });

      // Flask below containing precipitate
      const solCol = isEnd ? '#b91c1c' : '#fef08a';
      C3D.drawFlask(g, P, [0, 0, -0.5], 0.75, 0.2, 0.9, solCol, 0.5, { scene });

      // White AgCl curdy precipitate particles inside flask
      for (let i = 0; i < 6; i++) {
        const px = -0.2 + (i % 3) * 0.2;
        const pz = -0.4 + (i > 2 ? 0.15 : 0);
        const posPpt = [px, 0, pz];
        scene.add(P(posPpt).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posPpt, 0.05, isEnd ? '#b91c1c' : '#ffffff', '', '');
        });
      }

      // Tags
      scene.add(P([0, 0, 1.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.5], `AgNO₃ (${p.titreVol} mL)`, '#78350f', -22); });
      scene.add(P([0, 0, -0.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, -0.2], isEnd ? 'Brick-Red Ag₂CrO₄ Endpoint' : 'Curdy White AgCl + Yellow', isEnd ? '#b91c1c' : '#ca8a04', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Standard AgNO₃ Titrant (0.02 N)', color: '#78350f' },
        { label: isEnd ? 'Brick-Red Ag₂CrO₄ Endpoint' : 'White AgCl Curd + K₂CrO₄ Yellow', color: solCol },
        { label: `Chloride Content: ${state.clMgL || 139} mg/L`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 68 — Virtual Lab: pH Metric Strong Acid Titration (chem-lab-ph)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lab-ph'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('naohAdded', '0.1 N NaOH Volume Added', 0, 30, 1, 19.8, 'mL'),
      r('hclVolume', '0.1 N HCl Aliquot Volume', 10, 50, 5, 20, 'mL'),
      r('hclNormality', 'Standard HCl Normality', 0.05, 0.20, 0.01, 0.10, 'N')
    ],
    steps: () => [
      {
        title: 'Calibrate pH Meter with Buffer Solutions',
        text: 'Calibrate the combined glass reference electrode using standard buffers (pH 4.00, 7.00, and 9.20) before sample measurement.'
      },
      {
        title: 'Pipette HCl Analyte into Beaker',
        text: 'Pipette 20.0 mL of standardized 0.1 N HCl into a 150 mL beaker, dilute with distilled water to submerge electrode bulb, and set on magnetic stirrer.'
      },
      {
        title: 'Initial Highly Acidic Reading (pH ~1.0)',
        text: 'Switch on stirrer: initial reading is pH 1.00, corresponding to complete ionization of strong acid: [H⁺] = 0.1 M, pH = −log[H⁺].'
      },
      {
        title: 'Dropwise Addition of 0.1 N NaOH',
        text: 'Deliver standardized 0.1 N NaOH from burette in 1.0 mL increments (0.2 mL near equivalence): H⁺ + OH⁻ → H₂O. pH rises slowly along buffer plateau.'
      },
      {
        title: 'Vertical Sigmoidal Inflection Leap (pH 3.5 to 10.5)',
        text: 'At equivalence (20.0 mL), the addition of a single drop causes pH to leap from 3.5 to 10.5, passing precisely through neutral pH 7.00.'
      },
      {
        title: 'Differential Curve Analysis (ΔpH / ΔV)',
        text: 'Plotting ΔpH / ΔV vs V yields a distinct sharp peak, accurately pinpointing the stoichiometric neutralization volume.'
      }
    ],
    validate: (p) => [],
    compute: (p) => {
      const v = Number(p.naohAdded) || 19.8;
      const vEq = 20.0;

      // Sigmoidal neutralization curve
      let ph = 1.0;
      if (v < vEq) {
        ph = 1.0 + (v / vEq) * 1.5;
        if (v >= vEq - 1.0) ph = 3.5 + ((v - (vEq - 1.0)) / 1.0) * 3.5;
      } else if (Math.abs(v - vEq) < 0.1) {
        ph = 7.00;
      } else {
        ph = 10.5 + Math.min(2.0, ((v - vEq) / 10) * 1.5);
      }

      const deltaPhDeltaV = Math.abs(v - vEq) < 0.5 ? 24.5 : Math.abs(v - vEq) < 1.5 ? 6.2 : 0.8;

      return {
        formulas: [{
          name: 'Neutralization Stoichiometry & pH Model',
          formula: 'pH = -log[H⁺] | At Equivalence Point: pH = 7.00 (Neutralization)',
          given: `V_NaOH = ${v} mL, V_eq = ${vEq} mL, HCl = ${p.hclNormality} N`,
          calc: `Current pH = ${ph.toFixed(2)}, ΔpH/ΔV = ${deltaPhDeltaV.toFixed(1)}`,
          result: `pH = ${ph.toFixed(2)}, Equivalence Titre = ${vEq} mL`,
          unit: 'pH'
        }],
        readouts: [
          { label: 'Digital pH Reading', value: `${ph.toFixed(2)}`, tone: Math.abs(ph - 7) < 1 ? 'green' : ph < 7 ? 'amber' : 'blue' },
          { label: 'Differential Peak (ΔpH/ΔV)', value: `${deltaPhDeltaV.toFixed(1)}`, tone: deltaPhDeltaV > 10 ? 'red' : 'blue' },
          { label: 'Equivalence Titre (V_eq)', value: `${vEq} mL`, tone: 'green' },
          { label: 'Solution Regime', value: ph < 6.5 ? 'Acidic' : ph > 7.5 ? 'Alkaline' : 'Neutral (Inflection)', tone: Math.abs(ph - 7) < 1 ? 'green' : 'blue' }
        ],
        state: { ph, deltaPhDeltaV, v },
        explain: {
          what: `pH-metric strong acid-strong base titration of HCl with NaOH.`,
          why: `Tracking hydronium ion concentration directly with a glass electrode maps the classic sigmoidal neutralization curve and inflection at pH 7.00.`
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

      // Magnetic Stirrer Base
      C3D.drawBox(g, P, [0, 0, -0.6], [1.8, 1.4, 0.4], '#334155', { scene });

      // Beaker on Stirrer containing HCl
      C3D.drawBeaker(g, P, [0, 0, -0.4], 0.8, 1.4, '#38bdf8', 0.5, { scene });

      // Magnetic stir bar spinning
      C3D.drawBox(g, P, [0, 0, -0.3], [0.35, 0.08, 0.08], '#f8fafc', { scene });

      // Combined Glass pH Electrode immersed in beaker
      C3D.drawCylinder(g, P, [0.25, 0, 0.2], 0.07, 1.4, '#f8fafc', { scene, topCap: true });
      scene.add(P([0.25, 0, -0.2]).depth, (ctx) => { C3D.drawAtom(ctx, P, [0.25, 0, -0.2], 0.08, '#38bdf8', '', ''); }); // glass sensing bulb

      // Burette delivering NaOH from top
      C3D.drawBurette(g, P, [-0.25, 0, 0.9], 0.1, 1.6, 0.55, '#f8fafc', { scene });

      // Digital pH Meter on Left
      C3D.drawVoltmeter(g, P, [-1.6, 0, 1.0], 1.0, state.ph || 7.0, 14.0, {
        scene,
        label: 'DIGITAL PH',
        decimals: 2
      });

      // Tags
      scene.add(P([0.25, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.25, 0, 1.0], 'Combined pH Electrode', '#0284c7', -22); });
      scene.add(P([-0.25, 0, 1.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.25, 0, 1.4], `0.1 N NaOH (${p.naohAdded} mL)`, '#475569', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Combined Glass pH Electrode', color: '#f8fafc' },
        { label: 'Standard 0.1 N NaOH Burette', color: '#64748b' },
        { label: `Live pH: ${(state.ph || 7.0).toFixed(2)}`, color: '#10b981' }
      ], 24, 88);
    }
  };

  window.Chem3DSimulators = Object.assign(window.Chem3DSimulators || {}, Sim3D);
})();
