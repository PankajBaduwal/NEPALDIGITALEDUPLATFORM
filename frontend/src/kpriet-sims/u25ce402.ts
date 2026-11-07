/**
 * PiyushDhara Eduverse — Highway Engineering (U25CE402)
 * Master Simulation Definitions & Platform Registry
 * Department: Civil Engineering | Semester: IV | Category: PCC (Professional Core Course)
 */

import type { ISimulationDefinition } from './types';
import type { HighwaySimId } from './highway-lab-3d/core/types';

export const U25CE402_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ce402-pavement-cross-section',
    title: '3D Pavement Layers & Cross-Section Cutaway Studio',
    domain: 'CIVIL',
    category: 'highway engineering',
    icon: '🛣️',
    shortDescription: 'Multi-layer flexible and rigid pavement structures, crown camber slopes, kerbs, shoulders, side drains, and volumetric takeoff.',
    detailedDescription:
      'Interactive 3D cutaway visualization of highway pavement components: Subgrade, GSB, WMM Base, DBM Binder, and BC Wearing Course. Features layer-by-layer inspection, exploded view toggle, parabolic/straight camber profiles, shoulder drainage slopes, and material volumetric takeoff per IRC: 73 & IRC: 37-2018.',
    learningObjectives: [
      'Understand the structural hierarchy, functions, and specifications of flexible and rigid pavement layers',
      'Compute transverse camber profiles and crown elevation y = 2 x² / (n W) for road drainage',
      'Perform material volumetric takeoff for various road elements and carriageway widths',
    ],
    formulaOverview: 'y = 2 x² / (n W); V = L · b · t; W_total = W_carriageway + 2 · W_shoulder',
    suggestedUnits: [1, 3],
    boardEngine: 'highway',
    subjectKeywords: ['u25ce402', 'highway', 'pavement cross section', 'camber', 'flexible pavement', 'irc 37', 'irc 73'],
    parameters: [],
    metrics: [],
    tags: ['cross-section', 'camber', 'pavement', 'u25ce402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce402-geometric-design',
    title: 'Highway Horizontal Alignment & Sight Distance Design',
    domain: 'CIVIL',
    category: 'highway engineering',
    icon: '📐',
    shortDescription: 'Horizontal circular curve, ruling radius, PIEV perception-reaction time, SSD, OSD, and sight triangle lateral obstruction clearance.',
    detailedDescription:
      'Rigorous 3D highway alignment environment demonstrating vehicle dynamics along circular arcs, Stopping Sight Distance (SSD = 0.278 V t + V² / 254(f ± G)), Overtaking Sight Distance (OSD = d1 + d2 + d3), and minimum setback distance m from centreline per IRC: 73-1980.',
    learningObjectives: [
      'Calculate Stopping Sight Distance (SSD) incorporating PIEV reaction time and longitudinal grades',
      'Evaluate Overtaking Sight Distance (OSD) stages and minimum overtaking zones',
      'Determine horizontal curve ruling and absolute minimum radii and lateral sight obstruction clearance',
    ],
    formulaOverview: 'SSD = 0.278·V·t + V²/[254·(f±G)]; OSD = d1 + d2 + d3; R_ruling = V² / [127·(e+f)]',
    suggestedUnits: [2],
    boardEngine: 'highway',
    subjectKeywords: ['u25ce402', 'geometric design', 'horizontal curve', 'ssd', 'osd', 'irc 73', 'sight distance'],
    parameters: [],
    metrics: [],
    tags: ['geometric design', 'alignment', 'sight distance', 'u25ce402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce402-superelevation-widening',
    title: 'Superelevation Banking & Curve Extra Widening Laboratory',
    domain: 'CIVIL',
    category: 'highway engineering',
    icon: '🏎️',
    shortDescription: 'Banking e = V² / 225R, equilibrium superelevation, force vector polygon (W, P, N, F), and curve extra widening (Wm + Wps).',
    detailedDescription:
      'Interactive 3D banked road corridor demonstrating the equilibrium between centrifugal force, gravity, and lateral friction. Includes mechanical off-tracking extra widening Wm = n l² / (2 R), psychological widening Wps = V / (9.5 √R), and transition runoff per IRC: 73-1980.',
    learningObjectives: [
      'Apply IRC: 73 superelevation design steps for 75% speed counteracting centrifugal force without friction',
      'Verify maximum permissible superelevation (7% in plain/rolling, 10% in hilly terrain)',
      'Compute mechanical and psychological extra widening on sharp highway curves',
    ],
    formulaOverview: 'e = V² / (225 R); f = [V² / (127 R)] - e; We = Wm + Wps = (n·l²)/(2R) + V/(9.5·√R)',
    suggestedUnits: [2],
    boardEngine: 'highway',
    subjectKeywords: ['u25ce402', 'superelevation', 'extra widening', 'off tracking', 'banking', 'irc 73'],
    parameters: [],
    metrics: [],
    tags: ['superelevation', 'widening', 'banking', 'u25ce402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce402-pavement-construction',
    title: 'Highway Construction Sequence & Heavy Machinery Studio',
    domain: 'CIVIL',
    category: 'highway engineering',
    icon: '🚜',
    shortDescription: '5-stage sequential highway construction: subgrade earthwork, GSB spreading, WMM base, DBM paving, and BC wearing course compaction.',
    detailedDescription:
      'Detailed 3D construction site illustrating the complete layer-by-layer road building process with equipment models (hydrostatic sensor paver, 10-tonne vibratory tandem roller, motor grader). Shows temperature requirements (150°C for VG-30 bitumen) and compaction standards per MORTH Section 500.',
    learningObjectives: [
      'Trace the chronological highway construction sequence from prepared subgrade to wearing surface',
      'Identify equipment roles: motor grader, mechanical spreader, sensor paver, and pneumatic/vibratory rollers',
      'Enforce quality control checkpoints: moisture content, rolling temperatures, and minimum Marshall density',
    ],
    formulaOverview: 'Dry Density % = (Field Dry Density / MDD) × 100 ≥ 98%; Compaction Temp ≥ 150°C',
    suggestedUnits: [4],
    boardEngine: 'highway',
    subjectKeywords: ['u25ce402', 'pavement construction', 'machinery', 'morth', 'paver', 'roller', 'wmm', 'dbm'],
    parameters: [],
    metrics: [],
    tags: ['construction', 'machinery', 'paving', 'u25ce402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce402-materials-testing',
    title: 'Highway Materials Testing Laboratory (Aggregates & Bitumen)',
    domain: 'CIVIL',
    category: 'highway engineering',
    icon: '🔬',
    shortDescription: 'Aggregate Impact Test, Los Angeles Abrasion, Bitumen Penetration (VG-30), and Ring & Ball Softening Point tests.',
    detailedDescription:
      'Virtual laboratory suite for highway materials testing per Indian Standards: 13.5-14.0 kg falling hammer Aggregate Impact Value (IS: 2386 Part IV), rotating Los Angeles abrasion drum, 100g 5-second penetrometer needle (IS: 1203 / IS: 73), and Ring & Ball softening apparatus (IS: 1205).',
    learningObjectives: [
      'Conduct Aggregate Impact Value (AIV) and determine suitability for wearing vs base courses per MORTH limits',
      'Determine Los Angeles Abrasion loss and aggregate toughness',
      'Measure bitumen penetration grade (VG-30 = 50-70 units) and softening point temperature',
    ],
    formulaOverview: 'AIV (%) = (W2 / W1) × 100; Abrasion Loss (%) = [(W1 - W2) / W1] × 100; Penetration in 0.1 mm',
    suggestedUnits: [4],
    boardEngine: 'highway',
    subjectKeywords: ['u25ce402', 'materials testing', 'aggregate impact', 'bitumen penetration', 'softening point', 'is 2386', 'is 73'],
    parameters: [],
    metrics: [],
    tags: ['materials', 'testing', 'aggregates', 'bitumen', 'u25ce402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce402-pavement-evaluation',
    title: 'Pavement Distress Evaluation & Benkelman Beam Overlay Design',
    domain: 'CIVIL',
    category: 'highway engineering',
    icon: '📊',
    shortDescription: 'Pavement distress inspection, Benkelman Beam Deflection (BBD) rebound measurements, and overlay design per IRC: 81-1997.',
    detailedDescription:
      'Perform structural evaluation of deteriorated flexible pavements using the Benkelman Beam apparatus and an 8170 kg rear-axle test truck. Visualizes alligator fatigue cracking, wheel rutting, rebound deflection bowls, temperature corrections, and Bituminous Macadam (BM) overlay thickness h0 per IRC: 81-1997.',
    learningObjectives: [
      'Identify flexible pavement distress types: alligator fatigue cracking, longitudinal rutting, and ravelling',
      'Measure rebound deflection with 3.66 m Benkelman Beam under standard 8170 kg dual wheel load',
      'Calculate characteristic deflection Dc and compute structural overlay thickness h0 = 550 log10(Dc / Da) mm',
    ],
    formulaOverview: 'Dc = d_mean + 2·s; Da = 0.55 · (CSA)^(-0.25); h0 = 550 · log10(Dc / Da) mm BM',
    suggestedUnits: [5],
    boardEngine: 'highway',
    subjectKeywords: ['u25ce402', 'benkelman beam', 'overlay design', 'pavement evaluation', 'irc 81', 'distress', 'deflection'],
    parameters: [],
    metrics: [],
    tags: ['benkelman beam', 'overlay', 'pavement evaluation', 'u25ce402'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25CE402SimId(id: string): HighwaySimId {
  const validIds: HighwaySimId[] = [
    'u25ce402-pavement-cross-section',
    'u25ce402-geometric-design',
    'u25ce402-superelevation-widening',
    'u25ce402-pavement-construction',
    'u25ce402-materials-testing',
    'u25ce402-pavement-evaluation',
  ];
  if (validIds.includes(id as HighwaySimId)) {
    return id as HighwaySimId;
  }
  return 'u25ce402-pavement-cross-section';
}
