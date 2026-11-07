import React, { useState } from 'react';

interface StudioProps {
  params: Record<string, any>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 13: ALGORITHM BUILDER & FLOWCHART EXECUTION
// ─────────────────────────────────────────────────────────────────────────────
export const AlgorithmBuilderStudio: React.FC<StudioProps> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [valA, setValA] = useState(14);
  const [valB, setValB] = useState(25);

  const stepsMax2 = [
    { title: '1. Start Terminal', type: 'terminal', desc: 'Initialize algorithm context', out: '—' },
    { title: '2. Input Read', type: 'io', desc: `Read integers: A = ${valA}, B = ${valB}`, out: `A=${valA}, B=${valB}` },
    { title: '3. Decision Diamond', type: 'decision', desc: `Evaluate condition: Is A (${valA}) > B (${valB})? ➔ ${valA > valB ? 'YES (TRUE)' : 'NO (FALSE)'}`, out: valA > valB ? 'Branch TRUE' : 'Branch FALSE' },
    { title: '4. Assign Maximum', type: 'process', desc: `Set Max = ${valA > valB ? valA : valB}`, out: `Max=${valA > valB ? valA : valB}` },
    { title: '5. Output Display', type: 'io', desc: `Print Maximum result: ${valA > valB ? valA : valB}`, out: `Display: ${valA > valB ? valA : valB}` },
    { title: '6. End Terminal', type: 'terminal', desc: 'Algorithm halts successfully', out: 'HALT' },
  ];

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>📐</span> Algorithmic Flowchart Builder &amp; Tracer
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
          Step {activeStep + 1} of {stepsMax2.length}
        </span>
      </div>

      {/* Input Adjustments */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Input A:</span>
            <strong className="font-mono text-indigo-400">{valA}</strong>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={valA}
            onChange={(e) => setValA(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
        <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Input B:</span>
            <strong className="font-mono text-indigo-400">{valB}</strong>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={valB}
            onChange={(e) => setValB(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Flowchart Control Stepper */}
      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <button
          type="button"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 disabled:opacity-40 cursor-pointer"
        >
          Previous Block
        </button>
        <span className="font-mono text-xs text-indigo-300 font-bold">{(stepsMax2[activeStep] || stepsMax2[0]!).title}</span>
        <button
          type="button"
          disabled={activeStep === stepsMax2.length - 1}
          onClick={() => setActiveStep((s) => Math.min(stepsMax2.length - 1, s + 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-40 cursor-pointer"
        >
          Step Execution Token ➔
        </button>
      </div>

      {/* Visual Flowchart Stack */}
      <div className="space-y-2">
        {stepsMax2.map((st, i) => {
          const isCurrent = activeStep === i;
          return (
            <div
              key={i}
              onClick={() => setActiveStep(i)}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer font-mono ${
                isCurrent
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50 shadow-lg'
                  : i < activeStep
                  ? 'bg-slate-950 border-slate-800 text-emerald-400'
                  : 'bg-slate-950 border-slate-900 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{st.title}</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">({st.desc})</span>
              </div>
              <div className="font-bold text-slate-300">{st.out}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 14: SCRATCH BLOCKS WORLD
// ─────────────────────────────────────────────────────────────────────────────
export const ScratchBlocksStudio: React.FC<StudioProps> = () => {
  const [roverPos, setRoverPos] = useState<{ x: number; y: number; dir: number }>({ x: 0, y: 0, dir: 0 }); // dir 0=east, 1=south, 2=west, 3=north
  const [blocks, setBlocks] = useState<string[]>(['move', 'turn_right', 'move', 'move']);
  const [isRunning, setIsRunning] = useState(false);
  const [goalReached, setGoalReached] = useState(false);

  const goal = { x: 2, y: 1 };

  const runProgram = () => {
    setIsRunning(true);
    setGoalReached(false);
    let cur = { x: 0, y: 0, dir: 0 };
    setRoverPos(cur);

    blocks.forEach((blk, idx) => {
      setTimeout(() => {
        if (blk === 'move') {
          if (cur.dir === 0) cur.x = Math.min(3, cur.x + 1);
          if (cur.dir === 1) cur.y = Math.min(3, cur.y + 1);
          if (cur.dir === 2) cur.x = Math.max(0, cur.x - 1);
          if (cur.dir === 3) cur.y = Math.max(0, cur.y - 1);
        } else if (blk === 'turn_right') {
          cur.dir = (cur.dir + 1) % 4;
        } else if (blk === 'turn_left') {
          cur.dir = (cur.dir + 3) % 4;
        }
        setRoverPos({ ...cur });

        if (cur.x === goal.x && cur.y === goal.y) {
          setGoalReached(true);
        }

        if (idx === blocks.length - 1) {
          setIsRunning(false);
        }
      }, (idx + 1) * 500);
    });
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🧩</span> Visual Block Programming Maze Arena
        </h3>
        <button
          type="button"
          disabled={isRunning}
          onClick={runProgram}
          className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition cursor-pointer shadow-lg"
        >
          {isRunning ? 'Running Blocks…' : '▶ Run Program'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 4x4 Grid Arena */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Rover Navigation Grid</span>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => {
              const x = i % 4;
              const y = Math.floor(i / 4);
              const isRover = roverPos.x === x && roverPos.y === y;
              const isGoal = goal.x === x && goal.y === y;

              return (
                <div
                  key={i}
                  className={`size-12 rounded-xl border flex items-center justify-center font-bold text-lg transition ${
                    isRover
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 ring-2 ring-indigo-400 scale-105'
                      : isGoal
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-700'
                  }`}
                >
                  {isRover ? '🤖' : isGoal ? '⭐' : ''}
                </div>
              );
            })}
          </div>
          {goalReached && (
            <div className="text-xs font-black text-emerald-400 pt-1">
              🎉 Star Goal Reached! Objective Complete.
            </div>
          )}
        </div>

        {/* Visual Blocks Workspace */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase">
            <span>Block Code Stack:</span>
            <button
              type="button"
              onClick={() => setBlocks(['move', 'turn_right', 'move', 'move'])}
              className="text-indigo-400 hover:underline cursor-pointer"
            >
              Reset Blocks
            </button>
          </div>
          <div className="space-y-1.5 flex-1">
            {blocks.map((blk, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-200 font-mono text-xs flex items-center gap-2 shadow-xs"
              >
                <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                <span className="font-bold">{blk === 'move' ? 'Forward (1 Step)' : blk === 'turn_right' ? 'Turn Right 90°' : 'Turn Left 90°'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 15: ALGORITHM FLOW AND TRACE-TABLE SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────
export const TraceTableStudio: React.FC<StudioProps> = () => {
  const [step, setStep] = useState(0);

  const traceRows = [
    { line: 1, desc: 'Initialize accumulator fact = 1', i: '—', fact: 1, cond: '—', out: '—' },
    { line: 2, desc: 'For loop init: i = 1', i: 1, fact: 1, cond: '1 <= 4 (TRUE)', out: '—' },
    { line: 3, desc: 'Compute fact = fact * i = 1 * 1 = 1', i: 1, fact: 1, cond: '—', out: '—' },
    { line: 2, desc: 'Loop step: i = 2', i: 2, fact: 1, cond: '2 <= 4 (TRUE)', out: '—' },
    { line: 3, desc: 'Compute fact = 1 * 2 = 2', i: 2, fact: 2, cond: '—', out: '—' },
    { line: 2, desc: 'Loop step: i = 3', i: 3, fact: 2, cond: '3 <= 4 (TRUE)', out: '—' },
    { line: 3, desc: 'Compute fact = 2 * 3 = 6', i: 3, fact: 6, cond: '—', out: '—' },
    { line: 2, desc: 'Loop step: i = 4', i: 4, fact: 6, cond: '4 <= 4 (TRUE)', out: '—' },
    { line: 3, desc: 'Compute fact = 6 * 4 = 24', i: 4, fact: 24, cond: '—', out: '—' },
    { line: 2, desc: 'Loop check: i = 5', i: 5, fact: 24, cond: '5 <= 4 (FALSE)', out: '—' },
    { line: 4, desc: 'Return fact (24)', i: 5, fact: 24, cond: '—', out: '24 (Final)' },
  ];

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>📋</span> Algorithm Flow &amp; Trace-Table Simulator
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
          Step {step + 1} of {traceRows.length}
        </span>
      </div>

      {/* Stepper Controls */}
      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 disabled:opacity-40 cursor-pointer"
        >
          Previous Step
        </button>
        <span className="font-mono text-xs text-indigo-300 font-bold">Line {(traceRows[step] || traceRows[0]!).line} Active</span>
        <button
          type="button"
          disabled={step === traceRows.length - 1}
          onClick={() => setStep((s) => Math.min(traceRows.length - 1, s + 1))}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-40 cursor-pointer"
        >
          Step Next ➔
        </button>
      </div>

      {/* Dynamic Trace Table */}
      <div className="overflow-x-auto p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
        <div className="grid grid-cols-5 gap-2 pb-2 border-b border-slate-800 font-bold text-slate-400 text-center">
          <div>Step</div>
          <div>Line #</div>
          <div>Variable `i`</div>
          <div>`fact`</div>
          <div>Condition i &le; n</div>
        </div>
        <div className="space-y-1 mt-2 max-h-48 overflow-y-auto">
          {traceRows.slice(0, step + 1).map((r, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-5 gap-2 p-1.5 rounded text-center items-center text-[11px] ${
                idx === step ? 'bg-indigo-600/30 text-indigo-200 font-bold ring-1 ring-indigo-500' : 'text-slate-400'
              }`}
            >
              <div>{idx + 1}</div>
              <div>Line {r.line}</div>
              <div>{r.i}</div>
              <div className="text-emerald-400 font-bold">{r.fact}</div>
              <div className="text-amber-400">{r.cond}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Line Description */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300">
        Active Operation: {(traceRows[step] || traceRows[0]!).desc}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 16: SEARCHING ALGORITHM RACE
// ─────────────────────────────────────────────────────────────────────────────
export const SearchRaceStudio: React.FC<StudioProps> = () => {
  const [target, setTarget] = useState(42);
  const [array] = useState([7, 12, 19, 23, 29, 34, 42, 51, 58, 64, 73, 85, 91, 98]);

  // Linear search steps to target 42 (index 6 ➔ 7 steps)
  const targetIndex = array.indexOf(target);
  const linearComparisons = targetIndex + 1;
  const binaryComparisons = 3; // 14 elements binary search finds 42 in 3 steps

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🔍</span> Searching Algorithm Race
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
          Target: {target}
        </span>
      </div>

      {/* Array Elements Bar Display */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase">Monotonically Sorted Array (14 Items):</span>
        <div className="flex flex-wrap gap-1.5">
          {array.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTarget(item)}
              className={`p-2 rounded-xl font-mono text-xs font-bold transition cursor-pointer border ${
                item === target
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Algorithm Race Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-amber-400 font-bold border-b border-slate-800 pb-2">
            <span>Linear Search O(n)</span>
            <span>{linearComparisons} Steps</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Scans index-by-index from 0 to {targetIndex}. Checks {linearComparisons} elements sequentially.
          </p>
          <div className="p-2 rounded-lg bg-slate-900 text-[11px] text-amber-300">
            Comparisons Required: <strong>{linearComparisons}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <span>Binary Search O(log n)</span>
            <span>{binaryComparisons} Steps</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Divides search space in half each comparison: Range [0..13] ➔ [0..6] ➔ [4..6] ➔ Found at index 6!
          </p>
          <div className="p-2 rounded-lg bg-slate-900 text-[11px] text-emerald-300">
            Comparisons Required: <strong>{binaryComparisons}</strong> (Halving Speedup)
          </div>
        </div>
      </div>
    </div>
  );
};
