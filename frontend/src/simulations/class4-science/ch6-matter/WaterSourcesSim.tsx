/**
 * WaterSourcesSim.tsx
 * Simulation 24: 2D Water Sources Nepalese Hydrological Diorama (नेपालका पानीका मुहानहरू)
 * Grade 4 Science • Chapter 6: Matter (पदार्थ)
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - 4 Authentic Nepalese Water Sources:
 *   1. Himalayan Glacier (हिमनदी): Snow summits, blue glacial ice, pristine meltwater torrents
 *   2. Natural Stone Spout / Dhungedhara (ढुङ्गेधारा / हिटी): Carved stone spout, natural spring water
 *   3. Flowing River (नदी तथा खोला): Perennial mountain river with ripples, pebbles, aquatic life
 *   4. Dug Well / Aquifer (इनार र भूमिगत जल): Stone circular well with pulley, rope, bucket dipping into water table
 * - Interactive "Draw Water" simulation: Lower bucket or fill traditional brass water jar (ग्याग्री)
 * - Purity & usage analysis cards, Bilingual EN/NE, and curriculum quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Droplets, Sparkles, Mountain, RotateCcw, Check, Info } from 'lucide-react';

type WaterSourceId = 'glacier' | 'spring' | 'river' | 'well';

interface WaterSourceInfo {
  id: WaterSourceId;
  nameEn: string;
  nameNe: string;
  purityEn: string;
  purityNe: string;
  descEn: string;
  descNe: string;
  featuresEn: string[];
  featuresNe: string[];
}

export const WaterSourcesSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeSourceId, setActiveSourceId] = useState<WaterSourceId>('glacier');
  const [isDrawingWater, setIsDrawingWater] = useState<boolean>(false);
  const [bucketProgress, setBucketProgress] = useState<number>(0); // 0 (top) to 1 (dipped in well)
  const [exploredSources, setExploredSources] = useState<Record<string, boolean>>({ glacier: true });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const sources: WaterSourceInfo[] = [
    {
      id: 'glacier',
      nameEn: 'Himalayan Glacier (हिमनदी)',
      nameNe: 'हिमनदी तथा हिमाल (Glacier)',
      purityEn: 'Pure Mineral Meltwater (High Purity)',
      purityNe: 'प्राकृतिक र शुद्ध खनिजयुक्त (अति शुद्ध)',
      descEn: 'Formed from accumulated snow in high Himalayas. Melts in summer to feed perennial rivers like Koshi, Gandaki, and Karnali.',
      descNe: 'उच्च हिमाली भेगमा हिउँ जमेर हिमनदी बन्दछ। यो पग्लिएर कोशी, गण्डकी र कर्णाली जस्ता ठूला नदीहरू बग्दछन्।',
      featuresEn: ['Source of major perennial rivers', 'Clean cold water rich in minerals', 'Vital for seasonal irrigation & ecology'],
      featuresNe: ['सधैं बग्ने ठूला नदीहरूको मूल', 'खनिजयुक्त र अत्यन्त चिसो शुद्ध पानी', 'जलविद्युत र सिँचाइको मुख्य आधार'],
    },
    {
      id: 'spring',
      nameEn: 'Stone Spout / Dhungedhara (ढुङ्गेधारा)',
      nameNe: 'ढुङ्गेधारा तथा मूल (Natural Spring)',
      purityEn: 'Naturally Filtered Spring Water',
      purityNe: 'प्राकृतिक रूपमा छानिएको शुद्ध पानी',
      descEn: 'Rainwater filters through subterranean sand and gravel strata, emerging continuously through ancient carved stone spouts (Hiti).',
      descNe: 'जमिनमुनिको बालुवा र ढुङ्गाबाट प्राकृतिक रूपमा छानिएर निस्कने मूलको पानी। नेपालको परम्परागत पानीको मुहान।',
      featuresEn: ['Filtered through natural underground sand', 'Clean and cool drinking water', 'Cultural heritage of Kathmandu valley'],
      featuresNe: ['जमिनमुनि प्राकृतिक रूपमा छानिने', 'पिउनका लागि शीतल र सफा पानी', 'नेपालको प्राचीन र सांस्कृतिक सम्पदा'],
    },
    {
      id: 'river',
      nameEn: 'Flowing River (नदी तथा खोला)',
      nameNe: 'नदी तथा खोला (Flowing River)',
      purityEn: 'Freshwater (Requires Boiling for Drinking)',
      purityNe: 'ताजा पानी (पिउनुअघि उमाल्नुपर्ने)',
      descEn: 'Flows through mountains, hills, and plains. Provides essential water for agriculture, fisheries, ecosystems, and human civilization.',
      descNe: 'पहाड र तराई हुँदै बग्ने जलप्रवाह। कृषि, सिँचाइ, माछापालन र मानव जीवनको अति आवश्यक जलस्रोत।',
      featuresEn: ['Continuous freshwater flow', 'Used for irrigation and drinking', 'Habitat for fish and aquatic plants'],
      featuresNe: ['निरन्तर बग्ने ताजा जलप्रवाह', 'सिँचाइ र दैनिक कामकाजमा प्रयोग', 'माछा र जलचरको प्राकृतिक बासस्थान'],
    },
    {
      id: 'well',
      nameEn: 'Dug Well & Aquifer (इनार र जमिनमुनिको पानी)',
      nameNe: 'इनार र भूमिगत पानी (Dug Well)',
      purityEn: 'Groundwater (Filtered but check for minerals)',
      purityNe: 'भूमिगत जल (पिउनका लागि परीक्षण आवश्यक)',
      descEn: 'Dug deep into the ground until reaching the water table. Water is lifted manually using a pulley and bucket for household use.',
      descNe: 'जमिन खनेर भूमिगत जलसतहसम्म पुगी बनाइएको इनार। घिर्नी र बाल्टीको मद्दतले पानी तानेर प्रयोग गरिन्छ।',
      featuresEn: ['Accesses subterranean water table', 'Pulley and rope drawing mechanism', 'Essential water source for rural homes'],
      featuresNe: ['जमिनमुनिको जलसतहबाट पानी निकाल्ने', 'घिर्नी, डोरी र बाल्टीको प्रयोग', 'गाउँघर र सहरमा घरायसी प्रयोग'],
    },
  ];

  const activeSource = sources.find((s) => s.id === activeSourceId) || sources[0];

  const handleSelectSource = (id: WaterSourceId) => {
    setActiveSourceId(id);
    ScienceAudio.playPop();
    const updated = { ...exploredSources, [id]: true };
    setExploredSources(updated);
    const count = Object.keys(updated).length;
    setStars(Math.min(3, count));
    if (count >= 4) {
      setIsCompleted(true);
      setStage('understand');
    }
  };

  const handleDrawWater = () => {
    if (isDrawingWater) return;
    setIsDrawingWater(true);
    ScienceAudio.playWaterDrop();

    // Animate bucket lowering down and rising up
    let p = 0;
    let goingDown = true;
    const interval = setInterval(() => {
      if (goingDown) {
        p += 0.05;
        if (p >= 1) {
          goingDown = false;
          ScienceAudio.playWaterDrop();
        }
      } else {
        p -= 0.05;
        if (p <= 0) {
          p = 0;
          clearInterval(interval);
          setIsDrawingWater(false);
          ScienceAudio.playSuccess();
        }
      }
      setBucketProgress(p);
    }, 50);
  };

  const handleReset = () => {
    setActiveSourceId('glacier');
    setBucketProgress(0);
    setIsDrawingWater(false);
    setExploredSources({ glacier: true });
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

      // Render the selected Nepalese water source environment
      switch (activeSourceId) {
        case 'glacier':
          renderGlacierScene(ctx, time);
          break;
        case 'spring':
          renderStoneSpoutScene(ctx, time, isDrawingWater);
          break;
        case 'river':
          renderRiverScene(ctx, time);
          break;
        case 'well':
          renderWellScene(ctx, time, bucketProgress);
          break;
      }

      // HUD Badge overlay
      drawSourceHUD(ctx, activeSource, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeSourceId, activeSource, isDrawingWater, bucketProgress, lang]);

  // SCENE 1: GLACIER (हिमनदी)
  function renderGlacierScene(ctx: CanvasRenderingContext2D, t: number) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 320);
    sky.addColorStop(0, '#0369a1');
    sky.addColorStop(0.6, '#38bdf8');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 880, 560);

    // Sun with bright glare
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(740, 70, 26, 0, Math.PI * 2);
    ctx.fill();

    // Huge snow mountain peaks
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(100, 360);
    ctx.lineTo(340, 60);
    ctx.lineTo(580, 360);
    ctx.closePath();
    ctx.fill();

    // Snow cover
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(340, 60);
    ctx.lineTo(430, 160);
    ctx.lineTo(400, 150);
    ctx.lineTo(370, 180);
    ctx.lineTo(330, 150);
    ctx.lineTo(260, 170);
    ctx.closePath();
    ctx.fill();

    // Blue Glacial Tongue
    const glacGrad = ctx.createLinearGradient(340, 140, 380, 420);
    glacGrad.addColorStop(0, '#e0f2fe');
    glacGrad.addColorStop(0.5, '#7dd3fc');
    glacGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = glacGrad;
    ctx.beginPath();
    ctx.moveTo(330, 150);
    ctx.lineTo(370, 180);
    ctx.bezierCurveTo(390, 260, 420, 340, 440, 410);
    ctx.lineTo(300, 410);
    ctx.bezierCurveTo(310, 340, 315, 250, 330, 150);
    ctx.closePath();
    ctx.fill();

    // Crevasse crack lines in glacier ice
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(330, 220);
    ctx.lineTo(365, 235);
    ctx.moveTo(320, 290);
    ctx.lineTo(390, 305);
    ctx.moveTo(340, 350);
    ctx.lineTo(410, 365);
    ctx.stroke();

    // Moraine rocks and boulders
    ctx.fillStyle = '#334155';
    [
      { x: 260, y: 410, r: 24 },
      { x: 310, y: 430, r: 18 },
      { x: 440, y: 415, r: 22 },
      { x: 480, y: 435, r: 30 },
    ].forEach((rk) => {
      ctx.beginPath();
      ctx.arc(rk.x, rk.y, rk.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Meltwater Torrent rushing out
    const streamGrad = ctx.createLinearGradient(350, 400, 380, 560);
    streamGrad.addColorStop(0, '#38bdf8');
    streamGrad.addColorStop(0.5, '#0ea5e9');
    streamGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = streamGrad;
    ctx.beginPath();
    ctx.moveTo(320, 410);
    ctx.lineTo(420, 410);
    ctx.lineTo(540, 560);
    ctx.lineTo(240, 560);
    ctx.closePath();
    ctx.fill();

    // Whitewater foam rapids
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    for (let wy = 430; wy <= 540; wy += 22) {
      const offset = Math.sin(t * 8 + wy) * 15;
      ctx.beginPath();
      ctx.moveTo(310 + offset, wy);
      ctx.lineTo(450 + offset, wy);
      ctx.stroke();
    }
  }

  // SCENE 2: STONE SPOUT / DHUNGEDHARA (ढुङ्गेधारा)
  function renderStoneSpoutScene(ctx: CanvasRenderingContext2D, t: number, drawing: boolean) {
    // Stone Courtyard background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 880, 560);

    // Carved brick / stone masonry wall
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let y = 0; y < 440; y += 30) {
      const shift = (y % 60 === 0) ? 0 : 25;
      for (let x = -25; x < 900; x += 50) {
        ctx.strokeRect(x + shift, y, 50, 30);
      }
    }

    // Traditional Stone Pavilion Niche
    const nx = 440;
    const ny = 220;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(nx, ny, 90, Math.PI, 0);
    ctx.lineTo(nx + 90, ny + 120);
    ctx.lineTo(nx - 90, ny + 120);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Carved Makara / Crocodile Stone Spout Head
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(nx - 25, ny + 50, 50, 35, 8);
    ctx.fill();
    ctx.fillStyle = '#334155';
    // Snout
    ctx.fillRect(nx - 14, ny + 85, 28, 15);

    // Continuous arching crystal-clear water stream
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(nx, ny + 95);
    ctx.quadraticCurveTo(nx, ny + 150, nx, 460);
    ctx.stroke();

    // White stream center highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(nx, ny + 95);
    ctx.quadraticCurveTo(nx, ny + 150, nx, 460);
    ctx.stroke();

    // Stone Basin (Daha) at bottom
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(nx, 480, 180, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Clear Water in basin
    ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
    ctx.beginPath();
    ctx.ellipse(nx, 480, 170, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Splashing water particles where stream hits basin
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let s = 0; s < 10; s++) {
      const sx = nx + Math.sin(t * 8 + s) * 22;
      const sy = 465 - Math.abs(Math.sin(t * 10 + s)) * 25;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Traditional Brass Water Vessel (ग्याग्री / Amrit Kalash) placed under spout
    drawBrassVessel(ctx, nx + 60, 440, drawing);
  }

  function drawBrassVessel(ctx: CanvasRenderingContext2D, x: number, y: number, isFilled: boolean) {
    ctx.save();
    // Brass golden gradient
    const brassGrad = ctx.createLinearGradient(x - 25, 0, x + 25, 0);
    brassGrad.addColorStop(0, '#b45309');
    brassGrad.addColorStop(0.4, '#fde047');
    brassGrad.addColorStop(0.8, '#d97706');
    brassGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = brassGrad;

    // Body
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 28, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck & Rim
    ctx.fillRect(x - 10, y - 8, 20, 14);
    ctx.beginPath();
    ctx.ellipse(x, y - 8, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ग्याग्री (Ghyampo)', x, y + 55);
    ctx.restore();
  }

  // SCENE 3: FLOWING RIVER (नदी)
  function renderRiverScene(ctx: CanvasRenderingContext2D, t: number) {
    // Green Riverbank Landscape
    const sky = ctx.createLinearGradient(0, 0, 0, 240);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 880, 560);

    // Far green hills
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.bezierCurveTo(240, 180, 540, 220, 880, 180);
    ctx.lineTo(880, 360);
    ctx.lineTo(0, 360);
    ctx.closePath();
    ctx.fill();

    // Meandering River
    const riverGrad = ctx.createLinearGradient(0, 240, 0, 560);
    riverGrad.addColorStop(0, '#38bdf8');
    riverGrad.addColorStop(0.5, '#0ea5e9');
    riverGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = riverGrad;

    ctx.beginPath();
    ctx.moveTo(340, 200);
    ctx.bezierCurveTo(460, 260, 240, 340, 100, 560);
    ctx.lineTo(880, 560);
    ctx.lineTo(880, 320);
    ctx.bezierCurveTo(620, 280, 500, 220, 420, 200);
    ctx.closePath();
    ctx.fill();

    // River current wave lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.5;
    for (let ry = 280; ry < 540; ry += 35) {
      const rx = 350 + Math.sin(t * 2 + ry) * 40;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 60, ry + 8);
      ctx.stroke();
    }

    // River bank pebbles
    ctx.fillStyle = '#78716c';
    [
      { x: 140, y: 520, r: 12 },
      { x: 180, y: 490, r: 8 },
      { x: 210, y: 460, r: 14 },
      { x: 260, y: 420, r: 10 },
    ].forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Swimming fish in the clear river
    drawSwimmingFish(ctx, 520 + Math.sin(t * 2) * 40, 420, t);
    drawSwimmingFish(ctx, 640 + Math.cos(t * 1.8) * 35, 480, t);
  }

  function drawSwimmingFish(ctx: CanvasRenderingContext2D, fx: number, fy: number, t: number) {
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(fx, fy, 16, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(fx - 14, fy);
    ctx.lineTo(fx - 24, fy - 6);
    ctx.lineTo(fx - 24, fy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // SCENE 4: DUG WELL / GROUNDWATER (इनार)
  function renderWellScene(ctx: CanvasRenderingContext2D, t: number, progress: number) {
    // Village courtyard & cross-section
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 880, 560);

    // Ground surface line
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 260, 880, 300);

    // Underground soil strata
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 380, 880, 180);

    // Subterranean Aquifer water table
    ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
    ctx.fillRect(0, 460, 880, 100);

    // Well Shaft cutaway (cylindrical brick chamber)
    const wx = 440;
    const wy = 160;
    const ww = 140;

    // Below-ground shaft
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(wx - ww * 0.5, 260, ww, 260);

    // Water level inside well
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(wx - ww * 0.5 + 4, 460, ww - 8, 60);

    // Above-ground circular stone wall of the well
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(wx - ww * 0.5 - 10, wy + 60, ww + 20, 50, 8);
    ctx.fill();
    ctx.stroke();

    // Wooden Pulley Frame (two upright posts and a crossbeam)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(wx - 55, wy + 60);
    ctx.lineTo(wx - 55, wy - 30);
    ctx.moveTo(wx + 55, wy + 60);
    ctx.lineTo(wx + 55, wy - 30);
    ctx.moveTo(wx - 65, wy - 30);
    ctx.lineTo(wx + 65, wy - 30);
    ctx.stroke();

    // Pulley Wheel (घिर्नी)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(wx, wy - 15, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rope hanging down to bucket
    const bucketY = (wy + 20) + (progress * 300);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx, bucketY);
    ctx.stroke();

    // Steel Bucket
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(wx - 14, bucketY);
    ctx.lineTo(wx + 14, bucketY);
    ctx.lineTo(wx + 10, bucketY + 24);
    ctx.lineTo(wx - 10, bucketY + 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Water inside bucket if dipped
    if (progress > 0.5) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(wx - 12, bucketY + 2, 24, 8);
    }
  }

  // HUD Card
  function drawSourceHUD(ctx: CanvasRenderingContext2D, src: WaterSourceInfo, currentLang: Language) {
    ctx.save();
    const px = 24;
    const py = 20;
    const pw = 360;
    const ph = 120;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(currentLang === 'en' ? src.nameEn : src.nameNe, px + 15, py + 26);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(currentLang === 'en' ? `Purity: ${src.purityEn}` : `शुद्धता: ${src.purityNe}`, px + 15, py + 48);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui';
    const descText = currentLang === 'en' ? src.descEn : src.descNe;
    ctx.fillText(descText.slice(0, 55) + '...', px + 15, py + 72);
    ctx.fillText(descText.slice(55, 110) + '...', px + 15, py + 90);

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'groundwater') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Wells tap into subterranean groundwater tables.' : 'सबास! इनारबाट जमिनमुनिको भूमिगत पानी निकालिन्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. Think about where well water comes from.' : 'मिलेन। इनार जमिन खनेर भूमिगत पानी निकाल्न बनाइन्छ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Water Sources of Nepal' : 'नेपालका पानीका मुहानहरू (Water Sources)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 6: Matter'
          : 'कक्षा ४ विज्ञान • एकाइ ६: पदार्थ'
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

          {/* Active Source Floating Badge */}
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
                {lang === 'en' ? activeSource.nameEn : activeSource.nameNe}
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
                {activeSourceId === 'glacier' ? '🏔️' : activeSourceId === 'spring' ? '🏛️' : activeSourceId === 'river' ? '🌊' : '🪣'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? activeSource.nameEn : activeSource.nameNe}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en' ? activeSource.descEn : activeSource.descNe}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Purity Level' : 'शुद्धता'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                  {activeSourceId === 'glacier' ? '99% Pristine' : activeSourceId === 'spring' ? '95% Natural' : activeSourceId === 'well' ? '92% Filtered' : '88% Fresh'}
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
              <span style={{ fontSize: '16px' }}>🏔️</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Nepal Water Heritage Station' : 'नेपालका पानीका मुहान अध्ययन'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Nepal is blessed with rich water sources: glacial lakes, natural stone spouts (Dhunge Dhara / Hiti), Himalayan rivers, and dug wells.'
                : 'नेपाल जलस्रोतमा धनी छ: हिमनदी, ढुङ्गेधारा (हिति), पवित्र नदीनाला र भूमिगत इनारहरू प्रमुख हुन्।'}
            </p>
          </div>

          {/* 2. Source Selector Tabs */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Select Water Source' : 'पानीको मुहान छान्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSource(s.id)}
                  style={{
                    background: activeSourceId === s.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeSourceId === s.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '10px',
                    padding: '10px 8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', color: activeSourceId === s.id ? '#38bdf8' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lang === 'en' ? s.nameEn.split('(')[0] : s.nameNe.split('(')[0]}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {s.id === 'glacier' ? '🏔️ Glacier' : s.id === 'spring' ? '🏛️ Hiti' : s.id === 'river' ? '🌊 River' : '🪣 Well'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interactive Well Pulley Action */}
          {activeSourceId === 'well' && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#facc15' }}>
                {lang === 'en' ? 'Interactive Well Pulley' : 'घिर्नीबाट इनारको पानी तान्नुहोस्'}
              </h4>
              <button
                onClick={handleDrawWater}
                disabled={isDrawingWater}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: isDrawingWater ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Droplets size={14} />
                <span>
                  {isDrawingWater
                    ? lang === 'en' ? 'Dipping & Drawing Water...' : 'पानी तानिँदैछ...'
                    : lang === 'en' ? '🪣 Lower Bucket & Draw Water' : '🪣 इनारमा बाल्टी खसाल्नुहोस्'}
                </span>
              </button>
            </div>
          )}

          {/* 4. Ecological Value Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={13} />
              <span>{lang === 'en' ? 'Key Ecological Value' : 'मुख्य विशेषता र उपयोगिता'}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {(lang === 'en' ? activeSource.featuresEn : activeSource.featuresNe).map((feat, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Concept Check Quiz */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Curriculum Check' : 'पाठ्यक्रम प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'What water source is accessed by digging deep wells with pulleys?'
                : 'इनार खनेर कुन प्रकारको जलस्रोतबाट पानी निकालिन्छ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('seawater')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 6px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Sea Water' : 'समुद्री पानी'}
              </button>

              <button
                onClick={() => handleQuizAnswer('groundwater')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 6px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Groundwater' : 'भूमिगत पानी'}
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

          {/* 6. Complete Water Sources Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Water Sources Lab & Quiz' : 'पानीका मुहान प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
