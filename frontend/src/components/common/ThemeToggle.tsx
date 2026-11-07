import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

const KEY = 'nepal_edu_theme';
const DASHBOARD = /^\/(student|teacher|principal|school-admin|super-admin|class-teacher|hod)(\/|$)/;

const read = (): 'light' | 'dark' => {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
};

/**
 * One floating light/dark switch, shown on every role dashboard. Dark mode is applied to the whole page
 * (see index.css), so all dashboards, dialogs and the textbook reader follow it without per-screen styles.
 */
export const ThemeToggle: React.FC = () => {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(read);

  const onDashboard = DASHBOARD.test(pathname);

  // Dark mode only ever applies on dashboards: the public site and login pages stay light.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', onDashboard && theme === 'dark' ? 'dark' : 'light');
    try { localStorage.setItem(KEY, theme); } catch { /* private mode: the choice just won't persist */ }
  }, [theme, onDashboard]);

  if (!onDashboard) return null;
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
