/**
 * StraightCurvedLineExplorer.tsx (Pure 2D Edition)
 * Simulation 01: Straight and Curved Line Explorer (सीधा र बाङ्गो रेखा चिनौँ)
 * Class 1 • Mathematics • Chapter 2: Lines (रेखाहरू)
 * 100% 2D SVG & Canvas – Zero Three.js/WebGL dependencies.
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

export const StraightCurvedLineExplorer: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH2-01',
    chapter: 2,
    titleNp: 'सीधा र बाङ्गो रेखा चिनौँ',
    titleEn: 'Straight and Curved Lines',
  });

  const [ropePulled, setRopePulled] = useState(false);
  const [activeTab, setActiveTab] = useState<'straight' | 'curved' | 'all'>('all');

  const questions: QuizQuestion[] = [
    {
      np: 'कुनै पनि ठाउँमा नबाङ्गिई जाने रेखालाई के भनिन्छ?',
      en: 'A line that goes from one point to another without bending is…',
      options: [
        { key: 's', label: kit.t('सिधा रेखा', 'Straight Line') },
        { key: 'c', label: kit.t('बाङ्गो रेखा', 'Curved Line') },
      ],
      answer: 's',
    },
    {
      np: 'पहाडको वरिपरि घुम्दै बग्ने नदीले कस्तो रेखा बनाउँछ?',
      en: 'A winding river flowing through hills forms a…',
      options: [
        { key: 'c', label: kit.t('बाङ्गो रेखा', 'Curved Line') },
        { key: 's', label: kit.t('सिधा रेखा', 'Straight Line') },
      ],
      answer: 'c',
    },
    {
      np: 'काठको रुलर (स्केल) को किनारा कस्तो हुन्छ?',
      en: 'The edge of a straight ruler is…',
      options: [
        { key: 's', label: kit.t('सिधा रेखा', 'Straight Line') },
        { key: 'c', label: kit.t('बाङ्गो रेखा', 'Curved Line') },
      ],
      answer: 's',
    },
    {
      np: 'आकाशमा देखिने इन्द्रेणी (Rainbow) कस्तो रेखा हो?',
      en: 'A rainbow in the sky forms a…',
      options: [
        { key: 'c', label: kit.t('बाङ्गो रेखा', 'Curved Line') },
        { key: 's', label: kit.t('सिधा रेखा', 'Straight Line') },
      ],
      answer: 'c',
    },
    {
      np: 'खुकुलो डोरीलाई दुवैतिरबाट कस्दा के बन्छ?',
      en: 'When a loose rope is pulled tight, it becomes…',
      options: [
        { key: 's', label: kit.t('सिधा रेखा', 'Straight Line') },
        { key: 'c', label: kit.t('बाङ्गो रेखा', 'Curved Line') },
      ],
      answer: 's',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        'डोरी तन्काएर हेरौँ र सिधा तथा बाङ्गो रेखा छुट्याऔँ!',
        'Pull the rope and discover straight and curved lines!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setRopePulled(!ropePulled);
              kit.tap();
              if (!ropePulled) {
                kit.say('डोरी कसियो! यो अब सिधा रेखा बन्यो।', 'Rope pulled tight! It is now a straight line.');
                kit.star();
              } else {
                kit.say('डोरी खुकुलो भयो! यो अब बाङ्गो रेखा बन्यो।', 'Rope is loose! It is now a curved line.');
              }
            }}
            style={{
              padding: '10px 24px',
              borderRadius: 14,
              border: 'none',
              background: ropePulled ? '#2563EB' : '#187C68',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {ropePulled
              ? `🔄 ${kit.t('डोरी खुकुलो बनाऊ (बाङ्गो)', 'Make Rope Loose (Curved)')}`
              : `🎯 ${kit.t('डोरी दुवैतिर तन्काऊ (सिधा)', 'Pull Rope Tight (Straight)')}`}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 840, gap: 16 }}>
        {/* Interactive Rope Demonstration Card */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: '24px 28px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 6 }}>
            {kit.t('डोरी अभ्यास • डोरी तन्काउँदा सिधा बन्छ', 'Rope Activity • Pulling turns curves into straight lines')}
          </div>

          <div style={{ fontSize: 20, fontWeight: 900, color: ropePulled ? '#187C68' : '#F59E0B', marginBottom: 16 }}>
            {ropePulled
              ? `✅ ${kit.t('सिधा रेखा (Straight Line)', 'Straight Line (सिधा रेखा)')}`
              : `〰️ ${kit.t('बाङ्गो रेखा (Curved Line)', 'Curved Line (बाङ्गो रेखा)')}`}
          </div>

          <svg width="100%" height="160" viewBox="0 0 600 160" style={{ overflow: 'visible' }}>
            {/* Background guide */}
            <line x1="50" y1="80" x2="550" y2="80" stroke="#F1F5F9" strokeWidth="6" strokeDasharray="6 6" />

            {/* Left Post */}
            <rect x="35" y="30" width="16" height="100" rx="4" fill="#64748B" />
            <circle cx="43" cy="80" r="12" fill="#E2E8F0" stroke="#475569" strokeWidth="3" />

            {/* Right Post */}
            <rect x="549" y="30" width="16" height="100" rx="4" fill="#64748B" />
            <circle cx="557" cy="80" r="12" fill="#E2E8F0" stroke="#475569" strokeWidth="3" />

            {/* Animated Rope */}
            {ropePulled ? (
              <line
                x1="43"
                y1="80"
                x2="557"
                y2="80"
                stroke="#187C68"
                strokeWidth="10"
                strokeLinecap="round"
                style={{ transition: 'all 0.4s ease' }}
              />
            ) : (
              <path
                d="M 43 80 Q 150 145 300 80 T 557 80"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="10"
                strokeLinecap="round"
                style={{ transition: 'all 0.4s ease' }}
              />
            )}

            {/* Pull arrows */}
            <text x="35" y="24" fontSize="18" textAnchor="middle">👈</text>
            <text x="565" y="24" fontSize="18" textAnchor="middle">👉</text>
          </svg>
        </div>

        {/* Real World Line Classification Gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, width: '100%' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #10B981',
              borderRadius: 16,
              padding: '16px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: '#047857', marginBottom: 8 }}>
              📏 {kit.t('सिधा रेखाका उदाहरण (Straight)', 'Straight Line Examples')}
            </div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, fontWeight: 700 }}>
              • {kit.t('रुलर (स्केल) को किनारा', 'Edge of a ruler')}<br />
              • {kit.t('सिधा बिजुलीको पोल', 'Straight utility pole')}<br />
              • {kit.t('घरको सिधा पर्खाल', 'Straight wall edge')}
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #F59E0B',
              borderRadius: 16,
              padding: '16px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: '#B45309', marginBottom: 8 }}>
              🌈 {kit.t('बाङ्गो रेखाका उदाहरण (Curved)', 'Curved Line Examples')}
            </div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, fontWeight: 700 }}>
              • {kit.t('आकाशको इन्द्रेणी', 'Rainbow arch')}<br />
              • {kit.t('घुमाउरो पहाडी बाटो', 'Winding mountain path')}<br />
              • {kit.t('फूलको गोलाकार घेरा', 'Circular flower boundary')}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
