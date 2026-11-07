/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Electrical Drives and Control (U25EE305 / Engineering Science Course - ESC)
 * Official Source: Mechanical Engineering Curriculum R2025, Anna University ME3393 / EE8353 / EE6351
 */

import type { ISimulationDefinition } from './types';
import type { ElectricalDrivesSimId } from './electrical-drives-3d/core/types';

export const U25EE305_COURSE_METADATA = {
  department: 'Mechanical Engineering',
  programme: 'B.E. Mechanical Engineering',
  semester: 'Semester III',
  regulation: 'R2025 Revised CBCS',
  courseCode: 'U25EE305',
  courseCodeAliases: ['ME3393', 'EE8353', 'EE6351', 'U21EE305'],
  courseTitle: 'Electrical Drives and Control',
  category: 'ESC',
  credits: 3,
  ltpjc: '3-0-0-0-3',
  lectureHours: 45,
  labHours: 30,
  totalHours: 75,
  syllabusPages: [65, 66],
  courseObjectives: [
    'To understand the basic concepts of different types of electrical machines and their performance',
    'To study the characteristics and speed control methods of DC motors and induction motors',
    'To analyze starting and electric braking methods used in industrial drives',
    'To understand conventional and solid-state speed control including Variable Frequency Drives (VFD)',
    'To design and wire electrical control circuits, contactor latching, and protection systems',
  ],
  courseOutcomes: [
    { code: 'CO1', level: 'Understand', description: 'Classify electric drives, analyze motor-load dynamics, and evaluate load torque characteristics' },
    { code: 'CO2', level: 'Analyze', description: 'Analyze the speed-torque characteristics of DC shunt, series, and 3-phase induction motors' },
    { code: 'CO3', level: 'Apply', description: 'Select and compare motor starting methods: DOL, Star-Delta, Autotransformer, and solid-state soft starters' },
    { code: 'CO4', level: 'Apply', description: 'Evaluate conventional and solid-state speed control methods including V/f PWM inverter drives' },
    { code: 'CO5', level: 'Evaluate', description: 'Design electric braking circuits (regenerative, dynamic, plugging) and wire industrial contactor control panels' },
  ],
  units: [
    { number: 1, title: 'INTRODUCTION TO ELECTRICAL DRIVES', hours: 9, outcome: 'CO1' },
    { number: 2, title: 'MOTOR CHARACTERISTICS', hours: 9, outcome: 'CO2' },
    { number: 3, title: 'STARTING METHODS', hours: 9, outcome: 'CO3' },
    { number: 4, title: 'CONVENTIONAL AND SOLID STATE SPEED CONTROL', hours: 9, outcome: 'CO4' },
    { number: 5, title: 'ELECTRIC BRAKING AND CONTROL CIRCUITS', hours: 9, outcome: 'CO5' },
  ],
  prescribedExperiments: [
    { number: 1, name: 'Load test on DC shunt motor and determination of efficiency' },
    { number: 2, name: 'Speed control of DC shunt motor by armature voltage and field flux control methods' },
    { number: 3, name: 'Load test on 3-phase squirrel cage induction motor' },
    { number: 4, name: 'No-load and blocked rotor tests on 3-phase induction motor to determine equivalent circuit parameters' },
    { number: 5, name: 'Study and wiring of Direct-On-Line (DOL) and Star–Delta starters' },
    { number: 6, name: 'Speed control of 3-phase induction motor using Variable Frequency Drive (VFD)' },
    { number: 7, name: 'Dynamic and plugging braking of DC and induction motors' },
    { number: 8, name: 'Wiring of forward-reverse motor control circuit with contactor interlocks' },
  ],
};

export const U25EE305_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  {
    id: 'u25ee305-sim-01',
    title: 'DC Motor & Speed Control Laboratory',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '⚡',
    shortDescription: 'Interactive 3D DC motor with armature voltage control, field weakening, and back EMF dynamics.',
    detailedDescription:
      'High-fidelity 3D DC motor model with cutaway stator yoke, 4 laminated pole shoes, commutator, and carbon brushes. Adjust armature voltage (0-250V), field flux ratio, and external armature resistance to observe rotational speed, back EMF Eb = V - IaRa, and developed torque Te = kt·Φ·Ia.',
    learningObjectives: [
      'Understand the energy conversion process and back EMF opposing supply voltage in DC motors',
      'Analyze speed control below base speed by armature voltage control and above base speed by field weakening',
      'Examine the dangerous runaway speed of DC series motors under no-load conditions',
    ],
    formulaOverview: 'V = Eb + Ia·Ra; Eb = ke·Φ·ω; Te = kt·Φ·Ia; N = 60·(V - Ia·Ra) / (2π·ke·Φ)',
    suggestedUnits: [2, 4],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'ee8353', 'electrical drives', 'dc motor', 'speed control', 'armature control', 'field weakening', 'back emf'],
    parameters: [],
    metrics: [],
    tags: ['dc motor', 'speed control', 'armature resistance', 'field weakening', 'back emf', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ee305-sim-02',
    title: '3-Phase Induction Motor & Slip Mechanics',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '🌀',
    shortDescription: '3D squirrel cage induction motor with rotating magnetic field phasor, slip analysis, and equivalent circuit.',
    detailedDescription:
      'Explore 3-phase distributed stator windings, animated Rotating Magnetic Field (RMF) phasor rotating at synchronous speed Ns = 120f/P, and rotor speed Nr = Ns(1 - s). Inspect skewed rotor bars and short-circuiting end-rings, and evaluate pull-out torque and slip.',
    learningObjectives: [
      'Visualize how a 3-phase stator creates a constant-magnitude rotating magnetic field',
      'Calculate synchronous speed Ns, rotor speed Nr, and fractional slip s = (Ns - Nr)/Ns',
      'Understand breakdown torque Tmax and maximum torque slip sm using the IEEE Thevenin equivalent circuit',
    ],
    formulaOverview: 'Ns = 120·f / P; s = (Ns - Nr) / Ns; Te = (3/ωs)·[Vth²·(R2\'/s)] / [(Rth + R2\'/s)² + (Xth + X2\')²]',
    suggestedUnits: [2],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'induction motor', 'rotating magnetic field', 'slip', 'synchronous speed', 'breakdown torque', 'rmf'],
    parameters: [],
    metrics: [],
    tags: ['induction motor', 'slip', 'rmf', 'synchronous speed', 'thevenin equivalent', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ee305-sim-03',
    title: 'Motor Starting Methods Laboratory',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '🚀',
    shortDescription: 'Comparative 3D switchgear bench for Direct-On-Line, Star-Delta, Autotransformer, and Soft Starter.',
    detailedDescription:
      'Compare inrush current spikes and starting torque ratios across Direct-On-Line (DOL, 6x inrush), Star-Delta (Y-Δ, 1/3 current and torque), Autotransformer (tap factor x²), and SCR soft starters. Observe contactor plunger actuation, timers, and acceleration curves.',
    learningObjectives: [
      'Understand why large motors require reduced-voltage starting to avoid severe supply feeder voltage dips',
      'Derive the 1/3 starting current and torque reduction for Star-Delta starters',
      'Evaluate acceleration time and mechanical shock across electromechanical and solid-state starters',
    ],
    formulaOverview: 'Y-Δ: Ist(star) = (1/3)·Ist(delta); Tst(star) = (1/3)·Tst(delta); Auto-Xfmr: Ist = x²·Ist(DOL); Tst = x²·Tst(DOL)',
    suggestedUnits: [3],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'starting methods', 'dol starter', 'star delta', 'autotransformer', 'soft starter', 'inrush current'],
    parameters: [],
    metrics: [],
    tags: ['starting methods', 'dol', 'star delta', 'autotransformer', 'soft starter', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ee305-sim-04',
    title: 'Electric Motor Braking Methods Laboratory',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '🛑',
    shortDescription: '3D heavy flywheel braking with Regenerative, Dynamic (Rheostatic), and Plugging deceleration kinetics.',
    detailedDescription:
      'Observe rapid deceleration of high-inertia rotating flywheel loads under Regenerative braking (grid power recovery), Dynamic braking (kinetic energy dissipated in glowing resistor bank), and Plugging (counter-current braking with s ≈ 2.0 and zero-speed cutoff protection).',
    learningObjectives: [
      'Differentiate energy recovery in regenerative braking from thermal dissipation in dynamic braking',
      'Analyze the dynamics of plugging and the mandatory requirement of a zero-speed switch to avoid reversal',
      'Compute kinetic energy E = (1/2)Jω² and stopping time under constant and speed-dependent braking torque',
    ],
    formulaOverview: 'J·(dω/dt) = -(Te + TL); E_kin = (1/2)·J·ω₀²; Plugging: s = (Ns - (-Nr)) / Ns = 2 - s ≈ 2.0',
    suggestedUnits: [5],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'braking methods', 'regenerative braking', 'dynamic braking', 'plugging', 'counter current', 'flywheel'],
    parameters: [],
    metrics: [],
    tags: ['braking', 'regenerative', 'dynamic braking', 'plugging', 'energy dissipation', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ee305-sim-05',
    title: 'Variable Frequency Drive (VFD / V/f Control)',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '🎛️',
    shortDescription: 'Interactive 3D VFD cabinet with diode rectifier, DC link capacitor bank, IGBT inverter, and SPWM oscilloscope.',
    detailedDescription:
      'Simulate modern Variable Frequency Drives (VFD). Vary output frequency from 5 Hz to 90 Hz and observe constant V/f ratio maintenance below 50 Hz, transition to field weakening above base frequency, and multi-trace sinusoidal PWM (SPWM) three-phase voltage pulses.',
    learningObjectives: [
      'Understand the power electronics stages of a VFD: AC-to-DC rectifier, DC link filter, and DC-to-AC IGBT inverter',
      'Explain why constant V/f ratio avoids core saturation and maintains maximum torque capability',
      'Analyze the constant-torque operating zone below base frequency and constant-power zone in field weakening',
    ],
    formulaOverview: 'V/f = const; Ns = 120·f / P; ma = V_ref / V_carrier; V_dc = √2·V_line_rms',
    suggestedUnits: [4],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'vfd', 'variable frequency drive', 'v/f control', 'spwm', 'inverter', 'igbt', 'field weakening'],
    parameters: [],
    metrics: [],
    tags: ['vfd', 'variable frequency drive', 'v/f control', 'pwm', 'igbt', 'inverter', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ee305-sim-06',
    title: 'Torque–Speed Characteristics & Load Matching',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '📈',
    shortDescription: '3D dynamometer test bench with load cell, optical encoder, and dynamic torque-speed curve mapping.',
    detailedDescription:
      'Test DC and Induction motors coupled to an eddy-current dynamometer. Plot torque vs speed curves, observe operating equilibrium point intersections with constant torque (hoists), quadratic torque (fans/pumps), and evaluate steady-state drive stability criteria dTe/dω < dTL/dω.',
    learningObjectives: [
      'Compare torque-speed profiles: DC shunt (drooping), DC series (hyperbolic), and Induction motor (peaked pull-out)',
      'Identify operating equilibrium points between motor developed torque and mechanical load torque',
      'Apply the mathematical criterion for steady-state stability in electric drive systems',
    ],
    formulaOverview: 'Te(ω) = TL(ω); dTe/dω < dTL/dω (stable equilibrium criterion); P_mech = Te·ω',
    suggestedUnits: [1, 2],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'torque speed', 'dynamometer', 'load matching', 'drive stability', 'fan pump load', 'constant torque'],
    parameters: [],
    metrics: [],
    tags: ['torque speed', 'characteristics', 'dynamometer', 'load matching', 'stability', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ee305-sim-07',
    title: 'Industrial Motor Control Circuits & MCC Panel',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '🔌',
    shortDescription: '3D Motor Control Center panel with MCB, contactor latching, thermal overload relay, and pilot lights.',
    detailedDescription:
      'Explore an industrial Motor Control Center (MCC) panel. Operate Green Start (NO) and Red Stop (NC) pushbuttons, observe auxiliary contact 13-14 seal-in latching, bimetallic thermal overload relay (95-96) tripping, and inspect illuminated current flow tracks.',
    learningObjectives: [
      'Read and trace industrial motor control schematic ladder diagrams',
      'Understand the function of auxiliary seal-in holding contacts (13-14 NO)',
      'Explain bimetallic thermal overload protection, trip curves, and electrical interlocking in forward-reverse starters',
    ],
    formulaOverview: 'Contactor M: 13-14 NO latch; OLR: 95-96 NC break; Interlock: FWD NC in REV coil, REV NC in FWD coil',
    suggestedUnits: [5],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'control circuits', 'mcc panel', 'contactor', 'overload relay', 'ladder logic', 'latching', 'interlock'],
    parameters: [],
    metrics: [],
    tags: ['control circuits', 'mcc', 'contactor', 'overload relay', 'ladder logic', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
  {
    id: 'u25ee305-sim-08',
    title: 'Virtual Electrical Drives Laboratory & Exam Suite',
    domain: 'PHYSICS',
    category: 'electrical & electronics',
    icon: '🔬',
    shortDescription: 'Complete 3D machine testing laboratory with multi-meter bench, 2-Wattmeter method, and formal report.',
    detailedDescription:
      'Comprehensive 3D electrical machines test bench: motor-generator set, 2-Wattmeter method instrumentation console, variable autotransformer, terminal patch board, observation trial logging, automated concept quiz, and formal printable laboratory record report.',
    learningObjectives: [
      'Execute syllabus-prescribed electrical drives laboratory practicals with authentic instrumentation',
      'Apply the 2-Wattmeter method to measure 3-phase power P = W1 + W2 and compute operating power factor cosφ',
      'Generate formal engineering laboratory observation tables and verified experiment records',
    ],
    formulaOverview: 'P_3ph = W1 + W2 = √3·VL·IL·cosφ; tanφ = √3·(W1 - W2) / (W1 + W2); η = P_out / P_in',
    suggestedUnits: [1, 2, 3, 4, 5],
    boardEngine: 'electrical-drives',
    subjectKeywords: ['u25ee305', 'me3393', 'electrical drives lab', 'virtual lab', 'two wattmeter method', 'power factor', 'efficiency', 'practical exam'],
    parameters: [],
    metrics: [],
    tags: ['virtual lab', 'two wattmeter', 'power factor', 'efficiency', 'lab practicals', 'u25ee305'],
    engine: {
      createInitialState: () => ({}),
      update: (s) => s,
      render: () => {},
    },
  },
];

export function resolveU25EE305SimId(id: string): ElectricalDrivesSimId | null {
  if (id.startsWith('u25ee305-sim-')) {
    return id as ElectricalDrivesSimId;
  }
  if (id.includes('dc-motor') || id.includes('armature') || id.includes('field-weakening')) {
    return 'u25ee305-sim-01';
  }
  if (id.includes('induction') || id.includes('slip') || id.includes('rmf')) {
    return 'u25ee305-sim-02';
  }
  if (id.includes('starting') || id.includes('star-delta') || id.includes('dol')) {
    return 'u25ee305-sim-03';
  }
  if (id.includes('braking') || id.includes('regenerative') || id.includes('plugging')) {
    return 'u25ee305-sim-04';
  }
  if (id.includes('vfd') || id.includes('v-f') || id.includes('inverter') || id.includes('pwm')) {
    return 'u25ee305-sim-05';
  }
  if (id.includes('torque-speed') || id.includes('dynamometer') || id.includes('load-matching')) {
    return 'u25ee305-sim-06';
  }
  if (id.includes('control-circuit') || id.includes('mcc') || id.includes('contactor') || id.includes('ladder')) {
    return 'u25ee305-sim-07';
  }
  if (id.includes('electrical-drives') || id.includes('drives-lab') || id.includes('u25ee305')) {
    return 'u25ee305-sim-08';
  }
  return null;
}
