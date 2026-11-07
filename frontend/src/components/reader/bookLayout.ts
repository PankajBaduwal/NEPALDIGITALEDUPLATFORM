// Book layout math: converts between page numbers (1..N) and spreads (0..S).
//
// In 'double' layout the book opens like a real book:
//   Spread 0: [blank, page 1]          (front cover / title page)
//   Spread 1: [page 2, page 3]
//   ...
//   Spread S: [page 2S, page 2S+1]     (or [page 2S, blank] if N is even)
//
// In 'single' layout every page is its own spread:
//   Spread 0: [null, page 1]
//   Spread 1: [null, page 2]
//
// Every function here is pure and fast, safe to run on every frame.

export type ReaderLayout = 'single' | 'double';

/** Total number of spreads (0-indexed, so last spread index is count - 1). */
export const spreadCount = (layout: ReaderLayout, n: number): number => {
  if (!n || n < 1) return 1;
  return layout === 'double' ? Math.floor(n / 2) + 1 : n;
};

export const lastSpread = (layout: ReaderLayout, n: number): number =>
  Math.max(0, spreadCount(layout, n) - 1);

/** Which spread contains page `p` (1..N). */
export const spreadOfPage = (layout: ReaderLayout, p: number): number => {
  if (!p || p < 1) return 0;
  return layout === 'double' ? Math.floor(p / 2) : p - 1;
};

/** [leftPage, rightPage] on spread `s` (null if blank paper, e.g. cover left or even-end right). */
export const pagesOfSpread = (
  layout: ReaderLayout,
  s: number,
  n: number
): [number | null, number | null] => {
  if (layout === 'single') {
    const p = s + 1;
    return [null, p >= 1 && p <= n ? p : null];
  }
  const left = s === 0 ? null : s * 2;
  const right = s === 0 ? 1 : s * 2 + 1;
  return [
    left && left <= n ? left : null,
    right && right <= n ? right : null,
  ];
};

/** First page number showing on this spread (for inputs and "Jump to page"). */
export const firstPageOfSpread = (
  layout: ReaderLayout,
  s: number,
  n: number
): number => {
  const [left, right] = pagesOfSpread(layout, s, n);
  return left || right || 1;
};

/**
 * Human-readable spread label: "1", "2–3", "4–5", etc. In single layout, just "1", "2".
 */
export const spreadLabel = (layout: ReaderLayout, spread: number, n: number): string => {
  const [left, right] = pagesOfSpread(layout, spread, n);
  return left && right ? `${left}–${right}` : String(left || right || 1);
};

export interface TurnPlan {
  forward: boolean;
  front: number | null;
  back: number | null;
  baseLeft: number | null;
  baseRight: number | null;
}

/**
 * What a turn from spread `from` to spread `to` looks like. Every turn is one
 * sheet hinged on its left edge (the spine, or the page's left edge in single layout).
 */
export const turnPlan = (
  layout: ReaderLayout,
  from: number,
  to: number,
  n: number
): TurnPlan => {
  const [lf, rf] = pagesOfSpread(layout, from, n);
  const [lt, rt] = pagesOfSpread(layout, to, n);
  const forward = to > from;
  if (layout === 'double') {
    return forward
      ? { forward, front: rf, back: lt, baseLeft: lf, baseRight: rt }
      : { forward, front: rt, back: lf, baseLeft: lt, baseRight: rf };
  }
  return forward
    ? { forward, front: rf, back: null, baseLeft: null, baseRight: rt }
    : { forward, front: rt, back: null, baseLeft: null, baseRight: rf };
};

/** Pages worth rendering now, most important first (current, next, previous, then further). */
export const pagesToPrepare = (
  layout: ReaderLayout,
  spread: number,
  n: number
): number[] => {
  const order = [spread, spread + 1, spread - 1, spread + 2, spread - 2];
  const last = lastSpread(layout, n);
  const pages: number[] = [];
  order
    .filter((s) => s >= 0 && s <= last)
    .forEach((s) => {
      const [l, r] = pagesOfSpread(layout, s, n);
      if (l) pages.push(l);
      if (r) pages.push(r);
    });
  return pages;
};

