'use strict';

/* Engineering Chemistry — New Generation Simulation Engine.
   Wires the 8 rebuilt simulations to the EP simulation shell.
   Each simulation uses a dedicated 3D draw function from chem-sims-3d-new.js
   and a dedicated calculation engine. */
(function () {
  const CAT = window.EduverseChemCatalog;
  const D = window.EPDraw;
  const S = {};

  const r = (key, label, min, max, step, value, unit) => ({ key, label, type: 'range', min, max, step, default: value, unit: unit || '' });
  const select = (key, label, value, options) => ({ key, label, type: 'select', default: value, options: options.map((x) => ({ label: x, value: x })) });

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 1: Water Hardness — EDTA Titration
  // ════════════════════════════════════════════════════════════════════
  S['chem-edta-titration'] = {
    view3d: true,
    initialView: { yaw: -0.35, pitch: 0.32, zoom: 1.0, panX: 0, panY: 10 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('edtaVolume', 'EDTA volume delivered', 0, 25, 0.1, 0, 'mL'),
      r('edtaMolarity', 'EDTA molarity', 0.005, 0.05, 0.005, 0.01, 'M'),
      r('sampleVolume', 'Water sample volume', 10, 100, 5, 50, 'mL'),
      r('caHardness', 'Ca²⁺ hardness (known)', 20, 300, 5, 120, 'mg/L'),
      r('mgHardness', 'Mg²⁺ hardness (known)', 10, 200, 5, 80, 'mg/L'),
    ],
    steps: () => [
      { title: 'Prepare the Sample', text: 'Pipette the water sample (50 mL) into the conical flask. Add ammonia buffer (pH 10) and Eriochrome Black T indicator. The solution turns wine-red due to Ca²⁺ and Mg²⁺ complexes.' },
      { title: 'Fill the Burette', text: 'Fill the burette with standard EDTA solution (0.01 M). Record the initial reading. The burette is clamped vertically on the retort stand.' },
      { title: 'Titrate with EDTA', text: 'Open the stopcock slowly. EDTA chelates the free metal ions. The wine-red colour persists while uncomplexed Ca²⁺/Mg²⁺ remain. Swirl the flask after each addition.' },
      { title: 'Detect the Endpoint', text: 'Near the endpoint, add EDTA drop by drop. At the equivalence point, EDTA strips indicator from the last metal ion — the solution turns sharp blue. Record the final burette reading.' },
      { title: 'Calculate Hardness', text: 'Total Hardness (as CaCO₃) = (V_EDTA × M_EDTA × 100000) / V_sample. Express the result in mg/L or ppm. The endpoint volume determines how much Ca²⁺ + Mg²⁺ was present.' },
    ],
    compute: (values) => {
      const Ve = Number(values.edtaVolume) || 0;
      const Me = Number(values.edtaMolarity) || 0.01;
      const Vs = Number(values.sampleVolume) || 50;
      const knownCa = Number(values.caHardness) || 120;
      const knownMg = Number(values.mgHardness) || 80;
      const totalKnown = knownCa + knownMg; // mg/L as CaCO3
      // Endpoint volume: Ve_endpoint = totalKnown * Vs / (Me * 100000)
      const endpointVolume = (totalKnown * Vs) / (Me * 100000);
      // Calculated hardness from current EDTA volume
      const calculatedHardness = (Ve * Me * 100000) / Vs;
      const atEndpoint = Math.abs(Ve - endpointVolume) < 0.15;
      const pastEndpoint = Ve > endpointVolume + 0.15;
      const progress = endpointVolume > 0 ? Math.min(1, Ve / endpointVolume) : 0;
      // Indicator colour: wine-red → purple → blue
      let indicatorColor, indicatorName;
      if (progress < 0.85) { indicatorColor = '#9f1239'; indicatorName = 'Wine-red (metal-indicator complex)'; }
      else if (progress < 0.97) { indicatorColor = '#7e22ce'; indicatorName = 'Purple (approaching endpoint)'; }
      else { indicatorColor = '#1d4ed8'; indicatorName = atEndpoint || pastEndpoint ? 'Sharp blue (endpoint reached)' : 'Blue (near endpoint)'; }

      return {
        formulas: ['Hardness (as CaCO₃) = (V_EDTA × M_EDTA × 100000) / V_sample'],
        readouts: [
          { label: 'EDTA delivered', value: Ve.toFixed(1) + ' mL', tone: 'blue' },
          { label: 'Endpoint at', value: endpointVolume.toFixed(2) + ' mL', tone: 'green' },
          { label: 'Calculated hardness', value: calculatedHardness.toFixed(1) + ' mg/L (as CaCO₃)', tone: atEndpoint ? 'green' : 'amber' },
          { label: 'Indicator colour', value: indicatorName, tone: atEndpoint ? 'green' : 'blue' },
        ],
        state: {
          subject: 'Engineering Chemistry',
          simulation: 'chem-edta-titration',
          model: 'edta-titration',
          visualizationState: {
            Ve, Me, Vs, endpointVolume, calculatedHardness, progress, atEndpoint, pastEndpoint,
            indicatorColor, indicatorName, knownCa, knownMg, totalKnown
          }
        },
        explain: {
          what: 'EDTA titration determines total hardness by chelating Ca²⁺ and Mg²⁺ ions.',
          why: 'At pH 10, Eriochrome Black T forms a wine-red complex with divalent cations. EDTA has a higher stability constant than EBT, so it strips the metal ions from the indicator, changing the colour to blue at the endpoint.',
          param: 'EDTA volume',
          effect: 'Increasing EDTA beyond the endpoint wastes reagent but does not change the calculated hardness at the true equivalence point.'
        }
      };
    },
    draw: null // Will be supplied by chem-sims-3d-new.js
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 2: Lime-Soda Water Softening
  // ════════════════════════════════════════════════════════════════════
  S['chem-lime-soda-process'] = {
    view3d: true,
    initialView: { yaw: -0.3, pitch: 0.28, zoom: 0.95, panX: 0, panY: 5 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      r('caHardness', 'Ca²⁺ temporary hardness', 50, 400, 5, 180, 'mg/L'),
      r('mgHardness', 'Mg²⁺ permanent hardness', 20, 300, 5, 120, 'mg/L'),
      r('limeDose', 'Lime (Ca(OH)₂) dose', 0, 400, 5, 200, 'mg/L'),
      r('sodaDose', 'Soda ash (Na₂CO₃) dose', 0, 400, 5, 150, 'mg/L'),
    ],
    steps: () => [
      { title: 'Raw Water Intake', text: 'Hard water containing Ca²⁺ and Mg²⁺ ions enters the dosing system. Calcium causes temporary (carbonate) hardness, magnesium causes permanent (non-carbonate) hardness.' },
      { title: 'Lime Dosing', text: 'Ca(OH)₂ is added. It reacts with dissolved CO₂ and converts bicarbonates to insoluble CaCO₃. Mg²⁺ is precipitated as Mg(OH)₂. Excess lime converts remaining Mg²⁺.' },
      { title: 'Soda Ash Dosing', text: 'Na₂CO₃ converts permanent Ca²⁺ hardness (CaCl₂, CaSO₄) to insoluble CaCO₃. The soda ash provides carbonate ions that combine with non-carbonate calcium.' },
      { title: 'Mixing & Reaction', text: 'In the reaction vessel, lime and soda ash mix with the hard water. CaCO₃ and Mg(OH)₂ precipitates form as white, settling particles.' },
      { title: 'Settling & Collection', text: 'The precipitate settles as sludge in the settling tank. The clarified softened water is collected from the top. Residual hardness depends on the dosage accuracy.' },
    ],
    compute: (values) => {
      const caH = Number(values.caHardness) || 180;
      const mgH = Number(values.mgHardness) || 120;
      const lime = Number(values.limeDose) || 200;
      const soda = Number(values.sodaDose) || 150;
      // Simplified model: lime removes temporary hardness + Mg, soda removes permanent Ca hardness
      const limeEfficiency = Math.min(1, lime / (caH * 0.74 + mgH * 0.96));
      const sodaEfficiency = Math.min(1, soda / (caH * 0.6));
      const caRemoved = caH * Math.min(1, limeEfficiency * 0.6 + sodaEfficiency * 0.4);
      const mgRemoved = mgH * Math.min(1, limeEfficiency * 0.85);
      const residualCa = Math.max(5, caH - caRemoved);
      const residualMg = Math.max(2, mgH - mgRemoved);
      const residualTotal = residualCa + residualMg;
      const precipitateMass = (caRemoved * 1.0 + mgRemoved * 0.48).toFixed(0);
      return {
        formulas: ['Ca(HCO₃)₂ + Ca(OH)₂ → 2CaCO₃↓ + 2H₂O', 'MgCl₂ + Ca(OH)₂ → Mg(OH)₂↓ + CaCl₂', 'CaSO₄ + Na₂CO₃ → CaCO₃↓ + Na₂SO₄'],
        readouts: [
          { label: 'Residual Ca²⁺ hardness', value: residualCa.toFixed(0) + ' mg/L', tone: residualCa < 30 ? 'green' : 'amber' },
          { label: 'Residual Mg²⁺ hardness', value: residualMg.toFixed(0) + ' mg/L', tone: residualMg < 20 ? 'green' : 'amber' },
          { label: 'Total residual hardness', value: residualTotal.toFixed(0) + ' mg/L', tone: residualTotal < 50 ? 'green' : 'amber' },
          { label: 'Precipitate formed', value: precipitateMass + ' mg/L', tone: 'blue' },
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-lime-soda-process', model: 'lime-soda',
          visualizationState: { caH, mgH, lime, soda, residualCa, residualMg, residualTotal, limeEfficiency, sodaEfficiency, precipitateMass: Number(precipitateMass) }
        },
        explain: {
          what: 'Lime-soda process uses Ca(OH)₂ and Na₂CO₃ to precipitate hardness-causing ions.',
          why: 'Lime converts bicarbonate hardness to insoluble CaCO₃ and precipitates Mg(OH)₂. Soda ash provides CO₃²⁻ to remove permanent calcium hardness as CaCO₃.',
          param: 'Lime dose', effect: 'Insufficient lime leaves residual Mg²⁺; excess lime wastes reagent but does not improve softening.'
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 3: Daniell Cell
  // ════════════════════════════════════════════════════════════════════
  S['chem-daniell-cell'] = {
    view3d: true,
    initialView: { yaw: -0.44, pitch: 0.42, zoom: 1.08, panX: 0, panY: 15 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      r('znConc', 'ZnSO₄ concentration [Zn²⁺]', 0.01, 2, 0.01, 1.0, 'M'),
      r('cuConc', 'CuSO₄ concentration [Cu²⁺]', 0.01, 2, 0.01, 1.0, 'M'),
      r('temperature', 'Temperature', 20, 80, 1, 25, '°C'),
      select('inspection', 'Inspection Mode', 'Lab Bench Apparatus', [
        'Lab Bench Apparatus',
        'Zn Anode Micro-View (Oxidation)',
        'Cu Cathode Micro-View (Reduction)',
        'Salt Bridge Ion Transport'
      ])
    ],
    actions: [
      { key: 'benchView', label: '🔋 Lab Bench' },
      { key: 'anodeView', label: '🔬 Zn Oxidation' },
      { key: 'cathodeView', label: '🔬 Cu Reduction' },
      { key: 'bridgeView', label: '🧪 Salt Bridge' },
      { key: 'toggleLabels', label: '🏷️ Toggle Labels' },
      { key: 'resetView', label: '🔄 Reset View' }
    ],
    onAction: (key, st) => {
      if (key === 'benchView') {
        st.p.inspection = 'Lab Bench Apparatus';
        return { redraw: true, toast: 'Switched to Lab Bench Apparatus Overview' };
      }
      if (key === 'anodeView') {
        st.p.inspection = 'Zn Anode Micro-View (Oxidation)';
        return { redraw: true, toast: 'Switched to Zinc Anode Oxidation Micro-View' };
      }
      if (key === 'cathodeView') {
        st.p.inspection = 'Cu Cathode Micro-View (Reduction)';
        return { redraw: true, toast: 'Switched to Copper Cathode Reduction Micro-View' };
      }
      if (key === 'bridgeView') {
        st.p.inspection = 'Salt Bridge Ion Transport';
        return { redraw: true, toast: 'Switched to Salt Bridge Ion Transport View' };
      }
      if (key === 'toggleLabels') {
        if (!st.ui) st.ui = {};
        st.ui.showLabels = st.ui.showLabels === false ? true : false;
        return { redraw: true, toast: st.ui.showLabels ? 'Labels Enabled' : 'Labels Hidden' };
      }
      if (key === 'resetView') {
        st.view.yaw = -0.44; st.view.pitch = 0.42; st.view.zoom = 1.08; st.view.panX = 0; st.view.panY = 15;
        return { redraw: true, toast: 'Reset camera to default laboratory angle' };
      }
      return null;
    },
    onClick: (x, y, st) => {
      if (!st.ui) st.ui = {};
      if (!st.p) st.p = {};

      // 1. Top row mode switcher buttons (x: 520 to 990, y: 16 to 48)
      if (y >= 16 && y <= 48) {
        if (x >= 520 && x <= 630) {
          st.p.inspection = 'Lab Bench Apparatus';
          return { redraw: true, toast: 'Switched to Lab Bench Apparatus' };
        }
        if (x >= 636 && x <= 756) {
          st.p.inspection = 'Zn Anode Micro-View (Oxidation)';
          return { redraw: true, toast: 'Switched to Zinc Oxidation Micro-View' };
        }
        if (x >= 762 && x <= 882) {
          st.p.inspection = 'Cu Cathode Micro-View (Reduction)';
          return { redraw: true, toast: 'Switched to Copper Reduction Micro-View' };
        }
        if (x >= 888 && x <= 990) {
          st.p.inspection = 'Salt Bridge Ion Transport';
          return { redraw: true, toast: 'Switched to Salt Bridge Ion Transport' };
        }
      }

      // 2. Sub row quick action tools (x: 32 to 345, y: 68 to 94)
      if (y >= 68 && y <= 94) {
        if (x >= 32 && x <= 140) {
          st.ui.showLabels = st.ui.showLabels === false ? true : false;
          return { redraw: true, toast: st.ui.showLabels ? 'Labels Enabled' : 'Labels Hidden' };
        }
        if (x >= 146 && x <= 240) {
          st.view.yaw = -0.44; st.view.pitch = 0.42; st.view.zoom = 1.08; st.view.panX = 0; st.view.panY = 15;
          return { redraw: true, toast: 'Reset camera view' };
        }
        if (x >= 246 && x <= 345) {
          st.view.yaw = -0.44; st.view.pitch = 0.38; st.view.zoom = 1.35; st.view.panX = 0; st.view.panY = 15;
          return { redraw: true, toast: 'Focused camera on electrodes' };
        }
      }

      // 3. Close button on modal card (if open)
      const sel = st.ui.selectedComponent;
      if (sel && x >= 630 && x <= 970 && y >= 95 && y <= 245) {
        st.ui.selectedComponent = null;
        return { redraw: true, toast: 'Component info closed' };
      }

      // 4. Component click hit-testing
      const bounds = st.ui._compBounds || [];
      const hit = bounds.find((b) => Math.hypot(b.x - x, b.y - y) < b.r);
      if (hit) {
        st.ui.selectedComponent = hit.id;
        return { redraw: true, toast: 'Selected: ' + hit.title };
      } else if (st.ui.selectedComponent) {
        st.ui.selectedComponent = null;
        return { redraw: true };
      }
      return null;
    },
    steps: () => [
      { title: '1. Inspect the Half-Cells', text: 'The Daniell cell has two half-cells: a zinc strip in ZnSO₄ solution (anode) and a copper strip in CuSO₄ solution (cathode). They are connected by a salt bridge (KCl/KNO₃ in agar).' },
      { title: '2. Observe Oxidation (Anode)', text: 'At the zinc electrode: Zn(s) → Zn²⁺(aq) + 2e⁻. Zinc dissolves into solution, releasing electrons. The zinc strip gradually loses mass.' },
      { title: '3. Electron Flow Through Circuit', text: 'Electrons travel from the zinc anode through the external wire to the copper cathode. The voltmeter reads approximately +1.10 V under standard conditions.' },
      { title: '4. Observe Reduction (Cathode)', text: 'At the copper electrode: Cu²⁺(aq) + 2e⁻ → Cu(s). Copper ions from solution deposit onto the copper strip, which gains mass. The blue colour of CuSO₄ fades slightly.' },
      { title: '5. Salt Bridge & Cell Potential', text: 'The salt bridge maintains electrical neutrality: K⁺ migrates to the cathode compartment, NO₃⁻/Cl⁻ to the anode. E°cell = E°cathode − E°anode = +0.34 − (−0.76) = +1.10 V.' },
    ],
    compute: (values) => {
      const znC = Number(values.znConc) || 1.0;
      const cuC = Number(values.cuConc) || 1.0;
      const T = Number(values.temperature) || 25;
      const inspection = values.inspection || 'Lab Bench Apparatus';
      const EZn = -0.76; const ECu = 0.34; const n = 2;
      const Ecell_std = ECu - EZn; // 1.10 V
      const Q = Math.max(0.0001, znC / cuC);
      const R = 8.314; const F = 96485;
      const Ecell = Ecell_std - (R * (T + 273.15) / (n * F)) * Math.log(Q);
      const deltaG = -n * F * Ecell / 1000; // kJ/mol
      return {
        formulas: [
          'E°cell = E°cathode − E°anode = +0.34 − (−0.76) = +1.10 V',
          `E = E° − (RT/nF) ln Q = 1.10 − (${(R*(T+273.15)/(n*F)).toFixed(4)}) ln(${Q.toFixed(3)}) = ${Ecell.toFixed(3)} V`,
          `ΔG = −nFE = −(2)(96485)(${Ecell.toFixed(3)}) = ${deltaG.toFixed(1)} kJ/mol`
        ],
        readouts: [
          { label: 'E° cell (standard)', value: Ecell_std.toFixed(2) + ' V', tone: 'blue' },
          { label: 'E cell (actual)', value: Ecell.toFixed(3) + ' V', tone: Ecell > 0 ? 'green' : 'red' },
          { label: 'Reaction quotient Q', value: Q.toFixed(3), tone: 'amber' },
          { label: 'Free Energy ΔG', value: deltaG.toFixed(1) + ' kJ/mol', tone: deltaG < 0 ? 'green' : 'amber' },
          { label: 'Anode reaction', value: 'Zn → Zn²⁺ + 2e⁻ (oxidation)', tone: 'blue' },
          { label: 'Cathode reaction', value: 'Cu²⁺ + 2e⁻ → Cu (reduction)', tone: 'green' }
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-daniell-cell', model: 'daniell-cell',
          visualizationState: { znC, cuC, T, Ecell, Ecell_std, Q, EZn, ECu, deltaG, inspection }
        },
        explain: {
          what: 'The Daniell cell demonstrates galvanic action between zinc and copper, converting spontaneous redox chemical energy into electrical work.',
          why: 'Zinc has a more negative reduction potential (-0.76 V) than copper (+0.34 V), driving spontaneous electron transfer through the external circuit.',
          param: 'Concentration ratio [Zn²⁺]/[Cu²⁺]', effect: `At [Zn²⁺] = ${znC.toFixed(2)} M and [Cu²⁺] = ${cuC.toFixed(2)} M, Q = ${Q.toFixed(3)}, producing ${Ecell.toFixed(3)} V.`
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 3B: Lithium-Ion Battery (LFP / Graphite)
  // ════════════════════════════════════════════════════════════════════
  S['chem-lithium-ion-battery'] = {
    view3d: true,
    initialView: { yaw: -0.42, pitch: 0.38, zoom: 1.05, panX: 0, panY: 10 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      select('mode', 'Operating Mode', 'Galvanic Discharge', ['Galvanic Discharge', 'Electrolytic Charge']),
      r('soc', 'State of Charge (SOC)', 5, 98, 1, 75, '%'),
      r('current', 'Operating Current', 1, 20, 0.5, 5.0, 'A'),
      select('inspection', 'Inspection Mode', 'Casing Cutaway', [
        'Prismatic Assembly',
        'Casing Cutaway',
        'Exploded Electrode Stack',
        'Microscopic Intercalation'
      ])
    ],
    actions: [
      { key: 'cutawayView', label: '✂️ Cutaway' },
      { key: 'explodedView', label: '💥 Exploded Stack' },
      { key: 'microView', label: '🔬 Micro Lattice' },
      { key: 'toggleMode', label: '⚡ Toggle Charge/Discharge' },
      { key: 'resetView', label: '🔄 Reset View' }
    ],
    onAction: (key, st) => {
      if (key === 'cutawayView') {
        st.p.inspection = 'Casing Cutaway';
        return { redraw: true, toast: 'Switched to Casing Cutaway Internal Stack View' };
      }
      if (key === 'explodedView') {
        st.p.inspection = 'Exploded Electrode Stack';
        return { redraw: true, toast: 'Switched to Exploded Electrode Layers View' };
      }
      if (key === 'microView') {
        st.p.inspection = 'Microscopic Intercalation';
        return { redraw: true, toast: 'Switched to Atomic Lattice Intercalation View' };
      }
      if (key === 'toggleMode') {
        st.p.mode = st.p.mode === 'Galvanic Discharge' ? 'Electrolytic Charge' : 'Galvanic Discharge';
        return { redraw: true, toast: `Switched Mode: ${st.p.mode}` };
      }
      if (key === 'resetView') {
        st.view.yaw = -0.42; st.view.pitch = 0.38; st.view.zoom = 1.05; st.view.panX = 0; st.view.panY = 10;
        return { redraw: true, toast: 'Reset camera view' };
      }
      return null;
    },
    steps: () => [
      { title: 'Prismatic Cell Architecture', text: 'Industrial aluminum prismatic casing hermetically sealed with laser-welded cover, containing copper and aluminum current collectors.' },
      { title: 'Electrode Active Chemistry', text: 'Graphite anode (C₆) on copper foil and Lithium Iron Phosphate (LiFePO₄) olivine cathode on aluminum foil separated by porous polyolefin film.' },
      { title: 'Galvanic Discharge', text: 'Li⁺ ions deintercalate from graphite, migrate through electrolyte-filled separator pores to cathode. Electrons flow through external load.' },
      { title: 'Electrolytic Charging', text: 'External DC power supply forces Li⁺ back from LiFePO₄ into the graphite lattice. Electrons return through external charger circuit.' },
      { title: 'Safety Architecture', text: 'Laser-scored pressure relief burst vent ruptures safely at 1.0–1.4 MPa before casing can fail under extreme abusive conditions.' }
    ],
    compute: (values, step) => {
      const isCharge = values.mode === 'Electrolytic Charge';
      const soc = Number(values.soc) || 75;
      const current = Number(values.current) || 5.0;
      const s = soc / 100;
      let ocv = 3.25;
      if (s < 0.1) ocv = 2.50 + 0.65 * (s / 0.1);
      else if (s > 0.9) ocv = 3.32 + 0.33 * ((s - 0.9) / 0.1);
      else ocv = 3.22 + 0.10 * ((s - 0.1) / 0.8);

      const rInt = 0.008;
      const vTerm = isCharge ? Math.min(3.65, ocv + current * rInt) : Math.max(2.5, ocv - current * rInt);
      const power = vTerm * current;

      return {
        step,
        formulas: [
          isCharge
            ? 'Cathode: LiFePO₄ → Li_{1-x}FePO₄ + xLi⁺ + xe⁻'
            : 'Anode: Li_x C₆ → C₆ + xLi⁺ + xe⁻',
          isCharge
            ? 'Anode: C₆ + xLi⁺ + xe⁻ → Li_x C₆'
            : 'Cathode: Li_{1-x}FePO₄ + xLi⁺ + xe⁻ → LiFePO₄',
          `V_term = OCV ${isCharge ? '+' : '−'} I·R_int = ${ocv.toFixed(3)} ${isCharge ? '+' : '−'} (${current.toFixed(1)}·0.008) = ${vTerm.toFixed(3)} V`,
          `P_elec = V·I = ${vTerm.toFixed(3)} · ${current.toFixed(1)} = ${power.toFixed(2)} W`
        ],
        readouts: [
          { label: 'Terminal Voltage', value: vTerm.toFixed(3) + ' V', tone: 'green' },
          { label: 'Operating Current', value: current.toFixed(1) + ' A', tone: 'blue' },
          { label: 'Electrical Power', value: power.toFixed(1) + ' W', tone: 'amber' },
          { label: 'State of Charge', value: soc + ' %', tone: soc > 20 ? 'green' : 'red' },
          { label: 'Internal Resistance', value: '8.0 mΩ', tone: 'slate' }
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-lithium-ion-battery',
          visualizationState: { isCharge, soc, current, vTerm, ocv, power, inspection: values.inspection }
        },
        explain: {
          what: `The cell is operating in ${isCharge ? 'Electrolytic Charging' : 'Galvanic Discharging'} mode at ${soc}% SOC.`,
          why: 'LiFePO₄ exhibits an extremely flat two-phase thermodynamic potential plateau (~3.25 V) with superior structural stability.',
          param: 'Current & SOC', effect: `At ${current} A draw, internal Ohmic drop is ${(current * rInt).toFixed(3)} V.`
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 3C: Lead-Acid Battery (Automotive 6-Cell 12V)
  // ════════════════════════════════════════════════════════════════════
  S['chem-lead-acid-battery'] = {
    view3d: true,
    initialView: { yaw: -0.38, pitch: 0.35, zoom: 1.0, panX: 0, panY: 10 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      select('mode', 'Operating Mode', 'Galvanic Discharge', ['Galvanic Discharge', 'Alternator Charge']),
      r('soc', 'State of Charge (SOC)', 10, 98, 1, 85, '%'),
      r('current', 'Operating Current', 2, 50, 1, 15, 'A'),
      select('inspection', 'Inspection Mode', 'Casing Cutaway (6 Cells)', [
        'Complete Automotive Battery',
        'Casing Cutaway (6 Cells)',
        'Exploded Plate Group'
      ])
    ],
    actions: [
      { key: 'cutawayView', label: '✂️ 6-Cell Cutaway' },
      { key: 'explodedView', label: '💥 Exploded Plates' },
      { key: 'toggleMode', label: '⚡ Toggle Charge/Discharge' },
      { key: 'resetView', label: '🔄 Reset View' }
    ],
    onAction: (key, st) => {
      if (key === 'cutawayView') {
        st.p.inspection = 'Casing Cutaway (6 Cells)';
        return { redraw: true, toast: 'Switched to 6-Cell Internal Cutaway' };
      }
      if (key === 'explodedView') {
        st.p.inspection = 'Exploded Plate Group';
        return { redraw: true, toast: 'Switched to Exploded Plate Inspection' };
      }
      if (key === 'toggleMode') {
        st.p.mode = st.p.mode === 'Galvanic Discharge' ? 'Alternator Charge' : 'Galvanic Discharge';
        return { redraw: true, toast: `Switched Mode: ${st.p.mode}` };
      }
      if (key === 'resetView') {
        st.view.yaw = -0.38; st.view.pitch = 0.35; st.view.zoom = 1.0; st.view.panX = 0; st.view.panY = 10;
        return { redraw: true, toast: 'Reset camera view' };
      }
      return null;
    },
    steps: () => [
      { title: 'Six-Cell Series Architecture', text: 'Molded polypropylene container partitioned into 6 isolated cells connected in series via through-wall lead busbars (6 × ~2.1V = 12.6V nominal).' },
      { title: 'Plate Construction & Materials', text: 'Positive grids filled with chocolate brown PbO₂; negative grids filled with spongy metallic Pb; enclosed in envelope separators.' },
      { title: 'Galvanic Discharge Reaction', text: 'Both plates consume sulfuric acid and convert to lead sulfate (PbSO₄). Electrons supply the external automotive load.' },
      { title: 'Alternator Charging Reaction', text: 'External ~14.4V supply reverses current, converting PbSO₄ back to Pb and PbO₂ while regenerating H₂SO₄ into electrolyte.' },
      { title: 'Hydrometer & Acid Density', text: 'Electrolyte specific gravity correlates with charge: 1.280 g/cm³ fully charged, falling to 1.120 g/cm³ when exhausted.' }
    ],
    compute: (values, step) => {
      const isCharge = values.mode === 'Alternator Charge';
      const soc = Number(values.soc) || 85;
      const current = Number(values.current) || 15;
      const s = soc / 100;
      const sg = 1.120 + s * (1.280 - 1.120);
      const cellOcv = 0.84 + sg;
      const packOcv = cellOcv * 6;
      const totalRint = 0.015;
      const vTerm = isCharge ? Math.min(14.8, packOcv + current * totalRint) : Math.max(10.5, packOcv - current * totalRint);
      const power = vTerm * current;

      return {
        step,
        formulas: [
          'Negative: Pb + SO₄²⁻ ⇌ PbSO₄ + 2e⁻  (E° = −0.356 V)',
          'Positive: PbO₂ + SO₄²⁻ + 4H⁺ + 2e⁻ ⇌ PbSO₄ + 2H₂O  (E° = +1.685 V)',
          'Overall: Pb + PbO₂ + 2H₂SO₄ ⇌ 2PbSO₄ + 2H₂O  (Double-Sulfate Reaction)',
          `Pack Voltage = 6 × (${cellOcv.toFixed(3)} V) ${isCharge ? '+' : '−'} I·R_int = ${vTerm.toFixed(2)} V`
        ],
        readouts: [
          { label: 'Terminal Voltage (12V Bank)', value: vTerm.toFixed(2) + ' V', tone: 'green' },
          { label: 'Electrolyte Spec. Gravity', value: sg.toFixed(3) + ' g/cm³', tone: sg > 1.22 ? 'green' : 'amber' },
          { label: 'Operating Current', value: current.toFixed(1) + ' A', tone: 'blue' },
          { label: 'Electrical Power', value: power.toFixed(1) + ' W', tone: 'amber' },
          { label: 'State of Charge (SOC)', value: soc + ' %', tone: 'green' }
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-lead-acid-battery',
          visualizationState: { isCharge, soc, current, vTerm, sg, power, inspection: values.inspection }
        },
        explain: {
          what: `Automotive 6-cell lead-acid battery in ${isCharge ? 'Alternator Charging' : 'Discharge'} at ${soc}% SOC.`,
          why: 'The double-sulfate reaction consumes sulfuric acid during discharge, lowering electrolyte density proportionally.',
          param: 'Specific Gravity', effect: `Electrolyte density is ${sg.toFixed(3)} g/cm³, producing ${(cellOcv).toFixed(3)} V per cell.`
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 3D: PEM Hydrogen Fuel Cell
  // ════════════════════════════════════════════════════════════════════
  S['chem-pem-fuel-cell'] = {
    view3d: true,
    initialView: { yaw: -0.40, pitch: 0.36, zoom: 1.05, panX: 0, panY: 10 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      r('loadRes', 'Load Resistance (R_load)', 0.2, 8.0, 0.1, 1.5, 'Ω'),
      r('h2Flow', 'H₂ Fuel Flow Rate', 30, 250, 10, 120, 'mL/min'),
      r('airFlow', 'Cathode Air Flow Rate', 80, 600, 20, 300, 'mL/min'),
      select('inspection', 'Inspection Mode', 'Sectional Cutaway', [
        'Assembled Stack',
        'Sectional Cutaway',
        'Exploded MEA Stack'
      ])
    ],
    actions: [
      { key: 'cutawayView', label: '✂️ Sectional Cutaway' },
      { key: 'explodedView', label: '💥 Exploded MEA Stack' },
      { key: 'assembledView', label: '📦 Assembled Stack' },
      { key: 'resetView', label: '🔄 Reset View' }
    ],
    onAction: (key, st) => {
      if (key === 'cutawayView') {
        st.p.inspection = 'Sectional Cutaway';
        return { redraw: true, toast: 'Switched to Sectional Cutaway MEA View' };
      }
      if (key === 'explodedView') {
        st.p.inspection = 'Exploded MEA Stack';
        return { redraw: true, toast: 'Switched to Exploded MEA Layers View' };
      }
      if (key === 'assembledView') {
        st.p.inspection = 'Assembled Stack';
        return { redraw: true, toast: 'Switched to Assembled Stack View' };
      }
      if (key === 'resetView') {
        st.view.yaw = -0.40; st.view.pitch = 0.36; st.view.zoom = 1.05; st.view.panX = 0; st.view.panY = 10;
        return { redraw: true, toast: 'Reset camera view' };
      }
      return null;
    },
    steps: () => [
      { title: 'Fuel Cell Stack & Bipolar Plates', text: 'Gold-plated end plates clamped by high-tensile tie rods compress machined graphite bipolar flow plates.' },
      { title: 'Membrane-Electrode Assembly (MEA)', text: 'Nafion PFSA solid polymer electrolyte membrane coated with nano-platinum Pt/C catalyst backed by porous carbon paper GDL.' },
      { title: 'Hydrogen Oxidation Reaction (HOR)', text: 'H₂ gas flows through serpentine channels; at anode Pt catalyst sites, H₂ is oxidized into protons (H⁺) and electrons (e⁻).' },
      { title: 'Proton Transport Across Nafion PEM', text: 'Protons migrate across the hydrated sulfonic acid nano-channels of Nafion membrane; zero electrons can cross the membrane.' },
      { title: 'Oxygen Reduction Reaction (ORR)', text: 'At cathode Pt catalyst, incoming protons, electrons, and O₂ combine to form pure water droplets and exothermic heat.' },
      { title: 'Continuous Power & Polarization Curve', text: 'Adjusting load resistance dynamically modifies operating current, cell voltage, water generation, and power output.' }
    ],
    compute: (values, step) => {
      const rLoad = Number(values.loadRes) || 1.5;
      const h2Flow = Number(values.h2Flow) || 120;
      const airFlow = Number(values.airFlow) || 300;

      // Polarization solve V_cell = I * R_load
      let current = 0.5, voltage = 0.75;
      for (let iter = 0; iter < 16; iter++) {
        const etaAct = 0.055 * Math.log(Math.max(1, current / 0.002));
        const etaOhm = current * 0.08;
        const etaConc = -0.06 * Math.log(Math.max(0.01, 1 - current / 25.0));
        const vCell = Math.max(0.1, 0.985 - etaAct - etaOhm - etaConc);
        const iNext = vCell / rLoad;
        current = (current + iNext) / 2;
        voltage = vCell;
      }

      const power = voltage * current;
      const waterRate = (current / (2 * 96485)) * 18.015 * 3600; // mL/hr
      const h2Rate = (current / (2 * 96485)) * 24450 * 60; // mL/min

      return {
        step,
        formulas: [
          'Anode (HOR): H₂ → 2H⁺ + 2e⁻  (E° = 0.000 V)',
          'Cathode (ORR): ½O₂ + 2H⁺ + 2e⁻ → H₂O  (E° = +1.229 V)',
          'Overall Reaction: H₂ + ½O₂ → H₂O + Electricity + Heat  (ΔH = −285.8 kJ/mol)',
          `V_cell = OCV − η_act − η_ohm − η_conc = ${voltage.toFixed(3)} V`,
          `P = V_cell · I = ${voltage.toFixed(3)} V · ${current.toFixed(2)} A = ${power.toFixed(2)} W`
        ],
        readouts: [
          { label: 'Cell Terminal Voltage', value: voltage.toFixed(3) + ' V', tone: 'green' },
          { label: 'Current Output', value: current.toFixed(2) + ' A', tone: 'blue' },
          { label: 'Electrical Power', value: power.toFixed(2) + ' W', tone: 'amber' },
          { label: 'Water Production Rate', value: waterRate.toFixed(2) + ' mL/hr', tone: 'cyan' },
          { label: 'H₂ Fuel Consumption', value: h2Rate.toFixed(1) + ' mL/min', tone: 'slate' }
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-pem-fuel-cell',
          visualizationState: { rLoad, h2Flow, airFlow, current, voltage, power, waterRate, inspection: values.inspection }
        },
        explain: {
          what: `PEM Fuel Cell producing ${power.toFixed(2)} W of DC electrical power into ${rLoad.toFixed(2)} Ω load.`,
          why: 'Nafion PFSA conducts hydrated protons across sulfonic acid groups while forcing electrons through the external circuit.',
          param: 'Load Resistance R_load', effect: `At ${rLoad.toFixed(2)} Ω, cell draws ${current.toFixed(2)} A producing ${waterRate.toFixed(2)} mL/hr water.`
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 4: Corrosion and Cathodic Protection
  // ════════════════════════════════════════════════════════════════════
  S['chem-corrosion-protection'] = {
    view3d: true,
    initialView: { yaw: -0.3, pitch: 0.3, zoom: 1.0, panX: 0, panY: 5 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      select('mode', 'Protection mode', 'Unprotected', ['Unprotected', 'Sacrificial Anode (Zn)', 'Impressed Current']),
      r('exposure', 'Exposure time', 0, 100, 1, 50, 'hours'),
      r('oxygenLevel', 'Dissolved oxygen', 0, 100, 1, 60, '%'),
      r('pH', 'Electrolyte pH', 2, 12, 0.5, 6.5, ''),
    ],
    steps: () => [
      { title: 'Steel in Electrolyte', text: 'A steel coupon is immersed in an electrolyte (simulated seawater). Dissolved oxygen and pH influence the corrosion rate. At neutral pH with dissolved O₂, corrosion proceeds through differential aeration.' },
      { title: 'Anodic Dissolution', text: 'At anodic sites on the steel surface: Fe(s) → Fe²⁺(aq) + 2e⁻. Iron dissolves into the electrolyte. This is the fundamental corrosion reaction.' },
      { title: 'Cathodic Reaction', text: 'At cathodic sites: O₂ + 2H₂O + 4e⁻ → 4OH⁻. The electrons consumed here come from the anodic dissolution. Fe²⁺ and OH⁻ combine to form Fe(OH)₂ which oxidizes to rust (Fe₂O₃·xH₂O).' },
      { title: 'Protection Applied', text: 'Sacrificial anode: zinc (E° = −0.76 V) corrodes instead of steel (E° = −0.44 V), making the steel cathodic. Impressed current: external DC supply forces the steel to be cathodic.' },
      { title: 'Compare Protection', text: 'Without protection, rust accumulates on the steel surface. With sacrificial zinc, the zinc dissolves while the steel stays intact. With impressed current, an external anode and power supply protect the steel.' },
    ],
    compute: (values) => {
      const mode = values.mode || 'Unprotected';
      const exposure = Number(values.exposure) || 50;
      const O2 = Number(values.oxygenLevel) || 60;
      const pH = Number(values.pH) || 6.5;
      const baseCorrRate = 0.5 * (O2 / 100) * Math.max(0.1, (14 - pH) / 8);
      let protectionFactor = 1.0;
      if (mode === 'Sacrificial Anode (Zn)') protectionFactor = 0.05;
      else if (mode === 'Impressed Current') protectionFactor = 0.02;
      const effectiveRate = baseCorrRate * protectionFactor;
      const massLoss = effectiveRate * exposure;
      const rustThickness = massLoss * 0.013;
      return {
        formulas: ['Fe → Fe²⁺ + 2e⁻ (anodic)', 'O₂ + 2H₂O + 4e⁻ → 4OH⁻ (cathodic)', '2Fe²⁺ + 4OH⁻ + ½O₂ → Fe₂O₃·H₂O (rust)'],
        readouts: [
          { label: 'Protection mode', value: mode, tone: mode === 'Unprotected' ? 'amber' : 'green' },
          { label: 'Corrosion rate', value: effectiveRate.toFixed(3) + ' mg/cm²·h', tone: effectiveRate < 0.05 ? 'green' : 'amber' },
          { label: 'Mass loss', value: massLoss.toFixed(1) + ' mg/cm²', tone: 'blue' },
          { label: 'Rust thickness', value: rustThickness.toFixed(2) + ' mm', tone: massLoss > 5 ? 'amber' : 'green' },
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-corrosion-protection', model: 'corrosion-protection',
          visualizationState: { mode, exposure, O2, pH, effectiveRate, massLoss, rustThickness, protectionFactor }
        },
        explain: {
          what: 'Corrosion is an electrochemical process where metal dissolves at anodic sites.',
          why: 'Cathodic protection forces the steel to act as a cathode, preventing anodic dissolution.',
          param: 'Protection mode', effect: 'Switching from unprotected to sacrificial anode reduces corrosion rate by ~95%.'
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 5: Bomb Calorimeter
  // ════════════════════════════════════════════════════════════════════
  S['chem-bomb-calorimeter'] = {
    view3d: true,
    initialView: { yaw: -0.35, pitch: 0.35, zoom: 1.0, panX: 0, panY: 10 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      r('fuelMass', 'Fuel sample mass', 0.1, 5, 0.1, 1.0, 'g'),
      r('waterMass', 'Water in calorimeter', 500, 3000, 50, 2000, 'g'),
      r('waterEquivalent', 'Water equivalent of bomb', 0.5, 5, 0.1, 2.0, 'kJ/°C'),
      r('tempRise', 'Temperature rise ΔT', 0.1, 8, 0.1, 2.8, '°C'),
      r('corrections', 'Fuse + acid corrections', 0, 5, 0.1, 0.5, 'kJ'),
    ],
    steps: () => [
      { title: 'Prepare the Sample', text: 'Weigh the fuel sample accurately on an analytical balance. Form it into a pellet and place it in the crucible inside the bomb vessel.' },
      { title: 'Charge the Bomb', text: 'Seal the bomb vessel. Fill with pure oxygen at 25 atm to ensure complete combustion. Connect the ignition wire to the fuse terminals.' },
      { title: 'Assemble the Calorimeter', text: 'Place the charged bomb into the calorimeter bucket filled with a known mass of water. Insert the thermometer. Close the outer insulation jacket.' },
      { title: 'Ignite & Measure', text: 'Fire the ignition circuit. The fuel combusts completely in pure O₂. Heat transfers to the water. Record the maximum temperature rise ΔT using the precision thermometer.' },
      { title: 'Calculate Calorific Value', text: 'Higher Calorific Value (HCV) = [(W + w) × ΔT − corrections] / m. Where W = water mass × 4.184 J/g°C equivalent, w = water equivalent of bomb, m = sample mass.' },
    ],
    compute: (values) => {
      const m = Number(values.fuelMass) || 1.0;
      const mw = Number(values.waterMass) || 2000;
      const w = Number(values.waterEquivalent) || 2.0;
      const dT = Number(values.tempRise) || 2.8;
      const corr = Number(values.corrections) || 0.5;
      const W = mw * 4.184 / 1000; // kJ/°C
      const heatReleased = (W + w) * dT;
      const netHeat = heatReleased - corr;
      const HCV = netHeat / m; // kJ/g
      const HCV_kJ_kg = HCV * 1000;
      return {
        formulas: ['HCV = [(W + w) × ΔT − corrections] / m'],
        readouts: [
          { label: 'Heat released', value: heatReleased.toFixed(2) + ' kJ', tone: 'blue' },
          { label: 'Net heat (after corrections)', value: netHeat.toFixed(2) + ' kJ', tone: 'blue' },
          { label: 'HCV', value: HCV.toFixed(2) + ' kJ/g (' + HCV_kJ_kg.toFixed(0) + ' kJ/kg)', tone: 'green' },
          { label: 'Water equivalent W', value: W.toFixed(2) + ' kJ/°C', tone: 'amber' },
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-bomb-calorimeter', model: 'bomb-calorimeter',
          visualizationState: { m, mw, w, dT, corr, W, heatReleased, netHeat, HCV, HCV_kJ_kg }
        },
        explain: {
          what: 'A bomb calorimeter measures the heat of combustion at constant volume.',
          why: 'Complete combustion in excess O₂ transfers all chemical energy to the water bath, allowing precise HCV measurement.',
          param: 'Temperature rise', effect: 'Higher ΔT indicates more heat released per unit mass of fuel.'
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 6: Polymer Processing — Three Machines
  // ════════════════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 6: Polymer Processing — Industrial-Grade Three Machine Modes
  // ════════════════════════════════════════════════════════════════════
  S['chem-polymer-processing'] = {
    view3d: true,
    initialView: { yaw: -0.32, pitch: 0.26, zoom: 0.88, panX: 0, panY: 10 },
    stepDuration: 4.5,
    live: true,
    conceptual: false,
    params: [
      select('machineMode', 'Manufacturing process', 'Injection Moulding', ['Injection Moulding', 'Extrusion Moulding', 'Compression Moulding']),
      select('cutaway', 'Internal inspection / cutaway', 'Cutaway (Internal Inspection)', ['Cutaway (Internal Inspection)', 'Solid Machine Exterior']),
      select('polymerMaterial', 'Polymer material', 'Polypropylene (PP)', [
        'Polypropylene (PP)',
        'ABS Resin (Terpolymer)',
        'Polyamide 6 (Nylon 6)',
        'High-Density Polyethylene (HDPE)',
        'Rigid PVC (Polyvinyl Chloride)',
        'Bakelite (Phenol-Formaldehyde)',
        'Melamine Formaldehyde'
      ]),
      r('barrelTemp', 'Melt / mould temperature', 130, 320, 5, 230, '°C'),
      r('procPressure', 'Processing pressure', 15, 220, 5, 110, 'bar'),
      r('screwRpm', 'Screw speed / line speed', 20, 200, 5, 75, 'rpm'),
      r('cycleDuration', 'Cycle / cooling / cure time', 8, 90, 2, 28, 's'),
    ],
    steps: (values) => {
      const mode = (values && values.machineMode) || 'Injection Moulding';
      if (mode === 'Injection Moulding') {
        return [
          { title: '1. Machine Ready & Pellet Feeding', text: 'Mould is open and clamping unit is at rest. Discrete polymer pellets are loaded into the feed hopper above the water-cooled barrel throat.' },
          { title: '2. Plasticisation & Screw Rotation', text: 'The reciprocating screw rotates inside the heated barrel. Ceramic heater bands and viscous shear friction melt the pellets into a homogeneous polymer melt.' },
          { title: '3. Shot Metering & Screw Retraction', text: 'Molten polymer accumulates ahead of the non-return check ring. Melt pressure forces the reciprocating screw to translate backward axially, preparing a precise shot volume.' },
          { title: '4. Mould Closing & High Clamping Force', text: 'Hydraulic clamping cylinder extends. Moving platen advances along the four chrome tie bars. Mould halves close firmly and lock under full clamping tonnage.' },
          { title: '5. High-Pressure Injection & Cavity Filling', text: 'The screw drives forward axially as an injection plunger. Molten polymer is forced under high pressure through nozzle, sprue, runners, and gate into the cavity.' },
          { title: '6. Packing & Holding Pressure', text: 'Screw maintains high holding pressure while the gate freezes. Additional melt is packed into the mould cavity to compensate for volumetric thermal shrinkage.' },
          { title: '7. Mould Cooling & Solidification', text: 'Internal cooling channels circulate chilled water to extract heat. Molten plastic solidifies into a rigid, dimensionally stable moulded component.' },
          { title: '8. Mould Opening & Part Retention', text: 'Clamping mechanism depressurises and retracts the moving platen along the tie bars. The mould parting line opens, retaining the solid part on the moving core side.' },
          { title: '9. Hydraulic Ejection', text: 'The ejector plate and ejector pins advance forward through the moving platen, knocking the finished component out of the cavity into the discharge chute.' },
          { title: '10. Component Inspection & Cycle Reset', text: 'Finished moulded part is presented for dimensional and surface inspection. Clamping and injection units return to home positions for the next cycle.' }
        ];
      } else if (mode === 'Extrusion Moulding') {
        return [
          { title: '1. Pellet Feed into Water-Cooled Throat', text: 'Solid polymer pellets (HDPE / PVC / PP) drop gravimetrically from the feed hopper into the screw feed channel through the water-cooled throat.' },
          { title: '2. Solids Conveying & Flight Transport', text: 'Extrusion screw rotates continuously. Deep helical screw flights in the feed zone grip the solid pellets and convey them forward down the heated barrel.' },
          { title: '3. Melting & Compression in Transition Zone', text: 'Tapering flight depth compresses the polymer. External heater bands combined with intense mechanical shear dissipate heat, converting pellets into a cohesive melt.' },
          { title: '4. Metering & Die Pressure Generation', text: 'In the shallow metering zone, the rotating screw pumps and homogenises the melt, generating high pressure (100–250 bar) toward the head.' },
          { title: '5. Flow Through Breaker Plate & Annular Die', text: 'Melt passes through the screen pack/breaker plate to eliminate swirl, then flows through the annular mandrel die, emerging continuously as a hollow cylindrical pipe profile.' },
          { title: '6. Vacuum Calibration & Water Spray Tank', text: 'The extruded hot tube enters the vacuum sizing sleeve. Internal vacuum pulls the outer diameter against the precision sleeve while chilled water sprays freeze the wall.' },
          { title: '7. Haul-Off Caterpillar Pulling', text: 'Motorised dual-track caterpillar haul-off belts clamp the solidified pipe, applying continuous steady tension at matched line speed without distortion.' },
          { title: '8. Flying Planetary Pipe Cutter', text: 'Traveling planetary saw synchronises with the continuous pipe line speed. A circular cutting blade revolves around the pipe, severing an exact standardized length.' },
          { title: '9. Pipe Discharge & Line Inspection', text: 'Cut pipe rolls onto the tilted collection rack for dimensional, ovality, and wall thickness inspection while continuous extrusion proceeds uninterrupted.' }
        ];
      } else {
        return [
          { title: '1. Thermosetting Charge Preparation & Loading', text: 'Hydraulic press is open. A preheated, accurately weighed thermosetting moulding compound preform (Bakelite / Melamine) is loaded into the heated lower mould cavity.' },
          { title: '2. Press Ram Descent & Mould Closing', text: 'The top hydraulic ram drives the upper moving platen and male punch downward along the four vertical precision guide columns toward the lower cavity.' },
          { title: '3. Hydraulic Compression & Cavity Flow', text: 'The heated punch enters the cavity under high tonnage. Softened thermoset compound flows under compression, filling all cavity contours and relief.' },
          { title: '4. Thermal Curing (Polymer Cross-Linking)', text: 'Maintained at 160–180 °C under sustained pressure, irreversible chemical polycondensation occurs. Polymer chains cross-link into a rigid 3D infusible thermoset network.' },
          { title: '5. High-Pressure Cure Hold', text: 'Full hydraulic pressure is maintained throughout cure duration to prevent blisters, remove volatiles, and ensure high dielectric and mechanical strength.' },
          { title: '6. De-pressurisation & Mould Opening', text: 'Hydraulic cylinder reverses pressure. Upper platen and punch retract smoothly upward along the guide columns to full top clearance.' },
          { title: '7. Bottom Hydraulic Knockout (Demoulding)', text: 'Hydraulic knockout pins advance vertically upward through the lower platen, lifting the rigid cured thermoset component out of the female cavity.' },
          { title: '8. Component Inspection & Deflashing', text: 'Finished thermosetting part is removed to the inspection bench. Flash is trimmed along the shear edge and cure hardness is verified.' }
        ];
      }
    },
    compute: (values) => {
      const mode = values.machineMode || 'Injection Moulding';
      const isCutaway = values.cutaway !== 'Solid Machine Exterior';
      const mat = values.polymerMaterial || (mode === 'Compression Moulding' ? 'Bakelite (Phenol-Formaldehyde)' : 'Polypropylene (PP)');
      const temp = Number(values.barrelTemp) || (mode === 'Compression Moulding' ? 165 : 230);
      const pressure = Number(values.procPressure) || 110;
      const rpm = Number(values.screwRpm) || 75;
      const cycle = Number(values.cycleDuration) || 28;

      let formulas = [];
      let readouts = [];
      let clampTonnage = 0;
      let throughputKgH = 0;
      let curePercent = 100;
      let partWeightG = 0;

      if (mode === 'Injection Moulding') {
        // Projected area: ~140 cm2, Cavity pressure: ~60% of injection pressure
        const projArea = 140; // cm2
        const pCavity = pressure * 0.62; // bar
        clampTonnage = Math.round((projArea * pCavity * 1.15) / 98.1); // tonnes
        partWeightG = Math.round(projArea * 0.28 * (mat.includes('ABS') ? 1.05 : mat.includes('Nylon') ? 1.14 : 0.91));
        formulas = [
          'Clamp Force F_c = (A_proj × P_cavity × C_safe) / 98.1 ≈ ' + clampTonnage + ' tonnes',
          'Shot Volume V_shot = π/4 × D_screw² × L_stroke ≈ ' + Math.round(partWeightG / 0.92) + ' cm³',
          'Volumetric Shrinkage S_v ≈ 1.2% – 2.0% (compensated by packing phase)'
        ];
        readouts = [
          { label: 'Process mode', value: 'Injection Moulding', tone: 'blue' },
          { label: 'Polymer material', value: mat.split(' ')[0], tone: 'blue' },
          { label: 'Clamp force', value: clampTonnage + ' tonnes', tone: 'amber' },
          { label: 'Melt temperature', value: temp + ' °C', tone: temp >= 210 ? 'amber' : 'blue' },
          { label: 'Injection pressure', value: pressure + ' bar', tone: 'blue' },
          { label: 'Cycle time', value: cycle + ' s', tone: 'green' }
        ];
      } else if (mode === 'Extrusion Moulding') {
        // Throughput Q proportional to screw RPM and barrel size
        throughputKgH = Math.round(0.58 * rpm * (mat.includes('PVC') ? 1.35 : 0.94));
        const lineSpeedMMin = (throughputKgH / (0.95 * 3.1415 * (0.05 ** 2 - 0.044 ** 2) * 1000 * 60)).toFixed(1);
        formulas = [
          'Throughput Q = α·N - (β·ΔP / η) ≈ ' + throughputKgH + ' kg/h',
          'Line Speed v_haul = Q / (ρ · A_profile) ≈ ' + lineSpeedMMin + ' m/min',
          'Breaker Plate ΔP ≈ ' + Math.round(pressure * 0.45) + ' bar (converts spiral into laminar flow)'
        ];
        readouts = [
          { label: 'Process mode', value: 'Continuous Extrusion', tone: 'blue' },
          { label: 'Extrusion rate', value: throughputKgH + ' kg/h', tone: 'green' },
          { label: 'Line speed', value: lineSpeedMMin + ' m/min', tone: 'blue' },
          { label: 'Barrel temperature', value: temp + ' °C', tone: 'amber' },
          { label: 'Head pressure', value: pressure + ' bar', tone: 'blue' },
          { label: 'Screw speed', value: rpm + ' rpm', tone: 'green' }
        ];
      } else {
        // Compression Moulding (Thermoset)
        clampTonnage = Math.round((220 * pressure * 0.9) / 98.1); // tonnes
        curePercent = Math.min(100, Math.round(92 + (temp - 150) * 0.2 + (cycle - 20) * 0.3));
        formulas = [
          'Press Tonnage F_press = A_platen × P_hyd ≈ ' + clampTonnage + ' tonnes',
          'Cure Kinetics: t_cure ∝ (thickness)² / α_thermal (Irreversible cross-linking)',
          'Chemical Reaction: Novolac/Resole + Heat/Pressure → 3D Infusible Phenolic Network'
        ];
        readouts = [
          { label: 'Process mode', value: 'Compression Moulding', tone: 'blue' },
          { label: 'Moulding compound', value: mat.split(' ')[0], tone: 'amber' },
          { label: 'Press force', value: clampTonnage + ' tonnes', tone: 'blue' },
          { label: 'Platen temperature', value: temp + ' °C', tone: 'amber' },
          { label: 'Hydraulic pressure', value: pressure + ' bar', tone: 'blue' },
          { label: 'Degree of cure', value: curePercent + '%', tone: 'green' }
        ];
      }

      return {
        formulas,
        readouts,
        state: {
          subject: 'Engineering Chemistry',
          simulation: 'chem-polymer-processing',
          model: 'polymer-processing-industrial',
          visualizationState: {
            mode,
            cutaway: isCutaway,
            material: mat,
            temp,
            pressure,
            rpm,
            cycle,
            clampTonnage,
            throughputKgH,
            partWeightG,
            curePercent
          }
        },
        explain: {
          what: 'Industrial polymer conversion into finished products using three distinct mechanical manufacturing technologies.',
          why: mode === 'Injection Moulding'
            ? 'Injection moulding is selected for high-speed, repeatable mass production of complex 3D net-shape parts with tight tolerances.'
            : mode === 'Extrusion Moulding'
            ? 'Extrusion is a continuous steady-state process that melts and pumps polymer through a profiling die to manufacture endless pipes, tubes, sheets, and profiles.'
            : 'Compression moulding is primarily chosen for high-strength thermosetting compounds (e.g. Bakelite, Melamine) that undergo chemical cross-linking under heat and high tonnage.',
          param: 'Processing Temperature & Pressure',
          effect: 'Temperature controls melt viscosity and molecular fluidity; pressure drives cavity filling, overcomes flow resistance, and counteracts volumetric thermal shrinkage.'
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 7: Thermoplastic vs Thermosetting Polymers
  // ════════════════════════════════════════════════════════════════════
  S['chem-thermo-comparison'] = {
    view3d: true,
    initialView: { yaw: -0.35, pitch: 0.32, zoom: 1.0, panX: 0, panY: 8 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      r('temperature', 'Heating temperature', 25, 350, 5, 25, '°C'),
      r('heatingRate', 'Heating rate', 1, 50, 1, 10, '°C/min'),
    ],
    steps: () => [
      { title: 'Room Temperature', text: 'Both specimens are solid at room temperature. The thermoplastic (e.g., PE, PP) has linear chains with van der Waals bonds. The thermoset (e.g., Bakelite) has a cross-linked 3D network.' },
      { title: 'Begin Heating', text: 'The heating plate temperature rises. The thermoplastic approaches its glass transition temperature (Tg). Molecular chains begin to gain mobility.' },
      { title: 'Softening Point', text: 'Above Tg (~80–120°C for many thermoplastics), the thermoplastic softens, becomes flexible, and begins to deform under its own weight. The thermoset remains rigid — cross-links prevent chain movement.' },
      { title: 'Melting & Flow', text: 'At higher temperatures (~150–250°C), the thermoplastic melts and flows. It can be reshaped. The thermoset does NOT melt. If heated further (~250–300°C), the thermoset begins to char and degrade.' },
      { title: 'Cool & Compare', text: 'The thermoplastic solidifies again on cooling — it can be reheated and reshaped (recyclable). The thermoset remains permanently set. Once degraded, it cannot be recovered.' },
    ],
    compute: (values) => {
      const T = Number(values.temperature) || 25;
      const Tg = 100; const Tm = 180; const Tdegrade = 280;
      let tpState, tsState;
      if (T < Tg) { tpState = 'Rigid / Glassy'; tsState = 'Rigid / Cross-linked'; }
      else if (T < Tm) { tpState = 'Softening / Rubbery'; tsState = 'Rigid / Cross-linked'; }
      else if (T < Tdegrade) { tpState = 'Melted / Flowing'; tsState = 'Rigid / Cross-linked'; }
      else { tpState = 'Melted / Flowing'; tsState = 'Degrading / Charring'; }
      return {
        formulas: ['Thermoplastic: linear chains → soften → melt → resolidify (reversible)', 'Thermoset: cross-linked network → rigid → degrade (irreversible)'],
        readouts: [
          { label: 'Temperature', value: T + ' °C', tone: 'amber' },
          { label: 'Thermoplastic state', value: tpState, tone: T < Tg ? 'blue' : T < Tm ? 'amber' : 'green' },
          { label: 'Thermoset state', value: tsState, tone: T < Tdegrade ? 'green' : 'amber' },
          { label: 'Recyclable?', value: 'Thermoplastic: Yes | Thermoset: No', tone: 'blue' },
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-thermo-comparison', model: 'thermo-comparison',
          visualizationState: { T, Tg, Tm, Tdegrade, tpState, tsState }
        },
        explain: {
          what: 'Thermoplastics soften reversibly; thermosets are permanently cross-linked.',
          why: 'Van der Waals bonds in thermoplastics break on heating (reversible). Covalent cross-links in thermosets require bond-breaking energy (irreversible degradation).',
          param: 'Temperature', effect: 'Increasing temperature shows the fundamental difference in thermal behaviour.'
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 8: Municipal Water Treatment Plant
  // ════════════════════════════════════════════════════════════════════
  S['chem-water-treatment-plant'] = {
    view3d: true,
    initialView: { yaw: -0.25, pitch: 0.25, zoom: 0.9, panX: 0, panY: 0 },
    stepDuration: 4.0,
    live: true,
    conceptual: false,
    params: [
      r('turbidity', 'Raw water turbidity', 5, 200, 5, 80, 'NTU'),
      r('alumDose', 'Alum coagulant dose', 0, 100, 5, 35, 'mg/L'),
      r('chlorineDose', 'Chlorine dose', 0, 10, 0.5, 2, 'mg/L'),
      r('contactTime', 'Disinfection contact time', 5, 60, 5, 30, 'min'),
    ],
    steps: () => [
      { title: 'Intake & Screening', text: 'Raw water from the river/reservoir passes through bar screens to remove large debris (branches, plastic, leaves). Coarse particles settle in the intake chamber.' },
      { title: 'Coagulation & Flocculation', text: 'Alum (Al₂(SO₄)₃) is added as coagulant. Al³⁺ ions neutralize negatively charged colloids. Gentle stirring causes micro-flocs to aggregate into larger, settleable flocs.' },
      { title: 'Sedimentation', text: 'Water flows slowly through a large rectangular settling tank. Heavy flocs settle to the bottom as sludge. Clarified water is collected from the top through overflow weirs.' },
      { title: 'Sand Filtration', text: 'The clarified water passes through a rapid sand filter (sand + gravel layers). Remaining fine particles, small flocs, and some microorganisms are physically trapped. Turbidity drops to < 1 NTU.' },
      { title: 'Disinfection & Storage', text: 'Chlorine (Cl₂ or NaOCl) is added to kill pathogenic bacteria and viruses. A minimum contact time of 30 minutes ensures adequate disinfection. Treated water is stored in the clear water reservoir.' },
    ],
    compute: (values) => {
      const turb = Number(values.turbidity) || 80;
      const alum = Number(values.alumDose) || 35;
      const cl = Number(values.chlorineDose) || 2;
      const ct = Number(values.contactTime) || 30;
      const coagEff = Math.min(0.95, alum / 60);
      const turbAfterSettle = turb * (1 - coagEff * 0.85);
      const turbAfterFilter = Math.max(0.3, turbAfterSettle * 0.08);
      const disinfEff = Math.min(99.9, cl * ct * 1.5);
      const finalTurb = turbAfterFilter;
      const residualCl = Math.max(0, cl - 0.5);
      return {
        formulas: ['Al₂(SO₄)₃ + 3Ca(HCO₃)₂ → 2Al(OH)₃↓ + 3CaSO₄ + 6CO₂', 'Cl₂ + H₂O → HOCl + HCl'],
        readouts: [
          { label: 'Raw turbidity', value: turb.toFixed(0) + ' NTU', tone: 'amber' },
          { label: 'After sedimentation', value: turbAfterSettle.toFixed(1) + ' NTU', tone: turbAfterSettle < 10 ? 'green' : 'amber' },
          { label: 'After filtration', value: finalTurb.toFixed(1) + ' NTU', tone: finalTurb < 1 ? 'green' : 'amber' },
          { label: 'Disinfection efficiency', value: disinfEff.toFixed(1) + '%', tone: disinfEff > 99 ? 'green' : 'amber' },
        ],
        state: {
          subject: 'Engineering Chemistry', simulation: 'chem-water-treatment-plant', model: 'water-treatment',
          visualizationState: { turb, alum, cl, ct, coagEff, turbAfterSettle, turbAfterFilter, finalTurb, disinfEff, residualCl }
        },
        explain: {
          what: 'Municipal water treatment follows a multi-barrier approach to produce safe drinking water.',
          why: 'Each stage removes a different class of contaminant. No single process can make raw water safe alone.',
          param: 'Alum dose', effect: 'Insufficient alum leaves colloids un-coagulated; excess alum wastes reagent and can cause post-treatment issues.'
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // SIMULATION 9: Reverse Osmosis Desalination Plant (chem-reverse-osmosis)
  // ════════════════════════════════════════════════════════════════════
  S['chem-reverse-osmosis'] = {
    view3d: true,
    initialView: { yaw: -0.48, pitch: 0.44, zoom: 1.05, panX: 0, panY: 15 },
    stepDuration: 5.0,
    live: true,
    conceptual: false,
    params: [
      r('pressure', 'Applied Hydraulic Pressure', 15, 75, 1, 45, 'bar'),
      r('salt', 'Feed Water Salinity (TDS)', 200, 6000, 50, 1500, 'mg/L'),
      r('rejection', 'Membrane Nominal Salt Rejection', 85, 99.5, 0.5, 97.0, '%'),
      r('feedFlow', 'Feed Water Flow Rate', 15, 80, 5, 45, 'L/min'),
      select('inspection', 'Inspection Mode', 'Assembled Skid', [
        'Assembled Skid',
        'Vessel Cutaway (Internal)',
        'Exploded Membrane Anatomy',
        'Molecular Rejection (Nanoscale)'
      ]),
      select('scenario', 'Operating Scenario', 'Normal Operation', [
        'Normal Operation',
        'Insufficient Pressure (P < π)',
        'High Feed Salinity (Sea Water)'
      ])
    ],
    actions: [
      { key: 'assembledSkid', label: '🏭 Assembled Skid' },
      { key: 'inspectMembrane', label: '🔍 Vessel Cutaway' },
      { key: 'explodedView', label: '💥 Exploded Layers' },
      { key: 'molecularView', label: '🔬 Nanoscale Pore' },
      { key: 'toggleLabels', label: '🏷️ Toggle Labels' },
      { key: 'focusVessel', label: '🎯 Focus Vessel' }
    ],
    onAction: (key, st) => {
      if (key === 'inspectMembrane') {
        st.p.inspection = 'Vessel Cutaway (Internal)';
        return { redraw: true, toast: 'Switched to Vessel Cutaway Inspection' };
      }
      if (key === 'explodedView') {
        st.p.inspection = 'Exploded Membrane Anatomy';
        return { redraw: true, toast: 'Switched to Exploded Membrane Anatomy View' };
      }
      if (key === 'molecularView') {
        st.p.inspection = 'Molecular Rejection (Nanoscale)';
        return { redraw: true, toast: 'Switched to Nanoscale Molecular Separation View' };
      }
      if (key === 'assembledSkid') {
        st.p.inspection = 'Assembled Skid';
        return { redraw: true, toast: 'Restored Assembled Skid Exterior' };
      }
      if (key === 'toggleLabels') {
        if (!st.ui) st.ui = {};
        st.ui.showLabels = st.ui.showLabels === false ? true : false;
        return { redraw: true, toast: st.ui.showLabels ? 'Labels Enabled' : 'Labels Hidden' };
      }
      if (key === 'focusVessel') {
        st.view.yaw = -0.48; st.view.pitch = 0.38; st.view.zoom = 1.35; st.view.panX = -40; st.view.panY = 20;
        return { redraw: true, toast: 'Focused view on RO pressure vessel' };
      }
      return null;
    },
    onClick: (x, y, st) => {
      if (!st.ui) st.ui = {};
      if (!st.p) st.p = {};

      // 1. Top row mode switcher buttons (x: 520 to 990, y: 16 to 48)
      if (y >= 16 && y <= 48) {
        if (x >= 520 && x <= 630) {
          st.p.inspection = 'Assembled Skid';
          return { redraw: true, toast: 'Switched to Assembled Skid Exterior' };
        }
        if (x >= 636 && x <= 756) {
          st.p.inspection = 'Vessel Cutaway (Internal)';
          return { redraw: true, toast: 'Switched to Vessel Cutaway Inspection' };
        }
        if (x >= 762 && x <= 882) {
          st.p.inspection = 'Exploded Membrane Anatomy';
          return { redraw: true, toast: 'Switched to Exploded Membrane Anatomy View' };
        }
        if (x >= 888 && x <= 990) {
          st.p.inspection = 'Molecular Rejection (Nanoscale)';
          return { redraw: true, toast: 'Switched to Nanoscale Molecular Separation View' };
        }
      }

      // 2. Sub row quick action tools (x: 32 to 345, y: 68 to 94)
      if (y >= 68 && y <= 94) {
        if (x >= 32 && x <= 140) {
          st.ui.showLabels = st.ui.showLabels === false ? true : false;
          return { redraw: true, toast: st.ui.showLabels ? 'Labels Enabled' : 'Labels Hidden' };
        }
        if (x >= 146 && x <= 240) {
          st.view.yaw = -0.48; st.view.pitch = 0.44; st.view.zoom = 1.05; st.view.panX = 0; st.view.panY = 15;
          return { redraw: true, toast: 'Reset camera to default isometric view' };
        }
        if (x >= 246 && x <= 345) {
          st.view.yaw = -0.48; st.view.pitch = 0.38; st.view.zoom = 1.35; st.view.panX = -40; st.view.panY = 20;
          return { redraw: true, toast: 'Focused camera on RO pressure vessel' };
        }
      }

      // 3. Close button on modal card (if open)
      const sel = st.ui.selectedComponent;
      if (sel && x >= 630 && x <= 970 && y >= 95 && y <= 245) {
        st.ui.selectedComponent = null;
        return { redraw: true, toast: 'Component info closed' };
      }

      // 4. Component click hit-testing
      const bounds = st.ui._compBounds || [];
      const hit = bounds.find((b) => Math.hypot(b.x - x, b.y - y) < b.r);
      if (hit) {
        st.ui.selectedComponent = hit.id;
        return { redraw: true, toast: 'Selected: ' + hit.title };
      } else if (st.ui.selectedComponent) {
        st.ui.selectedComponent = null;
        return { redraw: true };
      }
      return null;
    },
    steps: () => [
      {
        title: '1. Industrial RO Skid Overview',
        text: 'The industrial reverse osmosis skid integrates a heavy structural steel frame, raw water feed tank, cartridge pretreatment filter housing, high-pressure booster pump, FRP pressure vessel containing a spiral-wound membrane element, pure permeate collection tank, and concentrated brine reject line.'
      },
      {
        title: '2. Feed-Water Intake & Low-Pressure Piping',
        text: 'Saline feed water is drawn from the feed tank through low-pressure isolation valves and stainless piping at 2–3 bar. The incoming feed contains both suspended particulates and dissolved mineral salts (TDS).'
      },
      {
        title: '3. Cartridge Pretreatment Filter',
        text: 'Feed passes through a 5-micron spun polypropylene cartridge filter. Suspended solids, silt, and colloids (> 5 μm) are physically trapped to prevent downstream membrane fouling. Dissolved salts pass through freely.'
      },
      {
        title: '4. High-Pressure Booster Pumping',
        text: 'The electric motor drives the multi-stage vertical booster pump, raising hydraulic pressure to 45 bar. This high pressure overcomes the natural osmotic pressure difference (π ≈ 0.00078 × TDS) to drive net reverse water flux across the membrane.'
      },
      {
        title: '5. High-Pressure Vessel Entry',
        text: 'Pressurized saline water enters the pressure vessel through the high-pressure end port. The composite FRP shell and end closures withstand sustained operating pressures up to 70 bar, containing the spiral-wound membrane element.'
      },
      {
        title: '6. Spiral-Wound Element Anatomy',
        text: 'The spiral-wound element consists of leaf envelopes wrapped around a central perforated tube: feed spacer mesh creates turbulent flow channels; semipermeable aromatic polyamide thin-film skin rejects ions; tricot carrier fabric conducts pure water to the central tube.'
      },
      {
        title: '7. Crossflow Selective Permeation',
        text: 'Applied pressure drives water molecules across the non-porous polyamide barrier layer by solution-diffusion. Over 97% of dissolved hydrated ions (Na⁺, Cl⁻, Ca²⁺, SO₄²⁻) are rejected by size exclusion and charge repulsion, remaining in the feed channels.'
      },
      {
        title: '8. Brine Concentrate Sweep',
        text: 'As water permeates through the membrane, the remaining feed stream becomes progressively concentrated in dissolved solids. Continuous tangential crossflow sweeps accumulated ions toward the reject port, minimizing concentration polarization.'
      },
      {
        title: '9. Pure Permeate Collection',
        text: 'Desalinated permeate spirals through the tricot fabric into the central perforated collection tube, exits via the dedicated permeate line, passes through the rotameter, and fills the product water tank with high-purity water.'
      },
      {
        title: '10. Concentrated Brine Discharge',
        text: 'The high-salinity brine concentrate exits through the vessel reject port, passes the needle backpressure control valve, and discharges through the separate reject manifold for disposal or secondary recovery.'
      },
      {
        title: '11. Operating Scenarios & Osmotic Limits',
        text: 'Evaluate operating regimes: if applied pressure drops below osmotic pressure (P < π), water flux ceases entirely; higher feed salinity increases osmotic threshold, requiring higher driving pressure to maintain recovery.'
      },
      {
        title: '12. Complete Skid Ready for Replay',
        text: 'All equipment covers, pressure boundaries, and flow streams return to steady-state standby. Adjust parameters or select different operating scenarios to test membrane response across conditions.'
      }
    ],
    validate: (values) => {
      const w = [];
      const p = Number(values.pressure) || 45;
      if (p <= 0) w.push('Applied hydraulic pressure must be greater than zero.');
      return w;
    },
    compute: (values) => {
      let pApplied = Number(values.pressure) || 45;
      let feedTds = Number(values.salt) || 1500;
      const rej = Number(values.rejection) || 97.0;
      const qFeed = Number(values.feedFlow) || 45;
      const scenario = values.scenario || 'Normal Operation';
      const inspection = values.inspection || 'Assembled Skid';

      if (scenario === 'Insufficient Pressure (P < π)') {
        const naturalPi = feedTds * 0.00078;
        pApplied = Math.max(0.5, naturalPi * 0.55);
      } else if (scenario === 'High Feed Salinity (Sea Water)') {
        feedTds = 35000;
      }

      const piOsmotic = feedTds * 0.00078;
      const netDrivingPressure = Math.max(0, pApplied - piOsmotic);
      const isFluxing = netDrivingPressure > 0.01;

      const maxRecovery = feedTds > 10000 ? 42 : 55;
      const recoveryRate = isFluxing ? Math.min(maxRecovery, (netDrivingPressure / pApplied) * 60) : 0;
      const qPermeate = isFluxing ? qFeed * (recoveryRate / 100) : 0;
      const qBrine = qFeed - qPermeate;

      const permeateTds = isFluxing ? feedTds * (1 - rej / 100) : 0;
      const brineTds = qBrine > 0.1 ? (qFeed * feedTds - qPermeate * permeateTds) / qBrine : feedTds;
      const waterFlux = isFluxing ? netDrivingPressure * 0.62 : 0;
      const saltPassage = 100 - rej;
      const sec = qPermeate > 0.1 ? (pApplied * 100) / (36 * recoveryRate * 0.72) : 0;

      return {
        formulas: [
          `π = 0.00078 × C_f = 0.00078 × ${feedTds.toFixed(0)} = ${piOsmotic.toFixed(2)} bar`,
          `ΔP_net = P_applied − π = ${pApplied.toFixed(1)} − ${piOsmotic.toFixed(2)} = ${netDrivingPressure.toFixed(2)} bar`,
          `J_w = A × (ΔP − Δπ) = ${waterFlux.toFixed(1)} L/(m²·h)`,
          `C_p = C_f × (1 − R) = ${feedTds.toFixed(0)} × (1 − ${(rej / 100).toFixed(3)}) = ${permeateTds.toFixed(1)} mg/L`,
          `Y = (Q_p / Q_f) × 100% = (${qPermeate.toFixed(1)} / ${qFeed.toFixed(1)}) × 100% = ${recoveryRate.toFixed(1)}%`
        ],
        readouts: [
          { label: 'Applied Pressure', value: `${pApplied.toFixed(1)} bar`, tone: 'blue' },
          { label: 'Osmotic Pressure (π)', value: `${piOsmotic.toFixed(2)} bar`, tone: 'amber' },
          { label: 'Net Driving ΔP', value: `${netDrivingPressure.toFixed(2)} bar`, tone: isFluxing ? 'green' : 'red' },
          { label: 'Permeate Flux (Qp)', value: `${qPermeate.toFixed(1)} L/min`, tone: isFluxing ? 'green' : 'amber' },
          { label: 'Permeate TDS', value: `${permeateTds.toFixed(1)} mg/L`, tone: isFluxing ? 'green' : 'blue' },
          { label: 'Brine TDS', value: `${brineTds.toFixed(0)} mg/L`, tone: 'amber' },
          { label: 'Recovery Rate', value: `${recoveryRate.toFixed(1)}%`, tone: isFluxing ? 'green' : 'amber' }
        ],
        state: {
          subject: 'Engineering Chemistry',
          simulation: 'chem-reverse-osmosis',
          model: 'reverse-osmosis',
          pApplied,
          feedTds,
          piOsmotic,
          netDrivingPressure,
          isFluxing,
          recoveryRate,
          qPermeate,
          qBrine,
          qFeed,
          permeateTds,
          brineTds,
          waterFlux,
          saltPassage,
          sec,
          inspection,
          scenario,
          visualizationState: {
            pApplied,
            feedTds,
            piOsmotic,
            netDrivingPressure,
            isFluxing,
            recoveryRate,
            qPermeate,
            qBrine,
            qFeed,
            permeateTds,
            brineTds,
            waterFlux,
            saltPassage,
            sec,
            inspection,
            scenario
          }
        },
        explain: {
          what: isFluxing
            ? `Reverse Osmosis applies ${pApplied.toFixed(1)} bar hydraulic pressure exceeding the natural osmotic pressure (${piOsmotic.toFixed(2)} bar), forcing water across the semi-permeable polyamide membrane while rejecting ${rej.toFixed(1)}% of dissolved salts.`
            : `Applied hydraulic pressure (${pApplied.toFixed(1)} bar) is LESS than or EQUAL to the feed water's osmotic pressure (${piOsmotic.toFixed(2)} bar). Net driving pressure ΔP_net is 0 bar, so reverse osmosis cannot occur.`,
          why: 'The thin-film composite polyamide membrane barrier layer features sub-nanometer free volume cavities (~0.28 nm), allowing polar water molecules (~0.275 nm) to diffuse through while hydrated mineral ions (Na⁺ ~0.72 nm, Cl⁻ ~0.66 nm) are rejected by size exclusion and Donnan electrostatic repulsion.',
          param: 'Applied Pressure vs. Feed Salinity',
          effect: isFluxing
            ? `At ${pApplied.toFixed(1)} bar against ${feedTds.toFixed(0)} mg/L TDS feed, the system generates ${qPermeate.toFixed(1)} L/min permeate with ${permeateTds.toFixed(1)} mg/L TDS (${recoveryRate.toFixed(1)}% water recovery). Concentrated brine rejects ${qBrine.toFixed(1)} L/min at ${brineTds.toFixed(0)} mg/L TDS.`
            : `No permeate produced. To initiate reverse osmosis, applied hydraulic pressure must be increased above the osmotic threshold (${piOsmotic.toFixed(2)} bar).`
        }
      };
    },
    draw: null
  };

  // ════════════════════════════════════════════════════════════════════
  // Wire up: if 3D draw functions exist, attach them
  // ════════════════════════════════════════════════════════════════════
  CAT.simulations.forEach((sim) => {
    if (window.Chem3DSimsNew && window.Chem3DSimsNew[sim.id]) {
      const sim3d = window.Chem3DSimsNew[sim.id];
      if (S[sim.id]) {
        S[sim.id].draw = sim3d.draw;
        if (sim3d.initialView) S[sim.id].initialView = sim3d.initialView;
      }
    }
  });

  window.ChemSims = S;
})();
