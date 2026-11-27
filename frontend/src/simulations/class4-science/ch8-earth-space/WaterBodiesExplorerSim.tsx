/**
 * WaterBodiesExplorerSim.tsx
 * Simulation 30: 2D Water Bodies Hydrological Explorer (नेपालका पानीका स्वरूपहरू)
 * Grade 4 Science • Chapter 8: The Earth and Space (पृथ्वी र अन्तरिक्ष)
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - 4 Authentic Natural Freshwater Bodies of Nepal:
 *   1. Waterfall (झरना - Hyatung / Davis Fall): Vertical cascade with billowy mist spray & rainbow
 *   2. Alpine Lake (ताल / दह - Rara, Fewa): Deep tranquil turquoise waters with Annapurna reflection & boat
 *   3. Major River (नदी - Koshi, Gandaki, Karnali): Broad flowing perennial river with current lines
 *   4. Mountain Stream (खोला / खोल्सी): Shallow rapid rocky brook with pebbles and mossy banks
 * - Interactive water ripples, current velocity slider, water characteristics inspector
 * - Bilingual EN/NE, realistic water sounds, and curriculum quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Droplets, Sparkles, Sliders, Check, RotateCcw, Info } from 'lucide-react';

type WaterBodyType = 'waterfall' | 'lake' | 'river' | 'stream';

interface WaterBodyInfo {
  id: WaterBodyType;
  nameEn: string;
  nameNe: string;
  typeEn: string;
  typeNe: string;
  flowEn: string;
  flowNe: string;
  examplesEn: string;
  examplesNe: string;
  descEn: string;
  descNe: string;
}

export const WaterBodiesExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeBody, setActiveBody] = useState<WaterBodyType>('waterfall');
  const [flowSpeed, setFlowSpeed] = useState<number>(1);
  const [exploredBodies, setExploredBodies] = useState<Record<string, boolean>>({ waterfall: true });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const bodies: WaterBodyInfo[] = [
    {
      id: 'waterfall',
      nameEn: 'Waterfall (झरना)',
      nameNe: 'झरना (Waterfall)',
      typeEn: 'Vertical Falling Water',
      typeNe: 'भीरबाट सिधै तल खस्ने पानी',
      flowEn: 'Extremely Fast & Energetic',
      flowNe: 'अत्यन्त तीव्र वेग',
      examplesEn: 'Hyatung Falls (Terhathum), Davis Fall (Pokhara)',
      examplesNe: 'ह्यातुङ झरना (तेह्रथुम), पाताले छाँगो (पोखरा)',
      descEn: 'Forms when a river or stream plunges vertically over a steep rock cliff. Produces dense water vapor mist and rainbows at the splash pool.',
      descNe: 'नदी वा खोला भिरालो चट्टानबाट ठाडो भई तल खस्दा बन्ने मनमोहक स्वरूप। यसको फेदमा बाक्लो कुहिरो र इन्द्रेणी देखिन्छ।',
    },
    {
      id: 'lake',
      nameEn: 'Lake (ताल तथा दह)',
      nameNe: 'ताल तथा दह (Lake)',
      typeEn: 'Enclosed Still Freshwater',
      typeNe: 'चारैतिर जमिनले घेरिएको स्थिर पानी',
      flowEn: 'Calm and Still (Standing Water)',
      flowNe: 'शान्त र स्थिर',
      examplesEn: 'Rara Lake (Mugu), Fewa Lake (Kaski), Tilicho',
      examplesNe: 'रारा ताल (मुगु), फेवा ताल (कास्की), तिलिचो',
      descEn: 'A vast expanse of fresh standing water surrounded entirely by land. Rara is Nepal\'s deepest and largest natural lake.',
      descNe: 'चारैतिर जमिनले घेरिएर रहेको ठूलो प्राकृतिक जल भण्डार। रारा ताल नेपालको सबैभन्दा ठूलो र गहिरो ताल हो।',
    },
    {
      id: 'river',
      nameEn: 'River (नदी)',
      nameNe: 'नदी (River)',
      typeEn: 'Large Flowing Freshwater',
      typeNe: 'ठूलो प्राकृतिक जलप्रवाह',
      flowEn: 'Continuous & Deep Current',
      flowNe: 'निरन्तर र गहिरो बहाव',
      examplesEn: 'Saptakoshi, Gandaki (Narayani), Karnali',
      examplesNe: 'सप्तकोशी, गण्डकी (नारायणी), कर्णाली',
      descEn: 'Originates from glacial meltwater and springs, flowing hundreds of kilometers towards the ocean while irrigating fertile valleys.',
      descNe: 'हिमनदी र मूलहरूबाट सुरु भई सयौं किलोमिटर बग्ने विशाल जलप्रवाह। यसले खेतीपाती र जलविद्युतमा योगदान दिन्छ।',
    },
    {
      id: 'stream',
      nameEn: 'Mountain Stream (खोला / खोल्सा)',
      nameNe: 'खोला तथा खोल्सी (Stream)',
      typeEn: 'Shallow Rocky Channel',
      typeNe: 'सानो, ढुङ्गेयान जलप्रवाह',
      flowEn: 'Rapid and Bubbly',
      flowNe: 'छिटो र छङछङ बग्ने',
      examplesEn: 'Local mountain brooks, Kholsis in hills',
      examplesNe: 'गाउँघरका साना खोला, हिमाली खोल्साहरू',
      descEn: 'A narrow, shallow flow of cold water winding through mountain rocks and pebbles. Feeds larger rivers downhill.',
      descNe: 'पहाडका भीरपाखा र ढुङ्गाका बीचबाट छङछङ गर्दै बग्ने सानो पानीको धार, जो पछि ठूलो नदीमा मिसिन्छ।',
    },
  ];

  const currentInfo = bodies.find((b) => b.id === activeBody) || bodies[0];
  const activeWaterBody = currentInfo;

  const handleSelectBody = (id: WaterBodyType) => {
    setActiveBody(id);
    ScienceAudio.playWaterDrop();
    const updated = { ...exploredBodies, [id]: true };
    setExploredBodies(updated);
    const count = Object.keys(updated).length;
    setStars(Math.min(3, count));
    if (count >= 4) {
      setIsCompleted(true);
      setStage('understand');
    }
  };

  const handleReset = () => {
    setActiveBody('waterfall');
    setFlowSpeed(1);
    setExploredBodies({ waterfall: true });
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
      time += 0.03 * flowSpeed;
      ctx.clearRect(0, 0, 880, 560);

      // Render selected water body environment
      switch (activeBody) {
        case 'waterfall':
          renderWaterfallScene(ctx, time);
          break;
        case 'lake':
          renderLakeScene(ctx, time);
          break;
        case 'river':
          renderRiverScene(ctx, time);
          break;
        case 'stream':
          renderStreamScene(ctx, time);
          break;
      }

      // HUD Label overlay
      drawWaterBodyHUD(ctx, currentInfo, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeBody, flowSpeed, currentInfo, lang]);

  // SCENE 1: WATERFALL (झरना)
  function renderWaterfallScene(ctx: CanvasRenderingContext2D, t: number) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 300);
    sky.addColorStop(0, '#0369a1');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 880, 560);

    // Steep Rocky Cliff on Left & Right
    ctx.fillStyle = '#334155';
    // Left Cliff
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(360, 0);
    ctx.lineTo(370, 160);
    ctx.lineTo(340, 380);
    ctx.lineTo(260, 560);
    ctx.lineTo(0, 560);
    ctx.closePath();
    ctx.fill();

    // Right Cliff
    ctx.beginPath();
    ctx.moveTo(880, 0);
    ctx.lineTo(520, 0);
    ctx.lineTo(510, 160);
    ctx.lineTo(540, 380);
    ctx.lineTo(620, 560);
    ctx.lineTo(880, 560);
    ctx.closePath();
    ctx.fill();

    // Cascading Waterfall Torrent (x: 360 to 520, y: 0 to 450)
    const fallGrad = ctx.createLinearGradient(0, 0, 0, 450);
    fallGrad.addColorStop(0, '#38bdf8');
    fallGrad.addColorStop(0.3, '#f8fafc');
    fallGrad.addColorStop(0.7, '#e0f2fe');
    fallGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = fallGrad;

    ctx.beginPath();
    ctx.moveTo(370, 40);
    ctx.lineTo(510, 40);
    ctx.lineTo(560, 450);
    ctx.lineTo(320, 450);
    ctx.closePath();
    ctx.fill();

    // Falling water flow streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    for (let s = 0; s < 14; s++) {
      const sx = 350 + s * 14;
      const sy = ((t * 80 + s * 30) % 400) + 40;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.sin(s) * 4), sy + 35);
      ctx.stroke();
    }

    // Splash Pool at Bottom (Daha)
    const poolGrad = ctx.createLinearGradient(0, 440, 0, 560);
    poolGrad.addColorStop(0, '#0284c7');
    poolGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = poolGrad;
    ctx.fillRect(0, 440, 880, 120);

    // Billowy White Mist Cloud at Base
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    for (let m = 0; m < 9; m++) {
      const mx = 340 + m * 24 + Math.sin(t * 3 + m) * 12;
      const my = 430 - Math.abs(Math.sin(t * 2 + m)) * 25;
      ctx.beginPath();
      ctx.arc(mx, my, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Faint Rainbow in the mist
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(440, 460, 90, Math.PI * 1.1, Math.PI * 1.7);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(440, 460, 84, Math.PI * 1.1, Math.PI * 1.7);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(440, 460, 78, Math.PI * 1.1, Math.PI * 1.7);
    ctx.stroke();
  }

  // SCENE 2: ALPINE LAKE (ताल तथा दह - Fewa / Rara)
  function renderLakeScene(ctx: CanvasRenderingContext2D, t: number) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 880, 560);

    // Annapurna / Machhapuchhre Snowy Peak reflection in background
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(240, 230);
    ctx.lineTo(440, 50); // Fish Tail summit
    ctx.lineTo(640, 230);
    ctx.closePath();
    ctx.fill();

    // Snow cover
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(440, 50);
    ctx.lineTo(490, 120);
    ctx.lineTo(465, 115);
    ctx.lineTo(440, 140);
    ctx.lineTo(415, 115);
    ctx.lineTo(390, 120);
    ctx.closePath();
    ctx.fill();

    // Pine Covered Lake Ridge Shore
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(0, 230);
    ctx.bezierCurveTo(280, 210, 600, 220, 880, 210);
    ctx.lineTo(880, 270);
    ctx.lineTo(0, 270);
    ctx.closePath();
    ctx.fill();

    // Tranquil Deep Turquoise Lake Surface (x: 0 to 880, y: 250 to 560)
    const lakeGrad = ctx.createLinearGradient(0, 250, 0, 560);
    lakeGrad.addColorStop(0, '#0284c7');
    lakeGrad.addColorStop(0.3, '#0ea5e9');
    lakeGrad.addColorStop(0.7, '#0284c7');
    lakeGrad.addColorStop(1, '#075985');
    ctx.fillStyle = lakeGrad;
    ctx.fillRect(0, 250, 880, 310);

    // Inverted Mountain Reflection in lake water
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(440, 280);
    ctx.lineTo(470, 340);
    ctx.lineTo(410, 340);
    ctx.closePath();
    ctx.fill();

    // Gentle rippling lake water waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    for (let wy = 280; wy < 540; wy += 30) {
      ctx.beginPath();
      for (let wx = 40; wx < 840; wx += 45) {
        ctx.moveTo(wx, wy + Math.sin(t * 2 + wx * 0.04) * 2);
        ctx.lineTo(wx + 22, wy + Math.sin(t * 2 + wx * 0.04) * 2);
      }
      ctx.stroke();
    }

    // Traditional Wooden Canoe / Paddleboat (डुङ्गा)
    const boatX = 350 + Math.sin(t * 0.8) * 25;
    const boatY = 380 + Math.sin(t * 2) * 3;
    drawPaddleBoat(ctx, boatX, boatY);
  }

  function drawPaddleBoat(ctx: CanvasRenderingContext2D, bx: number, by: number) {
    ctx.save();
    // Wooden boat hull (Red & White classic Pokhara Fewa boat)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(bx - 35, by);
    ctx.lineTo(bx + 35, by);
    ctx.lineTo(bx + 25, by + 12);
    ctx.lineTo(bx - 25, by + 12);
    ctx.closePath();
    ctx.fill();

    // White trim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wooden Oar (हलो / खियाउने काठ)
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx, by - 6);
    ctx.lineTo(bx + 18, by + 22);
    ctx.stroke();

    ctx.restore();
  }

  // SCENE 3: MAJOR FLOWING RIVER (नदी)
  function renderRiverScene(ctx: CanvasRenderingContext2D, t: number) {
    // Green Riverbank Sky
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(0, 0, 880, 560);

    // Far green hills
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.bezierCurveTo(300, 160, 580, 210, 880, 170);
    ctx.lineTo(880, 310);
    ctx.lineTo(0, 310);
    ctx.closePath();
    ctx.fill();

    // Broad Deep River Channel
    const riverGrad = ctx.createLinearGradient(0, 220, 0, 560);
    riverGrad.addColorStop(0, '#38bdf8');
    riverGrad.addColorStop(0.4, '#0ea5e9');
    riverGrad.addColorStop(0.8, '#0284c7');
    riverGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = riverGrad;

    ctx.beginPath();
    ctx.moveTo(360, 220);
    ctx.bezierCurveTo(460, 280, 260, 380, 80, 560);
    ctx.lineTo(880, 560);
    ctx.lineTo(880, 340);
    ctx.bezierCurveTo(640, 290, 520, 230, 440, 220);
    ctx.closePath();
    ctx.fill();

    // Flowing Current Lines (Fast water vectors)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 3;
    for (let r = 0; r < 12; r++) {
      const ry = 280 + r * 22;
      const rx = 340 + Math.sin(t * 3 + r) * 35;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 75, ry + 10);
      ctx.stroke();
    }

    // Riverbank gravel & pebbles
    ctx.fillStyle = '#78716c';
    [
      { x: 120, y: 520, r: 14 },
      { x: 170, y: 490, r: 10 },
      { x: 220, y: 450, r: 12 },
    ].forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // SCENE 4: MOUNTAIN STREAM (खोला / खोल्सी)
  function renderStreamScene(ctx: CanvasRenderingContext2D, t: number) {
    // Forest background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 880, 560);

    // Shaded forest canopy
    const forGrad = ctx.createLinearGradient(0, 0, 0, 320);
    forGrad.addColorStop(0, '#064e3b');
    forGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = forGrad;
    ctx.fillRect(0, 0, 880, 320);

    // Forest floor with mossy boulders
    ctx.fillStyle = '#334155';
    [
      { x: 220, y: 320, r: 40 },
      { x: 310, y: 370, r: 48 },
      { x: 620, y: 340, r: 52 },
      { x: 530, y: 420, r: 44 },
    ].forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      // Moss top
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(b.x, b.y - b.r * 0.4, b.r * 0.7, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#334155';
    });

    // Shallow Rocky Brook flowing diagonally
    const streamGrad = ctx.createLinearGradient(440, 200, 380, 560);
    streamGrad.addColorStop(0, '#7dd3fc');
    streamGrad.addColorStop(0.5, '#38bdf8');
    streamGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = streamGrad;

    ctx.beginPath();
    ctx.moveTo(420, 200);
    ctx.lineTo(470, 200);
    ctx.bezierCurveTo(510, 320, 480, 420, 560, 560);
    ctx.lineTo(280, 560);
    ctx.bezierCurveTo(380, 420, 370, 320, 420, 200);
    ctx.closePath();
    ctx.fill();

    // Bubbly white water splashing over rocks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let w = 0; w < 16; w++) {
      const wx = 350 + (w * 12) + Math.sin(t * 6 + w) * 8;
      const wy = 260 + (w * 18);
      ctx.beginPath();
      ctx.arc(wx, wy, 2.5 + (w % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // HUD Card
  function drawWaterBodyHUD(ctx: CanvasRenderingContext2D, info: WaterBodyInfo, currentLang: Language) {
    ctx.save();
    const px = 20;
    const py = 20;
    const pw = 380;
    const ph = 95;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(currentLang === 'en' ? info.nameEn : info.nameNe, px + 14, py + 24);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(currentLang === 'en' ? `Flow: ${info.flowEn} • Type: ${info.typeEn}` : `बहाव: ${info.flowNe} • प्रकार: ${info.typeNe}`, px + 14, py + 44);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui';
    const eg = currentLang === 'en' ? `Examples: ${info.examplesEn}` : `उदा: ${info.examplesNe}`;
    ctx.fillText(eg, px + 14, py + 64);
    const desc = currentLang === 'en' ? info.descEn : info.descNe;
    ctx.fillText(desc.slice(0, 52) + '...', px + 14, py + 80);

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'rara') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Rara Lake in Mugu district is the biggest and deepest lake in Nepal.' : 'सबास! मुगु जिल्लामा रहेको रारा ताल नेपालको सबैभन्दा ठूलो र गहिरो ताल हो।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. Rara Lake is the largest freshwater lake of Nepal.' : 'मिलेन। नेपालको सबैभन्दा ठूलो ताल रारा ताल हो।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Water Bodies Hydrological Explorer' : 'नेपालका जल भण्डारहरू (Water Bodies)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 8: The Earth and Space'
          : 'कक्षा ४ विज्ञान • एकाइ ८: पृथ्वी र अन्तरिक्ष'
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
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Droplets size={14} className="text-sky-400" />
              <span>
                {lang === 'en' ? activeWaterBody.nameEn : activeWaterBody.nameNe}
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
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {activeBody === 'waterfall' ? '🌊' : activeBody === 'lake' ? '🏞️' : activeBody === 'river' ? '〰️' : '💧'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? activeWaterBody.nameEn : activeWaterBody.nameNe}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en' ? activeWaterBody.descEn : activeWaterBody.descNe}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Velocity' : 'बहाव गति'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  {flowSpeed.toFixed(1)}x
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
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🏞️</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Water Bodies Discovery Station' : 'जल भण्डार अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Water bodies include standing reservoirs like high-altitude lakes and ponds, and moving freshwater systems like rivers, streams, and waterfalls.'
                : 'जल भण्डारमा ताल र पोखरी जस्ता स्थिर पानीका स्रोतहरू तथा खोला, नदी र झरना जस्ता निरन्तर बग्ने पानीका स्रोतहरू पर्दछन्।'}
            </p>
          </div>

          {/* 2. Water Body Selector Tabs */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Select Water Body' : 'जल भण्डार छान्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {bodies.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBody(b.id)}
                  style={{
                    background: activeBody === b.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeBody === b.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '10px',
                    padding: '10px 8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', color: activeBody === b.id ? '#38bdf8' : '#e2e8f0' }}>
                    {lang === 'en' ? b.nameEn.split('(')[0] : b.nameNe.split('(')[0]}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {b.id === 'waterfall' ? '🌊 Cascade' : b.id === 'lake' ? '🏞️ Still Lake' : b.id === 'river' ? '〰️ River' : '💧 Stream'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Flow Velocity Controller */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>
                <Sliders size={14} />
                <span>{lang === 'en' ? 'Water Velocity Speed' : 'पानीको बहाव गति'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>
                {flowSpeed.toFixed(1)}x
              </span>
            </div>

            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={flowSpeed}
              onChange={(e) => setFlowSpeed(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#38bdf8',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
              <span>0.5x ({lang === 'en' ? 'Gentle' : 'शान्त'})</span>
              <span>2.5x ({lang === 'en' ? 'Rapid' : 'तीव्र'})</span>
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
              {lang === 'en' ? 'Water Bodies Quiz' : 'जल भण्डार प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'Which is the largest and deepest natural freshwater lake in Nepal?'
                : 'नेपालको सबैभन्दा ठूलो र गहिरो प्राकृतिक ताल कुन हो?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('fewa')}
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
                {lang === 'en' ? 'Fewa Lake' : 'फेवा ताल'}
              </button>

              <button
                onClick={() => handleQuizAnswer('rara')}
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
                {lang === 'en' ? 'Rara Lake' : 'रारा ताल'}
              </button>
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
                ? 'Freshwater bodies sustain all terrestrial ecosystems, provide drinking water, irrigation, and hydropower in Nepal.'
                : 'स्वच्छ पानीका मुहानहरूले समस्त स्थल पर्यावरणलाई जीवित राख्छन्, पिउने पानी, सिँचाइ र जलविद्युत प्रदान गर्दछन्।'}
            </p>
          </div>

          {/* 6. Complete Water Bodies Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Water Bodies Lab & Quiz' : 'जल भण्डार प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
