/**
 * types.ts
 * Shared TypeScript definitions for Grade 6 Science Simulations
 * Nepal Curriculum Development Centre (CDC) Alignment
 */

export type SimulationStage = 'discover' | 'explore' | 'observe' | 'understand' | 'challenge';

export type Language = 'en' | 'ne';

export interface BaseSimulationProps {
  onBackToLibrary: () => void;
  initialLanguage?: Language;
  userRole?: string;
}

export interface ScienceFact {
  titleEn: string;
  titleNe: string;
  descriptionEn: string;
  descriptionNe: string;
}

export interface QuizQuestion {
  questionEn: string;
  questionNe: string;
  optionsEn: string[];
  optionsNe: string[];
  correctIndex: number;
  explanationEn: string;
  explanationNe: string;
}
