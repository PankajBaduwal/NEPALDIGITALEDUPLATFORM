/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * High-Precision Master 3D Workspace Component
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Camera,
  Layers,
  X,
  BookOpen,
  Sliders,
  FileText,
  Activity,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import type {
  PhysicsSimId,
  PhysicsSimulationController,
  SimulationState,
  StageDefinition,
  ComponentInspectionData,
  ParameterDefinition,
} from '../core/types';

import {
  mountMaterialTestingSimulation,
  mountPoissonRatioSimulation,
  mountMaterialComparisonSimulation,
  mountCantileverBeamSimulation,
  mountGirdersMEMSSimulation,
  mountHeatTransferSimulation,
  mountThermalExpansionLeesDiscSimulation,
  mountSurfaceTensionSimulation,
  mountPoiseuilleViscositySimulation,
  mountThermalSystemsSimulation,
  mountUltrasonicWavesSimulation,
  mountPiezoMagnetoSimulation,
  mountUltrasonicVelocitySimulation,
  mountSonarRangingSimulation,
  mountNDTScanningSimulation,
  mountBandStructureSimulation,
  mountCarrierConcentrationSimulation,
  mountCarrierTransportPNSimulation,
  mountZenerDiodeSimulation,
  mountSemiconductorDevicesSimulation,
  mountRadiationMatterSimulation,
  mountLaserPrinciplesSimulation,
  mountCO2DiodeLaserSimulation,
  mountTotalInternalReflectionSimulation,
  mountFibreEndoscopySensorsSimulation,
} from '../index';

export interface PhysicsVirtualLabWorkspaceProps {
  initialSim?: PhysicsSimId;
  onExit?: () => void;
}

export const PHYSICS_SIMULATION_CATALOGUE: Array<{
  id: PhysicsSimId;
  unit: number;
  unitTitle: string;
  title: string;
  topic: string;
  icon: string;
  shortDescription: string;
}> = [
  // Unit I
  {
    id: 'material-testing',
    unit: 1,
    unitTitle: 'Mechanical Properties of Solids',
    title: 'Material Testing Machine (UTM)',
    topic: 'Modulus of Elasticity & Stress–Strain',
    icon: '🏗️',
    shortDescription: 'Universal testing machine with stress-strain curves, Hooke’s law, yield point, and plastic deformation.',
  },
  {
    id: 'poisson-ratio',
    unit: 1,
    unitTitle: 'Mechanical Properties of Solids',
    title: 'Poisson’s Ratio & Transverse Strain',
    topic: 'Poisson’s Ratio & Lateral Contraction',
    icon: '↔️',
    shortDescription: 'Uniaxial tension and compression illustrating longitudinal versus transverse deformation.',
  },
  {
    id: 'material-comparison',
    unit: 1,
    unitTitle: 'Mechanical Properties of Solids',
    title: 'Metals, Polymers & Ceramics Comparison',
    topic: 'Comparative Stress–Strain Behaviour',
    icon: '🔬',
    shortDescription: 'Simultaneous tensile loading comparing ductile yield, viscoelastic compliance, and brittle fracture.',
  },
  {
    id: 'cantilever-beam',
    unit: 1,
    unitTitle: 'Mechanical Properties of Solids',
    title: 'Cantilever Beam & Bending Moment',
    topic: 'Bending Moment & Cantilever Deflection',
    icon: '📐',
    shortDescription: 'Euler–Bernoulli cantilever beam with point and distributed loads, moment diagrams, and tip deflection.',
  },
  {
    id: 'girders-mems',
    unit: 1,
    unitTitle: 'Mechanical Properties of Solids',
    title: 'Girders & MEMS Resonators',
    topic: 'Applications in Girders and MEMS',
    icon: '🌉',
    shortDescription: 'Structural I-girder section modulus compared with microscale MEMS cantilever resonance.',
  },
  // Unit II
  {
    id: 'heat-transfer',
    unit: 2,
    unitTitle: 'Fundamentals of Heat Transfer & Fluids',
    title: 'Heat Transfer Studio',
    topic: 'Conduction, Convection & Radiation',
    icon: '🔥',
    shortDescription: 'Interactive solid rod, convective surface, and radiative thermal exchange models.',
  },
  {
    id: 'thermal-expansion-lees-disc',
    unit: 2,
    unitTitle: 'Fundamentals of Heat Transfer & Fluids',
    title: 'Thermal Expansion & Lee’s Disc',
    topic: 'Thermal Expansion & Lee’s Disc Method',
    icon: '🌡️',
    shortDescription: 'Linear thermal expansion of rods and Lee’s disc apparatus for bad thermal conductors.',
  },
  {
    id: 'surface-tension',
    unit: 2,
    unitTitle: 'Fundamentals of Heat Transfer & Fluids',
    title: 'Surface Tension & Capillary Ascent',
    topic: 'Surface Tension & Jurin’s Law',
    icon: '💧',
    shortDescription: 'Capillary rise, contact angle, meniscus curvature, and droplet formation forces.',
  },
  {
    id: 'poiseuille-viscosity',
    unit: 2,
    unitTitle: 'Fundamentals of Heat Transfer & Fluids',
    title: 'Poiseuille Flow & Viscosity Laboratory',
    topic: 'Viscosity & Poiseuille’s Flow',
    icon: '🧪',
    shortDescription: 'Laminar flow through circular tubes, R⁴ sensitivity, and dynamic viscosity coefficient.',
  },
  {
    id: 'thermal-systems',
    unit: 2,
    unitTitle: 'Fundamentals of Heat Transfer & Fluids',
    title: 'Industrial Thermal Systems',
    topic: 'Solar Heater, Microwave, Exchanger, Radiator',
    icon: '☀️',
    shortDescription: 'Multi-station thermal engineering: solar collector, microwave cavity, and heat exchangers.',
  },
  // Unit III
  {
    id: 'ultrasonic-waves',
    unit: 3,
    unitTitle: 'Ultrasonics and Its Applications',
    title: 'Ultrasonic Wave Propagation',
    topic: 'Properties of Ultrasonic Waves',
    icon: '📡',
    shortDescription: 'High-frequency longitudinal mechanical waves, acoustic pressure, and wavelength relations.',
  },
  {
    id: 'piezo-magnetostriction',
    unit: 3,
    unitTitle: 'Ultrasonics and Its Applications',
    title: 'Piezoelectric & Magnetostriction Oscillators',
    topic: 'Production of Ultrasonic Waves',
    icon: '⚡',
    shortDescription: 'Quartz crystal inverse piezoelectricity versus ferromagnetic nickel rod magnetostriction.',
  },
  {
    id: 'ultrasonic-velocity',
    unit: 3,
    unitTitle: 'Ultrasonics and Its Applications',
    title: 'Ultrasonic Velocity Measurement',
    topic: 'Velocity Measurement in Liquids',
    icon: '⏱️',
    shortDescription: 'Acoustic interferometer measuring standing wave nodes to calculate sound velocity.',
  },
  {
    id: 'sonar-ranging',
    unit: 3,
    unitTitle: 'Ultrasonics and Its Applications',
    title: 'Active SONAR & Echo Ranging',
    topic: 'SONAR Principles & Pulse-Echo Ranging',
    icon: '🚢',
    shortDescription: 'Underwater acoustic pulse propagation, reflection timing, and marine target location.',
  },
  {
    id: 'ndt-imaging',
    unit: 3,
    unitTitle: 'Ultrasonics and Its Applications',
    title: 'Non-Destructive Testing (NDT)',
    topic: 'NDT Flaw Detection & Scanning',
    icon: '🔍',
    shortDescription: 'Pulse-echo flaw inspection, reflection depth analysis, and internal defect detection.',
  },
  // Unit IV
  {
    id: 'band-structure',
    unit: 4,
    unitTitle: 'Semiconductor Physics',
    title: 'Semiconductor Band Structure',
    topic: 'Direct & Indirect Band Gaps',
    icon: '📊',
    shortDescription: 'E-k diagrams comparing direct (GaAs) and indirect (Si) optical transition probabilities.',
  },
  {
    id: 'carrier-concentration',
    unit: 4,
    unitTitle: 'Semiconductor Physics',
    title: 'Intrinsic & Extrinsic Semiconductors',
    topic: 'Carrier Concentration & Doping',
    icon: '⚛️',
    shortDescription: 'Thermal carrier generation, mass action law, Fermi level, and donor/acceptor doping.',
  },
  {
    id: 'carrier-transport-pn',
    unit: 4,
    unitTitle: 'Semiconductor Physics',
    title: 'Carrier Transport & P–N Junction',
    topic: 'P–N Junction Dynamics & Bias',
    icon: '🔋',
    shortDescription: 'Diffusion and drift, space charge depletion width, and forward/reverse bias current.',
  },
  {
    id: 'zener-diode',
    unit: 4,
    unitTitle: 'Semiconductor Physics',
    title: 'Zener Diode & Voltage Regulation',
    topic: 'Zener Breakdown & Voltage Clamping',
    icon: '⚡',
    shortDescription: 'Reverse tunneling breakdown and DC voltage shunt regulator circuit behavior.',
  },
  {
    id: 'semiconductor-devices',
    unit: 4,
    unitTitle: 'Semiconductor Physics',
    title: 'Semiconductor Device Explorer',
    topic: 'Solid-State Electronic Devices',
    icon: '💻',
    shortDescription: 'Interactive cutaways of P-N diodes, Zener diodes, BJTs, and light-emitting diodes.',
  },
  // Unit V
  {
    id: 'radiation-matter',
    unit: 5,
    unitTitle: 'Photonics',
    title: 'Radiation–Matter Interaction',
    topic: 'Absorption & Stimulated Emission',
    icon: '✨',
    shortDescription: 'Einstein coefficients, spontaneous decay, and coherent stimulated photon emission.',
  },
  {
    id: 'laser-principles',
    unit: 5,
    unitTitle: 'Photonics',
    title: 'Laser Principles & Population Inversion',
    topic: 'Laser Threshold & Population Inversion',
    icon: '🔴',
    shortDescription: 'Pumping, metastable states, population inversion, and optical cavity amplification.',
  },
  {
    id: 'co2-diode-lasers',
    unit: 5,
    unitTitle: 'Photonics',
    title: 'CO₂ Laser & Semiconductor Diode Laser',
    topic: 'CO₂ & Semiconductor Diode Lasers',
    icon: '🔆',
    shortDescription: 'Far-IR molecular gas discharge laser versus miniature near-IR diode laser systems.',
  },
  {
    id: 'total-internal-reflection',
    unit: 5,
    unitTitle: 'Photonics',
    title: 'Total Internal Reflection & Optical Fiber',
    topic: 'Total Internal Reflection & Fiber Modes',
    icon: '➰',
    shortDescription: 'Snell’s law, critical angle, numerical aperture, and step-index fiber ray guidance.',
  },
  {
    id: 'fibre-endoscopy-sensors',
    unit: 5,
    unitTitle: 'Photonics',
    title: 'Fiber Endoscopy & Optical Sensors',
    topic: 'Endoscopy & Fiber Sensors',
    icon: '🩺',
    shortDescription: 'Coherent image-transmitting fiber bundles versus microbend optical intensity sensors.',
  },
];

export const PhysicsVirtualLabWorkspace: React.FC<PhysicsVirtualLabWorkspaceProps> = ({
  initialSim = 'material-testing',
  onExit,
}) => {
  const [activeSimId, setActiveSimId] = useState<PhysicsSimId>(initialSim);
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PhysicsSimulationController | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // UI State
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [stages, setStages] = useState<StageDefinition[]>([]);
  const [selectedComp, setSelectedComp] = useState<ComponentInspectionData | null>(null);
  const [activeTab, setActiveTab] = useState<'learn' | 'explore' | 'experiment' | 'understand' | 'challenge' | 'assess' | 'inspect'>('learn');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recordedTrials, setRecordedTrials] = useState<Array<Record<string, any>>>([]);

  // Active Sim Definition
  const currentSimDef = (PHYSICS_SIMULATION_CATALOGUE.find((s) => s.id === activeSimId) || PHYSICS_SIMULATION_CATALOGUE[0])!;

  // Mount/Unmount Simulation Controller
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dispose previous controller safely
    if (controllerRef.current) {
      if (typeof controllerRef.current.dispose === 'function') {
        controllerRef.current.dispose();
      }
      controllerRef.current = null;
    }

    const opts = {
      theme,
      onStateChange: (st: SimulationState) => setSimState({ ...st }),
      onComponentSelect: (comp: ComponentInspectionData | null) => {
        setSelectedComp(comp);
        if (comp) setActiveTab('inspect');
      },
    };

    let controller: PhysicsSimulationController;
    switch (activeSimId) {
      // Unit I
      case 'material-testing': controller = mountMaterialTestingSimulation(container, opts); break;
      case 'poisson-ratio': controller = mountPoissonRatioSimulation(container, opts); break;
      case 'material-comparison': controller = mountMaterialComparisonSimulation(container, opts); break;
      case 'cantilever-beam': controller = mountCantileverBeamSimulation(container, opts); break;
      case 'girders-mems': controller = mountGirdersMEMSSimulation(container, opts); break;
      // Unit II
      case 'heat-transfer': controller = mountHeatTransferSimulation(container, opts); break;
      case 'thermal-expansion-lees-disc': controller = mountThermalExpansionLeesDiscSimulation(container, opts); break;
      case 'surface-tension': controller = mountSurfaceTensionSimulation(container, opts); break;
      case 'poiseuille-viscosity': controller = mountPoiseuilleViscositySimulation(container, opts); break;
      case 'thermal-systems': controller = mountThermalSystemsSimulation(container, opts); break;
      // Unit III
      case 'ultrasonic-waves': controller = mountUltrasonicWavesSimulation(container, opts); break;
      case 'piezo-magnetostriction': controller = mountPiezoMagnetoSimulation(container, opts); break;
      case 'ultrasonic-velocity': controller = mountUltrasonicVelocitySimulation(container, opts); break;
      case 'sonar-ranging': controller = mountSonarRangingSimulation(container, opts); break;
      case 'ndt-imaging': controller = mountNDTScanningSimulation(container, opts); break;
      // Unit IV
      case 'band-structure': controller = mountBandStructureSimulation(container, opts); break;
      case 'carrier-concentration': controller = mountCarrierConcentrationSimulation(container, opts); break;
      case 'carrier-transport-pn': controller = mountCarrierTransportPNSimulation(container, opts); break;
      case 'zener-diode': controller = mountZenerDiodeSimulation(container, opts); break;
      case 'semiconductor-devices': controller = mountSemiconductorDevicesSimulation(container, opts); break;
      // Unit V
      case 'radiation-matter': controller = mountRadiationMatterSimulation(container, opts); break;
      case 'laser-principles': controller = mountLaserPrinciplesSimulation(container, opts); break;
      case 'co2-diode-lasers': controller = mountCO2DiodeLaserSimulation(container, opts); break;
      case 'total-internal-reflection': controller = mountTotalInternalReflectionSimulation(container, opts); break;
      case 'fibre-endoscopy-sensors': controller = mountFibreEndoscopySensorsSimulation(container, opts); break;
      default: controller = mountMaterialTestingSimulation(container, opts); break;
    }

    controllerRef.current = controller;
    setSimState(controller.getState());
    setStages(controller.getStages());
    setSelectedComp(null);

    return () => {
      if (controllerRef.current) {
        if (typeof controllerRef.current.dispose === 'function') {
          controllerRef.current.dispose();
        }
        controllerRef.current = null;
      }
    };
  }, [activeSimId]);

  // Sync theme
  useEffect(() => {
    controllerRef.current?.setTheme?.(theme);
  }, [theme]);

  const togglePlay = () => {
    if (simState?.isPlaying) {
      controllerRef.current?.pause();
    } else {
      controllerRef.current?.play();
    }
  };

  const handleRecordTrial = () => {
    if (!simState) return;
    const trial = {
      trialNumber: recordedTrials.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      stage: stages[simState.currentStageIndex]?.title || 'Standard',
      ...simState.parameters,
      ...simState.metrics,
    };
    setRecordedTrials((prev) => [...prev, trial]);
  };

  const paramDefs: ParameterDefinition[] =
    typeof controllerRef.current?.getParameterDefinitions === 'function'
      ? controllerRef.current.getParameterDefinitions()
      : [];

  const currentStage = stages[simState?.currentStageIndex || 0];

  return (
    <div className={`flex h-full w-full flex-col font-sans ${theme === 'dark' ? 'bg-[#07111E] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* ── Top Navigation Bar ── */}
      <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6 ${theme === 'dark' ? 'border-slate-800 bg-[#0B1727]' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-sm">
            {currentSimDef.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                U25RPH01 • UNIT {currentSimDef.unit}
              </span>
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                {currentSimDef.unitTitle}
              </span>
            </div>
            <h1 className="text-base font-bold leading-tight sm:text-lg">
              {currentSimDef.title}
            </h1>
          </div>
        </div>

        {/* Center / Simulation Picker */}
        <div className="hidden lg:flex items-center gap-2">
          <select
            value={activeSimId}
            onChange={(e) => setActiveSimId(e.target.value as PhysicsSimId)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-300 bg-white text-slate-800'
            }`}
          >
            {[1, 2, 3, 4, 5].map((u) => (
              <optgroup key={u} label={`Unit ${u}: ${PHYSICS_SIMULATION_CATALOGUE.find((s) => s.unit === u)?.unitTitle}`}>
                {PHYSICS_SIMULATION_CATALOGUE.filter((s) => s.unit === u).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.topic})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Camera presets */}
          <button
            onClick={() => controllerRef.current?.resetCamera()}
            title="Reset Camera"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Camera className="h-4 w-4" />
          </button>

          {/* Toggle Labels */}
          <button
            onClick={() => controllerRef.current?.toggleLabels()}
            title="Toggle Labels"
            className={`rounded-lg p-2 ${simState?.labelsVisible ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            <Layers className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            title="Toggle Theme"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen((f) => !f)}
            title="Toggle Fullscreen"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Exit */}
          {onExit && (
            <button
              onClick={onExit}
              className="ml-2 flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              <span>Exit</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left / Center: Interactive 3D Viewport */}
        <main className="relative flex flex-1 flex-col">
          {/* 3D Canvas Mounting Container */}
          <div ref={containerRef} className="relative h-full w-full select-none overflow-hidden" />

          {/* Floating Stage Indicator */}
          {currentStage && (
            <div className="absolute top-4 left-4 z-20 max-w-md rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  STAGE {currentStage.index + 1} OF {stages.length}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={currentStage.index === 0}
                    onClick={() => controllerRef.current?.prevStage()}
                    className="rounded p-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={currentStage.index === stages.length - 1}
                    onClick={() => controllerRef.current?.nextStage()}
                    className="rounded p-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <h2 className="mt-0.5 text-xs font-bold leading-tight text-slate-900 dark:text-white">
                {currentStage.title}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {currentStage.shortDescription}
              </p>
            </div>
          )}

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95">
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            >
              {simState?.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            </button>
            <button
              onClick={() => controllerRef.current?.reset()}
              title="Reset Simulation"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={handleRecordTrial}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Record Trial</span>
            </button>
          </div>
        </main>

        {/* Right / Sidebar: Pedagogical Tabs */}
        <aside className={`flex w-96 shrink-0 flex-col border-l ${theme === 'dark' ? 'border-slate-800 bg-[#0B1727]' : 'border-slate-200 bg-white'}`}>
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 text-xs font-semibold dark:border-slate-800">
            {[
              { id: 'learn', label: 'Learn', icon: BookOpen },
              { id: 'explore', label: 'Explore', icon: Sliders },
              { id: 'understand', label: 'Telemetry', icon: Activity },
              { id: 'assess', label: 'Quiz', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 text-sm">
            {/* ── 1. LEARN TAB ── */}
            {activeTab === 'learn' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Syllabus Topic
                  </h3>
                  <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {currentSimDef.topic}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentSimDef.shortDescription}
                  </p>
                </div>

                {currentStage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      {currentStage.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentStage.detailedExplanation}
                    </p>
                    {currentStage.physicsFormulas && currentStage.physicsFormulas.length > 0 && (
                      <div className="mt-2.5 space-y-1">
                        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                          Governing Equations:
                        </span>
                        {currentStage.physicsFormulas.map((eq, i) => (
                          <div key={i} className="rounded bg-white/80 px-2 py-1 font-mono text-xs text-slate-800 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                            {eq}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Key Terminology */}
                {currentStage?.keyTerminology && currentStage.keyTerminology.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Key Terminology
                    </h4>
                    {currentStage.keyTerminology.map((term, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {term.term}:
                        </span>{' '}
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {term.definition}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 2. EXPLORE / PARAMETERS TAB ── */}
            {activeTab === 'explore' && (
              <div className="space-y-4">
                <div className="border-b pb-2 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Interactive Physical Controls
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Adjust verified physical inputs and observe immediate 3D & numerical responses.
                  </p>
                </div>

                {paramDefs.length === 0 ? (
                  <p className="text-xs text-slate-500">No adjustable parameters for this mode.</p>
                ) : (
                  paramDefs.map((p) => {
                    const currentVal = simState?.parameters[p.key] ?? p.defaultValue;
                    return (
                      <div key={p.key} className="space-y-1.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-bold text-slate-900 dark:text-white">
                            {p.label}
                          </label>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {String(currentVal)} {p.unit || ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {p.description}
                        </p>

                        {p.type === 'select' && p.options ? (
                          <select
                            value={String(currentVal)}
                            onChange={(e) => controllerRef.current?.setParameter(p.key, e.target.value)}
                            className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                          >
                            {p.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : p.type === 'number' ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="range"
                              min={p.min}
                              max={p.max}
                              step={p.step}
                              value={Number(currentVal)}
                              onChange={(e) => controllerRef.current?.setParameter(p.key, Number(e.target.value))}
                              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-700"
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── 3. TELEMETRY / UNDERSTAND TAB ── */}
            {activeTab === 'understand' && (
              <div className="space-y-4">
                <div className="border-b pb-2 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live Physical Telemetry
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Deterministic unit-calibrated calculations from the underlying scientific model.
                  </p>
                </div>

                {simState?.metrics && Object.keys(simState.metrics).length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {Object.entries(simState.metrics).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Run the simulation to inspect computed telemetry.</p>
                )}

                {/* Recorded trials counter */}
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Recorded Trials:</span>
                    <span className="font-bold text-emerald-600">{recordedTrials.length}</span>
                  </div>
                  {recordedTrials.length > 0 && (
                    <div className="mt-2 max-h-36 overflow-y-auto text-[11px] font-mono space-y-1">
                      {recordedTrials.map((t, idx) => (
                        <div key={idx} className="rounded bg-slate-100 p-1.5 dark:bg-slate-800">
                          Trial #{t.trialNumber} @ {t.timestamp}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 4. QUIZ / ASSESS TAB ── */}
            {activeTab === 'assess' && (
              <div className="space-y-4">
                <div className="border-b pb-2 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Conceptual & Numerical Check
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Test your understanding of the physical principles governing this experiment.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Q1: How does doubling the tube bore radius affect laminar fluid volume discharge rate in Poiseuille’s experiment?
                    </p>
                    <div className="mt-2.5 space-y-1.5 text-xs">
                      <button className="w-full text-left rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                        A) It doubles the flow rate (2x)
                      </button>
                      <button className="w-full text-left rounded-lg border border-emerald-500 bg-emerald-50 p-2 font-semibold text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                        B) It increases the flow rate by 16 times (2⁴ = 16x) ✓
                      </button>
                      <button className="w-full text-left rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                        C) It quadruples the flow rate (2² = 4x)
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                      Explanation: Hagen–Poiseuille law states Q ∝ R⁴. Thus (2R)⁴ = 16 R⁴.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. INSPECT TAB ── */}
            {activeTab === 'inspect' && selectedComp && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Component Inspection
                  </h3>
                  <button
                    onClick={() => controllerRef.current?.inspectComponent(null)}
                    className="rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedComp.name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedComp.scientificRole}
                  </p>
                </div>
                {selectedComp.materialsAndSpecs && (
                  <div className="rounded-lg border border-slate-200 p-2.5 text-xs dark:border-slate-800">
                    <span className="font-bold">Specifications:</span> {selectedComp.materialsAndSpecs}
                  </div>
                )}
                {selectedComp.physicalPrinciples && (
                  <div className="rounded-lg border border-slate-200 p-2.5 text-xs dark:border-slate-800">
                    <span className="font-bold">Physical Principle:</span> {selectedComp.physicalPrinciples}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
