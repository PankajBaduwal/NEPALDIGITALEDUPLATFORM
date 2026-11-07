/**
 * NumberTenWritingStudio.tsx
 * Simulation 05: Number Ten Writing Studio (१० लेख्न सिकौँ)
 * Class 1 Mathematics - Chapter 6: Ten (दश)
 * Nepal Digital Education Platform
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
  Play,
  Eraser,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

export const NumberTenWritingStudio: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Script Mode: Devanagari (१०) vs International (10)
  const [scriptMode, setScriptMode] = useState<'np' | 'en'>('np');

  // Chalk Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState<[number, number][]>([]);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [chalkColor, setChalkColor] = useState<string>('#38bdf8');
  const [isAnimatingDemo, setIsAnimatingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  // Completed trackers
  const [nepaliCompleted, setNepaliCompleted] = useState(false);
  const [englishCompleted, setEnglishCompleted] = useState(false);
  const [stars, setStars] = useState<number>(0);

  // SVG Paths in 400x260 viewBox
  // English '10': Digit 1 on left, Digit 0 on right
  const enPath =
    'M 95 80 L 130 50 L 130 210 M 90 210 L 170 210 M 270 50 C 220 50, 220 210, 270 210 C 320 210, 320 50, 270 50';

  // Nepali '१०': Digit १ on left, Digit ० on right
  const npPath =
    'M 105 85 C 105 60, 150 60, 150 90 C 150 120, 105 145, 105 180 C 105 210, 140 220, 160 210 M 270 70 C 230 70, 230 190, 270 190 C 310 190, 310 70, 270 70';

  // Checkpoints for tolerance check
  const enCheckpoints: [number, number][] = [
    [95, 80],
    [130, 50],
    [130, 130],
    [130, 210],
    [270, 50],
    [225, 130],
    [270, 210],
    [315, 130],
  ];

  const npCheckpoints: [number, number][] = [
    [105, 85],
    [130, 60],
    [150, 90],
    [120, 150],
    [110, 185],
    [150, 215],
    [270, 70],
    [235, 130],
    [270, 190],
    [305, 130],
  ];

  // Audio Speech Synthesis
  const speakText = useCallback((npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }, [language, soundEnabled]);

  // Tone Synthesis
  const playTone = useCallback((freq = 523.25, type: OscillatorType = 'sine', duration = 0.25) => {
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

  // Save Progress API
  const saveProgress = async (finalStars: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH6-05/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, finalStars * 20),
          completionStatus: finalStars >= 5 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 150,
          attemptsCount: 1,
          metadata: {
            stars: finalStars,
            scriptMode,
          },
        }),
      });
    } catch {
      // Ignore background errors
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

  // Pointer event helpers
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
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
      // Pointer release
    }
    evaluateTrace();
  };

  // Forgiving Trace Evaluation
  const evaluateTrace = () => {
    if (userPoints.length < 10) return;

    const checkpoints = scriptMode === 'np' ? npCheckpoints : enCheckpoints;
    let hitCount = 0;
    const thresholdRadius = 50;

    checkpoints.forEach(([cx, cy]) => {
      const hit = userPoints.some(([ux, uy]) => Math.hypot(ux - cx, uy - cy) <= thresholdRadius);
      if (hit) hitCount++;
    });

    const score = Math.round((hitCount / checkpoints.length) * 100);
    setAccuracyScore(score);

    if (score >= 60) {
      playTone(659.25, 'triangle', 0.4);
      setTimeout(() => playTone(880, 'sine', 0.5), 180);

      if (scriptMode === 'np') setNepaliCompleted(true);
      else setEnglishCompleted(true);

      const ns = stars + 2;
      setStars(ns);
      saveProgress(ns);

      speakText(
        `शानदार! तपाईंले सङ्ख्या ${scriptMode === 'np' ? '१०' : '10'} सुन्दर लेख्नुभयो।`,
        `Splendid! You wrote number ${scriptMode === 'np' ? '१०' : '10'} beautifully.`
      );
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('फेरि प्रयास गर्नुहोस्, थोप्लाहरू पछ्याउनुहोस्।', 'Try again, follow the dotted path gently.');
    }
  };

  // Animated Demo
  const runAnimatedDemo = () => {
    setIsAnimatingDemo(true);
    setDemoProgress(0);
    clearCanvas();

    speakText(
      `हेर्नुहोस्, सङ्ख्या ${scriptMode === 'np' ? '१०' : '10'} कसरी लेखिन्छ।`,
      `Watch how number ${scriptMode === 'np' ? '१०' : '10'} is written.`
    );

    let curr = 0;
    const interval = setInterval(() => {
      curr += 2;
      setDemoProgress(curr);
      if (curr >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimatingDemo(false);
          setDemoProgress(0);
        }, 600);
      }
    }, 30);
  };

  useEffect(() => {
    speakText(
      '१० लेख्न सिकौँ सिमुलेसनमा स्वागत छ! देवनागरी वा अङ्ग्रेजी लिपि छानेर कोर्नुहोस्।',
      'Welcome to Number Ten Writing Studio! Choose Devanagari or English to trace 10.'
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
          background: 'rgba(2, 44, 34, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.25)',
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
              कक्षा १ • गणित • अध्याय ६ : दश (Ten)
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०५: १० लेख्न सिकौँ (Number Ten Writing Studio)'
                : 'Simulation 05: Number Ten Writing Studio'}
            </h1>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Script Mode Toggle */}
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
              देवनागरी (१०)
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
              English (10)
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
            <span>{stars} Stars</span>
          </div>

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

      {/* MAIN WRITING WORKSPACE */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          maxWidth: '850px',
          margin: '0 auto',
          width: '100%',
          gap: '20px',
        }}
      >
        {/* Wooden Slate Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            background: '#1e293b',
            borderRadius: '28px',
            border: '14px solid #78350f',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Top Title Banner */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
              {scriptMode === 'np' ? 'सङ्ख्या १० (दश)' : 'Number 10 (Ten)'}
            </div>

            <button
              onClick={() => {
                const s = scriptMode === 'np' ? '१०, दश' : '10, Ten';
                speakText(`सङ्ख्या ${s}`, `Number ${s}`);
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
              <span>{language === 'np' ? 'सुन्नुहोस्' : 'Hear'}</span>
            </button>
          </div>

          {/* Chalk Slate Canvas + SVG Overlay */}
          <div
            style={{
              position: 'relative',
              width: '400px',
              height: '260px',
              background: '#0f172a',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          >
            {/* SVG Background Path */}
            <svg
              viewBox="0 0 400 260"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {/* Template */}
              <path
                d={scriptMode === 'np' ? npPath : enPath}
                fill="none"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={scriptMode === 'np' ? npPath : enPath}
                fill="none"
                stroke="#64748b"
                strokeWidth="4"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Animated Demo */}
              {isAnimatingDemo && (
                <path
                  d={scriptMode === 'np' ? npPath : enPath}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="800"
                  strokeDashoffset={800 - (demoProgress / 100) * 800}
                />
              )}

              {/* Checkpoints */}
              {(scriptMode === 'np' ? npCheckpoints : enCheckpoints).map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={i === 0 ? 8 : 5}
                  fill={i === 0 ? '#10b981' : '#38bdf8'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Drawing Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={260}
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

          {/* Feedback pill */}
          {accuracyScore !== null && (
            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: accuracyScore >= 60 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${accuracyScore >= 60 ? '#10b981' : '#ef4444'}`,
                padding: '6px 18px',
                borderRadius: '16px',
              }}
            >
              {accuracyScore >= 60 ? (
                <>
                  <Sparkles size={16} color="#34d399" />
                  <span style={{ fontWeight: 800, color: '#34d399', fontSize: '13px' }}>
                    {language === 'np' ? `शानदार! शुद्धता: ${accuracyScore}% ⭐` : `Splendid! Accuracy: ${accuracyScore}% ⭐`}
                  </span>
                </>
              ) : (
                <>
                  <RotateCcw size={16} color="#f87171" />
                  <span style={{ fontWeight: 800, color: '#f87171', fontSize: '13px' }}>
                    {language === 'np' ? 'फेरि प्रयास गर्नुहोस्!' : 'Try again!'}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Chalk Color Palette */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>
              {language === 'np' ? 'चक रङ:' : 'Chalk:'}
            </span>
            {['#38bdf8', '#facc15', '#4ade80', '#f472b6', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setChalkColor(c)}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: c,
                  border: chalkColor === c ? '2px solid #ffffff' : '1px solid transparent',
                  cursor: 'pointer',
                  transform: chalkColor === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={runAnimatedDemo}
            disabled={isAnimatingDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontWeight: 800,
              cursor: isAnimatingDemo ? 'not-allowed' : 'pointer',
            }}
          >
            <Play size={16} />
            <span>{language === 'np' ? 'लेख्ने तरिका हेर्नुहोस् (Watch Demo)' : 'Watch Demo'}</span>
          </button>

          <button
            onClick={clearCanvas}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              color: '#fca5a5',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Eraser size={16} />
            <span>{language === 'np' ? 'मेटाउनुहोस् (Clear)' : 'Clear Slate'}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default NumberTenWritingStudio;

