import React, { useState } from 'react';
import type { IMakerspaceSimulationMetadata } from '../types';
import { Award, CheckCircle, FileText, Wrench, Shield, Compass, Sparkles, Download, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  meta: IMakerspaceSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isDark: boolean;
}

export const PrototypeChallengeView: React.FC<Props> = ({ meta, params, onParamChange, isDark }) => {
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<number>(params.activeWorkflowStage ?? 1);
  const selectedChallenge = params.selectedChallenge ?? 'earthquake-warning';

  const CHALLENGES = [
    {
      id: 'earthquake-warning',
      title: 'Smart Earthquake Early Warning & Structural Health Node',
      domain: 'Civil Structures & IoT Telemetry',
      context: 'Multi-axis seismic accelerometer nodes mounted on high-rise building shear walls with real-time audible evacuation warning and cloud telemetry.',
      components: ['MEMS 3-Axis Accelerometer (ADXL345)', 'ESP32 Wi-Fi/BLE Node', 'High-Decibel Piezo Siren', 'LiFePO4 Solar Battery', 'Weatherproof IP65 Housing'],
    },
    {
      id: 'rainwater-purification',
      title: 'Automated Rainwater Harvesting & Solar UV Purification Unit',
      domain: 'Environmental Hydraulics & Green Energy',
      context: 'Automated civil rainwater first-flush diverter with turbidity sensing, dual-stage micro-filtration, and solar-powered UV sterilization.',
      components: ['Turbidity Optical Sensor', 'Motorized First-Flush Ball Valve', '254nm UV Sterilizer Lamp', '12V Solar Panel & MPPT Charger', 'Rotomolded Sediment Tank'],
    },
    {
      id: 'concrete-curing-telemetry',
      title: 'IoT Smart Concrete Curing Telemetry Probe',
      domain: 'Construction Materials & Thermal Maturity',
      context: 'Sacrificial embedded maturity sensors measuring internal concrete core temperature and moisture to predict compressive strength before formwork stripping.',
      components: ['Thermocouple Core Temperature Probe', 'Capacitive Moisture Sensor', 'Low-Power LoRaWAN Radio Node', 'Coin-Cell Lithium Battery', 'Sacrificial Biodegradable Conduit'],
    },
    {
      id: 'confined-space-rover',
      title: 'Autonomous Site Inspection Rover for Stormwater Culverts',
      domain: 'Geotechnical & Robotic Robotics',
      context: 'Tracked mobile rover equipped with gas hazard sensors (H₂S, CO, CH₄) and night-vision optical inspection camera for confined subterranean culverts.',
      components: ['Tracked Robot Chassis & DC Motors', 'MQ-4 / MQ-136 Multi-Gas Sensor', 'Infrared Low-Light Camera', 'High-Torque Motor Driver', 'Long-Range RF Remote Link'],
    },
  ];

  const currentChallenge = CHALLENGES.find((c) => c.id === selectedChallenge) || CHALLENGES[0]!;

  const rubricScores = params.rubricScores ?? {
    problemUnderstanding: 18,
    technicalReasoning: 19,
    prototypeIntegration: 23,
    safetySustainability: 14,
    testingReflection: 18,
  };

  const totalScore =
    rubricScores.problemUnderstanding +
    rubricScores.technicalReasoning +
    rubricScores.prototypeIntegration +
    rubricScores.safetySustainability +
    rubricScores.testingReflection;

  const updateScore = (key: string, val: number) => {
    const updated = { ...rubricScores, [key]: val };
    onParamChange('rubricScores', updated);
  };

  const handleExportReport = () => {
    const reportText = `# PiyushDhara Makerspace (U25RGE01) — Prototype Challenge Report
Course: B.E. Civil Engineering | Semester I | R2025 Revised CBCS
Challenge: ${currentChallenge.title}
Domain: ${currentChallenge.domain}
Team: Team Innovators (Civil & Interdisciplinary)

## 1. Problem Statement & Context
${currentChallenge.context}

## 2. Integrated Bill of Materials (BOM)
${currentChallenge.components.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 3. Safety & Environmental Lifecycle
- Recyclable materials utilized (PETG / Steel); non-toxic battery chemistry.
- Fail-safe electrical protection with isolated enclosures.

## 4. Assessment Rubric Evaluation (Course Outcome CO5 - Create)
- Problem Understanding: ${rubricScores.problemUnderstanding} / 20
- Technical Reasoning: ${rubricScores.technicalReasoning} / 20
- Prototype Integration: ${rubricScores.prototypeIntegration} / 25
- Safety & Sustainability: ${rubricScores.safetySustainability} / 15
- Testing & Reflection: ${rubricScores.testingReflection} / 20
**Total Score: ${totalScore} / 100**
`;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Makerspace_Prototype_${selectedChallenge}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      {/* 6-Stage Progress Tabs */}
      <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs overflow-x-auto ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        {[
          { step: 1, label: '1. Problem' },
          { step: 2, label: '2. Architecture' },
          { step: 3, label: '3. Virtual BOM' },
          { step: 4, label: '4. Safety & Eco' },
          { step: 5, label: '5. Testing Log' },
          { step: 6, label: '6. Innovation Rubric' },
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => setActiveWorkflowStage(s.step)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeWorkflowStage === s.step
                ? 'bg-indigo-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Challenge Selector & Information */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
              Approved Interdisciplinary Challenge Statements
            </span>
            <div className="space-y-2 text-xs">
              {CHALLENGES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onParamChange('selectedChallenge', c.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedChallenge === c.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                      : isDark
                      ? 'border-slate-800 hover:bg-slate-800/50 text-slate-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{c.title}</div>
                  <div className="text-[10px] text-slate-500">{c.domain}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className={`p-4 rounded-xl border text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-400 uppercase text-[10px]">Course Outcome CO5 (Create)</span>
              <span className="text-base font-bold text-emerald-400">{totalScore} / 100 Pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${totalScore}%` }} />
            </div>
            <button
              onClick={handleExportReport}
              className="w-full mt-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Export Prototype Portfolio (.md)
            </button>
          </div>
        </div>

        {/* Right Column: Workflow Stage Content */}
        <div className={`lg:col-span-7 rounded-xl border flex flex-col p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {/* Stage 1: Problem Definition */}
          {activeWorkflowStage === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-bold text-xs">Stage 1</span>
                <h4 className="font-bold text-sm">Problem Statement & Target Users</h4>
              </div>
              <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-bold text-indigo-400 mb-1">{currentChallenge.title}</div>
                <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{currentChallenge.context}</p>
              </div>
              <div className="space-y-2 text-xs">
                <label className="font-bold block text-slate-400 uppercase text-[10px]">Identified Stakeholders & Users:</label>
                <div className={`p-2.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                  Civil building facility engineers, municipal disaster management authorities, emergency response teams, and occupants.
                </div>
                <label className="font-bold block text-slate-400 uppercase text-[10px] pt-1">Key Operational Constraints:</label>
                <div className={`p-2.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                  • Battery autonomous backup &gt; 72 hours under grid blackout<br />
                  • Real-time trigger response &lt; 500 ms upon seismic S-wave threshold<br />
                  • Total BOM production cost &lt; ₹4,500 per node
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: System Architecture */}
          {activeWorkflowStage === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-bold text-xs">Stage 2</span>
                <h4 className="font-bold text-sm">Interdisciplinary System Architecture</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
                  <span className="font-bold text-blue-400 block text-[10px] uppercase">Mechanical</span>
                  <span className="text-[11px]">3D Printed Weatherproof Polycarbonate Mount</span>
                </div>
                <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10">
                  <span className="font-bold text-indigo-400 block text-[10px] uppercase">Sensory</span>
                  <span className="text-[11px]">High-G MEMS Accelerometer</span>
                </div>
                <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
                  <span className="font-bold text-purple-400 block text-[10px] uppercase">Embedded</span>
                  <span className="text-[11px]">Dual-Core 240MHz ESP32 Processing</span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                  <span className="font-bold text-emerald-400 block text-[10px] uppercase">Output</span>
                  <span className="text-[11px]">105dB Local Siren + MQTT Cloud Alarm</span>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Virtual BOM */}
          {activeWorkflowStage === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-bold text-xs">Stage 3</span>
                <h4 className="font-bold text-sm">Virtual Bill of Materials (BOM)</h4>
              </div>
              <div className="space-y-2 text-xs">
                {currentChallenge.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-center justify-between ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold">{comp}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Qty: 1</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 4: Safety & Eco */}
          {activeWorkflowStage === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-bold text-xs">Stage 4</span>
                <h4 className="font-bold text-sm">Safety, Environment & Sustainability</h4>
              </div>
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                  <span className="font-bold text-emerald-400 block mb-1">🌿 Circular Economy & Material Selection</span>
                  <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Enclosure manufactured using recyclable PETG thermoplastic filament with low thermal print emissions. Non-toxic LiFePO4 battery chemistry avoids cobalt environmental contamination and provides &gt; 3000 recharge cycles.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                  <span className="font-bold text-red-400 block mb-1">⚡ Electrical & Mechanical Fail-Safe</span>
                  <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Opto-isolated relay interfaces prevent high-voltage feedback to the microcontroller board. Watchdog timer automatically resets the embedded firmware in case of memory freeze.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stage 5: Testing Log */}
          {activeWorkflowStage === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-bold text-xs">Stage 5</span>
                <h4 className="font-bold text-sm">Simulated Testing & Experimental Log</h4>
              </div>
              <div className={`p-3.5 rounded-lg border font-mono text-xs space-y-2 ${isDark ? 'bg-black text-emerald-400' : 'bg-slate-100 text-slate-800'}`}>
                <div>[TEST 01] Baseline Ambient Noise: 0.02g • False Positive: 0</div>
                <div>[TEST 02] Seismic P-Wave Simulated Shock: 0.28g • Latency: 118 ms</div>
                <div>[TEST 03] Siren Sound Pressure Level: 104.2 dB at 1.0 m (Pass)</div>
                <div>[TEST 04] Battery Draw: Sleep Mode 14 mA • Alert Active 340 mA</div>
                <div className="text-indigo-400 font-bold">ALL 4 ACCEPTANCE CRITERIA VERIFIED — PROTOTYPE FUNCTIONAL</div>
              </div>
            </div>
          )}

          {/* Stage 6: Innovation Rubric */}
          {activeWorkflowStage === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-bold text-xs">Stage 6</span>
                  <h4 className="font-bold text-sm">Official Innovation Rubric (CO5 Assessment)</h4>
                </div>
                <span className="text-xs font-bold text-emerald-400">{totalScore} / 100 Points</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { key: 'problemUnderstanding', label: '1. Problem Understanding & User Constraints', max: 20 },
                  { key: 'technicalReasoning', label: '2. Multi-Disciplinary Engineering Reasoning', max: 20 },
                  { key: 'prototypeIntegration', label: '3. Prototype Functionality & Sensor Integration', max: 25 },
                  { key: 'safetySustainability', label: '4. Safety & Environmental Lifecycle Impact', max: 15 },
                  { key: 'testingReflection', label: '5. Testing Rigour & Engineering Reflection', max: 20 },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{item.label}</span>
                      <span className="font-bold text-indigo-400">{rubricScores[item.key as keyof typeof rubricScores]} / {item.max}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.round(item.max * 0.4)}
                      max={item.max}
                      value={rubricScores[item.key as keyof typeof rubricScores]}
                      onChange={(e) => updateScore(item.key, Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Stage Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 mt-auto text-xs font-bold">
            <button
              onClick={() => setActiveWorkflowStage((prev) => Math.max(1, prev - 1))}
              disabled={activeWorkflowStage === 1}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 ${
                activeWorkflowStage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous Stage
            </button>
            <button
              onClick={() => setActiveWorkflowStage((prev) => Math.min(6, prev + 1))}
              disabled={activeWorkflowStage === 6}
              className={`px-3 py-1.5 rounded-lg border bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 ${
                activeWorkflowStage === 6 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              Next Stage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
