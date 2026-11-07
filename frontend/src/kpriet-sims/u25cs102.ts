import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25CS102 (Alias: U25RCSG02)
 * Course Name: Essentials of Computing
 * Semester: I | Category: ESC | Credits: 3
 * B.Tech Information Technology & Computer Engineering (R2025 CBCS)
 * 
 * Exactly 20 Approved Core Interactive & 3D WebGL Simulations mapped across Units I to V (4 per unit).
 */
export const U25CS102_SUBJECT_KEYWORDS = [
  'essentials of computing',
  'computing fundamentals',
  'u25cs102',
  'u25rcsg02',
  'cs102',
  'rcsg02',
];

/**
 * Map legacy or abbreviated simulation IDs to the 20 approved core simulations.
 */
export const U25CS102_ALIAS_MAP: Record<string, string> = {
  'u25cs102-number-systems': 'u25cs102-number-converter',
  'u25cs102-base-converter': 'u25cs102-number-converter',
  'u25cs102-binary-addition': 'u25cs102-binary-arithmetic',
  'u25cs102-binary-subtraction': 'u25cs102-binary-arithmetic',
  'u25cs102-storage-units': 'u25cs102-data-size',
  'u25cs102-file-sizes': 'u25cs102-data-size',
  'u25cs102-encoding': 'u25cs102-multimedia-encoding',
  'u25cs102-unicode': 'u25cs102-multimedia-encoding',
  'u25cs102-hardware-explorer': 'u25cs102-hardware-explorer-3d',
  'u25cs102-computer-internals': 'u25cs102-hardware-explorer-3d',
  'u25cs102-ipo-model': 'u25cs102-ipo-journey',
  'u25cs102-data-journey': 'u25cs102-ipo-journey',
  'u25cs102-cpu-simulator': 'u25cs102-cpu-execution',
  'u25cs102-instruction-cycle': 'u25cs102-cpu-execution',
  'u25cs102-pipelining': 'u25cs102-cpu-pipeline',
  'u25cs102-pipeline-hazards': 'u25cs102-cpu-pipeline',
  'u25cs102-memory-hierarchy': 'u25cs102-memory-hierarchy-3d',
  'u25cs102-memory-pyramid': 'u25cs102-memory-hierarchy-3d',
  'u25cs102-cache': 'u25cs102-cache-locality',
  'u25cs102-cache-simulator': 'u25cs102-cache-locality',
  'u25cs102-storage': 'u25cs102-storage-filesystem',
  'u25cs102-hdd-ssd': 'u25cs102-storage-filesystem',
  'u25cs102-truth-tables': 'u25cs102-logic-gates',
  'u25cs102-boolean-logic': 'u25cs102-logic-gates',
  'u25cs102-flowchart': 'u25cs102-algorithm-builder',
  'u25cs102-algorithms': 'u25cs102-algorithm-builder',
  'u25cs102-scratch-blocks': 'u25cs102-scratch-blocks-world',
  'u25cs102-block-coding': 'u25cs102-scratch-blocks-world',
  'u25cs102-trace-table': 'u25cs102-trace-table-simulator',
  'u25cs102-algorithm-trace': 'u25cs102-trace-table-simulator',
  'u25cs102-searching': 'u25cs102-search-race',
  'u25cs102-linear-binary-search': 'u25cs102-search-race',
  'u25cs102-sorting': 'u25cs102-sorting-visualizer',
  'u25cs102-sorting-algorithms': 'u25cs102-sorting-visualizer',
  'u25cs102-decomposition': 'u25cs102-computational-decomposition',
  'u25cs102-pattern-recognition': 'u25cs102-computational-decomposition',
  'u25cs102-scheduling': 'u25cs102-os-scheduler',
  'u25cs102-process-scheduler': 'u25cs102-os-scheduler',
  'u25cs102-debugging': 'u25cs102-software-debugging',
  'u25cs102-sdlc': 'u25cs102-software-debugging',
};

export function resolveU25CS102SimId(simId: string): string {
  return U25CS102_ALIAS_MAP[simId] || simId;
}

function u25csSimulation(def: {
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
  legacy?: boolean;
}): ISimulationDefinition {
  return {
    id: def.id,
    boardEngine: 'computing',
    domain: 'COMPUTER_SCIENCE',
    category: 'essentials of computing',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25CS102_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Essentials of Computing Laboratory with interactive manipulation, step-by-step trace feedback, challenge tasks, and 5-item assessment question bank.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    tags: ['U25CS102', 'U25RCSG02', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Interactive Studio'],
    parameters: def.parameters,
    metrics: def.metrics,
    legacy: def.legacy,
    engine: {
      createInitialState: () => ({ time: 0, active: true }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25CS102_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — DIGITAL REPRESENTATION AND DATA ENCODING (Simulations 1–4)
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs102-number-converter',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Number Systems: Binary, Octal, Decimal, and Hexadecimal Conversions',
    title: 'Number System Converter Studio',
    icon: '🔢',
    shortDescription: 'Interactive base converter decomposing numbers into positional place-values, radix powers, and successive division/multiplication steps.',
    learningObjectives: [
      'Decompose positional numbers as weighted sums: N = Σ (d_i × b^i)',
      'Convert values fluently between decimal, binary, octal, and hexadecimal bases',
      'Analyze bit-grouping shortcuts (3 bits per octal digit, 4 bits per hex nibble)',
    ],
    formulaOverview: 'N = \\sum_{i=0}^{n-1} d_i \\cdot b^i, \\quad \\text{Hex Nibble}: 4 \\text{ bits}, \\quad \\text{Octal}: 3 \\text{ bits}',
    parameters: [
      { key: 'inputBase', label: 'Input Radix / Base', type: 'select', default: 'decimal', options: [
        { label: 'Base 10 — Decimal', value: 'decimal' },
        { label: 'Base 2 — Binary', value: 'binary' },
        { label: 'Base 8 — Octal', value: 'octal' },
        { label: 'Base 16 — Hexadecimal', value: 'hex' },
      ]},
      { key: 'value', label: 'Decimal Magnitude', type: 'range', min: 0, max: 255, step: 1, default: 42, unit: '' },
    ],
    metrics: [
      { id: 'binary', label: 'Binary (Base 2)', format: (_s, p) => (p.value >>> 0).toString(2).padStart(8, '0') },
      { id: 'octal', label: 'Octal (Base 8)', format: (_s, p) => (p.value >>> 0).toString(8) },
      { id: 'hex', label: 'Hexadecimal (Base 16)', format: (_s, p) => '0x' + (p.value >>> 0).toString(16).toUpperCase().padStart(2, '0') },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-binary-arithmetic',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Binary Addition, Two\'s Complement Subtraction, and Overflow Detection',
    title: 'Binary Addition and Subtraction Lab',
    icon: '➕',
    shortDescription: 'Full-adder column simulator with carry propagation, two\'s complement negation, and signed overflow V = C_{in} ⊕ C_{out} detection.',
    learningObjectives: [
      'Construct multi-bit sums with full-adder equations: S_i = A_i ⊕ B_i ⊕ C_i, C_{i+1} = (A_i·B_i) + C_i(A_i⊕B_i)',
      'Perform binary subtraction via two\'s complement addition: A - B = A + (~B + 1)',
      'Detect signed arithmetic overflow using carry into and out of MSB: V = C_n ⊕ C_{n-1}',
    ],
    formulaOverview: 'S = A \\oplus B \\oplus C_{in}, \\quad C_{out} = (A \\cdot B) + C_{in}(A \\oplus B), \\quad V = C_n \\oplus C_{n-1}',
    parameters: [
      { key: 'op', label: 'Arithmetic Operation', type: 'select', default: 'add', options: [
        { label: 'Unsigned Binary Addition', value: 'add' },
        { label: 'Two\'s Complement Subtraction (A - B)', value: 'sub' },
      ]},
      { key: 'opA', label: 'Operand A (Decimal)', type: 'range', min: 0, max: 15, step: 1, default: 9, unit: '' },
      { key: 'opB', label: 'Operand B (Decimal)', type: 'range', min: 0, max: 15, step: 1, default: 5, unit: '' },
    ],
    metrics: [
      { id: 'sum', label: 'Result (Decimal)', format: (_s, p) => p.op === 'add' ? `${p.opA + p.opB}` : `${p.opA - p.opB}` },
      { id: 'binarySum', label: 'Result (4-bit binary)', format: (_s, p) => {
        const val = p.op === 'add' ? (p.opA + p.opB) : (p.opA - p.opB);
        return (val & 0b1111).toString(2).padStart(4, '0');
      }},
      { id: 'carryOut', label: 'Carry / Overflow Flag', format: (_s, p) => (p.op === 'add' && p.opA + p.opB > 15) ? 'FLAG: CARRY OVERFLOW' : 'NORMAL' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-data-size',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Bits, Bytes, SI vs IEC Binary Multipliers, and Storage Capacity Estimation',
    title: 'Bits, Bytes and Data Size Workshop',
    icon: '📦',
    shortDescription: 'Interactive storage workshop contrasting decimal SI (KB = 10³) with binary IEC (KiB = 2¹⁰) units and estimating real-world file sizes.',
    learningObjectives: [
      'Contrast decimal SI units (10³, 10⁶, 10⁹) with binary IEC standards (2¹⁰, 2²⁰, 2³⁰)',
      'Calculate uncompressed raw image size: Width × Height × (Bit Depth / 8) bytes',
      'Analyze hard drive stated vs usable OS storage capacity discrepancy due to base divergence',
    ],
    formulaOverview: '\\text{Raw Image} = W \\times H \\times \\frac{\\text{bpp}}{8}, \\quad \\text{Audio} = f_s \\times \\frac{\\text{bits}}{8} \\times \\text{ch} \\times t, \\quad \\Delta = 1 - \\frac{10^9}{2^{30}} \\approx 7.37\\%',
    parameters: [
      { key: 'resolution', label: 'Image Resolution', type: 'select', default: '1080p', options: [
        { label: 'HD 720p (1280 × 720)', value: '720p' },
        { label: 'Full HD 1080p (1920 × 1080)', value: '1080p' },
        { label: '4K UHD (3840 × 2160)', value: '4k' },
      ]},
      { key: 'bitDepth', label: 'Color Bit Depth', type: 'select', default: '24', options: [
        { label: '8-bit Greyscale (1 Byte/px)', value: '8' },
        { label: '24-bit TrueColor RGB (3 Bytes/px)', value: '24' },
        { label: '32-bit RGBA (4 Bytes/px)', value: '32' },
      ]},
    ],
    metrics: [
      { id: 'rawSize', label: 'Uncompressed Size', format: (_s, p) => {
        const px = p.resolution === '4k' ? 3840 * 2160 : p.resolution === '1080p' ? 1920 * 1080 : 1280 * 720;
        const b = (px * parseInt(p.bitDepth, 10)) / 8;
        return `${(b / (1024 * 1024)).toFixed(2)} MiB (${(b / 1000000).toFixed(2)} MB)`;
      }},
      { id: 'totalPixels', label: 'Total Pixels', format: (_s, p) => p.resolution === '4k' ? '8.29 MP' : p.resolution === '1080p' ? '2.07 MP' : '0.92 MP' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-multimedia-encoding',
    unit: 1,
    unitTitle: 'Digital Representation and Data Encoding',
    topic: 'Character Encoding (ASCII, UTF-8), Bitmap Rasterization, and Nyquist Audio Sampling',
    title: 'Text, Image and Sound Encoding Explorer',
    icon: '🎨',
    shortDescription: 'Multi-modal encoding lab exploring UTF-8 byte stream variable length, RGB raster color blending, and Nyquist-Shannon audio digitization.',
    learningObjectives: [
      'Examine UTF-8 variable-width prefix rules across ASCII, Latin, and Indic Unicode code points',
      'Synthesize RGB 24-bit hexadecimal color triplets into screen pixel luminances',
      'Demonstrate audio quantization noise and Nyquist criterion f_s ≥ 2·f_{max} avoiding aliasing',
    ],
    formulaOverview: '\\text{Nyquist}: f_s \\ge 2 f_{max}, \\quad \\text{SNR}_{dB} \\approx 6.02 \\cdot N + 1.76, \\quad \\text{UTF-8}: 1\\text{ to }4 \\text{ bytes}',
    parameters: [
      { key: 'mode', label: 'Encoding Media Domain', type: 'select', default: 'text', options: [
        { label: 'Character Text (ASCII vs UTF-8)', value: 'text' },
        { label: 'Bitmap Image (RGB Pixel Matrix)', value: 'image' },
        { label: 'Audio Signal (ADC Sampling & Quantization)', value: 'audio' },
      ]},
      { key: 'sampleRate', label: 'Audio Sampling Rate', type: 'select', default: '44100', options: [
        { label: '8 kHz (Telephone Bandwidth)', value: '8000' },
        { label: '22.05 kHz (AM Radio Quality)', value: '22050' },
        { label: '44.1 kHz (CD Audio Standard)', value: '44100' },
      ]},
    ],
    metrics: [
      { id: 'maxFreq', label: 'Nyquist Frequency Cut-off', format: (_s, p) => `${parseInt(p.sampleRate, 10) / 2000} kHz` },
      { id: 'dataRate', label: '16-bit Stereo Bitrate', format: (_s, p) => `${((parseInt(p.sampleRate, 10) * 16 * 2) / 1000).toFixed(0)} kbps` },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — COMPUTER ARCHITECTURE AND CPU EXECUTION (Simulations 5–8)
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs102-hardware-explorer-3d',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: 'Physical Computer Hardware: Motherboard, CPU Socket, RAM DIMMs, PCIe & PSU',
    title: 'Inside a Computer — 3D Hardware Explorer',
    icon: '🖥️',
    shortDescription: 'Interactive 3D desktop workstation workstation exploring physical CPU sockets, dual-channel RAM DIMMs, VRMs, PCIe bus, and NVMe slots.',
    learningObjectives: [
      'Identify physical system components: CPU socket, VRM power delivery, dual-channel DIMM slots, PCIe slots, and chipset',
      'Explain the data interconnect topologies between CPU, Northbridge/Direct PCIe lanes, and Southbridge/PCH',
      'Examine heat dissipation through CPU IHS, copper heatpipes, and fin stacks',
    ],
    formulaOverview: '\\text{Bandwidth} = \\text{Transfer Rate} \\times \\text{Bus Width}, \\quad \\text{PCIe 4.0 x16} \\approx 31.5 \\text{ GB/s}',
    parameters: [
      { key: 'component', label: 'Focus Component', type: 'select', default: 'cpu', options: [
        { label: 'CPU (Processor & Socket)', value: 'cpu' },
        { label: 'RAM (Dual-Channel DIMM)', value: 'ram' },
        { label: 'GPU (Dedicated PCIe Accelerator)', value: 'gpu' },
        { label: 'Motherboard (VRM & Chipset)', value: 'motherboard' },
        { label: 'Storage (NVMe SSD M.2)', value: 'storage' },
      ]},
      { key: 'explodedView', label: 'Assembly Presentation', type: 'select', default: 'assembled', options: [
        { label: 'Assembled Chassis View', value: 'assembled' },
        { label: 'Exploded Layered Inspection', value: 'exploded' },
      ]},
    ],
    metrics: [
      { id: 'thermalTdp', label: 'Thermal Design Power (TDP)', format: (_s, p) => p.component === 'cpu' ? '125 W' : p.component === 'gpu' ? '285 W' : '15 W' },
      { id: 'busSpec', label: 'Bus Interconnect', format: (_s, p) => p.component === 'cpu' ? 'LGA1700 / AM5' : p.component === 'ram' ? 'DDR5 64-bit per ch' : 'PCIe 4.0 x16' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-ipo-journey',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: 'The Input–Process–Output Cycle and Bus Data Transport',
    title: 'Input–Process–Output Data Journey',
    icon: '🔄',
    shortDescription: 'End-to-end data packet tracker following keyboard interrupt generation, memory buffering, CPU processing, and display rendering.',
    learningObjectives: [
      'Trace data movement through the classical Von Neumann IPO pipeline: Input → Primary Memory → CPU → Output/Storage',
      'Distinguish hardware interrupt handling from polling data transfer mechanisms',
      'Analyze the critical difference between volatile RAM working memory and non-volatile secondary storage persistence',
    ],
    formulaOverview: '\\text{IPO}: \\text{Input} \\xrightarrow{\\text{Bus/IRQ}} \\text{RAM} \\leftrightarrow \\text{CPU (ALU+Reg)} \\xrightarrow{\\text{DMA/Bus}} \\text{Output/Storage}',
    parameters: [
      { key: 'scenario', label: 'Real-World Scenario', type: 'select', default: 'typing', options: [
        { label: 'Typing a Keystroke in Document', value: 'typing' },
        { label: 'Saving Document to Solid State Drive', value: 'saving' },
        { label: 'Streaming Video Playback from Storage', value: 'streaming' },
      ]},
      { key: 'speed', label: 'Data Travel Pace', type: 'range', min: 1, max: 5, step: 1, default: 2, unit: 'x' },
    ],
    metrics: [
      { id: 'latency', label: 'Total End-to-End Latency', format: (_s, p) => p.scenario === 'typing' ? '8.2 ms (Human Perceptible: Instant)' : '42.0 ms' },
      { id: 'stage', label: 'Current Data Location', format: () => 'CPU Core Register' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-cpu-execution',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: 'Instruction Cycle: Fetch, Decode, Execute, and Memory Write-Back',
    title: 'CPU Instruction Execution Simulator',
    icon: '⚙️',
    shortDescription: 'Step-by-step Von Neumann CPU simulator tracking Program Counter (PC), Instruction Register (IR), Control Unit, ALU, and Registers.',
    learningObjectives: [
      'Trace the 4-phase instruction execution cycle: Fetch → Decode → Execute → Store/Write-Back',
      'Track Program Counter (PC) auto-incrementing vs branch-induced target jumps',
      'Observe register state modifications during arithmetic and memory load/store operations',
    ],
    formulaOverview: '\\text{Cycle}: \\text{Fetch (MAR}\\leftarrow\\text{PC)} \\to \\text{Decode (CU)} \\to \\text{Execute (ALU)} \\to \\text{Writeback (Reg/MDR)}',
    parameters: [
      { key: 'program', label: 'Sample Assembly Program', type: 'select', default: 'sum', options: [
        { label: 'Program 1: Load, Add Two Numbers & Store', value: 'sum' },
        { label: 'Program 2: Conditional Branch / Loop Counter', value: 'loop' },
      ]},
      { key: 'clockStep', label: 'Execution Mode', type: 'select', default: 'step', options: [
        { label: 'Manual Micro-Step Clock Pulse', value: 'step' },
        { label: 'Continuous Clock Run', value: 'run' },
      ]},
    ],
    metrics: [
      { id: 'pc', label: 'Program Counter (PC)', format: () => '0x0004' },
      { id: 'ir', label: 'Instruction Register (IR)', format: () => 'ADD R1, R2, R3' },
      { id: 'r1', label: 'Register R1', format: () => '0x000E (14)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-cpu-pipeline',
    unit: 2,
    unitTitle: 'Computer Architecture and CPU Execution',
    topic: '5-Stage Instruction Pipelining, Hazards, and Data Forwarding',
    title: 'CPU Pipelining and Hazards Visualizer',
    icon: '⚡',
    shortDescription: 'Cycle-by-cycle 5-stage RISC pipeline visualizer comparing sequential execution against pipelined throughput with stalls and data forwarding.',
    learningObjectives: [
      'Map instruction overlap across IF (Fetch), ID (Decode), EX (Execute), MEM (Memory), and WB (Write-Back) stages',
      'Identify structural, data (RAW, WAR, WAW), and control (branch) pipeline hazards',
      'Demonstrate how hardware data forwarding bypasses ALU results to prevent pipeline bubble stalls',
    ],
    formulaOverview: '\\text{Speedup} = \\frac{k \\cdot n}{k + n - 1 + \\text{stalls}}, \\quad \\text{CPI}_{ideal} = 1.0, \\quad \\text{RAW Hazard Resolved via Forwarding}',
    parameters: [
      { key: 'forwarding', label: 'Hardware Forwarding', type: 'select', default: 'enabled', options: [
        { label: 'Forwarding Unit ENABLED (Bypass Active)', value: 'enabled' },
        { label: 'Forwarding Unit DISABLED (Stall on RAW)', value: 'disabled' },
      ]},
      { key: 'branchPredict', label: 'Branch Prediction', type: 'select', default: 'predict_not_taken', options: [
        { label: 'Predict Not Taken (Flush on taken)', value: 'predict_not_taken' },
        { label: 'Static Taken Prediction', value: 'predict_taken' },
      ]},
    ],
    metrics: [
      { id: 'cpi', label: 'Cycles Per Instruction (CPI)', format: (_s, p) => p.forwarding === 'enabled' ? '1.18' : '1.75' },
      { id: 'throughput', label: 'Throughput Speedup', format: (_s, p) => p.forwarding === 'enabled' ? '4.24x vs Sequential' : '2.86x vs Sequential' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — MEMORY HIERARCHY, STORAGE AND DIGITAL LOGIC (Simulations 9–12)
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs102-memory-hierarchy-3d',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'The Multi-Tier Memory Pyramid: Latency, Cost, and Capacity Trade-Offs',
    title: 'Memory Hierarchy — 3D Data Retrieval Lab',
    icon: '🔺',
    shortDescription: 'Explorable 3D memory pyramid demonstrating CPU Registers (<1ns), L1/L2/L3 Caches, DDR5 RAM (60ns), and NVMe SSDs (50µs).',
    learningObjectives: [
      'Compare memory tier metrics: capacity (bytes), access latency (ns), bandwidth (GB/s), and cost per bit',
      'Calculate Average Memory Access Time (AMAT): AMAT = Hit Time + (Miss Rate × Miss Penalty)',
      'Justify the necessity of hierarchical memory systems to bridge the processor-memory performance gap',
    ],
    formulaOverview: '\\text{AMAT} = T_{hit} + (1 - h) \\cdot T_{miss}, \\quad \\text{Registers } (<1\\text{ns}) \\to \\text{Cache } (1\\text{-}15\\text{ns}) \\to \\text{RAM } (60\\text{ns}) \\to \\text{SSD } (50\\mu\\text{s})',
    parameters: [
      { key: 'targetLevel', label: 'Simulate Query for Data in', type: 'select', default: 'l1', options: [
        { label: 'CPU L1 Cache Hit (~1.0 ns)', value: 'l1' },
        { label: 'CPU L3 Shared Cache Hit (~12 ns)', value: 'l3' },
        { label: 'Main Memory DRAM Hit (~65 ns)', value: 'ram' },
        { label: 'Storage Secondary Miss / Page Fault (~50 µs)', value: 'ssd' },
      ]},
      { key: 'l1HitRate', label: 'L1 Cache Hit Probability', type: 'range', min: 70, max: 99, step: 1, default: 95, unit: '%' },
    ],
    metrics: [
      { id: 'amat', label: 'Average Memory Access Time (AMAT)', format: (_s, p) => `${(1.2 + (1 - p.l1HitRate / 100) * 65).toFixed(2)} ns` },
      { id: 'penalty', label: 'Effective Access Penalty', format: (_s, p) => p.targetLevel === 'l1' ? 'None (1 Cycle Hit)' : p.targetLevel === 'ram' ? '65x L1 Access Time' : '50,000x L1 Latency' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-cache-locality',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'Cache Tag/Index/Offset Mapping, Temporal and Spatial Locality',
    title: 'Cache Hit, Cache Miss and Locality Challenge',
    icon: '🎯',
    shortDescription: 'Trace cache tag-matching, index decoding, line replacement policies (LRU/FIFO), and evaluate row-major vs column-major array traversal.',
    learningObjectives: [
      'Deconstruct memory addresses into Tag, Index, and Block Offset fields',
      'Distinguish Compulsory (Cold), Capacity, and Conflict cache misses (The 3 Cs)',
      'Evaluate spatial vs temporal locality through sequential vs strided memory access benchmarks',
    ],
    formulaOverview: '\\text{Address} = [\\text{Tag} \\mid \\text{Set Index} \\mid \\text{Byte Offset}], \\quad \\text{Index Bits} = \\log_2(S), \\quad \\text{Offset Bits} = \\log_2(B)',
    parameters: [
      { key: 'accessPattern', label: 'Loop Array Traversal', type: 'select', default: 'row_major', options: [
        { label: 'Row-Major (Sequential Spatial Locality)', value: 'row_major' },
        { label: 'Column-Major (Strided Cache Bashing)', value: 'col_major' },
        { label: 'Random Pointer Chasing', value: 'random' },
      ]},
      { key: 'cacheLines', label: 'Cache Capacity (Lines)', type: 'select', default: '8', options: [
        { label: '4 Lines (Small)', value: '4' },
        { label: '8 Lines (Standard)', value: '8' },
        { label: '16 Lines (Large)', value: '16' },
      ]},
    ],
    metrics: [
      { id: 'hitRate', label: 'Observed Hit Rate', format: (_s, p) => p.accessPattern === 'row_major' ? '87.5% (High Spatial Locality)' : p.accessPattern === 'col_major' ? '12.5% (Severe Misses)' : '4.2%' },
      { id: 'missCount', label: 'Total Cache Misses', format: (_s, p) => p.accessPattern === 'row_major' ? '4 Misses / 32 Accesses' : '28 Misses / 32 Accesses' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-storage-filesystem',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'Magnetic HDDs vs Flash SSDs and Hierarchical File Systems (Inodes & Blocks)',
    title: 'Storage Device and File-System Explorer',
    icon: '💾',
    shortDescription: 'Dual-domain storage explorer contrasting HDD rotational latency with SSD NAND flash blocks, alongside inode and file allocation tables.',
    learningObjectives: [
      'Compare HDD physical latency (seek time + rotational delay) with SSD solid-state electronic flash access',
      'Explain NAND flash block erase before write constraints and wear-leveling endurance strategies',
      'Navigate hierarchical file systems: directories, inodes, pointers, and data block allocation',
    ],
    formulaOverview: 'T_{HDD} = T_{seek} + \\frac{1}{2 \\cdot RPM} + T_{transfer}, \\quad \\text{SSD}: \\text{Zero Mechanical Seek}, \\quad \\text{Inodes} \\to \\text{Data Blocks}',
    parameters: [
      { key: 'device', label: 'Storage Architecture', type: 'select', default: 'ssd', options: [
        { label: 'Solid-State Drive (NVMe Flash TLC)', value: 'ssd' },
        { label: 'Hard Disk Drive (7200 RPM Mechanical)', value: 'hdd' },
      ]},
      { key: 'operation', label: 'I/O Access Pattern', type: 'select', default: 'random_read', options: [
        { label: '4K Random Read (IOPS Bound)', value: 'random_read' },
        { label: '128K Sequential Read (Throughput Bound)', value: 'seq_read' },
      ]},
    ],
    metrics: [
      { id: 'ioLatency', label: 'Average Access Latency', format: (_s, p) => p.device === 'ssd' ? '0.04 ms (40 µs)' : '8.50 ms (Seek + Spin)' },
      { id: 'throughput', label: 'Transfer Bandwidth', format: (_s, p) => p.device === 'ssd' ? (p.operation === 'seq_read' ? '3,500 MB/s' : '450 MB/s') : (p.operation === 'seq_read' ? '180 MB/s' : '1.8 MB/s') },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-logic-gates',
    unit: 3,
    unitTitle: 'Memory Hierarchy, Storage and Digital Logic',
    topic: 'Fundamental Logic Gates, Universal Gates (NAND/NOR), and Combinational Circuits',
    title: 'Logic Gates and Truth-Table Playground',
    icon: '🔀',
    shortDescription: 'Interactive digital schematic breadboard connecting AND, OR, NOT, NAND, NOR, and XOR gates with live truth table verification.',
    learningObjectives: [
      'Verify input-output transfer characteristics and truth tables for fundamental logic gates',
      'Demonstrate functional completeness of universal NAND and NOR gates by synthesizing inverter, AND, and OR functions',
      'Construct a 1-bit Half Adder circuit combining XOR (Sum) and AND (Carry) gates',
    ],
    formulaOverview: '\\text{AND}: Y = A \\cdot B, \\quad \\text{OR}: Y = A + B, \\quad \\text{XOR}: Y = A \\oplus B = A\\bar{B} + \\bar{A}B, \\quad \\text{NAND Universal}',
    parameters: [
      { key: 'gate', label: 'Active Gate / Subcircuit', type: 'select', default: 'xor', options: [
        { label: '2-Input AND Gate', value: 'and' },
        { label: '2-Input OR Gate', value: 'or' },
        { label: '1-Input NOT Inverter', value: 'not' },
        { label: '2-Input NAND (Universal)', value: 'nand' },
        { label: '2-Input NOR (Universal)', value: 'nor' },
        { label: '2-Input XOR (Exclusive OR)', value: 'xor' },
        { label: 'Half Adder Subcircuit', value: 'half_adder' },
      ]},
      { key: 'inA', label: 'Input A Logic Level', type: 'select', default: '1', options: [{ label: 'Logic LOW (0 / 0V)', value: '0' }, { label: 'Logic HIGH (1 / 5V)', value: '1' }] },
      { key: 'inB', label: 'Input B Logic Level', type: 'select', default: '0', options: [{ label: 'Logic LOW (0 / 0V)', value: '0' }, { label: 'Logic HIGH (1 / 5V)', value: '1' }] },
    ],
    metrics: [
      { id: 'outputY', label: 'Circuit Output (Y)', format: (_s, p) => {
        const a = p.inA === '1';
        const b = p.inB === '1';
        let res = false;
        if (p.gate === 'and') res = a && b;
        else if (p.gate === 'or') res = a || b;
        else if (p.gate === 'not') res = !a;
        else if (p.gate === 'nand') res = !(a && b);
        else if (p.gate === 'nor') res = !(a || b);
        else if (p.gate === 'xor' || p.gate === 'half_adder') res = (a && !b) || (!a && b);
        return res ? 'LOGIC 1 (HIGH)' : 'LOGIC 0 (LOW)';
      }},
      { id: 'boolExpr', label: 'Boolean Expression', format: (_s, p) => p.gate === 'xor' ? 'Y = A ⊕ B' : p.gate === 'nand' ? 'Y = (A · B)\'' : 'Y = f(A, B)' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — COMPUTATIONAL THINKING, FLOWCHARTS AND ALGORITHMS (Simulations 13–16)
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs102-algorithm-builder',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Algorithmic Flowcharts: Terminal, Process, Decision, and Loop Constructs',
    title: 'From Problem Statement to Algorithm Builder',
    icon: '📐',
    shortDescription: 'Drag-and-drop flowchart builder executing algorithms step-by-step with live variable tracing and conditional branch animation.',
    learningObjectives: [
      'Translate natural language problem statements into unambiguous algorithmic control sequences',
      'Distinguish terminal, input/output, process computation, and diamond decision flowchart symbols',
      'Trace loop execution conditions, counter mutations, and termination criteria to avoid infinite looping',
    ],
    formulaOverview: '\\text{Flowchart}: \\text{Oval (Start/End)} \\to \\text{Parallelogram (I/O)} \\to \\text{Rectangle (Process)} \\to \\text{Diamond (Decision)}',
    parameters: [
      { key: 'problem', label: 'Algorithm Problem Scenario', type: 'select', default: 'max2', options: [
        { label: 'Find Maximum of Two Integers', value: 'max2' },
        { label: 'Determine if Integer is Even or Odd', value: 'even_odd' },
        { label: 'Calculate Sum of First N Natural Numbers', value: 'sum_n' },
      ]},
      { key: 'valN', label: 'Input Parameter Value', type: 'range', min: 1, max: 20, step: 1, default: 5, unit: '' },
    ],
    metrics: [
      { id: 'result', label: 'Calculated Algorithm Output', format: (_s, p) => p.problem === 'sum_n' ? `${(p.valN * (p.valN + 1)) / 2}` : p.problem === 'even_odd' ? (p.valN % 2 === 0 ? 'EVEN' : 'ODD') : 'MAX DETECTED' },
      { id: 'steps', label: 'Total Execution Steps', format: (_s, p) => p.problem === 'sum_n' ? `${p.valN * 3 + 2} Steps` : '4 Steps' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-scratch-blocks-world',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Visual Block Programming: Sequences, Loops, Conditions, and Event Triggers',
    title: 'Scratch-Style Drag-and-Drop Programming World',
    icon: '🧩',
    shortDescription: 'Visual block programming arena guiding an autonomous rover through maze grids using sequencing, repeat loops, and sensor branches.',
    learningObjectives: [
      'Compose executable logic blocks without syntactic compile errors',
      'Apply structured iteration (Repeat N times, Repeat Until Goal) to compress repetitive code',
      'Implement reactive decision branching based on environmental sensory feedback (If wall ahead then turn)',
    ],
    formulaOverview: '\\text{Program} = \\text{Sequence} \\circ \\text{Selection (If-Then-Else)} \\circ \\text{Iteration (While/Repeat)}',
    parameters: [
      { key: 'mazeDifficulty', label: 'Maze Environment Complexity', type: 'select', default: 'simple', options: [
        { label: 'Level 1: Straight Sequence & Turns', value: 'simple' },
        { label: 'Level 2: Looped Staircase Path', value: 'loop' },
        { label: 'Level 3: Dynamic Obstacle Decision Maze', value: 'maze' },
      ]},
      { key: 'executionSpeed', label: 'Sprite Step Delay', type: 'range', min: 100, max: 800, step: 100, default: 300, unit: 'ms' },
    ],
    metrics: [
      { id: 'blocksUsed', label: 'Block Count in Workspace', format: () => '6 Blocks' },
      { id: 'goalReached', label: 'Target Objective Status', format: () => 'REACHED (SUCCESS)' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-trace-table-simulator',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Dry-Run Algorithm Tracing, Loop Invariants, and Off-by-One Debugging',
    title: 'Algorithm Flow and Trace-Table Simulator',
    icon: '📋',
    shortDescription: 'Interactive dry-run laboratory highlighting statement execution line-by-line while recording state changes across a dynamic trace table.',
    learningObjectives: [
      'Construct formal trace tables mapping line numbers, variable values, condition booleans, and console outputs',
      'Isolate boundary bugs and off-by-one errors (e.g., `<` vs `<=`) before running on production machines',
      'Verify loop invariant consistency across pre-conditions, iterations, and post-conditions',
    ],
    formulaOverview: '\\text{Trace Table}: [\\text{Step} \\mid \\text{Line} \\mid \\text{Var}_1 \\mid \\text{Var}_2 \\mid \\dots \\mid \\text{Condition} \\mid \\text{Output}]',
    parameters: [
      { key: 'algorithmChoice', label: 'Algorithm Under Inspection', type: 'select', default: 'factorial', options: [
        { label: 'Factorial Calculation: n!', value: 'factorial' },
        { label: 'Fibonacci Series Generator', value: 'fibonacci' },
        { label: 'Euclidean Greatest Common Divisor (GCD)', value: 'gcd' },
      ]},
      { key: 'inputArg', label: 'Primary Input Argument', type: 'range', min: 1, max: 8, step: 1, default: 5, unit: '' },
    ],
    metrics: [
      { id: 'finalResult', label: 'Computed Function Return', format: (_s, p) => {
        if (p.algorithmChoice === 'factorial') {
          let f = 1; for (let i = 2; i <= p.inputArg; i++) f *= i;
          return `${f}`;
        }
        return 'Calculated';
      }},
      { id: 'iterationCount', label: 'Loop Iterations Executed', format: (_s, p) => `${p.inputArg} Iterations` },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-search-race',
    unit: 4,
    unitTitle: 'Computational Thinking, Flowcharts and Algorithms',
    topic: 'Searching Algorithms: Linear Search O(n) vs Binary Search O(log n)',
    title: 'Searching Algorithm Race',
    icon: '🔍',
    shortDescription: 'Side-by-side animated race comparing sequential linear search against divide-and-conquer binary search on sorted vs unsorted datasets.',
    learningObjectives: [
      'Compare algorithmic steps: Linear Search sequential scans O(n) vs Binary Search halving O(log₂ n)',
      'Demonstrate why binary search strictly requires monotonically ordered array inputs',
      'Analyze best, average, and worst case comparison metrics across varied input list sizes',
    ],
    formulaOverview: 'T_{Linear} = O(n), \\quad T_{Binary} = O(\\log_2 n), \\quad \\text{Max Comparisons for } N=1024: 1024 \\text{ vs } 10',
    parameters: [
      { key: 'arraySize', label: 'Array Size (Elements)', type: 'select', default: '32', options: [
        { label: '16 Elements', value: '16' },
        { label: '32 Elements', value: '32' },
        { label: '64 Elements', value: '64' },
      ]},
      { key: 'targetPosition', label: 'Target Item Location', type: 'select', default: 'middle', options: [
        { label: 'Beginning of Array (Index 0)', value: 'start' },
        { label: 'Middle of Array', value: 'middle' },
        { label: 'Far End of Array (Index N-1)', value: 'end' },
        { label: 'Item Absent (Not Found)', value: 'absent' },
      ]},
    ],
    metrics: [
      { id: 'linearSteps', label: 'Linear Search Comparisons', format: (_s, p) => p.targetPosition === 'start' ? '1 step' : p.targetPosition === 'middle' ? `${parseInt(p.arraySize, 10) / 2} steps` : `${p.arraySize} steps` },
      { id: 'binarySteps', label: 'Binary Search Comparisons', format: (_s, p) => `${Math.ceil(Math.log2(parseInt(p.arraySize, 10)))} steps` },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — ALGORITHM COMPLEXITY, OS SCHEDULING AND SOFTWARE DEBUGGING (Simulations 17–20)
  // ═══════════════════════════════════════════════════════════════════════════
  u25csSimulation({
    id: 'u25cs102-sorting-visualizer',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Sorting Algorithms: Bubble Sort, Selection Sort, and Insertion Sort',
    title: 'Sorting Algorithm Visualizer',
    icon: '📊',
    shortDescription: 'Multi-bar visualizer comparing Bubble Sort, Insertion Sort, and Selection Sort with comparison and swap counters.',
    learningObjectives: [
      'Compare element interchange strategies: Bubble Sort adjacent swaps vs Insertion Sort sorted partition expansion',
      'Track total comparison operations and element assignment moves across best, average, and reversed worst-case lists',
      'Evaluate algorithmic stability and time complexity bounds: O(n²) quadratic vs O(n) best-case sorted passes',
    ],
    formulaOverview: '\\text{Bubble/Selection}: O(n^2), \\quad \\text{Insertion (Best)}: O(n), \\quad \\text{Comparisons} = \\frac{n(n-1)}{2}',
    parameters: [
      { key: 'algorithm', label: 'Sorting Algorithm', type: 'select', default: 'bubble', options: [
        { label: 'Bubble Sort (Adjacent Pair Swaps)', value: 'bubble' },
        { label: 'Insertion Sort (Card-Hand Insertion)', value: 'insertion' },
        { label: 'Selection Sort (Min Element Search)', value: 'selection' },
      ]},
      { key: 'initialOrder', label: 'Array Distribution', type: 'select', default: 'random', options: [
        { label: 'Random Shuffled Elements', value: 'random' },
        { label: 'Nearly Sorted Elements', value: 'nearly_sorted' },
        { label: 'Reverse Inverted Array (Worst Case)', value: 'reversed' },
      ]},
    ],
    metrics: [
      { id: 'comps', label: 'Comparisons Performed', format: () => '28 Comparisons' },
      { id: 'swaps', label: 'Element Swaps / Shifts', format: () => '14 Swaps' },
      { id: 'complexity', label: 'Time Complexity Class', format: (_s, p) => p.algorithm === 'insertion' && p.initialOrder === 'nearly_sorted' ? 'O(n) Best Case' : 'O(n²) Quadratic' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-computational-decomposition',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Four Pillars of Computational Thinking: Decomposition, Pattern Recognition, Abstraction, and Algorithms',
    title: 'Decomposition, Pattern Recognition and Abstraction Puzzle',
    icon: '🧩',
    shortDescription: 'Multi-step computational thinking studio decomposing complex real-world workflows into subproblems, identifying repetitive patterns, and abstracting data.',
    learningObjectives: [
      'Deconstruct complex system tasks into independent, manageable modular subproblems',
      'Identify shared recurring patterns and behavioral invariants across distinct domains',
      'Filter out irrelevant non-functional clutter to generate minimal, robust mathematical abstractions',
    ],
    formulaOverview: '\\text{Computational Thinking} = \\text{Decomposition} + \\text{Pattern Recognition} + \\text{Abstraction} + \\text{Algorithm Design}',
    parameters: [
      { key: 'caseStudy', label: 'Real-World System Study', type: 'select', default: 'smart_campus', options: [
        { label: 'Smart Campus Automated Attendance Workflow', value: 'smart_campus' },
        { label: 'Automated Vending Machine Payment & Dispenser', value: 'vending' },
        { label: 'GPS Navigation Routing & Traffic Estimation', value: 'gps' },
      ]},
      { key: 'stage', label: 'Thinking Pillar Under Focus', type: 'select', default: 'decomposition', options: [
        { label: 'Pillar 1: Modular Problem Decomposition', value: 'decomposition' },
        { label: 'Pillar 2: Structural Pattern Recognition', value: 'pattern' },
        { label: 'Pillar 3: Data Abstraction & Filtering', value: 'abstraction' },
      ]},
    ],
    metrics: [
      { id: 'modulesIdentified', label: 'Sub-Modules Isolated', format: () => '4 Autonomous Sub-tasks' },
      { id: 'codeReuseRatio', label: 'Projected Code Reuse Ratio', format: () => '65% Via Abstract Helpers' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-os-scheduler',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Operating System CPU Scheduling: First-Come First-Served (FCFS) and Round Robin (RR)',
    title: 'Operating System and Process Scheduler Playground',
    icon: '⏱️',
    shortDescription: 'Multi-process timeline simulator comparing non-preemptive FCFS against preemptive Round Robin with Gantt charts, waiting times, and turnaround calculations.',
    learningObjectives: [
      'Model operating system process lifecycle states: Ready, Running, and Terminated',
      'Construct execution Gantt charts for FCFS scheduling and calculate average waiting time',
      'Evaluate Round Robin preemptive time-slicing and analyze the impact of time quantum (q) sizing on context switch overhead',
    ],
    formulaOverview: 'T_{Turnaround} = T_{Completion} - T_{Arrival}, \\quad T_{Wait} = T_{Turnaround} - T_{Burst}, \\quad \\text{Avg Wait} = \\frac{1}{n} \\sum T_{Wait}',
    parameters: [
      { key: 'policy', label: 'Scheduling Policy', type: 'select', default: 'rr', options: [
        { label: 'First-Come, First-Served (FCFS - Non-preemptive)', value: 'fcfs' },
        { label: 'Round Robin (RR - Preemptive Time Slicing)', value: 'rr' },
      ]},
      { key: 'quantum', label: 'Round Robin Time Quantum (q)', type: 'range', min: 1, max: 10, step: 1, default: 3, unit: 'ms' },
    ],
    metrics: [
      { id: 'avgWait', label: 'Average Waiting Time', format: (_s, p) => p.policy === 'fcfs' ? '7.5 ms' : '5.2 ms' },
      { id: 'avgTurnaround', label: 'Average Turnaround Time', format: (_s, p) => p.policy === 'fcfs' ? '14.5 ms' : '12.2 ms' },
    ],
  }),

  u25csSimulation({
    id: 'u25cs102-software-debugging',
    unit: 5,
    unitTitle: 'Algorithm Complexity, OS Scheduling and Software Debugging',
    topic: 'Software Engineering Lifecycle, Bug Taxonomy, and Test Case Verification',
    title: 'Software Development and Debugging Mission',
    icon: '🐛',
    shortDescription: 'Interactive diagnostic mission navigating syntax, runtime, and logical semantic bugs with breakpoint watches, terminal output, and regression test cases.',
    learningObjectives: [
      'Classify computer software bugs: Syntax compilation errors, Runtime exceptions, and Logical semantic flaws',
      'Utilize diagnostic variable watches, assertions, and breakpoints to pinpoint fault origins',
      'Develop regression test case suites ensuring bug fixes do not introduce secondary regressions',
    ],
    formulaOverview: '\\text{SDLC}: \\text{Requirements} \\to \\text{Design} \\to \\text{Implement} \\to \\text{Test} \\to \\text{Debug} \\to \\text{Deploy}',
    parameters: [
      { key: 'bugScenario', label: 'Target Bug Scenario', type: 'select', default: 'off_by_one', options: [
        { label: 'Bug 1: Array Index Off-by-One Loop Bound', value: 'off_by_one' },
        { label: 'Bug 2: Divide by Zero Unchecked Input Exception', value: 'div_zero' },
        { label: 'Bug 3: Inverted Conditional Branch Logic', value: 'inverted_cond' },
      ]},
      { key: 'watchVariable', label: 'Watched Variable Inspection', type: 'select', default: 'index_i', options: [
        { label: 'Watch: Loop Counter `i`', value: 'index_i' },
        { label: 'Watch: Accumulator `sum`', value: 'sum' },
        { label: 'Watch: Denominator `div`', value: 'div' },
      ]},
    ],
    metrics: [
      { id: 'testStatus', label: 'Regression Test Suite', format: () => '2 / 3 Tests Passing (FAILS on edge case)' },
      { id: 'bugType', label: 'Bug Classification', format: (_s, p) => p.bugScenario === 'off_by_one' ? 'Logical Boundary Flaw' : p.bugScenario === 'div_zero' ? 'Runtime Exception' : 'Logical Semantic Inversion' },
    ],
  }),
];
