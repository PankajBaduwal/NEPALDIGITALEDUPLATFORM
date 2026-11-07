/**
 * React Wrapper for Lithium-Ion Battery 3D Simulation
 */

import React from 'react';
import { ElectrochemLabWorkspace } from './ElectrochemLabWorkspace';

export interface LithiumIonBatteryViewProps {
  onExit?: () => void;
}

export const LithiumIonBatteryView: React.FC<LithiumIonBatteryViewProps> = ({ onExit }) => {
  return <ElectrochemLabWorkspace initialSim="lithium-ion" onExit={onExit} />;
};
