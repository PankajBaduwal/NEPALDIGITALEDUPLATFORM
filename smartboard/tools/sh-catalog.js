/**
 * sh-catalog.js
 * Linux and Shell Scripting (U25CS202) — 18 Simulations Catalog
 * Regulation R2025 CBCS · Semester II · Common to AD, AM, CB, CSE, IT, Cyber · ESC · 2 Credits
 *
 * 5 Units:
 * Unit I:   Linux Basics & Navigation (Sims 1-4)
 * Unit II:  Filesystem Hierarchy & File Permissions (Sims 5-8)
 * Unit III: Streams, Redirection & Text Processing Filters (Sims 9-12)
 * Unit IV:  Shell Scripting Fundamentals & Logic (Sims 13-15)
 * Unit V:   Loops, Functions & Process Management (Sims 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduverseSHCatalog = exp;
  if (typeof window !== 'undefined') window.EduverseSHCatalog = exp;
  if (typeof global !== 'undefined') global.EduverseSHCatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Linux Basics & Navigation', code: 'UNIT I' },
    { number: 2, title: 'Filesystem Hierarchy & File Permissions', code: 'UNIT II' },
    { number: 3, title: 'Streams, Redirection & Text Processing Filters', code: 'UNIT III' },
    { number: 4, title: 'Shell Scripting Fundamentals & Logic', code: 'UNIT IV' },
    { number: 5, title: 'Loops, Functions & Process Management', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — LINUX BASICS & NAVIGATION
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs202-terminal-basics',
      unit: 1,
      unitTitle: 'Linux Basics & Navigation',
      topic: 'Terminal Navigation',
      title: 'Interactive Linux Terminal & Navigation ⭐ (Flagship)',
      icon: '💻',
      flagship: true,
      description: 'Practice fundamental command-line navigation inside a safe simulated Bash terminal with virtual paths and auto-completion.',
      formula: '\\text{Prompt: } \\text{user@eduverse}\\mathbf{:}\\sim\\mathbf{\\$} \\quad | \\quad \\text{Syntax: } \\text{command [options] [arguments]}',
      defaultParams: { currentDir: '/home/student', activeCommand: 'pwd' },
      challenge: {
        goal: 'Print the current working directory, list all files including hidden ones, and navigate into the documents directory.',
        expectedCommands: ['pwd', 'ls -la', 'cd documents']
      }
    },
    {
      id: 'u25cs202-file-operations',
      unit: 1,
      unitTitle: 'Linux Basics & Navigation',
      topic: 'File Operations',
      title: 'Virtual File Operations Lab',
      icon: '📁',
      flagship: false,
      description: 'Create, inspect, copy, rename, and remove virtual files and directories safely using touch, mkdir, cp, mv, cat, and rm.',
      formula: '\\text{mkdir } \\text{dir} \\quad | \\quad \\text{touch } \\text{file} \\quad | \\quad \\text{cp } \\text{src dst} \\quad | \\quad \\text{mv } \\text{src dst}',
      defaultParams: { operation: 'mkdir', targetName: 'project1' },
      challenge: {
        goal: 'Create a new directory named "lab1", create a file named "notes.txt" inside it, and view its content.',
        expectedCommands: ['mkdir lab1', 'touch lab1/notes.txt', 'cat lab1/notes.txt']
      }
    },
    {
      id: 'u25cs202-path-resolution',
      unit: 1,
      unitTitle: 'Linux Basics & Navigation',
      topic: 'Path Resolution',
      title: 'Absolute vs Relative Path Explorer',
      icon: '🧭',
      flagship: false,
      description: 'Explore the difference between absolute paths starting at / and relative paths starting from the current working directory.',
      formula: '\\text{Absolute: } /\\text{home}/\\text{student}/\\text{docs} \\quad \\longleftrightarrow \\quad \\text{Relative: } ./\\text{docs} \\text{ or } ../\\text{sibling}',
      defaultParams: { startPath: '/home/student', targetPath: '../../etc/os-release' },
      challenge: {
        goal: 'Navigate from /home/student/projects to /var/log using both an absolute path and a relative path.',
        expectedPath: '/var/log'
      }
    },
    {
      id: 'u25cs202-command-predictor',
      unit: 1,
      unitTitle: 'Linux Basics & Navigation',
      topic: 'Command Prediction',
      title: 'Command Prediction & Output Challenge',
      icon: '🎯',
      flagship: false,
      description: 'Inspect command strings, predict standard output and virtual filesystem state changes, and verify your predictions.',
      formula: '\\text{State}_{t+1} = f(\\text{State}_t, \\text{Command}, \\text{Arguments})',
      defaultParams: { testCommand: 'ls -l /home/student' },
      challenge: {
        goal: 'Predict how many lines of output "ls -la" will return for a directory with 3 visible files and 2 hidden files.',
        expectedAnswer: '7'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — FILESYSTEM HIERARCHY & FILE PERMISSIONS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs202-fhs-tree',
      unit: 2,
      unitTitle: 'Filesystem Hierarchy & File Permissions',
      topic: 'Filesystem Hierarchy',
      title: 'Linux Filesystem Hierarchy (FHS) Explorer ⭐ (Flagship)',
      icon: '🌳',
      flagship: true,
      description: 'Interactive tree visualizer of the standard Linux Filesystem Hierarchy: /, /bin, /etc, /home, /usr, /var, and /tmp.',
      formula: '/ \\rightarrow \\{\\text{bin, boot, dev, etc, home, lib, opt, proc, root, sys, tmp, usr, var}\\}',
      defaultParams: { selectedNode: '/etc' },
      challenge: {
        goal: 'Locate where system configuration files, user home directories, and log files are stored in the FHS tree.',
        expectedNodes: ['/etc', '/home', '/var/log']
      }
    },
    {
      id: 'u25cs202-permissions-lab',
      unit: 2,
      unitTitle: 'Filesystem Hierarchy & File Permissions',
      topic: 'File Permissions',
      title: 'File Permissions & Chmod Visualizer',
      icon: '🔒',
      flagship: false,
      description: 'Manipulate read (4), write (2), and execute (1) permissions for User, Group, and Others with live symbolic and octal mode calculation.',
      formula: '\\text{Mode} = (r \\times 4 + w \\times 2 + x \\times 1)_{u,g,o} \\quad | \\quad \\text{e.g. } rwxr-xr-x = 755',
      defaultParams: { userR: 1, userW: 1, userX: 1, groupR: 1, groupW: 0, groupX: 1, otherR: 1, otherW: 0, otherX: 1 },
      challenge: {
        goal: 'Configure permissions so the owner can read/write/execute, group can read/execute, and others have no access (750).',
        targetOctal: '750',
        targetSymbolic: 'rwxr-x---'
      }
    },
    {
      id: 'u25cs202-access-evaluator',
      unit: 2,
      unitTitle: 'Filesystem Hierarchy & File Permissions',
      topic: 'Access Control',
      title: 'File Access & Ownership Challenge',
      icon: '🛡️',
      flagship: false,
      description: 'Determine whether a simulated user can open, modify, or run a file based on file ownership, group membership, and permission bits.',
      formula: '\\text{Access Granted} \\iff (\\text{UID} = \\text{Owner} \\land \\text{Perm}_u) \\lor (\\text{GID} = \\text{Group} \\land \\text{Perm}_g) \\lor \\text{Perm}_o',
      defaultParams: { fileMode: '640', fileOwner: 'admin', fileGroup: 'faculty', activeUser: 'student' },
      challenge: {
        goal: 'Explain why user "student" cannot read a file with permissions 640 owned by "admin:faculty".',
        expectedOutcome: 'Permission Denied'
      }
    },
    {
      id: 'u25cs202-directory-permissions',
      unit: 2,
      unitTitle: 'Filesystem Hierarchy & File Permissions',
      topic: 'Directory Permissions',
      title: 'Directory Permissions & Execute Bit Lab',
      icon: '📂',
      flagship: false,
      description: 'Understand the distinct role of read (listing directory contents) and execute (traversing into directory with cd) on Linux directories.',
      formula: '\\text{Dir Read: } \\text{ls capability} \\quad | \\quad \\text{Dir Execute: } \\text{cd capability \\& path traversal}',
      defaultParams: { dirMode: '755' },
      challenge: {
        goal: 'Demonstrate what happens when execute permission is removed from a directory while read permission is kept.',
        expectedBehavior: 'Can list files but cannot access file contents'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — STREAMS, REDIRECTION & TEXT PROCESSING FILTERS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs202-io-redirection',
      unit: 3,
      unitTitle: 'Streams, Redirection & Text Processing Filters',
      topic: 'I/O Redirection',
      title: 'I/O Streams & Redirection Lab ⭐ (Flagship)',
      icon: '🔀',
      flagship: true,
      description: 'Visualize standard streams (stdin 0, stdout 1, stderr 2) and practice file redirection using >, >>, <, and 2>.',
      formula: '\\text{cmd} > \\text{file (overwrite)} \\quad | \\quad \\text{cmd} \\gg \\text{file (append)} \\quad | \\quad \\text{cmd } 2> \\text{err.log}',
      defaultParams: { streamMode: 'stdout-overwrite', command: 'echo "Batch 2026" > batch.txt' },
      challenge: {
        goal: 'Append three student records into "roster.txt" without overwriting existing entries using the >> operator.',
        targetOperator: '>>'
      }
    },
    {
      id: 'u25cs202-pipeline-builder',
      unit: 3,
      unitTitle: 'Streams, Redirection & Text Processing Filters',
      topic: 'Pipelines',
      title: 'Pipeline Flow Visualizer (|)',
      icon: '⚙️',
      flagship: false,
      description: 'Connect commands via pipes (|), passing stdout of the left command into stdin of the right command with live buffer inspection.',
      formula: '\\text{stdout}(\\text{cmd}_1) \\xrightarrow{\\text{pipe [FIFO]}} \\text{stdin}(\\text{cmd}_2)',
      defaultParams: { pipeline: 'cat /etc/passwd | cut -d: -f1 | sort' },
      challenge: {
        goal: 'Build a pipeline that reads "system.log", filters lines containing "ERROR", and counts the total matching occurrences.',
        expectedPipeline: 'cat system.log | grep ERROR | wc -l'
      }
    },
    {
      id: 'u25cs202-text-filters',
      unit: 3,
      unitTitle: 'Streams, Redirection & Text Processing Filters',
      topic: 'Text Filters',
      title: 'Text Processing & Filters Studio',
      icon: '🔍',
      flagship: false,
      description: 'Experiment with standard text manipulation utilities: grep (pattern matching), sort, wc (word/line count), head, tail, and cut.',
      formula: '\\text{grep [-i,-v,-n]} \\quad | \\quad \\text{sort [-r,-n]} \\quad | \\quad \\text{wc [-l,-w,-c]} \\quad | \\quad \\text{cut -d, -f}',
      defaultParams: { filter: 'grep', pattern: 'KPRIET', options: '-i' },
      challenge: {
        goal: 'Extract the first 5 highest scores from a CSV grade sheet using sort and head.',
        expectedCommands: ['sort -nr grades.csv | head -n 5']
      }
    },
    {
      id: 'u25cs202-log-analysis',
      unit: 3,
      unitTitle: 'Streams, Redirection & Text Processing Filters',
      topic: 'Log Analysis',
      title: 'Log Analysis Practical Challenge',
      icon: '📊',
      flagship: false,
      description: 'Analyze simulated web server access logs to identify top visiting IP addresses, status codes (404/500), and peak traffic requests.',
      formula: '\\text{cat access.log | awk/cut | sort | uniq -c | sort -nr | head -n 10}',
      defaultParams: { logFile: 'access.log', analysisGoal: 'top-ips' },
      challenge: {
        goal: 'Find the IP address that generated the highest number of 404 Not Found requests in the log file.',
        expectedIp: '192.168.1.105'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — SHELL SCRIPTING FUNDAMENTALS & LOGIC
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs202-script-variables',
      unit: 4,
      unitTitle: 'Shell Scripting Fundamentals & Logic',
      topic: 'Variables & Parameters',
      title: 'Shell Variables, Quoting & Arguments ⭐ (Flagship)',
      icon: '💲',
      flagship: true,
      description: 'Understand variable assignment, parameter expansion ($VAR), quoting differences ("$VAR" vs \'$VAR\'), and positional parameters ($1..$9, $#, $?).',
      formula: '\\text{NAME}=\\text{"Eduverse"} \\quad | \\quad \\text{\\"$VAR\\" (expanded)} \\quad \\ne \\quad \\text{\'$VAR\' (literal)}',
      defaultParams: { varName: 'COURSE', varVal: 'Linux', quoteType: 'double' },
      challenge: {
        goal: 'Explain the output of echo "$COURSE" vs echo \'$COURSE\' when COURSE="Linux".',
        expectedOutputs: ['Linux', '$COURSE']
      }
    },
    {
      id: 'u25cs202-conditionals-lab',
      unit: 4,
      unitTitle: 'Shell Scripting Fundamentals & Logic',
      topic: 'Conditionals',
      title: 'Conditionals & Test Constructs (if-else, case)',
      icon: '🔀',
      flagship: false,
      description: 'Explore numeric comparisons (-eq, -ne, -lt, -gt), string tests (=, !=, -z), file tests (-f, -d, -e), and case-esac branch selection.',
      formula: '\\mathbf{if} \\; [ \\; \\$a -\\text{gt} \\; \\$b \\; ]; \\; \\mathbf{then} \\dots \\mathbf{elif} \\dots \\mathbf{else} \\dots \\mathbf{fi}',
      defaultParams: { valA: 15, valB: 10, operator: '-gt' },
      challenge: {
        goal: 'Write a test condition that checks whether a variable $score is greater than or equal to 50.',
        expectedTest: '[ "$score" -ge 50 ]'
      }
    },
    {
      id: 'u25cs202-script-stepper',
      unit: 4,
      unitTitle: 'Shell Scripting Fundamentals & Logic',
      topic: 'Script Execution',
      title: 'Step-by-Step Shell Script Runner',
      icon: '📜',
      flagship: false,
      description: 'Step through shell scripts line by line, inspect variable state changes, evaluate branch conditions, and view simulated stdout.',
      formula: '#!/bin/bash \\rightarrow \\text{Sequential Line Execution with Environment Stack}',
      defaultParams: { scriptId: 'calc-grade' },
      challenge: {
        goal: 'Step through the grade evaluation script and observe which branch is entered when mark=85.',
        expectedBranch: 'Grade A'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — LOOPS, FUNCTIONS & PROCESS MANAGEMENT
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs202-loops-stepper',
      unit: 5,
      unitTitle: 'Loops, Functions & Process Management',
      topic: 'Looping Constructs',
      title: 'Looping Constructs Visualizer (for, while) ⭐ (Flagship)',
      icon: '🔁',
      flagship: true,
      description: 'Visualize for loops (over item lists, ranges {1..5}) and while/until loops with animated loop indices and iteration limits.',
      formula: '\\mathbf{for} \\; i \\; \\mathbf{in} \\; \\{1..n\\}; \\; \\mathbf{do} \\dots \\mathbf{done} \\quad | \\quad \\mathbf{while} \\; [ \\; \\dots \\; ]; \\; \\mathbf{do} \\dots \\mathbf{done}',
      defaultParams: { loopType: 'for', rangeStart: 1, rangeEnd: 5 },
      challenge: {
        goal: 'Trace a while loop calculating the factorial of 5 and record the state of the product variable on iteration 3.',
        expectedVal: '60'
      }
    },
    {
      id: 'u25cs202-shell-functions',
      unit: 5,
      unitTitle: 'Loops, Functions & Process Management',
      topic: 'Shell Functions',
      title: 'Shell Functions & Scope Explorer',
      icon: '📦',
      flagship: false,
      description: 'Define shell functions, pass arguments ($1, $2), manage local variables using the local keyword, and return exit statuses.',
      formula: '\\text{greet}() \\; \\{ \\; \\mathbf{local} \\; \\text{name}=\\$1; \\; \\text{echo} \\; \\text{"Hello } \\$name\\text{"}; \\; \\mathbf{return} \\; 0; \\; \\}',
      defaultParams: { fnName: 'backup_file', arg1: 'data.txt' },
      challenge: {
        goal: 'Demonstrate that a variable declared with "local" inside a function is inaccessible outside the function.',
        expectedScope: 'Undefined in global scope'
      }
    },
    {
      id: 'u25cs202-process-management',
      unit: 5,
      unitTitle: 'Loops, Functions & Process Management',
      topic: 'Process Management',
      title: 'Process States & Signal Control (ps, kill, &)',
      icon: '⚡',
      flagship: false,
      description: 'Simulate Linux process lifecycles (Running, Sleeping, Stopped, Zombie), inspect process IDs (PID, PPID), background jobs (&), and signals (SIGTERM, SIGKILL).',
      formula: '\\text{ps aux} \\quad | \\quad \\text{cmd \\& (background)} \\quad | \\quad \\text{kill -9 PID (SIGKILL)} \\quad | \\quad \\text{kill -15 PID (SIGTERM)}',
      defaultParams: { activePid: 1042, targetSignal: 15 },
      challenge: {
        goal: 'Send a graceful termination signal (SIGTERM 15) to a background process and observe its state change from Running to Terminated.',
        expectedSignal: '15'
      }
    }
  ];

  function getSimulationById(id) {
    if (!id) return null;
    const clean = id.trim();
    for (let i = 0; i < SIMULATIONS.length; i++) {
      if (SIMULATIONS[i].id === clean) return SIMULATIONS[i];
    }
    return null;
  }

  function getSimulationsForUnit(unitNumber) {
    const num = parseInt(unitNumber, 10);
    return SIMULATIONS.filter(s => s.unit === num);
  }

  return {
    courseCode: 'U25CS202',
    courseTitle: 'Linux and Shell Scripting',
    regulation: 'R2025 CBCS',
    semester: 2,
    credits: 2,
    UNITS: UNITS,
    SIMULATIONS: SIMULATIONS,
    getSimulationById: getSimulationById,
    getSimulationsForUnit: getSimulationsForUnit
  };
}));
