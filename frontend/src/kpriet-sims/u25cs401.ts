import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25CS401 / U21CS302 / U21IT302
 * Course Name: Database Management Systems
 * Semester: III | Category: PCC | Credits: 3 | Regulation: R2025 CBCS
 * Common to: IT, CSE, AI&DS, AI&ML, Cyber Security (SC), CSBS (CB)
 *
 * Uses isolated Smart Board Database Engine architecture (boardEngine: 'dbms')
 * Dynamic routing via smartboardPresetKey to dbms-simulation.html and tools/dbms-simulation.js.
 */
export const U25CS401_SUBJECT_KEYWORDS = [
  'database management systems',
  'database management system',
  'database management',
  'database systems',
  'u25cs401',
  'u21cs302',
  'u21it302',
  'cs401',
  'cs302',
  'it302',
  'dbms',
  'sql',
  'rdbms',
];

function u25dbmsSimulation(def: {
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
    boardEngine: 'dbms' as any,
    domain: 'COMPUTER_SCIENCE',
    category: 'database management systems',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25CS401_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with interactive relational table visualizers, ER diagram designers, attribute closure solvers, conflict serializability precedence graphs, and an integrated Database Systems AI assistant.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    flagship: def.flagship,
    tags: ['U25CS401', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Database Management Systems', 'DBMS', 'SQL', 'R2025 CBCS'],
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

export const U25CS401_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — DATABASE ARCHITECTURE & DATA MODELING
  // ═══════════════════════════════════════════════════════════════════════════
  u25dbmsSimulation({
    id: 'u25cs401-db-architecture',
    unit: 1,
    unitTitle: 'Database Architecture & Data Modeling',
    topic: 'Three-Schema Architecture & Data Independence',
    title: 'Three-Schema ANSI/SPARC Architecture & Data Independence Lab ⭐',
    icon: '🏛️',
    flagship: true,
    shortDescription: 'Explore the 3-tier ANSI/SPARC database architecture: External (User Views), Conceptual (Logical Schema), and Internal (Physical Storage/B-Trees). Understand physical and logical data independence through real-time schema mutations.',
    learningObjectives: [
      'Understand the roles of External, Conceptual, and Internal levels in the ANSI/SPARC architecture',
      'Distinguish between Physical Data Independence (internal storage changes) and Logical Data Independence (conceptual schema evolution)',
      'Trace how database queries map downward through external-to-conceptual and conceptual-to-internal translation layers',
    ],
    formulaOverview: '\\text{Physical Data Independence: Conceptual} \\leftrightarrow \\text{Internal Mapping} \\quad | \\quad \\text{Logical Data Independence: External} \\leftrightarrow \\text{Conceptual Mapping}',
    parameters: [
      { key: 'activeLayer', label: 'Active Layer', type: 'select', default: 'all', options: [
        { label: 'All Levels (Full Architecture)', value: 'all' },
        { label: 'External Level (User Views)', value: 'external' },
        { label: 'Conceptual Level (Logical Relational Tables)', value: 'conceptual' },
        { label: 'Internal Level (B-Tree & Disk Blocks)', value: 'internal' },
      ]},
      { key: 'dataIndependenceMode', label: 'Independence Test', type: 'select', default: 'physical', options: [
        { label: 'Physical Data Independence (Add B+ Tree Index)', value: 'physical' },
        { label: 'Logical Data Independence (Add Attribute to Table)', value: 'logical' },
      ]},
    ],
    metrics: [
      { key: 'externalViewsCount', label: 'Views', unit: '' },
      { key: 'physicalIndexType', label: 'Index', unit: '' },
      { key: 'independenceStatus', label: 'Independence', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-er-modeling',
    unit: 1,
    unitTitle: 'Database Architecture & Data Modeling',
    topic: 'Entity-Relationship (ER) Modeling',
    title: 'Entity-Relationship (ER) Modeling & Cardinality Lab ⭐',
    icon: '📊',
    flagship: true,
    shortDescription: 'Construct interactive ER diagrams with Strong Entities, Weak Entities, Identifying Relationships, Multi-valued Attributes, and strict Cardinality (1:1, 1:N, M:N) and Participation (Total vs Partial) constraints.',
    learningObjectives: [
      'Design conceptual schemas using entities, attributes, relationships, and candidate keys',
      'Model weak entities and identifying relationships with partial discriminators',
      'Specify cardinality ratios (1:1, 1:N, M:N) and structural participation constraints',
    ],
    formulaOverview: '\\text{Min-Max Constraint: } (\\min, \\max) \\in \\{0, 1, \\dots, N\\} \\quad | \\quad \\text{Weak Entity Discriminator: } \\text{Primary Key} = \\text{Owner Key} \\cup \\text{Partial Key}',
    parameters: [
      { key: 'scenario', label: 'Domain Model', type: 'select', default: 'university', options: [
        { label: 'University (Student, Course, Department)', value: 'university' },
        { label: 'Company (Employee, Department, Project)', value: 'company' },
        { label: 'Hospital (Patient, Doctor, Ward)', value: 'hospital' },
      ]},
      { key: 'showParticipation', label: 'Show Participation', type: 'boolean', default: true },
    ],
    metrics: [
      { key: 'strongEntities', label: 'Strong Entities', unit: '' },
      { key: 'weakEntities', label: 'Weak Entities', unit: '' },
      { key: 'cardinalityRatio', label: 'Cardinality', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-er-to-relational',
    unit: 1,
    unitTitle: 'Database Architecture & Data Modeling',
    topic: 'ER-to-Relational Mapping',
    title: 'ER-to-Relational Schema Mapping Laboratory',
    icon: '🔄',
    shortDescription: 'Step-by-step transformation of conceptual ER diagrams into normalized relational tables, demonstrating foreign key placement in 1:1, 1:N relationships and junction table synthesis for M:N relationships.',
    learningObjectives: [
      'Apply standard 7-step ER-to-relational mapping algorithm rules',
      'Map 1:1, 1:N, and M:N relationships without redundant tables or orphaned foreign keys',
      'Handle multi-valued attributes and composite attributes correctly in relational schemas',
    ],
    formulaOverview: '\\text{1:N Mapping: Embed } \\text{PK}_{1} \\text{ as FK in } N \\text{ table} \\quad | \\quad \\text{M:N: Bridge Table } R(PK_A, PK_B, \\text{attr})',
    parameters: [
      { key: 'relationshipType', label: 'Relationship Type', type: 'select', default: 'many-to-many', options: [
        { label: '1:1 (Foreign Key in Total Participation Side)', value: 'one-to-one' },
        { label: '1:N (Foreign Key in N Side)', value: 'one-to-many' },
        { label: 'M:N (New Cross-Reference Bridge Table)', value: 'many-to-many' },
      ]},
    ],
    metrics: [
      { key: 'tablesGenerated', label: 'Tables Generated', unit: '' },
      { key: 'foreignKeysCount', label: 'Foreign Keys', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-keys-integrity',
    unit: 1,
    unitTitle: 'Database Architecture & Data Modeling',
    topic: 'Keys & Integrity Constraints',
    title: 'Relational Keys & Integrity Constraints Playground',
    icon: '🔑',
    shortDescription: 'Interactive laboratory for Superkeys, Candidate Keys, Primary Keys, and Foreign Keys. Test Entity Integrity (No NULL primary key) and Referential Integrity with CASCADE, SET NULL, and RESTRICT triggers.',
    learningObjectives: [
      'Differentiate between superkeys, candidate keys, primary keys, and alternate keys',
      'Enforce entity integrity constraints preventing NULL primary key columns',
      'Simulate referential integrity triggers (ON DELETE CASCADE, SET NULL, RESTRICT)',
    ],
    formulaOverview: '\\text{Entity Integrity: } \\forall A \\in PK(R), \\, t[A] \\ne \\text{NULL} \\quad | \\quad \\text{Referential Integrity: } t_1[FK] = t_2[PK] \\lor t_1[FK] = \\text{NULL}',
    parameters: [
      { key: 'onDeleteAction', label: 'ON DELETE Action', type: 'select', default: 'RESTRICT', options: [
        { label: 'RESTRICT (Block Parent Deletion)', value: 'RESTRICT' },
        { label: 'CASCADE (Delete Matching Child Tuples)', value: 'CASCADE' },
        { label: 'SET NULL (Nullify Child Foreign Key)', value: 'SET NULL' },
      ]},
    ],
    metrics: [
      { key: 'candidateKeysCount', label: 'Candidate Keys', unit: '' },
      { key: 'integrityStatus', label: 'Integrity Status', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — RELATIONAL MODEL & RELATIONAL ALGEBRA
  // ═══════════════════════════════════════════════════════════════════════════
  u25dbmsSimulation({
    id: 'u25cs401-relational-algebra',
    unit: 2,
    unitTitle: 'Relational Model & Relational Algebra',
    topic: 'Relational Algebra Operators',
    title: 'Relational Algebra Fundamental Operators Lab ⭐',
    icon: '📐',
    flagship: true,
    shortDescription: 'Evaluate procedural relational algebra queries step-by-step: Selection (σ), Projection (π), Cartesian Product (×), Union (∪), Set Difference (−), Intersection (∩), and Rename (ρ) on live relations with visual row highlights.',
    learningObjectives: [
      'Master the 5 fundamental relational algebra operators and derived operators',
      'Trace row filtering in Selection (σ) and column filtering with duplicate elimination in Projection (π)',
      'Construct composite relational expressions and analyze intermediate algebraic results',
    ],
    formulaOverview: '\\sigma_{p}(R) = \\{ t \\in R \\mid p(t) \\} \\quad | \\quad \\pi_{A_1, \\dots, A_k}(R) = \\{ t[A_1, \\dots, A_k] \\mid t \\in R \\}',
    parameters: [
      { key: 'operator', label: 'Algebra Operator', type: 'select', default: 'select', options: [
        { label: 'Selection: σ_{gpa ≥ 3.5}(Students)', value: 'select' },
        { label: 'Projection: π_{name, dept}(Students)', value: 'project' },
        { label: 'Cartesian Product: Students × Departments', value: 'product' },
        { label: 'Union: CS_Students ∪ IT_Students', value: 'union' },
        { label: 'Difference: All_Students - Honor_Roll', value: 'diff' },
      ]},
    ],
    metrics: [
      { key: 'inputCardinality', label: 'Input Rows', unit: '' },
      { key: 'outputCardinality', label: 'Output Rows', unit: '' },
      { key: 'outputDegree', label: 'Degree (Cols)', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-joins-explorer',
    unit: 2,
    unitTitle: 'Relational Model & Relational Algebra',
    topic: 'Relational Join Operations',
    title: 'Relational Join Operations & Outer Joins Explorer',
    icon: '🔗',
    shortDescription: 'Visual cross-matrix join builder: Natural Join (⋈), Theta Join (⋈_θ), Equi-Join, Left Outer Join (⟕), Right Outer Join (⟖), and Full Outer Join (⟗) showing matched keys and NULL preservation.',
    learningObjectives: [
      'Understand how Natural Join combines Cartesian Product with Selection and Projection',
      'Explore Outer Joins (Left, Right, Full) and understand NULL padding for non-matching records',
      'Contrast inner join selectivity with outer join data preservation properties',
    ],
    formulaOverview: 'R \\bowtie_{p} S = \\sigma_{p}(R \\times S) \\quad | \\quad R \\mathbin{\\unicode{x27D5}} S = (R \\bowtie S) \\cup ((R - \\pi_R(R \\bowtie S)) \\times \\{\\text{null}\\})',
    parameters: [
      { key: 'joinType', label: 'Join Operator', type: 'select', default: 'inner', options: [
        { label: 'Inner Natural Join (R ⋈ S)', value: 'inner' },
        { label: 'Left Outer Join (R ⟕ S)', value: 'left' },
        { label: 'Right Outer Join (R ⟖ S)', value: 'right' },
        { label: 'Full Outer Join (R ⟗ S)', value: 'full' },
      ]},
    ],
    metrics: [
      { key: 'matchedRows', label: 'Matched Rows', unit: '' },
      { key: 'nullPaddedRows', label: 'NULL Rows', unit: '' },
      { key: 'totalJoinRows', label: 'Total Rows', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-division-set-ops',
    unit: 2,
    unitTitle: 'Relational Model & Relational Algebra',
    topic: 'Relational Division & Set Compatibility',
    title: 'Relational Division & Set Compatibility Lab',
    icon: '➗',
    shortDescription: 'Explore the Universal Division operator (R ÷ S) for "all-matching" queries (e.g. students who took all required courses). Test Union Compatibility requirements (identical degree and compatible attribute domains).',
    learningObjectives: [
      'Express universal quantifier queries ("find entities associated with all of S") using relational division',
      'Verify schema union-compatibility rules before applying Set Union, Intersection, and Difference',
      'Break down R ÷ S into fundamental projection, Cartesian product, and difference operators',
    ],
    formulaOverview: 'R(A, B) \\div S(B) = \\pi_A(R) - \\pi_A((\\pi_A(R) \\times S) - R)',
    parameters: [
      { key: 'operation', label: 'Set Operation', type: 'select', default: 'division', options: [
        { label: 'Relational Division (R ÷ S)', value: 'division' },
        { label: 'Set Union (R ∪ S)', value: 'union' },
        { label: 'Set Intersection (R ∩ S)', value: 'intersection' },
        { label: 'Set Difference (R - S)', value: 'difference' },
      ]},
    ],
    metrics: [
      { key: 'divisorSize', label: 'Divisor Size', unit: '' },
      { key: 'qualifiedTuples', label: 'Qualified Tuples', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-relational-calculus',
    unit: 2,
    unitTitle: 'Relational Model & Relational Algebra',
    topic: 'Relational Calculus',
    title: 'Tuple & Domain Relational Calculus Visualizer',
    icon: '🧮',
    shortDescription: 'Interactive non-procedural query evaluation: Tuple Relational Calculus (TRC) and Domain Relational Calculus (DRC) using first-order predicate logic, existential (∃) and universal (∀) quantifiers.',
    learningObjectives: [
      'Differentiate between procedural relational algebra and declarative relational calculus',
      'Construct safe TRC expressions using existential and universal quantifiers',
      'Understand Codd’s Equivalence Theorem relating Relational Algebra, TRC, and DRC',
    ],
    formulaOverview: '\\{ t \\mid P(t) \\} \\quad | \\quad \\{ \\langle x_1, x_2, \\dots, x_n \\rangle \\mid P(x_1, x_2, \\dots, x_n) \\}',
    parameters: [
      { key: 'calculusType', label: 'Calculus Variant', type: 'select', default: 'TRC', options: [
        { label: 'Tuple Relational Calculus (TRC)', value: 'TRC' },
        { label: 'Domain Relational Calculus (DRC)', value: 'DRC' },
      ]},
    ],
    metrics: [
      { key: 'quantifiersEvaluated', label: 'Quantifiers', unit: '' },
      { key: 'tuplesSatisfied', label: 'Tuples Satisfied', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — SQL QUERY LANGUAGE & SCHEMA OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  u25dbmsSimulation({
    id: 'u25cs401-sql-query-builder',
    unit: 3,
    unitTitle: 'SQL Query Language & Schema Operations',
    topic: 'DDL & DML Safe Query Sandbox',
    title: 'SQL DDL & DML Interactive Query Sandbox ⭐',
    icon: '💻',
    flagship: true,
    shortDescription: 'Sandboxed educational SQL engine running entirely in-memory: execute CREATE TABLE, INSERT INTO, SELECT, UPDATE, DELETE with instantaneous table updates and visual syntax parsing.',
    learningObjectives: [
      'Write and test standard ANSI SQL DDL statements (CREATE, ALTER, DROP TABLE)',
      'Execute DML statements (SELECT, INSERT, UPDATE, DELETE) against sandboxed teaching data',
      'Inspect parsed syntax trees and verified execution results safely in-memory',
    ],
    formulaOverview: '\\text{DML: } \\text{SELECT } A_1, \\dots \\text{ FROM } R \\text{ WHERE } P \\quad | \\quad \\text{DDL: } \\text{CREATE TABLE } T (c_1 \\, T_1 \\, \\text{PRIMARY KEY})',
    parameters: [
      { key: 'queryPreset', label: 'SQL Query Preset', type: 'select', default: 'simple-select', options: [
        { label: 'SELECT * FROM students WHERE gpa >= 3.5', value: 'simple-select' },
        { label: 'SELECT dept, AVG(gpa) FROM students GROUP BY dept', value: 'group-select' },
        { label: 'UPDATE students SET gpa = gpa + 0.1 WHERE dept = "CS"', value: 'update-dml' },
        { label: 'DELETE FROM students WHERE gpa < 3.2', value: 'delete-dml' },
      ]},
    ],
    metrics: [
      { key: 'rowsAffected', label: 'Rows Affected', unit: '' },
      { key: 'executionTimeMs', label: 'Execution Time', unit: 'ms' },
      { key: 'securitySandboxStatus', label: 'Sandbox Isolation', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-select-execution-tracer',
    unit: 3,
    unitTitle: 'SQL Query Language & Schema Operations',
    topic: 'Logical Query Processing',
    title: 'Logical Query Processing & Order of Execution Tracer',
    icon: '⏱️',
    shortDescription: 'Trace the 8-stage logical SQL execution pipeline: 1. FROM/JOIN → 2. WHERE → 3. GROUP BY → 4. HAVING → 5. SELECT → 6. DISTINCT → 7. ORDER BY → 8. LIMIT. Understand why WHERE cannot access SELECT aliases.',
    learningObjectives: [
      'Trace the 8 stages of SQL logical query processing in their authoritative theoretical order',
      'Understand why SELECT column aliases cannot be referenced in WHERE or GROUP BY clauses',
      'Observe intermediate dataset transformations across each logical phase',
    ],
    formulaOverview: '\\text{Evaluation Order: } \\text{FROM} \\to \\text{WHERE} \\to \\text{GROUP BY} \\to \\text{HAVING} \\to \\text{SELECT} \\to \\text{ORDER BY}',
    parameters: [
      { key: 'currentStage', label: 'Evaluation Stage', type: 'select', default: '1', options: [
        { label: '1. FROM & JOIN Clauses', value: '1' },
        { label: '2. WHERE Filtering', value: '2' },
        { label: '3. GROUP BY Partitioning', value: '3' },
        { label: '4. HAVING Bucket Filter', value: '4' },
        { label: '5. SELECT Expressions', value: '5' },
        { label: '6. ORDER BY Sorting', value: '6' },
      ]},
    ],
    metrics: [
      { key: 'activeStageName', label: 'Active Clause', unit: '' },
      { key: 'tuplesRemaining', label: 'Tuples Remaining', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-aggregates-group-by',
    unit: 3,
    unitTitle: 'SQL Query Language & Schema Operations',
    topic: 'Aggregate Functions & Grouping',
    title: 'Aggregates, GROUP BY & HAVING Clause Explorer',
    icon: '📈',
    shortDescription: 'Partition records dynamically into groups and compute vector aggregate summaries: COUNT(), SUM(), AVG(), MIN(), and MAX(). Filter grouped buckets using the HAVING clause versus pre-filtering with WHERE.',
    learningObjectives: [
      'Apply standard vector aggregates: COUNT(), SUM(), AVG(), MIN(), MAX() with and without DISTINCT',
      'Partition relation tuples into discrete non-overlapping group buckets using GROUP BY',
      'Contrast pre-aggregation tuple filtering (WHERE) with post-aggregation bucket filtering (HAVING)',
    ],
    formulaOverview: '\\text{Vector Aggregation: } \\gamma_{\\text{group\\_attrs}, \\, \\text{agg\\_func}(A)}(R) \\quad | \\quad \\text{HAVING: } \\sigma_{\\text{agg\\_cond}}(\\text{Buckets})',
    parameters: [
      { key: 'aggFunction', label: 'Aggregate Function', type: 'select', default: 'AVG', options: [
        { label: 'AVG(gpa)', value: 'AVG' },
        { label: 'COUNT(*)', value: 'COUNT' },
        { label: 'MAX(gpa)', value: 'MAX' },
        { label: 'MIN(gpa)', value: 'MIN' },
      ]},
    ],
    metrics: [
      { key: 'groupsCreated', label: 'Groups Created', unit: '' },
      { key: 'groupsPassingHaving', label: 'HAVING Passed', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-subqueries-views',
    unit: 3,
    unitTitle: 'SQL Query Language & Schema Operations',
    topic: 'Subqueries & Views',
    title: 'Nested Subqueries, Correlated Queries & Views Lab',
    icon: '🪟',
    shortDescription: 'Analyze single-row, multi-row (IN, ANY, ALL), and correlated subqueries (EXISTS, NOT EXISTS) where the inner query depends on the outer tuple. Compare logical Views with physical base tables.',
    learningObjectives: [
      'Construct non-correlated subqueries returning scalar values or attribute lists (IN, ALL, ANY)',
      'Evaluate correlated subqueries executing iteratively for each outer candidate tuple',
      'Create and query virtual logical Views without duplicating physical disk records',
    ],
    formulaOverview: '\\text{Correlated: } \\forall t_{\\text{outer}} \\in R, \\, \\text{Execute Inner}(t_{\\text{outer}}) \\quad | \\quad \\text{View: Virtual named relation defined by query}',
    parameters: [
      { key: 'subqueryType', label: 'Subquery Type', type: 'select', default: 'correlated-exists', options: [
        { label: 'Correlated EXISTS Subquery', value: 'correlated-exists' },
        { label: 'Set Membership: WHERE dept IN (...)', value: 'in-subquery' },
        { label: 'Virtual View: CREATE VIEW HighAchievers', value: 'virtual-view' },
      ]},
    ],
    metrics: [
      { key: 'outerIterations', label: 'Outer Iterations', unit: '' },
      { key: 'viewUpdatable', label: 'Updatable View', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — FUNCTIONAL DEPENDENCIES & NORMALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  u25dbmsSimulation({
    id: 'u25cs401-functional-dependencies',
    unit: 4,
    unitTitle: 'Functional Dependencies & Normalization',
    topic: 'Functional Dependencies & Closure',
    title: 'Functional Dependencies & Attribute Closure (X+) Lab ⭐',
    icon: '🧬',
    flagship: true,
    shortDescription: 'Given a relational schema R and a set of Functional Dependencies F, compute the attribute closure X+ step-by-step using Armstrong’s Axioms (Reflexivity, Augmentation, Transitivity) and test FD validity.',
    learningObjectives: [
      'Master Armstrong’s Axioms: Reflexivity, Augmentation, Transitivity and secondary inference rules',
      'Compute the complete attribute closure X+ step-by-step in O(|F| · |R|) time complexity',
      'Determine whether an attribute set X is a superkey or candidate key of relation schema R',
    ],
    formulaOverview: 'X^{(0)} = X, \\quad X^{(i+1)} = X^{(i)} \\cup \\{ Y \\mid (W \\to Y) \\in F \\land W \\subseteq X^{(i)} \\}',
    parameters: [
      { key: 'attributes', label: 'Relation Attributes', type: 'select', default: 'A, B, C, D, E', options: [
        { label: 'R(A, B, C, D, E)', value: 'A, B, C, D, E' },
        { label: 'R(A, B, C, D)', value: 'A, B, C, D' },
      ]},
      { key: 'testAttribute', label: 'Test Closure of Attr', type: 'select', default: 'A', options: [
        { label: '{A}+ Closure', value: 'A' },
        { label: '{B}+ Closure', value: 'B' },
        { label: '{AB}+ Closure', value: 'AB' },
        { label: '{CD}+ Closure', value: 'CD' },
      ]},
    ],
    metrics: [
      { key: 'closureSize', label: '|X+| Size', unit: '' },
      { key: 'isSuperkeyResult', label: 'Superkey?', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-candidate-keys',
    unit: 4,
    unitTitle: 'Functional Dependencies & Normalization',
    topic: 'Candidate Keys & Minimal Cover',
    title: 'Candidate Key Finder & Minimal Cover Algorithm',
    icon: '🔐',
    shortDescription: 'Derive all minimal Candidate Keys using attribute classification (essential left-hand side attributes vs RHS attributes). Compute canonical Minimal Covers: singleton right-hand sides, extraneous attribute removal, and redundant FD pruning.',
    learningObjectives: [
      'Classify relation attributes into Left-only, Right-only, and Both-side attribute categories',
      'Derive all minimal candidate keys systematically using attribute closures',
      'Compute the canonical minimal cover (F_min) equivalent to a given set of functional dependencies',
    ],
    formulaOverview: '\\text{Candidate Key } K: K^+ = R \\land \\forall A \\in K, (K - \\{A\\})^+ \\ne R \\quad | \\quad F_{\\text{min}} \\equiv F',
    parameters: [
      { key: 'schemaAttrs', label: 'Schema Attributes & FDs', type: 'select', default: 'preset-1', options: [
        { label: 'R(A, B, C, D) with AB->C, C->D, D->A', value: 'preset-1' },
        { label: 'R(A, B, C, D, E) with A->BC, CD->E, B->D', value: 'preset-2' },
      ]},
    ],
    metrics: [
      { key: 'candidateKeysCount', label: 'Total Candidate Keys', unit: '' },
      { key: 'minimalCoverFdsCount', label: 'Minimal Cover FDs', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-normalization-workshop',
    unit: 4,
    unitTitle: 'Functional Dependencies & Normalization',
    topic: 'Normalization 1NF to BCNF',
    title: 'Database Normalization & Decomposition Workshop (1NF → BCNF) ⭐',
    icon: '🧱',
    flagship: true,
    shortDescription: 'Detect update, insertion, and deletion anomalies. Decompose relations progressively through 1NF (atomic values), 2NF (remove partial dependencies), 3NF (remove transitive dependencies), and BCNF. Verify Lossless-Join and Dependency Preservation.',
    learningObjectives: [
      'Identify update, insertion, and deletion anomalies in non-normalized relations',
      'Normalize tables progressively through 1NF, 2NF, 3NF, and BCNF definitions',
      'Verify whether relational decompositions satisfy Lossless Join and Dependency Preservation criteria',
    ],
    formulaOverview: '\\text{2NF: No partial key } \\to \\text{non-prime} \\quad | \\quad \\text{3NF: } X \\to Y \\implies X \\text{ superkey } \\lor Y \\text{ prime} \\quad | \\quad \\text{BCNF: } X \\text{ superkey}',
    parameters: [
      { key: 'targetNormalForm', label: 'Target Normal Form', type: 'select', default: '3NF', options: [
        { label: '1NF (Atomic Attributes Only)', value: '1NF' },
        { label: '2NF (No Partial Dependencies)', value: '2NF' },
        { label: '3NF (No Transitive Dependencies)', value: '3NF' },
        { label: 'BCNF (Boyce-Codd Normal Form)', value: 'BCNF' },
      ]},
    ],
    metrics: [
      { key: 'currentNormalForm', label: 'Achieved NF', unit: '' },
      { key: 'isLosslessJoin', label: 'Lossless Join', unit: '' },
      { key: 'isDependencyPreserving', label: 'Dep Preserved', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — TRANSACTION MANAGEMENT, CONCURRENCY & RECOVERY
  // ═══════════════════════════════════════════════════════════════════════════
  u25dbmsSimulation({
    id: 'u25cs401-acid-transaction-states',
    unit: 5,
    unitTitle: 'Transaction Management, Concurrency & Recovery',
    topic: 'ACID Properties & States',
    title: 'ACID Properties & Transaction State Machine Lab',
    icon: '🛡️',
    shortDescription: 'Interactive state transition engine: Active → Partially Committed → Committed, and Active → Failed → Aborted (Rollback). Test Atomicity, Consistency, Isolation, and Durability in simulated banking balance transfers.',
    learningObjectives: [
      'Trace transaction lifecycle states: Active, Partially Committed, Committed, Failed, Aborted',
      'Demonstrate Atomicity guarantees through automated transaction rollback on mid-flight failures',
      'Simulate bank balance transfer operations and audit system consistency constraints',
    ],
    formulaOverview: '\\text{States: Active} \\to \\text{Partially Committed} \\to \\text{Committed} \\quad | \\quad \\text{Active} \\to \\text{Failed} \\to \\text{Aborted}',
    parameters: [
      { key: 'transactionScenario', label: 'Transaction Scenario', type: 'select', default: 'bank-transfer', options: [
        { label: 'Banking Transfer: Account A ($1000) → Account B ($500)', value: 'bank-transfer' },
        { label: 'Seat Reservation: Lock, Reserve, Bill, Confirm', value: 'seat-reservation' },
      ]},
      { key: 'failurePoint', label: 'Injected Crash Point', type: 'select', default: 'after-debit', options: [
        { label: 'No Crash (Clean Commit)', value: 'none' },
        { label: 'Crash After Debit A, Before Credit B (Test Atomicity)', value: 'after-debit' },
      ]},
    ],
    metrics: [
      { key: 'transactionCurrentState', label: 'Current State', unit: '' },
      { key: 'accountABalance', label: 'Balance A', unit: '$' },
      { key: 'accountBBalance', label: 'Balance B', unit: '$' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-serializability-conflict',
    unit: 5,
    unitTitle: 'Transaction Management, Concurrency & Recovery',
    topic: 'Conflict Serializability & Schedules',
    title: 'Conflict Serializability & Precedence Graph Analyzer ⭐',
    icon: '🔀',
    flagship: true,
    shortDescription: 'Analyze interleaved concurrent execution schedules (T1, T2, T3). Detect conflicting pairs (Read-Write, Write-Read, Write-Write on identical items). Construct directed Precedence Graphs (Serialization Graphs) and detect cycles via topological sort.',
    learningObjectives: [
      'Identify conflicting operations in concurrent multi-transaction execution schedules',
      'Construct directed Precedence Graphs (Serialization Graphs) from conflicting operation pairs',
      'Apply topological sorting and cycle detection algorithms to determine conflict serializability',
    ],
    formulaOverview: 'I_i, I_j \\text{ conflict} \\iff \\text{Item}(I_i) = \\text{Item}(I_j) \\land (\\text{Write} \\in \\{I_i, I_j\\}) \\quad | \\quad \\text{Serializable} \\iff \\text{Precedence Graph is DAG}',
    parameters: [
      { key: 'schedulePreset', label: 'Concurrent Schedule', type: 'select', default: 'non-serializable-cycle', options: [
        { label: 'S1: r1(A); r2(A); w1(A); w2(A) [Cyclic: Not Serializable]', value: 'non-serializable-cycle' },
        { label: 'S2: r1(A); w1(A); r2(A); w2(A) [Acyclic: Serializable]', value: 'serializable-acyclic' },
        { label: 'S3: r1(A); w2(A); r3(B); w1(B); commit [3-Transaction Schedule]', value: 'three-tx-schedule' },
      ]},
    ],
    metrics: [
      { key: 'conflictingPairsCount', label: 'Conflicts', unit: '' },
      { key: 'graphCycleDetected', label: 'Cycle Found?', unit: '' },
      { key: 'serializableStatus', label: 'Serializable?', unit: '' },
    ],
  }),

  u25dbmsSimulation({
    id: 'u25cs401-concurrency-recovery',
    unit: 5,
    unitTitle: 'Transaction Management, Concurrency & Recovery',
    topic: 'Concurrency Control & Recovery',
    title: 'Concurrency Control (2PL, Deadlock) & WAL Recovery Lab',
    icon: '🔒',
    shortDescription: 'Simulate Strict & Rigorous Two-Phase Locking (2PL growing phase vs shrinking phase), detect Deadlocks via dynamic Wait-For Graphs (WFG), and execute Write-Ahead Logging (WAL) Checkpoint recovery with REDO and UNDO passes.',
    learningObjectives: [
      'Observe lock conversions and 2PL phases (growing phase vs shrinking phase)',
      'Construct dynamic Wait-For Graphs (WFG) and detect deadlock cycles',
      'Trace Write-Ahead Logging (WAL) recovery passes: Analysis, REDO, and UNDO with checkpoints',
    ],
    formulaOverview: '\\text{2PL: No lock acquired after any lock released} \\quad | \\quad \\text{Recovery: UNDO(Uncommitted Active)} \\cup \\text{REDO(Committed)}',
    parameters: [
      { key: 'protocol', label: 'Concurrency Protocol', type: 'select', default: 'strict-2pl', options: [
        { label: 'Strict 2PL (Hold Exclusive Locks until Commit)', value: 'strict-2pl' },
        { label: 'Basic 2PL (Locks released anytime in shrinking phase)', value: 'basic-2pl' },
        { label: 'Deadlock Scenario (Wait-For Graph Cycle)', value: 'deadlock-wfg' },
      ]},
    ],
    metrics: [
      { key: 'activeLocksCount', label: 'Locks Held', unit: '' },
      { key: 'deadlockDetected', label: 'Deadlock?', unit: '' },
      { key: 'walRecoveryPass', label: 'Recovery Pass', unit: '' },
    ],
  }),
];
