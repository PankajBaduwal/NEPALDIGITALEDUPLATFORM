/**
 * types.ts
 * Shared data structures and types for Class 4 Science Simulations
 */

export type SimulationStage = 'discover' | 'explore' | 'observe' | 'understand' | 'challenge' | 'success';

export type Language = 'ne' | 'en';

export interface BaseSimulationProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: Language;
}

export interface ScienceSimulationMetadata {
  id: string;
  code: string;
  title: string;
  titleNepali: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterTitleNepali: string;
  topicName: string;
  topicNameNepali: string;
  description: string;
  descriptionNepali: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
  componentKey: string;
  tags: string[];
}

