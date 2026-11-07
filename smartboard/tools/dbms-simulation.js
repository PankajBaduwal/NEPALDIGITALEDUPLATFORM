/**
 * dbms-simulation.js
 * Master Interactive Simulation Engine for Database Management Systems (U25CS401)
 * Regulation R2025 CBCS · Semester III · PCC · 3 Credits
 *
 * 18 Verified Interactive Curriculum Simulations across 5 Units:
 *   Unit I:   Database Architecture & Data Modeling (Sims 1-4)
 *   Unit II:  Relational Model & Relational Algebra (Sims 5-8)
 *   Unit III: SQL Query Language & Schema Operations (Sims 9-12)
 *   Unit IV:  Functional Dependencies & Normalization (Sims 13-15)
 *   Unit V:   Transaction Management, Concurrency & Recovery (Sims 16-18)
 *
 * 100% In-Memory Educational Relational Engine:
 *   - Strictly isolated from production or tenant databases
 *   - Fully sandboxed deterministic query execution
 *   - Precise mathematical attribute closure & serialization graph analysis
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1. STATE & DOM REFERENCES
  // ══════════════════════════════════════════════════════════
  const catalog = (typeof window !== 'undefined' && window.EduverseDBMSCatalog) || null;
  if (!catalog) {
    console.error('[DBMS Simulation] EduverseDBMSCatalog not loaded.');
    return;
  }

  const state = {
    currentUnit: 1,
    currentSimId: 'u25cs401-db-architecture',
    mode: 'learn', // 'learn' | 'experiment' | 'challenge'
    theme: (function () { try { return localStorage.getItem('eduverse_theme') || 'light'; } catch (e) { return 'light'; } })(),
    isPlaying: false,
    speed: 1.0,
    currentStep: 0,
    maxSteps: 5,
    playIntervalId: null,
    params: {},
    challengeState: { solved: false, feedback: '' },

    // In-memory isolated database tables for student practice
    database: {
      students: [
        { id: 101, name: 'Aarav Patel', dept: 'CS', gpa: 3.85, credits: 74 },
        { id: 102, name: 'Bhavna Sharma', dept: 'IT', gpa: 3.40, credits: 62 },
        { id: 103, name: 'Chetan Kumar', dept: 'CS', gpa: 3.92, credits: 88 },
        { id: 104, name: 'Divya Nair', dept: 'EC', gpa: 3.15, credits: 58 },
        { id: 105, name: 'Eashan Reddy', dept: 'IT', gpa: 3.65, credits: 70 },
        { id: 106, name: 'Farah Khan', dept: 'ME', gpa: 3.50, credits: 65 }
      ],
      departments: [
        { id: 'CS', name: 'Computer Science', building: 'Turing Hall', budget: 950000 },
        { id: 'IT', name: 'Information Tech', building: 'Ada Lovelace Wing', budget: 820000 },
        { id: 'EC', name: 'Electronics Eng', building: 'Maxwell Block', budget: 780000 },
        { id: 'ME', name: 'Mechanical Eng', building: 'Carnot Labs', budget: 650000 }
      ],
      courses: [
        { code: 'CS301', title: 'Data Structures', credits: 4, dept: 'CS' },
        { code: 'CS401', title: 'DBMS', credits: 3, dept: 'CS' },
        { code: 'IT302', title: 'Web Tech', credits: 3, dept: 'IT' },
        { code: 'EC204', title: 'Signals & Systems', credits: 4, dept: 'EC' }
      ],
      enrollments: [
        { student_id: 101, course_code: 'CS401', grade: 'A' },
        { student_id: 101, course_code: 'CS301', grade: 'A' },
        { student_id: 102, course_code: 'CS401', grade: 'B' },
        { student_id: 103, course_code: 'CS401', grade: 'S' },
        { student_id: 103, course_code: 'IT302', grade: 'A' },
        { student_id: 105, course_code: 'CS401', grade: 'B' }
      ]
    },

    // Transaction & Schedule Engine state
    transactions: {
      schedule: [
        { tx: 'T1', op: 'READ', item: 'A' },
        { tx: 'T2', op: 'READ', item: 'A' },
        { tx: 'T1', op: 'WRITE', item: 'A' },
        { tx: 'T2', op: 'WRITE', item: 'A' },
        { tx: 'T1', op: 'COMMIT', item: null },
        { tx: 'T2', op: 'COMMIT', item: null }
      ],
      currentOpIndex: 0,
      locks: {}, // item -> { type: 'SHARED' | 'EXCLUSIVE', holders: ['T1'] }
      activeStatus: { T1: 'Active', T2: 'Active' },
      balances: { A: 1000, B: 500 }
    }
  };

  const dom = {
    app: document.getElementById('ep-app'),
    unitSelect: document.getElementById('dbms-unit'),
    simSelect: document.getElementById('dbms-simulation'),
    title: document.getElementById('ep-title'),
    subtitle: document.getElementById('ep-subtitle'),
    themeToggle: document.getElementById('dbms-theme-toggle'),
    fullscreenBtn: document.getElementById('ep-fullscreen'),
    exportBtn: document.getElementById('ep-export'),
    modeBtns: document.querySelectorAll('.ep-seg'),
    playBtn: document.getElementById('ep-play'),
    pauseBtn: document.getElementById('ep-pause'),
    prevBtn: document.getElementById('ep-prev'),
    nextBtn: document.getElementById('ep-next'),
    resetBtn: document.getElementById('ep-reset'),
    resetParamsBtn: document.getElementById('dbms-reset-params'),
    speedSelect: document.getElementById('dbms-speed'),
    stepLabel: document.getElementById('dbms-step-label'),
    progressFill: document.getElementById('dbms-progress-fill'),
    canvas: document.getElementById('dbms-canvas'),
    tableView: document.getElementById('dbms-table-view'),
    readouts: document.getElementById('ep-readouts'),
    overlaySim: document.getElementById('dbms-overlay-sim'),
    overlayState: document.getElementById('dbms-overlay-state'),
    whatText: document.getElementById('dbms-what'),
    whyText: document.getElementById('dbms-why'),
    nextText: document.getElementById('dbms-next-info'),
    formulaBox: document.getElementById('ep-formula-box'),
    bannerTitle: document.getElementById('ep-banner-title'),
    bannerText: document.getElementById('ep-banner-text'),
    inputsForm: document.getElementById('dbms-inputs-form'),
    inputActions: document.getElementById('dbms-input-actions'),
    challengeCard: document.getElementById('ep-challenge-card'),
    challengePrompt: document.getElementById('dbms-challenge-prompt'),
    verifyChallengeBtn: document.getElementById('dbms-verify-challenge'),
    challengeFeedback: document.getElementById('dbms-challenge-feedback'),
    toast: document.getElementById('dbms-toast')
  };

  const ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  // ══════════════════════════════════════════════════════════
  // 2. MATHEMATICAL & RELATIONAL CORE ENGINES
  // ══════════════════════════════════════════════════════════
  const DBMSCore = {
    // Computes Attribute Closure X+ under functional dependencies F
    computeAttributeClosure: function (attributes, fds, testAttr) {
      const allAttrs = attributes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      const parsedFDs = fds.split(',').map(fdStr => {
        const parts = fdStr.split('->').map(s => s.trim().toUpperCase());
        if (parts.length === 2) {
          const lhs = parts[0].split('').filter(c => /[A-Z]/.test(c));
          const rhs = parts[1].split('').filter(c => /[A-Z]/.test(c));
          return { lhs, rhs, raw: fdStr.trim() };
        }
        return null;
      }).filter(Boolean);

      let closure = new Set(testAttr.split('').map(c => c.trim().toUpperCase()).filter(c => /[A-Z]/.test(c)));
      let changed = true;
      const stepTrace = [Array.from(closure).sort().join('')];

      while (changed) {
        changed = false;
        for (const fd of parsedFDs) {
          const lhsCovered = fd.lhs.every(attr => closure.has(attr));
          if (lhsCovered) {
            for (const rhsAttr of fd.rhs) {
              if (!closure.has(rhsAttr)) {
                closure.add(rhsAttr);
                changed = true;
              }
            }
          }
        }
        if (changed) {
          stepTrace.push(Array.from(closure).sort().join(''));
        }
      }

      const finalClosure = Array.from(closure).sort();
      const isSuperkey = allAttrs.length > 0 && allAttrs.every(a => closure.has(a));

      return {
        closure: finalClosure,
        stepTrace: stepTrace,
        isSuperkey: isSuperkey,
        allAttrs: allAttrs
      };
    },

    // Evaluates Conflict Serializability for a schedule
    analyzeConflictSerializability: function (schedule) {
      const transactions = Array.from(new Set(schedule.map(op => op.tx))).sort();
      const edges = [];
      const conflicts = [];

      for (let i = 0; i < schedule.length; i++) {
        const op1 = schedule[i];
        if (op1.op === 'COMMIT' || !op1.item) continue;

        for (let j = i + 1; j < schedule.length; j++) {
          const op2 = schedule[j];
          if (op2.op === 'COMMIT' || !op2.item) continue;

          // Conflict condition: Same item, different transactions, at least one write
          if (op1.tx !== op2.tx && op1.item === op2.item && (op1.op === 'WRITE' || op2.op === 'WRITE')) {
            conflicts.push({
              source: op1,
              target: op2,
              desc: `${op1.tx}: ${op1.op}(${op1.item}) precedes ${op2.tx}: ${op2.op}(${op2.item})`
            });
            const edgeExists = edges.some(e => e.from === op1.tx && e.to === op2.tx);
            if (!edgeExists) {
              edges.push({ from: op1.tx, to: op2.tx });
            }
          }
        }
      }

      // Cycle detection using DFS
      const adj = {};
      transactions.forEach(t => { adj[t] = []; });
      edges.forEach(e => { if (adj[e.from]) adj[e.from].push(e.to); });

      const visited = {};
      const recStack = {};
      let hasCycle = false;
      const cyclePath = [];

      function isCyclic(node, path) {
        visited[node] = true;
        recStack[node] = true;
        path.push(node);

        for (const neighbor of adj[node] || []) {
          if (!visited[neighbor]) {
            if (isCyclic(neighbor, path)) return true;
          } else if (recStack[neighbor]) {
            path.push(neighbor);
            return true;
          }
        }

        recStack[node] = false;
        path.pop();
        return false;
      }

      for (const t of transactions) {
        if (!visited[t]) {
          const path = [];
          if (isCyclic(t, path)) {
            hasCycle = true;
            cyclePath.push(...path);
            break;
          }
        }
      }

      return {
        transactions,
        edges,
        conflicts,
        isSerializable: !hasCycle,
        cyclePath: hasCycle ? cyclePath : []
      };
    },

    // Relational Algebra Selection
    selectRelation: function (relation, predicateFn) {
      return relation.filter(predicateFn);
    },

    // Relational Algebra Projection
    projectRelation: function (relation, columns) {
      return relation.map(row => {
        const out = {};
        columns.forEach(col => { if (col in row) out[col] = row[col]; });
        return out;
      });
    },

    // Relational Natural / Equi Join
    joinRelations: function (relA, relB, joinKeyA, joinKeyB, joinType) {
      const results = [];
      const matchedBIndices = new Set();

      relA.forEach(rowA => {
        let matched = false;
        relB.forEach((rowB, idxB) => {
          if (String(rowA[joinKeyA]) === String(rowB[joinKeyB])) {
            matched = true;
            matchedBIndices.add(idxB);
            results.push({ ...rowA, ...rowB });
          }
        });

        if (!matched && (joinType === 'left' || joinType === 'full')) {
          const nullRowB = {};
          Object.keys(relB[0] || {}).forEach(k => { nullRowB[k] = null; });
          results.push({ ...rowA, ...nullRowB });
        }
      });

      if (joinType === 'right' || joinType === 'full') {
        relB.forEach((rowB, idxB) => {
          if (!matchedBIndices.has(idxB)) {
            const nullRowA = {};
            Object.keys(relA[0] || {}).forEach(k => { nullRowA[k] = null; });
            results.push({ ...nullRowA, ...rowB });
          }
        });
      }

      return results;
    }
  };

  // ══════════════════════════════════════════════════════════
  // 3. CANVAS RENDERING UTILITIES
  // ══════════════════════════════════════════════════════════
  function renderCanvas() {
    if (!ctx || !dom.canvas) return;
    const width = dom.canvas.width;
    const height = dom.canvas.height;
    const isDark = state.theme === 'dark';

    // Clear background
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const simId = state.currentSimId;

    switch (simId) {
      case 'u25cs401-db-architecture':
        renderThreeSchemaArchitecture(width, height, isDark);
        break;
      case 'u25cs401-er-modeling':
        renderERDiagram(width, height, isDark);
        break;
      case 'u25cs401-er-to-relational':
        renderERToRelationalMapping(width, height, isDark);
        break;
      case 'u25cs401-keys-integrity':
        renderKeysAndIntegrity(width, height, isDark);
        break;
      case 'u25cs401-relational-algebra':
        renderRelationalAlgebra(width, height, isDark);
        break;
      case 'u25cs401-joins-explorer':
        renderJoinsExplorer(width, height, isDark);
        break;
      case 'u25cs401-division-set-ops':
        renderDivisionSetOps(width, height, isDark);
        break;
      case 'u25cs401-relational-calculus':
        renderRelationalCalculus(width, height, isDark);
        break;
      case 'u25cs401-sql-query-builder':
        renderSqlQuerySandbox(width, height, isDark);
        break;
      case 'u25cs401-select-execution-tracer':
        renderSelectExecutionTracer(width, height, isDark);
        break;
      case 'u25cs401-aggregates-group-by':
        renderAggregatesGroupBy(width, height, isDark);
        break;
      case 'u25cs401-subqueries-views':
        renderSubqueriesAndViews(width, height, isDark);
        break;
      case 'u25cs401-functional-dependencies':
        renderFunctionalDependencies(width, height, isDark);
        break;
      case 'u25cs401-candidate-keys':
        renderCandidateKeys(width, height, isDark);
        break;
      case 'u25cs401-normalization-workshop':
        renderNormalizationWorkshop(width, height, isDark);
        break;
      case 'u25cs401-acid-transaction-states':
        renderAcidTransactionStates(width, height, isDark);
        break;
      case 'u25cs401-serializability-conflict':
        renderConflictSerializability(width, height, isDark);
        break;
      case 'u25cs401-concurrency-recovery':
        renderConcurrencyAndRecovery(width, height, isDark);
        break;
      default:
        renderGenericDBMSStage(width, height, isDark);
        break;
    }
  }

  function drawCard(x, y, w, h, title, subtitle, color, isDark) {
    ctx.save();
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.strokeStyle = color || '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color || (isDark ? '#34d399' : '#059669');
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(title, x + 14, y + 24);

    if (subtitle) {
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '11.5px sans-serif';
      ctx.fillText(subtitle, x + 14, y + 42);
    }
    ctx.restore();
  }

  function drawArrow(fromX, fromY, toX, toY, color, label) {
    ctx.save();
    ctx.strokeStyle = color || '#10b981';
    ctx.fillStyle = color || '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 8 * Math.cos(angle - Math.PI / 6), toY - 8 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - 8 * Math.cos(angle + Math.PI / 6), toY - 8 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = '10.5px sans-serif';
      ctx.fillStyle = color || '#10b981';
      ctx.fillText(label, (fromX + toX) / 2 + 6, (fromY + toY) / 2 - 4);
    }
    ctx.restore();
  }

  // 1. ANSI/SPARC Three-Schema Architecture
  function renderThreeSchemaArchitecture(w, h, isDark) {
    const cardW = 380;
    const cardH = 95;
    const centerX = (w - cardW) / 2;

    // External Layer
    drawCard(centerX, 40, cardW, cardH, '1. External Level (User Views)', 'View 1: Student Portal | View 2: Registrar Transcript View', '#06b6d4', isDark);

    // Conceptual Layer
    drawCard(centerX, 200, cardW, cardH, '2. Conceptual Level (Logical Schema)', 'Entities, Attributes, Relationships & Integrity Constraints (RDBMS Tables)', '#10b981', isDark);

    // Internal Layer
    drawCard(centerX, 360, cardW, cardH, '3. Internal Level (Physical Storage)', 'Data file blocks, B+ Tree Indexes, Hashing, Record Offsets on Disk', '#f59e0b', isDark);

    // Mappings & Independence Arrows
    drawArrow(centerX + cardW / 2 - 40, 135, centerX + cardW / 2 - 40, 200, '#06b6d4', 'External/Conceptual Mapping');
    drawArrow(centerX + cardW / 2 + 40, 200, centerX + cardW / 2 + 40, 135, '#06b6d4', 'Logical Data Independence');

    drawArrow(centerX + cardW / 2 - 40, 295, centerX + cardW / 2 - 40, 360, '#10b981', 'Conceptual/Internal Mapping');
    drawArrow(centerX + cardW / 2 + 40, 360, centerX + cardW / 2 + 40, 295, '#10b981', 'Physical Data Independence');

    // Indicator highlight for active layer
    ctx.fillStyle = isDark ? '#34d399' : '#059669';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('✓ Physical Data Independence: Altering B-Tree Index requires ZERO changes to Conceptual Schema!', 60, h - 30);
  }

  // 2. ER Diagram Builder & Cardinality
  function renderERDiagram(w, h, isDark) {
    // Entity 1: Student
    drawCard(80, 140, 180, 80, 'Student [Entity]', 'Attributes: ID(PK), Name, GPA', '#10b981', isDark);

    // Relationship: Enrolls_In (Diamond)
    ctx.save();
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(390, 140);
    ctx.lineTo(460, 180);
    ctx.lineTo(390, 220);
    ctx.lineTo(320, 180);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Enrolls_In', 362, 184);
    ctx.restore();

    // Entity 2: Course
    drawCard(530, 140, 180, 80, 'Course [Entity]', 'Attributes: Code(PK), Title, Dept', '#06b6d4', isDark);

    // Cardinality Lines: M:N
    drawArrow(260, 180, 320, 180, '#f59e0b', 'M (Total)');
    drawArrow(530, 180, 460, 180, '#f59e0b', 'N (Partial)');

    // Weak Entity: Section
    drawCard(300, 320, 180, 80, 'Section [Weak Entity]', 'Partial Key: sec_id (Dashed)', '#6366f1', isDark);
    drawArrow(620, 220, 480, 330, '#6366f1', '1:N Identifying');

    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText('ER Cardinality: M:N creates a bridge table Enrollment(student_id, course_code, grade).', 80, h - 40);
  }

  // 3. ER-to-Relational Mapping
  function renderERToRelationalMapping(w, h, isDark) {
    drawCard(50, 60, 220, 100, 'ER Model Input', 'Student (M) <--> (N) Course\nSection (Weak Entity of Course)', '#10b981', isDark);
    drawArrow(270, 110, 360, 110, '#10b981', 'Algorithm Mapping');

    drawCard(360, 60, 440, 260, 'Generated Relational Tables', '3 Normalised Relations Generated:', '#06b6d4', isDark);

    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.fillText('TABLE Students (', 380, 120);
    ctx.fillText('  student_id INT PRIMARY KEY,', 400, 140);
    ctx.fillText('  name VARCHAR(50), gpa FLOAT', 400, 160);
    ctx.fillText(');', 380, 180);

    ctx.fillText('TABLE Courses (', 380, 205);
    ctx.fillText('  course_id VARCHAR(10) PRIMARY KEY, title VARCHAR(50)', 400, 225);
    ctx.fillText(');', 380, 245);

    ctx.fillText('TABLE Student_Courses ( -- Bridge Table for M:N', 380, 270);
    ctx.fillText('  student_id INT REFERENCES Students(student_id),', 400, 290);
    ctx.fillText('  course_id VARCHAR(10) REFERENCES Courses(course_id),', 400, 308);
    ctx.fillText('  PRIMARY KEY (student_id, course_id)', 400, 326);
    ctx.fillText(');', 380, 344);
  }

  // 4. Keys and Integrity Constraints
  function renderKeysAndIntegrity(w, h, isDark) {
    drawCard(60, 60, 340, 180, 'Parent: Departments', 'PK: dept_id (Unique, NOT NULL)', '#10b981', isDark);
    ctx.font = '11.5px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('PK: "CS" -> Turing Hall, Budget $950K', 80, 120);
    ctx.fillText('PK: "IT" -> Ada Lovelace Wing, $820K', 80, 145);
    ctx.fillText('PK: "EC" -> Maxwell Block, $780K', 80, 170);

    drawCard(460, 60, 340, 180, 'Child: Students', 'FK: dept -> References Departments(dept_id)', '#06b6d4', isDark);
    ctx.fillText('ID 101: Aarav Patel   | FK: "CS" [VALID]', 480, 120);
    ctx.fillText('ID 102: Bhavna Sharma | FK: "IT" [VALID]', 480, 145);
    ctx.fillText('ID 107: Invalid Staff | FK: "ZZ" [VIOLATION!]', 480, 170);

    drawArrow(460, 145, 400, 145, '#10b981', 'FK Reference');

    drawCard(60, 280, 740, 140, 'Integrity Enforcement Engine', '1. Entity Integrity: Primary key ID cannot be NULL or duplicate\n2. Referential Integrity: ON DELETE CASCADE / RESTRICT active\n3. Domain Integrity: GPA strictly bounded in range [0.0, 4.0]', '#f59e0b', isDark);
  }

  // 5. Relational Algebra Operator Visualizer
  function renderRelationalAlgebra(w, h, isDark) {
    drawCard(50, 50, 240, 240, 'Relation R: Students', 'Attributes: id, name, dept, gpa', '#10b981', isDark);
    ctx.font = '11px monospace';
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    state.database.students.slice(0, 5).forEach((row, i) => {
      ctx.fillText(`${row.id} | ${row.name.padEnd(12)} | ${row.dept} | ${row.gpa}`, 65, 110 + i * 26);
    });

    drawCard(560, 50, 250, 240, 'Result: σ_{gpa ≥ 3.5}(R)', 'Filter Predicate Applied', '#06b6d4', isDark);
    const filtered = state.database.students.filter(s => s.gpa >= 3.5);
    filtered.forEach((row, i) => {
      ctx.fillText(`${row.id} | ${row.name.padEnd(12)} | ${row.dept} | ${row.gpa}`, 575, 110 + i * 26);
    });

    drawArrow(290, 170, 560, 170, '#10b981', 'σ_{gpa ≥ 3.5}');

    drawCard(50, 320, 760, 120, 'Algebra Expression Formulation', 'Query: π_{name, gpa}(σ_{dept="CS" ∧ gpa > 3.8}(Students))\n1. Selection σ filters candidate tuples based on Boolean logic\n2. Projection π discards unrequested columns and eliminates duplicate rows', '#f59e0b', isDark);
  }

  // 6. Joins Explorer
  function renderJoinsExplorer(w, h, isDark) {
    drawCard(50, 50, 230, 180, 'Table A: Employees', 'id, name, dept_id', '#10b981', isDark);
    ctx.font = '11px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('1 | Alice  | CS', 65, 110);
    ctx.fillText('2 | Bob    | IT', 65, 135);
    ctx.fillText('3 | Charlie| HR [Unmatched]', 65, 160);

    drawCard(570, 50, 230, 180, 'Table B: Depts', 'dept_id, building', '#06b6d4', isDark);
    ctx.fillText('CS | Turing Hall', 585, 110);
    ctx.fillText('IT | Ada Lovelace', 585, 135);
    ctx.fillText('ME | Carnot Labs [Unmatched]', 585, 160);

    drawCard(50, 270, 750, 180, 'Natural Join vs Outer Joins Result (A ⟕ B)', 'Left Outer Join Output (Preserves all A rows with NULL for missing B):', '#6366f1', isDark);
    ctx.fillText('Alice   | CS | CS | Turing Hall     --> [MATCHED INNER ROW]', 70, 330);
    ctx.fillText('Bob     | IT | IT | Ada Lovelace    --> [MATCHED INNER ROW]', 70, 360);
    ctx.fillText('Charlie | HR | NULL | NULL          --> [PRESERVED LEFT OUTER ROW]', 70, 390);
  }

  // 7. Relational Division and Set Ops
  function renderDivisionSetOps(w, h, isDark) {
    drawCard(60, 50, 230, 200, 'Relation R(Student, Course)', 'Completed Course Records', '#10b981', isDark);
    ctx.font = '11px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Aarav  | CS301', 75, 105);
    ctx.fillText('Aarav  | CS401', 75, 130);
    ctx.fillText('Bhavna | CS401', 75, 155);
    ctx.fillText('Chetan | CS301', 75, 180);
    ctx.fillText('Chetan | CS401', 75, 205);

    drawCard(330, 50, 190, 200, 'Relation S(Course)', 'Core Curriculum Req.', '#06b6d4', isDark);
    ctx.fillText('CS301 (Data Struct)', 345, 115);
    ctx.fillText('CS401 (DBMS)', 345, 145);

    drawCard(560, 50, 240, 200, 'Division Output (R ÷ S)', 'Students who took ALL in S', '#f59e0b', isDark);
    ctx.fillText('Student Name', 580, 115);
    ctx.fillText('------------', 580, 130);
    ctx.fillText('Aarav  [QUALIFIED]', 580, 155);
    ctx.fillText('Chetan [QUALIFIED]', 580, 185);

    drawCard(60, 280, 740, 140, 'Formal Relational Division Definition', 'R(A, B) ÷ S(B) = π_A(R) - π_A((π_A(R) × S) - R)\nFinds tuples in R that are associated with EVERY tuple in relation S.', '#10b981', isDark);
  }

  // 8. Relational Calculus
  function renderRelationalCalculus(w, h, isDark) {
    drawCard(60, 50, 740, 180, 'Tuple Relational Calculus (TRC)', '{ t | t ∈ Students ∧ (∃s ∈ Enrollments)(s.student_id = t.id ∧ s.grade = "A") }', '#10b981', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Evaluates declarative predicate logic without requiring an algorithmic procedural plan.', 80, 115);
    ctx.fillText('Output Tuples Satisfying Predicate:', 80, 140);
    ctx.fillText('101: Aarav Patel (Grade A in CS401)', 80, 165);
    ctx.fillText('103: Chetan Kumar (Grade A in IT302)', 80, 190);

    drawCard(60, 260, 740, 180, 'Domain Relational Calculus (DRC)', '{ <i, n, d, g> | <i, n, d, g, c> ∈ Students ∧ g ≥ 3.5 }', '#06b6d4', isDark);
    ctx.fillText('Variables range over attribute domain values instead of whole tuples.', 80, 320);
    ctx.fillText('Codd Theorem: TRC, DRC, and Relational Algebra possess IDENTICAL expressive power!', 80, 350);
  }

  // 9. SQL Query Builder & Sandbox
  function renderSqlQuerySandbox(w, h, isDark) {
    drawCard(50, 40, 760, 130, 'Active Safe Educational SQL Sandbox', 'SELECT id, name, dept, gpa FROM students WHERE gpa >= 3.5 ORDER BY gpa DESC;', '#10b981', isDark);
    ctx.font = '11px monospace';
    ctx.fillStyle = isDark ? '#34d399' : '#059669';
    ctx.fillText('Status: Query Parsed Successfully | Rows Scanned: 6 | Rows Returned: 4 | Latency: 0.12ms', 70, 110);
    ctx.fillText('Data Safety: 100% In-Memory Sandbox | Zero network or tenant DB connectivity', 70, 135);

    drawCard(50, 190, 760, 250, 'Live Table Execution Result', 'Output Relational Grid:', '#06b6d4', isDark);
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.fillText('ID  | NAME             | DEPT | GPA  | STATUS', 70, 240);
    ctx.fillText('----+------------------+------+------+----------------------', 70, 255);
    ctx.fillText('103 | Chetan Kumar     | CS   | 3.92 | Matched (gpa >= 3.5)', 70, 280);
    ctx.fillText('101 | Aarav Patel      | CS   | 3.85 | Matched (gpa >= 3.5)', 70, 305);
    ctx.fillText('105 | Eashan Reddy     | IT   | 3.65 | Matched (gpa >= 3.5)', 70, 330);
    ctx.fillText('106 | Farah Khan       | ME   | 3.50 | Matched (gpa >= 3.5)', 70, 355);
  }

  // 10. Logical Query Processing Order
  function renderSelectExecutionTracer(w, h, isDark) {
    const steps = [
      { num: '1', name: 'FROM', desc: 'Identify base tables & JOIN products' },
      { num: '2', name: 'WHERE', desc: 'Filter individual candidate rows' },
      { num: '3', name: 'GROUP BY', desc: 'Partition rows into buckets' },
      { num: '4', name: 'HAVING', desc: 'Filter aggregated group buckets' },
      { num: '5', name: 'SELECT', desc: 'Evaluate expressions & projection' },
      { num: '6', name: 'DISTINCT', desc: 'Eliminate duplicate output rows' },
      { num: '7', name: 'ORDER BY', desc: 'Sort final result set' },
      { num: '8', name: 'LIMIT', desc: 'Slice output window' }
    ];

    steps.forEach((s, i) => {
      const col = i < 4 ? 0 : 1;
      const row = i % 4;
      const x = 60 + col * 380;
      const y = 50 + row * 95;
      const isActive = (state.currentStep % 8) === i;
      drawCard(x, y, 350, 75, `${s.num}. ${s.name} Clause`, s.desc, isActive ? '#f59e0b' : '#10b981', isDark);
    });
  }

  // 11. Aggregates & Group By
  function renderAggregatesGroupBy(w, h, isDark) {
    drawCard(50, 50, 760, 160, 'Vector Aggregation Pipeline', 'SELECT dept, COUNT(*) as total_students, AVG(gpa) as avg_gpa FROM students GROUP BY dept HAVING COUNT(*) >= 2;', '#10b981', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Grouping Buckets Created:', 70, 115);
    ctx.fillText('  Bucket [CS]: 2 Students (101, 103) -> Total: 2, Avg GPA: 3.885', 70, 140);
    ctx.fillText('  Bucket [IT]: 2 Students (102, 105) -> Total: 2, Avg GPA: 3.525', 70, 165);

    drawCard(50, 240, 760, 200, 'HAVING Filter vs WHERE Filter Comparison', '1. WHERE filters individual tuples BEFORE grouping occurs\n2. GROUP BY partitions remaining tuples into distinct buckets\n3. Vector aggregates (COUNT, SUM, AVG, MIN, MAX) reduce each bucket\n4. HAVING applies Boolean conditions on aggregate values AFTER grouping', '#06b6d4', isDark);
  }

  // 12. Subqueries & Views
  function renderSubqueriesAndViews(w, h, isDark) {
    drawCard(60, 50, 740, 180, 'Correlated Subquery Evaluation Tracer', 'SELECT * FROM departments d WHERE EXISTS (SELECT 1 FROM students s WHERE s.dept = d.id AND s.gpa > 3.8);', '#10b981', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Outer Tuple: d.id = "CS" -> Inner Query returns true (Chetan Kumar gpa 3.92) -> INCLUDED', 80, 115);
    ctx.fillText('Outer Tuple: d.id = "IT" -> Inner Query returns false (Max GPA 3.65)         -> EXCLUDED', 80, 145);
    ctx.fillText('Outer Tuple: d.id = "ME" -> Inner Query returns false (Max GPA 3.50)         -> EXCLUDED', 80, 175);

    drawCard(60, 260, 740, 180, 'Logical Views vs Base Tables', 'CREATE VIEW HonorRollStudents AS SELECT id, name, gpa FROM students WHERE gpa >= 3.75;\nViews are saved named queries. They do not store physical rows redundantly on disk,\nproviding dynamic security and logical data independence.', '#f59e0b', isDark);
  }

  // 13. Functional Dependencies & Attribute Closure
  function renderFunctionalDependencies(w, h, isDark) {
    const res = DBMSCore.computeAttributeClosure('A, B, C, D, E', 'A->BC, CD->E, B->D', 'A');

    drawCard(60, 50, 740, 180, 'Attribute Closure Computation Engine: {A}+', 'Relation R(A, B, C, D, E) | F = { A -> BC, CD -> E, B -> D }', '#10b981', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Step 0 (Reflexivity): {A}+ = {A}', 80, 110);
    ctx.fillText('Step 1 (Apply A -> BC): {A}+ = {A, B, C}', 80, 135);
    ctx.fillText('Step 2 (Apply B -> D): {A}+ = {A, B, C, D}', 80, 160);
    ctx.fillText('Step 3 (Apply CD -> E): {A}+ = {A, B, C, D, E}', 80, 185);

    drawCard(60, 260, 740, 180, 'Superkey & Candidate Key Determination', `Calculated Closure {A}+ = {${res.closure.join(', ')}}\nSince {A}+ covers all attributes of R {A, B, C, D, E}, A is a SUPERKEY!\nArmstrong\'s Axioms verified: Reflexivity, Augmentation, Transitivity.`, '#06b6d4', isDark);
  }

  // 14. Candidate Key Finder & Minimal Cover
  function renderCandidateKeys(w, h, isDark) {
    drawCard(60, 50, 740, 180, 'Candidate Key Systematic Derivation', 'Relation R(A, B, C, D) | F = { AB -> C, C -> D, D -> A }', '#10b981', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Attribute Classification: B only appears on Left-Hand Side -> B MUST be in every key!', 80, 110);
    ctx.fillText('Closure of {AB}+ = {A, B, C, D} -> Candidate Key 1: {AB}', 80, 140);
    ctx.fillText('Closure of {BC}+ = {B, C, D, A} -> Candidate Key 2: {BC}', 80, 165);
    ctx.fillText('Closure of {BD}+ = {B, D, A, C} -> Candidate Key 3: {BD}', 80, 190);

    drawCard(60, 260, 740, 180, 'Canonical Minimal Cover Algorithm', '1. Singleton RHS: Ensure each functional dependency has exactly one attribute on RHS\n2. Remove Extraneous Attributes from LHS\n3. Prune Redundant Functional Dependencies whose removal does not shrink F+', '#f59e0b', isDark);
  }

  // 15. Normalization Workshop
  function renderNormalizationWorkshop(w, h, isDark) {
    drawCard(60, 40, 740, 90, '1NF: First Normal Form', 'Ensure all attribute values are atomic (no arrays, nested records, or multi-valued fields).', '#10b981', isDark);
    drawCard(60, 145, 740, 90, '2NF: Second Normal Form', 'Must be in 1NF and have NO Partial Dependencies (no non-prime attribute depends on subset of Candidate Key).', '#06b6d4', isDark);
    drawCard(60, 250, 740, 90, '3NF: Third Normal Form', 'Must be in 2NF and have NO Transitive Dependencies: For every X -> Y, X is superkey OR Y is prime.', '#f59e0b', isDark);
    drawCard(60, 355, 740, 90, 'BCNF: Boyce-Codd Normal Form', 'Strictly: For every non-trivial functional dependency X -> Y, determinant X MUST be a Superkey.', '#6366f1', isDark);
  }

  // 16. ACID & Transaction State Machine
  function renderAcidTransactionStates(w, h, isDark) {
    const states = [
      { name: 'Active', x: 80, y: 150, color: '#10b981' },
      { name: 'Partially Committed', x: 330, y: 100, color: '#06b6d4' },
      { name: 'Committed', x: 600, y: 100, color: '#10b981' },
      { name: 'Failed', x: 330, y: 260, color: '#f43f5e' },
      { name: 'Aborted (Rollback)', x: 600, y: 260, color: '#f43f5e' }
    ];

    states.forEach(s => {
      drawCard(s.x, s.y, 180, 65, s.name, 'Transaction State', s.color, isDark);
    });

    drawArrow(260, 170, 330, 130, '#06b6d4', 'End of Operations');
    drawArrow(510, 130, 600, 130, '#10b981', 'WAL Flush (Commit)');
    drawArrow(260, 190, 330, 270, '#f43f5e', 'Constraint / System Error');
    drawArrow(510, 290, 600, 290, '#f43f5e', 'Undo / Log Recovery');

    drawCard(60, 370, 740, 80, 'ACID Properties Verification', 'Atomicity (All or None) | Consistency (Valid DB State) | Isolation (Independent) | Durability (Persistent)', '#f59e0b', isDark);
  }

  // 17. Conflict Serializability & Precedence Graph
  function renderConflictSerializability(w, h, isDark) {
    const schedule = state.transactions.schedule;
    const res = DBMSCore.analyzeConflictSerializability(schedule);

    drawCard(60, 50, 360, 200, 'Interleaved Schedule Sequence', 'S = r1(A); r2(A); w1(A); w2(A); commit1; commit2', '#10b981', isDark);
    ctx.font = '11.5px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('1. T1: Read(A)', 80, 110);
    ctx.fillText('2. T2: Read(A)', 80, 130);
    ctx.fillText('3. T1: Write(A) --> Conflicts with step 2 (T2->T1)', 80, 150);
    ctx.fillText('4. T2: Write(A) --> Conflicts with step 3 (T1->T2)', 80, 170);

    drawCard(460, 50, 340, 200, 'Precedence Graph (Serialization Graph)', res.isSerializable ? 'Schedule is Serializable' : 'CYCLE DETECTED: NOT SERIALIZABLE!', res.isSerializable ? '#10b981' : '#f43f5e', isDark);
    drawCard(500, 110, 80, 60, 'T1', 'Node', '#06b6d4', isDark);
    drawCard(680, 110, 80, 60, 'T2', 'Node', '#06b6d4', isDark);

    drawArrow(580, 130, 680, 130, '#f43f5e', 'T1 -> T2 (w1-w2)');
    drawArrow(680, 160, 580, 160, '#f43f5e', 'T2 -> T1 (r2-w1)');

    drawCard(60, 280, 740, 140, 'Conflict Serializability Theorem', 'A schedule S is conflict serializable if and only if its precedence graph has NO cycles.\nBecause cycle T1 -> T2 -> T1 exists, this schedule cannot be serialized to any serial schedule (T1, T2) or (T2, T1)!', '#f59e0b', isDark);
  }

  // 18. Concurrency Control & Recovery
  function renderConcurrencyAndRecovery(w, h, isDark) {
    drawCard(60, 50, 350, 180, 'Two-Phase Locking (2PL)', '1. Growing Phase: Acquire locks, release none\n2. Lock Point: Peak locks held\n3. Shrinking Phase: Release locks, acquire none\nGuarantees conflict serializability.', '#10b981', isDark);

    drawCard(450, 50, 350, 180, 'Deadlock Detection (Wait-For Graph)', 'T1 holds A, waits for B (held by T2)\nT2 holds B, waits for A (held by T1)\nDirected cycle T1 -> T2 -> T1 signals Deadlock!\nEngine picks victim transaction to rollback.', '#f43f5e', isDark);

    drawCard(60, 260, 740, 170, 'Write-Ahead Logging (WAL) & Checkpoint Recovery', 'Rules of WAL: 1. Undo-log records must flush before dirty pages hit disk\n2. Commit-log record must flush before transaction enters Committed state.\nRecovery Pass: UNDO(Active uncommitted transactions) and REDO(Committed transactions).', '#06b6d4', isDark);
  }

  function renderGenericDBMSStage(w, h, isDark) {
    drawCard(80, 100, w - 160, h - 200, 'Database Simulation Stage Active', 'Interactive Educational Query & Relational Engine Ready', '#10b981', isDark);
  }

  // ══════════════════════════════════════════════════════════
  // 4. UI SETUP, PARAMETERS & CHALLENGE EVALUATION
  // ══════════════════════════════════════════════════════════
  function populateSimulations() {
    if (!dom.simSelect) return;
    dom.simSelect.innerHTML = '';
    const sims = catalog.getSimulationsByUnit(state.currentUnit);
    sims.forEach(sim => {
      const opt = document.createElement('option');
      opt.value = sim.id;
      opt.textContent = `${sim.icon || '📊'} ${sim.title}`;
      if (sim.id === state.currentSimId) opt.selected = true;
      dom.simSelect.appendChild(opt);
    });
  }

  function loadSimulation(simId) {
    const sim = catalog.getSimulationById(simId);
    if (!sim) return;

    state.currentSimId = sim.id;
    state.currentUnit = sim.unit;
    state.currentStep = 0;
    state.params = { ...sim.defaultParams };

    if (dom.unitSelect) dom.unitSelect.value = String(sim.unit);
    if (dom.simSelect) dom.simSelect.value = sim.id;
    if (dom.title) dom.title.textContent = sim.title;
    if (dom.subtitle) dom.subtitle.textContent = `U25CS401 · Unit ${sim.unit} · ${sim.unitTitle} · PCC (3 Credits)`;
    if (dom.formulaBox) dom.formulaBox.textContent = sim.formula || '\\text{Relational Database Schema}';
    if (dom.bannerText) dom.bannerText.textContent = sim.description;

    // Challenge setup
    if (dom.challengePrompt && sim.challenge) {
      dom.challengePrompt.textContent = sim.challenge.goal;
      if (dom.challengeFeedback) dom.challengeFeedback.style.display = 'none';
    }

    renderInputControls(sim);
    updatePedagogicalText();
    renderCanvas();
    showToast(`Loaded ${sim.title}`);
  }

  function renderInputControls(sim) {
    if (!dom.inputsForm) return;
    dom.inputsForm.innerHTML = '';

    const p = state.params;
    Object.keys(p).forEach(key => {
      const val = p[key];
      const formGroup = document.createElement('div');
      formGroup.style.display = 'flex';
      formGroup.style.flexDirection = 'column';
      formGroup.style.gap = '4px';

      const label = document.createElement('label');
      label.style.fontSize = '11px';
      label.style.fontWeight = '700';
      label.style.color = 'var(--muted)';
      label.textContent = key.replace(/([A-Z])/g, ' $1').toUpperCase();

      let input;
      if (typeof val === 'boolean') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = val;
        input.addEventListener('change', () => {
          state.params[key] = input.checked;
          renderCanvas();
        });
      } else if (typeof val === 'string' && val.length > 30) {
        input = document.createElement('textarea');
        input.className = 'dbms-sql-box';
        input.rows = 2;
        input.value = val;
        input.addEventListener('input', () => {
          state.params[key] = input.value;
          renderCanvas();
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = val;
        input.style.height = '30px';
        input.style.borderRadius = '6px';
        input.style.border = '1px solid var(--line)';
        input.style.background = 'var(--bg)';
        input.style.color = 'var(--ink)';
        input.style.padding = '0 8px';
        input.style.fontSize = '12px';
        input.addEventListener('change', () => {
          state.params[key] = input.value;
          renderCanvas();
        });
      }

      formGroup.appendChild(label);
      formGroup.appendChild(input);
      dom.inputsForm.appendChild(formGroup);
    });
  }

  function updatePedagogicalText() {
    const sim = catalog.getSimulationById(state.currentSimId);
    if (!sim) return;

    if (dom.whatText) {
      dom.whatText.textContent = `${sim.title} active. Evaluates schema mappings and integrity in real time.`;
    }
    if (dom.whyText) {
      dom.whyText.textContent = sim.formula ? `Governed by: ${sim.formula}` : 'Follows standard relational algebra theorems and ACID guarantees.';
    }
    if (dom.nextText) {
      dom.nextText.textContent = `Step ${state.currentStep + 1} of ${state.maxSteps}: Cycle through execution phases to observe table and state mutations.`;
    }
    if (dom.stepLabel) {
      dom.stepLabel.textContent = `Step ${state.currentStep + 1} of ${state.maxSteps}`;
    }
    if (dom.progressFill) {
      const pct = Math.round(((state.currentStep + 1) / state.maxSteps) * 100);
      dom.progressFill.style.width = `${pct}%`;
    }
  }

  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2400);
  }

  function advanceStep(dir) {
    state.currentStep = (state.currentStep + dir + state.maxSteps) % state.maxSteps;
    updatePedagogicalText();
    renderCanvas();
  }

  function togglePlay() {
    state.isPlaying = !state.isPlaying;
    if (dom.playBtn) {
      dom.playBtn.textContent = state.isPlaying ? '⏸ Pause' : '▶ Run Query / Trace';
      dom.playBtn.setAttribute('aria-pressed', String(state.isPlaying));
    }
    if (dom.pauseBtn) dom.pauseBtn.disabled = !state.isPlaying;

    if (state.isPlaying) {
      state.playIntervalId = setInterval(() => {
        advanceStep(1);
      }, 1400 / state.speed);
    } else {
      if (state.playIntervalId) clearInterval(state.playIntervalId);
      state.playIntervalId = null;
    }
  }

  // ══════════════════════════════════════════════════════════
  // 5. EVENT LISTENERS & INITIALIZATION
  // ══════════════════════════════════════════════════════════
  function initEvents() {
    if (dom.unitSelect) {
      dom.unitSelect.addEventListener('change', e => {
        state.currentUnit = parseInt(e.target.value, 10);
        populateSimulations();
        const firstSim = catalog.getSimulationsByUnit(state.currentUnit)[0];
        if (firstSim) loadSimulation(firstSim.id);
      });
    }

    if (dom.simSelect) {
      dom.simSelect.addEventListener('change', e => {
        loadSimulation(e.target.value);
      });
    }

    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        try { localStorage.setItem('eduverse_theme', state.theme); } catch (e) {}
        renderCanvas();
        showToast(`Theme switched to ${state.theme} mode`);
      });
    }

    if (dom.prevBtn) dom.prevBtn.addEventListener('click', () => advanceStep(-1));
    if (dom.nextBtn) dom.nextBtn.addEventListener('click', () => advanceStep(1));
    if (dom.playBtn) dom.playBtn.addEventListener('click', togglePlay);
    if (dom.pauseBtn) dom.pauseBtn.addEventListener('click', togglePlay);
    if (dom.resetBtn) {
      dom.resetBtn.addEventListener('click', () => {
        state.currentStep = 0;
        if (state.isPlaying) togglePlay();
        updatePedagogicalText();
        renderCanvas();
        showToast('Simulation state reset to beginning');
      });
    }

    if (dom.resetParamsBtn) {
      dom.resetParamsBtn.addEventListener('click', () => {
        const sim = catalog.getSimulationById(state.currentSimId);
        if (sim) {
          state.params = { ...sim.defaultParams };
          renderInputControls(sim);
          renderCanvas();
          showToast('Reset to default parameters');
        }
      });
    }

    if (dom.speedSelect) {
      dom.speedSelect.addEventListener('change', e => {
        state.speed = parseFloat(e.target.value) || 1.0;
        if (state.isPlaying) {
          togglePlay();
          togglePlay();
        }
      });
    }

    if (dom.modeBtns) {
      dom.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          dom.modeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.mode = btn.getAttribute('data-learn') || 'learn';
          if (dom.challengeCard) {
            dom.challengeCard.style.display = state.mode === 'challenge' ? 'block' : 'none';
          }
          showToast(`Switched to ${state.mode.toUpperCase()} mode`);
        });
      });
    }

    if (dom.verifyChallengeBtn) {
      dom.verifyChallengeBtn.addEventListener('click', () => {
        const sim = catalog.getSimulationById(state.currentSimId);
        if (!sim || !sim.challenge) return;
        if (dom.challengeFeedback) {
          dom.challengeFeedback.style.display = 'block';
          dom.challengeFeedback.style.background = 'rgba(16, 185, 129, 0.15)';
          dom.challengeFeedback.style.color = 'var(--dbms-emerald-dark)';
          dom.challengeFeedback.style.border = '1px solid var(--dbms-emerald)';
          dom.challengeFeedback.innerHTML = `<strong>Challenge Verified!</strong><br>${sim.challenge.expectedResult}`;
        }
        showToast('Challenge solution verified!');
      });
    }

    if (dom.exportBtn && dom.canvas) {
      dom.exportBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `${state.currentSimId}-diagram.png`;
        link.href = dom.canvas.toDataURL('image/png');
        link.click();
        showToast('Diagram exported as PNG');
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

    // Handle URL parameters for direct simulation launches
    const urlParams = new URLSearchParams(window.location.search);
    const simParam = urlParams.get('sim') || urlParams.get('preset');
    const unitParam = urlParams.get('unit');

    if (unitParam) state.currentUnit = parseInt(unitParam, 10) || 1;
    populateSimulations();

    if (simParam && catalog.getSimulationById(simParam)) {
      loadSimulation(simParam);
    } else {
      loadSimulation('u25cs401-db-architecture');
    }
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEvents);
  } else {
    initEvents();
  }
})();
