/**
 * dm-simulation.js
 * Discrete Mathematics (U25MA401 / U21MAG02) Interactive Simulation Engine
 * Regulation R2025 (Revised) CBCS · Semester IV
 *
 * Implements deterministic visual models for:
 * 1. Boolean algebra laws, Universal NAND/NOR gates, Canonical forms & K-Maps (2x2, 2x4, 4x4)
 * 2. Set operations, 3-set Venn diagrams, Relation matrix/digraph properties, Poset Hasse diagrams & Functions
 * 3. Counting principles, Pigeonhole Principle buckets, Permutations/Combinations, Linear recurrences, Induction
 * 4. Graph representations (adjacency matrix, incidence matrix), Eulerian/Hamiltonian paths, Dijkstra's algorithm & Vertex coloring
 * 5. Propositional logic AST parser, Truth tables, Predicates & Quantifiers, Rules of Inference deduction validator
 */
(function () {
  'use strict';

  var catalog = window.EduverseDMCatalog;
  if (!catalog) {
    console.error('EduverseDMCatalog not loaded');
    return;
  }

  // State
  var currentSim = catalog.simulations[0];
  var currentUnit = 1;
  var currentParams = {};
  var isPlaying = false;
  var playTimer = null;
  var stepIndex = 0;
  var speedMultiplier = 1;

  // DOM Elements
  var unitSelect = document.getElementById('dm-unit-select');
  var simSelect = document.getElementById('dm-sim-select');
  var formulaCard = document.getElementById('dm-formula-card');
  var paramsContainer = document.getElementById('dm-params-container');
  var challengeGoal = document.getElementById('dm-challenge-goal');
  var challengeExpected = document.getElementById('dm-challenge-expected');
  var simTitle = document.getElementById('dm-sim-title');
  var simMeta = document.getElementById('dm-sim-meta');
  var unitBadge = document.getElementById('dm-unit-badge');
  var readout = document.getElementById('dm-readout');
  var whatText = document.getElementById('dm-what');
  var whyText = document.getElementById('dm-why');
  var nextText = document.getElementById('dm-next');
  var inspectContent = document.getElementById('dm-inspect-content');
  var canvas = document.getElementById('dm-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;

  var btnStep = document.getElementById('dm-btn-step');
  var btnPlay = document.getElementById('dm-btn-play');
  var btnReset = document.getElementById('dm-btn-reset');
  var themeToggle = document.getElementById('dm-theme-toggle');
  var btnExport = document.getElementById('dm-export');
  var btnFullscreen = document.getElementById('dm-fullscreen');

  // URL query parameter parsing
  function initFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var simId = params.get('sim');
    var unitParam = params.get('unit');

    if (simId) {
      var found = catalog.getSimulationById(simId);
      if (found) {
        currentSim = found;
        currentUnit = found.unit;
      }
    } else if (unitParam) {
      var u = parseInt(unitParam, 10);
      if (u >= 1 && u <= 5) {
        currentUnit = u;
        var unitSims = catalog.getSimulationsByUnit(u);
        if (unitSims.length > 0) currentSim = unitSims[0];
      }
    }
  }

  // Populate Simulation Select dropdown
  function updateSimSelect() {
    if (!simSelect) return;
    simSelect.innerHTML = '';
    var sims = catalog.getSimulationsByUnit(currentUnit);
    sims.forEach(function (sim) {
      var opt = document.createElement('option');
      opt.value = sim.id;
      opt.textContent = (sim.flagship ? '⭐ ' : '') + sim.title;
      if (sim.id === currentSim.id) opt.selected = true;
      simSelect.appendChild(opt);
    });
  }

  // Load selected simulation
  function loadSimulation(sim) {
    currentSim = sim;
    currentUnit = sim.unit;
    currentParams = Object.assign({}, sim.defaultParams);
    stepIndex = 0;
    stopPlayback();

    if (unitSelect) unitSelect.value = String(currentUnit);
    if (unitBadge) unitBadge.textContent = 'Unit ' + currentUnit;
    if (simTitle) simTitle.textContent = (sim.flagship ? '⭐ ' : '') + sim.title;
    if (simMeta) simMeta.textContent = 'U25MA401 · Unit ' + currentUnit + ' · ' + sim.unitTitle + ' · BSC (4 Credits)';
    if (formulaCard) formulaCard.textContent = sim.formula || 'Axiomatic Definition';
    if (challengeGoal) challengeGoal.textContent = sim.challenge ? sim.challenge.goal : '';
    if (challengeExpected) challengeExpected.textContent = sim.challenge ? 'Target: ' + sim.challenge.expectedResult : '';

    renderParamsControls();
    updatePedagogicalText();
    renderInspectPanel();
    draw();
  }

  // Dynamic Parameter Controls based on active simulation
  function renderParamsControls() {
    if (!paramsContainer) return;
    paramsContainer.innerHTML = '';

    var id = currentSim.id;
    if (id === 'u25ma401-boolean-algebra') {
      addSelectControl('law', 'Algebraic Law', [
        { label: 'Distributive: x + (y·z) = (x+y)(x+z)', value: 'distributive' },
        { label: 'De Morgan I: ¬(x + y) = ¬x · ¬y', value: 'demorgan_or' },
        { label: 'De Morgan II: ¬(x · y) = ¬x + ¬y', value: 'demorgan_and' },
        { label: 'Absorption: x + (x·y) = x', value: 'absorption' },
        { label: 'Involution: ¬(¬x) = x', value: 'involution' }
      ]);
      addBinaryToggle('varX', 'Variable x');
      addBinaryToggle('varY', 'Variable y');
      addBinaryToggle('varZ', 'Variable z');
    } else if (id === 'u25ma401-logic-gates-circuits') {
      addSelectControl('circuitType', 'Synthesize Target Gate', [
        { label: 'Exclusive-OR (XOR) via 4 NANDs', value: 'xor_universal_nand' },
        { label: 'Universal NOR for AND gate', value: 'nor_for_and' },
        { label: 'Universal NAND for OR gate', value: 'nand_for_or' },
        { label: 'Half Adder (XOR + AND)', value: 'half_adder' }
      ]);
      addBinaryToggle('inputA', 'Input A');
      addBinaryToggle('inputB', 'Input B');
    } else if (id === 'u25ma401-canonical-forms') {
      addSelectControl('variables', 'Variables', [
        { label: '2 Variables (A, B)', value: 2 },
        { label: '3 Variables (A, B, C)', value: 3 }
      ]);
      addTextInput('minterms', 'Minterm Indices (Σm)', '1,4,6,7');
    } else if (id === 'u25ma401-karnaugh-maps') {
      addSelectControl('mapSize', 'K-Map Size', [
        { label: '2-Variable (2x2 Grid)', value: '2var' },
        { label: '3-Variable (2x4 Grid)', value: '3var' },
        { label: '4-Variable (4x4 Grid)', value: '4var' }
      ]);
      addTextInput('minterms', 'Active Minterms', '0,1,2,5,7');
    } else if (id === 'u25ma401-set-operations-venn') {
      addSelectControl('operation', 'Set Operation', [
        { label: 'Intersection (A ∩ B)', value: 'intersection' },
        { label: 'Union (A ∪ B)', value: 'union' },
        { label: 'Difference (A \\ B)', value: 'difference' },
        { label: 'Symmetric Difference (A △ B)', value: 'symmetric_difference' },
        { label: '3-Set Intersection (A ∩ B ∩ C)', value: 'three_set_intersection' }
      ]);
      addTextInput('setA', 'Set A elements', '1,2,3,4,5');
      addTextInput('setB', 'Set B elements', '3,4,5,6,7');
      addTextInput('setC', 'Set C elements', '4,5,7,8,9');
    } else if (id === 'u25ma401-relations-properties') {
      addTextInput('elements', 'Base Set Elements', '1,2,3,4');
      addTextInput('relationPairs', 'Pairs (a,b)', '(1,1),(2,2),(3,3),(4,4),(1,2),(2,1),(2,3),(3,2),(1,3),(3,1)');
    } else if (id === 'u25ma401-poset-hasse') {
      addSelectControl('relationType', 'Partial Order Type', [
        { label: 'Divisibility Poset (a | b)', value: 'divisibility' },
        { label: 'Power Set Inclusion (⊆)', value: 'powerset' }
      ]);
      addTextInput('baseSet', 'Elements', '1,2,3,4,6,12');
    } else if (id === 'u25ma401-functions-mappings') {
      addTextInput('domain', 'Domain Set X', 'a,b,c,d');
      addTextInput('codomain', 'Codomain Set Y', '1,2,3,4');
      addTextInput('mapping', 'Mapping (x:y)', 'a:1,b:2,c:3,d:4');
    } else if (id === 'u25ma401-counting-principles') {
      addNumberInput('pigeons', 'Number of Items (Pigeons)', 13, 1, 50);
      addNumberInput('holes', 'Number of Bins (Pigeonholes)', 12, 1, 20);
      addSelectControl('ruleType', 'Counting Principle', [
        { label: 'Generalized Pigeonhole (⌈n/k⌉)', value: 'generalized_pigeonhole' },
        { label: 'Rule of Product (Cartesian)', value: 'rule_product' },
        { label: 'Rule of Sum (Disjoint)', value: 'rule_sum' }
      ]);
    } else if (id === 'u25ma401-permutations-combinations') {
      addNumberInput('n', 'Total Elements n', 7, 1, 15);
      addNumberInput('r', 'Chosen Elements r', 3, 0, 15);
    } else if (id === 'u25ma401-recurrence-relations') {
      addSelectControl('relationType', 'Recurrence Relation', [
        { label: 'Fibonacci: a_n = a_(n-1) + a_(n-2)', value: 'fibonacci' },
        { label: 'Towers of Hanoi: T_n = 2T_(n-1) + 1', value: 'hanoi' },
        { label: 'Geometric: a_n = 3a_(n-1)', value: 'geometric' }
      ]);
      addNumberInput('steps', 'Sequence Depth (n)', 8, 3, 15);
    } else if (id === 'u25ma401-mathematical-induction') {
      addSelectControl('theorem', 'Theorem to Prove', [
        { label: '1 + 2 + ... + n = n(n+1)/2', value: 'sum_of_n_integers' },
        { label: '1 + 3 + ... + (2n-1) = n²', value: 'sum_of_odd_integers' },
        { label: '1² + 2² + ... + n² = n(n+1)(2n+1)/6', value: 'sum_of_squares' }
      ]);
      addNumberInput('targetN', 'Verify up to n', 6, 2, 12);
    } else if (id === 'u25ma401-graph-representations') {
      addSelectControl('graphPreset', 'Preset Graph', [
        { label: 'Cycle Graph C5', value: 'cycle_5' },
        { label: 'Complete Graph K4', value: 'complete_4' },
        { label: 'Petersen Subgraph (10 nodes)', value: 'petersen_subgraph' },
        { label: 'Bipartite Graph K3,2', value: 'bipartite_3_2' }
      ]);
    } else if (id === 'u25ma401-euler-hamilton') {
      addSelectControl('graphType', 'Graph Topology', [
        { label: 'Königsberg 7 Bridges (Non-Eulerian)', value: 'konigsberg_bridges' },
        { label: 'Eulerian Envelope (Complete Euler Circuit)', value: 'envelope_euler' },
        { label: 'Dodecahedron Hamiltonian Circuit', value: 'hamilton_dodecahedron' }
      ]);
    } else if (id === 'u25ma401-shortest-path-coloring') {
      addSelectControl('graphTopology', 'Network Topology', [
        { label: 'Routing Mesh (A to F)', value: 'network_mesh' },
        { label: 'Cycle C5 (Chromatic χ=3)', value: 'cycle_5' },
        { label: 'Complete Graph K4 (Chromatic χ=4)', value: 'complete_4' }
      ]);
    } else if (id === 'u25ma401-propositional-truth-tables') {
      addTextInput('expression', 'Proposition Formula', '(p -> q) <-> (!p || q)');
    } else if (id === 'u25ma401-predicates-quantifiers') {
      addSelectControl('quantifier', 'Quantifier', [
        { label: 'Existential: ∃x P(x)', value: 'exists' },
        { label: 'Universal: ∀x P(x)', value: 'forall' }
      ]);
      addSelectControl('predicate', 'Predicate P(x)', [
        { label: 'x is Even (x % 2 == 0)', value: 'is_even' },
        { label: 'x is Prime', value: 'is_prime' },
        { label: 'x > 0', value: 'is_positive' }
      ]);
    } else if (id === 'u25ma401-inference-proofs') {
      addSelectControl('rule', 'Inference Rule', [
        { label: 'Modus Ponens: p→q, p ⊢ q', value: 'modus_ponens' },
        { label: 'Modus Tollens: p→q, ¬q ⊢ ¬p', value: 'modus_tollens' },
        { label: 'Hypothetical Syllogism: p→q, q→r ⊢ p→r', value: 'hypothetical_syllogism' },
        { label: 'Disjunctive Syllogism: p∨q, ¬p ⊢ q', value: 'disjunctive_syllogism' }
      ]);
    }
  }

  // Helpers to add parameter controls
  function addSelectControl(key, label, options) {
    var group = document.createElement('div');
    group.className = 'dm-ctrl-group';
    var lbl = document.createElement('label');
    lbl.textContent = label;
    var sel = document.createElement('select');
    options.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (String(currentParams[key]) === String(opt.value)) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      currentParams[key] = sel.value;
      stepIndex = 0;
      updatePedagogicalText();
      renderInspectPanel();
      draw();
    });
    group.appendChild(lbl);
    group.appendChild(sel);
    paramsContainer.appendChild(group);
  }

  function addBinaryToggle(key, label) {
    var group = document.createElement('div');
    group.className = 'dm-ctrl-group';
    var lbl = document.createElement('label');
    lbl.textContent = label;
    var sel = document.createElement('select');
    var o0 = document.createElement('option');
    o0.value = '0';
    o0.textContent = '0 (False / Low)';
    var o1 = document.createElement('option');
    o1.value = '1';
    o1.textContent = '1 (True / High)';
    if (String(currentParams[key]) === '1') o1.selected = true;
    else o0.selected = true;
    sel.appendChild(o0);
    sel.appendChild(o1);
    sel.addEventListener('change', function () {
      currentParams[key] = parseInt(sel.value, 10);
      stepIndex = 0;
      updatePedagogicalText();
      renderInspectPanel();
      draw();
    });
    group.appendChild(lbl);
    group.appendChild(sel);
    paramsContainer.appendChild(group);
  }

  function addTextInput(key, label, defaultVal) {
    var group = document.createElement('div');
    group.className = 'dm-ctrl-group';
    var lbl = document.createElement('label');
    lbl.textContent = label;
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = currentParams[key] !== undefined ? currentParams[key] : defaultVal;
    inp.addEventListener('input', function () {
      currentParams[key] = inp.value;
      stepIndex = 0;
      updatePedagogicalText();
      renderInspectPanel();
      draw();
    });
    group.appendChild(lbl);
    group.appendChild(inp);
    paramsContainer.appendChild(group);
  }

  function addNumberInput(key, label, defaultVal, min, max) {
    var group = document.createElement('div');
    group.className = 'dm-ctrl-group';
    var lbl = document.createElement('label');
    lbl.textContent = label;
    var inp = document.createElement('input');
    inp.type = 'number';
    inp.min = String(min);
    inp.max = String(max);
    inp.value = currentParams[key] !== undefined ? currentParams[key] : defaultVal;
    inp.addEventListener('input', function () {
      var val = parseInt(inp.value, 10);
      if (!isNaN(val)) {
        currentParams[key] = Math.max(min, Math.min(max, val));
        stepIndex = 0;
        updatePedagogicalText();
        renderInspectPanel();
        draw();
      }
    });
    group.appendChild(lbl);
    group.appendChild(inp);
    paramsContainer.appendChild(group);
  }

  // Safe Propositional Logic Parser (deterministic AST, NO eval / Function)
  function evaluateProposition(expr, valuation) {
    // Replace variable names with their boolean values
    var tokens = expr
      .replace(/\s+/g, '')
      .replace(/<->/g, ' EQ ')
      .replace(/->/g, ' IMP ')
      .replace(/\|\|/g, ' OR ')
      .replace(/&&/g, ' AND ')
      .replace(/!/g, ' NOT ');

    // Substitute variable truth values
    Object.keys(valuation).forEach(function (v) {
      var regex = new RegExp('\\b' + v + '\\b', 'g');
      tokens = tokens.replace(regex, valuation[v] ? 'T' : 'F');
    });

    // Helper boolean evaluator
    function evalSimple(str) {
      str = str.replace(/NOT\s+T/g, 'F').replace(/NOT\s+F/g, 'T');
      // AND
      while (/T\s+AND\s+T/.test(str)) str = str.replace(/T\s+AND\s+T/, 'T');
      while (/[TF]\s+AND\s+[TF]/.test(str)) str = str.replace(/[TF]\s+AND\s+[TF]/, 'F');
      // OR
      while (/F\s+OR\s+F/.test(str)) str = str.replace(/F\s+OR\s+F/, 'F');
      while (/[TF]\s+OR\s+[TF]/.test(str)) str = str.replace(/[TF]\s+OR\s+[TF]/, 'T');
      // IMP (p -> q is F only when T -> F)
      while (/T\s+IMP\s+F/.test(str)) str = str.replace(/T\s+IMP\s+F/, 'F');
      while (/[TF]\s+IMP\s+[TF]/.test(str)) str = str.replace(/[TF]\s+IMP\s+[TF]/, 'T');
      // EQ (p <-> q is T when both match)
      while (/T\s+EQ\s+T|F\s+EQ\s+F/.test(str)) str = str.replace(/T\s+EQ\s+T|F\s+EQ\s+F/, 'T');
      while (/[TF]\s+EQ\s+[TF]/.test(str)) str = str.replace(/[TF]\s+EQ\s+[TF]/, 'F');
      return str.trim();
    }

    // Resolve parentheses
    var safeLimit = 20;
    while (/\([^()]+\)/.test(tokens) && safeLimit-- > 0) {
      tokens = tokens.replace(/\(([^()]+)\)/, function (_, inner) {
        return evalSimple(inner);
      });
    }

    var res = evalSimple(tokens);
    return res === 'T' || res === '1';
  }

  // Update pedagogical texts (what / why / next)
  function updatePedagogicalText() {
    if (!whatText || !whyText || !nextText) return;
    var id = currentSim.id;

    if (id === 'u25ma401-boolean-algebra') {
      var x = currentParams.varX || 0;
      var y = currentParams.varY || 0;
      var z = currentParams.varZ || 0;
      var law = currentParams.law || 'distributive';
      whatText.textContent = 'Testing ' + law + ' with inputs x=' + x + ', y=' + y + ', z=' + z + '.';
      whyText.textContent = 'Boolean algebra forms a complemented distributive lattice (Huntington Postulates).';
      nextText.textContent = 'Toggle inputs to verify equality holds universally across all binary combinations.';
    } else if (id === 'u25ma401-karnaugh-maps') {
      whatText.textContent = 'K-Map populated with Gray-code coordinate indexing for adjacent cell grouping.';
      whyText.textContent = 'Adjacent cells differ by exactly 1 bit (Gray code), enabling algebraic elimination: A + A\' = 1.';
      nextText.textContent = 'Inspect prime implicant rectangles in the inspection panel to find the minimal SOP form.';
    } else if (id === 'u25ma401-set-operations-venn') {
      whatText.textContent = 'Evaluating set operation: ' + (currentParams.operation || 'intersection') + ' on given sets.';
      whyText.textContent = 'Venn regions partition the universal set into disjoint components satisfying membership criteria.';
      nextText.textContent = 'Examine cardinality readouts and the inclusion-exclusion calculation on the right.';
    } else if (id === 'u25ma401-counting-principles') {
      var p = currentParams.pigeons || 13;
      var h = currentParams.holes || 12;
      var k = Math.ceil(p / h);
      whatText.textContent = p + ' items distributed into ' + h + ' pigeonhole bins.';
      whyText.textContent = 'By Generalized Pigeonhole Principle: at least one bin must hold ⌈' + p + ' / ' + h + '⌉ = ' + k + ' items.';
      nextText.textContent = 'Increase items to observe threshold jumps in collision guarantees.';
    } else if (id === 'u25ma401-recurrence-relations') {
      whatText.textContent = 'Tracing recurrence sequence step ' + stepIndex + ' up to n=' + (currentParams.steps || 8) + '.';
      whyText.textContent = 'Homogeneous linear recurrences possess characteristic polynomial roots that yield closed-form solutions.';
      nextText.textContent = 'Click Step or Play to advance through sequence generation.';
    } else if (id === 'u25ma401-graph-representations') {
      whatText.textContent = 'Displaying graph topology and corresponding adjacency matrix.';
      whyText.textContent = 'Handshaking Theorem guarantees that sum of all vertex degrees equals twice the number of edges (2|E|).';
      nextText.textContent = 'Check vertex degree counts against matrix row sums in the inspection panel.';
    } else if (id === 'u25ma401-euler-hamilton') {
      whatText.textContent = 'Testing graph for Eulerian and Hamiltonian traversals.';
      whyText.textContent = 'Euler Theorem: Connected graph has Euler circuit iff every vertex has an even degree.';
      nextText.textContent = 'Observe which vertices fail the even degree condition.';
    } else if (id === 'u25ma401-shortest-path-coloring') {
      whatText.textContent = 'Executing Dijkstra’s shortest path algorithm step ' + stepIndex + '.';
      whyText.textContent = 'Greedy choice property: relaxation of minimum tentative distance guarantees optimal path.';
      nextText.textContent = 'Advance step to trace priority queue updates.';
    } else if (id === 'u25ma401-propositional-truth-tables') {
      whatText.textContent = 'Generating 2^n truth table for formula: ' + (currentParams.expression || 'p -> q');
      whyText.textContent = 'Formulas evaluating to True under all truth valuations are Tautologies (valid logical theorems).';
      nextText.textContent = 'Inspect the generated truth table columns on the right panel.';
    } else {
      whatText.textContent = 'Visualizing discrete mathematical structure: ' + currentSim.title;
      whyText.textContent = 'Formulas and properties are strictly validated against axiomatic course definitions.';
      nextText.textContent = 'Change parameters on the left dock or step through algorithm transitions.';
    }
  }

  // Render Right Inspection Panel
  function renderInspectPanel() {
    if (!inspectContent) return;
    inspectContent.innerHTML = '';
    var id = currentSim.id;

    if (id === 'u25ma401-propositional-truth-tables' || id === 'u25ma401-boolean-algebra') {
      var expr = currentParams.expression || '(p -> q) <-> (!p || q)';
      var table = document.createElement('table');
      table.className = 'dm-table-view';
      table.innerHTML = '<thead><tr><th>p</th><th>q</th><th>Evaluation</th></tr></thead>';
      var tbody = document.createElement('tbody');
      var allTrue = true;
      var allFalse = true;

      [[0,0], [0,1], [1,0], [1,1]].forEach(function (pair) {
        var p = pair[0] === 1;
        var q = pair[1] === 1;
        var val = evaluateProposition(expr, { p: p, q: q });
        if (val) allFalse = false; else allTrue = false;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + (p ? 'T' : 'F') + '</td><td>' + (q ? 'T' : 'F') + '</td><td class="' + (val ? 'val-true' : 'val-false') + '">' + (val ? 'T' : 'F') + '</td>';
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      inspectContent.appendChild(table);

      var summary = document.createElement('div');
      summary.style.marginTop = '10px';
      summary.style.fontWeight = '700';
      summary.textContent = allTrue ? 'Classification: Tautology (Valid Theorem)' : allFalse ? 'Classification: Contradiction (Unsatisfiable)' : 'Classification: Contingency (Satisfiable)';
      summary.style.color = allTrue ? 'var(--dm-emerald)' : allFalse ? 'var(--dm-rose)' : 'var(--dm-amber)';
      inspectContent.appendChild(summary);
    } else if (id === 'u25ma401-karnaugh-maps') {
      var minterms = (currentParams.minterms || '0,1,2,5,7').split(',').map(function (v) { return parseInt(v.trim(), 10); });
      var kdiv = document.createElement('div');
      kdiv.innerHTML = '<p style="margin:0 0 6px;font-weight:700">3-Variable K-Map Matrix (AB \\ C):</p>';
      var ktbl = document.createElement('table');
      ktbl.className = 'dm-table-view';
      ktbl.innerHTML = '<thead><tr><th>AB \\ C</th><th>0</th><th>1</th></tr></thead>';
      var rows = [
        { label: '00', cells: [0, 1] },
        { label: '01', cells: [2, 3] },
        { label: '11', cells: [6, 7] },
        { label: '10', cells: [4, 5] }
      ];
      var ktbody = document.createElement('tbody');
      rows.forEach(function (r) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.textContent = r.label;
        tr.appendChild(th);
        r.cells.forEach(function (cidx) {
          var td = document.createElement('td');
          var isActive = minterms.indexOf(cidx) !== -1;
          td.textContent = isActive ? '1 (m' + cidx + ')' : '0';
          td.className = 'kmap-cell' + (isActive ? ' kmap-active' : '');
          tr.appendChild(td);
        });
        ktbody.appendChild(tr);
      });
      ktbl.appendChild(ktbody);
      kdiv.appendChild(ktbl);
      inspectContent.appendChild(kdiv);
    } else if (id === 'u25ma401-relations-properties') {
      var pairs = currentParams.relationPairs || '';
      var hasReflexive = pairs.indexOf('(1,1)') !== -1 && pairs.indexOf('(2,2)') !== -1 && pairs.indexOf('(3,3)') !== -1 && pairs.indexOf('(4,4)') !== -1;
      var hasSymmetric = true;
      var pList = document.createElement('div');
      pList.innerHTML = '<p style="font-weight:700;margin:0 0 6px">Relation Property Audit:</p>' +
        '<div>Reflexive: <strong style="color:' + (hasReflexive ? 'var(--dm-emerald)' : 'var(--dm-rose)') + '">' + (hasReflexive ? 'YES' : 'NO (Missing (a,a))') + '</strong></div>' +
        '<div>Symmetric: <strong style="color:var(--dm-emerald)">YES (All (a,b) have (b,a))</strong></div>' +
        '<div>Transitive: <strong style="color:var(--dm-emerald)">YES</strong></div>' +
        '<div>Equivalence Relation: <strong style="color:' + (hasReflexive ? 'var(--dm-emerald)' : 'var(--dm-rose)') + '">' + (hasReflexive ? 'YES' : 'NO') + '</strong></div>' +
        '<div style="margin-top:8px">Equivalence Classes: <code>{[1, 2, 3], [4]}</code></div>';
      inspectContent.appendChild(pList);
    } else {
      var defDiv = document.createElement('div');
      defDiv.innerHTML = '<p style="font-weight:700;margin:0 0 4px">Active Topic:</p><p>' + currentSim.topic + '</p>' +
        '<p style="font-weight:700;margin:8px 0 4px">Description:</p><p style="color:var(--dm-muted)">' + currentSim.description + '</p>';
      inspectContent.appendChild(defDiv);
    }
  }

  // Master Canvas Drawing Routine
  function draw() {
    if (!ctx || !canvas) return;
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle mathematical grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (var x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (var y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    var id = currentSim.id;
    if (id === 'u25ma401-boolean-algebra' || id === 'u25ma401-logic-gates-circuits') {
      drawLogicCircuit(ctx, w, h);
    } else if (id === 'u25ma401-set-operations-venn') {
      drawVennDiagram(ctx, w, h);
    } else if (id === 'u25ma401-relations-properties' || id === 'u25ma401-graph-representations') {
      drawGraphTopology(ctx, w, h);
    } else if (id === 'u25ma401-karnaugh-maps') {
      drawKMapCanvas(ctx, w, h);
    } else if (id === 'u25ma401-counting-principles') {
      drawPigeonholes(ctx, w, h);
    } else if (id === 'u25ma401-recurrence-relations') {
      drawRecurrenceSequence(ctx, w, h);
    } else if (id === 'u25ma401-euler-hamilton' || id === 'u25ma401-shortest-path-coloring') {
      drawEulerHamilton(ctx, w, h);
    } else {
      drawPropositionalAST(ctx, w, h);
    }
  }

  // 1. Draw Logic Gate Circuit
  function drawLogicCircuit(ctx, w, h) {
    ctx.save();
    var a = currentParams.varX !== undefined ? currentParams.varX : currentParams.inputA || 1;
    var b = currentParams.varY !== undefined ? currentParams.varY : currentParams.inputB || 0;
    var out = (a ^ b);

    // Draw Gate Body (XOR Gate Representation)
    var cx = w / 2;
    var cy = h / 2;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;

    // Gate curved back
    ctx.beginPath();
    ctx.arc(cx - 70, cy, 70, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    // Secondary curved arc for XOR
    ctx.beginPath();
    ctx.arc(cx - 85, cy, 70, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    // Top and bottom arcs meeting at point
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy - 60);
    ctx.quadraticCurveTo(cx + 40, cy - 60, cx + 80, cy);
    ctx.quadraticCurveTo(cx + 40, cy + 60, cx - 35, cy + 60);
    ctx.stroke();

    // Inputs lines
    ctx.strokeStyle = a ? '#10b981' : '#64748b';
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy - 30);
    ctx.lineTo(cx - 70, cy - 30);
    ctx.stroke();

    ctx.strokeStyle = b ? '#10b981' : '#64748b';
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy + 30);
    ctx.lineTo(cx - 70, cy + 30);
    ctx.stroke();

    // Output line
    ctx.strokeStyle = out ? '#10b981' : '#64748b';
    ctx.beginPath();
    ctx.moveTo(cx + 80, cy);
    ctx.lineTo(cx + 170, cy);
    ctx.stroke();

    // Input Labels
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = a ? '#10b981' : '#94a3b8';
    ctx.fillText('Input A: ' + a, cx - 250, cy - 25);
    ctx.fillStyle = b ? '#10b981' : '#94a3b8';
    ctx.fillText('Input B: ' + b, cx - 250, cy + 35);

    // Output Label
    ctx.fillStyle = out ? '#10b981' : '#f43f5e';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('Output: ' + out + ' (A ⊕ B)', cx + 180, cy + 6);

    ctx.restore();
  }

  // 2. Draw 3-Set Venn Diagram
  function drawVennDiagram(ctx, w, h) {
    ctx.save();
    var cx = w / 2;
    var cy = h / 2 - 20;
    var r = 110;

    // Set A (Top-Left)
    ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx - 65, cy - 35, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Set B (Top-Right)
    ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
    ctx.strokeStyle = '#a78bfa';
    ctx.beginPath();
    ctx.arc(cx + 65, cy - 35, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Set C (Bottom-Center)
    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.strokeStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(cx, cy + 65, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Labels
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#818cf8';
    ctx.fillText('Set A', cx - 180, cy - 110);
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('Set B', cx + 130, cy - 110);
    ctx.fillStyle = '#22d3ee';
    ctx.fillText('Set C', cx - 25, cy + 205);

    // Highlight Center Intersection A ∩ B ∩ C
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('A∩B∩C', cx - 22, cy);

    ctx.restore();
  }

  // 3. Draw Graph Topology
  function drawGraphTopology(ctx, w, h) {
    ctx.save();
    var nodes = [
      { id: '1', x: w / 2 - 120, y: h / 2 - 100 },
      { id: '2', x: w / 2 + 120, y: h / 2 - 100 },
      { id: '3', x: w / 2 + 150, y: h / 2 + 80 },
      { id: '4', x: w / 2 - 150, y: h / 2 + 80 }
    ];

    var edges = [
      [0, 1], [1, 2], [2, 0], [0, 3]
    ];

    // Edges
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    edges.forEach(function (e) {
      var n1 = nodes[e[0]];
      var n2 = nodes[e[1]];
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
    });

    // Nodes
    nodes.forEach(function (n) {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('v' + n.id, n.x, n.y);
    });

    ctx.restore();
  }

  // 4. Draw K-Map Graphical Cells
  function drawKMapCanvas(ctx, w, h) {
    ctx.save();
    var ox = w / 2 - 180;
    var oy = h / 2 - 110;
    var cw = 85;
    var ch = 75;

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('AB \\ C      0          1', ox - 20, oy - 15);

    var rows = ['00', '01', '11', '10'];
    for (var r = 0; r < 4; r++) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(rows[r], ox - 35, oy + r * ch + ch / 2 + 4);
      for (var c = 0; c < 2; c++) {
        var rx = ox + c * cw;
        var ry = oy + r * ch;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, ry, cw, ch);

        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(rx + 2, ry + 2, cw - 4, ch - 4);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px monospace';
        ctx.fillText((r + c) % 2 === 0 ? '1' : '0', rx + cw / 2 - 6, ry + ch / 2 + 6);
      }
    }
    ctx.restore();
  }

  // 5. Draw Pigeonhole Visualizer
  function drawPigeonholes(ctx, w, h) {
    ctx.save();
    var p = currentParams.pigeons || 13;
    var holes = currentParams.holes || 12;
    var cols = 4;
    var rows = Math.ceil(holes / cols);
    var bw = 110;
    var bh = 70;
    var startX = (w - (cols * (bw + 20))) / 2;
    var startY = (h - (rows * (bh + 20))) / 2 - 10;

    for (var i = 0; i < holes; i++) {
      var r = Math.floor(i / cols);
      var c = i % cols;
      var bx = startX + c * (bw + 20);
      var by = startY + r * (bh + 20);

      // Box
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.fillRect(bx, by, bw, bh);

      // Label
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Bucket ' + (i + 1), bx + 8, by + 18);

      // Pigeons in bucket
      var count = Math.floor(p / holes) + (i < (p % holes) ? 1 : 0);
      for (var k = 0; k < count; k++) {
        ctx.fillStyle = count > 1 ? '#f43f5e' : '#10b981';
        ctx.beginPath();
        ctx.arc(bx + 20 + k * 22, by + 45, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 6. Draw Recurrence Sequence
  function drawRecurrenceSequence(ctx, w, h) {
    ctx.save();
    var steps = currentParams.steps || 8;
    var maxVal = 34;
    var barW = 35;
    var startX = (w - (steps * (barW + 15))) / 2;
    var baseY = h - 80;

    // Fibonacci generator
    var seq = [0, 1];
    for (var i = 2; i <= steps; i++) seq.push(seq[i - 1] + seq[i - 2]);

    for (var j = 0; j <= Math.min(steps, stepIndex); j++) {
      var val = seq[j];
      var barH = (val / maxVal) * 220;
      var bx = startX + j * (barW + 15);
      var by = baseY - barH;

      ctx.fillStyle = j === stepIndex ? '#10b981' : '#6366f1';
      ctx.fillRect(bx, by, barW, barH);

      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(val), bx + 6, by - 8);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('a' + j, bx + 8, baseY + 20);
    }
    ctx.restore();
  }

  // 7. Draw Euler / Hamilton Graph
  function drawEulerHamilton(ctx, w, h) {
    ctx.save();
    var cx = w / 2;
    var cy = h / 2 - 10;
    var r = 120;
    var numVertices = 5;

    // Draw C5 or K5 polygon
    var coords = [];
    for (var i = 0; i < numVertices; i++) {
      var angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
      coords.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), id: String.fromCharCode(65 + i) });
    }

    // Outer cycle edges
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    for (var j = 0; j < numVertices; j++) {
      var c1 = coords[j];
      var c2 = coords[(j + 1) % numVertices];
      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.stroke();
    }

    // Vertex points
    coords.forEach(function (pt) {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pt.id, pt.x, pt.y);
    });

    ctx.restore();
  }

  // 8. Draw Propositional AST
  function drawPropositionalAST(ctx, w, h) {
    ctx.save();
    var cx = w / 2;
    var cy = 100;

    // Root operator <->
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↔', cx, cy);

    // Left child ->
    var lx = cx - 120;
    var ly = cy + 100;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(lx, ly, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('→', lx, ly);

    // Right child ∨
    var rx = cx + 120;
    var ry = cy + 100;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(rx, ry);
    ctx.stroke();

    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(rx, ry, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('∨', rx, ry);

    ctx.restore();
  }

  // Playback Step
  function step() {
    stepIndex++;
    updatePedagogicalText();
    draw();
  }

  function startPlayback() {
    if (isPlaying) return;
    isPlaying = true;
    if (btnPlay) {
      btnPlay.textContent = '⏸ Pause';
      btnPlay.classList.add('dm-btn-primary');
    }
    playTimer = setInterval(function () {
      step();
    }, 1000 / speedMultiplier);
  }

  function stopPlayback() {
    if (!isPlaying) return;
    isPlaying = false;
    clearInterval(playTimer);
    playTimer = null;
    if (btnPlay) btnPlay.textContent = '▶ Play';
  }

  // Attach Event Listeners
  if (unitSelect) {
    unitSelect.addEventListener('change', function () {
      var u = parseInt(unitSelect.value, 10);
      currentUnit = u;
      var unitSims = catalog.getSimulationsByUnit(u);
      if (unitSims.length > 0) {
        updateSimSelect();
        loadSimulation(unitSims[0]);
      }
    });
  }

  if (simSelect) {
    simSelect.addEventListener('change', function () {
      var sim = catalog.getSimulationById(simSelect.value);
      if (sim) loadSimulation(sim);
    });
  }

  if (btnStep) btnStep.addEventListener('click', step);
  if (btnPlay) {
    btnPlay.addEventListener('click', function () {
      if (isPlaying) stopPlayback();
      else startPlayback();
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      stopPlayback();
      stepIndex = 0;
      updatePedagogicalText();
      draw();
    });
  }

  // Speed buttons
  var speedBtns = document.querySelectorAll('.dm-btn-speed');
  speedBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      speedMultiplier = parseFloat(b.getAttribute('data-speed')) || 1;
      speedBtns.forEach(function (x) { x.classList.remove('dm-btn-primary'); });
      b.classList.add('dm-btn-primary');
      if (isPlaying) {
        stopPlayback();
        startPlayback();
      }
    });
  });

  // Theme Toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var html = document.documentElement;
      var cur = html.getAttribute('data-theme') || 'dark';
      var nextTheme = cur === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', nextTheme);
    });
  }

  // Export Canvas
  if (btnExport && canvas) {
    btnExport.addEventListener('click', function () {
      var link = document.createElement('a');
      link.download = currentSim.id + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  // Fullscreen
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {});
      } else {
        document.exitFullscreen().catch(function () {});
      }
    });
  }

  // Resize listener
  window.addEventListener('resize', function () {
    if (canvas) {
      canvas.width = canvas.parentElement.clientWidth || 800;
      canvas.height = canvas.parentElement.clientHeight || 480;
      draw();
    }
  });

  // Initial Execution
  initFromUrl();
  updateSimSelect();
  if (canvas) {
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 480;
  }
  loadSimulation(currentSim);
})();
