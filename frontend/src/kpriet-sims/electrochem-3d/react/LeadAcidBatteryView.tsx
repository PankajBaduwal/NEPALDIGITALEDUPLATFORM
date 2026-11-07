/**
 * React Wrapper for Lead-Acid Battery 3D Simulation
 */

import React from 'react';
import { ElectrochemLabWorkspace } from './ElectrochemLabWorkspace';

export interface LeadAcidBatteryViewProps {
  onExit?: () => void;
}

export const LeadAcidBatteryView: React.FC<LeadAcidBatteryViewProps> = ({ onExit }) => {
  return <ElectrochemLabWorkspace initialSim="lead-acid" onExit={onExit} />;
};
