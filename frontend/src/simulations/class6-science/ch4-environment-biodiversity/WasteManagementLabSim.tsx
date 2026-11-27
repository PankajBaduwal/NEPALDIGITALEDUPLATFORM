/**
 * WasteManagementLabSim.tsx
 * Simulation 11: Waste Management Laboratory & Compost Simulator (फोहोरमैला व्यवस्थापन)
 * Grade 6 Science • Unit 4: Environment and Biodiversity (वातावरण र जैविक विविधता)
 *
 * 100% Native HTML5 Canvas 2D Interactive Physics & Ecology Simulation.
 * Features:
 * 1. 3-Bin Color-Coded Segregation:
 *    - Green Bin (जैविक फोहोर / Biodegradable): Organic peels, food leftovers, garden leaves
 *    - Blue Bin (पुनर्चक्रण / Recyclable): Plastic bottles, aluminium cans, paper, cardboard
 *    - Red Bin (हानिकारक / Hazardous): Dry cell batteries, CFL bulbs, e-waste, toxic medicine
 * 2. 2D Parabolic projectile toss & particle effects on bin drop
 * 3. Aerobic Compost Pit Cross-Section Simulator:
 *    - Layering "Browns" (carbon) + "Greens" (nitrogen) + Soil inoculant
 *    - Microbial decomposition heating up to 60°C with rising steam particles
 *    - Week 1 to Week 8 degradation timeline transforming waste into rich humus
 * 4. 3R Strategy (Reduce, Reuse, Recycle) with Kathmandu Sisdol/Bancharedanda context
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio feedback, and 3-star scoring.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Trash2,
  Recycle,
  Leaf,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Thermometer,
  Droplets,
  Layers,
  ArrowRight,
  Award,
  Check,
} from 'lucide-react';

export type LabTab = 'segregation' | 'compost' | 'policy';

interface WasteItem {
  id: string;
  nameEn: string;
  nameNe: string;
  category: 'biodegradable' | 'recyclable' | 'hazardous';
  tipEn: string;
  tipNe: string;
  color: string;
  iconType: 'peel' | 'bottle' | 'leaves' | 'can' | 'battery' | 'paper' | 'bulb' | 'apple';
}

const WASTE_ITEMS: WasteItem[] = [
  {
    id: 'banana_peel',
    nameEn: 'Banana & Veg Peels',
    nameNe: 'केरा र तरकारीको बोक्रा',
    category: 'biodegradable',
    tipEn: 'Organic kitchen waste. Decomposes into rich nutrient compost in 2-4 weeks.',
    tipNe: 'जैविक वस्तु, जुन २-४ हप्तामा कुहिएर प्राङ्गारिक मल बन्छ।',
    color: '#eab308',
    iconType: 'peel',
  },
  {
    id: 'plastic_bottle',
    nameEn: 'Plastic Water Bottle',
    nameNe: 'प्लास्टिकको पानी बोतल',
    category: 'recyclable',
    tipEn: 'Takes 450 years to degrade; can be melted and spun into polyester fiber.',
    tipNe: 'कुहिन ४५० वर्ष लाग्छ; यसलाई पुनर्चक्रण गरी नयाँ सामान बनाइन्छ।',
    color: '#38bdf8',
    iconType: 'bottle',
  },
  {
    id: 'dry_leaves',
    nameEn: 'Dry Garden Leaves',
    nameNe: 'सुकेका पातपतिङ्गर',
    category: 'biodegradable',
    tipEn: 'High-carbon "brown" matter essential for balancing compost moisture & air.',
    tipNe: 'कार्बनयुक्त सुक्खा वस्तु, कम्पोस्ट मल बनाउन नभई नहुने तत्व।',
    color: '#d97706',
    iconType: 'leaves',
  },
  {
    id: 'soda_can',
    nameEn: 'Aluminium Soda Can',
    nameNe: 'आल्मुनियमको क्यान',
    category: 'recyclable',
    tipEn: '100% recyclable indefinitely without loss of metal quality.',
    tipNe: 'सयौँ पटक पगालेर नयाँ सामान बनाउन सकिने पुनर्चक्रणीय धातु।',
    color: '#64748b',
    iconType: 'can',
  },
  {
    id: 'dry_battery',
    nameEn: 'Dead Dry Cell Battery',
    nameNe: 'सकिएको सुख्खा ब्याट्री',
    category: 'hazardous',
    tipEn: 'Contains toxic heavy metals (Zinc, Lead, Acid). Never discard in landfill!',
    tipNe: 'विषालु रसायन र सिसा हुने भएकाले सुरक्षित रूपमा जोखिमयुक्त बिनमा राख्नुपर्छ।',
    color: '#ef4444',
    iconType: 'battery',
  },
  {
    id: 'old_newspaper',
    nameEn: 'Old Newspapers / Books',
    nameNe: 'पुरानो पत्रिका तथा कागज',
    category: 'recyclable',
    tipEn: 'Can be repulped to manufacture recycled paper, notebooks, and egg trays.',
    tipNe: 'कागजको मसी पखालेर पुनः नयाँ कार्टुन, कापी र अण्डाको क्रेट बनाइन्छ।',
    color: '#475569',
    iconType: 'paper',
  },
  {
    id: 'fluorescent_bulb',
    nameEn: 'Broken CFL Bulb',
    nameNe: 'फुटेको सी.एफ.एल चिम',
    category: 'hazardous',
    tipEn: 'Contains toxic Mercury vapor. Requires certified hazardous processing.',
    tipNe: 'पारो (Mercury) को विषालु बाफ हुने भएकाले खतरनाक फोहोरमा पर्दछ।',
    color: '#f87171',
    iconType: 'bulb',
  },
  {
    id: 'apple_core',
    nameEn: 'Apple Core & Leftovers',
    nameNe: 'स्याउको भाग र उब्रेको खाना',
    category: 'biodegradable',
    tipEn: 'Nitrogen-rich green organic material, speeds up microbial heating.',
    tipNe: 'नाइट्रोजनयुक्त जैविक वस्तु, सूक्ष्मजीवको वृद्धिका लागि उपयुक्त।',
    color: '#22c55e',
    iconType: 'apple',
  },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

export const WasteManagementLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Modes: segregation, compost, policy
  const [activeTab, setActiveTab] = useState<'segregation' | 'compost' | 'policy'>('segregation');

  // Segregation Game State
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; textEn: string; textNe: string } | null>(null);
  const [tossAnim, setTossAnim] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    t: number;
    item: WasteItem;
  } | null>(null);

  // Compost Pit State
  const [compostWeek, setCompostWeek] = useState<number>(1); // 1 - 8 weeks
  const [compostMoisture, setCompostMoisture] = useState<number>(55); // 20 - 90%
  const [compostTurned, setCompostTurned] = useState<boolean>(false);

  // Challenge Mode State
  const [challengeScore, setChallengeScore] = useState<number>(0);
  const [challengeTotal, setChallengeTotal] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const steamParticlesRef = useRef<{ x: number; y: number; vy: number; alpha: number; size: number }[]>([]);

  // Spawn visual celebration / toss particles
  const spawnParticles = (x: number, y: number, color: string, count: number = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 3 + Math.random() * 4,
        color,
        alpha: 1.0,
        life: 1.0,
      });
    }
  };

  // Bin Positions on Canvas (relative to 880 width)
  const BINS = {
    biodegradable: { x: 190, y: 350, w: 140, h: 180, color: '#16a34a', lidOpen: 0 },
    recyclable: { x: 440, y: 350, w: 140, h: 180, color: '#2563eb', lidOpen: 0 },
    hazardous: { x: 690, y: 350, w: 140, h: 180, color: '#dc2626', lidOpen: 0 },
  };

  // Handle User sorting an item into a bin
  const handleSortItem = (binCategory: 'biodegradable' | 'recyclable' | 'hazardous') => {
    if (tossAnim && tossAnim.active) return;
    const currentItem = WASTE_ITEMS[activeItemIndex];
    const isCorrect = currentItem.category === binCategory;
    const targetBin = BINS[binCategory];

    // Start Toss Animation
    setTossAnim({
      active: true,
      startX: 440,
      startY: 120,
      targetX: targetBin.x,
      targetY: targetBin.y - 40,
      t: 0,
      item: currentItem,
    });

    if (isCorrect) {
      ScienceAudio.playDing();
      setScore((prev) => prev + 10);
      setFeedback({
        isCorrect: true,
        textEn: `Correct! ${currentItem.nameEn} placed in the right bin. ${currentItem.tipEn}`,
        textNe: `स्याबास! ${currentItem.nameNe} सही बिनमा राखियो। ${currentItem.tipNe}`,
      });
      if (stage === 'challenge') {
        const nextScore = challengeScore + 1;
        setChallengeScore(nextScore);
        if (nextScore >= 5 && stars < 3) setStars(3);
      }
    } else {
      ScienceAudio.playBuzzer();
      setFeedback({
        isCorrect: false,
        textEn: `Incorrect Bin! ${currentItem.nameEn} belongs to the ${currentItem.category.toUpperCase()} bin.`,
        textNe: `गलत बिन! ${currentItem.nameNe} लाई ${currentItem.category === 'biodegradable' ? 'जैविक (हरियो)' : currentItem.category === 'recyclable' ? 'पुनर्चक्रण (नीलो)' : 'जोखिमयुक्त (रातो)'
          } बिनमा राख्नुपर्छ।`,
      });
    }

    setChallengeTotal((prev) => prev + 1);
  };

  // Next Item
  const handleNextItem = () => {
    ScienceAudio.playClick();
    setFeedback(null);
    setActiveItemIndex((prev) => (prev + 1) % WASTE_ITEMS.length);
  };

  // Reset Simulation
  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setActiveItemIndex(0);
    setScore(0);
    setFeedback(null);
    setTossAnim(null);
    setCompostWeek(1);
    setCompostMoisture(55);
    setCompostTurned(false);
    setChallengeScore(0);
    setChallengeTotal(0);
    setStars(0);
    setIsCompleted(false);
    particlesRef.current = [];
  };

  // 2D Draw Helper: Item Drawing
  const drawWasteItem = (
    ctx: CanvasRenderingContext2D,
    item: WasteItem,
    x: number,
    y: number,
    scale: number = 1
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    switch (item.iconType) {
      case 'peel':
        // Banana Peel
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-14, -6, 12, 0.4, 2.2);
        ctx.arc(14, 6, 12, 3.5, 5.3);
        ctx.fillStyle = '#ca8a04';
        ctx.fill();
        break;

      case 'bottle':
        // Plastic Water Bottle
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-8, -16, 16, 32, 4);
        ctx.fill();
        ctx.stroke();
        // Cap & label
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-5, -20, 10, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -4, 16, 8);
        break;

      case 'leaves':
        // Dry Leaves
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(-6, -2, 14, 7, -0.4, 0, Math.PI * 2);
        ctx.ellipse(6, 4, 12, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'can':
        // Aluminium Soda Can
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-10, -15, 20, 30, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-10, -6, 20, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COLA', 0, 3);
        break;

      case 'battery':
        // Dry Cell Battery
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-9, -16, 18, 32, 2);
        ctx.fill();
        ctx.stroke();
        // Brass nub (+ pole)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, -20, 8, 4);
        // Warning lightning
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', 0, 5);
        break;

      case 'paper':
        // Old Newspaper
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-14, -12, 28, 24);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#475569';
        ctx.fillRect(-10, -8, 20, 3);
        ctx.fillRect(-10, -2, 20, 2);
        ctx.fillRect(-10, 3, 20, 2);
        break;

      case 'bulb':
        // CFL Fluorescent Bulb
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -6, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-6, 6, 12, 8);
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Hg', 0, -4);
        break;

      case 'apple':
        // Apple Core
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-5, 0, 10, 0, Math.PI * 2);
        ctx.arc(5, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(2, -16);
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

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

      // Clear Canvas Background
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, width, height);

      // Radial Studio Lighting Gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, '#111e33');
      bgGrad.addColorStop(0.7, '#090d1a');
      bgGrad.addColorStop(1, '#05070f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor Platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 420, width, height - 420);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.lineTo(width, 420);
      ctx.stroke();

      // ==========================================
      // VIEW MODE 1: 3-BIN SEGREGATION LAB
      // ==========================================
      if (activeTab === 'segregation') {
        // Draw 3 Color-Coded Sorting Bins
        const binKeys: ('biodegradable' | 'recyclable' | 'hazardous')[] = ['biodegradable', 'recyclable', 'hazardous'];

        binKeys.forEach((key) => {
          const b = BINS[key];
          const isBio = key === 'biodegradable';
          const isRec = key === 'recyclable';

          ctx.save();
          ctx.translate(b.x, b.y);

          // Bin Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(0, 75, b.w / 2 + 10, 16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bin Body Gradient
          const binGrad = ctx.createLinearGradient(-b.w / 2, 0, b.w / 2, 0);
          if (isBio) {
            binGrad.addColorStop(0, '#15803d');
            binGrad.addColorStop(0.5, '#22c55e');
            binGrad.addColorStop(1, '#166534');
          } else if (isRec) {
            binGrad.addColorStop(0, '#1d4ed8');
            binGrad.addColorStop(0.5, '#3b82f6');
            binGrad.addColorStop(1, '#1e40af');
          } else {
            binGrad.addColorStop(0, '#b91c1c');
            binGrad.addColorStop(0.5, '#ef4444');
            binGrad.addColorStop(1, '#991b1b');
          }

          // Trapezoid Bin Body
          ctx.fillStyle = binGrad;
          ctx.beginPath();
          ctx.moveTo(-b.w / 2 + 10, 70);
          ctx.lineTo(b.w / 2 - 10, 70);
          ctx.lineTo(b.w / 2, -30);
          ctx.lineTo(-b.w / 2, -30);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Bin Rim / Opening Lip
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(0, -30, b.w / 2 + 4, 14, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Bin Front Emblem & Title
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.font = 'bold 16px sans-serif';
          if (isBio) {
            ctx.fillText('🍃 BIODEGRADABLE', 0, 10);
            ctx.font = '12px sans-serif';
            ctx.fillText('जैविक फोहोर (कुहिने)', 0, 30);
          } else if (isRec) {
            ctx.fillText('♻️ RECYCLABLE', 0, 10);
            ctx.font = '12px sans-serif';
            ctx.fillText('पुनर्चक्रण (नकुहिने)', 0, 30);
          } else {
            ctx.fillText('⚠️ HAZARDOUS', 0, 10);
            ctx.font = '12px sans-serif';
            ctx.fillText('जोखिमयुक्त (खतरनाक)', 0, 30);
          }

          ctx.restore();
        });

        // Current Active Waste Item on the Presentation Pedestal
        const currentItem = WASTE_ITEMS[activeItemIndex];

        if (!tossAnim || !tossAnim.active) {
          // Pedestal Base
          ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(440, 160, 80, 18, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Hovering Ring Pulse
          const pulse = Math.sin(Date.now() / 250) * 4;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.ellipse(440, 160, 95 + pulse, 22 + pulse * 0.2, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Waste Item Icon (hovering & bobbing)
          const bob = Math.sin(Date.now() / 300) * 8;
          drawWasteItem(ctx, currentItem, 440, 110 + bob, 2.2);

          // Item Name Tag
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? currentItem.nameNe : currentItem.nameEn, 440, 195);
        } else {
          // Animate Parabolic Toss
          tossAnim.t += 0.04;
          const t = tossAnim.t;
          const curX = (1 - t) * tossAnim.startX + t * tossAnim.targetX;
          // Parabola: y = (1-t)*startY + t*targetY - 120 * 4 * t * (1-t)
          const arc = 140 * 4 * t * (1 - t);
          const curY = (1 - t) * tossAnim.startY + t * tossAnim.targetY - arc;

          drawWasteItem(ctx, tossAnim.item, curX, curY, 2.0 * (1 - t * 0.3));

          if (t >= 1) {
            // Splash into bin
            spawnParticles(tossAnim.targetX, tossAnim.targetY, tossAnim.item.color, 24);
            setTossAnim(null);
            handleNextItem();
          }
        }
      }

      // ==========================================
      // VIEW MODE 2: COMPOST PIT SIMULATOR
      // ==========================================
      if (activeTab === 'compost') {
        const pitX = 220;
        const pitY = 140;
        const pitW = 440;
        const pitH = 240;

        // Wooden Box Slats Frame
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4;
        ctx.strokeRect(pitX, pitY, pitW, pitH);

        // Calculate visual degradation based on week
        // Week 1: distinctly separated layers of greens, browns, soil
        // Week 8: homogenized rich dark black humus soil!
        const blendFactor = Math.min(1.0, (compostWeek - 1) / 7);

        // Internal compost gradient
        const compostGrad = ctx.createLinearGradient(0, pitY, 0, pitY + pitH);
        if (blendFactor < 0.3) {
          // Clear stratification: Dry leaves on top, kitchen scraps in middle, soil on bottom
          compostGrad.addColorStop(0, '#d97706'); // Browns
          compostGrad.addColorStop(0.4, '#15803d'); // Greens
          compostGrad.addColorStop(0.7, '#713f12'); // Inoculant soil
          compostGrad.addColorStop(1, '#451a03');
        } else if (blendFactor < 0.7) {
          // Mid decomposition (mottled dark brown)
          compostGrad.addColorStop(0, '#785338');
          compostGrad.addColorStop(0.5, '#452b1b');
          compostGrad.addColorStop(1, '#2c190e');
        } else {
          // Fully matured black humus compost (organic fertilizer)
          compostGrad.addColorStop(0, '#1c1917');
          compostGrad.addColorStop(0.5, '#0c0a09');
          compostGrad.addColorStop(1, '#18181b');
        }

        ctx.fillStyle = compostGrad;
        ctx.fillRect(pitX + 2, pitY + 2, pitW - 4, pitH - 4);

        // Aerobic Bacteria & Earthworms Wiggling
        const time = Date.now() / 400;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        for (let w = 0; w < 5; w++) {
          const wx = pitX + 60 + w * 75 + Math.sin(time + w) * 10;
          const wy = pitY + 80 + (w % 3) * 45 + Math.cos(time + w) * 6;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.quadraticCurveTo(wx + 8, wy + 6 * Math.sin(time * 2 + w), wx + 18, wy);
          ctx.stroke();
        }

        // Compost Slat Bars (Wood planks)
        ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
        for (let s = 1; s <= 4; s++) {
          ctx.fillRect(pitX, pitY + s * 48 - 6, pitW, 8);
        }

        // Temperature Thermometer Gauge
        // Thermophilic stage reaches peak 60°C around weeks 2-3
        let tempC = 25;
        if (compostWeek === 1) tempC = 35;
        else if (compostWeek === 2 || compostWeek === 3) tempC = 62;
        else if (compostWeek === 4) tempC = 50;
        else if (compostWeek >= 5) tempC = 28;

        const thermX = 720;
        const thermY = 160;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.roundRect(thermX, thermY, 36, 180, 18);
        ctx.fill();
        ctx.stroke();

        // Mercury Level
        const mercuryHeight = ((tempC - 10) / 60) * 130;
        ctx.fillStyle = tempC > 50 ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(thermX + 10, thermY + 160 - mercuryHeight, 16, mercuryHeight, 8);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(thermX + 18, thermY + 160, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${tempC}°C`, thermX + 18, thermY - 8);
        ctx.font = '10px sans-serif';
        ctx.fillText(lang === 'ne' ? 'तापक्रम' : 'Temp', thermX + 18, thermY + 195);

        // Steam Particles during High Temp Phase
        if (tempC >= 50 && Math.random() < 0.4) {
          steamParticlesRef.current.push({
            x: pitX + 40 + Math.random() * (pitW - 80),
            y: pitY + 10,
            vy: -1.2 - Math.random() * 1.5,
            alpha: 0.8,
            size: 4 + Math.random() * 8,
          });
        }

        // Draw and update steam particles
        for (let i = steamParticlesRef.current.length - 1; i >= 0; i--) {
          const sp = steamParticlesRef.current[i];
          sp.y += sp.vy;
          sp.alpha -= 0.015;
          sp.size += 0.2;

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, sp.alpha)})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();

          if (sp.alpha <= 0) steamParticlesRef.current.splice(i, 1);
        }

        // Status Banner at bottom of pit
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'ne'
            ? `हप्ता ${compostWeek} को अवस्था: ${compostWeek < 3
              ? 'सक्रिय सूक्ष्मजीव विच्छेदन (तापक्रम वृद्धि)'
              : compostWeek < 6
                ? 'प्राङ्गारिक तत्वको विघटन र चिसो हुँदै'
                : 'परिपक्व जैविक कालो कम्पोस्ट मल तयार!'
            }`
            : `Week ${compostWeek} State: ${compostWeek < 3
              ? 'Active Thermophilic Decomposition (Heat generation)'
              : compostWeek < 6
                ? 'Cooling & Humus Formation phase'
                : 'Rich Mature Organic Humus Fertilizer Ready!'
            }`,
          440,
          410
        );
      }

      // ==========================================
      // VIEW MODE 3: 3R POLICY & NEPAL CONTEXT
      // ==========================================
      if (activeTab === 'policy') {
        const cardW = 240;
        const cardH = 230;
        const cards = [
          {
            titleEn: '1. REDUCE (घटाउने)',
            titleNe: '१. न्यूनिकरण (Reduce)',
            color: '#10b981',
            icon: '📉',
            descEn: 'Avoid single-use plastics, excessive packaging, and purchase only needed supplies.',
            descNe: 'एकपटक प्रयोग हुने प्लास्टिक र अत्यधिक प्याकेजिङको प्रयोग घटाउने।',
            stat: '-40% Waste',
          },
          {
            titleEn: '2. REUSE (पुनः प्रयोग)',
            titleNe: '२. पुनः प्रयोग (Reuse)',
            color: '#3b82f6',
            icon: '🔄',
            descEn: 'Use refillable glass bottles, cloth shopping bags, and repair appliances.',
            descNe: 'कपडाको झोला प्रयोग गर्ने, सिसाको भाँडा पुनः भर्ने र बिग्रेका सामान मर्मत गर्ने।',
            stat: 'Longer Lifespan',
          },
          {
            titleEn: '3. RECYCLE (पुनर्चक्रण)',
            titleNe: '३. पुनर्चक्रण (Recycle)',
            color: '#f59e0b',
            icon: '♻️',
            descEn: 'Remelt aluminium, scrap metal, plastic granules, and repulp waste papers.',
            descNe: 'कागज, धातु, सिसा र प्लास्टिकलाई कारखानामा पगालेर नयाँ वस्तु बनाउने।',
            stat: 'New Resources',
          },
        ];

        cards.forEach((c, idx) => {
          const cx = 80 + idx * 260;
          const cy = 130;

          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = c.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cx, cy, cardW, cardH, 14);
          ctx.fill();
          ctx.stroke();

          // Icon Circle
          ctx.fillStyle = c.color + '22';
          ctx.beginPath();
          ctx.arc(cx + cardW / 2, cy + 45, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(c.icon, cx + cardW / 2, cy + 55);

          // Card Title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(lang === 'ne' ? c.titleNe : c.titleEn, cx + cardW / 2, cy + 105);

          // Description (multiline wrap)
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px sans-serif';
          const text = lang === 'ne' ? c.descNe : c.descEn;
          const words = text.split(' ');
          let line = '';
          let yOffset = cy + 135;
          for (const w of words) {
            const testLine = line + w + ' ';
            if (ctx.measureText(testLine).width > cardW - 24) {
              ctx.fillText(line, cx + cardW / 2, yOffset);
              line = w + ' ';
              yOffset += 16;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, cx + cardW / 2, yOffset);

          // Stat Badge
          ctx.fillStyle = c.color;
          ctx.beginPath();
          ctx.roundRect(cx + 40, cy + 195, cardW - 80, 22, 6);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(c.stat, cx + cardW / 2, cy + 210);
        });
      }

      // Draw Toss & Sparkle Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.02;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.alpha <= 0) particlesRef.current.splice(i, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, activeItemIndex, tossAnim, compostWeek, compostMoisture, lang]);

  return (
    <SimulationLayout
      title="Waste Management & Composting Laboratory"
      titleNepali="फोहोरमैला व्यवस्थापन तथा कम्पोस्ट प्रयोगशाला"
      chapterNumber={4}
      chapterTitle="Unit 4: Environment and Biodiversity"
      chapterTitleNepali="एकाइ ४: वातावरण र जैविक विविधता"
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
      currentPromptEn="Sort household waste into 3 color-coded bins or explore how organic matter transforms into nutrient-rich compost."
      currentPromptNe="घरको फोहोरलाई ३ रङ्गका बिनहरूमा वर्गीकरण गर्नुहोस् वा जैविक फोहोर कसरी प्राङ्गारिक मल बन्छ हेर्नुहोस्।"
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
            LEFT COLUMN: INTERACTIVE 2D WASTE LAB VIEWPORT
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
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Trash2 size={14} color="#38bdf8" />
              {activeTab === 'segregation'
                ? (lang === 'ne' ? '३-बिन वर्गीकरण' : '3-Bin Segregation')
                : activeTab === 'compost'
                  ? (lang === 'ne' ? 'कम्पोस्ट मल खाडल' : 'Compost Pit Simulator')
                  : (lang === 'ne' ? '३R नीति' : '3R Principles')}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={14} color="#fbbf24" />
              {lang === 'ne' ? `अङ्क: ${score}` : `Score: ${score}`}
            </span>
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

          {/* Feedback Toast */}
          {feedback && (
            <div
              style={{
                position: 'absolute',
                top: '56px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 18px',
                borderRadius: '12px',
                background: feedback.isCorrect ? 'rgba(6, 78, 59, 0.95)' : 'rgba(136, 19, 55, 0.95)',
                border: feedback.isCorrect ? '1px solid #10b981' : '1px solid #f43f5e',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                zIndex: 20,
              }}
            >
              {feedback.isCorrect ? <CheckCircle2 size={16} color="#4ade80" /> : <AlertTriangle size={16} color="#fb7185" />}
              <span>{lang === 'ne' ? feedback.textNe : feedback.textEn}</span>
            </div>
          )}

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
            {activeTab === 'segregation' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🗑️</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'ne' ? 'हालको फोहोर: ' : 'Item to Sort: '}
                    <span style={{ color: '#fbbf24' }}>
                      {lang === 'ne' ? WASTE_ITEMS[activeItemIndex].nameNe : WASTE_ITEMS[activeItemIndex].nameEn}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {lang === 'ne' ? WASTE_ITEMS[activeItemIndex].tipNe : WASTE_ITEMS[activeItemIndex].tipEn}
                  </div>
                </div>
              </div>
            ) : activeTab === 'compost' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🌱</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'ne' ? `विघटन प्रगति: हप्ता ${compostWeek} / ८` : `Compost Maturation: Week ${compostWeek} of 8`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {lang === 'ne'
                      ? `ओसको मात्रा: ${compostMoisture}% • पल्टाइएको: ${compostTurned ? 'हो (हावायुक्त)' : 'छैन'}`
                      : `Moisture: ${compostMoisture}% • Pile Aeration: ${compostTurned ? 'Turned (Aerated)' : 'Unturned'}`}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {lang === 'ne'
                  ? 'काठमाडौँ उपत्यकाको ६५% फोहोर भान्साको जैविक फोहोर हो, जसलाई कम्पोस्ट बनाउन सकिन्छ।'
                  : 'Over 65% of municipal waste in Nepal is compostable organic matter.'}
              </div>
            )}

            <div
              style={{
                fontSize: '11px',
                color: '#4ade80',
                background: 'rgba(34, 197, 94, 0.12)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                fontWeight: 700,
              }}
            >
              {lang === 'ne' ? `अङ्क: ${score}` : `Score: ${score}`}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: WASTE DISCOVERY STATION (380px)
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
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Trash2 size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'फोहोरमैला व्यवस्थापन केन्द्र' : 'Waste Management Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? '३-बिन वर्गीकरण अभ्यास गर्नुहोस्, जैविक फोहोरबाट कम्पोस्ट मल बनाउनुहोस् र ३R नीति बुझ्नुहोस्।'
                : 'Master source segregation across 3 color-coded bins, simulate aerobic composting, and learn the 3R hierarchy.'}
            </div>
          </div>

          {/* Mode Selector Tabs (3 Tabs) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[
              { id: 'segregation', icon: Trash2, labelEn: '3-Bin Sort', labelNe: '३-बिन वर्गीकरण' },
              { id: 'compost', icon: Leaf, labelEn: 'Compost Pit', labelNe: 'कम्पोस्ट मल' },
              { id: 'policy', icon: Recycle, labelEn: '3R Principles', labelNe: '३R नीति' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as LabTab);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: active ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: active ? '#38bdf8' : '#cbd5e1',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <IconComp size={14} color={active ? '#38bdf8' : '#94a3b8'} />
                  <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{lang === 'ne' ? tab.labelNe : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Mode-Specific Interactive Controls */}
          {activeTab === 'segregation' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                {lang === 'ne' ? 'फोहोर बिनमा हाल्नुहोस् (Sort Item):' : 'Sort Item into Destination Bin:'}
              </div>

              <button
                onClick={() => handleSortItem('biodegradable')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Leaf size={14} />
                {lang === 'ne' ? '१. हरियो बिन (जैविक/कुहिने)' : '1. Green Bin (Organic / Compost)'}
              </button>

              <button
                onClick={() => handleSortItem('recyclable')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Recycle size={14} />
                {lang === 'ne' ? '२. नीलो बिन (पुनर्चक्रण/नकुहिने)' : '2. Blue Bin (Recyclable Paper/Plastic)'}
              </button>

              <button
                onClick={() => handleSortItem('hazardous')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
                {lang === 'ne' ? '३. रातो बिन (जोखिमयुक्त/ब्याट्री)' : '3. Red Bin (Hazardous E-Waste)'}
              </button>
            </div>
          )}

          {activeTab === 'compost' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                  {lang === 'ne' ? 'विघटन समयावधि (Timeline):' : 'Compost Timeline:'}
                </span>
                <strong style={{ color: '#fbbf24' }}>
                  {lang === 'ne' ? `हप्ता ${compostWeek} / ८` : `Week ${compostWeek} of 8`}
                </strong>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={compostWeek}
                onChange={(e) => {
                  setCompostWeek(Number(e.target.value));
                  ScienceAudio.playClick();
                }}
                style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                <button
                  onClick={() => {
                    setCompostMoisture((prev) => Math.min(85, prev + 10));
                    ScienceAudio.playDing();
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Droplets size={14} />
                  <span>{lang === 'ne' ? `पानी (${compostMoisture}%)` : `Add Water (${compostMoisture}%)`}</span>
                </button>

                <button
                  onClick={() => {
                    setCompostTurned(!compostTurned);
                    ScienceAudio.playWhoosh();
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: compostTurned ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: compostTurned ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: compostTurned ? '#fbbf24' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={14} />
                  <span>{lang === 'ne' ? 'पल्टाउनुहोस्' : 'Turn / Aerate'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                fontSize: '11px',
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                🇳🇵 {lang === 'ne' ? '३R नीति र नेपालको अवस्था:' : 'The 3R Environmental Hierarchy:'}
              </div>
              <div><strong>1. Reduce (घटाउने):</strong> {lang === 'ne' ? 'फोहोरको उत्पादन नै कम गर्ने।' : 'Minimize single-use plastics and packaging.'}</div>
              <div style={{ marginTop: '4px' }}><strong>2. Reuse (पुनः प्रयोग):</strong> {lang === 'ne' ? 'वस्तुहरूलाई बारम्बार प्रयोग गर्ने।' : 'Repurpose glass jars and canvas shopping bags.'}</div>
              <div style={{ marginTop: '4px' }}><strong>3. Recycle (पुनर्चक्रण):</strong> {lang === 'ne' ? 'कागज र धातुलाई नयाँ वस्तु बनाउने।' : 'Process paper, metals, and thermoplastics into raw goods.'}</div>
            </div>
          )}

          {/* Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              💡 {lang === 'ne' ? 'पाठ्यक्रम मुख्य निष्कर्ष:' : 'Curriculum Key Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'फोहोरलाई स्रोतैमा वर्गीकरण (Segregation) गर्दा ल्यान्डफिल्डको भार घट्छ र कम्पोस्टिङले प्राङ्गारिक मल उत्पादन गर्छ।'
              : 'Segregating waste at source diverts over 65% of domestic waste to compost fertilizer, preserving urban soil fertility and reducing municipal landfill emissions.'}
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
            {lang === 'en' ? 'Complete Waste Lab & Quiz' : 'फोहोर व्यवस्थापन प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default WasteManagementLabSim;
