/**
 * AnimalClassificationSim.tsx
 * Master Interactive 2D Animal Taxonomy Studio: Vertebrates & Invertebrates
 * (जनावरको वर्गीकरण - 2डी अन्तरक्रियात्मक जीव विज्ञान प्रयोगशाला)
 * Grade 4 Science • Chapter 4: Classification of Living Beings
 *
 * 100% Native 2D Canvas & Vector Graphics (Zero WebGL/3D Dependencies)
 * - Ultra-Rich Natural Colors & Fauna of Nepal:
 *   1. Himalayan Monal / Danfe: 9-colored iridescent plumage, curved beak, bony spine.
 *   2. Tree Frog: Vertebrate amphibian, webbed toes, internal skeletal backbone.
 *   3. Garden Snail: Invertebrate mollusk, spiral shell, soft muscular foot, no backbone.
 *   4. Himalayan Snow Trout / Asala: Freshwater vertebrate with bony vertebral column and swimming fins.
 *   5. Monarch Butterfly: Invertebrate arthropod with chitinous exoskeleton and 6 jointed legs.
 * - Interactive X-Ray Backbone Scanner:
 *   Toggles an illuminated view showing the internal vertebral spine in vertebrates vs. exoskeleton in invertebrates.
 * - Interactive Sorting Laboratory: Drag or classify specimens into Vertebrate vs. Invertebrate collections.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Sparkles,
  Check,
  ShieldCheck,
  RotateCcw,
  Eye,
  Layers,
  Award,
} from 'lucide-react';

interface AnimalSpecimen {
  id: string;
  nameEn: string;
  nameNe: string;
  isVertebrate: boolean;
  groupEn: string;
  groupNe: string;
  characteristicsEn: string;
  characteristicsNe: string;
  descriptionEn: string;
  descriptionNe: string;
  backboneInfoEn: string;
  backboneInfoNe: string;
  themeColor: string;
}

export const AnimalClassificationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [showXRayBackbone, setShowXRayBackbone] = useState<boolean>(false);

  // Sorting game state
  const [sortedMap, setSortedMap] = useState<Record<string, 'vertebrate' | 'invertebrate'>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Challenge stage state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const specimens: AnimalSpecimen[] = [
    {
      id: 'danfe',
      nameEn: 'Himalayan Monal / Danfe',
      nameNe: 'डाँफे (नेपालको राष्ट्रिय चरा)',
      isVertebrate: true,
      groupEn: 'Vertebrate • Class Aves (Bird)',
      groupNe: 'ढाड भएको • चरा वर्ग (Aves)',
      characteristicsEn: 'Iridescent rainbow feathers, curved beak, hollow bones, warm-blooded.',
      characteristicsNe: 'रङ्गीचङ्गी प्वाँख, बलियो चुच्चो, हावाले भरिएका हल्का हड्डी र तातो रगत।',
      descriptionEn: 'The National Bird of Nepal (Lophophorus impejanus). It possesses an internal bony vertebral column that anchors its strong flight and running muscles.',
      descriptionNe: 'नेपालको राष्ट्रिय चरा डाँफे। यसको शरीरभित्र बलियो ढाडको हड्डी (मेरुदण्ड) हुन्छ जसले पखेटा र खुट्टालाई सहारा दिन्छ।',
      backboneInfoEn: 'VERTEBRATE: Internal spine of vertebrae connected to skull and ribs.',
      backboneInfoNe: 'ढाड भएको: शरीरभित्र बलियो मेरुदण्ड र करङको कङ्काल हुन्छ।',
      themeColor: '#0284c7',
    },
    {
      id: 'frog',
      nameEn: 'Tree Frog',
      nameNe: 'रुख भ्यागुतो (Tree Frog)',
      isVertebrate: true,
      groupEn: 'Vertebrate • Class Amphibia',
      groupNe: 'ढाड भएको • उभयचर वर्ग (Amphibia)',
      characteristicsEn: 'Moist glandular skin, webbed feet, dual aquatic-terrestrial life, cold-blooded.',
      characteristicsNe: 'ओसिलो छाला, उफ्रिने लामो खुट्टा, पानी र जमिन दुवै ठाउँमा बस्न सक्ने।',
      descriptionEn: 'Amphibians have a flexible internal bony skeleton with a short vertebral column and urostyle adapted for high-power leaping.',
      descriptionNe: 'रुख भ्यागुतो उभयचर ढाड भएको जनावर हो। यसको भित्री कङ्कालले उफ्रन र पौडिन मद्दत गर्छ।',
      backboneInfoEn: 'VERTEBRATE: Bony spine protecting spinal cord nerve center.',
      backboneInfoNe: 'ढाड भएको: मेरुदण्डले स्नायु प्रणालीलाई सुरक्षित राख्छ।',
      themeColor: '#22c55e',
    },
    {
      id: 'snail',
      nameEn: 'Garden Snail',
      nameNe: 'शङ्खे किरा (Garden Snail)',
      isVertebrate: false,
      groupEn: 'Invertebrate • Phylum Mollusca',
      groupNe: 'ढाड नभएको • मोलस्का (Mollusca)',
      characteristicsEn: 'Spiral calcium carbonate shell, soft unsegmented body, muscular creeping foot.',
      characteristicsNe: 'घुम्रिएको कडा शङ्ख, नरम शरीर, र घस्रिने मांसपेशीयुक्त पैताला।',
      descriptionEn: 'Invertebrate without internal bones. It secretes an external protective shell and crawls using hydrostatic pressure in its muscular foot.',
      descriptionNe: 'शङ्खे किराको शरीरभित्र ढाडको हड्डी हुँदैन। यसले बाहिरी कडा शङ्खभित्र आफ्नो नरम शरीर लुकाउँछ।',
      backboneInfoEn: 'INVERTEBRATE: Zero internal bones. Shell is external exoskeleton.',
      backboneInfoNe: 'ढाड नभएको: शरीरभित्र कुनै हड्डी हुँदैन, बाहिर कडा शङ्ख मात्र हुन्छ।',
      themeColor: '#eab308',
    },
    {
      id: 'trout',
      nameEn: 'Himalayan Snow Trout / Asala',
      nameNe: 'असला माछा (Himalayan Trout)',
      isVertebrate: true,
      groupEn: 'Vertebrate • Class Pisces (Fish)',
      groupNe: 'ढाड भएको • माछा वर्ग (Pisces)',
      characteristicsEn: 'Streamlined body, gills for breathing underwater, fin locomotion, cold-blooded.',
      characteristicsNe: 'पानी चिर्ने डुङ्गा आकार, फुल्का (Gills) बाट सास फेर्ने, कडा कत्ला र पखेटा।',
      descriptionEn: 'Cold-water fish found in Himalayan torrents (Schizothorax). Its long flexible vertebral column enables sinuous swimming motion.',
      descriptionNe: 'पहाडी चिसो खोलामा पाइने असला माछा। यसको मेरुदण्डले पानीमा छालझैँ पौडिन मद्दत गर्छ।',
      backboneInfoEn: 'VERTEBRATE: Flexible segmented backbone from skull to caudal fin.',
      backboneInfoNe: 'ढाड भएको: टाउकोदेखि पुच्छरसम्म लामो मेरुदण्ड फैलिएको हुन्छ।',
      themeColor: '#06b6d4',
    },
    {
      id: 'butterfly',
      nameEn: 'Monarch Butterfly',
      nameNe: 'पुतली (Monarch Butterfly)',
      isVertebrate: false,
      groupEn: 'Invertebrate • Phylum Arthropoda',
      groupNe: 'ढाड नभएको • जोर्नीयुक्त खुट्टा (Arthropoda)',
      characteristicsEn: 'Chitinous exoskeleton, 3-part body (head, thorax, abdomen), 6 jointed legs, wings.',
      characteristicsNe: 'बाहिरी कडा छाला (Exoskeleton), 6 वटा जोर्नी भएका खुट्टा र रङ्गीचङ्गी पखेटा।',
      descriptionEn: 'Invertebrate arthropod. Supported entirely by an external chitin armor rather than an internal spine.',
      descriptionNe: 'पुतलीको शरीरभित्र ढाडको हड्डी हुँदैन। यसलाई बाहिरी कडा खोल (Chitin) ले अड्याउँछ।',
      backboneInfoEn: 'INVERTEBRATE: Rigid outer exoskeleton, no internal vertebrae.',
      backboneInfoNe: 'ढाड नभएको: बाहिरी खोलले शरीरलाई बचाउँछ, मेरुदण्ड हुँदैन।',
      themeColor: '#ea580c',
    },
  ];

  const currentSpecimen = specimens[activeIdx];

  const handleClassifyChoice = (choice: 'vertebrate' | 'invertebrate') => {
    const isCorrect = (choice === 'vertebrate') === currentSpecimen.isVertebrate;
    setSortedMap((prev) => ({ ...prev, [currentSpecimen.id]: choice }));

    if (isCorrect) {
      ScienceAudio.playSuccess();
      setFeedbackMsg({
        text: lang === 'en' ? `✓ Correct! ${currentSpecimen.nameEn} is a ${choice.toUpperCase()}.` : `✓ स्याबास! सही उत्तर।`,
        isCorrect: true,
      });
      if (Object.keys(sortedMap).length + 1 >= specimens.length) {
        setIsCompleted(true);
        setStars(3);
      }
    } else {
      ScienceAudio.playBonk();
      setFeedbackMsg({
        text: lang === 'en' ? `✗ Not quite. Inspect the X-Ray backbone scanner!` : `✗ मिलेन। कङ्काल स्क्यानर हेर्नुहोस्!`,
        isCorrect: false,
      });
    }
  };

  const handleReset = () => {
    setActiveIdx(0);
    setShowXRayBackbone(false);
    setSortedMap({});
    setFeedbackMsg(null);
    ScienceAudio.playWhoosh();
  };

  // ══════════════════════════════════════════════════════════════════
  // MASTER 2D CANVAS RENDERER: TAXONOMY TERRARIUM & X-RAY SKELETON
  // ══════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const timeSec = Date.now() * 0.001;

    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // 1. TERRARIUM LABORATORY HABITAT BACKGROUND
    // ─────────────────────────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (showXRayBackbone) {
      // Diagnostic Radiographic Indigo Chamber
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#0284c7');
    } else {
      // Natural Botanical Conservatory
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e293b');
      bgGrad.addColorStop(1, '#064e3b');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Terrarium Platform Table
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height * 0.72, width, height - height * 0.72);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, height * 0.72, width, height - height * 0.72);

    // ─────────────────────────────────────────────────────────────
    // 2. ACTIVE ANIMAL DRAWING & 2D ANIMATION
    // ─────────────────────────────────────────────────────────────
    ctx.save();
    const animX = centerX;
    const animY = centerY + 10;

    // ── ANIMAL 1: HIMALAYAN MONAL / DANFE ──
    if (currentSpecimen.id === 'danfe') {
      const breath = Math.sin(timeSec * 3) * 2;
      // Perched Rock Platform
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(animX, height * 0.74, 110, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Strong Legs & Claws
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(animX - 16, animY + 45);
      ctx.lineTo(animX - 22, height * 0.72);
      ctx.moveTo(animX + 16, animY + 45);
      ctx.lineTo(animX + 18, height * 0.72);
      ctx.stroke();

      // Danfe Body Plumage (Iridescent metallic rainbow feathers)
      const bodyGrad = ctx.createRadialGradient(animX, animY, 15, animX, animY, 65);
      bodyGrad.addColorStop(0, '#06b6d4'); // Turquoise chest
      bodyGrad.addColorStop(0.4, '#1d4ed8'); // Royal sapphire blue
      bodyGrad.addColorStop(0.75, '#4338ca'); // Purple indigo
      bodyGrad.addColorStop(1, '#047857'); // Emerald green wing coverts

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(animX, animY, 52, 44 + breath, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Iridescent Wings (Folded)
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.ellipse(animX + 15, animY + 5, 42, 22, 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Broad Cinnamon Rufous Tail
      ctx.fillStyle = '#c2410c'; // Warm copper cinnamon tail
      ctx.beginPath();
      ctx.moveTo(animX + 42, animY + 15);
      ctx.lineTo(animX + 105, animY + 35);
      ctx.lineTo(animX + 95, animY + 55);
      ctx.lineTo(animX + 32, animY + 30);
      ctx.closePath();
      ctx.fill();

      // Danfe Neck & Head with Turquoise Eye Patch
      const headX = animX - 48;
      const headY = animY - 38;

      ctx.fillStyle = '#059669'; // Emerald green head
      ctx.beginPath();
      ctx.arc(headX, headY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Turquoise Bare Skin Eye Ring (Diagnostic for Monal)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(headX + 4, headY - 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX + 4, headY - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Curved Horn-colored Beak
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(headX - 12, headY - 4);
      ctx.lineTo(headX - 32, headY + 2);
      ctx.lineTo(headX - 12, headY + 6);
      ctx.closePath();
      ctx.fill();

      // Crest Feathers (Crown of delicate spoon-tipped feathers)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      for (let cr = -2; cr <= 2; cr++) {
        ctx.beginPath();
        ctx.moveTo(headX, headY - 14);
        ctx.lineTo(headX + cr * 5 - 4, headY - 38 - Math.abs(cr) * 3);
        ctx.stroke();
        // Spoon tips
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(headX + cr * 5 - 4, headY - 38 - Math.abs(cr) * 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── X-RAY SKELETON OVERLAY (VERTEBRATE SPINAL COLUMN) ──
      if (showXRayBackbone) {
        ctx.strokeStyle = '#38bdf8'; // Glowing cyan vertebral column
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Spine tracing from skull to caudal pygostyle
        ctx.moveTo(headX, headY);
        ctx.quadraticCurveTo(animX - 25, animY - 20, animX, animY - 15);
        ctx.quadraticCurveTo(animX + 35, animY - 10, animX + 75, animY + 20);
        ctx.stroke();

        // Rib Cage Lines
        ctx.lineWidth = 2;
        for (let r = -2; r <= 2; r++) {
          ctx.beginPath();
          ctx.moveTo(animX + r * 12 - 10, animY - 12);
          ctx.lineTo(animX + r * 12 - 5, animY + 16);
          ctx.stroke();
        }

        // Skull & Wing bones
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── ANIMAL 2: TREE FROG ──
    else if (currentSpecimen.id === 'frog') {
      const breath = Math.sin(timeSec * 4) * 2;
      // Large Green Frog Body
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(animX, animY, 55, 42 + breath, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Folded Hind Legs
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(animX - 45, animY + 18, 32, 16, -0.4, 0, Math.PI * 2);
      ctx.ellipse(animX + 45, animY + 18, 32, 16, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Toe Pads (Suction disks)
      ctx.fillStyle = '#fde047';
      for (let tp = -2; tp <= 2; tp++) {
        ctx.beginPath();
        ctx.arc(animX - 60 + tp * 6, animY + 36, 4, 0, Math.PI * 2);
        ctx.arc(animX + 50 + tp * 6, animY + 36, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Big Bulging Golden Eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(animX - 24, animY - 32, 12, 0, Math.PI * 2);
      ctx.arc(animX + 24, animY - 32, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(animX - 30, animY - 34, 12, 4);
      ctx.fillRect(animX + 18, animY - 34, 12, 4);

      // ── X-RAY SKELETON OVERLAY (VERTEBRATE SPINAL COLUMN) ──
      if (showXRayBackbone) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        // Skull to Urostyle
        ctx.moveTo(animX, animY - 30);
        ctx.lineTo(animX, animY + 35);
        ctx.stroke();

        // 9 Vertebrae Segments
        for (let v = 0; v < 8; v++) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(animX, animY - 24 + v * 7, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ── ANIMAL 3: GARDEN SNAIL ──
    else if (currentSpecimen.id === 'snail') {
      const crawl = Math.sin(timeSec * 2) * 4;
      // Soft Muscular Foot (Pale beige)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(animX - 30, animY + 36, 85, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slender Head & Tentacles
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(animX - 95, animY + 26, 15, 0, Math.PI * 2);
      ctx.fill();

      // Upper Eyestalks (Retractable tentacles)
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(animX - 100, animY + 18);
      ctx.lineTo(animX - 118, animY - 14);
      ctx.moveTo(animX - 92, animY + 18);
      ctx.lineTo(animX - 106, animY - 18);
      ctx.stroke();

      // Eye dots
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(animX - 118, animY - 14, 3, 0, Math.PI * 2);
      ctx.arc(animX - 106, animY - 18, 3, 0, Math.PI * 2);
      ctx.fill();

      // Large Spiral Calcium Carbonate Shell
      const shellGrad = ctx.createRadialGradient(animX + 15, animY - 10, 10, animX + 15, animY - 10, 65);
      shellGrad.addColorStop(0, '#fef08a');
      shellGrad.addColorStop(0.4, '#d97706'); // Warm amber
      shellGrad.addColorStop(0.85, '#78350f'); // Deep chocolate brown
      shellGrad.addColorStop(1, '#451a03');

      ctx.fillStyle = shellGrad;
      ctx.beginPath();
      ctx.arc(animX + 15, animY - 10, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spiral Coils
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 7; a += 0.1) {
        const r = a * 2.8;
        const sx = animX + 15 + Math.cos(a) * r;
        const sy = animY - 10 + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // ── X-RAY SKELETON OVERLAY (INVERTEBRATE: NO SPINAL COLUMN) ──
      if (showXRayBackbone) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(animX - 100, animY - 80, 200, 32, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'en' ? 'NO INTERNAL BONES' : 'शरीरभित्र ढाड छैन (Invertebrate)', animX, animY - 60);
      }
    }

    // ── ANIMAL 4: HIMALAYAN SNOW TROUT / ASALA ──
    else if (currentSpecimen.id === 'trout') {
      const swimTail = Math.sin(timeSec * 8) * 16;
      // Streamlined Hydrodynamic Body
      const fishGrad = ctx.createLinearGradient(animX - 120, animY, animX + 110, animY);
      fishGrad.addColorStop(0, '#fef08a');
      fishGrad.addColorStop(0.35, '#06b6d4'); // Aquatic cyan
      fishGrad.addColorStop(0.7, '#0284c7');
      fishGrad.addColorStop(1, '#1e3a8a');

      // Caudal Forked Fin
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(animX + 90, animY);
      ctx.lineTo(animX + 145, animY - 32 + swimTail);
      ctx.lineTo(animX + 125, animY + swimTail);
      ctx.lineTo(animX + 145, animY + 32 + swimTail);
      ctx.closePath();
      ctx.fill();

      // Fish Torpedo Body
      ctx.fillStyle = fishGrad;
      ctx.beginPath();
      ctx.moveTo(animX - 120, animY);
      ctx.bezierCurveTo(animX - 75, animY - 38, animX + 45, animY - 32, animX + 95, animY);
      ctx.bezierCurveTo(animX + 45, animY + 32, animX - 75, animY + 38, animX - 120, animY);
      ctx.fill();
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(animX - 95, animY - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(animX - 95, animY - 6, 3, 0, Math.PI * 2);
      ctx.fill();

      // ── X-RAY SKELETON OVERLAY (VERTEBRATE SPINAL COLUMN) ──
      if (showXRayBackbone) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(animX - 85, animY);
        ctx.lineTo(animX + 90, animY);
        ctx.stroke();

        // Fish Bone Ribs (Dorsal & Ventral spines)
        ctx.lineWidth = 1.5;
        for (let b = -60; b <= 70; b += 12) {
          ctx.beginPath();
          ctx.moveTo(animX + b, animY);
          ctx.lineTo(animX + b + 6, animY - 18);
          ctx.moveTo(animX + b, animY);
          ctx.lineTo(animX + b + 6, animY + 18);
          ctx.stroke();
        }
      }
    }

    // ── ANIMAL 5: MONARCH BUTTERFLY ──
    else if (currentSpecimen.id === 'butterfly') {
      const flap = Math.cos(timeSec * 14) * 0.85;
      const wingScaleX = Math.cos(flap);

      // Draw Wings
      ctx.save();
      ctx.translate(animX, animY);
      ctx.scale(wingScaleX, 1);

      // Orange monarch wings
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(45, -80, 110, -75, 125, -35);
      ctx.bezierCurveTo(120, 15, 65, 20, 0, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Left wing
      ctx.save();
      ctx.translate(animX, animY);
      ctx.scale(-wingScaleX, 1);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(45, -80, 110, -75, 125, -35);
      ctx.bezierCurveTo(120, 15, 65, 20, 0, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Slender Body
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(animX, animY, 5, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── X-RAY SKELETON OVERLAY (INVERTEBRATE: NO SPINAL COLUMN) ──
      if (showXRayBackbone) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(animX - 100, animY - 80, 200, 32, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'en' ? 'NO INTERNAL BONES' : 'शरीरभित्र ढाड छैन (Invertebrate)', animX, animY - 60);
      }
    }
    ctx.restore();
  }, [currentSpecimen, showXRayBackbone, lang]);

  useEffect(() => {
    let handle: number;
    const loop = () => {
      renderCanvas();
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [renderCanvas]);

  // Quiz Questions for Stage: Challenge
  const quizQuestions = [
    {
      qEn: 'Which definitive anatomical feature separates Vertebrates from Invertebrates?',
      qNe: 'ढाड भएका (Vertebrates) र ढाड नभएका (Invertebrates) जनावरहरूलाई कुन अङ्गले छुट्याउँछ?',
      optionsEn: [
        'An internal vertebral column',
        'Having two colorful wings',
        'Living strictly in water ponds',
        'Having green skin',
      ],
      optionsNe: [
        'शरीरभित्र ढाडको हड्डी वा मेरुदण्ड (Backbone) हुनु',
        'दुईवटा रङ्गीचङ्गी पखेटा हुनु',
        'पोखरीमा मात्र बस्नु',
        'हरियो छाला हुनु',
      ],
      correct: 0,
      expEn: 'Vertebrates possess a series of articulating vertebrae (backbone) that encloses and protects the spinal nerve cord.',
      expNe: 'ढाड भएका जीवको शरीरभित्र मेरुदण्ड हुन्छ जसले शरीरलाई बलियो सहारा र आकार दिन्छ।',
    },
    {
      qEn: 'Why is the Danfe (Himalayan Monal) classified as a vertebrate bird?',
      qNe: 'डाँफे चरालाई किन ढाड भएको जीव (Vertebrate) मानिन्छ?',
      optionsEn: [
        'It has an internal bony vertebral column connected to its ribs and skull',
        'It eats grains from fields',
        'It lives in high snow mountains',
        'It has 9 colors on its feathers',
      ],
      optionsNe: [
        'यसको शरीरभित्र करङ र टाउकोसँग जोडिएको बलियो ढाडको हड्डी हुन्छ',
        'यसले खेतबारीको अन्न खान्छ',
        'यो हिउँ परेको हिमालमा बस्छ',
        'यसका प्वाँखमा 9 वटा रङ्ग हुन्छन्',
      ],
      correct: 0,
      expEn: 'Birds possess a lightweight, hollow bony endoskeleton anchored by a rigid vertebral column for flight.',
      expNe: 'चराहरूको शरीरभित्र उडान भर्न सक्ने बलियो कङ्काल र ढाडको हड्डी हुन्छ।',
    },
    {
      qEn: 'How does a Garden Snail protect its soft body without internal bones?',
      qNe: 'शरीरभित्र हड्डी नभएको शङ्खे किराले आफ्नो नरम शरीरलाई कसरी जोगाउँछ?',
      optionsEn: [
        'With a hard external spiral shell',
        'By flying high in the blue sky',
        'By digging into deep ice',
        'With sharp steel claws',
      ],
      optionsNe: [
        'बाहिरी कडा घुम्रिएको शङ्खभित्र लुकेर (Hard Shell)',
        'आकाशमा उडेर',
        'हिउँभित्र पसेर',
        'तिखा नङ्ग्राले',
      ],
      correct: 0,
      expEn: 'Snails are invertebrates that secrete a protective calcium carbonate shell as an exoskeleton.',
      expNe: 'शङ्खे किराको भित्र हड्डी हुँदैन तर यसले बाहिर कडा शङ्ख बनाएर शरीर सुरक्षित राख्छ।',
    },
  ];

  const handleQuizAnswer = (idx: number) => {
    setQuizSelected(idx);
    const curr = quizQuestions[quizIdx];
    if (idx === curr.correct) {
      setQuizFeedback('correct');
      ScienceAudio.playSuccess();
      setStars(3);
      setIsCompleted(true);
    } else {
      setQuizFeedback('wrong');
      ScienceAudio.playBonk();
    }
  };

  return (
    <SimulationLayout
      title="Animal Taxonomy Studio: Vertebrates & Invertebrates"
      titleNepali="जनावरको वर्गीकरण: ढाड भएका र ढाड नभएका जीवहरू"
      chapterNumber={4}
      chapterTitle="Classification of Living Beings"
      chapterTitleNepali="जीवहरूको वर्गीकरण"
      currentStage={stage}
      onStageChange={(st) => {
        setStage(st);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={(l) => {
        setLang(l);
        ScienceAudio.playClick();
      }}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Toggle the X-Ray Backbone Scanner to see the internal spine, then classify the animal as Vertebrate or Invertebrate!"
      currentPromptNe="कङ्काल स्क्यानर खोलेर भित्री ढाडको हड्डी हेर्नुहोस् र जीवलाई ढाड भएको वा नभएकोमा वर्गीकरण गर्नुहोस्!"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 390px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
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
          }}
        >
          <canvas
            ref={canvasRef}
            width={880}
            height={560}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Animal Selection Pills */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '6px',
              zIndex: 10,
            }}
          >
            {specimens.map((sp, i) => {
              const isCurrent = activeIdx === i;
              return (
                <button
                  key={sp.id}
                  onClick={() => {
                    setActiveIdx(i);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isCurrent ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                    background: isCurrent ? 'rgba(56, 189, 248, 0.3)' : 'rgba(15, 23, 42, 0.85)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {lang === 'en' ? sp.nameEn.split('/')[0].trim() : sp.nameNe.split('(')[0].trim()}
                </button>
              );
            })}
          </div>

          {/* Top-Right X-Ray Scanner Toggle */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => {
                setShowXRayBackbone(!showXRayBackbone);
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 15px',
                borderRadius: '10px',
                border: showXRayBackbone ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                background: showXRayBackbone ? 'rgba(56, 189, 248, 0.3)' : 'rgba(15, 23, 42, 0.88)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: showXRayBackbone ? '0 0 15px rgba(56, 189, 248, 0.5)' : 'none',
              }}
            >
              <Eye size={15} color={showXRayBackbone ? '#38bdf8' : '#cbd5e1'} />
              {lang === 'en'
                ? showXRayBackbone
                  ? 'X-Ray Skeleton: ON'
                  : 'X-Ray Backbone Scanner'
                : showXRayBackbone
                ? 'कङ्काल दृश्य: चालु'
                : 'ढाडको हड्डी जाँच्नुहोस्'}
            </button>
          </div>

          {/* Bottom Interactive Classification Choice Dock */}
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
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {lang === 'en' ? currentSpecimen.nameEn : currentSpecimen.nameNe}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {lang === 'en' ? 'Does this animal possess a backbone?' : 'के यस जनावरको शरीरभित्र ढाडको हड्डी छ?'}
              </div>
            </div>

            {/* Classification Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleClassifyChoice('vertebrate')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                }}
              >
                🦴 {lang === 'en' ? 'Vertebrate' : 'ढाड भएको (Vertebrate)'}
              </button>

              <button
                onClick={() => handleClassifyChoice('invertebrate')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
                }}
              >
                🪱 {lang === 'en' ? 'Invertebrate' : 'ढाड नभएको (Invertebrate)'}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: TAXONOMY LAB & CLASSIFICATION NOTES
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
          {/* Active Specimen Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(3, 105, 161, 0.05) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
              {lang === 'en' ? currentSpecimen.groupEn : currentSpecimen.groupNe}
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
              {lang === 'en' ? currentSpecimen.descriptionEn : currentSpecimen.descriptionNe}
            </div>
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.06)',
                fontSize: '11px',
                color: '#4ade80',
                fontWeight: 700,
              }}
            >
              {lang === 'en' ? currentSpecimen.backboneInfoEn : currentSpecimen.backboneInfoNe}
            </div>
          </div>

          {/* Feedback banner if classified */}
          {feedbackMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: feedbackMsg.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: feedbackMsg.isCorrect ? '1px solid #22c55e' : '1px solid #ef4444',
                color: feedbackMsg.isCorrect ? '#4ade80' : '#f87171',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {feedbackMsg.text}
            </div>
          )}

          {/* Progress Overview */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'CLASSIFIED ANIMALS' : 'वर्गीकृत गरिएका जनावरहरू'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {specimens.map((sp) => {
                const userChoice = sortedMap[sp.id];
                const isCorrect = userChoice ? (userChoice === 'vertebrate') === sp.isVertebrate : null;
                return (
                  <div
                    key={sp.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ color: '#0f172a' }}>{lang === 'en' ? sp.nameEn.split('/')[0] : sp.nameNe.split('(')[0]}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: userChoice ? (isCorrect ? '#4ade80' : '#f87171') : '#64748b',
                      }}
                    >
                      {userChoice ? (isCorrect ? '✓ Done' : '✗ Retry') : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage 5: Challenge Quiz Card */}
          {stage === 'challenge' && (
            <div
              style={{
                marginTop: 'auto',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Award size={16} color="#eab308" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#eab308' }}>
                  {lang === 'en'
                    ? `Taxonomy Quiz (${quizIdx + 1}/${quizQuestions.length})`
                    : `वर्गीकरण प्रश्नोत्तर (${quizIdx + 1}/${quizQuestions.length})`}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, marginBottom: '10px' }}>
                {lang === 'en' ? quizQuestions[quizIdx].qEn : quizQuestions[quizIdx].qNe}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(lang === 'en' ? quizQuestions[quizIdx].optionsEn : quizQuestions[quizIdx].optionsNe).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border:
                        quizSelected === i
                          ? i === quizQuestions[quizIdx].correct
                            ? '1px solid #22c55e'
                            : '1px solid #ef4444'
                          : '1px solid rgba(255,255,255,0.1)',
                      background:
                        quizSelected === i
                          ? i === quizQuestions[quizIdx].correct
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: quizFeedback === 'correct' ? '#4ade80' : '#f87171',
                      marginBottom: '4px',
                    }}
                  >
                    {quizFeedback === 'correct'
                      ? lang === 'en'
                        ? '✓ Correct! Excellent Taxonomy Knowledge.'
                        : '✓ स्याबास! सही उत्तर।'
                      : lang === 'en'
                      ? '✗ Not quite. Look closely at the explanation.'
                      : '✗ मिलेन। तलको व्याख्या हेर्नुहोस्।'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {lang === 'en' ? quizQuestions[quizIdx].expEn : quizQuestions[quizIdx].expNe}
                  </div>
                  {quizIdx < quizQuestions.length - 1 && (
                    <button
                      onClick={() => {
                        setQuizIdx((prev) => prev + 1);
                        setQuizSelected(null);
                        setQuizFeedback(null);
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#38bdf8',
                        color: '#090d16',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'en' ? 'Next Question →' : 'अर्को प्रश्न →'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Stage Progression Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
              setStage('challenge');
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Taxonomy Lab & Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
export default AnimalClassificationSim;
