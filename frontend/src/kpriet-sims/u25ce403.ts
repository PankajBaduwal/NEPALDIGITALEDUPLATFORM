/**
 * PiyushDhara Eduverse — Water Supply and Wastewater Engineering (U25CE403)
 * Master Simulation Definitions & Platform Registry
 * Department: Civil Engineering | Semester: IV | Category: PCC (Professional Core Course)
 * Associated Lab: U25CE405 / U25CE411 Water and Wastewater Analysis Laboratory
 */

import type { ISimulationDefinition } from './types';
import type { WaterSimId } from './water-lab-3d/core/types';

export const U25CE403_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ce403-water-treatment-plant',
    title: '3D Conventional Water Treatment Plant Flowline Studio',
    domain: 'CIVIL',
    category: 'environmental engineering',
    icon: '💧',
    shortDescription: 'Full treatment flowline: cascade aerator, flash mixer, paddle flocculator, clarifier, sand filter, chlorine contact chamber, and clear water sump.',
    detailedDescription:
      'Interactive 3D simulation of a municipal water treatment plant conforming to CPHEEO guidelines and BIS 10500:2012. Features real-time flow capacity adjustment, turbidity reduction cascade, coagulant alum dosage optimization, gas chlorination disinfection dynamics, and clear water reservoir sizing.',
    learningObjectives: [
      'Understand the sequence and purpose of conventional water treatment unit operations',
      'Compute chemical dosage requirements for coagulation and disinfection per MLD plant capacity',
      'Verify treated drinking water effluent compliance against BIS 10500:2012 potable standards',
    ],
    formulaOverview: 't = V / Q; Daily Alum = Q · Dose · 10⁻³ kg/d; Turbidity_eff = Turbidity_raw · (1 - η_total)',
    suggestedUnits: [1, 2],
    boardEngine: 'water',
    subjectKeywords: ['u25ce403', 'u25ce405', 'wtp', 'water treatment', 'flocculator', 'chlorination', 'bis 10500', 'cpheeo'],
    parameters: [],
    metrics: [],
    tags: ['wtp', 'coagulation', 'disinfection', 'water treatment', 'u25ce403'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce403-sedimentation-clarifier',
    title: 'Sedimentation & Clarification Tank Dynamics',
    domain: 'CIVIL',
    category: 'environmental engineering',
    icon: '🧪',
    shortDescription: 'Settling dynamics, Stokes law settling velocity, surface overflow rate (SOR), particle trajectory vectors, and peripheral effluent weir.',
    detailedDescription:
      'Explore settling kinetics inside rectangular and circular clarifiers. Visualizes discrete particle settling trajectories, Stokes settling velocity vs = [g(ρs - ρ)d²] / [18μ], Surface Overflow Rate (SOR = Q/As), hydraulic retention time t0 = V/Q, and effluent V-notch weir overflow loading.',
    learningObjectives: [
      'Apply Stokes law to determine discrete particle terminal settling velocity',
      'Analyze the relationship between Surface Overflow Rate (SOR) and particle removal efficiency',
      'Evaluate hydraulic retention time and weir loading rates per CPHEEO design manuals',
    ],
    formulaOverview: 'vs = [g · (ρs - ρ) · d²] / [18 · μ]; SOR = Q / As; η = (vs / SOR) · 100%',
    suggestedUnits: [2],
    boardEngine: 'water',
    subjectKeywords: ['u25ce403', 'sedimentation', 'clarifier', 'stokes law', 'sor', 'settling velocity', 'weir loading'],
    parameters: [],
    metrics: [],
    tags: ['sedimentation', 'clarifier', 'stokes', 'hydraulics', 'u25ce403'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce403-filtration-backwash',
    title: 'Rapid Sand Filtration & Fluidized Bed Backwashing Studio',
    domain: 'CIVIL',
    category: 'environmental engineering',
    icon: '⏳',
    shortDescription: 'Clean and clogged head loss via Carman-Kozeny equation, terminal head loss (2.5m), and fluidized bed expansion during backwashing.',
    detailedDescription:
      'Cutaway 3D rapid gravity sand filter bed with underdrain lateral strainer manifold, graded gravel support, quartz sand media, and washwater troughs. Simulates head loss progression with pore clogging, terminal head loss trigger (2.5 m), and Fair-Geyer fluidized bed expansion (25-30%) during high-rate backwash rise.',
    learningObjectives: [
      'Calculate clean bed head loss using the Carman-Kozeny porous media equation',
      'Trace head loss accumulation and pore clogging during continuous filtration runs',
      'Determine upward backwash fluidization velocity and bed expansion per CPHEEO standards',
    ],
    formulaOverview: 'hf = [f·L/(φ·d10·g)]·[(1-ε)/ε³]·v²; Expansion % = [(εe - ε)/(1 - εe)]·100%',
    suggestedUnits: [2],
    boardEngine: 'water',
    subjectKeywords: ['u25ce403', 'rapid sand filter', 'backwash', 'carman kozeny', 'head loss', 'fluidization', 'filter media'],
    parameters: [],
    metrics: [],
    tags: ['filtration', 'backwash', 'head loss', 'porosity', 'u25ce403'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce403-wastewater-treatment',
    title: 'Activated Sludge Wastewater Treatment Plant (ASP)',
    domain: 'CIVIL',
    category: 'environmental engineering',
    icon: '🔄',
    shortDescription: 'Secondary biological treatment: bar screen, grit chamber, PST, aeration basin, secondary clarifier, and RAS/WAS sludge return loops.',
    detailedDescription:
      'Comprehensive 3D wastewater treatment plant modeling the activated sludge process (ASP). Incorporates microbial kinetics, Food-to-Microorganism ratio (F/M = 0.2-0.4 kg/kg·d), volumetric organic loading (VLR), sludge age (SRT θc), secondary clarifier solids separation, and CPCB Schedule VI discharge compliance.',
    learningObjectives: [
      'Design activated sludge aeration basins using bacterial growth kinetics and F/M ratio',
      'Calculate daily excess waste activated sludge (WAS) production and oxygen demand',
      'Evaluate treated effluent BOD and TSS against Central Pollution Control Board (CPCB) standards',
    ],
    formulaOverview: 'F/M = (Q · S0) / (V · X); HRT = V / Q; Px = [Y · Q · (S0 - S)] / [1 + kd · θc]',
    suggestedUnits: [3, 4, 5],
    boardEngine: 'water',
    subjectKeywords: ['u25ce403', 'activated sludge', 'wwtp', 'aeration tank', 'mlss', 'cpcb', 'bod', 'sludge age'],
    parameters: [],
    metrics: [],
    tags: ['wastewater', 'activated sludge', 'aeration', 'cpcb', 'u25ce403'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce403-distribution-network',
    title: 'Water Distribution Network & Gravity Sewer Hydraulics',
    domain: 'CIVIL',
    category: 'environmental engineering',
    icon: '🌐',
    shortDescription: 'Elevated storage reservoir (ESR), Hazen-Williams pipe friction, node pressure heads, and Manning partial-flow self-cleansing sewer design.',
    detailedDescription:
      'Integrated municipal water supply and sewerage hydraulic studio. Calculates Hazen-Williams pipe frictional head losses and consumer delivery node pressures from an elevated storage reservoir (ESR). In parallel, analyzes circular gravity sanitary sewers using Manning equation to ensure CPHEEO self-cleansing velocity (≥ 0.6 m/s).',
    learningObjectives: [
      'Determine pipe frictional head loss and residual pressure head using the Hazen-Williams formula',
      'Calculate partial flow velocity and discharge in circular sewers using Manning equation',
      'Verify CPHEEO minimum self-cleansing velocity criteria (≥ 0.6 m/s) to prevent sewer sedimentation',
    ],
    formulaOverview: 'hf = 10.67 · L · Q^1.852 / (C^1.852 · D^4.87); v_sewer = (1/n) · R^(2/3) · S^(1/2) ≥ 0.6 m/s',
    suggestedUnits: [2, 3],
    boardEngine: 'water',
    subjectKeywords: ['u25ce403', 'water distribution', 'sewer hydraulics', 'hazen williams', 'manning', 'self cleansing', 'esr'],
    parameters: [],
    metrics: [],
    tags: ['distribution', 'sewer', 'hydraulics', 'manning', 'u25ce403'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ce403-water-quality-lab',
    title: 'Environmental Water & Wastewater Quality Virtual Laboratory',
    domain: 'CIVIL',
    category: 'environmental engineering',
    icon: '🔬',
    shortDescription: 'Virtual wet lab for prescribed experiments: Jar test coagulant optimization, Azide Winkler DO, 5-day BOD, COD closed reflux, and turbidity.',
    detailedDescription:
      'Digital laboratory companion for U25CE405 / U25CE411 Water and Wastewater Analysis Practical course. Allows students to conduct 6-paddle Jar tests to determine optimum alum dosage, measure Dissolved Oxygen via Azide Winkler titration, determine 5-day 20°C BOD, perform closed reflux FAS titration for COD, and verify drinking water parameters against BIS 10500:2012.',
    learningObjectives: [
      'Determine optimum coagulant dosage using standard 6-paddle jar testing',
      'Perform titration calculations for Dissolved Oxygen (DO), BOD5, and Chemical Oxygen Demand (COD)',
      'Interpret water and wastewater laboratory results in accordance with BIS 10500 and CPCB standards',
    ],
    formulaOverview: 'DO = (V · N · 8000) / V_sample; BOD5 = (D1 - D2) / P; COD = [(V1 - V2) · N · 8000] / V_sample',
    suggestedUnits: [1, 2, 3, 4],
    boardEngine: 'water',
    subjectKeywords: ['u25ce403', 'u25ce405', 'jar test', 'bod', 'cod', 'dissolved oxygen', 'turbidity', 'virtual lab'],
    parameters: [],
    metrics: [],
    tags: ['water quality', 'laboratory', 'bod', 'cod', 'jar test', 'u25ce403', 'u25ce405'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25CE403SimId(id: string): WaterSimId {
  const validIds: WaterSimId[] = [
    'u25ce403-water-treatment-plant',
    'u25ce403-sedimentation-clarifier',
    'u25ce403-filtration-backwash',
    'u25ce403-wastewater-treatment',
    'u25ce403-distribution-network',
    'u25ce403-water-quality-lab',
  ];
  if (validIds.includes(id as WaterSimId)) {
    return id as WaterSimId;
  }
  return 'u25ce403-water-treatment-plant';
}
