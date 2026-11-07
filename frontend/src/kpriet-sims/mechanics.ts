/**
 * KPRIET Engineering Mechanics (ME3251 / GE3251)
 * Anna University Syllabus: Units I through V
 * 20 Verified Interactive 3D Virtual Laboratory Simulations
 */

import type { ISimulationDefinition } from './types';

const MECHANICS_SUBJECT_KEYWORDS = [
  'engineering mechanics',
  'mechanics',
  'ge3251',
  'me3251',
  'statics',
  'dynamics',
];

function mechBoardSimulation(
  id: string,
  unit: number,
  unitTitle: string,
  subtype: string,
  topic: string,
  title: string,
  icon: string,
  shortDescription: string,
  learningObjectives: string[]
): ISimulationDefinition {
  return {
    id,
    boardEngine: 'mechanics',
    simulationSubtype: subtype,
    unit,
    unitTitle,
    topic,
    subjectKeywords: MECHANICS_SUBJECT_KEYWORDS,
    title,
    domain: 'PHYSICS',
    category: 'mechanics',
    icon,
    shortDescription,
    detailedDescription: `${shortDescription} Fully interactive 3D laboratory with vector resolution, real-time equations, component inspection, and deterministic physics solver.`,
    learningObjectives,
    suggestedUnits: [unit],
    smartboardPresetKey: id,
    tags: ['Engineering Mechanics', 'Anna University', unitTitle, topic, '3D Virtual Lab'],
    parameters: [],
    metrics: [],
    engine: {
      createInitialState: () => ({}),
      update: (state) => state,
      render: (ctx, width, height) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const MECHANICS_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ==========================================
  // UNIT I: STATICS OF PARTICLES (SIMS 01 - 03)
  // ==========================================
  mechBoardSimulation(
    'mech-force-systems',
    1,
    'Statics of Particles',
    'force-systems',
    '2D and 3D Force Systems',
    '2D and 3D Force Systems & Resultants',
    '🧭',
    'Resolve concurrent forces into orthogonal Cartesian components, compute vector resultant, and evaluate equilibrium condition ΣF = 0.',
    [
      'Resolve coplanar and spatial forces into orthogonal components',
      'Compute resultant force magnitude and spatial direction cosines',
      'Verify particle equilibrium condition when resultant force is zero',
    ]
  ),
  mechBoardSimulation(
    'mech-cable-tensions',
    1,
    'Statics of Particles',
    'cable-tensions',
    'Particle Equilibrium & Cable Tensions',
    'Particle Equilibrium and Cable Tensions',
    '⛓️',
    'Analyze suspended load supported by multi-cable suspension, apply Lami\'s theorem, and solve spatial tension equilibrium equations.',
    [
      'Apply Lami\'s theorem to three concurrent coplanar tension forces',
      'Solve linear equilibrium equations for 2D and 3D cable geometries',
      'Detect impossible or underdetermined tension geometries',
    ]
  ),
  mechBoardSimulation(
    'mech-fbd-lab',
    1,
    'Statics of Particles',
    'fbd-lab',
    'Free-Body Diagram Laboratory',
    'Free-Body Diagram Laboratory',
    '📐',
    'Isolate physical bodies (blocks, suspended loads, ladders, beams), attach contact reactions, and validate against Newtonian equilibrium.',
    [
      'Identify isolated body boundaries and separate internal from external forces',
      'Place normal reactions, friction forces, cable tensions, and gravitational weight',
      'Verify adherence to Newton\'s third law action-reaction pairs',
    ]
  ),

  // ===============================================
  // UNIT II: EQUILIBRIUM OF RIGID BODIES (SIMS 04 - 06)
  // ===============================================
  mechBoardSimulation(
    'mech-moments-couples',
    2,
    'Equilibrium of Rigid Bodies',
    'moments-couples',
    'Moments, Couples and Varignon\'s Theorem',
    'Moments, Couples and Varignon\'s Theorem',
    '🔄',
    'Compute moment of a force M = r × F, demonstrate couple moments as free vectors, and prove Varignon\'s theorem.',
    [
      'Calculate moments using perpendicular moment arm and vector cross product',
      'Understand why couple moments are translation-invariant free vectors',
      'Prove Varignon\'s theorem: moment of resultant equals sum of component moments',
    ]
  ),
  mechBoardSimulation(
    'mech-support-reactions',
    2,
    'Equilibrium of Rigid Bodies',
    'support-reactions',
    'Support Reactions of Statically Determinate Beams',
    'Rigid-Body Equilibrium & Support Reactions',
    '🏗️',
    'Determine support reactions for simply supported, cantilever, and overhanging beams subject to concentrated point loads and UDLs.',
    [
      'Differentiate boundary conditions of pin, roller, and fixed supports',
      'Convert distributed loads (UDL/UVL) into equivalent concentrated loads',
      'Solve coupled planar equilibrium equations: ΣFx = 0, ΣFy = 0, ΣM = 0',
    ]
  ),
  mechBoardSimulation(
    'mech-truss-analysis',
    2,
    'Equilibrium of Rigid Bodies',
    'truss-analysis',
    'Truss Analysis by Method of Joints',
    'Truss Analysis by Method of Joints',
    '🌉',
    'Analyze pin-jointed planar bridge trusses, isolate individual joints, calculate axial forces, and identify zero-force members.',
    [
      'Model structural members as idealized two-force members',
      'Apply joint equilibrium (ΣFx = 0, ΣFy = 0) iteratively along load path',
      'Distinguish tension (green) from compression (red) and identify zero-force members',
    ]
  ),

  // ========================================================
  // UNIT III: PROPERTIES OF SURFACES AND SOLIDS (SIMS 07 - 09)
  // ========================================================
  mechBoardSimulation(
    'mech-composite-centroids',
    3,
    'Properties of Surfaces and Solids',
    'composite-centroids',
    'Centroid of Composite Planar Areas',
    'Centroid of Composite Areas',
    '🎯',
    'Compute first moment of area and composite centroid coordinates (X̄, Ȳ) using component summation with negative area holes.',
    [
      'Decompose complex planar cross-sections into basic geometric elements',
      'Apply area-weighted moment equations: X̄ = Σ(Ai xi) / ΣAi and Ȳ = Σ(Ai yi) / ΣAi',
      'Treat hollow cutouts and circular holes as negative area contributions',
    ]
  ),
  mechBoardSimulation(
    'mech-area-moments-inertia',
    3,
    'Properties of Surfaces and Solids',
    'area-moments-inertia',
    'Area Moments of Inertia & Parallel Axis Theorem',
    'Area Moment of Inertia & Radius of Gyration',
    '📊',
    'Calculate second moment of area (Ixx, Iyy), apply Steiner\'s parallel axis theorem (I = Ig + Ad²), and determine radius of gyration.',
    [
      'Calculate centroidal second moments of area for rectangular, circular, and I-sections',
      'Apply Steiner\'s parallel-axis theorem to transfer axes across composite members',
      'Determine radius of gyration k = √(I/A) for structural column stability',
    ]
  ),
  mechBoardSimulation(
    'mech-center-of-gravity',
    3,
    'Properties of Surfaces and Solids',
    'center-of-gravity',
    'Centre of Gravity of 3D Bodies & Stability',
    'Centre of Gravity of 3D Bodies',
    '⚖️',
    'Evaluate spatial mass integration R_cg = Σ(mi ri) / Σmi, ground support footprint polygon, and static stability against tipping.',
    [
      'Integrate component masses from volume and density: mi = ρi · Vi',
      'Determine 3D center of gravity coordinates (X̄, Ȳ, Z̄)',
      'Evaluate overturning and tipping stability criteria over support base polygon',
    ]
  ),

  // ==========================================
  // UNIT IV: FRICTION (SIMS 10 - 13)
  // ==========================================
  mechBoardSimulation(
    'mech-inclined-plane',
    4,
    'Friction',
    'inclined-plane',
    'Dry Friction and Inclined Plane',
    'Dry Friction and Inclined Plane',
    '📐',
    'Analyze Coulomb static and kinetic friction laws, determine angle of repose θ_c = arctan(μ_s), and simulate accelerated sliding.',
    [
      'Resolve weight into normal and tangential components along an inclined plane',
      'Apply Coulomb\'s static inequality |f_s| ≤ μ_s · N and identify limiting friction',
      'Verify that angle of repose θ_c = arctan(μ_s) is independent of block mass',
    ]
  ),
  mechBoardSimulation(
    'mech-ladder-friction',
    4,
    'Friction',
    'ladder-friction',
    'Ladder Friction and Limiting Equilibrium',
    'Ladder Friction & Limiting Equilibrium',
    '🪜',
    'Determine wall and floor contact reactions, moment equilibrium, and critical climber height before slide-out failure occurs.',
    [
      'Formulate non-concurrent force and moment equilibrium about base point A',
      'Demonstrate how ascending climber load increases required floor resisting friction',
      'Calculate safety factor against catastrophic ladder slide-out',
    ]
  ),
  mechBoardSimulation(
    'mech-wedge-friction',
    4,
    'Friction',
    'wedge-friction',
    'Wedge Friction and Load Lifting',
    'Wedge Friction and Load Lifting',
    '🪓',
    'Evaluate wedge mechanical advantage, calculate lifting effort P = W·tan(α + 2Φ), and verify self-locking criterion α < 2Φ.',
    [
      'Decompose multi-interface contact reactions using friction angle Φ = arctan(μ)',
      'Calculate required horizontal effort to raise load versus lower load',
      'Verify self-locking condition preventing load-driven back-driving',
    ]
  ),
  mechBoardSimulation(
    'mech-rolling-resistance',
    4,
    'Friction',
    'rolling-resistance',
    'Wheel Friction and Rolling Resistance',
    'Wheel Friction and Rolling Resistance',
    '🛞',
    'Model tire/ground contact deformation, forward shift of normal reaction b, resisting moment M_r = W·b, and compare rolling vs. skidding.',
    [
      'Explain contact patch deformation and forward offset b of normal contact force',
      'Calculate rolling resistance moment M_r = W · b and tractive force P_roll = (W·b)/R',
      'Quantify the 10x–50x energy efficiency advantage of rolling versus sliding',
    ]
  ),

  // ==================================================================
  // UNIT V: DYNAMICS OF PARTICLES AND RIGID BODIES (SIMS 14 - 20)
  // ==================================================================
  mechBoardSimulation(
    'mech-rectilinear-motion',
    5,
    'Dynamics of Particles and Rigid Bodies',
    'rectilinear-motion',
    'Rectilinear Motion of Particles',
    'Rectilinear Motion & Kinematic Scrubbing',
    '🏎️',
    'Explore Galilean constant acceleration equations s(t), v(t), and a(t) with timeline scrubbing and synchronized vector indicators.',
    [
      'Integrate acceleration to obtain velocity and displacement time functions',
      'Apply the time-independent kinematic relation v² = v0² + 2a(s - s0)',
      'Differentiate speeding up (v·a > 0) from deceleration (v·a < 0)',
    ]
  ),
  mechBoardSimulation(
    'mech-projectile-motion',
    5,
    'Dynamics of Particles and Rigid Bodies',
    'projectile-motion',
    'Curvilinear and Projectile Motion',
    'Curvilinear and Projectile Motion',
    '🚀',
    'Investigate 3D parabolic trajectories, apex altitude, horizontal range, and tangential/normal acceleration components (a_t, a_n).',
    [
      'Verify Galileo\'s principle of orthogonal independence of horizontal and vertical motions',
      'Calculate trajectory apex altitude H_max and horizontal range R',
      'Decompose acceleration into tangential component a_t and normal curvature component a_n',
    ]
  ),
  mechBoardSimulation(
    'mech-newtons-second-law',
    5,
    'Dynamics of Particles and Rigid Bodies',
    'newtons-second-law',
    'Newton\'s Second Law & Connected Bodies',
    'Newton\'s Second Law & Connected Bodies',
    '⚙️',
    'Model Atwood bench apparatus with cart on friction track connected over pulley to hanging mass, solving coupled acceleration and tension.',
    [
      'Apply D\'Alembert\'s principle and Newton\'s second law to isolated bodies',
      'Derive coupled acceleration a = [(m2 - μk·m1)/(m1 + m2)]·g',
      'Solve internal cable tension T and identify static friction threshold',
    ]
  ),
  mechBoardSimulation(
    'mech-work-energy',
    5,
    'Dynamics of Particles and Rigid Bodies',
    'work-energy',
    'Work–Energy Principle & Spring Impact',
    'Work–Energy Principle & Buffer Spring',
    '⚡',
    'Analyze exchange of gravitational potential energy, kinetic energy, buffer spring elastic energy, and thermal friction dissipation.',
    [
      'Apply work-energy theorem: T1 + V1 + U_other = T2 + V2',
      'Account for non-conservative work done by friction along rough track',
      'Calculate maximum elastic spring compression under dynamic impact',
    ]
  ),
  mechBoardSimulation(
    'mech-impulse-momentum',
    5,
    'Dynamics of Particles and Rigid Bodies',
    'impulse-momentum',
    'Impulse, Momentum and Impact',
    'Impulse, Momentum and Impact',
    '💥',
    'Demonstrate conservation of linear momentum, coefficient of restitution e, impact impulse J, and kinetic energy dissipation.',
    [
      'Apply linear momentum conservation: m1·v1 + m2·v2 = m1·v1\' + m2·v2\'',
      'Utilize Newton\'s restitution equation: e = (v2\' - v1\') / (v1 - v2)',
      'Calculate impulse J = ∫ F dt and kinetic energy loss ΔE_k',
    ]
  ),
  mechBoardSimulation(
    'mech-rotational-dynamics',
    5,
    'Dynamics of Particles and Rigid Bodies',
    'rotational-dynamics',
    'Rotational Dynamics of Rigid Bodies',
    'Rotational Motion of Rigid Bodies',
    '🔄',
    'Evaluate fixed-axis rotational dynamics Στ = I·α, solid disc versus hollow ring inertia, angular velocity, and kinetic energy.',
    [
      'Apply Euler\'s fixed-axis rotational equation Στ = I · α',
      'Compare solid disc (0.5 MR²) with hollow ring (MR²) mass moment of inertia',
      'Calculate rotational kinetic energy T_rot = 0.5 · I · ω² and convert to RPM',
    ]
  ),
  mechBoardSimulation(
    'mech-impact-conservation',
    5,
    'Dynamics of Particles and Rigid Bodies',
    'impact-conservation',
    'Impact Comparison & Conservation Laws',
    'Impact Comparison & Conservation Laws',
    '🛡️',
    'Conduct side-by-side benchmark of elastic (e=1), inelastic (e=0.6), and perfectly plastic (e=0) collisions, measuring energy retention.',
    [
      'Demonstrate that linear momentum is conserved in all isolated collisions',
      'Show that kinetic energy is conserved ONLY when collision is perfectly elastic (e=1)',
      'Calculate plastic collision common velocity v_common and maximum energy absorption',
    ]
  ),
];
