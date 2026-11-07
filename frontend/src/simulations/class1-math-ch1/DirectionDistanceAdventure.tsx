/**
 * DirectionDistanceAdventure.tsx
 * Simulation 05: Direction and Distance Adventure (दिशा र दूरी साहसिक यात्रा)
 * Grade 1 • Mathematics • Chapter 1 (दायाँ, बायाँ, अगाडि, बिच, पछाडि, नजिक, टाढा)
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Compass } from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface DirectionDistanceAdventureProps {
  onBackToLibrary: () => void;
  initialLanguage?: 'ne' | 'en';
}

export const DirectionDistanceAdventure: React.FC<DirectionDistanceAdventureProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const missions = [
    {
      category: 'Right & Left (दायाँ र बायाँ)',
      promptEn: 'Which animal is standing on the RIGHT side of the path? (दायाँ)',
      promptNe: 'बाटोको दायाँतर्फ कुन जनावर उभिएको छ? (दायाँ)',
      options: [
        { id: 'R', labelEn: 'Friendly Dog on the Right (दायाँ)', labelNe: 'दायाँतर्फ कुकुर', isCorrect: true, expEn: 'Correct! The dog is on the right side.', expNe: 'सबास! कुकुर दायाँतर्फ छ।' },
        { id: 'L', labelEn: 'Cat on the Left (बायाँ)', labelNe: 'बायाँतर्फ बिरालो', isCorrect: false, expEn: 'The cat is on the left side.', expNe: 'बिरालो बायाँतर्फ छ।' },
      ],
    },
    {
      category: 'Front, Middle & Behind (अगाडि, बिच र पछाडि)',
      promptEn: 'Three animals are walking in a line: Dog (1st), Cat (2nd), Rabbit (3rd). Which animal is in the MIDDLE? (बिच)',
      promptNe: 'तीन जनावरहरू लाइनमा छन्: कुकुर (पहिलो), बिरालो (दोस्रो), खरायो (तेस्रो)। बिचमा कुन जनावर छ? (बिच)',
      options: [
        { id: 'MID', labelEn: 'Cat in the Middle (बिचमा बिरालो)', labelNe: 'बिचमा बिरालो', isCorrect: true, expEn: 'Correct! The cat is in the middle.', expNe: 'सबास! बिरालो बिचमा छ।' },
        { id: 'FRT', labelEn: 'Dog in Front (अगाडि कुकुर)', labelNe: 'अगाडि कुकुर', isCorrect: false, expEn: 'The dog is in front.', expNe: 'कुकुर अगाडि छ।' },
        { id: 'BHD', labelEn: 'Rabbit Behind (पछाडि खरायो)', labelNe: 'पछाडि खरायो', isCorrect: false, expEn: 'The rabbit is behind.', expNe: 'खरायो पछाडि छ।' },
      ],
    },
    {
      category: 'Front, Middle & Behind (अगाडि, बिच र पछाडि)',
      promptEn: 'Which animal is standing at the very BACK / BEHIND? (पछाडि)',
      promptNe: 'सबैभन्दा पछाडि कुन जनावर छ? (पछाडि)',
      options: [
        { id: 'BHD', labelEn: 'Rabbit Behind (खरायो)', labelNe: 'खरायो (पछाडि)', isCorrect: true, expEn: 'Correct! The rabbit is at the back (पछाडि).', expNe: 'सबास! खरायो सबैभन्दा पछाडि छ।' },
        { id: 'FRT', labelEn: 'Dog in Front (कुकुर)', labelNe: 'कुकुर (अगाडि)', isCorrect: false, expEn: 'The dog is in front.', expNe: 'कुकुर अगाडि छ।' },
      ],
    },
    {
      category: 'Near & Far (नजिक र टाढा)',
      promptEn: 'Relative distance: Which object is NEAR to you? (नजिक)',
      promptNe: 'तपाईंको नजिक कुन वस्तु छ? (नजिक)',
      options: [
        { id: 'NR', labelEn: 'Desk right in front of you (नजिकैको डेस्क)', labelNe: 'नजिकैको डेस्क', isCorrect: true, expEn: 'Correct! The desk is right by your hands.', expNe: 'सबास! डेस्क तपाईंकै अगाडि नजिक छ।' },
        { id: 'FR', labelEn: 'Distant Snowy Mountain (टाढाको हिमाल)', labelNe: 'टाढाको हिमाल', isCorrect: false, expEn: 'Mountains are miles away in the distance (टाढा).', expNe: 'हिमाल धेरै टाढा हुन्छ।' },
      ],
    },
  ];

  const current = missions[stepIdx];

  useEffect(() => {
    if (!isFinished && current) {
      AudioController.speak(lang === 'ne' ? current.promptNe : current.promptEn, lang);
    }
  }, [stepIdx, lang, isFinished]);

  const handleSelect = (opt: { isCorrect: boolean; expEn: string; expNe: string }) => {
    if (opt.isCorrect) {
      AudioController.playSuccess();
      setScore((s) => s + 1);
      setFeedback(lang === 'ne' ? opt.expNe : opt.expEn);
      setTimeout(() => {
        setFeedback('');
        if (stepIdx < missions.length - 1) {
          setStepIdx((idx) => idx + 1);
        } else {
          setIsFinished(true);
          AudioController.playCelebration();
          api.post('/simulation-activity/simulations/SIM-MATH-G1-CH1-05/progress', {
            gradeLevel: 1,
            subjectCode: 'MATH',
            chapterNumber: 1,
            simulationTitle: 'Direction and Distance Adventure',
            assessmentScore: score + 1,
            totalQuestions: missions.length,
            percentage: Math.round(((score + 1) / missions.length) * 100),
            isCompleted: true,
          }).catch(() => {});
        }
      }, 1500);
    } else {
      AudioController.playBoop();
      setFeedback(lang === 'ne' ? opt.expNe : opt.expEn);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '88vh', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', borderRadius: '16px', color: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBackToLibrary} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          <ArrowLeft size={16} /> {lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
          {lang === 'ne' ? 'दिशा र दूरी साहसिक यात्रा' : 'Direction and Distance Adventure'}
        </h2>
        <button onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
          {lang === 'ne' ? 'English' : 'नेपाली'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!isFinished ? (
          <div style={{ maxWidth: '680px', width: '100%', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
            <span style={{ background: '#38bdf8', color: '#082f49', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
              {current.category}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '14px 0 24px 0' }}>
              {lang === 'ne' ? current.promptNe : current.promptEn}
            </h3>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {current.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '15px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {lang === 'ne' ? opt.labelNe : opt.labelEn}
                </button>
              ))}
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
              {lang === 'ne' ? 'सबास! दिशा र दूरी अभ्यास पूरा भयो!' : 'Great Job! Direction & Distance Completed!'}
            </h3>
            <p style={{ fontSize: '16px', color: '#93c5fd' }}>
              {lang === 'ne' ? `नतिजा: ${score} / ${missions.length}` : `Score: ${score} / ${missions.length}`}
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

