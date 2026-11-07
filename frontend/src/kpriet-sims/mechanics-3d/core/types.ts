/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Core TypeScript Type Definitions for 20 Interactive 3D Simulations
 * Aligned with Anna University Engineering Mechanics Syllabi (Units I – V)
 */

import * as THREE from 'three';

export type MechanicsSimId =
  // Unit I: Statics of Particles & Force Systems
  | '01-force-systems' | 'force-systems' | 'mech-force-systems'
  | '02-cable-tensions' | 'cable-tensions' | 'mech-cable-tensions'
  | '03-fbd-lab' | 'fbd-lab' | 'mech-fbd-lab'
  // Unit II: Rigid-Body Equilibrium & Support Reactions
  | '04-moments-couples' | 'moments-couples' | 'mech-moments-couples'
  | '05-support-reactions' | 'support-reactions' | 'mech-support-reactions'
  | '06-truss-analysis' | 'truss-analysis' | 'mech-truss-analysis'
  // Unit III: Distributed Forces, Centroids & Moments of Inertia
  | '07-composite-centroids' | 'composite-centroids' | 'mech-composite-centroids'
  | '08-area-moments-inertia' | 'area-moments-inertia' | 'mech-area-moments-inertia'
  | '09-center-of-gravity' | 'center-of-gravity' | 'mech-center-of-gravity'
  // Unit IV: Friction & Mechanical Applications
  | '10-inclined-plane' | 'inclined-plane' | 'mech-inclined-plane'
  | '11-ladder-friction' | 'ladder-friction' | 'mech-ladder-friction'
  | '12-wedge-friction' | 'wedge-friction' | 'mech-wedge-friction'
  | '13-rolling-resistance' | 'rolling-resistance' | 'mech-rolling-resistance'
  // Unit V: Dynamics of Particles & Rigid Bodies (Kinematics & Kinetics)
  | '14-rectilinear-motion' | 'rectilinear-motion' | 'mech-rectilinear-motion'
  | '15-projectile-motion' | 'projectile-motion' | 'mech-projectile-motion'
  | '16-newtons-second-law' | 'newtons-second-law' | 'mech-newtons-second-law'
  | '17-work-energy' | 'work-energy' | 'mech-work-energy'
  | '18-impulse-momentum' | 'impulse-momentum' | 'mech-impulse-momentum'
  | '19-rotational-dynamics' | 'rotational-dynamics' | 'mech-rotational-dynamics'
  | '20-impact-conservation' | 'impact-conservation' | 'mech-impact-conservation';

export interface StageDefinition {
  id: string;
  index: number;
  title: string;
  shortDescription: string;
  detailedExplanation: string;
  equations?: string[];
  principles?: string[];
  keyTerminology?: { term: string; definition: string }[];
  highlightComponentIds?: string[];
  recommendedCamera?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  durationSeconds?: number;
}

export interface ComponentInspectionData {
  id: string;
  name: string;
  category?: string;
  type?: string;
  description?: string;
  properties?: Record<string, string>;
  material?: string;
  scientificRole?: string;
  governingEquation?: string;
  specifications?: string;
  anchorPosition?: [number, number, number];
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
  playbackSpeed: number;
  currentTime: number;
  timeElapsed?: number;
  currentStageIndex: number;
  mode: string;
  viewMode: string;
  selectedComponent: ComponentInspectionData | null;
  activeComponentId?: string | null;
  labelsVisible: boolean;
  metrics: Record<string, number | string>;
  parameters: Record<string, number | string | boolean>;
  selectedParameterValues: Record<string, any>;
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
  resetExperiment?(): void;
  setSpeed(speed: number): void;
  setPlaybackSpeed?(speed: number): void;
  getSpeed(): number;

  // Stage navigation
  setStage(stageIndex: number): void;
  getStage(): number;
  nextStage(): void;
  prevStage(): void;
  previousStage?(): void;
  getStages(): StageDefinition[];

  // Mode & Parameters
  setMode(mode: string): void;
  getMode(): string;
  setViewMode(viewMode: string): void;
  getViewMode(): string;
  setParameter(key: string, value: number | string | boolean): void;
  getParameter(key: string): number | string | boolean | undefined;
  setTheme?(theme: 'light' | 'dark'): void;

  // Camera & Views
  resetCamera(): void;
  setCameraPreset(name: string): void;

  // Component Inspection & Labels
  inspectComponent(componentId: string | null): void;
  getInspectedComponent?(): ComponentInspectionData | null;
  onComponentInspect?(callback: (component: ComponentInspectionData | null) => void): void;
  toggleLabels(visible?: boolean): void;

  // State inspection & Disposal
  getState(): SimulationState;
  onStateChange(callback: (state: SimulationState) => void): void;
  dispose(): void;
}
