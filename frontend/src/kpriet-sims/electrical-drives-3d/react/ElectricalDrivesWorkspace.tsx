/**
 * Master React Workspace for Electrical Drives and Control Simulation Suite
 * Course Code: U25EE305 / ME3393 / EE8353
 * Department of Mechanical Engineering | Semester III | Regulation R2025
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type {
  ElectricalDrivesSimId,
  DCMotorType,
  StartingMethod,
  BrakingMethod,
  LoadTorqueProfile,
  ControlCircuitState,
  DrivesLabTrial,
} from '../core/types';
import { DRIVES_MOTOR_CATALOGUE, LOAD_PROFILES_DATABASE, STARTING_METHODS_SUMMARY } from '../core/DrivesMotorDatabase';
import { DrivesCalculator } from '../core/DrivesCalculator';
import { createDrivesScene, BaseDrivesSimulation } from '../simulations';

interface Props {
  simulationId?: string;
  onBack?: () => void;
}

export const ElectricalDrivesWorkspace: React.FC<Props> = ({
  simulationId = 'u25ee305-sim-01',
  onBack,
}) => {
  // Current active simulation tab
  const [activeSimId, setActiveSimId] = useState<ElectricalDrivesSimId>(() => {
    if (simulationId.startsWith('u25ee305-sim-')) {
      return simulationId as ElectricalDrivesSimId;
    }
    return 'u25ee305-sim-01';
  });

  // Selected motor model
  const [selectedMotorId, setSelectedMotorId] = useState<string>('dc-shunt-5hp');
  const activeMotor = useMemo(() => DRIVES_MOTOR_CATALOGUE[selectedMotorId] || DRIVES_MOTOR_CATALOGUE['dc-shunt-5hp']!, [selectedMotorId]);

  // Operational state parameters
  const [terminalVoltageV, setTerminalVoltageV] = useState<number>(220);
  const [fieldWeakeningRatio, setFieldWeakeningRatio] = useState<number>(1.0);
  const [externalArmatureResOhm, setExternalArmatureResOhm] = useState<number>(0);
  const [loadTorqueNm, setLoadTorqueNm] = useState<number>(15);
  const [selectedLoadProfile, setSelectedLoadProfile] = useState<LoadTorqueProfile>('constant');

  // AC Induction & VFD parameters
  const [lineVoltageV, setLineVoltageV] = useState<number>(415);
  const [frequencyHz, setFrequencyHz] = useState<number>(50);
  const [poleCount, setPoleCount] = useState<number>(4);
  const [rotorResistanceOhm, setRotorResistanceOhm] = useState<number>(0);
  const [vfdOutputFreqHz, setVfdOutputFreqHz] = useState<number>(50);

  // Starting & Braking parameters
  const [startingMethod, setStartingMethod] = useState<StartingMethod>('dol');
  const [brakingMethod, setBrakingMethod] = useState<BrakingMethod>('dynamic-rheostatic');
  const [brakingResistorOhm, setBrakingResistorOhm] = useState<number>(5.0);

  // Control Circuit state
  const [circuitState, setCircuitState] = useState<ControlCircuitState>('idle-stopped');
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Modals & Records
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isLogTableOpen, setIsLogTableOpen] = useState<boolean>(false);
  const [trials, setTrials] = useState<DrivesLabTrial[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // 3D Canvas Container Ref & Scene instance
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<BaseDrivesSimulation | null>(null);

  // 1. DC Motor State Calculation
  const dcState = useMemo(() => {
    return DrivesCalculator.calculateDCMotorState({
      motorType: (activeMotor.category === 'dc' ? activeMotor.id.split('-')[0] + '-' + activeMotor.id.split('-')[1] : 'dc-shunt') as DCMotorType,
      terminalVoltageV,
      loadTorqueNm,
      externalArmatureResistanceOhm: externalArmatureResOhm,
      fieldWeakeningRatio,
    });
  }, [activeMotor, terminalVoltageV, loadTorqueNm, externalArmatureResOhm, fieldWeakeningRatio]);

  // 2. Induction Motor State Calculation
  const acState = useMemo(() => {
    return DrivesCalculator.calculateInductionMotorState({
      lineVoltageV,
      frequencyHz,
      poles: poleCount,
      addedRotorResistanceOhm: rotorResistanceOhm,
    });
  }, [lineVoltageV, frequencyHz, poleCount, rotorResistanceOhm]);

  // 3. Starting Method State Calculation
  const startPerf = useMemo(() => {
    return DrivesCalculator.calculateStartingPerformance(startingMethod, activeMotor.ratedPowerKW);
  }, [startingMethod, activeMotor]);

  // 4. Braking Method State Calculation
  const brakePerf = useMemo(() => {
    return DrivesCalculator.calculateBrakingPerformance({
      method: brakingMethod,
      initialSpeedRPM: activeMotor.category === 'dc' ? dcState.speedRPM : acState.rotorSpeedRPM,
      momentOfInertiaKgM2: activeMotor.momentOfInertiaKgM2,
      brakingResistanceOhm: brakingResistorOhm,
    });
  }, [brakingMethod, activeMotor, dcState, acState, brakingResistorOhm]);

  // 5. VFD State Calculation
  const vfdState = useMemo(() => {
    return DrivesCalculator.calculateVFDState({
      inputFrequencyHz: 50,
      outputFrequencyHz: vfdOutputFreqHz,
      ratedVoltageV: 415,
      baseFrequencyHz: 50,
      poles: poleCount,
      loadTorqueNm,
    });
  }, [vfdOutputFreqHz, poleCount, loadTorqueNm]);

  // Initialize and switch Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }

    const scene = createDrivesScene(activeSimId, containerRef.current);
    sceneRef.current = scene;

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [activeSimId]);

  // Sync parameters with 3D scene
  useEffect(() => {
    if (!sceneRef.current) return;

    if (activeSimId === 'u25ee305-sim-01') {
      sceneRef.current.updateParameters({
        speedRPM: dcState.speedRPM,
        terminalVoltageV,
        loadTorqueNm,
        fluxRatio: fieldWeakeningRatio,
        isRunning,
      });
    } else if (activeSimId === 'u25ee305-sim-02') {
      sceneRef.current.updateParameters({
        syncSpeedRPM: acState.synchronousSpeedRPM,
        rotorSpeedRPM: acState.rotorSpeedRPM,
        slip: acState.slip,
        isRunning,
      });
    } else if (activeSimId === 'u25ee305-sim-03') {
      sceneRef.current.updateParameters({
        startingMethod,
        targetSpeedRPM: acState.rotorSpeedRPM,
        currentAmps: startPerf.currentVsTime[0]?.currentA ?? 60,
      });
    } else if (activeSimId === 'u25ee305-sim-04') {
      sceneRef.current.updateParameters({
        brakingMethod,
        motorSpeedRPM: activeMotor.category === 'dc' ? dcState.speedRPM : acState.rotorSpeedRPM,
      });
    } else if (activeSimId === 'u25ee305-sim-05') {
      sceneRef.current.updateParameters({
        outputFrequencyHz: vfdState.outputFrequencyHz,
        rotorSpeedRPM: vfdState.rotorSpeedRPM,
        isRunning,
        dcBusVoltageV: vfdState.dcBusVoltageV,
      });
    } else if (activeSimId === 'u25ee305-sim-06') {
      sceneRef.current.updateParameters({
        motorRPM: activeMotor.category === 'dc' ? dcState.speedRPM : acState.rotorSpeedRPM,
        loadTorqueNm,
        isRunning,
      });
    } else if (activeSimId === 'u25ee305-sim-07') {
      sceneRef.current.updateParameters({
        circuitState,
      });
    } else if (activeSimId === 'u25ee305-sim-08') {
      sceneRef.current.updateParameters({
        motorRPM: activeMotor.category === 'dc' ? dcState.speedRPM : acState.rotorSpeedRPM,
        currentAmps: activeMotor.category === 'dc' ? dcState.armatureCurrentA : acState.statorCurrentA,
        voltageV: activeMotor.category === 'dc' ? terminalVoltageV : lineVoltageV,
        isRunning,
      });
    }
  }, [
    activeSimId,
    dcState,
    acState,
    startPerf,
    brakePerf,
    vfdState,
    terminalVoltageV,
    lineVoltageV,
    loadTorqueNm,
    fieldWeakeningRatio,
    startingMethod,
    brakingMethod,
    circuitState,
    isRunning,
    activeMotor,
  ]);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  }, []);

  // Log Lab Trial
  const handleLogTrial = useCallback(() => {
    const isDC = activeMotor.category === 'dc';
    const trial: DrivesLabTrial = {
      trialNumber: trials.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      motorName: activeMotor.name,
      controlMode: activeSimId,
      measuredVoltageV: isDC ? terminalVoltageV : lineVoltageV,
      measuredCurrentA: isDC ? dcState.armatureCurrentA : acState.statorCurrentA,
      measuredSpeedRPM: isDC ? dcState.speedRPM : acState.rotorSpeedRPM,
      measuredTorqueNm: isDC ? dcState.developedTorqueNm : acState.developedTorqueNm,
      calculatedPowerW: isDC ? dcState.outputPowerW : acState.mechanicalPowerW,
      calculatedEfficiencyPct: isDC ? dcState.efficiencyPercent : acState.efficiencyPercent,
      status: 'VERIFIED',
    };
    setTrials((prev) => [trial, ...prev]);
  }, [trials, activeMotor, activeSimId, terminalVoltageV, lineVoltageV, dcState, acState]);

  // Concept Quiz Questions
  const quizQuestions = useMemo(() => [
    {
      q: 'Why does a DC series motor experience dangerously high runaway speed at no-load?',
      options: [
        'Because field flux is directly proportional to armature current; at no-load (Ia ≈ 0), flux approaches zero and N ∝ 1/Φ goes to infinity.',
        'Because back EMF increases exponentially when mechanical load is removed.',
        'Because series armature resistance drops to zero.',
        'Because line supply voltage doubles at no-load.',
      ],
      correct: 0,
      explanation: 'In a series motor, Φ ∝ Ia. Under no-load, Ia is negligible, causing field flux Φ to become very small. Since speed N = (V - IaRa)/(kΦ), N rises dangerously high, risking centrifugal mechanical destruction.',
    },
    {
      q: 'In a 3-Phase Induction Motor, what is the theoretical slip at synchronous speed (Nr = Ns)?',
      options: ['s = 1.0 (100%)', 's = 0.0 (0%)', 's = -1.0', 's = 0.5 (50%)'],
      correct: 1,
      explanation: 'Slip s = (Ns - Nr) / Ns. When the rotor rotates at exact synchronous speed (Nr = Ns), s = 0. At s = 0, rotor conductors do not cut stator flux, so induced rotor EMF and torque become zero.',
    },
    {
      q: 'How does a Star–Delta (Y–Δ) starter reduce line starting current compared to Direct-On-Line (DOL)?',
      options: [
        'Line starting current is reduced to 1/2 of DOL.',
        'Line starting current is reduced to 1/3 of DOL.',
        'Line starting current is reduced to 1/√3 of DOL.',
        'Line starting current is reduced to 1/4 of DOL.',
      ],
      correct: 1,
      explanation: 'In Star connection, phase voltage is V_line / √3. Since current is proportional to voltage, phase current is 1/√3 of delta. Line current in star equals phase current, which is (1/√3) × (1/√3) = 1/3 of the line current in Delta.',
    },
    {
      q: 'In Variable Frequency Drives (VFDs), why is the V/f ratio kept constant below base frequency?',
      options: [
        'To maintain constant airgap magnetic flux (Φ ∝ V/f) and avoid magnetic saturation or torque loss.',
        'To reduce line harmonic distortion in the diode rectifier.',
        'To force the motor to operate at unity power factor.',
        'To prevent rotor shaft bearing current discharge.',
      ],
      correct: 0,
      explanation: 'Stator flux Φ is proportional to V / f. Maintaining constant V/f keeps airgap flux constant at rated level, ensuring the motor can deliver full rated breakdown torque without core saturation or overheating.',
    },
    {
      q: 'What is the key electrical hazard during Plugging (Counter-Current Braking)?',
      options: [
        'The motor acts as a high-voltage battery back-feeding the grid.',
        'Relative slip becomes s ≈ 2.0, causing high inrush current and the danger of reverse rotation without a zero-speed switch.',
        'The magnetic core undergoes irreversible demagnetization.',
        'The shaft coupling slips due to zero torque generation.',
      ],
      correct: 1,
      explanation: 'Reversing supply phase sequence while the motor is spinning forward creates an opposing field, resulting in slip s = (Ns - (-Nr))/Ns ≈ 2.0. Severe braking current occurs, and a zero-speed centrifugal switch must disconnect the supply to stop reverse run-away.',
    },
  ], []);

  // Syllabus module tabs definition
  const moduleTabs: { id: ElectricalDrivesSimId; label: string; unit: string; icon: string }[] = [
    { id: 'u25ee305-sim-01', label: 'DC Motor & Speed Control', unit: 'Unit II', icon: '⚡' },
    { id: 'u25ee305-sim-02', label: '3Φ Induction Motor & Slip', unit: 'Unit II', icon: '🌀' },
    { id: 'u25ee305-sim-03', label: 'Motor Starting Methods', unit: 'Unit III', icon: '🚀' },
    { id: 'u25ee305-sim-04', label: 'Motor Electric Braking', unit: 'Unit V', icon: '🛑' },
    { id: 'u25ee305-sim-05', label: 'Variable Frequency Drive (VFD)', unit: 'Unit IV', icon: '🎛️' },
    { id: 'u25ee305-sim-06', label: 'Torque–Speed & Load Matching', unit: 'Unit I', icon: '📈' },
    { id: 'u25ee305-sim-07', label: 'Control Circuits & MCC Panel', unit: 'Unit V', icon: '🔌' },
    { id: 'u25ee305-sim-08', label: 'Virtual Drives Laboratory', unit: 'Practical', icon: '🔬' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* ── HEADER NAVIGATION BAR ── */}
      <header className="flex-shrink-0 h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
            ED
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wide text-white">Electrical Drives and Control</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-bold">
                U25EE305 / ME3393
              </span>
              <span className="hidden md:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Mech Sem III
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate hidden sm:block">
              Interactive 3D Electric Machines, Variable-Frequency Drives &amp; Industrial Control Laboratory
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isRunning ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {isRunning ? '⏸ Pause' : '▶ Run'}
          </button>
          <button
            onClick={handleResetCamera}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Reset Camera View"
          >
            🎥 Reset Cam
          </button>
          <button
            onClick={handleLogTrial}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-900/40 hover:bg-sky-800/60 text-sky-300 border border-sky-700/50 transition flex items-center gap-1"
          >
            📝 Log Trial
          </button>
          <button
            onClick={() => setIsLogTableOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            📊 Trials ({trials.length})
          </button>
          <button
            onClick={() => setIsQuizOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border border-purple-700/50 transition flex items-center gap-1"
          >
            🧠 Quiz
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-700/50 transition"
            >
              ✕ Exit
            </button>
          )}
        </div>
      </header>

      {/* ── SYLLABUS MODULE TABS ── */}
      <nav className="flex-shrink-0 h-10 bg-slate-900/70 border-b border-slate-800/80 px-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {moduleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSimId(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSimId === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${activeSimId === tab.id ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-800 text-slate-400'}`}>
              {tab.unit}
            </span>
          </button>
        ))}
      </nav>

      {/* ── MAIN WORKSPACE VIEWPORT & CONTROL CONSOLE ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* 3D Simulation Canvas Container */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
          {/* Top Live Metrics HUD */}
          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
            {/* Speed HUD */}
            <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-lg flex items-center gap-2">
              <span className="text-amber-400 font-bold text-sm">⏱</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Shaft Speed</div>
                <div className="text-sm font-mono font-black text-amber-300">
                  {activeMotor.category === 'dc' ? dcState.speedRPM : acState.rotorSpeedRPM} <span className="text-[10px] text-slate-400 font-normal">RPM</span>
                </div>
              </div>
            </div>

            {/* Torque HUD */}
            <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-lg flex items-center gap-2">
              <span className="text-sky-400 font-bold text-sm">🔄</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Torque (Te)</div>
                <div className="text-sm font-mono font-black text-sky-300">
                  {activeMotor.category === 'dc' ? dcState.developedTorqueNm : acState.developedTorqueNm} <span className="text-[10px] text-slate-400 font-normal">N·m</span>
                </div>
              </div>
            </div>

            {/* Current HUD */}
            <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-lg flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-sm">⚡</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Current</div>
                <div className="text-sm font-mono font-black text-emerald-300">
                  {activeMotor.category === 'dc' ? dcState.armatureCurrentA : acState.statorCurrentA} <span className="text-[10px] text-slate-400 font-normal">A</span>
                </div>
              </div>
            </div>

            {/* Power / Slip HUD */}
            <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-lg flex items-center gap-2">
              <span className="text-purple-400 font-bold text-sm">📊</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {activeMotor.category === 'dc' ? 'Back EMF (Eb)' : 'Slip (s)'}
                </div>
                <div className="text-sm font-mono font-black text-purple-300">
                  {activeMotor.category === 'dc' ? `${dcState.backEmfV} V` : `${acState.slipPercent}%`}
                </div>
              </div>
            </div>

            {/* Efficiency HUD */}
            <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-lg flex items-center gap-2">
              <span className="text-teal-400 font-bold text-sm">🎯</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Efficiency (η)</div>
                <div className="text-sm font-mono font-black text-teal-300">
                  {activeMotor.category === 'dc' ? dcState.efficiencyPercent : acState.efficiencyPercent}%
                </div>
              </div>
            </div>
          </div>

          {/* 3D Viewport DOM Container */}
          <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />

          {/* Bottom Overlay: Real-time Governing Formula */}
          <div className="absolute bottom-2 left-3 right-3 z-10 pointer-events-none flex justify-center">
            <div className="pointer-events-auto px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-800 text-xs font-mono text-slate-300 shadow-xl flex items-center gap-3">
              <span className="text-emerald-400 font-bold">Formula:</span>
              <span>
                {activeSimId === 'u25ee305-sim-01' && 'N = (V - Ia·Ra) / (ke·Φ) | Eb = ke·Φ·ω | Te = kt·Φ·Ia'}
                {activeSimId === 'u25ee305-sim-02' && 'Ns = 120·f / P | s = (Ns - Nr) / Ns | Te = (3/ωs)·[Vth²·(R2\'/s)] / [(Rth + R2\'/s)² + (Xth + X2\')²]'}
                {activeSimId === 'u25ee305-sim-03' && 'Y-Δ: Ist(star) = (1/3)·Ist(delta) | Tst(star) = (1/3)·Tst(delta) | Auto-Xfmr: Ist = x²·Ist(DOL)'}
                {activeSimId === 'u25ee305-sim-04' && 'J·(dω/dt) = -(Te + TL) | Dynamic: E_diss = (1/2)·J·ω₀² | Plugging: s ≈ 2.0'}
                {activeSimId === 'u25ee305-sim-05' && 'Ns = 120·f / P | V/f = const (below base) | SPWM: ma = Vpeak / Vtri'}
                {activeSimId === 'u25ee305-sim-06' && 'Te(s) = TL(ω) operating equilibrium | dTe/dω < dTL/dω (stable criteria)'}
                {activeSimId === 'u25ee305-sim-07' && 'M Coil 13-14 latching | 95-96 NC thermal trip | Interlock: FWD NC in REV coil path'}
                {activeSimId === 'u25ee305-sim-08' && 'P = √3·VL·IL·cosφ = W1 + W2 | tanφ = √3·(W1 - W2) / (W1 + W2)'}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PARAMETER CONTROLS & THEORY SIDEBAR ── */}
        <aside className="w-full lg:w-96 flex-shrink-0 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto p-4 flex flex-col gap-4 z-20">
          {/* Motor Catalogue Selector */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Industrial Motor Model</span>
              <span className="text-emerald-400">{activeMotor.category.toUpperCase()}</span>
            </div>
            <select
              value={selectedMotorId}
              onChange={(e) => setSelectedMotorId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {Object.values(DRIVES_MOTOR_CATALOGUE).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.ratedPowerKW} kW, {m.ratedVoltageV}V)
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              {activeMotor.description}
            </div>
          </div>

          {/* Module-Specific Interactive Controls */}
          {activeSimId === 'u25ee305-sim-01' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                DC Motor Speed Control Parameters
              </div>

              {/* Armature Voltage Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Armature Voltage (V)</span>
                  <span className="font-mono text-emerald-400 font-bold">{terminalVoltageV} V</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="250"
                  step="5"
                  value={terminalVoltageV}
                  onChange={(e) => setTerminalVoltageV(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Field Flux Weakening Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Field Flux Ratio (Φ / Φ_rated)</span>
                  <span className="font-mono text-amber-400 font-bold">{Math.round(fieldWeakeningRatio * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.1"
                  step="0.05"
                  value={fieldWeakeningRatio}
                  onChange={(e) => setFieldWeakeningRatio(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-500">Speed above base speed obtained by field flux weakening</span>
              </div>

              {/* External Armature Resistance Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Added Armature Rheostat (R_ext)</span>
                  <span className="font-mono text-sky-400 font-bold">{externalArmatureResOhm} Ω</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={externalArmatureResOhm}
                  onChange={(e) => setExternalArmatureResOhm(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              {/* Load Torque Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Applied Mechanical Load Torque (TL)</span>
                  <span className="font-mono text-purple-400 font-bold">{loadTorqueNm} N·m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="1"
                  value={loadTorqueNm}
                  onChange={(e) => setLoadTorqueNm(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          )}

          {activeSimId === 'u25ee305-sim-02' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                3-Phase Induction Motor Controls
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Poles (P)</label>
                  <select
                    value={poleCount}
                    onChange={(e) => setPoleCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold"
                  >
                    <option value={2}>2 Poles (3000 RPM)</option>
                    <option value={4}>4 Poles (1500 RPM)</option>
                    <option value={6}>6 Poles (1000 RPM)</option>
                    <option value={8}>8 Poles (750 RPM)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Frequency (f)</label>
                  <select
                    value={frequencyHz}
                    onChange={(e) => setFrequencyHz(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold"
                  >
                    <option value={25}>25 Hz</option>
                    <option value={50}>50 Hz (Standard)</option>
                    <option value={60}>60 Hz (US/NEMA)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Added Rotor Resistance (Slip-Ring)</span>
                  <span className="font-mono text-amber-400 font-bold">{rotorResistanceOhm} Ω</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.2"
                  value={rotorResistanceOhm}
                  onChange={(e) => setRotorResistanceOhm(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 text-xs space-y-1 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Breakdown Torque (Tmax):</span>
                  <span className="font-mono font-bold text-sky-400">{acState.pullOutTorqueNm} N·m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slip at Tmax (sm):</span>
                  <span className="font-mono font-bold text-purple-400">{acState.slipAtPullOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Starting Torque (Tstart):</span>
                  <span className="font-mono font-bold text-emerald-400">{acState.startingTorqueNm} N·m</span>
                </div>
              </div>
            </div>
          )}

          {activeSimId === 'u25ee305-sim-03' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Motor Starting Methods
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['dol', 'star-delta', 'auto-transformer', 'soft-starter'] as StartingMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setStartingMethod(m)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-bold transition text-left ${
                      startingMethod === m
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {m === 'dol' && 'DOL Starter'}
                    {m === 'star-delta' && 'Star–Delta (Y–Δ)'}
                    {m === 'auto-transformer' && 'Auto-Transformer'}
                    {m === 'soft-starter' && 'Soft Starter'}
                  </button>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 text-xs space-y-1 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Starting Current Ratio:</span>
                  <span className="font-mono font-bold text-amber-400">{startPerf.startingCurrentRatio}× Rated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Starting Torque Ratio:</span>
                  <span className="font-mono font-bold text-sky-400">{startPerf.startingTorqueRatio}× Rated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Acceleration Time:</span>
                  <span className="font-mono font-bold text-emerald-400">{startPerf.accelerationTimeSec} s</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300">
                <div className="font-bold text-emerald-400 mb-1">Advantages:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  {startPerf.advantages.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeSimId === 'u25ee305-sim-04' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Electric Braking Methods
              </div>
              <div className="flex flex-col gap-1.5">
                {(['dynamic-rheostatic', 'regenerative', 'plugging-counter-current'] as BrakingMethod[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrakingMethod(b)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                      brakingMethod === b
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {b === 'dynamic-rheostatic' && 'Dynamic (Rheostatic) Braking'}
                    {b === 'regenerative' && 'Regenerative Braking'}
                    {b === 'plugging-counter-current' && 'Plugging (Counter-Current)'}
                  </button>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 text-xs space-y-1 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Stopping Duration:</span>
                  <span className="font-mono font-bold text-emerald-400">{brakePerf.stoppingTimeSec} s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Braking Torque:</span>
                  <span className="font-mono font-bold text-amber-400">{brakePerf.peakBrakingTorqueNm} N·m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Energy Dissipated:</span>
                  <span className="font-mono font-bold text-rose-400">{brakePerf.energyDissipatedJoules} J</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (sceneRef.current) {
                    sceneRef.current.updateParameters({ triggerBrake: true, brakingMethod });
                  }
                }}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-lg transition active:scale-95"
              >
                🛑 Apply Electrical Brake
              </button>
            </div>
          )}

          {activeSimId === 'u25ee305-sim-05' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Variable Frequency Drive (VFD) Controls
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Target Output Frequency (Hz)</span>
                  <span className="font-mono text-emerald-400 font-bold">{vfdOutputFreqHz} Hz</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="1"
                  value={vfdOutputFreqHz}
                  onChange={(e) => setVfdOutputFreqHz(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 text-xs space-y-1 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Output RMS Voltage:</span>
                  <span className="font-mono font-bold text-sky-400">{vfdState.outputVoltageRMS} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">V/f Ratio:</span>
                  <span className="font-mono font-bold text-amber-400">{vfdState.vPerFRatio} V/Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operating Mode:</span>
                  <span className={`font-mono font-bold ${vfdState.isFieldWeakening ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {vfdState.isFieldWeakening ? 'Field Weakening (P = const)' : 'Constant V/f (T = const)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DC Bus Voltage:</span>
                  <span className="font-mono font-bold text-purple-400">{vfdState.dcBusVoltageV} V DC</span>
                </div>
              </div>
            </div>
          )}

          {activeSimId === 'u25ee305-sim-07' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                MCC Control Circuit Pushbutton Console
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCircuitState('running')}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md transition"
                >
                  🟢 Start (NO)
                </button>
                <button
                  onClick={() => setCircuitState('idle-stopped')}
                  className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-md transition"
                >
                  🔴 Stop (NC)
                </button>
              </div>

              <button
                onClick={() => setCircuitState('tripped-overload')}
                className="w-full py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
              >
                ⚠️ Simulate Thermal Overload Trip (95-96)
              </button>

              <div className="p-2.5 rounded-lg bg-slate-900 text-xs space-y-1 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contactor Status:</span>
                  <span className={`font-mono font-bold ${circuitState === 'running' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {circuitState === 'running' ? 'ENERGIZED (Latched 13-14)' : 'DE-ENERGIZED (Open)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Motor Circuit State:</span>
                  <span className="font-mono font-bold text-sky-400 uppercase">{circuitState}</span>
                </div>
              </div>
            </div>
          )}

          {/* Theory & Pedagogical Objectives Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Syllabus Alignment &amp; Applications
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Mapped to Anna University / KPRIET Regulation R2025: Electric drive selection, torque-speed equilibrium, staring inrush mitigation, solid-state variable frequency conversion, and industrial contactor interlocking logic.
            </p>
            <div className="text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold">Key Applications: </span>
              {activeMotor.applications.join(', ')}
            </div>
          </div>
        </aside>
      </div>

      {/* ── CONCEPT QUIZ MODAL ── */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Electrical Drives Concept Assessment</h3>
                <p className="text-xs text-slate-400">5 Syllabus-Aligned Diagnostic Questions with Explanations</p>
              </div>
              <button
                onClick={() => setIsQuizOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-200">
                    {idx + 1}. {q.q}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[idx] === optIdx;
                      const isSubmitted = quizScore !== null;
                      const isCorrect = optIdx === q.correct;
                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition border flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                          } ${isSubmitted && isCorrect ? 'border-emerald-400 bg-emerald-950/90 text-emerald-300 font-bold' : ''} ${
                            isSubmitted && isSelected && !isCorrect ? 'border-rose-400 bg-rose-950/90 text-rose-300' : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && isCorrect && <span>✓ Correct</span>}
                        </button>
                      );
                    })}
                  </div>
                  {quizScore !== null && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {quizScore !== null ? (
                <div className="text-sm font-bold text-emerald-400">
                  Your Score: {quizScore} / {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                </div>
              ) : (
                <div className="text-xs text-slate-500">Answer all questions to view detailed scoring</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    let score = 0;
                    quizQuestions.forEach((q, i) => {
                      if (selectedAnswers[i] === q.correct) score++;
                    });
                    setQuizScore(score);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition"
                >
                  Submit &amp; Grade
                </button>
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setQuizScore(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OBSERVATION LOG TABLE MODAL ── */}
      {isLogTableOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Electrical Drives Observation Table &amp; Trial Log</h3>
                <p className="text-xs text-slate-400">Formal engineering measurement records recorded during session</p>
              </div>
              <button
                onClick={() => setIsLogTableOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {trials.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No trials logged yet. Click &quot;Log Trial&quot; in the header bar to capture live operating points.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Motor Machine</th>
                      <th className="p-2.5">Voltage (V)</th>
                      <th className="p-2.5">Current (A)</th>
                      <th className="p-2.5">Speed (RPM)</th>
                      <th className="p-2.5">Torque (N·m)</th>
                      <th className="p-2.5">Power (W)</th>
                      <th className="p-2.5">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {trials.map((t) => (
                      <tr key={t.trialNumber} className="hover:bg-slate-800/50">
                        <td className="p-2.5 font-mono">{t.trialNumber}</td>
                        <td className="p-2.5 text-slate-400">{t.timestamp}</td>
                        <td className="p-2.5 font-semibold text-emerald-400">{t.motorName}</td>
                        <td className="p-2.5 font-mono">{t.measuredVoltageV}</td>
                        <td className="p-2.5 font-mono">{t.measuredCurrentA}</td>
                        <td className="p-2.5 font-mono">{t.measuredSpeedRPM}</td>
                        <td className="p-2.5 font-mono">{t.measuredTorqueNm}</td>
                        <td className="p-2.5 font-mono">{t.calculatedPowerW}</td>
                        <td className="p-2.5 font-mono font-bold text-teal-400">{t.calculatedEfficiencyPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">Total Recorded Trials: {trials.length}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      'Trial,Timestamp,Motor,Voltage_V,Current_A,Speed_RPM,Torque_Nm,Power_W,Efficiency_Pct\n' +
                      trials
                        .map(
                          (t) =>
                            `${t.trialNumber},"${t.timestamp}","${t.motorName}",${t.measuredVoltageV},${t.measuredCurrentA},${t.measuredSpeedRPM},${t.measuredTorqueNm},${t.calculatedPowerW},${t.calculatedEfficiencyPct}`
                        )
                        .join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'electrical_drives_trials.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  disabled={trials.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                >
                  🖨️ Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
