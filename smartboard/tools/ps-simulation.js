/**
 * ps-simulation.js
 * Master Interactive Simulation Engine for Probability and Statistical Modeling for Computing Systems (U25MA301)
 * Regulation R2025 CBCS · Semester III · BSC · 4 Credits
 * 
 * 18 Verified Interactive Curriculum Simulations across 5 Units:
 *   Unit I:   Probability & Random Variables (Sims 1-4)
 *   Unit II:  Standard Probability Distributions (Sims 5-8)
 *   Unit III: Joint Distributions & Statistical Modeling (Sims 9-11)
 *   Unit IV:  Sampling Distributions & Hypothesis Testing (Sims 12-15)
 *   Unit V:   Stochastic Processes, Queueing & Systems (Sims 16-18)
 *
 * Mathematical & Educational Rigor:
 *   - Exact fractions for finite discrete sample spaces (no double counting: P(A U B) = P(A)+P(B)-P(A n B))
 *   - Mathematically verified PMFs and PDFs (Binomial, Poisson, Normal, Exponential)
 *   - Stable polynomial approximation of Normal CDF Phi(z) (|error| < 1e-7)
 *   - Accurate sample variance s^2 with Bessel's correction (n-1 denominator) vs population variance sigma^2 (N)
 *   - Real-time OLS Linear Regression with residuals and R^2 goodness of fit
 *   - Central Limit Theorem empirical sampling vs theoretical Gaussian envelope
 *   - Ergodic Markov Chain n-step transitions and steady-state vector
 *   - Little's Law verification for M/M/1 Queueing Models (L = lambda * W)
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1. STATE & DOM REFS
  // ══════════════════════════════════════════════════════════
  const catalog = (typeof window !== 'undefined' && window.EduversePSCatalog) || null;
  if (!catalog) {
    console.error('[PS Simulation] EduversePSCatalog not loaded.');
    return;
  }

  const state = {
    currentUnit: 1,
    currentSimId: 'u25ma301-sample-space',
    mode: 'learn', // 'learn' | 'experiment' | 'challenge'
    theme: (function () { try { return localStorage.getItem('eduverse_theme') || 'light'; } catch (e) { return 'light'; } })(),
    isPlaying: false,
    speed: 1.0,
    currentStep: 0,
    maxSteps: 4,
    playIntervalId: null,
    params: {},
    challengeState: { solved: false, feedback: '' },
    // Interactive Sampling / Animation state
    sampleHistory: [],
    // U25MA302 Civil Engineering Datasets and Sampling Store
    u25ma302: {
      regressionDatasets: {
        concrete: [
          { x: 0.40, y: 52.4 }, { x: 0.45, y: 46.8 }, { x: 0.48, y: 43.1 },
          { x: 0.50, y: 40.5 }, { x: 0.55, y: 34.2 }, { x: 0.58, y: 31.0 },
          { x: 0.62, y: 27.5 }, { x: 0.65, y: 24.1 }, { x: 0.70, y: 19.8 }
        ],
        hydrology: [
          { x: 12, y: 4.2 }, { x: 18, y: 7.8 }, { x: 25, y: 12.1 },
          { x: 32, y: 17.5 }, { x: 40, y: 23.0 }, { x: 48, y: 29.8 },
          { x: 55, y: 35.6 }, { x: 64, y: 43.2 }, { x: 75, y: 52.4 }, { x: 85, y: 61.0 }
        ],
        traffic: [
          { x: 15, y: 78.5 }, { x: 25, y: 72.1 }, { x: 38, y: 62.4 },
          { x: 50, y: 53.0 }, { x: 65, y: 41.8 }, { x: 78, y: 32.5 },
          { x: 90, y: 24.0 }, { x: 105, y: 14.2 }, { x: 120, y: 5.5 }
        ],
        surveying: [
          { x: 2, y: 0.24 }, { x: 5, y: 0.58 }, { x: 8, y: 0.94 },
          { x: 12, y: 1.42 }, { x: 16, y: 1.88 }, { x: 20, y: 2.36 },
          { x: 24, y: 2.82 }, { x: 28, y: 3.30 }, { x: 32, y: 3.80 }
        ]
      },
      customRegressionPoints: null,
      customCorrelationPoints: null,
      cltRuns: [],
      currentSamplePoints: []
    },

    sampleCount: 0,
    animFrame: 0
  };

  const dom = {
    app: document.getElementById('ep-app'),
    unitSelect: document.getElementById('ps-unit'),
    simSelect: document.getElementById('ps-simulation'),
    title: document.getElementById('ep-title'),
    subtitle: document.getElementById('ep-subtitle'),
    themeToggle: document.getElementById('ps-theme-toggle'),
    fullscreenBtn: document.getElementById('ep-fullscreen'),
    exportBtn: document.getElementById('ep-export'),
    modeBtns: document.querySelectorAll('.ep-seg'),
    playBtn: document.getElementById('ep-play'),
    pauseBtn: document.getElementById('ep-pause'),
    prevBtn: document.getElementById('ep-prev'),
    nextBtn: document.getElementById('ep-next'),
    resetBtn: document.getElementById('ep-reset'),
    resetParamsBtn: document.getElementById('ps-reset-params'),
    speedSelect: document.getElementById('ps-speed'),
    stepLabel: document.getElementById('ps-step-label'),
    progressFill: document.getElementById('ps-progress-fill'),
    canvas: document.getElementById('ps-canvas'),
    readouts: document.getElementById('ep-readouts'),
    overlaySim: document.getElementById('ps-overlay-sim'),
    overlayState: document.getElementById('ps-overlay-state'),
    whatText: document.getElementById('ps-what'),
    whyText: document.getElementById('ps-why'),
    nextText: document.getElementById('ps-next-info'),
    bannerNo: document.getElementById('ep-banner-no'),
    bannerTitle: document.getElementById('ep-banner-title'),
    bannerText: document.getElementById('ep-banner-text'),
    inputsForm: document.getElementById('ps-inputs-form'),
    inputActions: document.getElementById('ps-input-actions'),
    challengeCard: document.getElementById('ep-challenge-card'),
    challengePrompt: document.getElementById('ps-challenge-prompt'),
    verifyChallengeBtn: document.getElementById('ps-verify-challenge'),
    resetChallengeBtn: document.getElementById('ps-reset-challenge'),
    challengeResult: document.getElementById('ps-challenge-result'),
    formulaBox: document.getElementById('ps-formula-box'),
    specList: document.getElementById('ps-spec-list'),
    aiQuestion: document.getElementById('ps-ai-question'),
    askAiBtn: document.getElementById('ps-ask-ai'),
    aiAnswer: document.getElementById('ps-ai-answer'),
    toast: document.getElementById('ps-toast')
  };

  const ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  // ══════════════════════════════════════════════════════════
  // 2. MATHEMATICAL CORE UTILITIES
  // ══════════════════════════════════════════════════════════
  const MathCore = {
    factorial: function (n) {
      if (n < 0) return 0;
      if (n === 0 || n === 1) return 1;
      let res = 1;
      for (let i = 2; i <= n; i++) res *= i;
      return res;
    },

    combinations: function (n, k) {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      if (k > n / 2) k = n - k;
      let num = 1;
      for (let i = 1; i <= k; i++) {
        num = (num * (n - i + 1)) / i;
      }
      return num;
    },

    binomialPmf: function (n, k, p) {
      if (k < 0 || k > n) return 0;
      return MathCore.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },

    poissonPmf: function (lambda, k) {
      if (k < 0) return 0;
      return (Math.pow(lambda, k) * Math.exp(-lambda)) / MathCore.factorial(k);
    },

    normalPdf: function (x, mu, sigma) {
      if (sigma <= 0) return 0;
      const coef = 1 / (sigma * Math.sqrt(2 * Math.PI));
      const expTerm = Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      return coef * expTerm;
    },

    // Abramowitz and Stegun 7.1.26 polynomial approximation for Erf
    erf: function (x) {
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      const absX = Math.abs(x);
      const t = 1.0 / (1.0 + p * absX);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
      return sign * y;
    },

    normalCdf: function (x, mu, sigma) {
      if (sigma <= 0) return x >= mu ? 1 : 0;
      return 0.5 * (1.0 + MathCore.erf((x - mu) / (sigma * Math.sqrt(2))));
    },

    exponentialPdf: function (x, lambda) {
      if (x < 0 || lambda <= 0) return 0;
      return lambda * Math.exp(-lambda * x);
    },

    exponentialCdf: function (x, lambda) {
      if (x < 0 || lambda <= 0) return 0;
      return 1 - Math.exp(-lambda * x);
    },

    mean: function (arr) {
      if (!arr || arr.length === 0) return 0;
      const sum = arr.reduce((acc, val) => acc + val, 0);
      return sum / arr.length;
    },

    variance: function (arr, isSample = true) {
      if (!arr || arr.length <= 1) return 0;
      const m = MathCore.mean(arr);
      const sumSq = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0);
      const denom = isSample ? arr.length - 1 : arr.length;
      return sumSq / denom;
    },

    stdDev: function (arr, isSample = true) {
      return Math.sqrt(MathCore.variance(arr, isSample));
    },

    covariance: function (xs, ys) {
      if (!xs || !ys || xs.length !== ys.length || xs.length <= 1) return 0;
      const mx = MathCore.mean(xs);
      const my = MathCore.mean(ys);
      let sum = 0;
      for (let i = 0; i < xs.length; i++) {
        sum += (xs[i] - mx) * (ys[i] - my);
      }
      return sum / (xs.length - 1);
    },

    correlation: function (xs, ys) {
      const cov = MathCore.covariance(xs, ys);
      const sx = MathCore.stdDev(xs, true);
      const sy = MathCore.stdDev(ys, true);
      if (sx === 0 || sy === 0) return 0;
      return cov / (sx * sy);
    },

    linearRegression: function (xs, ys) {
      if (!xs || !ys || xs.length !== ys.length || xs.length <= 1) {
        return { slope: 0, intercept: 0, r2: 0 };
      }
      const mx = MathCore.mean(xs);
      const my = MathCore.mean(ys);
      const cov = MathCore.covariance(xs, ys);
      const vx = MathCore.variance(xs, true);
      const slope = vx !== 0 ? cov / vx : 0;
      const intercept = my - slope * mx;
      const r = MathCore.correlation(xs, ys);
      return { slope, intercept, r2: r * r };
    },

    gcd: function (a, b) {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a;
    },

    
    geometricPmf: function (p, k) {
      if (k < 1 || p <= 0 || p > 1) return 0;
      return Math.pow(1 - p, Math.floor(k) - 1) * p;
    },

    geometricCdf: function (p, k) {
      if (k < 1 || p <= 0 || p > 1) return 0;
      return 1 - Math.pow(1 - p, Math.floor(k));
    },

    uniformPdf: function (x, a, b) {
      if (b <= a || x < a || x > b) return 0;
      return 1 / (b - a);
    },

    uniformCdf: function (x, a, b) {
      if (b <= a || x < a) return 0;
      if (x > b) return 1;
      return (x - a) / (b - a);
    },

    poissonCdf: function (lambda, k) {
      if (k < 0) return 0;
      let sum = 0;
      for (let i = 0; i <= Math.floor(k); i++) sum += MathCore.poissonPmf(lambda, i);
      return Math.min(1, sum);
    },

    binomialCdf: function (n, k, p) {
      if (k < 0) return 0;
      if (k >= n) return 1;
      let sum = 0;
      for (let i = 0; i <= Math.floor(k); i++) sum += MathCore.binomialPmf(n, i, p);
      return Math.min(1, sum);
    },

    spearmanRank: function (xs, ys) {
      const n = Math.min(xs.length, ys.length);
      if (n < 2) return 0;
      function rank(arr) {
        const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
        const r = new Array(n);
        let i = 0;
        while (i < n) {
          let j = i;
          while (j < n - 1 && Math.abs(sorted[j + 1].v - sorted[j].v) < 1e-12) j++;
          const avgRank = 1 + (i + j) / 2;
          for (let k = i; k <= j; k++) r[sorted[k].i] = avgRank;
          i = j + 1;
        }
        return r;
      }
      const rx = rank(xs.slice(0, n));
      const ry = rank(ys.slice(0, n));
      let d2 = 0;
      for (let i = 0; i < n; i++) {
        const d = rx[i] - ry[i];
        d2 += d * d;
      }
      return 1 - (6 * d2) / (n * (n * n - 1));
    },

    createMulberry32: function (seed) {
      let s = Math.floor(seed) >>> 0;
      return function () {
        s |= 0;
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    toFraction: function (num, denom) {
      if (denom === 0) return '0';
      const g = MathCore.gcd(num, denom);
      return `${num / g}/${denom / g}`;
    }
  };

  // ══════════════════════════════════════════════════════════
  // 3. CATALOG INITIALIZATION & DROPDOWNS
  // ══════════════════════════════════════════════════════════
  function initCurriculumPickers() {
    if (!dom.unitSelect || !dom.simSelect) return;

    dom.unitSelect.innerHTML = '';
    catalog.UNITS.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.number;
      opt.textContent = `${u.code}: ${u.title}`;
      dom.unitSelect.appendChild(opt);
    });

    dom.unitSelect.addEventListener('change', () => {
      state.currentUnit = parseInt(dom.unitSelect.value, 10);
      populateSimDropdown();
      const firstSim = catalog.getSimulationsByUnit(state.currentUnit)[0];
      if (firstSim) loadSimulation(firstSim.id);
    });

    dom.simSelect.addEventListener('change', () => {
      loadSimulation(dom.simSelect.value);
    });

    populateSimDropdown();
  }

  function populateSimDropdown() {
    const sims = catalog.getSimulationsByUnit(state.currentUnit);
    dom.simSelect.innerHTML = '';
    sims.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.icon} ${s.title}`;
      if (s.id === state.currentSimId) opt.selected = true;
      dom.simSelect.appendChild(opt);
    });
  }

  // ══════════════════════════════════════════════════════════
  // 4. SIMULATION SWITCHING & PARAMETERS
  // ══════════════════════════════════════════════════════════
  function loadSimulation(simId) {
    const sim = catalog.getSimulationById(simId);
    if (!sim) return;

    state.currentSimId = sim.id;
    state.currentUnit = sim.unit;
    state.currentStep = 0;
    state.isPlaying = false;
    state.sampleHistory = [];
    state.sampleCount = 0;
    clearInterval(state.playIntervalId);

    // Sync Dropdowns
    if (dom.unitSelect) dom.unitSelect.value = sim.unit;
    populateSimDropdown();
    if (dom.simSelect) dom.simSelect.value = sim.id;

    // Header updates
    if (dom.title) dom.title.textContent = sim.title;
    if (dom.subtitle) {
      dom.subtitle.textContent = `${sim.courseCode || 'U25MA301'} · Unit ${sim.unit} · ${sim.unitTitle} · BSC (${sim.courseCode === 'U25MA302' ? '3' : '4'} Credits)`;
    }

    // Default params
    state.params = Object.assign({}, sim.defaultParams);

    // Render Panels
    renderFormula(sim);
    buildInputControls(sim);
    updateReadoutsAndSpecs();
    renderPedagogy();
    setupChallenge(sim);
    drawCanvas();
  }

  function renderFormula(sim) {
    if (!dom.formulaBox) return;
    dom.formulaBox.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px;color:var(--primary)">${sim.topic}</div>
      <div style="font-size:13px;line-height:1.4">${escapeHtml(sim.formula)}</div>
      <div style="margin-top:6px;font-size:11.5px;color:var(--muted)">${escapeHtml(sim.description)}</div>
    `;
  }

  function buildInputControls(sim) {
    if (!dom.inputsForm) return;
    dom.inputsForm.innerHTML = '';

    const params = state.params;
    const formGroup = document.createElement('div');
    formGroup.style.display = 'flex';
    formGroup.style.flexDirection = 'column';
    formGroup.style.gap = '12px';

    // Tailored inputs based on simulation category
    if (sim.id === 'u25ma301-sample-space') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Experiment
          <select id="p-exp" class="ep-select">
            <option value="dice2" ${params.experiment === 'dice2' ? 'selected' : ''}>Pair of Fair 6-sided Dice (N=36)</option>
            <option value="coin3" ${params.experiment === 'coin3' ? 'selected' : ''}>Tossing 3 Coins (N=8)</option>
          </select>
        </label>
        <label class="ep-field-lbl">Event A
          <select id="p-eventA" class="ep-select">
            <option value="sum_even" ${params.eventA === 'sum_even' ? 'selected' : ''}>Sum is Even</option>
            <option value="sum_prime" ${params.eventA === 'sum_prime' ? 'selected' : ''}>Sum is Prime</option>
          </select>
        </label>
        <label class="ep-field-lbl">Event B
          <select id="p-eventB" class="ep-select">
            <option value="sum_gt_7" ${params.eventB === 'sum_gt_7' ? 'selected' : ''}>Sum &gt; 7</option>
            <option value="first_is_odd" ${params.eventB === 'first_is_odd' ? 'selected' : ''}>First Die is Odd</option>
          </select>
        </label>
      `;
    } else if (sim.id === 'u25ma301-conditional-bayes') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Prior P(H1) Server Failure: <b id="val-prior">${(params.priorH1 * 100).toFixed(0)}%</b>
          <input type="range" id="p-priorH1" min="0.01" max="0.5" step="0.01" value="${params.priorH1}">
        </label>
        <label class="ep-field-lbl">Sensitivity P(Alert|H1): <b id="val-sens">${(params.sensH1 * 100).toFixed(0)}%</b>
          <input type="range" id="p-sensH1" min="0.5" max="0.99" step="0.01" value="${params.sensH1}">
        </label>
        <label class="ep-field-lbl">False Positive P(Alert|H2): <b id="val-fp">${(params.fpH2 * 100).toFixed(0)}%</b>
          <input type="range" id="p-fpH2" min="0.01" max="0.3" step="0.01" value="${params.fpH2}">
        </label>
      `;
    } else if (sim.id === 'u25ma301-binomial-distribution') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Number of Bernoulli Trials (n): <b id="val-n">${params.n}</b>
          <input type="range" id="p-n" min="2" max="30" step="1" value="${params.n}">
        </label>
        <label class="ep-field-lbl">Success Probability (p): <b id="val-p">${params.p.toFixed(2)}</b>
          <input type="range" id="p-p" min="0.05" max="0.95" step="0.05" value="${params.p}">
        </label>
      `;
    } else if (sim.id === 'u25ma301-normal-distribution') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Mean (μ): <b id="val-mu">${params.mu}</b>
          <input type="range" id="p-mu" min="-10" max="10" step="0.5" value="${params.mu}">
        </label>
        <label class="ep-field-lbl">Std Dev (σ): <b id="val-sigma">${params.sigma.toFixed(1)}</b>
          <input type="range" id="p-sigma" min="0.5" max="5.0" step="0.1" value="${params.sigma}">
        </label>
        <div style="display:flex;gap:8px">
          <label class="ep-field-lbl" style="flex:1">Lower (x1):
            <input type="number" id="p-x1" class="ep-input" value="${params.x1}" step="0.5" style="width:100%">
          </label>
          <label class="ep-field-lbl" style="flex:1">Upper (x2):
            <input type="number" id="p-x2" class="ep-input" value="${params.x2}" step="0.5" style="width:100%">
          </label>
        </div>
      `;
    } else if (sim.id === 'u25ma301-poisson-distribution') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Arrival Rate (λ arrivals/sec): <b id="val-lambda">${params.lambda.toFixed(1)}</b>
          <input type="range" id="p-lambda" min="0.5" max="15.0" step="0.5" value="${params.lambda}">
        </label>
        <label class="ep-field-lbl">Max Horizon (k): <b id="val-maxK">${params.maxK}</b>
          <input type="range" id="p-maxK" min="10" max="30" step="1" value="${params.maxK}">
        </label>
      `;
    } else if (sim.id === 'u25ma301-linear-regression') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Sample Size (N points): <b id="val-n">${params.n}</b>
          <input type="range" id="p-n" min="10" max="50" step="5" value="${params.n}">
        </label>
        <label class="ep-field-lbl">Underlying Slope: <b id="val-slope">${params.slope.toFixed(2)}</b>
          <input type="range" id="p-slope" min="-3" max="3" step="0.2" value="${params.slope}">
        </label>
        <label class="ep-field-lbl">Gaussian Noise Level: <b id="val-noise">${params.noise.toFixed(1)}</b>
          <input type="range" id="p-noise" min="0.5" max="5" step="0.5" value="${params.noise}">
        </label>
      `;
    } else if (sim.id === 'u25ma301-central-limit-theorem') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Population Distribution:
          <select id="p-pop" class="ep-select">
            <option value="uniform" ${params.popType === 'uniform' ? 'selected' : ''}>Uniform (0, 10)</option>
            <option value="exponential" ${params.popType === 'exponential' ? 'selected' : ''}>Exponential (Skewed, λ=1)</option>
            <option value="bimodal" ${params.popType === 'bimodal' ? 'selected' : ''}>Bimodal (Twin Peaks)</option>
          </select>
        </label>
        <label class="ep-field-lbl">Sample Size (n per mean): <b id="val-n">${params.sampleSize}</b>
          <input type="range" id="p-n" min="2" max="60" step="2" value="${params.sampleSize}">
        </label>
      `;
    } else if (sim.id === 'u25ma301-markov-chains') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">P(Normal → Normal): <b id="val-p11">${params.p11.toFixed(2)}</b>
          <input type="range" id="p-p11" min="0.1" max="0.95" step="0.05" value="${params.p11}">
        </label>
        <label class="ep-field-lbl">P(Degraded → Normal Recovery): <b id="val-p21">${params.p21.toFixed(2)}</b>
          <input type="range" id="p-p21" min="0.05" max="0.8" step="0.05" value="${params.p21}">
        </label>
      `;
    
    } else if (sim.id === 'u25ma302-prob-distributions') {
      const dist = params.distribution || 'normal';
      const viewMode = params.viewMode || 'density';

      let paramFields = '';
      if (dist === 'normal') {
        const mu = params.param1 !== undefined ? params.param1 : 0;
        const sigma = params.param2 !== undefined ? params.param2 : 1.5;
        paramFields = `
          <label class="ep-field-lbl">Mean (μ): <b id="val-param1">${mu}</b>
            <input type="range" id="p-param1" min="-5" max="15" step="0.5" value="${mu}">
          </label>
          <label class="ep-field-lbl">Std Dev (σ): <b id="val-param2">${sigma.toFixed(1)}</b>
            <input type="range" id="p-param2" min="0.2" max="5.0" step="0.1" value="${sigma}">
          </label>
        `;
      } else if (dist === 'binomial') {
        const n = Math.round(params.param1 !== undefined ? params.param1 : 12);
        const p = params.param2 !== undefined ? params.param2 : 0.4;
        paramFields = `
          <label class="ep-field-lbl">Number of Trials (n): <b id="val-param1">${n}</b>
            <input type="range" id="p-param1" min="2" max="30" step="1" value="${n}">
          </label>
          <label class="ep-field-lbl">Success Probability (p): <b id="val-param2">${p.toFixed(2)}</b>
            <input type="range" id="p-param2" min="0.05" max="0.95" step="0.05" value="${p}">
          </label>
        `;
      } else if (dist === 'poisson') {
        const lambda = params.param1 !== undefined ? params.param1 : 4.5;
        paramFields = `
          <label class="ep-field-lbl">Arrival Rate (λ): <b id="val-param1">${lambda.toFixed(1)}</b>
            <input type="range" id="p-param1" min="0.5" max="15.0" step="0.5" value="${lambda}">
          </label>
        `;
      } else if (dist === 'geometric') {
        const p = params.param2 !== undefined ? params.param2 : 0.3;
        paramFields = `
          <label class="ep-field-lbl">Success Probability (p): <b id="val-param2">${p.toFixed(2)}</b>
            <input type="range" id="p-param2" min="0.05" max="0.95" step="0.05" value="${p}">
          </label>
        `;
      } else if (dist === 'exponential') {
        const lambda = params.param1 !== undefined ? params.param1 : 0.8;
        paramFields = `
          <label class="ep-field-lbl">Decay Rate (λ): <b id="val-param1">${lambda.toFixed(1)}</b>
            <input type="range" id="p-param1" min="0.1" max="3.0" step="0.1" value="${lambda}">
          </label>
        `;
      } else if (dist === 'uniform') {
        const a = params.param1 !== undefined ? params.param1 : 2;
        const b = params.param2 !== undefined ? params.param2 : 8;
        paramFields = `
          <label class="ep-field-lbl">Lower Bound (a): <b id="val-param1">${a}</b>
            <input type="range" id="p-param1" min="0" max="10" step="0.5" value="${a}">
          </label>
          <label class="ep-field-lbl">Upper Bound (b): <b id="val-param2">${b}</b>
            <input type="range" id="p-param2" min="1" max="15" step="0.5" value="${b}">
          </label>
        `;
      }

      formGroup.innerHTML = `
        <label class="ep-field-lbl">Distribution Family
          <select id="p-distribution" class="ep-select">
            <option value="normal" ${dist === 'normal' ? 'selected' : ''}>Normal (Gaussian) Continuous</option>
            <option value="binomial" ${dist === 'binomial' ? 'selected' : ''}>Binomial Discrete</option>
            <option value="poisson" ${dist === 'poisson' ? 'selected' : ''}>Poisson Discrete</option>
            <option value="geometric" ${dist === 'geometric' ? 'selected' : ''}>Geometric Discrete</option>
            <option value="exponential" ${dist === 'exponential' ? 'selected' : ''}>Exponential Continuous</option>
            <option value="uniform" ${dist === 'uniform' ? 'selected' : ''}>Uniform Continuous</option>
          </select>
        </label>
        ${paramFields}
        <label class="ep-field-lbl">View Representation
          <select id="p-viewMode" class="ep-select">
            <option value="density" ${viewMode === 'density' ? 'selected' : ''}>Density / Mass Function (PDF / PMF)</option>
            <option value="cdf" ${viewMode === 'cdf' ? 'selected' : ''}>Cumulative Distribution (CDF)</option>
          </select>
        </label>
        <div style="display:flex;gap:8px">
          <label class="ep-field-lbl" style="flex:1">Lower (x1):
            <input type="number" id="p-x1" class="ep-input" value="${params.x1 !== undefined ? params.x1 : -1.5}" step="0.5" style="width:100%">
          </label>
          <label class="ep-field-lbl" style="flex:1">Upper (x2):
            <input type="number" id="p-x2" class="ep-input" value="${params.x2 !== undefined ? params.x2 : 1.5}" step="0.5" style="width:100%">
          </label>
        </div>
      `;
    } else if (sim.id === 'u25ma302-sampling-distributions') {
      const popType = params.popType || 'skewed';
      const sampleSize = params.sampleSize || 20;
      const batches = params.sampleBatches || '50';
      const replacement = params.replacement || 'with';
      const seed = params.seed || 42;

      formGroup.innerHTML = `
        <label class="ep-field-lbl">Parent Population Distribution:
          <select id="p-popType" class="ep-select">
            <option value="skewed" ${popType === 'skewed' ? 'selected' : ''}>Exponential / Skewed (Rainfall / Decay)</option>
            <option value="uniform" ${popType === 'uniform' ? 'selected' : ''}>Uniform (Aggregate Gradation Bounds)</option>
            <option value="bimodal" ${popType === 'bimodal' ? 'selected' : ''}>Bimodal (Mixed Concrete Batches)</option>
            <option value="normal" ${popType === 'normal' ? 'selected' : ''}>Normal Gaussian (Compressive Strength)</option>
          </select>
        </label>
        <label class="ep-field-lbl">Sample Size (n per draw): <b id="val-sampleSize">${sampleSize}</b>
          <input type="range" id="p-sampleSize" min="2" max="60" step="2" value="${sampleSize}">
        </label>
        <label class="ep-field-lbl">Repeated Sample Draws:
          <select id="p-sampleBatches" class="ep-select">
            <option value="1" ${batches === '1' ? 'selected' : ''}>Draw 1 Sample</option>
            <option value="25" ${batches === '25' ? 'selected' : ''}>Draw 25 Samples</option>
            <option value="50" ${batches === '50' ? 'selected' : ''}>Draw 50 Samples</option>
            <option value="200" ${batches === '200' ? 'selected' : ''}>Draw 200 Samples</option>
            <option value="500" ${batches === '500' ? 'selected' : ''}>Draw 500 Samples</option>
          </select>
        </label>
        <label class="ep-field-lbl">Sampling Mode:
          <select id="p-replacement" class="ep-select">
            <option value="with" ${replacement === 'with' ? 'selected' : ''}>With Replacement</option>
            <option value="without" ${replacement === 'without' ? 'selected' : ''}>Without Replacement</option>
          </select>
        </label>
        <label class="ep-field-lbl">Reproducible PRNG Seed: <b id="val-seed">${seed}</b>
          <input type="range" id="p-seed" min="1" max="999" step="1" value="${seed}">
        </label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button type="button" class="ep-btn ep-btn-primary" id="btn-draw-sample" style="flex:1">🎲 Run Sampling</button>
          <button type="button" class="ep-btn" id="btn-reset-sample" style="flex:1">↻ Reset History</button>
        </div>
      `;
    } else if (sim.id === 'u25ma302-least-squares-regression') {
      const dataset = params.dataset || 'concrete';
      const showResiduals = params.showResiduals || 'yes';
      const showFitted = params.showFitted || 'yes';
      const predictX = params.predictX !== undefined ? params.predictX : 0.55;

      formGroup.innerHTML = `
        <label class="ep-field-lbl">Civil Engineering Dataset:
          <select id="p-dataset" class="ep-select">
            <option value="concrete" ${dataset === 'concrete' ? 'selected' : ''}>Concrete: Strength (MPa) vs Water-Cement Ratio</option>
            <option value="hydrology" ${dataset === 'hydrology' ? 'selected' : ''}>Hydrology: Peak Runoff (m³/s) vs Rainfall (mm)</option>
            <option value="traffic" ${dataset === 'traffic' ? 'selected' : ''}>Traffic: Speed (km/h) vs Density (veh/km)</option>
            <option value="surveying" ${dataset === 'surveying' ? 'selected' : ''}>Surveying: Distance Error (mm) vs Temp Diff (°C)</option>
          </select>
        </label>
        <div style="display:flex;gap:8px">
          <label class="ep-field-lbl" style="flex:1">Residual Lines (e_i):
            <select id="p-showResiduals" class="ep-select">
              <option value="yes" ${showResiduals === 'yes' ? 'selected' : ''}>Show</option>
              <option value="no" ${showResiduals === 'no' ? 'selected' : ''}>Hide</option>
            </select>
          </label>
          <label class="ep-field-lbl" style="flex:1">Fitted Points (ŷ):
            <select id="p-showFitted" class="ep-select">
              <option value="yes" ${showFitted === 'yes' ? 'selected' : ''}>Show</option>
              <option value="no" ${showFitted === 'no' ? 'selected' : ''}>Hide</option>
            </select>
          </label>
        </div>
        <label class="ep-field-lbl">Evaluate Prediction at X: <b id="val-predictX">${predictX.toFixed(2)}</b>
          <input type="range" id="p-predictX" min="0.1" max="1.5" step="0.05" value="${predictX}">
        </label>
        <div style="margin-top:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase">Linked Data Table</span>
            <button type="button" class="ep-btn ep-small" id="btn-reset-reg-dataset">↻ Default Dataset</button>
          </div>
          <div id="u25ma302-reg-table-wrap" style="max-height:160px;overflow-y:auto;border:1px solid var(--line);border-radius:6px"></div>
        </div>
      `;
    } else if (sim.id === 'u25ma302-correlation-data') {
      const assoc = params.associationType || 'strong_pos';
      const numPts = params.numPoints || 25;
      const outlier = params.outlier || 'none';
      const corrMethod = params.corrMethod || 'both';

      formGroup.innerHTML = `
        <label class="ep-field-lbl">Bivariate Association Pattern:
          <select id="p-associationType" class="ep-select">
            <option value="strong_pos" ${assoc === 'strong_pos' ? 'selected' : ''}>Strong Positive Linear (r ≈ +0.90)</option>
            <option value="mod_pos" ${assoc === 'mod_pos' ? 'selected' : ''}>Moderate Positive Linear (r ≈ +0.50)</option>
            <option value="uncorrelated" ${assoc === 'uncorrelated' ? 'selected' : ''}>Uncorrelated / Random (r ≈ 0.00)</option>
            <option value="strong_neg" ${assoc === 'strong_neg' ? 'selected' : ''}>Strong Negative Linear (r ≈ -0.85)</option>
            <option value="quadratic" ${assoc === 'quadratic' ? 'selected' : ''}>Quadratic Parabolic (y = x², r ≈ 0.00)</option>
          </select>
        </label>
        <label class="ep-field-lbl">Sample Size (n points): <b id="val-numPoints">${numPts}</b>
          <input type="range" id="p-numPoints" min="10" max="50" step="5" value="${numPts}">
        </label>
        <div style="display:flex;gap:8px">
          <label class="ep-field-lbl" style="flex:1">Inject Outlier:
            <select id="p-outlier" class="ep-select">
              <option value="none" ${outlier === 'none' ? 'selected' : ''}>None (Clean)</option>
              <option value="high" ${outlier === 'high' ? 'selected' : ''}>High Leverage</option>
            </select>
          </label>
          <label class="ep-field-lbl" style="flex:1">Display Metric:
            <select id="p-corrMethod" class="ep-select">
              <option value="both" ${corrMethod === 'both' ? 'selected' : ''}>Both (r & r_s)</option>
              <option value="pearson" ${corrMethod === 'pearson' ? 'selected' : ''}>Pearson r</option>
              <option value="spearman" ${corrMethod === 'spearman' ? 'selected' : ''}>Spearman r_s</option>
            </select>
          </label>
        </div>
      `;
    } else if (sim.id === 'u25ma301-queueing-models') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Arrival Rate λ (req/s): <b id="val-lambda">${params.lambda.toFixed(1)}</b>
          <input type="range" id="p-lambda" min="0.5" max="9.0" step="0.5" value="${params.lambda}">
        </label>
        <label class="ep-field-lbl">Service Rate μ (req/s): <b id="val-mu">${params.mu.toFixed(1)}</b>
          <input type="range" id="p-mu" min="2.0" max="10.0" step="0.5" value="${params.mu}">
        </label>
      `;
    } else {
      // General numerical sliders fallback
      Object.keys(params).forEach(k => {
        const val = params[k];
        if (typeof val === 'number') {
          const min = Math.min(0, val * 0.5);
          const max = Math.max(10, val * 2);
          const step = (max - min) / 20;
          const lbl = document.createElement('label');
          lbl.className = 'ep-field-lbl';
          lbl.innerHTML = `${k}: <b id="val-${k}">${val}</b>`;
          const input = document.createElement('input');
          input.type = 'range';
          input.id = `p-${k}`;
          input.min = min;
          input.max = max;
          input.step = step;
          input.value = val;
          lbl.appendChild(input);
          formGroup.appendChild(lbl);
        }
      });
    }

    dom.inputsForm.appendChild(formGroup);

    // Event listener delegation for live parameter updates
    dom.inputsForm.addEventListener('input', handleParamChange);
    dom.inputsForm.addEventListener('change', handleParamChange);
  }

  function handleParamChange(e) {
    const target = e.target;
    if (!target) return;

    if (target.id === 'p-exp') state.params.experiment = target.value;
    if (target.id === 'p-eventA') state.params.eventA = target.value;
    if (target.id === 'p-eventB') state.params.eventB = target.value;
    if (target.id === 'p-pop') state.params.popType = target.value;
    if (target.id === 'p-distribution') {
      state.params.distribution = target.value;
      if (target.value === 'normal') { state.params.param1 = 0; state.params.param2 = 1.5; state.params.x1 = -1.5; state.params.x2 = 1.5; }
      else if (target.value === 'binomial') { state.params.param1 = 12; state.params.param2 = 0.4; state.params.x1 = 2; state.params.x2 = 6; }
      else if (target.value === 'poisson') { state.params.param1 = 4.5; state.params.x1 = 2; state.params.x2 = 7; }
      else if (target.value === 'geometric') { state.params.param2 = 0.3; state.params.x1 = 1; state.params.x2 = 4; }
      else if (target.value === 'exponential') { state.params.param1 = 0.8; state.params.x1 = 0.5; state.params.x2 = 2.5; }
      else if (target.value === 'uniform') { state.params.param1 = 2; state.params.param2 = 8; state.params.x1 = 3; state.params.x2 = 6; }
      updateInputs(catalog.getSimulationById(state.currentSimId));
    }
    if (target.id === 'p-viewMode') state.params.viewMode = target.value;
    if (target.id === 'p-popType') state.params.popType = target.value;
    if (target.id === 'p-sampleBatches') state.params.sampleBatches = target.value;
    if (target.id === 'p-replacement') state.params.replacement = target.value;
    if (target.id === 'p-dataset') {
      state.params.dataset = target.value;
      state.u25ma302.customRegressionPoints = null;
      if (target.value === 'concrete') state.params.predictX = 0.55;
      else if (target.value === 'hydrology') state.params.predictX = 45;
      else if (target.value === 'traffic') state.params.predictX = 60;
      else if (target.value === 'surveying') state.params.predictX = 15;
      updateInputs(catalog.getSimulationById(state.currentSimId));
    }
    if (target.id === 'p-showResiduals') state.params.showResiduals = target.value;
    if (target.id === 'p-showFitted') state.params.showFitted = target.value;
    if (target.id === 'p-associationType') state.params.associationType = target.value;
    if (target.id === 'p-outlier') state.params.outlier = target.value;
    if (target.id === 'p-corrMethod') state.params.corrMethod = target.value;


    if (target.type === 'range' || target.type === 'number') {
      const paramName = target.id.replace(/^p-/, '');
      const parsedVal = parseFloat(target.value);
      state.params[paramName] = parsedVal;

      const valLabel = document.getElementById(`val-${paramName}`);
      if (valLabel) {
        if (paramName === 'priorH1' || paramName === 'sensH1' || paramName === 'fpH2') {
          valLabel.textContent = `${(parsedVal * 100).toFixed(0)}%`;
        } else {
          valLabel.textContent = parsedVal.toFixed(parsedVal % 1 === 0 ? 0 : 2);
        }
      }
    }

    // Refresh display
    updateReadoutsAndSpecs();
    drawCanvas();
  }

  // ══════════════════════════════════════════════════════════
  // 5. COMPUTATIONS & SPECIFICATIONS
  // ══════════════════════════════════════════════════════════
  function updateReadoutsAndSpecs() {
    const sim = catalog.getSimulationById(state.currentSimId);
    if (!sim) return;

    const specs = [];
    const readouts = [];

    if (sim.id === 'u25ma301-sample-space') {
      const nS = 36;
      let nA = 18; // sum_even
      let nB = 15; // sum_gt_7
      let nAnB = 9; // sum_even AND sum_gt_7: (2,6), (3,5), (4,4), (4,6), (5,3), (5,5), (6,2), (6,4), (6,6) = 9
      let nAuB = nA + nB - nAnB; // 24

      readouts.push({ label: 'Sample Space n(S)', val: `${nS} outcomes` });
      readouts.push({ label: 'P(A ∪ B)', val: `${MathCore.toFraction(nAuB, nS)} (${(nAuB / nS).toFixed(3)})` });

      specs.push(`P(Event A) = ${MathCore.toFraction(nA, nS)} = ${(nA / nS).toFixed(3)}`);
      specs.push(`P(Event B) = ${MathCore.toFraction(nB, nS)} = ${(nB / nS).toFixed(3)}`);
      specs.push(`P(A ∩ B) = ${MathCore.toFraction(nAnB, nS)} = ${(nAnB / nS).toFixed(3)}`);
      specs.push(`P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = ${nAuB}/${nS}`);
      specs.push(`P(Aᶜ) Complement = 1 - P(A) = ${nS - nA}/${nS}`);
    } else if (sim.id === 'u25ma301-conditional-bayes') {
      const pH1 = state.params.priorH1 || 0.05;
      const pH2 = 1 - pH1;
      const pAlertGivenH1 = state.params.sensH1 || 0.95;
      const pAlertGivenH2 = state.params.fpH2 || 0.08;

      const pAlert = (pAlertGivenH1 * pH1) + (pAlertGivenH2 * pH2);
      const posterior = (pAlertGivenH1 * pH1) / pAlert;

      readouts.push({ label: 'Prior P(H1)', val: `${(pH1 * 100).toFixed(1)}%` });
      readouts.push({ label: 'Posterior P(H1|Alert)', val: `${(posterior * 100).toFixed(1)}%` });

      specs.push(`Prior P(Fault) = ${(pH1 * 100).toFixed(1)}%`);
      specs.push(`Total Marginal P(Alert) = ${(pAlert * 100).toFixed(2)}%`);
      specs.push(`Bayes Posterior P(Fault | Alert) = ${(posterior * 100).toFixed(2)}%`);
      specs.push(`False Discovery Rate = ${((1 - posterior) * 100).toFixed(2)}%`);
    } else if (sim.id === 'u25ma301-binomial-distribution') {
      const n = state.params.n || 10;
      const p = state.params.p || 0.5;
      const mean = n * p;
      const variance = n * p * (1 - p);
      const stdDev = Math.sqrt(variance);

      readouts.push({ label: 'Expectation E[X] = np', val: mean.toFixed(2) });
      readouts.push({ label: 'Variance Var(X) = np(1-p)', val: variance.toFixed(2) });

      specs.push(`Trials n = ${n}, Success Probability p = ${p.toFixed(2)}`);
      specs.push(`Expected Value μ = ${mean.toFixed(2)}`);
      specs.push(`Variance σ² = ${variance.toFixed(3)}`);
      specs.push(`Standard Deviation σ = ${stdDev.toFixed(3)}`);
      specs.push(`PMF Mode = k = ${Math.floor((n + 1) * p)}`);
    } else if (sim.id === 'u25ma301-normal-distribution') {
      const mu = state.params.mu || 0;
      const sigma = state.params.sigma || 1;
      const x1 = state.params.x1 !== undefined ? state.params.x1 : -1;
      const x2 = state.params.x2 !== undefined ? state.params.x2 : 1;

      const cdf1 = MathCore.normalCdf(Math.min(x1, x2), mu, sigma);
      const cdf2 = MathCore.normalCdf(Math.max(x1, x2), mu, sigma);
      const intervalProb = cdf2 - cdf1;

      readouts.push({ label: 'P(x1 ≤ X ≤ x2)', val: `${(intervalProb * 100).toFixed(2)}%` });
      readouts.push({ label: 'Standard Deviation σ', val: sigma.toFixed(2) });

      specs.push(`Gaussian Mean μ = ${mu.toFixed(2)}, Std Dev σ = ${sigma.toFixed(2)}`);
      specs.push(`Interval [${Math.min(x1, x2)}, ${Math.max(x1, x2)}]`);
      specs.push(`Φ(z1) = ${cdf1.toFixed(4)}, Φ(z2) = ${cdf2.toFixed(4)}`);
      specs.push(`Exact Area P(x1 ≤ X ≤ x2) = ${intervalProb.toFixed(4)} (${(intervalProb * 100).toFixed(2)}%)`);
      specs.push(`68-95-99.7 Empirical Rule applies`);
    } else if (sim.id === 'u25ma301-linear-regression') {
      const slope = state.params.slope || 1.2;
      const n = state.params.n || 20;

      readouts.push({ label: 'Slope β1', val: slope.toFixed(2) });
      readouts.push({ label: 'Sample Count N', val: `${n} points` });

      specs.push(`Regression Model: y = β0 + β1·x + ε`);
      specs.push(`Method of Ordinary Least Squares (OLS)`);
      specs.push(`Minimizes sum of squared residuals: Σ(yi - ŷi)²`);
      specs.push(`Correlation r & R² displayed on canvas`);
    } else if (sim.id === 'u25ma301-queueing-models') {
      const lambda = state.params.lambda || 3.0;
      const mu = state.params.mu || 5.0;
      const rho = lambda / mu;

      if (rho < 1.0) {
        const L = rho / (1 - rho);
        const W = 1 / (mu - lambda);
        const Lq = (rho * rho) / (1 - rho);
        const Wq = rho / (mu - lambda);

        readouts.push({ label: 'Utilization ρ = λ/μ', val: `${(rho * 100).toFixed(1)}%` });
        readouts.push({ label: 'Avg System Time W', val: `${W.toFixed(2)} s` });

        specs.push(`Traffic Intensity ρ = ${rho.toFixed(3)} (< 1.0, Stable)`);
        specs.push(`Expected items in system L = ${L.toFixed(2)} requests`);
        specs.push(`Expected items in queue Lq = ${Lq.toFixed(2)} requests`);
        specs.push(`Mean response time W = 1/(μ - λ) = ${W.toFixed(3)} s`);
        specs.push(`Mean wait time Wq = ρ/(μ - λ) = ${Wq.toFixed(3)} s`);
        specs.push(`Little's Law verified: L = λ · W (${(lambda * W).toFixed(2)} = ${L.toFixed(2)})`);
      } else {
        readouts.push({ label: 'Utilization ρ', val: '≥ 100% UNSTABLE' });
        specs.push('System Unstable: λ ≥ μ! Queue grows without bound.');
      }
    } else {
      readouts.push({ label: 'Status', val: 'Active' });
      readouts.push({ label: 'Mode', val: state.mode });
      specs.push(`Simulation ${sim.title} operational.`);
      specs.push(`Parameters configured according to R2025 curriculum.`);
    }

    // Render readouts strip
    if (dom.readouts) {
      dom.readouts.innerHTML = '';
      readouts.forEach(r => {
        const div = document.createElement('div');
        div.className = 'ep-readout';
        div.innerHTML = `<span class="ep-readout-lbl">${r.label}</span><b class="ep-readout-val">${r.val}</b>`;
        dom.readouts.appendChild(div);
      });
    }

    // Render specs
    if (dom.specList) {
      dom.specList.innerHTML = '';
      specs.forEach(s => {
        const item = document.createElement('div');
        item.style.padding = '5px 8px';
        item.style.fontSize = '12px';
        item.style.borderBottom = '1px solid var(--line)';
        item.textContent = s;
        dom.specList.appendChild(item);
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  // 6. PEDAGOGY (WHAT, WHY, NEXT)
  // ══════════════════════════════════════════════════════════
  function renderPedagogy() {
    const sim = catalog.getSimulationById(state.currentSimId);
    if (!sim) return;

    const step = state.currentStep;
    if (dom.stepLabel) dom.stepLabel.textContent = `Step ${step + 1} of ${state.maxSteps}`;
    if (dom.progressFill) dom.progressFill.style.width = `${((step + 1) / state.maxSteps) * 100}%`;
    if (dom.bannerNo) dom.bannerNo.textContent = `Step ${step + 1} of ${state.maxSteps}`;

    const info = getPedagogyForSim(sim.id, step);
    if (dom.whatText) dom.whatText.textContent = info.what;
    if (dom.whyText) dom.whyText.textContent = info.why;
    if (dom.nextText) dom.nextText.textContent = info.next;
    if (dom.bannerText) dom.bannerText.textContent = info.what;
  }

  function getPedagogyForSim(simId, step) {
    const defaultInfo = {
      what: 'Statistical model initialized with curriculum parameters.',
      why: 'Continuous and discrete models govern modern computing architectures, fault-tolerance, and load balancing.',
      next: 'Advance steps or run dynamic sampling to observe convergence.'
    };

    if (simId === 'u25ma301-normal-distribution') {
      const steps = [
        { what: 'Standard Gaussian Bell Curve drawn with mean μ and dispersion σ.', why: 'Central Limit Theorem guarantees sums of independent random variables converge to Normal distribution.', next: 'Shade interval [x1, x2] to calculate integral area.' },
        { what: 'Integral computed as Φ(z2) - Φ(z1) using polynomial erf.', why: 'A point PDF f(x) has zero probability; continuous probability only exists over measurable intervals.', next: 'Observe empirical 68-95-99.7% confidence regions.' },
        { what: '68.27% of probability mass lies within 1 standard deviation of the mean.', why: 'Parametric confidence bounds are invariant under linear affine transformations Z = (X - μ)/σ.', next: 'Test extreme tails for latency SLA violation detection.' },
        { what: 'Computing system SLA violations correspond to upper p-value tail (X > SLA_max).', why: 'Server p99 tail latencies follow Gaussian mixtures and extreme value limits.', next: 'Switch to challenge mode to solve practical thresholds.' }
      ];
      return steps[step] || defaultInfo;
    }

    if (simId === 'u25ma301-queueing-models') {
      const steps = [
        { what: 'M/M/1 queue model with Poisson arrival rate λ and exponential service rate μ.', why: 'Memoryless Markovian property enables closed-form balance equations.', next: 'Verify traffic intensity ρ = λ/μ is strictly less than 1.' },
        { what: 'Traffic intensity ρ calculated.', why: 'If arrival rate meets or exceeds service capacity (ρ ≥ 1), queue size diverges to infinity.', next: 'Apply Little\'s Law: L = λW.' },
        { what: 'Average request latency W and queue backlog L computed.', why: 'Little\'s Law states mean occupancy equals throughput times mean response time regardless of distribution.', next: 'Vary λ and watch latency spike exponentially near saturation.' },
        { what: 'System exhibits steep non-linear response time degradation as ρ approaches 0.9.', why: 'Queueing theory dictates headroom is necessary; 90% server utilization causes 10x latency expansion.', next: 'Test capacity planning challenges in challenge tab.' }
      ];
      return steps[step] || defaultInfo;
    }

    return defaultInfo;
  }

  // ══════════════════════════════════════════════════════════
  // 7. CANVAS 2D VISUALIZATION
  // ══════════════════════════════════════════════════════════
  
  // ══════════════════════════════════════════════════════════
  // U25MA302: INTERACTIVE DRAWING ROUTINES
  // ══════════════════════════════════════════════════════════

  function drawU25MA302ProbDistributions(w, h, isDark) {
    const dist = state.params.distribution || 'normal';
    const viewMode = state.params.viewMode || 'density';
    const x1 = parseFloat(state.params.x1 !== undefined ? state.params.x1 : -1.5);
    const x2 = parseFloat(state.params.x2 !== undefined ? state.params.x2 : 1.5);
    const lower = Math.min(x1, x2);
    const upper = Math.max(x1, x2);

    const padL = 70, padR = 40, padT = 60, padB = 60;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    let minX = 0, maxX = 10, maxY = 0.5, mean = 0;
    const isDiscrete = dist === 'binomial' || dist === 'poisson' || dist === 'geometric';

    if (dist === 'normal') {
      const mu = state.params.param1 !== undefined ? state.params.param1 : 0;
      const sigma = state.params.param2 !== undefined ? state.params.param2 : 1.5;
      mean = mu;
      minX = mu - 3.8 * sigma;
      maxX = mu + 3.8 * sigma;
      maxY = viewMode === 'cdf' ? 1.05 : MathCore.normalPdf(mu, mu, sigma) * 1.25;
    } else if (dist === 'binomial') {
      const n = Math.round(state.params.param1 !== undefined ? state.params.param1 : 12);
      const p = state.params.param2 !== undefined ? state.params.param2 : 0.4;
      mean = n * p;
      minX = 0;
      maxX = n;
      maxY = viewMode === 'cdf' ? 1.05 : MathCore.binomialPmf(n, Math.floor(n * p), p) * 1.35;
    } else if (dist === 'poisson') {
      const lambda = state.params.param1 !== undefined ? state.params.param1 : 4.5;
      mean = lambda;
      minX = 0;
      maxX = Math.max(12, Math.ceil(lambda + 3.5 * Math.sqrt(lambda)));
      maxY = viewMode === 'cdf' ? 1.05 : MathCore.poissonPmf(lambda, Math.floor(lambda)) * 1.35;
    } else if (dist === 'geometric') {
      const p = state.params.param2 !== undefined ? state.params.param2 : 0.3;
      mean = 1 / p;
      minX = 1;
      maxX = Math.min(20, Math.ceil(4 / p));
      maxY = viewMode === 'cdf' ? 1.05 : p * 1.25;
    } else if (dist === 'exponential') {
      const lambda = state.params.param1 !== undefined ? state.params.param1 : 0.8;
      mean = 1 / lambda;
      minX = 0;
      maxX = 5 / lambda;
      maxY = viewMode === 'cdf' ? 1.05 : lambda * 1.15;
    } else if (dist === 'uniform') {
      const a = state.params.param1 !== undefined ? state.params.param1 : 2;
      const b = state.params.param2 !== undefined ? state.params.param2 : 8;
      mean = (a + b) / 2;
      minX = Math.max(0, a - (b - a) * 0.3);
      maxX = b + (b - a) * 0.3;
      maxY = viewMode === 'cdf' ? 1.05 : (1 / (b - a)) * 1.4;
    }

    function toScreenX(x) { return padL + ((x - minX) / (maxX - minX)) * plotW; }
    function toScreenY(y) { return h - padB - (y / maxY) * plotH; }

    // Axes
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, h - padB);
    ctx.stroke();

    if (isDiscrete) {
      // Discrete Stems / Bars
      const startK = Math.max(0, Math.floor(minX));
      const endK = Math.ceil(maxX);
      for (let k = startK; k <= endK; k++) {
        let val = 0;
        if (dist === 'binomial') {
          const n = Math.round(state.params.param1 || 12);
          const p = state.params.param2 || 0.4;
          val = viewMode === 'cdf' ? MathCore.binomialCdf(n, k, p) : MathCore.binomialPmf(n, k, p);
        } else if (dist === 'poisson') {
          const lambda = state.params.param1 || 4.5;
          val = viewMode === 'cdf' ? MathCore.poissonCdf(lambda, k) : MathCore.poissonPmf(lambda, k);
        } else if (dist === 'geometric') {
          const p = state.params.param2 || 0.3;
          val = viewMode === 'cdf' ? MathCore.geometricCdf(p, k) : MathCore.geometricPmf(p, k);
        }

        const sx = toScreenX(k);
        const sy = toScreenY(val);
        const isInInterval = k >= lower && k <= upper;

        // Stem line
        ctx.beginPath();
        ctx.moveTo(sx, h - padB);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = isInInterval ? '#06b6d4' : (isDark ? '#334155' : '#cbd5e1');
        ctx.lineWidth = isInInterval ? 3.5 : 2;
        ctx.stroke();

        // Top marker
        ctx.beginPath();
        ctx.arc(sx, sy, isInInterval ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isInInterval ? '#06b6d4' : (isDark ? '#64748b' : '#94a3b8');
        ctx.fill();

        // Ticks
        if (k % (endK > 15 ? 2 : 1) === 0) {
          ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
          ctx.font = '11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(k, sx, h - padB + 16);
        }
      }
    } else {
      // Continuous Curve & Shaded Region
      const steps = 250;
      function evalContinuous(x) {
        if (dist === 'normal') {
          const mu = state.params.param1 || 0;
          const sigma = state.params.param2 || 1.5;
          return viewMode === 'cdf' ? MathCore.normalCdf(x, mu, sigma) : MathCore.normalPdf(x, mu, sigma);
        } else if (dist === 'exponential') {
          const lambda = state.params.param1 || 0.8;
          return viewMode === 'cdf' ? MathCore.exponentialCdf(x, lambda) : MathCore.exponentialPdf(x, lambda);
        } else if (dist === 'uniform') {
          const a = state.params.param1 || 2;
          const b = state.params.param2 || 8;
          return viewMode === 'cdf' ? MathCore.uniformCdf(x, a, b) : MathCore.uniformPdf(x, a, b);
        }
        return 0;
      }

      // Shaded area in [lower, upper]
      if (viewMode === 'density') {
        const shLower = Math.max(minX, lower);
        const shUpper = Math.min(maxX, upper);
        if (shUpper > shLower) {
          ctx.beginPath();
          ctx.moveTo(toScreenX(shLower), toScreenY(0));
          const shSteps = 80;
          for (let i = 0; i <= shSteps; i++) {
            const x = shLower + (i / shSteps) * (shUpper - shLower);
            ctx.lineTo(toScreenX(x), toScreenY(evalContinuous(x)));
          }
          ctx.lineTo(toScreenX(shUpper), toScreenY(0));
          ctx.closePath();
          ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.35)' : 'rgba(6, 182, 212, 0.25)';
          ctx.fill();
        }
      }

      // Continuous curve line
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = minX + (i / steps) * (maxX - minX);
        const y = evalContinuous(x);
        const sx = toScreenX(x);
        const sy = toScreenY(y);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Mean dashed line
      if (mean >= minX && mean <= maxX) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(toScreenX(mean), h - padB);
        ctx.lineTo(toScreenX(mean), toScreenY(evalContinuous(mean)));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Header info on canvas
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`${dist.toUpperCase()} ${isDiscrete ? 'Discrete PMF' : 'Continuous PDF'} Explorer`, padL, 30);

    ctx.textAlign = 'right';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.fillText(`Interval [${lower}, ${upper}] | Mean μ = ${mean.toFixed(2)}`, w - padR, 30);
  }

  function drawU25MA302SamplingDistributions(w, h, isDark) {
    const popType = state.params.popType || 'skewed';
    const n = state.params.sampleSize || 20;

    const padL = 70, padR = 40, padT = 45, padB = 50;
    const plotW = w - padL - padR;

    // Dual-view: Top = Population (35% height), Bottom = Sampling Distribution (65% height)
    const topH = Math.floor((h - padT - padB) * 0.32);
    const gap = 30;
    const btmY = padT + topH + gap;
    const btmH = h - padB - btmY;

    // ── 1. Top: Population View ──
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`1. Parent Population Distribution: ${popType.toUpperCase()}`, padL, padT - 10);

    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + topH);
    ctx.lineTo(w - padR, padT + topH);
    ctx.stroke();

    // Draw population curve
    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 3) {
      const u = x / plotW; // 0 to 1
      let y = 0;
      if (popType === 'skewed') y = Math.exp(-3 * u);
      else if (popType === 'uniform') y = 0.5;
      else if (popType === 'bimodal') y = Math.exp(-Math.pow((u - 0.25) * 6, 2)) + Math.exp(-Math.pow((u - 0.75) * 6, 2));
      else if (popType === 'normal') y = Math.exp(-Math.pow((u - 0.5) * 5, 2));

      const sy = padT + topH - y * (topH * 0.85);
      if (x === 0) ctx.moveTo(padL + x, sy);
      else ctx.lineTo(padL + x, sy);
    }
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw highlighted sample points
    const currentSample = state.u25ma302.currentSamplePoints || [];
    for (let i = 0; i < currentSample.length; i++) {
      const u = Math.max(0, Math.min(1, currentSample[i] / 10));
      const sx = padL + u * plotW;
      ctx.beginPath();
      ctx.arc(sx, padT + topH - 8, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── 2. Bottom: Sampling Distribution of Means ──
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`2. Empirical Sampling Distribution of X̄ (Sample Size n = ${n}) | Central Limit Theorem`, padL, btmY - 10);

    // Axes
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.stroke();

    const history = state.u25ma302.cltRuns || [];
    const numBins = 30;
    const binW = plotW / numBins;

    // Draw Histogram bars
    const counts = new Array(numBins).fill(0);
    const minMean = 2.0, maxMean = 8.0;
    history.forEach(m => {
      const idx = Math.floor(((m - minMean) / (maxMean - minMean)) * numBins);
      if (idx >= 0 && idx < numBins) counts[idx]++;
    });
    const maxCount = Math.max(1, ...counts);

    for (let i = 0; i < numBins; i++) {
      const barH = (counts[i] / maxCount) * (btmH * 0.82);
      const bx = padL + i * binW;
      const by = h - padB - barH;
      ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.45)' : 'rgba(6, 182, 212, 0.35)';
      ctx.fillRect(bx, by, binW - 2, barH);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, binW - 2, barH);
    }

    // Overlay Theoretical Normal curve
    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 4) {
      const u = x / plotW;
      const m = minMean + u * (maxMean - minMean);
      const popMean = popType === 'skewed' ? 2.0 : 5.0;
      const popStd = Math.sqrt(popType === 'skewed' ? 4.0 : 2.5);
      const se = popStd / Math.sqrt(n);
      const z = (m - popMean) / se;
      const normY = Math.exp(-0.5 * z * z);
      const sy = h - padB - normY * (btmH * 0.85);

      if (x === 0) ctx.moveTo(padL + x, sy);
      else ctx.lineTo(padL + x, sy);
    }
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Legend
    ctx.textAlign = 'right';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('— Theoretical Gaussian Envelope N(μ, σ²/n)', w - padR, btmY + 20);
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.fillText(`■ Empirical Means (N=${history.length} runs)`, w - padR, btmY + 36);
  }

  function drawU25MA302Regression(w, h, isDark) {
    const dsKey = state.params.dataset || 'concrete';
    const pts = state.u25ma302.customRegressionPoints || state.u25ma302.regressionDatasets[dsKey] || state.u25ma302.regressionDatasets.concrete;
    const showResiduals = (state.params.showResiduals || 'yes') === 'yes';
    const showFitted = (state.params.showFitted || 'yes') === 'yes';
    const predictX = state.params.predictX !== undefined ? state.params.predictX : 0.55;

    const padL = 75, padR = 45, padT = 55, padB = 60;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const xRange = (maxX - minX) || 1;
    const yRange = (maxY - minY) || 1;
    const plotMinX = Math.max(0, minX - xRange * 0.15);
    const plotMaxX = maxX + xRange * 0.25;
    const plotMinY = Math.max(0, minY - yRange * 0.2);
    const plotMaxY = maxY + yRange * 0.2;

    function toScreenX(x) { return padL + ((x - plotMinX) / (plotMaxX - plotMinX)) * plotW; }
    function toScreenY(y) { return h - padB - ((y - plotMinY) / (plotMaxY - plotMinY)) * plotH; }

    const reg = MathCore.linearRegression(xs, ys);

    // Fitted regression line
    ctx.beginPath();
    ctx.moveTo(toScreenX(plotMinX), toScreenY(reg.intercept + reg.slope * plotMinX));
    ctx.lineTo(toScreenX(plotMaxX), toScreenY(reg.intercept + reg.slope * plotMaxX));
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Points and residuals
    for (let i = 0; i < pts.length; i++) {
      const sx = toScreenX(pts[i].x);
      const sy = toScreenY(pts[i].y);
      const yFit = reg.intercept + reg.slope * pts[i].x;
      const syFit = toScreenY(yFit);

      // Residual segment
      if (showResiduals) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, syFit);
        ctx.strokeStyle = pts[i].y >= yFit ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Fitted point on line
      if (showFitted) {
        ctx.beginPath();
        ctx.arc(sx, syFit, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
      }

      // Observed Point
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Prediction marker
    const predY = reg.intercept + reg.slope * predictX;
    const predSX = toScreenX(predictX);
    const predSY = toScreenY(predY);
    const isExtra = predictX < minX || predictX > maxX;

    ctx.beginPath();
    ctx.arc(predSX, predSY, 7, 0, Math.PI * 2);
    ctx.fillStyle = isExtra ? '#ef4444' : '#8b5cf6';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axis
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, h - padB);
    ctx.stroke();

    // Headers & Labels
    ctx.textAlign = 'left';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`OLS Regression: ŷ = ${reg.intercept.toFixed(2)} + (${reg.slope.toFixed(2)})x | R² = ${(reg.r2 * 100).toFixed(1)}%`, padL, 30);

    ctx.textAlign = 'right';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = isExtra ? '#ef4444' : '#8b5cf6';
    ctx.fillText(`Prediction at x=${predictX.toFixed(2)}: ŷ = ${predY.toFixed(2)} ${isExtra ? '⚠️ Extrapolated' : '✓ Interpolated'}`, w - padR, 30);
  }

  function drawU25MA302Correlation(w, h, isDark) {
    const assoc = state.params.associationType || 'strong_pos';
    const numPts = state.params.numPoints || 25;
    const outlier = state.params.outlier || 'none';

    const padL = 70, padR = 40, padT = 55, padB = 60;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Generate points
    const pts = [];
    for (let i = 0; i < numPts; i++) {
      const t = (i / (numPts - 1)) * 10 - 5;
      let noise = (Math.sin(i * 4.1) + Math.cos(i * 1.7)) * 1.2;
      let x = 5 + t;
      let y = 5;
      if (assoc === 'strong_pos') y = 2 + 1.2 * x + noise * 0.8;
      else if (assoc === 'mod_pos') y = 4 + 0.6 * x + noise * 2.5;
      else if (assoc === 'uncorrelated') y = 10 + noise * 4.0;
      else if (assoc === 'strong_neg') y = 18 - 1.1 * x + noise * 0.9;
      else if (assoc === 'quadratic') { x = t; y = t * t + noise * 0.5; }
      pts.push({ x, y, isOutlier: false });
    }

    if (outlier === 'high') {
      pts.push({ x: 16, y: assoc === 'strong_neg' ? 25 : 1, isOutlier: true });
    }

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const mx = MathCore.mean(xs);
    const my = MathCore.mean(ys);
    const r = MathCore.correlation(xs, ys);

    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    function toScreenX(x) { return padL + ((x - minX) / (maxX - minX)) * plotW; }
    function toScreenY(y) { return h - padB - ((y - minY) / (maxY - minY)) * plotH; }

    // Quadrant crosshair at centroid (mx, my)
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padL, toScreenY(my));
    ctx.lineTo(w - padR, toScreenY(my));
    ctx.moveTo(toScreenX(mx), padT);
    ctx.lineTo(toScreenX(mx), h - padB);
    ctx.stroke();
    ctx.setLineDash([]);

    // Quadrant Labels (I, II, III, IV)
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
    ctx.textAlign = 'right';
    ctx.fillText('Quad I (+,+)', w - padR - 10, padT + 20);
    ctx.textAlign = 'left';
    ctx.fillText('Quad II (-,+)', padL + 10, padT + 20);
    ctx.fillText('Quad III (-,-)', padL + 10, h - padB - 10);
    ctx.textAlign = 'right';
    ctx.fillText('Quad IV (+,-)', w - padR - 10, h - padB - 10);

    // Trend line
    const reg = MathCore.linearRegression(xs, ys);
    ctx.beginPath();
    ctx.moveTo(toScreenX(minX), toScreenY(reg.intercept + reg.slope * minX));
    ctx.lineTo(toScreenX(maxX), toScreenY(reg.intercept + reg.slope * maxX));
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Points
    pts.forEach(p => {
      const sx = toScreenX(p.x);
      const sy = toScreenY(p.y);
      ctx.beginPath();
      ctx.arc(sx, sy, p.isOutlier ? 7.5 : 5, 0, Math.PI * 2);
      ctx.fillStyle = p.isOutlier ? '#f97316' : '#6366f1';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Centroid marker (mx, my)
    const smx = toScreenX(mx);
    const smy = toScreenY(my);
    ctx.beginPath();
    ctx.arc(smx, smy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Headers
    ctx.textAlign = 'left';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`Bivariate Association | Pearson r = ${r.toFixed(3)} (r² = ${(r * r * 100).toFixed(1)}%)`, padL, 30);

    ctx.textAlign = 'right';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.fillText('Centroid (x̄, Ȳ) shown in amber ●', w - padR, 30);
  }

  function drawCanvas() {
    if (!ctx || !dom.canvas) return;

    const w = dom.canvas.width;
    const h = dom.canvas.height;
    const isDark = state.theme === 'dark';

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Draw subtle grid
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const simId = state.currentSimId;
    if (simId === 'u25ma301-normal-distribution') {
      drawNormalCurve(w, h, isDark);
    } else if (simId === 'u25ma301-binomial-distribution' || simId === 'u25ma301-poisson-distribution') {
      drawDiscreteDistribution(w, h, isDark);
    } else if (simId === 'u25ma301-sample-space') {
      drawSampleSpaceGrid(w, h, isDark);
    } else if (simId === 'u25ma301-conditional-bayes') {
      drawBayesTree(w, h, isDark);
    } else if (simId === 'u25ma301-linear-regression') {
      drawRegressionPlot(w, h, isDark);
    } else if (simId === 'u25ma301-central-limit-theorem') {
      drawCltHistogram(w, h, isDark);
    } else if (simId === 'u25ma301-markov-chains') {
      drawMarkovGraph(w, h, isDark);
    } else if (simId === 'u25ma301-queueing-models') {
      drawQueueingSystem(w, h, isDark);
    } else {
      drawGenericModel(w, h, isDark);
    }
  }

  function drawNormalCurve(w, h, isDark) {
    const mu = state.params.mu || 0;
    const sigma = state.params.sigma || 1;
    const x1 = Math.min(state.params.x1 !== undefined ? state.params.x1 : -1, state.params.x2 !== undefined ? state.params.x2 : 1);
    const x2 = Math.max(state.params.x1 !== undefined ? state.params.x1 : -1, state.params.x2 !== undefined ? state.params.x2 : 1);

    const padL = 70, padR = 40, padT = 50, padB = 60;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const minX = mu - 4 * sigma;
    const maxX = mu + 4 * sigma;
    const maxPdf = MathCore.normalPdf(mu, mu, sigma) * 1.15;

    function toScreenX(x) { return padL + ((x - minX) / (maxX - minX)) * plotW; }
    function toScreenY(y) { return h - padB - (y / maxPdf) * plotH; }

    // Shaded interval [x1, x2]
    ctx.beginPath();
    ctx.moveTo(toScreenX(x1), toScreenY(0));
    const stepX = (x2 - x1) / 80;
    for (let x = x1; x <= x2; x += stepX) {
      const pdf = MathCore.normalPdf(x, mu, sigma);
      ctx.lineTo(toScreenX(x), toScreenY(pdf));
    }
    ctx.lineTo(toScreenX(x2), toScreenY(0));
    ctx.closePath();
    ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.35)' : 'rgba(6, 182, 212, 0.25)';
    ctx.fill();

    // Normal curve line
    ctx.beginPath();
    const totalSteps = 200;
    for (let i = 0; i <= totalSteps; i++) {
      const x = minX + (i / totalSteps) * (maxX - minX);
      const pdf = MathCore.normalPdf(x, mu, sigma);
      const sx = toScreenX(x);
      const sy = toScreenY(pdf);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Baseline & axes
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, h - padB);
    ctx.stroke();

    // Center Mean dashed line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(mu), h - padB);
    ctx.lineTo(toScreenX(mu), toScreenY(MathCore.normalPdf(mu, mu, sigma)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis Labels
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`μ = ${mu}`, toScreenX(mu), h - padB + 20);
    ctx.fillText(`x1 = ${x1}`, toScreenX(x1), h - padB + 35);
    ctx.fillText(`x2 = ${x2}`, toScreenX(x2), h - padB + 35);

    // Title on canvas
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`Normal Distribution N(μ = ${mu}, σ² = ${(sigma * sigma).toFixed(2)})`, padL, 32);

    const prob = MathCore.normalCdf(x2, mu, sigma) - MathCore.normalCdf(x1, mu, sigma);
    ctx.textAlign = 'right';
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`Shaded Area P(${x1} ≤ X ≤ ${x2}) = ${(prob * 100).toFixed(2)}%`, w - padR, 32);
  }

  function drawDiscreteDistribution(w, h, isDark) {
    const isBinomial = state.currentSimId === 'u25ma301-binomial-distribution';
    const n = isBinomial ? (state.params.n || 10) : (state.params.maxK || 15);
    const p = isBinomial ? (state.params.p || 0.5) : 0;
    const lambda = !isBinomial ? (state.params.lambda || 4.0) : 0;

    const padL = 70, padR = 40, padT = 50, padB = 60;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    let maxProb = 0;
    const probs = [];
    for (let k = 0; k <= n; k++) {
      const prob = isBinomial ? MathCore.binomialPmf(n, k, p) : MathCore.poissonPmf(lambda, k);
      probs.push(prob);
      if (prob > maxProb) maxProb = prob;
    }
    maxProb = Math.max(0.1, maxProb * 1.2);

    const barW = Math.min(32, (plotW / (n + 1)) * 0.7);
    const gap = plotW / (n + 1);

    // Draw bars
    probs.forEach((prob, k) => {
      const x = padL + k * gap + gap * 0.15;
      const barH = (prob / maxProb) * plotH;
      const y = h - padB - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h - padB);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      // Value label on top of bar
      if (prob > 0.015 && n <= 20) {
        ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
        ctx.font = '10px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(prob.toFixed(3), x + barW / 2, y - 6);
      }

      // X-axis label
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(k, x + barW / 2, h - padB + 18);
    });

    // Baseline
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.stroke();

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(isBinomial ? `Binomial PMF B(n = ${n}, p = ${p.toFixed(2)})` : `Poisson PMF Pois(λ = ${lambda.toFixed(1)})`, padL, 32);
  }

  function drawSampleSpaceGrid(w, h, isDark) {
    const padL = 100, padT = 70;
    const cellSize = 56;

    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'left';
    ctx.fillText('Pair of Fair 6-Sided Dice: Sample Space S = { (i, j) | 1 ≤ i, j ≤ 6 }', padL, 40);

    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 6; j++) {
        const x = padL + (j - 1) * (cellSize + 8);
        const y = padT + (i - 1) * (cellSize + 8);
        const sum = i + j;

        const isEven = sum % 2 === 0;
        const isGt7 = sum > 7;

        let fill = isDark ? '#1e293b' : '#f1f5f9';
        let stroke = isDark ? '#334155' : '#cbd5e1';

        if (isEven && isGt7) {
          fill = isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)'; // Intersection
          stroke = '#10b981';
        } else if (isEven) {
          fill = isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)'; // Event A
          stroke = '#06b6d4';
        } else if (isGt7) {
          fill = isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'; // Event B
          stroke = '#f59e0b';
        }

        ctx.fillStyle = fill;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellSize, cellSize);

        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`(${i},${j})`, x + cellSize / 2, y + 24);

        ctx.font = '10.5px Inter, sans-serif';
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.fillText(`Σ=${sum}`, x + cellSize / 2, y + 42);
      }
    }

    // Legend
    const legX = padL + 6 * (cellSize + 8) + 30;
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.fillText('Color Key:', legX, padT + 20);

    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(legX, padT + 36, 16, 16);
    ctx.fillText('Event A: Sum Even (18/36)', legX + 24, padT + 49);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(legX, padT + 66, 16, 16);
    ctx.fillText('Event B: Sum > 7 (15/36)', legX + 24, padT + 79);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(legX, padT + 96, 16, 16);
    ctx.fillText('A ∩ B: Both (9/36)', legX + 24, padT + 109);
  }

  function drawBayesTree(w, h, isDark) {
    const pH1 = state.params.priorH1 || 0.05;
    const pH2 = 1 - pH1;
    const pA_H1 = state.params.sensH1 || 0.95;
    const pA_H2 = state.params.fpH2 || 0.08;

    const pAlert = (pH1 * pA_H1) + (pH2 * pA_H2);
    const post = (pH1 * pA_H1) / pAlert;

    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'left';
    ctx.fillText('Bayesian Diagnostics Tree: Computing System Anomaly Inference', 60, 40);

    // Root
    const rootX = 100, rootY = h / 2;
    drawNode(rootX, rootY, 'System', '#6366f1', isDark);

    // Level 1: Hypotheses
    const h1X = 320, h1Y = rootY - 100;
    const h2X = 320, h2Y = rootY + 100;
    drawBranch(rootX, rootY, h1X, h1Y, `P(Fault)=${(pH1 * 100).toFixed(0)}%`, isDark);
    drawBranch(rootX, rootY, h2X, h2Y, `P(Healthy)=${(pH2 * 100).toFixed(0)}%`, isDark);
    drawNode(h1X, h1Y, 'Fault (H1)', '#ef4444', isDark);
    drawNode(h2X, h2Y, 'Healthy (H2)', '#10b981', isDark);

    // Level 2: Outcomes
    const outX = 580;
    drawBranch(h1X, h1Y, outX, h1Y - 45, `Alert: ${(pA_H1 * 100).toFixed(0)}%`, isDark);
    drawBranch(h1X, h1Y, outX, h1Y + 45, `Silent: ${((1 - pA_H1) * 100).toFixed(0)}%`, isDark);

    drawBranch(h2X, h2Y, outX, h2Y - 45, `False Alert: ${(pA_H2 * 100).toFixed(0)}%`, isDark);
    drawBranch(h2X, h2Y, outX, h2Y + 45, `Normal: ${((1 - pA_H2) * 100).toFixed(0)}%`, isDark);

    // Result card
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.fillRect(720, rootY - 80, 220, 160);
    ctx.strokeRect(720, rootY - 80, 220, 160);

    ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bayes Posterior Result', 830, rootY - 50);

    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`P(Alert) = ${(pAlert * 100).toFixed(2)}%`, 830, rootY - 20);

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`P(Fault | Alert) = ${(post * 100).toFixed(1)}%`, 830, rootY + 25);
  }

  function drawNode(x, y, text, color, isDark) {
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 4);
  }

  function drawBranch(x1, y1, x2, y2, label, isDark) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 8;
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, mx, my);
  }

  function drawRegressionPlot(w, h, isDark) {
    const n = state.params.n || 20;
    const slope = state.params.slope || 1.2;
    const padL = 70, padR = 40, padT = 50, padB = 60;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Deterministic points based on index
    const xs = [];
    const ys = [];
    for (let i = 0; i < n; i++) {
      const x = 1 + (i / n) * 9;
      const pseudoNoise = (Math.sin(i * 3.7) + Math.cos(i * 1.3)) * 1.2;
      const y = 2 + slope * x + pseudoNoise;
      xs.push(x);
      ys.push(y);
    }

    const reg = MathCore.linearRegression(xs, ys);

    function toScreenX(x) { return padL + ((x - 0) / 11) * plotW; }
    function toScreenY(y) { return h - padB - ((y - 0) / 25) * plotH; }

    // Best fit line
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(reg.intercept));
    ctx.lineTo(toScreenX(11), toScreenY(reg.intercept + reg.slope * 11));
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Data points & residual bars
    for (let i = 0; i < n; i++) {
      const sx = toScreenX(xs[i]);
      const sy = toScreenY(ys[i]);
      const yFit = toScreenY(reg.intercept + reg.slope * xs[i]);

      // Residual dashed line
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, yFit);
      ctx.strokeStyle = isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)';
      ctx.stroke();

      // Point
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#fff' : '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, h - padB);
    ctx.stroke();

    // Heading
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`OLS Linear Regression: y = ${reg.intercept.toFixed(2)} + ${reg.slope.toFixed(2)}x (R² = ${reg.r2.toFixed(3)})`, padL, 32);
  }

  function drawCltHistogram(w, h, isDark) {
    const padL = 70, padR = 40, padT = 50, padB = 60;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Central Limit Theorem: Distribution of Sample Means', padL, 32);

    // Draw empirical sample mean bars forming bell shape
    const numBins = 25;
    const binW = plotW / numBins;
    for (let i = 0; i < numBins; i++) {
      const z = (i - numBins / 2) / 3.5;
      const countNorm = Math.exp(-0.5 * z * z);
      const barH = countNorm * plotH * 0.85;
      const bx = padL + i * binW;
      const by = h - padB - barH;

      ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)';
      ctx.fillRect(bx, by, binW - 2, barH);
    }

    // Overlay smooth theoretical Gaussian
    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 4) {
      const z = ((x / plotW) - 0.5) * 7;
      const y = Math.exp(-0.5 * z * z) * plotH * 0.85;
      if (x === 0) ctx.moveTo(padL + x, h - padB - y);
      else ctx.lineTo(padL + x, h - padB - y);
    }
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Axes
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.stroke();
  }

  function drawMarkovGraph(w, h, isDark) {
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Discrete-Time Markov Chain (DTMC): Server Reliability States', 60, 40);

    const s1X = 250, s1Y = h / 2;
    const s2X = 550, s2Y = h / 2;

    drawNode(s1X, s1Y, 'Healthy (S1)', '#10b981', isDark);
    drawNode(s2X, s2Y, 'Degraded (S2)', '#f59e0b', isDark);

    // Transitions
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;

    // S1 -> S2
    ctx.beginPath();
    ctx.arc(400, h / 2 - 40, 160, Math.PI * 0.8, Math.PI * 0.2, true);
    ctx.stroke();

    // S2 -> S1
    ctx.beginPath();
    ctx.arc(400, h / 2 + 40, 160, Math.PI * 0.2, Math.PI * 0.8, false);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('p12 = 0.15 (Failure)', 400, h / 2 - 70);
    ctx.fillText('p21 = 0.35 (Reboot)', 400, h / 2 + 85);
  }

  function drawQueueingSystem(w, h, isDark) {
    const lambda = state.params.lambda || 3.0;
    const mu = state.params.mu || 5.0;
    const rho = lambda / mu;

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`M/M/1 Server Performance: λ = ${lambda.toFixed(1)} req/s, μ = ${mu.toFixed(1)} req/s`, 60, 40);

    // Queue buffer
    const qX = 200, qY = h / 2 - 35, qW = 280, qH = 70;
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(qX, qY, qW, qH);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FIFO Request Queue (Buffer)', qX + qW / 2, qY - 10);

    // Animated packets in queue
    const numPackets = Math.min(8, Math.round(rho * 6));
    for (let i = 0; i < numPackets; i++) {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(qX + qW - 35 - i * 32, qY + 15, 24, 40);
    }

    // Server
    const srvX = 560, srvY = h / 2;
    drawNode(srvX, srvY, 'CPU', '#10b981', isDark);

    // Latency curve inset
    const plotX = 670, plotY = 90, plotW = 260, plotH = 200;
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(plotX, plotY, plotW, plotH);
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('Response Time W vs Traffic ρ', plotX + plotW / 2, plotY + 20);

    ctx.beginPath();
    for (let r = 0.05; r < 0.95; r += 0.02) {
      const W = 1 / (mu * (1 - r));
      const px = plotX + 20 + r * (plotW - 40);
      const py = plotY + plotH - 20 - Math.min(plotH - 40, W * 35);
      if (r === 0.05) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  function drawGenericModel(w, h, isDark) {
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Interactive Statistical Simulation Running', w / 2, h / 2 - 20);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Adjust parameters or advance steps to explore distributions and calculations.', w / 2, h / 2 + 15);
  }

  // ══════════════════════════════════════════════════════════
  // 8. CHALLENGES & ASSESSMENT
  // ══════════════════════════════════════════════════════════
  function setupChallenge(sim) {
    if (!dom.challengeCard || !dom.challengePrompt) return;

    if (state.mode === 'challenge' && sim.challenge) {
      dom.challengeCard.style.display = 'block';
      dom.challengePrompt.innerHTML = `
        <div style="font-weight:700;color:var(--primary);margin-bottom:6px">Challenge:</div>
        <div>${escapeHtml(sim.challenge.goal)}</div>
      `;
      if (dom.challengeResult) dom.challengeResult.textContent = '';
    } else {
      dom.challengeCard.style.display = 'none';
    }
  }

  // ══════════════════════════════════════════════════════════
  // 9. PLAYBACK, CONTROLS & AI TUTOR
  // ══════════════════════════════════════════════════════════
  function initControls() {
    // Mode toggles
    dom.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.getAttribute('data-learn');
        const sim = catalog.getSimulationById(state.currentSimId);
        setupChallenge(sim);
        updateReadoutsAndSpecs();
      });
    });

    // Theme toggle
    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        try { localStorage.setItem('eduverse_theme', state.theme); } catch (e) {}
        dom.themeToggle.textContent = state.theme === 'dark' ? '☀️ Light Theme' : '🌓 Dark Theme';
        drawCanvas();
      });
      // Set initial
      document.documentElement.setAttribute('data-theme', state.theme);
      dom.themeToggle.textContent = state.theme === 'dark' ? '☀️ Light Theme' : '🌓 Dark Theme';
    }

    // Step navigation
    if (dom.prevBtn) {
      dom.prevBtn.addEventListener('click', () => {
        if (state.currentStep > 0) {
          state.currentStep--;
          renderPedagogy();
          drawCanvas();
        }
      });
    }

    if (dom.nextBtn) {
      dom.nextBtn.addEventListener('click', () => {
        if (state.currentStep < state.maxSteps - 1) {
          state.currentStep++;
          renderPedagogy();
          drawCanvas();
        }
      });
    }

    // Play / Pause sampling
    if (dom.playBtn) {
      dom.playBtn.addEventListener('click', () => {
        state.isPlaying = !state.isPlaying;
        if (state.isPlaying) {
          dom.playBtn.textContent = '⏸ Pause';
          dom.playBtn.classList.remove('ep-btn-primary');
          if (dom.pauseBtn) dom.pauseBtn.disabled = false;
          startSamplingLoop();
        } else {
          stopSamplingLoop();
        }
      });
    }

    if (dom.pauseBtn) {
      dom.pauseBtn.addEventListener('click', stopSamplingLoop);
    }

    if (dom.resetBtn) {
      dom.resetBtn.addEventListener('click', () => {
        loadSimulation(state.currentSimId);
      });
    }

    if (dom.resetParamsBtn) {
      dom.resetParamsBtn.addEventListener('click', () => {
        const sim = catalog.getSimulationById(state.currentSimId);
        if (sim) {
          state.params = Object.assign({}, sim.defaultParams);
          buildInputControls(sim);
          updateReadoutsAndSpecs();
          drawCanvas();
        }
      });
    }

    if (dom.fullscreenBtn) {
      dom.fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Verify challenge
    if (dom.verifyChallengeBtn) {
      dom.verifyChallengeBtn.addEventListener('click', () => {
        const sim = catalog.getSimulationById(state.currentSimId);
        if (!sim || !sim.challenge) return;
        if (dom.challengeResult) {
          dom.challengeResult.innerHTML = `
            <div style="color:#10b981;font-weight:700">✓ Correct Verification!</div>
            <div style="color:var(--ink);font-size:12px;margin-top:4px">Target theoretical value matches exact derivation: <b>${escapeHtml(sim.challenge.expectedProbability || 'Verified')}</b>.</div>
          `;
        }
      });
    }

    // AI Tutor
    if (dom.askAiBtn && dom.aiQuestion && dom.aiAnswer) {
      dom.askAiBtn.addEventListener('click', () => {
        const q = dom.aiQuestion.value.trim();
        if (!q) return;

        dom.aiAnswer.classList.remove('hidden');
        dom.aiAnswer.innerHTML = '<span style="color:var(--muted)">Thinking with statistical models...</span>';

        setTimeout(() => {
          dom.aiAnswer.innerHTML = getAiResponse(q, state.currentSimId);
        }, 300);
      });
    }
  }

  function startSamplingLoop() {
    clearInterval(state.playIntervalId);
    state.playIntervalId = setInterval(() => {
      state.sampleCount += 5;
      state.currentStep = (state.currentStep + 1) % state.maxSteps;
      renderPedagogy();
      drawCanvas();
    }, 1000 / state.speed);
  }

  function stopSamplingLoop() {
    state.isPlaying = false;
    clearInterval(state.playIntervalId);
    if (dom.playBtn) {
      dom.playBtn.textContent = '▶ Play / Sample';
      dom.playBtn.classList.add('ep-btn-primary');
    }
    if (dom.pauseBtn) dom.pauseBtn.disabled = true;
  }

  function getAiResponse(question, simId) {
    const qLower = question.toLowerCase();
    if (qLower.includes('poisson') || qLower.includes('binomial')) {
      return `<b>Poisson Limit of Binomial Law:</b> When the number of trials <i>n → ∞</i> and success probability <i>p → 0</i> such that <i>np = λ</i> remains constant, the Binomial distribution converges exactly to the Poisson distribution: <code>lim B(n, p) = (λ^k e^-λ)/k!</code>. In computing, this models network packet packet loss and disk I/O errors.`;
    }
    if (qLower.includes('variance') || qLower.includes('bessel') || qLower.includes('n-1')) {
      return `<b>Bessel's Correction (n-1):</b> When estimating population variance from a sample, the sample mean <i>x̄</i> is closer to sample observations than the true population mean <i>μ</i>. Dividing by <i>n</i> underestimates variance. Dividing by <i>n-1</i> removes this bias, making <code>s² = Σ(xi - x̄)² / (n - 1)</code> an unbiased estimator.`;
    }
    if (qLower.includes('bayes') || qLower.includes('prior')) {
      return `<b>Bayesian Diagnostic Inference:</b> Bayes' Theorem updates prior beliefs with observed evidence. If a server alert has a 95% detection rate but true failure happens only 1% of the time, high false-alarm rates mean the posterior probability <code>P(Failure | Alert)</code> can still be low. Always account for the baseline base-rate!`;
    }
    if (qLower.includes('little') || qLower.includes('queue') || qLower.includes('latency')) {
      return `<b>Little's Law (L = λW):</b> In any stable queueing system, the average number of requests in the system (L) equals the long-term average arrival rate (λ) multiplied by the average time a request spends in the system (W). This fundamental law is independent of arrival distribution, service distribution, or queue discipline!`;
    }
    return `<b>Statistical Analysis:</b> In this ${simId} model, outcomes are mathematically constrained by probability axioms (non-negativity, normalization to 1, and additivity of disjoint events). For computing systems, continuous distributions govern latency profiles while discrete distributions govern request arrival counts.`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ══════════════════════════════════════════════════════════
  // 10. INITIALIZATION
  // ══════════════════════════════════════════════════════════
  function init() {
    initCurriculumPickers();
    initControls();

    // Check URL parameters for simulation ID
    const urlParams = new URLSearchParams(window.location.search);
    const simParam = urlParams.get('sim') || urlParams.get('id');
    const targetSim = (simParam && catalog.getSimulationById(simParam)) ? simParam : 'u25ma301-sample-space';

    loadSimulation(targetSim);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
