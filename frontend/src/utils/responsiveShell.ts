/**
 * Adaptive shell shared by every portal (not the Smart Board teaching app, which is a separate page and is untouched).
 *
 *  - Below 1024 px a dashboard's sidebar (<aside>) becomes a slide-in drawer. CSS in responsive.css does the layout;
 *    this module only adds the "Menu" button and the dimmed overlay, and opens/closes the drawer.
 *  - On large touch displays a small "Fullscreen" button appears (browser fullscreen for classroom boards).
 *
 * The controls are appended to <body>, outside React's root, so React never re-renders them away.
 * Navigation keeps working with mouse, touch and keyboard (Escape closes the drawer).
 */
const OPEN = 'rs-nav-open';
const HAS_ASIDE = 'rs-has-aside';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, id: string, attrs: Record<string, string> = {}) {
  const node = document.createElement(tag);
  node.id = id;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

export function initResponsiveShell() {
  if (typeof document === 'undefined' || document.getElementById('rs-menu-btn')) return;
  const body = document.body;
  const small = window.matchMedia('(max-width: 1023px)');

  const burger = el('button', 'rs-menu-btn', { type: 'button', 'aria-label': 'Open navigation menu', 'aria-expanded': 'false' });
  burger.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const overlay = el('div', 'rs-overlay', { 'aria-hidden': 'true' });
  const full = el('button', 'rs-fs-btn', { type: 'button', 'aria-label': 'Toggle fullscreen', title: 'Fullscreen' });
  full.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
  body.append(burger, overlay, full);

  const setOpen = (open: boolean) => {
    body.classList.toggle(OPEN, open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };
  burger.addEventListener('click', () => setOpen(!body.classList.contains(OPEN)));
  overlay.addEventListener('click', () => setOpen(false));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && body.classList.contains(OPEN)) { setOpen(false); burger.focus(); } });
  // Choosing a destination inside the drawer closes it.
  document.addEventListener('click', (e) => {
    if (!small.matches || !body.classList.contains(OPEN)) return;
    const t = e.target as Element | null;
    if (t && t.closest('#root aside button, #root aside a')) window.setTimeout(() => setOpen(false), 160);
  });
  const onBreakpoint = () => { if (!small.matches) setOpen(false); };
  small.addEventListener?.('change', onBreakpoint);

  full.addEventListener('click', () => {
    const d = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
    const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    if (document.fullscreenElement || d.webkitFullscreenElement) (document.exitFullscreen || d.webkitExitFullscreen)?.call(document);
    else (root.requestFullscreen || root.webkitRequestFullscreen)?.call(root);
  });

  // Mark pages that have a sidebar so only they get the Menu button.
  let queued = false;
  const sync = () => {
    queued = false;
    const has = !!document.querySelector('#root aside:not(.sa-sidebar)');
    body.classList.toggle(HAS_ASIDE, has);
    if (!has && body.classList.contains(OPEN)) setOpen(false);
  };
  const schedule = () => { if (!queued) { queued = true; window.setTimeout(sync, 60); } };
  const root = document.getElementById('root');
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  sync();
}
