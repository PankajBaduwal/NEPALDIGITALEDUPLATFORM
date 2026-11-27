/**
 * SoilProfileExplorerSim.tsx
 * Simulation 44: 2D Soil Profile & Horizons Explorer (माटोको प्रोफाइल अन्वेषण)
 * Grade 6 Science • Unit 11: Earth and Space (पृथ्वी र अन्तरिक्ष)
 *
 * Full 2D Interactive Vertical Soil Pit featuring 5 distinct horizons:
 * 1. O Horizon: Organic litter & decomposed dark humus (जैविक तह, 0 - 5 cm)
 * 2. A Horizon: Topsoil rich in organic matter, microbes & plant roots (माथिल्लो माटो, 5 - 25 cm)
 * 3. B Horizon: Subsoil rich in clay, iron oxides & leached minerals (तल्लो माटो, 25 - 60 cm)
 * 4. C Horizon: Weathered parent rock fragments & gravel (टुक्रिएको चट्टानी तह, 60 - 100 cm)
 * 5. R Horizon: Solid unweathered bedrock base (मूल कडा चट्टान, 100+ cm)
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Layers, Sparkles, Sprout, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SoilHorizon {
  id: string;
  code: string;
  nameEn: string;
  nameNe: string;
  depthCm: string;
  color: string;
  yTopFrac: number;
  yBotFrac: number;
  roleEn: string;
  roleNe: string;
  compositionEn: string;
  compositionNe: string;
}

const SOIL_HORIZONS: SoilHorizon[] = [
  {
    id: 'o_horizon',
    code: 'O',
    nameEn: 'O Horizon (Organic Humus)',
    nameNe: 'ओ-तह: जैविक ह्युमस (Organic Layer)',
    depthCm: '0 – 5 cm',
    color: '#1c1917',
    yTopFrac: 0.15,
    yBotFrac: 0.25,
    roleEn: 'Surface litter layer formed from fallen leaves, twigs, and decomposing plant/animal remains.',
    roleNe: 'झरेका पातपतिङ्गर र जैविक अवशेष कुहिएर बनेको कालो ह्युमस तह।',
    compositionEn: 'High Humus & Organic Matter (> 20%)',
    compositionNe: 'ह्युमस र जैविक पदार्थ प्रशस्त',
  },
  {
    id: 'a_horizon',
    code: 'A',
    nameEn: 'A Horizon (Topsoil)',
    nameNe: 'ए-तह: माथिल्लो मलिलो माटो (Topsoil)',
    depthCm: '5 – 25 cm',
    color: '#451a03',
    yTopFrac: 0.25,
    yBotFrac: 0.45,
    roleEn: 'Most fertile layer critical for crops! Teeming with earthworms, fungi, bacteria, and active plant root systems.',
    roleNe: 'कृषिका लागि अति उर्वर तह, जहाँ बिरुवाका जरा, गँड्यौला र उपयोगी ब्याक्टेरिया हुन्छन्।',
    compositionEn: 'Humus mixed with sand, silt, and clay minerals',
    compositionNe: 'ह्युमस, बालुवा र माटोका मसिना कण',
  },
  {
    id: 'b_horizon',
    code: 'B',
    nameEn: 'B Horizon (Subsoil)',
    nameNe: 'बी-तह: तल्लो माटो (Subsoil)',
    depthCm: '25 – 60 cm',
    color: '#854d0e',
    yTopFrac: 0.45,
    yBotFrac: 0.70,
    roleEn: 'Subsoil accumulation zone where clay minerals, iron, and aluminium oxides leach down from above.',
    roleNe: 'माथिल्लो तहबाट बगेर आएको पाँगो, फलाम र खनिजहरू थुप्रिने रातो-पहेंलो माटोको तह।',
    compositionEn: 'Clay, iron oxides, and leached minerals (low humus)',
    compositionNe: 'चिम्ट्याइलो माटो र खनिज लवण (ह्युमस कम)',
  },
  {
    id: 'c_horizon',
    code: 'C',
    nameEn: 'C Horizon (Parent Rock Regolith)',
    nameNe: 'सी-तह: टुक्रिएको चट्टान (Weathered Rock)',
    depthCm: '60 – 100 cm',
    color: '#713f12',
    yTopFrac: 0.70,
    yBotFrac: 0.88,
    roleEn: 'Partially weathered chunks and boulders of parent rock undergoing pedogenesis. No organic life.',
    roleNe: 'माटो बन्ने क्रममा रहेका टुक्रा-टुक्रा चट्टान र ढुङ्गाका ठूला टुक्राहरू।',
    compositionEn: 'Partially broken rock boulders, stones, and gravel',
    compositionNe: 'ढुङ्गा, गिट्टी र बालुवाका ठूला कण',
  },
  {
    id: 'r_horizon',
    code: 'R',
    nameEn: 'R Horizon (Bedrock Base)',
    nameNe: 'आर-तह: मूल कडा चट्टान (Bedrock)',
    depthCm: '100+ cm',
    color: '#475569',
    yTopFrac: 0.88,
    yBotFrac: 1.0,
    roleEn: 'Continuous, solid unweathered bedrock layer forming the geological foundation.',
    roleNe: 'नटुक्रिएको मूल कडा चट्टानी आधार तह, जसलाई खन्न निकै कठिन हुन्छ।',
    compositionEn: 'Solid unweathered granite, basalt, or limestone',
    compositionNe: 'कडा ग्रेनाइट, चुनढुङ्गा वा अन्य मूल चट्टान',
  },
];

export const SoilProfileExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Selected Horizon
  const [activeCode, setActiveCode] = useState<string>('A');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentHorizon = SOIL_HORIZONS.find(h => h.code === activeCode) || SOIL_HORIZONS[1];

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

      // Lab background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Soil Pit Column placement
      const pitX = w * 0.38;
      const pitW = 240;
      const pitTopY = 40;
      const pitH = h - 80;

      // Surface vegetation (Grass & Crops) above O Horizon
      ctx.fillStyle = '#15803d';
      ctx.fillRect(pitX - 20, pitTopY - 6, pitW + 40, 6);

      // Grass blades
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      for (let g = pitX - 15; g <= pitX + pitW + 15; g += 10) {
        ctx.beginPath();
        ctx.moveTo(g, pitTopY - 6);
        ctx.lineTo(g + Math.sin(t * 3 + g) * 3, pitTopY - 22);
        ctx.stroke();
      }

      // Draw all 5 horizons in vertical stack
      SOIL_HORIZONS.forEach(hz => {
        const yStart = pitTopY + hz.yTopFrac * pitH;
        const yEnd = pitTopY + hz.yBotFrac * pitH;
        const hzHeight = yEnd - yStart;

        ctx.fillStyle = hz.color;
        ctx.fillRect(pitX, yStart, pitW, hzHeight);

        // Highlight active selected horizon
        if (hz.code === activeCode) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.strokeRect(pitX, yStart, pitW, hzHeight);

          // Glowing border tag
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fillRect(pitX, yStart, pitW, hzHeight);
        }

        // Texture particles in horizons
        if (hz.code === 'O') {
          // Fallen dry leaves & organic bits
          ctx.fillStyle = '#ca8a04';
          for (let leaf = 0; leaf < 12; leaf++) {
            const lx = pitX + 15 + ((leaf * 37) % (pitW - 30));
            const ly = yStart + 8 + ((leaf * 19) % (hzHeight - 16));
            ctx.fillRect(lx, ly, 6, 2);
          }
        } else if (hz.code === 'A') {
          // Plant roots branching
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          for (let r = 0; r < 5; r++) {
            const rx = pitX + 35 + r * 45;
            ctx.beginPath();
            ctx.moveTo(rx, yStart);
            ctx.lineTo(rx - 10, yStart + hzHeight * 0.7);
            ctx.moveTo(rx, yStart);
            ctx.lineTo(rx + 15, yStart + hzHeight * 0.5);
            ctx.stroke();
          }

          // Earthworm
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(pitX + 110, yStart + 25);
          ctx.quadraticCurveTo(pitX + 125, yStart + 35 + Math.sin(t * 5) * 4, pitX + 140, yStart + 25);
          ctx.stroke();
        } else if (hz.code === 'C') {
          // Weathered rock boulders
          ctx.fillStyle = '#475569';
          for (let b = 0; b < 6; b++) {
            const bx = pitX + 25 + ((b * 53) % (pitW - 50));
            const by = yStart + 12 + ((b * 31) % (hzHeight - 24));
            ctx.beginPath();
            ctx.arc(bx, by, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (hz.code === 'R') {
          // Solid bedrock cracks
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pitX + 40, yStart + 10);
          ctx.lineTo(pitX + 180, yStart + 25);
          ctx.stroke();
        }

        // Horizon Code Badge on the left
        ctx.fillStyle = hz.code === activeCode ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(hz.code, pitX - 35, yStart + hzHeight * 0.55);

        ctx.font = '10px sans-serif';
        ctx.fillText(hz.depthCm, pitX - 65, yStart + hzHeight * 0.55 + 14);
      });

      // Pit boundary outer frame
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(pitX, pitTopY + SOIL_HORIZONS[0].yTopFrac * pitH, pitW, pitH * 0.85);

      // Depth Measuring Ruler alongside the pit
      const rulerX = pitX + pitW + 15;
      const rulerY = pitTopY + SOIL_HORIZONS[0].yTopFrac * pitH;
      const rulerH = pitH * 0.85;

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rulerX, rulerY);
      ctx.lineTo(rulerX, rulerY + rulerH);
      ctx.stroke();

      for (let d = 0; d <= 100; d += 20) {
        const dy = rulerY + (d / 100) * rulerH;
        ctx.beginPath();
        ctx.moveTo(rulerX, dy);
        ctx.lineTo(rulerX + 12, dy);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${d}cm`, rulerX + 16, dy + 3);
      }

      // Live metrics HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 240, 85, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Active Horizon:' : 'चयन गरिएको तह:', 32, 40);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${currentHorizon.nameEn}`, 32, 60);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Depth Range:' : 'गहिराइ:'} ${currentHorizon.depthCm}`, 32, 80);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [activeCode, currentHorizon, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  return (
    <SimulationLayout
      titleEn="Soil Profile & Horizons Explorer"
      titleNe="माटोको प्रोफाइल अन्वेषण"
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
          {/* Horizon Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} />
              {lang === 'en' ? 'Select Soil Horizon Layer' : 'माटोको तह (Horizon) छान्नुहोस्'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SOIL_HORIZONS.map(hz => (
                <button
                  key={hz.code}
                  onClick={() => {
                    setActiveCode(hz.code);
                    ScienceAudio.playClick();
                    if (!isCompleted) {
                      setIsCompleted(true);
                      setStars(3);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: activeCode === hz.code ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: activeCode === hz.code ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: activeCode === hz.code ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div>{lang === 'en' ? hz.nameEn : hz.nameNe}</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                      {lang === 'en' ? hz.compositionEn : hz.compositionNe}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#f59e0b' }}>{hz.depthCm}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Educational Role Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? currentHorizon.nameEn : currentHorizon.nameNe}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en' ? currentHorizon.roleEn : currentHorizon.roleNe}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: What is a Soil Profile?' : '१. खोज: माटोको प्रोफाइल के हो?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: The 5 Horizons (O,A,B,C,R)' : '२. अन्वेषण: ५ तहहरू (O,A,B,C,R)')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Topsoil vs Bedrock' : '३. अवलोकन: मलिलो माटो र कडा चट्टान')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Organic Humus' : '४. बुझाइ: ह्युमसको भूमिका')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Horizons Quiz' : '५. चुनौती: माटो तह प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'A vertical cross-section of the earth that displays all the distinct layers from surface humus to solid bedrock is called a Soil Profile.'
                  : 'जमिनको सतहदेखि मूल कडा चट्टानसम्म ठाडो गरी काट्दा देखिने माटोका विभिन्न तहहरूको दृश्यलाई माटोको प्रोफाइल (Soil Profile) भनिन्छ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Click through O, A, B, C, R. Notice how color changes from pitch black (humus) to rich brown (topsoil), reddish-yellow (subsoil), and gray (bedrock).'
                  : 'O, A, B, C, R तहहरू छान्नुहोस्। सतहको कालो ह्युमसबाट बिस्तारै खैरो, रातो-पहेंलो हुँदै कडा चट्टानको खरानी रङ्गमा बदलिएको हेर्नुहोस्।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'The A-Horizon (Topsoil) is the life-support layer of Nepal’s agriculture, containing plant roots and earthworms.'
                  : 'ए-तह (Topsoil) नेपालको कृषिको मुटु हो, जहाँ बिरुवाका जरा र गँड्यौलाहरू पाइन्छन्।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Rainwater dissolves minerals from upper layers and leaches them down into the B-Horizon.'
                  : 'वर्षाको पानीले माथिल्लो तहका खनिज पदार्थहरू पगालेर बी-तह (Subsoil) मा लगेर जम्मा गर्दछ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Which soil horizon contains the highest concentration of organic matter, earthworms, and plant roots?'
                    : 'कुन चाहिँ माटोको तहमा बिरुवाका जरा, गँड्यौला र सबैभन्दा धेरै जैविक मलिलो पदार्थ हुन्छ?'}
                </p>
                {[
                  { id: 1, en: 'A Horizon (Topsoil / माथिल्लो माटो)', ne: 'ए-तह: माथिल्लो माटो (Topsoil)' },
                  { id: 2, en: 'C Horizon (Parent Rock)', ne: 'सी-तह: चट्टानी तह' },
                  { id: 3, en: 'R Horizon (Bedrock)', ne: 'आर-तह: मूल चट्टान' },
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
