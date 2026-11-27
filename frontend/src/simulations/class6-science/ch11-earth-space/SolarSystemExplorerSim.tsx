/**
 * SolarSystemExplorerSim.tsx
 * Simulation 42: 2D Solar System Explorer (सौर्यमण्डल अन्वेषण)
 * Grade 6 Science • Unit 11: Earth and Space (पृथ्वी र अन्तरिक्ष)
 *
 * Full 2D Interactive Solar System featuring:
 * 1. The Sun with glowing plasma corona
 * 2. 8 Planets with proportional Keplerian orbits & Saturn's ring system:
 *    - Terrestrial: Mercury, Venus, Earth, Mars
 *    - Asteroid Belt: Rocky asteroid particles between Mars and Jupiter
 *    - Jovian & Ice Giants: Jupiter, Saturn, Uranus, Neptune
 * 3. Interactive Planet Inspector: Focus camera, diameter, distance, moons, and period
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, Sparkles, Orbit, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

interface PlanetData {
  id: string;
  nameEn: string;
  nameNe: string;
  distAu: number;
  orbitRx: number;
  orbitRy: number;
  radius: number;
  speed: number;
  color: string;
  periodEn: string;
  periodNe: string;
  moons: number;
  factEn: string;
  factNe: string;
  hasRings?: boolean;
}

const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    nameEn: 'Mercury (बुध)',
    nameNe: 'बुध ग्रह (Mercury)',
    distAu: 0.39,
    orbitRx: 45,
    orbitRy: 26,
    radius: 4,
    speed: 4.15,
    color: '#64748b',
    periodEn: '88 Earth Days',
    periodNe: '८८ दिन',
    moons: 0,
    factEn: 'Closest planet to the Sun and smallest in our solar system. Has extreme temperatures (-180°C to 430°C).',
    factNe: 'सूर्यको सबैभन्दा नजिकको र सबैभन्दा सानो ग्रह। यहाँ दिउँसो अत्यधिक गर्मी र राति कडा जाडो हुन्छ।',
  },
  {
    id: 'venus',
    nameEn: 'Venus (शुक्र)',
    nameNe: 'शुक्र ग्रह (Venus)',
    distAu: 0.72,
    orbitRx: 75,
    orbitRy: 44,
    radius: 6,
    speed: 1.62,
    color: '#facc15',
    periodEn: '225 Earth Days',
    periodNe: '२२५ दिन',
    moons: 0,
    factEn: 'Hottest planet (465°C) due to runaway CO2 greenhouse effect. Rotates in reverse (East to West)!',
    factNe: 'सौर्यमण्डलको सबैभन्दा तातो ग्रह (४६५°C)। बाक्लो कार्बन डाइअक्साइडले गर्दा ग्रीनहाउस असर हुन्छ।',
  },
  {
    id: 'earth',
    nameEn: 'Earth (पृथ्वी)',
    nameNe: 'पृथ्वी (Earth)',
    distAu: 1.0,
    orbitRx: 110,
    orbitRy: 65,
    radius: 6.5,
    speed: 1.0,
    color: '#0284c7',
    periodEn: '365.25 Days (1 Year)',
    periodNe: '३६५.२५ दिन (१ वर्ष)',
    moons: 1,
    factEn: 'Our home oasis! The only known planet with liquid oceans, oxygen atmosphere, and life.',
    factNe: 'हाम्रो घर! तरल पानी, अक्सिजनयुक्त वायुमण्डल र जीवन भएको एकमात्र ज्ञात ग्रह।',
  },
  {
    id: 'mars',
    nameEn: 'Mars (मङ्गल)',
    nameNe: 'मङ्गल ग्रह (Mars)',
    distAu: 1.52,
    orbitRx: 145,
    orbitRy: 85,
    radius: 5,
    speed: 0.53,
    color: '#ef4444',
    periodEn: '687 Earth Days',
    periodNe: '६८७ दिन',
    moons: 2,
    factEn: 'Known as the "Red Planet" due to iron oxide (rust) covering its surface. Hosts Olympus Mons volcano.',
    factNe: 'फलामको खिया (Iron Oxide) ले गर्दा रातो देखिने रातो ग्रह। यहाँ दुई साना चन्द्रमा छन्।',
  },
  {
    id: 'jupiter',
    nameEn: 'Jupiter (बृहस्पति)',
    nameNe: 'बृहस्पति ग्रह (Jupiter)',
    distAu: 5.2,
    orbitRx: 195,
    orbitRy: 115,
    radius: 14,
    speed: 0.084,
    color: '#ea580c',
    periodEn: '11.86 Earth Years',
    periodNe: '११.८६ वर्ष',
    moons: 95,
    factEn: 'Largest planet in our solar system—over 1,300 Earths could fit inside! Features Great Red Spot storm.',
    factNe: 'सौर्यमण्डलको सबैभन्दा ठूलो ग्रह। यस भित्र १,३०० वटा पृथ्वी अटाउन सक्छन्।',
  },
  {
    id: 'saturn',
    nameEn: 'Saturn (शनि)',
    nameNe: 'शनि ग्रह (Saturn)',
    distAu: 9.58,
    orbitRx: 240,
    orbitRy: 140,
    radius: 11,
    speed: 0.034,
    color: '#eab308',
    periodEn: '29.45 Earth Years',
    periodNe: '२९.४५ वर्ष',
    moons: 146,
    factEn: 'Famous for its dazzling system of icy planetary rings. Has density lower than liquid water!',
    factNe: 'बरफ र चट्टानका सुन्दर चक्रहरू (Rings) का लागि प्रख्यात। यसको घनत्व पानी भन्दा पनि कम छ!',
    hasRings: true,
  },
  {
    id: 'uranus',
    nameEn: 'Uranus (युरेनस)',
    nameNe: 'युरेनस / अरुण ग्रह',
    distAu: 19.2,
    orbitRx: 285,
    orbitRy: 165,
    radius: 8,
    speed: 0.012,
    color: '#38bdf8',
    periodEn: '84 Earth Years',
    periodNe: '८४ वर्ष',
    moons: 28,
    factEn: 'Cyan ice giant that rolls around the Sun on its side with a dramatic 98-degree axial tilt.',
    factNe: 'नीलो-हरियो बरफको ग्रह, जुन आफ्नो अक्षमा ९८° ढल्केर कोल्टे परेर सूर्यको परिक्रमण गर्छ।',
  },
  {
    id: 'neptune',
    nameEn: 'Neptune (वरुण)',
    nameNe: 'वरुण ग्रह (Neptune)',
    distAu: 30.1,
    orbitRx: 330,
    orbitRy: 190,
    radius: 8,
    speed: 0.006,
    color: '#3b82f6',
    periodEn: '164.8 Earth Years',
    periodNe: '१६४.८ वर्ष',
    moons: 16,
    factEn: 'Most distant major planet. Deep azure blue ice giant with supersonic winds reaching 2,100 km/h!',
    factNe: 'सूर्यबाट सबैभन्दा टाढाको ग्रह। यहाँ २,१०० कि.मी./घण्टाको तीव्र गतिको आँधी चल्छ।',
  },
];

export const SolarSystemExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Solar system state
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('earth');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentPlanet = PLANETS.find(p => p.id === selectedPlanetId) || PLANETS[2];

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
      if (isPlaying) {
        timeRef.current += 0.01 * speedMultiplier;
      }
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep space backdrop with starfield
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let s = 0; s < 80; s++) {
        const sx = (s * 83 + Math.sin(s) * 35) % w;
        const sy = (s * 97 + Math.cos(s) * 35) % h;
        ctx.fillRect(sx, sy, (s % 2) + 1, (s % 2) + 1);
      }

      const sunX = w * 0.45;
      const sunY = h * 0.5;

      // Draw Orbit Tracks
      if (showOrbits) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        PLANETS.forEach(p => {
          ctx.beginPath();
          ctx.ellipse(sunX, sunY, p.orbitRx, p.orbitRy, 0, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Asteroid belt ring between Mars and Jupiter
        const astRx = (145 + 195) * 0.5;
        const astRy = (85 + 115) * 0.5;
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        for (let a = 0; a < 60; a++) {
          const ang = (a * Math.PI * 2) / 60 + t * 0.1;
          const ax = sunX + Math.cos(ang) * (astRx + Math.sin(a * 4) * 6);
          const ay = sunY + Math.sin(ang) * (astRy + Math.cos(a * 4) * 4);
          ctx.beginPath();
          ctx.arc(ax, ay, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Central Sun with Corona Flare
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 40);
      sunGlow.addColorStop(0, '#ffffff');
      sunGlow.addColorStop(0.2, '#fef08a');
      sunGlow.addColorStop(0.6, '#f59e0b');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Draw all 8 Planets
      PLANETS.forEach(p => {
        const theta = t * p.speed + (p.distAu * 2);
        const px = sunX + Math.cos(theta) * p.orbitRx;
        const py = sunY + Math.sin(theta) * p.orbitRy;

        // Highlight selected planet
        if (p.id === selectedPlanetId) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, p.radius + 6, 0, Math.PI * 2);
          ctx.stroke();

          // Pulsing glow ring
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, p.radius + 12 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Saturn's Rings
        if (p.hasRings) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(px, py, p.radius * 2.2, p.radius * 0.6, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Planet Sphere
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Planet Name Tag
        ctx.fillStyle = p.id === selectedPlanetId ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = p.id === selectedPlanetId ? 'bold 11px sans-serif' : '9px sans-serif';
        ctx.fillText(lang === 'en' ? p.nameEn.split(' ')[0] : p.nameNe.split(' ')[0], px - 10, py + p.radius + 12);
      });

      // Live metrics HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Target Planet:' : 'लक्ष्य ग्रह:'} ${currentPlanet.nameEn}`, 32, 40);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Distance: ${currentPlanet.distAu} AU  |  Moons: ${currentPlanet.moons}`, 32, 62);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Orbital Period:' : 'परिक्रमण समय:'} ${lang === 'en' ? currentPlanet.periodEn : currentPlanet.periodNe}`, 32, 82);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Keplerian Orbit Speed: ${currentPlanet.speed.toFixed(3)} rad/s`, 32, 102);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, speedMultiplier, showOrbits, selectedPlanetId, currentPlanet, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  return (
    <SimulationLayout
      titleEn="Solar System Explorer"
      titleNe="सौर्यमण्डल अन्वेषण"
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
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#030712' }}>
          <canvas
            ref={canvasRef}
            width={720}
            height={520}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Planet Selector Grid */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Orbit size={18} />
              {lang === 'en' ? 'Select Planet to Inspect' : 'अवलोकन गर्न ग्रह छान्नुहोस्'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
              {PLANETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlanetId(p.id);
                    ScienceAudio.playClick();
                    if (!isCompleted) {
                      setIsCompleted(true);
                      setStars(3);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: selectedPlanetId === p.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedPlanetId === p.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: selectedPlanetId === p.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                  <span>{lang === 'en' ? p.nameEn : p.nameNe}</span>
                </button>
              ))}
            </div>

            {/* Orbit Animation Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => {
                  setIsPlaying(p => !p);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '9px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isPlaying ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? (lang === 'en' ? 'Pause' : 'रोक्नुहोस्') : (lang === 'en' ? 'Resume' : 'चालु')}
              </button>

              <button
                onClick={() => {
                  setShowOrbits(o => !o);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '9px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: showOrbits ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                  color: showOrbits ? '#38bdf8' : '#94a3b8',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Orbit size={14} />
                {showOrbits ? (lang === 'en' ? 'Orbits: ON' : 'कक्ष: देखाइएको') : (lang === 'en' ? 'Orbits: OFF' : 'कक्ष: लुकाइएको')}
              </button>
            </div>
          </div>

          {/* Planet Facts Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {currentPlanet.nameEn}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en' ? currentPlanet.factEn : currentPlanet.factNe}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Planetary Family' : '१. खोज: सौर्यमण्डलका सदस्य')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Keplerian Orbits' : '२. अन्वेषण: केप्लरको नियम')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Inner vs Outer' : '३. अवलोकन: भित्री र बाहिरी ग्रह')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Orbital Period' : '४. बुझाइ: परिक्रमण अवधि')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Solar System Quiz' : '५. चुनौती: सौर्यमण्डल प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Our solar system consists of 1 star (the Sun), 8 planets, over 200 moons, and millions of asteroids and comets.'
                  : 'हाम्रो सौर्यमण्डलमा १ तारा (सूर्य), ८ ग्रहहरू, २०० भन्दा बढी उपग्रह (चन्द्रमा), र लाखौं क्षुद्रग्रहहरू छन्।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Notice Kepler’s Law: Planets closest to the Sun (Mercury) orbit blazing fast, while distant Neptune creeps slowly!'
                  : 'केप्लरको नियम हेर्नुहोस्: सूर्यको नजिकको बुध ग्रह निकै तीव्र गतिमा घुम्छ, तर टाढाको वरुण ग्रह निकै सुस्त घुम्छ!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'The 4 inner planets (Mercury to Mars) are rocky terrestrial worlds. The 4 outer planets (Jupiter to Neptune) are massive gas & ice giants.'
                  : 'भित्री ४ ग्रहहरू (बुधदेखि मङ्गलसम्म) कडा चट्टानी हुन्; बाहिरी ४ ग्रहहरू (बृहस्पतिदेखि वरुणसम्म) विशाल ग्यास र बरफका पिण्ड हुन्।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'One year on Neptune takes nearly 165 Earth years because of its colossal orbital circumference!'
                  : 'वरुण ग्रहमा एक वर्ष हुन पृथ्वीको १६५ वर्ष लाग्छ किनभने यसको सूर्य वरिपरिको बाटो निकै विशाल छ!')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Which is the largest planet in our solar system?'
                    : 'हाम्रो सौर्यमण्डलको सबैभन्दा ठूलो ग्रह कुन हो?'}
                </p>
                {[
                  { id: 1, en: 'Jupiter (बृहस्पति)', ne: 'बृहस्पति (Jupiter)' },
                  { id: 2, en: 'Saturn (शनि)', ne: 'शनि (Saturn)' },
                  { id: 3, en: 'Earth (पृथ्वी)', ne: 'पृथ्वी (Earth)' },
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
