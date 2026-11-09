/**
 * SimulationShell — Standardized Simulation Presentation Wrapper
 *
 * Wraps the existing canvas-based simulation engine in the Eduverse
 * "Operating Systems Simulation Library" shell UI:
 *   • Header with breadcrumb, subject identity, Fullscreen, Smart Board, Close
 *   • Control bar: Curriculum Unit selector, Simulation Topic selector,
 *     Play/Pause, Previous, Next Step, Reset, Speed
 *   • Main area: Left = canvas + metrics HUD, Right = Algorithmic Logic +
 *     Performance Metrics + tabbed sidebar (Parameters / Theory / AI)
 *   • Status bar at bottom
 *   • Light / Dark theme toggle
 *
 * This component is PURELY a presentation wrapper.
 * It does NOT rewrite simulation logic — it delegates all canvas/engine work
 * to the existing engine.createInitialState / update / render cycle.
 */
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type {
  ISimulationDefinition,
  IAssignedSimulation,
} from './types';
import { getDomainColor } from './types';
import {
  askSimulationAi,
  getDefaultQuestions,
  getContextualQuestions,
  normalizeSimulationContext,
  type ISimulationAiResponse,
} from './simulation-ai-context';
import { FoundationalAudio, FoundationalNarrator } from './school/foundational-kit';
import { EarlyYears3DView } from './school/EarlyYears3DView';
import { PhysicsDataStorage3DView } from './physics/PhysicsDataStorage3DView';
import { resolveU25RPHU02SimId } from './u25rphu02';
import { EssentialsComputingView } from './computing/EssentialsComputingView';
import { resolveU25CS102SimId } from './u25cs102';
import { MakerspaceWorkshopView } from './makerspace/MakerspaceWorkshopView';
import { resolveU25RGE01SimId } from './u25rge01';
import { PhysicsCivilLabView } from './physics-civil/PhysicsCivilLabView';
import { resolveU25RPH06SimId } from './u25rph06';
import { MechanicsVirtualLabWorkspace } from './mechanics-3d';
import { toMechanics3DSimId } from './u25rme201';
import { StrengthOfMaterialsWorkspace } from './strength-materials-3d/react/StrengthOfMaterialsWorkspace';
import { toSom3DSimId } from './strength-materials-3d/u25ce301';
import { ConcreteLabWorkspace } from './concrete-tech-3d/react/ConcreteLabWorkspace';
import { toConcrete3DSimId } from './concrete-tech-3d/u25ce304';
import { SurveyLabWorkspace } from './engineering-survey-3d/react/SurveyLabWorkspace';
import { toSurvey3DSimId } from './engineering-survey-3d/u25ce303';
import { HydraulicLabWorkspace } from './hydraulic-lab-3d/react/HydraulicLabWorkspace';
import { toHydraulic3DSimId } from './u25ce401';
import { GeotechnicalLabWorkspace } from './geotechnical-lab-3d/react/GeotechnicalLabWorkspace';
import { toGeotechnical3DSimId } from './u25ce404';
import { HighwayLabWorkspace } from './highway-lab-3d/react/HighwayLabWorkspace';
import { resolveU25CE402SimId } from './u25ce402';
import { WaterLabWorkspace } from './water-lab-3d/react/WaterLabWorkspace';
import { resolveU25CE403SimId } from './u25ce403';
import { FluidMachineryWorkspace } from './fluid-machinery-3d/react/FluidMachineryWorkspace';
import { resolveU25MEG05SimId } from './u25meg05';
import { MechanicsSolidsWorkspace } from './mechanics-solids-3d/react/MechanicsSolidsWorkspace';
import { resolveU25ME303SimId } from './u25me303';
import { ManufacturingTechWorkspace } from './manufacturing-tech-3d/react/ManufacturingTechWorkspace';
import { resolveU25ME304SimId } from './u25me304';
import { MetallurgyWorkspace } from './materials-metallurgy-3d/react/MetallurgyWorkspace';
import { resolveU25ME302SimId } from './u25me302';
import { ElectricalDrivesWorkspace } from './electrical-drives-3d/react/ElectricalDrivesWorkspace';
import { resolveU25EE305SimId } from './u25ee305';
import { NumericalMethodsWorkspace } from './numerical-methods-pde/react/NumericalMethodsWorkspace';
import { resolveU25MA402SimId } from './u25ma402';
import { ManufacturingTech2Workspace } from './manufacturing-tech-2/react/ManufacturingTech2Workspace';
import { resolveU25ME401SimId } from './u25me401';
import { ThermalEngineeringWorkspace } from './thermal-engineering/react/ThermalEngineeringWorkspace';
import { resolveU25ME402SimId } from './u25me402';
import { getEngineeringContext } from './engineering-context.data';
import { EngineeringContextPanel } from './EngineeringContextPanel';

/* ─────────────────────────── theme system ──────────────────────── */

type ShellTheme = 'dark' | 'light';

/**
 * Semantic colour tokens resolved per theme.
 * Every UI element reads from `t` — never from hardcoded slate-xxx.
 */
function themeTokens(theme: ShellTheme) {
  const dark = theme === 'dark';
  return {
    // ── root ──
    rootBg:        dark ? 'bg-slate-950'       : 'bg-white',
    rootText:      dark ? 'text-slate-100'      : 'text-slate-800',
    rootBorder:    dark ? 'border-slate-800'     : 'border-slate-200',
    // ── header / status ──
    headerBg:      dark ? 'bg-slate-900/90'      : 'bg-slate-50/95',
    headerBorder:  dark ? 'border-slate-800'     : 'border-slate-200',
    // ── control bar ──
    ctrlBg:        dark ? 'bg-slate-900/60'      : 'bg-slate-100/80',
    ctrlBorder:    dark ? 'border-slate-800/80'  : 'border-slate-200',
    // ── canvas area ──
    canvasBg:      dark ? 'bg-black'             : 'bg-slate-100',
    canvasLabelBg: '',
    // ── sidebar ──
    sidebarBg:     dark ? 'bg-slate-900/95'      : 'bg-white',
    sidebarBorder: dark ? 'border-slate-800'     : 'border-slate-200',
    tabBarBg:      dark ? 'bg-slate-950/60'      : 'bg-slate-50',
    tabActive:     dark ? 'border-indigo-500 text-indigo-400 bg-slate-900/50' : 'border-indigo-600 text-indigo-600 bg-indigo-50/60',
    tabInactive:   dark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-700',
    // ── surfaces ──
    surfaceBg:     dark ? 'bg-slate-800'         : 'bg-slate-100',
    surfaceBorder: dark ? 'border-slate-700'     : 'border-slate-300',
    surfaceHover:  dark ? 'hover:bg-slate-700'   : 'hover:bg-slate-200',
    surfaceDeep:   dark ? 'bg-slate-950'         : 'bg-slate-50',
    surfaceDeepBg: dark ? 'bg-slate-950/80'      : 'bg-slate-50/80',
    surfaceCard:   dark ? 'bg-slate-900/85'      : 'bg-white/90',
    surfaceCardBorder: dark ? 'border-slate-700/80' : 'border-slate-200',
    // ── text ──
    textPrimary:   dark ? 'text-slate-100'       : 'text-slate-900',
    textSecondary: dark ? 'text-slate-200'       : 'text-slate-700',
    textMuted:     dark ? 'text-slate-400'       : 'text-slate-500',
    textDimmed:    dark ? 'text-slate-500'       : 'text-slate-400',
    textAccent:    dark ? 'text-indigo-400'       : 'text-indigo-600',
    textAccent2:   dark ? 'text-indigo-300'       : 'text-indigo-700',
    // ── inputs ──
    inputBg:       dark ? 'bg-slate-800'         : 'bg-white',
    inputBorder:   dark ? 'border-slate-700'     : 'border-slate-300',
    inputText:     dark ? 'text-slate-200'       : 'text-slate-800',
    inputFocus:    'focus:ring-2 focus:ring-indigo-500',
    inputDeepBg:   dark ? 'bg-slate-950'         : 'bg-slate-50',
    // ── buttons ──
    btnSecondary:  dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                       : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300',
    btnClose:      dark ? 'text-slate-500 hover:text-white hover:bg-slate-800'
                       : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100',
    // ── dividers ──
    divider:       dark ? 'bg-slate-800'         : 'bg-slate-200',
    // ── metrics HUD ──
    hudBg:         dark ? 'bg-slate-900/85 backdrop-blur-md border-slate-700/80'
                       : 'bg-white/90 backdrop-blur-md border-slate-200 shadow-md',
    hudLabel:      dark ? 'text-slate-400'       : 'text-slate-500',
    hudBadge:      dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600',
    // ── AI tab ──
    aiContextBg:   dark ? 'bg-slate-950/80 border-indigo-500/30'
                       : 'bg-indigo-50/60 border-indigo-200',
    aiContextLabel:dark ? 'text-indigo-300'      : 'text-indigo-700',
    aiContextBadge:dark ? 'bg-indigo-950 text-indigo-300 border-indigo-800/40'
                       : 'bg-indigo-100 text-indigo-700 border-indigo-200',
    aiBtnBg:       dark ? 'bg-slate-800/80 hover:bg-indigo-950/60 border-slate-700 hover:border-indigo-500/60 text-slate-200'
                       : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-400 text-slate-700',
    aiCtxBtnBg:    dark ? 'bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-800/50 hover:border-indigo-500/70 text-indigo-200'
                       : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-400 text-indigo-700',
    aiLoadBg:      dark ? 'bg-slate-950/90 border-indigo-500/40'
                       : 'bg-indigo-50 border-indigo-200',
    aiLoadText:    dark ? 'text-indigo-300'      : 'text-indigo-700',
    aiLoadSub:     dark ? 'text-slate-400'       : 'text-slate-500',
    aiSpinner:     dark ? 'border-indigo-400 border-t-transparent'
                       : 'border-indigo-600 border-t-transparent',
    aiErrorBg:     dark ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                       : 'bg-rose-50 border-rose-200 text-rose-700',
    aiResponseBg:  dark ? 'bg-slate-950/90 border-slate-700/80'
                       : 'bg-white border-slate-200',
    aiResponseBorder: dark ? 'border-slate-800'  : 'border-slate-200',
    aiAnswerBg:    dark ? 'bg-slate-900 border-slate-800 text-slate-100'
                       : 'bg-slate-50 border-slate-200 text-slate-900',
    aiExplText:    dark ? 'text-slate-300'       : 'text-slate-600',
    aiExtrText:    dark ? 'text-slate-400'       : 'text-slate-500',
    // ── formula bar ──
    formulaBg:     dark ? 'bg-slate-900/60 border-slate-800/80'
                       : 'bg-slate-50/80 border-slate-200',
    formulaText:   dark ? 'text-slate-300'       : 'text-slate-600',
    // ── unit badges ──
    unitBadgeBg:   dark ? 'bg-indigo-950 text-indigo-300'
                       : 'bg-indigo-100 text-indigo-700',
    // ── checkboxes / booleans ──
    boolCard:      dark ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                       : 'bg-slate-50 border-slate-200 hover:bg-slate-100',
    // ── status bar ──
    statusBg:      dark ? 'bg-slate-900/80 border-slate-800'
                       : 'bg-slate-50/90 border-slate-200',
    playDot:       'bg-emerald-500 animate-pulse',
    pauseDot:      dark ? 'bg-slate-500'         : 'bg-slate-400',
    // ── speed selector ──
    speedActive:   'bg-indigo-600 text-white font-bold',
    speedInactive: dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800',
    // ── copy button ──
    copyBtn:       dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800',
    // ── success badge ──
    successText:   'text-emerald-400',
    // ── slider ──
    sliderTrack:   dark ? 'bg-slate-800'         : 'bg-slate-200',
  };
}

/* ─────────────────────────── props ─────────────────────────────── */

interface SimulationShellProps {
  /** The simulation to display — all metadata + engine come from here. */
  definition: ISimulationDefinition;
  initialParams?: Record<string, any>;
  assignedSimulation?: IAssignedSimulation | null;
  subject?: {
    _id: string;
    subjectName: string;
    subjectCode: string;
    department?: any;
    semester?: any;
  } | null;
  /** All simulations for the same subject (used to populate the topic selector). */
  siblingSimulations?: ISimulationDefinition[];
  /** Callback when the user picks a different simulation from the topic dropdown. */
  onSelectSimulation?: (sim: ISimulationDefinition) => void;
  onClose?: () => void;
  /** Optional direct preview URL for iframe-based engines (Smart Board pages like ma, ep, chem, ee, cn, os, etc.) */
  iframeUrl?: string | null;
  /** Hide the AI assistant tab (public catalogue player: the assistant is a dashboard feature). */
  hideAssistant?: boolean;
  /** Hide the "open on Smart Board" shortcut (content the Smart Board app does not host). */
  hideSmartBoardLink?: boolean;
  /** Whether the simulation is embedded inside Smart Board partition */
  embedded?: boolean;
}

/* ─────────────────────────── helpers ───────────────────────────── */

function domainLabel(domain: string): string {
  return domain.replace(/_/g, ' ');
}

/* ─────────────────────────── component ─────────────────────────── */

export const SimulationShell: React.FC<SimulationShellProps> = ({
  definition,
  initialParams,
  assignedSimulation,
  subject,
  siblingSimulations = [],
  onSelectSimulation,
  onClose,
  iframeUrl,
  hideAssistant = false,
  hideSmartBoardLink = false,
  embedded = false,
}) => {
  /* ── simulation engine state ── */
  const [params, setParams] = useState<Record<string, any>>(() => {
    const defs: Record<string, any> = {};
    for (const p of definition.parameters) defs[p.key] = p.default;
    return {
      ...defs,
      ...(assignedSimulation?.simulationConfig?.initialParams || {}),
      ...(initialParams || {}),
    };
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [stepIndex, setStepIndex] = useState(0);
  const [metricsValues, setMetricsValues] = useState<Record<string, string>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simStateRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  /* ── stage & subject type detectors ── */
  const isFoundationalStage = useMemo(() => {
    const d = definition as any;
    return Boolean(
      d.band === 'GRADES_1_8' ||
      d.level === 'class-1' ||
      d.level === 'class-2' ||
      d.category === 'school mathematics' ||
      d.category === 'school science' ||
      d.tags?.includes('class-1') ||
      d.tags?.includes('class-2') ||
      d.tags?.includes('foundational-stage')
    );
  }, [definition]);

  const isPhysicsDataStorage = useMemo(() => {
    if (!definition) return false;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('physics for data storage') || cat === 'physics-data-storage') return true;
    if (definition.subjectKeywords?.some((k: string) => k.toLowerCase().includes('u25rphu02') || k.toLowerCase().includes('physics for data storage'))) return true;
    if (definition.id?.startsWith('u25rphu02-')) return true;
    return false;
  }, [definition]);

  const isEssentialsComputing = useMemo(() => {
    if (!definition) return false;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('essentials of computing') || cat.includes('computing fundamentals')) return true;
    if (definition.subjectKeywords?.some((k: string) => k.toLowerCase().includes('u25cs102') || k.toLowerCase().includes('u25rcsg02') || k.toLowerCase().includes('essentials of computing'))) return true;
    if (definition.id?.startsWith('u25cs102-')) return true;
    return false;
  }, [definition]);

  const isMakerspace = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'makerspace') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('makerspace')) return true;
    if (definition.subjectKeywords?.some((k: string) => k.toLowerCase().includes('u25rge01') || k.toLowerCase().includes('u25rgeo1') || k.toLowerCase().includes('makerspace'))) return true;
    if (definition.id?.startsWith('u25rge01-') || definition.id?.startsWith('u25rgeo1-')) return true;
    return false;
  }, [definition]);

  const isPhysicsCivil = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'physics-civil') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('physics for civil')) return true;
    if (definition.subjectKeywords?.some((k: string) => k.toLowerCase().includes('u25rph06') || k.toLowerCase().includes('u25ph202') || k.toLowerCase().includes('physics for civil'))) return true;
    if (definition.id?.startsWith('u25rph06-') || definition.id?.startsWith('u25ph202-')) return true;
    return false;
  }, [definition]);

  const isMechanics = useMemo(() => {
    if (!definition) return false;
    // PORT NOTE: school catalogue simulations (category "Mechanics & Kinematics" etc.) run their own canvas engine;
    // the category text match below is meant for the college Engineering Mechanics studio only.
    if ((definition as any).band === 'GRADES_1_8' || (definition as any).band === 'GRADES_9_12') return false;
    if (definition.boardEngine === 'mechanics') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('mechanics')) return true;
    if (definition.subjectKeywords?.some((k: string) => k.toLowerCase().includes('u25rme201') || k.toLowerCase().includes('u25me201') || k.toLowerCase().includes('me3251') || k.toLowerCase().includes('engineering mechanics'))) return true;
    if (definition.id?.startsWith('u25rme201-') || definition.id?.startsWith('u25me201-') || definition.id?.startsWith('mech-')) return true;
    return false;
  }, [definition]);

  const isStrengthOfMaterials = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'som') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('strength of materials')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ce301') ||
          k.toLowerCase().includes('ce3301') ||
          k.toLowerCase().includes('strength of materials')
      )
    )
      return true;
    if (definition.id?.startsWith('u25ce301-') || definition.id?.startsWith('som-')) return true;
    return false;
  }, [definition]);

  const isConcreteTechnology = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'concrete') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('concrete technology') || cat.includes('concrete')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ce304') ||
          k.toLowerCase().includes('concrete technology') ||
          k.toLowerCase().includes('concrete')
      )
    )
      return true;
    if (definition.id?.startsWith('u25ce304-') || definition.id?.startsWith('concrete-')) return true;
    return false;
  }, [definition]);

  const isEngineeringSurvey = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'survey') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('surveying') || cat.includes('engineering survey')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ce303') ||
          k.toLowerCase().includes('engineering survey') ||
          k.toLowerCase().includes('levelling') ||
          k.toLowerCase().includes('theodolite') ||
          k.toLowerCase().includes('traverse')
      )
    )
      return true;
    if (definition.id?.startsWith('u25ce303-') || definition.id?.startsWith('survey-')) return true;
    return false;
  }, [definition]);

  const isHydraulicEngineering = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'hydraulic') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('fluid mechanics') || cat.includes('hydraulic')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ce401') ||
          k.toLowerCase().includes('u25ce406') ||
          k.toLowerCase().includes('fluid mechanics') ||
          k.toLowerCase().includes('hydraulic engineering')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25ce401-') ||
      definition.id?.startsWith('u25ce406-') ||
      definition.id?.startsWith('hydraulic-')
    )
      return true;
    return false;
  }, [definition]);

  const isGeotechnicalEngineering = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'geotechnical') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('geotechnical') || cat.includes('soil')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ce404') ||
          k.toLowerCase().includes('geotechnical') ||
          k.toLowerCase().includes('soil mechanics')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25ce404-') ||
      definition.id?.startsWith('geotechnical-') ||
      definition.id?.startsWith('soil-')
    )
      return true;
    return false;
  }, [definition]);

  const isHighwayEngineering = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'highway') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('highway') || cat.includes('pavement')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ce402') ||
          k.toLowerCase().includes('highway') ||
          k.toLowerCase().includes('pavement') ||
          k.toLowerCase().includes('road')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25ce402-') ||
      definition.id?.startsWith('highway-') ||
      definition.id?.startsWith('pavement-')
    )
      return true;
    return false;
  }, [definition]);

  const isWaterSupplyEngineering = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'water') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('environmental') || cat.includes('water') || cat.includes('wastewater')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ce403') ||
          k.toLowerCase().includes('u25ce405') ||
          k.toLowerCase().includes('u25ce411') ||
          k.toLowerCase().includes('water') ||
          k.toLowerCase().includes('wastewater') ||
          k.toLowerCase().includes('wtp') ||
          k.toLowerCase().includes('wwtp')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25ce403-') ||
      definition.id?.startsWith('u25ce405-') ||
      definition.id?.startsWith('u25ce411-') ||
      definition.id?.startsWith('water-') ||
      definition.id?.startsWith('wtp-') ||
      definition.id?.startsWith('wwtp-')
    )
      return true;
    return false;
  }, [definition]);

  const isFluidMachinery = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'fluid-machinery') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('fluid-machinery') || cat.includes('fluid mechanics and machinery')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25meg05') ||
          k.toLowerCase().includes('u25me311') ||
          k.toLowerCase().includes('fluid machinery')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25meg05-') ||
      definition.id?.startsWith('fmm-')
    )
      return true;
    return false;
  }, [definition]);

  const isMechanicsOfSolids = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'mechanics-solids') return true;
    const cat = (definition.category || '').toLowerCase();
    if (cat.includes('mechanics of solids') || cat.includes('solid mechanics')) return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25me303') ||
          k.toLowerCase().includes('mechanics of solids') ||
          k.toLowerCase().includes('solid mechanics')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25me303-') ||
      definition.id?.startsWith('mos-')
    )
      return true;
    return false;
  }, [definition]);

  const isManufacturingTechnology = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'manufacturing-tech') return true;
    const cat = (definition.category || '').toLowerCase();
    if (
      cat.includes('manufacturing technology') ||
      cat.includes('manufacturing') ||
      cat.includes('machining') ||
      cat.includes('lathe')
    )
      return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25me304') ||
          k.toLowerCase().includes('me3391') ||
          k.toLowerCase().includes('me8351') ||
          k.toLowerCase().includes('manufacturing technology') ||
          k.toLowerCase().includes('lathe') ||
          k.toLowerCase().includes('turning') ||
          k.toLowerCase().includes('machining')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25me304-') ||
      definition.id?.includes('manufacturing-tech')
    )
      return true;
    return false;
  }, [definition]);

  const isMaterialsMetallurgy = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'materials-metallurgy') return true;
    const cat = (definition.category || '').toLowerCase();
    if (
      cat.includes('materials and metallurgy') ||
      cat.includes('materials & metallurgy') ||
      cat.includes('metallurgy') ||
      cat.includes('material science')
    )
      return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25me302') ||
          k.toLowerCase().includes('me3392') ||
          k.toLowerCase().includes('me8491') ||
          k.toLowerCase().includes('metallurgy') ||
          k.toLowerCase().includes('crystal structures') ||
          k.toLowerCase().includes('heat treatment') ||
          k.toLowerCase().includes('phase diagram')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25me302-') ||
      definition.id?.includes('materials-metallurgy')
    )
      return true;
    return false;
  }, [definition]);

  const isElectricalDrives = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'electrical-drives') return true;
    const cat = (definition.category || '').toLowerCase();
    if (
      cat.includes('electrical drives') ||
      cat.includes('drives and control') ||
      cat.includes('motor control')
    )
      return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ee305') ||
          k.toLowerCase().includes('me3393') ||
          k.toLowerCase().includes('ee8353') ||
          k.toLowerCase().includes('ee6351') ||
          k.toLowerCase().includes('electrical drives') ||
          k.toLowerCase().includes('dc motor') ||
          k.toLowerCase().includes('vfd')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25ee305-') ||
      definition.id?.includes('electrical-drives')
    )
      return true;
    return false;
  }, [definition]);

  const isNumericalMethods = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'numerical-methods') return true;
    const cat = (definition.category || '').toLowerCase();
    if (
      cat.includes('numerical methods') ||
      cat.includes('partial differential') ||
      cat.includes('pde')
    )
      return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25ma402') ||
          k.toLowerCase().includes('ma3351') ||
          k.toLowerCase().includes('ma8452') ||
          k.toLowerCase().includes('numerical methods') ||
          k.toLowerCase().includes('partial differential') ||
          k.toLowerCase().includes('bisection') ||
          k.toLowerCase().includes('newton-raphson')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25ma402-') ||
      definition.id?.includes('numerical-methods')
    )
      return true;
    return false;
  }, [definition]);

  const isManufacturingTechnology2 = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'manufacturing-tech-2') return true;
    const cat = (definition.category || '').toLowerCase();
    if (
      cat.includes('manufacturing technology – ii') ||
      cat.includes('manufacturing technology - ii') ||
      cat.includes('manufacturing technology 2') ||
      cat.includes('manufacturing technology ii') ||
      cat.includes('advanced manufacturing') ||
      cat.includes('cnc machining')
    )
      return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25me401') ||
          k.toLowerCase().includes('me3491') ||
          k.toLowerCase().includes('me8451') ||
          k.toLowerCase().includes('manufacturing technology – ii') ||
          k.toLowerCase().includes('manufacturing technology - ii') ||
          k.toLowerCase().includes('manufacturing technology 2') ||
          k.toLowerCase().includes('manufacturing technology ii') ||
          k.toLowerCase().includes('cnc') ||
          k.toLowerCase().includes('edm') ||
          k.toLowerCase().includes('forming')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25me401-') ||
      definition.id?.includes('manufacturing-tech-2') ||
      definition.id?.startsWith('mfg2-')
    )
      return true;
    return false;
  }, [definition]);

  const isThermalEngineering = useMemo(() => {
    if (!definition) return false;
    if (definition.boardEngine === 'thermal-engineering') return true;
    const cat = (definition.category || '').toLowerCase();
    if (
      cat.includes('thermal engineering') ||
      cat.includes('heat transfer') ||
      cat.includes('heat exchanger') ||
      cat.includes('steam boiler') ||
      cat.includes('refrigeration')
    )
      return true;
    if (
      definition.subjectKeywords?.some(
        (k: string) =>
          k.toLowerCase().includes('u25me402') ||
          k.toLowerCase().includes('me3451') ||
          k.toLowerCase().includes('me8493') ||
          k.toLowerCase().includes('thermal engineering') ||
          k.toLowerCase().includes('heat transfer') ||
          k.toLowerCase().includes('conduction') ||
          k.toLowerCase().includes('lmtd') ||
          k.toLowerCase().includes('boiler') ||
          k.toLowerCase().includes('vcr')
      )
    )
      return true;
    if (
      definition.id?.startsWith('u25me402-') ||
      definition.id?.includes('thermal-engineering') ||
      definition.id?.startsWith('thermal-')
    )
      return true;
    return false;
  }, [definition]);

  /* ── theme state with persistence ── */
  const [theme, setTheme] = useState<ShellTheme>(() => {
    try {
      return (localStorage.getItem('eduverse_sim_theme') as ShellTheme) || 'dark';
    } catch {
      return 'dark';
    }
  });
  const t = useMemo(() => themeTokens(theme), [theme]);
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('eduverse_sim_theme', next);
      } catch {}
      return next;
    });
  };

  /* ── iframe engine mode ── */
  const effectiveIframeUrl = useMemo(() => {
    if (iframeUrl) return iframeUrl.includes('theme=') ? iframeUrl : `${iframeUrl}${iframeUrl.includes('?') ? '&' : '?'}theme=${theme}`;

    // Native React/Three.js studios render directly inside the SimulationShell viewport
    if (
      isPhysicsDataStorage ||
      isEssentialsComputing ||
      isMakerspace ||
      isPhysicsCivil ||
      isMechanics ||
      isStrengthOfMaterials ||
      isConcreteTechnology ||
      isEngineeringSurvey ||
      isHydraulicEngineering ||
      isGeotechnicalEngineering ||
      isHighwayEngineering ||
      isWaterSupplyEngineering ||
      isFluidMachinery ||
      isMechanicsOfSolids ||
      isManufacturingTechnology ||
      isMaterialsMetallurgy ||
      isElectricalDrives ||
      isNumericalMethods ||
      isManufacturingTechnology2 ||
      isThermalEngineering
    )
      return null;

    const is3DChem = /chem-(molecular|organic|stereo|aromatic|polymerization|coordination|phase|adsorption|chromatograph|spectroscop)/i.test(definition.id);
    if (is3DChem) return `/simulations/${encodeURIComponent(definition.id)}/play?embed=1`;

    const is3DPhysics = /u25rph01-|(material-testing|poisson-ratio|material-comparison|cantilever-beam|girders-mems|heat-transfer|thermal-expansion-lees-disc|surface-tension|poiseuille-viscosity|thermal-systems|ultrasonic-waves|piezo-magneto|ultrasonic-velocity|sonar-ranging|ndt-scanning|band-structure|carrier-concentration|carrier-transport-pn|zener-diode|semiconductor-devices|radiation-matter|laser-principles|co2-diode-laser|total-internal-reflection|fibre-endoscopy-sensors)/i.test(definition.id);
    if (is3DPhysics) return `/simulations/${encodeURIComponent(definition.id)}/play?embed=1`;

    const d = definition as any;
    const isPy = d.boardEngine === 'py' || d.pyCategory || /^(u25cs201|py|python)-/.test(d.id);
    const isSh = d.boardEngine === 'sh' || d.shCategory || /^(u25cs202|sh|linux)-/.test(d.id);
    const isPs = d.boardEngine === 'ps' || d.psCategory || /^(u25ma301|u25ma302|ps|prob)-/.test(d.id);
    const isCoa = d.boardEngine === 'coa' || d.coaCategory || /^(u25cs305|u21cs301|coa)-/.test(d.id);
    const isDbms = d.boardEngine === 'dbms' || d.dbmsCategory || /^(u25cs401|u21cs302|u21it302|dbms|sql)-/.test(d.id);
    const isJava = d.boardEngine === 'java' || d.javaCategory || /^(u25cs311|u21ad307|u21cs307|java)-/.test(d.id);
    const isDm = d.boardEngine === 'dm' || d.dmCategory || /^(u25ma401|u21mag02|dm)-/.test(d.id);
    const isDaa = d.boardEngine === 'daa' || d.daaCategory || /^(u25cs403|u21cs401|daa)-/.test(d.id);
    const isEcg = d.boardEngine === 'ecg' || d.ecgCategory || /^(de|ecg)-/.test(d.id);
    const isChem = d.boardEngine === 'chem' || String(d.id).startsWith('chem-');
    const isPdc = d.boardEngine === 'pdc' || d.pdcCategory || /^(pdc|am|fm|comm)-/.test(d.id);
    const isOs = d.boardEngine === 'os' || d.osCategory || String(d.id).startsWith('os-') || d.id === 'cs-os-lab';
    const isDsa = d.boardEngine === 'dsa' || d.dsaCategory || String(d.id).startsWith('dsa-');
    const isC = d.boardEngine === 'c' || d.cCategory || String(d.id).startsWith('c-');
    const isCn = d.boardEngine === 'cn' || String(d.id).startsWith('cn-');
    const isEe = d.boardEngine === 'ee' || String(d.id).startsWith('ee-');
    const isMa = d.boardEngine === 'ma' || String(d.id).startsWith('ma-');
    const isEg = d.boardEngine === 'eg' || String(d.id).startsWith('eg-');
    const isEp = d.boardEngine === 'ep' || String(d.id).startsWith('ep-');

    if (!isPy && !isSh && !isPs && !isCoa && !isDbms && !isJava && !isDm && !isDaa && !isEcg && !isChem && !isPdc && !isOs && !isDsa && !isC && !isCn && !isEe && !isMa && !isEg && !isEp && !d.boardEngine) return null;

    const extra: Record<string, string> = { sim: definition.id, preview: '1', embedded: '1', theme };
    if (definition.unit) extra.unit = String(definition.unit);
    if (definition.title) extra.title = definition.title;
    if (definition.topic) extra.topic = definition.topic;

    const query = new URLSearchParams({
      subjectId: subject?._id || '',
      subjectName: subject?.subjectName || '',
      subjectCode: subject?.subjectCode || '',
      departmentName: (subject?.department as any)?.name || '',
      departmentId: String((subject?.department as any)?._id || ''),
      semesterId: String((subject?.semester as any)?._id || ''),
      semesterNumber: String((subject?.semester as any)?.semesterNumber || 1),
      config: JSON.stringify(params),
      ...extra,
    }).toString();

    const page =
      isPy ? 'py-simulation.html'
      : isSh ? 'sh-simulation.html'
      : isPs ? 'ps-simulation.html'
      : isCoa ? 'coa-simulation.html'
      : isDbms ? 'dbms-simulation.html'
      : isJava ? 'java-simulation.html'
      : isDm ? 'dm-simulation.html'
      : isDaa ? 'daa-simulation.html'
      : isChem ? 'chem-simulation.html'
      : isEe ? 'ee-simulation.html'
      : isMa ? 'ma-simulation.html'
      : isEg ? 'eg-simulation.html'
      : isEp ? 'ep-simulation.html'
      : isCn ? 'cn-simulation.html'
      : isOs ? 'os-simulation.html'
      : isPdc ? 'pdc-simulation.html'
      : isDsa ? 'dsa-simulation.html'
      : isC ? 'c-simulation.html'
      : isEcg ? 'ecg-simulation.html'
      : 'ma-simulation.html';

    return `/smartboard/simulations/${page}?${query}`;
  }, [iframeUrl, definition, subject, isPhysicsDataStorage, isEssentialsComputing, params, theme]);

  const isIframeMode = Boolean(effectiveIframeUrl);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  /* ── shell state ── */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (Boolean(iframeUrl)) return false;
    const d = definition as any;
    if (
      d?.boardEngine === 'numerical-methods' ||
      d?.id?.startsWith('u25ma402-') ||
      d?.boardEngine === 'electrical-drives' ||
      d?.id?.startsWith('u25ee305-') ||
      d?.boardEngine === 'materials-metallurgy' ||
      d?.id?.startsWith('u25me302-') ||
      d?.boardEngine === 'manufacturing-tech' ||
      d?.id?.startsWith('u25me304-') ||
      d?.boardEngine === 'mechanics-solids' ||
      d?.id?.startsWith('u25me303-')
    ) {
      return false;
    }
    const isEarly = d.level === 'class-1' || d.level === 'class-2' || d.tags?.includes('class-1') || d.tags?.includes('class-2');
    return !isEarly;
  });

  const [activeTab, setActiveTab] = useState<'controls' | 'theory' | 'ai'>('controls');
  const shellRef = useRef<HTMLDivElement | null>(null);

  /* ── real-world & engineering context state ── */
  const engineeringContext = useMemo(
    () => definition.engineeringContext || getEngineeringContext(definition.id),
    [definition]
  );
  const [showEngineeringContext, setShowEngineeringContext] = useState(false);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'EDUVERSE_SET_THEME',
          theme,
        }, '*');
      } catch {}
    }
  }, [theme]);

  /* ── forward close messages to parent if embedded & sync theme from iframe ── */
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (!e || !e.data) return;
      const msgType = e.data.type;
      if (msgType === 'EDUVERSE_SIM_CLOSE' || msgType === 'EDUVERSE_DSA_CLOSE' || msgType === 'EDUVERSE_OS_CLOSE' || msgType === 'EDUVERSE_C_CLOSE') {
        if (onClose) {
          onClose();
        } else if (embedded) {
          window.parent.postMessage({ type: 'EDUVERSE_SIM_CLOSE' }, '*');
        }
      }
      if (msgType === 'EDUVERSE_SET_THEME' && (e.data.theme === 'light' || e.data.theme === 'dark')) {
        setTheme(e.data.theme);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [onClose, embedded]);

  /* ── AI state ── */
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<ISimulationAiResponse | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  /* ── re-init when definition changes ── */
  useEffect(() => {
    const defs: Record<string, any> = {};
    for (const p of definition.parameters) defs[p.key] = p.default;
    setParams({
      ...defs,
      ...(assignedSimulation?.simulationConfig?.initialParams || {}),
      ...(initialParams || {}),
    });
    setStepIndex(0);
    setMetricsValues({});
    simStateRef.current = null;
  }, [definition, assignedSimulation, initialParams]);

  /* ── reset helper ── */
  const resetSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 800;
    const h = canvas ? canvas.height : 500;
    if (definition.engine.reset) {
      simStateRef.current = definition.engine.reset(params, w, h);
    } else {
      simStateRef.current = definition.engine.createInitialState(params, w, h);
    }
    setStepIndex(0);
  }, [definition, params]);

  const [earlyYears3DMode, setEarlyYears3DMode] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(() => FoundationalAudio.isMuted());
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);

  const toggleAudioMute = useCallback(() => {
    const next = FoundationalAudio.toggleMute();
    setIsAudioMuted(next);
  }, []);

  const handleSpeakPrompt = useCallback(() => {
    const speechText = `${definition.title}. ${definition.shortDescription || ''}`;
    setIsSpeakingPrompt(true);
    FoundationalNarrator.speak(speechText, { lang: 'en-IN' });
    setTimeout(() => {
      setIsSpeakingPrompt(false);
    }, 3500);
  }, [definition]);

  /* ── animation loop ── */
  useEffect(() => {
    if (isIframeMode) return;
    if (isFoundationalStage && earlyYears3DMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    simStateRef.current = definition.engine.createInitialState(params, w, h);

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const dt = Math.min(rawDt, 0.1) * (isPlaying ? speedMultiplier : 0);

      if (simStateRef.current) {
        simStateRef.current = definition.engine.update(
          simStateRef.current, params, dt, w, h
        );
        ctx.clearRect(0, 0, w, h);
        definition.engine.render(ctx, w, h, simStateRef.current, params);

        const computed: Record<string, string> = {};
        for (const m of definition.metrics) {
          const key = m.id || m.key || m.label;
          if (key) {
            computed[key] = m.format ? m.format(simStateRef.current, params) : '';
          }
        }
        setMetricsValues(computed);

        // auto-advance step index from state if available
        const st = simStateRef.current as any;
        if (st?.currentStep != null) setStepIndex(st.currentStep);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [definition, isPlaying, speedMultiplier, params, isIframeMode, isFoundationalStage, earlyYears3DMode]);

  /* ── single-step forward ── */
  const handleStep = () => {
    if (isIframeMode) return;
    const canvas = canvasRef.current;
    if (!canvas || !simStateRef.current) return;
    const rect = canvas.getBoundingClientRect();
    simStateRef.current = definition.engine.update(
      simStateRef.current, params, 0.03 * speedMultiplier, rect.width, rect.height
    );
    setStepIndex((s) => s + 1);
  };

  /* ── param change ── */
  const handleParamChange = (key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  /* ── canvas pointer handlers (drag, tap, hit-testing) ── */
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !definition.engine.onPointerDown) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = ((e.clientX - rect.left) * scaleX) / dpr;
    const y = ((e.clientY - rect.top) * scaleY) / dpr;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
    definition.engine.onPointerDown(x, y, simStateRef.current, params);
  }, [definition, params]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !definition.engine.onPointerMove) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = ((e.clientX - rect.left) * scaleX) / dpr;
    const y = ((e.clientY - rect.top) * scaleY) / dpr;
    definition.engine.onPointerMove(x, y, simStateRef.current, params);
  }, [definition, params]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    try {
      if (canvasRef.current.hasPointerCapture(e.pointerId)) {
        canvasRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {}
    if (definition.engine.onPointerUp) {
      definition.engine.onPointerUp(simStateRef.current, params);
    }
  }, [definition, params]);

  /* ── AI context ── */
  const simContext = useMemo(() => normalizeSimulationContext({
    subject: subject?.subjectName,
    subjectCode: subject?.subjectCode,
    unit: definition.unit || 1,
    unitTitle: definition.unitTitle || (definition.unit ? `Unit ${definition.unit}` : 'Unit 1'),
    topic: definition.topic || definition.title,
    simulation: assignedSimulation?.title || definition.title,
    simulationId: definition.id,
    parameters: params,
    outputs: metricsValues,
    formulas: definition.formulaOverview,
    curriculumContext: definition.detailedDescription,
  }), [subject, definition, assignedSimulation, params, metricsValues]);

  const defaultQuestions = useMemo(() => getDefaultQuestions(simContext), [simContext]);
  const contextualQuestions = useMemo(() => getContextualQuestions(simContext), [simContext]);

  const handleAskAi = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await askSimulationAi(trimmed, simContext);
      setAiResponse(res);
      setAiQuestion('');
    } catch (err: any) {
      setAiError(err?.message || 'Failed to fetch AI answer.');
    } finally {
      setAiLoading(false);
    }
  };

  /* ── smart board direct launch url ── */
  const smartBoardUrl = useMemo(() => {
    const qs = new URLSearchParams({
      embed: `/simulations/${encodeURIComponent(definition.id)}/play?embed=1`,
      title: definition.title,
      id: definition.id,
      sim: definition.id,
      preset: definition.smartboardPresetKey || definition.id,
      topic: definition.topic || definition.title,
      category: definition.category || '',
      unit: String(definition.unit ?? ''),
      subjectId: subject?._id || '',
      subjectName: subject?.subjectName || '',
      subjectCode: subject?.subjectCode || '',
    });
    return `/smartboard/index.html?${qs.toString()}`;
  }, [subject, definition]);

  /* ── fullscreen toggle ── */
  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  /* ── derived: sibling unit/topic navigation ── */
  const units = useMemo(() => {
    const unitNums = Array.from(
      new Set(siblingSimulations.map((s) => s.unit).filter((u) => u != null))
    ).sort((a, b) => (a as number) - (b as number));
    return unitNums.map((u) => ({
      value: String(u),
      label: `Unit ${u}: ${siblingSimulations.find((s) => s.unit === u)?.unitTitle || ''}`,
      sims: siblingSimulations.filter((s) => s.unit === u),
    }));
  }, [siblingSimulations]);

  const currentUnitSims = useMemo(() => {
    if (definition.unit == null) return siblingSimulations;
    return siblingSimulations.filter((s) => s.unit === definition.unit);
  }, [siblingSimulations, definition.unit]);

  /* ── domain styling ── */
  const domainColors = getDomainColor(definition.domain);

  /* ── pseudocode lines ── */
  const pseudocodeLines = useMemo(() => {
    if (definition.learningObjectives?.length) {
      return definition.learningObjectives.slice(0, 6);
    }
    return [
      'Initialize algorithm data structures',
      'Fetch next pending request/process',
      'Evaluate scheduling/allocation condition',
      'Execute operation and update metrics',
    ];
  }, [definition]);

  /* ═══════════════════════ RENDER ═══════════════════════ */

  if (isFoundationalStage) {
    return (
      <div
        ref={shellRef}
        className={`flex flex-col h-full w-full overflow-hidden select-none bg-sky-50 ${
          isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : 'rounded-2xl border border-sky-200 shadow-2xl'
        }`}
      >
        {/* ONE SINGLE CLEAN, CHILD-FRIENDLY TOP BAR */}
        <header className="flex-shrink-0 z-20 flex items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-sky-200 shadow-xs">
          {/* Left: Icon + Title + Grade badge */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl shadow-xs">
              {definition.icon || '🎈'}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {((definition as any).level === 'class-2' ? 'Class 2' : 'Class 1')}
                </span>
                <h1 className="text-sm sm:text-base font-black tracking-tight truncate" style={{ color: '#0f172a' }}>
                  {definition.title}
                </h1>
              </div>
              <p className="text-[11px] font-bold truncate hidden sm:block" style={{ color: '#475569' }}>
                {(definition as any).topic || (definition as any).curriculumTopic || definition.shortDescription}
              </p>
            </div>
          </div>

          {/* Right: 3D/2D toggle + Read to Me + SFX + Fullscreen + Exit */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 3D vs 2D Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setEarlyYears3DMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  earlyYears3DMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎮 3D World
              </button>
              <button
                type="button"
                onClick={() => setEarlyYears3DMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !earlyYears3DMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎨 2D Story
              </button>
            </div>

            {/* Read to Me Button */}
            <button
              type="button"
              onClick={handleSpeakPrompt}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer border ${
                isSpeakingPrompt
                  ? 'bg-amber-400 text-amber-950 border-amber-500 animate-bounce'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
              title="Read instructions aloud"
            >
              <span>🔊</span>
              <span className="hidden md:inline">Read to Me</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              type="button"
              onClick={toggleAudioMute}
              className={`p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={isAudioMuted ? 'Sound FX Muted' : 'Sound FX On'}
            >
              <span>{isAudioMuted ? '🔕' : '🔔'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
              title="Fullscreen"
            >
              <span>{isFullscreen ? '⊠' : '⛶'}</span>
            </button>

            {/* Exit / Close */}
            {onClose && !embedded && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                ✕ Exit
              </button>
            )}
          </div>
        </header>

        {/* MAIN INTERACTIVE PLAY AREA */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
          {earlyYears3DMode ? (
            <EarlyYears3DView
              simId={definition.id}
              title={definition.title}
              topic={(definition as any).topic || (definition as any).curriculumTopic || definition.shortDescription}
              showHeader={false}
              onClose={onClose}
            />
          ) : (
            <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col bg-white">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full block cursor-pointer select-none touch-none"
              />
              <div className="p-3 bg-white/95 border-t border-slate-200 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs border border-slate-300 cursor-pointer"
                >
                  ↺ Play Again
                </button>
                <button
                  type="button"
                  onClick={handleStep}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Next Step ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300 ${t.rootBg} ${t.rootText} border ${t.rootBorder} ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : 'h-full w-full'
      }`}
    >
      {/* ═══════════════════════════════════════════════════
          HEADER BAND (Clean, Unified Single-Bar Architecture)
          ═══════════════════════════════════════════════════ */}
      <div className={`flex-shrink-0 backdrop-blur-md border-b px-4 py-2.5 ${t.headerBg} ${t.headerBorder}`}>
        <div className="flex items-center justify-between gap-3">
          {/* Left: icon + clean title & breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border ${t.surfaceBg} ${t.surfaceBorder}`}>
              {definition.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-emerald-500">
                <span>{subject?.subjectName || domainLabel(definition.domain)}</span>
                {definition.unit != null && (
                  <>
                    <span className={t.textDimmed}>·</span>
                    <span className={t.textMuted}>Unit {definition.unit}: {definition.unitTitle}</span>
                  </>
                )}
                {definition.topic && (
                  <>
                    <span className={t.textDimmed}>·</span>
                    <span className={t.textDimmed}>{definition.topic}</span>
                  </>
                )}
              </div>
              <h2 className={`text-base sm:text-lg font-bold leading-tight truncate max-w-[34rem] ${t.textPrimary}`}>
                {definition.title}
              </h2>
            </div>
          </div>

          {/* Center: Topic selector when in iframe mode */}
          {isIframeMode && (
            <div className="hidden lg:flex items-center gap-2 min-w-0 flex-1 justify-center max-w-xl mx-2">
              {units.length > 0 && (
                <select
                  value={String(definition.unit ?? '')}
                  onChange={(e) => {
                    const u = Number(e.target.value);
                    const first = siblingSimulations.find((s) => s.unit === u);
                    if (first && onSelectSimulation) onSelectSimulation(first);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border ${t.inputBg} ${t.inputBorder} ${t.inputText} focus:outline-none cursor-pointer max-w-[10rem] truncate`}
                >
                  {units.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              )}
              {currentUnitSims.length > 1 && (
                <select
                  value={definition.id}
                  onChange={(e) => {
                    const sim = currentUnitSims.find((s) => s.id === e.target.value);
                    if (sim && onSelectSimulation) onSelectSimulation(sim);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border ${t.inputBg} ${t.inputBorder} ${t.inputText} focus:outline-none cursor-pointer max-w-[14rem] truncate`}
                >
                  {currentUnitSims.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.title}</option>
                  ))}
                </select>
              )}
              {currentUnitSims.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const idx = currentUnitSims.findIndex((s) => s.id === definition.id);
                      const previous = idx > 0 ? currentUnitSims[idx - 1] : undefined;
                      if (previous && onSelectSimulation) onSelectSimulation(previous);
                    }}
                    disabled={currentUnitSims.findIndex((s) => s.id === definition.id) === 0}
                    className={`px-2 py-1 rounded text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed border transition ${t.btnSecondary}`}
                    title="Previous Topic"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => {
                      const idx = currentUnitSims.findIndex((s) => s.id === definition.id);
                      const next = idx >= 0 && idx < currentUnitSims.length - 1 ? currentUnitSims[idx + 1] : undefined;
                      if (next && onSelectSimulation) onSelectSimulation(next);
                    }}
                    disabled={currentUnitSims.findIndex((s) => s.id === definition.id) === currentUnitSims.length - 1}
                    className="px-2 py-1 rounded text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                    title="Next Topic"
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* ── REAL-WORLD & ENGINEERING CONTEXT ── */}
            {engineeringContext && (
              <button
                type="button"
                onClick={() => setShowEngineeringContext(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 shadow-sm"
                title="Real-World & Engineering Context: What, Where, When, Why & Industrial Applications"
              >
                <span>🌐</span>
                <span className="hidden sm:inline">Engineering Context</span>
              </button>
            )}

            {/* ── TOGGLE PARAMETERS / SIDEBAR ── */}
            {!isIframeMode && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  isSidebarOpen ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : t.btnSecondary
                }`}
                title={isSidebarOpen ? 'Hide Parameters Panel' : 'Show Parameters & Theory'}
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Panel' : 'Parameters & Theory'}</span>
              </button>
            )}

            {/* ── THEME TOGGLE ── */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${t.btnSecondary}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span>{isDark ? '☀️' : '🌙'}</span>
            </button>

            {/* ── FULLSCREEN TOGGLE ── */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${t.btnSecondary}`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              <span>{isFullscreen ? '⊠' : '⛶'}</span>
            </button>

            {/* ── SMART BOARD LAUNCHER (only if not embedded and not hidden) ── */}
            {!hideSmartBoardLink && !embedded && (
              <a
                href={smartBoardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${t.btnSecondary} hover:border-emerald-500 hover:text-emerald-400`}
                title="Launch this simulation directly in Smart Board"
              >
                <span>✨</span>
                <span>Smart Board</span>
              </a>
            )}

            {/* ── CLOSE BUTTON ── */}
            {(onClose || embedded) && (
              <button
                onClick={() => {
                  if (onClose) {
                    onClose();
                  } else if (embedded) {
                    window.parent.postMessage({ type: 'EDUVERSE_SIM_CLOSE' }, '*');
                  }
                }}
                className={`px-2.5 py-1.5 flex items-center gap-1 rounded-lg text-xs font-semibold transition cursor-pointer ${t.btnClose}`}
                title="Close Simulation"
              >
                ✕ <span className="hidden sm:inline">Exit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CONTROL BAR (Native canvas & 3D simulations only)
          ═══════════════════════════════════════════════════ */}
      {!isIframeMode && !isManufacturingTechnology && !isMaterialsMetallurgy && !isElectricalDrives && !isNumericalMethods && !isManufacturingTechnology2 && !isThermalEngineering && (
      <div className={`flex-shrink-0 flex flex-wrap items-center gap-3 px-5 py-2.5 border-b ${t.ctrlBg} ${t.ctrlBorder}`}>
        {/* Curriculum Unit dropdown */}
        {units.length > 0 && (
          <div className="flex items-center gap-2">
            <label className={`text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${t.textMuted}`}>
              Curriculum Unit
            </label>
            <select
              value={String(definition.unit ?? '')}
              onChange={(e) => {
                const u = Number(e.target.value);
                const first = siblingSimulations.find((s) => s.unit === u);
                if (first && onSelectSimulation) onSelectSimulation(first);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border ${t.inputBg} ${t.inputBorder} ${t.inputText} focus:outline-none ${t.inputFocus} cursor-pointer`}
            >
              {units.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Simulation Topic dropdown */}
        {currentUnitSims.length > 1 && (
          <div className="flex items-center gap-2">
            <label className={`text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${t.textMuted}`}>
              Simulation Topic
            </label>
            <select
              value={definition.id}
              onChange={(e) => {
                const sim = currentUnitSims.find((s) => s.id === e.target.value);
                if (sim && onSelectSimulation) onSelectSimulation(sim);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border ${t.inputBg} ${t.inputBorder} ${t.inputText} focus:outline-none ${t.inputFocus} cursor-pointer max-w-[16rem]`}
            >
              {currentUnitSims.map((s) => (
                <option key={s.id} value={s.id}>{s.icon} {s.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls: Iframe Navigation or Canvas Playback */}
        {isIframeMode ? (
          <div className="flex items-center gap-2">
            {/* Previous Topic */}
            {currentUnitSims.length > 1 && (
              <button
                onClick={() => {
                  const idx = currentUnitSims.findIndex((s) => s.id === definition.id);
                  const previous = idx > 0 ? currentUnitSims[idx - 1] : undefined;
                  if (previous && onSelectSimulation) onSelectSimulation(previous);
                }}
                disabled={currentUnitSims.findIndex((s) => s.id === definition.id) === 0}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed border transition cursor-pointer ${t.btnSecondary}`}
              >
                ◀ Previous Topic
              </button>
            )}

            {/* Next Topic */}
            {currentUnitSims.length > 1 && (
              <button
                onClick={() => {
                  const idx = currentUnitSims.findIndex((s) => s.id === definition.id);
                  const next = idx >= 0 && idx < currentUnitSims.length - 1 ? currentUnitSims[idx + 1] : undefined;
                  if (next && onSelectSimulation) onSelectSimulation(next);
                }}
                disabled={currentUnitSims.findIndex((s) => s.id === definition.id) === currentUnitSims.length - 1}
                className="px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              >
                Next Topic ▶
              </button>
            )}

            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg border text-xs font-medium ${t.surfaceBg} ${t.surfaceBorder} ${t.textMuted}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Simulator Active</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition cursor-pointer min-h-[38px] ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            {/* Previous (navigate to prior sibling) */}
            {currentUnitSims.length > 1 && (
              <button
                onClick={() => {
                  const idx = currentUnitSims.findIndex((s) => s.id === definition.id);
                  const previous = idx > 0 ? currentUnitSims[idx - 1] : undefined;
                  if (previous && onSelectSimulation) onSelectSimulation(previous);
                }}
                disabled={currentUnitSims.findIndex((s) => s.id === definition.id) === 0}
                className={`px-2.5 py-1.5 min-h-[38px] rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed border transition cursor-pointer ${t.btnSecondary}`}
              >
                ◀ Previous
              </button>
            )}

            {/* Step */}
            <button
              onClick={handleStep}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
            >
              Next Step ▶
            </button>

            {/* Reset */}
            <button
              onClick={resetSimulation}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-lg text-xs font-medium border transition cursor-pointer ${t.btnSecondary}`}
            >
              ↺ Reset
            </button>

            {/* Speed selector */}
            <div className="flex items-center gap-1">
              <label className={`text-[11px] whitespace-nowrap ${t.textMuted}`}>Speed</label>
              <div className={`flex items-center min-h-[38px] rounded-lg border p-0.5 text-[11px] font-mono ${t.surfaceBg} ${t.surfaceBorder}`}>
                {[0.5, 1, 2].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSpeedMultiplier(sp)}
                    className={`px-2 py-1 rounded transition cursor-pointer ${
                      speedMultiplier === sp ? t.speedActive : t.speedInactive
                    }`}
                  >
                    {sp}×
                  </button>
                ))}
              </div>
            </div>

            {/* Foundational Stage Audio & 3D World Mode */}
            {isFoundationalStage && (
              <div className="flex items-center gap-2 ml-auto sm:ml-2">
                <div className="flex items-center gap-1 bg-white/95 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setEarlyYears3DMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      earlyYears3DMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    🎮 3D World
                  </button>
                  <button
                    type="button"
                    onClick={() => setEarlyYears3DMode(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      !earlyYears3DMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    🎨 2D Story
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSpeakPrompt}
                  className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold transition cursor-pointer border shadow-sm ${
                    isSpeakingPrompt
                      ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400'
                      : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                  }`}
                  title="Speak Prompt / Audio Read Aloud"
                >
                  <span className={isSpeakingPrompt ? 'animate-bounce' : ''}>🔊</span>
                  <span className="hidden sm:inline">Read Aloud</span>
                </button>

                <button
                  type="button"
                  onClick={toggleAudioMute}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-lg text-xs font-medium transition cursor-pointer border ${
                    isAudioMuted
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title={isAudioMuted ? 'Sound FX Muted' : 'Sound FX On'}
                >
                  <span>{isAudioMuted ? '🔕' : '🔔'}</span>
                  <span className="hidden sm:inline">{isAudioMuted ? 'Muted' : 'SFX On'}</span>
                </button>

                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  NEP 2020 Foundational
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MAIN AREA: Canvas / Iframe  |  Right Sidebar
          ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[400px]">

        {/* ── LEFT SIDEBAR (Collapsible for maximum canvas focus) ── */}
        {isSidebarOpen && !isIframeMode && !isManufacturingTechnology && !isMaterialsMetallurgy && !isElectricalDrives && !isNumericalMethods && !isManufacturingTechnology2 && !isThermalEngineering && (
        <div className={`w-full lg:w-76 xl:w-80 border-b lg:border-b-0 lg:border-r flex flex-col flex-shrink-0 overflow-y-auto ${t.sidebarBg} ${t.sidebarBorder}`}>

          {/* Tab bar + close button */}
          <div className={`flex items-center border-b ${t.sidebarBorder} ${t.tabBarBg}`}>
            <div className="flex flex-1">
              {(
                [
                  { key: 'controls', label: '⚙️ Parameters' },
                  { key: 'theory', label: '📖 Theory' },
                  { key: 'ai', label: '🤖 Ask AI' },
                ] as const
              ).filter((tab) => !(hideAssistant && tab.key === 'ai')).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 text-xs font-bold transition cursor-pointer border-b-2 ${
                    activeTab === tab.key ? t.tabActive : t.tabInactive
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className={`p-2 mx-1 text-xs rounded-md transition hover:bg-slate-200 dark:hover:bg-slate-800 ${t.textMuted}`}
              title="Collapse panel for larger simulation view"
              aria-label="Collapse panel"
            >
              ◀
            </button>
          </div>

          <div className="p-4 flex-1 space-y-4 overflow-y-auto">

            {/* ── TAB: Controls / Parameters ── */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                {/* 1. Interactive Parameters / Sliders */}
                {definition.parameters.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between pb-1">
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${t.textAccent}`}>
                        Active Controls
                      </div>
                      <span className={`text-[11px] font-mono ${t.textDimmed}`}>
                        {definition.parameters.length} parameters
                      </span>
                    </div>

                    <div className="space-y-3">
                      {definition.parameters.map((param) => {
                        const currentVal = params[param.key] ?? param.default;

                        if (param.type === 'range') {
                          return (
                            <div key={param.key} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <label className={`font-semibold ${t.textSecondary}`}>
                                  {param.label}
                                </label>
                                <span className={`font-mono font-bold ${t.textAccent}`}>
                                  {currentVal} {param.unit || ''}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step={param.step || 1}
                                value={currentVal}
                                onChange={(e) =>
                                  handleParamChange(param.key, parseFloat(e.target.value))
                                }
                                className={`w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg ${t.sliderTrack}`}
                              />
                            </div>
                          );
                        }

                        if (param.type === 'select') {
                          return (
                            <div key={param.key} className="space-y-1">
                              <label className={`text-xs font-semibold ${t.textSecondary}`}>
                                {param.label}
                              </label>
                              <select
                                value={currentVal}
                                onChange={(e) =>
                                  handleParamChange(param.key, e.target.value)
                                }
                                className={`w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer ${t.inputBg} ${t.inputBorder} ${t.inputText}`}
                              >
                                {param.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (param.type === 'boolean') {
                          return (
                            <label
                              key={param.key}
                              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${t.boolCard}`}
                            >
                              <span className={`text-xs font-medium ${t.textSecondary}`}>
                                {param.label}
                              </span>
                              <input
                                type="checkbox"
                                checked={Boolean(currentVal)}
                                onChange={(e) =>
                                  handleParamChange(param.key, e.target.checked)
                                }
                                className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                              />
                            </label>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <div className={`pt-3 border-t flex justify-between items-center ${t.sidebarBorder}`}>
                      <button
                        onClick={() => {
                          const defs: Record<string, any> = {};
                          for (const p of definition.parameters) defs[p.key] = p.default;
                          setParams(defs);
                          resetSimulation();
                        }}
                        className={`text-xs underline cursor-pointer ${t.textMuted} ${isDark ? 'hover:text-slate-200' : 'hover:text-slate-800'}`}
                      >
                        ↺ Reset Defaults
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={`p-4 rounded-xl border text-center ${t.surfaceCard} ${t.surfaceCardBorder}`}>
                    <span className="text-2xl block mb-2">⚡</span>
                    <h5 className={`text-xs font-bold mb-1 ${t.textPrimary}`}>Interactive Canvas Controls</h5>
                    <p className={`text-[11px] leading-relaxed mb-3 ${t.textMuted}`}>
                      {isIframeMode
                        ? 'Parameters, step playback, and live graphs are active directly on the simulation canvas.'
                        : 'This model updates live with interactive inputs and gestures on the canvas.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('theory')}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition ${t.btnSecondary}`}
                    >
                      📖 View Theory &amp; Formulas
                    </button>
                  </div>
                )}

                {/* 2. Live Dynamic Metrics */}
                {definition.metrics.length > 0 && (
                  <div className={`pt-3 border-t ${t.sidebarBorder}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.textAccent}`}>
                      Live Metrics
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {definition.metrics.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${t.surfaceBg} ${t.surfaceBorder}`}
                        >
                          <span className={`text-xs ${t.textMuted}`}>{m.label}</span>
                          <span className={`text-xs font-mono font-bold ${m.color || t.textAccent}`}>
                            {metricsValues[m.id || m.key || m.label] || '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Compact Collapsible Algorithm / Pseudocode */}
                {pseudocodeLines.length > 0 && (
                  <details className={`group rounded-xl border p-2.5 ${t.surfaceBg} ${t.surfaceBorder}`}>
                    <summary className={`text-xs font-bold cursor-pointer flex items-center justify-between select-none ${t.textSecondary}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="text-emerald-500 text-[10px]">⚡</span>
                        <span>Algorithm &amp; Steps</span>
                      </span>
                      <span className="text-[10px] opacity-60 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <ol className="mt-2.5 space-y-1 list-decimal list-inside text-[11px]">
                      {pseudocodeLines.map((line, i) => (
                        <li
                          key={i}
                          className={`leading-relaxed ${
                            i === stepIndex % pseudocodeLines.length
                              ? 'text-emerald-400 font-bold'
                              : t.textMuted
                          }`}
                        >
                          {line}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </div>
            )}

            {/* ── TAB: Theory ── */}
            {activeTab === 'theory' && (
              <div className="space-y-4 text-xs">
                {pseudocodeLines.length > 0 && (
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textAccent}`}>
                      ALGORITHMIC LOGIC
                    </div>
                    <h4 className={`font-bold text-sm mb-2 ${t.textPrimary}`}>
                      Kernel Algorithm / Pseudocode
                    </h4>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {pseudocodeLines.map((line, i) => (
                        <li
                          key={i}
                          className={`text-[11px] leading-relaxed ${
                            i === stepIndex % pseudocodeLines.length
                              ? 'text-emerald-400 font-bold'
                              : t.textMuted
                          }`}
                        >
                          {line}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className={`h-px ${t.divider}`} />

                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textAccent}`}>
                    PERFORMANCE METRICS
                  </div>
                  <h4 className={`font-bold text-sm mb-2 ${t.textPrimary}`}>
                    Complexity &amp; Criteria
                  </h4>
                  <ul className="space-y-1.5">
                    {definition.learningObjectives.map((obj, i) => (
                      <li key={i} className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className={`font-bold ${t.textAccent}`}>•</span>
                        <span className="leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`h-px ${t.divider}`} />

                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textAccent}`}>
                    Overview
                  </div>
                  <h4 className={`font-bold text-sm mb-1.5 ${t.textPrimary}`}>
                    About this Simulation
                  </h4>
                  <p className={`leading-relaxed ${t.textMuted}`}>
                    {definition.detailedDescription}
                  </p>
                </div>

                {definition.suggestedUnits.length > 0 && (
                  <div className={`p-3 rounded-lg border ${t.surfaceBg} ${t.surfaceBorder}`}>
                    <span className={`font-semibold block mb-1 text-xs ${t.textSecondary}`}>
                      Recommended Curriculum Units:
                    </span>
                    <div className="flex gap-1.5">
                      {definition.suggestedUnits.map((u) => (
                        <span
                          key={u}
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${t.unitBadgeBg}`}
                        >
                          Unit {u}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {engineeringContext && (
                  <div className={`p-3.5 rounded-xl border ${t.surfaceCardBorder} ${t.surfaceCard} mt-2`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                      <span>🌐</span> Real-World Relevance
                    </div>
                    <p className={`text-xs ${t.textMuted} mb-3 leading-relaxed`}>
                      {engineeringContext.summary}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowEngineeringContext(true)}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Explore Industrial Applications
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: AI ── */}
            {activeTab === 'ai' && !hideAssistant && (
              <div className="space-y-4 text-xs">
                {/* Context badge */}
                <div className={`p-3 rounded-xl shadow-lg border ${t.aiContextBg}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold flex items-center gap-1.5 ${t.aiContextLabel}`}>
                      <span>🔬</span> Active Lab Analysis
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${t.aiContextBadge}`}>
                      {subject?.subjectCode || 'Module'} · Unit {definition.unit || 1}
                    </span>
                  </div>
                  <p className={`text-[11px] ${t.textMuted}`}>
                    Ask AI about theoretical foundations, why &amp; where it is used in engineering, formulas, and real-time parameters.
                  </p>
                </div>

                {/* Core questions */}
                <div>
                  <h4 className={`font-bold text-xs mb-2 flex items-center gap-1.5 ${t.textSecondary}`}>
                    <span>💡</span> Core Conceptual Questions
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {defaultQuestions.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleAskAi(q.question)}
                        disabled={aiLoading}
                        className={`p-2 rounded-lg border transition text-left text-[11px] font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${t.aiBtnBg}`}
                        title={q.question}
                      >
                        <span>{q.icon}</span>
                        <span className="truncate">{q.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contextual questions */}
                {contextualQuestions.length > 0 && (
                  <div>
                    <h4 className={`font-bold text-xs mb-2 flex items-center gap-1.5 ${t.textSecondary}`}>
                      <span>🎯</span> Contextual Questions
                    </h4>
                    <div className="space-y-1.5">
                      {contextualQuestions.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => handleAskAi(q.question)}
                          disabled={aiLoading}
                          className={`w-full p-2 rounded-lg border transition text-left text-[11px] font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer ${t.aiCtxBtnBg}`}
                        >
                          <span>{q.icon}</span>
                          <span className="line-clamp-2">{q.question}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Free query */}
                <div>
                  <h4 className={`font-bold text-xs mb-2 flex items-center gap-1.5 ${t.textSecondary}`}>
                    <span>💬</span> Ask a Specific Question
                  </h4>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAskAi(aiQuestion); }}
                      placeholder="Ask about this simulation..."
                      disabled={aiLoading}
                      className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-indigo-500 disabled:opacity-50 ${t.inputDeepBg} ${t.inputBorder} ${t.inputText} ${isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleAskAi(aiQuestion)}
                      disabled={aiLoading || !aiQuestion.trim()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50 transition cursor-pointer"
                    >
                      Ask
                    </button>
                  </div>
                </div>

                {/* Loading */}
                {aiLoading && (
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${t.aiLoadBg}`}>
                    <div className={`h-5 w-5 rounded-full border-2 animate-spin flex-shrink-0 ${t.aiSpinner}`} />
                    <div>
                      <div className={`text-xs font-bold ${t.aiLoadText}`}>
                        Analyzing Simulation &amp; Grounding in Curriculum...
                      </div>
                      <div className={`text-[10px] ${t.aiLoadSub}`}>
                        Extracting real-time parameters, formulas &amp; course notes
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {aiError && (
                  <div className={`p-3 rounded-lg border text-xs ${t.aiErrorBg}`}>
                    ⚠️ {aiError}
                  </div>
                )}

                {/* Response */}
                {aiResponse && (
                  <div className={`p-3.5 rounded-xl border shadow-lg space-y-3 ${t.aiResponseBg}`}>
                    <div className={`flex items-center justify-between pb-2 border-b ${t.aiResponseBorder}`}>
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${t.successText}`}>
                        <span>✅</span> Grounded Simulation Answer
                      </span>
                      <button
                        onClick={() => {
                          const text = [aiResponse.directAnswer, aiResponse.explanation, aiResponse.additionalExplanation]
                            .filter(Boolean).join('\n\n');
                          navigator.clipboard.writeText(text);
                          setCopiedAnswer(true);
                          setTimeout(() => setCopiedAnswer(false), 2000);
                        }}
                        className={`text-[10px] underline cursor-pointer ${t.copyBtn}`}
                      >
                        {copiedAnswer ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <div>
                      <div className={`text-[10px] uppercase font-bold mb-1 ${t.textMuted}`}>Direct Answer</div>
                      <div className={`p-2.5 rounded-lg border text-xs leading-relaxed whitespace-pre-wrap font-medium ${t.aiAnswerBg}`}>
                        {aiResponse.directAnswer}
                      </div>
                    </div>
                    {aiResponse.explanation && (
                      <div>
                        <div className={`text-[10px] uppercase font-bold mb-1 ${t.textMuted}`}>Pedagogical Breakdown</div>
                        <div className={`text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto pr-1 ${t.aiExplText}`}>
                          {aiResponse.explanation}
                        </div>
                      </div>
                    )}
                    {aiResponse.additionalExplanation && (
                      <div className={`text-[10px] italic pt-1 border-t ${t.aiResponseBorder} ${t.aiExtrText}`}>
                        {aiResponse.additionalExplanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        )}

        {/* ── RIGHT: Simulation Canvas / Iframe area ── */}
        <div className={`flex-1 flex flex-col relative overflow-hidden ${t.canvasBg}`}>

          {/* Floating toggle to reopen sidebar when collapsed */}
          {!isSidebarOpen && !isFullscreen && !isIframeMode && !isManufacturingTechnology && !isMaterialsMetallurgy && !isElectricalDrives && !isNumericalMethods && !isManufacturingTechnology2 && !isThermalEngineering && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border backdrop-blur-md transition-all cursor-pointer ${t.surfaceBg} ${t.surfaceBorder} ${t.textSecondary} hover:${t.textPrimary}`}
              title="Open Parameters & Theory Panel"
            >
              <span>▶</span>
              <span>⚙️</span>
              <span className="hidden sm:inline">Controls &amp; Info</span>
            </button>
          )}

          {/* Metrics HUD — floated badges above the canvas (only if canvas mode and has metrics) */}
          {!isIframeMode && !isManufacturingTechnology && !isMaterialsMetallurgy && !isElectricalDrives && !isNumericalMethods && !isManufacturingTechnology2 && !isThermalEngineering && definition.metrics.length > 0 && (
            <div className="flex-shrink-0 absolute top-14 left-3 right-3 flex flex-wrap gap-2.5 pointer-events-none z-10">
              {definition.metrics.map((m) => (
                <div
                  key={m.id}
                  className={`px-3.5 py-2 rounded-xl shadow-lg pointer-events-auto flex items-center gap-2.5 border ${t.hudBg}`}
                >
                  <div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${t.hudLabel}`}>
                      {m.label}
                    </div>
                    <div className={`text-sm font-mono font-bold ${m.color || t.textPrimary}`}>
                      {metricsValues[m.id || m.key || m.label] || '---'}
                    </div>
                  </div>
                  {m.badge && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${t.hudBadge}`}>
                      {m.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Canvas or Iframe or 3D World */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            {isFoundationalStage && earlyYears3DMode ? (
              <EarlyYears3DView
                simId={definition.id}
                title={definition.title}
                topic={(definition as any).topic || (definition as any).curriculumTopic || definition.shortDescription}
                onClose={onClose}
              />
            ) : isPhysicsDataStorage ? (
              <PhysicsDataStorage3DView
                simId={resolveU25RPHU02SimId(definition.id)}
                showHeader={false}
                showSidebar={false}
                standalone={false}
                theme={theme}
                params={params}
                onParamChange={handleParamChange}
              />
            ) : isEssentialsComputing ? (
              <EssentialsComputingView
                simId={resolveU25CS102SimId(definition.id)}
                showHeader={false}
                showSidebar={false}
                standalone={false}
                theme={theme}
                params={params}
                onParamChange={handleParamChange}
              />
            ) : isMakerspace ? (
              <MakerspaceWorkshopView
                simId={resolveU25RGE01SimId(definition.id)}
                showHeader={false}
                showSidebar={false}
                standalone={false}
                theme={theme}
                params={params}
                onParamChange={handleParamChange}
                onClose={onClose}
              />
            ) : isPhysicsCivil ? (
              <PhysicsCivilLabView
                simId={resolveU25RPH06SimId(definition.id)}
                showHeader={false}
                showSidebar={false}
                standalone={false}
                theme={theme}
                params={params}
                onParamChange={handleParamChange}
                onClose={onClose}
              />
            ) : isMechanics ? (
              <MechanicsVirtualLabWorkspace
                initialSimId={toMechanics3DSimId(definition.id) as any}
                onBackToCourse={onClose}
              />
            ) : isStrengthOfMaterials ? (
              <StrengthOfMaterialsWorkspace
                simulationId={toSom3DSimId(definition.id)}
                onBack={onClose}
              />
            ) : isConcreteTechnology ? (
              <ConcreteLabWorkspace
                simulationId={toConcrete3DSimId(definition.id)}
                onBack={onClose}
              />
            ) : isEngineeringSurvey ? (
              <SurveyLabWorkspace
                simulationId={toSurvey3DSimId(definition.id)}
                onBack={onClose}
              />
            ) : isHydraulicEngineering ? (
              <HydraulicLabWorkspace
                simulationId={toHydraulic3DSimId(definition.id)}
                onBack={onClose}
              />
            ) : isGeotechnicalEngineering ? (
              <GeotechnicalLabWorkspace
                initialSimId={toGeotechnical3DSimId(definition.id)}
                onExit={onClose}
              />
            ) : isHighwayEngineering ? (
              <HighwayLabWorkspace
                initialSimId={resolveU25CE402SimId(definition.id)}
                onExit={onClose}
              />
            ) : isWaterSupplyEngineering ? (
              <WaterLabWorkspace
                initialSimId={resolveU25CE403SimId(definition.id)}
                onExit={onClose}
              />
            ) : isFluidMachinery ? (
              <FluidMachineryWorkspace
                simulationId={resolveU25MEG05SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isMechanicsOfSolids ? (
              <MechanicsSolidsWorkspace
                simulationId={resolveU25ME303SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isManufacturingTechnology ? (
              <ManufacturingTechWorkspace
                simulationId={resolveU25ME304SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isMaterialsMetallurgy ? (
              <MetallurgyWorkspace
                simulationId={resolveU25ME302SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isElectricalDrives ? (
              <ElectricalDrivesWorkspace
                simulationId={resolveU25EE305SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isNumericalMethods ? (
              <NumericalMethodsWorkspace
                simulationId={resolveU25MA402SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isManufacturingTechnology2 ? (
              <ManufacturingTech2Workspace
                simulationId={resolveU25ME401SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isThermalEngineering ? (
              <ThermalEngineeringWorkspace
                simulationId={resolveU25ME402SimId(definition.id) || definition.id}
                onBack={onClose}
              />
            ) : isIframeMode ? (
              <iframe
                ref={iframeRef}
                title={definition.title}
                src={effectiveIframeUrl as string}
                className="w-full h-full border-0 block bg-white dark:bg-slate-900"
                allow="fullscreen; clipboard-write; clipboard-read"
              />
            ) : (
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full block cursor-pointer select-none touch-none"
              />
            )}
          </div>

          {/* Bottom Bar: Formula or Note (Native canvas only) */}
          {!isIframeMode && definition.formulaOverview && (
            <div className={`px-4 py-2 border-t text-xs font-mono flex items-center gap-2 ${t.formulaBg} ${t.formulaText}`}>
              <span className={`font-bold ${t.textAccent}`}>Formula:</span>
              <span className="overflow-x-auto truncate">
                {definition.formulaOverview}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          STATUS BAR (bottom)
          ═══════════════════════════════════════════════════ */}
      <div className={`flex-shrink-0 flex items-center justify-between gap-3 px-5 py-2 border-t ${t.statusBg}`}>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${domainColors.badgeBg} ${domainColors.badgeText} ${domainColors.border}`}>
            {domainLabel(definition.domain)}
          </span>
          <span className={`text-[11px] font-mono ${t.textDimmed}`}>
            {definition.id}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isIframeMode ? (
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-medium ${t.textDimmed}`}>
                {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[11px] font-semibold text-emerald-500`}>
                  Live Simulation
                </span>
              </div>
            </div>
          ) : (
            <>
              <span className={`text-xs font-mono ${t.textMuted}`}>
                Step {stepIndex + 1}
              </span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? t.playDot : t.pauseDot}`} />
                <span className={`text-[11px] ${t.textMuted}`}>
                  {isPlaying ? 'Running' : 'Paused'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── REAL-WORLD & ENGINEERING CONTEXT PANEL ── */}
      {engineeringContext && (
        <EngineeringContextPanel
          isOpen={showEngineeringContext}
          onClose={() => setShowEngineeringContext(false)}
          context={engineeringContext}
          simulationTitle={definition.title}
          theme={theme}
        />
      )}
    </div>
  );
};

export default SimulationShell;
