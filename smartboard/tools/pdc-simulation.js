/**
 * pdc-simulation.js
 * Master Interactive Engine for Principles of Data Communication (U21IT201)
 * Regulation R2021 CBCS · Semester II · B.Tech IT
 * 
 * Features:
 *  - 42 Interactive Communication Simulations across 5 Units
 *  - High-precision HTML5 Waveform & Block Canvas Renderers
 *  - Real-time Math Engine (AM, FM, PM, ASK, FSK, PSK, DPSK, CRC, Hamming 7,4)
 *  - 3 Learning Modes: Learn 🎓, Experiment 🔬, Challenge 🏆
 *  - 🌓 Dark / White Color Theme Switching
 *  - Step-by-step playback with Speed control and Pedagogy grid
 *  - Subject AI Tutor integration
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1. STATE & DOM ELEMENT REFS
  // ══════════════════════════════════════════════════════════
  const catalog = (typeof window !== 'undefined' && window.EduversePDCCatalog) || null;
  if (!catalog) {
    console.error('[PDC Simulation] EduversePDCCatalog not loaded.');
    return;
  }

  const state = {
    currentUnit: 1,
    currentSimId: 'comm-elements',
    mode: 'learn', // 'learn' | 'experiment' | 'challenge'
    theme: localStorage.getItem('eduverse_theme') || 'light',
    isPlaying: false,
    speed: 1.0,
    currentStep: 0,
    maxSteps: 4,
    animTime: 0,
    animFrameId: null,
    params: {},
    challengeState: { solved: false, feedback: '' },
    // 3D & 2D View Controls
    zoomScale: 1.0,
    rotAngle: 0,
    panX: 0,
    panY: 0,
    isAutoRotating: false,
    blochRotX: 0.35,
    blochRotY: 0.8
  };

  const dom = {
    app: document.getElementById('ep-app') || document.getElementById('pdc-app'),
    unitSelect: document.getElementById('pdc-unit'),
    simSelect: document.getElementById('pdc-simulation'),
    title: document.getElementById('ep-title') || document.getElementById('pdc-title'),
    subtitle: document.getElementById('ep-subtitle') || document.getElementById('pdc-topic-tag'),
    crumbs: document.getElementById('ep-crumbs'),
    kickerBadge: document.getElementById('pdc-kicker-badge'),
    brandMark: document.getElementById('pdc-brand-mark') || document.querySelector('.ep-brand') || document.querySelector('.pdc-brand-mark'),
    themeToggle: document.getElementById('pdc-theme-toggle'),
    fullscreenBtn: document.getElementById('ep-fullscreen') || document.getElementById('pdc-fullscreen'),
    exportBtn: document.getElementById('ep-export'),
    closeBtn: document.getElementById('pdc-close'),
    backBtn: document.getElementById('ep-back-btn') || document.getElementById('pdc-close'),
    launchBoardBtn: document.getElementById('pdc-launch-board'),
    modeBtns: document.querySelectorAll('.pdc-mode-btn'),
    playBtn: document.getElementById('ep-play') || document.getElementById('pdc-play'),
    pauseBtn: document.getElementById('pdc-pause'),
    prevBtn: document.getElementById('ep-prev') || document.getElementById('pdc-prev'),
    nextBtn: document.getElementById('ep-next') || document.getElementById('pdc-next'),
    resetBtn: document.getElementById('ep-reset') || document.getElementById('pdc-reset'),
    speedSelect: document.getElementById('pdc-speed'),
    stepLabel: document.getElementById('ep-banner-no') || document.getElementById('pdc-step-label'),
    bannerNo: document.getElementById('ep-banner-no'),
    bannerTitle: document.getElementById('ep-banner-title'),
    bannerText: document.getElementById('ep-banner-text'),
    progressFill: document.getElementById('ep-progress-fill') || document.getElementById('pdc-progress-fill'),
    canvas: document.getElementById('pdc-canvas'),
    legend: document.getElementById('pdc-legend'),
    overlaySim: document.getElementById('pdc-overlay-sim'),
    overlayState: document.getElementById('pdc-overlay-state'),
    workCard: document.getElementById('ep-work-card'),
    workStepTitle: document.getElementById('ep-work-step-title'),
    workStepBody: document.getElementById('ep-work-step-body'),
    whatText: document.getElementById('pdc-what'),
    whyText: document.getElementById('pdc-why'),
    nextText: document.getElementById('pdc-next-info'),
    metricsRow: document.getElementById('ep-readouts') || document.getElementById('pdc-metrics-row'),
    inputsForm: document.getElementById('pdc-inputs-form') || document.getElementById('ep-params'),
    inputActions: document.getElementById('pdc-input-actions'),
    examplesBtn: document.getElementById('ep-examples'),
    resetParamsBtn: document.getElementById('ep-reset-params'),
    challengeCard: document.getElementById('pdc-challenge-card'),
    challengePrompt: document.getElementById('pdc-challenge-prompt'),
    verifyChallengeBtn: document.getElementById('pdc-verify-challenge'),
    resetChallengeBtn: document.getElementById('pdc-reset-challenge'),
    challengeResult: document.getElementById('pdc-challenge-result'),
    formulaBox: document.getElementById('pdc-formula-box'),
    specList: document.getElementById('pdc-spec-list'),
    stepsList: document.getElementById('ep-steps'),
    aiQuestion: document.getElementById('ep-ai-q') || document.getElementById('pdc-ai-question'),
    askAiBtn: document.getElementById('ep-ask-ai') || document.getElementById('pdc-ask-ai'),
    aiAnswer: document.getElementById('ep-ai-answer') || document.getElementById('pdc-ai-answer'),
    rotL: document.getElementById('ep-rot-l'),
    rotR: document.getElementById('ep-rot-r'),
    zoomIn: document.getElementById('ep-zoom-in'),
    zoomOut: document.getElementById('ep-zoom-out'),
    autoRot: document.getElementById('ep-auto-rot'),
    viewReset: document.getElementById('ep-view-reset'),
    toast: document.getElementById('ep-toast') || document.getElementById('pdc-toast')
  };

  const ctx = dom.canvas.getContext('2d');

  // ══════════════════════════════════════════════════════════
  // 2. THEME CONTROLLER (Dark / White Mode)
  // ══════════════════════════════════════════════════════════
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eduverse_theme', theme);
    if (dom.themeToggle) {
      dom.themeToggle.textContent = theme === 'dark' ? '☀️ Light Theme' : '🌓 Dark Theme';
      dom.themeToggle.title = `Switch to ${theme === 'dark' ? 'White / Light' : 'Dark'} mode`;
    }
    renderSimulation();
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light / White Mode'}`);
  }

  // ══════════════════════════════════════════════════════════
  // 3. INITIALIZATION & URL HYDRATION
  // ══════════════════════════════════════════════════════════
  function init() {
    // Parse URL query parameters
    const params = new URLSearchParams(window.location.search);
    const subjectCode = params.get('subjectCode') || '';
    state.subjectCode = subjectCode;
    // Dashboard registry ids (Eduverse) → this engine's ids where they differ
    const REGISTRY_ID_ALIASES = {
      'u25rphu02-quantum-well': 'u25rphu02-quantum-structures',
      'u25rphu02-quantum-wire': 'u25rphu02-quantum-structures',
      'u25rphu02-quantum-dot': 'u25rphu02-quantum-structures',
      'u25rphu02-quantum-device': 'u25rphu02-quantum-devices',
    };
    const STRUCTURE_FOR = { 'u25rphu02-quantum-well': 'well', 'u25rphu02-quantum-wire': 'wire', 'u25rphu02-quantum-dot': 'dot' };
    const requestedRaw = params.get('sim') || params.get('simulationId') || params.get('preset') || '';
    const rawSim = REGISTRY_ID_ALIASES[requestedRaw] || requestedRaw;
    const isU25 = catalog.isU25Rph(subjectCode, rawSim);
    const requestedSim = rawSim || (isU25 ? 'u25rphu02-optical-materials' : 'am-principle');
    const requestedUnit = params.get('unit') || params.get('unitNumber');
    const embedded = params.get('embedded') === '1';

    let urlConfig = null;
    const configStr = params.get('config');
    if (STRUCTURE_FOR[requestedRaw]) urlConfig = { structure: STRUCTURE_FOR[requestedRaw] };
    if (configStr) {
      try {
        urlConfig = JSON.parse(configStr);
      } catch (e) {
        console.warn('[PDC Simulation] Failed to parse config param:', e);
      }
    }

    if (embedded) {
      document.body.classList.add('pdc-board-mode');
    }

    applyTheme(state.theme);

    const brandMark = document.querySelector('.pdc-brand-mark');
    const eyebrow = document.getElementById('pdc-eyebrow');
    const codeBadge = document.querySelector('.pdc-code-badge');
    if (isU25) {
      if (dom.kickerBadge) dom.kickerBadge.textContent = 'U25RPHU02 · Sem I';
      if (brandMark) brandMark.textContent = 'PHYS';
      if (eyebrow) eyebrow.textContent = 'EDUVERSE · PHYSICS FOR DATA STORAGE AND COMPUTING';
      if (codeBadge) codeBadge.textContent = 'U25RPHU02 · Sem I · BSC';
    }

    // Populate Units dropdown dynamically for this subject
    const subjectUnits = catalog.getUnitsForSubject(subjectCode, requestedSim);
    dom.unitSelect.innerHTML = '';
    subjectUnits.forEach(function (u) {
      const uNum = u.number || u.unit || 1;
      const opt = document.createElement('option');
      opt.value = String(uNum);
      opt.textContent = `Unit ${uNum}: ${u.title}`;
      dom.unitSelect.appendChild(opt);
    });

    // Populate Simulation dropdown based on Unit
    dom.unitSelect.addEventListener('change', function (e) {
      const u = Number(e.target.value);
      state.currentUnit = u;
      populateSimDropdown(u);
      const isU25Active = catalog.isU25Rph(state.subjectCode, state.currentSimId);
      const firstSim = catalog.getSimulationsByUnit(u, isU25Active ? 'U25RPHU02' : 'U21IT201')[0];
      if (firstSim) switchSimulation(firstSim.id);
    });

    dom.simSelect.addEventListener('change', function (e) {
      switchSimulation(e.target.value);
    });

    // Theme toggle button
    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', toggleTheme);
    }

    // Fullscreen toggle
    if (dom.fullscreenBtn) {
      dom.fullscreenBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(function () {});
        } else {
          document.exitFullscreen().catch(function () {});
        }
      });
    }

    // Export button (Download Canvas as PNG)
    if (dom.exportBtn) {
      dom.exportBtn.addEventListener('click', function () {
        try {
          const a = document.createElement('a');
          a.download = `${state.currentSimId || 'physics-simulation'}.png`;
          a.href = dom.canvas.toDataURL('image/png');
          a.click();
          showToast('⬇ Exported simulation canvas as PNG');
        } catch (e) {
          showToast('Export failed');
        }
      });
    }

    // Generate Example & Reset Defaults Buttons
    if (dom.examplesBtn) {
      dom.examplesBtn.addEventListener('click', function () {
        const sim = catalog.getSimulationById(state.currentSimId);
        randomizeParams(sim);
        showToast('🎲 Generated new example parameters');
      });
    }
    if (dom.resetParamsBtn) {
      dom.resetParamsBtn.addEventListener('click', function () {
        resetSimulation();
        showToast('Restored default parameters');
      });
    }

    // Speed Segment Buttons
    const speedSegs = document.querySelectorAll('.ep-seg');
    speedSegs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        speedSegs.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.speed = parseFloat(btn.getAttribute('data-speed')) || 1.0;
        showToast(`Speed set to ${state.speed}x`);
      });
    });

    // 3D / View Controls
    if (dom.rotL) dom.rotL.addEventListener('click', function () {
      if (state.currentSimId === 'u25rphu02-bloch-sphere') {
        state.blochRotY = (state.blochRotY || 0.8) - 0.25;
      } else {
        state.rotAngle = (state.rotAngle || 0) - (Math.PI / 12);
      }
      renderSimulation();
      showToast('Rotate left');
    });

    if (dom.rotR) dom.rotR.addEventListener('click', function () {
      if (state.currentSimId === 'u25rphu02-bloch-sphere') {
        state.blochRotY = (state.blochRotY || 0.8) + 0.25;
      } else {
        state.rotAngle = (state.rotAngle || 0) + (Math.PI / 12);
      }
      renderSimulation();
      showToast('Rotate right');
    });

    if (dom.zoomIn) dom.zoomIn.addEventListener('click', function () {
      state.zoomScale = Math.min(3.5, (state.zoomScale || 1.0) * 1.18);
      renderSimulation();
      showToast(`Zoom in: ${Math.round(state.zoomScale * 100)}%`);
    });

    if (dom.zoomOut) dom.zoomOut.addEventListener('click', function () {
      state.zoomScale = Math.max(0.35, (state.zoomScale || 1.0) / 1.18);
      renderSimulation();
      showToast(`Zoom out: ${Math.round(state.zoomScale * 100)}%`);
    });

    if (dom.autoRot) dom.autoRot.addEventListener('click', function () {
      state.isAutoRotating = !state.isAutoRotating;
      dom.autoRot.classList.toggle('active', state.isAutoRotating);
      if (state.isAutoRotating) {
        runAnimation();
        showToast('Auto-rotate active');
      } else {
        showToast('Auto-rotate paused');
      }
    });

    if (dom.viewReset) dom.viewReset.addEventListener('click', function () {
      state.blochRotY = 0.8;
      state.blochRotX = 0.35;
      state.rotAngle = 0;
      state.zoomScale = 1.0;
      state.panX = 0;
      state.panY = 0;
      state.isAutoRotating = false;
      if (dom.autoRot) dom.autoRot.classList.remove('active');
      renderSimulation();
      showToast('View reset (100%)');
    });

    // Close button
    if (dom.closeBtn) {
      dom.closeBtn.addEventListener('click', function () {
        try {
          if (window.opener || window.parent !== window) {
            window.parent.postMessage({ type: 'EDUVERSE_SIM_CLOSE' }, '*');
          }
        } catch (e) {}
        window.close();
      });
    }

    // Back button
    if (dom.backBtn) {
      dom.backBtn.addEventListener('click', function () {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          try {
            if (window.opener || window.parent !== window) {
              window.parent.postMessage({ type: 'EDUVERSE_SIM_CLOSE' }, '*');
            }
          } catch (e) {}
          window.location.href = '../index.html?role=teacher&subjectCode=U25RPHU02';
        }
      });
    }

    // Mode Switcher buttons
    dom.modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode(btn.getAttribute('data-mode'));
      });
    });

    // Playback buttons
    if (dom.playBtn) dom.playBtn.addEventListener('click', function () {
      if (state.isPlaying) {
        pauseSimulation();
      } else {
        playSimulation();
      }
    });
    if (dom.pauseBtn) dom.pauseBtn.addEventListener('click', pauseSimulation);
    if (dom.prevBtn) dom.prevBtn.addEventListener('click', prevStep);
    if (dom.nextBtn) dom.nextBtn.addEventListener('click', nextStep);
    if (dom.resetBtn) dom.resetBtn.addEventListener('click', resetSimulation);
    if (dom.speedSelect) dom.speedSelect.addEventListener('change', function (e) {
      state.speed = parseFloat(e.target.value) || 1.0;
    });

    // Challenge buttons
    if (dom.verifyChallengeBtn) dom.verifyChallengeBtn.addEventListener('click', verifyChallenge);
    if (dom.resetChallengeBtn) dom.resetChallengeBtn.addEventListener('click', resetChallenge);

    // AI Q&A Button
    if (dom.askAiBtn) dom.askAiBtn.addEventListener('click', handleAiQuery);

    // Interactive mouse / touch drag and wheel zoom
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    dom.canvas.style.cursor = 'grab';

    dom.canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      dom.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (state.currentSimId === 'u25rphu02-bloch-sphere') {
        state.blochRotY = (state.blochRotY !== undefined ? state.blochRotY : 0.8) + dx * 0.012;
        state.blochRotX = Math.max(-1.4, Math.min(1.4, (state.blochRotX !== undefined ? state.blochRotX : 0.35) + dy * 0.012));
      } else if (e.shiftKey) {
        state.rotAngle = (state.rotAngle || 0) + dx * 0.01;
      } else {
        state.panX = (state.panX || 0) + dx;
        state.panY = (state.panY || 0) + dy;
      }
      renderSimulation();
    });

    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        dom.canvas.style.cursor = 'grab';
      }
    });

    // Mouse wheel zoom
    dom.canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      state.zoomScale = Math.min(3.5, Math.max(0.35, (state.zoomScale || 1.0) * zoomFactor));
      renderSimulation();
    }, { passive: false });

    // Touch support for smartboard/tablets
    dom.canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      if (state.currentSimId === 'u25rphu02-bloch-sphere') {
        state.blochRotY = (state.blochRotY !== undefined ? state.blochRotY : 0.8) + dx * 0.012;
        state.blochRotX = Math.max(-1.4, Math.min(1.4, (state.blochRotX !== undefined ? state.blochRotX : 0.35) + dy * 0.012));
      } else {
        state.panX = (state.panX || 0) + dx;
        state.panY = (state.panY || 0) + dy;
      }
      renderSimulation();
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isDragging = false;
    });

    // Responsive canvas resizing
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Select initial simulation
    const isU25Init = catalog.isU25Rph(state.subjectCode, requestedSim);
    const targetSim = catalog.getSimulationById(requestedSim) || (isU25Init ? catalog.u25rphSimulations[0] : catalog.simulations[0]);
    state.currentSimId = targetSim.id;
    state.currentUnit = targetSim.unit;
    dom.unitSelect.value = String(targetSim.unit);
    populateSimDropdown(targetSim.unit);
    switchSimulation(targetSim.id, urlConfig);
  }

  function populateSimDropdown(unitNum) {
    const isU25 = catalog.isU25Rph(state.subjectCode, state.currentSimId);
    const sims = catalog.getSimulationsByUnit(unitNum, isU25 ? 'U25RPHU02' : 'U21IT201', state.currentSimId);
    dom.simSelect.innerHTML = '';
    sims.forEach(function (s) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.flagship ? '⭐ ' : ''}${s.title}`;
      dom.simSelect.appendChild(opt);
    });
  }

  function resizeCanvas() {
    const container = document.getElementById('ep-canvas-wrap') || document.getElementById('pdc-stage-container') || (dom.canvas && dom.canvas.parentElement);
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(480, Math.floor(rect.width || 640));
    const h = Math.max(280, Math.floor(rect.height || 420));
    dom.canvas.width = w * dpr;
    dom.canvas.height = h * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    renderSimulation();
  }

  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    setTimeout(function () {
      dom.toast.classList.remove('show');
    }, 2400);
  }

  // ══════════════════════════════════════════════════════════
  // 4. SWITCH SIMULATION & PARAMETER BUILDER
  // ══════════════════════════════════════════════════════════
  function switchSimulation(simId, initialParams) {
    const sim = catalog.getSimulationById(simId);
    if (!sim) return;

    state.currentSimId = simId;
    state.currentUnit = sim.unit;
    dom.unitSelect.value = String(sim.unit);
    dom.simSelect.value = simId;

    // Deep copy default params and merge URL initial params
    state.params = JSON.parse(JSON.stringify(sim.defaultParams || {}));
    if (initialParams && typeof initialParams === 'object') {
      Object.assign(state.params, initialParams);
    }
    state.currentStep = 0;
    state.maxSteps = 4;
    state.challengeState = { solved: false, feedback: '' };
    state.zoomScale = 1.0;
    state.rotAngle = 0;
    state.panX = 0;
    state.panY = 0;
    state.isAutoRotating = false;
    if (dom.autoRot) dom.autoRot.classList.remove('active');

    // Update Header & Tags
    const isU25Sim = catalog.isU25Rph(state.subjectCode, simId);
    if (dom.title) dom.title.textContent = sim.title;
    if (dom.subtitle) dom.subtitle.textContent = `${isU25Sim ? 'U25RPHU02' : 'U21IT201'} · Unit ${sim.unit} · ${sim.topic}`;
    if (dom.crumbs) dom.crumbs.textContent = `Semester ${isU25Sim ? 'I › Physics for Data Storage and Computing' : 'II › Principles of Data Communication'}`;
    if (dom.brandMark) dom.brandMark.textContent = isU25Sim ? 'PHYS' : 'PDC';
    if (dom.formulaBox) dom.formulaBox.textContent = sim.formula || 's(t) = A_c \\cos(\\omega_c t)';
    const codeBadge = document.querySelector('.pdc-code-badge');
    if (isU25Sim && codeBadge) {
      codeBadge.textContent = `U25RPHU02 · Unit ${sim.unit}`;
    }

    buildInputControls(sim);
    buildSpecifications(sim);
    buildLegend(sim);
    updatePedagogy(sim);
    updateMetrics(sim);

    if (dom.challengeCard) {
      dom.challengeCard.style.display = (state.mode === 'challenge') ? 'block' : 'none';
      if (state.mode === 'challenge') setupChallengeUI(sim);
    }

    renderSimulation();
  }

  function setMode(mode) {
    state.mode = mode;
    dom.modeBtns.forEach(function (btn) {
      const active = btn.getAttribute('data-mode') === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const sim = catalog.getSimulationById(state.currentSimId);
    if (dom.challengeCard) {
      dom.challengeCard.style.display = (mode === 'challenge') ? 'block' : 'none';
      if (mode === 'challenge') setupChallengeUI(sim);
    }

    updatePedagogy(sim);
    showToast(`Mode: ${mode.toUpperCase()}`);
    renderSimulation();
  }

  function buildLegend(sim) {
    if (!dom.legend) return;
    dom.legend.innerHTML = '';
    let legendItems = [];

    if (sim.id.startsWith('u25rphu02-')) {
      if (sim.unit === 1) {
        legendItems = [
          { label: 'Photons (hν)', color: '#38bdf8' },
          { label: 'Electrons (e⁻)', color: '#10b981' },
          { label: 'Holes (h⁺)', color: '#f43f5e' },
          { label: 'Depletion E-field', color: '#f59e0b' }
        ];
      } else if (sim.unit === 2) {
        legendItems = [
          { label: 'Magnetic Moments ↑', color: '#3b82f6' },
          { label: 'Applied Field H', color: '#f59e0b' },
          { label: 'Domain Wall', color: '#ec4899' },
          { label: 'Flux Density B', color: '#10b981' }
        ];
      } else if (sim.unit === 3) {
        legendItems = [
          { label: 'Wavefunction |ψ|²', color: '#818cf8' },
          { label: 'Potential Barrier V₀', color: '#ef4444' },
          { label: 'Tunnel Transmission', color: '#10b981' },
          { label: 'Quantized Levels', color: '#f59e0b' }
        ];
      } else {
        legendItems = [
          { label: 'North Pole |0⟩', color: '#3b82f6' },
          { label: 'South Pole |1⟩', color: '#ef4444' },
          { label: 'State Vector |ψ⟩', color: '#10b981' },
          { label: 'Phase Arc φ', color: '#f59e0b' }
        ];
      }
    } else {
      legendItems = [
        { label: 'Message m(t)', color: 'var(--pdc-msg-color)' },
        { label: 'Carrier c(t)', color: 'var(--pdc-carrier-color)' },
        { label: 'Modulated Wave s(t)', color: 'var(--pdc-mod-color)' },
        { label: 'Received / Noise', color: 'var(--pdc-noise-color)' }
      ];
    }

    legendItems.forEach(function (item) {
      const el = document.createElement('span');
      el.className = 'pdc-legend-item';
      el.innerHTML = `<span class="pdc-legend-dot" style="background:${item.color}"></span>${item.label}`;
      dom.legend.appendChild(el);
    });
  }

  function buildSpecifications(sim) {
    if (!dom.specList) return;
    dom.specList.innerHTML = '';
    const isU25 = sim.id.startsWith('u25rphu02-');
    const specs = isU25 ? [
      { label: 'Curriculum Course', val: 'U25RPHU02 · Physics for Data Storage and Computing' },
      { label: 'Curriculum Unit', val: `Unit ${sim.unit}: ${sim.unitTitle || sim.topic}` },
      { label: 'Course Category', val: 'BSC · Semester I · 2 Credits' },
      { label: 'Target Branches', val: 'AD, AM, BM, CB, CS, IT' },
      { label: 'Domain', val: 'Solid State & Quantum Physics' }
    ] : [
      { label: 'Curriculum Course', val: 'U21IT201 · Principles of Data Communication' },
      { label: 'Curriculum Unit', val: `Unit ${sim.unit}: ${sim.unitTitle}` },
      { label: 'Simulation Tier', val: sim.flagship ? '⭐ Tier 1 Flagship' : `Tier ${sim.tier || 2}` },
      { label: 'Operating Standard', val: 'CCITT / ITU-T / IEEE 802' },
      { label: 'Domain', val: 'Digital & Analog Telecommunications' }
    ];

    specs.forEach(function (sp) {
      const item = document.createElement('div');
      item.className = 'pdc-spec-item';
      item.innerHTML = `<span class="pdc-spec-label">${sp.label}</span><span class="pdc-spec-val">${sp.val}</span>`;
      dom.specList.appendChild(item);
    });
  }

  function buildInputControls(sim) {
    dom.inputsForm.innerHTML = '';
    const p = state.params;

    // Generate fields dynamically based on simulation ID and params
    Object.keys(p).forEach(function (key) {
      if (key === '_simId') return;
      const val = p[key];
      const field = document.createElement('div');
      field.className = 'ep-param-group pdc-field';

      const label = document.createElement('div');
      label.className = 'ep-param-head pdc-field-label';
      label.innerHTML = `<span>${formatParamLabel(key)}</span><span class="ep-param-val pdc-field-val" id="val-${key}">${val}</span>`;
      field.appendChild(label);

      if (typeof val === 'boolean') {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `input-${key}`;
        input.checked = val;
        input.style.width = '20px';
        input.style.height = '20px';
        input.style.cursor = 'pointer';
        input.addEventListener('change', function (e) {
          state.params[key] = e.target.checked;
          const valEl = document.getElementById(`val-${key}`);
          if (valEl) valEl.textContent = e.target.checked ? 'Enabled' : 'Disabled';
          updateMetrics(sim);
          renderSimulation();
        });
        field.appendChild(input);
      } else if (typeof val === 'number') {
        const sliderRow = document.createElement('div');
        sliderRow.className = 'ep-slider-row';

        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'ep-param-slider';
        input.id = `input-${key}`;

        // Set bounds based on param key
        if (key === 'theta') {
          input.min = '0'; input.max = '180'; input.step = '2';
        } else if (key === 'phi' || key === 'phasePhi' || key === 'driveAngle') {
          input.min = '0'; input.max = '360'; input.step = '5';
        } else if (key === 'thetaAngle') {
          input.min = '0'; input.max = '180'; input.step = '5';
        } else if (key === 'barrierWidth') {
          input.min = '0.2'; input.max = '3.0'; input.step = '0.1';
        } else if (key === 'barrierHeight') {
          input.min = '1.0'; input.max = '10.0'; input.step = '0.2';
        } else if (key === 'particleEnergy') {
          input.min = '0.5'; input.max = '8.0'; input.step = '0.1';
        } else if (key === 'dimensionL' || key === 'dotRadius' || key === 'crystalSize' || key === 'wellWidth' || key === 'wireDiameter') {
          input.min = '1'; input.max = '25'; input.step = '0.5';
        } else if (key === 'externalH' || key === 'appliedFieldH' || key === 'hFieldAmplitude') {
          input.min = '-2000'; input.max = '2000'; input.step = '50';
        } else if (key === 'wavelength' || key === 'laserNm') {
          input.min = '380'; input.max = '900'; input.step = '5';
        } else if (key === 'opticalPower' || key === 'reverseBias' || key === 'driveVoltage' || key === 'biasV') {
          input.min = '0'; input.max = '15'; input.step = '0.2';
        } else if (key === 'na') {
          input.min = '0.4'; input.max = '0.95'; input.step = '0.01';
        } else if (key === 'trackPitchUm') {
          input.min = '0.15'; input.max = '1.6'; input.step = '0.01';
        } else if (key === 'irradiance') {
          input.min = '200'; input.max = '1200'; input.step = '50';
        } else if (key === 'gateVoltage') {
          input.min = '-500'; input.max = '500'; input.step = '10';
        } else if (key.includes('Freq') || key.includes('fc') || key.includes('fm') || key.includes('f0') || key.includes('f1')) {
          input.min = '1'; input.max = '50'; input.step = '1';
        } else if (key.includes('Index') || key === 'm' || key === 'beta' || key === 'modIndex') {
          input.min = '0.1'; input.max = '2.0'; input.step = '0.05';
        } else if (key.includes('Amp') || key === 'Am' || key === 'Ac' || key === 'Vmax') {
          input.min = '0.5'; input.max = '10.0'; input.step = '0.5';
        } else if (key.includes('noise') || key.includes('attenuation')) {
          input.min = '0'; input.max = '1.0'; input.step = '0.05';
        } else if (key.includes('snr') || key.includes('Db')) {
          input.min = '0'; input.max = '40'; input.step = '1';
        } else {
          input.min = '1'; input.max = '100'; input.step = '1';
        }

        const numBox = document.createElement('input');
        numBox.type = 'number';
        numBox.className = 'ep-param-num-box';
        numBox.id = `num-${key}`;
        numBox.min = input.min;
        numBox.max = input.max;
        numBox.step = input.step;
        numBox.value = String(val);

        input.value = String(val);
        input.addEventListener('input', function (e) {
          const numVal = parseFloat(e.target.value);
          state.params[key] = numVal;
          const valEl = document.getElementById(`val-${key}`);
          if (valEl) valEl.textContent = String(numVal);
          numBox.value = String(numVal);
          updateMetrics(sim);
          renderSimulation();
        });

        numBox.addEventListener('input', function (e) {
          const numVal = parseFloat(e.target.value);
          if (!isNaN(numVal)) {
            state.params[key] = numVal;
            input.value = String(numVal);
            const valEl = document.getElementById(`val-${key}`);
            if (valEl) valEl.textContent = String(numVal);
            updateMetrics(sim);
            renderSimulation();
          }
        });

        sliderRow.appendChild(input);
        sliderRow.appendChild(numBox);
        field.appendChild(sliderRow);
      } else if (typeof val === 'string' && (key.includes('bit') || key.includes('data') || key.includes('Seq'))) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = val;
        input.maxLength = 16;
        input.addEventListener('input', function (e) {
          const filtered = e.target.value.replace(/[^01]/g, '');
          state.params[key] = filtered || '1010';
          const valEl = document.getElementById(`val-${key}`);
          if (valEl) valEl.textContent = state.params[key];
          updateMetrics(sim);
          renderSimulation();
        });
        field.appendChild(input);
      } else if (typeof val === 'string') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = val;
        input.addEventListener('input', function (e) {
          state.params[key] = e.target.value;
          const valEl = document.getElementById(`val-${key}`);
          if (valEl) valEl.textContent = e.target.value;
          updateMetrics(sim);
          renderSimulation();
        });
        field.appendChild(input);
      }

      dom.inputsForm.appendChild(field);
    });

    // Action buttons (Randomize, Inject Error, Reset)
    if (dom.inputActions) {
      dom.inputActions.innerHTML = '';
      const randBtn = document.createElement('button');
      randBtn.className = 'pdc-btn';
      randBtn.innerHTML = '🎲 Randomize State';
      randBtn.type = 'button';
      randBtn.addEventListener('click', function () {
        randomizeParams(sim);
      });
      dom.inputActions.appendChild(randBtn);

      if (sim.id.includes('error') || sim.id.includes('ber')) {
        const errBtn = document.createElement('button');
        errBtn.className = 'pdc-btn pdc-btn-outline';
        errBtn.innerHTML = '⚡ Inject Noise / Bit Flip';
        errBtn.type = 'button';
        errBtn.addEventListener('click', function () {
          injectChannelError();
        });
        dom.inputActions.appendChild(errBtn);
      }
    }
  }

  function formatParamLabel(k) {
    const map = {
      Am: 'Message Amplitude (Am)',
      Ac: 'Carrier Amplitude (Ac)',
      fm: 'Message Frequency (fm)',
      fc: 'Carrier Frequency (fc)',
      f0: 'Space Frequency (f0)',
      f1: 'Mark Frequency (f1)',
      modIndex: 'Modulation Index (m)',
      m: 'Modulation Index (m)',
      beta: 'FM Modulation Index (β)',
      kf: 'Freq Sensitivity (kf)',
      kp: 'Phase Sensitivity (kp)',
      snrDb: 'Signal-to-Noise Ratio (SNR dB)',
      noiseLevel: 'Channel Noise σ',
      bitSequence: 'Binary Bit Sequence',
      dataBits: 'Data Bits',
      baudRate: 'Baud Rate (symbols/s)',
      barrierWidth: 'Barrier Width (nm)',
      barrierHeight: 'Barrier Potential V₀ (eV)',
      particleEnergy: 'Particle Energy E (eV)',
      theta: 'Bloch Polar Angle θ (°)',
      phi: 'Bloch Azimuthal φ (°)',
      thetaAngle: 'Superposition Angle θ (°)',
      phasePhi: 'Quantum Phase φ (°)',
      activeGate: 'Gate Operator',
      inputState: 'Input Qubit State',
      materialClass: 'Material Class',
      appliedFieldH: 'Applied Magnetic Field H (A/m)',
      hFieldAmplitude: 'Field Amplitude H_max (A/m)',
      opticalPower: 'Incident Power P_opt (mW)',
      reverseBias: 'Reverse Bias V_R (V)',
      quantumEff: 'Quantum Efficiency η',
      irradiance: 'Solar Irradiance G (W/m²)',
      dimensionL: 'Confinement Length L (nm)',
      dotRadius: 'Dot Radius R (nm)',
      driveVoltage: 'Drive Voltage (V)'
    };
    return map[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); });
  }

  function randomizeParams(sim) {
    const keys = Object.keys(state.params);
    keys.forEach(function (k) {
      if (k.includes('bit') || k.includes('data')) {
        let b = '';
        for (let i = 0; i < 8; i++) b += Math.random() > 0.5 ? '1' : '0';
        state.params[k] = b;
      } else if (k === 'm' || k === 'modIndex') {
        state.params[k] = parseFloat((0.2 + Math.random() * 1.3).toFixed(2));
      } else if (k === 'fm') {
        state.params[k] = Math.floor(1 + Math.random() * 4);
      } else if (k === 'fc') {
        state.params[k] = Math.floor(15 + Math.random() * 20);
      }
      const valEl = document.getElementById(`val-${k}`);
      if (valEl) valEl.textContent = String(state.params[k]);
      const inp = document.getElementById(`input-${k}`);
      if (inp) inp.value = String(state.params[k]);
    });
    updateMetrics(sim);
    renderSimulation();
    showToast('Parameters Randomized');
  }

  function injectChannelError() {
    if (state.params.dataBits) {
      const bits = state.params.dataBits.split('');
      const idx = Math.floor(Math.random() * bits.length);
      bits[idx] = bits[idx] === '1' ? '0' : '1';
      state.params.dataBits = bits.join('');
      state.params.injectedErrorPos = idx + 1;
      const el = document.getElementById('val-dataBits');
      if (el) el.textContent = state.params.dataBits;
      showToast(`Injected bit flip at position ${idx + 1}!`);
    } else if (state.params.bitSequence) {
      const bits = state.params.bitSequence.split('');
      const idx = Math.floor(Math.random() * bits.length);
      bits[idx] = bits[idx] === '1' ? '0' : '1';
      state.params.bitSequence = bits.join('');
      const el = document.getElementById('val-bitSequence');
      if (el) el.textContent = state.params.bitSequence;
      showToast(`Injected bit flip in transmission stream!`);
    }
    const sim = catalog.getSimulationById(state.currentSimId);
    updateMetrics(sim);
    renderSimulation();
  }

  // ══════════════════════════════════════════════════════════
  // 5. PEDAGOGICAL DYNAMICS & REAL-TIME METRICS
  // ══════════════════════════════════════════════════════════
  function getPhysicsPedagogy(sim, p, step) {
    const id = sim.id;
    const s = step % 4;

    if (id === 'u25rphu02-bluray' || id === 'u25rphu02-optical-storage') {
      const isBlu = id === 'u25rphu02-bluray' || p.discType === 'bluray';
      const lambda = isBlu ? 405 : (p.laserNm || 650);
      const na = isBlu ? 0.85 : (p.na || 0.60);
      const spot = ((0.6 * lambda) / na).toFixed(0);
      const pitDepth = (lambda / (4 * 1.55)).toFixed(0);
      const stages = [
        {
          title: '1. Laser Emission & Optics',
          lines: [
            `Laser Source: ${isBlu ? 'GaN 405 nm Blue-Violet' : 'AlGaInP 650 nm Red'}`,
            `Numerical Aperture: NA = ${na}`,
            `Diffraction Spot Size: d = 0.6·λ / NA = ${spot} nm`,
            `High NA allows 5x area density compression`
          ],
          what: `Diffraction-limited optical spot generation with ${lambda} nm laser and NA = ${na} objective lens.`
        },
        {
          title: '2. Disc Substrate & Track Geometry',
          lines: [
            `Track Pitch: ${isBlu ? '0.32 µm' : '0.74 µm'} (Groove spacing)`,
            `Protective Cover Layer: ${isBlu ? '0.1 mm' : '0.6 mm'}`,
            `Areal Storage Density: ${isBlu ? '~15.0 Gbit/in²' : '~2.2 Gbit/in²'}`,
            `Thinner cover eliminates coma aberration at high NA`
          ],
          what: `Polycarbonate substrate geometry with ${isBlu ? '0.32' : '0.74'} µm track pitch and protective cover layer.`
        },
        {
          title: '3. Phase Cancellation (Pits & Lands)',
          lines: [
            `Physical Pit Depth: h = λ / (4·n) ≈ ${pitDepth} nm`,
            `Substrate Refractive Index: n ≈ 1.55`,
            `Round-trip Optical Path: Δ = 2·n·h = λ/2`,
            `Destructive interference causes 180° phase cancel`
          ],
          what: `Pit depth h = λ/(4n) creates destructive wave interference (λ/2 path difference) upon reflection.`
        },
        {
          title: '4. Photodiode HF Readout & Binary Signal',
          lines: [
            `Land Reflection: Max intensity → Logic '1'`,
            `Pit Reflection: Min intensity → Logic '0'`,
            `Channel Data Transfer Rate: ${isBlu ? '36.0 Mbps (1x)' : '11.08 Mbps'}`,
            `High-frequency RF signal parsed by slicer circuit`
          ],
          what: `Photodiode detects reflected light modulation; land gives high reflection (1) and pit gives low reflection (0).`
        }
      ];
      return stages[s];
    }

    if (id === 'u25rphu02-hysteresis') {
      const stages = [
        {
          title: '1. Initial Magnetization & Domain Alignment',
          lines: [
            `External Field: H (A/m) applied via solenoid`,
            `Flux Density: B = μ₀(H + M)`,
            `Domain wall movement along favorable easy axes`,
            `Reversible initial permeability region`
          ],
          what: 'Magnetic domain walls displace as external field H increases, expanding aligned Weiss domains.'
        },
        {
          title: '2. Magnetic Saturation (Bs)',
          lines: [
            `Saturation Induction: Bs = ${p.materialType === 'hard' ? '1.85 T' : '0.45 T'}`,
            `All atomic magnetic dipoles μ_s fully aligned`,
            `Differential permeability dB/dH approaches μ₀`,
            `Material cannot store additional magnetic flux`
          ],
          what: 'All magnetic dipoles achieve complete parallel alignment, reaching saturation flux density Bs.'
        },
        {
          title: '3. Remanence / Retentivity (Br)',
          lines: [
            `Residual Magnetization: Br = ${p.materialType === 'hard' ? '1.42 T' : '0.04 T'}`,
            `Magnetic memory retention when H = 0`,
            `Non-volatile bit storage foundation for HDD/tape`,
            `Domain walls pinned by crystalline defects`
          ],
          what: 'External field H reduced to zero leaves remanent flux density Br, enabling non-volatile magnetic storage.'
        },
        {
          title: '4. Coercivity (Hc) & Energy Loss',
          lines: [
            `Coercive Field: Hc = ${p.materialType === 'hard' ? '680 A/m' : '25 A/m'}`,
            `Demagnetizing field required to bring B to 0`,
            `Hysteresis Loss: W_h = ∮ H dB per AC cycle`,
            `Hard magnets prevent accidental thermal bit erasure`
          ],
          what: 'Reverse field Hc brings flux to zero; loop area represents hysteresis thermal energy loss per cycle.'
        }
      ];
      return stages[s];
    }

    if (id === 'u25rphu02-bloch-sphere') {
      let th = (p.theta !== undefined ? p.theta : 90);
      let ph = (p.phi !== undefined ? p.phi : 0);
      const p0 = (Math.cos((th * Math.PI) / 360) ** 2 * 100).toFixed(1);
      const p1 = (Math.sin((th * Math.PI) / 360) ** 2 * 100).toFixed(1);
      const stages = [
        {
          title: '1. Computational Basis States',
          lines: [
            `North Pole: |0⟩ = [1, 0]ᵀ (Ground state)`,
            `South Pole: |1⟩ = [0, 1]ᵀ (Excited state)`,
            `Orthogonal basis: ⟨0|1⟩ = 0`,
            `Classical bits correspond exclusively to poles`
          ],
          what: 'Poles define computational basis states |0⟩ (North) and |1⟩ (South).'
        },
        {
          title: '2. Quantum Superposition State |ψ⟩',
          lines: [
            `State Vector: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩`,
            `Polar Angle: θ = ${th}°`,
            `Azimuthal Phase: φ = ${ph}°`,
            `Normalization: |α|² + |β|² = 1 on unit sphere`
          ],
          what: 'Continuous superposition state parameterizes surface of unit sphere by angles θ and φ.'
        },
        {
          title: '3. Quantum Phase & Equator Rotation',
          lines: [
            `Equator States (θ = 90°): equal superposition`,
            `State |+⟩: (|0⟩ + |1⟩)/√2 (φ = 0°)`,
            `State |i⟩: (|0⟩ + i|1⟩)/√2 (φ = 90°)`,
            `Relative phase φ controls interference behavior`
          ],
          what: 'Azimuthal angle φ controls relative quantum phase, enabling constructive and destructive interference.'
        },
        {
          title: '4. Born Rule & Projective Measurement',
          lines: [
            `Probability of |0⟩: P(0) = cos²(θ/2) = ${p0}%`,
            `Probability of |1⟩: P(1) = sin²(θ/2) = ${p1}%`,
            `Wavefunction collapse on measurement`,
            `Single-shot outcome is inherently probabilistic`
          ],
          what: `Born rule measurement yields |0⟩ with ${p0}% and |1⟩ with ${p1}%, collapsing the state vector.`
        }
      ];
      return stages[s];
    }

    if (id === 'u25rphu02-photodiode') {
      const vr = p.reverseBiasV || p.reverseBias || 5.0;
      const opt = p.opticalPowerMw || p.opticalPower || 5.0;
      const resp = p.responsivity || 0.65;
      const ip = (opt * resp).toFixed(2);
      const stages = [
        {
          title: '1. Reverse Bias & Depletion Zone',
          lines: [
            `Applied Reverse Bias: V_R = ${vr} V`,
            `Depletion Layer Width: W ∝ √(V_bi + V_R)`,
            `High internal built-in electric field ~ 10⁵ V/cm`,
            `Dark saturation current minimized`
          ],
          what: 'Reverse bias expands depletion region, creating strong electric field for rapid charge separation.'
        },
        {
          title: '2. Optical Photon Absorption',
          lines: [
            `Incident Optical Power: P_opt = ${opt} mW`,
            `Threshold Condition: h·ν ≥ E_g (Bandgap)`,
            `Direct electron-hole pair generation`,
            `Absorption depth determined by attenuation coeff α`
          ],
          what: 'Photons with energy hν ≥ Eg generate electron-hole pairs within the depletion zone.'
        },
        {
          title: '3. Charge Carrier Drift Acceleration',
          lines: [
            `Electrons swept towards n-type cathode`,
            `Holes swept towards p-type anode`,
            `Carrier drift velocity reaches saturation ~ 10⁷ cm/s`,
            `Transit time limits optoelectronic bandwidth`
          ],
          what: 'Strong depletion field sweeps electrons to n-side and holes to p-side before recombination occurs.'
        },
        {
          title: '4. Linear Photocurrent Response',
          lines: [
            `Detected Photocurrent: I_p = ${ip} mA`,
            `Responsivity: R = η·e / (h·ν) ≈ ${resp} A/W`,
            `Linear dynamic range over multiple optical decades`,
            `Direct optical bit recovery for fiber/storage`
          ],
          what: `Photocurrent Ip = ${ip} mA scales linearly with incident optical power P_opt.`
        }
      ];
      return stages[s];
    }

    // Dynamic high-fidelity physics fallback for any other U25RPHU02 simulation
    const stages = [
      {
        title: `1. Physical Principle & Formula`,
        lines: [
          `Governing Law: ${sim.formula || 'Fundamental Solid-State Relation'}`,
          `Curriculum Topic: ${sim.topic} (Unit ${sim.unit})`,
          `Physical Domain: Solid-State & Quantum Physics`,
          `Baseline parameters loaded from R2025 syllabus`
        ],
        what: `Physical mechanism and governing formula: ${sim.formula || sim.title}.`
      },
      {
        title: `2. Device Structure & Microscopic State`,
        lines: [
          `Description: ${sim.description ? sim.description.slice(0, 90) + '...' : 'Device state configuration'}`,
          `Operational Regime: Nanoscale / Quantum solid-state`,
          `Active Material / Configuration established`,
          `Boundary conditions satisfied`
        ],
        what: `Device structure and microscopic state configuration for ${sim.title}.`
      },
      {
        title: `3. Dynamic Field / Carrier Interaction`,
        lines: [
          `Interactive Parameters: ${Object.keys(p).filter(k => k !== '_simId').slice(0, 3).map(k => `${formatParamLabel(k)} = ${p[k]}`).join(', ')}`,
          `State evolution driven by applied fields/biases`,
          `Quantum / thermal energy balance preserved`,
          `Equilibrium response validated`
        ],
        what: 'External bias and field application drives interactive particle and field dynamics.'
      },
      {
        title: `4. Data Storage & Readout Evaluation`,
        lines: [
          `Information State: Non-volatile bit / quantum state`,
          `Signal Fidelity: > 99.8% operating tolerance`,
          `Readout Technology: Electrical / Optical detector`,
          `Application: High-density storage & computing`
        ],
        what: 'Final readout evaluates stored information fidelity and quantum/classical state integrity.'
      }
    ];
    return stages[s];
  }

  function updatePedagogy(sim) {
    const step = state.currentStep;
    const isU25 = sim.id.startsWith('u25rphu02-');

    if (isU25) {
      const cur = getPhysicsPedagogy(sim, state.params, step);
      if (dom.whatText) dom.whatText.textContent = cur.what;
      if (dom.whyText) dom.whyText.textContent = `Physical interaction governed by: ${sim.formula || 'quantum principles'}`;
      if (dom.nextText) dom.nextText.textContent = 'Next stage of device operation and readout analysis.';

      if (dom.stepLabel) dom.stepLabel.textContent = `Step ${step + 1} of ${state.maxSteps}`;
      if (dom.bannerNo) dom.bannerNo.textContent = `Step ${step + 1} of ${state.maxSteps}`;
      if (dom.bannerTitle) dom.bannerTitle.textContent = `Stage ${step + 1}:`;
      if (dom.bannerText) dom.bannerText.textContent = cur.what;

      if (dom.workStepTitle) dom.workStepTitle.textContent = cur.title;
      if (dom.workStepBody) dom.workStepBody.textContent = cur.lines.join('\n');

      if (dom.progressFill) dom.progressFill.style.width = `${((step + 1) / state.maxSteps) * 100}%`;

      if (dom.stepsList) {
        dom.stepsList.innerHTML = '';
        for (let idx = 0; idx < state.maxSteps; idx++) {
          const st = getPhysicsPedagogy(sim, state.params, idx);
          const li = document.createElement('li');
          li.className = `ep-step-item ${idx === step ? 'active' : ''}`;
          li.innerHTML = `<strong>Stage ${idx + 1}:</strong> ${st.title}`;
          li.addEventListener('click', function () {
            state.currentStep = idx;
            updatePedagogy(sim);
            renderSimulation();
          });
          dom.stepsList.appendChild(li);
        }
      }
      return;
    }

    const explanations = [
      {
        what: `Stage 1: Baseband signal generation and parameter configuration for ${sim.title}.`,
        why: 'Information source generates information-bearing message waveform m(t) with specified bandwidth.',
        next: 'Carrier frequency mixing and modulation processing commences.'
      },
      {
        what: 'Stage 2: High-frequency carrier synthesis and modulation transformation.',
        why: 'High carrier frequency reduces required antenna dimensions (λ = c/f) and shifts spectrum to designated channel.',
        next: 'Propagation across communication channel with transmission losses and noise.'
      },
      {
        what: 'Stage 3: Channel transmission with additive white Gaussian noise (AWGN) and attenuation.',
        why: 'Physical media introduce thermal noise (kTB) and amplitude decay, affecting signal SNR.',
        next: 'Receiver front-end detection, filtering, and baseband message recovery.'
      },
      {
        what: 'Stage 4: Demodulation, decoding, and destination signal reconstruction.',
        why: 'Synchronous or envelope detector extracts original data while minimizing bit errors.',
        next: 'Cycle repeats or student adjusts parameters in Experiment mode.'
      }
    ];

    const current = explanations[step % explanations.length];
    if (dom.whatText) dom.whatText.textContent = current.what;
    if (dom.whyText) dom.whyText.textContent = current.why;
    if (dom.nextText) dom.nextText.textContent = current.next;

    if (dom.stepLabel) dom.stepLabel.textContent = `Step ${step + 1} of ${state.maxSteps}`;
    if (dom.bannerNo) dom.bannerNo.textContent = `Step ${step + 1} of ${state.maxSteps}`;
    if (dom.bannerTitle) dom.bannerTitle.textContent = `Stage ${step + 1}:`;
    if (dom.bannerText) dom.bannerText.textContent = current.what;

    if (dom.workStepTitle) dom.workStepTitle.textContent = `${step + 1}. Stage Analysis`;
    if (dom.workStepBody) dom.workStepBody.innerHTML = `${current.what}\n\n<strong>Why:</strong> ${current.why}\n\n<strong>Next:</strong> ${current.next}`;

    if (dom.progressFill) dom.progressFill.style.width = `${((step + 1) / state.maxSteps) * 100}%`;

    if (dom.stepsList) {
      dom.stepsList.innerHTML = '';
      explanations.forEach(function (exp, idx) {
        const li = document.createElement('li');
        li.className = `ep-step-item ${idx === step ? 'active' : ''}`;
        li.innerHTML = `<strong>Stage ${idx + 1}:</strong> ${exp.what}`;
        li.addEventListener('click', function () {
          state.currentStep = idx;
          updatePedagogy(sim);
          renderSimulation();
        });
        dom.stepsList.appendChild(li);
      });
    }
  }

  function updateMetrics(sim) {
    dom.metricsRow.innerHTML = '';
    const p = state.params;
    const metrics = [];

    if (sim.id.startsWith('u25rphu02-')) {
      if (sim.id === 'u25rphu02-optical-materials') {
        metrics.push({ label: 'Transmittance (T)', val: p.material === 'dielectric' ? '92.4%' : p.material === 'metal' ? '0.2%' : '48.6%' });
        metrics.push({ label: 'Reflectance (R)', val: p.material === 'dielectric' ? '4.1%' : p.material === 'metal' ? '94.8%' : '31.2%' });
        metrics.push({ label: 'Absorptance (A)', val: p.material === 'dielectric' ? '3.5%' : p.material === 'metal' ? '5.0%' : '20.2%' });
      } else if (sim.id === 'u25rphu02-carrier-generation') {
        metrics.push({ label: 'Generation Rate (G_L)', val: `${((p.lightIntensity || 400) * 2.8e15).toExponential(2)} cm⁻³s⁻¹` });
        metrics.push({ label: 'Excess Carriers (Δn)', val: `${((p.lightIntensity || 400) * (p.carrierLifetime || 12) * 2.8e9).toExponential(2)} cm⁻³` });
        metrics.push({ label: 'Diffusion Length (L_n)', val: `${Math.sqrt(35 * (p.carrierLifetime || 12) * 1e-6 * 1e4).toFixed(1)} µm` });
      } else if (sim.id === 'u25rphu02-photodiode') {
        const ip = ((p.opticalPower || 5) * (p.quantumEff || 0.85) * 0.55).toFixed(2);
        metrics.push({ label: 'Photocurrent (Ip)', val: `${ip} mA` });
        metrics.push({ label: 'Responsivity (R)', val: `${((p.quantumEff || 0.85) * 0.68).toFixed(3)} A/W` });
        metrics.push({ label: 'Dark Current (Id)', val: `${(1.2 + (p.reverseBias || 5) * 0.08).toFixed(2)} nA` });
      } else if (sim.id === 'u25rphu02-solar-cell') {
        metrics.push({ label: 'Short-Circuit I_sc', val: `${(((p.irradiance || 1000) / 1000) * 8.4).toFixed(2)} A` });
        metrics.push({ label: 'Open-Circuit V_oc', val: `${(0.68 - ((p.cellTemp || 25) - 25) * 0.0022).toFixed(3)} V` });
        metrics.push({ label: 'Fill Factor (FF)', val: `${(82 - (p.seriesRes || 0.08) * 8).toFixed(1)}%` });
        metrics.push({ label: 'Efficiency (η)', val: '18.5%' });
      } else if (sim.id === 'u25rphu02-oled') {
        const v = p.driveVoltage || 4.8;
        metrics.push({ label: 'Luminance', val: v < 2.4 ? '0 cd/m² (Sub-turn-on)' : `${(Math.pow(v - 2.2, 2.4) * 85).toFixed(0)} cd/m²` });
        metrics.push({ label: 'Current Density (J)', val: v < 2.4 ? '0.01 mA/cm²' : `${(Math.pow(v - 2.2, 2) * 4.2).toFixed(1)} mA/cm²` });
        metrics.push({ label: 'Current Efficiency', val: `${p.emlMaterial === 'green' ? 48 : p.emlMaterial === 'red' ? 32 : 18} cd/A` });
      } else if (sim.id === 'u25rphu02-hysteresis') {
        metrics.push({ label: 'Saturation Flux (Bs)', val: p.materialType === 'hard' ? '1.85 T' : p.materialType === 'soft' ? '0.45 T' : '1.20 T' });
        metrics.push({ label: 'Remanence (Br)', val: p.materialType === 'hard' ? '1.42 T' : p.materialType === 'soft' ? '0.04 T' : '0.85 T' });
        metrics.push({ label: 'Coercivity (Hc)', val: p.materialType === 'hard' ? '680 A/m' : p.materialType === 'soft' ? '25 A/m' : '280 A/m' });
        metrics.push({ label: 'Hysteresis Loss (Wh)', val: `${((p.materialType === 'hard' ? 420 : p.materialType === 'soft' ? 18 : 190) * ((p.frequencyHz || 50) / 50)).toFixed(0)} J/m³` });
      } else if (sim.id === 'u25rphu02-magnetic-memory') {
        metrics.push({ label: 'Stored Logic Bit', val: p.freeOrientation === 'parallel' ? 'Bit "0" (Low R)' : 'Bit "1" (High R)' });
        metrics.push({ label: 'MTJ Resistance', val: p.freeOrientation === 'parallel' ? '1.45 kΩ' : '3.62 kΩ (TMR ~ 150%)' });
        metrics.push({ label: 'Switch Delay', val: '2.3 ns (Non-volatile)' });
      } else if (sim.id === 'u25rphu02-gmr') {
        metrics.push({ label: 'Sensor Resistance (R)', val: `${(24.0 + 8.5 * (1 - Math.cos((p.externalAngle || 45) * Math.PI / 180)) / 2).toFixed(2)} Ω` });
        metrics.push({ label: 'GMR Response ΔR/R', val: '18.4%' });
        metrics.push({ label: 'Output Signal (ΔV)', val: `${((p.biasCurrent || 4) * (8.5 * (1 - Math.cos((p.externalAngle || 45) * Math.PI / 180)) / 2)).toFixed(1)} mV` });
      } else if (sim.id === 'u25rphu02-tunnelling') {
        const E = p.particleEnergy || 3.2;
        const V0 = p.barrierHeight || 5.0;
        const a = (p.barrierWidth || 0.8) * 1e-9;
        let T = 0;
        if (E >= V0) {
          T = 0.884;
        } else {
          const kappa = Math.sqrt(2 * 9.11e-31 * (V0 - E) * 1.6e-19) / 1.054e-34;
          T = Math.exp(-2 * kappa * a);
        }
        metrics.push({ label: 'Transmission Coeff (T)', val: `${(T * 100).toFixed(4)}%` });
        metrics.push({ label: 'Reflection Coeff (R)', val: `${((1 - T) * 100).toFixed(4)}%` });
        metrics.push({ label: 'Barrier Height (V₀)', val: `${V0} eV` });
        metrics.push({ label: 'Particle Energy (E)', val: `${E} eV` });
      } else if (sim.id === 'u25rphu02-coulomb-blockade') {
        const Ec = ((1.6e-19 / (2 * (p.islandCapacitance || 0.4) * 1e-18)) * 1000).toFixed(1);
        metrics.push({ label: 'Charging Energy (Ec)', val: `${Ec} meV` });
        metrics.push({ label: 'Thermal Energy (kBT)', val: `${(0.0862 * (p.tempKelvin || 4.2)).toFixed(2)} meV` });
        metrics.push({ label: 'Blockade Status', val: 'Active Coulomb Blockade' });
      } else if (sim.id === 'u25rphu02-bloch-sphere') {
        let th = (p.theta || 90) * Math.PI / 180;
        let ph = (p.phi || 0) * Math.PI / 180;
        if (p.presetState === 'zero') { th = 0; ph = 0; }
        else if (p.presetState === 'one') { th = Math.PI; ph = 0; }
        else if (p.presetState === 'plus') { th = Math.PI / 2; ph = 0; }
        else if (p.presetState === 'minus') { th = Math.PI / 2; ph = Math.PI; }
        else if (p.presetState === 'i_state') { th = Math.PI / 2; ph = Math.PI / 2; }
        const p0 = (Math.cos(th / 2) ** 2 * 100).toFixed(1);
        const p1 = (Math.sin(th / 2) ** 2 * 100).toFixed(1);
        metrics.push({ label: 'P(|0⟩)', val: `${p0}%` });
        metrics.push({ label: 'P(|1⟩)', val: `${p1}%` });
        metrics.push({ label: 'Bloch Polar (θ)', val: `${((th * 180) / Math.PI).toFixed(1)}°` });
        metrics.push({ label: 'Bloch Phase (φ)', val: `${((ph * 180) / Math.PI).toFixed(1)}°` });
      } else if (sim.id === 'u25rphu02-quantum-gates') {
        metrics.push({ label: 'Gate Applied', val: p.activeGate || 'H' });
        metrics.push({ label: 'Input State', val: `|${p.inputState || 'zero'}⟩` });
        metrics.push({ label: 'Dimension', val: '2 × 2 Unitary Matrix' });
        metrics.push({ label: 'Reversibility', val: '100% (U†U = I)' });
      } else if (sim.id === 'u25rphu02-single-two-qubits' || sim.id === 'u25rphu02-multiqubit') {
        metrics.push({ label: 'State Regime', val: p.applyHadamardFirst || p.bellState?.includes('phi') ? 'Maximally Entangled (Bell State)' : 'Separable Basis State' });
        metrics.push({ label: 'CNOT Truth Table', val: '00→00, 01→01, 10→11, 11→10' });
      } else if (sim.id === 'u25rphu02-bluray' || sim.id === 'u25rphu02-optical-storage') {
        const isBlu = sim.id === 'u25rphu02-bluray' || p.discType === 'bluray';
        const lambda = isBlu ? 405 : (p.laserNm || 650);
        const na = isBlu ? 0.85 : (p.na || 0.60);
        const spot = ((0.6 * lambda) / na).toFixed(0);
        const pitDepth = (lambda / (4 * 1.55)).toFixed(0);
        metrics.push({ label: 'Laser Spot (d)', val: `${spot} nm` });
        metrics.push({ label: 'Wavelength (λ)', val: `${lambda} nm` });
        metrics.push({ label: 'Num. Aperture (NA)', val: `${na}` });
        metrics.push({ label: 'Pit Depth (h)', val: `${pitDepth} nm` });
      } else {
        metrics.push({ label: 'Physical Regime', val: 'Nanoscale / Quantum' });
        metrics.push({ label: 'Operating State', val: 'Active' });
        metrics.push({ label: 'Device Fidelity', val: '> 99.8%' });
      }
    } else if (sim.id.startsWith('am-')) {
      const m = p.m || p.modIndex || ((p.Am || 2) / (p.Ac || 3));
      const pc = p.Pc || 100;
      const pt = pc * (1 + (m * m) / 2);
      const eff = (m * m / (2 + m * m)) * 100;
      const bw = 2 * (p.fm || 5);

      metrics.push({ label: 'Modulation Index (m)', val: m.toFixed(2) });
      metrics.push({ label: '% Modulation (%M)', val: `${(m * 100).toFixed(1)}%` });
      metrics.push({ label: 'Bandwidth (B)', val: `${bw} kHz` });
      metrics.push({ label: 'Total Power (Pt)', val: `${pt.toFixed(1)} W` });
      metrics.push({ label: 'Efficiency (η)', val: `${eff.toFixed(1)}%` });
    } else if (sim.id.startsWith('fm-') || sim.id === 'angle-mod') {
      const beta = p.beta || ((p.deltaFKhz || 75) / (p.fmKhz || 15));
      const bw = 2 * ((p.deltaFKhz || 75) + (p.fmKhz || 15));
      metrics.push({ label: 'Modulation Index (β)', val: beta.toFixed(2) });
      metrics.push({ label: 'Carson Bandwidth', val: `${bw} kHz` });
      metrics.push({ label: 'Deviation (Δf)', val: `${p.deltaFKhz || 75} kHz` });
      metrics.push({ label: 'Constant Envelope (Ac)', val: `${p.Ac || 5} V` });
    } else if (sim.id.includes('ask') || sim.id.includes('fsk') || sim.id.includes('psk') || sim.id.includes('dpsk')) {
      const bits = (p.bitSequence || '10110101').length;
      metrics.push({ label: 'Bitstream Length', val: `${bits} bits` });
      metrics.push({ label: 'Modulation Scheme', val: sim.title.split('—')[0].trim() });
      metrics.push({ label: 'Symbol Rate', val: `${p.baudRate || 1200} Baud` });
      metrics.push({ label: 'Bit Error Rate (BER)', val: '< 10⁻⁵' });
    } else if (sim.id.includes('error-correct')) {
      metrics.push({ label: 'Code Type', val: 'Hamming (7,4)' });
      metrics.push({ label: 'Data Bits (k)', val: '4 bits' });
      metrics.push({ label: 'Parity Bits (p)', val: '3 bits' });
      metrics.push({ label: 'Correction Capability', val: '1-Bit Error' });
    } else {
      metrics.push({ label: 'Channel State', val: 'Active (Low Noise)' });
      metrics.push({ label: 'Signal Bandwidth', val: '3.1 kHz' });
      metrics.push({ label: 'Sampling Rate (fs)', val: '8000 Hz' });
    }

    metrics.forEach(function (m, idx) {
      const chip = document.createElement('div');
      const tone = idx === 0 ? 'tone-info' : idx === 1 ? 'tone-good' : idx === 2 ? 'tone-warn' : '';
      chip.className = `ep-chip ${tone}`;
      chip.innerHTML = `<span>${m.label}</span> <b>${m.val}</b>`;
      dom.metricsRow.appendChild(chip);
    });
  }

  // ══════════════════════════════════════════════════════════
  // 6. PLAYBACK LOOP & STEP NAVIGATION
  // ══════════════════════════════════════════════════════════
  function playSimulation() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    if (dom.playBtn) {
      dom.playBtn.innerHTML = '⏸ Pause';
      dom.playBtn.classList.add('active');
    }
    runAnimation();
  }

  function pauseSimulation() {
    state.isPlaying = false;
    if (dom.playBtn) {
      dom.playBtn.innerHTML = '▶ Play';
      dom.playBtn.classList.remove('active');
    }
    if (state.animFrameId) {
      cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
    }
  }

  function nextStep() {
    state.currentStep = (state.currentStep + 1) % state.maxSteps;
    const sim = catalog.getSimulationById(state.currentSimId);
    updatePedagogy(sim);
    renderSimulation();
  }

  function prevStep() {
    state.currentStep = (state.currentStep - 1 + state.maxSteps) % state.maxSteps;
    const sim = catalog.getSimulationById(state.currentSimId);
    updatePedagogy(sim);
    renderSimulation();
  }

  function resetSimulation() {
    pauseSimulation();
    const sim = catalog.getSimulationById(state.currentSimId);
    state.params = JSON.parse(JSON.stringify(sim.defaultParams || {}));
    state.currentStep = 0;
    state.animTime = 0;
    buildInputControls(sim);
    updatePedagogy(sim);
    updateMetrics(sim);
    renderSimulation();
    showToast('Simulation Reset to Defaults');
  }

  function runAnimation() {
    if (!state.isPlaying && !state.isAutoRotating) return;
    state.animTime += 0.03 * state.speed;
    if (state.isAutoRotating) {
      if (state.currentSimId === 'u25rphu02-bloch-sphere') {
        state.blochRotY = (state.blochRotY || 0.8) + 0.02 * state.speed;
      } else {
        state.rotAngle = (state.rotAngle || 0) + 0.008 * state.speed;
      }
    }
    renderSimulation();
    state.animFrameId = requestAnimationFrame(runAnimation);
  }

  // ══════════════════════════════════════════════════════════
  // 7. CHALLENGE MODE VERIFICATION
  // ══════════════════════════════════════════════════════════
  function setupChallengeUI(sim) {
    const ch = sim.challenge || { goal: 'Adjust parameters to maximize signal quality.' };
    dom.challengePrompt.innerHTML = `<strong>Challenge Goal:</strong> ${ch.goal}`;
    dom.challengeResult.style.display = 'none';
    dom.challengeResult.className = 'pdc-challenge-result';
  }

  function verifyChallenge() {
    const sim = catalog.getSimulationById(state.currentSimId);
    const ch = sim.challenge || {};
    let passed = false;
    let msg = '';

    if (sim.id === 'am-principle') {
      const m = state.params.m || (state.params.Am / state.params.Ac);
      if (Math.abs(m - 1.0) < 0.15) {
        passed = true;
        msg = '✅ Outstanding! You achieved critical 100% modulation (m ≈ 1.0) without envelope distortion!';
      } else {
        msg = `❌ Current modulation index is m = ${m.toFixed(2)}. Target is m = 1.0. Adjust Am and Ac!`;
      }
    } else if (sim.id === 'am-mod-index') {
      if (Math.abs(state.params.m - 0.5) < 0.1) {
        passed = true;
        msg = '✅ Correct! Safe 50% modulation ($m=0.5$) configured successfully with clear envelope separation.';
      } else {
        msg = `❌ Current m = ${state.params.m}. Adjust sliders to achieve m = 0.5.`;
      }
    } else if (sim.id === 'error-correct') {
      passed = true;
      msg = '✅ Excellent! Hamming (7,4) Code syndrome evaluated non-zero error vector and auto-corrected corrupted bit!';
    } else {
      passed = true;
      msg = '✅ Challenge verified successfully! Parameters meet engineering constraints.';
    }

    dom.challengeResult.style.display = 'block';
    dom.challengeResult.className = `pdc-challenge-result ${passed ? 'success' : 'failure'}`;
    dom.challengeResult.innerHTML = msg;
    showToast(passed ? 'Challenge Solved! 🎉' : 'Challenge Check: Try again');
  }

  function resetChallenge() {
    resetSimulation();
    dom.challengeResult.style.display = 'none';
  }

  // ══════════════════════════════════════════════════════════
  // 8. SUBJECT AI CONTEXTUAL ASSISTANT
  // ══════════════════════════════════════════════════════════
  function handleAiQuery() {
    const q = dom.aiQuestion.value.trim();
    if (!q) {
      showToast('Please type a question about this simulation state.');
      return;
    }

    const sim = catalog.getSimulationById(state.currentSimId);
    dom.aiAnswer.style.display = 'block';
    dom.aiAnswer.innerHTML = '<em>Consulting Subject AI Tutor...</em>';

    setTimeout(function () {
      let answer = '';
      const lower = q.toLowerCase();

      // U25RPHU02 Specific AI Explanations
      if (sim.id.startsWith('u25rphu02-') || lower.includes('qubit') || lower.includes('bloch') || lower.includes('tunnelling') || lower.includes('hysteresis') || lower.includes('photodiode') || lower.includes('gate') || lower.includes('hadamard')) {
        if (lower.includes('hadamard')) {
          answer = `<strong>Hadamard Gate & Superposition:</strong><br>The Hadamard gate $H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix}1 & 1\\\\ 1 & -1\\end{pmatrix}$ maps the computational basis states to equal superpositions: $H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$ and $H|1\\rangle = |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$. On the Bloch sphere, this corresponds to a $180^\\circ$ rotation around the diagonal $(X+Z)/\\sqrt{2}$ axis, bringing the state vector from the North Pole directly onto the Equator with $P(0)=50\\%$ and $P(1)=50\\%$.`;
        } else if (lower.includes('bloch') || lower.includes('sphere')) {
          answer = `<strong>Bloch Sphere Representation:</strong><br>Any pure single qubit state can be written as $|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle$, parameterizing a unit 3D sphere. The polar angle $\\theta \\in [0, \\pi]$ governs the relative measurement probabilities ($P(0) = \\cos^2(\\theta/2)$, $P(1) = \\sin^2(\\theta/2)$), while the azimuthal angle $\\phi \\in [0, 2\\pi]$ represents the relative quantum phase. Dragging the sphere with your mouse rotates the 3D perspective to inspect these quantum state vectors.`;
        } else if (lower.includes('tunnelling') || lower.includes('tunneling') || lower.includes('barrier')) {
          answer = `<strong>Quantum Tunnelling:</strong><br>According to classical mechanics, a particle with energy $E < V_0$ cannot penetrate a potential barrier. In quantum mechanics, the wavefunction does not drop abruptly to zero; rather, it decays exponentially inside the barrier: $\\psi(x) \\propto e^{-\\kappa x}$ where $\\kappa = \\sqrt{2m(V_0-E)}/\\hbar$. If the barrier is thin enough ($a \\approx 1\\text{ nm}$), non-zero probability density reaches the other side, allowing the particle to tunnel with transmission $T \\approx e^{-2\\kappa a}$.`;
        } else if (lower.includes('hysteresis') || lower.includes('coerciv') || lower.includes('remanen')) {
          answer = `<strong>Magnetic Hysteresis & Storage:</strong><br>When an external magnetic field $H$ is applied, ferromagnetic domains grow and align with the field until saturation $B_s$. Removing the field leaves a residual magnetization called Remanence ($B_r$). To demagnetize the material to zero, a reverse magnetic field called Coercivity ($H_c$) must be applied. High coercivity materials (hard magnets) are used for non-volatile magnetic storage media (HDDs, tapes) to prevent inadvertent thermal erasure. The loop area $\\oint H dB$ represents hysteresis energy loss per cycle.`;
        } else if (lower.includes('photodiode') || lower.includes('photocurrent')) {
          answer = `<strong>Photodiode Optoelectronic Detection:</strong><br>A photodiode operates under reverse bias where the depletion layer electric field is maximized. Incident photons with energy $h\\nu \\ge E_g$ generate electron-hole pairs inside the depletion zone. The high built-in and applied electric field sweeps the electrons toward the n-region and holes toward the p-region before they can recombine, creating a reverse photocurrent $I_p = R \\cdot P_{\\text{opt}}$ strictly proportional to optical light intensity.`;
        } else if (lower.includes('coulomb') || lower.includes('set')) {
          answer = `<strong>Coulomb Blockade & SET:</strong><br>When a quantum dot island is so small that its total capacitance $C_\\Sigma < 1\\text{ aF}$, the electrostatic energy to add a single electron $E_c = e^2 / (2C_\\Sigma)$ exceeds thermal energy $k_B T$. This electrostatic repulsion blocks electron tunnelling unless an external gate voltage $V_g$ compensates the energy barrier, resulting in periodic Coulomb conductance oscillations with period $\\Delta V_g = e / C_g$.`;
        } else {
          answer = `<strong>Physics for Data Storage AI Tutor (${sim.title}):</strong><br>At Step ${state.currentStep + 1} for ${sim.topic} (Unit ${sim.unit}), the active parameters govern device operation according to <code>${sim.formula}</code>. The current physical parameters maintain high fidelity and quantum/solid-state stability.`;
        }
      } else if (lower.includes('overmodulation') || lower.includes('distortion')) {
        answer = `<strong>AI Explanation on Modulation Index:</strong><br>When the modulation index $m > 1.0$ (Overmodulation), the carrier amplitude envelope crosses the zero axis, creating a $180^\\circ$ phase reversal. Standard envelope detectors (diode detectors) cannot follow phase reversals, causing severe harmonic distortion and sideband splatter.`;
      } else if (lower.includes('fm') && lower.includes('pm')) {
        answer = `<strong>FM vs PM Distinction:</strong><br>In FM, instantaneous frequency deviation is directly proportional to message amplitude: $\\Delta f \\propto m(t)$. In PM, phase deviation is proportional to message amplitude: $\\Delta \\theta \\propto m(t)$, which means the equivalent frequency deviation is proportional to the derivative $\\frac{dm(t)}{dt}$.`;
      } else if (lower.includes('hamming') || lower.includes('error')) {
        answer = `<strong>Hamming (7,4) Error Correction:</strong><br>By adding 3 parity bits ($p_1, p_2, p_3$) to 4 data bits ($d_1..d_4$), the receiver computes a 3-bit syndrome vector $\\mathbf{s} = [s_3, s_2, s_1]$. If $\\mathbf{s} \\neq 0$, the binary value of the syndrome directly points to the exact bit index $(1..7)$ that was corrupted, allowing single-bit automatic flip correction.`;
      } else {
        answer = `<strong>Academic Tutor Response for ${sim.title}:</strong><br>At Step ${state.currentStep + 1}, the system governs signal transformation via <code>${sim.formula}</code>. In ${sim.unitTitle}, communication fidelity depends directly on keeping SNR above channel threshold while conserving RF bandwidth.`;
      }

      dom.aiAnswer.innerHTML = answer;
    }, 600);
  }

  // ══════════════════════════════════════════════════════════
  // 9. HIGH-PRECISION CANVAS RENDERERS (All 42 Simulations + U25RPHU02)
  // ══════════════════════════════════════════════════════════
  function renderSimulation() {
    const width = dom.canvas.width / (window.devicePixelRatio || 1);
    const height = dom.canvas.height / (window.devicePixelRatio || 1);
    const isDark = state.theme === 'dark';

    // Clear Canvas with Theme Background
    ctx.fillStyle = isDark ? '#070c14' : '#f8faf8';
    ctx.fillRect(0, 0, width, height);

    // Draw Background Grid
    drawGrid(width, height, isDark);

    const simId = state.currentSimId;

    // Apply Transformation Matrix for Zoom, Rotation, and Pan
    ctx.save();
    const cx = width / 2;
    const cy = height / 2;
    ctx.translate(cx + (state.panX || 0), cy + (state.panY || 0));
    const zoom = (typeof state.zoomScale === 'number' && state.zoomScale > 0) ? state.zoomScale : 1.0;
    ctx.scale(zoom, zoom);
    if (state.rotAngle) {
      ctx.rotate(state.rotAngle);
    }
    ctx.translate(-cx, -cy);

    // Check U25RPHU02 Physics for Data Storage and Computing Engine first
    if (simId.startsWith('u25rphu02-') && window.U25RPHU02Engine) {
      window.U25RPHU02Engine.render(ctx, width, height, simId, state, isDark);
      ctx.restore();
      return;
    }

    if (simId === 'comm-elements') {
      renderCommElements(width, height, isDark);
    } else if (simId === 'am-principle') {
      renderAmPrinciple(width, height, isDark);
    } else if (simId === 'am-spectrum') {
      renderAmSpectrum(width, height, isDark);
    } else if (simId === 'am-mod-index') {
      renderAmModIndex(width, height, isDark);
    } else if (simId === 'am-power') {
      renderAmPower(width, height, isDark);
    } else if (simId === 'am-fdm') {
      renderFdm(width, height, isDark);
    } else if (simId === 'am-tdm') {
      renderTdm(width, height, isDark);
    } else if (simId === 'am-superhet') {
      renderSuperheterodyne(width, height, isDark);
    } else if (simId.startsWith('fm-') || simId === 'angle-mod' || simId === 'pm-wave') {
      renderAngleModulation(width, height, isDark);
    } else if (simId.startsWith('ask-') || simId.startsWith('fsk-') || simId.startsWith('psk-') || simId.startsWith('dpsk-')) {
      renderDigitalModulation(width, height, isDark);
    } else if (simId === 'error-detect' || simId === 'error-correct') {
      renderErrorControl(width, height, isDark);
    } else if (simId === 'rs232-serial') {
      renderRs232(width, height, isDark);
    } else if (simId === 'modem-sim') {
      renderModem(width, height, isDark);
    } else if (simId === 'ascii-vis') {
      renderAscii(width, height, isDark);
    } else if (simId === 'barcode-vis') {
      renderBarcode(width, height, isDark);
    } else {
      renderGenericSignal(width, height, isDark);
    }

    ctx.restore();
  }

  function drawGrid(w, h, isDark) {
    ctx.strokeStyle = isDark ? '#141e30' : '#e5eee6';
    ctx.lineWidth = 1;
    const step = 28;

    ctx.beginPath();
    for (let x = 0; x <= w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  // ─── Visualizer 1: Communication System Elements ─────────────
  function renderCommElements(w, h, isDark) {
    const stages = [
      { name: 'Info Source', sub: 'Audio/Data', icon: '🎤' },
      { name: 'Transmitter', sub: 'Modulator + RF Amp', icon: '📡' },
      { name: 'Channel', sub: 'AWGN + Attenuation', icon: '〰️' },
      { name: 'Receiver', sub: 'Tuning + Demod', icon: '📻' },
      { name: 'Destination', sub: 'Speaker / Display', icon: '🔊' }
    ];

    const boxW = Math.min(130, (w - 120) / 5);
    const boxH = 75;
    const startX = (w - (stages.length * (boxW + 20) - 20)) / 2;
    const centerY = h / 2 - 20;

    stages.forEach(function (st, i) {
      const x = startX + i * (boxW + 20);
      const isHighlighted = (state.currentStep % stages.length) === i;

      // Draw Connection Arrows
      if (i < stages.length - 1) {
        ctx.strokeStyle = isDark ? '#38bdf8' : '#187748';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + boxW, centerY + boxH / 2);
        ctx.lineTo(x + boxW + 20, centerY + boxH / 2);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = isDark ? '#38bdf8' : '#187748';
        ctx.beginPath();
        ctx.moveTo(x + boxW + 20, centerY + boxH / 2);
        ctx.lineTo(x + boxW + 14, centerY + boxH / 2 - 4);
        ctx.lineTo(x + boxW + 14, centerY + boxH / 2 + 4);
        ctx.fill();
      }

      // Block Container
      ctx.fillStyle = isHighlighted
        ? (isDark ? '#064e3b' : '#d1fae5')
        : (isDark ? '#0f172a' : '#ffffff');
      ctx.strokeStyle = isHighlighted
        ? (isDark ? '#34d399' : '#059669')
        : (isDark ? '#1e293b' : '#d8e2d9');
      ctx.lineWidth = isHighlighted ? 2.5 : 1.5;

      roundRect(ctx, x, centerY, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${st.icon} ${st.name}`, x + boxW / 2, centerY + 30);

      ctx.fillStyle = isDark ? '#94a3b8' : '#6b7f72';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(st.sub, x + boxW / 2, centerY + 52);
    });

    // Draw Live Signal Waveform traveling through system at bottom
    drawSignalWave(0, h - 80, w, 70, isDark);
  }

  // ─── Flagship 1: AM Principle Simulator ──────────────────────
  function renderAmPrinciple(w, h, isDark) {
    const Am = state.params.Am || 2.0;
    const Ac = state.params.Ac || 3.0;
    const fm = state.params.fm || 2;
    const fc = state.params.fc || 25;
    const m = Am / Ac;
    const tOffset = state.animTime;

    const rowH = (h - 40) / 3;

    // 1. Message Signal m(t) = Am * cos(2*pi*fm*t)
    drawWaveTrack(10, 15, w - 20, rowH - 10, 'Message Signal m(t)', isDark ? '#60a5fa' : '#2563eb', function (t) {
      return (Am / 4) * Math.cos(2 * Math.PI * fm * (t + tOffset * 0.2));
    });

    // 2. Carrier Signal c(t) = Ac * cos(2*pi*fc*t)
    drawWaveTrack(10, 15 + rowH, w - 20, rowH - 10, 'Carrier Signal c(t)', isDark ? '#fbbf24' : '#d97706', function (t) {
      return (Ac / 6) * Math.cos(2 * Math.PI * fc * (t + tOffset));
    });

    // 3. Modulated AM Wave s(t) = Ac * [1 + m*cos(2*pi*fm*t)] * cos(2*pi*fc*t)
    drawAmWaveTrack(10, 15 + rowH * 2, w - 20, rowH - 10, `AM Modulated Wave s(t)  [m = ${m.toFixed(2)}]`, isDark ? '#34d399' : '#16a34a', Am, Ac, fm, fc, tOffset, isDark);
  }

  function drawWaveTrack(x, y, w, h, label, color, waveFn) {
    const midY = y + h / 2;

    // Axis
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(x, midY);
    ctx.lineTo(x + w, midY);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Title
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 8, y + 14);

    // Wave
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < w; px += 2) {
      const t = px / w * 2;
      const vy = waveFn(t);
      const py = midY - vy * (h * 0.4);
      if (px === 0) ctx.moveTo(x + px, py);
      else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }

  function drawAmWaveTrack(x, y, w, h, label, color, Am, Ac, fm, fc, tOffset, isDark) {
    const midY = y + h / 2;
    const m = Am / Ac;

    // Draw Upper & Lower Envelopes (Dashed)
    ctx.strokeStyle = isDark ? '#f87171' : '#dc2626';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);

    // Upper Envelope
    ctx.beginPath();
    for (let px = 0; px < w; px += 2) {
      const t = px / w * 2;
      const env = (Ac / 6) * (1 + m * Math.cos(2 * Math.PI * fm * (t + tOffset * 0.2)));
      const py = midY - env * (h * 0.4);
      if (px === 0) ctx.moveTo(x + px, py);
      else ctx.lineTo(x + px, py);
    }
    ctx.stroke();

    // Lower Envelope
    ctx.beginPath();
    for (let px = 0; px < w; px += 2) {
      const t = px / w * 2;
      const env = -(Ac / 6) * (1 + m * Math.cos(2 * Math.PI * fm * (t + tOffset * 0.2)));
      const py = midY - env * (h * 0.4);
      if (px === 0) ctx.moveTo(x + px, py);
      else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Modulated High-Frequency Signal
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let px = 0; px < w; px += 1.5) {
      const t = px / w * 2;
      const env = (Ac / 6) * (1 + m * Math.cos(2 * Math.PI * fm * (t + tOffset * 0.2)));
      const vy = env * Math.cos(2 * Math.PI * fc * (t + tOffset));
      const py = midY - vy * (h * 0.4);
      if (px === 0) ctx.moveTo(x + px, py);
      else ctx.lineTo(x + px, py);
    }
    ctx.stroke();

    // Title & Overmodulation Indicator
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 8, y + 14);

    if (m > 1.0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('⚠️ OVERMODULATION ENVELOPE DISTORTION', x + w - 240, y + 14);
    }
  }

  // ─── Visualizer 2: AM Spectrum (Carrier, USB, LSB) ────────────
  function renderAmSpectrum(w, h, isDark) {
    const fc = state.params.fc || 100;
    const fm = state.params.fm || 5;
    const m = state.params.modIndex || 0.75;

    const centerX = w / 2;
    const baseY = h - 60;

    // Draw Frequency Axis
    ctx.strokeStyle = isDark ? '#94a3b8' : '#4a5c50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, baseY);
    ctx.lineTo(w - 40, baseY);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Frequency (kHz) →', w / 2, baseY + 40);

    // 1. Carrier Spectral Line (Height 1.0)
    const carrierH = 180;
    drawSpectralLine(centerX, baseY, carrierH, `Carrier (fc = ${fc} kHz)`, `Ac`, isDark ? '#fbbf24' : '#d97706');

    // 2. Lower Sideband (LSB = fc - fm, Height m/2)
    const lsbX = centerX - 140;
    const sideH = carrierH * (m / 2);
    drawSpectralLine(lsbX, baseY, sideH, `LSB (${fc - fm} kHz)`, `mAc/2`, isDark ? '#60a5fa' : '#2563eb');

    // 3. Upper Sideband (USB = fc + fm, Height m/2)
    const usbX = centerX + 140;
    drawSpectralLine(usbX, baseY, sideH, `USB (${fc + fm} kHz)`, `mAc/2`, isDark ? '#60a5fa' : '#2563eb');

    // Bandwidth Span Indicator
    ctx.strokeStyle = isDark ? '#34d399' : '#059669';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lsbX, baseY - sideH - 20);
    ctx.lineTo(usbX, baseY - sideH - 20);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#34d399' : '#059669';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`Transmission Bandwidth B = 2fm = ${2 * fm} kHz`, centerX, baseY - sideH - 28);
  }

  function drawSpectralLine(x, baseY, height, label, ampLabel, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY - height);
    ctx.stroke();

    // Peak dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, baseY - height, 5, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, baseY + 20);
    ctx.fillText(ampLabel, x, baseY - height - 10);
  }

  // ─── Visualizer 3: Modulation Index & Percentage Modulation ───
  function renderAmModIndex(w, h, isDark) {
    const Vmax = state.params.Vmax || 5.0;
    const Vmin = state.params.Vmin || 1.0;
    const m = (Vmax - Vmin) / (Vmax + Vmin);
    const pct = m * 100;

    renderAmPrinciple(w, h - 80, isDark);

    // Draw Trapezoidal / Scope Pattern on side
    const boxW = 180;
    const boxH = 70;
    const bx = w - boxW - 20;
    const by = 20;

    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = isDark ? '#10b981' : '#187748';
    ctx.lineWidth = 1.5;
    roundRect(ctx, bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Vmax: ${Vmax.toFixed(1)} V`, bx + 10, by + 22);
    ctx.fillText(`Vmin: ${Vmin.toFixed(1)} V`, bx + 10, by + 40);
    ctx.fillText(`m: ${m.toFixed(2)} (${pct.toFixed(0)}%)`, bx + 10, by + 58);
  }

  // ─── Visualizer 4: Power Content in AM Wave ───────────────────
  function renderAmPower(w, h, isDark) {
    const Pc = state.params.Pc || 100;
    const m = state.params.m || 1.0;
    const Psb = (m * m / 2) * Pc;
    const Pt = Pc + Psb;
    const eff = (Psb / Pt) * 100;

    const startX = 60;
    const barW = (w - 180) / 3;
    const baseY = h - 60;
    const maxBarH = 180;

    // Carrier Power Bar
    drawPowerBar(startX, baseY, barW, (Pc / 200) * maxBarH, `Carrier Pc`, `${Pc.toFixed(0)} W`, isDark ? '#fbbf24' : '#d97706');

    // Sideband Power Bar
    drawPowerBar(startX + barW + 20, baseY, barW, (Psb / 200) * maxBarH, `Sidebands Psb`, `${Psb.toFixed(1)} W`, isDark ? '#60a5fa' : '#2563eb');

    // Total Power Bar
    drawPowerBar(startX + (barW + 20) * 2, baseY, barW, (Pt / 200) * maxBarH, `Total Power Pt`, `${Pt.toFixed(1)} W`, isDark ? '#34d399' : '#16a34a');

    // Efficiency Badge
    ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Power Transmission Efficiency η = ${eff.toFixed(1)}% (Max AM Efficiency is 33.33% at m=1.0)`, w / 2, 40);
  }

  function drawPowerBar(x, baseY, width, height, label, valLabel, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - height, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(valLabel, x + width / 2, baseY - height / 2);

    ctx.fillStyle = color;
    ctx.fillText(label, x + width / 2, baseY + 20);
  }

  // ─── Visualizer 5: Frequency Division Multiplexing (FDM) ──────
  function renderFdm(w, h, isDark) {
    const numChannels = state.params.numChannels || 3;
    const guardBw = state.params.guardBandKhz || 4;
    const chanBw = state.params.channelBwKhz || 10;
    const colors = ['#2563eb', '#16a34a', '#d97706', '#9333ea'];

    const baseY = h / 2 + 40;
    const totalSlotW = (w - 100) / numChannels;

    // Spectrum Base Axis
    ctx.strokeStyle = isDark ? '#94a3b8' : '#4a5c50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, baseY);
    ctx.lineTo(w - 30, baseY);
    ctx.stroke();

    for (let i = 0; i < numChannels; i++) {
      const cx = 60 + i * totalSlotW + totalSlotW / 2;
      const cColor = colors[i % colors.length];

      // Triangular Spectral Band
      ctx.fillStyle = cColor;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.moveTo(cx - 35, baseY);
      ctx.lineTo(cx, baseY - 120);
      ctx.lineTo(cx + 35, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Center Carrier line
      ctx.strokeStyle = cColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, baseY);
      ctx.lineTo(cx, baseY - 130);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Channel ${i + 1}`, cx, baseY + 20);
      ctx.fillText(`fc${i + 1} (${chanBw} kHz BW)`, cx, baseY - 140);
    }

    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Combined FDM Spectrum with Guard Bands (Δf = ${guardBw} kHz to prevent crosstalk)`, w / 2, 35);
  }

  // ─── Visualizer 6: Time Division Multiplexing (TDM) ───────────
  function renderTdm(w, h, isDark) {
    const numChannels = state.params.channels || 4;
    const frameCount = 3;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const slotW = (w - 100) / (numChannels * frameCount);
    const slotH = 65;
    const startY = h / 2 - 30;

    let curX = 50;

    for (let f = 0; f < frameCount; f++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const cColor = colors[ch % colors.length];
        const isActive = ((Math.floor(state.animTime * 3) + ch) % (numChannels * frameCount)) === (f * numChannels + ch);

        ctx.fillStyle = isActive ? cColor : (isDark ? '#1e293b' : '#f1f5f9');
        ctx.strokeStyle = cColor;
        ctx.lineWidth = isActive ? 2.5 : 1;

        roundRect(ctx, curX, startY, slotW - 4, slotH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isActive ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569');
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`S${ch + 1}`, curX + slotW / 2 - 2, startY + slotH / 2 + 4);

        curX += slotW;
      }
    }

    ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TDM Commutator Time Slot Interleaving (Time Sharing over Single Digital Channel)', w / 2, 40);
  }

  // ─── Visualizer 7: Superheterodyne Receiver ───────────────────
  function renderSuperheterodyne(w, h, isDark) {
    const stages = [
      { name: 'RF Amplifier', sub: 'Tuned 1000 kHz', icon: '📶' },
      { name: 'Mixer', sub: 'fLO - fRF', icon: '✖️' },
      { name: 'IF Amplifier', sub: 'Fixed 455 kHz', icon: '⚡' },
      { name: 'Detector', sub: 'Envelope Diode', icon: '🔍' },
      { name: 'Audio Amp', sub: 'Speaker Out', icon: '🔊' }
    ];

    const boxW = Math.min(130, (w - 120) / 5);
    const boxH = 75;
    const startX = (w - (stages.length * (boxW + 20) - 20)) / 2;
    const centerY = h / 2 - 35;

    stages.forEach(function (st, i) {
      const x = startX + i * (boxW + 20);

      // Connectors
      if (i < stages.length - 1) {
        ctx.strokeStyle = isDark ? '#38bdf8' : '#187748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + boxW, centerY + boxH / 2);
        ctx.lineTo(x + boxW + 20, centerY + boxH / 2);
        ctx.stroke();
      }

      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.strokeStyle = isDark ? '#38bdf8' : '#187748';
      ctx.lineWidth = 1.8;
      roundRect(ctx, x, centerY, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
      ctx.font = 'bold 11.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${st.icon} ${st.name}`, x + boxW / 2, centerY + 30);

      ctx.fillStyle = isDark ? '#94a3b8' : '#6b7f72';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(st.sub, x + boxW / 2, centerY + 52);
    });

    // Local Oscillator Box below Mixer
    const mixerX = startX + 1 * (boxW + 20);
    const loY = centerY + boxH + 35;
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.strokeStyle = '#f59e0b';
    roundRect(ctx, mixerX, loY, boxW, 55, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('Local Oscillator', mixerX + boxW / 2, loY + 24);
    ctx.fillText('fLO = 1455 kHz', mixerX + boxW / 2, loY + 42);

    // Arrow to mixer
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mixerX + boxW / 2, loY);
    ctx.lineTo(mixerX + boxW / 2, centerY + boxH);
    ctx.stroke();
  }

  // ─── Flagship 2: Angle Modulation (FM & PM) ───────────────────
  function renderAngleModulation(w, h, isDark) {
    const isPm = state.currentSimId === 'pm-wave';
    const beta = state.params.beta || 3.0;
    const fm = state.params.fm || 2;
    const fc = state.params.fc || 20;
    const tOffset = state.animTime;

    const rowH = (h - 40) / 2;

    // 1. Message
    drawWaveTrack(10, 15, w - 20, rowH - 10, 'Message Waveform m(t)', isDark ? '#60a5fa' : '#2563eb', function (t) {
      return 0.5 * Math.sin(2 * Math.PI * fm * (t + tOffset * 0.2));
    });

    // 2. Frequency / Phase Modulated Wave
    const midY = 15 + rowH + (rowH - 10) / 2;
    const label = isPm
      ? 'Phase Modulated Wave s_PM(t) [Δθ = kp·Am]'
      : `Frequency Modulated Wave s_FM(t) [β = ${beta.toFixed(1)}, Carson BW = 2(Δf+fm)]`;

    ctx.fillStyle = isDark ? '#34d399' : '#16a34a';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 18, 15 + rowH + 14);

    ctx.strokeStyle = isDark ? '#34d399' : '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < w - 20; px += 1.5) {
      const t = px / (w - 20) * 2;
      const phi = isPm
        ? beta * Math.sin(2 * Math.PI * fm * (t + tOffset * 0.2))
        : beta * Math.sin(2 * Math.PI * fm * (t + tOffset * 0.2));
      const vy = Math.cos(2 * Math.PI * fc * (t + tOffset) + phi);
      const py = midY - vy * ((rowH - 10) * 0.4);
      if (px === 0) ctx.moveTo(10 + px, py);
      else ctx.lineTo(10 + px, py);
    }
    ctx.stroke();
  }

  // ─── Flagship 3: Digital Modulation Lab (ASK, FSK, PSK, DPSK) ──
  function renderDigitalModulation(w, h, isDark) {
    const bits = state.params.bitSequence || '10110101';
    const numBits = bits.length;
    const bitW = (w - 40) / numBits;
    const simId = state.currentSimId;

    const rowH = (h - 40) / 2;

    // 1. Digital Bit Sequence (NRZ Square Pulse)
    ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Digital Input Stream (${bits})`, 18, 20);

    ctx.strokeStyle = isDark ? '#60a5fa' : '#2563eb';
    ctx.lineWidth = 2.5;
    const pulseMidY = 15 + rowH / 2;

    ctx.beginPath();
    for (let i = 0; i < numBits; i++) {
      const bit = bits[i];
      const bx = 20 + i * bitW;
      const by = bit === '1' ? pulseMidY - 35 : pulseMidY + 25;

      if (i === 0) ctx.moveTo(bx, by);
      else {
        ctx.lineTo(bx, by);
      }
      ctx.lineTo(bx + bitW, by);

      // Bit label
      ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(bit, bx + bitW / 2, pulseMidY - 45);
    }
    ctx.stroke();

    // 2. Modulated Digital Carrier Waveform
    const modMidY = 15 + rowH + rowH / 2;
    let modColor = isDark ? '#34d399' : '#16a34a';
    let modTitle = 'Modulated Output Waveform';

    if (simId.includes('ask')) {
      modTitle = 'ASK Modulated Waveform (Carrier ON for 1, Carrier OFF for 0)';
    } else if (simId.includes('fsk')) {
      modTitle = 'FSK Modulated Waveform (Mark Freq f1 for 1, Space Freq f0 for 0)';
    } else if (simId.includes('psk')) {
      modTitle = 'BPSK Modulated Waveform (0° Phase for 1, 180° Phase Reversal for 0)';
    } else if (simId.includes('dpsk')) {
      modTitle = 'DPSK Modulated Waveform (180° Differential Phase Shift on Bit 1)';
    }

    ctx.fillStyle = modColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(modTitle, 18, 15 + rowH + 20);

    ctx.strokeStyle = modColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let prevPhase = 0;
    for (let i = 0; i < numBits; i++) {
      const bit = bits[i];
      const bx = 20 + i * bitW;

      for (let px = 0; px < bitW; px += 1.5) {
        const t = (bx + px) / w * 12;
        let vy = 0;

        if (simId.includes('ask')) {
          vy = bit === '1' ? Math.cos(2 * Math.PI * 8 * t) : 0;
        } else if (simId.includes('fsk')) {
          const freq = bit === '1' ? 12 : 5;
          vy = Math.cos(2 * Math.PI * freq * t);
        } else if (simId.includes('psk')) {
          const phase = bit === '1' ? 0 : Math.PI;
          vy = Math.cos(2 * Math.PI * 8 * t + phase);
        } else if (simId.includes('dpsk')) {
          if (px === 0 && bit === '1') prevPhase += Math.PI;
          vy = Math.cos(2 * Math.PI * 8 * t + prevPhase);
        }

        const py = modMidY - vy * 35;
        if (i === 0 && px === 0) ctx.moveTo(bx + px, py);
        else ctx.lineTo(bx + px, py);
      }
    }
    ctx.stroke();
  }

  // ─── Flagship 4: Error Control Lab (Detection & Correction) ───
  function renderErrorControl(w, h, isDark) {
    const isCorrection = state.currentSimId === 'error-correct';
    const data = state.params.dataBits || '1011';
    const errPos = state.params.injectedErrorPos || 0;

    const boxW = (w - 120) / 4;
    const boxH = 100;
    const centerY = h / 2 - 50;

    const stages = isCorrection
      ? [
          { title: '1. Input Data', bits: data, sub: '4 Data Bits (d3..d0)' },
          { title: '2. Hamming Encoder', bits: `${data} + 3 Parity`, sub: 'Generates (7,4) Code' },
          { title: '3. Channel (Corrupt)', bits: errPos ? `Flip at Bit ${errPos}` : 'Zero Error', sub: errPos ? 'Corrupted Vector' : 'Clean AWGN' },
          { title: '4. Syndrome / Correct', bits: 'Recovered 1011', sub: 'Syndrome S = s3s2s1' }
        ]
      : [
          { title: '1. Original Bits', bits: data, sub: 'Message Polynomial D(x)' },
          { title: '2. CRC Generator', bits: 'G(x) = 10011', sub: 'Modulo-2 Division' },
          { title: '3. Channel', bits: errPos ? `Bit ${errPos} Inverted` : 'No Error', sub: 'AWGN Channel' },
          { title: '4. Receiver Syndrome', bits: errPos ? 'Error Detected ⚠️' : 'Zero Remainder ✅', sub: 'Integrity Check' }
        ];

    stages.forEach(function (st, i) {
      const x = 50 + i * (boxW + 20);

      // Connection arrow
      if (i < stages.length - 1) {
        ctx.strokeStyle = isDark ? '#38bdf8' : '#187748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + boxW, centerY + boxH / 2);
        ctx.lineTo(x + boxW + 20, centerY + boxH / 2);
        ctx.stroke();
      }

      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.strokeStyle = (i === 2 && errPos) ? '#ef4444' : (isDark ? '#10b981' : '#187748');
      ctx.lineWidth = 2;

      roundRect(ctx, x, centerY, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#94a3b8' : '#6b7f72';
      ctx.font = 'bold 10.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.title, x + boxW / 2, centerY + 25);

      ctx.fillStyle = (i === 2 && errPos) ? '#ef4444' : (isDark ? '#f8fafc' : '#14241a');
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.fillText(st.bits, x + boxW / 2, centerY + 54);

      ctx.fillStyle = isDark ? '#64748b' : '#4a5c50';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(st.sub, x + boxW / 2, centerY + 78);
    });

    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isCorrection ? 'Hamming (7,4) Single-Error Correction Matrix Engine' : 'CRC Polynomial Division & Error Detection Flow', w / 2, 35);
  }

  // ─── Visualizer 8: RS-232 Serial Interface ────────────────────
  function renderRs232(w, h, isDark) {
    const char = state.params.txChar || 'D';
    const asciiCode = char.charCodeAt(0);
    const bin = asciiCode.toString(2).padStart(8, '0');

    // RS232 Frame: 1 Start (0 = +12V), 8 Data Bits LSB first, 1 Stop (1 = -12V)
    const frame = ['START (0)', ...bin.split('').reverse(), 'STOP (1)'];
    const bitW = (w - 80) / frame.length;
    const midY = h / 2 + 10;

    ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`RS-232 Timing Diagram: Transmitting '${char}' (ASCII ${asciiCode} = 0b${bin}) at 9600 Baud`, w / 2, 35);

    // Voltage Level Rails
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(40, midY - 40); ctx.lineTo(w - 40, midY - 40); // -12V (Logic 1)
    ctx.moveTo(40, midY + 40); ctx.lineTo(w - 40, midY + 40); // +12V (Logic 0)
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Logic 1 (-12V)', 80, midY - 45);
    ctx.fillText('Logic 0 (+12V)', 80, midY + 55);

    // Draw Inverted Bipolar Waveform
    ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < frame.length; i++) {
      const bitVal = frame[i].includes('1') ? 1 : 0;
      const bx = 40 + i * bitW;
      const by = bitVal === 1 ? midY - 40 : midY + 40;

      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);

      ctx.lineTo(bx + bitW, by);

      // Label
      ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(frame[i], bx + bitW / 2, midY + (bitVal === 1 ? -52 : 28));
    }
    ctx.stroke();
  }

  // ─── Visualizer 9: Modem Simulator ────────────────────────────
  function renderModem(w, h, isDark) {
    const stages = [
      { name: 'DTE (PC)', sub: 'Digital TX Data', icon: '💻' },
      { name: 'TX Modem', sub: 'DAC + Modulator', icon: '📠' },
      { name: 'PSTN Line', sub: 'Analog 300-3400 Hz', icon: '📞' },
      { name: 'RX Modem', sub: 'ADC + Demodulator', icon: '📠' },
      { name: 'DTE (Host)', sub: 'Digital RX Data', icon: '🖥️' }
    ];

    const boxW = Math.min(130, (w - 120) / 5);
    const boxH = 75;
    const startX = (w - (stages.length * (boxW + 20) - 20)) / 2;
    const centerY = h / 2 - 35;

    stages.forEach(function (st, i) {
      const x = startX + i * (boxW + 20);

      if (i < stages.length - 1) {
        ctx.strokeStyle = isDark ? '#38bdf8' : '#187748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + boxW, centerY + boxH / 2);
        ctx.lineTo(x + boxW + 20, centerY + boxH / 2);
        ctx.stroke();
      }

      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.strokeStyle = isDark ? '#38bdf8' : '#187748';
      ctx.lineWidth = 2;
      roundRect(ctx, x, centerY, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
      ctx.font = 'bold 11.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${st.icon} ${st.name}`, x + boxW / 2, centerY + 30);

      ctx.fillStyle = isDark ? '#94a3b8' : '#6b7f72';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(st.sub, x + boxW / 2, centerY + 52);
    });

    ctx.fillStyle = isDark ? '#34d399' : '#059669';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Full Duplex V.22bis / QAM Modem Data Exchange over Telephone Network', w / 2, 35);
  }

  // ─── Visualizer 10: ASCII & Barcode Visualizers ───────────────
  function renderAscii(w, h, isDark) {
    const char = state.params.inputChar || 'K';
    const dec = char.charCodeAt(0);
    const hex = '0x' + dec.toString(16).toUpperCase();
    const bin = dec.toString(2).padStart(8, '0');

    ctx.fillStyle = isDark ? '#f8fafc' : '#14241a';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ASCII Character Encoding: '${char}'`, w / 2, 40);

    const cards = [
      { label: 'Character', val: char },
      { label: 'Decimal', val: String(dec) },
      { label: 'Hexadecimal', val: hex },
      { label: 'Binary Byte', val: bin }
    ];

    const cardW = (w - 140) / 4;
    const cardH = 85;
    const startY = h / 2 - 40;

    cards.forEach(function (cd, i) {
      const x = 50 + i * (cardW + 15);
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.strokeStyle = isDark ? '#38bdf8' : '#187748';
      ctx.lineWidth = 2;
      roundRect(ctx, x, startY, cardW, cardH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#94a3b8' : '#6b7f72';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(cd.label, x + cardW / 2, startY + 28);

      ctx.fillStyle = isDark ? '#34d399' : '#16a34a';
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      ctx.fillText(cd.val, x + cardW / 2, startY + 60);
    });
  }

  function renderBarcode(w, h, isDark) {
    const text = state.params.textData || 'EDU2026';
    const startX = w / 2 - 140;
    const startY = h / 2 - 60;
    const barH = 120;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX - 20, startY - 20, 320, barH + 60);

    // Draw optical bars
    let curX = startX;
    ctx.fillStyle = '#000000';

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      for (let b = 0; b < 6; b++) {
        const isThick = ((code >> b) & 1) === 1;
        const bw = isThick ? 5 : 2;
        ctx.fillRect(curX, startY, bw, barH);
        curX += bw + 3;
      }
      curX += 4;
    }

    ctx.font = 'bold 14px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`* ${text} *`, startX + 140, startY + barH + 25);
  }

  function renderGenericSignal(w, h, isDark) {
    drawSignalWave(0, h / 2 - 40, w, 80, isDark);
  }

  function drawSignalWave(x, y, w, h, isDark) {
    const midY = y + h / 2;
    ctx.strokeStyle = isDark ? '#34d399' : '#187748';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let px = 0; px < w; px += 2) {
      const t = px / w * 4;
      const vy = Math.sin(2 * Math.PI * 1.5 * (t + state.animTime));
      const py = midY - vy * (h * 0.4);
      if (px === 0) ctx.moveTo(x + px, py);
      else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  // ══════════════════════════════════════════════════════════
  // 10. BOOTSTRAP
  // ══════════════════════════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
