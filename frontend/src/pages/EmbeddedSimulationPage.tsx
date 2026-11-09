/**
 * /embed/simulation/:key — runs one of the platform's own simulations on a bare page, for the Smart Board.
 * The Smart Board embeds it in a split partition (backend: /simulations/<code>/play → here) and the teacher can
 * write over it with the board's pen, highlighter and eraser. Requires a signed-in user (see App.tsx).
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { SimulationPlayer } from '../components/simulations/SimulationPlayer';

export const EmbeddedSimulationPage: React.FC = () => {
  const { key = '' } = useParams();
  const close = () => {
    try {
      window.parent.postMessage({ type: 'EDUVERSE_SIM_CLOSE' }, window.location.origin);
    } catch {
      /* not embedded */
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <SimulationPlayer
        embedded
        onClose={close}
        simulation={{
          id: key,
          code: key,
          title: 'Simulation',
          description: '',
          gradeLevels: [],
          simulationType: 'REACT_INTERACTIVE',
          componentKey: key,
          runtimeUrl: '',
        }}
      />
    </div>
  );
};
