/**
 * Standalone host for one KPRIET simulation (opened in an iframe by the platform: /sim.html?id=<simulation id>).
 * It loads only KPRIET's stylesheet, so the simulation looks and behaves exactly as it does in KPRIET —
 * the platform's own global styles never reach it.
 */
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './kpriet-base.css';
import { SimulationRouter } from './SimulationRouter';
import { ThemeProvider } from './kp/context/ThemeContext';

const closeHost = () => {
  try {
    window.parent.postMessage({ type: 'EDUVERSE_SIM_CLOSE' }, window.location.origin);
  } catch {
    /* not embedded */
  }
};

const Host: React.FC = () => {
  const [id, setId] = useState(new URLSearchParams(window.location.search).get('id') || '');

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && closeHost();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  return <SimulationRouter id={id} onClose={closeHost} onSelect={setId} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Host />
    </ThemeProvider>
  </React.StrictMode>
);
