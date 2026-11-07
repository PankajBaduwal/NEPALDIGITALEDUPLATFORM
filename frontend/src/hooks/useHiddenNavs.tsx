import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

/** Menu key -> the feature(s) behind it. A menu item is hidden when ALL of its features are switched off. */
export type NavFeatureMap = Record<string, string | string[]>;

/**
 * Asks the server which features are switched off for the signed-in student (their own class) or teacher
 * (every class they teach) and returns the menu keys to hide. Fails open: if the call fails nothing is hidden,
 * and the server still blocks any switched-off feature.
 */
export const useHiddenNavs = (map: NavFeatureMap) => {
  const [disabled, setDisabled] = useState<string[]>([]);
  useEffect(() => {
    let live = true;
    api.get<any>('/feature-access/my-features')
      .then((r) => { if (live) setDisabled(Array.isArray(r?.disabled) ? r.disabled : Array.isArray(r?.data?.disabled) ? r.data.disabled : []); })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);
  const hidden = Object.entries(map)
    .filter(([, f]) => (Array.isArray(f) ? f : [f]).every((x) => disabled.includes(x)))
    .map(([nav]) => nav);
  return hidden;
};

/** Hides every menu button tagged data-nav-feature="KEY" for the given keys (page-wide, including quick links). */
export const HiddenNavStyle: React.FC<{ hidden: string[] }> = ({ hidden }) =>
  hidden.length ? <style>{hidden.map((k) => `[data-nav-feature="${k}"]{display:none !important}`).join('')}</style> : null;
