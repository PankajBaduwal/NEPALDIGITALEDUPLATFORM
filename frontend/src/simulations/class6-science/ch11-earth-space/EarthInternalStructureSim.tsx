/**
 * EarthInternalStructureSim.tsx
 * Simulation 40: 2D Earth's Internal Structure Explorer (पृथ्वीको आन्तरिक बनावट)
 * Grade 6 Science • Unit 11: Earth and Space (पृथ्वी र अन्तरिक्ष)
 *
 * Full 2D Interactive Geosphere Cutaway featuring:
 * 1. 4 Concentric Layers:
 *    - Crust (क्रस्ट / भू-सतह): Solid rock (0 - 35 km)
 *    - Mantle (मेन्टल): Semi-molten magma mantle (2,900 km, ~2000°C) with convection loops
 *    - Outer Core (बाह्य कोर): Liquid molten Iron & Nickel (2,200 km, ~4500°C) generating magnetic dynamo
 *    - Inner Core (भित्री कोर): Solid Iron-Nickel NiFe sphere (1,200 km radius, ~5500°C)
 * 2. Cutaway Quarter Shell & Exploded View expansion slider
 * 3. Deep geological metrics: Temperature, Depth, Chemical Composition
 * 4. Geomagnetic field lines toggle
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Globe, Layers, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

interface EarthLayer {
  id: string;
  nameEn: string;
  nameNe: string;
  depthKm: string;
  tempC: string;
  compositionEn: string;
  compositionNe: string;
  descEn: string;
  descNe: string;
  color: string;
  radiusFrac: number;
}

const EARTH_LAYERS: EarthLayer[] = [
  {
    id: 'crust',
    nameEn: '1. Crust (भू-सतह / क्रस्ट)',
    nameNe: '१. भू-सतह (क्रस्ट)',
    depthKm: '0 – 35 km (Continents) / 5 – 10 km (Oceans)',
    tempC: 'Ambient to 400°C',
    compositionEn: 'Silica, Aluminium, Magnesium (Sial & Sima)',
    compositionNe: 'सिलिका, आल्मुनियम, म्याग्नेसियम (Sial र Sima)',
    descEn: 'The outermost thin, rigid rocky shell where all living organisms, mountains, and oceans exist.',
    descNe: 'पृथ्वीको सबैभन्दा बाहिरी पातलो कडा चट्टानी तह, जहाँ हामी बस्छौँ।',
    color: '#38bdf8',
    radiusFrac: 1.0,
  },
  {
    id: 'mantle',
    nameEn: '2. Mantle (मेन्टल)',
    nameNe: '२. मेन्टल (Mantle)',
    depthKm: '35 km – 2,900 km',
    tempC: '1,000°C – 3,000°C',
    compositionEn: 'Silicate rocks rich in Iron & Magnesium (Peridotite)',
    compositionNe: 'फलाम र म्याग्नेसियमयुक्त अर्ध-तरल चट्टान (म्याग्मा)',
    descEn: 'Thickest layer of semi-molten magma. Thermal convection currents here drive plate tectonics and earthquakes.',
    descNe: 'पृथ्वीको सबैभन्दा बाक्लो तह। यहाँको म्याग्माको संवहन चालले भूकम्प र ज्वालामुखी गराउँछ।',
    color: '#f97316',
    radiusFrac: 0.88,
  },
  {
    id: 'outer_core',
    nameEn: '3. Outer Core (बाह्य कोर)',
    nameNe: '३. बाह्य कोर (Outer Core)',
    depthKm: '2,900 km – 5,100 km',
    tempC: '4,000°C – 5,000°C',
    compositionEn: 'Liquid Molten Iron (Fe) & Nickel (Ni)',
    compositionNe: 'पग्लिएको तरल फलाम र निकेल',
    descEn: 'Swirling liquid metal currents act as a geodynamo, generating Earth’s life-protecting geomagnetic shield.',
    descNe: 'तरल फलामको निरन्तर चालले पृथ्वीको चुम्बकीय क्षेत्र (Magnetic Field) उत्पन्न गर्छ।',
    color: '#facc15',
    radiusFrac: 0.55,
  },
  {
    id: 'inner_core',
    nameEn: '4. Inner Core (भित्री कोर)',
    nameNe: '४. भित्री कोर (Inner Core)',
    depthKm: '5,100 km – 6,371 km (Center)',
    tempC: '5,500°C (Hot as the surface of the Sun!)',
    compositionEn: 'Solid Metallic Iron & Nickel (NiFe alloy)',
    compositionNe: 'ठोस फलाम र निकेल (NiFe)',
    descEn: 'Enormous gravitational pressure keeps this solid metal ball solid despite intense solar-level temperatures.',
    descNe: 'चरम गुरुत्वाकर्षण दबाबका कारण यो अत्यधिक तातो हुँदा पनि ठोस फलाम र निकेलको बलको रूपमा रहन्छ।',
    color: '#ffffff',
    radiusFrac: 0.22,
  },
];

export const EarthInternalStructureSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Geological State
  const [activeLayerId, setActiveLayerId] = useState<string>('mantle');
  const [explodedOffset, setExplodedOffset] = useState<number>(0); // 0 to 40 px
  const [showMagneticField, setShowMagneticField] = useState<boolean>(true);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentLayer = EARTH_LAYERS.find(l => l.id === activeLayerId) || EARTH_LAYERS[1];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // 2D Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep Space background with distant stars
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Star dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let s = 0; s < 60; s++) {
        const sx = (s * 67 + Math.sin(s) * 20) % w;
        const sy = (s * 89 + Math.cos(s) * 20) % h;
        ctx.fillRect(sx, sy, (s % 2) + 1, (s % 2) + 1);
      }

      const earthCenterX = w * 0.45;
      const earthCenterY = h * 0.52;
      const earthRadius = 180;

      // Geomagnetic Field Lines (if enabled)
      if (showMagneticField) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.5;
        for (let l = 1; l <= 4; l++) {
          const rx = earthRadius * (1.2 + l * 0.35);
          const ry = earthRadius * (0.8 + l * 0.25);
          ctx.beginPath();
          ctx.ellipse(earthCenterX, earthCenterY, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Field flow arrows
          const arrowAngle = t * 0.5 + l;
          const ax = earthCenterX + Math.cos(arrowAngle) * rx;
          const ay = earthCenterY + Math.sin(arrowAngle) * ry;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw Earth Cross-section (Concentric Circles with Quarter Cutaway)
      // 1. Full Sphere base (Crust outer shell)
      ctx.save();

      // Outer Crust Globe (Deep Ocean Blue with Green Continents)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Continents on surface
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(earthCenterX - 50, earthCenterY - 40, 50, 0, Math.PI * 2);
      ctx.arc(earthCenterX + 40, earthCenterY + 60, 45, 0, Math.PI * 2);
      ctx.fill();

      // 90° Wedge Cutaway: We reveal layers in the top-right quadrant (from -PI/2 to 0)
      // Inner Core (Center)
      const rInner = earthRadius * 0.22 + (activeLayerId === 'inner_core' ? 6 : 0);
      const rOuter = earthRadius * 0.52 + (activeLayerId === 'outer_core' ? 8 : 0);
      const rMantle = earthRadius * 0.92 + (activeLayerId === 'mantle' ? 8 : 0);
      const rCrust = earthRadius;

      // Draw Cutaway Sector (Angles 0 to -Math.PI * 0.6)
      const cutAngleStart = -Math.PI * 0.55;
      const cutAngleEnd = 0.05;

      // Wedge background
      ctx.beginPath();
      ctx.moveTo(earthCenterX, earthCenterY);
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 2, cutAngleStart, cutAngleEnd);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Draw concentric layers inside wedge
      // Mantle layer
      const mantleGrad = ctx.createRadialGradient(earthCenterX, earthCenterY, rOuter, earthCenterX, earthCenterY, rMantle);
      mantleGrad.addColorStop(0, '#ea580c');
      mantleGrad.addColorStop(0.7, '#c2410c');
      mantleGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = mantleGrad;
      ctx.beginPath();
      ctx.moveTo(earthCenterX, earthCenterY);
      ctx.arc(earthCenterX, earthCenterY, rMantle + (activeLayerId === 'mantle' ? explodedOffset : 0), cutAngleStart, cutAngleEnd);
      ctx.closePath();
      ctx.fill();

      // Convection current loops in mantle
      ctx.strokeStyle = 'rgba(254, 215, 170, 0.4)';
      ctx.lineWidth = 1.5;
      const convAngle = -Math.PI * 0.25;
      const convR = (rOuter + rMantle) * 0.5;
      ctx.beginPath();
      ctx.arc(earthCenterX + Math.cos(convAngle) * convR, earthCenterY + Math.sin(convAngle) * convR, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Core layer (Liquid Molten Nickel-Iron)
      const outerGrad = ctx.createRadialGradient(earthCenterX, earthCenterY, rInner, earthCenterX, earthCenterY, rOuter);
      outerGrad.addColorStop(0, '#fef08a');
      outerGrad.addColorStop(0.5, '#facc15');
      outerGrad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(earthCenterX, earthCenterY);
      ctx.arc(earthCenterX, earthCenterY, rOuter + (activeLayerId === 'outer_core' ? explodedOffset : 0), cutAngleStart, cutAngleEnd);
      ctx.closePath();
      ctx.fill();

      // Inner Core layer (Solid white-hot NiFe metal)
      const innerGrad = ctx.createRadialGradient(earthCenterX, earthCenterY, 2, earthCenterX, earthCenterY, rInner);
      innerGrad.addColorStop(0, '#ffffff');
      innerGrad.addColorStop(0.6, '#fef08a');
      innerGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.moveTo(earthCenterX, earthCenterY);
      ctx.arc(earthCenterX, earthCenterY, rInner + (activeLayerId === 'inner_core' ? explodedOffset : 0), cutAngleStart, cutAngleEnd);
      ctx.closePath();
      ctx.fill();

      // Outlines for wedge edges
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(earthCenterX, earthCenterY);
      ctx.lineTo(earthCenterX + Math.cos(cutAngleStart) * earthRadius, earthCenterY + Math.sin(cutAngleStart) * earthRadius);
      ctx.moveTo(earthCenterX, earthCenterY);
      ctx.lineTo(earthCenterX + Math.cos(cutAngleEnd) * earthRadius, earthCenterY + Math.sin(cutAngleEnd) * earthRadius);
      ctx.stroke();

      // Outer crust shell border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Dynamic Callout Pointer lines to active layer
      let calloutR = rMantle;
      if (activeLayerId === 'crust') calloutR = earthRadius;
      if (activeLayerId === 'outer_core') calloutR = (rInner + rOuter) * 0.5;
      if (activeLayerId === 'inner_core') calloutR = rInner * 0.5;

      const pointerAngle = -Math.PI * 0.28;
      const px = earthCenterX + Math.cos(pointerAngle) * calloutR;
      const py = earthCenterY + Math.sin(pointerAngle) * calloutR;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 60, py - 30);
      ctx.lineTo(px + 140, py - 30);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(lang === 'en' ? currentLayer.nameEn : currentLayer.nameNe, px + 65, py - 36);

      // HUD Badge in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Layer Depth:' : 'गहिराइ:'} ${currentLayer.depthKm}`, 32, 42);
      ctx.fillText(`${lang === 'en' ? 'Temperature:' : 'तापक्रम:'} ${currentLayer.tempC}`, 32, 62);
      ctx.fillText(`${lang === 'en' ? 'Key Materials:' : 'मुख्य तत्व:'} ${lang === 'en' ? currentLayer.compositionEn : currentLayer.compositionNe}`, 32, 82);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Earth Radius: 6,371 km' : 'पृथ्वीको अर्धव्यास: ६,३७१ कि.मी.', 32, 102);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [activeLayerId, explodedOffset, showMagneticField, currentLayer, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  return (
    <SimulationLayout
      titleEn="Earth's Internal Structure Explorer"
      titleNe="पृथ्वीको आन्तरिक बनावट"
      learningAreaEn="Earth and Space"
      learningAreaNe="पृथ्वी र अन्तरिक्ष"
      currentStage={stage}
      onStageChange={handleStageChange}
      lang={lang}
      onLanguageToggle={() => {
        setLang(l => (l === 'en' ? 'ne' : 'en'));
        ScienceAudio.playClick();
      }}
      stars={stars}
      isCompleted={isCompleted}
      onBackToLibrary={onBackToLibrary}
    >
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 390px', gap: '16px', padding: '16px', height: '100%', overflow: 'hidden' }}>
        {/* 2D Canvas Viewport */}
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <canvas
            ref={canvasRef}
            width={720}
            height={520}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Layer Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} />
              {lang === 'en' ? 'Select Geosphere Layer' : 'पृथ्वीको तह छान्नुहोस्'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {EARTH_LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => {
                    setActiveLayerId(layer.id);
                    ScienceAudio.playClick();
                    if (!isCompleted) {
                      setIsCompleted(true);
                      setStars(3);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: activeLayerId === layer.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: activeLayerId === layer.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: activeLayerId === layer.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div>{lang === 'en' ? layer.nameEn : layer.nameNe}</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                      {layer.depthKm}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#f59e0b' }}>{layer.tempC}</span>
                </button>
              ))}
            </div>

            {/* Exploded View Slider */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sliders size={14} color="#38bdf8" />
                  {lang === 'en' ? 'Layer Offset Expansion:' : 'तह फैलावट:'}
                </span>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{explodedOffset} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={explodedOffset}
                onChange={e => {
                  setExplodedOffset(Number(e.target.value));
                  ScienceAudio.playClick();
                }}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            {/* Magnetic Field Toggle */}
            <button
              onClick={() => {
                setShowMagneticField(s => !s);
                ScienceAudio.playClick();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: showMagneticField ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: showMagneticField ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                color: showMagneticField ? '#38bdf8' : '#94a3b8',
                fontWeight: 'bold',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Globe size={14} />
              {showMagneticField
                ? (lang === 'en' ? 'Geomagnetic Shield: VISIBLE' : 'चुम्बकीय क्षेत्र: देखाइएको')
                : (lang === 'en' ? 'Geomagnetic Shield: HIDDEN' : 'चुम्बकीय क्षेत्र: लुकाइएको')}
            </button>
          </div>

          {/* Geological Description Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? currentLayer.nameEn : currentLayer.nameNe}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en' ? currentLayer.descEn : currentLayer.descNe}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Deep Earth' : '१. खोज: पृथ्वीको गहिराइ')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: The 4 Layers' : '२. अन्वेषण: ४ तहहरू')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Temperature & Pressure' : '३. अवलोकन: ताप र दबाब')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: The Geodynamo' : '४. बुझाइ: चुम्बकीय ढाल')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Geosphere Quiz' : '५. चुनौती: भू-तह प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Humans have only drilled ~12 km deep (Kola Superdeep Borehole). We know Earth’s deeper layers via seismic earthquake waves (P and S waves).'
                  : 'मानवले अहिलेसम्म केवल १२ कि.मी. सम्म मात्र खन्न सकेको छ। भूकम्पका तरङ्गहरू (P र S तरङ्ग) को अध्ययनबाट हामीले पृथ्वीको भित्री तहहरू पत्ता लगाएका हौं।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Click through each layer to compare thickness: Mantle makes up 84% of Earth’s volume, while Crust is as thin as an apple skin!'
                  : 'तहहरू छान्नुहोस्: मेन्टलले पृथ्वीको कुल आयतनको ८४% ओगट्छ, जबकि हामी बस्ने क्रस्ट स्याउको बोक्रा जत्तिकै पातलो हुन्छ!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Notice how temperature surges from 25°C on the surface to 5,500°C in the Inner Core—hotter than the surface of our Sun!'
                  : 'सतहमा २५°C रहेको तापक्रम भित्री कोरमा पुग्दा ५,५००°C सम्म पुग्छ, जुन सूर्यको सतह जत्तिकै तातो हो!')}
                {stage === 'understand' && (lang === 'en'
                  ? 'The Outer Core is liquid iron churning in massive convection currents, which generates the geomagnetic field protecting life from harmful solar radiation.'
                  : 'बाह्य कोरमा रहेको पग्लिएको तरल फलामको घुमाइले पृथ्वीभरि चुम्बकीय ढाल बनाउँछ, जसले सूर्यको हानिकारक विकिरणबाट जीवन बचाउँछ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Which layer of Earth is composed of liquid molten iron and generates the planet’s magnetic field?'
                    : 'पृथ्वीको कुन चाहिँ तह तरल फलामले बनेको हुन्छ र यसले चुम्बकीय क्षेत्र उत्पन्न गर्छ?'}
                </p>
                {[
                  { id: 1, en: 'Outer Core (बाह्य कोर)', ne: 'बाह्य कोर (Outer Core)' },
                  { id: 2, en: 'Crust (भू-सतह)', ne: 'भू-सतह (Crust)' },
                  { id: 3, en: 'Inner Core (भित्री कोर)', ne: 'भित्री कोर (Inner Core)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setQuizAnswer(opt.id);
                      if (opt.id === 1) {
                        ScienceAudio.playSuccess();
                        setStars(3);
                        setIsCompleted(true);
                      } else {
                        ScienceAudio.playWhoosh();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '6px',
                      borderRadius: '6px',
                      border: quizAnswer === opt.id
                        ? (opt.id === 1 ? '1px solid #22c55e' : '1px solid #ef4444')
                        : '1px solid rgba(255,255,255,0.1)',
                      background: quizAnswer === opt.id
                        ? (opt.id === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                        : 'rgba(15, 23, 42, 0.5)',
                      color: '#0f172a',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'en' ? opt.en : opt.ne}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};
