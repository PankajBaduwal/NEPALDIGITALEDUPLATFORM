import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25CS311 / U21AD307 / U21CS307
 * Course Name: Object Oriented Programming Using Java Laboratory
 * Semester: III | Category: PCC | Credits: 1.5 | Regulation: R2025 CBCS
 * Common to: IT, CSE, AI&DS, AI&ML, Cyber Security (SC), CSBS (CB)
 *
 * Uses isolated Smart Board Java Engine architecture (boardEngine: 'java')
 * Dynamic routing via smartboardPresetKey to java-simulation.html and tools/java-simulation.js.
 */
export const U25CS311_SUBJECT_KEYWORDS = [
  'object oriented programming using java laboratory',
  'object oriented programming using java lab',
  'object oriented programming java laboratory',
  'java laboratory',
  'java lab',
  'u25cs311',
  'u21ad307',
  'u21cs307',
  'cs311',
  'ad307',
  'cs307',
  'oop java lab',
  'java programming lab',
];

function u25javaSimulation(def: {
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
    boardEngine: 'java' as any,
    domain: 'COMPUTER_SCIENCE',
    category: 'java programming',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25CS311_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with interactive JVM memory stack/heap visualizers, dynamic dispatch vtables, thread synchronization state machines, and an integrated Java AI assistant.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    flagship: def.flagship,
    tags: ['U25CS311', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Java Laboratory', 'OOP', 'R2025 CBCS'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ active: true, step: 1 }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25CS311_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — JAVA OOP BASICS, CLASSES, OBJECTS & METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  u25javaSimulation({
    id: 'u25cs311-java-program-structure',
    unit: 1,
    unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
    topic: 'Java Architecture & Bytecode Tracer',
    title: 'Java Program Structure, JVM Architecture & Bytecode Tracer ⭐',
    icon: '☕',
    flagship: true,
    shortDescription: 'Trace standard Java program structure from source code (.java) through the javac compiler to bytecode (.class) and execution inside the JVM (Class Loader, JVM Memory Stack/Heap, Execution Engine). Step through main() line by line.',
    learningObjectives: [
      'Understand the roles of JDK, JRE, and JVM in the Java execution environment',
      'Trace how javac produces platform-independent bytecode (.class files)',
      'Inspect JVM runtime data areas: Class Area, Heap, Stack, Program Counter (PC), and Native Stack',
    ],
    formulaOverview: '\\text{Compilation: } \\text{Source.java} \\xrightarrow{\\text{javac}} \\text{Bytecode.class} \\xrightarrow{\\text{JVM}} \\text{Native Machine Code}',
    parameters: [
      { key: 'activeStage', label: 'Execution Stage', type: 'select', default: 'bytecode', options: [
        { label: 'Source Code (Hello.java)', value: 'source' },
        { label: 'Bytecode Disassembly (javap -c)', value: 'bytecode' },
        { label: 'JVM ClassLoader & Execution Engine', value: 'jvm' },
      ]},
    ],
    metrics: [
      { key: 'bytecodeOpcodeCount', label: 'Opcodes', unit: '' },
      { key: 'constantPoolEntries', label: 'Constant Pool', unit: '' },
      { key: 'jvmEngineStatus', label: 'JVM Status', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-classes-objects',
    unit: 1,
    unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
    topic: 'Classes, Objects & Heap Memory',
    title: 'Classes, Instance Variables, Methods & Object Heap Visualizer ⭐',
    icon: '📦',
    flagship: true,
    shortDescription: 'Instantiate multiple objects from a user-configured Student/Account class. Visualize how stack references point to distinct heap object memory blocks with their own isolated instance states.',
    learningObjectives: [
      'Define Java classes encapsulating state (fields) and behavior (methods)',
      'Instantiate objects using the new keyword and track reference addresses',
      'Contrast stack memory (reference variables) with heap memory (allocated objects)',
    ],
    formulaOverview: '\\text{Heap Allocation: } \\text{Student } s_1 = \\mathbf{new} \\text{ Student}(\\dots) \\implies \\text{Stack Ref } s_1 \\to \\text{Heap Memory}[\\text{id, name, gpa}]',
    parameters: [
      { key: 'className', label: 'Class Template', type: 'select', default: 'Student', options: [
        { label: 'Student (id, name, gpa)', value: 'Student' },
        { label: 'BankAccount (accNo, balance)', value: 'BankAccount' },
      ]},
      { key: 'numInstances', label: 'Object Instances', type: 'select', default: '2', options: [
        { label: '2 Objects (s1, s2)', value: '2' },
        { label: '3 Objects (s1, s2, s3)', value: '3' },
      ]},
    ],
    metrics: [
      { key: 'heapObjectsAllocated', label: 'Heap Objects', unit: '' },
      { key: 'stackReferencesCount', label: 'Stack Refs', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-constructors-this',
    unit: 1,
    unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
    topic: 'Constructors & this Reference',
    title: 'Constructor Types (Default, Parameterized, Overloaded) & this Keyword Lab',
    icon: '🏗️',
    shortDescription: 'Explore default constructors, parameterized constructors, constructor chaining via this(), and resolving instance variable shadowing with the this keyword during object initialization.',
    learningObjectives: [
      'Differentiate default, no-arg, and parameterized constructors',
      'Chain constructors using this() calls as the first statement',
      'Resolve variable shadowing when constructor parameters match instance variable names',
    ],
    formulaOverview: '\\text{Constructor Chaining: } \\mathbf{this}(\\dots) \\text{ must be first statement} \\quad | \\quad \\mathbf{this}.x = x \\text{ (Shadow Resolution)}',
    parameters: [
      { key: 'constructorType', label: 'Constructor Type', type: 'select', default: 'parameterized', options: [
        { label: 'Default / No-arg Constructor', value: 'default' },
        { label: 'Parameterized Constructor', value: 'parameterized' },
        { label: 'Constructor Chaining via this()', value: 'chaining' },
      ]},
    ],
    metrics: [
      { key: 'constructorInvocations', label: 'Constructors Run', unit: '' },
      { key: 'shadowingResolved', label: 'Shadowing Safe', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-static-members',
    unit: 1,
    unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
    topic: 'Static Variables & Methods',
    title: 'Static Variables, Static Methods & Class vs Instance Memory Explorer',
    icon: '⚡',
    shortDescription: 'Contrast static (class-level) variables stored in the Metaspace/Method Area with instance variables in the Heap. Observe how all instances share a single static counter variable.',
    learningObjectives: [
      'Understand how static variables are shared among all class instances in Metaspace',
      'Invoke static methods without creating class instances',
      'Recognize restrictions: static methods cannot use this, super, or non-static members',
    ],
    formulaOverview: '\\text{Shared State: } \\forall i, \\; \\text{instance}_i.\\text{count} \\equiv \\text{ClassName}.\\text{count} \\in \\text{Metaspace}',
    parameters: [
      { key: 'sharedCounter', label: 'Shared Counter', type: 'boolean', default: true },
      { key: 'staticVar', label: 'Static Variable', type: 'select', default: 'collegeName', options: [
        { label: 'Static Field: collegeName', value: 'collegeName' },
        { label: 'Static Counter: studentCount', value: 'studentCount' },
      ]},
    ],
    metrics: [
      { key: 'metaspaceSharedVar', label: 'Static Val', unit: '' },
      { key: 'instanceCopiesCount', label: 'Instances', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — INHERITANCE, POLYMORPHISM & INTERFACES
  // ═══════════════════════════════════════════════════════════════════════════
  u25javaSimulation({
    id: 'u25cs311-inheritance-super',
    unit: 2,
    unitTitle: 'Inheritance, Polymorphism & Interfaces',
    topic: 'Class Inheritance & super Keyword',
    title: 'Class Inheritance Hierarchy & super Constructor/Method Lab ⭐',
    icon: '🌳',
    flagship: true,
    shortDescription: 'Construct single and multilevel inheritance hierarchies (e.g. Person -> Employee -> Manager). Trace superclass constructor execution via super() and access overridden base methods.',
    learningObjectives: [
      'Implement code reuse through single and multilevel inheritance (extends keyword)',
      'Trace top-down superclass constructor execution via super() calls',
      'Access hidden superclass members and overridden methods using super.method()',
    ],
    formulaOverview: '\\text{Subclassing: } \\mathbf{class} \\; B \\; \\mathbf{extends} \\; A \\quad | \\quad \\mathbf{super}(args) \\text{ triggers base constructor execution}',
    parameters: [
      { key: 'hierarchy', label: 'Inheritance Model', type: 'select', default: 'Person-Employee-Manager', options: [
        { label: 'Multilevel: Person -> Employee -> Manager', value: 'Person-Employee-Manager' },
        { label: 'Hierarchical: Shape -> Circle & Rectangle', value: 'Shape-Circle-Rectangle' },
      ]},
    ],
    metrics: [
      { key: 'inheritanceDepth', label: 'Class Depth', unit: '' },
      { key: 'superCallsExecuted', label: 'super() Calls', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-method-overriding-dispatch',
    unit: 2,
    unitTitle: 'Inheritance, Polymorphism & Interfaces',
    topic: 'Method Overriding & Dynamic Dispatch',
    title: 'Method Overriding & Dynamic Method Dispatch (Runtime Polymorphism) Lab ⭐',
    icon: '🎭',
    flagship: true,
    shortDescription: 'Observe runtime polymorphism in action: a superclass reference variable (e.g. Animal a) holding different subclass objects (Dog, Cat) resolves method calls dynamically at runtime based on the actual object type.',
    learningObjectives: [
      'Differentiate compile-time method overloading from runtime method overriding',
      'Trace dynamic method dispatch utilizing the JVM Virtual Method Table (vtable)',
      'Understand upcasting semantics: Superclass ref = new Subclass()',
    ],
    formulaOverview: '\\text{Dynamic Dispatch: } A \\; obj = \\mathbf{new} \\; B(); \\; obj.speak() \\implies \\text{resolved to } B.speak() \\text{ via vtable}',
    parameters: [
      { key: 'referenceType', label: 'Superclass Reference', type: 'select', default: 'Shape', options: [
        { label: 'Shape ref = new Circle()', value: 'Circle' },
        { label: 'Shape ref = new Rectangle()', value: 'Rectangle' },
      ]},
    ],
    metrics: [
      { key: 'declaredType', label: 'Declared Type', unit: '' },
      { key: 'actualType', label: 'Runtime Type', unit: '' },
      { key: 'resolvedMethod', label: 'Dispatched To', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-abstract-classes',
    unit: 2,
    unitTitle: 'Inheritance, Polymorphism & Interfaces',
    topic: 'Abstract Classes & Methods',
    title: 'Abstract Classes, Pure Abstract Methods & Concrete Extension Lab',
    icon: '📐',
    shortDescription: 'Explore abstract base classes that cannot be directly instantiated. Trace mandatory implementation of pure abstract methods in concrete subclasses while inheriting common concrete methods.',
    learningObjectives: [
      'Declare abstract classes and methods using the abstract keyword',
      'Enforce mandatory method implementation in non-abstract subclasses',
      'Understand when to use abstract classes (partial abstraction) vs interfaces (full abstraction)',
    ],
    formulaOverview: '\\mathbf{abstract} \\; \\mathbf{class} \\; A \\; \\{ \\mathbf{abstract} \\; \\mathbf{void} \\; m(); \\} \\implies \\text{Concrete } B \\; \\mathbf{must} \\text{ implement } m()',
    parameters: [
      { key: 'concreteClass', label: 'Subclass Implementation', type: 'select', default: 'SavingsAccount', options: [
        { label: 'SavingsAccount extends BankAccount', value: 'SavingsAccount' },
        { label: 'CurrentAccount extends BankAccount', value: 'CurrentAccount' },
      ]},
    ],
    metrics: [
      { key: 'abstractMethodsCount', label: 'Abstract Methods', unit: '' },
      { key: 'instantiationBlocked', label: 'Direct New Blocked', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-interfaces-multiple',
    unit: 2,
    unitTitle: 'Inheritance, Polymorphism & Interfaces',
    topic: 'Interfaces & Multiple Implementation',
    title: 'Interfaces, Multiple Implementation & Default Methods Explorer',
    icon: '🔌',
    shortDescription: 'Simulate multiple interface implementation (implements Printable, Showable). Explore Java 8+ default methods, static interface methods, and resolving default method diamond conflicts.',
    learningObjectives: [
      'Implement multiple interfaces to achieve multiple inheritance of type in Java',
      'Utilize Java 8+ default methods to add behavior without breaking implementers',
      'Resolve default method diamond conflicts via InterfaceName.super.method()',
    ],
    formulaOverview: '\\mathbf{class} \\; C \\; \\mathbf{implements} \\; I_1, I_2 \\quad | \\quad I_1.\\mathbf{super}.method() \\text{ (Diamond Conflict Resolution)}',
    parameters: [
      { key: 'conflictResolution', label: 'Default Method Conflict', type: 'select', default: 'override', options: [
        { label: 'Override & Delegate: Printable.super.info()', value: 'override' },
        { label: 'Standalone Custom Implementation in Class', value: 'custom' },
      ]},
    ],
    metrics: [
      { key: 'interfacesImplemented', label: 'Interfaces', unit: '' },
      { key: 'diamondConflictResolved', label: 'Conflict Resolved', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — EXCEPTION HANDLING & MULTITHREADING
  // ═══════════════════════════════════════════════════════════
  u25javaSimulation({
    id: 'u25cs311-exception-handling',
    unit: 3,
    unitTitle: 'Exception Handling & Multithreading',
    topic: 'try-catch-finally & throw/throws',
    title: 'Exception Handling (try-catch-finally, throw, throws) Tracer ⭐',
    icon: '🛡️',
    flagship: true,
    shortDescription: 'Trace runtime exceptions (ArithmeticException / by zero, ArrayIndexOutOfBoundsException, NullPointerException). Visualize stack unwinding, matching catch blocks, and guaranteed finally block execution.',
    learningObjectives: [
      'Master the 5 exception handling keywords: try, catch, finally, throw, throws',
      'Trace call stack unwinding when an unhandled exception propagates upward',
      'Understand the guaranteed cleanup execution of finally blocks',
    ],
    formulaOverview: '\\text{Flow: } \\mathbf{try} \\to \\text{Throw Exception} \\to \\text{Match Catch Block} \\to \\mathbf{finally} \\; (\\text{Guaranteed Execution})',
    parameters: [
      { key: 'exceptionType', label: 'Triggered Exception', type: 'select', default: 'ArithmeticException', options: [
        { label: 'ArithmeticException (/ by zero)', value: 'ArithmeticException' },
        { label: 'ArrayIndexOutOfBoundsException (arr[10])', value: 'ArrayIndexOutOfBoundsException' },
        { label: 'NullPointerException (str.length())', value: 'NullPointerException' },
      ]},
      { key: 'catchHandled', label: 'Catch Block Present', type: 'boolean', default: true },
    ],
    metrics: [
      { key: 'stackFramesUnwound', label: 'Frames Unwound', unit: '' },
      { key: 'finallyExecuted', label: 'Finally Executed', unit: '' },
      { key: 'programTerminatedCleanly', label: 'Clean Exit', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-custom-exceptions',
    unit: 3,
    unitTitle: 'Exception Handling & Multithreading',
    topic: 'User-Defined Custom Exceptions',
    title: 'User-Defined Custom Checked & Unchecked Exceptions Lab',
    icon: '⚠️',
    shortDescription: 'Design and throw custom domain exceptions (e.g. InsufficientFundsException, InvalidAgeException extending Exception or RuntimeException). Propagate errors with throws clauses and exception messages.',
    learningObjectives: [
      'Create custom checked exceptions by extending java.lang.Exception',
      'Create custom unchecked exceptions by extending java.lang.RuntimeException',
      'Pass error messages and error codes to super(message) constructors',
    ],
    formulaOverview: '\\mathbf{class} \\; \\text{CustomEx } \\mathbf{extends} \\; \\text{Exception} \\quad | \\quad \\mathbf{throw} \\; \\mathbf{new} \\; \\text{CustomEx}(\\text{"Error message"});',
    parameters: [
      { key: 'exceptionClass', label: 'Custom Exception', type: 'select', default: 'InsufficientFundsException', options: [
        { label: 'InsufficientFundsException (Banking deficit)', value: 'InsufficientFundsException' },
        { label: 'InvalidGpaException (Academic GPA bounds)', value: 'InvalidGpaException' },
      ]},
    ],
    metrics: [
      { key: 'exceptionCategory', label: 'Checked/Unchecked', unit: '' },
      { key: 'exceptionPropagated', label: 'Propagated', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-multithreading-sync',
    unit: 3,
    unitTitle: 'Exception Handling & Multithreading',
    topic: 'Multithreading & Synchronization',
    title: 'Multithreading Lifecycle, Thread Synchronization & Inter-Thread Communication Lab ⭐',
    icon: '🧵',
    flagship: true,
    shortDescription: 'Simulate concurrent thread lifecycles: New, Runnable, Blocked, Waiting, Timed Waiting, Terminated. Observe race conditions on shared counters and fix them using synchronized blocks and wait()/notify().',
    learningObjectives: [
      'Create threads by extending Thread class and implementing Runnable interface',
      'Understand thread states: New, Runnable, Blocked, Waiting, Timed Waiting, Terminated',
      'Eliminate race conditions using synchronized blocks and inter-thread wait()/notify()',
    ],
    formulaOverview: '\\text{States: New} \\to \\text{Runnable} \\rightleftarrows \\text{Blocked/Waiting} \\to \\text{Terminated} \\quad | \\quad \\mathbf{synchronized}(\\text{lock})',
    parameters: [
      { key: 'useSynchronization', label: 'Enable Synchronization', type: 'boolean', default: true },
      { key: 'numThreads', label: 'Worker Threads', type: 'select', default: '2', options: [
        { label: '2 Concurrent Threads', value: '2' },
        { label: '4 Concurrent Threads', value: '4' },
      ]},
    ],
    metrics: [
      { key: 'counterFinalValue', label: 'Final Counter', unit: '' },
      { key: 'raceConditionDetected', label: 'Race Condition', unit: '' },
      { key: 'lockWaitQueue', label: 'Wait Queue', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — PACKAGES, FILE STREAMS & GENERICS
  // ═══════════════════════════════════════════════════════════════════════════
  u25javaSimulation({
    id: 'u25cs311-packages-access',
    unit: 4,
    unitTitle: 'Packages, File Streams & Generics',
    topic: 'Packages & Access Modifiers',
    title: 'Java Packages, Imports & Access Modifiers (public, protected, default, private) Matrix',
    icon: '📦',
    shortDescription: 'Interactive 4x4 visibility matrix for access specifiers across: same class, same package subclass, same package non-subclass, different package subclass, and different package non-subclass.',
    learningObjectives: [
      'Organize classes into namespaces using package declarations and imports',
      'Analyze access levels: public, protected, package-private (default), and private',
      'Understand why protected grants visibility to subclasses in different packages',
    ],
    formulaOverview: '\\text{Visibility Scope: } \\text{private} \\subset \\text{default (package-private)} \\subset \\text{protected} \\subset \\text{public}',
    parameters: [
      { key: 'modifier', label: 'Access Specifier', type: 'select', default: 'protected', options: [
        { label: 'public (Accessible Everywhere)', value: 'public' },
        { label: 'protected (Package + Subclasses Outside)', value: 'protected' },
        { label: 'default (Package-Private Only)', value: 'default' },
        { label: 'private (Same Class Only)', value: 'private' },
      ]},
    ],
    metrics: [
      { key: 'visibilityScopesCount', label: 'Allowed Scopes', unit: '/5' },
      { key: 'packageIsolationActive', label: 'Encapsulated', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-file-streams-io',
    unit: 4,
    unitTitle: 'Packages, File Streams & Generics',
    topic: 'Byte & Character Streams File I/O',
    title: 'Byte Streams & Character Streams File I/O Sandbox ⭐',
    icon: '📂',
    flagship: true,
    shortDescription: 'In-memory safe file stream lab: compare 8-bit Byte Streams (FileInputStream/FileOutputStream) with 16-bit Character Streams (FileReader/FileWriter, BufferedReader). Read and write fictional text files safely.',
    learningObjectives: [
      'Distinguish byte streams (raw binary) from character streams (Unicode text)',
      'Use buffered streams (BufferedReader, BufferedWriter) for high-performance I/O',
      'Apply try-with-resources statement for automatic resource closing',
    ],
    formulaOverview: '\\text{Byte Stream: } 8\\text{-bit bytes (raw binary)} \\quad | \\quad \\text{Character Stream: } 16\\text{-bit Unicode (UTF-16 text)}',
    parameters: [
      { key: 'streamType', label: 'Stream Architecture', type: 'select', default: 'character-buffered', options: [
        { label: 'Character Stream: BufferedReader & PrintWriter', value: 'character-buffered' },
        { label: 'Byte Stream: FileInputStream & FileOutputStream', value: 'byte-stream' },
      ]},
    ],
    metrics: [
      { key: 'bytesTransferred', label: 'Bytes I/O', unit: '' },
      { key: 'autoCloseStatus', label: 'Try-with-Resources', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-object-serialization',
    unit: 4,
    unitTitle: 'Packages, File Streams & Generics',
    topic: 'Object Serialization & transient',
    title: 'Object Serialization, Deserialization & transient Keyword Visualizer',
    icon: '💾',
    shortDescription: 'Serialize a Java object graph to a binary byte stream via ObjectOutputStream and reconstruct it via ObjectInputStream. Observe how transient fields (e.g. password) are omitted and reset to default values.',
    learningObjectives: [
      'Implement java.io.Serializable marker interface for object persistence',
      'Convert heap objects into portable byte streams using ObjectOutputStream',
      'Protect sensitive credentials from persistence using the transient modifier',
    ],
    formulaOverview: '\\text{Object Serialization: } \\text{Object} \\xrightarrow{\\text{ObjectOutputStream}} \\text{Byte Stream} \\quad | \\quad \\mathbf{transient} \\implies \\text{omitted}',
    parameters: [
      { key: 'serializePassword', label: 'Persist Sensitive Field', type: 'boolean', default: false },
    ],
    metrics: [
      { key: 'serializedBytesSize', label: 'Stream Size', unit: 'bytes' },
      { key: 'transientOmitted', label: 'Sensitive Field Omitted', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-generics-type-safety',
    unit: 4,
    unitTitle: 'Packages, File Streams & Generics',
    topic: 'Generics & Type Safety',
    title: 'Generic Classes, Methods & Type Parameter Erasure Explorer',
    icon: '🧬',
    shortDescription: 'Explore compile-time type safety with Generics: Container<T>, bounded wildcards (<? extends Number>), and type erasure where the Java compiler replaces generic type parameters with Object or bound types.',
    learningObjectives: [
      'Write type-safe generic classes and methods with type parameter <T>',
      'Eliminate explicit casting and ClassCastException errors at runtime',
      'Understand JVM type erasure: generic types are replaced by Object in bytecode',
    ],
    formulaOverview: '\\text{Generic Class: } \\mathbf{class} \\; \\text{Box}\\langle T \\rangle \\quad | \\quad \\text{Type Erasure: } \\text{Box}\\langle T \\rangle \\to \\text{Box}\\langle \\text{Object} \\rangle',
    parameters: [
      { key: 'typeParameter', label: 'Generic Type Bound', type: 'select', default: 'Integer', options: [
        { label: 'Box<Integer>', value: 'Integer' },
        { label: 'Box<String>', value: 'String' },
        { label: 'Box<? extends Number> (Bounded)', value: 'BoundedNumber' },
      ]},
    ],
    metrics: [
      { key: 'compileTypeSafe', label: 'Type Safe', unit: '' },
      { key: 'erasureTargetType', label: 'Erasure Target', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — COLLECTIONS, JDBC & APPLICATION PROJECT
  // ═══════════════════════════════════════════════════════════════════════════
  u25javaSimulation({
    id: 'u25cs311-collections-framework',
    unit: 5,
    unitTitle: 'Collections, JDBC & Application Project',
    topic: 'Collections Framework (List, Set, Map)',
    title: 'Java Collections Framework (ArrayList, LinkedList, HashSet, HashMap) Lab ⭐',
    icon: '📚',
    flagship: true,
    shortDescription: 'Interactive visualization of Java Collections: compare ArrayList (dynamic array, O(1) random access) vs LinkedList (doubly linked nodes, O(1) insertions), HashSet (hash-bucket duplicate rejection), and HashMap (key-value hashing).',
    learningObjectives: [
      'Select appropriate collection interfaces: List, Set, Queue, and Map',
      'Compare time complexities of ArrayList vs LinkedList vs HashMap',
      'Iterate collections using Iterator, ListIterator, and enhanced for-each loop',
    ],
    formulaOverview: '\\text{ArrayList: } O(1) \\text{ get, } O(n) \\text{ insert} \\quad | \\quad \\text{HashMap: } \\text{bucket} = \\text{hashCode}(k) \\; \\& \\; (n-1)',
    parameters: [
      { key: 'collectionType', label: 'Collection Interface', type: 'select', default: 'ArrayList', options: [
        { label: 'ArrayList (Index-based Dynamic Array)', value: 'ArrayList' },
        { label: 'LinkedList (Doubly Linked Nodes)', value: 'LinkedList' },
        { label: 'HashSet (Unique Hash-Bucket Elements)', value: 'HashSet' },
        { label: 'HashMap (Key-Value Pair Hash Table)', value: 'HashMap' },
      ]},
    ],
    metrics: [
      { key: 'collectionSize', label: 'Elements', unit: '' },
      { key: 'timeComplexityGet', label: 'Get Complexity', unit: '' },
      { key: 'duplicatesAllowed', label: 'Duplicates', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-jdbc-database',
    unit: 5,
    unitTitle: 'Collections, JDBC & Application Project',
    topic: 'JDBC Architecture & PreparedStatement',
    title: 'In-Memory JDBC 4-Step Architecture & PreparedStatement CRUD Lab ⭐',
    icon: '🗄️',
    flagship: true,
    shortDescription: 'Simulate the standard 4-step JDBC workflow: 1. Load Driver -> 2. Establish Connection -> 3. Execute PreparedStatement -> 4. Process ResultSet against an in-memory synthetic relational database.',
    learningObjectives: [
      'Execute the 4 fundamental steps of Java Database Connectivity (JDBC)',
      'Prevent SQL injection attacks by parameterizing queries with PreparedStatement',
      'Process query results iteratively using the ResultSet cursor',
    ],
    formulaOverview: '\\text{JDBC Steps: } \\text{DriverManager.getConnection()} \\to \\text{PreparedStatement} \\to \\text{executeQuery()} \\to \\text{ResultSet}',
    parameters: [
      { key: 'queryType', label: 'SQL Operation', type: 'select', default: 'SELECT', options: [
        { label: 'SELECT (Query records via ResultSet)', value: 'SELECT' },
        { label: 'INSERT (Add new record via executeUpdate())', value: 'INSERT' },
        { label: 'UPDATE (Modify record with parameter binding)', value: 'UPDATE' },
      ]},
    ],
    metrics: [
      { key: 'jdbcStepActive', label: 'Current Step', unit: '/4' },
      { key: 'resultSetRows', label: 'Rows Returned', unit: '' },
      { key: 'sqlInjectionImmune', label: 'SQL Injection Safe', unit: '' },
    ],
  }),

  u25javaSimulation({
    id: 'u25cs311-student-mgmt-capstone',
    unit: 5,
    unitTitle: 'Collections, JDBC & Application Project',
    topic: 'Integrated Capstone Application',
    title: 'Integrated Object-Oriented Capstone: Student Records Management System ⭐',
    icon: '🎓',
    flagship: true,
    shortDescription: 'End-to-end OOP capstone integrating Classes, Inheritance, Encapsulation, Custom Exceptions, Collections (ArrayList<Student>), and in-memory File/JDBC persistence for a complete academic records application.',
    learningObjectives: [
      'Design modular enterprise multi-tier architecture: Model, Service, and Repository',
      'Combine core OOP tenets: Encapsulation, Inheritance, and Polymorphism in one project',
      'Incorporate robust exception handling, generic collections, and persistence storage',
    ],
    formulaOverview: '\\text{Architecture: } \\text{Model (Student)} \\leftrightarrow \\text{Service (StudentManager)} \\leftrightarrow \\text{Repository (In-Memory DB)}',
    parameters: [
      { key: 'appAction', label: 'Application Action', type: 'select', default: 'add-student', options: [
        { label: 'Add Student (with GPA Validation)', value: 'add-student' },
        { label: 'Sort Students by GPA (Comparator)', value: 'sort-students' },
        { label: 'Export Records (Simulated File Stream)', value: 'export-file' },
      ]},
    ],
    metrics: [
      { key: 'activeRecordsCount', label: 'Total Students', unit: '' },
      { key: 'oopPrinciplesVerified', label: 'OOP Tenets', unit: '/6' },
      { key: 'systemStatus', label: 'System Health', unit: '' },
    ],
  }),
];
