/**
 * BigSmallWorld.tsx
 * Simulation 02: Big and Small World (ठूलो र सानो संसार)
 * Grade 1 • Mathematics • Chapter 1 (आकारप्रकार र स्थान)
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, CheckCircle2, RotateCcw, Trophy, Star } from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface BigSmallWorldProps {
  onBackToLibrary: () => void;
  initialLanguage?: 'ne' | 'en';
}

export const BigSmallWorld: React.FC<BigSmallWorldProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const activities = [
    {
      promptEn: 'Which elephant is BIG in overall size? (ठूलो)',
      promptNe: 'कुन हात्ती आकारमा ठूलो छ? (ठूलो)',
      itemA: { labelEn: 'Mother Elephant', labelNe: 'ठूलो हात्ती', size: 1.5, isBig: true },
      itemB: { labelEn: 'Baby Elephant', labelNe: 'सानो हात्ती', size: 0.7, isBig: false },
      correct: 'A',
      explanationEn: 'The mother elephant has a much bigger body and size.',
      explanationNe: 'सबास! यो हात्तीको शरीर र आकार ठूलो छ।',
    },
    {
      promptEn: 'Which play ball is SMALL? (सानो)',
      promptNe: 'कुन बल सानो छ? (सानो)',
      itemA: { labelEn: 'Large Basketball', labelNe: 'ठूलो बास्केटबल', size: 1.4, isBig: true },
      itemB: { labelEn: 'Small Table Tennis Ball', labelNe: 'सानो टेबल टेनिस बल', size: 0.6, isBig: false },
      correct: 'B',
      explanationEn: 'The table tennis ball is small and lightweight.',
      explanationNe: 'टेबल टेनिस बल सानो र हलुका हुन्छ।',
    },
    {
      promptEn: 'Which traditional clay pot (माटोको भाँडो) is BIGGER? (ठूलो)',
      promptNe: 'कुन माटोको भाँडो ठूलो छ? (ठूलो)',
      itemA: { labelEn: 'Large Grain Storage Pot', labelNe: 'ठूलो भकारी/घैँटो', size: 1.6, isBig: true },
      itemB: { labelEn: 'Small Tea Cup (माटोको कप)', labelNe: 'सानो कप', size: 0.65, isBig: false },
      correct: 'A',
      explanationEn: 'The storage pot is large to hold lots of water or grain.',
      explanationNe: 'पानी वा अन्न राख्ने घैँटो ठूलो हुन्छ।',
    },
    {
      promptEn: 'Which fruit basket is SMALLER? (सानो)',
      promptNe: 'कुन फलफूलको टोकरी सानो छ? (सानो)',
      itemA: { labelEn: 'Big Harvest Basket', labelNe: 'ठूलो डोको', size: 1.5, isBig: true },
      itemB: { labelEn: 'Small Hand Basket', labelNe: 'सानो टोकरी', size: 0.7, isBig: false },
      correct: 'B',
      explanationEn: 'The small basket is easy for a child to carry.',
      explanationNe: 'सानो टोकरी बालबालिकाले सजिलै बोक्न सक्छन्।',
    },
  ];

  const current = activities[stepIdx];

  useEffect(() => {
    if (!isFinished && current) {
      AudioController.speak(lang === 'ne' ? current.promptNe : current.promptEn, lang);
    }
  }, [stepIdx, lang, isFinished]);

  const handleSelect = (choice: 'A' | 'B') => {
    if (choice === current.correct) {
      AudioController.playSuccess();
      setScore((s) => s + 1);
      setFeedback(lang === 'ne' ? current.explanationNe : current.explanationEn);
      setTimeout(() => {
        setFeedback('');
        if (stepIdx < activities.length - 1) {
          setStepIdx((idx) => idx + 1);
        } else {
          setIsFinished(true);
          AudioController.playCelebration();
          api.post('/simulation-activity/simulations/SIM-MATH-G1-CH1-02/progress', {
            gradeLevel: 1,
            subjectCode: 'MATH',
            chapterNumber: 1,
            simulationTitle: 'Big and Small World',
            assessmentScore: score + 1,
            totalQuestions: activities.length,
            percentage: Math.round(((score + 1) / activities.length) * 100),
            isCompleted: true,
          }).catch(() => {});
        }
      }, 1500);
    } else {
      AudioController.playBoop();
      setFeedback(lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्! आकार तुलना गर्नुहोस्।' : 'Try again! Compare their overall physical size.');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '88vh', background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', borderRadius: '16px', color: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBackToLibrary} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          <ArrowLeft size={16} /> {lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
          {lang === 'ne' ? 'ठूलो र सानो संसार (Big & Small World)' : 'Big and Small World'}
        </h2>
        <button onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          {lang === 'ne' ? 'English' : 'नेपाली'}
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!isFinished ? (
          <div style={{ maxWidth: '680px', width: '100%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
            <span style={{ background: '#fef08a', color: '#854d0e', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
              Step {stepIdx + 1} of {activities.length}
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '14px 0 24px 0' }}>
              {lang === 'ne' ? current.promptNe : current.promptEn}
            </h3>

            {/* Visual 3D comparison cards */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div
                onClick={() => handleSelect('A')}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  padding: '24px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  width: '240px',
                  transform: `scale(${current.itemA.size * 0.9})`,
                  transition: 'transform 0.2s',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ fontSize: `${40 * current.itemA.size}px`, marginBottom: '10px' }}>
                  {stepIdx === 0 ? '🐘' : stepIdx === 1 ? '🏀' : stepIdx === 2 ? '🏺' : '🧺'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>
                  {lang === 'ne' ? current.itemA.labelNe : current.itemA.labelEn}
                </div>
              </div>

              <div
                onClick={() => handleSelect('B')}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  padding: '24px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  width: '240px',
                  transform: `scale(${current.itemB.size * 0.9})`,
                  transition: 'transform 0.2s',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ fontSize: `${40 * current.itemB.size}px`, marginBottom: '10px' }}>
                  {stepIdx === 0 ? '🐘' : stepIdx === 1 ? '⚪' : stepIdx === 2 ? '🍶' : '🧺'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>
                  {lang === 'ne' ? current.itemB.labelNe : current.itemB.labelEn}
                </div>
              </div>
            </div>

            {feedback && (
              <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: '700' }}>
                {feedback}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '36px', borderRadius: '20px' }}>
            <Trophy size={50} color="#fcd34d" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>
              {lang === 'ne' ? 'सबास! ठूलो र सानो अभ्यास पूरा भयो!' : 'Great Job! Big & Small Completed!'}
            </h3>
            <p style={{ fontSize: '16px', color: '#d1fae5' }}>
              {lang === 'ne' ? `नतिजा: ${score} / ${activities.length}` : `Score: ${score} / ${activities.length}`}
            </p>
            <button onClick={onBackToLibrary} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '8px', background: '#f59e0b', color: '#000000', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
              {lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

