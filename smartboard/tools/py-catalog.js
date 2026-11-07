/**
 * py-catalog.js
 * Python Programming (U25CS201 / U21CSG02 / U25RCSG04) — 18 Simulations Catalog
 * Regulation R2025 CBCS / R2021 · Semester II · Common to CS, IT, AD, AM, CB, Cyber · ESC · 3 Credits
 *
 * 5 Units:
 * Unit I:   Python Basics & Execution (Sims 1-4)
 * Unit II:  Control Flow, Functions & Modules (Sims 5-8)
 * Unit III: Built-in Data Structures (Sims 9-12)
 * Unit IV:  Exceptions & Virtual File Handling (Sims 13-15)
 * Unit V:   NumPy & Pandas Data Handling (Sims 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduversePYCatalog = exp;
  if (typeof window !== 'undefined') window.EduversePYCatalog = exp;
  if (typeof global !== 'undefined') global.EduversePYCatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Python Basics & Execution', code: 'UNIT I' },
    { number: 2, title: 'Control Flow, Functions & Modules', code: 'UNIT II' },
    { number: 3, title: 'Built-in Data Structures', code: 'UNIT III' },
    { number: 4, title: 'Exceptions & Virtual File Handling', code: 'UNIT IV' },
    { number: 5, title: 'NumPy & Pandas Data Handling', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — PYTHON BASICS & EXECUTION
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs201-execution-visualizer',
      unit: 1,
      unitTitle: 'Python Basics & Execution',
      topic: 'Program Execution & Variables',
      title: 'Python Program Execution & Variable Visualizer ⭐ (Flagship)',
      icon: '🐍',
      flagship: true,
      description: 'Step line-by-line through Python code, inspecting lexical tokens, dynamic data types (int, float, str, bool), and in-memory variable bindings.',
      formula: '\\text{Binding: } \\text{variable\\_name} \\xrightarrow{\\text{reference}} \\text{Object}(\\text{type, value, id})',
      defaultCode: '# Python Variable Assignment & Types\nage = 20\nheight = 5.9\nname = "Piyush"\nis_student = True\nprint(f"{name} is {age} years old.")',
      defaultParams: { speed: 1, mode: 'step' },
      challenge: {
        goal: 'Trace variable re-binding and predict data types after reassignment.',
        expectedTypes: { age: 'int', height: 'float', name: 'str', is_student: 'bool' }
      }
    },
    {
      id: 'u25cs201-io-types',
      unit: 1,
      unitTitle: 'Python Basics & Execution',
      topic: 'Input/Output & Type Casting',
      title: 'Dynamic Typing & Safe I/O Studio',
      icon: '⌨️',
      flagship: false,
      description: 'Experiment with standard print(), simulated input(), and explicit type conversions int(), float(), str() with error boundaries.',
      formula: '\\text{Casting: } x = \\mathbf{int}(\\text{"42"}) \\quad | \\quad y = \\mathbf{float}(\\text{"3.14"}) \\quad | \\quad s = \\mathbf{str}(100)',
      defaultCode: '# Safe Simulated I/O & Type Conversion\nraw_score = "88"\nscore = int(raw_score)\nbonus = 4.5\ntotal = score + bonus\nprint("Final Score:", total)',
      defaultParams: { inputVal: '88' },
      challenge: {
        goal: 'Demonstrate why attempting int("abc") raises a ValueError and handle it correctly.',
        expectedError: 'ValueError'
      }
    },
    {
      id: 'u25cs201-operators-expressions',
      unit: 1,
      unitTitle: 'Python Basics & Execution',
      topic: 'Operators & Precedence',
      title: 'Operators, Expressions & Precedence Tree',
      icon: '➗',
      flagship: false,
      description: 'Evaluate arithmetic (+, -, *, /, //, %, **), relational (==, !=, <, >), and logical (and, or, not) operators with interactive precedence trees.',
      formula: '\\text{Precedence: } ** \\; > \\; (*, /, //, \\%) \\; > \\; (+, -) \\; > \\; (<, <=, >, >=, ==, !=) \\; > \\; \\mathbf{not} \\; > \\; \\mathbf{and} \\; > \\; \\mathbf{or}',
      defaultCode: '# Expression Evaluation\na = 10\nb = 3\nresult1 = a // b  # Floor division\nresult2 = a % b   # Modulo\nresult3 = a ** 2  # Exponentiation\ncheck = (a > 5) and (b < 5)',
      defaultParams: { a: 10, b: 3 },
      challenge: {
        goal: 'Calculate the value of 2 + 3 * 4 ** 2 // 8 using operator precedence.',
        expectedResult: 8
      }
    },
    {
      id: 'u25cs201-indentation-syntax',
      unit: 1,
      unitTitle: 'Python Basics & Execution',
      topic: 'Indentation & Lexical Scope',
      title: 'Indentation, Comments & Lexical Blocks Lab',
      icon: '📐',
      flagship: false,
      description: 'Visualize Python four-space indentation hierarchy, lexical block delimiters, docstrings, and understand IndentationError diagnostics.',
      formula: '\\text{Suite: } \\mathbf{header}: \\; \\rightarrow \\; \\text{INDENT} \\; \\{ \\text{statement}_1, \\dots, \\text{statement}_k \\} \\; \\rightarrow \\; \\text{DEDENT}',
      defaultCode: '# Indentation Structure\nx = 15\nif x > 10:\n    print("x is large")\n    if x > 20:\n        print("x is very large")\n    else:\n        print("x is between 10 and 20")\nprint("Block exited")',
      defaultParams: { x: 15 },
      challenge: {
        goal: 'Fix an unaligned statement to resolve an IndentationError.',
        expectedFix: 'Consistent 4 spaces indentation'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — CONTROL FLOW, FUNCTIONS & MODULES
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs201-conditionals-tracer',
      unit: 2,
      unitTitle: 'Control Flow, Functions & Modules',
      topic: 'Conditionals & Branching',
      title: 'Conditionals & Multi-Way Branching Visualizer ⭐ (Flagship)',
      icon: '🔀',
      flagship: true,
      description: 'Trace multi-way decision trees (if, elif, else) with animated decision nodes, boolean evaluation badges, and branch coverage metrics.',
      formula: '\\mathbf{if} \\; C_1: \\; B_1 \\; \\mathbf{elif} \\; C_2: \\; B_2 \\; \\mathbf{else}: \\; B_3',
      defaultCode: '# Student Grade Classification\nmark = 85\nif mark >= 90:\n    grade = "O (Outstanding)"\nelif mark >= 80:\n    grade = "A+ (Excellent)"\nelif mark >= 70:\n    grade = "A (Very Good)"\nelse:\n    grade = "B (Good)"\nprint("Grade:", grade)',
      defaultParams: { mark: 85 },
      challenge: {
        goal: 'Determine the executed branch when mark is exactly 80.',
        expectedBranch: 'A+ (Excellent)'
      }
    },
    {
      id: 'u25cs201-loop-tracer',
      unit: 2,
      unitTitle: 'Control Flow, Functions & Modules',
      topic: 'Looping Constructs',
      title: 'Loop Tracer & Flow Controls (for, while, break, continue)',
      icon: '🔁',
      flagship: false,
      description: 'Step through range() loops, sequence iterations, and while loops with iteration counters, break/continue interrupts, and loop-else clauses.',
      formula: '\\mathbf{for} \\; i \\; \\mathbf{in} \\; \\mathbf{range}(\\text{start, stop, step}): \\dots \\quad | \\quad \\mathbf{while} \\; \\text{cond}: \\dots',
      defaultCode: '# Loop Control Flow with Break & Continue\ntotal = 0\nfor i in range(1, 10):\n    if i % 2 == 0:\n        continue  # Skip evens\n    if i > 7:\n        break     # Terminate loop\n    total += i\nprint("Sum of odd numbers <= 7:", total)',
      defaultParams: { maxIter: 10 },
      challenge: {
        goal: 'Calculate the total accumulated by the loop before the break is triggered.',
        expectedTotal: 16
      }
    },
    {
      id: 'u25cs201-functions-scope',
      unit: 2,
      unitTitle: 'Control Flow, Functions & Modules',
      topic: 'Functions & Scope',
      title: 'Function Call Stack & Variable Scope Explorer',
      icon: '📦',
      flagship: false,
      description: 'Inspect function definitions (def), parameter passing by object reference, return values, default arguments, and LEGB variable scope lookup.',
      formula: '\\text{Scope Lookup: } \\text{Local} \\rightarrow \\text{Enclosing} \\rightarrow \\text{Global} \\rightarrow \\text{Built-in (LEGB)}',
      defaultCode: '# Functions & Scope Demonstration\nglobal_tax = 0.05\n\ndef calculate_bill(subtotal, discount=0.1):\n    tax_amt = subtotal * global_tax\n    disc_amt = subtotal * discount\n    final = subtotal + tax_amt - disc_amt\n    return round(final, 2)\n\ntotal = calculate_bill(500, 0.15)\nprint("Bill Total:", total)',
      defaultParams: { subtotal: 500, discount: 0.15 },
      challenge: {
        goal: 'Verify that local variable "tax_amt" is inaccessible in global scope.',
        expectedResult: 'NameError: name tax_amt is not defined'
      }
    },
    {
      id: 'u25cs201-recursion-lambda',
      unit: 2,
      unitTitle: 'Control Flow, Functions & Modules',
      topic: 'Recursion & Lambda',
      title: 'Recursion Call Stack & Lambda Expression Lab',
      icon: '🔄',
      flagship: false,
      description: 'Visualize recursive function frame push/pop operations (factorial, fibonacci) and anonymous lambda expressions with map() and filter().',
      formula: 'n! = \\begin{cases} 1 & \\text{if } n \\le 1 \\\\ n \\times (n-1)! & \\text{if } n > 1 \\end{cases} \\quad | \\quad \\lambda x: x^2',
      defaultCode: '# Recursive Factorial with Call Stack\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nsq = lambda x: x ** 2\nres = factorial(4)\nprint("4! =", res)\nprint("sq(5) =", sq(5))',
      defaultParams: { n: 4 },
      challenge: {
        goal: 'Count the maximum stack frame depth during the evaluation of factorial(4).',
        expectedDepth: 4
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — BUILT-IN DATA STRUCTURES
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs201-list-visualizer',
      unit: 3,
      unitTitle: 'Built-in Data Structures',
      topic: 'Lists & Slicing',
      title: 'Interactive List Operations & Slicing Studio ⭐ (Flagship)',
      icon: '📋',
      flagship: true,
      description: 'Manipulate Python lists with animated positive [0..n-1] and negative [-n..-1] indexing, slicing [start:stop:step], mutation, and append/pop/sort.',
      formula: '\\text{Slice: } \\text{list}[i:j:k] \\quad | \\quad \\text{Negative Index: } -1 = \\text{last element}',
      defaultCode: '# List Slicing and Methods\nnums = [10, 20, 30, 40, 50, 60]\nsub = nums[1:5:2]\nnums.append(70)\nnums.insert(2, 25)\npopped = nums.pop()\nprint("Slice:", sub)\nprint("Modified List:", nums)',
      defaultParams: { start: 1, stop: 5, step: 2 },
      challenge: {
        goal: 'Extract elements [20, 40] using list slicing with step 2.',
        expectedSlice: [20, 40]
      }
    },
    {
      id: 'u25cs201-string-operations',
      unit: 3,
      unitTitle: 'Built-in Data Structures',
      topic: 'Strings & Methods',
      title: 'String Immutability, Formatting & Methods Explorer',
      icon: '🔤',
      flagship: false,
      description: 'Understand string immutability, character indexing, f-string interpolation, and core string methods: .split(), .join(), .replace(), .strip().',
      formula: '\\text{s}[i] = \\text{char} \\; (\\text{Read-Only}) \\quad | \\quad \\text{f}\"\\{x\\} \\dots \\{y\\}\"',
      defaultCode: '# String Manipulation\ns = "  Engineering Simulations at KPRIET  "\nclean = s.strip()\nwords = clean.split()\nslug = "-".join(words).lower()\nprint("Slugified:", slug)',
      defaultParams: { text: "Engineering Simulations" },
      challenge: {
        goal: 'Demonstrate that attempting s[0] = "X" raises a TypeError due to string immutability.',
        expectedError: 'TypeError: str object does not support item assignment'
      }
    },
    {
      id: 'u25cs201-tuples-sets',
      unit: 3,
      unitTitle: 'Built-in Data Structures',
      topic: 'Tuples & Sets',
      title: 'Tuples Immutability & Mathematical Sets Lab',
      icon: '🔷',
      flagship: false,
      description: 'Compare immutable tuples (coordinates, return values) with mutable unique sets, testing set algebra: union (|), intersection (&), and difference (-).',
      formula: 'A \\cup B = A | B \\quad | \\quad A \\cap B = A \\;\\&\\; B \\quad | \\quad A \\setminus B = A - B',
      defaultCode: '# Tuples vs Sets\npoint = (12.5, 77.2)  # Lat, Lon (immutable)\nset_a = {1, 2, 3, 4, 5}\nset_b = {4, 5, 6, 7}\nunion_res = set_a | set_b\ninter_res = set_a & set_b\nprint("Union:", union_res)\nprint("Intersection:", inter_res)',
      defaultParams: { tupleData: '(12.5, 77.2)' },
      challenge: {
        goal: 'Find the intersection elements between set {1, 2, 3, 4, 5} and {4, 5, 6, 7}.',
        expectedIntersection: [4, 5]
      }
    },
    {
      id: 'u25cs201-dictionary-visualizer',
      unit: 3,
      unitTitle: 'Built-in Data Structures',
      topic: 'Dictionaries & Hash Mapping',
      title: 'Dictionary Key-Value Mapping & Lookup Visualizer',
      icon: '📖',
      flagship: false,
      description: 'Explore dictionary associative arrays, hash key lookups, nested dictionary traversal, and dictionary methods: .keys(), .values(), .items(), .get().',
      formula: '\\text{dict}[\\text{key}] \\xrightarrow{O(1) \\text{ hash}} \\text{value}',
      defaultCode: '# Student Records Dictionary\nstudent = {\n    "name": "Piyush",\n    "reg_no": "U25CS201",\n    "courses": ["Python", "Linux", "Maths"],\n    "cgpa": 9.4\n}\nstudent["year"] = 1\nprint("Name:", student.get("name"))\nprint("Courses:", len(student["courses"]))',
      defaultParams: { lookupKey: 'cgpa' },
      challenge: {
        goal: 'Access a non-existent key using .get(key, default) without raising a KeyError.',
        expectedBehavior: 'Returns default value safely'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — EXCEPTIONS & VIRTUAL FILE HANDLING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs201-exception-flow',
      unit: 4,
      unitTitle: 'Exceptions & Virtual File Handling',
      topic: 'Exception Handling',
      title: 'Exception Handling Lifecycle (try, except, else, finally) ⭐ (Flagship)',
      icon: '🛡️',
      flagship: true,
      description: 'Visualize the complete exception propagation lifecycle across try, except, else, and finally blocks with built-in error diagnostics.',
      formula: '\\mathbf{try}: \\dots \\mathbf{except} \\; E \\; \\mathbf{as} \\; e: \\dots \\mathbf{else}: \\dots \\mathbf{finally}: \\dots',
      defaultCode: '# Robust Division with Exception Handling\ndef divide(a, b):\n    try:\n        res = a / b\n    except ZeroDivisionError as err:\n        print("Caught Error:", err)\n        return None\n    else:\n        print("Calculation successful")\n        return res\n    finally:\n        print("Cleanup: Execution complete")\n\nval = divide(20, 0)',
      defaultParams: { a: 20, b: 0 },
      challenge: {
        goal: 'Verify that the "finally" block executes whether an exception was raised or not.',
        expectedOutput: 'Cleanup: Execution complete'
      }
    },
    {
      id: 'u25cs201-virtual-file-io',
      unit: 4,
      unitTitle: 'Exceptions & Virtual File Handling',
      topic: 'File Operations',
      title: 'Virtual File I/O Studio (open, read, write, with)',
      icon: '📄',
      flagship: false,
      description: 'Practice file operations (r, w, a) in an isolated educational in-memory virtual filesystem using the "with" context manager pattern.',
      formula: '\\mathbf{with} \\; \\mathbf{open}(\\text{path}, \\text{mode}) \\; \\mathbf{as} \\; f: \\; f.\\text{write}() \\; / \\; f.\\text{read}()',
      defaultCode: '# Safe In-Memory File I/O\nwith open("students.txt", "w") as f:\n    f.write("Piyush,92\\nAnanya,88\\nKarthik,95\\n")\n\nwith open("students.txt", "r") as f:\n    content = f.read()\nprint("File Content:\\n" + content)',
      defaultParams: { filename: 'students.txt', mode: 'w' },
      challenge: {
        goal: 'Write three lines to a virtual file and read them back line-by-line using f.readlines().',
        expectedLines: 3
      }
    },
    {
      id: 'u25cs201-custom-exceptions',
      unit: 4,
      unitTitle: 'Exceptions & Virtual File Handling',
      topic: 'Custom Exceptions',
      title: 'Custom Exception Hierarchy & Validation Lab',
      icon: '⚠️',
      flagship: false,
      description: 'Define custom user-defined exception classes inheriting from Exception, trigger raise conditions, and validate application business rules.',
      formula: '\\mathbf{class} \\; \\text{InvalidAgeError}(\\mathbf{Exception}): \\dots \\quad | \\quad \\mathbf{raise} \\; \\text{InvalidAgeError}(\\dots)',
      defaultCode: '# Custom Exception Definition\nclass InvalidAgeError(Exception):\n    pass\n\ndef register_voter(age):\n    if age < 18:\n        raise InvalidAgeError(f"Age {age} is below 18")\n    return "Voter Registered"\n\ntry:\n    register_voter(16)\nexcept InvalidAgeError as e:\n    print("Validation Failed:", e)',
      defaultParams: { age: 16 },
      challenge: {
        goal: 'Raise and catch a custom InvalidAgeError when age is less than 18.',
        expectedCatch: 'Validation Failed: Age 16 is below 18'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — NUMPY & PANDAS DATA HANDLING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs201-numpy-arrays',
      unit: 5,
      unitTitle: 'NumPy & Pandas Data Handling',
      topic: 'NumPy Arrays & Vectorization',
      title: 'NumPy 1D & 2D Array Vectorization Visualizer ⭐ (Flagship)',
      icon: '📊',
      flagship: true,
      description: 'Visualize multi-dimensional ndarray grids, memory shape, broadcasting, element-wise vectorized arithmetic, and matrix transformations.',
      formula: '\\text{arr} = \\mathbf{np.array}(\\dots) \\quad | \\quad C_{ij} = A_{ij} + B_{ij} \\; (\\text{Vectorized Zero-Loop})',
      defaultCode: '# NumPy Array Vectorization\nimport numpy as np\narr = np.array([1, 2, 3, 4, 5])\nsquared = arr ** 2\nmatrix = np.array([[1, 2], [3, 4]])\ndet = np.linalg.det(matrix)\nprint("Squared Array:", squared)\nprint("Determinant:", round(det, 2))',
      defaultParams: { arrayLength: 5 },
      challenge: {
        goal: 'Perform vectorized element-wise multiplication on a 1D NumPy array without writing a for loop.',
        expectedVectorResult: [1, 4, 9, 16, 25]
      }
    },
    {
      id: 'u25cs201-pandas-dataframe',
      unit: 5,
      unitTitle: 'NumPy & Pandas Data Handling',
      topic: 'Pandas Series & DataFrames',
      title: 'Pandas Series & Tabular DataFrame Explorer',
      icon: '📑',
      flagship: false,
      description: 'Inspect 2D labeled tabular data structures with row index, named columns, data type inference, and positional (.iloc) vs label (.loc) selection.',
      formula: '\\text{df}[\\text{col}] \\quad | \\quad \\text{df}.\\mathbf{loc}[\\text{row\\_label}, \\text{col\\_label}] \\quad | \\quad \\text{df}.\\mathbf{iloc}[r, c]',
      defaultCode: '# Pandas DataFrame Construction & Selection\nimport pandas as pd\ndata = {\n    "Name": ["Alice", "Bob", "Charlie", "David"],\n    "Score": [85, 92, 78, 95],\n    "Dept": ["CSE", "IT", "AI", "CSE"]\n}\ndf = pd.DataFrame(data)\nprint("DataFrame Summary:")\nprint(df.describe())',
      defaultParams: { rowCount: 4 },
      challenge: {
        goal: 'Select all students belonging to the "CSE" department using boolean indexing.',
        expectedCount: 2
      }
    },
    {
      id: 'u25cs201-data-filtering',
      unit: 5,
      unitTitle: 'NumPy & Pandas Data Handling',
      topic: 'Data Filtering & Groupby',
      title: 'Data Filtering, Aggregation & GroupBy Studio',
      icon: '📈',
      flagship: false,
      description: 'Filter tabular datasets using boolean mask conditions, calculate column-wise aggregates (mean, sum), and group records by category.',
      formula: '\\text{Filtered} = \\text{df}[\\text{df}[\\text{\"Score\"}] \\ge 80] \\quad | \\quad \\text{df}.\\mathbf{groupby}(\\text{\"Dept\"})[\\text{\"Score\"}].\\mathbf{mean}()',
      defaultCode: '# Data Filtering and Aggregation\nimport pandas as pd\ndata = {\n    "Dept": ["CSE", "IT", "CSE", "IT", "AI"],\n    "Marks": [90, 85, 80, 95, 88]\n}\ndf = pd.DataFrame(data)\nhigh_scorers = df[df["Marks"] >= 88]\nprint("High Scorers (>= 88):\\n", high_scorers)',
      defaultParams: { threshold: 88 },
      challenge: {
        goal: 'Filter the DataFrame to find how many records scored greater than or equal to 88.',
        expectedRows: 3
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
    courseCode: 'U25CS201',
    courseTitle: 'Python Programming',
    regulation: 'R2025 CBCS',
    semester: 2,
    credits: 3,
    UNITS: UNITS,
    SIMULATIONS: SIMULATIONS,
    getSimulationById: getSimulationById,
    getSimulationsForUnit: getSimulationsForUnit
  };
}));
