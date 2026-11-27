/**
 * LivingEnvironmentSim.tsx
 * Simulation 7: 2D Explore a Living Environment
 * Grade 4 Science • Chapter 3: Organisms and Environment
 *
 * Ultra-Realistic Himalayan Ecological Explorer with Core Biological Detailing.
 * Features:
 * - Ultra-realistic procedural vector artwork with natural color palettes:
 *   1. Himalayan Musk Deer: realistic anatomy, grizzled coat, white throat bands, signature canine tusks, alert ears, animated breathing & grazing
 *   2. Danfe / Himalayan Monal: 9-colored iridescent plumage, metallic emerald crest, sapphire wings, copper ruff, white rump, rufous fan tail
 *   3. Himalayan Asala Snow Trout: swimming dynamically in the clear glacial stream
 *   4. Himalayan Blue Pine & Deodar: furrowed cedar bark, tiered conifer needle boughs, hanging pine cones
 *   5. Rhododendron Arboreum: realistic umbels of crimson bell blossoms, golden stamens, glossy lanceolate leaves
 *   6. Majestic Himalayan Snow Range: Machapuchare / Annapurna ridgelines, warm sunlit snow slopes & cool periwinkle shadow crevasses
 *   7. Glacial Meltwater Stream: transparent turquoise water, riverbed pebbles, rapids foam, caustics
 *   8. Stratified Soil Profile & Granite Boulders: humus layer, root systems, angular granite with green moss & lichen
 *   9. Atmosphere & Solar Corona: radiant morning sun with soft crepuscular rays & alpine cirrus clouds
 * - Direct interactive canvas clicking on all animals, flora, and landscape hotspots
 * - High-DPI Retina canvas scaling (locked 60 FPS, zero software blur lag)
 * - Category filter (All / Biotic Only / Abiotic Only) with glowing halos
 * - Bilingual (EN/NE), audio effects, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Trees, Sun, Droplets, Mountain, Sparkles, Check, RotateCcw, Filter, CheckCircle2, Info } from 'lucide-react';

interface EnvElement {
  id: string;
  nameEn: string;
  nameNe: string;
  category: 'Biotic' | 'Abiotic';
  categoryNe: 'सजीव' | 'निर्जीव';
  descEn: string;
  descNe: string;
  bioDetailEn: string;
  bioDetailNe: string;
  x: number;
  y: number;
  radius: number;
  icon: string;
}

export const LivingEnvironmentSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<string>('deer');
  const [inspectedIds, setInspectedIds] = useState<string[]>(['deer']);
  const [filterMode, setFilterMode] = useState<'all' | 'biotic' | 'abiotic'>('all');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Virtual Canvas Dimension Space
  const CANVAS_WIDTH = 880;
  const CANVAS_HEIGHT = 500;

  const elements: EnvElement[] = [
    {
      id: 'sun',
      nameEn: 'Sunlight',
      nameNe: 'सूर्यको प्रकाश (Sunlight)',
      category: 'Abiotic',
      categoryNe: 'निर्जीव',
      descEn: 'Primary non-living energy source powering photosynthesis and warming planet Earth.',
      descNe: 'पृथ्वीको मुख्य निर्जीव ऊर्जा स्रोत जसले बोटबिरुवालाई खाना बनाउन घाम र न्यानोपन दिन्छ।',
      bioDetailEn: 'Abiotic solar radiation drives the water cycle, warms cold mountain soil, and powers photosynthesis in pine and rhododendron leaves.',
      bioDetailNe: 'निर्जीव सौर्य विकिरणले जलचक्र चलाउँछ, चिसो हिमाली माटो न्यानो बनाउँछ र बिरुवाहरूलाई खाना बनाउने ऊर्जा दिन्छ।',
      x: 770,
      y: 75,
      radius: 38,
      icon: '☀️',
    },
    {
      id: 'tree',
      nameEn: 'Himalayan Pine',
      nameNe: 'सल्लाको रुख (Pine Tree)',
      category: 'Biotic',
      categoryNe: 'सजीव',
      descEn: 'Living producer that absorbs carbon dioxide, produces oxygen, and shelters wildlife.',
      descNe: 'अक्सिजन उत्पादन गर्ने, चिसो हावापानी सहन सक्ने र चराचुरुङ्गीलाई बासस्थान दिने जीवित सल्लाको रुख।',
      bioDetailEn: 'Evergreen gymnosperm with waxy needle leaves adapted to minimize water loss and shed heavy winter mountain snowfall.',
      bioDetailNe: 'सदाबहार कोणधारी रूख जसका पातहरू सियो जस्ता तिखा र मैनयुक्त हुन्छन्, जसले चिसोमा पानी उड्न दिँदैन र हिउँ खसाल्छ।',
      x: 160,
      y: 280,
      radius: 46,
      icon: '🌲',
    },
    {
      id: 'deer',
      nameEn: 'Musk Deer',
      nameNe: 'कस्तुरी मृग (Musk Deer)',
      category: 'Biotic',
      categoryNe: 'सजीव',
      descEn: 'Living endangered Himalayan herbivore famous for its camouflage coat and signature canine tusks.',
      descNe: 'हिमाली भेगको प्रसिद्ध संरक्षित सजीव स्तनधारी प्राणी जसको लामो दाह्रा र बाक्लो रौं हुन्छ।',
      bioDetailEn: 'Possesses downward curved canine tusks instead of antlers, an arched back, and dense air-filled insulating fur to survive freezing temperatures.',
      bioDetailNe: 'यसको सिङको सट्टा तलतिर फर्केका दुई तीखा दाह्रा (Tusks) हुन्छन् र चिसोबाट बच्न हावाले भरिएको बाक्लो रौं हुन्छ।',
      x: 320,
      y: 360,
      radius: 44,
      icon: '🦌',
    },
    {
      id: 'water',
      nameEn: 'Mountain Stream',
      nameNe: 'खोलाको पानी (Stream Water)',
      category: 'Abiotic',
      categoryNe: 'निर्जीव',
      descEn: 'Non-living clear glacial meltwater vital for the hydration of every organism in the valley.',
      descNe: 'हिउँ पग्लेर बगेको कञ्चन निर्जीव पानी जस बिना कुनै पनि सजीव प्राणी बाँच्न सक्दैन।',
      bioDetailEn: 'Dissolves life-giving atmospheric oxygen as it tumbles over granite rapids, sustaining native Asala snow trout and riverbank mosses.',
      bioDetailNe: 'खोलाको चिसो पानीमा अक्सिजनको मात्रा बढी हुन्छ, जसले असला माछा र खोला किनारका जलचरहरूलाई जीवित राख्छ।',
      x: 520,
      y: 435,
      radius: 44,
      icon: '💧',
    },
    {
      id: 'soil',
      nameEn: 'Fertile Topsoil',
      nameNe: 'मलिलो माटो (Fertile Soil)',
      category: 'Abiotic',
      categoryNe: 'निर्जीव',
      descEn: 'Non-living geological mixture of minerals, humus, and water that anchors plant roots.',
      descNe: 'खनिज र कुहिएका जैविक पदार्थ मिलेर बनेको निर्जीव वस्तु जसले बिरुवालाई जरा गाड्न र पोषण दिन्छ।',
      bioDetailEn: 'Abiotic substrate providing essential nitrogen, phosphorus, and moisture to roots while hosting millions of microscopic decomposers.',
      bioDetailNe: 'बिरुवाको जरालाई नाइट्रोजन, फोस्फोरस र चिस्यान प्रदान गर्ने निर्जीव आधार।',
      x: 210,
      y: 450,
      radius: 36,
      icon: '🌱',
    },
    {
      id: 'flower',
      nameEn: 'Rhododendron Bloom',
      nameNe: 'लालीगुराँस (Rhododendron)',
      category: 'Biotic',
      categoryNe: 'सजीव',
      descEn: 'National flower of Nepal; living flowering angiosperm producing sweet nectar for birds & pollinators.',
      descNe: 'नेपालको राष्ट्रिय फूल; चरा र माहुरीहरूलाई गुलियो मह रस प्रदान गर्ने सुन्दर सजीव वनस्पति।',
      bioDetailEn: 'Features dense crimson flower trusses with dark nectar guides that attract pollinators like the Danfe and high-altitude bumblebees.',
      bioDetailNe: 'गाढा रातो रङ्गका घण्टी आकारका फूलहरूको झुप्पा जसले डाँफे र माहुरीलाई महको रस खान आकर्षित गर्छ।',
      x: 430,
      y: 325,
      radius: 36,
      icon: '🌸',
    },
    {
      id: 'rock',
      nameEn: 'Granite Rocks',
      nameNe: 'ढुङ्गा चट्टान (Granite Rock)',
      category: 'Abiotic',
      categoryNe: 'निर्जीव',
      descEn: 'Solid non-living minerals forming the bedrock and craggy topography of the Himalayas.',
      descNe: 'पहाड र हिमाल बन्ने कडा निर्जीव खनिज वस्तु जसले चट्टानी धरातल बनाउँछ।',
      bioDetailEn: 'Hard crystalline igneous rock containing quartz, feldspar, and mica; provides thermal basking perches for birds and anchors alpine lichens.',
      bioDetailNe: 'क्वार्ट्ज र फेल्डस्पार जस्ता खनिजबाट बनेको कडा निर्जीव चट्टान जसले चराहरूलाई घाम ताप्न र लेउ उम्रन आधार दिन्छ।',
      x: 690,
      y: 380,
      radius: 36,
      icon: '🪨',
    },
    {
      id: 'bird',
      nameEn: 'Danfe Bird',
      nameNe: 'डाँफे चरा (Danfe Bird)',
      category: 'Biotic',
      categoryNe: 'सजीव',
      descEn: 'National bird of Nepal (Himalayan Monal); living avian famed for its 9 metallic rainbow colors.',
      descNe: 'नेपालको राष्ट्रिय चरा (Himalayan Monal); इन्द्रेणी जस्ता 9 रङ्गको चम्किलो प्वाँख भएको जीवित पन्छी।',
      bioDetailEn: 'Features iridescent metallic sapphire wings, emerald crest, and copper neck ruff; digs with strong curved claws in alpine soil for tubers.',
      bioDetailNe: 'हरियो कल्की, निलो ढाड र तामा जस्तो रातो घाँटी भएको नौ-रङ्गी पन्छी जसले बलिया पञ्जाले माटो खोस्रेर जरा र किरा खान्छ।',
      x: 600,
      y: 155,
      radius: 38,
      icon: '🦚',
    },
  ];

  const currentElement = elements.find((e) => e.id === selectedId) || elements[2];

  const handleSelectElement = (id: string) => {
    ScienceAudio.playPop();
    setSelectedId(id);
    if (!inspectedIds.includes(id)) {
      const next = [...inspectedIds, id];
      setInspectedIds(next);
      setStars(Math.min(3, Math.floor((next.length / elements.length) * 3)));
      if (next.length >= elements.length) {
        setIsCompleted(true);
        ScienceAudio.playCelebration();
        setStage('understand');
      }
    }
  };

  const handleReset = () => {
    setSelectedId('deer');
    setInspectedIds(['deer']);
    setFilterMode('all');
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // Direct Interactive Canvas Hit-Testing
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check elements hit test
    for (const el of elements) {
      const isDimmed =
        (filterMode === 'biotic' && el.category !== 'Biotic') ||
        (filterMode === 'abiotic' && el.category !== 'Abiotic');
      if (isDimmed) continue;

      const dx = clickX - el.x;
      const dy = clickY - el.y;
      const hitRadius = el.radius + 15;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        handleSelectElement(el.id);
        return;
      }
    }
  };

  // =========================================================================
  // ULTRA-REALISTIC CANVAS PROCEDURAL ENGINE (60 FPS • High-DPI Retina)
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina buffer scaling (capped at 2x for smooth 60 FPS)
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(CANVAS_WIDTH * dpr) || canvas.height !== Math.round(CANVAS_HEIGHT * dpr)) {
      canvas.width = Math.round(CANVAS_WIDTH * dpr);
      canvas.height = Math.round(CANVAS_HEIGHT * dpr);
    }

    let time = 0;

    const render = () => {
      time += 0.025;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // ── 1. SKY & ATMOSPHERIC SUNRISE ──────────────────────────────────────
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 310);
      skyGrad.addColorStop(0, '#0284c7'); // Deep azure
      skyGrad.addColorStop(0.45, '#38bdf8'); // Sky blue
      skyGrad.addColorStop(0.8, '#bae6fd'); // Alpine haze
      skyGrad.addColorStop(1, '#fed7aa'); // Morning sun glow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Drifting Alpine Cirrus Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const cloudOffset1 = (time * 8) % (CANVAS_WIDTH + 200) - 100;
      ctx.beginPath();
      ctx.ellipse(cloudOffset1, 80, 85, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudOffset1 + 45, 72, 60, 22, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudOffset1 - 40, 86, 50, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Second soft cloud bank
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      const cloudOffset2 = ((time * 5) + 400) % (CANVAS_WIDTH + 250) - 120;
      ctx.beginPath();
      ctx.ellipse(cloudOffset2, 130, 95, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudOffset2 + 50, 122, 70, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. MAJESTIC HIMALAYAN SNOW PEAKS (Machapuchare & Annapurna) ─────────
      // Far Mountain Shadow Backing
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(0, 250);
      ctx.lineTo(80, 140);
      ctx.lineTo(190, 80); // Peak 1
      ctx.lineTo(310, 240);
      ctx.lineTo(440, 65);  // Peak 2 - Machapuchare Fishtail
      ctx.lineTo(580, 240);
      ctx.lineTo(720, 95);  // Peak 3
      ctx.lineTo(880, 250);
      ctx.lineTo(880, 260);
      ctx.lineTo(0, 260);
      ctx.closePath();
      ctx.fill();

      // Sunlit Snow Faces (Warm brilliant ivory white)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      // Peak 1 Sunlit Slope
      ctx.moveTo(80, 140);
      ctx.lineTo(190, 80);
      ctx.lineTo(250, 240);
      ctx.lineTo(130, 250);
      ctx.closePath();
      ctx.fill();

      // Peak 2 (Center Fishtail) Sunlit Slope
      ctx.beginPath();
      ctx.moveTo(310, 240);
      ctx.lineTo(440, 65);
      ctx.lineTo(495, 240);
      ctx.lineTo(380, 250);
      ctx.closePath();
      ctx.fill();

      // Peak 3 Sunlit Slope
      ctx.beginPath();
      ctx.moveTo(580, 240);
      ctx.lineTo(720, 95);
      ctx.lineTo(780, 240);
      ctx.lineTo(650, 250);
      ctx.closePath();
      ctx.fill();

      // Mountain Cold Shadow Ridges & Couloirs (Periwinkle Alpine Blue)
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      // Peak 1 shadow
      ctx.moveTo(190, 80);
      ctx.lineTo(210, 150);
      ctx.lineTo(195, 180);
      ctx.lineTo(250, 240);
      ctx.lineTo(310, 240);
      ctx.lineTo(190, 80);
      // Peak 2 Fishtail shadow cleft
      ctx.moveTo(440, 65);
      ctx.lineTo(455, 110);
      ctx.lineTo(445, 145);
      ctx.lineTo(510, 240);
      ctx.lineTo(580, 240);
      ctx.lineTo(440, 65);
      // Peak 3 shadow
      ctx.moveTo(720, 95);
      ctx.lineTo(745, 170);
      ctx.lineTo(820, 250);
      ctx.lineTo(880, 250);
      ctx.lineTo(720, 95);
      ctx.closePath();
      ctx.fill();

      // Exposed Dark Granite Rock Arêtes (where steep snow sheared off)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(188, 80);
      ctx.lineTo(196, 130);
      ctx.lineTo(192, 175);
      ctx.lineTo(185, 175);
      ctx.lineTo(188, 80);
      // Peak 2 knife ridge
      ctx.moveTo(438, 65);
      ctx.lineTo(444, 115);
      ctx.lineTo(440, 160);
      ctx.lineTo(434, 160);
      ctx.lineTo(438, 65);
      ctx.closePath();
      ctx.fill();

      // Distant Forested Foothill Ridge
      const ridgeGrad = ctx.createLinearGradient(0, 210, 0, 280);
      ridgeGrad.addColorStop(0, '#064e3b');
      ridgeGrad.addColorStop(1, '#047857');
      ctx.fillStyle = ridgeGrad;
      ctx.beginPath();
      ctx.moveTo(0, 245);
      ctx.quadraticCurveTo(240, 205, 500, 240);
      ctx.quadraticCurveTo(720, 220, CANVAS_WIDTH, 260);
      ctx.lineTo(CANVAS_WIDTH, 290);
      ctx.lineTo(0, 290);
      ctx.closePath();
      ctx.fill();

      // ── 3. ROLLING ALPINE MEADOW & VALLEY TERRACES ─────────────────────────
      const meadowGrad = ctx.createLinearGradient(0, 240, 0, CANVAS_HEIGHT);
      meadowGrad.addColorStop(0, '#15803d'); // Rich emerald
      meadowGrad.addColorStop(0.35, '#16a34a'); // Sunlit pasture
      meadowGrad.addColorStop(0.75, '#166534'); // Moist soil bank
      meadowGrad.addColorStop(1, '#14532d'); // Deep green
      ctx.fillStyle = meadowGrad;

      ctx.beginPath();
      ctx.moveTo(0, 250);
      ctx.quadraticCurveTo(280, 225, 560, 275);
      ctx.quadraticCurveTo(740, 250, CANVAS_WIDTH, 290);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Foreground Lower Meadow Slope
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, 335);
      ctx.quadraticCurveTo(380, 310, CANVAS_WIDTH, 355);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Dotted Alpine Wildflower Blooms (Yellow Buttercups & White Edelweiss)
      for (let wf = 0; wf < 28; wf++) {
        const wfx = (wf * 37 + 25) % (CANVAS_WIDTH - 60) + 30;
        const wfy = 340 + (wf * 23) % 120;
        ctx.fillStyle = wf % 2 === 0 ? '#fde047' : '#ffffff';
        ctx.beginPath();
        ctx.arc(wfx, wfy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(wfx, wfy, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 4. MOUNTAIN GLACIAL STREAM (Water, Pebbles, Rapids & Fish) ────────
      const riverGrad = ctx.createLinearGradient(0, 360, 0, 500);
      riverGrad.addColorStop(0, 'rgba(34, 211, 238, 0.85)'); // Glacial cyan
      riverGrad.addColorStop(0.4, 'rgba(2, 132, 199, 0.92)'); // Clear mountain blue
      riverGrad.addColorStop(1, 'rgba(3, 105, 161, 0.98)'); // Deep cobalt
      ctx.fillStyle = riverGrad;

      ctx.beginPath();
      ctx.moveTo(330, 360);
      ctx.quadraticCurveTo(460, 395, 540, 425);
      ctx.quadraticCurveTo(670, 475, CANVAS_WIDTH, 465);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineTo(390, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Polished Riverbed Stones Visible Through Clear Water
      const stones = [
        { x: 440, y: 445, r: 8, col: '#64748b' },
        { x: 470, y: 465, r: 12, col: '#475569' },
        { x: 530, y: 460, r: 10, col: '#94a3b8' },
        { x: 610, y: 480, r: 14, col: '#334155' },
        { x: 690, y: 475, r: 9, col: '#64748b' },
      ];
      stones.forEach((st) => {
        ctx.fillStyle = st.col;
        ctx.beginPath();
        ctx.ellipse(st.x, st.y, st.r, st.r * 0.6, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated Water Flow Streaks & Foaming Rapids
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      for (let r = 0; r < 7; r++) {
        const rx = 390 + r * 70 + Math.sin(time * 3 + r) * 18;
        const ry = 405 + r * 14;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rx + 20, ry + 4, rx + 40, ry + 2);
        ctx.stroke();
      }

      // Native Himalayan Asala Snow Trout swimming in river
      const fishX = 520 + Math.sin(time * 2) * 20;
      const fishY = 445 + Math.cos(time * 2.5) * 6;
      ctx.save();
      ctx.translate(fishX, fishY);
      ctx.rotate(-0.15 + Math.sin(time * 4) * 0.08);
      // Fish olive/golden body
      const fishGrad = ctx.createLinearGradient(-15, 0, 15, 0);
      fishGrad.addColorStop(0, '#ca8a04');
      fishGrad.addColorStop(0.5, '#65a30d');
      fishGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = fishGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail fin
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(-24 + Math.sin(time * 12) * 3, -6);
      ctx.lineTo(-24 + Math.sin(time * 12) * 3, 6);
      ctx.closePath();
      ctx.fill();
      // Dorsal and pectoral fins
      ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-4, -10);
      ctx.lineTo(6, -6);
      ctx.fill();
      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, -2, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(10.5, -2, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 5. GEOLOGICAL SOIL CROSS-SECTION ─────────────────────
      // Cutaway Embankment on Riverbank
      ctx.fillStyle = '#271202'; // Deep bedrock/humus
      ctx.beginPath();
      ctx.roundRect(165, 435, 95, 45, 6);
      ctx.fill();

      // Top Soil Organic Layer (rich dark brown)
      const soilGrad = ctx.createLinearGradient(0, 435, 0, 480);
      soilGrad.addColorStop(0, '#572b0e');
      soilGrad.addColorStop(0.4, '#3b1c09');
      soilGrad.addColorStop(1, '#241005');
      ctx.fillStyle = soilGrad;
      ctx.beginPath();
      ctx.roundRect(165, 435, 95, 45, 6);
      ctx.fill();

      // Meadow Grass Cap on top of soil
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(165, 435, 95, 7);

      // Organic Rootlets penetrating soil
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(180, 442);
      ctx.lineTo(183, 458);
      ctx.lineTo(178, 470);
      ctx.moveTo(205, 442);
      ctx.lineTo(208, 465);
      ctx.moveTo(225, 442);
      ctx.lineTo(221, 455);
      ctx.lineTo(226, 472);
      ctx.moveTo(245, 442);
      ctx.lineTo(248, 460);
      ctx.stroke();

      // Embedded gravel pebbles in soil
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(195, 465, 2.5, 0, Math.PI * 2);
      ctx.arc(235, 468, 3, 0, Math.PI * 2);
      ctx.arc(175, 472, 2, 0, Math.PI * 2);
      ctx.fill();

      // ── 6. REALISTIC GRANITE ROCKS ────────────────────────
      ctx.save();
      ctx.translate(690, 380);
      // Large Angular Granite Boulder
      const graniteGrad = ctx.createLinearGradient(-35, -20, 35, 20);
      graniteGrad.addColorStop(0, '#94a3b8');
      graniteGrad.addColorStop(0.35, '#64748b');
      graniteGrad.addColorStop(0.7, '#475569');
      graniteGrad.addColorStop(1, '#334155');
      ctx.fillStyle = graniteGrad;

      // Faceted boulder contour
      ctx.beginPath();
      ctx.moveTo(-32, 10);
      ctx.lineTo(-24, -14);
      ctx.lineTo(-5, -22);
      ctx.lineTo(24, -16);
      ctx.lineTo(34, 6);
      ctx.lineTo(22, 20);
      ctx.lineTo(-18, 22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Quartz Strike Vein
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-20, -10);
      ctx.lineTo(8, -12);
      ctx.lineTo(28, 4);
      ctx.stroke();

      // Lush Green Alpine Moss & Lichen Patches
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.ellipse(-14, -12, 10, 5, Math.PI / 8, 0, Math.PI * 2);
      ctx.ellipse(12, -8, 8, 4, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Secondary Companion Boulder
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(20, 6);
      ctx.lineTo(38, -2);
      ctx.lineTo(46, 12);
      ctx.lineTo(28, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // ── 7. HIMALAYAN BLUE PINE & DEODAR ─────────────────────
      ctx.save();
      ctx.translate(160, 280);

      // Gnarled Cedar Trunk with Bark Texture
      const trunkGrad = ctx.createLinearGradient(-10, 0, 10, 0);
      trunkGrad.addColorStop(0, '#451a03');
      trunkGrad.addColorStop(0.35, '#78350f');
      trunkGrad.addColorStop(0.75, '#572b0e');
      trunkGrad.addColorStop(1, '#271202');
      ctx.fillStyle = trunkGrad;

      ctx.beginPath();
      ctx.moveTo(-9, -20);
      ctx.lineTo(-14, 55);
      ctx.lineTo(-22, 65); // Root flare left
      ctx.lineTo(20, 65);  // Root flare right
      ctx.lineTo(12, 55);
      ctx.lineTo(8, -20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1f0901';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Bark Furrow Striations
      ctx.strokeStyle = '#271202';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(-6, 45);
      ctx.moveTo(2, -15);
      ctx.lineTo(4, 50);
      ctx.stroke();

      // 5 Tiered Conifer Needle Boughs (Dark rich green to bright sunlight tips)
      const tiers = [
        { y: -80, w: 26, h: 28 },
        { y: -60, w: 42, h: 32 },
        { y: -38, w: 56, h: 36 },
        { y: -14, w: 68, h: 40 },
        { y: 12, w: 76, h: 42 },
      ];

      tiers.forEach((tier, tIdx) => {
        // Deep underside shade
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.moveTo(0, tier.y - tier.h * 0.4);
        ctx.lineTo(-tier.w * 0.95, tier.y + tier.h * 0.6);
        ctx.lineTo(0, tier.y + tier.h * 0.4);
        ctx.lineTo(tier.w * 0.95, tier.y + tier.h * 0.6);
        ctx.closePath();
        ctx.fill();

        // Sunlit green needle sprays
        const needleGrad = ctx.createLinearGradient(0, tier.y - tier.h * 0.5, 0, tier.y + tier.h * 0.6);
        needleGrad.addColorStop(0, '#22c55e');
        needleGrad.addColorStop(0.5, '#15803d');
        needleGrad.addColorStop(1, '#064e3b');
        ctx.fillStyle = needleGrad;

        ctx.beginPath();
        ctx.moveTo(0, tier.y - tier.h * 0.5);
        ctx.quadraticCurveTo(-tier.w * 0.5, tier.y, -tier.w, tier.y + tier.h * 0.5);
        ctx.quadraticCurveTo(-tier.w * 0.4, tier.y + tier.h * 0.35, 0, tier.y + tier.h * 0.4);
        ctx.quadraticCurveTo(tier.w * 0.4, tier.y + tier.h * 0.35, tier.w, tier.y + tier.h * 0.5);
        ctx.quadraticCurveTo(tier.w * 0.5, tier.y, 0, tier.y - tier.h * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Hanging Woody Pine Cones on lower boughs
        if (tIdx >= 2) {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.ellipse(-tier.w * 0.45, tier.y + tier.h * 0.45, 3.5, 6, 0.15, 0, Math.PI * 2);
          ctx.ellipse(tier.w * 0.45, tier.y + tier.h * 0.45, 3.5, 6, -0.15, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // ── 8. RHODODENDRON BLOOM BUSH ──────────────────────────
      ctx.save();
      ctx.translate(430, 325);

      // Woody branches
      ctx.strokeStyle = '#572b0e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 22);
      ctx.lineTo(-8, 6);
      ctx.lineTo(-16, -6);
      ctx.moveTo(0, 22);
      ctx.lineTo(8, 8);
      ctx.lineTo(16, -4);
      ctx.stroke();

      // Whorls of Leathery Dark Green Leaves
      const leafAngles = [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4, 3.0];
      leafAngles.forEach((ang) => {
        ctx.save();
        ctx.rotate(ang);
        const lGrad = ctx.createLinearGradient(0, 0, 22, 0);
        lGrad.addColorStop(0, '#15803d');
        lGrad.addColorStop(1, '#166534');
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.ellipse(14, 0, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Leaf midrib
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(26, 0);
        ctx.stroke();
        ctx.restore();
      });

      // 3 Clustered Trusses of Bell-shaped Crimson Flowers
      const trusses = [
        { x: -12, y: -8, scale: 1.0 },
        { x: 12, y: -6, scale: 0.95 },
        { x: 0, y: -18, scale: 1.1 },
      ];

      trusses.forEach((tr) => {
        ctx.save();
        ctx.translate(tr.x, tr.y);
        ctx.scale(tr.scale, tr.scale);

        // Individual bell florets
        for (let fl = 0; fl < 6; fl++) {
          const flAng = (fl * Math.PI * 2) / 6;
          const fx = Math.cos(flAng) * 9;
          const fy = Math.sin(flAng) * 9;

          // Crimson bell petal
          const petGrad = ctx.createRadialGradient(fx, fy, 1, fx, fy, 8);
          petGrad.addColorStop(0, '#f43f5e');
          petGrad.addColorStop(0.5, '#dc2626');
          petGrad.addColorStop(1, '#991b1b');
          ctx.fillStyle = petGrad;

          ctx.beginPath();
          ctx.arc(fx, fy, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Dark nectar spots in throat
          ctx.fillStyle = '#450a0a';
          ctx.beginPath();
          ctx.arc(fx * 0.7, fy * 0.7, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center floral throat & golden stamens
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        for (let st = 0; st < 5; st++) {
          const sa = (st * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(Math.cos(sa) * 3.5, Math.sin(sa) * 3.5, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      ctx.restore();

      // ── 9. ULTRA-REALISTIC HIMALAYAN MUSK DEER ──────────────
      ctx.save();
      ctx.translate(320, 360);

      // Micro-animations: breathing & gentle grazing bob
      const breath = Math.sin(time * 2.8) * 1.2;
      const headBob = Math.sin(time * 1.4) * 2.0;

      // Ground Contact Shadow (zero Gaussian blur)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 32, 28, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slender articulated Hind Legs (Right side, behind body)
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-12, 10);
      ctx.lineTo(-16, 22);
      ctx.lineTo(-14, 32);
      ctx.stroke();
      // Cloven hoof
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, 30, 4.5, 3.5);

      // Foreleg (Right side, behind body)
      ctx.beginPath();
      ctx.moveTo(14, 10);
      ctx.lineTo(16, 22);
      ctx.lineTo(15, 32);
      ctx.stroke();
      ctx.fillRect(13, 30, 4.5, 3.5);

      // Main Torso (Characteristic high arched back & muscular rump)
      const deerBodyGrad = ctx.createLinearGradient(-26, -15, 26, 15);
      deerBodyGrad.addColorStop(0, '#572b0e'); // Rich agouti brown
      deerBodyGrad.addColorStop(0.4, '#78350f'); // Warm amber flanks
      deerBodyGrad.addColorStop(0.85, '#92400e'); // Golden russet
      deerBodyGrad.addColorStop(1, '#451a03'); // Dark underbelly
      ctx.fillStyle = deerBodyGrad;

      ctx.beginPath();
      // Arched lumbar spine curve
      ctx.moveTo(-22, 10); // Rump curve
      ctx.bezierCurveTo(-28, -6, -18, -18 + breath, 0, -14 + breath); // High arched back
      ctx.bezierCurveTo(14, -12, 22, -4, 24, 8); // Shoulder & chest
      ctx.bezierCurveTo(20, 18, -8, 20, -22, 10); // Underbelly
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#271202';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Dappled Agouti Fur Texture
      ctx.fillStyle = 'rgba(253, 230, 138, 0.35)';
      ctx.beginPath();
      ctx.arc(-8, -4 + breath, 1.4, 0, Math.PI * 2);
      ctx.arc(-2, -6 + breath, 1.2, 0, Math.PI * 2);
      ctx.arc(6, -2 + breath, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Foreleg (Left side, foreground)
      ctx.strokeStyle = '#572b0e';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(18, 8);
      ctx.lineTo(20, 20);
      ctx.lineTo(18, 33);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(16, 31, 4.5, 3.5);

      // Powerful Hind Leg (Left side, foreground)
      ctx.strokeStyle = '#572b0e';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-12, 20);
      ctx.lineTo(-10, 33);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, 31, 4.5, 3.5);

      // Robust Alert Neck with Double Cream Throat Streaks
      const neckGrad = ctx.createLinearGradient(14, -6, 28, -26);
      neckGrad.addColorStop(0, '#78350f');
      neckGrad.addColorStop(1, '#572b0e');
      ctx.fillStyle = neckGrad;
      ctx.beginPath();
      ctx.moveTo(15, -6);
      ctx.lineTo(26, -24 + headBob);
      ctx.lineTo(34, -20 + headBob);
      ctx.lineTo(22, 4);
      ctx.closePath();
      ctx.fill();

      // Signature White/Cream Double Throat Collars
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.ellipse(23, -12 + headBob * 0.5, 7, 2.5, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(25, -6 + headBob * 0.5, 6, 2.2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Refined Musk Deer Head
      ctx.save();
      ctx.translate(28, -24 + headBob);

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.lineTo(14, -2); // Snout bridge
      ctx.lineTo(15, 4);  // Muzzle
      ctx.lineTo(4, 7);   // Jaw
      ctx.lineTo(-6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#271202';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Dark Muzzle & Nostril
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(14, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Expressive Almond Eye with Amber Rim & Specular Highlight
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(3, -2, 3.5, 2.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(3, -2, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3.6, -2.6, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // SIGNATURE FEATURE: Downward Curved Canine Tusks (Male Musk Deer)
      ctx.strokeStyle = '#fffbeb';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, 4);
      ctx.quadraticCurveTo(12, 9, 9, 13);
      ctx.stroke();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Alert Upright Ears with Dense White Inner Fur
      // Far Ear
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(-6, -12, 4, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Near Ear
      ctx.fillStyle = '#572b0e';
      ctx.beginPath();
      ctx.ellipse(-1, -13, 5, 11, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffbeb'; // Inner ear hair tufts
      ctx.beginPath();
      ctx.ellipse(-1, -13, 2.5, 8, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();

      // ── 10. ULTRA-REALISTIC DANFE BIRD IN FLIGHT ──────────────
      // 9-Colored Himalayan Monal soaring over the valley
      ctx.save();
      const danfeFlyY = 155 + Math.sin(time * 3) * 12;
      const wingFlap = Math.sin(time * 9) * 0.45;
      ctx.translate(600, danfeFlyY);
      ctx.rotate(-0.08 + Math.sin(time * 3) * 0.05);

      // Cinnamon-Rufous Broad Fan Tail (Color 1 & 2)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.lineTo(-38, -6);
      ctx.lineTo(-44, 4);
      ctx.lineTo(-36, 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Tail feather vanes
      ctx.strokeStyle = 'rgba(254, 215, 170, 0.6)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.lineTo(-40, 2);
      ctx.stroke();

      // Pure Snow-White Lower Back/Rump Patch (Color 3)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-10, 0, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Velvet Black Breast & Belly (Color 4)
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(4, 5, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iridescent Metallic Sapphire Blue Mantle & Wing Coverts (Color 5)
      const mantleGrad = ctx.createLinearGradient(-10, -10, 16, 10);
      mantleGrad.addColorStop(0, '#10b981'); // Emerald transition
      mantleGrad.addColorStop(0.4, '#0284c7'); // Turquoise
      mantleGrad.addColorStop(0.8, '#1d4ed8'); // Sapphire
      mantleGrad.addColorStop(1, '#6366f1'); // Purple sheen
      ctx.fillStyle = mantleGrad;
      ctx.beginPath();
      ctx.ellipse(0, -2, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fully Extended Primary & Secondary Flight Wings
      ctx.save();
      ctx.rotate(wingFlap);

      // Left Far Wing
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.quadraticCurveTo(8, -28, 22, -34);
      ctx.quadraticCurveTo(12, -18, 8, -6);
      ctx.closePath();
      ctx.fill();

      // Right Foreground Wing (Detailed feather pinions & metallic sheen)
      const wingGrad = ctx.createLinearGradient(0, 0, 28, -38);
      wingGrad.addColorStop(0, '#1d4ed8');
      wingGrad.addColorStop(0.5, '#06b6d4');
      wingGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = wingGrad;

      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.quadraticCurveTo(12, -32, 28, -40);
      ctx.quadraticCurveTo(18, -20, 12, -4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Individual flight pinion feather tips
      ctx.fillStyle = '#0f172a';
      for (let p = 0; p < 4; p++) {
        ctx.beginPath();
        ctx.ellipse(22 - p * 4, -34 + p * 6, 4, 1.8, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Iridescent Copper-Bronze & Reddish Neck Mantle (Color 6 & 7)
      const neckRuffGrad = ctx.createLinearGradient(8, -4, 20, -14);
      neckRuffGrad.addColorStop(0, '#b45309');
      neckRuffGrad.addColorStop(0.5, '#f59e0b');
      neckRuffGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = neckRuffGrad;
      ctx.beginPath();
      ctx.ellipse(14, -4, 8, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Danfe Head with Bright Blue Eye Skin Patch (Color 8)
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.arc(22, -8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Bare Turquoise Orbital Eye Skin
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(22.5, -8.5, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Piercing Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(22.5, -8.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(23, -9, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Curved Horn-Colored Bill
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(27, -9);
      ctx.lineTo(34, -7);
      ctx.lineTo(26, -5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // SIGNATURE FEATURE: Metallic Emerald-Green Spatulate Crest Plumes (Color 9)
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 1.4;
      for (let cr = -2; cr <= 2; cr++) {
        const cra = cr * 0.18;
        const clen = 14 + Math.abs(cr) * 2;
        const cx = 20 - Math.sin(cra) * clen;
        const cy = -12 - Math.cos(cra) * clen;
        ctx.beginPath();
        ctx.moveTo(20, -12);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Spatulate fan paddle at tip
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 2.4, 1.4, cra, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ── 11. SUNLIGHT CORONA & RAYS ───────────────────────
      ctx.save();
      ctx.translate(770, 75);

      // Outer Warm Solar Glow Halo
      const sunHalo = ctx.createRadialGradient(0, 0, 18, 0, 0, 65);
      sunHalo.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      sunHalo.addColorStop(0.4, 'rgba(251, 191, 36, 0.45)');
      sunHalo.addColorStop(0.8, 'rgba(245, 158, 11, 0.15)');
      sunHalo.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunHalo;
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.fill();

      // Radiant Core Sun Disc
      const sunCore = ctx.createRadialGradient(-6, -6, 2, 0, 0, 28);
      sunCore.addColorStop(0, '#ffffff');
      sunCore.addColorStop(0.3, '#fef08a');
      sunCore.addColorStop(0.8, '#facc15');
      sunCore.addColorStop(1, '#f59e0b');
      ctx.fillStyle = sunCore;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Soft rotating corona beam rays
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      for (let s = 0; s < 12; s++) {
        const sa = (s * Math.PI * 2) / 12 + time * 0.2;
        const rayLen = (s % 2 === 0 ? 46 : 38) + Math.sin(time * 3 + s) * 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 32, Math.sin(sa) * 32);
        ctx.lineTo(Math.cos(sa) * rayLen, Math.sin(sa) * rayLen);
        ctx.stroke();
      }
      ctx.restore();

      // ── 12. INTERACTIVE HOTSPOT HALOS & BADGES ────────────────────────────
      elements.forEach((el) => {
        const isSelected = selectedId === el.id;
        const isDimmed =
          (filterMode === 'biotic' && el.category !== 'Biotic') ||
          (filterMode === 'abiotic' && el.category !== 'Abiotic');

        if (isDimmed) return;

        const haloColor = el.category === 'Biotic' ? '#22c55e' : '#06b6d4';
        const pulse = isSelected ? Math.sin(time * 6) * 4 : 0;

        // Outer Focus Ring
        ctx.strokeStyle = isSelected ? '#facc15' : haloColor;
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.radius + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing Wave Ring for selected element
        if (isSelected) {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.radius + 10 + pulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Category Badge Tag Pill Above Element
        ctx.save();
        ctx.fillStyle = isSelected ? '#facc15' : 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(el.x - 38, el.y - el.radius - 20, 76, 18, 5);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ca8a04' : haloColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#0f172a' : '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lang === 'ne' ? el.categoryNe : el.category, el.x, el.y - el.radius - 11);
        ctx.restore();
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedId, filterMode, lang]);

  return (
    <SimulationLayout
      titleEn="2D Living Environment Explorer"
      titleNe="सजीव र वातावरण 2डी प्राकृतिक परिवेश"
      subject="Science"
      grade={4}
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
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D ECOLOGICAL CANVIEWPORT
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
            onClick={handleCanvasClick}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          />

          {/* Top Quick Badges Floating Bar */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Trees size={13} />
              {lang === 'ne'
                ? `अध्ययन गरिएका तत्व: ${inspectedIds.length}/${elements.length}`
                : `Explored: ${inspectedIds.length}/${elements.length}`}
            </span>

            {/* Quick Filter Pill Buttons */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '2px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <button
                onClick={() => {
                  setFilterMode('all');
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterMode === 'all' ? '#0ea5e9' : 'transparent',
                  color: filterMode === 'all' ? '#fff' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang === 'ne' ? 'सबै' : 'All'}
              </button>
              <button
                onClick={() => {
                  setFilterMode('biotic');
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterMode === 'biotic' ? '#16a34a' : 'transparent',
                  color: filterMode === 'biotic' ? '#fff' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang === 'ne' ? 'सजीव' : 'Biotic'}
              </button>
              <button
                onClick={() => {
                  setFilterMode('abiotic');
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterMode === 'abiotic' ? '#0284c7' : 'transparent',
                  color: filterMode === 'abiotic' ? '#fff' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang === 'ne' ? 'निर्जीव' : 'Abiotic'}
              </button>
            </div>
          </div>

          {/* Bottom Floating Interactive Inspection Dock */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: currentElement.category === 'Biotic' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                  border: currentElement.category === 'Biotic' ? '1px solid #22c55e' : '1px solid #0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {currentElement.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'ne' ? currentElement.nameNe : currentElement.nameEn}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: currentElement.category === 'Biotic' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(14, 165, 233, 0.25)',
                      color: currentElement.category === 'Biotic' ? '#4ade80' : '#38bdf8',
                      border: currentElement.category === 'Biotic' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(14, 165, 233, 0.4)',
                    }}
                  >
                    {lang === 'ne' ? currentElement.categoryNe : currentElement.category}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {lang === 'ne' ? currentElement.descNe : currentElement.descEn}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleReset}
                title="Reset Inspection"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                {lang === 'ne' ? 'रिसेट' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: ECOSYSTEM EXPLORER & COMPONENT INSPECTOR (380px)
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
          {/* Header Discovery Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#4ade80" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80' }}>
                {lang === 'ne' ? 'पारिस्थितिक अनुसन्धान केन्द्र' : 'Himalayan Ecosystem Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'सजीव प्राणी (मृग, डाँफे, सल्ला) र निर्जीव तत्व (घाम, खोला, माटो) मिलेर हिमाली पर्यावरण सन्तुलित रहन्छ।'
                : 'Living organisms (deer, monal, pines) interact continuously with abiotic elements (sunlight, stream, granite) to sustain mountain ecology.'}
            </div>
          </div>

          {/* Biome Category Switcher */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'ECOSYSTEM CATEGORIES' : 'वातावरणका वर्गहरू'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => {
                  setFilterMode('biotic');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: filterMode === 'biotic' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  background: filterMode === 'biotic' ? '#dcfce7' : '#f8fafc',
                  color: filterMode === 'biotic' ? '#15803d' : '#334155',
                }}
              >
                🌲 {lang === 'en' ? 'Biotic' : 'सजीव प्राणी'}
              </button>
              <button
                onClick={() => {
                  setFilterMode('abiotic');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: filterMode === 'abiotic' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  background: filterMode === 'abiotic' ? '#e0f2fe' : '#f8fafc',
                  color: filterMode === 'abiotic' ? '#0369a1' : '#334155',
                }}
              >
                ☀️ {lang === 'en' ? 'Abiotic' : 'निर्जीव तत्व'}
              </button>
            </div>
          </div>

          {/* Progress Meter */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
              <span>{lang === 'en' ? 'Elements Explored' : 'अध्ययन गरिएका तत्वहरू'}</span>
              <strong style={{ color: '#16a34a' }}>{inspectedIds.length} / {elements.length}</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(inspectedIds.length / elements.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0ea5e9, #22c55e)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Active Biological Adaptation Detail Box */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} />
              <span>{lang === 'ne' ? 'पारिस्थितिक भूमिका र अनुकूलन:' : 'Ecological Role & Adaptation:'}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne' ? currentElement.bioDetailNe : currentElement.bioDetailEn}
            </div>
          </div>

          {/* Component Selection Grid (All 8 elements) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'INSPECT ECOSYSTEM ELEMENTS' : 'तत्वहरू छनौट गरी अध्ययन गर्नुहोस्'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
              {elements.map((el) => {
                const isSelected = selectedId === el.id;
                const isInspected = inspectedIds.includes(el.id);
                return (
                  <button
                    key={el.id}
                    onClick={() => handleSelectElement(el.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#e0f2fe' : '#f8fafc',
                      color: '#0f172a',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{el.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: isSelected ? '#0369a1' : '#0f172a' }}>{lang === 'ne' ? el.nameNe : el.nameEn}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {lang === 'ne' ? el.categoryNe : el.category}
                        </div>
                      </div>
                    </div>
                    {isInspected && <Check size={14} color="#16a34a" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
              {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम मुख्य निष्कर्ष'}
            </div>
            <p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'All living (biotic) organisms depend directly on non-living (abiotic) factors like sunlight, clean water, fertile soil, and fresh mountain air.'
                : 'सजीव प्राणीहरू (वनस्पति र जनावर) बाँच्नका लागि घाम, पानी, हावा र माटो जस्ता निर्जीव तत्वहरूमा पूर्ण रूपमा निर्भर हुन्छन्।'}
            </p>
          </div>

          {/* Complete Lab & Quiz Button */}
          <button
            onClick={() => {
              ScienceAudio.playSuccess();
              setStars(3);
              setIsCompleted(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? '✓ Complete Ecology Lab & Quiz' : '✓ प्रयोगशाला पूरा गरी तारा जित्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default LivingEnvironmentSim;
