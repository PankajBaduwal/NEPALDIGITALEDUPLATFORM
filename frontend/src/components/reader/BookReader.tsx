import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  Maximize,
  Minimize,
  RotateCcw,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Presentation,
  Bookmark,
  Layers,
} from 'lucide-react';
import FlipBook, { FlipBookHandle, PageSurface } from './FlipBook';
import {
  canReadAsBook,
  classifyError,
  openDocument,
  PageImageCache,
  renderBucket,
  OpenedDocument,
  ReaderErrorKind,
} from './pdfDocument';
import {
  firstPageOfSpread,
  lastSpread,
  pagesOfSpread,
  pagesToPrepare,
  spreadLabel,
  spreadOfPage,
  ReaderLayout,
} from './bookLayout';
import {
  getLastPage,
  getModePref,
  getSoundOn,
  playPageSound,
  primePageSound,
  saveLastPage,
  setModePref,
  setSoundOn,
} from './readerPrefs';
import './BookReader.css';

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DOUBLE_MIN_WIDTH = 820;
const STALL_MS = 45000;

const ERRORS: Record<ReaderErrorKind, [string, string]> = {
  unauthorized: [
    'You don’t have access to this textbook right now',
    'Your session or signed access link may have expired. Close the reader and reopen.',
  ],
  missing: [
    'This textbook PDF could not be found',
    'The CDC curriculum file may have been moved or is currently processing.',
  ],
  invalid: ['This file is not a valid PDF', 'It may be corrupted or still uploading.'],
  protected: ['This PDF is password protected', 'Please contact your administrator.'],
  empty: ['This document has no readable pages', 'The CDC file contains 0 pages.'],
  network: ['Network error loading PDF', 'Please check your connection and retry.'],
  timeout: ['Document loading timed out', 'The server is taking longer than usual to stream the PDF.'],
  unsupported: [
    'This file type cannot be opened in the Book Reader',
    'Please download the file directly.',
  ],
};

export interface BookReaderChapterTopic {
  title: string;
  startPage?: number;
}

export interface BookReaderChapter {
  chapterNumber: number;
  title: string;
  titleNepali?: string;
  startPage: number;
  endPage: number;
  topics?: BookReaderChapterTopic[];
}

export interface BookReaderProps {
  url: string;
  title: string;
  titleNepali?: string;
  gradeNumber?: number;
  medium?: string;
  docId: string;
  initialPage?: number;
  allowDownload?: boolean;
  onClose: () => void;
  onOpenSmartBoard?: (page: number) => void;
  chapters?: BookReaderChapter[];
}

export const BookReader: React.FC<BookReaderProps> = ({
  url,
  title,
  titleNepali,
  gradeNumber,
  medium,
  docId,
  initialPage = 1,
  allowDownload = true,
  onClose,
  onOpenSmartBoard,
  chapters = [],
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bookApi = useRef<FlipBookHandle>(null);
  const cacheRef = useRef<PageImageCache | null>(null);

  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<{
    state: 'loading' | 'error' | 'ready';
    progress: number | null;
    error: ReaderErrorKind | null;
  }>({ state: 'loading', progress: null, error: null });

  const [doc, setDoc] = useState<{ numPages: number; aspect: number } | null>(null);
  const [, setVersion] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [mode, setMode] = useState<'book' | 'simple'>(() => getModePref() || 'book');
  const [zoom, setZoom] = useState(1);
  const [stage, setStage] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight - 60 : 800,
  });

  const [soundOn, setSound] = useState(getSoundOn);
  const [isFull, setFull] = useState(false);
  const [resumedAt, setResumedAt] = useState<number | null>(null);
  const [pageInput, setPageInput] = useState<string | null>(null);

  // Sidebar for Nepal CDC chapters & bookmarks
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'bookmarks'>('chapters');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [chapterSearch, setChapterSearch] = useState('');

  // Load bookmarks for docId
  useEffect(() => {
    if (docId) {
      try {
        const saved = localStorage.getItem(`nepal_bm_${docId}`);
        if (saved) setBookmarks(JSON.parse(saved));
      } catch {
        setBookmarks([]);
      }
    }
  }, [docId]);

  const toggleBookmark = (pg: number) => {
    let next: number[];
    if (bookmarks.includes(pg)) {
      next = bookmarks.filter((p) => p !== pg);
    } else {
      next = [...bookmarks, pg].sort((a, b) => a - b);
    }
    setBookmarks(next);
    localStorage.setItem(`nepal_bm_${docId}`, JSON.stringify(next));
  };

  // Open the document
  useEffect(() => {
    let alive = true;
    let opened: OpenedDocument | null = null;
    let cache: PageImageCache | null = null;
    const ctl = new AbortController();
    let lastActivity = Date.now();

    setStatus({ state: 'loading', progress: null, error: null });
    setDoc(null);

    if (!canReadAsBook(url)) {
      setStatus({ state: 'error', progress: null, error: 'unsupported' });
      return;
    }

    const watchdog = setInterval(() => {
      if (alive && Date.now() - lastActivity > STALL_MS) {
        ctl.abort();
        setStatus({ state: 'error', progress: null, error: 'timeout' });
      }
    }, 2000);

    openDocument(url, {
      signal: ctl.signal,
      onProgress: (ratio) => {
        lastActivity = Date.now();
        if (alive) setStatus((s) => ({ ...s, progress: ratio }));
      },
    })
      .then((res) => {
        if (!alive) {
          if (res.task) res.task.destroy();
          return;
        }
        opened = res;
        const n = res.numPages;
        if (!n || n < 1) {
          setStatus({ state: 'error', progress: null, error: 'empty' });
          return;
        }
        const aspect = (res.firstSize.h || 842) / (res.firstSize.w || 595);
        cache = new PageImageCache(res, aspect, {
          limit: 16,
          onChange: () => {
            if (alive) setVersion((v) => v + 1);
          },
        });
        cacheRef.current = cache;

        const startPage = initialPage > 1 ? initialPage : getLastPage(docId) || 1;
        const validPage = Math.min(n, Math.max(1, startPage));
        if (validPage > 1 && startPage === getLastPage(docId)) {
          setResumedAt(validPage);
        }
        setPage(validPage);
        setDoc({ numPages: n, aspect });
        setStatus({ state: 'ready', progress: 1, error: null });
      })
      .catch((err) => {
        if (!alive) return;
        if (err && err.name === 'AbortError') return;
        setStatus({ state: 'error', progress: null, error: classifyError(err) });
      })
      .finally(() => clearInterval(watchdog));

    return () => {
      alive = false;
      clearInterval(watchdog);
      ctl.abort();
      if (cache) cache.destroy();
      cacheRef.current = null;
    };
  }, [url, docId, attempt, initialPage]);

  // Stage resize listener
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setStage({ w: rect.width || window.innerWidth, h: rect.height || window.innerHeight - 60 });
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [status.state]);

  const n = doc?.numPages || 0;
  const aspect = doc?.aspect || 1.414;

  const layout: ReaderLayout = useMemo(() => {
    if (stage.w < DOUBLE_MIN_WIDTH) return 'single';
    return mode === 'book' ? 'double' : 'single';
  }, [stage.w, mode]);

  const spread = useMemo(() => spreadOfPage(layout, page), [layout, page]);

  // Calculate pixel dimensions of pages
  const { pageW, pageH } = useMemo(() => {
    const pad = 24;
    const availW = Math.max(280, stage.w - pad * 2);
    const availH = Math.max(320, stage.h - pad * 2);

    let fitW: number;
    let fitH: number;

    if (layout === 'double') {
      const bookAspect = aspect / 2; // (H) / (2W)
      if (availH / availW > bookAspect) {
        fitW = availW / 2;
        fitH = fitW * aspect;
      } else {
        fitH = availH;
        fitW = fitH / aspect;
      }
    } else {
      if (availH / availW > aspect) {
        fitW = availW;
        fitH = fitW * aspect;
      } else {
        fitH = availH;
        fitW = fitH / aspect;
      }
    }

    return {
      pageW: Math.max(160, Math.floor(fitW * zoom)),
      pageH: Math.max(220, Math.floor(fitH * zoom)),
    };
  }, [stage, layout, aspect, zoom]);

  // Enqueue pages to prepare around current spread
  useEffect(() => {
    const cache = cacheRef.current;
    if (!cache || !n) return;
    const bucket = renderBucket(pageW);
    const needed = pagesToPrepare(layout, spread, n);
    cache.reprioritize(needed, bucket);
  }, [layout, spread, pageW, n]);

  const onSpreadChange = useCallback(
    (nextSpread: number) => {
      const newPage = firstPageOfSpread(layout, nextSpread, n);
      setPage(newPage);
      saveLastPage(docId, newPage);
    },
    [layout, n, docId]
  );

  const onCommit = useCallback(
    (committedSpread: number) => {
      const newPage = firstPageOfSpread(layout, committedSpread, n);
      setPage(newPage);
      saveLastPage(docId, newPage);
    },
    [layout, n, docId]
  );

  const onInteract = useCallback(() => {
    primePageSound();
    if (soundOn) playPageSound();
  }, [soundOn]);

  const goToPage = useCallback(
    (targetPage: number) => {
      const valid = Math.max(1, Math.min(n, targetPage));
      const targetSpread = spreadOfPage(layout, valid);
      if (mode === 'book' && bookApi.current) {
        bookApi.current.goTo(targetSpread);
      } else {
        setPage(valid);
        saveLastPage(docId, valid);
      }
    },
    [layout, n, mode, docId]
  );

  const prev = () => {
    if (mode === 'book' && bookApi.current) {
      bookApi.current.prev();
    } else {
      goToPage(page - 1);
    }
  };

  const next = () => {
    if (mode === 'book' && bookApi.current) {
      bookApi.current.next();
    } else {
      goToPage(page + (layout === 'double' ? 2 : 1));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToPage(n);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, goToPage, n, onClose]);

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSound(nextVal);
    setSoundOn(nextVal);
    if (nextVal) primePageSound();
  };

  const toggleFull = () => {
    if (!document.fullscreenElement) {
      rootRef.current?.requestFullscreen().then(() => setFull(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFull(false)).catch(() => {});
    }
  };

  const errorInfo = status.error ? ERRORS[status.error] : null;
  const label = spreadLabel(layout, spread, n);

  const imageFor = (p: number | null) => (p && cacheRef.current ? cacheRef.current.get(p, renderBucket(pageW)) : null);
  const isFailed = (p: number) => (cacheRef.current ? cacheRef.current.isFailed(p) : false);
  const retryPage = (p: number) => cacheRef.current?.retry(p);

  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      (c.titleNepali && c.titleNepali.includes(chapterSearch))
  );

  const body = (
    <div className={`br ${isFull ? 'is-full' : ''}`} ref={rootRef}>
      {/* Top Controls Toolbar */}
      <div className="br-bar">
        {/* Left Section: Back, Chapters & Title */}
        <div className="br-bar__start">
          <button type="button" className="br-btn br-btn--close" onClick={onClose} title="Close Reader">
            <ArrowLeft size={16} /> Exit
          </button>

          {chapters.length > 0 && (
            <button
              type="button"
              className={`br-btn ${sidebarOpen ? 'bg-indigo-600 border-indigo-500 text-white' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle CDC Chapters & Topics"
            >
              <Layers size={15} /> Chapters ({chapters.length})
            </button>
          )}

          <div className="br-title" title={title}>
            <span>🇳🇵 {title}</span>
            {titleNepali && <span className="opacity-70 text-xs ml-1.5 font-normal">({titleNepali})</span>}
          </div>

          {gradeNumber && (
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Grade {gradeNumber}
            </span>
          )}
          {medium && (
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {medium}
            </span>
          )}
        </div>

        {/* Center Section: Page Navigation */}
        <div className="br-bar__nav">
          <button
            type="button"
            className="br-btn"
            onClick={prev}
            disabled={spread <= 0}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs text-slate-500">Page</span>
          <input
            type="text"
            className="br-input"
            value={pageInput !== null ? pageInput : String(page)}
            onChange={(e) => setPageInput(e.target.value)}
            onFocus={() => setPageInput(String(page))}
            onBlur={() => {
              if (pageInput !== null) {
                const target = parseInt(pageInput, 10);
                if (!Number.isNaN(target)) goToPage(target);
                setPageInput(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = parseInt((e.target as HTMLInputElement).value, 10);
                if (!Number.isNaN(target)) goToPage(target);
                setPageInput(null);
              }
            }}
            aria-label="Current page"
          />
          <span className="br-total">/ {n || '–'}</span>

          <button
            type="button"
            className="br-btn"
            onClick={next}
            disabled={n > 0 && spread >= lastSpread(layout, n)}
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          <div className="br-sep" />

          {/* Zoom controls */}
          <div className="br-zoom">
            <button
              type="button"
              className="br-btn"
              onClick={() => {
                const curIdx = ZOOMS.indexOf(zoom);
                const nextIdx = curIdx > 0 ? curIdx - 1 : 0;
                setZoom(ZOOMS[nextIdx]);
              }}
              disabled={zoom <= ZOOMS[0]}
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="br-zoom-val">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="br-btn"
              onClick={() => {
                const curIdx = ZOOMS.indexOf(zoom);
                const nextIdx = curIdx !== -1 && curIdx < ZOOMS.length - 1 ? curIdx + 1 : ZOOMS.length - 1;
                setZoom(ZOOMS[nextIdx]);
              }}
              disabled={zoom >= ZOOMS[ZOOMS.length - 1]}
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            {zoom !== 1 && (
              <button type="button" className="br-btn" onClick={() => setZoom(1)}>
                100%
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Tools, Smart Board, Bookmarks, Sound, Fullscreen */}
        <div className="br-bar__end">
          <button
            type="button"
            className={`br-btn ${bookmarks.includes(page) ? 'bg-amber-600 border-amber-500 text-white' : ''}`}
            onClick={() => toggleBookmark(page)}
            title="Bookmark this page"
          >
            <Bookmark size={15} /> {bookmarks.includes(page) ? 'Bookmarked' : 'Bookmark'}
          </button>

          {/* Smart Board Launcher Button */}
          {onOpenSmartBoard && (
            <button
              type="button"
              className="br-btn br-btn--smartboard"
              onClick={() => onOpenSmartBoard(page)}
              title="Launch interactive Smart Board on this textbook page"
            >
              <Presentation size={16} /> Smart Board
            </button>
          )}

          <button
            type="button"
            className={`br-btn ${mode === 'book' ? 'text-indigo-400' : ''}`}
            onClick={() => {
              const nextMode = mode === 'book' ? 'simple' : 'book';
              setMode(nextMode);
              setModePref(nextMode);
            }}
            title={mode === 'book' ? 'Switch to Continuous Single Page' : 'Switch to Realistic Book Spreads'}
          >
            <BookOpen size={16} />
          </button>

          <button
            type="button"
            className={`br-btn ${soundOn ? 'text-indigo-400' : 'text-slate-500'}`}
            onClick={toggleSound}
            title={soundOn ? 'Mute Page Turn Sound' : 'Enable Page Turn Sound'}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            className="br-btn"
            onClick={toggleFull}
            title={isFull ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFull ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {allowDownload && url && (
            <a
              className="br-btn"
              href={url}
              download={`${title}.pdf`}
              target="_blank"
              rel="noreferrer"
              title="Download original PDF"
            >
              <Download size={15} />
            </a>
          )}
        </div>
      </div>

      {/* Reader Stage & Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chapters & Bookmarks Drawer */}
        {sidebarOpen && chapters.length > 0 && (
          <div className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden z-20">
            <div className="flex border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('chapters')}
                className={`flex-1 py-3 text-center transition ${
                  activeTab === 'chapters'
                    ? 'border-b-2 border-indigo-500 text-indigo-700 bg-indigo-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                CDC Chapters ({chapters.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookmarks')}
                className={`flex-1 py-3 text-center transition ${
                  activeTab === 'bookmarks'
                    ? 'border-b-2 border-indigo-500 text-indigo-700 bg-indigo-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bookmarks ({bookmarks.length})
              </button>
            </div>

            {activeTab === 'chapters' ? (
              <>
                <div className="p-2 border-b border-slate-200">
                  <input
                    type="text"
                    placeholder="Search chapter or topic…"
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {filteredChapters.map((ch) => (
                    <div
                      key={ch.chapterNumber}
                      onClick={() => goToPage(ch.startPage)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        page >= ch.startPage && page <= ch.endPage
                          ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>Chapter {ch.chapterNumber}</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                          pp. {ch.startPage}–{ch.endPage}
                        </span>
                      </div>
                      <div className="mt-1 font-medium">{ch.title}</div>
                      {ch.titleNepali && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{ch.titleNepali}</div>
                      )}
                      {ch.topics && ch.topics.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                          {ch.topics.map((t, idx) => (
                            <div
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (t.startPage) goToPage(t.startPage);
                              }}
                              className="text-[11px] text-slate-500 hover:text-indigo-300 flex items-center justify-between py-0.5"
                            >
                              <span className="truncate">▪ {t.title}</span>
                              {t.startPage && (
                                <span className="font-mono text-[10px] text-slate-500">p.{t.startPage}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {bookmarks.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">
                    No bookmarks saved yet. Click the &quot;Bookmark&quot; button in the toolbar to save pages.
                  </p>
                ) : (
                  bookmarks.map((bm) => (
                    <div
                      key={bm}
                      onClick={() => goToPage(bm)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 cursor-pointer"
                    >
                      <span className="font-semibold text-amber-700">★ Page {bm}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(bm);
                        }}
                        className="text-slate-500 hover:text-rose-600 p-1"
                        title="Remove bookmark"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Canvas Viewport */}
        <div className="br-stage" ref={stageRef}>
          {status.state === 'loading' && (
            <div className="br-status" role="status">
              <Loader2 className="br-spin text-indigo-400" size={32} />
              <strong>Opening CDC Digital Textbook…</strong>
              <p className="text-xs text-slate-500">{title}</p>
              {typeof status.progress === 'number' && status.progress < 1 && (
                <div className="br-progress">
                  <i style={{ width: `${Math.round(status.progress * 100)}%` }} />
                </div>
              )}
            </div>
          )}

          {status.state === 'error' && errorInfo && (
            <div className="br-status br-status--error" role="alert">
              <AlertTriangle size={32} />
              <strong>{errorInfo[0]}</strong>
              <p>{errorInfo[1]}</p>
              <div className="br-status__actions">
                <button
                  type="button"
                  className="br-pill br-pill--fill"
                  onClick={() => setAttempt((a) => a + 1)}
                >
                  <RotateCcw size={14} /> Try again
                </button>
                {allowDownload && url && (
                  <a className="br-pill" href={url} download={`${title}.pdf`} target="_blank" rel="noreferrer">
                    <Download size={14} /> Direct Download
                  </a>
                )}
                <button type="button" className="br-pill" onClick={onClose}>
                  <ArrowLeft size={14} /> Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {status.state === 'ready' && doc && (
            <div className="br-canvas">
              {mode === 'book' ? (
                <FlipBook
                  ref={bookApi}
                  layout={layout}
                  numPages={n}
                  spread={spread}
                  pageW={pageW}
                  pageH={pageH}
                  imageFor={imageFor}
                  isFailed={isFailed}
                  onRetry={retryPage}
                  onSpreadChange={onSpreadChange}
                  onCommit={onCommit}
                  onInteract={onInteract}
                />
              ) : (
                <div className="br-simple" style={{ width: pageW, height: pageH }}>
                  <div key={page} className="br-simple__page">
                    <PageSurface
                      page={page}
                      url={imageFor(page)}
                      failed={isFailed(page)}
                      onRetry={retryPage}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {resumedAt && status.state === 'ready' && (
            <div className="br-toast" role="status">
              Resumed reading at page {resumedAt}
              <button
                type="button"
                onClick={() => {
                  setResumedAt(null);
                  goToPage(1);
                }}
              >
                Page 1
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(body, document.body) : null;
};

export default BookReader;

