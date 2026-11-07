'use strict';

/**
 * ChemSims3D-U4 — Unit IV: Fuels, Combustion, Calorimetry, and Emissions (13 Simulations)
 * Complete interactive 3D virtual experiments:
 *  35. chem-proximate-analysis (ASTM D3172 Proximate analysis: Moisture 105°C, VM 925°C, Ash 750°C, Fixed Carbon)
 *  36. chem-coal-analysis (ASTM D3176 Ultimate analysis: Liebig combustion train C, H, Kjeldahl N, Eschka S)
 *  37. chem-bergius (Bergius coal hydrogenation autoclave, high-pressure H2, fractionating column to synthetic petrol)
 *  38. chem-octane (Octane number rating bench, iso-octane vs n-heptane, CFR engine compression knock meter)
 *  39. chem-cetane (Cetane number diesel test, hexadecane vs α-methylnaphthalene, ignition delay milliseconds)
 *  40. chem-knocking (IC engine cutaway: normal laminar flame front vs explosive end-gas auto-ignition shockwave)
 *  41. chem-antiknock (Antiknock additives TEL / MTBE, peroxy radical scavenging, compression boost)
 *  42. chem-cng-lpg (Clean gaseous fuels rig: CNG 200 bar CH4 vs LPG liquid phase C3H8/C4H10, flame properties)
 *  43. chem-calorific-value (Dulong formula combustion calorimeter, HCV vs LCV latent heat of condensation)
 *  44. chem-bomb-calorimeter (ASTM D240 explosive bomb calorimeter, Beckmann thermometer ΔT, motorized stirrer)
 *  45. chem-orsat (Flue gas Orsat apparatus: KOH for CO2, pyrogallol for O2, Cu2Cl2 for CO, N2 by difference)
 *  46. chem-three-way-catalyst (Ceramic honeycomb monolith TWC: Pt/Pd oxidation + Rh reduction, lambda window)
 *  47. chem-scr-nox (Selective Catalytic Reduction: AdBlue urea spray, V2O5-TiO2 catalyst, NOx reduction to N2 + H2O)
 */
(function () {
  const C3D = window.Chem3D;
  const V = C3D.V;
  const D = window.EPDraw;

  const Sim3D = {};

  const r = (key, label, min, max, step, value, unit) => ({ key, label, type: 'range', min, max, step, default: value, unit: unit || '' });
  const select = (key, label, value, options) => ({ key, label, type: 'select', default: value, options: options.map((x) => ({ label: x, value: x })) });

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 35 — Proximate Analysis of Coal (chem-proximate-analysis)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-proximate-analysis'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('stage', 'Analytical Stage', '1. Moisture (105°C)', ['1. Moisture (105°C)', '2. Volatile Matter (925°C)', '3. Ash Residue (750°C)', '4. Fixed Carbon (By Difference)']),
      select('coalRank', 'Coal Specimen Rank', 'Bituminous Coal', ['Anthracite Coal', 'Bituminous Coal', 'Sub-Bituminous Coal', 'Lignite (Brown Coal)']),
      r('sampleMass', 'Initial Coal Mass', 0.5, 2.0, 0.1, 1.0, 'g')
    ],
    steps: () => [
      {
        title: 'Analytical Weighing of Air-Dried Coal',
        text: 'Accurately weigh 1.000 g of finely powdered (-72 mesh) coal sample into a pre-ignited, tared silica crucible using an analytical balance.'
      },
      {
        title: 'Moisture Determination (105–110°C, 1 Hour)',
        text: 'Crucible without lid is heated in an electric drying oven at 105–110°C for 1 h, cooled in a desiccator, and reweighed: % Moisture = (Loss in weight / Sample wt) × 100.'
      },
      {
        title: 'Volatile Matter Determination (925 ± 20°C, 7 Minutes)',
        text: 'Fresh sample in covered crucible with tight lid is heated in muffle furnace at 925°C for exactly 7 min: % VM = [(Loss in wt − Moisture wt) / Sample wt] × 100.'
      },
      {
        title: 'Ash Determination (750 ± 25°C, 30 Minutes)',
        text: 'Crucible without lid is incinerated at 750°C until all combustible carbon burns off to constant mineral weight: % Ash = (Residue wt / Sample wt) × 100.'
      },
      {
        title: 'Fixed Carbon by Difference',
        text: 'Fixed carbon represents combustible carbon remaining after volatile expulsion: % Fixed Carbon = 100 − (% Moisture + % VM + % Ash).'
      },
      {
        title: 'Fuel Quality & Rank Significance',
        text: 'High fixed carbon and low moisture/ash indicate superior fuel calorific value and low transportation/disposal costs.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.sampleMass <= 0) w.push('Sample mass must be positive.');
      return w;
    },
    compute: (p) => {
      const ranks = {
        'Anthracite Coal': { m: 2.5, vm: 8.5, ash: 6.0, fc: 83.0 },
        'Bituminous Coal': { m: 4.5, vm: 28.0, ash: 9.5, fc: 58.0 },
        'Sub-Bituminous Coal': { m: 12.0, vm: 35.0, ash: 11.0, fc: 42.0 },
        'Lignite (Brown Coal)': { m: 22.0, vm: 42.0, ash: 14.0, fc: 22.0 }
      };

      const c = ranks[p.coalRank] || ranks['Bituminous Coal'];
      const m0 = Number(p.sampleMass) || 1.0;
      const mLossM = (m0 * c.m / 100).toFixed(4);
      const mLossVM = (m0 * c.vm / 100).toFixed(4);
      const mAsh = (m0 * c.ash / 100).toFixed(4);

      return {
        formulas: [{
          name: 'ASTM D3172 Proximate Analysis Fractions',
          formula: '%FC = 100 - (%Moisture + %VM + %Ash)',
          given: `Coal = ${p.coalRank}, Initial Mass = ${m0} g`,
          calc: `%FC = 100 - (${c.m} + ${c.vm} + ${c.ash}) = ${c.fc}%`,
          result: `FC = ${c.fc}%, VM = ${c.vm}%, Ash = ${c.ash}%, M = ${c.m}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'Moisture (%M)', value: `${c.m}% (${mLossM} g)`, tone: 'blue' },
          { label: 'Volatile Matter (%VM)', value: `${c.vm}% (${mLossVM} g)`, tone: 'amber' },
          { label: 'Ash Residue (%Ash)', value: `${c.ash}% (${mAsh} g)`, tone: 'amber' },
          { label: 'Fixed Carbon (%FC)', value: `${c.fc}%`, tone: 'green' }
        ],
        state: { c, m0 },
        explain: {
          what: `Standard proximate analysis of ${p.coalRank} at ${p.stage}.`,
          why: `Determines moisture, gaseous hydrocarbons (VM), non-combustible inorganics (ash), and solid combustible carbon (FC).`
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

      // Laboratory Muffle Furnace (Left side)
      C3D.drawBox(g, P, [-1.4, 0, 0.4], [1.8, 1.8, 1.8], '#334155', { scene, stroke: '#ea580c' });
      // Glowing inner chamber
      C3D.drawBox(g, P, [-1.4, 0, 0.4], [1.2, 1.2, 1.2], p.stage.includes('Ash') ? '#ea580c' : p.stage.includes('VM') ? '#dc2626' : '#f97316', { scene });

      // Silica Crucible (Center-Right on desiccator/bench)
      C3D.drawCylinder(g, P, [1.2, 0, -0.4], 0.45, 0.6, '#f8fafc', { scene, topCap: false });

      // Powdered Coal Sample inside crucible (Black bed)
      const isAsh = p.stage.includes('Ash');
      C3D.drawCylinder(g, P, [1.2, 0, -0.3], 0.4, 0.2, isAsh ? '#cbd5e1' : '#0f172a', { scene, topCap: true });

      // Analytical Balance Display
      C3D.drawVoltmeter(g, P, [0, 0, 2.0], 1.0, state.c ? state.c.fc : 58.0, 100.0, {
        scene,
        label: 'FIXED CARBON %',
        decimals: 1
      });

      // Tags
      scene.add(P([-1.4, 0, 1.4]).depth, (ctx) => {
        const tempText = p.stage.includes('Moisture') ? '105°C Drying Oven' : p.stage.includes('VM') ? '925°C VM Furnace' : '750°C Ash Furnace';
        C3D.drawTag(ctx, P, [-1.4, 0, 1.4], tempText, '#ea580c', -22);
      });
      scene.add(P([1.2, 0, 0.4]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [1.2, 0, 0.4], `Silica Crucible (${isAsh ? 'Ash Residue' : 'Coal Sample'})`, '#475569', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Coal Rank: ${p.coalRank}`, color: '#0f172a' },
        { label: `Stage: ${p.stage.split(' ')[1]}`, color: '#ea580c' },
        { label: 'Silica Crucible Vessel', color: '#f8fafc' },
        { label: isAsh ? 'Inorganic Ash Residue' : 'Solid Fixed Carbon', color: isAsh ? '#cbd5e1' : '#1e293b' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 36 — Ultimate Coal Analysis (chem-coal-analysis)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-coal-analysis'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('element', 'Target Element Analysis', 'Carbon & Hydrogen (Liebig Train)', ['Carbon & Hydrogen (Liebig Train)', 'Nitrogen (Kjeldahl Method)', 'Sulfur (Eschka Gravimetric)', 'Oxygen (By Difference)']),
      r('coalSample', 'Sample Mass', 0.1, 1.0, 0.05, 0.2, 'g'),
      r('o2Flow', 'Oxygen Flow Rate', 50, 200, 25, 100, 'mL/min')
    ],
    steps: () => [
      {
        title: 'Liebig Combustion Train Setup',
        text: 'A weighed coal sample (0.2 g) in a quartz boat is burned in a pure oxygen stream inside an electric combustion tube heated to 800–900°C.'
      },
      {
        title: 'Carbon Conversion to CO₂ & Absorption',
        text: 'Carbon burns to CO₂: C + O₂ → CO₂. Exiting gas passes through pre-weighed U-tubes containing 30% KOH solution: %C = (12/44) × (Δm_KOH / m_sample) × 100.'
      },
      {
        title: 'Hydrogen Conversion to H₂O & Absorption',
        text: 'Hydrogen burns to water: 2H + ½O₂ → H₂O. Steam is absorbed in pre-weighed anhydrous CaCl₂ U-tubes: %H = (2/18) × (Δm_CaCl₂ / m_sample) × 100.'
      },
      {
        title: 'Kjeldahl Digestion for Nitrogen',
        text: 'Coal digested in conc. H₂SO₄ with K₂SO₄/CuSO₄ converts N to (NH₄)₂SO₄. Distillation with excess NaOH liberates NH₃, titrated against standard acid.'
      },
      {
        title: 'Eschka Method for Sulfur',
        text: 'Coal ignited with Eschka mixture (2 MgO : 1 Na₂CO₃) oxidizes S to soluble sulfates, precipitated as BaSO₄: %S = (32/233) × (m_BaSO₄ / m_sample) × 100.'
      },
      {
        title: 'Oxygen Determination by Difference',
        text: '% Oxygen = 100 − (%C + %H + %N + %S + %Ash). High oxygen decreases fuel calorific value due to bonded hydrogen.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.coalSample <= 0) w.push('Sample mass must be positive.');
      return w;
    },
    compute: (p) => {
      const m0 = Number(p.coalSample) || 0.2;
      // Typical bituminous coal ultimate analysis
      const C = 78.5, H = 5.2, N = 1.4, S = 0.8, Ash = 7.5;
      const O = (100 - (C + H + N + S + Ash)).toFixed(1);

      const mCO2 = (m0 * (C / 100) * (44 / 12)).toFixed(3);
      const mH2O = (m0 * (H / 100) * (18 / 2)).toFixed(3);

      return {
        formulas: [{
          name: 'Liebig Combustion Stoichiometry',
          formula: '%C = (12/44) × (m_CO₂/m) × 100 | %H = (2/18) × (m_H₂O/m) × 100',
          given: `Sample = ${m0} g, m_CO₂ = ${mCO2} g, m_H₂O = ${mH2O} g`,
          calc: `%C = (12/44) × (${mCO2}/${m0}) × 100 = ${C}%`,
          result: `C = ${C}%, H = ${H}%, N = ${N}%, S = ${S}%, O = ${O}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'Carbon (%C)', value: `${C}% (m_CO₂ = ${mCO2} g)`, tone: 'green' },
          { label: 'Hydrogen (%H)', value: `${H}% (m_H₂O = ${mH2O} g)`, tone: 'blue' },
          { label: 'Nitrogen & Sulfur', value: `N: ${N}% | S: ${S}%`, tone: 'amber' },
          { label: 'Oxygen (%O by diff)', value: `${O}%`, tone: 'blue' }
        ],
        state: { C, H, N, S, O, mCO2, mH2O },
        explain: {
          what: `Ultimate elemental analysis of coal using Liebig combustion train.`,
          why: `Accurate determination of C, H, N, S, O enables exact combustion stoichiometry, air requirements, and calorific value calculations.`
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

      // Combustion Tube Electric Furnace (Center-Left)
      C3D.drawBox(g, P, [-0.8, 0, 0.4], [2.2, 0.9, 0.9], '#334155', { scene, stroke: '#ea580c' });

      // Quartz Combustion Tube passing through furnace
      C3D.drawPipe(g, P, [-2.2, 0, 0.4], [0.8, 0, 0.4], 0.12, 'rgba(248, 250, 252, 0.7)', { scene });

      // U-tube 1: Anhydrous CaCl2 (H2O absorption)
      C3D.drawPipe(g, P, [1.0, 0, 0.4], [1.0, 0, 1.1], 0.08, '#fef08a', { scene });
      C3D.drawPipe(g, P, [1.0, 0, 1.1], [1.4, 0, 1.1], 0.08, '#fef08a', { scene });
      C3D.drawPipe(g, P, [1.4, 0, 1.1], [1.4, 0, 0.4], 0.08, '#fef08a', { scene });

      // U-tube 2: KOH solution (CO2 absorption)
      C3D.drawPipe(g, P, [1.6, 0, 0.4], [1.6, 0, 1.1], 0.08, '#38bdf8', { scene });
      C3D.drawPipe(g, P, [1.6, 0, 1.1], [2.0, 0, 1.1], 0.08, '#38bdf8', { scene });
      C3D.drawPipe(g, P, [2.0, 0, 1.1], [2.0, 0, 0.4], 0.08, '#38bdf8', { scene });

      // Tags
      scene.add(P([-0.8, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.8, 0, 1.0], 'Combustion Tube (850°C)', '#ea580c', -22); });
      scene.add(P([1.2, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.2, 0, 1.3], 'CaCl₂ Tube (H₂O)', '#ca8a04', -22); });
      scene.add(P([1.8, 0, 1.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.8, 0, 1.3], 'KOH Tube (CO₂)', '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Combustion Furnace (850°C)', color: '#ea580c' },
        { label: 'CaCl₂ U-Tube (%H as H₂O)', color: '#fef08a' },
        { label: 'KOH U-Tube (%C as CO₂)', color: '#38bdf8' },
        { label: 'Pure O₂ Feed Gas', color: '#ef4444', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 37 — Bergius Process Simulator (chem-bergius)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-bergius'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('pressureBar', 'H₂ Operating Pressure', 100, 300, 25, 220, 'bar'),
      r('temp', 'Reactor Temperature', 400, 500, 10, 450, '°C'),
      select('catalyst', 'Hydrogenation Catalyst', 'Iron Oxide / Tin Oxalate', ['Iron Oxide / Tin Oxalate', 'Molybdenum Sulfide (MoS₂)', 'Nickel Catalyst']),
      r('h2Ratio', 'H₂-to-Coal Ratio', 5, 20, 1, 10, '% wt')
    ],
    steps: () => [
      {
        title: 'Coal Slurry Paste Preparation',
        text: 'Finely ground low-ash coal is slurried with recycle heavy oil (1:1 ratio) and 0.1% iron oxide/tin oxalate catalyst into a pumpable paste.'
      },
      {
        title: 'High-Pressure Hydrogen Injection',
        text: 'The slurry is compressed to 200–250 bar with preheated hydrogen gas and fed into the heavy-walled vertical converter reactor.'
      },
      {
        title: 'Direct Hydrogenation & Hydrocracking',
        text: 'At 450–480°C, giant aromatic macromolecular clusters in coal are hydrocracked; hydrogen saturates free radicals, preventing char coke formation.'
      },
      {
        title: 'Phase Separation & Gas Recovery',
        text: 'Effluent enters a hot catch-pot separator: unreacted heavy residue oil settles, while light hydrocarbon vapors exit overhead.'
      },
      {
        title: 'Fractionating Distillation Column',
        text: 'Vapors are separated into light synthetic petrol (boiling < 200°C), middle oil (diesel fuel, 200–325°C), and heavy oil recycled to slurry.'
      },
      {
        title: 'Synthetic Petrol Yield & Octane Quality',
        text: 'Approximately 60% of coal mass is converted into high-octane synthetic aviation/motor petrol, vital for chemical self-reliance.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.pressureBar < 150) w.push('Low hydrogen pressure causes coking and rapid catalyst deactivation.');
      return w;
    },
    compute: (p) => {
      const P_bar = Number(p.pressureBar) || 220;
      const T = Number(p.temp) || 450;

      const petrolYield = Math.min(68, 45 + (P_bar / 250) * 15 + ((T - 400) / 100) * 8).toFixed(1);
      const middleYield = (30 - (petrolYield - 50) * 0.4).toFixed(1);
      const residueYield = (100 - Number(petrolYield) - Number(middleYield)).toFixed(1);

      return {
        formulas: [{
          name: 'Bergius Hydrocracking Mass Balance',
          formula: 'Coal + H₂ (200-250 bar, 450°C) → Synthetic Petrol + Middle Oil + Heavy Recycle',
          given: `P = ${P_bar} bar, T = ${T}°C, Catalyst = ${p.catalyst}`,
          calc: `Conversion = ${petrolYield}% Light Petrol, ${middleYield}% Middle Oil`,
          result: `Synthetic Petrol Yield = ${petrolYield}% wt`,
          unit: '%'
        }],
        readouts: [
          { label: 'Synthetic Petrol Yield', value: `${petrolYield}% wt`, tone: 'green' },
          { label: 'Middle Diesel Oil', value: `${middleYield}% wt`, tone: 'blue' },
          { label: 'Heavy Residue Recycle', value: `${residueYield}% wt`, tone: 'amber' },
          { label: 'Operating Pressure', value: `${P_bar} bar (High-Pressure)`, tone: 'blue' }
        ],
        state: { petrolYield, middleYield, P_bar },
        explain: {
          what: `Direct coal liquefaction via Bergius high-pressure hydrogenation at ${P_bar} bar, ${T}°C.`,
          why: `Hydrogen capping of cracked coal radicals transforms solid polycyclic carbon into transportable liquid hydrocarbon fuels.`
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

      // High-Pressure Autoclave Reactor Vessel (Left)
      C3D.drawCylinder(g, P, [-1.4, 0, -0.6], 0.65, 2.4, '#334155', { scene, topCap: true });

      // Fractionating Distillation Column (Right)
      C3D.drawCylinder(g, P, [1.4, 0, -0.6], 0.55, 2.8, '#475569', { scene, topCap: true });

      // Transfer overhead vapor pipe connecting reactor to column
      C3D.drawPipe(g, P, [-1.4, 0, 1.8], [1.4, 0, 1.8], 0.1, '#ea580c', { scene });

      // H2 high-pressure feed pipe at bottom
      C3D.drawPipe(g, P, [-2.6, 0, -0.4], [-1.4, 0, -0.4], 0.1, '#38bdf8', { scene });

      // Product drain pipes from column
      C3D.drawPipe(g, P, [1.4, 0, 1.2], [2.4, 0, 1.2], 0.08, '#10b981', { scene }); // Petrol
      C3D.drawPipe(g, P, [1.4, 0, 0.4], [2.4, 0, 0.4], 0.08, '#eab308', { scene }); // Diesel

      // Tags
      scene.add(P([-1.4, 0, 1.9]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.4, 0, 1.9], `Reactor (${p.pressureBar} bar)`, '#dc2626', -22); });
      scene.add(P([1.4, 0, 2.3]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.4, 0, 2.3], 'Fractionating Column', '#0284c7', -22); });
      scene.add(P([2.4, 0, 1.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.4, 0, 1.2], 'Synthetic Petrol', '#10b981', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `High-Pressure Reactor (${p.temp}°C)`, color: '#334155' },
        { label: 'Fractionating Distillation Tower', color: '#475569' },
        { label: `Light Petrol Product (${state.petrolYield || 60}%)`, color: '#10b981' },
        { label: 'H₂ Gas Feed (200+ bar)', color: '#38bdf8' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 38 — Octane Number Simulator (chem-octane)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-octane'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('octaneNum', 'Research Octane Number (RON)', 70, 105, 1, 91, ''),
      r('compRatio', 'Engine Compression Ratio (CR)', 7.0, 13.0, 0.5, 9.5, ':1'),
      select('fuelType', 'Commercial Fuel Grade', 'Premium Unleaded (RON 95)', ['Regular Gasoline (RON 87)', 'Mid-Grade (RON 91)', 'Premium Unleaded (RON 95)', 'Racing Fuel E85 (RON 105)'])
    ],
    steps: () => [
      {
        title: 'Definition of Octane Rating Scale',
        text: 'Octane rating measures spark-ignition engine anti-knock capability compared against reference blends of iso-octane (RON 100) and n-heptane (RON 0).'
      },
      {
        title: 'Standard CFR Engine Testing',
        text: 'Fuel is evaluated in a single-cylinder Cooperative Fuel Research (CFR) engine with continuously variable cylinder head compression ratio.'
      },
      {
        title: 'Molecular Architecture & Knocking',
        text: 'Compact highly branched alkanes (iso-octane) and aromatics resist pre-ignition; straight-chain n-alkanes form peroxide radicals and knock easily.'
      },
      {
        title: 'Knock Meter Detonation Intensity',
        text: 'A magnetostrictive pickup transducer on the cylinder head measures pressure shockwave pulses, outputting knock intensity on a 0–100 scale.'
      },
      {
        title: 'Compression Ratio Optimization',
        text: 'Higher octane fuels permit higher compression ratios (CR > 10:1), enhancing thermodynamic thermal efficiency: η = 1 − (1 / CR^(γ−1)).'
      },
      {
        title: 'Research (RON) vs Motor (MON) Octane',
        text: 'RON simulates mild urban driving (600 rpm); MON tests severe highway conditions (900 rpm, heated air). Anti-Knock Index (AKI) = (RON + MON) / 2.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.compRatio > 11 && p.octaneNum < 88) w.push('Severe knocking hazard: low octane fuel will damage engine at compression ratio > 11:1.');
      return w;
    },
    compute: (p) => {
      const ron = Number(p.octaneNum) || 91;
      const cr = Number(p.compRatio) || 9.5;

      // Knock intensity index
      const knockThresholdCR = 5.0 + (ron / 100) * 6.5;
      const knockIntensity = Math.max(0, Math.min(100, (cr - knockThresholdCR) * 35));
      const thermalEff = (1 - (1 / Math.pow(cr, 0.35))) * 100;

      return {
        formulas: [{
          name: 'Otto Cycle Efficiency & Knock Limit',
          formula: 'η_thermal = 1 - (1 / CR^(γ - 1)) | Knock Threshold CR = 5.0 + (RON / 100) × 6.5',
          given: `RON = ${ron}, Compression Ratio = ${cr}:1`,
          calc: `Knock Threshold CR = ${knockThresholdCR.toFixed(1)}:1, Thermal Efficiency = ${thermalEff.toFixed(1)}%`,
          result: `Knock Intensity = ${knockIntensity.toFixed(0)} / 100, Efficiency = ${thermalEff.toFixed(1)}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'Octane Rating (RON)', value: `${ron}`, tone: 'blue' },
          { label: 'Knock Intensity', value: `${knockIntensity.toFixed(0)} %`, tone: knockIntensity > 40 ? 'red' : knockIntensity > 10 ? 'amber' : 'green' },
          { label: 'Max Safe Comp. Ratio', value: `${knockThresholdCR.toFixed(1)} : 1`, tone: 'green' },
          { label: 'Thermal Efficiency (η)', value: `${thermalEff.toFixed(1)} %`, tone: 'green' }
        ],
        state: { knockIntensity, thermalEff, knockThresholdCR },
        explain: {
          what: `CFR knock engine testing fuel of RON ${ron} at ${cr}:1 compression ratio.`,
          why: `High-octane fuel delays auto-ignition of compressed end-gas, allowing higher compression ratios without damaging detonation.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isKnocking = (state.knockIntensity || 0) > 20;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // CFR Engine Cylinder Block (Center)
      C3D.drawBox(g, P, [0, 0, 0.3], [1.8, 1.8, 2.2], '#334155', { scene, stroke: isKnocking ? '#dc2626' : '#64748b' });

      // Cylinder Bore (Cutaway cylinder)
      C3D.drawCylinder(g, P, [0, 0, -0.4], 0.65, 1.4, '#1e293b', { scene, topCap: false });

      // Piston (Moves up/down with compression)
      const pistonZ = -0.3 + Math.sin(time * 3) * 0.25;
      C3D.drawCylinder(g, P, [0, 0, pistonZ], 0.62, 0.5, '#94a3b8', { scene, topCap: true });

      // Spark Plug on top
      C3D.drawCylinder(g, P, [0, 0, 1.4], 0.12, 0.5, '#f8fafc', { scene });

      // Knock Meter Instrument on Left
      C3D.drawVoltmeter(g, P, [-1.5, 0, 1.0], 1.0, state.knockIntensity || 0, 100.0, {
        scene,
        label: 'KNOCK METER',
        decimals: 0
      });

      // Detonation shockwaves if knocking
      if (isKnocking) {
        for (let i = 0; i < 3; i++) {
          const rShock = 0.3 + ((time * 2 + i * 0.2) % 0.5);
          scene.add(P([0, 0, 0.4]).depth, (ctx) => {
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(P([0, 0, 0.4]).x, P([0, 0, 0.4]).y, rShock * 40, 0, Math.PI * 2);
            ctx.stroke();
          });
        }
      }

      // Tags
      scene.add(P([0, 0, 1.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.5], `CR ${p.compRatio}:1 Bore`, isKnocking ? '#dc2626' : '#16a34a', -22); });
      scene.add(P([-1.5, 0, 1.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.5, 0, 1.6], `RON ${p.octaneNum}`, '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `CFR Engine Cylinder (CR ${p.compRatio}:1)`, color: '#334155' },
        { label: `Fuel Rating: RON ${p.octaneNum}`, color: '#0284c7' },
        { label: isKnocking ? 'Detonation Shockwaves (Knock!)' : 'Smooth Flame Propagation', color: isKnocking ? '#ef4444' : '#10b981' },
        { label: 'Knock Intensity Pickup', color: '#eab308' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 39 — Cetane Number Simulator (chem-cetane)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-cetane'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('cetaneNum', 'Cetane Number (CN)', 35, 65, 1, 51, ''),
      r('compRatio', 'Diesel Compression Ratio', 14, 22, 1, 18, ':1'),
      select('dieselType', 'Diesel Fuel Specification', 'Ultra-Low Sulfur Diesel (CN 51)', ['Standard Diesel (CN 45)', 'Ultra-Low Sulfur Diesel (CN 51)', 'Premium Biodiesel B20 (CN 55)', 'Heavy Marine Bunker (CN 38)'])
    ],
    steps: () => [
      {
        title: 'Cetane Scale & Ignition Delay',
        text: 'Cetane rating quantifies ignition delay period in diesel engines compared against n-hexadecane (cetane, CN 100) and α-methylnaphthalene (CN 0).'
      },
      {
        title: 'Diesel Fuel Injection & Vaporization',
        text: 'High-pressure common rail injects atomized fuel spray into compressed, superheated air (~600°C) near top dead center (TDC).'
      },
      {
        title: 'Physical & Chemical Ignition Delay (τ)',
        text: 'Ignition delay comprises droplet breakup/evaporation (physical) followed by pre-flame free radical branching reactions (chemical).'
      },
      {
        title: 'Diesel Knock Phenomenon',
        text: 'A fuel with low CN has excessive delay: excessive fuel accumulates before ignition, exploding simultaneously and generating harsh diesel knock pressure spikes.'
      },
      {
        title: 'Cold Start & White Smoke Prevention',
        text: 'High cetane fuels ignite rapidly and smoothly, enabling easy cold starts, reduced unburned hydrocarbon white smoke, and quieter operation.'
      },
      {
        title: 'Inverse Octane-Cetane Relationship',
        text: 'Straight-chain paraffinic hydrocarbons have high cetane but low octane; aromatics have high octane but poor cetane.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.cetaneNum < 40) w.push('Low cetane number causes severe ignition delay and harsh diesel knocking.');
      return w;
    },
    compute: (p) => {
      const cn = Number(p.cetaneNum) || 51;
      const cr = Number(p.compRatio) || 18;

      // Ignition delay in ms: tau ≈ 15 / (CN^0.6) * (18 / CR)
      const delayMs = (18 / Math.pow(cn, 0.55) * (18 / cr)).toFixed(2);
      const knockRisk = delayMs > 2.0 ? 'High (Harsh Knock)' : delayMs > 1.4 ? 'Moderate' : 'Low (Smooth Combustion)';

      return {
        formulas: [{
          name: 'Diesel Ignition Delay Correlation',
          formula: 'τ_delay ∝ 1 / (CN^0.55 × CR) | Target: τ < 1.5 ms',
          given: `Cetane Number = ${cn}, Compression Ratio = ${cr}:1`,
          calc: `Ignition Delay τ = ${delayMs} ms`,
          result: `Ignition Delay = ${delayMs} ms, Knock Risk: ${knockRisk}`,
          unit: 'ms'
        }],
        readouts: [
          { label: 'Cetane Number (CN)', value: `${cn}`, tone: cn > 48 ? 'green' : 'amber' },
          { label: 'Ignition Delay (τ)', value: `${delayMs} ms`, tone: Number(delayMs) < 1.5 ? 'green' : 'red' },
          { label: 'Combustion Smoothness', value: knockRisk.split(' ')[0], tone: Number(delayMs) < 1.5 ? 'green' : 'amber' },
          { label: 'Cold-Start Readiness', value: cn > 50 ? 'Immediate' : 'Requires Glow Plug', tone: 'blue' }
        ],
        state: { delayMs, knockRisk, cn },
        explain: {
          what: `Diesel combustion delay analysis for fuel with Cetane Number ${cn}.`,
          why: `High cetane fuels auto-ignite rapidly, minimizing fuel buildup in the cylinder and preventing violent diesel knock.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isHarsh = (state.delayMs || 1.5) > 1.8;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Heavy Diesel Cylinder Block
      C3D.drawBox(g, P, [0, 0, 0.3], [1.8, 1.8, 2.2], '#334155', { scene, stroke: '#475569' });

      // Cylinder Bore
      C3D.drawCylinder(g, P, [0, 0, -0.4], 0.65, 1.4, '#1e293b', { scene, topCap: false });

      // High-Pressure Fuel Injector Nozzle on top
      C3D.drawCylinder(g, P, [0, 0, 1.3], 0.1, 0.6, '#94a3b8', { scene, topCap: true });

      // Atomized Fuel Spray Cone entering chamber
      for (let i = 0; i < 6; i++) {
        const sprayZ = 0.8 - ((time * 2.5 + i * 0.15) % 0.8);
        const sprayR = (0.8 - sprayZ) * 0.4;
        const ang = (i * Math.PI) / 3;
        const posDrop = [sprayR * Math.cos(ang), sprayR * Math.sin(ang), sprayZ];
        scene.add(P(posDrop).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posDrop, 0.05, '#facc15', '', '');
        });
      }

      // Delay oscilloscope readout on bench
      C3D.drawVoltmeter(g, P, [-1.5, 0, 1.0], 1.0, state.delayMs || 1.2, 5.0, {
        scene,
        label: 'DELAY (MS)',
        decimals: 2
      });

      // Tags
      scene.add(P([0, 0, 1.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.5], 'Fuel Injector (2000 bar)', '#0284c7', -22); });
      scene.add(P([-1.5, 0, 1.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.5, 0, 1.6], `CN ${p.cetaneNum} (${state.delayMs} ms)`, isHarsh ? '#dc2626' : '#16a34a', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Diesel Test Engine (CR ${p.compRatio}:1)`, color: '#334155' },
        { label: `Cetane Rating: CN ${p.cetaneNum}`, color: '#0284c7' },
        { label: `Ignition Delay (${state.delayMs} ms)`, color: isHarsh ? '#dc2626' : '#16a34a' },
        { label: 'Atomized Fuel Spray Cone', color: '#facc15', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 40 — Knocking in IC Engines Simulator (chem-knocking)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-knocking'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('combustionMode', 'Combustion Regime', 'Severe Detonation Knocking', ['Normal Laminar Flame Propagation', 'Incipient Light Knock', 'Severe Detonation Knocking']),
      r('sparkTiming', 'Spark Advance Angle', 5, 35, 1, 24, '°BTDC'),
      r('airFuelRatio', 'Air-Fuel Ratio (AFR)', 10, 18, 0.5, 12.8, ':1')
    ],
    steps: () => [
      {
        title: 'Normal vs Abnormal Combustion',
        text: 'In normal combustion, spark ignition creates a progressive laminar flame front (20–30 m/s) cleanly consuming the charge.'
      },
      {
        title: 'End-Gas Compression & Pre-Flame Kinetics',
        text: 'The advancing flame compresses and radiates heat into unburned end-gas trapped against cylinder walls, accelerating peroxy radical formation.'
      },
      {
        title: 'Spontaneous Auto-Ignition of End-Gas',
        text: 'If temperature and pressure exceed auto-ignition limits before the flame arrives, the entire end-gas detonates simultaneously.'
      },
      {
        title: 'Supersonic Shockwave Generation',
        text: 'Instantaneous volumetric detonation creates supersonic shockwaves (1500 m/s) reverberating between piston crown and cylinder head walls.'
      },
      {
        title: 'Mechanical Destruction & Overheating',
        text: 'Shockwaves strip the insulating thermal boundary layer, causing extreme heat transfer, melted piston crowns, fractured rings, and acoustic metallic pinging.'
      },
      {
        title: 'Mitigation via Electronics & Chemistry',
        text: 'Acoustic knock sensors retard ignition timing; high-octane fuels, direct cylinder cooling, and combustion chamber squish bands suppress knock.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.sparkTiming > 28) w.push('Excessive spark advance: peak pressure occurs too early, inducing knock.');
      return w;
    },
    compute: (p) => {
      const isDetonation = p.combustionMode.includes('Severe');
      const isLight = p.combustionMode.includes('Incipient');
      const adv = Number(p.sparkTiming) || 24;

      const peakPressBar = isDetonation ? 115 : isLight ? 75 : 52;
      const flameSpeedMs = isDetonation ? 1450 : isLight ? 85 : 28;
      const acousticFreqKhz = isDetonation ? 6.8 : isLight ? 6.2 : 0;

      return {
        formulas: [{
          name: 'End-Gas Auto-Ignition Pressure Dynamics',
          formula: 'P_peak ∝ exp(Advance) × Detonation_factor | Acoustic Knock Freq ≈ 6.5 kHz',
          given: `Mode = ${p.combustionMode}, Spark Advance = ${adv}° BTDC`,
          calc: `Peak Pressure = ${peakPressBar} bar, Wave Velocity = ${flameSpeedMs} m/s`,
          result: `Peak Cylinder Pressure = ${peakPressBar} bar, Flame Speed = ${flameSpeedMs} m/s`,
          unit: 'bar'
        }],
        readouts: [
          { label: 'Combustion Regime', value: p.combustionMode.split(' ')[0], tone: isDetonation ? 'red' : 'green' },
          { label: 'Peak Pressure (P_max)', value: `${peakPressBar} bar`, tone: isDetonation ? 'red' : 'blue' },
          { label: 'Front Velocity', value: `${flameSpeedMs} m/s`, tone: isDetonation ? 'red' : 'blue' },
          { label: 'Knock Sensor Frequency', value: `${acousticFreqKhz} kHz`, tone: isDetonation ? 'red' : 'green' }
        ],
        state: { isDetonation, peakPressBar, flameSpeedMs },
        explain: {
          what: `Detailed IC engine combustion dynamics in ${p.combustionMode} mode.`,
          why: `Uncontrolled auto-ignition of compressed end-gas releases localized chemical energy instantaneously, generating destructive 6.5 kHz acoustic pressure shockwaves.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isDet = state.isDetonation;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Engine Cylinder Cutaway
      C3D.drawBox(g, P, [0, 0, 0.4], [2.2, 1.8, 2.2], '#334155', { scene, stroke: isDet ? '#dc2626' : '#64748b' });
      C3D.drawCylinder(g, P, [0, 0, -0.3], 0.75, 1.4, '#1e293b', { scene, topCap: false });

      // Piston Crown
      C3D.drawCylinder(g, P, [0, 0, -0.2], 0.72, 0.5, '#94a3b8', { scene, topCap: true });

      // Spark Plug
      C3D.drawCylinder(g, P, [0, 0, 1.5], 0.12, 0.5, '#f8fafc', { scene });

      // Flame front or shockwaves
      if (isDet) {
        // Multi-point violent detonation sparks and shockwave rings
        for (let i = 0; i < 4; i++) {
          const rShock = 0.2 + ((time * 3 + i * 0.15) % 0.6);
          scene.add(P([0.3, 0, 0.4]).depth, (ctx) => {
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(P([0.3, 0, 0.4]).x, P([0.3, 0, 0.4]).y, rShock * 50, 0, Math.PI * 2);
            ctx.stroke();
          });
        }
      } else {
        // Smooth spherical flame front expanding from center
        const rFlame = 0.1 + ((time * 1.5) % 0.6);
        scene.add(P([0, 0, 0.8]).depth, (ctx) => {
          ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(P([0, 0, 0.8]).x, P([0, 0, 0.8]).y, rFlame * 60, 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      // Pressure Gauge Readout
      C3D.drawVoltmeter(g, P, [-1.6, 0, 1.0], 1.0, state.peakPressBar || 52, 150.0, {
        scene,
        label: 'PEAK BAR',
        decimals: 0
      });

      // Tags
      scene.add(P([0, 0, 1.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.6], 'Spark Ignition', '#f59e0b', -22); });
      scene.add(P([0.4, 0, 0.5]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0.4, 0, 0.5], isDet ? 'Detonating End-Gas (Knock!)' : 'Laminar Flame Front', isDet ? '#dc2626' : '#38bdf8', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Engine Cylinder Combustion Chamber', color: '#334155' },
        { label: isDet ? 'Shockwave Detonation (>1000 m/s)' : 'Laminar Flame Front (25 m/s)', color: isDet ? '#dc2626' : '#38bdf8' },
        { label: `Spark Advance: ${p.sparkTiming}° BTDC`, color: '#eab308' },
        { label: `Peak Pressure: ${state.peakPressBar} bar`, color: isDet ? '#ef4444' : '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 41 — Anti-Knocking Agent Simulator (chem-antiknock)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-antiknock'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('additive', 'Antiknock Additive System', 'Methyl tert-Butyl Ether (MTBE, 10% vol)', ['Unleaded Base Fuel (No Additive)', 'Tetraethyl Lead (TEL, 0.5 mL/L)', 'Methyl tert-Butyl Ether (MTBE, 10% vol)', 'Ethanol Bio-Blend (E10, 10% vol)']),
      r('compRatio', 'Engine Compression Ratio', 7.5, 12.0, 0.5, 10.0, ':1')
    ],
    steps: () => [
      {
        title: 'Chain-Branching Autoignition Kinetics',
        text: 'Pre-ignition knock proceeds via branched free radical chain reactions: RH + O₂ → R• + HO₂• followed by R• + O₂ → ROO• (peroxy radicals).'
      },
      {
        title: 'Tetraethyl Lead (TEL) Mechanism',
        text: 'TEL ((C₂H₅)₄Pb) thermally dissociates into lead monoxide (PbO) nanoparticles which scavenge peroxy radicals: ROO• + PbO → Non-reactive products, breaking the chain.'
      },
      {
        title: 'Scavenger Function (Ethylene Dibromide)',
        text: 'Ethylene dibromide (CH₂BrCH₂Br) reacts with lead deposits to form volatile lead bromide (PbBr₂), discharging lead in exhaust (environmental neurotoxin).'
      },
      {
        title: 'Modern Oxygenate Additives (MTBE & Ethanol)',
        text: 'Oxygenates increase fuel octane blending value, provide internal oxygen for cleaner combustion, and produce zero toxic lead particulate emissions.'
      },
      {
        title: 'Octane Boost & Compression Capacity',
        text: 'Adding 10% MTBE boosts RON by 4–6 units, allowing engine compression ratios to rise from 8.5:1 to 10.5:1 without knocking.'
      },
      {
        title: 'Catalytic Converter Compatibility',
        text: 'Leaded additives irrevocably poison precious metal catalytic converters; modern unleaded formulations protect both emissions systems and public health.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.additive.includes('Unleaded Base') && p.compRatio > 9.0) w.push('Base fuel without antiknock agent knocks violently at CR > 9.0.');
      return w;
    },
    compute: (p) => {
      const isBase = p.additive.includes('No Additive');
      const isTel = p.additive.includes('TEL');
      const isMtbe = p.additive.includes('MTBE');

      const ronBoost = isBase ? 0 : isTel ? 8 : isMtbe ? 5 : 4;
      const baseRon = 86;
      const finalRon = baseRon + ronBoost;
      const cr = Number(p.compRatio) || 10.0;
      const knockSafe = cr <= (5.0 + (finalRon / 100) * 6.5);

      return {
        formulas: [{
          name: 'Radical Scavenging & Octane Enhancement',
          formula: 'RON_final = RON_base + ΔRON_additive | ROO• + PbO → Stable Products',
          given: `Additive = ${p.additive}, CR = ${cr}:1`,
          calc: `Final RON = ${baseRon} + ${ronBoost} = ${finalRon}`,
          result: `Final RON = ${finalRon}, Status: ${knockSafe ? 'Knock-Free' : 'Knocking Detonation'}`,
          unit: 'RON'
        }],
        readouts: [
          { label: 'Blended Octane (RON)', value: `${finalRon}`, tone: 'green' },
          { label: 'Octane Boost (ΔRON)', value: `+${ronBoost} RON`, tone: 'blue' },
          { label: 'Combustion Status', value: knockSafe ? 'Smooth & Knock-Free' : 'Violent Knocking', tone: knockSafe ? 'green' : 'red' },
          { label: 'Emissions Toxicity', value: isTel ? 'Hazardous (Toxic Pb)' : 'Zero Lead (Clean)', tone: isTel ? 'red' : 'green' }
        ],
        state: { finalRon, ronBoost, knockSafe },
        explain: {
          what: `Antiknock evaluation of ${p.additive} at ${cr}:1 compression ratio.`,
          why: `Antiknock agents eliminate reactive peroxy radicals, suppressing chain auto-ignition and raising octane rating by +${ronBoost} units.`
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

      // Cylinder Block
      C3D.drawBox(g, P, [0, 0, 0.3], [2.0, 1.8, 2.0], '#334155', { scene });
      C3D.drawCylinder(g, P, [0, 0, -0.4], 0.7, 1.4, '#1e293b', { scene, topCap: false });

      // Radical Scavenging Particles inside combustion chamber
      for (let i = 0; i < 5; i++) {
        const xPos = -0.4 + i * 0.2;
        const zPos = 0.2 + ((time * 0.8 + i * 0.2) % 0.6);
        const posRad = [xPos, 0, zPos];
        scene.add(P(posRad).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posRad, 0.08, state.knockSafe ? '#10b981' : '#ef4444', 'R•', '');
        });
      }

      // Additive Dosing Vial on Right
      C3D.drawCylinder(g, P, [1.5, 0, 0.1], 0.3, 0.8, '#38bdf8', { scene, topCap: true });

      // Tags
      scene.add(P([0, 0, 1.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 1.2], `Combustion: ${state.knockSafe ? 'Smooth' : 'Knock'}`, state.knockSafe ? '#16a34a' : '#dc2626', -22);
      });
      scene.add(P([1.5, 0, 0.6]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [1.5, 0, 0.6], `Additive: ${p.additive.split(' ')[0]}`, '#0284c7', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Additive: ${p.additive.split(' ')[0]}`, color: '#38bdf8' },
        { label: `Octane Boost: +${state.ronBoost || 5} RON`, color: '#10b981' },
        { label: 'Scavenged Free Radical (R•)', color: state.knockSafe ? '#10b981' : '#ef4444', symbol: true },
        { label: state.knockSafe ? 'Protected Compression Regime' : 'Knocking Hazard', color: state.knockSafe ? '#15803d' : '#dc2626' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 42 — CNG vs LPG Fuel Simulator (chem-cng-lpg)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-cng-lpg'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('selectedFuel', 'Gaseous Fuel Type', 'Compressed Natural Gas (CNG)', ['Compressed Natural Gas (CNG)', 'Liquefied Petroleum Gas (LPG)']),
      r('tankPressure', 'Storage Pressure', 5, 250, 5, 200, 'bar'),
      r('burnerFlow', 'Fuel Delivery Flow Rate', 5, 50, 5, 20, 'L/min')
    ],
    steps: () => [
      {
        title: 'Comparative Gaseous Clean Fuels',
        text: 'CNG and LPG represent prominent alternative gaseous transport and heating fuels offering lower particulate and carbon emissions than gasoline.'
      },
      {
        title: 'Compressed Natural Gas (CNG) Physics',
        text: 'CNG is primarily methane (CH₄, ~85–95%), stored as super-high pressure gas at 200–250 bar. Being lighter than air (density 0.68 kg/m³), it disperses safely upward.'
      },
      {
        title: 'Liquefied Petroleum Gas (LPG) Physics',
        text: 'LPG is a blend of propane (C₃H₈) and butane (C₄H₁₀), stored under modest pressure (7–10 bar) as a liquid. Being heavier than air (density 1.8–2.0 kg/m³), leaks pool in basements.'
      },
      {
        title: 'Calorific Value & Energy Density',
        text: 'LPG has a higher calorific value per unit volume (~26 MJ/L vs ~9 MJ/L for CNG), while CNG offers higher calorific value per unit mass (~53 MJ/kg vs ~46 MJ/kg).'
      },
      {
        title: 'Auto-Ignition & Safety Profile',
        text: 'CNG has a high autoignition temperature (540°C vs 450°C for LPG), making accidental ignition less likely during fuel line compromise.'
      },
      {
        title: 'Carbon Footprint & Emissions',
        text: 'With the lowest carbon-to-hydrogen ratio (C:H = 1:4), methane produces ~25% less CO₂ per gigajoule than petroleum fuels.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.selectedFuel.includes('CNG') && p.tankPressure < 100) w.push('Low CNG pressure: tank requires refilling (>150 bar typical).');
      return w;
    },
    compute: (p) => {
      const isCng = p.selectedFuel.includes('CNG');
      const comp = isCng ? 'Methane (CH₄ ~90%)' : 'Propane (C₃H₈) + Butane (C₄H₁₀)';
      const statePhase = isCng ? 'Compressed Gas (Supercritical)' : 'Liquefied Phase under Pressure';
      const density = isCng ? '0.68 kg/m³ (Lighter than air)' : '1.95 kg/m³ (Heavier than air)';
      const gcvMass = isCng ? '53.6 MJ/kg' : '46.1 MJ/kg';
      const co2Kg = isCng ? '2.75 kg CO₂/kg fuel' : '3.00 kg CO₂/kg fuel';

      return {
        formulas: [{
          name: 'Gaseous Combustion Energetics',
          formula: isCng ? 'CH₄ + 2O₂ → CO₂ + 2H₂O + 890 kJ/mol' : 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O + 2220 kJ/mol',
          given: `Fuel = ${p.selectedFuel}, Pressure = ${p.tankPressure} bar`,
          calc: `Phase = ${statePhase}, GCV = ${gcvMass}`,
          result: `GCV = ${gcvMass}, Density = ${density}`,
          unit: 'MJ/kg'
        }],
        readouts: [
          { label: 'Physical Phase', value: statePhase.split(' ')[0], tone: 'blue' },
          { label: 'Calorific Value (Mass)', value: gcvMass, tone: 'green' },
          { label: 'Vapour Density', value: isCng ? 'Lighter than air' : 'Heavier than air', tone: isCng ? 'green' : 'amber' },
          { label: 'Carbon Intensity', value: co2Kg, tone: isCng ? 'green' : 'amber' }
        ],
        state: { isCng, density, gcvMass },
        explain: {
          what: `Comparative assessment of ${p.selectedFuel} storage and combustion characteristics.`,
          why: `CNG is lighter than air and cleaner (CH₄, 53.6 MJ/kg); LPG stores conveniently as a liquid at low pressure but pools if leaked.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const isCng = state.isCng;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Storage Tank (Left: CNG thick cylinder vs Right: LPG tank)
      if (isCng) {
        // High-pressure tall cylindrical steel CNG bottle
        C3D.drawCylinder(g, P, [-1.2, 0, -0.6], 0.45, 2.4, '#e2e8f0', { scene, topCap: true });
      } else {
        // Toroidal / fat cylindrical LPG tank
        C3D.drawCylinder(g, P, [-1.2, 0, -0.6], 0.7, 1.8, '#dc2626', { scene, topCap: true });
      }

      // Fuel Delivery Line
      C3D.drawPipe(g, P, [-1.2, 0, 1.3], [1.2, 0, 1.3], 0.08, '#f59e0b', { scene });

      // Gas Burner Rig (Right)
      C3D.drawCylinder(g, P, [1.2, 0, 0.2], 0.4, 0.6, '#334155', { scene, topCap: true });

      // Clean Blue Methane Flame vs Rich Orange LPG Flame
      const flameCol = isCng ? '#38bdf8' : '#f97316';
      for (let i = 0; i < 4; i++) {
        const fz = 0.9 + ((time * 1.5 + i * 0.2) % 0.5);
        const fx = 1.2 + (i % 2 ? 0.1 : -0.1);
        const posF = [fx, 0, fz];
        scene.add(P(posF).depth, (ctx) => { C3D.drawAtom(ctx, P, posF, 0.09, flameCol, '', ''); });
      }

      // Pressure Gauge
      C3D.drawVoltmeter(g, P, [-1.2, 0, 2.2], 0.8, p.tankPressure || 200, 300.0, {
        scene,
        label: 'TANK BAR',
        decimals: 0
      });

      // Tags
      scene.add(P([-1.2, 0, 1.4]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.2, 0, 1.4], isCng ? 'CNG Cylinder (200 bar)' : 'LPG Tank (10 bar)', '#0284c7', -22); });
      scene.add(P([1.2, 0, 1.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.2, 0, 1.6], `${isCng ? 'Clean Blue CH₄' : 'LPG Propane'} Flame`, flameCol, -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: isCng ? 'CNG High-Pressure Vessel (200 bar)' : 'LPG Liquid Tank (10 bar)', color: isCng ? '#e2e8f0' : '#dc2626' },
        { label: `${p.selectedFuel.split(' ')[0]} Burner Flame`, color: flameCol },
        { label: `Vapour Density: ${state.density ? state.density.split(' ')[0] : 'Lighter'}`, color: '#eab308' },
        { label: `GCV: ${state.gcvMass || '53.6 MJ/kg'}`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 43 — Calorific Value Simulator (chem-calorific-value)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-calorific-value'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('carbon', 'Carbon (%C)', 50, 90, 1, 75, '%'),
      r('hydrogen', 'Hydrogen (%H)', 2, 8, 0.5, 5.0, '%'),
      r('oxygen', 'Oxygen (%O)', 2, 20, 1, 8.0, '%'),
      r('sulfur', 'Sulfur (%S)', 0, 5, 0.2, 1.0, '%')
    ],
    steps: () => [
      {
        title: 'Calorific Value Fundamentals',
        text: 'Calorific value is the total heat liberated when a unit mass of fuel is burned completely in excess oxygen.'
      },
      {
        title: 'Higher Calorific Value (HCV / Gross CV)',
        text: 'HCV includes the latent heat of condensation of water steam produced by the combustion of hydrogen when products cool back to 15°C.'
      },
      {
        title: 'Lower Calorific Value (LCV / Net CV)',
        text: 'LCV assumes water steam escapes with hot flue gases without condensing: LCV = HCV − (Latent Heat of Steam × Mass of Water Vapor).'
      },
      {
        title: 'Dulong’s Empirical Formula',
        text: 'HCV (kcal/kg) = (1/100) × [8080·C + 34500·(H − O/8) + 2240·S]. Available hydrogen is corrected by subtracting (O/8) already bonded as water.'
      },
      {
        title: 'Conversion to SI Units (kJ/kg)',
        text: 'Multiplying kcal/kg by 4.184 yields calorific value in standard SI units: HCV (kJ/kg) = 338·C + 1442·(H − O/8) + 94·S.'
      },
      {
        title: 'Engineering Efficiency Implications',
        text: 'Power plants and industrial boilers operate on LCV because exhaust temperatures remain above dew point to prevent sulfuric acid condensation corrosion.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (Number(p.carbon) + Number(p.hydrogen) + Number(p.oxygen) + Number(p.sulfur) > 100) {
        w.push('Total elemental percentages cannot exceed 100%.');
      }
      return w;
    },
    compute: (p) => {
      const C = Number(p.carbon) || 75;
      const H = Number(p.hydrogen) || 5;
      const O = Number(p.oxygen) || 8;
      const S = Number(p.sulfur) || 1;

      // Available Hydrogen
      const availH = Math.max(0, H - O / 8);
      // Dulong HCV kcal/kg
      const hcvKcal = (8080 * C + 34500 * availH + 2240 * S) / 100;
      const hcvKj = hcvKcal * 4.184;
      // Latent heat of steam: 9 * H% * 587 cal/g
      const latentHeat = (0.09 * H * 587);
      const lcvKcal = hcvKcal - latentHeat;
      const lcvKj = lcvKcal * 4.184;

      return {
        formulas: [{
          name: 'Dulong Formula for Gross & Net Calorific Value',
          formula: 'HCV = (1/100)·[8080C + 34500(H - O/8) + 2240S] kcal/kg | LCV = HCV - 0.09H × 587',
          given: `C = ${C}%, H = ${H}%, O = ${O}%, S = ${S}%, Avail H = ${availH.toFixed(2)}%`,
          calc: `HCV = (8080×${C} + 34500×${availH.toFixed(2)} + 2240×${S}) / 100 = ${hcvKcal.toFixed(0)} kcal/kg`,
          result: `HCV = ${hcvKj.toFixed(0)} kJ/kg, LCV = ${lcvKj.toFixed(0)} kJ/kg`,
          unit: 'kJ/kg'
        }],
        readouts: [
          { label: 'Gross Calorific Value (HCV)', value: `${hcvKj.toFixed(0)} kJ/kg`, tone: 'green' },
          { label: 'Net Calorific Value (LCV)', value: `${lcvKj.toFixed(0)} kJ/kg`, tone: 'blue' },
          { label: 'Available Hydrogen (H - O/8)', value: `${availH.toFixed(2)}%`, tone: 'green' },
          { label: 'Latent Heat of Steam', value: `${(latentHeat * 4.184).toFixed(0)} kJ/kg`, tone: 'amber' }
        ],
        state: { hcvKj, lcvKj, availH },
        explain: {
          what: `Dulong calorific calculation for fuel containing ${C}% C, ${H}% H, ${O}% O, ${S}% S.`,
          why: `Oxygen in fuel already binds (O/8) hydrogen as unreactive water; only remaining available hydrogen contributes to calorific heat release.`
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

      // 3D Bar Comparison: HCV (Green) vs LCV (Blue)
      const hcvH = Math.min(2.5, (state.hcvKj || 30000) / 15000);
      const lcvH = Math.min(2.5, (state.lcvKj || 28000) / 15000);

      // HCV Tower
      C3D.drawBox(g, P, [-0.8, 0, -0.6 + hcvH / 2], [0.8, 0.8, hcvH], '#10b981', { scene });
      // LCV Tower
      C3D.drawBox(g, P, [0.8, 0, -0.6 + lcvH / 2], [0.8, 0.8, lcvH], '#0284c7', { scene });

      // Steam Latent Heat Gap Indicator
      C3D.drawBox(g, P, [0.8, 0, -0.6 + lcvH + (hcvH - lcvH) / 2], [0.8, 0.8, hcvH - lcvH], '#f59e0b', { scene });

      // Tags
      scene.add(P([-0.8, 0, -0.6 + hcvH]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [-0.8, 0, -0.6 + hcvH], `HCV (${(state.hcvKj || 0).toFixed(0)} kJ/kg)`, '#10b981', -22);
      });
      scene.add(P([0.8, 0, -0.6 + lcvH]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0.8, 0, -0.6 + lcvH], `LCV (${(state.lcvKj || 0).toFixed(0)} kJ/kg)`, '#0284c7', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Higher Calorific Value (HCV / GCV)', color: '#10b981' },
        { label: 'Lower Calorific Value (LCV / NCV)', color: '#0284c7' },
        { label: 'Latent Heat of Condensed Steam', color: '#f59e0b' },
        { label: `Available Hydrogen: ${state.availH ? state.availH.toFixed(2) : 4}%`, color: '#eab308' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 44 — Bomb Calorimeter Simulator (chem-bomb-calorimeter)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-bomb-calorimeter'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('sampleType', 'Fuel Sample', 'Bituminous Coal Pellet', ['Anthracite Coal', 'Bituminous Coal Pellet', 'Heavy Fuel Oil', 'Benzoic Acid (Standard)']),
      r('sampleMass', 'Sample Mass (m)', 0.5, 1.5, 0.1, 1.0, 'g'),
      r('waterMass', 'Water in Calorimeter (W)', 1500, 3000, 100, 2200, 'g'),
      r('waterEquiv', 'Water Equivalent of Bomb (w)', 300, 800, 50, 550, 'g')
    ],
    steps: () => [
      {
        title: 'Bomb Assembly & Sample Loading',
        text: 'A 1.000 g pellet of fuel is placed in a silica crucible inside a heavy-walled stainless steel explosive bomb. Fine ignition wire contacts the pellet.'
      },
      {
        title: 'High-Pressure Oxygen Charging',
        text: 'The bomb lid is securely tightened and charged with pure oxygen gas to 25–30 atm pressure, ensuring complete instantaneous combustion.'
      },
      {
        title: 'Submersion in Water Calorimeter',
        text: 'The charged bomb is submerged in a known mass of water (2200 g) inside a copper calorimeter bucket surrounded by an air jacket and water jacket.'
      },
      {
        title: 'Stirring & Baseline Temperature (T₁)',
        text: 'A motorized propeller stirrer ensures uniform temperature distribution. Initial temperature T₁ is read on a Beckmann differential thermometer (±0.001°C).'
      },
      {
        title: 'Electrical Ignition & Combustion',
        text: 'A 6V electric pulse ignites the fuel pellet. Combustion generates intense heat which conducts through the bomb walls into the surrounding water.'
      },
      {
        title: 'Maximum Temperature (T₂) & Calculation',
        text: 'Water reaches peak temperature T₂: GCV = [(W + w)(T₂ − T₁ + cooling) − corrections] / m cal/g. Cotton, acid, and fuse wire corrections are applied.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.sampleMass <= 0) w.push('Sample mass must be positive.');
      return w;
    },
    compute: (p) => {
      const m = Number(p.sampleMass) || 1.0;
      const W = Number(p.waterMass) || 2200;
      const w = Number(p.waterEquiv) || 550;

      const stdGcv = p.sampleType.includes('Benzoic') ? 6320 :
                     p.sampleType.includes('Anthracite') ? 7800 :
                     p.sampleType.includes('Bituminous') ? 7100 : 9800; // cal/g

      // Delta T = (m * GCV) / (W + w)
      const deltaT = ((m * stdGcv) / (W + w)).toFixed(3);
      const t1 = 25.000;
      const t2 = (t1 + Number(deltaT)).toFixed(3);
      const gcvCalculated = (((W + w) * Number(deltaT)) / m).toFixed(0);

      return {
        formulas: [{
          name: 'ASTM D240 Bomb Calorimetry Formula',
          formula: 'GCV = [(W + w) × (T₂ - T₁ + c) - (Acid + Wire)] / m cal/g',
          given: `m = ${m} g, W = ${W} g, w = ${w} g, T₁ = ${t1}°C`,
          calc: `ΔT = (${W}+${w}) / (${m} × ${stdGcv}) = ${deltaT} °C, T₂ = ${t2} °C`,
          result: `GCV = ${gcvCalculated} cal/g (${(Number(gcvCalculated) * 4.184 / 1000).toFixed(2)} MJ/kg)`,
          unit: 'cal/g'
        }],
        readouts: [
          { label: 'Gross CV (GCV)', value: `${gcvCalculated} cal/g`, tone: 'green' },
          { label: 'SI Calorific Value', value: `${(Number(gcvCalculated) * 4.184 / 1000).toFixed(2)} MJ/kg`, tone: 'green' },
          { label: 'Temperature Rise (ΔT)', value: `${deltaT} °C`, tone: 'blue' },
          { label: 'Beckmann T₂ Peak', value: `${t2} °C`, tone: 'amber' }
        ],
        state: { deltaT, t1, t2, gcvCalculated },
        explain: {
          what: `Bomb calorimeter test of ${p.sampleType} under 30 atm oxygen.`,
          why: `Total heat released by combustion is absorbed by water mass W and bomb equivalent w, measured by Beckmann differential rise ΔT.`
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

      // Outer Insulated Water Jacket Tank
      C3D.drawCylinder(g, P, [0, 0, -0.6], 1.6, 2.2, '#334155', { scene, topCap: false });

      // Inner Copper Calorimeter Bucket (with water)
      C3D.drawCylinder(g, P, [0, 0, -0.4], 1.2, 1.8, 'rgba(56, 189, 248, 0.45)', { scene, topCap: false });

      // Stainless Steel Bomb Vessel inside water
      C3D.drawCylinder(g, P, [0, 0, -0.3], 0.55, 1.3, '#94a3b8', { scene, topCap: true });

      // Beckmann Thermometer (Glass stem on right)
      C3D.drawCylinder(g, P, [0.8, 0, 0.2], 0.06, 1.8, '#f8fafc', { scene, topCap: true });

      // Motorized Stirrer Shaft on left
      C3D.drawCylinder(g, P, [-0.8, 0, 0.2], 0.05, 1.8, '#64748b', { scene, topCap: true });
      if (C3D.drawPaddle) {
        C3D.drawPaddle(g, P, [-0.8, 0, 0.2], 0.8, 0.25, 0.15, time * 6, '#475569', { scene });
      }

      // Delta T Digital Display
      C3D.drawVoltmeter(g, P, [0, 0, 2.2], 0.9, Number(state.deltaT) || 2.45, 10.0, {
        scene,
        label: 'BECKMANN ΔT (°C)',
        decimals: 3
      });

      // Tags
      scene.add(P([0, 0, 0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 0.8], 'Stainless Bomb (30 atm O₂)', '#94a3b8', -22); });
      scene.add(P([0.8, 0, 1.6]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.8, 0, 1.6], `Beckmann: ${state.t2 || 27.45}°C`, '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Stainless Steel Bomb (30 atm O₂)', color: '#94a3b8' },
        { label: 'Calorimeter Water Bucket (W + w)', color: '#38bdf8' },
        { label: 'Beckmann Differential Thermometer', color: '#f8fafc' },
        { label: `GCV: ${state.gcvCalculated || 7100} cal/g`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 45 — Orsat Apparatus Flue Gas Analysis (chem-orsat)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-orsat'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('stage', 'Absorption Sequence Stage', 'Stage 1: KOH Absorbs CO₂', ['Initial Gas Sample (100 mL)', 'Stage 1: KOH Absorbs CO₂', 'Stage 2: Pyrogallol Absorbs O₂', 'Stage 3: Cu₂Cl₂ Absorbs CO', 'Complete Analysis Summary']),
      r('co2Percent', 'True CO₂ Content', 8, 16, 1, 12, '%'),
      r('o2Percent', 'True O₂ Content', 2, 10, 0.5, 6, '%'),
      r('coPercent', 'True CO Content', 0.2, 3.0, 0.2, 1.2, '%')
    ],
    steps: () => [
      {
        title: 'Drawing 100 mL Flue Gas Sample',
        text: 'The water-jacketed gas burette is filled with 100 mL of dry flue gas by manipulating the aspirator leveling bottle at atmospheric pressure.'
      },
      {
        title: 'Stage 1: CO₂ Absorption in KOH Pipette',
        text: 'Gas is passed into the first pipette containing 30% KOH solution: 2KOH + CO₂ → K₂CO₃ + H₂O. Volumetric contraction directly gives %CO₂.'
      },
      {
        title: 'Stage 2: O₂ Absorption in Alkaline Pyrogallol',
        text: 'Remaining gas enters the second pipette containing alkaline pyrogallol, absorbing oxygen. Contraction gives %O₂ (indicates excess air).'
      },
      {
        title: 'Stage 3: CO Absorption in Ammoniacal Cu₂Cl₂',
        text: 'Gas enters the third pipette containing ammoniacal cuprous chloride, absorbing toxic CO: Cu₂Cl₂ + 2CO → Cu₂Cl₂·2CO (indicates incomplete combustion).'
      },
      {
        title: 'Nitrogen by Difference',
        text: 'Inert nitrogen remains unabsorbed: %N₂ = 100 − (%CO₂ + %O₂ + %CO).'
      },
      {
        title: 'Combustion Optimization & Excess Air',
        text: 'High CO warns of fuel waste and carbon soot; high O₂ signals excess combustion air cooling the boiler furnace.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (Number(p.co2Percent) + Number(p.o2Percent) + Number(p.coPercent) >= 100) {
        w.push('Total flue gas percentages cannot exceed 100%.');
      }
      return w;
    },
    compute: (p) => {
      const co2 = Number(p.co2Percent) || 12;
      const o2 = Number(p.o2Percent) || 6;
      const co = Number(p.coPercent) || 1.2;
      const n2 = (100 - (co2 + o2 + co)).toFixed(1);

      return {
        formulas: [{
          name: 'Orsat Volumetric Gas Balance',
          formula: '%N₂ = 100 - (%CO₂ + %O₂ + %CO) | Contraction = V_initial - V_final',
          given: `CO₂ = ${co2}%, O₂ = ${o2}%, CO = ${co}%`,
          calc: `%N₂ = 100 - (${co2} + ${o2} + ${co}) = ${n2}%`,
          result: `CO₂: ${co2}%, O₂: ${o2}%, CO: ${co}%, N₂: ${n2}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'Carbon Dioxide (%CO₂)', value: `${co2}% (KOH)`, tone: 'green' },
          { label: 'Oxygen (%O₂)', value: `${o2}% (Pyrogallol)`, tone: 'blue' },
          { label: 'Carbon Monoxide (%CO)', value: `${co}% (Cu₂Cl₂)`, tone: co > 1.0 ? 'amber' : 'green' },
          { label: 'Nitrogen (%N₂ diff)', value: `${n2}%`, tone: 'blue' }
        ],
        state: { co2, o2, co, n2 },
        explain: {
          what: `Orsat flue gas volumetric absorption at ${p.stage}.`,
          why: `Specific chemical reagents selectively absorb CO₂, O₂, and CO in strict sequential order to evaluate boiler combustion efficiency.`
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
      const stage = p.stage || 'Stage 1: KOH Absorbs CO₂';

      const P = C3D.createProjector(g, view, 500, 310, 150);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4.5, 4.5], [-3.5, 3.5], -1.1, '#1e293b', 1.0);

      // ─── 1. Mahogany / Teak Wooden Cabinet (OPEN FRONT) ───
      // Base Plinth
      C3D.drawBox(g, P, [0, 0.2, -1.0], [4.8, 1.4, 0.22], '#78350f', { scene });
      // Top Cornice
      C3D.drawBox(g, P, [0, 0.2, 1.7], [4.8, 1.4, 0.22], '#78350f', { scene });
      // Backboard (Solid behind glassware)
      C3D.drawBox(g, P, [0, 0.75, 0.35], [4.6, 0.12, 2.5], '#92400e', { scene, stroke: '#451a03' });
      // Left and Right Side Walls
      C3D.drawBox(g, P, [-2.35, 0.2, 0.35], [0.18, 1.35, 2.5], '#78350f', { scene });
      C3D.drawBox(g, P, [2.35, 0.2, 0.35], [0.18, 1.35, 2.5], '#78350f', { scene });

      // Brass Carrying Handle on top
      C3D.drawPipe(g, P, [-0.6, 0.2, 1.82], [-0.6, 0.2, 2.05], 0.04, '#ca8a04', { scene });
      C3D.drawPipe(g, P, [-0.6, 0.2, 2.05], [0.6, 0.2, 2.05], 0.04, '#ca8a04', { scene });
      C3D.drawPipe(g, P, [0.6, 0.2, 2.05], [0.6, 0.2, 1.82], 0.04, '#ca8a04', { scene });

      // ─── 2. Calculate Dynamic Liquid Absorption Levels ───
      const co2Val = state.co2 || 12;
      const o2Val = state.o2 || 6;
      const coVal = state.co || 1.2;

      let buretteRise = 0.1; // fraction of 100 mL
      let activePipette = 0; // 1 = KOH, 2 = Pyro, 3 = Cu2Cl2
      if (stage.includes('Stage 1')) {
        activePipette = 1;
        buretteRise = (co2Val / 100) * 0.9;
      } else if (stage.includes('Stage 2')) {
        activePipette = 2;
        buretteRise = ((co2Val + o2Val) / 100) * 0.9;
      } else if (stage.includes('Stage 3') || stage.includes('Complete')) {
        activePipette = 3;
        buretteRise = ((co2Val + o2Val + coVal) / 100) * 0.9;
      }

      // ─── 3. Water-Jacketed Gas Burette (Left: x = -1.4) ───
      // Outer Water Jacket Cylinder (Clear glass filled with water)
      C3D.drawCylinder(g, P, [-1.4, 0, -0.85], 0.28, 2.35, '#e0f2fe', {
        scene,
        alpha: 0.25,
        stroke: 'rgba(255, 255, 255, 0.85)',
        topCap: true,
        bottomCap: true
      });

      // Inner Graduated Burette Tube
      C3D.drawCylinder(g, P, [-1.4, 0, -0.8], 0.15, 2.2, '#bae6fd', {
        scene,
        alpha: 0.35,
        stroke: 'rgba(255, 255, 255, 0.9)'
      });

      // Liquid Meniscus in Burette (Acidified water level rising with gas contraction)
      const buretteLiqH = 0.2 + buretteRise * 1.8;
      C3D.drawCylinder(g, P, [-1.4, 0, -0.8], 0.14, buretteLiqH, '#0284c7', {
        scene,
        alpha: 0.85,
        topCap: true,
        bottomCap: true
      });

      // Burette Graduations Tick Marks (0 - 100 mL scale)
      const qBurette = P([-1.4, 0, 0.3]);
      scene.add(qBurette.depth - 0.1, (ctx) => {
        ctx.save();
        for (let i = 0; i <= 10; i++) {
          const tickZ = -0.75 + (i / 10) * 2.1;
          const p1 = P([-1.4 + 0.15, 0, tickZ]);
          const p2 = P([-1.4 + 0.22, 0, tickZ]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#0369a1';
          ctx.lineWidth = i % 5 === 0 ? 2 : 1;
          ctx.stroke();
        }
        ctx.restore();
      });

      // ─── 4. Aspirator Leveling Bottle with Flexible Rubber Hose ───
      const bottleZ = -0.6 + (activePipette > 0 ? 0.35 : 0.0);
      // Glass Aspirator Bottle
      C3D.drawCylinder(g, P, [-2.05, -0.3, bottleZ], 0.22, 0.55, '#0284c7', {
        scene,
        alpha: 0.75,
        topCap: true,
        bottomCap: true
      });
      // Glass Neck & Stopper
      C3D.drawCylinder(g, P, [-2.05, -0.3, bottleZ + 0.55], 0.1, 0.2, '#bae6fd', {
        scene,
        alpha: 0.4
      });
      // Flexible Rubber Tubing connecting bottle to bottom of burette
      C3D.drawPipe(g, P, [-2.05, -0.3, bottleZ], [-1.75, -0.15, -0.9], 0.05, '#475569', { scene });
      C3D.drawPipe(g, P, [-1.75, -0.15, -0.9], [-1.4, 0, -0.85], 0.05, '#475569', { scene });

      // ─── 5. Three U-Tube Absorption Pipettes ───
      // Pipette 1: 30% KOH (for CO2 absorption, Clear alkaline solution)
      const kohLiqH = activePipette === 1 ? 1.6 : 1.25;
      C3D.drawCylinder(g, P, [-0.45, 0, -0.8], 0.22, 2.1, '#bae6fd', {
        scene,
        alpha: 0.25,
        stroke: 'rgba(255, 255, 255, 0.85)'
      });
      C3D.drawCylinder(g, P, [-0.45, 0, -0.8], 0.21, kohLiqH, '#f8fafc', {
        scene,
        alpha: 0.7,
        topCap: true,
        bottomCap: true
      });
      // Glass packing tubes inside KOH pipette (increases contact area)
      for (let k = -1; k <= 1; k++) {
        C3D.drawPipe(g, P, [-0.45 + k * 0.07, -0.05, -0.75], [-0.45 + k * 0.07, -0.05, -0.75 + kohLiqH * 0.9], 0.02, 'rgba(255, 255, 255, 0.9)', { scene });
      }

      // Pipette 2: Alkaline Pyrogallol (for O2 absorption, Dark rich amber-brown)
      const pyroLiqH = activePipette === 2 ? 1.6 : 1.25;
      C3D.drawCylinder(g, P, [0.45, 0, -0.8], 0.22, 2.1, '#bae6fd', {
        scene,
        alpha: 0.25,
        stroke: 'rgba(255, 255, 255, 0.85)'
      });
      C3D.drawCylinder(g, P, [0.45, 0, -0.8], 0.21, pyroLiqH, '#451a03', {
        scene,
        alpha: 0.92,
        topCap: true,
        bottomCap: true
      });

      // Pipette 3: Ammoniacal Cu2Cl2 (for CO absorption, Deep cyan-teal with copper spirals)
      const cuLiqH = activePipette === 3 ? 1.6 : 1.25;
      C3D.drawCylinder(g, P, [1.35, 0, -0.8], 0.22, 2.1, '#bae6fd', {
        scene,
        alpha: 0.25,
        stroke: 'rgba(255, 255, 255, 0.85)'
      });
      C3D.drawCylinder(g, P, [1.35, 0, -0.8], 0.21, cuLiqH, '#0f766e', {
        scene,
        alpha: 0.9,
        topCap: true,
        bottomCap: true
      });
      // Metallic copper spirals inside pipette 3
      for (let cSp = 0; cSp < 4; cSp++) {
        const cz = -0.7 + cSp * 0.25;
        scene.add(P([1.35, 0, cz]).depth, (ctx) => {
          const pt = P([1.35, 0, cz]);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      // Active Stage Gas Bubbles inside absorbing pipette
      if (activePipette > 0) {
        const activeX = activePipette === 1 ? -0.45 : activePipette === 2 ? 0.45 : 1.35;
        for (let b = 0; b < 5; b++) {
          const bubblePhase = (time * 2.5 + b * 0.7) % 1.2;
          const posB = [activeX + Math.sin(time * 3 + b) * 0.08, 0, -0.6 + bubblePhase];
          scene.add(P(posB).depth, (ctx) => {
            C3D.drawAtom(ctx, P, posB, 0.04, '#e0f2fe', '', '');
          });
        }
      }

      // ─── 6. Glass Capillary Manifold on Top Connecting Burette and Pipettes ───
      const manifoldZ = 1.45;
      // Main horizontal header tube
      C3D.drawPipe(g, P, [-1.4, 0, manifoldZ], [1.35, 0, manifoldZ], 0.045, '#e0f2fe', { scene });
      // Three vertical dropper legs to pipettes
      C3D.drawPipe(g, P, [-0.45, 0, manifoldZ], [-0.45, 0, 1.3], 0.035, '#e0f2fe', { scene });
      C3D.drawPipe(g, P, [0.45, 0, manifoldZ], [0.45, 0, 1.3], 0.035, '#e0f2fe', { scene });
      C3D.drawPipe(g, P, [1.35, 0, manifoldZ], [1.35, 0, 1.3], 0.035, '#e0f2fe', { scene });

      // Precision Stopcock Valves (Brass / glass keys)
      [-0.45, 0.45, 1.35].forEach((vx, idx) => {
        const isOpen = (idx + 1) === activePipette;
        C3D.drawCylinder(g, P, [vx, 0, 1.38], 0.065, 0.12, isOpen ? '#10b981' : '#b45309', {
          scene,
          topCap: true,
          bottomCap: true
        });
      });

      // 3-Way Gas Inlet Stopcock on Far Left
      C3D.drawPipe(g, P, [-1.8, 0, manifoldZ + 0.15], [-1.4, 0, manifoldZ], 0.04, '#38bdf8', { scene });

      // ─── 7. Professional CAD Outside Callouts (No Geometry Overlap!) ───
      scene.add(P([-1.4, 0, 0.9]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-1.4, 0, 0.9], 'Water-Jacketed Burette (100 mL)', {
          dx: -85,
          dy: -45,
          color: '#0284c7',
          sub: 'Constant-temperature volumetric reading'
        });
      });

      scene.add(P([-0.45, 0, 1.45]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-0.45, 0, 1.45], 'Pipette 1: KOH (30%)', {
          dx: -45,
          dy: -65,
          color: '#64748b',
          sub: `Absorbs CO₂ (Vol contraction: ${co2Val}%)`
        });
      });

      scene.add(P([0.45, 0, 1.45]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [0.45, 0, 1.45], 'Pipette 2: Alkaline Pyrogallol', {
          dx: 35,
          dy: -70,
          color: '#78350f',
          sub: `Absorbs O₂ (Vol contraction: ${o2Val}%)`
        });
      });

      scene.add(P([1.35, 0, 1.45]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [1.35, 0, 1.45], 'Pipette 3: Ammoniacal Cu₂Cl₂', {
          dx: 85,
          dy: -45,
          color: '#0f766e',
          sub: `Absorbs CO (Vol contraction: ${coVal}%)`
        });
      });

      scene.add(P([-2.05, -0.3, bottleZ + 0.3]).depth, (ctx) => {
        C3D.drawCallout(ctx, P, [-2.05, -0.3, bottleZ + 0.3], 'Aspirator Leveling Bottle', {
          dx: -80,
          dy: 35,
          color: '#0369a1',
          sub: 'Equalizes gas to atmospheric pressure'
        });
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Water-Jacketed Gas Burette', color: '#0284c7' },
        { label: `Pipette 1: KOH (${co2Val}% CO₂)`, color: '#64748b' },
        { label: `Pipette 2: Alkaline Pyrogallol (${o2Val}% O₂)`, color: '#78350f' },
        { label: `Pipette 3: Ammoniacal Cu₂Cl₂ (${coVal}% CO)`, color: '#0f766e' },
        { label: `Inert Residual N₂: ${state.n2 || 80.8}%`, color: '#10b981' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 46 — Three-Way Catalytic Converter (chem-three-way-catalyst)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-three-way-catalyst'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('lambda', 'Air-Fuel Equivalence Ratio (λ)', 0.90, 1.10, 0.01, 1.00, ''),
      r('temp', 'Catalyst Bed Temperature', 150, 750, 25, 450, '°C'),
      select('catalystMetal', 'Precious Metal Formulation', 'Pt / Pd / Rh Tri-Metal', ['Pt / Pd / Rh Tri-Metal', 'Pd / Rh High-Temp Only', 'Pt / Rh Classic'])
    ],
    steps: () => [
      {
        title: 'Three-Way Catalytic Converter Architecture',
        text: 'The catalytic converter simultaneously abates carbon monoxide (CO), unburned hydrocarbons (HC), and nitrogen oxides (NOx) in gasoline exhaust.'
      },
      {
        title: 'Ceramic Monolith & Precious Washcoat',
        text: 'A cordierite ceramic honeycomb with 400–600 cells/in² is coated with high surface area γ-Al₂O₃ washcoat impregnated with Pt, Pd, and Rh nanoparticles.'
      },
      {
        title: 'Oxidation of CO and Unburnt Hydrocarbons',
        text: 'On Platinum (Pt) and Palladium (Pd) catalytic sites: 2CO + O₂ → 2CO₂ and C_xH_y + (x + y/4)O₂ → xCO₂ + (y/2)H₂O.'
      },
      {
        title: 'Reduction of Nitrogen Oxides (NOx)',
        text: 'On Rhodium (Rh) sites: 2NO + 2CO → N₂ + 2CO₂ and 2NO_x → N₂ + xO₂, converting harmful smog precursors into inert atmospheric N₂.'
      },
      {
        title: 'The Stoichiometric Lambda Window (λ = 1.00)',
        text: 'Simultaneous >98% conversion of all three pollutants occurs only in the narrow lambda window (λ = 1.00 ± 0.005, AFR 14.7:1) governed by oxygen sensor feedback.'
      },
      {
        title: 'Catalyst Light-Off & Thermal Aging',
        text: 'The catalyst reaches >50% conversion efficiency only above the light-off temperature (~250–300°C); thermal sintering above 850°C degrades active sites.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.temp < 250) w.push('Bed below light-off temperature (250°C): minimal conversion efficiency.');
      return w;
    },
    compute: (p) => {
      const lam = Number(p.lambda) || 1.00;
      const T = Number(p.temp) || 450;

      // Light-off factor
      const lightOff = Math.min(1.0, Math.max(0, (T - 200) / 150));

      // Lambda window efficiency
      let effCO = lightOff * Math.max(0, 99 - (lam < 1.0 ? (1.0 - lam) * 200 : 0));
      let effHC = lightOff * Math.max(0, 98 - (lam < 1.0 ? (1.0 - lam) * 180 : 0));
      let effNOx = lightOff * Math.max(0, 98 - (lam > 1.0 ? (lam - 1.0) * 250 : 0));

      return {
        formulas: [{
          name: 'Simultaneous Three-Way Conversion',
          formula: 'CO + ½O₂ → CO₂ | C_xH_y + O₂ → CO₂ + H₂O | 2NO + 2CO → N₂ + 2CO₂',
          given: `λ = ${lam.toFixed(2)}, T = ${T} °C, Formulation = ${p.catalystMetal}`,
          calc: `Light-off Factor = ${(lightOff * 100).toFixed(0)}%`,
          result: `Conversion: CO: ${effCO.toFixed(1)}%, HC: ${effHC.toFixed(1)}%, NOx: ${effNOx.toFixed(1)}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'CO Conversion', value: `${effCO.toFixed(1)}%`, tone: effCO > 90 ? 'green' : 'amber' },
          { label: 'HC Conversion', value: `${effHC.toFixed(1)}%`, tone: effHC > 90 ? 'green' : 'amber' },
          { label: 'NOx Conversion', value: `${effNOx.toFixed(1)}%`, tone: effNOx > 90 ? 'green' : 'amber' },
          { label: 'Lambda Window State', value: Math.abs(lam - 1.0) <= 0.01 ? 'Optimal (λ=1.00)' : lam < 1.0 ? 'Rich (Low O₂)' : 'Lean (High O₂)', tone: Math.abs(lam - 1.0) <= 0.01 ? 'green' : 'red' }
        ],
        state: { effCO, effHC, effNOx, lightOff },
        explain: {
          what: `Catalytic emission abatement across three-way catalyst at ${T}°C, λ=${lam.toFixed(2)}.`,
          why: `Pt/Pd promotes oxidation while Rh promotes reduction; both reactions reach simultaneous peak conversion only at stoichiometric air-fuel balance (λ=1.00).`
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

      // Stainless Steel Converter Shell (Center oval cylinder)
      C3D.drawBox(g, P, [0, 0, 0.4], [2.2, 1.4, 1.2], '#64748b', { scene, stroke: '#94a3b8' });

      // Ceramic Honeycomb Substrate (Inside cutaway)
      C3D.drawBox(g, P, [0, 0, 0.4], [1.4, 1.2, 1.0], '#d97706', { scene, stroke: '#f59e0b' });

      // Inflow Raw Exhaust Pipe (Left)
      C3D.drawPipe(g, P, [-2.4, 0, 0.4], [-1.1, 0, 0.4], 0.22, '#475569', { scene });

      // Outflow Clean Tailpipe (Right)
      C3D.drawPipe(g, P, [1.1, 0, 0.4], [2.4, 0, 0.4], 0.22, '#475569', { scene });

      // Dirty exhaust molecules entering (CO, NOx, HC)
      for (let i = 0; i < 4; i++) {
        const xPos = -2.2 + ((time * 2.0 + i * 0.25) % 1.0);
        const posM = [xPos, 0, 0.4 + (i % 2 ? 0.1 : -0.1)];
        scene.add(P(posM).depth, (ctx) => { C3D.drawAtom(ctx, P, posM, 0.08, '#ef4444', i % 2 ? 'NOx' : 'CO', ''); });
      }

      // Clean molecules exiting (N2, CO2, H2O)
      for (let i = 0; i < 4; i++) {
        const xPos = 1.3 + ((time * 2.0 + i * 0.25) % 1.0);
        const posC = [xPos, 0, 0.4 + (i % 2 ? 0.1 : -0.1)];
        scene.add(P(posC).depth, (ctx) => { C3D.drawAtom(ctx, P, posC, 0.08, '#10b981', i % 2 ? 'N₂' : 'CO₂', ''); });
      }

      // Lambda Sensor Boss
      C3D.drawCylinder(g, P, [-1.3, 0, 0.7], 0.08, 0.4, '#eab308', { scene, topCap: true });

      // Tags
      scene.add(P([-1.8, 0, 0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.8, 0, 0.8], 'Raw Exhaust (CO, NOx, HC)', '#dc2626', -22); });
      scene.add(P([0, 0, 1.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.2], `Honeycomb (Pt/Pd/Rh, ${p.temp}°C)`, '#d97706', -22); });
      scene.add(P([1.8, 0, 0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.8, 0, 0.8], 'Clean Tailpipe (N₂, CO₂, H₂O)', '#15803d', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Cordierite Ceramic Honeycomb Monolith', color: '#d97706' },
        { label: 'Stainless Steel Heat Shield Housing', color: '#64748b' },
        { label: 'Harmful Pollutants (CO, HC, NOx)', color: '#ef4444', symbol: true },
        { label: 'Clean Converted Gases (N₂, CO₂, H₂O)', color: '#10b981', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 47 — Selective Catalytic Reduction of NOx (chem-scr-nox)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-scr-nox'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('ureaDose', 'Urea / AdBlue Dosing Ratio (α)', 0.5, 1.5, 0.05, 1.0, ''),
      r('exhaustTemp', 'Exhaust Gas Temperature', 180, 500, 10, 320, '°C'),
      select('catalystType', 'SCR Catalyst Formulation', 'Vanadia-Titania (V₂O₅-WO₃/TiO₂)', ['Vanadia-Titania (V₂O₅-WO₃/TiO₂)', 'Copper-Zeolite (Cu-SSZ-13)', 'Iron-Zeolite (Fe-Beta)'])
    ],
    steps: () => [
      {
        title: 'Diesel SCR System Architecture',
        text: 'Selective Catalytic Reduction (SCR) treats lean-burn diesel exhaust gases to reduce harmful NOx emissions by up to 95%.'
      },
      {
        title: 'Aqueous Urea (AdBlue) Dosing & Atomization',
        text: 'A 32.5% aqueous urea solution (AdBlue) is precisely injected via high-frequency dosing valve into the hot exhaust stream ahead of the catalyst.'
      },
      {
        title: 'Thermal Decomposition & Hydrolysis to Ammonia',
        text: 'Urea thermally decomposes into ammonia: (NH₂)₂CO → NH₃ + HNCO. Isocyanic acid then hydrolyzes: HNCO + H₂O → NH₃ + CO₂.'
      },
      {
        title: 'Standard SCR Catalytic Reduction',
        text: 'Over V₂O₅-WO₃/TiO₂ or Cu-zeolite catalyst brick: 4NH₃ + 4NO + O₂ → 4N₂ + 6H₂O, converting nitric oxide selectively into nitrogen and steam.'
      },
      {
        title: 'Fast SCR Reaction Mechanism',
        text: 'When exhaust contains equimolar NO and NO₂: 4NH₃ + 2NO + 2NO₂ → 4N₂ + 6H₂O. Fast SCR proceeds at triple the reaction velocity of standard SCR.'
      },
      {
        title: 'Ammonia Slip Catalyst (ASC) Protection',
        text: 'An ammonia slip catalyst (ASC) downstream oxidizes excess unreacted NH₃: 4NH₃ + 3O₂ → 2N₂ + 6H₂O, preventing pungent ammonia emissions.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.exhaustTemp < 200) w.push('Low exhaust temperature: risk of incomplete urea decomposition and ammonium nitrate deposit fouling.');
      return w;
    },
    compute: (p) => {
      const alpha = Number(p.ureaDose) || 1.0;
      const T = Number(p.exhaustTemp) || 320;

      const tempFactor = Math.min(1.0, Math.max(0.1, (T - 180) / 120));
      const noxConversion = Math.min(98, (alpha <= 1.0 ? alpha * 95 : 95) * tempFactor).toFixed(1);
      const nh3SlipPpm = (alpha > 1.0 ? (alpha - 1.0) * 45 : 2).toFixed(1);

      return {
        formulas: [{
          name: 'SCR Stoichiometry & Hydrolysis',
          formula: '(NH₂)₂CO + H₂O → 2NH₃ + CO₂ | 4NH₃ + 4NO + O₂ → 4N₂ + 6H₂O',
          given: `α = ${alpha}, T = ${T}°C, Catalyst = ${p.catalystType}`,
          calc: `NOx Conversion = ${noxConversion}%, NH₃ Slip = ${nh3SlipPpm} ppm`,
          result: `NOx Conversion = ${noxConversion}%, NH₃ Slip = ${nh3SlipPpm} ppm`,
          unit: '%'
        }],
        readouts: [
          { label: 'NOx Conversion Efficiency', value: `${noxConversion}%`, tone: Number(noxConversion) > 90 ? 'green' : 'amber' },
          { label: 'Ammonia Slip', value: `${nh3SlipPpm} ppm`, tone: Number(nh3SlipPpm) < 10 ? 'green' : 'red' },
          { label: 'Urea Hydrolysis State', value: T > 220 ? 'Complete Gas Phase' : 'Sluggish / Risk of Deposits', tone: T > 220 ? 'green' : 'amber' },
          { label: 'Exhaust Quality', value: 'Clean N₂ + Steam', tone: 'green' }
        ],
        state: { noxConversion, nh3SlipPpm },
        explain: {
          what: `Diesel exhaust SCR aftertreatment with ${p.catalystType} at ${T}°C, dosing ratio α=${alpha}.`,
          why: `Urea provides in-situ ammonia reducing agent to convert toxic NO and NO₂ into harmless nitrogen and water.`
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

      // Exhaust Pipe Tube
      C3D.drawPipe(g, P, [-2.6, 0, 0.4], [2.6, 0, 0.4], 0.28, '#475569', { scene });

      // SCR Catalyst Honeycomb Housing (Center wide chamber)
      C3D.drawBox(g, P, [0.5, 0, 0.4], [1.6, 1.4, 1.2], '#334155', { scene, stroke: '#10b981' });

      // AdBlue Urea Dosing Nozzle on pipe upstream (Left)
      C3D.drawCylinder(g, P, [-1.4, 0, 0.8], 0.08, 0.6, '#38bdf8', { scene, topCap: true });

      // Fine urea spray droplets
      for (let i = 0; i < 5; i++) {
        const sx = -1.3 + ((time * 2.0 + i * 0.2) % 0.8);
        const sz = 0.5 - ((time * 1.5 + i * 0.15) % 0.2);
        const posSpray = [sx, 0, sz];
        scene.add(P(posSpray).depth, (ctx) => { C3D.drawAtom(ctx, P, posSpray, 0.05, '#38bdf8', '', ''); });
      }

      // Tags
      scene.add(P([-1.4, 0, 1.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.4, 0, 1.5], 'AdBlue Dosing Injector', '#0284c7', -22); });
      scene.add(P([0.5, 0, 1.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.5, 0, 1.2], `SCR Brick (${p.exhaustTemp}°C)`, '#10b981', -22); });
      scene.add(P([2.0, 0, 0.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [2.0, 0, 0.8], `Clean N₂ (${state.noxConversion || 95}%)`, '#15803d', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'SCR Honeycomb Catalyst Brick', color: '#10b981' },
        { label: 'AdBlue Urea Injector Spray', color: '#38bdf8' },
        { label: `NOx Conversion: ${state.noxConversion || 95}%`, color: '#10b981' },
        { label: `Ammonia Slip: ${state.nh3SlipPpm || 2} ppm`, color: '#eab308' }
      ], 24, 88);
    }
  };

  window.Chem3DSimulators = Object.assign(window.Chem3DSimulators || {}, Sim3D);
})();
