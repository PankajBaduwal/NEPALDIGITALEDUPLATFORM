/**
 * PiyushDhara Eduverse — Thermal Engineering (U25ME402)
 * Master Interactive Engineering Simulation Studio
 * Department of Mechanical Engineering | Semester IV | Regulation R2025 Revised CBCS
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type {
  ThermalSimId,
  HeatTransferMode,
  ConductionParams,
  ConvectionParams,
  RadiationParams,
  CompositeWallParams,
  HeatExchangerParams,
  HeatExchangerFlowType,
  BoilerParams,
  RefrigerationParams,
  EnergyBalanceInput,
  ThermalLabTrial,
  ThermalQuizQuestion,
} from '../core/types';
import { ThermalEngineeringCalculator } from '../core/ThermalEngineeringCalculator';
import { createThermalScene, BaseThermalScene } from '../simulations';

interface Props {
  simulationId?: string;
  onBack?: () => void;
}

export const ThermalEngineeringWorkspace: React.FC<Props> = ({
  simulationId,
  onBack,
}) => {
  // Determine active tab
  const [activeTab, setActiveTab] = useState<ThermalSimId>(() => {
    if (simulationId) {
      if (simulationId.includes('heat-transfer') || simulationId.includes('conduction')) return 'heat-transfer';
      if (simulationId.includes('composite') || simulationId.includes('resistance')) return 'composite-wall';
      if (simulationId.includes('exchanger') || simulationId.includes('lmtd')) return 'heat-exchanger';
      if (simulationId.includes('boiler') || simulationId.includes('steam')) return 'steam-boiler';
      if (simulationId.includes('refrigeration') || simulationId.includes('chiller')) return 'refrigeration-cycle';
      if (simulationId.includes('calculator') || simulationId.includes('sfee')) return 'energy-calculator';
      if (simulationId.includes('lab') || simulationId.includes('experiment')) return 'thermal-lab';
      if (simulationId.includes('bay') || simulationId.includes('workshop')) return 'virtual-bay';
    }
    return 'heat-transfer';
  });

  const [use3D, setUse3D] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [trials, setTrials] = useState<ThermalLabTrial[]>([]);

  // 3D Canvas Container
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BaseThermalScene | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE: Module 1 Heat Transfer Explorer
  // ═══════════════════════════════════════════════════════════════════════════
  const [htMode, setHtMode] = useState<HeatTransferMode>('conduction');
  const [condParams, setCondParams] = useState<ConductionParams>({
    material: 'copper',
    thicknessM: 0.15,
    areaM2: 0.8,
    tempHotC: 150,
    tempColdC: 30,
  });
  const [convParams, setConvParams] = useState<ConvectionParams>({
    fluid: 'air-forced',
    surfaceAreaM2: 1.2,
    surfaceTempC: 90,
    ambientTempC: 25,
  });
  const [radParams, setRadParams] = useState<RadiationParams>({
    surfaceEmissivity: 0.85,
    surfaceAreaM2: 1.5,
    surfaceTempC: 300,
    surroundingTempC: 25,
  });

  const htResult = useMemo(() => {
    if (htMode === 'conduction') return ThermalEngineeringCalculator.computeConduction(condParams);
    if (htMode === 'convection') return ThermalEngineeringCalculator.computeConvection(convParams);
    return ThermalEngineeringCalculator.computeRadiation(radParams);
  }, [htMode, condParams, convParams, radParams]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE: Module 2 Composite Wall
  // ═══════════════════════════════════════════════════════════════════════════
  const [wallParams, setWallParams] = useState<CompositeWallParams>({
    layers: [
      { id: '1', name: 'Firebrick (Inner)', material: 'refractory-brick', thicknessMM: 120, thermalConductivityWMK: 1.25 },
      { id: '2', name: 'Glass Wool (Middle)', material: 'glass-wool', thicknessMM: 80, thermalConductivityWMK: 0.038 },
      { id: '3', name: 'Steel Plate (Outer)', material: 'mild-steel', thicknessMM: 15, thermalConductivityWMK: 54.0 },
    ],
    surfaceAreaM2: 2.5,
    insideTempC: 750,
    outsideTempC: 35,
    innerConvectionH: 45,
    outerConvectionH: 18,
  });

  const wallResult = useMemo(() => {
    return ThermalEngineeringCalculator.computeCompositeWall(wallParams);
  }, [wallParams]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE: Module 3 Heat Exchanger
  // ═══════════════════════════════════════════════════════════════════════════
  const [hxParams, setHxParams] = useState<HeatExchangerParams>({
    flowType: 'counter',
    exchangerType: 'double-pipe',
    hotFluidMassFlowKgS: 0.8,
    hotFluidInletTempC: 95,
    hotFluidSpecificHeatJPerKgK: 4186,
    coldFluidMassFlowKgS: 1.2,
    coldFluidInletTempC: 20,
    coldFluidSpecificHeatJPerKgK: 4186,
    overallHeatTransferCoeffWM2K: 650,
    surfaceAreaM2: 3.5,
  });

  const hxResult = useMemo(() => {
    return ThermalEngineeringCalculator.computeHeatExchanger(hxParams);
  }, [hxParams]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE: Module 4 Boilers
  // ═══════════════════════════════════════════════════════════════════════════
  const [boilerParams, setBoilerParams] = useState<BoilerParams>({
    boilerType: 'babcock-wilcox',
    steamGenerationRateKgH: 3500,
    operatingPressureBar: 12,
    feedwaterTempC: 35,
    steamCondition: 'superheated',
    superheatTempC: 250,
    fuelConsumptionRateKgH: 380,
    fuelCalorificValueKJPerKg: 31000,
  });

  const boilerResult = useMemo(() => {
    return ThermalEngineeringCalculator.computeBoilerPerformance(boilerParams);
  }, [boilerParams]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE: Module 5 Refrigeration & Air Conditioning
  // ═══════════════════════════════════════════════════════════════════════════
  const [refParams, setRefParams] = useState<RefrigerationParams>({
    refrigerant: 'R134a',
    evaporatorTempC: -5,
    condenserTempC: 45,
    subcoolingDeltaC: 5,
    superheatingDeltaC: 5,
    coolingCapacityKW: 10,
    compressorIsentropicEfficiency: 0.82,
  });

  const refResult = useMemo(() => {
    return ThermalEngineeringCalculator.computeRefrigerationCycle(refParams);
  }, [refParams]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE: Module 6 Energy Balance Calculator
  // ═══════════════════════════════════════════════════════════════════════════
  const [energyInput, setEnergyInput] = useState<EnergyBalanceInput>({
    systemType: 'steam-turbine',
    massFlowRateKgS: 2.5,
    inletPressureKPa: 3000,
    inletTempC: 350,
    inletVelocityMS: 30,
    outletPressureKPa: 15,
    outletTempC: 55,
    outletVelocityMS: 120,
    inletEnthalpyKJPerKg: 3115,
    outletEnthalpyKJPerKg: 2280,
  });

  const energyResult = useMemo(() => {
    return ThermalEngineeringCalculator.computeEnergyBalance(energyInput);
  }, [energyInput]);

  // Initialize and switch 3D scene
  useEffect(() => {
    if (!use3D || !containerRef.current) return;

    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }

    try {
      const scene = createThermalScene(activeTab, containerRef.current);
      sceneRef.current = scene;

      // Feed initial parameters
      if (activeTab === 'heat-transfer') {
        scene.setParameters({ mode: htMode, tempHot: condParams.tempHotC, tempCold: condParams.tempColdC, heatFlux: htResult.heatFluxWPerM2 });
      } else if (activeTab === 'composite-wall') {
        scene.setParameters({ wallParams, calcs: wallResult.layerCalculations });
      } else if (activeTab === 'heat-exchanger') {
        scene.setParameters({ flowType: hxParams.flowType, result: hxResult });
      } else if (activeTab === 'steam-boiler') {
        scene.setParameters({ boilerParams, result: boilerResult });
      } else if (activeTab === 'refrigeration-cycle') {
        scene.setParameters({ refParams, result: refResult });
      }
    } catch (e) {
      console.warn('3D WebGL Scene initialization skipped or failed:', e);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [activeTab, use3D]);

  // Sync parameters with active scene
  useEffect(() => {
    if (!sceneRef.current) return;
    if (activeTab === 'heat-transfer') {
      sceneRef.current.setParameters({ mode: htMode, tempHot: condParams.tempHotC, tempCold: condParams.tempColdC, heatFlux: htResult.heatFluxWPerM2 });
    } else if (activeTab === 'composite-wall') {
      sceneRef.current.setParameters({ wallParams, calcs: wallResult.layerCalculations });
    } else if (activeTab === 'heat-exchanger') {
      sceneRef.current.setParameters({ flowType: hxParams.flowType, result: hxResult });
    } else if (activeTab === 'steam-boiler') {
      sceneRef.current.setParameters({ boilerParams, result: boilerResult });
    } else if (activeTab === 'refrigeration-cycle') {
      sceneRef.current.setParameters({ refParams, result: refResult });
    }
  }, [activeTab, htMode, condParams, convParams, radParams, wallParams, hxParams, boilerParams, refParams, htResult, wallResult, hxResult, boilerResult, refResult]);

  // Record a trial
  const handleRecordTrial = () => {
    const trial: ThermalLabTrial = {
      id: `trial-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      experimentName: activeTab.toUpperCase(),
      parameters: {
        tab: activeTab,
        mode: htMode,
        thIn: hxParams.hotFluidInletTempC,
        tcIn: hxParams.coldFluidInletTempC,
        boilerPress: boilerParams.operatingPressureBar,
      },
      results: {
        heatWatts: activeTab === 'heat-transfer' ? htResult.heatRateWatts.toFixed(1) : hxResult.heatTransferRateKW.toFixed(2),
        eff: activeTab === 'steam-boiler' ? `${boilerResult.boilerEfficiencyPercent.toFixed(1)}%` : `${(hxResult.effectiveness * 100).toFixed(1)}%`,
        cop: activeTab === 'refrigeration-cycle' ? refResult.copCooling.toFixed(2) : 'N/A',
      },
      notes: 'Logged from live thermal simulation run.',
    };
    setTrials((prev) => [trial, ...prev.slice(0, 19)]);
  };

  const exportTrialsCSV = () => {
    if (trials.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Experiment', 'Parameters', 'Results', 'Notes'];
    const rows = trials.map((t) => [
      t.id,
      t.timestamp,
      t.experimentName,
      JSON.stringify(t.parameters).replace(/"/g, '""'),
      JSON.stringify(t.results).replace(/"/g, '""'),
      t.notes,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thermal_engineering_trials_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quizQuestions = useMemo(() => ThermalEngineeringCalculator.getQuizQuestions(), []);

  const handleGradeQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) score++;
    });
    setQuizScore(score);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Studio Header Bar ─── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
              title="Return to Subject Hub"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">Thermal Engineering</h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  U25ME402
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                  Sem IV · Mechanical
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block">
                Conduction · Convection · Radiation · Exchangers · Boilers · VCR Refrigeration · SFEE
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUse3D((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
              use3D
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle between 3D Three.js and 2D Canvas diagrams"
          >
            <span>{use3D ? '🧊 3D View' : '📐 2D View'}</span>
          </button>

          <button
            onClick={() => setShowQuiz(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer flex items-center gap-1"
            title="Syllabus evaluation quiz"
          >
            <span>📝</span>
            <span className="hidden sm:inline">Quiz</span>
          </button>

          <button
            onClick={handleRecordTrial}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
            title="Log current operating point to trial table"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Log Trial</span>
          </button>
        </div>
      </header>

      {/* ─── Module Tab Switcher Bar ─── */}
      <nav className="flex-shrink-0 flex items-center gap-1 px-4 py-1.5 bg-slate-900/60 border-b border-slate-800 overflow-x-auto scrollbar-thin">
        {[
          { id: 'heat-transfer', label: 'Heat Transfer Explorer', icon: '🌡️' },
          { id: 'composite-wall', label: 'Composite Wall (Resistance)', icon: '🧱' },
          { id: 'heat-exchanger', label: 'Heat Exchangers (LMTD/NTU)', icon: '🔄' },
          { id: 'steam-boiler', label: 'Steam Boilers', icon: '🏭' },
          { id: 'refrigeration-cycle', label: 'VCR Refrigeration (Chiller)', icon: '❄️' },
          { id: 'energy-calculator', label: 'SFEE Energy Balance', icon: '⚖️' },
          { id: 'thermal-lab', label: 'Virtual Lab Trials', icon: '📋' },
          { id: 'virtual-bay', label: '3D Thermal Bay (Twin)', icon: '🏢' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ThermalSimId)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ─── Main Content Area: Split Viewport + Parameters Panel ─── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left / Center: Interactive 3D / 2D Viewport */}
        <div className="flex-1 relative flex flex-col bg-slate-950 overflow-hidden min-h-[300px]">
          {use3D ? (
            <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
              {/* Floating Camera Reset Button */}
              <button
                onClick={() => sceneRef.current?.resetCamera()}
                className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium z-10 backdrop-blur-md cursor-pointer"
                title="Reset Camera View"
              >
                ⟲ Reset Camera
              </button>
            </div>
          ) : (
            // 2D Canvas Fallback View
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/40">
              <span className="text-4xl mb-3">📊</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">2D Schematic View Mode</h3>
              <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                Deterministic thermodynamic calculations, energy balances, and temperature curves update live in the
                analysis panel.
              </p>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 max-w-lg w-full text-left font-mono text-xs text-amber-300 space-y-1">
                <div>// Active Governing Formulation</div>
                {activeTab === 'heat-transfer' && <div>Q = (k * A * ΔT) / L  [Conduction]</div>}
                {activeTab === 'composite-wall' && <div>R_total = R_in + Σ(L_i / k_i*A) + R_out</div>}
                {activeTab === 'heat-exchanger' && <div>Q = ε * C_min * (Th_in - Tc_in)</div>}
                {activeTab === 'steam-boiler' && <div>m_e = [m_a * (h - h_f1)] / 2257  (kg/h)</div>}
                {activeTab === 'refrigeration-cycle' && <div>COP = (h1 - h4) / (h2 - h1)</div>}
                {activeTab === 'energy-calculator' && <div>m_dot * (h1 + V1²/2000) + Q_dot = m_dot * (h2 + V2²/2000) + W_dot</div>}
              </div>
            </div>
          )}

          {/* Floating Key Metrics HUD overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 pointer-events-none z-10">
            {activeTab === 'heat-transfer' && (
              <>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Heat Rate (Q)</div>
                  <div className="text-sm font-mono font-bold text-amber-400">{htResult.heatRateWatts.toFixed(1)} W</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Heat Flux (q")</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{htResult.heatFluxWPerM2.toFixed(1)} W/m²</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Thermal Resistance (R)</div>
                  <div className="text-sm font-mono font-bold text-sky-400">{htResult.thermalResistanceKPerW.toFixed(4)} K/W</div>
                </div>
              </>
            )}

            {activeTab === 'composite-wall' && (
              <>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Resistance (R_th)</div>
                  <div className="text-sm font-mono font-bold text-amber-400">{wallResult.totalThermalResistanceKPerW.toFixed(4)} K/W</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Heat Loss (Q)</div>
                  <div className="text-sm font-mono font-bold text-rose-400">{wallResult.heatRateWatts.toFixed(1)} W</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Overall U-Factor</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{wallResult.overallHeatTransferCoeffWM2K.toFixed(2)} W/m²K</div>
                </div>
              </>
            )}

            {activeTab === 'heat-exchanger' && (
              <>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Duty (Q)</div>
                  <div className="text-sm font-mono font-bold text-amber-400">{hxResult.heatTransferRateKW.toFixed(2)} kW</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">LMTD</div>
                  <div className="text-sm font-mono font-bold text-sky-400">{hxResult.lmtdC.toFixed(2)} °C</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Effectiveness (ε)</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{(hxResult.effectiveness * 100).toFixed(1)}%</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Cold Outlet (Tc,out)</div>
                  <div className="text-sm font-mono font-bold text-cyan-400">{hxResult.coldFluidOutletTempC.toFixed(1)} °C</div>
                </div>
              </>
            )}

            {activeTab === 'steam-boiler' && (
              <>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Boiler Efficiency (η_b)</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{boilerResult.boilerEfficiencyPercent.toFixed(1)}%</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Equiv. Evaporation (m_e)</div>
                  <div className="text-sm font-mono font-bold text-amber-400">{boilerResult.equivalentEvaporationFromAt100C.toFixed(0)} kg/h</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Useful Heat Absorbed</div>
                  <div className="text-sm font-mono font-bold text-sky-400">{boilerResult.usefulHeatAbsorbedKW.toFixed(0)} kW</div>
                </div>
              </>
            )}

            {activeTab === 'refrigeration-cycle' && (
              <>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">COP (Cooling)</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{refResult.copCooling.toFixed(2)}</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Compressor Power</div>
                  <div className="text-sm font-mono font-bold text-rose-400">{refResult.compressorPowerKW.toFixed(2)} kW</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 pointer-events-auto backdrop-blur-md shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Carnot COP</div>
                  <div className="text-sm font-mono font-bold text-sky-400">{refResult.carnotCOP.toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Interactive Parameters, Calculations, & Engineering Theory */}
        <div className="w-full lg:w-96 xl:w-[420px] bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* ── MODULE 1: Heat Transfer Explorer Controls ── */}
            {activeTab === 'heat-transfer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Heat Transfer Mode</h3>
                  <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                    {(['conduction', 'convection', 'radiation'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setHtMode(m)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition cursor-pointer ${
                          htMode === m ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {htMode === 'conduction' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Material</label>
                      <select
                        value={condParams.material}
                        onChange={(e) => setCondParams({ ...condParams, material: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <option value="copper">Copper (k = 386 W/m·K)</option>
                        <option value="aluminum">Aluminum (k = 205 W/m·K)</option>
                        <option value="mild-steel">Mild Steel (k = 54 W/m·K)</option>
                        <option value="stainless-steel">Stainless Steel (k = 16 W/m·K)</option>
                        <option value="refractory-brick">Refractory Brick (k = 1.25 W/m·K)</option>
                        <option value="glass-wool">Glass Wool (k = 0.038 W/m·K)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Hot Side Temperature (T1)</span>
                        <span className="font-mono text-amber-400">{condParams.tempHotC} °C</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="400"
                        step="5"
                        value={condParams.tempHotC}
                        onChange={(e) => setCondParams({ ...condParams, tempHotC: Number(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Cold Side Temperature (T2)</span>
                        <span className="font-mono text-cyan-400">{condParams.tempColdC} °C</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={condParams.tempColdC}
                        onChange={(e) => setCondParams({ ...condParams, tempColdC: Number(e.target.value) })}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Wall Thickness (L)</span>
                        <span className="font-mono text-slate-200">{(condParams.thicknessM * 1000).toFixed(0)} mm</span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.5"
                        step="0.01"
                        value={condParams.thicknessM}
                        onChange={(e) => setCondParams({ ...condParams, thicknessM: Number(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {htMode === 'convection' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Cooling Medium</label>
                      <select
                        value={convParams.fluid}
                        onChange={(e) => setConvParams({ ...convParams, fluid: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <option value="air-free">Air (Natural Convection, h = 8.5 W/m²K)</option>
                        <option value="air-forced">Air (Forced Convection, h = 45 W/m²K)</option>
                        <option value="engine-oil">Engine Oil (Forced, h = 180 W/m²K)</option>
                        <option value="water-forced">Water (Forced Convection, h = 1200 W/m²K)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Surface Temperature (Ts)</span>
                        <span className="font-mono text-amber-400">{convParams.surfaceTempC} °C</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={convParams.surfaceTempC}
                        onChange={(e) => setConvParams({ ...convParams, surfaceTempC: Number(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {htMode === 'radiation' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Surface Emissivity (ε)</span>
                        <span className="font-mono text-rose-400">{radParams.surfaceEmissivity.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.98"
                        step="0.05"
                        value={radParams.surfaceEmissivity}
                        onChange={(e) => setRadParams({ ...radParams, surfaceEmissivity: Number(e.target.value) })}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Surface Temperature (Ts)</span>
                        <span className="font-mono text-amber-400">{radParams.surfaceTempC} °C ({(radParams.surfaceTempC + 273.15).toFixed(1)} K)</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="800"
                        step="10"
                        value={radParams.surfaceTempC}
                        onChange={(e) => setRadParams({ ...radParams, surfaceTempC: Number(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Formulation breakdown */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Governing Formula</div>
                  <div className="font-mono text-amber-300 text-[11px]">{htResult.governingEquation}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{htResult.summaryExplanation}</p>
                </div>
              </div>
            )}

            {/* ── MODULE 2: Composite Wall Controls ── */}
            {activeTab === 'composite-wall' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Layer Resistance Network</h3>
                  <span className="text-[11px] text-slate-400">{wallParams.layers.length} Layers in Series</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Inside Hot Gas Temp</span>
                    <span className="font-mono text-rose-400">{wallParams.insideTempC} °C</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="1200"
                    step="20"
                    value={wallParams.insideTempC}
                    onChange={(e) => setWallParams({ ...wallParams, insideTempC: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Outside Ambient Temp</span>
                    <span className="font-mono text-cyan-400">{wallParams.outsideTempC} °C</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={wallParams.outsideTempC}
                    onChange={(e) => setWallParams({ ...wallParams, outsideTempC: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* Layer Breakdown List */}
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Layer Resistance &amp; Interface Drops</div>
                  {wallResult.layerCalculations.map((c) => (
                    <div key={c.layerId} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{c.name}</span>
                        <span className="text-amber-400 font-mono">{c.percentResistance.toFixed(1)}% R</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Thickness: {(c.thicknessM * 1000).toFixed(0)} mm</span>
                        <span>ΔT: {c.tempDropC.toFixed(1)} °C</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Left: {c.interfaceTempLeftC.toFixed(1)}°C</span>
                        <span>Right: {c.interfaceTempRightC.toFixed(1)}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MODULE 3: Heat Exchanger Controls ── */}
            {activeTab === 'heat-exchanger' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Flow Arrangement</h3>
                  <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                    {(['counter', 'parallel'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setHxParams({ ...hxParams, flowType: f })}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition cursor-pointer ${
                          hxParams.flowType === f ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Hot Fluid Inlet Temp (Th,in)</span>
                      <span className="font-mono text-rose-400">{hxParams.hotFluidInletTempC} °C</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="150"
                      value={hxParams.hotFluidInletTempC}
                      onChange={(e) => setHxParams({ ...hxParams, hotFluidInletTempC: Number(e.target.value) })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Cold Fluid Inlet Temp (Tc,in)</span>
                      <span className="font-mono text-cyan-400">{hxParams.coldFluidInletTempC} °C</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={hxParams.coldFluidInletTempC}
                      onChange={(e) => setHxParams({ ...hxParams, coldFluidInletTempC: Number(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Overall U-Factor</span>
                      <span className="font-mono text-slate-200">{hxParams.overallHeatTransferCoeffWM2K} W/m²K</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="1500"
                      step="50"
                      value={hxParams.overallHeatTransferCoeffWM2K}
                      onChange={(e) => setHxParams({ ...hxParams, overallHeatTransferCoeffWM2K: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Heat Transfer Area (A)</span>
                      <span className="font-mono text-slate-200">{hxParams.surfaceAreaM2} m²</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="15.0"
                      step="0.5"
                      value={hxParams.surfaceAreaM2}
                      onChange={(e) => setHxParams({ ...hxParams, surfaceAreaM2: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">LMTD &amp; NTU Method Breakdown</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity Ratio (Cr = Cmin/Cmax):</span>
                    <span className="font-mono text-slate-200">{hxResult.capacityRatioC.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Number of Transfer Units (NTU):</span>
                    <span className="font-mono text-slate-200">{hxResult.ntu.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Energy Balance Discrepancy:</span>
                    <span className="font-mono text-emerald-400">{hxResult.energyBalanceDiscrepancyWatts.toFixed(2)} W (&lt; 0.01%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── MODULE 4: Steam Boilers Controls ── */}
            {activeTab === 'steam-boiler' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Industrial Boiler Setup</h3>
                  <span className="text-[11px] text-slate-400">{boilerParams.boilerType}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Operating Pressure</span>
                      <span className="font-mono text-amber-400">{boilerParams.operatingPressureBar} bar</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="35"
                      step="1"
                      value={boilerParams.operatingPressureBar}
                      onChange={(e) => setBoilerParams({ ...boilerParams, operatingPressureBar: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Steam Generation Rate (ma)</span>
                      <span className="font-mono text-slate-200">{boilerParams.steamGenerationRateKgH} kg/h</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="8000"
                      step="250"
                      value={boilerParams.steamGenerationRateKgH}
                      onChange={(e) => setBoilerParams({ ...boilerParams, steamGenerationRateKgH: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Feedwater Temperature</span>
                      <span className="font-mono text-cyan-400">{boilerParams.feedwaterTempC} °C</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      value={boilerParams.feedwaterTempC}
                      onChange={(e) => setBoilerParams({ ...boilerParams, feedwaterTempC: Number(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Heat Balance Sheet Table */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">First Law Heat Balance Sheet</div>
                  {boilerResult.heatBalanceSheet.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs flex justify-between">
                      <span className="text-slate-300 truncate max-w-[240px]">{item.category}</span>
                      <span className="font-mono font-bold text-amber-400">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MODULE 5: Refrigeration Cycle Controls ── */}
            {activeTab === 'refrigeration-cycle' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">VCR Parameters</h3>
                  <span className="text-[11px] text-slate-400">{refParams.refrigerant}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Evaporator Temp (T_evap)</span>
                      <span className="font-mono text-cyan-400">{refParams.evaporatorTempC} °C</span>
                    </div>
                    <input
                      type="range"
                      min="-25"
                      max="10"
                      value={refParams.evaporatorTempC}
                      onChange={(e) => setRefParams({ ...refParams, evaporatorTempC: Number(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Condenser Temp (T_cond)</span>
                      <span className="font-mono text-rose-400">{refParams.condenserTempC} °C</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="65"
                      value={refParams.condenserTempC}
                      onChange={(e) => setRefParams({ ...refParams, condenserTempC: Number(e.target.value) })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Cooling Capacity</span>
                      <span className="font-mono text-slate-200">{refParams.coolingCapacityKW} kW</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={refParams.coolingCapacityKW}
                      onChange={(e) => setRefParams({ ...refParams, coolingCapacityKW: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* State Points */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">State Points (P-h / T-s)</div>
                  {refResult.statePoints.map((sp) => (
                    <div key={sp.point} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs flex justify-between">
                      <span className="text-slate-300">Point {sp.point}: {sp.description}</span>
                      <span className="font-mono text-amber-400">{sp.enthalpyKJPerKg.toFixed(1)} kJ/kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MODULE 6: Energy Balance Calculator ── */}
            {activeTab === 'energy-calculator' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Device Selection</h3>
                  <select
                    value={energyInput.systemType}
                    onChange={(e) => setEnergyInput({ ...energyInput, systemType: e.target.value as any })}
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="steam-turbine">Steam Turbine</option>
                    <option value="compressor">Air Compressor</option>
                    <option value="nozzle">Flow Nozzle</option>
                    <option value="heat-exchanger">Heat Exchanger</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Mass Flow Rate (m_dot)</span>
                      <span className="font-mono text-slate-200">{energyInput.massFlowRateKgS} kg/s</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="20"
                      step="0.2"
                      value={energyInput.massFlowRateKgS}
                      onChange={(e) => setEnergyInput({ ...energyInput, massFlowRateKgS: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Step-by-step Derivations */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Step-by-Step SFEE Derivation</div>
                  {energyResult.stepByStepDerivations.map((step, idx) => (
                    <div key={idx} className="text-[11px] text-slate-300 font-mono leading-relaxed">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MODULE 7: Virtual Lab Trials ── */}
            {activeTab === 'thermal-lab' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Observation Table</h3>
                  <button
                    onClick={exportTrialsCSV}
                    disabled={trials.length === 0}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition cursor-pointer"
                  >
                    Export CSV
                  </button>
                </div>

                {trials.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                    No trials recorded yet. Click &quot;Log Trial&quot; in the header bar during simulation runs.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {trials.map((t) => (
                      <div key={t.id} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-amber-400">
                          <span>{t.experimentName}</span>
                          <span className="text-slate-400 text-[10px]">{t.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          {JSON.stringify(t.results)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MODULE 8: 3D Virtual Bay ── */}
            {activeTab === 'virtual-bay' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Digital Twin Stations</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Focus on dedicated industrial testing rigs across the digital twin workshop floor:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Overview Bay' },
                    { id: 'conduction', label: 'Conduction Stand' },
                    { id: 'exchanger', label: 'Heat Exchanger Rig' },
                    { id: 'boiler', label: 'Steam Boiler' },
                    { id: 'refrigeration', label: 'VCR Chiller' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => sceneRef.current?.setParameters({ station: s.id as any })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer text-left"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Conceptual Evaluation Quiz Modal ─── */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <h3 className="text-sm font-bold text-white">Thermal Engineering Evaluation Quiz</h3>
              </div>
              <button
                onClick={() => setShowQuiz(false)}
                className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <div className="font-semibold text-slate-200 leading-relaxed">
                    {idx + 1}. {q.question}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      const isGraded = quizScore !== null;
                      const isCorrect = optIdx === q.correctAnswer;
                      let btnClass = 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700';

                      if (isGraded) {
                        if (isCorrect) btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
                        else if (isSelected && !isCorrect) btnClass = 'bg-rose-950/80 border-rose-500 text-rose-300';
                      } else if (isSelected) {
                        btnClass = 'bg-amber-500/20 border-amber-500 text-amber-300';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizScore !== null}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                          className={`w-full text-left p-2.5 rounded-lg border transition text-xs flex items-center gap-2 cursor-pointer ${btnClass}`}
                        >
                          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-black/30">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizScore !== null && (
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 mt-1">
                      <span className="font-bold text-emerald-400">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {quizScore !== null && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                  <div className="text-xl font-bold text-emerald-300">
                    Your Score: {quizScore} / {quizQuestions.length} ({((quizScore / quizQuestions.length) * 100).toFixed(0)}%)
                  </div>
                  <p className="text-xs text-emerald-400">
                    {quizScore >= 4 ? 'Excellent! You have demonstrated strong thermal engineering competency.' : 'Review the explanations and replay the simulations to reinforce your understanding.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-850">
              {quizScore === null ? (
                <button
                  onClick={handleGradeQuiz}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
                >
                  Grade Quiz
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setQuizScore(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition cursor-pointer"
                >
                  Retake Quiz
                </button>
              )}
              <button
                onClick={() => setShowQuiz(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
