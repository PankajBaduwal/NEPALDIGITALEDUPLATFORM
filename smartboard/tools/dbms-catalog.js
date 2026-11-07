/**
 * dbms-catalog.js
 * Database Management Systems (U25CS401 / U21CS302 / U21IT302) — 18 Simulations Catalog
 * Regulation R2025 CBCS · Semester III · PCC · 3 Credits · 45 Contact Periods
 *
 * 5 Curriculum Units:
 * Unit I:   Database Architecture & Data Modeling (Sims 1-4)
 * Unit II:  Relational Model & Relational Algebra (Sims 5-8)
 * Unit III: SQL Query Language & Schema Operations (Sims 9-12)
 * Unit IV:  Functional Dependencies & Normalization (Sims 13-15)
 * Unit V:   Transaction Management, Concurrency & Recovery (Sims 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduverseDBMSCatalog = exp;
  if (typeof window !== 'undefined') window.EduverseDBMSCatalog = exp;
  if (typeof global !== 'undefined') global.EduverseDBMSCatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Database Architecture & Data Modeling', code: 'UNIT I' },
    { number: 2, title: 'Relational Model & Relational Algebra', code: 'UNIT II' },
    { number: 3, title: 'SQL Query Language & Schema Operations', code: 'UNIT III' },
    { number: 4, title: 'Functional Dependencies & Normalization', code: 'UNIT IV' },
    { number: 5, title: 'Transaction Management, Concurrency & Recovery', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — DATABASE ARCHITECTURE & DATA MODELING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs401-db-architecture',
      unit: 1,
      unitTitle: 'Database Architecture & Data Modeling',
      topic: 'Three-Schema Architecture & Data Independence',
      title: 'Three-Schema ANSI/SPARC Architecture & Data Independence Lab ⭐ (Flagship)',
      icon: '🏛️',
      flagship: true,
      description: 'Explore the 3-tier ANSI/SPARC database architecture: External (User Views), Conceptual (Logical Schema), and Internal (Physical Storage/B-Trees). Understand physical and logical data independence through real-time schema mutations.',
      formula: '\\text{Physical Data Independence: Conceptual} \\leftrightarrow \\text{Internal Mapping} \\quad | \\quad \\text{Logical Data Independence: External} \\leftrightarrow \\text{Conceptual Mapping}',
      defaultParams: { activeLayer: 'all', dataIndependenceMode: 'physical', indexType: 'B-Tree' },
      challenge: {
        goal: 'Alter internal file clustering or index type without modifying conceptual schemas or breaking external views.',
        expectedResult: 'Physical Data Independence Verified: 0 query view rewrites needed.'
      }
    },
    {
      id: 'u25cs401-er-modeling',
      unit: 1,
      unitTitle: 'Database Architecture & Data Modeling',
      topic: 'Entity-Relationship (ER) Modeling',
      title: 'Entity-Relationship (ER) Modeling & Cardinality Lab ⭐ (Flagship)',
      icon: '📊',
      flagship: true,
      description: 'Construct interactive ER diagrams with Strong Entities, Weak Entities, Identifying Relationships, Multi-valued Attributes, and strict Cardinality (1:1, 1:N, M:N) and Participation (Total vs Partial) constraints.',
      formula: '\\text{Min-Max Constraint: } (\\min, \\max) \\in \\{0, 1, \\dots, N\\} \\quad | \\quad \\text{Weak Entity Discriminator: } \\text{Primary Key} = \\text{Owner Key} \\cup \\text{Partial Key}',
      defaultParams: { scenario: 'university', showParticipation: true, showWeakEntities: true },
      challenge: {
        goal: 'Design an ER schema for a Department-Course-Section system ensuring Sections depend on Courses as weak entities.',
        expectedResult: 'Section weak entity identified with double rectangle and dashed partial key.'
      }
    },
    {
      id: 'u25cs401-er-to-relational',
      unit: 1,
      unitTitle: 'Database Architecture & Data Modeling',
      topic: 'ER-to-Relational Mapping',
      title: 'ER-to-Relational Schema Mapping Laboratory',
      icon: '🔄',
      description: 'Step-by-step transformation of conceptual ER diagrams into normalized relational tables, demonstrating foreign key placement in 1:1, 1:N relationships and junction table synthesis for M:N relationships.',
      formula: '\\text{1:N Mapping: Embed } \\text{PK}_{1} \\text{ as FK in } N \\text{ table} \\quad | \\quad \\text{M:N: Bridge Table } R(PK_A, PK_B, \\text{attr})',
      defaultParams: { relationshipType: 'many-to-many', entityA: 'Student', entityB: 'Course' },
      challenge: {
        goal: 'Map an M:N enrollment relationship and determine primary keys of the resulting relational tables.',
        expectedResult: 'Composite Primary Key (student_id, course_id) in junction relation.'
      }
    },
    {
      id: 'u25cs401-keys-integrity',
      unit: 1,
      unitTitle: 'Database Architecture & Data Modeling',
      topic: 'Keys & Integrity Constraints',
      title: 'Relational Keys & Integrity Constraints Playground',
      icon: '🔑',
      description: 'Interactive laboratory for Superkeys, Candidate Keys, Primary Keys, and Foreign Keys. Test Entity Integrity (No NULL primary key) and Referential Integrity with CASCADE, SET NULL, and RESTRICT triggers.',
      formula: '\\text{Entity Integrity: } \\forall A \\in PK(R), \\, t[A] \\ne \\text{NULL} \\quad | \\quad \\text{Referential Integrity: } t_1[FK] = t_2[PK] \\lor t_1[FK] = \\text{NULL}',
      defaultParams: { constraintType: 'foreign-key', onUpdateAction: 'CASCADE', onDeleteAction: 'RESTRICT' },
      challenge: {
        goal: 'Trigger a foreign key violation by inserting a child tuple referencing a nonexistent parent ID and observe enforcement.',
        expectedResult: 'Constraint violation rejected: Foreign Key reference does not exist.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — RELATIONAL MODEL & RELATIONAL ALGEBRA
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs401-relational-algebra',
      unit: 2,
      unitTitle: 'Relational Model & Relational Algebra',
      topic: 'Relational Algebra Operators',
      title: 'Relational Algebra Fundamental Operators Lab ⭐ (Flagship)',
      icon: '📐',
      flagship: true,
      description: 'Evaluate procedural relational algebra queries step-by-step: Selection (σ), Projection (π), Cartesian Product (×), Union (∪), Set Difference (−), Intersection (∩), and Rename (ρ) on live relations with visual row highlights.',
      formula: '\\sigma_{p}(R) = \\{ t \\in R \\mid p(t) \\} \\quad | \\quad \\pi_{A_1, \\dots, A_k}(R) = \\{ t[A_1, \\dots, A_k] \\mid t \\in R \\}',
      defaultParams: { operator: 'select', predicate: 'dept = "CS"', projectionCols: 'name, gpa' },
      challenge: {
        goal: 'Formulate an expression π_{name}(σ_{gpa > 3.5}(Students)) and verify the resulting projection row count.',
        expectedResult: 'Exact filtered and projected set with duplicates automatically eliminated.'
      }
    },
    {
      id: 'u25cs401-joins-explorer',
      unit: 2,
      unitTitle: 'Relational Model & Relational Algebra',
      topic: 'Relational Join Operations',
      title: 'Relational Join Operations & Outer Joins Explorer',
      icon: '🔗',
      description: 'Visual cross-matrix join builder: Natural Join (⋈), Theta Join (⋈_θ), Equi-Join, Left Outer Join (⟕), Right Outer Join (⟖), and Full Outer Join (⟗) showing matched keys and NULL preservation.',
      formula: 'R \\bowtie_{p} S = \\sigma_{p}(R \\times S) \\quad | \\quad R \\mathbin{\\unicode{x27D5}} S = (R \\bowtie S) \\cup ((R - \\pi_R(R \\bowtie S)) \\times \\{\\text{null}\\})',
      defaultParams: { joinType: 'inner', joinCondition: 'emp.dept_id = dept.id' },
      challenge: {
        goal: 'Perform a Left Outer Join between Employees and Departments to detect unassigned staff with NULL department rows.',
        expectedResult: 'All employee tuples preserved; dangling references padded with NULL.'
      }
    },
    {
      id: 'u25cs401-division-set-ops',
      unit: 2,
      unitTitle: 'Relational Model & Relational Algebra',
      topic: 'Relational Division & Set Compatibility',
      title: 'Relational Division & Set Compatibility Lab',
      icon: '➗',
      description: 'Explore the Universal Division operator (R ÷ S) for "all-matching" queries (e.g. students who took all required courses). Test Union Compatibility requirements (identical degree and compatible attribute domains).',
      formula: 'R(A, B) \\div S(B) = \\pi_A(R) - \\pi_A((\\pi_A(R) \\times S) - R)',
      defaultParams: { operation: 'division', relationA: 'CompletedCourses', relationB: 'CoreRequirements' },
      challenge: {
        goal: 'Compute R ÷ S to isolate students who completed every required core module.',
        expectedResult: 'Output yields students whose course subset contains the entirety of S.'
      }
    },
    {
      id: 'u25cs401-relational-calculus',
      unit: 2,
      unitTitle: 'Relational Model & Relational Algebra',
      topic: 'Relational Calculus',
      title: 'Tuple & Domain Relational Calculus Visualizer',
      icon: '🧮',
      description: 'Interactive non-procedural query evaluation: Tuple Relational Calculus (TRC) and Domain Relational Calculus (DRC) using first-order predicate logic, existential (∃) and universal (∀) quantifiers.',
      formula: '\\{ t \\mid P(t) \\} \\quad | \\quad \\{ \\langle x_1, x_2, \\dots, x_n \\rangle \\mid P(x_1, x_2, \\dots, x_n) \\}',
      defaultParams: { calculusType: 'TRC', quantifier: 'exists', formula: 't in Students and t.credits >= 60' },
      challenge: {
        goal: 'Evaluate the TRC query { t | t ∈ Students ∧ (∃s ∈ Grades)(s.sid = t.id ∧ s.grade = "A") }.',
        expectedResult: 'Set of all student tuples holding at least one A grade.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — SQL QUERY LANGUAGE & SCHEMA OPERATIONS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs401-sql-query-builder',
      unit: 3,
      unitTitle: 'SQL Query Language & Schema Operations',
      topic: 'DDL & DML Safe Query Sandbox',
      title: 'SQL DDL & DML Interactive Query Sandbox ⭐ (Flagship)',
      icon: '💻',
      flagship: true,
      description: 'Sandboxed educational SQL engine running entirely in-memory: execute CREATE TABLE, INSERT INTO, SELECT, UPDATE, DELETE with instantaneous table updates and visual syntax parsing.',
      formula: '\\text{DML: } \\text{SELECT } A_1, \\dots \\text{ FROM } R \\text{ WHERE } P \\quad | \\quad \\text{DDL: } \\text{CREATE TABLE } T (c_1 \\, T_1 \\, \\text{PRIMARY KEY})',
      defaultParams: { queryPreset: 'simple-select', sqlText: 'SELECT id, name, dept, gpa FROM students WHERE gpa >= 3.5' },
      challenge: {
        goal: 'Write a query to update employee salary by 10% for the "Engineering" department and view affected rows.',
        expectedResult: 'UPDATE employees SET salary = salary * 1.10 WHERE department = "Engineering";'
      }
    },
    {
      id: 'u25cs401-select-execution-tracer',
      unit: 3,
      unitTitle: 'SQL Query Language & Schema Operations',
      topic: 'Logical Query Processing',
      title: 'Logical Query Processing & Order of Execution Tracer',
      icon: '⏱️',
      description: 'Trace the 8-stage logical SQL execution pipeline: 1. FROM/JOIN → 2. WHERE → 3. GROUP BY → 4. HAVING → 5. SELECT → 6. DISTINCT → 7. ORDER BY → 8. LIMIT. Understand why WHERE cannot access SELECT aliases.',
      formula: '\\text{Evaluation Order: } \\text{FROM} \\to \\text{WHERE} \\to \\text{GROUP BY} \\to \\text{HAVING} \\to \\text{SELECT} \\to \\text{ORDER BY}',
      defaultParams: { currentStage: 1, activeClause: 'FROM' },
      challenge: {
        goal: 'Identify why a WHERE clause cannot filter on `SUM(amount)` or column aliases declared in SELECT.',
        expectedResult: 'WHERE evaluates before GROUP BY and SELECT in the logical processing pipeline.'
      }
    },
    {
      id: 'u25cs401-aggregates-group-by',
      unit: 3,
      unitTitle: 'SQL Query Language & Schema Operations',
      topic: 'Aggregate Functions & Grouping',
      title: 'Aggregates, GROUP BY & HAVING Clause Explorer',
      icon: '📈',
      description: 'Partition records dynamically into groups and compute vector aggregate summaries: COUNT(), SUM(), AVG(), MIN(), and MAX(). Filter grouped buckets using the HAVING clause versus pre-filtering with WHERE.',
      formula: '\\text{Vector Aggregation: } \\gamma_{\\text{group\\_attrs}, \\, \\text{agg\\_func}(A)}(R) \\quad | \\quad \\text{HAVING: } \\sigma_{\\text{agg\\_cond}}(\\text{Buckets})',
      defaultParams: { groupByColumn: 'department', aggFunction: 'AVG', aggTarget: 'salary', havingCondition: 'AVG(salary) > 60000' },
      challenge: {
        goal: 'Group employees by department, compute average salary, and filter for departments having more than 3 staff members.',
        expectedResult: 'SELECT dept, COUNT(*), AVG(salary) FROM emp GROUP BY dept HAVING COUNT(*) > 3;'
      }
    },
    {
      id: 'u25cs401-subqueries-views',
      unit: 3,
      unitTitle: 'SQL Query Language & Schema Operations',
      topic: 'Subqueries & Views',
      title: 'Nested Subqueries, Correlated Queries & Views Lab',
      icon: '🪟',
      description: 'Analyze single-row, multi-row (IN, ANY, ALL), and correlated subqueries (EXISTS, NOT EXISTS) where the inner query depends on the outer tuple. Compare logical Views with physical base tables.',
      formula: '\\text{Correlated: } \\forall t_{\\text{outer}} \\in R, \\, \\text{Execute Inner}(t_{\\text{outer}}) \\quad | \\quad \\text{View: Virtual named relation defined by query}',
      defaultParams: { subqueryType: 'correlated-exists', outerTable: 'departments', innerTable: 'employees' },
      challenge: {
        goal: 'Find all departments that currently have no enrolled employees using a NOT EXISTS correlated subquery.',
        expectedResult: 'SELECT * FROM depts d WHERE NOT EXISTS (SELECT 1 FROM emps e WHERE e.dept_id = d.id);'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — FUNCTIONAL DEPENDENCIES & NORMALIZATION
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs401-functional-dependencies',
      unit: 4,
      unitTitle: 'Functional Dependencies & Normalization',
      topic: 'Functional Dependencies & Closure',
      title: 'Functional Dependencies & Attribute Closure (X+) Lab ⭐ (Flagship)',
      icon: '🧬',
      flagship: true,
      description: 'Given a relational schema R and a set of Functional Dependencies F, compute the attribute closure X+ step-by-step using Armstrong’s Axioms (Reflexivity, Augmentation, Transitivity) and test FD validity.',
      formula: 'X^{(0)} = X, \\quad X^{(i+1)} = X^{(i)} \\cup \\{ Y \\mid (W \\to Y) \\in F \\land W \\subseteq X^{(i)} \\}',
      defaultParams: { attributes: 'A, B, C, D, E', fds: 'A->BC, CD->E, B->D', testAttribute: 'A' },
      challenge: {
        goal: 'Compute the attribute closure for {A} under F = { A -> BC, CD -> E, B -> D } and determine if A is a superkey.',
        expectedResult: '{A}+ = {A, B, C, D, E}. Since closure covers all attributes of R, A is a superkey.'
      }
    },
    {
      id: 'u25cs401-candidate-keys',
      unit: 4,
      unitTitle: 'Functional Dependencies & Normalization',
      topic: 'Candidate Keys & Minimal Cover',
      title: 'Candidate Key Finder & Minimal Cover Algorithm',
      icon: '🔐',
      description: 'Derive all minimal Candidate Keys using attribute classification (essential left-hand side attributes vs RHS attributes). Compute canonical Minimal Covers: singleton right-hand sides, extraneous attribute removal, and redundant FD pruning.',
      formula: '\\text{Candidate Key } K: K^+ = R \\land \\forall A \\in K, (K - \\{A\\})^+ \\ne R \\quad | \\quad F_{\\text{min}} \\equiv F',
      defaultParams: { schemaAttrs: 'R(A, B, C, D)', fds: 'AB->C, C->D, D->A' },
      challenge: {
        goal: 'Find all candidate keys of R(A, B, C, D) with F = { AB -> C, C -> D, D -> A }.',
        expectedResult: 'Candidate Keys: {AB}, {BC}, {BD}.'
      }
    },
    {
      id: 'u25cs401-normalization-workshop',
      unit: 4,
      unitTitle: 'Functional Dependencies & Normalization',
      topic: 'Normalization 1NF to BCNF',
      title: 'Database Normalization & Decomposition Workshop (1NF → BCNF) ⭐ (Flagship)',
      icon: '🧱',
      flagship: true,
      description: 'Detect update, insertion, and deletion anomalies. Decompose relations progressively through 1NF (atomic values), 2NF (remove partial dependencies), 3NF (remove transitive dependencies), and BCNF. Verify Lossless-Join and Dependency Preservation.',
      formula: '\\text{2NF: No partial key } \\to \\text{non-prime} \\quad | \\quad \\text{3NF: } X \\to Y \\implies X \\text{ superkey } \\lor Y \\text{ prime} \\quad | \\quad \\text{BCNF: } X \\text{ superkey}',
      defaultParams: { targetNormalForm: '3NF', relationPreset: 'student-advisor' },
      challenge: {
        goal: 'Decompose R(Student, Course, Instructor, Room) with FDs { Student, Course -> Instructor; Instructor -> Room } into BCNF.',
        expectedResult: 'Decomposed into R1(Instructor, Room) and R2(Student, Course, Instructor). Lossless join confirmed.'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — TRANSACTION MANAGEMENT, CONCURRENCY & RECOVERY
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs401-acid-transaction-states',
      unit: 5,
      unitTitle: 'Transaction Management, Concurrency & Recovery',
      topic: 'ACID Properties & States',
      title: 'ACID Properties & Transaction State Machine Lab',
      icon: '🛡️',
      description: 'Interactive state transition engine: Active → Partially Committed → Committed, and Active → Failed → Aborted (Rollback). Test Atomicity, Consistency, Isolation, and Durability in simulated banking balance transfers.',
      formula: '\\text{States: Active} \\to \\text{Partially Committed} \\to \\text{Committed} \\quad | \\quad \\text{Active} \\to \\text{Failed} \\to \\text{Aborted}',
      defaultParams: { transactionScenario: 'bank-transfer', failurePoint: 'after-debit', simulateCrash: false },
      challenge: {
        goal: 'Simulate a power failure after debiting Account A but before crediting Account B; observe rollback to maintain Atomicity.',
        expectedResult: 'Transaction enters Failed → Aborted; WAL log triggers UNDO to restore initial balance.'
      }
    },
    {
      id: 'u25cs401-serializability-conflict',
      unit: 5,
      unitTitle: 'Transaction Management, Concurrency & Recovery',
      topic: 'Conflict Serializability & Schedules',
      title: 'Conflict Serializability & Precedence Graph Analyzer ⭐ (Flagship)',
      icon: '🔀',
      flagship: true,
      description: 'Analyze interleaved concurrent execution schedules (T1, T2, T3). Detect conflicting pairs (Read-Write, Write-Read, Write-Write on identical items). Construct directed Precedence Graphs (Serialization Graphs) and detect cycles via topological sort.',
      formula: 'I_i, I_j \\text{ conflict} \\iff \\text{Item}(I_i) = \\text{Item}(I_j) \\land (\\text{Write} \\in \\{I_i, I_j\\}) \\quad | \\quad \\text{Serializable} \\iff \\text{Precedence Graph is DAG}',
      defaultParams: { schedulePreset: 'serializable-conflict', numTransactions: 2 },
      challenge: {
        goal: 'Test whether schedule S = r1(X); w2(X); w1(X); commit1; commit2 is conflict serializable.',
        expectedResult: 'Cycle detected: T1 -> T2 and T2 -> T1 in Precedence Graph. Schedule is NOT conflict serializable.'
      }
    },
    {
      id: 'u25cs401-concurrency-recovery',
      unit: 5,
      unitTitle: 'Transaction Management, Concurrency & Recovery',
      topic: 'Concurrency Control & Recovery',
      title: 'Concurrency Control (2PL, Deadlock) & WAL Recovery Lab',
      icon: '🔒',
      description: 'Simulate Strict & Rigorous Two-Phase Locking (2PL growing phase vs shrinking phase), detect Deadlocks via dynamic Wait-For Graphs (WFG), and execute Write-Ahead Logging (WAL) Checkpoint recovery with REDO and UNDO passes.',
      formula: '\\text{2PL: No lock acquired after any lock released} \\quad | \\quad \\text{Recovery: UNDO(Uncommitted Active)} \\cup \\text{REDO(Committed)}',
      defaultParams: { protocol: 'strict-2pl', deadlockDetection: 'wait-for-graph', recoveryLog: 'wal-checkpoint' },
      challenge: {
        goal: 'Construct a locking schedule where T1 holds Lock-X(A) waiting for B, while T2 holds Lock-X(B) waiting for A, triggering Deadlock.',
        expectedResult: 'Cycle found in Wait-For Graph: T1 -> T2 -> T1. Victim chosen for rollback.'
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
