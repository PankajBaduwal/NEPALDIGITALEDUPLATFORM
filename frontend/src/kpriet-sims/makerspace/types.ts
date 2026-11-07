export type MakerspaceSafetyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE_EDUCATIONAL';

export type MakerspaceCourseOutcome = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';

export interface IMakerspaceSyllabusReference {
  module: string;
  moduleHours: number;
  experimentNumber: number;
  officialExperimentTitle: string;
  printedPage: number;
  courseOutcome: MakerspaceCourseOutcome;
  courseOutcomeDescription: string;
}

export interface IMakerspaceReflectionCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface IMakerspaceGuidedStep {
  title: string;
  instruction: string;
  hint?: string;
  recommendedSetting?: string;
}

export interface IMakerspaceSimulationMetadata {
  id: string;
  moduleNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  moduleTitle: string;
  experimentNumber: number;
  title: string;
  icon: string;
  shortDescription: string;
  detailedDescription: string;
  learningObjectives: string[];
  safetyLevel: MakerspaceSafetyLevel;
  safetyNotice: string;
  syllabusReference: IMakerspaceSyllabusReference;
  engineeringIdea: string;
  realWorldApplications: string[];
  reflectionCheck: IMakerspaceReflectionCheck;
  defaultParams: Record<string, any>;
  guidedSteps: IMakerspaceGuidedStep[];
  disclaimer: string;
}
