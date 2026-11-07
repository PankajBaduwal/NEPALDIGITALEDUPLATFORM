export type SimulationDomain = 'MATHEMATICS' | 'PHYSICS' | 'CHEMISTRY' | 'COMPUTER_SCIENCE' | 'CIVIL' | 'SCHOOL' | 'VIRTUAL_LAB';

export type MathCategory = 'graphs' | 'calculus visualization' | 'geometry' | 'matrices' | 'engineering mathematics' | 'higher mathematics' | 'probability & statistics' | 'discrete mathematics';
export type PhysicsCategory =
  | 'projectile motion'
  | 'circular motion'
  | 'mechanics'
  | 'waves'
  | 'engineering physics'
  | 'physics for data storage and computing'
  | 'physics-data-storage';
export type CSCategory =
  | 'sorting'
  | 'data structures'
  | 'algorithms'
  | 'networking'
  | 'data structures & algorithms'
  | 'operating systems'
  | 'operating systems & shell'
  | 'engineering graphics'
  | 'electrical & electronics'
  | 'c programming'
  | 'python programming'
  | 'java programming'
  | 'problem solving'
  | 'essentials of computing'
  | 'computing fundamentals'
  | 'computer architecture'
  | 'database management systems';
export type CivilCategory = 'structural analysis' | 'surveying' | 'construction simulations' | 'makerspace' | 'physics for civil engineers' | 'strength of materials' | 'concrete technology' | 'engineering survey';
export type ChemistryCategory = 'engineering chemistry';
/** PiyushDhara public catalogue content (school samples and Virtual Labs); never part of the dashboard registry. */
export type SchoolCategory =
  | 'school mathematics'
  | 'school science'
  | 'virtual lab'
  | 'Trigonometry'
  | 'Functions & Curves'
  | 'Statistics & Probability'
  | 'Mechanics & Kinematics'
  | 'Oscillations & Waves'
  | 'Linear Momentum & Impulse'
  | 'Forces & Newton’s Laws'
  | 'Ray Optics & Optical Instruments'
  | 'Electromagnetism'
  | 'Thermal Physics & Kinetic Theory'
  | (string & {});

export type SimulationCategory = MathCategory | PhysicsCategory | ChemistryCategory | CSCategory | CivilCategory | SchoolCategory;

export interface ISimulationParam {
  key: string;
  label: string;
  type: 'range' | 'select' | 'boolean' | 'number' | 'text';
  min?: number;
  max?: number;
  step?: number;
  default: any;
  unit?: string;
  options?: { label: string; value: any }[];
  description?: string;
}

export interface ISimulationMetric {
  id?: string;
  key?: string;
  label: string;
  format?: (state: any, params: Record<string, any>) => string;
  badge?: string;
  color?: string;
  unit?: string;
}

export interface ISimulationEngine<TState = any> {
  createInitialState: (params: Record<string, any>, width: number, height: number) => TState;
  update: (state: TState, params: Record<string, any>, dt: number, width: number, height: number) => TState;
  render: (ctx: CanvasRenderingContext2D, width: number, height: number, state: TState, params: Record<string, any>) => void;
  onPointerDown?: (x: number, y: number, state: TState, params: Record<string, any>) => void;
  onPointerMove?: (x: number, y: number, state: TState, params: Record<string, any>) => void;
  onPointerUp?: (state: TState, params: Record<string, any>) => void;
  reset?: (params: Record<string, any>, width: number, height: number) => TState;
}

export interface ISimulationDefinition {
  id: string;
  title: string;
  domain: SimulationDomain;
  category: SimulationCategory;
  icon: string;
  shortDescription: string;
  detailedDescription: string;
  learningObjectives: string[];
  formulaOverview?: string;
  suggestedUnits: number[];
  smartboardPresetKey?: string;
  parameters: ISimulationParam[];
  metrics: ISimulationMetric[];
  engine: ISimulationEngine;
  tags: string[];
  /** Data Structures & Algorithms simulation (array, stack, …). These run inside the Smart Board. */
  dsaCategory?: string;
  /** Operating Systems simulation (Process, CPU Scheduling, Banker's, Paging, Disk, …). Runs inside Smart Board. */
  osCategory?: string;
  /** C Programming simulation (Execution, Memory, Pointers, Arrays, Structs, …). Runs inside Smart Board. */
  cCategory?: string;
  /** Principles of Data Communication simulation (AM, FM, PM, ASK, FSK, PSK, Error Control, …). Runs inside Smart Board. */
  pdcCategory?: string;
  /** Digital Electronics (U21ECG01) simulation. Runs inside Smart Board. */
  ecgCategory?: string;
  /** Database Management Systems (U25CS401 / U21CS302) simulation. Runs inside Smart Board. */
  dbmsCategory?: string;
  /** Object Oriented Programming Using Java Laboratory (U25CS311 / U21AD307) simulation. Runs inside Smart Board. */
  javaCategory?: string;
  /** Discrete Mathematics (U25MA401 / U21MAG02) simulation. Runs inside Smart Board. */
  dmCategory?: string;
  /** Design and Analysis of Algorithms (U25CS403 / U21CS401) simulation. Runs inside Smart Board. */
  daaCategory?: string;
  /** Makerspace (U25RGE01 / U25RGEO1) simulation category. */
  makerspaceCategory?: string;
  /** Flagship simulation highlight flag. */
  flagship?: boolean;
  /**
   * Subject words this simulation belongs to (matched against the subject name/code).
   * When set, the simulation is shown only in matching subjects — e.g. networking
   * simulations only in Computer Networks, DSA simulations only in Data Structures, OS simulations only in Operating Systems, C simulations only in C Programming, PDC in Principles of Data Communication.
   */
  subjectKeywords?: string[];
  boardEngine?: 'dsa' | 'cn' | 'ep' | 'eg' | 'ma' | 'pdc' | 'ee' | 'ecg' | 'chem' | 'os' | 'computing' | 'sh' | 'py' | 'ps' | 'coa' | 'dbms' | 'java' | 'dm' | 'daa' | 'mechanics' | 'makerspace' | 'physics-civil' | 'som' | 'concrete' | 'survey' | 'hydraulic' | 'geotechnical' | 'highway' | 'water' | 'fluid-machinery' | 'mechanics-solids' | 'manufacturing-tech' | 'manufacturing-tech-2' | 'thermal-engineering' | 'materials-metallurgy' | 'electrical-drives' | 'numerical-methods';
  /** Engineering Physics: syllabus area of the simulation (laser, fiber-optics, ultrasonics, thermal-fluids, crystal-physics). */
  simulationSubtype?: string;
  /** Syllabus unit / topic (used to organise the subject's simulation library). */
  unit?: number;
  unitTitle?: string;
  topic?: string;
  /** Real-World & Engineering Context information area metadata */
  engineeringContext?: ISimulationEngineeringContext;
  /** Kept only so older saved assignments still resolve; hidden from the catalogue. */
  legacy?: boolean;
}

export interface ISimulationEngineeringContext {
  summary: string;
  whatIsHappening: string;
  whereUsed: string[];
  whenUsed: string[];
  whyUsed: string[];
  engineeringApplications: Array<{
    field: string;
    example: string;
  }>;
  keyTakeaway: string;
  assumptionsOrLimitations?: string[];
  sourceNotes?: Array<{
    title: string;
    url?: string;
  }>;
}

/** True when the simulation is one of the DSA simulations that open on the Smart Board. */
export function isSmartBoardDsaSimulation(def?: { id?: string; dsaCategory?: string } | null): boolean {
  return Boolean(def && (def.dsaCategory || def.id === 'cs-dsa-lab'));
}

/** True when the simulation is one of the Operating Systems simulations that open on the Smart Board. */
export function isSmartBoardOsSimulation(def?: { id?: string; osCategory?: string } | null): boolean {
  return Boolean(def && (def.osCategory || (def.id && def.id.startsWith('os-')) || def.id === 'cs-os-lab'));
}

/** True when the simulation is one of the Problem Solving and C Programming (U21CS101 / U21CSG01) simulations that open on the Smart Board. */
export function isSmartBoardCSimulation(def?: { id?: string; cCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.cCategory || def.boardEngine === 'c' || (def.id && (def.id.startsWith('c-') || def.id.startsWith('u21cs101-') || def.id.startsWith('u21csg01-') || def.id === 'cs-c-lab'))));
}

/** True when the simulation is one of the Principles of Data Communication simulations. */
export function isSmartBoardPdcSimulation(def?: { id?: string; pdcCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(
    def &&
      (def.pdcCategory ||
        def.boardEngine === 'pdc' ||
        (def.id &&
          (def.id.startsWith('pdc-') ||
            def.id.startsWith('am-') ||
            def.id.startsWith('fm-') ||
            def.id.startsWith('comm-') ||
            def.id.startsWith('u25rphu02-'))))
  );
}

export interface IAssignedSimulation {
  _id: string;
  title: string;
  description?: string;
  contentType?: string;
  chapterOrUnit?: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | string;
  simulationConfig?: {
    type: string;
    initialParams?: Record<string, any>;
    controls?: string[];
    smartboardPresetId?: string;
    category?: string;
    domain?: string;
  };
  department?: any;
  semester?: any;
  subject?: any;
  teacher?: {
    _id?: string;
    name?: string;
    email?: string;
    profile?: { designation?: string };
  };
  tags?: string[];
  resourceUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
  learningActivity?: { opened: number; completed: number };
}

export interface ISimulationLaunchContext {
  simulationId?: string;
  topic?: string;
  category?: string;
  config?: Record<string, unknown>;
  state?: Record<string, unknown>;
  /** Syllabus unit of the simulation (used by catalogue labs). */
  unit?: number;
}


export function getDomainLabel(domain: SimulationDomain): string {
  switch (domain) {
    case 'MATHEMATICS':
      return 'Mathematics & Discrete Science';
    case 'PHYSICS':
      return 'Engineering Physics & Dynamics';
    case 'CHEMISTRY':
      return 'Engineering Chemistry';
    case 'COMPUTER_SCIENCE':
      return 'Computing, Algorithms & Data Structures';
    case 'CIVIL':
      return 'Structural & Engineering Mechanics';
    default:
      return domain;
  }
}

export function getDomainColor(domain: SimulationDomain): {
  primary: string;
  badgeBg: string;
  badgeText: string;
  border: string;
} {
  switch (domain) {
    case 'MATHEMATICS':
      return {
        primary: '#6366f1',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
        badgeText: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800/40',
      };
    case 'PHYSICS':
      return {
        primary: '#0ea5e9',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
        badgeText: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-200 dark:border-sky-800/40',
      };
    case 'CHEMISTRY':
      return {
        primary: '#b45309',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/40',
      };
    case 'COMPUTER_SCIENCE':
      return {
        primary: '#10b981',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/40',
      };
    case 'CIVIL':
      return {
        primary: '#f59e0b',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/40',
      };
    default:
      return {
        primary: '#64748b',
        badgeBg: 'bg-slate-50 dark:bg-slate-900',
        badgeText: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800',
      };
  }
}

export function resolveSubjectDomain(subject: {
  subjectCode?: string;
  subjectName?: string;
  department?: any;
}): SimulationDomain {
  const code = (subject.subjectCode || '').toUpperCase();
  const name = (subject.subjectName || '').toLowerCase();
  const deptCode = (
    typeof subject.department === 'object' && subject.department?.code
      ? subject.department.code
      : ''
  ).toUpperCase();
  const deptName = (
    typeof subject.department === 'object' && subject.department?.name
      ? subject.department.name
      : ''
  ).toLowerCase();

  // 1. Mathematics
  if (
    code.startsWith('MA') ||
    code.startsWith('MATH') ||
    code.startsWith('U25MA') ||
    name.includes('probability') ||
    name.includes('mathematics') ||
    name.includes('calculus') ||
    name.includes('algebra') ||
    name.includes('statistics') ||
    name.includes('numerical methods') ||
    name.includes('discrete')
  ) {
    return 'MATHEMATICS';
  }

  // 2. Engineering Chemistry
  if (
    code.startsWith('CY') ||
    code.startsWith('CHEM') ||
    name.includes('chemistry') ||
    name.includes('polymer') ||
    name.includes('corrosion') ||
    name.includes('electrochem') ||
    deptName.includes('chemistry')
  ) {
    return 'CHEMISTRY';
  }

  // 3. Physics & Engineering Mechanics
  if (
    code.startsWith('PH') ||
    code.startsWith('PHY') ||
    code.includes('RPH') ||
    code.includes('PHU') ||
    code.includes('ME3251') ||
    code.includes('GE3251') ||
    code.includes('U25ME304') ||
    code.includes('ME3391') ||
    code.includes('ME8351') ||
    code.includes('U25ME302') ||
    code.includes('ME3392') ||
    code.includes('ME8491') ||
    code.includes('ME6403') ||
    code.includes('U25EE305') ||
    code.includes('ME3393') ||
    code.includes('EE8353') ||
    code.includes('EE6351') ||
    name.includes('electrical drives') ||
    name.includes('drives and control') ||
    name.includes('manufacturing technology') ||
    name.includes('manufacturing') ||
    name.includes('machining') ||
    name.includes('materials and metallurgy') ||
    name.includes('metallurgy') ||
    name.includes('material science') ||
    name.includes('physics') ||
    name.includes('optics') ||
    name.includes('electromagnetics') ||
    name.includes('quantum') ||
    name.includes('data storage') ||
    name.includes('engineering mechanics') ||
    name === 'mechanics' ||
    deptName.includes('physics') ||
    deptName.includes('mechanical')
  ) {
    return 'PHYSICS';
  }

  // 4. Civil, Makerspace & Physics for Civil Engineers
  if (
    code.startsWith('CE') ||
    code.startsWith('CIVIL') ||
    code.includes('U25RCE201') ||
    code.includes('U25CE201') ||
    code.includes('U25RGE01') ||
    code.includes('U25RGEO1') ||
    code.includes('U25GE201') ||
    code.includes('U25RPH06') ||
    code.includes('U25PH202') ||
    code.includes('U25RPH202') ||
    code.includes('U25RME201') ||
    code.includes('U25ME201') ||
    deptCode === 'CIVIL' ||
    deptCode === 'CE' ||
    deptCode === 'CIV' ||
    deptName.includes('civil') ||
    name.includes('civil') ||
    name.includes('makerspace') ||
    name.includes('physics for civil') ||
    name.includes('structural') ||
    name.includes('surveying') ||
    name.includes('concrete') ||
    name.includes('mechanics of solids') ||
    name.includes('fluid mechanics') ||
    name.includes('geotechnical') ||
    name.includes('construction')
  ) {
    return 'CIVIL';
  }

  // 5. Computer Science
  return 'COMPUTER_SCIENCE';
}

/** True when the simulation is one of the Engineering Materials and Metallurgy simulations. */
export function isSmartBoardMetallurgySimulation(def?: { boardEngine?: string; id?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'materials-metallurgy' ||
        (def.id && def.id.startsWith('u25me302-')) ||
        (def.id && def.id.includes('metallurgy')))
  );
}

/** True when the simulation is one of the Manufacturing Technology - I simulations. */
export function isSmartBoardManufacturingTechSimulation(def?: { boardEngine?: string; id?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'manufacturing-tech' ||
        (def.id && def.id.startsWith('u25me304-')) ||
        (def.id && def.id.includes('manufacturing-tech')))
  );
}

/** True when the simulation is one of the Makerspace workshop simulations. */
export function isSmartBoardMakerspaceSimulation(def?: { boardEngine?: string } | null): boolean {
  return Boolean(def && def.boardEngine === 'makerspace');
}

/** True when the simulation is one of the Engineering Physics simulations that open on the Smart Board. */
export function isSmartBoardEpSimulation(def?: { boardEngine?: string } | null): boolean {
  return Boolean(def && def.boardEngine === 'ep');
}

/** True when the simulation is one of the legacy 2D Engineering Chemistry simulations that open on the Smart Board canvas. */
export function isSmartBoardChemSimulation(def?: { boardEngine?: string; id?: string } | null): boolean {
  if (!def || !def.id) return false;
  const is3D = /chem-(molecular|organic|stereo|aromatic|polymerization|coordination|phase|adsorption|chromatograph|spectroscop)/i.test(def.id);
  if (is3D) return false;
  return Boolean(def.boardEngine === 'chem' || def.id.startsWith('chem-'));
}

/** Teacher's published configuration of an Engineering Physics simulation (stored in Content.simulationConfig.initialParams). */
export interface IEpPublishedConfig {
  simulationType?: 'engineering-physics' | 'engineering-graphics' | 'engineering-mathematics' | string;
  simulationSubtype?: string;
  defaultParameters?: Record<string, unknown>;
  visualizationMode?: string;
  steps?: string[];
}

/** True when the simulation is one of the Engineering Graphics simulations that open on the Smart Board. */
export function isSmartBoardEgSimulation(def?: { boardEngine?: string } | null): boolean {
  return Boolean(def && def.boardEngine === 'eg');
}

/** True when the simulation is one of the Engineering Mathematics simulations that open on the Smart Board. */
export function isSmartBoardMaSimulation(def?: { boardEngine?: string } | null): boolean {
  return Boolean(def && def.boardEngine === 'ma');
}

/** True when the simulation is one of the Electrical & Electronics (U21EEG01) simulations that open on the Smart Board. */
export function isSmartBoardEeSimulation(def?: { boardEngine?: string } | null): boolean {
  return Boolean(def && def.boardEngine === 'ee');
}

/** True when the simulation is one of the Digital Electronics (U21ECG01) simulations that open on the Smart Board. */
export function isSmartBoardEcgSimulation(def?: { id?: string; ecgCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.ecgCategory || def.boardEngine === 'ecg' || (def.id && (def.id.startsWith('de-') || def.id.startsWith('ecg-')))));
}

/** True when the simulation is one of the Linux and Shell Scripting (U25CS202) simulations that open on the Smart Board. */
export function isSmartBoardShSimulation(def?: { id?: string; shCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.shCategory || def.boardEngine === 'sh' || (def.id && (def.id.startsWith('u25cs202-') || def.id.startsWith('sh-') || def.id.startsWith('linux-')))));
}

/** True when the simulation is one of the Python Programming (U25CS201) simulations that open on the Smart Board. */
export function isSmartBoardPySimulation(def?: { id?: string; pyCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.pyCategory || def.boardEngine === 'py' || (def.id && (def.id.startsWith('u25cs201-') || def.id.startsWith('py-') || def.id.startsWith('python-')))));
}

/** True when the simulation is one of the Probability and Statistics (U25MA301 / U25MA302) simulations that open on the Smart Board. */
export function isSmartBoardPsSimulation(def?: { id?: string; psCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.psCategory || def.boardEngine === 'ps' || (def.id && (def.id.startsWith('u25ma301-') || def.id.startsWith('u25ma302-') || def.id.startsWith('ps-') || def.id.startsWith('prob-')))));
}

/** True when the simulation is one of the Computer Organization and Architecture (U25CS305) simulations that open on the Smart Board. */
export function isSmartBoardCoaSimulation(def?: { id?: string; coaCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.coaCategory || def.boardEngine === 'coa' || (def.id && (def.id.startsWith('u25cs305-') || def.id.startsWith('u21cs301-') || def.id.startsWith('coa-')))));
}

/** True when the simulation is one of the Database Management Systems (U25CS401) simulations that open on the Smart Board. */
export function isSmartBoardDbmsSimulation(def?: { id?: string; dbmsCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.dbmsCategory || def.boardEngine === 'dbms' || (def.id && (def.id.startsWith('u25cs401-') || def.id.startsWith('u21cs302-') || def.id.startsWith('u21it302-') || def.id.startsWith('dbms-') || def.id.startsWith('sql-')))));
}

/** True when the simulation is one of the Object Oriented Programming Using Java Laboratory (U25CS311) simulations that open on the Smart Board. */
export function isSmartBoardJavaSimulation(def?: { id?: string; javaCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.javaCategory || def.boardEngine === 'java' || (def.id && (def.id.startsWith('u25cs311-') || def.id.startsWith('u21ad307-') || def.id.startsWith('u21cs307-') || def.id.startsWith('java-')))));
}

/** True when the simulation is one of the Discrete Mathematics (U25MA401 / U21MAG02) simulations that open on the Smart Board. */
export function isSmartBoardDmSimulation(def?: { id?: string; dmCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.dmCategory || def.boardEngine === 'dm' || (def.id && (def.id.startsWith('u25ma401-') || def.id.startsWith('u21mag02-') || def.id.startsWith('dm-')))));
}

/** True when the simulation is one of the Design and Analysis of Algorithms (U25CS403 / U21CS401) simulations that open on the Smart Board. */
export function isSmartBoardDaaSimulation(def?: { id?: string; daaCategory?: string; boardEngine?: string } | null): boolean {
  return Boolean(def && (def.daaCategory || def.boardEngine === 'daa' || (def.id && (def.id.startsWith('u25cs403-') || def.id.startsWith('u21cs401-') || def.id.startsWith('daa-')))));
}

/** True when the simulation is one of the Strength of Materials (U25CE301) simulations that open on the Smart Board. */
export function isSmartBoardSomSimulation(def?: { id?: string; category?: string; boardEngine?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'som' ||
        def.category === 'strength of materials' ||
        (def.id && (def.id.startsWith('u25ce301-') || def.id.startsWith('som-'))))
  );
}

/** True when the simulation is one of the Concrete Technology (U25CE304) simulations that open on the Smart Board. */
export function isSmartBoardConcreteSimulation(def?: { id?: string; category?: string; boardEngine?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'concrete' ||
        def.category === 'concrete technology' ||
        (def.id && (def.id.startsWith('u25ce304-') || def.id.startsWith('concrete-'))))
  );
}

/** True when the simulation is one of the Fluid Mechanics & Hydraulic Engineering (U25CE401 / U25CE406) simulations. */
export function isSmartBoardHydraulicSimulation(def?: { id?: string; category?: string; boardEngine?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'hydraulic' ||
        def.category === 'fluid mechanics' ||
        (def.id && (def.id.startsWith('u25ce401-') || def.id.startsWith('u25ce406-') || def.id.startsWith('hydraulic-'))))
  );
}

/** True when the simulation is one of the Geotechnical Engineering I (U25CE404) simulations. */
export function isSmartBoardGeotechnicalSimulation(def?: { id?: string; category?: string; boardEngine?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'geotechnical' ||
        def.category === 'geotechnical engineering' ||
        (def.id && (def.id.startsWith('u25ce404-') || def.id.startsWith('geotechnical-') || def.id.startsWith('soil-'))))
  );
}

/** True when the simulation is one of the Highway Engineering (U25CE402) simulations. */
export function isSmartBoardHighwaySimulation(def?: { id?: string; category?: string; boardEngine?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'highway' ||
        def.category === 'highway engineering' ||
        (def.id && (def.id.startsWith('u25ce402-') || def.id.startsWith('highway-') || def.id.startsWith('pavement-'))))
  );
}

/** True when the simulation is one of the Water Supply and Wastewater Engineering (U25CE403) simulations. */
export function isSmartBoardWaterSimulation(def?: { id?: string; category?: string; boardEngine?: string } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'water' ||
        def.category === 'environmental engineering' ||
        (def.id &&
          (def.id.startsWith('u25ce403-') ||
            def.id.startsWith('u25ce405-') ||
            def.id.startsWith('u25ce411-') ||
            def.id.startsWith('water-') ||
            def.id.startsWith('wtp-') ||
            def.id.startsWith('wwtp-'))))
  );
}

/** True when the simulation is one of the Fluid Mechanics & Machinery (U25MEG05 / U25ME304) simulations. */
export function isFluidMachinerySimulation(def?: { id?: string; category?: string; boardEngine?: string; subjectKeywords?: string[] } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'fluid-machinery' ||
        def.category === 'fluid-machinery' ||
        (def.id &&
          (def.id.startsWith('u25me-') ||
            def.id.startsWith('u25meg05-') ||
            def.id.startsWith('u25me304-') ||
            def.id.startsWith('fmm-'))))
  );
}

/** True when the simulation is one of the Mechanics of Solids (U25ME303 / TwL) simulations. */
export function isMechanicsSolidsSimulation(def?: { id?: string; category?: string; boardEngine?: string; subjectKeywords?: string[] } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'mechanics-solids' ||
        def.category === 'mechanics of solids' ||
        (def.id &&
          (def.id.startsWith('u25me303-') ||
            def.id.startsWith('mos-') ||
            def.id.startsWith('solid-mechanics-'))))
  );
}

/** True when the simulation is one of the Electrical Drives and Control (U25EE305 / ME3393) simulations. */
export function isSmartBoardElectricalDrivesSimulation(def?: { id?: string; category?: string; boardEngine?: string; subjectKeywords?: string[] } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'electrical-drives' ||
        def.category === 'electrical-drives' ||
        def.category === 'electrical & electronics' ||
        (def.id &&
          (def.id.startsWith('u25ee305-') ||
            def.id.startsWith('edc-') ||
            def.id.startsWith('electrical-drives-'))))
  );
}

/** True when the simulation is one of the Numerical Methods and Partial Differential Equations (U25MA402 / MA3351) simulations. */
export function isSmartBoardNumericalMethodsSimulation(def?: { id?: string; category?: string; boardEngine?: string; subjectKeywords?: string[] } | null): boolean {
  return Boolean(
    def &&
      (def.boardEngine === 'numerical-methods' ||
        def.category === 'numerical methods' ||
        (def.id &&
          (def.id.startsWith('u25ma402-') ||
            def.id.startsWith('num-') ||
            def.id.startsWith('pde-') ||
            def.id.startsWith('numerical-'))))
  );
}



/** One Challenge-mode attempt stored in SimulationActivity.challengeAttempts. */
export interface ISimulationChallengeAttempt {
  _id?: string;
  student?: { _id: string; name?: string; email?: string; rollNumber?: string } | string;
  challengeId: string;
  kind: string;
  prompt: string;
  target: number;
  unit?: string;
  tolerance: number;
  configuration?: Record<string, unknown>;
  answer?: { value?: number | null; text?: string };
  calculation?: string;
  attempt: number;
  result: 'CORRECT' | 'INCORRECT';
  verified: boolean;
  serverValue?: number | null;
  submittedAt: string;
}
