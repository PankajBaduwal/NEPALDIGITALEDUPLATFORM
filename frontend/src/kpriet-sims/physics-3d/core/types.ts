/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Core Types & Pedagogical Interfaces
 */

export type PhysicsSimId =
  // Unit I: Mechanical Properties of Solids
  | 'material-testing'
  | 'poisson-ratio'
  | 'material-comparison'
  | 'cantilever-beam'
  | 'girders-mems'
  // Unit II: Fundamentals of Heat Transfer and Fluids
  | 'heat-transfer'
  | 'thermal-expansion-lees-disc'
  | 'surface-tension'
  | 'poiseuille-viscosity'
  | 'thermal-systems'
  // Unit III: Ultrasonics and Its Applications
  | 'ultrasonic-waves'
  | 'piezo-magnetostriction'
  | 'ultrasonic-velocity'
  | 'sonar-ranging'
  | 'ndt-imaging'
  // Unit IV: Semiconductor Physics
  | 'band-structure'
  | 'carrier-concentration'
  | 'carrier-transport-pn'
  | 'zener-diode'
  | 'semiconductor-devices'
  // Unit V: Photonics
  | 'radiation-matter'
  | 'laser-principles'
  | 'co2-diode-lasers'
  | 'total-internal-reflection'
  | 'fibre-endoscopy-sensors';

export interface SimulationOptions {
  theme?: 'light' | 'dark';
  playbackSpeed?: number;
  initialStage?: number;
  initialMode?: string;
  initialViewMode?: string;
  showLabels?: boolean;
  enableShadows?: boolean;
  width?: number;
  height?: number;
  onStateChange?: (state: SimulationState) => void;
  onComponentSelect?: (component: ComponentInspectionData | null) => void;
}

export interface SimulationState {
  currentStageIndex: number;
  totalStages: number;
  isPlaying: boolean;
  playbackSpeed: number;
  simulatedTimeSeconds: number;
  mode: string;
  viewMode: string;
  labelsVisible: boolean;
  theme: 'light' | 'dark';
  selectedComponentId: string | null;
  parameters: Record<string, number | string | boolean>;
  metrics: Record<string, number | string>;
  isDisposed?: boolean;
}

export interface StageDefinition {
  id: string;
  index: number;
  title: string;
  shortDescription: string;
  detailedExplanation: string;
  physicsFormulas?: string[];
  keyTerminology?: Array<{ term: string; definition: string }>;
  highlightComponentIds?: string[];
  recommendedCamera?: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export interface ComponentInspectionData {
  id: string;
  name: string;
  scientificRole: string;
  materialsAndSpecs?: string;
  physicalPrinciples: string;
  equations?: string[];
  operationalLimits?: string;
}

export interface ParameterDefinition {
  key: string;
  label: string;
  description: string;
  type: 'number' | 'select' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string | number }>;
  defaultValue: number | string | boolean;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tolerance?: number;
  formulaHint?: string;
}

export interface PhysicsSimulationController {
  // Lifecycle
  init?(): void;
  dispose(): void;
  play(): void;
  pause(): void;
  reset(): void;
  setSpeed(speed: number): void;

  // Stages
  nextStage(): void;
  prevStage(): void;
  setStage?(index: number): void;
  getStages(): StageDefinition[];

  // Modes & Theme
  getMode(): string;
  setMode?(mode: string): void;
  getViewMode(): string;
  setViewMode(viewMode: string): void;
  setTheme?(theme: 'light' | 'dark'): void;

  // Camera & Views
  resetCamera(): void;
  setCameraPreset(name: string): void;

  // Inspection
  inspectComponent(componentId: string | null): void;
  toggleLabels(visible?: boolean): void;
  getComponents(): ComponentInspectionData[];

  // Dynamic Parameters & Calculations
  setParameter(key: string, value: number | string | boolean): void;
  getParameter(key: string): number | string | boolean | undefined;
  getParameterDefinitions?(): ParameterDefinition[];

  // State Listener
  getState(): SimulationState;
  onStateChange(callback: (state: SimulationState) => void): () => void;
}
