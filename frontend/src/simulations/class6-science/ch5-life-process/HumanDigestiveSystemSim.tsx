/**
 * HumanDigestiveSystemSim.tsx
 * Simulation 13: 2D Human Digestive System Explorer (मानव पाचन प्रणाली)
 * Grade 6 Science • Unit 5: Life Process (जीवन प्रक्रिया)
 *
 * 100% Native HTML5 Canvas 2D Interactive Anatomical Simulation.
 * Features:
 * 1. 8 Major Anatomical Milestones:
 *    - Mouth & Salivary Glands (मुख र र्‍याल ग्रन्थी, pH 6.8, Ptyalin/Amylase)
 *    - Oesophagus & Peristalsis (पेरिस्टाल्सिस तरङ्गद्वारा खाना आमाशय पुग्ने)
 *    - Stomach (आमाशय, HCl, Pepsin, pH 2.0, Chyme formation)
 *    - Liver & Gallbladder (कलेजो र पित्तथैली, Bile emulsification of fats)
 *    - Pancreas (अग्नाशय, Amylase, Trypsin, Lipase, pH 7.8)
 *    - Small Intestine & Villi (सानो आन्द्रा, पोषक तत्व शोषण / Microvilli blood uptake)
 *    - Large Intestine (ठूलो आन्द्रा, पानी तथा खनिज पुनर्शोषण)
 *    - Rectum & Anus (मलद्वार, विसर्जन / Egestion)
 * 2. Real-time traveling Food Bolus journey with interactive step controls
 * 3. Microscopic Villi Inset: Zoom view into intestinal villi capillaries
 * 4. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  HeartPulse,
  Activity,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Apple,
  Award,
  ZoomIn,
  Layers,
  Check,
} from 'lucide-react';

interface DigestiveStation {
  id: string;
  nameEn: string;
  nameNe: string;
  actionEn: string;
  actionNe: string;
  enzymesEn: string;
  enzymesNe: string;
  ph: number;
  x: number;
  y: number;
  color: string;
}

const DIGESTIVE_STATIONS: DigestiveStation[] = [
  {
    id: 'mouth',
    nameEn: 'Mouth & Salivary Glands',
    nameNe: 'मुख तथा र्‍याल ग्रन्थी',
    actionEn: 'Teeth mechanically chew food. Salivary amylase begins digesting starch into maltose.',
    actionNe: 'दाँतले खाना चपाउँछ र र्‍यालको एमाइलेजले स्टार्चलाई माल्टोजमा टुक्र्याउँछ।',
    enzymesEn: 'Salivary Amylase (Ptyalin)',
    enzymesNe: 'र्‍याल एमाइलेज (टायलिन)',
    ph: 6.8,
    x: 440,
    y: 80,
    color: '#f472b6',
  },
  {
    id: 'oesophagus',
    nameEn: 'Oesophagus (Food Pipe)',
    nameNe: 'खाना नली (पेरिस्टाल्सिस)',
    actionEn: 'Rhythmic muscular wave contractions (peristalsis) propel the food bolus downward.',
    actionNe: 'मांसपेशीको खुम्चने र फुक्ने तरङ्ग (Peristalsis) ले खानालाई आमाशयतिर धकेल्छ।',
    enzymesEn: 'Mucus (Lubrication only)',
    enzymesNe: 'म्युकस (चिप्लो पदार्थ)',
    ph: 7.0,
    x: 440,
    y: 150,
    color: '#fb923c',
  },
  {
    id: 'stomach',
    nameEn: 'Stomach (J-Shaped Pouch)',
    nameNe: 'आमाशय (Stomach)',
    actionEn: 'Hydrochloric acid (pH 2.0) kills microbes; pepsin enzyme breaks proteins into peptones.',
    actionNe: 'हाइड्रोक्लोरिक एसिडले कीटाणु मार्छ र पेप्सिन इन्जाइमले प्रोटिन पचाउँछ।',
    enzymesEn: 'Pepsin, HCl, Gastric Lipase',
    enzymesNe: 'पेप्सिन, हाइड्रोक्लोरिक एसिड',
    ph: 2.0,
    x: 475,
    y: 220,
    color: '#ef4444',
  },
  {
    id: 'liver',
    nameEn: 'Liver & Gallbladder',
    nameNe: 'कलेजो तथा पित्तथैली',
    actionEn: 'Secretes alkaline bile juice to neutralize acid and emulsify large fat globules.',
    actionNe: 'क्षारीय पित्तरस (Bile) उत्पादन गरी चिल्लो पदार्थलाई साना थोपामा टुक्र्याउँछ।',
    enzymesEn: 'Bile Salts (Alkaline)',
    enzymesNe: 'पित्तरस (क्षारीय)',
    ph: 8.0,
    x: 395,
    y: 220,
    color: '#92400e',
  },
  {
    id: 'pancreas',
    nameEn: 'Pancreas',
    nameNe: 'अग्नाशय (Pancreas)',
    actionEn: 'Releases pancreatic juice containing trypsin (proteins), amylase (carbs), and lipase (fats).',
    actionNe: 'ट्रिप्सिन (प्रोटिन), एमाइलेज (कार्बोहाइड्रेट) र लाइपेज (चिल्लो) इन्जाइम पठाउँछ।',
    enzymesEn: 'Trypsin, Lipase, Pancreatic Amylase',
    enzymesNe: 'ट्रिप्सिन, लाइपेज, एमाइलेज',
    ph: 7.8,
    x: 445,
    y: 255,
    color: '#facc15',
  },
  {
    id: 'small_intestine',
    nameEn: 'Small Intestine & Villi',
    nameNe: 'सानो आन्द्रा र भिल्लाइ',
    actionEn: 'Complete chemical digestion and high-surface-area nutrient absorption into blood capillaries.',
    actionNe: 'पूर्ण पाचन पूरा भई भिल्लाइ (Villi) द्वारा पोषक तत्व रगतमा सोसिन्छ।',
    enzymesEn: 'Peptidase, Sucrase, Maltase',
    enzymesNe: 'पेप्टिडेज, सुक्रेज, माल्टेज',
    ph: 7.6,
    x: 440,
    y: 310,
    color: '#34d399',
  },
  {
    id: 'large_intestine',
    nameEn: 'Large Intestine (Colon)',
    nameNe: 'ठूलो आन्द्रा (पानी पुनर्शोषण)',
    actionEn: 'Reabsorbs water and essential minerals from unabsorbed residues, condensing waste.',
    actionNe: 'अपचित फोहोरबाट बढी भएको पानी र खनिज पदार्थ पुनः सोस्दछ।',
    enzymesEn: 'Symbiotic Microflora (Vit K)',
    enzymesNe: 'हितकारी ब्याक्टेरिया (भिटामिन K)',
    ph: 6.5,
    x: 440,
    y: 360,
    color: '#818cf8',
  },
  {
    id: 'rectum',
    nameEn: 'Rectum & Anus',
    nameNe: 'मलद्वार (विसर्जन)',
    actionEn: 'Stores feces temporarily before expulsion from the body via peristaltic egestion.',
    actionNe: 'दिशा जम्मा गर्छ र निश्चित समयमा शरीर बाहिर निष्कासन (Egestion) गर्छ।',
    enzymesEn: 'None (Waste Egestion)',
    enzymesNe: 'कुनै पनि छैन (मल त्याग)',
    ph: 7.0,
    x: 440,
    y: 405,
    color: '#a855f7',
  },
];

export const HumanDigestiveSystemSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Active Station & Journey State
  const [activeStationIndex, setActiveStationIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [showVilliZoom, setShowVilliZoom] = useState<boolean>(false);

  // Food Type: 'apple' (Carb) | 'egg' (Protein) | 'butter' (Lipid)
  const [foodType, setFoodType] = useState<'apple' | 'egg' | 'butter'>('apple');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-play digestive journey timer
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setActiveStationIndex((prev) => {
          if (prev >= DIGESTIVE_STATIONS.length - 1) {
            setIsAutoPlaying(false);
            ScienceAudio.playCheer();
            if (stage === 'challenge' && stars < 3) setStars(3);
            return prev;
          }
          ScienceAudio.playDing();
          return prev + 1;
        });
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, stage, stars]);

  const handleSelectStation = (index: number) => {
    ScienceAudio.playClick();
    setActiveStationIndex(index);
    setIsAutoPlaying(false);
  };

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setActiveStationIndex(0);
    setIsAutoPlaying(false);
    setShowVilliZoom(false);
    setStars(0);
    setIsCompleted(false);
  };

  const currentStation = DIGESTIVE_STATIONS[activeStationIndex];

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark Anatomical Lab Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ── HUMAN TORSO SILHOUETTE ──
      const bodyCenterX = 440;
      ctx.save();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = 2;

      // Head & Neck
      ctx.beginPath();
      ctx.arc(bodyCenterX, 65, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Torso Contour
      ctx.beginPath();
      ctx.moveTo(bodyCenterX - 36, 95);
      ctx.quadraticCurveTo(bodyCenterX - 110, 140, bodyCenterX - 95, 260);
      ctx.quadraticCurveTo(bodyCenterX - 85, 380, bodyCenterX - 55, 440);
      ctx.lineTo(bodyCenterX + 55, 440);
      ctx.quadraticCurveTo(bodyCenterX + 85, 380, bodyCenterX + 95, 260);
      ctx.quadraticCurveTo(bodyCenterX + 110, 140, bodyCenterX + 36, 95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // ── ALIMENTARY CANAL ORGANS ──
      const time = Date.now() / 400;

      // 1. Oesophagus Tube
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bodyCenterX, 85);
      // Peristaltic ripple along oesophagus
      const peristalticY = 100 + ((Date.now() / 20) % 80);
      ctx.lineTo(bodyCenterX, 185);
      ctx.stroke();

      // Peristaltic wave indicator
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(bodyCenterX, peristalticY, 7, 0, Math.PI * 2);
      ctx.fill();

      // 2. Liver (Dark Reddish Brown Wedge on Left)
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bodyCenterX - 20, 190);
      ctx.lineTo(bodyCenterX - 75, 205);
      ctx.quadraticCurveTo(bodyCenterX - 85, 240, bodyCenterX - 45, 245);
      ctx.lineTo(bodyCenterX - 15, 225);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gallbladder (Small Green Pear under liver)
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(bodyCenterX - 35, 235, 9, 6, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // 3. Stomach (Curved J-shape Pouch)
      const stomachGrad = ctx.createRadialGradient(bodyCenterX + 25, 215, 6, bodyCenterX + 25, 215, 35);
      stomachGrad.addColorStop(0, '#f87171');
      stomachGrad.addColorStop(0.7, '#dc2626');
      stomachGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = stomachGrad;
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(bodyCenterX, 185);
      ctx.quadraticCurveTo(bodyCenterX + 55, 180, bodyCenterX + 55, 220);
      ctx.quadraticCurveTo(bodyCenterX + 45, 255, bodyCenterX + 10, 245);
      ctx.quadraticCurveTo(bodyCenterX - 5, 240, bodyCenterX - 2, 230);
      ctx.quadraticCurveTo(bodyCenterX + 15, 220, bodyCenterX, 185);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Acid Churning bubbles inside stomach
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      for (let b = 0; b < 4; b++) {
        const bx = bodyCenterX + 20 + Math.sin(time + b) * 12;
        const by = 220 + Math.cos(time * 1.5 + b) * 10;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Pancreas (Yellow Leaf-like Gland tucked under stomach)
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(bodyCenterX + 15, 255, 24, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 5. Large Intestine (Inverted U-Loop Framing)
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // Ascending colon
      ctx.moveTo(bodyCenterX - 50, 360);
      ctx.lineTo(bodyCenterX - 55, 275);
      // Transverse colon
      ctx.lineTo(bodyCenterX + 55, 275);
      // Descending colon
      ctx.lineTo(bodyCenterX + 50, 375);
      // Sigmoid to Rectum
      ctx.lineTo(bodyCenterX, 410);
      ctx.stroke();

      // 6. Small Intestine (Dense central looping coils)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bodyCenterX + 10, 260); // Duodenum exit
      for (let i = 0; i < 16; i++) {
        const sx = bodyCenterX - 35 + ((i * 17) % 70);
        const sy = 295 + Math.floor(i / 3) * 12 + Math.sin(time + i) * 3;
        ctx.lineTo(sx, sy);
      }
      ctx.lineTo(bodyCenterX - 45, 360); // Connects to caecum
      ctx.stroke();

      // ── ACTIVE HIGHLIGHT STATION RING ──
      const cur = DIGESTIVE_STATIONS[activeStationIndex];
      const haloR = 18 + Math.sin(Date.now() / 200) * 4;
      ctx.strokeStyle = cur.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, haloR, 0, Math.PI * 2);
      ctx.stroke();

      // Traveling Food Bolus Indicator
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = cur.color;
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── LEFT INFO CARD: ORGAN PROFILE ──
      const cardX = 40;
      const cardY = 70;
      const cardW = 280;
      const cardH = 340;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = cur.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 16);
      ctx.fill();
      ctx.stroke();

      // Station Badge
      ctx.fillStyle = cur.color;
      ctx.beginPath();
      ctx.roundRect(cardX + 16, cardY + 16, 32, 32, 8);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${activeStationIndex + 1}`, cardX + 32, cardY + 38);

      // Station Titles
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? cur.nameNe : cur.nameEn, cardX + 58, cardY + 32);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Step ${activeStationIndex + 1} of 8`, cardX + 58, cardY + 48);

      // pH Gauge Dial
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cardX + 16, cardY + 68, cardW - 32, 42, 8);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`pH: ${cur.ph}`, cardX + 28, cardY + 92);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = cur.ph < 5 ? '#f87171' : cur.ph > 7.5 ? '#60a5fa' : '#34d399';
      ctx.fillText(
        cur.ph < 5
          ? lang === 'ne' ? 'अम्लीय (Acidic)' : 'Strongly Acidic'
          : cur.ph > 7.5
          ? lang === 'ne' ? 'क्षारीय (Alkaline)' : 'Alkaline'
          : lang === 'ne' ? 'तटस्थ (Neutral)' : 'Near Neutral',
        cardX + 100,
        cardY + 92
      );

      // Enzymes / Chemicals
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'ne' ? 'इन्जाइम तथा रस:' : 'Active Enzymes:', cardX + 16, cardY + 135);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'ne' ? cur.enzymesNe : cur.enzymesEn, cardX + 16, cardY + 155);

      // Description / Action
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'ne' ? 'पाचन प्रक्रिया:' : 'Physiological Action:', cardX + 16, cardY + 185);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px sans-serif';
      const desc = lang === 'ne' ? cur.actionNe : cur.actionEn;
      const words = desc.split(' ');
      let line = '';
      let descY = cardY + 205;
      for (const w of words) {
        const testLine = line + w + ' ';
        if (ctx.measureText(testLine).width > cardW - 36) {
          ctx.fillText(line, cardX + 16, descY);
          line = w + ' ';
          descY += 16;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, cardX + 16, descY);

      // ── RIGHT INSET: MICROSCOPIC VILLI ABSORPTION ZOOM ──
      const zoomX = 580;
      const zoomY = 70;
      const zoomW = 260;
      const zoomH = 340;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(zoomX, zoomY, zoomW, zoomH, 16);
      ctx.fill();
      ctx.stroke();

      // Zoom Header
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '🔬 भिल्लाइ सूक्ष्म दृश्य (Villi 100X)' : '🔬 Intestinal Villi Zoom (100X)', zoomX + 16, zoomY + 28);

      // Microscopic Finger-like Villi Projections
      for (let v = 0; v < 3; v++) {
        const vx = zoomX + 50 + v * 70;
        const vy = zoomY + 240;

        // Villi Epithelium
        ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vx - 22, vy);
        ctx.lineTo(vx - 22, vy - 120);
        ctx.arc(vx, vy - 120, 22, Math.PI, 0);
        ctx.lineTo(vx + 22, vy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Blood Capillary Loop inside villus (Arteriole red, Venule blue, Lacteal cream)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(vx - 10, vy);
        ctx.lineTo(vx - 10, vy - 110);
        ctx.arc(vx, vy - 110, 10, Math.PI, 0);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineTo(vx + 10, vy);
        ctx.stroke();

        // Lacteal central lymphatic vessel (Fats absorption)
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx, vy - 95);
        ctx.stroke();
      }

      // Absorbed Nutrient Sparkles traveling into capillaries
      ctx.fillStyle = '#facc15';
      for (let d = 0; d < 8; d++) {
        const dx = zoomX + 40 + ((d * 31 + Date.now() / 30) % (zoomW - 80));
        const dy = zoomY + 65 + ((d * 23) % 150);
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Legend Callout at bottom of Zoom
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(lang === 'ne' ? '• रातो/नीलो: रक्त केशिका (ग्लुकोज/अमिनो एसिड)' : '• Red/Blue: Capillaries (Glucose/Amino)', zoomX + 16, zoomY + 280);
      ctx.fillText(lang === 'ne' ? '• पहेँलो: ल्याक्टियल (फ्याटी एसिड तथा ग्लिसरोल)' : '• Yellow: Lacteal (Fatty Acids & Glycerol)', zoomX + 16, zoomY + 300);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeStationIndex, lang]);

  return (
    <SimulationLayout
      title="Human Digestive System Explorer & Villi Absorption"
      titleNepali="मानव पाचन प्रणाली तथा पोषक तत्व शोषण"
      chapterNumber={5}
      chapterTitle="Unit 5: Life Process"
      chapterTitleNepali="एकाइ ५: जीवन प्रक्रिया"
      currentStage={stage}
      onStageChange={(s) => {
        setStage(s);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={setLang}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Follow the food bolus from mouth to stomach, intestine, and villi to discover mechanical and chemical digestion."
      currentPromptNe="खाना कसरी मुखबाट आमाशय, सानो आन्द्रा र भिल्लाइ हुँदै पच्छ र शोषण हुन्छ हेर्नुहोस्।"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D DIGESTIVE TRACT VIEWPORT
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
            width={880}
            height={500}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Floating Badges */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <HeartPulse size={14} color="#fb7185" />
              {lang === 'ne' ? 'पाचन प्रणाली तथा भिल्लाइ शोषण' : 'Gastrointestinal Anatomy & Villi Absorption'}
            </span>

            <button
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying);
                ScienceAudio.playClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: isAutoPlaying ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isAutoPlaying ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                color: isAutoPlaying ? '#fbbf24' : '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Play size={13} style={{ fill: isAutoPlaying ? '#fbbf24' : 'none' }} />
              {isAutoPlaying
                ? (lang === 'ne' ? 'रोक्नुहोस् (Pause)' : 'Pause Journey')
                : (lang === 'ne' ? 'पाचन यात्रा सुरु' : 'Auto Journey')}
            </button>
          </div>

          {/* Top-Right Reset Button */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleReset}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              {lang === 'ne' ? 'रिसेट' : 'Reset'}
            </button>
          </div>

          {/* Bottom Floating Status Dock */}
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
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(244, 63, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HeartPulse size={16} color="#fb7185" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? currentStation.nameNe : currentStation.nameEn}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '520px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lang === 'ne' ? currentStation.actionNe : currentStation.actionEn}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                disabled={activeStationIndex === 0}
                onClick={() => handleSelectStation(activeStationIndex - 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid #e2e8f0',
                  color: activeStationIndex === 0 ? '#64748b' : '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: activeStationIndex === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {lang === 'ne' ? '◀ अघिल्लो' : '◀ Prev'}
              </button>

              <button
                disabled={activeStationIndex === DIGESTIVE_STATIONS.length - 1}
                onClick={() => handleSelectStation(activeStationIndex + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: activeStationIndex === DIGESTIVE_STATIONS.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                {lang === 'ne' ? 'अर्को ▶' : 'Next ▶'}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: DIGESTIVE DISCOVERY STATION (380px)
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
            color: '#fff',
          }}
        >
          {/* Station Header Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <HeartPulse size={18} color="#fb7185" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'मानव पाचन प्रणाली अनुसन्धान' : 'Digestive Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'मुखदेखि ठूलो आन्द्रासम्म खाना कसरी यान्त्रिक र रासायनिक रूपमा पच्छ तथा भिल्लाइमार्फत रगतमा सोसिन्छ अवलोकन गर्नुहोस्।'
                : 'Follow food bolus transit through mechanical mastication, gastric churning, intestinal villi absorption, and large bowel hydration.'}
            </div>
          </div>

          {/* Organ Step Selection Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'पाचन अङ्गहरू (Alimentary Canal)' : 'Select Digestive Organ'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DIGESTIVE_STATIONS.map((station, idx) => {
                const active = activeStationIndex === idx;
                return (
                  <button
                    key={station.id}
                    onClick={() => handleSelectStation(idx)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: active ? '2px solid #fb7185' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: active ? '#fb7185' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: active ? '#f43f5e' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 800,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span>{lang === 'ne' ? station.nameNe : station.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Organ Mechanism Details Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', marginBottom: '6px' }}>
              {lang === 'ne' ? 'अङ्गको कार्यप्रणाली (Physiology):' : 'Physiological Mechanism:'}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'ne' ? currentStation.actionNe : currentStation.actionEn}
            </div>
          </div>

          {/* Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 800, color: '#fb7185', marginBottom: '4px' }}>
              💡 {lang === 'ne' ? 'पाठ्यक्रम मुख्य निष्कर्ष:' : 'Curriculum Key Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'पाचन नलीमा मुखले स्टार्च पचाउँछ, आमाशयले प्रोटिन टुक्र्याउँछ, र सानो आन्द्राका सूक्ष्म भिल्लाइ (Villi) ले सम्पूर्ण पोषक तत्व रगतमा सोस्छन्।'
              : 'The human digestive system uses salivary enzymes for carbohydrates, gastric acid and pepsin for protein breakdown, and millions of microscopic intestinal villi to absorb nutrients into the bloodstream.'}
          </div>

          {/* Prominent Completion Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Digestive Lab & Quiz' : 'पाचन प्रणाली प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default HumanDigestiveSystemSim;
