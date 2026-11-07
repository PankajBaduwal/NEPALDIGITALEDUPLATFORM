import React, { useState } from 'react';
import type { IMakerspaceSimulationMetadata } from '../types';
import { Cpu, Activity, Wifi, Radio, Sliders, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  meta: IMakerspaceSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isDark: boolean;
}

export const ElectronicsModuleView: React.FC<Props> = ({ meta, params, onParamChange, isDark }) => {
  const simId = meta.id;

  // ─────────────────────────────────────────────────────────────
  // 1. ELECTRONIC COMPONENTS & MEASUREMENT BENCH
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim14-electronics-measurement') {
    const activeInstrument = params.activeInstrument ?? 'dmm';
    const resistorBand1 = params.resistorBand1 ?? 'Brown';
    const resistorBand2 = params.resistorBand2 ?? 'Black';
    const resistorBand3 = params.resistorBand3 ?? 'Red';
    const resistorBand4 = params.resistorBand4 ?? 'Gold';
    const dmmMode = params.dmmMode ?? 'volts-dc';
    const oscilloscopeVoltsPerDiv = params.oscilloscopeVoltsPerDiv ?? 1.0;
    const oscilloscopeTimePerDivMs = params.oscilloscopeTimePerDivMs ?? 0.5;

    // Resistor color code values
    const COLOR_DIGITS: Record<string, number> = {
      Black: 0, Brown: 1, Red: 2, Orange: 3, Yellow: 4,
      Green: 5, Blue: 6, Violet: 7, Gray: 8, White: 9,
    };
    const COLOR_HEX: Record<string, string> = {
      Black: '#0f172a', Brown: '#92400e', Red: '#ef4444', Orange: '#f97316', Yellow: '#eab308',
      Green: '#22c55e', Blue: '#3b82f6', Violet: '#a855f7', Gray: '#64748b', White: '#f8fafc',
      Gold: '#d97706', Silver: '#94a3b8',
    };

    const d1 = COLOR_DIGITS[resistorBand1] ?? 1;
    const d2 = COLOR_DIGITS[resistorBand2] ?? 0;
    const mult = Math.pow(10, COLOR_DIGITS[resistorBand3] ?? 2);
    const nominalResistanceOhms = (d1 * 10 + d2) * mult;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Instrument Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => onParamChange('activeInstrument', 'dmm')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
              activeInstrument === 'dmm'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Digital Multimeter (DMM) & Color Code
          </button>
          <button
            onClick={() => onParamChange('activeInstrument', 'oscilloscope')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
              activeInstrument === 'oscilloscope'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Dual-Trace Digital Oscilloscope
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {activeInstrument === 'dmm' ? (
              <>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                    4-Band Resistor Color Code Selector
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Band 1 (1st Digit):</span>
                      <select
                        value={resistorBand1}
                        onChange={(e) => onParamChange('resistorBand1', e.target.value)}
                        className={`w-full text-xs px-2 py-1.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                      >
                        {Object.keys(COLOR_DIGITS).map((c) => (
                          <option key={c} value={c}>{c} ({COLOR_DIGITS[c]})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Band 2 (2nd Digit):</span>
                      <select
                        value={resistorBand2}
                        onChange={(e) => onParamChange('resistorBand2', e.target.value)}
                        className={`w-full text-xs px-2 py-1.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                      >
                        {Object.keys(COLOR_DIGITS).map((c) => (
                          <option key={c} value={c}>{c} ({COLOR_DIGITS[c]})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Band 3 (Multiplier):</span>
                      <select
                        value={resistorBand3}
                        onChange={(e) => onParamChange('resistorBand3', e.target.value)}
                        className={`w-full text-xs px-2 py-1.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                      >
                        {Object.keys(COLOR_DIGITS).map((c) => (
                          <option key={c} value={c}>{c} (10^{COLOR_DIGITS[c]})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Band 4 (Tolerance):</span>
                      <select
                        value={resistorBand4}
                        onChange={(e) => onParamChange('resistorBand4', e.target.value)}
                        className={`w-full text-xs px-2 py-1.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                      >
                        <option value="Gold">Gold (±5%)</option>
                        <option value="Silver">Silver (±10%)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                    DMM Function Selector
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'volts-dc', label: 'DC Voltage (V⎓)' },
                      { id: 'volts-ac', label: 'AC Voltage (V~)' },
                      { id: 'resistance', label: 'Resistance (Ω)' },
                      { id: 'diode', label: 'Diode / Continuity' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => onParamChange('dmmMode', mode.id)}
                        className={`p-2 rounded-lg border text-left font-bold text-xs ${
                          dmmMode === mode.id
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : isDark
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                  Oscilloscope Channel Controls
                </span>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Volts / Division:</span>
                      <span className="font-bold text-indigo-500">{oscilloscopeVoltsPerDiv} V/div</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={5.0}
                      step={0.5}
                      value={oscilloscopeVoltsPerDiv}
                      onChange={(e) => onParamChange('oscilloscopeVoltsPerDiv', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Time / Division:</span>
                      <span className="font-bold text-indigo-500">{oscilloscopeTimePerDivMs} ms/div</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={2.0}
                      step={0.1}
                      value={oscilloscopeTimePerDivMs}
                      onChange={(e) => onParamChange('oscilloscopeTimePerDivMs', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-400 block font-bold uppercase">Signal Generator</span>
                    <span className="text-xs font-bold">1000 Hz Sine Wave | 5.0 Vpp Amplitude</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instrument Display Canvas */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {activeInstrument === 'dmm' ? 'Multimeter LCD Display & Resistor Graphic' : 'Dual-Trace Oscilloscope Reticle Screen'}
            </span>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              {activeInstrument === 'dmm' ? (
                <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                  {/* DMM Digital Display */}
                  <div className="w-full p-4 rounded-xl bg-emerald-950 border-2 border-emerald-800 flex flex-col items-center shadow-inner">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">
                      AUTO RANGE DMM • {dmmMode.toUpperCase()}
                    </span>
                    <span className="text-3xl font-mono font-bold text-emerald-300 tracking-wider my-1">
                      {dmmMode === 'resistance'
                        ? `${nominalResistanceOhms >= 1000 ? (nominalResistanceOhms / 1000).toFixed(2) + ' k' : nominalResistanceOhms} Ω`
                        : dmmMode === 'diode'
                        ? '0.684 V (Si)'
                        : dmmMode === 'volts-dc'
                        ? '5.002 V⎓'
                        : '230.4 V~'}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">
                      {dmmMode === 'resistance' ? `Tolerance: ±5%` : 'True RMS Calibrated'}
                    </span>
                  </div>

                  {/* Resistor Graphic */}
                  <svg viewBox="0 0 300 70" className="w-full max-h-[80px]">
                    {/* Metal leads */}
                    <line x1="20" y1="35" x2="80" y2="35" stroke="#94a3b8" strokeWidth="3" />
                    <line x1="220" y1="35" x2="280" y2="35" stroke="#94a3b8" strokeWidth="3" />
                    {/* Resistor body */}
                    <rect x="80" y="20" width="140" height="30" rx="8" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
                    {/* Bands */}
                    <rect x="100" y="20" width="12" height="30" fill={COLOR_HEX[resistorBand1]} />
                    <rect x="125" y="20" width="12" height="30" fill={COLOR_HEX[resistorBand2]} />
                    <rect x="150" y="20" width="12" height="30" fill={COLOR_HEX[resistorBand3]} />
                    <rect x="185" y="20" width="12" height="30" fill={COLOR_HEX[resistorBand4]} />
                  </svg>
                </div>
              ) : (
                <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                  {/* CRT Screen Frame */}
                  <rect x="20" y="10" width="420" height="200" fill="#022c22" stroke="#059669" strokeWidth="3" rx="8" />

                  {/* Reticle 10x8 Grid */}
                  {[62, 104, 146, 188, 230, 272, 314, 356, 398].map((x) => (
                    <line key={`x-${x}`} x1={x} y1="10" x2={x} y2="210" stroke="#065f46" strokeWidth="0.8" strokeDasharray="2 2" />
                  ))}
                  {[35, 60, 85, 110, 135, 160, 185].map((y) => (
                    <line key={`y-${y}`} x1="20" y1={y} x2="440" y2={y} stroke="#065f46" strokeWidth="0.8" strokeDasharray="2 2" />
                  ))}

                  {/* Center axes */}
                  <line x1="230" y1="10" x2="230" y2="210" stroke="#10b981" strokeWidth="1" />
                  <line x1="20" y1="110" x2="440" y2="110" stroke="#10b981" strokeWidth="1" />

                  {/* Sine Wave */}
                  <path
                    d={`M 20 110 Q ${20 + 25 / oscilloscopeTimePerDivMs} ${110 - 25 / oscilloscopeVoltsPerDiv} ${20 + 50 / oscilloscopeTimePerDivMs} 110 T ${20 + 100 / oscilloscopeTimePerDivMs} 110 T ${20 + 150 / oscilloscopeTimePerDivMs} 110 T ${20 + 200 / oscilloscopeTimePerDivMs} 110 T ${20 + 250 / oscilloscopeTimePerDivMs} 110 T ${20 + 300 / oscilloscopeTimePerDivMs} 110 T ${20 + 350 / oscilloscopeTimePerDivMs} 110 T ${20 + 400 / oscilloscopeTimePerDivMs} 110`}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                  />
                  <text x="35" y="30" fill="#6ee7b7" fontSize="10" fontFamily="monospace">
                    CH1: {oscilloscopeVoltsPerDiv}V/DIV • TIME: {oscilloscopeTimePerDivMs}ms/DIV • 1.00 kHz
                  </text>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ARDUINO SENSOR & ACTUATOR SIMULATOR
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim15-arduino-embedded') {
    const activeProject = params.activeProject ?? 'ultrasonic-distance';
    const targetDistanceCm = params.targetDistanceCm ?? 28;
    const ambientLightLux = params.ambientLightLux ?? 350;

    const isAlarmTriggered = targetDistanceCm < 20;
    const isNightLightOn = ambientLightLux < 200;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Project Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onParamChange('activeProject', 'ultrasonic-distance')}
            className={`p-2.5 rounded-xl border text-left font-bold text-xs uppercase tracking-wider transition-all ${
              activeProject === 'ultrasonic-distance'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            HC-SR04 Ultrasonic Distance Sensor + Alert Buzzer
          </button>
          <button
            onClick={() => onParamChange('activeProject', 'ldr-night-light')}
            className={`p-2.5 rounded-xl border text-left font-bold text-xs uppercase tracking-wider transition-all ${
              activeProject === 'ldr-night-light'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            LDR Analog Photoresistor + Automated LED
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Physical Sensor Input
              </span>
              {activeProject === 'ultrasonic-distance' ? (
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Obstacle Distance:</span>
                    <span className={`font-bold ${isAlarmTriggered ? 'text-red-500' : 'text-indigo-500'}`}>
                      {targetDistanceCm} cm {isAlarmTriggered && '(COLLISION PROXIMITY)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    value={targetDistanceCm}
                    onChange={(e) => onParamChange('targetDistanceCm', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>5 cm (Close)</span>
                    <span>Threshold: 20 cm</span>
                    <span>120 cm (Far)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Ambient Light Level:</span>
                    <span className={`font-bold ${isNightLightOn ? 'text-amber-500' : 'text-indigo-500'}`}>
                      {ambientLightLux} Lux {isNightLightOn && '(DARK — LED ON)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={800}
                    value={ambientLightLux}
                    onChange={(e) => onParamChange('ambientLightLux', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Serial Monitor Output */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Serial Monitor (9600 Baud)
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">STREAM ACTIVE</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black text-emerald-400 font-mono text-[11px] space-y-1">
                <div>[ARDUINO UNO R3] Boot complete.</div>
                {activeProject === 'ultrasonic-distance' ? (
                  <>
                    <div>Echo pulse: {targetDistanceCm * 58} µs</div>
                    <div>Distance: {targetDistanceCm} cm</div>
                    <div>Buzzer Pin 13: {isAlarmTriggered ? 'HIGH (ALARM)' : 'LOW (SAFE)'}</div>
                  </>
                ) : (
                  <>
                    <div>AnalogRead(A0): {Math.round((ambientLightLux / 800) * 1023)} counts</div>
                    <div>Voltage: {((ambientLightLux / 800) * 5.0).toFixed(2)} V</div>
                    <div>LED Pin 12: {isNightLightOn ? 'HIGH (NIGHT LIGHT)' : 'LOW (DAY)'}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Virtual Arduino Board Diagram */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Virtual Microcontroller Breadboard Wiring
            </span>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* Arduino Uno PCB */}
                <rect x="40" y="30" width="220" height="160" rx="6" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                <rect x="30" y="70" width="30" height="25" fill="#94a3b8" rx="2" />
                {/* Microcontroller IC */}
                <rect x="110" y="80" width="80" height="50" fill="#0f172a" rx="3" />
                <text x="150" y="108" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">ATmega328P</text>
                <text x="150" y="55" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">ARDUINO UNO</text>

                {/* Sensor Breadboard on right */}
                <rect x="290" y="30" width="140" height="160" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                {/* Breadboard pin holes */}
                {[50, 70, 90, 110, 130, 150, 170].map((y) => (
                  <circle key={`bp-${y}`} cx="330" cy={y} r="2.5" fill="#64748b" />
                ))}

                {activeProject === 'ultrasonic-distance' ? (
                  <g transform="translate(320, 60)">
                    {/* Ultrasonic Sensor Eyes */}
                    <rect x="0" y="0" width="80" height="40" fill="#0284c7" rx="3" />
                    <circle cx="20" cy="20" r="14" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                    <circle cx="60" cy="20" r="14" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                    <text x="40" y="55" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="bold">HC-SR04</text>

                    {/* Buzzer Output */}
                    <circle cx="40" cy="90" r="16" fill={isAlarmTriggered ? '#ef4444' : '#334155'} />
                    <text x="40" y="94" fill="#ffffff" fontSize="8" textAnchor="middle">BUZZER</text>
                  </g>
                ) : (
                  <g transform="translate(320, 60)">
                    {/* LDR */}
                    <circle cx="40" cy="25" r="12" fill="#ca8a04" stroke="#78350f" strokeWidth="1.5" />
                    <text x="40" y="50" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="bold">LDR Sensor</text>

                    {/* LED */}
                    <circle cx="40" cy="90" r="14" fill={isNightLightOn ? '#fef08a' : '#334155'} stroke="#eab308" strokeWidth="2" />
                    <text x="40" y="118" fill="#64748b" fontSize="8" textAnchor="middle">Night LED</text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. IOT CIRCUIT INTEGRATION DEMO
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim16-iot-integration') {
    const wifiConnected = params.wifiConnected ?? true;
    const sensorValueTempC = params.sensorValueTempC ?? 31.4;
    const alertThresholdTempC = params.alertThresholdTempC ?? 45.0;

    const isTempAlarm = sensorValueTempC > alertThresholdTempC;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Header */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">IoT Cloud Telemetry Flow</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              End-to-End Pipeline: Physical Probe → ESP32 Wi-Fi → MQTT Broker → Web Dashboard
            </span>
          </div>
          <button
            onClick={() => onParamChange('wifiConnected', !wifiConnected)}
            className={`px-3 py-1 rounded-lg border font-bold text-xs ${
              wifiConnected ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {wifiConnected ? 'Wi-Fi: Connected' : 'Wi-Fi: Disconnected'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Sensor Environment Telemetry
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Structural Probe Temperature:</span>
                    <span className={`font-bold ${isTempAlarm ? 'text-red-500' : 'text-indigo-500'}`}>
                      {sensorValueTempC} °C {isTempAlarm && '(ALARM THRESHOLD EXCEEDED)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={65}
                    step={0.5}
                    value={sensorValueTempC}
                    onChange={(e) => onParamChange('sensorValueTempC', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* MQTT JSON Payload Inspector */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-2">
                MQTT JSON Payload Inspector
              </span>
              <div className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-[11px] leading-relaxed">
                <div>Topic: kpriet/makerspace/sensor1</div>
                <div>{`{`}</div>
                <div className="pl-4">"nodeId": "ESP32_CIVIL_01",</div>
                <div className="pl-4">"tempC": {sensorValueTempC},</div>
                <div className="pl-4">"status": "{isTempAlarm ? 'ALARM' : 'NORMAL'}",</div>
                <div className="pl-4">"wifiRssi": -58</div>
                <div>{`}`}</div>
              </div>
            </div>
          </div>

          {/* Cloud Dashboard Live Chart */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cloud IoT Dashboard Live Telemetry
              </span>
              <span className={`text-xs font-bold ${isTempAlarm ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                {isTempAlarm ? 'CRITICAL TEMPERATURE ALERT' : 'Normal Telemetry Stream'}
              </span>
            </div>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* Cloud Dashboard Chart Card */}
                <rect x="20" y="20" width="420" height="180" fill={isDark ? '#090d16' : '#ffffff'} stroke="#334155" strokeWidth="1.5" rx="6" />

                {/* Grid */}
                <line x1="60" y1="160" x2="410" y2="160" stroke="#475569" strokeWidth="1" />
                <line x1="60" y1="40" x2="60" y2="160" stroke="#475569" strokeWidth="1" />

                {/* Alarm Threshold Line */}
                <line x1="60" y1="80" x2="410" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="405" y="75" fill="#ef4444" fontSize="9" textAnchor="end" fontWeight="bold">Threshold: 45°C</text>

                {/* Telemetry Line Chart */}
                <path
                  d={`M 70 140 Q 150 135 230 130 T 320 120 T 400 ${160 - (sensorValueTempC - 20) * 2.5}`}
                  fill="none"
                  stroke={isTempAlarm ? '#ef4444' : '#38bdf8'}
                  strokeWidth="3"
                />
                <circle cx="400" cy={160 - (sensorValueTempC - 20) * 2.5} r="6" fill={isTempAlarm ? '#ef4444' : '#38bdf8'} />
                <text x="400" y={150 - (sensorValueTempC - 20) * 2.5} fill={isTempAlarm ? '#ef4444' : '#38bdf8'} fontSize="10" textAnchor="middle" fontWeight="bold">
                  {sensorValueTempC}°C
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. PCB COMPONENT PLACEMENT EXPLORER
  // ─────────────────────────────────────────────────────────────
  const pin1Aligned = params.pin1Aligned ?? true;
  const bypassCapNearVcc = params.bypassCapNearVcc ?? true;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      {/* Header */}
      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">PCB Layout & Assembly</span>
          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            2-Layer FR-4 PCB: DIP-8 IC Placement, Decoupling Capacitor Proximity, and DRC
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
              Design Rule Check (DRC) Constraints
            </span>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span>IC1 Pin 1 Index Notch Aligned:</span>
                <input
                  type="checkbox"
                  checked={pin1Aligned}
                  onChange={(e) => onParamChange('pin1Aligned', e.target.checked)}
                  className="rounded text-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>0.1 µF Decoupling Cap Adjacent to VCC:</span>
                <input
                  type="checkbox"
                  checked={bypassCapNearVcc}
                  onChange={(e) => onParamChange('bypassCapNearVcc', e.target.checked)}
                  className="rounded text-indigo-600"
                />
              </label>
            </div>
          </div>

          {/* DRC Status */}
          <div className={`p-4 rounded-xl border text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-2">
              Automated Design Rule Verification
            </span>
            <div className={`p-3 rounded-lg border font-bold flex items-center gap-2 ${
              pin1Aligned && bypassCapNearVcc ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {pin1Aligned && bypassCapNearVcc ? (
                <>
                  <CheckCircle className="w-4 h-4" /> 0 DRC Errors — Ready for Solder Stencil
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" /> DRC Error: Component Orientation or High-Frequency Decoupling Violation
                </>
              )}
            </div>
          </div>
        </div>

        {/* PCB Board Visualizer */}
        <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            2-Layer FR-4 Green Solder Mask PCB Preview
          </span>

          <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
              {/* Green FR-4 Board */}
              <rect x="50" y="20" width="360" height="180" rx="8" fill="#14532d" stroke="#166534" strokeWidth="3" />

              {/* Gold Plated Through Holes (PTH) Corner Mounts */}
              <circle cx="70" cy="40" r="6" fill="#d97706" />
              <circle cx="70" cy="40" r="3.5" fill="#0f172a" />
              <circle cx="390" cy="40" r="6" fill="#d97706" />
              <circle cx="390" cy="40" r="3.5" fill="#0f172a" />

              {/* DIP-8 IC Footprint */}
              <rect x="180" y="60" width="100" height="80" rx="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
              {/* Index Notch */}
              <circle cx="180" cy="100" r={pin1Aligned ? 6 : 0} fill="#14532d" />
              <text x="230" y="105" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">IC1 (NE555)</text>

              {/* Pins (8 pads) */}
              {[70, 90, 110, 130].map((y) => (
                <rect key={`pl-${y}`} x="165" y={y - 4} width="12" height="8" rx="2" fill="#ca8a04" />
              ))}
              {[70, 90, 110, 130].map((y) => (
                <rect key={`pr-${y}`} x="283" y={y - 4} width="12" height="8" rx="2" fill="#ca8a04" />
              ))}

              {/* Decoupling Capacitor C1 */}
              <rect
                x={bypassCapNearVcc ? '290' : '360'}
                y="55"
                width="20"
                height="12"
                rx="2"
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth="1"
              />
              <text x={bypassCapNearVcc ? '300' : '370'} y="50" fill="#fde047" fontSize="8" textAnchor="middle">C1 (100nF)</text>

              {/* Copper Traces */}
              <line x1="295" y1="70" x2={bypassCapNearVcc ? '300' : '360'} y2="67" stroke="#eab308" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
