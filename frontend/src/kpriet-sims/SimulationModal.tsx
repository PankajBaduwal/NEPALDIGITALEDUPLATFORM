import React from 'react';
import type { ISimulationDefinition, IAssignedSimulation } from './types';
import { SimulationShell } from './SimulationShell';
import { DsaSimulationFrame } from './DsaSimulationFrame';

interface SimulationModalProps {
  isOpen: boolean;
  definition: ISimulationDefinition | null;
  assignedSimulation?: IAssignedSimulation | null;
  subject?: {
    _id: string;
    subjectName: string;
    subjectCode: string;
    department?: any;
    semester?: any;
  } | null;
  /** All simulations for the same subject (unit/topic dropdowns inside the shell). */
  siblingSimulations?: ISimulationDefinition[];
  /** Callback when the user navigates to a different simulation via the shell dropdowns. */
  onSelectSimulation?: (sim: ISimulationDefinition) => void;
  onClose: () => void;
  userRole?: 'teacher' | 'student';
  iframeUrl?: string | null;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  definition,
  assignedSimulation,
  subject,
  siblingSimulations,
  onSelectSimulation,
  onClose,
  userRole = 'student',
  iframeUrl,
}) => {
  if (!isOpen || !definition) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-7xl h-[95vh] max-h-[920px] flex flex-col">
        {definition.id === 'cs-dsa-lab' ? (
          <DsaSimulationFrame
            assignedSimulation={assignedSimulation}
            subject={subject}
            userRole={userRole}
            onClose={onClose}
          />
        ) : (
          <SimulationShell
            definition={definition}
            assignedSimulation={assignedSimulation}
            subject={subject}
            siblingSimulations={siblingSimulations}
            onSelectSimulation={onSelectSimulation}
            onClose={onClose}
            iframeUrl={iframeUrl}
          />
        )}
      </div>
    </div>
  );
};
