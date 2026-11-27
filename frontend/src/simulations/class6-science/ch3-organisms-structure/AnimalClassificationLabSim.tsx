/**
 * AnimalClassificationLabSim.tsx
 * Simulation 6: 2D Animal Classification Laboratory
 * Grade 6 Science • Unit 3: Organisms & Their Structure
 *
 * 100% Native HTML5 Canvas 2D Dental & Nutritional Morphology Simulator.
 * Features:
 * - 3 Real Nepal Wildlife Specimens: Spotted Deer (Herbivore), Royal Bengal Tiger (Carnivore), Himalayan Bear (Omnivore)
 * - Real photographic imagery with dental morphology X-Ray overlay
 * - Interactive Feeding Station (Grass/Leaves, Fresh Meat, Berries/Honey)
 * - Digestive Tract Comparative Gauge (Long Fermentation vs Short Acidic)
 * - Gold Standard Dark Educational Theme (#090d16, glowing sci-fi badges, 380px persistent sidebar)
 * - Bilingual EN/NE labels, scientific audio, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Utensils, RotateCcw, Apple, Drumstick, Cookie, Sparkles, Check, ShieldCheck, Award, Info } from 'lucide-react';

type DietCategory = 'herbivore' | 'carnivore' | 'omnivore';

interface DietProfile {
  id: DietCategory;
  nameEn: string;
  nameNe: string;
  animalEn: string;
  animalNe: string;
  dentitionEn: string;
  dentitionNe: string;
  digestiveEn: string;
  digestiveNe: string;
  favFood: 'grass' | 'meat' | 'mixed';
  imageUrl: string;
  fallbackUrl: string;
}

export const AnimalClassificationLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeCategory, setActiveCategory] = useState<DietCategory>('herbivore');
  const [inspectedCategories, setInspectedCategories] = useState<string[]>(['herbivore']);
  const [fedFood, setFedFood] = useState<string | null>(null);
  const [chewAnim, setChewAnim] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  const profiles: Record<DietCategory, DietProfile> = {
    herbivore: {
      id: 'herbivore',
      nameEn: 'Herbivore',
      nameNe: 'शाकाहारी (Herbivore)',
      animalEn: 'Spotted Deer',
      animalNe: 'चित्तल मृग (Spotted Deer)',
      dentitionEn: 'Flat, ridged grinding molars; sharp front incisors; diastema gap; NO tearing canines.',
      dentitionNe: 'घाँस काट्न अगाडिका दाँत र पिस्न पछाडिका फराकिला दाँत (Molars); बिचमा खाली ठाउँ (Diastema)।',
      digestiveEn: 'Very long digestive tract with multi-chambered stomach to ferment tough plant cellulose.',
      digestiveNe: 'घाँसको कडा सेलुलोज पचाउन लामो र जटिल पाचन नली।',
      favFood: 'grass',
      imageUrl: '/assets/simulations/animals/deer.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=600&q=80',
    },
    carnivore: {
      id: 'carnivore',
      nameEn: 'Carnivore',
      nameNe: 'मांसाहारी (Carnivore)',
      animalEn: 'Royal Bengal Tiger',
      animalNe: 'पाटे बाघ (Royal Bengal Tiger)',
      dentitionEn: 'Long dagger-like canines to pierce prey; sharp carnassial teeth to shear flesh and bone.',
      dentitionNe: 'मासु च्यात्न लामा धारिला दाँत (Canines) र मासु काट्ने कैंची जस्ता दाँत।',
      digestiveEn: 'Short simple acidic digestive tract (meat digests easily and quickly).',
      digestiveNe: 'मासु सजिलै पच्ने भएकाले छोटो र कडा अम्ल भएको पाचन नली।',
      favFood: 'meat',
      imageUrl: '/assets/simulations/animals/tiger.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80',
    },
    omnivore: {
      id: 'omnivore',
      nameEn: 'Omnivore',
      nameNe: 'सर्वहारी (Omnivore)',
      animalEn: 'Himalayan Black Bear',
      animalNe: 'हिमाली कालो भालु (Himalayan Bear)',
      dentitionEn: 'Versatile teeth: moderate incisors, gripping canines, and rounded flat grinding molars.',
      dentitionNe: 'सबै खानेकुरा खान मिल्ने मध्यम दाँत: फलफूल, मह, माछा र कीरा चपाउने फराकिला दाँत।',
      digestiveEn: 'Medium-length tract capable of processing both fibrous plants and animal protein.',
      digestiveNe: 'घाँसपात र मासु दुबै सजिलै पचाउन सक्ने मध्यम लम्बाइको पाचन नली।',
      favFood: 'mixed',
      imageUrl: '/assets/simulations/animals/bear.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=600&q=80',
    },
  };

  const currentProfile = profiles[activeCategory];

  // Preload images
  useEffect(() => {
    Object.values(profiles).forEach((p) => {
      if (!imagesRef.current[p.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = p.imageUrl;
        img.onerror = () => {
          img.src = p.fallbackUrl;
        };
        imagesRef.current[p.id] = img;
      }
    });
  }, []);

  const handleSelectCategory = (cat: DietCategory) => {
    ScienceAudio.playPop();
    setActiveCategory(cat);
    setFedFood(null);
    if (!inspectedCategories.includes(cat)) {
      const next = [...inspectedCategories, cat];
      setInspectedCategories(next);
      setStars(next.length);
      if (next.length === 3) {
        setIsCompleted(true);
        ScienceAudio.playSuccess();
        setStage('observe');
      }
    }
  };

  const handleFeed = (food: string) => {
    setFedFood(food);
    setChewAnim(1.0);
    ScienceAudio.playPop();
  };

  const handleReset = () => {
    setActiveCategory('herbivore');
    setInspectedCategories(['herbivore']);
    setFedFood(null);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      if (chewAnim > 0) {
        setChewAnim((prev) => Math.max(0, prev - 0.02));
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Clean luminous laboratory background with blueprint grid
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.5, '#f8fafc');
      bgGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle light grid lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Left Specimen Photography Card (Dark glassmorphic style)
      const cardX = 40;
      const cardY = 30;
      const cardW = 320;
      const cardH = 420;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      // Real wildlife photo
      const activeImg = imagesRef.current[activeCategory];
      if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX + 15, cardY + 15, cardW - 30, 240, 16);
        ctx.clip();
        ctx.drawImage(activeImg, cardX + 15, cardY + 15, cardW - 30, 240);
        ctx.restore();

        // Border around photo
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX + 15, cardY + 15, cardW - 30, 240, 16);
        ctx.stroke();
      }

      // Wildlife Species Title under photo
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(lang === 'ne' ? currentProfile.animalNe : currentProfile.animalEn, cardX + 20, cardY + 285);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(lang === 'ne' ? currentProfile.nameNe : currentProfile.nameEn, cardX + 20, cardY + 308);

      // Feeding indicator
      if (fedFood) {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 12px sans-serif';
        const foodLabel =
          fedFood === 'grass'
            ? (lang === 'ne' ? '🌿 घाँस/पात खाइरहेको छ...' : '🌿 Eating Grass/Plants...')
            : fedFood === 'meat'
            ? (lang === 'ne' ? '🥩 ताजा मासु खाइरहेको छ...' : '🥩 Eating Fresh Meat...')
            : (lang === 'ne' ? '🍯 फलफूल/मह खाइरहेको छ...' : '🍯 Eating Berries/Honey...');
        ctx.fillText(foodLabel, cardX + 20, cardY + 345);

        // Chew animation particles
        const chewOffset = Math.sin(time * 15) * 6 * chewAnim;
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(cardX + cardW - 40, cardY + 340 + chewOffset, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 11px sans-serif';
        ctx.fillText(
          lang === 'ne' ? 'दायाँबाट खाना छान्नुहोस् र खुवाउनुहोस्।' : 'Choose food on right panel to feed.',
          cardX + 20,
          cardY + 345
        );
      }

      // Right Anatomical Skull & Digestive X-Ray Viewport
      const rightX = 380;
      const rightY = 30;
      const rightW = 320;
      const rightH = 420;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rightX, rightY, rightW, rightH, 20);
      ctx.fill();
      ctx.stroke();

      // Skull & Dentition Section Header
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(
        lang === 'ne' ? 'दाँतको बनावट (Dental Adaptation)' : 'Skull & Dental Architecture',
        rightX + 20,
        rightY + 35
      );

      // Skull Display Canvas Box (X-Ray preview)
      const skullBoxY = rightY + 50;
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX + 15, skullBoxY, rightW - 30, 160, 14);
      ctx.fill();
      ctx.stroke();

      // Anatomical Dental Drawing
      ctx.save();
      const skCX = rightX + rightW / 2;
      const skCY = skullBoxY + 80;
      ctx.translate(skCX, skCY);

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
      ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
      ctx.lineWidth = 3;

      if (activeCategory === 'herbivore') {
        // Deer Skull: Long snout, front incisors, diastema gap, grinding flat molars, NO canines
        ctx.beginPath();
        ctx.ellipse(-20, -5, 65, 32, -Math.PI / 18, 0, Math.PI * 2);
        ctx.stroke();

        // Front incisors
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(40, 5, 8, 12);
        ctx.fillRect(48, 5, 8, 12);

        // Diastema (Toothless gap)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(38, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Flat grinding molars
        ctx.fillStyle = '#10b981';
        for (let m = -45; m <= -10; m += 10) {
          ctx.fillRect(m, 4, 8, 14);
        }

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Incisors', 28, 32);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Diastema Gap', -10, 32);
        ctx.fillStyle = '#10b981';
        ctx.fillText('Flat Molars', -60, 32);
      } else if (activeCategory === 'carnivore') {
        // Tiger Skull: Short powerful jaws, huge piercing canines, sharp carnassials
        ctx.beginPath();
        ctx.ellipse(-15, -5, 55, 38, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Large curved dagger canines
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        // Upper canine
        ctx.moveTo(35, -5);
        ctx.lineTo(44, 25);
        ctx.lineTo(28, 5);
        ctx.closePath();
        ctx.fill();

        // Lower canine
        ctx.beginPath();
        ctx.moveTo(25, 10);
        ctx.lineTo(32, -18);
        ctx.lineTo(20, 0);
        ctx.closePath();
        ctx.fill();

        // Carnassial shearing teeth
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-25, 4, 12, 12);
        ctx.fillRect(-8, 4, 12, 12);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Sharp Canines', 0, 42);
        ctx.fillStyle = '#f97316';
        ctx.fillText('Carnassial Shears', -70, 42);
      } else {
        // Bear Skull: Generalized teeth (incisors, moderate canines, and flat molars)
        ctx.beginPath();
        ctx.ellipse(-15, -5, 60, 36, -Math.PI / 24, 0, Math.PI * 2);
        ctx.stroke();

        // Gripping moderate canine
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(30, -2, 8, 16);

        // Crushing molars
        ctx.fillStyle = '#10b981';
        for (let m = -40; m <= 10; m += 12) {
          ctx.fillRect(m, 4, 10, 12);
        }

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Canines', 15, 32);
        ctx.fillStyle = '#10b981';
        ctx.fillText('Crushing Molars', -55, 32);
      }

      ctx.restore();

      // Lower Digestive Tract Length Comparison Gauge
      const digY = rightY + 230;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(
        lang === 'ne' ? 'पाचन नलीको तुलनात्मक लम्बाइ' : 'Digestive Tract Length',
        rightX + 20,
        digY
      );

      // Gauge Bar Background
      const barY = digY + 16;
      const barW = rightW - 40;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(rightX + 20, barY, barW, 20, 10);
      ctx.fill();

      // Active length fill
      const tractRatio = activeCategory === 'herbivore' ? 0.95 : activeCategory === 'carnivore' ? 0.35 : 0.65;
      const tractColor = activeCategory === 'herbivore' ? '#10b981' : activeCategory === 'carnivore' ? '#ef4444' : '#f59e0b';

      ctx.fillStyle = tractColor;
      ctx.beginPath();
      ctx.roundRect(rightX + 20, barY, barW * tractRatio, 20, 10);
      ctx.fill();

      // Digestive explanation caption
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      const tractDesc =
        activeCategory === 'herbivore'
          ? (lang === 'ne' ? 'अति लामो नली (सेलुलोज फर्मेन्टेसनका लागि)' : 'Very Long Tract (Cellulose Fermentation)')
          : activeCategory === 'carnivore'
          ? (lang === 'ne' ? 'छोटो र अम्लीय नली (मासु छिटो पच्ने)' : 'Short Acidic Tract (Fast Meat Digestion)')
          : (lang === 'ne' ? 'मध्यम लम्बाइको नली (दुबै पच्ने)' : 'Medium Tract (Balanced Plant & Meat)');
      ctx.fillText(tractDesc, rightX + 20, barY + 40);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeCategory, fedFood, chewAnim, lang]);

  return (
    <SimulationLayout
      titleEn="2D Animal Classification Lab"
      titleNe="जनावरहरूको वर्गीकरण 2डी प्रयोगशाला"
      subject="Science"
      grade={6}
      chapter={3}
      stage={stage}
      onStageChange={setStage}
      lang={lang}
      onLangChange={setLang}
      stars={stars}
      isCompleted={isCompleted}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
          color: '#0f172a',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D CANVAS VIEWPORT
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
            width={720}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Floating Quick Badges */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={13} />
              <span>{lang === 'ne' ? currentProfile.animalNe : currentProfile.animalEn}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>{lang === 'ne' ? currentProfile.nameNe : currentProfile.nameEn}</span>
            </div>
          </div>

          {/* Bottom Floating Interactive Feeding Status Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Utensils size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {fedFood
                    ? (lang === 'ne' ? 'खाना परीक्षण सक्रिय' : 'Interactive Feeding Test Active')
                    : (lang === 'ne' ? 'खाना परीक्षण गर्नुहोस्' : 'Test Feeding Compatibility')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {fedFood
                    ? (lang === 'ne' ? `यो जीवले रोजेको खाना खाइरहेको छ।` : `Observe chewing and dental adaptation.`)
                    : (lang === 'ne' ? 'दायाँ प्यानलबाट उपयुक्त खाना छान्नुहोस्।' : 'Select grass, meat, or berries from the sidebar.')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: inspectedCategories.length === 3 ? '#4ade80' : '#38bdf8',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '5px 10px',
                  borderRadius: '8px',
                }}
              >
                {lang === 'ne'
                  ? `अध्ययन गरिएका: ${inspectedCategories.length}/3`
                  : `Explored: ${inspectedCategories.length}/3`}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: 380px PERSISTENT DISCOVERY STATION SIDEBAR
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
          }}
        >
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(3, 105, 161, 0.05) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                {lang === 'ne' ? 'प्राणी वर्गीकरण अनुसन्धान केन्द्र' : 'Zoological Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'जनावरहरूको दाँतको बनावट, पाचन नली र आहारको सम्बन्ध अध्ययन गर्नुहोस्।'
                : 'Examine dentition adaptations, digestive tract length, and dietary classification.'}
            </div>
          </div>

          {/* Classification Switcher (3 Buttons) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'DIETARY CLASSIFICATION' : 'आहार अनुसार वर्गीकरण'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {(['herbivore', 'carnivore', 'omnivore'] as DietCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: activeCategory === cat ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: activeCategory === cat ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat === 'herbivore'
                    ? (lang === 'ne' ? 'शाकाहारी' : 'Herbivore')
                    : cat === 'carnivore'
                    ? (lang === 'ne' ? 'मांसाहारी' : 'Carnivore')
                    : (lang === 'ne' ? 'सर्वहारी' : 'Omnivore')}
                </button>
              ))}
            </div>
          </div>

          {/* Feeding Test Interactive Buttons */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Utensils size={13} />
              <span>{lang === 'ne' ? 'खाना खुवाउने परीक्षण' : 'Interactive Feeding Test'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => handleFeed('grass')}
                style={{
                  padding: '8px 4px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: fedFood === 'grass' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                  background: fedFood === 'grass' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Apple size={16} color="#4ade80" />
                <span>{lang === 'ne' ? 'घाँस/पात' : 'Grass/Leaf'}</span>
              </button>

              <button
                onClick={() => handleFeed('meat')}
                style={{
                  padding: '8px 4px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: fedFood === 'meat' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                  background: fedFood === 'meat' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Drumstick size={16} color="#f87171" />
                <span>{lang === 'ne' ? 'ताजा मासु' : 'Prey Meat'}</span>
              </button>

              <button
                onClick={() => handleFeed('fruit')}
                style={{
                  padding: '8px 4px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: fedFood === 'fruit' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  background: fedFood === 'fruit' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Cookie size={16} color="#fbbf24" />
                <span>{lang === 'ne' ? 'मह/फल' : 'Berries'}</span>
              </button>
            </div>
          </div>

          {/* Dental Anatomy Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ShieldCheck size={13} />
              <span>{lang === 'ne' ? 'दाँतको अनुकूलन (Dental Adaptation)' : 'Dental Adaptation'}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'ne' ? currentProfile.dentitionNe : currentProfile.dentitionEn}
            </p>
          </div>

          {/* Digestive System Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Sparkles size={13} />
              <span>{lang === 'ne' ? 'पाचन नलीको विशेषता' : 'Digestive Characteristics'}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'ne' ? currentProfile.digestiveNe : currentProfile.digestiveEn}
            </p>
          </div>

          {/* Curriculum Key Takeaway Box */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '12px',
              fontSize: '11px',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
              <Info size={13} />
              <span>{lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रमको मुख्य निष्कर्ष'}</span>
            </div>
            {lang === 'en'
              ? 'Herbivores have grinding molars and long digestive tracts for cellulose. Carnivores have piercing canines and short acidic tracts. Omnivores possess versatile intermediate anatomy.'
              : 'शाकाहारी जीवमा सेलुलोज पचाउन फराकिला दाँत र लामो पाचन नली हुन्छ। मांसाहारीमा मासु च्यात्न धारिला क्यानाइन र छोटो पाचन नली हुन्छ भने सर्वहारीमा दुबै प्रकारका मध्यम गुणहरू हुन्छन्।'}
          </div>

          {/* Sticky Green Completion Button at Bottom of Sidebar */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playSuccess();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Award size={16} />
            {lang === 'en' ? '✓ Complete Animal Classification Lab' : '✓ जनावर वर्गीकरण प्रयोगशाला पूरा भयो'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default AnimalClassificationLabSim;
