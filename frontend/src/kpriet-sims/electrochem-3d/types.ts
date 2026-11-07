/**
 * KPRIET Advanced Electrochemical Cells & Energy Storage Virtual Laboratory
 * TypeScript Type Definitions for Core Simulation Framework
 */

import * as THREE from 'three';

export type SimulationMode = 'discharge' | 'charge' | 'inspect' | 'open_circuit' | 'running' | 'idle';

export interface StageDefinition {
  id: string;
  index: number;
  title: string;
  shortDescription: string;
  detailedExplanation: string;
  chemicalReactions: string[];
  keyTerminology: { term: string; definition: string }[];
  highlightComponentIds: string[];
  recommendedCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  durationSeconds?: number;
}

export interface ComponentInspectionData {
  id: string;
  name: string;
  category: 'structural' | 'electrode' | 'electrolyte' | 'separator' | 'electrical' | 'manifold';
  material: string;
  scientificRole: string;
  chemicalFormula?: string;
  specifications: string;
  anchorPosition: [number, number, number];
  meshRef?: THREE.Object3D;
}

export interface SimulationState {
  isPlaying: boolean;
  speed: number;
  currentTime: number;
  currentStageIndex: number;
  mode: SimulationMode;
  inspectionMode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic';
  selectedComponent: ComponentInspectionData | null;
  labelsVisible: boolean;
  // Specific model state
  metrics: Record<string, number | string>;
}

export interface SimulationOptions {
  width?: number;
  height?: number;
  initialStage?: number;
  initialMode?: SimulationMode;
  initialInspectionMode?: 'assembled' | 'cutaway' | 'exploded' | 'microscopic';
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

  // Operating Mode & Inspection
  setMode(mode: SimulationMode): void;
  getMode(): SimulationMode;
  setInspectionMode(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic'): void;
  getInspectionMode(): 'assembled' | 'cutaway' | 'exploded' | 'microscopic';

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

  // State Listener
  getState(): SimulationState;
  onStateChange(callback: (state: SimulationState) => void): () => void;

  // Cleanup
  dispose(): void;
}
