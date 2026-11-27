/**
 * CoinAndFeatherSim.tsx
 * Simulation: Robert Boyle's Coin and Feather Experiment in a Vacuum (1660)
 * (रोबर्ट बोयलको गिनी र प्वाँखको प्रयोग - शुन्यमा स्वतन्त्र खसाइ र गुरुत्व प्रवेग)
 * Grade 10 Science • Chapter 1: Force & Gravitation (बल र गुरुत्वाकर्षण)
 *
 * Upgraded Features:
 * - Dynamic Object Pairs:
 *     1. Coin & Feather (Robert Boyle 1660)
 *     2. Hammer & Feather (Apollo 15 Lunar Vacuum Experiment 1971)
 *     3. Apple & Leaf (Isaac Newton Gravitation & Foliage Drag)
 * - Three Dedicated View Modes:
 *     1. [ 👥 Both Tubes (Compare) ] - Side-by-side comparison
 *     2. [ 🌬️ Tube 1 (With Air) ]     - Zoomed high-detail view of air drag and flutter
 *     3. [ 🌌 Tube 2 (Vacuum Tube) ]   - Interactive vacuum lab with Boyle's pump & valve
 * - Tactile Vacuum Control:
 *     - Interactive Stopcock Valve (Open/Close to release air or seal)
 *     - Interactive Boyle Air Pump (Manual pump strokes or auto-evacuation)
 *     - Analog Brass Pressure Gauge (kPa and mmHg dial)
 * - Rock-Solid High-Contrast Button Styling:
 *     - Guaranteed high-contrast inline styles that NEVER blend into white
 * - Web Audio physical feedback: pump strokes, air hiss, metallic clink, and celebration
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Scale,
  Zap,
  Timer,
  Wind,
  Gauge,
  Columns,
  Eye,
  Sliders,
  CheckCircle2,
  Check,
  Volume2,
} from 'lucide-react';

type GravityPreset = 'earth' | 'moon' | 'jupiter';
type ViewMode = 'compare' | 'tube1' | 'tube2';
type ObjectPair = 'coin-feather' | 'hammer-feather' | 'apple-leaf';

interface Preset {
  id: string;
  nameEn: string;
  nameNe: string;
  viewMode: ViewMode;
  vacuumPercent: number;
  gravity: GravityPreset;
  objectPair: ObjectPair;
  icon: string;
  descEn: string;
  descNe: string;
}

// Synthesized Web Audio Sound Engine for Tactile Immersion
class VacuumAudio {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Mechanical pump stroke with pneumatic wheeze
  static playPumpStroke() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);

      const bufferSize = ctx.sampleRate * 0.22;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.22);
      filter.Q.value = 2.5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
    } catch {
      // Fallback
    }
  }

  // Atmospheric air release rushing into the vacuum tube (whoosh)
  static playAirInflow() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const duration = 0.8;

      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.linearRampToValueAtTime(2200, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(500, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(now);
    } catch {
      // Fallback
    }
  }

  // Metallic coin clink upon striking bottom
  static playCoinClink() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [1800, 2900, 4200].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.015);
        gain.gain.setValueAtTime(0.12 / (idx + 1), now + idx * 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.015);
        osc.stop(now + 0.36);
      });
    } catch {
      // Fallback
    }
  }
}

export const CoinAndFeatherSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // View modes: Compare (both), Tube 1 only, Tube 2 only
  const [viewMode, setViewMode] = useState<ViewMode>('compare');

  // Experiment parameters
  const [vacuumPercent, setVacuumPercent] = useState<number>(100);
  const [gravityPreset, setGravityPreset] = useState<GravityPreset>('earth');
  const [objectPair, setObjectPair] = useState<ObjectPair>('coin-feather');
  const objectPairRef = useRef<ObjectPair>(objectPair);
  useEffect(() => {
    objectPairRef.current = objectPair;
  }, [objectPair]);
  const [slowMo, setSlowMo] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('boyle-classic');

  // Mechanical Pump and Valve States
  const [isPumping, setIsPumping] = useState<boolean>(false);
  const [isReleasing, setIsReleasing] = useState<boolean>(false);
  const [valveOpen, setValveOpen] = useState<boolean>(false);

  // Simulation physics state
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [tube1TimeMs, setTube1TimeMs] = useState<number>(0);
  const [tube2TimeMs, setTube2TimeMs] = useState<number>(0);
  const [tube1Landed, setTube1Landed] = useState<{ heavy: boolean; light: boolean }>({
    heavy: false,
    light: false,
  });
  const [tube2Landed, setTube2Landed] = useState<{ heavy: boolean; light: boolean }>({
    heavy: false,
    light: false,
  });

  // Quiz state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const pumpAngleRef = useRef<number>(0);

  // Positional and aerodynamic trackers
  const posRef = useRef({
    // Tube 1
    t1HeavyY: 0,
    t1HeavyV: 0,
    t1LightY: 0,
    t1LightV: 0,
    t1LightFlutter: 0,
    t1LightTilt: 0,
    // Tube 2
    t2HeavyY: 0,
    t2HeavyV: 0,
    t2LightY: 0,
    t2LightV: 0,
    t2Timer: 0,
    t1HeavyTimer: 0,
    t1LightTimer: 0,
  });

  // Dynamic particle systems
  const airParticlesRef = useRef<{
    t1: Array<{ x: number; y: number; vx: number; vy: number; radius: number }>;
    t2: Array<{ x: number; y: number; vx: number; vy: number; radius: number }>;
    suction: Array<{ x: number; y: number; vx: number; vy: number; alpha: number }>;
    inrush: Array<{ x: number; y: number; vx: number; vy: number; alpha: number }>;
  }>({ t1: [], t2: [], suction: [], inrush: [] });

  const gVal = gravityPreset === 'earth' ? 9.8 : gravityPreset === 'moon' ? 1.62 : 24.8;
  const pressureKPa = (101.3 * (1 - vacuumPercent / 100)).toFixed(1);
  const pressureMmHg = Math.round(760 * (1 - vacuumPercent / 100));

  // Presets
  const presets: Preset[] = [
    {
      id: 'boyle-classic',
      nameEn: 'Boyle 1660 (Compare)',
      nameNe: 'बोयल तुलनात्मक (१६६०)',
      viewMode: 'compare',
      vacuumPercent: 100,
      gravity: 'earth',
      objectPair: 'coin-feather',
      icon: '🏛️',
      descEn: 'Side-by-side: Tube 1 has air (coin falls first), Tube 2 is in vacuum (both land together)!',
      descNe: 'दुवै नली सँगै: नली १ मा हावा छ (सिक्का छिटो खस्छ), नली २ मा शून्य छ (दुवै सँगै खस्छन्)!',
    },
    {
      id: 'tube1-study',
      nameEn: 'Tube 1: In Air',
      nameNe: 'नली १: हावामा',
      viewMode: 'tube1',
      vacuumPercent: 0,
      gravity: 'earth',
      objectPair: 'coin-feather',
      icon: '🌬️',
      descEn: 'Zoom into Tube 1 to inspect aerodynamic drag, turbulence, and the feather’s lateral flutter.',
      descNe: 'नली १ को ठूलो दृश्य: हावाको अवरोध र प्वाँखको हावामा हल्लिने प्रक्रिया नजिकबाट हेर्नुहोस्।',
    },
    {
      id: 'tube2-study',
      nameEn: 'Tube 2: Vacuum Lab',
      nameNe: 'नली २: शुन्य प्रयोगशाला',
      viewMode: 'tube2',
      vacuumPercent: 100,
      gravity: 'earth',
      objectPair: 'coin-feather',
      icon: '🌌',
      descEn: 'Interact directly with Boyle’s mechanical pump and stopcock valve to pump out or release air!',
      descNe: 'बोयलको पम्प चलाएर हावा तान्नुहोस् वा भल्भ खोलेर हावा भर्नुहोस् र स्वतन्त्र खसाइ हेर्नुहोस्!',
    },
    {
      id: 'apollo-moon',
      nameEn: 'Apollo 15 Moon',
      nameNe: 'अपोलो १५ चन्द्रमा',
      viewMode: 'compare',
      vacuumPercent: 100,
      gravity: 'moon',
      objectPair: 'hammer-feather',
      icon: '🌙',
      descEn: 'Hammer and feather drop in the Moon’s vacuum at 1.62 m/s² (Galileo verified in 1971).',
      descNe: 'चन्द्रमाको वायुमण्डलरहित शुन्यमा हथौडा र बाजको प्वाँख सँगै खसाल्दाको ऐतिहासिक परीक्षण।',
    },
    {
      id: 'newton-apple',
      nameEn: 'Newton: Apple & Leaf',
      nameNe: 'न्युटन: स्याउ र पात',
      viewMode: 'compare',
      vacuumPercent: 100,
      gravity: 'earth',
      objectPair: 'apple-leaf',
      icon: '🍎',
      descEn: 'Compare heavy spherical apple vs broad fluttering autumn leaf in air and vacuum.',
      descNe: 'भारी स्याउ र पातलो रुखको पात हावा र शुन्य नलीमा खस्दाको रोचक तुलना।',
    },
  ];

  // Initialize air particle systems
  useEffect(() => {
    const p1 = [];
    const p2 = [];
    for (let i = 0; i < 55; i++) {
      p1.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1.5 + Math.random() * 1.5,
      });
    }
    for (let i = 0; i < 55; i++) {
      p2.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1.5 + Math.random() * 1.5,
      });
    }
    airParticlesRef.current = { t1: p1, t2: p2, suction: [], inrush: [] };
  }, []);

  // Reset positions to the top
  const handleResetDrop = useCallback(() => {
    setIsDropping(false);
    setTube1TimeMs(0);
    setTube2TimeMs(0);
    setTube1Landed({ heavy: false, light: false });
    setTube2Landed({ heavy: false, light: false });

    posRef.current = {
      t1HeavyY: 0,
      t1HeavyV: 0,
      t1LightY: 0,
      t1LightV: 0,
      t1LightFlutter: 0,
      t1LightTilt: 0,
      t2HeavyY: 0,
      t2HeavyV: 0,
      t2LightY: 0,
      t2LightV: 0,
      t2Timer: 0,
      t1HeavyTimer: 0,
      t1LightTimer: 0,
    };
    ScienceAudio.playClick();
  }, []);

  // Trigger drop release
  const handleStartDrop = () => {
    handleResetDrop();
    setIsDropping(true);
    VacuumAudio.playCoinClink();
  };

  // Tactile Vacuum Control: Pump out air
  const handlePumpVacuum = () => {
    setIsPumping(true);
    setValveOpen(false);
    VacuumAudio.playPumpStroke();

    // Create suction particles streaming toward the bottom valve
    const newSuction = [];
    for (let i = 0; i < 15; i++) {
      newSuction.push({
        x: 0.2 + Math.random() * 0.6,
        y: Math.random() * 0.7,
        vx: (0.5 - Math.random()) * 0.05,
        vy: 0.08 + Math.random() * 0.08,
        alpha: 1.0,
      });
    }
    airParticlesRef.current.suction.push(...newSuction);

    setVacuumPercent((prev) => Math.min(100, prev + 25));

    setTimeout(() => {
      setIsPumping(false);
    }, 450);
  };

  // Tactile Vacuum Control: Continuous evacuation to 100%
  const handleEvacuateFull = () => {
    setIsPumping(true);
    setValveOpen(false);
    VacuumAudio.playPumpStroke();

    let current = vacuumPercent;
    const interval = setInterval(() => {
      current = Math.min(100, current + 15);
      setVacuumPercent(current);
      VacuumAudio.playPumpStroke();
      if (current >= 100) {
        clearInterval(interval);
        setIsPumping(false);
        ScienceAudio.playSuccess();
      }
    }, 180);
  };

  // Tactile Vacuum Control: Open valve / Release air back in
  const handleReleaseAir = () => {
    setIsReleasing(true);
    setValveOpen(true);
    VacuumAudio.playAirInflow();

    // Spawn burst of inrush particles from bottom
    const newInrush = [];
    for (let i = 0; i < 35; i++) {
      newInrush.push({
        x: 0.5 + (Math.random() - 0.5) * 0.2,
        y: 0.95,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.06 + Math.random() * 0.12),
        alpha: 1.0,
      });
    }
    airParticlesRef.current.inrush.push(...newInrush);

    let current = vacuumPercent;
    const interval = setInterval(() => {
      current = Math.max(0, current - 25);
      setVacuumPercent(current);
      if (current <= 0) {
        clearInterval(interval);
        setIsReleasing(false);
      }
    }, 120);
  };

  // Preset Applier
  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setViewMode(preset.viewMode);
    setVacuumPercent(preset.vacuumPercent);
    setGravityPreset(preset.gravity);
    objectPairRef.current = preset.objectPair;
    setObjectPair(preset.objectPair);
    handleResetDrop();
  };

  // Helper labels for dynamic pairs
  const getHeavyLabel = () => {
    const currentPair = objectPairRef.current || objectPair;
    if (currentPair === 'hammer-feather') {
      return lang === 'ne' ? 'हथौडा (१.३२ kg)' : 'Apollo Hammer (1.32 kg)';
    }
    if (currentPair === 'apple-leaf') {
      return lang === 'ne' ? 'स्याउ (१५० g)' : 'Red Apple (150g)';
    }
    return lang === 'ne' ? 'सिक्का (३० g)' : 'Gold Coin (30g)';
  };

  const getLightLabel = () => {
    const currentPair = objectPairRef.current || objectPair;
    if (currentPair === 'hammer-feather') {
      return lang === 'ne' ? 'बाजको प्वाँख (०.०३ kg)' : 'Falcon Feather (0.03 kg)';
    }
    if (currentPair === 'apple-leaf') {
      return lang === 'ne' ? 'पात (१ g)' : 'Leaf (1g)';
    }
    return lang === 'ne' ? 'प्वाँख (२ g)' : 'Feather (2g)';
  };

  // =========================================================================
  // CANVAS RENDERING ENGINE (High-DPI Ultra-Quality Graphics)
  // =========================================================================
  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const VIRTUAL_WIDTH = 780;
    const VIRTUAL_HEIGHT = 470;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(VIRTUAL_WIDTH * dpr) || canvas.height !== Math.round(VIRTUAL_HEIGHT * dpr)) {
      canvas.width = Math.round(VIRTUAL_WIDTH * dpr);
      canvas.height = Math.round(VIRTUAL_HEIGHT * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const width = VIRTUAL_WIDTH;
    const height = VIRTUAL_HEIGHT;
    const time = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Clean Scientific Laboratory Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.5, '#f8fafc');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle laboratory grid overlay
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 2. Solid Ground Baseline (Mahogany Lab Table & Grass Base)
    const groundY = height * 0.82;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    groundGrad.addColorStop(0, '#15803d');
    groundGrad.addColorStop(0.12, '#166534');
    groundGrad.addColorStop(0.3, '#78350f');
    groundGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Ground top highlight
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // 3. DRAWING HELPERS FOR THE DYNAMIC OBJECT PAIRS
    // ===================================================

    // A. Heavy Object 1: Golden Guinea Coin
    const drawRealisticCoin = (cx: number, cy: number, scale: number = 1.0, spin: number = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spin);

      const r = 20 * scale;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      const rimGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.35, r * 0.1, 0, 0, r);
      rimGrad.addColorStop(0, '#fef08a');
      rimGrad.addColorStop(0.4, '#f59e0b');
      rimGrad.addColorStop(0.85, '#b45309');
      rimGrad.addColorStop(1, '#78350f');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Outer sharp rim contour
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.8 * scale;
      ctx.stroke();

      ctx.shadowColor = 'transparent';

      // Coin serration / milled edge notches
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.4 * scale;
      const notches = 24;
      for (let i = 0; i < notches; i++) {
        const ang = (i * Math.PI * 2) / notches;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (r - 2.5 * scale), Math.sin(ang) * (r - 2.5 * scale));
        ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        ctx.stroke();
      }

      const innerR = r * 0.78;
      const faceGrad = ctx.createRadialGradient(-innerR * 0.2, -innerR * 0.3, 2, 0, 0, innerR);
      faceGrad.addColorStop(0, '#fef9c3');
      faceGrad.addColorStop(0.65, '#f59e0b');
      faceGrad.addColorStop(1, '#92400e');

      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2 * scale;
      ctx.stroke();

      ctx.fillStyle = '#451a03';
      ctx.font = `900 ${Math.round(12 * scale)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('£', 0, 0);

      // Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(-innerR * 0.4, -innerR * 0.4, 5 * scale, 2.8 * scale, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // A2. Heavy Object 2: Apollo 15 Geological Hammer
    const drawRealisticHammer = (cx: number, cy: number, scale: number = 1.0, spin: number = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spin);

      const hScale = scale * 1.15;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      // Handle shaft (Aluminium tube with grooved black rubber grip)
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2 * hScale;
      ctx.fillRect(-2.5 * hScale, -14 * hScale, 5 * hScale, 36 * hScale);
      ctx.strokeRect(-2.5 * hScale, -14 * hScale, 5 * hScale, 36 * hScale);

      // Black textured rubber grip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3.2 * hScale, 2 * hScale, 6.4 * hScale, 18 * hScale);
      for (let g = 3; g < 18; g += 3) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-3.2 * hScale, (2 + g) * hScale, 6.4 * hScale, 1.2 * hScale);
      }

      // Red NASA lanyard ring at bottom
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 22 * hScale, 3.5 * hScale, 0, Math.PI * 2);
      ctx.fill();

      // Steel Hammer Head (Flat Mallet on left, Beveled Pick on right)
      const headGrad = ctx.createLinearGradient(-18 * hScale, 0, 18 * hScale, 0);
      headGrad.addColorStop(0, '#64748b');
      headGrad.addColorStop(0.5, '#f8fafc');
      headGrad.addColorStop(1, '#475569');

      ctx.fillStyle = headGrad;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8 * hScale;

      // Mallet block left
      ctx.beginPath();
      ctx.rect(-17 * hScale, -21 * hScale, 15 * hScale, 10 * hScale);
      ctx.fill();
      ctx.stroke();

      // Pointed rock pick right
      ctx.beginPath();
      ctx.moveTo(-2 * hScale, -21 * hScale);
      ctx.lineTo(20 * hScale, -18 * hScale);
      ctx.lineTo(20 * hScale, -14 * hScale);
      ctx.lineTo(-2 * hScale, -11 * hScale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    // A3. Heavy Object 3: Isaac Newton's Red Apple
    const drawRealisticApple = (cx: number, cy: number, scale: number = 1.0, spin: number = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spin * 0.4);

      const aR = 19 * scale;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      // Apple Body (Juicy red radial gradient)
      const appleGrad = ctx.createRadialGradient(-aR * 0.3, -aR * 0.3, aR * 0.1, 0, 0, aR);
      appleGrad.addColorStop(0, '#fca5a5');
      appleGrad.addColorStop(0.3, '#ef4444');
      appleGrad.addColorStop(0.8, '#b91c1c');
      appleGrad.addColorStop(1, '#7f1d1d');

      ctx.fillStyle = appleGrad;
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(0, -aR * 0.7);
      ctx.bezierCurveTo(-aR * 0.6, -aR * 1.1, -aR * 1.15, -aR * 0.2, -aR * 0.95, aR * 0.5);
      ctx.bezierCurveTo(-aR * 0.8, aR * 1.05, -aR * 0.2, aR * 1.05, 0, aR * 0.8);
      ctx.bezierCurveTo(aR * 0.2, aR * 1.05, aR * 0.8, aR * 1.05, aR * 0.95, aR * 0.5);
      ctx.bezierCurveTo(aR * 1.15, -aR * 0.2, aR * 0.6, -aR * 1.1, 0, -aR * 0.7);
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';

      // Stem
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.8 * scale;
      ctx.beginPath();
      ctx.moveTo(0, -aR * 0.6);
      ctx.quadraticCurveTo(3 * scale, -aR * 1.1, 6 * scale, -aR * 1.35);
      ctx.stroke();

      // Small Green Leaf attached to stem
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(2 * scale, -aR * 0.9);
      ctx.quadraticCurveTo(10 * scale, -aR * 1.25, 12 * scale, -aR * 0.9);
      ctx.quadraticCurveTo(6 * scale, -aR * 0.75, 2 * scale, -aR * 0.9);
      ctx.fill();
      ctx.stroke();

      // Specular Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-aR * 0.35, -aR * 0.25, 4.5 * scale, 3 * scale, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Master Heavy Object Dispatcher
    const drawHeavyObject = (cx: number, cy: number, scale: number = 1.0, spin: number = 0) => {
      const currentPair = objectPairRef.current || objectPair;
      if (currentPair === 'hammer-feather') {
        drawRealisticHammer(cx, cy, scale, spin);
      } else if (currentPair === 'apple-leaf') {
        drawRealisticApple(cx, cy, scale, spin);
      } else {
        drawRealisticCoin(cx, cy, scale, spin);
      }
    };

    // B. Light Object 1: Classic Iridescent Feather
    const drawRealisticFeather = (cx: number, cy: number, scale: number = 1.0, tiltAngle: number = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltAngle);

      const fH = 50 * scale;
      const fW = 21 * scale;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      const vaneGrad = ctx.createLinearGradient(-fW, -fH * 0.5, fW, fH * 0.5);
      vaneGrad.addColorStop(0, '#ec4899');
      vaneGrad.addColorStop(0.35, '#a855f7');
      vaneGrad.addColorStop(0.7, '#0284c7');
      vaneGrad.addColorStop(1, '#06b6d4');

      ctx.fillStyle = vaneGrad;
      ctx.strokeStyle = '#831843';
      ctx.lineWidth = 1.6 * scale;

      // Left Vane
      ctx.beginPath();
      ctx.moveTo(0, fH * 0.45);
      ctx.quadraticCurveTo(-fW * 1.05, fH * 0.15, -fW * 0.9, -fH * 0.25);
      ctx.quadraticCurveTo(-fW * 0.4, -fH * 0.48, 0, -fH * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Vane
      ctx.beginPath();
      ctx.moveTo(0, fH * 0.45);
      ctx.quadraticCurveTo(fW * 1.05, fH * 0.15, fW * 0.9, -fH * 0.25);
      ctx.quadraticCurveTo(fW * 0.4, -fH * 0.48, 0, -fH * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // Barbs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.1 * scale;
      for (let y = -fH * 0.38; y <= fH * 0.35; y += 4.5 * scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(-fW * 0.85 * (1 - Math.abs(y) / (fH * 0.5)), y - 3 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(fW * 0.85 * (1 - Math.abs(y) / (fH * 0.5)), y - 3 * scale);
        ctx.stroke();
      }

      // Rachis
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.6 * scale;
      ctx.beginPath();
      ctx.moveTo(0, fH * 0.52);
      ctx.quadraticCurveTo(-1.5 * scale, 0, 0, -fH * 0.5);
      ctx.stroke();

      ctx.restore();
    };

    // B2. Light Object 2: Dave Scott's Falcon Feather (Apollo 15)
    const drawFalconFeather = (cx: number, cy: number, scale: number = 1.0, tiltAngle: number = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltAngle);

      const fH = 52 * scale;
      const fW = 20 * scale;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      // Falcon feather: Snowy white with slate grey/brown barred bands
      const falconGrad = ctx.createLinearGradient(0, -fH * 0.5, 0, fH * 0.5);
      falconGrad.addColorStop(0, '#ffffff');
      falconGrad.addColorStop(0.3, '#f1f5f9');
      falconGrad.addColorStop(0.7, '#cbd5e1');
      falconGrad.addColorStop(1, '#94a3b8');

      ctx.fillStyle = falconGrad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.6 * scale;

      ctx.beginPath();
      ctx.moveTo(0, fH * 0.45);
      ctx.quadraticCurveTo(-fW * 0.95, fH * 0.1, -fW * 0.8, -fH * 0.3);
      ctx.quadraticCurveTo(-fW * 0.35, -fH * 0.48, 0, -fH * 0.5);
      ctx.quadraticCurveTo(fW * 0.35, -fH * 0.48, fW * 0.8, -fH * 0.3);
      ctx.quadraticCurveTo(fW * 0.95, fH * 0.1, 0, fH * 0.45);
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';

      // Falcon dark grey barring stripes
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5 * scale;
      for (let s = -fH * 0.3; s <= fH * 0.3; s += 8 * scale) {
        ctx.beginPath();
        ctx.moveTo(-fW * 0.7 * (1 - Math.abs(s) / (fH * 0.5)), s);
        ctx.lineTo(fW * 0.7 * (1 - Math.abs(s) / (fH * 0.5)), s);
        ctx.stroke();
      }

      // Rachis
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(0, fH * 0.52);
      ctx.lineTo(0, -fH * 0.5);
      ctx.stroke();

      ctx.restore();
    };

    // B3. Light Object 3: Autumn Leaf (Maple / Oak)
    const drawAutumnLeaf = (cx: number, cy: number, scale: number = 1.0, tiltAngle: number = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltAngle);

      const lS = scale * 1.25;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      // Golden amber to forest olive autumn gradient
      const leafGrad = ctx.createLinearGradient(-15 * lS, -18 * lS, 15 * lS, 18 * lS);
      leafGrad.addColorStop(0, '#f59e0b');
      leafGrad.addColorStop(0.5, '#ea580c');
      leafGrad.addColorStop(1, '#84cc16');

      ctx.fillStyle = leafGrad;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.6 * lS;

      // Multi-lobed leaf shape
      ctx.beginPath();
      ctx.moveTo(0, 18 * lS);
      ctx.quadraticCurveTo(-14 * lS, 10 * lS, -12 * lS, -2 * lS);
      ctx.quadraticCurveTo(-18 * lS, -6 * lS, -14 * lS, -14 * lS);
      ctx.quadraticCurveTo(-6 * lS, -12 * lS, 0, -22 * lS);
      ctx.quadraticCurveTo(6 * lS, -12 * lS, 14 * lS, -14 * lS);
      ctx.quadraticCurveTo(18 * lS, -6 * lS, 12 * lS, -2 * lS);
      ctx.quadraticCurveTo(14 * lS, 10 * lS, 0, 18 * lS);
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';

      // Leaf veins
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8 * lS;
      ctx.beginPath();
      ctx.moveTo(0, 22 * lS);
      ctx.lineTo(0, -20 * lS);
      ctx.stroke();

      ctx.lineWidth = 1.1 * lS;
      for (let v = -12; v <= 10; v += 6) {
        ctx.beginPath();
        ctx.moveTo(0, v * lS);
        ctx.lineTo(-8 * lS, (v - 5) * lS);
        ctx.moveTo(0, v * lS);
        ctx.lineTo(8 * lS, (v - 5) * lS);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Master Light Object Dispatcher
    const drawLightObject = (cx: number, cy: number, scale: number = 1.0, tiltAngle: number = 0) => {
      const currentPair = objectPairRef.current || objectPair;
      if (currentPair === 'hammer-feather') {
        drawFalconFeather(cx, cy, scale, tiltAngle);
      } else if (currentPair === 'apple-leaf') {
        drawAutumnLeaf(cx, cy, scale, tiltAngle);
      } else {
        drawRealisticFeather(cx, cy, scale, tiltAngle);
      }
    };

    // Glass Vacuum Cylinder Helper
    const drawCylinder = (
      centerX: number,
      tWidth: number,
      tHeight: number,
      isVacuum: boolean,
      vacLevel: number,
      titleEn: string,
      titleNe: string
    ) => {
      const leftX = centerX - tWidth / 2;
      const rightX = centerX + tWidth / 2;
      const topY = groundY - tHeight;

      ctx.save();

      // Tube glass gradient - Pristine, ultra-clear borosilicate glass with realistic reflections
      const tubeGrad = ctx.createLinearGradient(leftX, 0, rightX, 0);
      if (isVacuum) {
        // Crystal-clear vacuum glass with subtle cyan-tinted refraction at edges
        tubeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        tubeGrad.addColorStop(0.08, 'rgba(224, 242, 254, 0.45)');
        tubeGrad.addColorStop(0.25, 'rgba(240, 249, 255, 0.12)');
        tubeGrad.addColorStop(0.75, 'rgba(240, 249, 255, 0.12)');
        tubeGrad.addColorStop(0.92, 'rgba(224, 242, 254, 0.45)');
        tubeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
      } else {
        // Air-filled tube: gentle pale azure atmosphere
        tubeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        tubeGrad.addColorStop(0.1, 'rgba(186, 230, 253, 0.45)');
        tubeGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.28)');
        tubeGrad.addColorStop(0.9, 'rgba(186, 230, 253, 0.45)');
        tubeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      }

      ctx.fillStyle = tubeGrad;
      ctx.beginPath();
      ctx.roundRect(leftX, topY, tWidth, tHeight, 16);
      ctx.fill();

      // Glass specular reflection glares (Left & Right cylindrical highlights)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(leftX + 12, topY + 16);
      ctx.lineTo(leftX + 12, topY + tHeight - 18);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftX + 22, topY + 28);
      ctx.lineTo(leftX + 22, topY + tHeight - 30);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rightX - 14, topY + 20);
      ctx.lineTo(rightX - 14, topY + tHeight - 22);
      ctx.stroke();

      // Tube outer glass border - Crisp high-contrast slate frame
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(leftX, topY, tWidth, tHeight, 16);
      ctx.stroke();

      // Top Heavy Brass Sealing Cap
      const capGrad = ctx.createLinearGradient(leftX, topY - 14, rightX, topY + 2);
      capGrad.addColorStop(0, '#334155');
      capGrad.addColorStop(0.5, '#475569');
      capGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = capGrad;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(leftX - 8, topY - 14, tWidth + 16, 16, 7);
      ctx.fill();
      ctx.stroke();

      // Top knurled brass knob
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, topY - 18, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(centerX - 2, topY - 20, 3, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Brass Stopcock Valve Mount
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(centerX - 16, groundY - 14, 32, 20);
      ctx.fill();
      ctx.stroke();

      // Rotating T-Handle / Stopcock Valve Key
      const valveAngle = valveOpen && isVacuum ? Math.PI / 2 : 0;
      ctx.save();
      ctx.translate(centerX, groundY - 4);
      ctx.rotate(valveAngle);
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-18, -4, 36, 8, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Valve state indicator tag
      if (isVacuum) {
        ctx.font = '800 10px system-ui, sans-serif';
        ctx.fillStyle = valveOpen ? '#dc2626' : '#15803d';
        ctx.textAlign = 'center';
        ctx.fillText(valveOpen ? 'VALVE OPEN (AIR IN)' : 'SEALED (VACUUM)', centerX, groundY + 20);
      }

      // Title & Condition Label - High Contrast Dark Shades
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillStyle = isVacuum ? '#0369a1' : '#b45309';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ne' ? titleNe : titleEn, centerX, topY - 32);

      const subEn = isVacuum
        ? `(Air Pumped Out: ${vacLevel}% Vacuum)`
        : '(Normal Atmospheric Air: 101.3 kPa)';
      const subNe = isVacuum
        ? `(हावा निकालिएको: ${vacLevel}% शून्य)`
        : '(सामान्य वायुमण्डलीय हावा: १०१.३ kPa)';
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(lang === 'ne' ? subNe : subEn, centerX, topY - 17);

      ctx.restore();
    };

    // Draw Analog Brass Vacuum Pressure Gauge
    const drawAnalogGauge = (gx: number, gy: number, radius: number = 38) => {
      ctx.save();
      ctx.translate(gx, gy);

      // Brass outer rim
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // Dial face (white porcelain)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gauge dial ticks (0 kPa to 100 kPa)
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 10; i++) {
        const ang = startAngle + (i / 10) * (endAngle - startAngle);
        const r1 = radius - 7;
        const r2 = radius - (i % 2 === 0 ? 14 : 10);
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
        ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
        ctx.stroke();
      }

      // Red Indicator Needle
      const fraction = 1 - vacuumPercent / 100;
      const needleAngle = startAngle + fraction * (endAngle - startAngle);

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(needleAngle) * (radius - 10), Math.sin(needleAngle) * (radius - 10));
      ctx.stroke();

      // Center brass pin
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Gauge Label - High Contrast Dark Text
      ctx.font = '800 8.5px system-ui, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('PRESSURE', 0, -radius * 0.35);

      ctx.font = '800 10px monospace';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(`${pressureKPa} kPa`, 0, radius * 0.45);

      ctx.restore();
    };

    // Draw Boyle's 1660 Vintage Air Pump Apparatus
    const drawBoylePump = (px: number, py: number, scale: number = 1.0) => {
      ctx.save();

      // Wood base
      const bW = 85 * scale;
      const bH = 14 * scale;
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.fillRect(px - bW / 2, py - bH, bW, bH);
      ctx.strokeRect(px - bW / 2, py - bH, bW, bH);

      // Brass compression cylinder
      const cW = 22 * scale;
      const cH = 46 * scale;
      const cylX = px - bW * 0.28;
      const cylY = py - bH - cH;
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.fillRect(cylX, cylY, cW, cH);
      ctx.strokeRect(cylX, cylY, cW, cH);

      // Piston Rod
      const pistonDisplacement = Math.sin(pumpAngleRef.current) * 8 * scale;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3.2 * scale;
      ctx.beginPath();
      ctx.moveTo(cylX + cW / 2, cylY + pistonDisplacement);
      ctx.lineTo(cylX + cW / 2, cylY - 14 * scale + pistonDisplacement);
      ctx.stroke();

      // Cast-Iron Flywheel & A-frame
      const wheelX = px + bW * 0.22;
      const wheelY = py - bH - 52 * scale;
      const wheelR = 30 * scale;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3.5 * scale;
      ctx.beginPath();
      ctx.moveTo(wheelX - 16 * scale, py - bH);
      ctx.lineTo(wheelX, wheelY);
      ctx.lineTo(wheelX + 16 * scale, py - bH);
      ctx.stroke();

      ctx.save();
      ctx.translate(wheelX, wheelY);
      ctx.rotate(pumpAngleRef.current);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      for (let s = 0; s < 4; s++) {
        const sAng = (s * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sAng) * wheelR, Math.sin(sAng) * wheelR);
        ctx.stroke();
      }

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Hand Crank Handle
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(0) * 16 * scale, Math.sin(0) * 16 * scale);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(Math.cos(0) * 16 * scale, Math.sin(0) * 16 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Air exhaust puffs from cylinder when pumping
      if (isPumping) {
        for (let p = 0; p < 4; p++) {
          const puffX = cylX - 10 * scale - p * 8 * scale;
          const puffY = cylY + 10 * scale - Math.sin(time * 8 + p) * 6;
          ctx.fillStyle = `rgba(100, 116, 139, ${0.7 - p * 0.15})`;
          ctx.beginPath();
          ctx.arc(puffX, puffY, (3.5 + p * 1.5) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // High-contrast label under pump
      ctx.font = `800 ${Math.round(11 * scale)}px system-ui, sans-serif`;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText("Boyle's Air Pump (1660)", px, py + 18 * scale);

      ctx.restore();
    };

    // =========================================================================
    // 4. VIEW MODE RENDERING: 'compare', 'tube1', 'tube2'
    // =========================================================================
    if (viewMode === 'compare') {
      const tubeW = 160;
      const tubeH = 300;
      const t1CenterX = width * 0.27;
      const t2CenterX = width * 0.66;
      const tubeTopY = groundY - tubeH;
      const fallRange = tubeH - 72;

      drawCylinder(t1CenterX, tubeW, tubeH, false, 0, '1. TUBE WITH AIR', '१. हावा भएको नली');
      drawCylinder(t2CenterX, tubeW, tubeH, true, vacuumPercent, '2. TUBE IN VACUUM', '२. शून्य नली (भ्याकुम)');

      // Tube 1 High-Visibility Air Particles (Molecules)
      const t1InnerL = t1CenterX - tubeW / 2 + 10;
      const t1InnerR = t1CenterX + tubeW / 2 - 10;
      const innerW = t1InnerR - t1InnerL;
      const innerH = tubeH - 30;

      airParticlesRef.current.t1.forEach((p) => {
        p.x = (p.x + p.vx * 0.04 + 1) % 1;
        p.y = (p.y + p.vy * 0.04 + 1) % 1;
        const px = t1InnerL + p.x * innerW;
        const py = tubeTopY + 15 + p.y * innerH;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(p.radius * 1.3, 3), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(2, 132, 199, 0.65)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(3, 105, 161, 0.85)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Tube 2 Remaining Air Particles (Evacuation visualization)
      const remainingCount = Math.round(55 * (1 - vacuumPercent / 100));
      const t2InnerL = t2CenterX - tubeW / 2 + 10;
      for (let i = 0; i < remainingCount; i++) {
        const p = airParticlesRef.current.t2[i];
        if (p) {
          p.x = (p.x + p.vx * 0.04 + 1) % 1;
          p.y = (p.y + p.vy * 0.04 + 1) % 1;
          const px = t2InnerL + p.x * innerW;
          const py = tubeTopY + 15 + p.y * innerH;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(p.radius * 1.3, 3), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(2, 132, 199, 0.55)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(3, 105, 161, 0.75)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Vacuum Hose connecting Tube 2 to Pump
      const pumpX = width * 0.88;
      const hoseStartX = t2CenterX + 16;
      const hoseStartY = groundY - 6;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(hoseStartX, hoseStartY);
      ctx.bezierCurveTo(hoseStartX + 20, hoseStartY + 25, pumpX - 45, groundY + 15, pumpX - 35, groundY - 14);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      drawBoylePump(pumpX, groundY, 0.85);
      drawAnalogGauge(t2CenterX + tubeW / 2 + 36, tubeTopY + 50, 27);

      // Distinct Object Labels at top of tube (No overlap with falling objects!)
      const drawColBadge = (title: string, x: number, y: number, color: string, bg: string, border: string) => {
        ctx.save();
        ctx.font = '800 11px system-ui, sans-serif';
        const txtW = ctx.measureText(title).width + 16;
        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(x - txtW / 2, y - 9, txtW, 18, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, x, y);
        ctx.restore();
      };

      const heavyShort = getHeavyLabel().split(' ')[0];
      const lightShort = getLightLabel().split(' ')[0];

      drawColBadge(heavyShort, t1CenterX - 36, tubeTopY + 18, '#92400e', '#fef3c7', '#f59e0b');
      drawColBadge(lightShort, t1CenterX + 36, tubeTopY + 18, '#831843', '#fce7f3', '#ec4899');

      drawColBadge(heavyShort, t2CenterX - 36, tubeTopY + 18, '#92400e', '#fef3c7', '#f59e0b');
      drawColBadge(lightShort, t2CenterX + 36, tubeTopY + 18, '#831843', '#fce7f3', '#ec4899');

      // Object Positions (Suspended neatly below the label badges)
      const initialObjY = tubeTopY + 54;
      const t1CoinX = t1CenterX - 36;
      const t1CoinY = initialObjY + posRef.current.t1HeavyY * fallRange;
      const t1FeatherX = t1CenterX + 36 + Math.sin(time * 3 + posRef.current.t1LightFlutter) * 12;
      const t1FeatherY = initialObjY + posRef.current.t1LightY * fallRange;

      const t2CoinX = t2CenterX - 36;
      const t2CoinY = initialObjY + posRef.current.t2HeavyY * fallRange;
      const t2FeatherX = t2CenterX + 36;
      const t2FeatherY = initialObjY + posRef.current.t2LightY * fallRange;

      // Render Dynamic Objects in Tube 1 (Scale 1.32 for ultra-clear visibility!)
      drawHeavyObject(t1CoinX, t1CoinY, 1.32, posRef.current.t1HeavyY * 2);
      drawLightObject(t1FeatherX, t1FeatherY, 1.32, Math.sin(time * 3.5) * 0.35);

      // Render Dynamic Objects in Tube 2 (Scale 1.32)
      drawHeavyObject(t2CoinX, t2CoinY, 1.32, posRef.current.t2HeavyY * 2);
      drawLightObject(t2FeatherX, t2FeatherY, 1.32, 0);

      // Professional Educational Comparison Card in Mid Gap
      const midGapX = (t1CenterX + t2CenterX) / 2;
      const cardW = 155;
      const cardH = 220;
      const cardTopY = tubeTopY + 28;

      ctx.save();
      // Card background & subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(midGapX - cardW / 2, cardTopY, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // Top Header: In Air
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.roundRect(midGapX - cardW / 2 + 1, cardTopY + 1, cardW - 2, 27, [11, 11, 0, 0]);
      ctx.fill();

      ctx.font = '800 11.5px system-ui, sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ne' ? '१. हावामा (In Air)' : '1. In Air (हावामा)', midGapX, cardTopY + 18);

      // In Air explanation
      ctx.font = '600 10.5px system-ui, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(lang === 'ne' ? 'हावाको अवरोधले' : 'Air resistance opposes', midGapX, cardTopY + 45);
      ctx.fillText(lang === 'ne' ? 'हल्का वस्तु ढिलो खस्छ' : 'lighter broad objects!', midGapX, cardTopY + 61);
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText(lang === 'ne' ? 'भारी वस्तु छिटो खस्छ!' : 'Heavy lands FASTER!', midGapX, cardTopY + 81);

      // Horizontal Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midGapX - cardW / 2 + 10, cardTopY + 97);
      ctx.lineTo(midGapX + cardW / 2 - 10, cardTopY + 97);
      ctx.stroke();

      // Bottom Header: In Vacuum
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(midGapX - cardW / 2 + 1, cardTopY + 107, cardW - 2, 26);

      ctx.font = '800 11.5px system-ui, sans-serif';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(lang === 'ne' ? '२. शुन्यमा (In Vacuum)' : '2. In Vacuum (शून्यमा)', midGapX, cardTopY + 124);

      // In Vacuum explanation
      ctx.font = '600 10.5px system-ui, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(lang === 'ne' ? 'हावाको अवरोध = ०' : 'Air resistance = 0', midGapX, cardTopY + 151);
      ctx.fillText(lang === 'ne' ? 'दुवै समान प्रवेगले' : 'Identical acceleration:', midGapX, cardTopY + 167);
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillStyle = '#15803d';
      ctx.fillText(lang === 'ne' ? 'सँगै खस्छन् (a = g)!' : 'Both fall at a = g!', midGapX, cardTopY + 187);

      ctx.font = '800 9.5px system-ui, sans-serif';
      ctx.fillStyle = '#166534';
      ctx.fillText(lang === 'ne' ? '✓ एकैसाथ जमिन छुन्छन्' : '✓ Land Simultaneously', midGapX, cardTopY + 205);
      ctx.restore();

      // Left Vertical Air Resistance Ruler
      const rulerX = t1CenterX - tubeW / 2 - 20;
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rulerX, groundY - 10);
      ctx.lineTo(rulerX, tubeTopY + 10);
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(rulerX, tubeTopY + 6);
      ctx.lineTo(rulerX - 5, tubeTopY + 16);
      ctx.lineTo(rulerX + 5, tubeTopY + 16);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(rulerX - 10, (groundY + tubeTopY) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ne' ? 'हावाको अवरोध' : 'Air Resistance (Drag)', 0, 0);
      ctx.restore();

      // High-Contrast Timers below tubes
      const drawTimerBadge = (x: number, timeMs: number) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x - 48, groundY + 10, 96, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = '800 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⏱ ${(timeMs / 1000).toFixed(2)} s`, x, groundY + 23);
        ctx.restore();
      };

      drawTimerBadge(t1CenterX, tube1TimeMs);
      drawTimerBadge(t2CenterX, tube2TimeMs);
    } else if (viewMode === 'tube1') {
      const tubeW = 230;
      const tubeH = 320;
      const centerX = width * 0.38;
      const tubeTopY = groundY - tubeH;
      const fallRange = tubeH - 75;

      drawCylinder(centerX, tubeW, tubeH, false, 0, 'TUBE 1: NORMAL CONDITIONS WITH AIR', 'नली १: हावा भएको सामान्य अवस्था');

      const innerL = centerX - tubeW / 2 + 12;
      const innerR = centerX + tubeW / 2 - 12;
      const innerW = innerR - innerL;
      const innerH = tubeH - 35;

      airParticlesRef.current.t1.forEach((p) => {
        p.x = (p.x + p.vx * 0.05 + 1) % 1;
        p.y = (p.y + p.vy * 0.05 + 1) % 1;
        const px = innerL + p.x * innerW;
        const py = tubeTopY + 18 + p.y * innerH;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(p.radius * 1.4, 3.5), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(2, 132, 199, 0.65)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(3, 105, 161, 0.85)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      const initialObjY = tubeTopY + 56;
      const coinX = centerX - 60;
      const featherX = centerX + 60 + Math.sin(time * 3 + posRef.current.t1LightFlutter) * 18;
      const coinY = initialObjY + posRef.current.t1HeavyY * fallRange;
      const featherY = initialObjY + posRef.current.t1LightY * fallRange;

      if (isDropping && !tube1Landed.light) {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        for (let i = -1; i <= 1; i++) {
          const streamX = featherX + i * 16;
          ctx.beginPath();
          ctx.moveTo(streamX, featherY + 30);
          ctx.quadraticCurveTo(streamX + Math.sin(time * 6 + i) * 6, featherY + 15, streamX, featherY - 10);
          ctx.stroke();
        }
      }

      // Render Dynamic Objects in Tube 1 (Scale 1.45)
      drawHeavyObject(coinX, coinY, 1.45, posRef.current.t1HeavyY * 2.5);
      drawLightObject(featherX, featherY, 1.45, Math.sin(time * 3.5) * 0.45);

      // Label Badges
      const drawSingleColBadge = (title: string, x: number, y: number, color: string, bg: string, border: string) => {
        ctx.save();
        ctx.font = '800 12px system-ui, sans-serif';
        const txtW = ctx.measureText(title).width + 20;
        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x - txtW / 2, y - 10, txtW, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, x, y);
        ctx.restore();
      };

      drawSingleColBadge(getHeavyLabel(), coinX, tubeTopY + 18, '#92400e', '#fef3c7', '#f59e0b');
      drawSingleColBadge(getLightLabel(), centerX + 60, tubeTopY + 18, '#831843', '#fce7f3', '#ec4899');

      // Right Inspection Panel inside canvas - High-Contrast White Card
      const panelX = width * 0.76;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(panelX - 110, tubeTopY + 15, 220, 290, 14);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ne' ? 'हावाको अवरोध विश्लेषण' : 'Aerodynamic Drag Analysis', panelX, tubeTopY + 45);

      ctx.font = '700 11.5px system-ui, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'left';
      ctx.fillText('• Air Resistance (F_drag):', panelX - 95, tubeTopY + 80);
      ctx.font = '700 11px monospace';
      ctx.fillStyle = '#b45309';
      ctx.fillText('  F_d = 0.5 · ρ · v² · C_d · A', panelX - 95, tubeTopY + 100);

      ctx.font = '700 11.5px system-ui, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('• Surface Area Ratio:', panelX - 95, tubeTopY + 135);
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillStyle = '#be185d';
      ctx.fillText('  Lighter body has LARGE Area/Mass', panelX - 95, tubeTopY + 155);

      ctx.font = '700 11.5px system-ui, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('• Net Acceleration:', panelX - 95, tubeTopY + 190);
      ctx.font = '700 11px monospace';
      ctx.fillStyle = '#0369a1';
      ctx.fillText('  a = g - (F_drag / m)', panelX - 95, tubeTopY + 210);

      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText('• Heavy body lands first in air!', panelX - 95, tubeTopY + 248);

      ctx.font = '800 13px monospace';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(`Timer: ${(tube1TimeMs / 1000).toFixed(2)} s`, panelX - 95, tubeTopY + 275);
      ctx.restore();
    } else if (viewMode === 'tube2') {
      const tubeW = 220;
      const tubeH = 320;
      const centerX = width * 0.32;
      const tubeTopY = groundY - tubeH;
      const fallRange = tubeH - 75;

      drawCylinder(centerX, tubeW, tubeH, true, vacuumPercent, 'TUBE 2: PURE VACUUM CHAMBER', 'नली २: पूर्ण शुन्य नली प्रयोगशाला');

      const innerL = centerX - tubeW / 2 + 12;
      const innerR = centerX + tubeW / 2 - 12;
      const innerW = innerR - innerL;
      const innerH = tubeH - 35;

      const remainingCount = Math.round(55 * (1 - vacuumPercent / 100));
      for (let i = 0; i < remainingCount; i++) {
        const p = airParticlesRef.current.t2[i];
        if (p) {
          p.x = (p.x + p.vx * 0.04 + 1) % 1;
          p.y = (p.y + p.vy * 0.04 + 1) % 1;
          const px = innerL + p.x * innerW;
          const py = tubeTopY + 18 + p.y * innerH;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(p.radius * 1.4, 3.5), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(2, 132, 199, 0.55)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(3, 105, 161, 0.75)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Suction particles animation when pumping
      ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
      airParticlesRef.current.suction.forEach((sp) => {
        sp.y += sp.vy;
        sp.x += (0.5 - sp.x) * 0.08;
        sp.alpha -= 0.03;
        if (sp.alpha > 0) {
          ctx.beginPath();
          ctx.arc(innerL + sp.x * innerW, tubeTopY + sp.y * innerH, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      airParticlesRef.current.suction = airParticlesRef.current.suction.filter((sp) => sp.alpha > 0);

      // Inrush particles animation when releasing valve
      ctx.fillStyle = 'rgba(217, 119, 6, 0.85)';
      airParticlesRef.current.inrush.forEach((ip) => {
        ip.y += ip.vy;
        ip.x += ip.vx;
        ip.alpha -= 0.025;
        if (ip.alpha > 0) {
          ctx.beginPath();
          ctx.arc(innerL + ip.x * innerW, tubeTopY + ip.y * innerH, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      airParticlesRef.current.inrush = airParticlesRef.current.inrush.filter((ip) => ip.alpha > 0);

      // Connected Vacuum Hose
      const pumpX = width * 0.75;
      const hoseStartX = centerX + 16;
      const hoseStartY = groundY - 6;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(hoseStartX, hoseStartY);
      ctx.bezierCurveTo(hoseStartX + 35, hoseStartY + 30, pumpX - 60, groundY + 20, pumpX - 40, groundY - 14);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.stroke();

      drawBoylePump(pumpX, groundY, 1.2);
      drawAnalogGauge(width * 0.54, tubeTopY + 55, 36);

      // Synchronized Falling Objects
      const initialObjY = tubeTopY + 56;
      const coinX = centerX - 55;
      const featherX = centerX + 55;
      const coinY = initialObjY + posRef.current.t2HeavyY * fallRange;
      const featherY = initialObjY + posRef.current.t2LightY * fallRange;

      // Render Dynamic Objects in Tube 2 (Scale 1.45)
      drawHeavyObject(coinX, coinY, 1.45, posRef.current.t2HeavyY * 2.5);
      drawLightObject(featherX, featherY, 1.45, 0);

      // Label Badges
      const drawSingleColBadge2 = (title: string, x: number, y: number, color: string, bg: string, border: string) => {
        ctx.save();
        ctx.font = '800 12px system-ui, sans-serif';
        const txtW = ctx.measureText(title).width + 20;
        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x - txtW / 2, y - 10, txtW, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, x, y);
        ctx.restore();
      };

      drawSingleColBadge2(getHeavyLabel(), coinX, tubeTopY + 18, '#92400e', '#fef3c7', '#f59e0b');
      drawSingleColBadge2(getLightLabel(), featherX, tubeTopY + 18, '#831843', '#fce7f3', '#ec4899');

      if (isDropping && !tube2Landed.heavy) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(coinX, coinY + 25);
        ctx.lineTo(coinX, coinY + 65);
        ctx.moveTo(featherX, featherY + 30);
        ctx.lineTo(featherX, featherY + 70);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.save();
      const bannerW = 420;
      ctx.fillStyle = vacuumPercent >= 95 ? '#dcfce7' : '#fef3c7';
      ctx.strokeStyle = vacuumPercent >= 95 ? '#16a34a' : '#d97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(centerX - bannerW / 2, groundY + 18, bannerW, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillStyle = vacuumPercent >= 95 ? '#15803d' : '#92400e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        vacuumPercent >= 95
          ? lang === 'ne'
            ? '✨ १००% पूर्ण शुन्य: हावाको अवरोध = ० | दुवै सँगै खस्छन्!'
            : '✨ 100% PURE VACUUM: Zero Drag | Identical Simultaneous Fall!'
          : lang === 'ne'
          ? `⚠️ आंशिक शुन्य (${vacuumPercent}%): पम्प चलाएर हावा तान्नुहोस्!`
          : `⚠️ Partial Vacuum (${vacuumPercent}%): Pump more air out!`,
        centerX,
        groundY + 32
      );
      ctx.restore();
    }

    ctx.restore();
  }, [
    lang,
    viewMode,
    vacuumPercent,
    pressureKPa,
    gravityPreset,
    objectPair,
    isDropping,
    isPumping,
    valveOpen,
    tube1TimeMs,
    tube2TimeMs,
    tube1Landed,
    tube2Landed,
  ]);

  // Main 60 FPS Physics & Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const realDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const dt = Math.min(0.04, realDt * (slowMo ? 0.35 : 1.0));
      timeRef.current += dt;

      if (isPumping) {
        pumpAngleRef.current += dt * 14;
      }

      if (isDropping) {
        const p = posRef.current;
        const fallDistance = 240;

        const currentPair = objectPairRef.current || objectPair;

        // 1. TUBE 1 HEAVY (Coin/Hammer/Apple in Air)
        if (!tube1Landed.heavy) {
          const dragCoeff = currentPair === 'hammer-feather' ? 0.02 : currentPair === 'apple-leaf' ? 0.06 : 0.08;
          const a = gVal * (1 - dragCoeff * (p.t1HeavyV / 10));
          p.t1HeavyV += a * dt;
          p.t1HeavyY += (p.t1HeavyV * dt) / (fallDistance / 35);
          p.t1HeavyTimer += dt * 1000;
          setTube1TimeMs(Math.round(p.t1HeavyTimer));

          if (p.t1HeavyY >= 1.0) {
            p.t1HeavyY = 1.0;
            p.t1HeavyV = 0;
            setTube1Landed((prev) => ({ ...prev, heavy: true }));
            VacuumAudio.playCoinClink();
          }
        }

        // 2. TUBE 1 LIGHT (Feather/Leaf in Air)
        if (!tube1Landed.light) {
          const terminalV = currentPair === 'apple-leaf' ? 0.85 : 1.15;
          if (p.t1LightV < terminalV) {
            p.t1LightV += gVal * 0.24 * dt;
          } else {
            p.t1LightV = terminalV;
          }
          p.t1LightY += (p.t1LightV * dt) / (fallDistance / 40);
          p.t1LightFlutter += dt * 5;

          if (p.t1LightY >= 1.0) {
            p.t1LightY = 1.0;
            p.t1LightV = 0;
            setTube1Landed((prev) => ({ ...prev, light: true }));
            ScienceAudio.playPop();
          }
        }

        // 3. TUBE 2 (Vacuum Tube)
        if (!tube2Landed.heavy || !tube2Landed.light) {
          p.t2Timer += dt * 1000;
          setTube2TimeMs(Math.round(p.t2Timer));

          if (!tube2Landed.heavy) {
            const dragCoeff = (1 - vacuumPercent / 100) * 0.08;
            p.t2HeavyV += gVal * (1 - dragCoeff) * dt;
            p.t2HeavyY += (p.t2HeavyV * dt) / (fallDistance / 35);
            if (p.t2HeavyY >= 1.0) {
              p.t2HeavyY = 1.0;
              p.t2HeavyV = 0;
              setTube2Landed((prev) => ({ ...prev, heavy: true }));
            }
          }

          if (!tube2Landed.light) {
            const dragCoeff = (1 - vacuumPercent / 100) * 0.75;
            p.t2LightV += gVal * (1 - dragCoeff) * dt;
            p.t2LightY += (p.t2LightV * dt) / (fallDistance / 35);
            if (p.t2LightY >= 1.0) {
              p.t2LightY = 1.0;
              p.t2LightV = 0;
              setTube2Landed((prev) => ({ ...prev, light: true }));
            }
          }

          if (vacuumPercent >= 95 && p.t2HeavyY >= 1.0 && p.t2LightY >= 1.0) {
            ScienceAudio.playCelebration();
          }
        }
      }

      drawSimulation();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDropping, isPumping, gVal, vacuumPercent, slowMo, tube1Landed, tube2Landed, objectPair, drawSimulation]);

  // SEE Board Exam Questions
  const quizQuestions = [
    {
      qEn: 'In Robert Boyle’s coin and feather experiment, why do both objects fall at the exact same rate in a vacuum?',
      qNe: 'रोबर्ट बोयलको गिनी र प्वाँखको प्रयोगमा शुन्य (भ्याकुम) नलीभित्र दुवै वस्तु किन एउटै दरमा सँगै खस्छन्?',
      optsEn: [
        'Because in a vacuum, air resistance is zero and acceleration due to gravity (g = GM/R²) is completely independent of the falling body’s mass',
        'Because the coin loses all its mass in a vacuum',
        'Because the feather becomes heavier than the coin',
        'Because gravity pushes the feather downward harder than the coin',
      ],
      optsNe: [
        'किनभने शुन्यमा हावाको अवरोध हुँदैन र गुरुत्व प्रवेग (g = GM/R²) खस्ने वस्तुको पिण्डमा निर्भर हुँदैन',
        'किनभने शुन्यमा सिक्काको सम्पूर्ण पिण्ड नष्ट हुन्छ',
        'किनभने शुन्यमा प्वाँख सिक्काभन्दा भारी बन्दछ',
        'किनभने गुरुत्वाकर्षणले प्वाँखलाई सिक्काभन्दा बढी बलले धकेल्छ',
      ],
      correct: 0,
      explEn:
        'In a vacuum, air resistance F_drag = 0. According to Newton’s second law, F = mg = ma, so acceleration a = g = GM/R². The mass of the falling object cancels out completely, so all bodies accelerate at 9.8 m/s² simultaneously.',
      explNe:
        'शुन्यमा हावाको अवरोध नहुँदा F = mg = ma हुन्छ, जसबाट a = g = GM/R² आउँछ। यस सूत्रमा खस्ने वस्तुको पिण्ड (m) नहुने भएकाले हलुका वा भारी जुनसुकै वस्तु पनि समान प्रवेगले सँगै खस्छन्।',
    },
    {
      qEn: 'What is the condition called when a body falls freely solely under the influence of gravity without any opposition?',
      qNe: 'कुनै पनि बाह्य अवरोध बिना केवल गुरुत्व बलको प्रभावमा मात्र कुनै वस्तु खस्ने अवस्थालाई के भनिन्छ?',
      optsEn: [
        'Free Fall (स्वतन्त्र खसाइ)',
        'Terminal Velocity (अन्तिम वेग)',
        'Centripetal Motion (अभिकेन्द्री गति)',
        'Frictional Drag (घर्षण गति)',
      ],
      optsNe: [
        'स्वतन्त्र खसाइ (Free Fall)',
        'अन्तिम वेग (Terminal Velocity)',
        'अभिकेन्द्री गति (Centripetal Motion)',
        'घर्षण गति (Frictional Drag)',
      ],
      correct: 0,
      explEn:
        'When an object falls under the sole influence of gravity with zero external resistance (such as in a vacuum), it is in true Free Fall with acceleration equal to g.',
      explNe:
        'कुनै पनि वस्तु हावा वा अन्य कुनै बाह्य अवरोध बिना केवल गुरुत्वाकर्षण बलको प्रभावले मात्र तल खस्छ भने त्यसलाई ‘स्वतन्त्र खसाइ’ (Free Fall) भनिन्छ।',
    },
    {
      qEn: 'During the Apollo 15 lunar mission in 1971, Astronaut David Scott dropped a 1.32 kg hammer and a 0.03 kg falcon feather on the Moon. What happened?',
      qNe: 'सन् १९७१ मा अपोलो १५ का अन्तरिक्ष यात्री डेभिड स्कटले चन्द्रमामा १.३२ केजीको हथौडा र ०.०३ केजीको प्वाँख सँगै खसाल्दा के भएको थियो?',
      optsEn: [
        'Both hit the lunar surface at the exact same instant because the Moon has no atmosphere',
        'The hammer landed first because it is 44 times heavier',
        'The feather floated away into deep space',
        'Neither of them fell because there is no gravity on the Moon',
      ],
      optsNe: [
        'चन्द्रमामा वायुमण्डल नभएकाले दुवै वस्तु ठीक एउटै समयमा सँगै चन्द्रमाको सतहमा पुगे',
        'हथौडा ४४ गुणा भारी भएकाले पहिले खस्यो',
        'प्वाँख अन्तरिक्षमा उडेर गयो',
        'चन्द्रमामा गुरुत्वाकर्षण नभएकाले दुवै खसेनन्',
      ],
      correct: 0,
      explEn:
        'Because the Moon has no atmosphere (natural vacuum), there was no air resistance to slow the feather down. Both objects hit the ground simultaneously, directly proving Galileo’s and Boyle’s theory on another celestial body!',
      explNe:
        'चन्द्रमामा वायुमण्डल नभएकाले (प्राकृतिक शुन्य अवस्था) हथौडा र प्वाँख दुवै ठ्याक्कै एउटै समयमा चन्द्रमाको सतहमा सँगै बजारिएका थिए। यसले ग्यालिलियो र बोयलको सिद्धान्तलाई प्रत्यक्ष प्रमाणित गर्‍यो।',
    },
  ];

  const handleQuizAnswer = (optIdx: number) => {
    setSelectedOption(optIdx);
    const currQ = quizQuestions[quizIdx];
    if (optIdx === currQ.correct) {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'ne' ? 'उत्कृष्ट! सही उत्तर।' : 'Excellent! Correct Answer.');
      setQuizScore((prev) => prev + 1);
    } else {
      ScienceAudio.playError();
      setQuizFeedback(
        lang === 'ne'
          ? 'पुनः प्रयास गर्नुहोस् वा व्याख्या पढ्नुहोस्।'
          : 'Incorrect. Check the explanation below.'
      );
    }
  };

  return (
    <SimulationLayout
      titleEn="Coin and Feather Experiment (Boyle's Vacuum Tube)"
      titleNe="गिनी र प्वाँखको प्रयोग (रोबर्ट बोयलको शुन्य नली प्रयोग)"
      chapterNumber={1}
      chapterTitle="Force and Gravitation"
      chapterTitleNepali="बल र गुरुत्वाकर्षण"
      subject="Science & Technology"
      grade={10}
      currentStage={stage}
      onStageChange={(s) => {
        setStage(s);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={(l) => setLang(l)}
      stars={stars}
      maxStars={3}
      isCompleted={isCompleted}
      onReset={handleResetDrop}
      onBackToLibrary={onBackToLibrary}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D BOYLE VACUUM TUBE VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={780}
            height={470}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Floating Physics Law & View Badges */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1.5px solid #cbd5e1',
                color: '#0369a1',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <span>a = g - (F_air / m)</span>
              <span style={{ color: '#94a3b8' }}>│</span>
              <span style={{ color: '#b45309' }}>In Vacuum:</span>
              <span style={{ color: '#15803d' }}>a = g ({gVal} m/s²)</span>
            </div>

            {/* View Mode Selector Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1.5px solid #cbd5e1',
                padding: '3px',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              {(
                [
                  { id: 'compare', labelEn: 'Both Tubes', labelNe: 'दुवै नली' },
                  { id: 'tube1', labelEn: 'Air Tube', labelNe: 'हावा नली' },
                  { id: 'tube2', labelEn: 'Vacuum Tube', labelNe: 'शुन्य नली' },
                ] as const
              ).map((vm) => (
                <button
                  key={vm.id}
                  onClick={() => {
                    setViewMode(vm.id);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: viewMode === vm.id ? '1.5px solid #0284c7' : '1px solid transparent',
                    background: viewMode === vm.id ? '#e0f2fe' : 'transparent',
                    color: viewMode === vm.id ? '#0369a1' : '#475569',
                  }}
                >
                  {lang === 'ne' ? vm.labelNe : vm.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Top-Right Quick Reset */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleResetDrop}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#1e293b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <RotateCcw size={14} color="#0369a1" />
              {lang === 'ne' ? 'रिसेट' : 'Reset'}
            </button>
          </div>

          {/* Bottom Floating Control & Telemetry Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1.5px solid #cbd5e1',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            {/* Left Controls: Drop, Invert, Slow-mo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleStartDrop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Play size={15} style={{ fill: 'currentColor' }} />
                <span>{lang === 'ne' ? 'खसाल्नुहोस् (Drop)' : 'Drop Objects'}</span>
              </button>

              <button
                onClick={handleResetDrop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#1e293b',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} color="#0369a1" />
                <span>{lang === 'ne' ? 'नली उल्टाउनुहोस्' : 'Invert / Reset'}</span>
              </button>

              <button
                onClick={() => setSlowMo(!slowMo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: slowMo ? '#fef3c7' : '#ffffff',
                  border: slowMo ? '1.5px solid #d97706' : '1.5px solid #cbd5e1',
                  color: slowMo ? '#92400e' : '#1e293b',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Timer size={14} color={slowMo ? '#b45309' : '#64748b'} />
                <span>{slowMo ? 'Slow-Mo (0.35×)' : 'Normal Speed'}</span>
              </button>
            </div>

            {/* Right Telemetry Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: '#fef3c7',
                  border: '1.5px solid #fde68a',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                <span style={{ color: '#475569', fontWeight: 600 }}>Tube 1 (Air): </span>
                <span style={{ color: '#b45309', fontWeight: 800 }}>{(tube1TimeMs / 1000).toFixed(2)}s</span>
              </div>

              <div
                style={{
                  background: '#dcfce7',
                  border: '1.5px solid #bbf7d0',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                <span style={{ color: '#475569', fontWeight: 600 }}>Tube 2 (Vacuum): </span>
                <span style={{ color: '#15803d', fontWeight: 800 }}>{(tube2TimeMs / 1000).toFixed(2)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: DISCOVERY STATION & FORCE PARAMETERS (380px)
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            color: '#0f172a',
          }}
        >
          {/* Station Header Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={18} color="#0284c7" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'रोबर्ट बोयल शुन्य नली केन्द्र' : "Boyle's Vacuum Station"}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'हावा भएको नली र शुन्य नलीमा विभिन्न वस्तुहरू खसालेर गुरुत्व प्रवेग पिण्डमा निर्भर नहुने तथ्य प्रमाणित गर्नुहोस्।'
                : "Compare falling bodies in air vs vacuum to prove Galileo and Newton's law: acceleration in vacuum is strictly independent of mass."}
            </div>
          </div>

          {/* Preset Scenarios Selector (2x2 Grid) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'पूर्वनिर्धारित परिस्थिति (Presets)' : 'Preset Scenarios'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {presets.map((p) => {
                const active = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: active ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                      background: active ? '#e0f2fe' : '#ffffff',
                      color: active ? '#0369a1' : '#1e293b',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'left',
                      boxShadow: active ? '0 1px 3px rgba(2, 132, 199, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <span>{p.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'ne' ? p.nameNe : p.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vacuum & Pressure Status Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                {lang === 'ne' ? 'नली २ शुन्यता र चाप:' : 'Tube 2 Pressure & Vacuum:'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', color: '#15803d' }}>
                {vacuumPercent}% {vacuumPercent === 100 ? '(Pure Vacuum)' : '(Partial)'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '10px', color: '#475569', display: 'block', fontWeight: 600 }}>Pressure (kPa):</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{pressureKPa} kPa</span>
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '10px', color: '#475569', display: 'block', fontWeight: 600 }}>Pressure (mmHg):</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{pressureMmHg} mmHg</span>
              </div>
            </div>

            {/* Tactile Pump & Release Valve Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              <button
                onClick={handlePumpVacuum}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isPumping ? '#0369a1' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Wind size={14} />
                <span>{lang === 'ne' ? 'हावा तान्नुहोस्' : 'Pump Out'}</span>
              </button>

              <button
                onClick={handleReleaseAir}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isReleasing ? '#6d28d9' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                }}
              >
                <Volume2 size={14} />
                <span>{lang === 'ne' ? 'हावा भर्नुहोस्' : 'Release Air'}</span>
              </button>
            </div>

            <button
              onClick={handleEvacuateFull}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1.5px solid #0284c7',
                background: '#f0f9ff',
                color: '#0369a1',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                marginBottom: '8px',
              }}
            >
              {lang === 'ne' ? 'पूर्ण शुन्य बनाउनुहोस् (१००%)' : 'Evacuate to 100% Vacuum'}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={vacuumPercent}
              onChange={(e) => {
                ScienceAudio.playPop();
                setVacuumPercent(Number(e.target.value));
              }}
              style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
            />
          </div>

          {/* Falling Object Pair Selector */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'खसालिने वस्तुहरूको जोडी:' : 'Falling Object Pair:'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'coin-feather', icon: '🪙', label: lang === 'ne' ? 'सिक्का र प्वाँख' : 'Coin & Feather' },
                { id: 'hammer-feather', icon: '🔨', label: lang === 'ne' ? 'हथौडा र प्वाँख' : 'Hammer & Feather' },
                { id: 'apple-leaf', icon: '🍎', label: lang === 'ne' ? 'स्याउ र पात' : 'Apple & Leaf' },
              ].map((item) => {
                const isActive = objectPair === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const newPair = item.id as ObjectPair;
                      objectPairRef.current = newPair;
                      setObjectPair(newPair);
                      handleResetDrop();
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #d97706' : '1.5px solid #cbd5e1',
                      background: isActive ? '#fef3c7' : '#ffffff',
                      color: isActive ? '#92400e' : '#1e293b',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: isActive ? '0 1px 3px rgba(217, 119, 6, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gravity Selector */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                {lang === 'ne' ? 'गुरुत्व प्रवेग (g):' : 'Celestial Gravity (g):'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', color: '#15803d' }}>
                {gVal} m/s²
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['earth', 'moon', 'jupiter'] as const).map((g) => {
                const isActive = gravityPreset === g;
                const label = g === 'earth' ? 'Earth (9.8)' : g === 'moon' ? 'Moon (1.62)' : 'Jupiter (24.8)';
                return (
                  <button
                    key={g}
                    onClick={() => setGravityPreset(g)}
                    style={{
                      padding: '7px 4px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isActive ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
                      background: isActive ? '#dcfce7' : '#ffffff',
                      color: isActive ? '#15803d' : '#1e293b',
                      boxShadow: isActive ? '0 1px 3px rgba(22, 163, 74, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curriculum Key Takeaway Card */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1.5px solid #bae6fd',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#1e293b',
              lineHeight: 1.5,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ fontWeight: 800, color: '#0369a1', marginBottom: '6px', fontSize: '12px' }}>
              💡 {lang === 'ne' ? 'SEE परीक्षा मुख्य निष्कर्ष:' : 'SEE Exam Key Takeaways:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>{lang === 'ne' ? '• हावामा ठूलो सतह भएको वस्तुमा हावाको अवरोध (F_air) बढी हुन्छ।' : '• In air, aerodynamic drag opposes broad light objects.'}</div>
              <div>{lang === 'ne' ? '• शुन्यमा अवरोध नहुँदा दुवै वस्तु समान प्रवेग (a = g) ले खस्छन्।' : '• In vacuum (F_air = 0), all objects fall with identical acceleration a = g.'}</div>
              <div>{lang === 'ne' ? '• गुरुत्व प्रवेग (g = GM/R²) खस्ने वस्तुको पिण्डमा भर पर्दैन।' : '• Acceleration due to gravity is independent of falling mass.'}</div>
            </div>
          </div>

          {/* Prominent Completion Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Boyle Lab & Quiz' : 'बोयल शुन्य नली प्रयोग पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default CoinAndFeatherSim;
