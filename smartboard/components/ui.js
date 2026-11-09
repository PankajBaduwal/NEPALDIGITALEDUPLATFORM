'use strict';
// ═══════════════════════════════════════════════
// UI — builds all dynamic HTML, manages panels
// ═══════════════════════════════════════════════
const UI = (() => {

  let panelOpen = false;

  const BOARD_COLORS = [
    { id:'white', bg:'#f4f6f8', line:'rgba(15,23,42,0.055)', major:'rgba(15,23,42,0.12)', label:'Soft Whiteboard' },
    { id:'black', bg:'#0b0d13', line:'rgba(255,255,255,0.07)',  major:'rgba(255,255,255,0.14)', label:'Blackboard' },
    { id:'navy',  bg:'#0a1224', line:'rgba(148,163,184,0.08)', major:'rgba(148,163,184,0.16)', label:'Cosmic Navy' },
    { id:'green', bg:'#0e2419', line:'rgba(255,255,255,0.075)', major:'rgba(255,255,255,0.15)', label:'Chalkboard Green' },
  ];

  // ─────────────────────────────────────────────
  // DYNAMIC SUBJECT CONTEXT & SYLLABUS REGISTRY
  // ─────────────────────────────────────────────
  function getActiveSubjectSession() {
    if (window.CurrentSubjectContext && window.CurrentSubjectContext.subjectName) {
      return window.CurrentSubjectContext;
    }
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const subName = urlParams.get('subjectName');
      if (subName) {
        return {
          subjectName: subName,
          subjectCode: urlParams.get('subjectCode') || '',
          departmentName: urlParams.get('departmentName') || '',
          semesterNumber: urlParams.get('semesterNumber') || 1,
          teacherName: urlParams.get('teacherName') || (function () { try { var u = JSON.parse(localStorage.getItem('nepal_edu_user') || 'null'); return u && u.fullName; } catch (e) { return ''; } })() || 'Teacher',
          subjectId: urlParams.get('subjectId') || ''
        };
      }
      const raw = sessionStorage.getItem('active_smartboard_session') || localStorage.getItem('active_smartboard_session');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { subjectName: 'Calculus and Differential Equations', departmentName: 'Mathematics Department', semesterNumber: 1 };
  }

  function resolveDomain(sName, dName) {
    const s = ((sName || '') + ' ' + (dName || '')).toLowerCase();
    if (s.includes('calculus') || s.includes('differential') || s.includes('math') || s.includes('algebra')) return 'MATHEMATICS';
    if (s.includes('structure') || s.includes('algorithm') || s.includes('dsa') || s.includes('computer') || s.includes('it')) return 'DSA';
    if (s.includes('mechanic') || s.includes('civil') || s.includes('truss') || s.includes('structural')) return 'CIVIL';
    if (s.includes('physics') || s.includes('optics') || s.includes('wave') || s.includes('quantum')) return 'PHYSICS';
    return 'GENERAL';
  }

  function getDynamicSubjectSyllabus(subjectName, domain) {
    const sName = (subjectName || '').toLowerCase();
    
    // 1. Calculus and Differential Equations
    if (sName.includes('calculus') || sName.includes('differential') || domain === 'MATHEMATICS' || sName.includes('math')) {
      return [
        {
          id: 1,
          name: 'Differential Calculus & Mean Value Theorems',
          desc: 'Limits, Continuity, Derivatives, Rolle\'s Theorem, Cauchy MVT, Taylor & Maclaurin Series',
          topics: ['Limits & Indeterminate Forms', 'Derivatives & Chain Rule', 'Rolle\'s & Cauchy Mean Value Theorem', 'Taylor & Maclaurin Polynomials', 'Maxima, Minima & Tangent Slopes'],
          icon: '∫'
        },
        {
          id: 2,
          name: 'Functions of Several Variables & Partial Differentiation',
          desc: 'Partial derivatives, Euler\'s Theorem, Total Differential, Jacobians, Extrema & Saddle Points',
          topics: ['First & Second Order Partial Derivatives', 'Euler\'s Homogeneous Theorem', 'Total Differential & Chain Rule', 'Jacobian Coordinate Transformation', 'Lagrange Multipliers & Extrema'],
          icon: '∂'
        },
        {
          id: 3,
          name: 'Integral Calculus & Multiple Integrals',
          desc: 'Double & Triple Integrals, Change of Order, Polar/Cylindrical/Spherical Coordinates, Surface Area',
          topics: ['Double Integrals over General Regions', 'Change of Variable & Order of Integration', 'Triple Integrals & Volume', 'Vector Fields: Gradient, Divergence, Curl', 'Green\'s, Gauss & Stokes\' Theorems'],
          icon: '∬'
        },
        {
          id: 4,
          name: 'Ordinary Differential Equations (ODEs)',
          desc: 'First Order Linear ODEs, Exact Equations, Integrating Factors, Higher Order Linear ODEs',
          topics: ['First-Order Linear & Separable ODEs', 'Exact Equations & Integrating Factors', 'Second-Order Homogeneous Linear ODEs', 'Method of Variation of Parameters', 'Cauchy-Euler Equations'],
          icon: 'd/dx'
        },
        {
          id: 5,
          name: 'Laplace Transforms & Fourier Series',
          desc: 'Laplace of Derivatives, Inverse Laplace, Convolution Theorem, Periodic Functions, Fourier Series',
          topics: ['Laplace Transform Definition & Linearity', 'Transforms of Derivatives & Integrals', 'Inverse Laplace & Convolution Theorem', 'Periodic Waveforms & Dirac Delta', 'Fourier Trigonometric Series Decomposition'],
          icon: 'ℒ'
        }
      ];
    }

    // 2. Data Structures & Algorithms
    if (sName.includes('structure') || sName.includes('algorithm') || domain === 'DSA' || sName.includes('it') || sName.includes('computer')) {
      return [
        {
          id: 1,
          name: 'Linear Data Structures & Asymptotics',
          desc: 'Arrays, Singly/Doubly Linked Lists, Stacks, Queues, Big-O, Big-Omega, Big-Theta bounds',
          topics: ['Dynamic Array Allocation & Traversal', 'Singly & Doubly Linked List Pointers', 'Stack State Machine & Call Stacks', 'Circular & Priority Queues', 'Asymptotic Complexity Analysis'],
          icon: '[]'
        },
        {
          id: 2,
          name: 'Trees & Hierarchical Structures',
          desc: 'Binary Trees, Binary Search Trees (BST), AVL Balance Rotations, B-Trees, Binary Heaps',
          topics: ['Binary Tree Properties & Traversals', 'BST Search, Insertion & Deletion', 'AVL Tree Rotations (LL, RR, LR, RL)', 'Min/Max Binary Heap Priority Queue', 'B-Tree Indexing Principles'],
          icon: '🌲'
        },
        {
          id: 3,
          name: 'Graph Algorithms & Traversals',
          desc: 'Adjacency Matrix/List, BFS, DFS, Dijkstra Shortest Path, Minimum Spanning Trees',
          topics: ['Graph Representations & Density', 'Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Dijkstra\'s Single Source Shortest Path', 'Kruskal\'s & Prim\'s Minimum Spanning Tree'],
          icon: '☍'
        },
        {
          id: 4,
          name: 'Sorting, Searching & Hash Tables',
          desc: 'Quick Sort, Merge Sort, Heap Sort, Hash Tables, Hash Functions, Collision Resolution',
          topics: ['Divide-and-Conquer: Merge Sort', 'Partitioning: Quick Sort Average O(n log n)', 'Hash Function Design & Load Factors', 'Separate Chaining & Open Addressing', 'Binary Search & Interpolation Search'],
          icon: '⇄'
        },
        {
          id: 5,
          name: 'Advanced Algorithm Design Paradigms',
          desc: 'Dynamic Programming, Greedy Strategies, Backtracking, Divide & Conquer, NP-Completeness',
          topics: ['Greedy Choice Property: Activity Selection', 'DP: 0/1 Knapsack & Memoization', 'DP: Longest Common Subsequence', 'Backtracking: N-Queens Problem', 'P vs NP & Tractability Concepts'],
          icon: '⚡'
        }
      ];
    }

    // 3. Engineering Mechanics / Civil
    if (sName.includes('mechanic') || sName.includes('civil') || domain === 'CIVIL' || sName.includes('structural')) {
      return [
        {
          id: 1,
          name: 'Statics & Equilibrium of Particles & Rigid Bodies',
          desc: 'Resolution of Forces, Lami\'s Theorem, Free Body Diagrams, Moment of Forces, Equilibrium',
          topics: ['Concurrent & Non-Concurrent Force Systems', 'Free Body Diagrams & Equations of Equilibrium', 'Lami\'s Theorem & 2D Particle Statics', 'Varignon\'s Theorem of Moments', 'Couples & Equivalent Force Systems'],
          icon: '⚖️'
        },
        {
          id: 2,
          name: 'Trusses & Structural Analysis',
          desc: 'Plane Trusses, Method of Joints, Method of Sections, Zero Force Members',
          topics: ['Perfect, Deficient & Redundant Frames', 'Method of Joints for Plane Trusses', 'Method of Sections for Internal Forces', 'Zero-Force Member Identification', 'Space Truss Fundamentals'],
          icon: '🏗️'
        },
        {
          id: 3,
          name: 'Friction, Centroid & Moment of Inertia',
          desc: 'Coulomb\'s Dry Friction, Angle of Repose, Centroids of Composite Areas, Moment of Inertia',
          topics: ['Static & Kinetic Friction Laws', 'Angle of Friction & Cone of Friction', 'Centroid of Composite Laminas', 'Parallel & Perpendicular Axis Theorems', 'Polar Moment of Inertia & Radius of Gyration'],
          icon: '📐'
        },
        {
          id: 4,
          name: 'Dynamics & Kinetics of Particles',
          desc: 'Kinematics of Particles, Newton\'s Second Law, Work-Energy Principle, Impulse-Momentum',
          topics: ['Rectilinear & Curvilinear Motion', 'Newton\'s Second Law in Cartesian & Normal-Tangential', 'Work-Energy Principle & Conservation of Energy', 'Linear Impulse and Momentum', 'Direct & Oblique Impact of Elastic Bodies'],
          icon: '⏱️'
        },
        {
          id: 5,
          name: 'Beam Analysis, Hooke\'s Law & Stress-Strain',
          desc: 'Shear Force & Bending Moment Diagrams, Direct Stress & Strain, Hooke\'s Law, Modulus of Elasticity',
          topics: ['Types of Beams, Supports & Loads', 'Shear Force & Bending Moment Diagrams (SFD/BMD)', 'Direct Stress, Strain & Hooke\'s Law', 'Young\'s Modulus, Bulk Modulus & Poisson\'s Ratio', 'Pure Bending Equation (M/I = σ/y = E/R)'],
          icon: '🧱'
        }
      ];
    }

    // 4. Engineering Physics
    if (sName.includes('physics') || domain === 'PHYSICS' || sName.includes('wave') || sName.includes('optics')) {
      return [
        {
          id: 1,
          name: 'Wave Optics & Interference Phenomena',
          desc: 'Coherent Sources, Young\'s Double Slit, Thin Film Interference, Diffraction Gratings',
          topics: ['Huygens\' Principle & Wavefronts', 'Interference in Thin Films & Air Wedge', 'Newton\'s Rings Experiment & Wavelength', 'Fraunhofer Diffraction through Single/Double Slit', 'Plane Diffraction Grating & Resolving Power'],
          icon: '〰️'
        },
        {
          id: 2,
          name: 'Quantum Physics & Matter Waves',
          desc: 'De Broglie Hypothesis, Heisenberg Uncertainty Principle, Schrödinger Wave Equation',
          topics: ['Blackbody Radiation & Planck\'s Hypothesis', 'De Broglie Wavelength & Dual Nature', 'Heisenberg Uncertainty Principle', 'Time-Independent 1D Schrödinger Equation', 'Particle in an Infinite Potential Box'],
          icon: '⚛️'
        },
        {
          id: 3,
          name: 'Lasers, Photonics & Fiber Optics',
          desc: 'Stimulated Emission, Population Inversion, He-Ne Laser, Nd:YAG, Optical Fiber Modes',
          topics: ['Spontaneous vs Stimulated Emission', 'Einstein\'s A and B Coefficients', 'He-Ne & Semiconductor Injection Lasers', 'Total Internal Reflection in Optical Fibers', 'Numerical Aperture, Acceptance Angle & Attenuation'],
          icon: '🔦'
        },
        {
          id: 4,
          name: 'Electromagnetism & Dielectric Materials',
          desc: 'Maxwell\'s Electromagnetic Equations, Displacement Current, Poynting Vector, Polarization',
          topics: ['Gauss, Faraday & Ampere-Maxwell Laws', 'Displacement Current & Continuity Equation', 'Poynting Vector & Electromagnetic Energy Density', 'Dielectric Polarization Mechanisms', 'Clausius-Mossotti Equation & Breakdown'],
          icon: '⚡'
        },
        {
          id: 5,
          name: 'Thermal Physics & Thermodynamics',
          desc: 'Zeroth, First & Second Laws, Carnot Refrigerator, Entropy Changes, Low-Temperature Physics',
          topics: ['Thermodynamic Systems & First Law', 'Carnot Cycle & Thermal Efficiency', 'Entropy as a State Function (dS = dQ/T)', 'Third Law & Absolute Zero Concepts', 'Heat Conduction & Wiedemann-Franz Law'],
          icon: '🌡️'
        }
      ];
    }

    // Default Fallback: Subject-Centric Modular Units
    return [
      { id: 1, name: `Unit 1: Fundamentals of ${subjectName}`, desc: `Core foundational concepts, definitions and principles of ${subjectName}`, topics: ['Introduction & Overview', 'Basic Concepts & Terminology', 'Governing Laws & Principles', 'Standard Formulations'], icon: '📖' },
      { id: 2, name: `Unit 2: Analytical Methods & Models`, desc: `Formulation of governing equations and analytical problem-solving in ${subjectName}`, topics: ['Analytical Frameworks', 'Mathematical Modeling', 'Key Formulas & Theorems', 'Representative Case Studies'], icon: '📊' },
      { id: 3, name: `Unit 3: Applied Systems & Engineering Design`, desc: `Design standards, practical implementation and simulations for ${subjectName}`, topics: ['Component Design', 'System Integration', 'Interactive Simulations', 'Optimization Criteria'], icon: '⚙️' },
      { id: 4, name: `Unit 4: Advanced Principles & Computational Analysis`, desc: `Advanced theoretical formulations, computational solutions and analysis`, topics: ['Higher-Order Formulations', 'Computational Techniques', 'Error Analysis & Convergence', 'Comparative Benchmarks'], icon: '💻' },
      { id: 5, name: `Unit 5: Applications, Industry Practice & Research Trends`, desc: `Real-world industrial case studies, standards, laboratory practice and trends`, topics: ['Industry Standards & Codes', 'Laboratory Testing & Validation', 'Failure Modes & Safety Factors', 'Emerging Innovations'], icon: '🚀' }
    ];
  }

  function getSubjectPresentations(subjectName, subjectId) {
    const sKey = 'subject_ppts_' + (subjectId || subjectName || 'default');
    let stored = [];
    try {
      const raw = localStorage.getItem(sKey);
      if (raw) stored = JSON.parse(raw);
    } catch (e) {}

    if (stored && stored.length > 0) return stored;

    const sName = (subjectName || '').toLowerCase();
    // Default subject PPT decks ready to present
    if (sName.includes('calculus') || sName.includes('differential') || sName.includes('math')) {
      return [
        { id: 'ppt_calc_1', title: 'Lecture 01: Differential Calculus, Limits & Mean Value Theorems.pptx', slidesCount: 16, unit: 'Unit 1', date: 'Semester 1' },
        { id: 'ppt_calc_2', title: 'Lecture 02: Partial Differentiation & Clairaut\'s Symmetry.pptx', slidesCount: 14, unit: 'Unit 2', date: 'Semester 1' },
        { id: 'ppt_calc_3', title: 'Lecture 03: Multiple Integrals & Jacobian Coordinate Transforms.pptx', slidesCount: 18, unit: 'Unit 3', date: 'Semester 1' },
        { id: 'ppt_calc_4', title: 'Lecture 04: Ordinary Differential Equations & Integrating Factors.pptx', slidesCount: 15, unit: 'Unit 4', date: 'Semester 1' },
        { id: 'ppt_calc_5', title: 'Lecture 05: Laplace Transforms & Fourier Series Applications.pptx', slidesCount: 20, unit: 'Unit 5', date: 'Semester 1' }
      ];
    } else if (sName.includes('structure') || sName.includes('algorithm') || sName.includes('it')) {
      return [
        { id: 'ppt_dsa_1', title: 'Lecture 01: Linear Data Structures, Stacks & Queues.pptx', slidesCount: 15, unit: 'Unit 1', date: 'Semester 3' },
        { id: 'ppt_dsa_2', title: 'Lecture 02: Trees, Binary Search Trees & AVL Rotations.pptx', slidesCount: 18, unit: 'Unit 2', date: 'Semester 3' },
        { id: 'ppt_dsa_3', title: 'Lecture 03: Graph Algorithms, BFS, DFS & Dijkstra.pptx', slidesCount: 22, unit: 'Unit 3', date: 'Semester 3' },
        { id: 'ppt_dsa_4', title: 'Lecture 04: Sorting Races, Heap Sort & Hash Tables.pptx', slidesCount: 17, unit: 'Unit 4', date: 'Semester 3' },
        { id: 'ppt_dsa_5', title: 'Lecture 05: Dynamic Programming & Greedy Strategies.pptx', slidesCount: 19, unit: 'Unit 5', date: 'Semester 3' }
      ];
    } else if (sName.includes('mechanic') || sName.includes('civil')) {
      return [
        { id: 'ppt_civ_1', title: 'Lecture 01: Statics & Equilibrium of Rigid Bodies.pptx', slidesCount: 14, unit: 'Unit 1', date: 'Semester 2' },
        { id: 'ppt_civ_2', title: 'Lecture 02: Truss Equilibrium & Method of Sections.pptx', slidesCount: 16, unit: 'Unit 2', date: 'Semester 2' },
        { id: 'ppt_civ_3', title: 'Lecture 03: Friction, Centroids & Moment of Inertia.pptx', slidesCount: 15, unit: 'Unit 3', date: 'Semester 2' },
        { id: 'ppt_civ_4', title: 'Lecture 04: Dynamics & Linear Impulse-Momentum.pptx', slidesCount: 17, unit: 'Unit 4', date: 'Semester 2' },
        { id: 'ppt_civ_5', title: 'Lecture 05: Beam Deflections & Hooke\'s Law Analysis.pptx', slidesCount: 20, unit: 'Unit 5', date: 'Semester 2' }
      ];
    } else {
      return [
        { id: 'ppt_gen_1', title: `Lecture 01: Introduction & Foundations of ${subjectName}.pptx`, slidesCount: 12, unit: 'Unit 1', date: 'Current Term' },
        { id: 'ppt_gen_2', title: `Lecture 02: Analytical Models & Key Formulations.pptx`, slidesCount: 15, unit: 'Unit 2', date: 'Current Term' },
        { id: 'ppt_gen_3', title: `Lecture 03: Practical Applications & Industry Case Studies.pptx`, slidesCount: 16, unit: 'Unit 3', date: 'Current Term' }
      ];
    }
  }

  function getCurriculumChapters() {
    const session = getActiveSubjectSession();
    if (session && Array.isArray(session.syllabusUnits) && session.syllabusUnits.length > 0) {
      return session.syllabusUnits;
    }
    const domain = resolveDomain(session.subjectName, session.departmentName);
    return getDynamicSubjectSyllabus(session.subjectName, domain);
  }

  function renderTopChapters() {
    const session = getActiveSubjectSession();
    const subName = session.subjectName || 'Calculus and Differential Equations';
    const domain = resolveDomain(subName, session.departmentName);

    // 1. Update Topbar Active Subject Icon & Name
    const iconEl = document.getElementById('top-active-subj-icon');
    const nameEl = document.getElementById('top-active-subj-name');
    let subIcon = '📐';
    if (domain === 'DSA') subIcon = '💻';
    else if (domain === 'CIVIL') subIcon = '⚖️';
    else if (domain === 'PHYSICS') subIcon = '⚡';

    if (iconEl) iconEl.textContent = subIcon;
    if (nameEl) nameEl.textContent = subName;

    // 2. Populate Dropdown with Subject Syllabus & Enrolled PPTs
    const menu = document.getElementById('subject-syllabus-menu');
    if (menu) {
      const units = getCurriculumChapters();
      const ppts = getSubjectPresentations(subName, session.subjectId);

      menu.innerHTML = `
        <div class="ssm-header">
          <div class="ssm-head-top">
            <span class="ssm-subj-badge">${subIcon} ${subName}</span>
            <span class="ssm-sem-badge">Sem ${session.semesterNumber || 1}</span>
          </div>
          <div class="ssm-head-tabs">
            <button type="button" class="ssm-tab-btn active" id="ssm-tab-syllabus" onclick="UI.switchSyllabusTab('syllabus')">
              📚 Chapter Syllabus (${units.length} Units)
            </button>
            <button type="button" class="ssm-tab-btn" id="ssm-tab-ppts" onclick="UI.switchSyllabusTab('ppts')">
              📊 Subject PPTs (${ppts.length} Decks)
            </button>
          </div>
        </div>

        <!-- 1. Chapter Syllabus Tab Body -->
        <div class="ssm-body ssm-syllabus-body" id="ssm-body-syllabus">
          <div class="ssm-units-list">
            ${units.map((u, idx) => {
              const isActive = (typeof App !== 'undefined' && (App.activeChapter === u.id || +App.activeChapter === +u.id)) || idx === 0;
              const unitNum = String(idx + 1).padStart(2, '0');
              const topicsHtml = (u.topics || []).map(t => `<span class="ssm-topic-chip">${t}</span>`).join('');
              return `
                <div class="ssm-unit-card${isActive ? ' active' : ''}" onclick="UI.selectSyllabusUnit(${u.id})">
                  <div class="ssm-unit-left">
                    <span class="ssm-unit-num">Unit ${unitNum}</span>
                    <span class="ssm-unit-icon">${u.icon || '📖'}</span>
                  </div>
                  <div class="ssm-unit-info">
                    <div class="ssm-unit-title">${u.name}</div>
                    <div class="ssm-unit-desc">${u.desc || ''}</div>
                    <div class="ssm-unit-topics">${topicsHtml}</div>
                  </div>
                  <div class="ssm-unit-action">
                    <button type="button" class="ssm-open-btn" title="Open Unit Tools & Formulas">
                      ${isActive ? 'Active ✓' : 'Select ▶'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. Subject PPT Presentations Tab Body -->
        <div class="ssm-body ssm-ppts-body hidden" id="ssm-body-ppts">
          <div class="ssm-ppts-header-action">
            <span class="ssm-ppts-count">${ppts.length} Presentations Enrolled for this Subject</span>
            <button type="button" class="ssm-enroll-ppt-btn" onclick="UI.promptEnrollPpt()" title="Enroll a new PowerPoint slide deck for this subject">
              ＋ Enroll New PPT
            </button>
          </div>
          <div class="ssm-ppts-list">
            ${ppts.map(p => {
              return `
                <div class="ssm-ppt-card">
                  <div class="ssm-ppt-icon">📊</div>
                  <div class="ssm-ppt-info">
                    <div class="ssm-ppt-title">${p.title}</div>
                    <div class="ssm-ppt-meta">
                      <span class="ssm-ppt-tag">${p.unit || 'Lecture Deck'}</span>
                      <span class="ssm-ppt-slides">${p.slidesCount || 15} Slides</span>
                      <span class="ssm-ppt-date">${p.date || 'Enrolled'}</span>
                    </div>
                  </div>
                  <div class="ssm-ppt-action">
                    <button type="button" class="ssm-present-btn" onclick="UI.presentSubjectPpt('${p.id}', '${escape(p.title)}')" title="Launch PowerPoint Slides onto Whiteboard">
                      ▶ Present on Board
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    updateTopChapterBadge();
  }

  function switchSyllabusTab(tab) {
    const tabSyl = document.getElementById('ssm-tab-syllabus');
    const tabPpt = document.getElementById('ssm-tab-ppts');
    const bodySyl = document.getElementById('ssm-body-syllabus');
    const bodyPpt = document.getElementById('ssm-body-ppts');

    if (tab === 'syllabus') {
      if (tabSyl) tabSyl.classList.add('active');
      if (tabPpt) tabPpt.classList.remove('active');
      if (bodySyl) bodySyl.classList.remove('hidden');
      if (bodyPpt) bodyPpt.classList.add('hidden');
    } else {
      if (tabSyl) tabSyl.classList.remove('active');
      if (tabPpt) tabPpt.classList.add('active');
      if (bodySyl) bodySyl.classList.add('hidden');
      if (bodyPpt) bodyPpt.classList.remove('hidden');
    }
  }

  function selectSyllabusUnit(unitId) {
    if (typeof App !== 'undefined') {
      App.activeChapter = unitId;
      App.selectChapter(unitId);
    }
    const units = getCurriculumChapters();
    const u = units.find(item => item.id === unitId || +item.id === +unitId);
    if (u && window.CurrentSubjectContext) {
      window.CurrentSubjectContext.focus = { unitNumber: u.id, unitTitle: u.name };
    }
    closeAllDropdowns();
    updateTopChapterBadge();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Selected Unit ${unitId}: ${u ? u.name : ''}`);
    }
  }

  function toggleActiveSubjectSyllabusDropdown() {
    renderTopChapters();
    toggleDropdown('dd-subj-syllabus');
  }

  function promptEnrollPpt() {
    const fileInput = document.getElementById('ppt-file-input');
    if (fileInput) {
      fileInput.onchange = function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        enrollNewPpt(file);
      };
      fileInput.click();
    }
  }

  function enrollNewPpt(file) {
    const session = getActiveSubjectSession();
    const sKey = 'subject_ppts_' + (session.subjectId || session.subjectName || 'default');
    let ppts = getSubjectPresentations(session.subjectName, session.subjectId);
    const newDeck = {
      id: 'ppt_' + Date.now(),
      title: file.name,
      slidesCount: 15,
      unit: 'Enrolled PPT',
      date: 'Just Added',
      subjectId: session.subjectId || ''
    };
    ppts.unshift(newDeck);
    try {
      localStorage.setItem(sKey, JSON.stringify(ppts));
    } catch (e) {}

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Enrolled ${file.name} to ${session.subjectName}!`);
    }

    renderTopChapters();
    presentSubjectPpt(newDeck.id, newDeck.title);
  }

  function presentSubjectPpt(pptId, titleEscaped) {
    const title = unescape(titleEscaped);
    closeAllDropdowns();
    if (typeof PptPresenter !== 'undefined' && typeof PptPresenter.loadDeck === 'function') {
      const session = getActiveSubjectSession();
      // Generate realistic slide deck for this unit/topic
      const slideTitles = [
        `${title} — Overview & Core Theorems`,
        'Fundamental Principles & Mathematical Formulations',
        'Step-by-Step Derivation & Governing Equations',
        'Representative Engineering Applications & Case Analysis',
        'Interactive Classroom Boardwork & Practice Exercises'
      ];
      const slides = slideTitles.map((st, i) => {
        const cv = document.createElement('canvas');
        cv.width = 1920; cv.height = 1080;
        const ctx = cv.getContext('2d');
        // Elegant gradient slide background
        const grd = ctx.createLinearGradient(0, 0, 1920, 1080);
        grd.addColorStop(0, '#06130b');
        grd.addColorStop(0.5, '#0b2416');
        grd.addColorStop(1, '#05110a');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 1920, 1080);

        // Border
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 1860, 1020);

        // Header tag
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`KPRIET • ${session.subjectName || 'Academic Subject'} • Slide ${i + 1} of ${slideTitles.length}`, 70, 90);

        // Slide title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(st, 70, 160);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(70, 190);
        ctx.lineTo(1850, 190);
        ctx.stroke();

        // Slide content points
        ctx.fillStyle = '#f0fdf4';
        ctx.font = '28px "Inter", sans-serif';
        ctx.fillText('• Key Definition: Mathematical formulation and physical interpretation.', 100, 270);
        ctx.fillText('• Governing Equation: Analytical formulation verified for classroom teaching.', 100, 350);
        ctx.fillText('• Smart Board Stylus Zone: Feel free to write, solve, and annotate directly over this slide.', 100, 430);
        ctx.fillText('• Engineering Relevance: Real-world industrial standard and design parameters.', 100, 510);
        ctx.fillText('• Interactive Discussion: Teacher-led proof with student participation.', 100, 590);

        // Footer
        ctx.fillStyle = '#86efac';
        ctx.font = '20px "JetBrains Mono", monospace';
        ctx.fillText(`Faculty: ${session.teacherName || 'Teacher'} | Nepal Digital Education · Smart Board`, 70, 1000);

        return {
          index: i + 1,
          name: st,
          dataUrl: cv.toDataURL('image/png')
        };
      });

      PptPresenter.loadDeck({
        fileName: title,
        slideCount: slides.length,
        slides: slides
      });

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`Presenting: ${title}`);
      }
    }
  }

  function updateTopChapterBadge() {
    const chapters = getCurriculumChapters();
    if (!chapters || !chapters.length) return;
    const ch = chapters.find(c => c.id === App.activeChapter || +c.id === +App.activeChapter) || chapters[0];
    if (!ch) return;

    const idx = chapters.findIndex(c => c.id === ch.id || +c.id === +ch.id);
    const tagEl = document.getElementById('top-ch-tag');
    if (tagEl) tagEl.textContent = `Unit ${(idx >= 0 ? idx + 1 : ch.id)} / ${chapters.length}`;

    const lblEl = document.getElementById('active-ch-label');
    if (lblEl) {
      lblEl.textContent = `Unit ${ch.id}: ${ch.name}`;
      lblEl.title = `Unit ${ch.id}: ${ch.name}`;
    }
  }

  function toggleSubjectDropdown(subjectId, ddId) {
    if (typeof App !== 'undefined' && App.activeSubject !== subjectId) {
      App.switchSubject(subjectId);
    }
    toggleDropdown(ddId);
  }

  function buildSidebar() {
    renderTopChapters();
  }

  function updateSidebarCard() {
    updateTopChapterBadge();
  }

  function prevChapter() {
    const chapters = getCurriculumChapters();
    if (!chapters || !chapters.length) return;
    const curIdx = chapters.findIndex(c => c.id === App.activeChapter || +c.id === +App.activeChapter);
    if (curIdx > 0) {
      App.selectChapter(chapters[curIdx - 1].id);
    }
  }

  function nextChapter() {
    const chapters = getCurriculumChapters();
    if (!chapters || !chapters.length) return;
    const curIdx = chapters.findIndex(c => c.id === App.activeChapter || +c.id === +App.activeChapter);
    if (curIdx >= 0 && curIdx < chapters.length - 1) {
      App.selectChapter(chapters[curIdx + 1].id);
    }
  }

  // ─────────────────────────────────────────────
  // Rebuild sidebar + shape grid for a new subject
  // ─────────────────────────────────────────────
  function rebuildForSubject(subjectId) {
    if (typeof CurriculumStore !== 'undefined') {
      CurriculumStore.setActiveSubject(subjectId);
    }
    renderTopChapters();
    buildShapeGrid();
  }


  // ─────────────────────────────────────────────
  function buildBoardSwatches() {
    const wrap = document.getElementById('board-swatches');
    if (!wrap) return;
    wrap.innerHTML = '';

    const curBoardId = (typeof Canvas !== 'undefined' && Canvas.getBoardColorId) ? Canvas.getBoardColorId() : 'white';

    BOARD_COLORS.forEach(bc => {
      const s = document.createElement('div');
      s.className = 'bswatch' + (bc.id === curBoardId ? ' active' : '');
      s.dataset.id = bc.id;
      s.style.background = bc.bg;
      s.title = `${bc.label} (${bc.bg})`;
      if (bc.id === 'white' || bc.bg === '#ffffff' || bc.bg === '#fdf6e3' || bc.bg === '#f1f5f9' || bc.bg === '#f4f6f8') {
        s.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.18)';
      }
      s.addEventListener('click', () => {
        Canvas.setBoardColor(bc.id, bc.bg, bc.line, bc.major);
        document.querySelectorAll('.bswatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        const customDot = document.getElementById('board-custom-swatch');
        if (customDot) customDot.classList.remove('active');
      });
      wrap.appendChild(s);
    });

    // Custom Color Picker Swatch (+)
    const customLabel = document.createElement('label');
    customLabel.className = 'bswatch bswatch-custom';
    customLabel.id = 'board-custom-swatch';
    customLabel.title = 'Pick Custom Board Color…';
    customLabel.innerHTML = `
      <input type="color" id="board-custom-color-input" value="#0a1f0a" style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;">
      <span class="bswatch-custom-icon">+</span>
    `;
    const colorInput = customLabel.querySelector('input');
    colorInput.addEventListener('change', (e) => {
      const hex = e.target.value;
      Canvas.setBoardColor('custom', hex);
      document.querySelectorAll('.bswatch').forEach(x => x.classList.remove('active'));
      customLabel.classList.add('active');
      customLabel.style.background = hex;
      const r = parseInt(hex.slice(1,3), 16) || 0;
      const g = parseInt(hex.slice(3,5), 16) || 0;
      const b = parseInt(hex.slice(5,7), 16) || 0;
      const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
      const icon = customLabel.querySelector('.bswatch-custom-icon');
      if (lum > 0.5) {
        customLabel.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.2)';
        if (icon) icon.style.color = '#000000';
      } else {
        customLabel.style.boxShadow = 'none';
        if (icon) icon.style.color = '#ffffff';
      }
    });
    wrap.appendChild(customLabel);

    // 20+ Backgrounds Library Trigger (🎨)
    const pickerBtn = document.createElement('button');
    pickerBtn.className = 'bswatch bswatch-picker-trigger';
    pickerBtn.id = 'board-bg-picker-btn';
    pickerBtn.title = 'Browse 20+ Board Backgrounds (Math, Ruled, Lab, Isometric, Dots)';
    pickerBtn.innerHTML = '<span style="font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;">🎨</span>';
    pickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBoardPicker();
    });
    wrap.appendChild(pickerBtn);
  }

  // ─────────────────────────────────────────────
  // 20+ BOARD BACKGROUNDS PICKER MODAL
  // ─────────────────────────────────────────────
  let boardPickerOpen = false;

  function toggleBoardPicker() {
    if (boardPickerOpen) closeBoardPicker();
    else openBoardPicker();
  }

  function openBoardPicker() {
    let modal = document.getElementById('board-bg-picker-modal');
    if (!modal) {
      modal = createBoardPickerModal();
    }
    renderBoardPickerCards(modal, 'all');
    modal.classList.add('open');
    boardPickerOpen = true;
  }

  function closeBoardPicker() {
    const modal = document.getElementById('board-bg-picker-modal');
    if (modal) modal.classList.remove('open');
    boardPickerOpen = false;
  }

  function renderMiniPattern(canvas, bg) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 72;
    const h = canvas.height = 46;
    ctx.fillStyle = bg.bg;
    ctx.fillRect(0, 0, w, h);

    if (bg.pattern === 'grid' || !bg.pattern) {
      ctx.strokeStyle = bg.line || 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 10) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += 10) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      if (bg.major) {
        ctx.strokeStyle = bg.major;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 0; y <= h; y += 30) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();
      }
    } else if (bg.pattern === 'dots') {
      ctx.fillStyle = bg.dotColor || 'rgba(255,255,255,0.35)';
      for (let x = 5; x <= w; x += 10) {
        for (let y = 5; y <= h; y += 10) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (bg.pattern === 'ruled') {
      ctx.strokeStyle = bg.line || 'rgba(59,130,246,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 8; y <= h; y += 10) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      if (bg.margin) {
        ctx.strokeStyle = bg.margin;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(14, h);
        ctx.stroke();
      }
    } else if (bg.pattern === 'fourline') {
      ctx.strokeStyle = bg.line || 'rgba(59,130,246,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 10); ctx.lineTo(w, 10);
      ctx.moveTo(0, 34); ctx.lineTo(w, 34);
      ctx.stroke();
      ctx.strokeStyle = bg.midLine || 'rgba(239,68,68,0.4)';
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.lineTo(w, 18);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, 26); ctx.lineTo(w, 26);
      ctx.stroke();
    } else if (bg.pattern === 'axes') {
      ctx.strokeStyle = bg.line || 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 10) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += 10) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      ctx.strokeStyle = bg.major || '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
      ctx.stroke();
    } else if (bg.pattern === 'isometric') {
      ctx.strokeStyle = bg.line || 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 0; y <= h; y += 10) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      for (let x = -h; x <= w + h; x += 16) {
        ctx.moveTo(x, 0); ctx.lineTo(x + h, h);
        ctx.moveTo(x, 0); ctx.lineTo(x - h, h);
      }
      ctx.stroke();
    } else if (bg.pattern === 'polar') {
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = bg.line || 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      for (let r = 6; r <= 24; r += 6) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = bg.major || '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.stroke();
    }
  }

  function createBoardPickerModal() {
    const modal = document.createElement('div');
    modal.id = 'board-bg-picker-modal';
    modal.className = 'board-bg-modal';
    modal.innerHTML = `
      <div class="bbm-overlay" onclick="UI.closeBoardPicker()"></div>
      <div class="bbm-content">
        <div class="bbm-header">
          <div class="bbm-title-wrap">
            <span class="bbm-icon">🎨</span>
            <div class="bbm-title">Board Background Library</div>
            <div class="bbm-subtitle">24 Professional SmartBoard Teaching Surfaces</div>
          </div>
          <button class="bbm-close" onclick="UI.closeBoardPicker()">✕</button>
        </div>
        <div class="bbm-tabs" id="bbm-category-tabs">
          <button class="bbm-tab active" data-cat="all">All (24)</button>
          <button class="bbm-tab" data-cat="plain">Plain (9)</button>
          <button class="bbm-tab" data-cat="math">Math &amp; Graphs (3)</button>
          <button class="bbm-tab" data-cat="writing">Writing &amp; Ruled (5)</button>
          <button class="bbm-tab" data-cat="science">Science &amp; Lab (3)</button>
          <button class="bbm-tab" data-cat="modern">Modern &amp; Dots (4)</button>
        </div>
        <div class="bbm-grid" id="bbm-cards-grid"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.bbm-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        modal.querySelectorAll('.bbm-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderBoardPickerCards(modal, tab.dataset.cat);
      });
    });

    return modal;
  }

  function renderBoardPickerCards(modal, filterCat) {
    const grid = modal.querySelector('#bbm-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = (typeof Canvas !== 'undefined' && Canvas.getBoardBackgrounds) ? Canvas.getBoardBackgrounds() : [];
    const curId = (typeof Canvas !== 'undefined' && Canvas.getBoardColorId) ? Canvas.getBoardColorId() : 'white';

    const filtered = filterCat === 'all' ? list : list.filter(b => b.category === filterCat);

    filtered.forEach(bg => {
      const card = document.createElement('div');
      card.className = 'bbm-card' + (bg.id === curId ? ' active' : '');
      card.title = `${bg.label} (${bg.bg})`;

      const thumb = document.createElement('canvas');
      thumb.className = 'bbm-thumb';
      renderMiniPattern(thumb, bg);

      const labelWrap = document.createElement('div');
      labelWrap.className = 'bbm-info';
      labelWrap.innerHTML = `
        <div class="bbm-name">${bg.label}</div>
        <span class="bbm-badge bbm-badge-${bg.category}">${bg.category}</span>
      `;

      card.appendChild(thumb);
      card.appendChild(labelWrap);

      card.addEventListener('click', () => {
        if (typeof Canvas !== 'undefined') {
          Canvas.setBoardColor(bg.id);
        }
        buildBoardSwatches();
        closeBoardPicker();
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`🎨 Board Background: ${bg.label}`);
        }
      });

      grid.appendChild(card);
    });
  }
  function syncPenPanel() {
    const curSize = (typeof App !== 'undefined') ? App.penSize : 2;
    const curColor = (typeof App !== 'undefined') ? App.currentColor : '#ffffff';

    // Synchronize 3 pen size buttons (active ring + colored dot inside)
    document.querySelectorAll('.fp-size-ring').forEach(btn => {
      const sz = Number(btn.dataset.size);
      const isActive = sz === curSize;
      btn.classList.toggle('active', isActive);
      const dot = btn.querySelector('.fp-size-dot');
      if (dot) {
        dot.style.background = curColor;
        if (curColor.toLowerCase() === '#ffffff' || curColor.toLowerCase() === '#fff') {
          dot.style.border = '1px solid #94a3b8';
        } else {
          dot.style.border = 'none';
        }
      }
    });

    // Synchronize quick color dots
    document.querySelectorAll('.fp-color-dot').forEach(d => {
      if (!d.dataset.hex) return;
      const isMatch = d.dataset.hex.toLowerCase() === curColor.toLowerCase();
      d.classList.toggle('active', isMatch);
    });

    // Synchronize eraser size buttons
    const curEraserSize = (typeof App !== 'undefined' && App.eraserSize) ? App.eraserSize : 26;
    document.querySelectorAll('.fp-eraser-size-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.esize) === Number(curEraserSize));
    });
  }

  function selectPenSize(sz) {
    if (typeof App !== 'undefined') {
      App.penSize = sz;
    }
    syncPenPanel();
    closePenFlyout();
  }

  function selectEraserSize(sz) {
    if (typeof App !== 'undefined') {
      App.eraserSize = sz;
    }
    syncPenPanel();
    closeEraserFlyout();
  }

  let shapesSectionHidden = false;
  function toggleShapesSection() {
    shapesSectionHidden = !shapesSectionHidden;
    const grid = document.getElementById('shape-grid');
    const btn = document.getElementById('rp-shapes-hide-btn');
    if (grid) grid.style.display = shapesSectionHidden ? 'none' : 'grid';
    if (btn) btn.textContent = shapesSectionHidden ? 'Show' : 'Hide';
  }

  // ─────────────────────────────────────────────
  // FLYOUT CONTROLS (Left Floating Palette Popovers)
  // ─────────────────────────────────────────────
  function togglePenFlyout() {
    const p = document.getElementById('flyout-pen');
    if (!p) return;
    const isHidden = p.classList.contains('hidden');
    closeAllFlyouts();
    if (isHidden) {
      p.classList.remove('hidden');
      if (typeof App !== 'undefined' && !['pen','highlighter'].includes(App.currentTool)) {
        App.setTool('pen');
      }
      syncPenPanel();
    }
  }

  function openPenFlyout() {
    const p = document.getElementById('flyout-pen');
    if (p) {
      closeShapesFlyout();
      closeEraserFlyout();
      closeInsertFlyout();
      p.classList.remove('hidden');
      syncPenPanel();
    }
  }

  function closePenFlyout() {
    const p = document.getElementById('flyout-pen');
    if (p) p.classList.add('hidden');
  }

  function toggleEraserFlyout() {
    const ep = document.getElementById('flyout-eraser');
    if (!ep) return;
    const isHidden = ep.classList.contains('hidden');
    closeAllFlyouts();
    if (isHidden) {
      ep.classList.remove('hidden');
      if (typeof App !== 'undefined' && App.currentTool !== 'eraser') {
        App.setTool('eraser');
      }
      syncPenPanel();
    }
  }

  function openEraserFlyout() {
    const ep = document.getElementById('flyout-eraser');
    if (ep) {
      closePenFlyout();
      closeShapesFlyout();
      closeInsertFlyout();
      ep.classList.remove('hidden');
      syncPenPanel();
    }
  }

  function closeEraserFlyout() {
    const ep = document.getElementById('flyout-eraser');
    if (ep) ep.classList.add('hidden');
  }

  function toggleShapesFlyout() {
    const s = document.getElementById('flyout-shapes');
    if (!s) return;
    const isHidden = s.classList.contains('hidden');
    closeAllFlyouts();
    if (isHidden) {
      s.classList.remove('hidden');
      switchShapesDomain(activeShapesDomain);
    }
  }

  function openShapesFlyout() {
    const s = document.getElementById('flyout-shapes');
    if (s) {
      closePenFlyout();
      closeEraserFlyout();
      closeInsertFlyout();
      s.classList.remove('hidden');
      switchShapesDomain(activeShapesDomain);
    }
  }

  function closeShapesFlyout() {
    const s = document.getElementById('flyout-shapes');
    if (s) s.classList.add('hidden');
  }

  function closeAllFlyouts() {
    const p = document.getElementById('flyout-pen');
    const e = document.getElementById('flyout-eraser');
    const s = document.getElementById('flyout-shapes');
    const i = document.getElementById('flyout-insert');
    if (p) p.classList.add('hidden');
    if (e) e.classList.add('hidden');
    if (s) s.classList.add('hidden');
    if (i) i.classList.add('hidden');
  }

  function toggleInsertFlyout() {
    const i = document.getElementById('flyout-insert');
    if (!i) return;
    const isHidden = i.classList.contains('hidden');
    closeAllFlyouts();
    if (isHidden) {
      i.classList.remove('hidden');
    }
  }

  function openInsertFlyout() {
    const i = document.getElementById('flyout-insert');
    if (i) {
      closePenFlyout();
      closeShapesFlyout();
      i.classList.remove('hidden');
    }
  }

  function closeInsertFlyout() {
    const i = document.getElementById('flyout-insert');
    if (i) i.classList.add('hidden');
  }

  function openPdfPicker() {
    const inp = document.getElementById('pdf-file-input');
    if (inp) {
      inp.value = '';
      inp.click();
    }
  }

  async function handlePdfSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (typeof App !== 'undefined' && App.showToast) App.showToast(`Loading PDF: ${file.name}...`);
    try {
      if (typeof pdfjsLib === 'undefined') {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            resolve();
          };
          s.onerror = () => reject(new Error('Failed to load PDF engine'));
          document.head.appendChild(s);
        });
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const slides = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        slides.push({
          index: i,
          name: `Page ${i}`,
          dataUrl: canvas.toDataURL('image/jpeg', 0.92)
        });
      }
      if (slides.length > 0) {
        if (typeof PptPresenter !== 'undefined' && PptPresenter.loadDeck) {
          PptPresenter.loadDeck({
            success: true,
            fileName: file.name,
            slideCount: slides.length,
            slides: slides
          });
          if (typeof App !== 'undefined' && App.showToast) App.showToast(`✓ Imported PDF (${slides.length} pages)`);
        } else if (typeof Canvas !== 'undefined' && Canvas.setBgImage) {
          Canvas.setBgImage(slides[0].dataUrl);
        }
      }
    } catch (err) {
      console.error('PDF error:', err);
      alert('Could not render PDF slides: ' + err.message);
    }
    e.target.value = '';
  }

  function selectSubtool(sub) {
    if (typeof App === 'undefined') return;
    if (sub === 'pen') {
      App.setTool('pen');
    } else if (sub === 'highlighter') {
      App.setTool('highlighter');
    } else if (sub === 'eraser') {
      App.setTool('eraser');
    } else if (sub === 'select') {
      App.setTool('select');
      closePenFlyout();
    }
    syncSubtoolButtons(sub);
  }

  function syncSubtoolButtons(activeSub) {
    document.querySelectorAll('.fp-sub-btn').forEach(btn => {
      const match = btn.id === `subtool-${activeSub}` || btn.dataset.sub === activeSub;
      btn.classList.toggle('active', match);
    });
  }

  function cyclePenSize() {
    if (typeof App === 'undefined') return;
    const SIZES = [
      { sz: 2, dot: 3, label: 'Fine (2px)' },
      { sz: 4, dot: 6, label: 'Medium (4px)' },
      { sz: 8, dot: 9, label: 'Bold (8px)' },
      { sz: 16, dot: 14, label: 'Marker (16px)' }
    ];
    let currIdx = SIZES.findIndex(s => s.sz === App.penSize);
    if (currIdx === -1) currIdx = 0;
    const next = SIZES[(currIdx + 1) % SIZES.length];
    App.penSize = next.sz;

    const ring = document.getElementById('fp-size-ring');
    const dot = document.getElementById('fp-size-dot');
    if (ring) ring.title = `Stroke Size: ${next.label} (click to cycle)`;
    if (dot) {
      dot.style.width = `${next.dot}px`;
      dot.style.height = `${next.dot}px`;
    }
    document.querySelectorAll('.pen-sz').forEach(b => {
      b.classList.toggle('active', b.title === `${next.sz}px`);
    });
  }

  function selectFlyoutColor(hex) {
    if (typeof App === 'undefined') return;
    App.setColor(hex);
    document.querySelectorAll('.fp-color-dot').forEach(d => {
      const isMatch = (d.dataset.hex && d.dataset.hex.toLowerCase() === hex.toLowerCase()) ||
                      (d.style.background && rgbToHex(d.style.background) === hex.toLowerCase());
      d.classList.toggle('active', isMatch);
    });
    closePenFlyout();
  }

  function clearDrawingStrokes() {
    if (typeof Drawing !== 'undefined' && Drawing.clearDrawings) {
      Drawing.clearDrawings();
    }
    const dc = document.getElementById('draw-canvas');
    if (dc) {
      const ctx = dc.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, dc.width, dc.height);
    }
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('Drawing strokes cleared');
    }
  }

  function filterShapesCategory(cat) {
    document.querySelectorAll('.fsc-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.cat === cat || t.getAttribute('onclick')?.includes(`'${cat}'`));
    });

    const searchInput = document.getElementById('fsc-search-input');
    if (searchInput) searchInput.value = '';

    const items = document.querySelectorAll('#shape-grid .shape-btn, #shape-grid .fsc-sec-hdr');
    items.forEach(el => {
      if (cat === 'all') {
        el.style.display = el.classList.contains('fsc-sec-hdr') ? 'flex' : 'flex';
      } else {
        const itemCat = el.dataset.cat;
        if (itemCat === cat) {
          el.style.display = el.classList.contains('fsc-sec-hdr') ? 'flex' : 'flex';
        } else {
          el.style.display = 'none';
        }
      }
    });
  }

  function searchShapes(query) {
    const q = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('#shape-grid .shape-btn');
    const hdrs = document.querySelectorAll('#shape-grid .fsc-sec-hdr');
    if (!q) {
      const activeTab = document.querySelector('.fsc-tab.active');
      const cat = activeTab ? activeTab.dataset.cat : 'all';
      filterShapesCategory(cat);
      return;
    }
    hdrs.forEach(h => h.style.display = 'none');
    items.forEach(b => {
      const title = (b.title || '').toLowerCase();
      const label = (b.querySelector('.sl')?.textContent || '').toLowerCase();
      const match = title.includes(q) || label.includes(q);
      b.style.display = match ? 'flex' : 'none';
    });
  }

  function rgbToHex(rgb) {
    if (!rgb) return '';
    if (rgb.startsWith('#')) return rgb.toLowerCase();
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3) return rgb;
    return '#' + m.slice(0,3).map(v => parseInt(v).toString(16).padStart(2,'0')).join('').toLowerCase();
  }

  let activeShapesDomain = 'math';

  function renderQuickShelf(domain) {
    const shelf = document.getElementById('fsc-quick-shelf-container');
    if (!shelf) return;
    shelf.classList.remove('domain-physics', 'domain-science');
    if (domain === 'physics') shelf.classList.add('domain-physics');
    else if (domain === 'science') shelf.classList.add('domain-science');

    if (domain === 'engineering') {
      shelf.innerHTML = `
        <div class="fsc-shelf-header">
          <span class="fsc-shelf-title" style="color:#38bdf8;">🛠️ QUICK ENGINEERING INSTRUMENTS & DRAFTING</span>
          <span class="fsc-shelf-tag" style="background:#0284c7;">ISO / IEC / ASME</span>
        </div>
        <div class="fsc-quick-grid">
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('eng-gdt-position'); UI.closeShapesFlyout();" title="GD&T True Position Callout">
            <svg viewBox="0 0 32 32" fill="none"><rect x="3" y="10" width="26" height="12" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.1)"/><text x="7.5" y="19" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">⌖</text><text x="20" y="19" font-size="6" fill="#fff" text-anchor="middle">⌀.1Ⓜ</text></svg>
            <span class="qlabel">GD&T Pos</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('eng-logic-and'); UI.closeShapesFlyout();" title="IEEE Standard AND Logic Gate">
            <svg viewBox="0 0 32 32" fill="none"><path d="M6,7 L15,7 A9,9 0 0,1 15,25 L6,25 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><line x1="2" y1="11" x2="6" y2="11" stroke="#38bdf8" stroke-width="1.8"/><line x1="2" y1="21" x2="6" y2="21" stroke="#38bdf8" stroke-width="1.8"/><line x1="24" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/></svg>
            <span class="qlabel">AND Gate</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('eng-cyl-double'); UI.closeShapesFlyout();" title="ISO 1219 Double-Acting Fluid Cylinder">
            <svg viewBox="0 0 32 32" fill="none"><rect x="4" y="9" width="18" height="14" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="12" y1="9" x2="12" y2="23" stroke="#38bdf8" stroke-width="2.5"/><line x1="12" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="2.5"/></svg>
            <span class="qlabel">Cylinder</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('eng-valv-control'); UI.closeShapesFlyout();" title="ISA-5.1 Diaphragm Control Valve">
            <svg viewBox="0 0 32 32" fill="none"><polygon points="6,16 6,26 16,21" stroke="#38bdf8" stroke-width="1.2" fill="none"/><polygon points="26,16 26,26 16,21" stroke="#38bdf8" stroke-width="1.2" fill="none"/><line x1="16" y1="21" x2="16" y2="12" stroke="#38bdf8" stroke-width="1.5"/><path d="M10,12 A6,6 0 0,1 22,12 Z" stroke="#facc15" stroke-width="1.5" fill="rgba(250,204,21,0.2)"/></svg>
            <span class="qlabel">Control Valv</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('eng-beam-i'); UI.closeShapesFlyout();" title="Structural Steel I-Beam Section">
            <svg viewBox="0 0 32 32" fill="none"><path d="M8,5 L24,5 L24,9 L18,9 L18,23 L24,23 L24,27 L8,27 L8,23 L14,23 L14,9 L8,9 Z" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.15)"/></svg>
            <span class="qlabel">I-Beam</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('eng-graph-stress-strain'); UI.closeShapesFlyout();" title="Stress-Strain Mechanics Curve">
            <svg viewBox="0 0 32 32" fill="none"><line x1="6" y1="6" x2="6" y2="26" stroke="#38bdf8" stroke-width="1.8"/><line x1="6" y1="26" x2="27" y2="26" stroke="#38bdf8" stroke-width="1.8"/><path d="M6,26 L12,13 Q16,11 19,13 T25,18" stroke="#ef4444" stroke-width="2" fill="none"/></svg>
            <span class="qlabel">Stress-Strain</span>
          </button>
        </div>`;
    } else if (domain === 'math') {
      shelf.innerHTML = `
        <div class="fsc-shelf-header">
          <span class="fsc-shelf-title">📐 QUICK MATH INSTRUMENTS</span>
          <span class="fsc-shelf-tag">Instruments</span>
        </div>
        <div class="fsc-quick-grid">
          <button class="fsc-quick-tool-btn" onclick="App.setTool('measure-line'); UI.closeShapesFlyout(); App.showToast('📏 Ruler: Drag between points to measure distance (cm)');" title="Ruler / Measured Line (cm)">
            <svg viewBox="0 0 32 32" fill="none"><line x1="4" y1="26" x2="28" y2="6" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round"/><circle cx="4" cy="26" r="2.5" fill="#0284c7"/><circle cx="28" cy="6" r="2.5" fill="#0284c7"/><rect x="11" y="11" width="10" height="7" rx="1.5" fill="#38bdf8" fill-opacity=".3"/><text x="16" y="16.5" text-anchor="middle" font-size="6" font-weight="bold" fill="#0284c7">cm</text></svg>
            <span class="qlabel">Ruler (cm)</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="App.setTool('compass'); UI.closeShapesFlyout(); App.showToast('🧭 Compass: drag the needle, pencil or grip — then press Draw');" title="Geometry Compass (r)">
            <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="3,2" fill="#0284c7" fill-opacity=".08"/><line x1="16" y1="16" x2="27" y2="16" stroke="#eab308" stroke-width="1.5"/><circle cx="16" cy="16" r="2.2" fill="#ef4444"/><circle cx="27" cy="16" r="2" fill="#38bdf8"/><text x="21" y="13" font-size="6.5" font-weight="bold" fill="#eab308">r</text></svg>
            <span class="qlabel">Compass</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="App.setTool('measure-angle'); UI.closeShapesFlyout(); App.showToast('📐 Measure Angle: Drag vertex to measure angle (degrees)');" title="Angle (θ°)">
            <svg viewBox="0 0 32 32" fill="none"><line x1="4" y1="26" x2="28" y2="26" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="26" x2="24" y2="6" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/><path d="M14,26 A10,10 0 0,0 12,18" stroke="#f59e0b" stroke-width="1.8" fill="none"/><text x="17" y="19" font-size="7" font-weight="bold" fill="#f59e0b">θ°</text></svg>
            <span class="qlabel">Angle (θ°)</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="App.setTool('protractor'); UI.closeShapesFlyout(); App.showToast('Protractor placed on board');" title="Protractor">
            <svg viewBox="0 0 32 32" fill="none"><path d="M4,20 A12,12 0 0,1 28,20 Z" stroke="#0284c7" stroke-width="2" fill="rgba(2,132,199,0.12)"/><line x1="4" y1="20" x2="28" y2="20" stroke="#0284c7" stroke-width="1.5"/><line x1="16" y1="20" x2="16" y2="8" stroke="#0284c7" stroke-width="1" stroke-dasharray="2,2"/></svg>
            <span class="qlabel">Protractor</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('number-line'); UI.closeShapesFlyout();" title="Number Line">
            <svg viewBox="0 0 32 32" fill="none"><line x1="2" y1="16" x2="30" y2="16" stroke="#0284c7" stroke-width="2.5"/><line x1="10" y1="11" x2="10" y2="21" stroke="#0284c7" stroke-width="1.5"/><line x1="16" y1="11" x2="16" y2="21" stroke="#0284c7" stroke-width="1.5"/><line x1="22" y1="11" x2="22" y2="21" stroke="#0284c7" stroke-width="1.5"/></svg>
            <span class="qlabel">Number Line</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="AreaSolver.findArea(); UI.closeShapesFlyout();" title="📐 Arbitrary Shape Area Solver — Calculate enclosed area of drawn shapes">
            <svg viewBox="0 0 32 32" fill="none"><polygon points="6,24 10,8 24,6 27,20 18,26" stroke="#38bdf8" stroke-width="2" fill="rgba(56,189,248,0.18)"/><circle cx="6" cy="24" r="2" fill="#facc15"/><circle cx="10" cy="8" r="2" fill="#facc15"/><circle cx="24" cy="6" r="2" fill="#facc15"/><circle cx="27" cy="20" r="2" fill="#facc15"/><circle cx="18" cy="26" r="2" fill="#facc15"/><text x="17" y="18" font-size="6.5" font-weight="bold" fill="#38bdf8" text-anchor="middle">Area</text></svg>
            <span class="qlabel">Find Area</span>
          </button>
        </div>`;
    } else if (domain === 'physics') {
      shelf.innerHTML = `
        <div class="fsc-shelf-header">
          <span class="fsc-shelf-title" style="color:#b45309;">⚡ QUICK PHYSICS SIMULATIONS</span>
          <span class="fsc-shelf-tag" style="background:#d97706;">Interactive</span>
        </div>
        <div class="fsc-quick-grid">
          <button class="fsc-quick-tool-btn is-sim-btn" onclick="PhysicsLab.show('projectile'); UI.closeShapesFlyout();" title="🚀 Projectile Motion Lab">
            <svg viewBox="0 0 32 32" fill="none"><path d="M4,27 Q16,5 28,27" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="10.5" r="3"/><line x1="2" y1="27" x2="30" y2="27" stroke="#78350f" stroke-width="1.8"/><circle cx="28" cy="27" r="2" fill="#ef4444"/></svg>
            <span class="qlabel">Projectile</span>
          </button>
        </div>`;
    } else {
      shelf.innerHTML = `
        <div class="fsc-shelf-header">
          <span class="fsc-shelf-title">⭐ QUICK SCIENCE INSTRUMENTS</span>
          <span class="fsc-shelf-tag" style="background:#10b981;">Science</span>
        </div>
        <div class="fsc-quick-grid">
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('sc-battery'); UI.closeShapesFlyout();" title="Battery Source">
            <svg viewBox="0 0 32 32" fill="none"><line x1="4" y1="16" x2="28" y2="16" stroke="#10b981" stroke-width="1.5"/><line x1="10" y1="10" x2="10" y2="22" stroke="#10b981" stroke-width="2.5"/><line x1="16" y1="12" x2="16" y2="20" stroke="#10b981" stroke-width="1.5"/><line x1="22" y1="10" x2="22" y2="22" stroke="#10b981" stroke-width="2.5"/><line x1="26" y1="12" x2="26" y2="20" stroke="#10b981" stroke-width="1.5"/></svg>
            <span class="qlabel">Battery</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('sc-bulb'); UI.closeShapesFlyout();" title="Light Bulb">
            <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="14" r="9" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".1"/><line x1="12" y1="11" x2="20" y2="17" stroke="#10b981" stroke-width="1.2"/><line x1="20" y1="11" x2="12" y2="17" stroke="#10b981" stroke-width="1.2"/><line x1="13" y1="23" x2="19" y2="23" stroke="#10b981" stroke-width="1.5"/><line x1="14" y1="26" x2="18" y2="26" stroke="#10b981" stroke-width="1.5"/></svg>
            <span class="qlabel">Bulb</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('sc-resistor'); UI.closeShapesFlyout();" title="Resistor">
            <svg viewBox="0 0 32 32" fill="none"><line x1="2" y1="16" x2="7" y2="16" stroke="#10b981" stroke-width="1.5"/><rect x="7" y="11" width="18" height="10" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".12"/><line x1="25" y1="16" x2="30" y2="16" stroke="#10b981" stroke-width="1.5"/></svg>
            <span class="qlabel">Resistor</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('sc-bar-magnet'); UI.closeShapesFlyout();" title="Bar Magnet (N-S)">
            <svg viewBox="0 0 32 32" fill="none"><rect x="2" y="11" width="28" height="10" rx="2" stroke="#10b981" stroke-width="1.5" fill="none"/><rect x="2" y="11" width="14" height="10" fill="#10b981" fill-opacity=".3"/><text x="9" y="19" text-anchor="middle" font-size="8" fill="#10b981" font-weight="700">N</text><text x="23" y="19" text-anchor="middle" font-size="8" fill="#10b981">S</text></svg>
            <span class="qlabel">Magnet</span>
          </button>
          <button class="fsc-quick-tool-btn" onclick="Canvas.addShape('sc-beaker'); UI.closeShapesFlyout();" title="Lab Beaker">
            <svg viewBox="0 0 32 32" fill="none"><path d="M8,4 L8,22 Q8,28 16,28 Q24,28 24,22 L24,4" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".1"/><line x1="6" y1="4" x2="26" y2="4" stroke="#10b981" stroke-width="2"/></svg>
            <span class="qlabel">Beaker</span>
          </button>
        </div>`;
    }
  }

  function renderShapesTabs(domain) {
    const tabsCont = document.getElementById('fsc-tabs-container');
    if (!tabsCont) return;
    if (domain === 'engineering') {
      tabsCont.innerHTML = `
        <button class="fsc-tab active" data-cat="all" onclick="UI.filterShapesCategory('all')">All Symbols</button>
        <button class="fsc-tab" data-cat="eng-drafting" onclick="UI.filterShapesCategory('eng-drafting')">📐 Drafting & GD&T</button>
        <button class="fsc-tab" data-cat="eng-electrical" onclick="UI.filterShapesCategory('eng-electrical')">⚡ Electrical & Power</button>
        <button class="fsc-tab" data-cat="eng-electronics" onclick="UI.filterShapesCategory('eng-electronics')">🔌 Electronics & Logic</button>
        <button class="fsc-tab" data-cat="eng-mechanical" onclick="UI.filterShapesCategory('eng-mechanical')">⚙️ Mechanical Parts</button>
        <button class="fsc-tab" data-cat="eng-fluid" onclick="UI.filterShapesCategory('eng-fluid')">💧 Hydraulics & Pneumatics</button>
        <button class="fsc-tab" data-cat="eng-civil" onclick="UI.filterShapesCategory('eng-civil')">🏛️ Civil & Structural</button>
        <button class="fsc-tab" data-cat="eng-process" onclick="UI.filterShapesCategory('eng-process')">🏭 Process & P&ID</button>
        <button class="fsc-tab" data-cat="eng-computing" onclick="UI.filterShapesCategory('eng-computing')">💻 Computing & Networks</button>
        <button class="fsc-tab" data-cat="eng-advanced" onclick="UI.filterShapesCategory('eng-advanced')">🛰️ Aero, Auto & Bio</button>
        <button class="fsc-tab" data-cat="eng-analysis" onclick="UI.filterShapesCategory('eng-analysis')">📊 Graphs & Analysis</button>
      `;
    } else if (domain === 'math') {
      tabsCont.innerHTML = `
        <button class="fsc-tab active" data-cat="all" onclick="UI.filterShapesCategory('all')">All</button>
        <button class="fsc-tab" data-cat="tab-01" onclick="UI.filterShapesCategory('tab-01')">01 2D Shapes</button>
        <button class="fsc-tab" data-cat="tab-02" onclick="UI.filterShapesCategory('tab-02')">02 Geometry</button>
        <button class="fsc-tab" data-cat="tab-03" onclick="UI.filterShapesCategory('tab-03')">03 Circles</button>
        <button class="fsc-tab" data-cat="tab-04" onclick="UI.filterShapesCategory('tab-04')">04 3D Solids</button>
        <button class="fsc-tab" data-cat="tab-05" onclick="UI.filterShapesCategory('tab-05')">05 Graphs</button>
        <button class="fsc-tab" data-cat="tab-06" onclick="UI.filterShapesCategory('tab-06')">06 Transforms</button>
        <button class="fsc-tab" data-cat="tab-07" onclick="UI.filterShapesCategory('tab-07')">07 Measure</button>
        <button class="fsc-tab" data-cat="tab-08" onclick="UI.filterShapesCategory('tab-08')">08 Fractions</button>
        <button class="fsc-tab" data-cat="tab-09" onclick="UI.filterShapesCategory('tab-09')">09 Statistics</button>
        <button class="fsc-tab" data-cat="tab-10" onclick="UI.filterShapesCategory('tab-10')">10 Advanced</button>
        <button class="fsc-tab" data-cat="tab-11" onclick="UI.filterShapesCategory('tab-11')">11 Diagrams</button>
        <button class="fsc-tab" data-cat="tab-12" onclick="UI.filterShapesCategory('tab-12')">12 Smart</button>
      `;
    } else if (domain === 'physics') {
      tabsCont.innerHTML = `
        <button class="fsc-tab active" data-cat="all" onclick="UI.filterShapesCategory('all')">All</button>
        <button class="fsc-tab" data-cat="mechanics" onclick="UI.filterShapesCategory('mechanics')">🚀 Mechanics</button>
        <button class="fsc-tab" data-cat="oscillations" onclick="UI.filterShapesCategory('oscillations')">⏱ Oscillations</button>
        <button class="fsc-tab" data-cat="optics" onclick="UI.filterShapesCategory('optics')">🔍 Optics</button>
        <button class="fsc-tab" data-cat="circuits" onclick="UI.filterShapesCategory('circuits')">⚡ E&M</button>
        <button class="fsc-tab" data-cat="thermo" onclick="UI.filterShapesCategory('thermo')">🔥 Thermo</button>
      `;
    } else {
      tabsCont.innerHTML = `
        <button class="fsc-tab active" data-cat="all" onclick="UI.filterShapesCategory('all')">All</button>
        <button class="fsc-tab" data-cat="physics" onclick="UI.filterShapesCategory('physics')">⚙ Physics</button>
        <button class="fsc-tab" data-cat="circuits" onclick="UI.filterShapesCategory('circuits')">⚡ Circuits</button>
        <button class="fsc-tab" data-cat="optics-waves" onclick="UI.filterShapesCategory('optics-waves')">🔍 Optics & Waves</button>
        <button class="fsc-tab" data-cat="chem-lab" onclick="UI.filterShapesCategory('chem-lab')">🧪 Chem Lab</button>
        <button class="fsc-tab" data-cat="molecules" onclick="UI.filterShapesCategory('molecules')">⚗ Molecules</button>
        <button class="fsc-tab" data-cat="biology" onclick="UI.filterShapesCategory('biology')">🧬 Biology</button>
        <button class="fsc-tab" data-cat="anatomy" onclick="UI.filterShapesCategory('anatomy')">🫀 Anatomy</button>
        <button class="fsc-tab" data-cat="earth" onclick="UI.filterShapesCategory('earth')">🌍 Earth & Space</button>
        <button class="fsc-tab" data-cat="symbols-units" onclick="UI.filterShapesCategory('symbols-units')">📐 Symbols & Units</button>
        <button class="fsc-tab" data-cat="safety" onclick="UI.filterShapesCategory('safety')">⚠️ Lab Safety</button>
      `;
    }
  }

  function switchShapesDomain(domain) {
    activeShapesDomain = domain === 'engineering' ? 'engineering' : (domain === 'science' ? 'science' : 'math');
    const btnMath = document.getElementById('fsc-btn-math');
    const btnSci = document.getElementById('fsc-btn-science');
    const btnEng = document.getElementById('fsc-btn-engineering');
    const btnPhys = document.getElementById('fsc-btn-physics');
    if (btnMath) btnMath.classList.toggle('active', activeShapesDomain === 'math');
    if (btnSci) btnSci.classList.toggle('active', activeShapesDomain === 'science');
    if (btnEng) btnEng.classList.toggle('active', activeShapesDomain === 'engineering');
    if (btnPhys) btnPhys.classList.toggle('active', false);

    renderQuickShelf(activeShapesDomain);
    renderShapesTabs(activeShapesDomain);
    buildShapeGrid();

    const searchInput = document.getElementById('fsc-search-input');
    if (searchInput) searchInput.value = '';
  }

  // ─────────────────────────────────────────────
  function buildShapeGrid() {
    const grid = document.getElementById('shape-grid');
    if (!grid) return;

    // Flyout header indicator
    const fscTitle = document.getElementById('fsc-title-text');
    const fscIcon = document.getElementById('fsc-subject-icon');
    if (fscTitle) fscTitle.textContent = activeShapesDomain === 'engineering' ? 'Engineering' : (activeShapesDomain === 'science' ? 'Science' : 'Shapes');
    if (fscIcon) fscIcon.textContent = activeShapesDomain === 'engineering' ? '🛠️' : (activeShapesDomain === 'science' ? '🔬' : '🔷');

    const MATH_SECTIONS = [
      // ── TAB 01: BASIC 2D SHAPES & POLYGONS ──
      {
        label: '01 Basic 2D Shapes & Polygons',
        cat: 'tab-01',
        shapes: [
          { t:'circle',              l:'Circle',        svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'square',              l:'Square',        svg:'<rect x="5" y="5" width="22" height="22" rx="2" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'rectangle',           l:'Rectangle',     svg:'<rect x="2" y="6" width="28" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'triangle',            l:'Triangle',      svg:'<polygon points="16,3 30,29 2,29" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'oval',                l:'Oval / Ellipse',svg:'<ellipse cx="16" cy="16" rx="14" ry="9" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'semicircle',          l:'Semicircle',    svg:'<path d="M4,16 A12,12 0 0,1 28,16 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="2"/>' },
          { t:'quarter-circle',      l:'Quarter Circle',svg:'<path d="M6,26 L6,6 A20,20 0 0,1 26,26 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'annulus',             l:'Ring / Annulus',svg:'<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><circle cx="16" cy="16" r="7" stroke="currentColor" stroke-width="1.8" fill="#ffffff"/>' },
          { t:'sector',              l:'Sector',        svg:'<path d="M16,16 L16,3 A13,13 0 0,1 28,23 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'circular-segment',    l:'Segment',       svg:'<path d="M4,12 Q16,30 28,12 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'circular-arc',        l:'Circular Arc',  svg:'<path d="M6,20 A12,12 0 1,1 26,20" stroke="currentColor" stroke-width="2.2" fill="none"/>' },
          { t:'crescent',            l:'Crescent',      svg:'<path d="M20,6 A12,12 0 0,1 20,26 A10,10 0 0,0 20,6 Z" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".15"/>' },
          { t:'parallelogram',       l:'Parallelogram', svg:'<polygon points="8,5 32,5 24,27 0,27" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'rhombus',             l:'Rhombus',       svg:'<polygon points="16,2 30,16 16,30 2,16" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'trapezium',           l:'Trapezium',     svg:'<polygon points="9,5 23,5 31,27 1,27" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'isosceles-trapezoid', l:'Isosc. Trap.',  svg:'<polygon points="8,6 24,6 30,26 2,26" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'kite',                l:'Kite',          svg:'<polygon points="16,2 28,14 16,30 4,14" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'dart',                l:'Dart',          svg:'<polygon points="16,2 30,28 16,18 2,28" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'irregular-quad',      l:'Irregular Quad',svg:'<polygon points="8,4 28,8 26,28 4,22" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'cyclic-quad',         l:'Cyclic Quad',   svg:'<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3,2" fill="none"/><polygon points="16,3 28,14 20,29 5,23" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'equilateral',         l:'Equilateral',   svg:'<polygon points="16,2 30,28 2,28" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'isosceles-tri',       l:'Isosceles',     svg:'<polygon points="16,3 27,29 5,29" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'scalene-tri',         l:'Scalene',       svg:'<polygon points="22,3 30,29 2,29" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'rightTriangle',       l:'Right Tri.',    svg:'<polygon points="3,3 3,29 29,29" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><rect x="3" y="17" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/>' },
          { t:'triangle-30-60-90',   l:'30°-60°-90°',   svg:'<polygon points="4,5 4,28 28,28" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'triangle-45-45-90',   l:'45°-45°-90°',   svg:'<polygon points="4,4 4,28 28,28" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'golden-triangle',     l:'Golden Tri.',   svg:'<polygon points="16,2 25,30 7,30" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'egyptian-triangle',   l:'3-4-5 Triangle',svg:'<polygon points="4,6 4,28 28,28" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><text x="14" y="22" font-size="7" fill="currentColor">3-4-5</text>' },
          { t:'pentagon',            l:'Pentagon (5)',  svg:'<polygon points="16,2 29,11 24,27 8,27 3,11" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'hexagon',             l:'Hexagon (6)',   svg:'<polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'heptagon',            l:'Heptagon (7)',  svg:'<polygon points="16,2 27,7 30,20 22,29 10,29 2,20 5,7" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'octagon',             l:'Octagon (8)',   svg:'<polygon points="11,2 21,2 30,11 30,21 21,30 11,30 2,21 2,11" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'nonagon',             l:'Nonagon (9)',   svg:'<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.8" stroke-dasharray="4,2" fill="none"/><polygon points="16,3 24,6 29,13 27,22 20,28 12,28 5,22 3,13 8,6" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/>' },
          { t:'decagon',             l:'Decagon (10)',  svg:'<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/>' },
          { t:'dodecagon',           l:'Dodecagon (12)',svg:'<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2" stroke-dasharray="2,2" fill="currentColor" fill-opacity=".1"/>' },
          { t:'star-4',              l:'4-Point Star',  svg:'<polygon points="16,2 19,13 30,16 19,19 16,30 13,19 2,16 13,13" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".15"/>' },
          { t:'star-5',              l:'5-Point Star',  svg:'<polygon points="16,2 19,11 29,11 21,17 24,27 16,21 8,27 11,17 3,11 13,11" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".15"/>' },
          { t:'star-6',              l:'6-Point Star',  svg:'<polygon points="16,2 30,26 2,26" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/><polygon points="16,30 30,6 2,6" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/>' },
          { t:'star-8',              l:'8-Point Star',  svg:'<polygon points="16,2 19,10 27,5 22,13 30,16 22,19 27,27 19,22 16,30 13,22 5,27 10,19 2,16 10,13 5,5 13,10" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".15"/>' },
          { t:'pentagram',           l:'Pentagram',     svg:'<polygon points="16,2 24,28 3,12 29,12 8,28" stroke="currentColor" stroke-width="1.8" fill="none"/>' },
          { t:'cross-shape',         l:'Cross',         svg:'<polygon points="11,2 21,2 21,11 30,11 30,21 21,21 21,30 11,30 11,21 2,21 2,11 11,11" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".15"/>' },
          { t:'arrow-shape',         l:'Arrow',         svg:'<polygon points="2,11 18,11 18,5 30,16 18,27 18,21 2,21" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".15"/>' },
          { t:'vesica-piscis',       l:'Vesica Piscis', svg:'<circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="20" cy="16" r="10" stroke="currentColor" stroke-width="1.4" fill="none"/>' },
          { t:'yin-yang',            l:'Yin-Yang',      svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16,4 A6,6 0 0,1 16,16 A6,6 0 0,0 16,28 A12,12 0 0,1 16,4 Z" fill="currentColor"/>' },
          { t:'reuleaux-tri',        l:'Reuleaux Tri.', svg:'<path d="M16,4 Q28,12 28,26 Q16,28 4,26 Q4,12 16,4 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
        ]
      },

      // ── TAB 02: GEOMETRY & CONSTRUCTIONS ──
      {
        label: '02 Geometry & Constructions',
        cat: 'tab-02',
        shapes: [
          { t:'geom-point',          l:'Point P',       svg:'<circle cx="16" cy="16" r="5" fill="currentColor"/><text x="18" y="12" font-size="8" fill="currentColor">P</text>' },
          { t:'geom-line-segment',   l:'Segment AB',    svg:'<line x1="4" y1="20" x2="28" y2="12" stroke="currentColor" stroke-width="2.5"/><circle cx="4" cy="20" r="3" fill="currentColor"/><circle cx="28" cy="12" r="3" fill="currentColor"/>' },
          { t:'geom-infinite-line',  l:'Line ⟷',       svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="2.2"/><polygon points="28,16 22,12 22,20" fill="currentColor"/><polygon points="4,16 10,12 10,20" fill="currentColor"/>' },
          { t:'geom-ray',            l:'Ray AB ⟶',      svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="2.2"/><circle cx="4" cy="16" r="3" fill="currentColor"/><polygon points="28,16 22,12 22,20" fill="currentColor"/>' },
          { t:'geom-parallel',       l:'Parallel Lines',svg:'<line x1="4" y1="10" x2="28" y2="10" stroke="currentColor" stroke-width="2"/><line x1="4" y1="22" x2="28" y2="22" stroke="currentColor" stroke-width="2"/><polygon points="18,10 13,7 13,13" fill="currentColor"/><polygon points="18,22 13,19 13,25" fill="currentColor"/>' },
          { t:'geom-perpendicular',  l:'Perpendicular ⟂',svg:'<line x1="4" y1="24" x2="28" y2="24" stroke="currentColor" stroke-width="2"/><line x1="16" y1="6" x2="16" y2="24" stroke="currentColor" stroke-width="2"/><rect x="16" y="16" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none"/>' },
          { t:'geom-intersecting',   l:'Intersecting',  svg:'<line x1="4" y1="28" x2="28" y2="4" stroke="currentColor" stroke-width="2"/><line x1="4" y1="4" x2="28" y2="28" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="#facc15"/>' },
          { t:'geom-transversal',    l:'Transversal',   svg:'<line x1="4" y1="10" x2="28" y2="10" stroke="currentColor" stroke-width="1.8"/><line x1="4" y1="22" x2="28" y2="22" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="4" x2="24" y2="28" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'geom-acute-angle',    l:'Acute (45°)',   svg:'<line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="2"/><line x1="4" y1="26" x2="24" y2="6" stroke="currentColor" stroke-width="2"/><path d="M14,26 A10,10 0 0,0 12,18" stroke="#f59e0b" stroke-width="1.8" fill="none"/>' },
          { t:'geom-right-angle',    l:'Right (90°)',   svg:'<line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="2"/><line x1="4" y1="26" x2="4" y2="4" stroke="currentColor" stroke-width="2"/><rect x="4" y="16" width="10" height="10" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
          { t:'geom-obtuse-angle',   l:'Obtuse (135°)', svg:'<line x1="16" y1="26" x2="30" y2="26" stroke="currentColor" stroke-width="2"/><line x1="16" y1="26" x2="4" y2="10" stroke="currentColor" stroke-width="2"/><path d="M22,26 A8,8 0 0,0 12,18" stroke="#f59e0b" stroke-width="1.8" fill="none"/>' },
          { t:'geom-straight-angle', l:'Straight (180°)',svg:'<line x1="2" y1="20" x2="30" y2="20" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="20" r="3" fill="currentColor"/><path d="M24,20 A8,8 0 0,0 8,20" stroke="#f59e0b" stroke-width="1.8" fill="none"/>' },
          { t:'geom-reflex-angle',   l:'Reflex (>180°)',svg:'<line x1="16" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="2"/><line x1="16" y1="16" x2="6" y2="28" stroke="currentColor" stroke-width="2"/><path d="M22,16 A8,8 0 1,1 12,24" stroke="#f59e0b" stroke-width="1.8" fill="none"/>' },
          { t:'measure-angle',       l:'Angle Tool',    isTool:true, svg:'<line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="2"/><line x1="4" y1="26" x2="24" y2="6" stroke="currentColor" stroke-width="2"/><text x="17" y="19" font-size="7" font-weight="bold" fill="#f59e0b">θ°</text>' },
          { t:'compass',             l:'Compass',       isTool:true, svg:'<circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3,2" fill="none"/><line x1="16" y1="16" x2="27" y2="16" stroke="#eab308" stroke-width="1.5"/><circle cx="16" cy="16" r="2.2" fill="#ef4444"/><circle cx="27" cy="16" r="2" fill="#38bdf8"/>' },
          { t:'protractor',          l:'Protractor',    svg:'<path d="M4,20 A12,12 0 0,1 28,20 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><line x1="4" y1="20" x2="28" y2="20" stroke="currentColor" stroke-width="1.5"/>' },
        ]
      },

      // ── TAB 03: CIRCLE GEOMETRY ──
      {
        label: '03 Circle Geometry',
        cat: 'tab-03',
        shapes: [
          { t:'circ-concentric',     l:'Concentric',    svg:'<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="16" cy="16" r="7" stroke="currentColor" stroke-width="1.8" fill="none"/>' },
          { t:'circ-radius',         l:'Radius (r)',    svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="16" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/>' },
          { t:'circ-diameter',       l:'Diameter (d)',  svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/>' },
          { t:'circ-chord',          l:'Chord AB',      svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="7" y1="23" x2="27" y2="11" stroke="currentColor" stroke-width="2"/>' },
          { t:'circ-tangent',        l:'Tangent Line',  svg:'<circle cx="16" cy="13" r="10" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="2" y1="23" x2="30" y2="23" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="23" r="2.5" fill="currentColor"/>' },
          { t:'circ-secant',         l:'Secant Line',   svg:'<circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="2" y1="25" x2="30" y2="7" stroke="currentColor" stroke-width="2"/>' },
          { t:'circ-intersecting',   l:'Intersecting',  svg:'<circle cx="12" cy="16" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="20" cy="16" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
          { t:'circ-tangent-ext',    l:'Ext. Tangent',  svg:'<circle cx="11" cy="16" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="23" cy="16" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
        ]
      },

      // ── TAB 04: 3D GEOMETRIC SOLIDS ──
      {
        label: '04 3D Geometric Solids',
        cat: 'tab-04',
        shapes: [
          { t:'cube',                l:'Cube',          svg:'<rect x="4" y="10" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/><polygon points="4,10 10,4 28,4 28,22 22,28" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".07"/><line x1="22" y1="10" x2="28" y2="4" stroke="currentColor" stroke-width="1.8"/>' },
          { t:'cuboid',              l:'Cuboid',        svg:'<rect x="2" y="12" width="20" height="14" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/><polygon points="2,12 8,6 28,6 28,20 22,26" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".07"/><line x1="22" y1="12" x2="28" y2="6" stroke="currentColor" stroke-width="1.8"/>' },
          { t:'cylinder',            l:'Cylinder',      svg:'<ellipse cx="16" cy="7" rx="11" ry="4" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".12"/><ellipse cx="16" cy="25" rx="11" ry="4" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".12"/><line x1="5" y1="7" x2="5" y2="25" stroke="currentColor" stroke-width="1.8"/><line x1="27" y1="7" x2="27" y2="25" stroke="currentColor" stroke-width="1.8"/>' },
          { t:'hollowCylinder',      l:'Hollow Cyl.',   svg:'<ellipse cx="16" cy="7" rx="11" ry="4" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="16" cy="7" rx="5" ry="2" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3,2" fill="none"/><ellipse cx="16" cy="25" rx="11" ry="4" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/><line x1="5" y1="7" x2="5" y2="25" stroke="currentColor" stroke-width="1.8"/><line x1="27" y1="7" x2="27" y2="25" stroke="currentColor" stroke-width="1.8"/>' },
          { t:'cone',                l:'Cone',          svg:'<polygon points="16,3 28,29 4,29" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".12"/><ellipse cx="16" cy="29" rx="12" ry="3.5" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".15"/>' },
          { t:'frustum-cone',        l:'Frustum Cone',  svg:'<ellipse cx="16" cy="8" rx="7" ry="2.5" stroke="currentColor" stroke-width="1.5"/><ellipse cx="16" cy="26" rx="12" ry="4" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="8" x2="4" y2="26" stroke="currentColor" stroke-width="1.5"/><line x1="23" y1="8" x2="28" y2="26" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sphere',              l:'Sphere',        svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><ellipse cx="16" cy="16" rx="12" ry="4" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2" fill="none"/>' },
          { t:'hemisphere',          l:'Hemisphere',    svg:'<path d="M4,16 A12,12 0 0,1 28,16 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><ellipse cx="16" cy="16" rx="12" ry="3.5" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".15"/>' },
          { t:'prism',               l:'Tri. Prism',    svg:'<polygon points="16,3 28,26 4,26" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".12"/><polygon points="20,0 32,23 20,23" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3,2" fill="none"/><line x1="16" y1="3" x2="20" y2="0" stroke="currentColor" stroke-width="1.5"/><line x1="28" y1="26" x2="32" y2="23" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'pentPrism',           l:'Pent. Prism',   svg:'<polygon points="16,3 27,10 23,24 9,24 5,10" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".12"/><line x1="16" y1="3" x2="20" y2="0" stroke="currentColor" stroke-width="1.5"/><line x1="27" y1="10" x2="31" y2="7" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'hexPrism',            l:'Hex. Prism',    svg:'<polygon points="16,2 25,7 25,19 16,24 7,19 7,7" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".12"/><line x1="16" y1="2" x2="20" y2="0" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'pyramid',             l:'Sq. Pyramid',   svg:'<polygon points="16,2 30,28 2,28" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".12"/><polygon points="16,2 30,28 34,22" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".07"/>' },
          { t:'tetrahedron',         l:'Tetrahedron',   svg:'<polygon points="16,3 28,27 4,27" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="16" y1="3" x2="16" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="27" x2="16" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="28" y1="27" x2="16" y2="18" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'octahedron',          l:'Octahedron',    svg:'<polygon points="16,2 28,16 16,30 4,16" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'dodecahedron',        l:'Dodecahedron',  svg:'<polygon points="16,3 27,9 27,23 16,29 5,23 5,9" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="16" cy="16" r="6" stroke="currentColor" stroke-width="1.2" fill="none"/>' },
          { t:'icosahedron',         l:'Icosahedron',   svg:'<polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="16" y1="2" x2="16" y2="16" stroke="currentColor" stroke-width="1.2"/><line x1="28" y1="9" x2="16" y2="16" stroke="currentColor" stroke-width="1.2"/>' },
          { t:'torus-solid',         l:'Torus (Donut)', svg:'<ellipse cx="16" cy="16" r="12" rx="12" ry="7" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="16" cy="16" rx="5" ry="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
          { t:'ellipsoid-solid',     l:'Ellipsoid',     svg:'<ellipse cx="16" cy="16" rx="13" ry="8" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/><ellipse cx="16" cy="16" rx="13" ry="3" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3,2" fill="none"/>' },
        ]
      },

      // ── TAB 05: GRAPHS & CURVES ──
      {
        label: '05 Graphs & Mathematical Curves',
        cat: 'tab-05',
        shapes: [
          { t:'graph-cartesian',     l:'Cartesian Plane',svg:'<rect x="3" y="3" width="26" height="26" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2" fill="none"/><line x1="3" y1="16" x2="29" y2="16" stroke="currentColor" stroke-width="2"/><line x1="16" y1="3" x2="16" y2="29" stroke="currentColor" stroke-width="2"/>' },
          { t:'number-line',         l:'Number Line',   svg:'<line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="2.5"/><line x1="10" y1="11" x2="10" y2="21" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="11" x2="16" y2="21" stroke="currentColor" stroke-width="1.5"/><line x1="22" y1="11" x2="22" y2="21" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'curve-parabola',      l:'Parabola y=x²', svg:'<path d="M4,7 Q16,30 28,7" stroke="currentColor" stroke-width="2.5" fill="none"/><line x1="2" y1="26" x2="30" y2="26" stroke="currentColor" stroke-width="1"/><line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-width="1"/>' },
          { t:'curve-sine',          l:'Sine y=sin(x)', svg:'<path d="M2,16 Q9,4 16,16 T30,16" stroke="currentColor" stroke-width="2.5" fill="none"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1"/>' },
          { t:'curve-cosine',        l:'Cosine y=cos(x)',svg:'<path d="M2,6 Q9,26 16,26 T30,6" stroke="currentColor" stroke-width="2.5" fill="none"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1"/>' },
          { t:'curve-spiral',        l:'Spiral',        svg:'<path d="M16,16 A2,2 0 0,1 18,16 A4,4 0 0,1 14,16 A7,7 0 0,1 21,16 A10,10 0 0,1 11,16" stroke="currentColor" stroke-width="2" fill="none"/>' },
        ]
      },

      // ── TAB 06: TRANSFORMATIONS & SYMMETRY ──
      {
        label: '06 Transformations & Symmetry',
        cat: 'tab-06',
        shapes: [
          { t:'trans-translation',   l:'Translation',   svg:'<rect x="3" y="14" width="10" height="10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2,2"/><rect x="18" y="5" width="10" height="10" stroke="currentColor" stroke-width="2"/><line x1="13" y1="14" x2="18" y2="10" stroke="#f59e0b" stroke-width="2"/>' },
          { t:'trans-reflection',    l:'Reflection',    svg:'<line x1="16" y1="3" x2="16" y2="29" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,2"/><polygon points="6,8 13,16 6,24" stroke="currentColor" stroke-width="1.5"/><polygon points="26,8 19,16 26,24" stroke="currentColor" stroke-width="2"/>' },
          { t:'trans-rotation',      l:'Rotation',      svg:'<rect x="16" y="16" width="10" height="10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2,2"/><rect x="16" y="16" width="10" height="10" stroke="currentColor" stroke-width="2" transform="rotate(45 16 16)"/><circle cx="16" cy="16" r="3" fill="#facc15"/>' },
          { t:'trans-dilation',      l:'Dilation',      svg:'<polygon points="6,26 12,14 18,26" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2,2"/><polygon points="4,28 16,4 28,28" stroke="currentColor" stroke-width="2" fill="none"/>' },
          { t:'tess-square',         l:'Square Grid',   svg:'<rect x="4" y="4" width="11" height="11" stroke="currentColor" stroke-width="1.5"/><rect x="17" y="4" width="11" height="11" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="17" width="11" height="11" stroke="currentColor" stroke-width="1.5"/><rect x="17" y="17" width="11" height="11" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'tess-hexagon',        l:'Honeycomb',     svg:'<polygon points="9,4 17,4 21,11 17,18 9,18 5,11" stroke="currentColor" stroke-width="1.5"/><polygon points="17,11 25,11 29,18 25,25 17,25 13,18" stroke="currentColor" stroke-width="1.5"/>' },
        ]
      },

      // ── TAB 07: MEASUREMENT & INSTRUMENTS ──
      {
        label: '07 Measurement & Instruments',
        cat: 'tab-07',
        shapes: [
          { t:'measure-line',        l:'Ruler (cm)',    isTool:true, svg:'<line x1="4" y1="26" x2="28" y2="6" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round"/><circle cx="4" cy="26" r="2.5" fill="#0284c7"/><circle cx="28" cy="6" r="2.5" fill="#0284c7"/><rect x="11" y="11" width="10" height="7" rx="1.5" fill="#38bdf8" fill-opacity=".3"/><text x="16" y="16.5" text-anchor="middle" font-size="6" font-weight="bold" fill="#0284c7">cm</text>' },
          { t:'protractor',          l:'Protractor',    svg:'<path d="M4,20 A12,12 0 0,1 28,20 Z" stroke="#0284c7" stroke-width="2" fill="rgba(2,132,199,0.12)"/><line x1="4" y1="20" x2="28" y2="20" stroke="#0284c7" stroke-width="1.5"/>' },
          { t:'compass',             l:'Compass',       isTool:true, svg:'<circle cx="16" cy="16" r="11" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="3,2" fill="rgba(2,132,199,0.08)"/><line x1="16" y1="16" x2="27" y2="16" stroke="#eab308" stroke-width="1.5"/><circle cx="16" cy="16" r="2.2" fill="#ef4444"/><circle cx="27" cy="16" r="2" fill="#38bdf8"/>' },
          { t:'set-square-45',       l:'45° Set Square',svg:'<polygon points="4,4 4,28 28,28" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><polygon points="9,14 9,23 18,23" stroke="currentColor" stroke-width="1.5" fill="#ffffff"/>' },
          { t:'set-square-30-60',    l:'30°-60° Square',svg:'<polygon points="4,4 4,28 20,28" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><polygon points="8,12 8,24 14,24" stroke="currentColor" stroke-width="1.5" fill="#ffffff"/>' },
          { t:'area-solver',         l:'Find Area',     isTool:true, svg:'<polygon points="6,24 10,8 24,6 27,20 18,26" stroke="#38bdf8" stroke-width="2" fill="rgba(56,189,248,0.18)"/><text x="17" y="18" font-size="6.5" font-weight="bold" fill="#38bdf8" text-anchor="middle">Area</text>' },
        ]
      },

      // ── TAB 08: FRACTIONS & NUMBER MODELS ──
      {
        label: '08 Fractions & Number Models',
        cat: 'tab-08',
        shapes: [
          { t:'fraction-bar',        l:'Fraction Bar',  svg:'<rect x="2" y="8" width="28" height="16" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="9" y1="8" x2="9" y2="24" stroke="currentColor"/><line x1="16" y1="8" x2="16" y2="24" stroke="currentColor"/><line x1="23" y1="8" x2="23" y2="24" stroke="currentColor"/><rect x="2" y="8" width="7" height="16" fill="currentColor" fill-opacity=".3"/>' },
          { t:'fraction-circle',     l:'Fraction Pie',  svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16,16 L16,4 A12,12 0 0,1 28,16 Z" fill="currentColor" fill-opacity=".3"/><line x1="4" y1="16" x2="28" y2="16" stroke="currentColor"/><line x1="16" y1="4" x2="16" y2="28" stroke="currentColor"/>' },
          { t:'decimal-grid-100',    l:'Decimal (100)', svg:'<rect x="4" y="4" width="24" height="24" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="10" y1="4" x2="10" y2="28" stroke="currentColor" stroke-dasharray="1,1"/><line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-dasharray="1,1"/><line x1="22" y1="4" x2="22" y2="28" stroke="currentColor" stroke-dasharray="1,1"/><rect x="4" y="4" width="12" height="12" fill="currentColor" fill-opacity=".3"/>' },
          { t:'ten-frame',           l:'Ten Frame',     svg:'<rect x="2" y="8" width="28" height="16" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor"/><line x1="8" y1="8" x2="8" y2="24" stroke="currentColor"/><line x1="14" y1="8" x2="14" y2="24" stroke="currentColor"/><line x1="20" y1="8" x2="20" y2="24" stroke="currentColor"/><line x1="26" y1="8" x2="26" y2="24" stroke="currentColor"/><circle cx="5" cy="12" r="2" fill="currentColor"/>' },
        ]
      },

      // ── TAB 09: STATISTICS & PROBABILITY ──
      {
        label: '09 Statistics & Probability',
        cat: 'tab-09',
        shapes: [
          { t:'stat-barchart',       l:'Bar Chart',     svg:'<line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" stroke-width="2"/><line x1="4" y1="4" x2="4" y2="28" stroke="currentColor" stroke-width="2"/><rect x="7" y="16" width="5" height="12" fill="currentColor" fill-opacity=".3" stroke="currentColor"/><rect x="14" y="8" width="5" height="20" fill="currentColor" fill-opacity=".3" stroke="currentColor"/><rect x="21" y="12" width="5" height="16" fill="currentColor" fill-opacity=".3" stroke="currentColor"/>' },
          { t:'stat-normal-curve',   l:'Normal Curve',  svg:'<path d="M2,26 Q12,25 16,8 Q20,25 30,26" stroke="currentColor" stroke-width="2.2" fill="currentColor" fill-opacity=".15"/><line x1="2" y1="26" x2="30" y2="26" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'live-graphs-tool',    l:'Graph Engine',  isMathGraph:true, svg:'<polyline points="4,24 10,14 17,20 23,8 28,12" stroke="#38bdf8" stroke-width="2.5" fill="none"/><circle cx="10" cy="14" r="2.5" fill="#facc15"/><circle cx="23" cy="8" r="2.5" fill="#facc15"/><line x1="2" y1="26" x2="30" y2="26" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="4" x2="2" y2="26" stroke="currentColor" stroke-width="1.5"/>' },
        ]
      },

      // ── TAB 10: ADVANCED MATHEMATICS & VECTORS ──
      {
        label: '10 Advanced Mathematics & Vectors',
        cat: 'tab-10',
        shapes: [
          { t:'math-vector-2d',      l:'2D Vector v⃗',   svg:'<line x1="4" y1="26" x2="26" y2="8" stroke="currentColor" stroke-width="2.5"/><polygon points="26,8 19,10 24,15" fill="currentColor"/><line x1="4" y1="26" x2="26" y2="26" stroke="currentColor" stroke-dasharray="2,2"/><line x1="26" y1="26" x2="26" y2="8" stroke="currentColor" stroke-dasharray="2,2"/>' },
          { t:'math-matrix-2x2',     l:'Matrix [2×2]',  svg:'<path d="M8,4 L4,4 L4,28 L8,28" stroke="currentColor" stroke-width="2" fill="none"/><path d="M24,4 L28,4 L28,28 L24,28" stroke="currentColor" stroke-width="2" fill="none"/><text x="8" y="14" font-size="8" fill="currentColor">a</text><text x="18" y="14" font-size="8" fill="currentColor">b</text><text x="8" y="24" font-size="8" fill="currentColor">c</text><text x="18" y="24" font-size="8" fill="currentColor">d</text>' },
          { t:'math-integral-sign',  l:'Integral ∫',    svg:'<path d="M20,6 C16,4 12,6 12,12 L12,20 C12,26 8,28 4,26" stroke="currentColor" stroke-width="2.5" fill="none"/>' },
          { t:'math-summation-sign', l:'Sigma ∑',       svg:'<polyline points="24,6 8,6 16,16 8,26 24,26" stroke="currentColor" stroke-width="2.5" fill="none"/>' },
        ]
      },

      // ── TAB 11: TABLES & TEACHING DIAGRAMS ──
      {
        label: '11 Tables & Teaching Diagrams',
        cat: 'tab-11',
        shapes: [
          { t:'diag-venn-2',         l:'2-Set Venn',    svg:'<circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/><circle cx="20" cy="16" r="10" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity=".1"/>' },
          { t:'diag-clock',          l:'Clock Face',    svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2" fill="none"/><line x1="16" y1="16" x2="16" y2="8" stroke="currentColor" stroke-width="2"/><line x1="16" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="currentColor"/>' },
          { t:'diag-flow-process',   l:'Flow: Process', svg:'<rect x="3" y="8" width="26" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'diag-flow-decision',  l:'Flow: Decision',svg:'<polygon points="16,4 28,16 16,28 4,16" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
          { t:'diag-flow-terminus',  l:'Flow: Start/End',svg:'<rect x="3" y="9" width="26" height="14" rx="7" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/>' },
        ]
      },

      // ── TAB 12: CUSTOM & SMART SHAPES ──
      {
        label: '12 Custom & Smart Shapes',
        cat: 'tab-12',
        shapes: [
          { t:'smart-polygon',       l:'Smart N-gon',   svg:'<polygon points="16,3 27,9 27,23 16,29 5,23 5,9" stroke="#38bdf8" stroke-width="2" fill="rgba(56,189,248,0.12)"/><circle cx="16" cy="3" r="2.5" fill="#facc15"/><circle cx="27" cy="9" r="2.5" fill="#facc15"/><circle cx="27" cy="23" r="2.5" fill="#facc15"/>' },
          { t:'smart-star',          l:'Smart Star',    svg:'<polygon points="16,2 19,11 29,11 21,17 24,27 16,21 8,27 11,17 3,11 13,11" stroke="#38bdf8" stroke-width="2" fill="rgba(56,189,248,0.15)"/>' },
          { t:'area-solver',         l:'Freehand Area', isTool:true, svg:'<polygon points="6,24 10,8 24,6 27,20 18,26" stroke="#38bdf8" stroke-width="2" fill="rgba(56,189,248,0.18)"/><text x="17" y="18" font-size="6.5" font-weight="bold" fill="#38bdf8" text-anchor="middle">Area</text>' },
        ]
      }
    ];

    
    const ENGINEERING_SECTIONS = [
      // ── 01. TECHNICAL DRAWING & DRAFTING (ISO 128 / ASME Y14) ──
      {
        label: '📐 Technical Drawing & Drafting (ISO 128 / ASME Y14)',
        cat: 'eng-drafting',
        shapes: [
          { t:'eng-line-visible',       l:'Visible Line',        svg:'<line x1="3" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="3"/>' },
          { t:'eng-line-hidden',        l:'Hidden Line',         svg:'<line x1="3" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3"/>' },
          { t:'eng-line-center',        l:'Center Line',         svg:'<line x1="3" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="8,2,2,2"/>' },
          { t:'eng-line-cutting',       l:'Cutting Plane',       svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="#ef4444" stroke-width="2.5"/><polygon points="8,10 4,16 8,16" fill="#ef4444"/><polygon points="24,10 28,16 24,16" fill="#ef4444"/>' },
          { t:'eng-line-break',         l:'Break Line',          svg:'<polyline points="3,16 11,16 13,8 16,24 18,16 29,16" stroke="#38bdf8" stroke-width="2" fill="none"/>' },
          { t:'eng-dim-linear',         l:'Linear Dim',          svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="1.5"/><polygon points="4,16 9,13 9,19" fill="#38bdf8"/><polygon points="28,16 23,13 23,19" fill="#38bdf8"/><text x="16" y="12" font-size="7" fill="#facc15" text-anchor="middle">50.0</text>' },
          { t:'eng-dim-diameter',       l:'Diameter ⌀',          svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="6" y1="24" x2="26" y2="8" stroke="#facc15" stroke-width="1.5"/><text x="16" y="19" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">⌀</text>' },
          { t:'eng-dim-radius',         l:'Radius R',            svg:'<path d="M16,26 A10,10 0 0,1 26,16" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="16" y1="26" x2="24" y2="18" stroke="#facc15" stroke-width="1.5"/><circle cx="16" cy="26" r="1.5" fill="#facc15"/><text x="19" y="19" font-size="7" fill="#facc15">R</text>' },
          { t:'eng-hole-callout',       l:'Hole Callout',        svg:'<circle cx="12" cy="16" r="6" stroke="#38bdf8" stroke-width="1.5" fill="none"/><path d="M17,11 L28,5" stroke="#facc15" stroke-width="1.5"/><text x="24" y="18" font-size="6.5" fill="#facc15">⌴</text>' },
          { t:'eng-proj-first-angle',   l:'1st Angle Proj',      svg:'<polygon points="6,10 16,13 16,19 6,22" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="23" cy="16" r="6" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="23" cy="16" r="2.5" stroke="#38bdf8" stroke-width="1" fill="none"/>' },
          { t:'eng-proj-third-angle',   l:'3rd Angle Proj',      svg:'<circle cx="9" cy="16" r="6" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="9" cy="16" r="2.5" stroke="#38bdf8" stroke-width="1" fill="none"/><polygon points="17,13 27,10 27,22 17,19" stroke="#38bdf8" stroke-width="1.5" fill="none"/>' },
          { t:'eng-gdt-flatness',       l:'GD&T Flatness',       svg:'<rect x="3" y="10" width="26" height="12" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.1)"/><line x1="12" y1="10" x2="12" y2="22" stroke="#38bdf8" stroke-width="1.2"/><polygon points="5,18 8,14 11,14 8,18" fill="#facc15"/><text x="20" y="19" font-size="6.5" fill="#fff" text-anchor="middle">.02</text>' },
          { t:'eng-gdt-perpendicular',  l:'GD&T Perpend.',       svg:'<rect x="3" y="10" width="26" height="12" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.1)"/><line x1="12" y1="10" x2="12" y2="22" stroke="#38bdf8" stroke-width="1.2"/><text x="7.5" y="19" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">⟂</text><text x="20" y="19" font-size="6" fill="#fff" text-anchor="middle">.05 A</text>' },
          { t:'eng-gdt-parallelism',    l:'GD&T Parallel.',      svg:'<rect x="3" y="10" width="26" height="12" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.1)"/><line x1="12" y1="10" x2="12" y2="22" stroke="#38bdf8" stroke-width="1.2"/><text x="7.5" y="19" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">⫽</text><text x="20" y="19" font-size="6" fill="#fff" text-anchor="middle">.03 B</text>' },
          { t:'eng-gdt-position',       l:'GD&T Position',       svg:'<rect x="3" y="10" width="26" height="12" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.1)"/><line x1="12" y1="10" x2="12" y2="22" stroke="#38bdf8" stroke-width="1.2"/><text x="7.5" y="19" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">⌖</text><text x="20" y="19" font-size="6" fill="#fff" text-anchor="middle">⌀.1Ⓜ</text>' },
          { t:'eng-gdt-runout',         l:'GD&T Runout',         svg:'<rect x="3" y="10" width="26" height="12" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.1)"/><line x1="12" y1="10" x2="12" y2="22" stroke="#38bdf8" stroke-width="1.2"/><text x="7.5" y="19" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">↗</text><text x="20" y="19" font-size="6" fill="#fff" text-anchor="middle">.05 A</text>' },
          { t:'eng-datum-feature',      l:'Datum Feature',       svg:'<rect x="15" y="7" width="13" height="12" stroke="#38bdf8" stroke-width="1.5" fill="none"/><text x="21.5" y="16" font-size="7.5" fill="#facc15" font-weight="bold" text-anchor="middle">A</text><line x1="15" y1="13" x2="9" y2="13" stroke="#38bdf8" stroke-width="1.5"/><polygon points="9,13 4,9 4,17" fill="#38bdf8"/>' },
          { t:'eng-weld-fillet',        l:'Fillet Weld',         svg:'<line x1="3" y1="16" x2="22" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="22" y1="16" x2="29" y2="9" stroke="#38bdf8" stroke-width="1.8"/><polygon points="10,16 10,9 17,16" stroke="#facc15" stroke-width="1.2" fill="#facc15"/>' },
          { t:'eng-weld-vgroove',       l:'V-Groove Weld',       svg:'<line x1="3" y1="16" x2="22" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="22" y1="16" x2="29" y2="9" stroke="#38bdf8" stroke-width="1.8"/><line x1="9" y1="9" x2="13" y2="16" stroke="#facc15" stroke-width="1.5"/><line x1="17" y1="9" x2="13" y2="16" stroke="#facc15" stroke-width="1.5"/>' },
          { t:'eng-surface-finish',     l:'Surface Ra',          svg:'<polyline points="6,9 13,23 23,7" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="23" y1="7" x2="28" y2="7" stroke="#38bdf8" stroke-width="1.8"/><text x="17" y="15" font-size="6" fill="#facc15">Ra</text>' },
        ]
      },

      // ── 02. ELECTRICAL ENGINEERING & POWER (IEC 60617 / IEEE 315) ──
      {
        label: '⚡ Electrical Engineering & Power (IEC 60617 / IEEE 315)',
        cat: 'eng-electrical',
        shapes: [
          { t:'eng-resistor-iec',       l:'Resistor (IEC)',      svg:'<line x1="2" y1="16" x2="7" y2="16" stroke="#38bdf8" stroke-width="1.8"/><rect x="7" y="11" width="18" height="10" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="25" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-resistor-ieee',      l:'Resistor (IEEE)',     svg:'<polyline points="3,16 7,16 9,10 13,22 17,10 21,22 23,16 29,16" stroke="#38bdf8" stroke-width="1.8" fill="none"/>' },
          { t:'eng-potentiometer',      l:'Potentiometer',       svg:'<rect x="7" y="12" width="18" height="8" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="2" y1="16" x2="7" y2="16" stroke="#38bdf8" stroke-width="1.5"/><line x1="25" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="1.5"/><line x1="16" y1="28" x2="16" y2="21" stroke="#facc15" stroke-width="1.5"/><polygon points="16,20 13,23 19,23" fill="#facc15"/>' },
          { t:'eng-capacitor-pol',      l:'Capacitor Pol.',      svg:'<line x1="3" y1="16" x2="13" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="13" y1="9" x2="13" y2="23" stroke="#38bdf8" stroke-width="2.2"/><path d="M19,9 Q16,16 19,23" stroke="#38bdf8" stroke-width="2" fill="none"/><line x1="19" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/><text x="7" y="12" font-size="7" fill="#facc15">+</text>' },
          { t:'eng-transformer-iron',   l:'Iron Transformer',   svg:'<circle cx="12" cy="16" r="6" stroke="#38bdf8" stroke-width="1.8" fill="none"/><circle cx="20" cy="16" r="6" stroke="#38bdf8" stroke-width="1.8" fill="none"/>' },
          { t:'eng-generator-3ph',      l:'3-Phase Gen (G)',     svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.8" fill="none"/><text x="16" y="16" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">G</text><text x="16" y="23" font-size="6" fill="#38bdf8" text-anchor="middle">3~</text>' },
          { t:'eng-motor-induction',    l:'3-Phase Motor (M)',   svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.8" fill="none"/><text x="16" y="16" font-size="8" fill="#facc15" font-weight="bold" text-anchor="middle">M</text><text x="16" y="23" font-size="6" fill="#38bdf8" text-anchor="middle">3~</text>' },
          { t:'eng-transformer-power',  l:'Power Transf Δ-Y',    svg:'<circle cx="16" cy="12" r="7" stroke="#38bdf8" stroke-width="1.8" fill="none"/><circle cx="16" cy="20" r="7" stroke="#38bdf8" stroke-width="1.8" fill="none"/><text x="16" y="14" font-size="6" fill="#facc15" text-anchor="middle">Δ</text><text x="16" y="22" font-size="6" fill="#facc15" text-anchor="middle">Y</text>' },
          { t:'eng-busbar',             l:'Busbar (Heavy)',      svg:'<line x1="3" y1="16" x2="29" y2="16" stroke="#facc15" stroke-width="4.5"/><line x1="10" y1="16" x2="10" y2="26" stroke="#38bdf8" stroke-width="1.8"/><line x1="22" y1="16" x2="22" y2="6" stroke="#38bdf8" stroke-width="1.8"/><circle cx="10" cy="16" r="2" fill="#fff"/><circle cx="22" cy="16" r="2" fill="#fff"/>' },
          { t:'eng-breaker-hv',         l:'HV Breaker (CB)',     svg:'<line x1="3" y1="16" x2="11" y2="16" stroke="#38bdf8" stroke-width="1.8"/><rect x="11" y="11" width="10" height="10" stroke="#ef4444" stroke-width="1.8" fill="rgba(239,68,68,0.2)"/><line x1="11" y1="11" x2="21" y2="21" stroke="#ef4444" stroke-width="1.8"/><line x1="21" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-isolator-switch',    l:'Isolator Switch',     svg:'<line x1="3" y1="16" x2="11" y2="16" stroke="#38bdf8" stroke-width="1.8"/><circle cx="11" cy="16" r="1.5" stroke="#38bdf8" stroke-width="1.2" fill="none"/><line x1="12" y1="16" x2="21" y2="8" stroke="#facc15" stroke-width="1.8"/><circle cx="21" cy="16" r="1.5" stroke="#38bdf8" stroke-width="1.2" fill="none"/><line x1="21" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-earth-ground',       l:'Earth Ground PE',     svg:'<line x1="16" y1="4" x2="16" y2="16" stroke="#38bdf8" stroke-width="2"/><line x1="7" y1="16" x2="25" y2="16" stroke="#38bdf8" stroke-width="2.5"/><line x1="10" y1="20" x2="22" y2="20" stroke="#38bdf8" stroke-width="2"/><line x1="13" y1="24" x2="19" y2="24" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-lightning-arrester', l:'Surge Arrester',      svg:'<rect x="11" y="8" width="10" height="14" stroke="#facc15" stroke-width="1.8" fill="rgba(250,204,21,0.15)"/><polygon points="17,11 14,16 17,16 15,20 19,15 16,15" fill="#facc15"/><line x1="16" y1="3" x2="16" y2="8" stroke="#38bdf8" stroke-width="1.8"/><line x1="16" y1="22" x2="16" y2="28" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-trans-tower',        l:'Trans. Tower',        svg:'<polygon points="12,28 15,10 17,10 20,28" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="7" y1="15" x2="25" y2="15" stroke="#38bdf8" stroke-width="1.8"/><line x1="10" y1="21" x2="22" y2="21" stroke="#38bdf8" stroke-width="1.5"/>' },
          { t:'eng-contact-no',         l:'NO Contact',          svg:'<line x1="3" y1="16" x2="10" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="10" y1="16" x2="22" y2="9" stroke="#38bdf8" stroke-width="1.8"/><line x1="22" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-contact-nc',         l:'NC Contact',          svg:'<line x1="3" y1="16" x2="11" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="11" y1="16" x2="21" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="13" y1="10" x2="19" y2="22" stroke="#ef4444" stroke-width="1.8"/><line x1="21" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-relay-coil',         l:'Relay Coil (K)',      svg:'<rect x="7" y="10" width="18" height="12" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><line x1="7" y1="10" x2="25" y2="22" stroke="#38bdf8" stroke-width="1.5"/><line x1="2" y1="16" x2="7" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="25" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-estop-btn',          l:'E-Stop Button',       svg:'<circle cx="16" cy="14" r="8" fill="#ef4444" stroke="#fff" stroke-width="1.5"/><rect x="13" y="20" width="6" height="7" fill="#facc15"/><line x1="16" y1="9" x2="16" y2="19" stroke="#fff" stroke-width="2"/>' },
        ]
      },

      // ── 03. ELECTRONICS, SEMICONDUCTORS & LOGIC GATES (IEEE 91 / IEC) ──
      {
        label: '🔌 Electronics, Semiconductors & Logic (IEEE 91 / IEC)',
        cat: 'eng-electronics',
        shapes: [
          { t:'eng-opamp',              l:'Op-Amp (741)',        svg:'<polygon points="6,6 24,16 6,26" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.1)"/><text x="9" y="12" font-size="8" fill="#facc15">-</text><text x="9" y="23" font-size="8" fill="#facc15">+</text><line x1="24" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-comparator',         l:'Comparator',          svg:'<polygon points="6,6 24,16 6,26" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.1)"/><text x="9" y="12" font-size="8" fill="#facc15">+</text><text x="9" y="23" font-size="8" fill="#facc15">-</text><line x1="24" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-timer-555',          l:'555 Timer IC',        svg:'<rect x="7" y="6" width="18" height="20" rx="2" stroke="#38bdf8" stroke-width="1.8" fill="rgba(15,23,42,0.8)"/><text x="16" y="18" font-size="7" fill="#facc15" font-weight="bold" text-anchor="middle">555</text><circle cx="11" cy="9" r="1.2" fill="#fff"/>' },
          { t:'eng-crystal-osc',        l:'Quartz Crystal',      svg:'<line x1="3" y1="16" x2="10" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="10" y1="10" x2="10" y2="22" stroke="#38bdf8" stroke-width="2"/><rect x="13" y="10" width="6" height="12" stroke="#facc15" stroke-width="1.5" fill="none"/><line x1="22" y1="10" x2="22" y2="22" stroke="#38bdf8" stroke-width="2"/><line x1="22" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-transistor-pnp',     l:'PNP Transistor',      svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="13" y1="10" x2="13" y2="22" stroke="#38bdf8" stroke-width="2"/><line x1="5" y1="16" x2="13" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="13" y1="12" x2="22" y2="7" stroke="#38bdf8" stroke-width="1.8"/><line x1="13" y1="20" x2="22" y2="25" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-mosfet-nchan',       l:'N-MOSFET',            svg:'<rect x="8" y="10" width="4" height="12" fill="#38bdf8"/><line x1="4" y1="16" x2="8" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="15" y1="9" x2="24" y2="9" stroke="#38bdf8" stroke-width="1.8"/><line x1="15" y1="23" x2="24" y2="23" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-mosfet-pchan',       l:'P-MOSFET',            svg:'<rect x="8" y="10" width="4" height="12" fill="#facc15"/><line x1="4" y1="16" x2="8" y2="16" stroke="#facc15" stroke-width="1.8"/><line x1="15" y1="9" x2="24" y2="9" stroke="#38bdf8" stroke-width="1.8"/><line x1="15" y1="23" x2="24" y2="23" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-igbt',               l:'IGBT Transistor',     svg:'<rect x="7" y="10" width="3" height="12" fill="#38bdf8"/><line x1="12" y1="10" x2="12" y2="22" stroke="#38bdf8" stroke-width="2"/><line x1="12" y1="12" x2="22" y2="7" stroke="#38bdf8" stroke-width="1.8"/><line x1="12" y1="20" x2="22" y2="25" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-scr-thyristor',      l:'SCR Thyristor',       svg:'<polygon points="11,9 11,23 21,16" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.15)"/><line x1="21" y1="9" x2="21" y2="23" stroke="#38bdf8" stroke-width="2"/><line x1="16" y1="20" x2="12" y2="26" stroke="#facc15" stroke-width="1.8"/>' },
          { t:'eng-bridge-rectifier',   l:'Bridge Rectifier',    svg:'<polygon points="16,5 27,16 16,27 5,16" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.1)"/><text x="16" y="11" font-size="6" fill="#facc15" text-anchor="middle">~</text><text x="16" y="24" font-size="6" fill="#facc15" text-anchor="middle">~</text><text x="9" y="18" font-size="6" fill="#38bdf8">+</text><text x="21" y="18" font-size="6" fill="#38bdf8">-</text>' },
          { t:'eng-optocoupler',        l:'Optocoupler',         svg:'<rect x="5" y="8" width="22" height="16" rx="2" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="16" y1="8" x2="16" y2="24" stroke="#38bdf8" stroke-dasharray="2,2"/><line x1="12" y1="13" x2="18" y2="17" stroke="#facc15" stroke-width="1.2"/><polygon points="18,17 15,15 17,14" fill="#facc15"/>' },
          { t:'eng-logic-and',          l:'AND Gate',            svg:'<path d="M6,7 L15,7 A9,9 0 0,1 15,25 L6,25 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><line x1="2" y1="11" x2="6" y2="11" stroke="#38bdf8" stroke-width="1.8"/><line x1="2" y1="21" x2="6" y2="21" stroke="#38bdf8" stroke-width="1.8"/><line x1="24" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-logic-or',           l:'OR Gate',             svg:'<path d="M6,7 Q14,7 23,16 Q14,25 6,25 Q11,16 6,7 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><line x1="2" y1="11" x2="8" y2="11" stroke="#38bdf8" stroke-width="1.8"/><line x1="2" y1="21" x2="8" y2="21" stroke="#38bdf8" stroke-width="1.8"/><line x1="23" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-logic-not',          l:'NOT Inverter',        svg:'<polygon points="7,7 20,16 7,25" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><circle cx="23" cy="16" r="2.5" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="2" y1="16" x2="7" y2="16" stroke="#38bdf8" stroke-width="1.8"/><line x1="25.5" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-logic-nand',         l:'NAND Gate',           svg:'<path d="M5,7 L14,7 A9,9 0 0,1 14,25 L5,25 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><circle cx="25" cy="16" r="2" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="27" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-logic-nor',          l:'NOR Gate',            svg:'<path d="M5,7 Q13,7 21,16 Q13,25 5,25 Q10,16 5,7 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><circle cx="24" cy="16" r="2" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="26" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-logic-xor',          l:'XOR Gate',            svg:'<path d="M8,7 Q16,7 24,16 Q16,25 8,25 Q13,16 8,7 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><path d="M4,7 Q9,16 4,25" stroke="#38bdf8" stroke-width="1.8" fill="none"/>' },
          { t:'eng-logic-xnor',         l:'XNOR Gate',           svg:'<path d="M8,7 Q15,7 22,16 Q15,25 8,25 Q12,16 8,7 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><path d="M4,7 Q8,16 4,25" stroke="#38bdf8" stroke-width="1.8" fill="none"/><circle cx="25" cy="16" r="2" stroke="#38bdf8" stroke-width="1.5" fill="none"/>' },
          { t:'eng-flipflop-d',         l:'D Flip-Flop',         svg:'<rect x="7" y="6" width="18" height="20" stroke="#38bdf8" stroke-width="1.8" fill="rgba(15,23,42,0.8)"/><text x="10" y="12" font-size="6" fill="#facc15">D</text><polyline points="7,18 10,20 7,22" stroke="#38bdf8" stroke-width="1.5" fill="none"/><text x="21" y="12" font-size="6" fill="#38bdf8">Q</text>' },
        ]
      },

      // ── 04. MECHANICAL & MACHINE ELEMENTS (ISO 128 / ISO 1219) ──
      {
        label: '⚙️ Mechanical & Machine Elements (ISO 128)',
        cat: 'eng-mechanical',
        shapes: [
          { t:'eng-gear-spur',          l:'Spur Gear',           svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="none"/><circle cx="16" cy="16" r="4" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="16" y1="4" x2="16" y2="6" stroke="#38bdf8" stroke-width="2"/><line x1="16" y1="26" x2="16" y2="28" stroke="#38bdf8" stroke-width="2"/><line x1="4" y1="16" x2="6" y2="16" stroke="#38bdf8" stroke-width="2"/><line x1="26" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'eng-gear-bevel',         l:'Bevel Gear (90°)',    svg:'<polygon points="6,26 14,14 18,18 10,26" stroke="#38bdf8" stroke-width="1.5" fill="none"/><polygon points="26,6 14,14 18,18 26,10" stroke="#facc15" stroke-width="1.5" fill="none"/>' },
          { t:'eng-rack-pinion',        l:'Rack & Pinion',       svg:'<circle cx="16" cy="11" r="7" stroke="#38bdf8" stroke-width="1.5" fill="none"/><rect x="3" y="22" width="26" height="6" stroke="#facc15" stroke-width="1.5" fill="none"/>' },
          { t:'eng-bearing-ball',       l:'Ball Bearing',        svg:'<circle cx="16" cy="16" r="12" stroke="#38bdf8" stroke-width="1.8" fill="none"/><circle cx="16" cy="16" r="6" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="16" cy="7" r="2" fill="#facc15"/><circle cx="16" cy="25" r="2" fill="#facc15"/><circle cx="7" cy="16" r="2" fill="#facc15"/><circle cx="25" cy="16" r="2" fill="#facc15"/>' },
          { t:'eng-pulley-belt',        l:'Pulley & Belt',       svg:'<circle cx="9" cy="16" r="6" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="23" cy="16" r="6" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="9" y1="10" x2="23" y2="10" stroke="#facc15" stroke-width="1.5"/><line x1="9" y1="22" x2="23" y2="22" stroke="#facc15" stroke-width="1.5"/>' },
          { t:'eng-chain-sprocket',     l:'Chain & Sprocket',    svg:'<circle cx="9" cy="16" r="6" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="2,2" fill="none"/><circle cx="23" cy="16" r="6" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="2,2" fill="none"/><line x1="9" y1="10" x2="23" y2="10" stroke="#facc15" stroke-width="1.8" stroke-dasharray="3,2"/><line x1="9" y1="22" x2="23" y2="22" stroke="#facc15" stroke-width="1.8" stroke-dasharray="3,2"/>' },
          { t:'eng-spring-damper',      l:'Spring-Damper',       svg:'<polyline points="8,4 8,8 5,11 11,14 5,17 11,20 8,23 8,28" stroke="#38bdf8" stroke-width="1.5" fill="none"/><rect x="18" y="11" width="8" height="12" stroke="#facc15" stroke-width="1.2" fill="none"/><line x1="22" y1="4" x2="22" y2="17" stroke="#facc15" stroke-width="1.5"/>' },
          { t:'eng-shaft-coupling',     l:'Shaft Coupling',      svg:'<line x1="3" y1="16" x2="13" y2="16" stroke="#38bdf8" stroke-width="3"/><rect x="13" y="9" width="6" height="14" stroke="#facc15" stroke-width="1.5" fill="none"/><line x1="19" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="3"/>' },
          { t:'eng-disc-brake',         l:'Disc Brake & Caliper',svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="4" stroke="#38bdf8" stroke-width="1" fill="none"/><path d="M16,5 A11,11 0 0,1 27,16 L22,16 A6,6 0 0,0 16,10 Z" fill="#ef4444" stroke="#fff" stroke-width="1"/>' },
          { t:'eng-joint-revolute',     l:'Revolute Pin Joint',  svg:'<circle cx="16" cy="16" r="5" stroke="#38bdf8" stroke-width="2" fill="none"/><line x1="16" y1="5" x2="16" y2="11" stroke="#38bdf8" stroke-width="2"/><line x1="16" y1="21" x2="16" y2="27" stroke="#38bdf8" stroke-width="2"/><circle cx="16" cy="16" r="1.8" fill="#facc15"/>' },
          { t:'eng-four-bar',           l:'4-Bar Linkage',       svg:'<polyline points="7,23 11,10 23,12 25,23" stroke="#38bdf8" stroke-width="2" fill="none"/><circle cx="7" cy="23" r="2.5" fill="#facc15"/><circle cx="11" cy="10" r="2.5" fill="#facc15"/><circle cx="23" cy="12" r="2.5" fill="#facc15"/><circle cx="25" cy="23" r="2.5" fill="#facc15"/>' },
        ]
      },

      // ── 05. HYDRAULICS & PNEUMATICS (ISO 1219) ──
      {
        label: '💧 Hydraulics & Pneumatics (ISO 1219)',
        cat: 'eng-fluid',
        shapes: [
          { t:'eng-hyd-pump',           l:'Hydraulic Pump',      svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="none"/><polygon points="16,6 12,12 20,12" fill="#38bdf8"/><line x1="16" y1="6" x2="16" y2="2" stroke="#38bdf8" stroke-width="1.8"/><line x1="16" y1="26" x2="16" y2="30" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-air-compressor',     l:'Air Compressor',      svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="none"/><polygon points="16,6 12,12 20,12" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="16" y1="6" x2="16" y2="2" stroke="#38bdf8" stroke-width="1.8"/><line x1="16" y1="26" x2="16" y2="30" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-cyl-single',         l:'Single-Acting Cyl.',  svg:'<rect x="5" y="9" width="16" height="14" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="13" y1="9" x2="13" y2="23" stroke="#38bdf8" stroke-width="2.5"/><line x1="13" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="2.5"/>' },
          { t:'eng-cyl-double',         l:'Double-Acting Cyl.',  svg:'<rect x="4" y="9" width="18" height="14" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="12" y1="9" x2="12" y2="23" stroke="#38bdf8" stroke-width="2.5"/><line x1="12" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="2.5"/><line x1="7" y1="23" x2="7" y2="28" stroke="#38bdf8" stroke-width="1.5"/><line x1="19" y1="23" x2="19" y2="28" stroke="#38bdf8" stroke-width="1.5"/>' },
          { t:'eng-valv-dir-4-2',       l:'4/2 DCV Valve',       svg:'<rect x="5" y="9" width="11" height="14" stroke="#38bdf8" stroke-width="1.5" fill="none"/><rect x="16" y="9" width="11" height="14" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="7" y1="21" x2="14" y2="11" stroke="#facc15" stroke-width="1.2"/>' },
          { t:'eng-valv-dir-4-3',       l:'4/3 Centered DCV',    svg:'<rect x="3" y="9" width="8" height="14" stroke="#38bdf8" stroke-width="1.2" fill="none"/><rect x="11" y="9" width="10" height="14" stroke="#38bdf8" stroke-width="1.2" fill="none"/><rect x="21" y="9" width="8" height="14" stroke="#38bdf8" stroke-width="1.2" fill="none"/>' },
          { t:'eng-valv-relief',        l:'Relief Valve',        svg:'<rect x="10" y="9" width="12" height="14" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="12" y1="21" x2="20" y2="11" stroke="#ef4444" stroke-width="1.5"/><polyline points="24,12 28,16 24,20" stroke="#facc15" stroke-width="1.2" fill="none"/>' },
          { t:'eng-frl-unit',           l:'FRL Service Unit',    svg:'<rect x="4" y="10" width="24" height="12" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="16" cy="7" r="3.5" stroke="#facc15" stroke-width="1.2" fill="none"/><line x1="12" y1="10" x2="12" y2="22" stroke="#38bdf8" stroke-width="1.2"/><line x1="20" y1="10" x2="20" y2="22" stroke="#38bdf8" stroke-width="1.2"/>' },
          { t:'eng-pressure-gauge',     l:'Pressure Gauge',      svg:'<circle cx="16" cy="14" r="9" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="16" y1="14" x2="21" y2="10" stroke="#ef4444" stroke-width="1.8"/><line x1="16" y1="23" x2="16" y2="28" stroke="#38bdf8" stroke-width="1.8"/>' },
        ]
      },

      // ── 06. CIVIL, STRUCTURAL & ARCHITECTURAL (AISC / Eurocode / ACI) ──
      {
        label: '🏛️ Civil, Structural & Architectural (AISC / Eurocode / ACI)',
        cat: 'eng-civil',
        shapes: [
          { t:'eng-beam-i',             l:'Steel I-Beam',        svg:'<path d="M8,5 L24,5 L24,9 L18,9 L18,23 L24,23 L24,27 L8,27 L8,23 L14,23 L14,9 L8,9 Z" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.15)"/>' },
          { t:'eng-column-box',         l:'HSS Box Column',      svg:'<rect x="7" y="7" width="18" height="18" stroke="#38bdf8" stroke-width="2" fill="none"/><rect x="11" y="11" width="10" height="10" stroke="#38bdf8" stroke-width="1.5" fill="none"/>' },
          { t:'eng-truss-pratt',        l:'Pratt Bridge Truss',  svg:'<line x1="3" y1="10" x2="29" y2="10" stroke="#38bdf8" stroke-width="1.8"/><line x1="3" y1="22" x2="29" y2="22" stroke="#38bdf8" stroke-width="1.8"/><line x1="9" y1="10" x2="9" y2="22" stroke="#38bdf8" stroke-width="1.2"/><line x1="16" y1="10" x2="16" y2="22" stroke="#38bdf8" stroke-width="1.2"/><line x1="23" y1="10" x2="23" y2="22" stroke="#38bdf8" stroke-width="1.2"/><line x1="3" y1="22" x2="9" y2="10" stroke="#facc15" stroke-width="1.2"/><line x1="9" y1="22" x2="16" y2="10" stroke="#facc15" stroke-width="1.2"/>' },
          { t:'eng-truss-warren',       l:'Warren Truss',        svg:'<line x1="3" y1="10" x2="29" y2="10" stroke="#38bdf8" stroke-width="1.8"/><line x1="3" y1="22" x2="29" y2="22" stroke="#38bdf8" stroke-width="1.8"/><polyline points="3,22 8,10 14,22 20,10 26,22" stroke="#facc15" stroke-width="1.5" fill="none"/>' },
          { t:'eng-retaining-wall',     l:'Retaining Wall',      svg:'<path d="M11,6 L15,6 L17,21 L26,21 L26,26 L6,26 L6,21 L11,21 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/>' },
          { t:'eng-footing-pad',        l:'Pad Footing (RC)',    svg:'<rect x="13" y="5" width="6" height="12" stroke="#38bdf8" stroke-width="1.5" fill="none"/><rect x="5" y="17" width="22" height="9" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.15)"/>' },
          { t:'eng-arch-door',          l:'Swing Door Plan',     svg:'<rect x="5" y="21" width="4" height="4" fill="#38bdf8"/><rect x="23" y="21" width="4" height="4" fill="#38bdf8"/><line x1="9" y1="23" x2="9" y2="9" stroke="#facc15" stroke-width="2"/><path d="M9,9 A14,14 0 0,1 23,23" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2,2" fill="none"/>' },
          { t:'eng-arch-window',        l:'Glazed Window',       svg:'<rect x="4" y="11" width="24" height="10" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="4" y1="14" x2="28" y2="14" stroke="#38bdf8" stroke-width="1"/><line x1="4" y1="18" x2="28" y2="18" stroke="#38bdf8" stroke-width="1"/>' },
          { t:'eng-arch-stairs',        l:'Stairs & Arrow',      svg:'<rect x="5" y="6" width="22" height="20" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="5" y1="11" x2="27" y2="11" stroke="#38bdf8" stroke-width="1"/><line x1="5" y1="16" x2="27" y2="16" stroke="#38bdf8" stroke-width="1"/><line x1="5" y1="21" x2="27" y2="21" stroke="#38bdf8" stroke-width="1"/><line x1="16" y1="24" x2="16" y2="8" stroke="#facc15" stroke-width="1.5"/><polygon points="16,6 14,9 18,9" fill="#facc15"/>' },
          { t:'eng-north-arrow',        l:'Site North Arrow',    svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.5" fill="none"/><polygon points="16,6 13,16 16,14" fill="#ef4444"/><polygon points="16,6 19,16 16,14" fill="#fff"/><text x="16" y="4" font-size="6" fill="#ef4444" font-weight="bold" text-anchor="middle">N</text>' },
          { t:'eng-level-marker',       l:'Level Marker FFL',    svg:'<line x1="5" y1="18" x2="27" y2="18" stroke="#38bdf8" stroke-width="1.8"/><polygon points="16,18 11,10 21,10" stroke="#facc15" stroke-width="1.5" fill="#facc15"/><text x="16" y="8" font-size="5" fill="#fff" text-anchor="middle">+3.50</text>' },
          { t:'eng-hatch-concrete',     l:'Concrete Hatch',      svg:'<rect x="5" y="5" width="22" height="22" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.08)"/><polygon points="9,9 12,8 11,12" fill="#fff"/><polygon points="18,19 22,18 20,22" fill="#fff"/><circle cx="15" cy="14" r="0.8" fill="#fff"/>' },
          { t:'eng-hatch-brick',        l:'Brickwork Hatch',     svg:'<rect x="5" y="5" width="22" height="22" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.08)"/><line x1="5" y1="12" x2="27" y2="12" stroke="#facc15" stroke-width="1"/><line x1="5" y1="19" x2="27" y2="19" stroke="#facc15" stroke-width="1"/><line x1="14" y1="5" x2="14" y2="12" stroke="#facc15" stroke-width="1"/><line x1="20" y1="12" x2="20" y2="19" stroke="#facc15" stroke-width="1"/>' },
        ]
      },

      // ── 07. CHEMICAL, PROCESS & INDUSTRIAL P&ID (ISA-5.1 / ISO 10628) ──
      {
        label: '🏭 Process, Chemical & Industrial P&ID (ISA-5.1 / ISO 10628)',
        cat: 'eng-process',
        shapes: [
          { t:'eng-cstr-reactor',       l:'CSTR Reactor',        svg:'<rect x="8" y="8" width="16" height="16" rx="4" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="16" y1="3" x2="16" y2="19" stroke="#facc15" stroke-width="1.8"/><line x1="12" y1="19" x2="20" y2="19" stroke="#facc15" stroke-width="2"/><circle cx="16" cy="4" r="2" fill="#38bdf8"/>' },
          { t:'eng-tank-storage',       l:'Storage Tank',        svg:'<path d="M8,10 L16,6 L24,10 L24,25 L8,25 Z" stroke="#38bdf8" stroke-width="1.8" fill="none"/>' },
          { t:'eng-pressure-vessel',    l:'Pressure Vessel',     svg:'<rect x="8" y="10" width="16" height="12" rx="5" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="11" y1="22" x2="9" y2="27" stroke="#38bdf8" stroke-width="1.5"/><line x1="21" y1="22" x2="23" y2="27" stroke="#38bdf8" stroke-width="1.5"/>' },
          { t:'eng-heat-exchanger',     l:'Heat Exchanger',      svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="none"/><polyline points="8,16 12,12 16,20 20,12 24,16" stroke="#facc15" stroke-width="1.5" fill="none"/>' },
          { t:'eng-distill-col',        l:'Distill Column',      svg:'<rect x="11" y="4" width="10" height="24" rx="4" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="11" y1="10" x2="21" y2="10" stroke="#facc15" stroke-width="1"/><line x1="11" y1="16" x2="21" y2="16" stroke="#facc15" stroke-width="1"/><line x1="11" y1="22" x2="21" y2="22" stroke="#facc15" stroke-width="1"/>' },
          { t:'eng-cooling-tower',      l:'Cooling Tower',       svg:'<path d="M8,26 Q12,16 10,6 L22,6 Q20,16 24,26 Z" stroke="#38bdf8" stroke-width="1.8" fill="none"/>' },
          { t:'eng-pump-centrif',       l:'Centrif. Pump',       svg:'<circle cx="15" cy="17" r="8" stroke="#38bdf8" stroke-width="1.8" fill="none"/><polygon points="15,9 27,9 27,15" fill="#38bdf8"/>' },
          { t:'eng-valv-gate',          l:'Gate Valve (P&ID)',   svg:'<polygon points="6,10 6,22 16,16" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.2)"/><polygon points="26,10 26,22 16,16" stroke="#38bdf8" stroke-width="1.5" fill="rgba(56,189,248,0.2)"/><line x1="16" y1="16" x2="16" y2="8" stroke="#38bdf8" stroke-width="1.5"/><line x1="12" y1="8" x2="20" y2="8" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'eng-valv-globe',         l:'Globe Valve',         svg:'<polygon points="6,10 6,22 16,16" stroke="#38bdf8" stroke-width="1.5" fill="none"/><polygon points="26,10 26,22 16,16" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="2.5" fill="#38bdf8"/>' },
          { t:'eng-valv-check',         l:'Check Valve',         svg:'<polygon points="6,10 6,22 16,16" stroke="#38bdf8" stroke-width="1.5" fill="none"/><polygon points="26,10 26,22 16,16" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="2" fill="none" stroke="#38bdf8" stroke-width="1.2"/>' },
          { t:'eng-valv-control',       l:'Control Valve',       svg:'<polygon points="6,16 6,26 16,21" stroke="#38bdf8" stroke-width="1.2" fill="none"/><polygon points="26,16 26,26 16,21" stroke="#38bdf8" stroke-width="1.2" fill="none"/><line x1="16" y1="21" x2="16" y2="12" stroke="#38bdf8" stroke-width="1.5"/><path d="M10,12 A6,6 0 0,1 22,12 Z" stroke="#facc15" stroke-width="1.5" fill="rgba(250,204,21,0.2)"/>' },
          { t:'eng-valv-psv',           l:'Safety Valve PSV',    svg:'<polygon points="6,18 16,18 11,26" stroke="#ef4444" stroke-width="1.2" fill="none"/><polyline points="11,18 11,10 16,10" stroke="#ef4444" stroke-width="1.5" fill="none"/><polyline points="9,7 13,7 10,4 12,4" stroke="#facc15" stroke-width="1.2" fill="none"/>' },
          { t:'eng-inst-pi',            l:'Pressure Indic. PI',  svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="rgba(15,23,42,0.85)"/><text x="16" y="15" font-size="7" fill="#facc15" font-weight="bold" text-anchor="middle">PI</text><text x="16" y="22" font-size="5.5" fill="#38bdf8" text-anchor="middle">101</text>' },
          { t:'eng-inst-pt',            l:'Pressure Trans. PT',  svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="rgba(15,23,42,0.85)"/><text x="16" y="15" font-size="7" fill="#facc15" font-weight="bold" text-anchor="middle">PT</text><text x="16" y="22" font-size="5.5" fill="#38bdf8" text-anchor="middle">102</text>' },
          { t:'eng-inst-ti',            l:'Temp. Indic. TI',     svg:'<circle cx="16" cy="16" r="10" stroke="#38bdf8" stroke-width="1.8" fill="rgba(15,23,42,0.85)"/><text x="16" y="15" font-size="7" fill="#facc15" font-weight="bold" text-anchor="middle">TI</text><text x="16" y="22" font-size="5.5" fill="#38bdf8" text-anchor="middle">201</text>' },
          { t:'eng-inst-fic',           l:'Flow Controller FIC', svg:'<rect x="5" y="5" width="22" height="22" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="9" stroke="#38bdf8" stroke-width="1.5" fill="rgba(15,23,42,0.85)"/><line x1="7" y1="16" x2="25" y2="16" stroke="#38bdf8" stroke-width="1"/><text x="16" y="13" font-size="6" fill="#facc15" font-weight="bold" text-anchor="middle">FIC</text><text x="16" y="22" font-size="5.5" fill="#38bdf8" text-anchor="middle">301</text>' },
          { t:'eng-inst-lic',           l:'Level Controller LIC',svg:'<rect x="5" y="5" width="22" height="22" stroke="#38bdf8" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="9" stroke="#38bdf8" stroke-width="1.5" fill="rgba(15,23,42,0.85)"/><line x1="7" y1="16" x2="25" y2="16" stroke="#38bdf8" stroke-width="1"/><text x="16" y="13" font-size="6" fill="#facc15" font-weight="bold" text-anchor="middle">LIC</text><text x="16" y="22" font-size="5.5" fill="#38bdf8" text-anchor="middle">401</text>' },
        ]
      },

      // ── 08. COMPUTER ARCHITECTURE & NETWORKING (ISO 5807 / IEEE 802) ──
      {
        label: '💻 Computer Architecture, Networking & Flowcharts (ISO 5807)',
        cat: 'eng-computing',
        shapes: [
          { t:'eng-flow-terminator',    l:'Start / End (Pill)',  svg:'<rect x="4" y="10" width="24" height="12" rx="6" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><text x="16" y="18" font-size="6.5" fill="#38bdf8" text-anchor="middle">START</text>' },
          { t:'eng-flow-process',       l:'Process Box',         svg:'<rect x="4" y="9" width="24" height="14" rx="2" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><text x="16" y="18" font-size="6" fill="#38bdf8" text-anchor="middle">Action</text>' },
          { t:'eng-flow-decision',      l:'Decision Diamond',   svg:'<polygon points="16,5 27,16 16,27 5,16" stroke="#facc15" stroke-width="1.8" fill="rgba(250,204,21,0.12)"/><text x="16" y="18" font-size="6" fill="#facc15" text-anchor="middle">Cond?</text>' },
          { t:'eng-flow-io',            l:'Input / Output Data', svg:'<polygon points="7,9 28,9 25,23 4,23" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><text x="16" y="18" font-size="6" fill="#38bdf8" text-anchor="middle">I/O</text>' },
          { t:'eng-flow-database',      l:'Database Cylinder',   svg:'<ellipse cx="16" cy="9" rx="9" ry="4" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.15)"/><path d="M7,9 L7,23 A9,4 0 0,0 25,23 L25,9" stroke="#38bdf8" stroke-width="1.8" fill="none"/>' },
          { t:'eng-flow-document',      l:'Document Output',     svg:'<path d="M6,7 L26,7 L26,21 Q21,17 16,21 Q11,25 6,21 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/>' },
          { t:'eng-arch-cpu',           l:'CPU Processor Core',  svg:'<rect x="7" y="7" width="18" height="18" rx="2" stroke="#38bdf8" stroke-width="2" fill="rgba(15,23,42,0.85)"/><text x="16" y="18" font-size="7" fill="#facc15" font-weight="bold" text-anchor="middle">CPU</text><line x1="11" y1="3" x2="11" y2="7" stroke="#38bdf8" stroke-width="1.5"/><line x1="21" y1="3" x2="21" y2="7" stroke="#38bdf8" stroke-width="1.5"/><line x1="11" y1="25" x2="11" y2="29" stroke="#38bdf8" stroke-width="1.5"/><line x1="21" y1="25" x2="21" y2="29" stroke="#38bdf8" stroke-width="1.5"/>' },
          { t:'eng-arch-alu',           l:'ALU V-Block',         svg:'<polygon points="5,6 13,6 16,13 19,6 27,6 23,26 9,26" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.15)"/><text x="16" y="22" font-size="6.5" fill="#facc15" font-weight="bold" text-anchor="middle">ALU</text>' },
          { t:'eng-arch-bus',           l:'System Bus Line',     svg:'<line x1="3" y1="14" x2="29" y2="14" stroke="#facc15" stroke-width="2"/><line x1="3" y1="18" x2="29" y2="18" stroke="#facc15" stroke-width="2"/><line x1="12" y1="22" x2="20" y2="10" stroke="#38bdf8" stroke-width="1.8"/><text x="16" y="8" font-size="5" fill="#fff" text-anchor="middle">64-BIT</text>' },
          { t:'eng-net-router',         l:'Network Router (L3)', svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/><line x1="10" y1="13" x2="22" y2="13" stroke="#38bdf8" stroke-width="1.5"/><polygon points="22,13 18,11 18,15" fill="#38bdf8"/><line x1="22" y1="19" x2="10" y2="19" stroke="#38bdf8" stroke-width="1.5"/><polygon points="10,19 14,17 14,21" fill="#38bdf8"/>' },
          { t:'eng-net-switch',         l:'Ethernet Switch (L2)',svg:'<rect x="4" y="10" width="24" height="12" rx="2" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="8" y1="13" x2="24" y2="13" stroke="#facc15" stroke-width="1.2"/><line x1="24" y1="19" x2="8" y2="19" stroke="#facc15" stroke-width="1.2"/>' },
          { t:'eng-net-firewall',       l:'Firewall Shield',     svg:'<rect x="5" y="9" width="22" height="14" stroke="#ef4444" stroke-width="1.5" fill="none"/><line x1="5" y1="16" x2="27" y2="16" stroke="#ef4444" stroke-width="1"/><line x1="12" y1="9" x2="12" y2="16" stroke="#ef4444" stroke-width="1"/><line x1="19" y1="16" x2="19" y2="23" stroke="#ef4444" stroke-width="1"/>' },
          { t:'eng-net-server',         l:'Server Rack Node',    svg:'<rect x="7" y="5" width="18" height="6" rx="1" stroke="#38bdf8" stroke-width="1.2" fill="none"/><rect x="7" y="13" width="18" height="6" rx="1" stroke="#38bdf8" stroke-width="1.2" fill="none"/><rect x="7" y="21" width="18" height="6" rx="1" stroke="#38bdf8" stroke-width="1.2" fill="none"/><circle cx="21" cy="8" r="1" fill="#22c55e"/><circle cx="21" cy="16" r="1" fill="#22c55e"/><circle cx="21" cy="24" r="1" fill="#22c55e"/>' },
          { t:'eng-net-cloud',          l:'Cloud Network',       svg:'<path d="M9,22 A5,5 0 0,1 7,14 A7,7 0 0,1 19,10 A6,6 0 0,1 26,17 A4,4 0 0,1 23,22 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/>' },
          { t:'eng-net-client',         l:'Client PC Workstation',svg:'<rect x="6" y="7" width="20" height="13" rx="1.5" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="16" y1="20" x2="16" y2="25" stroke="#38bdf8" stroke-width="2"/><line x1="10" y1="25" x2="22" y2="25" stroke="#38bdf8" stroke-width="2"/>' },
        ]
      },

      // ── 09. AUTOMOTIVE, AEROSPACE, BIOMEDICAL & RENEWABLE ──
      {
        label: '🛰️ Automotive, Aerospace, Biomedical & Renewable',
        cat: 'eng-advanced',
        shapes: [
          { t:'eng-auto-engine',        l:'Engine Block ICE',    svg:'<rect x="6" y="9" width="20" height="14" rx="2" stroke="#facc15" stroke-width="1.8" fill="none"/><circle cx="11" cy="16" r="3" stroke="#38bdf8" stroke-width="1.2" fill="none"/><circle cx="21" cy="16" r="3" stroke="#38bdf8" stroke-width="1.2" fill="none"/>' },
          { t:'eng-auto-piston',        l:'Piston & Rod',        svg:'<rect x="8" y="6" width="16" height="10" rx="1" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.15)"/><line x1="16" y1="16" x2="16" y2="25" stroke="#38bdf8" stroke-width="2.5"/><circle cx="16" cy="25" r="2.5" stroke="#facc15" stroke-width="1.5" fill="none"/>' },
          { t:'eng-auto-battery',       l:'EV Battery 800V',     svg:'<rect x="5" y="9" width="22" height="14" rx="2" stroke="#22c55e" stroke-width="1.8" fill="none"/><polygon points="17,11 13,17 17,17 15,22 20,16 16,16" fill="#22c55e"/>' },
          { t:'eng-aero-airfoil',       l:'NACA Airfoil',        svg:'<path d="M5,16 C9,8 20,11 28,16 C20,19 9,21 5,16 Z" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.15)"/>' },
          { t:'eng-aero-forces',        l:'4 Flight Forces',     svg:'<ellipse cx="16" cy="16" rx="6" ry="3" fill="#38bdf8"/><line x1="16" y1="13" x2="16" y2="4" stroke="#22c55e" stroke-width="1.8"/><polygon points="16,4 14,8 18,8" fill="#22c55e"/><line x1="16" y1="19" x2="16" y2="28" stroke="#ef4444" stroke-width="1.8"/><polygon points="16,28 14,24 18,24" fill="#ef4444"/><line x1="22" y1="16" x2="29" y2="16" stroke="#facc15" stroke-width="1.8"/><polygon points="29,16 25,14 25,18" fill="#facc15"/><line x1="10" y1="16" x2="3" y2="16" stroke="#a855f7" stroke-width="1.8"/><polygon points="3,16 7,14 7,18" fill="#a855f7"/>' },
          { t:'eng-aero-nozzle',        l:'De Laval Nozzle',     svg:'<path d="M4,8 Q13,14 16,14 Q20,14 28,6 L28,26 Q20,18 16,18 Q13,18 4,24 Z" stroke="#facc15" stroke-width="1.8" fill="none"/>' },
          { t:'eng-bio-ecg-wave',       l:'ECG Cardiac Trace',   svg:'<polyline points="3,16 8,16 10,14 12,16 14,16 16,6 18,24 20,16 23,16 25,13 27,16 29,16" stroke="#22c55e" stroke-width="1.8" fill="none"/>' },
          { t:'eng-bio-pulseox',        l:'Pulse Oximeter',      svg:'<rect x="7" y="8" width="18" height="16" rx="3" stroke="#ef4444" stroke-width="1.8" fill="none"/><circle cx="16" cy="16" r="4" stroke="#ef4444" stroke-width="1.2" fill="none"/><text x="16" y="19" font-size="5" fill="#ef4444" text-anchor="middle">SpO2</text>' },
          { t:'eng-renew-solar-pv',     l:'Solar PV Panel',      svg:'<polygon points="7,25 11,8 25,8 21,25" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.15)"/><line x1="16" y1="8" x2="14" y2="25" stroke="#38bdf8" stroke-width="1.2"/><line x1="9" y1="16" x2="23" y2="16" stroke="#38bdf8" stroke-width="1.2"/>' },
          { t:'eng-renew-wind',         l:'Wind Turbine',        svg:'<line x1="16" y1="14" x2="16" y2="29" stroke="#38bdf8" stroke-width="2"/><circle cx="16" cy="14" r="2.5" fill="#facc15"/><line x1="16" y1="14" x2="16" y2="4" stroke="#38bdf8" stroke-width="1.8"/><line x1="16" y1="14" x2="7" y2="19" stroke="#38bdf8" stroke-width="1.8"/><line x1="16" y1="14" x2="25" y2="19" stroke="#38bdf8" stroke-width="1.8"/>' },
          { t:'eng-renew-fuelcell',     l:'Hydrogen Fuel Cell',  svg:'<rect x="6" y="8" width="20" height="16" rx="2" stroke="#06b6d4" stroke-width="1.8" fill="none"/><line x1="16" y1="8" x2="16" y2="24" stroke="#06b6d4" stroke-width="2" stroke-dasharray="2,2"/><text x="11" y="18" font-size="6" fill="#06b6d4">H₂</text><text x="21" y="18" font-size="6" fill="#06b6d4">O₂</text>' },
        ]
      },

      // ── 10. ENGINEERING GRAPHS, PLOTS & ANALYSIS ──
      {
        label: '📊 Engineering Graphs, Plots & Systems Analysis',
        cat: 'eng-analysis',
        shapes: [
          { t:'eng-graph-stress-strain',l:'Stress-Strain Curve', svg:'<line x1="6" y1="6" x2="6" y2="26" stroke="#38bdf8" stroke-width="1.8"/><line x1="6" y1="26" x2="27" y2="26" stroke="#38bdf8" stroke-width="1.8"/><path d="M6,26 L12,13 Q16,11 19,13 T25,18" stroke="#ef4444" stroke-width="2" fill="none"/>' },
          { t:'eng-graph-sfd-bmd',      l:'Beam SFD & BMD',      svg:'<line x1="4" y1="14" x2="28" y2="14" stroke="#38bdf8" stroke-width="1.5"/><rect x="8" y="9" width="8" height="5" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1"/><rect x="16" y="14" width="8" height="5" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1"/>' },
          { t:'eng-graph-bode',         l:'Bode Frequency Plot', svg:'<line x1="5" y1="6" x2="5" y2="26" stroke="#38bdf8" stroke-width="1.8"/><line x1="5" y1="16" x2="27" y2="16" stroke="#38bdf8" stroke-dasharray="2,2"/><path d="M5,10 L15,10 Q19,12 25,24" stroke="#facc15" stroke-width="2" fill="none"/>' },
          { t:'eng-graph-pv',           l:'P-V Diagram',         svg:'<line x1="6" y1="6" x2="6" y2="26" stroke="#38bdf8" stroke-width="1.8"/><line x1="6" y1="26" x2="27" y2="26" stroke="#38bdf8" stroke-width="1.8"/><path d="M11,10 Q20,13 22,21 Q14,24 11,21 Z" stroke="#22c55e" stroke-width="1.8" fill="rgba(34,197,94,0.15)"/>' },
          { t:'eng-graph-mohr',         l:'Mohr\'s Circle (2D)',svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="1.5"/><line x1="16" y1="4" x2="16" y2="28" stroke="#38bdf8" stroke-width="1.5"/><circle cx="16" cy="16" r="8" stroke="#ef4444" stroke-width="1.8" fill="none"/>' },
          { t:'eng-graph-feedback',     l:'Feedback Loop G(s)',  svg:'<circle cx="8" cy="16" r="3" stroke="#38bdf8" stroke-width="1.5" fill="none"/><rect x="15" y="11" width="10" height="10" stroke="#38bdf8" stroke-width="1.5" fill="none"/><line x1="2" y1="16" x2="5" y2="16" stroke="#38bdf8" stroke-width="1.5"/><line x1="11" y1="16" x2="15" y2="16" stroke="#38bdf8" stroke-width="1.5"/><line x1="25" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="1.5"/>' },
        ]
      }
    ];

    const SCIENCE_SECTIONS = [
      // ── 01. PHYSICS & FORCES ──
      {
        label: '⚙ Physics Diagrams & Forces',
        cat: 'physics',
        shapes: [
          { t:'sc-force-vector',   l:'Force Vector F⃗',   svg:'<line x1="4" y1="16" x2="26" y2="16" stroke="#38bdf8" stroke-width="2.2"/><polygon points="26,16 20,12 20,20" fill="#38bdf8"/><text x="14" y="11" text-anchor="middle" font-size="8" fill="#38bdf8" font-weight="700">F⃗</text>' },
          { t:'sc-motion-arrow',   l:'Velocity v⃗',        svg:'<path d="M4,18 C10,8 20,8 26,18" stroke="#f59e0b" stroke-width="2" fill="none" stroke-dasharray="3,2"/><polygon points="27,18 21,14 22,21" fill="#f59e0b"/><text x="16" y="26" text-anchor="middle" font-size="8" fill="#f59e0b" font-weight="700">v⃗</text>' },
          { t:'sc-free-body',      l:'Free Body Diagram', svg:'<circle cx="16" cy="16" r="4.5" fill="#38bdf8"/><line x1="16" y1="4" x2="16" y2="11" stroke="#ef4444" stroke-width="1.8"/><polygon points="16,3 13,9 19,9" fill="#ef4444"/><line x1="16" y1="21" x2="16" y2="29" stroke="#10b981" stroke-width="1.8"/><polygon points="16,30 13,24 19,24" fill="#10b981"/><line x1="4" y1="16" x2="11" y2="16" stroke="#f59e0b" stroke-width="1.8"/><polygon points="3,16 9,13 9,19" fill="#f59e0b"/><line x1="21" y1="16" x2="28" y2="16" stroke="#38bdf8" stroke-width="1.8"/><polygon points="29,16 23,13 23,19" fill="#38bdf8"/>' },
          { t:'sc-inclined-plane', l:'Inclined Plane',    svg:'<polygon points="4,26 28,26 28,10" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><rect x="13" y="12" width="8" height="6" rx="1" transform="rotate(-33 13 12)" fill="#38bdf8"/><text x="16" y="24" font-size="7" fill="currentColor">θ</text>' },
          { t:'sc-pulley',         l:'Pulley System',     svg:'<circle cx="16" cy="10" r="6.5" stroke="currentColor" stroke-width="1.8" fill="none"/><line x1="9.5" y1="10" x2="9.5" y2="28" stroke="currentColor" stroke-width="1.4"/><line x1="22.5" y1="10" x2="22.5" y2="24" stroke="currentColor" stroke-width="1.4"/><rect x="6" y="25" width="7" height="6" stroke="#38bdf8" stroke-width="1.2" fill="#38bdf8" fill-opacity=".3"/>' },
          { t:'sc-lever',          l:'Lever & Fulcrum',   svg:'<line x1="3" y1="14" x2="29" y2="14" stroke="currentColor" stroke-width="2.5"/><polygon points="16,14 11,26 21,26" stroke="#f59e0b" stroke-width="1.5" fill="#f59e0b" fill-opacity=".2"/><rect x="4" y="8" width="6" height="6" fill="#ef4444"/><circle cx="26" cy="11" r="3" fill="#38bdf8"/>' },
          { t:'sc-spring',         l:'Spring & Damper',   svg:'<polyline points="16,3 16,7 10,10 22,13 10,16 22,19 10,22 16,25 16,29" stroke="#38bdf8" stroke-width="2" fill="none"/>' },
          { t:'sc-pendulum-diag',  l:'Simple Pendulum',   svg:'<line x1="8" y1="4" x2="24" y2="4" stroke="currentColor" stroke-width="2"/><line x1="16" y1="4" x2="24" y2="22" stroke="#38bdf8" stroke-width="1.8"/><circle cx="24" cy="22" r="5" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"/><path d="M10,22 Q16,25 22,22" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>' },
          { t:'sc-bar-magnet',     l:'Bar Magnet (N-S)',  svg:'<rect x="2" y="10" width="28" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="2" y="10" width="14" height="12" fill="#ef4444"/><rect x="16" y="10" width="14" height="12" fill="#3b82f6"/><text x="9" y="19" text-anchor="middle" font-size="8" fill="#fff" font-weight="700">N</text><text x="23" y="19" text-anchor="middle" font-size="8" fill="#fff" font-weight="700">S</text>' },
          { t:'sc-compass',        l:'Magnetic Compass',  svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/><polygon points="16,5 19,16 16,14 13,16" fill="#ef4444"/><polygon points="16,27 19,16 16,14 13,16" fill="#3b82f6"/>' },
        ]
      },

      // ── 02. ELECTRICAL CIRCUITS & ELECTRONICS ──
      {
        label: '⚡ Circuit Schematics & E&M',
        cat: 'circuits',
        shapes: [
          { t:'sc-battery',          l:'Battery Cell',      svg:'<line x1="3" y1="16" x2="29" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="9" x2="10" y2="23" stroke="#10b981" stroke-width="2.5"/><line x1="15" y1="12" x2="15" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="9" x2="20" y2="23" stroke="#10b981" stroke-width="2.5"/><line x1="25" y1="12" x2="25" y2="20" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-ac-source',        l:'AC Source',         svg:'<circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10,16 Q13,11 16,16 T22,16" stroke="#10b981" stroke-width="2" fill="none"/><line x1="2" y1="16" x2="6" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-resistor',         l:'Resistor R',        svg:'<line x1="2" y1="16" x2="7" y2="16" stroke="currentColor" stroke-width="1.5"/><rect x="7" y="11" width="18" height="10" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".15"/><line x1="25" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-variable-resistor',l:'Variable Resistor', svg:'<line x1="2" y1="16" x2="7" y2="16" stroke="currentColor" stroke-width="1.5"/><rect x="7" y="11" width="18" height="10" stroke="#10b981" stroke-width="1.5" fill="none"/><line x1="25" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="26" x2="24" y2="6" stroke="#f59e0b" stroke-width="1.8"/><polygon points="24,6 18,7 23,12" fill="#f59e0b"/>' },
          { t:'sc-capacitor',        l:'Capacitor C',       svg:'<line x1="2" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="13" y1="8" x2="13" y2="24" stroke="#10b981" stroke-width="2.5"/><line x1="19" y1="8" x2="19" y2="24" stroke="#10b981" stroke-width="2.5"/><line x1="19" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-inductor',         l:'Inductor L',        svg:'<line x1="2" y1="18" x2="6" y2="18" stroke="currentColor" stroke-width="1.5"/><path d="M6,18 A3.5,3.5 0 0,1 12,18 A3.5,3.5 0 0,1 18,18 A3.5,3.5 0 0,1 24,18" stroke="#10b981" stroke-width="2" fill="none"/><line x1="24" y1="18" x2="30" y2="18" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-diode',            l:'Diode',             svg:'<line x1="2" y1="16" x2="10" y2="16" stroke="currentColor" stroke-width="1.5"/><polygon points="10,9 10,23 20,16" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".3"/><line x1="20" y1="9" x2="20" y2="23" stroke="#10b981" stroke-width="2"/><line x1="20" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-led',              l:'LED Diode',         svg:'<polygon points="8,10 8,22 17,16" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".3"/><line x1="17" y1="10" x2="17" y2="22" stroke="#10b981" stroke-width="2"/><line x1="2" y1="16" x2="8" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="17" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="15" y1="9" x2="22" y2="4" stroke="#f59e0b" stroke-width="1.5"/><line x1="19" y1="12" x2="26" y2="7" stroke="#f59e0b" stroke-width="1.5"/>' },
          { t:'sc-zener',            l:'Zener Diode',       svg:'<polygon points="9,10 9,22 18,16" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".2"/><path d="M15,8 L18,10 L18,22 L21,24" stroke="#10b981" stroke-width="1.8" fill="none"/><line x1="2" y1="16" x2="9" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-transistor-npn',   l:'Transistor NPN',    svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="12" y1="10" x2="12" y2="22" stroke="#10b981" stroke-width="2"/><line x1="4" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="13" x2="22" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="19" x2="22" y2="24" stroke="currentColor" stroke-width="1.5"/><polygon points="20,23 17,19 22,20" fill="#10b981"/>' },
          { t:'sc-switch-open',      l:'Open Switch',       svg:'<line x1="2" y1="18" x2="10" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="22" y1="18" x2="30" y2="18" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="22" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="12" y1="18" x2="20" y2="10" stroke="#ef4444" stroke-width="2"/>' },
          { t:'sc-switch-closed',    l:'Closed Switch',     svg:'<line x1="2" y1="18" x2="10" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="22" y1="18" x2="30" y2="18" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="22" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="10" y1="18" x2="22" y2="18" stroke="#10b981" stroke-width="2.5"/>' },
          { t:'sc-bulb',             l:'Lamp / Bulb',       svg:'<circle cx="16" cy="14" r="9" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".1"/><line x1="12" y1="11" x2="20" y2="17" stroke="#10b981" stroke-width="1.2"/><line x1="20" y1="11" x2="12" y2="17" stroke="#10b981" stroke-width="1.2"/><line x1="13" y1="23" x2="19" y2="23" stroke="currentColor" stroke-width="1.5"/><line x1="14" y1="26" x2="18" y2="26" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-ammeter',          l:'Ammeter (A)',       svg:'<circle cx="16" cy="16" r="11" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity=".1"/><text x="16" y="20" text-anchor="middle" font-size="11" fill="#10b981" font-weight="700">A</text>' },
          { t:'sc-voltmeter',        l:'Voltmeter (V)',     svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".1"/><text x="16" y="20" text-anchor="middle" font-size="11" fill="#38bdf8" font-weight="700">V</text>' },
          { t:'sc-galvanometer',     l:'Galvanometer (G)',  svg:'<circle cx="16" cy="16" r="11" stroke="#f59e0b" stroke-width="1.8" fill="#f59e0b" fill-opacity=".1"/><text x="16" y="20" text-anchor="middle" font-size="11" fill="#f59e0b" font-weight="700">G</text>' },
          { t:'sc-ground',           l:'Ground / Earth',    svg:'<line x1="16" y1="4" x2="16" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="18" x2="26" y2="18" stroke="currentColor" stroke-width="2"/><line x1="10" y1="22" x2="22" y2="22" stroke="currentColor" stroke-width="1.5"/><line x1="13" y1="26" x2="19" y2="26" stroke="currentColor" stroke-width="1.2"/>' },
          { t:'sc-fuse',             l:'Fuse',              svg:'<rect x="6" y="11" width="20" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".1"/><line x1="2" y1="16" x2="30" y2="16" stroke="#10b981" stroke-width="1.8"/>' },
          { t:'sc-gate-and',         l:'AND Gate',          svg:'<path d="M6,8 L14,8 A8,8 0 0,1 14,24 L6,24 Z" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity=".15"/><line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="20" x2="6" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="22" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-gate-or',          l:'OR Gate',           svg:'<path d="M6,8 Q12,16 6,24 Q18,24 24,16 Q18,8 6,8 Z" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity=".15"/><line x1="2" y1="11" x2="8" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="21" x2="8" y2="21" stroke="currentColor" stroke-width="1.5"/><line x1="24" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-gate-not',         l:'NOT Gate',          svg:'<polygon points="8,8 8,24 22,16" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity=".15"/><circle cx="24" cy="16" r="2" stroke="#10b981" stroke-width="1.5" fill="none"/><line x1="2" y1="16" x2="8" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-gate-nand',        l:'NAND Gate',         svg:'<path d="M5,8 L13,8 A8,8 0 0,1 13,24 L5,24 Z" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity=".15"/><circle cx="23" cy="16" r="2" stroke="#10b981" stroke-width="1.5" fill="none"/><line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="20" x2="5" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="25" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-gate-nor',         l:'NOR Gate',          svg:'<path d="M5,8 Q11,16 5,24 Q16,24 22,16 Q16,8 5,8 Z" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity=".15"/><circle cx="24" cy="16" r="2" stroke="#10b981" stroke-width="1.5" fill="none"/><line x1="2" y1="11" x2="7" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="21" x2="7" y2="21" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-motor',            l:'Motor (M)',         svg:'<circle cx="16" cy="16" r="11" stroke="#10b981" stroke-width="1.8" fill="none"/><text x="16" y="20" text-anchor="middle" font-size="11" fill="#10b981" font-weight="700">M</text>' },
          { t:'sc-transformer',      l:'Transformer',       svg:'<path d="M12,8 A4,4 0 0,0 12,16 A4,4 0 0,0 12,24" stroke="#10b981" stroke-width="2" fill="none"/><line x1="15" y1="7" x2="15" y2="25" stroke="currentColor" stroke-width="1.5"/><line x1="17" y1="7" x2="17" y2="25" stroke="currentColor" stroke-width="1.5"/><path d="M20,8 A4,4 0 0,1 20,16 A4,4 0 0,1 20,24" stroke="#10b981" stroke-width="2" fill="none"/>' },
        ]
      },

      // ── 03. OPTICS & WAVE DIAGRAMS ──
      {
        label: '🔍 Optics & Wave Diagrams',
        cat: 'optics-waves',
        shapes: [
          { t:'sc-convex-lens',      l:'Convex Lens',       svg:'<path d="M16,4 Q26,16 16,28 Q6,16 16,4" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".15"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' },
          { t:'sc-concave-lens',     l:'Concave Lens',      svg:'<path d="M12,4 Q18,16 12,28" stroke="#38bdf8" stroke-width="1.8" fill="none"/><path d="M20,4 Q14,16 20,28" stroke="#38bdf8" stroke-width="1.8" fill="none"/><line x1="12" y1="4" x2="20" y2="4" stroke="#38bdf8" stroke-width="1.5"/><line x1="12" y1="28" x2="20" y2="28" stroke="#38bdf8" stroke-width="1.5"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' },
          { t:'sc-convex-mirror',    l:'Convex Mirror',     svg:'<path d="M14,4 Q22,16 14,28" stroke="#38bdf8" stroke-width="2.5" fill="none"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' },
          { t:'sc-concave-mirror',   l:'Concave Mirror',    svg:'<path d="M18,4 Q10,16 18,28" stroke="#38bdf8" stroke-width="2.5" fill="none"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' },
          { t:'sc-prism',            l:'Glass Prism',       svg:'<polygon points="16,5 28,27 4,27" stroke="#e8c96b" stroke-width="2" fill="#e8c96b" fill-opacity=".1"/><line x1="2" y1="19" x2="12" y2="17" stroke="#fff" stroke-width="1.5"/><line x1="20" y1="19" x2="30" y2="13" stroke="#ef4444" stroke-width="1.2"/><line x1="21" y1="21" x2="30" y2="22" stroke="#3b82f6" stroke-width="1.2"/>' },
          { t:'sc-optical-ray',      l:'Light Ray',         svg:'<line x1="3" y1="16" x2="27" y2="16" stroke="#facc15" stroke-width="2"/><polygon points="18,16 13,12 13,20" fill="#facc15"/>' },
          { t:'sc-refraction-diag',  l:'Snell Refraction',  svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="2"/><line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2,2"/><line x1="6" y1="7" x2="16" y2="16" stroke="#ef4444" stroke-width="2"/><line x1="16" y1="16" x2="25" y2="27" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'sc-transverse-wave',  l:'Transverse Wave',   svg:'<path d="M2,16 Q8,4 14,16 T26,16" stroke="#38bdf8" stroke-width="2.2" fill="none"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>' },
          { t:'sc-longitudinal-wave',l:'Longitudinal Wave', svg:'<line x1="6" y1="8" x2="6" y2="24" stroke="#38bdf8" stroke-width="2.5"/><line x1="8" y1="8" x2="8" y2="24" stroke="#38bdf8" stroke-width="2.5"/><line x1="14" y1="8" x2="14" y2="24" stroke="#38bdf8" stroke-width="1"/><line x1="22" y1="8" x2="22" y2="24" stroke="#38bdf8" stroke-width="2.5"/><line x1="24" y1="8" x2="24" y2="24" stroke="#38bdf8" stroke-width="2.5"/>' },
          { t:'sc-standing-wave',    l:'Standing Wave',     svg:'<path d="M2,16 Q8,6 16,16 Q24,26 30,16" stroke="#38bdf8" stroke-width="2" fill="none"/><path d="M2,16 Q8,26 16,16 Q24,6 30,16" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2,2" fill="none"/>' },
          { t:'sc-sound-wave',       l:'Sound Waves',       svg:'<polygon points="4,11 9,11 15,6 15,26 9,21 4,21" fill="currentColor"/><path d="M19,10 A7,7 0 0,1 19,22" stroke="#38bdf8" stroke-width="1.8" fill="none"/><path d="M23,7 A12,12 0 0,1 23,25" stroke="#38bdf8" stroke-width="1.8" fill="none"/>' },
        ]
      },

      // ── 04. CHEMISTRY LAB APPARATUS ──
      {
        label: '🧪 Chemistry Lab Glassware',
        cat: 'chem-lab',
        shapes: [
          { t:'sc-beaker',            l:'Beaker (250 ml)',   svg:'<path d="M8,4 L8,23 Q8,28 16,28 Q24,28 24,23 L24,4" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".1"/><path d="M8,16 Q16,18 24,16 L24,23 Q24,28 16,28 Q8,28 8,23 Z" fill="#38bdf8" fill-opacity=".2"/><line x1="6" y1="4" x2="26" y2="4" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'sc-test-tube',         l:'Test Tube',         svg:'<path d="M12,4 L12,22 A4,4 0 0,0 20,22 L20,4" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".1"/><path d="M12,14 Q16,16 20,14 L20,22 A4,4 0 0,1 12,22 Z" fill="#38bdf8" fill-opacity=".25"/><line x1="10" y1="4" x2="22" y2="4" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'sc-boiling-tube',      l:'Boiling Tube',      svg:'<path d="M11,4 L11,22 A5,5 0 0,0 21,22 L21,4" stroke="#38bdf8" stroke-width="2" fill="#38bdf8" fill-opacity=".15"/><line x1="9" y1="4" x2="23" y2="4" stroke="#38bdf8" stroke-width="2.2"/>' },
          { t:'sc-erlenmeyer',        l:'Conical Flask',     svg:'<polygon points="13,4 19,4 27,26 5,26" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".1"/><polygon points="9,18 23,18 26,25 6,25" fill="#38bdf8" fill-opacity=".25"/><line x1="11" y1="4" x2="21" y2="4" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'sc-round-bottom-flask',l:'Round-Bottom Flask',svg:'<line x1="13" y1="4" x2="19" y2="4" stroke="#38bdf8" stroke-width="2"/><line x1="14" y1="4" x2="14" y2="12" stroke="#38bdf8" stroke-width="1.5"/><line x1="18" y1="4" x2="18" y2="12" stroke="#38bdf8" stroke-width="1.5"/><circle cx="16" cy="20" r="8" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".15"/>' },
          { t:'sc-volumetric-flask',  l:'Volumetric Flask',  svg:'<line x1="13" y1="3" x2="19" y2="3" stroke="#38bdf8" stroke-width="2"/><line x1="15" y1="3" x2="15" y2="15" stroke="#38bdf8" stroke-width="1.5"/><line x1="17" y1="3" x2="17" y2="15" stroke="#38bdf8" stroke-width="1.5"/><ellipse cx="16" cy="22" rx="9" ry="7" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".15"/>' },
          { t:'sc-measuring-cylinder',l:'Measuring Cylinder',svg:'<rect x="11" y="4" width="10" height="23" rx="1" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".1"/><line x1="8" y1="27" x2="24" y2="27" stroke="#38bdf8" stroke-width="2"/><line x1="11" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="1"/><line x1="11" y1="14" x2="15" y2="14" stroke="currentColor" stroke-width="1"/><line x1="11" y1="19" x2="15" y2="19" stroke="currentColor" stroke-width="1"/>' },
          { t:'sc-burette',           l:'Burette',           svg:'<rect x="13" y="3" width="6" height="23" stroke="#38bdf8" stroke-width="1.5" fill="none"/><polygon points="14,26 18,26 16,30" fill="#38bdf8"/><circle cx="16" cy="24" r="2" fill="#ef4444"/>' },
          { t:'sc-pipette',           l:'Graduated Pipette', svg:'<line x1="16" y1="2" x2="16" y2="30" stroke="#38bdf8" stroke-width="2"/><ellipse cx="16" cy="14" rx="4" ry="7" stroke="#38bdf8" stroke-width="1.5" fill="#38bdf8" fill-opacity=".2"/>' },
          { t:'sc-funnel',            l:'Filter Funnel',     svg:'<polygon points="6,6 26,6 18,17 18,28 14,28 14,17" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".12"/>' },
          { t:'sc-separating-funnel', l:'Separating Funnel', svg:'<path d="M12,4 L20,4 L23,12 Q23,20 17,23 L17,28 L15,28 L15,23 Q9,20 9,12 Z" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".12"/><circle cx="16" cy="24" r="2" fill="#ef4444"/>' },
          { t:'sc-evaporating-dish',  l:'Evaporating Dish',  svg:'<path d="M4,15 Q16,28 28,15 Z" stroke="#38bdf8" stroke-width="2" fill="#38bdf8" fill-opacity=".15"/><line x1="3" y1="15" x2="29" y2="15" stroke="#38bdf8" stroke-width="2"/>' },
          { t:'sc-mortar-pestle',     l:'Mortar & Pestle',   svg:'<path d="M5,16 Q16,28 27,16 Z" stroke="#94a3b8" stroke-width="2" fill="#94a3b8" fill-opacity=".2"/><line x1="4" y1="16" x2="28" y2="16" stroke="#94a3b8" stroke-width="2"/><line x1="12" y1="6" x2="20" y2="20" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>' },
          { t:'sc-bunsen',            l:'Bunsen Burner',     svg:'<line x1="16" y1="12" x2="16" y2="26" stroke="currentColor" stroke-width="3"/><line x1="8" y1="26" x2="24" y2="26" stroke="currentColor" stroke-width="2.5"/><path d="M16,12 Q19,6 16,2 Q13,6 16,12 Z" fill="#ef4444"/>' },
          { t:'sc-tripod-stand',      l:'Tripod Stand',      svg:'<line x1="8" y1="10" x2="24" y2="10" stroke="currentColor" stroke-width="3"/><line x1="8" y1="10" x2="4" y2="27" stroke="currentColor" stroke-width="2"/><line x1="24" y1="10" x2="28" y2="27" stroke="currentColor" stroke-width="2"/><line x1="16" y1="10" x2="16" y2="27" stroke="currentColor" stroke-width="1.8"/>' },
          { t:'sc-retort-stand',      l:'Retort Stand',      svg:'<rect x="6" y="26" width="20" height="4" fill="currentColor"/><line x1="10" y1="4" x2="10" y2="26" stroke="currentColor" stroke-width="2.5"/><line x1="10" y1="12" x2="22" y2="12" stroke="#38bdf8" stroke-width="2"/><circle cx="22" cy="12" r="3" stroke="#38bdf8" stroke-width="1.5" fill="none"/>' },
          { t:'sc-condenser',         l:'Liebig Condenser',  svg:'<rect x="6" y="11" width="20" height="10" rx="2" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".15"/><line x1="2" y1="16" x2="30" y2="16" stroke="#38bdf8" stroke-width="2"/><line x1="10" y1="6" x2="10" y2="11" stroke="#38bdf8" stroke-width="1.5"/><line x1="22" y1="21" x2="22" y2="26" stroke="#38bdf8" stroke-width="1.5"/>' },
          { t:'sc-thermometer',       l:'Thermometer',       svg:'<rect x="14" y="3" width="4" height="21" rx="2" stroke="#ef4444" stroke-width="1.5" fill="none"/><circle cx="16" cy="25" r="4.5" fill="#ef4444"/><line x1="16" y1="10" x2="16" y2="25" stroke="#ef4444" stroke-width="2"/>' },
          { t:'sc-lab-balance',       l:'Digital Balance',   svg:'<rect x="4" y="14" width="24" height="13" rx="2" stroke="#64748b" stroke-width="2" fill="#64748b" fill-opacity=".15"/><rect x="8" y="18" width="16" height="6" fill="#0f172a"/><text x="16" y="23" text-anchor="middle" font-size="5" fill="#10b981">0.00g</text><line x1="8" y1="11" x2="24" y2="11" stroke="#64748b" stroke-width="2.5"/>' },
        ]
      },

      // ── 05. MOLECULAR SHAPES & CHEMICAL NOTATION ──
      {
        label: '⚗ Molecular Geometry & Reactions',
        cat: 'molecules',
        shapes: [
          { t:'sc-mol-linear',            l:'Linear (180°)',       svg:'<line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="2.5"/><circle cx="6" cy="16" r="4" fill="#38bdf8"/><circle cx="16" cy="16" r="5" fill="#ef4444"/><circle cx="26" cy="16" r="4" fill="#38bdf8"/>' },
          { t:'sc-mol-bent',              l:'Bent H₂O',            svg:'<line x1="16" y1="10" x2="8" y2="22" stroke="currentColor" stroke-width="2"/><line x1="16" y1="10" x2="24" y2="22" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="10" r="5.5" fill="#ef4444"/><circle cx="8" cy="22" r="4" fill="#38bdf8"/><circle cx="24" cy="22" r="4" fill="#38bdf8"/>' },
          { t:'sc-mol-trigonal-planar',   l:'Trigonal Planar',     svg:'<line x1="16" y1="16" x2="16" y2="5" stroke="currentColor" stroke-width="2"/><line x1="16" y1="16" x2="6" y2="24" stroke="currentColor" stroke-width="2"/><line x1="16" y1="16" x2="26" y2="24" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#f59e0b"/><circle cx="16" cy="5" r="3.5" fill="#38bdf8"/><circle cx="6" cy="24" r="3.5" fill="#38bdf8"/><circle cx="26" cy="24" r="3.5" fill="#38bdf8"/>' },
          { t:'sc-mol-trigonal-pyramidal',l:'Pyramidal (NH₃)',     svg:'<line x1="16" y1="10" x2="7" y2="22" stroke="currentColor" stroke-width="2"/><line x1="16" y1="10" x2="16" y2="24" stroke="currentColor" stroke-width="2"/><line x1="16" y1="10" x2="25" y2="22" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="10" r="5" fill="#3b82f6"/><circle cx="7" cy="22" r="3.5" fill="#38bdf8"/><circle cx="16" cy="24" r="3.5" fill="#38bdf8"/><circle cx="25" cy="22" r="3.5" fill="#38bdf8"/>' },
          { t:'sc-mol-tetrahedral',       l:'Tetrahedral (CH₄)',   svg:'<line x1="16" y1="16" x2="16" y2="5" stroke="currentColor" stroke-width="2"/><line x1="16" y1="16" x2="7" y2="23" stroke="currentColor" stroke-width="2"/><line x1="16" y1="16" x2="19" y2="25" stroke="currentColor" stroke-width="2.5"/><line x1="16" y1="16" x2="26" y2="19" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#10b981"/><circle cx="16" cy="5" r="3.5" fill="#38bdf8"/><circle cx="7" cy="23" r="3.5" fill="#38bdf8"/><circle cx="19" cy="25" r="3.5" fill="#38bdf8"/><circle cx="26" cy="19" r="3.5" fill="#38bdf8"/>' },
          { t:'sc-mol-octahedral',        l:'Octahedral (SF₆)',    svg:'<line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-width="1.8"/><line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="1.8"/><line x1="7" y1="7" x2="25" y2="25" stroke="currentColor" stroke-width="1.8"/><circle cx="16" cy="16" r="4.5" fill="#a855f7"/><circle cx="16" cy="4" r="3" fill="#38bdf8"/><circle cx="16" cy="28" r="3" fill="#38bdf8"/><circle cx="4" cy="16" r="3" fill="#38bdf8"/><circle cx="28" cy="16" r="3" fill="#38bdf8"/>' },
          { t:'sc-atom-bohr',             l:'Bohr Atom',           svg:'<circle cx="16" cy="16" r="4" fill="#ef4444"/><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#38bdf8" stroke-width="1.2" fill="none"/><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#38bdf8" stroke-width="1.2" fill="none" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#38bdf8" stroke-width="1.2" fill="none" transform="rotate(120 16 16)"/>' },
          { t:'sc-chem-arrow-forward',    l:'Reaction ⟶',          svg:'<line x1="4" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="2.5"/><polygon points="26,16 19,11 19,21" fill="currentColor"/>' },
          { t:'sc-chem-arrow-equil',      l:'Equilibrium ⇌',       svg:'<line x1="4" y1="13" x2="26" y2="13" stroke="currentColor" stroke-width="2"/><polygon points="26,13 20,9 20,13" fill="currentColor"/><line x1="26" y1="19" x2="4" y2="19" stroke="currentColor" stroke-width="2"/><polygon points="4,19 10,19 10,23" fill="currentColor"/>' },
          { t:'sc-chem-delta',            l:'Heat (Δ)',            svg:'<polygon points="16,6 27,25 5,25" stroke="#ef4444" stroke-width="2.5" fill="#ef4444" fill-opacity=".2"/><text x="16" y="22" text-anchor="middle" font-size="10" fill="#ef4444" font-weight="700">Δ</text>' },
          { t:'sc-chem-gas-evolved',      l:'Gas Evolved (↑)',     svg:'<line x1="16" y1="26" x2="16" y2="6" stroke="#38bdf8" stroke-width="3"/><polygon points="16,4 10,12 22,12" fill="#38bdf8"/>' },
          { t:'sc-chem-precipitate',      l:'Precipitate (↓)',     svg:'<line x1="16" y1="6" x2="16" y2="26" stroke="#f59e0b" stroke-width="3"/><polygon points="16,28 10,20 22,20" fill="#f59e0b"/>' },
        ]
      },

      // ── 06. BIOLOGY DIAGRAMS & ORGANELLES ──
      {
        label: '🧬 Cell Biology & Organelles',
        cat: 'biology',
        shapes: [
          { t:'sc-animal-cell',    l:'Animal Cell',       svg:'<ellipse cx="16" cy="16" rx="13" ry="11" stroke="#ec4899" stroke-width="2" fill="#ec4899" fill-opacity=".12"/><ellipse cx="16" cy="16" rx="5" ry="4" stroke="#a855f7" stroke-width="1.5" fill="#a855f7" fill-opacity=".3"/><circle cx="16" cy="16" r="2" fill="#a855f7"/><ellipse cx="9" cy="12" rx="3" ry="1.5" fill="#f97316"/>' },
          { t:'sc-plant-cell',     l:'Plant Cell',        svg:'<rect x="4" y="4" width="24" height="24" rx="4" stroke="#10b981" stroke-width="2.5" fill="#10b981" fill-opacity=".1"/><rect x="6" y="6" width="20" height="20" rx="3" stroke="#10b981" stroke-width="1.2" fill="none"/><ellipse cx="16" cy="16" rx="7" ry="5" stroke="#38bdf8" stroke-width="1.5" fill="#38bdf8" fill-opacity=".3"/><ellipse cx="20" cy="11" rx="2.5" ry="2" fill="#a855f7"/>' },
          { t:'sc-bacterial-cell', l:'Bacterial Cell',    svg:'<rect x="6" y="11" width="16" height="10" rx="5" stroke="#eab308" stroke-width="2" fill="#eab308" fill-opacity=".15"/><path d="M22,16 Q26,10 28,16 T31,16" stroke="#eab308" stroke-width="1.8" fill="none"/><path d="M10,16 Q13,13 15,16 T19,16" stroke="#ef4444" stroke-width="1.2" fill="none"/>' },
          { t:'sc-nucleus',        l:'Nucleus & Nucleolus',svg:'<circle cx="16" cy="16" r="11" stroke="#a855f7" stroke-width="2" stroke-dasharray="3,2" fill="#a855f7" fill-opacity=".15"/><circle cx="16" cy="16" r="4.5" fill="#a855f7"/>' },
          { t:'sc-mitochondrion',  l:'Mitochondrion',     svg:'<ellipse cx="16" cy="16" rx="12" ry="7" stroke="#f97316" stroke-width="2" fill="#f97316" fill-opacity=".15"/><path d="M7,16 Q10,12 11,16 T16,16 T21,16" stroke="#f97316" stroke-width="1.5" fill="none"/>' },
          { t:'sc-chloroplast',    l:'Chloroplast',       svg:'<ellipse cx="16" cy="16" rx="12" ry="7" stroke="#10b981" stroke-width="2" fill="#10b981" fill-opacity=".15"/><line x1="9" y1="13" x2="9" y2="19" stroke="#10b981" stroke-width="2"/><line x1="16" y1="12" x2="16" y2="20" stroke="#10b981" stroke-width="2"/><line x1="23" y1="13" x2="23" y2="19" stroke="#10b981" stroke-width="2"/>' },
          { t:'sc-neuron',         l:'Neuron Cell',       svg:'<circle cx="8" cy="16" r="4.5" fill="#06b6d4"/><line x1="12.5" y1="16" x2="26" y2="16" stroke="#06b6d4" stroke-width="2"/><line x1="8" y1="11.5" x2="5" y2="6" stroke="#06b6d4" stroke-width="1.5"/><line x1="8" y1="20.5" x2="5" y2="26" stroke="#06b6d4" stroke-width="1.5"/><line x1="26" y1="16" x2="29" y2="12" stroke="#06b6d4" stroke-width="1.5"/><line x1="26" y1="16" x2="29" y2="20" stroke="#06b6d4" stroke-width="1.5"/>' },
          { t:'sc-label-pointer',  l:'Leader Pointer',    svg:'<circle cx="5" cy="16" r="2.5" fill="currentColor"/><line x1="7" y1="16" x2="18" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="16" x2="24" y2="9" stroke="currentColor" stroke-width="1.5"/><line x1="24" y1="9" x2="29" y2="9" stroke="currentColor" stroke-width="1.5"/>' },
        ]
      },

      // ── 07. HUMAN ANATOMY & GENETICS ──
      {
        label: '🫀 Anatomy & Genetics',
        cat: 'anatomy',
        shapes: [
          { t:'sc-human-heart',    l:'Human Heart',       svg:'<path d="M16,26 C6,18 4,12 8,7 C12,3 16,8 16,8 C16,8 20,3 24,7 C28,12 26,18 16,26 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>' },
          { t:'sc-human-lungs',    l:'Lungs & Bronchi',   svg:'<line x1="16" y1="4" x2="16" y2="13" stroke="currentColor" stroke-width="2"/><line x1="16" y1="13" x2="10" y2="17" stroke="currentColor" stroke-width="1.8"/><line x1="16" y1="13" x2="22" y2="17" stroke="currentColor" stroke-width="1.8"/><ellipse cx="9" cy="20" rx="5" ry="7" stroke="#f43f5e" stroke-width="1.5" fill="#f43f5e" fill-opacity=".2"/><ellipse cx="23" cy="20" rx="5" ry="7" stroke="#f43f5e" stroke-width="1.5" fill="#f43f5e" fill-opacity=".2"/>' },
          { t:'sc-human-brain',    l:'Human Brain',       svg:'<path d="M7,18 Q4,10 12,7 Q16,5 20,7 Q28,10 25,18 Q23,26 16,25 Q9,26 7,18 Z" stroke="#ec4899" stroke-width="1.8" fill="#ec4899" fill-opacity=".15"/><path d="M12,12 Q16,14 16,22" stroke="#ec4899" stroke-width="1.2" fill="none"/>' },
          { t:'sc-human-eye',      l:'Human Eye',         svg:'<path d="M4,16 Q16,6 28,16 Q16,26 4,16 Z" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".1"/><circle cx="16" cy="16" r="6" stroke="#38bdf8" stroke-width="1.5" fill="#0284c7"/><circle cx="16" cy="16" r="2.5" fill="#0f172a"/>' },
          { t:'sc-human-kidney',   l:'Kidney Cross-Sec.', svg:'<path d="M11,6 Q23,6 23,16 Q23,26 11,26 Q17,16 11,6 Z" stroke="#b91c1c" stroke-width="1.8" fill="#ef4444" fill-opacity=".25"/>' },
          { t:'sc-blood-cells',    l:'Blood Cells',       svg:'<circle cx="11" cy="16" r="7" stroke="#ef4444" stroke-width="2" fill="#ef4444" fill-opacity=".3"/><circle cx="11" cy="16" r="3" fill="#b91c1c"/><circle cx="23" cy="14" r="5" stroke="#38bdf8" stroke-width="1.8" fill="#f8fafc"/>' },
          { t:'sc-dna-helix',      l:'DNA Helix',         svg:'<path d="M10,4 Q16,10 10,16 Q4,22 10,28" stroke="#06b6d4" stroke-width="2" fill="none"/><path d="M22,4 Q16,10 22,16 Q28,22 22,28" stroke="#ec4899" stroke-width="2" fill="none"/><line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="22" x2="22" y2="22" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-chromosome',     l:'Chromosome',        svg:'<line x1="8" y1="6" x2="24" y2="26" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/><line x1="24" y1="6" x2="8" y2="26" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="2.5" fill="#facc15"/>' },
          { t:'sc-punnett-square', l:'Punnett Square',    svg:'<rect x="7" y="7" width="18" height="18" stroke="#38bdf8" stroke-width="1.8" fill="#38bdf8" fill-opacity=".1"/><line x1="16" y1="7" x2="16" y2="25" stroke="#38bdf8" stroke-width="1.5"/><line x1="7" y1="16" x2="25" y2="16" stroke="#38bdf8" stroke-width="1.5"/><text x="11.5" y="13.5" text-anchor="middle" font-size="6" fill="currentColor">BB</text><text x="20.5" y="13.5" text-anchor="middle" font-size="6" fill="currentColor">Bb</text><text x="11.5" y="22.5" text-anchor="middle" font-size="6" fill="currentColor">Bb</text><text x="20.5" y="22.5" text-anchor="middle" font-size="6" fill="currentColor">bb</text>' },
        ]
      },

      // ── 08. EARTH SCIENCE & ASTRONOMY ──
      {
        label: '🌍 Earth Science & Universe',
        cat: 'earth',
        shapes: [
          { t:'sc-earth',         l:'Earth Globe',       svg:'<circle cx="16" cy="16" r="11" stroke="#38bdf8" stroke-width="1.8" fill="#0284c7" fill-opacity=".2"/><ellipse cx="16" cy="16" rx="11" ry="4" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2" fill="none"/><line x1="16" y1="3" x2="16" y2="29" stroke="currentColor" stroke-width="1.2"/>' },
          { t:'sc-sun',           l:'Sun & Corona',      svg:'<circle cx="16" cy="16" r="7" fill="#f59e0b"/><line x1="16" y1="3" x2="16" y2="6" stroke="#f59e0b" stroke-width="2"/><line x1="16" y1="26" x2="16" y2="29" stroke="#f59e0b" stroke-width="2"/><line x1="3" y1="16" x2="6" y2="16" stroke="#f59e0b" stroke-width="2"/><line x1="26" y1="16" x2="29" y2="16" stroke="#f59e0b" stroke-width="2"/>' },
          { t:'sc-moon-phases',   l:'Moon Phases',       svg:'<circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M16,6 A10,10 0 0,1 16,26 A6,10 0 0,0 16,6 Z" fill="currentColor"/>' },
          { t:'sc-solar-eclipse', l:'Solar Eclipse',     svg:'<circle cx="12" cy="16" r="8" fill="#f59e0b"/><circle cx="19" cy="16" r="7" fill="#0f172a" stroke="#fff" stroke-width="1"/>' },
          { t:'sc-orbit',         l:'Planetary Orbit',   svg:'<ellipse cx="16" cy="16" rx="13" ry="6" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,2" fill="none"/><circle cx="16" cy="16" r="4" fill="#f59e0b"/><circle cx="27" cy="14" r="2.2" fill="#38bdf8"/>' },
          { t:'sc-telescope',     l:'Telescope',         svg:'<line x1="7" y1="21" x2="25" y2="9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="16" y1="15" x2="12" y2="27" stroke="currentColor" stroke-width="1.8"/><line x1="16" y1="15" x2="20" y2="27" stroke="currentColor" stroke-width="1.8"/>' },
          { t:'sc-volcano',       l:'Volcano & Magma',   svg:'<polygon points="4,26 28,26 20,12 12,12" stroke="#d97706" stroke-width="2" fill="#d97706" fill-opacity=".2"/><path d="M16,12 Q17,5 15,3 Q19,7 16,12" stroke="#ef4444" stroke-width="2.5" fill="none"/>' },
          { t:'sc-water-cycle',   l:'Water Cycle',       svg:'<path d="M4,24 Q16,20 28,24" stroke="#0284c7" stroke-width="2"/><path d="M8,20 Q8,10 16,10" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2,2"/><polygon points="16,10 13,8 13,12" fill="#38bdf8"/><path d="M24,10 Q24,20 18,20" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="2,2"/><polygon points="18,20 21,18 21,22" fill="#0284c7"/>' },
          { t:'sc-earth-layers',  l:'Earth Layers',      svg:'<circle cx="16" cy="16" r="12" stroke="#d97706" stroke-width="1.5" fill="#78350f" fill-opacity=".3"/><circle cx="16" cy="16" r="8" stroke="#f59e0b" stroke-width="1.2" fill="#ea580c" fill-opacity=".4"/><circle cx="16" cy="16" r="4" fill="#facc15"/>' },
        ]
      },

      // ── 09. SCIENTIFIC SYMBOLS, GREEK LETTERS & UNITS ──
      {
        label: '📐 Scientific Symbols & SI Units',
        cat: 'symbols-units',
        shapes: [
          { t:'sc-sym-alpha',     l:'Alpha (α)',         svg:'<text x="16" y="22" text-anchor="middle" font-size="20" fill="#38bdf8" font-family="serif">α</text>' },
          { t:'sc-sym-beta',      l:'Beta (β)',          svg:'<text x="16" y="22" text-anchor="middle" font-size="20" fill="#38bdf8" font-family="serif">β</text>' },
          { t:'sc-sym-gamma',     l:'Gamma (γ)',         svg:'<text x="16" y="22" text-anchor="middle" font-size="20" fill="#38bdf8" font-family="serif">γ</text>' },
          { t:'sc-sym-theta',     l:'Theta (θ)',         svg:'<text x="16" y="22" text-anchor="middle" font-size="20" fill="#38bdf8" font-family="serif">θ</text>' },
          { t:'sc-sym-lambda',    l:'Lambda (λ)',        svg:'<text x="16" y="22" text-anchor="middle" font-size="20" fill="#38bdf8" font-family="serif">λ</text>' },
          { t:'sc-sym-omega',     l:'Omega (Ω)',         svg:'<text x="16" y="22" text-anchor="middle" font-size="20" fill="#38bdf8" font-family="serif">Ω</text>' },
          { t:'sc-sym-si-units',  l:'SI Units Table',    svg:'<rect x="4" y="6" width="24" height="20" rx="3" stroke="#10b981" stroke-width="1.5" fill="#10b981" fill-opacity=".15"/><text x="16" y="16" text-anchor="middle" font-size="7" font-weight="700" fill="#10b981">SI UNITS</text><text x="16" y="22" text-anchor="middle" font-size="5" fill="currentColor">m, kg, s, N, J</text>' },
        ]
      },

      // ── 10. LABORATORY SAFETY & WARNING SYMBOLS ──
      {
        label: '⚠️ Laboratory Safety Signs',
        cat: 'safety',
        shapes: [
          { t:'sc-safe-flammable',   l:'Flammable Hazard',  svg:'<polygon points="16,3 29,16 16,29 3,16" stroke="#ef4444" stroke-width="2" fill="#ef4444" fill-opacity=".15"/><path d="M16,11 Q19,16 17,21 Q15,23 13,20 Q12,17 14,15 Q14,13 16,11 Z" fill="#ef4444"/>' },
          { t:'sc-safe-toxic',       l:'Toxic Poison',      svg:'<polygon points="16,3 29,16 16,29 3,16" stroke="#ef4444" stroke-width="2" fill="#ef4444" fill-opacity=".15"/><circle cx="16" cy="14" r="4.5" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="#fff"/><circle cx="18" cy="13" r="1" fill="#fff"/><line x1="12" y1="21" x2="20" y2="21" stroke="currentColor" stroke-width="2"/>' },
          { t:'sc-safe-corrosive',   l:'Corrosive Acid',    svg:'<polygon points="16,3 29,16 16,29 3,16" stroke="#ef4444" stroke-width="2" fill="#ef4444" fill-opacity=".15"/><line x1="10" y1="11" x2="13" y2="18" stroke="currentColor" stroke-width="2"/><line x1="22" y1="11" x2="19" y2="18" stroke="currentColor" stroke-width="2"/><rect x="8" y="21" width="16" height="3" fill="#ef4444"/>' },
          { t:'sc-safe-explosive',   l:'Explosive Hazard',  svg:'<polygon points="16,3 29,16 16,29 3,16" stroke="#ef4444" stroke-width="2" fill="#ef4444" fill-opacity=".15"/><circle cx="16" cy="16" r="3.5" fill="#ef4444"/><line x1="16" y1="9" x2="16" y2="6" stroke="#ef4444" stroke-width="1.8"/><line x1="21" y1="11" x2="24" y2="9" stroke="#ef4444" stroke-width="1.8"/><line x1="11" y1="11" x2="8" y2="9" stroke="#ef4444" stroke-width="1.8"/>' },
          { t:'sc-safe-biohazard',   l:'Biohazard Sign',    svg:'<polygon points="16,3 29,16 16,29 3,16" stroke="#f59e0b" stroke-width="2" fill="#f59e0b" fill-opacity=".15"/><circle cx="16" cy="14" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="13" cy="19" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="19" cy="19" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
          { t:'sc-safe-radiation',   l:'Radiation Hazard',  svg:'<circle cx="16" cy="16" r="12" stroke="#eab308" stroke-width="2" fill="#eab308" fill-opacity=".2"/><circle cx="16" cy="16" r="3" fill="#0f172a"/><path d="M16,13 L12,7 A9,9 0 0,1 20,7 Z" fill="#0f172a"/><path d="M13,18 L7,20 A9,9 0 0,1 11,25 Z" fill="#0f172a"/><path d="M19,18 L25,20 A9,9 0 0,0 21,25 Z" fill="#0f172a"/>' },
          { t:'sc-safe-high-voltage',l:'High Voltage ⚡',   svg:'<polygon points="16,3 29,16 16,29 3,16" stroke="#eab308" stroke-width="2" fill="#eab308" fill-opacity=".15"/><polygon points="17,9 11,17 16,17 15,23 21,15 16,15" fill="#eab308"/>' },
        ]
      }
    ];

    const PHYSICS_SECTIONS = [
      {
        label: '🚀 Mechanics & Kinematics',
        cat: 'mechanics',
        shapes: [
          { isSim: true, simId: 'projectile', t:'sim-projectile', l:'Projectile Lab', desc:'Trajectory, Drag & Max Height', svg:'<path d="M4,27 Q16,5 28,27" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="10.5" r="3.5" fill="#f59e0b"/><line x1="2" y1="27" x2="30" y2="27" stroke="currentColor" stroke-width="1.8"/><circle cx="28" cy="27" r="2" fill="#ef4444"/>' },
          { isSim: true, simId: 'pendulum', t:'sim-pendulum', l:'Pendulum Lab', desc:'Simple & Damped Harmonic', svg:'<line x1="8" y1="4" x2="24" y2="4" stroke="currentColor" stroke-width="2.2"/><line x1="16" y1="4" x2="24" y2="21" stroke="#d97706" stroke-width="2"/><circle cx="24" cy="21" r="5.5" fill="#f59e0b" stroke="currentColor" stroke-width="1.2"/><path d="M10,21 Q16,25 22,21" stroke="#d97706" stroke-width="1.2" stroke-dasharray="2,2"/>' },
          { isSim: true, simId: 'collision', t:'sim-collision', l:'Collisions 1D', desc:'Momentum & Restitution', svg:'<line x1="2" y1="23" x2="30" y2="23" stroke="currentColor" stroke-width="2"/><rect x="4" y="13" width="9" height="7" rx="1.5" fill="#0284c7"/><rect x="19" y="13" width="9" height="7" rx="1.5" fill="#ea580c"/><circle cx="16" cy="16.5" r="3" fill="#eab308"/><line x1="6" y1="9" x2="11" y2="9" stroke="#0284c7" stroke-width="1.5"/><line x1="26" y1="9" x2="21" y2="9" stroke="#ea580c" stroke-width="1.5"/>' },
          { isSim: true, simId: 'incline', t:'sim-incline', l:'Incline & FBD', desc:'Gravity, Friction & Slopes', svg:'<polygon points="4,26 28,26 28,10" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".12"/><rect x="13" y="12" width="8" height="6" rx="1" transform="rotate(-33 13 12)" fill="#0284c7"/><line x1="15" y1="13" x2="11" y2="7" stroke="#ef4444" stroke-width="1.8"/>' },
          { t:'sc-force-vector',  l:'Force Vector', svg:'<line x1="4" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="2"/><polygon points="26,16 20,12 20,20" fill="currentColor"/><text x="14" y="11" text-anchor="middle" font-size="8" fill="currentColor">F</text>' },
          { t:'sc-motion-arrow',  l:'Velocity',     svg:'<path d="M4,16 C10,8 20,8 26,16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-dasharray="3,2"/><polygon points="27,16 21,13 22,19" fill="currentColor"/><text x="16" y="24" text-anchor="middle" font-size="8" fill="currentColor">v</text>' },
          { t:'sc-free-body',     l:'Free Body',    svg:'<circle cx="16" cy="16" r="5" fill="currentColor" fill-opacity=".3"/><line x1="16" y1="4" x2="16" y2="11" stroke="currentColor" stroke-width="1.5"/><polygon points="16,3 13,9 19,9" fill="currentColor"/><line x1="16" y1="21" x2="16" y2="29" stroke="currentColor" stroke-width="1.5"/><polygon points="16,30 13,24 19,24" fill="currentColor"/><line x1="4" y1="16" x2="11" y2="16" stroke="currentColor" stroke-width="1.5"/><polygon points="3,16 9,13 9,19" fill="currentColor"/>' },
          { t:'sc-pulley',        l:'Pulley Sys',   svg:'<circle cx="16" cy="11" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="9" y1="11" x2="9" y2="28" stroke="currentColor" stroke-width="1.2"/><line x1="23" y1="11" x2="23" y2="24" stroke="currentColor" stroke-width="1.2"/><rect x="5" y="25" width="8" height="6" stroke="currentColor" stroke-width="1" fill="currentColor" fill-opacity=".2"/>' },
        ]
      },
      {
        label: '🌊 Waves & Superposition',
        cat: 'oscillations',
        shapes: [
          { isSim: true, simId: 'waves', t:'sim-waves', l:'Waves Lab', desc:'Standing & Traveling Harmonics', svg:'<path d="M3,16 Q9,6 16,16 T29,16" stroke="#38bdf8" stroke-width="2.5" fill="none"/><circle cx="3" cy="16" r="2.5" fill="#ef4444"/><circle cx="16" cy="16" r="2.5" fill="#ef4444"/><circle cx="29" cy="16" r="2.5" fill="#ef4444"/><circle cx="9.5" cy="11" r="2" fill="#4ade80"/><circle cx="22.5" cy="21" r="2" fill="#4ade80"/>' },
          { t:'sc-compass',       l:'Compass',      svg:'<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/><polygon points="16,6 19,16 16,14 13,16" fill="currentColor"/><polygon points="16,26 19,16 16,14 13,16" fill="currentColor" fill-opacity=".3"/>' },
        ]
      },
      {
        label: '🔍 Optics & Snell\'s Law',
        cat: 'optics',
        shapes: [
          { isSim: true, simId: 'optics', t:'sim-optics', l:'Optics Lab', desc:'Refraction & Thin Lens Tracer', svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="#c9a84c" stroke-width="2"/><line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2,2"/><line x1="6" y1="7" x2="16" y2="16" stroke="#ef4444" stroke-width="2.2"/><line x1="16" y1="16" x2="25" y2="27" stroke="#38bdf8" stroke-width="2.2"/><circle cx="16" cy="16" r="2.5" fill="#facc15"/>' },
          { t:'sc-convex-lens',   l:'Conv.Lens',    svg:'<path d="M16,4 Q26,16 16,28 Q6,16 16,4" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".12"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' },
          { t:'sc-concave-lens',  l:'Conc.Lens',    svg:'<path d="M12,4 Q18,16 12,28" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M20,4 Q14,16 20,28" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' },
          { t:'sc-optical-ray',   l:'Light Ray',    svg:'<line x1="3" y1="16" x2="27" y2="16" stroke="currentColor" stroke-width="2"/><polygon points="18,16 13,12 13,20" fill="currentColor"/>' },
        ]
      },
      {
        label: '⚡ Electricity & Lorentz Force',
        cat: 'circuits',
        shapes: [
          { isSim: true, simId: 'circuits', t:'sim-circuits', l:'Circuits Lab', desc:'Ohm\'s Law & B-Field Motion', svg:'<rect x="5" y="7" width="22" height="18" rx="2" stroke="#64748b" stroke-width="2" fill="none"/><line x1="12" y1="7" x2="14" y2="4" stroke="#e8c96b" stroke-width="2"/><line x1="14" y1="4" x2="18" y2="10" stroke="#e8c96b" stroke-width="2"/><line x1="18" y1="10" x2="20" y2="7" stroke="#e8c96b" stroke-width="2"/><circle cx="16" cy="25" r="2.5" fill="#38bdf8"/>' },
          { t:'sc-battery',       l:'Battery',      svg:'<line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="10" x2="10" y2="22" stroke="currentColor" stroke-width="2.5"/><line x1="16" y1="12" x2="16" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="22" y1="10" x2="22" y2="22" stroke="currentColor" stroke-width="2.5"/><line x1="26" y1="12" x2="26" y2="20" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-resistor',      l:'Resistor',     svg:'<line x1="2" y1="16" x2="7" y2="16" stroke="currentColor" stroke-width="1.5"/><rect x="7" y="11" width="18" height="10" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".12"/><line x1="25" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-bulb',          l:'Bulb',         svg:'<circle cx="16" cy="14" r="9" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".1"/><line x1="12" y1="11" x2="20" y2="17" stroke="currentColor" stroke-width="1.2"/><line x1="20" y1="11" x2="12" y2="17" stroke="currentColor" stroke-width="1.2"/><line x1="13" y1="23" x2="19" y2="23" stroke="currentColor" stroke-width="1.5"/><line x1="14" y1="26" x2="18" y2="26" stroke="currentColor" stroke-width="1.5"/>' },
          { t:'sc-bar-magnet',    l:'Bar Magnet',   svg:'<rect x="2" y="11" width="28" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="2" y="11" width="14" height="10" fill="currentColor" fill-opacity=".3"/><text x="9" y="19" text-anchor="middle" font-size="8" fill="currentColor" font-weight="700">N</text><text x="23" y="19" text-anchor="middle" font-size="8" fill="currentColor">S</text>' },
        ]
      },
      {
        label: '🔥 Thermodynamics & Gas Laws',
        cat: 'thermo',
        shapes: [
          { isSim: true, simId: 'thermodynamics', t:'sim-thermodynamics', l:'Thermo Lab', desc:'Kinetic Gas & P-V Chamber', svg:'<rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".08"/><line x1="20" y1="6" x2="20" y2="26" stroke="#c9a84c" stroke-width="2.5"/><circle cx="10" cy="12" r="2" fill="#ef4444"/><circle cx="15" cy="19" r="2" fill="#38bdf8"/><circle cx="8" cy="21" r="2" fill="#facc15"/><circle cx="13" cy="9" r="2" fill="#4ade80"/>' },
          { t:'sc-bunsen',        l:'Bunsen',       svg:'<line x1="16" y1="12" x2="16" y2="26" stroke="currentColor" stroke-width="3"/><line x1="8" y1="26" x2="24" y2="26" stroke="currentColor" stroke-width="2.5"/><path d="M16,12 Q19,6 16,2 Q13,6 16,12 Z" fill="currentColor" fill-opacity=".4"/>' },
          { t:'sc-erlenmeyer',    l:'Flask',        svg:'<polygon points="13,4 19,4 27,26 5,26" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".1"/><line x1="11" y1="4" x2="21" y2="4" stroke="currentColor" stroke-width="2"/>' },
        ]
      }
    ];

    const SECTIONS = activeShapesDomain === 'engineering' ? ENGINEERING_SECTIONS : (activeShapesDomain === 'science' ? SCIENCE_SECTIONS : (activeShapesDomain === 'physics' ? PHYSICS_SECTIONS : MATH_SECTIONS));

    grid.innerHTML = '';
    SECTIONS.forEach(sec => {
      // Section label
      const lbl = document.createElement('div');
      lbl.className = 'fsc-sec-hdr';
      lbl.dataset.cat = sec.cat || (activeShapesDomain === 'physics' ? 'mechanics' : (activeShapesDomain === 'science' ? 'circuits' : '2d'));
      lbl.innerHTML = `<span>${sec.label}</span><span class="fsc-badge">${sec.shapes.length}</span>`;
      grid.appendChild(lbl);

      sec.shapes.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'shape-btn';
        if (s.isTool) btn.classList.add('is-tool-btn');
        if (s.isSim || s.isMathLab) btn.classList.add('is-sim-btn');
        btn.dataset.cat = sec.cat || (activeShapesDomain === 'physics' ? 'mechanics' : (activeShapesDomain === 'science' ? 'circuits' : '2d'));
        btn.title = s.l + (s.desc ? ` - ${s.desc}` : '');
        btn.innerHTML = `<svg viewBox="0 0 32 32" fill="none" style="color:currentColor">${s.svg}</svg><span class="sl">${s.l}</span>`;
        btn.addEventListener('click', () => {
          if (s.is2DGraphable) {
            if (typeof GraphObject !== 'undefined' && GraphObject.insertGraphOnBoard) {
              GraphObject.insertGraphOnBoard();
              UI.closeShapesFlyout();
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('📈 Opened 2D Graphable Workspace!');
              }
            }
          } else if (s.isGraphTool) {
            if (typeof GraphEngine !== 'undefined' && GraphEngine.show) {
              GraphEngine.show();
              UI.closeShapesFlyout();
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('📈 Opened Live Graphs & Statistics!');
              }
            }
          } else if (s.isMathLab) {
            if (typeof MathVisualizer !== 'undefined' && MathVisualizer.show) {
              MathVisualizer.show(s.modId);
              UI.closeShapesFlyout();
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`📐 Opened ${s.l}!`);
              }
            }
          } else if (s.isSim) {
            if (typeof PhysicsLab !== 'undefined' && PhysicsLab.show) {
              PhysicsLab.show(s.simId);
              UI.closeShapesFlyout();
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`⚡ Opened ${s.l} simulation!`);
              }
            }
          } else if (s.isTool) {
            if (typeof App !== 'undefined' && App.setTool) {
              App.setTool(s.t);
              UI.closeShapesFlyout();
              if (s.t === 'measure-line') App.showToast('📏 Measured Line: Drag between points (snaps to vertices)');
              else if (s.t === 'measure-angle') App.showToast('📐 Angle Tool: Click Vertex, then 2 arms');
              else if (s.t === 'compass') App.showToast('🧭 Compass: drag the needle, pencil or grip — then press Draw');
            }
          } else {
            if (typeof WorkspaceSplit !== 'undefined' && WorkspaceSplit.getMode() !== 'normal') {
              WorkspaceSplit.addShapeToActive(s.t);
              UI.closeShapesFlyout();
            } else {
              Canvas.addShape(s.t);
            }
          }
        });
        grid.appendChild(btn);
      });
    });
  }

  // ─────────────────────────────────────────────
  function buildColorPalette() {
    const pal = document.getElementById('color-palette');
    const COLORS = [
      '#0f172a','#ffffff','#ef4444','#22c55e','#c9a84c','#a855f7',
      '#f97316','#06b6d4','#ec4899','#6b7280'
    ];
    if (pal) {
      pal.innerHTML = '';
      COLORS.forEach(hex => {
        const d = document.createElement('div');
        d.className = `color-dot${hex === App.currentColor ? ' active' : ''}`;
        d.dataset.hex = hex;
        d.style.background = hex;
        if (hex === '#ffffff') d.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.15)';
        d.addEventListener('click', () => App.setColor(hex));
        pal.appendChild(d);
      });
    }
    const cc = document.getElementById('custom-color');
    if (cc) cc.addEventListener('input', e => App.setColor(e.target.value));
  }

  // ─────────────────────────────────────────────
  function buildPenSizes() {
    const wrap = document.getElementById('pen-sizes');
    if (wrap) {
      [{ sz:2,dot:4 },{ sz:4,dot:7 },{ sz:8,dot:11 },{ sz:16,dot:16 }].forEach(p => {
        const btn = document.createElement('button');
        btn.className = `pen-sz${p.sz === App.penSize ? ' active' : ''}`;
        btn.title = `${p.sz}px`;
        btn.innerHTML = `<div style="width:${p.dot}px;height:${p.dot}px;border-radius:50%;background:var(--gold)"></div>`;
        btn.addEventListener('click', () => {
          App.penSize = p.sz;
          if (typeof WorkspaceSplit !== 'undefined' && WorkspaceSplit.getMode() !== 'normal') {
            WorkspaceSplit.setActivePartitionSize(p.sz);
          }
          document.querySelectorAll('.pen-sz').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
        wrap.appendChild(btn);
      });
    }
  }

  // ─────────────────────────────────────────────
  function showPropPanel(shape) {
    const sec = document.getElementById('props-sec');
    const cnt = document.getElementById('props-content');
    if (!sec || !cnt) return;
    if (!shape || !getPropDefs(shape).length) { sec.style.display='none'; return; }
    sec.style.display = 'block';
    cnt.innerHTML = '';

    getPropDefs(shape).forEach(p => {
      const row = document.createElement('div');
      row.className = 'prop-row';

      // Unit label — show cm for display, px internally
      const cmVal = (+(shape[p.key] || 0) * 0.1).toFixed(1);

      row.innerHTML = `
        <span class="prop-lbl">${p.label}</span>
        <input class="prop-inp"
          type="text"
          inputmode="decimal"
          value="${Math.round(shape[p.key] || 0)}"
          placeholder="e.g. 80"
          style="width:100%;text-align:left;letter-spacing:.02em">
        <span class="prop-unit" style="white-space:nowrap;font-size:9px;min-width:22px">px</span>`;

      const input = row.querySelector('input');

      // Apply on every keystroke immediately
      input.addEventListener('input', function() {
        const v = parseFloat(this.value);
        if (!isNaN(v) && v > 0) Canvas.updateProp(p.key, v);
      });

      // Select all text on focus so teacher can just type new value
      input.addEventListener('focus', function() {
        setTimeout(() => this.select(), 0);
      });

      // Also accept Enter key
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const v = parseFloat(this.value);
          if (!isNaN(v) && v > 0) Canvas.updateProp(p.key, v);
          this.blur();
        }
        // Prevent canvas keyboard shortcuts while typing in input
        e.stopPropagation();
      });

      cnt.appendChild(row);
    });

    // Edit Text button for text blocks
    if (shape.type === 'text-block') {
      const editBtn = document.createElement('button');
      editBtn.innerHTML = `
        <svg viewBox="0 0 18 18" fill="none" style="width:13px;height:13px">
          <path d="M13 2.5l2.5 2.5L5 15H2.5v-2.5L13 2.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        Edit Text Content`;
      editBtn.style.cssText = `
        width:100%;margin-top:10px;padding:8px 12px;
        border-radius:6px;border:1px solid rgba(201,168,76,.4);
        background:rgba(201,168,76,.12);color:#e8c96b;
        font-size:12px;font-weight:600;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:6px;
        transition:all .15s;font-family:'Inter',sans-serif;
      `;
      editBtn.addEventListener('click', () => Drawing.editText(shape));
      cnt.appendChild(editBtn);
    }

    // Image Action Buttons for image shapes
    if (shape.type === 'image') {
      const fitBtn = document.createElement('button');
      fitBtn.innerHTML = `
        <svg viewBox="0 0 18 18" fill="none" style="width:13px;height:13px">
          <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 9h6M9 6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Fit to Screen`;
      fitBtn.style.cssText = `
        width:100%;margin-top:8px;padding:7px 10px;border-radius:6px;
        border:1px solid rgba(56,189,248,.4);background:rgba(56,189,248,.1);
        color:#7dd3fc;font-size:11.5px;font-weight:600;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:6px;
        transition:all .15s;font-family:'Inter',sans-serif;
      `;
      fitBtn.addEventListener('click', () => {
        if (typeof ImageTool !== 'undefined') ImageTool.fitToScreen(shape);
      });
      cnt.appendChild(fitBtn);

      const bgBtn = document.createElement('button');
      bgBtn.innerHTML = `
        <svg viewBox="0 0 18 18" fill="none" style="width:13px;height:13px">
          <rect x="2" y="3" width="14" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
          <circle cx="6" cy="7" r="1.5" fill="currentColor"/>
          <path d="M3 12l4-3 5 4" stroke="currentColor" stroke-width="1.3"/>
        </svg>
        Set as Board Background`;
      bgBtn.style.cssText = `
        width:100%;margin-top:6px;padding:7px 10px;border-radius:6px;
        border:1px solid rgba(201,168,76,.4);background:rgba(201,168,76,.1);
        color:#e8c96b;font-size:11.5px;font-weight:600;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:6px;
        transition:all .15s;font-family:'Inter',sans-serif;
      `;
      bgBtn.addEventListener('click', () => {
        if (typeof ImageTool !== 'undefined') ImageTool.setAsBackground(shape);
      });
      cnt.appendChild(bgBtn);
    }

    // Delete button at bottom of props panel
    const delBtn = document.createElement('button');
    delBtn.innerHTML = `
      <svg viewBox="0 0 18 18" fill="none" style="width:13px;height:13px">
        <path d="M3 5h12M8 5V3h2v2M7 8v5M11 8v5M4 5l1 10h8l1-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Delete Shape`;
    delBtn.style.cssText = `
      width:100%;margin-top:10px;padding:8px 12px;
      border-radius:6px;border:1px solid rgba(239,68,68,.4);
      background:rgba(239,68,68,.1);color:#fca5a5;
      font-size:12px;font-weight:600;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:6px;
      transition:all .15s;font-family:'Inter',sans-serif;
    `;
    delBtn.addEventListener('mouseenter', () => {
      delBtn.style.background = 'rgba(239,68,68,.22)';
      delBtn.style.borderColor = 'rgba(239,68,68,.7)';
    });
    delBtn.addEventListener('mouseleave', () => {
      delBtn.style.background = 'rgba(239,68,68,.1)';
      delBtn.style.borderColor = 'rgba(239,68,68,.4)';
    });
    delBtn.addEventListener('click', () => Canvas.deleteShape());
    cnt.appendChild(delBtn);
  }  // ← end showPropPanel

  function hidePropPanel() {
    const sec = document.getElementById('props-sec');
    if (sec) sec.style.display = 'none';
  }

  function getPropDefs(s) {
    return ({
      image:        [{ label:'Width', key:'w' },{ label:'Height', key:'h' }],
      'text-block': [{ label:'Font Size', key:'fontSize', min:8, max:160 }],
      rectangle:    [{ label:'Width', key:'w' },{ label:'Height', key:'h' }],
      square:       [{ label:'Side',  key:'w' }],
      circle:       [{ label:'Radius', key:'r' }],
      triangle:     [{ label:'Base', key:'base' },{ label:'Height', key:'height' }],
      trapezium:    [{ label:'Top (a)', key:'a' },{ label:'Bottom (b)', key:'b' },{ label:'Height', key:'h' }],
      parallelogram:[{ label:'Base', key:'base' },{ label:'Height', key:'h' }],
      rhombus:      [{ label:'Diag d₁', key:'d1' },{ label:'Diag d₂', key:'d2' }],
      sector:       [{ label:'Radius', key:'r' },{ label:'Angle°', key:'angle', step:1, min:1 }],
      equilateral:   [{ label:'Side', key:'side' }],
      rightTriangle: [{ label:'Base', key:'base' },{ label:'Height', key:'height' }],
      hollowCylinder:[{ label:'Outer R', key:'R' },{ label:'Inner r', key:'r' },{ label:'Height', key:'h' }],
      hemisphere:    [{ label:'Radius', key:'r' }],
      rectPrism:     [{ label:'Length', key:'w' },{ label:'Depth', key:'depth' },{ label:'Height', key:'h' }],
      pentPrism:     [{ label:'Radius', key:'r' },{ label:'Length', key:'depth' }],
      hexPrism:      [{ label:'Radius', key:'r' },{ label:'Length', key:'depth' }],
      prism:         [{ label:'Base', key:'base' },{ label:'Height', key:'height' },{ label:'Length', key:'depth' }],
      pyramid:       [{ label:'Base', key:'base' },{ label:'Height', key:'h' }],
      ellipse:      [{ label:'Semi-a (rx)', key:'rx' },{ label:'Semi-b (ry)', key:'ry' }],
      pentagon:     [{ label:'Radius', key:'r' }],
      hexagon:      [{ label:'Radius', key:'r' }],
      octagon:      [{ label:'Radius', key:'r' }],
      kite:         [{ label:'Width', key:'w' },{ label:'Top height', key:'h1' },{ label:'Bot height', key:'h2' }],
      sphere:       [{ label:'Radius', key:'r' }],
      cuboid:       [{ label:'Length', key:'w' },{ label:'Height', key:'h' },{ label:'Depth', key:'d' }],
      protractor:   [{ label:'Radius', key:'r' }],
      'number-line':[{ label:'Min', key:'min', min:-100 },{ label:'Max', key:'max' },{ label:'Length', key:'length' }],
      cube:         [{ label:'Side', key:'side' }],
      cylinder:     [{ label:'Radius', key:'r' },{ label:'Height', key:'h' }],
      cone:         [{ label:'Radius', key:'r' },{ label:'Height', key:'h' }],
    })[s.type] || [];
  }

  // ─────────────────────────────────────────────
  // CHAPTER PANEL (SLIDES DOWN FROM TOP)
  // ─────────────────────────────────────────────
  let panelCompact = false;
  let panelMinimized = false;
  let panelAnnotate = false;
  let panelDragSetup = false;

  function togglePanelSize() {
    const panel = document.getElementById('chapter-panel');
    if (!panel) return;
    panelCompact = !panelCompact;
    panel.classList.toggle('compact', panelCompact);
    const btn = document.getElementById('cp-btn-size');
    if (btn) btn.textContent = panelCompact ? '⤡ Normal' : '⤢ Small';
    if (typeof SetsUI !== 'undefined' && SetsUI.redrawVenn) {
      setTimeout(SetsUI.redrawVenn, 100);
    }
  }

  function togglePanelMinimize() {
    const panel = document.getElementById('chapter-panel');
    if (!panel) return;
    panelMinimized = !panelMinimized;
    panel.classList.toggle('minimized', panelMinimized);
    const btn = document.getElementById('cp-btn-min');
    if (btn) btn.textContent = panelMinimized ? '＋' : '−';
  }

  function togglePanelAnnotate() {
    const panel = document.getElementById('chapter-panel');
    if (!panel) return;
    panelAnnotate = !panelAnnotate;
    panel.classList.toggle('annotate-mode', panelAnnotate);
    const drawCanvas = document.getElementById('draw-canvas');
    if (drawCanvas) {
      drawCanvas.style.zIndex = panelAnnotate ? '180' : '';
    }
    const btn = document.getElementById('cp-btn-annotate');
    if (btn) {
      btn.classList.toggle('active', panelAnnotate);
      btn.textContent = panelAnnotate ? '👆 Interact' : '✎ Write Over';
      btn.title = panelAnnotate ? 'Click to interact with inputs & buttons' : 'Write / Draw directly over this panel with stylus or pen';
    }
    if (panelAnnotate && typeof App !== 'undefined') {
      if (App.currentTool === 'select' && App.setTool) {
        App.setTool('pen');
      }
    }
  }

  function setupPanelDrag() {
    if (panelDragSetup) return;
    const panel = document.getElementById('chapter-panel');
    const head = document.getElementById('cp-head');
    if (!panel || !head) return;
    panelDragSetup = true;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    function onPointerDown(e) {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
      isDragging = true;
      try { head.setPointerCapture(e.pointerId); } catch(err) {}

      const rect = panel.getBoundingClientRect();
      panel.style.right = 'auto';
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
      panel.style.transform = 'none';

      startX = e.clientX;
      startY = e.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const zone = document.getElementById('canvas-zone') || document.body;
      const maxLeft = Math.max(10, zone.clientWidth - panel.offsetWidth - 10);
      const maxTop = Math.max(10, zone.clientHeight - panel.offsetHeight - 10);

      const nextLeft = Math.min(Math.max(10, initialLeft + dx), maxLeft);
      const nextTop = Math.min(Math.max(10, initialTop + dy), maxTop);

      panel.style.left = nextLeft + 'px';
      panel.style.top = nextTop + 'px';
    }

    function onPointerUp(e) {
      if (isDragging) {
        isDragging = false;
        try { head.releasePointerCapture(e.pointerId); } catch(err) {}
      }
    }

    head.addEventListener('pointerdown', onPointerDown);
    head.addEventListener('pointermove', onPointerMove);
    head.addEventListener('pointerup', onPointerUp);
    head.addEventListener('pointercancel', onPointerUp);
  }

  function toggleChapterPanel() {
    panelOpen = !panelOpen;
    const panel = document.getElementById('chapter-panel');
    if (panel) {
      panel.classList.toggle('open', panelOpen);
      if (panelOpen) {
        setupPanelDrag();
        renderChapterPanel();
      } else {
        if (panelAnnotate) togglePanelAnnotate();
      }
    }
  }

  function openChapterPanel() {
    panelOpen = true;
    const panel = document.getElementById('chapter-panel');
    if (panel) {
      panel.classList.add('open');
      setupPanelDrag();
      renderChapterPanel();
    }
  }

  function closeChapterPanel() {
    panelOpen = false;
    const panel = document.getElementById('chapter-panel');
    if (panel) {
      panel.classList.remove('open');
      if (panelAnnotate) togglePanelAnnotate();
    }
  }

  function isChapterPanelOpen() {
    return panelOpen;
  }

  function renderScienceChapterPanel() {
    let chapters = [];
    if (typeof CurriculumStore !== 'undefined') {
      chapters = CurriculumStore.getChapters();
    }
    if (!chapters || !chapters.length) {
      if (typeof CURRICULUM_DATA !== 'undefined') {
        const sci = CURRICULUM_DATA.subjects.find(s => s.id === 'science');
        chapters = sci ? sci.chapters : [];
      }
    }
    const ch = (chapters && chapters.length)
      ? (chapters.find(c => c.id === App.activeChapter || +c.id === +App.activeChapter) || chapters[0])
      : null;
    if (!ch) return;

    const titleEl = document.getElementById('cp-title');
    if (titleEl) {
      titleEl.innerHTML = `<span style="color:#38bdf8;font-weight:700">🔬 Science &bull; Ch ${ch.id}:</span> ${ch.name}${ch.nepaliName ? ` <span style="font-size:12px;opacity:.7;font-weight:400">(${ch.nepaliName})</span>` : ''}`;
    }

    const bodyEl = document.getElementById('cp-body');
    if (bodyEl && typeof ScienceCalculators !== 'undefined') {
      bodyEl.innerHTML = ScienceCalculators.buildContent(ch);
    }
  }

  function renderChapterPanel() {
    const isScienceActive = (typeof App !== 'undefined' && App.activeSubject === 'science') ||
      ((typeof CurriculumStore !== 'undefined') && (CurriculumStore.getActiveSubject() || {}).id === 'science');

    if (isScienceActive) {
      renderScienceChapterPanel();
      return;
    }

    const ch  = CHAPTERS.find(c => c.id === App.activeChapter);
    if (!ch) return;
    document.getElementById('cp-title').textContent = `Ch ${ch.id}: ${ch.name}`;
    document.getElementById('cp-body').innerHTML = buildContent(ch);
    setTimeout(() => {
      if (ch.id === 1)  SetsUI.init();
      if (ch.id === 13) Calculators.drawStatBar([12,18,14,16,20,15]);
      if (ch.id === 6) {
        const sel = document.getElementById('seq-type');
        if (sel) sel.addEventListener('change', Calculators.seqTypeSwitch);
      }
    }, 60);
  }

  // ─────────────────────────────────────────────
  // CHAPTER CONTENT — SETS REDESIGNED
  // ─────────────────────────────────────────────
  function buildContent(ch) {
    switch(ch.id) {

      // ── CH 1: SETS — Dynamic multi-set ──
      case 1: return `
        <div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:10px;height:100%">

          <!-- LEFT: Set inputs + operations -->
          <div class="calc-card" style="display:flex;flex-direction:column;gap:0;overflow:hidden">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <h4 style="margin:0">Sets</h4>
              <div style="display:flex;gap:5px;align-items:center">
                <button class="c-btn-sm" onclick="SetsUI.addSet()" style="padding:3px 8px;font-size:10.5px">＋ Add Set</button>
                <button class="c-btn-sm" onclick="SetsUI.removeSet()" style="padding:3px 8px;font-size:10.5px;background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3);color:#fca5a5">− Remove</button>
              </div>
            </div>

            <!-- Dynamic set inputs container -->
            <div id="sets-inputs" style="display:flex;flex-direction:column;gap:5px;margin-bottom:8px;max-height:95px;overflow-y:auto"></div>

            <!-- n(U) -->
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="font-size:10.5px;color:rgba(255,255,255,.5);white-space:nowrap">n(U) universal set:</span>
              <input class="c-inp" id="set-U" type="number" placeholder="e.g. 50" style="width:72px;text-align:left;height:26px;font-size:11px">
            </div>

            <!-- Operation buttons — generated dynamically -->
            <div id="sets-op-btns" style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px"></div>

            <!-- Result -->
            <div class="c-result" id="set-result" style="min-height:32px;font-size:11.5px;padding:6px 8px">Enter values in sets above, then choose an operation.</div>

            <!-- Solve space -->
            <div style="margin-top:6px">
              <div style="font-size:8.5px;color:rgba(255,255,255,.35);margin-bottom:2px;letter-spacing:.08em;text-transform:uppercase">Working / solve space</div>
              <textarea id="sets-solve" style="width:100%;min-height:36px;max-height:60px;background:rgba(0,0,0,.28);border:1px solid rgba(201,168,76,.14);border-radius:6px;color:rgba(255,255,255,.82);font-family:'JetBrains Mono',monospace;font-size:11px;padding:4px 7px;resize:vertical;outline:none" placeholder="Write your steps here…"></textarea>
            </div>
          </div>

          <!-- RIGHT: Venn diagram -->
          <div class="calc-card" style="display:flex;flex-direction:column;align-items:center;gap:5px">
            <h4 style="align-self:flex-start;margin:0 0 6px">Live Venn Diagram</h4>
            <canvas id="venn-canvas" width="240" height="170" style="border-radius:6px;background:rgba(0,0,0,.22);max-width:100%;height:auto"></canvas>
            <div id="venn-counts" style="font-family:'JetBrains Mono',monospace;font-size:9.5px;color:rgba(255,255,255,.5);text-align:center;line-height:1.7;align-self:flex-start"></div>
          </div>

        </div>`;


      // ── CH 2: COMPOUND INTEREST ──
      case 2: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Compound Interest Calculator</h4>
            <div class="c-row"><label>Principal (P):</label><input class="c-inp" id="ci-p" type="number" value="10000"></div>
            <div class="c-row"><label>Rate % (R):</label><input class="c-inp" id="ci-r" type="number" value="10" step=".1"></div>
            <div class="c-row"><label>Time (T) years:</label><input class="c-inp" id="ci-t" type="number" value="3"></div>
            <div class="c-row"><label>Compounded:</label>
              <select class="c-sel" id="ci-n"><option value="1">Yearly</option><option value="2">Half-yearly</option><option value="4">Quarterly</option><option value="12">Monthly</option></select>
            </div>
            <button class="c-btn" onclick="Calculators.ciCalc()">Calculate</button>
            <div class="c-result" id="ci-result">—</div>
          </div>
          <div class="calc-card"><h4>Formulas</h4>
            <div class="c-ref">A = P(1 + R/100n)ⁿᵀ<br>CI = A − P<br>SI = PRT/100<br><br><b>P</b>=Principal <b>R</b>=Rate <b>T</b>=Time<br><b>n</b>=compounding frequency</div>
          </div>
        </div>`;

      // ── CH 3 ──
      case 3: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Growth &amp; Depreciation</h4>
            <div class="c-row"><label>Initial Value:</label><input class="c-inp" id="gd-p" type="number" value="100000"></div>
            <div class="c-row"><label>Rate % (R):</label><input class="c-inp" id="gd-r" type="number" value="8" step=".1"></div>
            <div class="c-row"><label>Time (T) years:</label><input class="c-inp" id="gd-t" type="number" value="5"></div>
            <div class="c-row"><label>Type:</label>
              <select class="c-sel" id="gd-type"><option value="growth">Growth</option><option value="depreciation">Depreciation</option></select>
            </div>
            <button class="c-btn" onclick="Calculators.gdCalc()">Calculate</button>
            <div class="c-result" id="gd-result">—</div>
          </div>
          <div class="calc-card"><h4>Formulas</h4>
            <div class="c-ref"><b>Growth:</b> V = P(1 + R/100)ᵀ<br><b>Depreciation:</b> V = P(1 − R/100)ᵀ</div>
          </div>
        </div>`;

      // ── CH 4 ──
      case 4: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Currency Converter</h4>
            <div class="c-row"><label>Amount:</label><input class="c-inp" id="fx-amt" type="number" value="1000"></div>
            <div class="c-row"><label>From:</label><input class="c-inp" id="fx-from" value="NPR" style="text-align:left;width:70px;text-transform:uppercase"></div>
            <div class="c-row"><label>To:</label><input class="c-inp" id="fx-to" value="USD" style="text-align:left;width:70px;text-transform:uppercase"></div>
            <div class="c-row"><label>Rate (1 from = ? to):</label><input class="c-inp" id="fx-rate" type="number" value="0.0075" step=".0001"></div>
            <div class="c-row"><label>Commission %:</label><input class="c-inp" id="fx-comm" type="number" value="0" step=".1"></div>
            <button class="c-btn" onclick="Calculators.fxCalc()">Convert</button>
            <div class="c-result" id="fx-result">—</div>
          </div>
          <div class="calc-card"><h4>Common Rates (approx)</h4>
            <div class="c-ref">1 USD ≈ 133 NPR<br>1 EUR ≈ 144 NPR<br>1 GBP ≈ 168 NPR<br>1 INR ≈ 1.6 NPR<br>1 AUD ≈ 86 NPR</div>
          </div>
        </div>`;

      // ── CH 5 ──
      case 5: return `
        <div class="calc-grid">
          <div class="calc-card"><h4>2D Formulas</h4>
            <div class="c-ref">Square: A = a²<br>Rectangle: A = l×b<br>Triangle: A = ½bh<br>Parallelogram: A = bh<br>Trapezium: A = ½(a+b)h<br>Rhombus: A = ½d₁d₂<br>Circle: A = πr²<br>Sector: A = (θ/360)πr²</div>
          </div>
          <div class="calc-card"><h4>3D Formulas</h4>
            <div class="c-ref">Cube: V = a³<br>Cuboid: V = l×b×h<br>Cylinder: V = πr²h<br>Cone: V = ⅓πr²h<br>Sphere: V = ⁴⁄₃πr³<br><br>Select a shape → enter dimensions in right panel → formula shows automatically.</div>
          </div>
        </div>`;

      // ── CH 6 ──
      case 6: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Sequence Generator</h4>
            <div class="c-row"><label>Type:</label>
              <select class="c-sel" id="seq-type" onchange="Calculators.seqTypeSwitch()">
                <option value="ap">AP — Arithmetic</option>
                <option value="gp">GP — Geometric</option>
              </select>
            </div>
            <div class="c-row"><label>First term (a):</label><input class="c-inp" id="seq-a" type="number" value="2"></div>
            <div class="c-row" id="seq-d-row"><label>Common diff (d):</label><input class="c-inp" id="seq-d" type="number" value="3"></div>
            <div class="c-row" id="seq-r-row" style="display:none"><label>Common ratio (r):</label><input class="c-inp" id="seq-r" type="number" value="2" step=".1"></div>
            <div class="c-row"><label>No. of terms (n):</label><input class="c-inp" id="seq-n" type="number" value="10"></div>
            <button class="c-btn" onclick="Calculators.seqCalc()">Generate</button>
            <div class="c-result" id="seq-result">—</div>
          </div>
          <div class="calc-card"><h4>Formulas</h4>
            <div class="c-ref"><b>AP:</b> aₙ = a+(n-1)d  |  Sₙ = n/2[2a+(n-1)d]<br><br><b>GP:</b> aₙ = arⁿ⁻¹  |  Sₙ = a(rⁿ-1)/(r-1)</div>
          </div>
        </div>`;

      // ── CH 7 ──
      case 7: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Quadratic Solver — ax² + bx + c = 0</h4>
            <div class="c-row"><label>a:</label><input class="c-inp" id="q-a" type="number" value="1" step=".1"></div>
            <div class="c-row"><label>b:</label><input class="c-inp" id="q-b" type="number" value="-5" step=".1"></div>
            <div class="c-row"><label>c:</label><input class="c-inp" id="q-c" type="number" value="6" step=".1"></div>
            <button class="c-btn" onclick="Calculators.quadCalc()">Solve</button>
            <div class="c-result" id="q-result">—</div>
          </div>
          <div class="calc-card"><h4>Discriminant</h4>
            <div class="c-ref">D = b² − 4ac<br>D &gt; 0 → 2 real roots<br>D = 0 → 1 repeated root<br>D &lt; 0 → complex roots<br><br>x = (−b ± √D) / 2a<br><br>Sum of roots = −b/a<br>Product = c/a</div>
          </div>
        </div>`;

      // ── CH 8 ──
      case 8: return `<div class="calc-card"><h4>Algebraic Fractions — Board Mode</h4><div class="c-ref">• Factorise numerator &amp; denominator<br>• Cancel common factors<br>• Use LCM for addition/subtraction<br><br>Example: (x²−4)/(x+2) = x−2</div></div>`;

      // ── CH 9 ──
      case 9: return `<div class="calc-card"><h4>Laws of Indices</h4><div class="c-ref">aᵐ × aⁿ = aᵐ⁺ⁿ<br>aᵐ ÷ aⁿ = aᵐ⁻ⁿ<br>(aᵐ)ⁿ = aᵐⁿ<br>a⁰ = 1<br>a⁻ⁿ = 1/aⁿ<br>a^(1/n) = ⁿ√a<br>a^(m/n) = ⁿ√(aᵐ)</div></div>`;

      // ── CH 10 ──
      case 10: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Triangle Calculator</h4>
            <div class="c-row"><label>Side a:</label><input class="c-inp" id="tri-a" type="number" value="5" step=".1"></div>
            <div class="c-row"><label>Side b:</label><input class="c-inp" id="tri-b" type="number" value="7" step=".1"></div>
            <div class="c-row"><label>Side c:</label><input class="c-inp" id="tri-c" type="number" value="8" step=".1"></div>
            <button class="c-btn" onclick="Calculators.triCalc()">Calculate</button>
            <div class="c-result" id="tri-result">—</div>
          </div>
          <div class="calc-card"><h4>Theorems</h4>
            <div class="c-ref">Pythagoras: a²+b²=c²<br>Heron's: A=√s(s-a)(s-b)(s-c)<br>s = (a+b+c)/2<br><br>Angle sum = 180°<br>Cosine: a²=b²+c²−2bc·cosA</div>
          </div>
        </div>`;

      // ── CH 11 ──
      case 11: return `<div class="calc-card"><h4>Construction — Board Mode</h4><div class="c-ref">Use Line and Pen tools to construct:<br>• Perpendicular bisector<br>• Angle bisector<br>• Triangle (SSS, SAS, ASA)<br>• Parallel lines<br>• Circles (circumscribed / inscribed)</div></div>`;

      // ── CH 12 ──
      case 12: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Circle Calculator</h4>
            <div class="c-row"><label>Radius (r):</label><input class="c-inp" id="circ-r" type="number" value="7" step=".1"></div>
            <div class="c-row"><label>Angle θ°:</label><input class="c-inp" id="circ-theta" type="number" value="90" step="1"></div>
            <button class="c-btn" onclick="Calculators.circleCalc()">Calculate</button>
            <div class="c-result" id="circ-result">—</div>
          </div>
          <div class="calc-card"><h4>Formulas</h4>
            <div class="c-ref">Area = πr²<br>Circumference = 2πr<br>Arc = (θ/360)×2πr<br>Sector area = (θ/360)×πr²<br>Chord = 2r·sin(θ/2)</div>
          </div>
        </div>`;

      // ── CH 13 ──
      case 13: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Statistics Calculator</h4>
            <div style="margin-bottom:8px">
              <div style="font-size:10px;color:rgba(255,255,255,.45);margin-bottom:3px">Data (comma-separated)</div>
              <input class="c-inp wide" id="stat-data" value="12,18,14,16,20,15,13,19,17,11">
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">
              <button class="c-btn-sm" onclick="Calculators.statCalc('mean')">Mean</button>
              <button class="c-btn-sm" onclick="Calculators.statCalc('median')">Median</button>
              <button class="c-btn-sm" onclick="Calculators.statCalc('mode')">Mode</button>
              <button class="c-btn-sm" onclick="Calculators.statCalc('range')">Range</button>
              <button class="c-btn-sm" onclick="Calculators.statCalc('sd')">Std Dev</button>
              <button class="c-btn-sm" onclick="Calculators.statCalc('all')">All + Chart</button>
            </div>
            <div class="c-result" id="stat-result">—</div>
          </div>
          <div class="calc-card"><h4>Bar Chart</h4>
            <canvas id="stat-bar-canvas" width="210" height="120" style="border-radius:6px;background:rgba(0,0,0,.25)"></canvas>
          </div>
        </div>`;

      // ── CH 14 ──
      case 14: return `
        <div class="calc-grid">
          <div class="calc-card">
            <h4>Probability</h4>
            <div class="c-row"><label>Favourable (f):</label><input class="c-inp" id="pr-f" type="number" value="3"></div>
            <div class="c-row"><label>Total (n):</label><input class="c-inp" id="pr-n" type="number" value="6"></div>
            <button class="c-btn" onclick="Calculators.probCalc()">Calculate P(E)</button>
            <div class="c-result" id="pr-result">—</div>
            <div class="prob-bar-wrap"><div class="prob-bar-fill" id="prob-bar-fill" style="width:50%"></div></div>
          </div>
          <div class="calc-card">
            <h4>Simulators</h4>
            <div style="margin-bottom:12px">
              <div style="font-size:10px;color:var(--gold);margin-bottom:6px;font-weight:600">DICE ROLLER</div>
              <div class="dice-row">
                <button class="c-btn-sm" onclick="Calculators.rollDice()">🎲 Roll</button>
                <div id="dice-face" style="font-size:30px;line-height:1">⚄</div>
                <span id="dice-result-text" style="font-family:var(--mono);font-size:11px;color:rgba(255,255,255,.6)"></span>
              </div>
            </div>
            <div>
              <div style="font-size:10px;color:var(--gold);margin-bottom:6px;font-weight:600">COIN FLIP</div>
              <div class="dice-row">
                <button class="c-btn-sm" onclick="Calculators.flipCoin()">🪙 Flip</button>
                <div id="coin-face" style="font-size:26px;font-family:var(--mono);font-weight:700;color:var(--gold-hi)">H</div>
                <span id="coin-result-text" style="font-family:var(--mono);font-size:11px;color:rgba(255,255,255,.6)"></span>
              </div>
            </div>
          </div>
          <div class="calc-card"><h4>Formulas</h4>
            <div class="c-ref">P(E) = f/n<br>0 ≤ P(E) ≤ 1<br>P(E)+P(E')=1<br><br>P(A∪B)=P(A)+P(B)−P(A∩B)<br>P(A∩B)=P(A)·P(B) [indep]</div>
          </div>
        </div>`;

      default: return `<div class="c-ref">Use the drawing tools on the board above.</div>`;
    }
  }

  // ─────────────────────────────────────────────
  // TOPBAR DROPDOWNS
  // ─────────────────────────────────────────────
  function toggleDropdown(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const wasOpen = el.classList.contains('open');
    closeAllDropdowns();
    if (!wasOpen) el.classList.add('open');
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.tb-dropdown').forEach(d => d.classList.remove('open'));
  }

  window.addEventListener('click', (e) => {
    if (!e.target.closest('.tb-dropdown')) {
      closeAllDropdowns();
    }
    if (!e.target.closest('#flyout-pen') && !e.target.closest('#btn-fp-pen') && !e.target.closest('#fp-custom-picker')) {
      closePenFlyout();
    }
    if (!e.target.closest('#flyout-shapes') && !e.target.closest('#btn-fp-shapes') && !e.target.closest('#subtool-smart-shape')) {
      closeShapesFlyout();
    }
    if (!e.target.closest('#flyout-insert') && !e.target.closest('#btn-fp-insert')) {
      closeInsertFlyout();
    }
    if (!e.target.closest('#flyout-eraser') && !e.target.closest('#btn-fp-eraser')) {
      closeEraserFlyout();
    }
  });

  window.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('#flyout-pen') && !e.target.closest('#btn-fp-pen') && !e.target.closest('#fp-custom-picker')) {
      closePenFlyout();
    }
    if (!e.target.closest('#flyout-shapes') && !e.target.closest('#btn-fp-shapes') && !e.target.closest('#subtool-smart-shape')) {
      closeShapesFlyout();
    }
    if (!e.target.closest('#flyout-insert') && !e.target.closest('#btn-fp-insert')) {
      closeInsertFlyout();
    }
    if (!e.target.closest('#flyout-eraser') && !e.target.closest('#btn-fp-eraser')) {
      closeEraserFlyout();
    }
  });

  // ─────────────────────────────────────────────
  function updateStatus() {
    const t = document.getElementById('sb-tool');
    const o = document.getElementById('sb-objs');
    if (t) {
      const toolMap = {
        'smart-draw': '✨ Smart Draw',
        'pen': 'Pen',
        'highlighter': 'Highlighter',
        'eraser': 'Eraser',
        'select': 'Select',
        'text': 'Text'
      };
      t.innerHTML = toolMap[App.currentTool] || App.currentTool;
    }
    if (o) o.innerHTML = Canvas.getShapeCount();
  }

  function toggleControlsPalette() {
    const isCollapsed = document.body.classList.toggle('controls-collapsed');
    const btn = document.getElementById('btn-toggle-controls');
    if (btn) {
      const icon = btn.querySelector('.toggle-icon');
      const text = btn.querySelector('.toggle-text');
      if (icon) icon.textContent = isCollapsed ? '▶' : '◀';
      if (text) text.textContent = isCollapsed ? 'Tools' : 'Controls';
      btn.title = isCollapsed ? 'Expand Left Controls (C)' : 'Collapse Left Controls (C)';
      btn.classList.toggle('active', isCollapsed);
    }
    const mini = document.getElementById('mini-controls-reopen');
    if (mini) {
      if (isCollapsed) mini.classList.remove('hidden');
      else mini.classList.add('hidden');
    }
    closeAllFlyouts();
    setTimeout(() => {
      if (typeof Canvas !== 'undefined' && Canvas.resize) Canvas.resize();
    }, 60);
  }

  // Global keyboard shortcut: C to toggle controls (when not typing)
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag !== 'input' && tag !== 'textarea' && !document.activeElement?.isContentEditable) {
        toggleControlsPalette();
      }
    }
  });

  // ─────────────────────────────────────────────
  return {
    buildSidebar, updateSidebarCard, prevChapter, nextChapter,
    buildShapeGrid, buildColorPalette, buildPenSizes,
    buildBoardSwatches, syncPenPanel,
    toggleBoardPicker, openBoardPicker, closeBoardPicker,
    showPropPanel, hidePropPanel,
    toggleShapesSection,
    toggleDropdown, closeAllDropdowns,
    toggleChapterPanel, openChapterPanel, closeChapterPanel, isChapterPanelOpen, renderChapterPanel, renderScienceChapterPanel,
    togglePanelSize, togglePanelMinimize, togglePanelAnnotate,
    updateStatus, rebuildForSubject,
    renderTopChapters, updateTopChapterBadge, toggleSubjectDropdown,
    togglePenFlyout, openPenFlyout, closePenFlyout,
    toggleEraserFlyout, openEraserFlyout, closeEraserFlyout,
    toggleShapesFlyout, openShapesFlyout, closeShapesFlyout, closeAllFlyouts,
    toggleInsertFlyout, openInsertFlyout, closeInsertFlyout, openPdfPicker, handlePdfSelect,
    selectSubtool, syncSubtoolButtons, cyclePenSize, selectFlyoutColor,
    selectPenSize, selectEraserSize,
    clearDrawingStrokes, filterShapesCategory, searchShapes, switchShapesDomain,
    toggleControlsPalette,
    toggleActiveSubjectSyllabusDropdown, switchSyllabusTab, selectSyllabusUnit,
    promptEnrollPpt, presentSubjectPpt, enrollNewPpt
  };
})();
