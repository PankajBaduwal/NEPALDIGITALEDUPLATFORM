/**
 * TallShortAdventure.tsx
 * Simulation 03: Tall and Short Adventure (अग्लो र होचो साहसिक यात्रा)
 * Grade 1 • Mathematics • Chapter 1 (आकारप्रकार र स्थान)
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface TallShortAdventureProps {
  onBackToLibrary: () => void;
  initialLanguage?: 'ne' | 'en';
}

export const TallShortAdventure: React.FC<TallShortAdventureProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const challenges = [
    {
      promptEn: 'Which tree reaches high up into the sky? (अग्लो रूख)',
      promptNe: 'कुन रूख आकाशतर्फ माथिसम्म पुगेको छ? (अग्लो रूख)',
      itemA: { labelEn: 'Tall Himalayan Pine Tree', labelNe: 'अग्लो सल्लाको रूख', height: 260 },
      itemB: { labelEn: 'Short Garden Bush', labelNe: 'होचो फूलको बोट', height: 110 },
      correct: 'A',
      explanationEn: 'The pine tree is tall in vertical height!',
      explanationNe: 'सबास! सल्लाको रूख उचाइमा अग्लो छ!',
    },
    {
      promptEn: 'Which house is SHORTER in vertical height? (होचो घर)',
      promptNe: 'कुन घर उचाइमा होचो छ? (होचो घर)',
      itemA: { labelEn: 'Tall 3-Storey House', labelNe: 'अग्लो तीनतले घर', height: 270 },
      itemB: { labelEn: 'Short 1-Storey Cottage', labelNe: 'होचो एकतले घर', height: 130 },
      correct: 'B',
      explanationEn: 'The one-storey cottage is short.',
      explanationNe: 'सबास! एकतले घर उचाइमा होचो छ।',
    },
    {
      promptEn: 'Between adult father and child, who is TALLER? (अग्लो)',
      promptNe: 'बुबा र सानो बाबुमध्ये को अग्लो हुनुहुन्छ? (अग्लो)',
      itemA: { labelEn: 'Adult Father', labelNe: 'अग्लो बुबा', height: 250 },
      itemB: { labelEn: 'Class 1 Child', labelNe: 'होचो बाबु', height: 140 },
      correct: 'A',
      explanationEn: 'The adult father is tall in height.',
      explanationNe: 'बुबा उचाइमा अग्लो हुनुहुन्छ।',
    },
    {
      promptEn: 'Which flagpole is SHORTER? (होचो झण्डाको स्तम्भ)',
      promptNe: 'कुन झण्डाको पोल होचो छ? (होचो)',
      itemA: { labelEn: 'High School Flagpole', labelNe: 'अग्लो झण्डाको पोल', height: 280 },
      itemB: { labelEn: 'Short Garden Flagpole', labelNe: 'होचो झण्डाको पोल', height: 150 },
      correct: 'B',
      explanationEn: 'The garden flagpole has a lower vertical height.',
      explanationNe: 'बगैँचाको झण्डाको पोल होचो छ।',
    },
  ];

  const current = challenges[stepIdx];

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
        if (stepIdx < challenges.length - 1) {
          setStepIdx((idx) => idx + 1);
        } else {
          setIsFinished(true);
          AudioController.playCelebration();
          api.post('/simulation-activity/simulations/SIM-MATH-G1-CH1-03/progress', {
            gradeLevel: 1,
            subjectCode: 'MATH',
            chapterNumber: 1,
            simulationTitle: 'Tall and Short Adventure',
            assessmentScore: score + 1,
            totalQuestions: challenges.length,
            percentage: Math.round(((score + 1) / challenges.length) * 100),
            isCompleted: true,
          }).catch(() => {});
        }
      }, 1500);
    } else {
      AudioController.playBoop();
      setFeedback(lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्! जमिनबाट ठाडो उचाइ हेर्नुहोस्।' : 'Try again! Compare height from the ground.');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '88vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)', borderRadius: '16px', color: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBackToLibrary} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          <ArrowLeft size={16} /> {lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
          {lang === 'ne' ? 'अग्लो र होचो साहसिक यात्रा' : 'Tall and Short Adventure'}
        </h2>
        <button onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          {lang === 'ne' ? 'English' : 'नेपाली'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!isFinished ? (
          <div style={{ maxWidth: '680px', width: '100%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
            <span style={{ background: '#38bdf8', color: '#0c4a6e', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
              Step {stepIdx + 1} of {challenges.length}
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '14px 0 24px 0' }}>
              {lang === 'ne' ? current.promptNe : current.promptEn}
            </h3>

            {/* Visual Height Comparison with baseline */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '32px', height: '300px', borderBottom: '4px solid #f8fafc', paddingBottom: '8px', marginBottom: '20px' }}>
              <div
                onClick={() => handleSelect('A')}
                style={{
                  width: '180px',
                  height: `${current.itemA.height}px`,
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  transition: 'transform 0.15s',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {stepIdx === 0 ? '🌲' : stepIdx === 1 ? '🏢' : stepIdx === 2 ? '👨' : '🚩'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', padding: '0 10px' }}>
                  {lang === 'ne' ? current.itemA.labelNe : current.itemA.labelEn}
                </div>
              </div>

              <div
                onClick={() => handleSelect('B')}
                style={{
                  width: '180px',
                  height: `${current.itemB.height}px`,
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  transition: 'transform 0.15s',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {stepIdx === 0 ? '🪴' : stepIdx === 1 ? '🏠' : stepIdx === 2 ? '👦' : '🚩'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', padding: '0 10px' }}>
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
              {lang === 'ne' ? 'सबास! अग्लो र होचो अभ्यास पूरा भयो!' : 'Great Job! Tall & Short Completed!'}
            </h3>
            <p style={{ fontSize: '16px', color: '#bae6fd' }}>
              {lang === 'ne' ? `नतिजा: ${score} / ${challenges.length}` : `Score: ${score} / ${challenges.length}`}
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

