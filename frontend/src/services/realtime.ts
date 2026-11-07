/**
 * Socket.IO client, loaded from the backend's own /socket.io/socket.io.js so the frontend
 * needs no extra dependency. One shared connection, authenticated with the session token.
 */
import { useEffect, useRef } from 'react';

type Listener = (payload: any) => void;

let socketPromise: Promise<any> | null = null;

function loadClient(): Promise<any> {
  const w = window as any;
  if (w.io) return Promise.resolve(w.io);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/socket.io/socket.io.js';
    script.async = true;
    script.onload = () => resolve(w.io);
    script.onerror = () => reject(new Error('Realtime client unavailable'));
    document.head.appendChild(script);
  });
}

function getSocket(): Promise<any> {
  if (!socketPromise) {
    socketPromise = loadClient()
      .then((io) => io({ path: '/socket.io', auth: { token: localStorage.getItem('nepal_edu_token') || '' } }))
      .catch((e) => {
        socketPromise = null;
        throw e;
      });
  }
  return socketPromise;
}

/** Subscribe to events; returns an unsubscribe function. Fails quietly when realtime is unavailable. */
export function subscribe(events: string[], listener: Listener, opts: { sectionId?: string } = {}): () => void {
  let active = true;
  let socket: any = null;
  getSocket()
    .then((s) => {
      if (!active) return;
      socket = s;
      if (opts.sectionId) s.emit('join:section', { sectionId: opts.sectionId });
      events.forEach((e) => s.on(e, listener));
    })
    .catch(() => undefined);
  return () => {
    active = false;
    if (socket) events.forEach((e) => socket.off(e, listener));
  };
}

/**
 * React hook: run `onEvent` (debounced) whenever one of the events arrives, so a screen can
 * re-fetch its data. The latest callback is always used, and the subscription is removed on unmount.
 */
export function useLiveRefresh(events: string[], onEvent: (payload: any) => void, opts: { sectionId?: string; debounceMs?: number } = {}) {
  const cb = useRef(onEvent);
  cb.current = onEvent;
  const key = events.join('|');
  useEffect(() => {
    let timer: any = null;
    const off = subscribe(
      events,
      (payload) => {
        clearTimeout(timer);
        timer = setTimeout(() => cb.current(payload), opts.debounceMs ?? 800);
      },
      { sectionId: opts.sectionId }
    );
    return () => {
      clearTimeout(timer);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, opts.sectionId]);
}
