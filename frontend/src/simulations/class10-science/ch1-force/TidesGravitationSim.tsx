/**
 * TidesGravitationSim.tsx
 * Simulation: Ocean Tides & Lunar Gravitation (समुद्री ज्वारभाटा र चन्द्रमाको गुरुत्वाकर्षण बल)
 * Grade 10 Science • Chapter 1: Force & Gravitation (बल र गुरुत्वाकर्षण)
 *
 * 100% Native HTML5 Canvas 2D Interactive Cartoon Simulation.
 * Recreates the user's reference illustration with vivid cartoon aesthetics, rich physics,
 * and comprehensive CDC Class 10 curriculum explanations.
 * UI layout matches Newton's Universal Law of Gravitation (2-column layout with right inspector).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Waves,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Check,
  Award,
  Globe,
  Maximize2,
  Compass,
  Zap,
  Scale,
} from 'lucide-react';

type ViewMode = 'beach' | 'global';
type TideAlignment = 'lunar' | 'spring' | 'neap';

interface Preset {
  id: string;
  nameEn: string;
  nameNe: string;
  alignment: TideAlignment;
  moonDistance: number; // 20 (close / perigee) to 90 (far / apogee)
  moonMass: number; // 20 to 100
  moonXRel: number; // 0.15 to 0.85
  icon: string;
  descEn: string;
  descNe: string;
}

export const TidesGravitationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // View Mode: 'beach' (matching uploaded artwork) or 'global' (planet & dual bulges)
  const [viewMode, setViewMode] = useState<ViewMode>('beach');

  // Alignment Mode: Lunar Only, Spring Tide (Sun + Moon syzygy), Neap Tide (Sun 90° Moon)
  const [alignment, setAlignment] = useState<TideAlignment>('lunar');
  const [activePreset, setActivePreset] = useState<string>('cartoon-classic');

  // Physics parameters (normalized relative scales for intuitive interaction)
  const [moonXRel, setMoonXRel] = useState<number>(0.5); // 0.15 to 0.85 (horizontal celestial position)
  const [moonDistRel, setMoonDistRel] = useState<number>(45); // 20 (close / Supermoon) to 90 (far / Micromoon)
  const [moonMassRel, setMoonMassRel] = useState<number>(55); // 20 to 100

  // Interactive Moon dragging & hover state
  const [isDraggingMoon, setIsDraggingMoon] = useState<boolean>(false);
  const [isHoveringMoon, setIsHoveringMoon] = useState<boolean>(false);

  // Challenge stage state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const starsBgRef = useRef<Array<{ x: number; y: number; r: number; alpha: number; speed: number }>>([]);

  // Presets
  const presets: Preset[] = [
    {
      id: 'cartoon-classic',
      nameEn: 'Classic High Tide (Near Water)',
      nameNe: 'कार्टुन उच्च ज्वार (पानी नजिक)',
      alignment: 'lunar',
      moonDistance: 30, // Near water surface: strong attraction
      moonMass: 55,
      moonXRel: 0.5,
      icon: '🌊',
      descEn: 'Moon is near the water surface: strong gravitational pull attracts water into a bulging high tide!',
      descNe: 'चन्द्रमा पानीको सतह नजिक हुँदा पानीलाई आफूतिर तानेर उच्च ज्वारभाटा बनाउँछ!',
    },
    {
      id: 'supermoon-perigee',
      nameEn: 'Supermoon (Closest to Water)',
      nameNe: 'निकटतम सुपरमुन',
      alignment: 'lunar',
      moonDistance: 20, // Closest to water: maximum attraction
      moonMass: 80,
      moonXRel: 0.45,
      icon: '🌕',
      descEn: 'Moon is closest to water surface: extreme high tide bulge with flying sweat droplets and maximum strain!',
      descNe: 'चन्द्रमा पानीको सतहको सबैभन्दा नजिक हुँदा: विशाल ज्वारभाटा र पसिनाका थोपाहरू!',
    },
    {
      id: 'spring-tide',
      nameEn: 'Spring Tide (Syzygy)',
      nameNe: 'बृहत् ज्वार (सिजिगी)',
      alignment: 'spring',
      moonDistance: 28,
      moonMass: 65,
      moonXRel: 0.52,
      icon: '☀️',
      descEn: 'Sun & Moon pull together near water: maximum ocean bulge height and greatest gravitational pull!',
      descNe: 'सूर्य र चन्द्रमा एउटै रेखामा मिल्दा दुवैको संयुक्त आकर्षणले सबैभन्दा अग्लो बृहत् ज्वार उत्पन्न हुन्छ।',
    },
    {
      id: 'neap-tide',
      nameEn: 'Neap Tide (Quadrature)',
      nameNe: 'लघु ज्वार (समकोण)',
      alignment: 'neap',
      moonDistance: 55,
      moonMass: 45,
      moonXRel: 0.6,
      icon: '🌓',
      descEn: 'Sun and Moon at 90° right angle: solar gravity opposes lunar gravity, producing milder tides.',
      descNe: 'सूर्य र चन्द्रमा ९० डिग्रीको समकोणमा हुँदा एकअर्काको बल घटाई न्यून वा लघु ज्वार ल्याउँछन्।',
    },
    {
      id: 'high-sky-normal',
      nameEn: 'Moon High in Sky (Normal Water)',
      nameNe: 'चन्द्रमा धेरै माथि (सामान्य पानी)',
      alignment: 'lunar',
      moonDistance: 88, // High in the sky: normal calm water
      moonMass: 50,
      moonXRel: 0.5,
      icon: '🌙',
      descEn: 'Moon is high in the sky far above the surface: gravitational pull is weak and water returns to normal level.',
      descNe: 'चन्द्रमा आकाशमा धेरै माथि हुँदा गुरुत्वाकर्षण कमजोर हुन्छ र पानी सामान्य अवस्थामा फर्कन्छ।',
    },
  ];

  // Initialize background stars once
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 75; i++) {
      list.push({
        x: Math.random(),
        y: Math.random() * 0.55,
        r: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.6 + 0.4,
        speed: Math.random() * 0.03 + 0.01,
      });
    }
    starsBgRef.current = list;
  }, []);

  // Compute physical metrics
  // Differential Tidal Force: F_tidal ∝ M_moon / d³
  const baseTidalFactor = (moonMassRel / 50) / Math.pow(moonDistRel / 50, 3);
  const alignmentMultiplier = alignment === 'spring' ? 1.45 : alignment === 'neap' ? 0.62 : 1.0;
  const netTidalStrength = baseTidalFactor * alignmentMultiplier; // 0.2 to ~4.5
  const tidalHeightMeters = Math.min(14, Math.max(0.4, netTidalStrength * 3.4)).toFixed(2);
  const strainLevel = Math.min(1.0, Math.max(0.0, (netTidalStrength - 0.4) / 1.7));

  // SEE Board Exam Questions directly aligned with Class 10 CDC Curriculum
  const quizQuestions = [
    {
      qEn: 'Why does oceanic water bulge and produce high tides predominantly toward the Moon?',
      qNe: 'समुद्रको पानी चन्द्रमा तर्फ नै फुल्लिएर उच्च ज्वार आउनुको मुख्य कारण के हो?',
      optsEn: [
        'Because fluid ocean water easily flows and is pulled by the Moon’s gravitational attraction',
        'Because Earth’s atmosphere pushes water upwards',
        'Because underwater volcanic heat boils the water',
        'Because the Earth rotates faster than the Moon',
      ],
      optsNe: [
        'किनभने तरल पानी सजिलै बग्ने हुँदा चन्द्रमाको गुरुत्वाकर्षण बलले पानीलाई आफूतिर तान्छ',
        'किनभने पृथ्वीको वायुमण्डलले पानीलाई माथितिर धकेल्छ',
        'किनभने पानीमुनिको ज्वालामुखीको तापले पानी उमाल्छ',
        'किनभने पृथ्वी चन्द्रमाभन्दा तीव्र गतिमा घुम्छ',
      ],
      correct: 0,
      explEn:
        'Liquid water is mobile and easily deformable compared to solid continents. The Moon’s gravitational attraction pulls water upward on the near side, creating a high tide bulge.',
      explNe:
        'कडा जमिनको तुलनामा समुद्रको पानी तरल र गतिशील हुन्छ। चन्द्रमाको गुरुत्वाकर्षण आकर्षणले आफू नजिकको पानीलाई माथितिर तानेर उच्च ज्वारभाटा (High Tide) उत्पन्न गर्छ।',
    },
    {
      qEn: 'Although the Sun is 27 million times more massive than the Moon, the Moon causes ~2.17 times stronger tides on Earth. Why?',
      qNe: 'सूर्य चन्द्रमाभन्दा करिब २ करोड ७० लाख गुणा ठूलो भए पनि चन्द्रमाले नै किन दोब्बरभन्दा बढी (२.१७ गुणा) शक्तिशाली ज्वारभाटा ल्याउँछ?',
      optsEn: [
        'Because tidal differential gravitational force depends inversely on the CUBE of distance (1/d³), and the Moon is ~390 times closer',
        'Because the Moon has stronger magnetic fields than the Sun',
        'Because the Sun only shines during the day and has no gravity at night',
        'Because the Moon orbits Earth directly, while the Sun does not',
      ],
      optsNe: [
        'किनभने ज्वारीय विभेदक बल दूरीको घनको व्युत्क्रमानुपातिक (१/d³) हुन्छ र चन्द्रमा सूर्यभन्दा करिब ३९० गुणा नजिक छ',
        'किनभने चन्द्रमामा सूर्यभन्दा शक्तिशाली चुम्बकीय क्षेत्र हुन्छ',
        'किनभने सूर्य दिनमा मात्र उदाउँछ र राति गुरुत्वाकर्षण हुँदैन',
        'किनभने चन्द्रमा पृथ्वीको उपग्रह हो तर सूर्य होइन',
      ],
      correct: 0,
      explEn:
        'Tidal force is a DIFFERENTIAL gravity gradient: F_tide ∝ M/d³. Because the Moon is 390 times closer to Earth than the Sun, the (1/d³) factor dominates over mass, making lunar tides 2.17× stronger than solar tides.',
      explNe:
        'ज्वारीय बल विभेदक गुरुत्वाकर्षण बल हो, जुन दूरीको तेस्रो घात वा घनको व्युत्क्रमानुपातिक (F_tide ∝ M/d³) हुन्छ। चन्द्रमा सूर्यभन्दा करिब ३९० गुणा नजिक भएकाले दूरीको प्रभावले चन्द्रमाको ज्वारीय प्रभाव सूर्यभन्दा २.१७ गुणा बढी हुन्छ।',
    },
    {
      qEn: 'During which lunar phases do maximum "Spring Tides" (बृहत् ज्वार) occur?',
      qNe: 'कुन तिथि वा चन्द्रमाको अवस्थामा सबैभन्दा अग्लो "बृहत् ज्वार" (Spring Tide) आउँछ?',
      optsEn: [
        'At New Moon (औंसी) and Full Moon (पूर्णिमा) when Sun, Earth, and Moon are aligned in a straight line (Syzygy)',
        'At First Quarter and Last Quarter Moon (अष्टमी) when Sun and Moon are perpendicular',
        'Only during solar eclipses once a decade',
        'Every single day at midnight',
      ],
      optsNe: [
        'औंसी र पूर्णिमामा जब सूर्य, पृथ्वी र चन्द्रमा एउटै सरल रेखामा (सिजिगी) पर्दछन्',
        'अष्टमी तिथिमा जब सूर्य र चन्द्रमा ९० डिग्रीको समकोणमा हुन्छन्',
        'प्रत्येक १० वर्षमा एकपटक सूर्यग्रहण लाग्दा मात्र',
        'हरेक दिन मध्यरातमा मात्र',
      ],
      correct: 0,
      explEn:
        'When the Sun, Earth, and Moon align along a straight line (Syzygy) at New Moon or Full Moon, their gravitational tidal forces add together constructively, creating maximum Spring Tides.',
      explNe:
        'औंसी र पूर्णिमाको दिन सूर्य, पृथ्वी र चन्द्रमा एउटै सरल रेखामा पर्ने (सिजिगी) हुँदा सूर्य र चन्द्रमा दुवैको गुरुत्वाकर्षण बल थपिएर सबैभन्दा अग्लो ‘बृहत् ज्वार’ उत्पन्न हुन्छ।',
    },
    {
      qEn: 'Why do most coastlines experience TWO high tides and TWO low tides approximately every 24 hours 50 minutes?',
      qNe: 'अधिकांश समुद्र किनारमा प्रत्येक २४ घण्टा ५० मिनेटमा दुई पटक उच्च ज्वार र दुई पटक न्यून ज्वार किन आउँछ?',
      optsEn: [
        'Because Earth rotates through TWO bulges: one facing the Moon (direct pull) and one on the opposite side (antipodal differential inertia)',
        'Because ocean waves bounce back and forth from continents',
        'Because fish swim in opposite directions twice a day',
        'Because the Moon circles the Earth twice every single day',
      ],
      optsNe: [
        'किनभने पृथ्वी घुम्दा दुईवटा उभार पार गर्छ: एउटा चन्द्रमा तर्फ (प्रत्यक्ष आकर्षण) र अर्को विपरीत तर्फ (विभेदक जडता/अपकेन्द्री)',
        'किनभने समुद्रका छालहरू महादेशमा ठोक्किएर फर्किन्छन्',
        'किनभने माछाहरू दिनमा दुईपटक विपरीत दिशामा पौडन्छन्',
        'किनभने चन्द्रमाले दिनमा दुईपटक पृथ्वीलाई परिक्रमा गर्छ',
      ],
      correct: 0,
      explEn:
        'The Moon pulls water toward itself on the near side (sub-lunar bulge). It also pulls the Earth’s solid center away from the far-side water (antipodal bulge). As Earth rotates daily through these two bulges, a coastline encounters two high tides per day.',
      explNe:
        'चन्द्रमाले आफूतिरको पानीलाई बढी तान्छ भने पृथ्वीको केन्द्रलाई पछाडिको पानीभन्दा बढी तान्दा दुवै तर्फ पानीको उभार बन्दछ। पृथ्वी दैनिक घुम्दा कुनै पनि किनार यी दुई उभारबाट गुज्रिन्छ।',
    },
  ];

  // Helper to map mouse/touch event into internal canvas coordinates
  const getCanvasCoords = (
    e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Canvas Drawing Engine (High-DPI Razor Sharp Rendering)
  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const time = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    if (viewMode === 'beach') {
      // ══════════════════════════════════════════════════════════════
      // MODE 1: BEACH / COASTLINE PERSPECTIVE (Matching User Reference)
      // ══════════════════════════════════════════════════════════════

      // 1. Deep Night Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.72);
      skyGrad.addColorStop(0, '#091528');
      skyGrad.addColorStop(0.5, '#132845');
      skyGrad.addColorStop(1, '#1b3a5c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Twinkling Background Stars
      starsBgRef.current.forEach((st, idx) => {
        const flicker = Math.sin(time * 2.5 + idx * 3) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, st.alpha + flicker)})`;
        ctx.beginPath();
        ctx.arc(st.x * width, st.y * height, st.r, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle on large stars
        if (st.r > 1.8 && idx % 6 === 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + flicker})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(st.x * width - 4, st.y * height);
          ctx.lineTo(st.x * width + 4, st.y * height);
          ctx.moveTo(st.x * width, st.y * height - 4);
          ctx.lineTo(st.x * width, st.y * height + 4);
          ctx.stroke();
        }
      });

      // 3. Soft Background Night Clouds (Matching Artwork Style)
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.fillStyle = 'rgba(38, 67, 100, 0.45)';
        ctx.beginPath();
        ctx.arc(cx, cy, 32 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 36 * scale, cy - 10 * scale, 44 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 82 * scale, cy + 4 * scale, 36 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 40 * scale, cy + 18 * scale, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(width * 0.12 + Math.sin(time * 0.2) * 15, height * 0.32, 1.1);
      drawCloud(width * 0.82 - Math.sin(time * 0.25) * 12, height * 0.28, 1.3);

      // 4. Coordinates for Moon and Water Bulge
      const moonX = width * moonXRel;
      // moonHighY: High up in deep sky (Apogee, far distance d = 90)
      // moonNearWaterY: Down near ocean surface (Perigee, close distance d = 20)
      const moonHighY = height * 0.16;
      const moonNearWaterY = height * 0.38;
      const distFrac = (moonDistRel - 20) / 70; // 0 when close to water, 1 when high in sky
      const moonY = moonNearWaterY - distFrac * (moonNearWaterY - moonHighY);
      const moonRadius = 38 + (1.0 - distFrac) * 16; // 38px when far in sky, up to 54px when near water

      // 5. Baseline Ground & Ocean Geometry
      const groundY = height * 0.76; // Green Earth ground baseline
      const oceanBaseY = height * 0.72; // Normal water baseline

      // Bulge height calculation:
      // When Moon is near water (strainLevel is high), peakHeight reaches 150px
      // When Moon is high in sky (strainLevel is 0), peakHeight is ~8px (normal calm water)
      const maxPeakH = 150;
      const peakHeight = Math.min(maxPeakH, 8 + strainLevel * 142);
      const bulgeCenterY = oceanBaseY - peakHeight;

      // ── DRAW MOON'S GRAVITATIONAL PULL ARROWS (Reference Artwork) ──
      const arrowTopY = moonY + moonRadius + 14;
      const arrowBottomY = bulgeCenterY - 12;

      if (arrowBottomY > arrowTopY + 18) {
        // Central Dotted Plumb Line (connecting Moon center to bulge crest)
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(moonX, moonY + moonRadius);
        ctx.lineTo(moonX, bulgeCenterY);
        ctx.stroke();
        ctx.restore();

        // 3 Glowing Orange Downward Arrow Columns (left, center, right)
        const arrowOffsets = [-32, 0, 32];
        const pulse = Math.sin(time * 5) * 0.15 + 0.85;

        arrowOffsets.forEach((ox) => {
          const ax = moonX + ox;
          const aLen = arrowBottomY - arrowTopY;

          // Glowing energy shaft gradient
          const arrowGrad = ctx.createLinearGradient(ax, arrowTopY, ax, arrowBottomY);
          arrowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.15)');
          arrowGrad.addColorStop(0.4, `rgba(249, 115, 22, ${0.85 * pulse})`);
          arrowGrad.addColorStop(1, `rgba(234, 88, 12, ${1.0 * pulse})`);

          ctx.strokeStyle = arrowGrad;
          ctx.lineWidth = 5.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ax, arrowTopY);
          ctx.lineTo(ax, arrowBottomY);
          ctx.stroke();

          // Arrowhead (V-tip)
          const headSize = 14;
          ctx.fillStyle = `rgba(249, 115, 22, ${1.0 * pulse})`;
          ctx.beginPath();
          ctx.moveTo(ax, arrowBottomY + 5);
          ctx.lineTo(ax - headSize * 0.65, arrowBottomY - headSize);
          ctx.lineTo(ax + headSize * 0.65, arrowBottomY - headSize);
          ctx.closePath();
          ctx.fill();

          // Downward streaming energy particles
          for (let p = 0; p < 2; p++) {
            const pProg = (time * 1.8 + ox * 0.08 + p * 0.5) % 1.0;
            const py = arrowTopY + pProg * aLen;
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(ax, py, 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Glowing Text Label for Gravitational Pull with smart flip
        ctx.save();
        ctx.font = '800 14px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(249, 115, 22, 0.95)';
        ctx.shadowBlur = 9;

        const isArrowsOnRightSide = moonX > width * 0.62;
        ctx.textAlign = isArrowsOnRightSide ? 'right' : 'left';
        const labelX = isArrowsOnRightSide ? moonX - 52 : moonX + 52;
        const labelY = (arrowTopY + arrowBottomY) / 2;
        ctx.fillText(
          lang === 'ne' ? 'चन्द्रमाको गुरुत्वाकर्षण बल' : "Moon's Gravitational Pull",
          labelX,
          labelY
        );
        ctx.restore();
      }

      // ── DRAW MOON (Kawaii Cartoon Smiling Celestial Body) ───────────
      ctx.save();
      // Outer Soft Atmospheric Glow
      const moonGlow = ctx.createRadialGradient(
        moonX,
        moonY,
        moonRadius * 0.75,
        moonX,
        moonY,
        moonRadius * 1.65
      );
      moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      moonGlow.addColorStop(0.5, 'rgba(224, 242, 254, 0.18)');
      moonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 1.65, 0, Math.PI * 2);
      ctx.fill();

      // Moon Body Gradient
      const moonBodyGrad = ctx.createRadialGradient(
        moonX - moonRadius * 0.3,
        moonY - moonRadius * 0.3,
        moonRadius * 0.15,
        moonX,
        moonY,
        moonRadius
      );
      moonBodyGrad.addColorStop(0, '#ffffff');
      moonBodyGrad.addColorStop(0.75, '#f1f5f9');
      moonBodyGrad.addColorStop(1, '#cbd5e1');

      ctx.fillStyle = moonBodyGrad;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Craters matching artwork
      const craters = [
        { dx: -0.45, dy: -0.35, r: 0.16 },
        { dx: 0.25, dy: -0.45, r: 0.18 },
        { dx: 0.52, dy: -0.22, r: 0.14 },
        { dx: -0.55, dy: 0.28, r: 0.15 },
        { dx: -0.28, dy: 0.52, r: 0.13 },
        { dx: 0.42, dy: 0.38, r: 0.16 },
      ];
      craters.forEach((c) => {
        const cx = moonX + c.dx * moonRadius;
        const cy = moonY + c.dy * moonRadius;
        const cr = c.r * moonRadius;
        ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Kawaii Cartoon Eyes on Moon
      const eyeOffsetX = moonRadius * 0.3;
      const eyeY = moonY - moonRadius * 0.05;
      const eyeR = Math.max(3.2, moonRadius * 0.08);

      // Left Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(moonX - eyeOffsetX, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(moonX - eyeOffsetX - 1.2, eyeY - 1.2, eyeR * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(moonX + eyeOffsetX, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(moonX + eyeOffsetX - 1.2, eyeY - 1.2, eyeR * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Cute Rosy Cheeks
      ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
      ctx.beginPath();
      ctx.arc(moonX - eyeOffsetX - 3, eyeY + 7, eyeR * 1.1, 0, Math.PI * 2);
      ctx.arc(moonX + eyeOffsetX + 3, eyeY + 7, eyeR * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Friendly Curved Smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(moonX, eyeY + 5, moonRadius * 0.26, 0.15 * Math.PI, 0.85 * Math.PI, false);
      ctx.stroke();

      // "Moon" Label with smart flip
      ctx.font = '800 18px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;
      if (moonX < width * 0.8) {
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'ne' ? 'चन्द्रमा (Moon)' : 'Moon', moonX + moonRadius + 12, moonY + 6);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(lang === 'ne' ? 'चन्द्रमा (Moon)' : 'Moon', moonX - moonRadius - 12, moonY + 6);
      }

      // Interactive Drag Indicator Halo when hovering or dragging
      if (isDraggingMoon || isHoveringMoon) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius + 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // ── DRAW SUN IF IN SPRING OR NEAP TIDE MODE ────────────────────
      if (alignment === 'spring' || alignment === 'neap') {
        const sunX = alignment === 'spring' ? width * 0.1 : width * 0.9;
        const sunY = height * 0.18;
        const sunR = 28;

        ctx.save();
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4 + time * 0.5;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(ang) * (sunR + 4), sunY + Math.sin(ang) * (sunR + 4));
          ctx.lineTo(sunX + Math.cos(ang) * (sunR + 12), sunY + Math.sin(ang) * (sunR + 12));
          ctx.stroke();
        }
        const sunGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR);
        sunGrad.addColorStop(0, '#fef08a');
        sunGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '700 11px system-ui, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(alignment === 'spring' ? 'Sun (Aligned)' : 'Sun (90° Quad)', sunX, sunY + sunR + 16);
        ctx.restore();
      }

      // ── DRAW OCEAN & HIGH TIDE WATER BULGE (Cartoon Strained Water) ─
      ctx.save();
      const wavePoints: Array<{ x: number; y: number }> = [];
      const steps = 140;
      const sigma = 90 + (moonDistRel / 100) * 35; // Bulge width

      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const ripple = Math.sin(x * 0.02 + time * 3) * 3 + Math.cos(x * 0.04 - time * 2) * 2;
        const distFromMoon = x - moonX;
        const gaussianBulge = peakHeight * Math.exp(-(distFromMoon * distFromMoon) / (2 * sigma * sigma));
        const y = oceanBaseY - gaussianBulge + ripple;
        wavePoints.push({ x, y });
      }

      // Render Ocean Water Fill
      const oceanGrad = ctx.createLinearGradient(0, bulgeCenterY, 0, height);
      oceanGrad.addColorStop(0, '#38bdf8'); // Bright cyan crest
      oceanGrad.addColorStop(0.25, '#0284c7'); // Ocean body
      oceanGrad.addColorStop(0.7, '#0369a1');
      oceanGrad.addColorStop(1, '#075985');

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, wavePoints[0].y);
      wavePoints.forEach((pt) => {
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Top glistening water highlight crest
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      wavePoints.forEach((pt) => {
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // ── DRAW CARTOON WATER CHARACTER FACE & HANDS (Reference Artwork) ──
      const faceX = moonX;
      const faceY = bulgeCenterY + 42;

      // 1. Water Arms & Hands holding onto the green Earth!
      const handDist = 65;
      const handY = groundY + 5;

      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#0284c7';
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';

      // Left Arm & Hand clutching Earth
      ctx.beginPath();
      ctx.moveTo(faceX - 30, faceY + 14);
      ctx.quadraticCurveTo(faceX - handDist * 0.88, faceY + 28, faceX - handDist, handY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(faceX - handDist, handY, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right Arm & Hand clutching Earth
      ctx.beginPath();
      ctx.moveTo(faceX + 30, faceY + 14);
      ctx.quadraticCurveTo(faceX + handDist * 0.88, faceY + 28, faceX + handDist, handY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(faceX + handDist, handY, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Cartoon Face on the Water (Strain vs Relaxed)
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = '#0f172a';
      ctx.lineCap = 'round';

      if (strainLevel > 0.35) {
        // Squinting Strained Eyes: > <
        ctx.beginPath();
        ctx.moveTo(faceX - 24, faceY - 7);
        ctx.lineTo(faceX - 15, faceY);
        ctx.lineTo(faceX - 24, faceY + 7);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(faceX + 24, faceY - 7);
        ctx.lineTo(faceX + 15, faceY);
        ctx.lineTo(faceX + 24, faceY + 7);
        ctx.stroke();

        // Furrowed angry/straining eyebrows
        ctx.beginPath();
        ctx.moveTo(faceX - 26, faceY - 13);
        ctx.lineTo(faceX - 12, faceY - 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(faceX + 26, faceY - 13);
        ctx.lineTo(faceX + 12, faceY - 7);
        ctx.stroke();

        // Gritted Teeth / Grimacing Mouth
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.roundRect(faceX - 17, faceY + 9, 34, 15, 5);
        ctx.fill();
        ctx.stroke();
        // Horizontal teeth line
        ctx.beginPath();
        ctx.moveTo(faceX - 15, faceY + 16);
        ctx.lineTo(faceX + 15, faceY + 16);
        ctx.stroke();
        // Vertical teeth lines
        for (let tx = -9; tx <= 9; tx += 6) {
          ctx.beginPath();
          ctx.moveTo(faceX + tx, faceY + 10);
          ctx.lineTo(faceX + tx, faceY + 23);
          ctx.stroke();
        }

        // Flying Sweat Droplets under intense gravitational strain!
        if (strainLevel > 0.5) {
          const drawSweat = (sx: number, sy: number) => {
            ctx.fillStyle = '#e0f2fe';
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(sx + 5, sy + 7, sx + 4, sy + 10);
            ctx.arc(sx, sy + 10, 4, 0, Math.PI);
            ctx.quadraticCurveTo(sx - 5, sy + 7, sx, sy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          };
          drawSweat(faceX - 34 + Math.sin(time * 6) * 3, faceY - 21);
          drawSweat(faceX + 34 + Math.cos(time * 6) * 3, faceY - 19);
        }
      } else {
        // Mild relaxed water smile
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(faceX - 16, faceY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(faceX + 16, faceY - 2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(faceX, faceY + 4, 10, 0.2 * Math.PI, 0.8 * Math.PI, false);
        ctx.stroke();
      }

      // ── LABELS (Matching Reference Illustration with Smart Anti-Clipping) ──
      ctx.font = '800 15px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;

      const isCrestOnLeftSide = faceX < width * 0.38;
      if (isCrestOnLeftSide) {
        ctx.textAlign = 'left';
        ctx.fillText(
          lang === 'ne' ? 'उच्च ज्वार (उभारिएको पानी)' : 'High Tide (Bulging Water)',
          faceX + 46,
          faceY - 20
        );
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(
          lang === 'ne' ? 'उच्च ज्वार (उभारिएको पानी)' : 'High Tide (Bulging Water)',
          faceX - 42,
          faceY - 20
        );
      }

      // "Ocean" Label on right water body
      ctx.textAlign = 'left';
      ctx.font = '800 17px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      const oceanLabelX = faceX > width * 0.55 ? width * 0.12 : width * 0.78;
      ctx.fillText(lang === 'ne' ? 'समुद्र (Ocean)' : 'Ocean', oceanLabelX, oceanBaseY + 34);
      ctx.restore();

      // ── DRAW GREEN EARTH SHORELINE & TERRAIN (Matching Reference) ─
      ctx.save();
      const earthGrad = ctx.createLinearGradient(0, groundY, 0, height);
      earthGrad.addColorStop(0, '#84cc16'); // Vibrant Lime grass
      earthGrad.addColorStop(0.3, '#65a30d'); // Lush foliage
      earthGrad.addColorStop(0.7, '#4d7c0f'); // Forest green
      earthGrad.addColorStop(1, '#3f6212'); // Rich deep ground
      ctx.fillStyle = earthGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Top Grass Blades & Specular Highlight
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // "Earth" Label centered directly below the water hands
      ctx.font = '900 22px system-ui, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      const earthLabelX = Math.max(90, Math.min(width - 90, faceX));
      ctx.fillText(lang === 'ne' ? 'पृथ्वी (Earth)' : 'Earth', earthLabelX, groundY + 40);
      ctx.restore();

      // ── MOORED FISHING BOAT FLOATING ON WATER ──────────────────────
      const boatX = faceX > width * 0.5 ? width * 0.18 : width * 0.86;
      const boatY = oceanBaseY + Math.sin(time * 2.5) * 3 - 6;

      ctx.save();
      ctx.translate(boatX, boatY);
      ctx.rotate(Math.sin(time * 2) * 0.06);

      // Boat Hull
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(20, 0);
      ctx.lineTo(15, 11);
      ctx.lineTo(-15, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mast & Sail
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -20);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(13, -7);
      ctx.lineTo(0, -5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      // ══════════════════════════════════════════════════════════════
      // MODE 2: GLOBAL EARTH ORBIT PERSPECTIVE (Dual Bulges Physics)
      // ══════════════════════════════════════════════════════════════

      ctx.fillStyle = '#050c18';
      ctx.fillRect(0, 0, width, height);

      starsBgRef.current.forEach((st) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.beginPath();
        ctx.arc(st.x * width, st.y * height, st.r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      const earthCenterX = width * 0.38;
      const earthCenterY = height * 0.52;
      const earthR = 76;

      const orbitDist = 195 + (moonDistRel / 100) * 80;
      const moonAngle = (moonXRel - 0.5) * Math.PI * 1.6;
      const moonOrbX = earthCenterX + Math.cos(moonAngle) * orbitDist;
      const moonOrbY = earthCenterY + Math.sin(moonAngle) * orbitDist;
      const moonOrbR = 24 + (moonMassRel / 100) * 11;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, orbitDist, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const axisAngle = Math.atan2(moonOrbY - earthCenterY, moonOrbX - earthCenterX);
      const bulgeScale = 17 + strainLevel * 23;

      ctx.save();
      ctx.translate(earthCenterX, earthCenterY);
      ctx.rotate(axisAngle);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, earthR + bulgeScale, earthR - bulgeScale * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? 'प्रत्यक्ष उच्च ज्वार' : 'Sub-lunar High Tide', earthR + bulgeScale + 8, 4);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText(lang === 'ne' ? 'विपरीत उच्च ज्वार' : 'Antipodal High Tide', -earthR - bulgeScale - 8, 4);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.fillText(lang === 'ne' ? 'न्यून ज्वार (भाटा)' : 'Low Tide', 0, -earthR + 14);
      ctx.fillText(lang === 'ne' ? 'न्यून ज्वार (भाटा)' : 'Low Tide', 0, earthR - 4);
      ctx.restore();

      ctx.save();
      const earthGrad = ctx.createRadialGradient(
        earthCenterX - 22,
        earthCenterY - 22,
        18,
        earthCenterX,
        earthCenterY,
        earthR
      );
      earthGrad.addColorStop(0, '#38bdf8');
      earthGrad.addColorStop(0.6, '#0284c7');
      earthGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(earthCenterX - 18, earthCenterY - 14, 26, 0, Math.PI * 1.5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(earthCenterX + 22, earthCenterY + 18, 20, 0, Math.PI * 1.8);
      ctx.fill();

      ctx.font = '900 17px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ne' ? 'पृथ्वी' : 'Earth', earthCenterX, earthCenterY + 6);
      ctx.restore();

      ctx.save();
      const moonGlow = ctx.createRadialGradient(
        moonOrbX,
        moonOrbY,
        moonOrbR * 0.8,
        moonOrbX,
        moonOrbY,
        moonOrbR * 1.6
      );
      moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      moonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonOrbX, moonOrbY, moonOrbR * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(moonOrbX, moonOrbY, moonOrbR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ne' ? 'चन्द्रमा (Moon)' : 'Moon', moonOrbX, moonOrbY + moonOrbR + 16);
      ctx.restore();
    }
  }, [
    viewMode,
    alignment,
    moonXRel,
    moonDistRel,
    moonMassRel,
    strainLevel,
    isDraggingMoon,
    isHoveringMoon,
    lang,
  ]);

  // Animation Loop
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      timeRef.current += dt * 1.2;

      drawSimulation();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawSimulation]);

  // Pointer Event Handlers for Direct 2D Moon Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (viewMode !== 'beach') return;
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const moonX = width * moonXRel;
    const moonHighY = height * 0.16;
    const moonNearWaterY = height * 0.38;
    const distFrac = (moonDistRel - 20) / 70;
    const moonY = moonNearWaterY - distFrac * (moonNearWaterY - moonHighY);
    const moonRadius = 38 + (1.0 - distFrac) * 16;

    const dist = Math.hypot(x - moonX, y - moonY);
    if (dist <= moonRadius + 22) {
      setIsDraggingMoon(true);
      (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
      ScienceAudio.playClick();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode !== 'beach') return;
    const { x, y } = getCanvasCoords(e);
    const width = canvas.width;
    const height = canvas.height;

    const moonX = width * moonXRel;
    const moonHighY = height * 0.16;
    const moonNearWaterY = height * 0.38;
    const distFrac = (moonDistRel - 20) / 70;
    const moonY = moonNearWaterY - distFrac * (moonNearWaterY - moonHighY);
    const moonRadius = 38 + (1.0 - distFrac) * 16;
    const dist = Math.hypot(x - moonX, y - moonY);

    setIsHoveringMoon(dist <= moonRadius + 22);

    if (!isDraggingMoon) return;

    // Direct X tracking (horizontal angle across sky)
    const newXRel = Math.max(0.15, Math.min(0.85, x / width));
    setMoonXRel(newXRel);

    // Direct Y tracking:
    // Dragging DOWN towards water (y increases towards moonNearWaterY) -> distance DECREASES (gets closer: 20)
    // Dragging UP towards deep sky (y decreases towards moonHighY) -> distance INCREASES (gets farther: 90)
    const clampedY = Math.max(moonHighY, Math.min(moonNearWaterY, y));
    const fracFarFromWater = (moonNearWaterY - clampedY) / (moonNearWaterY - moonHighY);
    const newDist = 20 + fracFarFromWater * 70;
    setMoonDistRel(Math.round(newDist));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingMoon) {
      setIsDraggingMoon(false);
      try {
        (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      ScienceAudio.playSuccess();
    }
  };

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setAlignment(preset.alignment);
    setMoonDistRel(preset.moonDistance);
    setMoonMassRel(preset.moonMass);
    setMoonXRel(preset.moonXRel);
    ScienceAudio.playClick();
  };

  const handleReset = () => {
    setActivePreset('cartoon-classic');
    setMoonXRel(0.5);
    setMoonDistRel(45);
    setMoonMassRel(55);
    setAlignment('lunar');
    setViewMode('beach');
    setQuizIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    ScienceAudio.playClick();
  };

  const handleQuizAnswer = (optIdx: number) => {
    setSelectedOption(optIdx);
    const currQ = quizQuestions[quizIdx];
    if (optIdx === currQ.correct) {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'ne' ? 'उत्कृष्ट! सही उत्तर।' : 'Excellent! Correct Answer.');
      setQuizScore((prev) => prev + 1);
    } else {
      ScienceAudio.playError();
      setQuizFeedback(
        lang === 'ne'
          ? 'पुनः प्रयास गर्नुहोस् वा व्याख्या पढ्नुहोस्।'
          : 'Incorrect. Check the explanation below.'
      );
    }
  };

  return (
    <SimulationLayout
      titleEn="Ocean Tides and Lunar Gravitation"
      titleNe="समुद्री ज्वारभाटा र चन्द्रमाको गुरुत्वाकर्षण बल"
      chapterNumber={1}
      chapterTitle="Force and Gravitation"
      chapterTitleNepali="बल र गुरुत्वाकर्षण"
      subject="Science & Technology"
      grade={10}
      currentStage={stage}
      onStageChange={(s) => {
        setStage(s);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={(l) => setLang(l)}
      stars={stars}
      maxStars={3}
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
            LEFT COLUMN: INTERACTIVE 2D TIDAL DYNAMICS VIEWPORT
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
              cursor: viewMode === 'beach' ? (isDraggingMoon ? 'grabbing' : isHoveringMoon ? 'grab' : 'default') : 'default',
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* Top Floating Physics Law & View Badges */}
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
              <span>F_tide = (2 · G · M · R) / d³</span>
              <span style={{ color: '#fbbf24' }}>∝ {netTidalStrength.toFixed(2)} · F₀</span>
              <span style={{ color: '#4ade80' }}>(Bulge: {tidalHeightMeters}m)</span>
            </div>

            <button
              onClick={() => {
                setViewMode(viewMode === 'beach' ? 'global' : 'beach');
                ScienceAudio.playClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Waves size={14} color="#38bdf8" />
              {viewMode === 'beach'
                ? (lang === 'ne' ? 'तटीय दृश्य' : 'Beach View')
                : (lang === 'ne' ? 'विश्वव्यापी दृश्य' : 'Global View')}
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

          {/* Bottom Floating Status & Tip Dock */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#475569' }}>
              <span>🖐️</span>
              <span>
                {lang === 'ne'
                  ? 'चन्द्रमालाई सिधै क्यानभासमा समातेर पानी नजिक ल्याउँदा उच्च ज्वारभाटा आउँछ!'
                  : 'Drag Moon directly on canvas or adjust sliders to see dynamic oceanic tidal bulge!'}
              </span>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              {lang === 'ne' ? 'ज्वारीय उचाइ: ' : 'Tidal Bulge: '}
              <strong style={{ color: '#4ade80' }}>{tidalHeightMeters}m</strong>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: TIDAL DISCOVERY STATION & CONTROLS (380px)
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
              <Waves size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'समुद्री ज्वारभाटा अनुसन्धान' : 'Ocean Tides Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'चन्द्रमाको गुरुत्वाकर्षण विभेदक बलले समुद्री पानी माथितिर तानेर कसरी ज्वारभाटा उत्पन्न गर्छ अध्ययन गर्नुहोस्।'
                : 'Investigate differential gravitational attraction between near and far ocean surfaces producing semi-diurnal tides.'}
            </div>
          </div>

          {/* Preset Scenarios (2x2 Grid) */}
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
                    onClick={() => applyPreset(p)}
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

          {/* Environmental Sliders */}
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
            {/* Lunar Mass (M) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                  {lang === 'ne' ? 'चन्द्रमाको पिण्ड (M):' : 'Lunar Mass (M):'}
                </span>
                <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                  {(moonMassRel / 50).toFixed(1)}× M_moon
                </strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={moonMassRel}
                onChange={(e) => {
                  ScienceAudio.playPop();
                  setMoonMassRel(Number(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            {/* Earth-Moon Distance (d) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#4ade80' }}>
                  {lang === 'ne' ? 'दूरी (d):' : 'Distance (d):'}
                </span>
                <strong style={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '10px' }}>
                  {moonDistRel <= 30
                    ? (lang === 'ne' ? 'पेरिजी (नजिक)' : 'Perigee (Near)')
                    : moonDistRel >= 70
                    ? (lang === 'ne' ? 'अपोजी (टाढा)' : 'Apogee (Far)')
                    : '384,400 km'}
                </strong>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={moonDistRel}
                onChange={(e) => {
                  ScienceAudio.playPop();
                  setMoonDistRel(Number(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#4ade80', cursor: 'pointer' }}
              />
            </div>

            {/* Moon Sky Position (Horizontal Angle) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                  {lang === 'ne' ? 'आकाशीय स्थान (Position):' : 'Moon Sky Position:'}
                </span>
                <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>
                  {Math.round(moonXRel * 100)}%
                </strong>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                step="2"
                value={Math.round(moonXRel * 100)}
                onChange={(e) => {
                  ScienceAudio.playPop();
                  setMoonXRel(Number(e.target.value) / 100);
                }}
                style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
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
              <div>{lang === 'ne' ? '• चन्द्रमाको गुरुत्वाकर्षण बलले समुद्री पानी माथितिर फुल्लिन्छ।' : '• Lunar differential pull deforms ocean water into dual tidal bulges.'}</div>
              <div>{lang === 'ne' ? '• ज्वारीय बल दूरीको तेस्रो घातसँग घट्छ (F_tide ∝ 1/d³)।' : '• Tidal force obeys an Inverse Cube Law (F_tide ∝ 1/d³).'}</div>
              <div>{lang === 'ne' ? '• सूर्य र चन्द्रमा एकै दिशामा हुँदा बृहत् ज्वार (Spring Tide) आउँछ।' : '• Syzygy alignment at New/Full Moon causes maximum Spring Tides.'}</div>
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
            {lang === 'en' ? 'Complete Ocean Tides Lab & Quiz' : 'समुद्री ज्वारभाटा प्रयोग पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default TidesGravitationSim;
