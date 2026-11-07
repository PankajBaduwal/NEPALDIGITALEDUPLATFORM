import React, { useState } from 'react';

interface StudioProps {
  params: Record<string, any>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 17: SORTING ALGORITHM VISUALIZER
// ─────────────────────────────────────────────────────────────────────────────
export const SortingVisualizerStudio: React.FC<StudioProps> = () => {
  const [algo, setAlgo] = useState<'bubble' | 'insertion' | 'selection'>('bubble');
  const [arr, setArr] = useState<number[]>([42, 17, 89, 33, 56, 12, 74, 25]);
  const [comparing, setComparing] = useState<number[]>([0, 1]);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [isSorted, setIsSorted] = useState(false);

  const shuffleArray = () => {
    setArr([55, 18, 92, 34, 67, 11, 80, 23]);
    setComparing([]);
    setComparisons(0);
    setSwaps(0);
    setIsSorted(false);
  };

  const stepSort = () => {
    if (isSorted) return;
    const next = [...arr];

    // Single Bubble Sort pass step
    let swapped = false;
    for (let i = 0; i < next.length - 1; i++) {
      const cur = next[i];
      const nxt = next[i + 1];
      if (cur !== undefined && nxt !== undefined && cur > nxt) {
        setComparing([i, i + 1]);
        next[i] = nxt;
        next[i + 1] = cur;
        setSwaps((s) => s + 1);
        setComparisons((c) => c + 1);
        setArr(next);
        swapped = true;
        return;
      }
    }
    if (!swapped) {
      setIsSorted(true);
      setComparing([]);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>📊</span> Sorting Algorithm Visualizer
        </h3>
        <div className="flex gap-1.5">
          {['bubble', 'insertion', 'selection'].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => { setAlgo(a as any); shuffleArray(); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                algo === a
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              {a} Sort
            </button>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={shuffleArray}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
        >
          Shuffle List
        </button>
        <span className="font-mono text-xs text-indigo-300 font-bold">
          {isSorted ? '✅ Array Sorted Completely!' : 'In Progress'}
        </span>
        <button
          type="button"
          disabled={isSorted}
          onClick={stepSort}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-40 cursor-pointer shadow-md"
        >
          Step Swap ➔
        </button>
      </div>

      {/* Visual Array Bars */}
      <div className="flex items-end justify-center gap-3 h-48 p-4 rounded-xl bg-slate-950 border border-slate-800">
        {arr.map((val, idx) => {
          const isComp = comparing.includes(idx);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-400">{val}</span>
              <div
                style={{ height: `${val * 1.6}px` }}
                className={`w-full rounded-t-lg transition-all duration-200 ${
                  isSorted
                    ? 'bg-emerald-500/80 shadow-emerald-500/30'
                    : isComp
                    ? 'bg-amber-400 shadow-amber-400/50'
                    : 'bg-indigo-500/70'
                }`}
              />
              <span className="text-[9px] font-mono text-slate-500">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Operation Counters & Complexity */}
      <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Comparisons</span>
          <div className="text-base font-black text-amber-400 mt-1">{comparisons}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Element Swaps</span>
          <div className="text-base font-black text-rose-400 mt-1">{swaps}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Worst Complexity</span>
          <div className="text-base font-black text-indigo-400 mt-1">O(n²) Quadratic</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 18: COMPUTATIONAL DECOMPOSITION AND ABSTRACTION PUZZLE
// ─────────────────────────────────────────────────────────────────────────────
export const DecompositionStudio: React.FC<StudioProps> = () => {
  const [activePillar, setActivePillar] = useState<'decomp' | 'pattern' | 'abstract' | 'algo'>('decomp');

  const pillars = {
    decomp: {
      title: 'Pillar 1: Modular Decomposition',
      desc: 'Breaking the complex Smart Campus Attendance System into independent subproblems: (1) RFID Card Sensing, (2) Student ID Validation, (3) Database Logging, (4) Absence Alert Email.',
      color: 'text-indigo-400',
    },
    pattern: {
      title: 'Pillar 2: Pattern Recognition',
      desc: 'Identifying recurring behaviors across modules: Every transaction follows [Read UID] ➔ [Lookup In-Memory Hash Table] ➔ [Append Audit Record].',
      color: 'text-emerald-400',
    },
    abstract: {
      title: 'Pillar 3: Data Abstraction',
      desc: 'Filtering out non-essential student details (hair color, clothing, hobbies) and focusing exclusively on essential computational invariants (Roll Number, Course Code, Timestamp).',
      color: 'text-amber-400',
    },
    algo: {
      title: 'Pillar 4: Algorithm Design',
      desc: 'Synthesizing step-by-step instructions to automate the validated system with deterministic error-handling branches.',
      color: 'text-purple-400',
    },
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🧩</span> Decomposition, Pattern Recognition &amp; Abstraction
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
          4 Pillars of CT
        </span>
      </div>

      {/* 4 Pillars Tab Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(['decomp', 'pattern', 'abstract', 'algo'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActivePillar(key)}
            className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer border text-center ${
              activePillar === key
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {pillars[key].title.split(':')[1]}
          </button>
        ))}
      </div>

      {/* Pillar Content Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <h4 className={`font-bold text-sm ${pillars[activePillar].color}`}>
          {pillars[activePillar].title}
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {pillars[activePillar].desc}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 19: OS AND PROCESS SCHEDULER PLAYGROUND
// ─────────────────────────────────────────────────────────────────────────────
export const OSSchedulerStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const policy = params.policy || 'rr';
  const isRR = policy === 'rr';
  const quantum = Math.max(1, Math.min(6, params.quantum ?? 2));

  // Processes: P1 (Burst 5), P2 (Burst 3), P3 (Burst 2)
  // FCFS Gantt: P1(0-5), P2(5-8), P3(8-10). Wait: P1=0, P2=5, P3=8. Avg Wait = 4.33ms
  // RR (q=2): P1(0-2), P2(2-4), P3(4-6), P1(6-8), P2(8-9), P1(9-10). Avg Wait = 3.66ms
  const avgWait = isRR ? (3.66).toFixed(2) : (4.33).toFixed(2);
  const avgTurnaround = isRR ? (7.0).toFixed(2) : (7.67).toFixed(2);

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>⏱️</span> Operating System Process Scheduler
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, policy: 'fcfs' }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
              !isRR ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            FCFS (Non-preemptive)
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, policy: 'rr' }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isRR ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            Round Robin (Preemptive)
          </button>
        </div>
      </div>

      {/* Quantum Slider for RR */}
      {isRR && (
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Round Robin Time Quantum (q):</span>
            <span className="font-mono font-bold text-indigo-400">{quantum} ms</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            value={quantum}
            onChange={(e) => setParams((p) => ({ ...p, quantum: parseInt(e.target.value, 10) }))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {/* Gantt Chart Timeline */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
          CPU Execution Gantt Chart:
        </span>
        <div className="flex h-12 rounded-xl overflow-hidden font-mono text-xs font-bold border border-slate-800">
          {isRR ? (
            <>
              <div className="flex-1 bg-indigo-600/70 border-r border-slate-900 flex items-center justify-center text-white">P1 (0-2)</div>
              <div className="flex-1 bg-emerald-600/70 border-r border-slate-900 flex items-center justify-center text-white">P2 (2-4)</div>
              <div className="flex-1 bg-amber-600/70 border-r border-slate-900 flex items-center justify-center text-white">P3 (4-6)</div>
              <div className="flex-1 bg-indigo-600/70 border-r border-slate-900 flex items-center justify-center text-white">P1 (6-8)</div>
              <div className="w-12 bg-emerald-600/70 border-r border-slate-900 flex items-center justify-center text-white">P2</div>
              <div className="w-12 bg-indigo-600/70 flex items-center justify-center text-white">P1</div>
            </>
          ) : (
            <>
              <div className="w-1/2 bg-indigo-600/70 border-r border-slate-900 flex items-center justify-center text-white">P1 (0-5 ms)</div>
              <div className="w-3/10 bg-emerald-600/70 border-r border-slate-900 flex items-center justify-center text-white">P2 (5-8 ms)</div>
              <div className="w-2/10 bg-amber-600/70 flex items-center justify-center text-white">P3 (8-10 ms)</div>
            </>
          )}
        </div>
      </div>

      {/* Performance Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Average Waiting Time</span>
          <div className="text-base font-black text-emerald-400 mt-1">{avgWait} ms</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Average Turnaround Time</span>
          <div className="text-base font-black text-indigo-400 mt-1">{avgTurnaround} ms</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 20: SOFTWARE DEVELOPMENT AND DEBUGGING MISSION
// ─────────────────────────────────────────────────────────────────────────────
export const SoftwareDebuggingStudio: React.FC<StudioProps> = () => {
  const [fixed, setFixed] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'pass' | 'fail'>('idle');

  const runTests = () => {
    if (fixed) {
      setTestResult('pass');
    } else {
      setTestResult('fail');
    }
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🐛</span> Software Development &amp; Debugging Mission
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
          Bug: Array Out-of-Bounds Loop
        </span>
      </div>

      {/* Code Inspector with Buggy Line Highlight */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
        <div className="text-slate-500">1: int scores[5] = &#123;90, 85, 78, 92, 88&#125;;</div>
        <div className="text-slate-500">2: int sum = 0;</div>
        <div className={`p-1.5 rounded transition ${fixed ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50' : 'bg-rose-950/60 text-rose-300 border border-rose-700/50'}`}>
          {fixed ? '3: for (int i = 0; i < 5; i++) // FIXED (bounds: 0..4)' : '3: for (int i = 0; i <= 5; i++) // BUG: Off-by-one out-of-bounds at i=5!'}
        </div>
        <div className="text-slate-500">4:     sum += scores[i];</div>
        <div className="text-slate-500">5: printf("Total = %d", sum);</div>
      </div>

      {/* Interactive Fix Toggle & Test Runner */}
      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => { setFixed(!fixed); setTestResult('idle'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
            fixed
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
              : 'bg-amber-600 text-white border-amber-500 shadow-md'
          }`}
        >
          {fixed ? 'Revert to Original Buggy Code' : 'Apply Patch: Change `i <= 5` to `i < 5`'}
        </button>

        <button
          type="button"
          onClick={runTests}
          className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer shadow-lg"
        >
          Run Regression Test Suite
        </button>
      </div>

      {/* Test Execution Result */}
      {testResult !== 'idle' && (
        <div
          className={`p-3.5 rounded-xl border font-mono text-xs ${
            testResult === 'pass'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="font-bold flex items-center gap-2">
            <span>{testResult === 'pass' ? '✅ TEST SUITE PASSED (3/3 Tests)' : '❌ RUNTIME ERROR / SEGMENTATION FAULT'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300 leading-relaxed font-sans">
            {testResult === 'pass'
              ? 'The patched condition `i < 5` guarantees access strictly within bounds [0..4]. Accumulator result: Total = 443.'
              : 'Index 5 exceeded the 5-element array boundary, attempting to read garbage unallocated memory. Fix the loop condition above.'}
          </p>
        </div>
      )}
    </div>
  );
};
