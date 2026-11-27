/**
 * ScientificMethodLab.tsx
 * Simulation 1: 2D Scientific Method Laboratory (वैज्ञानिक पद्धति प्रयोगशाला)
 * Grade 6 Science • Unit 1: Scientific Learning (वैज्ञानिक सिकाइ)
 *
 * Implements the rigorous 7-stage empirical scientific inquiry cycle:
 * 1. Observation (अवलोकन)
 * 2. Question (जिज्ञासा)
 * 3. Hypothesis / Prediction (परिकल्पना / अनुमान)
 * 4. Controlled Experiment (नियन्त्रित प्रयोग): Direct Sunlight vs Shaded Canopy Ice Melting
 * 5. Data Collection & Graphing (तथ्याङ्क सङ्कलन)
 * 6. Conclusion (निष्कर्ष)
 * 7. Communication (सञ्चार तथा प्रतिवेदन)
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, Cloud, Play, RotateCcw, Sparkles, CheckCircle2, BarChart2 } from 'lucide-react';

export const ScientificMethodLab: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Experiment state
  const [hypothesis, setHypothesis] = useState<'sunlight_faster' | 'shade_faster' | null>('sunlight_faster');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sunMeltPercent, setSunMeltPercent] = useState<number>(0);
  const [shadeMeltPercent, setShadeMeltPercent] = useState<number>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Experiment ticker
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(sec => {
          const nextSec = sec + 1;
          const sunP = Math.min(100, nextSec * 5);
          const shadeP = Math.min(100, Math.floor(nextSec * 1.8));

          setSunMeltPercent(sunP);
          setShadeMeltPercent(shadeP);

          if (sunP >= 100) {
            setIsRunning(false);
            if (!isCompleted) {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }
          }
          return nextSec;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning, isCompleted]);

  // 2D Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Environment backdrop: Split into Left (Sunny Outdoor) vs Right (Shaded Veranda)
      // Left Sunny Side
      const sunSky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      sunSky.addColorStop(0, '#0284c7');
      sunSky.addColorStop(1, '#bae6fd');
      ctx.fillStyle = sunSky;
      ctx.fillRect(0, 0, w * 0.5, h * 0.45);

      // Right Shaded Side
      const shadeSky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      shadeSky.addColorStop(0, '#1e293b');
      shadeSky.addColorStop(1, '#334155');
      ctx.fillStyle = shadeSky;
      ctx.fillRect(w * 0.5, 0, w * 0.5, h * 0.45);

      // Left Sun with Corona Flare
      const sunX = w * 0.15;
      const sunY = 60;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 35);
      sunGlow.addColorStop(0, '#ffffff');
      sunGlow.addColorStop(0.3, '#fef08a');
      sunGlow.addColorStop(0.7, '#f59e0b');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < 8; r++) {
        const ang = (r * Math.PI) / 4 + t * 0.2;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(ang) * 20, sunY + Math.sin(ang) * 20);
        ctx.lineTo(sunX + Math.cos(ang) * 45, sunY + Math.sin(ang) * 45);
        ctx.stroke();
      }

      // Right Shade Umbrella / Canopy
      const umbX = w * 0.75;
      const umbY = 70;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(umbX, umbY, 55, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(umbX, umbY);
      ctx.lineTo(umbX, h * 0.45);
      ctx.stroke();

      // Outdoor Wooden Table (Ground level)
      const tableY = h - 60;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, tableY, w - 40, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, tableY + 20, w - 40, 40);

      // Divider line between test setups
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w * 0.5, 0);
      ctx.lineTo(w * 0.5, tableY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Setup 1: Direct Sunlight (Dish on Left: cx = w * 0.25)
      const dish1X = w * 0.25;
      const dishY = tableY - 15;
      const dishR = 65;

      // Glass Petri Dish 1
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(dish1X, dishY, dishR, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Melted water pool in Dish 1
      const water1Alpha = sunMeltPercent / 100;
      if (water1Alpha > 0) {
        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + water1Alpha * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(dish1X, dishY, (dishR - 6) * water1Alpha, 12 * water1Alpha, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ice Cube 1 (Shrinks as sunMeltPercent reaches 100)
      const ice1Scale = Math.max(0, 1 - sunMeltPercent / 100);
      if (ice1Scale > 0.05) {
        const iceW = 45 * ice1Scale;
        const iceH = 45 * ice1Scale;
        ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(dish1X - iceW / 2, dishY - iceH - 2, iceW, iceH, 4);
        ctx.fill();
        ctx.stroke();
      }

      // Setup 2: Shaded Environment (Dish on Right: cx = w * 0.75)
      const dish2X = w * 0.75;

      // Glass Petri Dish 2
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(dish2X, dishY, dishR, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Melted water pool in Dish 2
      const water2Alpha = shadeMeltPercent / 100;
      if (water2Alpha > 0) {
        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + water2Alpha * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(dish2X, dishY, (dishR - 6) * water2Alpha, 12 * water2Alpha, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ice Cube 2 (Shrinks slower)
      const ice2Scale = Math.max(0, 1 - shadeMeltPercent / 100);
      if (ice2Scale > 0.05) {
        const iceW = 45 * ice2Scale;
        const iceH = 45 * ice2Scale;
        ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(dish2X - iceW / 2, dishY - iceH - 2, iceW, iceH, 4);
        ctx.fill();
        ctx.stroke();
      }

      // Setup Labels & Melt Gauges
      // Left Setup
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(lang === 'en' ? 'Setup A: Direct Sunlight (घाम)' : 'प्रयोग क: सिधा घाम लागेको ठाउँ', dish1X - 90, tableY + 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${lang === 'en' ? 'Melted:' : 'पग्लिएको:'} ${sunMeltPercent}% (Temp: 28°C)`, dish1X - 80, tableY + 34);

      // Right Setup
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(lang === 'en' ? 'Setup B: Shaded Canopy (छायाँ)' : 'प्रयोग ख: छायाँ परेको ठाउँ', dish2X - 85, tableY + 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${lang === 'en' ? 'Melted:' : 'पग्लिएको:'} ${shadeMeltPercent}% (Temp: 16°C)`, dish2X - 75, tableY + 34);

      // Live metrics HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Scientific Variable Control:' : 'वैज्ञानिक चर नियन्त्रण:', 32, 40);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Independent: Solar Radiation (घाम vs छायाँ)`, 32, 60);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Elapsed Time: ${elapsedSeconds} seconds`, 32, 80);

      ctx.fillStyle = '#34d399';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Controlled: Ice cube size (50g), Petri dish shape`, 32, 100);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [sunMeltPercent, shadeMeltPercent, elapsedSeconds, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setSunMeltPercent(0);
    setShadeMeltPercent(0);
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      titleEn="Scientific Method Laboratory"
      titleNe="वैज्ञानिक पद्धति प्रयोगशाला"
      learningAreaEn="Scientific Learning"
      learningAreaNe="वैज्ञानिक सिकाइ"
      currentStage={stage}
      onStageChange={handleStageChange}
      lang={lang}
      onLanguageToggle={() => {
        setLang(l => (l === 'en' ? 'ne' : 'en'));
        ScienceAudio.playClick();
      }}
      stars={stars}
      isCompleted={isCompleted}
      onBackToLibrary={onBackToLibrary}
    >
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 390px', gap: '16px', padding: '16px', height: '100%', overflow: 'hidden' }}>
        {/* 2D Canvas Viewport */}
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <canvas
            ref={canvasRef}
            width={720}
            height={520}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Step 3: Hypothesis Selection */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              {lang === 'en' ? 'Step 3: State Your Hypothesis' : 'चरण ३: आफ्नो परिकल्पना छान्नुहोस्'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {[
                { id: 'sunlight_faster', en: 'Hypothesis A: Sunlight melts ice faster (घाममा छिटो पग्लन्छ)', ne: 'परिकल्पना क: घाममा बरफ छिटो पग्लन्छ' },
                { id: 'shade_faster', en: 'Hypothesis B: Shade melts ice faster (छायाँमा छिटो पग्लन्छ)', ne: 'परिकल्पना ख: छायाँमा बरफ छिटो पग्लन्छ' },
              ].map(h => (
                <button
                  key={h.id}
                  onClick={() => {
                    setHypothesis(h.id as any);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: hypothesis === h.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: hypothesis === h.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: hypothesis === h.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {lang === 'en' ? h.en : h.ne}
                </button>
              ))}
            </div>

            {/* Run Experiment & Reset */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsRunning(r => !r);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isRunning ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Play size={14} />
                {isRunning
                  ? (lang === 'en' ? 'Pause Timer' : 'रोक्नुहोस्')
                  : (lang === 'en' ? 'Start Experiment' : 'प्रयोग सुरु')}
              </button>

              <button
                onClick={handleReset}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={14} />
                {lang === 'en' ? 'Reset' : 'पुनः सुरु'}
              </button>
            </div>
          </div>

          {/* 7-Step Cycle Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={16} />
              {lang === 'en' ? '7 Steps of the Scientific Method' : 'वैज्ञानिक पद्धतिका ७ चरणहरू'}
            </h4>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
              <div>1. Observation (अवलोकन)</div>
              <div>2. Question (जिज्ञासा)</div>
              <div>3. Hypothesis (परिकल्पना)</div>
              <div>4. Controlled Experiment (नियन्त्रित प्रयोग)</div>
              <div>5. Data Collection & Graphing (तथ्याङ्क सङ्कलन)</div>
              <div>6. Conclusion (निष्कर्ष)</div>
              <div>7. Communication (सञ्चार)</div>
            </div>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: What is Science?' : '१. खोज: विज्ञान के हो?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Testing the Hypothesis' : '२. अन्वेषण: परिकल्पना परीक्षण')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Rates of Melting' : '३. अवलोकन: पग्लने गति')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Heat Transfer' : '४. बुझाइ: ताप स्थानान्तरण')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Method Quiz' : '५. चुनौती: वैज्ञानिक पद्धति प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Science is not just a collection of facts; it is an organized, evidence-based method of answering questions about nature.'
                  : 'विज्ञान केवल तथ्यहरूको सङ्ग्रह मात्र होइन; यो प्रकृतिका रहस्यहरू बुझ्न प्रमाणमा आधारित सुव्यवस्थित खोजी पद्धति हो।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'In a fair test, only ONE variable is changed (Independent: Sunlight vs Shade). All other factors like ice cube size are kept strictly equal!'
                  : 'निष्पक्ष प्रयोगका लागि केवल एउटा मात्र चर परिवर्तन गरिन्छ (घाम र छायाँ)। बरफको आकार र भाँडो जस्ता अन्य सबै चरहरू ठ्याक्कै बराबर राखिन्छ।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Notice how the ice in sunlight reaches 100% melted while the ice in the shade is only ~36% melted.'
                  : 'घाममा राखिएको बरफ १००% पग्लिँदा छायाँमा राखिएको बरफ जम्मा ३६% मात्र पग्लिएको हेर्नुहोस्।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Conclusion: Sunlight carries radiant thermal energy, speeding up heat transfer and melting the ice faster. Hypothesis supported!'
                  : 'निष्कर्ष: सूर्यको किरणमा विकिरण ताप ऊर्जा हुने हुनाले घाममा बरफ छिटो पग्लन्छ। हाम्रो परिकल्पना सही प्रमाणित भयो!')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'In a controlled scientific experiment, the factor that a scientist intentionally changes is called:'
                    : 'नियन्त्रित वैज्ञानिक प्रयोगमा वैज्ञानिकले जानीजानी परिवर्तन गर्ने चरलाई के भनिन्छ?'}
                </p>
                {[
                  { id: 1, en: 'Independent Variable (स्वतन्त्र चर)', ne: 'स्वतन्त्र चर (Independent Variable)' },
                  { id: 2, en: 'Controlled Variable (नियन्त्रित चर)', ne: 'नियन्त्रित चर (Controlled Variable)' },
                  { id: 3, en: 'Dependent Variable (आश्रित चर)', ne: 'आश्रित चर (Dependent Variable)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setQuizAnswer(opt.id);
                      if (opt.id === 1) {
                        ScienceAudio.playSuccess();
                        setStars(3);
                        setIsCompleted(true);
                      } else {
                        ScienceAudio.playWhoosh();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '6px',
                      borderRadius: '6px',
                      border: quizAnswer === opt.id
                        ? (opt.id === 1 ? '1px solid #22c55e' : '1px solid #ef4444')
                        : '1px solid rgba(255,255,255,0.1)',
                      background: quizAnswer === opt.id
                        ? (opt.id === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                        : 'rgba(15, 23, 42, 0.5)',
                      color: '#0f172a',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'en' ? opt.en : opt.ne}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};
