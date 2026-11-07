// pdf.js loading and on-demand page rendering for the book reader.
// Pages are rendered to canvas images only when needed, kept in an LRU cache,
// and pending renders are aborted when navigation changes or document closes.

let pdfjsPromise: Promise<any> | null = null;

export const loadPdfJs = async (): Promise<any> => {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      try {
        // Vite dynamic import worker
        const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      } catch {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
      }
      return pdfjs;
    })().catch((err) => {
      pdfjsPromise = null;
      throw err;
    });
  }
  return pdfjsPromise;
};

export const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i;
const OFFICE_RE = /\.(docx?|pptx?|xlsx?|odt|odp)(\?|#|$)/i;
const DRIVE_RE = /drive\.google\.com\//i;

/** Can this link be opened in the book reader? (PDFs and single images) */
export const canReadAsBook = (url: string): boolean =>
  Boolean(url) && !OFFICE_RE.test(url) && !DRIVE_RE.test(url);

export type ReaderErrorKind =
  | 'unauthorized'
  | 'missing'
  | 'invalid'
  | 'protected'
  | 'empty'
  | 'network'
  | 'timeout'
  | 'unsupported';

/** Turns pdf.js / network failures into a reader error kind. */
export const classifyError = (err: any): ReaderErrorKind => {
  const name = err && err.name;
  const status = err && err.status;
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 404 || name === 'MissingPDFException') return 'missing';
  if (name === 'InvalidPDFException') return 'invalid';
  if (name === 'UnexpectedResponseException') return status >= 500 ? 'network' : 'missing';
  if (name === 'PasswordException') return 'protected';
  if (err && /network|fetch|Failed to fetch|load/i.test(err.message || '')) return 'network';
  return 'invalid';
};

export interface DocumentDimensions {
  w: number;
  h: number;
}

export interface OpenedDocument {
  kind: 'pdf' | 'image';
  pdf?: any;
  image?: HTMLImageElement;
  numPages: number;
  firstSize: DocumentDimensions;
  task?: any;
}

/**
 * Opens a document for reading.
 */
export const openDocument = async (
  url: string,
  options: {
    onProgress?: (ratio: number | null) => void;
    signal?: AbortSignal;
    httpHeaders?: Record<string, string>;
  } = {}
): Promise<OpenedDocument> => {
  const { onProgress, signal, httpHeaders } = options;

  if (IMAGE_RE.test(url)) {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(Object.assign(new Error('Image failed to load'), { name: 'MissingPDFException' }));
      el.src = url;
    });
    if (signal && signal.aborted) throw new DOMException('aborted', 'AbortError');
    return {
      kind: 'image',
      image: img,
      numPages: 1,
      firstSize: { w: img.naturalWidth || 1, h: img.naturalHeight || 1.414 },
    };
  }

  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({
    url,
    httpHeaders,
    withCredentials: false,
    disableAutoFetch: true,
    disableStream: false,
    isEvalSupported: false,
  });

  if (onProgress) {
    task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
      onProgress(total ? loaded / total : null);
    };
  }
  if (signal) {
    signal.addEventListener('abort', () => task.destroy(), { once: true });
  }

  const pdf = await task.promise;
  if (signal && signal.aborted) {
    pdf.destroy();
    throw new DOMException('aborted', 'AbortError');
  }

  let firstSize: DocumentDimensions = { w: 595, h: 842 };
  if (pdf.numPages > 0) {
    try {
      const p1 = await pdf.getPage(1);
      const v = p1.getViewport({ scale: 1 });
      firstSize = { w: v.width, h: v.height };
    } catch {
      // default A4 aspect
    }
  }

  return { kind: 'pdf', pdf, numPages: pdf.numPages, firstSize, task };
};

const WIDTH_STEP = 160;
const MAX_RENDER_WIDTH = 2600;

export const renderBucket = (cssWidth: number): number => {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  return Math.min(
    MAX_RENDER_WIDTH,
    Math.max(WIDTH_STEP * 2, Math.ceil((cssWidth * dpr) / WIDTH_STEP) * WIDTH_STEP)
  );
};

interface CacheEntry {
  url: string;
  at: number;
}

/**
 * Renders pages into a fixed page box as image URLs with LRU caching.
 */
export class PageImageCache {
  source: OpenedDocument;
  boxAspect: number;
  limit: number;
  onChange?: () => void;
  images: Map<string, CacheEntry>;
  best: Map<number, number>;
  failed: Set<number>;
  queue: Array<{ page: number; width: number }>;
  running: { page: number; width: number } | null;
  closed: boolean;

  constructor(
    source: OpenedDocument,
    boxAspect: number,
    options: { limit?: number; onChange?: () => void } = {}
  ) {
    this.source = source;
    this.boxAspect = boxAspect;
    this.limit = options.limit || 14;
    this.onChange = options.onChange;
    this.images = new Map();
    this.best = new Map();
    this.failed = new Set();
    this.queue = [];
    this.running = null;
    this.closed = false;
  }

  key(page: number, width: number): string {
    return `${page}@${width}`;
  }

  get(page: number, width: number): string | null {
    const exact = this.images.get(this.key(page, width));
    if (exact) {
      exact.at = performance.now();
      return exact.url;
    }
    const w = this.best.get(page);
    const any = w ? this.images.get(this.key(page, w)) : null;
    return any ? any.url : null;
  }

  hasExact(page: number, width: number): boolean {
    return this.images.has(this.key(page, width));
  }

  isFailed(page: number): boolean {
    return this.failed.has(page);
  }

  retry(page: number): void {
    this.failed.delete(page);
    this.enqueue(page, renderBucket(800));
  }

  enqueue(page: number, width: number): void {
    if (this.closed || !page || page < 1 || page > this.source.numPages) return;
    if (this.hasExact(page, width) || this.failed.has(page)) return;

    const existingIdx = this.queue.findIndex((q) => q.page === page);
    if (existingIdx !== -1) {
      if (this.queue[existingIdx].width !== width) {
        this.queue[existingIdx].width = width;
      }
      return;
    }
    this.queue.push({ page, width });
    this.drain();
  }

  reprioritize(pages: number[], width: number): void {
    if (this.closed) return;
    const prioritized: Array<{ page: number; width: number }> = [];
    const seen = new Set<number>();

    for (const p of pages) {
      if (p >= 1 && p <= this.source.numPages && !this.hasExact(p, width) && !this.failed.has(p)) {
        prioritized.push({ page: p, width });
        seen.add(p);
      }
    }
    for (const item of this.queue) {
      if (!seen.has(item.page)) {
        prioritized.push(item);
      }
    }
    this.queue = prioritized;
    this.drain();
  }

  private async drain(): Promise<void> {
    if (this.running || this.queue.length === 0 || this.closed) return;
    const item = this.queue.shift()!;
    this.running = item;

    try {
      const url = await this.renderPage(item.page, item.width);
      if (this.closed) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        return;
      }
      this.put(item.page, item.width, url);
    } catch {
      if (!this.closed) {
        this.failed.add(item.page);
        this.onChange?.();
      }
    } finally {
      this.running = null;
      this.drain();
    }
  }

  private put(page: number, width: number, url: string): void {
    const k = this.key(page, width);
    this.images.set(k, { url, at: performance.now() });

    const currentBest = this.best.get(page) || 0;
    if (width >= currentBest) this.best.set(page, width);

    // Evict oldest if exceeding limit
    if (this.images.size > this.limit) {
      let oldestKey: string | null = null;
      let oldestAt = Infinity;
      for (const [key, val] of this.images.entries()) {
        if (val.at < oldestAt) {
          oldestAt = val.at;
          oldestKey = key;
        }
      }
      if (oldestKey) {
        const evicted = this.images.get(oldestKey);
        if (evicted && evicted.url.startsWith('blob:')) {
          URL.revokeObjectURL(evicted.url);
        }
        this.images.delete(oldestKey);
      }
    }
    this.onChange?.();
  }

  private async renderPage(pageNumber: number, targetWidth: number): Promise<string> {
    if (this.source.kind === 'image' && this.source.image) {
      return this.source.image.src;
    }

    const page = await this.source.pdf.getPage(pageNumber);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = targetWidth / vp1.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2d canvas context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderTask = page.render({ canvasContext: ctx, viewport });
    await renderTask.promise;

    return new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to create blob from rendered page'));
        }
      }, 'image/webp', 0.92);
    });
  }

  destroy(): void {
    this.closed = true;
    this.queue = [];
    this.running = null;
    for (const entry of this.images.values()) {
      if (entry.url.startsWith('blob:')) {
        URL.revokeObjectURL(entry.url);
      }
    }
    this.images.clear();
    this.best.clear();
    this.failed.clear();
  }
}

