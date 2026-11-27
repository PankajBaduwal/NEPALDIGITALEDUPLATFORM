/**
 * EverydayChemicalsSim.tsx
 * Simulation 38: 2D Everyday Chemicals Explorer (दैनिक जीवनका रसायनहरू)
 * Grade 6 Science • Unit 10: Materials in Daily Life (दैनिक जीवनमा प्रयोग हुने वस्तुहरू)
 *
 * Full 2D Interactive Household Chemistry featuring:
 * 1. Safe everyday chemicals: Salt (NaCl), Sugar, Baking Soda (NaHCO3), Soap, Lemon (Citric Acid), Vinegar
 * 2. Natural Indicator Test (बेसार / Turmeric): Yellow in acid/neutral -> Deep reddish-brown in basic soap!
 * 3. Litmus Paper pH indicator test (Blue to Red in acid, Red to Blue in base)
 * 4. CO2 Effervescence Reaction: Baking Soda + Vinegar fizzing bubbles!
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Beaker, Sparkles, Droplets, CheckCircle2 } from 'lucide-react';

interface ChemicalItem {
  id: string;
  nameEn: string;
  nameNe: string;
  formula: string;
  nature: 'acidic' | 'basic' | 'neutral';
  ph: number;
  useEn: string;
  useNe: string;
  color: string;
}

const CHEMICALS: ChemicalItem[] = [
  {
    id: 'salt',
    nameEn: 'Common Salt (नुन)',
    nameNe: 'खाना नुन',
    formula: 'NaCl (Sodium Chloride)',
    nature: 'neutral',
    ph: 7.0,
    useEn: 'Food seasoning, dehydration rehydration salts (Jeevan Jal), food preservation.',
    useNe: 'खानाको स्वाद, जीवनजल बनाउन, र खानेकुरा सुरक्षित राख्न।',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  {
    id: 'lemon',
    nameEn: 'Lemon Juice (कागती रस)',
    nameNe: 'कागतीको रस (सिट्रिक एसिड)',
    formula: 'C6H8O7 (Citric Acid)',
    nature: 'acidic',
    ph: 2.4,
    useEn: 'Vitamin C source, refreshing drinks, removes grease stains.',
    useNe: 'भिटामिन C को मुख्य स्रोत, अमिलो स्वाद र दाग हटाउन।',
    color: '#facc15',
  },
  {
    id: 'baking_soda',
    nameEn: 'Baking Soda (खाने सोडा)',
    nameNe: 'खाने सोडा (बेकिङ सोडा)',
    formula: 'NaHCO3 (Sodium Bicarbonate)',
    nature: 'basic',
    ph: 8.5,
    useEn: 'Puffs cakes & bread (releases CO2 bubbles), mild antacid for acidity.',
    useNe: 'पाउरोटी र केक फुलाउन (CO₂ ग्यास निकाल्ने) र ग्यास्ट्रिकमा प्रयोग।',
    color: '#e2e8f0',
  },
  {
    id: 'soap',
    nameEn: 'Soap Water (साबुन पानी)',
    nameNe: 'साबुन पानी (क्षारीय)',
    formula: 'Sodium Stearate (Alkaline)',
    nature: 'basic',
    ph: 9.8,
    useEn: 'Washing dirt, grease emulsification, killing germs and viruses.',
    useNe: 'हात धुन, लुगा सफा गर्न र कीटाणु नष्ट गर्न।',
    color: '#38bdf8',
  },
  {
    id: 'vinegar',
    nameEn: 'Vinegar (सिरका)',
    nameNe: 'सिरका (एसिटिक एसिड)',
    formula: 'CH3COOH (Acetic Acid)',
    nature: 'acidic',
    ph: 2.8,
    useEn: 'Pickle preservation, cooking, cleaning kitchen grease.',
    useNe: 'अचार सुरक्षित राख्न, खानाको स्वाद बढाउन र भान्सा सफा गर्न।',
    color: '#fbbf24',
  },
];

type IndicatorType = 'litmus_blue' | 'litmus_red' | 'turmeric';

export const EverydayChemicalsSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Selected chemical and active indicator test
  const [selectedChemId, setSelectedChemId] = useState<string>('lemon');
  const [indicator, setIndicator] = useState<IndicatorType>('litmus_blue');
  const [isDipped, setIsDipped] = useState<boolean>(false);
  const [isFizzing, setIsFizzing] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentChem = CHEMICALS.find(c => c.id === selectedChemId) || CHEMICALS[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const fizzParticlesRef = useRef<Array<{ x: number; y: number; r: number; speed: number }>>([]);

  // Compute test strip color after dipping
  const getStripColor = () => {
    if (!isDipped) {
      if (indicator === 'litmus_blue') return '#3b82f6';
      if (indicator === 'litmus_red') return '#ef4444';
      if (indicator === 'turmeric') return '#eab308'; // golden yellow
    }

    // After dipping:
    if (indicator === 'litmus_blue') {
      return currentChem.nature === 'acidic' ? '#ef4444' : '#3b82f6';
    }
    if (indicator === 'litmus_red') {
      return currentChem.nature === 'basic' ? '#3b82f6' : '#ef4444';
    }
    if (indicator === 'turmeric') {
      // Turmeric turns reddish brown in bases!
      return currentChem.nature === 'basic' ? '#b91c1c' : '#eab308';
    }
    return '#cbd5e1';
  };

  // 2D Canvas render loop
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

      // Lab Backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(0.7, '#f1f5f9');
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Tabletop
      const tableY = h - 60;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, tableY, w - 40, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, tableY + 20, w - 40, 40);

      // Beaker Center
      const bx = w * 0.45;
      const by = tableY - 180;
      const bw = 170;
      const bh = 180;
      const liquidH = 130;

      // Solution Liquid in Beaker
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx - bw / 2 + 6, by + bh - liquidH, bw - 12, liquidH - 4, [0, 0, 10, 10]);
      ctx.clip();

      const liqGrad = ctx.createLinearGradient(0, by + bh - liquidH, 0, by + bh);
      liqGrad.addColorStop(0, currentChem.color);
      liqGrad.addColorStop(1, 'rgba(15, 23, 42, 0.6)');
      ctx.fillStyle = liqGrad;
      ctx.fillRect(bx - bw / 2, by + bh - liquidH, bw, liquidH);

      // Fizzing CO2 gas bubbles (if fizzing triggered)
      if (isFizzing) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let b = 0; b < 25; b++) {
          const bxPos = bx - bw / 2 + 15 + ((b * 29 + Math.sin(t * 8 + b) * 8) % (bw - 30));
          const byPos = by + bh - ((t * 70 + b * 18) % liquidH);
          ctx.beginPath();
          ctx.arc(bxPos, byPos, (b % 3) + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Foam layer at top of liquid
        ctx.fillStyle = '#ffffff';
        for (let f = 0; f < 12; f++) {
          const fx = bx - bw / 2 + 12 + f * 12;
          const fy = by + bh - liquidH + Math.sin(t * 10 + f) * 3;
          ctx.beginPath();
          ctx.arc(fx, fy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Glass Beaker Outline
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2 - 8, by);
      ctx.lineTo(bx - bw / 2, by);
      ctx.lineTo(bx - bw / 2, by + bh - 10);
      ctx.arcTo(bx - bw / 2, by + bh, bx - bw / 2 + 10, by + bh, 10);
      ctx.lineTo(bx + bw / 2 - 10, by + bh);
      ctx.arcTo(bx + bw / 2, by + bh, bx + bw / 2, by + bh - 10, 10);
      ctx.lineTo(bx + bw / 2, by);
      ctx.lineTo(bx + bw / 2 + 8, by);
      ctx.stroke();

      // Measurement tick marks
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      for (let m = 1; m <= 4; m++) {
        const my = by + bh - m * 30;
        ctx.beginPath();
        ctx.moveTo(bx - bw / 2 + 4, my);
        ctx.lineTo(bx - bw / 2 + 18, my);
        ctx.stroke();
      }

      // Indicator Strip / Paper
      const stripW = 28;
      const stripH = 140;
      const stripY = isDipped ? by + bh - liquidH + 20 : by - 60;
      const stripX = bx;

      // Paper strip holder forceps / clip
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(stripX, stripY - 30);
      ctx.lineTo(stripX, stripY);
      ctx.stroke();

      // Upper dry strip part
      const defaultColor = indicator === 'litmus_blue' ? '#3b82f6' : indicator === 'litmus_red' ? '#ef4444' : '#eab308';
      ctx.fillStyle = defaultColor;
      ctx.fillRect(stripX - stripW / 2, stripY, stripW, stripH / 2);

      // Lower dipped strip part (changes color on dip)
      ctx.fillStyle = getStripColor();
      ctx.fillRect(stripX - stripW / 2, stripY + stripH / 2, stripW, stripH / 2);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(stripX - stripW / 2, stripY, stripW, stripH);

      // Dropper Bottle on left side of workbench
      const botX = bx - 140;
      const botY = tableY - 110;
      ctx.fillStyle = '#475569';
      ctx.fillRect(botX - 25, botY + 25, 50, 75);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(botX - 10, botY + 12, 20, 14); // neck
      // Dropper rubber bulb
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(botX, botY + 6, 12, 0, Math.PI * 2);
      ctx.fill();

      // Bottle label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(lang === 'en' ? 'REAGENT' : 'सूचक', botX - 18, botY + 65);

      // Color Indicator Tag on dipped strip
      if (isDipped) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(stripX + 24, stripY + stripH / 2, 170, 40, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        const resultText = indicator === 'turmeric'
          ? (currentChem.nature === 'basic' ? (lang === 'en' ? 'Reddish-Brown (Base)' : 'रातो-खैरो (क्षार)') : (lang === 'en' ? 'Stays Yellow (Acid/Neutral)' : 'पहेंलो नै रहन्छ'))
          : indicator === 'litmus_blue'
          ? (currentChem.nature === 'acidic' ? (lang === 'en' ? 'Turns Red (Acid)' : 'रातो बन्यो (अम्ल)') : (lang === 'en' ? 'Stays Blue' : 'नीलो नै रहन्छ'))
          : (currentChem.nature === 'basic' ? (lang === 'en' ? 'Turns Blue (Base)' : 'नीलो बन्यो (क्षार)') : (lang === 'en' ? 'Stays Red' : 'रातो नै रहन्छ'));

        ctx.fillText(resultText, stripX + 32, stripY + stripH / 2 + 18);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`pH: ${currentChem.ph} • Nature: ${currentChem.nature.toUpperCase()}`, stripX + 32, stripY + stripH / 2 + 32);
      }

      // pH Rainbow Gauge Bar on the right
      const phBarX = w - 65;
      const phBarY = 60;
      const phBarH = 340;
      const phBarW = 16;

      const phGrad = ctx.createLinearGradient(0, phBarY, 0, phBarY + phBarH);
      phGrad.addColorStop(0, '#ef4444'); // pH 0-2 (strong acid)
      phGrad.addColorStop(0.2, '#f97316'); // pH 3-5 (weak acid)
      phGrad.addColorStop(0.5, '#10b981'); // pH 7 (neutral green)
      phGrad.addColorStop(0.8, '#3b82f6'); // pH 9-11 (weak base)
      phGrad.addColorStop(1, '#7c3aed'); // pH 14 (strong base)

      ctx.fillStyle = phGrad;
      ctx.fillRect(phBarX, phBarY, phBarW, phBarH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(phBarX, phBarY, phBarW, phBarH);

      // Indicator pointer on pH bar for current chemical
      const needleY = phBarY + (currentChem.ph / 14) * phBarH;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(phBarX - 8, needleY);
      ctx.lineTo(phBarX - 2, needleY - 5);
      ctx.lineTo(phBarX - 2, needleY + 5);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`pH ${currentChem.ph}`, phBarX - 52, needleY + 4);

      // Labels on pH scale
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('0 Acid', phBarX - 2, phBarY - 6);
      ctx.fillText('7 Neutral', phBarX - 10, phBarY + phBarH * 0.5 + 4);
      ctx.fillText('14 Base', phBarX - 2, phBarY + phBarH + 14);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [currentChem, indicator, isDipped, isFizzing, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const triggerFizz = () => {
    setIsFizzing(true);
    ScienceAudio.playSuccess();
    setTimeout(() => {
      setIsFizzing(false);
    }, 3500);
  };

  return (
    <SimulationLayout
      titleEn="Everyday Chemicals Explorer"
      titleNe="दैनिक जीवनका रसायनहरू"
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
          {/* Chemical Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Beaker size={18} />
              {lang === 'en' ? 'Household Chemical Substance' : 'घरायसी रासायनिक पदार्थ'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
              {CHEMICALS.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedChemId(c.id);
                    setIsDipped(false);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: selectedChemId === c.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedChemId === c.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: selectedChemId === c.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>{lang === 'en' ? c.nameEn : c.nameNe}</div>
                  <div style={{ fontSize: '9px', color: c.nature === 'acidic' ? '#f87171' : c.nature === 'basic' ? '#60a5fa' : '#34d399', marginTop: '2px' }}>
                    {c.nature.toUpperCase()} • pH {c.ph}
                  </div>
                </button>
              ))}
            </div>

            {/* Indicator Selector */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 'bold' }}>
                {lang === 'en' ? 'Select Indicator Test:' : 'परीक्षण सूचक छान्नुहोस्:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {[
                  { id: 'litmus_blue', en: 'Blue Litmus', ne: 'नीलो लिटमस', col: '#3b82f6' },
                  { id: 'litmus_red', en: 'Red Litmus', ne: 'रातो लिटमस', col: '#ef4444' },
                  { id: 'turmeric', en: 'Turmeric (बेसार)', ne: 'बेसार सूचक', col: '#eab308' },
                ].map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => {
                      setIndicator(ind.id as IndicatorType);
                      setIsDipped(false);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: indicator === ind.id ? `2px solid ${ind.col}` : '1px solid rgba(255,255,255,0.1)',
                      background: indicator === ind.id ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.5)',
                      color: ind.col,
                      fontWeight: 'bold',
                      fontSize: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {lang === 'en' ? ind.en : ind.ne}
                  </button>
                ))}
              </div>
            </div>

            {/* Dip Action & Fizz Action */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsDipped(d => !d);
                  ScienceAudio.playClick();
                  if (!isCompleted) {
                    setIsCompleted(true);
                    setStars(3);
                  }
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isDipped ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
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
                <Droplets size={14} />
                {isDipped
                  ? (lang === 'en' ? 'Lift Strip' : 'पट्टी बाहिर झिक्नुहोस्')
                  : (lang === 'en' ? 'Dip Strip in Solution' : 'घोलमा पट्टी डुबाउनुहोस्')}
              </button>

              <button
                onClick={triggerFizz}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                {lang === 'en' ? 'Test CO2 Fizz' : 'CO₂ फिज निकाल्नुहोस्'}
              </button>
            </div>
          </div>

          {/* Educational Formula & Uses Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {currentChem.formula}
            </h4>
            <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>
              {lang === 'en' ? 'Common Uses & Function:' : 'दैनिक उपयोग:'}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en' ? currentChem.useEn : currentChem.useNe}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Chemistry at Home' : '१. खोज: घरमै पाइने रसायन')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Natural Indicators' : '२. अन्वेषण: प्राकृतिक सूचक')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Acid vs Base' : '३. अवलोकन: अम्ल र क्षार')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Safety & Uses' : '४. बुझाइ: सुरक्षा र उपयोगिता')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Chemicals Quiz' : '५. चुनौती: रसायन प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Our kitchens are mini chemistry labs! Salt, lemon, vinegar, and baking soda all contain well-defined chemical compounds.'
                  : 'हाम्रो भान्सा एउटा सानो रासायनिक प्रयोगशाला जस्तै हो! नुन, कागती, सिरका र सोडा सबैमा निश्चित रासायनिक यौगिकहरू हुन्छन्।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Turmeric is a natural pH indicator. Try dipping the turmeric strip into Soap Water—it instantly turns deep reddish-brown!'
                  : 'बेसार एउटा प्राकृतिक सूचक हो। बेसारको पट्टीलाई साबुन पानीमा डुबाएर हेर्नुहोस्—यसको रङ्ग तुरुन्तै गाढा रातो-खैरो हुन्छ!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Acids turn blue litmus red and taste sour. Bases turn red litmus blue, taste bitter, and feel slippery to touch.'
                  : 'अम्लले नीलो लिटमसलाई रातो बनाउँछ र अमिलो हुन्छ। क्षारले रातो लिटमसलाई नीलो बनाउँछ, तितो हुन्छ र चिप्लो महसुस हुन्छ।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'When baking soda (base) reacts with vinegar (acid), they rapidly neutralize and release sparkling Carbon Dioxide (CO2) bubbles!'
                  : 'खाने सोडा (क्षार) मा सिरका (अम्ल) मिसाउँदा दुवै बीच तीव्र रासायनिक प्रतिक्रिया भएर कार्बन डाइअक्साइड (CO₂) ग्यासको फिज आउँछ!')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'What happens when yellow turmeric paper is dipped into alkaline soap solution?'
                    : 'पहेंलो बेसारको कागजलाई साबुनको क्षारीय पानीमा डुबाउँदा के हुन्छ?'}
                </p>
                {[
                  { id: 1, en: 'It turns deep reddish-brown', ne: 'यो गाढा रातो-खैरो रङ्गमा बदलिन्छ' },
                  { id: 2, en: 'It turns green', ne: 'यो हरियो बन्छ' },
                  { id: 3, en: 'It turns blue', ne: 'यो नीलो बन्छ' },
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
