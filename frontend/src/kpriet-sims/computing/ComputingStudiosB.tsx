import React, { useState } from 'react';

interface StudioProps {
  params: Record<string, any>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 5: INSIDE A COMPUTER — HARDWARE ARCHITECTURE EXPLORER
// ─────────────────────────────────────────────────────────────────────────────
export const HardwareExplorerStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const comp = params.component || 'cpu';

  const componentSpecs: Record<string, { title: string; role: string; specs: string[]; tdp: string }> = {
    cpu: {
      title: 'Central Processing Unit (CPU)',
      role: 'Executes instructions, arithmetic/logic computations, and coordinates system buses.',
      specs: ['Socket: LGA1700 / AM5', 'Cores: 8 Performance + 8 Efficiency', 'Clock: 3.4 GHz – 5.4 GHz Boost', 'Cache: 32MB L3 Unified'],
      tdp: '125 W',
    },
    ram: {
      title: 'Dual-Channel DDR5 System Memory',
      role: 'High-speed volatile working storage feeding active instructions and OS buffers to the CPU cache.',
      specs: ['Topology: Dual-Channel 2×32-bit', 'Data Rate: DDR5-6000 MT/s', 'Bandwidth: ~96 GB/s', 'Latency: CAS 30 (~10 ns)'],
      tdp: '15 W',
    },
    gpu: {
      title: 'PCIe Graphics Accelerator (GPU)',
      role: 'Massively parallel compute engine rendering framebuffers and accelerating tensor matrix operations.',
      specs: ['Interconnect: PCIe 4.0 x16 (31.5 GB/s)', 'VRAM: 16 GB GDDR6X', 'Bandwidth: 1,008 GB/s', 'Compute Units: 9,728 Cores'],
      tdp: '285 W',
    },
    storage: {
      title: 'NVMe M.2 Solid State Drive',
      role: 'Non-volatile secondary persistence storing the operating system kernel, executables, and user files.',
      specs: ['Bus: PCIe 4.0 x4 (M.2 NVMe)', 'Sequential Read: 7,000 MB/s', 'Random Read: 1,000,000 IOPS', 'Form Factor: M.2 2280'],
      tdp: '7 W',
    },
    motherboard: {
      title: 'Motherboard VRM & Chipset Interconnect',
      role: 'Distributes clean DC power phases, routes high-speed differential traces, and connects peripheral I/O.',
      specs: ['Form Factor: ATX', 'VRM: 16+1+1 Power Stages', 'Chipset: Intel Z790 / AMD X670', 'Layers: 8-Layer Low-Loss PCB'],
      tdp: '25 W',
    },
  };

  const current = componentSpecs[comp] || componentSpecs.cpu || {
    title: 'Central Processing Unit (CPU)',
    role: 'Executes instructions, arithmetic/logic computations, and coordinates system buses.',
    specs: ['Socket: LGA1700 / AM5', 'Cores: 8P + 8E', 'Clock: 3.4 GHz - 5.4 GHz', 'Cache: 32MB L3 Unified'],
    tdp: '125 W',
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🖥️</span> Computer Hardware Architecture Explorer
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          TDP: {current.tdp}
        </span>
      </div>

      {/* Component Navigation Chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(componentSpecs).map(([key, val]) => (
          <button
            key={key}
            type="button"
            onClick={() => setParams((p) => ({ ...p, component: key }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              comp === key
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {val.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Component Architectural Deep-Dive Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-100 text-sm">{current.title}</h4>
          <span className="font-mono text-xs text-indigo-400">Power Rating: {current.tdp}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{current.role}</p>

        <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Technical Specifications:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-indigo-300">
            {current.specs.map((spec, i) => (
              <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                {spec}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 6: INPUT–PROCESS–OUTPUT DATA JOURNEY
// ─────────────────────────────────────────────────────────────────────────────
export const IPOJourneyStudio: React.FC<StudioProps> = ({ params }) => {
  const [step, setStep] = useState(0);
  const scenario = params.scenario || 'typing';

  const stages = [
    { title: '1. Input Generation', desc: 'Hardware event / keyboard interrupt (IRQ 1) captures character keycode.', icon: '⌨️', loc: 'Keyboard Controller' },
    { title: '2. Bus Transmission', desc: 'Interrupt Service Routine copies keycode through PCI/USB bus into operating system buffer.', icon: '⚡', loc: 'I/O Bus Controller' },
    { title: '3. Memory Buffering', desc: 'Data placed into temporary volatile RAM buffer for the active word processor process.', icon: '💾', loc: 'RAM Working Buffer' },
    { title: '4. CPU Processing', desc: 'CPU registers decode character code, updates document text tree, and calculates typography metrics.', icon: '⚙️', loc: 'CPU ALU & Registers' },
    { title: '5. Display Rendering', desc: 'Graphics pipeline rasterizes glyph into frame buffer and displays on screen monitor.', icon: '🖥️', loc: 'GPU / Screen Monitor' },
  ];

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🔄</span> Input–Process–Output Data Journey
        </h3>
        <span className="font-mono text-xs text-indigo-400 uppercase font-bold">Scenario: {scenario}</span>
      </div>

      {/* Stepper Controls */}
      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 disabled:opacity-40 cursor-pointer"
        >
          Previous Stage
        </button>
        <span className="font-mono text-xs text-indigo-300 font-bold">
          Stage {step + 1} of {stages.length}
        </span>
        <button
          type="button"
          disabled={step === stages.length - 1}
          onClick={() => setStep((s) => Math.min(stages.length - 1, s + 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-40 cursor-pointer"
        >
          Next Stage ➔
        </button>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-5 gap-1.5 text-center">
        {stages.map((st, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              step === i
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/40 shadow-lg'
                : i < step
                ? 'bg-slate-950 border-slate-800 text-emerald-400'
                : 'bg-slate-950 border-slate-900 text-slate-600'
            }`}
          >
            <div className="text-xl">{st.icon}</div>
            <div className="text-[10px] font-bold mt-1 truncate">{st.title.split(' ')[1]}</div>
          </div>
        ))}
      </div>

      {/* Stage Detail Card */}
      {(() => {
        const currentStage = stages[step] || stages[0]!;
        return (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-100 text-sm">{currentStage.title}</h4>
              <span className="font-mono text-xs text-emerald-400">Current Node: {currentStage.loc}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentStage.desc}</p>
          </div>
        );
      })()}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 7: CPU INSTRUCTION EXECUTION SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────
export const CPUExecutionStudio: React.FC<StudioProps> = () => {
  const [cycleIndex, setCycleIndex] = useState(0);

  const cycles = [
    { phase: 'FETCH', pc: '0x0000', ir: 'LOAD R1, [10]', mar: '0x0000', mdr: 'LOAD R1, [10]', r1: '0x0000', r2: '0x0005', desc: 'PC points to instruction address 0x0000. Instruction is loaded into IR, PC increments to 0x0001.' },
    { phase: 'DECODE', pc: '0x0001', ir: 'LOAD R1, [10]', mar: '0x000A', mdr: '0x0009', r1: '0x0000', r2: '0x0005', desc: 'Control Unit decodes opcode (LOAD) and memory address 10 (0x000A). Fetches memory operand.' },
    { phase: 'EXECUTE', pc: '0x0001', ir: 'LOAD R1, [10]', mar: '0x000A', mdr: '0x0009', r1: '0x0009', r2: '0x0005', desc: 'Data from MDR (value 9) is transferred into Register R1.' },
    { phase: 'FETCH', pc: '0x0001', ir: 'ADD R1, R2', mar: '0x0001', mdr: 'ADD R1, R2', r1: '0x0009', r2: '0x0005', desc: 'Fetch next instruction at 0x0001 (ADD R1, R2). PC increments to 0x0002.' },
    { phase: 'EXECUTE', pc: '0x0002', ir: 'ADD R1, R2', mar: '0x0001', mdr: 'ADD R1, R2', r1: '0x000E', r2: '0x0005', desc: 'ALU adds R1 (9) + R2 (5) = 14 (0x000E). Writes sum back to Register R1.' },
  ];

  const current = cycles[cycleIndex] || cycles[0]!;

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>⚙️</span> CPU Instruction Execution Simulator
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Phase: {current.phase}
        </span>
      </div>

      {/* Step Buttons */}
      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <button
          type="button"
          disabled={cycleIndex === 0}
          onClick={() => setCycleIndex((c) => Math.max(0, c - 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 disabled:opacity-40 cursor-pointer"
        >
          Step Backward
        </button>
        <span className="font-mono text-xs text-indigo-300 font-bold">
          Cycle {cycleIndex + 1} of {cycles.length}
        </span>
        <button
          type="button"
          disabled={cycleIndex === cycles.length - 1}
          onClick={() => setCycleIndex((c) => Math.min(cycles.length - 1, c + 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-40 cursor-pointer"
        >
          Step Clock Pulse ➔
        </button>
      </div>

      {/* Internal Registers Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Program Counter (PC)</span>
          <div className="text-base font-black text-amber-400 mt-1">{current.pc}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Instruction Reg (IR)</span>
          <div className="text-sm font-black text-emerald-400 mt-1 truncate">{current.ir}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Register R1</span>
          <div className="text-base font-black text-sky-400 mt-1">{current.r1}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Register R2</span>
          <div className="text-base font-black text-purple-400 mt-1">{current.r2}</div>
        </div>
      </div>

      {/* Micro-Operation Explanation */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
        <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
          Active Micro-Operation
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">{current.desc}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 8: CPU PIPELINING AND HAZARDS VISUALIZER
// ─────────────────────────────────────────────────────────────────────────────
export const CPUPipelineStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const forwarding = params.forwarding !== 'disabled';

  // Pipeline stages: IF, ID, EX, MEM, WB
  // Without forwarding: I2 must stall until I1 writes back (WB in cycle 5), so I2 EX in cycle 6
  // With forwarding: I2 EX can take forwarded ALU output from I1 EX directly in cycle 4
  const cycles = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>⚡</span> CPU Pipelining &amp; Hazards Visualizer
        </h3>
        <button
          type="button"
          onClick={() => setParams((p) => ({ ...p, forwarding: forwarding ? 'disabled' : 'enabled' }))}
          className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
            forwarding
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          Hardware Forwarding: {forwarding ? 'ENABLED (Bypass Active)' : 'DISABLED (Stalls)'}
        </button>
      </div>

      {/* Instructions Pipeline Timing Grid */}
      <div className="overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-9 gap-1 text-center font-bold text-slate-400 pb-2 border-b border-slate-800">
          <div className="text-left">Instruction</div>
          {cycles.map((c) => (
            <div key={c}>CC{c}</div>
          ))}
        </div>

        {/* Row 1: I1 (Cycles 1-5) */}
        <div className="grid grid-cols-9 gap-1 text-center items-center">
          <div className="text-left text-[11px] text-slate-300 truncate font-semibold">I1: ADD</div>
          <div className="p-1.5 rounded bg-indigo-900/50 text-indigo-300 font-bold">IF</div>
          <div className="p-1.5 rounded bg-sky-900/50 text-sky-300 font-bold">ID</div>
          <div className="p-1.5 rounded bg-amber-900/50 text-amber-300 font-bold">EX</div>
          <div className="p-1.5 rounded bg-purple-900/50 text-purple-300 font-bold">MEM</div>
          <div className="p-1.5 rounded bg-emerald-900/50 text-emerald-300 font-bold">WB</div>
          <div className="text-slate-700">—</div>
          <div className="text-slate-700">—</div>
          <div className="text-slate-700">—</div>
        </div>

        {/* Row 2: I2 (Dependency on R1) */}
        <div className="grid grid-cols-9 gap-1 text-center items-center">
          <div className="text-left text-[11px] text-slate-300 truncate font-semibold">I2: SUB</div>
          <div className="text-slate-700">—</div>
          <div className="p-1.5 rounded bg-indigo-900/50 text-indigo-300 font-bold">IF</div>
          {forwarding ? (
            <>
              <div className="p-1.5 rounded bg-sky-900/50 text-sky-300 font-bold">ID</div>
              <div className="p-1.5 rounded bg-amber-900/50 text-amber-300 font-bold ring-1 ring-emerald-400">EX*</div>
              <div className="p-1.5 rounded bg-purple-900/50 text-purple-300 font-bold">MEM</div>
              <div className="p-1.5 rounded bg-emerald-900/50 text-emerald-300 font-bold">WB</div>
              <div className="text-slate-700">—</div>
              <div className="text-slate-700">—</div>
            </>
          ) : (
            <>
              <div className="p-1.5 rounded bg-rose-900/50 text-rose-300 font-bold animate-pulse">STALL</div>
              <div className="p-1.5 rounded bg-rose-900/50 text-rose-300 font-bold animate-pulse">STALL</div>
              <div className="p-1.5 rounded bg-sky-900/50 text-sky-300 font-bold">ID</div>
              <div className="p-1.5 rounded bg-amber-900/50 text-amber-300 font-bold">EX</div>
              <div className="p-1.5 rounded bg-purple-900/50 text-purple-300 font-bold">MEM</div>
              <div className="p-1.5 rounded bg-emerald-900/50 text-emerald-300 font-bold">WB</div>
            </>
          )}
        </div>
      </div>

      {/* Performance Summary Metrics */}
      <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Throughput Speedup</span>
          <div className="text-base font-black text-emerald-400 mt-1">{forwarding ? '4.24x' : '2.86x'}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Effective CPI</span>
          <div className="text-base font-black text-indigo-400 mt-1">{forwarding ? '1.18' : '1.75'}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">RAW Data Hazard</span>
          <div className="text-base font-black text-amber-400 mt-1">{forwarding ? 'Forwarded' : '2 Bubble Stalls'}</div>
        </div>
      </div>
    </div>
  );
};
