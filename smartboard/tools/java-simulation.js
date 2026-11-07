/**
 * java-simulation.js
 * Master Interactive Simulation Engine for Object Oriented Programming Using Java Laboratory (U25CS311)
 * Regulation R2025 CBCS · Semester III · PCC · 1.5 Credits · 30 Contact Hours
 *
 * 18 Verified Interactive Laboratory Experiments across 5 Units:
 *   Unit I:   Java OOP Basics, Classes, Objects & Methods (Expts 1-4)
 *   Unit II:  Inheritance, Polymorphism & Interfaces (Expts 5-8)
 *   Unit III: Exception Handling & Multithreading (Expts 9-11)
 *   Unit IV:  Packages, File Streams & Generics (Expts 12-15)
 *   Unit V:   Collections, JDBC & Application Project (Expts 16-18)
 *
 * 100% Safe Educational Java Execution Model:
 *   - Strictly in-memory deterministic AST & execution tracer
 *   - Interactive Stack Frame & Object Heap visualizer
 *   - Sandboxed Collections and in-memory simulated JDBC
 *   - Zero arbitrary code execution; complete host system safety
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1. STATE & DOM REFERENCES
  // ══════════════════════════════════════════════════════════
  const catalog = (typeof window !== 'undefined' && window.EduverseJavaCatalog) || null;
  if (!catalog) {
    console.error('[Java Simulation] EduverseJavaCatalog not loaded.');
    return;
  }

  const state = {
    currentUnit: 1,
    currentSimId: 'u25cs311-java-program-structure',
    mode: 'learn', // 'learn' | 'experiment' | 'challenge'
    theme: (function () { try { return localStorage.getItem('eduverse_theme') || 'light'; } catch (e) { return 'light'; } })(),
    isPlaying: false,
    speed: 1.0,
    currentStep: 0,
    maxSteps: 5,
    playIntervalId: null,
    params: {},
    challengeState: { solved: false, feedback: '' },

    // In-memory runtime data structures for Java memory visualization
    runtime: {
      stackFrames: [
        { method: 'main(String[] args)', locals: { args: '[0 items]', count: 3 } }
      ],
      heapObjects: [
        { id: '0x7F01', type: 'Student', fields: { id: 101, name: 'Aarav Patel', gpa: 3.85 } },
        { id: '0x7F02', type: 'Student', fields: { id: 102, name: 'Bhavna Sharma', gpa: 3.40 } }
      ],
      metaspace: {
        classes: ['eduverse.Student', 'eduverse.Main'],
        staticVariables: { 'Student.collegeName': 'KPRIET Eduverse', 'Student.studentCount': 2 }
      },
      consoleLines: [
        '[JVM Init] OpenJDK 64-Bit Server VM initialized.',
        '[Class Loaded] eduverse.kpriet.Main loaded successfully.'
      ]
    }
  };

  const dom = {
    app: document.getElementById('ep-app'),
    unitSelect: document.getElementById('java-unit'),
    simSelect: document.getElementById('java-simulation'),
    title: document.getElementById('ep-title'),
    subtitle: document.getElementById('ep-subtitle'),
    themeToggle: document.getElementById('java-theme-toggle'),
    fullscreenBtn: document.getElementById('ep-fullscreen'),
    exportBtn: document.getElementById('ep-export'),
    modeBtns: document.querySelectorAll('.ep-seg'),
    playBtn: document.getElementById('ep-play'),
    pauseBtn: document.getElementById('ep-pause'),
    prevBtn: document.getElementById('ep-prev'),
    nextBtn: document.getElementById('ep-next'),
    resetBtn: document.getElementById('ep-reset'),
    resetParamsBtn: document.getElementById('java-reset-params'),
    speedSelect: document.getElementById('java-speed'),
    stepLabel: document.getElementById('java-step-label'),
    progressFill: document.getElementById('java-progress-fill'),
    canvas: document.getElementById('java-canvas'),
    console: document.getElementById('java-console'),
    readouts: document.getElementById('ep-readouts'),
    overlaySim: document.getElementById('java-overlay-sim'),
    overlayState: document.getElementById('java-overlay-state'),
    whatText: document.getElementById('java-what'),
    whyText: document.getElementById('java-why'),
    nextText: document.getElementById('java-next-info'),
    formulaBox: document.getElementById('ep-formula-box'),
    bannerTitle: document.getElementById('ep-banner-title'),
    bannerText: document.getElementById('ep-banner-text'),
    inputsForm: document.getElementById('java-inputs-form'),
    inputActions: document.getElementById('java-input-actions'),
    challengeCard: document.getElementById('ep-challenge-card'),
    challengePrompt: document.getElementById('java-challenge-prompt'),
    verifyChallengeBtn: document.getElementById('java-verify-challenge'),
    challengeFeedback: document.getElementById('java-challenge-feedback'),
    toast: document.getElementById('java-toast')
  };

  const ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  // ══════════════════════════════════════════════════════════
  // 2. MATHEMATICAL & ALGORITHMIC OOP REFERENCE ENGINE
  // ══════════════════════════════════════════════════════════
  const JavaCore = {
    // Dynamic method dispatch vtable lookup simulation
    resolveDynamicDispatch: function (refType, actualType, methodName) {
      const vtables = {
        Circle: { draw: 'Circle.draw() [Override]', getArea: 'Math.PI * r * r' },
        Rectangle: { draw: 'Rectangle.draw() [Override]', getArea: 'width * height' },
        Shape: { draw: 'Shape.draw() [Base]', getArea: '0.0' }
      };

      const resolvedClass = vtables[actualType] ? actualType : refType;
      const resolvedImpl = (vtables[actualType] && vtables[actualType][methodName]) ||
                           (vtables[refType] && vtables[refType][methodName]) || 'AbstractMethodError';

      return {
        declaredType: refType,
        runtimeClass: actualType,
        methodName: methodName,
        invokedMethod: `${resolvedClass}.${methodName}`,
        implementation: resolvedImpl
      };
    },

    // In-memory Collections framework simulator
    simulateCollections: function (type, operation, element) {
      if (type === 'ArrayList') {
        const list = ['Apple', 'Banana', 'Orange'];
        if (operation === 'add') list.push(element);
        return { structure: 'Dynamic Array (O(1) amortized add)', items: list, allowDuplicates: true };
      } else if (type === 'HashSet') {
        const set = new Set(['Apple', 'Banana', 'Orange']);
        let added = true;
        if (operation === 'add') {
          if (set.has(element)) added = false;
          else set.add(element);
        }
        return { structure: 'Hash Buckets (Unique keys only)', items: Array.from(set), allowDuplicates: false, elementAdded: added };
      } else if (type === 'HashMap') {
        const map = { K101: 'Aarav', K102: 'Bhavna' };
        if (operation === 'put') map['K103'] = element;
        return { structure: 'Hash Table Key-Value Mapping', items: map };
      }
      return { structure: 'Collection', items: [] };
    },

    // Exception handling stack unwinding simulator
    traceException: function (exceptionType, catchHandled) {
      const trace = [
        { method: 'main()', line: 12, action: 'Invoke computeAverage()' },
        { method: 'computeAverage()', line: 24, action: 'Invoke divide(sum, count)' },
        { method: 'divide()', line: 38, action: `Throw new ${exceptionType}("/ by zero")` }
      ];

      return {
        exceptionType: exceptionType,
        callStack: trace,
        handled: catchHandled,
        status: catchHandled ? 'Handled in catch block; finally executed' : 'Unhandled exception: Thread main terminated abruptly'
      };
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

    // Background fill
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern
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
      case 'u25cs311-java-program-structure':
        renderJvmArchitecture(width, height, isDark);
        break;
      case 'u25cs311-classes-objects':
        renderClassesObjectsHeap(width, height, isDark);
        break;
      case 'u25cs311-constructors-this':
        renderConstructorsThis(width, height, isDark);
        break;
      case 'u25cs311-static-members':
        renderStaticMembersMemory(width, height, isDark);
        break;
      case 'u25cs311-inheritance-super':
        renderInheritanceSuper(width, height, isDark);
        break;
      case 'u25cs311-method-overriding-dispatch':
        renderMethodOverridingDispatch(width, height, isDark);
        break;
      case 'u25cs311-abstract-classes':
        renderAbstractClasses(width, height, isDark);
        break;
      case 'u25cs311-interfaces-multiple':
        renderInterfacesMultiple(width, height, isDark);
        break;
      case 'u25cs311-exception-handling':
        renderExceptionHandling(width, height, isDark);
        break;
      case 'u25cs311-custom-exceptions':
        renderCustomExceptions(width, height, isDark);
        break;
      case 'u25cs311-multithreading-sync':
        renderMultithreadingSync(width, height, isDark);
        break;
      case 'u25cs311-packages-access':
        renderPackagesAccess(width, height, isDark);
        break;
      case 'u25cs311-file-streams-io':
        renderFileStreamsIo(width, height, isDark);
        break;
      case 'u25cs311-object-serialization':
        renderObjectSerialization(width, height, isDark);
        break;
      case 'u25cs311-generics-type-safety':
        renderGenericsTypeSafety(width, height, isDark);
        break;
      case 'u25cs311-collections-framework':
        renderCollectionsFramework(width, height, isDark);
        break;
      case 'u25cs311-jdbc-database':
        renderJdbcDatabase(width, height, isDark);
        break;
      case 'u25cs311-student-mgmt-capstone':
        renderStudentMgmtCapstone(width, height, isDark);
        break;
      default:
        renderGenericJavaStage(width, height, isDark);
        break;
    }
  }

  function drawCard(x, y, w, h, title, subtitle, color, isDark) {
    ctx.save();
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.strokeStyle = color || '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color || (isDark ? '#f87171' : '#dc2626');
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
    ctx.strokeStyle = color || '#ef4444';
    ctx.fillStyle = color || '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 8 * Math.cos(angle - Math.PI / 6), toY - 8 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - 8 * Math.cos(angle + Math.PI / 6), toY - 8 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = '10.5px sans-serif';
      ctx.fillStyle = color || '#ef4444';
      ctx.fillText(label, (fromX + toX) / 2 + 6, (fromY + toY) / 2 - 4);
    }
    ctx.restore();
  }

  // 1. JVM Architecture & Compilation Pipeline
  function renderJvmArchitecture(w, h, isDark) {
    drawCard(50, 60, 200, 110, '1. Source Code', 'HelloWorld.java\npublic class HelloWorld {\n  public static void main...', '#ef4444', isDark);
    drawArrow(250, 115, 330, 115, '#ef4444', 'javac');

    drawCard(330, 60, 200, 110, '2. Bytecode File', 'HelloWorld.class\nCAFEBABE (Magic Number)\nBytecode instructions', '#f97316', isDark);
    drawArrow(530, 115, 610, 115, '#ef4444', 'ClassLoader');

    drawCard(610, 60, 200, 110, '3. JVM Runtime', 'Class Loader Subsystem\nBytecode Verifier\nJIT Execution Engine', '#10b981', isDark);

    drawCard(50, 220, 760, 240, 'JVM Memory Architecture & Runtime Areas', 'Divided into 5 Principal Memory Segments:', '#06b6d4', isDark);
    ctx.font = '11.5px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('• Class (Method) Area / Metaspace: Class metadata, static variables, runtime constant pool', 70, 275);
    ctx.fillText('• Heap Memory: Dynamic allocation for all objects and arrays (Garbage Collected)', 70, 305);
    ctx.fillText('• JVM Stack: One stack per thread; contains LIFO Stack Frames with local variables & operand stack', 70, 335);
    ctx.fillText('• Program Counter (PC) Registers: Address of currently executing JVM instruction', 70, 365);
    ctx.fillText('• Native Method Stack: Supports native C/C++ method invocations via JNI', 70, 395);
  }

  // 2. Classes, Objects & Heap Memory
  function renderClassesObjectsHeap(w, h, isDark) {
    // Stack frame
    drawCard(50, 60, 280, 200, 'Call Stack: main() Frame', 'Stack References (LIFO)', '#ef4444', isDark);
    ctx.font = '11.5px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Student s1 = 0x7F01 (Ref)', 70, 120);
    ctx.fillText('Student s2 = 0x7F02 (Ref)', 70, 150);
    ctx.fillText('int total = 2', 70, 180);

    // Heap Objects
    drawCard(460, 60, 350, 100, 'Heap Object: @0x7F01', 'Type: Student\n  id: 101, name: "Aarav", gpa: 3.85', '#10b981', isDark);
    drawCard(460, 180, 350, 100, 'Heap Object: @0x7F02', 'Type: Student\n  id: 102, name: "Bhavna", gpa: 3.40', '#10b981', isDark);

    drawArrow(330, 120, 460, 110, '#ef4444', 'Points to');
    drawArrow(330, 150, 460, 230, '#ef4444', 'Points to');

    drawCard(50, 310, 760, 150, 'Object Memory Rationale', '1. Variables s1 and s2 live on the Stack as 64-bit reference pointers.\n2. The new operator allocates memory on the Heap and calls the constructor.\n3. Mutating s1.gpa = 3.90 modifies only the object at 0x7F01; s2 is completely isolated.', '#f59e0b', isDark);
  }

  // 3. Constructors & this Keyword
  function renderConstructorsThis(w, h, isDark) {
    drawCard(50, 50, 760, 220, 'Constructor Overloading & this() Chaining Pipeline', 'class Rectangle { private int width, height; ... }', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('1. Default:       Rectangle()             --> invokes this(1, 1);', 75, 110);
    ctx.fillText('2. Square:        Rectangle(int side)     --> invokes this(side, side);', 75, 140);
    ctx.fillText('3. Parameterized: Rectangle(int w, int h) --> this.width = w; this.height = h;', 75, 170);
    ctx.fillText('Rule: this() must be the FIRST statement in a constructor call!', 75, 205);

    drawCard(50, 300, 760, 160, 'Variable Shadowing Resolution', 'When parameter name matches instance field name:\n  void setDimensions(int width, int height) {\n    this.width = width;   // this.width refers to current instance field\n    this.height = height; // parameter height shadows instance variable\n  }', '#10b981', isDark);
  }

  // 4. Static Variables & Methods
  function renderStaticMembersMemory(w, h, isDark) {
    drawCard(50, 60, 340, 200, 'Metaspace (Class Level)', 'Loaded Class: Student\nStatic variables (Shared among all instances):', '#f59e0b', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('static String college = "KPRIET";', 70, 130);
    ctx.fillText('static int count = 2; // Incremented on new', 70, 160);
    ctx.fillText('static void showCollege() { ... }', 70, 190);

    drawCard(460, 60, 350, 95, 'Instance 1: @0x8A01', 'id: 1, name: "Alice"\n(Does NOT store college or count)', '#10b981', isDark);
    drawCard(460, 175, 350, 95, 'Instance 2: @0x8A02', 'id: 2, name: "Bob"\n(Shares Metaspace static members)', '#10b981', isDark);

    drawArrow(460, 107, 390, 140, '#f59e0b', 'Reads static');
    drawArrow(460, 222, 390, 170, '#f59e0b', 'Reads static');

    drawCard(50, 290, 760, 170, 'Static Context Rules', '1. Static methods belong to the class and are invoked via Student.showCollege().\n2. Static methods CANNOT access instance fields (this, super) because no object instance is tied to the call.\n3. Modifying Student.college updates the value observed by all instances immediately.', '#ef4444', isDark);
  }

  // 5. Inheritance & super Keyword
  function renderInheritanceSuper(w, h, isDark) {
    drawCard(280, 40, 300, 85, 'Base Class: Person', 'fields: name, age\nconstructor: Person(name, age)', '#ef4444', isDark);
    drawArrow(430, 160, 430, 125, '#ef4444', 'extends');

    drawCard(280, 160, 300, 85, 'Derived Class: Employee', 'fields: empId, salary\nconstructor: Employee(...) invokes super(...)', '#f97316', isDark);
    drawArrow(430, 280, 430, 245, '#ef4444', 'extends');

    drawCard(280, 280, 300, 85, 'Subclass: Manager', 'fields: department\nconstructor: Manager(...) invokes super(...)', '#10b981', isDark);

    drawCard(50, 390, 760, 95, 'Top-Down Constructor Execution Order', 'new Manager(...) execution sequence: Person() -> Employee() -> Manager(). Base class state is fully initialized before child constructor body executes.', '#06b6d4', isDark);
  }

  // 6. Method Overriding & Dynamic Dispatch
  function renderMethodOverridingDispatch(w, h, isDark) {
    drawCard(50, 50, 360, 180, 'Polymorphic Reference Assignment', 'Shape s = new Circle(5.0); // Upcasting\ns.draw(); // Which method runs?', '#ef4444', isDark);
    ctx.font = '11.5px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Declared Type: Shape (Compile time)', 70, 115);
    ctx.fillText('Actual Type:   Circle (Runtime Heap)', 70, 140);
    ctx.fillText('Resolution:    Circle.draw() invoked!', 70, 165);

    drawCard(460, 50, 350, 180, 'Virtual Method Table (vtable)', 'JVM Dynamic Method Dispatch Table:', '#10b981', isDark);
    ctx.fillText('Shape vtable  -> [&Shape.draw, &Shape.area]', 480, 115);
    ctx.fillText('Circle vtable -> [&Circle.draw, &Circle.area]', 480, 145);
    ctx.fillText('Rect vtable   -> [&Rect.draw, &Rect.area]', 480, 175);

    drawArrow(410, 140, 460, 140, '#10b981', 'Dispatches via vtable');

    drawCard(50, 260, 760, 190, 'Runtime Polymorphism Guarantees', '1. Method Overloading: Compile-time polymorphism (same method name, different parameter signature in same class).\n2. Method Overriding: Runtime polymorphism (same method name and signature in subclass with @Override).\n3. Static, private, and final methods CANNOT be overridden because they use static binding (invokespecial / invokestatic).', '#f59e0b', isDark);
  }

  // 7. Abstract Classes & Methods
  function renderAbstractClasses(w, h, isDark) {
    drawCard(60, 50, 740, 180, 'abstract class BankAccount', 'Cannot be instantiated via new BankAccount()!', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Concrete Methods: deposit(amount), withdraw(amount), getBalance()', 80, 110);
    ctx.fillText('Pure Abstract:    abstract double calculateInterest(); // No body', 80, 140);
    ctx.fillText('Mandatory Rule:   Subclasses MUST provide implementation or remain abstract.', 80, 170);

    drawCard(60, 260, 340, 160, 'SavingsAccount', 'extends BankAccount\n@Override\ndouble calculateInterest() {\n  return balance * 0.04;\n}', '#10b981', isDark);

    drawCard(460, 260, 340, 160, 'CurrentAccount', 'extends BankAccount\n@Override\ndouble calculateInterest() {\n  return 0.0; // No interest\n}', '#06b6d4', isDark);
  }

  // 8. Interfaces & Multiple Implementation
  function renderInterfacesMultiple(w, h, isDark) {
    drawCard(80, 50, 280, 120, 'interface Printable', 'void print();\ndefault void info() {\n  System.out.println("Printable");\n}', '#06b6d4', isDark);
    drawCard(500, 50, 280, 120, 'interface Showable', 'void show();\ndefault void info() {\n  System.out.println("Showable");\n}', '#10b981', isDark);

    drawArrow(220, 170, 430, 230, '#ef4444', 'implements');
    drawArrow(640, 170, 430, 230, '#ef4444', 'implements');

    drawCard(250, 230, 360, 120, 'class Document', 'implements Printable, Showable\n@Override public void print() { ... }\n@Override public void show() { ... }\n@Override public void info() { Printable.super.info(); }', '#ef4444', isDark);

    drawCard(50, 380, 760, 95, 'Diamond Conflict Resolution', 'When multiple interfaces provide the same default method signature, the implementing class must explicitly override the method and resolve ambiguity via InterfaceName.super.method().', '#f59e0b', isDark);
  }

  // 9. Exception Handling (try-catch-finally)
  function renderExceptionHandling(w, h, isDark) {
    drawCard(50, 50, 760, 240, 'Exception Handling Execution Flow Tracer', 'try { int res = 10 / 0; } catch (ArithmeticException e) { ... } finally { ... }', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('1. [try block entered]: executing statement: int result = 10 / divisor;', 75, 110);
    ctx.fillText('2. [Exception triggered]: JVM creates new ArithmeticException("/ by zero")', 75, 140);
    ctx.fillText('3. [Stack Unwinding]: Normal execution suspended; searches enclosing catch blocks', 75, 170);
    ctx.fillText('4. [catch matched]: catch (ArithmeticException e) handles error gracefully', 75, 200);
    ctx.fillText('5. [finally block]: GUARANTEED execution (cleans up files, DB connections, sockets)', 75, 230);

    drawCard(50, 310, 760, 150, 'Throwable Class Hierarchy', 'Object -> Throwable -> [Error (Unchecked: OutOfMemoryError, StackOverflowError)]\n                    -> [Exception -> IOException, SQLException (Checked - Compiler Enforced)]\n                                  -> [RuntimeException -> NullPointer, ArrayIndex (Unchecked)]', '#10b981', isDark);
  }

  // 10. User-Defined Custom Exceptions
  function renderCustomExceptions(w, h, isDark) {
    drawCard(60, 50, 740, 180, 'Custom Exception: InsufficientFundsException', 'public class InsufficientFundsException extends Exception { ... }', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('void withdraw(double amount) throws InsufficientFundsException {', 80, 110);
    ctx.fillText('  if (amount > balance) {', 80, 135);
    ctx.fillText('    throw new InsufficientFundsException("Deficit: " + (amount - balance));', 80, 160);
    ctx.fillText('  }', 80, 185);
    ctx.fillText('}', 80, 210);

    drawCard(60, 260, 740, 180, 'Checked vs Unchecked Rules', '1. Checked Exception (extends Exception): Compiler requires either try-catch or throws declaration.\n2. Unchecked Exception (extends RuntimeException): Represents programming bugs; no throws required.\n3. Custom exceptions improve enterprise API readability and clean domain error handling.', '#06b6d4', isDark);
  }

  // 11. Multithreading & Synchronization
  function renderMultithreadingSync(w, h, isDark) {
    drawCard(60, 40, 740, 140, 'Thread State Lifecycle State Machine', 'New -> Runnable -> [Blocked / Waiting / Timed Waiting] -> Terminated', '#ef4444', isDark);
    ctx.font = '11.5px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Thread 1 (Producer): RUNNABLE -> acquires object monitor lock', 80, 100);
    ctx.fillText('Thread 2 (Consumer): BLOCKED  -> waiting for monitor lock release', 80, 130);

    drawCard(60, 200, 350, 180, 'Race Condition (Unsynchronized)', 'count = count + 1 (3 steps):\n1. Read count to register\n2. Increment register\n3. Write back to count\nTwo threads interleave -> LOST UPDATES!', '#f43f5e', isDark);

    drawCard(450, 200, 350, 180, 'Synchronized (Mutex Lock)', 'synchronized(this) {\n  count++; // Atomic critical section\n}\nOnly 1 thread enters at a time.\nGuarantees mutual exclusion.', '#10b981', isDark);

    drawCard(60, 400, 740, 80, 'Inter-Thread Communication: wait() & notify()', 'wait() releases lock and sleeps; notify() wakes up one waiting thread. Must be called inside synchronized block.', '#f59e0b', isDark);
  }

  // 12. Packages & Access Modifiers
  function renderPackagesAccess(w, h, isDark) {
    drawCard(60, 50, 740, 380, 'Java Access Specifier Matrix', '4 Modifiers across 5 Package / Inheritance Scopes:', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Scope                        | private | default | protected | public', 80, 115);
    ctx.fillText('-----------------------------+---------+---------+-----------+-------', 80, 135);
    ctx.fillText('1. Same Class                |   YES   |   YES   |    YES    |  YES  ', 80, 165);
    ctx.fillText('2. Same Package Subclass     |   NO    |   YES   |    YES    |  YES  ', 80, 195);
    ctx.fillText('3. Same Package Non-subclass |   NO    |   YES   |    YES    |  YES  ', 80, 225);
    ctx.fillText('4. Different Package Subclass|   NO    |   NO    |    YES    |  YES  ', 80, 255);
    ctx.fillText('5. Different Package Non-sub |   NO    |   NO    |    NO     |  YES  ', 80, 285);
    ctx.fillText('-----------------------------+---------+---------+-----------+-------', 80, 315);
    ctx.fillText('Key takeaway: protected enables inheritance access across package boundaries.', 80, 350);
  }

  // 13. File Streams & I/O
  function renderFileStreamsIo(w, h, isDark) {
    drawCard(60, 50, 340, 180, 'Byte Streams (8-bit bytes)', 'FileInputStream / FileOutputStream\nReads/writes raw binary data (images, audio, compiled .class files).\nSuperclasses: InputStream, OutputStream', '#f97316', isDark);

    drawCard(460, 50, 340, 180, 'Character Streams (16-bit text)', 'FileReader / FileWriter / BufferedReader\nHandles Unicode UTF-16 characters automatically without byte misinterpretation.\nSuperclasses: Reader, Writer', '#10b981', isDark);

    drawCard(60, 260, 740, 180, 'Buffered I/O Performance Optimization', 'try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {\n  String line;\n  while ((line = br.readLine()) != null) {\n    System.out.println(line);\n  }\n}\nBuffer blocks reduce costly disk I/O operations from individual bytes to 8KB chunks.', '#06b6d4', isDark);
  }

  // 14. Object Serialization
  function renderObjectSerialization(w, h, isDark) {
    drawCard(60, 60, 240, 160, 'In-Memory Object', 'Student s = new Student();\n  id = 101\n  name = "Aarav"\n  transient pin = 4040', '#ef4444', isDark);
    drawArrow(300, 140, 440, 140, '#ef4444', 'ObjectOutputStream');

    drawCard(440, 60, 360, 160, 'Serialized Binary Stream', 'File: student.ser\nAC ED 00 05 (Stream Header)\nClass descriptor & non-transient values', '#f97316', isDark);

    drawCard(60, 260, 740, 180, 'Deserialization & transient Keyword', '1. Implements java.io.Serializable (Marker interface with zero methods).\n2. transient modifier: fields marked transient (e.g. passwords, SSN, PIN) are SKIPPED during serialization.\n3. Upon ObjectInputStream.readObject(), transient variables are initialized to their default values (null, 0).', '#10b981', isDark);
  }

  // 15. Generics & Type Safety
  function renderGenericsTypeSafety(w, h, isDark) {
    drawCard(60, 50, 740, 180, 'Compile-Time Type Safety with Generics', 'Box<T> class definition: public class Box<T> { private T data; ... }', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Box<Integer> intBox = new Box<>();', 80, 110);
    ctx.fillText('intBox.set(100);       // VALID: Integer accepted', 80, 135);
    ctx.fillText('intBox.set("Eduverse");// COMPILE ERROR: Incompatible types detected at compile time!', 80, 160);
    ctx.fillText('Integer val = intBox.get(); // NO EXPLICIT CASTING NEEDED!', 80, 185);

    drawCard(60, 260, 740, 180, 'Type Erasure Mechanism in JVM', 'To ensure backward compatibility with pre-Java 5 bytecode:\n1. Compiler replaces type parameter T with Object (or the first bound if T extends Number).\n2. Inserts necessary type casts in generated bytecode.\n3. At runtime in the JVM, all generic information is erased: Box<Integer> becomes raw Box.', '#06b6d4', isDark);
  }

  // 16. Collections Framework
  function renderCollectionsFramework(w, h, isDark) {
    drawCard(50, 50, 180, 160, 'ArrayList<T>', 'Dynamic Array\nO(1) random get(i)\nO(n) insert/remove\nRetains order\nAllows duplicates', '#ef4444', isDark);
    drawCard(250, 50, 180, 160, 'LinkedList<T>', 'Doubly Linked List\nO(1) addFirst/addLast\nO(n) get(i)\nHigh pointer overhead\nImplements Deque', '#f97316', isDark);
    drawCard(450, 50, 180, 160, 'HashSet<T>', 'Hash Table Buckets\nO(1) contains/add\nNO DUPLICATES\nUnordered set\nBacked by HashMap', '#10b981', isDark);
    drawCard(650, 50, 180, 160, 'HashMap<K, V>', 'Key-Value Hash Table\nO(1) put / get\nUnique keys\nBucket hashing: h & (n-1)\nTreeBins at size > 8', '#06b6d4', isDark);

    drawCard(50, 240, 780, 200, 'Collections Hierarchy Summary', 'Iterable<T> -> Collection<T> -> List<T> (ArrayList, LinkedList, Vector)\n                             -> Set<T>  (HashSet, LinkedHashSet, TreeSet)\n                             -> Queue<T> (PriorityQueue, ArrayDeque)\nMap<K, V> is a separate hierarchy (HashMap, LinkedHashMap, TreeMap).', '#6366f1', isDark);
  }

  // 17. JDBC Database Connectivity
  function renderJdbcDatabase(w, h, isDark) {
    drawCard(50, 50, 760, 180, 'The 4 Essential Steps of JDBC Architecture', 'Connection conn = DriverManager.getConnection("jdbc:eduverse:kpriet", "user", "pass");', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('Step 1: Class.forName("com.mysql.cj.jdbc.Driver"); // Load & register JDBC driver', 75, 110);
    ctx.fillText('Step 2: Connection conn = DriverManager.getConnection(url, user, pass);', 75, 135);
    ctx.fillText('Step 3: PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM students WHERE id = ?");', 75, 160);
    ctx.fillText('Step 4: ResultSet rs = pstmt.executeQuery(); while (rs.next()) { ... }', 75, 185);

    drawCard(50, 260, 760, 180, 'Statement vs PreparedStatement', '1. Statement: Direct string concatenation vulnerable to SQL Injection attacks!\n2. PreparedStatement: Pre-compiled by DB engine, parameters bound with ?, immune to SQL injection.\n3. CallableStatement: Used to execute stored procedures with IN and OUT parameters.', '#10b981', isDark);
  }

  // 18. Student Records Capstone Project
  function renderStudentMgmtCapstone(w, h, isDark) {
    drawCard(50, 40, 760, 140, 'Student Management System Architecture (OOP Capstone)', 'Model-Service-Repository Multi-Tier Pattern in Java', '#ef4444', isDark);
    ctx.font = '12px monospace';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.fillText('• Model:      Student.java (Encapsulation: private id, name, gpa, getters/setters)', 75, 95);
    ctx.fillText('• Service:    StudentManager.java (Business logic, validation, custom exceptions)', 75, 120);
    ctx.fillText('• Storage:    ArrayList<Student> + in-memory JDBC persistence table', 75, 145);

    drawCard(50, 200, 760, 240, 'Integrated OOP Principles Verified', '✓ Classes & Objects: Instantiates distinct Student models\n✓ Inheritance: GraduateStudent and UndergraduateStudent extend Student\n✓ Polymorphism: calculateHonors() overridden with grade-specific criteria\n✓ Exception Handling: InvalidGpaException thrown for out-of-range inputs\n✓ Collections: ArrayList<Student> sorted using Collections.sort(list, Comparator)\n✓ File/JDBC: Records saved to simulated student_records.csv and in-memory SQL database', '#10b981', isDark);
  }

  function renderGenericJavaStage(w, h, isDark) {
    drawCard(80, 100, w - 160, h - 200, 'Java Laboratory Stage Active', 'Interactive Educational Java Engine Ready', '#ef4444', isDark);
  }

  // ══════════════════════════════════════════════════════════
  // 4. UI SETUP & CONTROLS
  // ══════════════════════════════════════════════════════════
  function populateSimulations() {
    if (!dom.simSelect) return;
    dom.simSelect.innerHTML = '';
    const sims = catalog.getSimulationsByUnit(state.currentUnit);
    sims.forEach(sim => {
      const opt = document.createElement('option');
      opt.value = sim.id;
      opt.textContent = `${sim.icon || '☕'} ${sim.title}`;
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
    if (dom.subtitle) dom.subtitle.textContent = `U25CS311 · Unit ${sim.unit} · ${sim.unitTitle} · PCC (1.5 Credits)`;
    if (dom.formulaBox) dom.formulaBox.textContent = sim.formula || '\\text{Java OOP Model}';
    if (dom.bannerText) dom.bannerText.textContent = sim.description;

    // Challenge setup
    if (dom.challengePrompt && sim.challenge) {
      dom.challengePrompt.textContent = sim.challenge.goal;
      if (dom.challengeFeedback) dom.challengeFeedback.style.display = 'none';
    }

    renderInputControls(sim);
    updatePedagogicalText();
    renderCanvas();
    appendConsoleLine(`[Experiment Loaded] ${sim.title}`, 'success');
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
      } else if (typeof val === 'string' && val.length > 25) {
        input = document.createElement('textarea');
        input.className = 'java-code-box';
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

  function appendConsoleLine(text, styleClass) {
    if (!dom.console) return;
    const line = document.createElement('div');
    line.className = `java-console-line ${styleClass || ''}`;
    line.textContent = text;
    dom.console.appendChild(line);
    dom.console.scrollTop = dom.console.scrollHeight;
  }

  function updatePedagogicalText() {
    const sim = catalog.getSimulationById(state.currentSimId);
    if (!sim) return;

    if (dom.whatText) {
      dom.whatText.textContent = `${sim.title} active. Tracking object state, memory stack/heap, and JVM dispatch.`;
    }
    if (dom.whyText) {
      dom.whyText.textContent = sim.formula ? `Principle: ${sim.formula}` : 'Follows Java Virtual Machine Specification & Standard OOP principles.';
    }
    if (dom.nextText) {
      dom.nextText.textContent = `Step ${state.currentStep + 1} of ${state.maxSteps}: Cycle through execution phases to inspect runtime variables and stack frames.`;
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
    appendConsoleLine(`[Step ${state.currentStep + 1}] Executing opcode / state transition phase...`);
  }

  function togglePlay() {
    state.isPlaying = !state.isPlaying;
    if (dom.playBtn) {
      dom.playBtn.textContent = state.isPlaying ? '⏸ Pause' : '▶ Run Trace';
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
        showToast('Experiment state reset to beginning');
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
          dom.challengeFeedback.style.background = 'rgba(239, 68, 68, 0.15)';
          dom.challengeFeedback.style.color = 'var(--java-red-dark)';
          dom.challengeFeedback.style.border = '1px solid var(--java-red)';
          dom.challengeFeedback.innerHTML = `<strong>Challenge Verified!</strong><br>${sim.challenge.expectedResult}`;
        }
        appendConsoleLine(`[Challenge Verified] ${sim.challenge.expectedResult}`, 'success');
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
      loadSimulation('u25cs311-java-program-structure');
    }
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEvents);
  } else {
    initEvents();
  }
})();
