import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25CS202
 * Course Name: Linux and Shell Scripting
 * Semester: II | Category: ESC | Credits: 2 | Regulation: R2025 CBCS
 * Common to: AD, AM, CB, CSE, IT, Cyber Security (SC)
 * 
 * Uses isolated Smart Board Linux Engine architecture (boardEngine: 'sh')
 * Dynamic routing via smartboardPresetKey to sh-simulation.html and tools/sh-simulation.js.
 */
export const U25CS202_SUBJECT_KEYWORDS = [
  'linux and shell scripting',
  'linux & shell scripting',
  'shell scripting',
  'u25cs202',
  'cs202',
  'linux',
];

function u25csSimulation(def: {
  id: string;
  unit: number;
  unitTitle: string;
  topic: string;
  title: string;
  icon: string;
  shortDescription: string;
  learningObjectives: string[];
  formulaOverview: string;
  parameters: ISimulationParam[];
  metrics: ISimulationMetric[];
  flagship?: boolean;
}): ISimulationDefinition {
  return {
    id: def.id,
    boardEngine: 'sh',
    domain: 'COMPUTER_SCIENCE',
    category: 'operating systems & shell',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25CS202_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with a sandboxed educational virtual terminal, in-memory virtual filesystem, execution trace visualizer, and live feedback.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    tags: ['U25CS202', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Linux', 'Shell Scripting'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ cwd: '/home/student', active: true }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25CS202_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — LINUX BASICS & NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs202-terminal-basics',
    unit: 1,
    unitTitle: 'Linux Basics & Navigation',
    topic: 'Terminal Navigation',
    title: 'Interactive Linux Terminal & Navigation ⭐',
    icon: '💻',
    flagship: true,
    shortDescription: 'Practice fundamental command-line navigation inside a safe simulated Bash terminal with virtual paths and auto-completion.',
    learningObjectives: [
      'Navigate the hierarchical Linux directory tree using pwd and cd',
      'List files and hidden dotfiles using ls, ls -l, and ls -la',
      'Understand the Linux user prompt format user@host:path$',
    ],
    formulaOverview: '\\text{Prompt: } \\text{student@eduverse}\\mathbf{:}\\sim\\mathbf{\\$} \\quad | \\quad \\text{Syntax: } \\text{command [options] [arguments]}',
    parameters: [
      { key: 'cwd', label: 'Starting Directory', type: 'select', default: '/home/student', options: [
        { label: '/home/student (~)', value: '/home/student' },
        { label: '/var/log', value: '/var/log' },
        { label: '/etc', value: '/etc' },
      ]},
      { key: 'viewMode', label: 'Display Mode', type: 'select', default: 'terminal', options: [
        { label: 'Terminal + VFS Tree', value: 'terminal' },
        { label: 'Split View', value: 'split' },
      ]},
    ],
    metrics: [
      { id: 'vfsCwd', label: 'Current Working Directory', format: () => '/home/student' },
      { id: 'safeSandbox', label: 'Sandbox Isolation', format: () => '100% In-Memory' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-file-operations',
    unit: 1,
    unitTitle: 'Linux Basics & Navigation',
    topic: 'File Operations',
    title: 'Virtual File Operations Lab',
    icon: '📁',
    shortDescription: 'Create, inspect, copy, rename, and remove virtual files and directories safely using touch, mkdir, cp, mv, cat, and rm.',
    learningObjectives: [
      'Create files and directory hierarchies with touch and mkdir -p',
      'Manipulate virtual files using cp and mv safely without host OS access',
      'Inspect text file contents using cat',
    ],
    formulaOverview: '\\text{mkdir } \\text{dir} \\quad | \\quad \\text{touch } \\text{file} \\quad | \\quad \\text{cp } \\text{src dst} \\quad | \\quad \\text{mv } \\text{src dst}',
    parameters: [
      { key: 'operation', label: 'Preset Operation', type: 'select', default: 'mkdir', options: [
        { label: 'mkdir lab1', value: 'mkdir' },
        { label: 'touch lab1/notes.txt', value: 'touch' },
        { label: 'cat lab1/notes.txt', value: 'cat' },
      ]},
    ],
    metrics: [
      { id: 'vfsFiles', label: 'VFS Node Count', format: () => '18 files / 8 dirs' },
      { id: 'diskSafe', label: 'Host Storage', format: () => 'Protected (0 bytes)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-path-resolution',
    unit: 1,
    unitTitle: 'Linux Basics & Navigation',
    topic: 'Path Resolution',
    title: 'Absolute vs Relative Path Explorer',
    icon: '🧭',
    shortDescription: 'Explore the difference between absolute paths starting at / and relative paths starting from the current working directory.',
    learningObjectives: [
      'Differentiate absolute paths (rooted at /) from relative paths',
      'Understand navigation symbols: . (current dir) and .. (parent dir)',
      'Trace path resolution step-by-step through the directory graph',
    ],
    formulaOverview: '\\text{Absolute: } /\\text{home}/\\text{student}/\\text{docs} \\quad \\longleftrightarrow \\quad \\text{Relative: } ./\\text{docs} \\text{ or } ../\\text{sibling}',
    parameters: [
      { key: 'targetPath', label: 'Target Path', type: 'text', default: '../../etc/os-release' },
    ],
    metrics: [
      { id: 'resolvedPath', label: 'Canonical Path', format: () => '/etc/os-release' },
      { id: 'pathType', label: 'Path Type', format: () => 'Relative' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-command-predictor',
    unit: 1,
    unitTitle: 'Linux Basics & Navigation',
    topic: 'Command Prediction',
    title: 'Command Prediction & Output Challenge',
    icon: '🎯',
    shortDescription: 'Inspect command strings, predict standard output and virtual filesystem state changes, and verify your predictions.',
    learningObjectives: [
      'Predict command execution outputs before running them',
      'Verify understanding of command flags (-l, -a, -h)',
      'Analyze output differences and error exit codes',
    ],
    formulaOverview: '\\text{State}_{t+1} = f(\\text{State}_t, \\text{Command}, \\text{Arguments})',
    parameters: [
      { key: 'command', label: 'Test Command', type: 'text', default: 'ls -la /home/student' },
    ],
    metrics: [
      { id: 'predictedLines', label: 'Predicted Lines', format: () => '7' },
      { id: 'exitCode', label: 'Predicted Exit Code', format: () => '0' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — FILESYSTEM HIERARCHY & FILE PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs202-fhs-tree',
    unit: 2,
    unitTitle: 'Filesystem Hierarchy & File Permissions',
    topic: 'Filesystem Hierarchy',
    title: 'Linux Filesystem Hierarchy (FHS) Explorer ⭐',
    icon: '🌳',
    flagship: true,
    shortDescription: 'Interactive tree visualizer of the standard Linux Filesystem Hierarchy: /, /bin, /etc, /home, /usr, /var, and /tmp.',
    learningObjectives: [
      'Master the standard Linux Filesystem Hierarchy Standard (FHS)',
      'Understand the specific roles of /bin, /etc, /home, /var, and /tmp',
      'Inspect simulated system files like /etc/os-release and /var/log/syslog',
    ],
    formulaOverview: '/ \\rightarrow \\{\\text{bin, dev, etc, home, lib, proc, root, sys, tmp, usr, var}\\}',
    parameters: [
      { key: 'fhsNode', label: 'Inspect Directory', type: 'select', default: '/etc', options: [
        { label: '/etc (System Configurations)', value: '/etc' },
        { label: '/home (User Spaces)', value: '/home' },
        { label: '/var/log (System Logs)', value: '/var/log' },
        { label: '/bin (Essential Binaries)', value: '/bin' },
      ]},
    ],
    metrics: [
      { id: 'fhsRole', label: 'FHS Purpose', format: () => 'Host-specific system configurations' },
      { id: 'fhsAccess', label: 'Default Access', format: () => 'Read-only for unprivileged users' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-permissions-lab',
    unit: 2,
    unitTitle: 'Filesystem Hierarchy & File Permissions',
    topic: 'File Permissions',
    title: 'File Permissions & Chmod Visualizer',
    icon: '🔒',
    shortDescription: 'Manipulate read (4), write (2), and execute (1) permissions for User, Group, and Others with live symbolic and octal mode calculation.',
    learningObjectives: [
      'Calculate octal permission modes from read (4), write (2), and execute (1) bits',
      'Convert between symbolic (rwxr-xr--) and numeric (754) notations',
      'Apply simulated chmod commands to in-memory virtual files',
    ],
    formulaOverview: '\\text{Mode} = (r \\times 4 + w \\times 2 + x \\times 1)_{u,g,o} \\quad | \\quad \\text{e.g. } rwxr-xr-x = 755',
    parameters: [
      { key: 'userBits', label: 'Owner Permissions (u)', type: 'select', default: '7', options: [
        { label: 'rwx (7)', value: '7' },
        { label: 'rw- (6)', value: '6' },
        { label: 'r-x (5)', value: '5' },
        { label: 'r-- (4)', value: '4' },
      ]},
      { key: 'groupBits', label: 'Group Permissions (g)', type: 'select', default: '5', options: [
        { label: 'r-x (5)', value: '5' },
        { label: 'rw- (6)', value: '6' },
        { label: 'r-- (4)', value: '4' },
        { label: '--- (0)', value: '0' },
      ]},
      { key: 'otherBits', label: 'Others Permissions (o)', type: 'select', default: '5', options: [
        { label: 'r-x (5)', value: '5' },
        { label: 'r-- (4)', value: '4' },
        { label: '--- (0)', value: '0' },
      ]},
    ],
    metrics: [
      { id: 'octalMode', label: 'Octal Mode', format: () => '755' },
      { id: 'symbolicMode', label: 'Symbolic Mode', format: () => 'rwxr-xr-x' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-access-evaluator',
    unit: 2,
    unitTitle: 'Filesystem Hierarchy & File Permissions',
    topic: 'Access Control',
    title: 'File Access & Ownership Challenge',
    icon: '🛡️',
    shortDescription: 'Determine whether a simulated user can open, modify, or run a file based on file ownership, group membership, and permission bits.',
    learningObjectives: [
      'Evaluate access decisions based on UID, GID, and permission triad order (owner -> group -> other)',
      'Explain why other permissions are ignored if the user matches the file owner',
      'Troubleshoot permission denied errors in realistic engineering scenarios',
    ],
    formulaOverview: '\\text{Access Granted} \\iff (\\text{UID}=\\text{Owner} \\land \\text{Perm}_u) \\lor (\\text{GID}=\\text{Group} \\land \\text{Perm}_g) \\lor \\text{Perm}_o',
    parameters: [
      { key: 'activeUser', label: 'Acting User', type: 'select', default: 'student', options: [
        { label: 'student (group: students)', value: 'student' },
        { label: 'faculty (group: faculty)', value: 'faculty' },
        { label: 'guest (group: guest)', value: 'guest' },
      ]},
      { key: 'fileMode', label: 'Target File Mode', type: 'text', default: '640' },
    ],
    metrics: [
      { id: 'canRead', label: 'Read Access', format: () => 'Denied' },
      { id: 'canWrite', label: 'Write Access', format: () => 'Denied' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-directory-permissions',
    unit: 2,
    unitTitle: 'Filesystem Hierarchy & File Permissions',
    topic: 'Directory Permissions',
    title: 'Directory Permissions & Execute Bit Lab',
    icon: '📂',
    shortDescription: 'Understand the distinct role of read (listing directory contents) and execute (traversing into directory with cd) on Linux directories.',
    learningObjectives: [
      'Distinguish directory read permission (allows ls) from execute permission (allows cd)',
      'Analyze the impact of missing execute permission on path resolution',
      'Understand the sticky bit and security implications on shared directories like /tmp',
    ],
    formulaOverview: '\\text{Dir Read: } \\text{ls capability} \\quad | \\quad \\text{Dir Execute: } \\text{cd capability \\& path traversal}',
    parameters: [
      { key: 'dirMode', label: 'Directory Mode', type: 'select', default: '755', options: [
        { label: '755 (rwxr-xr-x) - Standard Directory', value: '755' },
        { label: '644 (rw-r--r--) - No Execute Bit', value: '644' },
        { label: '700 (rwx------) - Private Directory', value: '700' },
      ]},
    ],
    metrics: [
      { id: 'canLs', label: 'Can List Contents (ls)', format: () => 'Yes' },
      { id: 'canCd', label: 'Can Enter Directory (cd)', format: () => 'Yes' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — STREAMS, REDIRECTION & TEXT PROCESSING FILTERS
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs202-io-redirection',
    unit: 3,
    unitTitle: 'Streams, Redirection & Text Processing Filters',
    topic: 'I/O Redirection',
    title: 'I/O Streams & Redirection Lab ⭐',
    icon: '🔀',
    flagship: true,
    shortDescription: 'Visualize standard streams (stdin 0, stdout 1, stderr 2) and practice file redirection using >, >>, <, and 2>.',
    learningObjectives: [
      'Identify file descriptors 0 (stdin), 1 (stdout), and 2 (stderr)',
      'Differentiate overwrite redirection (>) from append redirection (>>)',
      'Redirect error streams separately using 2> and combine streams with 2>&1',
    ],
    formulaOverview: '\\text{cmd} > \\text{file (overwrite)} \\quad | \\quad \\text{cmd} \\gg \\text{file (append)} \\quad | \\quad \\text{cmd } 2> \\text{err.log}',
    parameters: [
      { key: 'operator', label: 'Redirection Operator', type: 'select', default: 'overwrite', options: [
        { label: '> (Overwrite stdout)', value: 'overwrite' },
        { label: '>> (Append stdout)', value: 'append' },
        { label: '2> (Redirect stderr)', value: 'stderr' },
      ]},
    ],
    metrics: [
      { id: 'targetFile', label: 'Target Stream Target', format: () => 'batch.txt' },
      { id: 'fdMode', label: 'Active File Descriptor', format: () => '1 (stdout)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-pipeline-builder',
    unit: 3,
    unitTitle: 'Streams, Redirection & Text Processing Filters',
    topic: 'Pipelines',
    title: 'Pipeline Flow Visualizer (|)',
    icon: '⚙️',
    shortDescription: 'Connect commands via pipes (|), passing stdout of the left command into stdin of the right command with live buffer inspection.',
    learningObjectives: [
      'Understand the Unix pipeline philosophy of connecting small focused tools',
      'Trace data flowing from producer stdout through FIFO pipe buffers into consumer stdin',
      'Build multi-stage pipelines combining grep, cut, sort, and wc',
    ],
    formulaOverview: '\\text{stdout}(\\text{cmd}_1) \\xrightarrow{\\text{pipe [FIFO]}} \\text{stdin}(\\text{cmd}_2)',
    parameters: [
      { key: 'pipelineCommand', label: 'Pipeline Expression', type: 'text', default: 'cat /etc/passwd | cut -d: -f1 | sort' },
    ],
    metrics: [
      { id: 'pipelineStages', label: 'Pipeline Stages', format: () => '3 commands connected' },
      { id: 'pipeBuffer', label: 'Buffer Type', format: () => 'Kernel FIFO Stream' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-text-filters',
    unit: 3,
    unitTitle: 'Streams, Redirection & Text Processing Filters',
    topic: 'Text Filters',
    title: 'Text Processing & Filters Studio',
    icon: '🔍',
    shortDescription: 'Experiment with standard text manipulation utilities: grep (pattern matching), sort, wc (word/line count), head, tail, and cut.',
    learningObjectives: [
      'Filter lines using grep with case-insensitive (-i) and invert-match (-v) options',
      'Sort records alphabetically and numerically using sort and sort -nr',
      'Extract structured columns from delimited text using cut -d -f',
    ],
    formulaOverview: '\\text{grep [-i,-v,-n]} \\quad | \\quad \\text{sort [-r,-n]} \\quad | \\quad \\text{wc [-l,-w,-c]} \\quad | \\quad \\text{cut -d, -f}',
    parameters: [
      { key: 'filterTool', label: 'Selected Filter', type: 'select', default: 'grep', options: [
        { label: 'grep (Pattern Search)', value: 'grep' },
        { label: 'sort (Line Sorter)', value: 'sort' },
        { label: 'wc (Word/Line Counter)', value: 'wc' },
        { label: 'cut (Column Extractor)', value: 'cut' },
      ]},
    ],
    metrics: [
      { id: 'matchedLines', label: 'Filtered Matches', format: () => '5 records' },
      { id: 'filterStatus', label: 'Filter Execution', format: () => 'Success (0)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-log-analysis',
    unit: 3,
    unitTitle: 'Streams, Redirection & Text Processing Filters',
    topic: 'Log Analysis',
    title: 'Log Analysis Practical Challenge',
    icon: '📊',
    shortDescription: 'Analyze simulated web server access logs to identify top visiting IP addresses, status codes (404/500), and peak traffic requests.',
    learningObjectives: [
      'Apply Linux pipelines to real-world server log inspection',
      'Identify HTTP error codes and suspicious client IP activity',
      'Synthesize multi-command pipelines to generate analytical frequency reports',
    ],
    formulaOverview: '\\text{cat access.log | cut | sort | uniq -c | sort -nr | head -n 10}',
    parameters: [
      { key: 'logTarget', label: 'Log Analysis Goal', type: 'select', default: 'top-ips', options: [
        { label: 'Top Visiting IPs', value: 'top-ips' },
        { label: 'HTTP 404 Errors', value: '404-errors' },
        { label: 'HTTP 500 Server Errors', value: '500-errors' },
      ]},
    ],
    metrics: [
      { id: 'topIp', label: 'Primary Contributor', format: () => '192.168.1.105' },
      { id: 'errorCount', label: 'Error Occurrences', format: () => '14 events' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — SHELL SCRIPTING FUNDAMENTALS & LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs202-script-variables',
    unit: 4,
    unitTitle: 'Shell Scripting Fundamentals & Logic',
    topic: 'Variables & Parameters',
    title: 'Shell Variables, Quoting & Arguments ⭐',
    icon: '💲',
    flagship: true,
    shortDescription: 'Understand variable assignment, parameter expansion ($VAR), quoting differences ("$VAR" vs \'$VAR\'), and positional parameters ($1..$9, $#, $?).',
    learningObjectives: [
      'Assign and expand shell variables with proper whitespace rules (no spaces around =)',
      'Understand quoting rules: double quotes preserve expansion, single quotes inhibit expansion',
      'Access positional parameters ($1, $2), count ($#), and previous exit status ($?)',
    ],
    formulaOverview: '\\text{NAME}=\\text{"Eduverse"} \\quad | \\quad \\text{\\"$VAR\\" (expanded)} \\quad \\ne \\quad \\text{\'$VAR\' (literal)}',
    parameters: [
      { key: 'varVal', label: 'Variable Value', type: 'text', default: 'Linux' },
      { key: 'quoteType', label: 'Quoting Type', type: 'select', default: 'double', options: [
        { label: 'Double Quotes ("$VAR")', value: 'double' },
        { label: 'Single Quotes (\'$VAR\')', value: 'single' },
        { label: 'Unquoted ($VAR)', value: 'unquoted' },
      ]},
    ],
    metrics: [
      { id: 'expandedOutput', label: 'Echo Output', format: () => 'Linux' },
      { id: 'exitCode', label: 'Exit Status ($?)', format: () => '0' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-conditionals-lab',
    unit: 4,
    unitTitle: 'Shell Scripting Fundamentals & Logic',
    topic: 'Conditionals',
    title: 'Conditionals & Test Constructs (if-else, case)',
    icon: '🔀',
    shortDescription: 'Explore numeric comparisons (-eq, -ne, -lt, -gt), string tests (=, !=, -z), file tests (-f, -d, -e), and case-esac branch selection.',
    learningObjectives: [
      'Construct condition tests using the test command and [ ... ] syntax',
      'Use numeric comparison operators (-eq, -ne, -lt, -le, -gt, -ge)',
      'Implement structured branching with if-then-elif-else-fi and case-in-esac',
    ],
    formulaOverview: '\\mathbf{if} \\; [ \\; \\$a -\\text{gt} \\; \\$b \\; ]; \\; \\mathbf{then} \\dots \\mathbf{elif} \\dots \\mathbf{else} \\dots \\mathbf{fi}',
    parameters: [
      { key: 'valA', label: 'Operand A', type: 'range', default: 15, min: 0, max: 100, step: 1 },
      { key: 'valB', label: 'Operand B', type: 'range', default: 10, min: 0, max: 100, step: 1 },
      { key: 'op', label: 'Comparison Operator', type: 'select', default: '-gt', options: [
        { label: '-gt (Greater Than)', value: '-gt' },
        { label: '-eq (Equal)', value: '-eq' },
        { label: '-lt (Less Than)', value: '-lt' },
      ]},
    ],
    metrics: [
      { id: 'condResult', label: 'Test Evaluation', format: () => 'TRUE (Exit Code 0)' },
      { id: 'activeBranch', label: 'Selected Branch', format: () => 'THEN Block' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-script-stepper',
    unit: 4,
    unitTitle: 'Shell Scripting Fundamentals & Logic',
    topic: 'Script Execution',
    title: 'Step-by-Step Shell Script Runner',
    icon: '📜',
    shortDescription: 'Step through shell scripts line by line, inspect variable state changes, evaluate branch conditions, and view simulated stdout.',
    learningObjectives: [
      'Trace execution flow line-by-line through a shell script',
      'Observe environment variables and local stack state changing after each step',
      'Detect logic bugs and unhandled condition branches visually',
    ],
    formulaOverview: '#!/bin/bash \\rightarrow \\text{Sequential Line Execution with Environment Stack}',
    parameters: [
      { key: 'speed', label: 'Execution Speed', type: 'select', default: '1x', options: [
        { label: 'Step by Step (Manual)', value: 'step' },
        { label: '1x Realtime', value: '1x' },
        { label: '2x Fast', value: '2x' },
      ]},
    ],
    metrics: [
      { id: 'currLine', label: 'Program Counter', format: () => 'Line 4: if [ $mark -ge 80 ]' },
      { id: 'scriptStatus', label: 'Execution State', format: () => 'Paused' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — LOOPS, FUNCTIONS & PROCESS MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs202-loops-stepper',
    unit: 5,
    unitTitle: 'Loops, Functions & Process Management',
    topic: 'Looping Constructs',
    title: 'Looping Constructs Visualizer (for, while) ⭐',
    icon: '🔁',
    flagship: true,
    shortDescription: 'Visualize for loops (over item lists, ranges {1..5}) and while/until loops with animated loop indices and iteration limits.',
    learningObjectives: [
      'Construct for loops over word lists and integer ranges',
      'Implement condition-controlled while loops with loop counter increments',
      'Enforce termination conditions to prevent infinite loops',
    ],
    formulaOverview: '\\mathbf{for} \\; i \\; \\mathbf{in} \\; \\{1..n\\}; \\; \\mathbf{do} \\dots \\mathbf{done} \\quad | \\quad \\mathbf{while} \\; [ \\; \\dots \\; ]; \\; \\mathbf{do} \\dots \\mathbf{done}',
    parameters: [
      { key: 'loopType', label: 'Loop Type', type: 'select', default: 'for', options: [
        { label: 'for i in 1 2 3 4 5', value: 'for' },
        { label: 'while [ $count -le 5 ]', value: 'while' },
      ]},
      { key: 'iterLimit', label: 'Max Iteration Cap', type: 'range', default: 5, min: 1, max: 20, step: 1 },
    ],
    metrics: [
      { id: 'loopIndex', label: 'Current Iteration i', format: () => '3 of 5' },
      { id: 'loopSafety', label: 'Iteration Guard', format: () => 'Strictly Capped (<= 20)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-shell-functions',
    unit: 5,
    unitTitle: 'Loops, Functions & Process Management',
    topic: 'Shell Functions',
    title: 'Shell Functions & Scope Explorer',
    icon: '📦',
    shortDescription: 'Define shell functions, pass arguments ($1, $2), manage local variables using the local keyword, and return exit statuses.',
    learningObjectives: [
      'Define reusable shell functions with modular responsibilities',
      'Pass arguments into functions and access them via function-scoped $1, $2',
      'Prevent namespace pollution by scoping variables with the local keyword',
    ],
    formulaOverview: '\\text{fn}() \\; \\{ \\; \\mathbf{local} \\; v=\\$1; \\dots; \\; \\mathbf{return} \\; 0; \\; \\}',
    parameters: [
      { key: 'fnName', label: 'Function Template', type: 'select', default: 'backup_file', options: [
        { label: 'backup_file(filename)', value: 'backup_file' },
        { label: 'calculate_average(n1, n2)', value: 'calculate_average' },
      ]},
    ],
    metrics: [
      { id: 'localScope', label: 'Local Variable Scope', format: () => 'Isolated to Function Frame' },
      { id: 'returnCode', label: 'Function Return Code', format: () => '0' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs202-process-management',
    unit: 5,
    unitTitle: 'Loops, Functions & Process Management',
    topic: 'Process Management',
    title: 'Process States & Signal Control (ps, kill, &)',
    icon: '⚡',
    shortDescription: 'Simulate Linux process lifecycles (Running, Sleeping, Stopped, Zombie), inspect process IDs (PID, PPID), background jobs (&), and signals (SIGTERM, SIGKILL).',
    learningObjectives: [
      'Understand process attributes: PID, PPID, UID, and State (R, S, T, Z)',
      'Launch background processes using the ampersand (&) operator',
      'Send termination signals using kill -15 (SIGTERM) and kill -9 (SIGKILL)',
    ],
    formulaOverview: '\\text{ps aux} \\quad | \\quad \\text{cmd \\& (background)} \\quad | \\quad \\text{kill -9 PID (SIGKILL)} \\quad | \\quad \\text{kill -15 PID (SIGTERM)}',
    parameters: [
      { key: 'targetSignal', label: 'Signal to Dispatch', type: 'select', default: '15', options: [
        { label: '15 - SIGTERM (Graceful Termination)', value: '15' },
        { label: '9 - SIGKILL (Immediate Force Kill)', value: '9' },
        { label: '19 - SIGSTOP (Pause Process)', value: '19' },
        { label: '18 - SIGCONT (Resume Process)', value: '18' },
      ]},
    ],
    metrics: [
      { id: 'activeProcs', label: 'Active Process Count', format: () => '5 simulated procs' },
      { id: 'sandboxProc', label: 'Host Safety', format: () => 'Zero host processes spawned' },
    ],
  }),
];
