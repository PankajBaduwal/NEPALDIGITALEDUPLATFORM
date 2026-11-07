import React, {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { lastSpread, pagesOfSpread, turnPlan, ReaderLayout, TurnPlan } from './bookLayout';

const CURL_DEG = 38;
const DRAG_START_PX = 6;
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const easeInOut = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2);

export interface PageSurfaceProps {
  page: number | null;
  url: string | null;
  failed?: boolean;
  onRetry?: (page: number) => void;
}

export const PageSurface: React.FC<PageSurfaceProps> = ({ page, url, failed, onRetry }) => {
  if (!page) return null;
  if (failed) {
    return (
      <div className="fb-paper fb-paper--msg">
        <p>Page {page} could not be drawn.</p>
        {onRetry && (
          <button type="button" onClick={() => onRetry(page)}>
            <RotateCcw size={14} /> Retry
          </button>
        )}
      </div>
    );
  }
  if (!url) {
    return (
      <div className="fb-paper fb-paper--loading" role="img" aria-label={`Loading page ${page}`}>
        <Loader2 className="br-spin" size={24} />
      </div>
    );
  }
  return <img className="fb-paper" src={url} alt={`Page ${page}`} draggable={false} />;
};

export interface FlipBookHandle {
  next: () => void;
  prev: () => void;
  goTo: (targetSpread: number) => void;
  busy: () => boolean;
}

export interface FlipBookProps {
  layout: ReaderLayout;
  numPages: number;
  spread: number;
  pageW: number;
  pageH: number;
  imageFor: (page: number | null) => string | null;
  isFailed: (page: number) => boolean;
  onRetry: (page: number) => void;
  onSpreadChange: (spread: number) => void;
  onCommit: (spread: number) => void;
  onInteract?: () => void;
  reducedMotion?: boolean;
}

export const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(
  (
    {
      layout,
      numPages,
      spread,
      pageW,
      pageH,
      imageFor,
      isFailed,
      onRetry,
      onSpreadChange,
      onCommit,
      onInteract,
      reducedMotion,
    },
    ref
  ) => {
    const double = layout === 'double';
    const strips = pageW < 420 ? 12 : 18;
    const stripW = pageW / strips;
    const hinge = double ? pageW : 0;
    const last = lastSpread(layout, numPages);

    const [turn, setTurn] = useState<TurnPlan | null>(null);
    const bookRef = useRef<HTMLDivElement>(null);
    const leafRef = useRef<HTMLDivElement>(null);
    const castRef = useRef<HTMLDivElement>(null);
    const stripEls = useRef<HTMLDivElement[]>([]);
    const shadeEls = useRef<[HTMLDivElement | null, HTMLDivElement | null][]>([]);
    const spreadRef = useRef(spread);

    const st = useRef<{
      t: number;
      raf: number;
      target: number;
      done: (() => void) | null;
      plan: TurnPlan | null;
      drag: any;
      pending: number | null;
    }>({
      t: 0,
      raf: 0,
      target: 0,
      done: null,
      plan: null,
      drag: null,
      pending: null,
    });

    useLayoutEffect(() => {
      if (!st.current.plan) spreadRef.current = spread;
    }, [spread]);

    // Apply sheet bending at normalized progress t (0 = right, 1 = left)
    const apply = useCallback(
      (t: number) => {
        const s = st.current;
        const dir = s.plan && !s.plan.forward ? -1 : 1;
        const bend = Math.sin(Math.PI * t) * CURL_DEG * dir;
        let prev = 0;
        let edgeX = 0;
        const shades: number[] = [];

        for (let i = 0; i < strips; i += 1) {
          const u = (i + 1) / strips;
          const phi = clamp(180 * t + bend * (u ** 1.6 - 0.35), 0, 180);
          const el = stripEls.current[i];
          if (el) el.style.transform = `rotateY(${-(phi - prev)}deg)`;
          const rad = (phi * Math.PI) / 180;
          shades.push((0.5 * (1 - Math.abs(Math.cos(rad)))) ** 1.15);
          edgeX += stripW * Math.cos(rad);
          prev = phi;
        }

        for (let i = 0; i < strips; i += 1) {
          const a0 = ((shades[i - 1] ?? shades[i]) + shades[i]) / 2;
          const sh = shadeEls.current[i];
          if (sh) {
            const front = `linear-gradient(to right, rgba(15, 23, 42, ${a0.toFixed(3)}), rgba(15, 23, 42, 0))`;
            const back = `linear-gradient(to left, rgba(15, 23, 42, ${a0.toFixed(3)}), rgba(15, 23, 42, 0))`;
            if (sh[0]) sh[0].style.backgroundImage = front;
            if (sh[1]) sh[1].style.backgroundImage = back;
          }
        }

        const cast = castRef.current;
        if (cast) {
          const size = pageW * 0.32;
          const right = edgeX >= 0;
          cast.style.opacity = (0.55 * Math.sin(Math.PI * t)).toFixed(3);
          cast.style.left = `${hinge + edgeX - (right ? 0 : size)}px`;
          cast.style.width = `${size}px`;
        }

        if (!double && leafRef.current) {
          leafRef.current.style.opacity = (1 - clamp((t - 0.55) / 0.4, 0, 1)).toFixed(3);
        }
      },
      [strips, stripW, pageW, hinge, double]
    );

    const finish = useCallback(
      (commitSpread: number) => {
        const s = st.current;
        if (s.raf) cancelAnimationFrame(s.raf);
        s.raf = 0;
        s.plan = null;
        s.drag = null;
        setTurn(null);
        spreadRef.current = commitSpread;
        onSpreadChange(commitSpread);
        onCommit(commitSpread);

        if (s.pending !== null) {
          const nextTarget = s.pending;
          s.pending = null;
          goToSpread(nextTarget);
        }
      },
      [onSpreadChange, onCommit]
    );

    const animateTo = useCallback(
      (target: number, durationMs: number, onEnd: () => void) => {
        const s = st.current;
        if (s.raf) cancelAnimationFrame(s.raf);
        const startT = s.t;
        const delta = target - startT;
        const startWall = performance.now();

        const step = (now: number) => {
          const p = durationMs <= 0 ? 1 : clamp((now - startWall) / durationMs, 0, 1);
          s.t = startT + delta * easeInOut(p);
          apply(s.t);
          if (p < 1) {
            s.raf = requestAnimationFrame(step);
          } else {
            s.t = target;
            apply(target);
            onEnd();
          }
        };
        s.raf = requestAnimationFrame(step);
      },
      [apply]
    );

    const goToSpread = useCallback(
      (targetSpread: number) => {
        const current = spreadRef.current;
        const clamped = clamp(targetSpread, 0, last);
        if (clamped === current) return;

        const s = st.current;
        if (s.plan) {
          s.pending = clamped;
          return;
        }

        const plan = turnPlan(layout, current, clamped, numPages);
        s.plan = plan;
        s.t = plan.forward ? 0 : 1;
        setTurn(plan);

        onInteract?.();

        if (reducedMotion) {
          finish(clamped);
          return;
        }

        requestAnimationFrame(() => {
          apply(s.t);
          const target = plan.forward ? 1 : 0;
          animateTo(target, 280, () => finish(clamped));
        });
      },
      [last, layout, numPages, onInteract, reducedMotion, apply, animateTo, finish]
    );

    useImperativeHandle(ref, () => ({
      next: () => goToSpread(spreadRef.current + 1),
      prev: () => goToSpread(spreadRef.current - 1),
      goTo: (s: number) => goToSpread(s),
      busy: () => Boolean(st.current.plan),
    }));

    const [leftPage, rightPage] = pagesOfSpread(layout, spread, numPages);
    const bookW = double ? pageW * 2 : pageW;

    return (
      <div
        className={`fb-book ${double ? 'fb-book--double' : 'fb-book--single'} ${turn ? 'is-turning' : ''}`}
        ref={bookRef}
        style={{ width: bookW, height: pageH }}
      >
        {/* Left page surface */}
        {double && (
          <div className="fb-page fb-page--left">
            <PageSurface
              page={turn ? turn.baseLeft : leftPage}
              url={imageFor(turn ? turn.baseLeft : leftPage)}
              failed={turn?.baseLeft ? isFailed(turn.baseLeft) : leftPage ? isFailed(leftPage) : false}
              onRetry={onRetry}
            />
          </div>
        )}

        {/* Right page surface */}
        <div className="fb-page fb-page--right">
          <PageSurface
            page={turn ? turn.baseRight : rightPage}
            url={imageFor(turn ? turn.baseRight : rightPage)}
            failed={turn?.baseRight ? isFailed(turn.baseRight) : rightPage ? isFailed(rightPage) : false}
            onRetry={onRetry}
          />
        </div>

        {/* Center Spine */}
        {double && <div className="fb-spine" />}

        {/* Turning Sheet leaf */}
        {turn && (
          <>
            <div className="fb-cast" ref={castRef} style={{ height: pageH }} />
            <div
              className="fb-leaf"
              ref={leafRef}
              style={{
                left: hinge,
                width: pageW,
                height: pageH,
              }}
            >
              {Array.from({ length: strips }).map((_, i) => (
                <div
                  key={i}
                  className="fb-strip"
                  ref={(el) => {
                    if (el) stripEls.current[i] = el;
                  }}
                  style={{
                    left: i === 0 ? 0 : stripW,
                    width: stripW,
                    height: pageH,
                  }}
                >
                  {/* Front and Back strip faces */}
                  <div
                    className={`fb-face fb-face--front ${!turn.front ? 'fb-face--blank' : ''}`}
                    style={{
                      width: pageW,
                      height: pageH,
                      left: -i * stripW,
                      backgroundImage: turn.front && imageFor(turn.front) ? `url(${imageFor(turn.front)})` : undefined,
                      backgroundSize: `${pageW}px ${pageH}px`,
                    }}
                  >
                    <div
                      className="fb-shade"
                      ref={(el) => {
                        if (!shadeEls.current[i]) shadeEls.current[i] = [null, null];
                        shadeEls.current[i][0] = el;
                      }}
                    />
                  </div>

                  <div
                    className={`fb-face fb-face--back ${!turn.back ? 'fb-face--blank' : ''}`}
                    style={{
                      width: pageW,
                      height: pageH,
                      left: -(pageW - (i + 1) * stripW),
                      backgroundImage: turn.back && imageFor(turn.back) ? `url(${imageFor(turn.back)})` : undefined,
                      backgroundSize: `${pageW}px ${pageH}px`,
                    }}
                  >
                    <div
                      className="fb-shade"
                      ref={(el) => {
                        if (!shadeEls.current[i]) shadeEls.current[i] = [null, null];
                        shadeEls.current[i][1] = el;
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Clickable page corners for navigation */}
        <div
          className="fb-hot fb-hot--prev"
          onClick={() => goToSpread(spreadRef.current - 1)}
          title="Previous Page"
        />
        <div
          className="fb-hot fb-hot--next"
          onClick={() => goToSpread(spreadRef.current + 1)}
          title="Next Page"
        />
      </div>
    );
  }
);
FlipBook.displayName = 'FlipBook';

export default FlipBook;

