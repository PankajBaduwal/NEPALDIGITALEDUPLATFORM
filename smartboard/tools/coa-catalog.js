/**
 * coa-catalog.js
 * Computer Organization and Architecture (U25CS305 / U21CS301) — 18 Simulations Catalog
 * Regulation R2025 CBCS · Semester III · PCC · 3 Credits
 *
 * 5 Curriculum Units:
 * Unit I:   Computer Structure, Buses & Execution (Sims 1-4)
 * Unit II:  Datapath & Control Units (Sims 5-8)
 * Unit III: Instruction Pipelining, Hazards & RISC/CISC (Sims 9-12)
 * Unit IV:  Memory Hierarchy & Cache Memory (Sims 13-15)
 * Unit V:   I/O Organization, Interrupts & DMA (Sims 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduverseCOACatalog = exp;
  if (typeof window !== 'undefined') window.EduverseCOACatalog = exp;
  if (typeof global !== 'undefined') global.EduverseCOACatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Computer Structure, Buses & Execution', code: 'UNIT I' },
    { number: 2, title: 'Datapath & Control Units', code: 'UNIT II' },
    { number: 3, title: 'Instruction Pipelining, Hazards & RISC/CISC', code: 'UNIT III' },
    { number: 4, title: 'Memory Hierarchy & Cache Memory', code: 'UNIT IV' },
    { number: 5, title: 'I/O Organization, Interrupts & DMA', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — COMPUTER STRUCTURE, BUSES & EXECUTION
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs305-computer-structure',
      unit: 1,
      unitTitle: 'Computer Structure, Buses & Execution',
      topic: 'Computer Structure & Buses',
      title: 'Interactive Computer System & Bus Architecture ⭐ (Flagship)',
      icon: '🖥️',
      flagship: true,
      description: 'Explore the fundamental Von Neumann architecture: CPU, Memory, and I/O interconnected by system Data, Address, and Control buses.',
      formula: '\\text{Bus Width: } 2^k \\text{ Addressable Bytes} \\quad | \\quad \\text{Throughput} = \\text{Bus Width} \\times \\text{Bus Clock}',
      defaultParams: { busWidth: 32, clockMhz: 100, activeTransfer: 'cpu_to_mem' },
      challenge: {
        goal: 'Configure a 32-bit address bus to determine the maximum directly addressable physical RAM size.',
        expectedResult: '2^32 bytes = 4 GB'
      }
    },
    {
      id: 'u25cs305-instruction-execution',
      unit: 1,
      unitTitle: 'Computer Structure, Buses & Execution',
      topic: 'Instruction Execution',
      title: 'Single-Cycle Instruction Execution & Register Transfer Lab',
      icon: '⚙️',
      shortDescription: 'Trace register transfers step-by-step across PC, MAR, MBR, IR, and AC during the basic instruction fetch and execute phases.',
      formula: '\\text{Fetch: } [\\text{MAR}] \\leftarrow [\\text{PC}], \\; [\\text{MBR}] \\leftarrow \\text{M}[\\text{MAR}], \\; [\\text{IR}] \\leftarrow [\\text{MBR}], \\; [\\text{PC}] \\leftarrow [\\text{PC}] + 1',
      defaultParams: { opcode: 'LOAD', address: 0x40, initialAC: 0x00 },
      challenge: {
        goal: 'Execute an ADD instruction and determine the final state of the Accumulator (AC).',
        expectedResult: 'AC holds the updated arithmetic sum'
      }
    },
    {
      id: 'u25cs305-alu-arithmetic',
      unit: 1,
      unitTitle: 'Computer Structure, Buses & Execution',
      topic: 'ALU Operations & Flags',
      title: 'ALU Arithmetic, Logic & Status Flags Lab',
      icon: '🧮',
      shortDescription: 'Perform 8-bit two\'s complement binary operations in the ALU and observe status condition code flags: Zero (Z), Sign (S), Carry (C), and Overflow (V).',
      formula: 'V = C_{in} \\oplus C_{out} \\quad | \\quad Z = \\neg (A_7 \\lor A_6 \\lor \\dots \\lor A_0) \\quad | \\quad S = A_7',
      defaultParams: { operandA: 120, operandB: 15, operation: 'add' },
      challenge: {
        goal: 'Add two positive 8-bit signed numbers that cause a signed arithmetic overflow (V=1).',
        expectedResult: 'Sum > 127 causes Overflow Flag V = 1'
      }
    },
    {
      id: 'u25cs305-cpu-performance',
      unit: 1,
      unitTitle: 'Computer Structure, Buses & Execution',
      topic: 'Performance & Amdahl\'s Law',
      title: 'CPU Execution Time & Amdahl\'s Law Calculator',
      icon: '⏱️',
      shortDescription: 'Calculate CPU performance using the iron law of processor performance (CPU Time = IC × CPI × Clock Cycle Time) and evaluate Amdahl\'s speedup bounds.',
      formula: '\\text{CPU Time} = I_c \\times \\text{CPI} \\times \\tau \\quad | \\quad S = \\frac{1}{(1 - f) + \\frac{f}{s}}',
      defaultParams: { instructionCount: 1000000, cpi: 1.5, clockGhz: 2.0, enhancedFraction: 0.7, speedupFactor: 4.0 },
      challenge: {
        goal: 'Calculate the maximum theoretical speedup when 80% of a computing workload is parallelized infinitely (s → ∞).',
        expectedResult: 'Max Speedup = 1 / (1 - 0.8) = 5.0x'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — DATAPATH & CONTROL UNITS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs305-datapath-control',
      unit: 2,
      unitTitle: 'Datapath & Control Units',
      topic: 'Datapath & Control Signals',
      title: 'Single-Cycle Datapath & Control Signal Matrix ⭐ (Flagship)',
      icon: '🔌',
      flagship: true,
      description: 'Trace multiplexer selections and 9 essential control signals (RegDst, ALUSrc, MemtoReg, RegWrite, MemRead, MemWrite, Branch, ALUOp) for R-type, lw, sw, and beq instructions.',
      formula: '\\text{Control Signals: } [\\text{RegWrite}, \\text{ALUSrc}, \\text{MemWrite}, \\text{MemRead}, \\text{Branch}, \\dots]',
      defaultParams: { instructionType: 'R-type', rs: 1, rt: 2, rd: 3 },
      challenge: {
        goal: 'Identify which control signal must be asserted to route memory data into the register file during a load word (lw) instruction.',
        expectedResult: 'MemtoReg = 1'
      }
    },
    {
      id: 'u25cs305-instruction-cycle',
      unit: 2,
      unitTitle: 'Datapath & Control Units',
      topic: 'Instruction Cycle FSM',
      title: 'Multi-State Instruction Cycle State Machine',
      icon: '🔄',
      shortDescription: 'Step through the multi-state finite state machine: Fetch, Instruction Decode/Register Read, Execution/Address Calculation, Memory Access, and Write-Back.',
      formula: '\\text{State Transition: } S_0 \\to S_1 \\to S_2 \\to S_3 \\to S_4 \\to S_0',
      defaultParams: { currentCycle: 0, instName: 'ADD $t1, $t2, $t3' },
      challenge: {
        goal: 'Count how many clock cycles a Store Word (sw) instruction requires in a multi-cycle datapath without write-back.',
        expectedResult: '4 clock cycles (Fetch, Decode, Execute, MemWrite)'
      }
    },
    {
      id: 'u25cs305-hardwired-control',
      unit: 2,
      unitTitle: 'Datapath & Control Units',
      topic: 'Hardwired Control Units',
      title: 'Hardwired Control Unit & Timing Pulse Generator',
      icon: '⚡',
      shortDescription: 'Inspect combinational logic networks, instruction decoders, and ring-counter timing steps (T0, T1, T2, T3) that generate control signals with minimum latency.',
      formula: 'C_i = \\sum (\\text{Opcode}_j \\cdot T_k \\cdot \\text{Condition}_m)',
      defaultParams: { timingStep: 0, activeOpcode: 'ADD' },
      challenge: {
        goal: 'Observe which timing pulse triggers PC increment across all instruction fetch cycles.',
        expectedResult: 'Timing Pulse T1'
      }
    },
    {
      id: 'u25cs305-microprogrammed-control',
      unit: 2,
      unitTitle: 'Datapath & Control Units',
      topic: 'Microprogrammed Control',
      title: 'Microprogrammed Control Unit & Control Memory ROM',
      icon: '💾',
      shortDescription: 'Step through micro-instructions in Control Memory (CM) utilizing the Control Address Register (CAR), micro-sequencer, and control data registers.',
      formula: '\\text{CAR} \\leftarrow \\text{Next Address Field} \\quad \\text{or} \\quad \\text{Mapping Logic}(\\text{IR})',
      defaultParams: { carAddress: 0, microWordFormat: 'horizontal' },
      challenge: {
        goal: 'Differentiate horizontal micro-instructions (unencoded, fast) from vertical micro-instructions (encoded, compact).',
        expectedResult: 'Horizontal microcode provides direct parallel control line assertion'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — INSTRUCTION PIPELINING, HAZARDS & RISC/CISC
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs305-pipeline-stages',
      unit: 3,
      unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
      topic: '5-Stage Pipelining',
      title: '5-Stage Classic RISC Pipeline Simulator ⭐ (Flagship)',
      icon: '🏭',
      flagship: true,
      description: 'Simulate concurrent execution across IF (Instruction Fetch), ID (Decode), EX (Execute), MEM (Memory), and WB (Write-back) with clock space-time reservation tables.',
      formula: '\\text{Speedup } S_k = \\frac{n \\cdot k}{k + n - 1} \\xrightarrow{n \\to \\infty} k \\quad | \\quad \\text{Throughput} = \\frac{n}{(k + n - 1)\\tau}',
      defaultParams: { pipelineDepth: 5, numInstructions: 6, clockCycle: 1 },
      challenge: {
        goal: 'Calculate the total clock cycles required to execute 10 independent instructions through a 5-stage pipeline without hazards.',
        expectedResult: 'k + n - 1 = 5 + 10 - 1 = 14 cycles'
      }
    },
    {
      id: 'u25cs305-pipeline-hazards',
      unit: 3,
      unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
      topic: 'Pipeline Hazards & Forwarding',
      title: 'Pipeline Hazards & Data Forwarding Lab ⭐ (Flagship)',
      icon: '⚠️',
      flagship: true,
      description: 'Detect Read-After-Write (RAW) data hazards, insert stall bubbles, and resolve dependencies via ALU forwarding paths (EX→EX, MEM→EX).',
      formula: '\\text{Stall Penalty: } CPI_{\\text{pipe}} = 1 + \\text{Stalls}_{\\text{data}} + \\text{Stalls}_{\\text{control}}',
      defaultParams: { forwardingEnabled: true, hazardType: 'RAW_load_use' },
      challenge: {
        goal: 'Eliminate stall cycles between dependent arithmetic instructions by enabling data forwarding from EX/MEM stage.',
        expectedResult: 'Data Forwarding resolves RAW hazard with 0 stall bubbles'
      }
    },
    {
      id: 'u25cs305-branch-prediction',
      unit: 3,
      unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
      topic: 'Branch Prediction',
      title: 'Branch Prediction & Control Hazard Penalty Lab',
      icon: '🔀',
      shortDescription: 'Compare static branch strategies (always taken, always not taken) with dynamic 2-bit saturating counter predictors (Strongly Taken to Strongly Not Taken).',
      formula: '\\text{Branch Penalty Cycles} = \\text{Misprediction Rate} \\times \\text{Branch Latency}',
      defaultParams: { predictorType: '2bit_saturating', branchOutcome: 'T' },
      challenge: {
        goal: 'Step through an alternating loop pattern and observe the accuracy of a 2-bit hysteresis predictor.',
        expectedResult: '2-bit counter tolerates a single atypical loop exit without flipping state'
      }
    },
    {
      id: 'u25cs305-risc-vs-cisc',
      unit: 3,
      unitTitle: 'Instruction Pipelining, Hazards & RISC/CISC',
      topic: 'RISC vs CISC',
      title: 'RISC vs CISC Architecture & Instruction Set Lab',
      icon: '⚖️',
      shortDescription: 'Compare RISC (fixed-length instructions, load/store architecture, many registers) with CISC (variable-length, memory-to-memory arithmetic, complex addressing).',
      formula: '\\text{Execution Time} = \\text{Instruction Count} \\times \\text{CPI} \\times \\text{Clock Period}',
      defaultParams: { architecture: 'RISC', task: 'vector_multiply' },
      challenge: {
        goal: 'Analyze why RISC achieves higher clock rates despite higher instruction counts compared to CISC.',
        expectedResult: 'Simple instructions with uniform single-cycle datapath enable higher clock frequencies'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — MEMORY HIERARCHY & CACHE MEMORY
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs305-memory-hierarchy',
      unit: 4,
      unitTitle: 'Memory Hierarchy & Cache Memory',
      topic: 'Memory Hierarchy & AMAT',
      title: 'Memory Hierarchy & Average Memory Access Time (AMAT)',
      icon: '🏛️',
      shortDescription: 'Inspect capacity, access latency, and bandwidth pyramids from CPU registers through L1/L2/L3 caches, DRAM, and SSD storage.',
      formula: '\\text{AMAT} = \\text{Hit Time}_{L1} + (\\text{Miss Rate}_{L1} \\times \\text{Miss Penalty}_{L1})',
      defaultParams: { hitTimeL1: 1, missRateL1: 0.05, missPenaltyL1: 50 },
      challenge: {
        goal: 'Calculate the AMAT of a system with 1 ns L1 hit time, 5% miss rate, and 40 ns miss penalty.',
        expectedResult: 'AMAT = 1 + (0.05 * 40) = 3.0 ns'
      }
    },
    {
      id: 'u25cs305-cache-mapping',
      unit: 4,
      unitTitle: 'Memory Hierarchy & Cache Memory',
      topic: 'Cache Mapping & Policies',
      title: 'Cache Mapping (Direct, Associative & Set-Associative) Lab ⭐ (Flagship)',
      icon: '🎯',
      flagship: true,
      description: 'Split physical memory addresses into Tag, Set Index, and Block Offset fields; trace Hits and Misses, and simulate LRU line replacement.',
      formula: '\\text{Address Bits} = \\text{Tag Bits} + \\text{Index Bits} + \\text{Offset Bits} \\quad | \\quad \\text{Index} = \\log_2(\\text{Num Sets})',
      defaultParams: { mappingType: '2way_set_assoc', cacheSizeKB: 32, blockSizeBytes: 64, replacementPolicy: 'LRU' },
      challenge: {
        goal: 'Divide a 32-bit address into Tag, Index, and Offset fields for a 4-way set-associative cache of 64 KB with 64-byte blocks.',
        expectedResult: 'Offset = 6 bits, Index = 8 bits, Tag = 18 bits'
      }
    },
    {
      id: 'u25cs305-virtual-memory',
      unit: 4,
      unitTitle: 'Memory Hierarchy & Cache Memory',
      topic: 'Virtual Memory & Paging',
      title: 'Virtual Memory, Page Tables & TLB Address Translation',
      icon: '📑',
      shortDescription: 'Translate Virtual Addresses (VPN + Offset) to Physical Addresses (PFN + Offset) using Translation Lookaside Buffers (TLB) and multi-level page tables.',
      formula: '\\text{Physical Address} = [\\text{PFN} \\ll \\text{Offset Bits}] \\lor \\text{Offset} \\quad | \\quad \\text{Page Size} = 2^{\\text{Offset Bits}}',
      defaultParams: { pageSizeKB: 4, tlbHit: true, virtualAddr: 0x00401A20 },
      challenge: {
        goal: 'Identify the virtual page number (VPN) and byte offset for a 4 KB page from virtual address 0x00401A20.',
        expectedResult: 'VPN = 0x00401, Offset = 0xA20 (2592 bytes)'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — I/O ORGANIZATION, INTERRUPTS & DMA
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25cs305-io-interfacing',
      unit: 5,
      unitTitle: 'I/O Organization, Interrupts & DMA',
      topic: 'I/O Modes & Polling',
      title: 'Programmed I/O vs Interrupt-Driven I/O Explorer',
      icon: '🎛️',
      shortDescription: 'Compare the busy-waiting overhead of Programmed I/O with Interrupt-Driven I/O where the CPU executes other processes until hardware signals an IRQ.',
      formula: '\\text{CPU Utilization Overhead} = \\frac{\\text{Polling Time}}{\\text{Total Transfer Time}} \\times 100\\%',
      defaultParams: { ioMode: 'interrupt', deviceSpeed: 'medium' },
      challenge: {
        goal: 'Observe how CPU utilization drops from near 100% in polling to under 5% with interrupt-driven I/O.',
        expectedResult: 'Interrupts free CPU cycles during long peripheral device wait states'
      }
    },
    {
      id: 'u25cs305-dma-transfer',
      unit: 5,
      unitTitle: 'I/O Organization, Interrupts & DMA',
      topic: 'DMA Transfer & Bus Master',
      title: 'Direct Memory Access (DMA) & Bus Master Controller ⭐ (Flagship)',
      icon: '🚚',
      flagship: true,
      description: 'Simulate high-speed bulk data transfers between peripheral controllers and RAM using DMA bus requests (BR), bus grants (BG), burst mode, and cycle stealing.',
      formula: '\\text{DMA Transfer: } \\text{Peripheral} \\longleftrightarrow \\text{Memory} \\quad (\\text{CPU in Hold State})',
      defaultParams: { dmaMode: 'burst', transferBlocks: 16, cycleStealRatio: 0.2 },
      challenge: {
        goal: 'Compare Burst Mode (continuous transfer) with Cycle-Stealing Mode for disk block transfers.',
        expectedResult: 'Cycle stealing interleaves transfers during CPU internal execution cycles'
      }
    },
    {
      id: 'u25cs305-bus-arbitration',
      unit: 5,
      unitTitle: 'I/O Organization, Interrupts & DMA',
      topic: 'Bus Arbitration',
      title: 'Bus Arbitration & Master Priority Resolution Lab',
      icon: '🚦',
      shortDescription: 'Simulate multi-master bus arbitration using Daisy Chaining (serial priority), Centralized Parallel Arbitration, and Distributed Dynamic Priority protocols.',
      formula: '\\text{Bus Grant Delay: } T_{\\text{daisy}} \\propto N \\quad \\text{vs} \\quad T_{\\text{parallel}} = O(1)',
      defaultParams: { arbitrationScheme: 'centralized_parallel', numMasters: 4 },
      challenge: {
        goal: 'Evaluate the starvation susceptibility of lower-priority devices in fixed-priority daisy chain arbitration.',
        expectedResult: 'Master closest to arbiter can starve downstream devices without fair rotation'
      }
    }
  ];

  return {
    UNITS,
    SIMULATIONS,
    getSimulationById: function (id) {
      return SIMULATIONS.find(s => s.id === id) || null;
    },
    getSimulationsByUnit: function (unitNumber) {
      return SIMULATIONS.filter(s => s.unit === unitNumber);
    }
  };
}));
