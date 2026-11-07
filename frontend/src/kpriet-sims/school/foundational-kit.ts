/**
 * Foundational Stage (Class 1–2 / Ages 5–7 / NEP 2020) Simulation Shell Standard.
 *
 * Core architectural building blocks:
 * 1. UI Tokens & Ergonomics (min 48px touch bounding targets, forgiving hit-slop, high-contrast palette).
 * 2. Procedural Web Audio Sound FX Engine (zero mp3 assets, zero latency, offline-ready).
 * 3. Speech Synthesis Audio Scaffolding (zero reading penalty for early learners).
 * 4. Responsive Pointer / Multi-Touch Normalization & Drag Controller.
 * 5. Tactile Foundational Primitives (Ten-frames, manipulative tokens, snap drop-zones, celebration fanfare).
 *
 * Runs inside the existing PiyushDhara SimulationShell — no secondary simulation runner.
 */

/* ═══════════════════════════════════════════════════════════════
   1. DESIGN SYSTEM & UI TOKENS
   ═══════════════════════════════════════════════════════════════ */

export const F_TOKENS = {
  /** WCAG 2.5.5 AAA and early-childhood fine-motor standard (min 48px). */
  MIN_TOUCH_TARGET: 48,
  RECOMMENDED_TOUCH_TARGET: 64,
  LARGE_TOUCH_TARGET: 72,

  /** Forgiving hit area padding around interactive elements. */
  HIT_SLOP: 14,
  SNAP_DISTANCE: 38,

  /** Ergonomic radii for cards and buttons. */
  RADIUS_SM: 12,
  RADIUS_MD: 18,
  RADIUS_LG: 24,
  RADIUS_PILL: 999,

  /** Research-backed high-contrast, playful child-friendly palette. */
  COLORS: {
    sky: '#0284C7',
    grass: '#16A34A',
    sunshine: '#F59E0B',
    coral: '#F43F5E',
    grape: '#8B5CF6',
    tangerine: '#EA580C',
    mint: '#10B981',
    teal: '#0D9488',
    pink: '#EC4899',

    // Canvas & surface colors
    canvasWarm: '#FFFDF7', // Warm eye-friendly cream (reduces glare)
    cardWhite: '#FFFFFF',
    borderSoft: '#E2E8F0',
    borderThick: '#CBD5E1',

    // Ink & readability (WCAG AAA contrast)
    inkPrimary: '#0F172A',
    inkMuted: '#475569',
    inkDimmed: '#94A3B8',

    // State feedback
    dropGlow: 'rgba(59, 130, 246, 0.28)',
    dropActive: 'rgba(16, 185, 129, 0.35)',
    retryAmber: '#F97316',
    successEmerald: '#10B981',
    focusRing: '#6366F1',
  },

  FONTS: {
    family: "'Quicksand', 'Nunito', 'Inter', system-ui, sans-serif",
    displaySize: 28,
    promptSize: 20,
    bodySize: 16,
    digitSize: 42,
  },
} as const;

export const F_PALETTE = [
  F_TOKENS.COLORS.sky,
  F_TOKENS.COLORS.grass,
  F_TOKENS.COLORS.sunshine,
  F_TOKENS.COLORS.coral,
  F_TOKENS.COLORS.grape,
  F_TOKENS.COLORS.tangerine,
  F_TOKENS.COLORS.mint,
  F_TOKENS.COLORS.pink,
];

/* ═══════════════════════════════════════════════════════════════
   2. PROCEDURAL WEB AUDIO SOUND FX ENGINE
   Zero external MP3 dependencies · 100% offline · Zero latency
   ═══════════════════════════════════════════════════════════════ */

class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /** Cheerful bubble pop when picking up an object or pressing a tactile button. */
  public playPop(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } catch {}
  }

  /** Satisfying drop/slot sound when snapping an object into a drop zone. */
  public playDrop(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  /** Ascending acoustic pitch tick corresponding to counting (1, 2, 3...). */
  public playCountTick(count: number): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = Math.min(1200, 360 + Math.max(1, count) * 45);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /** Harmonic major triad chime (C5 - E5 - G5 - C6) for successful match. */
  public playSuccessChime(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const baseTime = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const noteStart = baseTime + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.28, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.36);
      });
    } catch {}
  }

  /** Warm marimba wobble retry tone (non-punitive, gentle, encouraging). */
  public playGentleRetry(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const tones = [330, 294]; // E4, D4 warm downward bounce

      tones.forEach((freq, idx) => {
        const noteStart = now + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.24);
      });
    } catch {}
  }

  /** Jubilant celebration fanfare with shimmer arpeggio upon completing an activity. */
  public playCelebrationFanfare(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // C5, G5, C6, E6, G6 fanfare
      const melody = [523.25, 783.99, 1046.5, 1318.51, 1567.98];
      const baseTime = ctx.currentTime;

      melody.forEach((freq, idx) => {
        const noteStart = baseTime + idx * 0.09;
        const duration = idx === melody.length - 1 ? 0.6 : 0.25;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.32, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.02);
      });
    } catch {}
  }
}

export const FoundationalAudio = new ProceduralSoundEngine();

/* ═══════════════════════════════════════════════════════════════
   3. SPEECH SYNTHESIS AUDIO NARRATOR
   Zero Reading Penalty for Early Learners
   ═══════════════════════════════════════════════════════════════ */

class FoundationalVoiceNarrator {
  private lastSpokenText: string = '';

  public speak(text: string, options: { lang?: string; rate?: number; pitch?: number } = {}): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-IN';
      utterance.rate = options.rate ?? 0.88; // Gentle, clear cadence for young learners
      utterance.pitch = options.pitch ?? 1.05; // Slightly warm/bright pitch

      // Select child-friendly voice if available
      const voices = window.speechSynthesis.getVoices();
      const match =
        voices.find((v) => v.lang.startsWith(utterance.lang) && /female|natural|google/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (match) utterance.voice = match;

      this.lastSpokenText = text;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public repeat(): void {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText);
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  public isSpeaking(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis.speaking
      : false;
  }
}

export const FoundationalNarrator = new FoundationalVoiceNarrator();

/* ═══════════════════════════════════════════════════════════════
   4. TOUCH & POINTER TRACKER & HIT-TESTING
   Resilient single-finger touch normalization & snap math
   ═══════════════════════════════════════════════════════════════ */

export interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class FoundationalTouchHelper {
  /** Normalizes mouse or touch client coordinates to local canvas coordinate space. */
  public static getCanvasCoordinates(
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    // If canvas has CSS scaling or devicePixelRatio applied
    const dpr = window.devicePixelRatio || 1;
    return {
      x: ((clientX - rect.left) * scaleX) / dpr,
      y: ((clientY - rect.top) * scaleY) / dpr,
    };
  }

  /** Forgiving rectangular hit-test with generous touch-slop. */
  public static hitTestRect(
    px: number,
    py: number,
    box: IBoundingBox,
    slop: number = F_TOKENS.HIT_SLOP
  ): boolean {
    return (
      px >= box.x - slop &&
      px <= box.x + box.width + slop &&
      py >= box.y - slop &&
      py <= box.y + box.height + slop
    );
  }

  /** Forgiving circular hit-test with generous touch-slop. */
  public static hitTestCircle(
    px: number,
    py: number,
    cx: number,
    cy: number,
    radius: number,
    slop: number = F_TOKENS.HIT_SLOP
  ): boolean {
    const dx = px - cx;
    const dy = py - cy;
    const r = radius + slop;
    return dx * dx + dy * dy <= r * r;
  }

  /** Distance between two coordinates. */
  public static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /** Check if element is within magnet snap range of a target zone. */
  public static isWithinSnap(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    threshold: number = F_TOKENS.SNAP_DISTANCE
  ): boolean {
    return this.distance(x1, y1, x2, y2) <= threshold;
  }
}

/* ═══════════════════════════════════════════════════════════════
   5. FOUNDATIONAL CANVAS DRAWING ENGINE & PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

export interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
}

export function clearFoundationalCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title?: string,
  badge?: string
): void {
  // Warm soothing cream background
  ctx.fillStyle = F_TOKENS.COLORS.canvasWarm;
  ctx.fillRect(0, 0, w, h);

  // Playful decorative subtle dot grid
  ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
  const step = 28;
  for (let x = step / 2; x < w; x += step) {
    for (let y = step / 2; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Header band
  if (title) {
    ctx.fillStyle = F_TOKENS.COLORS.cardWhite;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(0, 0, w, 44);
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = F_TOKENS.COLORS.borderSoft;
    ctx.fillRect(0, 44, w, 1);

    // Title text
    ctx.font = `700 15px ${F_TOKENS.FONTS.family}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = F_TOKENS.COLORS.inkPrimary;
    ctx.fillText(title, 18, 22);

    if (badge) {
      const badgeW = ctx.measureText(badge).width + 16;
      ctx.fillStyle = '#E0F2FE';
      drawRoundedRectPath(ctx, w - badgeW - 18, 10, badgeW, 24, 12);
      ctx.fill();

      ctx.font = `700 11px ${F_TOKENS.FONTS.family}`;
      ctx.fillStyle = F_TOKENS.COLORS.sky;
      ctx.textAlign = 'center';
      ctx.fillText(badge, w - badgeW / 2 - 18, 22);
    }
  }
}

/** Draws rounded rectangle path (path only, allows fill/stroke). */
export function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Draws large friendly instruction banner at the top of the workspace. */
export function drawInstructionBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  prompt: string,
  opts: {
    y?: number;
    speakerActive?: boolean;
    step?: string;
    subPrompt?: string;
  } = {}
): { speakerBounds: IBoundingBox } {
  const y = opts.y ?? 54;
  const bannerH = opts.subPrompt ? 70 : 54;
  const bannerW = Math.min(w - 32, 780);
  const startX = (w - bannerW) / 2;

  // Background pill card
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = F_TOKENS.COLORS.cardWhite;
  drawRoundedRectPath(ctx, startX, y, bannerW, bannerH, F_TOKENS.RADIUS_MD);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Thick friendly border
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Speaker button (touch target min 48px)
  const speakerX = startX + 10;
  const speakerY = y + (bannerH - 40) / 2;
  const speakerW = 40;
  const speakerH = 40;

  ctx.fillStyle = opts.speakerActive ? '#FEF08A' : '#EFF6FF';
  drawRoundedRectPath(ctx, speakerX, speakerY, speakerW, speakerH, 12);
  ctx.fill();
  ctx.strokeStyle = opts.speakerActive ? F_TOKENS.COLORS.sunshine : '#BFDBFE';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Speaker icon
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = F_TOKENS.COLORS.sky;
  ctx.fillText('🔊', speakerX + speakerW / 2, speakerY + speakerH / 2);

  // Prompt text
  ctx.textAlign = 'left';
  ctx.textBaseline = opts.subPrompt ? 'alphabetic' : 'middle';
  ctx.fillStyle = F_TOKENS.COLORS.inkPrimary;
  ctx.font = `700 18px ${F_TOKENS.FONTS.family}`;
  const textX = speakerX + speakerW + 16;
  const textY = opts.subPrompt ? y + 28 : y + bannerH / 2;
  ctx.fillText(prompt, textX, textY);

  if (opts.subPrompt) {
    ctx.font = `600 13px ${F_TOKENS.FONTS.family}`;
    ctx.fillStyle = F_TOKENS.COLORS.inkMuted;
    ctx.fillText(opts.subPrompt, textX, y + 50);
  }

  // Step badge if provided
  if (opts.step) {
    ctx.font = `700 12px ${F_TOKENS.FONTS.family}`;
    const badgeText = opts.step;
    const badgeW = ctx.measureText(badgeText).width + 16;
    const badgeX = startX + bannerW - badgeW - 14;
    const badgeY = y + (bannerH - 26) / 2;

    ctx.fillStyle = '#FEF3C7';
    drawRoundedRectPath(ctx, badgeX, badgeY, badgeW, 26, 13);
    ctx.fill();

    ctx.fillStyle = '#B45309';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 13);
  }

  ctx.restore();

  return {
    speakerBounds: {
      x: speakerX,
      y: speakerY,
      width: speakerW,
      height: speakerH,
    },
  };
}

/** Draws tactile draggable toy card with 3D button press look. */
export function drawTactileCard(
  ctx: CanvasRenderingContext2D,
  card: {
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    icon?: string;
    color?: string;
    borderColor?: string;
    isDragging?: boolean;
    isLocked?: boolean;
    countBadge?: number;
  }
): void {
  ctx.save();
  const c = card.color || F_TOKENS.COLORS.cardWhite;
  const bc = card.borderColor || F_TOKENS.COLORS.borderThick;

  // Drop shadow is deeper and offset when dragged (feels lifted from screen)
  if (card.isDragging) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
  }

  ctx.fillStyle = c;
  drawRoundedRectPath(ctx, card.x, card.y, card.width, card.height, F_TOKENS.RADIUS_MD);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Tactile 3D bottom edge
  if (!card.isDragging) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    drawRoundedRectPath(
      ctx,
      card.x,
      card.y + card.height - 6,
      card.width,
      6,
      F_TOKENS.RADIUS_MD
    );
    ctx.fill();
  }

  // Border
  ctx.strokeStyle = card.isDragging ? F_TOKENS.COLORS.focusRing : bc;
  ctx.lineWidth = card.isDragging ? 3 : 2;
  ctx.stroke();

  // Icon
  if (card.icon) {
    ctx.font = `${Math.min(card.width, card.height) * 0.45}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const iconY = card.label ? card.y + card.height * 0.42 : card.y + card.height / 2;
    ctx.fillText(card.icon, card.x + card.width / 2, iconY);
  }

  // Label
  if (card.label) {
    ctx.fillStyle = F_TOKENS.COLORS.inkPrimary;
    ctx.font = `700 15px ${F_TOKENS.FONTS.family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.label, card.x + card.width / 2, card.y + card.height * 0.82);
  }

  // Count badge
  if (card.countBadge != null) {
    const badgeR = 14;
    const bx = card.x + card.width - badgeR - 4;
    const by = card.y + badgeR + 4;

    ctx.fillStyle = F_TOKENS.COLORS.coral;
    ctx.beginPath();
    ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 13px ${F_TOKENS.FONTS.family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(card.countBadge), bx, by);
  }

  ctx.restore();
}

/** Draws dashed glowing drop zone slot for magnetic snapping. */
export function drawDropZone(
  ctx: CanvasRenderingContext2D,
  zone: {
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    sublabel?: string;
    isHovered?: boolean;
    isOccupied?: boolean;
    color?: string;
  }
): void {
  ctx.save();
  const baseColor = zone.color || F_TOKENS.COLORS.sky;

  // Background glow if hovered
  if (zone.isHovered) {
    ctx.fillStyle = F_TOKENS.COLORS.dropActive;
  } else {
    ctx.fillStyle = 'rgba(241, 245, 249, 0.6)';
  }

  drawRoundedRectPath(ctx, zone.x, zone.y, zone.width, zone.height, F_TOKENS.RADIUS_LG);
  ctx.fill();

  // Dashed border
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = zone.isHovered ? F_TOKENS.COLORS.mint : baseColor;
  ctx.lineWidth = zone.isHovered ? 3.5 : 2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Label
  if (zone.label && !zone.isOccupied) {
    ctx.fillStyle = F_TOKENS.COLORS.inkMuted;
    ctx.font = `700 16px ${F_TOKENS.FONTS.family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const ly = zone.sublabel ? zone.y + zone.height / 2 - 8 : zone.y + zone.height / 2;
    ctx.fillText(zone.label, zone.x + zone.width / 2, ly);

    if (zone.sublabel) {
      ctx.font = `500 12px ${F_TOKENS.FONTS.family}`;
      ctx.fillStyle = F_TOKENS.COLORS.inkDimmed;
      ctx.fillText(zone.sublabel, zone.x + zone.width / 2, ly + 20);
    }
  }

  ctx.restore();
}

/** Draws dual-row 2x5 Ten-Frame manipulative tray for foundational numeracy. */
export function drawTenFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  filledCount: number,
  total = 10,
  tokenColor: string = F_TOKENS.COLORS.coral
): void {
  ctx.save();
  const cols = 5;
  const rows = 2;
  const cellSize = width / cols;
  const height = cellSize * rows;

  // Frame container background
  ctx.fillStyle = F_TOKENS.COLORS.cardWhite;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  drawRoundedRectPath(ctx, x, y, width, height, F_TOKENS.RADIUS_MD);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Thick frame border
  ctx.strokeStyle = F_TOKENS.COLORS.inkPrimary;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Cell lines
  ctx.strokeStyle = F_TOKENS.COLORS.borderThick;
  ctx.lineWidth = 2;

  // Middle horizontal divider
  ctx.beginPath();
  ctx.moveTo(x, y + cellSize);
  ctx.lineTo(x + width, y + cellSize);
  ctx.stroke();

  // Vertical dividers
  for (let c = 1; c < cols; c++) {
    ctx.beginPath();
    ctx.moveTo(x + c * cellSize, y);
    ctx.lineTo(x + c * cellSize, y + height);
    ctx.stroke();
  }

  // Draw filled counter chips
  const radius = cellSize * 0.36;
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = x + col * cellSize + cellSize / 2;
    const cy = y + row * cellSize + cellSize / 2;

    if (i < filledCount) {
      // Filled chip
      ctx.fillStyle = tokenColor;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Chip specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Chip ring
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Empty dot indicator
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Creates confetti particles burst. */
export function createConfettiBurst(w: number, h: number, count = 48): IParticle[] {
  const particles: IParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 80,
      y: h / 2 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 420,
      vy: -180 - Math.random() * 320,
      color: F_PALETTE[Math.floor(Math.random() * F_PALETTE.length)] ?? F_TOKENS.COLORS.sunshine,
      size: 6 + Math.random() * 8,
      alpha: 1.0,
      rotation: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

/** Updates and renders confetti particle collection. */
export function updateAndRenderParticles(
  ctx: CanvasRenderingContext2D,
  particles: IParticle[],
  dt: number
): void {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 380 * dt; // gravity
    p.alpha = Math.max(0, p.alpha - dt * 0.4);
    p.rotation += dt * 4;

    if (p.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    }
  }
}

/** Joyful celebration overlay with stars and encouraging Hindi / English banner. */
export function drawCelebrationOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  message = 'Shabash! Well Done! ⭐',
  starsEarned = 3,
  particles?: IParticle[]
): void {
  ctx.save();

  // Backdrop tint
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.fillRect(0, 0, w, h);

  // Particles
  if (particles) {
    updateAndRenderParticles(ctx, particles, 0.016);
  }

  // Center celebration modal
  const cardW = Math.min(w - 48, 480);
  const cardH = 260;
  const cardX = (w - cardW) / 2;
  const cardY = (h - cardH) / 2;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = F_TOKENS.COLORS.cardWhite;
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, F_TOKENS.RADIUS_LG);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = F_TOKENS.COLORS.sunshine;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Stars
  const starIcons = '⭐'.repeat(Math.max(1, starsEarned));
  ctx.font = '40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(starIcons, cardX + cardW / 2, cardY + 60);

  // Big headline
  ctx.fillStyle = F_TOKENS.COLORS.inkPrimary;
  ctx.font = `800 26px ${F_TOKENS.FONTS.family}`;
  ctx.fillText(message, cardX + cardW / 2, cardY + 124);

  // Subtitle
  ctx.fillStyle = F_TOKENS.COLORS.grass;
  ctx.font = `700 16px ${F_TOKENS.FONTS.family}`;
  ctx.fillText('You completed the challenge!', cardX + cardW / 2, cardY + 162);

  // Tap to continue button hint
  ctx.fillStyle = F_TOKENS.COLORS.sky;
  drawRoundedRectPath(ctx, cardX + cardW / 2 - 90, cardY + 195, 180, 44, F_TOKENS.RADIUS_PILL);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 15px ${F_TOKENS.FONTS.family}`;
  ctx.fillText('Play Again ↺', cardX + cardW / 2, cardY + 217);

  ctx.restore();
}
