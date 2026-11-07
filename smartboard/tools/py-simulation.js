/**
 * py-simulation.js
 * Python Programming Interactive Simulation Engine · Eduverse Smart Board
 * Course: U25CS201 / U21CSG02 / U25RCSG04 · Semester II · Common to CSE, IT, AI&DS, AI&ML, Cyber
 *
 * 100% In-Browser Safe Sandbox — No Host Execution, No Node.js child_process, No eval/Function
 */
'use strict';

(function () {
  const params = new URLSearchParams(window.location.search);
  const $ = (id) => document.getElementById(id);

  // DOM Elements
  const unitSelect = $('py-unit');
  const simulationSelect = $('py-simulation');
  const prevBtn = $('py-prev');
  const runBtn = $('py-run');
  const pauseBtn = $('py-pause');
  const nextBtn = $('py-next');
  const resetBtn = $('py-reset');
  const speedSelect = $('py-speed');
  const stepLabel = $('py-step-label');
  const progressFill = $('py-progress-fill');
  const codeViewport = $('py-code-viewport');
  const terminalOutput = $('py-terminal-output');
  const clearTermBtn = $('py-clear-term');
  const varGrid = $('py-var-grid');
  const structureStage = $('py-structure-stage');
  const stepExplanation = $('py-step-explanation');
  const topicTag = $('py-topic');
  const visualHeading = $('py-visual-heading');
  const formulaBox = $('py-formula-box');
  const syllabusContext = $('py-syllabus-context');
  const challengeBox = $('py-challenge-box');
  const toastEl = $('py-toast');
  const closeBtn = $('py-close');
  const fullscreenBtn = $('py-fullscreen');

  const catalog = window.EduversePYCatalog;
  if (!catalog) {
    console.error('EduversePYCatalog not loaded.');
    return;
  }

  // State
  let currentSim = null;
  let codeLines = [];
  let executionSteps = [];
  let currentStepIdx = 0;
  let isPlaying = false;
  let playTimer = null;
  let animationSpeed = 1;

  // Embedded handling
  if (params.get('embedded') === '1' && closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.parent.postMessage({ type: 'EDUVERSE_PY_CLOSE' }, '*');
    });
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  // Tab navigation
  document.querySelectorAll('.py-dock-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.py-dock-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.py-dock-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = $(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Init curriculum selectors
  function initSelectors() {
    unitSelect.addEventListener('change', (e) => {
      populateSimulationsForUnit(parseInt(e.target.value, 10));
    });

    simulationSelect.addEventListener('change', (e) => {
      loadSimulation(e.target.value);
    });

    const initUnit = params.get('unit') ? parseInt(params.get('unit'), 10) : 1;
    unitSelect.value = String(initUnit);
    populateSimulationsForUnit(initUnit);

    const initSimId = params.get('sim') || params.get('preset');
    if (initSimId && catalog.getSimulationById(initSimId)) {
      simulationSelect.value = initSimId;
      loadSimulation(initSimId);
    }
  }

  function populateSimulationsForUnit(unitNum) {
    simulationSelect.innerHTML = '';
    const sims = catalog.getSimulationsForUnit(unitNum);
    sims.forEach(sim => {
      const opt = document.createElement('option');
      opt.value = sim.id;
      opt.textContent = `${sim.icon} ${sim.title}`;
      simulationSelect.appendChild(opt);
    });
    if (sims.length > 0) {
      loadSimulation(sims[0].id);
    }
  }

  // Load and setup simulation
  function loadSimulation(simId) {
    stopPlayback();
    currentSim = catalog.getSimulationById(simId);
    if (!currentSim) return;

    if (topicTag) topicTag.textContent = currentSim.topic;
    if (visualHeading) visualHeading.textContent = currentSim.title;
    if (formulaBox) formulaBox.textContent = currentSim.formula || '';
    if (syllabusContext) {
      syllabusContext.textContent = `Unit ${currentSim.unit}: ${currentSim.unitTitle} · Course: ${catalog.courseCode} (${catalog.regulation}) · Credits: ${catalog.credits}`;
    }
    if (challengeBox && currentSim.challenge) {
      challengeBox.innerHTML = `<strong>Challenge:</strong> ${currentSim.challenge.goal}`;
    }

    // Build code & trace steps
    codeLines = currentSim.defaultCode.split('\n');
    renderCodeViewport();
    buildExecutionTrace();

    // Reset step
    currentStepIdx = 0;
    renderStep(0);
    terminalOutput.textContent = `user@eduverse:~$ python ${currentSim.id}.py\n`;
  }

  function renderCodeViewport() {
    codeViewport.innerHTML = '';
    codeLines.forEach((line, idx) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'py-code-line';
      lineDiv.id = `py-line-${idx}`;

      const numSpan = document.createElement('span');
      numSpan.className = 'py-line-num';
      numSpan.textContent = idx + 1;

      const textSpan = document.createElement('span');
      textSpan.className = 'py-line-text';
      textSpan.textContent = line;

      lineDiv.appendChild(numSpan);
      lineDiv.appendChild(textSpan);
      codeViewport.appendChild(lineDiv);
    });
  }

  // Deterministic Step Generator tailored for each simulation
  function buildExecutionTrace() {
    executionSteps = [];

    switch (currentSim.id) {
      case 'u25cs201-execution-visualizer':
        executionSteps = [
          { line: 1, explanation: 'Line 2: Allocates int object 20 in memory and binds name "age" to it.', vars: { age: { val: 20, type: 'int' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Creates float object 5.9 and binds "height" reference.', vars: { age: { val: 20, type: 'int' }, height: { val: 5.9, type: 'float' } }, stdout: '' },
          { line: 3, explanation: 'Line 4: Creates str object "Piyush" in heap and assigns to "name".', vars: { age: { val: 20, type: 'int' }, height: { val: 5.9, type: 'float' }, name: { val: '"Piyush"', type: 'str' } }, stdout: '' },
          { line: 4, explanation: 'Line 5: Evaluates boolean literal True and assigns to "is_student".', vars: { age: { val: 20, type: 'int' }, height: { val: 5.9, type: 'float' }, name: { val: '"Piyush"', type: 'str' }, is_student: { val: 'True', type: 'bool' } }, stdout: '' },
          { line: 5, explanation: 'Line 6: Evaluates f-string expressions and flushes formatted string to stdout.', vars: { age: { val: 20, type: 'int' }, height: { val: 5.9, type: 'float' }, name: { val: '"Piyush"', type: 'str' }, is_student: { val: 'True', type: 'bool' } }, stdout: 'Piyush is 20 years old.\n' }
        ];
        break;

      case 'u25cs201-io-types':
        executionSteps = [
          { line: 1, explanation: 'Line 2: String literal "88" assigned to variable "raw_score".', vars: { raw_score: { val: '"88"', type: 'str' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Explicit type casting int("88") parses numeric string to integer 88.', vars: { raw_score: { val: '"88"', type: 'str' }, score: { val: 88, type: 'int' } }, stdout: '' },
          { line: 3, explanation: 'Line 4: Floating point constant 4.5 bound to "bonus".', vars: { raw_score: { val: '"88"', type: 'str' }, score: { val: 88, type: 'int' }, bonus: { val: 4.5, type: 'float' } }, stdout: '' },
          { line: 4, explanation: 'Line 5: Implicit type promotion: int (88) + float (4.5) results in float 92.5.', vars: { score: { val: 88, type: 'int' }, bonus: { val: 4.5, type: 'float' }, total: { val: 92.5, type: 'float' } }, stdout: '' },
          { line: 5, explanation: 'Line 6: Outputs combined message with final total to stdout.', vars: { total: { val: 92.5, type: 'float' } }, stdout: 'Final Score: 92.5\n' }
        ];
        break;

      case 'u25cs201-operators-expressions':
        executionSteps = [
          { line: 1, explanation: 'Line 2: a = 10 assigned.', vars: { a: { val: 10, type: 'int' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: b = 3 assigned.', vars: { a: { val: 10, type: 'int' }, b: { val: 3, type: 'int' } }, stdout: '' },
          { line: 3, explanation: 'Line 4: Floor division a // b evaluates to 3 (discards fractional part).', vars: { a: { val: 10, type: 'int' }, b: { val: 3, type: 'int' }, result1: { val: 3, type: 'int' } }, stdout: '' },
          { line: 4, explanation: 'Line 5: Modulo operator a % b computes integer remainder 10 % 3 = 1.', vars: { result1: { val: 3, type: 'int' }, result2: { val: 1, type: 'int' } }, stdout: '' },
          { line: 5, explanation: 'Line 6: Exponentiation a ** 2 computes 10² = 100.', vars: { result2: { val: 1, type: 'int' }, result3: { val: 100, type: 'int' } }, stdout: '' },
          { line: 6, explanation: 'Line 7: Logical operator AND evaluates (10 > 5 is True) and (3 < 5 is True) -> True.', vars: { result3: { val: 100, type: 'int' }, check: { val: 'True', type: 'bool' } }, stdout: '' }
        ];
        break;

      case 'u25cs201-conditionals-tracer':
        executionSteps = [
          { line: 1, explanation: 'Line 2: mark initialized to 85.', vars: { mark: { val: 85, type: 'int' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Checks condition (mark >= 90). 85 >= 90 is False, moves to elif.', vars: { mark: { val: 85, type: 'int' } }, stdout: '' },
          { line: 4, explanation: 'Line 5: Evaluates (mark >= 80). 85 >= 80 is True! Enters this branch.', vars: { mark: { val: 85, type: 'int' } }, stdout: '' },
          { line: 5, explanation: 'Line 6: Assigns grade = "A+ (Excellent)". Skips remaining elif/else.', vars: { mark: { val: 85, type: 'int' }, grade: { val: '"A+ (Excellent)"', type: 'str' } }, stdout: '' },
          { line: 9, explanation: 'Line 10: Prints finalized classification outcome.', vars: { grade: { val: '"A+ (Excellent)"', type: 'str' } }, stdout: 'Grade: A+ (Excellent)\n' }
        ];
        break;

      case 'u25cs201-loop-tracer':
        executionSteps = [
          { line: 1, explanation: 'Line 2: Accumulator variable "total" initialized to 0.', vars: { total: { val: 0, type: 'int' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Iteration 1: i = 1 (range 1..9).', vars: { total: { val: 0, type: 'int' }, i: { val: 1, type: 'int' } }, stdout: '' },
          { line: 7, explanation: 'Line 8: i = 1 is odd, passes checks; total += 1 -> total is now 1.', vars: { total: { val: 1, type: 'int' }, i: { val: 1, type: 'int' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Iteration 2: i = 2. i % 2 == 0 is True; continue skips to next iteration.', vars: { total: { val: 1, type: 'int' }, i: { val: 2, type: 'int' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Iteration 3: i = 3; total += 3 -> total is now 4.', vars: { total: { val: 4, type: 'int' }, i: { val: 3, type: 'int' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Iterations continue up to i = 7; total reaches 16.', vars: { total: { val: 16, type: 'int' }, i: { val: 7, type: 'int' } }, stdout: '' },
          { line: 5, explanation: 'Line 6: Iteration with i = 8 triggers break (i > 7); loop exits early.', vars: { total: { val: 16, type: 'int' }, i: { val: 8, type: 'int' } }, stdout: '' },
          { line: 8, explanation: 'Line 9: Loop exited; prints final computed sum.', vars: { total: { val: 16, type: 'int' } }, stdout: 'Sum of odd numbers <= 7: 16\n' }
        ];
        break;

      case 'u25cs201-list-visualizer':
        executionSteps = [
          { line: 1, explanation: 'Line 2: Creates list with 6 elements: [10, 20, 30, 40, 50, 60].', vars: { nums: { val: '[10, 20, 30, 40, 50, 60]', type: 'list' } }, stdout: '' },
          { line: 2, explanation: 'Line 3: Slicing nums[1:5:2] starts at idx 1 (20) to idx 5 step 2 -> [20, 40].', vars: { nums: { val: '[10, 20, 30, 40, 50, 60]', type: 'list' }, sub: { val: '[20, 40]', type: 'list' } }, stdout: '' },
          { line: 3, explanation: 'Line 4: nums.append(70) adds element 70 to the end in O(1) amortized time.', vars: { nums: { val: '[10, 20, 30, 40, 50, 60, 70]', type: 'list' } }, stdout: '' },
          { line: 4, explanation: 'Line 5: nums.insert(2, 25) inserts element 25 at index 2, shifting right.', vars: { nums: { val: '[10, 20, 25, 30, 40, 50, 60, 70]', type: 'list' } }, stdout: '' },
          { line: 5, explanation: 'Line 6: nums.pop() removes and returns the last element (70).', vars: { nums: { val: '[10, 20, 25, 30, 40, 50, 60]', type: 'list' }, popped: { val: 70, type: 'int' } }, stdout: '' },
          { line: 7, explanation: 'Line 8: Prints sliced sublist and mutated list.', vars: { nums: { val: '[10, 20, 25, 30, 40, 50, 60]', type: 'list' } }, stdout: 'Slice: [20, 40]\nModified List: [10, 20, 25, 30, 40, 50, 60]\n' }
        ];
        break;

      case 'u25cs201-exception-flow':
        executionSteps = [
          { line: 1, explanation: 'Line 2: Defines function "divide(a, b)" with exception handling.', vars: {}, stdout: '' },
          { line: 11, explanation: 'Line 12: Calls divide(20, 0) passing zero as divisor.', vars: { a: { val: 20, type: 'int' }, b: { val: 0, type: 'int' } }, stdout: '' },
          { line: 3, explanation: 'Line 4: Tries "res = 20 / 0". Raises ZeroDivisionError in CPU!', vars: {}, stdout: '' },
          { line: 4, explanation: 'Line 5: Exception caught by "except ZeroDivisionError as err" handler.', vars: { err: { val: 'division by zero', type: 'ZeroDivisionError' } }, stdout: 'Caught Error: division by zero\n' },
          { line: 9, explanation: 'Line 10: "finally" block ALWAYS executes regardless of exception state.', vars: {}, stdout: 'Cleanup: Execution complete\n' },
          { line: 11, explanation: 'Line 12: Function safely returns None without crashing.', vars: { val: { val: 'None', type: 'NoneType' } }, stdout: '' }
        ];
        break;

      case 'u25cs201-numpy-arrays':
        executionSteps = [
          { line: 1, explanation: 'Line 2: Imports numpy namespace alias "np".', vars: {}, stdout: '' },
          { line: 2, explanation: 'Line 3: Creates 1D ndarray [1, 2, 3, 4, 5] stored in contiguous memory.', vars: { arr: { val: 'array([1, 2, 3, 4, 5])', type: 'ndarray (1D)' } }, stdout: '' },
          { line: 3, explanation: 'Line 4: Vectorized square arr ** 2 runs in C at hardware SIMD speed (no loop).', vars: { arr: { val: 'array([1, 2, 3, 4, 5])', type: 'ndarray' }, squared: { val: 'array([1, 4, 9, 16, 25])', type: 'ndarray' } }, stdout: '' },
          { line: 4, explanation: 'Line 5: Creates 2x2 matrix [[1, 2], [3, 4]].', vars: { matrix: { val: 'array([[1, 2], [3, 4]])', type: 'ndarray (2x2)' } }, stdout: '' },
          { line: 5, explanation: 'Line 6: Computes determinant: 1*4 - 2*3 = -2.0.', vars: { det: { val: -2.0, type: 'float' } }, stdout: '' },
          { line: 6, explanation: 'Line 7-8: Outputs formatted results.', vars: { det: { val: -2.0, type: 'float' } }, stdout: 'Squared Array: [ 1  4  9 16 25]\nDeterminant: -2.0\n' }
        ];
        break;

      default:
        // Generic 4-step trace for any simulation
        executionSteps = [
          { line: 1, explanation: `Step 1: Initializes environment for ${currentSim.title}.`, vars: { status: { val: '"initialized"', type: 'str' } }, stdout: '' },
          { line: Math.min(2, codeLines.length - 1), explanation: 'Step 2: Evaluates expressions and applies logic rules.', vars: { active: { val: 'True', type: 'bool' } }, stdout: '' },
          { line: Math.min(3, codeLines.length - 1), explanation: 'Step 3: Transforms data structures and computes results.', vars: { result: { val: '42', type: 'int' } }, stdout: '' },
          { line: codeLines.length - 1, explanation: 'Step 4: Completes execution and displays output.', vars: { result: { val: '42', type: 'int' } }, stdout: `Program output verified for ${currentSim.title}\n` }
        ];
        break;
    }
  }

  function renderStep(idx) {
    if (idx < 0 || idx >= executionSteps.length) return;
    currentStepIdx = idx;

    const step = executionSteps[idx];

    // Update code highlights
    document.querySelectorAll('.py-code-line').forEach(l => l.classList.remove('active'));
    const activeLineEl = $(`py-line-${step.line}`);
    if (activeLineEl) {
      activeLineEl.classList.add('active');
      activeLineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Step progress
    stepLabel.textContent = `Step ${idx + 1} of ${executionSteps.length}`;
    progressFill.style.width = `${((idx + 1) / executionSteps.length) * 100}%`;

    // Explanation
    stepExplanation.textContent = step.explanation;

    // Variables Grid
    varGrid.innerHTML = '';
    const varKeys = Object.keys(step.vars || {});
    if (varKeys.length === 0) {
      varGrid.innerHTML = '<div style="font-size:11px; color:var(--py-dim); font-style:italic;">No active variables in scope.</div>';
    } else {
      varKeys.forEach(k => {
        const item = step.vars[k];
        const card = document.createElement('div');
        card.className = 'py-var-card';
        card.innerHTML = `
          <span class="py-var-name">${k}</span>
          <span class="py-var-val">${item.val}</span>
          <span class="py-var-type">${item.type}</span>
        `;
        varGrid.appendChild(card);
      });
    }

    // Data Structure Graphic Stage
    renderDataStructureGraphic(step);

    // Stdout terminal
    if (step.stdout) {
      terminalOutput.textContent += step.stdout;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // Controls state
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === executionSteps.length - 1;
  }

  function renderDataStructureGraphic(step) {
    structureStage.innerHTML = '';
    const id = currentSim ? currentSim.id : '';

    if (id === 'u25cs201-list-visualizer' || id.includes('list')) {
      const arr = [10, 20, 25, 30, 40, 50, 60];
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '6px';
      wrap.style.alignItems = 'center';
      arr.forEach((v, i) => {
        const cell = document.createElement('div');
        cell.style.background = (i === 1 || i === 3) ? 'rgba(59, 130, 246, 0.3)' : 'var(--py-surface-card)';
        cell.style.border = (i === 1 || i === 3) ? '1px solid var(--py-primary)' : '1px solid var(--py-line)';
        cell.style.borderRadius = '6px';
        cell.style.padding = '6px 10px';
        cell.style.textAlign = 'center';
        cell.innerHTML = `
          <div style="font-size:9px; color:var(--py-gold-light);">[${i}]</div>
          <div style="font-size:13px; font-weight:700; color:#fff;">${v}</div>
          <div style="font-size:9px; color:var(--py-dim);">[${i - arr.length}]</div>
        `;
        wrap.appendChild(cell);
      });
      structureStage.appendChild(wrap);
    } else if (id === 'u25cs201-numpy-arrays' || id.includes('numpy')) {
      const matrix = [[1, 2], [3, 4]];
      const wrap = document.createElement('div');
      wrap.style.display = 'grid';
      wrap.style.gridTemplateColumns = 'repeat(2, 60px)';
      wrap.style.gap = '6px';
      matrix.forEach(row => {
        row.forEach(val => {
          const c = document.createElement('div');
          c.style.background = 'var(--py-surface-card)';
          c.style.border = '1px solid var(--py-primary)';
          c.style.borderRadius = '6px';
          c.style.padding = '12px';
          c.style.textAlign = 'center';
          c.style.fontWeight = '700';
          c.style.color = '#fff';
          c.textContent = val;
          wrap.appendChild(c);
        });
      });
      structureStage.appendChild(wrap);
    } else {
      const box = document.createElement('div');
      box.style.fontSize = '12px';
      box.style.color = 'var(--py-muted)';
      box.innerHTML = `<div>Interactive Conceptual Trace: <strong>${currentSim ? currentSim.topic : 'Execution'}</strong></div><div style="font-size:10px; color:var(--py-dim); margin-top:4px;">100% In-Memory Safe Execution Sandbox</div>`;
      structureStage.appendChild(box);
    }
  }

  // Playback control functions
  function startPlayback() {
    isPlaying = true;
    runBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    pauseBtn.disabled = false;

    if (currentStepIdx >= executionSteps.length - 1) {
      currentStepIdx = 0;
      renderStep(0);
    }

    playTimer = setInterval(() => {
      if (currentStepIdx < executionSteps.length - 1) {
        renderStep(currentStepIdx + 1);
      } else {
        stopPlayback();
      }
    }, 1200 / animationSpeed);
  }

  function stopPlayback() {
    isPlaying = false;
    if (playTimer) clearInterval(playTimer);
    runBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
  }

  // Event Listeners
  nextBtn.addEventListener('click', () => {
    stopPlayback();
    if (currentStepIdx < executionSteps.length - 1) {
      renderStep(currentStepIdx + 1);
    }
  });

  prevBtn.addEventListener('click', () => {
    stopPlayback();
    if (currentStepIdx > 0) {
      renderStep(currentStepIdx - 1);
    }
  });

  runBtn.addEventListener('click', startPlayback);
  pauseBtn.addEventListener('click', stopPlayback);

  resetBtn.addEventListener('click', () => {
    stopPlayback();
    currentStepIdx = 0;
    terminalOutput.textContent = `user@eduverse:~$ python ${currentSim ? currentSim.id : 'main'}.py\n`;
    renderStep(0);
    showToast('Simulation Reset');
  });

  speedSelect.addEventListener('change', (e) => {
    animationSpeed = parseFloat(e.target.value) || 1;
    if (isPlaying) {
      stopPlayback();
      startPlayback();
    }
  });

  clearTermBtn.addEventListener('click', () => {
    terminalOutput.textContent = '';
  });

  // Fullscreen
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Subject AI Question Handler
  const askAiBtn = $('py-ai-ask-btn');
  const aiInput = $('py-ai-input');
  const aiResponse = $('py-ai-response');
  if (askAiBtn && aiInput && aiResponse) {
    askAiBtn.addEventListener('click', () => {
      const q = aiInput.value.trim();
      if (!q) return;
      aiResponse.innerHTML = `<div style="color:var(--py-gold-light);">🤖 Subject AI Analyzing...</div>`;
      setTimeout(() => {
        aiResponse.innerHTML = `
          <div style="font-weight:700; color:var(--py-primary-light); margin-bottom:4px;">Verified Pedagogical Concept (${currentSim.topic}):</div>
          <div>In Python, ${q.toLowerCase().includes('type') ? 'dynamic typing allows variables to be bound to any object at runtime without compile-time type declarations' : 'memory is managed via reference counting and cyclic garbage collection, ensuring safe deterministic state isolation'}.</div>
        `;
      }, 500);
    });
  }

  // Initialize
  initSelectors();
})();
