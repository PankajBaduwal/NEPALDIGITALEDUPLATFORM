/**
 * Small, dependency-free visual enhancements shared by every portal:
 * big KPI numbers count up the first time they appear.
 * It only ever touches the text of numeric headline figures, never inputs, and it stops immediately
 * if React updates the same text while the animation is running.
 */
const NUMERIC = /^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?%?$/;
const animated = new WeakSet<Node>();
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateNumber(node: Text, original: string) {
  const hasPercent = original.endsWith('%');
  const raw = original.replace(/[,%]/g, '');
  const target = parseFloat(raw);
  if (!isFinite(target) || target === 0 || target > 1e7) return;
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  const grouped = original.includes(',');
  const fmt = (v: number) => {
    let s = v.toFixed(decimals);
    if (grouped) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return hasPercent ? s + '%' : s;
  };
  const duration = 750;
  const start = performance.now();
  let lastWritten = '';
  const step = (now: number) => {
    if (!node.isConnected) return;
    if (lastWritten && node.nodeValue !== lastWritten) return; // React changed it: leave its value alone
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    lastWritten = t >= 1 ? original : fmt(target * eased);
    node.nodeValue = lastWritten;
    if (t < 1) requestAnimationFrame(step);
  };
  node.nodeValue = fmt(0);
  lastWritten = node.nodeValue as string;
  requestAnimationFrame(step);
}

function scan(root: ParentNode) {
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  const found: Text[] = [];
  while ((n = walker.nextNode())) {
    const text = n as Text;
    if (animated.has(text)) continue;
    const value = (text.nodeValue || '').trim();
    if (!value || value.length > 9 || !NUMERIC.test(value)) continue;
    const el = text.parentElement;
    if (!el || /^(INPUT|TEXTAREA|SELECT|SCRIPT|STYLE|OPTION|TD|TH|LI|CODE)$/.test(el.tagName)) continue;
    if (el.closest('[data-no-count], table, svg, [role="dialog"]')) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.fontSize) < 20 || parseInt(cs.fontWeight, 10) < 600) continue;
    found.push(text);
  }
  found.forEach((t) => {
    animated.add(t);
    animateNumber(t, (t.nodeValue || '').trim());
  });
}

export function initUiEnhancements() {
  if (typeof window === 'undefined' || reduceMotion()) return;
  let timer: number | undefined;
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const main = document.querySelector('main') || document.getElementById('root');
      if (main) scan(main);
    }, 140);
  };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
}
