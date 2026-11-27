/**
 * ArchimedesPrincipleSim.tsx
 * Ultra-High-Definition Interactive Laboratory Simulation: Archimedes' Principle (आर्किमिडिजको सिद्धान्त)
 * Class 10 Science & Technology • Chapter 2: Pressure (चाप)
 * Nepal Curriculum Development Centre (CDC) Alignment
 *
 * Implements:
 * 1. Classic Eureka Overflow Can Experiment (विस्थापन क्यान प्रयोग):
 *    - Dual spring balance setup: Weight in Air vs Apparent Weight in Liquid
 *    - Direct implementation of CDC textbook & user's reference diagram
 *    - Glass overflow can with spout, fluid discharge animation, and collection beaker on digital scale
 * 2. Controllable Weights & Density Laboratory (तौल र घनत्व नियन्त्रण):
 *    - Controllable object mass (W_air), volume (V), and solid density (River Stone, Iron, Aluminum, Gold, Wood, Cork)
 *    - Controllable fluid density (Fresh Water, Salt Water, Glycerin, Kerosene, Custom)
 * 3. Law of Floatation (प्लवनको नियम):
 *    - 3-State physical comparison (Sinking, Neutral suspension, Floating partially)
 * 4. SEE Examination Problem Solver (गणितीय समाधान):
 *    - Step-by-step calculations for upthrust, apparent weight, and displaced liquid volume
 * 5. Interactive Concept Mastery Quiz:
 *    - 5 SEE board questions with instant audio/visual feedback and explanations
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  ArchimedesMode,
  SOLID_MATERIALS,
  SolidMaterial,
  LIQUID_MEDIA,
  LiquidMedium,
  ARCHIMEDES_SEE_PROBLEMS,
  ArchimedesProblem,
  ARCHIMEDES_QUIZ,
} from './archimedesTypes';
import {
  calculateArchimedesMetrics,
  formatPhysicalVal,
  GRAVITY,
} from './archimedesPhysics';
import {
  drawLabCanvasBackground,
  drawSpringBalance,
  drawPhysicalObject,
  drawEurekaCan,
  drawDigitalScaleWithBeaker,
  drawForceVectors,
  drawFloatationTank,
} from './renderer/drawArchimedesExperiment';
import {
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  Sliders,
  Eye,
  Info,
  Droplets,
  Layers,
  Scale,
  Calculator,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const ArchimedesPrincipleSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  // Global Simulation State
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Active Laboratory Mode (1 of 5)
  const [activeMode, setActiveMode] = useState<ArchimedesMode>('eureka_experiment');

  // ── Controllable Physical Parameters ────────────────────────
  const [selectedMaterial, setSelectedMaterial] = useState<SolidMaterial>(SOLID_MATERIALS[0]); // River stone default
  const [selectedLiquid, setSelectedLiquid] = useState<LiquidMedium>(LIQUID_MEDIA[0]); // Fresh water default

  // Controllable Object Volume in cm^3 (e.g. 204 cm^3 with density 2500 kg/m^3 yields ~5 N in air!)
  const [objectVolumeCm3, setObjectVolumeCm3] = useState<number>(204);
  const [customSolidDensity, setCustomSolidDensity] = useState<number>(2500);
  const [customLiquidDensity, setCustomLiquidDensity] = useState<number>(1000);

  // Submersion percentage (0% in air to 100% fully immersed)
  const [submersionPct, setSubmersionPct] = useState<number>(100);

  // ── SEE Solver State ────────────────────────────────────────
  const [selectedProblem, setSelectedProblem] = useState<ArchimedesProblem>(ARCHIMEDES_SEE_PROBLEMS[0]);

  // ── Quiz State ──────────────────────────────────────────────
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizShowFeedback, setQuizShowFeedback] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Canvas Reference & Animation Frame
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);

  // Effective Solid and Liquid Densities
  const effectiveSolidDensity =
    selectedMaterial.id === 'custom' ? customSolidDensity : selectedMaterial.densityKgM3;
  const effectiveLiquidDensity =
    selectedLiquid.id === 'custom_liquid' ? customLiquidDensity : selectedLiquid.densityKgM3;

  // Active Physical Calculation
  const metrics = calculateArchimedesMetrics(
    objectVolumeCm3,
    effectiveSolidDensity,
    effectiveLiquidDensity,
    submersionPct / 100
  );

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

      // 1. Draw Lab Background
      drawLabCanvasBackground(ctx, width, height);

      if (activeMode === 'eureka_experiment') {
        // ── 1. EUREKA OVERFLOW CAN LABORATORY ──────────────────
        // (Matching user's reference diagram exactly!)

        // Apparatus Positions
        const airBalanceX = width * 0.16;
        const waterBalanceX = width * 0.50;
        const eurekaCanX = waterBalanceX - 70;
        const eurekaCanY = height * 0.42;
        const eurekaCanW = 140;
        const eurekaCanH = 200;

        const scaleX = eurekaCanX + eurekaCanW + 90;
        const scaleY = eurekaCanY + eurekaCanH - 34;

        // A. Left Balance (Object Hanging in Air)
        const hookAirY = drawSpringBalance(
          ctx,
          airBalanceX,
          height * 0.12,
          metrics.weightAirN,
          10,
          lang === 'ne' ? 'हावामा तौल (W₁)' : 'Weight in Air (W₁)',
          '#ea580c'
        );

        // Hanging Cord in Air
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(airBalanceX, hookAirY);
        ctx.lineTo(airBalanceX, hookAirY + 65);
        ctx.stroke();

        // Object in Air
        drawPhysicalObject(ctx, airBalanceX, hookAirY + 85, 26, selectedMaterial);

        // B. Eureka Can (Right Container)
        const isDischarging = submersionPct > 10;
        drawEurekaCan(
          ctx,
          eurekaCanX,
          eurekaCanY,
          eurekaCanW,
          eurekaCanH,
          selectedLiquid,
          isDischarging,
          t
        );

        // C. Submerged Balance 2 (Apparent Weight in Water)
        const hookWaterY = drawSpringBalance(
          ctx,
          waterBalanceX,
          height * 0.12,
          metrics.apparentWeightN,
          10,
          lang === 'ne' ? 'पानीमा तौल (W₂)' : 'Apparent Weight (W₂)',
          '#0284c7'
        );

        // Submersion position inside Eureka can
        // When submersionPct = 0: object hangs above spout
        // When submersionPct = 100: object fully immersed inside can
        const targetObjectY = eurekaCanY + 45 + (submersionPct / 100) * 85;

        // Hanging Cord into Water
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(waterBalanceX, hookWaterY);
        ctx.lineTo(waterBalanceX, targetObjectY - 26);
        ctx.stroke();

        // Object in Water
        drawPhysicalObject(ctx, waterBalanceX, targetObjectY, 26, selectedMaterial);

        // D. Upthrust & Weight Vector Arrows on Submerged Body
        drawForceVectors(
          ctx,
          waterBalanceX,
          targetObjectY,
          metrics.weightAirN,
          metrics.upthrustN
        );

        // E. Collection Beaker on Electronic Digital Scale
        const beakerFillPx = (metrics.submergedVolumeCm3 / objectVolumeCm3) * 45;
        drawDigitalScaleWithBeaker(
          ctx,
          scaleX,
          scaleY,
          beakerFillPx,
          selectedLiquid,
          metrics.displacedWeightN,
          metrics.displacedMassKg * 1000
        );

        // F. On-Canvas Dynamic Archimedes Equality Card
        drawArchimedesEqualitySummary(
          ctx,
          width * 0.5,
          height * 0.89,
          metrics.weightAirN,
          metrics.apparentWeightN,
          metrics.upthrustN,
          metrics.displacedWeightN,
          lang
        );
      } else if (activeMode === 'density_lab') {
        // ── 2. CONTROLLABLE WEIGHTS & DENSITIES LAB ────────────
        drawDensityComparisonView(ctx, width, height, metrics, selectedMaterial, selectedLiquid, t);
      } else if (activeMode === 'floatation_laws') {
        // ── 3. LAW OF FLOATATION 3-STATE TANK ──────────────────
        drawFloatationTank(ctx, width, height, selectedLiquid, t);
      } else if (activeMode === 'see_solver') {
        // ── 4. SEE NUMERICAL SOLVER BLUEPRINT ──────────────────
        drawSolverBlueprint(ctx, width, height, selectedProblem, lang);
      } else if (activeMode === 'concept_quiz') {
        // ── 5. CONCEPT QUIZ HALL ───────────────────────────────
        drawQuizBanner(ctx, width, height, quizScore, ARCHIMEDES_QUIZ.length, quizCompleted);
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
    submersionPct,
    objectVolumeCm3,
    effectiveSolidDensity,
    effectiveLiquidDensity,
    selectedMaterial,
    selectedLiquid,
    metrics,
    selectedProblem,
    quizScore,
    quizCompleted,
    lang,
  ]);

  // ── Switch Mode Handler ─────────────────────────────────────
  const handleSelectMode = (mode: ArchimedesMode) => {
    setActiveMode(mode);
    ScienceAudio.playClick();
  };

  // ── Reset Handler ───────────────────────────────────────────
  const handleReset = () => {
    ScienceAudio.playClick();
    setSelectedMaterial(SOLID_MATERIALS[0]);
    setSelectedLiquid(LIQUID_MEDIA[0]);
    setObjectVolumeCm3(204);
    setSubmersionPct(100);
    setCustomSolidDensity(2500);
    setCustomLiquidDensity(1000);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelectedOption(null);
    setQuizShowFeedback(false);
    setQuizCompleted(false);
  };

  // ── Quiz Handlers ───────────────────────────────────────────
  const handleQuizAnswer = (optionIdx: number) => {
    if (quizShowFeedback || quizCompleted) return;
    setQuizSelectedOption(optionIdx);
    setQuizShowFeedback(true);

    const isCorrect = optionIdx === ARCHIMEDES_QUIZ[quizIndex].correctIndex;
    if (isCorrect) {
      ScienceAudio.playSuccess();
      setQuizScore((prev) => prev + 1);
    } else {
      ScienceAudio.playBonk();
    }
  };

  const handleNextQuizQuestion = () => {
    ScienceAudio.playClick();
    if (quizIndex < ARCHIMEDES_QUIZ.length - 1) {
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
      titleEn="Archimedes' Principle Master Laboratory"
      titleNe="आर्किमिडिजको सिद्धान्त अनुसन्धान प्रयोगशाला"
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
          active={activeMode === 'eureka_experiment'}
          onClick={() => handleSelectMode('eureka_experiment')}
          icon={<Droplets size={18} color="#0284c7" />}
          labelEn="1. Eureka Can Experiment (विस्थापन क्यान)"
          labelNe="१. विस्थापन क्यान प्रयोग"
        />
        <ModeTabButton
          active={activeMode === 'density_lab'}
          onClick={() => handleSelectMode('density_lab')}
          icon={<Scale size={18} color="#16a34a" />}
          labelEn="2. Controllable Weight & Density"
          labelNe="२. तौल र घनत्व नियन्त्रण"
        />
        <ModeTabButton
          active={activeMode === 'floatation_laws'}
          onClick={() => handleSelectMode('floatation_laws')}
          icon={<Layers size={18} color="#f59e0b" />}
          labelEn="3. Law of Floatation (प्लवनको नियम)"
          labelNe="३. प्लवनको नियम"
        />
        <ModeTabButton
          active={activeMode === 'see_solver'}
          onClick={() => handleSelectMode('see_solver')}
          icon={<Calculator size={18} color="#8b5cf6" />}
          labelEn="4. SEE Numerical Solver"
          labelNe="४. SEE गणितीय समाधान"
        />
        <ModeTabButton
          active={activeMode === 'concept_quiz'}
          onClick={() => handleSelectMode('concept_quiz')}
          icon={<Award size={18} color="#ea580c" />}
          labelEn="5. Concept Quiz (प्रश्नोत्तरी)"
          labelNe="५. अभ्यास र प्रश्नोत्तरी"
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
                background: '#0284c7',
                boxShadow: '0 0 8px #0284c7',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
              {activeMode === 'eureka_experiment' && (lang === 'ne' ? 'विस्थापन क्यान र स्प्रिङ तराजु प्रयोगशाला' : 'Eureka Overflow Can & Dual Spring Balance')}
              {activeMode === 'density_lab' && (lang === 'ne' ? 'तौल, आयतन र घनत्व नियन्त्रण' : 'Controllable Weight & Density')}
              {activeMode === 'floatation_laws' && (lang === 'ne' ? 'प्लवनको नियम (Law of Floatation)' : 'Law of Floatation (3 Equilibrium Cases)')}
              {activeMode === 'see_solver' && (lang === 'ne' ? 'SEE बोर्ड परीक्षा गणितीय समाधान' : 'SEE Board Question Solver')}
              {activeMode === 'concept_quiz' && (lang === 'ne' ? 'आर्किमिडिजको सिद्धान्त प्रश्नोत्तरी' : "Archimedes' Principle Mastery Quiz")}
            </span>
          </div>

          {/* Core Interactive HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            width={760}
            height={530}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
            }}
          />

          {/* Quick Submersion Bar under Canvas */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '65%' }}>
              <span style={{ fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                {lang === 'ne' ? 'डुबाउने गहिराइ (Submersion):' : 'Immersion Depth:'}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={submersionPct}
                onChange={(e) => {
                  setSubmersionPct(Number(e.target.value));
                  ScienceAudio.playWaterDrop();
                }}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
              <span style={{ fontWeight: '900', color: '#0284c7', minWidth: '42px' }}>
                {submersionPct}%
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setSubmersionPct(submersionPct > 0 ? 0 : 100);
                  ScienceAudio.playWaterDrop();
                }}
                style={{
                  padding: '5px 12px',
                  background: submersionPct > 0 ? '#64748b' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {submersionPct > 0 ? (lang === 'ne' ? 'पानीबाट निकाल्नुहोस्' : 'Lift to Air') : (lang === 'ne' ? 'पानीमा डुबाउनुहोस्' : 'Submerge 100%')}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: HIGH-CONTRAST CONTROLS & LEARNING PANEL ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. STATEMENT OF ARCHIMEDES' PRINCIPLE (As in uploaded image) */}
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
                {lang === 'ne' ? 'सिद्धान्त (Statement):' : "Archimedes' Principle:"}
              </span>
            </div>
            <p style={{ fontSize: '12px', lineHeight: '1.45', color: '#e2e8f0', margin: 0 }}>
              {lang === 'ne'
                ? 'कुनै वस्तुलाई तरल पदार्थमा आंशिक वा पूर्ण रूपले डुबाउँदा त्यसमा लाग्ने उर्ध्वचाप वस्तुले विस्थापित गरेको तरल पदार्थको तौलसँग बराबर हुन्छ।'
                : 'When a body is wholly or partially immersed in a fluid, it experiences an upthrust equal to the weight of the fluid displaced by it.'}
            </p>
          </div>

          {/* 2. FORMULA SUMMARY CARD */}
          <div
            style={{
              padding: '10px 14px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534' }}>
              {lang === 'ne' ? 'सूत्र (Formulas):' : 'Mathematical Formulas:'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', fontFamily: 'monospace' }}>
              • Upthrust (U) = V_sub × ρ_liquid × g
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', fontFamily: 'monospace' }}>
              • Apparent Weight = W_air - Upthrust
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', fontFamily: 'monospace' }}>
              • Loss in Weight = Weight of Displaced Fluid
            </div>
          </div>

          {/* 3. MODE SPECIFIC CONTROLS */}
          {activeMode === 'eureka_experiment' && (
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
                {lang === 'ne' ? 'प्रयोगशाला वस्तु र तरल नियन्त्रण' : 'Object & Liquid Selection'}
              </div>

              {/* Material Selector */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {lang === 'ne' ? 'डुबाइने वस्तु (Test Object):' : 'Submerged Solid Object:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {SOLID_MATERIALS.slice(0, 4).map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => {
                        setSelectedMaterial(mat);
                        ScienceAudio.playClick();
                      }}
                      style={{
                        padding: '6px 8px',
                        background: selectedMaterial.id === mat.id ? '#eff6ff' : '#ffffff',
                        border: selectedMaterial.id === mat.id ? '2px solid #3b82f6' : '1px solid #cbd5e1',
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
                      <span>{mat.icon}</span>
                      <span>{lang === 'ne' ? mat.nameNe : mat.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Object Volume Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#0284c7' }}>
                    {lang === 'ne' ? 'वस्तुको आयतन (Volume):' : 'Object Volume (V):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{objectVolumeCm3} cm³</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="400"
                  step="10"
                  value={objectVolumeCm3}
                  onChange={(e) => setObjectVolumeCm3(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              {/* Liquid Selector */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {lang === 'ne' ? 'तरल पदार्थ (Liquid Medium):' : 'Liquid Medium:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {LIQUID_MEDIA.slice(0, 4).map((liq) => (
                    <button
                      key={liq.id}
                      onClick={() => {
                        setSelectedLiquid(liq);
                        ScienceAudio.playWaterDrop();
                      }}
                      style={{
                        padding: '6px 8px',
                        background: selectedLiquid.id === liq.id ? '#f0fdf4' : '#ffffff',
                        border: selectedLiquid.id === liq.id ? '2px solid #10b981' : '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {lang === 'ne' ? liq.nameNe : liq.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Physical Measurements Table */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ea580c', fontWeight: '700' }}>
                    {lang === 'ne' ? 'हावामा तौल (Weight in Air):' : 'Weight in Air (W₁):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{metrics.weightAirN.toFixed(2)} N</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#0284c7', fontWeight: '700' }}>
                    {lang === 'ne' ? 'पानीमा तौल (Apparent Weight):' : 'Apparent Weight (W₂):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{metrics.apparentWeightN.toFixed(2)} N</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>
                    {lang === 'ne' ? 'लाग्ने उर्ध्वचाप (Upthrust U):' : 'Upthrust (U):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#15803d' }}>{metrics.upthrustN.toFixed(2)} N</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
                  <span style={{ color: '#64748b', fontWeight: '700' }}>
                    {lang === 'ne' ? 'विस्थापित पानीको तौल:' : 'Displaced Fluid Weight:'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0284c7' }}>{metrics.displacedWeightN.toFixed(2)} N</span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'density_lab' && (
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
                {lang === 'ne' ? 'घनत्व र तौल नियन्त्रण' : 'Density & Weight Controls'}
              </div>

              {/* Material Dropdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {SOLID_MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setObjectVolumeCm3(mat.defaultVolumeCm3);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '6px 8px',
                      background: selectedMaterial.id === mat.id ? '#eff6ff' : '#ffffff',
                      border: selectedMaterial.id === mat.id ? '2px solid #3b82f6' : '1px solid #cbd5e1',
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
                    <span>{mat.icon}</span>
                    <span>{lang === 'ne' ? mat.nameNe : mat.nameEn}</span>
                  </button>
                ))}
              </div>

              {/* Custom Solid Density Slider */}
              {selectedMaterial.id === 'custom' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#8b5cf6' }}>
                      {lang === 'ne' ? 'वस्तुको घनत्व (Solid Density):' : 'Custom Solid Density:'}
                    </span>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{customSolidDensity} kg/m³</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="10000"
                    step="100"
                    value={customSolidDensity}
                    onChange={(e) => setCustomSolidDensity(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#8b5cf6' }}
                  />
                </div>
              )}

              {/* Custom Liquid Density Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#0284c7' }}>
                    {lang === 'ne' ? 'तरलको घनत्व (Liquid Density):' : 'Liquid Density (ρ):'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{effectiveLiquidDensity} kg/m³</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="1500"
                  step="50"
                  value={effectiveLiquidDensity}
                  onChange={(e) => {
                    setSelectedLiquid(LIQUID_MEDIA[4]);
                    setCustomLiquidDensity(Number(e.target.value));
                  }}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              {/* Density Ratio & Flotation Verdict */}
              <div
                style={{
                  background: metrics.willFloat ? '#f0fdf4' : '#fff1f2',
                  border: metrics.willFloat ? '1px solid #86efac' : '1px solid #fecdd3',
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#475569' }}>
                    {lang === 'ne' ? 'घनत्व अनुपात (ρ_वस्तु / ρ_तरल):' : 'Relative Density Ratio:'}
                  </span>
                  <span style={{ fontWeight: '900', color: '#0f172a' }}>
                    {metrics.densityRatio.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: metrics.willFloat ? '#15803d' : '#be123c' }}>
                  {metrics.willFloat
                    ? (lang === 'ne' ? '✅ वस्तु उत्रिन्छ (Floats in liquid)' : '✅ Object Floats (ρ_body < ρ_liquid)')
                    : (lang === 'ne' ? '⚠️ वस्तु डुब्छ (Sinks to bottom)' : '⚠️ Object Sinks (ρ_body > ρ_liquid)')}
                </div>
              </div>
            </div>
          )}

          {activeMode === 'floatation_laws' && (
            <div
              style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                {lang === 'ne' ? 'प्लवनको नियम (Law of Floatation)' : 'Law of Floatation (CDC Grade 10)'}
              </div>

              <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.45' }}>
                {lang === 'ne'
                  ? 'कुनै उत्रने वस्तुले आफ्नो तौल बराबरको तरल पदार्थ विस्थापित गर्छ। (Weight of floating body = Weight of displaced liquid)'
                  : 'A floating body displaces fluid equal to its own weight. Apparent weight of a freely floating body is always 0 N!'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#16a34a' }}>1. ρ_body &lt; ρ_liquid:</strong>{' '}
                  {lang === 'ne' ? 'वस्तु आंशिक डुबेर उत्रिन्छ।' : 'Object floats partially submerged.'}
                </div>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0284c7' }}>2. ρ_body = ρ_liquid:</strong>{' '}
                  {lang === 'ne' ? 'वस्तु पूर्ण डुबेर तैरिन्छ।' : 'Object floats completely submerged.'}
                </div>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#dc2626' }}>3. ρ_body &gt; ρ_liquid:</strong>{' '}
                  {lang === 'ne' ? 'उर्ध्वचाप कम भई वस्तु पिँधमा डुब्छ।' : 'Upthrust is insufficient; object sinks.'}
                </div>
              </div>
            </div>
          )}

          {activeMode === 'see_solver' && (
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ARCHIMEDES_SEE_PROBLEMS.map((prob) => (
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
                  {(lang === 'ne' ? selectedProblem.stepsNe : selectedProblem.stepsEn).map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ color: '#3b82f6', fontWeight: '800' }}>•</span>
                      <span>{step}</span>
                    </div>
                  ))}
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
                    {lang === 'ne' ? 'अन्तिम नतिजा:' : 'Result:'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#16a34a' }}>
                    {selectedProblem.resultFormatted}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'concept_quiz' && (
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
                      {lang === 'ne' ? `प्रश्न ${quizIndex + 1} / ${ARCHIMEDES_QUIZ.length}` : `Question ${quizIndex + 1} of ${ARCHIMEDES_QUIZ.length}`}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b' }}>
                      ⭐ {quizScore} / {ARCHIMEDES_QUIZ.length}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>
                    {lang === 'ne' ? ARCHIMEDES_QUIZ[quizIndex].questionNe : ARCHIMEDES_QUIZ[quizIndex].questionEn}
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(lang === 'ne' ? ARCHIMEDES_QUIZ[quizIndex].optionsNe : ARCHIMEDES_QUIZ[quizIndex].optionsEn).map(
                      (opt, idx) => {
                        let btnBg = '#ffffff';
                        let btnBorder = '#cbd5e1';
                        let btnColor = '#0f172a';

                        if (quizShowFeedback) {
                          if (idx === ARCHIMEDES_QUIZ[quizIndex].correctIndex) {
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
                      <div>{lang === 'ne' ? ARCHIMEDES_QUIZ[quizIndex].explanationNe : ARCHIMEDES_QUIZ[quizIndex].explanationEn}</div>

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
                        {quizIndex < ARCHIMEDES_QUIZ.length - 1 ? (lang === 'ne' ? 'अर्को प्रश्न ➔' : 'Next Question ➔') : (lang === 'ne' ? 'नतिजा हेर्नुहोस् ➔' : 'Complete Quiz ➔')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <Award size={48} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
                    {lang === 'ne' ? 'बधाई छ! क्विज सम्पन्न भयो' : 'Quiz Completed!'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', margin: '6px 0 14px' }}>
                    {lang === 'ne' ? `तपाईंले ${ARCHIMEDES_QUIZ.length} मा ${quizScore} अंक प्राप्त गर्नुभयो।` : `You scored ${quizScore} out of ${ARCHIMEDES_QUIZ.length}!`}
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

          {/* 4. CURRICULUM KEY TAKEAWAY FOOTNOTE */}
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
              ? 'पानीमा डुबाउँदा वस्तुले आफ्नो डुबेको आयतन बराबरको पानी विस्थापित गर्छ र विस्थापित पानीको तौल नै उर्ध्वचाप (Upthrust) सँग ठ्याक्कै बराबर हुन्छ।'
              : 'When submerged, a body displaces fluid equal to its submerged volume, and the weight of that displaced fluid exactly equals the upward buoyant force (Upthrust).'}
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
 * On-Canvas Dynamic Archimedes Equality Summary Card
 */
function drawArchimedesEqualitySummary(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  wAir: number,
  wWater: number,
  upthrust: number,
  wDisplaced: number,
  lang: Language
) {
  const cardW = 680;
  const cardH = 50;

  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const loss = Math.max(0, wAir - wWater);
  const textEn = `Loss of Weight (${wAir.toFixed(2)} N - ${wWater.toFixed(2)} N = ${loss.toFixed(2)} N)  =  Upthrust (${upthrust.toFixed(2)} N)  =  Displaced Fluid (${wDisplaced.toFixed(2)} N)`;
  const textNe = `तौलमा कमी (${wAir.toFixed(2)} N - ${wWater.toFixed(2)} N = ${loss.toFixed(2)} N)  =  उर्ध्वचाप (${upthrust.toFixed(2)} N)  =  विस्थापित पानीको तौल (${wDisplaced.toFixed(2)} N)`;

  ctx.fillText(lang === 'ne' ? textNe : textEn, cx, cy);
  ctx.restore();
}

/**
 * Density Comparison Lab Canvas View
 */
function drawDensityComparisonView(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  metrics: any,
  material: SolidMaterial,
  liquid: LiquidMedium,
  t: number
) {
  const midX = width * 0.5;
  const midY = height * 0.48;

  ctx.save();
  // Large Lab Liquid Tank
  const tankW = 320;
  const tankH = 260;
  const tankX = midX - tankW / 2;
  const tankY = midY - tankH / 2 + 20;

  const grad = ctx.createLinearGradient(tankX, tankY + 40, tankX, tankY + tankH);
  grad.addColorStop(0, liquid.fluidGradient[0]);
  grad.addColorStop(0.5, liquid.fluidGradient[1]);
  grad.addColorStop(1, liquid.fluidGradient[2]);

  ctx.fillStyle = grad;
  ctx.fillRect(tankX + 4, tankY + 40, tankW - 8, tankH - 44);

  // Surface Wave
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tankX + 4, tankY + 40);
  for (let x = tankX + 4; x <= tankX + tankW - 4; x += 10) {
    const wave = Math.sin((x / 25) + t * 4) * 2;
    ctx.lineTo(x, tankY + 40 + wave);
  }
  ctx.stroke();

  // Glass Tank Walls
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(tankX, tankY, tankW, tankH);

  // Object position based on density equilibrium
  let objectY = tankY + 40;
  if (metrics.densityRatio >= 1.0) {
    // Sunk to bottom
    objectY = tankY + tankH - 45;
  } else {
    // Floating partially submerged
    objectY = tankY + 40 + (metrics.densityRatio * 35) - 20;
  }

  drawPhysicalObject(ctx, midX, objectY, 32, material);

  // Title Callout
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Testing ${material.nameEn} (ρ = ${material.densityKgM3} kg/m³) in ${liquid.nameEn} (ρ = ${liquid.densityKgM3} kg/m³)`,
    midX,
    tankY - 20
  );

  ctx.restore();
}

/**
 * SEE Solver Blueprint
 */
function drawSolverBlueprint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  prob: ArchimedesProblem,
  lang: Language
) {
  const midX = width * 0.5;
  const midY = height * 0.46;

  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(midX - 260, midY - 140, 520, 280, 14);
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ARCHIMEDES’ PRINCIPLE FORMULA DERIVATION', midX, midY - 95);

  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('Upthrust (U) = Weight of Displaced Fluid = V·ρ·g', midX, midY - 45);

  ctx.fillStyle = '#1e293b';
  ctx.font = '14px monospace';
  ctx.fillText(`Apparent Weight = W_air - U = ${prob.given.weightAirN} N - 2.0 N = 3.0 N`, midX, midY + 15);

  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(prob.resultFormatted, midX, midY + 75);
  ctx.restore();
}

/**
 * Quiz Visual Banner
 */
function drawQuizBanner(
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
  ctx.fillText('👑', midX, midY - 20);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Class 10 Science: Archimedes Quiz', midX, midY + 30);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px sans-serif';
  ctx.fillText(
    isFinished ? `Final Score: ${score} / ${total} Stars Earned!` : `Current Score: ${score} / ${total} Answer in the panel to proceed`,
    midX,
    midY + 55
  );
  ctx.restore();
}
