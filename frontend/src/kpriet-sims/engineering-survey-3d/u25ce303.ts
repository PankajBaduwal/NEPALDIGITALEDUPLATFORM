/**
 * Engineering Survey (U25CE303) — Simulation Registry Definitions & Resolver
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 */

import type { ISimulationDefinition } from '../types';
import type { SurveySimId } from './core/types';

export const U25CE303_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ce303-levelling',
    title: 'Differential Levelling Field Practical',
    domain: 'CIVIL',
    category: 'surveying',
    icon: '🔭',
    shortDescription: 'Production-grade 3D automatic level and staff outdoor field practical.',
    detailedDescription:
      'Realistic 3D surveying practical featuring an automatic dumpy level on a wooden tripod, 4-meter metric staff, benchmark tablet, turning points, optical reticle sighting, and digital field book verifying HI and Rise-and-Fall reductions per Survey of India standards.',
    learningObjectives: [
      'Mount and level an automatic level using 3-footscrew circular spirit bubble procedure',
      'Observe metric staff graduations through telescope reticle crosshairs and stadia lines',
      'Maintain an authentic survey field book and verify arithmetic checks: ΣBS - ΣFS = Last RL - First RL',
      'Calculate line of collimation Height of Instrument (HI) and evaluate closure tolerances',
    ],
    formulaOverview: 'HI = RL_BM + BS; RL_i = HI - Staff_reading; ΣBS - ΣFS = Last RL - First RL',
    suggestedUnits: [2],
    boardEngine: 'survey',
    subjectKeywords: ['u25ce303', 'engineering survey', 'levelling', 'differential levelling', 'dumpy level', 'staff reading'],
    parameters: [],
    metrics: [],
    tags: ['levelling', 'dumpy level', 'staff reading', 'field book', 'u25ce303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce303-theodolite-traverse',
    title: 'Theodolite & Total Station Traversing Laboratory',
    domain: 'CIVIL',
    category: 'surveying',
    icon: '🧭',
    shortDescription: 'Closed polygon traverse with electronic total station and Bowditch rule.',
    detailedDescription:
      'Interactive 3D closed polygon traverse practical utilizing a digital Total Station with optical plummet centering, horizontal circle reading, retro-reflective prism pole sighting, and Bowditch compass rule closing error adjustment.',
    learningObjectives: [
      'Center total station over station peg using optical/laser plummet and tribrach level',
      'Measure horizontal angles, whole circle bearings (WCB), and EDM slope distances',
      'Compute consecutive coordinates (Latitudes and Departures) for closed traverse legs',
      'Apply Bowditch compass rule to adjust linear misclosure and compute relative precision ratio',
    ],
    formulaOverview: 'Lat = L · cos(θ); Dep = L · sin(θ); e = √(ΣLat² + ΣDep²); Bowditch: c_L = -(d_i / Σd) · ΣLat',
    suggestedUnits: [3],
    boardEngine: 'survey',
    subjectKeywords: ['u25ce303', 'engineering survey', 'theodolite', 'total station', 'traversing', 'bowditch'],
    parameters: [],
    metrics: [],
    tags: ['traverse', 'total station', 'theodolite', 'bowditch rule', 'u25ce303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce303-distance-measurement',
    title: 'Distance Measurement & Instrument Corrections',
    domain: 'CIVIL',
    category: 'surveying',
    icon: '📐',
    shortDescription: 'Steel taping vs. EDM laser with slope, temperature, and sag corrections.',
    detailedDescription:
      'Realistic comparative field practical contrasting precision steel taping with Electronic Distance Measurement (EDM). Simulates sloped terrain reduction, catenary tape sag, temperature pull corrections per IS 1492, and trigonometrical heighting.',
    learningObjectives: [
      'Distinguish between slope distance (S) and true horizontal distance (H = S · cos θ)',
      'Quantify systematic taping errors: temperature expansion, spring balance tension, and catenary sag',
      'Operate electronic distance measurement infrared laser beam and verify millimetric phase readout',
      'Calculate elevation differences and target ground reduced levels incorporating instrument and reflector heights',
    ],
    formulaOverview: 'H = S · cos(α); V = S · sin(α); RL_target = RL_inst + h_i + V - h_t; C_s = -(W² · L) / (24 · P²)',
    suggestedUnits: [1],
    boardEngine: 'survey',
    subjectKeywords: ['u25ce303', 'engineering survey', 'distance measurement', 'edm', 'tape correction', 'is 1492'],
    parameters: [],
    metrics: [],
    tags: ['edm', 'tape correction', 'slope distance', 'ranging', 'u25ce303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce303-contouring',
    title: 'Contour Survey & Topographic Terrain Mapping',
    domain: 'CIVIL',
    category: 'surveying',
    icon: '🗺️',
    shortDescription: '3D undulating topography with grid elevation sampling and live contour plan.',
    detailedDescription:
      'Immersive 3D topographic surveying environment with undulating terrain, 7×7 elevation sampling grid, variable contour interval, linear edge interpolation, and linked top-down contour plan visualization.',
    learningObjectives: [
      'Sample terrain reduced levels on a regular grid and locate ridges, saddles, and drainage depressions',
      'Interpolate contour lines mathematically between surveyed spot heights for 0.25m, 0.5m, and 1.0m intervals',
      'Interpret topographic contours: steepness, uniform slopes, valleys, and earthwork excavation volumes',
      'Correlate 3D perspective terrain features with standard 2D civil engineering plan views',
    ],
    formulaOverview: 't = (Z_c - h₁) / (h₂ - h₁); x = x₁ + t · (x₂ - x₁); Contour Interval CI = 0.25m / 0.5m / 1.0m',
    suggestedUnits: [4],
    boardEngine: 'survey',
    subjectKeywords: ['u25ce303', 'engineering survey', 'contouring', 'contour survey', 'topographic mapping'],
    parameters: [],
    metrics: [],
    tags: ['contouring', 'terrain mapping', 'interpolation', 'spot heights', 'u25ce303'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25CE303SimId(rawId: string): SurveySimId | null {
  const normalized = rawId.toLowerCase().trim();
  if (normalized.includes('level') || normalized.includes('dumpy')) return '01-levelling';
  if (normalized.includes('theodolite') || normalized.includes('traverse') || normalized.includes('bearing')) return '02-traverse';
  if (normalized.includes('distance') || normalized.includes('measurement') || normalized.includes('edm') || normalized.includes('tape')) return '03-distance';
  if (normalized.includes('contour') || normalized.includes('terrain') || normalized.includes('mapping')) return '04-contouring';
  return null;
}

export function toSurvey3DSimId(simId: string): SurveySimId {
  const resolved = resolveU25CE303SimId(simId);
  return resolved || '01-levelling';
}
