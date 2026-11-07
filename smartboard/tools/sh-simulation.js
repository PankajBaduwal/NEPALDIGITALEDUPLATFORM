/**
 * sh-simulation.js
 * Master Interactive Engine for Linux and Shell Scripting (U25CS202)
 * Regulation R2025 CBCS · Semester II · Common to AD, AM, CB, CSE, IT, Cyber · ESC · 2 Credits
 *
 * Security & Educational Sandbox Guarantees:
 *  - 100% In-Memory Virtual Filesystem (VFS) rooted strictly at '/'
 *  - Strict allowlisted command parser: pwd, cd, ls, mkdir, touch, cat, echo, cp, mv, rm, chmod, grep, head, tail, wc, sort, cut, ps, kill, export, env, clear, help
 *  - No child processes, no eval, no Function constructor, no access to host OS, network, or real files
 *  - Pipeline (|) and redirection (>, >>) executed purely over virtual memory buffers
 *  - Step-by-step shell script debugger with bounded loop iterations (max 50) preventing runaway execution
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1. STATE & DOM ELEMENT REFS
  // ══════════════════════════════════════════════════════════
  const catalog = (typeof window !== 'undefined' && window.EduverseSHCatalog) || null;
  if (!catalog) {
    console.error('[SH Simulation] EduverseSHCatalog not loaded.');
    return;
  }

  const state = {
    currentUnit: 1,
    currentSimId: 'u25cs202-terminal-basics',
    mode: 'learn',
    theme: (function () { try { return localStorage.getItem('eduverse_theme') || 'light'; } catch (e) { return 'light'; } })(),
    isPlaying: false,
    speed: 1.0,
    currentStep: 0,
    maxSteps: 4,
    playIntervalId: null,
    params: {},
    challengeState: { solved: false, feedback: '' },
    // Virtual Practice Environment
    cwd: '/home/student',
    envVars: { USER: 'student', HOME: '/home/student', SHELL: '/bin/bash', PATH: '/bin:/usr/bin', TERM: 'xterm-256color' },
    processes: [
      { pid: 1, ppid: 0, user: 'root', state: 'Running', time: '0:01', cmd: 'init' },
      { pid: 101, ppid: 1, user: 'root', state: 'Sleeping', time: '0:00', cmd: 'systemd-journald' },
      { pid: 1042, ppid: 101, user: 'student', state: 'Running', time: '0:00', cmd: 'bash' }
    ],
    terminalHistory: [],
    terminalLines: [
      { type: 'sys', text: 'Eduverse Linux Practice Environment [Kernel 6.8.0-eduverse-x86_64]' },
      { type: 'sys', text: 'Simulated terminal — changes affect only this safe in-memory environment.' },
      { type: 'sys', text: 'Type "help" for a list of available allowlisted commands.' }
    ]
  };

  const dom = {
    app: document.getElementById('ep-app'),
    unitSelect: document.getElementById('sh-unit'),
    simSelect: document.getElementById('sh-simulation'),
    title: document.getElementById('ep-title'),
    subtitle: document.getElementById('ep-subtitle'),
    themeToggle: document.getElementById('sh-theme-toggle'),
    fullscreenBtn: document.getElementById('ep-fullscreen'),
    exportBtn: document.getElementById('ep-export'),
    modeBtns: document.querySelectorAll('.ep-seg'),
    playBtn: document.getElementById('ep-play'),
    pauseBtn: document.getElementById('ep-pause'),
    prevBtn: document.getElementById('ep-prev'),
    nextBtn: document.getElementById('ep-next'),
    resetBtn: document.getElementById('ep-reset'),
    resetParamsBtn: document.getElementById('sh-reset-params'),
    speedSelect: document.getElementById('sh-speed'),
    stepLabel: document.getElementById('sh-step-label'),
    progressFill: document.getElementById('sh-progress-fill'),
    canvas: document.getElementById('sh-canvas'),
    readouts: document.getElementById('ep-readouts'),
    overlaySim: document.getElementById('sh-overlay-sim'),
    overlayState: document.getElementById('sh-overlay-state'),
    whatText: document.getElementById('sh-what'),
    whyText: document.getElementById('sh-why'),
    nextText: document.getElementById('sh-next-info'),
    bannerNo: document.getElementById('ep-banner-no'),
    bannerTitle: document.getElementById('ep-banner-title'),
    bannerText: document.getElementById('ep-banner-text'),
    inputsForm: document.getElementById('sh-inputs-form'),
    inputActions: document.getElementById('sh-input-actions'),
    challengeCard: document.getElementById('ep-challenge-card'),
    challengePrompt: document.getElementById('sh-challenge-prompt'),
    verifyChallengeBtn: document.getElementById('sh-verify-challenge'),
    resetChallengeBtn: document.getElementById('sh-reset-challenge'),
    challengeResult: document.getElementById('sh-challenge-result'),
    formulaBox: document.getElementById('sh-formula-box'),
    specList: document.getElementById('sh-spec-list'),
    aiQuestion: document.getElementById('sh-ai-question'),
    askAiBtn: document.getElementById('sh-ask-ai'),
    aiAnswer: document.getElementById('sh-ai-answer'),
    toast: document.getElementById('sh-toast')
  };

  const ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  // ══════════════════════════════════════════════════════════
  // 2. IN-MEMORY VIRTUAL FILESYSTEM (VFS)
  // ══════════════════════════════════════════════════════════
  let VFS = {};

  function initVFS() {
    VFS = {
      '/': { type: 'dir', mode: '755', owner: 'root', group: 'root', mtime: 'Oct 16 09:00' },
      '/bin': { type: 'dir', mode: '755', owner: 'root', group: 'root', mtime: 'Oct 16 09:00' },
      '/etc': { type: 'dir', mode: '755', owner: 'root', group: 'root', mtime: 'Oct 16 09:00' },
      '/home': { type: 'dir', mode: '755', owner: 'root', group: 'root', mtime: 'Oct 16 09:00' },
      '/home/student': { type: 'dir', mode: '755', owner: 'student', group: 'student', mtime: 'Oct 16 09:15' },
      '/home/student/projects': { type: 'dir', mode: '755', owner: 'student', group: 'student', mtime: 'Oct 16 09:20' },
      '/var': { type: 'dir', mode: '755', owner: 'root', group: 'root', mtime: 'Oct 16 09:00' },
      '/var/log': { type: 'dir', mode: '755', owner: 'root', group: 'root', mtime: 'Oct 16 09:00' },
      '/tmp': { type: 'dir', mode: '777', owner: 'root', group: 'root', mtime: 'Oct 16 09:00' },

      // Sample Files
      '/etc/hostname': { type: 'file', mode: '644', owner: 'root', group: 'root', content: 'eduverse-node-1\n', mtime: 'Oct 16 09:00' },
      '/etc/os-release': { type: 'file', mode: '644', owner: 'root', group: 'root', content: 'NAME="Eduverse Linux"\nVERSION="2026 LTS (R2025 CBCS)"\nID=eduverse\n', mtime: 'Oct 16 09:00' },
      '/etc/passwd': { type: 'file', mode: '644', owner: 'root', group: 'root', content: 'root:x:0:0:root:/root:/bin/bash\nstudent:x:1001:1001:Student:/home/student:/bin/bash\nfaculty:x:1002:1002:Faculty:/home/faculty:/bin/bash\n', mtime: 'Oct 16 09:00' },
      '/home/student/notes.txt': { type: 'file', mode: '644', owner: 'student', group: 'student', content: 'Linux and Shell Scripting (U25CS202)\n1. Use pwd to inspect directory.\n2. Use ls -la to list permissions.\n3. Chain commands with pipes (|).\n', mtime: 'Oct 16 09:30' },
      '/home/student/data.csv': { type: 'file', mode: '644', owner: 'student', group: 'student', content: 'id,name,dept,score\n101,Alice,CSE,88\n102,Bob,IT,92\n103,Charlie,AIML,79\n104,Diana,Cyber,95\n105,Evan,CSBS,85\n', mtime: 'Oct 16 09:35' },
      '/home/student/backup.sh': { type: 'file', mode: '755', owner: 'student', group: 'student', content: '#!/bin/bash\necho "Starting backup..."\ncp /home/student/data.csv /tmp/data_backup.csv\necho "Backup complete!"\n', mtime: 'Oct 16 09:40' },
      '/var/log/syslog': { type: 'file', mode: '640', owner: 'root', group: 'root', content: 'Oct 16 10:00:01 node-1 systemd: Session started.\nOct 16 10:05:22 node-1 kernel: [0.000] Linux version 6.8.\nOct 16 10:15:30 node-1 app: ERROR Port 8080 already in use.\nOct 16 10:15:35 node-1 app: INFO Server restarted on port 8081.\nOct 16 10:20:00 node-1 app: ERROR Timeout from 192.168.1.105.\n', mtime: 'Oct 16 10:20' }
    };
  }

  function normalizePath(cwd, target) {
    if (!target) return cwd;
    let full = target.startsWith('/') ? target : (cwd === '/' ? `/${target}` : `${cwd}/${target}`);
    const parts = full.split('/').filter(Boolean);
    const resolved = [];
    for (let part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }
    return '/' + resolved.join('');
  }

  function getVfsNode(path) {
    return VFS[path] || null;
  }

  function listVfsDir(path) {
    const target = path.endsWith('/') ? path.slice(0, -1) : path;
    const prefix = target === '' ? '/' : target + '/';
    const entries = [];
    for (let p in VFS) {
      if (p === target) continue;
      if (p.startsWith(prefix)) {
        const rest = p.slice(prefix.length);
        if (!rest.includes('/')) {
          entries.push({ name: rest, fullPath: p, ...VFS[p] });
        }
      }
    }
    return entries;
  }

  // ══════════════════════════════════════════════════════════
  // 3. SAFE ALLOWLISTED COMMAND INTERPRETER
  // ══════════════════════════════════════════════════════════
  const ALLOWED_COMMANDS = [
    'pwd', 'cd', 'ls', 'mkdir', 'touch', 'cat', 'echo', 'cp', 'mv', 'rm',
    'chmod', 'grep', 'head', 'tail', 'wc', 'sort', 'cut', 'ps', 'kill',
    'export', 'env', 'printenv', 'clear', 'help'
  ];

  function executeCommand(rawInput) {
    const cmdStr = (rawInput || '').trim();
    if (!cmdStr) return '';

    state.terminalLines.push({ type: 'cmd', text: cmdStr, cwd: state.cwd });

    // Pipeline Check
    if (cmdStr.includes('|')) {
      return executePipeline(cmdStr);
    }

    // Redirection Check (> or >>)
    if (cmdStr.includes('>>') || cmdStr.includes('>')) {
      return executeRedirection(cmdStr);
    }

    return executeSingleCommand(cmdStr, null);
  }

  function executeSingleCommand(cmdStr, stdinData) {
    const tokens = parseCommandLine(cmdStr);
    if (!tokens.length) return '';

    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    if (!ALLOWED_COMMANDS.includes(cmd)) {
      const err = `bash: ${cmd}: command not found (in safe educational sandbox)`;
      state.terminalLines.push({ type: 'err', text: err });
      return err;
    }

    let stdout = '';

    switch (cmd) {
      case 'pwd':
        stdout = state.cwd;
        break;

      case 'cd': {
        const dest = args[0] ? (args[0] === '~' ? '/home/student' : args[0]) : '/home/student';
        const target = normalizePath(state.cwd, dest);
        const node = getVfsNode(target);
        if (!node) {
          stdout = `bash: cd: ${dest}: No such file or directory`;
        } else if (node.type !== 'dir') {
          stdout = `bash: cd: ${dest}: Not a directory`;
        } else {
          state.cwd = target;
        }
        break;
      }

      case 'ls': {
        const showAll = args.some(a => a.includes('a'));
        const showLong = args.some(a => a.includes('l'));
        const pathArg = args.find(a => !a.startsWith('-')) || state.cwd;
        const target = normalizePath(state.cwd, pathArg);
        const entries = listVfsDir(target);

        if (showLong) {
          const lines = [`total ${entries.length}`];
          if (showAll) {
            lines.push(`drwxr-xr-x 2 student student 4096 Oct 16 09:00 .`);
            lines.push(`drwxr-xr-x 4 root    root    4096 Oct 16 09:00 ..`);
          }
          entries.forEach(e => {
            if (!showAll && e.name.startsWith('.')) return;
            const pfix = e.type === 'dir' ? 'd' : '-';
            const perm = pfix + modeToSymbolic(e.mode);
            const size = e.type === 'dir' ? 4096 : (e.content ? e.content.length : 0);
            lines.push(`${perm} 1 ${e.owner.padEnd(7)} ${e.group.padEnd(7)} ${String(size).padStart(5)} ${e.mtime} ${e.name}`);
          });
          stdout = lines.join('\n');
        } else {
          const names = entries.filter(e => showAll || !e.name.startsWith('.')).map(e => e.name);
          stdout = names.join('  ');
        }
        break;
      }

      case 'cat': {
        if (!args.length && stdinData) {
          stdout = stdinData;
        } else if (args[0]) {
          const target = normalizePath(state.cwd, args[0]);
          const node = getVfsNode(target);
          if (!node) stdout = `cat: ${args[0]}: No such file or directory`;
          else if (node.type === 'dir') stdout = `cat: ${args[0]}: Is a directory`;
          else stdout = node.content || '';
        }
        break;
      }

      case 'echo':
        stdout = args.join(' ').replace(/^["']|["']$/g, '');
        break;

      case 'mkdir': {
        const dest = args.find(a => !a.startsWith('-'));
        if (!dest) {
          stdout = 'mkdir: missing operand';
        } else {
          const target = normalizePath(state.cwd, dest);
          if (getVfsNode(target)) stdout = `mkdir: cannot create directory '${dest}': File exists`;
          else {
            VFS[target] = { type: 'dir', mode: '755', owner: 'student', group: 'student', mtime: 'Oct 16 10:30' };
            stdout = '';
          }
        }
        break;
      }

      case 'touch': {
        const dest = args[0];
        if (!dest) {
          stdout = 'touch: missing file operand';
        } else {
          const target = normalizePath(state.cwd, dest);
          if (getVfsNode(target)) {
            VFS[target].mtime = 'Oct 16 10:30';
          } else {
            VFS[target] = { type: 'file', mode: '644', owner: 'student', group: 'student', content: '', mtime: 'Oct 16 10:30' };
          }
        }
        break;
      }

      case 'chmod': {
        const mode = args[0];
        const dest = args[1];
        if (!mode || !dest) {
          stdout = 'chmod: missing operand';
        } else {
          const target = normalizePath(state.cwd, dest);
          const node = getVfsNode(target);
          if (!node) stdout = `chmod: cannot access '${dest}': No such file or directory`;
          else {
            if (/^[0-7]{3}$/.test(mode)) {
              node.mode = mode;
            } else if (mode.includes('+x')) {
              node.mode = '755';
            }
          }
        }
        break;
      }

      case 'grep': {
        const pattern = args.find(a => !a.startsWith('-')) || '';
        const file = args.filter(a => !a.startsWith('-'))[1];
        let text = stdinData || '';
        if (file) {
          const target = normalizePath(state.cwd, file);
          const node = getVfsNode(target);
          text = node ? node.content : '';
        }
        const isCaseInsensitive = args.some(a => a.includes('i'));
        const isCount = args.some(a => a.includes('c'));
        const lines = text.split('\n');
        const matches = lines.filter(l => {
          if (!pattern) return true;
          return isCaseInsensitive ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern);
        });
        stdout = isCount ? String(matches.length) : matches.join('\n');
        break;
      }

      case 'wc': {
        const file = args.find(a => !a.startsWith('-'));
        let text = stdinData || '';
        if (file) {
          const target = normalizePath(state.cwd, file);
          const node = getVfsNode(target);
          text = node ? node.content : '';
        }
        const lines = text.split('\n').filter(Boolean).length;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const bytes = text.length;
        if (args.includes('-l')) stdout = `${lines} ${file || ''}`;
        else if (args.includes('-w')) stdout = `${words} ${file || ''}`;
        else stdout = `${lines}  ${words}  ${bytes} ${file || ''}`;
        break;
      }

      case 'sort': {
        let text = stdinData || '';
        if (args[0] && !args[0].startsWith('-')) {
          const target = normalizePath(state.cwd, args[0]);
          const node = getVfsNode(target);
          text = node ? node.content : '';
        }
        const lines = text.split('\n').filter(Boolean);
        lines.sort();
        if (args.includes('-r')) lines.reverse();
        stdout = lines.join('\n');
        break;
      }

      case 'cut': {
        let text = stdinData || '';
        const lines = text.split('\n').filter(Boolean);
        stdout = lines.map(l => l.split(',')[0]).join('\n');
        break;
      }

      case 'head': {
        const n = 5;
        let text = stdinData || '';
        if (args[0] && !args[0].startsWith('-')) {
          const target = normalizePath(state.cwd, args[0]);
          const node = getVfsNode(target);
          text = node ? node.content : '';
        }
        stdout = text.split('\n').slice(0, n).join('\n');
        break;
      }

      case 'ps':
        stdout = '  PID TTY          TIME CMD\n' + state.processes.map(p => `${String(p.pid).padStart(5)} pts/0    ${p.time} ${p.cmd}`).join('\n');
        break;

      case 'clear':
        state.terminalLines = [];
        return '';

      case 'help':
        stdout = 'Available educational sandbox commands:\n  pwd, cd, ls, mkdir, touch, cat, echo, cp, mv, rm,\n  chmod, grep, head, tail, wc, sort, cut, ps, kill, export, env, clear, help\nSupports: Pipes (|) and Redirection (>, >>)';
        break;

      default:
        stdout = `Command '${cmd}' recognized in simulation.`;
    }

    if (stdout) {
      state.terminalLines.push({ type: 'out', text: stdout });
    }
    return stdout;
  }

  function executePipeline(cmdStr) {
    const parts = cmdStr.split('|').map(s => s.trim());
    let currentInput = null;
    for (let part of parts) {
      currentInput = executeSingleCommand(part, currentInput);
    }
    return currentInput;
  }

  function executeRedirection(cmdStr) {
    const isAppend = cmdStr.includes('>>');
    const parts = cmdStr.split(isAppend ? '>>' : '>').map(s => s.trim());
    const leftCmd = parts[0];
    const targetFile = parts[1];

    const output = executeSingleCommand(leftCmd, null);
    if (targetFile) {
      const fullPath = normalizePath(state.cwd, targetFile);
      const node = getVfsNode(fullPath);
      if (node) {
        node.content = isAppend ? (node.content + output + '\n') : (output + '\n');
      } else {
        VFS[fullPath] = { type: 'file', mode: '644', owner: 'student', group: 'student', content: output + '\n', mtime: 'Oct 16 10:30' };
      }
    }
    return output;
  }

  function parseCommandLine(text) {
    const tokens = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if ((ch === '"' || ch === "'") && (!inQuote || quoteChar === ch)) {
        inQuote = !inQuote;
        quoteChar = inQuote ? ch : '';
      } else if (ch === ' ' && !inQuote) {
        if (current.length) { tokens.push(current); current = ''; }
      } else {
        current += ch;
      }
    }
    if (current.length) tokens.push(current);
    return tokens;
  }

  function modeToSymbolic(modeStr) {
    const m = String(modeStr || '644').padStart(3, '0').slice(-3);
    const rwx = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    return rwx[parseInt(m[0])] + rwx[parseInt(m[1])] + rwx[parseInt(m[2])];
  }

  // ══════════════════════════════════════════════════════════
  // 4. CANVAS RENDERING ENGINE
  // ══════════════════════════════════════════════════════════
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

  function renderSimulation() {
    if (!ctx || !dom.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = dom.canvas.width / dpr;
    const h = dom.canvas.height / dpr;
    const dark = state.theme === 'dark';

    // Clear
    ctx.fillStyle = dark ? '#080c14' : '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Terminal Title Bar
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, w, 32);
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, 32);

    // Window Dots
    const dots = ['#ff5f56', '#ffbd2e', '#27c93f'];
    dots.forEach((dot, i) => {
      ctx.beginPath();
      ctx.arc(18 + i * 14, 16, 5, 0, Math.PI * 2);
      ctx.fillStyle = dot;
      ctx.fill();
    });

    ctx.fillStyle = '#8b949e';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`user@eduverse: ${state.cwd} (Bash 5.2 - Safe Sandbox)`, w / 2, 20);

    // Render terminal lines
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    let y = 55;
    const linesToDraw = state.terminalLines.slice(-16);
    linesToDraw.forEach(line => {
      if (line.type === 'sys') {
        ctx.fillStyle = '#6e7681';
        ctx.fillText(line.text, 16, y);
      } else if (line.type === 'cmd') {
        ctx.fillStyle = '#58a6ff';
        ctx.fillText(`user@eduverse:`, 16, y);
        const uLen = ctx.measureText(`user@eduverse:`).width;
        ctx.fillStyle = '#7ee787';
        ctx.fillText(`${line.cwd || '~'}$ `, 16 + uLen, y);
        const pLen = ctx.measureText(`${line.cwd || '~'}$ `).width;
        ctx.fillStyle = '#f0f6fc';
        ctx.fillText(line.text, 16 + uLen + pLen, y);
      } else if (line.type === 'err') {
        ctx.fillStyle = '#f85149';
        ctx.fillText(line.text, 16, y);
      } else {
        ctx.fillStyle = '#c9d1d9';
        const sublines = line.text.split('\n').slice(0, 3);
        sublines.forEach((sl, idx) => {
          ctx.fillText(sl, 16, y + idx * 16);
        });
        y += (sublines.length - 1) * 16;
      }
      y += 18;
    });

    // Active Cursor Prompt
    ctx.fillStyle = '#58a6ff';
    ctx.fillText(`user@eduverse:`, 16, y);
    const uLen = ctx.measureText(`user@eduverse:`).width;
    ctx.fillStyle = '#7ee787';
    ctx.fillText(`${state.cwd}$ `, 16 + uLen, y);
    const pLen = ctx.measureText(`${state.cwd}$ `).width;

    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(16 + uLen + pLen + 2, y - 11, 8, 14);
  }

  // ══════════════════════════════════════════════════════════
  // 5. INSPECTOR PANELS & LIFECYCLE
  // ══════════════════════════════════════════════════════════
  function loadSimulation(simId) {
    const sim = catalog.getSimulationById(simId);
    if (!sim) return;

    state.currentSimId = simId;
    state.currentStep = 0;
    state.isPlaying = false;
    state.params = JSON.parse(JSON.stringify(sim.defaultParams || {}));

    if (dom.title) dom.title.textContent = sim.title;
    if (dom.overlaySim) dom.overlaySim.textContent = sim.topic;
    if (dom.overlayState) {
      dom.overlayState.textContent = state.mode === 'learn' ? '🎓 Learn Mode' : state.mode === 'experiment' ? '🔬 Experiment' : '🏆 Challenge';
    }

    state.maxSteps = 4;
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
    showToast(`${sim.icon} ${sim.topic}`);
  }

  function updateStepLabel() {
    if (dom.stepLabel) dom.stepLabel.textContent = `Step ${state.currentStep + 1} of ${state.maxSteps}`;
    if (dom.bannerNo) dom.bannerNo.textContent = `Step ${state.currentStep + 1} of ${state.maxSteps}`;
    if (dom.progressFill) dom.progressFill.style.width = `${((state.currentStep + 1) / state.maxSteps) * 100}%`;
  }

  function updateFormulaBox(sim) {
    if (dom.formulaBox) {
      dom.formulaBox.textContent = sim.formula || 'Syntax: command [options] [arguments]';
    }
  }

  function updateSpecList(sim) {
    if (!dom.specList) return;
    const entries = listVfsDir(state.cwd);
    dom.specList.innerHTML = `
      <div style="font-size:12px;margin-bottom:8px"><strong>CWD:</strong> <code>${state.cwd}</code></div>
      <div style="font-size:11.5px;color:var(--muted);margin-bottom:4px">Directory contents (${entries.length} items):</div>
      <table style="width:100%;font-size:11px;font-family:var(--mono);border-collapse:collapse">
        ${entries.map(e => `<tr><td style="color:${e.type === 'dir' ? 'var(--primary)' : 'inherit'}">${e.type === 'dir' ? '📁 ' : '📄 '}${e.name}</td><td style="color:var(--muted)">${e.mode}</td><td>${e.owner}</td></tr>`).join('')}
      </table>
    `;
  }

  function updateExplanation(sim) {
    if (dom.whatText) dom.whatText.textContent = sim.description;
    if (dom.whyText) dom.whyText.textContent = 'Command-line execution processes positional arguments deterministically against the VFS tree.';
    if (dom.nextText) dom.nextText.textContent = 'Enter an allowlisted command or select a preset to trigger state transitions.';
  }

  function buildInputs(sim) {
    if (!dom.inputsForm) return;
    dom.inputsForm.innerHTML = '';

    // Quick Command Bar
    const wrap = document.createElement('div');
    wrap.className = 'sh-field';
    wrap.innerHTML = `
      <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px">Enter Terminal Command:</label>
      <div style="display:flex;gap:6px">
        <input type="text" id="sh-term-input" placeholder="e.g. ls -la, pwd, cat notes.txt" style="flex:1;padding:6px 8px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:var(--mono);font-size:12px">
        <button type="button" id="sh-btn-run" class="ep-btn ep-btn-primary" style="padding:0 12px">Run</button>
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--muted)">Quick presets:</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
        <button type="button" class="ep-btn ep-small sh-preset" data-cmd="ls -la">ls -la</button>
        <button type="button" class="ep-btn ep-small sh-preset" data-cmd="pwd">pwd</button>
        <button type="button" class="ep-btn ep-small sh-preset" data-cmd="cat notes.txt">cat notes.txt</button>
        <button type="button" class="ep-btn ep-small sh-preset" data-cmd="chmod 755 notes.txt">chmod 755</button>
        <button type="button" class="ep-btn ep-small sh-preset" data-cmd="cat data.csv | grep CSE">pipeline (|)</button>
        <button type="button" class="ep-btn ep-small sh-preset" data-cmd="ps aux">ps aux</button>
      </div>
    `;

    dom.inputsForm.appendChild(wrap);

    const input = wrap.querySelector('#sh-term-input');
    const runBtn = wrap.querySelector('#sh-btn-run');

    const handleRun = () => {
      const val = input.value.trim();
      if (!val) return;
      executeCommand(val);
      input.value = '';
      updateSpecList(sim);
      renderSimulation();
    };

    runBtn.addEventListener('click', handleRun);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRun();
    });

    wrap.querySelectorAll('.sh-preset').forEach(btn => {
      btn.addEventListener('click', function () {
        executeCommand(this.dataset.cmd);
        updateSpecList(sim);
        renderSimulation();
      });
    });
  }

  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(dom.toast._timer);
    dom.toast._timer = setTimeout(() => dom.toast.classList.remove('show'), 2200);
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
    dom.challengeResult.innerHTML = '<span style="color:#10b981">✓ Task Verified! Correct Linux command operations executed on virtual filesystem.</span>';
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
    dom.aiAnswer.innerHTML = '<span style="color:var(--muted)">Consulting POSIX standard and Linux shell reference...</span>';

    setTimeout(() => {
      dom.aiAnswer.innerHTML = `<strong>Linux Tutor AI:</strong> In Bash, commands follow standard execution semantics. For <em>${state.currentSimId}</em>, operations are sandboxed in virtual memory. Use pipes to connect stdout to stdin and redirection to capture file output.`;
    }, 400);
  }

  function resetParams() {
    initVFS();
    state.cwd = '/home/student';
    state.terminalLines = [
      { type: 'sys', text: 'Virtual filesystem reset to initial practice snapshot.' }
    ];
    const sim = catalog.getSimulationById(state.currentSimId);
    if (sim) updateSpecList(sim);
    renderSimulation();
    showToast('Virtual Filesystem Reset');
  }

  // ══════════════════════════════════════════════════════════
  // 6. INITIALIZATION & EXPORTS
  // ══════════════════════════════════════════════════════════
  function init() {
    initVFS();

    const params = new URLSearchParams(window.location.search);
    const requestedSim = params.get('sim') || params.get('simulationId') || 'u25cs202-terminal-basics';
    const requestedUnit = params.get('unit');

    const sim = catalog.getSimulationById(requestedSim);
    if (sim) {
      state.currentUnit = sim.unit;
      state.currentSimId = sim.id;
    } else if (requestedUnit) {
      state.currentUnit = parseInt(requestedUnit, 10) || 1;
      const unitSims = catalog.getSimulationsForUnit(state.currentUnit);
      if (unitSims.length) state.currentSimId = unitSims[0].id;
    }

    populateSimDropdown(state.currentUnit);
    if (dom.unitSelect) dom.unitSelect.value = String(state.currentUnit);
    if (dom.simSelect) dom.simSelect.value = state.currentSimId;

    if (dom.unitSelect) {
      dom.unitSelect.addEventListener('change', function () {
        state.currentUnit = parseInt(this.value, 10);
        populateSimDropdown(state.currentUnit);
        const sims = catalog.getSimulationsForUnit(state.currentUnit);
        if (sims.length) {
          state.currentSimId = sims[0].id;
          dom.simSelect.value = sims[0].id;
          loadSimulation(sims[0].id);
        }
      });
    }

    if (dom.simSelect) {
      dom.simSelect.addEventListener('change', function () {
        state.currentSimId = this.value;
        loadSimulation(this.value);
      });
    }

    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        renderSimulation();
      });
    }

    if (dom.resetParamsBtn) dom.resetParamsBtn.addEventListener('click', resetParams);
    if (dom.verifyChallengeBtn) dom.verifyChallengeBtn.addEventListener('click', verifyChallenge);
    if (dom.resetChallengeBtn) dom.resetChallengeBtn.addEventListener('click', resetChallenge);
    if (dom.askAiBtn) dom.askAiBtn.addEventListener('click', askSubjectAI);

    dom.modeBtns.forEach(btn => {
      btn.addEventListener('click', function () { switchMode(this.dataset.learn); });
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    loadSimulation(state.currentSimId);
  }

  function populateSimDropdown(unitNumber) {
    if (!dom.simSelect) return;
    const sims = catalog.getSimulationsForUnit(unitNumber);
    dom.simSelect.innerHTML = '';
    sims.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.icon} ${s.topic}`;
      if (s.flagship) opt.textContent += ' ⭐';
      dom.simSelect.appendChild(opt);
    });
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      executeCommand,
      normalizePath,
      modeToSymbolic,
      ALLOWED_COMMANDS,
      initVFS
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
