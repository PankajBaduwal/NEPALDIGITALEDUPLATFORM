/**
 * FloweringNonFloweringSim.tsx
 * Simulation 8: 2D Flowering and Non-Flowering Plants Botanical Explorer
 * Grade 6 Science • Unit 3: Organisms & Their Structure
 *
 * 100% Native HTML5 Canvas 2D Botanical Laboratory.
 * Features:
 * - Real Botanical Photography: Mustard Plant (Flowering Angiosperm) & Mountain Fern (Non-Flowering Cryptogam)
 * - Interactive Organ Inspector with anatomical pin callouts
 * - Interactive High-Power Microscope Zoom into Flower Reproductive Whorls vs Fern Spore Sori
 * - Side-by-side Comparative Morphology Table
 * - Gold Standard Dark Educational Theme (#090d16, glowing sci-fi badges, 380px persistent sidebar)
 * - Bilingual EN/NE labels, scientific audio, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Flower2, Trees, Sparkles, Check, RotateCcw, ZoomIn, Info, ShieldCheck, Award } from 'lucide-react';

type PlantCategory = 'flowering' | 'nonflowering';

interface PlantOrgan {
  id: string;
  nameEn: string;
  nameNe: string;
  roleEn: string;
  roleNe: string;
  pinY: number;
}

export const FloweringNonFloweringSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeCategory, setActiveCategory] = useState<PlantCategory>('flowering');
  const [selectedOrganId, setSelectedOrganId] = useState<string>('flower');
  const [showMicroscope, setShowMicroscope] = useState<boolean>(false);
  const [exploredBoth, setExploredBoth] = useState<string[]>(['flowering']);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  const floweringOrgans: PlantOrgan[] = [
    {
      id: 'flower',
      nameEn: 'Mustard Flower',
      nameNe: 'फूल (प्रजनन अङ्ग)',
      roleEn: 'Reproductive organ with 4 bright yellow petals attracting bees; develops into fruit and mustard seeds.',
      roleNe: 'बिरुवाको मुख्य प्रजनन अङ्ग; परागसेचनपछि यसबाट तोरीको कोसा र बीउ बन्दछ।',
      pinY: 80,
    },
    {
      id: 'leaves',
      nameEn: 'Green Leaves',
      nameNe: 'पात (प्रकाश संश्लेषण)',
      roleEn: 'Broad leaves with reticulate venation and chlorophyll performing photosynthesis to generate food.',
      roleNe: 'क्लोरोफिलको मद्दतले सूर्यको प्रकाशमा खाना बनाउँछ, जालीदार नसा भएको हुन्छ।',
      pinY: 170,
    },
    {
      id: 'stem',
      nameEn: 'Erect Stem',
      nameNe: 'काण्ड (खम्बा र ढुवानी)',
      roleEn: 'Upright herbaceous stem with xylem and phloem transporting water and sap.',
      roleNe: 'बिरुवालाई सीधा अड्याउने र जराबाट पानी तथा पातबाट खाना ओसार्ने काण्ड।',
      pinY: 260,
    },
    {
      id: 'root',
      nameEn: 'Taproot System',
      nameNe: 'मुल जरा (माटो समाउने र पानी सोस्ने)',
      roleEn: 'Deep central primary taproot with lateral secondary root hairs absorbing water and minerals.',
      roleNe: 'माटोभित्र गहिरोसम्म जाने मुख्य जरा र पानी सोस्ने साना जराहरू।',
      pinY: 360,
    },
  ];

  const nonFloweringOrgans: PlantOrgan[] = [
    {
      id: 'frond',
      nameEn: 'Fern Frond / Pinna',
      nameNe: 'उनिउको पात (Frond)',
      roleEn: 'Feathery pinnately compound leaves conducting photosynthesis; fiddlehead-coiled when young.',
      roleNe: 'प्वाँख जस्तै खण्ड-खण्ड परेको हरियो पात, कलिलो छँदा घुम्रिएको (Fiddlehead) हुन्छ।',
      pinY: 100,
    },
    {
      id: 'sori',
      nameEn: 'Sori / Spore Clusters',
      nameNe: 'स्पोर पोका (Sori)',
      roleEn: 'Brown reproductive spore capsules on the underside of mature fronds; disperses spores for reproduction.',
      roleNe: 'पातको पछाडिपट्टि रहने खैरा थोप्लाहरू जसमा बीउको सट्टा प्रजननका लागि स्पोर हुन्छन्।',
      pinY: 190,
    },
    {
      id: 'rhizome',
      nameEn: 'Underground Rhizome',
      nameNe: 'भूमिगत काण्ड (Rhizome)',
      roleEn: 'Horizontal underground modified stem storing food and anchoring adventitious roots.',
      roleNe: 'माटोमुनि तेर्सो परेर फैलिने काण्ड जसले खाना सञ्चय गर्छ र नयाँ पात निकाल्छ।',
      pinY: 330,
    },
    {
      id: 'roots',
      nameEn: 'Adventitious Roots',
      nameNe: 'झुप्पा जरा (Fibrous Roots)',
      roleEn: 'Fibrous cluster of adventitious roots absorbing moisture from damp mountain forest soil.',
      roleNe: 'काण्डबाट सिधै निस्केर ओसिलो माटोबाट पानी सोस्ने पातला झुप्पा जराहरू।',
      pinY: 390,
    },
  ];

  const currentOrgans = activeCategory === 'flowering' ? floweringOrgans : nonFloweringOrgans;
  const currentOrgan = currentOrgans.find((o) => o.id === selectedOrganId) || currentOrgans[0];

  // Preload real plant images
  useEffect(() => {
    const plants = [
      { id: 'flowering', local: '/assets/simulations/plants/mustard.jpg', fb: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80' },
      { id: 'nonflowering', local: '/assets/simulations/plants/fern.jpg', fb: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80' },
    ];
    plants.forEach((p) => {
      if (!imagesRef.current[p.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = p.local;
        img.onerror = () => {
          img.src = p.fb;
        };
        imagesRef.current[p.id] = img;
      }
    });
  }, []);

  const handleSelectCategory = (cat: PlantCategory) => {
    ScienceAudio.playPop();
    setActiveCategory(cat);
    setSelectedOrganId(cat === 'flowering' ? 'flower' : 'frond');
    if (!exploredBoth.includes(cat)) {
      const next = [...exploredBoth, cat];
      setExploredBoth(next);
      setStars(Math.min(3, next.length + 1));
      if (next.length >= 2) {
        setIsCompleted(true);
        ScienceAudio.playSuccess();
        setStage('observe');
      }
    }
  };

  const handleReset = () => {
    setActiveCategory('flowering');
    setSelectedOrganId('flower');
    setShowMicroscope(false);
    setExploredBoth(['flowering']);
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

      // Left Botanical Specimen Display Card (Dark glassmorphic style)
      const cardX = 40;
      const cardY = 30;
      const cardW = 340;
      const cardH = 420;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      // Real botanical photograph
      const activeImg = imagesRef.current[activeCategory];
      if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX + 15, cardY + 15, cardW - 30, 270, 16);
        ctx.clip();
        ctx.drawImage(activeImg, cardX + 15, cardY + 15, cardW - 30, 270);
        ctx.restore();

        // Border around photo
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX + 15, cardY + 15, cardW - 30, 270, 16);
        ctx.stroke();
      }

      // Specimen title under photo
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      const plantTitle =
        activeCategory === 'flowering'
          ? (lang === 'ne' ? 'तोरीको बिरुवा (Mustard Plant)' : 'Mustard Plant (Brassica campestris)')
          : (lang === 'ne' ? 'उनिउको बिरुवा (Mountain Fern)' : 'Mountain Fern (Dryopteris)');
      ctx.fillText(plantTitle, cardX + 20, cardY + 315);

      ctx.fillStyle = activeCategory === 'flowering' ? '#facc15' : '#4ade80';
      ctx.font = 'bold 12px sans-serif';
      const plantType =
        activeCategory === 'flowering'
          ? (lang === 'ne' ? 'फूल फुल्ने (Angiosperm) • बीउबाट प्रजनन' : 'Flowering (Angiosperm) • Seed Producer')
          : (lang === 'ne' ? 'फूल नफुल्ने (Cryptogam) • स्पोरबाट प्रजनन' : 'Non-Flowering (Cryptogam) • Spore Producer');
      ctx.fillText(plantType, cardX + 20, cardY + 338);

      // Right Side: Either High-Power Microscope or Anatomical Organ Diagram
      const rightX = 400;
      const rightY = 30;
      const rightW = 300;
      const rightH = 420;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rightX, rightY, rightW, rightH, 20);
      ctx.fill();
      ctx.stroke();

      if (showMicroscope) {
        // --- MICROSCOPE CIRCULAR FIELD OF VIEW ---
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(
          lang === 'ne' ? 'सूक्ष्मदर्शी दृश्य (100x Microscope)' : '100x Microscope Examination',
          rightX + 20,
          rightY + 35
        );

        // Circular illuminated lens
        const lensCX = rightX + rightW / 2;
        const lensCY = rightY + 180;
        const lensR = 100;

        // Glowing brass bezel
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(lensCX, lensCY, lensR + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Lens interior
        ctx.save();
        ctx.beginPath();
        ctx.arc(lensCX, lensCY, lensR, 0, Math.PI * 2);
        ctx.clip();

        // Dark optical lens background
        const lensGrad = ctx.createRadialGradient(lensCX - 20, lensCY - 20, 10, lensCX, lensCY, lensR);
        lensGrad.addColorStop(0, '#0f2b48');
        lensGrad.addColorStop(0.7, '#071829');
        lensGrad.addColorStop(1, '#020b14');
        ctx.fillStyle = lensGrad;
        ctx.fill();

        // Cellular structures
        if (activeCategory === 'flowering') {
          // Flower Reproductive Organs: Anther pollen grains & Petal cells
          ctx.fillStyle = '#facc15';
          for (let p = 0; p < 25; p++) {
            const px = lensCX + Math.cos(p * 0.8 + time) * (20 + (p % 5) * 14);
            const py = lensCY + Math.sin(p * 0.8 + time) * (20 + (p % 5) * 14);
            ctx.beginPath();
            ctx.arc(px, py, 6 + (p % 3), 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          // Center pistil stigma
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(lensCX, lensCY, 18, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Fern Sori: Sporangia capsules with spores
          ctx.fillStyle = '#92400e';
          for (let s = 0; s < 18; s++) {
            const sx = lensCX + Math.cos(s * 0.9) * (15 + (s % 4) * 18);
            const sy = lensCY + Math.sin(s * 0.9) * (15 + (s % 4) * 18);
            ctx.beginPath();
            ctx.ellipse(sx, sy, 10, 6, s, 0, Math.PI * 2);
            ctx.fill();
            // Tiny spores bursting
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(sx + 8, sy - 4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#92400e';
          }
        }
        ctx.restore();

        // Microscope caption
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        const microCaption =
          activeCategory === 'flowering'
            ? (lang === 'ne' ? 'परागकण र प्रजनन अङ्ग (Pollen Grains)' : 'Pollen Grains & Stigma')
            : (lang === 'ne' ? 'स्पोरेन्जिया र स्पोर पोका (Spore Capsule)' : 'Sporangium Bursting with Spores');
        ctx.fillText(microCaption, rightX + 20, rightY + 310);
      } else {
        // --- MORPHOLOGY COMPARISON CARDS ---
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(
          lang === 'ne' ? 'संरचना तुलना (Botanical Comparison)' : 'Botanical Comparison',
          rightX + 20,
          rightY + 35
        );

        // Feature rows
        const drawCompRow = (y: number, titleEn: string, titleNe: string, valFlow: string, valNon: string) => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(rightX + 15, y, rightW - 30, 65, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(lang === 'ne' ? titleNe : titleEn, rightX + 25, y + 22);

          ctx.fillStyle = activeCategory === 'flowering' ? '#facc15' : '#4ade80';
          ctx.font = '11px sans-serif';
          const textVal = activeCategory === 'flowering' ? valFlow : valNon;
          ctx.fillText(textVal, rightX + 25, y + 45);
        };

        drawCompRow(
          rightY + 55,
          '1. Flowers & Petals',
          '1. फूल (Flowers)',
          lang === 'ne' ? '✓ आकर्षक फूलहरू फुल्दछन्' : '✓ Bright 4-petaled yellow flowers',
          lang === 'ne' ? '✕ कुनै फूल फुल्दैन' : '✕ Flowers completely absent'
        );

        drawCompRow(
          rightY + 130,
          '2. Reproduction Method',
          '2. प्रजनन विधि (Reproduction)',
          lang === 'ne' ? '✓ फलभित्र बीउ (Seeds) बन्दछ' : '✓ Seeds produced inside pods',
          lang === 'ne' ? '✓ पातमुनि स्पोर (Spores) बन्दछ' : '✓ Microscopic spores in sori'
        );

        drawCompRow(
          rightY + 205,
          '3. Root System',
          '3. जरा प्रणाली (Roots)',
          lang === 'ne' ? '✓ गहिरो मुल जरा (Taproot)' : '✓ Deep main taproot system',
          lang === 'ne' ? '✓ झुप्पा जरा (Adventitious roots)' : '✓ Fibrous adventitious roots'
        );

        drawCompRow(
          rightY + 280,
          '4. Common Examples',
          '4. नेपालका प्रमुख उदाहरणहरू',
          lang === 'ne' ? 'तोरी, आँप, गुलाब, धान, मकै' : 'Mustard, Mango, Rose, Rice',
          lang === 'ne' ? 'उनिउ, झ्याउ, लेउ, च्याउ' : 'Fern, Moss, Marchantia, Algae'
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeCategory, selectedOrganId, showMicroscope, lang]);

  return (
    <SimulationLayout
      titleEn="2D Flowering & Non-Flowering Plants Lab"
      titleNe="फूल फुल्ने र नफुल्ने बिरुवाहरू 2डी प्रयोगशाला"
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
              {activeCategory === 'flowering' ? <Flower2 size={14} color="#facc15" /> : <Trees size={14} color="#4ade80" />}
              <span>
                {activeCategory === 'flowering'
                  ? (lang === 'ne' ? '1. फूल फुल्ने (Mustard)' : '1. Flowering (Mustard)')
                  : (lang === 'ne' ? '2. फूल नफुल्ने (Fern)' : '2. Non-Flowering (Fern)')}
              </span>
            </div>

            <button
              onClick={() => {
                setShowMicroscope((prev) => !prev);
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: showMicroscope ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                border: showMicroscope ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                color: showMicroscope ? '#38bdf8' : '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ZoomIn size={14} />
              <span>
                {lang === 'ne'
                  ? (showMicroscope ? 'तुलना तालिका' : 'सूक्ष्मदर्शी जुम (100x)')
                  : (showMicroscope ? 'View Table' : 'Microscope (100x)')}
              </span>
            </button>
          </div>

          {/* Bottom Floating Interactive Status Dock */}
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
                {activeCategory === 'flowering' ? <Flower2 size={16} /> : <Trees size={16} />}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? currentOrgan.nameNe : currentOrgan.nameEn}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne' ? currentOrgan.roleNe : currentOrgan.roleEn}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: exploredBoth.length === 2 ? '#4ade80' : '#38bdf8',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '5px 10px',
                  borderRadius: '8px',
                }}
              >
                {lang === 'ne'
                  ? `अन्वेषण: ${exploredBoth.length}/2`
                  : `Explored: ${exploredBoth.length}/2`}
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
                {lang === 'ne' ? 'वनस्पति अनुसन्धान केन्द्र' : 'Botanical Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'तोरी (Angiosperm) र उनिउ (Cryptogam) का भागहरू तुलना गरी प्रजनन संरचना बुझ्नुहोस्।'
                : 'Examine structural whorls, seed vs spore propagation, and leaf/root adaptations.'}
            </div>
          </div>

          {/* Plant Kingdom Group Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'PLANT KINGDOM GROUP' : 'वनस्पति वर्ग छनोट'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => handleSelectCategory('flowering')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: activeCategory === 'flowering' ? '2px solid #ca8a04' : '1px solid #e2e8f0',
                  background: activeCategory === 'flowering' ? '#fef9c3' : '#f8fafc',
                  color: activeCategory === 'flowering' ? '#854d0e' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Flower2 size={14} color="#ca8a04" />
                <span>{lang === 'ne' ? 'फूल फुल्ने' : 'Flowering'}</span>
              </button>

              <button
                onClick={() => handleSelectCategory('nonflowering')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: activeCategory === 'nonflowering' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  background: activeCategory === 'nonflowering' ? '#dcfce7' : '#f8fafc',
                  color: activeCategory === 'nonflowering' ? '#15803d' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trees size={14} color="#16a34a" />
                <span>{lang === 'ne' ? 'फूल नफुल्ने' : 'Non-Flowering'}</span>
              </button>
            </div>
          </div>

          {/* Organ Inspection Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'ne' ? 'बिरुवाका भागहरू छान्नुहोस्' : 'INSPECT ANATOMICAL ORGANS'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {currentOrgans.map((org) => {
                const isSelected = selectedOrganId === org.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      ScienceAudio.playPop();
                      setSelectedOrganId(org.id);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#e0f2fe' : '#f8fafc',
                      color: isSelected ? '#0369a1' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'ne' ? org.nameNe.split(' ')[0] : org.nameEn.split(' ')[0]}
                    </span>
                    {isSelected && <Check size={13} color="#0284c7" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Organ Detail Card */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ShieldCheck size={13} />
              <span>{lang === 'ne' ? currentOrgan.nameNe : currentOrgan.nameEn}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'ne' ? currentOrgan.roleNe : currentOrgan.roleEn}
            </p>
          </div>

          {/* Curriculum Key Takeaway Box */}
          <div
            style={{
              background: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              padding: '12px',
              fontSize: '11px',
              color: '#1e3a8a',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
              <Info size={13} />
              <span>{lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रमको मुख्य निष्कर्ष'}</span>
            </div>
            {activeCategory === 'flowering'
              ? (lang === 'ne'
                ? 'तोरी जस्ता फूल फुल्ने बिरुवाहरूमा परागसेचन भएपछि बीउ बन्दछ जसबाट नयाँ बिरुवा उम्रन्छ।'
                : 'Flowering plants reproduce through flowers; pollination and fertilization form seeds inside protective pods.')
              : (lang === 'ne'
                ? 'उनिउ जस्ता फूल नफुल्ने बिरुवाहरूमा फूल हुँदैन, तिनीहरू पातमुनि रहेका स्पोर (Sori) बाट फैलिन्छन्।'
                : 'Cryptogams like ferns produce no flowers; they propagate through microscopic spores located in sori beneath fronds.')}
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
            {lang === 'en' ? '✓ Complete Botanical Lab & Quiz' : '✓ वनस्पति प्रयोगशाला पूरा भयो'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default FloweringNonFloweringSim;
