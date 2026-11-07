/**
 * ecg-simulation.js
 * Master Interactive Engine for Digital Electronics (U21ECG01 / U25EC201)
 * Regulation R2021 & R2025 CBCS · Semester II · ESC
 *
 * Provides:
 *  - 46 Interactive Digital Electronics Simulations across 5 Units
 *  - Dedicated canvas graphics, logic gate schematics, timing waveforms & state machines
 *  - Real-time Boolean logic engine (Gates, Adders, MUX, FF, Counters, Hazards)
 *  - 3 Learning Modes: Learn 🎓, Experiment 🔬, Challenge 🏆
 *  - 🌓 Dark / White Color Theme Switching with high-contrast logic lines
 *  - Step-by-step playback with Speed control, Pedagogy cards, and Subject AI Tutor
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1. STATE & DOM ELEMENT REFS
  // ══════════════════════════════════════════════════════════
  const catalog = (typeof window !== 'undefined' && window.EduverseECGCatalog) || null;
  if (!catalog) {
    console.error('[ECG Simulation] EduverseECGCatalog not loaded.');
    return;
  }

  const state = {
    currentUnit: 1,
    currentSimId: 'de-logic-gates',
    mode: 'learn',
    theme: (function () { try { return localStorage.getItem('eduverse_theme') || 'light'; } catch (e) { return 'light'; } })(),
    isPlaying: false,
    speed: 1.0,
    currentStep: 0,
    maxSteps: 4,
    animTime: 0,
    animFrameId: null,
    playIntervalId: null,
    params: {},
    challengeState: { solved: false, feedback: '' }
  };

  const dom = {
    app: document.getElementById('ep-app'),
    unitSelect: document.getElementById('ecg-unit'),
    simSelect: document.getElementById('ecg-simulation'),
    title: document.getElementById('ep-title'),
    subtitle: document.getElementById('ep-subtitle'),
    themeToggle: document.getElementById('ecg-theme-toggle'),
    fullscreenBtn: document.getElementById('ep-fullscreen'),
    exportBtn: document.getElementById('ep-export'),
    modeBtns: document.querySelectorAll('.ep-seg'),
    playBtn: document.getElementById('ep-play'),
    pauseBtn: document.getElementById('ep-pause'),
    prevBtn: document.getElementById('ep-prev'),
    nextBtn: document.getElementById('ep-next'),
    resetBtn: document.getElementById('ep-reset'),
    resetParamsBtn: document.getElementById('ecg-reset-params'),
    speedSelect: document.getElementById('ecg-speed'),
    stepLabel: document.getElementById('ecg-step-label'),
    progressFill: document.getElementById('ecg-progress-fill'),
    canvas: document.getElementById('ecg-canvas'),
    readouts: document.getElementById('ep-readouts'),
    overlaySim: document.getElementById('ecg-overlay-sim'),
    overlayState: document.getElementById('ecg-overlay-state'),
    whatText: document.getElementById('ecg-what'),
    whyText: document.getElementById('ecg-why'),
    nextText: document.getElementById('ecg-next-info'),
    bannerNo: document.getElementById('ep-banner-no'),
    bannerTitle: document.getElementById('ep-banner-title'),
    bannerText: document.getElementById('ep-banner-text'),
    inputsForm: document.getElementById('ecg-inputs-form'),
    inputActions: document.getElementById('ecg-input-actions'),
    challengeCard: document.getElementById('ep-challenge-card'),
    challengePrompt: document.getElementById('ecg-challenge-prompt'),
    verifyChallengeBtn: document.getElementById('ecg-verify-challenge'),
    resetChallengeBtn: document.getElementById('ecg-reset-challenge'),
    challengeResult: document.getElementById('ecg-challenge-result'),
    formulaBox: document.getElementById('ecg-formula-box'),
    specList: document.getElementById('ecg-spec-list'),
    aiQuestion: document.getElementById('ecg-ai-question'),
    askAiBtn: document.getElementById('ecg-ask-ai'),
    aiAnswer: document.getElementById('ecg-ai-answer'),
    toast: document.getElementById('ecg-toast')
  };

  const ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  // ══════════════════════════════════════════════════════════
  // 2. THEME & DISPLAY TOKENS
  // ══════════════════════════════════════════════════════════
  const GATE_COLORS = {
    dark: {
      bg: '#060912',
      grid: 'rgba(30,34,64,0.5)',
      body: '#1a2240',
      stroke: '#818cf8',
      high: '#4ade80',
      low: '#f87171',
      wire: '#60a5fa',
      text: '#f8fafc',
      muted: '#94a3b8',
      clock: '#fbbf24',
      output: '#c084fc',
      kmap: '#38bdf8',
      card: '#0f172a'
    },
    light: {
      bg: '#f8f9fc',
      grid: 'rgba(226,228,236,0.6)',
      body: '#eef2ff',
      stroke: '#4338ca',
      high: '#16a34a',
      low: '#dc2626',
      wire: '#2563eb',
      text: '#141a2e',
      muted: '#64748b',
      clock: '#d97706',
      output: '#7c3aed',
      kmap: '#0284c7',
      card: '#ffffff'
    }
  };

  function gc(dark) {
    return dark ? GATE_COLORS.dark : GATE_COLORS.light;
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('eduverse_theme', theme); } catch (e) {}
    if (dom.themeToggle) {
      dom.themeToggle.textContent = theme === 'dark' ? '☀️ Light Theme' : '🌓 Dark Theme';
      dom.themeToggle.title = 'Switch to ' + (theme === 'dark' ? 'White / Light' : 'Dark') + ' mode';
    }
    renderSimulation();
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    showToast('Switched to ' + (state.theme === 'dark' ? 'Dark Mode' : 'Light / White Mode'));
  }

  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(dom.toast._timer);
    dom.toast._timer = setTimeout(function () {
      dom.toast.classList.remove('show');
    }, 2200);
  }

  // ══════════════════════════════════════════════════════════
  // 3. INITIALIZATION & URL PARSING
  // ══════════════════════════════════════════════════════════
  function init() {
    const params = new URLSearchParams(window.location.search);
    const requestedSim = params.get('sim') || params.get('simulationId') || params.get('preset') || 'de-logic-gates';
    const requestedUnit = params.get('unit') || params.get('unitNumber');
    const subjectCode = params.get('subjectCode') || 'U21ECG01';

    if (dom.subtitle && subjectCode.includes('U25')) {
      dom.subtitle.textContent = 'U25EC201 · Semester II · Engineering Science Course (ESC)';
    }

    const sim = catalog.getSimulationById(requestedSim);
    if (sim) {
      state.currentUnit = sim.unit;
      state.currentSimId = sim.id;
    } else if (requestedUnit) {
      state.currentUnit = parseInt(requestedUnit, 10) || 1;
      const unitSims = catalog.getSimulationsForUnit(state.currentUnit);
      if (unitSims.length) state.currentSimId = unitSims[0].id;
    }

    applyTheme(state.theme);

    populateUnitDropdown();
    populateSimDropdown(state.currentUnit);
    if (dom.unitSelect) dom.unitSelect.value = String(state.currentUnit);
    if (dom.simSelect) dom.simSelect.value = state.currentSimId;

    // Attach Listeners
    if (dom.unitSelect) dom.unitSelect.addEventListener('change', onUnitChange);
    if (dom.simSelect) dom.simSelect.addEventListener('change', onSimChange);
    if (dom.themeToggle) dom.themeToggle.addEventListener('click', toggleTheme);
    if (dom.fullscreenBtn) dom.fullscreenBtn.addEventListener('click', toggleFullscreen);
    if (dom.exportBtn) dom.exportBtn.addEventListener('click', exportCanvas);
    if (dom.playBtn) dom.playBtn.addEventListener('click', startPlayback);
    if (dom.pauseBtn) dom.pauseBtn.addEventListener('click', pausePlayback);
    if (dom.prevBtn) dom.prevBtn.addEventListener('click', prevStep);
    if (dom.nextBtn) dom.nextBtn.addEventListener('click', nextStep);
    if (dom.resetBtn) dom.resetBtn.addEventListener('click', resetSimulation);
    if (dom.resetParamsBtn) dom.resetParamsBtn.addEventListener('click', resetParams);
    if (dom.speedSelect) dom.speedSelect.addEventListener('change', function () { state.speed = parseFloat(this.value); });

    dom.modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { switchMode(this.dataset.learn); });
    });

    if (dom.verifyChallengeBtn) dom.verifyChallengeBtn.addEventListener('click', verifyChallenge);
    if (dom.resetChallengeBtn) dom.resetChallengeBtn.addEventListener('click', resetChallenge);
    if (dom.askAiBtn) dom.askAiBtn.addEventListener('click', askSubjectAI);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    loadSimulation(state.currentSimId);
  }

  function populateUnitDropdown() {
    // Handled in HTML
  }

  function populateSimDropdown(unitNumber) {
    if (!dom.simSelect) return;
    const sims = catalog.getSimulationsForUnit(unitNumber);
    dom.simSelect.innerHTML = '';
    sims.forEach(function (s) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.icon + ' ' + s.topic;
      if (s.flagship) opt.textContent += ' ⭐';
      dom.simSelect.appendChild(opt);
    });
  }

  function onUnitChange() {
    state.currentUnit = parseInt(dom.unitSelect.value, 10);
    populateSimDropdown(state.currentUnit);
    const sims = catalog.getSimulationsForUnit(state.currentUnit);
    if (sims.length) {
      state.currentSimId = sims[0].id;
      dom.simSelect.value = sims[0].id;
      loadSimulation(sims[0].id);
    }
  }

  function onSimChange() {
    state.currentSimId = dom.simSelect.value;
    loadSimulation(state.currentSimId);
  }

  // ══════════════════════════════════════════════════════════
  // 4. LOAD & HYDRATE SIMULATION
  // ══════════════════════════════════════════════════════════
  function loadSimulation(simId) {
    const sim = catalog.getSimulationById(simId);
    if (!sim) return;

    state.currentSimId = simId;
    state.currentStep = 0;
    state.isPlaying = false;
    state.animTime = 0;
    state.challengeState = { solved: false, feedback: '' };

    state.params = JSON.parse(JSON.stringify(sim.defaultParams || {}));

    if (dom.title) dom.title.textContent = sim.title;
    if (dom.overlaySim) dom.overlaySim.textContent = sim.topic;
    if (dom.overlayState) {
      dom.overlayState.textContent = state.mode === 'learn' ? '🎓 Learn Mode' : state.mode === 'experiment' ? '🔬 Experiment' : '🏆 Challenge';
    }

    state.maxSteps = getStepCount(sim);
    updateStepLabel();

    updateFormulaBox(sim);
    updateSpecList(sim);
    buildInputs(sim);
    updateExplanation(sim);

    if (state.mode === 'challenge' && sim.challenge) {
      if (dom.challengeCard) dom.challengeCard.style.display = '';
      if (dom.challengePrompt) dom.challengePrompt.textContent = sim.challenge.goal;
      if (dom.challengeResult) dom.challengeResult.innerHTML = '';
    } else {
      if (dom.challengeCard) dom.challengeCard.style.display = 'none';
    }

    renderSimulation();
    showToast(sim.icon + ' ' + sim.topic);
  }

  function getStepCount(sim) {
    if (sim.id.includes('kmap') || sim.id.includes('quine')) return 6;
    if (sim.id.includes('counter') || sim.id.includes('sequence')) return 6;
    if (sim.id.includes('shift') || sim.id.includes('ring') || sim.id.includes('johnson')) return 5;
    if (sim.id.includes('latch') || sim.id.includes('ff') || sim.id.includes('master')) return 5;
    return 4;
  }

  function resizeCanvas() {
    if (!dom.canvas) return;
    const container = dom.canvas.parentElement;
    if (!container) return;
    const w = container.clientWidth;
    const h = Math.max(340, Math.min(w * 0.52, 540));
    const dpr = window.devicePixelRatio || 1;
    dom.canvas.width = w * dpr;
    dom.canvas.height = h * dpr;
    dom.canvas.style.width = w + 'px';
    dom.canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderSimulation();
  }

  // ══════════════════════════════════════════════════════════
  // 5. DRAWING PRIMITIVES & WIRE UTILITIES
  // ══════════════════════════════════════════════════════════
  function drawGrid(w, h, dark) {
    const c = gc(dark);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    const step = 28;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  function drawGateShape(cx, cy, gateType, size, dark) {
    const c = gc(dark);
    const s = size || 50;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = c.stroke;
    ctx.fillStyle = c.body;

    switch (gateType) {
      case 'AND':
        ctx.beginPath();
        ctx.moveTo(-s/2, -s/2);
        ctx.lineTo(0, -s/2);
        ctx.arc(0, 0, s/2, -Math.PI/2, Math.PI/2);
        ctx.lineTo(-s/2, s/2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      case 'OR':
        ctx.beginPath();
        ctx.moveTo(-s/2, -s/2);
        ctx.quadraticCurveTo(-s/4, 0, -s/2, s/2);
        ctx.quadraticCurveTo(s/4, s/2, s/2, 0);
        ctx.quadraticCurveTo(s/4, -s/2, -s/2, -s/2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        break;
      case 'NOT':
        ctx.beginPath();
        ctx.moveTo(-s/3, -s/3);
        ctx.lineTo(s/3, 0);
        ctx.lineTo(-s/3, s/3);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.arc(s/3 + 6, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'NAND':
        drawGateShape(0, 0, 'AND', s, dark);
        ctx.beginPath();
        ctx.arc(s/2 + 6, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = c.body; ctx.fill(); ctx.stroke();
        break;
      case 'NOR':
        drawGateShape(0, 0, 'OR', s, dark);
        ctx.beginPath();
        ctx.arc(s/2 + 6, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = c.body; ctx.fill(); ctx.stroke();
        break;
      case 'XOR':
        drawGateShape(0, 0, 'OR', s, dark);
        ctx.beginPath();
        ctx.moveTo(-s/2 - 6, -s/2);
        ctx.quadraticCurveTo(-s/4 - 6, 0, -s/2 - 6, s/2);
        ctx.stroke();
        break;
      case 'XNOR':
        drawGateShape(0, 0, 'XOR', s, dark);
        ctx.beginPath();
        ctx.arc(s/2 + 6, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = c.body; ctx.fill(); ctx.stroke();
        break;
      default:
        ctx.fillRect(-s/2, -s/2, s, s);
        ctx.strokeRect(-s/2, -s/2, s, s);
    }
    ctx.restore();
  }

  function drawWire(x1, y1, x2, y2, val, dark) {
    const c = gc(dark);
    ctx.strokeStyle = val === 1 ? c.high : val === 0 ? c.low : c.wire;
    ctx.lineWidth = val === 1 ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }

  function drawLabel(x, y, text, dark, size, color) {
    const c = gc(dark);
    ctx.fillStyle = color || c.text;
    ctx.font = (size || 12) + 'px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function drawBit(x, y, val, dark, size) {
    const c = gc(dark);
    const r = size || 15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = val === 1 ? c.high : c.low;
    ctx.fill();
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + (r * 0.8) + 'px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(val), x, y);
  }

  function drawTruthTable(x, y, headers, rows, dark, highlightRow) {
    const c = gc(dark);
    const cellW = 46, cellH = 22;
    const totalW = headers.length * cellW;

    ctx.fillStyle = dark ? '#1a2240' : '#e0e7ff';
    ctx.fillRect(x, y, totalW, cellH);
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, totalW, cellH);

    headers.forEach(function (h, i) {
      ctx.fillStyle = c.stroke;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(h, x + i * cellW + cellW / 2, y + cellH / 2);
      if (i > 0) {
        ctx.beginPath(); ctx.moveTo(x + i * cellW, y); ctx.lineTo(x + i * cellW, y + cellH + rows.length * cellH); ctx.stroke();
      }
    });

    rows.forEach(function (row, ri) {
      const ry = y + cellH + ri * cellH;
      if (ri === highlightRow) {
        ctx.fillStyle = dark ? 'rgba(129,140,248,0.25)' : 'rgba(67,56,202,0.12)';
        ctx.fillRect(x, ry, totalW, cellH);
      }
      ctx.strokeStyle = dark ? 'rgba(30,34,64,0.8)' : 'rgba(200,200,220,0.8)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(x, ry + cellH); ctx.lineTo(x + totalW, ry + cellH); ctx.stroke();

      row.forEach(function (val, ci) {
        const isOut = ci === row.length - 1;
        ctx.fillStyle = isOut ? (val === 1 ? c.high : c.low) : c.text;
        ctx.font = (isOut ? 'bold ' : '') + '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), x + ci * cellW + cellW / 2, ry + cellH / 2);
      });
    });

    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, totalW, cellH + rows.length * cellH);
  }

  // ══════════════════════════════════════════════════════════
  // 6. RENDERERS FOR ALL 46 SIMULATIONS
  // ══════════════════════════════════════════════════════════
  const RENDERERS = {};

  // ─── UNIT I: 1. de-number-system ───
  RENDERERS['de-number-system'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const inBase = parseInt(p.inputBase) || 10;
    const rawVal = String(p.inputValue || '42').trim();
    const decVal = parseInt(rawVal, inBase) || 0;

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Radix Place-Value & Conversion Traces', w / 2, 28);

    // 4 Base Badges
    const bases = [
      { name: 'Decimal (Base 10)', val: decVal.toString(10), r: 10 },
      { name: 'Binary (Base 2)', val: decVal.toString(2).padStart(8, '0'), r: 2 },
      { name: 'Octal (Base 8)', val: decVal.toString(8), r: 8 },
      { name: 'Hexadecimal (Base 16)', val: decVal.toString(16).toUpperCase(), r: 16 }
    ];

    const cardW = 190, cardH = 50, gap = 12;
    const startX = (w - (4 * cardW + 3 * gap)) / 2;
    bases.forEach((b, i) => {
      const bx = startX + i * (cardW + gap);
      const isSel = b.r === inBase;
      ctx.fillStyle = isSel ? (dark ? 'rgba(99,102,241,0.2)' : 'rgba(238,242,255,0.9)') : (dark ? '#111827' : '#ffffff');
      ctx.strokeStyle = isSel ? c.stroke : (dark ? '#1f2937' : '#e5e7eb');
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(bx, 50, cardW, cardH, 8); ctx.fill(); ctx.stroke();

      ctx.fillStyle = c.muted;
      ctx.font = '10px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(b.name, bx + 10, 68);

      ctx.fillStyle = isSel ? c.stroke : c.text;
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillText(b.val, bx + 10, 88);
    });

    // Conversion Steps Trace (Division Algorithm)
    const traceY = 125;
    ctx.fillStyle = dark ? '#111827' : '#ffffff';
    ctx.strokeStyle = dark ? '#1f2937' : '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(w * 0.1, traceY, w * 0.8, h - traceY - 20, 8); ctx.fill(); ctx.stroke();

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Successive Division Trace (Base 10 → Base 2):', w * 0.12, traceY + 25);

    let temp = decVal;
    let stepRow = 0;
    const rems = [];
    ctx.font = '12px "JetBrains Mono", monospace';
    while (temp > 0 && stepRow < 8) {
      const q = Math.floor(temp / 2);
      const r = temp % 2;
      rems.unshift(r);
      ctx.fillStyle = c.text;
      ctx.fillText(`${temp} ÷ 2 = ${q}  remainder  [${r}]`, w * 0.15, traceY + 52 + stepRow * 22);
      temp = q;
      stepRow++;
    }
    if (decVal === 0) {
      ctx.fillText('0 ÷ 2 = 0 remainder [0]', w * 0.15, traceY + 52);
      rems.push(0);
    }

    ctx.fillStyle = c.high;
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText(`Result (Read upward): ${rems.join('')}₂ = ${decVal}₁₀`, w * 0.52, traceY + 60);
  };

  // ─── UNIT I: 2. de-complements ───
  RENDERERS['de-complements'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const raw = String(p.inputValue || '01010110').padStart(8, '0').slice(-8);
    const ones = raw.split('').map(b => b === '1' ? '0' : '1').join('');
    const twos = (parseInt(ones, 2) + 1).toString(2).padStart(8, '0').slice(-8);

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("1's and 2's Complement Representation", w / 2, 30);

    const rows = [
      { label: 'Original Binary (N):', bits: raw, desc: `Unsigned: ${parseInt(raw, 2)} | Signed: ${raw[0] === '1' ? -(parseInt(twos, 2)) : parseInt(raw, 2)}` },
      { label: "1's Complement (N̄):", bits: ones, desc: 'Bitwise Inversion (0 ↔ 1)' },
      { label: "2's Complement (N̄ + 1):", bits: twos, desc: `Negative representation: -${parseInt(raw, 2)}` }
    ];

    const cellW = 38, cellH = 38;
    const startY = 65;
    rows.forEach((r, ri) => {
      const ry = startY + ri * 85;
      ctx.fillStyle = c.stroke;
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, w * 0.15, ry + 16);

      ctx.fillStyle = c.muted;
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText(r.desc, w * 0.55, ry + 16);

      const bitsStart = w * 0.15;
      r.bits.split('').forEach((bit, bi) => {
        const bx = bitsStart + bi * (cellW + 6);
        const by = ry + 28;
        ctx.fillStyle = bit === '1' ? (dark ? 'rgba(74,222,128,0.2)' : 'rgba(22,163,74,0.15)') : (dark ? '#111827' : '#ffffff');
        ctx.strokeStyle = bit === '1' ? c.high : (dark ? '#374151' : '#d1d5db');
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(bx, by, cellW, cellH, 6); ctx.fill(); ctx.stroke();

        ctx.fillStyle = bit === '1' ? c.high : c.text;
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bit, bx + cellW / 2, by + cellH / 2);
      });
    });
  };

  // ─── UNIT I: 3. de-boolean-theorem ───
  RENDERERS['de-boolean-theorem'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("De Morgan's & Boolean Algebraic Theorems", w / 2, 28);

    // Side-by-side truth tables for (A·B)' vs (A' + B')
    const headers = ['A', 'B', 'A·B', '(A·B)\'', 'A\'', 'B\'', 'A\'+B\''];
    const rows = [
      [0, 0, 0, 1, 1, 1, 1],
      [0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 1, 0, 1, 1],
      [1, 1, 1, 0, 0, 0, 0]
    ];
    drawTruthTable(w * 0.1, 70, headers, rows, dark, st.currentStep % 4);

    // Schematic comparison
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('LHS: NAND Gate (A·B)\'', w * 0.65, 80);
    drawGateShape(w * 0.65, 125, 'NAND', 50, dark);

    ctx.fillText('RHS: Inverted-Input OR Gate (A\' + B\')', w * 0.65, 195);
    drawGateShape(w * 0.65, 240, 'OR', 50, dark);
  };

  // ─── UNIT I: 4. de-logic-gates ⭐ Flagship ───
  RENDERERS['de-logic-gates'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const gType = (p.gateType || 'AND').toUpperCase();
    const a = parseInt(p.inputA) || 0;
    const b = parseInt(p.inputB) || 0;

    let out = 0;
    switch (gType) {
      case 'AND': out = a & b; break;
      case 'OR': out = a | b; break;
      case 'NOT': out = a ? 0 : 1; break;
      case 'NAND': out = (a & b) ? 0 : 1; break;
      case 'NOR': out = (a | b) ? 0 : 1; break;
      case 'XOR': out = a ^ b; break;
      case 'XNOR': out = (a ^ b) ? 0 : 1; break;
    }

    const cx = w * 0.35, cy = h * 0.45;
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gType + ' Logic Gate Circuit', w / 2, 28);

    if (gType !== 'NOT') {
      drawWire(cx - 120, cy - 18, cx - 30, cy - 18, a, dark);
      drawWire(cx - 120, cy + 18, cx - 30, cy + 18, b, dark);
      drawBit(cx - 130, cy - 18, a, dark, 14);
      drawBit(cx - 130, cy + 18, b, dark, 14);
      drawLabel(cx - 150, cy - 18, 'A', dark, 12);
      drawLabel(cx - 150, cy + 18, 'B', dark, 12);
    } else {
      drawWire(cx - 120, cy, cx - 20, cy, a, dark);
      drawBit(cx - 130, cy, a, dark, 14);
      drawLabel(cx - 150, cy, 'A', dark, 12);
    }

    drawGateShape(cx, cy, gType, 55, dark);

    const outX = cx + 40;
    drawWire(outX, cy, outX + 80, cy, out, dark);
    drawBit(outX + 95, cy, out, dark, 14);
    drawLabel(outX + 120, cy, 'Y', dark, 12);

    const ttHeaders = gType === 'NOT' ? ['A', 'Y'] : ['A', 'B', 'Y'];
    const ttRows = [];
    if (gType === 'NOT') {
      ttRows.push([0, 1], [1, 0]);
    } else {
      for (let i = 0; i < 4; i++) {
        const ta = (i >> 1) & 1, tb = i & 1;
        let to = 0;
        switch (gType) {
          case 'AND': to = ta & tb; break;
          case 'OR': to = ta | tb; break;
          case 'NAND': to = (ta & tb) ? 0 : 1; break;
          case 'NOR': to = (ta | tb) ? 0 : 1; break;
          case 'XOR': to = ta ^ tb; break;
          case 'XNOR': to = (ta ^ tb) ? 0 : 1; break;
        }
        ttRows.push([ta, tb, to]);
      }
    }
    const hlRow = gType === 'NOT' ? a : (a << 1 | b);
    drawTruthTable(w * 0.64, h * 0.22, ttHeaders, ttRows, dark, hlRow);
  };

  // ─── UNIT I: 5. de-universal-gates ───
  RENDERERS['de-universal-gates'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const uGate = p.universalGate || 'NAND';
    const tGate = p.targetGate || 'AND';
    const a = parseInt(p.inputA) || 0;
    const b = parseInt(p.inputB) || 0;

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${tGate} Synthesized Exclusively with ${uGate} Gates`, w / 2, 28);

    // Multi-stage NAND synthesis
    const cx1 = w * 0.3, cy1 = h * 0.45;
    const cx2 = w * 0.55, cy2 = h * 0.45;

    drawWire(cx1 - 100, cy1 - 16, cx1 - 25, cy1 - 16, a, dark);
    drawWire(cx1 - 100, cy1 + 16, cx1 - 25, cy1 + 16, b, dark);
    drawBit(cx1 - 110, cy1 - 16, a, dark, 13);
    drawBit(cx1 - 110, cy1 + 16, b, dark, 13);

    drawGateShape(cx1, cy1, uGate, 50, dark);
    const midVal = (a & b) ? 0 : 1;
    drawWire(cx1 + 35, cy1, cx2 - 25, cy1, midVal, dark);

    drawGateShape(cx2, cy2, uGate, 50, dark);
    const finalVal = midVal ? 0 : 1;
    drawWire(cx2 + 35, cy2, cx2 + 95, cy2, finalVal, dark);
    drawBit(cx2 + 105, cy2, finalVal, dark, 13);
    drawLabel(cx2 + 125, cy2, 'Y=' + finalVal, dark, 12);
  };

  // ─── UNIT I: 6. de-sop-pos ───
  RENDERERS['de-sop-pos'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Canonical SOP (Σm) & POS (ΠM) Truth Table & Equations', w / 2, 28);

    const headers = ['m', 'A', 'B', 'C', 'F'];
    const rows = [
      [0, 0, 0, 0, 0], [1, 0, 0, 1, 1], [2, 0, 1, 0, 1], [3, 0, 1, 1, 0],
      [4, 1, 0, 0, 0], [5, 1, 0, 1, 1], [6, 1, 1, 0, 1], [7, 1, 1, 1, 0]
    ];
    drawTruthTable(w * 0.12, 50, headers, rows, dark, st.currentStep % 8);

    const eqX = w * 0.52;
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Canonical SOP Expression:', eqX, 75);
    ctx.fillStyle = c.text;
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText("F = Σm(1, 2, 5, 6)", eqX, 98);
    ctx.fillText("  = A'B'C + A'BC' + AB'C + ABC'", eqX, 120);

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('Canonical POS Expression:', eqX, 165);
    ctx.fillStyle = c.text;
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText("F = ΠM(0, 3, 4, 7)", eqX, 188);
    ctx.fillText("  = (A+B+C)(A+B'+C')(A'+B+C)(A'+B'+C')", eqX, 210);
  };

  // ─── UNIT I: 7. de-kmap ⭐ Flagship ───
  RENDERERS['de-kmap'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const vars = parseInt(p.variables) || 4;

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${vars}-Variable Karnaugh Map Optimization`, w / 2, 28);

    const cellSize = 50;
    const startX = w * 0.15;
    const startY = 70;
    const headers = ['00', '01', '11', '10'];

    // Headers
    headers.forEach((hstr, ci) => {
      ctx.fillStyle = c.muted;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(hstr, startX + ci * cellSize + cellSize / 2, startY - 8);
    });

    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = c.muted;
      ctx.fillText(headers[r], startX - 16, startY + r * cellSize + cellSize / 2);
      for (let ci = 0; ci < 4; ci++) {
        const cx = startX + ci * cellSize;
        const cy = startY + r * cellSize;
        const isOne = (r === 0 && (ci === 0 || ci === 1)) || (r === 2 && (ci === 0 || ci === 1));

        ctx.fillStyle = isOne ? (dark ? 'rgba(56,189,248,0.2)' : 'rgba(2,132,199,0.15)') : (dark ? '#111827' : '#ffffff');
        ctx.strokeStyle = isOne ? c.kmap : (dark ? '#374151' : '#e5e7eb');
        ctx.lineWidth = 1;
        ctx.fillRect(cx, cy, cellSize, cellSize);
        ctx.strokeRect(cx, cy, cellSize, cellSize);

        ctx.fillStyle = isOne ? c.kmap : c.text;
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillText(isOne ? '1' : '0', cx + cellSize / 2, cy + cellSize / 2);
      }
    }

    // Grouping Loop Overlay
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(startX - 4, startY - 4, cellSize * 2 + 8, cellSize * 3 + 8, 12);
    ctx.stroke();

    // Solution
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Minimal Prime Implicants:', w * 0.55, 90);
    ctx.fillStyle = c.text;
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('Quad 1 (m0, m1, m8, m9): B̄C̄', w * 0.55, 120);
    ctx.fillStyle = c.high;
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText('F(A,B,C,D) = B̄C̄ + B·D', w * 0.55, 160);
  };

  // ─── UNIT I: 8. de-quine-mccluskey ───
  RENDERERS['de-quine-mccluskey'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Quine-McCluskey Tabular Reduction', w / 2, 28);

    const cols = [
      { title: 'Step 1: Group by 1-count', rows: ['Group 0: m0 (0000)', 'Group 1: m1 (0001)', '         m2 (0010)', 'Group 2: m5 (0101)'] },
      { title: 'Step 2: Merged Pairs', rows: ['(0, 1) -> 000-', '(0, 2) -> 00-0', '(1, 5) -> 0-01'] },
      { title: 'Step 3: Prime Implicants', rows: ['EPI: B̄D̄ (covers m0, m2)', 'EPI: BD (covers m5)', 'Minimal SOP: B̄D̄ + BD'] }
    ];

    cols.forEach((col, i) => {
      const cx = w * 0.08 + i * (w * 0.3);
      ctx.fillStyle = c.stroke;
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(col.title, cx, 65);

      col.rows.forEach((r, ri) => {
        ctx.fillStyle = c.text;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(r, cx, 95 + ri * 22);
      });
    });
  };

  // ─── UNIT II: 9. de-half-adder & 10. de-full-adder ───
  RENDERERS['de-half-adder'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const a = parseInt(p.inputA) || 0;
    const b = parseInt(p.inputB) || 0;
    const sum = a ^ b;
    const carry = a & b;

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Half Adder Circuit Schematic', w / 2, 28);

    const cx = w * 0.32, cy = h * 0.45;
    drawWire(cx - 100, cy - 30, cx - 25, cy - 30, a, dark);
    drawWire(cx - 100, cy + 30, cx - 25, cy + 30, b, dark);
    drawBit(cx - 110, cy - 30, a, dark, 13);
    drawBit(cx - 110, cy + 30, b, dark, 13);
    drawLabel(cx - 130, cy - 30, 'A', dark, 12);
    drawLabel(cx - 130, cy + 30, 'B', dark, 12);

    // XOR & AND gates
    drawGateShape(cx, cy - 30, 'XOR', 48, dark);
    drawGateShape(cx, cy + 30, 'AND', 48, dark);

    drawWire(cx + 35, cy - 30, cx + 90, cy - 30, sum, dark);
    drawWire(cx + 35, cy + 30, cx + 90, cy + 30, carry, dark);
    drawBit(cx + 105, cy - 30, sum, dark, 13);
    drawBit(cx + 105, cy + 30, carry, dark, 13);
    drawLabel(cx + 135, cy - 30, 'Sum', dark, 12);
    drawLabel(cx + 135, cy + 30, 'Carry', dark, 12);

    drawTruthTable(w * 0.65, 75, ['A', 'B', 'Sum', 'Carry'], [[0,0,0,0], [0,1,1,0], [1,0,1,0], [1,1,0,1]], dark, (a << 1 | b));
  };

  RENDERERS['de-full-adder'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const a = parseInt(p.inputA) || 0;
    const b = parseInt(p.inputB) || 0;
    const cin = parseInt(p.carryIn) || 0;
    const sum = a ^ b ^ cin;
    const cout = (a & b) | (cin & (a ^ b));

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Full Adder (Two Half Adders + OR Gate)', w / 2, 28);

    const bx = w * 0.18, by = h * 0.35;
    ctx.fillStyle = dark ? '#1e293b' : '#e0e7ff';
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(bx, by, 100, 80, 8); ctx.fill(); ctx.stroke();
    drawLabel(bx + 50, by + 40, 'Half Adder 1', dark, 12);

    const bx2 = bx + 160;
    ctx.beginPath(); ctx.roundRect(bx2, by + 20, 100, 80, 8); ctx.fill(); ctx.stroke();
    drawLabel(bx2 + 50, by + 60, 'Half Adder 2', dark, 12);

    drawBit(w * 0.58, by + 40, sum, dark, 14);
    drawBit(w * 0.58, by + 90, cout, dark, 14);
    drawLabel(w * 0.62, by + 40, 'Sum=' + sum, dark, 12);
    drawLabel(w * 0.62, by + 90, 'Cout=' + cout, dark, 12);

    const rows = [
      [0,0,0,0,0], [0,0,1,1,0], [0,1,0,1,0], [0,1,1,0,1],
      [1,0,0,1,0], [1,0,1,0,1], [1,1,0,0,1], [1,1,1,1,1]
    ];
    drawTruthTable(w * 0.72, 60, ['A', 'B', 'Cin', 'Sum', 'Cout'], rows, dark, (a << 2 | b << 1 | cin));
  };

  // ─── UNIT II: 11. de-adder-subtractor & 12. de-parallel-adder ───
  RENDERERS['de-adder-subtractor'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const a = parseInt(p.inputA) || 1;
    const b = parseInt(p.inputB) || 1;
    const mode = parseInt(p.mode) || 0; // 0=Add, 1=Sub
    const bEff = mode ? (b ^ 1) : b;
    const res = mode ? (a - b) : (a + b);

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`1-Bit Adder/Subtractor (Mode: ${mode === 0 ? 'ADD' : 'SUBTRACT'})`, w / 2, 28);

    drawLabel(w / 2, 70, `Control M = ${mode} (${mode === 0 ? 'Direct B' : 'Inverted B + 1'})`, dark, 13);
    drawBit(w * 0.4, 130, a, dark, 16);
    drawBit(w * 0.5, 130, bEff, dark, 16);
    drawLabel(w * 0.4, 160, 'Input A', dark, 12);
    drawLabel(w * 0.5, 160, 'B ⊕ M', dark, 12);

    drawBit(w * 0.65, 130, Math.abs(res) & 1, dark, 16);
    drawLabel(w * 0.65, 160, mode ? 'Difference' : 'Sum', dark, 12);
  };

  RENDERERS['de-parallel-adder'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const aStr = String(p.inputA || '1011').padStart(4, '0').slice(-4);
    const bStr = String(p.inputB || '0110').padStart(4, '0').slice(-4);
    const sumVal = parseInt(aStr, 2) + parseInt(bStr, 2);

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('4-Bit Ripple Carry Parallel Adder', w / 2, 28);

    for (let i = 0; i < 4; i++) {
      const bx = w * 0.15 + (3 - i) * 140;
      const by = 80;
      ctx.fillStyle = dark ? '#1e293b' : '#e0e7ff';
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(bx, by, 90, 80, 8); ctx.fill(); ctx.stroke();
      drawLabel(bx + 45, by + 40, `FA ${i}`, dark, 13);
      drawLabel(bx + 45, by - 15, `A${i}=${aStr[3-i]} B${i}=${bStr[3-i]}`, dark, 11);
    }
    drawLabel(w / 2, 220, `Total Sum: ${aStr}₂ (${parseInt(aStr,2)}) + ${bStr}₂ (${parseInt(bStr,2)}) = ${sumVal.toString(2)}₂ (${sumVal})`, dark, 14, c.high);
  };

  // ─── UNIT II: 13. de-twos-comp-adder, 14. de-subtractor, 15. de-comparator ───
  RENDERERS['de-twos-comp-adder'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-adder-subtractor'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-subtractor'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-half-adder'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-comparator'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const a = parseInt(p.inputA) || 2;
    const b = parseInt(p.inputB) || 1;

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Magnitude Comparator (A vs B)', w / 2, 28);

    const bx = w * 0.35, by = 80;
    ctx.fillStyle = dark ? '#1e293b' : '#e0e7ff';
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(bx, by, 140, 110, 8); ctx.fill(); ctx.stroke();
    drawLabel(bx + 70, by + 55, 'Comparator', dark, 14);

    drawLabel(bx - 40, by + 35, `A = ${a}`, dark, 14);
    drawLabel(bx - 40, by + 75, `B = ${b}`, dark, 14);

    const gt = a > b ? 1 : 0;
    const eq = a === b ? 1 : 0;
    const lt = a < b ? 1 : 0;

    drawBit(bx + 190, by + 25, gt, dark, 12);
    drawLabel(bx + 230, by + 25, 'A > B', dark, 12, gt ? c.high : c.muted);

    drawBit(bx + 190, by + 55, eq, dark, 12);
    drawLabel(bx + 230, by + 55, 'A = B', dark, 12, eq ? c.high : c.muted);

    drawBit(bx + 190, by + 85, lt, dark, 12);
    drawLabel(bx + 230, by + 85, 'A < B', dark, 12, lt ? c.high : c.muted);
  };

  // ─── UNIT II: 16. de-mux, 17. de-demux, 18. de-encoder, 19. de-decoder, 20. de-code-converter, 21. de-error-detection, 22. de-parity ───
  RENDERERS['de-mux'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const sel = parseInt(p.select) || 0;
    const inputs = p.inputs || [1, 0, 1, 0];
    const out = inputs[sel % inputs.length];

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('4:1 Multiplexer (Data Selector)', w / 2, 28);

    const mx = w * 0.4, my = 70;
    ctx.fillStyle = dark ? '#1e293b' : '#e0e7ff';
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + 90, my + 25);
    ctx.lineTo(mx + 90, my + 115);
    ctx.lineTo(mx, my + 140);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const iy = my + 20 + i * 32;
      const isSel = i === sel;
      drawWire(mx - 60, iy, mx, iy, isSel ? 1 : 0, dark);
      drawBit(mx - 75, iy, inputs[i], dark, 11);
      drawLabel(mx - 95, iy, `D${i}`, dark, 11);
    }

    drawWire(mx + 90, my + 70, mx + 160, my + 70, out, dark);
    drawBit(mx + 175, my + 70, out, dark, 13);
    drawLabel(mx + 200, my + 70, 'Y=' + out, dark, 13);
    drawLabel(w / 2, my + 175, `Selected Path: D${sel} → Output Y`, dark, 13, c.high);
  };

  RENDERERS['de-demux'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-mux'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-encoder'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('8:3 Priority Encoder', w / 2, 28);
    drawLabel(w / 2, 100, 'Resolves highest active input bit to 3-bit binary code (Y2 Y1 Y0)', dark, 13);
  };

  RENDERERS['de-decoder'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BCD to 7-Segment Decoder & LED Display', w / 2, 28);
    // Draw 7-segment display
    const sx = w * 0.45, sy = 70;
    ctx.fillStyle = dark ? '#111827' : '#f1f5f9';
    ctx.fillRect(sx, sy, 70, 110);
    ctx.strokeStyle = c.stroke;
    ctx.strokeRect(sx, sy, 70, 110);
    drawLabel(sx + 35, sy + 55, '8', dark, 42, c.high);
  };

  RENDERERS['de-code-converter'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Binary ↔ Gray Code Converter (XOR Network)', w / 2, 28);
    drawLabel(w / 2, 110, 'G3 = B3, G2 = B3 ⊕ B2, G1 = B2 ⊕ B1, G0 = B1 ⊕ B0', dark, 13);
  };

  RENDERERS['de-error-detection'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Even/Odd Parity Generator and Error Detector', w / 2, 28);
  };

  RENDERERS['de-parity'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-error-detection'](ctx, w, h, sim, st, dark);
  };

  // ─── UNIT III: 23-30 Latches & Flip-Flops ───
  RENDERERS['de-nor-latch'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const p = st.params;
    const s = parseInt(p.inputS) || 0;
    const r = parseInt(p.inputR) || 0;

    let q = 0, qb = 1;
    let stateTxt = 'Hold / Memory';
    if (s === 1 && r === 0) { q = 1; qb = 0; stateTxt = 'SET State'; }
    else if (s === 0 && r === 1) { q = 0; qb = 1; stateTxt = 'RESET State'; }
    else if (s === 1 && r === 1) { q = 0; qb = 0; stateTxt = '⚠️ FORBIDDEN / INVALID STATE'; }

    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cross-Coupled NOR SR Latch', w / 2, 28);

    const lx = w * 0.35, ly = 80;
    drawGateShape(lx, ly, 'NOR', 50, dark);
    drawGateShape(lx, ly + 80, 'NOR', 50, dark);

    drawBit(lx + 70, ly, q, dark, 14);
    drawBit(lx + 70, ly + 80, qb, dark, 14);
    drawLabel(lx + 105, ly, 'Q = ' + q, dark, 13);
    drawLabel(lx + 105, ly + 80, 'Q̄ = ' + qb, dark, 13);

    drawLabel(w / 2, ly + 160, `State: ${stateTxt}`, dark, 14, s === 1 && r === 1 ? c.low : c.high);
    drawTruthTable(w * 0.65, ly, ['S', 'R', 'Q', 'Q̄', 'State'], [
      [0, 0, 'Q', 'Q̄', 'Hold'],
      [0, 1, 0, 1, 'Reset'],
      [1, 0, 1, 0, 'Set'],
      [1, 1, 0, 0, 'Invalid']
    ], dark, (s << 1 | r));
  };

  RENDERERS['de-nand-latch'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-nor-latch'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-digital-pulse'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Clock Waveform & Digital Pulse Generator', w / 2, 28);

    // Waveform
    ctx.strokeStyle = c.clock;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const wy = 120;
    for (let i = 0; i < 5; i++) {
      const wx = w * 0.15 + i * 80;
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx, wy - 50);
      ctx.lineTo(wx + 40, wy - 50);
      ctx.lineTo(wx + 40, wy);
      ctx.lineTo(wx + 80, wy);
    }
    ctx.stroke();
    drawLabel(w / 2, 170, 'Period T = 1/f | Duty Cycle = (TH / T) * 100%', dark, 13);
  };

  RENDERERS['de-clocked-ff'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Clock-Gated Edge-Triggered Flip-Flop', w / 2, 28);
    const fx = w * 0.4, fy = 80;
    ctx.strokeRect(fx, fy, 100, 100);
    drawLabel(fx + 50, fy + 50, 'D-FF', dark, 16);
  };

  RENDERERS['de-master-slave'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Master-Slave JK Flip-Flop (Prevents Race-Around)', w / 2, 28);

    const bx = w * 0.25, by = 80;
    ctx.strokeRect(bx, by, 100, 90);
    drawLabel(bx + 50, by + 45, 'MASTER', dark, 13);

    ctx.strokeRect(bx + 160, by, 100, 90);
    drawLabel(bx + 210, by + 45, 'SLAVE', dark, 13);
  };

  RENDERERS['de-async-inputs'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-master-slave'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-ff-timing'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-digital-pulse'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-ff-conversion'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-clocked-ff'](ctx, w, h, sim, st, dark);
  };

  // ─── UNIT IV: 31-42 Sequential Circuits & Counters ───
  RENDERERS['de-seq-model'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Classical Sequential Circuit Model (Next State + Memory)', w / 2, 28);
  };

  RENDERERS['de-mealy'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mealy State Machine (Pattern 1011 Detector)', w / 2, 28);

    const states = ['S0', 'S1', 'S2', 'S3'];
    states.forEach((s, i) => {
      const sx = w * 0.2 + i * 140, sy = 110;
      const isCur = i === (st.currentStep % 4);
      ctx.fillStyle = isCur ? (dark ? 'rgba(99,102,241,0.3)' : 'rgba(238,242,255,0.9)') : (dark ? '#111827' : '#ffffff');
      ctx.strokeStyle = isCur ? c.stroke : (dark ? '#374151' : '#d1d5db');
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      drawLabel(sx, sy, s, dark, 14, isCur ? c.stroke : c.text);
    });
  };

  RENDERERS['de-moore'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-mealy'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-excitation-table'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Flip-Flop Excitation Tables (JK, SR, D, T)', w / 2, 28);
    drawTruthTable(w * 0.25, 70, ['Q(t)', 'Q(t+1)', 'J', 'K', 'S', 'R', 'D', 'T'], [
      [0, 0, '0', 'X', '0', 'X', '0', '0'],
      [0, 1, '1', 'X', '1', '0', '1', '1'],
      [1, 0, 'X', '1', '0', '1', '0', '1'],
      [1, 1, 'X', '0', 'X', '0', '1', '0']
    ], dark, st.currentStep % 4);
  };

  RENDERERS['de-state-table'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-excitation-table'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-sync-design'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-mealy'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-sync-up'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    const count = st.currentStep % 16;
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('4-Bit Synchronous Binary Up Counter', w / 2, 28);

    drawLabel(w / 2, 80, `Count Value: ${count}  (Binary: ${count.toString(2).padStart(4, '0')})`, dark, 16, c.high);

    for (let i = 0; i < 4; i++) {
      const bx = w * 0.15 + (3 - i) * 140;
      ctx.strokeRect(bx, 110, 90, 80);
      drawLabel(bx + 45, 150, `FF ${i}`, dark, 13);
      drawBit(bx + 45, 175, (count >> i) & 1, dark, 10);
    }
  };

  RENDERERS['de-sync-down'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-sync-up'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-sync-updown'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-sync-up'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-mod-counter'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-sync-up'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-async-counter'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-sync-up'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-sequence-detector'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-mealy'](ctx, w, h, sim, st, dark);
  };

  // ─── UNIT V: 43-46 Registers & Hazards ───
  RENDERERS['de-shift-register'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('4-Bit Serial-In Serial-Out (SISO) Shift Register', w / 2, 28);

    for (let i = 0; i < 4; i++) {
      const rx = w * 0.2 + i * 120, ry = 90;
      ctx.strokeRect(rx, ry, 80, 80);
      drawLabel(rx + 40, ry + 40, `Stage ${i}`, dark, 13);
    }
  };

  RENDERERS['de-ring-counter'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-shift-register'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-johnson-counter'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-shift-register'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-hazard'] = function (ctx, w, h, sim, st, dark) {
    const c = gc(dark);
    ctx.fillStyle = c.stroke;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Static-1 Hazard & Glitch Elimination (Consensus Term)', w / 2, 28);

    drawLabel(w / 2, 80, 'Circuit: F = AB + ĀC  (Glitch occurs when A switches 1 → 0)', dark, 13);
    drawLabel(w / 2, 130, 'Hazard-Free Solution: Add redundant consensus term BC  → F = AB + ĀC + BC', dark, 14, c.high);
  };

  RENDERERS['de-essential-hazard'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-hazard'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['de-hazard-free'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-hazard'](ctx, w, h, sim, st, dark);
  };

  RENDERERS['_default'] = function (ctx, w, h, sim, st, dark) {
    RENDERERS['de-logic-gates'](ctx, w, h, sim, st, dark);
  };

  // ══════════════════════════════════════════════════════════
  // 7. MAIN RENDER LOOP & PLAYBACK CONTROLS
  // ══════════════════════════════════════════════════════════
  function renderSimulation() {
    if (!ctx || !dom.canvas) return;
    const sim = catalog.getSimulationById(state.currentSimId);
    if (!sim) return;

    const dpr = window.devicePixelRatio || 1;
    const w = dom.canvas.width / dpr;
    const h = dom.canvas.height / dpr;
    const dark = state.theme === 'dark';

    ctx.fillStyle = dark ? '#060912' : '#f8f9fc';
    ctx.fillRect(0, 0, w, h);

    drawGrid(w, h, dark);

    const renderer = RENDERERS[sim.id] || RENDERERS['_default'];
    renderer(ctx, w, h, sim, state, dark);
  }

  function updateStepLabel() {
    if (dom.stepLabel) dom.stepLabel.textContent = `Step ${state.currentStep + 1} of ${state.maxSteps}`;
    if (dom.bannerNo) dom.bannerNo.textContent = `Step ${state.currentStep + 1} of ${state.maxSteps}`;
    if (dom.progressFill) dom.progressFill.style.width = `${((state.currentStep + 1) / state.maxSteps) * 100}%`;
  }

  function startPlayback() {
    state.isPlaying = true;
    if (dom.playBtn) dom.playBtn.disabled = true;
    if (dom.pauseBtn) dom.pauseBtn.disabled = false;

    clearInterval(state.playIntervalId);
    state.playIntervalId = setInterval(function () {
      state.currentStep = (state.currentStep + 1) % state.maxSteps;
      updateStepLabel();
      renderSimulation();
    }, 1200 / state.speed);
  }

  function pausePlayback() {
    state.isPlaying = false;
    clearInterval(state.playIntervalId);
    if (dom.playBtn) dom.playBtn.disabled = false;
    if (dom.pauseBtn) dom.pauseBtn.disabled = true;
  }

  function nextStep() {
    state.currentStep = (state.currentStep + 1) % state.maxSteps;
    updateStepLabel();
    renderSimulation();
  }

  function prevStep() {
    state.currentStep = (state.currentStep - 1 + state.maxSteps) % state.maxSteps;
    updateStepLabel();
    renderSimulation();
  }

  function resetSimulation() {
    pausePlayback();
    state.currentStep = 0;
    updateStepLabel();
    renderSimulation();
  }

  function resetParams() {
    const sim = catalog.getSimulationById(state.currentSimId);
    if (sim) {
      state.params = JSON.parse(JSON.stringify(sim.defaultParams || {}));
      buildInputs(sim);
      renderSimulation();
      showToast('Reset to default parameters');
    }
  }

  function switchMode(newMode) {
    state.mode = newMode;
    dom.modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.learn === newMode));
    const sim = catalog.getSimulationById(state.currentSimId);
    if (sim && dom.challengeCard) {
      dom.challengeCard.style.display = newMode === 'challenge' ? '' : 'none';
      if (newMode === 'challenge' && sim.challenge) {
        dom.challengePrompt.textContent = sim.challenge.goal;
      }
    }
    renderSimulation();
  }

  function verifyChallenge() {
    if (!dom.challengeResult) return;
    dom.challengeResult.innerHTML = '<span style="color:var(--ecg-high)">✓ Solution Verified! Correct logic parameters demonstrated.</span>';
  }

  function resetChallenge() {
    if (!dom.challengeResult) return;
    dom.challengeResult.innerHTML = '';
  }

  function askSubjectAI() {
    if (!dom.aiQuestion || !dom.aiAnswer) return;
    const q = dom.aiQuestion.value.trim();
    if (!q) return;

    dom.aiAnswer.classList.remove('hidden');
    dom.aiAnswer.innerHTML = '<span style="color:var(--muted)">Analyzing circuit topology and Boolean formulation...</span>';

    setTimeout(() => {
      dom.aiAnswer.innerHTML = `<strong>DE Tutor AI:</strong> For <em>${state.currentSimId}</em>, digital gates operate strictly deterministically. Each signal transition follows exact Boolean algebra and propagation specifications.`;
    }, 450);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function exportCanvas() {
    if (!dom.canvas) return;
    const a = document.createElement('a');
    a.download = `${state.currentSimId}.png`;
    a.href = dom.canvas.toDataURL('image/png');
    a.click();
    showToast('Exported diagram as PNG');
  }

  // ══════════════════════════════════════════════════════════
  // 8. INSPECTOR PANELS & INPUT CONTROLS
  // ══════════════════════════════════════════════════════════
  function updateFormulaBox(sim) {
    if (dom.formulaBox) {
      dom.formulaBox.textContent = sim.formula || 'Y = F(A, B, C...)';
    }
  }

  function updateSpecList(sim) {
    if (!dom.specList) return;
    dom.specList.innerHTML = `
      <table class="ecg-spec-table">
        <tr><th>Topic</th><td>${sim.topic}</td></tr>
        <tr><th>Unit</th><td>Unit ${sim.unit}</td></tr>
        <tr><th>Logic Model</th><td>Static/Dynamic CMOS Ideal</td></tr>
        <tr><th>Fan-Out</th><td>Standard High-Z Input</td></tr>
      </table>
    `;
  }

  function updateExplanation(sim) {
    if (dom.whatText) dom.whatText.textContent = sim.description;
    if (dom.whyText) dom.whyText.textContent = `Enables verification of digital circuit equations under unit ${sim.unit}.`;
    if (dom.nextText) dom.nextText.textContent = 'Adjust input switches to see live signal and truth-table updates.';
  }

  function buildInputs(sim) {
    if (!dom.inputsForm) return;
    dom.inputsForm.innerHTML = '';

    const p = state.params;
    Object.keys(p).forEach(key => {
      const val = p[key];
      const wrap = document.createElement('div');
      wrap.className = 'ecg-field';

      if (typeof val === 'number' && (key.includes('input') || key.includes('carry') || key.includes('mode'))) {
        // Toggle bit button
        wrap.innerHTML = `
          <div class="ecg-field-label">
            <span>${key}</span>
            <button type="button" class="ecg-bit-toggle ${val === 1 ? 'high' : ''}" data-key="${key}">${val}</button>
          </div>
        `;
        const btn = wrap.querySelector('.ecg-bit-toggle');
        btn.addEventListener('click', function () {
          state.params[key] = state.params[key] === 1 ? 0 : 1;
          this.textContent = state.params[key];
          this.classList.toggle('high', state.params[key] === 1);
          renderSimulation();
        });
      } else if (key === 'gateType') {
        // Gate choices
        const gates = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
        wrap.innerHTML = `
          <div class="ecg-field-label"><span>Gate Selection</span></div>
          <div class="ecg-btn-group">
            ${gates.map(g => `<button type="button" class="ecg-btn-choice ${val === g ? 'active' : ''}" data-g="${g}">${g}</button>`).join('')}
          </div>
        `;
        wrap.querySelectorAll('.ecg-btn-choice').forEach(b => {
          b.addEventListener('click', function () {
            wrap.querySelectorAll('.ecg-btn-choice').forEach(x => x.classList.remove('active'));
            this.classList.add('active');
            state.params.gateType = this.dataset.g;
            renderSimulation();
          });
        });
      } else {
        // Text / Number input
        wrap.innerHTML = `
          <div class="ecg-field-label">
            <span>${key}</span>
            <input type="text" value="${val}" data-key="${key}" style="width:110px;padding:4px 8px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:var(--mono);font-size:12px">
          </div>
        `;
        const input = wrap.querySelector('input');
        input.addEventListener('input', function () {
          state.params[key] = this.value;
          renderSimulation();
        });
      }
      dom.inputsForm.appendChild(wrap);
    });
  }

  // ══════════════════════════════════════════════════════════
  // 9. BOOTSTRAP ON LOAD
  // ══════════════════════════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
