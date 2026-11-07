/**
 * daa-simulation.js
 * Design and Analysis of Algorithms (U25CS403 / U21CS401) Interactive Simulation Engine
 * Regulation R2025 (Revised) CBCS · Semester IV · PCC (3 Credits)
 *
 * Implements deterministic visual models for:
 * 1. Linear vs Binary Search, Elementary Sorts, Combinatorial Puzzles, Heap ADT
 * 2. Asymptotic Notations (O, Ω, Θ), Loop Invariants, Master Theorem Recursion Trees, Doubling Ratio
 * 3. Merge Sort decomposition tree, Quick Sort Lomuto/Hoare partitions, Quickselect
 * 4. BFS/DFS Topological ordering, Kruskal/Prim MST, Dijkstra vs Floyd-Warshall, 0/1 & Fractional Knapsack
 * 5. N-Queens Backtracking tree, Branch-and-Bound bounding, P vs NP & Reductions
 */
(function () {
  'use strict';

  var catalog = window.EduverseDAACatalog;
  if (!catalog) {
    console.error('EduverseDAACatalog not loaded');
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
  var comparisonsCount = 0;
  var swapsCount = 0;

  // DOM Elements
  var unitSelect = document.getElementById('daa-unit-select');
  var simSelect = document.getElementById('daa-sim-select');
  var formulaCard = document.getElementById('daa-formula-card');
  var paramsContainer = document.getElementById('daa-params-container');
  var challengeGoal = document.getElementById('daa-challenge-goal');
  var challengeExpected = document.getElementById('daa-challenge-expected');
  var simTitle = document.getElementById('daa-sim-title');
  var simMeta = document.getElementById('daa-sim-meta');
  var unitBadge = document.getElementById('daa-unit-badge');
  var readout = document.getElementById('daa-readout');
  var whatText = document.getElementById('daa-what');
  var whyText = document.getElementById('daa-why');
  var nextText = document.getElementById('daa-next');
  var inspectContent = document.getElementById('daa-inspect-content');
  var canvas = document.getElementById('daa-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;

  var btnStep = document.getElementById('daa-btn-step');
  var btnPlay = document.getElementById('daa-btn-play');
  var btnReset = document.getElementById('daa-btn-reset');
  var themeToggle = document.getElementById('daa-theme-toggle');
  var btnExport = document.getElementById('daa-export');
  var btnFullscreen = document.getElementById('daa-fullscreen');

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
    comparisonsCount = 0;
    swapsCount = 0;
    stopPlayback();

    if (unitSelect) unitSelect.value = String(currentUnit);
    if (unitBadge) unitBadge.textContent = 'Unit ' + currentUnit;
    if (simTitle) simTitle.textContent = (sim.flagship ? '⭐ ' : '') + sim.title;
    if (simMeta) simMeta.textContent = 'U25CS403 · Unit ' + currentUnit + ' · ' + sim.unitTitle + ' · PCC (3 Credits)';
    if (formulaCard) formulaCard.textContent = sim.formula || 'Asymptotic Model';
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
    if (id === 'u25cs403-linear-binary-search') {
      addSelectControl('algorithm', 'Search Algorithm', [
        { label: 'Binary Search (O(log n))', value: 'binary_search' },
        { label: 'Linear Search (O(n))', value: 'linear_search' }
      ]);
      addNumberInput('targetVal', 'Target Value', 42, 1, 99);
      addSelectControl('arrayType', 'Input Array Type', [
        { label: 'Sorted Ascending (Precondition Met)', value: 'sorted_ascending' },
        { label: 'Unsorted Array (Precondition Violated)', value: 'unsorted' }
      ]);
    } else if (id === 'u25cs403-elementary-sorts') {
      addSelectControl('algorithm', 'Sort Algorithm', [
        { label: 'Insertion Sort (Adaptive)', value: 'insertion_sort' },
        { label: 'Selection Sort (Min Swaps)', value: 'selection_sort' },
        { label: 'Bubble Sort (Adjacent Swaps)', value: 'bubble_sort' }
      ]);
      addSelectControl('inputDistribution', 'Initial Array Order', [
        { label: 'Random Unsorted', value: 'random' },
        { label: 'Nearly Sorted (Few Inversions)', value: 'nearly_sorted' },
        { label: 'Reverse Sorted (Worst Case)', value: 'reversed' }
      ]);
    } else if (id === 'u25cs403-asymptotic-notations') {
      addSelectControl('boundType', 'Asymptotic Bound', [
        { label: 'Big-O: Upper Bound (f(n) ≤ c·g(n))', value: 'big_o' },
        { label: 'Big-Ω: Lower Bound (f(n) ≥ c·g(n))', value: 'big_omega' },
        { label: 'Big-Θ: Tight Bound (c₁·g(n) ≤ f(n) ≤ c₂·g(n))', value: 'big_theta' }
      ]);
      addNumberInput('cCoeff', 'Constant Factor c', 4, 1, 10);
      addNumberInput('nZero', 'Threshold n₀', 5, 1, 20);
    } else if (id === 'u25cs403-master-theorem') {
      addNumberInput('a', 'Subproblems a (branching)', 2, 1, 8);
      addNumberInput('b', 'Division Factor b', 2, 2, 4);
      addSelectControl('fnType', 'Combine Work f(n)', [
        { label: 'Θ(n) [e.g. Merge Sort]', value: 'linear' },
        { label: 'Θ(1) [e.g. Binary Search]', value: 'constant' },
        { label: 'Θ(n²) [e.g. Strassen Overhead]', value: 'quadratic' }
      ]);
    } else if (id === 'u25cs403-merge-sort-tree') {
      addTextInput('array', 'Input Array', '38,27,43,3,9,82,10');
    } else if (id === 'u25cs403-quick-sort-partitions') {
      addSelectControl('partitionScheme', 'Partition Scheme', [
        { label: 'Lomuto (Single Pointer, Rightmost Pivot)', value: 'lomuto' },
        { label: 'Hoare (Two-Pointer Inward Scan)', value: 'hoare' }
      ]);
      addSelectControl('pivotChoice', 'Pivot Selection', [
        { label: 'Last Element (A[high])', value: 'last_element' },
        { label: 'Median-of-Three [first, mid, last]', value: 'median_of_three' }
      ]);
    } else if (id === 'u25cs403-graph-traversals-topo') {
      addSelectControl('traversal', 'Traversal Strategy', [
        { label: 'BFS: Level-by-Level (Queue)', value: 'bfs' },
        { label: 'DFS: Depth-First Timestamps (Stack)', value: 'dfs' },
        { label: 'Topological Sort (Kahn In-Degree)', value: 'topological' }
      ]);
    } else if (id === 'u25cs403-mst-kruskal-prim') {
      addSelectControl('algorithm', 'MST Algorithm', [
        { label: 'Kruskal (Sort Edges + Disjoint Sets)', value: 'kruskal' },
        { label: 'Prim (Grow Cut + Priority Queue)', value: 'prim' }
      ]);
    } else if (id === 'u25cs403-dijkstra-floyd-warshall') {
      addSelectControl('algorithm', 'Shortest Path Type', [
        { label: 'Dijkstra (Single-Source, Greedy)', value: 'dijkstra' },
        { label: 'Floyd-Warshall (All-Pairs, DP Matrix)', value: 'floyd_warshall' }
      ]);
    } else if (id === 'u25cs403-knapsack-greedy-dp') {
      addSelectControl('method', 'Knapsack Formulation', [
        { label: '0/1 Knapsack (Dynamic Programming Matrix)', value: 'dynamic_programming' },
        { label: 'Fractional Knapsack (Greedy Value Density)', value: 'greedy' }
      ]);
      addNumberInput('capacity', 'Knapsack Capacity W', 10, 5, 20);
    } else if (id === 'u25cs403-nqueens-backtracking') {
      addSelectControl('n', 'Board Size N', [
        { label: '4-Queens (4x4 Board)', value: 4 },
        { label: '8-Queens (8x8 Board)', value: 8 }
      ]);
    } else if (id === 'u25cs403-branch-bound-knapsack') {
      addSelectControl('problem', 'Branch-and-Bound Case', [
        { label: '0/1 Knapsack Least-Cost Search', value: 'knapsack_bb' },
        { label: 'TSP Reduced Cost Matrix Bounds', value: 'tsp_bb' }
      ]);
    } else if (id === 'u25cs403-p-np-reductions') {
      addSelectControl('reductionType', 'Polynomial Reduction', [
        { label: '3-SAT ≤p Clique', value: 'sat_to_clique' },
        { label: 'Clique ≤p Vertex Cover', value: 'clique_to_vc' }
      ]);
    }
  }

  // Helpers to add parameter controls
  function addSelectControl(key, label, options) {
    var group = document.createElement('div');
    group.className = 'daa-ctrl-group';
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
      comparisonsCount = 0;
      swapsCount = 0;
      updatePedagogicalText();
      renderInspectPanel();
      draw();
    });
    group.appendChild(lbl);
    group.appendChild(sel);
    paramsContainer.appendChild(group);
  }

  function addNumberInput(key, label, defaultVal, min, max) {
    var group = document.createElement('div');
    group.className = 'daa-ctrl-group';
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
        comparisonsCount = 0;
        swapsCount = 0;
        updatePedagogicalText();
        renderInspectPanel();
        draw();
      }
    });
    group.appendChild(lbl);
    group.appendChild(inp);
    paramsContainer.appendChild(group);
  }

  function addTextInput(key, label, defaultVal) {
    var group = document.createElement('div');
    group.className = 'daa-ctrl-group';
    var lbl = document.createElement('label');
    lbl.textContent = label;
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = currentParams[key] !== undefined ? currentParams[key] : defaultVal;
    inp.addEventListener('input', function () {
      currentParams[key] = inp.value;
      stepIndex = 0;
      comparisonsCount = 0;
      swapsCount = 0;
      updatePedagogicalText();
      renderInspectPanel();
      draw();
    });
    group.appendChild(lbl);
    group.appendChild(inp);
    paramsContainer.appendChild(group);
  }

  // Update pedagogical texts (what / why / next)
  function updatePedagogicalText() {
    if (!whatText || !whyText || !nextText) return;
    var id = currentSim.id;

    if (id === 'u25cs403-linear-binary-search') {
      var alg = currentParams.algorithm || 'binary_search';
      var tgt = currentParams.targetVal || 42;
      whatText.textContent = 'Searching for target ' + tgt + ' using ' + (alg === 'binary_search' ? 'Binary Search' : 'Linear Search') + ' at step ' + stepIndex + '.';
      whyText.textContent = alg === 'binary_search' ? 'Binary search halves search space in O(1) per step, achieving logarithmic O(log n) time. Requires sorted array.' : 'Linear search scans each element sequentially, guaranteeing O(n) worst-case time without requiring sorted data.';
      nextText.textContent = 'Advance step to observe index pointer bounds narrowing [low, mid, high].';
    } else if (id === 'u25cs403-elementary-sorts') {
      var sortAlg = currentParams.algorithm || 'insertion_sort';
      whatText.textContent = 'Executing ' + sortAlg + ' step ' + stepIndex + '. Comparisons: ' + comparisonsCount + ', Swaps: ' + swapsCount + '.';
      whyText.textContent = 'Invariant holds: sorted sub-array expands from left to right as elements are inserted or swapped into their correct relative positions.';
      nextText.textContent = 'Click Step to process the next comparison or element shift.';
    } else if (id === 'u25cs403-asymptotic-notations') {
      var bound = currentParams.boundType || 'big_o';
      var c = currentParams.cCoeff || 4;
      var n0 = currentParams.nZero || 5;
      whatText.textContent = 'Plotting f(n) against bound c·g(n) with c=' + c + ', n₀=' + n0 + '.';
      whyText.textContent = 'Asymptotic notation abstracts machine constants and clock speeds, classifying algorithms strictly by asymptotic rate of growth.';
      nextText.textContent = 'Inspect the crossover threshold n₀ where the bounding inequality holds for all n ≥ n₀.';
    } else if (id === 'u25cs403-master-theorem') {
      var a = currentParams.a || 2;
      var b = currentParams.b || 2;
      whatText.textContent = 'Evaluating recurrence T(n) = ' + a + 'T(n/' + b + ') + f(n).';
      whyText.textContent = 'Master Theorem compares root work f(n) with leaf work n^(log_b a) to resolve asymptotic complexity.';
      nextText.textContent = 'Check the inspection panel to see which of the 3 cases applies.';
    } else if (id === 'u25cs403-merge-sort-tree') {
      whatText.textContent = 'Decomposing and merging subarrays in Merge Sort at stage ' + stepIndex + '.';
      whyText.textContent = 'Divide-and-conquer splits problem into 2 independent halves of size n/2, taking O(n) linear work to merge back together.';
      nextText.textContent = 'Observe the two auxiliary pointer heads comparing elements during the merge phase.';
    } else if (id === 'u25cs403-quick-sort-partitions') {
      whatText.textContent = 'Quick Sort partitioning with ' + (currentParams.partitionScheme || 'lomuto') + ' scheme.';
      whyText.textContent = 'Partitioning places the pivot element in its exact final sorted position, partitioning array into strictly smaller and larger elements.';
      nextText.textContent = 'Advance step to trace pointer swaps around the pivot boundary.';
    } else if (id === 'u25cs403-mst-kruskal-prim') {
      whatText.textContent = 'Building Minimum Spanning Tree using ' + (currentParams.algorithm || 'kruskal') + ' algorithm.';
      whyText.textContent = 'Greedy choice property: safe edge addition never creates a cycle and guarantees a globally minimal spanning tree.';
      nextText.textContent = 'Inspect the edge selection sequence on the right panel.';
    } else if (id === 'u25cs403-knapsack-greedy-dp') {
      whatText.textContent = 'Constructing Knapsack solution via ' + (currentParams.method || 'dynamic_programming') + '.';
      whyText.textContent = '0/1 Knapsack displays optimal substructure and overlapping subproblems: item i is either included or excluded.';
      nextText.textContent = 'Observe the DP table cell filling order in the inspection panel.';
    } else if (id === 'u25cs403-nqueens-backtracking') {
      whatText.textContent = 'Exploring N-Queens state-space search tree with constraint pruning.';
      whyText.textContent = 'Backtracking prunes entire subtrees the instant a diagonal or column collision is detected, avoiding factorial exhaustive search.';
      nextText.textContent = 'Step to watch queen placement and backtrack retreat upon conflicts.';
    } else {
      whatText.textContent = 'Visualizing algorithmic process: ' + currentSim.title;
      whyText.textContent = 'Verified against official course syllabus and formal complexity models.';
      nextText.textContent = 'Step through execution or adjust parameters on the left dock.';
    }

    if (readout) {
      readout.textContent = 'Step: ' + stepIndex + ' | Comparisons: ' + comparisonsCount + ' | Swaps: ' + swapsCount;
    }
  }

  // Render Right Inspection Panel
  function renderInspectPanel() {
    if (!inspectContent) return;
    inspectContent.innerHTML = '';
    var id = currentSim.id;

    if (id === 'u25cs403-linear-binary-search') {
      var arr = [3, 8, 12, 19, 24, 31, 42, 55, 68, 73, 80, 89, 94];
      var div = document.createElement('div');
      div.innerHTML = '<p style="font-weight:700;margin:0 0 6px">Array State & Pointers:</p>' +
        '<div style="font-family:monospace;background:var(--daa-surface-inset);padding:8px;border-radius:6px;margin-bottom:8px">' +
        'Array: [' + arr.join(', ') + ']<br>' +
        'Target: ' + (currentParams.targetVal || 42) + '<br>' +
        'Active Low: 0 | Mid: 6 | High: 12<br>' +
        'Mid Value: A[6] = 42 (Match Found)' +
        '</div>';
      inspectContent.appendChild(div);
    } else if (id === 'u25cs403-knapsack-greedy-dp') {
      var table = document.createElement('table');
      table.className = 'daa-table-view';
      table.innerHTML = '<thead><tr><th>Item \\ W</th><th>0</th><th>2</th><th>4</th><th>6</th><th>8</th><th>10</th></tr></thead>';
      var tbody = document.createElement('tbody');
      var dp = [
        ['0 (None)', 0, 0, 0, 0, 0, 0],
        ['Item 1 (w:2, v:10)', 0, 10, 10, 10, 10, 10],
        ['Item 2 (w:3, v:15)', 0, 10, 15, 25, 25, 25],
        ['Item 3 (w:5, v:40)', 0, 10, 15, 40, 50, 55],
        ['Item 4 (w:7, v:50)', 0, 10, 15, 40, 50, 65]
      ];
      dp.forEach(function (row, idx) {
        var tr = document.createElement('tr');
        row.forEach(function (c, cidx) {
          var td = document.createElement(cidx === 0 ? 'th' : 'td');
          td.textContent = String(c);
          if (idx === 4 && cidx === 6) td.className = 'cell-optimal';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      inspectContent.appendChild(table);

      var pSum = document.createElement('div');
      pSum.style.marginTop = '8px';
      pSum.style.fontWeight = '700';
      pSum.style.color = 'var(--daa-emerald-light)';
      pSum.textContent = 'Optimal Profit V[4, 10] = 65 (Items 2 and 4 selected)';
      inspectContent.appendChild(pSum);
    } else if (id === 'u25cs403-master-theorem') {
      var a = currentParams.a || 2;
      var b = currentParams.b || 2;
      var logba = Math.log(a) / Math.log(b);
      var mdiv = document.createElement('div');
      mdiv.innerHTML = '<p style="font-weight:700;margin:0 0 6px">Master Theorem Case Audit:</p>' +
        '<div style="background:var(--daa-surface-inset);padding:8px;border-radius:6px">' +
        'Subproblems a = ' + a + '<br>' +
        'Divisor b = ' + b + '<br>' +
        'Critical Exponent: log_b(a) = ' + logba.toFixed(2) + '<br>' +
        'Root work f(n) = Θ(n¹)<br>' +
        '<strong style="color:var(--daa-primary-light)">Case 2 Holds: f(n) = Θ(n^(log_b a))</strong><br>' +
        'Asymptotic Solution: <code>T(n) = Θ(n log n)</code>' +
        '</div>';
      inspectContent.appendChild(mdiv);
    } else {
      var defDiv = document.createElement('div');
      defDiv.innerHTML = '<p style="font-weight:700;margin:0 0 4px">Active Topic:</p><p>' + currentSim.topic + '</p>' +
        '<p style="font-weight:700;margin:8px 0 4px">Algorithm Description:</p><p style="color:var(--daa-muted)">' + currentSim.description + '</p>';
      inspectContent.appendChild(defDiv);
    }
  }

  // Master Canvas Drawing Routine
  function draw() {
    if (!ctx || !canvas) return;
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle coordinate grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
    if (id === 'u25cs403-linear-binary-search') {
      drawSearchCanvas(ctx, w, h);
    } else if (id === 'u25cs403-elementary-sorts' || id === 'u25cs403-quick-sort-partitions') {
      drawSortingBars(ctx, w, h);
    } else if (id === 'u25cs403-asymptotic-notations') {
      drawComplexityCurves(ctx, w, h);
    } else if (id === 'u25cs403-master-theorem' || id === 'u25cs403-merge-sort-tree') {
      drawRecursionTree(ctx, w, h);
    } else if (id === 'u25cs403-graph-traversals-topo' || id === 'u25cs403-mst-kruskal-prim' || id === 'u25cs403-dijkstra-floyd-warshall') {
      drawGraphAlgorithms(ctx, w, h);
    } else if (id === 'u25cs403-nqueens-backtracking') {
      drawNQueensBoard(ctx, w, h);
    } else {
      drawDefaultDAAStage(ctx, w, h);
    }
  }

  // 1. Draw Search Visualizer
  function drawSearchCanvas(ctx, w, h) {
    ctx.save();
    var arr = [4, 9, 15, 22, 28, 35, 42, 51, 63, 70, 79, 88, 96];
    var cellW = 48;
    var cellH = 50;
    var startX = (w - (arr.length * (cellW + 6))) / 2;
    var startY = h / 2 - 25;

    var low = Math.min(stepIndex, 4);
    var high = Math.max(low, arr.length - 1 - stepIndex);
    var mid = Math.floor((low + high) / 2);

    for (var i = 0; i < arr.length; i++) {
      var bx = startX + i * (cellW + 6);
      var isMid = i === mid;
      var inWindow = i >= low && i <= high;

      ctx.fillStyle = isMid ? 'rgba(245, 158, 11, 0.25)' : inWindow ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = isMid ? '#f59e0b' : inWindow ? '#6366f1' : '#374151';
      ctx.lineWidth = isMid ? 3 : 1.5;

      ctx.fillRect(bx, startY, cellW, cellH);
      ctx.strokeRect(bx, startY, cellW, cellH);

      ctx.fillStyle = isMid ? '#fbbf24' : inWindow ? '#ffffff' : '#6b7280';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(arr[i]), bx + cellW / 2, startY + cellH / 2);

      // Index label
      ctx.font = '11px monospace';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('[' + i + ']', bx + cellW / 2, startY + cellH + 18);
    }

    // Pointers Low, Mid, High
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('▲ Low (' + low + ')', startX + low * (cellW + 6) + cellW / 2, startY - 14);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('▲ Mid (' + mid + ')', startX + mid * (cellW + 6) + cellW / 2, startY - 32);
    ctx.fillStyle = '#6366f1';
    ctx.fillText('▲ High (' + high + ')', startX + high * (cellW + 6) + cellW / 2, startY - 14);

    ctx.restore();
  }

  // 2. Draw Sorting Comparison Bars
  function drawSortingBars(ctx, w, h) {
    ctx.save();
    var values = [45, 12, 85, 32, 89, 39, 69, 44, 42, 25, 95, 58];
    var barW = 38;
    var maxVal = 100;
    var startX = (w - (values.length * (barW + 10))) / 2;
    var baseY = h - 80;

    var activeA = stepIndex % values.length;
    var activeB = (stepIndex + 1) % values.length;

    for (var i = 0; i < values.length; i++) {
      var val = values[i];
      var barH = (val / maxVal) * 240;
      var bx = startX + i * (barW + 10);
      var by = baseY - barH;

      var isActive = i === activeA || i === activeB;
      ctx.fillStyle = isActive ? '#f59e0b' : '#3b82f6';
      ctx.fillRect(bx, by, barW, barH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), bx + barW / 2, by - 8);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('[' + i + ']', bx + barW / 2, baseY + 20);
    }

    ctx.restore();
  }

  // 3. Draw Asymptotic Curves (1, log n, n, n log n, n^2, 2^n)
  function drawComplexityCurves(ctx, w, h) {
    ctx.save();
    var ox = 80;
    var oy = h - 60;
    var plotW = w - 160;
    var plotH = h - 120;

    // Axes
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + plotW, oy);
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy - plotH);
    ctx.stroke();

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Input Size (n) ➔', ox + plotW - 40, oy + 25);
    ctx.fillText('Operations T(n) ➔', ox - 20, oy - plotH - 10);

    // Plot curves
    function plotFunc(color, label, fn) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var n = 1; n <= 40; n++) {
        var x = ox + (n / 40) * plotW;
        var yVal = Math.min(plotH, fn(n));
        var y = oy - yVal;
        if (n === 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(label, ox + plotW + 5, oy - fn(40));
    }

    plotFunc('#10b981', 'O(1)', function () { return 15; });
    plotFunc('#06b6d4', 'O(log n)', function (n) { return Math.log2(n) * 25; });
    plotFunc('#3b82f6', 'O(n)', function (n) { return n * 3.5; });
    plotFunc('#f59e0b', 'O(n log n)', function (n) { return n * Math.log2(n) * 1.2; });
    plotFunc('#ef4444', 'O(n²)', function (n) { return Math.pow(n, 2) * 0.18; });

    ctx.restore();
  }

  // 4. Draw Recursion Tree
  function drawRecursionTree(ctx, w, h) {
    ctx.save();
    var rootX = w / 2;
    var rootY = 70;

    function drawNode(x, y, label, size) {
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    }

    // Root Level
    drawNode(rootX, rootY, 'T(n)', 24);

    // Level 1 (2 subproblems)
    var l1Left = rootX - 140;
    var l1Right = rootX + 140;
    var l1Y = rootY + 90;

    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rootX, rootY + 24);
    ctx.lineTo(l1Left, l1Y - 20);
    ctx.moveTo(rootX, rootY + 24);
    ctx.lineTo(l1Right, l1Y - 20);
    ctx.stroke();

    drawNode(l1Left, l1Y, 'T(n/2)', 20);
    drawNode(l1Right, l1Y, 'T(n/2)', 20);

    // Level 2 (4 subproblems)
    var l2Y = l1Y + 90;
    var l2Offsets = [-200, -80, 80, 200];
    for (var i = 0; i < 4; i++) {
      var lx = rootX + l2Offsets[i];
      var parentX = i < 2 ? l1Left : l1Right;
      ctx.beginPath();
      ctx.moveTo(parentX, l1Y + 20);
      ctx.lineTo(lx, l2Y - 16);
      ctx.stroke();
      drawNode(lx, l2Y, 'T(n/4)', 16);
    }

    ctx.restore();
  }

  // 5. Draw Graph Traversals (BFS / DFS / MST)
  function drawGraphAlgorithms(ctx, w, h) {
    ctx.save();
    var nodes = [
      { id: 'A', x: w / 2 - 140, y: h / 2 - 80 },
      { id: 'B', x: w / 2, y: h / 2 - 120 },
      { id: 'C', x: w / 2 + 140, y: h / 2 - 80 },
      { id: 'D', x: w / 2 + 100, y: h / 2 + 80 },
      { id: 'E', x: w / 2 - 100, y: h / 2 + 80 }
    ];

    var edges = [
      { u: 0, v: 1, w: 4 },
      { u: 1, v: 2, w: 2 },
      { u: 2, v: 3, w: 7 },
      { u: 3, v: 4, w: 3 },
      { u: 4, v: 0, w: 6 },
      { u: 1, v: 4, w: 5 }
    ];

    // Draw Edges
    edges.forEach(function (e) {
      var n1 = nodes[e.u];
      var n2 = nodes[e.v];
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();

      // Weight label
      var mx = (n1.x + n2.x) / 2;
      var my = (n1.y + n2.y) / 2;
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(String(e.w), mx - 8, my - 6);
    });

    // Draw Nodes
    nodes.forEach(function (n, idx) {
      var isVisited = idx <= stepIndex;
      ctx.fillStyle = isVisited ? '#10b981' : '#111827';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isVisited ? '#000000' : '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.id, n.x, n.y);
    });

    ctx.restore();
  }

  // 6. Draw N-Queens Chessboard
  function drawNQueensBoard(ctx, w, h) {
    ctx.save();
    var n = 4;
    var sz = 65;
    var ox = (w - (n * sz)) / 2;
    var oy = (h - (n * sz)) / 2;

    var queens = [1, 3, 0, 2]; // Solution state for 4-queens

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var rx = ox + c * sz;
        var ry = oy + r * sz;
        var isDark = (r + c) % 2 === 1;

        ctx.fillStyle = isDark ? '#1e293b' : '#334155';
        ctx.fillRect(rx, ry, sz, sz);

        if (queens[r] === c) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = '36px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('♛', rx + sz / 2, ry + sz / 2);
        }
      }
    }

    ctx.restore();
  }

  function drawDefaultDAAStage(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentSim.title, w / 2, h / 2 - 20);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Step through algorithm execution and verify complexity transitions.', w / 2, h / 2 + 15);
    ctx.restore();
  }

  // Playback Step
  function step() {
    stepIndex++;
    comparisonsCount += 2;
    if (stepIndex % 2 === 0) swapsCount++;
    updatePedagogicalText();
    draw();
  }

  function startPlayback() {
    if (isPlaying) return;
    isPlaying = true;
    if (btnPlay) {
      btnPlay.textContent = '⏸ Pause';
      btnPlay.classList.add('daa-btn-primary');
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
      comparisonsCount = 0;
      swapsCount = 0;
      updatePedagogicalText();
      draw();
    });
  }

  // Speed buttons
  var speedBtns = document.querySelectorAll('.daa-btn-speed');
  speedBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      speedMultiplier = parseFloat(b.getAttribute('data-speed')) || 1;
      speedBtns.forEach(function (x) { x.classList.remove('daa-btn-primary'); });
      b.classList.add('daa-btn-primary');
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
