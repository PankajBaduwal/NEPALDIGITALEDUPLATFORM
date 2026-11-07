/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Core TypeScript Type Definitions for Shared 3D Simulation Framework
 */

import * as THREE from 'three';

export type ChemistrySimId =
  | 'chem-molecular-orbitals'
  | 'chem-organic-mechanisms'
  | 'chem-stereochemistry'
  | 'chem-aromatic-reactions'
  | 'chem-polymerization-molecular'
  | 'chem-coordination-chemistry'
  | 'chem-phase-transitions'
  | 'chem-adsorption-catalysis'
  | 'chem-chromatography'
  | 'chem-spectroscopy'
  | 'chem-lithium-ion-battery'
  | 'chem-lead-acid-battery'
  | 'chem-pem-fuel-cell';

export interface StageDefinition {
  id: string;
  index: number;
  title: string;
  shortDescription: string;
  detailedExplanation: string;
  chemicalReactions: string[];
  keyTerminology: { term: string; definition: string }[];
  equations?: string[];
  highlightComponentIds: string[];
  recommendedCamera?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  durationSeconds?: number;
  scientificLimitations?: string;
}

export interface ComponentInspectionData {
  id: string;
  name: string;
  category: string;
  material: string;
  scientificRole: string;
  chemicalFormula?: string;
  specifications: string;
  anchorPosition: [number, number, number];
  misconception?: string;
  meshRef?: THREE.Object3D;
}

export interface ParameterDefinition {
  id: string;
  label: string;
  type: 'range' | 'select' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
  defaultValue: number | string | boolean;
}

export interface SimulationState {
  isPlaying: boolean;
  speed: number;
  currentTime: number;
  currentStageIndex: number;
  mode: string;
  viewMode: string;
  selectedComponent: ComponentInspectionData | null;
  labelsVisible: boolean;
  metrics: Record<string, number | string>;
  parameters: Record<string, number | string | boolean>;
}

export interface SimulationOptions {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  initialStage?: number;
  initialMode?: string;
  initialViewMode?: string;
  playbackSpeed?: number;
  enableShadows?: boolean;
  showLabels?: boolean;
  onStateChange?: (state: SimulationState) => void;
  onComponentSelect?: (component: ComponentInspectionData | null) => void;
}

export interface SimulationController {
  // Playback control
  play(): void;
  pause(): void;
  reset(): void;
  setSpeed(speed: number): void;
  getSpeed(): number;

  // Stage navigation
  setStage(stageIndex: number): void;
  getStage(): number;
  nextStage(): void;
  prevStage(): void;
  getStages(): StageDefinition[];

  // Mode & Inspection Views
  setMode(mode: string): void;
  getMode(): string;
  setViewMode(viewMode: string): void;
  getViewMode(): string;
  setTheme?(theme: 'light' | 'dark'): void;

  // Camera & Views
  resetCamera(): void;
  setCameraPreset(name: string): void;

  // Component Inspection & Labels
  inspectComponent(componentId: string | null): void;
  toggleLabels(visible?: boolean): void;
  getComponents(): ComponentInspectionData[];

  // Dynamic Parameters
  setParameter(key: string, value: number | string | boolean): void;
  getParameter(key: string): number | string | boolean | undefined;
  getParameterDefinitions?(): ParameterDefinition[];

  // State Listener & Lifecycle
  init?(): void;
  getState(): SimulationState;
  onStateChange(callback: (state: SimulationState) => void): () => void;
  dispose(): void;
}
