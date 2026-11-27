/**
 * SimulationLayout.tsx
 * Universal child-friendly interactive science container for Grade 4 Science simulations
 * Implements 5-stage experiential pedagogy with complete bilingual EN/NE support,
 * flexible prop bridging, responsive viewport scaling, and celebration badges.
 */
import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Award,
  Star,
  Maximize2,
  Minimize2,
  HelpCircle,
  Speech,
  Languages,
} from 'lucide-react';
import { ScienceAudio } from './ScienceAudio';
import { SimulationStage, Language } from './types';

export interface SimulationLayoutProps {
  title?: string;
  titleEn?: string;
  titleNepali?: string;
  titleNe?: string;
  subtitle?: string;
  learningAreaEn?: string;
  learningAreaNe?: string;
  chapterNumber?: number;
  chapter?: number;
  chapterTitle?: string;
  chapterTitleNepali?: string;
  subject?: string;
  grade?: number;
  currentStage?: SimulationStage;
  stage?: SimulationStage;
  onStageChange?: (stage: SimulationStage) => void;
  lang?: Language;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  onLangChange?: (lang: Language) => void;
  onReset?: () => void;
  onBackToLibrary?: () => void;
  currentPromptEn?: string;
  currentPromptNe?: string;
  explanationEn?: string;
  explanationNe?: string;
  stars?: number;
  maxStars?: number;
  isCompleted?: boolean;
  onReplay?: () => void;
  badgeTitleEn?: string;
  badgeTitleNe?: string;
  children: React.ReactNode;
  hintEn?: string;
  hintNe?: string;
}

export const SimulationLayout: React.FC<SimulationLayoutProps> = (props) => {
  // Normalize Props
  const effTitle = props.title || props.titleEn || 'Science Laboratory';
  const effTitleNe = props.titleNepali || props.titleNe || 'विज्ञान प्रयोगशाला';
  const effChapterNum = props.chapterNumber ?? props.chapter ?? 1;
  const effChapterTitle = props.chapterTitle || `Unit ${effChapterNum}: Science & Technology`;
  const effChapterTitleNe = props.chapterTitleNepali || `एकाइ ${effChapterNum}: विज्ञान तथा प्रविधि`;
  const effStage: SimulationStage = props.currentStage || props.stage || 'discover';
  const effLang: Language = props.lang || (props as any).language || 'en';
  const effStars = props.stars ?? 0;
  const effMaxStars = props.maxStars ?? 3;
  const effIsCompleted = props.isCompleted ?? false;
  const effBadgeTitleEn = props.badgeTitleEn || 'Young Scientist';
  const effBadgeTitleNe = props.badgeTitleNe || 'सानो वैज्ञानिक';

  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Fallback pedagogical prompts based on current stage
  const defaultPrompts: Record<SimulationStage, { en: string; ne: string }> = {
    discover: {
      en: 'Observe the interactive 2D simulation and identify the core components.',
      ne: 'यो २डी अन्तरक्रियात्मक सिमुलेसन हेर्नुहोस् र मुख्य भागहरू पहिचान गर्नुहोस्।',
    },
    explore: {
      en: 'Interact with the controls, drag items, and observe the live scientific response.',
      ne: 'नियन्त्रणहरू चलाउनुहोस्, वस्तुहरू सार्नुहोस् र प्रत्यक्ष वैज्ञानिक परिवर्तन हेर्नुहोस्।',
    },
    observe: {
      en: 'Carefully observe the cause and effect taking place in the simulation.',
      ne: 'सिमुलेसनमा भइरहेको कार्य र कारणको ध्यानपूर्वक अवलोकन गर्नुहोस्।',
    },
    understand: {
      en: 'Understand how these natural laws apply to everyday life and the environment.',
      ne: 'यी प्राकृतिक नियमहरू कसरी दैनिक जीवन र वातावरणमा लागू हुन्छन् बुझ्नुहोस्।',
    },
    challenge: {
      en: 'Test your scientific knowledge and solve the interactive challenge to earn 3 stars!',
      ne: 'आफ्नो वैज्ञानिक ज्ञान परीक्षण गर्नुहोस् र ३ तारा जित्न चुनौती पूरा गर्नुहोस्!',
    },
    success: {
      en: 'Congratulations! You have completed the laboratory exploration.',
      ne: 'बधाई छ! तपाईंले प्रयोगशाला अन्वेषण सफलतापूर्वक पूरा गर्नुभएको छ।',
    },
  };

  const effPromptEn = props.currentPromptEn || defaultPrompts[effStage]?.en || defaultPrompts.discover.en;
  const effPromptNe = props.currentPromptNe || defaultPrompts[effStage]?.ne || defaultPrompts.discover.ne;

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    ScienceAudio.setMuted(next);
    if (!next) ScienceAudio.playClick();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLanguageToggle = (targetLang: Language) => {
    ScienceAudio.playClick();
    if (props.onLanguageChange) props.onLanguageChange(targetLang);
    if (props.onLangChange) props.onLangChange(targetLang);
  };

  const handleStageClick = (st: SimulationStage) => {
    ScienceAudio.playClick();
    if (props.onStageChange) props.onStageChange(st);
  };

  const speakCurrent = () => {
    ScienceAudio.playClick();
    const prompt = effLang === 'ne' ? effPromptNe : effPromptEn;
    const expl = (effLang === 'ne' ? props.explanationNe : props.explanationEn) || '';
    ScienceAudio.speak(`${prompt}. ${expl}`, effLang);
  };

  const stages: { key: SimulationStage; labelEn: string; labelNe: string; icon: string }[] = [
    { key: 'discover', labelEn: '1. Discover', labelNe: '१. खोज', icon: '🔍' },
    { key: 'explore', labelEn: '2. Explore', labelNe: '२. अन्वेषण', icon: '🧪' },
    { key: 'observe', labelEn: '3. Observe', labelNe: '३. अवलोकन', icon: '👀' },
    { key: 'understand', labelEn: '4. Understand', labelNe: '४. बुझाइ', icon: '💡' },
    { key: 'challenge', labelEn: '5. Challenge', labelNe: '५. चुनौती', icon: '🎯' },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isFullscreen ? '100vh' : '88vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        color: '#0f172a',
        borderRadius: isFullscreen ? 0 : '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
      }}
    >
      {/* ── TOP UNIFIED HEADER BAR ── */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 30,
        }}
      >
        {/* Left: Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {props.onBackToLibrary && (
            <button
              onClick={() => {
                ScienceAudio.playClick();
                props.onBackToLibrary?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ArrowLeft size={14} />
              <span>{effLang === 'ne' ? 'फर्कनुहोस्' : 'Library'}</span>
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {effLang === 'ne' ? 'कक्षा ४ विज्ञान' : 'Grade 4 Science'}
              </span>
              <h2
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#0f172a',
                  letterSpacing: '-0.2px',
                }}
              >
                {effLang === 'ne' ? effTitleNe : effTitle}{' '}
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
                  ({effLang === 'ne' ? effTitle : effTitleNe})
                </span>
              </h2>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#0284c7', fontWeight: '600' }}>
              {effLang === 'ne' ? effChapterTitleNe : effChapterTitle}
            </p>
          </div>
        </div>

        {/* Right: Stars, Language Switch, Audio, Fullscreen, Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Star Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '20px',
              padding: '4px 10px',
            }}
          >
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#b45309' }}>
              {effStars} / {effMaxStars}
            </span>
          </div>

          {/* Bilingual Switch */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '10px',
              padding: '2px',
              border: '1px solid #cbd5e1',
            }}
          >
            <button
              onClick={() => handleLanguageToggle('en')}
              style={{
                background: effLang === 'en' ? '#0284c7' : 'transparent',
                border: 'none',
                color: effLang === 'en' ? '#ffffff' : '#475569',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageToggle('ne')}
              style={{
                background: effLang === 'ne' ? '#0284c7' : 'transparent',
                border: 'none',
                color: effLang === 'ne' ? '#ffffff' : '#475569',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              नेपाली
            </button>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleMute}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: muted ? '#ef4444' : '#334155',
              padding: '7px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Reset */}
          {props.onReset && (
            <button
              onClick={() => {
                ScienceAudio.playClick();
                props.onReset?.();
              }}
              title={effLang === 'ne' ? 'फेरि सुरु गर्नुहोस्' : 'Reset Experiment'}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '7px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RotateCcw size={16} />
            </button>
          )}

          {/* Hint */}
          {(props.hintEn || props.hintNe) && (
            <button
              onClick={() => {
                ScienceAudio.playPop();
                setShowHint(!showHint);
              }}
              title="Hint"
              style={{
                background: showHint ? '#0284c7' : '#f8fafc',
                border: showHint ? '1px solid #0284c7' : '1px solid #cbd5e1',
                color: showHint ? '#ffffff' : '#334155',
                padding: '7px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HelpCircle size={16} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '7px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* ── INTERACTIVE 5-STAGE TABS BAR ── */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '6px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          zIndex: 25,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginRight: '6px', textTransform: 'uppercase' }}>
          {effLang === 'ne' ? 'चरणहरू:' : 'Stages:'}
        </span>
        {stages.map((st) => {
          const isActive = effStage === st.key;
          return (
            <button
              key={st.key}
              onClick={() => handleStageClick(st.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#f8fafc',
                border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                color: isActive ? '#ffffff' : '#475569',
                boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: isActive ? '800' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <span>{st.icon}</span>
              <span>{effLang === 'ne' ? st.labelNe : st.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ── OPTIONAL HINT BANNER ── */}
      {showHint && (props.hintEn || props.hintNe) && (
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #bfdbfe',
            padding: '10px 18px',
            fontSize: '13px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#d97706" />
            <span>
              <strong>{effLang === 'ne' ? 'सुझाव (Hint):' : 'Hint:'}</strong> {effLang === 'ne' ? props.hintNe : props.hintEn}
            </span>
          </div>
          <button
            onClick={() => setShowHint(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── MAIN EXPERIMENT VIEWPORT ── */}
      <main
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#f8fafc',
        }}
      >
        {props.children}
      </main>

      {/* ── FOOTER GUIDANCE BAR ── */}
      <footer
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '14px',
              flexShrink: 0,
            }}
          >
            💡
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              {effLang === 'ne' ? effPromptNe : effPromptEn}
            </div>
            {(props.explanationEn || props.explanationNe) && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {effLang === 'ne' ? props.explanationNe : props.explanationEn}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={speakCurrent}
            title={effLang === 'ne' ? 'आवाज सुन्नुहोस्' : 'Listen with Voice'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0284c7',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Speech size={14} />
            <span>{effLang === 'ne' ? 'सुन्नुहोस्' : 'Audio Guide'}</span>
          </button>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
            Nepal CDC Curriculum
          </span>
        </div>
      </footer>

      {/* ── CELEBRATION MODAL ON CHALLENGE COMPLETION ── */}
      {effIsCompleted && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              border: '2px solid #f59e0b',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
              }}
            >
              <Award size={40} color="#ffffff" />
            </div>

            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24', margin: '0 0 4px 0' }}>
                {effLang === 'ne' ? 'बधाई छ! उत्कृष्ट काम!' : 'Congratulations! Great Job!'}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
                {effLang === 'ne'
                  ? `तपाईंले सफलतापूर्वक ${effTitleNe} पूरा गर्नुभयो!`
                  : `You successfully completed the ${effTitle} simulation!`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {[...Array(effMaxStars)].map((_, i) => (
                <Star
                  key={i}
                  size={28}
                  color="#f59e0b"
                  fill={i < effStars ? '#f59e0b' : 'transparent'}
                />
              ))}
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '10px 18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                {effLang === 'ne' ? 'प्राप्त ब्याज (Badge Earned)' : 'Badge Earned'}
              </span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginTop: '2px' }}>
                🏆 {effLang === 'ne' ? effBadgeTitleNe : effBadgeTitleEn}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              {props.onReplay && (
                <button
                  onClick={() => {
                    ScienceAudio.playClick();
                    props.onReplay?.();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {effLang === 'ne' ? 'फेरि खेल्नुहोस्' : 'Play Again'}
                </button>
              )}
              {props.onBackToLibrary && (
                <button
                  onClick={() => {
                    ScienceAudio.playClick();
                    props.onBackToLibrary?.();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  {effLang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationLayout;
