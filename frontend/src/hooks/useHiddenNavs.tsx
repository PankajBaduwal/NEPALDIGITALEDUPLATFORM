import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

/** Menu key -> the feature(s) behind it. A menu item is hidden when ALL of its features are switched off. */
export type NavFeatureMap = Record<string, string | string[]>;

/**
 * Asks the server which features are switched off for the signed-in student (their own class) or teacher
 * (every class they teach) and returns the menu keys to hide. Fails open: if the call fails nothing is hidden,
 * and the server still blocks any switched-off feature.
 */
export const useDisabledFeatures = () => {
  const [state, setState] = useState<{ disabled: string[]; bySection: Record<string, string[]>; loaded: boolean }>({ disabled: [], bySection: {}, loaded: false });
  useEffect(() => {
    let live = true;
    const load = (keepOnError: boolean) =>
      api.get<any>('/feature-access/my-features')
        .then((r) => {
          if (!live) return;
          const d = r?.data && !Array.isArray(r.disabled) ? r.data : r;
          setState({ disabled: Array.isArray(d?.disabled) ? d.disabled : [], bySection: d?.bySection && typeof d.bySection === 'object' ? d.bySection : {}, loaded: true });
        })
        .catch(() => { if (live && !keepOnError) setState({ disabled: [], bySection: {}, loaded: true }); });
    load(false);
    // The Super Admin can switch features while this dashboard stays open: re-check when the tab regains focus and every minute.
    const refresh = () => { if (document.visibilityState === 'visible') load(true); };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => { live = false; document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh); window.clearInterval(timer); };
  }, []);
  return state;
};

export const useHiddenNavs = (map: NavFeatureMap) => {
  const { disabled } = useDisabledFeatures();
  return Object.entries(map)
    .filter(([nav, f]) => {
      // If STUDENT_DASHBOARD is disabled, student-facing features (ASSIGNMENTS, QUIZZES) must be hidden
      if (
        disabled.includes('STUDENT_DASHBOARD') &&
        (nav === 'ASSIGNMENTS' ||
          nav === 'QUIZZES' ||
          f === 'ASSIGNMENTS' ||
          f === 'QUIZZES' ||
          (Array.isArray(f) && (f.includes('ASSIGNMENTS') || f.includes('QUIZZES'))))
      ) {
        return true;
      }
      return (Array.isArray(f) ? f : [f]).every((x) => disabled.includes(x));
    })
    .map(([nav]) => nav);
};

/** Hides every menu button tagged data-nav-feature="KEY" for the given keys (page-wide, including quick links). */
export const HiddenNavStyle: React.FC<{ hidden: string[] }> = ({ hidden }) =>
  hidden.length ? <style>{hidden.map((k) => `[data-nav-feature="${k}"]{display:none !important}`).join('')}</style> : null;
