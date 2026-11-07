/**
 * ExploreSimulationsPanel.tsx
 * Centralized Simulation Library Entry Point
 * Implements the mandatory hierarchy:
 * Teacher Dashboard -> Explore Simulations -> All Classes -> Select Class -> Subjects -> Select Subject -> Chapters -> Simulations -> Launch Simulation
 */
import React from 'react';
import { SimulationLibrary } from '../simulations/SimulationLibrary';

interface ExploreSimulationsPanelProps {
  userRole?: string;
  defaultGrade?: number;
  classroomContext?: {
    classId: string;
    sectionId: string;
    subjectId: string;
  };
}

export const ExploreSimulationsPanel: React.FC<ExploreSimulationsPanelProps> = ({
  userRole = 'TEACHER',
  defaultGrade,
  classroomContext,
}) => {
  return (
    <SimulationLibrary
      userRole={userRole}
      defaultGrade={defaultGrade}
      classroomContext={classroomContext}
    />
  );
};
