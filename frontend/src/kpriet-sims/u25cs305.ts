import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25CS305 / U21CS301
 * Course Name: Computer Organization and Architecture
 * Semester: III | Category: PCC | Credits: 3 | Regulation: R2025 CBCS
 * Common to: IT, CSE, AI&DS, AI&ML, Cyber Security (SC), CSBS (CB)
 *
 * Uses isolated Smart Board Computer Architecture Engine architecture (boardEngine: 'coa')
 * Dynamic routing via smartboardPresetKey to coa-simulation.html and tools/coa-simulation.js.
 */
export const U25CS305_SUBJECT_KEYWORDS = [
  'computer organization and architecture',
  'computer organization & architecture',
  'computer organization',
  'computer architecture',
  'u25cs305',
  'u21cs301',
  'cs305',
  'cs301',
  'coa',
];

function u25coaSimulation(def: {
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
    boardEngine: 'coa',
    domain: 'COMPUTER_SCIENCE',
    category: 'computer architecture',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25CS305_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with interactive processor datapath diagrams, clock cycle state machine transitions, pipeline reservation matrices, and an integrated Computer Architecture AI assistant.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    tags: ['U25CS305', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Computer Organization', 'Architecture', 'R2025 CBCS'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ active: true, cycle: 1 }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25CS305_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — COMPUTER STRUCTURE, BUSES & EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════
  u25coaSimulation({
    id: 'u25cs305-computer-structure',
    unit: 1,
    unitTitle: 'Computer Structure, Buses & Execution',
    topic: 'Computer Structure & Buses',
    title: 'Interactive Computer System & Bus Architecture ⭐',
    icon: '🖥️',
    flagship: true,
    shortDescription: 'Explore the fundamental Von Neumann architecture: CPU, Memory, and I/O interconnected by system Data, Address, and Control buses.',
    learningObjectives: [
      'Understand how address, data, and control lines interconnect CPU, memory, and peripherals',
      'Calculate maximum directly addressable memory space from address bus width: 2^k bytes',
      'Trace control line assertion during memory read and memory write handshakes',
    ],
    formulaOverview: '\\text{Bus Width: } 2^k \\text{ Addressable Bytes} \\quad | \\quad \\text{Throughput} = \\text{Bus Width} \\times \\text{Bus Clock}',
    parameters: [
      { key: 'busWidth', label: 'Address Bus Width', type: 'select', default: '32', options: [
        { label: '16-bit (64 KB addressable)', value: '16' },
        { label: '20-bit 8086 (1 MB addressable)', value: '20' },
        { label: '32-bit x86/ARM (4 GB addressable)', value: '32' },
        { label: '48-bit Virtual (256 TB addressable)', value: '48' },
      ]},
      { key: 'activeTransfer', label: 'Active Transfer', type: 'select', default: 'cpu_to_mem', options: [
        { label: 'CPU → Memory Write', value: 'cpu_to_mem' },
        { label: 'Memory → CPU Read (Fetch)', value: 'mem_to_cpu' },
        { label: 'DMA Controller → Memory Transfer', value: 'dma_to_mem' },
      ]},
    ],
    metrics: [
      { key: 'addressableMemory', label: 'Max RAM', unit: '' },
      { key: 'busClock', label: 'Clock', unit: 'MHz' },
      { key: 'busThroughput', label: 'Throughput', unit: 'MB/s' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-instruction-execution',
    unit: 1,
    unitTitle: 'Computer Structure, Buses & Execution',
    topic: 'Instruction Execution',
    title: 'Single-Cycle Instruction Execution & Register Transfer Lab',
    icon: '⚙️',
    shortDescription: 'Trace register transfers step-by-step across PC, MAR, MBR, IR, and AC during the basic instruction fetch and execute phases.',
    learningObjectives: [
      'Trace microscopic register transfer steps during Instruction Fetch and Execute',
      'Explain the purpose of Program Counter (PC), Memory Address Register (MAR), and Instruction Register (IR)',
      'Inspect Accumulator updates following arithmetic instruction completion',
    ],
    formulaOverview: '\\text{Fetch: } [\\text{MAR}] \\leftarrow [\\text{PC}], \\; [\\text{MBR}] \\leftarrow \\text{M}[\\text{MAR}], \\; [\\text{IR}] \\leftarrow [\\text{MBR}], \\; [\\text{PC}] \\leftarrow [\\text{PC}] + 1',
    parameters: [
      { key: 'opcode', label: 'Instruction Opcode', type: 'select', default: 'ADD', options: [
        { label: 'ADD (Accumulator = AC + Mem[X])', value: 'ADD' },
        { label: 'LOAD (Accumulator = Mem[X])', value: 'LOAD' },
        { label: 'STORE (Mem[X] = Accumulator)', value: 'STORE' },
      ]},
    ],
    metrics: [
      { key: 'pcVal', label: 'PC', unit: '' },
      { key: 'marVal', label: 'MAR', unit: '' },
      { key: 'mbrVal', label: 'MBR', unit: '' },
      { key: 'acVal', label: 'AC', unit: '' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-alu-arithmetic',
    unit: 1,
    unitTitle: 'Computer Structure, Buses & Execution',
    topic: 'ALU Operations & Flags',
    title: 'ALU Arithmetic, Logic & Status Flags Lab',
    icon: '🧮',
    shortDescription: 'Perform 8-bit two\'s complement binary operations in the ALU and observe status condition code flags: Zero (Z), Sign (S), Carry (C), and Overflow (V).',
    learningObjectives: [
      'Perform 8-bit signed two\'s complement addition, subtraction, and bitwise operations',
      'Distinguish between unsigned Carry (C) and signed arithmetic Overflow (V)',
      'Analyze Zero (Z) and Sign (S) flag generation in hardware ALUs',
    ],
    formulaOverview: 'V = C_{in} \\oplus C_{out} \\quad | \\quad Z = \\neg (A_7 \\lor A_6 \\lor \\dots \\lor A_0) \\quad | \\quad S = A_7',
    parameters: [
      { key: 'operandA', label: 'Operand A', type: 'range', min: -128, max: 127, step: 1, default: 110 },
      { key: 'operandB', label: 'Operand B', type: 'range', min: -128, max: 127, step: 1, default: 25 },
      { key: 'operation', label: 'ALU Op', type: 'select', default: 'add', options: [
        { label: 'ADD (A + B)', value: 'add' },
        { label: 'SUB (A - B)', value: 'sub' },
        { label: 'AND (A & B)', value: 'and' },
        { label: 'OR (A | B)', value: 'or' },
        { label: 'XOR (A ^ B)', value: 'xor' },
      ]},
    ],
    metrics: [
      { key: 'aluResult', label: 'Result', unit: '' },
      { key: 'flagZ', label: 'Zero Flag (Z)', unit: '' },
      { key: 'flagS', label: 'Sign Flag (S)', unit: '' },
      { key: 'flagC', label: 'Carry Flag (C)', unit: '' },
      { key: 'flagV', label: 'Overflow (V)', unit: '' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-cpu-performance',
    unit: 1,
    unitTitle: 'Computer Structure, Buses & Execution',
    topic: 'Performance & Amdahl\'s Law',
    title: 'CPU Execution Time & Amdahl\'s Law Calculator',
    icon: '⏱️',
    shortDescription: 'Calculate CPU performance using the iron law of processor performance (CPU Time = IC × CPI × Clock Cycle Time) and evaluate Amdahl\'s speedup bounds.',
    learningObjectives: [
      'Apply the classic processor performance equation: CPU Time = Instruction Count * CPI * Clock Cycle Time',
      'Calculate speedup limits using Amdahl\'s Law based on parallelizable fraction f and speedup s',
      'Evaluate why the serial fraction acts as a hard barrier to infinite multicore scaling',
    ],
    formulaOverview: '\\text{CPU Time} = I_c \\times \\text{CPI} \\times \\tau \\quad | \\quad S = \\frac{1}{(1 - f) + \\frac{f}{s}}',
    parameters: [
      { key: 'enhancedFraction', label: 'Parallel Fraction (f)', type: 'range', min: 0.1, max: 0.99, step: 0.05, default: 0.75 },
      { key: 'speedupFactor', label: 'Subsystem Speedup (s)', type: 'range', min: 1.5, max: 32.0, step: 0.5, default: 4.0 },
      { key: 'clockGhz', label: 'Clock Speed', type: 'range', min: 0.5, max: 5.0, step: 0.25, default: 2.5 },
    ],
    metrics: [
      { key: 'speedupTotal', label: 'Overall Speedup', unit: '×' },
      { key: 'maxAmdahl', label: 'Asymptotic Limit', unit: '×' },
      { key: 'executionTime', label: 'CPU Time', unit: 'ms' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — DATAPATH & CONTROL UNITS
  // ═══════════════════════════════════════════════════════════════════════════
  u25coaSimulation({
    id: 'u25cs305-datapath-control',
    unit: 2,
    unitTitle: 'Datapath & Control Units',
    topic: 'Datapath & Control Signals',
    title: 'Single-Cycle Datapath & Control Signal Matrix ⭐',
    icon: '🔌',
    flagship: true,
    shortDescription: 'Trace multiplexer selections and 9 essential control signals (RegDst, ALUSrc, MemtoReg, RegWrite, MemRead, MemWrite, Branch, ALUOp) for R-type, lw, sw, and beq instructions.',
    learningObjectives: [
      'Trace data movement through PC, Instruction Memory, Register File, ALU, and Data Memory',
      'Determine the binary values of all 9 control signals for R-type, LW, SW, and Branch instructions',
      'Understand how multiplexer select lines route operands between register and immediate sources',
    ],
    formulaOverview: '\\text{Control Signals: } [\\text{RegWrite}, \\text{ALUSrc}, \\text{MemWrite}, \\text{MemRead}, \\text{Branch}, \\dots]',
    parameters: [
      { key: 'instructionType', label: 'Instruction Format', type: 'select', default: 'R-type', options: [
        { label: 'R-type (ADD $rd, $rs, $rt)', value: 'R-type' },
        { label: 'Load Word (LW $rt, offset($rs))', value: 'LW' },
        { label: 'Store Word (SW $rt, offset($rs))', value: 'SW' },
        { label: 'Branch On Equal (BEQ $rs, $rt, offset)', value: 'BEQ' },
      ]},
    ],
    metrics: [
      { key: 'regDst', label: 'RegDst', unit: '' },
      { key: 'aluSrc', label: 'ALUSrc', unit: '' },
      { key: 'memToReg', label: 'MemtoReg', unit: '' },
      { key: 'regWrite', label: 'RegWrite', unit: '' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-instruction-cycle',
    unit: 2,
    unitTitle: 'Datapath & Control Units',
    topic: 'Instruction Cycle FSM',
    title: 'Multi-State Instruction Cycle State Machine',
    icon: '🔄',
    shortDescription: 'Step through the multi-state finite state machine: Fetch, Instruction Decode/Register Read, Execution/Address Calculation, Memory Access, and Write-Back.',
    learningObjectives: [
      'Decompose instruction execution into discrete clock cycle states',
      'Explain why different instruction classes require different numbers of clock cycles (3 to 5 cycles)',
      'Inspect state register transitions on consecutive clock pulses',
    ],
    formulaOverview: '\\text{State Transition: } S_0 \\to S_1 \\to S_2 \\to S_3 \\to S_4 \\to S_0',
    parameters: [
      { key: 'instructionClass', label: 'Instruction Class', type: 'select', default: 'R-type', options: [
        { label: 'R-type Arithmetic (4 cycles)', value: 'R-type' },
        { label: 'Load Word (5 cycles)', value: 'LW' },
        { label: 'Store Word (4 cycles)', value: 'SW' },
        { label: 'Branch Equal (3 cycles)', value: 'BEQ' },
      ]},
    ],
    metrics: [
      { key: 'currentState', label: 'Active State', unit: '' },
      { key: 'cyclesNeeded', label: 'Total Cycles', unit: 'cycles' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-hardwired-control',
    unit: 2,
    unitTitle: 'Datapath & Control Units',
    topic: 'Hardwired Control Units',
    title: 'Hardwired Control Unit & Timing Pulse Generator',
    icon: '⚡',
    shortDescription: 'Inspect combinational logic networks, instruction decoders, and ring-counter timing steps (T0, T1, T2, T3) that generate control signals with minimum latency.',
    learningObjectives: [
      'Construct boolean control equations combining Opcode, Timing pulses (T_i), and Status Flags',
      'Analyze ring counter and Johnson counter timing signal generation',
      'Evaluate advantages of hardwired control: maximum clock speed and minimal silicon latency',
    ],
    formulaOverview: 'C_i = \\sum (\\text{Opcode}_j \\cdot T_k \\cdot \\text{Condition}_m)',
    parameters: [
      { key: 'timingStep', label: 'Timing Pulse', type: 'select', default: 'T0', options: [
        { label: 'Pulse T0 (Fetch: MAR ← PC)', value: 'T0' },
        { label: 'Pulse T1 (Fetch: MBR ← Mem, PC ← PC+1)', value: 'T1' },
        { label: 'Pulse T2 (Decode: IR ← MBR)', value: 'T2' },
        { label: 'Pulse T3 (Execute: ALU operation)', value: 'T3' },
      ]},
    ],
    metrics: [
      { key: 'activePulse', label: 'Active Pulse', unit: '' },
      { key: 'assertedSignals', label: 'Asserted Controls', unit: '' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-microprogrammed-control',
    unit: 2,
    unitTitle: 'Datapath & Control Units',
    topic: 'Microprogrammed Control',
    title: 'Microprogrammed Control Unit & Control Memory ROM',
    icon: '💾',
    shortDescription: 'Step through micro-instructions in Control Memory (CM) utilizing the Control Address Register (CAR), micro-sequencer, and control data registers.',
    learningObjectives: [
      'Understand the architecture of Control Memory (ROM) and Control Address Register (CAR)',
      'Trace micro-routine address sequencing and branch condition multiplexing',
      'Contrast horizontal micro-instructions (wide, unencoded) with vertical micro-instructions (narrow, encoded)',
    ],
    formulaOverview: '\\text{CAR} \\leftarrow \\text{Next Address Field} \\quad \\text{or} \\quad \\text{Mapping Logic}(\\text{IR})',
    parameters: [
      { key: 'format', label: 'Microcode Format', type: 'select', default: 'horizontal', options: [
        { label: 'Horizontal (Parallel Control Bits)', value: 'horizontal' },
        { label: 'Vertical (Decoded Micro-fields)', value: 'vertical' },
      ]},
    ],
    metrics: [
      { key: 'carAddress', label: 'CAR Address', unit: '' },
      { key: 'microWordBits', label: 'Control Word', unit: 'bits' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — INSTRUCTION PIPELINING, HAZARDS & RISC/CISC
  // ═══════════════════════════════════════════════════════════════════════════
  u25coaSimulation({
    id: 'u25cs305-pipeline-stages',
    unit: 3,
    unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
    topic: '5-Stage Pipelining',
    title: '5-Stage Classic RISC Pipeline Simulator ⭐',
    icon: '🏭',
    flagship: true,
    shortDescription: 'Simulate concurrent execution across IF (Instruction Fetch), ID (Decode), EX (Execute), MEM (Memory), and WB (Write-back) with clock space-time reservation tables.',
    learningObjectives: [
      'Observe concurrent instruction progression across 5 classic RISC pipeline stages',
      'Compute theoretical pipeline speedup S_k = (n * k) / (k + n - 1)',
      'Calculate instruction throughput and clock cycle overhead',
    ],
    formulaOverview: '\\text{Speedup } S_k = \\frac{n \\cdot k}{k + n - 1} \\xrightarrow{n \\to \\infty} k \\quad | \\quad \\text{Throughput} = \\frac{n}{(k + n - 1)\\tau}',
    parameters: [
      { key: 'numInstructions', label: 'Number of Instructions (n)', type: 'range', min: 4, max: 12, step: 1, default: 6 },
      { key: 'clockGhz', label: 'Pipeline Frequency', type: 'range', min: 1.0, max: 4.0, step: 0.5, default: 2.0 },
    ],
    metrics: [
      { key: 'speedupVal', label: 'Pipeline Speedup', unit: '×' },
      { key: 'totalCycles', label: 'Total Cycles', unit: 'cycles' },
      { key: 'cpiIdeal', label: 'Asymptotic CPI', unit: '' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-pipeline-hazards',
    unit: 3,
    unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
    topic: 'Pipeline Hazards & Forwarding',
    title: 'Pipeline Hazards & Data Forwarding Lab ⭐',
    icon: '⚠️',
    flagship: true,
    shortDescription: 'Detect Read-After-Write (RAW) data hazards, insert stall bubbles, and resolve dependencies via ALU forwarding paths (EX→EX, MEM→EX).',
    learningObjectives: [
      'Identify Read-After-Write (RAW), Write-After-Read (WAR), and Structural hazards in pipelined processors',
      'Demonstrate how forwarding multiplexers route ALU outputs directly to preceding stages',
      'Understand why Load-Use data hazards require at least 1 mandatory stall bubble even with forwarding',
    ],
    formulaOverview: '\\text{Stall Penalty: } CPI_{\\text{pipe}} = 1 + \\text{Stalls}_{\\text{data}} + \\text{Stalls}_{\\text{control}}',
    parameters: [
      { key: 'forwarding', label: 'Data Forwarding Bypass', type: 'select', default: 'enabled', options: [
        { label: 'Enabled (EX/MEM → ID/EX & MEM/WB → ID/EX)', value: 'enabled' },
        { label: 'Disabled (Insert 2 Stall Bubbles)', value: 'disabled' },
      ]},
      { key: 'hazardType', label: 'Hazard Type', type: 'select', default: 'RAW_alu', options: [
        { label: 'RAW ALU Dependency (ADD followed by SUB)', value: 'RAW_alu' },
        { label: 'Load-Use Data Hazard (LW followed by ADD)', value: 'RAW_load_use' },
      ]},
    ],
    metrics: [
      { key: 'stallCycles', label: 'Stall Cycles', unit: 'bubbles' },
      { key: 'effectiveCpi', label: 'Effective CPI', unit: '' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-branch-prediction',
    unit: 3,
    unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
    topic: 'Branch Prediction',
    title: 'Branch Prediction & Control Hazard Penalty Lab',
    icon: '🔀',
    shortDescription: 'Compare static branch strategies (always taken, always not taken) with dynamic 2-bit saturating counter predictors (Strongly Taken to Strongly Not Taken).',
    learningObjectives: [
      'Quantify the control hazard penalty caused by branch instruction pipeline flushes',
      'Trace state transitions of 2-bit saturating counter hysteresis predictors',
      'Demonstrate how dynamic branch prediction reduces misprediction rates in loop constructs',
    ],
    formulaOverview: '\\text{Branch Penalty Cycles} = \\text{Misprediction Rate} \\times \\text{Branch Latency}',
    parameters: [
      { key: 'predictor', label: 'Predictor Scheme', type: 'select', default: '2bit', options: [
        { label: '2-bit Dynamic Saturating Counter', value: '2bit' },
        { label: 'Static Predict Taken', value: 'static_taken' },
        { label: 'Static Predict Not-Taken', value: 'static_not_taken' },
      ]},
    ],
    metrics: [
      { key: 'predictionAccuracy', label: 'Accuracy', unit: '%' },
      { key: 'penaltyCycles', label: 'Penalty Cycles', unit: 'cycles' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-risc-vs-cisc',
    unit: 3,
    unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
    topic: 'RISC vs CISC',
    title: 'RISC vs CISC Architecture & Instruction Set Lab',
    icon: '⚖️',
    shortDescription: 'Compare RISC (fixed-length instructions, load/store architecture, many registers) with CISC (variable-length, memory-to-memory arithmetic, complex addressing).',
    learningObjectives: [
      'Compare design philosophies: Reduced Instruction Set vs Complex Instruction Set Computers',
      'Analyze trade-offs between code size, compiler complexity, instruction count, and CPI',
      'Explain how load-store architectures simplify pipeline stage balancing',
    ],
    formulaOverview: '\\text{Execution Time} = \\text{Instruction Count} \\times \\text{CPI} \\times \\text{Clock Period}',
    parameters: [
      { key: 'architecture', label: 'Architecture Type', type: 'select', default: 'RISC', options: [
        { label: 'RISC (Load/Store, Fixed 32-bit, CPI ≈ 1.2)', value: 'RISC' },
        { label: 'CISC (Memory-to-Mem, Var Length, CPI ≈ 3.5)', value: 'CISC' },
      ]},
    ],
    metrics: [
      { key: 'avgCpi', label: 'Average CPI', unit: '' },
      { key: 'instDensity', label: 'Instruction Density', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — MEMORY HIERARCHY & CACHE MEMORY
  // ═══════════════════════════════════════════════════════════════════════════
  u25coaSimulation({
    id: 'u25cs305-memory-hierarchy',
    unit: 4,
    unitTitle: 'Memory Hierarchy & Cache Memory',
    topic: 'Memory Hierarchy & AMAT',
    title: 'Memory Hierarchy & Average Memory Access Time (AMAT)',
    icon: '🏛️',
    shortDescription: 'Inspect capacity, access latency, and bandwidth pyramids from CPU registers through L1/L2/L3 caches, DRAM, and SSD storage.',
    learningObjectives: [
      'Analyze the memory hierarchy pyramid trade-off between access speed, cost per bit, and storage capacity',
      'Compute Average Memory Access Time: AMAT = Hit Time + (Miss Rate * Miss Penalty)',
      'Evaluate multi-level cache configurations (L1, L2, L3) in modern computing architectures',
    ],
    formulaOverview: '\\text{AMAT} = \\text{Hit Time}_{L1} + (\\text{Miss Rate}_{L1} \\times \\text{Miss Penalty}_{L1})',
    parameters: [
      { key: 'hitTimeL1', label: 'L1 Hit Time', type: 'range', min: 0.5, max: 2.0, step: 0.5, default: 1.0 },
      { key: 'missRateL1', label: 'L1 Miss Rate', type: 'range', min: 0.01, max: 0.20, step: 0.01, default: 0.05 },
      { key: 'missPenaltyL1', label: 'DRAM Miss Penalty', type: 'range', min: 20, max: 100, step: 10, default: 50 },
    ],
    metrics: [
      { key: 'amatVal', label: 'AMAT', unit: 'ns' },
      { key: 'effectiveLatency', label: 'Effective Latency', unit: 'cycles' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-cache-mapping',
    unit: 4,
    unitTitle: 'Memory Hierarchy & Cache Memory',
    topic: 'Cache Mapping & Policies',
    title: 'Cache Mapping (Direct, Associative & Set-Associative) Lab ⭐',
    icon: '🎯',
    flagship: true,
    shortDescription: 'Split physical memory addresses into Tag, Set Index, and Block Offset fields; trace Hits and Misses, and simulate LRU line replacement.',
    learningObjectives: [
      'Decompose 32-bit physical addresses into Tag, Index, and Offset bit fields',
      'Compare Direct-Mapped, N-Way Set-Associative, and Fully-Associative cache mapping organizations',
      'Trace Least Recently Used (LRU) line replacement and evaluate conflict vs capacity misses',
    ],
    formulaOverview: '\\text{Address Bits} = \\text{Tag Bits} + \\text{Index Bits} + \\text{Offset Bits} \\quad | \\quad \\text{Index} = \\log_2(\\text{Num Sets})',
    parameters: [
      { key: 'cacheSizeKB', label: 'Cache Capacity', type: 'select', default: '32', options: [
        { label: '16 KB', value: '16' },
        { label: '32 KB', value: '32' },
        { label: '64 KB', value: '64' },
      ]},
      { key: 'associativity', label: 'Associativity', type: 'select', default: '2', options: [
        { label: 'Direct-Mapped (1-way)', value: '1' },
        { label: '2-Way Set-Associative', value: '2' },
        { label: '4-Way Set-Associative', value: '4' },
      ]},
      { key: 'blockSize', label: 'Block Size', type: 'select', default: '64', options: [
        { label: '32 Bytes', value: '32' },
        { label: '64 Bytes', value: '64' },
      ]},
    ],
    metrics: [
      { key: 'tagBits', label: 'Tag Bits', unit: 'bits' },
      { key: 'indexBits', label: 'Index Bits', unit: 'bits' },
      { key: 'offsetBits', label: 'Offset Bits', unit: 'bits' },
      { key: 'numSets', label: 'Total Sets', unit: 'sets' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-virtual-memory',
    unit: 4,
    unitTitle: 'Memory Hierarchy & Cache Memory',
    topic: 'Virtual Memory & Paging',
    title: 'Virtual Memory, Page Tables & TLB Address Translation',
    icon: '📑',
    shortDescription: 'Translate Virtual Addresses (VPN + Offset) to Physical Addresses (PFN + Offset) using Translation Lookaside Buffers (TLB) and multi-level page tables.',
    learningObjectives: [
      'Trace Virtual-to-Physical address translation using Virtual Page Number (VPN) and Page Offset',
      'Demonstrate how hardware Translation Lookaside Buffers (TLB) speed up page address lookups',
      'Explain the page fault sequence: OS trap, disk frame fetch, page table update, and instruction restart',
    ],
    formulaOverview: '\\text{Physical Address} = [\\text{PFN} \\ll \\text{Offset Bits}] \\lor \\text{Offset} \\quad | \\quad \\text{Page Size} = 2^{\\text{Offset Bits}}',
    parameters: [
      { key: 'pageSize', label: 'Page Size', type: 'select', default: '4', options: [
        { label: '4 KB (12-bit offset)', value: '4' },
        { label: '8 KB (13-bit offset)', value: '8' },
        { label: '2 MB Huge Page (21-bit offset)', value: '2048' },
      ]},
      { key: 'tlbStatus', label: 'TLB State', type: 'select', default: 'hit', options: [
        { label: 'TLB Hit (Fast 1-cycle lookup)', value: 'hit' },
        { label: 'TLB Miss / Page Table Hit', value: 'miss_pt_hit' },
        { label: 'Page Fault (Disk read required)', value: 'page_fault' },
      ]},
    ],
    metrics: [
      { key: 'vpnBits', label: 'VPN Bits', unit: 'bits' },
      { key: 'offsetBits', label: 'Offset Bits', unit: 'bits' },
      { key: 'accessLatency', label: 'Translation Time', unit: 'ns' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — I/O ORGANIZATION, INTERRUPTS & DMA
  // ═══════════════════════════════════════════════════════════════════════════
  u25coaSimulation({
    id: 'u25cs305-io-interfacing',
    unit: 5,
    unitTitle: 'I/O Organization, Interrupts & DMA',
    topic: 'I/O Modes & Polling',
    title: 'Programmed I/O vs Interrupt-Driven I/O Explorer',
    icon: '🎛️',
    shortDescription: 'Compare the busy-waiting overhead of Programmed I/O with Interrupt-Driven I/O where the CPU executes other processes until hardware signals an IRQ.',
    learningObjectives: [
      'Compare CPU utilization between Programmed I/O polling and Interrupt-Driven transfers',
      'Trace the Interrupt Service Routine (ISR) sequence: state save, vector jump, service, and RTI restore',
      'Analyze hardware interrupt vector tables and priority masking',
    ],
    formulaOverview: '\\text{CPU Utilization Overhead} = \\frac{\\text{Polling Time}}{\\text{Total Transfer Time}} \\times 100\\%',
    parameters: [
      { key: 'ioMode', label: 'Transfer Mode', type: 'select', default: 'interrupt', options: [
        { label: 'Interrupt-Driven I/O (Async Event)', value: 'interrupt' },
        { label: 'Programmed I/O (Busy-Waiting Polling)', value: 'polling' },
      ]},
    ],
    metrics: [
      { key: 'cpuOverhead', label: 'CPU Overhead', unit: '%' },
      { key: 'latencyToServe', label: 'Response Latency', unit: 'μs' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-dma-transfer',
    unit: 5,
    unitTitle: 'I/O Organization, Interrupts & DMA',
    topic: 'DMA Transfer & Bus Master',
    title: 'Direct Memory Access (DMA) & Bus Master Controller ⭐',
    icon: '🚚',
    flagship: true,
    shortDescription: 'Simulate high-speed bulk data transfers between peripheral controllers and RAM using DMA bus requests (BR), bus grants (BG), burst mode, and cycle stealing.',
    learningObjectives: [
      'Trace the DMA handshake: Bus Request (HOLD) and Bus Grant (HLDA)',
      'Contrast Burst Mode (continuous bulk transfer) with Cycle-Stealing Mode (interleaved access)',
      'Demonstrate how DMA offloads bulk data movement from CPU register cycles',
    ],
    formulaOverview: '\\text{DMA Transfer: } \\text{Peripheral} \\longleftrightarrow \\text{Memory} \\quad (\\text{CPU in Hold State})',
    parameters: [
      { key: 'dmaMode', label: 'DMA Transfer Mode', type: 'select', default: 'burst', options: [
        { label: 'Burst Mode (Continuous Full Bus Hold)', value: 'burst' },
        { label: 'Cycle-Stealing Mode (Interleaved Transfers)', value: 'cycle_stealing' },
      ]},
      { key: 'blocksToTransfer', label: 'Transfer Size', type: 'range', min: 4, max: 64, step: 4, default: 16 },
    ],
    metrics: [
      { key: 'busHoldCycles', label: 'Bus Hold Time', unit: 'cycles' },
      { key: 'transferBandwidth', label: 'Throughput', unit: 'MB/s' },
    ],
  }),

  u25coaSimulation({
    id: 'u25cs305-bus-arbitration',
    unit: 5,
    unitTitle: 'I/O Organization, Interrupts & DMA',
    topic: 'Bus Arbitration',
    title: 'Bus Arbitration & Master Priority Resolution Lab',
    icon: '🚦',
    shortDescription: 'Simulate multi-master bus arbitration using Daisy Chaining (serial priority), Centralized Parallel Arbitration, and Distributed Dynamic Priority protocols.',
    learningObjectives: [
      'Analyze bus contention resolution among multiple concurrent Bus Masters (CPU, DMA, GPU)',
      'Examine Daisy Chaining serial priority grant propagation and starvation risks',
      'Evaluate Centralized Parallel Arbiters with Independent Request (BREQ) and Grant (BGRANT) lines',
    ],
    formulaOverview: '\\text{Bus Grant Delay: } T_{\\text{daisy}} \\propto N \\quad \\text{vs} \\quad T_{\\text{parallel}} = O(1)',
    parameters: [
      { key: 'arbitrationScheme', label: 'Arbitration Protocol', type: 'select', default: 'parallel', options: [
        { label: 'Centralized Parallel Arbiter (Fast O(1))', value: 'parallel' },
        { label: 'Daisy Chaining (Serial Grant Propagated)', value: 'daisy' },
        { label: 'Dynamic Priority (Rotating Round-Robin)', value: 'round_robin' },
      ]},
    ],
    metrics: [
      { key: 'grantLatency', label: 'Arbiter Latency', unit: 'cycles' },
      { key: 'fairnessIndex', label: 'Starvation Resistance', unit: '' },
    ],
  }),
];
