/**
 * Types & Interfaces for:
 * Course Code: U25RPH06
 * Course Title: Physics for Civil Engineers
 * Programme: B.E. Civil Engineering | Semester: II | Category: BSC | Credits: 2
 * Regulation: R2025 Revised CBCS
 * Official Source: CE - R2025 (Revised).pdf, Printed Pages 34–35
 */

export type PhysicsCivilUnitNumber = 1 | 2 | 3 | 4 | 5;

export type PhysicsCivilCourseOutcome = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';

export interface IPhysicsCivilSyllabusReference {
  unitNumber: PhysicsCivilUnitNumber;
  unitTitle: string;
  unitHours: number;
  officialTopicTitle: string;
  printedPage: number;
  courseOutcome: PhysicsCivilCourseOutcome;
  courseOutcomeDescription: string;
}

export interface IPhysicsCivilReflectionCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface IPhysicsCivilGuidedStep {
  title: string;
  instruction: string;
  hint?: string;
  recommendedSetting?: string;
}

export interface IPhysicsCivilObservationColumn {
  key: string;
  label: string;
  unit?: string;
}

export interface IPhysicsCivilFormula {
  expression: string;
  description: string;
  variables: Record<string, string>;
}

export interface IPhysicsCivilSimulationMetadata {
  id: string;
  simNumber: number; // 1 to 25
  unitNumber: PhysicsCivilUnitNumber;
  unitTitle: string;
  title: string;
  icon: string;
  shortDescription: string;
  detailedDescription: string;
  learningObjectives: string[];
  civilRelevanceTitle: string;
  civilEngineeringUse: string[];
  civilPracticalScenario: string;
  syllabusReference: IPhysicsCivilSyllabusReference;
  governingFormulas: IPhysicsCivilFormula[];
  assumptions: string[];
  defaultParams: Record<string, any>;
  guidedSteps: IPhysicsCivilGuidedStep[];
  observationColumns: IPhysicsCivilObservationColumn[];
  reflectionCheck: IPhysicsCivilReflectionCheck;
  disclaimer: string;
}
