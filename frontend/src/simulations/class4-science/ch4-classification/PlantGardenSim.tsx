/**
 * PlantGardenSim.tsx
 * Master Interactive 2D Botanical Garden: Herbs, Shrubs, and Trees
 * (वनस्पति बगैँचा: साना बिरुवा, बुट्यान र रूख - 2डी अन्तरक्रियात्मक प्रयोगशाला)
 * Grade 4 Science • Chapter 4: Classification of Living Beings
 *
 * 100% Native 2D Canvas & Vector Graphics (Zero WebGL/3D Dependencies)
 * - Ultra-Rich Natural Garden Panorama:
 *   1. Herbs: Mint & Mustard with tender green fleshy stems, soft leaves, and yellow flowers (< 1 meter).
 *   2. Shrubs: Bushy Rose & Hibiscus with multiple woody stems branching from soil level (1 – 3 meters).
 *   3. Trees: Mighty Banyan / Mango Tree with thick woody bark trunk and sprawling leafy crown (> 10 meters).
 * - Interactive Stem Anatomy Inspector: Magnifies the stem cross-section comparing non-woody soft vascular bundles
 *   with hardened concentric rings of secondary xylem wood!
 * - Interactive Height Comparison Ruler, Botanical Category Switcher, and CDC Science Quiz.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Sparkles,
  Check,
  RotateCcw,
  Eye,
  Trees,
  Award,
  Leaf,
  Flower2,
} from 'lucide-react';

type PlantCategory = 'herb' | 'shrub' | 'tree';

interface PlantData {
  id: PlantCategory;
  nameEn: string;
  nameNe: string;
  examplesEn: string;
  examplesNe: string;
  stemEn: string;
  stemNe: string;
  heightEn: string;
  heightNe: string;
  lifespanEn: string;
  lifespanNe: string;
  themeColor: string;
}

export const PlantGardenSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<PlantCategory>('herb');
  const [showStemZoom, setShowStemZoom] = useState<boolean>(false);
  const [exploredList, setExploredList] = useState<PlantCategory[]>(['herb']);

  // Challenge stage state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const categories: Record<PlantCategory, PlantData> = {
    herb: {
      id: 'herb',
      nameEn: 'Herbs',
      nameNe: 'साना बिरुवा (Herbs)',
      examplesEn: 'Mint, Coriander, Mustard, Grass',
      examplesNe: 'पुदिना, धनियाँ, तोरी, तुलसी र घाँस',
      stemEn: 'Soft, tender, green, non-woody stem containing chlorophyll.',
      stemNe: 'नरम, हरियो र काठ नभएको कमजोर काण्ड।',
      heightEn: 'Short stature (< 1 meter tall), easy to bend or break.',
      heightNe: 'होचो (1 मिटरभन्दा कम), सजिलै हातले भाँच्न सकिने।',
      lifespanEn: 'Annual or biennial: 1 to 2 seasons life cycle.',
      lifespanNe: 'छोटो आयु: 1 देखि 2 मौसममा जीवनचक्र पूरा हुने।',
      themeColor: '#4ade80',
    },
    shrub: {
      id: 'shrub',
      nameEn: 'Shrubs',
      nameNe: 'बुट्यान (Shrubs)',
      examplesEn: 'Rose, Hibiscus, Tea, Cotton',
      examplesNe: 'गुलाब, घण्टीफूल, चिया, कपास र मेहेन्दी',
      stemEn: 'Hard, thin, woody stems branching out profusely from near ground level without a single trunk.',
      stemNe: 'जमिन नजिकैबाट धेरै कडा काठका हाँगाबिँगा निस्कने झाडीदार काण्ड।',
      heightEn: 'Medium height (1 to 3 meters), bushy dome architecture.',
      heightNe: 'मध्यम उचाइ (1 देखि 3 मिटर), झाडीजस्तो बाक्लो।',
      lifespanEn: 'Perennial: survives for several years producing annual blossoms.',
      lifespanNe: 'धेरै वर्षसम्म बाँच्ने र प्रत्येक वर्ष फूल फुल्ने।',
      themeColor: '#f472b6',
    },
    tree: {
      id: 'tree',
      nameEn: 'Trees',
      nameNe: 'रूखहरू (Trees)',
      examplesEn: 'Mango, Banyan, Peepal, Pine',
      examplesNe: 'आँप, बर, पिपल, सल्ला, साल र चाँप',
      stemEn: 'Single, massive, thick woody stem called a Trunk covered with protective rough bark.',
      stemNe: 'मोटो, कडा काठको मुख्य काण्ड (Trunk) र बोक्राले ढाकिएको मजबुत डाँठ।',
      heightEn: 'Tall stature (> 3 meters to 30+ meters), expansive umbrella canopy.',
      heightNe: 'अग्लो (3 मिटरदेखि 30 मिटरसम्म), विशाल छाता आकारको हाँगाबिँगा।',
      lifespanEn: 'Perennial: survives for decades to centuries (Banyan live 300+ yrs).',
      lifespanNe: 'दीर्घायु: दशौँदेखि सयौँ वर्षसम्म बाँच्ने (बर–पिपल 300+ वर्ष बाँच्छन्)।',
      themeColor: '#22c55e',
    },
  };

  const currentData = categories[selectedCategory];

  const handleSelectCategory = (cat: PlantCategory) => {
    setSelectedCategory(cat);
    ScienceAudio.playClick();
    if (!exploredList.includes(cat)) {
      const updated = [...exploredList, cat];
      setExploredList(updated);
      if (updated.length >= 3) {
        setIsCompleted(true);
        setStars(3);
      }
    }
  };

  const handleReset = () => {
    setSelectedCategory('herb');
    setShowStemZoom(false);
    ScienceAudio.playWhoosh();
  };

  // ══════════════════════════════════════════════════════════════════
  // MASTER 2D CANVAS RENDERER: BOTANICAL GARDEN PANORAMA
  // ══════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const groundY = height * 0.74;
    const timeSec = Date.now() * 0.001;

    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // 1. GARDEN SKY & DISTANT HILLS
    // ─────────────────────────────────────────────────────────────
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.65, '#bae6fd');
    skyGrad.addColorStop(1, '#fef08a'); // Warm horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // Distant Green Mountain Hills
    ctx.fillStyle = 'rgba(22, 101, 52, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.bezierCurveTo(width * 0.3, groundY - 70, width * 0.6, groundY - 40, width, groundY - 60);
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();

    // Rolling Garden Lawn (Foreground Soil & Grass)
    const lawnGrad = ctx.createLinearGradient(0, groundY, 0, height);
    lawnGrad.addColorStop(0, '#15803d');
    lawnGrad.addColorStop(0.4, '#166534');
    lawnGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = lawnGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Stone Garden Pathway Border
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, groundY + 18, width, 12);
    ctx.fillStyle = '#475569';
    for (let p = 0; p < width; p += 32) {
      ctx.fillRect(p, groundY + 18, 2, 12);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. THREE BOTANICAL SPECIMENS: HERB, SHRUB, TREE
    // ─────────────────────────────────────────────────────────────

    // ── SPECIMEN 1: HERB (Left: x = 160) ──
    const herbX = width * 0.2;
    const isHerbSelected = selectedCategory === 'herb';

    ctx.save();
    // Spotlight highlight if selected
    if (isHerbSelected) {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
      ctx.beginPath();
      ctx.ellipse(herbX, groundY, 70, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Herb Cluster (Mint / Mustard plant, h = 65px)
    const herbHeight = 70;
    const herbSway = Math.sin(timeSec * 3) * 3;

    // Soft Tender Green Stems
    ctx.strokeStyle = '#22c55e'; // Bright tender green
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    for (let s = -2; s <= 2; s++) {
      ctx.beginPath();
      ctx.moveTo(herbX + s * 8, groundY);
      ctx.quadraticCurveTo(herbX + s * 14 + herbSway, groundY - herbHeight * 0.6, herbX + s * 16 + herbSway * 1.5, groundY - herbHeight + Math.abs(s) * 8);
      ctx.stroke();

      // Delicate Leaves
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(herbX + s * 16 + herbSway * 1.5, groundY - herbHeight + Math.abs(s) * 8, 8, 4, s * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Tiny Yellow Mustard Flowers at apex
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(herbX + s * 16 + herbSway * 1.5, groundY - herbHeight + Math.abs(s) * 8 - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label on Lawn
    ctx.fillStyle = isHerbSelected ? '#4ade80' : '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 Herb (< 1m)', herbX, groundY + 45);
    ctx.restore();

    // ── SPECIMEN 2: SHRUB (Center: x = 440) ──
    const shrubX = width * 0.5;
    const isShrubSelected = selectedCategory === 'shrub';

    ctx.save();
    if (isShrubSelected) {
      ctx.fillStyle = 'rgba(244, 114, 182, 0.2)';
      ctx.beginPath();
      ctx.ellipse(shrubX, groundY, 90, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shrub Bush (Rose / Hibiscus Bush, h = 145px)
    const shrubH = 145;
    const shrubSway = Math.sin(timeSec * 2) * 2;

    // Multiple Thin Woody Stems branching from soil surface
    ctx.strokeStyle = '#78350f'; // Woody brown stems
    ctx.lineWidth = 4.5;
    for (let b = -3; b <= 3; b++) {
      ctx.beginPath();
      ctx.moveTo(shrubX + b * 6, groundY);
      ctx.bezierCurveTo(
        shrubX + b * 22,
        groundY - shrubH * 0.4,
        shrubX + b * 32 + shrubSway,
        groundY - shrubH * 0.8,
        shrubX + b * 36 + shrubSway,
        groundY - shrubH + Math.abs(b) * 10
      );
      ctx.stroke();
    }

    // Dense Bushy Foliage Dome
    ctx.fillStyle = '#15803d';
    for (let fol = -3; fol <= 3; fol++) {
      ctx.beginPath();
      ctx.arc(shrubX + fol * 18 + shrubSway, groundY - shrubH * 0.65 - Math.abs(fol) * 4, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Red Rose / Hibiscus Blossoms scattered in bush
    ctx.fillStyle = '#f43f5e';
    const flowerSpots = [
      { dx: -28, dy: -shrubH * 0.8 },
      { dx: 14, dy: -shrubH * 0.85 },
      { dx: 34, dy: -shrubH * 0.65 },
      { dx: -10, dy: -shrubH * 0.6 },
    ];
    flowerSpots.forEach((fl) => {
      ctx.beginPath();
      ctx.arc(shrubX + fl.dx + shrubSway, groundY + fl.dy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(shrubX + fl.dx + shrubSway, groundY + fl.dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
    });

    ctx.fillStyle = isShrubSelected ? '#f472b6' : '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌸 Shrub (1 – 3m)', shrubX, groundY + 45);
    ctx.restore();

    // ── SPECIMEN 3: TREE (Right: x = 740) ──
    const treeX = width * 0.82;
    const isTreeSelected = selectedCategory === 'tree';

    ctx.save();
    if (isTreeSelected) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.beginPath();
      ctx.ellipse(treeX, groundY, 110, 28, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Giant Banyan / Mango Tree (h = 240px)
    const treeH = 250;
    const treeApexY = groundY - treeH;

    // Massive Woody Trunk covered in textured bark
    const trunkGrad = ctx.createLinearGradient(treeX - 28, groundY, treeX + 28, groundY);
    trunkGrad.addColorStop(0, '#451a03'); // Dark bark
    trunkGrad.addColorStop(0.5, '#78350f');
    trunkGrad.addColorStop(1, '#2e1202');

    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.moveTo(treeX - 22, groundY);
    // Trunk flaring out at roots
    ctx.lineTo(treeX - 35, groundY);
    ctx.quadraticCurveTo(treeX - 18, groundY - treeH * 0.4, treeX - 16, treeApexY + 80);
    ctx.lineTo(treeX + 16, treeApexY + 80);
    ctx.quadraticCurveTo(treeX + 18, groundY - treeH * 0.4, treeX + 35, groundY);
    ctx.lineTo(treeX + 22, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2e1202';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Expansive Sprawling Green Canopy (Umbrella foliage)
    const canopyGrad = ctx.createRadialGradient(treeX, treeApexY + 20, 30, treeX, treeApexY + 20, 115);
    canopyGrad.addColorStop(0, '#4ade80');
    canopyGrad.addColorStop(0.55, '#16a34a');
    canopyGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = canopyGrad;

    const canopyPuffs = [
      { dx: 0, dy: -10, r: 52 },
      { dx: -45, dy: 10, r: 44 },
      { dx: 45, dy: 10, r: 44 },
      { dx: -30, dy: 35, r: 40 },
      { dx: 30, dy: 35, r: 40 },
    ];
    canopyPuffs.forEach((puff) => {
      ctx.beginPath();
      ctx.arc(treeX + puff.dx, treeApexY + 30 + puff.dy, puff.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = isTreeSelected ? '#22c55e' : '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌳 Tree (> 3m)', treeX, groundY + 45);
    ctx.restore();

    // ─────────────────────────────────────────────────────────────
    // 3. STEM MICROSCOPE ZOOM INSET (When showStemZoom is active)
    // ─────────────────────────────────────────────────────────────
    if (showStemZoom) {
      const zoomX = width * 0.5;
      const zoomY = height * 0.32;
      const zoomR = 90;

      ctx.save();
      // Microscope Lens Circle
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.arc(zoomX, zoomY, zoomR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (selectedCategory === 'herb') {
        // Soft Green Stem Cross-Section (No wood rings)
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.arc(zoomX, zoomY, zoomR * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Scattered vascular bundles
        ctx.fillStyle = '#0284c7';
        for (let vb = 0; vb < 8; vb++) {
          const a = (vb * Math.PI * 2) / 8;
          ctx.beginPath();
          ctx.arc(zoomX + Math.cos(a) * 38, zoomY + Math.sin(a) * 38, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SOFT TENDER TISSUE', zoomX, zoomY + 58);
      } else if (selectedCategory === 'shrub') {
        // Shrub Stem Cross-Section (Thin outer bark, moderate wood)
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(zoomX, zoomY, zoomR * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6; // Thin woody cylinder
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('THIN WOODY STEM', zoomX, zoomY + 58);
      } else {
        // Tree Trunk Cross-Section (Concentric Annual Growth Rings & Heavy Bark)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(zoomX, zoomY, zoomR * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Annual Growth Rings (Secondary Xylem Wood)
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        for (let ring = 12; ring < 55; ring += 10) {
          ctx.beginPath();
          ctx.arc(zoomX, zoomY, ring, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Heavy Rough Outer Bark
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(zoomX, zoomY, zoomR * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ANNUAL GROWTH RINGS', zoomX, zoomY + 58);
      }
      ctx.restore();
    }
  }, [selectedCategory, showStemZoom]);

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
      qEn: 'Which key stem characteristic clearly differentiates a Tree from a Shrub?',
      qNe: 'रूख (Tree) र बुट्यान (Shrub) बीच कुन मुख्य भिन्नता हुन्छ?',
      optionsEn: [
        'A tree has a single thick, tall woody main trunk, while a shrub branches from near the ground',
        'Shrubs grow taller than mountains',
        'Trees never produce green leaves',
        'Shrubs only grow in ice water',
      ],
      optionsNe: [
        'रूखको एउटै मोटो अग्लो काण्ड (Trunk) हुन्छ भने बुट्यानका जमिन नजिकैबाट धेरै हाँगा निस्कन्छन्',
        'बुट्यान हिमालभन्दा पनि अग्ला हुन्छन्',
        'रूखमा कहिल्यै हरिया पात हुँदैनन्',
        'बुट्यान बरफभित्र मात्र उम्रन्छन्',
      ],
      correct: 0,
      expEn: 'Trees possess an erect, single dominant woody trunk, whereas shrubs develop multi-stemmed bushy architecture from ground level.',
      expNe: 'रूखको जमिनबाट एउटै बलियो ठूलो काण्ड हुन्छ भने बुट्यान जमिन नजिकैबाट धेरै हाँगा फैलिएर झाडी बन्छ।',
    },
    {
      qEn: 'Why are herbs like Mint and Coriander easily bendable by hand?',
      qNe: 'पुदिना र धनियाँजस्ता साना बिरुवा (Herbs) लाई हातले सजिलै किन दोब्य्राउन सकिन्छ?',
      optionsEn: [
        'Their stems are soft, tender, and green without rigid secondary woody tissue',
        'They are made entirely of liquid water',
        'They are made of heavy iron wire',
        'They do not have cell walls',
      ],
      optionsNe: [
        'यिनको काण्ड नरम, हरियो र काठ नभएको कमजोर हुन्छ',
        'यिनीहरू पानीले मात्र बनेका हुन्छन्',
        'यिनीहरू फलामको तारले बनेका हुन्छन्',
        'यिनीहरूमा कोष नै हुँदैनन्',
      ],
      correct: 0,
      expEn: 'Herbs lack secondary woody xylem growth; turgor pressure in tender parenchyma cells keeps them upright.',
      expNe: 'साना बिरुवामा कडा काठ हुँदैन; यिनको काण्ड नरम र हरियो हुने भएकाले सजिलै दोब्रिन्छ।',
    },
    {
      qEn: 'What do concentric rings visible inside a cross-section of a tree trunk reveal?',
      qNe: 'रूखको काण्ड काट्दा भित्र देखिने गोलो घेराहरू (Annual Rings) ले के देखाउँछन्?',
      optionsEn: [
        'The age of the tree (each ring represents one year of seasonal growth)',
        'The number of birds that visited the tree',
        'The depth of river water beneath the ground',
        'The speed of blowing wind',
      ],
      optionsNe: [
        'रूखको उमेर (प्रत्येक गोलो घेराले एक वर्षको वृद्धिलाई जनाउँछ)',
        'रूखमा कति चरा बसेका थिए भन्ने संख्या',
        'माटोमुनिको पानीको गहिराइ',
        'हावाको गति',
      ],
      correct: 0,
      expEn: 'Dendrochronology: Each annual ring consists of light springwood and dense autumnwood formed across one calendar year.',
      expNe: 'रूखको काण्डको भित्री घेरा गनेर त्यो रूख कति वर्ष पुरानो हो भन्ने कुरा पत्ता लगाउन सकिन्छ।',
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
      title="Botanical Garden: Herbs, Shrubs & Trees"
      titleNepali="वनस्पति बगैँचा: साना बिरुवा, बुट्यान र रूखहरू"
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
      currentPromptEn="Compare the anatomical differences between soft Herbs, bushy Shrubs, and majestic Trees. Toggle the stem microscope zoom!"
      currentPromptNe="साना बिरुवा, बुट्यान र रूखको काण्डको बनावट तुलना गर्नुहोस् र माइक्रोस्कोपबाट भित्री काठ हेर्नुहोस्!"
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

          {/* Top Category Selection Tabs */}
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
            {(['herb', 'shrub', 'tree'] as PlantCategory[]).map((cat) => {
              const isCurrent = selectedCategory === cat;
              const catData = categories[cat];
              return (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: isCurrent ? `2px solid ${catData.themeColor}` : '1px solid rgba(255,255,255,0.2)',
                    background: isCurrent ? 'rgba(34, 197, 94, 0.3)' : 'rgba(15, 23, 42, 0.85)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {lang === 'en' ? catData.nameEn.split(' ')[0] : catData.nameNe.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Top-Right Stem Microscope Zoom Action */}
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
                setShowStemZoom(!showStemZoom);
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 15px',
                borderRadius: '10px',
                border: showStemZoom ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                background: showStemZoom ? 'rgba(56, 189, 248, 0.3)' : 'rgba(15, 23, 42, 0.88)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: showStemZoom ? '0 0 15px rgba(56, 189, 248, 0.45)' : 'none',
              }}
            >
              <Eye size={15} color={showStemZoom ? '#38bdf8' : '#cbd5e1'} />
              {lang === 'en'
                ? showStemZoom
                  ? 'Stem Microscope: ON'
                  : 'Inspect Stem Wood'
                : showStemZoom
                ? 'काण्डको दृश्य: चालु'
                : 'काण्डको भित्री काठ जाँच्नुहोस्'}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: BOTANICAL WORKSPACE & SPECIMEN DETAILS
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
          {/* Active Category Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80' }}>
              {lang === 'en' ? currentData.nameEn : currentData.nameNe}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
              <strong style={{ color: '#38bdf8' }}>{lang === 'en' ? 'Examples: ' : 'उदाहरणहरू: '}</strong>
              {lang === 'en' ? currentData.examplesEn : currentData.examplesNe}
            </div>
          </div>

          {/* Morphological Characteristics */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#facc15' }}>
                {lang === 'en' ? 'STEM STRUCTURE' : 'काण्डको बनोट'}
              </div>
              <div style={{ fontSize: '11px', color: '#0f172a', marginTop: '2px', lineHeight: 1.45 }}>
                {lang === 'en' ? currentData.stemEn : currentData.stemNe}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>
                {lang === 'en' ? 'HEIGHT PROFILE' : 'उचाइ'}
              </div>
              <div style={{ fontSize: '11px', color: '#0f172a', marginTop: '2px' }}>
                {lang === 'en' ? currentData.heightEn : currentData.heightNe}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#c084fc' }}>
                {lang === 'en' ? 'LIFESPAN' : 'आयु'}
              </div>
              <div style={{ fontSize: '11px', color: '#0f172a', marginTop: '2px' }}>
                {lang === 'en' ? currentData.lifespanEn : currentData.lifespanNe}
              </div>
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
                    ? `Garden Quiz (${quizIdx + 1}/${quizQuestions.length})`
                    : `वनस्पति प्रश्नोत्तर (${quizIdx + 1}/${quizQuestions.length})`}
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
                        ? '✓ Correct! Excellent Botanical Knowledge.'
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
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Botanical Lab & Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
export default PlantGardenSim;
