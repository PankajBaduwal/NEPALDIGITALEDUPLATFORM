/**
 * SoilPollutionSimulatorSim.tsx
 * Simulation 46: 2D Soil Pollution & Remediation Simulator (माटो प्रदूषण र समाधान)
 * Grade 6 Science • Unit 11: Earth and Space (पृथ्वी र अन्तरिक्ष)
 *
 * Full 2D Interactive Soil Ecology & Pollution Restoration featuring:
 * 1. Pollution Drivers: Excessive chemical pesticides, non-biodegradable plastics, chemical fertilizers
 * 2. Degradation indicators: Microbe loss, earthworm mortality, yellowing stunted crop leaves
 * 3. Eco-Remediation: Vermicomposting (गँड्यौला मल), organic manure, crop rotation nitrogen fixation
 * 4. Real-time vitality gauges: Soil Health (%), Earthworm Count, Soil pH
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { ShieldAlert, Sparkles, Sprout, AlertTriangle, RefreshCw, Bug, CheckCircle2 } from 'lucide-react';

export const SoilPollutionSimulatorSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Ecological States
  const [isPolluted, setIsPolluted] = useState<boolean>(false);
  const [remediationApplied, setRemediationApplied] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // Metrics
  const soilHealth = isPolluted ? (remediationApplied ? 88 : 22) : 92;
  const earthwormCount = isPolluted ? (remediationApplied ? 45 : 0) : 50;
  const soilPh = isPolluted ? (remediationApplied ? 6.8 : 4.2) : 6.5;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Earthworm coordinates
  const earthwormsRef = useRef<Array<{ x: number; y: number; len: number; angle: number }>>([]);

  useEffect(() => {
    const worms: Array<{ x: number; y: number; len: number; angle: number }> = [];
    for (let i = 0; i < 15; i++) {
      worms.push({
        x: 80 + Math.random() * 460,
        y: 260 + Math.random() * 140,
        len: 25 + Math.random() * 15,
        angle: (Math.random() - 0.5) * 0.8,
      });
    }
    earthwormsRef.current = worms;
  }, []);

  // 2D Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
      if (isPolluted && !remediationApplied) {
        skyGrad.addColorStop(0, '#475569');
        skyGrad.addColorStop(1, '#64748b');
      } else {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(1, '#bae6fd');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.4);

      // Agricultural field ground cross-section
      const soilTopY = h * 0.4;
      const soilGrad = ctx.createLinearGradient(0, soilTopY, 0, h);

      if (isPolluted && !remediationApplied) {
        // Toxic degraded soil (Grayish-yellow dry, chemical encrusted)
        soilGrad.addColorStop(0, '#a16207');
        soilGrad.addColorStop(0.3, '#713f12');
        soilGrad.addColorStop(1, '#44403c');
      } else {
        // Healthy rich organic soil
        soilGrad.addColorStop(0, '#15803d'); // grass
        soilGrad.addColorStop(0.06, '#1c1917'); // humus
        soilGrad.addColorStop(0.4, '#451a03'); // loam
        soilGrad.addColorStop(1, '#78350f');
      }

      ctx.fillStyle = soilGrad;
      ctx.fillRect(40, soilTopY, w - 80, h - soilTopY - 30);

      // Surface Crop Plants (Mustard / Maize)
      for (let p = 0; p < 8; p++) {
        const px = 70 + p * 75;
        const py = soilTopY;

        ctx.save();
        ctx.translate(px, py);

        // Plant health based on state
        const isHealthy = !isPolluted || remediationApplied;
        const stemColor = isHealthy ? '#16a34a' : '#ca8a04';
        const leafColor = isHealthy ? '#22c55e' : '#eab308';
        const plantH = isHealthy ? 70 : 40;

        // Stem
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(Math.sin(t * 3 + p) * 4, -plantH * 0.5, 0, -plantH);
        ctx.stroke();

        // Leaves
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.ellipse(-12, -plantH * 0.4, 15, 6, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(12, -plantH * 0.6, 15, 6, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Healthy Yellow Mustard flowers if healthy
        if (isHealthy) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, -plantH - 4, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Roots into soil
        ctx.strokeStyle = isHealthy ? '#fef08a' : '#a8a29e';
        ctx.lineWidth = 1.5;
        const rootDepth = isHealthy ? 55 : 20;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, rootDepth);
        ctx.moveTo(0, 0);
        ctx.lineTo(12, rootDepth * 0.8);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, rootDepth * 1.1);
        ctx.stroke();

        ctx.restore();
      }

      // Earthworms in soil (Alive & wiggling if healthy, dead/absent if polluted)
      if (earthwormCount > 0) {
        earthwormsRef.current.forEach((worm, idx) => {
          ctx.save();
          ctx.translate(worm.x, worm.y);
          ctx.rotate(worm.angle);

          // Wiggling sine curve
          const wiggle = Math.sin(t * 5 + idx) * 3;
          ctx.strokeStyle = '#f43f5e'; // pink earthworm color
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(-worm.len / 2, 0);
          ctx.quadraticCurveTo(0, wiggle, worm.len / 2, 0);
          ctx.stroke();

          ctx.restore();
        });
      }

      // If polluted: show discarded plastic bags, chemical spray droplets, white salt crust
      if (isPolluted && !remediationApplied) {
        // Plastic polythene garbage lodged in soil
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(120, soilTopY + 30);
        ctx.lineTo(150, soilTopY + 45);
        ctx.lineTo(135, soilTopY + 70);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f87171';
        ctx.fillRect(280, soilTopY + 50, 30, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(lang === 'en' ? '⚠ Non-biodegradable Plastic Waste' : '⚠ प्लास्टिक फोहोर', 110, soilTopY + 95);
        ctx.fillText(lang === 'en' ? '⚠ Toxic Chemical Leaching' : '⚠ विषादी र रासायनिक लवण', 280, soilTopY + 95);
      }

      // If remediation applied: show dark rich vermicompost compost additions
      if (remediationApplied) {
        ctx.fillStyle = '#1c1917';
        for (let c = 0; c < 20; c++) {
          const cxPos = 70 + c * 28;
          ctx.beginPath();
          ctx.ellipse(cxPos, soilTopY + 8, 12, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? '🌱 Organic Vermicompost & Earthworms Active!' : '🌱 गँड्यौला मल र प्राङ्गारिक उपचार सफल!', w * 0.5 - 130, soilTopY + 45);
      }

      // Live metrics HUD in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Soil Health Index:' : 'माटोको स्वास्थ्य:'} ${soilHealth}%`, 32, 40);
      ctx.fillText(`${lang === 'en' ? 'Active Earthworms:' : 'गँड्यौला संख्या:'} ${earthwormCount} / plot`, 32, 60);
      ctx.fillText(`${lang === 'en' ? 'Soil pH Level:' : 'माटोको pH:'} ${soilPh} (${soilPh < 5 ? 'Acidic/Toxic' : 'Optimal Neutral'})`, 32, 80);

      ctx.fillStyle = isPolluted && !remediationApplied ? '#ef4444' : '#34d399';
      ctx.font = 'bold 12px sans-serif';
      const statusText = isPolluted && !remediationApplied
        ? (lang === 'en' ? 'STATUS: SEVERELY POLLUTED' : 'अवस्था: गम्भीर प्रदूषित')
        : (lang === 'en' ? 'STATUS: HEALTHY FERTILE' : 'अवस्था: स्वस्थ र उर्वर');
      ctx.fillText(statusText, 32, 102);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPolluted, remediationApplied, soilHealth, earthwormCount, soilPh, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleApplyPollution = () => {
    setIsPolluted(true);
    setRemediationApplied(false);
    ScienceAudio.playWhoosh();
  };

  const handleApplyRemediation = () => {
    setRemediationApplied(true);
    ScienceAudio.playSuccess();
    if (!isCompleted) {
      setIsCompleted(true);
      setStars(3);
    }
  };

  const handleReset = () => {
    setIsPolluted(false);
    setRemediationApplied(false);
    ScienceAudio.playClick();
  };

  return (
    <SimulationLayout
      titleEn="Soil Pollution & Remediation Simulator"
      titleNe="माटो प्रदूषण र समाधान"
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
          {/* Action Modulators */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} />
              {lang === 'en' ? 'Ecological Interventions' : 'वातावरणीय हस्तक्षेप'}
            </h3>

            {/* Apply Pollution Button */}
            <button
              onClick={handleApplyPollution}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <AlertTriangle size={16} />
              {lang === 'en' ? 'Dump Chemical Fertilizer & Plastic' : 'विषादी, रासायनिक मल र प्लास्टिक हाल्नुहोस्'}
            </button>

            {/* Apply Remediation Button */}
            <button
              onClick={handleApplyRemediation}
              disabled={!isPolluted}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: isPolluted ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(15, 23, 42, 0.5)',
                color: isPolluted ? '#ffffff' : '#64748b',
                fontWeight: 'bold',
                fontSize: '11px',
                cursor: isPolluted ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <Sprout size={16} />
              {lang === 'en' ? 'Apply Vermicompost & Organic Manure' : 'गँड्यौला मल र प्राङ्गारिक उपचार गर्नुहोस्'}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'transparent',
                color: '#64748b',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} />
              {lang === 'en' ? 'Reset to Virgin Pristine Soil' : 'प्राकृतिक अवस्थामा फर्काउनुहोस्'}
            </button>
          </div>

          {/* Educational Concept Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bug size={16} />
              {lang === 'en' ? 'Earthworms: Friends of the Farmer' : 'गँड्यौला: किसानको साथी'}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Earthworms burrow through soil, creating aeration tunnels that let roots breathe and absorb water. They digest organic matter and excrete nutrient-rich vermicast castings. Chemical pesticides kill earthworms, turning soil sterile and hard.'
                : 'गँड्यौलाले माटो खनेर प्वाल बनाउँछन्, जसले गर्दा हावा र पानी जरासम्म सजिलै पुग्छ। तिनले खाएको प्राङ्गारिक वस्तुबाट निस्कने मल (Vermicompost) माटोका लागि अमृत समान हुन्छ। रासायनिक विषादीले गँड्यौला मार्दछ, जसले गर्दा माटो बाँझो र कडा हुन्छ।'}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: What Pollutes Soil?' : '१. खोज: माटो कसरी प्रदूषित हुन्छ?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Impact on Micro-life' : '२. अन्वेषण: सूक्ष्म जीवमा प्रभाव')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Plant Symptoms' : '३. अवलोकन: बिरुवामा देखिने असर')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Organic Remedies' : '४. बुझाइ: जैविक उपचार विधि')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Soil Ecology Quiz' : '५. चुनौती: माटो प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Overuse of synthetic chemical fertilizers destroys natural nitrogen-fixing bacteria and increases toxic soil acidity.'
                  : 'धेरै रासायनिक मलको प्रयोगले प्राकृतिक रूपमा नाइट्रोजन स्थिर गर्ने ब्याक्टेरिया नष्ट गर्छ र माटोलाई अत्यधिक अम्लीय बनाउँछ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Click "Dump Chemical Fertilizer & Plastic". Notice how earthworms die immediately and crop leaves turn yellow and wither.'
                  : '"विषादी र प्लास्टिक हाल्नुहोस्" थिच्नुहोस्। गँड्यौलाहरू नष्ट भएको र बिरुवाका पात पहेंलिएर ओइलाएको हेर्नुहोस्।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Now apply "Vermicompost & Organic Manure". Watch soil health restore to 88% and crops bloom with healthy yellow mustard flowers!'
                  : 'अब "गँड्यौला मल र प्राङ्गारिक उपचार" थिच्नुहोस्। माटोको स्वास्थ्य ८८% मा फर्केको र तोरीका पहेँला फूल फुलेको अवलोकन गर्नुहोस्!')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Traditional Nepalese composting (गोठेमल) maintains biodiversity and keeps soil fertile for generations without toxic chemical runoff.'
                  : 'नेपालको परम्परागत गोठेमल र कम्पोस्टले माटोको जैविक विविधता जोगाउँछ र पुस्तौंसम्म माटोलाई मलिलो बनाइराख्छ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Why are earthworms considered the "Best Friends of Farmers"?'
                    : 'गँड्यौलालाई किन "किसानको सबैभन्दा असल साथी" मानिन्छ?'}
                </p>
                {[
                  { id: 1, en: 'They aerate soil and produce rich vermicompost', ne: 'माटो खुकुलो पार्छन् र मलिलो जैविक मल बनाउँछन्' },
                  { id: 2, en: 'They eat crop leaves', ne: 'बिरुवाका पात खान्छन्' },
                  { id: 3, en: 'They increase toxic chemicals', ne: 'विषादी बढाउँछन्' },
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
