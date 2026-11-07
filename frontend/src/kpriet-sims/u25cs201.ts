import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25CS201 / U21CSG02 / U25RCSG04
 * Course Name: Python Programming
 * Semester: II | Category: ESC | Credits: 3 | Regulation: R2025 CBCS / R2021
 * Common to: AD, AM, CB, CSE, IT, Cyber Security (SC)
 * 
 * Uses isolated Smart Board Python Engine architecture (boardEngine: 'py')
 * Dynamic routing via smartboardPresetKey to py-simulation.html and tools/py-simulation.js.
 */
export const U25CS201_SUBJECT_KEYWORDS = [
  'python programming',
  'python programming laboratory',
  'python',
  'u25cs201',
  'u25cs211',
  'u21csg02',
  'u25rcsg04',
  'cs201',
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
    boardEngine: 'py',
    domain: 'COMPUTER_SCIENCE',
    category: 'python programming',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25CS201_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with a sandboxed educational Python execution visualizer, line-by-line stepping, variable scope tracking, and live simulated stdout.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    tags: ['U25CS201', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Python', 'Programming'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ line: 1, active: true }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25CS201_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — PYTHON BASICS & EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs201-execution-visualizer',
    unit: 1,
    unitTitle: 'Python Basics & Execution',
    topic: 'Program Execution & Variables',
    title: 'Python Program Execution & Variable Visualizer ⭐',
    icon: '🐍',
    flagship: true,
    shortDescription: 'Step line-by-line through Python code, inspecting lexical tokens, dynamic data types (int, float, str, bool), and in-memory variable bindings.',
    learningObjectives: [
      'Trace line-by-line execution flow through Python scripts',
      'Observe dynamic type binding in memory (objects vs variable names)',
      'Inspect runtime stdout output synchronized with program statements',
    ],
    formulaOverview: '\\text{Binding: } \\text{variable\\_name} \\xrightarrow{\\text{reference}} \\text{Object}(\\text{type, value, id})',
    parameters: [
      { key: 'speed', label: 'Playback Speed', type: 'select', default: '1x', options: [
        { label: 'Step by Step (Manual)', value: 'step' },
        { label: '1x Realtime', value: '1x' },
        { label: '2x Fast', value: '2x' },
      ]},
    ],
    metrics: [
      { id: 'activeLine', label: 'Current Line', format: () => 'Line 4: name = "Piyush"' },
      { id: 'heapObjects', label: 'Allocated Objects', format: () => '4 in-memory objects' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-io-types',
    unit: 1,
    unitTitle: 'Python Basics & Execution',
    topic: 'Input/Output & Type Casting',
    title: 'Dynamic Typing & Safe I/O Studio',
    icon: '⌨️',
    shortDescription: 'Experiment with standard print(), simulated input(), and explicit type conversions int(), float(), str() with error boundaries.',
    learningObjectives: [
      'Accept and sanitize user string inputs with input()',
      'Perform explicit type conversions (int, float, str)',
      'Handle ValueError exceptions arising from invalid numeric casting',
    ],
    formulaOverview: '\\text{Casting: } x = \\mathbf{int}(\\text{"42"}) \\quad | \\quad y = \\mathbf{float}(\\text{"3.14"}) \\quad | \\quad s = \\mathbf{str}(100)',
    parameters: [
      { key: 'inputVal', label: 'Simulated Input String', type: 'text', default: '88' },
    ],
    metrics: [
      { id: 'castType', label: 'Resulting Type', format: () => 'int' },
      { id: 'stdoutVal', label: 'Standard Output', format: () => 'Final Score: 92.5' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-operators-expressions',
    unit: 1,
    unitTitle: 'Python Basics & Execution',
    topic: 'Operators & Precedence',
    title: 'Operators, Expressions & Precedence Tree',
    icon: '➗',
    shortDescription: 'Evaluate arithmetic (+, -, *, /, //, %, **), relational (==, !=, <, >), and logical (and, or, not) operators with interactive precedence trees.',
    learningObjectives: [
      'Master Python arithmetic operators, floor division (//), and modulo (%)',
      'Evaluate Boolean relational expressions and short-circuit logical operators',
      'Trace expression evaluation orders according to operator precedence',
    ],
    formulaOverview: '\\text{Precedence: } ** \\; > \\; (*, /, //, \\%) \\; > \\; (+, -) \\; > \\; (<, <=, >, >=, ==, !=) \\; > \\; \\mathbf{not} \\; > \\; \\mathbf{and} \\; > \\; \\mathbf{or}',
    parameters: [
      { key: 'a', label: 'Operand a', type: 'range', default: 10, min: 1, max: 50, step: 1 },
      { key: 'b', label: 'Operand b', type: 'range', default: 3, min: 1, max: 20, step: 1 },
    ],
    metrics: [
      { id: 'floorDiv', label: 'Floor Division (a // b)', format: () => '3' },
      { id: 'modulo', label: 'Modulo Remainder (a % b)', format: () => '1' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-indentation-syntax',
    unit: 1,
    unitTitle: 'Python Basics & Execution',
    topic: 'Indentation & Lexical Scope',
    title: 'Indentation, Comments & Lexical Blocks Lab',
    icon: '📐',
    shortDescription: 'Visualize Python four-space indentation hierarchy, lexical block delimiters, docstrings, and understand IndentationError diagnostics.',
    learningObjectives: [
      'Understand the role of whitespace and indentation as block delimiters in Python',
      'Prevent and troubleshoot common IndentationError and TabError exceptions',
      'Distinguish single-line comments (#) from multi-line docstrings',
    ],
    formulaOverview: '\\text{Suite: } \\mathbf{header}: \\; \\rightarrow \\; \\text{INDENT} \\; \\{ \\text{statement}_1, \\dots, \\text{statement}_k \\} \\; \\rightarrow \\; \\text{DEDENT}',
    parameters: [
      { key: 'indentSpaces', label: 'Block Indent Spaces', type: 'select', default: '4', options: [
        { label: '4 Spaces (PEP 8 Standard)', value: '4' },
        { label: '2 Spaces', value: '2' },
        { label: 'Unbalanced / Mixed', value: 'unbalanced' },
      ]},
    ],
    metrics: [
      { id: 'syntaxStatus', label: 'Lexical Syntax', format: () => 'Valid Block Hierarchy' },
      { id: 'blockNesting', label: 'Max Block Depth', format: () => 'Depth 2 (Nested If)' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — CONTROL FLOW, FUNCTIONS & MODULES
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs201-conditionals-tracer',
    unit: 2,
    unitTitle: 'Control Flow, Functions & Modules',
    topic: 'Conditionals & Branching',
    title: 'Conditionals & Multi-Way Branching Visualizer ⭐',
    icon: '🔀',
    flagship: true,
    shortDescription: 'Trace multi-way decision trees (if, elif, else) with animated decision nodes, boolean evaluation badges, and branch coverage metrics.',
    learningObjectives: [
      'Construct conditional logic using if, elif, and else chains',
      'Trace execution flow jumping past unselected branches',
      'Verify condition boundary coverage for grade and classification systems',
    ],
    formulaOverview: '\\mathbf{if} \\; C_1: \\; B_1 \\; \\mathbf{elif} \\; C_2: \\; B_2 \\; \\mathbf{else}: \\; B_3',
    parameters: [
      { key: 'mark', label: 'Student Mark', type: 'range', default: 85, min: 0, max: 100, step: 1 },
    ],
    metrics: [
      { id: 'selectedBranch', label: 'Active Branch', format: () => 'elif mark >= 80' },
      { id: 'assignedGrade', label: 'Computed Grade', format: () => 'A+ (Excellent)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-loop-tracer',
    unit: 2,
    unitTitle: 'Control Flow, Functions & Modules',
    topic: 'Looping Constructs',
    title: 'Loop Tracer & Flow Controls (for, while, break, continue)',
    icon: '🔁',
    shortDescription: 'Step through range() loops, sequence iterations, and while loops with iteration counters, break/continue interrupts, and loop-else clauses.',
    learningObjectives: [
      'Trace iteration state over range(start, stop, step) sequences',
      'Observe the immediate effect of break (loop abort) and continue (skip iteration)',
      'Enforce termination invariants to eliminate infinite while loops',
    ],
    formulaOverview: '\\mathbf{for} \\; i \\; \\mathbf{in} \\; \\mathbf{range}(\\text{start, stop, step}): \\dots \\quad | \\quad \\mathbf{while} \\; \\text{cond}: \\dots',
    parameters: [
      { key: 'stopVal', label: 'Range Stop Value', type: 'range', default: 10, min: 3, max: 20, step: 1 },
    ],
    metrics: [
      { id: 'loopCounter', label: 'Current Iteration i', format: () => '7 of 10' },
      { id: 'accumulatedSum', label: 'Accumulator Total', format: () => '16' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-functions-scope',
    unit: 2,
    unitTitle: 'Control Flow, Functions & Modules',
    topic: 'Functions & Scope',
    title: 'Function Call Stack & Variable Scope Explorer',
    icon: '📦',
    shortDescription: 'Inspect function definitions (def), parameter passing by object reference, return values, default arguments, and LEGB variable scope lookup.',
    learningObjectives: [
      'Define modular functions with parameters and return statements',
      'Understand parameter passing semantics in Python (pass by assignment/reference)',
      'Distinguish local, enclosing, global, and built-in scopes (LEGB rule)',
    ],
    formulaOverview: '\\text{Scope Lookup: } \\text{Local} \\rightarrow \\text{Enclosing} \\rightarrow \\text{Global} \\rightarrow \\text{Built-in (LEGB)}',
    parameters: [
      { key: 'subtotal', label: 'Subtotal Amount', type: 'range', default: 500, min: 50, max: 2000, step: 50 },
      { key: 'discount', label: 'Discount Rate', type: 'select', default: '0.15', options: [
        { label: '10% (Default)', value: '0.1' },
        { label: '15% Discount', value: '0.15' },
        { label: '25% Discount', value: '0.25' },
      ]},
    ],
    metrics: [
      { id: 'stackDepth', label: 'Active Stack Depth', format: () => '1 (calculate_bill frame)' },
      { id: 'returnedVal', label: 'Function Return', format: () => '450.0' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-recursion-lambda',
    unit: 2,
    unitTitle: 'Control Flow, Functions & Modules',
    topic: 'Recursion & Lambda',
    title: 'Recursion Call Stack & Lambda Expression Lab',
    icon: '🔄',
    shortDescription: 'Visualize recursive function frame push/pop operations (factorial, fibonacci) and anonymous lambda expressions with map() and filter().',
    learningObjectives: [
      'Trace recursive function calls pushing frames onto the call stack',
      'Identify base case termination preventing RecursionError stack overflow',
      'Construct anonymous inline functions using lambda syntax',
    ],
    formulaOverview: 'n! = \\begin{cases} 1 & \\text{if } n \\le 1 \\\\ n \\times (n-1)! & \\text{if } n > 1 \\end{cases} \\quad | \\quad \\lambda x: x^2',
    parameters: [
      { key: 'n', label: 'Factorial Argument n', type: 'range', default: 4, min: 1, max: 7, step: 1 },
    ],
    metrics: [
      { id: 'peakStack', label: 'Peak Stack Depth', format: () => '4 frames' },
      { id: 'factResult', label: 'Computed n!', format: () => '24' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — BUILT-IN DATA STRUCTURES
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs201-list-visualizer',
    unit: 3,
    unitTitle: 'Built-in Data Structures',
    topic: 'Lists & Slicing',
    title: 'Interactive List Operations & Slicing Studio ⭐',
    icon: '📋',
    flagship: true,
    shortDescription: 'Manipulate Python lists with animated positive [0..n-1] and negative [-n..-1] indexing, slicing [start:stop:step], mutation, and append/pop/sort.',
    learningObjectives: [
      'Master positive and negative index offsets into sequences',
      'Extract sub-sequences using three-argument slicing [start:stop:step]',
      'Perform in-place list mutation using append, insert, pop, and sort',
    ],
    formulaOverview: '\\text{Slice: } \\text{list}[i:j:k] \\quad | \\quad \\text{Negative Index: } -1 = \\text{last element}',
    parameters: [
      { key: 'sliceStep', label: 'Slice Step k', type: 'select', default: '2', options: [
        { label: 'Step 1 (Consecutive)', value: '1' },
        { label: 'Step 2 (Every Other)', value: '2' },
        { label: 'Step -1 (Reversed)', value: '-1' },
      ]},
    ],
    metrics: [
      { id: 'listLength', label: 'List Element Count', format: () => '6 elements' },
      { id: 'slicedSubset', label: 'Extracted Slice', format: () => '[20, 40]' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-string-operations',
    unit: 3,
    unitTitle: 'Built-in Data Structures',
    topic: 'Strings & Methods',
    title: 'String Immutability, Formatting & Methods Explorer',
    icon: '🔤',
    shortDescription: 'Understand string immutability, character indexing, f-string interpolation, and core string methods: .split(), .join(), .replace(), .strip().',
    learningObjectives: [
      'Understand why Python strings are immutable and cannot be modified in-place',
      'Format dynamic strings using modern f-strings',
      'Tokenize and concatenate text using .split() and .join()',
    ],
    formulaOverview: '\\text{s}[i] = \\text{char} \\; (\\text{Read-Only}) \\quad | \\quad \\text{f}\"\\{x\\} \\dots \\{y\\}\"',
    parameters: [
      { key: 'delim', label: 'Join Delimiter', type: 'select', default: '-', options: [
        { label: 'Hyphen (-)', value: '-' },
        { label: 'Space (" ")', value: ' ' },
        { label: 'Underscore (_)', value: '_' },
      ]},
    ],
    metrics: [
      { id: 'strImmutability', label: 'Immutability Guard', format: () => 'Read-Only String Object' },
      { id: 'tokenCount', label: 'Parsed Word Tokens', format: () => '4 tokens' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-tuples-sets',
    unit: 3,
    unitTitle: 'Built-in Data Structures',
    topic: 'Tuples & Sets',
    title: 'Tuples Immutability & Mathematical Sets Lab',
    icon: '🔷',
    shortDescription: 'Compare immutable tuples (coordinates, return values) with mutable unique sets, testing set algebra: union (|), intersection (&), and difference (-).',
    learningObjectives: [
      'Use tuples for fixed heterogenous data records and dictionary keys',
      'Leverage sets for automatic deduplication and O(1) membership testing',
      'Perform mathematical set operations: union, intersection, and difference',
    ],
    formulaOverview: 'A \\cup B = A | B \\quad | \\quad A \\cap B = A \\;\\&\\; B \\quad | \\quad A \\setminus B = A - B',
    parameters: [
      { key: 'setOp', label: 'Set Operation', type: 'select', default: 'intersection', options: [
        { label: 'Intersection (A & B)', value: 'intersection' },
        { label: 'Union (A | B)', value: 'union' },
        { label: 'Difference (A - B)', value: 'difference' },
      ]},
    ],
    metrics: [
      { id: 'setCardinality', label: 'Resulting Set Size', format: () => '2 elements' },
      { id: 'tupleStatus', label: 'Tuple State', format: () => 'Immutable (Protected)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-dictionary-visualizer',
    unit: 3,
    unitTitle: 'Built-in Data Structures',
    topic: 'Dictionaries & Hash Mapping',
    title: 'Dictionary Key-Value Mapping & Lookup Visualizer',
    icon: '📖',
    shortDescription: 'Explore dictionary associative arrays, hash key lookups, nested dictionary traversal, and dictionary methods: .keys(), .values(), .items(), .get().',
    learningObjectives: [
      'Structure complex entity records using key-value associations',
      'Perform O(1) constant-time value lookups using hashable keys',
      'Prevent KeyError exceptions using .get(key, default) accessors',
    ],
    formulaOverview: '\\text{dict}[\\text{key}] \\xrightarrow{O(1) \\text{ hash}} \\text{value}',
    parameters: [
      { key: 'targetKey', label: 'Lookup Key', type: 'select', default: 'cgpa', options: [
        { label: 'name', value: 'name' },
        { label: 'cgpa', value: 'cgpa' },
        { label: 'reg_no', value: 'reg_no' },
      ]},
    ],
    metrics: [
      { id: 'retrievedVal', label: 'Lookup Result', format: () => '9.4' },
      { id: 'dictEntries', label: 'Total Key Pairs', format: () => '5 entries' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — EXCEPTIONS & VIRTUAL FILE HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs201-exception-flow',
    unit: 4,
    unitTitle: 'Exceptions & Virtual File Handling',
    topic: 'Exception Handling',
    title: 'Exception Handling Lifecycle (try, except, else, finally) ⭐',
    icon: '🛡️',
    flagship: true,
    shortDescription: 'Visualize the complete exception propagation lifecycle across try, except, else, and finally blocks with built-in error diagnostics.',
    learningObjectives: [
      'Intercept runtime exceptions to prevent program termination',
      'Target specific exceptions (ZeroDivisionError, ValueError, IndexError)',
      'Guarantee resource release using the finally cleanup block',
    ],
    formulaOverview: '\\mathbf{try}: \\dots \\mathbf{except} \\; E \\; \\mathbf{as} \\; e: \\dots \\mathbf{else}: \\dots \\mathbf{finally}: \\dots',
    parameters: [
      { key: 'divisor', label: 'Division Divisor', type: 'select', default: '0', options: [
        { label: '0 (Trigger ZeroDivisionError)', value: '0' },
        { label: '4 (Normal Calculation)', value: '4' },
      ]},
    ],
    metrics: [
      { id: 'exceptionStatus', label: 'Exception State', format: () => 'ZeroDivisionError Caught' },
      { id: 'finallyFired', label: 'Finally Block', format: () => 'Executed Guaranteed' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-virtual-file-io',
    unit: 4,
    unitTitle: 'Exceptions & Virtual File Handling',
    topic: 'File Operations',
    title: 'Virtual File I/O Studio (open, read, write, with)',
    icon: '📄',
    shortDescription: 'Practice file operations (r, w, a) in an isolated educational in-memory virtual filesystem using the "with" context manager pattern.',
    learningObjectives: [
      'Open virtual in-memory files using open(path, mode)',
      'Safely auto-close files using with context managers',
      'Distinguish write overwrite (w) from append (a) modes',
    ],
    formulaOverview: '\\mathbf{with} \\; \\mathbf{open}(\\text{path}, \\text{mode}) \\; \\mathbf{as} \\; f: \\; f.\\text{write}() \\; / \\; f.\\text{read}()',
    parameters: [
      { key: 'fileMode', label: 'File Open Mode', type: 'select', default: 'w', options: [
        { label: '"w" (Write / Overwrite)', value: 'w' },
        { label: '"a" (Append)', value: 'a' },
        { label: '"r" (Read Only)', value: 'r' },
      ]},
    ],
    metrics: [
      { id: 'virtualVfs', label: 'Virtual Storage Mode', format: () => '100% In-Memory' },
      { id: 'linesHandled', label: 'Buffered Lines', format: () => '3 records' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-custom-exceptions',
    unit: 4,
    unitTitle: 'Exceptions & Virtual File Handling',
    topic: 'Custom Exceptions',
    title: 'Custom Exception Hierarchy & Validation Lab',
    icon: '⚠️',
    shortDescription: 'Define custom user-defined exception classes inheriting from Exception, trigger raise conditions, and validate application business rules.',
    learningObjectives: [
      'Subclass the built-in Exception class to create domain errors',
      'Explicitly raise exceptions when business rule constraints are breached',
      'Structure clean diagnostic messages for user validation feedback',
    ],
    formulaOverview: '\\mathbf{class} \\; \\text{InvalidAgeError}(\\mathbf{Exception}): \\dots \\quad | \\quad \\mathbf{raise} \\; \\text{InvalidAgeError}(\\dots)',
    parameters: [
      { key: 'testAge', label: 'Candidate Age', type: 'range', default: 16, min: 10, max: 25, step: 1 },
    ],
    metrics: [
      { id: 'validationResult', label: 'Rule Verification', format: () => 'Raised InvalidAgeError' },
      { id: 'errorMsg', label: 'Error Message', format: () => 'Age 16 is below 18' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — NUMPY & PANDAS DATA HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs201-numpy-arrays',
    unit: 5,
    unitTitle: 'NumPy & Pandas Data Handling',
    topic: 'NumPy Arrays & Vectorization',
    title: 'NumPy 1D & 2D Array Vectorization Visualizer ⭐',
    icon: '📊',
    flagship: true,
    shortDescription: 'Visualize multi-dimensional ndarray grids, memory shape, broadcasting, element-wise vectorized arithmetic, and matrix transformations.',
    learningObjectives: [
      'Instantiate 1D and 2D ndarray structures with uniform datatypes',
      'Perform element-wise vectorized computations at hardware SIMD speed',
      'Calculate linear algebra matrix determinants without nested loops',
    ],
    formulaOverview: '\\text{arr} = \\mathbf{np.array}(\\dots) \\quad | \\quad C_{ij} = A_{ij} + B_{ij} \\; (\\text{Vectorized Zero-Loop})',
    parameters: [
      { key: 'arrayOp', label: 'Array Operation', type: 'select', default: 'square', options: [
        { label: 'Vectorized Power (arr ** 2)', value: 'square' },
        { label: 'Scalar Addition (arr + 10)', value: 'add' },
        { label: 'Matrix Determinant (np.linalg.det)', value: 'det' },
      ]},
    ],
    metrics: [
      { id: 'ndarrayShape', label: 'Array Shape', format: () => '(5,) 1D Vector' },
      { id: 'vectorizedSpeed', label: 'Computation Model', format: () => 'SIMD Zero-Loop C Backend' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-pandas-dataframe',
    unit: 5,
    unitTitle: 'NumPy & Pandas Data Handling',
    topic: 'Pandas Series & DataFrames',
    title: 'Pandas Series & Tabular DataFrame Explorer',
    icon: '📑',
    shortDescription: 'Inspect 2D labeled tabular data structures with row index, named columns, data type inference, and positional (.iloc) vs label (.loc) selection.',
    learningObjectives: [
      'Construct two-dimensional labeled DataFrames from Python dictionaries',
      'Select data using label-based (.loc) and integer-location (.iloc) indexing',
      'Generate statistical column summaries using df.describe()',
    ],
    formulaOverview: '\\text{df}[\\text{col}] \\quad | \\quad \\text{df}.\\mathbf{loc}[\\text{row\\_label}, \\text{col\\_label}] \\quad | \\quad \\text{df}.\\mathbf{iloc}[r, c]',
    parameters: [
      { key: 'indexer', label: 'Indexing Mode', type: 'select', default: 'loc', options: [
        { label: '.loc (Label Indexing)', value: 'loc' },
        { label: '.iloc (Positional Indexing)', value: 'iloc' },
      ]},
    ],
    metrics: [
      { id: 'dfShape', label: 'DataFrame Dimensions', format: () => '4 rows × 3 columns' },
      { id: 'primaryCol', label: 'Indexed Attribute', format: () => 'Score (int64)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs201-data-filtering',
    unit: 5,
    unitTitle: 'NumPy & Pandas Data Handling',
    topic: 'Data Filtering & Groupby',
    title: 'Data Filtering, Aggregation & GroupBy Studio',
    icon: '📈',
    shortDescription: 'Filter tabular datasets using boolean mask conditions, calculate column-wise aggregates (mean, sum), and group records by category.',
    learningObjectives: [
      'Construct boolean masking filters (e.g., df[df["Marks"] >= 88])',
      'Calculate statistical aggregations (mean, sum, min, max)',
      'Group records by categorical department attributes using df.groupby()',
    ],
    formulaOverview: '\\text{Filtered} = \\text{df}[\\text{df}[\\text{\"Score\"}] \\ge 80] \\quad | \\quad \\text{df}.\\mathbf{groupby}(\\text{\"Dept\"})[\\text{\"Score\"}].\\mathbf{mean}()',
    parameters: [
      { key: 'scoreThreshold', label: 'Score Filter Threshold', type: 'range', default: 88, min: 70, max: 95, step: 1 },
    ],
    metrics: [
      { id: 'filteredCount', label: 'Matching Rows', format: () => '3 records found' },
      { id: 'filterCondition', label: 'Applied Mask', format: () => 'df["Marks"] >= 88' },
    ],
  }),
];
