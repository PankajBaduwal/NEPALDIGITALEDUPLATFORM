/**
 * NumberTracingSimulation.tsx
 * Simulation 04: Number Tracing and Writing Studio (सङ्ख्या लेख्न सिकौँ)
 * Class 1 Mathematics - Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Play,
  Eraser,
  PenTool,
  HelpCircle,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface NumeralData {
  value: number;
  nepaliChar: string;
  englishChar: string;
  nepaliName: string;
  englishName: string;
  icon: string;
  // SVG Guide Path in 300x300 viewBox
  enPath: string;
  npPath: string;
  // Key checkpoint coordinates for tracing verification [[x, y], ...]
  enCheckpoints: [number, number][];
  npCheckpoints: [number, number][];
}

const NUMERALS: NumeralData[] = [
  {
    value: 1,
    nepaliChar: '१',
    englishChar: '1',
    nepaliName: 'एक',
    englishName: 'One',
    icon: '🍄',
    // English '1': slanted serif, down vertical, baseline
    enPath: 'M 115 80 L 150 50 L 150 250 M 110 250 L 190 250',
    // Nepali '१': circular loop down with curve
    npPath: 'M 130 90 C 130 65, 175 65, 175 95 C 175 125, 130 155, 130 200 C 130 230, 160 250, 185 240',
    enCheckpoints: [[115, 80], [150, 50], [150, 120], [150, 190], [150, 250]],
    npCheckpoints: [[130, 90], [155, 65], [175, 95], [145, 155], [130, 200], [160, 245]],
  },
  {
    value: 2,
    nepaliChar: '२',
    englishChar: '2',
    nepaliName: 'दुई',
    englishName: 'Two',
    icon: '🦋',
    // English '2': top arch, diagonal down-left, horizontal base
    enPath: 'M 100 95 C 100 50, 200 50, 200 100 C 200 145, 100 205, 95 245 L 205 245',
    // Nepali '२': top curl, body, lower curve with hook tail
    npPath: 'M 115 100 C 115 65, 185 65, 185 110 C 185 155, 115 185, 115 220 C 115 255, 185 255, 195 220',
    enCheckpoints: [[100, 95], [150, 55], [195, 95], [155, 165], [105, 240], [195, 245]],
    npCheckpoints: [[115, 100], [150, 65], [180, 110], [140, 170], [120, 225], [175, 245]],
  },
  {
    value: 3,
    nepaliChar: '३',
    englishChar: '3',
    nepaliName: 'तीन',
    englishName: 'Three',
    icon: '🐇',
    // English '3': top loop, middle cusp, bottom loop
    enPath: 'M 105 85 C 115 50, 190 50, 190 95 C 190 135, 145 145, 140 145 C 150 145, 200 155, 200 200 C 200 250, 105 250, 95 215',
    // Nepali '३': looks like a 3 with an extended curved downward tail
    npPath: 'M 110 85 C 120 55, 185 55, 185 95 C 185 130, 140 140, 135 140 C 145 140, 190 150, 190 195 C 190 235, 130 250, 110 230 C 95 215, 85 240, 80 260',
    enCheckpoints: [[105, 85], [150, 55], [185, 95], [140, 145], [195, 195], [145, 245], [100, 220]],
    npCheckpoints: [[110, 85], [150, 58], [180, 95], [135, 140], [185, 195], [130, 240], [80, 260]],
  },
  {
    value: 4,
    nepaliChar: '४',
    englishChar: '4',
    nepaliName: 'चार',
    englishName: 'Four',
    icon: '🍎',
    // English '4': diagonal down-left, horizontal across, vertical stroke
    enPath: 'M 180 60 L 95 190 L 215 190 M 180 60 L 180 250',
    // Nepali '४': looping ribbon / pretzel shape
    npPath: 'M 150 65 C 105 65, 85 125, 120 180 C 155 230, 215 230, 215 180 C 215 125, 100 230, 85 245',
    enCheckpoints: [[180, 60], [135, 125], [95, 190], [160, 190], [210, 190], [180, 140], [180, 245]],
    npCheckpoints: [[150, 65], [95, 115], [120, 180], [175, 220], [210, 175], [150, 190], [85, 245]],
  },
  {
    value: 5,
    nepaliChar: '५',
    englishChar: '5',
    nepaliName: 'पाँच',
    englishName: 'Five',
    icon: '🎈',
    // English '5': top bar, down, round belly
    enPath: 'M 190 70 L 125 70 L 115 145 C 130 135, 195 135, 195 195 C 195 250, 115 255, 95 220',
    // Nepali '५': starts with loop/hook, rises then curves down like a sickle
    npPath: 'M 115 110 C 115 80, 155 70, 175 95 C 195 125, 185 180, 140 210 C 110 230, 140 255, 185 245',
    enCheckpoints: [[190, 70], [130, 70], [120, 140], [165, 140], [190, 190], [150, 245], [100, 225]],
    npCheckpoints: [[115, 110], [145, 75], [175, 95], [175, 160], [135, 215], [165, 245]],
  },
  {
    value: 6,
    nepaliChar: '६',
    englishChar: '6',
    nepaliName: 'छ',
    englishName: 'Six',
    icon: '🥭',
    // English '6': spiral curl inward into bottom circle
    enPath: 'M 180 75 C 145 60, 100 115, 100 175 C 100 225, 140 250, 180 230 C 205 210, 195 160, 150 160 C 110 160, 100 190, 100 205',
    // Nepali '६': curved like backward 3 or open double wave
    npPath: 'M 180 85 C 150 60, 120 90, 125 125 C 130 150, 175 160, 175 195 C 175 235, 115 250, 95 215',
    enCheckpoints: [[180, 75], [130, 90], [105, 160], [125, 240], [180, 230], [175, 170], [140, 165]],
    npCheckpoints: [[180, 85], [135, 75], [125, 125], [155, 155], [175, 195], [140, 245], [100, 220]],
  },
  {
    value: 7,
    nepaliChar: '७',
    englishChar: '7',
    nepaliName: 'सात',
    englishName: 'Seven',
    icon: '🐟',
    // English '7': horizontal top line, diagonal stroke down to base
    enPath: 'M 100 70 L 200 70 L 125 250',
    // Nepali '७': starts with upper rounded hook, slopes right down like a hook
    npPath: 'M 115 110 C 115 70, 165 70, 175 105 C 185 145, 145 195, 135 245',
    enCheckpoints: [[100, 70], [150, 70], [200, 70], [165, 150], [135, 215], [125, 250]],
    npCheckpoints: [[115, 110], [145, 75], [175, 105], [160, 165], [140, 220], [135, 245]],
  },
  {
    value: 8,
    nepaliChar: '८',
    englishChar: '8',
    nepaliName: 'आठ',
    englishName: 'Eight',
    icon: '🐦',
    // English '8': figure 8 curve
    enPath: 'M 150 145 C 110 120, 115 65, 150 65 C 185 65, 190 120, 150 145 C 110 170, 105 240, 150 240 C 195 240, 190 170, 150 145',
    // Nepali '८': single arc arching upwards or open loop
    npPath: 'M 105 230 C 105 150, 195 150, 195 230',
    enCheckpoints: [[150, 145], [120, 95], [150, 65], [180, 95], [150, 145], [120, 205], [150, 240], [180, 205]],
    npCheckpoints: [[105, 230], [125, 175], [150, 140], [175, 175], [195, 230]],
  },
  {
    value: 9,
    nepaliChar: '९',
    englishChar: '9',
    nepaliName: 'नौ',
    englishName: 'Nine',
    icon: '🌸',
    // English '9': upper loop, vertical/curved stem down
    enPath: 'M 190 140 C 190 80, 115 80, 115 140 C 115 195, 190 195, 190 140 L 190 220 C 190 250, 150 255, 125 240',
    // Nepali '९': inverted loop like upside-down 6 with tail
    npPath: 'M 175 145 C 175 85, 115 85, 115 135 C 115 180, 165 180, 175 145 L 175 245',
    enCheckpoints: [[190, 140], [150, 85], [115, 140], [150, 190], [190, 140], [190, 200], [150, 245]],
    npCheckpoints: [[175, 145], [145, 90], [115, 135], [145, 180], [175, 145], [175, 210], [175, 245]],
  },
];

export const NumberTracingSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Script Mode: Devanagari (नेपाली) vs International (English)
  const [scriptMode, setScriptMode] = useState<'np' | 'en'>('np');

  // Active numeral index: 0 to 8
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const activeNumeral = NUMERALS[currentIndex];

  // Completed numerals tracker
  const [completedList, setCompletedList] = useState<number[]>([]);
  const [stars, setStars] = useState<number>(0);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState<[number, number][]>([]);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [chalkColor, setChalkColor] = useState<string>('#38bdf8'); // Sky blue chalk
  const [isAnimatingDemo, setIsAnimatingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  // Audio speech synthesis
  const speakText = useCallback((npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [language, soundEnabled]);

  // Audio chime
  const playChime = useCallback((freq = 523.25, type: OscillatorType = 'sine', duration = 0.3) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Save progress API
  const saveProgress = async (finalStars: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH4-04/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, finalStars * 11),
          completionStatus: finalStars >= 9 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 150,
          attemptsCount: 1,
          metadata: {
            stars: finalStars,
            completedNumerals: completedList,
            lastScript: scriptMode,
          },
        }),
      });
    } catch {
      // Ignore background progress save errors
    }
  };

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setUserPoints([]);
    setAccuracyScore(null);
  };

  // Change Numeral
  const selectNumeral = (index: number) => {
    setCurrentIndex(index);
    clearCanvas();
    const item = NUMERALS[index];
    const displayNum = scriptMode === 'np' ? item.nepaliChar : item.value;
    const name = scriptMode === 'np' ? item.nepaliName : item.englishName;
    speakText(`सङ्ख्या ${displayNum}, ${name}`, `Number ${displayNum}, ${name}`);
  };

  // Pointer event helpers for Canvas Drawing
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return [x, y];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setUserPoints((prev) => [...prev, coords]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = chalkColor;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(coords[0], coords[1]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setUserPoints((prev) => [...prev, coords]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords[0], coords[1]);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture release
    }
    // Auto evaluate after finishing stroke
    evaluateTrace();
  };

  // Trace Evaluation Algorithm (Forgiving for Class 1)
  const evaluateTrace = () => {
    if (userPoints.length < 8) return;
    setIsEvaluating(true);

    const checkpoints = scriptMode === 'np' ? activeNumeral.npCheckpoints : activeNumeral.enCheckpoints;
    let hitCount = 0;
    const thresholdRadius = 45; // generous touch margin for young fingers

    checkpoints.forEach(([cx, cy]) => {
      const hit = userPoints.some(([ux, uy]) => {
        const dist = Math.hypot(ux - cx, uy - cy);
        return dist <= thresholdRadius;
      });
      if (hit) hitCount++;
    });

    const score = Math.round((hitCount / checkpoints.length) * 100);
    setAccuracyScore(score);
    setIsEvaluating(false);

    if (score >= 60) {
      // Success!
      playChime(587.33, 'triangle', 0.4);
      setTimeout(() => playChime(880, 'sine', 0.5), 150);

      speakText(
        `अति राम्रो! तपाईंले ${scriptMode === 'np' ? activeNumeral.nepaliChar : activeNumeral.value} सुन्दर लेख्नुभयो।`,
        `Splendid! You wrote number ${activeNumeral.value} beautifully.`
      );

      if (!completedList.includes(activeNumeral.value)) {
        const nextList = [...completedList, activeNumeral.value];
        setCompletedList(nextList);
        const newStars = stars + 1;
        setStars(newStars);
        saveProgress(newStars);
      }
    } else {
      // Encourage retry
      playChime(329.63, 'sawtooth', 0.3);
      speakText('फेरि प्रयास गर्नुहोस्, थोप्लाहरू पछ्याउनुहोस्।', 'Try again, follow the dots gently.');
    }
  };

  // Animated Demonstration playback
  const runAnimatedDemo = () => {
    setIsAnimatingDemo(true);
    setDemoProgress(0);
    clearCanvas();

    const startVal = scriptMode === 'np' ? activeNumeral.nepaliChar : activeNumeral.value;
    speakText(`हेर्नुहोस्, सङ्ख्या ${startVal} कसरी लेखिन्छ।`, `Watch how number ${startVal} is written.`);

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setDemoProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimatingDemo(false);
          setDemoProgress(0);
        }, 600);
      }
    }, 30);
  };

  // Initial greeting
  useEffect(() => {
    speakText(
      'सङ्ख्या लेख्न सिकौँ! कुनै सङ्ख्या छान्नुहोस् र औँलाले कोर्नुहोस्।',
      'Number Tracing Studio! Choose a number and trace with your finger.'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #042f2e 0%, #134e4a 50%, #115e59 100%)',
        color: '#f8fafc',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(2, 44, 34, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <ArrowLeft size={18} />
            <span>{language === 'np' ? 'फिर्ता (Library)' : 'Back to Library'}</span>
          </button>

          <div>
            <div style={{ fontSize: '11px', color: '#5eead4', textTransform: 'uppercase', fontWeight: 800 }}>
              कक्षा १ • गणित • अध्याय ४ : ९ सम्मका सङ्ख्याहरू
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०४: सङ्ख्या लेख्न सिकौँ (Number Tracing Studio)'
                : 'Simulation 04: Number Tracing & Writing Studio'}
            </h1>
          </div>
        </div>

        {/* CONTROLS: SCRIPT TOGGLE, LANGUAGE, SOUND, STARS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Script Mode Toggle (Devanagari vs English numerals) */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid rgba(45, 212, 191, 0.3)',
            }}
          >
            <button
              onClick={() => {
                setScriptMode('np');
                clearCanvas();
              }}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '8px',
                background: scriptMode === 'np' ? '#0d9488' : 'transparent',
                color: scriptMode === 'np' ? '#ffffff' : '#99f6e4',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              देवनागरी (१–९)
            </button>
            <button
              onClick={() => {
                setScriptMode('en');
                clearCanvas();
              }}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '8px',
                background: scriptMode === 'en' ? '#0d9488' : 'transparent',
                color: scriptMode === 'en' ? '#ffffff' : '#99f6e4',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              English (1–9)
            </button>
          </div>

          {/* Star Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: '#fef08a',
              fontWeight: 800,
            }}
          >
            <Trophy size={16} color="#fbbf24" />
            <span>{stars} / 9</span>
          </div>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage((l) => (l === 'np' ? 'en' : 'np'))}
            style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {language === 'np' ? 'नेपाली | EN' : 'EN | नेपाली'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: soundEnabled ? '#5eead4' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* NUMERAL SELECTOR STRIP (1 to 9) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
          overflowX: 'auto',
        }}
      >
        {NUMERALS.map((num, idx) => {
          const isSelected = idx === currentIndex;
          const isDone = completedList.includes(num.value);
          const displayChar = scriptMode === 'np' ? num.nepaliChar : num.value;

          return (
            <button
              key={num.value}
              onClick={() => selectNumeral(idx)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                border: isSelected ? '3px solid #facc15' : '2px solid rgba(255, 255, 255, 0.15)',
                background: isSelected
                  ? 'linear-gradient(135deg, #0d9488, #0f766e)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(30, 41, 59, 0.5)',
                color: isSelected ? '#ffffff' : '#e2e8f0',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{displayChar}</span>
              <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 700 }}>
                {scriptMode === 'np' ? num.nepaliName : num.englishName}
              </span>

              {isDone && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#10b981',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={12} color="#ffffff" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN WORKSPACE: WRITING SLATE & TOOLBAR */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          gap: '18px',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* SLATE CONTAINER (Wooden Slate Style) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            background: '#1e293b',
            borderRadius: '28px',
            border: '14px solid #78350f', // Wooden chalkboard border
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(0,0,0,0.6)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Top Banner inside Slate */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>{activeNumeral.icon}</span>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
                  {scriptMode === 'np'
                    ? `सङ्ख्या ${activeNumeral.nepaliChar} (${activeNumeral.nepaliName})`
                    : `Number ${activeNumeral.value} (${activeNumeral.englishName})`}
                </span>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {language === 'np'
                    ? 'थोप्लाहरू जोडेर सङ्ख्या कोर्नुहोस्'
                    : 'Trace along the guide path smoothly'}
                </div>
              </div>
            </div>

            {/* Quick Hear Button */}
            <button
              onClick={() => {
                const char = scriptMode === 'np' ? activeNumeral.nepaliChar : activeNumeral.value;
                const name = scriptMode === 'np' ? activeNumeral.nepaliName : activeNumeral.englishName;
                speakText(`सङ्ख्या ${char}, ${name}`, `Number ${char}, ${name}`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(13, 148, 136, 0.3)',
                border: '1px solid rgba(45, 212, 191, 0.4)',
                borderRadius: '8px',
                color: '#5eead4',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Volume2 size={14} />
              {language === 'np' ? 'सुन्नुहोस्' : 'Hear'}
            </button>
          </div>

          {/* CANVAS + SVG TRACING GUIDE OVERLAY */}
          <div
            style={{
              position: 'relative',
              width: '320px',
              height: '320px',
              background: '#0f172a',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          >
            {/* SVG Background Guide Path */}
            <svg
              viewBox="0 0 300 300"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {/* Dashed faint template */}
              <path
                d={scriptMode === 'np' ? activeNumeral.npPath : activeNumeral.enPath}
                fill="none"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={scriptMode === 'np' ? activeNumeral.npPath : activeNumeral.enPath}
                fill="none"
                stroke="#64748b"
                strokeWidth="4"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Animated Demo Stroke */}
              {isAnimatingDemo && (
                <path
                  d={scriptMode === 'np' ? activeNumeral.npPath : activeNumeral.enPath}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="600"
                  strokeDashoffset={600 - (demoProgress / 100) * 600}
                />
              )}

              {/* Guide Checkpoints (Green Dots with start indicator) */}
              {(scriptMode === 'np' ? activeNumeral.npCheckpoints : activeNumeral.enCheckpoints).map(
                ([cx, cy], i) => (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={i === 0 ? 10 : 6}
                      fill={i === 0 ? '#10b981' : '#38bdf8'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {i === 0 && (
                      <text
                        x={cx}
                        y={cy - 14}
                        fill="#34d399"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {language === 'np' ? 'सुरु' : 'Start'}
                      </text>
                    )}
                  </g>
                )
              )}
            </svg>

            {/* Interactive Drawing Canvas */}
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </div>

          {/* EVALUATION FEEDBACK PILL */}
          {accuracyScore !== null && (
            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: accuracyScore >= 60 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${accuracyScore >= 60 ? '#10b981' : '#ef4444'}`,
                padding: '8px 20px',
                borderRadius: '20px',
              }}
            >
              {accuracyScore >= 60 ? (
                <>
                  <Sparkles size={18} color="#34d399" />
                  <span style={{ fontWeight: 800, color: '#34d399', fontSize: '14px' }}>
                    {language === 'np'
                      ? `शानदार! शुद्धता: ${accuracyScore}% ⭐ (Star Earned!)`
                      : `Splendid! Accuracy: ${accuracyScore}% ⭐`}
                  </span>
                </>
              ) : (
                <>
                  <RotateCcw size={18} color="#f87171" />
                  <span style={{ fontWeight: 800, color: '#f87171', fontSize: '14px' }}>
                    {language === 'np'
                      ? 'फेरि प्रयास गर्नुहोस्, थोप्लाहरू पछ्याउनुहोस्!'
                      : 'Try again, follow the guide dots!'}
                  </span>
                </>
              )}
            </div>
          )}

          {/* CHALK COLOR PALETTE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '14px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>
              {language === 'np' ? 'चक रङ (Chalk):' : 'Chalk:'}
            </span>
            {['#38bdf8', '#facc15', '#4ade80', '#f472b6', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setChalkColor(c)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: c,
                  border: chalkColor === c ? '3px solid #ffffff' : '2px solid transparent',
                  cursor: 'pointer',
                  transform: chalkColor === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          {/* Previous Numeral */}
          <button
            disabled={currentIndex === 0}
            onClick={() => selectNumeral(currentIndex - 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#ffffff',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.4 : 1,
              fontWeight: 700,
            }}
          >
            <ChevronLeft size={18} />
            <span>{language === 'np' ? 'अघिल्लो' : 'Previous'}</span>
          </button>

          {/* Watch Animated Demo */}
          <button
            onClick={runAnimatedDemo}
            disabled={isAnimatingDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              cursor: isAnimatingDemo ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Play size={18} />
            <span>
              {language === 'np'
                ? isAnimatingDemo
                  ? 'देखाउँदै...'
                  : 'लेख्ने तरिका हेर्नुहोस् (Watch Demo)'
                : 'Watch How to Write'}
            </span>
          </button>

          {/* Clear Slate */}
          <button
            onClick={clearCanvas}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              color: '#fca5a5',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            <Eraser size={18} />
            <span>{language === 'np' ? 'मेटाउनुहोस् (Clear)' : 'Clear Slate'}</span>
          </button>

          {/* Next Numeral */}
          <button
            disabled={currentIndex === NUMERALS.length - 1}
            onClick={() => selectNumeral(currentIndex + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#ffffff',
              cursor: currentIndex === NUMERALS.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === NUMERALS.length - 1 ? 0.4 : 1,
              fontWeight: 700,
            }}
          >
            <span>{language === 'np' ? 'पछिल्लो' : 'Next'}</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* COMPLETION CELEBRATION MODAL */}
        {completedList.length >= 9 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #065f46, #047857)',
              borderRadius: '20px',
              padding: '20px 30px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              border: '2px solid #34d399',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              maxWidth: '680px',
              marginTop: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Trophy size={44} color="#fde047" />
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#f0fdf4' }}>
                  {language === 'np'
                    ? 'बधाई छ! तपाईंले १ देखि ९ सम्म सबै सङ्ख्याहरू लेख्न सिक्नुभयो!'
                    : 'Congratulations! You mastered writing all numbers 1 through 9!'}
                </h3>
                <span style={{ fontSize: '13px', color: '#a7f3d0' }}>
                  {language === 'np'
                    ? 'तपाईंले ९ वटै ताराहरू प्राप्त गर्नुभयो।'
                    : 'You earned all 9 stars in the Tracing Studio.'}
                </span>
              </div>
            </div>

            <button
              onClick={onBackToLibrary}
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <Award size={18} />
              {language === 'np' ? 'लाइब्रेरी जानुहोस्' : 'To Library'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NumberTracingSimulation;

