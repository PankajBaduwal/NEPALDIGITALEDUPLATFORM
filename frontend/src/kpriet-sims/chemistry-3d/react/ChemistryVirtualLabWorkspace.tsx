/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Standardized Eduverse Presentation Workspace
 *
 * Designed with modern aesthetic standards:
 * - Clean, crisp white surfaces (bg-white, bg-slate-50, border-slate-200)
 * - Solid high-contrast black/slate text (#0f172a, text-slate-900/800) for effortless legibility
 * - Elegant emerald accents (#059669 / emerald-600/700)
 * - Seamless Theme Switching (Defaults to Light mode with pure white canvas & badges, with Sun/Moon toggle)
 *
 * Integrates all 13 Major Engineering Chemistry Virtual Laboratory Simulations:
 * Units I–V:
 * - Unit I: Molecular Orbitals & Hybridization, Stereochemistry
 * - Unit II: Organic Reaction Mechanisms, Aromatic Reactions & EAS
 * - Unit III: Polymerization at Molecular Scale, Coordination Chemistry & CFT
 * - Unit IV: Phase Transitions & Water Phase Diagram, Lithium-Ion, Lead-Acid, PEM Fuel Cell
 * - Unit V: Surface Adsorption & Heterogeneous Catalysis, Chromatography (HPLC/GC), Spectroscopy (UV-Vis/IR/NMR)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  Atom,
  Info,
  Flame,
  FlaskConical,
  X,
  ChevronRight,
  Sliders,
  HelpCircle,
  Eye,
  Sun,
  Moon,
} from 'lucide-react';

import type { SimulationController, SimulationState, ComponentInspectionData, StageDefinition } from '../core/types';
import {
  mountMolecularOrbitalsSimulation,
  mountOrganicMechanismsSimulation,
  mountStereochemistrySimulation,
  mountAromaticReactionsSimulation,
  mountPolymerizationSimulation,
  mountCoordinationChemistrySimulation,
  mountPhaseTransitionsSimulation,
  mountAdsorptionCatalysisSimulation,
  mountChromatographySimulation,
  mountSpectroscopySimulation,
  mountLithiumIonSimulation,
  mountLeadAcidSimulation,
  mountPEMFuelCellSimulation,
} from '../index';

export type ChemSimId =
  | 'molecular-orbitals'
  | 'organic-mechanisms'
  | 'stereochemistry'
  | 'aromatic-reactions'
  | 'polymerization'
  | 'coordination-chemistry'
  | 'phase-transitions'
  | 'adsorption-catalysis'
  | 'chromatography'
  | 'spectroscopy'
  | 'lithium-ion'
  | 'lead-acid'
  | 'pem-fuel-cell';

export interface SimMeta {
  id: ChemSimId;
  title: string;
  unit: string;
  unitNum: 'I' | 'II' | 'III' | 'IV' | 'V';
  shortDesc: string;
  icon: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  estMinutes: number;
}

export const CHEMISTRY_SIMULATIONS: SimMeta[] = [
  {
    id: 'molecular-orbitals',
    title: 'Molecular Orbitals and Hybridization',
    unit: 'Unit I: Molecular Structure, Bonding & Reactivity',
    unitNum: 'I',
    shortDesc: 'Atomic wavefunctions (s, p, d), sp/sp²/sp³ mixing, σ and π bonding in CH₄, C₂H₄, C₂H₂.',
    icon: '⚛️',
    difficulty: 'Foundation',
    estMinutes: 20,
  },
  {
    id: 'stereochemistry',
    title: 'Conformations and Stereochemistry',
    unit: 'Unit I: Molecular Structure, Bonding & Reactivity',
    unitNum: 'I',
    shortDesc: 'Newman & Sawhorse projections, staggered/eclipsed barriers, chiral R/S enantiomers, E/Z isomers.',
    icon: '🔄',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: 'organic-mechanisms',
    title: 'Organic Reaction Mechanisms (SN1, SN2, E1, E2)',
    unit: 'Unit II: Organic Chemistry & Mechanisms',
    unitNum: 'II',
    shortDesc: 'Backside attack & Walden inversion, carbocation ionization, anti-periplanar E2 elimination.',
    icon: '🧪',
    difficulty: 'Intermediate',
    estMinutes: 30,
  },
  {
    id: 'aromatic-reactions',
    title: 'Aromaticity & Functional Group Transformations',
    unit: 'Unit II: Organic Chemistry & Mechanisms',
    unitNum: 'II',
    shortDesc: 'Planar 6π delocalization, EAS Wheland σ-complex, alcohol oxidation cascade, Azo-dye coupling.',
    icon: '🎨',
    difficulty: 'Advanced',
    estMinutes: 30,
  },
  {
    id: 'polymerization',
    title: 'Polymerization at the Molecular Scale',
    unit: 'Unit III: Polymers & Coordination Chemistry',
    unitNum: 'III',
    shortDesc: 'Radical chain addition, Nylon condensation with H₂O elimination, isotactic tacticity, 3D crosslinks.',
    icon: '🧬',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: 'coordination-chemistry',
    title: 'Coordination Chemistry & Crystal Field Theory',
    unit: 'Unit III: Polymers & Coordination Chemistry',
    unitNum: 'III',
    shortDesc: 'Octahedral/tetrahedral geometries, 3D d-orbitals, CFT splitting Δo, visible colors & magnetic moments.',
    icon: '💎',
    difficulty: 'Advanced',
    estMinutes: 30,
  },
  {
    id: 'phase-transitions',
    title: 'Phase Transitions & Water Phase Diagram',
    unit: 'Unit IV: Thermodynamics, Electrochemistry & Kinetics',
    unitNum: 'IV',
    shortDesc: 'Hexagonal Ice Ih lattice, dynamic liquid H-bonds, vapor motion, Triple Point and Critical Point.',
    icon: '❄️',
    difficulty: 'Intermediate',
    estMinutes: 20,
  },
  {
    id: 'lithium-ion',
    title: 'Lithium-Ion Battery Intercalation Cell',
    unit: 'Unit IV: Thermodynamics, Electrochemistry & Kinetics',
    unitNum: 'IV',
    shortDesc: 'LiCoO₂ cathode to graphite anode intercalation, SEI layer, and Li⁺ ion transport through electrolyte.',
    icon: '🔋',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: 'lead-acid',
    title: 'Lead-Acid Secondary Storage Accumulator',
    unit: 'Unit IV: Thermodynamics, Electrochemistry & Kinetics',
    unitNum: 'IV',
    shortDesc: 'Pb sponge anode and PbO₂ cathode conversion to PbSO₄ in 4.5 M H₂SO₄ with double sulfate theory.',
    icon: '⚡',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: 'pem-fuel-cell',
    title: 'PEM Fuel Cell (Proton Exchange Membrane)',
    unit: 'Unit IV: Thermodynamics, Electrochemistry & Kinetics',
    unitNum: 'IV',
    shortDesc: 'Pt nanoparticle HOR catalysis, Nafion proton conduction, and 4e⁻ ORR forming clean water.',
    icon: '💧',
    difficulty: 'Advanced',
    estMinutes: 30,
  },
  {
    id: 'adsorption-catalysis',
    title: 'Surface Adsorption & Heterogeneous Catalysis',
    unit: 'Unit V: Surface Chemistry, Spectroscopy & Chromatography',
    unitNum: 'V',
    shortDesc: 'Langmuir/Freundlich isotherms, physisorption vs chemisorption, Haber ammonia synthesis on Fe surface.',
    icon: '🧱',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: 'chromatography',
    title: 'Chromatography Principles & Instrumentation',
    unit: 'Unit V: Surface Chemistry, Spectroscopy & Chromatography',
    unitNum: 'V',
    shortDesc: 'Partition coefficients, van Deemter plate height HETP, HPLC C18 column, and Gas Chromatography capillary.',
    icon: '📊',
    difficulty: 'Advanced',
    estMinutes: 30,
  },
  {
    id: 'spectroscopy',
    title: 'Spectroscopy (UV-Vis, FTIR, and NMR)',
    unit: 'Unit V: Surface Chemistry, Spectroscopy & Chromatography',
    unitNum: 'V',
    shortDesc: 'Beer-Lambert optical path, FTIR asymmetric stretch, 9.4 Tesla NMR Zeeman spin splitting.',
    icon: '🔬',
    difficulty: 'Advanced',
    estMinutes: 35,
  },
];

function adaptElectrochemController(ecController: any): SimulationController {
  return {
    play: () => ecController?.play?.(),
    pause: () => ecController?.pause?.(),
    reset: () => ecController?.reset?.(),
    setSpeed: (spd: number) => ecController?.setSpeed?.(spd),
    getSpeed: () => (typeof ecController?.getSpeed === 'function' ? ecController.getSpeed() : 1.0),
    setStage: (idx: number) => ecController?.setStage?.(idx),
    getStage: () => (typeof ecController?.getStage === 'function' ? ecController.getStage() : 0),
    nextStage: () => ecController?.nextStage?.(),
    prevStage: () => ecController?.prevStage?.(),
    getStages: () => ecController?.getStages?.() || [],
    setMode: (m: string) => ecController?.setMode?.(m),
    getMode: () => ecController?.getMode?.() || 'normal',
    setTheme: (th: 'light' | 'dark') => {
      if (ecController?.setTheme) ecController.setTheme(th);
    },
    setViewMode: (_vm: string) => {},
    getViewMode: () => 'default',
    resetCamera: () => ecController?.resetCamera?.(),
    setCameraPreset: (preset: string) => {
      if (ecController?.setCameraPreset) ecController.setCameraPreset(preset);
    },
    inspectComponent: (comp: string | null) => ecController?.inspectComponent?.(comp),
    toggleLabels: (vis?: boolean) => ecController?.toggleLabels?.(vis),
    getComponents: () => ecController?.getComponents?.() || [],
    setParameter: (key: string, val: any) => {
      if (ecController?.setParameter) ecController.setParameter(key, val);
    },
    getParameter: (key: string) => ecController?.getParameter?.(key),
    getParameterDefinitions: () => ecController?.getParameterDefinitions?.() || [],
    getState: () => {
      const st = ecController?.getState ? ecController.getState() : {};
      return {
        viewMode: 'default',
        parameters: {},
        ...st,
      };
    },
    onStateChange: (cb: (st: any) => void) => (ecController?.onStateChange ? ecController.onStateChange(cb) : () => {}),
    dispose: () => {
      if (ecController && typeof ecController.dispose === 'function') {
        ecController.dispose();
      }
    },
  };
}

interface ChemistryVirtualLabWorkspaceProps {
  initialSim?: ChemSimId;
  onExit?: () => void;
}

export const ChemistryVirtualLabWorkspace: React.FC<ChemistryVirtualLabWorkspaceProps> = ({
  initialSim = 'molecular-orbitals',
  onExit,
}) => {
  const [activeSimId, setActiveSimId] = useState<ChemSimId>(initialSim);
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SimulationController | null>(null);

  // Theme State: defaults to 'light' per user specification (pure white bg, deep black text)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('eduverse_chem_theme') : null;
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  // Synced Controller State
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [stages, setStages] = useState<StageDefinition[]>([]);
  const [selectedComp, setSelectedComp] = useState<ComponentInspectionData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'inspect' | 'controls'>('guide');

  // Modals & Navigation
  const [isSimSwitcherOpen, setIsSimSwitcherOpen] = useState(false);
  const [isHelpTourOpen, setIsHelpTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const activeMeta = CHEMISTRY_SIMULATIONS.find((s) => s.id === activeSimId) || CHEMISTRY_SIMULATIONS[0]!;

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eduverse_chem_theme', next);
    }
    controllerRef.current?.setTheme?.(next);
  };

  // Mount/Unmount simulation when activeSimId changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous controller
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

    let controller: SimulationController;
    switch (activeSimId) {
      case 'molecular-orbitals':
        controller = mountMolecularOrbitalsSimulation(container, opts);
        break;
      case 'organic-mechanisms':
        controller = mountOrganicMechanismsSimulation(container, opts);
        break;
      case 'stereochemistry':
        controller = mountStereochemistrySimulation(container, opts);
        break;
      case 'aromatic-reactions':
        controller = mountAromaticReactionsSimulation(container, opts);
        break;
      case 'polymerization':
        controller = mountPolymerizationSimulation(container, opts);
        break;
      case 'coordination-chemistry':
        controller = mountCoordinationChemistrySimulation(container, opts);
        break;
      case 'phase-transitions':
        controller = mountPhaseTransitionsSimulation(container, opts);
        break;
      case 'adsorption-catalysis':
        controller = mountAdsorptionCatalysisSimulation(container, opts);
        break;
      case 'chromatography':
        controller = mountChromatographySimulation(container, opts);
        break;
      case 'spectroscopy':
        controller = mountSpectroscopySimulation(container, opts);
        break;
      case 'lithium-ion':
        controller = adaptElectrochemController(mountLithiumIonSimulation(container, opts as any));
        break;
      case 'lead-acid':
        controller = adaptElectrochemController(mountLeadAcidSimulation(container, opts as any));
        break;
      case 'pem-fuel-cell':
        controller = adaptElectrochemController(mountPEMFuelCellSimulation(container, opts as any));
        break;
      default:
        controller = mountMolecularOrbitalsSimulation(container, opts);
        break;
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

  // Sync theme changes to active simulation
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

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        controllerRef.current?.nextStage();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        controllerRef.current?.prevStage();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        controllerRef.current?.reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentStage = stages[simState?.currentStageIndex ?? 0];
  const isLight = theme === 'light';

  return (
    <div
      className={`flex flex-col h-screen w-full overflow-hidden font-sans select-none transition-colors duration-200 ${
        isLight ? 'bg-white text-slate-900' : 'bg-[#0F2419] text-slate-100'
      }`}
    >
      {/* Top Header Bar */}
      <header
        className={`h-16 px-4 flex items-center justify-between shrink-0 z-20 backdrop-blur-md border-b transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-950/80 border-emerald-950/50 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimSwitcherOpen(true)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-colors text-left ${
              isLight
                ? 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/70 text-slate-900'
                : 'bg-emerald-950/40 border-emerald-800/50 hover:bg-emerald-900/40 text-slate-100'
            }`}
          >
            <span className="text-xl">{activeMeta.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
                  {activeMeta.title}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                    isLight
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  Unit {activeMeta.unitNum}
                </span>
              </div>
              <p className={`text-[11px] truncate max-w-[280px] sm:max-w-md ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                {activeMeta.unit}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 ml-1 ${isLight ? 'text-emerald-700' : 'text-emerald-500'}`} />
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition shadow-sm ${
              isLight
                ? 'bg-white border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300'
                : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline font-medium">{isLight ? 'Dark' : 'Light'}</span>
          </button>

          <button
            onClick={() => setIsHelpTourOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-800/60'
            }`}
            title="Interactive Guided Tour"
          >
            <HelpCircle className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">Help & Tour</span>
          </button>

          <button
            onClick={() => controllerRef.current?.reset()}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-800/60'
            }`}
            title="Reset Experiment (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-md border transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400'
            }`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className={`p-1.5 rounded-md border transition ml-2 ${
                isLight
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700'
                  : 'bg-red-950/40 border-red-900/50 text-red-300 hover:bg-red-900/50'
              }`}
              title="Exit Virtual Laboratory"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D WebGL Canvas Viewport */}
        <main
          className={`flex-1 relative overflow-hidden transition-colors ${
            isLight ? 'bg-white' : 'bg-slate-950'
          }`}
        >
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Quick HUD Overlays */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
            <div
              className={`px-3 py-1.5 rounded-md border backdrop-blur-sm shadow-md text-xs pointer-events-auto ${
                isLight
                  ? 'bg-white/95 border-slate-200 text-slate-700 font-medium'
                  : 'bg-slate-900/85 border-slate-800/80 text-slate-400'
              }`}
            >
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Controls: </span>
              <span className={isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-medium'}>Left Drag:</span> Rotate ·{' '}
              <span className={isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-medium'}>Right Drag:</span> Pan ·{' '}
              <span className={isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-medium'}>Scroll:</span> Zoom
            </div>

            {selectedComp && (
              <div
                className={`px-3 py-2 rounded-md border backdrop-blur-sm shadow-xl max-w-sm pointer-events-auto flex items-start justify-between gap-3 animate-fade-in ${
                  isLight
                    ? 'bg-white/95 border-emerald-300 text-slate-900'
                    : 'bg-emerald-950/90 border-emerald-700/80 text-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Eye className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <span className={`text-xs font-bold ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
                      {selectedComp.name}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 line-clamp-2 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                    {selectedComp.scientificRole}
                  </p>
                </div>
                <button
                  onClick={() => controllerRef.current?.inspectComponent(null)}
                  className={`p-0.5 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Stage Timeline & Playback Navigation Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-2">
            {/* Step Pills Timeline */}
            {stages.length > 0 && (
              <div
                className={`flex items-center gap-1.5 overflow-x-auto py-1 px-2 rounded-lg border backdrop-blur-md shadow-xl scrollbar-none ${
                  isLight
                    ? 'bg-white/95 border-slate-200 shadow-slate-200/50'
                    : 'bg-slate-950/80 border-slate-800/70'
                }`}
              >
                {stages.map((stage: StageDefinition, idx: number) => {
                  const isActive = idx === simState?.currentStageIndex;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => controllerRef.current?.setStage(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30'
                          : isLight
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80'
                          : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800/50'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-800 text-white'
                            : isLight
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[150px] sm:max-w-xs">
                        {stage.title.split(':')[1]?.trim() || stage.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Playback Controls Strip */}
            <div
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl ${
                isLight
                  ? 'bg-white/95 border-slate-200 shadow-slate-300/40 text-slate-900'
                  : 'bg-slate-950/90 border-slate-800/80 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => controllerRef.current?.prevStage()}
                  disabled={!simState || simState.currentStageIndex === 0}
                  className={`p-1.5 rounded-md border disabled:opacity-40 disabled:pointer-events-none transition ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-800/60'
                  }`}
                  title="Previous Stage (←)"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-700/30 transition"
                  title="Play / Pause (Space)"
                >
                  {simState?.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{simState?.isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => controllerRef.current?.nextStage()}
                  disabled={!simState || simState.currentStageIndex >= stages.length - 1}
                  className={`p-1.5 rounded-md border disabled:opacity-40 disabled:pointer-events-none transition ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-800/60'
                  }`}
                  title="Next Stage (→)"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Playback Speed Switcher */}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Speed:
                </span>
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => controllerRef.current?.setSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                      simState?.speed === spd
                        ? 'bg-emerald-600 text-white font-bold'
                        : isLight
                        ? 'text-slate-600 hover:text-emerald-700'
                        : 'text-slate-400 hover:text-emerald-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Information & Parameter Panel Drawer */}
        <aside
          className={`w-80 sm:w-96 flex flex-col shrink-0 z-10 backdrop-blur-md overflow-hidden border-l transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
              : 'bg-slate-950/95 border-emerald-950/60 text-slate-100'
          }`}
        >
          {/* Drawer Tab Switcher */}
          <div
            className={`flex border-b text-xs font-semibold ${
              isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-800/80 bg-slate-900/50 text-slate-300'
            }`}
          >
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'guide'
                  ? isLight
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 font-bold'
                    : 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                  : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Learning Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('inspect')}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'inspect'
                  ? isLight
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 font-bold'
                    : 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                  : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspection</span>
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'controls'
                  ? isLight
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 font-bold'
                    : 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                  : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Parameters</span>
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 text-xs ${
              isLight
                ? 'scrollbar-thin scrollbar-thumb-slate-300'
                : 'scrollbar-thin scrollbar-thumb-slate-800'
            }`}
          >
            {activeTab === 'guide' && currentStage && (
              <div className="space-y-4">
                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isLight
                        ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                    }`}
                  >
                    Stage {currentStage.index + 1} of {stages.length}
                  </span>
                  <h3 className={`text-sm font-bold mt-2 leading-snug ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {currentStage.title}
                  </h3>
                  <p className={`mt-1 leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                    {currentStage.shortDescription}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-lg border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800/80'
                  }`}
                >
                  <h4
                    className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? 'text-slate-900' : 'text-slate-300'
                    }`}
                  >
                    <Atom className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    Scientific Explanation
                  </h4>
                  <p className={`leading-relaxed text-[11px] ${isLight ? 'text-slate-800 font-normal' : 'text-slate-300'}`}>
                    {currentStage.detailedExplanation}
                  </p>
                </div>

                {currentStage.chemicalReactions && currentStage.chemicalReactions.length > 0 && (
                  <div
                    className={`p-3 rounded-lg border space-y-1.5 ${
                      isLight
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-emerald-950/30 border-emerald-800/40'
                    }`}
                  >
                    <h4
                      className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isLight ? 'text-emerald-900' : 'text-emerald-300'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                      Key Chemical Principles & Equations
                    </h4>
                    <div className="space-y-1 font-mono text-[11px]">
                      {currentStage.chemicalReactions.map((eqn: string, idx: number) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded border ${
                            isLight
                              ? 'bg-white border-emerald-200 text-emerald-950 shadow-sm font-semibold'
                              : 'bg-slate-950/60 border-emerald-900/40 text-emerald-200'
                          }`}
                        >
                          {eqn}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStage.keyTerminology && currentStage.keyTerminology.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-400'}`}>
                      Key Scientific Terminology
                    </h4>
                    <div className="space-y-1.5">
                      {currentStage.keyTerminology.map((term: { term: string; definition: string }, idx: number) => (
                        <div
                          key={idx}
                          className={`p-2 rounded border ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800/60'
                          }`}
                        >
                          <span className={`font-bold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                            {term.term}:{' '}
                          </span>
                          <span className={`text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                            {term.definition}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inspect' && (
              <div className="space-y-4">
                {selectedComp ? (
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isLight
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                            : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                        }`}
                      >
                        {selectedComp.category}
                      </span>
                      <button
                        onClick={() => controllerRef.current?.inspectComponent(null)}
                        className={`text-[11px] underline ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Reset Selection
                      </button>
                    </div>

                    <div>
                      <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                        {selectedComp.name}
                      </h3>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {selectedComp.material}
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-lg border space-y-1.5 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800/80'
                      }`}
                    >
                      <h4 className={`text-[11px] font-bold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                        Scientific Function
                      </h4>
                      <p className={`leading-relaxed text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                        {selectedComp.scientificRole}
                      </p>
                    </div>

                    {selectedComp.specifications && (
                      <div
                        className={`p-3 rounded-lg border space-y-1.5 ${
                          isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-900/80 border-slate-800/80'
                        }`}
                      >
                        <h4 className={`text-[11px] font-bold ${isLight ? 'text-emerald-900' : 'text-slate-300'}`}>
                          Technical Specifications
                        </h4>
                        <p className={`font-mono text-[11px] ${isLight ? 'text-emerald-900 font-semibold' : 'text-emerald-300'}`}>
                          {selectedComp.specifications}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`p-6 text-center space-y-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Eye className={`w-8 h-8 mx-auto ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
                    <p className="text-xs">
                      Click on any 3D component, atom, or orbital in the viewport to inspect its detailed chemical specifications and role.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="space-y-4">
                <h4
                  className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isLight ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  <Sliders className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  Interactive Experiment Controls
                </h4>
                <div
                  className={`p-3 rounded-lg border space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800/80'
                  }`}
                >
                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      Playback Velocity
                    </label>
                    <input
                      type="range"
                      min="0.25"
                      max="3.0"
                      step="0.25"
                      value={simState?.speed || 1.0}
                      onChange={(e) => controllerRef.current?.setSpeed(parseFloat(e.target.value))}
                      className={`w-full accent-emerald-500 h-1.5 rounded-lg cursor-pointer ${
                        isLight ? 'bg-slate-300' : 'bg-slate-800'
                      }`}
                    />
                    <div className={`flex justify-between text-[10px] mt-0.5 ${isLight ? 'text-slate-500 font-medium' : 'text-slate-500'}`}>
                      <span>0.25x (Slow)</span>
                      <span>{simState?.speed || 1.0}x</span>
                      <span>3.0x (Fast)</span>
                    </div>
                  </div>

                  <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
                    <button
                      onClick={() => controllerRef.current?.reset()}
                      className={`w-full py-2 rounded-md text-xs font-semibold transition ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      Reset Camera & Orientation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Simulation Selector Modal */}
      {isSimSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className={`p-4 px-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  <FlaskConical className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  KPRIET Engineering Chemistry Virtual Laboratory Catalogue
                </h2>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Select from 13 comprehensive interactive 3D simulations covering Units I to V.
                </p>
              </div>
              <button
                onClick={() => setIsSimSwitcherOpen(false)}
                className={`p-1 rounded-lg transition ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`flex-1 overflow-y-auto p-6 space-y-6 ${
                isLight ? 'scrollbar-thin scrollbar-thumb-slate-300' : 'scrollbar-thin scrollbar-thumb-slate-800'
              }`}
            >
              {(['I', 'II', 'III', 'IV', 'V'] as const).map((unitNum) => {
                const unitSims = CHEMISTRY_SIMULATIONS.filter((s) => s.unitNum === unitNum);
                const unitTitles: Record<string, string> = {
                  I: 'Unit I — Molecular Structure, Bonding & Reactivity',
                  II: 'Unit II — Organic Chemistry & Reaction Mechanisms',
                  III: 'Unit III — Polymers & Coordination Chemistry',
                  IV: 'Unit IV — Thermodynamics, Electrochemistry & Kinetics',
                  V: 'Unit V — Surface Chemistry, Spectroscopy & Chromatography',
                };
                return (
                  <div key={unitNum} className="space-y-3">
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                        isLight ? 'text-emerald-800 border-emerald-200' : 'text-emerald-400 border-emerald-950'
                      }`}
                    >
                      {unitTitles[unitNum]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {unitSims.map((sim) => {
                        const isSelected = sim.id === activeSimId;
                        return (
                          <button
                            key={sim.id}
                            onClick={() => {
                              setActiveSimId(sim.id);
                              setIsSimSwitcherOpen(false);
                            }}
                            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? isLight
                                  ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                                  : 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950'
                                : isLight
                                ? 'bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 shadow-sm'
                                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl">{sim.icon}</span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {sim.difficulty}
                                </span>
                              </div>
                              <h4 className={`font-bold text-xs mt-2 leading-snug ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                                {sim.title}
                              </h4>
                              <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                {sim.shortDesc}
                              </p>
                            </div>
                            <div
                              className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${
                                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-500'
                              }`}
                            >
                              <span>Est. {sim.estMinutes} mins</span>
                              <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                {isSelected ? 'Active' : 'Launch →'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Guided Tour Modal */}
      {isHelpTourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-emerald-800' : 'text-emerald-400'
                }`}
              >
                Virtual Laboratory Tour ({tourStep + 1}/5)
              </span>
              <button
                onClick={() => setIsHelpTourOpen(false)}
                className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {tourStep === 0 && (
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  1. Orbit, Pan, and Zoom Navigation
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Use your mouse or trackpad to explore the 3D scene: Left-click and drag to rotate around the molecules or equipment; Right-click and drag to pan; Scroll wheel to zoom in and out.
                </p>
              </div>
            )}
            {tourStep === 1 && (
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  2. Inspecting Components & Molecules
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Click on any atom, bond, orbital, or instrument part in the 3D viewport. The right-hand inspection drawer will reveal its exact chemical identity, bonding parameters, and scientific role.
                </p>
              </div>
            )}
            {tourStep === 2 && (
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  3. Guided Pedagogical Stages
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Every simulation contains discrete guided stages arranged in causal scientific order. Use the numbered timeline pills or arrow keys to step through reactions, orbital overlaps, or instrumentation steps.
                </p>
              </div>
            )}
            {tourStep === 3 && (
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  4. Playback Controls
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Press the Play button (or Spacebar) to animate dynamic molecular vibrations, radical chain growths, or chromatographic migrations. Adjust playback speed between 0.5x and 2.0x as needed.
                </p>
              </div>
            )}
            {tourStep === 4 && (
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  5. Reset & Keyboard Shortcuts
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Press 'R' at any time to reset the camera and experiment to their default baseline. Use the catalogue button in the top header to freely switch between all 13 virtual laboratory simulations!
                </p>
              </div>
            )}

            <div className={`flex items-center justify-between pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setTourStep((prev) => Math.max(0, prev - 1))}
                disabled={tourStep === 0}
                className={`px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-40 ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Previous
              </button>
              {tourStep < 4 ? (
                <button
                  onClick={() => setTourStep((prev) => prev + 1)}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setIsHelpTourOpen(false)}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
