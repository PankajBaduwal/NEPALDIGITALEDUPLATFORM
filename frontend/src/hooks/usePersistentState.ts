import { useEffect, useState, Dispatch, SetStateAction } from 'react';

/**
 * Like useState, but the value survives a page refresh (F5): it is kept in this browser tab's sessionStorage.
 * Used so a dashboard stays on the page the user was on instead of jumping back to Overview.
 *
 *  - separate per signed-in user, so one account never inherits another's page
 *  - cleared on every sign-in and sign-out (see clearPersistedUi), so a new session always starts at the beginning
 *  - private to the tab: a second tab opens the dashboard at its default
 */
const PREFIX = 'nepal_ui:';

function owner(): string {
  try {
    const u = JSON.parse(localStorage.getItem('nepal_edu_user') || 'null');
    return String((u && (u.id || u.username)) || 'anon');
  } catch {
    return 'anon';
  }
}

const fullKey = (key: string) => `${PREFIX}${owner()}:${key}`;

/** True when a value for this key was saved earlier in this tab (call before the first render effect writes one). */
export function hasPersistedState(key: string): boolean {
  try { return sessionStorage.getItem(fullKey(key)) !== null; } catch { return false; }
}

/** Forgets every remembered dashboard position (used on sign-in / sign-out). */
export function clearPersistedUi(): void {
  try {
    Object.keys(sessionStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => sessionStorage.removeItem(k));
  } catch { /* storage unavailable: nothing to clear */ }
}

export function usePersistentState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(fullKey(key));
      if (raw !== null) return JSON.parse(raw) as T;
    } catch { /* fall back to the default */ }
    return initial;
  });
  useEffect(() => {
    try { sessionStorage.setItem(fullKey(key), JSON.stringify(value)); } catch { /* storage full or blocked: still works, just not remembered */ }
  }, [key, value]);
  return [value, setValue];
}
