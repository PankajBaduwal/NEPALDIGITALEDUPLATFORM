/**
 * LongShortExplorer.tsx
 * Simulation 04: Long and Short Explorer (लामो र छोटो अन्वेषक)
 * Grade 1 • Mathematics • Chapter 1 (आकारप्रकार र स्थान)
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface LongShortExplorerProps {
  onBackToLibrary: () => void;
  initialLanguage?: 'ne' | 'en';
}

export const LongShortExplorer: React.FC<LongShortExplorerProps> = ({
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
      promptEn: 'Which wooden pencil is LONGER from start to end? (लामो सिसाकलम)',
      promptNe: 'सुरुदेखि अन्त्यसम्म कुन सिसाकलम लामो छ? (लामो सिसाकलम)',
      itemA: { labelEn: 'Long Yellow Pencil', labelNe: 'लामो पहेँलो सिसाकलम', width: '320px' },
      itemB: { labelEn: 'Short Sharpened Pencil', labelNe: 'छोटो सिसाकलम', width: '140px' },
      correct: 'A',
      explanationEn: 'The yellow pencil has a greater length.',
      explanationNe: 'सबास! पहेँलो सिसाकलम लम्बाइमा लामो छ।',
    },
    {
      promptEn: 'Which climbing rope is SHORTER in length? (छोटो डोरी)',
      promptNe: 'कुन डोरी लम्बाइमा छोटो छ? (छोटो डोरी)',
      itemA: { labelEn: 'Long Mountain Rope', labelNe: 'लामो डोरी', width: '340px' },
      itemB: { labelEn: 'Short Jump Rope', labelNe: 'छोटो डोरी', width: '150px' },
      correct: 'B',
      explanationEn: 'The jump rope is shorter.',
      explanationNe: 'सबास! यो डोरी लम्बाइमा छोटो छ।',
    },
    {
      promptEn: 'Which village suspension bridge is LONGER? (लामो झोलुङ्गे पुल)',
      promptNe: 'कुन झोलुङ्गे पुल लामो छ? (लामो पुल)',
      itemA: { labelEn: 'Long River Suspension Bridge', labelNe: 'लामो झोलुङ्गे पुल', width: '360px' },
      itemB: { labelEn: 'Short Stream Wooden Plank', labelNe: 'छोटो काठको साँघु', width: '160px' },
      correct: 'A',
      explanationEn: 'The river bridge stretches across the wide river.',
      explanationNe: 'ठूलो नदी तर्न बनाइएको झोलुङ्गे पुल लामो हुन्छ।',
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
          api.post('/simulation-activity/simulations/SIM-MATH-G1-CH1-04/progress', {
            gradeLevel: 1,
            subjectCode: 'MATH',
            chapterNumber: 1,
            simulationTitle: 'Long and Short Explorer',
            assessmentScore: score + 1,
            totalQuestions: activities.length,
            percentage: Math.round(((score + 1) / activities.length) * 100),
            isCompleted: true,
          }).catch(() => {});
        }
      }, 1500);
    } else {
      AudioController.playBoop();
      setFeedback(lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्! तेर्सो लम्बाइ तुलना गर्नुहोस्।' : 'Try again! Compare horizontal length.');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '88vh', background: 'linear-gradient(135deg, #701a75 0%, #4a044e 100%)', borderRadius: '16px', color: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBackToLibrary} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          <ArrowLeft size={16} /> {lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
          {lang === 'ne' ? 'लामो र छोटो अन्वेषक (Long & Short Explorer)' : 'Long and Short Explorer'}
        </h2>
        <button onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          {lang === 'ne' ? 'English' : 'नेपाली'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!isFinished ? (
          <div style={{ maxWidth: '720px', width: '100%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
            <span style={{ background: '#fbcfe8', color: '#831843', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
              Step {stepIdx + 1} of {activities.length}
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '14px 0 24px 0' }}>
              {lang === 'ne' ? current.promptNe : current.promptEn}
            </h3>

            {/* Horizontal baseline comparisons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '14px', borderLeft: '6px solid #f472b6', marginBottom: '20px' }}>
              <div
                onClick={() => handleSelect('A')}
                style={{
                  width: current.itemA.width,
                  height: '56px',
                  background: '#fef08a',
                  color: '#713f12',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s',
                }}
              >
                ✏️ {lang === 'ne' ? current.itemA.labelNe : current.itemA.labelEn}
              </div>

              <div
                onClick={() => handleSelect('B')}
                style={{
                  width: current.itemB.width,
                  height: '56px',
                  background: '#e2e8f0',
                  color: '#1e293b',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s',
                }}
              >
                ✏️ {lang === 'ne' ? current.itemB.labelNe : current.itemB.labelEn}
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
              {lang === 'ne' ? 'सबास! लामो र छोटो अभ्यास पूरा भयो!' : 'Great Job! Long & Short Completed!'}
            </h3>
            <p style={{ fontSize: '16px', color: '#f5d0fe' }}>
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

