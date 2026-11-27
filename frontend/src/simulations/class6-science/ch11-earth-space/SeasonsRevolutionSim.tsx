/**
 * SeasonsRevolutionSim.tsx
 * Simulation 41: 2D Seasons and Earth's Revolution
 * Grade 6 Science • Unit 11: Earth and Space
 *
 * Full 2D Heliocentric Orbital System featuring:
 * 1. Earth's constant 23.5° Axial Tilt pointing in fixed direction (Polaris)
 * 2. 4 Solstice & Equinox Milestones:
 *    - Summer Solstice (June 21): Northern hemisphere tilted towards Sun (Longest day in Nepal)
 *    - Autumnal Equinox (Sept 23): Equal day and night
 *    - Winter Solstice (Dec 22): Northern hemisphere tilted away (Shortest day in Nepal)
 *    - Spring Equinox (March 21): Equal day and night
 * 3. Real-time Sun ray incidence angle and day/night terminator on globe
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, Globe, Play, Pause, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

interface SeasonMilestone {
  id: string;
  nameEn: string;
  nameNe: string;
  dateEn: string;
  dateNe: string;
  angleRad: number;
  seasonNepalEn: string;
  seasonNepalNe: string;
  descEn: string;
  descNe: string;
}

const MILESTONES: SeasonMilestone[] = [
  {
    id: 'summer_solstice',
    nameEn: 'Summer Solstice',
    nameNe: 'ग्रीष्म संक्रान्ति (Summer Solstice)',
    dateEn: 'June 21',
    dateNe: 'असार 7 गते',
    angleRad: Math.PI / 2,
    seasonNepalEn: 'Summer / Monsoon',
    seasonNepalNe: 'ग्रीष्म / वर्षा ऋतु',
    descEn: 'Northern hemisphere tilts maximum (23.5°) toward the Sun. Longest day and shortest night of the year in Nepal!',
    descNe: 'उत्तरी गोलार्ध सूर्यतिर झुक्ने हुँदा नेपालमा वर्षकै सबैभन्दा लामो दिन र छोटो रात हुन्छ।',
  },
  {
    id: 'autumn_equinox',
    nameEn: 'Autumnal Equinox',
    nameNe: 'शरद् सम्पात (Autumnal Equinox)',
    dateEn: 'September 23',
    dateNe: 'असोज 7 गते',
    angleRad: Math.PI,
    seasonNepalEn: 'Autumn',
    seasonNepalNe: 'शरद् ऋतु (दशैं-तिहारको समय)',
    descEn: 'Sun is directly above the Equator. Day and night are exactly equal (12 hours each) everywhere on Earth.',
    descNe: 'सूर्य ठीक भूमध्यरेखामाथि पर्ने हुँदा पृथ्वीभरि दिन र रात बराबर (12-12 घण्टा) हुन्छन्।',
  },
  {
    id: 'winter_solstice',
    nameEn: 'Winter Solstice',
    nameNe: 'हिउँद संक्रान्ति (Winter Solstice)',
    dateEn: 'December 22',
    dateNe: 'पुस 7 गते',
    angleRad: (Math.PI * 3) / 2,
    seasonNepalEn: 'Winter',
    seasonNepalNe: 'शिशिर ऋतु (जाडो)',
    descEn: 'Northern hemisphere tilts away from Sun. Shortest day and longest, coldest night of the year in Nepal.',
    descNe: 'उत्तरी गोलार्ध सूर्यबाट टाढा झुक्छ; नेपालमा वर्षकै छोटो दिन र लामो चिसो रात हुन्छ।',
  },
  {
    id: 'spring_equinox',
    nameEn: 'Vernal / Spring Equinox',
    nameNe: 'वसन्त सम्पात (Vernal Equinox)',
    dateEn: 'March 21',
    dateNe: 'चैत 7 गते',
    angleRad: 0,
    seasonNepalEn: 'Spring',
    seasonNepalNe: 'वसन्त ऋतु (फूल फुल्ने मौसम)',
    descEn: 'Sun crosses Equator moving North. Days and nights are equal, temperatures turn warm and pleasant in Nepal.',
    descNe: 'सूर्य उत्तरतिर सर्दा भूमध्यरेखामाथि पर्छ; दिन र रात बराबर हुन्छन् र न्यानो मौसम सुरु हुन्छ।',
  },
];

export const SeasonsRevolutionSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Orbital Revolution State
  const [orbitAngle, setOrbitAngle] = useState<number>(Math.PI / 2); // Default to Summer Solstice
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Animation ticker for revolution
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setOrbitAngle(prev => (prev + 0.015) % (Math.PI * 2));
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Find nearest milestone
  const currentMilestone = MILESTONES.reduce((closest, curr) => {
    const diffCurr = Math.abs(curr.angleRad - orbitAngle);
    const diffClosest = Math.abs(closest.angleRad - orbitAngle);
    return diffCurr < diffClosest ? curr : closest;
  }, MILESTONES[0]);

  // 2D Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep space backdrop with starfield
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Distant stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let s = 0; s < 70; s++) {
        const sx = (s * 73 + Math.sin(s) * 30) % w;
        const sy = (s * 97 + Math.cos(s) * 30) % h;
        ctx.fillRect(sx, sy, (s % 2) + 1, (s % 2) + 1);
      }

      const sunX = w * 0.45;
      const sunY = h * 0.5;
      const orbitRx = 230;
      const orbitRy = 140;

      // Elliptical Orbit Track
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(sunX, sunY, orbitRx, orbitRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Milestone Markers on orbit track
      MILESTONES.forEach(m => {
        const mx = sunX + Math.cos(m.angleRad) * orbitRx;
        const my = sunY + Math.sin(m.angleRad) * orbitRy;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(m.dateEn, mx - 15, my + (m.angleRad > Math.PI ? -12 : 20));
      });

      // Central Sun with Corona Glow
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 70);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.2, '#fef08a');
      sunGrad.addColorStop(0.5, '#f59e0b');
      sunGrad.addColorStop(0.8, 'rgba(245, 158, 11, 0.25)');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('SUN', sunX - 22, sunY + 4);

      // Earth Position on Orbit
      const earthX = sunX + Math.cos(orbitAngle) * orbitRx;
      const earthY = sunY + Math.sin(orbitAngle) * orbitRy;
      const earthR = 24;

      // Sunlight Ray Beam connecting Sun to Earth
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(earthX, earthY);
      ctx.stroke();

      // Earth Globe with 23.5° Constant Axial Tilt
      // Fixed tilt angle: 23.5 degrees to the right (~0.41 radians)
      const tiltRad = 23.5 * (Math.PI / 180);

      ctx.save();
      ctx.translate(earthX, earthY);

      // Earth Axis Rod (pointing to Polaris, upper right)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      const axisLen = earthR * 1.6;
      ctx.beginPath();
      ctx.moveTo(-Math.sin(tiltRad) * axisLen, -Math.cos(tiltRad) * axisLen);
      ctx.lineTo(Math.sin(tiltRad) * axisLen, Math.cos(tiltRad) * axisLen);
      ctx.stroke();

      // North Pole Indicator
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('N (23.5°)', -Math.sin(tiltRad) * axisLen - 12, -Math.cos(tiltRad) * axisLen - 4);

      // Earth Globe
      ctx.fillStyle = '#0284c7'; // ocean blue
      ctx.beginPath();
      ctx.arc(0, 0, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Continents
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-4, -6, 12, 0, Math.PI * 2);
      ctx.arc(6, 8, 10, 0, Math.PI * 2);
      ctx.fill();

      // Day & Night Terminator Shadow:
      // The side facing away from the Sun is dark!
      const sunAngleRel = Math.atan2(sunY - earthY, sunX - earthX);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.arc(0, 0, earthR, sunAngleRel + Math.PI / 2, sunAngleRel - Math.PI / 2, true);
      ctx.closePath();
      ctx.fill();

      // Equator Line (perpendicular to tilted axis)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(-Math.cos(tiltRad) * earthR, Math.sin(tiltRad) * earthR);
      ctx.lineTo(Math.cos(tiltRad) * earthR, -Math.sin(tiltRad) * earthR);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // Live metrics HUD in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 280, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Current Orbital Position:' : 'परिक्रमण अवस्था:', 32, 40);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(lang === 'en' ? currentMilestone.nameEn : currentMilestone.nameNe, 32, 60);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Season in Nepal:' : 'नेपालको मौसम:'} ${lang === 'en' ? currentMilestone.seasonNepalEn : currentMilestone.seasonNepalNe}`, 32, 80);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Axial Tilt: 23.5° Const. | Orbit Period: 365.25 Days`, 32, 98);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [orbitAngle, currentMilestone, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const jumpToMilestone = (m: SeasonMilestone) => {
    setOrbitAngle(m.angleRad);
    ScienceAudio.playClick();
    if (!isCompleted) {
      setIsCompleted(true);
      setStars(3);
    }
  };

  return (
    <SimulationLayout
      titleEn="Seasons & Earth's Revolution"
      titleNe="ऋतुहरू र पृथ्वीको परिक्रमण"
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
          {/* Milestone Quick-Jump Buttons */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sun size={18} />
              {lang === 'en' ? 'Solstices & Equinoxes' : 'संक्रान्ति र सम्पात'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {MILESTONES.map(m => (
                <button
                  key={m.id}
                  onClick={() => jumpToMilestone(m)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: currentMilestone.id === m.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: currentMilestone.id === m.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: currentMilestone.id === m.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div>{lang === 'en' ? m.nameEn : m.nameNe}</div>
                    <div style={{ fontSize: '9px', color: '#f59e0b', marginTop: '2px' }}>
                      {lang === 'en' ? m.dateEn : m.dateNe} • {lang === 'en' ? m.seasonNepalEn : m.seasonNepalNe}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Play & Reset Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsPlaying(p => !p);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
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
                {isPlaying
                  ? (lang === 'en' ? 'Pause Orbit' : 'रोक्नुहोस्')
                  : (lang === 'en' ? 'Revolve Orbit' : 'परिक्रमण सुरु')}
              </button>

              <button
                onClick={() => {
                  setOrbitAngle(Math.PI / 2);
                  setIsPlaying(false);
                  ScienceAudio.playWhoosh();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={14} />
                {lang === 'en' ? 'Reset June 21' : 'असार 7 मा फर्कनुहोस्'}
              </button>
            </div>
          </div>

          {/* Description Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? currentMilestone.nameEn : currentMilestone.nameNe}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en' ? currentMilestone.descEn : currentMilestone.descNe}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Why Do Seasons Occur?' : '1. खोज: ऋतुहरू किन परिवर्तन हुन्छन्?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: The 23.5° Axial Tilt' : '2. अन्वेषण: 23.5° को झुकाव')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Solstice vs Equinox' : '3. अवलोकन: संक्रान्ति र सम्पात')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Summer in Nepal' : '4. बुझाइ: नेपालको गर्मी र जाडो')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Seasons Quiz' : '5. चुनौती: ऋतु प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Seasons are NOT caused by Earth getting closer or further from the Sun! They occur because of Earth’s tilted axis as it orbits the Sun.'
                  : 'ऋतुहरू पृथ्वी सूर्यको नजिक वा टाढा भएर होइन; पृथ्वी आफ्नो अक्षमा 23.5° ढल्केर सूर्यको परिक्रमण गर्ने हुनाले बदलिन्छन्!')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Earth’s rotational axis is tilted 23.5° and always points towards the same star in space.'
                  : 'पृथ्वीको काल्पनिक अक्ष 23.5° ढल्केको छ र यो अन्तरिक्षमा सधैं ध्रुवतारातर्फ मात्र सोझिएको रहन्छ।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'On June 21, the North Pole tilts towards the Sun, receiving direct concentrated sunlight $\\rightarrow$ Summer in Nepal!'
                  : 'असार 7 (June 21) मा उत्तरी ध्रुव सूर्यतिर ढल्कन्छ र नेपालमा सिधा सूर्यको किरण परेर लामो दिन र गर्मी हुन्छ!')}
                {stage === 'understand' && (lang === 'en'
                  ? 'When it is summer in Nepal (Northern Hemisphere), it is freezing winter in Australia (Southern Hemisphere)!'
                  : 'नेपाल (उत्तरी गोलार्ध) मा गर्मी हुँदा अस्ट्रेलिया (दक्षिणी गोलार्ध) मा कडा जाडो हुन्छ!')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'What is the primary cause of changing seasons on Earth?'
                    : 'पृथ्वीमा ऋतु परिवर्तन हुनुको मुख्य कारण के हो?'}
                </p>
                {[
                  { id: 1, en: '23.5° axial tilt and revolution around the Sun', ne: 'पृथ्वीको 23.5° अक्षीय झुकाव र सूर्यको परिक्रमण' },
                  { id: 2, en: 'Distance from the Sun changing', ne: 'सूर्यबाट पृथ्वीको दुरी घटबढ हुनु' },
                  { id: 3, en: 'Earth rotation on its axis only', ne: 'पृथ्वीको आफ्नै अक्षको दैनिक घुमाइ मात्र' },
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
