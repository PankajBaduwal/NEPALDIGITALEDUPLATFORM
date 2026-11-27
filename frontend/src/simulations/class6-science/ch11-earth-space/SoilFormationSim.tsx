/**
 * SoilFormationSim.tsx
 * Simulation 43: 2D Soil Formation & Weathering Simulator
 * Grade 6 Science • Unit 11: Earth and Space
 *
 * Full 2D Interactive Pedogenesis Simulation featuring:
 * 1. Physical Weathering: Freeze-thaw frost wedging & thermal expansion
 * 2. Chemical Weathering: Acid rain and mineral hydration
 * 3. Biological Weathering: Lichen acids and tree root intrusion
 * 4. Humus Formation: Decayed organic litter enriching fine rock powder into fertile soil over 500+ years
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Mountain, CloudRain, Sprout, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

type WeatheringType = 'physical' | 'chemical' | 'biological';

export const SoilFormationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Pedogenesis Parameters
  const [yearsElapsed, setYearsElapsed] = useState<number>(150); // 0 to 500 years
  const [activeWeathering, setActiveWeathering] = useState<WeatheringType>('physical');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // Soil depth generated: ~2.5 cm per 500 years
  const soilDepthCm = parseFloat(((yearsElapsed / 500) * 3.5).toFixed(2));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

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

      // Sky & Mountain backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Himalayan snow peaks in background
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.lineTo(w * 0.25, h * 0.18);
      ctx.lineTo(w * 0.5, h * 0.45);
      ctx.lineTo(w * 0.75, h * 0.12);
      ctx.lineTo(w, h * 0.45);
      ctx.closePath();
      ctx.fill();

      // Lower Bedrock Base (Parent Rock - Granite / Limestone)
      const baseGroundY = h - 60;
      const rockTopY = h * 0.45;

      // Solid Bedrock Layer
      const rockGrad = ctx.createLinearGradient(0, rockTopY, 0, baseGroundY);
      rockGrad.addColorStop(0, '#64748b');
      rockGrad.addColorStop(0.5, '#475569');
      rockGrad.addColorStop(1, '#334155');
      ctx.fillStyle = rockGrad;
      ctx.fillRect(40, rockTopY, w - 80, baseGroundY - rockTopY);

      // Crack fissures in the bedrock (expands with years and weathering)
      const crackProg = yearsElapsed / 500;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2 + crackProg * 4;

      // Vertical & diagonal rock cracks
      for (let c = 1; c <= 4; c++) {
        const cxPos = 80 + c * 110;
        ctx.beginPath();
        ctx.moveTo(cxPos, rockTopY);
        ctx.lineTo(cxPos - 20, rockTopY + 40);
        ctx.lineTo(cxPos + 15, rockTopY + 90);
        ctx.lineTo(cxPos - 10, rockTopY + 140);
        ctx.stroke();

        // Secondary branches
        if (crackProg > 0.3) {
          ctx.beginPath();
          ctx.moveTo(cxPos - 20, rockTopY + 40);
          ctx.lineTo(cxPos - 45, rockTopY + 70);
          ctx.stroke();
        }
      }

      // Weathering specific visual animations
      const cx = w * 0.5;
      if (activeWeathering === 'physical') {
        // Frost wedging: Ice expanding inside cracks
        ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
        for (let c = 1; c <= 4; c++) {
          const cxPos = 80 + c * 110;
          ctx.fillRect(cxPos - 6, rockTopY + 10, 12, 35);
        }

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? '❄ Freeze-Thaw Frost Wedging' : '❄ तुषार र चिसोले चट्टान चिरिने', cx - 100, rockTopY - 20);
      } else if (activeWeathering === 'chemical') {
        // Raindrops reacting with rock surface
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
        ctx.lineWidth = 2;
        for (let r = 0; r < 20; r++) {
          const rx = 60 + ((r * 31 + t * 40) % (w - 120));
          const ry = rockTopY - 30 + ((t * 80 + r * 15) % 35);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 10);
          ctx.stroke();
        }

        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? '💧 Carbonic Acid & Chemical Dissolution' : '💧 अम्ल वर्षा र रासायनिक घोल प्रक्रिया', cx - 130, rockTopY - 20);
      } else if (activeWeathering === 'biological') {
        // Lichen and moss on surface + intrusive plant roots
        ctx.fillStyle = '#84cc16';
        for (let m = 0; m < 15; m++) {
          const mx = 60 + m * 38;
          ctx.beginPath();
          ctx.arc(mx, rockTopY - 2, 8, 0, Math.PI);
          ctx.fill();
        }

        // Intrusive Tree Roots entering cracks
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        for (let c = 1; c <= 4; c++) {
          const cxPos = 80 + c * 110;
          ctx.beginPath();
          ctx.moveTo(cxPos, rockTopY);
          ctx.lineTo(cxPos - 15, rockTopY + 50);
          ctx.lineTo(cxPos + 8, rockTopY + 110);
          ctx.stroke();
        }

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? '🌱 Lichens, Mosses & Root Wedging' : '🌱 झ्याउ र जराले चट्टान फुटाउने', cx - 110, rockTopY - 20);
      }

      // Soil Layer Formed at top (Grows downward with years)
      const maxSoilPx = 75;
      const currentSoilPx = (yearsElapsed / 500) * maxSoilPx;

      if (currentSoilPx > 4) {
        // Dark Rich Loam Soil
        const soilGrad = ctx.createLinearGradient(0, rockTopY - currentSoilPx, 0, rockTopY);
        soilGrad.addColorStop(0, '#1c1917'); // Dark organic humus
        soilGrad.addColorStop(0.7, '#451a03'); // Topsoil
        soilGrad.addColorStop(1, '#78350f'); // Weathered regolith fragments
        ctx.fillStyle = soilGrad;
        ctx.fillRect(40, rockTopY - currentSoilPx, w - 80, currentSoilPx);

        // Green Grass & Flowers growing on top of newly formed soil
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(40, rockTopY - currentSoilPx - 3, w - 80, 4);

        // Grass blades
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        for (let g = 50; g < w - 50; g += 15) {
          ctx.beginPath();
          ctx.moveTo(g, rockTopY - currentSoilPx - 2);
          ctx.lineTo(g + Math.sin(t * 4 + g) * 3, rockTopY - currentSoilPx - 10);
          ctx.stroke();
        }
      }

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
      ctx.fillText(lang === 'en' ? 'Time Horizon:' : 'समय अवधी:', 32, 40);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${yearsElapsed} ${lang === 'en' ? 'Years' : 'वर्ष'}`, 32, 60);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Soil Thickness Formed:' : 'बनेको माटोको तह:'} ${soilDepthCm} cm`, 32, 82);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(lang === 'en' ? 'Pedogenesis: 1 inch = 500+ years!' : '1 इन्च माटो बन्न 500+ वर्ष लाग्छ!', 32, 102);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [yearsElapsed, activeWeathering, soilDepthCm, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  return (
    <SimulationLayout
      titleEn="Soil Formation & Weathering Simulator"
      titleNe="माटो निर्माण प्रक्रिया सिमुलेटर"
      learningAreaEn="Earth and Space"
      learningAreaNe="पृथ्वी र अन्तरिक्ष"
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
          {/* Weathering Mechanism Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mountain size={18} />
              {lang === 'en' ? 'Weathering Mechanism' : 'क्षयीकरण प्रक्रिया'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {[
                { id: 'physical', en: '1. Physical Weathering', ne: '1. भौतिक क्षयीकरण (Frost & Heat)' },
                { id: 'chemical', en: '2. Chemical Weathering', ne: '2. रासायनिक क्षयीकरण (Acid Rain)' },
                { id: 'biological', en: '3. Biological Weathering', ne: '3. जैविक क्षयीकरण (Lichens & Roots)' },
              ].map(wItem => (
                <button
                  key={wItem.id}
                  onClick={() => {
                    setActiveWeathering(wItem.id as WeatheringType);
                    ScienceAudio.playClick();
                    if (!isCompleted) {
                      setIsCompleted(true);
                      setStars(3);
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: activeWeathering === wItem.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: activeWeathering === wItem.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: activeWeathering === wItem.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {lang === 'en' ? wItem.en : wItem.ne}
                </button>
              ))}
            </div>

            {/* Time Elapsed Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="#38bdf8" />
                  {lang === 'en' ? 'Geological Time Elapsed:' : 'बितेको समय:'}
                </span>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{yearsElapsed} Years</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={yearsElapsed}
                onChange={e => {
                  setYearsElapsed(Number(e.target.value));
                  ScienceAudio.playClick();
                }}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Geological Description Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? 'What is Pedogenesis?' : 'माटो निर्माण (Pedogenesis) के हो?'}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Soil is not just crushed rock! True soil requires centuries of weathering combined with biological decay (humus) from lichens, bacteria, and dead plant matter.'
                : 'माटो भनेको चट्टानको धूलो मात्र होइन! चट्टान फुटेर बनेका मसिना कणहरूमा वनस्पति र जीवका कुहिएका अवशेष (ह्युमस) मिसिएपछि मात्र उर्वर माटो बन्छ।'}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Where Soil Comes From' : '1. खोज: माटो कसरी बन्छ?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: 3 Weathering Paths' : '2. अन्वेषण: 3 क्षयीकरण विधि')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Time Scale (Centuries)' : '3. अवलोकन: समयको गति (शताब्दी)')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Biological Humus' : '4. बुझाइ: जैविक ह्युमसको महत्व')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Weathering Quiz' : '5. चुनौती: क्षयीकरण प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'All soil was once solid mountain bedrock. Weathering breaks big boulders into gravel, sand, silt, and fine clay.'
                  : 'पृथ्वीको सबै माटो पहिले कडा चट्टान थियो। घाम, पानी, हावा र जीवले गर्दा चट्टान फुटेर मसिना कण बन्दछन्।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'In the Himalayas, water seeps into rock cracks, freezes at night, expands by 9%, and wedges massive rocks apart!'
                  : 'हिमाली भेगमा चट्टानका चेपमा पसेको पानी राति जमेर बरफ बन्दा 9% ले फैलिन्छ र कडा चट्टानलाई पनि चक्नाचुर पार्छ!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Slide the time forward to 500 years. Notice how slowly soil forms—only about 2.5 to 3.5 cm of fertile soil in 500 years!'
                  : 'समयलाई 500 वर्षमा पुर्याउनुहोस्। हेर्नुहोस्, 500 वर्षमा मुस्किलले 2.5 देखि 3.5 से.मी. मात्र मलिलो माटो बन्न सक्छ!')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Because soil takes centuries to form, conserving it from erosion is vital for human survival and food security.'
                  : 'माटो बन्न शताब्दीयौं लाग्ने भएकाले यसलाई भू-क्षयबाट जोगाउनु मानव जीवन र खाद्य सुरक्षाका लागि अनिवार्य छ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Approximately how many years does nature take to form just 1 inch (2.5 cm) of fertile topsoil?'
                    : 'प्रकृतिमा केवल 1 इन्च (2.5 से.मी.) मलिलो माटो बन्न लगभग कति वर्ष लाग्छ?'}
                </p>
                {[
                  { id: 1, en: '500+ Years', ne: '500+ वर्ष' },
                  { id: 2, en: '5 Years', ne: '5 वर्ष' },
                  { id: 3, en: '1 Month', ne: '1 महिना' },
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
