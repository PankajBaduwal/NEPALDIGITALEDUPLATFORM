'use strict';

/**
 * ChemSims3D-U2 — Unit II: Electrochemistry & Energy Storage Systems
 * Complete interactive 3D simulations:
 *  1. chem-electrochemical-series (Interactive reduction potential bench, SHE reference, displacement spontaneity)
 *  2. chem-lead-acid (Cutaway automotive lead-acid secondary cell, spongy Pb / PbO2, sulfation, hydrometer sg)
 *  3. chem-fuel-cell (Porous electrode continuous H2/O2 fuel cell, gas diffusion layers, alkaline electrolyte)
 *  4. chem-sofc (High-temperature Solid Oxide Fuel Cell, Ni-YSZ / YSZ solid ceramic electrolyte / LSM, O2- ion lattice migration)
 *  5. chem-solar-cell (Silicon p-n junction photovoltaic cutaway, depletion field, electron-hole generation, I-V curves)
 *  6. chem-dssc (Dye-Sensitized Grätzel cell, mesoporous TiO2, Ru dye photoexcitation, I-/I3- redox shuttle, Pt cathode)
 */
(function () {
  const C3D = window.Chem3D;
  const V = C3D.V;
  const D = window.EPDraw;

  const Sim3D = {};

  const r = (key, label, min, max, step, value, unit) => ({ key, label, type: 'range', min, max, step, default: value, unit: unit || '' });
  const select = (key, label, value, options) => ({ key, label, type: 'select', default: value, options: options.map((x) => ({ label: x, value: x })) });

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 14 — Electrochemical Series Simulator (chem-electrochemical-series)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-electrochemical-series'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.35, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('metalA', 'Anode Metal (Oxidation)', 'Zinc (Zn)', ['Lithium (Li)', 'Magnesium (Mg)', 'Aluminium (Al)', 'Zinc (Zn)', 'Iron (Fe)', 'Lead (Pb)']),
      select('metalB', 'Cathode Metal (Reduction)', 'Copper (Cu)', ['Copper (Cu)', 'Silver (Ag)', 'Gold (Au)', 'Nickel (Ni)', 'Standard Hydrogen (H₂)']),
      r('temp', 'Cell Temperature', 10, 60, 5, 25, '°C'),
      r('concA', 'Anode ion concentration [Mⁿ⁺]', 0.01, 2.0, 0.05, 1.0, 'M'),
      r('concB', 'Cathode ion concentration [Mⁿ⁺]', 0.01, 2.0, 0.05, 1.0, 'M')
    ],
    steps: () => [
      {
        title: 'Inspect Standard Hydrogen Reference (SHE)',
        text: 'The electrochemical series arranges elements in increasing standard reduction potentials (E°) measured against the Standard Hydrogen Electrode (SHE, 0.00 V).'
      },
      {
        title: 'Mount Selected Metal Electrodes',
        text: 'Two metal strips are immersed in their respective 1.0 M salt solutions: the more reactive metal acts as anode (oxidation), while the less reactive acts as cathode.'
      },
      {
        title: 'Complete Circuit via Salt Bridge',
        text: 'An agar-agar salt bridge filled with KCl/KNO₃ provides electrical neutrality, preventing liquid junction potential and charge accumulation.'
      },
      {
        title: 'Spontaneous Electron Transfer',
        text: 'Electrons spontaneously migrate through the external circuit from the lower-potential anode to the higher-potential cathode: ΔG° = -nFE° < 0.'
      },
      {
        title: 'Observe Measured Cell Voltage',
        text: 'Digital voltmeter registers the electromotive force (EMF). Cell potential changes with concentration according to the Nernst equation: E = E° - (RT/nF)·ln(Q).'
      },
      {
        title: 'Analyze Displacement Feasibility',
        text: 'Metals with more negative reduction potentials displace metals with higher reduction potentials from their aqueous salt solutions.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.metalA === p.metalB) w.push('Select two different metals to create a galvanic couple.');
      return w;
    },
    compute: (p) => {
      const series = {
        'Lithium (Li)': { e0: -3.04, n: 1, color: '#94a3b8', sym: 'Li', chg: '+' },
        'Magnesium (Mg)': { e0: -2.37, n: 2, color: '#cbd5e1', sym: 'Mg', chg: '2+' },
        'Aluminium (Al)': { e0: -1.66, n: 3, color: '#cbd5e1', sym: 'Al', chg: '3+' },
        'Zinc (Zn)': { e0: -0.76, n: 2, color: '#94a3b8', sym: 'Zn', chg: '2+' },
        'Iron (Fe)': { e0: -0.44, n: 2, color: '#64748b', sym: 'Fe', chg: '2+' },
        'Lead (Pb)': { e0: -0.13, n: 2, color: '#475569', sym: 'Pb', chg: '2+' },
        'Standard Hydrogen (H₂)': { e0: 0.00, n: 2, color: '#38bdf8', sym: 'H', chg: '+' },
        'Nickel (Ni)': { e0: -0.25, n: 2, color: '#a1a1aa', sym: 'Ni', chg: '2+' },
        'Copper (Cu)': { e0: +0.34, n: 2, color: '#d97706', sym: 'Cu', chg: '2+' },
        'Silver (Ag)': { e0: +0.80, n: 1, color: '#e2e8f0', sym: 'Ag', chg: '+' },
        'Gold (Au)': { e0: +1.50, n: 3, color: '#eab308', sym: 'Au', chg: '3+' }
      };

      const a = series[p.metalA] || series['Zinc (Zn)'];
      const b = series[p.metalB] || series['Copper (Cu)'];
      const stdEmf = b.e0 - a.e0;
      const n = Math.min(a.n, b.n);
      const T = (Number(p.temp) || 25) + 273.15;
      const ca = Number(p.concA) || 1.0;
      const cb = Number(p.concB) || 1.0;
      const Q = ca / Math.max(0.001, cb);
      const nernstFactor = (8.314 * T) / (n * 96485);
      const cellEmf = stdEmf - nernstFactor * Math.log(Q);
      const deltaG = -n * 96485 * cellEmf / 1000;

      return {
        formulas: [{
          name: 'Nernst Cell Potential',
          formula: 'E_cell = E°_cathode - E°_anode - (RT/nF)·ln([Anode]/[Cathode])',
          given: `E°_A = ${a.e0.toFixed(2)} V, E°_B = ${b.e0.toFixed(2)} V, T = ${T.toFixed(1)} K, Q = ${Q.toFixed(2)}`,
          calc: `${b.e0.toFixed(2)} - (${a.e0.toFixed(2)}) - ${nernstFactor.toFixed(4)}·ln(${Q.toFixed(2)})`,
          result: `${cellEmf.toFixed(3)} V`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Standard Cell EMF (E°)', value: `${stdEmf.toFixed(2)} V`, tone: stdEmf > 0 ? 'green' : 'amber' },
          { label: 'Real EMF (Nernst)', value: `${cellEmf.toFixed(3)} V`, tone: cellEmf > 0 ? 'green' : 'red' },
          { label: 'Free Energy ΔG°', value: `${deltaG.toFixed(1)} kJ/mol`, tone: deltaG < 0 ? 'green' : 'red' },
          { label: 'Reaction Spontaneity', value: cellEmf > 0 ? 'Spontaneous (Galvanic)' : 'Non-spontaneous', tone: cellEmf > 0 ? 'green' : 'red' }
        ],
        state: { a, b, stdEmf, cellEmf, deltaG, Q },
        explain: {
          what: `Galvanic cell coupling ${p.metalA} (anode, E°=${a.e0}V) with ${p.metalB} (cathode, E°=${b.e0}V).`,
          why: `Electrons flow spontaneously from the metal with lower reduction potential to higher reduction potential, releasing electrical energy.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const step = st.step || 0;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Left Beaker (Anode)
      C3D.drawBeaker(g, P, [-1.8, 0, -0.9], 0.75, 1.8, '#38bdf8', 0.65, { scene });
      // Left Electrode Plate
      C3D.drawBox(g, P, [-1.8, 0, 0.2], [0.35, 0.08, 1.8], state.a ? state.a.color : '#94a3b8', { scene });

      // Right Beaker (Cathode)
      C3D.drawBeaker(g, P, [1.8, 0, -0.9], 0.75, 1.8, '#3b82f6', 0.65, { scene });
      // Right Electrode Plate
      C3D.drawBox(g, P, [1.8, 0, 0.2], [0.35, 0.08, 1.8], state.b ? state.b.color : '#d97706', { scene });

      // Inverted Salt Bridge
      C3D.drawPipe(g, P, [-1.1, 0, 0.2], [-1.1, 0, 1.0], 0.09, '#fef08a', { scene });
      C3D.drawPipe(g, P, [-1.1, 0, 1.0], [1.1, 0, 1.0], 0.09, '#fef08a', { scene });
      C3D.drawPipe(g, P, [1.1, 0, 1.0], [1.1, 0, 0.2], 0.09, '#fef08a', { scene });

      // Voltmeter on Lab Bench
      C3D.drawVoltmeter(g, P, [0, 0, 1.3], 1.1, state.cellEmf !== undefined ? state.cellEmf : 1.1, 3.0, {
        scene,
        label: 'CELL EMF (V)',
        decimals: 3
      });

      // External Wires
      scene.add(P([0, 0, 2.0]).depth, (ctx) => {
        ctx.save();
        const q1 = P([-1.8, 0, 1.1]), q2 = P([-0.5, 0, 1.5]);
        const q3 = P([1.8, 0, 1.1]), q4 = P([0.5, 0, 1.5]);
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke();
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath(); ctx.moveTo(q3.x, q3.y); ctx.lineTo(q4.x, q4.y); ctx.stroke();
        ctx.restore();
      });

      // Ion animations in beakers
      if (step >= 2) {
        for (let i = 0; i < 4; i++) {
          const zOff = -0.6 + ((time * 0.3 + i * 0.25) % 0.8);
          const posA = [-1.8 + (i % 2 ? 0.3 : -0.3), 0, zOff];
          scene.add(P(posA).depth, (ctx) => {
            C3D.drawAtom(ctx, P, posA, 0.1, '#0284c7', state.a ? state.a.sym : 'M', state.a ? state.a.chg : 'n+');
          });
          const posB = [1.8 + (i % 2 ? 0.3 : -0.3), 0, zOff];
          scene.add(P(posB).depth, (ctx) => {
            C3D.drawAtom(ctx, P, posB, 0.1, '#d97706', state.b ? state.b.sym : 'M', state.b ? state.b.chg : 'n+');
          });
        }
      }

      // Tags
      scene.add(P([-1.8, 0, 1.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [-1.8, 0, 1.2], `${p.metalA} Anode (E° = ${state.a ? state.a.e0 : -0.76}V)`, '#0284c7', -22);
      });
      scene.add(P([1.8, 0, 1.2]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [1.8, 0, 1.2], `${p.metalB} Cathode (E° = ${state.b ? state.b.e0 : 0.34}V)`, '#b45309', -22);
      });
      scene.add(P([0, 0, 1.0]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [0, 0, 1.0], 'KCl Salt Bridge', '#ca8a04', -22);
      });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: `Anode: ${p.metalA} (Oxidation: M → Mⁿ⁺ + ne⁻)`, color: '#0284c7' },
        { label: `Cathode: ${p.metalB} (Reduction: Mⁿ⁺ + ne⁻ → M)`, color: '#b45309' },
        { label: 'Electrolyte Ions (Hydrated Mⁿ⁺)', color: '#38bdf8', symbol: true },
        { label: 'Agar-Agar KCl Salt Bridge (K⁺/Cl⁻)', color: '#fef08a' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 16 — Lead-Acid Battery Simulator (chem-lead-acid)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-lead-acid'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('opMode', 'Operating State', 'Discharging (Powering Load)', ['Discharging (Powering Load)', 'Charging (Alternator / DC Supply)']),
      r('soc', 'State of Charge (SOC)', 0, 100, 5, 80, '%'),
      r('current', 'Operating Current', 1, 20, 1, 5, 'A'),
      r('temp', 'Electrolyte Temperature', 0, 50, 5, 25, '°C')
    ],
    steps: () => [
      {
        title: 'Cell Architecture & Active Materials',
        text: 'The secondary cell houses spongy lead (Pb, grey) anode plates and lead dioxide (PbO₂, dark chocolate) cathode plates immersed in ~35% dilute H₂SO₄.'
      },
      {
        title: 'Discharging Reaction (Powering Load)',
        text: 'Anode oxidizes: Pb + HSO₄⁻ → PbSO₄ + H⁺ + 2e⁻. Cathode reduces: PbO₂ + 3H⁺ + HSO₄⁻ + 2e⁻ → PbSO₄ + 2H₂O. White lead sulfate deposits on both plates.'
      },
      {
        title: 'Electrolyte Dilution & Density Drop',
        text: 'Sulfuric acid is consumed and water is produced. Electrolyte specific gravity drops from 1.280 g/cm³ (fully charged) down to 1.150 g/cm³ (discharged).'
      },
      {
        title: 'Charging Reaction (Reversing Chemical Changes)',
        text: 'External DC charger forces electron flow in reverse: PbSO₄ on anode reduces back to spongy Pb; PbSO₄ on cathode oxidizes back to dark PbO₂.'
      },
      {
        title: 'Acid Regeneration & Gassing Stage',
        text: 'H₂SO₄ is regenerated, restoring specific gravity to 1.28. Overcharging electrolyzes water into hydrogen gas at the cathode and oxygen at the anode.'
      },
      {
        title: 'State of Health & Sulfation Monitoring',
        text: 'Repeated deep discharge causes irreversible crystalline lead sulfate coarsening, reducing active surface area and cell capacity.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.soc < 15) w.push('Deep discharge warning: Plate sulfation risk increases below 20% SOC.');
      return w;
    },
    compute: (p) => {
      const isCharging = p.opMode.includes('Charging');
      const soc = Number(p.soc) || 80;
      const I = Number(p.current) || 5;
      const spGravity = 1.15 + (soc / 100) * 0.13;
      const vCell = Math.max(1.75, Math.min(2.45, 1.95 + (soc / 100) * 0.20 + (isCharging ? 0.15 : -0.05)));
      const pbso4Percent = 100 - soc;

      return {
        formulas: [{
          name: 'Overall Cell Reversible Reaction',
          formula: 'Pb(s) + PbO₂(s) + 2H₂SO₄(aq) ⇌ 2PbSO₄(s) + 2H₂O(l) (E° = +2.05 V)',
          given: `SOC = ${soc}%, Mode = ${isCharging ? 'Charging' : 'Discharging'}, I = ${I} A`,
          calc: `SG = 1.150 + (${soc}/100) × 0.130 = ${spGravity.toFixed(3)}`,
          result: `V_cell = ${vCell.toFixed(2)} V, SG = ${spGravity.toFixed(3)} g/cm³`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Cell Terminal Voltage', value: `${vCell.toFixed(2)} V`, tone: vCell > 2.0 ? 'green' : 'amber' },
          { label: 'Electrolyte Spec. Gravity', value: `${spGravity.toFixed(3)} g/cm³`, tone: spGravity > 1.25 ? 'green' : 'amber' },
          { label: 'State of Charge (SOC)', value: `${soc}%`, tone: soc > 50 ? 'green' : 'red' },
          { label: 'Plate Sulfation (PbSO₄)', value: `${pbso4Percent}%`, tone: pbso4Percent < 40 ? 'green' : 'amber' }
        ],
        state: { isCharging, soc, spGravity, vCell, pbso4Percent },
        explain: {
          what: `Automotive lead-acid cell operating in ${isCharging ? 'Charging' : 'Discharging'} mode at ${soc}% SOC.`,
          why: `During discharge, both electrodes convert to insoluble PbSO₄ and H₂SO₄ is diluted into water. Charging reverses the process to regenerate active Pb and PbO₂.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const step = st.step || 0;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Battery Polypropylene Case (Transparent cutaway)
      C3D.drawBox(g, P, [0, 0, 0], [2.8, 1.8, 2.0], 'rgba(15, 23, 42, 0.45)', { scene, stroke: '#38bdf8' });

      // Anode Plate (Spongy Lead - Grey)
      const leadColor = state.soc > 60 ? '#64748b' : '#94a3b8';
      C3D.drawBox(g, P, [-0.8, 0, 0.1], [0.25, 1.2, 1.7], leadColor, { scene });

      // Cathode Plate (Lead Dioxide - Dark Chocolate Brown)
      const pbo2Color = state.soc > 60 ? '#451a03' : '#78350f';
      C3D.drawBox(g, P, [0.8, 0, 0.1], [0.25, 1.2, 1.7], pbo2Color, { scene });

      // Microporous Separator
      C3D.drawBox(g, P, [0, 0, 0.1], [0.08, 1.3, 1.8], '#fef08a', { scene });

      // Voltmeter on Bench
      C3D.drawVoltmeter(g, P, [0, 0, 2.1], 1.0, state.vCell || 2.05, 3.0, {
        scene,
        label: state.isCharging ? 'CHARGE VOLTS' : 'DISCHARGE V',
        decimals: 2
      });

      // Sulfate crystals / bubbles
      if (state.isCharging) {
        for (let i = 0; i < 4; i++) {
          const bZ = -0.5 + ((time * 0.8 + i * 0.3) % 1.4);
          const posO = [0.8 + (i % 2 ? 0.15 : -0.15), 0, bZ];
          scene.add(P(posO).depth, (ctx) => { C3D.drawAtom(ctx, P, posO, 0.08, '#ffffff', 'O', '2'); });
          const posH = [-0.8 + (i % 2 ? 0.15 : -0.15), 0, bZ];
          scene.add(P(posH).depth, (ctx) => { C3D.drawAtom(ctx, P, posH, 0.08, '#ffffff', 'H', '2'); });
        }
      } else {
        for (let i = 0; i < 4; i++) {
          const ionX = -0.6 + ((time * 0.3 + i * 0.3) % 1.2);
          const posS = [ionX, 0, -0.2 + (i % 2 ? 0.3 : -0.3)];
          scene.add(P(posS).depth, (ctx) => { C3D.drawAtom(ctx, P, posS, 0.09, '#eab308', 'SO₄', '2-'); });
        }
      }

      // Tags
      scene.add(P([-0.8, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.8, 0, 1.1], 'Anode: Spongy Pb (−)', '#475569', -22); });
      scene.add(P([0.8, 0, 1.1]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.8, 0, 1.1], 'Cathode: PbO₂ (+)', '#78350f', -22); });
      scene.add(P([0, 0, 0.5]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 0.5], `H₂SO₄ (SG: ${state.spGravity ? state.spGravity.toFixed(3) : 1.28})`, '#0284c7', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Spongy Lead Anode (Pb)', color: '#64748b' },
        { label: 'Lead Dioxide Cathode (PbO₂)', color: '#78350f' },
        { label: 'H₂SO₄ Electrolyte (Dilute Acid)', color: '#38bdf8' },
        { label: 'Microporous Separator', color: '#fef08a' },
        { label: 'SO₄²⁻ Sulfate Ions', color: '#eab308', symbol: true }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 18 — Fuel Cell Simulator (chem-fuel-cell)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-fuel-cell'] = {
    view3d: true,
    initialView: { yaw: -0.45, pitch: 0.34, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('cellType', 'Fuel Cell Architecture', 'Alkaline Fuel Cell (AFC)', ['Alkaline Fuel Cell (AFC)', 'Phosphoric Acid (PAFC)', 'Direct Methanol (DMFC)']),
      r('h2Flow', 'H₂ Fuel Flow Rate', 10, 100, 5, 50, 'sccm'),
      r('o2Flow', 'O₂ Oxidant Flow Rate', 10, 100, 5, 50, 'sccm'),
      r('currentLoad', 'Operating Current Density', 100, 1000, 50, 400, 'mA/cm²'),
      r('temp', 'Operating Temperature', 20, 90, 5, 65, '°C')
    ],
    steps: () => [
      {
        title: 'Continuous Reactant Feeding',
        text: 'Fuel cells convert chemical energy of fuel directly into electricity without thermodynamic Carnot cycle limitations, receiving continuous H₂ and O₂ feeds.'
      },
      {
        title: 'Anode Catalytic Oxidation',
        text: 'At the porous nickel/platinum anode, H₂ fuel gas diffuses through the gas diffusion layer and is catalytically oxidized to release electrons.'
      },
      {
        title: 'Electrolyte Ion Migration',
        text: 'In AFC, OH⁻ hydroxide ions migrate across the alkaline KOH electrolyte from cathode to anode: 2H₂ + 4OH⁻ → 4H₂O + 4e⁻.'
      },
      {
        title: 'Cathode Catalytic Reduction',
        text: 'At the cathode, O₂ gas reacts with incoming external electrons and water to regenerate hydroxide ions: O₂ + 2H₂O + 4e⁻ → 4OH⁻.'
      },
      {
        title: 'Power Generation & Water Extraction',
        text: 'Electrons flow through the external electrical load, producing clean DC power with water and waste heat as the sole exhaust products.'
      },
      {
        title: 'Polarization Curve & Efficiency',
        text: 'Cell operating voltage decreases with current density due to activation overpotential, ohmic resistance, and mass transport concentration losses.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.h2Flow < 20) w.push('H₂ fuel starvation: increase fuel flow to prevent cell reversal.');
      return w;
    },
    compute: (p) => {
      const j = Number(p.currentLoad) || 400;
      const T = (Number(p.temp) || 65) + 273.15;
      const eNernst = 1.229 - 0.00085 * (T - 298.15);
      const etaAct = 0.06 * Math.log(j / 10 + 1);
      const etaOhm = (j / 1000) * 0.25;
      const etaConc = 0.02 * Math.exp(j / 900);
      const vCell = Math.max(0.4, eNernst - etaAct - etaOhm - etaConc);
      const powerDensity = (vCell * j) / 1000;
      const efficiency = (vCell / 1.48) * 100;

      return {
        formulas: [{
          name: 'Overall Fuel Cell Reaction',
          formula: '2H₂(g) + O₂(g) → 2H₂O(l) + Electrical Energy (E°_rev = 1.229 V)',
          given: `J = ${j} mA/cm², T = ${T.toFixed(1)} K, E_Nernst = ${eNernst.toFixed(3)} V`,
          calc: `${eNernst.toFixed(3)} - η_act(${etaAct.toFixed(3)}) - η_ohm(${etaOhm.toFixed(3)}) - η_conc(${etaConc.toFixed(3)})`,
          result: `${vCell.toFixed(3)} V, P = ${powerDensity.toFixed(2)} W/cm²`,
          unit: 'V'
        }],
        readouts: [
          { label: 'Cell Operating Voltage', value: `${vCell.toFixed(3)} V`, tone: vCell > 0.65 ? 'green' : 'amber' },
          { label: 'Power Output Density', value: `${powerDensity.toFixed(2)} W/cm²`, tone: 'blue' },
          { label: 'Thermodynamic Efficiency', value: `${efficiency.toFixed(1)}%`, tone: 'green' },
          { label: 'Waste Heat Released', value: `${((1.48 - vCell) * j / 10).toFixed(0)} mW/cm²`, tone: 'amber' }
        ],
        state: { vCell, powerDensity, efficiency, j },
        explain: {
          what: `Fuel cell generating clean DC electricity by direct electrochemical oxidation of H₂ with O₂.`,
          why: `Direct chemical-to-electrical conversion bypasses the Carnot efficiency limit of thermal combustion engines, achieving >55% efficiency.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const step = st.step || 0;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Anode Flow Plate
      C3D.drawBox(g, P, [-1.5, 0, 0.4], [0.6, 1.8, 2.2], '#1e293b', { scene });
      C3D.drawBox(g, P, [-1.0, 0, 0.4], [0.2, 1.6, 2.0], '#475569', { scene });

      // Central Electrolyte
      C3D.drawBox(g, P, [0, 0, 0.4], [1.6, 1.8, 2.2], 'rgba(2, 132, 199, 0.4)', { scene, stroke: '#38bdf8' });

      // Cathode Porous Electrode
      C3D.drawBox(g, P, [1.0, 0, 0.4], [0.2, 1.6, 2.0], '#334155', { scene });
      C3D.drawBox(g, P, [1.5, 0, 0.4], [0.6, 1.8, 2.2], '#1e293b', { scene });

      // H2 Infeed Pipe
      C3D.drawPipe(g, P, [-2.4, 0, 1.0], [-1.5, 0, 1.0], 0.12, '#38bdf8', { scene });
      // O2 Infeed Pipe
      C3D.drawPipe(g, P, [2.4, 0, 1.0], [1.5, 0, 1.0], 0.12, '#ef4444', { scene });
      // Water Exhaust Pipe at bottom
      C3D.drawPipe(g, P, [-0.5, 0, -0.6], [-0.5, 0, -1.2], 0.12, '#38bdf8', { scene });

      // Voltmeter
      C3D.drawVoltmeter(g, P, [0, 0, 2.2], 1.0, state.vCell || 0.72, 2.0, {
        scene,
        label: 'CELL VOLTAGE (V)',
        decimals: 3
      });

      // OH- ion migration
      for (let i = 0; i < 4; i++) {
        const xPos = 0.7 - ((time * 0.4 + i * 0.3) % 1.4);
        const posOH = [xPos, 0, 0.4 + (i % 2 ? 0.3 : -0.3)];
        scene.add(P(posOH).depth, (ctx) => { C3D.drawAtom(ctx, P, posOH, 0.08, '#a855f7', 'OH', '-'); });
      }

      // Tags
      scene.add(P([-1.8, 0, 1.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.8, 0, 1.2], 'H₂ Fuel Feed', '#0284c7', -22); });
      scene.add(P([1.8, 0, 1.2]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.8, 0, 1.2], 'O₂ Oxidant Feed', '#dc2626', -22); });
      scene.add(P([0, 0, 1.0]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.0], 'KOH Electrolyte', '#9333ea', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'H₂ Gas Molecule Feed', color: '#38bdf8', symbol: true },
        { label: 'O₂ Gas Molecule Feed', color: '#ef4444', symbol: true },
        { label: 'OH⁻ Hydroxide Shuttle Ions', color: '#a855f7', symbol: true },
        { label: 'Porous Gas Diffusion Electrodes', color: '#475569' },
        { label: 'H₂O Pure Water Byproduct', color: '#0284c7' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 20 — Solid Oxide Fuel Cell Simulator (chem-sofc)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-sofc'] = {
    view3d: true,
    initialView: { yaw: -0.46, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('temp', 'Operating Temperature', 500, 1000, 25, 800, '°C'),
      select('fuel', 'Anode Fuel Gas', 'Hydrogen (H₂)', ['Hydrogen (H₂)', 'Carbon Monoxide (CO)', 'Methane (CH₄ Direct Reforming)']),
      r('pressure', 'Operating Chamber Pressure', 1.0, 10.0, 0.5, 1.0, 'bar'),
      r('currentDensity', 'Current Density Load', 100, 1200, 50, 600, 'mA/cm²')
    ],
    steps: () => [
      {
        title: 'High-Temperature Solid Ceramic Architecture',
        text: 'SOFC operates at 600–1000°C using an entirely solid-state ceramic design: porous Ni-YSZ cermet anode, dense YSZ electrolyte, and porous LSM cathode.'
      },
      {
        title: 'Cathode Oxygen Reduction',
        text: 'At the LSM (La₁₋ₓSrₓMnO₃) cathode, O₂ gas is catalytically reduced by incoming electrons to form oxygen oxide ions: O₂ + 4e⁻ → 2O²⁻.'
      },
      {
        title: 'Solid Oxide Lattice Ion Transport',
        text: 'Oxygen ions (O²⁻) migrate *through* vacant oxygen sites in the solid crystalline ceramic lattice of Yttria-Stabilized Zirconia (YSZ) from cathode to anode.'
      },
      {
        title: 'Anode Oxidation & Fuel Flexibility',
        text: 'At the Ni-YSZ anode, O²⁻ ions combine with fuel: H₂ + O²⁻ → H₂O + 2e⁻ (or CO + O²⁻ → CO₂ + 2e⁻). The high temperature allows direct internal hydrocarbon reforming.'
      },
      {
        title: 'Combined Heat & Power (CHP) Generation',
        text: 'High-temperature exhaust gases (700–850°C) drive gas turbines in hybrid cycles, boosting total plant thermal efficiency above 80%.'
      },
      {
        title: 'Thermal Stress & Coking Resistance',
        text: 'Thermal expansion coefficient matching between ceramic layers is critical to prevent delamination and mechanical failure during thermal cycling.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.temp < 600) w.push('Temperature too low for YSZ ionic conductivity; significant ohmic losses will occur.');
      return w;
    },
    compute: (p) => {
      const T = (Number(p.temp) || 800) + 273.15;
      const j = Number(p.currentDensity) || 600;
      const sigma = (1e5 / T) * Math.exp(-0.95 * 11604 / T);
      const eNernst = 1.25 - 0.00028 * (T - 298.15);
      const rOhm = 0.15 / Math.max(0.01, sigma * 10);
      const etaOhm = (j / 1000) * rOhm;
      const etaAct = 0.04 * Math.log(j / 20 + 1);
      const vCell = Math.max(0.3, eNernst - etaOhm - etaAct);
      const powerDensity = (vCell * j) / 1000;
      const chpEff = 50 + (T - 873) * 0.03;

      return {
        formulas: [{
          name: 'SOFC High-Temperature Electrochemistry',
          formula: 'Cathode: O₂ + 4e⁻ → 2O²⁻ | Anode: 2H₂ + 2O²⁻ → 2H₂O + 4e⁻',
          given: `T = ${p.temp} °C (${T.toFixed(0)} K), J = ${j} mA/cm², σ_YSZ = ${sigma.toFixed(3)} S/cm`,
          calc: `E_rev(${eNernst.toFixed(3)}) - η_ohm(${etaOhm.toFixed(3)}) - η_act(${etaAct.toFixed(3)})`,
          result: `${vCell.toFixed(3)} V, P = ${powerDensity.toFixed(2)} W/cm²`,
          unit: 'V'
        }],
        readouts: [
          { label: 'SOFC Cell Potential', value: `${vCell.toFixed(3)} V`, tone: vCell > 0.65 ? 'green' : 'amber' },
          { label: 'Power Output Density', value: `${powerDensity.toFixed(2)} W/cm²`, tone: 'blue' },
          { label: 'YSZ Ionic Conductivity', value: `${(sigma * 10).toFixed(2)} mS/cm`, tone: 'green' },
          { label: 'Hybrid CHP Efficiency', value: `${chpEff.toFixed(1)}%`, tone: 'green' }
        ],
        state: { vCell, powerDensity, sigma, T },
        explain: {
          what: `Solid Oxide Fuel Cell utilizing solid YSZ ceramic electrolyte conducting O²⁻ ions at ${p.temp}°C.`,
          why: `High thermal energy enables O²⁻ ions to hop through crystal vacancy sites, eliminating liquid electrolyte corrosion and supporting direct hydrocarbon fuels.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const step = st.step || 0;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Anode Ceramic Layer (Ni-YSZ cermet)
      C3D.drawBox(g, P, [-1.2, 0, 0.4], [0.4, 1.8, 2.2], '#334155', { scene });

      // Solid YSZ Electrolyte Ceramic Sheet (Cream-yellow)
      C3D.drawBox(g, P, [0, 0, 0.4], [0.35, 1.8, 2.2], '#fef08a', { scene });

      // Cathode Ceramic Layer (LSM)
      C3D.drawBox(g, P, [1.2, 0, 0.4], [0.4, 1.8, 2.2], '#475569', { scene });

      // Interconnect bipolar plates
      C3D.drawBox(g, P, [-1.8, 0, 0.4], [0.2, 1.8, 2.2], '#94a3b8', { scene });
      C3D.drawBox(g, P, [1.8, 0, 0.4], [0.2, 1.8, 2.2], '#94a3b8', { scene });

      // Voltmeter
      C3D.drawVoltmeter(g, P, [0, 0, 2.2], 1.0, state.vCell || 0.78, 2.0, {
        scene,
        label: 'SOFC VOLTS (V)',
        decimals: 3
      });

      // O2- Oxide Ion hopping across YSZ solid lattice
      for (let i = 0; i < 5; i++) {
        const xPos = 0.9 - ((time * 0.35 + i * 0.25) % 1.8);
        const posO = [xPos, 0, 0.4 + (i % 2 ? 0.35 : -0.35)];
        scene.add(P(posO).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posO, 0.09, '#ef4444', 'O', '2-');
        });
      }

      // Gas Streams
      C3D.drawPipe(g, P, [-2.6, 0, 1.0], [-1.8, 0, 1.0], 0.12, '#38bdf8', { scene });
      C3D.drawPipe(g, P, [2.6, 0, 1.0], [1.8, 0, 1.0], 0.12, '#ef4444', { scene });

      // Tags
      scene.add(P([-1.2, 0, 1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.2, 0, 1.8], 'Ni-YSZ Anode', '#334155', -22); });
      scene.add(P([0, 0, 1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [0, 0, 1.8], 'Solid YSZ Electrolyte', '#ca8a04', -22); });
      scene.add(P([1.2, 0, 1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [1.2, 0, 1.8], 'LSM Cathode', '#475569', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'O²⁻ Oxide Anion (Hopping in YSZ Lattice)', color: '#ef4444', symbol: true },
        { label: 'Solid YSZ Ceramic Electrolyte Sheet', color: '#fef08a' },
        { label: 'Porous Ni-YSZ Cermet Anode', color: '#334155' },
        { label: 'Porous LSM Perovskite Cathode', color: '#475569' },
        { label: `Thermal Glow (${p.temp}°C)`, color: '#ea580c' }
      ], 24, 88);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 21 — Solar Cell Simulator (chem-solar-cell)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-solar-cell'] = {
    view3d: true,
    initialView: { yaw: -0.46, pitch: 0.36, zoom: 1.0, panX: 0, panY: 0 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('irradiance', 'Solar Irradiance (G)', 100, 1200, 50, 1000, 'W/m²'),
      r('temp', 'Cell Temperature', 10, 75, 5, 25, '°C'),
      r('loadR', 'External Load Resistance (R_load)', 0.1, 20.0, 0.5, 3.5, 'Ω'),
      select('siliconType', 'Silicon Wafer Technology', 'Monocrystalline Silicon (c-Si)', ['Monocrystalline Silicon (c-Si)', 'Polycrystalline Silicon (poly-Si)', 'Amorphous Thin-Film (a-Si)'])
    ],
    steps: () => [
      {
        title: 'Silicon p-n Junction Layered Geometry',
        text: 'The photovoltaic cell comprises an anti-reflective coating, metallic silver front grid fingers, thin n-type emitter, depletion region, and thicker p-type base.'
      },
      {
        title: 'Depletion Layer & Built-in Electric Field',
        text: 'Thermal diffusion of electrons and holes creates fixed uncompensated dopant ions (+ in n-side, - in p-side), generating an internal electric field (E_bi).'
      },
      {
        title: 'Photon Absorption & Electron-Hole Pair Generation',
        text: 'Photons with energy hν ≥ Eg (1.12 eV for silicon) are absorbed, promoting valence electrons to the conduction band and creating electron-hole pairs.'
      },
      {
        title: 'Charge Carrier Separation by Built-in Field',
        text: 'The built-in electric field sweeps electrons into the n-region and holes into the p-region, preventing premature charge recombination.'
      },
      {
        title: 'External Photocurrent Flow to Load',
        text: 'Collected photoelectrons exit through front silver contact fingers, powering the external electrical circuit before recombining at the back contact.'
      },
      {
        title: 'I-V & P-V Characteristic Curve',
        text: 'Maximum power point tracking (MPPT) optimizes the operating point (V_mp, I_mp) to extract peak power: P_max = V_mp × I_mp = FF × V_oc × I_sc.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.irradiance < 200) w.push('Low irradiance: cell operates at reduced photocurrent.');
      return w;
    },
    compute: (p) => {
      const G = Number(p.irradiance) || 1000;
      const T = (Number(p.temp) || 25) + 273.15;
      const Rload = Number(p.loadR) || 3.5;
      const isc0 = 8.5;
      const voc0 = 0.65;
      const Isc = (G / 1000) * isc0;
      const Voc = Math.max(0.3, voc0 - 0.0022 * (T - 298.15));
      const FF = 0.78;
      const Pmax = Voc * Isc * FF;

      const Vop = Math.min(Voc, Math.max(0.05, (Isc * Rload) / (1 + (Rload * Isc) / Voc)));
      const Iop = Math.max(0, Isc * (1 - Math.exp(10 * (Vop - Voc) / Voc)));
      const Pload = Vop * Iop;
      const eff = (Pmax / (G * 0.024)) * 100;

      return {
        formulas: [{
          name: 'Photodiode Solar Cell Equation',
          formula: 'I = I_ph - I_0·[exp(qV / nkT) - 1] | P_max = FF × V_oc × I_sc',
          given: `G = ${G} W/m², T = ${T.toFixed(1)} K, R_load = ${Rload} Ω`,
          calc: `I_sc = ${Isc.toFixed(2)} A, V_oc = ${Voc.toFixed(2)} V, P_max = ${Pmax.toFixed(2)} W`,
          result: `V_op = ${Vop.toFixed(2)} V, I_op = ${Iop.toFixed(2)} A, P = ${Pload.toFixed(2)} W`,
          unit: 'W'
        }],
        readouts: [
          { label: 'Open-Circuit Voltage (Voc)', value: `${Voc.toFixed(2)} V`, tone: 'blue' },
          { label: 'Short-Circuit Current (Isc)', value: `${Isc.toFixed(2)} A`, tone: 'blue' },
          { label: 'Operating Power (P_load)', value: `${Pload.toFixed(2)} W`, tone: 'green' },
          { label: 'Module Efficiency (η)', value: `${Math.min(24, eff).toFixed(1)}%`, tone: 'green' }
        ],
        state: { Voc, Isc, Vop, Iop, Pload, Pmax, eff, G },
        explain: {
          what: `Silicon p-n junction photovoltaic cell under ${G} W/m² illumination at ${p.temp}°C.`,
          why: `Photons generate electron-hole pairs which are separated by the junction built-in field, creating a photovoltage across external load R.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const step = st.step || 0;
      const time = st.t || 0;
      const view = st.view || {};

      // Camera framing: Centered at cx: 480, cy: 285, scale: 135 (occupies ~70% of viewport, perfectly centered)
      const P = C3D.createProjector(g, view, 480, 285, 135, 10);
      const scene = C3D.createScene();

      const siliconType = p.siliconType || 'Monocrystalline Silicon (c-Si)';
      let baseColor = '#0f172a'; // c-Si: deep black-navy
      let baseStroke = '#334155';
      let arcColor = '#1e1b4b'; // deep indigo ARC
      if (siliconType.includes('Polycrystalline')) {
        baseColor = '#1e3a8a'; // poly-Si: royal blue
        baseStroke = '#60a5fa';
        arcColor = '#172554';
      } else if (siliconType.includes('Amorphous')) {
        baseColor = '#451a03'; // a-Si: amber-bronze
        baseStroke = '#78350f';
        arcColor = '#292524';
      }

      const cellX = -0.5;
      const cellW = 3.8;
      const cellD = 2.8;

      // 1. Rear Aluminum Metallization Plate (Back Contact)
      C3D.drawBox(g, P, [cellX, 0, -0.42], [cellW, cellD, 0.12], '#94a3b8', { scene, stroke: '#64748b' });
      // Rear silver solder ribbons
      C3D.drawBox(g, P, [cellX, -0.7, -0.49], [cellW, 0.2, 0.02], '#e2e8f0', { scene, stroke: '#cbd5e1' });
      C3D.drawBox(g, P, [cellX, 0.7, -0.49], [cellW, 0.2, 0.02], '#e2e8f0', { scene, stroke: '#cbd5e1' });

      // 2. Thick p-type Silicon Base Wafer (~180 µm bulk substrate)
      C3D.drawBox(g, P, [cellX, 0, -0.06], [cellW, cellD, 0.6], baseColor, { scene, stroke: baseStroke });

      // 3. p-n Depletion Region / Space Charge Layer (Built-in Electric Field E_bi)
      C3D.drawBox(g, P, [cellX, 0, 0.29], [cellW, cellD, 0.12], '#38bdf8', { scene, stroke: '#0284c7', alpha: 0.88 });

      // 4. Thin n-type Silicon Emitter Layer (Phosphorus diffused, ~0.5 µm)
      C3D.drawBox(g, P, [cellX, 0, 0.46], [cellW, cellD, 0.2], '#0369a1', { scene, stroke: '#0284c7' });

      // 5. Anti-Reflective Coating (SiNx ARC layer)
      C3D.drawBox(g, P, [cellX, 0, 0.58], [cellW, cellD, 0.04], arcColor, { scene, stroke: '#3b82f6', alpha: 0.92 });

      // 6. Front Silver Contact Metallization:
      // (a) Main Continuous Silver Busbars (2 parallel collector lines along Y)
      const busbar1X = cellX - 0.9;
      const busbar2X = cellX + 0.9;
      C3D.drawBox(g, P, [busbar1X, 0, 0.62], [0.14, cellD * 0.98, 0.04], '#f8fafc', { scene, stroke: '#cbd5e1' });
      C3D.drawBox(g, P, [busbar2X, 0, 0.62], [0.14, cellD * 0.98, 0.04], '#f8fafc', { scene, stroke: '#cbd5e1' });

      // (b) Fine Silver Grid Fingers (spaced across X along Y)
      for (let fy = -cellD / 2 + 0.25; fy <= cellD / 2 - 0.2; fy += 0.42) {
        C3D.drawBox(g, P, [cellX, fy, 0.61], [cellW * 0.98, 0.035, 0.02], '#e2e8f0', { scene, stroke: '#cbd5e1' });
      }

      // 7. Bench Support Plinth (sleek dark laboratory stand, not wireframe)
      C3D.drawBox(g, P, [cellX, 0, -0.6], [cellW + 0.4, cellD + 0.4, 0.16], '#1e293b', { scene, stroke: '#334155' });

      // 8. Digital Multimeter / Load Bench Station on the Right
      const meterX = 2.4;
      C3D.drawBox(g, P, [meterX, 0, -0.15], [1.3, 1.2, 0.8], '#1e293b', { scene, stroke: '#334155' });
      C3D.drawVoltmeter(g, P, [meterX, 0, 0.45], 1.1, step >= 5 ? state.Pload || 4.2 : state.Vop || 0.58, step >= 5 ? 20.0 : 2.0, {
        scene,
        label: step >= 5 ? 'OPERATING POWER (W)' : 'CELL VOLTAGE (V)',
        decimals: 2
      });

      // 9. External Circuit Wiring connecting front busbars and rear contact to meter
      scene.add(P([meterX, 0, 0.2]).depth, (ctx) => {
        ctx.save();
        // Negative lead from front busbar to meter
        const pBus = P([busbar2X, -cellD / 2, 0.62]);
        const pMeterNeg = P([meterX - 0.3, -0.6, 0.1]);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pBus.x, pBus.y);
        ctx.lineTo(pBus.x, pBus.y + 25);
        ctx.lineTo(pMeterNeg.x, pBus.y + 25);
        ctx.lineTo(pMeterNeg.x, pMeterNeg.y);
        ctx.stroke();

        // Positive lead from rear contact to meter
        const pRear = P([cellX, cellD / 2, -0.42]);
        const pMeterPos = P([meterX - 0.3, 0.6, 0.1]);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pRear.x, pRear.y);
        ctx.lineTo(pRear.x, pRear.y - 25);
        ctx.lineTo(pMeterPos.x, pRear.y - 25);
        ctx.lineTo(pMeterPos.x, pMeterPos.y);
        ctx.stroke();

        ctx.restore();
      });

      // 10. Incident Solar Radiation (Light Beams & Photons hν)
      const irradiance = Number(p.irradiance) || 1000;
      const numRays = Math.max(3, Math.min(6, Math.round(irradiance / 200)));
      for (let i = 0; i < numRays; i++) {
        const rx = cellX - 1.2 + i * (2.4 / (numRays - 1));
        const rz = 2.2 - ((time * 1.6 + i * 0.4) % 1.2);
        const posPhoton = [rx, -0.4, rz];
        scene.add(P(posPhoton).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posPhoton, 0.08, '#fde047', 'hν', '');
        });
      }

      // 11. Photocarrier Generation & Separation in Depletion Layer
      if (step >= 2) {
        for (let i = 0; i < 4; i++) {
          const cx = cellX - 1.0 + i * 0.68;
          const cy = -0.6 + (i % 2) * 1.2;
          const drift = (time * 0.6 + i * 0.25) % 0.3;
          // Electron e- swept UP toward n-emitter
          const posE = [cx - 0.1, cy, 0.35 + drift];
          // Hole h+ swept DOWN toward p-base
          const posH = [cx + 0.1, cy, 0.22 - drift];
          scene.add(P(posE).depth, (ctx) => { C3D.drawAtom(ctx, P, posE, 0.065, '#38bdf8', 'e', '-'); });
          scene.add(P(posH).depth, (ctx) => { C3D.drawAtom(ctx, P, posH, 0.065, '#ef4444', 'h', '+'); });
        }
      }

      // 12. Non-overlapping Clear Leader Tags (flanked neatly)
      scene.add(P([busbar1X, -cellD / 2, 0.62]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [busbar1X, -cellD / 2, 0.62], 'Silver Grid Contacts (Ag)', '#0284c7', -32);
      });
      scene.add(P([cellX - cellW / 2, 0, 0.29]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [cellX - cellW / 2, 0, 0.29], 'p-n Depletion Layer (E_bi Field)', '#0284c7', -28);
      });
      scene.add(P([cellX - cellW / 2, 0, -0.06]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [cellX - cellW / 2, 0, -0.06], `p-type Silicon Base (${siliconType.split(' ')[0]})`, '#334155', 28);
      });
      scene.add(P([cellX, cellD / 2, -0.42]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [cellX, cellD / 2, -0.42], 'Rear Al Contact Plate', '#475569', 24);
      });
      scene.add(P([meterX, 0, 0.7]).depth, (ctx) => {
        C3D.drawTag(ctx, P, [meterX, 0, 0.7], `External Load (R=${p.loadR}Ω)`, '#10b981', -30);
      });

      scene.render(g);

      // 13. Neat Scientific Legend in top-left
      C3D.drawLegend(g, [
        { label: `Incident Photons (${irradiance} W/m²)`, color: '#fde047', symbol: true },
        { label: 'Photoelectrons (e⁻ in n-type)', color: '#38bdf8', symbol: true },
        { label: 'Positive Holes (h⁺ in p-type)', color: '#ef4444', symbol: true },
        { label: 'Silver Front Busbars & Fingers', color: '#e2e8f0' },
        { label: `Silicon Wafer: ${siliconType.split(' ')[0]}`, color: baseColor }
      ], 24, 20);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SIMULATION 22 — Dye-Sensitized Solar Cell Simulator (chem-dssc)
  // ══════════════════════════════════════════════════════════════════════════
  Sim3D['chem-dssc'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.36, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('dyeType', 'Photosensitizer Dye', 'Ruthenium N719 Dye', ['Ruthenium N719 Dye', 'Organic Porphyrin Dye', 'Natural Anthocyanin (Berry Extract)']),
      r('lightIntensity', 'Illumination Intensity', 10, 100, 5, 80, 'mW/cm²'),
      r('tio2Thickness', 'TiO₂ Mesoporous Thickness', 5, 25, 1, 12, 'µm'),
      r('temp', 'Cell Temperature', 15, 65, 5, 25, '°C')
    ],
    steps: () => [
      {
        title: 'Grätzel Cell Layered Assembly',
        text: 'The DSSC mimics artificial photosynthesis using FTO glass, a mesoporous TiO₂ nanoparticle film coated with dye, an I⁻/I₃⁻ liquid electrolyte, and a Pt counter electrode.'
      },
      {
        title: 'Photoexcitation of Dye Molecules',
        text: 'Visible light excites electrons in the sensitizer: Dye + hν → Dye*. The excited electron is swiftly injected into the TiO₂ conduction band within femtoseconds.'
      },
      {
        title: 'Electron Percolation through TiO₂ Network',
        text: 'Injected electrons diffuse through the interconnected TiO₂ nanoparticle network to the transparent conducting oxide (FTO) anode collector.'
      },
      {
        title: 'External Circuit Work',
        text: 'Electrons flow through the external electrical circuit, performing useful work before reaching the platinum-catalyzed counter electrode.'
      },
      {
        title: 'I⁻ / I₃⁻ Redox Mediator Regeneration',
        text: 'At the counter electrode, triiodide is reduced back to iodide: I₃⁻ + 2e⁻ → 3I⁻. Iodide then regenerates the oxidized dye: 2Dye⁺ + 3I⁻ → 2Dye + I₃⁻.'
      },
      {
        title: 'Photovoltaic Performance Metrics',
        text: 'The regenerative chemical cycle continues indefinitely without permanent chemical degradation under hermetic sealing.'
      }
    ],
    validate: (p) => {
      const w = [];
      if (p.dyeType.includes('Anthocyanin')) w.push('Natural fruit dye exhibits lower efficiency (~1.5%) compared to synthetic Ruthenium complexes (~11%).');
      return w;
    },
    compute: (p) => {
      const I_light = Number(p.lightIntensity) || 80;
      const th = Number(p.tio2Thickness) || 12;
      const isRu = p.dyeType.includes('Ruthenium');
      const isPorphyrin = p.dyeType.includes('Porphyrin');

      const maxEff = isRu ? 11.2 : isPorphyrin ? 12.8 : 1.8;
      const Voc = isRu ? 0.74 : isPorphyrin ? 0.78 : 0.45;
      const Jsc = (I_light / 100) * (isRu ? 18.5 : isPorphyrin ? 19.8 : 3.5);
      const FF = isRu ? 0.72 : 0.70;
      const Pmax = (Voc * Jsc * FF * I_light) / 100;
      const eff = (Pmax / I_light) * 100;

      return {
        formulas: [{
          name: 'DSSC Photochemical Regenerative Cycle',
          formula: 'Dye + hν → Dye* → Dye⁺ + e⁻(TiO₂) | 2Dye⁺ + 3I⁻ → 2Dye + I₃⁻',
          given: `Dye = ${p.dyeType}, Light = ${I_light} mW/cm², Film = ${th} µm`,
          calc: `V_oc = ${Voc.toFixed(2)} V, J_sc = ${Jsc.toFixed(1)} mA/cm², FF = ${FF.toFixed(2)}`,
          result: `P_max = ${Pmax.toFixed(2)} mW/cm², η = ${eff.toFixed(1)}%`,
          unit: '%'
        }],
        readouts: [
          { label: 'Open-Circuit Voltage (Voc)', value: `${Voc.toFixed(2)} V`, tone: 'blue' },
          { label: 'Short-Circuit Current (Jsc)', value: `${Jsc.toFixed(1)} mA/cm²`, tone: 'blue' },
          { label: 'Fill Factor (FF)', value: `${FF.toFixed(2)}`, tone: 'green' },
          { label: 'Conversion Efficiency (η)', value: `${eff.toFixed(1)}%`, tone: 'green' }
        ],
        state: { Voc, Jsc, FF, Pmax, eff },
        explain: {
          what: `Grätzel Dye-Sensitized Solar Cell sensitized with ${p.dyeType} under ${I_light} mW/cm² irradiation.`,
          why: `Molecular dye light absorption is separated from charge carrier transport (mesoporous TiO₂ and I⁻/I₃⁻ redox shuttle), achieving low-cost solar electricity.`
        }
      };
    },
    draw: (g, st) => {
      D.clear(g, "#f8fafc");
      const p = st.p || {};
      const c = st.c || {};
      const state = c.state || {};
      const step = st.step || 0;
      const time = st.t || 0;
      const view = st.view || {};

      const P = C3D.createProjector(g, view);
      const scene = C3D.createScene();

      C3D.drawGroundGrid(g, P, [-4, 4], [-4, 4], -1.0, '#1e293b', 1.0);

      // Front FTO Glass Anode
      C3D.drawBox(g, P, [-1.4, 0, 0.4], [0.2, 1.8, 2.2], '#e0f2fe', { scene });

      // Mesoporous TiO2 Nanoparticle Layer
      C3D.drawBox(g, P, [-0.9, 0, 0.4], [0.35, 1.8, 2.2], '#f8fafc', { scene });

      // Adsorbed Dye Layer
      const dyeCol = p.dyeType.includes('Ruthenium') ? '#9f1239' : p.dyeType.includes('Porphyrin') ? '#831843' : '#701a75';
      C3D.drawBox(g, P, [-0.5, 0, 0.4], [0.15, 1.8, 2.2], dyeCol, { scene });

      // Liquid I-/I3- Redox Electrolyte Gap
      C3D.drawBox(g, P, [0.1, 0, 0.4], [0.6, 1.8, 2.2], 'rgba(254, 240, 138, 0.5)', { scene, stroke: '#ca8a04' });

      // Platinum Counter Electrode
      C3D.drawBox(g, P, [0.6, 0, 0.4], [0.1, 1.8, 2.2], '#94a3b8', { scene });

      // Back FTO Glass Plate
      C3D.drawBox(g, P, [0.9, 0, 0.4], [0.2, 1.8, 2.2], '#e0f2fe', { scene });

      // Voltmeter on top
      C3D.drawVoltmeter(g, P, [0, 0, 2.2], 1.0, state.Voc || 0.74, 2.0, {
        scene,
        label: 'DSSC VOLTS (V)',
        decimals: 3
      });

      // I- / I3- Shuttle ions
      for (let i = 0; i < 4; i++) {
        const ionZ = 0.2 + ((time * 0.4 + i * 0.3) % 1.2);
        const posI = [0.1 + (i % 2 ? 0.15 : -0.15), 0, ionZ];
        scene.add(P(posI).depth, (ctx) => {
          C3D.drawAtom(ctx, P, posI, 0.08, '#d97706', 'I', i % 2 ? '3-' : '-');
        });
      }

      // Incoming Light Photons
      for (let i = 0; i < 4; i++) {
        const rayZ = 0.2 + i * 0.4;
        const rayX = -2.4 + ((time * 1.5 + i * 0.3) % 0.9);
        const posRay = [rayX, 0, rayZ];
        scene.add(P(posRay).depth, (ctx) => { C3D.drawAtom(ctx, P, posRay, 0.07, '#facc15', 'hν', ''); });
      }

      // Tags
      scene.add(P([-1.4, 0, 1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [-1.4, 0, 1.8], 'FTO Anode Glass', '#0284c7', -22); });
      scene.add(P([-0.5, 0, 1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [-0.5, 0, 1.8], 'Dye / TiO₂ Layer', '#9f1239', -22); });
      scene.add(P([0.1, 0, 1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.1, 0, 1.8], 'I⁻/I₃⁻ Electrolyte', '#ca8a04', -22); });
      scene.add(P([0.9, 0, 1.8]).depth, (ctx) => { C3D.drawTag(ctx, P, [0.9, 0, 1.8], 'Pt Counter Electrode', '#475569', -22); });

      scene.render(g);

      C3D.drawLegend(g, [
        { label: 'Incident Light Photons (hν)', color: '#facc15', symbol: true },
        { label: 'Adsorbed Photosensitizer Dye', color: dyeCol },
        { label: 'Mesoporous TiO₂ Nanoparticle Film', color: '#f8fafc' },
        { label: 'I⁻ / I₃⁻ Liquid Redox Shuttle', color: '#fef08a' },
        { label: 'Platinum Catalytic Film', color: '#94a3b8' }
      ], 24, 88);
    }
  };

  window.Chem3DSimulators = Object.assign(window.Chem3DSimulators || {}, Sim3D);
})();
