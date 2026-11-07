/**
 * Plays a simulation ported from KPRIET. It runs on its own page (/sim.html) inside a full-screen frame, so
 * KPRIET's styling and behaviour are untouched by the platform's global styles.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Monitor } from 'lucide-react';
import { launchOnSmartBoard } from './smartBoardLaunch';

interface Props {
  simulationId: string;
  title?: string;
  onClose: () => void;
}

export const KprietSimulationPlayer: React.FC<Props> = ({ simulationId, title, onClose }) => {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === 'EDUVERSE_SIM_CLOSE') onClose();
    };
    window.addEventListener('message', onMessage);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('message', onMessage);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Portal to <body>: a transformed ancestor in a dashboard would otherwise trap the "fixed" overlay inside the page.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title || 'Simulation'} style={{ position: 'fixed', inset: 0, zIndex: 10040, background: '#0b1220' }}>
      <iframe
        src={`/sim.html?id=${encodeURIComponent(simulationId)}`}
        title={title || 'Simulation'}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        allow="fullscreen; accelerometer; gyroscope; clipboard-write"
      />
      <button
        type="button"
        onClick={() => launchOnSmartBoard(simulationId, title || 'Simulation')}
        aria-label="Launch on Smart Board"
        style={{ position: 'absolute', right: 60, bottom: 12, zIndex: 2, height: 40, padding: '0 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,.25)', background: 'rgba(15,76,74,.92)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
      >
        <Monitor size={16} /> Launch on Smart Board
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close simulation"
        style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 2, width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(15,23,42,.85)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
      >
        <X size={18} />
      </button>
    </div>,
    document.body
  );
};
