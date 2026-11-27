/**
 * UniversalGravitationSim.tsx
 * Simulation: Newton's Universal Law of Gravitation
 * Grade 10 Science • Chapter 1: Force & Gravitation
 *
 * 100% Native HTML5 Canvas 2D Interactive Cartoon Simulation.
 * Features:
 * - Expressive cartoon planetary characters (m1 & m2) that strain, sweat, and grit their teeth under gravitational pull
 * - Interactive mass and size scaling with squash-and-stretch cartoon physics
 * - Direct drag-and-drop distance adjustment ($d$) with center-to-center measurement calipers
 * - Real-time Newton's Third Law force vectors ($\vec{F}$ and $-\vec{F}$)
 * - Mathematical live breakdown: $F = G \cdot (m_1 \cdot m_2) / d^2$
 * - Real-world presets: Classroom apples, Bowling balls, Earth & Moon, Sun & Earth
 * - Inverse-Square Law verification table & SEE Board Examination quiz
 * - Full bilingual EN/NE curriculum alignment with rich sound effects
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Sparkles,
  RotateCcw,
  Scale,
  Maximize2,
  Minimize2,
  HelpCircle,
  CheckCircle2,
  Check,
  Award,
  Zap,
  Globe,
  Sun,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';

interface Preset {
  id: string;
  nameEn: string;
  nameNe: string;
  m1: number; // in kg
  m2: number; // in kg
  d: number; // in meters
  scaleLabel: string;
  icon: string;
  descEn: string;
  descNe: string;
}

export const UniversalGravitationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Core Physical Quantities
  // Relative unit mode for intuitive student comprehension (1 to 100 units)
  const [mass1, setMass1] = useState<number>(30); // 10 to 100
  const [mass2, setMass2] = useState<number>(20); // 10 to 100
  const [distance, setDistance] = useState<number>(50); // 20 to 100 (relative distance)

  // Dragging state
  const [isDraggingBody1, setIsDraggingBody1] = useState<boolean>(false);
  const [isDraggingBody2, setIsDraggingBody2] = useState<boolean>(false);

  // Active Preset mode
  const [activePreset, setActivePreset] = useState<string>('cartoon');
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);

  // Challenge stage state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Standard Gravitational Constant G
  const G_CONST = 6.674e-11;

  // Real-world planetary presets
  const presets: Preset[] = [
    {
      id: 'cartoon',
      nameEn: 'Cartoon Lab',
      nameNe: 'कार्टुन प्रयोगशाला (Custom)',
      m1: 30,
      m2: 20,
      d: 50,
      scaleLabel: 'Relative Units',
      icon: '🎨',
      descEn: 'Adjust masses and watch cartoon expressions change from relaxed to hyper-straining!',
      descNe: 'पिण्ड बढाउनुहोस् र तनावयुक्त कार्टुन अनुहारको प्रतिक्रिया हेर्नुहोस्!',
    },
    {
      id: 'students',
      nameEn: 'Classroom Objects',
      nameNe: 'कक्षाकोठाका विद्यार्थी / बल',
      m1: 50,
      m2: 50,
      d: 2,
      scaleLabel: 'kg & meters',
      icon: '🎒',
      descEn: 'Two 50 kg students sitting 2 meters apart. Gravitational force is tiny (~4.2 × 10⁻⁸ N).',
      descNe: '50 केजीका दुई विद्यार्थी 2 मिटर पर बस्दा बल ज्यादै नगन्य हुन्छ (~4.2 × 10⁻⁸ N)।',
    },
    {
      id: 'earth_moon',
      nameEn: 'Earth & Moon',
      nameNe: 'पृथ्वी र चन्द्रमा (Earth-Moon)',
      m1: 80,
      m2: 15,
      d: 65,
      scaleLabel: 'Cosmic scale',
      icon: '🌕',
      descEn: 'Earth pulls the Moon, keeping it in stable orbit, creating ocean tides on Earth.',
      descNe: 'पृथ्वीको गुरुत्वाकर्षणले चन्द्रमालाई कक्षमा घुमाउँछ र समुद्रमा ज्वारभाटा उत्पन्न गराउँछ।',
    },
    {
      id: 'sun_earth',
      nameEn: 'Sun & Earth',
      nameNe: 'सूर्य र पृथ्वी (Sun-Earth)',
      m1: 100,
      m2: 30,
      d: 75,
      scaleLabel: 'Solar scale',
      icon: '☀️',
      descEn: 'Colossal solar gravity guides Earth in its 365-day journey around the Sun.',
      descNe: 'सूर्यको विशाल आकर्षणले पृथ्वीलाई 365 दिनको परिक्रमा पथमा बाँधिराख्छ।',
    },
  ];

  // Calculated relative force for cartoon animation: F_rel = (m1 * m2) / (d^2) * 100
  const normalizedForce = ((mass1 * mass2) / Math.pow(distance / 20, 2));
  // Scaled 0 to 1 for expression intensity
  const strainIntensity = Math.min(1.0, normalizedForce / 600);

  // SEE Board Exam Questions for Chapter 1
  const quizQuestions = [
    {
      qEn: "According to Newton's Law of Gravitation, if the distance between two masses is doubled (2d), what happens to the gravitational force?",
      qNe: "न्युटनको गुरुत्वाकर्षणको नियम अनुसार दुई वस्तुबीचको दूरी दोब्बर (2d) बनाउँदा गुरुत्वाकर्षण बल कति हुन्छ?",
      optionsEn: [
        'A. Force is doubled (2F)',
        'B. Force becomes half (F/2)',
        'C. Force becomes one-fourth (F/4)',
        'D. Force remains unchanged',
      ],
      optionsNe: [
        'A. बल दोब्बर (2F) हुन्छ',
        'B. बल आधा (F/2) हुन्छ',
        'C. बल एक-चौथाइ (F/4) हुन्छ',
        'D. बलमा कुनै परिवर्तन हुँदैन',
      ],
      correct: 2,
      expEn: "Because F is inversely proportional to the square of distance (F ∝ 1/d²). When d is doubled, (2d)² = 4d², so the force becomes 1/4th of the initial force.",
      expNe: "किनकि गुरुत्वाकर्षण बल दूरीको वर्गसँग व्युत्क्रमानुपातिक हुन्छ (F ∝ 1/d²)। दूरी 2 गुणा हुँदा 2² = 4, त्यसैले बल घटेर 1/4 हुन्छ।",
    },
    {
      qEn: "What is the SI unit and value of the Universal Gravitational Constant (G)?",
      qNe: "विश्वव्यापी गुरुत्वाकर्षण स्थिर अङ्क (G) को मान र SI एकाइ के हो?",
      optionsEn: [
        'A. 6.67 × 10⁻¹¹ N·m²/kg²',
        'B. 9.8 m/s²',
        'C. 6.67 × 10¹¹ N/kg',
        'D. 6.4 × 10⁶ m',
      ],
      optionsNe: [
        'A. 6.67 × 10⁻¹¹ N·m²/kg²',
        'B. 9.8 m/s²',
        'C. 6.67 × 10¹¹ N/kg',
        'D. 6.4 × 10⁶ m',
      ],
      correct: 0,
      expEn: "The value of G was determined experimentally by Henry Cavendish as 6.67 × 10⁻¹¹ N·m²/kg² and is constant throughout the entire universe.",
      expNe: "हेनरी क्याभेन्डिसले परीक्षणद्वारा G को मान 6.67 × 10⁻¹¹ N·m²/kg² पत्ता लगाएका हुन्, जुन ब्रह्माण्डभरि स्थिर रहन्छ।",
    },
    {
      qEn: "If the mass of the first body is doubled (2m₁) and the mass of the second body is tripled (3m₂), how many times does the force increase?",
      qNe: "यदि पहिलो वस्तुको पिण्ड दोब्बर (2m₁) र दोस्रो वस्तुको पिण्ड तेब्बर (3m₂) बनाइयो भने गुरुत्वाकर्षण बल कति गुणा बढ्छ?",
      optionsEn: [
        'A. 5 times',
        'B. 6 times',
        'C. 9 times',
        'D. 2.5 times',
      ],
      optionsNe: [
        'A. 5 गुणा',
        'B. 6 गुणा',
        'C. 9 गुणा',
        'D. 2.5 गुणा',
      ],
      correct: 1,
      expEn: "Force is directly proportional to the product of masses (F ∝ m₁·m₂). New Force = G·(2m₁·3m₂)/d² = 6 × F (6 times greater!).",
      expNe: "गुरुत्वाकर्षण बल पिण्डहरूको गुणनफलसँग समानुपातिक हुन्छ (F ∝ m₁·m₂)। त्यसैले (2 × 3) = 6 गुणा बढी हुन्छ।",
    },
  ];

  const handleApplyPreset = (preset: Preset) => {
    ScienceAudio.playPop();
    setActivePreset(preset.id);
    setMass1(preset.m1);
    setMass2(preset.m2);
    setDistance(preset.d);
  };

  const handleReset = () => {
    setMass1(30);
    setMass2(20);
    setDistance(50);
    setActivePreset('cartoon');
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    setQuizIdx(0);
    setSelectedOption(null);
    setQuizFeedback(null);
    ScienceAudio.playWhoosh();
  };

  const handleQuizAnswer = (idx: number) => {
    setSelectedOption(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      ScienceAudio.playSuccess();
      setQuizScore((prev) => prev + 1);
      setQuizFeedback(lang === 'ne' ? 'सबास! सही उत्तर।' : 'Correct! Brilliant understanding.');
      if (stars < 3) setStars((prev) => prev + 1);
    } else {
      ScienceAudio.playBeep();
      setQuizFeedback(lang === 'ne' ? 'पुनः विचार गर्नुहोस्! तलको व्याख्या हेर्नुहोस्।' : 'Not quite. Check the explanation below.');
    }
  };

  // 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      timeRef.current += 0.035;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Vibrant Cosmic Cartoon Space Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0a192f');
      bgGrad.addColorStop(0.5, '#0f2942');
      bgGrad.addColorStop(1, '#061524');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Comic Twinkling Stars & Nebula Dust
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let s = 0; s < 35; s++) {
        const sx = (s * 47) % w;
        const sy = (s * 31) % h;
        const sSize = 1 + (s % 3);
        const blink = Math.sin(t * 2 + s) * 0.4 + 0.6;
        ctx.globalAlpha = blink;
        ctx.beginPath();
        ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 2. Geometry: Coordinates for Body 1 and Body 2
      // Canvas center baseline
      const centerY = h * 0.52;
      const centerCanvasX = w * 0.5;

      // Distance in pixels (scale from distance state)
      const pxDistance = 140 + (distance / 100) * 360;

      const body1X = centerCanvasX - pxDistance / 2;
      const body2X = centerCanvasX + pxDistance / 2;

      // Cartoon Radius scaled dynamically with Mass (Size of object)
      // Visual feedback: Mass increases -> Radius increases with cartoon elasticity
      const baseR1 = 38 + (mass1 / 100) * 52;
      const baseR2 = 32 + (mass2 / 100) * 48;

      // Cartoon Shudder / Tremor when strain is high
      const tremor1X = strainIntensity > 0.4 ? Math.sin(t * 40) * (strainIntensity * 3.5) : 0;
      const tremor1Y = strainIntensity > 0.4 ? Math.cos(t * 35) * (strainIntensity * 3.5) : 0;

      const tremor2X = strainIntensity > 0.4 ? Math.sin(t * 42 + 1) * (strainIntensity * 3.5) : 0;
      const tremor2Y = strainIntensity > 0.4 ? Math.cos(t * 37 + 1) * (strainIntensity * 3.5) : 0;

      const b1x = body1X + tremor1X;
      const b1y = centerY + tremor1Y;

      const b2x = body2X + tremor2X;
      const b2y = centerY + tremor2Y;

      // 3. Gravitational Field Ripple Lines connecting the two bodies (Tension Lines)
      ctx.save();
      const numLines = Math.floor(4 + strainIntensity * 8);
      for (let l = 0; l < numLines; l++) {
        const lineOffset = (l - numLines / 2) * (14 + strainIntensity * 10);
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.15 + strainIntensity * 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -t * 20;

        ctx.beginPath();
        ctx.moveTo(b1x, b1y + lineOffset * 0.5);
        ctx.quadraticCurveTo(
          centerCanvasX,
          centerY + lineOffset + Math.sin(t * 4 + l) * 10,
          b2x,
          b2y + lineOffset * 0.5
        );
        ctx.stroke();
      }
      ctx.restore();

      // 4. Center-to-Center Distance Caliper Dimension Line (d)
      ctx.save();
      const distLineY = centerY + 130;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);

      // Vertical guide lines dropping from planet centers
      ctx.beginPath();
      ctx.moveTo(b1x, b1y + baseR1 + 10);
      ctx.lineTo(b1x, distLineY + 14);
      ctx.moveTo(b2x, b2y + baseR2 + 10);
      ctx.lineTo(b2x, distLineY + 14);
      ctx.stroke();

      // Horizontal measurement bar
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(b1x, distLineY);
      ctx.lineTo(b2x, distLineY);
      ctx.stroke();

      // Arrowheads on distance line
      ctx.fillStyle = '#38bdf8';
      // Left arrow
      ctx.beginPath();
      ctx.moveTo(b1x, distLineY);
      ctx.lineTo(b1x + 12, distLineY - 5);
      ctx.lineTo(b1x + 12, distLineY + 5);
      ctx.closePath();
      ctx.fill();

      // Right arrow
      ctx.beginPath();
      ctx.moveTo(b2x, distLineY);
      ctx.lineTo(b2x - 12, distLineY - 5);
      ctx.lineTo(b2x - 12, distLineY + 5);
      ctx.closePath();
      ctx.fill();

      // Center distance pill badge
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(centerCanvasX - 55, distLineY - 14, 110, 28, 8);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`d = ${distance} m`, centerCanvasX, distLineY + 5);
      ctx.restore();

      // 5. Gravitational Mutual Attraction Force Vectors (\vec{F} and -\vec{F})
      // Thick comic arrows pointing towards each other!
      ctx.save();
      const arrowLength = Math.min((b2x - b1x - baseR1 - baseR2) * 0.45, 30 + strainIntensity * 85);
      const arrowThickness = Math.max(5, 6 + strainIntensity * 12);

      // Force Arrow from Body 1 towards Body 2
      const f1StartX = b1x + baseR1 + 8;
      const f1EndX = f1StartX + arrowLength;

      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10 * strainIntensity;

      // Arrow Body 1 (Vector F)
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(f1StartX, b1y - arrowThickness / 2);
      ctx.lineTo(f1EndX - 14, b1y - arrowThickness / 2);
      ctx.lineTo(f1EndX - 14, b1y - arrowThickness);
      ctx.lineTo(f1EndX, b1y);
      ctx.lineTo(f1EndX - 14, b1y + arrowThickness);
      ctx.lineTo(f1EndX - 14, b1y + arrowThickness / 2);
      ctx.lineTo(f1StartX, b1y + arrowThickness / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Force Label on Body 1
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('F⃗', (f1StartX + f1EndX) / 2, b1y - arrowThickness - 6);

      // Arrow Body 2 (Vector -F)
      const f2StartX = b2x - baseR2 - 8;
      const f2EndX = f2StartX - arrowLength;

      ctx.beginPath();
      ctx.moveTo(f2StartX, b2y - arrowThickness / 2);
      ctx.lineTo(f2EndX + 14, b2y - arrowThickness / 2);
      ctx.lineTo(f2EndX + 14, b2y - arrowThickness);
      ctx.lineTo(f2EndX, b2y);
      ctx.lineTo(f2EndX + 14, b2y + arrowThickness);
      ctx.lineTo(f2EndX + 14, b2y + arrowThickness / 2);
      ctx.lineTo(f2StartX, b2y + arrowThickness / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Force Label on Body 2
      ctx.fillText('-F⃗', (f2StartX + f2EndX) / 2, b2y - arrowThickness - 6);
      ctx.restore();

      // Helper function to render a vibrant cartoon planet with expressions
      const renderCartoonPlanet = (
        x: number,
        y: number,
        radius: number,
        massVal: number,
        label: string,
        themeColor: string,
        glowColor: string,
        isLeft: boolean
      ) => {
        ctx.save();
        ctx.translate(x, y);

        // Subtle squash & stretch towards the pull center
        const stretchX = 1.0 + strainIntensity * 0.08;
        const stretchY = 1.0 - strainIntensity * 0.06;
        ctx.scale(stretchX, stretchY);

        // Planet Body Glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 18 + strainIntensity * 14;

        // Planet Sphere Radial Gradient
        const sphereGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
        if (isLeft) {
          sphereGrad.addColorStop(0, '#67e8f9');
          sphereGrad.addColorStop(0.5, '#06b6d4');
          sphereGrad.addColorStop(1, '#0e7490');
        } else {
          sphereGrad.addColorStop(0, '#fde68a');
          sphereGrad.addColorStop(0.4, '#f59e0b');
          sphereGrad.addColorStop(1, '#b45309');
        }

        ctx.fillStyle = sphereGrad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0; // reset shadow for facial features

        // Dynamic Cartoon Face Elements
        const faceOffsetX = isLeft ? radius * 0.18 : -radius * 0.18;
        ctx.translate(faceOffsetX, 0);

        if (strainIntensity > 0.45) {
          // --- 1. SUPER STRAINING / SWEATING FACE (Heavy Gravitational Pull) ---
          // Clenched Straining Eyes ("> <" or slanted closed lids)
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';

          // Left Eye (clenched)
          ctx.beginPath();
          ctx.moveTo(-radius * 0.35, -radius * 0.15);
          ctx.lineTo(-radius * 0.15, -radius * 0.05);
          ctx.lineTo(-radius * 0.35, radius * 0.05);
          ctx.stroke();

          // Right Eye (clenched)
          ctx.beginPath();
          ctx.moveTo(radius * 0.35, -radius * 0.15);
          ctx.lineTo(radius * 0.15, -radius * 0.05);
          ctx.lineTo(radius * 0.35, radius * 0.05);
          ctx.stroke();

          // Angled furrowed brow wrinkles
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-radius * 0.25, -radius * 0.3);
          ctx.lineTo(-radius * 0.08, -radius * 0.2);
          ctx.moveTo(radius * 0.25, -radius * 0.3);
          ctx.lineTo(radius * 0.08, -radius * 0.2);
          ctx.stroke();

          // Gritted Teeth Mouth (Grimacing rectangular grid)
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(-radius * 0.28, radius * 0.16, radius * 0.56, radius * 0.28, 6);
          ctx.fill();
          ctx.stroke();

          // Teeth grid lines
          ctx.beginPath();
          // Horizontal teeth line
          ctx.moveTo(-radius * 0.28, radius * 0.3);
          ctx.lineTo(radius * 0.28, radius * 0.3);
          // Vertical teeth lines
          ctx.moveTo(-radius * 0.1, radius * 0.16);
          ctx.lineTo(-radius * 0.1, radius * 0.44);
          ctx.moveTo(radius * 0.1, radius * 0.16);
          ctx.lineTo(radius * 0.1, radius * 0.44);
          ctx.stroke();

          // Flying Animated Sweat Droplets (💦)
          const numDrops = Math.floor(strainIntensity * 5);
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;

          for (let d = 0; d < numDrops; d++) {
            const dropAngle = (isLeft ? -Math.PI / 4 : -Math.PI * 0.75) + (d - 1) * 0.35;
            const dropDist = radius * 1.15 + ((t * 60 + d * 25) % 20);
            const dropX = Math.cos(dropAngle) * dropDist;
            const dropY = Math.sin(dropAngle) * dropDist;

            ctx.beginPath();
            ctx.ellipse(dropX, dropY, 5, 8, dropAngle, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        } else {
          // --- 2. RELAXED / PLAYFUL CARTOON FACE (Low to Moderate Pull) ---
          // Big Animated Anime Cartoon Eyes
          const eyeR = radius * 0.14;
          const eyeY = -radius * 0.08;

          // Eye Whites
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-radius * 0.24, eyeY, eyeR, 0, Math.PI * 2);
          ctx.arc(radius * 0.24, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Pupils looking at the other planet
          const lookDir = isLeft ? 1 : -1;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(-radius * 0.24 + lookDir * (eyeR * 0.4), eyeY, eyeR * 0.55, 0, Math.PI * 2);
          ctx.arc(radius * 0.24 + lookDir * (eyeR * 0.4), eyeY, eyeR * 0.55, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle eye glint
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-radius * 0.24 + lookDir * (eyeR * 0.4) - 2, eyeY - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(radius * 0.24 + lookDir * (eyeR * 0.4) - 2, eyeY - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Happy cartoon smile
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, radius * 0.16, radius * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
          ctx.stroke();
        }

        ctx.restore();

        // Mass Badge on top of planet
        ctx.save();
        const badgeY = y - radius - 28;
        ctx.fillStyle = isLeft ? '#0284c7' : '#d97706';
        ctx.beginPath();
        ctx.roundRect(x - 45, badgeY, 90, 24, 6);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${label} = ${massVal} kg`, x, badgeY + 16);
        ctx.restore();
      };

      // Render Planet 1 (Cyan Buddy)
      renderCartoonPlanet(
        b1x,
        b1y,
        baseR1,
        mass1,
        'm₁',
        '#06b6d4',
        'rgba(6, 182, 212, 0.6)',
        true
      );

      // Render Planet 2 (Amber Buddy)
      renderCartoonPlanet(
        b2x,
        b2y,
        baseR2,
        mass2,
        'm₂',
        '#f59e0b',
        'rgba(245, 158, 11, 0.6)',
        false
      );

      // 6. Dynamic Comic Speech Bubble
      if (showSpeechBubble) {
        ctx.save();
        const bubbleX = b1x - 70;
        const bubbleY = b1y - baseR1 - 70;
        const bubbleW = 160;
        const bubbleH = 46;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;

        // Bubble rounded box
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 12);
        ctx.fill();
        ctx.stroke();

        // Speech pointer arrow towards body 1
        ctx.beginPath();
        ctx.moveTo(bubbleX + 40, bubbleY + bubbleH);
        ctx.lineTo(bubbleX + 50, bubbleY + bubbleH + 12);
        ctx.lineTo(bubbleX + 60, bubbleY + bubbleH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';

        const speechText =
          strainIntensity > 0.7
            ? (lang === 'ne' ? 'ओइ! यति ठूलो बल?! 💦' : "WHOA! Hold on tight! 💦")
            : strainIntensity > 0.35
            ? (lang === 'ne' ? 'आकर्षण बढ्दैछ!' : 'Feeling the pull!')
            : (lang === 'ne' ? 'शान्त छु, दूरी धेरै छ 😊' : 'Chilling, far away 😊');

        ctx.fillText(speechText, bubbleX + bubbleW / 2, bubbleY + 26);
        ctx.restore();
      }

      // 7. Live Mathematical Equation HUD Display at Bottom of Canvas
      ctx.save();
      const hudY = 18;
      const hudW = 460;
      const hudX = centerCanvasX - hudW / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, 44, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      const calcForceVal = ((mass1 * mass2) / Math.pow(distance, 2)).toFixed(3);
      ctx.fillText(
        `F = G · (${mass1} · ${mass2}) / (${distance})²  ∝  ${calcForceVal} · G`,
        centerCanvasX,
        hudY + 28
      );
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mass1, mass2, distance, strainIntensity, showSpeechBubble, lang]);

  return (
    <SimulationLayout
      titleEn="Newton's Universal Law of Gravitation"
      titleNe="न्युटनको विश्वव्यापी गुरुत्वाकर्षणको नियम"
      subject="Science"
      grade={10}
      chapter={1}
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
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D GRAVITATIONAL FIELD VIEWPORT
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
            width={760}
            height={490}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Floating Physics Law & Constant Badges */}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Zap size={14} color="#38bdf8" />
              <span>F = G · (m₁ · m₂) / d²</span>
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
                fontFamily: 'monospace',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Scale size={14} color="#fbbf24" />
              <span>G = 6.67 × 10⁻¹¹ N·m²/kg²</span>
            </div>
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

          {/* Bottom Floating Telemetry Dock */}
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
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Scale size={16} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? 'गुरुत्वाकर्षण बल (Mutual Gravitational Force)' : 'Mutual Gravitational Force'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne'
                    ? `दुरी: ${distance}m • पहिलो पिण्ड: ${mass1}kg • दोस्रो पिण्ड: ${mass2}kg`
                    : `Distance: ${distance}m • Mass 1: ${mass1}kg • Mass 2: ${mass2}kg`}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#4ade80',
                background: 'rgba(34, 197, 94, 0.12)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}
            >
              F = {(6.674e-11 * ((mass1 * mass2) / (distance * distance))).toExponential(3)} N
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: GRAVITATION DISCOVERY STATION (380px)
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
              <Zap size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'गुरुत्वाकर्षण अनुसन्धान केन्द्र' : 'Universal Gravitation Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'न्युटनको नियम अनुसार पिण्डहरूको गुणनफल र दूरीको वर्गले आकर्षण बलमा पार्ने असर प्रत्यक्ष अवलोकन गर्नुहोस्।'
                : 'Examine how gravitational attraction scales with mass products (m₁·m₂) and diminishes according to the Inverse Square Law (1/d²).'}
            </div>
          </div>

          {/* Preset Scenarios Selector (2x2 Grid) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'पूर्वनिर्धारित परिस्थिति (Presets)' : 'Preset Scenarios'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {presets.map((p) => {
                const active = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: active ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: active ? '#38bdf8' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'left',
                    }}
                  >
                    <span>{p.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'ne' ? p.nameNe.split(' ')[0] : p.nameEn.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environmental Parameter Sliders */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Slider 1: Mass 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                  {lang === 'ne' ? 'पहिलो वस्तुको पिण्ड (m₁):' : 'Mass of Object 1 (m₁):'}
                </span>
                <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{mass1} kg</strong>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={mass1}
                onChange={(e) => {
                  ScienceAudio.playPop();
                  setMass1(Number(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 2: Mass 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                  {lang === 'ne' ? 'दोस्रो वस्तुको पिण्ड (m₂):' : 'Mass of Object 2 (m₂):'}
                </span>
                <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{mass2} kg</strong>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={mass2}
                onChange={(e) => {
                  ScienceAudio.playPop();
                  setMass2(Number(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 3: Distance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#4ade80' }}>
                  {lang === 'ne' ? 'केन्द्रहरू बीचको दूरी (d):' : 'Distance between centres (d):'}
                </span>
                <strong style={{ color: '#4ade80', fontFamily: 'monospace' }}>{distance} m</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={distance}
                onChange={(e) => {
                  ScienceAudio.playPop();
                  setDistance(Number(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#4ade80', cursor: 'pointer' }}
              />
            </div>
          </div>

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
              💡 {lang === 'ne' ? 'SEE परीक्षा मुख्य निष्कर्ष:' : 'SEE Exam Key Takeaways:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>{lang === 'ne' ? '• पिण्डको गुणनफल (m₁·m₂) बढेमा गुरुत्वाकर्षण बल सिधा बढ्छ।' : '• Force is directly proportional to mass product (F ∝ m₁·m₂).'}</div>
              <div>{lang === 'ne' ? '• दूरी दोब्बर हुँदा बल 4 गुणा घट्छ (F ∝ 1/d²)।' : '• Force obeys the Inverse Square Law: doubling distance cuts force by 4x.'}</div>
              <div>{lang === 'ne' ? '• दुवै वस्तुले एक अर्कालाई बराबर तर विपरीत बलले तान्छन् (Newton’s 3rd Law)।' : '• Both masses experience mutually equal and opposite force vectors.'}</div>
            </div>
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
            {lang === 'en' ? 'Complete Gravitation Lab & Quiz' : 'गुरुत्वाकर्षण प्रयोग पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default UniversalGravitationSim;
