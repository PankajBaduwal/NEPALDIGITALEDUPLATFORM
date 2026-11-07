import React, { useState } from 'react';

interface StudioProps {
  params: Record<string, any>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 1: NUMBER SYSTEM CONVERTER STUDIO
// ─────────────────────────────────────────────────────────────────────────────
export const NumberConverterStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const val = typeof params.inputValue === 'number' ? params.inputValue : parseInt(params.inputValue || '42', 10) || 42;
  const clamped = Math.max(0, Math.min(255, val));
  const bin = clamped.toString(2).padStart(8, '0');
  const oct = clamped.toString(8);
  const hex = clamped.toString(16).toUpperCase().padStart(2, '0');

  // Compute successive division steps for decimal to binary
  const divisionSteps: { quotient: number; remainder: number }[] = [];
  let temp = clamped;
  if (temp === 0) {
    divisionSteps.push({ quotient: 0, remainder: 0 });
  } else {
    while (temp > 0) {
      divisionSteps.push({ quotient: Math.floor(temp / 2), remainder: temp % 2 });
      temp = Math.floor(temp / 2);
    }
  }

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🔢</span> Number System Converter Studio
        </h3>
        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Decimal: {clamped}
        </span>
      </div>

      {/* Decimal Input Controls */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-300 font-semibold">
          <span>Decimal Magnitude Slider (0 – 255):</span>
          <span className="font-mono font-bold text-indigo-400 text-sm">{clamped}</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          value={clamped}
          onChange={(e) => setParams((p) => ({ ...p, inputValue: parseInt(e.target.value, 10) }))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* 8-Bit Positional Place Value Bits Cards */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            8-Bit Binary Place Values (Click Bit to Toggle)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">MSB (Bit 7) ➔ LSB (Bit 0)</span>
        </div>
        <div className="grid grid-cols-8 gap-2 text-center">
          {[128, 64, 32, 16, 8, 4, 2, 1].map((weight, idx) => {
            const bit = bin[idx];
            const isActive = bit === '1';
            return (
              <button
                type="button"
                key={weight}
                onClick={() => {
                  const toggled = clamped ^ weight;
                  setParams((p) => ({ ...p, inputValue: toggled }));
                }}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center justify-center ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 font-bold">2^{7 - idx}</div>
                <div className="text-[9px] text-slate-500">({weight})</div>
                <div className="text-xl font-mono font-black mt-1">{bit}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Representation Cards across 4 Bases */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Binary (Base 2)</span>
          <div className="font-mono font-black text-emerald-400 text-base sm:text-lg tracking-widest">{bin}₂</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Octal (Base 8)</span>
          <div className="font-mono font-black text-amber-400 text-base sm:text-lg tracking-widest">{oct}₈</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Decimal (Base 10)</span>
          <div className="font-mono font-black text-sky-400 text-base sm:text-lg tracking-widest">{clamped}₁₀</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hex (Base 16)</span>
          <div className="font-mono font-black text-purple-400 text-base sm:text-lg tracking-widest">0x{hex}</div>
        </div>
      </div>

      {/* Successive Division & Positional Decomposition Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">Positional Expansion</span>
          <p className="text-slate-300 leading-relaxed">
            {clamped} = {bin.split('').map((b, i) => b === '1' ? `(1 × 2^${7 - i})` : null).filter(Boolean).join(' + ') || '0'}
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            Hex Nibbles: [{bin.slice(0, 4)}]₂ = 0x{hex[0]} | [{bin.slice(4)}]₂ = 0x{hex[1]}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">Repeated Division by 2</span>
          <div className="max-h-24 overflow-y-auto space-y-0.5 text-slate-400 text-[11px]">
            {divisionSteps.map((step, i) => (
              <div key={i} className="flex justify-between">
                <span>Step {i + 1}: Q = {step.quotient}</span>
                <span className="text-emerald-400 font-bold">Remainder = {step.remainder}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 2: BINARY ADDITION AND SUBTRACTION LAB
// ─────────────────────────────────────────────────────────────────────────────
export const BinaryArithmeticStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const a = Math.max(0, Math.min(127, params.a ?? 45));
  const b = Math.max(0, Math.min(127, params.b ?? 27));
  const isSub = params.mode === 'sub';

  const binA = a.toString(2).padStart(8, '0');
  const binB = b.toString(2).padStart(8, '0');

  // Two's complement of B: invert + 1
  const bTwosComp = ((~b + 1) & 0xff);
  const effectiveB = isSub ? bTwosComp : b;
  const binEffectiveB = effectiveB.toString(2).padStart(8, '0');

  const rawSum = a + effectiveB;
  const sum8 = rawSum & 0xff;
  const binSum = sum8.toString(2).padStart(8, '0');
  const carryOut = rawSum > 0xff;

  // Signed overflow detection: V = C_in(MSB) ^ C_out
  const aSigned = a > 63 ? a - 128 : a;
  const bSigned = isSub ? -(b > 63 ? b - 128 : b) : (b > 63 ? b - 128 : b);
  const expectedSigned = aSigned + bSigned;
  const actualSigned = sum8 > 127 ? sum8 - 256 : sum8;
  const overflow = actualSigned !== expectedSigned;

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>➕</span> Binary Addition &amp; Subtraction Lab
        </h3>
        <button
          type="button"
          onClick={() => setParams((p) => ({ ...p, mode: p.mode === 'sub' ? 'add' : 'sub' }))}
          className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
            isSub
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          Operation: {isSub ? 'Subtraction (A − B via Two\'s Comp)' : 'Addition (A + B)'}
        </button>
      </div>

      {/* Input Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Operand A: <strong className="text-indigo-400 font-mono">{a}</strong></span>
            <span className="font-mono text-emerald-400 text-xs">{binA}₂</span>
          </div>
          <input
            type="range"
            min={0}
            max={127}
            value={a}
            onChange={(e) => setParams((p) => ({ ...p, a: parseInt(e.target.value, 10) }))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Operand B: <strong className="text-indigo-400 font-mono">{b}</strong></span>
            <span className="font-mono text-emerald-400 text-xs">{binB}₂</span>
          </div>
          <input
            type="range"
            min={0}
            max={127}
            value={b}
            onChange={(e) => setParams((p) => ({ ...p, b: parseInt(e.target.value, 10) }))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Full Adder Column-by-Column Visualization */}
      <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs space-y-2 border border-slate-800">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          8-Bit Full Adder Column Stack
        </div>
        <div className="flex justify-between text-slate-400 text-sm">
          <span>Operand A:</span>
          <span className="tracking-widest font-black text-slate-200">{binA} ({a})</span>
        </div>
        <div className="flex justify-between text-slate-400 text-sm">
          <span>{isSub ? 'Two\'s Comp (~B + 1):' : 'Operand B:'}</span>
          <span className="tracking-widest font-black text-slate-200">
            {binEffectiveB} ({isSub ? `-${b}` : b})
          </span>
        </div>
        <div className="border-t-2 border-slate-700 pt-2 flex justify-between font-bold text-base text-emerald-400">
          <span>Result Sum (8-bit):</span>
          <span className="tracking-widest font-black">{binSum} ({isSub ? a - b : a + b})</span>
        </div>
      </div>

      {/* Hardware Flags */}
      <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
        <div className={`p-3 rounded-xl border ${carryOut ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          <div className="font-bold">Carry Out (C)</div>
          <div className="text-lg font-black mt-0.5">{carryOut ? '1 (Active)' : '0'}</div>
        </div>
        <div className={`p-3 rounded-xl border ${overflow ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          <div className="font-bold">Signed Overflow (V)</div>
          <div className="text-lg font-black mt-0.5">{overflow ? '1 (Overflow)' : '0'}</div>
        </div>
        <div className={`p-3 rounded-xl border ${sum8 === 0 ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          <div className="font-bold">Zero Flag (Z)</div>
          <div className="text-lg font-black mt-0.5">{sum8 === 0 ? '1 (Zero)' : '0'}</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 3: BITS, BYTES AND DATA SIZE WORKSHOP
// ─────────────────────────────────────────────────────────────────────────────
export const DataSizeStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const mediaType = params.mediaType || 'image';
  const res = params.resolution || '1080p';
  const bpp = parseInt(params.bpp || '24', 10);
  const sampleRate = parseInt(params.sampleRate || '44100', 10);
  const durationSec = parseInt(params.durationSec || '60', 10);
  const driveGb = parseInt(params.driveGb || '500', 10);

  // Image calculations
  const pixels = res === '4k' ? 3840 * 2160 : res === '1080p' ? 1920 * 1080 : 1280 * 720;
  const imageBytes = (pixels * bpp) / 8;

  // Audio calculations (Stereo 16-bit)
  const audioBytes = sampleRate * 2 * 2 * durationSec;

  // Storage drive SI vs IEC divergence
  const advertisedBytes = driveGb * 1e9;
  const usableGib = advertisedBytes / (1024 * 1024 * 1024);
  const divergencePct = ((1 - usableGib / driveGb) * 100).toFixed(2);

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>📦</span> Bits, Bytes &amp; Data Size Workshop
        </h3>
        <div className="flex gap-1.5">
          {['image', 'audio', 'storage'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setParams((p) => ({ ...p, mediaType: t }))}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                mediaType === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {mediaType === 'image' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Resolution:</label>
              <select
                value={res}
                onChange={(e) => setParams((p) => ({ ...p, resolution: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="720p">720p HD (1280 × 720)</option>
                <option value="1080p">1080p Full HD (1920 × 1080)</option>
                <option value="4k">4K UHD (3840 × 2160)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Color Bit Depth:</label>
              <select
                value={bpp}
                onChange={(e) => setParams((p) => ({ ...p, bpp: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="8">8-bit Greyscale (1 Byte/px)</option>
                <option value="24">24-bit TrueColor RGB (3 Bytes/px)</option>
                <option value="32">32-bit RGBA (4 Bytes/px)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Total Pixels</span>
              <div className="text-base font-black text-indigo-400 mt-1">{(pixels / 1e6).toFixed(2)} MP</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Binary IEC Size</span>
              <div className="text-base font-black text-emerald-400 mt-1">{(imageBytes / (1024 * 1024)).toFixed(2)} MiB</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Decimal SI Size</span>
              <div className="text-base font-black text-amber-400 mt-1">{(imageBytes / 1e6).toFixed(2)} MB</div>
            </div>
          </div>
        </div>
      )}

      {mediaType === 'audio' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Sampling Frequency (fs):</label>
              <select
                value={sampleRate}
                onChange={(e) => setParams((p) => ({ ...p, sampleRate: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="8000">8 kHz (Telephone Audio)</option>
                <option value="22050">22.05 kHz (AM Broadcast)</option>
                <option value="44100">44.1 kHz (CD Audio Standard)</option>
                <option value="96000">96 kHz (Hi-Res Studio Master)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Duration (Seconds): {durationSec}s</label>
              <input
                type="range"
                min={10}
                max={300}
                step={10}
                value={durationSec}
                onChange={(e) => setParams((p) => ({ ...p, durationSec: parseInt(e.target.value, 10) }))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Bitrate (Stereo 16-bit)</span>
              <div className="text-base font-black text-indigo-400 mt-1">{((sampleRate * 2 * 16) / 1000).toFixed(0)} kbps</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Raw Uncompressed File</span>
              <div className="text-base font-black text-emerald-400 mt-1">{(audioBytes / (1024 * 1024)).toFixed(2)} MiB</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Nyquist Limit</span>
              <div className="text-base font-black text-amber-400 mt-1">{sampleRate / 2000} kHz</div>
            </div>
          </div>
        </div>
      )}

      {mediaType === 'storage' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Advertised Storage Drive Capacity:</span>
              <span className="font-mono font-bold text-indigo-400">{driveGb} GB</span>
            </div>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={driveGb}
              onChange={(e) => setParams((p) => ({ ...p, driveGb: parseInt(e.target.value, 10) }))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Manufacturer SI (Base 10)</span>
              <div className="text-base font-black text-sky-400 mt-1">{driveGb} GB (10⁹ bytes)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Operating System IEC (Base 2)</span>
              <div className="text-base font-black text-emerald-400 mt-1">{usableGib.toFixed(1)} GiB (2³⁰ bytes)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Apparent Discrepancy</span>
              <div className="text-base font-black text-rose-400 mt-1">−{divergencePct}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION 4: MULTIMEDIA ENCODING EXPLORER
// ─────────────────────────────────────────────────────────────────────────────
export const MultimediaEncodingStudio: React.FC<StudioProps> = ({ params, setParams }) => {
  const encMode = params.encMode || 'text';
  const char = params.char || 'A';
  const [gridColor, setGridColor] = useState<string>('#38bdf8');
  const [grid, setGrid] = useState<string[][]>(Array(4).fill(null).map(() => Array(4).fill('#0f172a')));

  // Text UTF-8 encoding calculation
  const codePoint = char.codePointAt(0) || 65;
  const encoder = new TextEncoder();
  const utf8Bytes = Array.from(encoder.encode(char));
  const hexBytes = utf8Bytes.map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  const binBytes = utf8Bytes.map((b) => b.toString(2).padStart(8, '0')).join(' ');

  return (
    <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>🎨</span> Text, Image &amp; Sound Encoding Explorer
        </h3>
        <div className="flex gap-1.5">
          {['text', 'image'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setParams((p) => ({ ...p, encMode: m }))}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                encMode === m
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {encMode === 'text' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Select or Enter Character:</span>
            <div className="flex gap-2">
              {['A', '9', '€', 'Ω', '⚡', '文'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, char: c }))}
                  className={`size-10 rounded-xl font-bold text-base transition cursor-pointer border ${
                    char === c
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs space-y-3 border border-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Unicode Code Point:</span>
              <span className="text-indigo-400 font-bold text-sm">U+{codePoint.toString(16).toUpperCase().padStart(4, '0')}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">UTF-8 Byte Stream:</span>
              <span className="text-amber-400 font-bold">{hexBytes} ({utf8Bytes.length} Byte{utf8Bytes.length > 1 ? 's' : ''})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Binary Bitstream:</span>
              <span className="text-emerald-400 font-bold tracking-wider">{binBytes}</span>
            </div>
          </div>
        </div>
      )}

      {encMode === 'image' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">4×4 Pixel Raster Matrix (Click to Paint):</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Palette:</span>
              {['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#0f172a'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setGridColor(c)}
                  style={{ backgroundColor: c }}
                  className={`size-6 rounded-full border transition cursor-pointer ${gridColor === c ? 'ring-2 ring-white scale-110' : 'border-slate-700'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => {
                      const next = grid.map((ro) => [...ro]);
                      const targetRow = next[r];
                      if (targetRow) targetRow[c] = gridColor;
                      setGrid(next);
                    }}
                    style={{ backgroundColor: cell }}
                    className="size-12 rounded-lg border border-slate-800 transition hover:scale-105 cursor-pointer shadow-inner"
                  />
                ))
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 text-center">
            Active Palette Color: 24-bit TrueColor RGB {gridColor}
          </div>
        </div>
      )}
    </div>
  );
};
