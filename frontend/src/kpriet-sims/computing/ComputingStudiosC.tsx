import React, { useState } from 'react';

interface StudioProps {
  params: Record<string, any>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 9: MEMORY HIERARCHY — DATA RETRIEVAL LAB
// ─────────────────────────────────────────────────────────────────────────────
export const MemoryHierarchyStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const l1HitRate = Math.max(70, Math.min(99, params.l1HitRate ?? 95));
  const l2HitRate = Math.max(50, Math.min(95, params.l2HitRate ?? 80));

  // AMAT = T_L1 + (1 - H1) * (T_L2 + (1 - H2) * T_RAM)
  const tL1 = 1.0;
  const tL2 = 4.0;
  const tRAM = 65.0;
  const h1 = l1HitRate / 100;
  const h2 = l2HitRate / 100;
  const amat = tL1 + (1 - h1) * (tL2 + (1 - h2) * tRAM);

  const tiers = [
    { name: 'CPU Registers', capacity: '< 1 KB', latency: '< 0.5 ns', cost: 'Highest ($$$$)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { name: 'L1/L2 Cache', capacity: '512 KB – 2 MB', latency: '1 – 4 ns', cost: 'High ($$$)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { name: 'L3 Shared Cache', capacity: '16 – 64 MB', latency: '10 – 15 ns', cost: 'Moderate ($$)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { name: 'Main Memory (DDR5 RAM)', capacity: '16 – 64 GB', latency: '50 – 80 ns', cost: 'Affordable ($)', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    { name: 'NVMe Solid-State Storage', capacity: '1 – 4 TB', latency: '20 – 50 µs', cost: 'Low per GB (¢)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  ];

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🔺</span> Memory Hierarchy &amp; AMAT Retrieval Lab
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          AMAT: {amat.toFixed(2)} ns
        </span>
      </div>

      {/* AMAT Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300">
            <span>L1 Cache Hit Rate:</span>
            <span className="font-mono font-bold text-indigo-400">{l1HitRate}%</span>
          </div>
          <input
            type="range"
            min={70}
            max={99}
            value={l1HitRate}
            onChange={(e) => setParams((p) => ({ ...p, l1HitRate: parseInt(e.target.value, 10) }))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300">
            <span>L2 Cache Hit Rate:</span>
            <span className="font-mono font-bold text-indigo-400">{l2HitRate}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            value={l2HitRate}
            onChange={(e) => setParams((p) => ({ ...p, l2HitRate: parseInt(e.target.value, 10) }))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Memory Pyramid Tiers Stack */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Storage Pyramid: Speed vs Capacity Trade-Off
        </span>
        <div className="space-y-1.5">
          {tiers.map((t, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${t.color}`}>
              <div className="font-bold flex items-center gap-2">
                <span className="text-xs">{5 - idx}.</span>
                <span>{t.name}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>Cap: <strong>{t.capacity}</strong></span>
                <span>Latency: <strong>{t.latency}</strong></span>
                <span className="hidden sm:inline">Cost: {t.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula & Effective Penalty Note */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
        <div className="text-[11px] font-bold text-indigo-300">Average Memory Access Time Equation:</div>
        <p className="text-slate-300">
          AMAT = T_L1 + (1 − H₁) × [T_L2 + (1 − H₂) × T_RAM] = 1.0 + {(1 - h1).toFixed(2)} × [4.0 + {(1 - h2).toFixed(2)} × 65.0] = <strong className="text-emerald-400">{amat.toFixed(2)} ns</strong>
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 10: CACHE HIT, MISS AND LOCALITY CHALLENGE
// ─────────────────────────────────────────────────────────────────────────────
export const CacheLocalityStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const pattern = params.pattern || 'row_major';

  // 4x4 matrix traversal: row-major accesses elements contiguous in memory, col-major jumps by stride 4
  const totalAccesses = 16;
  const isRow = pattern === 'row_major';
  const hits = isRow ? 12 : 2;
  const misses = isRow ? 4 : 14;
  const hitRate = ((hits / totalAccesses) * 100).toFixed(1);

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🎯</span> Cache Hit, Miss &amp; Locality Challenge
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, pattern: 'row_major' }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isRow ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            Row-Major Traversal
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, pattern: 'col_major' }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
              !isRow ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            Column-Major Traversal
          </button>
        </div>
      </div>

      {/* Address Decoder Visualizer */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
        <span className="text-[11px] font-bold uppercase text-slate-400">16-Bit Memory Address Breakdown:</span>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">
            <div className="text-[10px] text-slate-400">Tag Bits (9-15)</div>
            <div className="font-bold">0101101</div>
          </div>
          <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-300">
            <div className="text-[10px] text-slate-400">Set Index (5-8)</div>
            <div className="font-bold">0011</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
            <div className="text-[10px] text-slate-400">Block Offset (0-4)</div>
            <div className="font-bold">10000</div>
          </div>
        </div>
      </div>

      {/* 4x4 Matrix Access Simulation */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">4×4 Matrix Memory Access Sequence:</span>
          <span className="font-mono text-indigo-400 font-bold">{isRow ? 'High Spatial Locality' : 'Cache Thrashing'}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
          {Array.from({ length: 16 }).map((_, i) => {
            const r = Math.floor(i / 4);
            const c = i % 4;
            const isHit = isRow ? c !== 0 : false;
            return (
              <div
                key={i}
                className={`p-2.5 rounded-xl border ${
                  isHit
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                <div>[{r}][{c}]</div>
                <div className="text-[10px] font-bold mt-0.5">{isHit ? 'HIT' : 'COLD MISS'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Hit Rate</span>
          <div className="text-base font-black text-emerald-400 mt-1">{hitRate}%</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Cache Hits</span>
          <div className="text-base font-black text-sky-400 mt-1">{hits} / 16</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Cache Misses</span>
          <div className="text-base font-black text-rose-400 mt-1">{misses} Misses</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 11: STORAGE DEVICE AND FILE-SYSTEM EXPLORER
// ─────────────────────────────────────────────────────────────────────────────
export const StorageFilesystemStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const device = params.device || 'ssd';
  const isSsd = device === 'ssd';

  const [files] = useState([
    { name: 'kernel.bin', inode: 101, blocks: [12, 13, 14], size: '12 KB' },
    { name: 'document.txt', inode: 102, blocks: [25], size: '4 KB' },
    { name: 'photo.raw', inode: 103, blocks: [31, 32, 33, 34], size: '16 KB' },
  ]);

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>💾</span> Storage Device &amp; File-System Explorer
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, device: 'ssd' }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isSsd ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            NVMe SSD (Flash)
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, device: 'hdd' }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
              !isSsd ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            Mechanical HDD
          </button>
        </div>
      </div>

      {/* Latency Comparison */}
      <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Mechanical Seek Time</span>
          <div className="text-base font-black text-amber-400">{isSsd ? '0.00 ms (Solid-State)' : '8.50 ms (Actuator Head)'}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Random 4K IOPS</span>
          <div className="text-base font-black text-emerald-400">{isSsd ? '1,000,000 IOPS' : '150 IOPS'}</div>
        </div>
      </div>

      {/* File System Inode Table Sandbox */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="font-bold text-slate-200 uppercase text-[11px]">Unix Inode Allocation Table</span>
          <span className="text-indigo-400 text-[11px]">{files.length} Allocated Inodes</span>
        </div>
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
              <div>
                <strong className="text-sky-300">{f.name}</strong>
                <span className="text-slate-500 ml-2">Inode #{f.inode}</span>
              </div>
              <div className="text-emerald-400">
                Blocks: [{f.blocks.join(', ')}] ({f.size})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 12: LOGIC GATES AND TRUTH-TABLE PLAYGROUND
// ─────────────────────────────────────────────────────────────────────────────
export const LogicGatesStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const a = Boolean(params.inputA);
  const b = Boolean(params.inputB);
  const gate = params.activeGate || 'and';

  let out = false;
  switch (gate) {
    case 'and': out = a && b; break;
    case 'or': out = a || b; break;
    case 'not': out = !a; break;
    case 'nand': out = !(a && b); break;
    case 'nor': out = !(a || b); break;
    case 'xor': out = Boolean(Number(a) ^ Number(b)); break;
    case 'xnor': out = !Boolean(Number(a) ^ Number(b)); break;
  }

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>⚡</span> Logic Gates &amp; Truth Table Playground
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold">
          {gate} Gate
        </span>
      </div>

      {/* Gate Selectors */}
      <div className="flex flex-wrap gap-1.5">
        {['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setParams((p) => ({ ...p, activeGate: g }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition cursor-pointer border ${
              gate === g
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Interactive Wire Breadboard */}
      <div className="flex items-center justify-around p-4 rounded-xl bg-slate-950 border border-slate-800">
        <button
          type="button"
          onClick={() => setParams((p) => ({ ...p, inputA: !a }))}
          className={`px-5 py-3 rounded-xl font-mono text-base font-black transition cursor-pointer border ${
            a ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          Input A = {a ? '1' : '0'}
        </button>

        {gate !== 'not' && (
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, inputB: !b }))}
            className={`px-5 py-3 rounded-xl font-mono text-base font-black transition cursor-pointer border ${
              b ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            Input B = {b ? '1' : '0'}
          </button>
        )}

        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-black">➔</span>
          <div
            className={`px-6 py-3 rounded-xl font-mono text-base font-black border transition ${
              out ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-xl' : 'bg-slate-900 text-slate-600 border-slate-800'
            }`}
          >
            Output Y = {out ? '1 (HIGH)' : '0 (LOW)'}
          </div>
        </div>
      </div>

      {/* Truth Table */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Truth Table</span>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
          <div className="font-bold text-slate-400 border-b border-slate-800 pb-1">A</div>
          <div className="font-bold text-slate-400 border-b border-slate-800 pb-1">{gate === 'not' ? '—' : 'B'}</div>
          <div className="font-bold text-indigo-400 border-b border-slate-800 pb-1">Output Y</div>
          {([
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
          ] as const).map(([ia, ib]) => {
            if (gate === 'not' && ib === 1) return null;
            let rowOut = 0;
            switch (gate) {
              case 'and': rowOut = ia & ib; break;
              case 'or': rowOut = ia | ib; break;
              case 'not': rowOut = ia === 0 ? 1 : 0; break;
              case 'nand': rowOut = (ia & ib) ? 0 : 1; break;
              case 'nor': rowOut = (ia | ib) ? 0 : 1; break;
              case 'xor': rowOut = ia ^ ib; break;
              case 'xnor': rowOut = (ia ^ ib) ? 0 : 1; break;
            }
            const isCurrent = Number(a) === ia && (gate === 'not' || Number(b) === ib);

            return (
              <React.Fragment key={`${ia}-${ib}`}>
                <div className={`py-1 rounded ${isCurrent ? 'bg-indigo-900/40 text-indigo-200 font-bold' : 'text-slate-400'}`}>{ia}</div>
                <div className={`py-1 rounded ${isCurrent ? 'bg-indigo-900/40 text-indigo-200 font-bold' : 'text-slate-400'}`}>{gate === 'not' ? '—' : ib}</div>
                <div className={`py-1 rounded ${isCurrent ? 'bg-emerald-900/40 text-emerald-300 font-bold' : 'text-slate-300'}`}>{rowOut}</div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
