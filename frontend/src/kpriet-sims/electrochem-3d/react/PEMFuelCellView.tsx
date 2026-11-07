/**
 * React Wrapper for PEM Hydrogen Fuel Cell 3D Simulation
 */

import React from 'react';
import { ElectrochemLabWorkspace } from './ElectrochemLabWorkspace';

export interface PEMFuelCellViewProps {
  onExit?: () => void;
}

export const PEMFuelCellView: React.FC<PEMFuelCellViewProps> = ({ onExit }) => {
  return <ElectrochemLabWorkspace initialSim="pem-fuel-cell" onExit={onExit} />;
};
