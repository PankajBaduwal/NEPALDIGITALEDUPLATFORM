/**
 * java-catalog.js
 * Object Oriented Programming Using Java Laboratory (U25CS311 / U21AD307 / U21CS307)
 * 18 Verified Curriculum Laboratory Experiments across 5 Units
 * Regulation R2025 CBCS · Semester III · PCC · 1.5 Credits · 30 Contact Hours
 *
 * 5 Curriculum Units / Experiment Cycles:
 * Unit I:   Java OOP Basics, Classes, Objects, Constructors & Methods (Expts 1-4)
 * Unit II:  Inheritance, Polymorphism, Interfaces & Abstract Classes (Expts 5-8)
 * Unit III: Exception Handling & Multithreaded Programming (Expts 9-11)
 * Unit IV:  Packages, File I/O Streams, Serialization & Generics (Expts 12-15)
 * Unit V:   Collections Framework, JDBC & Application Case Study (Expts 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduverseJavaCatalog = exp;
  if (typeof window !== 'undefined') window.EduverseJavaCatalog = exp;
  if (typeof global !== 'undefined') global.EduverseJavaCatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Java OOP Basics, Classes, Objects & Methods', code: 'UNIT I' },
    { number: 2, title: 'Inheritance, Polymorphism & Interfaces', code: 'UNIT II' },
    { number: 3, title: 'Exception Handling & Multithreading', code: 'UNIT III' },
    { number: 4, title: 'Packages, File Streams & Generics', code: 'UNIT IV' },
    { number: 5, title: 'Collections, JDBC & Application Project', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — JAVA OOP BASICS, CLASSES, OBJECTS & METHODS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs311-java-program-structure',
      unit: 1,
      unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
      topic: 'Java Architecture & Bytecode Tracer',
      title: 'Java Program Structure, JVM Architecture & Bytecode Tracer ⭐ (Flagship)',
      icon: '☕',
      flagship: true,
      description: 'Trace standard Java program structure from source code (.java) through the javac compiler to bytecode (.class) and execution inside the JVM (Class Loader, JVM Memory Stack/Heap, Execution Engine). Step through main() line by line.',
      formula: '\\text{Compilation: } \\text{Source.java} \\xrightarrow{\\text{javac}} \\text{Bytecode.class} \\xrightarrow{\\text{JVM}} \\text{Native Machine Code}',
      defaultParams: { activeStage: 'bytecode', classModifier: 'public', memoryInspect: 'both' },
      challenge: {
        goal: 'Trace bytecode instruction flow for System.out.println("Hello, Eduverse!") and inspect Stack and Heap allocations.',
        expectedResult: 'Bytecode invokes getstatic, ldc, invokevirtual. Constant pool holds string literal.'
      }
    },
    {
      id: 'u25cs311-classes-objects',
      unit: 1,
      unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
      topic: 'Classes, Objects & Heap Memory',
      title: 'Classes, Instance Variables, Methods & Object Heap Visualizer ⭐ (Flagship)',
      icon: '📦',
      flagship: true,
      description: 'Instantiate multiple objects from a user-configured Student/Account class. Visualize how stack references point to distinct heap object memory blocks with their own isolated instance states.',
      formula: '\\text{Heap Allocation: } \\text{Student } s_1 = \\mathbf{new} \\text{ Student}(\\dots) \\implies \\text{Stack Ref } s_1 \\to \\text{Heap Memory}[\\text{id, name, gpa}]',
      defaultParams: { className: 'Student', numInstances: 3, inspectFields: 'name, rollNo, gpa' },
      challenge: {
        goal: 'Create two Student instances with distinct names and verify that mutating s1.gpa does not affect s2.gpa.',
        expectedResult: 'Independent heap addresses verified. Objects hold separate state copies.'
      }
    },
    {
      id: 'u25cs311-constructors-this',
      unit: 1,
      unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
      topic: 'Constructors & this Reference',
      title: 'Constructor Types (Default, Parameterized, Overloaded) & this Keyword Lab',
      icon: '🏗️',
      description: 'Explore default constructors, parameterized constructors, constructor chaining via this(), and resolving instance variable shadowing with the this keyword during object initialization.',
      formula: '\\text{Constructor Chaining: } \\mathbf{this}(\\dots) \\text{ must be first statement} \\quad | \\quad \\mathbf{this}.x = x \\text{ (Shadow Resolution)}',
      defaultParams: { constructorType: 'parameterized', chainConstructor: true, shadowResolution: true },
      challenge: {
        goal: 'Configure constructor overloading for a Rectangle class supporting 0-param (default), 1-param (square), and 2-param signatures.',
        expectedResult: 'Successful invocation of this(side, side) from 1-parameter constructor.'
      }
    },
    {
      id: 'u25cs311-static-members',
      unit: 1,
      unitTitle: 'Java OOP Basics, Classes, Objects & Methods',
      topic: 'Static Variables & Methods',
      title: 'Static Variables, Static Methods & Class vs Instance Memory Explorer',
      icon: '⚡',
      description: 'Contrast static (class-level) variables stored in the Metaspace/Method Area with instance variables in the Heap. Observe how all instances share a single static counter variable.',
      formula: '\\text{Shared State: } \\forall i, \\; \\text{instance}_i.\\text{count} \\equiv \\text{ClassName}.\\text{count} \\in \\text{Metaspace}',
      defaultParams: { staticVar: 'collegeName', sharedCounter: true, invokeViaClass: true },
      challenge: {
        goal: 'Instantiate 4 objects and demonstrate that incrementing a static object counter reflects across all instances.',
        expectedResult: 'Student.count equals 4 across s1, s2, s3, and s4 without separate storage.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — INHERITANCE, POLYMORPHISM & INTERFACES
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs311-inheritance-super',
      unit: 2,
      unitTitle: 'Inheritance, Polymorphism & Interfaces',
      topic: 'Class Inheritance & super Keyword',
      title: 'Class Inheritance Hierarchy & super Constructor/Method Lab ⭐ (Flagship)',
      icon: '🌳',
      flagship: true,
      description: 'Construct single and multilevel inheritance hierarchies (e.g. Person -> Employee -> Manager). Trace superclass constructor execution via super() and access overridden base methods.',
      formula: '\\text{Subclassing: } \\mathbf{class} \\; B \\; \\mathbf{extends} \\; A \\quad | \\quad \\mathbf{super}(args) \\text{ triggers base constructor execution}',
      defaultParams: { hierarchy: 'Person-Employee-Manager', callSuperMethod: true, inheritFields: true },
      challenge: {
        goal: 'Trace constructor execution order in a 3-level hierarchy (Person -> Employee -> Manager).',
        expectedResult: 'Top-down initialization: Person() runs first, followed by Employee(), then Manager().'
      }
    },
    {
      id: 'u25cs311-method-overriding-dispatch',
      unit: 2,
      unitTitle: 'Inheritance, Polymorphism & Interfaces',
      topic: 'Method Overriding & Dynamic Dispatch',
      title: 'Method Overriding & Dynamic Method Dispatch (Runtime Polymorphism) Lab ⭐ (Flagship)',
      icon: '🎭',
      flagship: true,
      description: 'Observe runtime polymorphism in action: a superclass reference variable (e.g. Animal a) holding different subclass objects (Dog, Cat) resolves method calls dynamically at runtime based on the actual object type.',
      formula: '\\text{Dynamic Dispatch: } A \\; obj = \\mathbf{new} \\; B(); \\; obj.speak() \\implies \\text{resolved to } B.speak() \\text{ via vtable}',
      defaultParams: { referenceType: 'Shape', objectType: 'Circle', dispatchMethod: 'draw' },
      challenge: {
        goal: 'Assign a Circle and a Rectangle object to an array of Shape references and execute draw() polymorphically.',
        expectedResult: 'Runtime vtable lookups invoke Circle.draw() and Rectangle.draw() correctly.'
      }
    },
    {
      id: 'u25cs311-abstract-classes',
      unit: 2,
      unitTitle: 'Inheritance, Polymorphism & Interfaces',
      topic: 'Abstract Classes & Methods',
      title: 'Abstract Classes, Pure Abstract Methods & Concrete Extension Lab',
      icon: '📐',
      description: 'Explore abstract base classes that cannot be directly instantiated. Trace mandatory implementation of pure abstract methods in concrete subclasses while inheriting common concrete methods.',
      formula: '\\mathbf{abstract} \\; \\mathbf{class} \\; A \\; \\{ \\mathbf{abstract} \\; \\mathbf{void} \\; m(); \\} \\implies \\text{Concrete } B \\; \\mathbf{must} \\text{ implement } m()',
      defaultParams: { abstractClass: 'BankAccount', concreteClass: 'SavingsAccount', abstractMethod: 'calculateInterest' },
      challenge: {
        goal: 'Demonstrate compile-time error when attempting to instantiate an abstract class directly (new BankAccount()).',
        expectedResult: 'Compilation Error: BankAccount is abstract; cannot be instantiated.'
      }
    },
    {
      id: 'u25cs311-interfaces-multiple',
      unit: 2,
      unitTitle: 'Inheritance, Polymorphism & Interfaces',
      topic: 'Interfaces & Multiple Implementation',
      title: 'Interfaces, Multiple Implementation & Default Methods Explorer',
      icon: '🔌',
      description: 'Simulate multiple interface implementation (implements Printable, Showable). Explore Java 8+ default methods, static interface methods, and resolving default method diamond conflicts.',
      formula: '\\mathbf{class} \\; C \\; \\mathbf{implements} \\; I_1, I_2 \\quad | \\quad I_1.\\mathbf{super}.method() \\text{ (Diamond Conflict Resolution)}',
      defaultParams: { interfaceA: 'Printable', interfaceB: 'Serializable', conflictResolution: 'override' },
      challenge: {
        goal: 'Resolve a default method collision where both InterfaceA and InterfaceB define default void log().',
        expectedResult: 'Subclass explicitly overrides log() and delegates via InterfaceA.super.log().'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — EXCEPTION HANDLING & MULTITHREADING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs311-exception-handling',
      unit: 3,
      unitTitle: 'Exception Handling & Multithreading',
      topic: 'try-catch-finally & throw/throws',
      title: 'Exception Handling (try-catch-finally, throw, throws) Tracer ⭐ (Flagship)',
      icon: '🛡️',
      flagship: true,
      description: 'Trace runtime exceptions (ArithmeticException / by zero, ArrayIndexOutOfBoundsException, NullPointerException). Visualize stack unwinding, matching catch blocks, and guaranteed finally block execution.',
      formula: '\\text{Flow: } \\mathbf{try} \\to \\text{Throw Exception} \\to \\text{Match Catch Block} \\to \\mathbf{finally} \\; (\\text{Guaranteed Execution})',
      defaultParams: { exceptionType: 'ArithmeticException', catchHandled: true, finallyPresent: true },
      challenge: {
        goal: 'Simulate an unhandled exception vs handled exception and observe program termination behavior.',
        expectedResult: 'Handled exception executes catch and finally, then resumes normal execution.'
      }
    },
    {
      id: 'u25cs311-custom-exceptions',
      unit: 3,
      unitTitle: 'Exception Handling & Multithreading',
      topic: 'User-Defined Custom Exceptions',
      title: 'User-Defined Custom Checked & Unchecked Exceptions Lab',
      icon: '⚠️',
      description: 'Design and throw custom domain exceptions (e.g. InsufficientFundsException, InvalidAgeException extending Exception or RuntimeException). Propagate errors with throws clauses and exception messages.',
      formula: '\\mathbf{class} \\; \\text{CustomEx } \\mathbf{extends} \\; \\text{Exception} \\quad | \\quad \\mathbf{throw} \\; \\mathbf{new} \\; \\text{CustomEx}(\\text{"Error message"});',
      defaultParams: { exceptionClass: 'InsufficientFundsException', balance: 500, withdrawAmount: 1200 },
      challenge: {
        goal: 'Trigger InsufficientFundsException when withdrawing $1200 from an account holding $500.',
        expectedResult: 'Custom exception thrown with descriptive message and captured in catch block.'
      }
    },
    {
      id: 'u25cs311-multithreading-sync',
      unit: 3,
      unitTitle: 'Exception Handling & Multithreading',
      topic: 'Multithreading & Synchronization',
      title: 'Multithreading Lifecycle, Thread Synchronization & Inter-Thread Communication Lab ⭐ (Flagship)',
      icon: '🧵',
      flagship: true,
      description: 'Simulate concurrent thread lifecycles: New, Runnable, Blocked, Waiting, Timed Waiting, Terminated. Observe race conditions on shared counters and fix them using synchronized blocks and wait()/notify().',
      formula: '\\text{States: New} \\to \\text{Runnable} \\rightleftarrows \\text{Blocked/Waiting} \\to \\text{Terminated} \\quad | \\quad \\mathbf{synchronized}(\\text{lock})',
      defaultParams: { numThreads: 2, useSynchronization: true, bufferCapacity: 5 },
      challenge: {
        goal: 'Run 2 threads incrementing a shared counter without synchronization to observe race conditions, then enable synchronized to fix it.',
        expectedResult: 'Unsynchronized count is corrupted (< 2000). Synchronized count reaches exactly 2000.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — PACKAGES, FILE STREAMS & GENERICS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs311-packages-access',
      unit: 4,
      unitTitle: 'Packages, File Streams & Generics',
      topic: 'Packages & Access Modifiers',
      title: 'Java Packages, Imports & Access Modifiers (public, protected, default, private) Matrix',
      icon: '📦',
      description: 'Interactive 4x4 visibility matrix for access specifiers across: same class, same package subclass, same package non-subclass, different package subclass, and different package non-subclass.',
      formula: '\\text{Visibility Scope: } \\text{private} \\subset \\text{default (package-private)} \\subset \\text{protected} \\subset \\text{public}',
      defaultParams: { modifier: 'protected', targetScope: 'different-package-subclass' },
      challenge: {
        goal: 'Verify whether a protected member can be accessed from a subclass in a different package vs a non-subclass in a different package.',
        expectedResult: 'Protected is accessible in different-package subclass via inheritance, but rejected in non-subclass.'
      }
    },
    {
      id: 'u25cs311-file-streams-io',
      unit: 4,
      unitTitle: 'Packages, File Streams & Generics',
      topic: 'Byte & Character Streams File I/O',
      title: 'Byte Streams & Character Streams File I/O Sandbox ⭐ (Flagship)',
      icon: '📂',
      flagship: true,
      description: 'In-memory safe file stream lab: compare 8-bit Byte Streams (FileInputStream/FileOutputStream) with 16-bit Character Streams (FileReader/FileWriter, BufferedReader). Read and write fictional text files safely.',
      formula: '\\text{Byte Stream: } 8\\text{-bit bytes (raw binary)} \\quad | \\quad \\text{Character Stream: } 16\\text{-bit Unicode (UTF-16 text)}',
      defaultParams: { streamType: 'character-buffered', operation: 'write-and-read', filename: 'student_records.txt' },
      challenge: {
        goal: 'Write 3 student lines using BufferedReader and PrintWriter and read them back into memory.',
        expectedResult: 'Buffered stream flushes and reads 3 lines cleanly without encoding errors.'
      }
    },
    {
      id: 'u25cs311-object-serialization',
      unit: 4,
      unitTitle: 'Packages, File Streams & Generics',
      topic: 'Object Serialization & transient',
      title: 'Object Serialization, Deserialization & transient Keyword Visualizer',
      icon: '💾',
      description: 'Serialize a Java object graph to a binary byte stream via ObjectOutputStream and reconstruct it via ObjectInputStream. Observe how transient fields (e.g. password) are omitted and reset to default values.',
      formula: '\\text{Object Serialization: } \\text{Object} \\xrightarrow{\\text{ObjectOutputStream}} \\text{Byte Stream} \\quad | \\quad \\mathbf{transient} \\implies \\text{omitted}',
      defaultParams: { serializePassword: false, transientField: 'pinCode' },
      challenge: {
        goal: 'Serialize a UserAccount object with a transient pinCode and verify its value upon deserialization.',
        expectedResult: 'Deserialized pinCode resets to default 0/null, proving sensitive data was not persisted.'
      }
    },
    {
      id: 'u25cs311-generics-type-safety',
      unit: 4,
      unitTitle: 'Packages, File Streams & Generics',
      topic: 'Generics & Type Safety',
      title: 'Generic Classes, Methods & Type Parameter Erasure Explorer',
      icon: '🧬',
      description: 'Explore compile-time type safety with Generics: Container<T>, bounded wildcards (<? extends Number>), and type erasure where the Java compiler replaces generic type parameters with Object or bound types.',
      formula: '\\text{Generic Class: } \\mathbf{class} \\; \\text{Box}\\langle T \\rangle \\quad | \\quad \\text{Type Erasure: } \\text{Box}\\langle T \\rangle \\to \\text{Box}\\langle \\text{Object} \\rangle',
      defaultParams: { typeParameter: 'Integer', useBoundedWildcard: true, boundType: 'Number' },
      challenge: {
        goal: 'Attempt to add a String to a Box<Integer> and observe compile-time type mismatch detection.',
        expectedResult: 'Compiler error: incompatible types: String cannot be converted to Integer.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — COLLECTIONS, JDBC & APPLICATION PROJECT
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs311-collections-framework',
      unit: 5,
      unitTitle: 'Collections, JDBC & Application Project',
      topic: 'Collections Framework (List, Set, Map)',
      title: 'Java Collections Framework (ArrayList, LinkedList, HashSet, HashMap) Lab ⭐ (Flagship)',
      icon: '📚',
      flagship: true,
      description: 'Interactive visualization of Java Collections: compare ArrayList (dynamic array, O(1) random access) vs LinkedList (doubly linked nodes, O(1) insertions), HashSet (hash-bucket duplicate rejection), and HashMap (key-value hashing).',
      formula: '\\text{ArrayList: } O(1) \\text{ get, } O(n) \\text{ insert} \\quad | \\quad \\text{HashMap: } \\text{bucket} = \\text{hashCode}(k) \\; \\& \\; (n-1)',
      defaultParams: { collectionType: 'ArrayList', operation: 'add', capacity: 10 },
      challenge: {
        goal: 'Add duplicate elements to an ArrayList vs a HashSet and observe the uniqueness guarantee.',
        expectedResult: 'ArrayList retains duplicates; HashSet rejects duplicates and maintains unique set.'
      }
    },
    {
      id: 'u25cs311-jdbc-database',
      unit: 5,
      unitTitle: 'Collections, JDBC & Application Project',
      topic: 'JDBC Architecture & PreparedStatement',
      title: 'In-Memory JDBC 4-Step Architecture & PreparedStatement CRUD Lab ⭐ (Flagship)',
      icon: '🗄️',
      flagship: true,
      description: 'Simulate the standard 4-step JDBC workflow: 1. Load Driver -> 2. Establish Connection -> 3. Execute PreparedStatement -> 4. Process ResultSet against an in-memory synthetic relational database.',
      formula: '\\text{JDBC Steps: } \\text{DriverManager.getConnection()} \\to \\text{PreparedStatement} \\to \\text{executeQuery()} \\to \\text{ResultSet}',
      defaultParams: { queryType: 'SELECT', tableTarget: 'STUDENTS', usePreparedStatement: true },
      challenge: {
        goal: 'Execute a parameterized PreparedStatement INSERT into the synthetic database and verify ResultSet extraction.',
        expectedResult: 'PreparedStatement compiles with ? placeholders; 1 row inserted and verified via SELECT.'
      }
    },
    {
      id: 'u25cs311-student-mgmt-capstone',
      unit: 5,
      unitTitle: 'Collections, JDBC & Application Project',
      topic: 'Integrated Capstone Application',
      title: 'Integrated Object-Oriented Capstone: Student Records Management System ⭐ (Flagship)',
      icon: '🎓',
      flagship: true,
      description: 'End-to-end OOP capstone integrating Classes, Inheritance, Encapsulation, Custom Exceptions, Collections (ArrayList<Student>), and in-memory File/JDBC persistence for a complete academic records application.',
      formula: '\\text{Architecture: } \\text{Model (Student)} \\leftrightarrow \\text{Service (StudentManager)} \\leftrightarrow \\text{Repository (In-Memory DB)}',
      defaultParams: { appAction: 'add-student', filterDept: 'ALL', sortCriteria: 'gpa' },
      challenge: {
        goal: 'Add a new student, attempt to enter an invalid negative GPA to trigger validation, and view the sorted honors list.',
        expectedResult: 'Invalid GPA triggers InvalidDataException; valid student is added to ArrayList and rendered.'
      }
    }
  ];

  return {
    UNITS: UNITS,
    SIMULATIONS: SIMULATIONS,
    getSimulationById: function (id) {
      return SIMULATIONS.find(function (s) { return s.id === id; });
    },
    getSimulationsByUnit: function (unitNum) {
      return SIMULATIONS.filter(function (s) { return s.unit === unitNum; });
    }
  };
}));
