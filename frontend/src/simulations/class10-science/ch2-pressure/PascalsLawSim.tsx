/**
 * PascalsLawSim.tsx
 * Ultra-High-Definition Interactive Laboratory Simulation: Pascal's Law
 * Class 10 Science & Technology • Chapter 2: Pressure
 * Nepal Curriculum Development Centre (CDC) Alignment
 *
 * Implements:
 * 1. Multi-Piston Spherical Flask:
 *    - Enclosed spherical vessel with 4 movable pistons
 *    - Radiating omnidirectional pressure vectors ("Equal Pressure / बराबर चाप")
 *    - Cartoon expressive faces toggle (matching textbook & cartoon illustration)
 * 2. Hydraulic Lift & Hydraulic Press:
 *    - Dual cylinder U-tube with unequal cross-sectional areas A1 and A2
 *    - Force multiplication: F2 = F1 * (A2 / A1)
 *    - Conservation of Work/Energy: F1 * d1 = F2 * d2 (Force multiplied, distance reduced)
 *    - Vehicle lifting (Compact Car, SUV, Mini Truck, Heavy Machinery)
 * 3. Hydraulic Brake System:
 *    - Foot pedal -> Master cylinder -> Hydraulic brake lines -> Slave calipers -> Rotating wheel drum
 *    - Interactive pedal stepping with friction deceleration, RPM gauge, and braking sparks
 * 4. SEE Numerical Problem Solver:
 *    - Formula solver for F1/A1 = F2/A2 and A1*d1 = A2*d2 with SEE 2079/2080 past exam board presets
 * 5. Interactive Concept Quiz & Challenge:
 *    - 5 SEE syllabus-aligned questions with instant audio/visual feedback and explanations
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  PascalMode,
  PistonVesselPort,
  LIFT_LOAD_PRESETS,
  LiftLoadOption,
  SEE_EXAM_PROBLEMS,
  SeeExamProblem,
  PASCAL_SIM_QUIZ,
} from './pascalTypes';
import {
  calculatePressurePa,
  calculatePressureKpa,
  computeHydraulicLift,
  computeHydraulicBrakes,
  formatNumberSI,
} from './pascalPhysics';
import {
  drawLabCanvasBackground,
  drawPascalSphericalFlask,
  drawHydraulicLift,
  drawHydraulicBrakes,
  drawAnalogPressureGauge,
} from './renderer/drawPascalVessel';
import {
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Layers,
  Sliders,
  Eye,
  Info,
  Car,
  Disc,
  Calculator,
  ArrowRight,
  Smile,
  ShieldCheck,
} from 'lucide-react';

export const PascalsLawSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  // Global Simulation State
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Active Laboratory Mode (1 of 5)
  const [activeMode, setActiveMode] = useState<PascalMode>('flask');

  // ── 1. Pascal's Flask State ─────────────────────────────────
  const [flaskInputForceN, setFlaskInputForceN] = useState<number>(60); // Effort on P1
  const [flaskP1AreaCm2, setFlaskP1AreaCm2] = useState<number>(10);
  const [showPistonFaces, setShowPistonFaces] = useState<boolean>(true);
  const [flaskPorts, setFlaskPorts] = useState<PistonVesselPort[]>([
    {
      id: 'p1',
      nameEn: 'Piston 1 (Effort Input)',
      nameNe: 'पिस्टन 1',
      angleDeg: 215, // Top-Left
      areaCm2: 10,
      displacementPx: 14,
      isInput: true,
      color: '#f97316',
      faceExpression: 'effort',
    },
    {
      id: 'p2',
      nameEn: 'Piston 2 (Output A)',
      nameNe: 'पिस्टन 2',
      angleDeg: 325, // Top-Right
      areaCm2: 15,
      displacementPx: 21,
      isInput: false,
      color: '#10b981',
      faceExpression: 'excited',
    },
    {
      id: 'p3',
      nameEn: 'Piston 3 (Output B)',
      nameNe: 'पिस्टन 3',
      angleDeg: 145, // Bottom-Left
      areaCm2: 20,
      displacementPx: 28,
      isInput: false,
      color: '#3b82f6',
      faceExpression: 'popped',
    },
    {
      id: 'p4',
      nameEn: 'Piston 4 (Output C)',
      nameNe: 'पिस्टन 4',
      angleDeg: 35, // Bottom-Right
      areaCm2: 25,
      displacementPx: 35,
      isInput: false,
      color: '#a855f7',
      faceExpression: 'excited',
    },
  ]);

  // ── 2. Hydraulic Lift State ─────────────────────────────────
  const [liftF1InputN, setLiftF1InputN] = useState<number>(120);
  const [liftA1Cm2, setLiftA1Cm2] = useState<number>(15);
  const [liftA2Cm2, setLiftA2Cm2] = useState<number>(300);
  const [liftD1StrokeCm, setLiftD1StrokeCm] = useState<number>(20);
  const [selectedLoad, setSelectedLoad] = useState<LiftLoadOption>(LIFT_LOAD_PRESETS[0]);
  const [liftProgress, setLiftProgress] = useState<number>(0);
  const [isLifting, setIsLifting] = useState<boolean>(false);

  // ── 3. Hydraulic Brakes State ───────────────────────────────
  const [pedalDepressionPct, setPedalDepressionPct] = useState<number>(0);
  const [wheelRpm, setWheelRpm] = useState<number>(750);
  const [isAccelerating, setIsAccelerating] = useState<boolean>(false);

  // ── 4. Numerical Solver State ───────────────────────────────
  const [selectedProblem, setSelectedProblem] = useState<SeeExamProblem>(SEE_EXAM_PROBLEMS[0]);
  const [customF1, setCustomF1] = useState<number>(60);
  const [customA1, setCustomA1] = useState<number>(12);
  const [customA2, setCustomA2] = useState<number>(240);

  // ── 5. Quiz State ───────────────────────────────────────────
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizShowFeedback, setQuizShowFeedback] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Canvas Reference & Animation Frame
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);

  // ── Update Multi-Piston Displacements based on Input Force ──
  useEffect(() => {
    const pressureKpa = calculatePressureKpa(flaskInputForceN, flaskP1AreaCm2);
    setFlaskPorts((prev) =>
      prev.map((port) => {
        if (port.isInput) {
          return {
            ...port,
            areaCm2: flaskP1AreaCm2,
            displacementPx: Math.min(30, (flaskInputForceN / 120) * 26),
          };
        } else {
          // Output piston displacement proportional to pressure and area
          const calculatedForce = pressureKpa * 1000 * (port.areaCm2 / 10000);
          return {
            ...port,
            displacementPx: Math.min(45, (calculatedForce / 250) * 36),
          };
        }
      })
    );
  }, [flaskInputForceN, flaskP1AreaCm2]);

  // ── Hydraulic Lift Animation Loop ───────────────────────────
  useEffect(() => {
    let animId: number;
    if (isLifting) {
      ScienceAudio.playWhoosh();
      const startTime = performance.now();
      const duration = 1800; // 1.8 seconds stroke

      const animateStroke = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1.0, elapsed / duration);
        // Smooth ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        setLiftProgress(eased);

        if (progress < 1.0) {
          animId = requestAnimationFrame(animateStroke);
        } else {
          setIsLifting(false);
          ScienceAudio.playPop();
        }
      };
      animId = requestAnimationFrame(animateStroke);
    }
    return () => cancelAnimationFrame(animId);
  }, [isLifting]);

  // ── Hydraulic Brakes Deceleration Physics Loop ──────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setWheelRpm((prevRpm) => {
        if (pedalDepressionPct > 0) {
          const metrics = computeHydraulicBrakes(pedalDepressionPct * 2.5);
          const drop = (metrics.brakingDecelerationRpm / 60) * 0.15;
          const nextRpm = Math.max(0, prevRpm - drop);
          if (prevRpm > 5 && nextRpm <= 5) {
            ScienceAudio.playPop();
          }
          return nextRpm;
        } else if (isAccelerating) {
          return Math.min(1200, prevRpm + 18);
        } else {
          // Gentle free spin coasting
          return Math.max(0, prevRpm - 0.4);
        }
      });
    }, 40);
    return () => clearInterval(interval);
  }, [pedalDepressionPct, isAccelerating]);

  // ── Canvas Main Animation Loop ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      animTimeRef.current += 0.025;
      const t = animTimeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clean Lab Canvas Background with Grid
      drawLabCanvasBackground(ctx, width, height);

      // 2. Render Active Laboratory Mode
      if (activeMode === 'flask') {
        const pressureKpa = calculatePressureKpa(flaskInputForceN, flaskP1AreaCm2);
        drawPascalSphericalFlask(
          ctx,
          width,
          height,
          flaskPorts,
          flaskInputForceN,
          pressureKpa,
          showPistonFaces,
          t
        );

        // Analog Bourdon Gauge in Top-Right
        drawAnalogPressureGauge(
          ctx,
          width * 0.88,
          height * 0.22,
          42,
          pressureKpa,
          150,
          'FLASK PRESSURE'
        );
      } else if (activeMode === 'hydraulic_lift') {
        const metrics = computeHydraulicLift(
          liftF1InputN,
          liftA1Cm2,
          liftA2Cm2,
          liftD1StrokeCm,
          selectedLoad.massKg
        );
        drawHydraulicLift(
          ctx,
          width,
          height,
          liftF1InputN,
          liftA1Cm2,
          liftA2Cm2,
          liftD1StrokeCm,
          metrics,
          selectedLoad,
          liftProgress,
          t
        );

        // Analog Pressure Gauge in Top-Left
        drawAnalogPressureGauge(
          ctx,
          width * 0.12,
          height * 0.20,
          38,
          metrics.pressureKpa,
          250,
          'OIL PRESSURE'
        );
      } else if (activeMode === 'hydraulic_brakes') {
        const metrics = computeHydraulicBrakes(pedalDepressionPct * 2.8);
        drawHydraulicBrakes(
          ctx,
          width,
          height,
          pedalDepressionPct,
          wheelRpm,
          metrics,
          t
        );

        // Brake Line Pressure Gauge
        drawAnalogPressureGauge(
          ctx,
          width * 0.48,
          height * 0.22,
          44,
          metrics.linePressureKpa,
          500,
          'BRAKE LINE (kPa)'
        );
      } else if (activeMode === 'numerical_lab') {
        // Draw Blueprint Diagram of Hydraulic Machine with Dimensions
        drawNumericalLabBlueprint(ctx, width, height, customF1, customA1, customA2);
      } else if (activeMode === 'challenge_quiz') {
        // Draw Concept Trophy / Quiz Hall
        drawQuizVisualBanner(ctx, width, height, quizScore, PASCAL_SIM_QUIZ.length, quizCompleted);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    activeMode,
    flaskInputForceN,
    flaskP1AreaCm2,
    flaskPorts,
    showPistonFaces,
    liftF1InputN,
    liftA1Cm2,
    liftA2Cm2,
    liftD1StrokeCm,
    selectedLoad,
    liftProgress,
    pedalDepressionPct,
    wheelRpm,
    customF1,
    customA1,
    customA2,
    quizScore,
    quizCompleted,
  ]);

  // ── Switch Mode Handler ─────────────────────────────────────
  const handleSelectMode = (mode: PascalMode) => {
    setActiveMode(mode);
    ScienceAudio.playClick();
  };

  // ── Press Piston Action (Hydraulic Lift) ─────────────────────
  const handlePressPistonStroke = () => {
    if (isLifting) return;
    setIsLifting(true);
  };

  // ── Reset Active Simulation ─────────────────────────────────
  const handleReset = () => {
    ScienceAudio.playClick();
    if (activeMode === 'flask') {
      setFlaskInputForceN(60);
      setFlaskP1AreaCm2(10);
      setShowPistonFaces(true);
    } else if (activeMode === 'hydraulic_lift') {
      setLiftF1InputN(120);
      setLiftA1Cm2(15);
      setLiftA2Cm2(300);
      setLiftD1StrokeCm(20);
      setSelectedLoad(LIFT_LOAD_PRESETS[0]);
      setLiftProgress(0);
      setIsLifting(false);
    } else if (activeMode === 'hydraulic_brakes') {
      setPedalDepressionPct(0);
      setWheelRpm(750);
      setIsAccelerating(false);
    } else if (activeMode === 'challenge_quiz') {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizSelectedOption(null);
      setQuizShowFeedback(false);
      setQuizCompleted(false);
    }
  };

  // ── Quiz Option Answer Handler ──────────────────────────────
  const handleQuizAnswer = (optionIdx: number) => {
    if (quizShowFeedback || quizCompleted) return;
    setQuizSelectedOption(optionIdx);
    setQuizShowFeedback(true);

    const isCorrect = optionIdx === PASCAL_SIM_QUIZ[quizIndex].correctIndex;
    if (isCorrect) {
      ScienceAudio.playSuccess();
      setQuizScore((prev) => prev + 1);
    } else {
      ScienceAudio.playBonk();
    }
  };

  const handleNextQuizQuestion = () => {
    ScienceAudio.playClick();
    if (quizIndex < PASCAL_SIM_QUIZ.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizSelectedOption(null);
      setQuizShowFeedback(false);
    } else {
      setQuizCompleted(true);
      setStars(3);
      setIsCompleted(true);
      ScienceAudio.playSuccess();
    }
  };

  return (
    <SimulationLayout
      titleEn="Pascal's Law Master Laboratory"
      titleNe="पास्कलको नियम बृहत् अनुसन्धान प्रयोगशाला"
      subjectCode="SCI"
      gradeLevel={10}
      chapterNumber={2}
      currentStage={stage}
      onStageChange={(s) => {
        setStage(s);
        ScienceAudio.playClick();
      }}
      currentLanguage={lang}
      onLanguageChange={(l) => {
        setLang(l);
        ScienceAudio.playClick();
      }}
      starsEarned={stars}
      totalStars={3}
      isCompleted={isCompleted}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
    >
      {/* ── TOP HORIZONTAL MODE SELECTOR ───────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflowX: 'auto',
        }}
      >
        <ModeTabButton
          active={activeMode === 'flask'}
          onClick={() => handleSelectMode('flask')}
          icon={<Smile size={18} color="#0284c7" />}
          labelEn="1. Pascal's Flask"
          labelNe="1. पास्कलको भाँडो प्रयोग"
        />
        <ModeTabButton
          active={activeMode === 'hydraulic_lift'}
          onClick={() => handleSelectMode('hydraulic_lift')}
          icon={<Car size={18} color="#16a34a" />}
          labelEn="2. Hydraulic Lift"
          labelNe="2. हाइड्रोलिक लिफ्ट र प्रेस"
        />
        <ModeTabButton
          active={activeMode === 'hydraulic_brakes'}
          onClick={() => handleSelectMode('hydraulic_brakes')}
          icon={<Disc size={18} color="#ef4444" />}
          labelEn="3. Hydraulic Brakes"
          labelNe="3. हाइड्रोलिक ब्रेक प्रणाली"
        />
        <ModeTabButton
          active={activeMode === 'numerical_lab'}
          onClick={() => handleSelectMode('numerical_lab')}
          icon={<Calculator size={18} color="#8b5cf6" />}
          labelEn="4. SEE Numerical Lab"
          labelNe="4. SEE गणितीय प्रयोगशाला"
        />
        <ModeTabButton
          active={activeMode === 'challenge_quiz'}
          onClick={() => handleSelectMode('challenge_quiz')}
          icon={<Award size={18} color="#f59e0b" />}
          labelEn="5. Concept Quiz"
          labelNe="5. अभ्यास र प्रश्नोत्तरी"
        />
      </div>

      {/* ── MAIN 2-COLUMN LAB CONTAINER ────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 390px',
          gap: '14px',
          alignItems: 'start',
        }}
      >
        {/* ── LEFT: INTERACTIVE HTML5 CANVAS ───────────────────── */}
        <div
          style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Canvas Floating Top Overlay Badge */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '14px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              zIndex: 10,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
              {activeMode === 'flask' && (lang === 'ne' ? 'पास्कलको बहु-पिस्टन भाँडो' : "Pascal's Spherical Flask")}
              {activeMode === 'hydraulic_lift' && (lang === 'ne' ? 'हाइड्रोलिक लिफ्ट र प्रेस' : 'Hydraulic Lift & Press')}
              {activeMode === 'hydraulic_brakes' && (lang === 'ne' ? 'सवारी साधनको हाइड्रोलिक ब्रेक' : 'Automotive Hydraulic Brakes')}
              {activeMode === 'numerical_lab' && (lang === 'ne' ? 'SEE गणितीय समाधान प्रयोगशाला' : 'SEE Formula Solver Lab')}
              {activeMode === 'challenge_quiz' && (lang === 'ne' ? 'SEE परीक्षा प्रश्नोत्तरी' : 'SEE Concept Mastery Quiz')}
            </span>
          </div>

          {/* Core Interactive HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            width={760}
            height={520}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              cursor: activeMode === 'hydraulic_lift' ? 'grab' : 'default',
            }}
          />

          {/* Quick Action Bar under Canvas */}
          <div
            style={{
              padding: '10px 14px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>
                <strong>{lang === 'ne' ? 'नियम सूत्र:' : 'Law Equation:'}</strong>{' '}
                <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0369a1' }}>
                  P₁ = P₂ ⟹ F₁/A₁ = F₂/A₂
                </code>
              </span>
              <span>
                <strong>{lang === 'ne' ? 'आयतन संरक्षण:' : 'Incompressible Fluid:'}</strong>{' '}
                <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#166534' }}>
                  A₁·d₁ = A₂·d₂
                </code>
              </span>
            </div>

            {activeMode === 'hydraulic_lift' && (
              <button
                onClick={handlePressPistonStroke}
                disabled={isLifting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: isLifting ? '#94a3b8' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: isLifting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Zap size={14} />
                {lang === 'ne' ? 'पिस्टन दबाउनुहोस् (Stroke)' : 'Press Piston Stroke'}
              </button>
            )}

            {activeMode === 'hydraulic_brakes' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onMouseDown={() => setIsAccelerating(true)}
                  onMouseUp={() => setIsAccelerating(false)}
                  onTouchStart={() => setIsAccelerating(true)}
                  onTouchEnd={() => setIsAccelerating(false)}
                  style={{
                    padding: '5px 12px',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne' ? 'गति बढाउनुहोस् (Gas)' : 'Accelerate Wheel'}
                </button>
                <button
                  onClick={() => setPedalDepressionPct(pedalDepressionPct > 0 ? 0 : 85)}
                  style={{
                    padding: '5px 12px',
                    background: pedalDepressionPct > 0 ? '#64748b' : '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {pedalDepressionPct > 0 ? (lang === 'ne' ? 'ब्रेक छोड्नुहोस्' : 'Release Brake') : (lang === 'ne' ? 'कडा ब्रेक लगाउनुहोस्' : 'Hard Brake')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: HIGH-CONTRAST CONTROLS & LEARNING PANEL ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. STATE OF THE LAW CARD (As in uploaded image) */}
          <div
            style={{
              padding: '12px 14px',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #334155',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#fde047' }}>
                {lang === 'ne' ? 'पास्कलको नियम (Pascal’s Law)' : "State of Pascal's Law:"}
              </span>
            </div>
            <p style={{ fontSize: '12px', lineHeight: '1.45', color: '#e2e8f0', margin: 0 }}>
              {lang === 'ne'
                ? 'बन्द भाँडोमा रहेको तरल पदार्थमा बाहिरबाट दबाब दिँदा उक्त दबाब सबै दिशामा बराबर रूपले प्रसारण हुन्छ।'
                : 'Pressure applied to a confined fluid is transmitted equally and undiminished in all directions throughout the liquid.'}
            </p>
          </div>

          {/* 2. MODE SPECIFIC CONTROLS & METRICS */}
          {activeMode === 'flask' && (
            <div
              style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                  {lang === 'ne' ? 'पिस्टन इनपुट नियन्त्रण' : 'Piston Effort Controls'}
                </span>
                <button
                  onClick={() => setShowPistonFaces(!showPistonFaces)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: showPistonFaces ? '#dbeafe' : '#f1f5f9',
                    color: showPistonFaces ? '#1d4ed8' : '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <Smile size={13} />
                  {showPistonFaces ? (lang === 'ne' ? 'कार्टुन मुहार' : 'Faces: ON') : (lang === 'ne' ? 'साधारण' : 'Faces: OFF')}
                </button>
              </div>

              {/* Input Force Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#ea580c' }}>
                    {lang === 'ne' ? 'लगाइएको बल (F₁):' : 'Applied Force (F₁):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{flaskInputForceN} N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={flaskInputForceN}
                  onChange={(e) => setFlaskInputForceN(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
              </div>

              {/* Piston 1 Area Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#0284c7' }}>
                    {lang === 'ne' ? 'पिस्टन 1 को क्षेत्रफल (A₁):' : 'Piston 1 Area (A₁):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{flaskP1AreaCm2} cm²</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={flaskP1AreaCm2}
                  onChange={(e) => setFlaskP1AreaCm2(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              {/* Dynamic Pressure Readout Card */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                  {lang === 'ne' ? 'समान रूपले प्रसारण हुने चाप (Pascal Law Pressure):' : 'Equally Transmitted Pressure (P):'}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#15803d' }}>
                  {calculatePressureKpa(flaskInputForceN, flaskP1AreaCm2).toFixed(1)} kPa
                  <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: '600', marginLeft: '6px' }}>
                    ({Math.round(calculatePressurePa(flaskInputForceN, flaskP1AreaCm2))} N/m²)
                  </span>
                </div>
              </div>

              {/* Output Piston Force Table */}
              <div style={{ fontSize: '11px', color: '#475569' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>
                  {lang === 'ne' ? 'पिस्टनहरूमा निस्कने बल (Output Forces):' : 'Forces on other pistons:'}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {flaskPorts.filter((p) => !p.isInput).map((port) => {
                    const pKpa = calculatePressureKpa(flaskInputForceN, flaskP1AreaCm2);
                    const forceOut = Math.round(pKpa * 1000 * (port.areaCm2 / 10000));
                    return (
                      <div
                        key={port.id}
                        style={{
                          background: '#f8fafc',
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontWeight: '700', color: port.color }}>{port.nameEn.split(' ')[1]}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>A = {port.areaCm2} cm²</div>
                        <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>F = {forceOut} N</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeMode === 'hydraulic_lift' && (
            <div
              style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                {lang === 'ne' ? 'हाइड्रोलिक लिफ्ट परिमाणहरू' : 'Hydraulic Lift Parameters'}
              </div>

              {/* Load Preset Selector */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {lang === 'ne' ? 'उचाल्न चाहेको लोड (Target Load):' : 'Target Load on Large Piston:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {LIFT_LOAD_PRESETS.map((load) => (
                    <button
                      key={load.id}
                      onClick={() => {
                        setSelectedLoad(load);
                        ScienceAudio.playClick();
                      }}
                      style={{
                        padding: '6px 8px',
                        background: selectedLoad.id === load.id ? '#eff6ff' : '#ffffff',
                        border: selectedLoad.id === load.id ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{load.icon}</span>
                      <span>{lang === 'ne' ? load.nameNe : load.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Force F1 Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#ea580c' }}>
                    {lang === 'ne' ? 'सानो पिस्टनमा बल (F₁):' : 'Effort Force (F₁):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{liftF1InputN} N</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={liftF1InputN}
                  onChange={(e) => setLiftF1InputN(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
              </div>

              {/* Small Piston Area A1 Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#0284c7' }}>
                    {lang === 'ne' ? 'सानो पिस्टनको क्षेत्रफल (A₁):' : 'Small Piston Area (A₁):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{liftA1Cm2} cm²</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={liftA1Cm2}
                  onChange={(e) => setLiftA1Cm2(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              {/* Large Piston Area A2 Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#16a34a' }}>
                    {lang === 'ne' ? 'ठूलो पिस्टनको क्षेत्रफल (A₂):' : 'Large Piston Area (A₂):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{liftA2Cm2} cm²</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="20"
                  value={liftA2Cm2}
                  onChange={(e) => setLiftA2Cm2(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#16a34a' }}
                />
              </div>

              {/* Output Mechanical Metrics */}
              {(() => {
                const metrics = computeHydraulicLift(
                  liftF1InputN,
                  liftA1Cm2,
                  liftA2Cm2,
                  liftD1StrokeCm,
                  selectedLoad.massKg
                );
                return (
                  <div
                    style={{
                      background: metrics.canLiftSelectedMass ? '#f0fdf4' : '#fffbeb',
                      border: metrics.canLiftSelectedMass ? '1px solid #86efac' : '1px solid #fde68a',
                      borderRadius: '8px',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        {lang === 'ne' ? 'बल गुणन दर (MA = A₂/A₁):' : 'Mechanical Advantage (MA):'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d' }}>
                        {metrics.mechanicalAdvantage.toFixed(1)}×
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        {lang === 'ne' ? 'निस्कने बल (F₂):' : 'Output Force (F₂):'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}>
                        {Math.round(metrics.f2OutputN)} N
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        {lang === 'ne' ? 'लोड उचाल्ने क्षमता:' : 'Lifting Capacity:'}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          color: metrics.canLiftSelectedMass ? '#166534' : '#b45309',
                        }}
                      >
                        {Math.round(metrics.liftCapacityKg)} kg{' '}
                        {metrics.canLiftSelectedMass ? '✅ (Lifts Load)' : '⚠️ (Increase F₁ or A₂)'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeMode === 'hydraulic_brakes' && (
            <div
              style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                {lang === 'ne' ? 'हाइड्रोलिक ब्रेक नियन्त्रण' : 'Hydraulic Brake Pedal Controls'}
              </div>

              {/* Pedal Depression Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#ef4444' }}>
                    {lang === 'ne' ? 'ब्रेक पेडल दबाब:' : 'Brake Pedal Depression:'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{pedalDepressionPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={pedalDepressionPct}
                  onChange={(e) => setPedalDepressionPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
              </div>

              {/* Wheel RPM Gauge & Brake Line Pressure */}
              {(() => {
                const metrics = computeHydraulicBrakes(pedalDepressionPct * 2.8);
                return (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#64748b', fontWeight: '700' }}>
                        {lang === 'ne' ? 'हाइड्रोलिक पाइप चाप:' : 'Brake Line Pressure:'}
                      </span>
                      <span style={{ fontWeight: '800', color: '#b91c1c' }}>
                        {metrics.linePressureKpa.toFixed(1)} kPa
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#64748b', fontWeight: '700' }}>
                        {lang === 'ne' ? 'प्याडको चेप्ने बल:' : 'Piston Clamping Force:'}
                      </span>
                      <span style={{ fontWeight: '800', color: '#0f172a' }}>
                        {Math.round(metrics.clampingForcePerPistonN)} N
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#64748b', fontWeight: '700' }}>
                        {lang === 'ne' ? 'घर्षण टर्क (Braking Torque):' : 'Frictional Braking Torque:'}
                      </span>
                      <span style={{ fontWeight: '800', color: '#16a34a' }}>
                        {metrics.totalFrictionTorqueNm.toFixed(1)} N·m
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeMode === 'numerical_lab' && (
            <div
              style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                {lang === 'ne' ? 'SEE बोर्ड परीक्षा प्रश्न समाधान' : 'SEE Board Question Solver'}
              </div>

              {/* SEE Question Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {SEE_EXAM_PROBLEMS.map((prob) => (
                  <button
                    key={prob.id}
                    onClick={() => {
                      setSelectedProblem(prob);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '8px 10px',
                      background: selectedProblem.id === prob.id ? '#eff6ff' : '#ffffff',
                      border: selectedProblem.id === prob.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#0f172a',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ color: '#2563eb', fontSize: '10px' }}>{prob.examTag}</div>
                    <div>{lang === 'ne' ? prob.titleNe : prob.titleEn}</div>
                  </button>
                ))}
              </div>

              {/* Step-by-Step Mathematical Solution */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  {lang === 'ne' ? 'चरणबद्ध समाधान (Solution Steps):' : 'Step-by-Step Derivation:'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#334155' }}>
                  {(lang === 'ne' ? selectedProblem.solutionStepsNe : selectedProblem.solutionStepsEn).map(
                    (step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#3b82f6', fontWeight: '800' }}>•</span>
                        <span>{step}</span>
                      </div>
                    )
                  )}
                </div>

                <div
                  style={{
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #cbd5e1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                    {lang === 'ne' ? 'अन्तिम उत्तर:' : 'Final Answer:'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#16a34a' }}>
                    {selectedProblem.finalAnswerFormatted}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'challenge_quiz' && (
            <div
              style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {!quizCompleted ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                      {lang === 'ne' ? `प्रश्न ${quizIndex + 1} / ${PASCAL_SIM_QUIZ.length}` : `Question ${quizIndex + 1} of ${PASCAL_SIM_QUIZ.length}`}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b' }}>
                      ⭐ {quizScore} / {PASCAL_SIM_QUIZ.length}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>
                    {lang === 'ne' ? PASCAL_SIM_QUIZ[quizIndex].questionNe : PASCAL_SIM_QUIZ[quizIndex].questionEn}
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(lang === 'ne' ? PASCAL_SIM_QUIZ[quizIndex].optionsNe : PASCAL_SIM_QUIZ[quizIndex].optionsEn).map(
                      (opt, idx) => {
                        let btnBg = '#ffffff';
                        let btnBorder = '#cbd5e1';
                        let btnColor = '#0f172a';

                        if (quizShowFeedback) {
                          if (idx === PASCAL_SIM_QUIZ[quizIndex].correctIndex) {
                            btnBg = '#dcfce7';
                            btnBorder = '#16a34a';
                            btnColor = '#15803d';
                          } else if (idx === quizSelectedOption) {
                            btnBg = '#fee2e2';
                            btnBorder = '#ef4444';
                            btnColor = '#b91c1c';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            disabled={quizShowFeedback}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: `1.5px solid ${btnBorder}`,
                              background: btnBg,
                              color: btnColor,
                              fontSize: '11px',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: quizShowFeedback ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span style={{ fontWeight: '800' }}>{String.fromCharCode(65 + idx)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Feedback Explanation */}
                  {quizShowFeedback && (
                    <div
                      style={{
                        padding: '8px 10px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '11px',
                        color: '#334155',
                      }}
                    >
                      <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>
                        {lang === 'ne' ? 'व्याख्या (Explanation):' : 'Explanation:'}
                      </div>
                      <div>{lang === 'ne' ? PASCAL_SIM_QUIZ[quizIndex].explanationNe : PASCAL_SIM_QUIZ[quizIndex].explanationEn}</div>

                      <button
                        onClick={handleNextQuizQuestion}
                        style={{
                          marginTop: '8px',
                          width: '100%',
                          padding: '6px 12px',
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        {quizIndex < PASCAL_SIM_QUIZ.length - 1 ? (lang === 'ne' ? 'अर्को प्रश्न ➔' : 'Next Question ➔') : (lang === 'ne' ? 'नतिजा हेर्नुहोस् ➔' : 'Complete Quiz ➔')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <Award size={48} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
                    {lang === 'ne' ? 'बधाई छ! क्विज सम्पन्न भयो' : 'Congratulations! Quiz Completed'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', margin: '6px 0 14px' }}>
                    {lang === 'ne' ? `तपाईंले ${PASCAL_SIM_QUIZ.length} मा ${quizScore} अंक प्राप्त गर्नुभयो।` : `You scored ${quizScore} out of ${PASCAL_SIM_QUIZ.length}!`}
                  </div>
                  <button
                    onClick={() => {
                      setQuizIndex(0);
                      setQuizScore(0);
                      setQuizSelectedOption(null);
                      setQuizShowFeedback(false);
                      setQuizCompleted(false);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्' : 'Retake Quiz'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. CURRICULUM KEY TAKEAWAY FOOTNOTE */}
          <div
            style={{
              padding: '10px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: '1.4',
            }}
          >
            <strong style={{ color: '#0f172a' }}>
              {lang === 'ne' ? 'पाठ्यक्रम निष्कर्ष (CDC Grade 10):' : 'Curriculum Takeaway:'}
            </strong>{' '}
            {lang === 'ne'
              ? 'हाइड्रोलिक मेसिनहरूले पास्कलको नियम अनुसार थोरै बल लगाएर धेरै तौल उचाल्न मद्दत गर्छन्, तर ऊर्जाको संरक्षण अनुसार इनपुट कार्य सधैं आउटपुट कार्यसँग बराबर रहन्छ।'
              : "Hydraulic machines multiply force based on Pascal's Law, but according to conservation of energy, work input always equals work output."}
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

/**
 * Top Mode Selector Tab Button
 */
function ModeTabButton({
  active,
  onClick,
  icon,
  labelEn,
  labelNe,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  labelEn: string;
  labelNe: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '8px',
        border: active ? '1.5px solid #0284c7' : '1px solid transparent',
        background: active ? '#f0f9ff' : 'transparent',
        color: active ? '#0369a1' : '#475569',
        fontWeight: active ? '800' : '600',
        fontSize: '12px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      <span>{labelEn}</span>
    </button>
  );
}

/**
 * Helper Canvas Blueprint for Numerical Solver
 */
function drawNumericalLabBlueprint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  f1: number,
  a1: number,
  a2: number
) {
  const f2 = Math.round((f1 * a2) / a1);
  const midX = width * 0.5;
  const midY = height * 0.5;

  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PASCAL’S HYDRAULIC MACHINE RATIO', midX, midY - 120);

  // Hydraulic Equation Big Block
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(midX - 220, midY - 80, 440, 160, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('F₁ / A₁  =  F₂ / A₂  =  P', midX, midY - 35);

  ctx.fillStyle = '#0f172a';
  ctx.font = '14px monospace';
  ctx.fillText(`${f1} N / ${a1} cm²  =  ${f2} N / ${a2} cm²`, midX, midY + 10);

  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`Output Force F₂ = ${f2} N (Multiplied by ${(a2 / a1).toFixed(1)}×)`, midX, midY + 50);
  ctx.restore();
}

/**
 * Helper Canvas Banner for Quiz Mode
 */
function drawQuizVisualBanner(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  score: number,
  total: number,
  isFinished: boolean
) {
  const midX = width * 0.5;
  const midY = height * 0.45;

  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(midX - 200, midY - 100, 400, 200, 16);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', midX, midY - 20);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Class 10 Science: Pascal’s Law Quiz', midX, midY + 30);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px sans-serif';
  ctx.fillText(
    isFinished ? `Final Score: ${score} / ${total} Stars Earned!` : `Current Score: ${score} / ${total} Answer in the panel to proceed`,
    midX,
    midY + 55
  );
  ctx.restore();
}
