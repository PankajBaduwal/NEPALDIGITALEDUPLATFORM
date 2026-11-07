// Reader preferences (sound, reading mode) and "continue where you left off",
// stored in localStorage with procedural Web Audio API page turn sound.

const SOUND_KEY = 'nepal_edu_reader_sound';
const MODE_KEY = 'nepal_edu_reader_mode';
const POS_KEY = 'nepal_edu_reader_positions';
const MAX_POSITIONS = 60;

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked */
  }
};

export const getSoundOn = (): boolean => read(SOUND_KEY) !== 'off';
export const setSoundOn = (on: boolean): void => write(SOUND_KEY, on ? 'on' : 'off');

export const getModePref = (): 'book' | 'simple' | null => {
  const v = read(MODE_KEY);
  return v === 'book' || v === 'simple' ? v : null;
};
export const setModePref = (mode: 'book' | 'simple'): void => write(MODE_KEY, mode);

const whoAmI = (): string => {
  try {
    const u = JSON.parse(read('nepal_edu_user') || read('user') || 'null');
    return (u && (u.id || u._id || u.email || u.userId)) || 'guest';
  } catch {
    return 'guest';
  }
};

const docKey = (docId: string): string => `${whoAmI()}:${docId}`;

const positions = (): Record<string, { page: number; at: number }> => {
  try {
    return JSON.parse(read(POS_KEY) || '{}') || {};
  } catch {
    return {};
  }
};

export const getLastPage = (docId: string): number | null => {
  if (!docId) return null;
  const hit = positions()[docKey(docId)];
  return hit && Number.isInteger(hit.page) ? hit.page : null;
};

export const saveLastPage = (docId: string, page: number): void => {
  if (!docId || !page) return;
  const all = positions();
  all[docKey(docId)] = { page, at: Date.now() };
  const keys = Object.keys(all);
  if (keys.length > MAX_POSITIONS) {
    keys
      .sort((a, b) => all[a].at - all[b].at)
      .slice(0, keys.length - MAX_POSITIONS)
      .forEach((k) => delete all[k]);
  }
  write(POS_KEY, JSON.stringify(all));
};

// ── Web Audio API Realistic Page-Turn Sound Synthesis ─────────────────
let audioCtx: AudioContext | null = null;
const MIN_GAP_MS = 120;
let lastPlayed = 0;

export const primePageSound = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass && !audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch {
    audioCtx = null;
  }
};

export const playPageSound = (): void => {
  const now = performance.now();
  if (now - lastPlayed < MIN_GAP_MS) return;
  lastPlayed = now;

  primePageSound();
  if (!audioCtx) return;

  try {
    const ctx = audioCtx;
    // Synthesize a realistic paper rustle using filtered pink/white noise with an envelope
    const bufferSize = Math.floor(ctx.sampleRate * 0.16); // 160ms sound
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      const pink = (lastOut * 0.9 + white * 0.1);
      lastOut = pink;
      // Soft envelope (fast attack, natural decay)
      const t = i / bufferSize;
      const env = t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 2.2);
      data[i] = pink * env * 0.22;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to give realistic paper texture frequencies (800Hz - 3500Hz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch {
    // If audio is blocked or unsupported, page still turns smoothly
  }
};

export const stopPageSound = (): void => {
  // Synthesis stops automatically after 160ms
};

