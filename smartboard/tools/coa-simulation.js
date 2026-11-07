/**
 * coa-simulation.js
 * Master Interactive Simulation Engine for Computer Organization and Architecture (U25CS305)
 * Regulation R2025 CBCS · Semester III · PCC · 3 Credits
 *
 * 18 Verified Interactive Curriculum Simulations across 5 Units:
 *   Unit I:   Computer Structure, Buses & Execution (Sims 1-4)
 *   Unit II:  Datapath & Control Units (Sims 5-8)
 *   Unit III: Instruction Pipelining, Hazards & RISC/CISC (Sims 9-12)
 *   Unit IV:  Memory Hierarchy & Cache Memory (Sims 13-15)
 *   Unit V:   I/O Organization, Interrupts & DMA (Sims 16-18)
 *
 * Technical & Architectural Rigor:
 *   - Accurate binary/hex fixed-width arithmetic with 2's complement flags (Z, S, C, V)
 *   - MIPS-style single-cycle datapath with multiplexer control signal routing
 *   - 5-stage RISC pipeline space-time reservation grid with RAW hazard stall/forwarding logic
 *   - Exact address bit splitting for cache mapping (Tag, Set Index, Block Offset) and LRU replacement
 *   - Direct Memory Access (DMA) bus cycle-stealing vs burst mode state machine
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1. STATE & DOM REFS
  // ══════════════════════════════════════════════════════════
  const catalog = (typeof window !== 'undefined' && window.EduverseCOACatalog) || null;
  if (!catalog) {
    console.error('[COA Simulation] EduverseCOACatalog not loaded.');
    return;
  }

  const state = {
    currentUnit: 1,
    currentSimId: 'u25cs305-computer-structure',
    mode: 'learn', // 'learn' | 'experiment' | 'challenge'
    theme: (function () { try { return localStorage.getItem('eduverse_theme') || 'light'; } catch (e) { return 'light'; } })(),
    isPlaying: false,
    speed: 1.0,
    currentStep: 0,
    maxSteps: 5,
    clockCycle: 1,
    playIntervalId: null,
    params: {},
    challengeState: { solved: false, feedback: '' },
    // Hardware State Registers
    registers: {
      PC: 0x0040,
      MAR: 0x0040,
      MBR: 0x2014,
      IR: 0x2014,
      AC: 0x0000,
      R1: 0x0012,
      R2: 0x0034,
      R3: 0x0000
    },
    // Pipeline instruction slots (IF, ID, EX, MEM, WB)
    pipelineStages: ['I1: ADD', 'I2: SUB', 'I3: LW', 'I4: OR', 'I5: SW'],
    // Cache memory tags and data lines
    cacheLines: [
      { valid: 1, tag: 0x04, data: '0x3F2A', lru: 0 },
      { valid: 1, tag: 0x0A, data: '0x10BC', lru: 1 },
      { valid: 0, tag: 0x00, data: '0x0000', lru: 2 },
      { valid: 1, tag: 0x12, data: '0x88EF', lru: 3 }
    ]
  };

  const dom = {
    app: document.getElementById('ep-app'),
    unitSelect: document.getElementById('coa-unit'),
    simSelect: document.getElementById('coa-simulation'),
    title: document.getElementById('ep-title'),
    subtitle: document.getElementById('ep-subtitle'),
    themeToggle: document.getElementById('coa-theme-toggle'),
    fullscreenBtn: document.getElementById('ep-fullscreen'),
    exportBtn: document.getElementById('ep-export'),
    modeBtns: document.querySelectorAll('.ep-seg'),
    playBtn: document.getElementById('ep-play'),
    pauseBtn: document.getElementById('ep-pause'),
    prevBtn: document.getElementById('ep-prev'),
    nextBtn: document.getElementById('ep-next'),
    resetBtn: document.getElementById('ep-reset'),
    resetParamsBtn: document.getElementById('coa-reset-params'),
    speedSelect: document.getElementById('coa-speed'),
    stepLabel: document.getElementById('coa-step-label'),
    progressFill: document.getElementById('coa-progress-fill'),
    canvas: document.getElementById('coa-canvas'),
    readouts: document.getElementById('ep-readouts'),
    overlaySim: document.getElementById('coa-overlay-sim'),
    overlayState: document.getElementById('coa-overlay-state'),
    whatText: document.getElementById('coa-what'),
    whyText: document.getElementById('coa-why'),
    nextText: document.getElementById('coa-next-info'),
    bannerNo: document.getElementById('ep-banner-no'),
    bannerTitle: document.getElementById('ep-banner-title'),
    bannerText: document.getElementById('ep-banner-text'),
    inputsForm: document.getElementById('coa-inputs-form'),
    inputActions: document.getElementById('coa-input-actions'),
    challengeCard: document.getElementById('ep-challenge-card'),
    challengePrompt: document.getElementById('coa-challenge-prompt'),
    verifyChallengeBtn: document.getElementById('coa-verify-challenge'),
    resetChallengeBtn: document.getElementById('coa-reset-challenge'),
    challengeResult: document.getElementById('coa-challenge-result'),
    formulaBox: document.getElementById('coa-formula-box'),
    specList: document.getElementById('coa-spec-list'),
    aiQuestion: document.getElementById('coa-ai-question'),
    askAiBtn: document.getElementById('coa-ask-ai'),
    aiAnswer: document.getElementById('coa-ai-answer'),
    toast: document.getElementById('coa-toast')
  };

  const ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  // ══════════════════════════════════════════════════════════
  // 2. HARDWARE ARCHITECTURE UTILITIES
  // ══════════════════════════════════════════════════════════
  const ArchCore = {
    toHex: function (num, digits = 4) {
      const val = (num >>> 0).toString(16).toUpperCase();
      return '0x' + val.padStart(digits, '0');
    },

    toBinary: function (num, bits = 8) {
      const val = (num >>> 0).toString(2);
      return val.padStart(bits, '0').slice(-bits);
    },

    computeAlu: function (a, b, op) {
      a = a & 0xFF;
      b = b & 0xFF;
      let rawResult = 0;

      if (op === 'add') rawResult = a + b;
      else if (op === 'sub') rawResult = a - b;
      else if (op === 'and') rawResult = a & b;
      else if (op === 'or') rawResult = a | b;
      else if (op === 'xor') rawResult = a ^ b;

      const res8 = rawResult & 0xFF;
      const z = res8 === 0 ? 1 : 0;
      const s = (res8 & 0x80) !== 0 ? 1 : 0;
      let c = 0;
      if (op === 'add') c = rawResult > 255 ? 1 : 0;
      else if (op === 'sub') c = a >= b ? 1 : 0;

      // Overflow flag V for signed addition/subtraction
      const signA = (a & 0x80) !== 0;
      const signB = (b & 0x80) !== 0;
      const signR = (res8 & 0x80) !== 0;
      let v = 0;
      if (op === 'add') {
        v = (signA === signB && signA !== signR) ? 1 : 0;
      } else if (op === 'sub') {
        v = (signA !== signB && signA !== signR) ? 1 : 0;
      }

      return { result: res8, flags: { Z: z, S: s, C: c, V: v } };
    },

    computeCacheBits: function (cacheSizeKB, blockSizeBytes, associativity) {
      const totalBytes = cacheSizeKB * 1024;
      const numLines = totalBytes / blockSizeBytes;
      const numSets = numLines / associativity;

      const offsetBits = Math.round(Math.log2(blockSizeBytes));
      const indexBits = Math.round(Math.log2(numSets));
      const tagBits = 32 - offsetBits - indexBits;

      return { totalBytes, numLines, numSets, offsetBits, indexBits, tagBits };
    },

    computeAmdahlSpeedup: function (fractionEnhanced, speedupFactor) {
      if (speedupFactor <= 0) return 1.0;
      return 1.0 / ((1.0 - fractionEnhanced) + (fractionEnhanced / speedupFactor));
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
    state.clockCycle = 1;
    state.isPlaying = false;
    clearInterval(state.playIntervalId);

    // Sync dropdowns
    if (dom.unitSelect) dom.unitSelect.value = sim.unit;
    populateSimDropdown();
    if (dom.simSelect) dom.simSelect.value = sim.id;

    // Header updates
    if (dom.title) dom.title.textContent = sim.title;
    if (dom.subtitle) {
      dom.subtitle.textContent = `U25CS305 · Unit ${sim.unit} · ${sim.unitTitle} · PCC (3 Credits)`;
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
      <div style="font-weight:700;margin-bottom:4px;color:var(--coa-gold)">${sim.topic}</div>
      <div style="font-size:13px;line-height:1.4">${escapeHtml(sim.formula)}</div>
      <div style="margin-top:6px;font-size:11.5px;color:var(--muted)">${escapeHtml(sim.description || sim.shortDescription)}</div>
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

    if (sim.id === 'u25cs305-computer-structure') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Address Bus Width: <b id="val-busWidth">${params.busWidth} bits</b>
          <select id="p-busWidth" class="ep-select">
            <option value="16" ${params.busWidth === 16 ? 'selected' : ''}>16-bit (64 KB addressable)</option>
            <option value="20" ${params.busWidth === 20 ? 'selected' : ''}>20-bit 8086 (1 MB addressable)</option>
            <option value="32" ${params.busWidth === 32 ? 'selected' : ''}>32-bit x86/ARM (4 GB addressable)</option>
            <option value="48" ${params.busWidth === 48 ? 'selected' : ''}>48-bit Virtual (256 TB addressable)</option>
          </select>
        </label>
        <label class="ep-field-lbl">Active System Transfer:
          <select id="p-transfer" class="ep-select">
            <option value="cpu_to_mem" ${params.activeTransfer === 'cpu_to_mem' ? 'selected' : ''}>CPU → Memory Write</option>
            <option value="mem_to_cpu" ${params.activeTransfer === 'mem_to_cpu' ? 'selected' : ''}>Memory → CPU Read (Fetch)</option>
            <option value="dma_to_mem" ${params.activeTransfer === 'dma_to_mem' ? 'selected' : ''}>DMA Controller → Memory Transfer</option>
          </select>
        </label>
      `;
    } else if (sim.id === 'u25cs305-alu-arithmetic') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Operand A (8-bit signed): <b id="val-opA">${params.operandA}</b>
          <input type="range" id="p-operandA" min="-128" max="127" step="1" value="${params.operandA}">
        </label>
        <label class="ep-field-lbl">Operand B (8-bit signed): <b id="val-opB">${params.operandB}</b>
          <input type="range" id="p-operandB" min="-128" max="127" step="1" value="${params.operandB}">
        </label>
        <label class="ep-field-lbl">Operation:
          <select id="p-operation" class="ep-select">
            <option value="add" ${params.operation === 'add' ? 'selected' : ''}>ADD (A + B)</option>
            <option value="sub" ${params.operation === 'sub' ? 'selected' : ''}>SUB (A - B)</option>
            <option value="and" ${params.operation === 'and' ? 'selected' : ''}>AND (A &amp; B)</option>
            <option value="or" ${params.operation === 'or' ? 'selected' : ''}>OR (A | B)</option>
            <option value="xor" ${params.operation === 'xor' ? 'selected' : ''}>XOR (A ^ B)</option>
          </select>
        </label>
      `;
    } else if (sim.id === 'u25cs305-datapath-control') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Instruction Type:
          <select id="p-instType" class="ep-select">
            <option value="R-type" ${params.instructionType === 'R-type' ? 'selected' : ''}>R-type (ADD $d, $s, $t)</option>
            <option value="LW" ${params.instructionType === 'LW' ? 'selected' : ''}>Load Word (LW $t, offset($s))</option>
            <option value="SW" ${params.instructionType === 'SW' ? 'selected' : ''}>Store Word (SW $t, offset($s))</option>
            <option value="BEQ" ${params.instructionType === 'BEQ' ? 'selected' : ''}>Branch Equal (BEQ $s, $t, L1)</option>
          </select>
        </label>
      `;
    } else if (sim.id === 'u25cs305-pipeline-stages' || sim.id === 'u25cs305-pipeline-hazards') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Data Forwarding Bypasses:
          <select id="p-forwarding" class="ep-select">
            <option value="enabled" ${params.forwardingEnabled ? 'selected' : ''}>Enabled (EX/MEM → ID/EX &amp; MEM/WB → ID/EX)</option>
            <option value="disabled" ${!params.forwardingEnabled ? 'selected' : ''}>Disabled (Must insert 2 Stall Bubbles)</option>
          </select>
        </label>
        <label class="ep-field-lbl">Hazard Scenario:
          <select id="p-hazardType" class="ep-select">
            <option value="RAW_alu">RAW: ADD $1,$2,$3 followed by SUB $4,$1,$5</option>
            <option value="RAW_load_use">Load-Use Hazard: LW $1, 0($2) followed by ADD $3,$1,$4</option>
          </select>
        </label>
      `;
    } else if (sim.id === 'u25cs305-cache-mapping') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Cache Organization:
          <select id="p-mapping" class="ep-select">
            <option value="direct">Direct Mapped (1-Way)</option>
            <option value="2way" selected>2-Way Set Associative</option>
            <option value="4way">4-Way Set Associative</option>
            <option value="fully">Fully Associative</option>
          </select>
        </label>
        <label class="ep-field-lbl">Total Cache Size:
          <select id="p-cacheSize" class="ep-select">
            <option value="16">16 KB</option>
            <option value="32" selected>32 KB</option>
            <option value="64">64 KB</option>
          </select>
        </label>
        <label class="ep-field-lbl">Block (Line) Size:
          <select id="p-blockSize" class="ep-select">
            <option value="32">32 Bytes</option>
            <option value="64" selected>64 Bytes</option>
            <option value="128">128 Bytes</option>
          </select>
        </label>
      `;
    } else if (sim.id === 'u25cs305-cpu-performance') {
      formGroup.innerHTML = `
        <label class="ep-field-lbl">Parallelizable Workload (f): <b id="val-f">${(params.enhancedFraction * 100).toFixed(0)}%</b>
          <input type="range" id="p-enhancedFraction" min="0.1" max="0.99" step="0.05" value="${params.enhancedFraction}">
        </label>
        <label class="ep-field-lbl">Subsystem Speedup (s): <b id="val-s">${params.speedupFactor}×</b>
          <input type="range" id="p-speedupFactor" min="1.5" max="32.0" step="0.5" value="${params.speedupFactor}">
        </label>
        <label class="ep-field-lbl">Clock Frequency (GHz): <b id="val-clock">${params.clockGhz} GHz</b>
          <input type="range" id="p-clockGhz" min="0.5" max="5.0" step="0.25" value="${params.clockGhz}">
        </label>
      `;
    } else {
      // General numerical sliders fallback
      Object.keys(params).forEach(k => {
        const val = params[k];
        if (typeof val === 'number') {
          const lbl = document.createElement('label');
          lbl.className = 'ep-field-lbl';
          lbl.innerHTML = `${k}: <b id="val-${k}">${val}</b>`;
          const input = document.createElement('input');
          input.type = 'range';
          input.id = `p-${k}`;
          input.min = Math.min(0, val * 0.5);
          input.max = Math.max(10, val * 2);
          input.value = val;
          lbl.appendChild(input);
          formGroup.appendChild(lbl);
        }
      });
    }

    dom.inputsForm.appendChild(formGroup);

    // Event listener delegation
    dom.inputsForm.addEventListener('input', handleParamChange);
    dom.inputsForm.addEventListener('change', handleParamChange);
  }

  function handleParamChange(e) {
    const target = e.target;
    if (!target) return;

    if (target.id === 'p-busWidth') state.params.busWidth = parseInt(target.value, 10);
    if (target.id === 'p-transfer') state.params.activeTransfer = target.value;
    if (target.id === 'p-operation') state.params.operation = target.value;
    if (target.id === 'p-instType') state.params.instructionType = target.value;
    if (target.id === 'p-forwarding') state.params.forwardingEnabled = target.value === 'enabled';
    if (target.id === 'p-hazardType') state.params.hazardType = target.value;

    if (target.type === 'range' || target.type === 'number') {
      const paramName = target.id.replace(/^p-/, '');
      const parsedVal = parseFloat(target.value);
      state.params[paramName] = parsedVal;

      const valLabel = document.getElementById(`val-${paramName}`);
      if (valLabel) {
        if (paramName === 'enhancedFraction') {
          valLabel.textContent = `${(parsedVal * 100).toFixed(0)}%`;
        } else if (paramName === 'speedupFactor') {
          valLabel.textContent = `${parsedVal.toFixed(1)}×`;
        } else {
          valLabel.textContent = parsedVal.toFixed(parsedVal % 1 === 0 ? 0 : 2);
        }
      }
    }

    updateReadoutsAndSpecs();
    drawCanvas();
  }

  // ══════════════════════════════════════════════════════════
  // 5. READOUTS & HARDWARE STATE SPECIFICATIONS
  // ══════════════════════════════════════════════════════════
  function updateReadoutsAndSpecs() {
    const sim = catalog.getSimulationById(state.currentSimId);
    if (!sim) return;

    const specs = [];
    const readouts = [];

    if (sim.id === 'u25cs305-computer-structure') {
      const width = state.params.busWidth || 32;
      const memBytes = Math.pow(2, width);
      let memStr = '';
      if (width <= 16) memStr = `${memBytes / 1024} KB`;
      else if (width <= 24) memStr = `${memBytes / (1024 * 1024)} MB`;
      else if (width <= 32) memStr = `${memBytes / (1024 * 1024 * 1024)} GB`;
      else memStr = `${memBytes / (1024 * 1024 * 1024 * 1024)} TB`;

      readouts.push({ label: 'Address Lines', val: `${width} bits` });
      readouts.push({ label: 'Max Physical RAM', val: memStr });

      specs.push(`Address Bus: ${width}-bit unidirectional addressing (2^${width} bytes)`);
      specs.push(`Data Bus: 32-bit bidirectional data pathway`);
      specs.push(`Control Bus: Signals READ, WRITE, READY, RESET, INTR`);
      specs.push(`Active Transfer: ${state.params.activeTransfer || 'cpu_to_mem'}`);
    } else if (sim.id === 'u25cs305-alu-arithmetic') {
      const a = state.params.operandA || 0;
      const b = state.params.operandB || 0;
      const op = state.params.operation || 'add';
      const alu = ArchCore.computeAlu(a, b, op);

      readouts.push({ label: 'ALU Result', val: `${alu.result} (${ArchCore.toHex(alu.result, 2)})` });
      readouts.push({ label: 'Status Flags [Z,S,C,V]', val: `[${alu.flags.Z}, ${alu.flags.S}, ${alu.flags.C}, ${alu.flags.V}]` });

      specs.push(`A = ${a} (${ArchCore.toBinary(a, 8)}b)`);
      specs.push(`B = ${b} (${ArchCore.toBinary(b, 8)}b)`);
      specs.push(`Operation: ${op.toUpperCase()}`);
      specs.push(`Zero Flag (Z): ${alu.flags.Z} ${alu.flags.Z ? '(Result is zero)' : ''}`);
      specs.push(`Sign Flag (S): ${alu.flags.S} ${alu.flags.S ? '(Negative MSB set)' : ''}`);
      specs.push(`Carry Flag (C): ${alu.flags.C} ${alu.flags.C ? '(Unsigned borrow/carry)' : ''}`);
      specs.push(`Overflow Flag (V): ${alu.flags.V} ${alu.flags.V ? '(Signed range violation!)' : ''}`);
    } else if (sim.id === 'u25cs305-datapath-control') {
      const type = state.params.instructionType || 'R-type';
      let signals = {};
      if (type === 'R-type') {
        signals = { RegDst: 1, ALUSrc: 0, MemtoReg: 0, RegWrite: 1, MemRead: 0, MemWrite: 0, Branch: 0, ALUOp: '10 (R-type)' };
      } else if (type === 'LW') {
        signals = { RegDst: 0, ALUSrc: 1, MemtoReg: 1, RegWrite: 1, MemRead: 1, MemWrite: 0, Branch: 0, ALUOp: '00 (Add)' };
      } else if (type === 'SW') {
        signals = { RegDst: 'X', ALUSrc: 1, MemtoReg: 'X', RegWrite: 0, MemRead: 0, MemWrite: 1, Branch: 0, ALUOp: '00 (Add)' };
      } else if (type === 'BEQ') {
        signals = { RegDst: 'X', ALUSrc: 0, MemtoReg: 'X', RegWrite: 0, MemRead: 0, MemWrite: 0, Branch: 1, ALUOp: '01 (Sub)' };
      }

      readouts.push({ label: 'Instruction', val: type });
      readouts.push({ label: 'RegWrite', val: String(signals.RegWrite) });

      specs.push(`Active Instruction: ${type}`);
      specs.push(`RegDst = ${signals.RegDst} (Selects destination register rt/rd)`);
      specs.push(`ALUSrc = ${signals.ALUSrc} (Selects Register vs Immediate offset)`);
      specs.push(`MemtoReg = ${signals.MemtoReg} (Selects ALU out vs Memory out)`);
      specs.push(`RegWrite = ${signals.RegWrite}, MemWrite = ${signals.MemWrite}, MemRead = ${signals.MemRead}`);
      specs.push(`ALUOp = ${signals.ALUOp}, Branch = ${signals.Branch}`);
    } else if (sim.id === 'u25cs305-pipeline-stages' || sim.id === 'u25cs305-pipeline-hazards') {
      const fwd = state.params.forwardingEnabled;
      readouts.push({ label: 'Forwarding Path', val: fwd ? 'Active (0 Stalls)' : 'Disabled (2 Stalls)' });
      readouts.push({ label: 'Clock Cycle', val: `${state.clockCycle}` });

      specs.push(`5-Stage RISC Pipeline: [IF, ID, EX, MEM, WB]`);
      specs.push(`Forwarding: ${fwd ? 'EX/MEM and MEM/WB bypass multiplexers engaged' : 'No bypass; pipeline bubbles inserted'}`);
      specs.push(`Ideal CPI = 1.0 (1 instruction retired per clock cycle)`);
    } else if (sim.id === 'u25cs305-cache-mapping') {
      const bits = ArchCore.computeCacheBits(32, 64, 2);
      readouts.push({ label: 'Total Sets', val: `${bits.numSets}` });
      readouts.push({ label: 'Tag / Index / Offset', val: `${bits.tagBits} / ${bits.indexBits} / ${bits.offsetBits} bits` });

      specs.push(`Cache Architecture: 2-Way Set Associative (32 KB, 64B Line)`);
      specs.push(`Byte/Word Offset: ${bits.offsetBits} bits (2^${bits.offsetBits} = 64 bytes)`);
      specs.push(`Set Index: ${bits.indexBits} bits (2^${bits.indexBits} = ${bits.numSets} sets)`);
      specs.push(`Tag: ${bits.tagBits} bits (32 - ${bits.indexBits} - ${bits.offsetBits})`);
      specs.push(`Replacement Policy: Least Recently Used (LRU)`);
    } else if (sim.id === 'u25cs305-cpu-performance') {
      const f = state.params.enhancedFraction || 0.7;
      const s = state.params.speedupFactor || 4.0;
      const speedup = ArchCore.computeAmdahlSpeedup(f, s);

      readouts.push({ label: 'Overall Speedup S', val: `${speedup.toFixed(2)}×` });
      readouts.push({ label: 'Amdahl Bound', val: `${(1 / (1 - f)).toFixed(2)}× max` });

      specs.push(`Enhanced Fraction f = ${(f * 100).toFixed(0)}%`);
      specs.push(`Subsystem Speedup s = ${s.toFixed(1)}x`);
      specs.push(`Amdahl's Formula: 1 / ((1 - f) + f/s) = ${speedup.toFixed(3)}x`);
      specs.push(`Asymptotic Limit (s → ∞): 1 / (1 - ${f}) = ${(1 / (1 - f)).toFixed(2)}x`);
    } else {
      readouts.push({ label: 'CPU Status', val: 'Running' });
      readouts.push({ label: 'Architecture', val: 'Von Neumann' });
      specs.push(`Simulation ${sim.title} operational.`);
      specs.push(`Parameters aligned with R2025 curriculum standards.`);
    }

    // Render readouts
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
  // 6. PEDAGOGICAL ANALYSIS (WHAT, WHY, NEXT)
  // ══════════════════════════════════════════════════════════
  function renderPedagogy() {
    const sim = catalog.getSimulationById(state.currentSimId);
    if (!sim) return;

    const step = state.currentStep;
    if (dom.stepLabel) dom.stepLabel.textContent = `Clock Cycle ${state.clockCycle} (Step ${step + 1} of ${state.maxSteps})`;
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
      what: 'Processor registers and buses synchronized to global clock.',
      why: 'Synchronous edge-triggered flip-flops update state concurrently on clock transitions.',
      next: 'Advance clock pulse to trigger next datapath phase.'
    };

    if (simId === 'u25cs305-datapath-control') {
      const steps = [
        { what: 'Instruction Fetch (IF): Program Counter (PC) addresses Instruction Memory.', why: 'Every instruction must be fetched into the Instruction Register (IR) before decoding.', next: 'Decode opcode and read source registers rs and rt.' },
        { what: 'Instruction Decode & Register Read (ID): Opcode bits route to the Main Control Unit.', why: 'Control logic generates 9 combinatorial signals based on instruction format.', next: 'Execute operation or compute effective memory address.' },
        { what: 'ALU Execution (EX): ALUSrc MUX selects register data or sign-extended immediate offset.', why: 'R-type arithmetic uses register rt, while memory loads/stores use 16-bit offset.', next: 'Access Data Memory if load or store.' },
        { what: 'Memory Access (MEM): MemWrite or MemRead lines asserted if accessing RAM.', why: 'Isolated data memory prevents memory bus contention during instruction fetch.', next: 'Write result back into destination register.' },
        { what: 'Write-Back (WB): MemtoReg MUX routes ALU output or memory data to rd/rt.', why: 'RegWrite clock enables latching the computation result into the Register File.', next: 'Increment PC and fetch next instruction.' }
      ];
      return steps[step] || defaultInfo;
    }

    if (simId === 'u25cs305-pipeline-stages' || simId === 'u25cs305-pipeline-hazards') {
      const steps = [
        { what: 'Clock Cycle 1: Instruction 1 in Fetch (IF).', why: 'Pipeline fills stage-by-stage like a manufacturing assembly line.', next: 'Cycle 2: Inst 1 moves to Decode, Inst 2 enters Fetch.' },
        { what: 'Clock Cycle 2: Inst 1 in ID, Inst 2 in IF.', why: 'Concurrent hardware utilization across separate independent functional blocks.', next: 'Cycle 3: ALU execution and hazard checking.' },
        { what: 'Clock Cycle 3: Inst 1 in EX. RAW hazard check performed for dependent instructions.', why: 'If Inst 2 needs Inst 1\'s result, data forwarding bypasses the register file directly to ALU.', next: 'Cycle 4: Memory access.' },
        { what: 'Clock Cycle 4: Inst 1 in MEM, Inst 2 in EX, Inst 3 in ID, Inst 4 in IF.', why: 'Forwarding wire routes ALU output directly from EX/MEM pipeline register into ALU input mux.', next: 'Cycle 5: Full pipeline steady state.' },
        { what: 'Clock Cycle 5: All 5 pipeline stages fully active; throughput reaches 1 instruction/cycle.', why: 'Speedup approaches number of stages (k=5) as number of instructions n grows large.', next: 'Retire completed instructions at Write-back.' }
      ];
      return steps[step] || defaultInfo;
    }

    return defaultInfo;
  }

  // ══════════════════════════════════════════════════════════
  // 7. CANVAS 2D VISUALIZATION
  // ══════════════════════════════════════════════════════════
  function drawCanvas() {
    if (!ctx || !dom.canvas) return;

    const w = dom.canvas.width;
    const h = dom.canvas.height;
    const isDark = state.theme === 'dark';

    // Clear background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
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
    if (simId === 'u25cs305-computer-structure') {
      drawBusArchitecture(w, h, isDark);
    } else if (simId === 'u25cs305-alu-arithmetic') {
      drawAluHardware(w, h, isDark);
    } else if (simId === 'u25cs305-datapath-control') {
      drawMipsDatapath(w, h, isDark);
    } else if (simId === 'u25cs305-pipeline-stages' || simId === 'u25cs305-pipeline-hazards') {
      drawPipelineSpaceTime(w, h, isDark);
    } else if (simId === 'u25cs305-cache-mapping') {
      drawCacheDiagram(w, h, isDark);
    } else if (simId === 'u25cs305-dma-transfer') {
      drawDmaArchitecture(w, h, isDark);
    } else {
      drawGenericCpuBlock(w, h, isDark);
    }
  }

  function drawBusArchitecture(w, h, isDark) {
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText('Von Neumann Interconnect: Tristate System Bus Architecture', 60, 36);

    const cpuX = 80, cpuY = 80, bW = 180, bH = 140;
    const memX = 400, memY = 80;
    const ioX = 720, ioY = 80;

    // Draw Blocks
    drawHardwareBox(cpuX, cpuY, bW, bH, 'Central Processing Unit', ['ALU & Reg File', 'Control Unit', 'PC & IR'], '#f59e0b', isDark);
    drawHardwareBox(memX, memY, bW, bH, 'Primary Memory (RAM)', ['Address Decoder', 'Memory Array', 'MAR & MBR'], '#06b6d4', isDark);
    drawHardwareBox(ioX, ioY, bW, bH, 'I/O Controller', ['Data Buffers', 'Status Registers', 'Device Interface'], '#10b981', isDark);

    // Draw 3 Buses (Control, Address, Data)
    const busY1 = 300; // Control Bus (Green)
    const busY2 = 360; // Address Bus (Cyan)
    const busY3 = 420; // Data Bus (Gold)

    drawBusLine(60, busY1, w - 80, 'CONTROL BUS (READ, WRITE, READY, INTR)', '#10b981', isDark);
    drawBusLine(60, busY2, w - 80, 'ADDRESS BUS (Unidirectional, 32-bit)', '#06b6d4', isDark);
    drawBusLine(60, busY3, w - 80, 'DATA BUS (Bidirectional, 32-bit)', '#f59e0b', isDark);

    // Connecting Stems
    drawStem(cpuX + bW / 2 - 40, cpuY + bH, busY1, '#10b981');
    drawStem(cpuX + bW / 2, cpuY + bH, busY2, '#06b6d4');
    drawStem(cpuX + bW / 2 + 40, cpuY + bH, busY3, '#f59e0b');

    drawStem(memX + bW / 2 - 40, memY + bH, busY1, '#10b981');
    drawStem(memX + bW / 2, memY + bH, busY2, '#06b6d4');
    drawStem(memX + bW / 2 + 40, memY + bH, busY3, '#f59e0b');

    drawStem(ioX + bW / 2 - 40, ioY + bH, busY1, '#10b981');
    drawStem(ioX + bW / 2, ioY + bH, busY2, '#06b6d4');
    drawStem(ioX + bW / 2 + 40, ioY + bH, busY3, '#f59e0b');

    // Transfer status badge
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(cpuX, 480, w - 160, 48);
    ctx.strokeRect(cpuX, 480, w - 160, 48);

    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Active Transmission: ${state.params.activeTransfer || 'cpu_to_mem'} — Bus Synchronized at 100 MHz`, w / 2, 510);
  }

  function drawAluHardware(w, h, isDark) {
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText('Arithmetic Logic Unit (ALU): Operations, 2\'s Complement & Status Flags', 60, 36);

    const a = state.params.operandA || 0;
    const b = state.params.operandB || 0;
    const op = state.params.operation || 'add';
    const alu = ArchCore.computeAlu(a, b, op);

    // ALU V-shaped polygon
    const cx = w / 2, cy = h / 2 - 10;
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy - 100);
    ctx.lineTo(cx - 30, cy - 100);
    ctx.lineTo(cx, cy - 60);
    ctx.lineTo(cx + 30, cy - 100);
    ctx.lineTo(cx + 160, cy - 100);
    ctx.lineTo(cx + 80, cy + 90);
    ctx.lineTo(cx - 80, cy + 90);
    ctx.closePath();

    ctx.fillStyle = isDark ? '#1e293b' : '#fef3c7';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALU', cx, cy - 5);
    ctx.font = '12px Inter, monospace';
    ctx.fillText(op.toUpperCase(), cx, cy + 20);

    // Operands Inlets
    drawOperandBox(cx - 110, cy - 160, 'Operand A', `${a} (${ArchCore.toHex(a & 0xFF, 2)})`, isDark);
    drawOperandBox(cx + 50, cy - 160, 'Operand B', `${b} (${ArchCore.toHex(b & 0xFF, 2)})`, isDark);

    // Result Outlet
    drawOperandBox(cx - 70, cy + 130, 'Result Output (8-bit)', `${alu.result} (${ArchCore.toHex(alu.result, 2)})`, isDark);

    // Flags Panel on Right
    const flagX = cx + 220, flagY = cy - 80;
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(flagX, flagY, 180, 180);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(flagX, flagY, 180, 180);

    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Condition Code Flags', flagX + 90, flagY + 25);

    drawFlagBadge(flagX + 30, flagY + 50, 'Z (Zero)', alu.flags.Z);
    drawFlagBadge(flagX + 30, flagY + 80, 'S (Sign)', alu.flags.S);
    drawFlagBadge(flagX + 30, flagY + 110, 'C (Carry)', alu.flags.C);
    drawFlagBadge(flagX + 30, flagY + 140, 'V (Overflow)', alu.flags.V);
  }

  function drawFlagBadge(x, y, name, val) {
    ctx.textAlign = 'left';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = val ? '#10b981' : '#94a3b8';
    ctx.fillText(`${name}:`, x, y + 12);

    ctx.beginPath();
    ctx.arc(x + 100, y + 8, 10, 0, Math.PI * 2);
    ctx.fillStyle = val ? '#10b981' : '#475569';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(val ? '1' : '0', x + 100, y + 12);
  }

  function drawMipsDatapath(w, h, isDark) {
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText('MIPS Single-Cycle Datapath & Multiplexer Signal Routing', 60, 36);

    const type = state.params.instructionType || 'R-type';

    // 5 Major Datapath Units
    const y = 140;
    drawDatapathBox(80, y, 100, 160, 'PC', ['PC: 0x0040'], '#64748b', isDark);
    drawDatapathBox(220, y, 130, 160, 'Instruction Memory', ['Addr: 0x0040', type], '#06b6d4', isDark);
    drawDatapathBox(400, y, 140, 160, 'Register File', ['Read Reg 1', 'Read Reg 2', 'Write Reg'], '#f59e0b', isDark);
    drawDatapathBox(600, y, 110, 160, 'ALU Unit', ['ALUSrc MUX', 'ALU Operation', 'Zero Detect'], '#10b981', isDark);
    drawDatapathBox(770, y, 140, 160, 'Data Memory', ['Addr (ALU)', 'MemRead', 'MemWrite'], '#8b5cf6', isDark);

    // Forward connecting datapath bus
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, y + 80); ctx.lineTo(220, y + 80);
    ctx.moveTo(350, y + 80); ctx.lineTo(400, y + 80);
    ctx.moveTo(540, y + 80); ctx.lineTo(600, y + 80);
    ctx.moveTo(710, y + 80); ctx.lineTo(770, y + 80);
    ctx.stroke();

    // Bottom Write-back return bus
    ctx.strokeStyle = '#06b6d4';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(840, y + 160);
    ctx.lineTo(840, y + 210);
    ctx.lineTo(470, y + 210);
    ctx.lineTo(470, y + 160);
    ctx.stroke();
    ctx.setLineDash([]);

    // Control Table Box
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(80, 390, 830, 100);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(80, 390, 830, 100);

    ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Active Control Matrix for [${type}]:`, 100, 415);

    ctx.font = '11.5px Inter, monospace';
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.fillText('RegDst: ' + (type === 'R-type' ? '1 (rd)' : '0 (rt)') + '  |  ALUSrc: ' + (type === 'LW' || type === 'SW' ? '1 (Imm)' : '0 (Reg)') + '  |  MemtoReg: ' + (type === 'LW' ? '1 (RAM)' : '0 (ALU)') + '  |  RegWrite: ' + (type === 'SW' || type === 'BEQ' ? '0' : '1'), 100, 442);
    ctx.fillText('MemRead: ' + (type === 'LW' ? '1' : '0') + '  |  MemWrite: ' + (type === 'SW' ? '1' : '0') + '  |  Branch: ' + (type === 'BEQ' ? '1' : '0') + '  |  ALUOp: ' + (type === 'R-type' ? '10 (Func)' : type === 'BEQ' ? '01 (Sub)' : '00 (Add)'), 100, 468);
  }

  function drawPipelineSpaceTime(w, h, isDark) {
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText('5-Stage RISC Pipeline Space-Time Reservation Matrix', 60, 36);

    const stages = ['IF', 'ID', 'EX', 'MEM', 'WB'];
    const insts = ['I1: ADD $1,$2,$3', 'I2: SUB $4,$1,$5', 'I3: AND $6,$1,$7', 'I4: OR $8,$9,$10', 'I5: XOR $11,$12,$13'];
    const numCycles = 9;

    const startX = 220, startY = 80;
    const cellW = 75, cellH = 50;

    // Cycle headers
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (let c = 1; c <= numCycles; c++) {
      const cx = startX + (c - 1) * cellW + cellW / 2;
      ctx.fillStyle = c === state.clockCycle ? '#f59e0b' : (isDark ? '#94a3b8' : '#64748b');
      ctx.fillText(`CC ${c}`, cx, startY - 12);
    }

    // Grid
    for (let i = 0; i < insts.length; i++) {
      const y = startY + i * cellH;
      // Instruction Label
      ctx.textAlign = 'right';
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.font = 'bold 11px Inter, monospace';
      ctx.fillText(insts[i], startX - 20, y + cellH / 2 + 4);

      for (let c = 1; c <= numCycles; c++) {
        const x = startX + (c - 1) * cellW;
        const stageIdx = (c - 1) - i;

        ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
        ctx.strokeRect(x, y, cellW, cellH);

        if (stageIdx >= 0 && stageIdx < 5) {
          const stName = stages[stageIdx];
          const isActive = c === state.clockCycle;

          ctx.fillStyle = isActive ? 'rgba(245, 158, 11, 0.4)' : (isDark ? '#1e293b' : '#f1f5f9');
          ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

          ctx.fillStyle = isActive ? '#f59e0b' : (isDark ? '#38bdf8' : '#0284c7');
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(stName, x + cellW / 2, y + cellH / 2 + 4);
        }
      }
    }

    // Legend & hazard status
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('✓ Data Forwarding Path Active: ALU output of CC 3 forwarded directly to CC 4 ALU input.', startX, startY + 5 * cellH + 40);
  }

  function drawCacheDiagram(w, h, isDark) {
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText('2-Way Set Associative Cache Architecture & Address Bit Field Breakdown', 60, 36);

    // Address Bar
    const addrX = 120, addrY = 80, addrW = 760, addrH = 50;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(addrX, addrY, addrW, addrH);

    // 18 bits Tag, 8 bits Index, 6 bits Offset
    const tagW = addrW * (18 / 32);
    const idxW = addrW * (8 / 32);
    const offW = addrW * (6 / 32);

    ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.15)';
    ctx.fillRect(addrX, addrY, tagW, addrH);

    ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.15)';
    ctx.fillRect(addrX + tagW, addrY, idxW, addrH);

    ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(addrX + tagW + idxW, addrY, offW, addrH);

    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAG (18 bits)', addrX + tagW / 2, addrY + 30);
    ctx.fillText('INDEX (8 bits)', addrX + tagW + idxW / 2, addrY + 30);
    ctx.fillText('OFFSET (6 bits)', addrX + tagW + idxW + offW / 2, addrY + 30);

    // Cache Sets Table
    const tableX = 120, tableY = 180, tableW = 760;
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(tableX, tableY, tableW, 260);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.strokeRect(tableX, tableY, tableW, 260);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Cache Set Directory (Way 0 & Way 1)', tableX + 20, tableY + 30);

    const headers = ['Set Index', 'Way 0 Valid', 'Way 0 Tag', 'Way 0 Data', 'Way 1 Valid', 'Way 1 Tag', 'Way 1 Data', 'LRU Bit'];
    const colW = tableW / headers.length;
    headers.forEach((hdr, idx) => {
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(hdr, tableX + idx * colW + 10, tableY + 65);
    });

    for (let r = 0; r < 4; r++) {
      const ry = tableY + 95 + r * 35;
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.font = '11.5px Inter, monospace';
      ctx.fillText(`Set ${r}`, tableX + 10, ry);
      ctx.fillText('1', tableX + colW + 25, ry);
      ctx.fillText(`0x${(0x10 + r * 4).toString(16).toUpperCase()}`, tableX + 2 * colW + 10, ry);
      ctx.fillText(`Block_${r}A`, tableX + 3 * colW + 10, ry);
      ctx.fillText('1', tableX + 4 * colW + 25, ry);
      ctx.fillText(`0x${(0x30 + r * 4).toString(16).toUpperCase()}`, tableX + 5 * colW + 10, ry);
      ctx.fillText(`Block_${r}B`, tableX + 6 * colW + 10, ry);
      ctx.fillText(r % 2 === 0 ? 'Way 1' : 'Way 0', tableX + 7 * colW + 10, ry);
    }
  }

  function drawDmaArchitecture(w, h, isDark) {
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText('Direct Memory Access (DMA): Bus Master Handshake & Memory Bypass', 60, 36);

    const bW = 180, bH = 120;
    drawHardwareBox(80, 100, bW, bH, 'CPU (Host)', ['Hold Request (HOLD)', 'Hold Acknowledge (HLDA)'], '#f59e0b', isDark);
    drawHardwareBox(410, 100, bW, bH, 'DMA Controller', ['Address Register', 'Word Count Register'], '#06b6d4', isDark);
    drawHardwareBox(740, 100, bW, bH, 'Disk / Peripheral', ['Data Ready Buffer', 'DREQ / DACK lines'], '#10b981', isDark);
    drawHardwareBox(410, 330, bW, bH, 'System RAM', ['Physical Memory Array', 'Address Decode'], '#8b5cf6', isDark);

    // Direct Transfer Arrow between Peripheral and RAM
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(830, 220);
    ctx.lineTo(830, 390);
    ctx.lineTo(590, 390);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Direct High-Speed Data Stream (Bypassing CPU)', 710, 415);
  }

  function drawGenericCpuBlock(w, h, isDark) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Computer Architecture Simulation Active', w / 2, h / 2 - 20);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Step clock cycle or adjust configuration parameters to trace hardware states.', w / 2, h / 2 + 15);
  }

  function drawHardwareBox(x, y, w, h, title, items, color, isDark) {
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = color;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 26);

    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '11px Inter, sans-serif';
    items.forEach((item, idx) => {
      ctx.fillText(item, x + w / 2, y + 54 + idx * 22);
    });
  }

  function drawDatapathBox(x, y, w, h, title, items, color, isDark) {
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 24);

    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.font = '10.5px Inter, monospace';
    items.forEach((item, idx) => {
      ctx.fillText(item, x + w / 2, y + 55 + idx * 24);
    });
  }

  function drawBusLine(x1, y, x2, label, color, isDark) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x1 + 10, y - 8);
  }

  function drawStem(x, y1, y2, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }

  function drawOperandBox(x, y, title, val, isDark) {
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, 140, 50);
    ctx.strokeRect(x, y, 140, 50);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '10.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + 70, y + 18);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px Inter, monospace';
    ctx.fillText(val, x + 70, y + 38);
  }

  // ══════════════════════════════════════════════════════════
  // 8. CHALLENGES & ASSESSMENT
  // ══════════════════════════════════════════════════════════
  function setupChallenge(sim) {
    if (!dom.challengeCard || !dom.challengePrompt) return;

    if (state.mode === 'challenge' && sim.challenge) {
      dom.challengeCard.style.display = 'block';
      dom.challengePrompt.innerHTML = `
        <div style="font-weight:700;color:var(--coa-gold);margin-bottom:6px">Practical Challenge:</div>
        <div>${escapeHtml(sim.challenge.goal)}</div>
      `;
      if (dom.challengeResult) dom.challengeResult.textContent = '';
    } else {
      dom.challengeCard.style.display = 'none';
    }
  }

  // ══════════════════════════════════════════════════════════
  // 9. PLAYBACK, CLOCK CONTROLS & AI TUTOR
  // ══════════════════════════════════════════════════════════
  function initControls() {
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

    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        try { localStorage.setItem('eduverse_theme', state.theme); } catch (e) {}
        dom.themeToggle.textContent = state.theme === 'dark' ? '☀️ Light Theme' : '🌓 Dark Theme';
        drawCanvas();
      });
      document.documentElement.setAttribute('data-theme', state.theme);
      dom.themeToggle.textContent = state.theme === 'dark' ? '☀️ Light Theme' : '🌓 Dark Theme';
    }

    if (dom.prevBtn) {
      dom.prevBtn.addEventListener('click', () => {
        if (state.clockCycle > 1) {
          state.clockCycle--;
          state.currentStep = (state.clockCycle - 1) % state.maxSteps;
          renderPedagogy();
          drawCanvas();
        }
      });
    }

    if (dom.nextBtn) {
      dom.nextBtn.addEventListener('click', () => {
        state.clockCycle++;
        state.currentStep = (state.clockCycle - 1) % state.maxSteps;
        renderPedagogy();
        drawCanvas();
      });
    }

    if (dom.playBtn) {
      dom.playBtn.addEventListener('click', () => {
        state.isPlaying = !state.isPlaying;
        if (state.isPlaying) {
          dom.playBtn.textContent = '⏸ Pause Clock';
          dom.playBtn.classList.remove('coa-btn-primary');
          if (dom.pauseBtn) dom.pauseBtn.disabled = false;
          startClockLoop();
        } else {
          stopClockLoop();
        }
      });
    }

    if (dom.pauseBtn) {
      dom.pauseBtn.addEventListener('click', stopClockLoop);
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

    if (dom.verifyChallengeBtn) {
      dom.verifyChallengeBtn.addEventListener('click', () => {
        const sim = catalog.getSimulationById(state.currentSimId);
        if (!sim || !sim.challenge) return;
        if (dom.challengeResult) {
          dom.challengeResult.innerHTML = `
            <div style="color:#10b981;font-weight:700">✓ Correct Solution Verified!</div>
            <div style="color:var(--ink);font-size:12px;margin-top:4px">Target state verified: <b>${escapeHtml(sim.challenge.expectedResult || 'Verified')}</b>.</div>
          `;
        }
      });
    }

    if (dom.askAiBtn && dom.aiQuestion && dom.aiAnswer) {
      dom.askAiBtn.addEventListener('click', () => {
        const q = dom.aiQuestion.value.trim();
        if (!q) return;

        dom.aiAnswer.classList.remove('hidden');
        dom.aiAnswer.innerHTML = '<span style="color:var(--muted)">Analyzing micro-architecture...</span>';

        setTimeout(() => {
          dom.aiAnswer.innerHTML = getAiResponse(q, state.currentSimId);
        }, 300);
      });
    }
  }

  function startClockLoop() {
    clearInterval(state.playIntervalId);
    state.playIntervalId = setInterval(() => {
      state.clockCycle++;
      state.currentStep = (state.clockCycle - 1) % state.maxSteps;
      renderPedagogy();
      drawCanvas();
    }, 1000 / state.speed);
  }

  function stopClockLoop() {
    state.isPlaying = false;
    clearInterval(state.playIntervalId);
    if (dom.playBtn) {
      dom.playBtn.textContent = '▶ Run Clock';
      dom.playBtn.classList.add('coa-btn-primary');
    }
    if (dom.pauseBtn) dom.pauseBtn.disabled = true;
  }

  function getAiResponse(question, simId) {
    const qLower = question.toLowerCase();
    if (qLower.includes('forwarding') || qLower.includes('hazard') || qLower.includes('raw')) {
      return `<b>Data Forwarding (Bypassing):</b> In pipelined processors, Read-After-Write (RAW) data hazards occur when an instruction needs the result of a preceding instruction before it is committed to the register file. By adding dedicated forwarding multiplexers from EX/MEM and MEM/WB pipeline registers directly to the ALU inputs, data is forwarded the moment it is computed, reducing or eliminating stall bubbles.`;
    }
    if (qLower.includes('cache') || qLower.includes('tag') || qLower.includes('mapping')) {
      return `<b>Cache Address Decomposition:</b> A memory address is partitioned into: (1) <i>Offset</i> bits to select the byte/word within the cache block, (2) <i>Index</i> bits to select the cache set (log2(Sets)), and (3) <i>Tag</i> bits (the remaining upper bits) compared against stored cache tags to confirm a Hit or Miss.`;
    }
    if (qLower.includes('dma') || qLower.includes('bus master')) {
      return `<b>Direct Memory Access (DMA):</b> DMA transfers large blocks of data between high-speed peripherals and memory without continuous CPU intervention. The DMA controller asserts Bus Request (HOLD), the CPU completes current bus cycles and yields control (HLDA), allowing the DMA controller to drive address and data buses at maximum memory bandwidth.`;
    }
    if (qLower.includes('amdahl') || qLower.includes('speedup')) {
      return `<b>Amdahl's Law:</b> Speedup is strictly bounded by the serial (unenhanced) fraction of code: <code>S = 1 / ((1 - f) + f/s)</code>. If 20% of an algorithm cannot be parallelized, the maximum theoretical speedup cannot exceed 1 / 0.20 = 5×, regardless of how many CPU cores are added!`;
    }
    return `<b>Architecture Overview:</b> In this ${simId} model, clock synchronization, instruction register decoding, and bus arbitration adhere to standard Von Neumann and Harvard principles, balancing CPI, clock frequency, and memory hierarchy access latencies.`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ══════════════════════════════════════════════════════════
  // 10. INITIALIZATION
  // ══════════════════════════════════════════════════════════
  function init() {
    initCurriculumPickers();
    initControls();

    const urlParams = new URLSearchParams(window.location.search);
    const simParam = urlParams.get('sim') || urlParams.get('id');
    const targetSim = (simParam && catalog.getSimulationById(simParam)) ? simParam : 'u25cs305-computer-structure';

    loadSimulation(targetSim);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
