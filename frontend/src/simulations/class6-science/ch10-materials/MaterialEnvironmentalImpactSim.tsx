/**
 * MaterialEnvironmentalImpactSim.tsx
 * Simulation 39: 2D Material Environmental Impact & Degradation Timeline
 * Grade 6 Science • Unit 10: Materials in Daily Life
 *
 * Full 2D Interactive Environmental Timeline Simulator:
 * 1. Decomposition Timeline Simulator:
 *    - Banana Peels (2-4 weeks) -> Rich Humus
 *    - Paper Notebook (2 months) -> Decomposed
 *    - Sal Leaf Tapari -> 100% natural organic compost
 *    - Aluminium Can (100 years)
 *    - Single-use Plastic Bottle (450 years!) -> Toxic Microplastics
 * 2. Nepalese Sustainable Alternatives: Sal leaf tapari vs Styrofoam plate, Jute bag vs Polythene
 * 3. Scrubbable Timeline from Day 0 to 500 Years with soil cross-section
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Clock, AlertTriangle, Leaf, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';

interface DegradationItem {
  id: string;
  nameEn: string;
  nameNe: string;
  timeEn: string;
  timeNe: string;
  maxYears: number;
  isEco: boolean;
  color: string;
}

const DEGRADATION_ITEMS: DegradationItem[] = [
  {
    id: 'food_peel',
    nameEn: 'Banana & Food Waste',
    nameNe: 'तरकारी र फलफूलको बोक्रा',
    timeEn: '2 to 4 weeks (Composts into rich soil)',
    timeNe: '2 देखि 4 हप्ता (कुहिएर मल बन्छ)',
    maxYears: 0.08,
    isEco: true,
    color: '#ca8a04',
  },
  {
    id: 'sal_tapari',
    nameEn: 'Sal Leaf Tapari',
    nameNe: 'सालको पातको दुना-टपरी',
    timeEn: '3 to 6 weeks (100% natural organic)',
    timeNe: '3 देखि 6 हप्ता (प्राकृतिक जैविक)',
    maxYears: 0.12,
    isEco: true,
    color: '#16a34a',
  },
  {
    id: 'paper',
    nameEn: 'Paper & Cardboard',
    nameNe: 'कागज तथा कापीका पाना',
    timeEn: '1 to 2 months',
    timeNe: '1 देखि 2 महिना',
    maxYears: 0.17,
    isEco: true,
    color: '#0f172a',
  },
  {
    id: 'can',
    nameEn: 'Aluminium Beverage Can',
    nameNe: 'आल्मुनियमको क्यान',
    timeEn: '80 to 100 years',
    timeNe: '80 देखि 100 वर्ष',
    maxYears: 90,
    isEco: false,
    color: '#64748b',
  },
  {
    id: 'plastic_bottle',
    nameEn: 'Plastic PET Water Bottle',
    nameNe: 'प्लास्टिकको पानी बोतल',
    timeEn: '450+ years! (Forms microplastics)',
    timeNe: '450+ वर्ष!',
    maxYears: 450,
    isEco: false,
    color: '#38bdf8',
  },
];

export const MaterialEnvironmentalImpactSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Selected Material & Elapsed Time in years (0 to 500)
  const [selectedItemId, setSelectedItemId] = useState<string>('sal_tapari');
  const [elapsedYears, setElapsedYears] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentItem = DEGRADATION_ITEMS.find(i => i.id === selectedItemId) || DEGRADATION_ITEMS[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Time advancement ticker
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedYears(prev => {
          const step = currentItem.maxYears < 1 ? 0.01 : currentItem.maxYears < 100 ? 2 : 10;
          const next = prev + step;
          if (next >= (currentItem.maxYears < 1 ? 0.25 : 500)) {
            setIsPlaying(false);
            if (!isCompleted) {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }
            return currentItem.maxYears < 1 ? 0.25 : 500;
          }
          return Math.round(next * 100) / 100;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentItem, isCompleted]);

  // Compute degradation progress (0 to 1)
  const degradationRatio = Math.min(1, elapsedYears / currentItem.maxYears);

  // 2D Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Sky & Nature backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Distant Himalayan hills
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.lineTo(w * 0.2, h * 0.35);
      ctx.lineTo(w * 0.45, h * 0.45);
      ctx.lineTo(w * 0.75, h * 0.32);
      ctx.lineTo(w, h * 0.45);
      ctx.closePath();
      ctx.fill();

      // Soil Cross-section (Topsoil O-Horizon + Subsoil B-Horizon)
      const soilTopY = h * 0.45;
      const soilGrad = ctx.createLinearGradient(0, soilTopY, 0, h);
      soilGrad.addColorStop(0, '#15803d'); // grass layer
      soilGrad.addColorStop(0.04, '#451a03'); // rich organic topsoil
      soilGrad.addColorStop(0.35, '#78350f'); // subsoil
      soilGrad.addColorStop(1, '#292524'); // deep bedrock
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, soilTopY, w, h - soilTopY);

      // Soil layer textures (gravel pebbles & organic specks)
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let p = 0; p < 40; p++) {
        const px = (p * 47) % w;
        const py = soilTopY + 30 + ((p * 31) % (h - soilTopY - 40));
        ctx.beginPath();
        ctx.arc(px, py, (p % 4) + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soil trench / decomposition pit in center
      const pitX = w * 0.5;
      const pitY = soilTopY + 60;

      // Object rendering inside soil pit based on degradationRatio
      ctx.save();
      ctx.translate(pitX, pitY);

      const objectAlpha = Math.max(0.05, 1 - degradationRatio * 0.95);
      ctx.globalAlpha = objectAlpha;

      if (currentItem.id === 'sal_tapari') {
        // Sal Leaf Tapari: Green plate stitched with bamboo pins
        ctx.fillStyle = degradationRatio > 0.6 ? '#78350f' : degradationRatio > 0.3 ? '#854d0e' : '#16a34a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 70, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sal leaf radial leaf veins
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        for (let v = 0; v < 6; v++) {
          const ang = (v * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * 60, Math.sin(ang) * 20);
          ctx.stroke();
        }
      } else if (currentItem.id === 'food_peel') {
        // Banana Peel: Yellow curving arc, turns brown/black then breaks into humus
        ctx.fillStyle = degradationRatio > 0.4 ? '#451a03' : '#ca8a04';
        ctx.beginPath();
        ctx.moveTo(-50, -10);
        ctx.quadraticCurveTo(0, 30, 50, -15);
        ctx.quadraticCurveTo(10, 15, -50, -10);
        ctx.closePath();
        ctx.fill();
      } else if (currentItem.id === 'paper') {
        // Notebook Paper: White rectangular sheet with blue rule lines
        ctx.fillStyle = degradationRatio > 0.5 ? '#a16207' : '#f8fafc';
        ctx.fillRect(-50, -35, 100, 70);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-50, -35, 100, 70);
      } else if (currentItem.id === 'can') {
        // Aluminium Beverage Can: Silver metallic cylinder
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-35, -50, 70, 100);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(0, -50, 35, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeRect(-35, -50, 70, 100);
      } else if (currentItem.id === 'plastic_bottle') {
        // PET Plastic Bottle: Cyan transparent bottle with ribbed curves
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        // Bottle body
        ctx.beginPath();
        ctx.roundRect(-28, -40, 56, 85, 8);
        ctx.fill();
        ctx.stroke();
        // Bottle neck & cap
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-10, -55, 20, 15);
      }
      ctx.restore();

      // If decomposing organic, show rich dark compost blending into surrounding earth
      if (currentItem.isEco && degradationRatio > 0.5) {
        ctx.fillStyle = 'rgba(69, 26, 3, 0.7)';
        ctx.beginPath();
        ctx.ellipse(pitX, pitY, 90 * degradationRatio, 35 * degradationRatio, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? '🌱 Organic Compost' : '🌱 पूर्ण जैविक मल बन्यो', pitX - 75, pitY + 50);
      }

      // If plastic degrading after 100+ years, show microplastics spreading!
      if (!currentItem.isEco && currentItem.id === 'plastic_bottle' && elapsedYears > 50) {
        ctx.fillStyle = '#38bdf8';
        for (let m = 0; m < 35; m++) {
          const mx = pitX + (Math.sin(m * 3.7) * (120 + m * 2));
          const my = pitY + (Math.cos(m * 2.3) * (50 + m * 1.5));
          ctx.beginPath();
          ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(lang === 'en' ? '⚠ Toxic Microplastics Leaching into Soil' : '⚠ माटोमा विषालु माइक्रोप्लास्टिक फैलिँदै', pitX - 110, pitY + 70);
      }

      // Live metrics HUD in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 85, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Elapsed Time in Soil:' : 'माटोमा बितेको समय:', 32, 40);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      const timeStr = elapsedYears < 1
        ? `${Math.round(elapsedYears * 52)} ${lang === 'en' ? 'Weeks' : 'हप्ता'}`
        : `${Math.round(elapsedYears)} ${lang === 'en' ? 'Years' : 'वर्ष'}`;
      ctx.fillText(timeStr, 32, 64);

      ctx.fillStyle = currentItem.isEco ? '#34d399' : '#f87171';
      ctx.font = 'bold 11px sans-serif';
      const statusText = degradationRatio >= 1
        ? (lang === 'en' ? '✓ 100% Fully Decomposed' : '✓ पूर्ण रूपमा कुहिएर नष्ट')
        : `${Math.round(degradationRatio * 100)}% ${lang === 'en' ? 'Degraded' : 'कुहिएको'}`;
      ctx.fillText(statusText, 32, 85);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [currentItem, elapsedYears, degradationRatio, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedYears(0);
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      titleEn="Material Environmental Impact Simulator"
      titleNe="सामग्री र वातावरणीय प्रभाव"
      learningAreaEn="Materials"
      learningAreaNe="पदार्थका स्रोतहरू र प्रयोग"
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
          {/* Material Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Leaf size={18} />
              {lang === 'en' ? 'Select Material to Test' : 'परीक्षण गर्न वस्तु छान्नुहोस्'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {DEGRADATION_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    handleReset();
                    ScienceAudio.playClick();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: selectedItemId === item.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedItemId === item.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: selectedItemId === item.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div>{lang === 'en' ? item.nameEn : item.nameNe}</div>
                    <div style={{ fontSize: '9px', color: item.isEco ? '#34d399' : '#f87171', marginTop: '2px' }}>
                      {item.isEco ? '🌱 Biodegradable' : '⚠ Non-Biodegradable'} • {lang === 'en' ? item.timeEn : item.timeNe}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Time Control Slider & Play Button */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="#38bdf8" />
                  {lang === 'en' ? 'Timeline Scrub:' : 'समय नियन्त्रक:'}
                </span>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>
                  {elapsedYears < 1 ? `${Math.round(elapsedYears * 52)} wks` : `${Math.round(elapsedYears)} yrs`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={currentItem.maxYears < 1 ? '0.25' : '500'}
                step={currentItem.maxYears < 1 ? '0.01' : '5'}
                value={elapsedYears}
                onChange={e => {
                  setElapsedYears(Number(e.target.value));
                  ScienceAudio.playClick();
                }}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            {/* Play & Reset Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsPlaying(p => !p);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isPlaying ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)',
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
                <Clock size={14} />
                {isPlaying
                  ? (lang === 'en' ? 'Pause Time' : 'समय रोक्नुहोस्')
                  : (lang === 'en' ? 'Fast-Forward Time' : 'समय अगाडि बढाउनुहोस्')}
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
                {lang === 'en' ? 'Reset to Day 0' : 'सुरुवातमा फर्कनुहोस्'}
              </button>
            </div>
          </div>

          {/* Sustainable Nepal Alternatives Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={16} />
              {lang === 'en' ? 'Sustainable Nepal Heritage' : 'नेपाली मौलिक दिगो विकल्प'}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Nepal has centuries of eco-friendly traditions! Sal leaf Duna-Tapari completely biodegrades into natural fertilizer in just 4 weeks, unlike single-use Styrofoam plates which pollute the earth for 500+ years.'
                : 'नेपालमा परापूर्वकालदेखि वातावरणमैत्री परम्परा छ! सालको पातबाट बनेका दुना-टपरी 4 हप्तामै कुहिएर प्राङ्गारिक मल बन्छन्, तर प्लास्टिक तथा थर्मोकोलका प्लेटहरू 500 वर्षसम्म पनि सड्दैनन्।'}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Waste Persistence' : '1. खोज: फोहोरको आयु')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Decomposition Rate' : '2. अन्वेषण: कुहिने गति')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Microplastics Threat' : '3. अवलोकन: माइक्रोप्लास्टिक खतरा')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: 3R & Alternatives' : '4. बुझाइ: 3R र विकल्पहरू')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Ecology Quiz' : '5. चुनौती: वातावरण प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Biodegradable materials come from living plants and animals and can be decomposed by microorganisms (bacteria and fungi).'
                  : 'जैविक रूपमा सड्ने वस्तुहरू वनस्पति र जीवबाट बन्दछन् र सूक्ष्म जीवाणुहरूले तिनलाई सजिलै कुहाएर मल बनाउँछन्।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Compare the timeline of a banana peel (4 weeks) versus a plastic bottle (450 years). Notice the astronomical difference!'
                  : 'केराको बोक्रा (4 हप्ता) र प्लास्टिकको बोतल (450 वर्ष) बीचको समय दाँज्नुहोस्। कति विशाल अन्तर छ!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Plastics do not truly disappear; sunlight breaks them down into microscopic toxic beads called microplastics.'
                  : 'प्लास्टिक कहिल्यै पुरै नष्ट हुँदैन; घाम र हावाले यसलाई मसिना विषालु कण "माइक्रोप्लास्टिक" मा टुक्राउँछ।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Practice the 3Rs: Reduce single-use items, Reuse bags and bottles, and Recycle aluminium and paper.'
                  : '3R सिद्धान्त अपनाऔं: प्लास्टिक प्रयोग घटाऔं (Reduce), पुनःप्रयोग गरौं (Reuse), र प्रशोधन गरौं (Recycle)।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Approximately how long does a discarded plastic water bottle take to decompose in soil?'
                    : 'माटोमा फालिएको एउटा प्लास्टिकको पानी बोतल कुहिन लगभग कति वर्ष लाग्छ?'}
                </p>
                {[
                  { id: 1, en: '450+ Years', ne: '450+ वर्ष' },
                  { id: 2, en: '2 Years', ne: '2 वर्ष' },
                  { id: 3, en: '6 Months', ne: '6 महिना' },
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
