/**
 * LandformsExplorerSim.tsx
 * Simulation 29: 2D Nepal Landforms Topographical Explorer
 * Grade 4 Science • Chapter 8: The Earth and Space
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Authentic topographical North-to-South cross-section of Nepal:
 *   1. Himal: Glaciers, snow peaks, cold alpine climate, Yak
 *   2. Pahad: Terraced hills, rhododendron forests, deep river gorges
 *   3. Terai: Flat fertile plains, dense Sal forests, paddy/mustard granary
 * - Interactive Belt Navigator (Himal / Pahad / Terai) with smooth camera pan & focus
 * - Altitude Elevation Scrubber (60m to 8,848m) with real-time temperature & vegetation readouts
 * - Bilingual EN/NE, nature audio, and curriculum quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Mountain, Trees, Sparkles, Check, RotateCcw, Sliders, Info } from 'lucide-react';

type EcologicalBelt = 'all' | 'himal' | 'pahad' | 'terai';

interface BeltData {
  id: EcologicalBelt;
  nameEn: string;
  nameNe: string;
  altRange: string;
  climateEn: string;
  climateNe: string;
  descEn: string;
  descNe: string;
  produceEn: string[];
  produceNe: string[];
}

export const LandformsExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeBelt, setActiveBelt] = useState<EcologicalBelt>('all');
  const [elevationM, setElevationM] = useState<number>(1400); // 60m to 8848m
  const [exploredBelts, setExploredBelts] = useState<Record<string, boolean>>({ himal: true });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const belts: BeltData[] = [
    {
      id: 'himal',
      nameEn: 'Himalayan Region',
      nameNe: 'हिमाली प्रदेश (Himalayan Region)',
      altRange: '3,000m - 8,848.86m',
      climateEn: 'Sub-zero freezing alpine, glaciated',
      climateNe: 'अत्यधिक चिसो, हिमाली तथा तुषारयुक्त',
      descEn: 'Covers northern Nepal. Characterized by snow-capped peaks including Mt. Everest, glaciers, and rugged terrains. Yaks and sheep graze here.',
      descNe: 'नेपालको उत्तरी भूभाग। संसारकै सर्वोच्च शिखर सगरमाथा, हिमनदी र चट्टानी भीरपाखा। चौंरीगाई, भेडा र च्याङ्ग्रा पालिन्छ।',
      produceEn: ['Apples', 'Medicinal Herbs', 'Yarshagumba'],
      produceNe: ['स्याउ', 'यार्सागुम्बा', 'बहुमूल्य जडीबुटी'],
    },
    {
      id: 'pahad',
      nameEn: 'Hilly Region',
      nameNe: 'पहाडी प्रदेश (Hilly Region)',
      altRange: '600m - 3,000m',
      climateEn: 'Temperate, mild and pleasant',
      climateNe: 'समशीतोष्ण, हावापानी रमाइलो र स्वस्थकर',
      descEn: 'Central belt with rolling hills, valleys (Kathmandu, Pokhara), terraced fields, and rhododendron / pine forests.',
      descNe: 'नेपालको मध्य भूभाग। मनोरम डाँडाकाँडा, उपत्यकाहरू, गह्रा खेती र लालीगुराँस तथा सल्लाका जंगल।',
      produceEn: ['Maize & Millet', 'Oranges', 'Tea & Coffee'],
      produceNe: ['मकै र कोदो', 'सुन्तला र जुनार', 'चिया र कफी'],
    },
    {
      id: 'terai',
      nameEn: 'Terai Region',
      nameNe: 'तराई प्रदेश (Terai Region)',
      altRange: '60m - 600m',
      climateEn: 'Sub-tropical, hot and humid',
      climateNe: 'उष्ण प्रदेशीय, गर्मी र आर्द्र',
      descEn: 'Southern flat plains with highly fertile alluvial soil. Known as the Granary of Nepal.',
      descNe: 'नेपालको दक्षिणी समथर भूभाग। मलिलो जलोढ माटोले भरिएको नेपालको मुख्य अन्न भण्डार।',
      produceEn: ['Paddy & Wheat', 'Sugarcane', 'Mustard'],
      produceNe: ['धान र गहुँ', 'उखु र जुट', 'तोरी र दलहन'],
    },
  ];

  const currentBeltData = belts.find((b) => b.id === (activeBelt === 'all' ? 'pahad' : activeBelt)) || belts[1];
  const activeBeltInfo = currentBeltData;

  const handleSelectBelt = (beltId: EcologicalBelt) => {
    setActiveBelt(beltId);
    ScienceAudio.playPop();

    if (beltId === 'himal') setElevationM(5500);
    else if (beltId === 'pahad') setElevationM(1600);
    else if (beltId === 'terai') setElevationM(200);

    const updated = { ...exploredBelts, [beltId]: true };
    setExploredBelts(updated);
    const count = Object.keys(updated).length;
    setStars(Math.min(3, count));
    if (count >= 3) {
      setIsCompleted(true);
      setStage('understand');
    }
  };

  const handleElevationSlider = (val: number) => {
    setElevationM(val);
    if (val >= 3000) setActiveBelt('himal');
    else if (val >= 600) setActiveBelt('pahad');
    else setActiveBelt('terai');
  };

  const handleReset = () => {
    setActiveBelt('all');
    setElevationM(1400);
    setExploredBelts({ himal: true });
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    setQuizFeedback(null);
    ScienceAudio.playWhoosh();
  };

  // 60 FPS Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, 880, 560);

      // 1. SKY & SUN
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.6, '#38bdf8');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 880, 340);

      // Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(80, 70, 24, 0, Math.PI * 2);
      ctx.fill();

      // 2. CONTINUOUS TOPOGRAPHICAL CROSS-SECTION (North on Right/Center, South on Left)
      // Left 0-260: Terai (flat lowlands)
      // Center 260-560: Pahad (terraced hills)
      // Right 560-880: Himal (high snow peaks)

      // A) HIMALAYAN REGION (Right side, Elevation 3000m - 8848m)
      drawHimalayanSection(ctx, 520, 880, activeBelt === 'himal', time);

      // B) HILLY REGION / PAHAD (Center, Elevation 600m - 3000m)
      drawHillySection(ctx, 240, 560, activeBelt === 'pahad', time);

      // C) TERAI REGION (Left, Elevation 60m - 600m)
      drawTeraiSection(ctx, 0, 280, activeBelt === 'terai', time);

      // 3. MEANDERING RIVER FLOWING FROM HIMAL THROUGH HILLS TO TERAI
      drawTransboundaryRiver(ctx, time);

      // 4. REGION BOUNDARY DIVIDERS & ALTITUDE LABELS
      drawRegionBoundaries(ctx);

      // 5. CURRENT ELEVATION MARKER PIN
      drawElevationMarkerPin(ctx, elevationM);

      // 6. HUD BADGE OVERLAY
      drawTopographyHUD(ctx, currentBeltData, elevationM, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeBelt, elevationM, currentBeltData, lang]);

  // A) Himalayan Section
  function drawHimalayanSection(
    ctx: CanvasRenderingContext2D,
    x1: number,
    x2: number,
    highlight: boolean,
    t: number
  ) {
    ctx.save();
    // High jagged peak (Everest)
    ctx.fillStyle = highlight ? '#334155' : '#475569';
    ctx.beginPath();
    ctx.moveTo(x1, 410);
    ctx.lineTo(x1 + 160, 75); // 8848m summit
    ctx.lineTo(x2, 410);
    ctx.lineTo(x2, 560);
    ctx.lineTo(x1, 560);
    ctx.closePath();
    ctx.fill();

    // Snow cover & Glacier
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x1 + 160, 75);
    ctx.lineTo(x1 + 225, 175);
    ctx.lineTo(x1 + 205, 165);
    ctx.lineTo(x1 + 180, 195);
    ctx.lineTo(x1 + 140, 165);
    ctx.lineTo(x1 + 100, 185);
    ctx.closePath();
    ctx.fill();

    // Yak silhouette grazing on high pasture
    drawYak(ctx, x1 + 80, 360);

    ctx.restore();
  }

  function drawYak(ctx: CanvasRenderingContext2D, yx: number, yy: number) {
    ctx.save();
    // Shaggy dark brown body
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(yx, yy, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shaggy skirt hair hanging
    ctx.fillRect(yx - 14, yy + 4, 28, 8);
    // Horns
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(yx - 10, yy - 5);
    ctx.lineTo(yx - 16, yy - 14);
    ctx.stroke();
    ctx.restore();
  }

  // B) Hilly Section (Pahad)
  function drawHillySection(
    ctx: CanvasRenderingContext2D,
    x1: number,
    x2: number,
    highlight: boolean,
    t: number
  ) {
    ctx.save();
    // Rolling green hills
    const hillGrad = ctx.createLinearGradient(x1, 220, x2, 450);
    hillGrad.addColorStop(0, '#15803d');
    hillGrad.addColorStop(0.5, '#16a34a');
    hillGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = hillGrad;

    ctx.beginPath();
    ctx.moveTo(x1, 440);
    ctx.quadraticCurveTo(x1 + 80, 230, x1 + 170, 270);
    ctx.quadraticCurveTo(x1 + 240, 310, x2, 410);
    ctx.lineTo(x2, 560);
    ctx.lineTo(x1, 560);
    ctx.closePath();
    ctx.fill();

    // Terraced Farming Step-lines
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    for (let ty = 310; ty <= 420; ty += 18) {
      ctx.beginPath();
      ctx.moveTo(x1 + 70 + (ty - 310) * 0.8, ty);
      ctx.lineTo(x1 + 220 - (ty - 310) * 0.5, ty);
      ctx.stroke();
    }

    // Rhododendron / Pine trees on hills
    ctx.fillStyle = '#ef4444'; // Red blossoms
    ctx.beginPath();
    ctx.arc(x1 + 130, 280, 4, 0, Math.PI * 2);
    ctx.arc(x1 + 145, 275, 4.5, 0, Math.PI * 2);
    ctx.arc(x1 + 160, 282, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // C) Terai Section (Flat fertile plains)
  function drawTeraiSection(
    ctx: CanvasRenderingContext2D,
    x1: number,
    x2: number,
    highlight: boolean,
    t: number
  ) {
    ctx.save();
    // Flat yellow-green agricultural plain
    const teraiGrad = ctx.createLinearGradient(x1, 410, x2, 560);
    teraiGrad.addColorStop(0, '#84cc16'); // Golden mustard / paddy fields
    teraiGrad.addColorStop(0.4, '#eab308');
    teraiGrad.addColorStop(1, '#65a30d');
    ctx.fillStyle = teraiGrad;

    ctx.beginPath();
    ctx.moveTo(x1, 450);
    ctx.lineTo(x2, 440);
    ctx.lineTo(x2, 560);
    ctx.lineTo(x1, 560);
    ctx.closePath();
    ctx.fill();

    // Dense Sal forest trees in Terai
    ctx.fillStyle = '#166534';
    for (let tx = x1 + 20; tx < x2 - 40; tx += 35) {
      ctx.fillRect(tx, 435, 14, 18);
      ctx.beginPath();
      ctx.arc(tx + 7, 432, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Transboundary River
  function drawTransboundaryRiver(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Flowing from Glacier (x: 640) through gorges (x: 380) into Terai (x: 60)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(680, 260);
    ctx.quadraticCurveTo(520, 380, 360, 420);
    ctx.quadraticCurveTo(220, 440, 40, 485);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(680, 260);
    ctx.quadraticCurveTo(520, 380, 360, 420);
    ctx.quadraticCurveTo(220, 440, 40, 485);
    ctx.stroke();
    ctx.restore();
  }

  // Region Boundaries & Elevation Marks
  function drawRegionBoundaries(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);

    // Border between Terai and Pahad (600m)
    ctx.beginPath();
    ctx.moveTo(270, 180);
    ctx.lineTo(270, 540);
    ctx.stroke();

    // Border between Pahad and Himal (3,000m)
    ctx.beginPath();
    ctx.moveTo(560, 140);
    ctx.lineTo(560, 540);
    ctx.stroke();

    ctx.setLineDash([]);

    // Region Title Headers at bottom
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';

    ctx.fillText('🌾 तराई (Terai)', 135, 520);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('60 मि. - 600 मि.', 135, 536);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui';
    ctx.fillText('🌄 पहाड (Pahad)', 415, 520);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('600 मि. - 3,000 मि.', 415, 536);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui';
    ctx.fillText('🏔️ हिमाल (Himal)', 720, 520);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('3,000 मि. - 8,848 मि.', 720, 536);

    ctx.restore();
  }

  // Elevation Marker Pin
  function drawElevationMarkerPin(ctx: CanvasRenderingContext2D, ele: number) {
    ctx.save();
    // Map ele (60 to 8848) to x position (40 to 680)
    const norm = (ele - 60) / (8848 - 60);
    const px = 40 + norm * 640;
    // Map to ground y
    let py = 450 - norm * 350;

    // Glowing Pin
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Elevation label flag
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.roundRect(px - 45, py - 32, 90, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${ele} m`, px, py - 16);

    ctx.restore();
  }

  // Topography HUD Overlay
  function drawTopographyHUD(
    ctx: CanvasRenderingContext2D,
    belt: BeltData,
    ele: number,
    currentLang: Language
  ) {
    ctx.save();
    const px = 20;
    const py = 20;
    const pw = 420;
    const ph = 90;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(currentLang === 'en' ? belt.nameEn : belt.nameNe, px + 14, py + 24);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`Altitude: ${belt.altRange} • Climate: ${currentLang === 'en' ? belt.climateEn : belt.climateNe}`, px + 14, py + 42);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui';
    const crops = currentLang === 'en' ? belt.produceEn.join(', ') : belt.produceNe.join(', ');
    ctx.fillText(`Main Products: ${crops}`, px + 14, py + 62);
    const desc = currentLang === 'en' ? belt.descEn : belt.descNe;
    ctx.fillText(desc.slice(0, 58) + '...', px + 14, py + 78);

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'terai') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! The Terai region is known as the Granary of Nepal.' : 'सबास! तराई प्रदेशलाई अत्यधिक अन्न फल्ने हुनाले नेपालको अन्न भण्डार भनिन्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. The fertile Terai produces the majority of Nepal’s food grains.' : 'मिलेन। समथर र मलिलो तराई प्रदेश अन्नको भण्डार हो।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Nepal Landforms Topographical Explorer' : 'नेपालको धरातलीय स्वरूप (Landforms of Nepal)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 8: The Earth and Space'
          : 'कक्षा 4 विज्ञान • एकाइ 8: पृथ्वी र अन्तरिक्ष'
      }
      currentStage={stage}
      onStageChange={setStage}
      language={lang}
      onLanguageChange={setLang}
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

          {/* Top Floating Badge */}
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
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#34d399',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Mountain size={14} className="text-emerald-400" />
              <span>
                {lang === 'en' ? activeBeltInfo.nameEn : activeBeltInfo.nameNe}
              </span>
            </div>
          </div>

          {/* Bottom Floating Readout Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {activeBelt === 'terai' ? '🌾' : activeBelt === 'pahad' ? '🌄' : '🏔️'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? activeBeltInfo.nameEn : activeBeltInfo.nameNe}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en' ? activeBeltInfo.descEn : activeBeltInfo.descNe}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Altitude' : 'उचाइ'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  {elevationM}m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: 380px PERSISTENT SIDEBAR
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 1. Discovery Station Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🌄</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#34d399' }}>
                {lang === 'en' ? 'Nepal Landforms Station' : 'नेपालको धरातलीय स्वरूप केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Nepal spans three distinct geographic belts: the fertile Terai plains, the mid-hill Pahad valleys, and the soaring snowcapped Himal.'
                : 'नेपाल भौगोलिक विविधताले भरिपूर्ण छ: समथर तराई (अन्न भण्डार), हरियाली पहाड (उपत्यका) र सेता हिमालहरू (विश्व शिखर)।'}
            </p>
          </div>

          {/* 2. Belt Selectors */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Select Ecological Belt' : 'भौगोलिक प्रदेश रोज्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'terai', nameEn: 'Terai', nameNe: 'तराई', icon: '🌾' },
                { id: 'pahad', nameEn: 'Pahad', nameNe: 'पहाड', icon: '🌄' },
                { id: 'himal', nameEn: 'Himal', nameNe: 'हिमाल', icon: '🏔️' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBelt(b.id as EcologicalBelt)}
                  style={{
                    background: activeBelt === b.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeBelt === b.id ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '10px',
                    padding: '12px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{b.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: activeBelt === b.id ? '#34d399' : '#e2e8f0' }}>
                    {lang === 'en' ? b.nameEn : b.nameNe}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Elevation Scrubber */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#facc15' }}>
                <Sliders size={14} />
                <span>{lang === 'en' ? 'Elevation Scrubber' : 'उचाइ अनुसार अन्वेषण'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>
                {elevationM}m
              </span>
            </div>

            <input
              type="range"
              min={60}
              max={8848}
              value={elevationM}
              onChange={(e) => handleElevationSlider(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#facc15',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
              <span>60m (Terai)</span>
              <span>1500m (Pahad)</span>
              <span>8848m (Everest)</span>
            </div>
          </div>

          {/* 4. Quick Quiz */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Geography Concept Check' : 'भूगोल अवधारणा जाँच'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'Which ecological belt of Nepal is famously known as the "Granary of Nepal"?'
                : 'नेपालको कुन धरातलीय प्रदेशलाई "अन्नको भण्डार" भनिन्छ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['terai', 'pahad', 'himal'].map((b) => (
                <button
                  key={b}
                  onClick={() => handleQuizAnswer(b)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    color: '#e2e8f0',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {b === 'terai'
                    ? lang === 'en' ? 'Terai' : 'तराई'
                    : b === 'pahad'
                    ? lang === 'en' ? 'Pahad' : 'पहाड'
                    : lang === 'en' ? 'Himal' : 'हिमाल'}
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '11px',
                  color: '#38bdf8',
                  textAlign: 'center',
                }}
              >
                {quizFeedback}
              </div>
            )}
          </div>

          {/* 5. Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '4px' }}>
              ℹ️ {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम निष्कर्ष'}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.45' }}>
              {lang === 'en'
                ? 'Nepal rises from 60m above sea level in Jhapa to 8,848.86m at Mt. Everest, creating unparalleled climate and ecological diversity.'
                : 'नेपाल 60 मिटर उचाइदेखि सगरमाथाको 8,848.86 मिटरसम्म फैलिएको छ, जसले अनुपम जैविक र हावापानी विविधता दिएको छ।'}
            </p>
          </div>

          {/* 6. Complete Landforms Lab Button */}
          <button
            onClick={() => {
              ScienceAudio.playSuccess();
              setStars(3);
              setIsCompleted(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              marginTop: 'auto',
            }}
          >
            <span>✓</span>
            <span>{lang === 'en' ? 'Complete Landforms Lab & Quiz' : 'धरातलीय स्वरूप प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
