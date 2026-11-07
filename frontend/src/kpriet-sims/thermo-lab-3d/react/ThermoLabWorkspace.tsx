/**
 * Master React Workspace for Engineering Thermodynamics (U25MEG04)
 * Autonomous R2025 Syllabus / Anna University Aligned
 * 8 Interactive Modules with 3D Three.js Studio, Real-time Thermodynamic Equations,
 * Dynamic SVG P-V/T-s Charts, Observation Logger & CSV Export, Concept Quiz & Printable Lab Report.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThermodynamicsCalculator } from '../core/ThermodynamicsCalculator';
import type {
  ThermodynamicProcessType,
  SteadyFlowDeviceType,
  ThermalDeviceType,
  GasCycleType,
  PsychrometricProcessType,
  ThermodynamicStatePoint,
} from '../core/types';

// Three.js Scenes
import { SystemEnergyTransferScene } from '../simulations/01-energy-transfer/SystemEnergyTransferScene';
import { ThermodynamicProcessesScene } from '../simulations/02-processes/ThermodynamicProcessesScene';
import { SteadyFlowEnergyScene } from '../simulations/03-sfee/SteadyFlowEnergyScene';
import { SecondLawHeatEngineScene } from '../simulations/04-second-law/SecondLawHeatEngineScene';
import { PureSubstanceSteamScene } from '../simulations/06-steam-properties/PureSubstanceSteamScene';
import { RankinePowerPlantScene } from '../simulations/07-rankine-cycle/RankinePowerPlantScene';
import { GasPowerCyclesScene } from '../simulations/05-gas-cycles/GasPowerCyclesScene';
import { PsychrometricHvacScene } from '../simulations/08-psychrometry/PsychrometricHvacScene';

export interface ThermoLabWorkspaceProps {
  initialModuleId?: string;
  onNavigateHome?: () => void;
}

interface ObservationRecord {
  id: string;
  timestamp: string;
  module: string;
  param1: string;
  param2: string;
  param3: string;
  output1: string;
  output2: string;
  output3: string;
  efficiencyOrCOP: string;
}

export const ThermoLabWorkspace: React.FC<ThermoLabWorkspaceProps> = ({
  initialModuleId = 'u25meg04-energy-transfer',
  onNavigateHome,
}) => {
  // Active Module State
  const [activeModule, setActiveModule] = useState<string>(initialModuleId);

  // Sync module if prop changes
  useEffect(() => {
    if (initialModuleId) setActiveModule(initialModuleId);
  }, [initialModuleId]);

  // Canvas DOM ref & Active Scene instance
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const activeSceneRef = useRef<any>(null);

  // -------------------------------------------------------------
  // MODULE SPECIFIC PARAMETER STATES
  // -------------------------------------------------------------
  // Unit I - System & Energy Transfer
  const [sysType, setSysType] = useState<'closed' | 'open' | 'isolated'>('closed');
  const [qIn, setQIn] = useState<number>(50); // kJ
  const [wShaft, setWShaft] = useState<number>(10); // kJ
  const [wBoundary, setWBoundary] = useState<number>(25); // kJ
  const [initialEnergy, setInitialEnergy] = useState<number>(100); // kJ

  // Unit I - Processes
  const [procType, setProcType] = useState<ThermodynamicProcessType>('isentropic');
  const [procP1, setProcP1] = useState<number>(100); // kPa
  const [procV1, setProcV1] = useState<number>(0.1); // m^3
  const [procV2, setProcV2] = useState<number>(0.25); // m^3
  const [procT1, setProcT1] = useState<number>(300); // K
  const [procPolytropicN, setProcPolytropicN] = useState<number>(1.3);

  // Unit I - SFEE
  const [sfeeDevice, setSfeeDevice] = useState<SteadyFlowDeviceType>('turbine');
  const [sfeeMassFlow, setSfeeMassFlow] = useState<number>(5.0); // kg/s
  const [sfeeH1, setSfeeH1] = useState<number>(3200); // kJ/kg
  const [sfeeH2, setSfeeH2] = useState<number>(2300); // kJ/kg
  const [sfeeV1, setSfeeV1] = useState<number>(30); // m/s
  const [sfeeV2, setSfeeV2] = useState<number>(80); // m/s
  const [sfeeZ1, setSfeeZ1] = useState<number>(5); // m
  const [sfeeZ2, setSfeeZ2] = useState<number>(2); // m
  const [sfeeQDot, setSfeeQDot] = useState<number>(-20); // kW heat loss

  // Unit II - Second Law & Cycles
  const [thermalDevice, setThermalDevice] = useState<ThermalDeviceType>('heat-engine');
  const [thSourceK, setThSourceK] = useState<number>(850);
  const [tlSinkK, setTlSinkK] = useState<number>(300);
  const [qhInputKJ, setQhInputKJ] = useState<number>(1000);
  const [wActualKJ, setWActualKJ] = useState<number>(450);

  // Unit III - Pure Substance Steam
  const [steamPressureBar, setSteamPressureBar] = useState<number>(15);
  const [steamDrynessX, setSteamDrynessX] = useState<number>(0.85);
  const [steamTempC, setSteamTempC] = useState<number>(200);

  // Unit IV - Rankine Cycle
  const [rankinePBoilerBar, setRankinePBoilerBar] = useState<number>(100);
  const [rankinePCondenserBar, setRankinePCondenserBar] = useState<number>(0.1);
  const [rankineTMaxC, setRankineTMaxC] = useState<number>(500);
  const [rankineIsReheat, setRankineIsReheat] = useState<boolean>(false);

  // Unit V - Gas Power Cycles
  const [gasCycle, setGasCycle] = useState<GasCycleType>('otto');
  const [compRatio, setCompRatio] = useState<number>(8.5);
  const [cutOffRatio, setCutOffRatio] = useState<number>(2.0);
  const [pressureRatio, setPressureRatio] = useState<number>(8.0);
  const [p1KPa, setP1KPa] = useState<number>(101.3);
  const [t1K, setT1K] = useState<number>(300);
  const [t3K, setT3K] = useState<number>(1800);

  // Unit IV/V - Psychrometry
  const [psychProcess, setPsychProcess] = useState<PsychrometricProcessType>('cooling-dehumidification');
  const [psychDryBulbC, setPsychDryBulbC] = useState<number>(32);
  const [psychRelativeHumPct, setPsychRelativeHumPct] = useState<number>(65);

  // Observation Table
  const [observations, setObservations] = useState<ObservationRecord[]>([]);

  // Print Report Modal
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('Piyush Dhara');
  const [regNo, setRegNo] = useState<string>('920421104018');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // -------------------------------------------------------------
  // CALCULATIONS RUN VIA THERMODYNAMICS CALCULATOR
  // -------------------------------------------------------------
  const energyTransferResult = useMemo(() => {
    return ThermodynamicsCalculator.calculateSystemEnergy({
      systemType: sysType,
      qIn,
      wShaft,
      wBoundary,
      initialInternalEnergy: initialEnergy,
    });
  }, [sysType, qIn, wShaft, wBoundary, initialEnergy]);

  const processResult = useMemo(() => {
    return ThermodynamicsCalculator.calculateProcess({
      processType: procType,
      p1KPa: procP1,
      v1M3: procV1,
      v2M3: procV2,
      t1K: procT1,
      polytropicN: procPolytropicN,
    });
  }, [procType, procP1, procV1, procV2, procT1, procPolytropicN]);

  const sfeeResult = useMemo(() => {
    return ThermodynamicsCalculator.calculateSFEE({
      deviceType: sfeeDevice,
      massFlowRateKgS: sfeeMassFlow,
      h1KJkg: sfeeH1,
      h2KJkg: sfeeH2,
      c1MS: sfeeV1,
      c2MS: sfeeV2,
      z1M: sfeeZ1,
      z2M: sfeeZ2,
      qDotKW: sfeeQDot,
    });
  }, [sfeeDevice, sfeeMassFlow, sfeeH1, sfeeH2, sfeeV1, sfeeV2, sfeeZ1, sfeeZ2, sfeeQDot]);

  const secondLawResult = useMemo(() => {
    return ThermodynamicsCalculator.calculateSecondLaw({
      deviceType: thermalDevice,
      thSourceK,
      tlSinkK,
      qhKJ: qhInputKJ,
      wActualKJ,
    });
  }, [thermalDevice, thSourceK, tlSinkK, qhInputKJ, wActualKJ]);

  const steamResult = useMemo(() => {
    return ThermodynamicsCalculator.calculateSteamProperties({
      pressureBar: steamPressureBar,
      drynessFraction: steamDrynessX,
      temperatureC: steamTempC,
    });
  }, [steamPressureBar, steamDrynessX, steamTempC]);

  const rankineResult = useMemo(() => {
    return ThermodynamicsCalculator.calculateRankineCycle({
      boilerPressureBar: rankinePBoilerBar,
      condenserPressureBar: rankinePCondenserBar,
      maxTurbineInletTempC: rankineTMaxC,
      isReheat: rankineIsReheat,
    });
  }, [rankinePBoilerBar, rankinePCondenserBar, rankineTMaxC, rankineIsReheat]);

  const gasCycleResult = useMemo(() => {
    return ThermodynamicsCalculator.calculateGasCycle({
      cycleType: gasCycle,
      compressionRatio: compRatio,
      cutOffRatio,
      pressureRatio,
      p1KPa,
      t1K,
      t3K,
    });
  }, [gasCycle, compRatio, cutOffRatio, pressureRatio, p1KPa, t1K, t3K]);

  const psychResult = useMemo(() => {
    return ThermodynamicsCalculator.calculatePsychrometry({
      dryBulbTempC: psychDryBulbC,
      relativeHumidityPct: psychRelativeHumPct,
      processType: psychProcess,
    });
  }, [psychDryBulbC, psychRelativeHumPct, psychProcess]);

  // -------------------------------------------------------------
  // THREE.JS SCENE LIFECYCLE MANAGEMENT
  // -------------------------------------------------------------
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Dispose prior scene
    if (activeSceneRef.current) {
      activeSceneRef.current.dispose();
      activeSceneRef.current = null;
    }

    const container = canvasContainerRef.current;
    container.innerHTML = ''; // clear

    let sceneInstance: any = null;

    switch (activeModule) {
      case 'u25meg04-energy-transfer':
        sceneInstance = new SystemEnergyTransferScene(container);
        break;
      case 'u25meg04-processes':
        sceneInstance = new ThermodynamicProcessesScene(container);
        break;
      case 'u25meg04-sfee':
        sceneInstance = new SteadyFlowEnergyScene(container);
        break;
      case 'u25meg04-second-law':
        sceneInstance = new SecondLawHeatEngineScene(container);
        break;
      case 'u25meg04-steam-properties':
        sceneInstance = new PureSubstanceSteamScene(container);
        break;
      case 'u25meg04-rankine-cycle':
        sceneInstance = new RankinePowerPlantScene(container);
        break;
      case 'u25meg04-gas-power-cycles':
        sceneInstance = new GasPowerCyclesScene(container);
        break;
      case 'u25meg04-psychrometry-hvac':
        sceneInstance = new PsychrometricHvacScene(container);
        break;
      default:
        sceneInstance = new SystemEnergyTransferScene(container);
    }

    activeSceneRef.current = sceneInstance;

    return () => {
      if (activeSceneRef.current) {
        activeSceneRef.current.dispose();
        activeSceneRef.current = null;
      }
    };
  }, [activeModule]);

  // Update scene parameters when controls change
  useEffect(() => {
    if (!activeSceneRef.current) return;

    if (activeModule === 'u25meg04-energy-transfer') {
      activeSceneRef.current.updateParameters({
        volumeRatio: 1.0 + (wBoundary / 50) * 0.5,
        temperatureK: 300 + (qIn / 100) * 200,
        isHeating: qIn > 0,
        isStirring: wShaft > 0,
      });
    } else if (activeModule === 'u25meg04-processes') {
      activeSceneRef.current.updateParameters({
        processType: procType,
        volumeM3: procV2,
        initialVolumeM3: procV1,
      });
    } else if (activeModule === 'u25meg04-sfee') {
      activeSceneRef.current.updateParameters({
        deviceType: sfeeDevice,
      });
    } else if (activeModule === 'u25meg04-second-law') {
      activeSceneRef.current.updateParameters({
        deviceType: thermalDevice,
        hotTempK: thSourceK,
        coldTempK: tlSinkK,
      });
    } else if (activeModule === 'u25meg04-steam-properties') {
      activeSceneRef.current.updateParameters({
        drynessFraction: steamDrynessX,
        pressureBar: steamPressureBar,
      });
    } else if (activeModule === 'u25meg04-rankine-cycle') {
      activeSceneRef.current.updateParameters({
        isReheat: rankineIsReheat,
        boilerPressureBar: rankinePBoilerBar,
        condenserPressureBar: rankinePCondenserBar,
      });
    } else if (activeModule === 'u25meg04-gas-power-cycles') {
      activeSceneRef.current.updateParameters({
        cycleType: gasCycle,
        compressionRatio: compRatio,
      });
    } else if (activeModule === 'u25meg04-psychrometry-hvac') {
      activeSceneRef.current.updateParameters({
        processType: psychProcess,
        dryBulbC: psychDryBulbC,
        relativeHumidityPct: psychRelativeHumPct,
      });
    }
  }, [
    activeModule,
    sysType,
    qIn,
    wShaft,
    wBoundary,
    procType,
    procV1,
    procV2,
    sfeeDevice,
    thermalDevice,
    thSourceK,
    tlSinkK,
    steamPressureBar,
    steamDrynessX,
    rankineIsReheat,
    rankinePBoilerBar,
    rankinePCondenserBar,
    gasCycle,
    compRatio,
    psychProcess,
    psychDryBulbC,
    psychRelativeHumPct,
  ]);

  // Log observation
  const handleLogObservation = () => {
    let p1 = '', p2 = '', p3 = '', o1 = '', o2 = '', o3 = '', eff = '';

    if (activeModule === 'u25meg04-energy-transfer') {
      p1 = `Sys: ${sysType}`;
      p2 = `Q_in: ${qIn} kJ`;
      p3 = `W_net: ${wBoundary + wShaft} kJ`;
      o1 = `ΔU: ${energyTransferResult.deltaU.toFixed(1)} kJ`;
      o2 = `U2: ${energyTransferResult.finalInternalEnergy.toFixed(1)} kJ`;
      o3 = `Mode: ${energyTransferResult.boundaryWorkInteraction}`;
      eff = 'N/A';
    } else if (activeModule === 'u25meg04-processes') {
      p1 = `Type: ${procType}`;
      p2 = `P1: ${procP1} kPa, V1: ${procV1} m³`;
      p3 = `V2: ${procV2} m³`;
      o1 = `P2: ${processResult.p2KPa.toFixed(1)} kPa`;
      o2 = `T2: ${processResult.t2K.toFixed(1)} K`;
      o3 = `W: ${processResult.workKJ.toFixed(2)} kJ`;
      eff = `Q: ${processResult.heatKJ.toFixed(2)} kJ`;
    } else if (activeModule === 'u25meg04-sfee') {
      p1 = `Device: ${sfeeDevice}`;
      p2 = `h1: ${sfeeH1} kJ/kg`;
      p3 = `h2: ${sfeeH2} kJ/kg`;
      o1 = `m_dot: ${sfeeMassFlow} kg/s`;
      o2 = `ΔKE: ${(sfeeResult.deltaKineticEnergy / 1000).toFixed(2)} kW`;
      o3 = `Work: ${sfeeResult.workTransferKW.toFixed(1)} kW`;
      eff = `${sfeeResult.engineeringSummary.slice(0, 25)}...`;
    } else if (activeModule === 'u25meg04-second-law') {
      p1 = `Mode: ${thermalDevice}`;
      p2 = `TH: ${thSourceK} K`;
      p3 = `TL: ${tlSinkK} K`;
      o1 = `Carnot η: ${(secondLawResult.carnotEfficiency * 100).toFixed(1)}%`;
      o2 = `Actual η: ${(secondLawResult.actualEfficiency * 100).toFixed(1)}%`;
      o3 = `S_gen: ${secondLawResult.entropyGeneratedKJ_K.toFixed(3)} kJ/K`;
      eff = secondLawResult.isPossible ? 'Reversible/Real' : 'Impossible';
    } else if (activeModule === 'u25meg04-steam-properties') {
      p1 = `P: ${steamPressureBar} bar`;
      p2 = `x: ${steamDrynessX}`;
      p3 = `T: ${steamTempC} °C`;
      o1 = `hf: ${steamResult.hf.toFixed(1)} kJ/kg`;
      o2 = `h: ${steamResult.h.toFixed(1)} kJ/kg`;
      o3 = `s: ${steamResult.s.toFixed(3)} kJ/kg.K`;
      eff = steamResult.phaseState;
    } else if (activeModule === 'u25meg04-rankine-cycle') {
      p1 = `P_boiler: ${rankinePBoilerBar} bar`;
      p2 = `P_cond: ${rankinePCondenserBar} bar`;
      p3 = `Reheat: ${rankineIsReheat ? 'Yes' : 'No'}`;
      o1 = `W_turb: ${rankineResult.turbineWorkKJkg.toFixed(1)} kJ/kg`;
      o2 = `Q_in: ${rankineResult.heatSuppliedKJkg.toFixed(1)} kJ/kg`;
      o3 = `SSC: ${rankineResult.specificSteamConsumptionKgKWh.toFixed(2)} kg/kWh`;
      eff = `${(rankineResult.thermalEfficiency * 100).toFixed(2)}%`;
    } else if (activeModule === 'u25meg04-gas-power-cycles') {
      p1 = `Cycle: ${gasCycle}`;
      p2 = `r: ${compRatio}`;
      p3 = `T3: ${t3K} K`;
      o1 = `W_net: ${gasCycleResult.netWorkKJkg.toFixed(1)} kJ/kg`;
      o2 = `MEP: ${gasCycleResult.meanEffectivePressureKPa.toFixed(1)} kPa`;
      o3 = `Carnot η: ${(gasCycleResult.carnotEfficiencyLimit * 100).toFixed(1)}%`;
      eff = `${(gasCycleResult.airStandardEfficiency * 100).toFixed(2)}%`;
    } else if (activeModule === 'u25meg04-psychrometry-hvac') {
      p1 = `DBT: ${psychDryBulbC} °C`;
      p2 = `RH: ${psychRelativeHumPct}%`;
      p3 = `Process: ${psychProcess}`;
      o1 = `WBT: ${psychResult.wetBulbTempC.toFixed(1)} °C`;
      o2 = `DPT: ${psychResult.dewPointTempC.toFixed(1)} °C`;
      o3 = `ω: ${(psychResult.humidityRatioKgKg * 1000).toFixed(2)} g/kg`;
      eff = `h: ${psychResult.enthalpyKJkg.toFixed(1)} kJ/kg`;
    }

    const newRecord: ObservationRecord = {
      id: `OBS-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      module: activeModule.replace('u25meg04-', '').toUpperCase(),
      param1: p1,
      param2: p2,
      param3: p3,
      output1: o1,
      output2: o2,
      output3: o3,
      efficiencyOrCOP: eff,
    };

    setObservations((prev) => [newRecord, ...prev.slice(0, 19)]);
  };

  const handleExportCSV = () => {
    if (observations.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Module', 'Param 1', 'Param 2', 'Param 3', 'Output 1', 'Output 2', 'Output 3', 'Efficiency / State'];
    const rows = observations.map((o) => [
      o.id,
      o.timestamp,
      o.module,
      `"${o.param1}"`,
      `"${o.param2}"`,
      `"${o.param3}"`,
      `"${o.output1}"`,
      `"${o.output2}"`,
      `"${o.output3}"`,
      `"${o.efficiencyOrCOP}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thermodynamics_observations_${activeModule}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // CONCEPTUAL ASSESSMENT QUESTIONS
  // -------------------------------------------------------------
  const questions = [
    {
      q: 'Which of the following processes requires zero boundary work (∫ P dV = 0)?',
      opts: ['Isobaric expansion', 'Isochoric heating', 'Isothermal compression', 'Isentropic expansion'],
      correct: 1,
      explanation: 'In an isochoric (constant volume) process, dV = 0, therefore mechanical boundary work W = ∫ P dV = 0.',
    },
    {
      q: 'According to the Kelvin-Planck statement of the Second Law of Thermodynamics, it is impossible for any cyclic device to:',
      opts: [
        'Produce net work while interacting with a single thermal reservoir',
        'Transfer heat from a low-temperature to a high-temperature reservoir without work input',
        'Have an entropy change less than zero for an isolated system',
        'Achieve an efficiency greater than 100%',
      ],
      correct: 0,
      explanation: 'Kelvin-Planck states that no heat engine can produce net work while operating in a cycle and exchanging heat with only a single reservoir.',
    },
    {
      q: 'For an ideal gas undergoing an isentropic process with γ = 1.4, if the volume is halved, the pressure increases by a factor of:',
      opts: ['2.0', '2.64', '1.4', '4.0'],
      correct: 1,
      explanation: 'P1 * V1^γ = P2 * V2^γ => P2/P1 = (V1/V2)^γ = (2)^1.4 ≈ 2.639.',
    },
    {
      q: 'In a steam power plant operating on the Rankine cycle, what is the primary benefit of adding steam reheat between turbine stages?',
      opts: [
        'Decreases boiler pressure requirement',
        'Increases steam dryness fraction at turbine exhaust and improves thermal efficiency',
        'Eliminates the need for a condenser',
        'Prevents pump cavitation by subcooling water',
      ],
      correct: 1,
      explanation: 'Reheating elevates steam quality (dryness fraction x > 0.88) at low-pressure turbine exit, preventing blade erosion while increasing net thermal efficiency.',
    },
    {
      q: 'On a psychrometric chart, sensible cooling of moist air without moisture removal follows a horizontal path moving:',
      opts: ['From right to left at constant humidity ratio ω', 'From left to right along constant dry bulb', 'Vertically upwards along constant relative humidity', 'Diagonally along constant enthalpy line'],
      correct: 0,
      explanation: 'Sensible cooling decreases dry bulb temperature while moisture content (humidity ratio ω) remains constant, resulting in a horizontal path from right to left toward the saturation curve.',
    },
  ];

  const handleSelectQuiz = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const quizScore = useMemo(() => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    return score;
  }, [quizAnswers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#070d1e', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      {/* 1. TOP NAVIGATION HEADER */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              style={{ padding: '6px 12px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              ← Back
            </button>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ padding: '2px 8px', background: '#ef4444', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>U25MEG04</span>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Engineering Thermodynamics Virtual 3D Laboratory
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Autonomous R2025 / Anna University • Units I–V: Pure Substances, First & Second Laws, Gas Cycles, HVAC
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => activeSceneRef.current?.resetCamera()}
            style={{ padding: '7px 14px', background: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Reset View
          </button>
          <button
            onClick={handleLogObservation}
            style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)' }}
          >
            + Log Trial
          </button>
          <button
            onClick={() => setIsReportOpen(true)}
            style={{ padding: '7px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}
          >
            Print Practical Report
          </button>
        </div>
      </header>

      {/* 2. MODULE SELECTOR TABS */}
      <nav style={{ display: 'flex', gap: '6px', padding: '8px 20px', background: '#0a1128', borderBottom: '1px solid #1e293b', overflowX: 'auto' }}>
        {[
          { id: 'u25meg04-energy-transfer', name: '1. Systems & Energy (Unit I)' },
          { id: 'u25meg04-processes', name: '2. Gas Processes (P-V-T)' },
          { id: 'u25meg04-sfee', name: '3. SFEE Open Systems' },
          { id: 'u25meg04-second-law', name: '4. Second Law & Heat Engines' },
          { id: 'u25meg04-steam-properties', name: '5. Pure Substance Steam (Unit III)' },
          { id: 'u25meg04-rankine-cycle', name: '6. Rankine Power Plant' },
          { id: 'u25meg04-gas-power-cycles', name: '7. Gas Cycles (Otto/Diesel/Brayton)' },
          { id: 'u25meg04-psychrometry-hvac', name: '8. Psychrometry & HVAC' },
        ].map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              style={{
                padding: '6px 14px',
                background: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {m.name}
            </button>
          );
        })}
      </nav>

      {/* 3. MAIN WORKSPACE: 3-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT COLUMN: PARAMETER CONTROL PANEL */}
        <aside style={{ background: '#0b1329', borderRight: '1px solid #1e293b', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Parameters & Controls
            </h2>
            <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              Live Model
            </span>
          </div>

          {/* DYNAMIC PARAMETER FORM PER MODULE */}
          {activeModule === 'u25meg04-energy-transfer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>System Boundary Type</label>
                <select
                  value={sysType}
                  onChange={(e) => setSysType(e.target.value as any)}
                  style={{ width: '100%', padding: '7px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                >
                  <option value="closed">Closed System (Energy transfer only)</option>
                  <option value="open">Open System / Control Volume (Mass & Energy)</option>
                  <option value="isolated">Isolated System (No Mass, No Energy)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Heat Input (Q_in):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{qIn} kJ</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={qIn}
                  onChange={(e) => setQIn(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Shaft Stirrer Work (W_s):</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>{wShaft} kJ</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="2"
                  value={wShaft}
                  onChange={(e) => setWShaft(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Boundary Piston Work (W_b):</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{wBoundary} kJ</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={wBoundary}
                  onChange={(e) => setWBoundary(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeModule === 'u25meg04-processes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Process Trajectory</label>
                <select
                  value={procType}
                  onChange={(e) => setProcType(e.target.value as any)}
                  style={{ width: '100%', padding: '7px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                >
                  <option value="isobaric">Isobaric (P = C, W = P ΔV)</option>
                  <option value="isochoric">Isochoric (V = C, W = 0)</option>
                  <option value="isothermal">Isothermal (T = C, PV = C)</option>
                  <option value="isentropic">Isentropic / Reversible Adiabatic (PV^γ = C)</option>
                  <option value="polytropic">Polytropic (PV^n = C)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Initial Pressure P1:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{procP1} kPa</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={procP1}
                  onChange={(e) => setProcP1(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Initial Volume V1:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{procV1.toFixed(2)} m³</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={procV1}
                  onChange={(e) => setProcV1(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Final Volume V2:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{procV2.toFixed(2)} m³</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.01"
                  value={procV2}
                  onChange={(e) => setProcV2(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {procType === 'polytropic' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Polytropic Index (n):</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>{procPolytropicN.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="1.6"
                    step="0.02"
                    value={procPolytropicN}
                    onChange={(e) => setProcPolytropicN(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          )}

          {activeModule === 'u25meg04-sfee' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Control Volume Device</label>
                <select
                  value={sfeeDevice}
                  onChange={(e) => setSfeeDevice(e.target.value as any)}
                  style={{ width: '100%', padding: '7px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                >
                  <option value="turbine">Steam / Gas Turbine (Work Producer)</option>
                  <option value="compressor">Centrifugal Compressor (Work Consumer)</option>
                  <option value="nozzle">De Laval Nozzle (Kinetic Accelerating)</option>
                  <option value="diffuser">Diffuser (Pressure Recovery)</option>
                  <option value="boiler">Boiler (Heat Addition)</option>
                  <option value="condenser">Condenser (Heat Rejection)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Mass Flow Rate (m_dot):</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{sfeeMassFlow} kg/s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={sfeeMassFlow}
                  onChange={(e) => setSfeeMassFlow(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Inlet Enthalpy (h1):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{sfeeH1} kJ/kg</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="3600"
                  step="50"
                  value={sfeeH1}
                  onChange={(e) => setSfeeH1(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Exit Enthalpy (h2):</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{sfeeH2} kJ/kg</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="3200"
                  step="50"
                  value={sfeeH2}
                  onChange={(e) => setSfeeH2(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeModule === 'u25meg04-second-law' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Thermal Machine Mode</label>
                <select
                  value={thermalDevice}
                  onChange={(e) => setThermalDevice(e.target.value as any)}
                  style={{ width: '100%', padding: '7px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                >
                  <option value="heat-engine">Heat Engine (Produces Work W)</option>
                  <option value="refrigerator">Refrigerator (Extracts Q_L from cold space)</option>
                  <option value="heat-pump">Heat Pump (Delivers Q_H to warm space)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Hot Source Temp (TH):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{thSourceK} K</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1500"
                  step="25"
                  value={thSourceK}
                  onChange={(e) => setThSourceK(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Cold Sink Temp (TL):</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{tlSinkK} K</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="350"
                  step="5"
                  value={tlSinkK}
                  onChange={(e) => setTlSinkK(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Heat Supplied (QH):</span>
                  <span style={{ color: '#f97316', fontWeight: 600 }}>{qhInputKJ} kJ</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={qhInputKJ}
                  onChange={(e) => setQhInputKJ(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeModule === 'u25meg04-steam-properties' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Steam Pressure (P):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{steamPressureBar} bar</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="150"
                  step="1"
                  value={steamPressureBar}
                  onChange={(e) => setSteamPressureBar(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Dryness Fraction (x):</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{steamDrynessX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={steamDrynessX}
                  onChange={(e) => setSteamDrynessX(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeModule === 'u25meg04-rankine-cycle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Boiler Pressure:</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{rankinePBoilerBar} bar</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  step="5"
                  value={rankinePBoilerBar}
                  onChange={(e) => setRankinePBoilerBar(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Condenser Pressure:</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{rankinePCondenserBar.toFixed(2)} bar</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={rankinePCondenserBar}
                  onChange={(e) => setRankinePCondenserBar(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Turbine Inlet Temp:</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>{rankineTMaxC} °C</span>
                </div>
                <input
                  type="range"
                  min="350"
                  max="600"
                  step="10"
                  value={rankineTMaxC}
                  onChange={(e) => setRankineTMaxC(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <input
                  type="checkbox"
                  id="reheatCheck"
                  checked={rankineIsReheat}
                  onChange={(e) => setRankineIsReheat(e.target.checked)}
                />
                <label htmlFor="reheatCheck" style={{ fontSize: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
                  Enable Steam Reheat Cycle
                </label>
              </div>
            </div>
          )}

          {activeModule === 'u25meg04-gas-power-cycles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Ideal Gas Cycle</label>
                <select
                  value={gasCycle}
                  onChange={(e) => setGasCycle(e.target.value as any)}
                  style={{ width: '100%', padding: '7px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                >
                  <option value="otto">Otto Cycle (Constant Volume Heat Addition)</option>
                  <option value="diesel">Diesel Cycle (Constant Pressure Heat Addition)</option>
                  <option value="dual">Dual / Sabathe Cycle (Limited Pressure)</option>
                  <option value="brayton">Brayton Cycle (Gas Turbine Power Plant)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Compression Ratio (r):</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{compRatio.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="24.0"
                  step="0.5"
                  value={compRatio}
                  onChange={(e) => setCompRatio(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {gasCycle === 'diesel' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Cut-off Ratio (rc):</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>{cutOffRatio.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="4.0"
                    step="0.1"
                    value={cutOffRatio}
                    onChange={(e) => setCutOffRatio(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Peak Combustion Temp (T3):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{t3K} K</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="2400"
                  step="50"
                  value={t3K}
                  onChange={(e) => setT3K(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeModule === 'u25meg04-psychrometry-hvac' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Psychrometric Process</label>
                <select
                  value={psychProcess}
                  onChange={(e) => setPsychProcess(e.target.value as any)}
                  style={{ width: '100%', padding: '7px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                >
                  <option value="sensible-heating">Sensible Heating</option>
                  <option value="sensible-cooling">Sensible Cooling</option>
                  <option value="cooling-dehumidification">Cooling & Dehumidification (Air Conditioning)</option>
                  <option value="heating-humidification">Heating & Humidification (Winter Comfort)</option>
                  <option value="adiabatic-mixing">Adiabatic Mixing of Air Streams</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Dry Bulb Temperature (DBT):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{psychDryBulbC} °C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="1"
                  value={psychDryBulbC}
                  onChange={(e) => setPsychDryBulbC(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Relative Humidity (RH):</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{psychRelativeHumPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  step="5"
                  value={psychRelativeHumPct}
                  onChange={(e) => setPsychRelativeHumPct(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* Quick Info Box */}
          <div style={{ marginTop: 'auto', padding: '12px', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>Autonomous R2025 Standard:</strong>
            Formulas adhere strictly to pure thermodynamic laws, Steam Tables & Psychrometric state equations with SI units.
          </div>
        </aside>

        {/* MIDDLE COLUMN: 3D THREE.JS CANVAS & DYNAMIC ANALYTICAL PLOT */}
        <main style={{ display: 'flex', flexDirection: 'column', position: 'relative', background: '#030712' }}>
          {/* 3D WebGL Canvas */}
          <div ref={canvasContainerRef} style={{ flex: '1 1 60%', position: 'relative', width: '100%', minHeight: '300px' }} />

          {/* DYNAMIC SVG ANALYTICAL CURVE SECTION */}
          <div style={{ flex: '0 0 200px', background: '#090e24', borderTop: '1px solid #1e293b', padding: '10px 16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.04em' }}>
                DYNAMIC STATE DIAGRAM (P-V / T-s / MOLLIER)
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Real-time Thermodynamic Contour</span>
            </div>

            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
              <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Axes */}
                <line x1="40" y1="130" x2="480" y2="130" stroke="#334155" strokeWidth="1.5" />
                <line x1="40" y1="130" x2="40" y2="15" stroke="#334155" strokeWidth="1.5" />
                <text x="470" y="145" fill="#64748b" fontSize="10" textAnchor="end">Volume V (m³) / Entropy s</text>
                <text x="35" y="20" fill="#64748b" fontSize="10" textAnchor="end">Pressure P / Temp T</text>

                {/* Dynamic Curves depending on module */}
                {activeModule === 'u25meg04-processes' && (
                  <>
                    {/* Process Trajectory Curve */}
                    <path
                      d={`M 80,${130 - (procP1 / 500) * 100} Q 200,${130 - (processResult.p2KPa / 500) * 100 + 20} 380,${130 - (processResult.p2KPa / 500) * 100}`}
                      fill="rgba(56, 189, 248, 0.15)"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                    <circle cx="80" cy={130 - (procP1 / 500) * 100} r="4" fill="#ef4444" />
                    <text x="85" y={125 - (procP1 / 500) * 100} fill="#f8fafc" fontSize="10">State 1 ({procP1} kPa)</text>
                    <circle cx="380" cy={130 - (processResult.p2KPa / 500) * 100} r="4" fill="#10b981" />
                    <text x="385" y={125 - (processResult.p2KPa / 500) * 100} fill="#f8fafc" fontSize="10">
                      State 2 ({processResult.p2KPa.toFixed(0)} kPa)
                    </text>
                  </>
                )}

                {activeModule === 'u25meg04-gas-power-cycles' && (
                  <>
                    {/* 4-State Cycle Box */}
                    <polygon
                      points="100,120 180,90 180,25 380,60"
                      fill="rgba(245, 158, 11, 0.15)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <circle cx="100" cy="120" r="3.5" fill="#38bdf8" />
                    <circle cx="180" cy="90" r="3.5" fill="#0284c7" />
                    <circle cx="180" cy="25" r="3.5" fill="#ef4444" />
                    <circle cx="380" cy="60" r="3.5" fill="#10b981" />
                    <text x="190" y="30" fill="#f8fafc" fontSize="10">T3 Max Combustion ({t3K} K)</text>
                  </>
                )}

                {activeModule === 'u25meg04-steam-properties' && (
                  <>
                    {/* Saturation Dome Parabola */}
                    <path
                      d="M 60,130 Q 240,20 440,130"
                      fill="rgba(147, 197, 253, 0.1)"
                      stroke="#93c5fd"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                    {/* State point based on dryness fraction x */}
                    <circle
                      cx={60 + steamDrynessX * 380}
                      cy={130 - (steamPressureBar / 150) * 90}
                      r="5"
                      fill="#ef4444"
                    />
                    <text
                      x={65 + steamDrynessX * 380}
                      y={120 - (steamPressureBar / 150) * 90}
                      fill="#f8fafc"
                      fontSize="10"
                    >
                      x = {steamDrynessX.toFixed(2)} (h = {steamResult.h.toFixed(0)} kJ/kg)
                    </text>
                    <text x="240" y="15" fill="#38bdf8" fontSize="10" textAnchor="middle">
                      Critical Point (22.09 MPa)
                    </text>
                  </>
                )}

                {activeModule !== 'u25meg04-processes' &&
                  activeModule !== 'u25meg04-gas-power-cycles' &&
                  activeModule !== 'u25meg04-steam-properties' && (
                    <>
                      {/* Generic Harmonic Process Curve */}
                      <path
                        d="M 60,120 C 150,30 300,100 450,40"
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="2"
                      />
                      <circle cx="250" cy="75" r="4.5" fill="#ef4444" />
                      <text x="260" y="70" fill="#f8fafc" fontSize="10">Thermodynamic State Equilibrium</text>
                    </>
                  )}
              </svg>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: LIVE TELEMETRY, MATHEMATICAL DERIVATION & OBSERVATION LOG */}
        <aside style={{ background: '#0b1329', borderLeft: '1px solid #1e293b', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. LIVE TELEMETRY CARDS */}
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Engineering Telemetry
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {activeModule === 'u25meg04-energy-transfer' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ΔU INTERNAL ENERGY</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8' }}>{energyTransferResult.deltaU.toFixed(1)} <span style={{ fontSize: '11px' }}>kJ</span></div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>U2 FINAL ENERGY</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#10b981' }}>{energyTransferResult.finalInternalEnergy.toFixed(1)} <span style={{ fontSize: '11px' }}>kJ</span></div>
                  </div>
                </>
              )}

              {activeModule === 'u25meg04-processes' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>FINAL PRESSURE P2</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#ef4444' }}>{processResult.p2KPa.toFixed(1)} <span style={{ fontSize: '11px' }}>kPa</span></div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>BOUNDARY WORK W</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8' }}>{processResult.workKJ.toFixed(2)} <span style={{ fontSize: '11px' }}>kJ</span></div>
                  </div>
                </>
              )}

              {activeModule === 'u25meg04-sfee' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>WORK RATE (W_dot)</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8' }}>{sfeeResult.workTransferKW.toFixed(1)} <span style={{ fontSize: '11px' }}>kW</span></div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>SPECIFIC WORK</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#10b981' }}>{sfeeResult.specificWorkKJkg.toFixed(1)} <span style={{ fontSize: '11px' }}>kJ/kg</span></div>
                  </div>
                </>
              )}

              {activeModule === 'u25meg04-second-law' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>CARNOT LIMIT η</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#f59e0b' }}>{(secondLawResult.carnotEfficiency * 100).toFixed(1)}%</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ENTROPY GEN S_gen</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#ef4444' }}>{secondLawResult.entropyGeneratedKJ_K.toFixed(3)} <span style={{ fontSize: '11px' }}>kJ/K</span></div>
                  </div>
                </>
              )}

              {activeModule === 'u25meg04-steam-properties' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ENTHALPY (h)</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8' }}>{steamResult.h.toFixed(1)} <span style={{ fontSize: '11px' }}>kJ/kg</span></div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ENTROPY (s)</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#10b981' }}>{steamResult.s.toFixed(3)} <span style={{ fontSize: '11px' }}>kJ/kg.K</span></div>
                  </div>
                </>
              )}

              {activeModule === 'u25meg04-rankine-cycle' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>THERMAL EFFICIENCY</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#10b981' }}>{(rankineResult.thermalEfficiency * 100).toFixed(2)}%</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>STEAM RATE (SSC)</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8' }}>{rankineResult.specificSteamConsumptionKgKWh.toFixed(2)} <span style={{ fontSize: '11px' }}>kg/kWh</span></div>
                  </div>
                </>
              )}

              {activeModule === 'u25meg04-gas-power-cycles' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>AIR STD EFFICIENCY</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#10b981' }}>{(gasCycleResult.airStandardEfficiency * 100).toFixed(2)}%</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>MEP (BAR)</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#f59e0b' }}>{(gasCycleResult.meanEffectivePressureKPa / 100).toFixed(2)} <span style={{ fontSize: '11px' }}>bar</span></div>
                  </div>
                </>
              )}

              {activeModule === 'u25meg04-psychrometry-hvac' && (
                <>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>WET BULB (WBT)</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8' }}>{psychResult.wetBulbTempC.toFixed(1)} <span style={{ fontSize: '11px' }}>°C</span></div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>DEW POINT (DPT)</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#0284c7' }}>{psychResult.dewPointTempC.toFixed(1)} <span style={{ fontSize: '11px' }}>°C</span></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. MATHEMATICAL STEP-BY-STEP SUBSTITUTION */}
          <div style={{ background: '#10172e', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px', textTransform: 'uppercase' }}>
              Mathematical Step-by-Step
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.6', fontFamily: 'monospace' }}>
              {activeModule === 'u25meg04-energy-transfer' && (
                <>
                  <div>First Law: Q - W = ΔU</div>
                  <div>Q_net = {qIn} kJ, W_net = {wBoundary + wShaft} kJ</div>
                  <div>ΔU = {qIn} - {wBoundary + wShaft} = <strong style={{ color: '#10b981' }}>{energyTransferResult.deltaU.toFixed(1)} kJ</strong></div>
                </>
              )}
              {activeModule === 'u25meg04-processes' && (
                <>
                  <div>Process: {procType.toUpperCase()}</div>
                  <div>W = ∫ P dV = {processResult.workKJ.toFixed(2)} kJ</div>
                  <div>Q = ΔU + W = {processResult.heatKJ.toFixed(2)} kJ</div>
                </>
              )}
              {activeModule === 'u25meg04-sfee' && (
                <>
                  <div>SFEE: m_dot [ (h1 - h2) + (V1² - V2²)/2000 + g(z1 - z2)/1000 ] + Q_dot = W_dot</div>
                  <div>Enthalpy drop: Δh = {(sfeeH1 - sfeeH2).toFixed(1)} kJ/kg</div>
                  <div>Power Output: <strong style={{ color: '#10b981' }}>{sfeeResult.workTransferKW.toFixed(1)} kW</strong></div>
                </>
              )}
              {activeModule === 'u25meg04-second-law' && (
                <>
                  <div>Carnot η = 1 - (TL / TH) = 1 - ({tlSinkK} / {thSourceK}) = <strong style={{ color: '#f59e0b' }}>{(secondLawResult.carnotEfficiency * 100).toFixed(1)}%</strong></div>
                  <div>Actual η = W / QH = {wActualKJ} / {qhInputKJ} = {(secondLawResult.actualEfficiency * 100).toFixed(1)}%</div>
                  <div>Gouy-Stodola Exergy Destroyed: <strong style={{ color: '#ef4444' }}>{secondLawResult.exergyDestructionKJ.toFixed(1)} kJ</strong></div>
                </>
              )}
              {activeModule === 'u25meg04-steam-properties' && (
                <>
                  <div>Wet Enthalpy: h = hf + x * hfg</div>
                  <div>h = {steamResult.hf.toFixed(1)} + ({steamDrynessX} * {steamResult.hfg.toFixed(1)}) = <strong style={{ color: '#38bdf8' }}>{steamResult.h.toFixed(1)} kJ/kg</strong></div>
                  <div>Saturation Temp: Tsat = {steamResult.saturationTempC.toFixed(1)} °C</div>
                </>
              )}
              {activeModule === 'u25meg04-rankine-cycle' && (
                <>
                  <div>Net Work: W_net = W_turb - W_pump = {rankineResult.netWorkKJkg.toFixed(1)} kJ/kg</div>
                  <div>Efficiency: η = W_net / Q_in = <strong style={{ color: '#10b981' }}>{(rankineResult.thermalEfficiency * 100).toFixed(2)}%</strong></div>
                </>
              )}
              {activeModule === 'u25meg04-gas-power-cycles' && (
                <>
                  <div>Air Standard η = 1 - (1 / r^(γ - 1)) [for Otto]</div>
                  <div>η = 1 - (1 / {compRatio.toFixed(1)}^0.4) = <strong style={{ color: '#10b981' }}>{(gasCycleResult.airStandardEfficiency * 100).toFixed(2)}%</strong></div>
                </>
              )}
              {activeModule === 'u25meg04-psychrometry-hvac' && (
                <>
                  <div>Vapor Pressure: Pv = φ * Psat = {psychResult.vaporPressureKPa.toFixed(3)} kPa</div>
                  <div>Humidity Ratio: ω = 0.622 * Pv / (P - Pv) = <strong style={{ color: '#38bdf8' }}>{(psychResult.humidityRatioKgKg * 1000).toFixed(2)} g/kg</strong></div>
                </>
              )}
            </div>
          </div>

          {/* 3. OBSERVATION TABLE LOG (TRIAL RECORDER) */}
          <div style={{ flex: 1, minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase' }}>
                Observation Log ({observations.length})
              </span>
              {observations.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  style={{ padding: '3px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '11px', color: '#38bdf8', cursor: 'pointer' }}
                >
                  Export CSV
                </button>
              )}
            </div>

            <div style={{ flex: 1, background: '#090e24', border: '1px solid #1e293b', borderRadius: '6px', overflowY: 'auto', maxHeight: '160px' }}>
              {observations.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                  No trials recorded yet. Click <strong>+ Log Trial</strong> to record observations.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '6px 8px' }}>Time</th>
                      <th style={{ padding: '6px 8px' }}>Module</th>
                      <th style={{ padding: '6px 8px' }}>Out 1</th>
                      <th style={{ padding: '6px 8px' }}>Out 2</th>
                      <th style={{ padding: '6px 8px' }}>Eff / COP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '5px 8px', color: '#64748b' }}>{o.timestamp}</td>
                        <td style={{ padding: '5px 8px', color: '#38bdf8', fontWeight: 600 }}>{o.module}</td>
                        <td style={{ padding: '5px 8px' }}>{o.output1}</td>
                        <td style={{ padding: '5px 8px' }}>{o.output2}</td>
                        <td style={{ padding: '5px 8px', color: '#10b981', fontWeight: 600 }}>{o.efficiencyOrCOP}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 4. CONCEPT ASSESSMENT QUIZ */}
          <div style={{ background: '#10172e', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                Conceptual Assessment
              </span>
              {quizSubmitted ? (
                <span style={{ fontSize: '11px', fontWeight: 700, color: quizScore >= 4 ? '#10b981' : '#ef4444' }}>
                  Score: {quizScore}/{questions.length} ({((quizScore / questions.length) * 100).toFixed(0)}%)
                </span>
              ) : (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  style={{ padding: '2px 8px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Grade Quiz
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {questions.map((q, qIdx) => {
                const selected = quizAnswers[qIdx];
                return (
                  <div key={qIdx} style={{ fontSize: '11px', color: '#e2e8f0' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Q{qIdx + 1}:</strong> {q.q}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {q.opts.map((opt, optIdx) => {
                        let btnBg = '#1e293b';
                        let btnColor = '#cbd5e1';

                        if (selected === optIdx) {
                          btnBg = '#0284c7';
                          btnColor = '#fff';
                        }
                        if (quizSubmitted) {
                          if (optIdx === q.correct) {
                            btnBg = '#10b981';
                            btnColor = '#fff';
                          } else if (selected === optIdx && selected !== q.correct) {
                            btnBg = '#ef4444';
                            btnColor = '#fff';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectQuiz(qIdx, optIdx)}
                            style={{
                              padding: '4px 8px',
                              background: btnBg,
                              color: btnColor,
                              border: '1px solid #334155',
                              borderRadius: '4px',
                              textAlign: 'left',
                              fontSize: '10.5px',
                              cursor: quizSubmitted ? 'default' : 'pointer',
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', fontStyle: 'italic' }}>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* 4. OFFICIAL PRINTABLE LABORATORY REPORT MODAL */}
      {isReportOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ width: '800px', maxHeight: '90vh', background: '#ffffff', color: '#0f172a', borderRadius: '12px', padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            {/* College Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.05em', color: '#0284c7' }}>
                KPR INSTITUTE OF ENGINEERING AND TECHNOLOGY
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                (Autonomous Institution • Affiliated to Anna University, Chennai)
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                DEPARTMENT OF MECHANICAL ENGINEERING
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '6px', color: '#0f172a' }}>
                U25MEG04 — ENGINEERING THERMODYNAMICS VIRTUAL LABORATORY REPORT
              </div>
            </div>

            {/* Student & Experiment Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
              <div>
                <strong>Student Name:</strong> {studentName}
              </div>
              <div>
                <strong>Register Number:</strong> {regNo}
              </div>
              <div>
                <strong>Active Module:</strong> {activeModule.replace('u25meg04-', '').toUpperCase()}
              </div>
              <div>
                <strong>Date & Time:</strong> {new Date().toLocaleString()}
              </div>
            </div>

            {/* Aim */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>1. AIM OF EXPERIMENT</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                To simulate and analyze the thermodynamic state variables, energy interactions, phase change phenomena, cycle thermal efficiencies, and exergy destruction under standard Autonomous R2025 engineering formulations.
              </p>
            </div>

            {/* Governing Equations */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>2. GOVERNING THERMODYNAMIC LAWS & EQUATIONS</div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                <li><strong>First Law (Closed):</strong> Q - W = ΔU = m * cv * (T2 - T1)</li>
                <li><strong>Steady Flow Energy Equation (Open):</strong> m_dot [ (h1 + V1²/2000 + gz1/1000) ] + Q_dot = m_dot [ (h2 + V2²/2000 + gz2/1000) ] + W_dot</li>
                <li><strong>Carnot Limit:</strong> η_Carnot = 1 - (TL / TH), COP_HP = TH / (TH - TL)</li>
                <li><strong>Gouy-Stodola Theorem:</strong> I = T0 * S_gen (Rate of Exergy Destruction)</li>
                <li><strong>Rankine Thermal Efficiency:</strong> η_th = (W_turbine - W_pump) / Q_boiler</li>
                <li><strong>Air Standard Otto Efficiency:</strong> η_Otto = 1 - 1 / r^(γ - 1) (γ = 1.4 for diatomic air)</li>
              </ul>
            </div>

            {/* Observations Table */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>3. RECORDED OBSERVATIONS & RESULTS</div>
              {observations.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  No experimental trials recorded during this session.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '6px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '6px', textAlign: 'left' }}>Trial ID</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>Module</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>Parameter 1</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>Output 1</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>Output 2</th>
                      <th style={{ padding: '6px', textAlign: 'left' }}>Efficiency / State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px' }}>{o.id}</td>
                        <td style={{ padding: '6px', fontWeight: 600 }}>{o.module}</td>
                        <td style={{ padding: '6px' }}>{o.param1}</td>
                        <td style={{ padding: '6px' }}>{o.output1}</td>
                        <td style={{ padding: '6px' }}>{o.output2}</td>
                        <td style={{ padding: '6px', fontWeight: 700, color: '#0284c7' }}>{o.efficiencyOrCOP}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Inference & Result */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>4. ENGINEERING INFERENCE</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                All calculated state points verify the First and Second Laws of Thermodynamics. The thermal efficiencies of real power cycles remain strictly bounded below the Carnot reversible limit, confirming the Gouy-Stodola relation for exergy destruction.
              </p>
            </div>

            {/* Modal Footer Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                onClick={() => setIsReportOpen(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
